import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { socket } from "../lib/socket";
import { receiveLiveHuddleUpdate } from "../store/huddleSlice";

// Joins the Socket.io room for a huddle and keeps Redux in sync with live
// updates from other people voting/RSVPing/finalizing. Safe to call with
// `null` while the huddle id isn't known yet (e.g. still resolving an
// invite code) — it just won't connect until an id is available.
export function useHuddleLiveUpdates(huddleId) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!huddleId) return;

    if (!socket.connected) socket.connect();
    socket.emit("joinHuddleRoom", huddleId);

    const handleUpdate = (updatedHuddle) => {
      dispatch(receiveLiveHuddleUpdate(updatedHuddle));
    };
    socket.on("huddleUpdated", handleUpdate);

    return () => {
      socket.emit("leaveHuddleRoom", huddleId);
      socket.off("huddleUpdated", handleUpdate);
    };
  }, [huddleId, dispatch]);
}
