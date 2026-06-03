import { Button } from "@/components/atoms/Button";
import { FormField } from "@/components/molecules/FormField";
import type { Exercise } from "@/lib/types";

export function ExerciseFormRow({
  index,
  exercise,
  onChange,
  onRemove,
  canRemove,
}: {
  index: number;
  exercise: Exercise;
  onChange: (patch: Partial<Exercise>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-surface p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormField
            id={`ex-name-${index}`}
            label="Name"
            value={exercise.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Bench press"
          />
        </div>
        <FormField
          id={`ex-sets-${index}`}
          label="Sets"
          type="number"
          min={0}
          value={exercise.sets ?? ""}
          onChange={(e) =>
            onChange({ sets: e.target.value ? Number(e.target.value) : undefined })
          }
        />
        <FormField
          id={`ex-reps-${index}`}
          label="Reps"
          type="number"
          min={0}
          value={exercise.reps ?? ""}
          onChange={(e) =>
            onChange({ reps: e.target.value ? Number(e.target.value) : undefined })
          }
        />
        <FormField
          id={`ex-weight-${index}`}
          label="Weight (kg)"
          type="number"
          min={0}
          step={0.5}
          value={exercise.weightKg ?? ""}
          onChange={(e) =>
            onChange({
              weightKg: e.target.value ? Number(e.target.value) : undefined,
            })
          }
        />
      </div>
      {canRemove && (
        <Button variant="ghost" type="button" className="mt-3 text-red-400" onClick={onRemove}>
          Remove
        </Button>
      )}
    </div>
  );
}
