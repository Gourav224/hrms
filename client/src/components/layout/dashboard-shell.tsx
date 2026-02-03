"use client";

import type { ReactNode } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

type DashboardShellProps = {
  children: ReactNode;
};

export const DashboardShell = ({ children }: DashboardShellProps) => {
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset>
        <header className="bg-background/80 sticky top-0 z-10 border-b px-4 py-4 backdrop-blur md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">
                  HRMS Lite
                </p>
                <p className="text-lg font-semibold">Dashboard</p>
              </div>
            </div>
          </div>
        </header>
        <main className="bg-muted/30 px-4 py-6 md:px-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
};
