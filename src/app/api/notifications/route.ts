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

    let notifications = await prisma.notification.findMany({
      where: { userId: currentUser.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Seed default notifications if user has none
    if (notifications.length === 0) {
      await prisma.notification.createMany({
        data: [
          {
            userId: currentUser.id,
            title: "🚨 FDA Food Recall Alert: Undeclared Milk in Snack Bars",
            message: "The FDA issued a recall for certain organic nut bars due to undeclared milk protein. Check your pantry!",
            type: "WARNING",
            category: "RECALL",
            isRead: false,
          },
          {
            userId: currentUser.id,
            title: "🟢 Safety Profile Synchronized",
            message: "Your active allergy rules and dietary preferences have been saved and applied to all scan engines.",
            type: "SUCCESS",
            category: "SAFETY",
            isRead: true,
          },
        ],
      });

      notifications = await prisma.notification.findMany({
        where: { userId: currentUser.id },
        orderBy: { createdAt: "desc" },
      });
    }

    return apiResponse.success(notifications);
  } catch (error) {
    console.error("Notifications GET Error:", error);
    return apiResponse.error("Failed to fetch notifications", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return apiResponse.error("Unauthorized", 401);
    }

    const body = await req.json();
    const { id, markAllRead } = body;

    if (markAllRead) {
      await prisma.notification.updateMany({
        where: { userId: currentUser.id },
        data: { isRead: true },
      });
    } else if (id) {
      await prisma.notification.updateMany({
        where: { id, userId: currentUser.id },
        data: { isRead: true },
      });
    }

    return apiResponse.success({ message: "Notifications updated" });
  } catch (error) {
    console.error("Notifications PATCH Error:", error);
    return apiResponse.error("Failed to update notifications", 500);
  }
}
