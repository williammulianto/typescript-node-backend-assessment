# Task Management API

A RESTful API for managing projects and tasks with cron functionality to check overdue task.

## Architecture

This project uses layered architecture to keeps everything organized, with some inspiration taken from NestJS:

```

Route -> Controller -> Service -> Repository
```

Route : Maps incoming HTTP Request to Controller.
Controller : Act as entry point for every feature/use case.
Service: Contain business logic.
Repository: Handle data persistance.

These architecture enables us to extend/swap layer when needed, example if we want to take incoming request from socket, we can swap or create route layer and use existing controller use case.

API Request/Response:

1. We wrapped all API Request/Response using DTO
2. Form data are validated using class-validator, this allow us to define validation rules directly on DTO.
3. For response we wrapped all the types using DTO, this allow us to hide internal or sensitive property later on.

Error handling:

1. Can be found in error.ts
2. This enable us to make standarized error response, and customization later on such as sending error to sentry.

Logging:

1. Custom logger class were implemented on logger.ts
2. This enable us to make logging standarized, structured and possibility later to plug in external tools to better manage log.
3. Logs are saved into local files.

Testing:

1. Unit testing and Integration testing are implemented in this project.
2. For unit testing, test service class, simulate and expect certain behaviour, dependency such as repository are mocked.
3. For integration testing, In-Memory DB is setup to make test fast and repeatable. This test ensure all layer are functioning correctly and simulate real case.

To keep project setup simple we used sqlite database to persist the data. these allow us to run the project without installing any 3rd tools such as db. Later on the database tools we use can be changed on ORM setup.

## Project Structure

```
src/
├── entities/       # Database models
├── modules/        # Feature modules (projects, tasks)
│   └── [feature]/
│       ├── dto/    # Data transfer objects
│       ├── *.controller.ts
│       ├── *.service.ts
│       └── *.route.ts
├── middlewares/    # Validation & error handling
├── jobs/           # Scheduled tasks
└── utils/          # Shared utilities
```

## Requirements

- Node.js v20.12.2
- npm / Docker (optional)

## Quick Start

```bash
# Setup environment
cp .env.example .env

# With Docker
docker compose up --build

# Without Docker
npm install
npx mikro-orm migration:up
npm run dev
```

Server runs on `http://localhost:4000`

## Available Commands

```bash
npm run dev        # Development with hot reload
npm run build      # Build for production
npm run start      # Run production build
npm test           # Run tests
```

## Tech Stack

- **Language**: TypeScript
- **Framework**: Express 5
- **ORM**: MikroORM + SQLite
- **Validation**: class-validator
- **Testing**: Vitest + Supertest
- **Logging**: Pino
- **Scheduling**: node-cron

## Testing

```bash
npm test          # Watch mode
npm run test:ci   # Single run (CI/CD)
npm run test:ui   # Interactive UI
```

## API Endpoints

### Projects

| Method | Endpoint        | Description         | Request Body                                            |
| ------ | --------------- | ------------------- | ------------------------------------------------------- |
| GET    | `/projects`     | Get all projects    | -                                                       |
| GET    | `/projects/:id` | Get project by ID   | -                                                       |
| POST   | `/projects`     | Create new project  | `{ name, description, isArchived, startDate, endDate }` |
| POST   | `/projects/:id` | Update project      | `{ name, description, isArchived, startDate, endDate }` |
| DELETE | `/projects/:id` | Soft delete project | -                                                       |

**Example - Create Project:**

```json
POST /projects
{
  "name": "New Project",
  "description": "Project description",
  "isArchived": false,
  "startDate": "2025-03-01T00:00:00.000Z",
  "endDate": "2025-04-01T00:00:00.000Z"
}
```

### Tasks

| Method | Endpoint                    | Description                 | Request Body                                        |
| ------ | --------------------------- | --------------------------- | --------------------------------------------------- |
| GET    | `/tasks/:id`                | Get task by ID              | -                                                   |
| GET    | `/tasks/project/:projectId` | Get all tasks for a project | -                                                   |
| POST   | `/tasks`                    | Create new task             | `{ name, description, status, dueDate, projectId }` |
| POST   | `/tasks/:id`                | Update task                 | `{ name, description, status, dueDate, projectId }` |
| DELETE | `/tasks/:id`                | Soft delete task            | -                                                   |

**Task Status Values:**

- `PENDING` - Task not started
- `IN_PROGRESS` - Task being worked on
- `COMPLETED` - Task finished
- `OVERDUE` - Task past due date (auto-set by cron)
- `CANCELLED` - Task cancelled

**Example - Create Task:**

```json
POST /tasks
{
  "name": "New Task",
  "description": "Task description",
  "status": "PENDING",
  "dueDate": "2024-12-31T00:00:00.000Z",
  "projectId": "uuid-of-project"
}
```

### Bruno/Postman API Collection

This project includes a Bruno collection for testing all API endpoints:

The collection includes pre-configured requests for all endpoints with example payloads.

The postman collection are exported from bruno.

## Scheduled Jobs (Cron)

### Overdue Tasks Job

**Schedule:** Runs every minute (`* * * * *`)

1. Finds all tasks where `dueDate < now` and status is not `COMPLETED`, `CANCELLED`, or `OVERDUE`
2. Automatically updates their status to `OVERDUE`
3. Logs the number of tasks marked as overdue

**Implementation details:**

- Uses forked EntityManager for isolated database context (<https://mikro-orm.io/docs/identity-map#forking-entity-manager>)
