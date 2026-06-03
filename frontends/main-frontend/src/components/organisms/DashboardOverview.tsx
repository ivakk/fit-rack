"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Text } from "@/components/atoms/Text";
import { StatCard } from "@/components/molecules/StatCard";
import { WorkoutCard } from "@/components/organisms/WorkoutCard";
import { useAuth } from "@/context/AuthContext";
import { workoutApi } from "@/lib/api";
import { getAccessToken } from "@/lib/auth-storage";
import type { Workout } from "@/lib/types";

export function DashboardOverview() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    workoutApi
      .list(token)
      .then(setWorkouts)
      .catch(() => setWorkouts([]))
      .finally(() => setLoading(false));
  }, []);

  const recent = workouts.slice(0, 3);

  return (
    <div className="space-y-8">
      <section>
        <Text variant="muted">Good to see you</Text>
        <Text variant="h1">{user?.fullName?.split(" ")[0] ?? "Athlete"}</Text>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total workouts" value={loading ? "—" : workouts.length} />
        <StatCard label="Quick action" value=" ">
          <Text variant="muted" className="mt-2 text-sm">
            Log sessions with your JWT via the API gateway.
          </Text>
          <Link href="/workouts/new" className="mt-4 inline-block">
            <Button>Log new workout</Button>
          </Link>
        </StatCard>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <Text variant="h2">Recent workouts</Text>
          <Link href="/workouts" className="text-sm text-accent-glow hover:underline">
            View all
          </Link>
        </div>
        {loading ? (
          <Text variant="muted">Loading…</Text>
        ) : recent.length === 0 ? (
          <Card className="text-center">
            <Text variant="muted" className="mb-4">
              No workouts yet.
            </Text>
            <Link href="/workouts/new">
              <Button>Log your first session</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-4">
            {recent.map((w) => (
              <WorkoutCard key={w.id} workout={w} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
