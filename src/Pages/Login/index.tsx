"use client";

import { useState } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("hys_token", response.data.accessToken);

      navigate("/");
    } catch {
      alert("Invalid credentials");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary/10 px-4 py-10">
      <div className="absolute inset-0 -z-10" />

      <Card className="w-full max-w-md rounded-3xl border border-black/5 bg-white/95 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur">
        <CardHeader className="space-y-6 pb-2 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary">
            <img
              src="/icon-hys.jpg"
              alt="HYS"
              className="h-full w-full object-cover rounded-3xl"
            />
          </div>

          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-background)]">
              Login HYS
            </h1>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-[var(--color-background)]"
              >
                E-mail
              </Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  Senha
                </Label>
              </div>

              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
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
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
