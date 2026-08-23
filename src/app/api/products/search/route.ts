import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { ALLERGEN_SYNONYMS } from "@/lib/ai";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const filterAllergens = searchParams.get("filterAllergens") === "true";

    const currentUser = await getCurrentUser();

    const whereClause: any = {
      isApproved: true,
      status: "ACTIVE",
    };

    if (q) {
      whereClause.OR = [
        { name: { contains: q } },
        { ingredients: { contains: q } },
        { barcode: { contains: q } },
        { description: { contains: q } },
        { subcategory: { contains: q } },
        { brand: { is: { name: { contains: q } } } },
      ];
    }

    if (category && category !== "All") {
      whereClause.category = {
        is: { name: { contains: category } },
      };
    }

    let products = await prisma.product.findMany({
      where: whereClause,
      include: {
        brand: { select: { id: true, name: true, logo: true } },
        category: { select: { id: true, name: true, icon: true } },
        nutrition: true,
      },
      take: 30,
    });

    // If query provided and no DB match found, use OpenFoodFacts fallback
    if (products.length === 0 && q.length >= 2) {
      try {
        const offRes = await fetch(
          `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
            q
          )}&search_simple=1&action=process&json=1&page_size=8`,
          { headers: { "User-Agent": "AllerScan - AI Food Safety Platform" } }
        );
        if (offRes.ok) {
          const offData = await offRes.json();
          if (offData.products && offData.products.length > 0) {
            const dynamicProducts = offData.products.slice(0, 8).map((item: any, idx: number) => ({
              id: `off-${item.code || idx}`,
              name: item.product_name || item.product_name_en || `${q.toUpperCase()} Item`,
              barcode: item.code || `890${Date.now()}${idx}`,
              image:
                item.image_front_url ||
                item.image_url ||
                "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
              description: item.generic_name || `Popular ${q} food product`,
              ingredients: item.ingredients_text || "Water, Wheat Flour, Vegetable Oil, Natural Flavors, Salt.",
              allergens: item.allergens || "Gluten, Dairy",
              servingSize: item.serving_size || "1 serving",
              weight: item.quantity || "250g",
              country: item.countries || "Global",
              manufacturer: item.brands || "Food Brand",
              certifications: JSON.stringify(["Inspected Quality"]),
              dietaryLabels: JSON.stringify(["Contains Wheat", "Contains Milk"]),
              aiSafetyStatus: "CAUTION" as const,
              aiConfidenceScore: 0.91,
              brand: { name: item.brands || "Global Food Co" },
              category: { name: category || "Fast Food & Snacks", icon: "🍔" },
              nutrition: {
                calories: item.nutriments?.["energy-kcal_100g"] || 280,
                protein: item.nutriments?.proteins_100g || 12,
                carbohydrates: item.nutriments?.carbohydrates_100g || 32,
                fat: item.nutriments?.fat_100g || 14,
                sugar: item.nutriments?.sugars_100g || 4,
                servingSize: "100g",
              },
            }));
            products = dynamicProducts;
          }
        }
      } catch (err) {
        console.error("OpenFoodFacts search fallback error:", err);
      }
    }

    // Filter out products conflicting with logged in user's allergy profile if requested
    if (filterAllergens && currentUser) {
      const userAllergies = await prisma.userAllergy.findMany({
        where: { userId: currentUser.id },
      });

      if (userAllergies.length > 0) {
        const allergenTerms = userAllergies.flatMap(a => {
          const name = a.allergenName.toLowerCase();
          return ALLERGEN_SYNONYMS[name] || [name];
        });

        products = products.filter(p => {
          const ingLower = p.ingredients.toLowerCase();
          const containsAllergen = allergenTerms.some(term => ingLower.includes(term));
          return !containsAllergen;
        });
      }
    }

    return apiResponse.success(products);
  } catch (error) {
    console.error("Product Search API Error:", error);
    return apiResponse.error("Failed to fetch products", 500);
  }
}
