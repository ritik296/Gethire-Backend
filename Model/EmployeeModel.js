const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  role: { type: String, require: true },
  Name: { type: String, require: true },
  Email: { type: String, require: true },
  status: { type: String, enum: ["accept", "pending", "rejected"] },
  joiningDate: { type: Date, default: Date.now },
  salary: { type: Number, require: true },
  performance: { type: String, require: true },
  leaveRequests: [
    {
      leaveType: { type: String, require: true },
      startDate: { type: Date, require: true },
      endDate: { type: Date, require: true },
      status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending",
      },
      ishalfday: {
        type: Boolean,
        default: false,
      },
      Note: {
        type: String,
        require: true,
      },
    },
  ],
});

const EmployeeModel = mongoose.model("Employee", EmployeeSchema);
module.exports = EmployeeModel;
