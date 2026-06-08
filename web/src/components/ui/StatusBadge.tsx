import { clsx } from "clsx";

const tones = {
  green: "bg-success/10 text-success border-success/20",
  blue: "bg-primary/10 text-primary border-primary/20",
  amber: "bg-warning/10 text-warning border-warning/20",
  red: "bg-danger/10 text-danger border-danger/20"
} as const;

export function StatusBadge({
  tone = "blue",
  className,
  children
}: {
  tone?: keyof typeof tones;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={clsx("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", tones[tone], className)}>
      {children}
    </span>
  );
}
