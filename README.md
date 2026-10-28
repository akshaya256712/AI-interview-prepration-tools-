# AI Interview Preparation Tools

A beginner-friendly full-stack web application for students preparing for job interviews. It provides a curated question bank, answer-writing practice, user accounts, and a saved practice history.

## 1. Problem statement

Students often do not know which interview questions to practice or how to keep track of their answers. This project organizes common HR, technical, behavioral, and career questions in one place and lets each user save answers for later review.

## 2. Objectives

- Provide a searchable interview question bank.
- Group questions into useful categories.
- Let users create an account and log in.
- Save answers to a persistent PostgreSQL database.
- Display each user's saved practice history.
- Demonstrate a complete HTML/CSS/JavaScript + Node/Express + Supabase application.

## 3. Features

- Responsive dashboard and question list.
- Filter by category and search by question text.
- Registration and login with hashed passwords.
- JWT-protected personal practice history.
- Server-side input validation and request rate limits.
- PostgreSQL data persistence through Supabase.
- No paid AI API or external AI service is required.

**Important limitation:** Despite “AI” in the project title, this MVP does not call an AI model or automatically grade answers. It is a local interview-practice tool with a curated question bank. AI-generated feedback can be added later using a properly secured API if allowed by the project requirements.

## 4. Technology stack

- Frontend: HTML5, CSS3, Vanilla JavaScript
- Backend: Node.js and Express.js
- Database: Supabase PostgreSQL
- Security packages: bcryptjs, jsonwebtoken, helmet, express-rate-limit
- Version control: Git and GitHub

## 5. Folder structure

```text
ai-interview-preparation-tools/
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── backend/
│   ├── server.js
│   ├── supabase.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── questions.js
│   │   └── sessions.js
│   ├── middleware/
│   │   └── auth.js
│   ├── utils/
│   │   └── validation.js
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
├── database/
│   └── schema.sql
├── .gitignore
└── README.md
```

## 6. Prerequisites

Install these tools:

- Node.js LTS: https://nodejs.org/
- Visual Studio Code: https://code.visualstudio.com/
- Git: https://git-scm.com/
- Supabase account: https://supabase.com/

Check installations in a new terminal:

```bash
node --version
npm --version
git --version
```

## 7. Supabase setup

