import React from "react";
import { Button } from "./Button";

export interface EmptyStateProps {
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  description,
  actionLabel,
  onAction,
  className = "",
}) => {
  return (
    <div
      className={`py-12 px-4 flex flex-col items-center justify-center text-center ${className}`}
    >
      <p className="text-xs text-[#55605A] max-w-sm mb-3">{description}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
