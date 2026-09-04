import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { editorialArticleLabels, messages } from "@/messages";
import type { PublicArticle, PublicArticleType } from "@/data/repositories/articles";
import styles from "@/components/layout/storefront-design.module.css";

const dateLocales: Record<Locale, string> = {
  en: "en-US",
  ar: "ar",
  es: "es",
  pt: "pt-BR",
  ja: "ja-JP",
  ko: "ko-KR",
};

function articleDate(article: PublicArticle, locale: Locale) {
  return new Intl.DateTimeFormat(dateLocales[locale], { year: "numeric", month: "long", day: "numeric" }).format(article.publishedAt ?? article.updatedAt);
}

export function EditorialIndex({ locale, type, articles }: { locale: Locale; type: PublicArticleType; articles: PublicArticle[] }) {
  const t = messages[locale];
  const title = type === "news" ? t.editorial.newsTitle : t.editorial.blogTitle;
  const intro = type === "news" ? t.editorial.newsIntro : t.editorial.blogIntro;

  return (
    <div className={styles.page}>
      <header className={styles.editorialHero}>
        <div className={`shell ${styles.editorialHeroInner}`}>
          <h1>{title}</h1>
          <p>{intro}</p>
          <span className="mt-8 text-xs font-bold uppercase tracking-[.14em] text-[var(--lime)]">{t.nav[type]}</span>
        </div>
      </header>
      <section className={`shell ${styles.section}`}>
        {articles.length ? (
          <div className={styles.editorialGrid}>
            {articles.map((article) => (
              <article key={article.id} className={styles.editorialCard}>
                {article.imageUrl ? (
                  <div className={styles.editorialImage}>
                    <Image src={article.imageUrl} alt={article.imageAlt || article.title} fill sizes="(max-width: 768px) 100vw, 50vw" />
                  </div>
                ) : <div className={styles.editorialPlaceholder} aria-hidden="true" />}
                <div className={styles.editorialCardBody}>
                <div className="flex items-center justify-between gap-4 text-xs font-bold uppercase tracking-[.12em] text-[var(--muted)]">
                  <span>{t.nav[type]}</span>
                  <time dateTime={(article.publishedAt ?? article.updatedAt).toISOString()}>{articleDate(article, locale)}</time>
                </div>
                <h2>{article.title}</h2>
                {article.excerpt && <p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">{article.excerpt}</p>}
                <Link className="mt-auto inline-flex items-center gap-2 pt-8 text-sm font-black" href={`/${locale}/${type}/${article.slug}`}>
                  {t.editorial.readArticle}<ArrowUpRight size={16} aria-hidden="true" />
                </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="grid min-h-72 place-items-center rounded-3xl border border-dashed border-[var(--line)] bg-white p-8 text-center">
            <div><p className="text-2xl font-black">{t.editorial.empty}</p><Link className="button-secondary mt-6" href={`/${locale}/shop`}>{t.common.continueShopping}</Link></div>
          </div>
        )}
      </section>
    </div>
  );
}

export function EditorialArticle({ locale, type, article }: { locale: Locale; type: PublicArticleType; article: PublicArticle }) {
  const t = { ...messages[locale], editorial: { ...messages[locale].editorial, ...editorialArticleLabels[locale] } };
  const backLabel = type === "news" ? t.editorial.backToNews : t.editorial.backToBlog;
  return (
    <article className={styles.editorialArticle}>
      <header className={styles.articleHeader}>
        <div className="shell max-w-6xl">
          <Link className="inline-flex items-center gap-2 text-sm font-bold text-[var(--muted)] hover:text-[var(--ink)]" href={`/${locale}/${type}`}>
            <ArrowLeft size={16} className="rtl:rotate-180" aria-hidden="true" />{backLabel}
          </Link>
          <h1>{article.title}</h1>
          {article.excerpt && <p className="mt-7 max-w-3xl text-lg leading-8 text-[var(--muted)]">{article.excerpt}</p>}
        </div>
      </header>
      {article.imageUrl ? (
        <figure className="shell max-w-6xl pt-10">
          <div className="relative aspect-[16/8] overflow-hidden rounded-2xl bg-[#dceaf0]">
            <Image src={article.imageUrl} alt={article.imageAlt || article.title} fill sizes="(max-width: 768px) 100vw, 1152px" className="object-cover" priority />
          </div>
          {article.imageAlt ? <figcaption className="mt-3 text-xs leading-5 text-[var(--muted)]">{article.imageAlt}</figcaption> : null}
        </figure>
      ) : null}
      <div className={`shell max-w-6xl ${styles.section} ${styles.articleBody}`}>
        <aside className={styles.articleRail}>
          <p className="uppercase tracking-[.14em]">{t.nav[type]}</p>
          <p className="mt-5">{t.editorial.published}<br /><time dateTime={(article.publishedAt ?? article.updatedAt).toISOString()}>{articleDate(article, locale)}</time></p>
          <p className="mt-5">{t.editorial.by}<br />{article.authorName}</p>
        </aside>
        <div className="max-w-3xl">
          {article.keyTakeaways.length ? <aside className="mb-10 border-y border-[#9baa49] bg-[#eef3d4] p-6 md:p-8"><h2 className="text-3xl">{t.editorial.keyTakeaways}</h2><ul className="mt-4 grid gap-3 text-[var(--muted)]">{article.keyTakeaways.map((item) => <li key={item} className="flex gap-3"><span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#829500]"/><span className="leading-7">{item}</span></li>)}</ul></aside> : null}
          <MarkdownBody value={article.body || article.excerpt || ""}/>
          {type === "news" && article.sources.length ? <section className="mt-12 border-t border-[var(--line)] pt-8" aria-labelledby="article-sources"><h2 id="article-sources" className="text-3xl">{t.editorial.originalSource}</h2><div className="mt-4 grid border-t border-[var(--line)]">{article.sources.map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer noopener" className="group border-b border-[var(--line)] py-5 transition hover:px-4 hover:bg-white"><span className="font-black">{source.name}</span>{source.title ? <span className="mt-1 block text-sm leading-6 text-[var(--muted)]">{source.title}</span> : null}<span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#687700]">{t.editorial.viewSource}<ArrowUpRight size={14}/></span></a>)}</div></section> : null}
          {type === "news" && article.editorialDisclaimer ? <aside className="mt-8 border-t border-[var(--line)] pt-5 text-sm leading-6 text-[var(--muted)]"><strong className="text-[var(--ink)]">{t.editorial.disclaimer}</strong><span className="mt-1 block">{article.editorialDisclaimer}</span></aside> : null}
        </div>
      </div>
    </article>
  );
}

function MarkdownBody({ value }: { value: string }) {
  const blocks = value.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
  return <div className="grid gap-5 text-base leading-8 text-[var(--muted)]">{blocks.map((block, index) => {
    if (block.startsWith("## ")) return <h2 key={index} className="mt-5 text-3xl leading-tight text-[var(--ink)]">{block.slice(3)}</h2>;
    if (block.split("\n").every((line) => /^[-*]\s+/.test(line))) return <ul key={index} className="grid gap-2 ps-5">{block.split("\n").map((line) => <li key={line} className="list-disc">{line.replace(/^[-*]\s+/, "")}</li>)}</ul>;
    return <p key={index}>{block.replace(/\n/g, " ")}</p>;
  })}</div>;
}
