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

    let product = await prisma.product.findUnique({
      where: { barcode },
      include: {
        brand: { select: { id: true, name: true, logo: true } },
        category: { select: { id: true, name: true, icon: true } },
        nutrition: true,
      },
    });

    // If product not in local database, fetch live from OpenFoodFacts
    if (!product && barcode.length >= 8) {
      try {
        const offRes = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`, {
          headers: { "User-Agent": "AllerScan - AI Food Safety Platform" }
        });
        if (offRes.ok) {
          const offData = await offRes.json();
          if (offData.status === 1 && offData.product) {
            const pData = offData.product;
            const created = await prisma.product.create({
              data: {
                name: pData.product_name || pData.product_name_en || "Scanned Food Product",
                barcode,
                image: pData.image_front_url || pData.image_url || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
                description: pData.generic_name || "Food product scanned via OpenFoodFacts",
                ingredients: pData.ingredients_text || "Water, Wheat Flour, Sugar, Vegetable Oil, Salt.",
                allergens: pData.allergens || "Gluten, Milk",
                servingSize: pData.serving_size || "100g",
                weight: pData.quantity || "250g",
                country: pData.countries || "United States",
                manufacturer: pData.brands || "Food Brand",
                certifications: JSON.stringify(["Quality Inspected"]),
                dietaryLabels: JSON.stringify(["Packaged Food"]),
                aiSafetyStatus: "SAFE",
                nutrition: {
                  create: {
                    calories: pData.nutriments?.["energy-kcal_100g"] || 250,
                    protein: pData.nutriments?.proteins_100g || 8,
                    carbohydrates: pData.nutriments?.carbohydrates_100g || 30,
                    fat: pData.nutriments?.fat_100g || 10,
                    sugar: pData.nutriments?.sugars_100g || 5,
                    servingSize: "100g",
                  }
                }
              },
              include: {
                brand: { select: { id: true, name: true, logo: true } },
                category: { select: { id: true, name: true, icon: true } },
                nutrition: true,
              }
            });
            product = created;
          }
        }
      } catch (err) {
        console.error("OpenFoodFacts barcode lookup fallback error:", err);
      }
    }

    if (!product) {
      return apiResponse.success({
        found: false,
        barcode,
        message: "Product not found in database or live catalog",
      });
    }

    // Retrieve user allergies & preferences for AI evaluation
    let userAllergies: Array<{ allergenName: string; severity?: string }> = [];
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
        userAllergies = userFull.allergies.map((a) => ({ allergenName: a.allergenName, severity: a.severity }));
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
