/**
 * Seeds MongoDB with the same demo data that used to live in
 * backend/data/db.json (categories, products, delivery locations,
 * and the demo admin account).
 *
 * Run once, after MongoDB is connected and configured:
 *   npm run seed
 *
 * Safe to re-run — it clears the four collections below and
 * re-inserts fresh copies each time.
 */
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const DeliveryLocation = require('../models/DeliveryLocation');

const dbJsonPath = path.join(__dirname, '..', 'data', 'db.json');
const seedData = JSON.parse(fs.readFileSync(dbJsonPath, 'utf-8'));

async function seed() {
  await connectDB();

  console.log('Clearing existing users, categories, products, delivery locations...');
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    DeliveryLocation.deleteMany({})
  ]);

  console.log('Seeding categories...');
  const categoryIdByOldId = {}; // old "c-01" style id -> new Mongo _id
  for (const c of seedData.categories) {
    const created = await Category.create({
      name: c.name,
      slug: c.slug,
      description: c.description,
      icon: c.icon,
      image: c.image
    });
    categoryIdByOldId[c.id] = created._id;
  }

  console.log('Seeding products...');
  for (const p of seedData.products) {
    await Product.create({
      name: p.name,
      slug: p.slug,
      categoryId: categoryIdByOldId[p.categoryId],
      price: p.price,
      mrp: p.mrp,
      weight: p.weight,
      isPopular: !!p.isPopular,
      image: p.image,
      description: p.description,
      stock: p.stock ?? 0
    });
  }

  console.log('Seeding delivery locations...');
  for (const d of seedData.deliveryLocations) {
    await DeliveryLocation.create({
      city: d.city,
      state: d.state,
      deliveryCharge: d.deliveryCharge,
      freeDeliveryAbove: d.freeDeliveryAbove,
      estimatedDays: d.estimatedDays,
      isActive: d.isActive !== false
    });
  }

  console.log('Seeding users (demo admin account)...');
  for (const u of seedData.users) {
    // Passwords in db.json are already bcrypt-hashed, so they carry over as-is.
    await User.create({
      name: u.name,
      email: u.email.toLowerCase(),
      phone: u.phone,
      password: u.password,
      role: u.role,
      addresses: u.addresses || []
    });
  }

  console.log('✅ Seed complete!');
  console.log('   Demo admin login -> email: admin@lakshmimillets.com  password: Admin@123');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
