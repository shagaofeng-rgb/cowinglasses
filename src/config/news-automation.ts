export const newsAutomationConfig = {
  stateKey: "cowin-news",
  intervalHours: 48,
  ingestMaxAgeHours: 72,
  fallbackMaxAgeDays: 7,
  minScore: 70,
  desiredWords: { min: 700, max: 1000 },
  maxCandidatesPerSource: 30,
  defaultImage: "/images/demo/hero-glasses.png",
  defaultImageAlt: "CoWin Glasses editorial illustration; not a depiction of the cited event.",
  authorName: "CoWin Editorial Team",
  disclaimer: "This News page is an independent editorial summary and analysis based on the cited source. It does not republish the source article or claim that the cited event involved CoWin Glasses.",
  topics: [
    "Smart eyewear and creator workflows",
    "Travel and app-assisted translation",
    "Open-ear audio and outdoor awareness",
    "Bluetooth and mobile connectivity",
    "Wearable photography and privacy",
    "Photochromic and prescription-ready eyewear",
    "Cycling, commuting and outdoor use",
    "App permissions and device privacy",
  ],
  sources: [
    { sourceKey: "apple-newsroom", name: "Apple Newsroom", domain: "apple.com", feedUrl: "https://www.apple.com/newsroom/rss-feed.rss", tier: "primary", trustScore: 94, allowedTopics: ["mobile connectivity", "accessibility", "privacy", "creator workflows"] },
    { sourceKey: "android-developers", name: "Android Developers Blog", domain: "android-developers.googleblog.com", feedUrl: "https://android-developers.googleblog.com/feeds/posts/default", tier: "primary", trustScore: 94, allowedTopics: ["Android", "Bluetooth", "app permissions", "accessibility"] },
    { sourceKey: "bluetooth-sig", name: "Bluetooth SIG", domain: "bluetooth.com", feedUrl: "https://www.bluetooth.com/blog/feed/", tier: "primary", trustScore: 96, allowedTopics: ["Bluetooth", "audio", "connectivity", "standards"] },
    { sourceKey: "google-android", name: "Google Android Blog", domain: "blog.google", feedUrl: "https://blog.google/products/android/rss/", tier: "primary", trustScore: 92, allowedTopics: ["Android", "accessibility", "translation", "mobile connectivity"] },
    { sourceKey: "ieee-spectrum", name: "IEEE Spectrum", domain: "spectrum.ieee.org", feedUrl: "https://spectrum.ieee.org/feeds/feed.rss", tier: "secondary", trustScore: 86, allowedTopics: ["wearables", "AI", "optics", "privacy"] },
    { sourceKey: "engadget", name: "Engadget", domain: "engadget.com", feedUrl: "https://www.engadget.com/rss.xml", tier: "secondary", trustScore: 76, allowedTopics: ["wearables", "smart glasses", "mobile", "audio"] },
    { sourceKey: "the-verge", name: "The Verge", domain: "theverge.com", feedUrl: "https://www.theverge.com/rss/index.xml", tier: "secondary", trustScore: 76, allowedTopics: ["wearables", "smart glasses", "creator tools", "privacy"] },
  ],
} as const;

export type SeedNewsSource = (typeof newsAutomationConfig.sources)[number];
