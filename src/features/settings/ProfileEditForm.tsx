"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Check,
  ChevronLeft,
  FieldLabel,
  FormError,
  Input,
  InputGroup,
  Mail,
  User,
  X,
  useToast,
} from "@tapizlabs/ui";
import { updateMyProfileAction } from "@/lib/actions/profile.actions";
import { useI18n } from "@/i18n/I18nProvider";

interface ProfileEditFormProps {
  initialFirstName: string;
  initialLastName: string;
  initialEmail: string;
  /** SSO nalozi ne menjaju email — vezan je za LMS identitet. */
  emailLocked: boolean;
  onBack: () => void;
}

export function ProfileEditForm({
  initialFirstName,
  initialLastName,
  initialEmail,
  emailLocked,
  onBack,
}: ProfileEditFormProps) {
  const router = useRouter();
  const { dict } = useI18n();
  const t = dict.settings.account;
  const { showToast } = useToast();
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await updateMyProfileAction({
      firstName,
      lastName,
      ...(emailLocked ? {} : { email }),
    });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    showToast(t.profileSaved, true);
    router.refresh();
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
          <FieldLabel htmlFor="pe-first-name">{t.firstNameLabel}</FieldLabel>
          <InputGroup className="settings-input-group" prefix={<User size={15} className="text-primary-300" />}>
            <Input
              id="pe-first-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </InputGroup>
        </div>
        <div>
          <FieldLabel htmlFor="pe-last-name">{t.lastNameLabel}</FieldLabel>
          <InputGroup className="settings-input-group" prefix={<User size={15} className="text-primary-300" />}>
            <Input
              id="pe-last-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </InputGroup>
        </div>
        <div>
          <FieldLabel htmlFor="pe-email">{t.emailLabel}</FieldLabel>
          <InputGroup className="settings-input-group" prefix={<Mail size={15} className="text-primary-300" />}>
            <Input
              id="pe-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={emailLocked}
              required={!emailLocked}
            />
          </InputGroup>
          {emailLocked ? <p className="mt-1.5 text-xs text-txt-4">{t.emailSsoHint}</p> : null}
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
