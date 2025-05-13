import { API_URL } from "@/api/client";
import { io } from "socket.io-client";

const socketAPI = API_URL.replace("http", "ws").replace("/api/v1", "");

const socket = io(socketAPI, {
  withCredentials: true,
  transports: ["websocket"],
});

export default socket;
export { socketAPI };
