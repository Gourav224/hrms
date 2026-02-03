"use client";

import { useMemo, useState } from "react";

import { CalendarRange } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useAttendanceStats } from "@/hooks/use-attendance";
import { getErrorMessage } from "@/lib/api/handlers";

const chartConfig = {
  present: {
    label: "Present",
    theme: {
      light: "oklch(0.398 0.07 151.71)",
      dark: "oklch(0.627 0.194 149.21)",
    },
  },
  absent: {
    label: "Absent",
    theme: {
      light: "oklch(0.553 0.17 28.53)",
      dark: "oklch(0.577 0.245 27.32)",
    },
  },
  unmarked: {
    label: "Unmarked",
    theme: {
      light: "oklch(0.852 0.03 85.02)",
      dark: "oklch(0.3 0 0)",
    },
  },
} satisfies ChartConfig;

const formatDateInput = (value: Date) => value.toLocaleDateString("en-CA");

const formatLabel = (value: string) => {
  const parsed = new Date(`${value}T00:00:00`);
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default function AttendancePage() {
  const initialRange = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      from: formatDateInput(start),
      to: formatDateInput(now),
    };
  }, []);

  const [dateFrom, setDateFrom] = useState(initialRange.from);
  const [dateTo, setDateTo] = useState(initialRange.to);

  const stats = useAttendanceStats({
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  });

  const rangeError = useMemo(() => {
    if (!dateFrom || !dateTo) return null;
    const start = new Date(dateFrom);
    const end = new Date(dateTo);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 60) {
      return "Selected interval exceeds 60-day threshold.";
    }
    return null;
  }, [dateFrom, dateTo]);

  const points = rangeError ? [] : stats.points;
  const totalEmployees = stats.meta?.total_employees ?? 0;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-1.5 px-1">
        <h1 className="text-foreground/90 text-2xl font-bold tracking-tight">
          Attendance Intelligence
        </h1>
        <p className="text-muted-foreground text-sm font-medium">
          Analyzing organizational presence and coverage trends.
        </p>
      </div>

      <Card className="overflow-hidden rounded-2xl border-none shadow-xs">
        <CardHeader className="bg-muted/20 border-b px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/5 rounded-xl p-2.5">
                <CalendarRange className="text-primary/80 h-5 w-5" />
              </div>
              <CardTitle className="text-foreground/80 text-lg font-bold tracking-tight">
                Trend Analysis
              </CardTitle>
            </div>
            <div className="bg-foreground/5 text-foreground/70 border-foreground/5 rounded-lg border px-3 py-1.5 text-[11px] font-bold tracking-widest uppercase">
              {totalEmployees} Active Personnel
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:max-w-2xl">
            <div className="space-y-2">
              <p className="text-muted-foreground ml-1 text-[10px] font-bold tracking-widest uppercase">
                Interval From
              </p>
              <input
                type="date"
                className="bg-muted/30 border-muted-foreground/10 focus:ring-primary/10 focus:bg-background h-11 w-full rounded-xl border px-4 text-sm font-medium transition-all focus:ring-4 focus:outline-none"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground ml-1 text-[10px] font-bold tracking-widest uppercase">
                Interval To
              </p>
              <input
                type="date"
                className="bg-muted/30 border-muted-foreground/10 focus:ring-primary/10 focus:bg-background h-11 w-full rounded-xl border px-4 text-sm font-medium transition-all focus:ring-4 focus:outline-none"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
              />
            </div>
          </div>

          {rangeError ? (
            <div className="text-muted-foreground bg-muted/20 rounded-2xl border border-dashed p-6 text-center text-sm font-medium">
              {rangeError}
            </div>
          ) : stats.error ? (
            <div className="text-destructive bg-destructive/5 border-destructive/10 rounded-2xl border p-6 text-center text-sm font-bold font-medium">
              {getErrorMessage(stats.error)}
            </div>
          ) : null}

          {!rangeError && (
            <div className="bg-muted/5 relative rounded-2xl border border-dashed p-8">
              {stats.isLoading ? (
                <div className="text-muted-foreground flex min-h-[400px] flex-col items-center justify-center gap-4 text-sm font-medium">
                  <div className="border-primary/20 border-t-primary h-8 w-8 animate-spin rounded-full border-2" />
                  Synchronizing records...
                </div>
              ) : points.length === 0 ? (
                <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
                  <p className="text-muted-foreground text-sm font-medium">
                    No activity found for this interval.
                  </p>
                </div>
              ) : (
                <ChartContainer config={chartConfig} className="mt-4 min-h-[400px] w-full">
                  <BarChart accessibilityLayer data={points}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="oklch(0.9 0 0)" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      tickMargin={12}
                      axisLine={false}
                      className="font-mono text-[10px] font-bold tracking-tight"
                      tickFormatter={(value) => formatLabel(value)}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent className="rounded-2xl border-none p-4 shadow-2xl" />
                      }
                    />
                    <ChartLegend content={<ChartLegendContent className="mt-8 gap-6" />} />
                    <Bar
                      dataKey="present"
                      fill="oklch(0.398 0.07 151.71)"
                      radius={[4, 4, 0, 0]}
                      stackId="a"
                      opacity={0.9}
                    />
                    <Bar
                      dataKey="absent"
                      fill="oklch(0.553 0.17 28.53)"
                      radius={[0, 0, 0, 0]}
                      stackId="a"
                      opacity={0.9}
                    />
                    <Bar
                      dataKey="unmarked"
                      fill="oklch(0.852 0.03 85.02)"
                      radius={[0, 0, 0, 0]}
                      stackId="a"
                      opacity={0.5}
                    />
                  </BarChart>
                </ChartContainer>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
