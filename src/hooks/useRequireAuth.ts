"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

/**
 * Redirects unauthenticated users to /signin.
 * Call this at the top of any page that requires authentication.
 * Returns the current auth status so callers can defer rendering while loading.
 */
export function useRequireAuth() {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  return status;
}
