const express = require("express");
const { StudentverifyToken } = require("../Middleware/VerifyToken");
const {
  addTestResult,
  getResultById,
  getAllTestResultsByMultiId,
  createAiTestResult,
  getAITestResultsByJobId,
  getAITestResultsByStudentId,
  getTestResultsByStudentId,
  submitAudio,
} = require("../Controllers/TestController");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const app = express();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });
const fs = require("fs");
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

router.get("/result/:id", getResultById);
router.get("/result/bystudentid/:id/:jobId", getTestResultsByStudentId);
router.get("/result/multiid/:id", getAllTestResultsByMultiId);
router.post("/result", StudentverifyToken, addTestResult);
router.post("/result/aitestresult", StudentverifyToken, createAiTestResult);
router.get("/result/aitestresult/byjobid/:id", getAITestResultsByJobId);
router.get(
  "/result/aitestresult/bystudentid/:id/:jobId",
  getAITestResultsByStudentId
);

router.post("/submitaudio", upload.single("audio"), submitAudio);

module.exports = router;
