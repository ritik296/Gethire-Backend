const asynchandler = require("express-async-handler");
const response = require("../Middleware/responseMiddlewares");
const NotificationModel = require("../Model/NotificationModel");
const NotificationCompanyModel = require("../Model/NotificationComModel");

const getNotificationStd = asynchandler(async (req, res) => {
  try {
    const studentId = req.StudentId;
    const notification = await NotificationModel.find({ StudentId: studentId })
      .populate("CompanyId")
      .populate("StudentId")
      .populate("JobId")
      .sort({ createdAt: -1 });
    return response.successResponse(
      res,
      notification,
      "Get notification successfull"
    );
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error");
  }
});

const getNotificationCom = asynchandler(async (req, res) => {
  try {
    const id = req.userId;
    const notification = await NotificationCompanyModel.find({ CompanyId: id })
      .populate("CompanyId")
      .populate("StudentId")
      .populate("JobId")
      .sort({ createdAt: -1 });
    return response.successResponse(
      res,
      notification,
      "Get notification successfull"
    );
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error");
  }
});

const deleteNotification = asynchandler(async (req, res) => {
  try {
    let data = await NotificationModel.findByIdAndDelete(req.params.id);
    return response.successResponse(
      res,
      data,
      "notification deleted successfull"
    );
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error");
  }
});

const deleteCompanyNotification = asynchandler(async (req, res) => {
  try {
    let data = await NotificationCompanyModel.findByIdAndDelete(req.params.id);
    return response.successResponse(
      res,
      data,
      "notification deleted successfull"
    );
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error");
  }
});

module.exports = {
  getNotificationStd,
  getNotificationCom,
  deleteNotification,
  deleteCompanyNotification,
};
