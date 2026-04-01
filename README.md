# 🏋️‍♀️ GymApp - Sports Center Management System

![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5-6DB33F?style=for-the-badge&logo=spring&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)

> **Comprehensive Management System** designed to streamline administration for gyms. It handles memberships, workout routines, assistance tracking, and payments with a focus on security and scalability.

## 📖 Project Overview

**GymApp** is a fullstack solution built to digitize the daily operations of a fitness center. It implements specific business logic for workout planning, attendance tracking, and financial module for memberships and sales.

## ✨ Key Features

* **👥 User Management:** Role-based system for Administrators, Professors, and Clients.
* **💪 Workout Logic:** Creation of workout routines, assigning specific exercises and days.
* **💰 Financial Module:** Management of monthly membership fees and payment records.
* **🛡️ Security:** Implementation of **Spring Security** for authentication and CORS policies.
* **📊 Dashboard:** Overview of gym statistics and active members.
* **🐳 Dockerized:** Ready for deployment using Docker and Docker Compose.

## 🛠️ Tech Stack

### Backend
* **Core:** Java 21, Spring Boot 3.5
* **Data:** Spring Data JPA, Hibernate, PostgreSQL
* **Utilities:** Maven, Lombok, MapStruct (via custom mappers)

### Frontend
* **Core:** React 19, TypeScript, Vite
* **State Management:** TanStack Query (React Query)
* **Styling:** Tailwind CSS, Lucide Icons
* **Forms:** React Hook Form, Zod

## 🚀 Installation & Setup (Docker)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AgusRios2004/gymapp.git
   cd gymapp
   ```

2. **Run with Docker:**
   ```bash
   docker compose up --build
   ```
   Access the system at `http://localhost`.

## 🚀 Installation & Setup (Manual)

### Prerequisites
* Java JDK 21+
* Maven
* Node.js & npm
* PostgreSQL

### Steps
1. **Database:** Create a database named `gym_db`.
2. **Backend:** Update `gymapp-back/src/main/resources/application.properties` and run `./mvnw spring-boot:run`.
3. **Frontend:** Run `npm install` and `npm run dev` in `gym-frontend/`.

---
*Built with ❤️ by Agustín Rios.*
