import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import * as dotenv from 'dotenv';
import express, { Express, NextFunction, Request, Response } from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import { rateLimit } from 'express-rate-limit';
import helmet, { HelmetOptions } from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
dotenv.config();

const app: Express = express();

/* CORS config */
app.use(
  cors({
    origin: [
      'https://swiftaboki.com',
      'https://www.swiftaboki.com',
      'http://localhost:3000',
      'http://localhost:3001',
      'https://sa-srv3.onrender.com',
    ],
    credentials: true,
  }),
);

/* Routes */
import AuthRoute from './routes/auth.route';
import DashboardRoute from './routes/dashboard.route';

/* Express configuration*/
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']); // Enable trust proxy
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('dev'));

/* Compression Middleware */
app.use(compression());

/* Against NoSQL query injection */
app.use(mongoSanitize());

/* Pollution protection middleware */
app.use(hpp());

/* Rate limiter middleware */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

/* helmet configuration */
const helmetConfig: HelmetOptions = {
  frameguard: { action: 'deny' },
  xssFilter: true,
  referrerPolicy: { policy: 'same-origin' },
  hsts: { maxAge: 15552000, includeSubDomains: true, preload: true },
};
app.use(helmet(helmetConfig));
app.use(helmet.hidePoweredBy());
app.use(helmet.noSniff());
app.use(helmet.ieNoOpen());
app.use(helmet.dnsPrefetchControl());
app.use(helmet.permittedCrossDomainPolicies());

/* Prevent browser from caching sensitive information */
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

app.use('/auth', AuthRoute);
app.use('/dashboard', DashboardRoute);

// Default route
app.get('/', (_req: Request, res: Response) => {
  return res.status(200).json({ message: 'Swift-Aboki API' });
});

// Catch-all 404 route
app.use('*', (_req: Request, res: Response) => {
  return res.status(404).json({
    status: false,
    error: 'NOT FOUND',
    message:
      'The specified end-point does not exist. Check request method or route and try again.',
  });
});

export default app;
