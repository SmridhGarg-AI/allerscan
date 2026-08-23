import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeFoodImage, analyzeIngredients } from "@/lib/ai";
import { apiResponse } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const body = await req.json();
    const { imageBase64 } = body;

    let userAllergies: Array<{ allergenName: string; severity?: string }> = [];
    let allergyNames: string[] = [];
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
        allergyNames = userFull.allergies.map((a) => a.allergenName);
        dietPreferences = userFull.dietPreferences.map((d) => d.preferenceName);
      }
    }

    const visionResult = await analyzeFoodImage(imageBase64 || "", allergyNames);

    const estimatedIngredientsStr = visionResult.estimatedIngredients.join(", ");

    const aiAnalysis = await analyzeIngredients({
      ingredients: estimatedIngredientsStr,
      allergies: userAllergies,
      dietPreferences,
    });

    if (currentUser) {
      await prisma.visionScan.create({
        data: {
          userId: currentUser.id,
          imageUrl: imageBase64 ? "data:image/jpeg;base64,..." : "sample_vision.jpg",
          detectedFoods: JSON.stringify(visionResult.detectedFoods),
          estimatedIngredients: JSON.stringify(visionResult.estimatedIngredients),
          nutritionEstimate: JSON.stringify(visionResult.nutritionEstimate),
          confidenceScore: visionResult.confidenceScore,
        },
      });
    }

    return apiResponse.success({
      detectedFoods: visionResult.detectedFoods,
      estimatedIngredients: visionResult.estimatedIngredients,
      nutritionEstimate: visionResult.nutritionEstimate,
      confidenceScore: visionResult.confidenceScore,
      analysis: aiAnalysis,
    });
  } catch (error) {
    console.error("Vision AI API Error:", error);
    return apiResponse.error("Failed to process Vision AI scan", 500);
  }
}
