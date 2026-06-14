import { z } from "zod";

export const itemSchema = z.object({
  title: z.string().trim().min(1, "Naslov je obavezan").max(255),
  description: z.string().trim().max(5000).optional(),
});
export type ItemInput = z.infer<typeof itemSchema>;

export const itemStatusSchema = z.enum(["active", "done", "archived"]);
