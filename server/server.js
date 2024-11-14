const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Importing conn and schema
const Room = require("./schema.js");
require("./connection.js");

// Middleware setup
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Route handlers
app.get("/", (req, res) => res.send("Okay"));

app.post("/data", async (req, res) => {
  const { name, roomId } = req.body;

  try {
    let room = await Room.findOne({ roomid: roomId });
    const existingUser = room?.username.includes(name);

    if (existingUser) {
      return res.status(200).json({ message: "Data received and updated successfully" });
    }

    if (room) {
      room.username.push(name);
      await room.save();
      return res.status(200).json({ message: "Data received and updated successfully" });
    }

    const newRoom = new Room({ roomid: roomId, username: [name] });
    await newRoom.save();
    res.status(200).json({ message: "Data received and saved successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Real-time chat variables
let users = {};
let usernames = {};
let roomCode = {};
let roomLanguage = {};

async function saveCode(roomId, code) {
  try {
    await Room.findOneAndUpdate({ roomid: roomId }, { code });
  } catch (error) {
    console.error(error);
  }
}

// Socket.io events
io.on("connection", (socket) => {
  socket.on("Update_users", ({ id, username }) => {
    const initializeRoom = async () => {
      socket.join(id);
      socket.username = username;
      socket.broadcast.to(id).emit("New user joined", username);

      if (!users[id]) {
        try {
          const existingRoom = await Room.findOne({ roomid: id });
          roomCode[id] = existingRoom?.code || "";
          users[id] = [];
          usernames[id] = [];
        } catch (error) {
          console.error(error);
        }
      }

      users[id].push(socket.id);
      usernames[id].push(username);
      socket.roomId = id;

      io.to(socket.id).emit("Code for new user", roomCode[id]);

      if (roomLanguage[id]) {
        io.to(socket.id).emit("Language for new user", roomLanguage[id]);
        io.to(socket.id).emit("Mode for new user", roomLanguage[id]);
      }

      io.to(id).emit("User list for frontend", usernames[id]);
    };

    initializeRoom();
  });

  socket.on("Updated code for backend", ({ codetopass, line, ch }) => {
    const roomId = socket.roomId;
    roomCode[roomId] = codetopass;
    io.to(roomId).emit("Updated code for users", { codetopass, line, ch });
  });

  socket.on("Updated mode for backend", (lang) => {
    io.to(socket.roomId).emit("Updated mode for users", lang);
  });

  socket.on("Updated language for backend", (value) => {
    const roomId = socket.roomId;
    roomLanguage[roomId] = value;
    io.to(roomId).emit("Updated language for users", value);
  });

  socket.on("disconnect", () => {
    const roomId = socket.roomId;

    if (roomId) {
      socket.broadcast.to(roomId).emit("User left the room", socket.username);

      users[roomId] = users[roomId].filter((id) => id !== socket.id);
      usernames[roomId] = usernames[roomId].filter((name) => name !== socket.username);
      io.to(roomId).emit("User list for frontend", usernames[roomId]);

      if (users[roomId].length === 0) {
        saveCode(roomId, roomCode[roomId]);
        delete users[roomId];
        delete usernames[roomId];
        delete roomCode[roomId];
        delete roomLanguage[roomId];
      }
    }
  });
});

// Server listening
httpServer.listen(process.env.PORT, () => {
  console.log(`Listening on :${process.env.PORT}`);
});
