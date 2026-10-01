import { submitGoogleSitemap } from "../src/lib/seo/google-search-console";

submitGoogleSitemap().then(({ siteUrl, sitemapUrl }) => {
  console.log(`Search Console accepted sitemap submission for ${siteUrl}: ${sitemapUrl}`);
}).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Search Console sitemap submission failed.");
  process.exitCode = 1;
});
