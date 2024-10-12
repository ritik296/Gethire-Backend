const jwt = require("jsonwebtoken");

const CompanyverifyToken = (req, res, next) => {
  const bearerHeader = req.headers["authorization"];

  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const token = bearer[1];

    jwt.verify(token, "company", (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Unauthorized" });
      } else {
        req.userId = decoded.userId; // Attach userId to request object
        next();
      }
    });
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

const StudentverifyToken = (req, res, next) => {
  const bearerHeader = req.headers["authorization"];

  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const token = bearer[1];

    jwt.verify(token, "Student", (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Unauthorized" });
      } else {
        req.StudentId = decoded.StudentId; // Attach StudentId to request object
        next();
      }
    });
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

const adminVerifyToken = (req, res, next) => {
  const bearerHeader = req.headers["authorization"];

  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const token = bearer[1];

    jwt.verify(token, "admin", (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Unauthorized" });
      } else {
        req.AdminId = decoded.AdminId;
        next();
      }
    });
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = { CompanyverifyToken, StudentverifyToken, adminVerifyToken };
