import express from 'express';
import { comparePassword } from '../utils/password.js';

const router = express.Router();

// Pre-registered users only - no public registration allowed per Task 3, Requirement 1
// In production, this would load from a secure database with proper admin-only user management
const users = [
    {
        id: 1,
        fullName: 'John Doe',
        idNumber: '9001015009087',
        accountNumber: '1234567890',
        password: '$2b$12$7SkAcG5NroTqFUb4YfmRmu0Pnd90T5jdm7fZbkh6icJ2RPHE9aHYC' // Customer123!
    },
    {
        id: 2,
        fullName: 'Jane Smith',
        idNumber: '8505125432109',
        accountNumber: '2345678901',
        password: '$2b$12$Xdefbkyv6eKxVEG1jfgM..XFN67neuYpwFgFFvoplXE3H1RRSf3fm' // TestUser456!
    },
    {
        id: 3,
        fullName: 'Alice Johnson',
        idNumber: '9208304567123',
        accountNumber: '3456789012',
        password: '$2b$12$akcXukjv1mViLTyZOvl7FOEjpMxgwo1jPN8ADJArGq0cpHsGBQ0/O' // Banking789!
    }
];

// SECURITY NOTE: /register route intentionally removed to prevent unauthorized user creation
// Users must be pre-registered by administrators only

// Debug: Log users on startup
console.log('🔐 Pre-registered users loaded:', users.length);
for (const u of users) {
    console.log(`   - ${u.fullName} (ID: ${u.idNumber})`);
}

router.post('/login', async (req, res, next) => {
     try {
        const { idNumber, password } = req.body;
        console.log('🔍 Login attempt - ID Number:', idNumber);
        console.log('🔍 Available users:', users.map(u => u.idNumber));
        
        const user = users.find(u => u.idNumber === idNumber);
        if (!user) {
            console.log('❌ User not found with ID:', idNumber);
            return res.status(404).json({ message: 'User not found.' });
        }
        
        console.log('✅ User found:', user.fullName);
        const isMatch = await comparePassword(password, user.password);
        console.log('🔐 Password match:', isMatch);
        
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        res.status(200).json({ message: 'Login successful!', user: { id: user.id, fullName: user.fullName } });
    } catch (error) {
        next(error);
    }
});

export default router;