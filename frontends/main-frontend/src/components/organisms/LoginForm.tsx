"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { AuthPromptLink } from "@/components/molecules/AuthPromptLink";
import { FormField } from "@/components/molecules/FormField";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert>{error}</Alert>}
      <FormField
        id="email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />
      <FormField
        id="password"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="current-password"
      />
      <Button type="submit" fullWidth disabled={submitting}>
        {submitting ? "Signing in…" : "Sign in"}
      </Button>
      <AuthPromptLink
        message="No account?"
        linkHref="/register"
        linkLabel="Create one"
      />
    </form>
  );
}
