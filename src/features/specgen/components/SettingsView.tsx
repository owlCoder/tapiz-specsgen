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

interface Props {
  settings: AppSettings;
  onSaved: (s: AppSettings) => void;
}

export function SettingsView({ settings: initialSettings, onSaved }: Props) {
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
          <FieldLabel htmlFor="faculty">Naziv fakulteta</FieldLabel>
          <Input
            id="faculty"
            value={settings.faculty}
            onChange={(e) => setSettings({ ...settings, faculty: e.target.value })}
            placeholder="npr. FTN Novi Sad"
          />
        </div>

        <div>
          <FieldLabel htmlFor="acyear">Školska godina</FieldLabel>
          <div className="flex gap-2">
            <Input
              id="acyear"
              value={settings.academicYear}
              onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })}
              placeholder="2025/2026"
            />
            <Button variant="secondary" onClick={bumpYear} title="Sledeća godina">
              +1
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 rounded border border-(--tapiz-border-subtle) p-3">
          <div>
            <div className="text-sm font-medium text-(--tapiz-text-primary)">
              Napomena o akademskoj čestitosti
            </div>
            <div className="text-xs text-(--tapiz-text-muted)">
              Dodaje napomenu o zabrani prepisivanja u specifikaciju.
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
          {saved ? "Sačuvano" : "Sačuvaj postavke"}
        </Button>
      </Surface>
    </div>
  );
}
