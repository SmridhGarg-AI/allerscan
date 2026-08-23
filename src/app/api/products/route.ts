import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMINISTRATOR") {
      return apiResponse.error("Forbidden: Admin access required", 403);
    }

    const body = await req.json();
    const { name, barcode, ingredients, description, allergens, image, servingSize, weight, country, manufacturer, categoryId, brandId, nutrition } = body;

    if (!name || !barcode || !ingredients) {
      return apiResponse.error("Name, barcode, and ingredients are required", 400);
    }

    const existing = await prisma.product.findUnique({ where: { barcode } });
    if (existing) {
      return apiResponse.error("Product with this barcode already exists", 400);
    }

    const product = await prisma.product.create({
      data: {
        name,
        barcode,
        ingredients,
        description: description || null,
        allergens: allergens || null,
        image: image || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
        servingSize: servingSize || "100g",
        weight: weight || "100g",
        country: country || "United States",
        manufacturer: manufacturer || "Manufacturer",
        categoryId: categoryId || undefined,
        brandId: brandId || undefined,
        nutrition: nutrition ? {
          create: {
            calories: Number(nutrition.calories) || 0,
            protein: Number(nutrition.protein) || 0,
            carbohydrates: Number(nutrition.carbohydrates) || 0,
            fat: Number(nutrition.fat) || 0,
            sugar: Number(nutrition.sugar) || 0,
            fiber: Number(nutrition.fiber) || 0,
            sodium: Number(nutrition.sodium) || 0,
            servingSize: nutrition.servingSize || "100g",
          }
        } : undefined,
      },
    });

    return apiResponse.success(product, 201);
  } catch (error) {
    console.error("Product creation error:", error);
    return apiResponse.error("Failed to create product", 500);
  }
}
