/**
 * Export API - Generate cohort analysis in various formats
 * POST /api/strategy-cohorts/[cohortId]/export
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

type ExportFormat = "pdf" | "excel" | "pptx" | "json" | "csv";

interface ExportOptions {
  includeSources: boolean;
  includeCharts: boolean;
  includeInsights: boolean;
  includeRecommendations: boolean;
  includeCompetitors: boolean;
  includeMetadata: boolean;
}

interface ExportRequest {
  format: ExportFormat;
  options: ExportOptions;
}

/**
 * POST /api/strategy-cohorts/[cohortId]/export
 * Export cohort analysis in specified format
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { cohortId: string } }
) {
  try {
    // TODO: Get userId from session/auth
    const userId = "demo-user-id";

    const { cohortId } = params;
    const body: ExportRequest = await request.json();
    const { format, options } = body;

    // Verify ownership and fetch cohort with all data
    const cohort = await prisma.strategyCohort.findFirst({
      where: { id: cohortId, userId },
      include: {
        competitors: {
          orderBy: { createdAt: "asc" },
        },
        contexts: {
          orderBy: { createdAt: "asc" },
        },
        insights: {
          orderBy: { rank: "asc" },
        },
      },
    });

    if (!cohort) {
      return NextResponse.json({ error: "Cohort not found" }, { status: 404 });
    }

    // Generate export based on format
    let exportData: string | object;
    let contentType: string;
    let filename: string;

    switch (format) {
      case "json":
        exportData = generateJSONExport(cohort, options);
        contentType = "application/json";
        filename = `${cohort.name}-export.json`;
        break;

      case "csv":
        exportData = generateCSVExport(cohort, options);
        contentType = "text/csv";
        filename = `${cohort.name}-export.csv`;
        break;

      case "pdf":
        // TODO: Implement PDF generation (requires pdf library like pdfkit or puppeteer)
        exportData = generateJSONExport(cohort, options); // Fallback to JSON for now
        contentType = "application/json";
        filename = `${cohort.name}-export.json`;
        break;

      case "excel":
        // TODO: Implement Excel generation (requires library like exceljs)
        exportData = generateCSVExport(cohort, options); // Fallback to CSV for now
        contentType = "text/csv";
        filename = `${cohort.name}-export.csv`;
        break;

      case "pptx":
        // TODO: Implement PowerPoint generation (requires library like pptxgenjs)
        exportData = generateJSONExport(cohort, options); // Fallback to JSON for now
        contentType = "application/json";
        filename = `${cohort.name}-export.json`;
        break;

      default:
        return NextResponse.json(
          { error: "Unsupported export format" },
          { status: 400 }
        );
    }

    // Return file as downloadable blob
    const content =
      typeof exportData === "string"
        ? exportData
        : JSON.stringify(exportData, null, 2);

    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export failed:", error);

    return NextResponse.json(
      {
        error: "Export failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Generate JSON export
 */
function generateJSONExport(cohort: any, options: ExportOptions) {
  const exportData: any = {
    cohort: {
      id: cohort.id,
      name: cohort.name,
      description: cohort.description,
      analysisType: cohort.analysisType,
      query: cohort.query,
      status: cohort.status,
    },
  };

  if (options.includeCompetitors && cohort.competitors) {
    exportData.competitors = cohort.competitors.map((c: any) => ({
      id: c.id,
      name: c.name,
      url: c.url,
      description: c.description,
      discoveredData: c.discoveredData,
    }));
  }

  if (options.includeInsights && cohort.insights) {
    exportData.insights = cohort.insights.map((i: any) => ({
      id: i.id,
      title: i.title,
      content: i.content,
      category: i.category,
      confidence: i.confidence,
      rank: i.rank,
      sources: options.includeSources ? i.sources : undefined,
    }));
  }

  if (options.includeMetadata) {
    exportData.metadata = {
      createdAt: cohort.createdAt,
      updatedAt: cohort.updatedAt,
      completedAt: cohort.completedAt,
      includeFinancial: cohort.includeFinancial,
      includeSocial: cohort.includeSocial,
      includeTech: cohort.includeTech,
      includeSentiment: cohort.includeSentiment,
    };
  }

  return exportData;
}

/**
 * Generate CSV export
 */
function generateCSVExport(cohort: any, options: ExportOptions): string {
  const lines: string[] = [];

  // Header
  lines.push(`"Cohort Analysis Export: ${cohort.name}"`);
  lines.push(`"Generated: ${new Date().toISOString()}"`);
  lines.push("");

  // Cohort Info
  lines.push('"Cohort Information"');
  lines.push(`"Name","${cohort.name}"`);
  lines.push(`"Description","${cohort.description || ""}"`);
  lines.push(`"Analysis Type","${cohort.analysisType}"`);
  lines.push(`"Query","${cohort.query || ""}"`);
  lines.push(`"Status","${cohort.status}"`);
  lines.push("");

  // Competitors
  if (options.includeCompetitors && cohort.competitors?.length > 0) {
    lines.push('"Competitors"');
    lines.push('"Name","URL","Description"');
    cohort.competitors.forEach((c: any) => {
      lines.push(`"${c.name}","${c.url || ""}","${c.description || ""}"`);
    });
    lines.push("");
  }

  // Insights
  if (options.includeInsights && cohort.insights?.length > 0) {
    lines.push('"Insights"');
    lines.push('"Title","Category","Confidence","Content"');
    cohort.insights.forEach((i: any) => {
      const content = i.content.replace(/"/g, '""'); // Escape quotes
      lines.push(`"${i.title}","${i.category}","${i.confidence}","${content}"`);
    });
    lines.push("");
  }

  return lines.join("\n");
}
