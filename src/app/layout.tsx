import type { Metadata } from "next";
import "./globals.css";
import { FamilyProvider } from "@/lib/state-context";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";

export const metadata: Metadata = {
  title: "OBEFF IMS | Family Information Management System",
  description: "Official private records, visual family tree, and verified announcements for the OBEFF family lineage.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#f8faf9] text-slate-800 flex flex-col selection:bg-emerald-200 selection:text-emerald-900 pb-16 md:pb-0">
        <FamilyProvider>
          <Navbar />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <BottomNav />
        </FamilyProvider>
      </body>
    </html>
  );
}
