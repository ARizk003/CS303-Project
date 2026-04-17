const multer = require("multer");
const path   = require("path");
const fs     = require("fs");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },

  filename: (_req, file, cb) => {
    const safeName = path
      .basename(file.originalname)          
      .replace(/[^a-zA-Z0-9._-]/g, "_");    

    const uniqueName = `${Date.now()}_${safeName}`;
    cb(null, uniqueName);
  }
});


const fileFilter = (_req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(
      Object.assign(new Error("Only PDF files are allowed"), { code: "INVALID_TYPE" }),
      false
    );
  }
};


const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});

const handleUploadError = (err, _req, res, next) => {
  if (!err) return next();

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ msg: "File too large. Maximum size is 10MB." });
  }
  if (err.code === "INVALID_TYPE") {
    return res.status(400).json({ msg: err.message });
  }

  next(err);
};

module.exports = { upload, handleUploadError };