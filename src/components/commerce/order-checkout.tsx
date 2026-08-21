"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, CreditCard, FileText, ShieldCheck, Truck } from "lucide-react";
import { useState } from "react";
import { getProduct } from "@/data/fixtures/products";
import type { Locale } from "@/lib/i18n";

const g200 = getProduct("g200-sport-audio-glasses");

export function OrderCheckout({ locale }: { locale: Locale }) {
  const [shipping, setShipping] = useState<"quote" | "forwarder">("quote");
  const [payment, setPayment] = useState<"card" | "transfer">("card");

  if (!g200) return null;

  return (
    <main className="bg-[#f3f6f4]">
      <section className="shell grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_390px] lg:py-16">
        <div>
          <p className="eyebrow">Order checkout</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-.06em] md:text-5xl">Request your G200 order.</h1>
          <p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">
            Share delivery and payment preferences with sales. Final stock, shipping and payment instructions are confirmed before any charge.
          </p>

          <section className="mt-10">
            <h2 className="text-2xl font-black tracking-[-.04em]">Contact</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Email or mobile number" full />
              <Field label="First name" />
              <Field label="Last name" />
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-black tracking-[-.04em]">Delivery</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <SelectField label="Country / region" full />
              <Field label="Address" full />
              <Field label="City" />
              <Field label="State / province" />
              <Field label="ZIP / postal code" />
              <Field label="Phone / WhatsApp" />
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-black tracking-[-.04em]">Shipping method</h2>
            <div className="mt-4 grid gap-3">
              <Option checked={shipping === "quote"} onChange={() => setShipping("quote")} title="Standard sea / air freight quotation" description="Sales confirms destination-based freight, taxes and delivery timing." price="Quote" />
              <Option checked={shipping === "forwarder"} onChange={() => setShipping("forwarder")} title="Buyer forwarder pickup" description="Use your nominated forwarder for factory pickup or export handoff." price="Quote" />
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-black tracking-[-.04em]">Payment preference</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">No card data is collected on this page.</p>
            <div className="mt-4 grid gap-3">
              <Option checked={payment === "card"} onChange={() => setPayment("card")} title="Credit card" description="A secure provider-hosted card link is sent only after sales confirms the order." price="Available after confirmation" icon={<CreditCard size={20} />} />
              <Option checked={payment === "transfer"} onChange={() => setPayment("transfer")} title="Bank transfer / T/T" description="Request a proforma invoice and verified bank details from sales." price="Invoice" icon={<FileText size={20} />} />
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-black tracking-[-.04em]">Order notes</h2>
            <textarea className="mt-4 min-h-32 w-full rounded-2xl border border-[var(--line)] bg-white p-4 outline-none ring-[var(--lime)] focus:ring-2" placeholder="Quantity, delivery plan, color, accessories or customization requirements." />
          </section>
        </div>

        <aside className="h-fit rounded-3xl border border-white bg-white p-6 shadow-[0_18px_45px_rgba(22,35,29,.08)] lg:sticky lg:top-24">
          <div className="flex gap-4">
            <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[#eff2ee]">
              <Image src={g200.heroImage} alt={g200.name.en} width={160} height={160} className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#6b7e0d]">Sport audio glasses</p>
              <h2 className="mt-1 font-black">{g200.name.en}</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">Blue mirror lens · 1 unit</p>
            </div>
          </div>

          <div className="mt-7 flex items-baseline justify-between border-b border-[var(--line)] pb-5">
            <span className="font-bold">Launch price</span>
            <p><span className="mr-2 text-sm text-[var(--muted)] line-through">USD {formatUsd(g200.compareAtUsdPrice)}</span><strong>USD {formatUsd(g200.usdPrice)}</strong></p>
          </div>
          <div className="flex justify-between border-b border-[var(--line)] py-5 text-sm">
            <span>Shipping</span>
            <strong>{shipping === "quote" ? "Quoted by destination" : "Buyer forwarder"}</strong>
          </div>
          <div className="flex justify-between py-5 text-lg font-black">
            <span>Product subtotal</span>
            <span>USD {formatUsd(g200.usdPrice)}</span>
          </div>

          <Link href={`/${locale}/support/contact?product=g200-sport-audio-glasses&source=checkout`} className="button-primary w-full">
            Request order / Contact sales
          </Link>
          <p className="mt-4 text-xs leading-5 text-[var(--muted)]">Submitting an inquiry does not create an order or charge a payment method.</p>
          <div className="mt-6 grid gap-3 border-t border-[var(--line)] pt-5 text-sm">
            <p className="flex gap-2"><Truck size={17} className="shrink-0" />Shipping is confirmed by destination and quantity.</p>
            <p className="flex gap-2"><ShieldCheck size={17} className="shrink-0" />Payment uses a secure hosted provider page after sales confirmation.</p>
            <p className="flex gap-2"><CheckCircle2 size={17} className="shrink-0" />No card number or payment information is captured here.</p>
          </div>
        </aside>
      </section>
    </main>
  );
}

function formatUsd(value: number) { return value.toFixed(2).replace(/\.00$/, ""); }

function Field({ label, full = false }: { label: string; full?: boolean }) {
  return <label className={full ? "grid gap-2 sm:col-span-2" : "grid gap-2"}><span className="text-sm font-bold">{label}</span><input className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 outline-none ring-[var(--lime)] focus:ring-2" /></label>;
}

function SelectField({ label, full = false }: { label: string; full?: boolean }) {
  return <label className={full ? "grid gap-2 sm:col-span-2" : "grid gap-2"}><span className="text-sm font-bold">{label}</span><select className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 outline-none ring-[var(--lime)] focus:ring-2" defaultValue=""><option value="" disabled>Choose destination country</option><option>United States</option><option>United Kingdom</option><option>Germany</option><option>Australia</option><option>Other</option></select></label>;
}

function Option({ checked, onChange, title, description, price, icon }: { checked: boolean; onChange: () => void; title: string; description: string; price: string; icon?: React.ReactNode }) {
  return <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[var(--line)] bg-white p-5 transition hover:border-[var(--ink)]"><input type="radio" checked={checked} onChange={onChange} className="mt-1 h-4 w-4 accent-[#6b7e0d]" /><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center justify-between gap-2"><span className="flex items-center gap-2 font-black">{icon}{title}</span><strong className="text-sm">{price}</strong></span><span className="mt-1 block text-sm leading-6 text-[var(--muted)]">{description}</span></span></label>;
}
