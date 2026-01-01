"use client";

/**
 * Client-side Providers
 * Wraps the application with authentication and user context providers
 */

import { SessionProvider } from "next-auth/react";
import { UserProvider } from "@/contexts/UserContext";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <UserProvider>{children}</UserProvider>
    </SessionProvider>
  );
}
