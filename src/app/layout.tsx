import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { BrandFooter } from "@/components/BrandFooter";
import { AuthProvider } from "@/components/AuthProvider";
import { Onboarding } from "@/components/Onboarding";
import { RouteLoadingGlint } from "@/components/RouteLoadingGlint";
import { JudgeDemoProgress } from "@/components/JudgeDemoProgress";
import { OfflineStatus } from "@/components/OfflineStatus";
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
      <body><a className="skip-link" href="#main-content">Skip to main content</a><AuthProvider><Header /><OfflineStatus /><JudgeDemoProgress /><Onboarding /><div id="main-content" className="theme-page-canvas" tabIndex={-1}><RouteLoadingGlint>{children}</RouteLoadingGlint></div><BrandFooter /></AuthProvider></body>
    </html>
  );
}
