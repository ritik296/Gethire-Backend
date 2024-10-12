const mongoose = require("mongoose");

const OnboardingDetailsSchema = new mongoose.Schema({
  CompanyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  StudentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  JobId: { type: mongoose.Schema.Types.ObjectId, ref: "Jobs" },

  currentStep: {
    type: String,
    enum: [
      "Personal Information",
      "Employment Details",
      "Document Submission",
      "Access & IT Setup",
      "Orientation & Training",
      "Team Integration",
      "Company Policies & Benefits",
      "Offer Letter Template Selection",
      "Onboarding Completion",
    ],
    default: "Personal Information",
  },

  personalInfo: {
    fullName: { type: String },
    contactInformation: { type: String },
    residentialAddress: { type: String },
  },

  employmentDetails: {
    jobTitle: { type: String },
    department: { type: String },
    startDate: { type: Date },
  },

  documents: {
    employmentContract: { type: String },
    nda: { type: String },
    taxForms: { type: String },
    panCard: { type: String },
    aadharCard: { type: String },
    salarySlip: { type: String },
    bankStatement: { type: String },
  },

  accessITSetup: {
    emailAccount: { type: String },
    softwareAccess: { type: [String] },
  },

  orientationTraining: {
    orientationSchedule: { type: String },
    roleSpecificTraining: { type: String },
  },

  teamIntegration: {
    teamIntroduction: { type: String },
    reportingStructure: { type: String },
  },

  policiesBenefits: {
    employeeHandbook: { type: String },
  },

  offerLetterTemplate: {
    selectedTemplate: {
      type: String,
      enum: [
        "Standard Offer Letter",
        "Executive Offer Letter",
        "Internship Offer Letter",
        "Contractual Offer Letter",
      ],
    },
  },

  onboardingCompletion: {
    finalChecklist: { type: String },
    confirmation: { type: Boolean, default: false },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const OnboardingDetailsModel = mongoose.model(
  "OnboardingDetails",
  OnboardingDetailsSchema
);

module.exports = OnboardingDetailsModel;
