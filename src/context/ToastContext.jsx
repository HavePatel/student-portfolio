import { createContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import "../styles/task.css";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = "success") => {
      const id = Date.now() + Math.random().toString(36).slice(2, 6);
      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        removeToast(id);
      }, 3800);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <aside
        className="toast-container"
        aria-label="Notifications"
        role="region"
      >
        {toasts.map(({ id, message, type }) => (
          <div
            key={id}
            className={`toast toast--${type}`}
            role={type === "error" ? "alert" : "status"}
            aria-live="polite"
          >
            <span className="toast__icon" aria-hidden="true">
              {type === "success" && <CheckCircle2 size={18} />}
              {type === "error" && <AlertCircle size={18} />}
              {type === "info" && <Info size={18} />}
            </span>
            <p className="toast__msg">{message}</p>
            <button
              type="button"
              className="toast__close"
              onClick={() => removeToast(id)}
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </aside>
    </ToastContext.Provider>
  );
}

export default ToastContext;
