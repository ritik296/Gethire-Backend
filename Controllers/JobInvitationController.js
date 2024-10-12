const JobModel = require("../Model/JobModel");
const StudentModel = require("../Model/StudentModel");
const Conversation = require("../Model/ConversationModel");
const JobApplyModel = require("../Model/JobApplyModel");
const response = require("../Middleware/responseMiddlewares");
const Chat = require("../Model/ChatModel");
const asynchandler = require("express-async-handler");

const getMatchingCandidates = (students, job) => {
  return students
    .map((student) => {
      let matchScore = 0;
      const totalCriteria = 3;

      // Skill match
      const skillMatch = job.skillsRequired.some((skill) =>
        student.Skill_Set.some(
          (studentSkill) =>
            studentSkill?.Skill?.toLowerCase() === skill.toLowerCase()
        )
      );
      if (skillMatch) matchScore++;

      // Location match
      const locationMatch = student.locations.includes(job.location);
      if (locationMatch) matchScore++;

      // Experience match
      const experienceMatch =
        student.Experience >= job.minExp && student.Experience <= job.maxExp;
      if (experienceMatch) matchScore++;

      // Calculate match percentage
      const matchPercentage = (matchScore / totalCriteria) * 100;

      return {
        ...student.toObject(), // Ensure you convert Mongoose document to plain object
        matchPercentage,
        skillMatch,
        locationMatch,
        experienceMatch,
      };
    })
    .filter((student) => student.matchPercentage > 0);
};

const getFilteredCandidates = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await JobModel.findById(jobId)
      .populate("invitedCandidates.candidateId")
      .populate("notInterestedCandidates");
    if (!job) return res.status(404).send("Job not found");

    const students = await StudentModel.find();
    const jobApplications = await JobApplyModel.find({ JobId: jobId }).select(
      "StudentId status"
    );

    const applicationStatusMap = jobApplications.reduce((map, application) => {
      map[application.StudentId] = application.status;
      return map;
    }, {});

    const studentsWithStatus = getMatchingCandidates(students, job).map(
      (student) => {
        let inviteStatus = "not invited";
        const invitedCandidate = job.invitedCandidates.find((candidate) =>
          candidate.candidateId.equals(student._id)
        );
        if (invitedCandidate) {
          inviteStatus = invitedCandidate.status; // Get actual status
        } else if (
          job.notInterestedCandidates.some((candidate) =>
            candidate.equals(student._id)
          )
        ) {
          inviteStatus = "not interested";
        }

        const applicationStatus =
          applicationStatusMap[student._id] ||
          (inviteStatus !== "not invited" ? inviteStatus : "not applied");

        return {
          ...student,
          inviteStatus,
          applicationStatus,
        };
      }
    );

    response.successResponse(res, studentsWithStatus, "fetched");
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal server error");
  }
};

const inviteStudent = async (req, res) => {
  try {
    const { jobId, studentId } = req.params;

    const job = await JobModel.findById(jobId).populate("Company");
    if (!job) return res.status(404).send("Job not found");

    if (
      !job.invitedCandidates.some((candidate) =>
        candidate.candidateId.equals(studentId)
      )
    ) {
      job.invitedCandidates.push({ candidateId: studentId, status: "pending" });
      await job.save();
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [job.Company._id, studentId] },
    });
    if (!conversation) {
      conversation = new Conversation({
        participants: [job.Company._id, studentId],
      });
      await conversation.save();
    }

    let link = `blank/JobViewDetails/${job._id}`;
    const newChat = await Chat.create({
      conversationId: conversation._id,
      senderId: job.Company._id,
      senderType: "Company",
      message: `You have been invited to apply for the job: ${job.positionName} "${link}" `,
    });

    response.successResponse(res, job, "Student invited successfully");
  } catch (error) {
    console.error("Error inviting student:", error);
    return response.internalServerError(res, "Internal server error");
  }
};

const markStudentAsNotInterested = async (req, res) => {
  try {
    const { jobId, studentId } = req.params;

    // Find the job and update notInterestedCandidates
    const job = await JobModel.findById(jobId);
    if (!job) return res.status(404).send("Job not found");

    // Add student to notInterestedCandidates if not already present
    if (!job.notInterestedCandidates.includes(studentId)) {
      job.notInterestedCandidates.push(studentId);
      await job.save();
    }

    response.successResponse(res, job, "fetched");
  } catch (error) {
    return response.internalServerError(res, "Internal server error");
  }
};

const getInvitedJobs = asynchandler(async (req, res) => {
  try {
    let studentId = req.StudentId;
    let data = await JobModel.find();
    let invitedJobs = data.filter((job) =>
      job.invitedCandidates.some(
        (candidate) => candidate.candidateId.equals(studentId)
        // &&
        // candidate.status === "pending"
      )
    );
    response.successResponse(
      res,
      invitedJobs,
      "Invited jobs fetched successfully"
    );
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal Server error");
  }
});

const acceptInvite = asynchandler(async (req, res) => {
  try {
    let studentId = req.StudentId;
    let jobId = req.params.id;

    // Find the job by its ID
    let job = await JobModel.findById(jobId);
    if (!job) {
      return response.notFound(res, "Job not found");
    }

    // Find the candidate in the invitedCandidates array and update their status
    let candidateIndex = job.invitedCandidates.findIndex(
      (candidate) =>
        candidate.candidateId.equals(studentId) &&
        candidate.status === "pending"
    );

    if (candidateIndex === -1) {
      return response.notFound(
        res,
        "Invite not found or already accepted/rejected"
      );
    }
    job.invitedCandidates[candidateIndex].status = "accepted";
    await job.save();
    return response.successResponse(res, job, "Invite accepted successfully");
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal Server error");
  }
});

const rejectInvite = asynchandler(async (req, res) => {
  try {
    let studentId = req.StudentId;
    let jobId = req.params.id;

    // Find the job by its ID
    let job = await JobModel.findById(jobId);
    if (!job) {
      return response.notFound(res, "Job not found");
    }

    // Find the candidate in the invitedCandidates array and update their status
    let candidateIndex = job.invitedCandidates.findIndex(
      (candidate) =>
        candidate.candidateId.equals(studentId) &&
        candidate.status === "pending"
    );

    if (candidateIndex === -1) {
      return response.notFound(
        res,
        "Invite not found or already accepted/rejected"
      );
    }

    // Update the status of the candidate
    job.invitedCandidates[candidateIndex].status = "rejected";

    // Save the job with updated candidate status
    await job.save();

    return response.successResponse(res, job, "Invite rejected successfully");
  } catch (error) {
    console.log(error);
    return response.internalServerError(res, "Internal Server error");
  }
});

module.exports = {
  getFilteredCandidates,
  inviteStudent,
  markStudentAsNotInterested,
  getInvitedJobs,
  acceptInvite,
  rejectInvite,
};
