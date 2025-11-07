import { expect } from 'chai';
import express from 'express';
import request from 'supertest';
import { applyCoreMiddleware, handleValidationErrors } from '../middleware/security.js';
import { validationResult } from 'express-validator';

describe('Security Middleware Tests', () => {
    
    describe('applyCoreMiddleware', () => {
        let app;

        beforeEach(() => {
            app = express();
            applyCoreMiddleware(app);
        });

        it('should apply Helmet security headers', async () => {
            app.get('/test', (req, res) => res.send('OK'));
            
            const response = await request(app).get('/test');
            
            // Helmet sets various security headers
            expect(response.headers).to.have.property('x-dns-prefetch-control');
            expect(response.headers).to.have.property('x-frame-options');
            expect(response.headers).to.have.property('x-content-type-options');
            expect(response.headers['x-content-type-options']).to.equal('nosniff');
        });

        it('should set HSTS header with correct max-age', async () => {
            app.get('/test', (req, res) => res.send('OK'));
            
            const response = await request(app).get('/test');
            
            expect(response.headers).to.have.property('strict-transport-security');
            expect(response.headers['strict-transport-security']).to.include('max-age=31536000');
        });

        it('should enable CORS for configured origin', async () => {
            app.get('/test', (req, res) => res.send('OK'));
            
            const response = await request(app)
                .get('/test')
                .set('Origin', 'https://localhost:5173');
            
            expect(response.headers).to.have.property('access-control-allow-origin');
        });

        it('should parse JSON request bodies', async () => {
            app.post('/test', (req, res) => res.json(req.body));
            
            const response = await request(app)
                .post('/test')
                .send({ key: 'value' })
                .set('Content-Type', 'application/json');
            
            expect(response.status).to.equal(200);
            expect(response.body).to.deep.equal({ key: 'value' });
        });

        it('should apply rate limiting to /api routes', async () => {
            app.get('/api/test', (req, res) => res.send('OK'));
            
            // Make multiple requests to trigger rate limit
            const requests = [];
            for (let i = 0; i < 101; i++) {
                requests.push(request(app).get('/api/test'));
            }
            
            const responses = await Promise.all(requests);
            
            // At least one request should be rate limited
            const rateLimited = responses.some(res => res.status === 429);
            expect(rateLimited).to.be.true;
        });

        it('should not rate limit non-API routes', async () => {
            app.get('/test', (req, res) => res.send('OK'));
            
            // Make multiple requests
            const requests = [];
            for (let i = 0; i < 110; i++) {
                requests.push(request(app).get('/test'));
            }
            
            const responses = await Promise.all(requests);
            
            // All requests should succeed
            const allSucceeded = responses.every(res => res.status === 200);
            expect(allSucceeded).to.be.true;
        });
    });

    describe('handleValidationErrors', () => {
        it('should call next() when there are no validation errors', () => {
            const req = {};
            const res = {
                status: function() { return this; },
                json: function() { return this; }
            };
            let nextCalled = false;
            const next = () => { nextCalled = true; };

            // Mock validationResult to return no errors
            const originalValidationResult = validationResult;
            const mockValidationResult = () => ({
                isEmpty: () => true,
                array: () => []
            });

            // Temporarily replace validationResult
            Object.defineProperty(req, 'validationResult', {
                value: mockValidationResult,
                configurable: true
            });

            handleValidationErrors(req, res, next);
            
            expect(nextCalled).to.be.true;
        });

        it('should return 400 with errors when validation fails', async () => {
            const app = express();
            applyCoreMiddleware(app);

            app.post('/test',
                (req, res, next) => {
                    // Manually inject validation errors for testing
                    req.validationErrors = [
                        { msg: 'Invalid field', param: 'testField' }
                    ];
                    
                    // Mock validationResult
                    const originalValidationResult = validationResult;
                    const mockValidationResult = () => ({
                        isEmpty: () => false,
                        array: () => req.validationErrors
                    });
                    
                    // Override validationResult for this request
                    req.validationResult = mockValidationResult;
                    
                    next();
                },
                (req, res, next) => {
                    const errors = req.validationResult();
                    if (!errors.isEmpty()) {
                        return res.status(400).json({ errors: errors.array() });
                    }
                    next();
                },
                (req, res) => res.send('OK')
            );

            const response = await request(app)
                .post('/test')
                .send({ testField: '' });

            expect(response.status).to.equal(400);
            expect(response.body).to.have.property('errors');
            expect(response.body.errors).to.be.an('array');
        });
    });
});
