import React, { useState } from 'react';
import Input from './common/Input';
import Button from './common/Button';
import Alert from './common/Alert';

const API_URL = 'https://localhost:4000/api/auth/login';

export default function LoginForm({ onLogin }) {
    const [formData, setFormData] = useState({ idNumber: '', password: '' });
    const [apiMessage, setApiMessage] = useState({ text: '', type: '' });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiMessage({ text: '', type: '' });
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            setApiMessage({ text: data.message, type: 'success' });
            setTimeout(() => onLogin(data.user), 1500);
        } catch (error) {
            setApiMessage({ text: error.message, type: 'error' });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-semibold text-center text-slate-100">Login</h2>
            <Alert message={apiMessage.text} type={apiMessage.type} />
            <Input id="idNumber" label="SA ID Number" name="idNumber" value={formData.idNumber} onChange={handleChange} />
            <Input id="password" label="Password" name="password" type="password" value={formData.password} onChange={handleChange} />
            <Button type="submit">Login</Button>
            <p className="text-sm text-center text-slate-400">
                Access is restricted to pre-registered users only.
            </p>
        </form>
    );
}