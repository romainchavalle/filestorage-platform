# ☁️ FileStorage Platform

> A modern, secure, and scalable file sharing and storage platform. 

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![AWS S3](https://img.shields.io/badge/AWS_S3-569A31?style=for-the-badge&logo=amazon-s3&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## 📖 Overview & Business Logic

**FileStorage Platform** is a full-stack web application designed to act as a secure, personal cloud storage solution. 

From a **functional perspective**, it allows users to:
- Securely upload and manage personal or professional files.
- Organize files efficiently.
- Generate secure, password-protected sharing links for external users.

From a **technical perspective**, it demonstrates advanced software engineering practices, including a strict separation of concerns (Frontend/Backend/Shared), End-to-End testing, and cloud-native integrations.

## 🏗️ Architecture

This project is built as a **Monorepo** to share types and configurations effortlessly across the stack.

### 🔙 Backend (`/backend`)
- **Framework:** NestJS 11
- **Database ORM:** Prisma
- **Storage:** AWS S3 (via `@aws-sdk/client-s3`)
- **Security:** JWT Authentication, Passport, Bcrypt
- **Documentation:** Swagger UI integration
- **Testing:** Jest & Supertest (E2E & Unit)

### 🖥️ Frontend (`/frontend`)
- **Core:** React 19 + Vite + TypeScript
- **Styling:** Tailwind CSS 4 + Lucide Icons
- **State Management:** Zustand
- **Forms & Validation:** React Hook Form + Resolvers
- **File Upload:** React Dropzone
- **Testing:** Vitest, React Testing Library, and **Playwright** for E2E testing.

### 🤝 Shared (`/shared`)
- Contains shared DTOs, interfaces, and types to ensure strict End-to-End Type Safety between the client and the server.

---

## 🚀 Features

- **Secure Authentication:** JWT-based user authentication.
- **Cloud Storage:** Direct integration with AWS S3 for reliable file uploads and generation of pre-signed URLs.
- **Drag & Drop Uploads:** Smooth UI for file uploading utilizing `react-dropzone`.
- **State-of-the-Art Testing:** Comprehensive test coverage including E2E tests powered by Playwright and Jest.
- **Modern UI:** Responsive and accessible interface built with Tailwind CSS.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v20+)
- PostgreSQL (or your preferred DB supported by Prisma)
- AWS S3 bucket credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/romainchavalle/filestorage-platform.git
   cd filestorage-platform
   ```

2. **Install dependencies** (run in both frontend and backend)
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Environment Setup**
   - Duplicate `.env.example` to `.env` in the backend and configure your Database URL and AWS credentials.
   
4. **Database Migration**
   ```bash
   cd backend
   npx prisma migrate dev
   ```

5. **Start the application**
   - **Backend:** `npm run start:dev`
   - **Frontend:** `npm run dev`

---

## 🧪 Testing

The platform enforces high-quality standards through multiple testing layers:

```bash
# Backend (Jest)
npm run test        # Unit tests
npm run test:e2e    # End-to-End API tests

# Frontend (Vitest & Playwright)
npm run test        # Unit/Component tests
npm run test:e2e    # UI End-to-End tests
```

---

## 📄 License
This project is proprietary and confidential.

---
*Built with ❤️ by Romain Chavalle.*
