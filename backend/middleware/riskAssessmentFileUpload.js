const multer = require("multer");

const allowedTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

module.exports = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024,
    files: 5,
  },
  fileFilter: (req, file, cb) => {
    if (allowedTypes.has(file.mimetype)) {
      return cb(null, true);
    }

    return cb(new Error("PDF, Word, Excel, JPG, PNG, WEBP файл зөвшөөрнө"));
  },
});
