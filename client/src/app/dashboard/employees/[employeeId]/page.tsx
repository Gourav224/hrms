"use client";

import { use, useMemo, useState } from "react";

import Link from "next/link";

import { ArrowLeft, CalendarCheck2 } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useSWRConfig } from "swr";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAttendance,
  useAttendanceMutations,
  useAttendanceSummary,
} from "@/hooks/use-attendance";
import { useEmployee } from "@/hooks/use-employees";
import { getErrorMessage } from "@/lib/api/handlers";
import { cn } from "@/lib/utils";
import type { PaginationMeta } from "@/types";

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toMonthKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const monthRange = (monthKey: string) => {
  const [y, m] = monthKey.split("-").map((v) => Number(v));
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0);
  const toIso = (d: Date) => d.toISOString().slice(0, 10);
  return { date_from: toIso(start), date_to: toIso(end) };
};

export default function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ employeeId: number }>;
}) {
  const { employeeId } = use(params);
  const { mutate: mutateGlobal } = useSWRConfig();

  const [month, setMonth] = useQueryState("month", {
    defaultValue: toMonthKey(new Date()),
    parse: parseAsString.parse,
    serialize: parseAsString.serialize,
  });
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

  const limit = 20;
  const offset = useMemo(() => Math.max(0, (page - 1) * limit), [page]);
  const range = useMemo(() => monthRange(month), [month]);
  const today = useMemo(() => formatDate(new Date()), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [attendanceActionError, setAttendanceActionError] = useState<string | null>(null);

  const { employee } = useEmployee(employeeId);

  const attendance = useAttendance(employeeId ?? undefined, {
    ...range,
    limit,
    offset,
  });

  const summary = useAttendanceSummary(employeeId ?? undefined, range);

  const selectedAttendance = useAttendance(employeeId ?? undefined, {
    date_from: selectedDate,
    date_to: selectedDate,
    limit: 1,
    offset: 0,
  });

  const selectedRecord = selectedAttendance.records[0] ?? null;
  const { createAttendance, updateAttendance } = useAttendanceMutations(employeeId ?? 0);

  const [selectedStatus, setSelectedStatus] = useState<"Present" | "Absent">(
    selectedRecord?.status ?? "Present",
  );

  if (!employeeId) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Invalid employee</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            The employee identifier is not valid.
          </CardContent>
        </Card>
      </div>
    );
  }

  const records = attendance.records;
  const meta = (attendance.meta ?? null) as PaginationMeta | null;
  const total = meta?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / limit));
  const hasPrev = page > 1;
  const hasNext = page < pageCount;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex items-center justify-between gap-3 px-1">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="hover:bg-muted/50 h-9 rounded-lg px-3 text-xs font-bold transition-all"
        >
          <Link href="/dashboard/employees">
            <ArrowLeft className="mr-2 h-4 w-4 opacity-60" />
            Back to Directory
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <input
            type="month"
            value={month}
            onChange={(event) => {
              setMonth(event.target.value);
              setPage(1);
            }}
            className="border-input bg-background focus:ring-primary/10 h-9 rounded-lg border px-3 text-sm font-medium transition-all focus:ring-4 focus:outline-none"
          />
        </div>
      </div>

      <Card className="overflow-hidden rounded-2xl border-none shadow-xs">
        <CardHeader className="bg-muted/20 border-b px-8 py-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1.5">
              <CardTitle className="text-foreground/90 flex items-center gap-3 text-2xl font-bold tracking-tight">
                <div className="bg-primary/5 rounded-xl p-2.5">
                  <CalendarCheck2 className="text-primary/70 h-6 w-6" />
                </div>
                {employee?.full_name ?? "Personnel Profile"}
              </CardTitle>
              <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 text-sm font-medium">
                <span className="bg-foreground/5 text-foreground/70 border-foreground/5 rounded-lg border px-2 py-0.5 font-bold tracking-tight">
                  {employee?.employee_id ?? "—"}
                </span>
                <span className="opacity-80">{employee?.email ?? "—"}</span>
                <span className="text-foreground/20">•</span>
                <span className="font-semibold italic opacity-60">
                  {employee?.department ?? "—"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 self-end lg:self-auto">
              <div className="bg-background group hover:bg-muted/10 relative flex min-w-[80px] flex-col items-center overflow-hidden rounded-xl border px-4 py-2.5 shadow-xs transition-all">
                <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                  Total
                </p>
                <p className="mt-0.5 text-xl font-bold tracking-tight">
                  {summary.isLoading ? "—" : (summary.summary?.total_records ?? "0")}
                </p>
              </div>
              <div className="flex min-w-[80px] flex-col items-center rounded-xl border border-emerald-500/10 bg-emerald-500/5 px-4 py-2.5 text-center transition-all hover:bg-emerald-500/10">
                <p className="text-[10px] font-bold tracking-widest text-emerald-700/70 uppercase">
                  Present
                </p>
                <p className="mt-0.5 text-xl font-bold tracking-tight text-emerald-600">
                  {summary.isLoading ? "—" : (summary.summary?.total_present ?? "0")}
                </p>
              </div>
              <div className="flex min-w-[80px] flex-col items-center rounded-xl border border-rose-500/10 bg-rose-500/5 px-4 py-2.5 text-center transition-all hover:bg-rose-500/10">
                <p className="text-[10px] font-bold tracking-widest text-rose-700/70 uppercase">
                  Absent
                </p>
                <p className="mt-0.5 text-xl font-bold tracking-tight text-rose-600">
                  {summary.isLoading ? "—" : (summary.summary?.total_absent ?? "0")}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          <div className="bg-muted/10 mb-8 rounded-2xl border border-dashed p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="grid max-w-2xl flex-1 grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-muted-foreground ml-1 text-[10px] font-bold tracking-widest uppercase">
                    Observation Date
                  </p>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(event) => {
                      const value = event.target.value;
                      if (!value) return;
                      setSelectedDate(value);
                      const nextMonth = value.slice(0, 7);
                      if (nextMonth && nextMonth !== month) {
                        setMonth(nextMonth);
                        setPage(1);
                      }
                    }}
                    className="bg-background border-muted-foreground/10 focus:ring-primary/10 h-11 w-full rounded-xl border px-4 text-sm font-medium transition-all focus:ring-4 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-muted-foreground ml-1 text-[10px] font-bold tracking-widest uppercase">
                    Status Classification
                  </p>
                  <NativeSelect
                    className="bg-background border-muted-foreground/10 focus:ring-primary/10 h-11 rounded-xl border text-sm font-medium transition-all focus:ring-4 focus:outline-none"
                    value={selectedStatus}
                    onChange={(event) =>
                      setSelectedStatus(event.target.value as "Present" | "Absent")
                    }
                  >
                    <NativeSelectOption value="Present">Present</NativeSelectOption>
                    <NativeSelectOption value="Absent">Absent</NativeSelectOption>
                  </NativeSelect>
                </div>
              </div>

              <div className="flex min-w-[160px] flex-col gap-2">
                <Button
                  className="bg-foreground text-background hover:bg-foreground/90 shadow-foreground/5 h-11 rounded-xl text-sm font-bold shadow-lg transition-all hover:scale-[1.01] active:scale-95"
                  onClick={async () => {
                    setAttendanceActionError(null);
                    try {
                      if (selectedRecord) {
                        await updateAttendance.trigger({
                          attendanceId: selectedRecord.id,
                          payload: { status: selectedStatus },
                        });
                      } else {
                        await createAttendance.trigger({
                          date: selectedDate,
                          status: selectedStatus,
                        });
                      }
                      mutateGlobal("/stats/overview");
                    } catch (err) {
                      setAttendanceActionError(getErrorMessage(err));
                    }
                  }}
                  disabled={
                    updateAttendance.isMutating ||
                    createAttendance.isMutating ||
                    selectedAttendance.isLoading
                  }
                >
                  {updateAttendance.isMutating || createAttendance.isMutating ? (
                    <Spinner className="mr-2 size-4" />
                  ) : null}
                  {selectedRecord ? "Commit Update" : "Log Observation"}
                </Button>
              </div>
            </div>

            {attendanceActionError ? (
              <p className="text-destructive bg-destructive/5 border-destructive/10 mt-4 rounded-xl border p-3 text-xs leading-tight font-bold">
                {attendanceActionError}
              </p>
            ) : null}
          </div>

          {!attendance.isLoading && !attendance.error ? (
            <div className="bg-muted/5 overflow-hidden rounded-2xl border shadow-xs">
              <div className="bg-muted/20 border-b px-6 py-4">
                <h3 className="text-foreground/60 text-sm text-[10px] font-bold tracking-tight tracking-widest uppercase">
                  Historical Records
                </h3>
              </div>
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="text-muted-foreground/60 h-11 px-6 py-0 text-[10px] font-bold tracking-widest uppercase">
                      Date
                    </TableHead>
                    <TableHead className="text-muted-foreground/60 h-11 px-6 py-0 text-[10px] font-bold tracking-widest uppercase">
                      Status
                    </TableHead>
                    <TableHead className="text-muted-foreground/60 h-11 px-6 py-0 text-right text-[10px] font-bold tracking-widest uppercase">
                      Reference
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-muted-foreground h-32 text-center text-sm font-medium"
                      >
                        No historical data found for the selected interval.
                      </TableCell>
                    </TableRow>
                  ) : (
                    records.map((row) => (
                      <TableRow
                        key={row.id}
                        className="group hover:bg-muted/40 border-muted/20 h-14 transition-colors"
                      >
                        <TableCell className="text-foreground px-6 font-mono text-sm font-bold">
                          {new Date(row.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="px-6">
                          {row.status === "Present" ? (
                            <span className="inline-flex items-center rounded-full border border-emerald-500/10 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold tracking-widest text-emerald-600 uppercase shadow-xs">
                              Present
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full border border-rose-500/10 bg-rose-500/10 px-3 py-1 text-[10px] font-bold tracking-widest text-rose-600 uppercase shadow-xs">
                              Absent
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground px-6 text-right font-mono text-[10px] font-bold opacity-10 transition-opacity group-hover:opacity-60">
                          REC-{row.id.toString().padStart(6, "0")}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          ) : null}

          <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
              Displaying {records.length} of {total} records
            </p>
            <Pagination>
              <PaginationContent className="gap-2">
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    size="default"
                    onClick={(event) => {
                      event.preventDefault();
                      if (hasPrev) setPage(page - 1);
                    }}
                    aria-disabled={!hasPrev}
                    className={cn(
                      "border-muted-foreground/10 hover:bg-muted/50 h-9 rounded-lg px-4 text-xs font-bold transition-all",
                      !hasPrev && "pointer-events-none opacity-30",
                    )}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    size="default"
                    onClick={(event) => {
                      event.preventDefault();
                      if (hasNext) setPage(page + 1);
                    }}
                    aria-disabled={!hasNext}
                    className={cn(
                      "border-muted-foreground/10 hover:bg-muted/50 h-9 rounded-lg px-4 text-xs font-bold transition-all",
                      !hasNext && "pointer-events-none opacity-30",
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
