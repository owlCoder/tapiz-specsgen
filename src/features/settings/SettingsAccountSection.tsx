"use client";

import { useState, type ReactNode } from "react";
import { ChevronRight, Edit, LockIcon, Shield } from "@tapizlabs/ui";
import { useI18n } from "@/i18n/I18nProvider";
import { ProfileEditForm } from "./ProfileEditForm";
import { PasswordChangeForm } from "./PasswordChangeForm";
import { SettingsProfileCard } from "./SettingsProfileCard";
import type { SettingsDialogUser } from "./AppSettingsDialog";

type AccountView = "menu" | "edit" | "password";

function SettingsCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border border-border border-t-2 border-t-primary-300 bg-ink-200 p-4">
      <h3 className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-txt-4">{title}</h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function SRow({ icon, label, desc, onClick }: { icon: ReactNode; label: string; desc: string; onClick?: () => void }) {
  const content = (
    <>
      <span className="grid h-9 w-9 shrink-0 place-items-center border border-primary-300 bg-(--color-icon-bg) text-primary-300">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-txt-1">{label}</span>
        <span className="mt-0.5 block text-xs leading-5 text-txt-3">{desc}</span>
      </span>
      {onClick && <ChevronRight size={14} className="shrink-0 text-txt-4" />}
    </>
  );
  if (!onClick) {
    return <div className="flex w-full items-center gap-3 px-2 py-2 text-left">{content}</div>;
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-3 border-none bg-transparent px-2 py-2 text-left transition-colors hover:bg-ink-300"
    >
      {content}
    </button>
  );
}

interface SettingsAccountSectionProps {
  user: SettingsDialogUser;
}

export function SettingsAccountSection({ user }: SettingsAccountSectionProps) {
  const { dict } = useI18n();
  const t = dict.settings.account;
  const [view, setView] = useState<AccountView>("menu");
  const isLocal = user.authProvider === "local";

  if (view === "edit") {
    return (
      <ProfileEditForm
        initialFirstName={user.firstName}
        initialLastName={user.lastName}
        initialEmail={user.email ?? ""}
        emailLocked={!isLocal}
        onBack={() => setView("menu")}
      />
    );
  }
  if (view === "password") {
    return <PasswordChangeForm onBack={() => setView("menu")} />;
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <SettingsProfileCard user={user} />
      <SettingsCard title={t.securityTitle}>
        {isLocal ? (
          <SRow icon={<LockIcon size={18} />} label={t.changePasswordTitle} desc={t.changePasswordDescription} onClick={() => setView("password")} />
        ) : (
          <SRow icon={<Shield size={18} />} label={t.ssoManagedTitle} desc={t.ssoManagedDescription} />
        )}
      </SettingsCard>
      <SettingsCard title={t.personalTitle}>
        <SRow icon={<Edit size={18} />} label={t.editProfileTitle} desc={t.editProfileDescription} onClick={() => setView("edit")} />
      </SettingsCard>
    </div>
  );
}
