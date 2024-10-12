const mongoose = require("mongoose");

const NotificationCompanySchema = new mongoose.Schema({
  CompanyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  StudentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  JobId: { type: mongoose.Schema.Types.ObjectId, ref: "Jobs" },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const NotificationCompanyModel = mongoose.model(
  "NotificationCompany",
  NotificationCompanySchema
);
module.exports = NotificationCompanyModel;
