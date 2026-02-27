import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <p className="text-muted-foreground text-sm tracking-[0.2em] uppercase">
          404
        </p>
        <h1 className="text-3xl font-semibold">Page not found</h1>
        <p className="text-muted-foreground text-sm">
          The page you were looking for does not exist or was moved.
        </p>
        <div className="mt-2 flex items-center gap-2">
          <Button asChild size="sm">
            <Link href="/">Go Home</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/practice">Go to Practice</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
