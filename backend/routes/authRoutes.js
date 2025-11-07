import express from 'express';
import { registrationValidationRules } from '../utils/validation.js';
import { handleValidationErrors } from '../middleware/security.js';
import { hashPassword, comparePassword } from '../utils/password.js';

const router = express.Router();

// In-memory 'database' for demonstration purposes.
const users = [];

router.post('/register', registrationValidationRules, handleValidationErrors, async (req, res, next) => {
    try {
        const { fullName, idNumber, accountNumber, password } = req.body;
        if (users.find(user => user.idNumber === idNumber)) {
            return res.status(409).json({ message: 'User with this ID number already exists.' });
        }
        const hashedPassword = await hashPassword(password);
        const newUser = { id: users.length + 1, fullName, idNumber, accountNumber, password: hashedPassword };
        users.push(newUser);
        console.log('Registered Users:', users.map(u => ({...u, password: '[redacted]'})));
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        next(error);
    }
});

router.post('/login', async (req, res, next) => {
     try {
        const { idNumber, password } = req.body;
        const user = users.find(u => u.idNumber === idNumber);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        res.status(200).json({ message: 'Login successful!', user: { id: user.id, fullName: user.fullName } });
    } catch (error) {
        next(error);
    }
});

export default router;