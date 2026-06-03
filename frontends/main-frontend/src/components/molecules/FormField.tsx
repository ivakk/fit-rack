import { Input, InputProps } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";

export function FormField({
  id,
  label,
  ...inputProps
}: InputProps & { id: string; label: string }) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...inputProps} />
    </div>
  );
}
