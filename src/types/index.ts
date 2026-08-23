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

export interface NotificationSettingItem {
  pushEnabled: boolean;
  emailEnabled: boolean;
  safetyAlerts: boolean;
  recallAlerts: boolean;
  weeklyReports: boolean;
}

export interface PrivacySettingItem {
  shareAnonymousAnalytics: boolean;
  improveAi: boolean;
  marketingEmails: boolean;
  publicProfile: boolean;
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
  notificationSettings?: NotificationSettingItem | null;
  privacySettings?: PrivacySettingItem | null;
}

export interface ProductDetail {
  id: string;
  name: string;
  barcode: string;
  brand?: { id?: string; name: string; logo?: string | null } | null;
  category?: { id?: string; name: string; icon?: string | null } | null;
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
  isFavorite?: boolean;
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
  saferAlternatives: Array<{ id: string; name: string; barcode: string; image?: string; aiSafetyStatus?: string }>;
}

export interface VisionAnalysisResult {
  detectedFoods: Array<{ name: string; confidence: number; category: string }>;
  estimatedIngredients: string[];
  nutritionEstimate: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
    portionSize: string;
    weight: string;
  };
  detectedAllergens: Array<{ name: string; severity: string }>;
  safetyStatus: RiskStatus;
  confidenceScore: number;
}

export interface EmergencyContactItem {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
}

export interface EmergencyProfileItem {
  bloodGroup?: string | null;
  emergencyNotes?: string | null;
  doctorName?: string | null;
  doctorPhone?: string | null;
  hospital?: string | null;
  autoInjectors: boolean;
}

export interface SupportTicketItem {
  id: string;
  subject: string;
  category: string;
  priority: string;
  message: string;
  status: string;
  response?: string | null;
  createdAt: string;
}

export interface ProductReportItem {
  id: string;
  productId: string;
  productName: string;
  reportType: string;
  description: string;
  status: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  category: string;
  isRead: boolean;
  createdAt: string;
}
