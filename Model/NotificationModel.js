const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  CompanyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  StudentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  JobId: { type: mongoose.Schema.Types.ObjectId, ref: "Jobs" },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const NotificationModel = mongoose.model("Notification", NotificationSchema);
module.exports = NotificationModel;
