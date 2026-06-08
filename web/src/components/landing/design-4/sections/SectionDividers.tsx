type SectionSurface = "gray" | "black";

const surfaceBg: Record<SectionSurface, string> = {
  gray: "bg-void-surface",
  black: "bg-black"
};

export function SectionPairDivider({ surface }: { surface: SectionSurface }) {
  return (
    <div className={surfaceBg[surface]} aria-hidden>
      <div className="mx-auto max-w-7xl border-t border-white/10 px-6" />
    </div>
  );
}
