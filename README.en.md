# FlowCRM

> **Versión en español:** [README.md](README.md)

A CRM (Customer Relationship Management) system for managing sales, users, challenges, and operational dashboards. Integrates automatic synchronization with an external platform and notifications via n8n.

## Technologies

### Backend

- **Java 25** with **Spring Boot 4.0**
- Spring Security + JWT (jjwt)
- Spring Data JPA + MySQL
- Spring Mail (email notifications)
- Jsoup (HTML scraping/parsing)
- Apache HttpClient 5 (integration with external platform)

### Frontend

- **Next.js 16** with React 19
- TypeScript
- Tailwind CSS 4
- Recharts (dashboard charts)
- Lucide React (icons)

## Project Structure

```
crm/
├── backend/
│   └── src/main/java/com/flashpage/app/
│       ├── config/          # Security, JWT, CORS
│       ├── controller/      # Auth, Catalog, Dashboard, Challenge, Management, User, Sale
│       ├── exception/       # Global error handling
│       ├── model/           # JPA entities (Sale, Client, Product, User, etc.)
│       ├── repository/      # Spring Data repositories
│       └── service/         # Business logic, external platform sync, JWT
├── frontend/
│   ├── app/
│   │   ├── crm/            # Dashboard, Users, Sales
│   │   ├── iniciar-sesion/  # Login
│   │   ├── restablecer*/    # Password reset
│   │   └── form/            # Forms
│   ├── components/          # Reusable UI, dashboard widgets and charts
│   ├── context/             # React context providers
│   ├── lib/                 # Utilities
│   └── types/               # TypeScript types
```

## Prerequisites

- Java 25 (JDK)
- Node.js 20+
- MySQL

## Environment Variables

The backend requires the following variables in a `.env` file:

| Variable                  | Description                                                     |
| ------------------------- | --------------------------------------------------------------- |
| `JWT_SECRET`              | Base64 (256-bit) secret key for signing and validating JWT      |
| `DB_PASSWORD`             | MySQL database password                                         |
| `EXTERNAL_CRM_BASE_URL`   | Base URL of the external CRM platform                           |
| `N8N_URL`                 | Base URL of the n8n instance                                    |
| `N8N_SECRET`              | Base64 (256-bit) secret key to authenticate requests to n8n     |
| `MAIL_USERNAME`           | Email address used for sending emails via SMTP                  |
| `MAIL_PASSWORD`           | SMTP email application password                                 |
| `GOOGLE_CLIENT_ID`        | OAuth 2.0 Client ID for Google authentication                   |
| `GOOGLE_CLIENT_SECRET`    | OAuth 2.0 Client Secret for Google authentication               |

Configure the MySQL connection in `application-dev.yaml` or `application-prod.yaml`.

The frontend requires the following variables in a `.env` file:

| Variable                    | Description                                        |
| --------------------------- | -------------------------------------------------- |
| `NEXT_PUBLIC_API`           | Backend API base URL                               |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | Support email displayed in the frontend app        |

## Local Setup

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

The server starts at `http://localhost:8080`.

### Frontend

```bash
cd frontend
npm i
npm run dev
```

The app starts at `http://localhost:3000`.

## Docker

### Backend

```bash
cd backend
./mvnw clean package -DskipTests
docker build -t your-backend-image-name-here .
docker run -p 8080:8080 your-backend-image-name-here
```

### Frontend

```bash
cd frontend
docker build \
  --build-arg NEXT_PUBLIC_API=http://localhost:8080/api \
  --build-arg NEXT_PUBLIC_SUPPORT_EMAIL=support@outlook.com \
  -t your-frontend-image-name-here .
docker run -p 3000:3000 your-frontend-image-name-here
```

## Screenshots

Screenshots of the application are available in the [`images/`](images/) folder.

## Main Features

- **Authentication**: JWT login, password reset via email
- **Sales management**: Sales CRUD with status tracking
- **User management**: Roles, advisors, supervisors
- **Dashboard**: Real-time metrics with charts (Recharts), period filters, supervisor view
- **Challenges**: Challenge/goal system for advisors
- **Catalog**: Products and promos synced with external platform (daily cron at 3:00 AM)
- **Notifications**: n8n integration for automated webhooks
