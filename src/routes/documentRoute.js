const express = require("express");

const upload = require("../middleware/upload.middleware");
const documentController = require("../controllers/documentController");
const {authMiddleware} = require('../middleware/authMiddleware')
const {getDocumentsByUser, getDocument, deleteDocument} =require('../controllers/documentController')

const router = express.Router();

router.get("/user/:userId", authMiddleware, getDocumentsByUser);

router.get("/:id", authMiddleware, getDocument);

router.delete(
  "/:id",
  authMiddleware,
  deleteDocument
);

router.post(
  "/upload",
  authMiddleware,
  upload.single("document"),
  documentController.uploadDocument
);

module.exports = router;