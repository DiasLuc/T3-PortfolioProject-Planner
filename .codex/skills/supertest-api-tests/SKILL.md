---
name: supertest-api-tests
description: Create or update automated API tests using Supertest, Mocha, Chai, and Mochawesome against a live local endpoint. Use when a Node/Express project needs reusable API test coverage with `.env`-driven configuration, helper modules, JSON fixtures, Mocha hooks, grouped spec files, or when tests must reflect Jira or written test cases rather than trusting Swagger or the current implementation.
---

# Supertest Api Tests

Build API tests around the written source of truth, not around implementation guesses. Prefer live-endpoint tests that hit `request(<base-url>)`, use shared helpers and fixtures, and keep environment configuration in `.env` only.

## Workflow

Follow this sequence:

1. Identify the authoritative test source.
2. Inspect the existing test structure, helper patterns, fixtures, and environment setup before adding new tests.
3. Reuse the established live-endpoint pattern if the repo already has one.
4. Create or update shared test helpers and fixtures before writing repetitive spec code.
5. Group spec files by the project's main functional sections or stories, not by tiny endpoint fragments.
6. Use Mocha hooks to centralize repeated setup such as server boot, auth token creation, seed resets, and scenario preconditions.
7. Run the suite with Mocha first, then with Mochawesome if the project uses it.
8. Report real mismatches between the written test cases and current behavior instead of weakening expectations to make tests pass.

## Source Of Truth

Use the written test cases, Jira subtasks, acceptance criteria, or product requirements as the expected behavior.

Do not let Swagger or the current implementation silently redefine expected behavior when the written test cases say otherwise.

Examples:

- If a Jira test case expects `409 Conflict` for duplicates or overlaps, write the test with `409` even if the code returns `400`.
- If a test case names a specific resource id, payload, or precondition, shape the test data to match that case exactly.
- If Swagger is incomplete or wrong, call that out in the final summary instead of weakening the test.

## Environment Rules

Keep environment variables in `.env` only.

- Do not hardcode secret fallbacks such as `process.env.JWT_SECRET || "secret"`.
- Do not set or rewrite env values in test code when the repo pattern expects `.env`.
- If tests need a host and port, keep them as env variables and derive the runtime base URL through a helper instead of duplicating string assembly everywhere.
- If the server itself needs env values, load them at process startup and fail fast when they are missing.

Recommended minimum env set for this pattern:

```env
BASE_URL=http://127.0.0.1
PORT=3301
HOST=127.0.0.1
JWT_SECRET=your-local-secret
```

## Test Structure

Prefer this layout:

```text
test/
  setup.js
  fixtures/
    auth.json
    task.json
  helpers/
    getBaseUrl.js
    loginUser.js
    getToken.js
    createTask.js
    expectErrorResponse.js
  feature-a.spec.js
  feature-b.spec.js
```

Use:

- `test/setup.js` for Mocha root hooks such as `beforeAll`, `beforeEach`, and `afterAll`
- `test/fixtures/` for reusable payload templates
- `test/helpers/` for endpoint calls, auth helpers, and shared assertions
- one spec file per main business section, story, or resource group

## Live Endpoint Pattern

When the project pattern is to call the actual running endpoint, use `request(<base-url>)` instead of `request(app)`.

Recommended helper pattern:

```js
const request = require("supertest");
const { getBaseUrl } = require("./getBaseUrl");

async function loginUser(username, password) {
  return request(getBaseUrl())
    .post("/auth/login")
    .set("Content-Type", "application/json")
    .send({ username, password });
}
```

If the repo has no live-endpoint setup yet:

1. Add `dotenv` if needed.
2. Add a test bootstrap that loads `.env`.
3. Start the server in a Mocha root hook with the env-backed host and port.
4. Close the server in `afterAll`.
5. Point helpers at the derived base URL.

## Hooks

Always look for repeated setup before duplicating code in spec files.

Typical uses:

- `beforeAll`: start the HTTP server for the suite
- `beforeEach`: reset in-memory data, fetch auth tokens, register scenario users
- nested `beforeEach`: seed overlap cases, ownership cases, or section-specific preconditions
- `afterAll`: stop the HTTP server cleanly

Good candidates for local hooks:

- repeated auth token creation across many tests in the same file
- repeated fixture mutation or preconditions for a scenario group
- repeated setup for overlap, adjacency, ownership, or day-replacement cases

## Fixtures And Helpers

Use fixtures for stable payload shape. Override only the fields that differ per case.

Use helpers for:

- login and token retrieval
- endpoint calls
- base URL composition
- shared error assertions
- repeated payload creation logic

Keep helpers small and single-purpose. Avoid putting all test logic into one giant utility file.

## Writing Assertions

Write assertions to match the test case exactly.

- Check status code first.
- Assert the expected response body shape and message.
- For generated ids, assert the stable parts plus a format check when the exact id is not deterministic.
- When a test case is about filtering or ownership, assert that unrelated records are absent, not only that the response is `200`.

## Verification

Run both of these when available:

```bash
npm run test:spec
npm test
```

Use Mochawesome when the repo expects an HTML report.

If the suite fails:

- distinguish environment/setup failures from real behavior mismatches
- keep Jira- or requirement-based expectations intact
- summarize which failures are due to implementation gaps versus test harness problems

## Final Output Expectations

When finishing work with this skill:

- list the created or updated test files
- state whether the suite was run
- report the pass/fail count
- call out any requirement-vs-implementation mismatches explicitly
