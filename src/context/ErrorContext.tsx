import React, { createContext, useContext, useState, useCallback, useMemo,} from "react";

/* --------------------------------------------------
   1️⃣ Error Types
-------------------------------------------------- */
export type ErrorType =
  | "NONE"
  | "NO_DATA"
  | "SERVER_ERROR"
  | "CONNECTION_LOST";

export interface ErrorState {
  type: ErrorType;
  message?: string;
}

/* --------------------------------------------------
   2️⃣ Context Shape
-------------------------------------------------- */
interface ErrorContextType {
  error: ErrorState;
  setNoData: () => void;
  setServerError: (message?: string) => void;
  setConnectionLost: () => void;
  clearError: () => void;
}

/* --------------------------------------------------
   3️⃣ Create Context
-------------------------------------------------- */
const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

/* --------------------------------------------------
   4️⃣ ProviderFVZ
-------------------------------------------------- */

export const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [error, setError] = useState<ErrorState>({ type: "NONE" });

  const setNoData = useCallback(() => {
    setError({ type: "NO_DATA" });
  }, []);

  const setServerError = useCallback((message?: string) => {
    setError({ type: "SERVER_ERROR", message });
  }, []);

  const setConnectionLost = useCallback(() => {
    setError({ type: "CONNECTION_LOST" });
  }, []);

  const clearError = useCallback(() => {
    setError({ type: "NONE" });
  }, []);

  const contextValue = useMemo(
    () => ({
      error,
      setNoData,
      setServerError,
      setConnectionLost,
      clearError,
    }),
    [
      error,
      setNoData,
      setServerError,
      setConnectionLost,
      clearError,
    ]
  );

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
    </ErrorContext.Provider>
  );
};
/* --------------------------------------------------
   5️⃣ Hook
-------------------------------------------------- */
export const useGlobalError = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useGlobalError must be used within ErrorProvider");
  }
  return context;
};

/* --------------------------------------------------
   6️⃣ Global Error Handler (Axios Safe)
-------------------------------------------------- */
let errorActions: ErrorContextType | null = null;

export const registerErrorContext = (ctx: ErrorContextType) => {
  errorActions = ctx;
};

export const globalErrorHandler = (err: any) => {
  if (!errorActions) return;

  if (err?.code === "ERR_NETWORK") {
    errorActions.setConnectionLost();
    return;
  }

  const status = err?.response?.status;

  if (status === 404) {
    errorActions.setNoData();
  } else if (status >= 500) {
    errorActions.setServerError(
      err?.response?.data?.message || "Server error"
    );
  }
};
