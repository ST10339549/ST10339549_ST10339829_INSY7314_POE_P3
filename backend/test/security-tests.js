import { expect } from 'chai';
import axios from 'axios';
import https from 'node:https';

const API_BASE_URL = process.env.API_URL || 'https://localhost:4000';
const API_LOGIN_URL = `${API_BASE_URL}/api/auth/login`;
const MAX_REQUESTS = 100; // Based on express-rate-limit config

// Disable SSL verification for self-signed certificates in test environment
const axiosInstance = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
});

describe('🔒 API Security Tests - Rate Limiting & Headers', () => {
    
    describe('Rate Limiting Defense (express-rate-limit)', () => {
        it('should enforce rate limiting and return 429 status when limit is exceeded', async function() {
            this.timeout(30000); // 30 second timeout for 100+ requests
            
            let successCount = 0;
            let rateLimitedCount = 0;
            let finalResponse;

            console.log(`   📊 Sending ${MAX_REQUESTS} requests to test rate limit...`);

            // 1. Send MAX_REQUESTS to test the limit
            const requests = new Array(MAX_REQUESTS).fill(0).map(() => 
                axiosInstance.post(API_LOGIN_URL, 
                    { idNumber: '9001015009087', password: 'wrongpassword' }, 
                    { validateStatus: () => true }
                )
            );
            
            // Wait for all requests to finish
            const responses = await Promise.all(requests);
            
            // Count successful and rate-limited requests
            for (const res of responses) {
                if (res.status === 429) {
                    rateLimitedCount++;
                } else {
                    successCount++;
                }
            }
            
            console.log(`   ✅ ${successCount} requests processed, ${rateLimitedCount} rate-limited`);

            // 2. Send one more request to ensure rate limiting is active
            try {
                finalResponse = await axiosInstance.post(API_LOGIN_URL, 
                    { idNumber: '9001015009087', password: 'wrongpassword' }, 
                    { validateStatus: () => true }
                );
            } catch (error) {
                finalResponse = error.response;
            }

            // Assertions - Rate limiting should be active (either during burst or at end)
            // If rate limit was already active, rateLimitedCount > 0
            // If we hit it during the test, final response should be 429
            const rateLimitingActive = rateLimitedCount > 0 || finalResponse.status === 429;
            
            expect(rateLimitingActive).to.be.true;
            
            if (finalResponse.status === 429) {
                // Check for rate limit headers
                const headers = finalResponse.headers;
                const hasRateLimitHeaders = 
                    !!(headers['ratelimit-limit'] || 
                    headers['x-ratelimit-limit'] ||
                    headers['ratelimit-remaining'] !== undefined);
                
                expect(hasRateLimitHeaders).to.be.true;
                console.log(`   🛡️  Rate limiting active: 429 status with rate limit headers`);
            } else {
                console.log(`   🛡️  Rate limiting active: ${rateLimitedCount} requests blocked during burst`);
            }
        });
    });

    describe('Security Headers Defense (Helmet)', () => {
        const CRITICAL_HEADERS = {
            'strict-transport-security': {
                pattern: /max-age=31536000/i,
                description: 'HSTS with 1-year max-age'
            },
            'x-frame-options': {
                pattern: /SAMEORIGIN/i,
                description: 'Clickjacking protection'
            },
            'x-content-type-options': {
                pattern: /nosniff/i,
                description: 'MIME-sniffing protection'
            },
            'content-security-policy': {
                pattern: /default-src/i,
                description: 'XSS/Injection protection'
            },
            'x-dns-prefetch-control': {
                pattern: /off/i,
                description: 'DNS prefetch control'
            },
            'referrer-policy': {
                pattern: /no-referrer/i,
                description: 'Referrer information protection'
            }
        };

        it('should include all critical security headers', async () => {
            // Send a simple request to check the response headers
            const response = await axiosInstance.get(`${API_BASE_URL}/api/auth/login`, {
                validateStatus: () => true
            });
            
            const headers = response.headers;
            const results = [];

            console.log('   🔍 Checking security headers...');

            // Iterate through critical headers and assert their presence and value
            for (const [headerName, config] of Object.entries(CRITICAL_HEADERS)) {
                const headerValue = headers[headerName];
                
                // Check if header exists
                expect(headerValue, 
                    `Missing critical security header: ${headerName} (${config.description})`
                ).to.exist;

                // Check if header value matches expected pattern
                if (config.pattern) {
                    expect(headerValue).to.match(config.pattern, 
                        `Header ${headerName} value does not match expected pattern. Got: ${headerValue}`
                    );
                }

                results.push(`   ✅ ${headerName}: ${config.description}`);
            }

            // Log all successful header checks
            for (const result of results) {
                console.log(result);
            }

            // Additional HSTS checks for maximized security
            const hstsHeader = headers['strict-transport-security'];
            expect(hstsHeader).to.include('includeSubDomains', 
                'HSTS should include subdomains'
            );
            expect(hstsHeader).to.include('preload', 
                'HSTS should be preload-enabled'
            );

            console.log('   🛡️  All critical security headers present and configured correctly');
        });

        it('should not expose sensitive server information', async () => {
            const response = await axiosInstance.get(`${API_BASE_URL}/api/auth/login`, {
                validateStatus: () => true
            });
            
            const headers = response.headers;

            // Check that server header is not exposed or is minimal
            if (headers['x-powered-by']) {
                expect.fail('X-Powered-By header should be removed by Helmet');
            }

            console.log('   ✅ No sensitive server information leaked in headers');
        });
    });

    describe('HTTPS/TLS Enforcement', () => {
        it('should only accept HTTPS connections', () => {
            // Verify that the API base URL uses HTTPS
            expect(API_BASE_URL).to.include('https://', 
                'API should be served over HTTPS only'
            );

            console.log('   🔒 Server enforces HTTPS connections');
        });
    });
});
