const asynchandler = require('express-async-handler');
const response = require('../Middleware/responseMiddlewares');
const EmployeeModel = require('../Model/EmployeeModel');

const formatDate = (dateString) => {
    const parts = dateString.split('/');

    const day = parseInt(parts[0], 10) + 1;
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);

    return new Date(year, month, day);
}

const GetEmploye = asynchandler(async (req, res) => {
    try {
        const { id } = req.params
        const Employee = await EmployeeModel.findById(id).populate("studentId").populate('companyId')

        if (!Employee) {
            return response.notFoundError(res, "Employee Not found")
        }
        return response.successResponse(res, Employee, "Get Employee successfull")

    } catch (error) {
        console.log(error)
        return response.internalServerError(res, "Internal server error")
    }
})



const CreateLeaverequest = asynchandler(async (req, res) => {

    try {
        const { leaveType, startDate, endDate, ishalfday } = req.body;
        const { id } = req.params;

        const employee = await EmployeeModel.findById(id);
        if (!employee) {
            return response.notFound(res, "Employee not found");
        }

        let sdate = formatDate(startDate)
        let edate = formatDate(endDate)

        const newLeaveRequest = {
            leaveType: leaveType,
            startDate: sdate,
            endDate: edate,
            ishalfday: ishalfday
        };

        employee.leaveRequests.push(newLeaveRequest);

        await employee.save();

        return response.successResponse(res, newLeaveRequest, "Leave request created successfully");

    } catch (error) {
        console.log(error)
        return response.internalServerError(res, "Internal server error")
    }
})


const GetAllleaveofaEmployee = asynchandler(async (req, res) => {
    try {

        const { id } = req.params

        const employee = await EmployeeModel.findById(id)


        if (!employee) {
            return response.notFoundError(res, "Employee not found")
        }

        let leaves = employee?.leaveRequests

        return response.successResponse(res, leaves, "get all leaves")

    } catch (error) {
        console.log(error)
        return response.internalServerError(res, "Internal server error")
    }
})

const getAllApprovedLeaves = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await EmployeeModel.findById(id);

        if (!employee) {
            return response.notFoundError(res, "Employee not found");
        }

        const approvedLeaves = employee.leaveRequests.filter(request => request.status === 'Approved');

        return response.successResponse(res, approvedLeaves, "Get all approved leaves");
    } catch (error) {
        console.error(error);
        return response.internalServerError(res, "Internal server error");
    }
};


const getAllRejectedLeaves = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await EmployeeModel.findById(id);

        if (!employee) {
            return response.notFoundError(res, "Employee not found");
        }

        const rejectedLeaves = employee.leaveRequests.filter(request => request.status === 'Rejected');

        return response.successResponse(res, rejectedLeaves, "Get all rejected leaves");
    } catch (error) {
        console.error(error);
        return response.internalServerError(res, "Internal server error");
    }
};

const getAllPendingLeaves = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await EmployeeModel.findById(id);

        if (!employee) {
            return response.notFoundError(res, "Employee not found");
        }

        const pendingLeaves = employee.leaveRequests.filter(request => request.status === 'Pending');

        return response.successResponse(res, pendingLeaves, "Get all pending leaves");
    } catch (error) {
        console.error(error);
        return response.internalServerError(res, "Internal server error");
    }
};



const getAllEmployeesLeaveRequests = async (req, res) => {
    try {

        const employees = await EmployeeModel.find();

        let allLeaveRequests = [];

        employees.forEach(employee => {
            const leaveRequests = employee.leaveRequests.map(request => ({
                employeeId: employee._id,
                employeeName: employee.studentId.Name,
                leaveRequest: request
            }));

            allLeaveRequests.push(...leaveRequests);
        });

        return response.successResponse(res, allLeaveRequests, "Get all employees' leave requests");
    } catch (error) {
        console.error(error);
        return response.internalServerError(res, "Internal server error");
    }
};



module.exports = {
    GetEmploye,
    CreateLeaverequest,
    GetAllleaveofaEmployee,
    getAllApprovedLeaves,
    getAllRejectedLeaves,
    getAllPendingLeaves,
    getAllEmployeesLeaveRequests
}