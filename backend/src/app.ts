import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { authRateLimit } from './middleware/rateLimit.middleware';

const app: Application = express();

app.use(helmet());
app.use(cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRateLimit);

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export { app };