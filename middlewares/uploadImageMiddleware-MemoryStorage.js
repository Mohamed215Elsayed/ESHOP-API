import multer from 'multer';
import ApiError from '../utils/apiError.js';

/**
 * ⚙️ Configure Multer for image uploads (memory storage)
 * - Stores files in memory (useful for cloud uploads like Cloudinary or S3)
 * - Validates MIME type (only images allowed)
 */
const createMulter = () => {
  // Store file data in memory buffer
  const storage = multer.memoryStorage();

  // File filter: accept only images
  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(new ApiError('Only image files are allowed!', 400), false);
    }
  };

  return multer({ storage, fileFilter });
};

/**
 * 🖼 Upload a single image (example field: "image" or "profileImg")
 * @param {string} fieldName - The name of the form field to upload
 */
export const uploadSingleImage = (fieldName) => createMulter().single(fieldName);

/**
 * 📸 Upload multiple images for different fields
 * Example usage:
 * uploadMixOfImages([
 *   { name: 'imageCover', maxCount: 1 },
 *   { name: 'images', maxCount: 5 }
 * ])
 */
export const uploadMixOfImages = (fieldsArray) => createMulter().fields(fieldsArray);
