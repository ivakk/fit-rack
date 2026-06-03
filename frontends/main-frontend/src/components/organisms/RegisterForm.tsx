"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Label } from "@/components/atoms/Label";
import { Input } from "@/components/atoms/Input";
import { AuthPromptLink } from "@/components/molecules/AuthPromptLink";
import { FormField } from "@/components/molecules/FormField";
import { Text } from "@/components/atoms/Text";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const GENDERS = ["male", "female", "other", "prefer not to say"];

export function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    phoneNumber: "",
    gender: "other",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(form);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert>{error}</Alert>}
      <FormField
        id="fullName"
        label="Full name"
        value={form.fullName}
        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        required
      />
      <FormField
        id="email"
        label="Email"
        type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
      />
      <FormField
        id="phone"
        label="Phone"
        value={form.phoneNumber}
        onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
        required
      />
      <div>
        <Label htmlFor="gender">Gender</Label>
        <select
          id="gender"
          className="input-field"
          value={form.gender}
          onChange={(e) => setForm({ ...form, gender: e.target.value })}
        >
          {GENDERS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>
      <FormField
        id="password"
        label="Password"
        type="password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required
        minLength={8}
      />
      <Text variant="muted" className="text-xs">
        At least 8 characters with one letter and one number.
      </Text>
      <Button type="submit" fullWidth disabled={submitting}>
        {submitting ? "Creating account…" : "Create account"}
      </Button>
      <AuthPromptLink
        message="Already have an account?"
        linkHref="/login"
        linkLabel="Sign in"
      />
    </form>
  );
}
