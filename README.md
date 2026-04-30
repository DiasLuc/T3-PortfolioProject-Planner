# Daily Planner API

Express REST API for a daily planner application with JWT authentication, in-memory storage, layered architecture, and Swagger documentation.

## Features

- User registration and login
- JWT middleware for protected planner routes
- Create, edit, delete, and list planner tasks by day
- Non-overlapping tasks per user and date
- Seeded in-memory users and task data
- Swagger UI powered by `docs/swagger.yaml`

## Structure

- `src/routes`: route definitions
- `src/controllers`: request handlers
- `src/services`: business rules
- `src/models`: in-memory persistence
- `src/middleware`: auth and error middleware
- `docs/swagger.yaml`: OpenAPI specification

## Seeded users

- `alice` / `planner123`
- `bruno` / `planner123`
- `carla` / `planner123`

## Run

1. Install dependencies with `npm install`
2. Start the server with `npm start`
3. Open `http://localhost:3000/docs`

## Notes

- Data is stored only in memory, so restarting the server resets users and tasks.
- Adjacent tasks are allowed, but overlapping tasks on the same day are rejected.
