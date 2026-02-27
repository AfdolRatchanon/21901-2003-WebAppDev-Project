# ระบบเบิก-จ่ายอุปกรณ์ไอที (IT Equipment Checkout System)

> **โปรเจกต์หลักวิชา 21901-2003 การพัฒนาเว็บแอปพลิเคชัน**

---

## 🗂️ โครงสร้างโปรเจกต์

```
project/
├── frontend/     ← React + TypeScript + Vite
└── backend/      ← Node.js + Express + Prisma + Socket.io
```

---

## 🚀 เริ่มต้นใช้งาน (Quick Start)

### Backend

```bash
cd backend

# 1. ติดตั้ง dependencies
npm install

# 2. ตั้งค่า environment
cp .env.example .env
# แก้ไขค่าใน .env ตามต้องการ

# 3. สร้าง database + run migrations
npx prisma db push

# 4. Seed ข้อมูลตัวอย่าง
npm run db:seed

# 5. Start dev server
npm run dev
# → http://localhost:3000
```

### Frontend

```bash
cd frontend

# 1. ติดตั้ง dependencies
npm install

# 2. Start dev server
npm run dev
# → http://localhost:5173
```

---

## 👤 Test Accounts (หลัง seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@school.ac.th | admin123 |
| Teacher | teacher@school.ac.th | teacher123 |
| Student | student@school.ac.th | student123 |

---

## 📡 API Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|--------------|-------------|
| POST | `/api/auth/login` | ❌ | เข้าสู่ระบบ |
| GET | `/api/equipments` | ✅ | ดูรายการอุปกรณ์ |
| POST | `/api/equipments` | ✅ Admin/Teacher | เพิ่มอุปกรณ์ |
| PATCH | `/api/equipments/:id` | ✅ | อัปเดตสถานะ |
| DELETE | `/api/equipments/:id` | ✅ Admin | ลบอุปกรณ์ |
| GET | `/health` | ❌ | Health check |

---

## 🔌 Socket.io Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `joinRoom` | Client → Server | `"equipment-updates"` |
| `equipmentStatusChanged` | Server → Client | `{ equipmentId, newStatus, borrowedBy }` |

---

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript + Vite + React Router + Axios + Socket.io-client + Zod
- **Backend:** Node.js + Express + TypeScript + Prisma + JWT + Socket.io + Bcrypt + Zod
- **Database:** SQLite (dev) / PostgreSQL (prod)
- **Deploy:** Vercel (frontend) + Railway (backend + DB)
