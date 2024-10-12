const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  category: { type: String },
  title: { type: String },
  description: { type: String },
  thumbnail: { type: String },
  price: { type: String },
  ownBy: { type: String, enum: ["company", "gethire"] },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  contents: [
    {
      part: {
        type: String,
      },
      content: {
        type: String,
      },
    },
  ],
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reviews" }],
});

const CourseModel = mongoose.model("Course", CourseSchema);
module.exports = CourseModel;
