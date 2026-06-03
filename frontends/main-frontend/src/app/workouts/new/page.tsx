import Link from "next/link";
import { Text } from "@/components/atoms/Text";
import { WorkoutCreateForm } from "@/components/organisms/WorkoutCreateForm";
import { AppTemplate } from "@/components/templates/AppTemplate";

export default function NewWorkoutPage() {
  return (
    <AppTemplate>
      <div className="mb-6">
        <Link href="/workouts" className="text-sm text-muted hover:text-accent-glow">
          ← Back to workouts
        </Link>
        <Text variant="h1" className="mt-2">
          Log workout
        </Text>
      </div>
      <WorkoutCreateForm />
    </AppTemplate>
  );
}
