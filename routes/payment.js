const express = require('express');
const { protect } = require('../middleware/auth');
const Payment = require('../models/Payment');
const router = express.Router();

// Simulated payment gateway integration point.
// In production, swap this logic for Razorpay/Stripe/PayU server-side calls:
//   - create an order/intent with the gateway
//   - return the client secret / order id to Angular
//   - verify the signature on the webhook or /verify route below

// POST /api/payment/create - create a "payment intent" for CARD/UPI/NETBANKING
router.post('/create', protect, async (req, res) => {
  try {
    const { amount, method } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });
    if (!['CARD', 'UPI', 'NETBANKING'].includes(method)) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    const gatewayOrderId = `PAY-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

    await Payment.create({
      gatewayOrderId,
      amount,
      method,
      status: 'CREATED',
      userId: req.user.id
    });

    res.json({ gatewayOrderId, amount, currency: 'INR', method, status: 'CREATED' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payment/verify - verify/confirm payment before creating the order
router.post('/verify', protect, async (req, res) => {
  try {
    const { gatewayOrderId } = req.body;
    if (!gatewayOrderId) return res.status(400).json({ message: 'gatewayOrderId required' });

    const payment = await Payment.findOne({ gatewayOrderId });
    if (!payment) return res.status(404).json({ message: 'Payment record not found' });

    // Simulated success. Replace with real signature verification.
    payment.status = 'PAID';
    await payment.save();

    res.json({ verified: true, paymentId: gatewayOrderId, status: 'PAID' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
