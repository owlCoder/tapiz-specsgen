import Link from "next/link";
import { AuthLeftPanel } from "@/features/auth/AuthLeftPanel";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";
import appConfig from "@/app.config";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-page min-h-screen flex">
      <AuthLeftPanel />
      <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
        <div className="lg:hidden mb-8 text-center">
          <Link href="/" className="font-display text-2xl font-bold tracking-tight">
            {appConfig.shortName}
          </Link>
        </div>
        {children}
      </main>
    </div>
  );
}
