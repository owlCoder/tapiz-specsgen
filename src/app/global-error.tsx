"use client";

// Catches render errors in the root layout/template. We report to telemetry,
// then render a minimal fallback. Must be a client component and include its
// own <html>/<body> because it replaces the root layout.
import { useEffect } from "react";
import { captureError } from "@tapizlabs/telemetry";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureError(error, { context: { digest: error.digest } });
  }, [error]);

  return (
    <html lang="sr">
      <body style={{ fontFamily: "system-ui", padding: "2rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Došlo je do greške</h1>
        <p style={{ color: "#666", marginTop: "0.5rem" }}>
          Greška je zabeležena. Pokušaj ponovo.
        </p>
        <button
          onClick={() => reset()}
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            background: "#e11d48",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Pokušaj ponovo
        </button>
      </body>
    </html>
  );
}
