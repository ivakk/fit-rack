import { RegisterForm } from "@/components/organisms/RegisterForm";
import { AuthTemplate } from "@/components/templates/AuthTemplate";

export default function RegisterPage() {
  return (
    <AuthTemplate
      title="Start your journey"
      subtitle="Create an account to log workouts"
    >
      <RegisterForm />
    </AuthTemplate>
  );
}
