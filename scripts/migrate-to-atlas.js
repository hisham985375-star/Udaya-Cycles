const { MongoClient } = require('mongodb');

const LOCAL_URI = "mongodb://localhost:27017/udaya-cycles";
const ATLAS_URI = "mongodb+srv://muhammedhisham:muhammed%409853@cluster0.jgsw2tf.mongodb.net/udaya-cycles?retryWrites=true&w=majority&appName=Cluster0";

async function migrate() {
  console.log("Connecting to Local MongoDB...");
  const localClient = await MongoClient.connect(LOCAL_URI);
  const localDb = localClient.db("udaya-cycles");
  
  console.log("Connecting to Atlas MongoDB...");
  const atlasClient = await MongoClient.connect(ATLAS_URI);
  const atlasDb = atlasClient.db("udaya-cycles");

  console.log("Connected to both databases successfully!\n");

  const collections = await localDb.listCollections().toArray();
  
  for (const collInfo of collections) {
    const collectionName = collInfo.name;
    console.log(`Migrating collection: ${collectionName}...`);
    
    const localCollection = localDb.collection(collectionName);
    const atlasCollection = atlasDb.collection(collectionName);
    
    const documents = await localCollection.find({}).toArray();
    
    if (documents.length > 0) {
      // Clear existing data in Atlas for this collection to avoid duplicates
      await atlasCollection.deleteMany({});
      
      // Insert all documents
      await atlasCollection.insertMany(documents);
      console.log(`✅ Copied ${documents.length} documents for ${collectionName}.`);
    } else {
      console.log(`⚠️ Collection ${collectionName} is empty. Skipped.`);
    }
  }

  console.log("\n🎉 Migration completed successfully!");
  
  await localClient.close();
  await atlasClient.close();
}

migrate().catch(console.error);
