const Student = require("../Model/studentdata");
const xlsx = require("xlsx");
const jwt = require("jsonwebtoken");


exports.uploadStudentData = async (req, res) => {
  try {
    const filePath = req.file.path;
    const token = req.headers.authorization.split(" ")[1];

    let objId;
    const secretKey = process.env.JWT_SECRET_KEY;
    if (token) {
      try {
        const decoded = jwt.verify(token, secretKey);
        objId = decoded.objId;
      } catch (err) {
        console.error("Token verification failed:", err.message);
        return res.status(401).json({ msg: "Token is not valid" });
      }
    } else {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    const workbook = xlsx.readFile(filePath);
    const sheet_name_list = workbook.SheetNames;
    const studentData = xlsx.utils.sheet_to_json(
      workbook.Sheets[sheet_name_list[0]]
    );

    for (const student of studentData) {
      student.isPlaced = Boolean(
        student.isPlaced && student.isPlaced.toString().toLowerCase() === "true"
      );
      student.PlacementRequired = Boolean(
        student.PlacementRequired &&
          student.PlacementRequired.toString().toLowerCase() === "true"
      );
      student.internshipRequired = Boolean(
        student.internshipRequired &&
          student.internshipRequired.toString().toLowerCase() === "true"
      ); // Corrected spelling

      const contactInformation = {
        phone: student.phone,
        email: student.email,
      };

      const updatedStudent = {
        userId: objId, // Ensure this is the correct userId
        studentId: student.studentId,
        name: student.name,
        dob: new Date(student.dob), // Ensure the date is properly formatted
        gender: student.gender,
        contactInformation: contactInformation,
        address: student.address,
        department: student.department,
        yearOfStudy: student.yearOfStudy,
        cgpa: student.cgpa,
        isPlaced: student.isPlaced,
        companyName: student.companyName || null,
        jobTitle: student.jobTitle || null,
        salary: student.salary || null,
        PlacementRequired: student.PlacementRequired,
        internshipRequired: student.internshipRequired,
      };

      await Student.findOneAndUpdate(
        { studentId: student.studentId },
        updatedStudent,
        { upsert: true, new: true }
      );
      console.log("Updating student record:", updatedStudent);
    }

    res.status(200).json({ msg: "Student data uploaded successfully" });
  } catch (error) {
    console.error("Error uploading student data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
// fatch api all data
exports.GetAllUser = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    let objId;
    const secretKey = process.env.JWT_SECRET_KEY;
    if (token) {
      try {
        const decoded = jwt.verify(token, secretKey);
        objId = decoded.objId;
      } catch (err) {
        console.error("Token verification failed:", err.message);
        return res.status(401).json({ msg: "Token is not valid" });
      }
    } else {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }
    const students = await Student.find({ userId: objId });
    const count = students.length;
    res.status(200).json({
      count: count,
      students: students,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
//fitter
exports.filter = async (req, res) => {
  const {
    department,
    isPlaced,
    internshipRequired,
    PlacementRequired,
    yearOfStudy,
  } = req.body;

  try {
    const token = req.headers.authorization.split(" ")[1];
    let objId;
    const secretKey = process.env.JWT_SECRET_KEY;

    if (token) {
      try {
        const decoded = jwt.verify(token, secretKey);
        objId = decoded.objId;
      } catch (err) {
        console.error("Token verification failed:", err.message);
        return res.status(401).json({ msg: "Token is not valid" });
      }
    } else {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }
    const filters = { userId: objId };
    if (department) filters.department = department;
    if (isPlaced) filters.isPlaced = isPlaced === "true";
    if (internshipRequired)
      filters.internshipRequired = internshipRequired === "true";
    if (PlacementRequired)
      filters.PlacementRequired = PlacementRequired === "true";
    if (yearOfStudy) filters.yearOfStudy = parseInt(yearOfStudy, 10);

    const students = await Student.find(filters);
    res.send(students);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// get by user
exports.GetByName = async (req, res) => {
  const { name } = req.body;
  try {
    const token = req.headers.authorization.split(" ")[1];
    let objId;
    const secretKey = process.env.JWT_SECRET_KEY;
    if (token) {
      try {
        const decoded = jwt.verify(token, secretKey);
        objId = decoded.objId;
      } catch (err) {
        console.error("Token verification failed:", err.message);
        return res.status(401).json({ msg: "Token is not valid" });
      }
    } else {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    if (!name) {
      return res
        .status(400)
        .json({ message: "Name query parameter is required" });
    }

    let query = { userId: objId };

    if (name.length == 1) {
      query.name = new RegExp(name, "i");
    } else {
      const startsWithPattern = new RegExp(`^${name}`, "i");
      const exactPattern = new RegExp(`^${name}$`, "i");

      query = {
        userId: objId,
        $or: [{ name: startsWithPattern }, { name: exactPattern }],
      };
    }

    const students = await Student.find(query).lean();

    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.uploadStudentData = async (req, res) => {
  try {
    const filePath = req.file.path;
    const token = req.headers.authorization.split(" ")[1];

    let objId;
    const secretKey = process.env.JWT_SECRET_KEY;
    if (token) {
      try {
        const decoded = jwt.verify(token, secretKey);
        objId = decoded.objId;
      } catch (err) {
        console.error("Token verification failed:", err.message);
        return res.status(401).json({ msg: "Token is not valid" });
      }
    } else {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    const workbook = xlsx.readFile(filePath);
    const sheet_name_list = workbook.SheetNames;
    const studentData = xlsx.utils.sheet_to_json(
      workbook.Sheets[sheet_name_list[0]]
    );

    for (const student of studentData) {
      student.isPlaced = Boolean(
        student.isPlaced && student.isPlaced.toString().toLowerCase() === "true"
      );
      student.PlacementRequired = Boolean(
        student.PlacementRequired &&
          student.PlacementRequired.toString().toLowerCase() === "true"
      );
      student.internshipRequired = Boolean(
        student.internshipRequired &&
          student.internshipRequired.toString().toLowerCase() === "true"
      ); // Corrected spelling

      const contactInformation = {
        phone: student.phone,
        email: student.email,
      };

      const updatedStudent = {
        userId: objId, // Ensure this is the correct userId
        studentId: student.studentId,
        name: student.name,
        dob: new Date(student.dob), // Ensure the date is properly formatted
        gender: student.gender,
        contactInformation: contactInformation,
        address: student.address,
        department: student.department,
        yearOfStudy: student.yearOfStudy,
        cgpa: student.cgpa,
        isPlaced: student.isPlaced,
        companyName: student.companyName || null,
        jobTitle: student.jobTitle || null,
        salary: student.salary || null,
        PlacementRequired: student.PlacementRequired,
        internshipRequired: student.internshipRequired,
      };

      await Student.findOneAndUpdate(
        { studentId: student.studentId },
        updatedStudent,
        { upsert: true, new: true }
      );
      console.log("Updating student record:", updatedStudent);
    }

    res.status(200).json({ msg: "Student data uploaded successfully" });
  } catch (error) {
    console.error("Error uploading student data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.GetPlacedUser = async (req, res) => {
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
    const PlacedStudent = await Student.find({ isPlaced: true }).lean();
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