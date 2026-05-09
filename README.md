# 📚 LearNova — E-Library System

LearnNova is a full-stack digital library platform that allows users to search, read, and borrow books online. It includes a web frontend, a REST API backend, and a cross-platform mobile application.

---
## 📊 Project Tracking

[View Project Excel Sheet](https://docs.google.com/spreadsheets/d/1yq1QS1ojBvzc_Qf9eHTxTndbc7mCfVMq9iKjjMgmhhs/edit?gid=0#gid=0)

## 👥 Team

| Name | GitHub |
|------|--------|
| Alaa Ashraf | [@AlaaAshraf17](https://github.com/AlaaAshraf17) |
| Ahmed Arafa | [@darkmaster02004](https://github.com/darkmaster02004) |
| AbdelRahman Rizk | [@ARizk003](https://github.com/ARizk003) |
| Mariam Mohamed | [@MariamOsmann](https://github.com/MariamOsmann) |
| Hend Ashraf | [@Hend-Salem](https://github.com/Hend-Salem) |
| Heba Mohamed | [@hebamohameedd](https://github.com/hebamohameedd) |


---

## 🚩 Problem Statement

Traditional libraries require physical attendance, manual search, and paper-based borrowing processes that are time-consuming. Limited working hours further restrict student access to resources. LearNova solves all of this by providing a fully digital, 24/7 accessible library system.

---

## 🎯 Project Goals

| Goal | Description |
|------|-------------|
| Improve Accessibility | Enable users to access books and resources anytime, from anywhere |
| Simplify Management | Digitize borrowing records and book management for admins |
| Enhance User Experience | Provide a fast, searchable, and user-friendly interface |

---

## ✨ Features

### 👤 User
- Register and log in securely
- Search for books by title, author, or category
- Read books online with a built-in PDF viewer
- Annotate PDFs with pen, highlighter, and eraser tools
- Borrow physical books by submitting a request
- Manage personal profile and borrowing history
- Rate books and leave comments

### 🛠️ Admin
- Add, edit, and delete books (with cover image and PDF upload)
- Manage users and their roles
- Review and approve/reject borrow requests
- Manage book tags and categories
- Monitor the full library from a dedicated dashboard

---

## 🛠️ Tech Stack

### Frontend
- React.js
- HTML5 / JavaScript (ES6)
- Tailwind CSS

### Backend
- Node.js
- Express.js
- REST API
- MongoDB

### Mobile
- React Native
- Expo Go SDK 54
- WebView + PDF.js

---

## 📁 Project Structure

```
CS303-Project/
├── backend/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routers/
│       └── services/
├── frontend/
│   └── src/
│       ├── components/
│       ├── context/
│       └── pages/
└── mobile/my-app/
    └── app/
        ├── auth/
        ├── components/
        ├── config/
        └── context/
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm or yarn
- Expo CLI
- MongoDB

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Mobile
```bash
cd mobile/my-app
npm install
npx expo start
```

---

## 👥 User Flow

1. Register or log into the system
2. Search for books by title, author, or category
3. View book details, tags, and ratings
4. Read online or submit a borrow request
5. Manage profile and borrowing history

## 🔐 Admin Flow

1. Log in to the admin dashboard
2. Add, update, or remove books
3. Manage users and roles
4. Approve or reject borrow requests
5. Manage tags and categories