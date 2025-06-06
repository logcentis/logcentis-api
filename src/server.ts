import cookieParser from 'cookie-parser';
import express, { type Express } from 'express';
import helmet from 'helmet';

import { openAPIRouter } from '@/api-docs/openAPIRouter';
import { authRouter } from '@/api/auth/authRouter';
import { healthCheckRouter } from '@/api/healthCheck/healthCheckRouter';
import { logRouter } from '@/api/log/logRouter';
import { userRouter } from '@/api/user/userRouter';
import errorHandler from '@/common/middleware/errorHandler';
import rateLimiter from '@/common/middleware/rateLimiter';
import requestLogger from '@/common/middleware/requestLogger';
// import { env } from '@/common/utils/envConfig';

const app: Express = express();

// Set the application to trust the reverse proxy
app.set('trust proxy', true);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(cookieParser());
app.use(helmet());
app.use(rateLimiter);

// Request logging
app.use(requestLogger);

// Routes
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/log', logRouter);
app.use('/health-check', healthCheckRouter);

// Swagger UI
app.use('/docs', openAPIRouter);

// Error handlers
app.use(errorHandler());

export default app;
