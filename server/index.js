import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});
const emailToSocketIDMap = new Map();
const socketIDToEmailMap = new Map()
io.on("connection", (socket) => {
  console.log(`User is Connected userID is ${socket.id}`);
  socket.on("join-room", (data) => {
    const { email, roomID } = data;
    emailToSocketIDMap.set(email, socket.id);
    socketIDToEmailMap.set(socket.id, email)
    io.to(roomID).emit("user-joined", { email, id: socket.id });
    socket.join(roomID);
    io.to(socket.id).emit("join-room", data)
  });

  socket.on("user-call", (data) => {
    const { to, offer } = data
    io.to(to).emit("incomming-call", {
      from: socket.id,
      offer
    })
  })

  socket.on("call-accepted", (data) => {
    const { to, answer } = data;
    io.to(to).emit("call-accepted", {
      from: socket.id,
      answer
    })
  })

  socket.on("peer-negotiation", (data) => {
    const { to, offer } = data;
    io.to(to).emit("peer-negotiation", {
      from: socket.id,
      offer
    })
  })





  socket.on("nego-done", (data) => {
    const { to, answer } = data;
    io.to(to).emit("nego-done-final", {
      from: socket.id,
      answer
    })
  })
})
server.listen(8000, () => {
  console.log("Server is up and running on port 8000");
});
