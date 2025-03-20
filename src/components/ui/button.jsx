import React from "react";
import { cn } from "../../lib/utils";

export const Button = React.forwardRef(
  ({ 
    className, 
    variant = "primary", 
    size = "default", 
    isLoading = false,
    icon,
    children, 
    ...props 
  }, ref) => {
    const baseClasses = "inline-flex items-center justify-center font-medium transition-colors rounded-md";
    
    const variantClasses = {
      primary: "bg-amber-700 hover:bg-amber-600 text-white border-2 border-amber-900 shadow-lg",
      treasure: "bg-[#8b4513] hover:bg-[#cd7f32] text-white border border-[#ffd700]",
      destructive: "bg-red-600 text-white hover:bg-red-700",
      outline: "border border-gray-300 bg-white hover:bg-gray-50 text-gray-800",
      ghost: "hover:bg-gray-100 text-gray-800",
    };
    
    const sizeClasses = {
      sm: "h-8 px-3 py-1 text-sm",
      default: "h-10 px-4 py-2",
      md: "h-12 px-6 py-3 font-semibold",
      lg: "h-14 px-8 py-4 text-lg font-bold",
    };

    const renderContent = () => {
      if (isLoading) {
        return (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>All hands on deck...</span>
          </div>
        );
      }

      return (
        <div className="flex items-center justify-center gap-2">
          {icon && <span className="text-xl">{icon}</span>}
          {children}
        </div>
      );
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {renderContent()}
      </button>
    );
  }
);

Button.displayName = "Button";