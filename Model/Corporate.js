//  const mongoose = require('mongoose');

// // ActiveProcess Schema
// const activeProcessSchema = new mongoose.Schema({
//   companyId: {
//     type: String,
//     required: true,
//     trim: true,
//     unique: true, // Ensure companyId is unique
//   },
//   companyName: {
//     type: String,
//     required: true,
//     trim: true,
//     unique: true,
//   },
//   jobRole: [{
//     jobTitle: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     vacancies: {
//       type: Number,
//       required: true,
//       min: 1,
//     },
//   }],
// }, {
//   timestamps: true,
// });

// const ActiveProcess = mongoose.model('ActiveProcess', activeProcessSchema);

// // Invitation Schema
// const invitationSchema = new mongoose.Schema({
//   collegeName: { type: String, required: true },
//   location: { type: String, required: true },
//   numberOfStudents: { type: Number, required: true },
//   branch: { type: String, required: true },
//   position: { type: String, required: true },
//   batch: { type: String, required: true },
//   description: { type: String, required: true },
// }, {
//   timestamps: true,
// });

// const InvitationSch = mongoose.model('Invitation', invitationSchema);

// // Placement Schema
// const getHirePlacementSchema = new mongoose.Schema({
//   companyName: { type: String, required: true },
//   studentName: { type: String, required: true },
//   position: { type: String, required: true },
//   branch: { type: String, required: true },
//   year: { type: Number, required: true },
//   ctc: { type: Number, required: true },
// }, {
//   timestamps: true,
// });

// const Placement = mongoose.model('Placement', getHirePlacementSchema);

// module.exports = {
//   ActiveProcess,
//   InvitationSch,
//   Placement,
// };

const mongoose = require('mongoose');

// ActiveProcess Schema
const activeProcessSchema = new mongoose.Schema({
  companyId: {
    type: String,
    required: true,
    trim: true,
    unique: true, // Ensure companyId is unique
  },
  companyName: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  jobRole: [{
    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },
    vacancies: {
      type: Number,
      required: true,
      min: 1,
    },
  }],
}, {
  timestamps: true,
});

const ActiveProcess = mongoose.model('ActiveProcess', activeProcessSchema);

// Invitation Schema
const invitationSchema = new mongoose.Schema({
  collegeName: { type: String, required: true },
  location: { type: String, required: true },
  numberOfStudents: { type: Number, required: true },
  branch: { type: String, required: true },
  position: { type: String, required: true },
  batch: { type: String, required: true },
  description: { type: String, required: true },
}, {
  timestamps: true,
});

const InvitationSch = mongoose.model('Invitation', invitationSchema);

// Placement Schema
const getHirePlacementSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  studentName: { type: String, required: true },
  position: { type: String, required: true },
  branch: { type: String, required: true },
  year: { type: Number, required: true },
  ctc: { type: Number, required: true },
}, {
  timestamps: true,
});

const Placement = mongoose.model('Placement', getHirePlacementSchema);

module.exports = {
  ActiveProcess,
  InvitationSch,
  Placement,
};


