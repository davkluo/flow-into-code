"use client";

import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { GitHubLogo } from "@/components/shared/GitHubLogo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";

export default function SignInPage() {
  const router = useRouter();
  const { status, signInWithGoogle, signInWithGitHub } = useAuth();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [router, status]);

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm -translate-y-24">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
        </CardHeader>

        <CardContent>
          <CardDescription>
            Unlock full access to Flow Into Code&apos;s features by signing in
            with one of the following OAuth providers.
          </CardDescription>
          <Separator className="mt-4" />
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={signInWithGoogle}
            disabled={status === "loading"}
          >
            <span className="flex items-center justify-center gap-2">
              {status === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Image
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="h-4 w-4"
                  width={16}
                  height={16}
                />
              )}
              Sign in with Google
            </span>
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={signInWithGitHub}
            disabled={status === "loading"}
          >
            <span className="flex items-center justify-center gap-2">
              {status === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <GitHubLogo className="h-4 w-4" />
              )}
              Sign in with GitHub
            </span>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
