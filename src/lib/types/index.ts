/**
 * Shared Types - Central Export
 * Single import point for all platform-wide shared types
 */

// Re-export all Brewery types
export * from "./brewery";

// Re-export types from other modules for convenience
export type {
  CohortInsight,
  CohortCompetitor,
  StrategyCohort,
} from "@/lib/strategy-cohorts/types";
export type {
  SynthesizedInsight,
  SwarmResult,
} from "@/lib/research-swarm/types";
