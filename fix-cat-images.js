const mongoose = require('mongoose');

const PROD_URI = 'mongodb+srv://muhammedhisham:muhammed%409853@cluster0.jgsw2tf.mongodb.net/udaya-cycles?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(PROD_URI).then(async () => {
  const db = mongoose.connection.db;
  const categories = db.collection('categories');

  const updates = [
    { name: 'Kids Cycles', url: '/pictures/kids category img.png' },
    { name: "Girl's Cycles", url: '/pictures/girls category img 2.png' },
    { name: 'MTB Cycles', url: '/pictures/mtb category img.png' },
    { name: 'Electric Cycles', url: '/pictures/electric-category.png' },
    { name: 'Hybrid', url: '/pictures/hybrid-category.png' },
    { name: 'Roadster', url: '/pictures/roadsters-category.png' },
    { name: 'Geared', url: '/pictures/geared-category.png' },
    { name: 'Premium', url: '/pictures/premium-category.webp' },
  ];

  for (const u of updates) {
    const res = await categories.updateOne(
      { name: u.name },
      { $set: { 'image.url': u.url, 'image.publicId': '' } }
    );
    console.log(`  [${u.name}] updated: ${res.modifiedCount} doc`);
  }

  // Make sure all relevant categories are active
  await categories.updateMany(
    { name: { $in: updates.map(u => u.name) } },
    { $set: { isActive: true } }
  );

  console.log('\n✅ Category images updated in production!');
  process.exit(0);
});
