import assert from "node:assert/strict";
import test from "node:test";
import { canPublishAt, lexicalSimilarity, normalizeNewsUrl, parseNewsFeed, scoreNewsCandidate } from "./logic";

test("parses RSS and Atom entries without executing embedded markup", () => {
  const rss = `<rss><channel><item><title><![CDATA[Bluetooth LE Audio update]]></title><link>https://example.com/post?utm_source=test</link><description><![CDATA[<p>Wearable audio and accessibility.</p><script>ignore()</script>]]></description><pubDate>${new Date().toUTCString()}</pubDate></item></channel></rss>`;
  const [item] = parseNewsFeed(rss);
  assert.equal(item.title, "Bluetooth LE Audio update");
  assert.match(item.summary, /Wearable audio/);
  assert.doesNotMatch(item.summary, /ignore/);
});

test("normalizes tracking parameters and fragments", () => {
  assert.equal(normalizeNewsUrl("https://WWW.Example.com/a/?utm_source=x#top"), "https://example.com/a");
});

test("enforces the 48-hour publication guard", () => {
  const now = Date.now();
  assert.equal(canPublishAt(new Date(now - 47 * 3_600_000), now, 48), false);
  assert.equal(canPublishAt(new Date(now - 48 * 3_600_000), now, 48), true);
});

test("detects semantic title duplicates", () => {
  assert.ok(lexicalSimilarity("Bluetooth audio arrives for wearable devices", "Bluetooth audio for wearable device arrives") > 0.7);
});

test("scores a fresh, trusted smart-eyewear item above an unrelated item", () => {
  const publishedAt = new Date().toISOString();
  const relevant = scoreNewsCandidate({ title: "Smart glasses add Bluetooth audio and live captions", summary: "Wearable accessibility and creator camera workflows are included.", publishedAt, trustScore: 95, allowedTopics: ["Bluetooth", "wearables", "accessibility"] });
  const unrelated = scoreNewsCandidate({ title: "Quarterly office update", summary: "A routine administrative note.", publishedAt, trustScore: 60, allowedTopics: [] });
  assert.ok(relevant.score >= 70);
  assert.ok(relevant.score > unrelated.score);
});
