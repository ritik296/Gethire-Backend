const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
  Company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
  },
  companyName: { type: String },
  // Common
  type: { type: String },
  positionName: { type: String },
  description: { type: String },
  skillsRequired: { type: [String] },
  shift: { type: String },
  location: { type: String },
  openings: { type: Number },
  numOfDays: { type: Number },
  currency: { type: String },
  salaryType: { type: String },
  minEducation: { type: String },
  englishLevel: { type: String },
  expRequired: { type: String },
  incentive: { type: Number },
  perks: { type: [String] },
  responsibilities: { type: String },
  finalInterview: { type: {} },
  videoInterview: { type: {} },
  skillAssessment: [],
  videoQuestions: [],
  JobActive: { type: Boolean, default: true },
  rounds: [
    {
      Round: { type: Number },
      Assessment: { type: String },
    },
  ],
  // Internship
  internshipType: { type: String },
  internshipStart: { type: String },
  internshipDuration: { type: Number },
  internshipDurationFrequency: { type: String },
  stipendType: { type: String },
  stipend: { type: Number },
  ppo: { type: Boolean },
  // Job
  jobType: { type: String },
  minExp: { type: Number },
  maxExp: { type: Number },
  maxSalary: { type: Number, default: null },
  minSalary: { type: Number, default: null },
  jobFrequency: { type: String },
  createdAt: { type: Date, default: Date.now },
  invitedCandidates: [
    {
      candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
      status: {
        type: String,
        enum: ["accepted", "rejected", "pending"],
        default: "pending",
      },
    },
  ],
  notInterestedCandidates: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  ],
  postedLinkedin: { type: Boolean, default: false },
});

const JobModel = mongoose.model("Jobs", JobSchema);
module.exports = JobModel;
