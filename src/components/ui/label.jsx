import React from "react";
import { cn } from "../../lib/utils";

export const Label = ({ children, className, required, ...props }) => (
  <label
    className={cn("block text-sm font-medium text-gray-700", className)}
    {...props}
  >
    {children}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);
