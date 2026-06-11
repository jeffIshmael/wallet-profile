-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Wallet" (
    "address" TEXT NOT NULL,
    "ens" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "AnalysisRun" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "financialHealthScore" INTEGER NOT NULL,
    "reputationScore" INTEGER NOT NULL,
    "reputationCategory" TEXT NOT NULL,
    "riskCategory" TEXT NOT NULL,
    "incomeLabel" TEXT NOT NULL,
    "loanRange" TEXT NOT NULL,
    "loanConfidence" TEXT NOT NULL,
    "totalValueUsd" DOUBLE PRECISION NOT NULL,
    "totalTransactions" INTEGER NOT NULL,
    "walletData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalysisRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatSession" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "onchainReportId" TEXT NOT NULL,
    "reportHash" TEXT NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "buyerAddress" TEXT NOT NULL,
    "financialHealthScore" INTEGER NOT NULL,
    "reputationScore" INTEGER NOT NULL,
    "loanCapacity" TEXT NOT NULL,
    "attestation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiEvent" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT,
    "endpoint" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "durationMs" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnalysisRun_walletAddress_createdAt_idx" ON "AnalysisRun"("walletAddress", "createdAt");

-- CreateIndex
CREATE INDEX "AnalysisRun_expiresAt_idx" ON "AnalysisRun"("expiresAt");

-- CreateIndex
CREATE INDEX "ChatSession_walletAddress_updatedAt_idx" ON "ChatSession"("walletAddress", "updatedAt");

-- CreateIndex
CREATE INDEX "ChatMessage_sessionId_createdAt_idx" ON "ChatMessage"("sessionId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Report_onchainReportId_key" ON "Report"("onchainReportId");

-- CreateIndex
CREATE INDEX "Report_walletAddress_createdAt_idx" ON "Report"("walletAddress", "createdAt");

-- CreateIndex
CREATE INDEX "Report_buyerAddress_idx" ON "Report"("buyerAddress");

-- CreateIndex
CREATE INDEX "ApiEvent_endpoint_createdAt_idx" ON "ApiEvent"("endpoint", "createdAt");

-- CreateIndex
CREATE INDEX "ApiEvent_createdAt_idx" ON "ApiEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "AnalysisRun" ADD CONSTRAINT "AnalysisRun_walletAddress_fkey" FOREIGN KEY ("walletAddress") REFERENCES "Wallet"("address") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatSession" ADD CONSTRAINT "ChatSession_walletAddress_fkey" FOREIGN KEY ("walletAddress") REFERENCES "Wallet"("address") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_walletAddress_fkey" FOREIGN KEY ("walletAddress") REFERENCES "Wallet"("address") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiEvent" ADD CONSTRAINT "ApiEvent_walletAddress_fkey" FOREIGN KEY ("walletAddress") REFERENCES "Wallet"("address") ON DELETE SET NULL ON UPDATE CASCADE;
