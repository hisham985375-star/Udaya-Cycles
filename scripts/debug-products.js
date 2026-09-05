require('dotenv').config({path: '.env.local'});
const mongoose = require('mongoose');
require('./src/models/Product.ts');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Product = mongoose.models.Product;
  const brand = await mongoose.connection.db.collection('brands').findOne({slug: 'radiant'});
  
  const countMongoose = await Product.countDocuments({ brand: brand._id });
  console.log('Mongoose Count with {brand}:', countMongoose);

  const countWithNull = await Product.countDocuments({ brand: brand._id, deletedAt: null });
  console.log('Mongoose Count with {brand, deletedAt: null}:', countWithNull);

  const countNative = await mongoose.connection.db.collection('products').countDocuments({ brand: brand._id, deletedAt: null });
  console.log('Native Count with {brand, deletedAt: null}:', countNative);

  process.exit(0);
}
check().catch(console.error);
