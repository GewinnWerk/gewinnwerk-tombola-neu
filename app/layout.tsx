import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vereinsglück – Die digitale Tombola",
  description: "Die moderne digitale Tombola für Vereine, Feste und gute Zwecke.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
