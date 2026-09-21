import { config } from 'dotenv';
config({ path: '.env.local' });
import { connectDB } from './src/lib/db/mongoose';
import Category from './src/models/Category';
import Product from './src/models/Product';

async function mergeCategories() {
  await connectDB();
  
  const kidsCycles = await Category.findOne({ slug: 'kids-bicycles' });
  const kids = await Category.findOne({ slug: 'kids-3322' });
  
  if (kidsCycles && kids) {
    const res = await Product.updateMany(
      { category: kidsCycles._id },
      { $set: { category: kids._id } }
    );
    console.log(`Moved ${res.modifiedCount} products from Kids Cycles to Kids`);
    
    // Disable old category
    kidsCycles.isActive = false;
    await kidsCycles.save();
    console.log(`Disabled Kids Cycles category`);
  }

  const girlsCycles = await Category.findOne({ slug: 'girl-s-bicycles' });
  const ladies = await Category.findOne({ slug: 'ladies-3473' });

  if (girlsCycles && ladies) {
    const res = await Product.updateMany(
      { category: girlsCycles._id },
      { $set: { category: ladies._id } }
    );
    console.log(`Moved ${res.modifiedCount} products from Girl's Cycles to Ladies`);
    
    // Disable old category
    girlsCycles.isActive = false;
    await girlsCycles.save();
    console.log(`Disabled Girl's Cycles category`);
  }

  // Ensure Kids and Ladies are active
  if (kids) {
    kids.isActive = true;
    await kids.save();
  }
  if (ladies) {
    ladies.isActive = true;
    await ladies.save();
  }

  console.log('Done!');
  process.exit(0);
}

mergeCategories();
