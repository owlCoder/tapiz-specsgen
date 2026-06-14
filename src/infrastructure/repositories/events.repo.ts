import { db } from "@/infrastructure/db/client";
import { appEvents } from "@/infrastructure/db/schema";
import type { EventsRepo, AppEventType } from "@/application/ports";

export const eventsRepo: EventsRepo = {
  async log(actorId: string, type: AppEventType, detail: string): Promise<void> {
    await db.insert(appEvents).values({
      id: crypto.randomUUID(),
      actorId,
      type,
      detail,
    });
  },
};
