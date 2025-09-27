// server/app.js
const express = require('express');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: "http://localhost:5173", // Your frontend URL
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Global CORS + preflight (must be first)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed = ['http://localhost:5173', 'http://127.0.0.1:5173'];
  if (origin && allowed.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    // PATCH removed
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204); // end preflight
  }
  next();
});

app.use(express.json());
app.use(cookieParser());

// Routers
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const requestRouter = require('./routes/request');
const userRouter = require('./routes/user');

app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestRouter);
app.use('/', userRouter);

// Start
connectDB()
  .then(() => {
    console.log('Connected to MongoDB');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  })
  .catch((err) => console.error('DB connection error:', err));

module.exports = app;