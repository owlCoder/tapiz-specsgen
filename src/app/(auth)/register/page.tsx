import { RegisterForm } from "@/features/auth/RegisterForm";
import { lmsSsoEnabled } from "@/lib/auth";

export default function RegisterPage() {
  return <RegisterForm ssoEnabled={lmsSsoEnabled} />;
}
