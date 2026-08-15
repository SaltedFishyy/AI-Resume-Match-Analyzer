"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { Brand } from "@/components/Brand";
import { isClerkConfigured } from "@/lib/auth-config";

const links = [
  { href: "/analyze", label: "Analyze" },
  { href: "/history", label: "History" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Brand />
        <nav className="flex h-full items-center gap-1 sm:gap-3" aria-label="Primary navigation">
          {links.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex h-full items-center px-3 text-sm font-semibold transition sm:px-4 ${active ? "text-blue-600" : "text-slate-600 hover:text-slate-950"}`}
              >
                {link.label}
                {active && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-blue-600" />}
              </Link>
            );
          })}
          <div className="ml-1 flex items-center sm:ml-3">
            {isClerkConfigured ? (
              <>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="focus-ring rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                      Sign in
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </>
            ) : (
              <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
                Preview
              </span>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
