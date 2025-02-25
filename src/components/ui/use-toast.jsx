// use-toast.jsx
import React from "react";

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 5000;

export const useToast = () => {
  const [toasts, setToasts] = React.useState([]);

  const toast = React.useCallback(
    ({
      title,
      description,
      variant = "default",
      duration = TOAST_REMOVE_DELAY,
    }) => {
      const id = Math.random().toString(36).substr(2, 9);

      const newToast = {
        id,
        title,
        description,
        variant,
      };

      setToasts((currentToasts) => [...currentToasts, newToast]);

      if (duration !== Infinity) {
        setTimeout(() => {
          setToasts((currentToasts) =>
            currentToasts.filter((toast) => toast.id !== id)
          );
        }, duration);
      }

      return {
        id,
        dismiss: () =>
          setToasts((currentToasts) =>
            currentToasts.filter((toast) => toast.id !== id)
          ),
        update: (props) =>
          setToasts((currentToasts) =>
            currentToasts.map((toast) =>
              toast.id === id ? { ...toast, ...props } : toast
            )
          ),
      };
    },
    []
  );

  const dismiss = React.useCallback((toastId) => {
    setToasts((currentToasts) =>
      toastId ? currentToasts.filter((toast) => toast.id !== toastId) : []
    );
  }, []);

  return {
    toasts: toasts.slice(0, TOAST_LIMIT),
    toast,
    dismiss,
  };
};

// ToastProvider.jsx
export const ToastProvider = ({ children }) => {
  const { toasts } = useToast();

  return (
    <>
      {children}
      <div className="fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </>
  );
};

// Toast component (used by ToastProvider)
const Toast = ({
  id,
  title,
  description,
  variant = "default",
  onOpenChange,
}) => {
  const { dismiss } = useToast();

  return (
    <div
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
        variant === "default"
          ? "border-border bg-background text-foreground"
          : "border-destructive bg-destructive text-destructive-foreground"
      )}
    >
      <div className="flex flex-col gap-1">
        {title && <div className="text-sm font-semibold">{title}</div>}
        {description && <div className="text-sm opacity-90">{description}</div>}
      </div>
      <button
        onClick={() => dismiss(id)}
        className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none group-hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
};
