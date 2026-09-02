const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

dotenv.config();

const connectDB = require('./config/db');

// Connect to MongoDB before the app starts handling requests.
connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/products', require('./routes/products'));
app.use('/api/delivery-locations', require('./routes/delivery'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/uploads', require('./routes/uploads'));

app.get('/api/health', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    status: 'OK',
    app: 'Lakshmi Millets API',
    database: 'MongoDB',
    mongoConnection: states[mongoose.connection.readyState] || 'unknown'
  });
});

app.use('/assets', express.static(path.join(__dirname, 'assets')));
// Admin-uploaded product/category images are served from here, e.g.
// http://localhost:5000/uploads/products/169900000-my-image.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Lakshmi Millets API running on port ${PORT}`));
