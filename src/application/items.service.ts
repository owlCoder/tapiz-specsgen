import { DomainError } from "@/application/errors";
import { eventsService } from "@/application/events.service";
import { itemsRepo } from "@/infrastructure/repositories/items.repo";
import type { ItemDto } from "@/application/ports";

export const itemsService = {
  async listForUser(userId: string): Promise<ItemDto[]> {
    return itemsRepo.listByOwner(userId);
  },

  async getById(id: string): Promise<ItemDto> {
    const item = await itemsRepo.findById(id);
    if (!item) throw new DomainError("Stavka nije pronađena");
    return item;
  },

  async create(userId: string, title: string, description?: string): Promise<ItemDto> {
    const item = await itemsRepo.create({
      ownerId: userId,
      title,
      description: description ?? null,
    });
    await eventsService.log(userId, "item_created", item.title);
    return item;
  },

  async update(
    userId: string,
    itemId: string,
    patch: { title?: string; description?: string | null },
  ): Promise<void> {
    const item = await itemsRepo.findById(itemId);
    if (!item) throw new DomainError("Stavka nije pronađena");
    if (item.ownerId !== userId) throw new DomainError("Nemate dozvolu za ovu akciju");

    await itemsRepo.update(itemId, patch);
    await eventsService.log(userId, "item_updated", item.title);
  },

  async setStatus(userId: string, itemId: string, status: "active" | "done" | "archived"): Promise<void> {
    const item = await itemsRepo.findById(itemId);
    if (!item) throw new DomainError("Stavka nije pronađena");
    if (item.ownerId !== userId) throw new DomainError("Nemate dozvolu za ovu akciju");

    await itemsRepo.update(itemId, { status });
    await eventsService.log(userId, "item_status_changed", `${item.title} → ${status}`);
  },

  async delete(userId: string, itemId: string): Promise<void> {
    const item = await itemsRepo.findById(itemId);
    if (!item) throw new DomainError("Stavka nije pronađena");
    if (item.ownerId !== userId) throw new DomainError("Nemate dozvolu za ovu akciju");

    await itemsRepo.delete(itemId);
    await eventsService.log(userId, "item_deleted", item.title);
  },
};
