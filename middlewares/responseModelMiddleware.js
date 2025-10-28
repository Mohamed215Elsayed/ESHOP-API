/**
 * ✅ Generic helper to safely add a BASE_URL prefix to image fields after init/save
 * @param {mongoose.Schema} schema - The Mongoose schema
 * @param {string} folder - Folder name under /uploads (e.g. 'brands', 'users')
 * @param {string|string[]} fields - Field(s) containing image filenames
 */
const addImageUrlHook = (schema, folder, fields) => {
  schema.post(['init', 'save'], function (doc) {
    if (!process.env.BASE_URL) return; // Avoid crash if not set

    const addPrefix = (filename) => `${process.env.BASE_URL}/uploads/${folder}/${filename}`;

    (Array.isArray(fields) ? fields : [fields]).forEach((field) => {
      const value = doc[field];
      if (!value) return;

      if (Array.isArray(value)) {
        doc[field] = value.map(addPrefix);
      } else {
        doc[field] = addPrefix(value);
      }
    });
  });
};

export default addImageUrlHook;

// export const addImageUrlHook = (schema, folder) => {
//   schema.post(['init', 'save'], function (doc) {
//     if (doc.image) {
//       doc.image = `${process.env.BASE_URL}/uploads/${folder}/${doc.image}`;
//     }
//   });
// };

// export const addImageCoverUrlHook = (schema, folder) => {
//   schema.post(['init', 'save'], function (doc) {
//     if (doc.imageCover) {
//       doc.imageCover = `${process.env.BASE_URL}/uploads/${folder}/${doc.imageCover}`;
//     }
//   });
// };

// export const addImagesUrlHook = (schema, folder) => {
//   schema.post(['init', 'save'], function (doc) {
//     if (doc.images) {
//       doc.images = doc.images.map((image) => `${process.env.BASE_URL}/uploads/${folder}/${image}`);
//     }
//   });
// };

// export const addProfileImgUrlHookForUser = (Schema, folder) => {
//   Schema.post(['init', 'save'], function (doc) {
//     if (doc.profileImg) {
//       doc.profileImg = `${process.env.BASE_URL}/uploads/${folder}/${doc.profileImg}`;
//     }
//   });
// };
