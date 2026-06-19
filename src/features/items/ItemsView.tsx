"use client";

import { useState, useTransition } from "react";
import { Button, ConfirmDialog, FormError, Plus, Trash } from "@tapizlabs/ui";
import { FormCard } from "@/components/layout/FormCard";
import { useI18n } from "@/i18n/I18nProvider";
import {
  createItemAction,
  updateItemAction,
  setItemStatusAction,
  deleteItemAction,
} from "@/lib/actions/items.actions";
import type { ItemDto } from "@/application/ports";

interface ItemsViewProps {
  items: ItemDto[];
}

export function ItemsView({ items }: ItemsViewProps) {
  const { dict } = useI18n();
  const d = dict.items;
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ItemDto | null>(null);

  function handleCreate(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createItemAction(formData);
      if (!result.ok) setError(result.error);
    });
  }

  function handleDelete(item: ItemDto) {
    startTransition(async () => {
      await deleteItemAction(item.id);
      setDeleteTarget(null);
    });
  }

  function handleToggleDone(item: ItemDto) {
    const next = item.status === "done" ? "active" : "done";
    startTransition(async () => {
      await setItemStatusAction(item.id, next);
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold text-txt-1">{d.title}</h1>
        <p className="mt-1 text-sm text-txt-3">{d.description}</p>
      </div>

      <FormCard title={d.newItem} subtitle={d.newItemSubtitle} icon={<Plus size={18} />}>
        <form action={handleCreate} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-txt-2" htmlFor="item-title">
              {d.titleLabel}
            </label>
            <input
              id="item-title"
              name="title"
              type="text"
              required
              maxLength={255}
              className="w-full border border-border bg-(--tapiz-bg-page) px-3 py-2 text-sm text-txt-1 outline-none focus:border-primary-300"
              placeholder={d.titleLabel}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-txt-2" htmlFor="item-desc">
              {d.descriptionLabel}
            </label>
            <textarea
              id="item-desc"
              name="description"
              rows={3}
              maxLength={5000}
              className="w-full resize-y border border-border bg-(--tapiz-bg-page) px-3 py-2 text-sm text-txt-1 outline-none focus:border-primary-300"
              placeholder={d.descriptionPlaceholder}
            />
          </div>
          {error ? <FormError message={error} /> : null}
          <Button type="submit" size="sm" loading={pending}>
            {d.newItem}
          </Button>
        </form>
      </FormCard>

      {items.length === 0 ? (
        <div className="border border-border bg-(--tapiz-bg-surface) p-8 text-center">
          <p className="font-medium text-txt-2">{d.emptyTitle}</p>
          <p className="mt-1 text-sm text-txt-3">{d.emptyMessage}</p>
        </div>
      ) : (
        <div className="border border-border bg-(--tapiz-bg-surface)">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-txt-3">
                  {d.colTitle}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-txt-3">
                  {d.colStatus}
                </th>
                <th className="w-12 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <span className={item.status === "done" ? "line-through text-txt-3" : "text-txt-1"}>
                      {item.title}
                    </span>
                    {item.description ? (
                      <p className="mt-0.5 text-xs text-txt-3 line-clamp-1">{item.description}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggleDone(item)}
                      className="cursor-pointer rounded border border-border bg-transparent px-2 py-1 text-xs text-txt-2 hover:border-primary-300 hover:text-primary-300"
                    >
                      {item.status === "done" ? d.statusDone : d.statusActive}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(item)}
                      className="cursor-pointer border-none bg-transparent text-txt-3 hover:text-warn"
                      aria-label={d.deleteTitle}
                    >
                      <Trash size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title={d.deleteTitle}
        description={d.deleteDescription.replace("{title}", deleteTarget?.title ?? "")}
        confirmLabel={dict.common.delete}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
