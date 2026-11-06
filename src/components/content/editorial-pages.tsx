import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight, BookOpen } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { editorialArticleLabels, messages } from "@/messages";
import { storefrontLabels } from "@/messages/storefront";
import type { PublicArticle, PublicArticleSummary, PublicArticleType } from "@/data/repositories/articles";
import { InteriorHead } from "@/components/layout/storefront-ui";
import { Pagination } from "@/components/commerce/pagination";
import styles from "@/components/layout/storefront-design.module.css";

export const editorialPageSize = 6;

function ArticleDate({ article, locale }: { article: PublicArticleSummary; locale: Locale }) {
  const date = article.publishedAt ?? article.updatedAt;
  return <time dateTime={date.toISOString()}>{new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(date)}</time>;
}

export function EditorialIndex({ locale, type, articles, currentPage = 1, totalPages = 1 }: {
  locale: Locale; type: PublicArticleType; articles: PublicArticleSummary[]; currentPage?: number; totalPages?: number;
}) {
  const t = messages[locale];
  const ui = storefrontLabels(locale);
  const title = type === "news" ? t.editorial.newsTitle : t.editorial.blogTitle;
  const intro = type === "news" ? t.editorial.newsIntro : t.editorial.blogIntro;
  return <div className={styles.page}>
    <InteriorHead eyebrow={ui.journal} title={title} intro={intro} />
    <section className={`shell ${styles.sectionTight}`}>
      <nav className={styles.editorialNav} aria-label={ui.journal}>
        {(["news", "blog"] as const).map((tab) => <Link key={tab} href={`/${locale}/${tab}`} aria-current={tab === type ? "page" : undefined}>{t.nav[tab]}</Link>)}
      </nav>
      {articles.length ? <>
        <div className={styles.editorialGrid}>
          {articles.map((article, index) => {
            const featured = index === 0 && currentPage === 1;
            const href = `/${locale}/${type}/${article.slug}`;
            return <article key={article.id} className={`${styles.editorialCard} ${featured ? styles.editorialFeatured : ""}`}>
              {article.imageUrl
                ? <Link href={href} aria-label={article.title} className={styles.editorialImage}><Image src={article.imageUrl} alt="" fill sizes={featured ? "(max-width: 767px) 93vw, 50vw" : "(max-width: 767px) 25vw, 160px"} /></Link>
                : <div className={styles.editorialPlaceholder} aria-hidden="true"><BookOpen size={featured ? 54 : 22} strokeWidth={1.35} /></div>}
              <div className={styles.editorialCardBody}>
                <span className={styles.kicker}>{featured ? ui.featured : t.nav[type]}</span>
                <p><ArticleDate article={article} locale={locale} /></p>
                <h2><Link href={href}>{article.title}</Link></h2>
                {featured && article.excerpt && <p>{article.excerpt}</p>}
                <Link className={styles.textLink} href={href}>{t.editorial.readArticle}<ArrowUpRight size={15} className="rtl:-rotate-90" aria-hidden="true" /></Link>
              </div>
            </article>;
          })}
        </div>
        <Pagination locale={locale} currentPage={currentPage} totalPages={totalPages} hrefForPage={(page) => `/${locale}/${type}${page === 1 ? "" : `?page=${page}`}`} label={t.nav[type]} />
      </> : <div className={styles.emptyState}>
        <BookOpen size={34} aria-hidden="true" /><p>{t.editorial.empty}</p>
        <Link className="button-secondary" href={`/${locale}/shop`}>{t.common.continueShopping}</Link>
      </div>}
    </section>
  </div>;
}

export function EditorialArticle({ locale, type, article }: { locale: Locale; type: PublicArticleType; article: PublicArticle }) {
  const t = messages[locale];
  const ui = storefrontLabels(locale);
  const labels = { ...t.editorial, ...editorialArticleLabels[locale] };
  const blocks = (article.body || article.excerpt || "").split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
  const headings = blocks.flatMap((block, index) => /^#{2,3} /.test(block) ? [{ id: `article-${index}`, title: block.replace(/^#{2,3} /, "") }] : []);
  const sources = type === "news" ? article.sources : [];
  return <article className={styles.page}>
    <header className={`shell ${styles.articleHeader}`}>
      <div>
        <Link className={styles.textLink} href={`/${locale}/${type}`}><ArrowLeft size={16} className="rtl:rotate-180" aria-hidden="true" />{type === "news" ? labels.backToNews : labels.backToBlog}</Link>
        <p className={`mt-4 ${styles.kicker}`}>{ui.journal} / {t.nav[type]}</p>
        <h1 className={styles.pageHeroTitle}>{article.title}</h1>
        {article.excerpt && <p className={styles.pageHeroIntro}>{article.excerpt}</p>}
      </div>
      {article.imageUrl && <figure>
        <div className={styles.editorialImage}><Image src={article.imageUrl} alt={article.imageAlt || article.title} fill sizes="(max-width: 767px) 93vw, 46vw" priority /></div>
        {article.imageAlt && <figcaption className="mt-2 text-xs text-[var(--muted)]">{article.imageAlt}</figcaption>}
      </figure>}
    </header>
    <div className={`shell ${styles.editorialArticle}`}>
      <aside className={styles.articleRail}>
        <p className={styles.kicker}>{t.nav[type]}</p>
        <p>{labels.published} · <ArticleDate article={article} locale={locale} /></p>
        <p>{labels.by} · {article.authorName}</p>
        {(headings.length > 0 || sources.length > 0) && <nav aria-label={ui.contents} className="mt-3">
          <p className={styles.kicker}>{ui.contents}</p>
          {headings.map(({ id, title }) => <a key={id} href={`#${id}`}>{title}</a>)}
          {sources.length > 0 && <a href="#article-sources">{labels.originalSource}</a>}
        </nav>}
      </aside>
      <div className={styles.articleBody}>
        {article.keyTakeaways.length > 0 && <aside className={styles.infoBlock}>
          <h2>{labels.keyTakeaways}</h2><ul className="mt-3 grid gap-2">{article.keyTakeaways.map((item) => <li key={item}>{item}</li>)}</ul>
        </aside>}
        {blocks.map((block, index) => {
          const id = `article-${index}`;
          if (block.startsWith("## ")) return <h2 key={id} id={id}>{block.slice(3)}</h2>;
          if (block.startsWith("### ")) return <h3 key={id} id={id}>{block.slice(4)}</h3>;
          const lines = block.split("\n");
          if (lines.every((line) => /^[-*]\s+/.test(line))) return <ul key={id}>{lines.map((line, lineIndex) => <li key={lineIndex}>{line.replace(/^[-*]\s+/, "")}</li>)}</ul>;
          return <p key={id}>{lines.join(" ")}</p>;
        })}
        {sources.length > 0 && <section id="article-sources" className="border-t border-[var(--line)] pt-5" aria-labelledby="article-sources-title">
          <h2 id="article-sources-title">{labels.originalSource}</h2>
          <ul className="mt-3 grid gap-2">{sources.map((source) => <li key={source.id}>
            <a href={source.url} target="_blank" rel="noreferrer noopener">{source.name}{source.title && ` · ${source.title}`}</a>
          </li>)}</ul>
        </section>}
        {type === "news" && article.editorialDisclaimer && <aside className={styles.notice}><strong>{labels.disclaimer}</strong><p>{article.editorialDisclaimer}</p></aside>}
      </div>
    </div>
  </article>;
}
