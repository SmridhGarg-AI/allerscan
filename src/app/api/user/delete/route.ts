import { NextRequest } from "next/server";
import { getCurrentUser, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return apiResponse.error("Unauthorized", 401);
    }

    const body = await req.json();
    const { password } = body;

    if (!password) {
      return apiResponse.error("Password confirmation is required", 400);
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: currentUser.id },
    });

    if (!dbUser || !dbUser.passwordHash) {
      return apiResponse.error("User account not found", 404);
    }

    const isValid = await verifyPassword(password, dbUser.passwordHash);
    if (!isValid) {
      return apiResponse.error("Invalid password provided", 400);
    }

    // Delete user (Prisma cascade relations handles sessions, profile, allergies, scans, etc.)
    await prisma.user.delete({
      where: { id: currentUser.id },
    });

    // Clear session cookie
    const cookieStore = await cookies();
    cookieStore.delete("allerscan_session");

    return apiResponse.success({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Account deletion error:", error);
    return apiResponse.error("Failed to delete account", 500);
  }
}
