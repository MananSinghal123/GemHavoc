import React from "react";

export const Tooltip = ({ children, content, className }) => {
  const [show, setShow] = React.useState(false);
  const tooltipRef = React.useRef(null);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </div>
      {show && (
        <div
          ref={tooltipRef}
          className={cn(
            "absolute z-50 px-2 py-1 text-sm text-white bg-black rounded shadow-lg",
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
};
