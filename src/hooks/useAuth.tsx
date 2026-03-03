"use client";

import {
  AuthProvider as FirebaseAuthProvider,
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { toast } from "sonner";
import { createContext, useContext, useEffect, useState } from "react";
import { USER_INIT_API_PATH } from "@/constants/api";
import { authFetch } from "@/lib/firebase/authFetch";
import {
  getClientAuth,
  githubProvider,
  googleProvider,
} from "@/lib/firebase/client";

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
    const unsubscribe = onAuthStateChanged(getClientAuth(), (firebaseUser) => {
      setUser(firebaseUser);
      setStatus(firebaseUser ? "authenticated" : "unauthenticated");
    });
    return unsubscribe;
  }, []);

  const signInWithProvider = async (provider: FirebaseAuthProvider) => {
    setStatus("loading");

    let credential;
    try {
      credential = await signInWithPopup(getClientAuth(), provider);
    } catch (error: unknown) {
      const code =
        typeof error === "object" && error !== null && "code" in error
          ? String(error.code)
          : null;

      if (
        code === "auth/account-exists-with-different-credential"
      ) {
        toast.error("Account already exists", {
          description:
            "An account already exists with this email. Please sign in with the provider you used originally.",
        });
      } else if (code === "auth/too-many-requests") {
        toast.error("Too many sign-in attempts", {
          description: "Please try again later.",
        });
      } else if (code === "auth/popup-closed-by-user") {
        // User intentionally dismissed the popup; fail silently.
      } else {
        toast.error("Sign-in failed", {
          description: "Please try again.",
        });
        console.error("Sign-in error:", error);
      }

      setStatus("unauthenticated");
      return;
    }

    try {
      const token = await credential.user.getIdToken();
      const res = await authFetch(USER_INIT_API_PATH, { method: "POST" }, token);

      if (!res.ok) {
        await signOut(getClientAuth());
        setStatus("unauthenticated");
        toast.error("Sign-in failed", {
          description: "Unable to initialize your account. Please try again.",
        });
        return;
      } else {
        toast.success("Signed in successfully", {
          description: "Welcome back!",
        });
      }
    } catch (error: unknown) {
      await signOut(getClientAuth());
      setStatus("unauthenticated");
      toast.error("Sign-in failed", {
        description: "Please try again.",
      });
      console.error("Sign-in error:", error);
    }
  };

  const signInWithGoogle = () => signInWithProvider(googleProvider);
  const signInWithGitHub = () => signInWithProvider(githubProvider);

  const signOutUser = async () => {
    await signOut(getClientAuth());
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
