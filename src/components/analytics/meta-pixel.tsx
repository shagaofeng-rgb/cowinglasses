"use client";

import Script from "next/script";
import { useSyncExternalStore } from "react";

type MetaPixelEvent =
  | "ViewContent"
  | "InitiateCheckout"
  | "AddPaymentInfo"
  | "Purchase";

type MetaPixelParameters = Record<string, unknown>;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const consentKey = "cowin-analytics-consent";
const readyEvent = "cowin-meta-pixel-ready";

function hasConsent() {
  return window.localStorage.getItem(consentKey) === "granted";
}

export function trackMetaPixel(
  event: MetaPixelEvent,
  parameters: MetaPixelParameters = {},
  dedupeKey?: string,
) {
  if (typeof window === "undefined") return;

  const dispatch = () => {
    if (!hasConsent()) return;
    if (dedupeKey && window.sessionStorage.getItem(dedupeKey)) return;
    if (typeof window.fbq !== "function") {
      window.addEventListener(readyEvent, dispatch, { once: true });
      return;
    }
    window.fbq("track", event, parameters);
    if (dedupeKey) window.sessionStorage.setItem(dedupeKey, "1");
  };

  if (!hasConsent()) {
    window.addEventListener(
      "cowin-analytics-consent-change",
      () => dispatch(),
      { once: true },
    );
    return;
  }
  dispatch();
}

export function ConsentAwareMetaPixel() {
  const enabled = useSyncExternalStore(
    (notify) => {
      window.addEventListener("cowin-analytics-consent-change", notify);
      return () =>
        window.removeEventListener("cowin-analytics-consent-change", notify);
    },
    () => hasConsent(),
    () => false,
  );
  if (!enabled) return null;
  return (
    <Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','955166104308526');fbq('track','PageView');window.dispatchEvent(new Event('cowin-meta-pixel-ready'));`}</Script>
  );
}
