import Link from "next/link";
import { FileUser } from "lucide-react";

export function Brand() {
  return (
    <Link href="/" className="group inline-flex items-center gap-3" aria-label="AI Resume Match Analyzer home">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20 transition group-hover:-translate-y-0.5">
        <FileUser className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="hidden leading-tight sm:block">
        <span className="block text-sm font-bold tracking-tight text-slate-950">AI Resume</span>
        <span className="block text-xs font-medium text-slate-500">Match Analyzer</span>
      </span>
    </Link>
  );
}
