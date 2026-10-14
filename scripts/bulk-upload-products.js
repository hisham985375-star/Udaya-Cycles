const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

// Cloudinary configuration (from upload-to-cloudinary.js)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'udsti7q9',
  api_key: process.env.CLOUDINARY_API_KEY || '773254967672383',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'oYJQ1GgeutLjjv0NL3McuSg7vxo',
});

const PICTURES_BASE = path.resolve(__dirname, '../../pictures');

// Brand folder mappings
const BRAND_CONFIGS = {
  avon: {
    name: 'Avon',
    folder: path.join(PICTURES_BASE, 'Avon Images', 'Avon_67_Transparent_PNGs'),
    matchStrategy: 'index_order', // 01 to 67 exact order
  },
  'british eagle': {
    name: 'British Eagle',
    folder: path.join(PICTURES_BASE, 'British Eagle Images'),
    matchStrategy: 'name_matching',
  },
  kross: {
    name: 'Kross',
    folder: path.join(PICTURES_BASE, 'Kross Images', 'Kross_83_Transparent_PNGs'),
    matchStrategy: 'name_matching',
  },
  gang: {
    name: 'Gang',
    folder: path.join(PICTURES_BASE, 'Gang Images'),
    matchStrategy: 'name_matching',
  },
};

async function processBrand(brandKey, isDryRun) {
  const config = BRAND_CONFIGS[brandKey];
  if (!config) {
    console.error(`❌ Brand "${brandKey}" not recognized. Available: ${Object.keys(BRAND_CONFIGS).join(', ')}`);
    return;
  }

  if (!fs.existsSync(config.folder)) {
    console.error(`❌ Folder not found: ${config.folder}`);
    return;
  }

  console.log(`\n====================================================`);
  console.log(`📦 PROCESSING BRAND: ${config.name.toUpperCase()}`);
  console.log(`====================================================`);

  const pngFiles = fs.readdirSync(config.folder)
    .filter(f => f.toLowerCase().endsWith('.png'))
    .sort();

  console.log(`📁 Found ${pngFiles.length} PNG images in ${config.folder}`);

  const db = mongoose.connection.db;
  const brandDoc = await db.collection('brands').findOne({
    name: { $regex: new RegExp(`^${config.name}$`, 'i') }
  });

  if (!brandDoc) {
    console.error(`❌ Brand "${config.name}" not found in database.`);
    return;
  }

  const products = await db.collection('products')
    .find({ brand: brandDoc._id })
    .sort({ createdAt: 1, _id: 1 })
    .toArray();

  console.log(`📦 Found ${products.length} products in database for brand "${config.name}"`);

  // Specific brand manual aliases for perfect matching
  const BRITISH_EAGLE_ALIASES = {
    'bagheera': 'British_Eagle_Black_Bagheera.png',
    'fat bike': 'British_Eagle_Haksen_Fat_Bike_Multi_Speed.png',
    'ximingsa': 'British_Eagle_Xninja.png',
    'urbanix 2.0': 'British_Eagle_UrbanX_2.0_Multi_Speed.png',
    'hybrid': 'British_Eagle_UrbanX_2.0_Single_Speed.png',
    'falcon 2.0 mag wheel': 'British_Eagle_Falcon_2.0_Mag_Wheel.png',
    'jarvis mag wheel': 'British_Eagle_Jarvis_Mag_Wheel.png',
    'hardy mag wheel': 'British_Eagle_Hardy_Mag_Wheel.png',
    'xcool': '20_KROSS_XCOOT_26T_SS_IBC.png',
    'ice berg ibc': '57_KROSS_ICE_BERG_20T_IBC.png',
    'berlin': '12_KROSS_BERLIN_27.5T_MS.png',
  };

  // Replace spelling variations like Juvenyle -> juvenile, yoodha -> yoddha
  function normalizeSpelling(str) {
    return str.toLowerCase()
      .replace(/juvenyle/g, 'juvenile')
      .replace(/yoodha/g, 'yoddha');
  }

  // Build match plan
  const plan = [];
  if (config.matchStrategy === 'index_order') {
    products.forEach((prod, idx) => {
      const file = pngFiles[idx];
      plan.push({
        product: prod,
        file: file || null,
        filePath: file ? path.join(config.folder, file) : null,
      });
    });
  } else {
    const pool = [...pngFiles];
    // Sort products by name length descending so specific names (e.g. "Jarvis Mag Wheel", "Falcon 2.0 Mag Wheel") match before short ones ("Jarvis", "Falcon 2.0")
    const sortedProductsWithIndex = products.map((prod, idx) => ({ prod, originalIdx: idx }));
    sortedProductsWithIndex.sort((a, b) => b.prod.name.length - a.prod.name.length);

    const resultMap = new Array(products.length);

    sortedProductsWithIndex.forEach(({ prod, originalIdx }) => {
      const lowerName = prod.name.trim().toLowerCase();
      
      let file = null;
      if (BRITISH_EAGLE_ALIASES[lowerName] && pool.includes(BRITISH_EAGLE_ALIASES[lowerName])) {
        const idx = pool.indexOf(BRITISH_EAGLE_ALIASES[lowerName]);
        file = pool.splice(idx, 1)[0];
      } else {
        const cleanProdName = normalizeSpelling(lowerName).replace(/[^a-z0-9]/g, '');

        // 1. Exact clean match
        let matchIdx = pool.findIndex(f => {
          const cleanFile = normalizeSpelling(f).replace(/^british_eagle_|^gang_/, '').replace(/\.png$/, '').replace(/[^a-z0-9]/g, '');
          return cleanFile === cleanProdName;
        });

        // 2. Starts with / includes
        if (matchIdx === -1) {
          matchIdx = pool.findIndex(f => {
            const cleanFile = normalizeSpelling(f).replace(/^british_eagle_|^gang_/, '').replace(/\.png$/, '').replace(/[^a-z0-9]/g, '');
            return cleanFile.includes(cleanProdName) || cleanProdName.includes(cleanFile);
          });
        }

        if (matchIdx !== -1) {
          file = pool.splice(matchIdx, 1)[0];
        }
      }

      resultMap[originalIdx] = {
        product: prod,
        file: file,
        filePath: file ? path.join(config.folder, file) : null,
      };
    });

    plan.push(...resultMap);
  }

  console.log('📋 MATCHING SUMMARY:');
  plan.forEach((item, i) => {
    const status = item.file ? `✅ ${item.file}` : `❌ NO FILE`;
    console.log(`  [${String(i + 1).padStart(2)}] [${item.product.sku}] "${item.product.name}" (size ${item.product.size || '-'}) -> ${status}`);
  });

  const matchedCount = plan.filter(p => p.file).length;
  console.log(`\nMatched: ${matchedCount} / ${products.length} products.`);

  if (isDryRun) {
    console.log('\n🔍 DRY RUN COMPLETE for this brand. No files uploaded, no database changes made.');
    return;
  }

  // Live execution
  console.log('\n🚀 Starting Live Upload to Cloudinary & Database Sync...\n');
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < plan.length; i++) {
    const item = plan[i];
    if (!item.filePath || !fs.existsSync(item.filePath)) {
      console.log(`  ⏩ Skipping [${item.product.sku}] "${item.product.name}" (no valid file)`);
      continue;
    }

    try {
      const publicId = `udaya-cycles/products/${config.name.toLowerCase()}_${item.product.sku.toLowerCase()}`;
      console.log(`  📤 Uploading (${i + 1}/${plan.length}): ${item.file}...`);
      
      const uploadRes = await cloudinary.uploader.upload(item.filePath, {
        public_id: publicId,
        overwrite: true,
        quality: 'auto',
        fetch_format: 'auto',
        transformation: [{ width: 1200, crop: 'limit' }],
      });

      const newImage = {
        url: uploadRes.secure_url,
        publicId: uploadRes.public_id,
        alt: item.product.name,
        sortOrder: 0,
        isDefault: true,
      };

      await db.collection('products').updateOne(
        { _id: item.product._id },
        {
          $set: {
            images: [newImage],
            updatedAt: new Date(),
          }
        }
      );

      console.log(`     ✅ Synced: "${item.product.name}" -> ${uploadRes.secure_url}`);
      successCount++;
    } catch (err) {
      console.error(`     ❌ Error uploading "${item.product.name}":`, err.message);
      failCount++;
    }
  }

  console.log('\n====================================================');
  console.log(`🎉 BRAND [${config.name.toUpperCase()}] COMPLETED:`);
  console.log(`   ✅ Successfully updated: ${successCount} products`);
  console.log(`   ❌ Failed: ${failCount} products`);
  console.log('====================================================');
}

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const targetBrandArg = args.find(a => !a.startsWith('--'))?.toLowerCase() || 'avon';

  console.log('====================================================');
  console.log(`🚲 UDAYA CYCLES - BULK PRODUCT IMAGE UPLOADER`);
  console.log(`Mode: ${isDryRun ? '🔍 DRY RUN (Simulation only, no uploads)' : '🚀 LIVE UPLOAD & DB SYNC'}`);
  console.log(`Target: ${targetBrandArg.toUpperCase()}`);
  console.log('====================================================');

  await mongoose.connect(process.env.MONGODB_URI);

  if (targetBrandArg === 'all') {
    for (const key of Object.keys(BRAND_CONFIGS)) {
      await processBrand(key, isDryRun);
    }
  } else {
    await processBrand(targetBrandArg, isDryRun);
  }

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
