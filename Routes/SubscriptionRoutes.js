const express = require("express");
const {
  CreateSubsUser,
  CreateSubsCompany,
} = require("../Controllers/SubscriptionController");
const {
  StudentverifyToken,
  CompanyverifyToken,
} = require("../Middleware/VerifyToken");

const SubsRouter = express.Router();

SubsRouter.post("/student", CreateSubsUser);
SubsRouter.post("/company", CreateSubsCompany);

module.exports = SubsRouter;
