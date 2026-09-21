const mongoose = require('mongoose');
const readline = require('readline');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {};

for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) {
    const [key, value] = args[i].split('=');
    if (value !== undefined) {
      options[key.replace('--', '')] = value;
    } else if (args[i + 1] && !args[i + 1].startsWith('--')) {
      options[key.replace('--', '')] = args[i + 1];
      i++;
    } else {
      options[key.replace('--', '')] = true;
    }
  }
}

if (!options.brand && !options.category && !options.size && !options.all) {
  console.log(`
Usage:
  node scripts/bulk-delete-products.js [options]

Options:
  --brand <name>      Delete products by brand name (e.g. "Kross")
  --category <name>   Delete products by category name (e.g. "Mountain Bikes")
  --size <size>       Delete products by size (e.g. "26T")
  --all               Delete ALL products in the database

Examples:
  node scripts/bulk-delete-products.js --brand Kross
  node scripts/bulk-delete-products.js --category "Kids Bikes"
  node scripts/bulk-delete-products.js --brand Hero --size 26T
  `);
  process.exit(1);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function run() {
  try {
    console.log('Connecting to database...');
    // Connect to the local MongoDB. Update this URI if your database is hosted elsewhere.
    await mongoose.connect('mongodb://127.0.0.1:27017/udaya-cycles');
    console.log('Connected successfully.');

    const Brand = mongoose.connection.collection('brands');
    const Category = mongoose.connection.collection('categories');
    const Product = mongoose.connection.collection('products');
    const ProductVariant = mongoose.connection.collection('productvariants');

    let query = {};

    if (!options.all) {
      if (options.brand) {
        const brand = await Brand.findOne({ name: { $regex: new RegExp(options.brand, 'i') } });
        if (!brand) {
          console.error(`Error: Brand matching "${options.brand}" not found in database.`);
          process.exit(1);
        }
        console.log(`Filtered by Brand: ${brand.name} (ID: ${brand._id})`);
        query.brand = brand._id;
      }

      if (options.category) {
        const category = await Category.findOne({ name: { $regex: new RegExp(options.category, 'i') } });
        if (!category) {
          console.error(`Error: Category matching "${options.category}" not found in database.`);
          process.exit(1);
        }
        console.log(`Filtered by Category: ${category.name} (ID: ${category._id})`);
        query.category = category._id;
      }

      if (options.size) {
        query.size = { $regex: new RegExp(options.size, 'i') };
        console.log(`Filtered by Size: matching "${options.size}"`);
      }
    } else {
      console.log('WARNING: --all flag provided. This will target ALL products!');
    }

    const productsCount = await Product.countDocuments(query);
    
    if (productsCount === 0) {
      console.log('\nNo products match your criteria. Exiting.');
      process.exit(0);
    }

    console.log(`\n======================================================`);
    console.log(`DANGER: You are about to delete ${productsCount} products and their variants.`);
    console.log(`======================================================`);
    
    rl.question('Are you sure you want to proceed? (yes/no): ', async (answer) => {
      if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        const products = await Product.find(query).project({ _id: 1 }).toArray();
        const productIds = products.map(p => p._id);
        
        const variantResult = await ProductVariant.deleteMany({ product: { $in: productIds } });
        console.log(`-> Deleted ${variantResult.deletedCount} product variants.`);

        const productResult = await Product.deleteMany(query);
        console.log(`-> Deleted ${productResult.deletedCount} products.`);
        
        console.log('\nCleanup complete.');
      } else {
        console.log('\nOperation aborted. No products were deleted.');
      }
      process.exit(0);
    });

  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  }
}

run();
