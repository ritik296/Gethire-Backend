const mongoose = require("mongoose");

const OnboaringProcessSchema = new mongoose.Schema({
  CompanyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  StudentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  JobId: { type: mongoose.Schema.Types.ObjectId, ref: "Jobs" },
  createdAt: { type: Date, default: Date.now },
});

const OnboaringProcessModel = mongoose.model("OnboaringProcess", OnboaringProcessSchema);
module.exports = OnboaringProcessModel;
