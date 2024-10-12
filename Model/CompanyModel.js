const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema({
  Email: { type: String, require: true, unique: true, default: "" },
  Number: { type: String, require: true, unique: true, default: "" },
  Name: { type: String, require: true, default: "" },
  firstName: { type: String, default: "" },
  lastName: { type: String, require: true, default: "" },
  designation: { type: String, default: "" },
  otp: { type: String },
  Password: { type: String, require: true },
  Image: { type: String, require: true },
  BackgroundImage: { type: String, require: true },
  Title: { type: String, require: true },
  Discription: { type: String, require: true },
  Type: { type: String, require: true },
  Location: [{ type: String, require: true }],
  TotalEmployees: { type: String, require: true },
  Onsite: { type: String, require: true },
  ActiveJobs: { type: String, require: true },
  Websitelink: { type: String, require: true },
  Facebooklink: { type: String, require: true },
  Instagramlink: { type: String, require: true },
  About: { type: String, require: true },
  Industry: { type: String, require: true },
  balance: { type: Number, require: true, default: 0 },
  savedCandidates: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  Team: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  ],
  onboardinProcess: {
    releaseMethod: { type: String },
    offerLetterTemplate: { type: String },
    acceptanceMethod: { type: String },
    selectedDocuments: [{ type: String }],
    orientationFile: { type: String },
    orientationType: { type: String },
  },
  createdAt: { type: Date, default: Date.now },
});

const CompanyModel = mongoose.model("Company", CompanySchema);
module.exports = CompanyModel;
