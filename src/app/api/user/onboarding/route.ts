import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return apiResponse.error("Unauthorized", 401);
    }

    const body = await req.json();
    const { age, country, preferredLanguage, allergies, medicalConditions, dietPreferences } = body;

    // 1. Update Profile
    await prisma.userProfile.upsert({
      where: { userId: currentUser.id },
      update: {
        age: Number(age) || undefined,
        country: country || "United States",
        preferredLanguage: preferredLanguage || "English",
      },
      create: {
        userId: currentUser.id,
        age: Number(age) || undefined,
        country: country || "United States",
        preferredLanguage: preferredLanguage || "English",
      },
    });

    // 2. Clear old allergies & insert new
    await prisma.userAllergy.deleteMany({ where: { userId: currentUser.id } });
    if (Array.isArray(allergies) && allergies.length > 0) {
      await prisma.userAllergy.createMany({
        data: allergies.map((item: string) => ({
          userId: currentUser.id,
          allergenName: item,
          severity: "HIGH",
        })),
      });
    }

    // 3. Clear old conditions & insert new
    await prisma.userMedicalCondition.deleteMany({ where: { userId: currentUser.id } });
    if (Array.isArray(medicalConditions) && medicalConditions.length > 0) {
      await prisma.userMedicalCondition.createMany({
        data: medicalConditions.map((item: string) => ({
          userId: currentUser.id,
          conditionName: item,
        })),
      });
    }

    // 4. Clear old diets & insert new
    await prisma.userDietPreference.deleteMany({ where: { userId: currentUser.id } });
    if (Array.isArray(dietPreferences) && dietPreferences.length > 0) {
      await prisma.userDietPreference.createMany({
        data: dietPreferences.map((item: string) => ({
          userId: currentUser.id,
          preferenceName: item,
        })),
      });
    }

    // 5. Mark onboarding complete
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { onboardingCompleted: true },
    });

    return apiResponse.success({ message: "Onboarding completed successfully" });
  } catch (error) {
    console.error("Onboarding API Error:", error);
    return apiResponse.error("Failed to save onboarding data", 500);
  }
}
