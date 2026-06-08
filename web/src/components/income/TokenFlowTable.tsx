"use client";

import { mockWallet } from "@/data/mockWallet";

export function TokenFlowTable() {
  return (
    <div className="overflow-x-auto no-scrollbar">
      <table className="w-full min-w-[520px] border-separate border-spacing-0 text-left text-sm">
        <thead>
          <tr className="text-xs uppercase text-muted">
            <th className="py-2 pr-3">Symbol</th>
            <th className="py-2 pr-3">Name</th>
            <th className="py-2 pr-3">Inflow</th>
            <th className="py-2 pr-3">Outflow</th>
            <th className="py-2 pr-3">Net</th>
            <th className="py-2">USD</th>
          </tr>
        </thead>
        <tbody>
          {mockWallet.tokenFlows.map((flow, index) => (
            <tr key={flow.symbol} className={index % 2 ? "bg-surface-2/60" : "bg-white"}>
              <td className="rounded-l-card py-2.5 pl-2 pr-3 font-bold">{flow.symbol}</td>
              <td className="py-2.5 pr-3 text-muted">{flow.name}</td>
              <td className="py-2.5 pr-3 font-semibold">{flow.inflow.toLocaleString()}</td>
              <td className="py-2.5 pr-3 font-semibold">{flow.outflow.toLocaleString()}</td>
              <td className="py-2.5 pr-3 font-semibold text-success">{flow.net.toLocaleString()}</td>
              <td className="rounded-r-card py-2.5 pr-2 font-bold">${flow.usd.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
