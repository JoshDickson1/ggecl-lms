import { Server as HttpServer } from "http";
import { SocketService } from "./../services/socketService.js";

let socketService: SocketService;

console.log("SocketService initialized");

export function initSocket(server: HttpServer): SocketService {
  if (!socketService) {
    socketService = new SocketService(server);
  }
  return socketService;
}

export function getSocketService(): SocketService {
  if (!socketService) {
    throw new Error("SocketService not initialized");
  }
  return socketService;
}
