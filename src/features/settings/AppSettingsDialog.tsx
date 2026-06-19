"use client";

import { useMemo, useState } from "react";
import { Gear, Info, SegmentedTabs, User } from "@tapizlabs/ui";
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
  const [section, setSection] = useState<SettingsSection>("account");

  // Reset sekcije pri otvaranju — tokom rendera (prevOpen šablon), ne kroz useEffect.
  const [prevOpen, setPrevOpen] = useState(false);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setSection("account");
  }

  const navItems = useMemo(
    () => [
      { id: "account", label: dict.settings.nav.account, icon: <User size={16} /> },
      { id: "info", label: dict.settings.nav.info, icon: <Info size={16} /> },
    ],
    [dict.settings.nav.account, dict.settings.nav.info],
  );

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      title={dict.settings.title}
      subtitle={section === "account" ? dict.settings.sections.account : dict.settings.sections.info}
      icon={<Gear size={18} />}
      width="md"
    >
      {/* Section nav — segmented tabs (kao /ui SettingsDialog) */}
      <SegmentedTabs
        className="mb-5"
        activeId={section}
        onChange={(id) => setSection(id as SettingsSection)}
        items={navItems}
      />

      <div className="animate-in fade-in duration-200">
        {section === "account" ? <SettingsAccountSection user={user} /> : <SettingsInfoSection />}
      </div>
    </SidePanel>
  );
}
