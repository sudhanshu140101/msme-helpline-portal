# MSME Helpline Portal
live - msmehelpline.ai


A full-stack web application for MSME onboarding and digital due diligence profile creation.

This project includes:
- A static frontend (`index.html` + policy pages)
- A Node.js + Express backend API
- MySQL database integration
- JWT-based authentication for user login/register

---

## Features

- MSME user registration and login
- Input validation for PAN, mobile number, email, and PIN
- Secure password hashing (`bcryptjs`)
- JWT token authentication
- Health endpoint for API check
- Static frontend served by backend in production-like setup

---

## Tech Stack

- **Frontend:** HTML, Tailwind CSS (CDN), JavaScript
- **Backend:** Node.js, Express
- **Database:** MySQL (`mysql2`)
- **Auth:** JSON Web Tokens (`jsonwebtoken`)

---

## Project Structure

```text
MSME-report/
├── index.html
├── privacy-policy.html
├── terms.html
├── cancellation-refund-policy.html
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── user.js
│   └── scripts/
│       └── init-db.sql
└── .gitignore
