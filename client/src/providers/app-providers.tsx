"use client";

import type { ReactNode } from "react";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { SWRConfig } from "swr";

import { Toaster } from "@/components/ui/sonner";
import { swrConfig } from "@/lib/api/swr";
import { AuthProvider } from "@/providers/auth-provider";

type AppProvidersProps = {
  children: ReactNode;
};

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <>
      <NuqsAdapter>
        <SWRConfig value={swrConfig}>
          <AuthProvider>{children}</AuthProvider>
        </SWRConfig>
      </NuqsAdapter>
      <Toaster richColors closeButton />
    </>
  );
};
