import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeIngredients } from "@/lib/ai";
import { apiResponse } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const body = await req.json();

    // Mock/Real Vision AI Detection Output
    const detectedFoods = [
      { name: "Almond Milk Cappuccino", confidence: 0.95, boundingBox: [20, 30, 200, 200] },
      { name: "Gluten-Free Oat Cookie", confidence: 0.91, boundingBox: [220, 50, 150, 150] },
    ];

    const estimatedIngredients = "Espresso, Filtered Water, Almond Milk (Almonds, Water), Oat Flour, Sugar, Palm Oil, Sea Salt.";

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

      await prisma.visionScan.create({
        data: {
          userId: currentUser.id,
          imageUrl: "sample_meal.jpg",
          detectedFoods: JSON.stringify(detectedFoods),
          estimatedIngredients,
          nutritionEstimate: JSON.stringify({ calories: 340, protein: 6, carbs: 42, fat: 12 }),
          confidenceScore: 0.93,
        },
      });
    }

    const aiAnalysis = await analyzeIngredients({
      ingredients: estimatedIngredients,
      allergies: userAllergies,
      dietPreferences,
    });

    return apiResponse.success({
      detectedFoods,
      estimatedIngredients,
      nutritionEstimate: { calories: 340, protein: 6, carbs: 42, fat: 12 },
      confidenceScore: 0.93,
      analysis: aiAnalysis,
    });
  } catch (error) {
    console.error("Vision AI API Error:", error);
    return apiResponse.error("Failed to process Vision AI scan", 500);
  }
}
