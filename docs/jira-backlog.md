# Jira Backlog Snapshot

## Epic

- `KAN-1` - `Daily Planner App MVP`

Build a simple daily planner REST API using Express with JWT-based authentication, in-memory data storage, layered architecture (`routes`, `controllers`, `service`, `model`), seeded demo data, Swagger documentation, a Swagger render endpoint, and a README.

## User Stories

- `KAN-2` - `Register a new user`
- `KAN-3` - `Log in and receive JWT token`
- `KAN-4` - `Protect planner endpoints with authentication middleware`
- `KAN-5` - `Create a task for a specific day and time`
- `KAN-6` - `Retrieve all tasks for a specific day`
- `KAN-7` - `Edit a task or a day's tasks`
- `KAN-8` - `Delete a task or all tasks for a day`
- `KAN-9` - `Seed in-memory data with demo users and tasks`
- `KAN-10` - `Organize the API into layers`
- `KAN-11` - `Provide Swagger documentation and a Swagger render endpoint`
- `KAN-12` - `Create project README`

## Key Functional Rules

- Users must register and log in before they can view or modify planner data.
- Users can only access their own planner data.
- Tasks can be created in the past.
- Task times for the same user and day cannot overlap.
- Adjacent tasks are valid when one task ends exactly when another starts.
- The backend stores data in memory and starts with three seeded users plus one week of seeded tasks for each user.
