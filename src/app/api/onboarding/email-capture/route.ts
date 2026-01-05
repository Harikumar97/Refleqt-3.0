/**
 * Email Capture API Endpoint
 * Handles early access and newsletter signups
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// Webhook configuration - can be set via environment variables
const N8N_EMAIL_WEBHOOK_URL = process.env["N8N_EMAIL_WEBHOOK_URL"];

interface EmailCaptureData {
  email: string;
  type: "early_access" | "newsletter";
  source?: string;
}

/**
 * POST /api/onboarding/email-capture
 * Captures email for early access or newsletter
 */
export async function POST(request: NextRequest) {
  try {
    const data: EmailCaptureData = await request.json();

    // Validate email
    if (!data.email || !isValidEmail(data.email)) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    // Check if email already captured
    const existingCapture = await prisma.emailCapture.findUnique({
      where: { email: data.email },
    });

    if (existingCapture) {
      // Email already captured, just return success
      return NextResponse.json({
        success: true,
        message: "You're already on our list!",
        isExisting: true,
      });
    }

    // Create email capture record
    const capture = await prisma.emailCapture.create({
      data: {
        email: data.email,
        type: data.type,
        source: data.source || "unknown",
      },
    });

    // Send to n8n webhook if configured
    if (N8N_EMAIL_WEBHOOK_URL) {
      try {
        await fetch(N8N_EMAIL_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: data.type,
            email: data.email,
            source: data.source || "unknown",
            captureId: capture.id,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (webhookError) {
        // Log but don't fail the request if webhook fails
        console.error("n8n webhook error:", webhookError);
      }
    }

    return NextResponse.json({
      success: true,
      message:
        data.type === "early_access"
          ? "Thank you! We'll notify you when we launch."
          : "Successfully subscribed to newsletter!",
      isExisting: false,
    });
  } catch (error) {
    console.error("Email capture error:", error);
    return NextResponse.json(
      { error: "Failed to capture email" },
      { status: 500 }
    );
  }
}

/**
 * Simple email validation
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
