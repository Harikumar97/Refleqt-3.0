/**
 * Prisma Client Singleton
 * Ensures single instance across the app with proper configuration for Prisma 7
 * Supports both SQLite (local development) and PostgreSQL (production)
 */

// Load environment variables first
import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";

declare const globalThis: {
  prismaGlobal: PrismaClient | undefined;
} & typeof global;

// Prisma 7 initialization - auto-detects SQLite vs PostgreSQL
const prismaClientSingleton = () => {
  const databaseUrl = process.env["DATABASE_URL"];

  // Check if using SQLite (local development)
  if (databaseUrl?.startsWith("file:")) {
    // SQLite - use libsql adapter
    try {
      const { PrismaLibSql } = require("@prisma/adapter-libsql");
      const Database = require("better-sqlite3");
      const path = require("path");

      // Convert relative path to absolute
      const dbPath = databaseUrl.replace("file:", "");
      const absolutePath = path.isAbsolute(dbPath) ? dbPath : path.resolve(process.cwd(), dbPath);

      const db = new Database(absolutePath);
      const adapter = new PrismaLibSql(db);

      return new PrismaClient({
        adapter,
        log:
          process.env["NODE_ENV"] === "development" ? ["error", "warn"] : ["error"],
      });
    } catch (error) {
      console.error("Failed to initialize SQLite adapter:", error);
      throw error;
    }
  }

  // PostgreSQL - use adapter (requires @prisma/adapter-pg)
  try {
    const { PrismaPg } = require("@prisma/adapter-pg");
    const { Pool } = require("pg");

    const pool = new Pool({
      connectionString: databaseUrl,
    });

    const adapter = new PrismaPg(pool);

    return new PrismaClient({
      adapter,
      log:
        process.env["NODE_ENV"] === "development" ? ["error", "warn"] : ["error"],
    });
  } catch (error) {
    console.error("Failed to initialize PostgreSQL adapter:", error);
    // Fallback to basic client
    return new PrismaClient({
      log:
        process.env["NODE_ENV"] === "development" ? ["error", "warn"] : ["error"],
    });
  }
};

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env["NODE_ENV"] !== "production") globalThis.prismaGlobal = prisma;
