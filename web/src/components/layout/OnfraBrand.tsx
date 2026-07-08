"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/providers/ThemeProvider";

type OnfraBrandProps = {
  size?: "sm" | "md" | "lg";
  href?: string;
  theme?: "dark" | "light" | "auto";
  className?: string;
};

const LOGO_SIZE = { sm: 28, md: 32, lg: 44 } as const;

const TEXT_CLASS = {
  sm: "text-lg",
  md: "text-xl md:text-2xl",
  lg: "text-3xl md:text-4xl"
} as const;

export function OnfraBrand({
  size = "md",
  href,
  theme = "auto",
  className = ""
}: OnfraBrandProps) {
  const { theme: activeTheme } = useTheme();
  const resolvedTheme = theme === "auto" ? activeTheme : theme;
  const logoSrc = resolvedTheme === "light" ? "/logo_light.png" : "/logo_dark.png";
  const logoSize = LOGO_SIZE[size];

  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Image
        src={logoSrc}
        alt=""
        width={logoSize}
        height={logoSize}
        className="shrink-0 rounded-md"
        priority={size === "lg"}
        aria-hidden
      />
      <span className={`font-space font-bold tracking-tight text-white ${TEXT_CLASS[size]}`}>
        On<span className="text-btc-orange">FRA</span>
      </span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="shrink-0 transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return <div className="shrink-0">{content}</div>;
}

/** @deprecated use OnfraBrand */
export const ChainalyseBrand = OnfraBrand;
