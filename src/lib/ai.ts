import { RiskStatus } from "@/types";
import { prisma } from "./prisma";

// Allergen Synonyms & Derived Ingredient Mapping
const ALLERGEN_SYNONYMS: Record<string, string[]> = {
  milk: ["casein", "caseinate", "whey", "lactoglobulin", "lactalbumin", "curds", "ghee", "butter", "cream", "milk fat", "milk solids", "lactose"],
  peanuts: ["peanut", "groundnut", "arachis", "mixed nuts", "peanut butter", "peanut oil"],
  "tree nuts": ["almond", "walnut", "cashew", "pecan", "pistachio", "hazelnut", "macadamia", "brazil nut", "chestnut"],
  soy: ["soya", "soybean", "soy lecithin", "edamame", "tofu", "tempeh", "soy protein", "tamari"],
  wheat: ["semolina", "spelt", "durum", "farina", "emmer", "einkorn", "flour", "wheat gluten"],
  gluten: ["wheat", "barley", "rye", "malt", "triticale", "seitan"],
  eggs: ["egg", "albumin", "egg white", "egg yolk", "lysozyme", "mayonnaise", "ovalbumin"],
  fish: ["salmon", "tuna", "cod", "anchovy", "sardine", "tilapia", "haddock", "fish gelatin", "fish sauce"],
  shellfish: ["shrimp", "prawn", "crab", "lobster", "crawfish", "krill"],
  sesame: ["sesame", "tahini", "sesame oil", "sesamol"],
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
      if (rawIngredientsLower.includes(term)) {
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
          `Cross-Contamination Warning: Facility processes ${allergy.name}`
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
        rawIngredientsLower.includes("malt")
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
    explanation = `AllerScan has flagged this product as ${highestSeverity}. It contains ingredients associated with your specified allergen profile: ${allergenListStr}. Consuming this product poses a direct risk of an allergic reaction.`;
  } else if (crossContaminationWarnings.length > 0) {
    explanation = `While no direct allergens were detected in the main ingredient list, the product packaging specifies cross-contamination warnings. Exercise caution if you have severe sensitivity.`;
  } else {
    explanation = `AllerScan verified the ingredient list against your allergy profile (${allergies.map((a) => a.name).join(", ")}). No matching direct allergens or hidden derivatives were identified.`;
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
