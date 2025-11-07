# Backend Security Tests

This directory contains automated security tests for the API to verify that security middleware is functioning correctly.

## Tests Included

### 1. Rate Limiting Defense Test
- **Purpose:** Verifies that `express-rate-limit` is actively protecting against brute-force attacks
- **Method:** Sends 100+ requests and confirms the 101st request receives a `429 Too Many Requests` response
- **Validates:** Rate limit headers (`RateLimit-Limit`, `RateLimit-Remaining`)

### 2. Security Headers Test
- **Purpose:** Confirms all critical Helmet security headers are present and correctly configured
- **Headers Verified:**
  - `Strict-Transport-Security` (HSTS with 1-year max-age, includeSubDomains, preload)
  - `X-Frame-Options` (Clickjacking protection)
  - `X-Content-Type-Options` (MIME-sniffing protection)
  - `Content-Security-Policy` (XSS/Injection protection)
  - `X-DNS-Prefetch-Control` (DNS prefetch control)
  - `Referrer-Policy` (Referrer information protection)

### 3. HTTPS/TLS Enforcement Test
- **Purpose:** Verifies the API only accepts HTTPS connections
- **Method:** Confirms the base URL uses HTTPS protocol

### 4. Server Information Leak Test
- **Purpose:** Ensures no sensitive server information is exposed in headers
- **Method:** Checks that `X-Powered-By` and similar headers are removed

## Running the Tests

### Prerequisites
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the backend server:
   ```bash
   npm run dev
   ```
   The server should be running at `https://localhost:4000`

### Run Security Tests
In a separate terminal:
```bash
npm run security-tests
```

Or use the standard test command:
```bash
npm test
```

### Expected Output
```
🔒 API Security Tests - Rate Limiting & Headers
  Rate Limiting Defense (express-rate-limit)
    ✅ should allow 100 requests and then block the next one with 429

  Security Headers Defense (Helmet)
    ✅ should include all critical security headers
    ✅ should not expose sensitive server information

  HTTPS/TLS Enforcement
    ✅ should only accept HTTPS connections
```

## CI/CD Integration

These tests are designed to run in the DevSecOps pipeline (CircleCI).

### CircleCI Configuration
Add to `.circleci/config.yml`:
```yaml
- run:
    name: Run API Security Tests
    command: |
      cd backend
      npm run dev &
      sleep 5  # Wait for server to start
      npm run security-tests
```

## Test Configuration

- **Timeout:** 30 seconds (for rate limiting test with 100+ requests)
- **Base URL:** `https://localhost:4000` (configurable via `API_URL` environment variable)
- **SSL Verification:** Disabled for self-signed certificates in test environment

## Troubleshooting

### "ECONNREFUSED" Error
- Ensure the backend server is running on `https://localhost:4000`
- Check that SSL certificates are generated in the `/certs` directory

### Rate Limit Test Fails
- Ensure the rate limit is set to 100 requests per 15 minutes in `security.js`
- Wait 15 minutes if you've hit the rate limit during development

### Header Tests Fail
- Verify Helmet is properly configured in `middleware/security.js`
- Check that the HSTS configuration includes `maxAge: 31536000`, `includeSubDomains: true`, `preload: true`

## Notes

- Tests use self-signed certificates, so SSL verification is disabled in test mode
- Rate limiting test may take 20-30 seconds to complete due to 100+ HTTP requests
- Tests verify the actual security posture of the running API, not just configuration
