"use client";

import { useState, type FormEvent } from "react";
import {
  Button,
  Check,
  ChevronLeft,
  FieldLabel,
  FormError,
  Input,
  InputGroup,
  LockIcon,
  X,
  useToast,
} from "@tapizlabs/ui";
import { changeMyPasswordAction } from "@/lib/actions/profile.actions";
import { useI18n } from "@/i18n/I18nProvider";

interface PasswordChangeFormProps {
  onBack: () => void;
}

export function PasswordChangeForm({ onBack }: PasswordChangeFormProps) {
  const { dict } = useI18n();
  const t = dict.settings.account;
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await changeMyPasswordAction({ currentPassword, newPassword });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    showToast(t.passwordChanged, true);
    onBack();
  };

  return (
    <div className="animate-in fade-in duration-200">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-xs font-semibold text-txt-3 transition-colors hover:text-primary-300"
      >
        <ChevronLeft size={14} />
        {t.back}
      </button>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 border border-border border-t-2 border-t-primary-300 bg-ink-200 p-4"
      >
        <div>
          <FieldLabel htmlFor="pc-current">{t.currentPasswordLabel}</FieldLabel>
          <InputGroup className="settings-input-group" prefix={<LockIcon size={15} className="text-primary-300" />}>
            <Input
              id="pc-current"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </InputGroup>
        </div>
        <div>
          <FieldLabel htmlFor="pc-new">{t.newPasswordLabel}</FieldLabel>
          <InputGroup className="settings-input-group" prefix={<LockIcon size={15} className="text-primary-300" />}>
            <Input
              id="pc-new"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </InputGroup>
          <p className="mt-1.5 text-xs text-txt-4">{t.newPasswordHint}</p>
        </div>
        <FormError message={error} />
        <div className="flex justify-end gap-2 border-t border-border pt-2">
          <Button variant="secondary" type="button" icon={<X size={14} />} onClick={onBack}>
            {dict.common.cancel}
          </Button>
          <Button type="submit" icon={<Check size={14} />} loading={loading}>
            {dict.common.save}
          </Button>
        </div>
      </form>
    </div>
  );
}
