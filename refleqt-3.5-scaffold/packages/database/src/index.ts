// @refleqt/database - Main export
export { prisma } from './client';
export type { PrismaClient } from '@prisma/client';

// Re-export all Prisma types
export type {
  User,
  UserProfile,
  Account,
  Session,
  Competitor,
  IntelligenceSource,
  IntelligenceItem,
  ResearchGoal,
  SmartTracker,
  ResearchSwarm,
  SwarmFinding,
  SynthesizedInsight,
  KnowledgeNode,
  StrategyCohort,
  CohortAnalysis,
  PsychographicSegment,
  SegmentInsight,
  BreweryOutput,
  ObsessionScore,
} from '@prisma/client';
