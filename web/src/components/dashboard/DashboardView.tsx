"use client";

import { AISummaryCard } from "@/components/ai/AISummaryCard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { GrowthJourneyChart } from "@/components/growth/GrowthJourneyChart";
import { AverageMonthlyIncomeCard } from "@/components/income/AverageMonthlyIncomeCard";
import { CashFlowCard } from "@/components/income/CashFlowCard";
import { LoanCapacityCard } from "@/components/scores/LoanCapacityCard";
import {
  FinancialHealthGauge,
  IncomeStabilityCard,
  ReputationScoreCard
} from "@/components/scores/ScoreCards";
import { RiskExposureCard } from "@/components/portfolio/RiskExposureCard";
import { DashboardRefreshAnalysis } from "@/components/dashboard/DashboardRefreshAnalysis";
import { DashboardReportActions } from "@/components/dashboard/DashboardReportActions";
import { WalletMetaCard } from "@/components/wallet/WalletMetaCard";

type DashboardViewProps = {
  chatOpen?: boolean;
  onChatOpenChange?: (open: boolean) => void;
};

export function DashboardView({ chatOpen, onChatOpenChange }: DashboardViewProps) {
  return (
    <DashboardShell chatOpen={chatOpen} onChatOpenChange={onChatOpenChange} hideChatFab scrollable>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-3">
        <div className="flex flex-col gap-2.5 sm:col-span-2 lg:col-span-3">
      <div className="md:hidden">
        <DashboardReportActions variant="mobile" className="mt-2" />
        <div className="mt-2">
          <DashboardRefreshAnalysis compact />
        </div>
      </div>
          <WalletMetaCard />
        </div>

        <FinancialHealthGauge />
        <IncomeStabilityCard />
        <ReputationScoreCard />

        <LoanCapacityCard />
        <AverageMonthlyIncomeCard />
        <CashFlowCard />

        <RiskExposureCard />

        <div className="sm:col-span-2 lg:col-span-2">
          <GrowthJourneyChart />
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <AISummaryCard />
        </div>
      </div>
    </DashboardShell>
  );
}
