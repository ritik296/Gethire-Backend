const asynchandler = require("express-async-handler");
const response = require("../Middleware/responseMiddlewares");
const CompanyModel = require("../Model/CompanyModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { UserDetail } = require("otpless-node-js-auth-sdk");
const clientId = process.env.AUTH_CLIENT_ID || "";
const clientSecret = process.env.AUTH_CLIENT_SECRET || "";
const cloudinary = require("../Middleware/Cloudinary");
const nodemailer = require("nodemailer");
const Notification = require("../Model/NotificationModel");
const JobModel = require("../Model/JobModel");
const TestModel = require("../Model/TestModel");
const JobApplyModel = require("../Model/JobApplyModel");
const EmployeeModel = require("../Model/EmployeeModel");
const HolidaysModel = require("../Model/HolidaysModel");
const ImportedApplicationModel = require("../Model/ImportedApplicationModel");
const CompanyFundsTransModel = require("../Model/CompanyFundsTrans");
const StudentModel = require("../Model/StudentModel");
const moment = require("moment");
const {
  CollegeData,
  CollegeEvent,
  Placementc,
} = require("../Model/CollegeData");
const { sendMessage } = require("../Utils/whatsApp");
const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Set credentials with the refresh token
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

async function refreshAccessToken() {
  try {
    const { credentials } = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(credentials);
    console.log("New access token:", credentials.access_token);
  } catch (error) {
    // console.error("Error refreshing access token:", error);
  }
}

refreshAccessToken();

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

//=========================[Verify Email] =====================================

const verifyEmailotp = asynchandler(async (req, res) => {
  try {
    let data = req.body;
    let { Email, otp } = data;

    if (!Email && !otp) {
      return response.validationError(res, "Email and Otp is required");
    }

    let company = await CompanyModel.findOne({ Email });
    if (company) {
      return response.validationError(res, "Email Id Already Exist !");
    }

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

//============================[Register Company  ]===========================//

const RegisterCompany = asynchandler(async (req, res, next) => {
  try {
    const { Name, Email, Number, Password, firstName, lastName } = req.body;

    if (!Name) {
      return response.validationError(res, "Name is required");
    }
    if (!lastName) {
      return response.validationError(res, "Name is required");
    }
    if (!Email) {
      return response.validationError(res, "lastName is required");
    }
    if (!Number) {
      return response.validationError(res, "Number is required");
    }
    if (!Password) {
      return response.validationError(res, "Number is required");
    }

    const otp = generateOTP();

    const email = await CompanyModel.findOne({ Email: Email });
    if (email) {
      return response.validationError(res, "Email alredy Exist ");
    }
    const number = await CompanyModel.findOne({ Number: Number });
    if (number) {
      return response.validationError(res, "Number alredy Exist ");
    }

    const hashedPassword = await bcrypt.hash(Password, 10);

    Company = new CompanyModel({
      Name,
      firstName,
      lastName,
      Email,
      Number,
      Password: hashedPassword,
      otp,
    });

    await Company.save();

    const token = jwt.sign({ CompanyId: Company._id }, "company");

    return response.successResponse(
      res,
      { Company: Company, token: token },
      "Register Successful"
    );
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error");
  }
});

const LoginCompanywithPassword = asynchandler(async (req, res, next) => {
  try {
    const { Email, Number, Password } = req.body;

    if (!Email && !Number) {
      return response.validationError(res, "Email and Phone are required");
    }

    if (!Password) {
      return response.validationError(res, "Password is required");
    }
    let user;
    if (Email) {
      user = await CompanyModel.findOne({ Email: Email });
    }
    if (Number) {
      user = await CompanyModel.findOne({ Number: Number });
    }
    if (!user) {
      return response.notFoundError(res, "Company not found");
    }
    const passwordMatch = await bcrypt.compare(Password, user.Password);
    if (!passwordMatch) {
      return response.validationError(res, "Incorrect password");
    }
    const token = jwt.sign(
      {
        userId: user._id,
      },
      "company"
    );

    return res.status(200).send({
      status: true,
      message: "Complny login successfull",
      data: user,
      token: token,
      ...response,
    });
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error");
  }
});

//========================[Login api ]===========================

const CreateCompanyOtp = asynchandler(async (req, res) => {
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
    let user = await CompanyModel.findOne({ Number: Number });
    if (!user) {
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
  let user = await CompanyModel.findOne({ Number: Number });
  if (!user) {
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
        userId: user._id,
      },
      "company"
    );

    return res.status(200).send({
      status: true,
      message: "Complny login successfull",
      data: user,
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

const CompanyLogin = asynchandler(async (req, res) => {
  try {
    let data = req.body;
    let { Email } = data;

    let user = await CompanyModel.findOne({ Email: Email });

    if (!user) {
      return res.status(400).send({
        status: false,
        message: "Email  is Invalid",
      });
    }

    const otp = generateOTP();

    await CompanyModel.findOneAndUpdate({ Email }, { otp: otp });

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

const CompanyEmailOtpLoginVerify = asynchandler(async (req, res) => {
  try {
    const { Email, otp } = req.body;

    let user = await CompanyModel.findOne({ Email: Email });

    if (!user) {
      return response.notFoundError(res, "User not found");
    }

    if (user.otp !== otp) {
      return response.errorResponse(res, "Invalid OTP", 404);
    }

    await CompanyModel.findOneAndUpdate({ Email }, { isActive: true, otp: "" });

    const token = jwt.sign({ userId: user._id }, "company");

    return res.json({ user, token, message: "Verify successfully" });
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error");
  }
});

const resetPassword = asynchandler(async (req, res, next) => {
  try {
    const { Password } = req.body;

    if (!Password) {
      return response.validationError(res, "Password is required");
    }
    let user = await CompanyModel.findById(req.params.id);
    if (!user) {
      return response.notFoundError(res, "Company not found");
    }
    const hashedPassword = await bcrypt.hash(Password, 10);
    user.Password = hashedPassword;
    user.save();

    const token = jwt.sign(
      {
        userId: user._id,
      },
      "company"
    );

    return res.status(200).send({
      status: true,
      message: "Password Reset successfull",
      data: user,
      token: token,
      ...response,
    });
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error");
  }
});
const resetPasswordwithPassword = asynchandler(async (req, res) => {
  try {
    const { Password, newPassword } = req.body;
    const companyId = req.userId;
    if (!Password) {
      return response.validationError(res, "Password is required");
    }
    let user = await CompanyModel.findById(companyId);
    if (!user) {
      return response.notFoundError(res, "Company not found");
    }
    const passwordMatch = await bcrypt.compare(Password, user.Password);
    if (!passwordMatch) {
      return response.validationError(res, "Password is Not Match");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.Password = hashedPassword;
    user.save();

    return res.status(200).send({
      status: true,
      message: "Password Reset successfull",
    });
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error");
  }
});

//====================================[Get Company Details]========================

const GetCompanyprofile = async (req, res) => {
  try {
    const companyId = req.userId;

    const company = await CompanyModel.findById(companyId).populate({
      path: "Team",
      populate: {
        path: "studentId",
      },
    });

    if (!company) {
      return response.notFoundError(res, "Company not found.");
    }

    return response.successResponse(
      res,
      company,
      "Company details retrieved successfully."
    );
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error.");
  }
};

//====================================[Update Company Profile]=======================

const UpdateCompanyProfile = asynchandler(async (req, res) => {
  try {
    const Companyid = req.userId;
    const {
      Email,
      Number,
      Name,
      firstName,
      lastName,
      designation,
      Title,
      Discription,
      Type,
      Location,
      TotalEmployees,
      Onsite,
      ActiveJobs,
      Websitelink,
      Facebooklink,
      Instagramlink,
      About,
      Industry,
    } = req.body;
    const GetCompany = await CompanyModel.findById(Companyid);
    if (!GetCompany) {
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

    if (Email) {
      GetCompany.Email = Email;
    }
    if (Number) {
      GetCompany.Number = Number;
    }
    if (firstName) {
      GetCompany.firstName = firstName;
    }
    if (lastName) {
      GetCompany.lastName = lastName;
    }
    if (designation) {
      GetCompany.designation = designation;
    }
    if (Name) {
      GetCompany.Name = Name;
    }
    if (Email) {
      GetCompany.Email = Email;
    }
    if (uploadImg1) {
      GetCompany.Image = uploadImg1;
    }
    if (uploadImg2) {
      GetCompany.BackgroundImage = uploadImg2;
    }
    if (Title) {
      GetCompany.Title = Title;
    }
    if (Discription) {
      GetCompany.Discription = Discription;
    }
    if (Type) {
      GetCompany.Type = Type;
    }
    if (Location) {
      GetCompany.Location = Location;
    }
    if (TotalEmployees) {
      GetCompany.TotalEmployees = TotalEmployees;
    }
    if (Onsite) {
      GetCompany.Onsite = Onsite;
    }
    if (ActiveJobs) {
      GetCompany.ActiveJobs = ActiveJobs;
    }
    if (Websitelink) {
      GetCompany.Websitelink = Websitelink;
    }
    if (Facebooklink) {
      GetCompany.Facebooklink = Facebooklink;
    }
    if (Instagramlink) {
      GetCompany.Instagramlink = Instagramlink;
    }
    if (About) {
      GetCompany.About = About;
    }
    if (Industry) {
      GetCompany.Industry = Industry;
    }

    const UpdatedCompany = await GetCompany.save();

    return response.successResponse(
      res,
      UpdatedCompany,
      "Company updated successfully"
    );
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error");
  }
});

//===================================[Create Job ]=============================

const CreateJob = asynchandler(async (req, res) => {
  try {
    const Companyid = req.userId;
    const {
      type,
      internshipType,
      jobType,
      internshipDuration,
      stipendType,
      internshipDurationFrequency,
      internshipStart,
      positionName,
      location,
      minSalary,
      maxSalary,
      minExp,
      maxExp,
      currency,
      skillsRequired,
      responsibilities,
      rounds,
      numOfDays,
      shift,
      jobFrequency,
      ppo,
      openings,
      perks,
      skillAssessment,
      finalInterview,
      videoInterview,
      videoQuestions,
      salaryType,
      minEducation,
      englishLevel,
      expRequired,
      incentive,
      description,
    } = req.body;

    if (!positionName) {
      return response.validationError(res, "positionName is required");
    }
    if (!location) {
      return response.validationError(res, "location is required");
    }

    let company = await CompanyModel.findById(Companyid);
    if (!company) {
      return response.validationError(res, "Company not found");
    }

    let jobData = {
      Company: company._id,
      description,
      companyName: company.Name,
      type,
      positionName,
      location,
      currency,
      skillsRequired,
      responsibilities,
      rounds,
      numOfDays,
      videoQuestions,
      shift,
      perks,
      skillAssessment,
      finalInterview,
      videoInterview,
      salaryType,
      minEducation,
      englishLevel,
      expRequired,
      incentive,
    };

    if (type === "internship") {
      jobData = {
        ...jobData,
        internshipType,
        internshipStart,
        internshipDuration,
        internshipDurationFrequency,
        stipendType,
        stipend: req.body.stipend,
        ppo,
      };
    } else if (type === "job") {
      jobData = {
        ...jobData,
        jobType,
        minExp,
        maxExp,
        minSalary,
        maxSalary,
        jobFrequency,
        openings,
      };
    }
    let newJob = new JobModel(jobData);
    await newJob.save();

    return response.successResponse(
      res,
      newJob,
      "New job created successfully"
    );
  } catch (error) {
    console.error(error);
    return response.internalServerError(res, "Internal server error");
  }
});

// =================================[Get a Company's All Jobs]=========================

const GetAllJobs = asynchandler(async (req, res) => {
  try {
    const Companyid = req.userId;
    console.log(Companyid);
    const GetAllJobsofacompany = await JobModel.find({
      Company: Companyid,
    }).sort({ createdAt: -1 });

    return response.successResponse(
      res,
      GetAllJobsofacompany,
      "Get all Jobs of a company "
    );
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error");
  }
});

//================================[GetAllJobswithApplication]===============================

const GetAllJobswithApplication = async (req, res) => {
  try {
    const Companyid = req.userId;

    const GetAllJobsofacompany = await JobModel.find({
      Company: Companyid,
    }).sort({ createdAt: -1 });
    const jobsWithApplicationCount = await Promise.all(
      GetAllJobsofacompany.map(async (job) => {
        const totalApplicationCount = await JobApplyModel.countDocuments({
          JobId: job._id,
        });
        const shortlistedApplicationCount = await JobApplyModel.countDocuments({
          JobId: job._id,
          isshortlisted: true,
        });
        const selectedStudentCount = await JobApplyModel.countDocuments({
          JobId: job._id,
          IsSelectedforjob: true,
        });
        const rejectedStudentCount = await JobApplyModel.countDocuments({
          JobId: job._id,
          isrejected: true,
        });

        const jobWithCount = {
          ...job.toObject(),
          totalApplicationCount: totalApplicationCount,
          shortlistedApplicationCount: shortlistedApplicationCount,
          selectedStudentCount: selectedStudentCount,
          rejectedStudentCount: rejectedStudentCount,
        };

        return jobWithCount;
      })
    );

    return response.successResponse(
      res,
      jobsWithApplicationCount,
      "Get all Jobs of a company with application count"
    );
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error");
  }
};

//=======================================[update Job ]========================

const UpdateJob = asynchandler(async (req, res) => {
  try {
    const Companyid = req.userId;
    const { id } = req.params;
    console.log(req.body);
    const GetJob = await JobModel.findById(id);

    if (!GetJob) {
      return response.notFoundError(res, "Job Not found");
    }

    for (const [key, value] of Object.entries(req.body)) {
      if (value) {
        GetJob[key] = value;
      }
    }

    const Updatedjob = await GetJob.save();

    return response.successResponse(
      res,
      Updatedjob,
      "Updatedjob updated successfully"
    );
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error");
  }
});

//=================================[delete Job]=================================

const DeleteJob = asynchandler(async (req, res) => {
  try {
    const Companyid = req.userId;
    const { id } = req.params;

    const Deletejob = await JobModel.findByIdAndDelete(id);

    if (!Deletejob) {
      return response.notFoundError(res, "Job Not Found");
    }

    return response.successResponse(res, Deletejob, "Job deleted completed");
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error");
  }
});

//==========================================[Active Inactive job]====================================

const ActiveInactiveJob = asynchandler(async (req, res) => {
  try {
    const Companyid = req.userId;
    const { id } = req.params;

    const job = await JobModel.findById(id);

    if (!job) {
      return response.notFoundError(res, " Job Not found");
    }
    job.JobActive = !job.JobActive;

    await job.save();

    return response.successResponse(
      res,
      job,
      "Job status updated successfully"
    );
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error");
  }
});

//================================[Add Student To Team]=========================

const AddStudentToTeam = asynchandler(async (req, res) => {
  try {
    const companyId = req.userId;
    const { studentId, role, salary, Name, Email, status } = req.body;

    const company = await CompanyModel.findById(companyId);

    if (!company) {
      return response.validationError(res, "Company not found.");
    }

    const existingEmployee = await EmployeeModel.findOne({
      studentId,
      companyId,
    });

    if (existingEmployee) {
      return response.validationError(res, "Student is already in the team.");
    }

    const newEmployee = new EmployeeModel({
      studentId,
      companyId,
      role,
      salary,
      Name,
      Email,
      status,
      performance: "",
    });

    await newEmployee.save();

    company.Team.push(newEmployee);
    await company.save();

    return response.successResponse(
      res,
      newEmployee,
      "Student added to team successfully."
    );
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error");
  }
});

//==================================[ Get All Application of a company]====================

const GetAllApplicationofacompany = async (req, res) => {
  try {
    const Companyid = req.userId;

    const allApplications = await JobApplyModel.find({ CompanyId: Companyid })
      .populate("JobId")
      .populate("StudentId");

    return response.successResponse(
      res,
      allApplications,
      "All job applications received by the company"
    );
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error");
  }
};

//=====================================[Reject Job application ]=======================

const RejectJobApplication = asynchandler(async (req, res) => {
  try {
    const Companyid = req.userId;
    const { id } = req.params;

    const jobapplication = await JobApplyModel.findById(id)
      .populate("CompanyId")
      .populate("JobId");

    if (!jobapplication) {
      return response.notFoundError(res, " Job Not found");
    }
    jobapplication.isrejected = true;
    jobapplication.isshortlisted = false;
    jobapplication.status = "rejected";
    await jobapplication.save();

    let notification = await Notification.create({
      CompanyId: Companyid,
      StudentId: jobapplication?.StudentId?._id,
      JobId: jobapplication?.JobId?._id,
      text: `Your job application for ${jobapplication?.JobId?.positionName} is Rejected .`,
    });
    let findStudent = await StudentModel.findById(
      jobapplication?.StudentId?._id
    );

    const mailOptions = {
      to: Email,
      subject: "Job Application Rejected",
      text: `Your job application for ${jobapplication?.JobId?.positionName} is Rejected .`,
    };

    transporter.sendMail(mailOptions, async function (error, info) {
      if (error) {
        console.log(error);
        return response.internalServerError(
          res,
          "Error sending mail for job rejected"
        );
      } else {
        return res.status(200).send({
          status: true,
          message: "response sent to email, please verify.",
        });
      }
    });

    sendMessage(
      findStudent.Number,
      `Your job application for ${jobapplication?.JobId?.positionName} is Rejected .`
    );

    return response.successResponse(
      res,
      jobapplication,
      "Job status updated successfully"
    );
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error");
  }
});

//=========================================[Get All Appied Students of a job]=========================

const GetAllStudentsofajob = asynchandler(async (req, res) => {
  try {
    const Companyid = req.userId;
    const { id } = req.params;

    const getjob = await JobModel.findById(id);

    if (!getjob) {
      return response.notFoundError(res, "Job Not found");
    }

    const GetAllAppiledStudent = await JobApplyModel.find({
      JobId: id,
    }).populate("StudentId");

    if (!GetAllAppiledStudent) {
      return response.notFoundError(res, "No One Appiled for this Job yet");
    }

    return response.successResponse(
      res,
      GetAllAppiledStudent,
      "Get all Applications"
    );
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error");
  }
});

//=========================================[Get All Appied Students of a job]=========================

const GetAllAppiedStudentsofajob = asynchandler(async (req, res) => {
  try {
    const Companyid = req.userId;
    const { id } = req.params;

    const getjob = await JobModel.findById(id);

    if (!getjob) {
      return response.notFoundError(res, "Job Not found");
    }

    const GetAllAppiledStudent = await JobApplyModel.find({
      JobId: id,
      isrejected: false,
    }).populate("StudentId");

    if (!GetAllAppiledStudent) {
      return response.notFoundError(res, "No One Appiled for this Job yet");
    }

    return response.successResponse(
      res,
      GetAllAppiledStudent,
      "Get all Applications"
    );
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error");
  }
});

//=========================================[Get All Rejected Students of a job]=========================

const GetAllRejectedStudentsofajob = asynchandler(async (req, res) => {
  try {
    const Companyid = req.userId;
    const { id } = req.params;

    const getjob = await JobModel.findById(id);

    if (!getjob) {
      return response.notFoundError(res, "Job Not found");
    }

    const GetAllAppiledStudent = await JobApplyModel.find({
      JobId: id,
      isrejected: true,
    }).populate("StudentId");

    if (!GetAllAppiledStudent) {
      return response.notFoundError(res, "No One Appiled for this Job yet");
    }

    return response.successResponse(
      res,
      GetAllAppiledStudent,
      "Get all Applications"
    );
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error");
  }
});

//=====================================[Reject Job application ]=======================

const shortlistJobApplication = asynchandler(async (req, res) => {
  try {
    const Companyid = req.userId;
    const { id } = req.params;
    const jobapplication = await JobApplyModel.findById(id)
      .populate("CompanyId")
      .populate("JobId");
    if (!jobapplication) {
      return response.notFoundError(res, " Job Not found");
    }
    jobapplication.isshortlisted = true;
    jobapplication.status = "shortlisted";
    await jobapplication.save();
    let notification = await Notification.create({
      CompanyId: Companyid,
      StudentId: jobapplication?.StudentId?._id,
      JobId: jobapplication?.JobId?._id,
      text: `Your job application for ${jobapplication?.JobId?.positionName} is shortlisted`,
    });

    let findStudent = await StudentModel.findById(
      jobapplication?.StudentId?._id
    );
    sendMessage(
      findStudent.Number,
      `Your job application for ${jobapplication?.JobId?.positionName} is shortlisted`
    );

    const mailOptions = {
      to: Email,
      subject: "Job Application Shortlisted",
      text: `Your job application for ${jobapplication?.JobId?.positionName} is shortlisted`,
    };

    transporter.sendMail(mailOptions, async function (error, info) {
      if (error) {
        console.log(error);
        return response.internalServerError(
          res,
          "Error sending mail for job shortlist"
        );
      } else {
        return res.status(200).send({
          status: true,
          message: "response sent to email.",
        });
      }
    });

    return response.successResponse(
      res,
      jobapplication,
      "Job status updated successfully"
    );
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error");
  }
});

//=========================================[Get All Rejected Students of a job]=========================

const GetAllshortlistStudentsofajob = asynchandler(async (req, res) => {
  try {
    const Companyid = req.userId;
    const { id } = req.params;

    const getjob = await JobModel.findById(id);

    if (!getjob) {
      return response.notFoundError(res, "Job Not found");
    }

    const GetAllAppiledStudent = await JobApplyModel.find({
      JobId: id,
      isshortlisted: true,
      IsSelectedforjob: false,
    }).populate("StudentId");

    if (!GetAllAppiledStudent) {
      return response.notFoundError(res, "No One Appiled for this Job yet");
    }

    return response.successResponse(
      res,
      GetAllAppiledStudent,
      "Get all Applications"
    );
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error");
  }
});

const GetAllshortlistStudentsofAllJobs = asynchandler(async (req, res) => {
  try {
    const Companyid = req.userId;

    const getAllJobs = await JobModel.find({ CompanyId: Companyid });

    if (!getAllJobs || getAllJobs.length === 0) {
      return response.notFoundError(res, "No Jobs found for this company");
    }

    const jobIds = getAllJobs.map((job) => job._id);

    const GetAllAppiledStudents = await JobApplyModel.find({
      JobId: { $in: jobIds },
      isshortlisted: true,
      IsSelectedforjob: false,
    }).populate("StudentId");

    if (!GetAllAppiledStudents || GetAllAppiledStudents.length === 0) {
      return response.notFoundError(res, "No one has applied for any jobs yet");
    }

    return response.successResponse(
      res,
      GetAllAppiledStudents,
      "Get all Applications"
    );
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error");
  }
});

//======================================[Updateassessment]=============================

const Updateassessment = asynchandler(async (req, res) => {
  try {
    const Companyid = req.userId;
    const { id } = req.params;
    const { assessment } = req.body;

    const jobapplication = await JobApplyModel.findById(id);

    if (!jobapplication) {
      return response.notFoundError(res, " Job Not found");
    }

    if (assessment) {
      jobapplication.assessment = assessment;
    }
    await jobapplication.save();

    return response.successResponse(
      res,
      jobapplication,
      "Job status updated successfully"
    );
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error");
  }
});

//======================================[ScheduleInterview]========================

const ScheduleInterview = asynchandler(async (req, res) => {
  try {
    const Companyid = req.userId;
    const { id } = req.params;
    const { interviewSchedule } = req.body;

    const jobApplication = await JobApplyModel.findById(id)
      .populate("CompanyId")
      .populate("JobId");
    if (!jobApplication) {
      return response.notFoundError(res, "Job Application not found");
    }

    let notification = await Notification.create({
      CompanyId: Companyid,
      StudentId: jobApplication?.StudentId?._id,
      JobId: jobApplication?.JobId?._id,
      text: `Your interview scheduled job application for ${jobApplication?.JobId?.positionName} .`,
    });

    let findStudent = await StudentModel.findById(
      jobApplication?.StudentId?._id
    );

    // const event = {
    //   summary: `Interview for ${jobApplication?.JobId?.positionName}`,
    //   description: `Interview scheduled by ${jobApplication?.CompanyId?.name}`,
    //   start: {
    //     dateTime: moment(interviewSchedule).format(),
    //     timeZone: "UTC",
    //   },
    //   end: {
    //     dateTime: moment(interviewSchedule).add(1, "hour").format(),
    //     timeZone: "UTC",
    //   },
    //   conferenceData: {
    //     createRequest: {
    //       requestId: `meet-${jobApplication._id}`,
    //       conferenceSolutionKey: {
    //         type: "hangoutsMeet",
    //       },
    //     },
    //   },
    // };
    // const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    // // console.log(calendar);
    // const meeting = await calendar.events.insert({
    //   calendarId: "primary",
    //   resource: event,
    //   conferenceDataVersion: 1,
    // });
    // const meetLink = meeting.data.hangoutLink;
    // console.log(meetLink);

    jobApplication.interviewSchedule = {
      ...interviewSchedule,
      // meetLink: meetLink,
    };
    
    jobApplication.isinterviewScheduled = true;
    await jobApplication.save();

    sendMessage(
      findStudent.Number,
      `Your interview scheduled job application for ${jobApplication?.JobId?.positionName} .`
    );

    // const mailOptions = {
    //   to: jobApplication?.StudentId?.Email,
    //   subject: "interview scheduled",
    //   text: `Your interview scheduled job application for ${jobApplication?.JobId?.positionName} .`,
    // };

    // transporter.sendMail(mailOptions, async function (error, info) {
    //   if (error) {
    //     console.log(error);
    //     return response.internalServerError(
    //       res,
    //       "Error sending mail for job shortlist"
    //     );
    //   } else {
    //     return res.status(200).send({
    //       status: true,
    //       message: "response sent to email.",
    //     });
    //   }
    // });

    return response.successResponse(
      res,
      jobApplication,
      "Interview schedule updated successfully"
    );
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error");
  }
});

//======================================[Get all ScheduleInterview of a job] ==================================

const GetAllScheduleInterviewofajob = asynchandler(async (req, res) => {
  try {
    const Companyid = req.userId;
    const { id } = req.params;

    const getjob = await JobModel.findById(id);

    if (!getjob) {
      return response.notFoundError(res, "Job Not found");
    }

    const GetAllStudent = await JobApplyModel.find({
      JobId: id,
      isshortlisted: true,
      isinterviewScheduled: true,
      isrejected: false,
      isInterviewcompleted: false,
      IsSelectedforjob: false,
    }).populate("StudentId");

    if (!GetAllStudent) {
      return response.notFoundError(
        res,
        "No ScheduleInterview for this Job yet"
      );
    }

    return response.successResponse(
      res,
      GetAllStudent,
      "Get all ScheduleInterview Applications"
    );
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error");
  }
});

//==================================[Upcomming interview of all jobs ]=========================================

const GetAllUpcomingInterviews = asynchandler(async (req, res) => {
  try {
    const Companyid = req.userId;

    const GetAllJobsofacompany = await JobModel.find({ Company: Companyid });

    let allUpcomingInterviews = [];

    for (const job of GetAllJobsofacompany) {
      const { _id: jobId } = job;

      const upcomingInterviews = await JobApplyModel.find({
        JobId: jobId,
        isrejected: false,
        isshortlisted: true,
        isinterviewScheduled: true,
        isInterviewcompleted: false,
        IsSelectedforjob: false,
      })
        .populate("StudentId")
        .populate("JobId");

      if (upcomingInterviews.length > 0) {
        allUpcomingInterviews.push(...upcomingInterviews);
      }
    }
    return response.successResponse(
      res,
      allUpcomingInterviews,
      "Get all upcoming interviews for all jobs"
    );
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error");
  }
});

//====================================[Pending Result ]==================================//

const Resultonpending = asynchandler(async (req, res) => {
  try {
    const Companyid = req.userId;

    const GetAllJobsofacompany = await JobModel.find({ Company: Companyid });

    let allUpcomingInterviews = [];

    for (const job of GetAllJobsofacompany) {
      const { _id: jobId } = job;

      const upcomingInterviews = await JobApplyModel.find({
        JobId: jobId,
        isrejected: false,
        isshortlisted: true,
        isinterviewScheduled: true,
        isInterviewcompleted: true,
        IsSelectedforjob: true,
      }).populate("StudentId");

      if (upcomingInterviews.length > 0) {
        allUpcomingInterviews.push(...upcomingInterviews);
      }
    }
    return response.successResponse(
      res,
      allUpcomingInterviews,
      "Get all pending Result all jobs"
    );
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error");
  }
});

const interviewComplete = asynchandler(async (req, res) => {
  try {
    const Companyid = req.userId;
    let data = await JobApplyModel.findById(req.params.id);
    data.isInterviewcompleted = true;
    data.save();
    return response.successResponse(res, data, "Interview updated");
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error");
  }
});

//======================================[Selecte a Student ]============================

const selectAndAddStudentToTeam = asynchandler(async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.userId;

    const jobApplication = await JobApplyModel.findById(id)
      .populate("CompanyId")
      .populate("JobId");

    if (!jobApplication) {
      return response.notFoundError(res, "Job application not found.");
    }

    jobApplication.status = "selected";
    jobApplication.IsSelectedforjob = true;
    jobApplication.isInterviewcompleted = true;
    await jobApplication.save();

    let notification = await Notification.create({
      CompanyId: companyId,
      StudentId: jobApplication?.StudentId?._id,
      JobId: jobApplication?.JobId?._id,
      text: `Your job application for ${jobApplication?.JobId?.positionName} is selected for job`,
    });

    let findStudent = await StudentModel.findById(
      jobApplication?.StudentId?._id
    );
    const mailOptions = {
      to: jobApplication?.StudentId?.Email,
      subject: "you are selected",
      text: `Your job application for ${jobApplication?.JobId?.positionName} is selected for job`,
    };

    transporter.sendMail(mailOptions, async function (error, info) {
      if (error) {
        console.log(error);
        return response.internalServerError(
          res,
          "Error sending mail for job shortlist"
        );
      } else {
        return res.status(200).send({
          status: true,
          message: "response sent to email.",
        });
      }
    });
    sendMessage(
      findStudent.Number,
      `Your job application for ${jobApplication?.JobId?.positionName} is selected for job`
    );

    const { StudentId, JobId } = jobApplication;
    const job = await JobModel.findById(JobId);

    if (!job) {
      return response.validationError(res, "Job not found.");
    }

    const role = job.positionName;

    const company = await CompanyModel.findById(companyId);

    if (!company) {
      return response.validationError(res, "Company not found.");
    }

    const existingEmployee = await EmployeeModel.findOne({
      studentId: StudentId,
      companyId: companyId,
    });

    if (existingEmployee) {
      return response.validationError(res, "Student is already in the team.");
    }

    const newEmployee = new EmployeeModel({
      studentId: StudentId,
      companyId: companyId,
      role: role,
      salary: job.minSalary,
      performance: "",
    });

    await newEmployee.save();

    company.Team.push(newEmployee);
    await company.save();

    return response.successResponse(
      res,
      company,
      "Student selected and added to team successfully."
    );
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error.");
  }
});

//======================================[ Selected student of a job ]=======================
//======================================[Get All Selected student of a job ]=======================
const GetAllSelectedStudentsOfJob = asynchandler(async (req, res) => {
  try {
    const { id } = req.params;

    const job = await JobModel.findById(id);
    if (!job) {
      return response.notFoundError(res, "Job not found.");
    }
    const selectedStudents = await JobApplyModel.find({
      JobId: id,
      isrejected: false,
      isshortlisted: true,
      IsSelectedforjob: true,
    }).populate("StudentId");

    return response.successResponse(
      res,
      selectedStudents,
      "Get all selected students for the job."
    );
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error");
  }
});

//======================================[Get all Selected students ]======================

const GetAllSelectedStudents = asynchandler(async (req, res) => {
  try {
    const Companyid = req.userId;

    const GetAllJobsofacompany = await JobModel.find({ Company: Companyid });

    let allSelectedStudents = [];

    for (const job of GetAllJobsofacompany) {
      const { _id: jobId } = job;

      const selectedStudents = await JobApplyModel.find({
        JobId: jobId,
        isrejected: false,
        isshortlisted: true,
        IsSelectedforjob: true,
      })
        .populate("StudentId")
        .populate("JobId");

      if (selectedStudents.length > 0) {
        allSelectedStudents.push(...selectedStudents);
      }
    }

    return response.successResponse(
      res,
      allSelectedStudents,
      "Get all selected students for all jobs"
    );
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error");
  }
});

//===========================[Get all Shortlisted student ]=====================

const GetAllShortlistedStudents = asynchandler(async (req, res) => {
  try {
    const companyId = req.userId;

    const jobsOfCompany = await JobModel.find({ Company: companyId });

    let allShortlistedStudents = [];

    for (const job of jobsOfCompany) {
      const jobId = job._id;

      const shortlistedStudents = await JobApplyModel.find({
        JobId: jobId,
        isshortlisted: true,
        IsSelectedforjob: false,
      })
        .populate("StudentId")
        .populate("JobId");

      if (shortlistedStudents.length > 0) {
        allShortlistedStudents.push(...shortlistedStudents);
      }
    }

    return response.successResponse(
      res,
      allShortlistedStudents,
      "Get all shortlisted students for all jobs of the company."
    );
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error");
  }
});

//=============================[ Get Company Team Details ]============================

const GetCompanyTeamDetails = async (req, res) => {
  try {
    const companyId = req.userId;

    const company = await CompanyModel.findById(companyId).populate({
      path: "Team",
      populate: {
        path: "studentId",
      },
    });

    if (!company) {
      return response.notFoundError(res, "Company not found.");
    }

    return response.successResponse(
      res,
      company.Team,
      "Company team details retrieved successfully."
    );
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error.");
  }
};

const getAllEmployeesLeaveRequests = async (req, res) => {
  const companyId = req.userId;

  try {
    const employees = await EmployeeModel.find({
      companyId: companyId,
    }).populate("studentId");

    let allLeaveRequests = [];

    employees.forEach((employee) => {
      const leaveRequests = employee.leaveRequests.map((request) => ({
        employeeId: employee._id,
        employeeName: employee.studentId.Name,
        image: employee.studentId.Image,
        role: employee.role,
        leaveRequest: request,
      }));

      allLeaveRequests.push(...leaveRequests);
    });

    return response.successResponse(
      res,
      allLeaveRequests,
      "Get all employees' leave requests"
    );
  } catch (error) {
    console.error(error);
    return response.internalServerError(res, "Internal server error");
  }
};

const approveLeaveRequest = async (req, res) => {
  try {
    const { employeeId, requestId } = req.body;

    const employee = await EmployeeModel.findById(employeeId);

    if (!employee) {
      return response.notFoundError(res, "Employee not found");
    }

    const leaveRequest = employee.leaveRequests.id(requestId);

    if (!leaveRequest) {
      return response.notFoundError(res, "Leave request not found");
    }

    leaveRequest.status = "Approved";

    await employee.save();

    return response.successResponse(
      res,
      leaveRequest,
      "Leave request approved successfully"
    );
  } catch (error) {
    console.error(error);
    return response.internalServerError(res, "Internal server error");
  }
};

const rejectLeaveRequest = async (req, res) => {
  try {
    const { employeeId, requestId } = req.body;

    const employee = await EmployeeModel.findById(employeeId);

    if (!employee) {
      return response.notFoundError(res, "Employee not found");
    }

    const leaveRequest = employee.leaveRequests.id(requestId);

    if (!leaveRequest) {
      return response.notFoundError(res, "Leave request not found");
    }

    // Update the status of the leave request to "Rejected"
    leaveRequest.status = "Rejected";

    await employee.save();

    return response.successResponse(
      res,
      leaveRequest,
      "Leave request rejected successfully"
    );
  } catch (error) {
    console.error(error);
    return response.internalServerError(res, "Internal server error");
  }
};

// const getAllApprovedLeaves = async (req, res) => {
//     try {
//         const companyId = req.userId;
//         const employees = await EmployeeModel.find({ companyId: companyId }).populate("studentId");;

//         let approvedLeaves = [];

//         employees.forEach(employee => {
//             const approvedLeaveRequests = employee.leaveRequests.filter(request => request.status === "Approved");

//             if (approvedLeaveRequests.length > 0) {
//                 approvedLeaves.push({
//                     employeeId: employee._id,
//                     employeeName: employee.studentId.Name,
//                     image: employee.studentId.Image,
//                     role: employee.role,
//                     approvedLeaveRequests: approvedLeaveRequests
//                 });
//             }
//         });

//         return response.successResponse(res, approvedLeaves, "Get all approved leave requests");
//     } catch (error) {
//         console.error(error);
//         return response.internalServerError(res, "Internal server error");
//     }
// };

const getAllApprovedLeaves = async (req, res) => {
  try {
    const companyId = req.userId;
    const employees = await EmployeeModel.find({
      companyId: companyId,
    }).populate("studentId");

    let approvedLeaves = [];

    employees.forEach((employee) => {
      const approvedLeaveRequests = employee.leaveRequests.filter(
        (request) => request.status === "Approved"
      );

      if (approvedLeaveRequests.length > 0) {
        // Flatten the array of approved leave requests
        approvedLeaves.push(
          ...approvedLeaveRequests.map((request) => ({
            employeeId: employee._id,
            employeeName: employee.studentId.Name,
            image: employee.studentId.Image,
            role: employee.role,
            approvedLeaveRequest: request, // Renamed to match the first API
          }))
        );
      }
    });

    return response.successResponse(
      res,
      approvedLeaves,
      "Get all approved leave requests"
    );
  } catch (error) {
    console.error(error);
    return response.internalServerError(res, "Internal server error");
  }
};

// const getAllPendingLeaves = async (req, res) => {
//     try {
//         const companyId = req.userId;
//         const employees = await EmployeeModel.find({ companyId: companyId }).populate("studentId");;

//         let pendingLeaves = [];

//         employees.forEach(employee => {
//             const pendingLeaveRequests = employee.leaveRequests.filter(request => request.status === "Pending");

//             if (pendingLeaveRequests.length > 0) {
//                 pendingLeaves.push({
//                     employeeId: employee._id,
//                     employeeName: employee.studentId.Name,
//                     image: employee.studentId.Image,
//                     role: employee.role,
//                     pendingLeaveRequests: pendingLeaveRequests
//                 });
//             }
//         });

//         return response.successResponse(res, pendingLeaves, "Get all pending leave requests");
//     } catch (error) {
//         console.error(error);
//         return response.internalServerError(res, "Internal server error");
//     }
// };

const getAllPendingLeaves = async (req, res) => {
  try {
    const companyId = req.userId;
    const employees = await EmployeeModel.find({
      companyId: companyId,
    }).populate("studentId");

    let pendingLeaves = [];

    employees.forEach((employee) => {
      const pendingLeaveRequests = employee.leaveRequests.filter(
        (request) => request.status === "Pending"
      );

      if (pendingLeaveRequests.length > 0) {
        // Flatten the array of pending leave requests
        pendingLeaves.push(
          ...pendingLeaveRequests.map((request) => ({
            employeeId: employee._id,
            employeeName: employee.studentId.Name,
            image: employee.studentId.Image,
            role: employee.role,
            pendingLeaveRequest: request, // Renamed to match the first API
          }))
        );
      }
    });

    return response.successResponse(
      res,
      pendingLeaves,
      "Get all pending leave requests"
    );
  } catch (error) {
    console.error(error);
    return response.internalServerError(res, "Internal server error");
  }
};

// const getAllRejectedLeaves = async (req, res) => {
//     try {
//         const companyId = req.userId;
//         const employees = await EmployeeModel.find({ companyId: companyId }).populate("studentId");;

//         let rejectedLeaves = [];

//         employees.forEach(employee => {
//             const rejectedLeaveRequests = employee.leaveRequests.filter(request => request.status === "Rejected");

//             if (rejectedLeaveRequests.length > 0) {
//                 rejectedLeaves.push({
//                     employeeId: employee._id,
//                     employeeName: employee.studentId.Name,
//                     image: employee.studentId.Image,
//                     role: employee.role,
//                     rejectedLeaveRequests: rejectedLeaveRequests
//                 });
//             }
//         });

//         return response.successResponse(res, rejectedLeaves, "Get all rejected leave requests");
//     } catch (error) {
//         console.error(error);
//         return response.internalServerError(res, "Internal server error");
//     }
// };

const getAllRejectedLeaves = async (req, res) => {
  try {
    const companyId = req.userId;
    const employees = await EmployeeModel.find({
      companyId: companyId,
    }).populate("studentId");

    let rejectedLeaves = [];

    employees.forEach((employee) => {
      const rejectedLeaveRequests = employee.leaveRequests.filter(
        (request) => request.status === "Rejected"
      );

      if (rejectedLeaveRequests.length > 0) {
        // Flatten the array of rejected leave requests
        rejectedLeaves.push(
          ...rejectedLeaveRequests.map((request) => ({
            employeeId: employee._id,
            employeeName: employee.studentId.Name,
            image: employee.studentId.Image,
            role: employee.role,
            rejectedLeaveRequest: request, // Renamed to match the first API
          }))
        );
      }
    });

    return response.successResponse(
      res,
      rejectedLeaves,
      "Get all rejected leave requests"
    );
  } catch (error) {
    console.error(error);
    return response.internalServerError(res, "Internal server error");
  }
};

//==================================[Create Holiday of a company ]==========================

const Createholiday = asynchandler(async (req, res) => {
  try {
    const companyId = req.userId;
    const { name, date, day, description } = req.body;

    if (!name || !date || !day) {
      return response.validationError(res, "name , date , day are required");
    }

    const newHoliday = new HolidaysModel({
      companyId: companyId,
      name: name,
      date: new Date(date),
      day: day,
      description: description,
    });

    const savedHoliday = await newHoliday.save();

    return response.successResponse(
      res,
      savedHoliday,
      "Holiday created successfully"
    );
  } catch (error) {
    console.error(error);
    return response.internalServerError(res, "Internal server error");
  }
});

const GetHolidaysByDate = async (req, res) => {
  try {
    const companyId = req.userId;

    const holidays = await HolidaysModel.find({ companyId: companyId }).sort({
      date: 1,
    });

    return response.successResponse(
      res,
      holidays,
      "Holidays retrieved successfully"
    );
  } catch (error) {
    console.error(error);
    return response.internalServerError(res, "Internal server error");
  }
};

const getAllCompanies = asynchandler(async (req, res) => {
  try {
    const companies = await CompanyModel.find().populate({
      path: "Team",
      populate: {
        path: "studentId",
      },
    });
    return response.successResponse(
      res,
      companies,
      "Comapanies retrieved successfully"
    );
  } catch (error) {
    console.error(error);
    return response.internalServerError(res, "Internal server error");
  }
});

const SaveCandidate = asynchandler(async (req, res) => {
  try {
    const companyId = req.userId;
    const company = await CompanyModel.findById(companyId);

    if (!company) {
      return response.notFound(res, "Company not found");
    }

    if (company.savedCandidates.includes(req.body.studentId)) {
      return response.badRequest(res, "Candidate is already saved");
    }
    company.savedCandidates.push(req.body.studentId);
    await company.save();

    return response.successResponse(
      res,
      company,
      "Candidate Saved Successfully!"
    );
  } catch (error) {
    console.error(error);
    return response.internalServerError(res, "Internal Server error");
  }
});
const removeCandidate = asynchandler(async (req, res) => {
  try {
    const companyId = req.userId;
    const company = await CompanyModel.findById(companyId);

    if (!company) {
      return response.notFound(res, "Company not found");
    }

    const index = company.savedCandidates.indexOf(req.body.studentId);
    if (index === -1) {
      return response.badRequest(res, "Candidate is not saved");
    }

    company.savedCandidates.splice(index, 1);
    await company.save();

    return response.successResponse(
      res,
      company,
      "Candidate removed successfully!"
    );
  } catch (error) {
    console.error(error);
    return response.internalServerError(res, "Internal Server error");
  }
});

const GetSavedCandidates = asynchandler(async (req, res) => {
  try {
    const companyId = req.userId;
    const company = await CompanyModel.findById(companyId).populate(
      "savedCandidates"
    );
    if (!company) {
      return response.notFound(res, "Company not found");
    }

    return response.successResponse(
      res,
      company.savedCandidates,
      "Get All Saved Profiles successful"
    );
  } catch (error) {
    console.error(error);
    return response.internalServerError(res, "Internal Server error");
  }
});

// Import applications data

const getImportData = asynchandler(async (req, res) => {
  try {
    const companyId = req.userId;
    let newImport = await ImportedApplicationModel.find({ companyId });
    if (newImport) {
      response.successResponse(res, newImport, "Data Imported");
    }
  } catch (error) {
    console.error(error);
    return response.internalServerError(res, "Internal Server error");
  }
});
const getImportDataById = asynchandler(async (req, res) => {
  try {
    const companyId = req.userId;
    let newImport = await ImportedApplicationModel.findById(req.params.id);
    if (newImport) {
      response.successResponse(res, newImport, "Data Imported");
    }
  } catch (error) {
    console.error(error);
    return response.internalServerError(res, "Internal Server error");
  }
});
const saveImportData = asynchandler(async (req, res) => {
  try {
    if (req.body.data.length === 0) {
      response.internalServerError(res, "Send Data");
      return;
    }
    const companyId = req.userId;
    let newImport = await ImportedApplicationModel.create({
      companyId,
      status: "Pending",
      data: req.body.data,
    });
    if (newImport) {
      response.successResponse(res, newImport, "Data Imported");
      return;
    }
  } catch (error) {
    console.error(error);
    return response.internalServerError(res, "Internal Server error");
  }
});
const deleteImportData = asynchandler(async (req, res) => {
  try {
    const companyId = req.userId;
    let data = await ImportedApplicationModel.findByIdAndDelete(req.params.id);
    if (data) {
      response.successResponse(res, data, "Data Deleted");
    }
  } catch (error) {
    console.error(error);
    return response.internalServerError(res, "Internal Server error");
  }
});
const assignImportData = asynchandler(async (req, res) => {
  try {
    const companyId = req.userId;
    let { jobId, importId } = req.body;
    let importData = await ImportedApplicationModel.findById(importId);
    importData.status = "Imported";
    importData.jobId = jobId;
    response.successResponse(res, importData, "Data assign to job");
    await importData.save();
  } catch (error) {
    return response.internalServerError(res, "Internal Server error");
  }
});

// Funds transaction

const addFunds = asynchandler(async (req, res) => {
  try {
    const companyId = req.userId;
    let { transactionId, amount, message } = req.body;
    let transaction = await CompanyFundsTransModel.create({
      CompanyId: companyId,
      transactionId,
      amount,
      message,
    });
    let company = await CompanyModel.findById(companyId);
    if (company) {
      company.balance += amount;
      await company.save();
    }
    response.successResponse(res, transaction, "Funds Added");
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal Server error");
  }
});

const getFunds = asynchandler(async (req, res) => {
  try {
    const companyId = req.userId;
    let transactions = await CompanyFundsTransModel.find({
      CompanyId: companyId,
    }).sort({
      createdAt: -1,
    });
    response.successResponse(res, transactions, "Funds fetched successfully");
  } catch (error) {
    return response.internalServerError(res, "Internal Server error");
  }
});

const getBalance = asynchandler(async (req, res) => {
  try {
    const companyId = req.userId;
    let company = await CompanyModel.findById(companyId);
    let data = {
      balance: company.balance || 0,
    };
    response.successResponse(res, data, "Funds fetched successfully");
  } catch (error) {
    return response.internalServerError(res, "Internal Server error");
  }
});

const getAllCollege = asynchandler(async (req, res) => {
  try {
    let data = await CollegeData.find();
    response.successResponse(res, data, "colleges fetched successfully");
  } catch (error) {
    return response.internalServerError(res, "Internal Server error");
  }
});

const updateOnboarding = asynchandler(async (req, res) => {
  try {
    let id = req.userId;
    let company = await CompanyModel.findById(id);
    company.onboardinProcess = req.body;
    company.save();
    response.successResponse(res, company, "onboarding updated");
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal Server error");
  }
});

module.exports = {
  RegisterCompany,
  verifyEmailotp,
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
  GetAllAppiedStudentsofajob,
  AddStudentToTeam,
  GetAllApplicationofacompany,
  RejectJobApplication,
  GetAllRejectedStudentsofajob,
  shortlistJobApplication,
  GetAllshortlistStudentsofajob,
  GetAllshortlistStudentsofAllJobs,
  Updateassessment,
  GetAllStudentsofajob,
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
  approveLeaveRequest,
  rejectLeaveRequest,
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
  assignImportData,
  deleteImportData,
  getImportData,
  getImportDataById,
  addFunds,
  getFunds,
  getBalance,
  getAllCollege,
  updateOnboarding,
  interviewComplete,
};
