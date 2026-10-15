import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import "./design-system.css";

export const metadata: Metadata = {
  title: "QCollect",
  description: "QCollect Field Data Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
