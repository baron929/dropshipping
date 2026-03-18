import { AlertCircle, CheckCircle, Info, X } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Toast Notification System
 * Global toast notifications for success/error/info messages
 *
 * Usage:
 * import { useToast } from "./context/ToastContext";
 *
 * const { showToast } = useToast();
 * showToast("Success!", "success");
 * showToast("Error occurred", "error");
 */

export function Toast({ id, message, type = "info", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000); // Auto-close after 5 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: "bg-emerald-50 border-emerald-200",
    error: "bg-rose-50 border-rose-200",
    info: "bg-blue-50 border-blue-200",
    warning: "bg-amber-50 border-amber-200",
  }[type];

  const textColor = {
    success: "text-emerald-900",
    error: "text-rose-900",
    info: "text-blue-900",
    warning: "text-amber-900",
  }[type];

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertCircle,
  }[type];

  return (
    <div className={`${bgColor} ${textColor} border rounded-lg p-4 flex items-start gap-3 shadow-lg`}>
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
        onClick={onClose}
        className="text-current opacity-50 hover:opacity-100 transition"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onClose }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => onClose(toast.id)}
        />
      ))}
    </div>
  );
}
