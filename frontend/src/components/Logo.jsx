export default function Logo({ size = "md", light = false }) {
  const textSize = size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-xl";
  const dotColor1 = light ? "bg-coral" : "bg-coral";
  const dotColor2 = light ? "bg-gold" : "bg-gold";
  const dotColor3 = light ? "bg-teal" : "bg-teal";

  return (
    <span className={`inline-flex items-center gap-2 font-display font-bold ${textSize} ${light ? "text-paper" : "text-ink"}`}>
      <span className="relative inline-flex h-[1em] w-[1.4em] items-center shrink-0">
        <span className={`absolute left-0 h-[0.62em] w-[0.62em] rounded-full ${dotColor1}`} />
        <span className={`absolute left-[0.35em] h-[0.62em] w-[0.62em] rounded-full ${dotColor2} opacity-90`} />
        <span className={`absolute left-[0.7em] h-[0.62em] w-[0.62em] rounded-full ${dotColor3} opacity-90`} />
      </span>
      huddle
    </span>
  );
}
