import "server-only";
import { randomUUID } from "crypto";
import { and, asc, eq, sql } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { storefrontEvents, webSessions, webVisitors } from "@/db/schema";
import { encryptIp, hashValue, ipExpiryDate, maskIp } from "@/lib/analytics/privacy";

export type AttributionInput = { source?: string; medium?: string; campaign?: string; referrer?: string };
export type VisitInput = AttributionInput & { clientSessionId: string; path?: string; userAgent?: string; ip?: string; countryCode?: string };

const countryNames: Record<string, string> = {
  AU: "Australia", BR: "Brazil", CA: "Canada", CN: "China", DE: "Germany", ES: "Spain", FR: "France", GB: "United Kingdom", IN: "India", IT: "Italy", JP: "Japan", KR: "South Korea", MX: "Mexico", NL: "Netherlands", NZ: "New Zealand", SG: "Singapore", US: "United States",
};

function trimmed(value: string | undefined, maximum: number) {
  const next = value?.trim();
  return next ? next.slice(0, maximum) : undefined;
}

function sourceFromReferrer(value: string | undefined) {
  if (!value) return { source: "direct", medium: "none", host: undefined };
  try {
    const host = new URL(value).hostname.toLowerCase().replace(/^www\./, "");
    if (host.includes("google.")) return { source: "google", medium: "organic", host };
    if (host.includes("facebook.com") || host.includes("fb.com")) return { source: "facebook", medium: "social", host };
    if (host.includes("instagram.com")) return { source: "instagram", medium: "social", host };
    if (host.includes("whatsapp.com") || host.includes("wa.me")) return { source: "whatsapp", medium: "messaging", host };
    if (host.includes("bing.com")) return { source: "bing", medium: "organic", host };
    return { source: "referral", medium: "referral", host };
  } catch {
    return { source: "direct", medium: "none", host: undefined };
  }
}

export function resolveAttribution(input: AttributionInput) {
  const referrer = trimmed(input.referrer, 2000);
  const fallback = sourceFromReferrer(referrer);
  return {
    source: trimmed(input.source, 160)?.toLowerCase() || fallback.source,
    medium: trimmed(input.medium, 160)?.toLowerCase() || fallback.medium,
    campaign: trimmed(input.campaign, 160),
    referrer,
    referrerHost: fallback.host,
  };
}

function deviceFromUserAgent(userAgent: string | undefined) {
  const value = userAgent ?? "";
  const deviceType = /ipad|tablet/i.test(value) ? "tablet" : /mobile|android|iphone/i.test(value) ? "mobile" : "desktop";
  const browser = /edg\//i.test(value) ? "Edge" : /firefox\//i.test(value) ? "Firefox" : /chrome\//i.test(value) ? "Chrome" : /safari\//i.test(value) ? "Safari" : "Other";
  const operatingSystem = /windows/i.test(value) ? "Windows" : /android/i.test(value) ? "Android" : /iphone|ipad|ios/i.test(value) ? "iOS" : /mac os/i.test(value) ? "macOS" : /linux/i.test(value) ? "Linux" : "Other";
  return { deviceType, browser, operatingSystem };
}

