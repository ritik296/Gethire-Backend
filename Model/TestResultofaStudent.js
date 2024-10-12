const mongoose = require("mongoose");

const StudentTestResultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Jobs",
    required: true,
  },
  answers: [
    {
      question: { type: String, required: true },
      answer: { type: String, required: true },
      isCorrect: { type: Boolean, required: true },
    },
  ],
  score: { type: Number, required: true },
  scorePercentage: { type: Number, required: true },
  timeTaken: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const StudentTestResultModel = mongoose.model(
  "StudentTestResult",
  StudentTestResultSchema
);
module.exports = StudentTestResultModel;
