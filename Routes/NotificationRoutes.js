const express = require("express");
const router = express.Router();
const {
  StudentverifyToken,
  CompanyverifyToken,
} = require("../Middleware/VerifyToken");
const {
  getNotificationStd,
  deleteNotification,
  getNotificationCom,
  deleteCompanyNotification,
} = require("../Controllers/NotificationController");

router.get("/", StudentverifyToken, getNotificationStd);
router.get("/company", CompanyverifyToken, getNotificationCom);
router.get("/delete/:id", deleteNotification);
router.get("/delete/company/:id", deleteCompanyNotification);

module.exports = router;
