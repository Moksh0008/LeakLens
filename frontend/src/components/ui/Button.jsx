// Button.jsx — the single button style for the whole app.
// Variants: primary (accent), secondary (panel), ghost (quiet), danger.
// Primary CTA carries the only sanctioned accent glow.
// Keyboard-friendly by default: real <button>, visible focus ring from globals.css.

const VARIANTS = {
  primary:
    "bg-accent text-white hover:bg-accent-strong border border-transparent shadow-[0_1px_2px_rgba(0,0,0,0.4)] focus-visible:glow-accent",
  secondary:
    "bg-surface-elevated text-text-primary hover:bg-surface-hover border border-border",
  ghost:
    "bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary border border-transparent",
  danger:
    "bg-danger/10 text-danger hover:bg-danger/20 border border-danger/30",
};

const SIZES = {
  sm: "h-8 px-3 text-small gap-1.5",
  md: "h-9 px-4 text-body gap-2",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-control font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-40 ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
