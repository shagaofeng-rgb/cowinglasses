export const ADMIN_PAGE_SIZES = [25, 50, 100] as const;

export type AdminPageSize = (typeof ADMIN_PAGE_SIZES)[number];

export function getAdminPagination(input: { page?: string; pageSize?: string }, defaultSize: AdminPageSize = 25) {
  const requestedSize = Number(input.pageSize);
  const pageSize = ADMIN_PAGE_SIZES.includes(requestedSize as AdminPageSize) ? requestedSize as AdminPageSize : defaultSize;
  const page = Math.max(1, Math.floor(Number(input.page) || 1));
  return { page, pageSize, offset: (page - 1) * pageSize };
}
