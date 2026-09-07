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
function saveQueue(queue: QueuedEvent[]) { window.sessionStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-20))); }
async function flushQueue() {
  if (!hasAnalyticsConsent()) return;
  const queue = readQueue();
  if (!queue.length) return;
  const remaining: QueuedEvent[] = [];
  for (const item of queue) {
    try {
      const response = await fetch("/api/storefront/events", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin", keepalive: true, body: JSON.stringify(item) });
      if (!response.ok) remaining.push(item);
    } catch { remaining.push(item); }
  }
  saveQueue(remaining);
}
export function hasAnalyticsConsent() { return typeof window !== "undefined" && window.localStorage.getItem("cowin-analytics-consent") === "granted"; }
export function getStorefrontSessionId() { return typeof window === "undefined" ? undefined : sessionId(); }
export function trackStorefrontEvent(eventName: AnalyticsEventName, metadata: Record<string, unknown> = {}) {
  if (typeof window === "undefined" || !hasAnalyticsConsent()) return;
  const query = new URLSearchParams(window.location.search);
  const event: QueuedEvent = { eventId: crypto.randomUUID(), eventName, sessionId: sessionId(), path: window.location.pathname, referrer: document.referrer || undefined, source: query.get("utm_source") ?? undefined, medium: query.get("utm_medium") ?? undefined, campaign: query.get("utm_campaign") ?? undefined, utmContent: query.get("utm_content") ?? undefined, utmTerm: query.get("utm_term") ?? undefined, metadata };
  saveQueue([...readQueue(), event]);
  void flushQueue();
}
export function StorefrontTracker() {
  const pathname = usePathname(); const searchParams = useSearchParams();
  useEffect(() => { trackStorefrontEvent("page_view"); void flushQueue(); }, [pathname, searchParams]);
  useEffect(() => {
    const startedAt = Date.now(); const reached = new Set<number>();
    const onScroll = () => { const maximum = document.documentElement.scrollHeight - window.innerHeight; const percent = maximum > 0 ? Math.round(window.scrollY / maximum * 100) : 100; for (const threshold of [50, 90]) if (percent >= threshold && !reached.has(threshold)) { reached.add(threshold); trackStorefrontEvent("scroll_depth", { percent: threshold }); } };
    const onPageHide = () => { trackStorefrontEvent("engagement", { seconds: Math.max(1, Math.round((Date.now() - startedAt) / 1_000)) }); void flushQueue(); };
    window.addEventListener("scroll", onScroll, { passive: true }); window.addEventListener("pagehide", onPageHide);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("pagehide", onPageHide); };
  }, [pathname]);
  return null;
}
