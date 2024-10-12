const mongoose = require("mongoose");

const JobApplySchema = new mongoose.Schema({
  CompanyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  JobId: { type: mongoose.Schema.Types.ObjectId, ref: "Jobs" },
  StudentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  Custom_resume: { type: String, require: true },
  Resume: { type: mongoose.Schema.Types.ObjectId, ref: "AIResume" },
  status: {
    type: String,
    enum: ["pending", "shortlisted", "selected", "rejected"],
    default: "pending",
  },
  assessment: [
    {
      Round: { type: String, require: true },
      score: { type: String, require: true },
      scorePercentage: { type: Number, require: true },
      Date: { type: Date, default: Date.now },
      completedstatus: { type: Boolean, default: false },
      Notes: { type: String, require: true },
    },
  ],
  isshortlisted: { type: Boolean, default: false },
  isrejected: { type: Boolean, default: false },
  Application_stage: { type: String, require: true, default: "Round One" },
  interviewSchedule: {
    type: { type: String, require: true },
    date: { type: String, require: true },
    Time: { type: String, require: true },
    location: { type: String },
    notes: { type: String },
    meetLink: { type: String, require: true },
  },
  isinterviewScheduled: { type: Boolean, default: false },
  isInterviewcompleted: { type: Boolean, default: false },
  IsSelectedforjob: { type: Boolean, default: false },
  onboardingDocuments: [{ name: { type: String }, url: { type: String } }],
  onboardingDocumentsAvailable: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const JobApplyModel = mongoose.model("JobApply", JobApplySchema);
module.exports = JobApplyModel;
