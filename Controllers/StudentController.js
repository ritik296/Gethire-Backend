const asynchandler = require("express-async-handler");
const response = require("../Middleware/responseMiddlewares");
const StudentModel = require("../Model/StudentModel");
const jwt = require("jsonwebtoken");
const { UserDetail } = require("otpless-node-js-auth-sdk");
const clientId = process.env.AUTH_CLIENT_ID || "";
const clientSecret = process.env.AUTH_CLIENT_SECRET || "";
const cloudinary = require("../Middleware/Cloudinary");
const nodemailer = require("nodemailer");
const JobModel = require("../Model/JobModel");
const JobApplyModel = require("../Model/JobApplyModel");
const BookmarkModel = require("../Model/BookmarkModel");
const TestModel = require("../Model/TestModel");
const StudentTestResultModel = require("../Model/TestResultofaStudent");
const NotificationCompanyModel = require("../Model/NotificationComModel");
const CompanyModel = require("../Model/CompanyModel");
const { sendMessage } = require("../Utils/whatsApp");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.Useremail,
    pass: process.env.GmailPass,
  },
});

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

//============================[Register Student  ]===========================//

const RegisterStudent = asynchandler(async (req, res, next) => {
  try {
    console.log(req.body);
    const {
      Name,
      Email,
      Number,
      Current_Salary,
      Degree,
      Expected_Salary,
      Experience,
      exprienceIn,
      highestQualification,
      jobTitles,
      locations,
      skills,
      values,
      youare,
    } = req.body;

    if (!Name) {
      return response.validationError(res, "Name is required");
    }
    if (!Email) {
      return response.validationError(res, "Email is required");
    }
    // if (!Number) {
    //   return response.validationError(res, "Number is required");
    // }

    const email = await StudentModel.findOne({ Email: Email });
    if (email) {
      return response.validationError(res, "Email alredy Exist ");
    }
    const number = await StudentModel.findOne({ Number: Number });
    if (number) {
      return response.validationError(res, "Number alredy Exist ");
    }

    const otp = generateOTP();

    let Skill_Set = [];
    if (skills) {
      for (const skill of skills) {
        Skill_Set.push({ Skill: skill });
      }
    }
    let Education = [{ Degree }];

    Student = new StudentModel({
      Name,
      Email,
      Number: `+91${Number}`,
      otp,
      Current_Salary,
      Education,
      Expected_Salary,
      Experience,
      Name,
      exprienceIn,
      highestQualification,
      jobTitles,
      locations,
      Skill_Set,
      values,
      youare,
      otp,
    });

    await Student.save();

    const token = jwt.sign({ StudentId: Student._id }, "Student");

    return response.successResponse(
      res,
      { Student: Student, token: token },
      "Student Register Successful"
    );
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error");
  }
});

//========================[Student Login api ]===========================

