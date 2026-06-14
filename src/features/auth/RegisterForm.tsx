"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Button,
  FieldHint,
  FieldLabel,
  FormError,
  Input,
  LockIcon,
  Mail,
  PasswordInput,
  User,
  UserPlus,
} from "@tapizlabs/ui";
import { InputIcon } from "./InputIcon";
import { registerAction } from "@/lib/actions/auth.actions";
import { useI18n } from "@/i18n/I18nProvider";

export function RegisterForm({ ssoEnabled }: { ssoEnabled: boolean }) {
  const router = useRouter();
  const { dict } = useI18n();
  const t = dict.auth;
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const triggerShake = (msg: string) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 450);
  };

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await registerAction(form);
    if (!result.ok) {
      triggerShake(result.error);
      setLoading(false);
      return;
    }
    router.push("/login?registered=1");
  };

  return (
    <div className="w-full max-w-sm animate-fade-in-up">
      <div className="mb-8">
        <div className="text-[11px] font-mono uppercase tracking-wider text-primary-300 mb-2">
          {t.newAccount}
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">{t.registerTitle}</h1>
        <p className="text-txt-2 text-sm mt-2">{t.registerSubtitle}</p>
      </div>
      <form onSubmit={handleSubmit} className={`space-y-5 ${shake ? "animate-shake" : ""}`}>
        <FormError message={error} />
        <div className="grid grid-cols-2 gap-3 animate-fade-in-up [animation-delay:150ms]">
          <div>
            <FieldLabel htmlFor="firstName">{t.firstName}</FieldLabel>
            <div className="relative">
              <InputIcon icon={<User size={15} />} />
              <Input
                id="firstName"
                value={form.firstName}
                onChange={set("firstName")}
                className="pl-10"
                required
              />
            </div>
          </div>
          <div>
            <FieldLabel htmlFor="lastName">{t.lastName}</FieldLabel>
            <div className="relative">
              <InputIcon icon={<User size={15} />} />
              <Input
                id="lastName"
                value={form.lastName}
                onChange={set("lastName")}
                className="pl-10"
                required
              />
            </div>
          </div>
        </div>
        <div className="animate-fade-in-up [animation-delay:220ms]">
          <FieldLabel htmlFor="email">{t.email}</FieldLabel>
          <div className="relative">
            <InputIcon icon={<Mail size={15} />} />
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={set("email")}
              className="pl-10"
              required
            />
          </div>
          <FieldHint>{t.emailHint}</FieldHint>
        </div>
        <div className="animate-fade-in-up [animation-delay:290ms]">
          <FieldLabel htmlFor="password">{t.password}</FieldLabel>
          <div className="relative">
            <InputIcon icon={<LockIcon size={15} />} />
            <PasswordInput
              id="password"
              value={form.password}
              onChange={set("password")}
              autoComplete="new-password"
              className="auth-input-group pl-10"
              required
            />
          </div>
          <FieldHint>{t.passwordHint}</FieldHint>
        </div>
        <div className="animate-fade-in-up [animation-delay:360ms]">
          <Button
            type="submit"
            loading={loading}
            fullWidth
            size="lg"
            icon={<UserPlus size={15} />}
            iconRight={!loading ? <ArrowRight size={15} /> : undefined}
          >
            {loading ? t.registering : t.registerButton}
          </Button>
        </div>
      </form>
      <p className="mt-6 text-center text-sm text-txt-3 animate-fade-in [animation-delay:450ms]">
        {t.haveAccount}{" "}
        <Link
          href="/login"
          className="font-semibold text-primary-300 hover:text-primary-400 transition-colors"
        >
          {t.loginLink}
        </Link>
      </p>
      {ssoEnabled && (
        <p className="mt-3 text-center text-sm text-txt-4 animate-fade-in [animation-delay:500ms]">
          {t.haveLmsAccount}{" "}
          <Link
            href="/login"
            className="font-medium text-primary-300 hover:text-primary-400 transition-colors"
          >
            {t.lmsDirectLink}
          </Link>
        </p>
      )}
    </div>
  );
}
