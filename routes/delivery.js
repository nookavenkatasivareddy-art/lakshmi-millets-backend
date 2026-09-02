const express = require('express');
const DeliveryLocation = require('../models/DeliveryLocation');
const router = express.Router();

// GET /api/delivery-locations - the supported cities/states with charges
router.get('/', async (req, res) => {
  try {
    const locations = await DeliveryLocation.find({ isActive: true }).sort({ city: 1 });
    res.json(locations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
