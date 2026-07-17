import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Plus, X } from "lucide-react";
import { createHuddle } from "../store/huddleSlice";
import Button from "../components/Button";

function emptyDateOption() {
  return { key: crypto.randomUUID(), date: "", time: "", label: "" };
}
function emptyLocationOption() {
  return { key: crypto.randomUUID(), name: "", address: "" };
}

export default function CreateHuddle() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateOptions, setDateOptions] = useState([emptyDateOption(), emptyDateOption()]);
  const [locationOptions, setLocationOptions] = useState([emptyLocationOption()]);
  const [submitError, setSubmitError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { actionStatus } = useSelector((state) => state.huddles);

  const updateDateOption = (key, field, value) => {
    setDateOptions((opts) => opts.map((o) => (o.key === key ? { ...o, [field]: value } : o)));
  };
  const updateLocationOption = (key, field, value) => {
    setLocationOptions((opts) => opts.map((o) => (o.key === key ? { ...o, [field]: value } : o)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    const cleanDates = dateOptions
      .filter((o) => o.date)
      .map((o) => ({
        date: new Date(`${o.date}T${o.time || "18:00"}`).toISOString(),
        label: o.label || undefined,
      }));

    if (!title.trim()) return setSubmitError("Give your huddle a title.");
    if (cleanDates.length === 0) return setSubmitError("Add at least one date option.");

    const cleanLocations = locationOptions
      .filter((o) => o.name)
      .map((o) => ({ name: o.name, address: o.address || undefined }));

    const result = await dispatch(
      createHuddle({ title, description, dateOptions: cleanDates, locationOptions: cleanLocations })
    );

    if (createHuddle.fulfilled.match(result)) {
      navigate(`/h/${result.payload._id}`);
    } else {
      setSubmitError(result.payload || "Something went wrong");
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <p className="font-mono text-xs uppercase tracking-widest text-gold">new huddle</p>
      <h1 className="mt-1 font-display text-3xl font-bold">What are we planning?</h1>
      <p className="mt-2 text-sm text-paper/60">
        Add a couple of date and location options — your friends will vote on their favorites.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-paper/80">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Diwali weekend trip"
            className="w-full rounded-xl border border-line bg-ink-soft px-4 py-3 text-paper placeholder:text-paper/30 focus:border-gold focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-paper/80">
            Description <span className="text-paper/40">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Anything people should know before they vote"
            className="w-full rounded-xl border border-line bg-ink-soft px-4 py-3 text-paper placeholder:text-paper/30 focus:border-gold focus:outline-none"
          />
        </div>

        {/* Date options */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-paper/80">Date options</label>
          </div>
          <div className="space-y-3">
            {dateOptions.map((opt, i) => (
              <div key={opt.key} className="flex gap-2">
                <input
                  type="date"
                  value={opt.date}
                  onChange={(e) => updateDateOption(opt.key, "date", e.target.value)}
                  className="flex-1 rounded-xl border border-line bg-ink-soft px-3 py-2.5 text-sm text-paper focus:border-gold focus:outline-none"
                />
                <input
                  type="time"
                  value={opt.time}
                  onChange={(e) => updateDateOption(opt.key, "time", e.target.value)}
                  className="w-32 rounded-xl border border-line bg-ink-soft px-3 py-2.5 text-sm text-paper focus:border-gold focus:outline-none"
                />
                <input
                  type="text"
                  value={opt.label}
                  onChange={(e) => updateDateOption(opt.key, "label", e.target.value)}
                  placeholder="Label (optional)"
                  className="w-36 rounded-xl border border-line bg-ink-soft px-3 py-2.5 text-sm text-paper placeholder:text-paper/30 focus:border-gold focus:outline-none"
                />
                {dateOptions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setDateOptions((opts) => opts.filter((o) => o.key !== opt.key))}
                    className="shrink-0 rounded-lg p-2 text-paper/40 hover:bg-white/5 hover:text-coral"
                    aria-label="Remove date option"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setDateOptions((opts) => [...opts, emptyDateOption()])}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-gold hover:underline"
          >
            <Plus size={15} /> Add another date
          </button>
        </div>

        {/* Location options */}
        <div>
          <label className="mb-2 block text-sm font-medium text-paper/80">
            Location options <span className="text-paper/40">(optional — add later too)</span>
          </label>
          <div className="space-y-3">
            {locationOptions.map((opt) => (
              <div key={opt.key} className="flex gap-2">
                <input
                  type="text"
                  value={opt.name}
                  onChange={(e) => updateLocationOption(opt.key, "name", e.target.value)}
                  placeholder="e.g. Cafe Delhi Heights"
                  className="flex-1 rounded-xl border border-line bg-ink-soft px-3 py-2.5 text-sm text-paper placeholder:text-paper/30 focus:border-gold focus:outline-none"
                />
                <input
                  type="text"
                  value={opt.address}
                  onChange={(e) => updateLocationOption(opt.key, "address", e.target.value)}
                  placeholder="Address (optional)"
                  className="flex-1 rounded-xl border border-line bg-ink-soft px-3 py-2.5 text-sm text-paper placeholder:text-paper/30 focus:border-gold focus:outline-none"
                />
                {locationOptions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setLocationOptions((opts) => opts.filter((o) => o.key !== opt.key))}
                    className="shrink-0 rounded-lg p-2 text-paper/40 hover:bg-white/5 hover:text-coral"
                    aria-label="Remove location option"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setLocationOptions((opts) => [...opts, emptyLocationOption()])}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-gold hover:underline"
          >
            <Plus size={15} /> Add another spot
          </button>
        </div>

        {submitError && (
          <p className="rounded-lg bg-coral/10 px-4 py-3 text-sm text-coral">{submitError}</p>
        )}

        <Button type="submit" disabled={actionStatus === "loading"} className="w-full">
          {actionStatus === "loading" ? "Creating…" : "Create huddle"}
        </Button>
      </form>
    </div>
  );
}
