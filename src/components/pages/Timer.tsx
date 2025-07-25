"use client";

import { Pause, Play, Settings2, TimerReset } from "lucide-react";
import { useEffect } from "react";
import { useTimer } from "@/context/TimerContext";
import { formatTime } from "@/lib/formatting";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";

export function Timer() {
  const { timeLeft, isRunning, start, pause, reset, setpoint } = useTimer();

  const progress =
    timeLeft < 0
      ? Math.min(Math.abs(timeLeft) / setpoint, 1) * 100 // 0 -> 100 overtime
      : (timeLeft / setpoint) * 100; // 100 -> 0

  return (
    <Card className="mt-5 flex flex-col gap-3 py-4">
      <div
        className={cn(
          "flex items-center justify-center text-5xl font-semibold",
          timeLeft < 0 && "text-rose-500",
        )}
      >
        {formatTime(Math.abs(timeLeft))}
      </div>
      <div className="w-full px-5">
        <Progress
          value={progress}
          className={cn(
            "h-1",
            timeLeft < 0 && "opacity-50 [&>div]:bg-rose-500",
          )}
        />
      </div>
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="ghost"
          className="flex items-center justify-center"
          onClick={() => (isRunning ? pause() : start())}
        >
          {
            // NOTE: !important used as workaround for not being able to resize lucide icons within shadcn Button
            isRunning ? (
              <Pause className="!size-5" />
            ) : (
              <Play className="!size-5" />
            )
          }
        </Button>
        <Button
          variant="ghost"
          className="flex items-center justify-center"
          onClick={reset}
        >
          <TimerReset className="!size-5" />
        </Button>
        <Button variant="ghost" className="flex items-center justify-center">
          <Settings2 className="!size-5" />
        </Button>
      </div>
    </Card>
  );
}
