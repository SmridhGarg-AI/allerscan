export type Role = "CUSTOMER" | "ADMINISTRATOR" | "MODERATOR";
export type RiskStatus = "SAFE" | "CAUTION" | "HIGH_RISK" | "UNSAFE";

export interface UserSession {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  avatar?: string | null;
  onboardingCompleted: boolean;
}

export interface UserAllergyItem {
  id: string;
  allergenName: string;
  severity: string;
  notes?: string | null;
}

export interface UserMedicalConditionItem {
  id: string;
  conditionName: string;
  notes?: string | null;
}

export interface UserDietPreferenceItem {
  id: string;
  preferenceName: string;
}

export interface UserProfileData {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  avatar?: string | null;
  onboardingCompleted: boolean;
  profile?: {
    age?: number | null;
    country?: string | null;
    preferredLanguage?: string | null;
  } | null;
  allergies: UserAllergyItem[];
  medicalConditions: UserMedicalConditionItem[];
  dietPreferences: UserDietPreferenceItem[];
}

export interface ProductDetail {
  id: string;
  name: string;
  barcode: string;
  brand?: { name: string; logo?: string | null } | null;
  category?: { name: string; icon?: string | null } | null;
  image?: string | null;
  description?: string | null;
  ingredients: string;
  allergens?: string | null;
  servingSize?: string | null;
  weight?: string | null;
  country?: string | null;
  manufacturer?: string | null;
  certifications?: string | null;
  dietaryLabels?: string | null;
  aiSafetyStatus?: RiskStatus | null;
  aiConfidenceScore?: number | null;
  nutrition?: {
    calories: number;
    protein: number;
    carbohydrates: number;
    sugar: number;
    fiber: number;
    fat: number;
    saturatedFat: number;
    transFat: number;
    sodium: number;
    potassium: number;
    calcium: number;
    vitaminD: number;
    servingSize: string;
  } | null;
}

export interface AnalysisResult {
  riskScore: number;
  safetyStatus: RiskStatus;
  confidenceScore: number;
  explanation: string;
  detectedAllergens: Array<{ name: string; category: string; severity: string; matchedIngredient: string }>;
  crossContaminationWarnings: string[];
  dietaryCompatibility: Record<string, boolean>;
  saferAlternatives: Array<{ id: string; name: string; barcode: string; image?: string; safetyStatus: string }>;
}
