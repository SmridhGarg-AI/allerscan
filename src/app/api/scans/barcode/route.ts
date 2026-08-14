import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeIngredients } from "@/lib/ai";
import { apiResponse } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const body = await req.json();
    const { barcode } = body;

    if (!barcode) {
      return apiResponse.error("Barcode is required", 400);
    }

    const product = await prisma.product.findUnique({
      where: { barcode },
      include: {
        brand: { select: { name: true, logo: true } },
        category: { select: { name: true, icon: true } },
        nutrition: true,
      },
    });

    if (!product) {
      return apiResponse.success({
        found: false,
        barcode,
        message: "Product not found in AllerScan database",
      });
    }

    // Retrieve user allergies & preferences for AI evaluation
    let userAllergies: Array<{ name: string; severity?: string }> = [];
    let dietPreferences: string[] = [];

    if (currentUser) {
      const userFull = await prisma.user.findUnique({
        where: { id: currentUser.id },
        include: {
          allergies: true,
          dietPreferences: true,
        },
      });

      if (userFull) {
        userAllergies = userFull.allergies.map((a) => ({ name: a.allergenName, severity: a.severity }));
        dietPreferences = userFull.dietPreferences.map((d) => d.preferenceName);
      }

      // Record Scan History
      await prisma.scanHistory.create({
        data: {
          userId: currentUser.id,
          productId: product.id,
          barcode: product.barcode,
          resultType: "BARCODE",
          safetyStatus: product.aiSafetyStatus || "SAFE",
        },
      });
    }

    // Perform AI analysis
    const aiAnalysis = await analyzeIngredients({
      ingredients: product.ingredients,
      allergies: userAllergies,
      dietPreferences,
    });

    return apiResponse.success({
      found: true,
      product,
      analysis: aiAnalysis,
    });
  } catch (error) {
    console.error("Barcode Scan API Error:", error);
    return apiResponse.error("Failed to process barcode scan", 500);
  }
}
