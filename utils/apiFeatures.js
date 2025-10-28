export default class ApiFeatures {
  /**
   * @param {import("mongoose").Query} mongooseQuery - Mongoose query instance
   * @param {Object} queryString - Request query object (req.query)
   */
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }

  /**
   * Filtering (supports gte, gt, lte, lt)
   */
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'keyword'];
    excludedFields.forEach((field) => delete queryObj[field]);

    // Convert query operators to MongoDB format
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in|nin|ne)\b/g, (match) => `$${match}`);

    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));
    return this;
  }

  /**
   * Sorting results
   */
  sort() {
    const { sort } = this.queryString;
    if (sort) {
      const sortBy = sort.split(',').join(' ');
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort('-createdAt');
    }
    return this;
  }

  /**
   * Limiting returned fields
   */
  limitFields() {
    const { fields } = this.queryString;
    if (fields) {
      const selectedFields = fields.split(',').join(' ');
      this.mongooseQuery = this.mongooseQuery.select(selectedFields);
    } else {
      this.mongooseQuery = this.mongooseQuery.select('-__v');
    }
    return this;
  }

  /**
   * Search by keyword (for Products, Brands, Categories, Users, etc.)
   * @param {string} modelName - Name of the model (e.g. "Products", "Brands")
   */
  search(modelName) {
    const { keyword } = this.queryString;
    if (!keyword) return this;

    // 1️⃣ Try text index search first (fastest for large data sets)
    this.mongooseQuery = this.mongooseQuery.find({
      $text: { $search: keyword },
    });

    // 2️⃣ Fallback to regex-based search if text index not available
    const regex = { $regex: keyword, $options: 'i' };

    // Define searchable fields per model
    const searchFields = {
      Product: [{ title: regex }, { description: regex }],
      Brand: [{ name: regex }],
      Category: [{ name: regex }],
      SubCategory: [{ name: regex }],
      User: [{ name: regex }, { email: regex }],
      Default: [{ name: regex }],
    };

    // Get relevant fields or default
    const fields = searchFields[modelName] || searchFields.Default;

    // Apply fallback
    this.mongooseQuery = this.mongooseQuery.find({ $or: fields });

    return this;
  }

  /**
   * Pagination
   * @param {number} countDocuments - Total number of documents in the collection
   */
  paginate(countDocuments = 0) {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 50;
    const skip = (page - 1) * limit;
    const endIndex = page * limit;

    const pagination = {
      currentPage: page,
      limit,
      numberOfPages: Math.ceil(countDocuments / limit),
    };

    if (endIndex < countDocuments) pagination.next = page + 1;
    if (skip > 0) pagination.prev = page - 1;

    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
    this.paginationResult = pagination;

    return this;
  }
}