const CreateStudentOtp = asynchandler(async (req, res) => {
  try {
    const channel = req.params.channel;
    const { Number, Email, orderId, hash, expiry, otpLength } = req.body;
    if (!Number && !Email) {
      return res.status(400).send({
        success: false,
        error: "Either mobile or email is required",
      });
    }
    if (!channel) {
      return res.status(400).send({
        success: false,
        error: "Channel is required",
      });
    }
    let Student = await StudentModel.findOne({ Number: Number });
    if (!Student) {
      return res.status(400).send({
        status: false,
        message: "No Account Exist with this Number Please Sign up First",
      });
    }
    try {
      const response = await UserDetail.sendOTP(
        Number,
        Email,
        channel,
        hash,
        orderId,
        expiry,
        otpLength,
        clientId,
        clientSecret
      );
      console.log("Success", response);
      if (response?.errorMessage) {
        return res.status(500).send(response);
      }
      res.status(200).send({
        success: true,
        data: response,
      });
    } catch (error) {
      console.log("Error", error);
      res.status(500).send({
        success: false,
        error: error,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error: error,
    });
  }
});

const CreateStudentOtpforSignup = asynchandler(async (req, res) => {
  try {
    const channel = req.params.channel;
    const { Number, Email, orderId, hash, expiry, otpLength } = req.body;
    if (!Number && !Email) {
      return res.status(400).send({
        success: false,
        error: "Either mobile or email is required",
      });
    }
    if (!channel) {
      return res.status(400).send({
        success: false,
        error: "Channel is required",
      });
    }
    let Student;
    if (Number) {
      Student = await StudentModel.findOne({ Number: Number });
    } else if (Email) {
      Student = await StudentModel.findOne({ Email: Email });
    }
    if (Student) {
      return res.status(400).send({
        status: false,
        message: "Account Exist with this Credentials Please Login",
      });
    }
    try {
      const response = await UserDetail.sendOTP(
        Number,
        Email,
        channel,
        hash,
        orderId,
        expiry,
        otpLength,
        clientId,
        clientSecret
      );
      console.log("Success", response);
      if (response?.errorMessage) {
        return res.status(500).send(response);
      }
      res.status(200).send({
        success: true,
        data: response,
      });
    } catch (error) {
      console.log("Error", error);
      res.status(500).send({
        success: false,
        error: error,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error: error,
    });
  }
});

const verifyotpforsignup = asynchandler(async (req, res) => {
  const { orderId, otp, Number, Email } = req.body;

  if (!orderId || !otp) {
    return res.status(400).send({
      success: false,
      error: "Invalid request - orderId and otp are required",
    });
  }
  if (!Number && !Email) {
    return res.status(400).send({
      success: false,
      error: "Invalid request - mobile or email is required",
    });
  }

  try {
    const response = await UserDetail.verifyOTP(
      Email,
      Number,
      orderId,
      otp,
      clientId,
      clientSecret
    );

    if (response?.errorMessage) {
      return res.status(500).send(response);
    }
    if (response?.isOTPVerified == false) {
      return res.status(500).send(response);
    }
    return res.status(200).send({
      status: true,
      message: "OTP Verified",
    });
  } catch (err) {
    console.log("Error", err);
    res.status(500).send({
      success: false,
      error: err.message,
    });
  }
});

//==============================[Verify otp api]==========================//

const verifyotp = asynchandler(async (req, res) => {
  const { orderId, otp, Number, Email } = req.body;

  if (!orderId || !otp) {
    return res.status(400).send({
      success: false,
      error: "Invalid request - orderId and otp are required",
    });
  }
  if (!Number && !Email) {
    return res.status(400).send({
      success: false,
      error: "Invalid request - mobile or email is required",
    });
  }
  let Student = await StudentModel.findOne({ Number: Number });
  if (!Student) {
    return res.status(400).send({
      status: false,
      message: "No Account Exists with this Number. Please Sign up First",
    });
  }

  try {
    const response = await UserDetail.verifyOTP(
      Email,
      Number,
      orderId,
      otp,
      clientId,
      clientSecret
    );

    if (response?.errorMessage) {
      return res.status(500).send(response);
    }
    if (response?.isOTPVerified == false) {
      return res.status(500).send(response);
    }

    const token = jwt.sign(
      {
        StudentId: Student._id,
      },
      "Student"
    );

    return res.status(200).send({
      status: true,
      message: "Complny login successfull",
      data: Student,
      token: token,
      ...response,
    });
  } catch (err) {
    console.log("Error", err);
    res.status(500).send({
      success: false,
      error: err.message,
    });
  }
});

//========================[Resend Otp]===============================

const Resendotp = asynchandler(async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) {
    return res.status(400).send({
      success: false,
      error: "Order ID is required",
    });
  }
  try {
    const response = await UserDetail.resendOTP(
      orderId,
      clientId,
      clientSecret
    );
    console.log("Success", response);
    if (response?.errorMessage) {
      return res.status(500).send(response);
    }
    res.status(200).send({ success: true, ...response });
  } catch (error) {
    console.log("Error", error);
    res.status(500).send({
      success: false,
      error: error,
    });
  }
});

// =============================[Send Otp To Email ] ==========================

