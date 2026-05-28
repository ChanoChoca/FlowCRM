"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from "react";

type ToastType = "success" | "info" | "warn" | "error";

type Toast = {
  id: string;
  message: string;
  type: keyof typeof TOAST_VARIANTS;
};

type Action = { type: "ADD"; toast: Toast } | { type: "REMOVE"; id: string };

type ToastContextType = {
  show: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

function reducer(state: Toast[], action: Action) {
  switch (action.type) {
    case "ADD":
      return [...state, action.toast];
    case "REMOVE":
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, dispatch] = useReducer(reducer, []);

  const removeToast = useCallback((id: string) => {
    dispatch({ type: "REMOVE", id });
  }, []);

  const show = useCallback((message: string, type: ToastType = "info") => {
    const id = crypto.randomUUID();
    dispatch({ type: "ADD", toast: { id, message, type } });
    setTimeout(() => dispatch({ type: "REMOVE", id }), 3000);
  }, []);

  const value = useMemo(() => ({ show, removeToast }), [show, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context)
    throw new Error("useToast debe ser usado dentro de un ToastProvider");

  return context;
};

const TOAST_VARIANTS = {
  success: {
    border: "border-emerald-500 dark:border-emerald-400",
    bgIcon: "bg-emerald-50 dark:bg-emerald-950/50",
    color: "text-emerald-600 dark:text-emerald-400",
    glow: "shadow-emerald-500/10 dark:shadow-emerald-500/5",
  },
  info: {
    border: "border-blue-500 dark:border-blue-400",
    bgIcon: "bg-blue-50 dark:bg-blue-950/50",
    color: "text-blue-600 dark:text-blue-400",
    glow: "shadow-blue-500/10 dark:shadow-blue-500/5",
  },
  warn: {
    border: "border-amber-500 dark:border-amber-400",
    bgIcon: "bg-amber-50 dark:bg-amber-950/50",
    color: "text-amber-600 dark:text-amber-400",
    glow: "shadow-amber-500/10 dark:shadow-amber-500/5",
  },
  error: {
    border: "border-red-500 dark:border-red-400",
    bgIcon: "bg-red-50 dark:bg-red-950/50",
    color: "text-red-600 dark:text-red-400",
    glow: "shadow-red-500/10 dark:shadow-red-500/5",
  },
};

function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[];
  removeToast: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-900 flex flex-col gap-3">
      {toasts.map((toast) => {
        const variant = TOAST_VARIANTS[toast.type];

        return (
          <div
            key={toast.id}
            className={`flex w-full items-center justify-between gap-3 rounded-xl border-l-4 ${variant.border} bg-white/95 p-3.5 shadow-lg ${variant.glow} backdrop-blur-xl animate-fade-in-up sm:max-w-90 dark:bg-neutral-900/95`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${variant.bgIcon} ${variant.color}`}
              >
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 22 22"
                  fill="none"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M2.70186 11.0001C2.70186 6.41711 6.41711 2.70186 11.0001 2.70186C15.5831 2.70186 19.2984 6.41711 19.2984 11.0001C19.2984 15.5831 15.5831 19.2984 11.0001 19.2984C6.41711 19.2984 2.70186 15.5831 2.70186 11.0001ZM11.0001 0.901855C5.423 0.901855 0.901855 5.423 0.901855 11.0001C0.901855 16.5772 5.423 21.0984 11.0001 21.0984C16.5772 21.0984 21.0984 16.5772 21.0984 11.0001C21.0984 5.423 16.5772 0.901855 11.0001 0.901855ZM14.6197 9.73951C14.9712 9.38804 14.9712 8.81819 14.6197 8.46672C14.2683 8.11525 13.6984 8.11525 13.347 8.46672L10.1894 11.6243L8.6533 10.0883C8.30183 9.7368 7.73198 9.7368 7.38051 10.0883C7.02904 10.4397 7.02904 11.0096 7.38051 11.3611L9.55295 13.5335C9.72174 13.7023 9.95065 13.7971 10.1894 13.7971C10.428 13.7971 10.657 13.7023 10.8257 13.5335L14.6197 9.73951Z"
                    fill="currentColor"
                  ></path>
                </svg>
              </div>
              <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 rounded-lg p-1 text-neutral-400 transition-all hover:bg-neutral-100 hover:text-neutral-700 active:scale-90 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
            >
              <svg
                className="h-5 w-5"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.04289 16.5418C5.65237 16.9323 5.65237 17.5655 6.04289 17.956C6.43342 18.3465 7.06658 18.3465 7.45711 17.956L11.9987 13.4144L16.5408 17.9565C16.9313 18.347 17.5645 18.347 17.955 17.9565C18.3455 17.566 18.3455 16.9328 17.955 16.5423L13.4129 12.0002L17.955 7.45808C18.3455 7.06756 18.3455 6.43439 17.955 6.04387C17.5645 5.65335 16.9313 5.65335 16.5408 6.04387L11.9987 10.586L7.45711 6.04439C7.06658 5.65386 6.43342 5.65386 6.04289 6.04439C5.65237 6.43491 5.65237 7.06808 6.04289 7.4586L10.5845 12.0002L6.04289 16.5418Z"
                  fill="currentColor"
                ></path>
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
