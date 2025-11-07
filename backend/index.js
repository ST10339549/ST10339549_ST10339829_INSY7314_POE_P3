import express from 'express';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { applyCoreMiddleware } from './middleware/security.js';
import authRoutes from './routes/authRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

// --- CONFIGURATION ---
const PORT = process.env.PORT || 4000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- APPLICATION SETUP ---
const app = express();
applyCoreMiddleware(app);

// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);

// --- CENTRAL ERROR HANDLER ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'An unexpected error occurred on the server.' });
});

// --- SERVER STARTUP ---
try {
    const options = {
      key: fs.readFileSync(path.join(__dirname, '..', 'certs', 'localhost-key.pem')),
      cert: fs.readFileSync(path.join(__dirname, '..', 'certs', 'localhost.pem')),
    };

    https.createServer(options, app).listen(PORT, () => {
        console.log(`✅ Secure HTTPS backend running on https://localhost:${PORT}`);
    });
} catch (error) {
    console.error('❌ Could not start HTTPS server.');
    console.error('Did you forget to generate your SSL certificates in the /certs directory?');
    console.error(error.message);
}