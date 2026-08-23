import "server-only";
import { unstable_cache } from "next/cache";
import { and, desc, gte, lte, sql } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { storefrontEvents, webSessions } from "@/db/schema";
import type { DateRange } from "@/lib/admin/date-range";

type Summary = {
  pageViews: number;
  sessions: number;
  visitors: number;
  productViews: number;
  carts: number;
  checkouts: number;
  orders: number;
  paths: { path: string | null; views: number }[];
  countries: { countryCode: string | null; countryName: string | null; sessions: number }[];
};

const loadSummary = unstable_cache(async (from: string, to: string): Promise<Summary> => {
  const db = getDatabase();
  const start = new Date(from);
  const end = new Date(to);
  const [eventMetrics, sessionMetrics, paths, countries] = await Promise.all([
    db.select({
      pageViews: sql<string>`count(*) filter (where ${storefrontEvents.eventName} = 'page_view')`,
      productViews: sql<string>`count(*) filter (where ${storefrontEvents.eventName} = 'product_view')`,
      carts: sql<string>`count(*) filter (where ${storefrontEvents.eventName} = 'add_to_cart')`,
      checkouts: sql<string>`count(*) filter (where ${storefrontEvents.eventName} = 'begin_checkout')`,
      orders: sql<string>`count(*) filter (where ${storefrontEvents.eventName} = 'order_created')`,
    }).from(storefrontEvents).where(and(gte(storefrontEvents.createdAt, start), lte(storefrontEvents.createdAt, end))),
    db.select({ sessions: sql<string>`count(*)`, visitors: sql<string>`count(distinct ${webSessions.visitorId})` }).from(webSessions).where(and(gte(webSessions.startedAt, start), lte(webSessions.startedAt, end))),
    db.select({ path: storefrontEvents.path, views: sql<string>`count(*)` }).from(storefrontEvents).where(and(gte(storefrontEvents.createdAt, start), lte(storefrontEvents.createdAt, end), sql`${storefrontEvents.eventName} = 'page_view'`)).groupBy(storefrontEvents.path).orderBy(desc(sql`count(*)`)).limit(20),
    db.select({ countryCode: webSessions.countryCode, countryName: webSessions.countryName, sessions: sql<string>`count(*)` }).from(webSessions).where(and(gte(webSessions.startedAt, start), lte(webSessions.startedAt, end))).groupBy(webSessions.countryCode, webSessions.countryName).orderBy(desc(sql`count(*)`)).limit(12),
  ]);
  return {
    pageViews: Number(eventMetrics[0]?.pageViews ?? 0),
    productViews: Number(eventMetrics[0]?.productViews ?? 0),
    carts: Number(eventMetrics[0]?.carts ?? 0),
    checkouts: Number(eventMetrics[0]?.checkouts ?? 0),
    orders: Number(eventMetrics[0]?.orders ?? 0),
    sessions: Number(sessionMetrics[0]?.sessions ?? 0),
    visitors: Number(sessionMetrics[0]?.visitors ?? 0),
    paths: paths.map((row) => ({ path: row.path, views: Number(row.views) })),
    countries: countries.map((row) => ({ countryCode: row.countryCode, countryName: row.countryName, sessions: Number(row.sessions) })),
  };
}, ["traffic-analytics-summary"], { revalidate: 60, tags: ["traffic-analytics"] });

export function getTrafficSummary(range: DateRange) {
  return loadSummary(range.from.toISOString(), range.to.toISOString());
}

export async function rebuildTrafficDailyRollups() {
  const db = getDatabase();
  await db.execute(sql`
    delete from traffic_daily_rollups
    where day >= (current_date - interval '32 days')::date
  `);
  await db.execute(sql`
    insert into traffic_daily_rollups (day, source, medium, country_code, sessions, visitors, page_views, add_to_carts, checkouts, orders, updated_at)
    select
      (s.started_at at time zone 'UTC')::date as day,
      coalesce(s.source, 'direct') as source,
      coalesce(s.medium, 'none') as medium,
      coalesce(s.country_code, 'unknown') as country_code,
      count(distinct s.id)::integer as sessions,
      count(distinct s.visitor_id)::integer as visitors,
      count(e.id) filter (where e.event_name = 'page_view')::integer as page_views,
      count(e.id) filter (where e.event_name = 'add_to_cart')::integer as add_to_carts,
      count(e.id) filter (where e.event_name = 'begin_checkout')::integer as checkouts,
      count(e.id) filter (where e.event_name = 'order_created')::integer as orders,
      now()
    from web_sessions s
    left join storefront_events e on e.visit_session_id = s.id
    where s.started_at >= (current_date - interval '32 days')
    group by 1, 2, 3, 4
  `);
}
