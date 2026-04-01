"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated =
      typeof window !== "undefined" && document.cookie.includes("accessToken");

    if (isAuthenticated) {
      router.replace("/dashboard");
    } else {
      router.replace("/auth/login");
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirecting...</p>
    </div>
  );
}
