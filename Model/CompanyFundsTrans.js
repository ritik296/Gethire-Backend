const mongoose = require("mongoose");

const CompanyFundsTransSchema = new mongoose.Schema({
  CompanyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  transactionId: { type: String, required: true },
  message: { type: String, required: true },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const CompanyFundsTransModel = mongoose.model(
  "CompanyFundsTrans",
  CompanyFundsTransSchema
);
module.exports = CompanyFundsTransModel;
