import { expect } from 'chai';
import express from 'express';
import request from 'supertest';
import { registrationValidationRules, paymentValidationRules, usernameAndPaymentValidationRules } from '../utils/validation.js';
import { handleValidationErrors } from '../middleware/security.js';

describe('Validation Rules Integration Tests', () => {
    
    describe('registrationValidationRules', () => {
        let app;

        beforeEach(() => {
            app = express();
            app.use(express.json());
            app.post('/register', registrationValidationRules, handleValidationErrors, (req, res) => {
                res.status(200).json({ success: true });
            });
        });

        it('should accept valid registration data', async () => {
            const response = await request(app)
                .post('/register')
                .send({
                    fullName: 'John Doe',
                    idNumber: '9001015009087',
                    accountNumber: '1234567890',
                    password: 'Password123!'
                });

            expect(response.status).to.equal(200);
            expect(response.body.success).to.be.true;
        });

        it('should reject invalid full name', async () => {
            const response = await request(app)
                .post('/register')
                .send({
                    fullName: 'A',
                    idNumber: '9001015009087',
                    accountNumber: '1234567890',
                    password: 'Password123!'
                });

            expect(response.status).to.equal(400);
            expect(response.body.errors).to.be.an('array');
        });

        it('should reject invalid ID number', async () => {
            const response = await request(app)
                .post('/register')
                .send({
                    fullName: 'John Doe',
                    idNumber: '123',
                    accountNumber: '1234567890',
                    password: 'Password123!'
                });

            expect(response.status).to.equal(400);
        });

        it('should reject weak password', async () => {
            const response = await request(app)
                .post('/register')
                .send({
                    fullName: 'John Doe',
                    idNumber: '9001015009087',
                    accountNumber: '1234567890',
                    password: 'weak'
                });

            expect(response.status).to.equal(400);
        });
    });

    describe('paymentValidationRules', () => {
        let app;

        beforeEach(() => {
            app = express();
            app.use(express.json());
            app.post('/payment', paymentValidationRules, handleValidationErrors, (req, res) => {
                res.status(200).json({ success: true });
            });
        });

        it('should accept valid payment data', async () => {
            const response = await request(app)
                .post('/payment')
                .send({
                    recipientName: 'John Doe',
                    payeeAccountNumber: '1234567890',
                    swiftCode: 'ABCDZAJJ',
                    amount: '100.50',
                    currency: 'ZAR',
                    memo: 'Payment for services'
                });

            expect(response.status).to.equal(200);
            expect(response.body.success).to.be.true;
        });

        it('should reject invalid account number', async () => {
            const response = await request(app)
                .post('/payment')
                .send({
                    payeeAccountNumber: '123',
                    swiftCode: 'ABCDZAJJ',
                    amount: '100.50',
                    currency: 'ZAR'
                });

            expect(response.status).to.equal(400);
        });

        it('should reject invalid SWIFT code', async () => {
            const response = await request(app)
                .post('/payment')
                .send({
                    payeeAccountNumber: '1234567890',
                    swiftCode: 'ABC',
                    amount: '100.50',
                    currency: 'ZAR'
                });

            expect(response.status).to.equal(400);
        });

        it('should reject invalid currency', async () => {
            const response = await request(app)
                .post('/payment')
                .send({
                    payeeAccountNumber: '1234567890',
                    swiftCode: 'ABCDZAJJ',
                    amount: '100.50',
                    currency: 'JPY'
                });

            expect(response.status).to.equal(400);
        });

        it('should accept payment without optional memo', async () => {
            const response = await request(app)
                .post('/payment')
                .send({
                    payeeAccountNumber: '1234567890',
                    swiftCode: 'ABCDZAJJ',
                    amount: '100.50',
                    currency: 'USD'
                });

            expect(response.status).to.equal(200);
        });
    });

    describe('usernameAndPaymentValidationRules', () => {
        let app;

        beforeEach(() => {
            app = express();
            app.use(express.json());
            app.post('/user-payment', usernameAndPaymentValidationRules, handleValidationErrors, (req, res) => {
                res.status(200).json({ success: true });
            });
        });

        it('should accept valid username and payment', async () => {
            const response = await request(app)
                .post('/user-payment')
                .send({
                    username: 'user123',
                    amount: '50.00'
                });

            expect(response.status).to.equal(200);
        });

        it('should reject invalid username', async () => {
            const response = await request(app)
                .post('/user-payment')
                .send({
                    username: 'usr',
                    amount: '50.00'
                });

            expect(response.status).to.equal(400);
        });

        it('should reject amount exceeding limit', async () => {
            const response = await request(app)
                .post('/user-payment')
                .send({
                    username: 'user123',
                    amount: '15000.00'
                });

            expect(response.status).to.equal(400);
        });

        it('should reject zero amount', async () => {
            const response = await request(app)
                .post('/user-payment')
                .send({
                    username: 'user123',
                    amount: '0'
                });

            expect(response.status).to.equal(400);
        });

        it('should reject negative amount', async () => {
            const response = await request(app)
                .post('/user-payment')
                .send({
                    username: 'user123',
                    amount: '-50.00'
                });

            expect(response.status).to.equal(400);
        });
    });
});
