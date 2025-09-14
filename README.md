# Prateekk — Creator of SafeBite Quiz 👋

[![Repo: SafeBite Quiz](https://img.shields.io/badge/repo-safebite__quiz-blue?style=flat&logo=github)](https://github.com/prateekk-tech99/safebite_quiz)
[![Demo](https://img.shields.io/badge/demo-live-brightgreen?style=flat&logo=globe)](https://b941eec1-db89-4cf1-a022-e6952eba9297-00-10ndrm9g81w7i.pike.replit.dev/)
[![LinkedIn](https://img.shields.io/badge/-LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/prateek-kamble/)
[![License: MIT](https://img.shields.io/badge/license-MIT-green?style=flat)](LICENSE)

> Full‑stack developer focused on practical learning products. I built SafeBite Quiz to make food‑safety training measurable, engaging, and reusable.

---

## Demo
Live demo (hosted on Replit):  
https://b941eec1-db89-4cf1-a022-e6952eba9297-00-10ndrm9g81w7i.pike.replit.dev/

Screenshots (included in the repo under assets/screenshots — added as 1.png and 2.png):
- Home / Dashboard view
  ![Home Screen (1)](assets/screenshots/1.png)
- Quiz setup / selection view
  ![Setup Screen (2)](assets/screenshots/2.png)

---

## About SafeBite Quiz
SafeBite Quiz is an interactive quiz platform built for food‑safety training and assessments. It helps trainers author curated question banks, run adaptive quizzes for learners, and collect analytics so organizations can monitor competence and improvement over time.

Key goals:
- Fast creation of quizzes and reusable question banks
- Accurate scoring with manual review for short answers
- Insightful analytics and CSV exports for trainers/admins
- Extensible import/export and integration readiness for SSO/LMS

---

## Core Features
- Quiz authoring: multiple choice, true/false, short answer; tags, categories, difficulty
- Adaptive delivery: dynamic draws from question pools to reduce repetition
- Roles & permissions: Learner and Trainer/Admin workflows
- Scoring: automatic scoring + manual review flow for written answers
- Analytics & reporting: per-quiz and per-user metrics, CSV export
- Offline: download quizzes for offline practice (UI shows offline quizzes)
- Localization-ready: language tabs in the setup UI (example: English, Español, Français, हिन्दी)

---

## Tech Stack
- Frontend: React + TypeScript, Tailwind CSS
- Backend: Node.js + Express, TypeScript
- Database: PostgreSQL
- Auth: JWT (configurable to OAuth/SSO)
- DevOps & infra: Docker, GitHub Actions, Vercel / Replit for quick demos
- Optional: background worker for heavy report generation

---

## Architecture (high level)
- React SPA communicates with REST API endpoints for quizzes, attempts, users, and analytics.
- Backend validates and persists attempts, runs analytic queries, and exposes CSV/report endpoints.
- DB stores quizzes, questions, users, attempts, badges, and metrics.
- Optional worker handles scheduled exports and long-running analytics.

Common API endpoints (examples)
- GET /api/quizzes
- GET /api/quizzes/:id
- POST /api/quizzes
- POST /api/quizzes/:id/attempt
- GET /api/users/:id/results
- POST /api/auth/login
- POST /api/auth/register

---

## Quickstart (local development)
These commands assume a repo layout with `frontend/` and `backend/` directories. If your scripts differ, tell me the exact npm/Yarn commands and I will update.

1. Clone
   git clone https://github.com/prateekk-tech99/safebite_quiz.git

2. Frontend
   cd safebite_quiz/frontend
   npm install
   npm run dev       # or `npm start` depending on your setup

3. Backend
   cd ../backend
   npm install
   cp .env.example .env
   # Edit .env with DATABASE_URL and JWT_SECRET
   npm run dev       # or `npm start`

4. Database (Postgres example)
   createdb safebite
   npm run migrate   # run DB migrations (tool-specific)
   npm run seed      # seed sample data (if available)

5. Tests
   npm test          # run tests for each package as applicable

Suggested example ENV variables
- DATABASE_URL=postgres://user:pass@localhost:5432/safebite
- JWT_SECRET=your_jwt_secret
- PORT=4000
- FRONTEND_API_URL=http://localhost:4000

If you want, I can replace the generic commands with the exact scripts from your package.json files.

---

## Deployment Notes
- Frontend: build and host on Vercel / Netlify / Replit for quick demos
- Backend: containerize with Docker and deploy to Heroku / Railway / your cloud of choice
- Use GitHub Actions for CI to run tests and build artifacts; add secrets for production DB and JWT_SECRET in your host

---

## Contributor Guide
- Fork the repo, create a feature branch, and open a PR with a clear description.
- Follow existing code style and add tests for new features.
- Report issues with reproduction steps and environment details.

I can draft CONTRIBUTING.md, issue templates, and a pull request template if you want them.

---

## Roadmap
- Short-term: improve analytics UI, CSV export improvements, mobile responsiveness
- Mid-term: SSO/LMS integration (SCORM/LTI), enterprise-ready features (bulk imports)
- Long-term: multi-tenant SaaS offering and advanced reporting dashboards

---

## Contact
- Demo: https://b941eec1-db89-4cf1-a022-e6952eba9297-00-10ndrm9g81w7i.pike.replit.dev/
- Repo: https://github.com/prateekk-tech99/safebite_quiz
- LinkedIn: https://www.linkedin.com/in/prateek-kamble/
- Email: (add your email here if you'd like it displayed)

---

If you'd like I'll:
- Insert the exact npm scripts and migration commands from your repo,
- Add CI / build / coverage badges once CI is configured,
- Embed the actual screenshot files from this chat into the repo and update image paths,
- Produce a short hiring-focused README or a deeply technical maintainer README (pick one).
Which would you like me to do next?