"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/guards";
import { runAction } from "@/lib/actions/helpers";
import { ok } from "@/lib/action-result";
import { itemSchema, itemStatusSchema } from "@/domain/validation/item.schema";
import { itemsService } from "@/application/items.service";
import type { ActionResult } from "@/lib/action-result";
import type { ItemDto, ItemStatus } from "@/application/ports";

export async function createItemAction(
  formData: FormData,
): Promise<ActionResult<ItemDto>> {
  return runAction(async () => {
    const user = await requireUser();
    const parsed = itemSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description") || undefined,
    });
    if (!parsed.success) return { ok: false, error: parsed.error.errors[0]?.message ?? "Neispravan unos" };

    const item = await itemsService.create(user.id, parsed.data.title, parsed.data.description);
    revalidatePath("/items");
    return ok(item);
  });
}

export async function updateItemAction(
  itemId: string,
  formData: FormData,
): Promise<ActionResult> {
  return runAction(async () => {
    const user = await requireUser();
    const parsed = itemSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description") || undefined,
    });
    if (!parsed.success) return { ok: false, error: parsed.error.errors[0]?.message ?? "Neispravan unos" };

    await itemsService.update(user.id, itemId, {
      title: parsed.data.title,
      description: parsed.data.description ?? null,
    });
    revalidatePath("/items");
    return ok(undefined);
  });
}

export async function setItemStatusAction(
  itemId: string,
  status: ItemStatus,
): Promise<ActionResult> {
  return runAction(async () => {
    const user = await requireUser();
    const parsed = itemStatusSchema.safeParse(status);
    if (!parsed.success) return { ok: false, error: "Neispravan status" };

    await itemsService.setStatus(user.id, itemId, parsed.data);
    revalidatePath("/items");
    return ok(undefined);
  });
}

export async function deleteItemAction(itemId: string): Promise<ActionResult> {
  return runAction(async () => {
    const user = await requireUser();
    await itemsService.delete(user.id, itemId);
    revalidatePath("/items");
    return ok(undefined);
  });
}
