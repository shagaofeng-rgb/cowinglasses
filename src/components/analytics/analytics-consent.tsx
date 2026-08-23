"use client";

import { useSyncExternalStore } from "react";
import { trackStorefrontEvent } from "@/components/analytics/storefront-tracker";

export function AnalyticsConsent() {
  const visible = useSyncExternalStore(
    (notify) => { window.addEventListener("cowin-analytics-consent-change", notify); return () => window.removeEventListener("cowin-analytics-consent-change", notify); },
    () => window.localStorage.getItem("cowin-analytics-consent") === null,
    () => false,
  );
  function setConsent(value: "granted" | "denied") { window.localStorage.setItem("cowin-analytics-consent", value); window.dispatchEvent(new Event("cowin-analytics-consent-change")); }
  if (!visible) return null;
  return <aside role="dialog" aria-label="Analytics cookie choice" className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl rounded-2xl border border-white/20 bg-[#17231c] p-5 text-white shadow-2xl sm:left-auto"><p className="font-bold">Privacy and analytics</p><p className="mt-2 text-sm leading-6 text-white/75">With your permission, we use first-party analytics to understand visits, product interest and checkout performance. We do not sell personal data. You can continue without analytics.</p><div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={() => { setConsent("granted"); trackStorefrontEvent("page_view", { consent: "granted" }); }} className="rounded-xl bg-[var(--lime)] px-4 py-2.5 text-sm font-bold text-black">Accept analytics</button><button type="button" onClick={() => setConsent("denied")} className="rounded-xl border border-white/35 px-4 py-2.5 text-sm font-bold">Continue without analytics</button></div></aside>;
}
