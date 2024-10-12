const express = require("express");
const { CompanyverifyToken } = require("../Middleware/VerifyToken");
const {
  RegisterCompany,
  CreateCompanyOtp,
  verifyotp,
  Resendotp,
  CompanyLogin,
  CompanyEmailOtpLoginVerify,
  GetCompanyprofile,
  UpdateCompanyProfile,
  CreateJob,
  GetAllJobs,
  GetAllJobswithApplication,
  UpdateJob,
  DeleteJob,
  ActiveInactiveJob,
  GetAllStudentsofajob,
  GetAllAppiedStudentsofajob,
  AddStudentToTeam,
  verifyEmailotp,
  GetAllApplicationofacompany,
  RejectJobApplication,
  GetAllRejectedStudentsofajob,
  shortlistJobApplication,
  GetAllshortlistStudentsofajob,
  GetAllshortlistStudentsofAllJobs,
  Updateassessment,
  ScheduleInterview,
  GetAllScheduleInterviewofajob,
  GetAllUpcomingInterviews,
  selectAndAddStudentToTeam,
  GetAllSelectedStudentsOfJob,
  GetAllSelectedStudents,
  Resultonpending,
  GetAllShortlistedStudents,
  GetCompanyTeamDetails,
  getAllEmployeesLeaveRequests,
  rejectLeaveRequest,
  approveLeaveRequest,
  getAllApprovedLeaves,
  getAllPendingLeaves,
  getAllRejectedLeaves,
  Createholiday,
  GetHolidaysByDate,
  getAllCompanies,
  GetSavedCandidates,
  SaveCandidate,
  removeCandidate,
  LoginCompanywithPassword,
  resetPassword,
  resetPasswordwithPassword,
  saveImportData,
  deleteImportData,
  assignImportData,
  getImportData,
  getImportDataById,
  getFunds,
  addFunds,
  getBalance,
  getAllCollege,
  interviewComplete,
} = require("../Controllers/CompayController");
const upload = require("../Middleware/multer");
const { GetAllStudents } = require("../Controllers/AdminController");
const { verifyToken } = require("otpless-node-js-auth-sdk");
const {
  getFilteredCandidates,
  markStudentAsNotInterested,
  inviteStudent,
} = require("../Controllers/JobInvitationController");
const { postOnLinkedin } = require("../Controllers/socialMediaPost");
const { getOnboarding,updateOnboarding } = require("../Controllers/OnboardingController");

const CompanyRouter = express.Router();

CompanyRouter.post("/verifyEmailotp", verifyEmailotp);
CompanyRouter.post("/RegisterCompany", RegisterCompany);
CompanyRouter.post("/resetpassword/:id", resetPassword);
CompanyRouter.post(
  "/resetpasswordwithpwd",
  CompanyverifyToken,
  resetPasswordwithPassword
);
CompanyRouter.post("/CreateCompanyOtp/:channel", CreateCompanyOtp);
CompanyRouter.post("/verifyotp", verifyotp);
CompanyRouter.post("/Resendotp", Resendotp);
CompanyRouter.post("/CompanyLogin", CompanyLogin);
CompanyRouter.post("/CompanyLoginwithpassword", LoginCompanywithPassword);
CompanyRouter.post("/CompanyEmailOtpLoginVerify", CompanyEmailOtpLoginVerify);
CompanyRouter.get("/GetCompanyprofile", CompanyverifyToken, GetCompanyprofile);
CompanyRouter.get("/GetAllStudents", CompanyverifyToken, GetAllStudents);
CompanyRouter.get(
  "/GetSavedCandidates",
  CompanyverifyToken,
  GetSavedCandidates
);
CompanyRouter.put(
  "/UpdateCompanyProfile",
  CompanyverifyToken,
  upload.fields([{ name: "image1" }, { name: "image2" }]),
  UpdateCompanyProfile
);

