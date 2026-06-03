"use client";

import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

/**
 * Type defining the possible types of toasts.
 */
export type ToastType = "success" | "error";

/**
 * Interface representing the state of an active toast.
 */
export interface Toast {
  /** The type of toast: success or error */
  type: ToastType;
  /** The message content to be displayed in the toast */
  message: string;
}

/**
 * Interface for the Toast Context value.
 */
interface ToastContextType {
  /**
   * Triggers a new toast message.
   * @param type - The type of toast ("success" | "error").
   * @param message - The message text to display.
   */
  showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Props interface for the ToastProvider component.
 */
interface ToastProviderProps {
  /** The child elements that will be wrapped by the provider */
  children: ReactNode;
}

/**
 * ToastProvider component that wraps the application and hosts the global toast notifications.
 * It manages the display state and transitions of toast notifications, preserving the application's
 * retro-futuristic style.
 *
 * @param props - Component props containing children.
 * @returns The provider component with children and the floating toast notification.
 */
export function ToastProvider({ children }: ToastProviderProps): React.JSX.Element {
  const [toast, setToast] = useState<Toast | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Triggers and displays a toast message, clearing any existing active auto-dismiss timer.
   */
  const showToast = useCallback((type: ToastType, message: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setToast({ type, message });
    timeoutRef.current = setTimeout(() => {
      setToast(null);
      timeoutRef.current = null;
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all animate-bounce ${
            toast.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5 animate-pulse" />
          ) : (
            <AlertCircle className="w-5 h-5 animate-pulse" />
          )}
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}
    </ToastContext.Provider>
  );
}

/**
 * Custom hook to consume the Toast Context.
 * Allows components to trigger toast notifications globally without maintaining local state.
 *
 * @returns The toast context functions.
 * @throws Error if used outside of a ToastProvider.
 */
export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
