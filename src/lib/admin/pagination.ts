/**
 * Every operational list is bounded. Content-heavy card lists start at 20,
 * while operational tables can opt into 25, 50 or 100 rows per page.
 */
export const ADMIN_PAGE_SIZES = [20, 25, 50, 100] as const;

export type AdminPageSize = (typeof ADMIN_PAGE_SIZES)[number];

export function getAdminPagination(input: { page?: string; pageSize?: string }, defaultSize: AdminPageSize = 25) {
  const requestedSize = Number(input.pageSize);
  const pageSize = ADMIN_PAGE_SIZES.includes(requestedSize as AdminPageSize) ? requestedSize as AdminPageSize : defaultSize;
  const page = Math.max(1, Math.floor(Number(input.page) || 1));
  return { page, pageSize, offset: (page - 1) * pageSize };
}

export function getAdminPageHref(pathname: string, query: Record<string, string | undefined>, page: number) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value);
  }
  params.set("page", String(Math.max(1, page)));
  return `${pathname}?${params.toString()}`;
}
