import { eventsRepo } from "@/infrastructure/repositories/events.repo";
import type { AppEventType } from "@/application/ports";

export const eventsService = {
  /** Upisuje događaj; nikad ne baca — swallow grešku da ne pokvari glavnu operaciju. */
  async log(actorId: string, type: AppEventType, detail: string): Promise<void> {
    try {
      await eventsRepo.log(actorId, type, detail);
    } catch (err) {
      console.error("[events]", err);
    }
  },
};
