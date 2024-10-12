const express = require("express");
const {
    GetEmploye,
    CreateLeaverequest,
    GetAllleaveofaEmployee,
    getAllApprovedLeaves,
    getAllRejectedLeaves,
    getAllPendingLeaves
} = require("../Controllers/EmployeeController");

const EmployeeRouter = express.Router();

EmployeeRouter.get("/GetEmploye/:id", GetEmploye)
EmployeeRouter.post("/CreateLeaverequest/:id", CreateLeaverequest)
EmployeeRouter.get("/GetAllleaveofaEmployee/:id", GetAllleaveofaEmployee)
EmployeeRouter.get("/getAllApprovedLeaves/:id", getAllApprovedLeaves)
EmployeeRouter.get("/getAllRejectedLeaves/:id", getAllRejectedLeaves)
EmployeeRouter.get("/getAllPendingLeaves/:id", getAllPendingLeaves)



module.exports = EmployeeRouter;