1. Sign in to Supabase and create a new project.
2. Wait until the database is ready.
3. Open **Project Settings → API** (or the project's API keys section).
4. Copy the Project URL and the server-side service-role/secret key. Never put this privileged key in frontend files or GitHub.
5. Open **SQL Editor → New query**.
6. Copy all contents of `database/schema.sql`, paste it into the editor, and run it.
7. Open **Table Editor** and confirm that `users`, `questions`, and `practice_sessions` exist. The `questions` table should contain starter questions.

The backend uses the service-role key, so it can bypass RLS. The API protects personal history by checking a signed JWT and filtering records by the authenticated user's ID. Keep the key private and do not deploy this demo without a security review.

## 8. Configure environment variables

In the `backend` directory, copy `.env.example` to a new file named `.env`. On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Edit `backend/.env` with your own values:

```env
PORT=3000
NODE_ENV=development
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVER_SIDE_SERVICE_ROLE_KEY
JWT_SECRET=replace_with_a_long_random_secret
```

Generate a random JWT secret from the `backend` directory:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Paste the generated value after `JWT_SECRET=`. Do not use the example values literally. `.env` holds your private local settings and must not be committed. `.env.example` documents variable names and is safe to commit.

## 9. Install and run

Open a terminal in VS Code. Change directory to the backend folder:

```bash
cd backend
npm install
npm run dev
```

Expected terminal output:

```text
AI Interview Preparation Tools running at http://localhost:3000
```

Open http://localhost:3000 in your browser. Keep the terminal running while you use the site.

Health check: open http://localhost:3000/api/health. A successful response looks like:

```json
{"status":"ok","application":"AI Interview Preparation Tools"}
```

For a normal start without auto-reload, use `npm start`.

## 10. How to use the application

1. Open the app and choose **Create account**.
2. Enter your name, email, and a password of at least 8 characters.
3. Choose a question category or search for a question.
4. Select a question and type an answer of at least 10 characters.
5. Press **Save practice**.
6. Scroll to **Practice history** to see your saved answer.
7. Log out when finished. Log in again to see your history.

## 11. API endpoints

All routes are served from the same Express server.

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/api/health` | Check server status | Public |
| POST | `/api/auth/register` | Create account | Public; name, email, password |
| POST | `/api/auth/login` | Log in | Public; email, password |
| GET | `/api/auth/me` | Get current account from token | Bearer token |
| GET | `/api/questions` | Get active question bank | Public |
| GET | `/api/sessions` | Get latest 50 saved answers | Bearer token; own records only |
| POST | `/api/sessions` | Save an answer | Bearer token; question_id and answer |

Protected requests use the header `Authorization: Bearer YOUR_TOKEN`. The frontend attaches it automatically after login. Errors are returned as JSON with an `error` field.

## 12. Architecture

1. The browser displays `frontend/index.html` and loads CSS/JavaScript.
2. Frontend JavaScript calls the Express API using `fetch()`.
3. Express validates requests and checks JWT tokens for private routes.
4. The server uses its private Supabase key to query PostgreSQL.
5. The API returns JSON and the browser updates the page.

Passwords are hashed with bcrypt before being stored. The backend never sends password hashes to the browser.

## 13. Testing checklist

- [ ] `GET /api/health` returns `status: ok`.
- [ ] The question bank loads from Supabase.
- [ ] Register with a valid name, email, and password.
- [ ] Try registering the same email again; it should be rejected.
- [ ] Log in with the correct password.
- [ ] Log in with a wrong password; it should be rejected.
- [ ] Try saving an answer shorter than 10 characters; it should be rejected.
- [ ] Save a valid answer and confirm it appears in Practice history.
- [ ] Refresh the page and confirm history remains.
- [ ] Log out; personal history should no longer be shown.
- [ ] Use a narrow browser window and confirm the layout adapts.
- [ ] Open browser developer tools and confirm no Supabase service-role key is present in frontend assets.

## 14. Troubleshooting

- **Supabase connection error:** Check `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `backend/.env`, then restart the server.
- **No questions appear:** Confirm the SQL script ran successfully and `questions` contains rows.
- **`Invalid API key`:** Copy the correct server-side key from your own Supabase project. Do not add quotation marks around the value.
- **Port already in use:** Change `PORT=3001` in `.env` and open `http://localhost:3001`.
- **Cannot log in after changing JWT_SECRET:** Existing tokens become invalid; log in again.
- **Changes to `.env` do not apply:** Stop and restart the Node server.
- **`npm` is not recognized:** Install Node.js LTS and reopen the terminal.
- **Database table does not exist:** Run `database/schema.sql` in the Supabase SQL Editor.

## 15. Git and GitHub upload

From the project root (not the backend directory):

```bash
git init
git status
git add .
git status
git commit -m "Build AI Interview Preparation Tools"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with the URL of a repository you created on GitHub. Before `git add .`, verify that `backend/.env`, `node_modules/`, and private data are excluded. The root `.gitignore` already excludes them. Confirm `git status` does not list `.env`.

If a secret was ever committed, adding it to `.gitignore` is not enough. Rotate the credential immediately and remove it from repository history as appropriate.

## 16. Security and limitations

- This is an educational MVP, not a production-ready service.
- The service-role key bypasses Supabase RLS. It is used only by the backend and must remain private.
- The app uses JWT tokens stored in browser local storage for simplicity. A production version should consider secure, HTTP-only cookies, stronger session controls, account recovery, email verification, and additional abuse protections.
- There is no automatic AI answer scoring or AI-generated question creation in this version.
- The starter question bank is sample educational content and can be expanded.

## 17. Future improvements

- Add optional AI feedback using a server-side API key.
- Add bookmarks and question difficulty levels.
- Add answer-rating rubrics and progress charts.
- Add timed mock interview mode.
- Add email verification and account recovery.
