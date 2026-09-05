import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import mongoose from "mongoose";
import Category from "./src/models/Category";

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const categories = await Category.find({}, 'name slug isActive');
  console.log(categories);
  process.exit(0);
}
run().catch(console.error);
