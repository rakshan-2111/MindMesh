import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MindMesh | Distributed Optimization & DAA Control Center",
  description: "Live DAA Optimization Engine & Multi-Device Control Center (Priority Queue, Greedy, 0/1 Knapsack, Dijkstra, TSP)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#07090e] text-slate-100 selection:bg-emerald-500/25 selection:text-emerald-300 relative">
        {/* Subtle Ambient Background Mesh */}
        <div className="fixed inset-0 pointer-events-none mesh-glow-emerald z-0" />
        <div className="fixed inset-0 pointer-events-none mesh-glow-indigo z-0" />
        <div className="fixed inset-0 pointer-events-none mesh-grid-pattern z-0 opacity-70" />

        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="border-t border-white/[0.06] bg-[#07090e]/90 backdrop-blur-md py-4 text-center text-xs text-slate-500 font-mono">
            MindMesh &bull; Design & Analysis of Algorithms Project (DAA) &bull; Distributed Food Redistribution
          </footer>
        </div>
      </body>
    </html>
  );
}
