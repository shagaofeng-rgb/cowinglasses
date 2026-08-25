"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, CreditCard, FileText, LoaderCircle, ShieldCheck, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { useCart } from "@/providers/cart-provider";
import type { Product } from "@/types/product";
import { getStorefrontSessionId, trackStorefrontEvent } from "@/components/analytics/storefront-tracker";
import { PaymentMethods } from "@/components/compliance/payment-methods";

type CheckoutItem = { product: Product; sku: Product["colors"][number]; quantity: number };
type SubmitState = { type: "idle" } | { type: "error"; message: string } | { type: "success"; orderNumber: string };

export function OrderCheckout({ locale, products }: { locale: Locale; products: Product[] }) {
  const searchParams = useSearchParams();
  const { lines, clear } = useCart();
  const [shipping, setShipping] = useState<"quote" | "forwarder">("quote");
  const [payment, setPayment] = useState<"card" | "transfer">("card");
  const [submitting, setSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>({ type: "idle" });
  const directProduct = products.find((item) => item.slug === searchParams.get("product"));
  const directSku = directProduct?.colors.find((color) => color.id === searchParams.get("color")) ?? directProduct?.colors[0];
  const items = useMemo<CheckoutItem[]>(() => {
    if (directProduct && directSku) return [{ product: directProduct, sku: directSku, quantity: 1 }];
    return lines.flatMap((line) => {
      const product = products.find((item) => item.id === line.productId);
      const sku = product?.colors.find((color) => color.id === line.skuId || color.skuId === line.skuId);
      return product && sku ? [{ product, sku, quantity: line.quantity }] : [];
    });
  }, [directProduct, directSku, lines, products]);
  const subtotal = items.reduce((total, item) => total + item.product.usdPrice * item.quantity, 0);
  useEffect(() => { if (items.length) trackStorefrontEvent("begin_checkout", { itemCount: items.length, subtotal }); }, [items.length, subtotal]);

  async function submitOrder(formData: FormData) {
    if (!items.length) return;
    setSubmitting(true);
    setSubmitState({ type: "idle" });
    try {
      const response = await fetch("/api/storefront/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: items.map((item) => ({ skuId: item.sku.skuId ?? item.sku.id, quantity: item.quantity })),
          customer: { email: String(formData.get("email") ?? ""), firstName: String(formData.get("firstName") ?? ""), lastName: String(formData.get("lastName") ?? ""), phone: String(formData.get("phone") ?? ""), acceptsMarketing: formData.get("marketing") === "on" },
          shippingAddress: { country: String(formData.get("country") ?? ""), address: String(formData.get("address") ?? ""), city: String(formData.get("city") ?? ""), province: String(formData.get("province") ?? ""), postalCode: String(formData.get("postalCode") ?? "") },
          shippingMethod: shipping,
          paymentPreference: payment,
          couponCode: String(formData.get("couponCode") ?? ""),
          analyticsSessionId: getStorefrontSessionId(),
          note: String(formData.get("note") ?? ""),
        }),
      });
      const result = await response.json() as { success: boolean; data?: { orderNumber: string }; error?: { message?: string } };
      if (!response.ok || !result.success || !result.data) throw new Error(result.error?.message ?? "Unable to create your order.");
      trackStorefrontEvent("order_created", { orderNumber: result.data.orderNumber, itemCount: items.length, subtotal });
      if (!directProduct) clear();
      setSubmitState({ type: "success", orderNumber: result.data.orderNumber });
    } catch (error) {
      setSubmitState({ type: "error", message: error instanceof Error ? error.message : "Unable to create your order." });
    } finally { setSubmitting(false); }
  }

  if (!items.length) return <main className="bg-[#f3f6f4]"><section className="shell grid min-h-[58dvh] place-items-center py-16 text-center"><div><h1 className="text-4xl font-black tracking-[-.06em]">Your checkout is empty.</h1><p className="mt-4 text-[var(--muted)]">Choose a product before submitting an order request.</p><Link className="button-primary mt-7" href={`/${locale}/shop`}>Browse products</Link></div></section></main>;
  if (submitState.type === "success") return <main className="bg-[#f3f6f4]"><section className="shell grid min-h-[58dvh] place-items-center py-16 text-center"><div className="max-w-xl rounded-3xl bg-white p-9 shadow-[0_18px_45px_rgba(22,35,29,.08)]"><CheckCircle2 className="mx-auto text-[#7c9400]" size={46}/><p className="eyebrow mt-5">Order request received</p><h1 className="mt-3 text-4xl font-black tracking-[-.06em]">Thank you.</h1><p className="mt-4 leading-7 text-[var(--muted)]">Your request <strong>{submitState.orderNumber}</strong> has been created. Sales will confirm stock, freight and secure payment instructions before any charge.</p><Link className="button-primary mt-7" href={`/${locale}/shop`}>Continue shopping</Link></div></section></main>;

  return <main className="bg-[#f3f6f4]"><form action={submitOrder}><section className="shell grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_390px] lg:py-16"><div><p className="eyebrow">Order checkout</p><h1 className="mt-3 text-4xl font-black tracking-[-.06em] md:text-5xl">Confirm your order.</h1><p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">We confirm stock, international shipping and secure payment instructions before taking any payment.</p><section className="mt-10"><h2 className="text-2xl font-black tracking-[-.04em]">Contact</h2><div className="mt-4 grid gap-3 sm:grid-cols-2"><Field label="Email address" name="email" type="email" full required/><Field label="First name" name="firstName" required/><Field label="Last name" name="lastName" required/><Field label="Phone / WhatsApp" name="phone" full required/><label className="flex items-center gap-3 text-sm sm:col-span-2"><input name="marketing" type="checkbox" className="h-4 w-4 accent-[#6b7e0d]"/>Receive product updates and order follow-up.</label></div></section><section className="mt-10"><h2 className="text-2xl font-black tracking-[-.04em]">Delivery</h2><div className="mt-4 grid gap-3 sm:grid-cols-2"><SelectField label="Country / region" name="country" full required/><Field label="Address" name="address" full required/><Field label="City" name="city" required/><Field label="State / province" name="province"/><Field label="ZIP / postal code" name="postalCode"/></div></section><section className="mt-10"><h2 className="text-2xl font-black tracking-[-.04em]">Shipping method</h2><div className="mt-4 grid gap-3"><Option checked={shipping === "quote"} onChange={() => setShipping("quote")} title="Standard sea / air freight quotation" description="Sales confirms destination-based freight, taxes and delivery timing." price="Quote"/><Option checked={shipping === "forwarder"} onChange={() => setShipping("forwarder")} title="Buyer forwarder pickup" description="Use your nominated forwarder for factory pickup or export handoff." price="Quote"/></div></section><section className="mt-10"><h2 className="text-2xl font-black tracking-[-.04em]">Coupon</h2><p className="mt-2 text-sm leading-6 text-[var(--muted)]">Enter a valid promotion code. Eligibility and discount are verified securely when the order is created.</p><Field label="Coupon code" name="couponCode" full/></section><section className="mt-10"><h2 className="text-2xl font-black tracking-[-.04em]">Payment preference</h2><p className="mt-2 text-sm leading-6 text-[var(--muted)]">No card data is collected on this page.</p><div className="mt-4 grid gap-3"><Option checked={payment === "card"} onChange={() => setPayment("card")} title="Credit card" description="A secure provider-hosted card link is sent only after sales confirms the order." price="Available after confirmation" icon={<CreditCard size={20}/>}/><Option checked={payment === "transfer"} onChange={() => setPayment("transfer")} title="Bank transfer / T/T" description="Request a proforma invoice and verified bank details from sales." price="Invoice" icon={<FileText size={20}/>}/></div><PaymentMethods/></section><section className="mt-10"><h2 className="text-2xl font-black tracking-[-.04em]">Order notes</h2><textarea name="note" className="mt-4 min-h-32 w-full rounded-2xl border border-[var(--line)] bg-white p-4 outline-none ring-[var(--lime)] focus:ring-2" placeholder="Quantity, delivery plan, color, accessories or customization needs."/></section><section className="mt-10 border-t border-[var(--line)] pt-8"><h2 className="text-2xl font-black tracking-[-.04em]">Terms and policies</h2><label className="mt-4 flex items-start gap-3 text-sm leading-6 text-[var(--muted)]"><input name="termsAccepted" type="checkbox" required className="mt-1 h-4 w-4 shrink-0 accent-[#6b7e0d]"/><span>I have reviewed and agree to the <Link className="font-bold underline underline-offset-4" href={`/${locale}/policies/terms`}>Terms of Service</Link>, <Link className="font-bold underline underline-offset-4" href={`/${locale}/policies/privacy`}>Privacy Policy</Link>, <Link className="font-bold underline underline-offset-4" href={`/${locale}/support/shipping-delivery`}>Shipping &amp; Delivery</Link> and <Link className="font-bold underline underline-offset-4" href={`/${locale}/support/returns-refunds`}>Returns &amp; Refunds</Link>.</span></label><object type="text/x-scriptlet" data="https://www.9-bill.com/index/cart" width="100%" height="50" aria-label="Checkout terms notice" className="mt-5 block h-12 rounded-lg border border-[var(--line)] bg-white"><p>Checkout notice unavailable. <a href="https://www.9-bill.com/index/cart" target="_blank" rel="noreferrer">Open the checkout notice</a>.</p></object><a className="mt-3 inline-block text-sm font-bold underline underline-offset-4" href="https://www.9-bill.com/index/cart" target="_blank" rel="noreferrer">Open checkout terms notice</a></section></div><aside className="h-fit rounded-3xl border border-white bg-white p-6 shadow-[0_18px_45px_rgba(22,35,29,.08)] lg:sticky lg:top-24"><p className="text-xs font-bold uppercase tracking-wide text-[#6b7e0d]">Order summary</p><div className="mt-5 grid gap-4">{items.map((item) => <div className="flex gap-4" key={`${item.product.id}-${item.sku.id}`}><div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[#eff2ee]"><Image src={item.sku.images[0] ?? item.product.heroImage} alt={item.product.name.en} width={160} height={160} className="h-full w-full object-contain"/></div><div><h2 className="font-black">{item.product.name.en}</h2><p className="mt-1 text-sm text-[var(--muted)]">{item.sku.name.en} · {item.quantity} unit{item.quantity === 1 ? "" : "s"}</p><p className="mt-2 text-sm font-bold">USD {formatUsd(item.product.usdPrice * item.quantity)}</p></div></div>)}</div><div className="mt-7 flex justify-between border-b border-[var(--line)] py-5 text-sm"><span>Shipping</span><strong>{shipping === "quote" ? "Quoted by destination" : "Buyer forwarder"}</strong></div><div className="flex justify-between py-5 text-lg font-black"><span>Product subtotal</span><span>USD {formatUsd(subtotal)}</span></div>{submitState.type === "error" && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm leading-6 text-red-800">{submitState.message}</p>}<button type="submit" disabled={submitting} className="button-primary flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60">{submitting && <LoaderCircle className="animate-spin" size={18}/>} {submitting ? "Creating order…" : "Submit order request"}</button><p className="mt-4 text-xs leading-5 text-[var(--muted)]">Submitting creates an order request. No card number or payment information is captured here.</p><div className="mt-6 grid gap-3 border-t border-[var(--line)] pt-5 text-sm"><p className="flex gap-2"><Truck size={17} className="shrink-0"/>Shipping is confirmed by destination and quantity.</p><p className="flex gap-2"><ShieldCheck size={17} className="shrink-0"/>Payment uses a secure hosted provider page after sales confirmation.</p><p className="flex gap-2"><CheckCircle2 size={17} className="shrink-0"/>Orders are visible to the sales team immediately.</p></div></aside></section></form></main>;
}

