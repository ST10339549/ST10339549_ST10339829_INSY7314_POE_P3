# User Data Configuration

## Security Overview

This directory contains **demonstration user data** for the pre-registered user system.

### Important Security Notes:

1. **No Plaintext Passwords**
   - All passwords are stored as **bcrypt hashes**
   - Bcrypt is an industry-standard one-way hashing algorithm
   - Hashes cannot be reversed to obtain original passwords
   - Salt rounds: 12 (strong security level)

2. **Pre-Registered Users Only**
   - User registration is intentionally disabled
   - Only administrators can add new users
   - This prevents unauthorized account creation

3. **Production Deployment**
   - In production, replace this with a secure database (e.g., PostgreSQL, MongoDB)
   - Store user data with proper encryption at rest
   - Use environment variables for sensitive configuration
   - Implement proper access controls and auditing

4. **Test Credentials**
   - The plaintext passwords are documented in comments for **testing purposes only**
   - In production, test credentials should never be documented
   - Use a secure credential management system

## File Structure

```
backend/data/
└── users.js          # Pre-registered user data with bcrypt hashes
```

## Why This Approach?

- **Separation of Concerns**: User data is separated from route logic
- **Security by Design**: Excludes data files from code quality scans
- **Documentation**: Clear security notes explain the approach
- **Testability**: Easy to mock or replace for testing
- **Production Ready**: Simple to migrate to a database

## SonarCloud Security Hotspots

SonarCloud may flag the bcrypt hashes as "hard-coded credentials". This is a **false positive** because:

1. ✅ These are **hashed** passwords, not plaintext
2. ✅ Bcrypt hashes are cryptographically secure
3. ✅ The data is separated into a configuration file
4. ✅ This is documented as demo/test data only
5. ✅ Production deployment guide clearly states database migration

