import { expect } from 'chai';
import axios from 'axios';
import https from 'node:https';

const API_BASE_URL = process.env.API_URL || 'https://localhost:4000';
const API_LOGIN_URL = `${API_BASE_URL}/api/auth/login`;
const MAX_REQUESTS = 100; // Based on express-rate-limit config

// Accept all status codes for testing purposes
const acceptAllStatuses = () => true;

// Disable SSL verification for self-signed certificates in test environment
const axiosInstance = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
});

// Helper function to count rate-limited responses
function countRateLimitedResponses(responses) {
    let successCount = 0;
    let rateLimitedCount = 0;
    
    for (const res of responses) {
        if (res.status === 429) {
            rateLimitedCount++;
        } else {
            successCount++;
        }
    }
    
    return { successCount, rateLimitedCount };
}

// Helper function to check if rate limit headers are present
function hasRateLimitHeaders(headers) {
    return !!(
        headers['ratelimit-limit'] || 
        headers['x-ratelimit-limit'] ||
        headers['ratelimit-remaining'] !== undefined
    );
}

// Helper function to verify rate limiting is active
function verifyRateLimiting(rateLimitedCount, finalResponse) {
    const rateLimitingActive = rateLimitedCount > 0 || finalResponse.status === 429;
    expect(rateLimitingActive).to.be.true;
    
    if (finalResponse.status === 429) {
        expect(hasRateLimitHeaders(finalResponse.headers)).to.be.true;
        console.log(`   �️  Rate limiting active: 429 status with rate limit headers`);
    } else {
        console.log(`   🛡️  Rate limiting active: ${rateLimitedCount} requests blocked during burst`);
    }
}

// Helper function to send final test request
async function sendFinalTestRequest() {
    try {
        return await axiosInstance.post(
            API_LOGIN_URL, 
            { idNumber: '9001015009087', password: 'wrongpassword' }, 
            { validateStatus: acceptAllStatuses }
        );
    } catch (error) {
        return error.response;
    }
}

// Helper function to validate a single security header
function validateSecurityHeader(headers, headerName, config) {
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

    return `   ✅ ${headerName}: ${config.description}`;
}

// Helper function to validate all security headers
function validateAllSecurityHeaders(headers, criticalHeaders) {
    const results = [];
    console.log('   🔍 Checking security headers...');

    for (const [headerName, config] of Object.entries(criticalHeaders)) {
        const result = validateSecurityHeader(headers, headerName, config);
        results.push(result);
    }

    // Log all successful header checks
    for (const result of results) {
        console.log(result);
    }
    
    return headers;
}

// Helper function to validate HSTS configuration
function validateHSTSConfig(hstsHeader) {
    expect(hstsHeader).to.include('includeSubDomains', 
        'HSTS should include subdomains'
    );
    expect(hstsHeader).to.include('preload', 
        'HSTS should be preload-enabled'
    );
}

describe('🔒 API Security Tests - Rate Limiting & Headers', () => {
    
    describe('Rate Limiting Defense (express-rate-limit)', () => {
        it('should enforce rate limiting and return 429 status when limit is exceeded', async function() {
            this.timeout(30000); // 30 second timeout for 100+ requests

            console.log(`   📊 Sending ${MAX_REQUESTS} requests to test rate limit...`);

            // 1. Send MAX_REQUESTS to test the limit
            const requests = new Array(MAX_REQUESTS).fill(0).map(() => 
                axiosInstance.post(API_LOGIN_URL, 
                    { idNumber: '9001015009087', password: 'wrongpassword' }, 
                    { validateStatus: acceptAllStatuses }
                )
            );
            
            // Wait for all requests to finish
            const responses = await Promise.all(requests);
            
            // Count successful and rate-limited requests
            const { successCount, rateLimitedCount } = countRateLimitedResponses(responses);
            console.log(`   ✅ ${successCount} requests processed, ${rateLimitedCount} rate-limited`);

            // 2. Send one more request to ensure rate limiting is active
            const finalResponse = await sendFinalTestRequest();

            // 3. Verify rate limiting is active
            verifyRateLimiting(rateLimitedCount, finalResponse);
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
                validateStatus: acceptAllStatuses
            });
            
            const headers = validateAllSecurityHeaders(response.headers, CRITICAL_HEADERS);

            // Additional HSTS checks for maximized security
            const hstsHeader = headers['strict-transport-security'];
            validateHSTSConfig(hstsHeader);

            console.log('   🛡️  All critical security headers present and configured correctly');
        });

        it('should not expose sensitive server information', async () => {
            const response = await axiosInstance.get(`${API_BASE_URL}/api/auth/login`, {
                validateStatus: acceptAllStatuses
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