function formatUsd(value: number) { return value.toFixed(2).replace(/\.00$/, ""); }
function Field({ label, name, type = "text", full = false, required = false }: { label: string; name: string; type?: string; full?: boolean; required?: boolean }) { return <label className={full ? "grid gap-2 sm:col-span-2" : "grid gap-2"}><span className="text-sm font-bold">{label}</span><input name={name} type={type} required={required} className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 outline-none ring-[var(--lime)] focus:ring-2"/></label>; }
function SelectField({ label, name, full = false, required = false }: { label: string; name: string; full?: boolean; required?: boolean }) { return <label className={full ? "grid gap-2 sm:col-span-2" : "grid gap-2"}><span className="text-sm font-bold">{label}</span><select name={name} required={required} className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 outline-none ring-[var(--lime)] focus:ring-2" defaultValue=""><option value="" disabled>Choose destination country</option><option>United States</option><option>United Kingdom</option><option>Germany</option><option>Australia</option><option>Other</option></select></label>; }
function Option({ checked, onChange, title, description, price, icon }: { checked: boolean; onChange: () => void; title: string; description: string; price: string; icon?: React.ReactNode }) { return <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[var(--line)] bg-white p-5 transition hover:border-[var(--ink)]"><input type="radio" checked={checked} onChange={onChange} className="mt-1 h-4 w-4 accent-[#6b7e0d]"/><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center justify-between gap-2"><span className="flex items-center gap-2 font-black">{icon}{title}</span><strong className="text-sm">{price}</strong></span><span className="mt-1 block text-sm leading-6 text-[var(--muted)]">{description}</span></span></label>; }
