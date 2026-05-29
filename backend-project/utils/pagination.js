/**
 * Build pagination metadata from query params.
 * @param {object} query - req.query
 * @returns {{ page, limit, skip }}
 */
const getPagination = (query) => {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

/**
 * Build a paginated response object.
 */
const paginatedResponse = (data, total, page, limit) => ({
    success: true,
    data,
    page,
    totalPages: Math.ceil(total / limit),
    totalItems: total,
});

module.exports = { getPagination, paginatedResponse };
