require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const huddleRoutes = require("./routes/huddleRoutes");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || "*" },
});

// Make io accessible in controllers via req.app.get("io") once we wire up
// live vote/RSVP broadcasts in the real-time session.
app.set("io", io);

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/huddles", huddleRoutes);

// Socket.io: clients join a room per huddle so we can broadcast
// vote/RSVP updates only to people viewing that huddle.
io.on("connection", (socket) => {
  socket.on("joinHuddleRoom", (huddleId) => {
    socket.join(huddleId);
  });
  socket.on("leaveHuddleRoom", (huddleId) => {
    socket.leave(huddleId);
  });
});

// Centralized error handler (catches anything thrown outside try/catch)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  connectDB().then(() => {
    server.listen(PORT, () => console.log(`Huddle API running on port ${PORT}`));
  });
}

module.exports = { app, server, io };
