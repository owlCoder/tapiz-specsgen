import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { itemsService } from "@/application/items.service";
import { ItemsView } from "@/features/items/ItemsView";

export default async function ItemsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const items = await itemsService.listForUser(session.user.id);
  return <ItemsView items={items} />;
}
