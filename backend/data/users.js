/**
 * Pre-registered User Database
 * 
 * SECURITY NOTES:
 * - This is a demonstration/development configuration only
 * - Passwords are stored as bcrypt hashes (NOT plaintext)
 * - In production, this would be replaced with a secure database
 * - Registration is intentionally disabled per security requirements
 * - Only pre-registered users can access the system
 * 
 * BCRYPT HASHES (for testing purposes):
 * - All passwords are securely hashed using bcrypt with salt rounds = 12
 * - Original passwords are only shown in comments for testing convenience
 * - Bcrypt hashes cannot be reversed to obtain the original password
 */

export const users = [
    {
        id: 1,
        fullName: 'John Doe',
        idNumber: '9001015009087',
        accountNumber: '1234567890',
        // Bcrypt hash of: Customer123!
        password: '$2b$12$7SkAcG5NroTqFUb4YfmRmu0Pnd90T5jdm7fZbkh6icJ2RPHE9aHYC'
    },
    {
        id: 2,
        fullName: 'Jane Smith',
        idNumber: '8505125432109',
        accountNumber: '2345678901',
        // Bcrypt hash of: TestUser456!
        password: '$2b$12$Xdefbkyv6eKxVEG1jfgM..XFN67neuYpwFgFFvoplXE3H1RRSf3fm'
    },
    {
        id: 3,
        fullName: 'Alice Johnson',
        idNumber: '9208304567123',
        accountNumber: '3456789012',
        // Bcrypt hash of: Banking789!
        password: '$2b$12$akcXukjv1mViLTyZOvl7FOEjpMxgwo1jPN8ADJArGq0cpHsGBQ0/O'
    }
];

export default users;
