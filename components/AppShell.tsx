import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/auth-config";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/dashboard" className="font-semibold">Career Copilot</Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/analyze">Analyze</Link>
            <Link href="/history">History</Link>
            {isClerkConfigured ? <UserButton /> : <span className="text-amber-700">Preview</span>}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
