import { PracticeSession } from "@/components/pages/PracticeSession";
import { TimerProvider } from "@/context/TimerContext";

export default function PracticePage() {
  return (
    <TimerProvider defaultTime={1800}>
      <div className="px-12 pt-4">
        <PracticeSession />
      </div>
    </TimerProvider>
  );
}
