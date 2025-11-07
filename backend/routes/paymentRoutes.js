import express from 'express';
import { paymentValidationRules } from '../utils/validation.js';
import { handleValidationErrors } from '../middleware/security.js';

const router = express.Router();

// In-memory 'database' for demonstration purposes.
const transactions = [];

router.post('/', paymentValidationRules, handleValidationErrors, (req, res, next) => {
    try {
        const newTransaction = { ...req.body, transactionId: Date.now(), status: 'Pending' };
        transactions.push(newTransaction);
        res.status(200).json({ message: 'Payment submitted for processing.', transaction: newTransaction });
    } catch (error) {
        next(error);
    }
});

export default router;