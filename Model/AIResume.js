const mongoose = require("mongoose");

const AIResumeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { strict: false }
);

const AIResumeModel = mongoose.model("AIResume", AIResumeSchema);
module.exports = AIResumeModel;
