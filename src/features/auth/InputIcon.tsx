import type { ReactNode } from "react";

/* Ikonica unutar input polja (kao /ui login) — roditelj mora biti `relative`, input `pl-10`. */
export function InputIcon({ icon }: { icon: ReactNode }) {
  return (
    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-300 pointer-events-none z-1">
      {icon}
    </span>
  );
}
