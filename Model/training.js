// const mongoose = require('mongoose');

const { CollegeData } = require("./CollegeData")

// const lectureSchema = new mongoose.Schema({
//   title: { type: String },
//   duration: {type : String},
// });

// const sectionSchema = new mongoose.Schema({
//   sectionTitle: { type: String },
//   lectures: [lectureSchema],
// });

// const courseSchema = new mongoose.Schema({
//   title: { type: String }, //
//   courseImage: { type: String },//
//   demoVideo: { type: String },
//   Videos: { type: String },
//   instructor: { type: String },
//   description: { type: String },
//   lastUpdated: { type: String },
//   languages: { type: [String] },
//   price: { type: Number },
//   originalPrice: { type: Number },
//   discount: { type: Number },
//   couponCode: { type: String },
//   ratings: {
//     stars: { type: Number },
//   },
//   students: { type: Number },
//   includes: {
//     hoursOnDemandVideo: { type: Number },
//     Exercises: { type: Number },
//     articles: { type: Number },
//     downloadableResources: { type: Number },
//     accessOnMobileAndTV: { type: Boolean },
//     fullLifetimeAccess: { type: Boolean },
//     certificateOfCompletion: { type: Boolean },
//   },
//   whatYouWillLearn: { type: [String] },
//   content: {
//     ContentTitle: { type: String },
//     sections: [sectionSchema],
//   },
//   payment: {
//     type: Boolean,
//     default: false,
//   },
// });


// const Course = mongoose.model('Course', courseSchema);

// // Upcoming Event Schema
// const upcomingEventSchema = new mongoose.Schema({
//   hostImage: { type: String, required: true },
//   hostName: { type: String, required: true, trim: true },
//   eventName: { type: String, required: true, trim: true },
//   date: { type: String, required: true },
//   time: { type: String, required: true },  
//   details:{
//     type: String, required: true, trim: true
//   }
// });

// const UpcomingEvent = mongoose.model('UpcomingEvent', upcomingEventSchema);

// // Student Schema
// const studentSchemas = new mongoose.Schema({
//   studentId: {
//     type: mongoose.Schema.Types.ObjectId, // Reference to the Student's ObjectId
//     required: true,
//     ref: 'Student', // Reference to the Student model (assuming you have one)
//   },
//   studentName: {
//     type: String,
//     required: true,
//     trim: true,
//   },
// });

// // Want To Join Upcoming Event Schema
// const WantToJoinUpcomingEventSchema = new mongoose.Schema({
//   adminId: {
//     type: mongoose.Schema.Types.ObjectId, // Reference to the Admin's ObjectId
//     required: true,
//     ref: 'Admin', // Reference to the Admin model (assuming you have one)
//   },
//   students: [studentSchemas], // Array of student objects
//   eventId: {
//     type: mongoose.Schema.Types.ObjectId, // Reference to the Event's ObjectId
//     required: true,
//     ref: 'UpcomingEvent', // Reference to the UpcomingEvent model
//   },
// });
// // Industry Schema
// const industrySchema = new mongoose.Schema({
//   photo: {
//     type: String,
//     required: true,
//   },
//   title: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   video: {
//     type: String,
//     required: true,
//   },
//   name: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   specializationWith: {
//     type: String,
//     required: true,
//     trim: true,
//   },
// });
// const Industry = mongoose.model('Media', industrySchema);
// const WantToJoinUpcomingEvent = mongoose.model('WantToJoinUpcomingEvent', WantToJoinUpcomingEventSchema);

// module.exports = {
//   Course,
//   UpcomingEvent,
//   WantToJoinUpcomingEvent,
//   Industry
// };


//my new Code


const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema({
  title: { type: String },
  duration: {type : String},
});

const sectionSchema = new mongoose.Schema({
  sectionTitle: { type: String },
  lectures: [lectureSchema],
});

const courseSchema = new mongoose.Schema({
  title: { type: String }, //
  courseImage: { type: String },//
  demoVideo: { type: String },
  Videos: { type: String },
  instructor: { type: String },
  description: { type: String },
  lastUpdated: { type: String },
  languages: { type: [String] },
  price: { type: Number },
  originalPrice: { type: Number },
  discount: { type: Number },
  couponCode: { type: String },
  ratings: {
    stars: { type: Number },
  },
  students: { type: Number },
  includes: {
    hoursOnDemandVideo: { type: Number },
    Exercises: { type: Number },
    articles: { type: Number },
    downloadableResources: { type: Number },
    accessOnMobileAndTV: { type: Boolean },
    fullLifetimeAccess: { type: Boolean },
    certificateOfCompletion: { type: Boolean },
  },
  whatYouWillLearn: { type: [String] },
  content: {
    ContentTitle: { type: String },
    sections: [sectionSchema],
  },
  payment: {
    type: Boolean,
    default: false,
  },
});


const Course = mongoose.model('Course', courseSchema);

// Upcoming Event Schema
const upcomingEventSchema = new mongoose.Schema({
  hostImage: { type: String, required: true },
  hostName: { type: String, required: true, trim: true },
  eventName: { type: String, required: true, trim: true },
  date: { type: String, required: true },
  time: { type: String, required: true },  
  details:{
    type: String, required: true, trim: true
  }
});

const UpcomingEvent = mongoose.model('UpcomingEvent', upcomingEventSchema);

// Student Schema
const studentSchemas = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the Student's ObjectId
    required: true,
    ref: 'Student', // Reference to the Student model (assuming you have one)
  },
  studentName: {
    type: String,
    required: true,
    trim: true,
  },
});

// Want To Join Upcoming Event Schema
const WantToJoinUpcomingEventSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the Admin's ObjectId
    required: true,
    ref: 'Admin', // Reference to the Admin model (assuming you have one)
  },
  students: [studentSchemas], // Array of student objects
  eventId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the Event's ObjectId
    required: true,
    ref: 'UpcomingEvent', // Reference to the UpcomingEvent model
  },
});
// Industry Schema
const industrySchema = new mongoose.Schema({
  photo: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  video: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  specializationWith: {
    type: String,
    required: true,
    trim: true,
  },
});
const Industry = mongoose.model('Media', industrySchema);
const WantToJoinUpcomingEvent = mongoose.model('WantToJoinUpcomingEvent', WantToJoinUpcomingEventSchema);

module.exports = {
  Course,
  UpcomingEvent,
  WantToJoinUpcomingEvent,
  Industry
};
