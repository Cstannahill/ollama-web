"use client";
import { useEffect } from "react";

interface ToastProps {
  message: string;
  onDismiss: () => void;
}

export const Toast = ({ message, onDismiss }: ToastProps) => {
  useEffect(() => {
    const id = setTimeout(onDismiss, 3000);
    return () => clearTimeout(id);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-4 right-4 bg-red-500 text-white px-3 py-2 rounded shadow">
      {message}
    </div>
  );
};
