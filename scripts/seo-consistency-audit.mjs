import { mkdir, writeFile } from "node:fs/promises";

const origin = process.env.AUDIT_BASE_URL || "https://cowinglasses.com";
const output = process.env.AUDIT_OUTPUT || "output/gsc-2026-11-01";
const decode = value => value.replaceAll("&amp;", "&");
const attrs = tag => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(m => [m[1], decode(m[2])]));
const sitemap = await (await fetch(`${origin}/sitemap.xml`)).text();
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => decode(m[1]));
const pages = new Map();
async function inspect(url) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(30000), redirect: "manual" });
    const html = await r.text();
    const tags = [...html.matchAll(/<link\s[^>]*>/g)].map(m => attrs(m[0]));
    const robots = [...html.matchAll(/<meta\s[^>]*>/g)].map(m => attrs(m[0])).filter(t => ["robots", "googlebot"].includes(t.name)).map(t => t.content).join(";");
    return {url, status:r.status, location:r.headers.get("location"), canonical:tags.find(t => t.rel === "canonical")?.href, robots,
      alternates:tags.filter(t => t.rel === "alternate" && t.hreflang).map(t => ({locale:t.hreflang,url:t.href})),
      links:[...html.matchAll(/<a\s[^>]*href="([^"]+)"/g)].map(m => {try {return new URL(decode(m[1]),url).href.split("#")[0];} catch {return null;}}).filter(u => u?.startsWith(origin) && !/\/(api|admin)(\/|$)/.test(new URL(u).pathname)),
      emptyCollection:html.includes("No published products are currently assigned to this collection.")};
  } catch(e) {return {url,error:e.message,alternates:[],links:[]};}
}
async function batch(list) {
  let i=0;
  await Promise.all(Array.from({length:3},async()=>{while(i<list.length){const u=list[i++]; if(!pages.has(u)) pages.set(u,await inspect(u));}}));
}
await batch(urls);
const issues=[];
for(const url of urls){const p=pages.get(url);
  if(p.status!==200 || p.canonical!==url || /noindex/.test(p.robots) || p.emptyCollection) issues.push({url,kind:"sitemap-ineligible",status:p.status,canonical:p.canonical,robots:p.robots,empty:p.emptyCollection,error:p.error});
}
await batch([...new Set([...pages.values()].flatMap(p=>[...p.alternates.map(a=>a.url),...p.links]))].filter(u=>!pages.has(u)));
for(const url of urls){const p=pages.get(url);for(const alt of p.alternates){
  const target=pages.get(alt.url);
  if(!target || target.status!==200 || /noindex/.test(target.robots) || target.canonical!==alt.url) issues.push({url,kind:"alternate-ineligible",alternate:alt,...(target?{status:target.status,canonical:target.canonical,robots:target.robots}:{})});
  else if(alt.locale!=="x-default" && !target.alternates.some(a=>a.url===url)) issues.push({url,kind:"alternate-not-reciprocal",alternate:alt});
}}
for(const p of pages.values())if(p.error || p.status>=400)issues.push({url:p.url,kind:"broken-link",status:p.status,error:p.error});
await mkdir(output,{recursive:true});
await writeFile(`${output}/consistency.json`,JSON.stringify({checkedAt:new Date().toISOString(),origin,sitemapCount:urls.length,pages:[...pages.values()],issues},null,2));
console.log(JSON.stringify({sitemapCount:urls.length,checked:pages.size,issues},null,2));
