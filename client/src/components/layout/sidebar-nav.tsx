"use client";

import type { ComponentType } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BriefcaseBusiness, CalendarCheck2, LayoutDashboard } from "lucide-react";

import { cn } from "@/lib/utils";

type SidebarNavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const NAV_ITEMS: SidebarNavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/employees", label: "Employees", icon: BriefcaseBusiness },
  { href: "/dashboard/attendance", label: "Attendance", icon: CalendarCheck2 },
];

export const SidebarNav = () => {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
              "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
