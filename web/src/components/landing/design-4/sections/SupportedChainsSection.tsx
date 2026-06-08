import Image from "next/image";
import baseLogo from "@/public/baseLogo.jpg";
import celoLogo from "@/public/celoLogo.jpg";

const chains = [
  { logo: celoLogo, alt: "Celo", comingSoon: false },
];

export function SupportedChainsSection() {
  return (
    <section id="supported-chains" className="border-t border-white/10 bg-void-surface py-8">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <p className="font-mono text-[10px] uppercase tracking-widest text-btc-orange">Supported chains</p>
        <div className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-10 md:gap-14">
          {chains.map((chain) => (
            <div key={chain.alt} className="relative flex flex-col items-center gap-2">
              <Image
                src={chain.logo}
                alt={chain.alt}
                width={300}
                height={300}
                className="h-20 w-auto object-contain md:h-20"
              />
              {chain.comingSoon && (
                <span className="rounded-full border border-white/15 bg-black/40 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-stardust">
                  Coming soon
                </span>
              )}
              {/* {!chain.comingSoon && <div className="h-0.5 w-12 bg-btc-orange" />} */}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
