import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function updateCategoryOrder() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("Connected to DB");

    const order = [
      { nameRegex: /mtb/i, order: 1 },
      { nameRegex: /kids/i, order: 2 },
      { nameRegex: /(girl|ladies)/i, order: 3 },
      { nameRegex: /electric/i, order: 4 },
    ];

    // Reset all to 99 first just in case
    await mongoose.connection.collection("categories").updateMany({}, { $set: { sortOrder: 99 } });

    for (const item of order) {
      const result = await mongoose.connection.collection("categories").updateMany(
        { name: item.nameRegex },
        { $set: { sortOrder: item.order } }
      );
      console.log(`Updated ${item.nameRegex}: ${result.modifiedCount} modified`);
    }

    console.log("Done");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

updateCategoryOrder();
