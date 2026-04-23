import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../hooks/use-socket";
import { useNavigate } from "react-router-dom";
const HomePage = () => {
  const socket = useSocket();
  const navigate=useNavigate()
  const [email, setEmail] = useState("");
  const [roomId, setRoomId] = useState("");
const handleJoinRoom = useCallback((data) => {
  const { email, roomId } = data;
  console.log(email,roomId)
  navigate(`/room/${roomId}`)
}, [navigate]);
  useEffect(
    function () {
      socket.on("join-room", handleJoinRoom);
      return () => {
        socket.off("join-room", handleJoinRoom);
      };
    },
    [roomId, socket, handleJoinRoom],
  );

  const handleUserJoin = useCallback(() => {
    socket.emit("join-room", { email, roomId });
  }, [email, roomId, socket]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6 space-y-5">
        <h1 className="text-xl font-semibold text-gray-800 text-center">
          Join Room
        </h1>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Room ID */}
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Room ID</label>
          <input
            type="text"
            placeholder="Enter room ID"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
        </div>

        {/* Button */}
        <button
          onClick={handleUserJoin}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg font-medium transition duration-200 active:scale-[0.98]"
        >
          Send Message
        </button>
      </div>
    </div>
  );
};

export default HomePage;
