import { SocialsRow } from "@/components/shared/SocialsRow";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-8">
      <div className="flex items-baseline gap-2">
        <h1 className="text-xl font-semibold">About</h1>
      </div>

      <div className="space-y-8">
        <section className="space-y-3">
          <p className="text-muted-foreground text-sm leading-6">
            Hi, I&apos;m David, the creator of this app. Thanks for stopping by. I hope you
            take some time to explore what I&apos;ve built.
          </p>
          <p className="text-muted-foreground text-sm leading-6">
            I&apos;m an early-career engineer who created Flow Into Code to solve a problem
            I ran into myself. If you&apos;d like to connect or follow along with what I&apos;m
            building, you can find me on LinkedIn and other platforms. I&apos;ve put a lot
            of thought and intention into this project, and I&apos;m proud of what it&apos;s
            becoming.
          </p>
          <SocialsRow />
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-foreground/75">Why I Built Flow Into Code</h2>
          <p className="text-muted-foreground text-sm leading-6">
            My inspiration for building Flow Into Code came from failing technical
            interviews. Not from a lack of preparation or knowledge, but from the time
            pressure of a real interview. Communication is a critical part of
            interviewing, yet it&apos;s entirely different from how LeetCode problems are
            usually practiced: alone, quietly, and straight into code.
          </p>
          <p className="text-muted-foreground text-sm leading-6">
            I built Flow Into Code to practice as close to real interview conditions as
            possible. The AI interviewer chat aims to replicate the kinds of interactions
            you&apos;d have with a real interviewer. The structure of each session is
            designed to encourage a consistent approach to both familiar and new
            problems, so that consistency carries through when it matters most.
          </p>
          <p className="text-muted-foreground text-sm leading-6">
            Stripped of the coding disguise, interviews are really about problem-solving
            ability. They evaluate our ability to translate requirements into solutions,
            detect edge cases, clarify ambiguities, and create a plan before putting it
            into motion. That&apos;s what Flow Into Code is built around.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-foreground/75">A Consistent Process</h2>
          <p className="text-muted-foreground text-sm leading-6">
            &ldquo;Practice how you play.&rdquo; That saying from sports applies just as well to
            technical interviews. By creating a consistent flow through the
            problem-solving process, we&apos;re more likely to perform well in an actual
            interview setting.
          </p>
          <p className="text-muted-foreground text-sm leading-6">
            Code should be the simplest part of the solution. Data structures and
            algorithms are developed in a language-agnostic way, so at that point it
            largely comes down to familiarity with syntax. What matters most is solving
            the right problem, identifying the right edge cases, and shaping a clear
            approach before writing implementation details.
          </p>
          <p className="text-muted-foreground text-sm leading-6">
            Using completed code as a measure of problem-solving ability may be
            imperfect, but it&apos;s the reality. Practicing the translation from approach to
            code is a key part of succeeding within that system.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-foreground/75">Reframing LeetCode Practice</h2>
          <p className="text-muted-foreground text-sm leading-6">
            Many people practicing LeetCode are in the early stages of their careers.
            They may be aiming for internships, new grad roles, or entry-level
            positions. I understand how frustrating it can be to apply for entry-level
            jobs that still expect significant experience. At the same time, many
            industry professionals dislike LeetCode as an evaluation tool because it
            feels disconnected from their daily work.
          </p>
          <p className="text-muted-foreground text-sm leading-6">
            Flow Into Code tries to bridge that gap by reframing classic LeetCode
            problems as real software engineering tasks. Instead of abstract puzzles,
            problems are presented from multiple perspectives (general, backend,
            systems) to show how algorithms surface in different industry contexts. The
            goal is to make the connection between interview preparation and real
            engineering work feel more concrete.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-foreground/75">Why LeetCode Still Matters in 2026</h2>
          <p className="text-muted-foreground text-sm leading-6">
            There&apos;s a lot of speculation about whether LeetCode or
            &ldquo;implementation&rdquo; skills will still be valued in the age of rapidly
            advancing AI tooling. My take is that fundamentals will always matter.
          </p>
          <p className="text-muted-foreground text-sm leading-6">
            The existence of binary search libraries doesn&apos;t make it obsolete to
            understand how binary search works. In a world where more code is written
            by AI, it becomes even more important to read and understand code, both to
            learn from it and to review it critically.
          </p>
          <p className="text-muted-foreground text-sm leading-6">
            AI may use efficient but less common algorithms and techniques. Practicing
            programming problems exposes us to those patterns so we can recognize and
            understand them when reviewing AI-generated code.
          </p>
          <p className="text-muted-foreground text-sm leading-6">
            Even if AI eventually produces most of our code, I would trust someone who
            understands how to code to prompt and guide an LLM far more than someone
            unfamiliar with how the output actually works.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-foreground/75">Code Execution</h2>
          <p className="text-muted-foreground text-sm leading-6">
            Flow Into Code supports basic code execution. The platform does not
            automatically grade solutions against hidden test cases, so it&apos;s up to you
            to write your own tests in the editor. That mirrors whiteboarding interviews,
            online assessments with minimal tests, and real development work.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-foreground/75">Free. Forever.</h2>
          <p className="text-muted-foreground text-sm leading-6">
            I don&apos;t plan to charge for this app. Each user gets five daily practice
            sessions, limited by my monthly LLM and hosting credits. I&apos;ll adjust those
            limits based on what I can sustainably support.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-foreground/75">Open Source</h2>
          <p className="text-muted-foreground text-sm leading-6">
            This app is open source and available on{" "}
            <a
              href="https://github.com/davkluo/flow-into-code"
              target="_blank"
              rel="noreferrer"
              className="text-foreground underline underline-offset-2"
            >
              GitHub
            </a>
            . If you&apos;d like to host it yourself to bypass daily limits or make your own
            changes, you absolutely can.
          </p>
        </section>

      </div>
    </div>
  );
}
