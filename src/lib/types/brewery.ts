/**
 * Brewery - Shared TypeScript Type Definitions
 * Central type definitions for The Brewery feature
 */

// ============================================================================
// Enums and Union Types
// ============================================================================

export type SourceType =
  | "research-swarm"
  | "strategy-cohort"
  | "intelligence-feed";

export type WriterStatus =
  | "saved"
  | "request-created"
  | "assigned"
  | "in-progress"
  | "completed";

export type Confidence = "high" | "medium" | "low";

export type Platform =
  | "linkedin"
  | "twitter"
  | "instagram"
  | "youtube"
  | "blog"
  | "facebook";

export type ContentType =
  | "article"
  | "thread"
  | "post"
  | "carousel"
  | "video-script"
  | "infographic";

// ============================================================================
// Database Model Types (from Prisma)
// ============================================================================

export interface BreweryItem {
  id: string;
  userId: string;
  title: string;
  content: string;
  excerpt?: string | null;
  sourceType: SourceType;
  sourceId: string;
  sourceName?: string | null;
  category?: string | null;
  confidence?: Confidence | null;
  tags: string[];
  writerStatus: WriterStatus;
  writerRequestId?: string | null;
  savedAt: string | Date;
  updatedAt?: string | Date;
}

export interface WriterRequest {
  id?: string;
  userId?: string;
  token?: string;
  breweryItemIds: string[];
  platform: Platform;
  contentType: ContentType;
  deadline?: string | Date;
  brief?: string;
  status?: "pending" | "assigned" | "in-progress" | "completed" | "cancelled";
  assignedWriterId?: string;
  assignedAt?: Date;
  completedAt?: Date;
  deliverables?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface CreateBreweryItemRequest {
  title: string;
  content: string;
  sourceType: SourceType;
  sourceId: string;
  sourceName?: string;
  category?: string;
  confidence?: Confidence;
  excerpt?: string;
}

export interface CreateBreweryItemResponse {
  success: boolean;
  item: BreweryItem;
}

export interface GetBreweryItemsResponse {
  items: BreweryItem[];
  total: number;
}

export interface CreateWriterRequestRequest {
  breweryItemIds: string[];
  platform: Platform;
  contentType: ContentType;
  deadline?: string;
  brief?: string;
}

export interface CreateWriterRequestResponse {
  success: boolean;
  request: WriterRequest;
  message: string;
}

// ============================================================================
// UI Component Types
// ============================================================================

export interface BreweryCardProps {
  item: BreweryItem;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
}

export interface WriterRequestModalProps {
  selectedItems: Pick<BreweryItem, "id" | "title">[];
  onClose: () => void;
  onSubmit: (request: CreateWriterRequestRequest) => Promise<void>;
}

// ============================================================================
// Filter Types
// ============================================================================

export type BreweryFilterType = "all" | SourceType | WriterStatus;

export interface BreweryFilters {
  sourceType?: SourceType;
  writerStatus?: WriterStatus;
  category?: string;
  confidence?: Confidence;
  search?: string;
}

// ============================================================================
// Stats Types
// ============================================================================

export interface BreweryStats {
  total: number;
  saved: number;
  inProgress: number;
  completed: number;
  bySource?: {
    "research-swarm": number;
    "strategy-cohort": number;
    "intelligence-feed": number;
  };
}
