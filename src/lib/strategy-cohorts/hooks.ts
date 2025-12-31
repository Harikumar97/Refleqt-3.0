/**
 * React Query hooks for Strategy Cohorts API
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  StrategyCohort,
  CohortCompetitor,
  CreateCohortRequest,
  UpdateCohortRequest,
  AddCompetitorRequest,
  CompetitorDiscoveryRequest,
  CompetitorDiscoveryResponse,
  GetCohortResponse,
  ListCohortsResponse,
} from "./types";

// ============================================================================
// Query Keys
// ============================================================================

export const cohortKeys = {
  all: ["strategy-cohorts"] as const,
  lists: () => [...cohortKeys.all, "list"] as const,
  list: (filters: string) => [...cohortKeys.lists(), { filters }] as const,
  details: () => [...cohortKeys.all, "detail"] as const,
  detail: (id: string) => [...cohortKeys.details(), id] as const,
  competitors: (cohortId: string) =>
    [...cohortKeys.detail(cohortId), "competitors"] as const,
};

// ============================================================================
// Cohort Queries
// ============================================================================

/**
 * List all cohorts with optional filtering
 */
export function useListCohorts(params?: {
  status?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: cohortKeys.list(JSON.stringify(params || {})),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.set("status", params.status);
      if (params?.limit) searchParams.set("limit", params.limit.toString());
      if (params?.offset) searchParams.set("offset", params.offset.toString());

      const response = await fetch(
        `/api/strategy-cohorts?${searchParams.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch cohorts");
      }

      return response.json() as Promise<ListCohortsResponse>;
    },
  });
}

/**
 * Get a single cohort with all related data
 */
export function useGetCohort(cohortId: string | null) {
  return useQuery({
    queryKey: cohortKeys.detail(cohortId || ""),
    queryFn: async () => {
      if (!cohortId) throw new Error("Cohort ID is required");

      const response = await fetch(`/api/strategy-cohorts/${cohortId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch cohort");
      }

      return response.json() as Promise<GetCohortResponse>;
    },
    enabled: !!cohortId,
  });
}

/**
 * Get competitors for a cohort
 */
export function useGetCompetitors(cohortId: string | null) {
  return useQuery({
    queryKey: cohortKeys.competitors(cohortId || ""),
    queryFn: async () => {
      if (!cohortId) throw new Error("Cohort ID is required");

      const response = await fetch(
        `/api/strategy-cohorts/${cohortId}/competitors`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch competitors");
      }

      const data = await response.json();
      return data.competitors as CohortCompetitor[];
    },
    enabled: !!cohortId,
  });
}

// ============================================================================
// Cohort Mutations
// ============================================================================

/**
 * Create a new cohort
 */
export function useCreateCohort() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCohortRequest) => {
      const response = await fetch("/api/strategy-cohorts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create cohort");
      }

      const result = await response.json();
      return result.cohort as StrategyCohort;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cohortKeys.lists() });
    },
  });
}

/**
 * Update a cohort
 */
export function useUpdateCohort(cohortId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateCohortRequest) => {
      const response = await fetch(`/api/strategy-cohorts/${cohortId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update cohort");
      }

      const result = await response.json();
      return result.cohort as StrategyCohort;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cohortKeys.detail(cohortId) });
      queryClient.invalidateQueries({ queryKey: cohortKeys.lists() });
    },
  });
}

/**
 * Delete a cohort
 */
export function useDeleteCohort() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cohortId: string) => {
      const response = await fetch(`/api/strategy-cohorts/${cohortId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete cohort");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cohortKeys.lists() });
    },
  });
}

// ============================================================================
// Competitor Mutations
// ============================================================================

/**
 * Add a competitor to a cohort
 */
export function useAddCompetitor(cohortId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddCompetitorRequest) => {
      const response = await fetch(
        `/api/strategy-cohorts/${cohortId}/competitors`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add competitor");
      }

      const result = await response.json();
      return result.competitor as CohortCompetitor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: cohortKeys.competitors(cohortId),
      });
      queryClient.invalidateQueries({ queryKey: cohortKeys.detail(cohortId) });
    },
  });
}

/**
 * Remove a competitor from a cohort
 */
export function useRemoveCompetitor(cohortId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (competitorId: string) => {
      const response = await fetch(
        `/api/strategy-cohorts/${cohortId}/competitors/${competitorId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove competitor");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: cohortKeys.competitors(cohortId),
      });
      queryClient.invalidateQueries({ queryKey: cohortKeys.detail(cohortId) });
    },
  });
}

/**
 * Discover competitors using AI
 */
export function useDiscoverCompetitors() {
  return useMutation({
    mutationFn: async (data: CompetitorDiscoveryRequest) => {
      const response = await fetch("/api/strategy-cohorts/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to discover competitors");
      }

      return response.json() as Promise<CompetitorDiscoveryResponse>;
    },
  });
}

// ============================================================================
// Execution Hook (with SSE support)
// ============================================================================

/**
 * Execute cohort analysis with real-time progress updates
 */
export function useExecuteCohort(cohortId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      onProgress,
    }: {
      onProgress?: (
        stage: string,
        progress: number,
        description: string
      ) => void;
    }) => {
      const response = await fetch(
        `/api/strategy-cohorts/${cohortId}/execute`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to start execution");
      }

      // Read Server-Sent Events stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let result = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));

            if (data.type === "progress" && onProgress) {
              onProgress(data.stage, data.progress, data.description);
            } else if (data.type === "complete") {
              result = data.result;
            } else if (data.type === "error") {
              throw new Error(data.error);
            }
          }
        }
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cohortKeys.detail(cohortId) });
      queryClient.invalidateQueries({ queryKey: cohortKeys.lists() });
    },
  });
}
