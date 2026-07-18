import { io } from "socket.io-client";
import { API_BASE_URL } from "./api";

// A single shared socket connection for the whole app. Connects lazily
// (autoConnect: false) so we're not opening a websocket on every page —
// only huddle detail/invite views actually need it. In production,
// API_BASE_URL points at the deployed backend on Render; in dev it's empty
// and the browser connects same-origin through the Vite proxy.
export const socket = io(API_BASE_URL || undefined, {
  autoConnect: false,
  path: "/socket.io",
});
