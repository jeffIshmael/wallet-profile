import { Activity, Briefcase, ShieldAlert, TrendingUp } from "lucide-react";

export type ReportCardProps = {
  title: string;
  score: string | number;
  description: string;
  type: "health" | "income" | "risk" | "capacity" | "reputation";
};

export function ReportCard({ title, score, description, type }: ReportCardProps) {
  const getIcon = () => {
    switch (type) {
      case "health": return <Activity size={16} className="text-primary" />;
      case "income": return <Briefcase size={16} className="text-btc-orange" />;
      case "risk": return <ShieldAlert size={16} className="text-danger" />;
      case "capacity": return <TrendingUp size={16} className="text-success" />;
      case "reputation": return <Activity size={16} className="text-primary" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case "health": return "border-primary/30";
      case "income": return "border-btc-orange/30";
      case "risk": return "border-danger/30";
      case "capacity": return "border-success/30";
      case "reputation": return "border-primary/30";
    }
  };

  return (
    <div className={`mt-2 mb-3 flex flex-col gap-2 rounded-[16px] border ${getBorderColor()} bg-white/[0.03] p-4 shadow-sm backdrop-blur-md`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getIcon()}
          <span className="text-sm font-semibold text-white">{title}</span>
        </div>
        <span className="font-sora text-lg font-bold text-white">{score}</span>
      </div>
      <p className="text-xs text-stardust">{description}</p>
    </div>
  );
}
