"use client";

import { signInWithPopup } from "firebase/auth";
import { Loader2 } from "lucide-react";
import { useState } from "react";
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
import { auth, googleProvider } from "@/lib/firebase";

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleGoogleLogin() {
    try {
      setIsLoading(true);
      await signInWithPopup(auth, googleProvider);
      router.push("/");
    } catch (error) {
      console.error("Google sign-in error:", error);
      setIsLoading(false);
    }
  }

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
        </CardContent>

        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Image
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="mr-2 h-4 w-4"
                width={0}
                height={0}
              />
            )}
            Sign in with Google
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
