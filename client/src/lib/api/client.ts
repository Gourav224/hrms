import axios from "axios";

import { env } from "@/env";
import { getAuthToken } from "@/stores/auth-store";

export const api = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  return config;
});
