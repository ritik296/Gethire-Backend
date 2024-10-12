const AIResumeModel = require("../Model/AIResume");
const {
  successResponse,
  internalServerError,
  validationError,
} = require("../Middleware/responseMiddlewares");
const StudentModel = require("../Model/StudentModel");

const createAIResume = async (req, res) => {
  try {
    const id = req.StudentId;
    let dataToSave = { ...req.body, student: id };
    const aiResume = new AIResumeModel(dataToSave);
    await aiResume.save();

    await StudentModel.findByIdAndUpdate(
      id,
      { $push: { aiResumes: aiResume._id } },
      { new: true, useFindAndModify: false }
    );
    successResponse(res, aiResume, "AIResume created successfully");
  } catch (error) {
    console.log(error);
    if (error.name === "ValidationError") {
      validationError(res, error.message);
    } else {
      internalServerError(res, "An error occurred while creating AIResume");
    }
  }
};

const getAIResumeAll = async (req, res) => {
  try {
    const id = req.StudentId;
    const aiResume = await AIResumeModel.find({ student: id }).exec();
    if (!aiResume) {
      notFoundError(res, "AIResume not found");
      return;
    }
    successResponse(res, aiResume, "AIResume retrieved successfully");
  } catch (error) {
    internalServerError(res, "An error occurred while retrieving AIResume");
  }
};

const getAIResumeById = async (req, res) => {
  try {
    const { id } = req.params;
    const aiResume = await AIResumeModel.findById(id).exec();

    if (!aiResume) {
      notFoundError(res, "AIResume not found");
      return;
    }

    successResponse(res, aiResume, "AIResume retrieved successfully");
  } catch (error) {
    internalServerError(res, "An error occurred while retrieving AIResume");
  }
};

const updateAIResumeById = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const aiResume = await AIResumeModel.findByIdAndUpdate(id, updates, {
      new: true,
    }).exec();

    if (!aiResume) {
      notFoundError(res, "AIResume not found");
      return;
    }

    successResponse(res, aiResume, "AIResume updated successfully");
  } catch (error) {
    if (error.name === "ValidationError") {
      validationError(res, error.message);
    } else {
      internalServerError(res, "An error occurred while updating AIResume");
    }
  }
};

const deleteAIResumeById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const aiResume = await AIResumeModel.findByIdAndDelete(id).exec();

    if (!aiResume) {
      notFoundError(res, "AIResume not found");
      return;
    }

    successResponse(res, aiResume, "AIResume deleted successfully");
  } catch (error) {
    internalServerError(res, "An error occurred while deleting AIResume");
  }
};
module.exports = {
  createAIResume,
  updateAIResumeById,
  deleteAIResumeById,
  getAIResumeById,
  getAIResumeAll,
};
