import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Check, MapPin, Plus, Share2 } from "lucide-react";
import {
  voteDate,
  voteLocation,
  setRsvp,
  finalizeHuddle,
  addLocationOption,
  joinHuddle,
} from "../store/huddleSlice";
import { getGuestName, setGuestName as persistGuestName } from "../lib/guest";
import Button from "../components/Button";
import RsvpBadge from "../components/RsvpBadge";

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export default function HuddleBoard({ huddle }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [guestNameInput, setGuestNameInput] = useState(getGuestName());
  const [addingLocation, setAddingLocation] = useState(false);
  const [newLocation, setNewLocation] = useState({ name: "", address: "" });
  const [copied, setCopied] = useState(false);

  const isOrganizer = user && huddle.organizer?._id === user._id;
  const needsGuestName = !user && !getGuestName();

  const hasVoted = (option) =>
    option.votes.some((v) => (user ? v.user === user._id : v.guestName === getGuestName()));

  const myParticipant = huddle.participants?.find((p) =>
    user ? p.user?._id === user._id : p.guestName === getGuestName()
  );

  const handleConfirmName = async () => {
    if (!guestNameInput.trim()) return;
    persistGuestName(guestNameInput.trim());
    await dispatch(joinHuddle(huddle._id));
  };

  const handleVoteDate = (optionId) => {
    if (needsGuestName) return;
    dispatch(voteDate({ id: huddle._id, optionId }));
  };
  const handleVoteLocation = (optionId) => {
    if (needsGuestName) return;
    dispatch(voteLocation({ id: huddle._id, optionId }));
  };
  const handleRsvp = (status) => {
    if (needsGuestName) return;
    dispatch(setRsvp({ id: huddle._id, status }));
  };
  const handleFinalize = (dateOptionId, locationOptionId) => {
    dispatch(finalizeHuddle({ id: huddle._id, dateOptionId, locationOptionId }));
  };
  const handleAddLocation = async (e) => {
    e.preventDefault();
    if (!newLocation.name.trim()) return;
    await dispatch(addLocationOption({ id: huddle._id, ...newLocation }));
    setNewLocation({ name: "", address: "" });
    setAddingLocation(false);
  };
  const handleShare = () => {
    const url = `${window.location.origin}/invite/${huddle.inviteCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sortedDates = [...huddle.dateOptions].sort((a, b) => b.votes.length - a.votes.length);
  const sortedLocations = [...huddle.locationOptions].sort((a, b) => b.votes.length - a.votes.length);
  const maxDateVotes = Math.max(1, ...huddle.dateOptions.map((o) => o.votes.length));
  const maxLocVotes = Math.max(1, ...huddle.locationOptions.map((o) => o.votes.length));

  const rsvpCounts = huddle.participants.reduce(
    (acc, p) => {
      acc[p.rsvp] = (acc[p.rsvp] || 0) + 1;
      return acc;
    },
    { going: 0, maybe: 0, cant_go: 0, pending: 0 }
  );

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      {/* Ticket stub header */}
      <div className="perforated overflow-hidden rounded-3xl bg-paper text-ink shadow-xl" style={{ "--perf-position": "70%" }}>
        <div className="flex flex-col md:flex-row">
          <div className="flex-1 p-6 md:p-8">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[11px] uppercase tracking-widest text-ink/40">
                #{huddle.inviteCode}
              </p>
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                  huddle.status === "finalized" ? "bg-teal/15 text-teal" : "bg-gold/20 text-ink"
                }`}
              >
                {huddle.status === "finalized" ? "Locked in" : "Voting open"}
              </span>
            </div>
            <h1 className="mt-3 font-display text-2xl font-bold leading-tight md:text-3xl">
              {huddle.title}
            </h1>
            {huddle.description && <p className="mt-2 text-sm text-ink/60">{huddle.description}</p>}
            <p className="mt-4 text-xs text-ink/40">Organized by {huddle.organizer?.name}</p>

            {huddle.status === "finalized" && (
              <div className="mt-5 rounded-xl bg-teal/10 p-4">
                <p className="text-sm font-semibold text-teal">
                  📅 {fmtDate(huddle.finalDate)} at {fmtTime(huddle.finalDate)}
                </p>
                {huddle.finalLocation?.name && (
                  <p className="mt-1 text-sm text-ink/70">📍 {huddle.finalLocation.name}</p>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-row items-center justify-around gap-4 bg-paper-dim p-6 md:w-52 md:flex-col md:justify-center">
            <div className="text-center">
              <p className="font-display text-2xl font-bold">{huddle.participants.length}</p>
              <p className="text-[11px] uppercase tracking-wide text-ink/40">people in</p>
            </div>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-paper hover:bg-ink-soft"
            >
              <Share2 size={13} /> {copied ? "Copied!" : "Share link"}
            </button>
          </div>
        </div>
      </div>

      {/* Guest name gate */}
      {needsGuestName && (
        <div className="mt-6 rounded-2xl border border-gold/30 bg-gold/5 p-5">
          <p className="font-medium text-paper">What's your name?</p>
          <p className="mt-1 text-sm text-paper/60">So your friends know who voted for what.</p>
          <div className="mt-3 flex gap-2">
            <input
              value={guestNameInput}
              onChange={(e) => setGuestNameInput(e.target.value)}
              placeholder="Your name"
              className="flex-1 rounded-xl border border-line bg-ink-soft px-4 py-2.5 text-paper placeholder:text-paper/30 focus:border-gold focus:outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleConfirmName()}
            />
            <Button onClick={handleConfirmName} variant="gold">
              Join in
            </Button>
          </div>
        </div>
      )}

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        {/* Date voting */}
        <div>
          <h2 className="font-display text-lg font-semibold">When?</h2>
          <div className="mt-4 space-y-3">
            {sortedDates.map((opt) => {
              const voted = hasVoted(opt);
              return (
                <button
                  key={opt._id}
                  onClick={() => handleVoteDate(opt._id)}
                  disabled={needsGuestName || huddle.status === "finalized"}
                  className={`w-full rounded-xl border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${
                    voted ? "border-gold bg-gold/10" : "border-line bg-ink-soft hover:border-line-light/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {fmtDate(opt.date)} <span className="text-paper/50">· {fmtTime(opt.date)}</span>
                      </p>
                      {opt.label && <p className="text-xs text-paper/40">{opt.label}</p>}
                    </div>
                    {voted && (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold text-ink">
                        <Check size={14} />
                      </span>
                    )}
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full bg-gold transition-all"
                      style={{ width: `${(opt.votes.length / maxDateVotes) * 100}%` }}
                    />
                  </div>
                  <p className="mt-1 font-mono text-[11px] text-paper/40">
                    {opt.votes.length} vote{opt.votes.length === 1 ? "" : "s"}
                  </p>
                  {isOrganizer && huddle.status === "voting" && (
                    <span
                      role="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFinalize(opt._id, sortedLocations[0]?._id);
                      }}
                      className="mt-2 inline-block text-[11px] font-semibold text-teal hover:underline"
                    >
                      Lock this in →
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Location voting */}
        <div>
          <h2 className="font-display text-lg font-semibold">Where?</h2>
          <div className="mt-4 space-y-3">
            {sortedLocations.map((opt) => {
              const voted = hasVoted(opt);
              return (
                <button
                  key={opt._id}
                  onClick={() => handleVoteLocation(opt._id)}
                  disabled={needsGuestName || huddle.status === "finalized"}
                  className={`w-full rounded-xl border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${
                    voted ? "border-coral bg-coral/10" : "border-line bg-ink-soft hover:border-line-light/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-2">
                      <MapPin size={15} className="mt-0.5 shrink-0 text-paper/40" />
                      <div>
                        <p className="font-medium">{opt.name}</p>
                        {opt.address && <p className="text-xs text-paper/40">{opt.address}</p>}
                      </div>
                    </div>
                    {voted && (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-coral text-ink">
                        <Check size={14} />
                      </span>
                    )}
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full bg-coral transition-all"
                      style={{ width: `${(opt.votes.length / maxLocVotes) * 100}%` }}
                    />
                  </div>
                  <p className="mt-1 font-mono text-[11px] text-paper/40">
                    {opt.votes.length} vote{opt.votes.length === 1 ? "" : "s"}
                  </p>
                </button>
              );
            })}

            {huddle.status === "voting" && (
              <>
                {addingLocation ? (
                  <form onSubmit={handleAddLocation} className="rounded-xl border border-dashed border-line p-4">
                    <input
                      value={newLocation.name}
                      onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                      placeholder="Spot name"
                      autoFocus
                      className="w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-paper placeholder:text-paper/30 focus:border-gold focus:outline-none"
                    />
                    <input
                      value={newLocation.address}
                      onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                      placeholder="Address (optional)"
                      className="mt-2 w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-paper placeholder:text-paper/30 focus:border-gold focus:outline-none"
                    />
                    <div className="mt-2 flex gap-2">
                      <Button type="submit" size="sm">Add spot</Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => setAddingLocation(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setAddingLocation(true)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-line py-3 text-sm font-medium text-paper/50 hover:border-line-light/50 hover:text-paper/80"
                  >
                    <Plus size={15} /> Suggest a spot
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* RSVP */}
      {!needsGuestName && huddle.status === "voting" && (
        <div className="mt-10 rounded-2xl border border-line bg-ink-soft p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium">Are you in?</p>
              <p className="text-sm text-paper/50">
                {rsvpCounts.going} going · {rsvpCounts.maybe} maybe · {rsvpCounts.cant_go} can't make it
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={myParticipant?.rsvp === "going" ? "primary" : "outline"}
                onClick={() => handleRsvp("going")}
              >
                Going
              </Button>
              <Button
                size="sm"
                variant={myParticipant?.rsvp === "maybe" ? "gold" : "outline"}
                onClick={() => handleRsvp("maybe")}
              >
                Maybe
              </Button>
              <Button
                size="sm"
                variant={myParticipant?.rsvp === "cant_go" ? "dark" : "outline"}
                onClick={() => handleRsvp("cant_go")}
              >
                Can't go
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Participant list */}
      <div className="mt-10">
        <h2 className="font-display text-lg font-semibold">Who's in the huddle</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {huddle.participants.map((p, i) => (
            <div key={i} className="flex items-center gap-2 rounded-full border border-line bg-ink-soft py-1.5 pl-1.5 pr-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-paper-dim text-[10px] font-bold text-ink">
                {(p.user?.name || p.guestName || "?")[0]?.toUpperCase()}
              </div>
              <span className="text-sm">{p.user?.name || p.guestName || "Member"}</span>
              <RsvpBadge status={p.rsvp} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
