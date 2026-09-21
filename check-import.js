const mongoose = require('mongoose');
require('dotenv').config({path: '.env.local'});
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const importProducts = await db.collection('importproducts').find({}).toArray();
  console.log('Import Products count:', importProducts.length);
  const products = await db.collection('products').countDocuments();
  console.log('Total Published Products count:', await db.collection('products').countDocuments({isPublished: true}));
  console.log('Total Draft Products count:', await db.collection('products').countDocuments({isPublished: false}));
  process.exit(0);
});
