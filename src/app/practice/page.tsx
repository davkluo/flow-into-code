import { PracticeSession } from "@/components/pages/PracticeSession";
import { Timer } from "@/components/pages/Timer";
import { TimerProvider } from "@/context/TimerContext";

export default function PracticePage() {
  return (
    <TimerProvider defaultTime={1800}>
      <div className="px-12 py-8 pb-16">
        <PracticeSession />
      </div>
      <Timer />
    </TimerProvider>
  );
}
