import type { Metadata } from "next";
import { PracticeSession } from "@/components/pages/PracticeSession";
import { TimerProvider } from "@/context/TimerContext";

export const metadata: Metadata = {
  title: "Practice",
};

export default function PracticePage() {
  return (
    <TimerProvider defaultTime={1800}>
      <div className="px-6 pt-1.5 sm:px-12 sm:pt-4">
        <PracticeSession />
      </div>
    </TimerProvider>
  );
}
