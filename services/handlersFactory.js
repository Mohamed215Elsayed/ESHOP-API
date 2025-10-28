import asyncHandler from 'express-async-handler';
import ApiError from '../utils/apiError.js';
import ApiFeatures from '../utils/apiFeatures.js';

/**
 * 🗑️ Delete one document by ID
 * @param {import("mongoose").Model} Model - Mongoose model
 */
export const deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const document = await Model.findByIdAndDelete(id);
    if (!document) {
      return next(new ApiError(`No document found for ID: ${id}`, 404));
    }
    // Trigger "remove" event when update document
    // document.remove();
    res.status(204).json({ status: 'success', data: null });
  });

/**
 * ✏️ Update one document by ID
 * @param {import("mongoose").Model} Model - Mongoose model
 */
export const updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true, // ✅ ensures validation rules are applied on update
    });

    if (!document) {
      return next(new ApiError(`No document found for ID: ${req.params.id}`, 404));
    }
    // Trigger "save" event when update document
    // document.save();// in model is better to use "save" event
    res.status(200).json({
      status: 'success',
      data: document,
    });
  });

/**
 * ➕ Create a new document
 * @param {import("mongoose").Model} Model - Mongoose model
 */
export const createOne = (Model) =>
  asyncHandler(async (req, res) => {
    const newDocument = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: newDocument,
    });
  });

/**
 * 🔍 Get one document by ID
 * @param {import("mongoose").Model} Model - Mongoose model
 * @param {Object} [populateOptions] - Optional population config
 */
export const getOne = (Model, populateOptions = null) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    let query = Model.findById(id);
    if (populateOptions) query = query.populate(populateOptions);

    const document = await query;

    if (!document) {
      return next(new ApiError(`No document found for ID: ${id}`, 404));
    }

    res.status(200).json({
      status: 'success',
      data: document,
    });
  });

/**
 * 📃 Get all documents (with filtering, pagination, sorting, field limiting, and search)
 * @param {import("mongoose").Model} Model - Mongoose model
 * @param {string} [modelName] - Model name for search configuration
 */
export const getAll = (Model, modelName = '') =>
  asyncHandler(async (req, res) => {
    // 1️⃣ Handle optional filters (useful for nested routes)
    // const filter = req.filterObj || {};
    let filter = {};
    if (req.filterObj) {
      filter = req.filterObj;
    }

    // 2️⃣ Count total documents (for pagination)
    const totalDocuments = await Model.countDocuments();

    // 3️⃣ Apply API features (filter, search, sort, limitFields, paginate)
    const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
      .filter()
      .search(modelName)
      .sort()
      .limitFields()
      .paginate(totalDocuments);

    const { mongooseQuery, paginationResult } = apiFeatures;
    const documents = await mongooseQuery;

    // 4️⃣ Send Response
    res.status(200).json({
      status: 'success',
      results: documents.length,
      pagination: paginationResult,
      data: documents,
    });
  });
