"use client";

import "../globals.css";
import axios, { AxiosError } from "axios";
import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

interface LoginLayoutProps {
  children: ReactNode;
}

interface AuthResponse {
  user: unknown; // You can replace `unknown` with your actual User type
  error: string | null;
}

export default function LoginLayout({
  children,
}: LoginLayoutProps): JSX.Element {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const { user, error } = await getAuth();

        if (user && !error) {
          router.push("/dashboard");
          return;
        }
        setIsAuthenticated(false);
      } catch (err) {
        console.error("Auth check failed:", err);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center w-screen">
        <div className="h-full w-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-gray-900" />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${inter.className}`}>
      {children}
    </div>
  );
}

async function getAuth(): Promise<AuthResponse> {
  try {
    const { data } = await axios.get("/api/auth/showme");
    return { user: data, error: null };
  } catch (err: unknown) {
    const error = err as AxiosError<{ message?: string }>;
    console.error("Auth request failed:", error);
    return {
      user: null,
      error: error.response?.data?.message || "Authentication failed",
    };
  }
}
