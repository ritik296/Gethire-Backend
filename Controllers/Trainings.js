const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Course, UpcomingEvent, WantToJoinUpcomingEvent,  Industry } = require('../Model/training');
 
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Specify the destination directory
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});
// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000000 }, // Set file size limit to 1GB (in bytes)
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).fields([
  { name: 'photo', maxCount: 1 },
  { name: 'video', maxCount: 1 },
  { name: 'hostImage', maxCount: 1 },
]);
// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif|mp4/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Images and videos only!'));
}
}

exports.uploadCourse = async (req, res) => {
  // Initialize the courseData object
  let courseData = { ...req.body };

  // Parse JSON strings if present
  try {
    if (courseData.languages) {
      courseData.languages = JSON.parse(courseData.languages);
    }
    if (courseData.whatYouWillLearn) {
      courseData.whatYouWillLearn = JSON.parse(courseData.whatYouWillLearn);
    }
    if (courseData.includes) {
      courseData.includes = JSON.parse(courseData.includes);
    }
    if (courseData.content) {
      courseData.content = JSON.parse(courseData.content);
    }
  } catch (error) {
    console.error('Error parsing JSON data:', error);
    return res.status(400).send('Invalid JSON format');
  }

  // Handle file uploads if present
  if (req.files) {
    if (req.files.courseImage) {
      courseData.courseImage = req.files.courseImage[0].path;
    }
    if (req.files.demoVideo) {
      courseData.demoVideo = req.files.demoVideo[0].path;
    }
    if (req.files.Videos) {
      courseData.Videos = req.files.Videos[0].path;
    }
  }

  // Create and save the new Course instance
  const course = new Course(courseData);

  try {
    const savedCourse = await course.save();
    res.status(201).json(savedCourse);
  } catch (error) {
    console.error('Error saving course:', error);
    res.status(400).send(error);
  }
};


exports.getCourse = async (req, res) => {
  try {
    const courses = await Course.find().sort({ _id: -1 });
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteCourse = async (req, res) => {
  const id = req.params.id;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: `Invalid course ID ${id}` });
    }

    const deleteResult = await Course.deleteOne({ _id: id });

    if (deleteResult.deletedCount > 0) {
      res.status(200).json({ message: "Course deleted successfully" });
    } else {
      res.status(404).json({ message: "Course not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

 // Adjust the path to your Course model

exports.updateCourse = async (req, res) => {
  const courseId = req.params.id;
  const courseData = req.body;
console.log("data" ,courseData)
  if (!courseData.content) {
    courseData.content = {};
  }

  // Handle file uploads
  if (req.files) {
    if (req.files.courseImage) {
      courseData.courseImage = req.files.courseImage[0].path;
    }
    if (req.files.demoVideo) {
      courseData.demoVideo = req.files.demoVideo[0].path;
    }
    if (req.files.Videos) {
      if (!courseData.content.Videos) {
        courseData.content.Videos = [];
      }
      courseData.content.Videos = req.files.Videos.map(file => file.path);
    }
  }

  try {
    // Validate course ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ msg: `Invalid course ID ${courseId}` });
    }

    // Find the course to update
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    // Update course fields only if they are provided
    Object.keys(courseData).forEach(key => {
      if (courseData[key] !== undefined) {
        course[key] = courseData[key];
      }
    });

    // Save the updated course
    const updatedCourse = await course.save();
    console.log(updatedCourse);
    res.status(200).json(updatedCourse);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(400).send(error);
  }
};


// Industry Talk Handlers
exports.industryTalk = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).send({ error: err.message });
    }

    try {
      const { name, title, specializationWith } = req.body;

      if (!req.files || !req.files.photo || !req.files.video) {
        return res.status(400).send({ error: 'Photo and video are required' });
      }

      const newMedia = new Industry({
        photo: req.files.photo[0].path,
        video: req.files.video[0].path,
        name,
        specializationWith,
        title
      });

      await newMedia.save();
      res.status(201).send(newMedia);
    } catch (error) {
      res.status(500).send({ error: 'Failed to create media' });
    }
  });
};

exports.deleteIndustryTalk = async (req, res) => {
  const { id } = req.params;

  try {
    const media = await Industry.findById(id);

    if (!media) {
      return res.status(404).send({ error: 'Document not found' });
    }

    const photoPath = path.join(__dirname, media.photo);
    const videoPath = path.join(__dirname, media.video);

    fs.unlink(photoPath, (err) => {
      if (err) console.error('Error deleting photo:', err);
    });

    fs.unlink(videoPath, (err) => {
      if (err) console.error('Error deleting video:', err);
    });

    await Industry.findByIdAndDelete(id);
    res.status(200).send({ message: 'Files and document deleted successfully' });
  } catch (error) {
    res.status(500).send({ error: 'Failed to delete files' });
  }
};

exports.getAllIndustryTalk = async (req, res) => {
  try {
    const media = await Industry.find().sort({ _id: -1 });
    res.status(200).send(media);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch documents' });
  }
};

// Upcoming Events Handlers
exports.UpcomingEventController = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const { hostName, eventName, date, time ,details } = req.body;

      if (!hostName || !eventName || !date || !time ||!details) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      const newEvent = new UpcomingEvent({
        hostImage: req.files.hostImage ? req.files.hostImage[0].path : null,
        hostName,
        eventName,
        date,
        time,
        details
      });

      await newEvent.save();
      res.status(201).json({ message: 'Event created successfully', event: newEvent });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
};
exports.geteventall = async (req, res) => {
  try {
    const events = await UpcomingEvent.find().sort({ _id: -1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error });
  }
};
exports.DeleteEvents = async (req, res) => {
  try {
    const eventId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const deletedEvent = await UpcomingEvent.findByIdAndDelete(eventId);

    if (!deletedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.WantToJoinUpcomingEvents = async (req, res) => {
  try {
    const { adminId, students, eventId } = req.body;

    if (!adminId || !students || !eventId) {
      return res.status(400).json({ error: 'adminId, students, and eventId are required' });
    }

    let entry = await WantToJoinUpcomingEvent.findOne({ adminId, eventId });

    if (!entry) {
      return res.status(404).json({ error: 'Admin ID not found. No entry created.' });
    }

    for (let student of students) {
      if (entry.students.some(existingStudent => existingStudent.studentId.equals(student.studentId))) {
        return res.status(400).json({ error: `Student with ID ${student.studentId} is already enrolled.` });
      }
    }

    entry.students = [...entry.students, ...students];

    await entry.save();
    res.status(200).json({ message: 'Entry updated successfully', entry });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.RemoveStudentFromUpcomingEvent = async (req, res) => {
  try {
    const { adminId, studentId, eventId } = req.body;

    if (!adminId || !studentId || !eventId) {
      return res.status(400).json({ error: 'adminId, studentId, and eventId are required' });
    }

    let entry = await WantToJoinUpcomingEvent.findOne({ adminId, eventId });

    if (!entry) {
      return res.status(404).json({ error: 'Admin ID or Event ID not found. No entry exists.' });
    }

    const studentIndex = entry.students.findIndex(existingStudent => existingStudent.studentId.equals(studentId));
    if (studentIndex === -1) {
      return res.status(404).json({ error: 'Student ID not found in the event.' });
    }

    entry.students.splice(studentIndex, 1);

    await entry.save();
    res.status(200).json({ message: 'Student removed successfully', entry });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.TopCoursesTraining = async (req, res) => {
  try {
    const topCourses = await Course.find()
      .sort({ 'ratings.stars': -1 }) // Sort by stars rating in descending order
      .limit(3) // Limit the results to top 10
        

    res.status(200).json({ topCourses });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
