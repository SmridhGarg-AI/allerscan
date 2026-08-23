import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMINISTRATOR") {
      return apiResponse.error("Forbidden: Admin access required", 403);
    }

    const productReports = await prisma.productReport.findMany({
      include: {
        user: { select: { fullName: true, email: true } },
        product: { select: { name: true, barcode: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const tickets = await prisma.supportTicket.findMany({
      include: {
        user: { select: { fullName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return apiResponse.success({ productReports, tickets });
  } catch (error) {
    console.error("Admin reports GET error:", error);
    return apiResponse.error("Failed to fetch reports", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMINISTRATOR") {
      return apiResponse.error("Forbidden: Admin access required", 403);
    }

    const body = await req.json();
    const { type, id, status, response } = body;

    if (!id || !status) {
      return apiResponse.error("ID and status are required", 400);
    }

    if (type === "PRODUCT_REPORT") {
      const updated = await prisma.productReport.update({
        where: { id },
        data: { status },
      });
      return apiResponse.success(updated);
    } else {
      const updated = await prisma.supportTicket.update({
        where: { id },
        data: {
          status,
          ...(response !== undefined && { response }),
        },
      });
      return apiResponse.success(updated);
    }
  } catch (error) {
    console.error("Admin reports PATCH error:", error);
    return apiResponse.error("Failed to update report status", 500);
  }
}
