import axios from "axios";
import { getGuestId, getGuestName } from "./guest";

export const api = axios.create({
  baseURL: "/api",
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
