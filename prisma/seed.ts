import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding AllerScan database...");

  // 1. Password Hashes
  const adminPasswordHash = await bcrypt.hash("AdminPassword123!", 10);
  const userPasswordHash = await bcrypt.hash("DemoUser123!", 10);

  // 2. Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: "admin@allerscan.com" },
    update: {},
    create: {
      fullName: "System Admin",
      username: "admin",
      email: "admin@allerscan.com",
      passwordHash: adminPasswordHash,
      role: "ADMINISTRATOR",
      emailVerified: true,
      onboardingCompleted: true,
      profile: {
        create: {
          age: 32,
          country: "United States",
          preferredLanguage: "English",
        },
      },
      emergencyProfile: {
        create: {
          bloodGroup: "A+",
          emergencyNotes: "No known severe anaphylaxis",
          doctorName: "Dr. Elizabeth Vance",
          doctorPhone: "+1 (555) 019-2834",
          hospital: "St. Jude Medical Center",
        },
      },
    },
  });

  // 3. Create Demo Customer User
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@allerscan.com" },
    update: {},
    create: {
      fullName: "Sarah Connor",
      username: "sarahc",
      email: "demo@allerscan.com",
      passwordHash: userPasswordHash,
      role: "CUSTOMER",
      emailVerified: true,
      onboardingCompleted: true,
      profile: {
        create: {
          age: 28,
          country: "United States",
          preferredLanguage: "English",
        },
      },
      allergies: {
        create: [
          { allergenName: "Milk", severity: "HIGH", notes: "Lactose & Milk Protein allergy" },
          { allergenName: "Peanuts", severity: "CRITICAL", notes: "Severe anaphylactic reaction" },
        ],
      },
      medicalConditions: {
        create: [
          { conditionName: "Lactose Intolerance", notes: "Requires dairy-free alternatives" },
        ],
      },
      dietPreferences: {
        create: [
          { preferenceName: "Gluten-Free" },
          { preferenceName: "Dairy-Free" },
        ],
      },
      emergencyProfile: {
        create: {
          bloodGroup: "O+",
          emergencyNotes: "Carries EpiPen in backpack",
          doctorName: "Dr. Robert Chen",
          doctorPhone: "+1 (555) 234-5678",
          hospital: "City General Hospital",
          autoInjectors: true,
        },
      },
      emergencyContacts: {
        create: [
          { name: "John Connor", relationship: "Brother", phone: "+1 (555) 987-6543", isPrimary: true },
        ],
      },
    },
  });

  // 4. Create Categories
  const catFastFood = await prisma.category.upsert({
    where: { name: "Fast Food & Meals" },
    update: {},
    create: { name: "Fast Food & Meals", icon: "🍔", description: "Burgers, pizzas, fries, and ready meals" },
  });

  const catDairy = await prisma.category.upsert({
    where: { name: "Dairy & Eggs" },
    update: {},
    create: { name: "Dairy & Eggs", icon: "🥛", description: "Milk, cheese, yogurts, and butter" },
  });

  const catSnacks = await prisma.category.upsert({
    where: { name: "Snacks & Confectionery" },
    update: {},
    create: { name: "Snacks & Confectionery", icon: "🍫", description: "Chips, chocolates, bars, and cookies" },
  });

  const catBakery = await prisma.category.upsert({
    where: { name: "Bakery & Grains" },
    update: {},
    create: { name: "Bakery & Grains", icon: "🍞", description: "Breads, cereals, grains, and flour" },
  });

  const catDrinks = await prisma.category.upsert({
    where: { name: "Beverages" },
    update: {},
    create: { name: "Beverages", icon: "🥤", description: "Juices, plant milks, teas, and sodas" },
  });

  // 5. Create Brands
  const brandBeyond = await prisma.brand.upsert({
    where: { name: "Beyond Meat" },
    update: {},
    create: { name: "Beyond Meat", country: "United States", website: "https://beyondmeat.com" },
  });

  const brandSilk = await prisma.brand.upsert({
    where: { name: "Silk" },
    update: {},
    create: { name: "Silk", country: "United States", website: "https://silk.com" },
  });

  const brandQuaker = await prisma.brand.upsert({
    where: { name: "Quaker" },
    update: {},
    create: { name: "Quaker", country: "United States", website: "https://quakeroats.com" },
  });

  const brandAmys = await prisma.brand.upsert({
    where: { name: "Amy's Kitchen" },
    update: {},
    create: { name: "Amy's Kitchen", country: "United States", website: "https://amys.com" },
  });

  const brandNestle = await prisma.brand.upsert({
    where: { name: "Nestlé" },
    update: {},
    create: { name: "Nestlé", country: "Switzerland", website: "https://nestle.com" },
  });

  // 6. Create Allergens
  const allergens = [
    { name: "Milk", severity: "HIGH", description: "Dairy proteins including casein and whey." },
    { name: "Peanuts", severity: "CRITICAL", description: "Legumes capable of triggering severe anaphylaxis." },
    { name: "Tree Nuts", severity: "CRITICAL", description: "Almonds, walnuts, cashews, pecans, pistachios." },
    { name: "Soy", severity: "MEDIUM", description: "Soybeans and derivatives like soy lecithin." },
    { name: "Gluten", severity: "HIGH", description: "Proteins found in wheat, barley, rye." },
    { name: "Eggs", severity: "HIGH", description: "Egg whites and egg yolks." },
    { name: "Fish", severity: "CRITICAL", description: "Finfish including salmon, tuna, cod." },
    { name: "Shellfish", severity: "CRITICAL", description: "Crustaceans like shrimp, crab, lobster." },
    { name: "Sesame", severity: "HIGH", description: "Sesame seeds and sesame oil." },
  ];

  for (const item of allergens) {
    await prisma.allergen.upsert({
      where: { name: item.name },
      update: {},
      create: item,
    });
  }

  // 7. Create Food Products (Including Burgers, Pizzas, Oats, Almond Milk)
  const products = [
    {
      barcode: "085262900403",
      name: "Beyond Burger Plant-Based Patties",
      brandId: brandBeyond.id,
      categoryId: catFastFood.id,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
      description: "Juicy plant-based burger patty made with pea protein. Soy-free, Gluten-free, and Non-GMO.",
      ingredients: "Water, Pea Protein, Expeller-Pressed Canola Oil, Refined Coconut Oil, Rice Protein, Natural Flavors, Dried Yeast, Mung Bean Protein, Methylcellulose, Potato Starch, Apple Extract, Pomegranate Fruit Powder, Salt, Potassium Chloride, Vinegar, Lemon Juice Concentrate, Sunflower Lecithin, Beet Juice Extract.",
      allergens: "Coconut (Tree Nut derivative)",
      servingSize: "113 g",
      weight: "226 g",
      country: "United States",
      manufacturer: "Beyond Meat Inc.",
      certifications: JSON.stringify(["Non-GMO Project Verified", "Kosher"]),
      dietaryLabels: JSON.stringify(["Vegan", "Gluten-Free", "Soy-Free", "High Protein"]),
      aiSafetyStatus: "SAFE" as const,
      aiConfidenceScore: 0.99,
      nutrition: {
        calories: 230,
        protein: 20,
        carbohydrates: 7,
        sugar: 0,
        fiber: 2,
        fat: 14,
        saturatedFat: 5,
        transFat: 0,
        sodium: 390,
        iron: 4.2,
        servingSize: "1 patty (113g)",
      },
    },
    {
      barcode: "042272000449",
      name: "Amy's Cheese Pizza Whole Wheat Crust",
      brandId: brandAmys.id,
      categoryId: catFastFood.id,
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
      description: "Delicious frozen cheese pizza made with organic tomatoes, whole wheat flour, and rBST-free mozzarella cheese.",
      ingredients: "Organic Whole Wheat Flour, Filtered Water, Organic Tomato Purée, Part-Skim Mozzarella Cheese (Pasteurized Part-Skim Milk, Culture, Salt, Enzymes), Organic Extra Virgin Olive Oil, Sea Salt, Organic Cane Sugar, Yeast, Spices.",
      allergens: "Milk, Wheat (Gluten)",
      servingSize: "116 g",
      weight: "369 g",
      country: "United States",
      manufacturer: "Amy's Kitchen",
      certifications: JSON.stringify(["USDA Organic"]),
      dietaryLabels: JSON.stringify(["Vegetarian"]),
      aiSafetyStatus: "UNSAFE" as const,
      aiConfidenceScore: 0.98,
      nutrition: {
        calories: 290,
        protein: 12,
        carbohydrates: 36,
        sugar: 3,
        fiber: 4,
        fat: 11,
        saturatedFat: 4.5,
        transFat: 0,
        sodium: 580,
        calcium: 200,
        servingSize: "1 slice (116g)",
      },
    },
    {
      barcode: "089425000008",
      name: "Silk Pure Almond Milk Unsweetened",
      brandId: brandSilk.id,
      categoryId: catDrinks.id,
      image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=800&q=80",
      description: "Creamy unsweetened almond milk enriched with Calcium and Vitamin D. 100% Dairy-Free & Gluten-Free.",
      ingredients: "Almondmilk (Filtered Water, Almonds), Vitamin and Mineral Blend (Calcium Carbonate, Vitamin E Acetate, Vitamin A Palmitate, Vitamin D2), Sea Salt, Gellan Gum, Ascorbic Acid, Natural Flavor.",
      allergens: "Tree Nuts (Almonds)",
      servingSize: "240 ml",
      weight: "1.89 L",
      country: "United States",
      manufacturer: "Danone North America",
      certifications: JSON.stringify(["Non-GMO Project Verified", "Kosher Pareve"]),
      dietaryLabels: JSON.stringify(["Vegan", "Dairy-Free", "Gluten-Free", "Low Sugar"]),
      aiSafetyStatus: "SAFE" as const,
      aiConfidenceScore: 0.98,
      nutrition: {
        calories: 30,
        protein: 1,
        carbohydrates: 1,
        sugar: 0,
        fiber: 1,
        fat: 2.5,
        saturatedFat: 0,
        transFat: 0,
        sodium: 170,
        potassium: 170,
        calcium: 450,
        vitaminD: 5,
        servingSize: "1 cup (240ml)",
      },
    },
    {
      barcode: "030000062227",
      name: "Quaker Old Fashioned Rolled Oats",
      brandId: brandQuaker.id,
      categoryId: catBakery.id,
      image: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=800&q=80",
      description: "100% Natural Whole Grain Whole Rolled Oats. Heart-healthy wholesome breakfast staple.",
      ingredients: "100% Whole Grain Rolled Oats.",
      allergens: "May contain trace Gluten",
      servingSize: "40 g",
      weight: "510 g",
      country: "United States",
      manufacturer: "The Quaker Oats Company",
      certifications: JSON.stringify(["100% Whole Grain", "Non-GMO"]),
      dietaryLabels: JSON.stringify(["Vegan", "Dairy-Free", "High Fiber", "Low Fat"]),
      aiSafetyStatus: "SAFE" as const,
      aiConfidenceScore: 0.96,
      nutrition: {
        calories: 150,
        protein: 5,
        carbohydrates: 27,
        sugar: 1,
        fiber: 4,
        fat: 3,
        saturatedFat: 0.5,
        transFat: 0,
        sodium: 0,
        potassium: 150,
        iron: 1.5,
        servingSize: "1/2 cup dry (40g)",
      },
    },
    {
      barcode: "042272001019",
      name: "Amy's Organic Creamy Tomato Soup",
      brandId: brandAmys.id,
      categoryId: catFastFood.id,
      image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80",
      description: "Rich, smooth soup made with sun-ripened organic tomatoes and fresh cream.",
      ingredients: "Organic Tomato Purée, Filtered Water, Organic Cream (Milk), Organic Cane Sugar, Sea Salt, Organic Onion Powder.",
      allergens: "Milk",
      servingSize: "245 g",
      weight: "400 g",
      country: "United States",
      manufacturer: "Amy's Kitchen Inc.",
      certifications: JSON.stringify(["USDA Organic", "Kosher"]),
      dietaryLabels: JSON.stringify(["Vegetarian", "Gluten-Free"]),
      aiSafetyStatus: "UNSAFE" as const,
      aiConfidenceScore: 0.99,
      nutrition: {
        calories: 140,
        protein: 3,
        carbohydrates: 20,
        sugar: 14,
        fiber: 2,
        fat: 6,
        saturatedFat: 3.5,
        transFat: 0,
        sodium: 680,
        calcium: 60,
        servingSize: "1 cup (245g)",
      },
    },
    {
      barcode: "028000018504",
      name: "Nestlé Milk Chocolate Bar",
      brandId: brandNestle.id,
      categoryId: catSnacks.id,
      image: "https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=800&q=80",
      description: "Classic smooth milk chocolate bar. Contains skim milk, cocoa butter, and roasted peanuts in facility.",
      ingredients: "Sugar, Milk, Cocoa Butter, Chocolate, Soy Lecithin, Artificial Flavor. Processed on equipment that processes Peanuts and Tree Nuts.",
      allergens: "Milk, Soy. May contain Peanuts, Tree Nuts.",
      servingSize: "43 g",
      weight: "43 g",
      country: "Switzerland",
      manufacturer: "Nestlé USA",
      certifications: JSON.stringify(["UTZ Certified Cocoa"]),
      dietaryLabels: JSON.stringify(["Vegetarian"]),
      aiSafetyStatus: "HIGH_RISK" as const,
      aiConfidenceScore: 0.97,
      nutrition: {
        calories: 220,
        protein: 3,
        carbohydrates: 25,
        sugar: 24,
        fiber: 1,
        fat: 13,
        saturatedFat: 8,
        transFat: 0,
        sodium: 40,
        calcium: 80,
        servingSize: "1 bar (43g)",
      },
    },
  ];

  for (const prodData of products) {
    const { nutrition, ...prodInfo } = prodData;
    await prisma.product.upsert({
      where: { barcode: prodInfo.barcode },
      update: {},
      create: {
        ...prodInfo,
        nutrition: {
          create: nutrition,
        },
      },
    });
  }

  // 8. Create Feature Flags
  const flags = [
    { name: "VISION_AI_ENABLED", description: "Enable Vision AI meal detection", enabled: true },
    { name: "OCR_EXTRACTION_ENABLED", description: "Enable ingredient label OCR scanner", enabled: true },
    { name: "AI_CHAT_ASSISTANT_ENABLED", description: "Enable AI Health Assistant chatbot", enabled: true },
    { name: "EMERGENCY_MODE_ENABLED", description: "Enable Emergency ICE Card & QR mode", enabled: true },
  ];

  for (const flag of flags) {
    await prisma.featureFlag.upsert({
      where: { name: flag.name },
      update: {},
      create: flag,
    });
  }

  console.log("✅ AllerScan database successfully seeded with Burgers, Pizzas, Oats, Almond Milk, etc.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
