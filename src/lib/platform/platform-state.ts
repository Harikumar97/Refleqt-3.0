/**
 * Platform-wide State Management
 * Manages global state across Strategy Cohorts and other platform components
 * Uses Zustand for simple, performant state management
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

// ============================================================================
// Types
// ============================================================================

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  timestamp: Date;
  duration?: number; // Auto-dismiss duration in ms (default: 4000)
}

export interface BroadcastEvent {
  type: string;
  payload: any;
  timestamp: number;
}

export interface ActiveAnalysis {
  cohortId: string;
  cohortName: string;
  status: "analyzing" | "completed" | "failed";
  progress: number;
  stage: string;
  startedAt: Date;
}

// ============================================================================
// Platform State Interface
// ============================================================================

interface PlatformState {
  // Active cohort tracking
  activeCohortId: string | null;
  setActiveCohort: (id: string | null) => void;

  // Active analyses
  activeAnalyses: Map<string, ActiveAnalysis>;
  startAnalysis: (analysis: Omit<ActiveAnalysis, "timestamp">) => void;
  updateAnalysis: (cohortId: string, update: Partial<ActiveAnalysis>) => void;
  completeAnalysis: (cohortId: string) => void;
  failAnalysis: (cohortId: string, error: string) => void;

  // Cross-component event broadcasting
  broadcasts: Map<string, Array<(payload: any) => void>>;
  broadcast: (type: string, payload: any) => void;
  subscribe: (type: string, callback: (payload: any) => void) => () => void;

  // Platform-wide notifications
  notifications: Notification[];
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp">
  ) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  // Platform stats (updated from various components)
  stats: {
    totalCohorts: number;
    totalAnalyses: number;
    avgConfidence: number;
    avgTime: number;
    competitorsTracked: number;
  };
  updateStats: (stats: Partial<PlatformState["stats"]>) => void;

  // UI state
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Recent activity
  recentActivity: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: Date;
    icon: string;
  }>;
  addActivity: (
    activity: Omit<PlatformState["recentActivity"][0], "id" | "timestamp">
  ) => void;
}

// ============================================================================
// Store Implementation
// ============================================================================

export const usePlatformState = create<PlatformState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        activeCohortId: null,
        activeAnalyses: new Map(),
        broadcasts: new Map(),
        notifications: [],
        stats: {
          totalCohorts: 0,
          totalAnalyses: 0,
          avgConfidence: 0,
          avgTime: 0,
          competitorsTracked: 0,
        },
        sidebarCollapsed: false,
        recentActivity: [],

        // Cohort management
        setActiveCohort: (id) => {
          set({ activeCohortId: id });
          get().broadcast("cohort-activated", { cohortId: id });
        },

        // Analysis tracking
        startAnalysis: (analysis) => {
          const activeAnalyses = new Map(get().activeAnalyses);
          activeAnalyses.set(analysis.cohortId, {
            ...analysis,
            startedAt: new Date(),
          });
          set({ activeAnalyses });

          get().addActivity({
            type: "analysis-started",
            message: `Analysis started for ${analysis.cohortName}`,
            icon: "🚀",
          });

          get().broadcast("analysis-started", analysis);
        },

        updateAnalysis: (cohortId, update) => {
          const activeAnalyses = new Map(get().activeAnalyses);
          const current = activeAnalyses.get(cohortId);
          if (current) {
            activeAnalyses.set(cohortId, { ...current, ...update });
            set({ activeAnalyses });
            get().broadcast("analysis-progress", { cohortId, ...update });
          }
        },

        completeAnalysis: (cohortId) => {
          const activeAnalyses = new Map(get().activeAnalyses);
          const analysis = activeAnalyses.get(cohortId);
          if (analysis) {
            activeAnalyses.delete(cohortId);
            set({ activeAnalyses });

            get().addActivity({
              type: "analysis-completed",
              message: `Analysis completed for ${analysis.cohortName}`,
              icon: "✅",
            });

            get().addNotification({
              type: "success",
              message: `Analysis completed for ${analysis.cohortName}!`,
            });

            get().broadcast("analysis-completed", { cohortId, analysis });

            // Update stats
            const currentStats = get().stats;
            get().updateStats({
              totalAnalyses: currentStats.totalAnalyses + 1,
            });
          }
        },

        failAnalysis: (cohortId, error) => {
          const activeAnalyses = new Map(get().activeAnalyses);
          const analysis = activeAnalyses.get(cohortId);
          if (analysis) {
            activeAnalyses.delete(cohortId);
            set({ activeAnalyses });

            get().addActivity({
              type: "analysis-failed",
              message: `Analysis failed for ${analysis.cohortName}`,
              icon: "❌",
            });

            get().addNotification({
              type: "error",
              message: `Analysis failed: ${error}`,
            });

            get().broadcast("analysis-failed", { cohortId, error });
          }
        },

        // Event broadcasting
        broadcast: (type, payload) => {
          const subscribers = get().broadcasts.get(type) || [];
          subscribers.forEach((callback) => {
            try {
              callback(payload);
            } catch (error) {
              console.error(
                `Error in broadcast subscriber for ${type}:`,
                error
              );
            }
          });
        },

        subscribe: (type, callback) => {
          const broadcasts = new Map(get().broadcasts);
          const current = broadcasts.get(type) || [];
          broadcasts.set(type, [...current, callback]);
          set({ broadcasts });

          // Return unsubscribe function
          return () => {
            const broadcasts = new Map(get().broadcasts);
            const current = broadcasts.get(type) || [];
            broadcasts.set(
              type,
              current.filter((cb) => cb !== callback)
            );
            set({ broadcasts });
          };
        },

        // Notifications
        addNotification: (notification) => {
          const newNotification: Notification = {
            ...notification,
            id: `notif-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            timestamp: new Date(),
            duration: notification.duration || 4000,
          };

          set({
            notifications: [...get().notifications, newNotification],
          });

          // Auto-remove after duration
          if (newNotification.duration && newNotification.duration > 0) {
            setTimeout(() => {
              get().removeNotification(newNotification.id);
            }, newNotification.duration);
          }
        },

        removeNotification: (id) => {
          set({
            notifications: get().notifications.filter((n) => n.id !== id),
          });
        },

        clearNotifications: () => {
          set({ notifications: [] });
        },

        // Stats management
        updateStats: (stats) => {
          set({
            stats: {
              ...get().stats,
              ...stats,
            },
          });
          get().broadcast("stats-updated", stats);
        },

        // UI state
        toggleSidebar: () => {
          set({ sidebarCollapsed: !get().sidebarCollapsed });
        },

        // Activity tracking
        addActivity: (activity) => {
          const newActivity = {
            ...activity,
            id: `activity-${Date.now()}`,
            timestamp: new Date(),
          };

          const recentActivity = [newActivity, ...get().recentActivity].slice(
            0,
            50
          ); // Keep last 50
          set({ recentActivity });
        },
      }),
      {
        name: "refleqt-platform-state",
        partialize: (state) => ({
          // Only persist certain fields
          sidebarCollapsed: state.sidebarCollapsed,
          stats: state.stats,
        }),
      }
    ),
    { name: "Refleqt Platform State" }
  )
);

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Hook to access only notifications
 */
export const useNotifications = () => {
  return usePlatformState((state) => ({
    notifications: state.notifications,
    addNotification: state.addNotification,
    removeNotification: state.removeNotification,
    clearNotifications: state.clearNotifications,
  }));
};

/**
 * Hook to access only stats
 */
export const usePlatformStats = () => {
  return usePlatformState((state) => ({
    stats: state.stats,
    updateStats: state.updateStats,
  }));
};

/**
 * Hook to access active analyses
 */
export const useActiveAnalyses = () => {
  return usePlatformState((state) => ({
    activeAnalyses: state.activeAnalyses,
    startAnalysis: state.startAnalysis,
    updateAnalysis: state.updateAnalysis,
    completeAnalysis: state.completeAnalysis,
    failAnalysis: state.failAnalysis,
  }));
};

/**
 * Hook to access event broadcasting
 */
export const useBroadcast = () => {
  return usePlatformState((state) => ({
    broadcast: state.broadcast,
    subscribe: state.subscribe,
  }));
};
