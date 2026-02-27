"use client";

import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { DAILY_SESSION_LIMIT } from "@/constants/practice";
import { USERS_COLLECTION } from "@/constants/firestore";
import { db } from "@/lib/firebase/client";
import { User } from "@/types/user";
import { useAuth } from "./useAuth";

export function useSessionsRemaining(): {
  remaining: number | null;
  isLoading: boolean;
} {
  const { user, status } = useAuth();
  const [remaining, setRemaining] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (status !== "authenticated" || !user) {
      setIsLoading(false);
      return;
    }

    const ref = doc(db, USERS_COLLECTION, user.uid);
    const unsubscribe = onSnapshot(ref, (snapshot) => {
      if (!snapshot.exists()) {
        setIsLoading(false);
        return;
      }

      const data = snapshot.data() as User;

      if (data.role !== "user") {
        setRemaining(null);
        setIsLoading(false);
        return;
      }

      const today = new Date().toISOString().slice(0, 10);
      const existing = data.dailySessions;
      const usedToday = !existing || existing.date !== today ? 0 : existing.count;
      setRemaining(Math.max(0, DAILY_SESSION_LIMIT - usedToday));
      setIsLoading(false);
    });

    return unsubscribe;
  }, [user, status]);

  return { remaining, isLoading };
}
