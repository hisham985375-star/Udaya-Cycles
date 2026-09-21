import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import mongoose from "mongoose";
import Product from "../src/models/Product";

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    const krossBrandId = "6a9909d68678feb1bdea9671";
    const result = await Product.deleteMany({ brand: krossBrandId });
    console.log(`Deleted ${result.deletedCount} products for Kross brand.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
