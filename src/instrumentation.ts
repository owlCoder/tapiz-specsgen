// Next.js server/edge instrumentation entrypoint. Runs once when the server
// boots; we install telemetry so uncaught server errors are captured.
import { initTelemetry } from "@/lib/telemetry";

export function register(): void {
  initTelemetry();
}
