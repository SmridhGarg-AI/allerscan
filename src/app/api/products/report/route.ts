import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return apiResponse.error("Unauthorized", 401);
    }

    const body = await req.json();
    const { productId, reportType, description } = body;

    if (!productId || !reportType || !description) {
      return apiResponse.error("Product ID, report type, and description are required", 400);
    }

    const report = await prisma.productReport.create({
      data: {
        userId: currentUser.id,
        productId,
        reportType,
        description,
        status: "PENDING",
      },
    });

    return apiResponse.success(report, 201);
  } catch (error) {
    console.error("Product report error:", error);
    return apiResponse.error("Failed to submit product report", 500);
  }
}
