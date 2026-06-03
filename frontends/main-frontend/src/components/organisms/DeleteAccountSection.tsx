"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Text } from "@/components/atoms/Text";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export function DeleteAccountSection() {
  const { deleteAccount } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (
      !confirm(
        "Permanently delete your account and all workouts? This cannot be undone."
      )
    ) {
      return;
    }
    setError(null);
    setDeleting(true);
    try {
      await deleteAccount();
      router.replace("/register");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete account");
      setDeleting(false);
    }
  }

  return (
    <Card className="border-red-500/20">
      <Text variant="h3">Delete account</Text>
      <Text variant="muted" className="mt-2">
        Removes your profile, sessions, and all workout data from the database.
      </Text>
      {error && (
        <div className="mt-4">
          <Alert>{error}</Alert>
        </div>
      )}
      <Button
        variant="danger"
        type="button"
        className="mt-4"
        disabled={deleting}
        onClick={handleDelete}
      >
        {deleting ? "Deleting…" : "Delete my account"}
      </Button>
    </Card>
  );
}
