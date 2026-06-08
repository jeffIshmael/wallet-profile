"use client";

import { clsx } from "clsx";

export function ProgressBar({
  value,
  tone = "blue",
  className
}: {
  value: number;
  tone?: "blue" | "green" | "amber" | "red";
  className?: string;
}) {
  const fill = {
    blue: "bg-primary",
    green: "bg-success",
    amber: "bg-warning",
    red: "bg-danger"
  }[tone];

  return (
    <div className={clsx("h-2.5 w-full overflow-hidden rounded-full bg-surface-2", className)}>
      <div className={clsx("h-full rounded-full transition-all duration-1000 ease-out", fill)} style={{ width: `${value}%` }} />
    </div>
  );
}
