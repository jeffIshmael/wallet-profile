"use client";

import dynamic from "next/dynamic";

const Plasma = dynamic(() => import("@/components/Plasma/Plasma"), {
  ssr: false,
  loading: () => null
});

export function PageBackground({ subtle = false }: { subtle?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#060d1f]">
      <Plasma
        color="#1A56FF"
        speed={subtle ? 0.45 : 0.6}
        direction="forward"
        scale={subtle ? 1.25 : 1.1}
        opacity={subtle ? 0.65 : 0.85}
        mouseInteractive={false}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#060d1f_72%)]" />
    </div>
  );
}
