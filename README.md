# Mini ERP

## Tech Stack
- **Backend**: Node.js, TypeScript, Express.js, MySQL
- **Frontend**: React, TypeScript, CSS, Vite

## Setup

### 1. MySQL
Create a database named `mini_erp` and update credentials in `backend/.env`.

### 2. Backend
```bash
cd backend
npm install
npm run dev
```
Runs on http://localhost:5000

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on http://localhost:5173

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | /api/customers | List / Create customers |
| PUT/DELETE | /api/customers/:id | Update / Delete customer |
| GET/POST | /api/employees | List / Create employees |
| PUT/DELETE | /api/employees/:id | Update / Delete employee |
| GET/POST | /api/products | List / Create products |
| PUT/DELETE | /api/products/:id | Update / Delete product |
| GET/POST | /api/sales | List / Create sales |
