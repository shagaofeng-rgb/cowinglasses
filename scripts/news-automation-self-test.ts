import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { articleSources, contentArticles, contentArticleTranslations, newsCandidates, newsSources } from "../src/db/schema";

async function main() {
  if (!process.env.DATABASE_URL) { console.info("未配置 DATABASE_URL，跳过 News 数据库自检。"); return; }
  const client = postgres(process.env.DATABASE_URL, { max: 1, prepare: false });
  const db = drizzle(client);
  const marker = randomUUID();
  let sourceId: string | undefined;
  let articleId: string | undefined;
  try {
    const [source] = await db.insert(newsSources).values({ sourceKey: `automation-test-${marker}`, name: `[AUTOMATION TEST] ${marker}`, domain: "example.invalid", feedUrl: `https://example.invalid/${marker}.xml`, tier: "test", trustScore: 1, allowedTopics: ["test"], isActive: false }).returning({ id: newsSources.id });
    sourceId = source?.id;
    if (!sourceId) throw new Error("Unable to create the marked test source.");
    const [candidate] = await db.insert(newsCandidates).values({ sourceId, sourceUrl: `https://example.invalid/${marker}`, normalizedUrl: `https://example.invalid/${marker}`, urlHash: marker.replace(/-/g, "").padEnd(64, "0"), title: `[AUTOMATION TEST] ${marker}`, titleHash: `title-${marker}`, summary: "Marked test data. It must never be published.", contentFingerprint: `fingerprint-${marker}`, sourcePublishedAt: new Date(), topics: ["test"], score: 1, status: "rejected", rejectReason: "Marked self-test" }).returning({ id: newsCandidates.id });
    const [article] = await db.insert(contentArticles).values({ type: "news", title: `[AUTOMATION TEST] ${marker}`, slug: `automation-test-${marker}`, excerpt: "Marked test data.", body: "Marked test data.", status: "draft", contentFingerprint: `article-${marker}`, isAutomated: true, indexStatus: "test" }).returning({ id: contentArticles.id });
    articleId = article?.id;
    if (!articleId || !candidate?.id) throw new Error("Unable to create marked candidate or article test data.");
    await db.insert(contentArticleTranslations).values({ articleId, locale: "en", title: `[AUTOMATION TEST] ${marker}`, excerpt: "Marked test data.", body: "Marked test data.", keyTakeaways: ["Marked test only"] });
    await db.insert(articleSources).values({ articleId, name: "Automation Test", domain: "example.invalid", url: `https://example.invalid/${marker}`, isPrimary: true });
    const found = await db.select({ id: contentArticles.id }).from(contentArticles).where(eq(contentArticles.id, articleId));
    if (found.length !== 1) throw new Error("Marked test article was not readable.");
    console.info(`News database self-test passed for marker ${marker}.`);
  } finally {
    if (articleId) await db.delete(contentArticles).where(eq(contentArticles.id, articleId));
    if (sourceId) await db.delete(newsSources).where(eq(newsSources.id, sourceId));
    await client.end({ timeout: 5 });
    console.info(`Marked News test data ${marker} was cleaned.`);
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
