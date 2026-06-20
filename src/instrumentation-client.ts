// Next.js client instrumentation entrypoint. Runs early in the browser before
// the app renders, so window.onerror / unhandledrejection are captured from the
// start. init() installs the global handlers automatically.
import { initTelemetry } from "@/lib/telemetry";

initTelemetry();
