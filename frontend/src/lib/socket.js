import { io } from "socket.io-client";

// A single shared socket connection for the whole app. Connects lazily
// (autoConnect: false) so we're not opening a websocket on every page —
// only huddle detail/invite views actually need it.
export const socket = io({
  autoConnect: false,
  path: "/socket.io",
});
