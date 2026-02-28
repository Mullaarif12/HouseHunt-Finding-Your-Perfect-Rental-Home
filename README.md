# 🏡 RentEase: Premium Property Management System

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)

**RentEase** is an end-to-end MERN stack application designed to bridge the gap between property owners and renters. Featuring a sophisticated **Role-Based Access Control (RBAC)** system, it provides tailored experiences for Admins, Owners, and Renters alike.

---

## 🌟 Key Features

### �️ Enterprise-Grade Security
- **Strict RBAC**: Custom `adminMiddleware` and `ownerMiddleware` ensure that users can only access data relevant to their authorized roles.
- **Data Privacy**: Backend logic ensures owners can only edit/delete **their own** properties, preventing unauthorized cross-tenant modifications.
- **Secure Sessions**: JWT (JSON Web Tokens) with 24-hour expiration and Bcrypt password hashing.
- **Dynamic Routing**: React-based `ProtectedRoute` components prevent unauthenticated users from accessing internal dashboards.

### 🏢 Multi-User Dashboards
- **👑 Admin Portal**: 
  - Real-time monitoring of all system users.
  - Approve or Revoke Owner status with one click.
  - Comprehensive view of all global properties and booking requests.
- **🏠 Owner Studio**:
  - Multi-image property listing with automated timestamped file storage.
  - Full CRUD operations on personal listings.
  - Manage incoming booking requests with status tracking (Pending → Booked).
- **🔑 Renter Hub**:
  - Advanced search filters (Address, Property Type, Ad Type).
  - One-click "Get Info & Book" workflow.
  - Personal booking history tracking with status updates.

### ⚡ Technical Excellence
- **Multipart Uploads**: Optimized `multer` configuration for multiple image handling.
- **Cascade Operations**: Deleting a property automatically cleans up associated booking records to ensure database integrity.
- **Persistent State**: Synchronous auth-checking to prevent page-refresh redirects.

---

## 🛠️ Tech Stack

| Tier | Technologies |
| :--- | :--- |
| **Frontend** | React 18, React Router 6, Ant Design, Material UI, React Bootstrap |
| **Backend** | Node.js, Express.js, Multer (File Handling) |
| **Database** | MongoDB, Mongoose (Schema Validation) |
| **Auth** | JWT, Bcrypt.js |

---

## � Project Architecture

```text
root/
├── backend/                # Server-side Logic
│   ├── controller/         # Request Handlers (Admin, Owner, User)
│   ├── routes/             # API Endpoint Definitions
│   ├── schemas/            # Database Models (User, Property, Booking)
│   ├── middlewares/        # Security Layers (Auth, Role Verification)
│   └── uploads/            # Persistent Image Storage
└── frontend/               # Client-side Application
    ├── public/             # Static Assets & Entry HTML
    └── src/
        ├── modules/        # Dashboard Components (Admin, Owner, Renter)
        └── App.js          # Synchronous Routing & Core State
```

---

## ⚙️ Installation & Setup

### 1️⃣ Prerequisites
- **Node.js** (v14+ recommended)
- **MongoDB** (Local instance or Atlas)

### 2️⃣ Environment Setup
Create `backend/.env` (refer to `.env.example`):
```env
PORT=8001
MONGO_URI=mongodb://localhost:27017/househunt
JWT_KEY=your_secret_hash
```

### 3️⃣ Installation
```bash
# Install Backend dependencies
cd backend
npm install

# Install Frontend dependencies
cd ../frontend
npm install
```

### 4️⃣ Database Initialization
Populate the system with professional sample data:
```bash
cd backend
node seed.js
```

### 5️⃣ Execution
**Backend Server:**
```bash
cd backend
npm run dev
```
**Frontend Client:**
```bash
cd frontend
npm start
```

---

## 🔑 Demo Access (Post-Seeding)

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@rentease.com` | `Admin@123` |
| **Owner** | `owner@rentease.com` | `Owner@123` |
| **Renter** | `renter@rentease.com` | `Renter@123` |
