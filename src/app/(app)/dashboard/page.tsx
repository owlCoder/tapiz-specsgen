import { auth } from "@/lib/auth";
import { getDict } from "@/i18n/server";

export default async function DashboardPage() {
  const session = await auth();
  const dict = await getDict();

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-txt-1">{dict.nav.home}</h1>
      <p className="mt-2 text-sm text-txt-3">Dobrodošli, {session?.user?.name ?? "korisnik"}.</p>
    </div>
  );
}
