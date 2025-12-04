import "dotenv/config";
import { seedDatabase } from "./seedData";

console.log("🔧 GlowBridge Database Seeder");
console.log("=============================");

seedDatabase();