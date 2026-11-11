const multer = require("multer");

const upload = multer({
    storage: multer.memoryStorage(),

    limits:{
        fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
        files: 5, // Limit number of files to 5
    },

    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

         if(allowedTypes.includes(file.mimetype)){
            cb(null, true);
        } else cb(new Error("Зөвхөн JPG, PNG, WEBP зураг зөвшөөрнө"));
    },
})

module.exports = upload;