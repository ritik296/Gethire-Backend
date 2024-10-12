const {
  CollegeData,
  CollegeEvent,
  Placementc,
} = require("../Model/CollegeData");
const path = require("path");

// Create a new college entry
const createCollege = async (req, res) => {
  console.log(1);
  try {
    const college = new CollegeData(req.body);
    if (req.files) {
      if (req.files.college_img) {
        college.college_img = req.files.college_img[0].path;
      }
      if (req.files.college_logo) {
        college.college_logo = req.files.college_logo[0].path;
      }
    }

    await college.save();
    res.status(201).json(college);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get a college by ID
const getColleges = async (req, res) => {
  try {
    const userId = req.params;
    if (!userId) {
      return res.status(400).json({ error: "userId parameter is required" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const colleges = await CollegeData.find({ userId: userObjectId });
    if (colleges.length === 0) {
      return res
        .status(404)
        .json({ error: "No colleges found for the given userId" });
    }

    res.status(200).json(colleges);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a college by ID
const updateCollegeById = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate ObjectId
    console.log("userId:", userId);
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const updates = req.body;

    // Handle file uploads
    if (req.files) {
      if (req.files.college_img) {
        updates.college_img = req.files.college_img[0].path;
      }
      if (req.files.college_logo) {
        updates.college_logo = req.files.college_logo[0].path;
      }
    }

    console.log("Updates:", updates); // Log the updates being made

    const college = await CollegeData.findOneAndUpdate({ userId }, updates, {
      new: true,
    });

    if (!college) {
      console.log("College not found for userId:", userId); // Log if college is not found
      return res.status(404).json({ error: "College not found" });
    }

    res.status(200).json(college);
  } catch (error) {
    console.error("Error during update:", error); // Log the error
    res.status(400).json({ error: error.message });
  }
};
// Delete a college by ID
const deleteCollegeById = async (req, res) => {
  try {
    const college = await CollegeData.findByIdAndDelete(req.params.id);
    if (!college) {
      return res.status(404).json({ error: "College not found" });
    }
    res.status(200).json({ message: "College deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const mongoose = require("mongoose");
const { Placement } = require("../Model/Corporate");
const { Types } = mongoose;

const eventUpload = async (req, res) => {
  const { id } = req.params;
  const { eventName, description, eventDate } = req.body;
  const files = req.files;

  // Log input data for debugging
  console.log("Received data:", {
    id,
    eventName,
    description,
    eventDate,
    files,
  });
  if (
    !eventName ||
    !description ||
    !eventDate ||
    !files ||
    files.length === 0
  ) {
    return res.status(400).json({ error: "Invalid input data" });
  }
  const trimmedId = id.trim();
  // Validate ObjectId
  if (!Types.ObjectId.isValid(trimmedId)) {
    return res.status(400).json({ error: "Invalid ObjectId format" });
  }

  try {
    // Map the files to create image URLs
    const images = files.map((file) => ({
      url: `/uploads/${file.filename}`,
    }));

    // Find the event by ID and event name separately
    let event = await CollegeEvent.findOne({ userid: trimmedId, eventName });

    if (event) {
      // If the event exists, update it
      event.description = description;
      event.eventDate = eventDate;

      // Ensure event.images is an array before appending
      if (!Array.isArray(event.images)) {
        event.images = [];
      }

      // Append new images to the existing images array
      event.images.push(...images);
    } else {
      // If the event does not exist, create a new one
      event = new CollegeEvent({
        userid: trimmedId,
        eventName,
        description,
        eventDate,
        images,
      });
    }

    // Save the event
    await event.save();

    res
      .status(200)
      .json({ message: "College event saved successfully", event });
  } catch (error) {
    console.error("Error occurred while saving the event:", error);
    res.status(500).json({ error: "An error occurred while saving the event" });
  }
};

const getEventById = async (req, res) => {
  const { id } = req.params;
  const { eventName } = req.body;
  console.log(req.body);
  try {
    const event = await CollegeEvent.findOne({
      userid: id,
      eventName: eventName,
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.status(200).json(event);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching the event" });
  }
};

const CollegeDataPlacementAdd = async (req, res) => {
  const { placements } = req.body;
  console.log("PLACEMENT DATA SIS  ", placements);
  const { id } = req.params;
  console.log(id);

  // Validate the placements array
  if (!Array.isArray(placements) || placements.length === 0) {
    return res
      .status(400)
      .send({ Status: "Placements array is required and should not be empty" });
  }

  // Validate each placement object
  for (const placement of placements) {
    if (
      !placement.placementCompany ||
      !placement.studentName ||
      !placement.ctc ||
      !placement.location
    ) {
      return res
        .status(400)
        .send({
          Status:
            "Each placement object must contain placementCompany, studentName, ctc, and location",
        });
    }
  }

  try {
    // Find the college by userId and update the top placements
    let updatedCollege = await Placementc.findOneAndUpdate(
      { userId: id }, // Search criteria
      { $push: { college_top_placements: { $each: placements } } }, // Add new placements
      { new: true, runValidators: true } // Return the updated document and validate
    );

    // If no document is found, create a new one
    if (!updatedCollege) {
      const newCollege = new Placementc({
        userId: id,
        college_top_placements: placements,
      });
      updatedCollege = await newCollege.save();
    }

    res
      .status(200)
      .send({ Status: "Placements added successfully", updatedCollege });
  } catch (error) {
    console.error(
      "Error while adding top placements:",
      error.message,
      error.stack
    );
    res
      .status(500)
      .send({
        Status: "Error while adding top placements",
        Error: error.message,
      });
  }
};
const getCollegepalcement = async (req, res) => {
  try {
    // Access userId parameter from req.params
    const { id } = req.params;
    // Check if id is provided
    if (!id) {
      return res.status(400).json({ error: "id parameter is required" });
    }

    // Convert id to MongoDB ObjectId
    const userObjectId = new mongoose.Types.ObjectId(id);

    // Query the database for placements with the given id
    const colleges = await Placementc.find({ userId: userObjectId });

    // Check if any colleges are found
    if (colleges.length === 0) {
      return res
        .status(404)
        .json({ error: "No placements found for the given id" });
    }

    // Respond with the found colleges
    res.status(200).json({ updatedCollege: colleges });
  } catch (error) {
    // Handle and respond with the error message
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createCollege,
  getColleges,

  updateCollegeById,
  deleteCollegeById,
  CollegeDataPlacementAdd,
  getCollegepalcement,
  eventUpload,
  getEventById,
};