export async function ensureVisitContext(input: VisitInput, visitorToken?: string) {
  const now = new Date();
  const safeVisitorToken = visitorToken && /^[a-zA-Z0-9_-]{16,128}$/.test(visitorToken) ? visitorToken : randomUUID().replaceAll("-", "");
  const visitorHash = hashValue(safeVisitorToken);
  const attribution = resolveAttribution(input);
  const countryCode = trimmed(input.countryCode, 8)?.toUpperCase();
  const ipMasked = maskIp(input.ip);
  const ipHash = input.ip ? hashValue(input.ip) : undefined;
  const encryptedIp = encryptIp(input.ip);
  const device = deviceFromUserAgent(input.userAgent);
  const db = getDatabase();

  const context = await db.transaction(async (tx) => {
    const existingSession = (await tx.select().from(webSessions).where(eq(webSessions.clientSessionId, input.clientSessionId)).limit(1))[0];
    if (existingSession) {
      await tx.update(webSessions).set({ exitPath: input.path ?? existingSession.exitPath, lastSeenAt: now, updatedAt: now }).where(eq(webSessions.id, existingSession.id));
      await tx.update(webVisitors).set({ lastSeenAt: now, updatedAt: now }).where(eq(webVisitors.id, existingSession.visitorId));
      return { visitorId: existingSession.visitorId, visitSessionId: existingSession.id, visitNumber: existingSession.visitNumber };
    }

    let visitor = (await tx.select().from(webVisitors).where(eq(webVisitors.visitorHash, visitorHash)).limit(1))[0];
    if (!visitor) {
      visitor = (await tx.insert(webVisitors).values({ visitorHash, visitCount: 0, firstSeenAt: now, lastSeenAt: now, updatedAt: now }).returning())[0];
    }
    const increased = (await tx.update(webVisitors).set({ visitCount: sql`${webVisitors.visitCount} + 1`, lastSeenAt: now, updatedAt: now }).where(eq(webVisitors.id, visitor.id)).returning({ id: webVisitors.id, visitCount: webVisitors.visitCount }))[0];
    const session = (await tx.insert(webSessions).values({
      visitorId: increased.id,
      clientSessionId: input.clientSessionId,
      visitNumber: increased.visitCount,
      entryPath: input.path,
      exitPath: input.path,
      referrer: attribution.referrer,
      referrerHost: attribution.referrerHost,
      source: attribution.source,
      medium: attribution.medium,
      campaign: attribution.campaign,
      countryCode,
      countryName: countryCode ? countryNames[countryCode] ?? countryCode : undefined,
      ipHash,
      ipMasked,
      encryptedIp,
      ipExpiresAt: encryptedIp ? ipExpiryDate(now) : undefined,
      deviceType: device.deviceType,
      browser: device.browser,
      operatingSystem: device.operatingSystem,
      userAgent: trimmed(input.userAgent, 1000),
      startedAt: now,
      lastSeenAt: now,
      updatedAt: now,
    }).returning({ id: webSessions.id }))[0];
    return { visitorId: increased.id, visitSessionId: session.id, visitNumber: increased.visitCount };
  });

  return { ...context, visitorToken: safeVisitorToken, attribution };
}

export async function linkVisitToCustomer(clientSessionId: string | undefined, customerId: string) {
  if (!clientSessionId) return undefined;
  const db = getDatabase();
  const session = (await db.select().from(webSessions).where(eq(webSessions.clientSessionId, clientSessionId)).limit(1))[0];
  if (!session) return undefined;
  await db.update(webVisitors).set({ customerId, updatedAt: new Date() }).where(eq(webVisitors.id, session.visitorId));
  const firstSession = (await db.select().from(webSessions).where(eq(webSessions.visitorId, session.visitorId)).orderBy(asc(webSessions.startedAt)).limit(1))[0];
  return { session, firstSession };
}

export async function purgeExpiredRawIps() {
  const db = getDatabase();
  await db.update(webSessions).set({ encryptedIp: null, ipExpiresAt: null, updatedAt: new Date() }).where(and(sql`${webSessions.ipExpiresAt} is not null`, sql`${webSessions.ipExpiresAt} < now()`));
}

export async function createTrackedEvent(input: { eventId: string; eventName: string; clientSessionId: string; path?: string; productId?: string; orderId?: string; metadata?: Record<string, unknown> } & VisitInput, visitorToken?: string) {
  const context = await ensureVisitContext(input, visitorToken);
  await getDatabase().insert(storefrontEvents).values({
    eventId: input.eventId,
    eventName: input.eventName,
    sessionId: input.clientSessionId,
    visitorId: context.visitorId,
    visitSessionId: context.visitSessionId,
    productId: input.productId,
    orderId: input.orderId,
    path: input.path,
    referrer: context.attribution.referrer,
    source: context.attribution.source,
    medium: context.attribution.medium,
    campaign: context.attribution.campaign,
    metadata: input.metadata ?? {},
  }).onConflictDoNothing();
  return context;
}
