const asynchandler = require("express-async-handler");
const response = require("../Middleware/responseMiddlewares");
const OnboardingDetailsModel = require("../Model/OnboardingDetailsModel");

const getOnboarding = asynchandler(async (req, res) => {
  try {
    const { jobId, studentId, companyId } = req.params;
    if (!jobId || !studentId || !companyId) {
      return response.notFoundError(
        res,
        "jobId, studentId, and companyId are required"
      );
    }
    let onboardingDetails = await OnboardingDetailsModel.findOne({
      JobId: jobId,
      StudentId: studentId,
      CompanyId: companyId,
    })
      .populate("CompanyId")
      .populate("StudentId")
      .populate("JobId");
    if (!onboardingDetails) {
      onboardingDetails = new OnboardingDetailsModel({
        JobId: jobId,
        StudentId: studentId,
        CompanyId: companyId,
        currentStep: "Personal Information",
        personalInfo: {},
        employmentDetails: {},
        documents: {},
      });

      await onboardingDetails.save();
    }

    return response.successResponse(
      res,
      onboardingDetails,
      "Get Onboarding successfull"
    );
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error");
  }
});

const updateOnboarding = asynchandler(async (req, res) => {
  try {
    const { id } = req.params;

    const onboardingDetails = await OnboardingDetailsModel.findById(id);

    if (req.files) {
      if (req.files.employmentContract) {
        onboardingDetails.documents.employmentContract =
          req.files.employmentContract[0].path;
      }
      if (req.files.nda) {
        onboardingDetails.documents.nda = req.files.nda[0].path;
      }
      if (req.files.taxForms) {
        onboardingDetails.documents.taxForms = req.files.taxForms[0].path;
      }
      if (req.files.panCard) {
        onboardingDetails.documents.panCard = req.files.panCard[0].path;
      }
      if (req.files.aadharCard) {
        onboardingDetails.documents.aadharCard = req.files.aadharCard[0].path;
      }
      if (req.files.salarySlip) {
        onboardingDetails.documents.salarySlip = req.files.salarySlip[0].path;
      }
      if (req.files.bankStatement) {
        onboardingDetails.documents.bankStatement =
          req.files.bankStatement[0].path;
      }
      if (req.files.additionalDocument) {
        onboardingDetails.documents.additionalDocument =
          req.files.additionalDocument[0].path;
      }
      if (req.files.additionalDocument2) {
        onboardingDetails.documents.additionalDocument2 =
          req.files.additionalDocument2[0].path;
      }
      if (req.files.bankStatement) {
        onboardingDetails.documents.offerLetterTemplate =
          req.files.offerLetterTemplate[0].path;
      }
      if (req.files.employeeHandbook) {
        onboardingDetails.documents.employeeHandbook =
          req.files.employeeHandbook[0].path;
      }
      if (req.files.roleSpecificTraining) {
        onboardingDetails.documents.roleSpecificTraining =
          req.files.roleSpecificTraining[0].path;
      }
      if (req.files.orientationSchedule) {
        onboardingDetails.documents.orientationSchedule =
          req.files.orientationSchedule[0].path;
      }
    }

    if (req.body.personalInfo) {
      onboardingDetails.personalInfo = {
        ...onboardingDetails.personalInfo,
        ...req.body.personalInfo,
      };
    }

    if (req.body.employmentDetails) {
      onboardingDetails.employmentDetails = {
        ...onboardingDetails.employmentDetails,
        ...req.body.employmentDetails,
      };
    }

    if (req.body.currentStep) {
      onboardingDetails.currentStep = req.body.currentStep;
    }
    console.log(req.body);
    console.log(onboardingDetails)
    await onboardingDetails.save();
    response.successResponse(res, onboardingDetails, "Onboarding Updated");
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error");
  }
});

module.exports = { getOnboarding, updateOnboarding };
