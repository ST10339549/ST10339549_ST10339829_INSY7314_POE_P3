# INSY7314 - Secure International Payments Portal
 
**Student Numbers:** ST10339549 & ST10339829
 
This repository contains the source code for Part 2 of the INSY7314 Proof of Evidence. It is a secure, full-stack web application designed to simulate an international payments portal for a banking customer. The project consists of a React frontend and a Node.js/Express backend, built as a monorepo with a primary focus on security and modern development practices.
 
## 🚀 Key Features
 
-   **Pre-Registered User Access:** Access restricted to pre-registered users only (no public registration).
-   **User Login:** Authenticate using pre-assigned credentials.
-   **International Payment Form:** Submit a new international payment with validation.
-   **End-to-End Security:** A multi-layered security approach to protect against common web vulnerabilities.
-   **Automated Security Scanning:** A DevSecOps pipeline to automatically analyze code for security hotspots and vulnerabilities on every commit.
 
## 🛡️ Security Implementation
 
Security is a core requirement of this project. The following measures have been implemented:
 
-   **Data in Transit (HTTPS/SSL/TLS):**
    Both the frontend and backend servers are configured to run exclusively on HTTPS, using a self-signed SSL certificate. This encrypts all communication to prevent Man-in-the-Middle (MitM) attacks.
 
-   **Password Security (Hashing & Salting):**
    The `bcryptjs` library is used to hash and salt all user passwords before they are stored. This ensures that even in the event of a data breach, passwords remain protected.
 
-   **Input Whitelisting & Validation:**
    The `express-validator` library enforces strict, whitelist-based validation rules on the backend for all user input. This is the primary defense against injection attacks (e.g., XSS, SQLi).
 
-   **DDoS & Brute-Force Protection:**
    The `express-rate-limit` middleware is configured to limit the number of API requests from a single IP address, mitigating automated attacks.
 
-   **Secure HTTP Headers:**
    The `helmet` library is used to set numerous secure HTTP headers, protecting against common vulnerabilities like Clickjacking and Cross-Site Scripting (XSS).

-   **No Public Registration (Task 3 Compliance):**
    The `/api/auth/register` endpoint has been intentionally removed to prevent unauthorized account creation. All users must be pre-registered by administrators, ensuring proper identity verification and access control.
 
## 🛠️ Tech Stack
 
-   **Frontend:** React, Vite, Tailwind CSS
-   **Backend:** Node.js, Express.js
-   **Security:** `bcryptjs`, `helmet`, `express-rate-limit`, `express-validator`
-   **DevSecOps:** CircleCI (CI/CD), SonarCloud (Static Code Analysis)
 
## ⚙️ Local Setup and Installation
 
To run this project locally, follow these steps:
 
1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-folder>
    ```
 
2.  **Generate SSL Certificates:**
    This project uses a self-signed certificate for HTTPS in development. Navigate to the `certs` directory and use OpenSSL to generate the required files.
 
3.  **Install Dependencies:**
    This project uses npm workspaces. Run the install command from the root directory to install dependencies for both the frontend and backend.
 
4.  **Run the Application:**
    Start both the backend and frontend servers concurrently.
    -   The backend will be available at `https://localhost:4000`.
    -   The frontend will be available at `https://localhost:5173`.

## 👥 User Management

**Important:** Public user registration has been disabled for security compliance with Task 3, Requirement 1.

-   **Current State:** The application includes three pre-registered test users for demonstration purposes.
-   **User Schema:** Each user requires: `id`, `fullName`, `idNumber`, `accountNumber`, and `password` (hashed).
-   **Note:** In a production environment, users would be pre-registered by administrators through a secure back-office system and stored in a persistent database.

### 🔑 Test User Credentials

You can login with any of these pre-registered accounts:

| Full Name      | ID Number       | Account Number | Password       |
|----------------|-----------------|----------------|----------------|
| John Doe       | 9001015009087   | 1234567890     | Customer123!   |
| Jane Smith     | 8505125432109   | 2345678901     | TestUser456!   |
| Alice Johnson  | 9208304567123   | 3456789012     | Banking789!    |

**Note:** All passwords are securely hashed using bcrypt with 12 salt rounds before storage.
 
## 🔄 DevSecOps Pipeline
 
This project includes a DevSecOps pipeline configured in `.circleci/config.yml`.
 
-   **Trigger:** The pipeline is automatically triggered on every `git push` to the `main` branch.
-   **Process:** It uses CircleCI to check out the code, install all dependencies, and then run a comprehensive security and quality scan using SonarCloud.
-   **Purpose:** This ensures that all code is continuously analyzed for security vulnerabilities, code smells, and bugs, adhering to modern DevSecOps best practices.
 