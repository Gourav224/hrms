"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BriefcaseBusiness, CalendarCheck2, LayoutDashboard, LogOut, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export const AppSidebar = () => {
  const { user, clearAuth } = useAuthStore();
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/employees", label: "Employees", icon: BriefcaseBusiness },
    { href: "/dashboard/attendance", label: "Attendance", icon: CalendarCheck2 },
  ];
  const adminItems = [{ href: "/dashboard/admins", label: "Admins", icon: Users }] as const;

  return (
    <Sidebar>
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
            {user?.role === "admin"
              ? adminItems.map((item) => {
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
                })
              : null}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="bg-sidebar-accent/40 border-sidebar-border/50 group/footer hover:bg-sidebar-accent/60 relative overflow-hidden rounded-2xl border p-4 transition-all duration-300">
          <div className="relative z-10 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <p className="text-sidebar-foreground/40 text-[10px] font-bold tracking-[0.15em] uppercase">
                Connected
              </p>
            </div>
            <p className="text-sidebar-foreground truncate text-sm font-bold tracking-tight">
              {user?.name ?? user?.email ?? "Admin"}
            </p>
            <div className="flex items-center justify-between">
              <p className="text-sidebar-foreground/60 text-xs font-medium italic">
                {user?.role ?? "Administrator"}
              </p>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-[0.03] transition-transform duration-500 group-hover/footer:scale-110">
            <Users className="h-20 w-20" />
          </div>
        </div>
        <Button
          variant="ghost"
          className="text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 w-full justify-start gap-3 px-4 py-6 font-medium transition-all"
          onClick={() => clearAuth()}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};
