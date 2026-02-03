"use client";

import type { ReactNode } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BriefcaseBusiness, CalendarCheck2, LayoutDashboard, LogOut, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

type DashboardShellProps = {
  children: ReactNode;
};

export const DashboardShell = ({ children }: DashboardShellProps) => {
  const { user, clearAuth } = useAuthStore();
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/employees", label: "Employees", icon: BriefcaseBusiness },
    { href: "/dashboard/attendance", label: "Attendance", icon: CalendarCheck2 },
  ];

  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader className="gap-2">
          <Link href="/dashboard" className="group flex items-center gap-2 rounded-md p-2">
            <span
              className={cn(
                "grid h-9 w-9 place-items-center rounded-xl",
                "bg-sidebar-primary text-sidebar-primary-foreground",
              )}
            >
              HR
            </span>
            <div className="leading-tight">
              <p className="text-sidebar-foreground text-sm font-semibold">HRMS Lite</p>
              <p className="text-sidebar-foreground/60 text-xs">Admin console</p>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <Icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="gap-2">
          <div className="border-sidebar-border bg-sidebar-accent rounded-xl border p-3">
            <p className="text-sidebar-foreground/60 text-xs font-semibold tracking-[0.2em] uppercase">
              Signed in
            </p>
            <p className="text-sidebar-foreground mt-2 text-sm font-semibold">
              {user?.name ?? user?.email ?? "Admin"}
            </p>
            <p className="text-sidebar-foreground/60 mt-0.5 text-xs">{user?.role ?? "admin"}</p>
          </div>
          <Button variant="secondary" className="w-full justify-center" onClick={() => clearAuth()}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="bg-background/80 sticky top-0 z-10 border-b px-4 py-4 backdrop-blur md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div>
                <p className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">
                  HRMS Lite
                </p>
                <p className="text-lg font-semibold">Dashboard</p>
              </div>
            </div>
            <div className="bg-card text-muted-foreground hidden items-center gap-2 rounded-xl border px-3 py-2 text-sm md:flex">
              <Search className="h-4 w-4" />
              <span>Use the search boxes on each page</span>
            </div>
          </div>
        </header>
        <main className="bg-muted/30 flex-1 px-4 py-6 md:px-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
};
