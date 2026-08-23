import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return apiResponse.error("Unauthorized", 401);
    }

    const tickets = await prisma.supportTicket.findMany({
      where: { userId: currentUser.id },
      orderBy: { createdAt: "desc" },
    });

    const feedback = await prisma.communityFeedback.findMany({
      where: { userId: currentUser.id },
      orderBy: { createdAt: "desc" },
    });

    return apiResponse.success({ tickets, feedback });
  } catch (error) {
    console.error("Support GET Error:", error);
    return apiResponse.error("Failed to fetch support data", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return apiResponse.error("Unauthorized", 401);
    }

    const body = await req.json();
    const { type, subject, category, priority, message } = body;

    if (!subject || !message) {
      return apiResponse.error("Subject and message are required", 400);
    }

    if (type === "FEEDBACK") {
      const fb = await prisma.communityFeedback.create({
        data: {
          userId: currentUser.id,
          feedbackType: category || "SUGGESTION",
          subject,
          message,
          status: "OPEN",
        },
      });
      return apiResponse.success(fb, 201);
    } else {
      const ticket = await prisma.supportTicket.create({
        data: {
          userId: currentUser.id,
          subject,
          category: category || "GENERAL",
          priority: priority || "NORMAL",
          message,
          status: "OPEN",
        },
      });
      return apiResponse.success(ticket, 201);
    }
  } catch (error) {
    console.error("Support POST Error:", error);
    return apiResponse.error("Failed to create support ticket", 500);
  }
}
