const users = [
  { emoji: "💼", title: "Freelancers", description: "Convert stablecoin earnings into lender-ready proof of income." },
  { emoji: "🌍", title: "Remote Workers", description: "Demonstrate cross-border income without traditional payslips." },
  { emoji: "🏛️", title: "DAO Contributors", description: "Verify recurring contributor compensation and treasury payments." },
  { emoji: "🎨", title: "Creators", description: "Turn community and platform earnings into financial credibility." },
  { emoji: "🏦", title: "Saccos & Lenders", description: "Assess borrower reliability using transparent blockchain data." },
  { emoji: "⚡", title: "Digital Entrepreneurs", description: "Use wallet activity as evidence of business performance and revenue." }
];

export function UsersSection() {
  return (
    <section id="users" className="border-t border-white/10 bg-void-surface px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <p className="text-center font-mono text-[10px] uppercase tracking-widest text-btc-orange">
          Who Chainalyse Helps
        </p>
        <h2 className="mt-3 text-center font-space text-3xl font-bold text-white md:text-4xl">
          Built for the onchain economy
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-7 text-stardust md:text-base">
          Anyone earning, saving or building onchain deserves access to financial opportunities.
        </p>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <div
              key={user.title}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-btc-orange/50 hover:shadow-[0_0_30px_-10px_rgba(247,147,26,0.2)]"
            >
              <div className="absolute left-0 right-0 top-0 h-0.5 origin-left scale-x-0 bg-btc-orange transition-transform duration-300 group-hover:scale-x-100" />
              <span className="text-2xl">{user.emoji}</span>
              <h3 className="mt-3 font-space text-base font-semibold text-white">{user.title}</h3>
              <p className="mt-2 text-sm leading-6 text-stardust">{user.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
