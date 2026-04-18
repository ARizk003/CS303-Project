const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: 'dmqw7igta', 
  api_key: '472215833937423', 
  api_secret: 'Y6Ptjhw24sIDk5gh_3xbtmLw6lA' 
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "E-Library-Books",
    resource_type: "raw", 
    public_id: (req, file) => {
      const safeName = file.originalname
        .split(".")[0]
        .replace(/[^a-zA-Z0-9._-]/g, "_");
      return `${Date.now()}_${safeName}`;
    },
  },
});

const fileFilter = (_req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(
      Object.assign(new Error("Only PDF files are allowed"), {
        code: "INVALID_TYPE",
      }),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, 
});

const handleUploadError = (err, _req, res, next) => {
  if (!err) return next();

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ msg: "File too large. Maximum size is 10MB." });
  }
  if (err.code === "INVALID_TYPE") {
    return res.status(400).json({ msg: err.message });
  }

  console.error("Cloudinary Upload Error:", err);
  res.status(500).json({ msg: "Cloud upload failed", error: err.message });
};

module.exports = { upload, handleUploadError };