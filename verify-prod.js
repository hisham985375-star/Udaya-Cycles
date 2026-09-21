const mongoose = require('mongoose');

const PROD_URI = 'mongodb+srv://muhammedhisham:muhammed%409853@cluster0.jgsw2tf.mongodb.net/udaya-cycles?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(PROD_URI).then(async () => {
  const db = mongoose.connection.db;
  const products = await db.collection('products').countDocuments();
  const published = await db.collection('products').countDocuments({isPublished: true});
  const brands = await db.collection('brands').countDocuments({isActive: true});
  const categories = await db.collection('categories').countDocuments({isActive: true});

  console.log('✅ PRODUCTION DATABASE STATUS:');
  console.log('  Total Products  :', products);
  console.log('  Published       :', published);
  console.log('  Active Brands   :', brands);
  console.log('  Active Categories:', categories);

  const brandList = await db.collection('brands').find({isActive: true}).toArray();
  console.log('\n  Brands:', brandList.map(b => b.name).join(', '));

  const catList = await db.collection('categories').find({isActive: true}).toArray();
  console.log('  Categories:', catList.map(c => c.name).join(', '));

  process.exit(0);
});
