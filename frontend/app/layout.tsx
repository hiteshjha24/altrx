import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AltRx — Find Affordable Medicine Alternatives",
  description:
    "Upload your prescription or search by brand name to find affordable generic alternatives with identical active ingredients.",
  keywords: ["generic medicines", "medicine alternatives", "cheap medicines", "Jan Aushadhi"],
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
