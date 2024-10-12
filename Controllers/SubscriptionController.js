const asynchandler = require("express-async-handler");
const response = require("../Middleware/responseMiddlewares");
const SubscriptionModel = require("../Model/SubscriptionModel");

const CreateSubsUser = asynchandler(async (req, res) => {
  console.log(req.body);
  let data;
  return response.successResponse(res, data, "Subscribed successfully");
});

const CreateSubsCompany = asynchandler(async (req, res) => {
  console.log(req.body);
  let data;
  return response.successResponse(res, data, "Subscribed successfully");
});

module.exports = { CreateSubsUser, CreateSubsCompany };
