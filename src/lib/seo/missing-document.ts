import { localeMeta, type Locale } from "@/lib/i18n";
import { messages } from "@/messages";
import { storefrontLabels } from "@/messages/storefront";

function escape(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
}

/** Keep unknown routes usable before JavaScript without turning them into soft 404s. */
export function missingDocument(locale: Locale, headOnly: boolean) {
  const { notFound, notFoundCopy } = storefrontLabels(locale);
  const t = messages[locale];
  const body = `<!doctype html><html lang="${locale}" dir="${localeMeta[locale].direction}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,follow"><title>404 | CoWin Glasses</title>
<style>body{margin:0;background:#0d1011;color:#f3f5f1;font:1rem/1.55 system-ui,sans-serif}
main{display:grid;min-height:100svh;place-content:center;padding:0 1.25rem;text-align:center}
h1{font-size:clamp(2rem,8vw,4rem);line-height:1.12;margin:.5rem 0}p{color:#abb6b7}
strong{color:#d5eb59;letter-spacing:.08em}nav{display:flex;justify-content:center;flex-wrap:wrap;gap:.7rem;margin-top:1.5rem}
a{padding:.7rem 1.15rem;border:1px solid #d5eb59;color:#d5eb59;text-decoration:none}a:first-child{background:#d5eb59;color:#131711}
a:focus-visible{outline:2px solid white;outline-offset:3px}</style></head>
<body><main><strong>404 / COWIN</strong><h1>${escape(notFound)}</h1><p>${escape(notFoundCopy)}</p>
<nav><a href="/${locale}/shop">${escape(t.nav.shop)}</a><a href="/${locale}/search">${escape(t.nav.search)}</a></nav></main></body></html>`;
  return new Response(headOnly ? null : body, {
    status: 404,
    headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex, follow", "Cache-Control": "no-store" },
  });
}