const StudentLogin = asynchandler(async (req, res) => {
  try {
    let data = req.body;
    let { Email } = data;

    let Student = await StudentModel.findOne({ Email: Email });

    if (!Student) {
      return res.status(400).send({
        status: false,
        message: "Email  is Invalid",
      });
    }

    const otp = generateOTP();

    await StudentModel.findOneAndUpdate({ Email }, { otp: otp });

    const mailOptions = {
      to: Email,
      subject: "OTP Verification",
      text: `Your OTP for account verification is: ${otp}`,
    };

    transporter.sendMail(mailOptions, async function (error, info) {
      if (error) {
        console.log(error);
        return response.internalServerError(res, "Error sending OTP");
      } else {
        return res.status(200).send({
          status: true,
          message: "OTP sent to email, please verify.",
        });
      }
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
});

// ================================[Verify Mail OTP LOgin]=============================

const StudentEmailOtpLoginVerify = asynchandler(async (req, res) => {
  try {
    const { Email, otp } = req.body;

    let Student = await StudentModel.findOne({ Email: Email });

    if (!Student) {
      return response.notFoundError(res, "Student not found");
    }

    if (Student.otp !== otp) {
      return response.errorResponse(res, "Invalid OTP", 404);
    }

    await StudentModel.findOneAndUpdate({ Email }, { isActive: true, otp: "" });

    const token = jwt.sign({ StudentId: Student._id }, "Student");

    return res.json({ Student, token, message: "Verify successfully" });
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error");
  }
});

//=====================================[Get Student Detail] ===========================

const GetStudentProfile = asynchandler(async (req, res) => {
  try {
    const Studentid = req.StudentId;
    const GetStudent = await StudentModel.findById(Studentid).populate(
      "aiResumes"
    );
    if (!GetStudent) {
      return Response.notFoundError(res, "Student Not Found");
    }

    return response.successResponse(
      res,
      GetStudent,
      "Get Student successfully"
    );
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error");
  }
});

//====================================[Update Student Profile]=======================

const UpdateStudentProfile = asynchandler(async (req, res) => {
  try {
    const Studentid = req.StudentId;
    const {
      Email,
      Number,
      Name,
      Website,
      Gender,
      languages,
      introductionVideo,
      highestQualification,
      Education,
      JobDetails,
      position_of_responsibility,
      Training_details,
      Projects,
      Skill_Set,
      Work_Samples,
      Expected_Salary,
      Current_Salary,
      Experience,
      Joining_Date,
      Additional_Info,
      Address,
      summary,
      gender,
      dob,
      jobTitles,
      locations,
    } = req.body;

    const GetStudent = await StudentModel.findById(Studentid);

    if (!GetStudent) {
      return Response.notFoundError(res, "Company Not Found");
    }

    let uploadImg1;

    if (req.files && req.files.image1 && req.files.image1[0]) {
      const uploadedFile = await cloudinary.uploader.upload(
        req.files.image1[0].path,
        {
          folder: "GetHire",
        }
      );
      if (uploadedFile) {
        uploadImg1 = uploadedFile.secure_url;
      }
    }

    let uploadImg2;

    if (req.files && req.files.image2 && req.files.image2[0]) {
      const uploadedFile = await cloudinary.uploader.upload(
        req.files.image2[0].path,
        {
          folder: "GetHire",
        }
      );
      if (uploadedFile) {
        uploadImg2 = uploadedFile.secure_url;
      }
    }
    let uploadvideo;

    if (req.files && req.files.image3 && req.files.image3[0]) {
      const uploadedFile = await cloudinary.uploader.upload(
        req.files.image3[0].path,
        {
          resource_type: "video",
          folder: "GetHire",
        }
      );
      if (uploadedFile) {
        uploadvideo = uploadedFile.secure_url;
      }
    }

    if (Email) {
      GetStudent.Email = Email;
    }
    if (Number) {
      GetStudent.Number = Number;
    }
    if (Name) {
      GetStudent.Name = Name;
    }
    if (Email) {
      GetStudent.Email = Email;
    }
    if (dob) {
      GetStudent.dob = dob;
    }
    if (locations) {
      GetStudent.locations = locations;
    }
    if (jobTitles) {
      GetStudent.jobTitles = jobTitles;
    }
    if (gender) {
      GetStudent.gender = gender;
    }
    if (summary) {
      GetStudent.summary = summary;
    }
    if (uploadImg1) {
      GetStudent.Image = uploadImg1;
    }
    if (uploadImg2) {
      GetStudent.Resume = uploadImg2;
    }
    if (Website) {
      GetStudent.Website = Website;
    }
    if (Gender) {
      GetStudent.Gender = Gender;
    }
    if (languages) {
      GetStudent.languages = languages;
    }
    if (uploadvideo) {
      GetStudent.introductionVideo = uploadvideo;
    }
    if (highestQualification) {
      GetStudent.highestQualification = highestQualification;
    }
    if (Education) {
      GetStudent.Education = Education;
    }
    if (JobDetails) {
      GetStudent.JobDetails = JobDetails;
    }
    if (position_of_responsibility) {
      GetStudent.position_of_responsibility = position_of_responsibility;
    }
    if (Training_details) {
      GetStudent.Training_details = Training_details;
    }
    if (Projects) {
      GetStudent.Projects = Projects;
    }
    if (Skill_Set) {
      GetStudent.Skill_Set = Skill_Set;
    }
    if (Work_Samples) {
      GetStudent.Work_Samples = Work_Samples;
    }
    if (Expected_Salary) {
      GetStudent.Expected_Salary = Expected_Salary;
    }
    if (Current_Salary) {
      GetStudent.Current_Salary = Current_Salary;
    }
    if (Experience) {
      GetStudent.Experience = Experience;
    }
    if (Joining_Date) {
      GetStudent.Joining_Date = Joining_Date;
    }
    if (Additional_Info) {
      GetStudent.Additional_Info = Additional_Info;
    }
    if (Address) {
      GetStudent.Address = Address;
    }

    const UpdatedStudent = await GetStudent.save();
    return response.successResponse(
      res,
      UpdatedStudent,
      "Student updated successfully"
    );
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error");
  }
});
const UpdateStudentSkillScore = asynchandler(async (req, res) => {
  try {
    const studentId = req.StudentId;
    const skillToUpdate = req.body;
    const student = await StudentModel.findById(studentId);

    if (!student) {
      return response.notFoundError(res, "Student Not Found");
    }
    if (!Array.isArray(student.Skill_Set)) {
      return response.badRequest(res, "Skill_Set is not an array");
    }
    const skillIndex = student.Skill_Set.findIndex(
      (skill) => skill._id.toString() === skillToUpdate._id.toString()
    );
    if (skillIndex !== -1) {
      student.Skill_Set[skillIndex].score = skillToUpdate.score;
    } else {
      student.Skill_Set.push(skillToUpdate);
    }
    const updatedStudent = await student.save();
    return response.successResponse(
      res,
      updatedStudent,
      "Student updated successfully"
    );
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error");
  }
});

//============================[ApplyForJob ]==============================

const ApplyForJob = asynchandler(async (req, res) => {
  try {
    const Studentid = req.StudentId;

    const { JobId, CompanyId, Resume, relocate } = req.body;

    const existingApplication = await JobApplyModel.findOne({
      StudentId: Studentid,
      JobId,
    });

    if (existingApplication) {
      return response.validationError(
        res,
        "You have already applied for this job."
      );
    }
    let uploadImg1;
    if (req.files && req.files.image1 && req.files.image1[0]) {
      const uploadedFile = await cloudinary.uploader.upload(
        req.files.image1[0].path,
        {
          folder: "GetHire",
        }
      );
      if (uploadedFile) {
        uploadImg1 = uploadedFile.secure_url;
      }
    }

    Job = new JobApplyModel({
      StudentId: Studentid,
      JobId,
      CompanyId,
      Resume,
      relocate,
      Custom_resume: uploadImg1,
    });
    let findJob = await JobModel.findById(JobId);
    let findCompany = await CompanyModel.findById(CompanyId);
    let notification = await NotificationCompanyModel.create({
      CompanyId: CompanyId,
      StudentId: Studentid,
      JobId: JobId,
      text: `A new Student apply in your posted job for ${findJob?.positionName}.`,
    });

    sendMessage(
      findCompany.Number,
      `1 student apply for your posted job ${findJob?.positionName}`
    );
    const savedjob = await Job.save();
    if (!savedjob) {
      return response.validationError(res, "Not Applied for job");
    }

    return response.successResponse(res, savedjob, "Job Applied completed.");
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error");
  }
});

//=================================[Get all Appied jobs of a user]======================

const GetAllAppiledJobsofaStudent = asynchandler(async (req, res) => {
  try {
    const Studentid = req.StudentId;

    const appliedJobs = await JobApplyModel.find({ StudentId: Studentid })
      .populate("CompanyId")
      .populate("JobId");

    if (!appliedJobs) {
      return response.notFound(res, "No applied jobs found for this student.");
    }

    return response.successResponse(
      res,
      appliedJobs,
      "Retrieved applied jobs successfully."
    );
  } catch (error) {
    console.error(error);
    return response.internalServerError(res, "Internal server error");
  }
});

//=================================[Get all Appied jobs interview of a user]======================
const GetAllJobinterviewofaStudent = async (req, res) => {
  try {
    const Studentid = req.StudentId;

    const appliedJobs = await JobApplyModel.find({
      StudentId: Studentid,
      isinterviewScheduled: true,
    })
      .populate("CompanyId")
      .populate("JobId");

    return response.successResponse(
      res,
      appliedJobs,
      "Retrieved applied jobs with scheduled interviews successfully."
    );
  } catch (error) {
    console.error(error);
    return response.internalServerError(res, "Internal server error");
  }
};
//======================================[Get Appiled job Ids api ]======================

const GetAllAppiledJobidsofaStudent = asynchandler(async (req, res) => {
  try {
    const StudentId = req.StudentId;

    const appliedJobs = await JobApplyModel.find({ StudentId })
      .populate("CompanyId")
      .populate("JobId");

    if (!appliedJobs || appliedJobs.length === 0) {
      return response.notFound(res, "No applied jobs found for this student.");
    }
    const appliedJobIds = appliedJobs.map((job) => job.JobId?._id);
    return response.successResponse(
      res,
      { appliedJobIds },
      "Retrieved applied job IDs successfully."
    );
  } catch (error) {
    // console.log(error);
    return response.internalServerError(res, "Internal server error");
  }
});

//========================================[AddToBookmark] ===============================

const AddToBookmark = asynchandler(async (req, res) => {
  try {
    const Studentid = req.StudentId;
    const { jobId } = req.body;

    const existingBookmark = await BookmarkModel.findOne({
      StudentId: Studentid,
    });

    if (existingBookmark) {
      const isAlreadyBookmarked = existingBookmark.bookmarkedJobs.some(
        (item) => item.jobId.toString() === jobId.toString()
      );

      if (isAlreadyBookmarked) {
        return response.validationError(res, "Job is already bookmarked.");
      }

      existingBookmark.bookmarkedJobs.push({ jobId });
      await existingBookmark.save();

      return response.successResponse(
        res,
        existingBookmark,
        "Job added to bookmarks successfully."
      );
    }

    const newBookmark = new BookmarkModel({
      StudentId: Studentid,
      bookmarkedJobs: [{ jobId }],
    });
    await newBookmark.save();

    return response.successResponse(
      res,
      newBookmark,
      "Job added to bookmarks successfully."
    );
  } catch (error) {
    console.error(error);
    return response.internalServerError(res, "Internal server error");
  }
});

//==========================================[RemoveToBookmark]===========================

const RemovefromBookmark = asynchandler(async (req, res) => {
  try {
    const Studentid = req.StudentId;
    const { jobId } = req.body;

    const userBookmark = await BookmarkModel.findOne({ StudentId: Studentid });

    if (!userBookmark) {
      return response.validationError(res, "No bookmarks found for the user.");
    }

    const indexToRemove = userBookmark.bookmarkedJobs.findIndex(
      (item) => item.jobId.toString() === jobId.toString()
    );

    if (indexToRemove === -1) {
      return response.validationError(
        res,
        "Job is not bookmarked by the user."
      );
    }

    userBookmark.bookmarkedJobs.splice(indexToRemove, 1);
    await userBookmark.save();

    return response.successResponse(
      res,
      userBookmark,
      "Job removed from bookmarks successfully."
    );
  } catch (error) {
    console.error(error);
    return response.internalServerError(res, "Internal server error");
  }
});

//=======================================[Get all bookmarked job array of a stundent]=====================

const getallbookmark = asynchandler(async (req, res) => {
  try {
    const StudentId = req.StudentId;
    const userBookmark = await BookmarkModel.findOne({ StudentId });

    if (!userBookmark) {
      return response.successResponse(
        res,
        { bookmarkedJobs: [] },
        "No bookmarks found for the user."
      );
    }

    const bookmarkedJobIds = userBookmark.bookmarkedJobs.map(
      (job) => job.jobId
    );

    return response.successResponse(
      res,
      { bookmarkedJobs: bookmarkedJobIds },
      "Get all bookmark jobs successfully."
    );
  } catch (error) {
    console.error(error);
    return response.internalServerError(res, "Internal server error");
  }
});

//========================================[Get All Bookmark Jobs of a Student]=================

const GetAllBookmarkjobsofaStudent = asynchandler(async (req, res) => {
  try {
    const Studentid = req.StudentId;

    const userBookmark = await BookmarkModel.findOne({ StudentId: Studentid })
      .populate("bookmarkedJobs.jobId")
      .populate({
        path: "bookmarkedJobs.jobId",
        populate: {
          path: "Company",
          model: "Company",
        },
      });

    if (!userBookmark) {
      return response.validationError(res, "No bookmarks found for the user.");
    }

    return response.successResponse(
      res,
      userBookmark,
      "Get all bookmark jobs successfully."
    );
  } catch (error) {
    console.error(error);
    return response.internalServerError(res, "Internal server error");
  }
});

// ==============================[Test answer api]=======================

const Create_StudentTestResult = asynchandler(async (req, res) => {
  try {
    const studentId = req.StudentId;
    const { testId, answers } = req.body;
    console.log(req.body);
    const test = await TestModel.findById(testId);

    if (!test) {
      return response.notFoundError(res, "Test not found");
    }

    let score = 0;

    const processedAnswers = answers.map((answer) => {
      const question = test.questions.id(answer.questionId);
      const isCorrect = question.correctAnswer === answer.answer;
      if (isCorrect) score += 1;
      return {
        questionId: answer.questionId,
        answer: answer.answer,
        isCorrect: isCorrect,
      };
    });

    const studentTestResult = new StudentTestResultModel({
      student: studentId,
      test: testId,
      answers: processedAnswers,
      score: score,
      scorePercentage: score,
    });

    await studentTestResult.save();

    return response.successResponse(
      res,
      studentTestResult,
      "Student test result created successfully"
    );
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal Server error");
  }
});

module.exports = {
  RegisterStudent,
  CreateStudentOtp,
  verifyotp,
  Resendotp,
  StudentLogin,
  StudentEmailOtpLoginVerify,
  GetStudentProfile,
  UpdateStudentProfile,
  ApplyForJob,
  GetAllAppiledJobsofaStudent,
  GetAllJobinterviewofaStudent,
  GetAllAppiledJobidsofaStudent,
  AddToBookmark,
  RemovefromBookmark,
  GetAllBookmarkjobsofaStudent,
  getallbookmark,
  Create_StudentTestResult,
  CreateStudentOtpforSignup,
  verifyotpforsignup,
  UpdateStudentSkillScore,
};
