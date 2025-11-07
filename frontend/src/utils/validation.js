/**
 * Secure RegEx Whitelisting Patterns for Frontend Validation
 * These patterns match the backend validation to provide immediate user feedback
 * and prevent unnecessary requests to the server.
 * 
 * IMPORTANT: These are NOT a replacement for backend validation.
 * Backend validation is the definitive security control.
 */

// Recipient Name: Standard names (no special characters/code)
// Supports international characters including accents, marks, separators, and numbers
export const RECIPIENT_NAME_PATTERN = /^[\p{L}\p{M}\p{Z}\p{N}]{2,100}$/u;

// Payment Amount: Strict numeric format, allowing decimals (up to 2 places)
// Supports amounts from 0.01 to 99999999999999.99
export const PAYMENT_AMOUNT_PATTERN = /^\d{1,14}(\.\d{1,2})?$/;

// Account Number: Typical 8-18 digit account number (no spaces, no characters)
export const ACCOUNT_NUMBER_PATTERN = /^\d{8,18}$/;

// SWIFT Code: Standard 8 or 11 characters (A-Z, 0-9, uppercase only)
export const SWIFT_CODE_PATTERN = /^[A-Z0-9]{8,11}$/;

// Memo/Reference: Allow basic characters, reject common script tags and SQL symbols
export const MEMO_REFERENCE_PATTERN = /^[a-zA-Z0-9\s\p{P}]{0,150}$/u;

// Currency: Strict whitelist of allowed currency codes
export const ALLOWED_CURRENCIES = ['ZAR', 'USD', 'EUR', 'GBP'];

// South African ID Number: Exactly 13 digits
export const SA_ID_NUMBER_PATTERN = /^\d{13}$/;

// Password: Strong password requirements
// At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 symbol
export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+=[\]{}|;:'",.<>\\/-])[A-Za-z\d@$!%*?&#^()_+=[\]{}|;:'",.<>\\/-]{8,}$/;

/**
 * Validation functions for form fields
 */

export const validateRecipientName = (name) => {
    if (!name || name.trim().length === 0) {
        return { isValid: false, error: 'Recipient name is required.' };
    }
    if (!RECIPIENT_NAME_PATTERN.test(name.trim())) {
        return { 
            isValid: false, 
            error: 'Recipient name must be 2-100 characters and contain only letters, numbers, and spaces.' 
        };
    }
    return { isValid: true, error: '' };
};

export const validatePaymentAmount = (amount) => {
    if (!amount || amount.trim().length === 0) {
        return { isValid: false, error: 'Amount is required.' };
    }
    if (!PAYMENT_AMOUNT_PATTERN.test(amount.trim())) {
        return { 
            isValid: false, 
            error: 'Amount must be a valid number with up to 2 decimal places (e.g., 1234.56).' 
        };
    }
    const numericAmount = Number.parseFloat(amount);
    if (numericAmount <= 0) {
        return { isValid: false, error: 'Amount must be greater than zero.' };
    }
    return { isValid: true, error: '' };
};

export const validateAccountNumber = (accountNumber) => {
    if (!accountNumber || accountNumber.trim().length === 0) {
        return { isValid: false, error: 'Account number is required.' };
    }
    if (!ACCOUNT_NUMBER_PATTERN.test(accountNumber.trim())) {
        return { 
            isValid: false, 
            error: 'Account number must be between 8 and 18 digits with no spaces or special characters.' 
        };
    }
    return { isValid: true, error: '' };
};

export const validateSwiftCode = (swiftCode) => {
    if (!swiftCode || swiftCode.trim().length === 0) {
        return { isValid: false, error: 'SWIFT code is required.' };
    }
    const upperSwiftCode = swiftCode.trim().toUpperCase();
    if (!SWIFT_CODE_PATTERN.test(upperSwiftCode)) {
        return { 
            isValid: false, 
            error: 'SWIFT code must be 8-11 uppercase alphanumeric characters.' 
        };
    }
    return { isValid: true, error: '' };
};

