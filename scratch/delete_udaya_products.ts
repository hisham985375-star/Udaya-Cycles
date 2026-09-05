import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { connectDB } from "../src/lib/db/mongoose";
import Product from "../src/models/Product";
import Brand from "../src/models/Brand";

async function removeUdayaProducts() {
  try {
    await connectDB();
    console.log("Connected to DB");

    const brand = await Brand.findOne({ name: { $regex: /udaya/i } });
    if (!brand) {
      console.log("Could not find a brand matching 'udaya'.");
      process.exit(0);
    }
    console.log(`Found brand: ${brand.name} (${brand._id})`);

    // Perform a soft delete as per the application's logic (setting deletedAt and isActive = false)
    const result = await Product.updateMany(
      { brand: brand._id },
      { $set: { deletedAt: new Date(), isActive: false } }
    );

    console.log(`Successfully soft-deleted ${result.modifiedCount} products associated with brand ${brand.name}.`);
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

removeUdayaProducts();
