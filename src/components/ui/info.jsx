import React from "react";
import { Tooltip } from "./tooltip";

export const Info = ({ description, className }) => {
  return (
    <Tooltip content={description}>
      <div
        className={cn(
          "inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 cursor-help",
          className
        )}
      >
        <span className="text-xs font-bold">i</span>
      </div>
    </Tooltip>
  );
};
