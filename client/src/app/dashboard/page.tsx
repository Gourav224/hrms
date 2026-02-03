"use client";

import Link from "next/link";

import { ArrowRight, BriefcaseBusiness, CalendarCheck2, ClipboardList } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useOverviewStats } from "@/hooks/use-stats";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { stats, isLoading } = useOverviewStats();

  if (isLoading) {
    return (
      <div>
        <Spinner className="size-4" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-foreground/90 text-2xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground text-sm font-medium">
          Monitoring personnel activity and organizational status.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Total Employees",
            value: stats?.total_employees,
            label: "Active workforce",
            icon: BriefcaseBusiness,
            color: "primary",
          },
          {
            title: "Present",
            value: stats?.present,
            label: "Marked present today",
            icon: CalendarCheck2,
            color: "emerald",
          },
          {
            title: "Absent",
            value: stats?.absent,
            label: "Marked absent today",
            icon: ClipboardList,
            color: "rose",
          },
          {
            title: "Unmarked",
            value: stats?.unmarked,
            label: "Pending attendance",
            icon: ClipboardList,
            color: "amber",
          },
        ].map((item, idx) => (
          <Card
            key={idx}
            className="group relative overflow-hidden rounded-2xl border-none shadow-xs transition-all duration-300 hover:shadow-md"
          >
            <div
              className={`absolute inset-0 bg-${item.color}-500/5 opacity-0 transition-opacity group-hover:opacity-100`}
            />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pt-6 pb-1.5">
              <CardTitle className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                {item.title}
              </CardTitle>
              <div
                className={cn(
                  "rounded-xl p-2 transition-all duration-300 group-hover:scale-110",
                  item.color === "primary"
                    ? "bg-primary/5 text-primary"
                    : `bg-${item.color}-500/10 text-${item.color}-600`,
                )}
              >
                <item.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="pb-6">
              <div
                className={cn(
                  "text-3xl font-bold tracking-tighter",
                  item.color === "primary" ? "text-foreground" : `text-${item.color}-600`,
                )}
              >
                {item.value ?? "—"}
              </div>
              <p className="text-muted-foreground mt-0.5 text-[11px] font-medium">{item.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid w-full gap-4 md:grid-cols-2">
        <Card className="group overflow-hidden rounded-2xl border-none shadow-xs transition-all duration-300 hover:shadow-md">
          <CardHeader className="bg-muted/30 border-b px-6 py-5">
            <CardTitle className="text-foreground/80 flex items-center gap-2.5 text-base font-bold tracking-tight">
              <div className="bg-foreground/5 rounded-lg p-1.5">
                <BriefcaseBusiness className="h-4 w-4" />
              </div>
              Employee Registry
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <p className="text-muted-foreground text-sm leading-relaxed font-medium">
              Consolidated management of personnel files, identification, and department
              assignments.
            </p>
            <Button
              asChild
              variant="outline"
              className="border-muted-foreground/10 hover:bg-muted/50 group-hover:border-primary/20 h-11 w-full justify-between rounded-xl font-bold transition-all"
            >
              <Link href="/dashboard/employees">
                Directory Access{" "}
                <ArrowRight className="h-4 w-4 opacity-40 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="group overflow-hidden rounded-2xl border-none shadow-xs transition-all duration-300 hover:shadow-md">
          <CardHeader className="bg-muted/30 border-b px-6 py-5">
            <CardTitle className="text-foreground/80 flex items-center gap-2.5 text-base font-bold tracking-tight">
              <div className="bg-foreground/5 rounded-lg p-1.5">
                <CalendarCheck2 className="h-4 w-4" />
              </div>
              Attendance Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <p className="text-muted-foreground text-sm leading-relaxed font-medium">
              Analyzing historical presence data, tracking monthly summaries, and ensuring shift
              coverage.
            </p>
            <Button
              asChild
              variant="outline"
              className="border-muted-foreground/10 hover:bg-muted/50 group-hover:border-primary/20 h-11 w-full justify-between rounded-xl font-bold transition-all"
            >
              <Link href="/dashboard/attendance">
                Temporal Analysis{" "}
                <ArrowRight className="h-4 w-4 opacity-40 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
