import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { validationResult } from 'express-validator';

const CORS_ORIGIN = process.env.CORS_ORIGIN || 'https://localhost:5173';

export function applyCoreMiddleware(app) {
    app.use(helmet());
    app.use(cors({ origin: CORS_ORIGIN }));
    app.use(express.json());

    const apiLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
        message: 'Too many requests from this IP, please try again after 15 minutes',
    });
    app.use('/api', apiLimiter);
}

export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};