-- Initialize Refleqt Database
-- This script runs automatically when PostgreSQL container starts

-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable uuid-ossp for UUID generation (if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verify extensions
SELECT extname, extversion FROM pg_extension WHERE extname IN ('vector', 'uuid-ossp');

-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS public;
