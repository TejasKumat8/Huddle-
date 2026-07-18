import axios from "axios";
import { getGuestId, getGuestName } from "./guest";

// In dev, VITE_API_BASE_URL is unset and requests go to "/api", proxied to
// localhost:5000 by vite.config.js. In production, frontend (Vercel) and
// backend (Render) live on different domains, so this points straight at
// the deployed backend instead.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("huddle_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Attaches guestId/guestName to the body of guest-friendly write requests
// (RSVP, vote, join) so the backend can identify the actor even without a
// logged-in user. Only applied when there is no token — logged-in users are
// identified by their JWT instead.
export function withGuestIdentity(body = {}) {
  const token = localStorage.getItem("huddle_token");
  if (token) return body;
  return { ...body, guestId: getGuestId(), guestName: getGuestName() };
}
