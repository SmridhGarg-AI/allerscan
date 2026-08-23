import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        brand: true,
        category: true,
        nutrition: true,
      },
    });

    if (!product) {
      return apiResponse.error("Product not found", 404);
    }

    let isFavorite = false;
    if (currentUser) {
      const fav = await prisma.favoriteProduct.findUnique({
        where: {
          userId_productId: {
            userId: currentUser.id,
            productId: product.id,
          },
        },
      });
      isFavorite = !!fav;
    }

    return apiResponse.success({ ...product, isFavorite });
  } catch (error) {
    console.error("Product GET error:", error);
    return apiResponse.error("Failed to fetch product details", 500);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMINISTRATOR") {
      return apiResponse.error("Forbidden: Admin access required", 403);
    }

    const { id } = await params;
    const body = await req.json();

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        barcode: body.barcode,
        ingredients: body.ingredients,
        allergens: body.allergens,
        description: body.description,
        aiSafetyStatus: body.aiSafetyStatus,
        status: body.status,
      },
    });

    return apiResponse.success(updated);
  } catch (error) {
    console.error("Product PATCH error:", error);
    return apiResponse.error("Failed to update product", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMINISTRATOR") {
      return apiResponse.error("Forbidden: Admin access required", 403);
    }

    const { id } = await params;
    await prisma.product.delete({ where: { id } });

    return apiResponse.success({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Product DELETE error:", error);
    return apiResponse.error("Failed to delete product", 500);
  }
}
