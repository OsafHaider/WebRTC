import { useContext } from "react";
import { SocketContext } from "../context/socket";

export const useSocket = () => {
  const { socket } = useContext(SocketContext);
  return socket;
};