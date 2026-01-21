<div align="center">

<img width="515" height="175" alt="image" src="https://github.com/user-attachments/assets/0ee4d955-2a8a-408e-946f-eb0acb0232c7" />


#  EasyTrack - Personal Finance Tracker

**Master your money with the most intuitive personal finance tracker.**

[![Java](https://img.shields.io/badge/Java-17-orange?logo=openjdk)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-brightgreen?logo=springboot)](https://spring.io/projects/spring-boot)
[![Angular](https://img.shields.io/badge/Angular-17-red?logo=angular)](https://angular.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?logo=mysql)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[Live Demo](https://easytrack.com) • [Documentation](docs/) • [Report Bug](https://github.com/yourusername/easytrack-finance-tracker/issues) • [Request Feature](https://github.com/yourusername/easytrack-finance-tracker/issues)

</div>

---

##  Table of Contents

- [About The Project](#about-the-project)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Acknowledgments](#acknowledgments)

---

##  About The Project

**EasyTrack** is a full-stack personal finance tracker designed to help users take control of their financial lives without compromising privacy. Unlike traditional finance apps that require bank account integration, EasyTrack lets you manually manage your data via CSV imports or direct entry.

### Why EasyTrack?

-  **Privacy First**: No bank login required—your data stays yours
-  **Smart Budgeting**: "Safe to Spend" calculations based on remaining budget and days
-  **Beautiful Insights**: Glassmorphic UI with real-time financial health metrics
-  **Lightning Fast**: Dashboard loads in < 1.5 seconds
-  **Portfolio Project**: Showcases enterprise-grade full-stack development skills

### Built With

This project demonstrates proficiency in modern full-stack development:

**Backend:**
- Java 17
- Spring Boot 3.2
- Spring Security (JWT)
- Spring Data JPA
- MySQL 8.0
- Maven
- Flyway (Database Migrations)
- SpringDoc OpenAPI (Swagger)

**Frontend:**
- Angular 17
- TypeScript
- RxJS (Reactive Programming)
- Tailwind CSS
- Chart.js (Data Visualization)

**DevOps:**
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- Nginx

---

##  Screenshots

### Dashboard
![Dashboard](docs/assets/screenshots/dashboard.png)
*Real-time financial overview with "Safe to Spend" calculations*

### Transaction Management
![Transactions](docs/assets/screenshots/transactions.png)
*Full CRUD operations with advanced filtering*

### CSV Import
![CSV Import](docs/assets/screenshots/csv-import.png)
*Bulk import with automatic deduplication and merchant name cleaning*

### Budget Tracking
![Budget](docs/assets/screenshots/budget.png)
*Visual budget progress with spending trends*

---

##  Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Java | 17 | Core programming language |
| Spring Boot | 3.2.2 | Application framework |
| Spring Security | 6.2 | Authentication & authorization |
| Spring Data JPA | 3.2 | Database persistence |
| MySQL | 8.0 | Relational database |
| JWT | 0.12.5 | Token-based authentication |
| Flyway | 10.0 | Database migration versioning |
| SpringDoc OpenAPI | 2.3.0 | API documentation (Swagger) |
| Lombok | 1.18 | Boilerplate code reduction |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Angular | 17 | Frontend framework |
| TypeScript | 5.3 | Type-safe JavaScript |
| RxJS | 7.8 | Reactive programming |
| Tailwind CSS | 3.4 | Utility-first styling |
| Chart.js | 4.4 | Data visualization |
| Lucide Icons | 0.300 | Icon library |

---

##  Features

### Core Functionality
-  **Secure Authentication**: JWT-based auth with BCrypt password hashing
-  **Transaction Management**: Full CRUD with pagination and filtering
-  **CSV Bulk Import**: Automated deduplication and merchant name cleaning
-  **Smart Budgeting**: Daily "safe to spend" calculations
-  **Spending Trends**: Compare current vs. previous month
-  **Savings Goals**: Track progress with estimated completion dates
-  **Debt Tracking**: Countdown to debt-free dates
-  **Category Management**: Predefined and custom categories
-  **Responsive Design**: Mobile-first, works on all devices

### Advanced Features
-  **Google OAuth Integration**: Single Sign-On (SSO)
-  **Password Reset**: Email-based password recovery
-  **Token Refresh**: Secure token rotation mechanism
-  **Progressive Web App**: Installable on mobile devices (planned)
-  **Multi-Language Support**: i18n ready (planned)

---

##  Architecture

### High-Level System Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                         │
│  [Browser] [Mobile Browser] [Desktop Browser]          │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS (JWT)
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                      │
│  [Angular SPA] [Nginx Web Server]                      │
└────────────────────────┬────────────────────────────────┘
                         │ REST API (JSON)
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  APPLICATION LAYER                       │
│  [Spring Security] → [Controllers] → [Services]         │
│                      → [Repositories]                    │
└────────────────────────┬────────────────────────────────┘
                         │ JDBC
                         ▼
┌─────────────────────────────────────────────────────────┐
│                     DATA LAYER                           │
│                   MySQL Database                         │
└─────────────────────────────────────────────────────────┘
```

For detailed architecture diagrams, see [docs/02-design/system-architecture.md](docs/02-design/system-architecture.md)

---

##  Getting Started

### Prerequisites

- **Java**: JDK 17 or higher
```bash
  java -version  # Should show version 17+
```

- **Node.js**: Version 20+ (LTS)
```bash
  node --version
```

- **MySQL**: Version 8.0+
```bash
  mysql --version
```

- **Maven**: Version 3.9+ (or use included wrapper)
```bash
  mvn -version
```

- **Angular CLI**: Version 17+
```bash
  npm install -g @angular/cli
  ng version
```

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/easytrack-finance-tracker.git
cd easytrack-finance-tracker
```

#### 2. Setup MySQL Database
```bash
# Login to MySQL
mysql -u root -p

# Create database and user
CREATE DATABASE easytrack_db;
CREATE USER 'easytrack_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON easytrack_db.* TO 'easytrack_user'@'localhost';
FLUSH PRIVILEGES;
```

#### 3. Configure Backend
```bash
cd easytrack-backend

# Create application-local.yml (not committed to Git)
cp src/main/resources/application.yml src/main/resources/application-local.yml

# Edit application-local.yml with your database credentials
```

**application-local.yml:**
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/easytrack_db
    username: easytrack_user
    password: your_password

jwt:
  secret: your-secret-key-change-this
```

#### 4. Build and Run Backend
```bash
# Using Maven wrapper (recommended)
./mvnw clean install
./mvnw spring-boot:run -Dspring-boot.run.profiles=local

# Backend will start on http://localhost:8080
```

#### 5. Setup and Run Frontend
```bash
cd ../easytrack-frontend

# Install dependencies
npm install

# Start development server
ng serve

# Frontend will start on http://localhost:4200
```

### Running the Application

#### Using Docker Compose (Recommended for Production)
```bash
# Build and start all services
docker-compose up -d

# Stop all services
docker-compose down
```

Services will be available at:
- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **MySQL**: localhost:3306

---

##  Project Structure
```
easytrack-finance-tracker/
├── easytrack-backend/              # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/easytrack/backend/
│   │   │   │   ├── config/         # Security, CORS, JWT config
│   │   │   │   ├── controller/     # REST API endpoints
│   │   │   │   ├── service/        # Business logic
│   │   │   │   ├── repository/     # Data access layer
│   │   │   │   ├── entity/         # JPA entities
│   │   │   │   ├── dto/            # Data Transfer Objects
│   │   │   │   ├── security/       # JWT, filters
│   │   │   │   └── util/           # Helper classes
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       └── db/migration/   # Flyway migrations
│   │   └── test/                   # Unit & integration tests
│   ├── pom.xml
│   └── Dockerfile
│
├── easytrack-frontend/             # Angular Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/               # Guards, interceptors, services
│   │   │   ├── shared/             # Reusable components
│   │   │   ├── features/           # Feature modules
│   │   │   │   ├── auth/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── transactions/
│   │   │   │   └── budget/
│   │   │   └── models/             # TypeScript interfaces
│   │   ├── assets/
│   │   └── environments/
│   ├── package.json
│   ├── angular.json
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── docs/                           # Project Documentation
│   ├── 01-requirements/
│   ├── 02-design/
│   ├── 03-implementation/
│   └── 04-testing/
│
├── docker-compose.yml
├── .github/
│   └── workflows/                  # CI/CD pipelines
├── .gitignore
├── LICENSE
└── README.md
```

---

##  API Documentation

Interactive API documentation is available via Swagger UI:

- **Development**: http://localhost:8080/swagger-ui.html
- **Production**: https://api.easytrack.com/swagger-ui.html

### Quick API Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/register` | POST | Register new user |
| `/api/v1/auth/login` | POST | User login |
| `/api/v1/transactions` | GET | List transactions (paginated) |
| `/api/v1/transactions` | POST | Create transaction |
| `/api/v1/transactions/import-csv` | POST | Bulk import via CSV |
| `/api/v1/dashboard/summary` | GET | Dashboard aggregated data |
| `/api/v1/budgets` | GET/POST | Budget management |

For complete API specification, see [docs/02-design/api-specification.md](docs/02-design/api-specification.md)

---

## 🗺️ Roadmap

### Phase 1: MVP  (Current)
- [x] User authentication (JWT)
- [x] Transaction CRUD
- [x] CSV import with deduplication
- [x] Budget tracking
- [x] Dashboard with "Safe to Spend"
- [x] Savings goals
- [x] Debt tracking

### Phase 2: Enhancements  (In Progress)
- [ ] Email verification
- [ ] Two-factor authentication (2FA)
- [ ] Receipt image uploads
- [ ] Export to PDF reports
- [ ] Advanced analytics charts
- [ ] Recurring transactions

### Phase 3: Integrations  
- [ ] Plaid bank integration (optional)
- [ ] Investment tracking
- [ ] Bill reminders
- [ ] Shared budgets (family accounts)
- [ ] Mobile apps (iOS/Android)

See the [open issues](https://github.com/yourusername/easytrack-finance-tracker/issues) for a full list of proposed features and known issues.

---

##  Contributing

Contributions are what make the open-source community amazing! Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

##  License

Distributed under the MIT License. See `LICENSE` for more information.

---

## Contact

**Your Name** - [your.email@example.com](mailto:your.email@example.com)

**Project Links:**
- GitHub: [https://github.com/yourusername/easytrack-finance-tracker](https://github.com/yourusername/easytrack-finance-tracker)
- Live Demo: [https://easytrack.com](https://easytrack.com)
- LinkedIn: [https://linkedin.com/in/yourprofile](https://linkedin.com/in/yourprofile)
- Portfolio: [https://yourportfolio.com](https://yourportfolio.com)

---

## Acknowledgments

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Angular Documentation](https://angular.io/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [OWASP Security Guidelines](https://owasp.org/)
- Inspired by [Copilot Money](https://copilot.money/)

---

<div align="center">

</div>
