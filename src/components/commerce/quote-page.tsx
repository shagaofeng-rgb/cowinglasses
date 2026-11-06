"use client";

import Link from "next/link";
import { CheckCircle2, FileText } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { InteriorHead } from "@/components/layout/storefront-ui";
import { localize, type Locale } from "@/lib/i18n";
import { messages } from "@/messages";
import { salesCopy } from "@/messages/sales";
import type { Product } from "@/types/product";
import styles from "@/components/layout/storefront-design.module.css";

export function QuotePage({ locale, products }: { locale: Locale; products: Product[] }) {
  const copy = salesCopy[locale];
  const t = messages[locale];
  const params = useSearchParams();
  const catalogue = products.filter((product) => !product.demo);
  const initial = catalogue.find((product) => product.slug === params.get("product"));
  const [model, setModel] = useState(initial?.slug ?? "");
  const product = catalogue.find((item) => item.slug === model);
  const [color, setColor] = useState(initial?.colors.find((sku) => sku.id === params.get("color"))?.skuId ?? "");
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const inFlight = useRef(false);
  const requestKey = useRef<string>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    setError("");
    try {
      requestKey.current ??= crypto.randomUUID();
      const form = Object.fromEntries(new FormData(event.currentTarget));
      const response = await fetch("/api/storefront/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, locale, requestKey: requestKey.current }),
      });
      const data = await response.json();
      if (!response.ok || !data.reference) {
        setError(response.status === 429 ? copy.slowDown : copy.error);
        return;
      }
      setReference(data.reference);
    } catch {
      setError(copy.error);
    } finally {
      setPending(false);
      inFlight.current = false;
    }
  }

  return <div className={`${styles.page} ${styles.formSurface}`}>
    <InteriorHead eyebrow={copy.business} title={copy.quote} intro={copy.intro} />
    <section className={`shell ${styles.sectionTight}`}>
      {reference ? <div className={styles.emptyState} role="status">
        <CheckCircle2 size={34} aria-hidden="true" />
        <h2 className="text-2xl">{copy.received}</h2>
        <p className="font-mono font-bold" dir="ltr">{reference}</p>
        <p>{copy.followup}</p>
        <Link href={`/${locale}/shop`} className="button-primary">{t.common.continueShopping}</Link>
      </div> : <form onSubmit={submit} onInput={() => { if (!inFlight.current) requestKey.current = null; }}
        className="mx-auto grid max-w-3xl gap-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:grid-cols-2 sm:p-8">
        <label>{copy.model}<select name="model" value={model} onChange={(event) => { setModel(event.target.value); setColor(""); }}>
          <option value="">{copy.anyModel}</option>{catalogue.map((item) => <option key={item.id} value={item.slug}>{localize(item.name, locale)}</option>)}
        </select></label>
        <label>{t.common.chooseColor}<select name="skuId" value={color} onChange={(event) => setColor(event.target.value)}>
          <option value="">{copy.anyColor}</option>{product?.colors.filter((sku) => sku.skuId).map((sku) => <option key={sku.skuId} value={sku.skuId}>{localize(sku.name, locale)}</option>)}
        </select></label>
        <label>{t.common.quantity}<input name="quantity" type="number" min={1} max={100000} defaultValue={1} required /></label>
        <label>{copy.purpose}<select name="purpose" defaultValue="personal">
          <option value="personal">{copy.personal}</option><option value="team">{copy.team}</option><option value="resale">{copy.resale}</option>
        </select></label>
        <label>{copy.name}<input name="name" autoComplete="name" minLength={2} maxLength={160} required /></label>
        <label>{copy.email}<input name="email" type="email" autoComplete="email" maxLength={320} required dir="ltr" /></label>
        <label>{copy.company}<input name="company" autoComplete="organization" maxLength={160} /></label>
        <label>{copy.destination}<input name="destination" autoComplete="country-name" minLength={2} maxLength={120} required /></label>
        <label className="sm:col-span-2">{copy.note}<textarea name="message" rows={4} maxLength={2000} /></label>
        <input name="website" className="hidden" tabIndex={-1} aria-hidden="true" autoComplete="off" />
        <p className="text-sm text-[var(--muted)] sm:col-span-2">{copy.privacy} <Link href={`/${locale}/policies/privacy`} className="underline">{t.footer.privacy}</Link></p>
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800 sm:col-span-2">{error}</p>}
        <button className="button-primary sm:col-span-2" type="submit" disabled={pending}><FileText size={17} aria-hidden="true" />{pending ? copy.sending : copy.quote}</button>
      </form>}
    </section>
  </div>;
}