CompanyRouter.post("/CreateJob", CompanyverifyToken, CreateJob);
CompanyRouter.post("/savecandidate", CompanyverifyToken, SaveCandidate);
CompanyRouter.post("/removeCandidate", CompanyverifyToken, removeCandidate);
CompanyRouter.get("/GetAllJobs", CompanyverifyToken, GetAllJobs);
CompanyRouter.get(
  "/GetAllJobswithApplication",
  CompanyverifyToken,
  GetAllJobswithApplication
);
CompanyRouter.put("/UpdateJob/:id", CompanyverifyToken, UpdateJob);
CompanyRouter.delete("/DeleteJob/:id", CompanyverifyToken, DeleteJob);
CompanyRouter.get(
  "/ActiveInactiveJob/:id",
  CompanyverifyToken,
  ActiveInactiveJob
);
CompanyRouter.get(
  "/GetAllStudentsofajob/:id",
  CompanyverifyToken,
  GetAllStudentsofajob
);
CompanyRouter.get(
  "/GetAllAppiedStudentsofajob/:id",
  CompanyverifyToken,
  GetAllAppiedStudentsofajob
);
CompanyRouter.post("/AddStudentToTeam", CompanyverifyToken, AddStudentToTeam);
CompanyRouter.put(
  "/RejectJobApplication/:id",
  CompanyverifyToken,
  RejectJobApplication
);
CompanyRouter.get(
  "/GetAllRejectedStudentsofajob/:id",
  CompanyverifyToken,
  GetAllRejectedStudentsofajob
);
CompanyRouter.put(
  "/shortlistJobApplication/:id",
  CompanyverifyToken,
  shortlistJobApplication
);
CompanyRouter.get(
  "/GetAllshortlistStudentsofajob/:id",
  CompanyverifyToken,
  GetAllshortlistStudentsofajob
);
CompanyRouter.get(
  "/GetAllshortlistStudentsofAllJobs",
  CompanyverifyToken,
  GetAllshortlistStudentsofAllJobs
);
CompanyRouter.put(
  "/Updateassessment/:id",
  CompanyverifyToken,
  Updateassessment
);
CompanyRouter.put(
  "/ScheduleInterview/:id",
  CompanyverifyToken,
  ScheduleInterview
);
CompanyRouter.get(
  "/interview/interviewcomplete/:id",
  CompanyverifyToken,
  interviewComplete
);
CompanyRouter.get(
  "/GetAllScheduleInterviewofajob/:id",
  CompanyverifyToken,
  GetAllScheduleInterviewofajob
);
CompanyRouter.get(
  "/selectAndAddStudentToTeam/:id",
  CompanyverifyToken,
  selectAndAddStudentToTeam
);
CompanyRouter.get(
  "/GetAllSelectedStudentsOfJob/:id",
  CompanyverifyToken,
  GetAllSelectedStudentsOfJob
);
CompanyRouter.get(
  "/GetAllApplicationofacompany",
  CompanyverifyToken,
  GetAllApplicationofacompany
);
CompanyRouter.get(
  "/GetAllSelectedStudents",
  CompanyverifyToken,
  GetAllSelectedStudents
);
CompanyRouter.get(
  "/GetAllUpcomingInterviews",
  CompanyverifyToken,
  GetAllUpcomingInterviews
);
CompanyRouter.get("/Resultonpending", CompanyverifyToken, Resultonpending);
CompanyRouter.get(
  "/GetAllShortlistedStudents",
  CompanyverifyToken,
  GetAllShortlistedStudents
);
CompanyRouter.get(
  "/GetCompanyTeamDetails",
  CompanyverifyToken,
  GetCompanyTeamDetails
);
CompanyRouter.get(
  "/getAllEmployeesLeaveRequests",
  CompanyverifyToken,
  getAllEmployeesLeaveRequests
);
CompanyRouter.post(
  "/approveLeaveRequest",
  CompanyverifyToken,
  approveLeaveRequest
);
CompanyRouter.post(
  "/rejectLeaveRequest",
  CompanyverifyToken,
  rejectLeaveRequest
);
CompanyRouter.get(
  "/getAllApprovedLeaves",
  CompanyverifyToken,
  getAllApprovedLeaves
);
CompanyRouter.get(
  "/getAllPendingLeaves",
  CompanyverifyToken,
  getAllPendingLeaves
);
CompanyRouter.get(
  "/getAllRejectedLeaves",
  CompanyverifyToken,
  getAllRejectedLeaves
);
CompanyRouter.post("/Createholiday", CompanyverifyToken, Createholiday);
CompanyRouter.get("/GetHolidaysByDate", CompanyverifyToken, GetHolidaysByDate);
CompanyRouter.get("/getallcompanies", CompanyverifyToken, getAllCompanies);
CompanyRouter.get("/import", CompanyverifyToken, getImportData);
CompanyRouter.get("/import/:id", CompanyverifyToken, getImportDataById);
CompanyRouter.post("/import", CompanyverifyToken, saveImportData);
CompanyRouter.delete(
  "/import/delete/:id",
  CompanyverifyToken,
  deleteImportData
);
CompanyRouter.post("/import/assign", CompanyverifyToken, assignImportData);

// Funds
CompanyRouter.get("/wallet/transactions", CompanyverifyToken, getFunds);
CompanyRouter.get("/wallet/balance", CompanyverifyToken, getBalance);
CompanyRouter.post("/wallet/addfund", CompanyverifyToken, addFunds);

// college
CompanyRouter.get("/getallcollege", getAllCollege);

// invite
CompanyRouter.get("/getinvited/:jobId", getFilteredCandidates);
CompanyRouter.get("/getinvited/invite/:jobId/:studentId", inviteStudent);
CompanyRouter.get(
  "/getinvited/notintrest/:jobId/:studentId",
  markStudentAsNotInterested
);

// Share on social media

CompanyRouter.post("/share-linkedin/:id", CompanyverifyToken, postOnLinkedin);

// invite
CompanyRouter.get(
  "/get-onboarding/:jobId/:studentId/:companyId",
  getOnboarding
);
CompanyRouter.post("/update-onboarding/:id", updateOnboarding);

module.exports = CompanyRouter;
