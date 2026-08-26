"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { OceanpaymentEmbed, type OceanpaymentSession } from "@/components/commerce/oceanpayment-embed";

export function PaymentVerification({ locale }: { locale: string }) {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [session, setSession] = useState<OceanpaymentSession | null>(null);
  const [environment, setEnvironment] = useState<"test" | "production">("test");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const returned = params.get("payment_return");

  async function prepare(formData: FormData) {
    setSubmitting(true); setMessage("");
    try {
      const response = await fetch("/api/payments/oceanpayment/test-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, returnUrl: window.location.origin + `/${locale}/payment-test`, email: String(formData.get("email") || ""), firstName: String(formData.get("firstName") || ""), lastName: String(formData.get("lastName") || ""), country: String(formData.get("country") || ""), state: String(formData.get("state") || ""), city: String(formData.get("city") || ""), address: String(formData.get("address") || ""), postalCode: String(formData.get("postalCode") || "") }) });
      const result = await response.json() as { success: boolean; data?: { payment: OceanpaymentSession; paymentEnvironment: "test" | "production" }; error?: { message?: string } };
      if (!response.ok || !result.success || !result.data) throw new Error(result.error?.message || "Unable to prepare the payment verification order.");
      setSession(result.data.payment); setEnvironment(result.data.paymentEnvironment);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to prepare the payment verification order."); }
    finally { setSubmitting(false); }
  }

  if (!token && !returned) return <main className="bg-[#f3f6f4]"><section className="shell grid min-h-[58dvh] place-items-center py-16 text-center"><div><h1 className="text-4xl font-black tracking-[-.06em]">Private link required.</h1><p className="mt-4 text-[var(--muted)]">This payment verification page is not part of the public store.</p><Link className="button-primary mt-7" href={`/${locale}/shop`}>Return to shop</Link></div></section></main>;
  if (returned) return <main className="bg-[#f3f6f4]"><section className="shell grid min-h-[58dvh] place-items-center py-16 text-center"><div className="max-w-xl rounded-3xl bg-white p-9 text-center shadow-[0_18px_45px_rgba(22,35,29,.08)]"><p className="eyebrow">Payment return received</p><h1 className="mt-3 text-4xl font-black tracking-[-.06em]">Verification is processing.</h1><p className="mt-4 leading-7 text-[var(--muted)]">The USD 2.00 order is marked paid only after Oceanpayment&apos;s verified server notification arrives.</p></div></section></main>;
  return <main className="bg-[#f3f6f4]"><section className="shell max-w-3xl py-12 md:py-20"><p className="eyebrow">Private payment verification</p><h1 className="mt-3 text-4xl font-black tracking-[-.06em] md:text-5xl">USD 2.00 test order.</h1><p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">This private order has no product fulfillment and is only for verifying the Oceanpayment card flow. Use billing details appropriate for the card you test.</p>{!session ? <form action={prepare} className="mt-8 grid gap-4 rounded-3xl bg-white p-6 shadow-[0_18px_45px_rgba(22,35,29,.08)] sm:grid-cols-2"><Field label="Email" name="email" type="email" full/><Field label="First name" name="firstName"/><Field label="Last name" name="lastName"/><Field label="Country code (ISO-2)" name="country" placeholder="US"/><Field label="State / province" name="state"/><Field label="City" name="city"/><Field label="Address" name="address" full/><Field label="Postal code" name="postalCode"/><button disabled={submitting} className="button-primary sm:col-span-2 disabled:opacity-60">{submitting ? "Preparing secure payment…" : "Create USD 2.00 payment"}</button>{message && <p role="alert" className="sm:col-span-2 rounded-xl bg-red-50 p-3 text-sm text-red-800">{message}</p>}</form> : <OceanpaymentEmbed session={session} production={environment === "production"}/>}</section></main>;
}

function Field({ label, name, type = "text", full = false, placeholder }: { label: string; name: string; type?: string; full?: boolean; placeholder?: string }) { return <label className={full ? "grid gap-2 sm:col-span-2" : "grid gap-2"}><span className="text-sm font-bold">{label}</span><input name={name} type={type} required className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 outline-none ring-[var(--lime)] focus:ring-2" placeholder={placeholder}/></label>; }
