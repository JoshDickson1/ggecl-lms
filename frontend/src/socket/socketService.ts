import { Socket, io } from "socket.io-client";
import { socketAPI } from "./socketIo";

interface CreateGroupData {
  groupId: string;
  adminId: string;
  groupName: string;
  students: string[];
  instructors: string[];
}

class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io(socketAPI, {
      withCredentials: true,
      transports: ["websocket"],
    });
  }

  connect(userId: string) {
    this.socket.io.opts.query = { userId };
    if (!this.socket.connected) this.socket.connect();
  }

  disconnect() {
    this.socket.disconnect();
  }

  emit(event: string, data: any, ack?: (response: any) => void) {
    this.socket.emit(event, data, ack);
  }

  on(event: string, callback: (...args: any[]) => void) {
    this.socket.on(event, callback);
  }

  off(event: string, callback: (...args: any[]) => void) {
    this.socket.off(event, callback);
  }

  // Group-related shortcuts
  createGroup(
    data: CreateGroupData,
    ack?: (response: {
      success: boolean;
      newGroup?: any;
      error?: string;
    }) => void,
  ) {
    this.emit("createGroup", data, ack);
  }

  joinGroup(data: { groupId: string; userId: string }) {
    this.emit("joinGroup", data);
  }

  sendMessage(data: { groupId: string; sender: string; text: string }) {
    this.emit("sendMessage", data);
  }
}

const socketService = new SocketService();
export default socketService;
