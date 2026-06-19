import { usersService } from "../src/application/users.service";
import { itemsService } from "../src/application/items.service";

async function main() {
  // 1. klasična registracija
  const stamp = Date.now();
  const user = await usersService.register({
    firstName: "Petar", lastName: "Đorđević",
    email: `petar.smoke.${stamp}@example.com`, password: "lozinka123",
  });
  console.log("user:", user.email);

  // duplikat emaila
  try {
    await usersService.register({ firstName: "Ana", lastName: "Anić", email: user.email, password: "lozinka123" });
    throw new Error("duplikat FAIL");
  } catch (e) { console.log("duplikat emaila odbijen:", (e as Error).message); }

  // 2. create item
  const item = await itemsService.create(user.id, "Smoke stavka", "opis");
  console.log("item:", item.id, item.title, item.status);

  // 3. update item
  await itemsService.update(user.id, item.id, { title: "Smoke stavka (izmenjena)", description: "novi opis" });
  const updated = await itemsService.getById(item.id);
  if (updated.title !== "Smoke stavka (izmenjena)") throw new Error("update FAIL");
  console.log("update OK:", updated.title);

  // 4. setStatus
  await itemsService.setStatus(user.id, item.id, "done");
  const done = await itemsService.getById(item.id);
  if (done.status !== "done") throw new Error("setStatus FAIL");
  console.log("setStatus OK:", done.status);

  // 5. list — treba 1 item
  const list = await itemsService.listForUser(user.id);
  if (list.length !== 1) throw new Error(`listForUser FAIL: očekivano 1, dobijeno ${list.length}`);
  console.log("list OK:", list.length);

  // 6. ownership check — drugi korisnik ne može da menja
  const other = await usersService.register({
    firstName: "Mila", lastName: "Šarić",
    email: `mila.smoke.${stamp}@example.com`, password: "lozinka123",
  });
  try {
    await itemsService.update(other.id, item.id, { title: "HACK" });
    throw new Error("ownership FAIL");
  } catch (e) { console.log("ownership check OK:", (e as Error).message); }

  // 7. delete
  await itemsService.delete(user.id, item.id);
  const afterDelete = await itemsService.listForUser(user.id);
  if (afterDelete.length !== 0) throw new Error("delete FAIL");
  console.log("delete OK");

  console.log("SMOKE OK");
}
main().then(() => process.exit(0)).catch((e) => { console.error("SMOKE FAIL:", e); process.exit(1); });
