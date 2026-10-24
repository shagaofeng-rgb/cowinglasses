import { mkdir, writeFile } from "node:fs/promises";
const base = process.env.AUDIT_BASE_URL || "https://cowinglasses.com";
const xml = await (await fetch(`${base}/sitemap.xml`)).text();
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].replaceAll("&amp;", "&"));
const results = [];
const links = new Set();
let cursor = 0;
await Promise.all(Array.from({length: 4}, async () => {
  while (cursor < urls.length) {
    const url = urls[cursor++]; const started = performance.now();
    try {
      const response = await fetch(url, {signal: AbortSignal.timeout(25000)});
      const html = await response.text();
      const schemas = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
      let invalidSchema = 0; for (const m of schemas) { try { JSON.parse(m[1]); } catch { invalidSchema++; } }
      for (const m of html.matchAll(/href="([^"#]+)"/g)) { try { const u = new URL(m[1].replaceAll("&amp;", "&"), url); if(u.origin === base && !u.pathname.startsWith("/_next") && !u.pathname.startsWith("/api") && !u.pathname.startsWith("/admin")) links.add(u.origin + u.pathname); } catch {} }
      results.push({url, status:response.status, ms: Math.round(performance.now()-started), title:html.match(/<title>(.*?)<\/title>/)?.[1], h1:(html.match(/<h1[\s>]/g)||[]).length, canonical:html.match(/rel="canonical"[^>]*href="([^"]+)"/)?.[1], noindex:/name="robots"[^>]*content="[^"]*noindex/.test(html), schemas:schemas.length, invalidSchema});
    } catch(error) { results.push({url,error:error.message}); }
  }
}));
const extra = [...links].filter(url => !urls.includes(url)); const linkResults = []; cursor=0;
await Promise.all(Array.from({length:4},async()=> { while(cursor<extra.length) { const url=extra[cursor++]; try { const r=await fetch(url,{signal:AbortSignal.timeout(20000)}); await r.body?.cancel(); linkResults.push({url,status:r.status}); } catch(e){linkResults.push({url,error:e.message});} } }));
await mkdir("output/audit",{recursive:true});
await writeFile("output/audit/http-audit.json",JSON.stringify({checkedAt:new Date().toISOString(),results,linkResults},null,2));
console.log(JSON.stringify({pages:results.length, additionalLinks:linkResults.length, failures:results.filter(r=>r.status!==200||r.invalidSchema||!r.title||!r.canonical||r.h1!==1), brokenLinks:linkResults.filter(r=>r.status>=400||r.error)},null,2));
