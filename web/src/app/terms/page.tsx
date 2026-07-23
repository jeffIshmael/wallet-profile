import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Terms of Service | Onfra",
  description: "Terms of Service for the Onfra Mini App and web platform."
};

export default function TermsPage() {
  const updated = "June 22, 2026";

  return (
    <LegalPageShell title="Terms of Service">
      <p className="text-xs text-stardust/80">Last updated: {updated}</p>

      <p>
        These Terms of Service (&quot;Terms&quot;) govern your use of Onfra, including the web app and MiniPay
        Mini App operated at app.onfra.xyz (&quot;Onfra&quot;, &quot;we&quot;, &quot;us&quot;). By using
        Onfra you agree to these Terms.
      </p>

      <h2 className="pt-2 font-space text-lg font-semibold text-white">Service</h2>
      <p>
        Onfra provides onchain wallet analysis, financial reputation scores, transaction statements, AI-assisted
        insights, and optional paid features settled in USDT on Celo. Analysis outputs are informational and do not
        constitute financial, legal, or lending advice.
      </p>

      <h2 className="pt-2 font-space text-lg font-semibold text-white">Wallet connection</h2>
      <p>
        You connect your own wallet (including via MiniPay). You are responsible for securing your wallet and approving
        transactions you initiate. Onfra does not custody user funds.
      </p>

      <h2 className="pt-2 font-space text-lg font-semibold text-white">Payments</h2>
      <p>
        Certain features require USDT payment on Celo. Paid amounts are shown before you confirm a transaction. Fees
        are non-refundable once a transaction is confirmed onchain, except where required by law.
      </p>

      <h2 className="pt-2 font-space text-lg font-semibold text-white">Acceptable use</h2>
      <p>
        You may not misuse Onfra, attempt unauthorized access, scrape at abusive rates, or use the service for
        unlawful activity. We may suspend access for violations or operational risk.
      </p>

      <h2 className="pt-2 font-space text-lg font-semibold text-white">Disclaimer</h2>
      <p>
        Onfra is provided &quot;as is&quot; without warranties. We do not guarantee score accuracy, loan approval,
        or uninterrupted availability. Onchain data and third-party services may change without notice.
      </p>

      <h2 className="pt-2 font-space text-lg font-semibold text-white">Contact</h2>
      <p>
        Questions about these Terms: see our <a href="/support" className="text-btc-orange hover:underline">Support</a>{" "}
        page or message us on X at{" "}
        <a href="https://x.com/onfra_xyz" className="text-btc-orange hover:underline" target="_blank" rel="noreferrer">
          @onfra_xyz
        </a>
        .
      </p>
    </LegalPageShell>
  );
}
