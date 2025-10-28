import fs from 'fs';
import colors from 'colors';
import dotenv from 'dotenv';
import ProductModel from '../../models/ProductModel.js';
import connectDB from '../../config/database.js';
import Category from '../../models/CategoryModel.js';
// Load environment variables
dotenv.config({ path: '../../config.env' });
// Connect to the database
connectDB();

// 🟢 Insert data into DB
const insertData = async () => {
  try {
    // Load products data from JSON file
    const products = JSON.parse(fs.readFileSync(new URL('./products.json', import.meta.url)));

    // For each product
    for (const product of products) {
      // 1️⃣ Find or create category
      let categoryDoc = await Category.findOne({ name: product.category });

      if (!categoryDoc) {
        categoryDoc = await Category.create({
          name: product.category,
          slug: product.category.toLowerCase().replace(/\s+/g, '-'),
        });
        console.log(`🆕 Created category: ${categoryDoc.name}`);
      }

      // 2️⃣ Replace category name with _id
      product.category = categoryDoc._id;

      // 3️⃣ Insert product
      await ProductModel.create(product);
      console.log(`✅ Inserted: ${product.title}`);
    }

    console.log('🎉 All products inserted successfully');
    process.exit();
  } catch (error) {
    console.error('❌ Error inserting data:'.red, error);
    process.exit(1);
  }
};

// 🔴 Delete all data from DB
const destroyData = async () => {
  try {
    await ProductModel.deleteMany();
    console.log('🗑️  All Data Deleted'.red.inverse);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error deleting data:'.red, error);
    process.exit(1);
  }
};

// ⚙️ Command-line options
// Run: node seeder.js -i  → Insert data
// Run: node seeder.js -d  → Delete data
if (process.argv[2] === '-i') {
  insertData();
} else if (process.argv[2] === '-d') {
  destroyData();
} else {
  console.log(
    `
Usage:
  node seeder.js -i   Insert products
  node seeder.js -d   Delete products
  `.yellow
  );
  process.exit();
}
// node seeder.js -i products
