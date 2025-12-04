const express = require('express');
const cors = require('cors');
const pool = require('./db');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Configure S3 here in prod

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// Middleware
const verifyAdmin = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send('Token required');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') throw new Error();
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).send('Invalid Token');
  }
};

// Routes

// 1. Admin Login
app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  // In prod: Compare hash
  if (email === 'carsmagnum583@gmail.com' && password === 'Magnum@123') {
    const token = jwt.sign({ role: 'admin', email }, JWT_SECRET);
    res.json({ token });
  } else {
    res.status(401).send('Invalid credentials');
  }
});

// 2. Get Cars
app.get('/api/cars', async (req, res) => {
  const { city } = req.query;
  let query = 'SELECT * FROM cars';
  let params = [];
  if (city) {
    query += ' WHERE city_id = $1';
    params.push(city);
  }
  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// 3. Update Car (Revenue Share)
app.patch('/api/cars/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { ownerSharePercent } = req.body;
  try {
    await pool.query('UPDATE cars SET owner_share_percent = $1 WHERE id = $2', [ownerSharePercent, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// 4. Create Booking (Stage 1)
app.post('/api/bookings', async (req, res) => {
  const data = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO bookings (
        car_id, city_id, customer_name, customer_phone, customer_email, 
        occupation, address, trip_location, trip_purpose, trip_days, 
        delivery_needed, start_date, start_time, end_date, end_time, total_amount
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING id`,
      [
        data.carId, data.cityId, data.customerName, data.customerPhone, data.customerEmail,
        data.occupation, data.address, data.tripLocation, data.tripPurpose, data.tripDays,
        data.deliveryNeeded, data.startDate, data.startTime, data.endDate, data.endTime, data.totalAmount
      ]
    );
    // TODO: Trigger WhatsApp API here
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// 5. Update Booking (Stage 2 & Status)
app.patch('/api/bookings/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  // Dynamic query builder would be better here
  // For demo:
  if (updates.status) {
    await pool.query('UPDATE bookings SET status = $1 WHERE id = $2', [updates.status, id]);
  }
  if (updates.signatureUrl) {
    await pool.query('UPDATE bookings SET signature_url = $1, start_km = $2, fuel_level = $3 WHERE id = $4', 
      [updates.signatureUrl, updates.startKm, updates.fuelLevel, id]);
  }
  
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
