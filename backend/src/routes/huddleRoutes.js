const express = require("express");
const { protect, optionalAuth } = require("../middleware/auth");
const {
  createHuddle,
  getMyHuddles,
  getHuddleById,
  getHuddleByInviteCode,
  joinHuddle,
  setRsvp,
  voteDate,
  voteLocation,
  addLocationOption,
  finalizeHuddle,
} = require("../controllers/huddleController");

const router = express.Router();

router.post("/", protect, createHuddle);
router.get("/", protect, getMyHuddles);

router.get("/invite/:code", optionalAuth, getHuddleByInviteCode);

router.get("/:id", optionalAuth, getHuddleById);
router.post("/:id/join", optionalAuth, joinHuddle);
router.post("/:id/rsvp", optionalAuth, setRsvp);
router.post("/:id/vote/date/:optionId", optionalAuth, voteDate);
router.post("/:id/vote/location/:optionId", optionalAuth, voteLocation);
router.post("/:id/options/location", optionalAuth, addLocationOption);
router.put("/:id/finalize", protect, finalizeHuddle);

module.exports = router;
