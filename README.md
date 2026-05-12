# 📚 LearNova — E-Library System

## 🌐 Live Demo

[https://cs-303-project-8zh4meoxi-heba29715-1160s-projects.vercel.app/](https://cs-303-project-8zh4meoxi-heba29715-1160s-projects.vercel.app/)

## 🎨 Presentation

[https://canva.link/2hxgexjrk8ax25x](https://canva.link/2hxgexjrk8ax25x)

---

# 📖 About The Project

LearnNova is a full-stack digital library platform that enables users to search, read, annotate, and borrow books online through both web and mobile applications.

The system modernizes traditional library services by providing a seamless digital experience with 24/7 accessibility, advanced book management, and an interactive PDF reading environment.

---

# 🚩 Problem Statement

Traditional libraries depend heavily on manual processes and physical attendance, which can limit accessibility and efficiency for students and readers.

Users often face:

* Limited working hours
* Slow manual searching
* Paper-based borrowing systems
* Difficulty accessing resources remotely

LearNova solves these challenges by offering a fully digital library system accessible anytime and anywhere.

---

# 🎯 Project Goals

| Goal                         | Description                                          |
| ---------------------------- | ---------------------------------------------------- |
| Improve Accessibility        | Enable users to access books anytime from any device |
| Simplify Management          | Digitize book records and borrowing operations       |
| Enhance User Experience      | Provide a fast and intuitive user interface          |
| Support Cross-Platform Usage | Deliver both web and mobile experiences              |

---

# ✨ Features

## 👤 User Features

* Secure authentication system
* Search books by title, author, or category
* Read books online using a built-in PDF viewer
* Annotate PDFs using:

  * Pen tool
  * Highlighter
  * Eraser
* Submit borrow requests for physical books
* View borrowing history
* Manage personal profile
* Rate books and leave comments

---

## 🛠️ Admin Features

* Add new books with cover image and PDF upload
* Edit and delete books
* Manage users and permissions
* Approve or reject borrow requests
* Manage categories and tags
* Monitor system activity through admin dashboard

---

# 📱 Platforms

## 🌍 Web Application

Built for desktop and browser users with responsive UI and fast navigation.

## 📱 Mobile Application

Cross-platform mobile app built using React Native and Expo.

---

# 🛠️ Tech Stack

## Frontend

* React.js
* JavaScript (ES6)
* HTML5
* Tailwind CSS

## Backend

* Node.js
* Express.js
* REST API
* MongoDB

## Mobile

* React Native
* Expo SDK 54
* PDF.js
* WebView

---

# 🧩 System Architecture

```text
Frontend (React.js)
        │
        ▼
 REST API (Express.js)
        │
        ▼
   MongoDB Database
        ▲
        │
Mobile App (React Native)
```

---

# 📂 Project Structure

```text
CS303-Project/
├── backend/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routers/
│       └── services/
│
├── frontend/
│   └── src/
│       ├── components/
│       ├── context/
│       └── pages/
│
└── mobile/
    └── my-app/
        └── app/
            ├── auth/
            ├── components/
            ├── config/
            └── context/
```

---

# 🚀 Getting Started

## Prerequisites

Make sure you have installed:

* Node.js v18+
* npm or yarn
* MongoDB
* Expo CLI

---

## ⚙️ Backend Setup

```bash
cd backend
npm install
npm start
```

---

## 💻 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 📱 Mobile Setup

```bash
cd mobile/my-app
npm install
npx expo start
```

---

# 👥 User Flow

1. Register or log in
2. Search for books
3. View book details and ratings
4. Read or annotate PDFs online
5. Submit borrow requests
6. Manage borrowing history and profile

---

# 🔐 Admin Flow

1. Log in to dashboard
2. Add or update books
3. Manage users and permissions
4. Review borrowing requests
5. Organize categories and tags

---

# 📊 Project Tracking

Google Sheets Tracking:
[https://docs.google.com/spreadsheets/d/1yq1QS1ojBvzc_Qf9eHTxTndbc7mCfVMq9iKjjMgmhhs/edit?gid=0#gid=0](https://docs.google.com/spreadsheets/d/1yq1QS1ojBvzc_Qf9eHTxTndbc7mCfVMq9iKjjMgmhhs/edit?gid=0#gid=0)

---

# 🚀 Future Improvements

* AI-based book recommendations
* Real-time notifications
* Dark mode support
* Multi-language support
* Online reservation system
* Advanced analytics dashboard

---

# 👥 Team Members

| Name             | GitHub                                                                   |
| ---------------- | ------------------------------------------------------------------------ |
| Alaa Ashraf      | [https://github.com/AlaaAshraf17](https://github.com/AlaaAshraf17)       |
| Ahmed Arafa      | [https://github.com/darkmaster02004](https://github.com/darkmaster02004) |
| AbdelRahman Rizk | [https://github.com/ARizk003](https://github.com/ARizk003)               |
| Mariam Mohamed   | [https://github.com/MariamOsmann](https://github.com/MariamOsmann)       |
| Hend Ashraf      | [https://github.com/Hend-Salem](https://github.com/Hend-Salem)           |
| Heba Mohamed     | [https://github.com/hebamohameedd](https://github.com/hebamohameedd)     |

---

# ⭐ Conclusion

LearNova provides a modern digital library experience that combines accessibility, usability, and efficient management into one integrated platform across web and mobile environments.
