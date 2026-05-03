# Daily Planner API

Express REST API for a daily planner application with JWT authentication, in-memory storage, layered architecture, Swagger documentation, and Jira-aligned API test coverage.

## Features

- User registration and login
- JWT middleware for protected planner routes
- Create, edit, delete, and list planner tasks by day
- Non-overlapping tasks per user and date
- Seeded in-memory users and task data
- Swagger UI powered by `docs/swagger.yaml`
- Automated API tests using Mocha, Chai, Supertest, and Mochawesome

## Stack

- Backend: Node.js + Express
- Frontend: React + Vite - COMING SOON
- API documentation: Swagger UI + `docs/swagger.yaml`
- Authentication: JSON Web Tokens (`jsonwebtoken`)
- Test stack: Mocha + Chai + Supertest + Mochawesome

## Structure

- `src/routes`: route definitions
- `src/controllers`: request handlers
- `src/services`: business rules
- `src/models`: in-memory persistence
- `src/middleware`: auth and error middleware
- `docs/swagger.yaml`: OpenAPI specification
- `test`: automated API test suites grouped by Jira story (`KAN-2` to `KAN-8`)
- `test/helpers`: endpoint helper modules that call the running API via `BASE_URL`
- `test/fixtures`: reusable JSON request payload templates for the automated tests

## Seeded users

- `alice` / `planner123`
- `bruno` / `planner123`
- `carla` / `planner123`

## Run

1. Install dependencies with `npm install`
2. Create a local environment file with `cp .env.example .env`
3. Review `.env` and adjust values if needed
4. Start the server with `npm start`
5. Open `http://localhost:3000/docs`

## Test

1. Install dependencies with `npm install`
2. Create a local environment file with `cp .env.example .env` if it does not exist yet
3. Ensure `.env` contains:
   `BASE_URL=http://127.0.0.1`
   `PORT=3301`
   `HOST=127.0.0.1`
   `JWT_SECRET=your-local-secret`
4. Run the full Jira-aligned API suite with `npm test`
5. Open the Mochawesome report generated in `test-results/mochawesome`

## Environment

This project expects a local `.env` file for the automated API test environment.

Required variables:

- `BASE_URL`: host used by the API test helpers
- `PORT`: port used to boot the local test server
- `HOST`: host used by the application server listener
- `JWT_SECRET`: secret used to sign and verify JWT tokens

Example:

```env
BASE_URL=http://127.0.0.1
PORT=3301
HOST=127.0.0.1
JWT_SECRET=your-local-secret
```

Useful commands:

- `npm test`: run the full suite with the Mochawesome reporter
- `npm run test:spec`: run the same suite with Mocha's default terminal reporter

## Notes

- Data is stored only in memory, so restarting the server resets users and tasks.
- Adjacent tasks are allowed, but overlapping tasks on the same day are rejected.
- The automated tests reset the in-memory database before each case so suites stay isolated and repeatable.
