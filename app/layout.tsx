import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/auth-config";
import "./globals.css";

export const metadata: Metadata = {
  title: "Career Copilot",
  description: "AI-powered resume analysis for your next opportunity.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const document = (
    <html lang="en">
      <body>{children}</body>
    </html>
  );

  if (!isClerkConfigured) return document;

  return (
    <ClerkProvider>
      {document}
    </ClerkProvider>
  );
}
