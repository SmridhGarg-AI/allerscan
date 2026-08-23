const { execSync } = require("child_process");

// Set default fallback DATABASE_URL if empty or missing in Vercel build environment
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === "") {
  process.env.DATABASE_URL = "file:./dev.db";
}

console.log("🚀 Running Vercel Build Script for AllerScan...");
console.log("ℹ️ Database URL:", process.env.DATABASE_URL);

try {
  console.log("📦 Syncing Prisma Database Schema...");
  execSync("npx prisma db push --accept-data-loss", {
    stdio: "inherit",
    env: process.env,
  });
} catch (err) {
  console.warn("⚠️ Warning during prisma db push:", err.message);
}

try {
  console.log("⚙️ Generating Prisma Client...");
  execSync("npx prisma generate", {
    stdio: "inherit",
    env: process.env,
  });
} catch (err) {
  console.error("❌ Prisma generate failed:", err.message);
  process.exit(1);
}

try {
  console.log("🏗️ Building Next.js Application...");
  execSync("npx next build", {
    stdio: "inherit",
    env: process.env,
  });
  console.log("✅ AllerScan Production Build Complete!");
} catch (err) {
  console.error("❌ Next build failed:", err.message);
  process.exit(1);
}
