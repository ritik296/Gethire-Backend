const {
  ActiveProcess,
  InvitationSch,
  Placement,
} = require("../Model/Corporate");
const student = require("../Model/studentdata");
const jwt = require("jsonwebtoken");
exports.Invitation = async (req, res) => {
  try {
    const {
      collegeName,
      location,
      numberOfStudents,
      branch,
      position,
      batch,
      description,
    } = req.body;

    const invitation = new InvitationSch({
      collegeName,
      location,
      numberOfStudents,
      branch,
      position,
      batch,
      description,
    });

    await invitation.save();

    res.status(201).json({
      message: "Invitation created successfully",
      invitation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating invitation" });
  }
};
// push

exports.ActiveProcessData = async (req, res) => {
  try {
    const { companyId, companyName, jobRole } = req.body;

    // Validate input data
    if (!companyId || !companyName || !jobRole || !Array.isArray(jobRole)) {
      return res.status(400).json({
        error: "Company ID, Company Name, and Job Roles are required",
      });
    }

    // Check if company ID already exists
    const existingProcess = await ActiveProcess.findOne({ companyId });

    if (existingProcess) {
      // If company ID exists, process job roles
      jobRole.forEach((role) => {
        const existingJobRole = existingProcess.jobRole.find(
          (r) => r.jobTitle === role.jobTitle
        );
        if (existingJobRole) {
          // If job title exists, update the existing job role
          existingJobRole.vacancies = role.vacancies;
        } else {
          // If job title does not exist, add a new job role to the array
          existingProcess.jobRole.push(role);
        }
      });
      // Update the existing process
      await existingProcess.save();
      return res.json(existingProcess);
    } else {
      // If company ID does not exist, create a new active process
      const newProcess = new ActiveProcess({
        companyId,
        companyName,
        jobRole: jobRole,
      });
      // Save the new process to the database
      await newProcess.save();
      return res.json(newProcess);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//active process get
exports.GetActiveProcessData = async (req, res) => {
  try {
    const companies = await student.aggregate([
      { $match: { "placedDetails.companyName": { $ne: null } } },
      {
        $group: {
          _id: "$placedDetails.companyName",
          studentCount: { $sum: 1 },
          highestPackage: { $max: "$placedDetails.salary" },
        },
      },
    ]);
    res.json(companies);
  } catch (error) {
    console.error("Error fetching company details:", error);
    res.status(500).json({ error: "Error fetching company details" });
  }
};

exports.gethireplacment = async (req, res) => {
  try {
    const placements = await Placement.find({});
    res.json(placements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.GetTopPlacedUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    const token = authHeader.split(" ")[1];

    const secretKey = process.env.JWT_SECRET_KEY;

    let objId;
    try {
      const decoded = jwt.verify(token, secretKey);
      objId = decoded.objId;
    } catch (err) {
      console.error("Token verification failed:", err.message);
      return res.status(401).json({ msg: "Token is not valid" });
    }

    // Retrieve all placed students
    const PlacedStudent = await student
      .find({ isPlaced: true })
      .sort({ salary: -1 }) // Sort by salary in descending order
      .limit(5) // Limit to top 5 students
      .lean();

    // Calculate the count of placed students
    const count = PlacedStudent.length;

    // Send response with both count and student list
    res.status(200).json({
      count: count,
      students: PlacedStudent,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
