// Text.jsx - Custom Text component to replace Chakra's Text
import React from "react";
import { cn } from "../../lib/utils";

export const Text = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <p ref={ref} className={cn("text-base", className)} {...props}>
      {children}
    </p>
  )
);

Text.displayName = "Text";
