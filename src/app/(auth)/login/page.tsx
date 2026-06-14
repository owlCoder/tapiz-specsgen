import { LoginForm } from "@/features/auth/LoginForm";
import { lmsSsoEnabled } from "@/lib/auth";
import { getDict } from "@/i18n/server";
import type { Dict } from "@/i18n/dictionaries";

function ssoErrorMessage(code: string, t: Dict["auth"]["ssoErrors"]): string {
  switch (code) {
    case "lms-conflict":
      return t.lmsConflict;
    case "lms-role":
      return t.lmsRole;
    case "AccessDenied":
      return t.accessDenied;
    case "Configuration":
      return t.configuration;
    default:
      return t.lmsSso;
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string; error?: string }>;
}) {
  const params = await searchParams;
  const dict = await getDict();
  const ssoError = params.error ? ssoErrorMessage(params.error, dict.auth.ssoErrors) : null;
  return (
    <LoginForm
      justRegistered={params.registered === "1"}
      ssoError={ssoError}
      ssoEnabled={lmsSsoEnabled}
    />
  );
}
