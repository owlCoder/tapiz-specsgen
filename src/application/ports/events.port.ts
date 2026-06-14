import type { APP_EVENT_TYPES } from "@/infrastructure/db/schema";

export type AppEventType = (typeof APP_EVENT_TYPES)[number];

export interface EventsRepo {
  log(actorId: string, type: AppEventType, detail: string): Promise<void>;
}
