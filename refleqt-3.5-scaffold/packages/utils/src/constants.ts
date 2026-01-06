/**
 * Application Constants
 * Power of Ten: Fixed upper bounds
 */

export const BOUNDS = {
  MAX_ITERATIONS: 10000,
  MAX_FEED_ITEMS: 1000,
  MAX_RESEARCH_ITEMS: 500,
  MAX_COHORT_SIZE: 100,
  MAX_SEARCH_RESULTS: 50,
  MAX_SWARM_AGENTS: 8,
  MAX_INSIGHTS_PER_SWARM: 10,
} as const;

export const SCORE_RANGES = {
  MIN_SCORE: 0,
  MAX_SCORE: 10,
  MIN_CONFIDENCE: 0,
  MAX_CONFIDENCE: 1,
} as const;

export const API_CONFIG = {
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
} as const;

export const SWARM_CONFIG = {
  SMALL_SIZE: 3,
  LARGE_SIZE: 8,
  MAX_EXECUTION_TIME: 300000,
  POLLING_INTERVAL: 2000,
} as const;

export const APP_METADATA = {
  NAME: 'Refleqt',
  TAGLINE: 'Stop Drowning in Data. Start Obsessing Smart.',
  VERSION: '3.5.0',
} as const;
