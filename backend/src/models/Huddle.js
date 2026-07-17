const mongoose = require("mongoose");

// A "voter" can be a registered user OR a guest who joined via invite link
// with just a name — we don't want signup friction for participants.
const voterRefSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    guestId: { type: String, default: null }, // random id persisted client-side (localStorage)
    guestName: { type: String, default: null },
  },
  { _id: false }
);

const dateOptionSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    label: { type: String }, // e.g. "Friday evening" — optional friendly label
    votes: [voterRefSchema],
  },
  { _id: true }
);

const locationOptionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String },
    placeId: { type: String }, // Google Places place_id, added in the Maps integration session
    lat: { type: Number },
    lng: { type: Number },
    votes: [voterRefSchema],
  },
  { _id: true }
);

const participantSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    guestId: { type: String, default: null },
    guestName: { type: String, default: null },
    rsvp: {
      type: String,
      enum: ["going", "maybe", "cant_go", "pending"],
      default: "pending",
    },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const huddleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    inviteCode: { type: String, required: true, unique: true },

    dateOptions: [dateOptionSchema],
    locationOptions: [locationOptionSchema],
    participants: [participantSchema],

    status: {
      type: String,
      enum: ["voting", "finalized", "cancelled"],
      default: "voting",
    },
    finalDate: { type: Date, default: null },
    finalLocation: {
      name: { type: String },
      address: { type: String },
      lat: { type: Number },
      lng: { type: Number },
    },

    votingClosesAt: { type: Date, default: null },
  },
  { timestamps: true }
);

huddleSchema.index({ inviteCode: 1 });

module.exports = mongoose.model("Huddle", huddleSchema);
