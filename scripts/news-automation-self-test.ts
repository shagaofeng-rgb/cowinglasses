import { randomUUID } from "node:crypto";
import { and, eq, inArray, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { articleSources, contentArticles, contentArticleTranslations, newsCandidates, newsSources } from "../src/db/schema";

async function main() {
  if (!process.env.DATABASE_URL) { console.info("未配置 DATABASE_URL，跳过 News 数据库自检。"); return; }
  const client = postgres(process.env.DATABASE_URL, { max: 1, prepare: false });
  const db = drizzle(client);
  const marker = randomUUID();
  let sourceId: string | undefined;
  let candidateId: string | undefined;
  let articleId: string | undefined;

  const cleanupMarkedTestRows = async () => {
    await db.delete(contentArticles).where(and(
      like(contentArticles.slug, "automation-test-%"),
      eq(contentArticles.status, "draft"),
      eq(contentArticles.isAutomated, true),
      eq(contentArticles.indexStatus, "test"),
    ));

    const markedSources = await db
      .select({ id: newsSources.id })
      .from(newsSources)
      .where(like(newsSources.sourceKey, "automation-test-%"));
    const markedSourceIds = markedSources.map((source) => source.id);
    if (markedSourceIds.length > 0) {
      await db.delete(newsCandidates).where(inArray(newsCandidates.sourceId, markedSourceIds));
    }
    await db.delete(newsSources).where(like(newsSources.sourceKey, "automation-test-%"));
  };

  try {
    // Clean only explicitly marked self-test records that may remain after an interrupted build.
    await cleanupMarkedTestRows();
    const [source] = await db.insert(newsSources).values({ sourceKey: `automation-test-${marker}`, name: `[AUTOMATION TEST] ${marker}`, domain: "example.invalid", feedUrl: `https://example.invalid/${marker}.xml`, tier: "test", trustScore: 1, allowedTopics: ["test"], isActive: false }).returning({ id: newsSources.id });
    sourceId = source?.id;
    if (!sourceId) throw new Error("Unable to create the marked test source.");
    const [candidate] = await db.insert(newsCandidates).values({ sourceId, sourceUrl: `https://example.invalid/${marker}`, normalizedUrl: `https://example.invalid/${marker}`, urlHash: marker.replace(/-/g, "").padEnd(64, "0"), title: `[AUTOMATION TEST] ${marker}`, titleHash: `title-${marker}`, summary: "Marked test data. It must never be published.", contentFingerprint: `fingerprint-${marker}`, sourcePublishedAt: new Date(), topics: ["test"], score: 1, status: "rejected", rejectReason: "Marked self-test" }).returning({ id: newsCandidates.id });
    candidateId = candidate?.id;
    const [article] = await db.insert(contentArticles).values({ type: "news", title: `[AUTOMATION TEST] ${marker}`, slug: `automation-test-${marker}`, excerpt: "Marked test data.", body: "Marked test data.", status: "draft", contentFingerprint: `article-${marker}`, isAutomated: true, indexStatus: "test" }).returning({ id: contentArticles.id });
    articleId = article?.id;
    if (!articleId || !candidateId) throw new Error("Unable to create marked candidate or article test data.");
    await db.insert(contentArticleTranslations).values({ articleId, locale: "en", title: `[AUTOMATION TEST] ${marker}`, excerpt: "Marked test data.", body: "Marked test data.", keyTakeaways: ["Marked test only"] });
    await db.insert(articleSources).values({ articleId, name: "Automation Test", domain: "example.invalid", url: `https://example.invalid/${marker}`, isPrimary: true });
    const found = await db.select({ id: contentArticles.id }).from(contentArticles).where(eq(contentArticles.id, articleId));
    if (found.length !== 1) throw new Error("Marked test article was not readable.");
    console.info(`News database self-test passed for marker ${marker}.`);
  } finally {
    try {
      if (articleId) await db.delete(contentArticles).where(eq(contentArticles.id, articleId));
      if (candidateId) await db.delete(newsCandidates).where(eq(newsCandidates.id, candidateId));
      if (sourceId) await db.delete(newsSources).where(eq(newsSources.id, sourceId));
      await cleanupMarkedTestRows();
      console.info(`Marked News test data ${marker} was cleaned.`);
    } finally {
      await client.end({ timeout: 5 });
    }
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
