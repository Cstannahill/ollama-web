"use client";
import { useEffect } from "react";

export const ServiceWorkerProvider = () => {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/service-worker.js").catch(() => {});
    }
  }, []);
  return null;
};
