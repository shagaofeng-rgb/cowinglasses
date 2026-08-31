import { createHash } from "node:crypto";
import { newsAutomationConfig } from "@/config/news-automation";

export type FeedItem = { title: string; url: string; summary: string; publishedAt: string; author?: string };

export function hashNewsValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function compactNewsText(value: string, limit = 5000) {
  return value.replace(/\s+/g, " ").trim().slice(0, limit);
}

function decodeHtml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)));
}

function stripHtml(value: string) {
  const decoded = decodeHtml(value);
  return compactNewsText(decoded.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]*>/g, " "));
}

function tagValue(block: string, tag: string) {
  const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? stripHtml(match[1]) : "";
}

function linkValue(block: string) {
  const body = tagValue(block, "link");
  if (body) return body;
  const href = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i);
  return href ? decodeHtml(href[1]).trim() : "";
}

export function parseNewsFeed(xml: string): FeedItem[] {
  const blocks = [
    ...[...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].map((match) => match[1]),
    ...[...xml.matchAll(/<entry(?:\s[^>]*)?>([\s\S]*?)<\/entry>/gi)].map((match) => match[1]),
  ];
  return blocks.map((block) => {
    const rawDate = tagValue(block, "pubDate") || tagValue(block, "published") || tagValue(block, "updated");
    const timestamp = Date.parse(rawDate);
    return {
      title: tagValue(block, "title"),
      url: linkValue(block),
      summary: tagValue(block, "description") || tagValue(block, "summary") || tagValue(block, "content:encoded") || tagValue(block, "content"),
      publishedAt: Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : "",
      author: tagValue(block, "author") || tagValue(block, "dc:creator") || undefined,
    };
  }).filter((item) => item.title && item.url && item.summary && item.publishedAt);
}

export function normalizeNewsUrl(value: string) {
  try {
    const url = new URL(value);
    url.hash = "";
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid", "gclid"].forEach((key) => url.searchParams.delete(key));
    url.hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    url.pathname = url.pathname.replace(/\/$/, "") || "/";
    return url.toString();
  } catch {
    return "";
  }
}

export function sourceDomainMatches(url: string, domain: string) {
  try {
    const hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    const expected = domain.toLowerCase().replace(/^www\./, "");
    return hostname === expected || hostname.endsWith(`.${expected}`);
  } catch {
    return false;
  }
}

export function lexicalSimilarity(left: string, right: string) {
  const words = (value: string) => new Set((value.toLowerCase().match(/[a-z0-9]{4,}/g) || []).map((word) => word.endsWith("s") ? word.slice(0, -1) : word));
  const a = words(left); const b = words(right); const union = new Set([...a, ...b]);
  if (!union.size) return 0;
  let overlap = 0;
  a.forEach((word) => { if (b.has(word)) overlap += 1; });
  return overlap / union.size;
}

const topicPatterns: Array<[string, RegExp]> = [
  ["Smart eyewear", /smart glasses|smart eyewear|wearable display|augmented reality|mixed reality|head.?worn/i],
  ["Open-ear audio", /open.?ear|spatial audio|wearable audio|headphone|earbud|audio accessibility/i],
  ["Bluetooth", /bluetooth|wireless audio|pairing|connected device|le audio/i],
  ["Translation", /translation|translate|language model|multilingual|live captions/i],
  ["Creator workflows", /camera|photography|video|creator|capture|content creation/i],
  ["Outdoor movement", /cycling|outdoor|travel|commut|sport|navigation/i],
  ["Lenses and optics", /photochromic|prescription|lens|optics|eyewear/i],
  ["Privacy and permissions", /privacy|permission|recording|consent|security|accessibility/i],
];

export function detectNewsTopics(value: string) {
  return topicPatterns.filter(([, pattern]) => pattern.test(value)).map(([topic]) => topic);
}

export function scoreNewsCandidate(input: { title: string; summary: string; publishedAt: string; trustScore: number; allowedTopics: readonly string[] }) {
  const text = `${input.title} ${input.summary}`;
  const topics = detectNewsTopics(text);
  const relevance = Math.min(38, topics.length * 9 + (/smart glasses|smart eyewear|wearable/i.test(text) ? 12 : 0));
  const practical = Math.min(18, (text.match(/bluetooth|translation|camera|audio|privacy|travel|cycling|lens|accessibility/gi) || []).length * 3);
  const ageHours = Math.max(0, (Date.now() - Date.parse(input.publishedAt)) / 3_600_000);
  const freshness = ageHours <= 24 ? 18 : ageHours <= 72 ? 13 : ageHours <= 168 ? 7 : 0;
  const trust = Math.min(16, Math.round(input.trustScore * 0.16));
  const sourceAlignment = Math.min(10, input.allowedTopics.length * 2);
  return { topics, score: Math.max(0, Math.min(100, relevance + practical + freshness + trust + sourceAlignment)) };
}

export function canPublishAt(lastPublishedAt?: Date | string | null, timestamp = Date.now(), intervalHours: number = newsAutomationConfig.intervalHours) {
  if (!lastPublishedAt) return true;
  const previous = typeof lastPublishedAt === "string" ? Date.parse(lastPublishedAt) : lastPublishedAt.getTime();
  return !Number.isFinite(previous) || timestamp - previous >= intervalHours * 3_600_000;
}

export function slugifyNews(value: string) {
  return value.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 105);
}

export function countEnglishWords(value: string) {
  return (value.match(/\b[\w'-]+\b/g) || []).length;
}
