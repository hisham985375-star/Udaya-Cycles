require('dotenv').config({path: '.env.local'});
const mongoose = require('mongoose');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const count = await mongoose.connection.db.collection('products').countDocuments({name: { $regex: 'radiant', $options: 'i' }});
  console.log('Products with radiant in name:', count);
  
  const allBrands = await mongoose.connection.db.collection('brands').find().toArray();
  console.log('Brands:', allBrands.map(b => b.name));
  process.exit(0);
}
check().catch(console.error);
