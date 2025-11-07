import { expect } from 'chai';
import express from 'express';
import request from 'supertest';
import authRouter from '../routes/authRoutes.js';
import { applyCoreMiddleware } from '../middleware/security.js';

describe('Auth Routes Integration Tests', () => {
    let app;

    beforeEach(() => {
        app = express();
        applyCoreMiddleware(app);
        app.use('/api', authRouter);
    });

    describe('POST /api/login', () => {
        it('should reject login with missing credentials', async () => {
            const response = await request(app)
                .post('/api/login')
                .send({});

            expect(response.status).to.equal(404);
        });

        it('should reject login with invalid ID number', async () => {
            const response = await request(app)
                .post('/api/login')
                .send({
                    idNumber: '0000000000000',
                    password: 'wrongpassword'
                });

            expect(response.status).to.equal(404);
        });

        it('should reject login with wrong password', async () => {
            const response = await request(app)
                .post('/api/login')
                .send({
                    idNumber: '9001015009087',
                    password: 'WrongPassword123!'
                });

            expect(response.status).to.equal(401);
        });

        it('should accept login with valid credentials', async () => {
            const response = await request(app)
                .post('/api/login')
                .send({
                    idNumber: '9001015009087',
                    password: 'Customer123!'
                });

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('message', 'Login successful!');
            expect(response.body).to.have.property('user');
            expect(response.body.user).to.have.property('fullName');
            expect(response.body.user).to.not.have.property('password');
        });

        it('should not leak password in response', async () => {
            const response = await request(app)
                .post('/api/login')
                .send({
                    idNumber: '9001015009087',
                    password: 'Customer123!'
                });

            expect(response.body).to.not.have.property('password');
            expect(response.body.user).to.not.have.property('password');
            const bodyString = JSON.stringify(response.body);
            expect(bodyString).to.not.include('$2b$');
        });
    });
});
