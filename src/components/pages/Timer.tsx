"use client";

import { Pause, Play, Settings2, TimerReset } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useTimer } from "@/context/TimerContext";
import { formatTime } from "@/lib/formatting";
import { cn } from "@/lib/utils";

export function Timer() {
  const { timeLeft, isRunning, start, pause, reset, setpoint, setSetpoint } =
    useTimer();
  const [inputMinutes, setInputMinutes] = useState<string>(
    String(Math.round(setpoint / 60)),
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const toastShownRef = useRef(false);

  const progress =
    timeLeft < 0
      ? Math.min(Math.abs(timeLeft) / setpoint, 1) * 100 // 0 -> 100 overtime
      : (timeLeft / setpoint) * 100; // 100 -> 0

  const handleResetAndApply = () => {
    const parsed = parseInt(inputMinutes);
    if (!parsed) {
      toast.error("Invalid duration", {
        description: "Please enter a duration of at least 1 minute.",
      });
      return;
    }
    const newSetpoint = Math.min(120, parsed) * 60;
    setSetpoint(newSetpoint);
    reset(newSetpoint);
    setIsDialogOpen(false);
  };

  const handleDialogChange = (isOpen: boolean) => {
    if (isOpen) {
      setInputMinutes(String(Math.round(setpoint / 60)));
    }
    setIsDialogOpen(isOpen);
  };

  useEffect(() => {
    if (timeLeft === 0 && !toastShownRef.current) {
      toast("Time's up!", { description: "You're now in overtime." });
      toastShownRef.current = true;
    }
    if (timeLeft > 0) toastShownRef.current = false;
  }, [timeLeft]);

  return (
    <div className="flex w-44 flex-col gap-2 rounded-xl border border-white/15 bg-white/5 px-2.5 pt-2 pb-2.5 shadow-2xl backdrop-blur-2xl">
      <div className="flex w-full items-center justify-between px-2">
        {/* Time */}
        <span
          className={cn(
            "text-foreground/80 text-center text-xl font-semibold tracking-widest",
            timeLeft < 0 && "text-rose-500/70",
          )}
        >
          {formatTime(Math.abs(timeLeft))}
        </span>

        {/* Controls */}
        <div className="flex w-full justify-end gap-2.5">
          {isRunning ? (
            // NOTE: !important used as workaround for not being able to resize lucide icons within shadcn Button
            <Button
              onClick={pause}
              size="icon"
              variant="link"
              className="text-muted-foreground hover:text-foreground w-min"
            >
              <Pause className="!size-4" />
            </Button>
          ) : (
            <Button
              onClick={() => start()}
              size="icon"
              variant="link"
              className="text-muted-foreground hover:text-foreground w-min"
            >
              <Play className="!size-4" />
            </Button>
          )}

          <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button
                size="icon"
                variant="link"
                className="text-muted-foreground hover:text-foreground w-min"
              >
                <Settings2 className="!size-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="w-72">
              <DialogHeader>
                <DialogTitle>Timer Settings</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 pt-2">
                <div className="flex justify-center gap-3">
                  <input
                    id="timer-duration"
                    type="text"
                    inputMode="numeric"
                    className="border-border focus:border-primary h-14 w-24 border-b-2 bg-transparent px-0 text-center text-4xl font-semibold outline-none"
                    value={inputMinutes}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/[^0-9]/g, "");
                      if (digits === "" || parseInt(digits) <= 120) {
                        setInputMinutes(digits);
                      } else {
                        setInputMinutes("120");
                      }
                    }}
                  />
                  <Label
                    htmlFor="timer-duration"
                    className="self-end pb-2 text-lg"
                  >
                    min.
                  </Label>
                </div>
                <Button onClick={handleResetAndApply} className="w-full gap-2">
                  <TimerReset className="!size-4" />
                  Reset Timer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Progress bar */}
      <Progress
        value={progress}
        className={cn(
          "[&>div]:bg-muted-foreground h-1",
          timeLeft < 0 && "opacity-50 [&>div]:bg-rose-500",
        )}
      />
    </div>
  );
}
