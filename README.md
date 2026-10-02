# Hyundai Hub

A full-stack web application for booking and managing Hyundai vehicle services. It features a Node.js/Express/Sequelize backend with PostgreSQL, and a React/Vite/Tailwind frontend.

## Architecture

- **Frontend:** React 19, Vite, TailwindCSS, React Router. Handles the client and admin interfaces, and includes an OCR scanner for vehicle registration documents (Carte Grise) using Tesseract.js.
- **Backend:** Node.js, Express.js, Sequelize ORM. Handles JWT authentication, OTP verification via email (Nodemailer), and PostgreSQL database operations.

## Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL (Running locally on port 5432)

## Setup & Installation

1. **Database Setup**
   Ensure you have a PostgreSQL instance running locally. Create a database named `hyundai_hub` with the user `hyundai` and password `hyundai123` (or update `backend/.env` to match your local setup).

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install --legacy-peer-deps
   ```

## Running the Application

### 1. Start the Backend Server
The backend needs to be running for the frontend API proxy to work correctly. It will automatically sync the database models on startup.
```bash
cd backend
npm run dev
```
*(Runs on http://localhost:3001)*

### 2. Start the Frontend Server
Open a new terminal window:
```bash
cd frontend
npm run dev
```
*(Runs on http://localhost:5173 - API calls are proxied to port 3001)*

## Build for Production
To build the frontend for production deployment:
```bash
cd frontend
npm run build
```
