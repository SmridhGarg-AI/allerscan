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

    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        profile: { select: { age: true, country: true } },
        allergies: { select: { allergenName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return apiResponse.success(users);
  } catch (error) {
    console.error("Admin users GET error:", error);
    return apiResponse.error("Failed to fetch users", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMINISTRATOR") {
      return apiResponse.error("Forbidden: Admin access required", 403);
    }

    const body = await req.json();
    const { userId, role, status } = body;

    if (!userId) {
      return apiResponse.error("User ID is required", 400);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(role && { role }),
        ...(status && { status }),
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: `USER_UPDATE_${role || status}`,
        target: userId,
        metadata: JSON.stringify({ updatedRole: role, updatedStatus: status }),
      },
    });

    return apiResponse.success(updated);
  } catch (error) {
    console.error("Admin users PATCH error:", error);
    return apiResponse.error("Failed to update user", 500);
  }
}
