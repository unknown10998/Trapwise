import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { AuthProvider } from "@/components/AuthProvider";
import { Onboarding } from "@/components/Onboarding";
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
      <body><AuthProvider><Header /><Onboarding />{children}</AuthProvider></body>
    </html>
  );
}
