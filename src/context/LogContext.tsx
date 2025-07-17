// src/context/LogContext.tsx

import { createContext, useContext, useCallback } from "react";
import type { ReactNode } from "react"; // SỬA: Import 'ReactNode' dưới dạng type-only

export type LogType = "info" | "success" | "warning" | "error";

interface LogContextType {
  addLog: (
    message: string,
    source: string,
    type?: LogType,
    payload?: any
  ) => void;
}

const LogContext = createContext<LogContextType | undefined>(undefined);

export const useLog = () => {
  const context = useContext(LogContext);
  if (!context) {
    throw new Error("useLog must be used within a LogProvider");
  }
  return context;
};

export const LogProvider = ({ children }: { children: ReactNode }) => {
  const addLog = useCallback(
    (
      message: string,
      source: string,
      type: LogType = "info",
      payload?: any
    ) => {
      console.log(`[${type.toUpperCase()}] (${source}): ${message}`);
      if (payload) {
        console.log("Payload:", payload);
      }
    },
    []
  );

  return (
    <LogContext.Provider value={{ addLog }}>{children}</LogContext.Provider>
  );
};
