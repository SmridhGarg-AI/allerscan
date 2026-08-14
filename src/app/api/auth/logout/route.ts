import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("allerscan_session")?.value;

    if (sessionToken) {
      await prisma.session.deleteMany({
        where: { sessionToken },
      });
      cookieStore.delete("allerscan_session");
    }

    return apiResponse.success({ message: "Logged out successfully" });
  } catch (error) {
    return apiResponse.error("Failed to logout", 500);
  }
}
