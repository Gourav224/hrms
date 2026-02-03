"use client";

import { useEffect, useMemo, useState } from "react";

import { Plus, Search, Trash2, UserCog } from "lucide-react";
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
import { useAdminMutations, useAdmins } from "@/hooks/use-admins";
import { useDebouncedSearch } from "@/hooks/use-debounced-search";
import { getErrorMessage, getFieldErrors } from "@/lib/api/handlers";
import { useAuthStore } from "@/stores/auth-store";
import type { AdminUser } from "@/types";

const AdminCreateSchema = z.object({
  name: z.string().max(120, "Name is too long.").optional().nullable(),
  email: z.string().email("Enter a valid email.").max(255, "Email is too long."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password is too long."),
  role: z.enum(["admin", "manager"]),
});

const AdminUpdateSchema = z.object({
  name: z.string().max(120, "Name is too long.").optional().nullable(),
  email: z.string().email("Enter a valid email.").max(255, "Email is too long.").optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password is too long.")
    .optional(),
  role: z.enum(["admin", "manager"]).optional(),
});

type AdminCreateValues = z.infer<typeof AdminCreateSchema>;
type AdminUpdateValues = z.infer<typeof AdminUpdateSchema>;

const emptyCreate: AdminCreateValues = { name: null, email: "", password: "", role: "manager" };

export default function AdminsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  const [q, setQ] = useQueryState("q", { defaultValue: "" });
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

  const { searchInput, search, setSearchInput } = useDebouncedSearch({
    initialValue: q,
    delay: 350,
  });
  useEffect(() => {
    if (search !== q) {
      setQ(search);
    }
  }, [q, search, setQ]);
  useEffect(() => {
    if (q !== searchInput) {
      setSearchInput(q);
    }
  }, [q, searchInput, setSearchInput]);

  const limit = 20;
  const offset = useMemo(() => Math.max(0, (page - 1) * limit), [page]);

  const { admins, meta, isLoading, error } = useAdmins({ q: search, limit, offset });
  const { createAdmin, updateAdmin, deleteAdmin } = useAdminMutations();

  const total = meta?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / limit));
  const hasPrev = page > 1;
  const hasNext = page < pageCount;

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState<AdminUser | null>(null);

  const [createValues, setCreateValues] = useState<AdminCreateValues>(emptyCreate);
  const [editValues, setEditValues] = useState<AdminUpdateValues>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isAdmin) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Admins</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            You don’t have access to this page.
          </CardContent>
        </Card>
      </div>
    );
  }

  const openCreate = () => {
    setSubmitError(null);
    setFormErrors({});
    setCreateValues(emptyCreate);
    setCreateOpen(true);
  };

  const openEdit = (admin: AdminUser) => {
    setSubmitError(null);
    setFormErrors({});
    setEditing(admin);
    setEditValues({ name: admin.name, email: admin.email, role: admin.role });
    setEditOpen(true);
  };

  const openDelete = (admin: AdminUser) => {
    setSubmitError(null);
    setDeleting(admin);
    setDeleteOpen(true);
  };

  const onCreate = async () => {
    setSubmitError(null);
    const parsed = AdminCreateSchema.safeParse(createValues);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        if (path) next[path] = issue.message;
      });
      setFormErrors(next);
      return;
    }
    try {
      await createAdmin.trigger(parsed.data);
      setCreateOpen(false);
    } catch (err) {
      setSubmitError(getErrorMessage(err));
      setFormErrors((prev) => ({ ...prev, ...getFieldErrors(err) }));
    }
  };

  const onUpdate = async () => {
    if (!editing) return;
    setSubmitError(null);
    const parsed = AdminUpdateSchema.safeParse(editValues);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        if (path) next[path] = issue.message;
      });
      setFormErrors(next);
      return;
    }
    try {
      await updateAdmin.trigger({ adminId: editing.id, payload: parsed.data });
      setEditOpen(false);
      setEditing(null);
    } catch (err) {
      setSubmitError(getErrorMessage(err));
      setFormErrors((prev) => ({ ...prev, ...getFieldErrors(err) }));
    }
  };

  const onDelete = async () => {
    if (!deleting) return;
    setSubmitError(null);
    try {
      await deleteAdmin.trigger({ adminId: deleting.id });
      setDeleteOpen(false);
      setDeleting(null);
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <Card className="rounded-2xl">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Admins
            </CardTitle>
            <p className="text-muted-foreground text-sm">Manage admin and manager accounts.</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <div className="bg-card flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-sm sm:w-[320px]">
              <Search className="text-muted-foreground h-4 w-4" />
              <Input
                className="h-7 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                value={searchInput}
                onChange={(event) => {
                  setSearchInput(event.target.value);
                  setPage(1);
                }}
                placeholder="Search admins..."
              />
            </div>
            <Button className="sm:shrink-0" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add admin
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <p className="text-muted-foreground text-sm">Loading...</p> : null}
          {error ? <p className="text-destructive text-sm">{getErrorMessage(error)}</p> : null}

          {!isLoading && !error && admins.length === 0 ? (
            <p className="text-muted-foreground text-sm">No admins found.</p>
          ) : null}

          {!isLoading && !error && admins.length > 0 ? (
            <div className="bg-card rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">{admin.name ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{admin.email}</TableCell>
                      <TableCell className="text-muted-foreground">{admin.role}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="secondary" onClick={() => openEdit(admin)}>
                            Edit
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => openDelete(admin)}>
                            <Trash2 className="text-destructive h-4 w-4" />
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
              Showing {admins.length} of {total}
            </p>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      if (hasPrev) setPage(page - 1);
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
                      if (hasNext) setPage(page + 1);
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
            <DialogTitle>Add admin</DialogTitle>
            <DialogDescription>Create a new admin/manager account.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Field data-invalid={!!formErrors.name}>
              <FieldLabel>
                <FieldTitle>Name</FieldTitle>
              </FieldLabel>
              <FieldContent>
                <Input
                  value={createValues.name ?? ""}
                  onChange={(event) => setCreateValues((p) => ({ ...p, name: event.target.value }))}
                  placeholder="HR Admin"
                />
                <FieldError>{formErrors.name}</FieldError>
              </FieldContent>
            </Field>

            <Field data-invalid={!!formErrors.email}>
              <FieldLabel>
                <FieldTitle>Email</FieldTitle>
              </FieldLabel>
              <FieldContent>
                <Input
                  type="email"
                  value={createValues.email}
                  onChange={(event) =>
                    setCreateValues((p) => ({ ...p, email: event.target.value }))
                  }
                  placeholder="admin@company.com"
                />
                <FieldError>{formErrors.email}</FieldError>
              </FieldContent>
            </Field>

            <Field data-invalid={!!formErrors.password}>
              <FieldLabel>
                <FieldTitle>Password</FieldTitle>
              </FieldLabel>
              <FieldContent>
                <Input
                  type="password"
                  value={createValues.password}
                  onChange={(event) =>
                    setCreateValues((p) => ({ ...p, password: event.target.value }))
                  }
                  placeholder="••••••••"
                />
                <FieldError>{formErrors.password}</FieldError>
              </FieldContent>
            </Field>

            <Field data-invalid={!!formErrors.role}>
              <FieldLabel>
                <FieldTitle>Role</FieldTitle>
              </FieldLabel>
              <FieldContent>
                <NativeSelect
                  value={createValues.role}
                  onChange={(event) =>
                    setCreateValues((p) => ({
                      ...p,
                      role: event.target.value as "admin" | "manager",
                    }))
                  }
                >
                  <NativeSelectOption value="manager">manager</NativeSelectOption>
                  <NativeSelectOption value="admin">admin</NativeSelectOption>
                </NativeSelect>
                <FieldError>{formErrors.role}</FieldError>
              </FieldContent>
            </Field>

            {submitError ? <p className="text-destructive text-sm">{submitError}</p> : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onCreate} disabled={createAdmin.isMutating}>
              {createAdmin.isMutating ? <Spinner /> : null}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditing(null);
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit admin</DialogTitle>
            <DialogDescription>Update account details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Field data-invalid={!!formErrors.name}>
              <FieldLabel>
                <FieldTitle>Name</FieldTitle>
              </FieldLabel>
              <FieldContent>
                <Input
                  value={editValues.name ?? ""}
                  onChange={(event) => setEditValues((p) => ({ ...p, name: event.target.value }))}
                />
                <FieldError>{formErrors.name}</FieldError>
              </FieldContent>
            </Field>

            <Field data-invalid={!!formErrors.email}>
              <FieldLabel>
                <FieldTitle>Email</FieldTitle>
              </FieldLabel>
              <FieldContent>
                <Input
                  type="email"
                  value={editValues.email ?? ""}
                  onChange={(event) => setEditValues((p) => ({ ...p, email: event.target.value }))}
                />
                <FieldError>{formErrors.email}</FieldError>
              </FieldContent>
            </Field>

            <Field data-invalid={!!formErrors.password}>
              <FieldLabel>
                <FieldTitle>New password (optional)</FieldTitle>
              </FieldLabel>
              <FieldContent>
                <Input
                  type="password"
                  value={editValues.password ?? ""}
                  onChange={(event) =>
                    setEditValues((p) => ({ ...p, password: event.target.value }))
                  }
                  placeholder="••••••••"
                />
                <FieldError>{formErrors.password}</FieldError>
              </FieldContent>
            </Field>

            <Field data-invalid={!!formErrors.role}>
              <FieldLabel>
                <FieldTitle>Role</FieldTitle>
              </FieldLabel>
              <FieldContent>
                <NativeSelect
                  value={editValues.role ?? "manager"}
                  onChange={(event) =>
                    setEditValues((p) => ({
                      ...p,
                      role: event.target.value as "admin" | "manager",
                    }))
                  }
                >
                  <NativeSelectOption value="manager">manager</NativeSelectOption>
                  <NativeSelectOption value="admin">admin</NativeSelectOption>
                </NativeSelect>
                <FieldError>{formErrors.role}</FieldError>
              </FieldContent>
            </Field>

            {submitError ? <p className="text-destructive text-sm">{submitError}</p> : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onUpdate} disabled={updateAdmin.isMutating}>
              {updateAdmin.isMutating ? <Spinner /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleting(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete admin</DialogTitle>
            <DialogDescription>
              This will permanently remove{" "}
              <span className="text-foreground font-medium">
                {deleting?.email ?? "this account"}
              </span>
              .
            </DialogDescription>
          </DialogHeader>
          {submitError ? <p className="text-destructive text-sm">{submitError}</p> : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onDelete} disabled={deleteAdmin.isMutating}>
              {deleteAdmin.isMutating ? <Spinner /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
