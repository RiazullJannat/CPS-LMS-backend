# LMS Backend

Backend API for a Learning Management System, built with Strapi. Developed for the Junior Software Engineer project round.

## Tech Stack

- Strapi 5.52.1
- Database: SQLite for local development, PostgreSQL for production
- Node.js >= 20.0.0 (tested up to 26.x, per `package.json` engines)
- npm (package-lock.json is the committed lockfile)

## Features Completed

- Role-based authentication with four roles: admin, content_manager, instructor, student
- Course management: create, update, delete, and list courses, with ownership checks for instructors
- Lesson management scoped to a course, with the same ownership checks
- Student self-enrollment in courses
- Lesson-progress tracking per student and per lesson, with an endpoint that returns a student's completion percentage for a course
- Quiz creation with multiple-choice questions; correct answers are stripped from quiz reads for students
- Quiz submission with server-side auto-grading and a single-attempt guard per student per quiz
- Per-course, per-student progress endpoint for instructors, content managers, and admins
- Admin-only user management endpoints: list all users, update a user's role, create a user directly
- Platform-wide dashboard statistics endpoint (user counts by role, totals for courses, lessons, enrollments, and quizzes)

## User Roles

| Role | Description |
|---|---|
| admin | Full access: manages user accounts and roles, creates/updates/deletes any course, lesson, or quiz, and views platform-wide dashboard statistics. |
| content_manager | Creates/updates/deletes any course, lesson, or quiz; can view the instructor list and any course's student-progress report; cannot manage user accounts or roles. |
| instructor | Creates and manages lessons and quizzes for the courses they own; updating or deleting a course, lesson, or quiz they do not own is rejected; can view the student-progress report only for their own courses. |
| student | Enrolls in courses, views lessons, marks lessons complete, and submits quizzes (auto-graded, one attempt per quiz); can only see their own enrollments, progress, and quiz results. |

## Running Locally

1. Clone the repository and install dependencies:

   ```
   git clone <repository-url>
   cd lms-backend
   npm install
   ```

2. Copy the example environment file and fill in real values:

   ```
   cp .env.example .env
   ```

   At minimum, generate values for `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`, and `ENCRYPTION_KEY`. The default database settings in `.env.example` use SQLite, so no database server is required for local development.

3. Start the development server:

   ```
   npm run develop
   ```

4. On first run, open the admin panel and create the first admin account through the on-screen setup form. This account is separate from the application's own `admin` userType and is used to manage content types, roles, and permissions from the Strapi admin UI.

5. The admin panel is available at `http://localhost:1337/admin` and the REST API at `http://localhost:1337/api` (ports follow the `HOST`/`PORT` values in `.env`).

## Environment Variables

| Variable | Purpose | Required | Example |
|---|---|---|---|
| `HOST` | Server bind address | Optional (default `0.0.0.0`) | `0.0.0.0` |
| `PORT` | Server port | Optional (default `1337`) | `1337` |
| `NODE_ENV` | Runtime environment | Optional (default `development`) | `production` |
| `APP_KEYS` | Comma-separated session/cookie signing keys | Required | `key1,key2` |
| `API_TOKEN_SALT` | Salt for API token hashing | Required | `randomBase64String` |
| `ADMIN_JWT_SECRET` | Signs admin-panel JWTs | Required | `randomBase64String` |
| `TRANSFER_TOKEN_SALT` | Salt for data transfer tokens | Required | `randomBase64String` |
| `JWT_SECRET` | Signs end-user (API) JWTs | Required | `randomBase64String` |
| `ENCRYPTION_KEY` | Encrypts sensitive config values | Required | `randomBase64String` |
| `DATABASE_CLIENT` | Database driver: `sqlite` or `postgres` | Optional (default `sqlite`) | `postgres` |
| `DATABASE_FILENAME` | SQLite file path (SQLite only) | Optional (default `.tmp/data.db`) | `.tmp/data.db` |
| `DATABASE_URL` | Postgres connection string | Required when `DATABASE_CLIENT=postgres` | `postgresql://user:password@host:5432/dbname` |
| `DATABASE_SSL` | Enable SSL for the database connection | Optional (default `false`) | `true` |
| `DATABASE_SSL_REJECT_UNAUTHORIZED` | Verify the database's SSL certificate | Optional (default `true`) | `false` |
| `CORS_ORIGINS` | Comma-separated list of allowed frontend origins | Optional (defaults to localhost) | `https://your-frontend.example.com` |

Never commit a real `.env` file; only `.env.example` with placeholder values is tracked in the repository.

## Deployment Notes

For a PostgreSQL-based production deployment:

- Set `DATABASE_CLIENT=postgres` and `DATABASE_URL` to the production database's connection string.
- Set `DATABASE_SSL=true` if the database provider requires SSL (most managed Postgres services do); set `DATABASE_SSL_REJECT_UNAUTHORIZED=false` only if the provider uses a certificate that can't be verified against a standard CA bundle.
- Set `NODE_ENV=production`.
- Set `CORS_ORIGINS` to the deployed frontend's actual origin(s).
- Generate fresh values for `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`, and `ENCRYPTION_KEY` — do not reuse local development values.
- `register.allowedFields` in `config/plugins.ts` must stay empty in production. It intentionally excludes `userType`, so the public registration endpoint cannot be used to self-assign a role such as `admin`; every account it creates gets the schema default role of `student`, and other roles are assigned through the admin-only user-management endpoints.
- `jwtManagement` in `config/plugins.ts` is set to `legacy`, meaning a login issues a single long-lived token (`jwt.expiresIn`, currently `7d`) rather than a short-lived access token plus refresh token.
- Run `npm run build` before `npm run start` (or let the deployment platform run both) so the admin panel is compiled ahead of serving traffic.

## API Testing

A Postman collection (`postman_collection.json`) and a matching environment file (`postman_environment.json`) are included in the repository root. Import both into Postman, select the environment, and run the collection to exercise the authentication flow and every endpoint across all four roles.
