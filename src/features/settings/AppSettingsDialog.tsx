"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Gear, Info, User } from "@tapizlabs/ui";
import { useI18n } from "@/i18n/I18nProvider";
import type { AuthProvider, Role } from "@/domain/types";
import { SidePanel } from "@/components/layout/SidePanel";
import { SettingsAccountSection } from "./SettingsAccountSection";
import { SettingsInfoSection } from "./SettingsInfoSection";

type SettingsSection = "account" | "info";

export interface SettingsDialogUser {
  name: string;
  firstName: string;
  lastName: string;
  role: Role;
  email?: string;
  authProvider: AuthProvider;
  facultyName?: string | null;
  universityName?: string | null;
}

interface AppSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  user: SettingsDialogUser;
}

export function AppSettingsDialog({ open, onClose, user }: AppSettingsDialogProps) {
  const { dict } = useI18n();
  const [active, setActive] = useState<SettingsSection>("account");

  const sections: { id: SettingsSection; label: string; icon: ReactNode }[] = useMemo(() => [
    { id: "account", label: dict.settings.nav.account, icon: <User size={15} /> },
    { id: "info", label: dict.settings.nav.info, icon: <Info size={15} /> },
  ], [dict]);

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      title={dict.settings.title}
      icon={<Gear size={18} />}
      width="lg"
    >
      <div className="flex gap-1 border-b border-border pb-3 mb-5">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActive(s.id)}
            className={`flex cursor-pointer items-center gap-1.5 border-none px-3 py-1.5 text-xs font-semibold transition-colors ${
              active === s.id
                ? "bg-primary-300/10 text-primary-300"
                : "bg-transparent text-txt-3 hover:text-txt-1"
            }`}
          >
            {s.icon}
            {s.label}
          </button>
        ))}
      </div>
      {active === "account" && <SettingsAccountSection user={user} />}
      {active === "info" && <SettingsInfoSection />}
    </SidePanel>
  );
}
