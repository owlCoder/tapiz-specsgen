import bcrypt from "bcryptjs";
import type {
  ChangePasswordInput,
  RegisterInput,
  UpdateProfileInput,
} from "@/domain/validation/user.schema";
import type { UserDto } from "@/domain/types";
import { usersRepo } from "@/infrastructure/repositories/users.repo";
import { DomainError } from "./errors";

export const usersService = {
  getById: (id: string) => usersRepo.findById(id),

  async register(input: RegisterInput): Promise<UserDto> {
    const byEmail = await usersRepo.findByEmail(input.email);
    if (byEmail) throw new DomainError("Nalog sa ovim emailom već postoji");
    return usersRepo.create({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      passwordHash: await bcrypt.hash(input.password, 10),
      role: "user",
    });
  },

  async updateMyProfile(userId: string, input: UpdateProfileInput): Promise<UserDto> {
    const existing = await usersRepo.findById(userId);
    if (!existing) throw new DomainError("Korisnik ne postoji");

    const patch: Parameters<typeof usersRepo.update>[1] = {
      firstName: input.firstName,
      lastName: input.lastName,
    };
    if (input.email !== undefined && input.email !== existing.email) {
      if (existing.authProvider !== "local") {
        throw new DomainError("Email naloga povezanog sa Tapiz LMS-om se menja u LMS-u");
      }
      const byEmail = await usersRepo.findByEmail(input.email);
      if (byEmail && byEmail.id !== userId) {
        throw new DomainError("Nalog sa ovim emailom već postoji");
      }
      patch.email = input.email;
    }
    await usersRepo.update(userId, patch);
    return { ...existing, ...patch, email: patch.email ?? existing.email };
  },

  async changeMyPassword(userId: string, input: ChangePasswordInput): Promise<void> {
    const record = await usersRepo.findRecordById(userId);
    if (!record) throw new DomainError("Korisnik ne postoji");
    if (record.authProvider !== "local") {
      throw new DomainError("Lozinkom naloga povezanog sa Tapiz LMS-om upravlja LMS");
    }
    const valid = await bcrypt.compare(input.currentPassword, record.passwordHash);
    if (!valid) throw new DomainError("Trenutna lozinka nije ispravna");
    await usersRepo.update(userId, { passwordHash: await bcrypt.hash(input.newPassword, 10) });
  },
};
