"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { ShieldCheck } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldContent, FieldError, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/use-auth";
import { getErrorMessage } from "@/lib/api/handlers";

const LoginSchema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(1, "Password is required.").max(128, "Password is too long."),
});

export default function AuthPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    validatorAdapter: zodValidator,
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setError(null);
      const parsed = LoginSchema.safeParse(value);
      if (!parsed.success) {
        return;
      }
      try {
        await login.trigger({ email: parsed.data.email, password: parsed.data.password });
        router.replace("/dashboard");
      } catch (err) {
        setError(getErrorMessage(err));
      }
    },
  });

  return (
    <div className="bg-background text-foreground relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-sky-500/15 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-screen w-full max-w-5xl grid-cols-1 items-stretch gap-0 px-6 py-10 md:grid-cols-2 md:py-16">
        <div className="bg-card/50 hidden flex-col justify-between rounded-3xl border p-10 shadow-sm md:flex">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-600 text-white">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold">HRMS Lite</p>
                <p className="text-muted-foreground text-xs">Admin console</p>
              </div>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Manage employees and attendance.
            </h1>
            <p className="text-muted-foreground text-sm">
              A clean, production-style dashboard with fast search, pagination, and daily attendance
              marking.
            </p>
          </div>
          <p className="text-muted-foreground text-xs">
            Tip: Use the Employees page to mark today’s attendance in one click.
          </p>
        </div>

        <div className="flex items-center justify-center md:justify-end">
          <Card className="w-full max-w-md rounded-3xl shadow-sm">
            <CardHeader>
              <CardTitle>Sign in</CardTitle>
              <CardDescription>Use your admin credentials to continue.</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  form.handleSubmit();
                }}
              >
                <form.Field name="email" validators={{ onChange: LoginSchema.shape.email }}>
                  {(field) => (
                    <Field data-invalid={field.state.meta.errors.length > 0}>
                      <FieldLabel>
                        <FieldTitle>Email</FieldTitle>
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          type="email"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                          placeholder="admin@company.com"
                          autoComplete="email"
                        />
                        <FieldError>{field.state.meta.errors[0] ?? null}</FieldError>
                      </FieldContent>
                    </Field>
                  )}
                </form.Field>

                <form.Field name="password" validators={{ onChange: LoginSchema.shape.password }}>
                  {(field) => (
                    <Field data-invalid={field.state.meta.errors.length > 0}>
                      <FieldLabel>
                        <FieldTitle>Password</FieldTitle>
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          type="password"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                          placeholder="••••••••"
                          autoComplete="current-password"
                        />
                        <FieldError>{field.state.meta.errors[0] ?? null}</FieldError>
                      </FieldContent>
                    </Field>
                  )}
                </form.Field>

                {error ? <p className="text-destructive text-sm">{error}</p> : null}

                <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                  {([canSubmit, isSubmitting]) => (
                    <Button
                      className="w-full"
                      type="submit"
                      disabled={!canSubmit || isSubmitting || login.isMutating}
                    >
                      {isSubmitting || login.isMutating ? <Spinner /> : null}
                      Continue
                    </Button>
                  )}
                </form.Subscribe>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
