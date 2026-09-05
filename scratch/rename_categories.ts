import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function renameCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("Connected to DB");

    const categories = await mongoose.connection.collection("categories").find({}).toArray();

    for (const cat of categories) {
      if (cat.name && cat.name.includes("Bicycle")) {
        const newName = cat.name.replace(/Bicycle/g, "Cycle");
        await mongoose.connection.collection("categories").updateOne(
          { _id: cat._id },
          { $set: { name: newName } }
        );
        console.log(`Renamed "${cat.name}" to "${newName}"`);
      }
    }

    console.log("Done");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

renameCategories();
