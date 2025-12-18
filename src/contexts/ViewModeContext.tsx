import * as React from "react";

/**
 * View mode options for the trading interface
 * - basic: Simplified view for beginners with essential features only
 * - pro: Full-featured view for experienced traders with all tools visible
 */
export type ViewMode = "basic" | "pro";

interface ViewModeContextType {
  /** Current view mode */
  viewMode: ViewMode;
  /** Toggle between basic and pro modes */
  toggleViewMode: () => void;
  /** Set specific view mode */
  setViewMode: (mode: ViewMode) => void;
  /** Check if current mode is basic */
  isBasicMode: boolean;
  /** Check if current mode is pro */
  isProMode: boolean;
}

const ViewModeContext = React.createContext<ViewModeContextType | undefined>(
  undefined,
);

const VIEW_MODE_STORAGE_KEY = "tradex-view-mode";

/**
 * Provider for managing view mode state across the trading interface
 * Persists preference to localStorage
 */
export const ViewModeProvider: React.FC<{ children?: React.ReactNode }> = ({
  children,
} = {}) => {
  const [viewMode, setViewModeState] = React.useState<ViewMode>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
      if (stored === "basic" || stored === "pro") {
        return stored;
      }
    }
    return "basic"; // Default to basic for new users
  });

  const setViewMode = React.useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
  }, []);

  const toggleViewMode = React.useCallback(() => {
    setViewMode(viewMode === "basic" ? "pro" : "basic");
  }, [viewMode, setViewMode]);

  const value = React.useMemo(
    () => ({
      viewMode,
      toggleViewMode,
      setViewMode,
      isBasicMode: viewMode === "basic",
      isProMode: viewMode === "pro",
    }),
    [viewMode, toggleViewMode, setViewMode],
  );

  return (
    <ViewModeContext.Provider value={value}>
      {children}
    </ViewModeContext.Provider>
  );
};

/**
 * Hook to access view mode state and controls
 * @throws Error if used outside ViewModeProvider
 */
export const useViewMode = (): ViewModeContextType => {
  const context = React.useContext(ViewModeContext);
  if (!context) {
    throw new Error("useViewMode must be used within a ViewModeProvider");
  }
  return context;
};

/**
 * Hook to safely access view mode, returns defaults if provider not found
 * Useful for components that may be rendered outside the provider
 */
export const useViewModeSafe = (): ViewModeContextType => {
  const context = React.useContext(ViewModeContext);
  return (
    context ?? {
      viewMode: "basic",
      toggleViewMode: () => {},
      setViewMode: () => {},
      isBasicMode: true,
      isProMode: false,
    }
  );
};
