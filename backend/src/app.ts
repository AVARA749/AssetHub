import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import propertyRoutes from './routes/propertyRoutes';
import mpesaRoutes from './routes/mpesaRoutes';
import adminRoutes from './routes/adminRoutes';

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/properties', propertyRoutes);
app.use('/api/mpesa', mpesaRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({ message: 'Resource not found' });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

export default app;
