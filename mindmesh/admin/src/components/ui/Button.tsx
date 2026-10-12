import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary" | "destructive";
  size?: "sm" | "default" | "lg";
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "default", icon, children, className = "", disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors select-none rounded-[6px] focus-visible:outline-2 focus-visible:outline-[#1F5D46] focus-visible:outline-offset-1 disabled:opacity-50 disabled:pointer-events-none";

    const sizeStyles = {
      sm: "h-7 px-2.5 text-xs gap-1.5",
      default: "h-9 px-3.5 text-xs gap-2",
      lg: "h-10 px-4 text-sm gap-2",
    }[size];

    const variantStyles = {
      primary: "bg-[#1F5D46] text-white hover:bg-[#184A38] active:bg-[#133A2C]",
      secondary: "bg-white text-[#17201C] border border-[#E3E7E4] hover:bg-[#F6F7F5] active:bg-[#EEF1EE]",
      tertiary: "text-[#55605A] hover:text-[#17201C] hover:bg-[#F6F7F5]",
      destructive: "text-[#B42318] hover:bg-[#FDECEA] active:bg-[#FCD7D4]",
    }[variant];

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
        {...props}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
