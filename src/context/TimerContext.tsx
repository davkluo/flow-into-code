"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

type TimerContextType = {
  timeLeft: number;
  setpoint: number;
  isRunning: boolean;
  start: (initialTime?: number) => void;
  pause: () => void;
  reset: (overrideTime?: number) => void;
  setTime: (seconds: number) => void;
  setSetpoint: (seconds: number) => void;
};

const TimerContext = createContext<TimerContextType | null>(null);

export const TimerProvider = ({
  children,
  defaultTime = 1800, // 30 minutes by default
}: {
  children: React.ReactNode;
  defaultTime?: number;
}) => {
  const [setpoint, setSetpoint] = useState(defaultTime);
  const [timeLeft, setTimeLeft] = useState(defaultTime);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = (initialTime?: number) => {
    if (initialTime !== undefined) {
      setSetpoint(initialTime);
      setTimeLeft(initialTime);
    }
    setIsRunning(true);
  };

  const pause = () => {
    setIsRunning(false);
  };

  const reset = (overrideTime?: number) => {
    setIsRunning(false);
    setTimeLeft(overrideTime ?? setpoint);
  };

  const setTime = (seconds: number) => {
    setTimeLeft(seconds);
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1); // allow negative
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  return (
    <TimerContext.Provider
      value={{
        timeLeft,
        setpoint,
        isRunning,
        start,
        pause,
        reset,
        setTime,
        setSetpoint,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error("useTimer must be used within a TimerProvider");
  return ctx;
};
