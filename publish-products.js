const mongoose = require('mongoose');
require('dotenv').config({path: '.env.local'});
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const res = await db.collection('products').updateMany({isPublished: false}, {$set: {isPublished: true}});
  console.log('Published', res.modifiedCount, 'products');
  process.exit(0);
});
