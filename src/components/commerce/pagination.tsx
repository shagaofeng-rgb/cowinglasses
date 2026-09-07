import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import styles from "@/components/layout/storefront-design.module.css";

type PaginationProps = {
  locale: Locale;
  currentPage: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
  label?: string;
};

const copy: Record<Locale, { previous: string; next: string; page: string; pageOf: string }> = {
  en: { previous: "Previous", next: "Next", page: "Page", pageOf: "of" },
  ar: { previous: "السابق", next: "التالي", page: "الصفحة", pageOf: "من" },
  es: { previous: "Anterior", next: "Siguiente", page: "Página", pageOf: "de" },
  pt: { previous: "Anterior", next: "Próxima", page: "Página", pageOf: "de" },
  ja: { previous: "前へ", next: "次へ", page: "ページ", pageOf: "/" },
  ko: { previous: "이전", next: "다음", page: "페이지", pageOf: "/" },
};

function pageRange(currentPage: number, totalPages: number) {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1);
  const first = Math.max(2, Math.min(currentPage - 1, totalPages - 3));
  const middle = [first, first + 1, first + 2].filter((page) => page < totalPages);
  return [1, ...(first > 2 ? [0] : []), ...middle, ...(middle.at(-1)! < totalPages - 1 ? [0] : []), totalPages];
}

/** A finite, URL-addressable result set rather than an endless content stream. */
export function Pagination({ locale, currentPage, totalPages, hrefForPage, label = "Results" }: PaginationProps) {
  if (totalPages <= 1) return null;
  const t = copy[locale];
  return (
    <nav className={styles.pagination} aria-label={`${label} pagination`}>
      {currentPage > 1 ? (
        <Link href={hrefForPage(currentPage - 1)} className={styles.paginationStep}>{t.previous}</Link>
      ) : <span className={styles.paginationDisabled}>{t.previous}</span>}
      <ol className={styles.paginationPages}>
        {pageRange(currentPage, totalPages).map((page, index) => page === 0 ? (
          <li key={`gap-${index}`} aria-hidden="true" className={styles.paginationGap}>…</li>
        ) : (
          <li key={page}>
            <Link href={hrefForPage(page)} aria-current={page === currentPage ? "page" : undefined} className={page === currentPage ? styles.paginationCurrent : styles.paginationPage}>
              <span className="sr-only">{t.page} </span>{page}
            </Link>
          </li>
        ))}
      </ol>
      {currentPage < totalPages ? (
        <Link href={hrefForPage(currentPage + 1)} className={styles.paginationStep}>{t.next}</Link>
      ) : <span className={styles.paginationDisabled}>{t.next}</span>}
      <p className={styles.paginationStatus}>{t.page} {currentPage} {t.pageOf} {totalPages}</p>
    </nav>
  );
}

export function clampPage(value: string | null | undefined, totalItems: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const requested = Number.parseInt(value ?? "1", 10);
  const currentPage = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), totalPages) : 1;
  return { currentPage, totalPages, start: (currentPage - 1) * pageSize };
}
