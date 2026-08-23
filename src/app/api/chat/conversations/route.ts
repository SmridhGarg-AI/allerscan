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

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.toLowerCase();

    const conversations = await prisma.conversation.findMany({
      where: {
        userId: currentUser.id,
        ...(q ? { title: { contains: q } } : {}),
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: [
        { isPinned: "desc" },
        { updatedAt: "desc" },
      ],
    });

    return apiResponse.success(conversations);
  } catch (error) {
    console.error("Conversations GET error:", error);
    return apiResponse.error("Failed to fetch conversations", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return apiResponse.error("Unauthorized", 401);
    }

    const body = await req.json();
    const { id, title, isPinned } = body;

    if (!id) {
      return apiResponse.error("Conversation ID is required", 400);
    }

    const updated = await prisma.conversation.updateMany({
      where: { id, userId: currentUser.id },
      data: {
        ...(title !== undefined && { title }),
        ...(isPinned !== undefined && { isPinned }),
      },
    });

    return apiResponse.success(updated);
  } catch (error) {
    console.error("Conversations PATCH error:", error);
    return apiResponse.error("Failed to update conversation", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return apiResponse.error("Unauthorized", 401);
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return apiResponse.error("Conversation ID is required", 400);
    }

    await prisma.conversation.deleteMany({
      where: { id, userId: currentUser.id },
    });

    return apiResponse.success({ message: "Conversation deleted" });
  } catch (error) {
    console.error("Conversations DELETE error:", error);
    return apiResponse.error("Failed to delete conversation", 500);
  }
}
