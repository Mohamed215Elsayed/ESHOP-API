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

    // console.log('🔹 Raw queryObj:', queryObj);
    // Convert query operators to MongoDB format
    const mongoQuery = {};

    Object.keys(queryObj).forEach((key) => {
      /**
       * 1️⃣ handle brand[in][], category[in][]
       */
      const inMatch = key.match(/^(\w+)\[in\]\[\]$/);
      if (inMatch) {
        const field = inMatch[1];
        const value = queryObj[key];

        mongoQuery[field] = {
          $in: Array.isArray(value) ? value : [value],
        };
        return;
      }

      /**
       * 2️⃣ handle price[gt], price[lte], etc
       */
      const rangeMatch = key.match(/^(\w+)\[(gte|gt|lte|lt)\]$/);
      if (rangeMatch) {
        const field = rangeMatch[1];
        const operator = `$${rangeMatch[2]}`;

        if (!mongoQuery[field]) mongoQuery[field] = {};
        mongoQuery[field][operator] = Number(queryObj[key]);
        return;
      }

      /**
       * 3️⃣ normal fields
       */
      mongoQuery[key] = queryObj[key];
    });

    // console.log('✅ Final Mongo Query:', mongoQuery);

    this.mongooseQuery = this.mongooseQuery.find(mongoQuery);
    return this;
  }
  /**
   * Sorting results
   */
  sort() {
    const { sort } = this.queryString;
    if (sort) {
      const sortBy = sort.split(',').join(' ') + ' _id'; // secondary sort by _id يضمن أن الترتيب ثابت دائماً.
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort('-createdAt _id'); //_id
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
    const regex = { $regex: keyword, $options: 'i' };

    const searchFields = {
      Product: [{ title: regex }, { description: regex }],
      Brand: [{ name: regex }],
      Category: [{ name: regex }],
      SubCategory: [{ name: regex }],
      User: [{ name: regex }, { email: regex }],
      Default: [{ name: regex }],
    };

    const fields = searchFields[modelName] || searchFields.Default;

    this.mongooseQuery = this.mongooseQuery.find({
      $or: fields,
      //     $or: [{ $text: { $search: keyword } }, { $or: fields }],
      //       $or: [
      //         { $text: { $search: keyword } }, // لو فيه Text Index
      //         { $or: fields }, // fallback regex
      //       ],
    });

    return this;
  }

  // search(modelName) {
  //   const { keyword } = this.queryString;
  //   if (!keyword) return this;

  //   // 1️⃣ Try text index search first (fastest for large data sets)
  //   this.mongooseQuery = this.mongooseQuery.find({
  //     $text: { $search: keyword },
  //   });

  //   // 2️⃣ Fallback to regex-based search if text index not available
  //   const regex = { $regex: keyword, $options: 'i' };

  //   // Define searchable fields per model
  //   const searchFields = {
  //     Product: [{ title: regex }, { description: regex }],
  //     Brand: [{ name: regex }],
  //     Category: [{ name: regex }],
  //     SubCategory: [{ name: regex }],
  //     User: [{ name: regex }, { email: regex }],
  //     Default: [{ name: regex }],
  //   };

  //   // Get relevant fields or default
  //   const fields = searchFields[modelName] || searchFields.Default;

  //   // Apply fallback
  //   this.mongooseQuery = this.mongooseQuery.find({ $or: fields });

  //   return this;
  // }
  /**
   * Pagination
   * @param {number} countDocuments - Total number of documents in the collection
   */
  paginate(totalDocuments = 0) {
    const page = Math.max(1, Number(this.queryString.page) || 1);
    let limit = Math.min(Number(this.queryString.limit) || 50, 100); // max limit = 100
    const skip = (page - 1) * limit;
    const endIndex = page * limit;

    const pagination = {
      currentPage: page,
      limit,
      //       numberOfPages: Math.ceil(totalDocuments / limit),
      numberOfPages: Math.ceil(totalDocuments / limit),
      hasNext: endIndex < totalDocuments,
      hasPrev: skip > 0,
      //     if (endIndex < totalDocuments) pagination.next = page + 1;
      //     if (skip > 0) pagination.prev = page - 1;
    };

    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
    this.paginationResult = pagination;

    return this;
  }
}
