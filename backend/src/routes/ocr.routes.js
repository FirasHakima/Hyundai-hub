const express = require("express");
const router = express.Router();
const multer = require("multer");
const ocrController = require("../controllers/ocr.controller");
const { auth } = require("../middlewares/auth");

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

router.post("/scan", auth, upload.array("images", 2), ocrController.scanDocument);

module.exports = router;
