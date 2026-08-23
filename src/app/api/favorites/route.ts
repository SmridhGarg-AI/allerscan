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

    const favorites = await prisma.favoriteProduct.findMany({
      where: { userId: currentUser.id },
      include: {
        product: {
          include: {
            brand: true,
            category: true,
            nutrition: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return apiResponse.success(favorites.map(f => f.product));
  } catch (error) {
    console.error("Favorites GET error:", error);
    return apiResponse.error("Failed to fetch favorites", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return apiResponse.error("Unauthorized", 401);
    }

    const body = await req.json();
    const { productId } = body;

    if (!productId) {
      return apiResponse.error("Product ID is required", 400);
    }

    const existing = await prisma.favoriteProduct.findUnique({
      where: {
        userId_productId: {
          userId: currentUser.id,
          productId,
        },
      },
    });

    if (existing) {
      await prisma.favoriteProduct.delete({
        where: { id: existing.id },
      });
      return apiResponse.success({ isFavorite: false, message: "Removed from favorites" });
    } else {
      await prisma.favoriteProduct.create({
        data: {
          userId: currentUser.id,
          productId,
        },
      });
      return apiResponse.success({ isFavorite: true, message: "Added to favorites" });
    }
  } catch (error) {
    console.error("Favorites POST error:", error);
    return apiResponse.error("Failed to toggle favorite status", 500);
  }
}
