"use client";

/**
 * User Context Provider
 * Manages authenticated user data and profile information from backend
 *
 * Backend Integration:
 * - Fetches from: GET /api/user/profile
 * - Returns: User + UserProfile from Prisma
 * - Updates: Refetches on demand
 *
 * Data Sources:
 * - user.name → Prisma User.name
 * - user.email → Prisma User.email
 * - profile.companyName → Prisma UserProfile.companyName
 * - profile.industry → Prisma UserProfile.industry
 * - profile.obsessionScore → Prisma UserProfile.obsessionScore (Decimal 0.0-10.0)
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";

// ============================================================================
// Types (aligned with Prisma schema)
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string; // ISO 8601
}

export interface UserProfile {
  id: string;
  companyName: string;
  industry: string;
  businessChallenge?: string | null;
  obsessionScore: number; // Decimal(3,1) → 0.0 to 10.0
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface UserContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

// ============================================================================
// Context
// ============================================================================

const UserContext = createContext<UserContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loading = status === "loading";

  /**
   * Fetch user profile from backend
   * Called when session is available
   */
  const fetchUserProfile = useCallback(async () => {
    if (!session?.user) {
      // Development fallback when not authenticated
      if (process.env.NODE_ENV === "development") {
        console.warn("[UserContext] No session - using development fallback");
        setUser({
          id: "00000000-0000-0000-0000-000000000001",
          email: "dev@refleqt.local",
          name: "Development User",
          createdAt: new Date().toISOString(),
        });
        setProfile({
          id: "00000000-0000-0000-0000-000000000001",
          companyName: "Demo Company",
          industry: "Technology",
          businessChallenge: null,
          obsessionScore: 8.5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else {
        setUser(null);
        setProfile(null);
      }
      return;
    }

    try {
      setError(null);

      const response = await fetch("/api/user/profile");

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setUser(result.data.user);
        setProfile(result.data.profile);
      } else {
        throw new Error(result.error ?? "Failed to load user profile");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      console.error("[UserContext] Failed to fetch user profile:", err);
    }
  }, [session]);

  /**
   * Update user profile
   * Optimistic UI update with rollback on error
   */
  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!profile) {
        throw new Error("No profile loaded");
      }

      // Store previous state for rollback
      const previousProfile = profile;

      try {
        // Optimistic update
        setProfile({ ...profile, ...updates });

        const response = await fetch("/api/user/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success) {
          setProfile(result.data.profile);
        } else {
          throw new Error(result.error ?? "Failed to update profile");
        }
      } catch (err) {
        // Rollback on error
        setProfile(previousProfile);
        const message = err instanceof Error ? err.message : "Update failed";
        setError(message);
        throw err; // Re-throw for caller to handle
      }
    },
    [profile]
  );

  // Fetch profile when session becomes available
  useEffect(() => {
    if (session?.user) {
      fetchUserProfile();
    }
  }, [session, fetchUserProfile]);

  const value: UserContextValue = {
    user,
    profile,
    loading,
    error,
    refetch: fetchUserProfile,
    updateProfile,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to access user context
 * Must be used within UserProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, profile, loading } = useUser();
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (!user) return <div>Not logged in</div>;
 *
 *   return <div>Welcome, {user.name}!</div>;
 * }
 * ```
 */
export function useUser(): UserContextValue {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }

  return context;
}
