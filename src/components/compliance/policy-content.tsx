"use client";

import { useState } from "react";
import { Truck } from "lucide-react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { policyCopy as copy, type PolicyType } from "@/messages/policies";
import { messages } from "@/messages";
import { storefrontLabels } from "@/messages/storefront";
import { businessDetails } from "@/config/business";
import { quoteShipping, shippingDestinations } from "@/config/shipping";
import styles from "@/components/layout/storefront-design.module.css";

function ShippingPicker({ locale, labels }: { locale: Locale; labels?: Record<string, string> }) {
  const t = copy[locale];
  const [destination, setDestination] = useState("");
  const quote = destination ? quoteShipping(destination, 1) : null;
  return <section id="shipping-estimate" className={`${styles.shippingPicker} ${styles.formSurface}`}>
    <div className={styles.panelIcon}><Truck size={20} aria-hidden="true" /></div>
    <h2>{storefrontLabels(locale).shippingEstimate}</h2>
    <label className="grid gap-2 text-sm font-bold">
      {t.destination}
      <select value={destination} onChange={(event) => setDestination(event.target.value)}>
        <option value="">—</option>
        {shippingDestinations.map((item) => <option key={item.id} value={item.id}>{labels?.[item.id] ?? item.label}</option>)}
      </select>
    </label>
    <p aria-live="polite">{quote && (quote.status === "unavailable" ? t.unavailable : <strong dir="ltr">USD {quote.totalUsd.toFixed(2)}</strong>)}</p>
  </section>;
}

export function PolicyContent({ locale, type, destinationLabels }: { locale: Locale; type: PolicyType; destinationLabels?: Record<string, string> }) {
  const t = copy[locale];
  const ui = storefrontLabels(locale);
  const sections = t.sections[type];
  const footer = messages[locale].footer;
  return <div className={styles.policyLayout}>
    <nav className={styles.policyNav} aria-label={ui.contents}>
      <p className={styles.kicker}>{ui.contents}</p>
      {sections.map(([title], index) => <a href={`#policy-${index + 1}`} key={title}>{title}</a>)}
      {type === "shipping" && <a href="#shipping-estimate">{ui.shippingEstimate}</a>}
      {type === "warranty" && <a href="#warranty-request">{footer.contact}</a>}
    </nav>
    <article className={styles.readerArticle}>
      <div className={styles.notice}>{t.review}</div>
      <p className="text-sm">{t.effective} · <time dateTime={businessDetails.effectiveDate}>{businessDetails.effectiveDate}</time></p>
      {sections.map(([title, body], index) => <section key={title} id={`policy-${index + 1}`}>
        <h2>{title}</h2><p>{body}</p>
      </section>)}
      {type === "shipping" && <ShippingPicker locale={locale} labels={destinationLabels} />}
      {type === "terms" && <p>
        <Link href={`/${locale}/support/shipping-delivery`}>{footer.shipping}</Link> ·{" "}
        <Link href={`/${locale}/support/returns-refunds`}>{footer.returns}</Link> ·{" "}
        <Link href={`/${locale}/support/warranty`}>{footer.warranty}</Link>
      </p>}
      {type === "intellectual-property" && <>
        <object data="https://www.9-bill.com/index/legal" aria-label={footer.intellectualProperty} className="block h-20 w-full border border-[var(--line)] bg-white" />
        <p><a href="https://www.9-bill.com/index/legal" target="_blank" rel="noreferrer">{footer.intellectualProperty}<span aria-hidden="true"> ↗</span></a></p>
      </>}
      <p><strong>{t.merchant}</strong> · {businessDetails.legalName}<br/>
        <strong>{t.address}</strong> · {businessDetails.registeredAddress}<br/>
        <strong>{t.contact}</strong> · <a href={`mailto:${businessDetails.supportEmail}`}>{businessDetails.supportEmail}</a></p>
    </article>
  </div>;
}
