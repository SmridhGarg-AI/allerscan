import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { apiResponse } from "@/lib/api";

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return apiResponse.error(parsed.error.errors[0].message, 400);
    }

    const { fullName, email, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return apiResponse.error("User with this email already exists", 400);
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash,
        profile: {
          create: {
            preferredLanguage: "English",
          },
        },
        emergencyProfile: {
          create: {},
        },
        notificationSettings: {
          create: {},
        },
        privacySettings: {
          create: {},
        },
      },
    });

    return apiResponse.success(
      {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      201
    );
  } catch (error) {
    console.error("Register Error:", error);
    return apiResponse.error("Failed to register user", 500);
  }
}
