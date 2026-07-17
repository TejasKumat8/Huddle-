const GUEST_ID_KEY = "huddle_guest_id";
const GUEST_NAME_KEY = "huddle_guest_name";

function makeGuestId() {
  return "g_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function getGuestId() {
  let id = localStorage.getItem(GUEST_ID_KEY);
  if (!id) {
    id = makeGuestId();
    localStorage.setItem(GUEST_ID_KEY, id);
  }
  return id;
}

export function getGuestName() {
  return localStorage.getItem(GUEST_NAME_KEY) || "";
}

export function setGuestName(name) {
  localStorage.setItem(GUEST_NAME_KEY, name);
}
