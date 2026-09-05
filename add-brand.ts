import { connectDB } from "./src/lib/db/mongoose";
import Brand from "./src/models/Brand";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

async function run() {
  await connectDB();
  const existing = await Brand.findOne({ slug: "kross" });
  if (existing) {
    console.log("Kross brand already exists:", existing._id);
    process.exit(0);
  }

  const brand = new Brand({
    name: "Kross",
    slug: "kross",
    isActive: true,
  });

  await brand.save();
  console.log("Successfully created Kross brand:", brand._id);
  process.exit(0);
}

run().catch(console.error);
