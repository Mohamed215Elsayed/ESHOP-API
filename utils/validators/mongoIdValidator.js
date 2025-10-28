import { check } from 'express-validator';

/**
 * Reusable validator for MongoDB Object IDs
 * @param {string} fieldName - The request field to validate (e.g., "id" or "categoryId")
 * @param {string} label - A human-readable label for error messages (e.g., "Category", "Product")
 */
export const mongoIdValidator = (fieldName = 'id', label = 'Document') =>
  check(fieldName).isMongoId().withMessage(`Invalid ${label} ID format`);
