"use client";

import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  const { status, signInWithGoogle } = useAuth();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [router, status]);

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
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

        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            onClick={signInWithGoogle}
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Image
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="mr-2 h-4 w-4"
                width={16}
                height={16}
              />
            )}
            Sign in with Google
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
