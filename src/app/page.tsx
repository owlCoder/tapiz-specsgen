import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LandingPage } from "@/features/landing/LandingPage";

export default async function HomePage() {
  const session = await auth();
  if (session?.user?.id) redirect("/dashboard");
  return <LandingPage />;
}
