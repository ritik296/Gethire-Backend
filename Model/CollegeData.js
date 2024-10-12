const mongoose = require('mongoose');

// College Schema
const CollegeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'colleges',
  },
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  college_img: { 
    type: String,
    required: true,
  },
  college_logo: {
    type: String,
    required: true,
  },
  college_logo_name: {
    type: String,
    required: true,
  },
  college_name: {
    type: String,
    required: true,
  },
  college_address: {
    type: String,
    required: true,
  },
  college_website: {
    type: String,
    required: true,
  },
  college_facebook_id: {
    type: String,
    required: true,
  },
  college_linkedin_id: {
    type: String,
    required: true,
  },
  college_whatsapp_num: {
    type: Number,
    required: true,
  },
  college_gmail_id: {
    type: String,
    required: true,
  },
  college_info: {
    type: String,
    required: true,
  },
  college_location: {
    type: String,
    required: true,
  },
});

const CollegeData = mongoose.model('collegedatas', CollegeSchema);

 
const imageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
});
const CollegeEventSchema = new mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'colleges',
  },
  eventName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  eventDate: {
    type: Date,
    required: true,
  },
  images: [imageSchema],
});
const  CollegeEvent = mongoose.model('CollegeEvent', CollegeEventSchema);
 

const placementSchema = new mongoose.Schema({
  placementCompany: {
    type: String,
    required: true,
    trim: true,
  },
  studentName: {
    type: String,
    required: true,
    trim: true,
  },
  ctc: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  }
}, {
  timestamps: true,
});

const collegeSchemaForTopPlace = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' // Adjust if needed
  },
  college_top_placements: [placementSchema]
}, {
  timestamps: true,
});

const Placementc = mongoose.model('Placementc', collegeSchemaForTopPlace);

 


module.exports = {
  Placementc,
  CollegeData,
  CollegeEvent
};
