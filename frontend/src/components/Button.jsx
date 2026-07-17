const variants = {
  primary: "bg-coral text-ink hover:bg-coral-dark active:scale-[0.98]",
  gold: "bg-gold text-ink hover:brightness-95 active:scale-[0.98]",
  outline: "border-2 border-paper text-paper hover:bg-paper hover:text-ink active:scale-[0.98]",
  ghost: "text-paper hover:bg-white/10",
  dark: "bg-ink text-paper hover:bg-ink-soft active:scale-[0.98]",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  as: Component = "button",
  ...props
}) {
  return (
    <Component
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
