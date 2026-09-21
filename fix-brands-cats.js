const mongoose = require('mongoose');

const PROD_URI = 'mongodb+srv://muhammedhisham:muhammed%409853@cluster0.jgsw2tf.mongodb.net/udaya-cycles?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(PROD_URI).then(async () => {
  const db = mongoose.connection.db;
  const categories = db.collection('categories');

  // These have image URLs set but need the isActive flag confirmed
  const activateCats = ['Roadster', 'Geared', 'Premium'];
  for (const name of activateCats) {
    const cat = await categories.findOne({ name });
    console.log(`[${name}]:`, cat ? `found, image=${cat.image?.url}, active=${cat.isActive}` : 'NOT FOUND');
  }

  // Also set brand logos in production for brands without logo
  const brands = db.collection('brands');
  const brandUpdates = [
    { name: 'Radiant', url: '/pictures/radiant-new-logo.png' },
    { name: 'Avon', url: '/pictures/avon-logo.png' },
    { name: 'Gang', url: '/pictures/gang-logo.png' },
    { name: 'Chase', url: '/pictures/chase-logo.png' },
    { name: 'Viva', url: '/pictures/viva-logo.png' },
    { name: 'Firefox', url: '/pictures/firefox-logo.png' },
    { name: 'Emotorad', url: '/pictures/emotorad-logo.png' },
    { name: 'Ninety one', url: '/pictures/ninety-one-logo.png' },
    { name: 'Raliegh', url: '/pictures/raleigh-logo.png' },
    { name: 'Suncross', url: '/pictures/suncross-logo.png' },
    { name: 'Kross', url: '/pictures/kross-logo.jpg' },
    { name: 'British Eagle', url: '/pictures/british-eagle-logo.jpg' },
  ];

  console.log('\n--- Fixing brand logos ---');
  for (const u of brandUpdates) {
    const res = await brands.updateOne(
      { name: u.name },
      { $set: { 'logo.url': u.url, 'logo.publicId': '', isActive: true } }
    );
    console.log(`  [${u.name}] updated: ${res.modifiedCount} doc`);
  }

  console.log('\n✅ All fixed!');
  process.exit(0);
});
