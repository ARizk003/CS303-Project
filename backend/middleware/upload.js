const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: 'dmqw7igta',
  api_key: '472215833937423',
  api_secret: 'Y6Ptjhw24sIDk5gh_3xbtmLw6lA'
});

const combinedStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    if (file.fieldname === "pdf") {
      const safeName = file.originalname.split(".")[0].replace(/[^a-zA-Z0-9._-]/g, "_");
      return {
        folder: "E-Library-Books",
        resource_type: "raw",
        public_id: `${Date.now()}_${safeName}`,
      };
    } else {
      const safeName = file.originalname.split(".")[0].replace(/[^a-zA-Z0-9._-]/g, "_");
      return {
        folder: "E-Library-Covers",
        resource_type: "image",
        public_id: `${Date.now()}_${safeName}`,
      };
    }
  },
});

const combinedFilter = (_req, file, cb) => {
  if (file.fieldname === "pdf") {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(Object.assign(new Error("Only PDF files are allowed"), { code: "INVALID_TYPE" }), false);
    }
  } else if (file.fieldname === "cover") {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(Object.assign(new Error("Only image files are allowed"), { code: "INVALID_TYPE" }), false);
    }
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: combinedStorage,
  fileFilter: combinedFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const uploadBookFiles = (req, res, next) => {
  upload.fields([
    { name: "pdf",   maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ])(req, res, (err) => {
    if (err) return next(err);

    if (req.files && req.files["pdf"] && req.files["pdf"][0]) {
      req.pdfFile = req.files["pdf"][0];
    }
    if (req.files && req.files["cover"] && req.files["cover"][0]) {
      req.coverFile = req.files["cover"][0];
    }

    next();
  });
};

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

module.exports = { upload, uploadBookFiles, handleUploadError, cloudinary };