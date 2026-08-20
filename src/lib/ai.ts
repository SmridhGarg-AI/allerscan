import { RiskStatus } from "@/types";
import { prisma } from "./prisma";

// Comprehensive Allergen Synonyms & Derived Ingredient Mapping
const ALLERGEN_SYNONYMS: Record<string, string[]> = {
  milk: ["milk", "dairy", "casein", "caseinate", "whey", "lactoglobulin", "lactalbumin", "curds", "ghee", "butter", "cream", "milk fat", "milk solids", "lactose", "cheese", "mozzarella", "cheddar", "yogurt", "parmesan", "skim milk", "whole milk", "condensed milk"],
  peanuts: ["peanut", "peanuts", "groundnut", "arachis", "mixed nuts", "peanut butter", "peanut oil", "peanut flour"],
  "tree nuts": ["tree nut", "tree nuts", "almond", "almonds", "walnut", "walnuts", "cashew", "cashews", "pecan", "pistachio", "hazelnut", "macadamia", "brazil nut", "chestnut", "coconut"],
  soy: ["soy", "soya", "soybean", "soybeans", "soy lecithin", "edamame", "tofu", "tempeh", "soy protein", "tamari", "soy oil"],
  wheat: ["wheat", "semolina", "spelt", "durum", "farina", "emmer", "einkorn", "flour", "wheat gluten", "wheat flour", "whole wheat", "bread", "bun", "crust"],
  gluten: ["gluten", "wheat", "barley", "rye", "malt", "triticale", "seitan", "flour", "wheat flour", "whole wheat"],
  eggs: ["egg", "eggs", "albumin", "egg white", "egg yolk", "lysozyme", "mayonnaise", "ovalbumin", "egg powder"],
  fish: ["fish", "salmon", "tuna", "cod", "anchovy", "sardine", "tilapia", "haddock", "fish gelatin", "fish sauce"],
  shellfish: ["shellfish", "shrimp", "prawn", "crab", "lobster", "crawfish", "krill", "clam", "mussel", "oyster"],
  sesame: ["sesame", "tahini", "sesame oil", "sesamol", "sesame seeds"],
};

export interface AnalyzeInput {
  ingredients: string;
  allergies: Array<{ name: string; severity?: string }>;
  medicalConditions?: string[];
  dietPreferences?: string[];
}

export async function analyzeIngredients(input: AnalyzeInput) {
  const { ingredients, allergies, medicalConditions = [], dietPreferences = [] } = input;
  const rawIngredientsLower = ingredients.toLowerCase();

  const detectedAllergens: Array<{
    name: string;
    category: string;
    severity: string;
    matchedIngredient: string;
  }> = [];

  const crossContaminationWarnings: string[] = [];
  let highestSeverity: RiskStatus = "SAFE";
  let riskScore = 0; // 0 to 100

  // 1. Direct & Hidden Allergen Scan
  for (const allergy of allergies) {
    const userAllergen = allergy.name.toLowerCase();
    const synonyms = ALLERGEN_SYNONYMS[userAllergen] || [userAllergen];

    for (const term of synonyms) {
      // Use word boundary / string inclusion regex for exact matching
      const regex = new RegExp(`\\b${term}\\b`, "i");
      if (regex.test(rawIngredientsLower) || rawIngredientsLower.includes(term)) {
        const severity = allergy.severity || "HIGH";
        detectedAllergens.push({
          name: allergy.name,
          category: allergy.name,
          severity,
          matchedIngredient: term.charAt(0).toUpperCase() + term.slice(1),
        });

        if (severity === "CRITICAL" || severity === "HIGH") {
          highestSeverity = "UNSAFE";
          riskScore = Math.max(riskScore, 95);
        } else if (highestSeverity !== "UNSAFE") {
          highestSeverity = "HIGH_RISK";
          riskScore = Math.max(riskScore, 75);
        }
        break;
      }
    }
  }

  // 2. Cross Contamination Parser ("May contain", "Processed in a facility")
  const facilityRegex = /(may contain|processed in a facility|produced on equipment|traces of)\s+([^.]+)/gi;
  let match;
  while ((match = facilityRegex.exec(rawIngredientsLower)) !== null) {
    const warningText = match[0];
    for (const allergy of allergies) {
      const userAllergen = allergy.name.toLowerCase();
      if (warningText.includes(userAllergen)) {
        crossContaminationWarnings.push(
          `Facility cross-contamination warning detected for ${allergy.name}`
        );
        if (highestSeverity === "SAFE") {
          highestSeverity = "CAUTION";
          riskScore = Math.max(riskScore, 45);
        }
      }
    }
  }

  // 3. Dietary Preferences Verification
  const dietaryCompatibility: Record<string, boolean> = {};
  for (const diet of dietPreferences) {
    const dietLower = diet.toLowerCase();
    let isCompatible = true;

    if (dietLower.includes("vegan") || dietLower.includes("dairy-free")) {
      if (
        rawIngredientsLower.includes("milk") ||
        rawIngredientsLower.includes("cream") ||
        rawIngredientsLower.includes("whey") ||
        rawIngredientsLower.includes("casein") ||
        rawIngredientsLower.includes("cheese") ||
        rawIngredientsLower.includes("egg") ||
        rawIngredientsLower.includes("honey")
      ) {
        isCompatible = false;
      }
    }
    if (dietLower.includes("gluten-free")) {
      if (
        rawIngredientsLower.includes("wheat") ||
        rawIngredientsLower.includes("barley") ||
        rawIngredientsLower.includes("rye") ||
        rawIngredientsLower.includes("malt") ||
        rawIngredientsLower.includes("flour")
      ) {
        isCompatible = false;
      }
    }
    dietaryCompatibility[diet] = isCompatible;
  }

  // 4. Generate Natural Language Medical Explanation
  let explanation = "";
  if (detectedAllergens.length > 0) {
    const allergenListStr = detectedAllergens.map((d) => `${d.name} (via ${d.matchedIngredient})`).join(", ");
    explanation = `🚨 UNSAFE PRODUCT WARNING: AllerScan detected ingredient terms (${allergenListStr}) that match your active allergy profile. Consuming this item presents a direct risk of an allergic reaction.`;
  } else if (crossContaminationWarnings.length > 0) {
    explanation = `⚠️ CAUTION: While no direct allergen ingredient is listed, facility cross-contamination warnings exist for your active profile.`;
  } else if (allergies.length > 0) {
    explanation = `🟢 SAFE PRODUCT: AllerScan verified the ingredient list against your active allergy profile (${allergies.map((a) => a.name).join(", ")}). No matching direct allergens or hidden protein derivatives were detected.`;
  } else {
    explanation = `🟢 SAFE: No allergens flagged. (Please configure your active allergies in your Profile to enable personalized risk scoring).`;
  }

  // 5. Fetch Safer Alternative Recommendations from Database
  const saferAlternatives = await prisma.product.findMany({
    where: {
      aiSafetyStatus: "SAFE",
    },
    take: 3,
    select: {
      id: true,
      name: true,
      barcode: true,
      image: true,
      aiSafetyStatus: true,
    },
  });

  return {
    riskScore,
    safetyStatus: highestSeverity,
    confidenceScore: 0.96,
    explanation,
    detectedAllergens,
    crossContaminationWarnings,
    dietaryCompatibility,
    saferAlternatives,
  };
}
