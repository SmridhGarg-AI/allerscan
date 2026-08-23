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

    const emergencyProfile = await prisma.emergencyProfile.findUnique({
      where: { userId: currentUser.id },
    });

    const emergencyContacts = await prisma.emergencyContact.findMany({
      where: { userId: currentUser.id },
      orderBy: { isPrimary: "desc" },
    });

    const userAllergies = await prisma.userAllergy.findMany({
      where: { userId: currentUser.id },
    });

    return apiResponse.success({
      profile: emergencyProfile,
      contacts: emergencyContacts,
      allergies: userAllergies,
      fullName: currentUser.fullName,
      email: currentUser.email,
    });
  } catch (error) {
    console.error("Emergency GET error:", error);
    return apiResponse.error("Failed to fetch emergency details", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return apiResponse.error("Unauthorized", 401);
    }

    const body = await req.json();
    const { action, profileData, contactData, contactId } = body;

    if (action === "UPDATE_PROFILE") {
      const updated = await prisma.emergencyProfile.upsert({
        where: { userId: currentUser.id },
        update: profileData,
        create: {
          userId: currentUser.id,
          ...profileData,
        },
      });
      return apiResponse.success(updated);
    } else if (action === "ADD_CONTACT") {
      const contact = await prisma.emergencyContact.create({
        data: {
          userId: currentUser.id,
          name: contactData.name,
          relationship: contactData.relationship,
          phone: contactData.phone,
          isPrimary: contactData.isPrimary || false,
        },
      });
      return apiResponse.success(contact);
    } else if (action === "DELETE_CONTACT") {
      await prisma.emergencyContact.deleteMany({
        where: { id: contactId, userId: currentUser.id },
      });
      return apiResponse.success({ message: "Contact deleted" });
    } else {
      return apiResponse.error("Invalid action", 400);
    }
  } catch (error) {
    console.error("Emergency POST error:", error);
    return apiResponse.error("Failed to process emergency request", 500);
  }
}
