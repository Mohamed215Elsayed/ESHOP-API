import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import ApiError from '../utils/apiError.js';
/* --------------------------------------------------------------------- */
// const upload = multer({ dest: 'uploads/categories' });
// export const uploadCategoryImage = upload.single('image');
/* -----------------------------------------------------------------------*/
const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/categories');
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split('/')[1];
    const filename = `category-${uuidv4()}-${Date.now()}.${ext}`;
    cb(null, filename);
  },
});
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new ApiError('Only image files are allowed!', 400), false);
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
export const uploadCategoryImage = upload.single('image');
