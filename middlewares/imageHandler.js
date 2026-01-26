import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import sharp from 'sharp';
import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';
import { uploadMixOfImages, uploadSingleImage } from './uploadImageMiddleware-MemoryStorage.js';

export const createImageProcessor = ({ folder, prefix, fields, width = 600, height = 600 }) => {
  const multerFields = fields.map(f => ({
    name: f.name,
    maxCount: f.type === 'single' ? 1 : f.maxCount || 5
  }));

  const upload = uploadMixOfImages(multerFields); 

  const resize = asyncHandler(async (req, res, next) => {
    if (!req.files) return next();

    for (const f of fields) {
      const { name, type, width: w = width, height: h = height } = f;

      if (type === 'single' && req.files[name]?.[0]) {
        const fileBuffer = req.files[name][0].buffer;
        const filename = `${prefix}-${name}-${uuidv4()}-${Date.now()}.jpeg`;

        await sharp(fileBuffer)
          .resize(w, h)
          .toFormat('jpeg')
          .jpeg({ quality: 97 })
          .toFile(`uploads/${folder}/${filename}`);

        req.body[name] = filename;
      }

      if (type === 'multiple' && req.files[name]) {
        req.body[name] = [];
        await Promise.all(
          req.files[name].map(async (file, i) => {
            const filename = `${prefix}-${name}-${uuidv4()}-${Date.now()}-${i + 1}.jpeg`;
            await sharp(file.buffer)
              .resize(w, h)
              .toFormat('jpeg')
              .jpeg({ quality: 97 })
              .toFile(`uploads/${folder}/${filename}`);
            req.body[name].push(filename);
          })
        );
      }
    }

    next();
  });

  return { upload, resize };
};
