const styles = {
  going: "bg-teal/20 text-teal border-teal/40",
  maybe: "bg-gold/20 text-gold border-gold/40",
  cant_go: "bg-coral/20 text-coral border-coral/40",
  pending: "bg-white/10 text-paper/60 border-white/20",
};

const labels = {
  going: "Going",
  maybe: "Maybe",
  cant_go: "Can't go",
  pending: "No response yet",
};

export default function RsvpBadge({ status = "pending" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${styles[status] || styles.pending}`}
    >
      {labels[status] || labels.pending}
    </span>
  );
}
