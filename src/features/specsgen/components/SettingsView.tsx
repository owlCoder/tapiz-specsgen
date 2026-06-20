"use client";

import { useState } from "react";
import {
  Button,
  Check,
  FieldLabel,
  FormError,
  Input,
  Surface,
  Switch,
} from "@tapizlabs/ui";
import type { AppSettings } from "../types/spec.types";
import { updateSettingsAction } from "@/lib/actions/settings.actions";
import { useI18n } from "@/i18n/I18nProvider";

interface Props {
  settings: AppSettings;
  onSaved: (s: AppSettings) => void;
}

export function SettingsView({ settings: initialSettings, onSaved }: Props) {
  const { dict } = useI18n();
  const t = dict.specsgen.settings;
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setError(null);
    setLoading(true);
    const result = await updateSettingsAction(settings);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onSaved(result.data);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const bumpYear = () => {
    const m = settings.academicYear.match(/(\d{4})\D+(\d{4})/);
    if (m) setSettings({ ...settings, academicYear: `${+m[1] + 1}/${+m[2] + 1}` });
  };

  return (
    <div className="space-y-5">
      <Surface variant="raised" padding="md" className="space-y-5">
        <div>
          <FieldLabel htmlFor="university">{t.university}</FieldLabel>
          <Input
            id="university"
            value={settings.university}
            onChange={(e) => setSettings({ ...settings, university: e.target.value })}
            placeholder={t.universityPlaceholder}
          />
        </div>

        <div>
          <FieldLabel htmlFor="faculty">{t.faculty}</FieldLabel>
          <Input
            id="faculty"
            value={settings.faculty}
            onChange={(e) => setSettings({ ...settings, faculty: e.target.value })}
            placeholder={t.facultyPlaceholder}
          />
        </div>

        <div>
          <FieldLabel htmlFor="department">{t.department}</FieldLabel>
          <Input
            id="department"
            value={settings.department}
            onChange={(e) => setSettings({ ...settings, department: e.target.value })}
            placeholder={t.departmentPlaceholder}
          />
        </div>

        <div>
          <FieldLabel htmlFor="city">{t.city}</FieldLabel>
          <Input
            id="city"
            value={settings.city}
            onChange={(e) => setSettings({ ...settings, city: e.target.value })}
            placeholder={t.cityPlaceholder}
          />
        </div>

        <div>
          <FieldLabel htmlFor="acyear">{t.academicYear}</FieldLabel>
          <div className="flex gap-2">
            <Input
              id="acyear"
              value={settings.academicYear}
              onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })}
              placeholder="2025/2026"
            />
            <Button variant="secondary" onClick={bumpYear} title={t.nextYear}>
              +1
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 rounded border border-(--tapiz-border-subtle) p-3">
          <div>
            <div className="text-sm font-medium text-(--tapiz-text-primary)">
              {t.integrityTitle}
            </div>
            <div className="text-xs text-(--tapiz-text-muted)">
              {t.integrityDesc}
            </div>
          </div>
          <Switch
            checked={settings.integrityNote}
            onChange={(v) => setSettings({ ...settings, integrityNote: v })}
          />
        </div>

        <FormError message={error} />

        <Button
          icon={saved ? <Check size={15} /> : undefined}
          loading={loading}
          onClick={() => void save()}
        >
          {saved ? t.saved : t.save}
        </Button>
      </Surface>
    </div>
  );
}
