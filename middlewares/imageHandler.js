import asyncHandler from 'express-async-handler';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { uploadMixOfImages, uploadSingleImage } from './uploadImageMiddleware-MemoryStorage.js';

/**
 * 🧩 Reusable Image Upload & Resize Middleware Generator
 *
 * @param {Object} options
 * @param {string} options.folder - Destination folder (e.g., 'products', 'brands')
 * @param {string} [options.prefix] - File prefix for generated filenames
 * @param {number} [options.width=600] - Resize width (for single images)
 * @param {number} [options.height=600] - Resize height (for single images)
 * @param {Array} [options.fields] - For multiple fields (example: [{ name: 'imageCover', maxCount: 1 }, { name: 'images', maxCount: 5 }])
 * @param {string} [options.fieldName='image'] - For single image mode
 */
export const createImageProcessor = ({
  folder,
  prefix,
  width, // = 1200,
  height, // = 1200, // = 1200, //600
  fields,
  fieldName = 'image',
}) => {
  // Choose the right multer upload mode
  const upload = fields ? uploadMixOfImages(fields) : uploadSingleImage(fieldName);

  const resize = asyncHandler(async (req, res, next) => {
    if (!req.files && !req.file) return next();
    const sharpOptions = {
      width,
      height,
      fit: 'contain', // هذا هو السر: يمنع القص ويحتوي الصورة بالكامل
      background: { r: 255, g: 255, b: 255, alpha: 1 }, // ملء الفراغات باللون الأبيض
    };
    // 🖼 SINGLE IMAGE CASE
    if (req.file) {
      const filename = `${prefix}-${uuidv4()}-${Date.now()}.jpeg`;
      await sharp(req.file.buffer)
        .resize(sharpOptions) //width, height
        .toFormat('jpeg')
        .jpeg({ quality: 97 })
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .toFile(`uploads/${folder}/${filename}`);

      req.body[fieldName] = filename;
    }

    // 📸 MULTIPLE IMAGES CASE (e.g. imageCover + images[])
    if (req.files) {
      // Single image field (like imageCover)
      if (req.files.imageCover?.[0]) {
        const filename = `${prefix}-cover-${uuidv4()}-${Date.now()}.jpeg`;
        await sharp(req.files.imageCover[0].buffer)
          .resize(sharpOptions) //.resize(width, height)
          .toFormat('jpeg')
          .jpeg({ quality: 97 })
          .toFile(`uploads/${folder}/${filename}`);
        req.body.imageCover = filename;
      }

      // Array of images field (like images[])
      if (req.files.images) {
        req.body.images = [];
        await Promise.all(
          req.files.images.map(async (file, i) => {
            const filename = `${prefix}-${uuidv4()}-${Date.now()}-${i + 1}.jpeg`;
            await sharp(file.buffer)
              .resize(sharpOptions) //.resize(width, height)
              .toFormat('jpeg')
              .jpeg({ quality: 97 })
              .toFile(`uploads/${folder}/${filename}`);
            req.body.images.push(filename);
          })
        );
      }
    }
    // 3. معالجة profileImg (للمستخدم)
    if (req.files.profileImg?.[0]) {
      const filename = `${prefix}-profile-${uuidv4()}-${Date.now()}.jpeg`;
      await sharp(req.files.profileImg[0].buffer)
        .resize(1000, 1000)
        .toFormat('jpeg')
        .jpeg({ quality: 100 })
        .toFile(`uploads/${folder}/${filename}`);
      req.body.profileImg = filename;
    }

    // 4. معالجة coverImg (للمستخدم)
    if (req.files.coverImg?.[0]) {
      const filename = `${prefix}-cover-${uuidv4()}-${Date.now()}.jpeg`;
      await sharp(req.files.coverImg[0].buffer)
        .resize(1000, 1000)
        .toFormat('jpeg')
        .jpeg({ quality: 100 })
        .toFile(`uploads/${folder}/${filename}`);
      req.body.coverImg = filename;
    }

    next();
  });

  return { upload, resize };
};
