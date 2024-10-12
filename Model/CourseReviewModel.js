const mongoose = require("mongoose");

const ReviewsSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  review: { type: String },
  rate: { type: Number },
});

const ReviewsModel = mongoose.model("Reviews", ReviewsSchema);
module.exports = ReviewsModel;
