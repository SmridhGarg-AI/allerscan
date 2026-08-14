import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";

    const whereClause: any = {
      isApproved: true,
      status: "ACTIVE",
    };

    if (q) {
      whereClause.OR = [
        { name: { contains: q } },
        { ingredients: { contains: q } },
        { barcode: { contains: q } },
        { brand: { name: { contains: q } } },
      ];
    }

    if (category) {
      whereClause.category = {
        name: { contains: category },
      };
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        brand: { select: { name: true, logo: true } },
        category: { select: { name: true, icon: true } },
        nutrition: true,
      },
      take: 20,
    });

    return apiResponse.success(products);
  } catch (error) {
    console.error("Product Search API Error:", error);
    return apiResponse.error("Failed to fetch products", 500);
  }
}
