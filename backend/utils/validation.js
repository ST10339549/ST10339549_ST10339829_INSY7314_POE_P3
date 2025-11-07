import { body } from 'express-validator';

/**
 * Secure RegEx Whitelisting Patterns
 * These patterns follow the principle of rejecting everything that is not explicitly allowed.
 * They are designed to prevent XSS, SQL Injection, and other injection attacks.
 */

// Recipient Name: Standard names (no special characters/code)
// Supports international characters including accents, marks, separators, and numbers
const RECIPIENT_NAME_PATTERN = /^[\p{L}\p{M}\p{Z}\p{N}]{2,100}$/u;

// Payment Amount: Strict numeric format, allowing decimals (up to 2 places)
// Supports amounts from 0.01 to 99999999999999.99
const PAYMENT_AMOUNT_PATTERN = /^\d{1,14}(\.\d{1,2})?$/;

// Account Number: Typical 8-18 digit account number (no spaces, no characters)
const ACCOUNT_NUMBER_PATTERN = /^\d{8,18}$/;

// SWIFT Code: Standard 8 or 11 characters (A-Z, 0-9, uppercase only)
const SWIFT_CODE_PATTERN = /^[A-Z0-9]{8,11}$/;

// Memo/Reference: Allow basic characters, reject common script tags and SQL symbols
// Supports alphanumeric, whitespace, and basic punctuation
const MEMO_REFERENCE_PATTERN = /^[a-zA-Z0-9\s\p{P}]{0,150}$/u;

// Currency: Strict whitelist of allowed currency codes
const ALLOWED_CURRENCIES = ['ZAR', 'USD', 'EUR', 'GBP'];

// Username: Alphanumeric only, 5-20 characters
const USERNAME_PATTERN = /^[a-zA-Z0-9]{5,20}$/;

// Payment Amount with strict limits: numeric with up to 2 decimal places, max 10000.00
const LIMITED_PAYMENT_AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;

export const registrationValidationRules = [
    body('fullName')
        .trim()
        .matches(RECIPIENT_NAME_PATTERN)
        .withMessage('Full name must be 2-100 characters and contain only letters, numbers, and spaces.'),
    body('idNumber')
        .trim()
        .isLength({ min: 13, max: 13 })
        .isNumeric()
        .withMessage('South African ID number must be exactly 13 digits.'),
    body('accountNumber')
        .trim()
        .matches(ACCOUNT_NUMBER_PATTERN)
        .withMessage('Account number must be between 8 and 18 digits.'),
    body('password')
        .isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })
        .withMessage('Password needs 8+ chars, 1 uppercase, 1 lowercase, 1 number, & 1 symbol.'),
];

export const paymentValidationRules = [
    body('recipientName')
        .optional()
        .trim()
        .matches(RECIPIENT_NAME_PATTERN)
        .withMessage('Recipient name must be 2-100 characters and contain only letters, numbers, and spaces.'),
    body('payeeAccountNumber')
        .trim()
        .matches(ACCOUNT_NUMBER_PATTERN)
        .withMessage('Payee account number must be between 8 and 18 digits with no spaces or special characters.'),
    body('swiftCode')
        .trim()
        .toUpperCase()
        .matches(SWIFT_CODE_PATTERN)
        .withMessage('SWIFT code must be 8-11 uppercase alphanumeric characters.'),
    body('amount')
        .trim()
        .matches(PAYMENT_AMOUNT_PATTERN)
        .withMessage('Amount must be a valid number with up to 2 decimal places (e.g., 1234.56).'),
    body('currency')
        .trim()
        .isIn(ALLOWED_CURRENCIES)
        .withMessage(`Currency must be one of: ${ALLOWED_CURRENCIES.join(', ')}.`),
    body('memo')
        .optional()
        .trim()
        .matches(MEMO_REFERENCE_PATTERN)
        .withMessage('Memo/Reference must be 0-150 characters and contain only alphanumeric characters and basic punctuation.'),
];

export const usernameAndPaymentValidationRules = [
    body('username')
        .trim()
        .matches(USERNAME_PATTERN)
        .withMessage('Username must be alphanumeric and between 5-20 characters.'),
    body('amount')
        .trim()
        .matches(LIMITED_PAYMENT_AMOUNT_PATTERN)
        .withMessage('Payment amount must be numeric with up to 2 decimal places.')
        .custom((value) => {
            const numValue = Number.parseFloat(value);
            if (Number.isNaN(numValue) || numValue <= 0 || numValue > 10000) {
                throw new Error('Payment amount must be between 0.01 and 10000.00');
            }
            return true;
        })
];

// Export patterns for potential reuse in frontend or other modules
export const validationPatterns = {
    recipientName: RECIPIENT_NAME_PATTERN,
    paymentAmount: PAYMENT_AMOUNT_PATTERN,
    accountNumber: ACCOUNT_NUMBER_PATTERN,
    swiftCode: SWIFT_CODE_PATTERN,
    memoReference: MEMO_REFERENCE_PATTERN,
    allowedCurrencies: ALLOWED_CURRENCIES,
    username: USERNAME_PATTERN,
    limitedPaymentAmount: LIMITED_PAYMENT_AMOUNT_PATTERN,
};