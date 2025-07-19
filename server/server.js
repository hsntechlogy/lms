import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import connectDB from './configs/mongoDB.js';
import connectCloudinary from './configs/cloudinary.js';
import { clerkWebhooks, stripeWebhooks } from './controllers/webhooks.js';
import { clerkMiddleware } from '@clerk/express';
import educatorRouter from './routes/educatorRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import courseRouter from './routes/courseRoute.js';
import userRouter from './routes/userRoutes.js';
import notificationRouter from './routes/notificationRoutes.js';

const app = express();

await connectDB();
await connectCloudinary();

// allowedOrigins is constructed from environment variable or defaults for local/dev/prod frontends
const allowedOrigins = process.env.ALLOWED_ORIGINS ? 
  process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) : 
  [
    process.env.FRONTEND_URL,
    'https://lms-frontend-git-main-hsntechlogys-projects.vercel.app',
    'https://lms-frontend-hsntechlogys-projects.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:4173',
    process.env.VERCEL_URL
  ].filter(Boolean);

// CORS middleware: only allow requests from allowedOrigins, block others
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.error(`Blocked by CORS: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-CSRF-Token',
    'X-API-Key'
  ],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Additional CORS headers middleware: sets headers for allowed origins on every response
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-CSRF-Token, X-API-Key');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.post('/clerk', express.json({ type: 'application/json' }), clerkWebhooks);
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);
app.use(express.json());

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  clerkMiddleware()(req, res, next);
});

app.get('/', (req, res) => res.send('API working'));
app.use('/api/educator', educatorRouter);
app.use('/api/admin', adminRouter);
app.use('/api/course', courseRouter);
app.use('/api/user', userRouter);
app.use('/api/notifications', notificationRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
