"use client";

import Link from "next/link";

import { CalendarCheck2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AttendancePage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck2 className="h-5 w-5" />
            Attendance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground text-sm">
            For now, mark today’s attendance from the Employees page. A full attendance browser is
            coming next.
          </p>
          <Button asChild>
            <Link href="/dashboard/employees">Go to employees</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
