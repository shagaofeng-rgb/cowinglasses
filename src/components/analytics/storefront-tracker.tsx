"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
type AnalyticsEventName = "page_view" | "product_view" | "add_to_cart" | "begin_checkout" | "order_created" | "engagement" | "scroll_depth";
type QueuedEvent = { eventId: string; eventName: AnalyticsEventName; sessionId: string; path: string; referrer?: string; source?: string; medium?: string; campaign?: string; utmContent?: string; utmTerm?: string; metadata: Record<string, unknown> };
const SESSION_KEY = "cowin-analytics-session";
const QUEUE_KEY = "cowin-analytics-queue";
const SESSION_TTL = 30 * 60 * 1_000;

function sessionId() {
  const now = Date.now();
  const raw = window.sessionStorage.getItem(SESSION_KEY);
  try {
    const parsed = raw ? JSON.parse(raw) as { id?: string; lastActivity?: number } : undefined;
    if (parsed?.id && parsed.lastActivity && now - parsed.lastActivity < SESSION_TTL) {
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify({ id: parsed.id, lastActivity: now }));
      return parsed.id;
    }
  } catch {
    if (raw && /^[0-9a-f-]{36}$/i.test(raw)) {
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify({ id: raw, lastActivity: now }));
      return raw;
    }
  }
  const id = crypto.randomUUID();
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify({ id, lastActivity: now }));
  return id;
}
function readQueue() { try { return JSON.parse(window.sessionStorage.getItem(QUEUE_KEY) ?? "[]") as QueuedEvent[]; } catch { return []; } }
function saveQueue(queue: QueuedEvent[]) { try { window.sessionStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-20))); } catch { /* Storage denial must not interrupt shopping. */ } }
let flushing = false;
async function flushQueue() {
  if (flushing) return;
  if (!hasAnalyticsConsent()) return;
  document.cookie = "cowin_analytics_consent=granted; Path=/; Max-Age=31536000; SameSite=Lax" +
    (location.protocol === "https:" ? "; Secure" : "");
  const queue = readQueue();
  if (!queue.length) return;
  flushing = true;
  const delivered = new Set<string>();
  try {
  for (const item of queue) {
    if (!hasAnalyticsConsent()) break;
    try {
      const response = await fetch("/api/storefront/events", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin", keepalive: true, body: JSON.stringify(item) });
      if (response.ok) delivered.add(item.eventId);
    } catch { /* Keep failed events queued for retry. */ }
  }
  saveQueue(readQueue().filter((item) => !delivered.has(item.eventId)));
  } finally { flushing = false; }
}
export function clearStorefrontAnalytics() {
  document.cookie = "cowin_analytics_consent=; Path=/; Max-Age=0; SameSite=Lax" +
    (location.protocol === "https:" ? "; Secure" : "");
  try {
    window.sessionStorage.removeItem(SESSION_KEY);
    window.sessionStorage.removeItem(QUEUE_KEY);
  } catch { /* Analytics storage can be disabled. */ }
  void fetch("/api/storefront/events", { method: "DELETE", credentials: "same-origin", keepalive: true }).catch(() => {});
}

export function hasAnalyticsConsent() { try { return typeof window !== "undefined" && window.localStorage.getItem("cowin-analytics-consent") === "granted"; } catch { return false; } }
export function getStorefrontSessionId() { try { return hasAnalyticsConsent() ? sessionId() : undefined; } catch { return undefined; } }
export function trackStorefrontEvent(eventName: AnalyticsEventName, metadata: Record<string, unknown> = {}) {
  if (typeof window === "undefined" || !hasAnalyticsConsent()) return;
  const currentSessionId = getStorefrontSessionId();
  if (!currentSessionId) return;
  const query = new URLSearchParams(window.location.search);
  const event: QueuedEvent = { eventId: crypto.randomUUID(), eventName, sessionId: currentSessionId, path: window.location.pathname, referrer: document.referrer || undefined, source: query.get("utm_source") ?? undefined, medium: query.get("utm_medium") ?? undefined, campaign: query.get("utm_campaign") ?? undefined, utmContent: query.get("utm_content") ?? undefined, utmTerm: query.get("utm_term") ?? undefined, metadata };
  saveQueue([...readQueue(), event]);
  void flushQueue();
}
export function StorefrontTracker() {
  const pathname = usePathname(); const searchParams = useSearchParams();
  useEffect(() => { trackStorefrontEvent("page_view"); void flushQueue(); }, [pathname, searchParams]);
  useEffect(() => {
    const retry = () => { void flushQueue(); };
    const timer = window.setInterval(retry, 15000);
    window.addEventListener("online", retry);
    return () => { window.clearInterval(timer); window.removeEventListener("online", retry); };
  }, []);
  useEffect(() => {
    const startedAt = Date.now(); const reached = new Set<number>();
    const onScroll = () => { const maximum = document.documentElement.scrollHeight - window.innerHeight; const percent = maximum > 0 ? Math.round(window.scrollY / maximum * 100) : 100; for (const threshold of [50, 90]) if (percent >= threshold && !reached.has(threshold)) { reached.add(threshold); trackStorefrontEvent("scroll_depth", { percent: threshold }); } };
    const onPageHide = () => { trackStorefrontEvent("engagement", { seconds: Math.max(1, Math.round((Date.now() - startedAt) / 1_000)) }); void flushQueue(); };
    window.addEventListener("scroll", onScroll, { passive: true }); window.addEventListener("pagehide", onPageHide);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("pagehide", onPageHide); };
  }, [pathname]);
  return null;
}
