import { PracticeSession } from "@/components/pages/PracticeSession";
import { Timer } from "@/components/pages/Timer";
import { TimerProvider } from "@/context/TimerContext";

export default function PracticePage() {
  return (
    <TimerProvider defaultTime={1800}>
      <div className="px-12 py-8 pb-16">
        <h1 className="mb-4 text-2xl font-bold">Practice Problems</h1>
        <PracticeSession />
      </div>
      <Timer />
    </TimerProvider>
  );
}
