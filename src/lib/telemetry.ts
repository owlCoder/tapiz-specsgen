// Shared telemetry config for Tapiz Specs. Both the client and server
// instrumentation import init() from here so the project slug / endpoint stay in
// one place.
//
// Env (set in Vercel):
//   NEXT_PUBLIC_TELEMETRY_URL   https://sentinel.tapiz.site/api/ingest
//   NEXT_PUBLIC_TELEMETRY_KEY   ingestKey from `seed:project` (slug "specs")

import { init } from "@tapizlabs/telemetry";

export function initTelemetry(): void {
  const endpoint = process.env.NEXT_PUBLIC_TELEMETRY_URL;
  if (!endpoint) return; // telemetry disabled when unset (e.g. local dev)

  init({
    endpoint,
    project: "specs",
    ingestKey: process.env.NEXT_PUBLIC_TELEMETRY_KEY,
    release: process.env.NEXT_PUBLIC_APP_VERSION,
    environment: process.env.VERCEL_ENV ?? "development",
    // Lower under heavy traffic; 1.0 is fine for the current scale.
    sampleRate: 1,
    // Never ship specification content (courses/modules/scenarios) as context.
    beforeSend(event) {
      if (event.context) {
        delete event.context.course;
        delete event.context.spec;
        delete event.context.modules;
        delete event.context.scenarios;
      }
      return event;
    },
  });
}
