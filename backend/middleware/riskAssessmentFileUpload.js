const multer = require("multer");

const allowedTypes = new Set([
  "application/pdf",

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

    return cb(new Error("PDF файл зөвшөөрнө"));
  },
});
