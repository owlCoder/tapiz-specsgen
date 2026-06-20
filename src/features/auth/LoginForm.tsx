"use client";

import { Button, FormError, InfoBanner, LogoMark } from "@tapizlabs/ui";
import { lmsLoginAction } from "@/lib/actions/auth.actions";
import { useI18n } from "@/i18n/I18nProvider";

export function LoginForm({
  ssoError,
}: {
  justRegistered?: boolean;
  ssoError: string | null;
  ssoEnabled?: boolean;
}) {
  const { dict } = useI18n();
  const t = dict.auth;

  return (
    <div className="w-full max-w-sm animate-fade-in-up">
      <div className="mb-8">
        <div className="text-[11px] font-mono uppercase tracking-wider text-primary-300 mb-2">
          {t.welcomeBack}
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">{t.loginTitle}</h1>
        <p className="text-txt-2 text-sm mt-2">{t.loginSubtitle}</p>
      </div>

      {ssoError && (
        <div className="mb-5 animate-scale-in">
          <FormError message={ssoError} />
        </div>
      )}

      <div className="mb-6 animate-fade-in-up [animation-delay:100ms]">
        <InfoBanner
          text={t.ssoErrors.lmsRole}
          variant="info"
        />
      </div>

      <form action={lmsLoginAction} className="animate-fade-in-up [animation-delay:200ms]">
        <Button
          type="submit"
          variant="outline-primary"
          fullWidth
          size="lg"
          icon={<LogoMark size={18} tone="outline" />}
        >
          {t.lmsLogin}
        </Button>
      </form>
    </div>
  );
}
