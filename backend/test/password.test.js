import { expect } from 'chai';
import { hashPassword, comparePassword } from '../utils/password.js';

describe('Password Utility Tests', () => {
    describe('hashPassword', () => {
        it('should hash a password successfully', async () => {
            const password = 'TestPassword123!';
            const hash = await hashPassword(password);
            
            expect(hash).to.be.a('string');
            expect(hash).to.have.length.greaterThan(50);
            expect(hash).to.include('$2b$'); // bcrypt hash prefix
        });

        it('should generate different hashes for the same password', async () => {
            const password = 'TestPassword123!';
            const hash1 = await hashPassword(password);
            const hash2 = await hashPassword(password);
            
            expect(hash1).to.not.equal(hash2); // Different salts
        });

        it('should handle empty password', async () => {
            const hash = await hashPassword('');
            expect(hash).to.be.a('string');
        });
    });

    describe('comparePassword', () => {
        it('should return true for matching password and hash', async () => {
            const password = 'TestPassword123!';
            const hash = await hashPassword(password);
            const isMatch = await comparePassword(password, hash);
            
            expect(isMatch).to.be.true;
        });

        it('should return false for non-matching password', async () => {
            const password = 'TestPassword123!';
            const wrongPassword = 'WrongPassword456!';
            const hash = await hashPassword(password);
            const isMatch = await comparePassword(wrongPassword, hash);
            
            expect(isMatch).to.be.false;
        });

        it('should return false for empty password against hash', async () => {
            const password = 'TestPassword123!';
            const hash = await hashPassword(password);
            const isMatch = await comparePassword('', hash);
            
            expect(isMatch).to.be.false;
        });

        it('should handle known bcrypt hash correctly', async () => {
            // Known hash of 'Customer123!'
            const knownHash = '$2b$12$7SkAcG5NroTqFUb4YfmRmu0Pnd90T5jdm7fZbkh6icJ2RPHE9aHYC';
            const isMatch = await comparePassword('Customer123!', knownHash);
            
            expect(isMatch).to.be.true;
        });
    });
});