export const validateCurrency = (currency) => {
    if (!currency || currency.trim().length === 0) {
        return { isValid: false, error: 'Currency is required.' };
    }
    if (!ALLOWED_CURRENCIES.includes(currency.trim())) {
        return { 
            isValid: false, 
            error: `Currency must be one of: ${ALLOWED_CURRENCIES.join(', ')}.` 
        };
    }
    return { isValid: true, error: '' };
};

export const validateMemo = (memo) => {
    // Memo is optional, so empty is valid
    if (!memo || memo.trim().length === 0) {
        return { isValid: true, error: '' };
    }
    if (!MEMO_REFERENCE_PATTERN.test(memo.trim())) {
        return { 
            isValid: false, 
            error: 'Memo must be 0-150 characters and contain only alphanumeric characters and basic punctuation.' 
        };
    }
    return { isValid: true, error: '' };
};

/**
 * Validate all payment fields at once
 */
export const validatePaymentForm = (formData) => {
    const errors = {};
    
    if (formData.recipientName !== undefined) {
        const recipientNameValidation = validateRecipientName(formData.recipientName);
        if (!recipientNameValidation.isValid) {
            errors.recipientName = recipientNameValidation.error;
        }
    }
    
    const accountValidation = validateAccountNumber(formData.payeeAccountNumber);
    if (!accountValidation.isValid) {
        errors.payeeAccountNumber = accountValidation.error;
    }
    
    const swiftValidation = validateSwiftCode(formData.swiftCode);
    if (!swiftValidation.isValid) {
        errors.swiftCode = swiftValidation.error;
    }
    
    const amountValidation = validatePaymentAmount(formData.amount);
    if (!amountValidation.isValid) {
        errors.amount = amountValidation.error;
    }
    
    const currencyValidation = validateCurrency(formData.currency);
    if (!currencyValidation.isValid) {
        errors.currency = currencyValidation.error;
    }
    
    if (formData.memo !== undefined) {
        const memoValidation = validateMemo(formData.memo);
        if (!memoValidation.isValid) {
            errors.memo = memoValidation.error;
        }
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Sanitize input by converting to uppercase where needed (e.g., SWIFT codes)
 */
export const sanitizeSwiftCode = (swiftCode) => {
    return swiftCode.trim().toUpperCase();
};

/**
 * Validate registration form fields
 */
export const validateFullName = (fullName) => {
    if (!fullName || fullName.trim().length === 0) {
        return { isValid: false, error: 'Full name is required.' };
    }
    if (!RECIPIENT_NAME_PATTERN.test(fullName.trim())) {
        return { 
            isValid: false, 
            error: 'Full name must be 2-100 characters and contain only letters, numbers, and spaces.' 
        };
    }
    return { isValid: true, error: '' };
};

export const validateIdNumber = (idNumber) => {
    if (!idNumber || idNumber.trim().length === 0) {
        return { isValid: false, error: 'ID number is required.' };
    }
    if (!SA_ID_NUMBER_PATTERN.test(idNumber.trim())) {
        return { 
            isValid: false, 
            error: 'South African ID number must be exactly 13 digits.' 
        };
    }
    return { isValid: true, error: '' };
};

export const validatePassword = (password) => {
    if (!password || password.length === 0) {
        return { isValid: false, error: 'Password is required.' };
    }
    if (!PASSWORD_PATTERN.test(password)) {
        return { 
            isValid: false, 
            error: 'Password needs 8+ chars, 1 uppercase, 1 lowercase, 1 number, & 1 symbol.' 
        };
    }
    return { isValid: true, error: '' };
};

/**
 * Validate all registration fields at once
 */
export const validateRegistrationForm = (formData) => {
    const errors = {};
    
    const fullNameValidation = validateFullName(formData.fullName);
    if (!fullNameValidation.isValid) {
        errors.fullName = fullNameValidation.error;
    }
    
    const idNumberValidation = validateIdNumber(formData.idNumber);
    if (!idNumberValidation.isValid) {
        errors.idNumber = idNumberValidation.error;
    }
    
    const accountValidation = validateAccountNumber(formData.accountNumber);
    if (!accountValidation.isValid) {
        errors.accountNumber = accountValidation.error;
    }
    
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
        errors.password = passwordValidation.error;
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};
