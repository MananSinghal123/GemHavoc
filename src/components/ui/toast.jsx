import React from "react";

const ToastContext = React.createContext({});

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = React.useState([]);

  const addToast = (toast) => {
    setToasts((prev) => [...prev, { id: Date.now(), ...toast }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed top-0 right-0 z-50 p-4 space-y-4">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const Toast = ({ title, description, variant = "default", onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const baseClasses =
    "rounded-lg p-4 shadow-lg flex items-center justify-between";
  const variantClasses = {
    default: "bg-white text-gray-800",
    destructive: "bg-red-600 text-white",
  };

  return (
    <div className={cn(baseClasses, variantClasses[variant])}>
      <div>
        {title && <div className="font-semibold">{title}</div>}
        {description && <div className="text-sm mt-1">{description}</div>}
      </div>
      <button
        onClick={onClose}
        className="ml-4 text-gray-500 hover:text-gray-700"
      >
        ×
      </button>
    </div>
  );
};
