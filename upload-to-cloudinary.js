const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const PROD_URI = 'mongodb+srv://muhammedhisham:muhammed%409853@cluster0.jgsw2tf.mongodb.net/udaya-cycles?retryWrites=true&w=majority&appName=Cluster0';

cloudinary.config({
  cloud_name: 'udsti7q9',
  api_key: '773254967672383',
  api_secret: 'oYJQ1GgeutLjjv0NL3McuSg7vxo',
});

// Map: local file path -> Cloudinary public_id
const imagesToUpload = [
  // Category images
  { local: 'public/pictures/mtb category img.png',       publicId: 'udaya-cycles/categories/mtb-cycles',         name: 'MTB Cycles' },
  { local: 'public/pictures/kids category img.png',      publicId: 'udaya-cycles/categories/kids-cycles',        name: 'Kids Cycles' },
  { local: 'public/pictures/girls category img 2.png',   publicId: 'udaya-cycles/categories/girls-cycles',       name: "Girl's Cycles" },
  { local: 'public/pictures/electric-category.png',      publicId: 'udaya-cycles/categories/electric-cycles',    name: 'Electric Cycles' },
  { local: 'public/pictures/hybrid-category.png',        publicId: 'udaya-cycles/categories/hybrid',             name: 'Hybrid' },
  { local: 'public/pictures/roadsters-category.png',     publicId: 'udaya-cycles/categories/roadster',           name: 'Roadster' },
  { local: 'public/pictures/geared-category.png',        publicId: 'udaya-cycles/categories/geared',             name: 'Geared' },
  { local: 'public/pictures/premium-category.webp',      publicId: 'udaya-cycles/categories/premium',            name: 'Premium' },
  // Brand logos
  { local: 'public/pictures/radiant-new-logo.png',       publicId: 'udaya-cycles/brands/radiant',                brandName: 'Radiant' },
  { local: 'public/pictures/avon-logo.png',              publicId: 'udaya-cycles/brands/avon',                   brandName: 'Avon' },
  { local: 'public/pictures/gang-logo.png',              publicId: 'udaya-cycles/brands/gang',                   brandName: 'Gang' },
  { local: 'public/pictures/chase-logo.png',             publicId: 'udaya-cycles/brands/chase',                  brandName: 'Chase' },
  { local: 'public/pictures/viva-logo.png',              publicId: 'udaya-cycles/brands/viva',                   brandName: 'Viva' },
  { local: 'public/pictures/firefox-logo.png',           publicId: 'udaya-cycles/brands/firefox',                brandName: 'Firefox' },
  { local: 'public/pictures/emotorad-logo.png',          publicId: 'udaya-cycles/brands/emotorad',               brandName: 'Emotorad' },
  { local: 'public/pictures/ninety-one-logo.png',        publicId: 'udaya-cycles/brands/ninety-one',             brandName: 'Ninety one' },
  { local: 'public/pictures/raleigh-logo.png',           publicId: 'udaya-cycles/brands/raliegh',                brandName: 'Raliegh' },
  { local: 'public/pictures/suncross-logo.png',          publicId: 'udaya-cycles/brands/suncross',               brandName: 'Suncross' },
  { local: 'public/pictures/kross-logo.jpg',             publicId: 'udaya-cycles/brands/kross',                  brandName: 'Kross' },
  { local: 'public/pictures/british-eagle-logo.png',     publicId: 'udaya-cycles/brands/british-eagle',          brandName: 'British Eagle' },
];

async function uploadAndUpdate() {
  console.log('🔌 Connecting to production database...');
  await mongoose.connect(PROD_URI);
  const db = mongoose.connection.db;
  const categories = db.collection('categories');
  const brands = db.collection('brands');

  const cloudinaryUrls = {};

  console.log('\n📤 Uploading images to Cloudinary CDN...\n');
  for (const img of imagesToUpload) {
    const localPath = path.join(__dirname, img.local);
    if (!fs.existsSync(localPath)) {
      console.log(`  ⚠️  File not found: ${img.local} — skipping`);
      continue;
    }
    try {
      const result = await cloudinary.uploader.upload(localPath, {
        public_id: img.publicId,
        overwrite: true,
        quality: 'auto',
        fetch_format: 'auto',
        transformation: [{ width: 800, crop: 'limit' }],
      });
      cloudinaryUrls[img.publicId] = result.secure_url;
      console.log(`  ✅ Uploaded: ${img.local.split('/').pop()}`);
      console.log(`     → ${result.secure_url}`);
    } catch (err) {
      console.error(`  ❌ Failed to upload ${img.local}:`, err.message);
    }
  }

  console.log('\n💾 Updating database with Cloudinary URLs...\n');

  // Update categories
  for (const img of imagesToUpload) {
    if (!img.name) continue;
    const url = cloudinaryUrls[img.publicId];
    if (!url) continue;
    const res = await categories.updateOne(
      { name: img.name },
      { $set: { 'image.url': url, 'image.publicId': img.publicId } }
    );
    console.log(`  [Category: ${img.name}] updated: ${res.modifiedCount}`);
  }

  // Update brands
  for (const img of imagesToUpload) {
    if (!img.brandName) continue;
    const url = cloudinaryUrls[img.publicId];
    if (!url) continue;
    const res = await brands.updateOne(
      { name: img.brandName },
      { $set: { 'logo.url': url, 'logo.publicId': img.publicId } }
    );
    console.log(`  [Brand: ${img.brandName}] updated: ${res.modifiedCount}`);
  }

  console.log('\n🎉 All images uploaded to Cloudinary CDN and DB updated!');
  await mongoose.disconnect();
  process.exit(0);
}

uploadAndUpdate().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
