import React from "react";
import { ChevronRight, ArrowRight, Plus, ExternalLink } from "lucide-react";

const CustomButton = ({
  text,
  icon: Icon,
  variant = "primary",
  size = "md",
  iconPosition = "right",
  onClick,
  className,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300",
    outline:
      "border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50",
    ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
  };

  const sizes = {
    sm: "text-sm px-3 py-1.5 gap-1.5",
    md: "text-base px-4 py-2 gap-2",
    lg: "text-lg px-6 py-3 gap-2.5",
  };

  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 20,
  };

  return (
    <button
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${className || ""}
      `}
      onClick={onClick}
      {...props}
    >
      {Icon && iconPosition === "left" && (
        <Icon size={iconSizes[size]} className="flex-shrink-0" />
      )}

      {text && <span>{text}</span>}

      {Icon && iconPosition === "right" && (
        <Icon size={iconSizes[size]} className="flex-shrink-0" />
      )}
    </button>
  );
};

export const IconButton = (props) => <CustomButton {...props} text="" />;

export const TextButton = (props) => <CustomButton {...props} icon={null} />;

export const IconTextButton = (props) => <CustomButton {...props} />;

export default CustomButton;
