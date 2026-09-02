const express = require('express');
const Category = require('../models/Category');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');
const router = express.Router();

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// ------------------------------------------------------------------
// Public routes
// ------------------------------------------------------------------

// GET /api/categories - list all categories (used for the top strip + "Shop by Category")
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/categories/:slug
router.get('/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ------------------------------------------------------------------
// Admin routes (require a valid JWT for a user with role "admin")
// ------------------------------------------------------------------

// POST /api/categories - create a new category
// body: { name, description?, icon?, image?, slug? }
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, description, icon, image } = req.body;
    if (!name) return res.status(400).json({ message: 'name is required' });

    const slug = req.body.slug ? slugify(req.body.slug) : slugify(name);
    const existing = await Category.findOne({ slug });
    if (existing) return res.status(409).json({ message: `A category with slug "${slug}" already exists` });

    const category = await Category.create({ name, slug, description, icon, image });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/categories/:id - update name, description, icon, image, or slug
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    const { name, description, icon, image, slug } = req.body;

    if (slug) {
      const newSlug = slugify(slug);
      const clash = await Category.findOne({ slug: newSlug, _id: { $ne: category.id } });
      if (clash) return res.status(409).json({ message: `A category with slug "${newSlug}" already exists` });
      category.slug = newSlug;
    }

    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;
    if (icon !== undefined) category.icon = icon;
    if (image !== undefined) category.image = image;

    await category.save();
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/categories/:id
// Refuses to delete a category that still has products attached, so
// products never end up pointing at a deleted category.
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    const productCount = await Product.countDocuments({ categoryId: category.id });
    if (productCount > 0) {
      return res.status(409).json({
        message: `Cannot delete "${category.name}" — ${productCount} product(s) still use this category. Move or delete them first.`
      });
    }

    await category.deleteOne();
    res.json({ message: 'Category deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
