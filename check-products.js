const mongoose = require('mongoose');
require('dotenv').config({path: '.env.local'});
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const products = await db.collection('products').find({brand: {$in: ['Kross', 'British Eagle']}}).toArray();
  console.log(products.map(p => ({sku: p.sku, brand: p.brand, published: p.isPublished})));
  process.exit(0);
});
