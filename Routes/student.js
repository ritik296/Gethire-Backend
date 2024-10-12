const express = require("express");
const {
  uploadStudentData,
  GetTopPlacedUser,
  GetPlacedUser,
  GetAllUser,
  filter,
  GetByName,
  updateStudent,
  deleteStudentData,
} = require("../Controllers/student.js");
const path = require("path");
const multer = require("multer");
const router = express.Router();
const auth = require("../Middleware/Auth");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });
router.post("/upload", upload.single("file"), uploadStudentData);
router.get("/alluser", GetAllUser);
router.post("/search", GetByName);
router.post("/filter", filter);
router.get("/placedStudent", GetPlacedUser);
module.exports = router;
