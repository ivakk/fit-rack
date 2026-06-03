import { LoginForm } from "@/components/organisms/LoginForm";
import { AuthTemplate } from "@/components/templates/AuthTemplate";

export default function LoginPage() {
  return (
    <AuthTemplate
      title="Welcome back"
      subtitle="Sign in to continue tracking your training"
    >
      <LoginForm />
    </AuthTemplate>
  );
}
