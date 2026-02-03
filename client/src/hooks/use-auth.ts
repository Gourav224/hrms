"use client";

import useSWRMutation from "swr/mutation";

import { loginRequest, refreshSession } from "@/lib/api/mutations";
import { useAuthStore } from "@/stores/auth-store";

type LoginArgs = {
  email: string;
  password: string;
};

export const useAuth = () => {
  const { token, setToken, setUser, clearAuth } = useAuthStore();

  const login = useSWRMutation(
    "/auth/login",
    async (_key, { arg }: { arg: LoginArgs }) => loginRequest(arg.email, arg.password),
    {
      onSuccess: (data) => setToken(data.access_token),
    },
  );

  const logout = () => clearAuth();

  const session = useSWRMutation("/auth/session", async () => refreshSession(), {
    onSuccess: (data) => {
      setUser(data.user);
      setToken(data.token.access_token);
    },
    onError: () => clearAuth(),
  });

  return { token, login, logout, session };
};
