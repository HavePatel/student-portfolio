import { useContext } from "react";
import ToastContext from "../context/ToastContext";

/**
 * useToast
 * Custom hook to trigger notifications across the portfolio.
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      showToast: (msg) => console.log(`[Toast] ${msg}`),
    };
  }
  return ctx;
}

export default useToast;
