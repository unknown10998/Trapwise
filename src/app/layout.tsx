import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { AuthProvider } from "@/components/AuthProvider";
import { Onboarding } from "@/components/Onboarding";
import { PageLoadGlint } from "@/components/PageLoadGlint";
import { JudgeDemoProgress } from "@/components/JudgeDemoProgress";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trapwise",
  description: "See the trap. Learn the pattern. Beat the test.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body><a className="skip-link" href="#main-content">Skip to main content</a><PageLoadGlint /><AuthProvider><Header /><JudgeDemoProgress /><Onboarding /><div id="main-content" tabIndex={-1}>{children}</div></AuthProvider></body>
    </html>
  );
}
