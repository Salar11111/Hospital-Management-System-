const parsePagination = (query) => {
  const rawPage = typeof query.page === 'string' ? Number(query.page) : NaN;
  const rawLimit = typeof query.limit === 'string' ? Number(query.limit) : NaN;
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit = Number.isInteger(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 10;
  return { page, limit };
};
const buildPagination = (total, page, limit) => {
  return {
    page,
    limit,
    total,
    pages: total === 0 ? 0 : Math.ceil(total / limit),
  };
};
export { buildPagination, parsePagination };
