const express = require("express");
const {
  GetAllcompany,
  GetAcompany,
  Getjobsofacompany,
  GetAllJobs,
  GetAJobs,
  GetAllStudents,
  GetAStudents,
  Create_Test,
  login,
  createAdmin,
} = require("../Controllers/AdminController");

const AdminRouter = express.Router();

AdminRouter.get("/GetAllcompany", GetAllcompany);
AdminRouter.get("/GetAcompany/:id", GetAcompany);
AdminRouter.get("/Getjobsofacompany/:id", Getjobsofacompany);
AdminRouter.get("/GetAllJobs", GetAllJobs);
AdminRouter.get("/GetAJobs/:id", GetAJobs);
AdminRouter.get("/GetAllStudents", GetAllStudents);
AdminRouter.get("/GetAStudents/:id", GetAStudents);
AdminRouter.post("/Create_Test", Create_Test);
AdminRouter.post("/login", login);
AdminRouter.post("/register", createAdmin);

module.exports = AdminRouter;
