import { headers } from "next/headers";
import { PracticeAccordionSections } from "@/components/pages/PracticeAccordionSections";
import { Timer } from "@/components/pages/Timer";
import { TimerProvider } from "@/context/TimerContext";

export default async function PracticePage() {
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const res = await fetch(`${protocol}://${host}/api/lc-problems`, {
    next: { revalidate: 3600 },
  });
  const problems = await res.json();

  return (
    <TimerProvider defaultTime={1800}>
      <div className="px-12 py-8 pb-16">
        <h1 className="mb-4 text-2xl font-bold">Practice Problems</h1>
        <PracticeAccordionSections problems={problems} />
      </div>
      <Timer />
    </TimerProvider>
  );
}
