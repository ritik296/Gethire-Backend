const express = require("express");
const multer = require("multer");
const router = express.Router();
const {
  handleUserLogin,
  handleUserRegistration,
} = require("../Controllers/User.js");
const {
  uploadCourse,
  getCourse,
  deleteCourse,
  updateCourse,
  industryTalk,
  deleteIndustryTalk,
  getAllIndustryTalk,
  UpcomingEventController,
  DeleteEvents,
  WantToJoinUpcomingEvents,
  RemoveStudentFromUpcomingEvent,
  TopCoursesTraining,
  geteventall,
} = require("../Controllers/Trainings.js");
const {
  Invitation,
  ActiveProcessData,
  GetActiveProcessData,
  gethireplacment,
  GetTopPlacedUser,
} = require("../Controllers/Corporate");
const {
  createCollege,
  getColleges,
  updateCollegeById,
  getCollegepalcement,
  CollegeDataPlacementAdd,
  deleteCollegeById,
  eventUpload,
  getEventById,
} = require("../Controllers/CollegeDataCont");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });
const path = require("path");
router.post(
  "/uploadCourse",
  upload.fields([
    { name: "courseImage", maxCount: 1 },
    { name: "demoVideo", maxCount: 1 },
    { name: "Videos", maxCount: 10 },
  ]),
  uploadCourse
);
router.post("/login", handleUserLogin);
router.post("/register", handleUserRegistration);
//coprative
router.post("/invite", Invitation);
router.post("/activeProcess", ActiveProcessData);
router.get("/company-details", GetActiveProcessData);
router.get("/topplaced", GetTopPlacedUser);
router.get("/hireplacement", gethireplacment);
// traing
router.post("/uploadCourse", uploadCourse);
router.get("/getCourse", getCourse);
router.delete("/deleteCourse/:id", deleteCourse);
router.put("/updateCourse/:id", updateCourse);
// Industry Talk Routes
router.post("/industryTalk", industryTalk);
router.delete("/deleteIndustryTalk/:id", deleteIndustryTalk);
router.get("/getAllIndustryTalk", getAllIndustryTalk);
// Upcoming Event Routes
router.post("/UpcomingEvent", UpcomingEventController);
router.delete("/DeleteEvents/:id", DeleteEvents);
router.post("/WantToJoinUpcomingEvents", WantToJoinUpcomingEvents);
router.post("/RemoveStudentFromUpcomingEvent", RemoveStudentFromUpcomingEvent);
router.get("/getevent", geteventall);
// Top Courses Route
router.get("/TopCoursesTraining", TopCoursesTraining);
//college profile
router.post(
  "/collegesdata",
  upload.fields([
    { name: "college_img", maxCount: 1 },
    { name: "college_logo", maxCount: 1 },
  ]),
  createCollege
);
// Get all colleges
router.get("/colleges/:id", getColleges);
// Update college
router.put(
  "/collegesdata/:userId",
  upload.fields([
    { name: "college_img", maxCount: 1 },
    { name: "college_logo", maxCount: 1 },
  ]),
  updateCollegeById
);
// upload events
router.post("/collegeEvent/:id", upload.array("images", 10), eventUpload);
router.post("/getCollegeEvent/:id", getEventById);
router.post("/placmentcompany/:id", CollegeDataPlacementAdd);
router.get("/getplacmentcompany/:id", getCollegepalcement);
module.exports = router;
