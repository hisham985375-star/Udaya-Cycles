// Seed script for initial admin creation
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Please define the MONGODB_URI environment variable inside .env.local");
  process.exit(1);
}

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["superadmin", "manager", "support"], default: "manager" },
  isActive: { type: Boolean, default: true },
});

const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    const existingSuperAdmin = await Admin.findOne({ role: "superadmin" });
    if (existingSuperAdmin) {
      console.log("Superadmin already exists. Skipping seed.");
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("admin123", salt);

    await Admin.create({
      username: "admin",
      passwordHash,
      role: "superadmin",
    });

    console.log("Successfully created default superadmin (username: admin, password: admin123).");
    console.log("PLEASE CHANGE THIS PASSWORD IMMEDIATELY AFTER LOGGING IN.");
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();
