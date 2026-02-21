"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// --- Types ---

type TimerActions = {
  setpoint: number;
  start: (initialTime?: number) => void;
  pause: () => void;
  reset: (overrideTime?: number) => void;
  setTime: (seconds: number) => void;
  setSetpoint: (seconds: number) => void;
};

type TimerState = {
  timeLeft: number;
  isRunning: boolean;
};

// Convenience type kept for Timer.tsx which needs everything
type TimerContextType = TimerActions & TimerState;

// --- Contexts ---

const TimerActionsContext = createContext<TimerActions | null>(null);
const TimerStateContext = createContext<TimerState | null>(null);

// --- Provider ---

export const TimerProvider = ({
  children,
  defaultTime = 1800,
}: {
  children: React.ReactNode;
  defaultTime?: number;
}) => {
  const [setpoint, setSetpointState] = useState(defaultTime);
  const [timeLeft, setTimeLeft] = useState(defaultTime);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Keep setpoint in a ref so reset() is fully stable (no dep on setpoint state)
  const setpointRef = useRef(defaultTime);

  const start = useCallback((initialTime?: number) => {
    if (initialTime !== undefined) {
      setpointRef.current = initialTime;
      setSetpointState(initialTime);
      setTimeLeft(initialTime);
    }
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => setIsRunning(false), []);

  const reset = useCallback((overrideTime?: number) => {
    setIsRunning(false);
    setTimeLeft(overrideTime ?? setpointRef.current);
  }, []);

  const setTime = useCallback((seconds: number) => setTimeLeft(seconds), []);

  const setSetpoint = useCallback((seconds: number) => {
    setpointRef.current = seconds;
    setSetpointState(seconds);
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  // Actions value is stable — only changes when setpoint changes (user adjusts timer)
  const actionsValue = useMemo<TimerActions>(
    () => ({ setpoint, start, pause, reset, setTime, setSetpoint }),
    [setpoint, start, pause, reset, setTime, setSetpoint],
  );

  // State value changes every second — only Timer subscribes to this
  const stateValue = useMemo<TimerState>(
    () => ({ timeLeft, isRunning }),
    [timeLeft, isRunning],
  );

  return (
    <TimerActionsContext.Provider value={actionsValue}>
      <TimerStateContext.Provider value={stateValue}>
        {children}
      </TimerStateContext.Provider>
    </TimerActionsContext.Provider>
  );
};

// --- Hooks ---

export const useTimerActions = (): TimerActions => {
  const ctx = useContext(TimerActionsContext);
  if (!ctx) throw new Error("useTimerActions must be used within a TimerProvider");
  return ctx;
};

export const useTimerState = (): TimerState => {
  const ctx = useContext(TimerStateContext);
  if (!ctx) throw new Error("useTimerState must be used within a TimerProvider");
  return ctx;
};

// Convenience hook for components that need everything (i.e. Timer.tsx)
export const useTimer = (): TimerContextType => ({
  ...useTimerActions(),
  ...useTimerState(),
});
