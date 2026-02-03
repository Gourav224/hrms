"use client";

import { useMemo, useState } from "react";

import Link from "next/link";

import { BriefcaseBusiness, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldContent, FieldError, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
import { useDebouncedSearch } from "@/hooks/use-debounced-search";
import { useEmployeeMutations, useEmployees } from "@/hooks/use-employees";
import { getErrorMessage, getFieldErrors } from "@/lib/api/handlers";
import type { Employee, EmployeeCreate, EmployeeUpdate } from "@/types";

const EmployeeSchema = z.object({
  full_name: z.string().min(1, "Full name is required.").max(120, "Full name is too long."),
  email: z.string().email("Enter a valid email.").max(255, "Email is too long."),
  department: z.string().min(1, "Department is required.").max(120, "Department is too long."),
});

type EmployeeFormValues = z.infer<typeof EmployeeSchema>;

const emptyEmployeeForm: EmployeeFormValues = {
  full_name: "",
  email: "",
  department: "",
};

export default function EmployeesPage() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

  const { searchInput, search, setSearchInput } = useDebouncedSearch({
    initialValue: "",
    delay: 350,
  });
  const limit = 20;
  const offset = useMemo(() => Math.max(0, (page - 1) * limit), [page]);

  const { employees, meta, isLoading, error } = useEmployees({
    q: search,
    limit,
    offset,
  });

  const { createEmployee, updateEmployee, deleteEmployee } = useEmployeeMutations();

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState<Employee | null>(null);

  const [formValues, setFormValues] = useState<EmployeeFormValues>(emptyEmployeeForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const total = meta?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / limit));
  const hasPrev = page > 1;
  const hasNext = page < pageCount;

  const openCreate = () => {
    setSubmitError(null);
    setFormErrors({});
    setFormValues(emptyEmployeeForm);
    setCreateOpen(true);
  };

  const openEdit = (employee: Employee) => {
    setSubmitError(null);
    setFormErrors({});
    setEditing(employee);
    setFormValues({
      full_name: employee.full_name,
      email: employee.email,
      department: employee.department,
    });
    setEditOpen(true);
  };

  const openDelete = (employee: Employee) => {
    setSubmitError(null);
    setDeleting(employee);
    setDeleteOpen(true);
  };

  const validateForm = (values: EmployeeFormValues) => {
    const parsed = EmployeeSchema.safeParse(values);
    if (parsed.success) {
      setFormErrors({});
      return parsed.data;
    }
    const nextErrors: Record<string, string> = {};
    parsed.error.issues.forEach((issue) => {
      const path = issue.path.join(".");
      if (path) {
        nextErrors[path] = issue.message;
      }
    });
    setFormErrors(nextErrors);
    return null;
  };

  const onCreate = async () => {
    setSubmitError(null);
    const payload = validateForm(formValues);
    if (!payload) {
      return;
    }
    try {
      await createEmployee.trigger(payload as EmployeeCreate);
      setCreateOpen(false);
    } catch (err) {
      setSubmitError(getErrorMessage(err));
      setFormErrors((prev) => ({ ...prev, ...getFieldErrors(err) }));
    }
  };

  const onUpdate = async () => {
    if (!editing) {
      return;
    }
    setSubmitError(null);
    const payload = validateForm(formValues);
    if (!payload) {
      return;
    }
    const updatePayload: EmployeeUpdate = {
      full_name: payload.full_name,
      email: payload.email,
      department: payload.department,
    };
    try {
      await updateEmployee.trigger({ employeeId: editing.id, payload: updatePayload });
      setEditOpen(false);
      setEditing(null);
    } catch (err) {
      setSubmitError(getErrorMessage(err));
      setFormErrors((prev) => ({ ...prev, ...getFieldErrors(err) }));
    }
  };

  const onDelete = async () => {
    if (!deleting) {
      return;
    }
    setSubmitError(null);
    try {
      await deleteEmployee.trigger({ employeeId: deleting.id });
      setDeleteOpen(false);
      setDeleting(null);
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <Card className="overflow-hidden rounded-3xl border-none shadow-sm">
        <CardHeader className="bg-muted/30 border-b p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold tracking-tight">
                <div className="bg-primary/10 text-primary rounded-xl p-2.5">
                  <BriefcaseBusiness className="h-6 w-6" />
                </div>
                Employee Registry
              </CardTitle>
              <p className="text-muted-foreground text-sm font-medium">
                Manage your organization&apos;s workforce and attendance trackings.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="bg-background ring-muted-foreground/10 focus-within:ring-primary/20 flex w-full items-center gap-3 rounded-2xl border px-4 py-2.5 shadow-xs transition-all focus-within:ring-4 sm:w-[320px]">
                <Search className="text-muted-foreground group-focus-within:text-primary h-4 w-4 transition-colors" />
                <Input
                  className="h-6 border-0 bg-transparent p-0 text-sm font-medium shadow-none focus-visible:ring-0"
                  value={searchInput}
                  onChange={(event) => {
                    setSearchInput(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by name, email..."
                />
              </div>
              <Button
                className="shadow-primary/20 rounded-2xl px-6 py-6 font-semibold shadow-lg transition-all hover:scale-[1.02] active:scale-95"
                onClick={openCreate}
              >
                <Plus className="h-5 w-5" />
                Add Employee
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <p className="text-muted-foreground text-sm">Loading...</p> : null}
          {error ? <p className="text-destructive text-sm">{getErrorMessage(error)}</p> : null}

          {!isLoading && !error && employees.length === 0 ? (
            <p className="text-muted-foreground text-sm">No employees found.</p>
          ) : null}

          {!isLoading && !error && employees.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border shadow-xs">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-muted-foreground/70 h-12 py-0 text-[10px] font-bold tracking-wider uppercase">
                      ID
                    </TableHead>
                    <TableHead className="text-muted-foreground/70 h-12 py-0 text-[10px] font-bold tracking-wider uppercase">
                      Name
                    </TableHead>
                    <TableHead className="text-muted-foreground/70 h-12 py-0 text-[10px] font-bold tracking-wider uppercase">
                      Email
                    </TableHead>
                    <TableHead className="text-muted-foreground/70 h-12 py-0 text-[10px] font-bold tracking-wider uppercase">
                      Department
                    </TableHead>
                    <TableHead className="text-muted-foreground/70 h-12 py-0 text-right text-[10px] font-bold tracking-wider uppercase">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow
                      key={employee.id}
                      className="group hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="text-muted-foreground/80 font-mono text-xs font-semibold">
                        {employee.employee_id}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/dashboard/employees/${employee.id}`}
                          className="text-foreground decoration-primary/30 font-semibold underline-offset-4 hover:underline"
                        >
                          {employee.full_name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm font-medium">
                        {employee.email}
                      </TableCell>
                      <TableCell>
                        <span className="bg-primary/5 text-primary inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold tracking-wide">
                          {employee.department}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            asChild
                            size="sm"
                            variant="ghost"
                            className="text-primary hover:bg-primary/10 h-8 rounded-lg text-xs font-bold tracking-tight uppercase"
                          >
                            <Link href={`/dashboard/employees/${employee.id}`}>Attendance</Link>
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-muted-foreground hover:text-foreground hover:bg-background h-8 w-8 rounded-lg"
                            onClick={() => openEdit(employee)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8 rounded-lg"
                            onClick={() => openDelete(employee)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : null}

          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-muted-foreground text-xs">
              Showing {employees.length} of {total}
            </p>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      if (hasPrev) {
                        setPage(page - 1);
                      }
                    }}
                    aria-disabled={!hasPrev}
                    className={!hasPrev ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      if (hasNext) {
                        setPage(page + 1);
                      }
                    }}
                    aria-disabled={!hasNext}
                    className={!hasNext ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add employee</DialogTitle>
            <DialogDescription>Create a new employee record.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Field data-invalid={!!formErrors.full_name}>
              <FieldLabel>
                <FieldTitle>Full name</FieldTitle>
              </FieldLabel>
              <FieldContent>
                <Input
                  value={formValues.full_name}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, full_name: event.target.value }))
                  }
                  placeholder="Ava Patel"
                />
                <FieldError>{formErrors.full_name}</FieldError>
              </FieldContent>
            </Field>

            <Field data-invalid={!!formErrors.email}>
              <FieldLabel>
                <FieldTitle>Email</FieldTitle>
              </FieldLabel>
              <FieldContent>
                <Input
                  type="email"
                  value={formValues.email}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, email: event.target.value }))
                  }
                  placeholder="ava.patel@company.com"
                />
                <FieldError>{formErrors.email}</FieldError>
              </FieldContent>
            </Field>

            <Field data-invalid={!!formErrors.department}>
              <FieldLabel>
                <FieldTitle>Department</FieldTitle>
              </FieldLabel>
              <FieldContent>
                <Input
                  value={formValues.department}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, department: event.target.value }))
                  }
                  placeholder="Engineering"
                />
                <FieldError>{formErrors.department}</FieldError>
              </FieldContent>
            </Field>

            {submitError ? <p className="text-destructive text-sm">{submitError}</p> : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onCreate} disabled={createEmployee.isMutating}>
              {createEmployee.isMutating ? <Spinner /> : null}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) {
            setEditing(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit employee</DialogTitle>
            <DialogDescription>Update employee details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Field>
              <FieldLabel>
                <FieldTitle>Employee ID</FieldTitle>
              </FieldLabel>
              <FieldContent>
                <Input value={editing?.employee_id ?? ""} disabled />
              </FieldContent>
            </Field>

            <Field data-invalid={!!formErrors.full_name}>
              <FieldLabel>
                <FieldTitle>Full name</FieldTitle>
              </FieldLabel>
              <FieldContent>
                <Input
                  value={formValues.full_name}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, full_name: event.target.value }))
                  }
                />
                <FieldError>{formErrors.full_name}</FieldError>
              </FieldContent>
            </Field>

            <Field data-invalid={!!formErrors.email}>
              <FieldLabel>
                <FieldTitle>Email</FieldTitle>
              </FieldLabel>
              <FieldContent>
                <Input
                  type="email"
                  value={formValues.email}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, email: event.target.value }))
                  }
                />
                <FieldError>{formErrors.email}</FieldError>
              </FieldContent>
            </Field>

            <Field data-invalid={!!formErrors.department}>
              <FieldLabel>
                <FieldTitle>Department</FieldTitle>
              </FieldLabel>
              <FieldContent>
                <Input
                  value={formValues.department}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, department: event.target.value }))
                  }
                />
                <FieldError>{formErrors.department}</FieldError>
              </FieldContent>
            </Field>

            {submitError ? <p className="text-destructive text-sm">{submitError}</p> : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onUpdate} disabled={updateEmployee.isMutating}>
              {updateEmployee.isMutating ? <Spinner /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) {
            setDeleting(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete employee</DialogTitle>
            <DialogDescription>
              This will permanently remove{" "}
              <span className="text-foreground font-medium">
                {deleting?.full_name ?? "this employee"}
              </span>{" "}
              and their attendance records.
            </DialogDescription>
          </DialogHeader>
          {submitError ? <p className="text-destructive text-sm">{submitError}</p> : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onDelete} disabled={deleteEmployee.isMutating}>
              {deleteEmployee.isMutating ? <Spinner /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
