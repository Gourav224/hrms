"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { usePathname, useRouter } from "next/navigation";

import { getErrorMessage } from "@/lib/api/handlers";
import { refreshSession } from "@/lib/api/mutations";
import { useAuthStore } from "@/stores/auth-store";

type AuthProviderProps = {
  children: ReactNode;
};

const AUTH_PATH = "/auth";

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { token, setToken, setUser, clearAuth, sessionChecked, markSessionChecked } =
    useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      markSessionChecked();
      if (pathname !== AUTH_PATH) {
        router.replace(AUTH_PATH);
      }
      return;
    }

    if (sessionChecked) {
      if (pathname === AUTH_PATH) {
        router.replace("/dashboard");
      }
      return;
    }

    const syncSession = async () => {
      try {
        const session = await refreshSession();
        setUser(session.user);
        setToken(session.token.access_token);
        setError(null);
        if (pathname === AUTH_PATH) {
          router.replace("/dashboard");
        }
      } catch (err) {
        setError(getErrorMessage(err));
        clearAuth();
        if (pathname !== AUTH_PATH) {
          router.replace(AUTH_PATH);
        }
      } finally {
        markSessionChecked();
      }
    };

    syncSession();
  }, [token, pathname, router, setToken, setUser, clearAuth, sessionChecked, markSessionChecked]);

  if (!sessionChecked && pathname !== AUTH_PATH) {
    return (
      <div className="text-muted-foreground flex min-h-screen items-center justify-center text-sm">
        Checking session...
      </div>
    );
  }

  if (error && pathname !== AUTH_PATH) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 text-center">
        <p className="text-destructive text-sm">{error}</p>
        <p className="text-muted-foreground text-xs">Redirecting to login…</p>
      </div>
    );
  }

  return <>{children}</>;
};
