import React, { useState } from 'react';
import Input from './common/Input';
import Button from './common/Button';
import Alert from './common/Alert';
import { 
    validateRegistrationForm,
    validateFullName,
    validateIdNumber,
    validateAccountNumber,
    validatePassword
} from '../utils/validation';

const API_URL = 'https://localhost:4000/api/auth/register';

export default function RegistrationForm({ onSwitch }) {
    const [formData, setFormData] = useState({ fullName: '', idNumber: '', accountNumber: '', password: '' });
    const [apiMessage, setApiMessage] = useState({ text: '', type: '' });
    const [fieldErrors, setFieldErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
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
            case 'fullName':
                validation = validateFullName(value);
                break;
            case 'idNumber':
                validation = validateIdNumber(value);
                break;
            case 'accountNumber':
                validation = validateAccountNumber(value);
                break;
            case 'password':
                validation = validatePassword(value);
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
        const validation = validateRegistrationForm(formData);
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
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (!response.ok) {
                const errorMsg = data.errors ? data.errors.map(e => e.msg).join(' ') : data.message;
                throw new Error(errorMsg);
            }
            setApiMessage({ text: data.message, type: 'success' });
            setTimeout(() => onSwitch('login'), 2000);
        } catch (error) {
            setApiMessage({ text: error.message, type: 'error' });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-semibold text-center text-slate-100">Create Account</h2>
            <Alert message={apiMessage.text} type={apiMessage.type} />
            
            <div>
                <Input 
                    id="fullName" 
                    label="Full Name" 
                    name="fullName" 
                    value={formData.fullName} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your full name"
                />
                {fieldErrors.fullName && (
                    <p className="mt-1 text-sm text-red-400">{fieldErrors.fullName}</p>
                )}
            </div>
            
            <div>
                <Input 
                    id="idNumber" 
                    label="SA ID Number" 
                    name="idNumber" 
                    value={formData.idNumber} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="13 digits"
                />
                {fieldErrors.idNumber && (
                    <p className="mt-1 text-sm text-red-400">{fieldErrors.idNumber}</p>
                )}
            </div>
            
            <div>
                <Input 
                    id="accountNumber" 
                    label="Account Number" 
                    name="accountNumber" 
                    value={formData.accountNumber} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="8-18 digits"
                />
                {fieldErrors.accountNumber && (
                    <p className="mt-1 text-sm text-red-400">{fieldErrors.accountNumber}</p>
                )}
            </div>
            
            <div>
                <Input 
                    id="password" 
                    label="Password" 
                    name="password" 
                    type="password" 
                    value={formData.password} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol"
                />
                {fieldErrors.password && (
                    <p className="mt-1 text-sm text-red-400">{fieldErrors.password}</p>
                )}
            </div>
            
            <Button type="submit">Register</Button>
            <p className="text-sm text-center text-slate-400">
                Already have an account? <span onClick={() => onSwitch('login')} className="font-medium text-cyan-400 hover:underline cursor-pointer">Login here</span>
            </p>
        </form>
    );
}