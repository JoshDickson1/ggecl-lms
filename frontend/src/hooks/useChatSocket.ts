// src/hooks/useChatSocket.ts
// Manages a single Socket.IO connection for the entire app session.
// Follows the hybrid model from the WebSocket Integration Guide:
//   - SENDING  → REST API
//   - RECEIVING → socket events (message:new, message:deleted, message:reacted, etc.)

import { useEffect, useRef, useCallback } from "react";
import { io, type Socket } from "socket.io-client";
import type { ChatMessage, MessageReaction } from "@/services/chat.service";

const SOCKET_URL = import.meta.env.VITE_API_URL as string;

// ─── Event payloads ───────────────────────────────────────────────────────────

export interface MessageDeletedPayload {
  messageId: string;
  roomId: string;
  deletedLabel: string | null;
}

export interface MessageReactedPayload {
  messageId: string;
  reaction: MessageReaction;
  userId: string;
  toggled: "added" | "removed";
}

export interface MessagePinnedPayload {
  messageId: string;
  roomId: string;
}

export interface MemberAddedPayload {
  roomId: string;
  userId: string;
}

export interface MemberRemovedPayload {
  roomId: string;
  userId: string;
}

export interface ChatSocketHandlers {
  onMessageNew?:     (msg: ChatMessage) => void;
  onMessageDeleted?: (payload: MessageDeletedPayload) => void;
  onMessageReacted?: (payload: MessageReactedPayload) => void;
  onMessagePinned?:  (payload: MessagePinnedPayload) => void;
  onMemberAdded?:    (payload: MemberAddedPayload) => void;
  onMemberRemoved?:  (payload: MemberRemovedPayload) => void;
}

// Singleton socket — created once, reused across hook calls
let _socket: Socket | null = null;

function getSocket(): Socket {
  if (!_socket) {
    _socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: false,
      // Exponential backoff — prevents spamming the server on CORS/auth failures
      reconnectionDelay: 2000,
      reconnectionDelayMax: 30000,
      reconnectionAttempts: 5,
    });
  }
  return _socket;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useChatSocket(handlers: ChatSocketHandlers) {
  const socket = getSocket();
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    if (!socket.connected) socket.connect();

    const onConnect = () => {
      console.log("[socket] connected:", socket.id);
    };

    const onConnectError = (err: Error) => {
      console.error("[socket] connect_error:", err.message);
    };

    const onDisconnect = (reason: string) => {
      console.warn("[socket] disconnected:", reason);
    };

    const onMessageNew = (msg: ChatMessage) => {
      handlersRef.current.onMessageNew?.(msg);
    };

    const onMessageDeleted = (payload: MessageDeletedPayload) => {
      handlersRef.current.onMessageDeleted?.(payload);
    };

    const onMessageReacted = (payload: MessageReactedPayload) => {
      handlersRef.current.onMessageReacted?.(payload);
    };

    const onMessagePinned = (payload: MessagePinnedPayload) => {
      handlersRef.current.onMessagePinned?.(payload);
    };

    const onMemberAdded = (payload: MemberAddedPayload) => {
      handlersRef.current.onMemberAdded?.(payload);
    };

    const onMemberRemoved = (payload: MemberRemovedPayload) => {
      handlersRef.current.onMemberRemoved?.(payload);
    };

    socket.on("connect",          onConnect);
    socket.on("connect_error",    onConnectError);
    socket.on("disconnect",       onDisconnect);
    socket.on("message:new",      onMessageNew);
    socket.on("message:deleted",  onMessageDeleted);
    socket.on("message:reacted",  onMessageReacted);
    socket.on("message:pinned",   onMessagePinned);
    socket.on("member:added",     onMemberAdded);
    socket.on("member:removed",   onMemberRemoved);

    return () => {
      socket.off("connect",         onConnect);
      socket.off("connect_error",   onConnectError);
      socket.off("disconnect",      onDisconnect);
      socket.off("message:new",     onMessageNew);
      socket.off("message:deleted", onMessageDeleted);
      socket.off("message:reacted", onMessageReacted);
      socket.off("message:pinned",  onMessagePinned);
      socket.off("member:added",    onMemberAdded);
      socket.off("member:removed",  onMemberRemoved);
    };
  }, [socket]);

  // Join a room (subscribe to its live event stream)
  const joinRoom = useCallback((roomId: string) => {
    socket.emit("join-room", { roomId }, (ack: { joined: boolean }) => {
      console.log("[socket] joined room:", roomId, ack);
    });
  }, [socket]);

  // Leave a room
  const leaveRoom = useCallback((roomId: string) => {
    socket.emit("leave-room", { roomId });
  }, [socket]);

  // Join multiple rooms at once (for background notification subscriptions)
  const joinRooms = useCallback((roomIds: string[]) => {
    roomIds.forEach(id => socket.emit("join-room", { roomId: id }));
  }, [socket]);

  return { socket, joinRoom, leaveRoom, joinRooms };
}
