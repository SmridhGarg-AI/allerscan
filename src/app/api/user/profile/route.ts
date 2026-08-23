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

    const userData = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        avatar: true,
        onboardingCompleted: true,
        profile: true,
        allergies: true,
        medicalConditions: true,
        dietPreferences: true,
        notificationSettings: true,
        privacySettings: true,
      },
    });

    if (!userData) {
      return apiResponse.error("User not found", 404);
    }

    return apiResponse.success(userData);
  } catch (error) {
    console.error("Profile GET Error:", error);
    return apiResponse.error("Failed to fetch profile", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return apiResponse.error("Unauthorized", 401);
    }

    const body = await req.json();
    const { fullName, avatar, age, country, preferredLanguage, notificationSettings, privacySettings } = body;

    // Update main User details
    if (fullName || avatar !== undefined) {
      await prisma.user.update({
        where: { id: currentUser.id },
        data: {
          ...(fullName && { fullName }),
          ...(avatar !== undefined && { avatar }),
        },
      });
    }

    // Upsert UserProfile
    if (age !== undefined || country || preferredLanguage) {
      await prisma.userProfile.upsert({
        where: { userId: currentUser.id },
        update: {
          ...(age !== undefined && { age: Number(age) }),
          ...(country && { country }),
          ...(preferredLanguage && { preferredLanguage }),
        },
        create: {
          userId: currentUser.id,
          age: Number(age) || 28,
          country: country || "United States",
          preferredLanguage: preferredLanguage || "English",
        },
      });
    }

    // Upsert NotificationSettings
    if (notificationSettings) {
      await prisma.userNotificationSetting.upsert({
        where: { userId: currentUser.id },
        update: notificationSettings,
        create: {
          userId: currentUser.id,
          ...notificationSettings,
        },
      });
    }

    // Upsert PrivacySettings
    if (privacySettings) {
      await prisma.userPrivacySetting.upsert({
        where: { userId: currentUser.id },
        update: privacySettings,
        create: {
          userId: currentUser.id,
          ...privacySettings,
        },
      });
    }

    return apiResponse.success({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Profile PATCH Error:", error);
    return apiResponse.error("Failed to update profile", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return apiResponse.error("Unauthorized", 401);
    }

    const body = await req.json();
    const { type, name, severity, notes } = body;

    if (!type || !name) {
      return apiResponse.error("Missing type or name", 400);
    }

    if (type === "ALLERGY") {
      const allergy = await prisma.userAllergy.create({
        data: {
          userId: currentUser.id,
          allergenName: name,
          severity: severity || "HIGH",
          notes: notes || null,
        },
      });
      return apiResponse.success(allergy);
    } else if (type === "MEDICAL_CONDITION") {
      const condition = await prisma.userMedicalCondition.create({
        data: {
          userId: currentUser.id,
          conditionName: name,
          notes: notes || null,
        },
      });
      return apiResponse.success(condition);
    } else if (type === "DIET_PREFERENCE") {
      const diet = await prisma.userDietPreference.create({
        data: {
          userId: currentUser.id,
          preferenceName: name,
        },
      });
      return apiResponse.success(diet);
    } else {
      return apiResponse.error("Invalid item type", 400);
    }
  } catch (error) {
    console.error("Profile POST Error:", error);
    return apiResponse.error("Failed to add profile item", 500);
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
    const type = searchParams.get("type");

    if (!id || !type) {
      return apiResponse.error("Missing id or type parameter", 400);
    }

    if (type === "ALLERGY") {
      await prisma.userAllergy.deleteMany({
        where: { id, userId: currentUser.id },
      });
    } else if (type === "MEDICAL_CONDITION") {
      await prisma.userMedicalCondition.deleteMany({
        where: { id, userId: currentUser.id },
      });
    } else if (type === "DIET_PREFERENCE") {
      await prisma.userDietPreference.deleteMany({
        where: { id, userId: currentUser.id },
      });
    }

    return apiResponse.success({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Profile DELETE Error:", error);
    return apiResponse.error("Failed to delete item", 500);
  }
}
