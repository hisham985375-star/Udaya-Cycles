import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import mongoose from "mongoose";
import Brand from "./src/models/Brand";

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const brands = await Brand.find({}, 'name slug isActive');
  console.log(brands);
  process.exit(0);
}
run().catch(console.error);
