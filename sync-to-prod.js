const mongoose = require('mongoose');

const LOCAL_URI = 'mongodb://localhost:27017/udaya-cycles';
const PROD_URI = 'mongodb+srv://muhammedhisham:muhammed%409853@cluster0.jgsw2tf.mongodb.net/udaya-cycles?retryWrites=true&w=majority&appName=Cluster0';

// Collections to sync from local -> production
const COLLECTIONS = [
  'brands',
  'categories',
  'products',
  'productvariants',
  'priceranges',
  'admins',
  'faqs',
  'storelocations',
  'homepagesettings',
  'legalpages',
  'categorymappings',
];

async function sync() {
  console.log('\n🔌 Connecting to LOCAL database...');
  const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
  const localDb = localConn.db;
  console.log('✅ Connected to local:', localDb.databaseName);

  console.log('\n🔌 Connecting to PRODUCTION database...');
  const prodConn = await mongoose.createConnection(PROD_URI).asPromise();
  const prodDb = prodConn.db;
  console.log('✅ Connected to production:', prodDb.databaseName);

  for (const collName of COLLECTIONS) {
    try {
      const localColl = localDb.collection(collName);
      const prodColl = prodDb.collection(collName);

      const docs = await localColl.find({}).toArray();
      if (docs.length === 0) {
        console.log(`\n⚪ [${collName}] No documents found locally — skipping.`);
        continue;
      }

      console.log(`\n📦 [${collName}] Syncing ${docs.length} documents...`);

      // Drop production collection and re-insert everything fresh
      await prodColl.drop().catch(() => {}); // ignore error if collection doesn't exist
      const result = await prodColl.insertMany(docs, { ordered: false });
      console.log(`   ✅ Inserted ${result.insertedCount} documents into production [${collName}]`);
    } catch (err) {
      console.error(`   ❌ Error syncing [${collName}]:`, err.message);
    }
  }

  console.log('\n🎉 Sync complete! Closing connections...');
  await localConn.close();
  await prodConn.close();
  console.log('✅ Done.');
  process.exit(0);
}

sync().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
