# FlowCRM

> **English version:** [README.en.md](README.en.md)

Sistema CRM (Customer Relationship Management) para gestionar ventas, usuarios, desafios y dashboards operativos. Integra sincronizacion automatica con una plataforma externa y notificaciones via n8n.

## Tecnologias

### Backend

- **Java 25** con **Spring Boot 4.0**
- Spring Security + JWT (jjwt)
- Spring Data JPA + MySQL
- Spring Mail (notificaciones por email)
- Jsoup (scraping/parsing HTML)
- Apache HttpClient 5 (integracion con plataforma externa)

### Frontend

- **Next.js 16** con React 19
- TypeScript
- Tailwind CSS 4
- Recharts (graficos del dashboard)
- Lucide React (iconos)

## Estructura del proyecto

```
crm/
├── backend/
│   └── src/main/java/com/flashpage/app/
│       ├── config/          # Seguridad, JWT, CORS
│       ├── controller/      # Auth, Catalogo, Dashboard, Desafio, Gestion, Usuario, Venta
│       ├── exception/       # Manejo global de errores
│       ├── model/           # Entidades JPA (Venta, Cliente, Producto, Usuario, etc.)
│       ├── repository/      # Repositorios Spring Data
│       └── service/         # Logica de negocio, sync con plataforma externa, JWT
├── frontend/
│   ├── app/
│   │   ├── crm/            # Dashboard, Usuarios, Ventas
│   │   ├── iniciar-sesion/  # Login
│   │   ├── restablecer*/    # Reset de password
│   │   └── form/            # Formularios
│   ├── components/          # UI reutilizable, dashboard widgets y charts
│   ├── context/             # Context providers de React
│   ├── lib/                 # Utilidades
│   └── types/               # Tipos TypeScript
```

## Requisitos previos

- Java 25 (JDK)
- Node.js 20+
- MySQL

## Variables de entorno

El backend requiere las siguientes variables en un archivo `.env`:

| Variable                  | Descripcion                                                      |
| ------------------------- | ---------------------------------------------------------------- |
| `JWT_SECRET`              | Clave secreta Base64 (256-bit) para firmar y validar tokens JWT  |
| `DB_PASSWORD`             | Contraseña de la base de datos MySQL                             |
| `EXTERNAL_CRM_BASE_URL`   | URL base de la plataforma CRM externa                            |
| `N8N_URL`                 | URL base de la instancia de n8n                                  |
| `N8N_SECRET`              | Clave secreta Base64 (256-bit) para autenticar solicitudes a n8n |
| `MAIL_USERNAME`           | Direccion de correo utilizada para el envio de emails via SMTP   |
| `MAIL_PASSWORD`           | Contrasena de aplicacion del correo SMTP                         |
| `GOOGLE_CLIENT_ID`        | Client ID de OAuth 2.0 para autenticacion con Google             |
| `GOOGLE_CLIENT_SECRET`    | Client Secret de OAuth 2.0 para autenticacion con Google         |

Configurar la conexion a MySQL en `application-dev.yaml` o `application-prod.yaml`.

El frontend requiere las siguientes variables en un archivo `.env`:

| Variable                    | Descripcion                                          |
| --------------------------- | ---------------------------------------------------- |
| `NEXT_PUBLIC_API`           | URL base de la API del backend                       |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | Correo de soporte mostrado en la aplicacion frontend |

## Ejecucion local

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

El servidor arranca en `http://localhost:8080`.

### Frontend

```bash
cd frontend
npm i
npm run dev
```

La aplicacion arranca en `http://localhost:3000`.

## Docker

### Backend

```bash
cd backend
./mvnw clean package -DskipTests
docker build -t tu-nombre-de-imagen-backend-docker-aqui .
docker run -p 8080:8080 tu-nombre-de-imagen-backend-docker-aqui
```

### Frontend

```bash
cd frontend
docker build \
  --build-arg NEXT_PUBLIC_API=http://localhost:8080/api \
  --build-arg NEXT_PUBLIC_SUPPORT_EMAIL=soporte@outlook.com \
  -t tu-nombre-de-imagen-frontend-docker-aqui .
docker run -p 3000:3000 tu-nombre-de-imagen-frontend-docker-aqui
```

## Capturas de pantalla

Las capturas de pantalla de la aplicación están disponibles en la carpeta [`images/`](images/).

## Funcionalidades principales

- **Autenticacion**: Login con JWT, reset de password por email
- **Gestion de ventas**: CRUD de ventas con seguimiento de estados
- **Gestion de usuarios**: Roles, asesores, supervisores
- **Dashboard**: Metricas en tiempo real con graficos (Recharts), filtros por periodo, vista de supervisores
- **Desafios**: Sistema de desafios/metas para asesores
- **Catalogo**: Productos y promos sincronizados con plataforma externa (cron diario a las 3:00 AM)
- **Notificaciones**: Integracion con n8n para webhooks automatizados
