const express = require('express');
const upload = require('../middleware/upload');
const { protect, adminOnly } = require('../middleware/auth');
const router = express.Router();

// POST /api/uploads/image?type=products   (or ?type=categories)
// Form field name must be "image". Admin only.
// Returns a relative URL you can save directly into product.image / category.image.
router.post('/image', protect, adminOnly, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    if (!req.file) return res.status(400).json({ message: 'No image file uploaded (field name must be "image")' });

    const type = req._uploadType || 'products';
    const url = `/uploads/${type}/${req.file.filename}`;
    res.status(201).json({ url, filename: req.file.filename });
  });
});

module.exports = router;
