import { config } from 'dotenv';
config({ path: '.env.local' });
import { connectDB } from './src/lib/db/mongoose';
import Category from './src/models/Category';

async function run() {
  await connectDB();
  const cats = await Category.find();
  console.log(cats.map(x => `${x.name} - ${x.slug}`));
  process.exit(0);
}
run();
