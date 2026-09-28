const multer = require("multer");

const { putMetric } = require("../services/cloudwatchMetrics.service");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    // Valid file type
    cb(null, true);
  } else {
    // Invalid file type
    putMetric("DocumentsUploadFailed");

    cb(
      new Error("Only PDF, JPG, JPEG and PNG files are allowed"),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = upload;