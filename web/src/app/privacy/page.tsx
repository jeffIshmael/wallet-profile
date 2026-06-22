import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Privacy Policy | Chainalyse",
  description: "Privacy Policy for the Chainalyse Mini App and web platform."
};

export default function PrivacyPage() {
  const updated = "June 22, 2026";

  return (
    <LegalPageShell title="Privacy Policy">
      <p className="text-xs text-stardust/80">Last updated: {updated}</p>

      <p>
        This Privacy Policy explains how Chainalyse (&quot;we&quot;) collects and uses information when you use
        chainalyse.xyz and the Chainalyse MiniPay Mini App.
      </p>

      <h2 className="pt-2 font-space text-lg font-semibold text-white">Information we process</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong className="text-white">Wallet address</strong> — to analyze onchain activity you request and to
          deliver scores, statements, and chat responses.
        </li>
        <li>
          <strong className="text-white">Transaction data</strong> — public blockchain records indexed for analysis and
          statement export.
        </li>
        <li>
          <strong className="text-white">Usage data</strong> — basic logs needed to operate the service, prevent abuse,
          and debug errors.
        </li>
        <li>
          <strong className="text-white">Chat messages</strong> — prompts you send to OnFRA for the current session and
          related processing.
        </li>
      </ul>

      <h2 className="pt-2 font-space text-lg font-semibold text-white">What we do not collect</h2>
      <p>
        We do not ask for your seed phrase or private keys. MiniPay wallet phone numbers are handled by MiniPay; we use
        wallet connection only to read your public address and request transactions you approve.
      </p>

      <h2 className="pt-2 font-space text-lg font-semibold text-white">How we use data</h2>
      <p>
        We use the information above to provide analysis, generate reports, process USDT payments you authorize, improve
        reliability, and respond to support requests. We do not sell personal data.
      </p>

      <h2 className="pt-2 font-space text-lg font-semibold text-white">Third parties</h2>
      <p>
        Chainalyse relies on infrastructure providers (hosting, RPC, AI APIs, authentication) and public block explorers.
        Onchain transactions are public by design. Optional features may link to external services (for example Celoscan
        or 8004scan).
      </p>

      <h2 className="pt-2 font-space text-lg font-semibold text-white">Retention</h2>
      <p>
        Cached analysis and session data are retained only as long as needed to provide the service and comply with legal
        obligations. You may clear local session state by disconnecting your wallet in the app.
      </p>

      <h2 className="pt-2 font-space text-lg font-semibold text-white">Contact</h2>
      <p>
        Privacy questions: visit <a href="/support" className="text-btc-orange hover:underline">Support</a> or contact{" "}
        <a href="https://x.com/chainalyse_xyz" className="text-btc-orange hover:underline" target="_blank" rel="noreferrer">
          @chainalyse_xyz
        </a>
        .
      </p>
    </LegalPageShell>
  );
}
