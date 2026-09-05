require('dotenv').config({path: '.env.local'});
const mongoose = require('mongoose');

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const radientBrand = await mongoose.connection.db.collection('brands').findOne({slug: 'radient'});
  const radiantBrand = await mongoose.connection.db.collection('brands').findOne({slug: 'radiant'});

  if (radientBrand && radiantBrand) {
    console.log('Moving products from Radiant to Radient...');
    const result = await mongoose.connection.db.collection('products').updateMany(
      { brand: radiantBrand._id },
      { $set: { brand: radientBrand._id } }
    );
    console.log(`Updated ${result.modifiedCount} products.`);
    
    console.log('Deleting duplicate Radiant brand...');
    await mongoose.connection.db.collection('brands').deleteOne({ _id: radiantBrand._id });
    console.log('Done!');
  } else {
    console.log('One of the brands not found.');
  }

  process.exit(0);
}
fix().catch(console.error);
