const express = require("express");
const { Server } = require("socket.io");
const http = require("http");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const userSocketMap = {};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    delete userSocketMap[userId];
  });
});

module.exports = { app, server, io };
