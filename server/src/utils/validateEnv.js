/**
 * Environment validation utility
 * Checks that all required env vars are set
 */

export function validateEnv() {
  const missingVars = [];

  // Backend env vars
  if (typeof window === "undefined") {
    // Only run on server
    const required = ["MONGO_URI"];
    for (const key of required) {
      if (!process.env[key]) {
        missingVars.push(key);
      }
    }
  }

  if (missingVars.length > 0) {
    console.error("❌ Missing required environment variables:");
    missingVars.forEach((v) => console.error(`   - ${v}`));
    console.error("   Please set these in your .env file");
    process.exit(1);
  }

  console.log("✅ All required environment variables are set");
}

export function getEnvConfig() {
  return {
    // Server config
    API_BASE: process.env.API_BASE || "http://localhost:5000",
    API_TIMEOUT: parseInt(process.env.API_TIMEOUT || "30000", 10),

    // Features
    ENABLE_M_PESA: process.env.ENABLE_M_PESA !== "false",
    ENABLE_EMAIL: process.env.ENABLE_EMAIL !== "false",
    ENABLE_SCRAPING: process.env.ENABLE_SCRAPING !== "false",

    // Marketplace sources
    MARKETPLACE_SOURCES: (process.env.MARKETPLACE_SOURCES || "Jumia,Kilimall,Amazon").split(","),
  };
}
