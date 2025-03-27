# README - Project Setup

## 🛠 ติดตั้งและรันโปรเจกต์

### 1️⃣ ติดตั้ง Dependencies ของโปรเจกต์หลัก
```bash
npm install
npm run dev
```

---

## 🎨 Frontend Setup

### 📌 ติดตั้ง Dependencies ที่จำเป็นสำหรับ Frontend
```bash
npm install @react-google-maps/api
npm install next-auth
npm install @auth/prisma-adapter
npm install bcrypt
npm install --save-dev @types/bcrypt
npm install @prisma/client
```

### 🔧 ตั้งค่าและใช้งาน Prisma
```bash
npx prisma init
npx prisma migrate dev --name init
```

---

## 🔥 Backend Setup

### 📌 ติดตั้ง Dependencies สำหรับทุก Service
```bash
npm install express axios dotenv nodemailer cors twilio
npm install @prisma/client
```

### 🔧 ตั้งค่าและใช้งาน Prisma
```bash
npx prisma init
npx prisma migrate dev --name init
```

### 🚀 รัน Backend Server
```bash
node src/server.js
```

