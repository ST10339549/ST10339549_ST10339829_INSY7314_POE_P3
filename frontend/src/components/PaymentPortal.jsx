import React, { useState } from 'react';
import Input from './common/Input';
import Button from './common/Button';
import Alert from './common/Alert';
import { 
    validatePaymentForm, 
    sanitizeSwiftCode,
    validateAccountNumber,
    validateSwiftCode,
    validatePaymentAmount
} from '../utils/validation';

const API_URL = 'https://localhost:4000/api/payments';

export default function PaymentPortal({ user, onLogout }) {
    const [formData, setFormData] = useState({ payeeAccountNumber: '', swiftCode: '', amount: '', currency: 'ZAR' });
    const [apiMessage, setApiMessage] = useState({ text: '', type: '' });
    const [fieldErrors, setFieldErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Sanitize SWIFT code to uppercase
        const sanitizedValue = name === 'swiftCode' ? sanitizeSwiftCode(value) : value;
        
        setFormData({ ...formData, [name]: sanitizedValue });
        
        // Clear field error when user starts typing
        if (fieldErrors[name]) {
            setFieldErrors({ ...fieldErrors, [name]: '' });
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        let validation;
        
        // Validate individual field on blur for immediate feedback
        switch (name) {
            case 'payeeAccountNumber':
                validation = validateAccountNumber(value);
                break;
            case 'swiftCode':
                validation = validateSwiftCode(value);
                break;
            case 'amount':
                validation = validatePaymentAmount(value);
                break;
            default:
                return;
        }
        
        if (!validation.isValid) {
            setFieldErrors({ ...fieldErrors, [name]: validation.error });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiMessage({ text: '', type: '' });
        setFieldErrors({});
        
        // Frontend validation - first line of defense
        const validation = validatePaymentForm(formData);
        if (!validation.isValid) {
            setFieldErrors(validation.errors);
            setApiMessage({ 
                text: 'Please correct the errors in the form before submitting.', 
                type: 'error' 
            });
            return;
        }
        
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (!response.ok) {
                const errorMsg = data.errors ? data.errors.map(e => e.msg).join(' ') : (data.message || 'An unexpected error occurred.');
                throw new Error(errorMsg);
            }
            setApiMessage({ text: data.message, type: 'success' });
            setFormData({ payeeAccountNumber: '', swiftCode: '', amount: '', currency: 'ZAR' });
        } catch (error) {
            setApiMessage({ text: error.message, type: 'error' });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-slate-100">Welcome, {user.fullName}</h2>
                <button onClick={onLogout} className="text-sm text-cyan-400 hover:underline">Logout</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 p-4 border border-slate-700 rounded-lg">
                <h3 className="text-lg font-medium">New International Payment</h3>
                <Alert message={apiMessage.text} type={apiMessage.type} />
                
                <div>
                    <Input 
                        id="payeeAccountNumber" 
                        label="Payee Account Number" 
                        name="payeeAccountNumber" 
                        value={formData.payeeAccountNumber} 
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="8-18 digits"
                    />
                    {fieldErrors.payeeAccountNumber && (
                        <p className="mt-1 text-sm text-red-400">{fieldErrors.payeeAccountNumber}</p>
                    )}
                </div>
                
                <div>
                    <Input 
                        id="swiftCode" 
                        label="SWIFT Code" 
                        name="swiftCode" 
                        value={formData.swiftCode} 
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="8-11 alphanumeric (e.g., ABCDZAJJ)"
                    />
                    {fieldErrors.swiftCode && (
                        <p className="mt-1 text-sm text-red-400">{fieldErrors.swiftCode}</p>
                    )}
                </div>
                
                <div>
                    <Input 
                        id="amount" 
                        label="Amount" 
                        name="amount" 
                        type="text"
                        value={formData.amount} 
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g., 1234.56"
                    />
                    {fieldErrors.amount && (
                        <p className="mt-1 text-sm text-red-400">{fieldErrors.amount}</p>
                    )}
                </div>
                
                <div>
                    <label htmlFor="currency" className="block text-sm font-medium text-slate-300 mb-1">Currency</label>
                    <select 
                        id="currency" 
                        name="currency" 
                        value={formData.currency} 
                        onChange={handleChange} 
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                        <option value="ZAR">ZAR - South African Rand</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                    </select>
                    {fieldErrors.currency && (
                        <p className="mt-1 text-sm text-red-400">{fieldErrors.currency}</p>
                    )}
                </div>
                
                <Button type="submit">Pay Now</Button>
            </form>
        </div>
    );
}