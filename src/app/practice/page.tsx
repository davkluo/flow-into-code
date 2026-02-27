import { PracticeSession } from "@/components/pages/PracticeSession";
import { TimerProvider } from "@/context/TimerContext";

export default function PracticePage() {
  return (
    <TimerProvider defaultTime={1800}>
      <div className="px-6 pt-1.5 sm:pt-4 sm:px-12">
        <PracticeSession />
      </div>
    </TimerProvider>
  );
}
