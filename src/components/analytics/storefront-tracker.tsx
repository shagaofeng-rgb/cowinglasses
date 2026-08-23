"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
function sessionId() { const key = "cowin-analytics-session"; const current = window.sessionStorage.getItem(key); if (current) return current; const next = crypto.randomUUID(); window.sessionStorage.setItem(key, next); return next; }
export function hasAnalyticsConsent() { return typeof window !== "undefined" && window.localStorage.getItem("cowin-analytics-consent") === "granted"; }
export function getStorefrontSessionId() { return typeof window === "undefined" ? undefined : sessionId(); }
export function trackStorefrontEvent(eventName: "page_view" | "product_view" | "add_to_cart" | "begin_checkout" | "order_created", metadata: Record<string, unknown> = {}) { if (typeof window === "undefined" || !hasAnalyticsConsent()) return; const query = new URLSearchParams(window.location.search); void fetch("/api/storefront/events", { method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true, body: JSON.stringify({ eventId: crypto.randomUUID(), eventName, sessionId: sessionId(), path: window.location.pathname, referrer: document.referrer || undefined, source: query.get("utm_source") ?? undefined, medium: query.get("utm_medium") ?? undefined, campaign: query.get("utm_campaign") ?? undefined, metadata }) }).catch(() => undefined); }
export function StorefrontTracker() { const pathname = usePathname(); const searchParams = useSearchParams(); useEffect(() => { trackStorefrontEvent("page_view"); }, [pathname, searchParams]); return null; }
