const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function verify() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const brands = await db.collection('brands').find().toArray();
  console.log('==================================================');
  console.log('BRAND            | TOTAL CYCLES | WITH IMAGES');
  console.log('==================================================');

  let grandTotal = 0;
  let grandWithImg = 0;

  for (const b of brands) {
    const total = await db.collection('products').countDocuments({ brand: b._id });
    const withImg = await db.collection('products').countDocuments({
      brand: b._id,
      'images.0': { $exists: true }
    });
    if (total > 0) {
      console.log(`${b.name.padEnd(16)} | ${String(total).padStart(12)} | ${String(withImg).padStart(11)}`);
      grandTotal += total;
      grandWithImg += withImg;
    }
  }

  console.log('==================================================');
  console.log(`TOTAL            | ${String(grandTotal).padStart(12)} | ${String(grandWithImg).padStart(11)}`);
  console.log('==================================================');

  await mongoose.disconnect();
}

verify().catch(console.error);
