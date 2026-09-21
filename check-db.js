const mongoose = require('mongoose');
require('dotenv').config({path: '.env.local'});

console.log('Connecting to:', process.env.MONGODB_URI ? process.env.MONGODB_URI.replace(/\/\/.*@/, '//<hidden>@') : 'NOT SET');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const dbName = db.databaseName;
  const host = mongoose.connection.host;
  console.log('Connected DB Name:', dbName);
  console.log('Host:', host);
  const productCount = await db.collection('products').countDocuments();
  const publishedCount = await db.collection('products').countDocuments({isPublished: true});
  const brandCount = await db.collection('brands').countDocuments();
  console.log('Total products:', productCount, '| Published:', publishedCount, '| Brands:', brandCount);
  process.exit(0);
});
