import { z } from "zod";

export const NAME_REGEX = /^[A-Za-zČĆŠĐŽčćšđž][A-Za-zČĆŠĐŽčćšđž' -]{0,99}$/;

export const nameSchema = z
  .string()
  .trim()
  .min(1, "Obavezno polje")
  .regex(NAME_REGEX, "Dozvoljena je samo latinica (sa srpskim dijakriticima)");

export const emailSchema = z.string().trim().toLowerCase().email("Neispravan email");

export const passwordSchema = z.string().min(8, "Lozinka mora imati bar 8 znakova");

export const updateProfileSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema.optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Unesite trenutnu lozinku"),
  newPassword: passwordSchema,
});
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
