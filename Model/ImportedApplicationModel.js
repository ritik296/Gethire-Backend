const mongoose = require("mongoose");

const ImportedApplicationSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Jobs",
  },
  status: {
    type: String,
    enum: ["Pending", "Imported"],
    default: "Pending",
  },
  data: [mongoose.Schema.Types.Mixed],
});
ImportedApplicationSchema.index({ companyId: 1, status: 1 });

const ImportedApplicationModel = mongoose.model(
  "ImportedApplication",
  ImportedApplicationSchema
);

module.exports = ImportedApplicationModel;
