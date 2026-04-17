"use client";

import { useState } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const payload = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    console.log(payload);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background-light)] px-4 py-10">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(186,48,61,0.10),_transparent_35%)]" />

      <Card className="w-full max-w-md rounded-3xl border border-black/5 bg-white/95 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur">
        <CardHeader className="space-y-6 pb-2 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 ring-1 ring-[var(--color-primary)]/15">
            <img
              src="/logo-hys.png"
              alt="HYS"
              className="h-12 w-12 object-contain"
            />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-background)]">
              Welcome back
            </h1>
            <p className="text-sm text-[var(--color-secondary)]">
              Sign in to access the HYS dashboard
            </p>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-[var(--color-background)]"
              >
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@company.com"
                className="h-12 rounded-xl border-[var(--color-secondary)]/20 bg-white text-[var(--color-background)] placeholder:text-[var(--color-secondary)]/70 focus-visible:ring-[var(--color-primary)]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-[var(--color-background)]"
                >
                  Password
                </Label>

                <button
                  type="button"
                  className="text-xs font-medium text-[var(--color-highlight)] transition hover:opacity-80"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="h-12 rounded-xl border-[var(--color-secondary)]/20 bg-white pr-11 text-[var(--color-background)] placeholder:text-[var(--color-secondary)]/70 focus-visible:ring-[var(--color-primary)]"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-secondary)] transition hover:text-[var(--color-background)]"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="h-12 w-full rounded-xl bg-[var(--color-primary)] text-white shadow-md transition hover:bg-[var(--color-highlight)]"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign in
            </Button>

            <p className="text-center text-sm text-[var(--color-secondary)]">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                className="font-medium text-[var(--color-highlight)] transition hover:opacity-80"
              >
                Request access
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
