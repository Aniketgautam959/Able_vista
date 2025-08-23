"use client";

import "../globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

interface LoginLayoutProps {
  children: ReactNode;
}

export default function LoginLayout({
  children,
}: LoginLayoutProps): JSX.Element {
  return (
    <div className={`min-h-screen bg-gray-50 ${inter.className}`}>
      {children}
    </div>
  );
}
