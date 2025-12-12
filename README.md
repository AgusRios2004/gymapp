# 🏋️‍♀️ GymApp API - Sports Center Management System

![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.0-6DB33F?style=for-the-badge&logo=spring&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring_Security-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)

> **Comprehensive RESTful API** designed to streamline administration for gyms and sports centers. It handles complex logic for memberships, workout routines, and financial tracking with a focus on security and scalability.

## 📖 Project Overview

**GymApp** is a backend solution built to digitize the daily operations of a fitness center. Unlike simple CRUD applications, this system implements specific business logic for workout planning (routines/exercises), attendance tracking, and product sales, all secured by role-based access control.

## ✨ Key Features

* **👥 User Management:** Role-based system for Administrators, Professors, and Clients.
* **💪 Workout Logic:** Creation of complex workout routines, assigning specific exercises and days.
* **💰 Financial Module:** Management of monthly membership fees, product inventory, and sales records.
* **🛡️ Robust Security:** Implementation of **Spring Security** for authentication, authorization, and CORS policies.
* **📐 Clean Architecture:** Utilization of **DTO Pattern** and **MapStruct/Mappers** to decouple the internal domain model from the API layer.
* **⚡ Global Exception Handling:** Centralized error management for consistent JSON responses.

## 🛠️ Tech Stack

* **Core:** Java 17, Spring Boot 3+
* **Security:** Spring Security (RBAC & CORS)
* **Data:** Spring Data JPA, Hibernate, MySQL
* **Utilities:** Maven, Lombok (optional if used), ModelMapper/MapStruct.

## 🚀 Installation & Setup

### Prerequisites
* Java JDK 17+
* Maven
* MySQL Database

### Getting Started

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/AgusRios2004/gymapp.git](https://github.com/AgusRios2004/gymapp.git)
    cd gymapp
    ```

2.  **Database Configuration:**
    Update `src/main/resources/application.properties` with your credentials:
    ```properties
    spring.datasource.url=jdbc:mysql://localhost:3306/gymapp_db
    spring.datasource.username=your_user
    spring.datasource.password=your_password
    spring.jpa.hibernate.ddl-auto=update
    ```

3.  **Build and Run:**
    ```bash
    ./mvnw clean install
    ./mvnw spring-boot:run
    ```

The server will start at `http://localhost:8080`.

---

## 🔌 API Endpoints (Preview)

| Module | Method | Endpoint | Description |
| :--- | :---: | :--- | :--- |
| **Clients** | `POST` | `/clients` | Register a new gym member. |
| | `GET` | `/clients/{id}` | Retrieve member details. |
| **Routines** | `POST` | `/routines` | Create a workout plan. |
| | `GET` | `/routines/client/{id}` | Get routines assigned to a client. |
| **Payments** | `POST` | `/payments` | Process a membership payment. |
| **Auth** | `POST` | `/login` | User authentication (if implemented). |

> **Dev Note:** The API follows strictly typed JSON responses using DTOs to ensure data integrity.

## 🤝 Contribution

1.  Fork the project.
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the Branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 👤 Author

**Agustín Rios** - *Backend Developer*
* [LinkedIn](https://www.linkedin.com/in/agustin-rios)
* [GitHub Profile](https://github.com/AgusRios2004)

---
*Built with Spring Boot power.* 🍃
