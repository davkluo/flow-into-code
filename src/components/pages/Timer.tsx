"use client";

import { Pause, Play, Settings2, TimerReset } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { useTimer } from "@/context/TimerContext";
import { formatTime } from "@/lib/formatting";
import { cn } from "@/lib/utils";

export function Timer() {
  const { timeLeft, isRunning, start, pause, reset, setpoint, setSetpoint } =
    useTimer();
  const [sliderMinutes, setSliderMinutes] = useState(Math.round(setpoint / 60));
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const toastShownRef = useRef(false);

  const progress =
    timeLeft < 0
      ? Math.min(Math.abs(timeLeft) / setpoint, 1) * 100 // 0 -> 100 overtime
      : (timeLeft / setpoint) * 100; // 100 -> 0

  const handleSettingsSave = () => {
    const newSetpoint = sliderMinutes * 60;
    setSetpoint(newSetpoint);
    reset(newSetpoint);
    setIsPopoverOpen(false);
  };

  const handlePopoverChange = (isOpen: boolean) => {
    if (!isOpen && isPopoverOpen) {
      // Popover closed by clicking outside
      setSliderMinutes(Math.round(setpoint / 60));
    }
    setIsPopoverOpen(isOpen);
  };

  useEffect(() => {
    if (timeLeft === 0 && !toastShownRef.current) {
      toast("Time's up!", { description: "You're now in overtime." });
      toastShownRef.current = true;
    }
    if (timeLeft > 0) toastShownRef.current = false;
  }, [timeLeft]);

  return (
    <div className="group text-muted-foreground hover:text-foreground border-border hover:bg-muted/60 fixed bottom-0 left-0 z-50 h-16 w-full border-t px-8 py-2 backdrop-blur-sm">
      <div className="flex h-full items-center justify-between">
        <span
          className={cn(
            "text-2xl font-semibold tracking-widest",
            timeLeft < 0 && "text-rose-500/60 group-hover:text-rose-500",
          )}
        >
          {formatTime(Math.abs(timeLeft))}
        </span>
        <div className="w-full px-5">
          <Progress
            value={progress}
            className={cn(
              "group [&>div]:bg-muted-foreground [&>div]:group-hover:bg-foreground h-1",
              timeLeft < 0 &&
                "opacity-50 [&>div]:bg-rose-500/60 [&>div]:group-hover:bg-rose-500",
            )}
          />
        </div>
        <div className="flex items-center gap-2">
          {isRunning ? (
            // NOTE: !important used as workaround for not being able to resize lucide icons within shadcn Button
            <Button onClick={pause} size="icon" variant="ghost">
              <Pause className="!size-5" />
            </Button>
          ) : (
            <Button onClick={() => start()} size="icon" variant="ghost">
              <Play className="!size-5" />
            </Button>
          )}
          <Button onClick={() => reset()} size="icon" variant="ghost">
            <TimerReset className="!size-5" />
          </Button>
          <Popover open={isPopoverOpen} onOpenChange={handlePopoverChange}>
            <PopoverTrigger asChild>
              <Button
                onClick={() => {}}
                size="icon"
                variant="ghost"
                className="flex items-center justify-center"
              >
                <Settings2 className="!size-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72" align="end">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="timer">Timer Duration</Label>
                  <span className="text-muted-foreground text-sm tabular-nums">
                    {sliderMinutes} min
                  </span>
                </div>
                <Slider
                  id="timer"
                  min={5}
                  max={120}
                  step={5}
                  value={[sliderMinutes]}
                  onValueChange={([newMinutes]) => setSliderMinutes(newMinutes)}
                  className="w-full"
                />
                <div className="flex justify-center">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSettingsSave}
                    className="text-xs"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
