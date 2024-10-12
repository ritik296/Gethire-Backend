const mongoose = require("mongoose");

const AITestSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Jobs",
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  aiText: { type: String },
  score: { type: Number },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const AITestModel = mongoose.model("AITest", AITestSchema);
module.exports = AITestModel;
