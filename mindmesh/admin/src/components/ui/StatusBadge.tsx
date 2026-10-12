import React from "react";

export type BadgeVariant = "critical" | "warning" | "success" | "info" | "neutral";

export interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  showDot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = "neutral",
  showDot = true,
  className = "",
}) => {
  const styles: Record<BadgeVariant, { bg: string; text: string; dot: string }> = {
    critical: {
      bg: "bg-[#FDECEA]",
      text: "text-[#B42318]",
      dot: "bg-[#B42318]",
    },
    warning: {
      bg: "bg-[#FEF3E2]",
      text: "text-[#A15C07]",
      dot: "bg-[#A15C07]",
    },
    success: {
      bg: "bg-[#E6F4EC]",
      text: "text-[#1F7A4D]",
      dot: "bg-[#1F7A4D]",
    },
    info: {
      bg: "bg-[#E8F0FA]",
      text: "text-[#1D5FA8]",
      dot: "bg-[#1D5FA8]",
    },
    neutral: {
      bg: "bg-[#F0F2F0]",
      text: "text-[#55605A]",
      dot: "bg-[#7C867F]",
    },
  };

  const current = styles[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] text-xs font-medium ${current.bg} ${current.text} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${current.dot}`} />}
      <span className="truncate">{label}</span>
    </span>
  );
};
