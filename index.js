const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./db/connect");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const setupSocketIo = require("./Utils/socket");

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
const CompanyRoutes = require("./Routes/CompanyRoute");
const StudentRoutes = require("./Routes/StudentRoute");
const AdminRoutes = require("./Routes/AdminRoute");
const EmployeeRoutes = require("./Routes/EmployeeRoute");
const TestRoutes = require("./Routes/TestRoutes");
const ChatRoutes = require("./Routes/ChatRoutes");
const AdminChatRoutes = require("./Routes/AdminChatRoutes");
const NotificationRoutes = require("./Routes/NotificationRoutes");
const BlogRoutes = require("./Routes/BlogRoutes");
const { sendMessage } = require("./Utils/whatsApp");

// College Routes

app.use("/students", require("./Routes/student"));
app.use("/college", require("./Routes/User"));

app.use("/api/CompanyRoutes", CompanyRoutes);
app.use("/api/StudentRoutes", StudentRoutes);
app.use("/api/AdminRoutes", AdminRoutes);
app.use("/api/EmployeeRoutes", EmployeeRoutes);
app.use("/api/testRoutes", TestRoutes);
app.use("/api/chatRoutes", ChatRoutes);
app.use("/api/adminchatRoutes", AdminChatRoutes);
app.use("/api/notificationroutes", NotificationRoutes);
app.use("/api/blogroutes", BlogRoutes);

app.get("/", (req, res) => {
  res.send("Get Hire API is live!");
  sendMessage(917354406325, "messageBody");
});

// Connect to database
connectDB(process.env.MONGO_URI);

// Initialize Socket.io
setupSocketIo(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
