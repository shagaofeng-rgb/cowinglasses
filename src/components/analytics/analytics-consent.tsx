"use client";

import { useSyncExternalStore } from "react";
import { trackStorefrontEvent } from "@/components/analytics/storefront-tracker";

const copy = {
  en: [
    "Privacy choices",
    "Allow anonymous analytics to help us improve shopping. Optional; we do not sell personal data.",
    "Allow",
    "No thanks",
  ],
  ar: [
    "خيارات الخصوصية",
    "اسمح بتحليلات مجهولة لتحسين التسوق. اختيارية ولا نبيع البيانات الشخصية.",
    "سماح",
    "لا، شكراً",
  ],
  es: [
    "Opciones de privacidad",
    "Permite análisis anónimos para mejorar la tienda. Es opcional y no vendemos datos personales.",
    "Permitir",
    "No, gracias",
  ],
  pt: [
    "Opções de privacidade",
    "Permita análises anônimas para melhorar a loja. É opcional e não vendemos dados pessoais.",
    "Permitir",
    "Não, obrigado",
  ],
  ja: [
    "プライバシー設定",
    "匿名分析を許可するとお買い物体験の改善に役立ちます。任意で、個人データは販売しません。",
    "許可",
    "許可しない",
  ],
  ko: [
    "개인정보 선택",
    "익명 분석을 허용하면 쇼핑 개선에 도움이 됩니다. 선택 사항이며 개인정보를 판매하지 않습니다.",
    "허용",
    "괜찮습니다",
  ],
} as const;

export function AnalyticsConsent() {
  const visible = useSyncExternalStore(
    (notify) => {
      window.addEventListener("cowin-analytics-consent-change", notify);
      return () =>
        window.removeEventListener("cowin-analytics-consent-change", notify);
    },
    () => window.localStorage.getItem("cowin-analytics-consent") === null,
    () => false,
  );
  function setConsent(value: "granted" | "denied") {
    window.localStorage.setItem("cowin-analytics-consent", value);
    window.dispatchEvent(new Event("cowin-analytics-consent-change"));
  }
  const locale =
    typeof window === "undefined"
      ? "en"
      : (window.location.pathname.split("/")[1] as keyof typeof copy);
  const t = copy[locale] ?? copy.en;
  if (!visible) return null;
  return (
    <aside
      role="dialog"
      aria-label={t[0]}
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-2xl border border-white/20 bg-[#17231c]/[.98] p-4 text-white shadow-2xl backdrop-blur sm:inset-x-auto sm:right-4 sm:max-w-md"
    >
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row">
        <div>
          <p className="text-sm font-bold">{t[0]}</p>
          <p className="mt-1 text-xs leading-5 text-white/75">{t[1]}</p>
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
