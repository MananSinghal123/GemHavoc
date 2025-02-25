import React from "react";
import { cn } from "../../lib/utils";

export const Card = ({ className, children, ...props }) => (
  <div
    className={cn(
      "rounded-lg border border-gray-200 bg-white shadow",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ className, children, ...props }) => (
  <div className={cn("p-4 border-b border-gray-200", className)} {...props}>
    {children}
  </div>
);

export const CardContent = ({ className, children, ...props }) => (
  <div className={cn("p-4", className)} {...props}>
    {children}
  </div>
);
