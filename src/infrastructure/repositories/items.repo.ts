import { asc, eq } from "drizzle-orm";
import { db } from "@/infrastructure/db/client";
import { items } from "@/infrastructure/db/schema";
import type { ItemDto, ItemsRepo, NewItem } from "@/application/ports";

export const itemsRepo: ItemsRepo = {
  async listByOwner(ownerId: string): Promise<ItemDto[]> {
    return db
      .select()
      .from(items)
      .where(eq(items.ownerId, ownerId))
      .orderBy(asc(items.createdAt));
  },

  async findById(id: string): Promise<ItemDto | null> {
    const rows = await db.select().from(items).where(eq(items.id, id)).limit(1);
    return rows[0] ?? null;
  },

  async create(item: NewItem): Promise<ItemDto> {
    const id = crypto.randomUUID();
    await db.insert(items).values({
      id,
      ownerId: item.ownerId,
      title: item.title,
      description: item.description ?? null,
      status: item.status ?? "active",
    });
    const row = await db.select().from(items).where(eq(items.id, id)).limit(1);
    return row[0]!;
  },

  async update(
    id: string,
    patch: Partial<Pick<NewItem, "title" | "description" | "status">>,
  ): Promise<void> {
    await db.update(items).set(patch).where(eq(items.id, id));
  },

  async delete(id: string): Promise<void> {
    await db.delete(items).where(eq(items.id, id));
  },
};
