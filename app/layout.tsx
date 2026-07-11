import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/auth-config";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Resume Match Analyzer",
  description: "Compare your resume with a job description and get practical, rubric-based insights.",
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
