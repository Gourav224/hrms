"use client";

import Link from "next/link";

import { ArrowRight, BriefcaseBusiness, CalendarCheck2, ClipboardList } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOverviewStats } from "@/hooks/use-stats";

export default function DashboardPage() {
  const { stats } = useOverviewStats();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">Employees</CardTitle>
            <BriefcaseBusiness className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{stats?.total_employees ?? "—"}</div>
            <p className="text-muted-foreground text-xs">Total active employees</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">Present</CardTitle>
            <CalendarCheck2 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{stats?.present ?? "—"}</div>
            <p className="text-muted-foreground text-xs">Marked present today</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">Absent</CardTitle>
            <ClipboardList className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{stats?.absent ?? "—"}</div>
            <p className="text-muted-foreground text-xs">Marked absent today</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">Unmarked</CardTitle>
            <ClipboardList className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{stats?.unmarked ?? "—"}</div>
            <p className="text-muted-foreground text-xs">No attendance record today</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid w-full gap-4 md:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BriefcaseBusiness className="h-5 w-5" />
              Employee Registry
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground text-sm">
              Add and manage employee records with unique IDs and validated emails.
            </p>
            <Button asChild className="w-full justify-between">
              <Link href="/dashboard/employees">
                Go to employees <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck2 className="h-5 w-5" />
              Attendance Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground text-sm">
              Mark attendance daily and review records filtered by date range.
            </p>
            <Button asChild variant="secondary" className="w-full justify-between">
              <Link href="/dashboard/attendance">
                Go to attendance <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
