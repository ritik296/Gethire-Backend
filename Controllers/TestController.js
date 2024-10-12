const asynchandler = require("express-async-handler");
const FormData = require("form-data");
const fs = require("fs");
const Test = require("../Model/TestModel");
const Job = require("../Model/JobModel");
const Student = require("../Model/StudentModel");
const TestResult = require("../Model/TestResultofaStudent");
const response = require("../Middleware/responseMiddlewares");
const JobApplyModel = require("../Model/JobApplyModel");
const AITestModel = require("../Model/AITestResult");

const addTestResult = asynchandler(async (req, res) => {
  try {
    let { jobId, answers, timeTaken } = req.body;
    let score = 0;
    answers.forEach((ans) => {
      if (ans.isCorrect) {
        score += 1;
      }
    });
    let totalQuestions = answers.length;
    let scorePercentage = ((score / totalQuestions) * 100).toFixed(2);
    let dataToSave = {
      student: req.StudentId,
      answers,
      timeTaken,
      score,
      scorePercentage,
      job: jobId,
    };
    let assessmentData = {
      Round: "Skill Assessment",
      score,
      scorePercentage,
      Date: Date.now(),
      completedstatus: true,
      Notes: "",
    };

    let existingResult = await TestResult.findOne({
      student: req.StudentId,
      job: jobId,
    });

    if (existingResult) {
      return response.errorResponse(
        res,
        "Result already exists for this job and student"
      );
    }

    let appliedJob = await JobApplyModel.findOneAndUpdate(
      {
        $and: [{ JobId: jobId }, { StudentId: req.StudentId }],
      },
      {
        $set: { Application_stage: "Skill Assessment" },
        $push: { assessment: assessmentData },
      },
      { new: true }
    );

    // Save the test result
    let savedResult = await TestResult.create(dataToSave);
    response.successResponse(res, savedResult, "Result Saved");
  } catch (error) {
    console.log(error);
    response.internalServerError(res, "internal server error");
  }
});

// Get a single result by ID
const getResultById = asynchandler(async (req, res) => {
  try {
    const result = await TestResult.findById(req.params.id).populate("job");
    if (!result) {
      return response.notFoundError(res, "result not found");
    }
    return response.successResponse(res, result, "result fetched successfully");
  } catch (error) {
    response.internalServerError(res, "internal server error");
  }
});

// Get All Results by multi id
const getAllTestResultsByMultiId = asynchandler(async (req, res) => {
  try {
    const { id } = req.params;
    let results;
    const job = await Job.findById(id);
    const student = await Student.findById(id);
    const test = await Test.findById(id);
    if (job) {
      results = await TestResult.find({ job: id });
    }
    if (student) {
      results = await TestResult.find({ student: id });
    }
    if (test) {
      results = await TestResult.find({ test: id });
    }
    return response.successResponse(
      res,
      results,
      "result fetched successfully"
    );
  } catch (error) {
    response.internalServerError(res, "internal server error");
  }
});

const createAiTestResult = asynchandler(async (req, res) => {
  try {
    const { jobId, score, aiText } = req.body;
    const studentId = req.StudentId;

    // Check if the AI test result already exists
    const existingTest = await AITestModel.findOne({
      job: jobId,
      student: studentId,
    });
    if (existingTest) {
      return response.errorResponse(res, "You have already given the test!");
    }

    // Data to save
    const dataToSave = {
      student: studentId,
      job: jobId,
      score,
      aiText,
    };

    // Save the test result
    const result = await AITestModel.create(dataToSave);
    return response.successResponse(res, result, "Result created successfully");
  } catch (error) {
    console.log(error);
    response.internalServerError(res, "Internal server error");
  }
});

const getTestResultsByStudentId = asynchandler(async (req, res) => {
  try {
    const { id, jobId } = req.params;
    const results = await TestResult.findOne({ student: id, job: jobId })
      .populate("job")
      .populate("student");

    if (results.length === 0) {
      return response.successResponse(
        res,
        results,
        "No  test results found for the given student ID"
      );
    }

    return response.successResponse(
      res,
      results,
      "Test results fetched successfully"
    );
  } catch (error) {
    console.log(error);
    response.internalServerError(res, "Internal server error");
  }
});

const getAITestResultsByStudentId = asynchandler(async (req, res) => {
  try {
    const { id, jobId } = req.params;
    const results = await AITestModel.findOne({ student: id, job: jobId })
      .populate("job")
      .populate("student");

    return response.successResponse(
      res,
      results,
      "AI Test results fetched successfully"
    );
  } catch (error) {
    console.log(error);
    response.internalServerError(res, "Internal server error");
  }
});

const getAITestResultsByJobId = asynchandler(async (req, res) => {
  try {
    const { jobId } = req.params;
    const results = await AITestModel.find({ job: jobId })
      .populate("job")
      .populate("student");

    if (results.length === 0) {
      return response.successResponse(
        res,
        results,
        "No AI test results found for the given job ID"
      );
    }

    return response.successResponse(
      res,
      results,
      "AI Test results fetched successfully"
    );
  } catch (error) {
    response.internalServerError(res, "Internal server error");
  }
});

const submitAudio = asynchandler(async (req, res) => {
  try {
    // console.log(req.file);
    const formData = new FormData();
    formData.append(
      "audio",
      fs.createReadStream(req.file.path),
      req.file.originalname
    );
    const response = await fetch(
      "https://shining-needed-bug.ngrok-free.app/transcribe",
      {
        method: "POST",
        body: formData,
        headers: {
          ...formData.getHeaders(),
        },
      }
    );
    // console.log(result);
    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error submitting audio", error });
  }
});

module.exports = {
  addTestResult,
  getResultById,
  getAllTestResultsByMultiId,
  createAiTestResult,
  getTestResultsByStudentId,
  getAITestResultsByJobId,
  getAITestResultsByStudentId,
  submitAudio,
};
