export interface PaginationOptions {
  page?: number;
  limit?: number;
  defaultLimit?: number;
  maxLimit?: number;
}

export interface ParsedPagination {
  page: number;
  limit: number;
}

export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export const parsePagination = (query: Record<string, unknown>): ParsedPagination => {
  const rawPage = typeof query.page === 'string' ? Number(query.page) : NaN;
  const rawLimit = typeof query.limit === 'string' ? Number(query.limit) : NaN;
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit = Number.isInteger(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 10;
  return { page, limit };
};

export const buildPagination = (total: number, page: number, limit: number): PaginationResult => {
  return {
    page,
    limit,
    total,
    pages: total === 0 ? 0 : Math.ceil(total / limit),
  };
};