#!/usr/bin/env node

/**
 * Pre-flight check script
 * Validates that the server is properly configured before starting
 */

import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const checks = [];

// 1. Check .env file
console.log("\n🔍 Running pre-flight checks...\n");

if (!fs.existsSync(".env")) {
  checks.push({
    name: "Environment file (.env)",
    status: "⚠️",
    message: "Not found. Copy .env.example → .env and fill in values.",
  });
} else {
  checks.push({
    name: "Environment file (.env)",
    status: "✅",
    message: "Found",
  });
}

// 2. Check MongoDB URI
if (!process.env.MONGO_URI) {
  checks.push({
    name: "MONGO_URI",
    status: "❌",
    message: "Not set. Add to .env: MONGO_URI=mongodb+srv://...",
  });
} else {
  checks.push({
    name: "MONGO_URI",
    status: "✅",
    message: "Set",
  });
}

// 3. Check Node modules
if (!fs.existsSync("node_modules")) {
  checks.push({
    name: "Dependencies (node_modules)",
    status: "⚠️",
    message: "Not found. Run: npm install",
  });
} else {
  checks.push({
    name: "Dependencies (node_modules)",
    status: "✅",
    message: "Installed",
  });
}

// 4. Check M-Pesa config (optional but recommended)
const mpesaVars = ["MPESA_CONSUMER_KEY", "MPESA_CONSUMER_SECRET", "MPESA_SHORT_CODE", "MPESA_PASS_KEY"];
const hasMpesa = mpesaVars.every((v) => process.env[v]);
if (!hasMpesa) {
  checks.push({
    name: "M-Pesa Configuration",
    status: "⚠️",
    message: "Not configured (optional). Add to .env if using M-Pesa payments.",
  });
} else {
  checks.push({
    name: "M-Pesa Configuration",
    status: "✅",
    message: "Configured",
  });
}

// 5. Check Email config (optional)
const emailVars = ["EMAIL_USER", "EMAIL_PASS"];
const hasEmail = emailVars.every((v) => process.env[v]);
if (!hasEmail) {
  checks.push({
    name: "Email Configuration",
    status: "⚠️",
    message: "Not configured (optional). Add to .env if using order emails.",
  });
} else {
  checks.push({
    name: "Email Configuration",
    status: "✅",
    message: "Configured",
  });
}

// Print results
console.log("═".repeat(60));
checks.forEach(({ name, status, message }) => {
  console.log(`${status} ${name.padEnd(35)} ${message}`);
});
console.log("═".repeat(60));

// Check if critical issues
const hasErrors = checks.some((c) => c.status === "❌");
const hasWarnings = checks.some((c) => c.status === "⚠️");

if (hasErrors) {
  console.error("\n❌ Critical issues found. Fix them before running the server.\n");
  process.exit(1);
}

if (hasWarnings) {
  console.warn("\n⚠️  Some optional features not configured. Server will work but with limited features.\n");
}

console.log("✅ Pre-flight checks complete! Server is ready to start.\n");
process.exit(0);
