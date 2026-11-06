"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { isLocale } from "@/lib/i18n";
import { messages } from "@/messages";
import { storefrontLabels } from "@/messages/storefront";
import styles from "./storefront-design.module.css";

export function StorefrontNotFound() {
  const segment = usePathname().split("/")[1];
  const locale = isLocale(segment) ? segment : "en";
  const t = messages[locale];
  const ui = storefrontLabels(locale);

  return <section className={styles.statusPage} lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
    <div>
      <p className={styles.kicker}>404 / COWIN</p>
      <h1 className="mt-3">{ui.notFound}</h1>
      <p className="mt-4">{ui.notFoundCopy}</p>
      <div className={styles.statusActions}>
        <Link className="button-primary" href={`/${locale}/shop`}>{t.nav.shop}</Link>
        <Link className="button-secondary" href={`/${locale}/search`}><Search size={17} aria-hidden="true" />{t.nav.search}</Link>
      </div>
    </div>
  </section>;
}
