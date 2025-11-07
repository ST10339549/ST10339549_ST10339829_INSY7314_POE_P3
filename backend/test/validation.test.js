import { expect } from 'chai';
import { validationPatterns } from '../utils/validation.js';

describe('Validation Pattern Tests', () => {
    
    describe('recipientName pattern', () => {
        const pattern = validationPatterns.recipientName;
        
        it('should match valid names with letters and spaces', () => {
            expect(pattern.test('John Doe')).to.be.true;
            expect(pattern.test('Mary Jane Smith')).to.be.true;
            expect(pattern.test('José García')).to.be.true;
        });

        it('should reject names that are too short', () => {
            expect(pattern.test('A')).to.be.false;
        });

        it('should reject names that are too long', () => {
            const longName = 'A'.repeat(101);
            expect(pattern.test(longName)).to.be.false;
        });

        it('should reject empty strings', () => {
            expect(pattern.test('')).to.be.false;
        });
    });

    describe('paymentAmount pattern', () => {
        const pattern = validationPatterns.paymentAmount;
        
        it('should match valid payment amounts', () => {
            expect(pattern.test('100')).to.be.true;
            expect(pattern.test('1234.56')).to.be.true;
            expect(pattern.test('0.01')).to.be.true;
            expect(pattern.test('99999999999999.99')).to.be.true;
        });

        it('should reject amounts with more than 2 decimal places', () => {
            expect(pattern.test('100.123')).to.be.false;
        });

        it('should reject negative amounts', () => {
            expect(pattern.test('-100')).to.be.false;
        });

        it('should reject non-numeric values', () => {
            expect(pattern.test('abc')).to.be.false;
            expect(pattern.test('12.34.56')).to.be.false;
        });

        it('should reject empty strings', () => {
            expect(pattern.test('')).to.be.false;
        });
    });

    describe('accountNumber pattern', () => {
        const pattern = validationPatterns.accountNumber;
        
        it('should match valid account numbers (8-18 digits)', () => {
            expect(pattern.test('12345678')).to.be.true;
            expect(pattern.test('123456789012345678')).to.be.true;
            expect(pattern.test('1234567890')).to.be.true;
        });

        it('should reject account numbers that are too short', () => {
            expect(pattern.test('1234567')).to.be.false;
        });

        it('should reject account numbers that are too long', () => {
            expect(pattern.test('1234567890123456789')).to.be.false;
        });

        it('should reject account numbers with non-digits', () => {
            expect(pattern.test('1234567A')).to.be.false;
            expect(pattern.test('12345 678')).to.be.false;
        });

        it('should reject empty strings', () => {
            expect(pattern.test('')).to.be.false;
        });
    });

    describe('swiftCode pattern', () => {
        const pattern = validationPatterns.swiftCode;
        
        it('should match valid 8-character SWIFT codes', () => {
            expect(pattern.test('ABCDZAJJ')).to.be.true;
            expect(pattern.test('SBICENBB')).to.be.true;
        });

        it('should match valid 11-character SWIFT codes', () => {
            expect(pattern.test('ABCDZAJJ001')).to.be.true;
            expect(pattern.test('SBICENBB123')).to.be.true;
        });

        it('should reject SWIFT codes that are too short', () => {
            expect(pattern.test('ABCD')).to.be.false;
        });

        it('should reject SWIFT codes that are too long', () => {
            expect(pattern.test('ABCDZAJJ0012')).to.be.false;
        });

        it('should reject SWIFT codes with lowercase letters', () => {
            expect(pattern.test('abcdzajj')).to.be.false;
        });

        it('should reject SWIFT codes with special characters', () => {
            expect(pattern.test('ABC@ZAJJ')).to.be.false;
        });

        it('should reject empty strings', () => {
            expect(pattern.test('')).to.be.false;
        });
    });

    describe('memoReference pattern', () => {
        const pattern = validationPatterns.memoReference;
        
        it('should match valid memo text', () => {
            expect(pattern.test('Payment for invoice #12345')).to.be.true;
            expect(pattern.test('Monthly rent')).to.be.true;
            expect(pattern.test('Customer: John Doe, Ref: ABC123')).to.be.true;
        });

        it('should match empty strings (optional field)', () => {
            expect(pattern.test('')).to.be.true;
        });

        it('should reject memo that is too long', () => {
            const longMemo = 'A'.repeat(151);
            expect(pattern.test(longMemo)).to.be.false;
        });
    });

    describe('username pattern', () => {
        const pattern = validationPatterns.username;
        
        it('should match valid usernames', () => {
            expect(pattern.test('user123')).to.be.true;
            expect(pattern.test('JohnDoe')).to.be.true;
            expect(pattern.test('admin12345')).to.be.true;
        });

        it('should reject usernames that are too short', () => {
            expect(pattern.test('user')).to.be.false;
        });

        it('should reject usernames that are too long', () => {
            expect(pattern.test('usernamethatiswaytoolo')).to.be.false;
        });

        it('should reject usernames with special characters', () => {
            expect(pattern.test('user@123')).to.be.false;
            expect(pattern.test('user name')).to.be.false;
        });

        it('should reject empty strings', () => {
            expect(pattern.test('')).to.be.false;
        });
    });

    describe('limitedPaymentAmount pattern', () => {
        const pattern = validationPatterns.limitedPaymentAmount;
        
        it('should match valid limited payment amounts', () => {
            expect(pattern.test('100')).to.be.true;
            expect(pattern.test('1234.56')).to.be.true;
            expect(pattern.test('0.01')).to.be.true;
            expect(pattern.test('9999.99')).to.be.true;
        });

        it('should reject amounts with more than 2 decimal places', () => {
            expect(pattern.test('100.123')).to.be.false;
        });

        it('should reject negative amounts', () => {
            expect(pattern.test('-100')).to.be.false;
        });

        it('should reject non-numeric values', () => {
            expect(pattern.test('abc')).to.be.false;
        });

        it('should reject empty strings', () => {
            expect(pattern.test('')).to.be.false;
        });
    });

    describe('allowedCurrencies', () => {
        const currencies = validationPatterns.allowedCurrencies;
        
        it('should include standard currencies', () => {
            expect(currencies).to.include('ZAR');
            expect(currencies).to.include('USD');
            expect(currencies).to.include('EUR');
            expect(currencies).to.include('GBP');
        });

        it('should have exactly 4 currencies', () => {
            expect(currencies).to.have.length(4);
        });

        it('should not include invalid currencies', () => {
            expect(currencies).to.not.include('JPY');
            expect(currencies).to.not.include('CAD');
        });
    });
});
