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

    const totalUsers = await prisma.user.count();
    const totalProducts = await prisma.product.count();
    const totalScans = await prisma.scanHistory.count();
    const totalOcrScans = await prisma.oCRScan.count();
    const totalVisionScans = await prisma.visionScan.count();
    const pendingReports = await prisma.productReport.count({ where: { status: "PENDING" } });

    const recentProducts = await prisma.product.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { brand: true, category: true },
    });

    const auditLogs = await prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
    });

    return apiResponse.success({
      stats: {
        totalUsers,
        totalProducts,
        totalScans,
        totalOcrScans,
        totalVisionScans,
        pendingReports,
        serverHealth: "OPERATIONAL",
        aiProvider: "Gemini / OpenAI Cluster",
      },
      recentProducts,
      auditLogs,
    });
  } catch (error) {
    console.error("Admin Stats API Error:", error);
    return apiResponse.error("Failed to load admin statistics", 500);
  }
}
