import express from 'express';
import { comparePassword } from '../utils/password.js';
import { users } from '../data/users.js';

const router = express.Router();

// SECURITY NOTE: /register route intentionally removed to prevent unauthorized user creation
// Users must be pre-registered by administrators only
// User data is loaded from ../data/users.js (bcrypt-hashed passwords only)

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