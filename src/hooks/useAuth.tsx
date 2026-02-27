"use client";

import {
  AuthProvider as FirebaseAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import { toast } from "sonner";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, githubProvider, googleProvider } from "@/lib/firebase/client";
import { authFetch } from "@/lib/firebase/authFetch";
import { USER_INIT_API_PATH } from "@/constants/api";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: FirebaseUser | null;
  status: AuthStatus;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setStatus(firebaseUser ? "authenticated" : "unauthenticated");
    });
    return unsubscribe;
  }, []);

  const signInWithProvider = async (provider: FirebaseAuthProvider) => {
    setStatus("loading");
    try {
      const credential = await signInWithPopup(auth, provider);
      const token = await credential.user.getIdToken();
      await authFetch(USER_INIT_API_PATH, { method: "POST" }, token);
      toast.success("Signed in successfully", {
        description: "Welcome back!",
      });
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "auth/account-exists-with-different-credential"
      ) {
        toast.error("Account already exists", {
          description:
            "An account already exists with this email. Please sign in with the provider you used originally.",
        });
      } else {
        console.error("Sign-in error:", error);
      }
      setStatus("unauthenticated");
    }
  };

  const signInWithGoogle = () => signInWithProvider(googleProvider);
  const signInWithGitHub = () => signInWithProvider(githubProvider);

  const signOutUser = async () => {
    await signOut(auth);
    toast.success("Signed out successfully", {
      description: "See you again soon!",
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, status, signInWithGoogle, signInWithGitHub, signOutUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
