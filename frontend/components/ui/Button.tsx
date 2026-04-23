import React, { ReactNode } from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "neutral"
  | "addPatient";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
}

const baseCls =
  "px-5 py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2";

const variants: Record<ButtonVariant, string> = {
  primary:
    "text-white bg-[#234075] hover:bg-[#09152b]",

  secondary:
    "text-[#0f2244] bg-[#f0f3fa] border border-[#dce3ef] hover:bg-[#dce3ef]",

  danger:
    "text-white bg-[#ad9897] hover:bg-[#8f7d7c]",

  neutral:
    "text-[#6b7da0] border border-[#dce3ef] hover:border-[#0f2244] hover:text-[#0f2244]",
  addPatient:
    "flex items-center gap-2 bg-[#c8102e] hover:bg-[#a50d25] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-lg shadow-[#c8102e]/30",
};

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  isLoading,
  icon,
  iconPosition = "left",
  disabled,
  className = "",
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`${baseCls} ${variants[variant]} ${
        disabled || isLoading ? "opacity-60 cursor-not-allowed" : ""
      } ${className}`}
    >
       {isLoading ? (
        "Loading..."
      ) : (
        <>
          {icon && iconPosition === "left" && icon}
          {children}
          {icon && iconPosition === "right" && icon}
        </>
      )}
    </button>
  );
};

export default Button;
