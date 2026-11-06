"use client";

import type { Locale } from "@/lib/i18n";
import styles from "@/components/layout/storefront-design.module.css";
import { useSyncExternalStore } from "react";
import { clearStorefrontAnalytics, trackStorefrontEvent } from "@/components/analytics/storefront-tracker";

const copy = {
  en: [
    "Privacy choices",
    "Allow optional analytics to help us improve shopping. Optional; we do not sell personal data.",
    "Allow",
    "No thanks",
  ],
  ar: [
    "خيارات الخصوصية",
    "اسمح بتحليلات اختيارية لتحسين التسوق. اختيارية ولا نبيع البيانات الشخصية.",
    "سماح",
    "لا، شكراً",
  ],
  es: [
    "Opciones de privacidad",
    "Permite análisis opcionales para mejorar la tienda. Es opcional y no vendemos datos personales.",
    "Permitir",
    "No, gracias",
  ],
  pt: [
    "Opções de privacidade",
    "Permita análises opcionais para melhorar a loja. É opcional e não vendemos dados pessoais.",
    "Permitir",
    "Não, obrigado",
  ],
  ja: [
    "プライバシー設定",
    "任意の分析を許可するとお買い物体験の改善に役立ちます。任意で、個人データは販売しません。",
    "許可",
    "許可しない",
  ],
  ko: [
    "개인정보 선택",
    "선택적 분석을 허용하면 쇼핑 개선에 도움이 됩니다. 선택 사항이며 개인정보를 판매하지 않습니다.",
    "허용",
    "괜찮습니다",
  ],
} as const;

const consentKey = "cowin-analytics-consent";
const consentEvent = "cowin-analytics-consent-change";
let preferencesOpen = false;

export function AnalyticsPreferences({ locale }: { locale: Locale }) {
  return <button type="button" onClick={() => {
    preferencesOpen = true;
    window.dispatchEvent(new Event(consentEvent));
  }} className="mt-3 text-start text-xs underline underline-offset-4">{copy[locale][0]}</button>;
}

export function AnalyticsConsent({ locale }: { locale: Locale }) {
  const visible = useSyncExternalStore(
    (notify) => {
      window.addEventListener(consentEvent, notify);
      return () =>
        window.removeEventListener(consentEvent, notify);
    },
    () => {
      try { return preferencesOpen || window.localStorage.getItem(consentKey) === null; }
      catch { return false; }
    },
    () => false,
  );
  function setConsent(value: "granted" | "denied") {
    try {
      window.localStorage.setItem(consentKey, value);
    } catch {
      return;
    }
    preferencesOpen = false;
    if (value === "denied") {
      window.fbq?.("consent", "revoke");
      clearStorefrontAnalytics();
    } else {
      window.fbq?.("consent", "grant");
    }
    window.dispatchEvent(new Event(consentEvent));
  }
  const t = copy[locale];
  if (!visible) return null;
  return (
    <aside
      role="dialog"
      aria-label={t[0]}
      className={`${styles.storeConsent} fixed inset-x-2 bottom-2 z-50 mx-auto max-w-xl rounded-2xl border border-white/20 bg-[#17231c]/[.98] p-3 text-white shadow-2xl backdrop-blur sm:inset-x-auto sm:bottom-3 sm:left-1/2 sm:w-[min(24rem,calc(100vw-2rem))] sm:p-3.5 sm:-translate-x-1/2`}
    >
      <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:gap-2.5">
        <div>
          <p className="text-sm font-bold">{t[0]}</p>
          <p className="mt-1 max-w-[19rem] text-[11px] leading-4 text-white/75 sm:max-w-none sm:text-xs">{t[1]}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => {
              setConsent("granted");
              trackStorefrontEvent("page_view", { consent: "granted" });
            }}
            className="rounded-lg bg-[var(--lime)] px-3 py-2 text-xs font-bold text-black"
          >
            {t[2]}
          </button>
          <button
            type="button"
            onClick={() => setConsent("denied")}
            className="rounded-lg border border-white/35 px-3 py-2 text-xs font-bold"
          >
            {t[3]}
          </button>
        </div>
      </div>
    </aside>
  );
}
