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

    const allergens = await prisma.allergen.findMany({
      orderBy: { name: "asc" },
    });

    const ingredients = await prisma.ingredient.findMany({
      orderBy: { name: "asc" },
      take: 50,
    });

    return apiResponse.success({ allergens, ingredients });
  } catch (error) {
    console.error("Admin allergens GET error:", error);
    return apiResponse.error("Failed to fetch allergens", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMINISTRATOR") {
      return apiResponse.error("Forbidden: Admin access required", 403);
    }

    const body = await req.json();
    const { type, name, severity, description, crossContaminationNotes } = body;

    if (!name) {
      return apiResponse.error("Name is required", 400);
    }

    if (type === "INGREDIENT") {
      const ing = await prisma.ingredient.create({
        data: {
          name,
          description: description || null,
          possibleAllergens: severity || "HIGH",
        },
      });
      return apiResponse.success(ing, 201);
    } else {
      const allergen = await prisma.allergen.create({
        data: {
          name,
          severity: severity || "HIGH",
          description: description || null,
          crossContaminationNotes: crossContaminationNotes || null,
        },
      });
      return apiResponse.success(allergen, 201);
    }
  } catch (error) {
    console.error("Admin allergens POST error:", error);
    return apiResponse.error("Failed to create allergen/ingredient", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMINISTRATOR") {
      return apiResponse.error("Forbidden: Admin access required", 403);
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type");

    if (!id) {
      return apiResponse.error("ID is required", 400);
    }

    if (type === "INGREDIENT") {
      await prisma.ingredient.delete({ where: { id } });
    } else {
      await prisma.allergen.delete({ where: { id } });
    }

    return apiResponse.success({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Admin allergens DELETE error:", error);
    return apiResponse.error("Failed to delete item", 500);
  }
}
