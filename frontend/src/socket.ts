import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket = (token: string) => {
  const base = (import.meta.env.VITE_API_URL || "").replace(/\/api$/, "");
  socket = io(base, { auth: { token }, transports: ["websocket"] });
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};
