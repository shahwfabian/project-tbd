import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Project TBD · Quantitative Trading Lab", description: "A reproducible options market-making laboratory." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
