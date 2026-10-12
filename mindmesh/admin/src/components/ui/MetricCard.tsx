import React from "react";

export interface MetricCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaType?: "positive" | "neutral" | "negative";
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  delta,
  deltaType = "neutral",
  className = "",
}) => {
  const deltaColor = {
    positive: "text-[#1F7A4D]",
    neutral: "text-[#55605A]",
    negative: "text-[#B42318]",
  }[deltaType];

  return (
    <div className={`bg-white border border-[#E3E7E4] rounded-[10px] p-4 ${className}`}>
      <div className="text-xs font-medium uppercase tracking-wider text-[#55605A] mb-1">
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-[#17201C] tabular-nums tracking-tight">
          {value}
        </span>
        {delta && (
          <span className={`text-xs font-medium tabular-nums ${deltaColor}`}>
            {delta}
          </span>
        )}
      </div>
    </div>
  );
};
