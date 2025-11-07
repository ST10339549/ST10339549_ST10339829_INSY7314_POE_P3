import { expect } from 'chai';
import express from 'express';
import request from 'supertest';
import paymentRouter from '../routes/paymentRoutes.js';
import { applyCoreMiddleware } from '../middleware/security.js';

describe('Payment Routes Integration Tests', () => {
    let app;

    beforeEach(() => {
        app = express();
        applyCoreMiddleware(app);
        app.use('/api/payments', paymentRouter);
    });

    describe('POST /api/payments', () => {
        it('should accept valid payment request', async () => {
            const response = await request(app)
                .post('/api/payments')
                .send({
                    recipientName: 'John Doe',
                    payeeAccountNumber: '1234567890',
                    swiftCode: 'ABCDZAJJ',
                    amount: '150.75',
                    currency: 'ZAR',
                    memo: 'Payment for invoice #12345'
                });

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('message');
            expect(response.body).to.have.property('transaction');
            expect(response.body.transaction).to.have.property('transactionId');
            expect(response.body.transaction).to.have.property('status', 'Pending');
        });

        it('should reject payment with invalid account number', async () => {
            const response = await request(app)
                .post('/api/payments')
                .send({
                    payeeAccountNumber: '123',
                    swiftCode: 'ABCDZAJJ',
                    amount: '100.00',
                    currency: 'USD'
                });

            expect(response.status).to.equal(400);
            expect(response.body).to.have.property('errors');
        });

        it('should reject payment with invalid SWIFT code', async () => {
            const response = await request(app)
                .post('/api/payments')
                .send({
                    payeeAccountNumber: '1234567890',
                    swiftCode: 'INVALID',
                    amount: '100.00',
                    currency: 'EUR'
                });

            expect(response.status).to.equal(400);
        });

        it('should reject payment with invalid amount format', async () => {
            const response = await request(app)
                .post('/api/payments')
                .send({
                    payeeAccountNumber: '1234567890',
                    swiftCode: 'ABCDZAJJ',
                    amount: '100.123',
                    currency: 'GBP'
                });

            expect(response.status).to.equal(400);
        });

        it('should reject payment with invalid currency', async () => {
            const response = await request(app)
                .post('/api/payments')
                .send({
                    payeeAccountNumber: '1234567890',
                    swiftCode: 'ABCDZAJJ',
                    amount: '100.00',
                    currency: 'JPY'
                });

            expect(response.status).to.equal(400);
        });

        it('should accept payment without optional recipientName', async () => {
            const response = await request(app)
                .post('/api/payments')
                .send({
                    payeeAccountNumber: '9876543210',
                    swiftCode: 'SBICENBB',
                    amount: '250.00',
                    currency: 'USD'
                });

            expect(response.status).to.equal(200);
        });

        it('should normalize SWIFT code to uppercase', async () => {
            const response = await request(app)
                .post('/api/payments')
                .send({
                    payeeAccountNumber: '1234567890',
                    swiftCode: 'abcdzajj',
                    amount: '50.00',
                    currency: 'ZAR'
                });

            expect(response.status).to.equal(200);
            expect(response.body.transaction.swiftCode).to.equal('ABCDZAJJ');
        });
    });

    describe('GET /api/payments', () => {
        it('should return transaction history', async () => {
            // First, create a transaction
            await request(app)
                .post('/api/payments')
                .send({
                    payeeAccountNumber: '1234567890',
                    swiftCode: 'ABCDZAJJ',
                    amount: '100.00',
                    currency: 'ZAR'
                });

            // Then retrieve the history
            const response = await request(app)
                .get('/api/payments');

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('message');
            expect(response.body).to.have.property('transactions');
            expect(response.body).to.have.property('count');
            expect(response.body.transactions).to.be.an('array');
        });

        it('should include transaction details in history', async () => {
            const paymentData = {
                payeeAccountNumber: '9876543210',
                swiftCode: 'SBICENBB123',
                amount: '75.50',
                currency: 'EUR',
                memo: 'Test payment'
            };

            await request(app)
                .post('/api/payments')
                .send(paymentData);

            const response = await request(app)
                .get('/api/payments');

            expect(response.status).to.equal(200);
            const lastTransaction = response.body.transactions[response.body.transactions.length - 1];
            expect(lastTransaction).to.have.property('payeeAccountNumber', paymentData.payeeAccountNumber);
            expect(lastTransaction).to.have.property('swiftCode', paymentData.swiftCode);
            expect(lastTransaction).to.have.property('amount', paymentData.amount);
        });
    });
});
