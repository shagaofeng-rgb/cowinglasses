import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { messages } from "@/messages";
import type { PublicArticle, PublicArticleType } from "@/data/repositories/articles";

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
    <main>
      <header className="border-b border-[var(--line)] bg-white">
        <div className="shell py-12 md:py-20">
          <p className="eyebrow">{t.nav[type]}</p>
          <h1 className="mt-4 max-w-4xl text-5xl leading-[.94] md:text-7xl">{title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">{intro}</p>
        </div>
      </header>
      <section className="shell py-12 md:py-16">
        {articles.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {articles.map((article, index) => (
              <article key={article.id} className={`group flex min-h-72 flex-col rounded-3xl border border-[var(--line)] p-6 transition hover:-translate-y-1 hover:border-[#a5b629] hover:bg-white ${index === 0 ? "md:col-span-2 md:min-h-80" : "bg-[var(--surface)]"}`}>
                <div className="flex items-center justify-between gap-4 text-xs font-bold uppercase tracking-[.12em] text-[var(--muted)]">
                  <span>{t.nav[type]}</span>
                  <time dateTime={(article.publishedAt ?? article.updatedAt).toISOString()}>{articleDate(article, locale)}</time>
                </div>
                <h2 className={`mt-8 max-w-2xl ${index === 0 ? "text-4xl md:text-5xl" : "text-3xl"}`}>{article.title}</h2>
                {article.excerpt && <p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">{article.excerpt}</p>}
                <Link className="mt-auto inline-flex items-center gap-2 pt-8 text-sm font-black" href={`/${locale}/${type}/${article.slug}`}>
                  {t.editorial.readArticle}<ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="grid min-h-72 place-items-center rounded-3xl border border-dashed border-[var(--line)] bg-white p-8 text-center">
            <div><p className="text-2xl font-black">{t.editorial.empty}</p><Link className="button-secondary mt-6" href={`/${locale}/shop`}>{t.common.continueShopping}</Link></div>
          </div>
        )}
      </section>
    </main>
  );
}

export function EditorialArticle({ locale, type, article }: { locale: Locale; type: PublicArticleType; article: PublicArticle }) {
  const t = messages[locale];
  const backLabel = type === "news" ? t.editorial.backToNews : t.editorial.backToBlog;
  return (
    <main>
      <article className="shell max-w-5xl py-12 md:py-20">
        <Link className="inline-flex items-center gap-2 text-sm font-bold text-[var(--muted)] hover:text-[var(--ink)]" href={`/${locale}/${type}`}>
          <ArrowLeft size={16} className="rtl:rotate-180" aria-hidden="true" />{backLabel}
        </Link>
        <header className="mt-10 border-b border-[var(--line)] pb-10">
          <p className="eyebrow">{t.nav[type]}</p>
          <h1 className="mt-4 max-w-4xl text-5xl leading-[.96] md:text-7xl">{article.title}</h1>
          {article.excerpt && <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--muted)]">{article.excerpt}</p>}
          <p className="mt-7 text-xs font-bold uppercase tracking-[.12em] text-[var(--muted)]">
            {t.editorial.published} · <time dateTime={(article.publishedAt ?? article.updatedAt).toISOString()}>{articleDate(article, locale)}</time>
          </p>
        </header>
        <div className="prose mt-10 max-w-3xl whitespace-pre-wrap text-base leading-8 text-[var(--muted)]">{article.body || article.excerpt}</div>
      </article>
    </main>
  );
}
