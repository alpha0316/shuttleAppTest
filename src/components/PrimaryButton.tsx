import React from "react";

type PrimaryButtonProps = {
  label?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
};

const PrimaryButton = ({
  label = "Continue",
  onClick,
  type = "button",
  disabled = false,
  className = "",
}: PrimaryButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full bg-green-600 text-white rounded-3xl  py-3 mt-2 font-medium transition-all
        hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {label}
    </button>
  );
};

export default PrimaryButton;
