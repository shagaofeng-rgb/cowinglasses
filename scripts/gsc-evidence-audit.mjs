import { readFile, writeFile } from "node:fs/promises";

const directory = process.env.GSC_EVIDENCE_DIR || "output/gsc-2026-11-01";
const categories = ["404", "soft404", "alternative", "conflicts", "noindex", "redirect", "crawled", "discovered"];
const rows = [];
for (const category of categories) {
  let text;
  try { text = await readFile(`${directory}/${category}.txt`, "utf8"); } catch { continue; }
  for (const match of text.matchAll(/- row "(https?:\/\/[^\s]+)(?: [^"\n]*?)? (\d+ \w+ \d{4}|N\/A)":/g)) {
    const url = match[1];
    if (!["cowinglasses.com", "www.cowinglasses.com"].includes(new URL(url).hostname)) continue;
    rows.push({category,url,lastCrawled:match[2]});
  }
}
let cursor=0;
await Promise.all(Array.from({length:3},async()=>{while(cursor<rows.length){
  const row=rows[cursor++];
  try {
    const r=await fetch(row.url,{redirect:"manual",signal:AbortSignal.timeout(30000)});
    row.status=r.status; row.location=r.headers.get("location"); row.contentType=r.headers.get("content-type");
    if(row.contentType?.includes("text/html")) {
      const html=await r.text();
      row.canonical=html.match(/rel="canonical"[^>]*href="([^"]+)"/)?.[1];
      row.robots=[...html.matchAll(/name="robots"[^>]*content="([^"]*)"/g)].map(m=>m[1]).join(";");
      row.emptyCollection=html.includes("No published products are currently assigned");
    } else await r.body?.cancel();
  } catch(e){ row.error=e.message; }
}}));
await writeFile(`${directory}/gsc-live-results.json`,JSON.stringify(rows,null,2));
console.log(JSON.stringify({total:rows.length,counts:Object.fromEntries(categories.map(c=>[c,rows.filter(r=>r.category===c).length])),errors:rows.filter(r=>r.error)},null,2));
