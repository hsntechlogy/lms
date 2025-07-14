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

const app = express();

await connectDB();
await connectCloudinary();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  process.env.VERCEL_URL
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.error(`Blocked by CORS: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
