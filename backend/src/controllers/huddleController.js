const Huddle = require("../models/Huddle");
const generateInviteCode = require("../utils/generateInviteCode");

// Resolves "who is acting" from either a logged-in user or a guest identity
// sent in the request body. Every guest-friendly action needs this.
const resolveActor = (req) => {
  if (req.user) return { user: req.user._id };
  const { guestId, guestName } = req.body;
  if (!guestId || !guestName) return null;
  return { guestId, guestName };
};

const isSameActor = (voter, actor) => {
  if (actor.user) return voter.user?.toString() === actor.user.toString();
  return voter.guestId === actor.guestId;
};

// Re-fetches the huddle with the same population shape the REST GET routes
// use, then emits it to everyone currently viewing that huddle's room.
// Re-fetching (rather than emitting the raw doc) keeps the socket payload
// and the REST payload identical, so the frontend reducer can treat both
// the same way.
const broadcastHuddleUpdate = async (req, huddleId) => {
  const io = req.app.get("io");
  const populated = await Huddle.findById(huddleId)
    .populate("organizer", "name avatarColor")
    .populate("participants.user", "name avatarColor");
  io.to(huddleId.toString()).emit("huddleUpdated", populated);
};

// @route POST /api/huddles  (protect)
const createHuddle = async (req, res) => {
  try {
    const { title, description, dateOptions, locationOptions, votingClosesAt } = req.body;

    if (!title || !dateOptions?.length) {
      return res.status(400).json({ message: "Title and at least one date option are required" });
    }

    let inviteCode;
    do {
      inviteCode = generateInviteCode();
    } while (await Huddle.findOne({ inviteCode }));

    const huddle = await Huddle.create({
      title,
      description,
      organizer: req.user._id,
      inviteCode,
      dateOptions: dateOptions.map((d) => ({ date: d.date, label: d.label, votes: [] })),
      locationOptions: (locationOptions || []).map((l) => ({ ...l, votes: [] })),
      participants: [{ user: req.user._id, rsvp: "going" }],
      votingClosesAt: votingClosesAt || null,
    });

    res.status(201).json(huddle);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route GET /api/huddles  (protect) - huddles I organize or am participating in
const getMyHuddles = async (req, res) => {
  try {
    const huddles = await Huddle.find({
      $or: [{ organizer: req.user._id }, { "participants.user": req.user._id }],
    })
      .sort({ createdAt: -1 })
      .populate("organizer", "name avatarColor");

    res.json(huddles);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route GET /api/huddles/invite/:code  (optionalAuth) - the guest-friendly join view
const getHuddleByInviteCode = async (req, res) => {
  try {
    const huddle = await Huddle.findOne({ inviteCode: req.params.code })
      .populate("organizer", "name avatarColor")
      .populate("participants.user", "name avatarColor");
    if (!huddle) return res.status(404).json({ message: "Huddle not found" });
    res.json(huddle);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route GET /api/huddles/:id  (optionalAuth)
const getHuddleById = async (req, res) => {
  try {
    const huddle = await Huddle.findById(req.params.id)
      .populate("organizer", "name avatarColor")
      .populate("participants.user", "name avatarColor");
    if (!huddle) return res.status(404).json({ message: "Huddle not found" });
    res.json(huddle);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route POST /api/huddles/:id/join  (optionalAuth)
// Guests pass { guestId, guestName } in the body; logged-in users just hit this with their token.
const joinHuddle = async (req, res) => {
  try {
    const huddle = await Huddle.findById(req.params.id);
    if (!huddle) return res.status(404).json({ message: "Huddle not found" });

    const actor = resolveActor(req);
    if (!actor) return res.status(400).json({ message: "guestId and guestName are required for guests" });

    const alreadyIn = huddle.participants.some((p) => isSameActor(p, actor));
    if (!alreadyIn) {
      huddle.participants.push({ ...actor, rsvp: "pending" });
      await huddle.save();
      await broadcastHuddleUpdate(req, huddle._id);
    }

    res.json(huddle);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route POST /api/huddles/:id/rsvp  (optionalAuth)  body: { status, guestId?, guestName? }
const setRsvp = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["going", "maybe", "cant_go"].includes(status)) {
      return res.status(400).json({ message: "Invalid RSVP status" });
    }

    const huddle = await Huddle.findById(req.params.id);
    if (!huddle) return res.status(404).json({ message: "Huddle not found" });

    const actor = resolveActor(req);
    if (!actor) return res.status(400).json({ message: "guestId and guestName are required for guests" });

    let participant = huddle.participants.find((p) => isSameActor(p, actor));
    if (!participant) {
      huddle.participants.push({ ...actor, rsvp: status });
    } else {
      participant.rsvp = status;
    }

    await huddle.save();
    await broadcastHuddleUpdate(req, huddle._id);
    res.json(huddle);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Shared vote toggle logic for both date and location options
const toggleVote = async (req, res, optionListName) => {
  try {
    const { optionId } = req.params;
    const huddle = await Huddle.findById(req.params.id);
    if (!huddle) return res.status(404).json({ message: "Huddle not found" });
    if (huddle.status !== "voting") {
      return res.status(400).json({ message: "Voting is closed for this huddle" });
    }

    const actor = resolveActor(req);
    if (!actor) return res.status(400).json({ message: "guestId and guestName are required for guests" });

    const option = huddle[optionListName].id(optionId);
    if (!option) return res.status(404).json({ message: "Option not found" });

    const existingIndex = option.votes.findIndex((v) => isSameActor(v, actor));
    if (existingIndex >= 0) {
      option.votes.splice(existingIndex, 1); // toggle off
    } else {
      option.votes.push(actor); // toggle on
    }

    await huddle.save();
    await broadcastHuddleUpdate(req, huddle._id);
    res.json(huddle);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route POST /api/huddles/:id/vote/date/:optionId  (optionalAuth)
const voteDate = (req, res) => toggleVote(req, res, "dateOptions");

// @route POST /api/huddles/:id/vote/location/:optionId  (optionalAuth)
const voteLocation = (req, res) => toggleVote(req, res, "locationOptions");

// @route POST /api/huddles/:id/options/location  (optionalAuth) - anyone can propose a spot
const addLocationOption = async (req, res) => {
  try {
    const { name, address, placeId, lat, lng } = req.body;
    if (!name) return res.status(400).json({ message: "Location name is required" });

    const huddle = await Huddle.findById(req.params.id);
    if (!huddle) return res.status(404).json({ message: "Huddle not found" });
    if (huddle.status !== "voting") {
      return res.status(400).json({ message: "Voting is closed for this huddle" });
    }

    huddle.locationOptions.push({ name, address, placeId, lat, lng, votes: [] });
    await huddle.save();
    await broadcastHuddleUpdate(req, huddle._id);
    res.status(201).json(huddle);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route PUT /api/huddles/:id/finalize  (protect, organizer only)
// body: { dateOptionId?, locationOptionId? } - omit to auto-pick the highest-voted option
const finalizeHuddle = async (req, res) => {
  try {
    const huddle = await Huddle.findById(req.params.id);
    if (!huddle) return res.status(404).json({ message: "Huddle not found" });
    if (huddle.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the organizer can finalize this huddle" });
    }

    const { dateOptionId, locationOptionId } = req.body;

    const winningDate = dateOptionId
      ? huddle.dateOptions.id(dateOptionId)
      : [...huddle.dateOptions].sort((a, b) => b.votes.length - a.votes.length)[0];

    const winningLocation = locationOptionId
      ? huddle.locationOptions.id(locationOptionId)
      : [...huddle.locationOptions].sort((a, b) => b.votes.length - a.votes.length)[0];

    if (!winningDate) {
      return res.status(400).json({ message: "No date option available to finalize" });
    }

    huddle.finalDate = winningDate.date;
    if (winningLocation) {
      huddle.finalLocation = {
        name: winningLocation.name,
        address: winningLocation.address,
        lat: winningLocation.lat,
        lng: winningLocation.lng,
      };
    }
    huddle.status = "finalized";

    await huddle.save();
    await broadcastHuddleUpdate(req, huddle._id);
    res.json(huddle);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
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
};
