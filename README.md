# Flow Into Code

**Practice technical interviews like the real thing.**

Flow Into Code is an AI-powered technical interview preparation platform that guides engineers through a consistent, communication-first problem-solving process. The primary intent is to conduct coding practice the way a real interview actually works. Instead of jumping straight into code, each session walks you through clarifying requirements, identifying edge cases, designing an algorithm, implementing it, and analyzing complexity.

Free, open source, and built by a fellow engineer trying to navigate the world of technical interviews.

---

## Live App

- Production: [https://flowintocode.com](https://flowintocode.com)

---

## Features

- **Structured 5-section practice sessions** — Understanding → Approach & Reasoning → Algorithm Design → Implementation → Complexity Analysis
- **AI interviewer chat** — Real-time streaming responses from a context-aware AI that simulates a real technical interviewer
- **Code execution** — Run Python solutions directly in the browser; write your own test cases to verify behavior
- **Session feedback** — AI-generated per-section scores and explanations after each session
- **Session history** — Browse and review your past sessions and feedback
- **Problem framings** — Classic LeetCode problems presented from General, Backend, and Systems perspectives to connect theory to real engineering work
- **Daily session limits** — 5 sessions per user per day

---

## Tech Stack

| Layer          | Technology                                            |
| -------------- | ----------------------------------------------------- |
| Framework      | [Next.js](https://nextjs.org) (App Router, Turbopack) |
| UI             | React, TypeScript, Tailwind CSS, shadcn/ui            |
| Auth & DB      | Firebase Authentication, Firestore                    |
| LLM            | OpenAI API (`gpt-4o-mini`)                            |
| Rate Limiting  | Upstash Redis                                         |
| Code Execution | Docker-based Python executor (FastAPI + uvicorn)      |

---

## Getting Started

### Prerequisites

- **Docker** with Compose support
- A **Firebase** project with Firestore and Authentication enabled
- An **OpenAI** API key
- An **Upstash Redis** database ([upstash.com](https://upstash.com))

### 1. Clone the repository

```bash
git clone https://github.com/davkluo/flow-into-code.git
cd flow-into-code
```

### 2. Configure Firebase client

The Firebase client SDK config is baked into the browser bundle at build time and is safe to commit — Firebase security is enforced through Security Rules and Authentication, not by keeping this config secret.

In `src/lib/firebase/client.ts`, replace the `firebaseConfig` values with your own. You can find them in the Firebase console under **Project Settings → Your apps → SDK setup and configuration**:

```ts
const firebaseConfig = {
  apiKey: "...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "...",
  appId: "...",
  measurementId: "...",
};
```

### Firebase Security Patterns

This project assumes Firebase client config is public and secures access using layered controls:

- **Firestore rules**: versioned in [firestore.rules](./firestore.rules). Client reads are limited to `get` on `/users/{uid}` for the authenticated owner. Client writes are denied.
- **Server-only Firestore writes**: all mutations run through Next.js API routes + Firebase Admin SDK.
- **API key restrictions (GCP)**:
  - Application restriction: `HTTP referrers`
  - API allowlist: `Identity Toolkit API`, `Cloud Firestore API`, `Firebase Installations API`
- **Firebase Auth restrictions**:
  - Only Google/GitHub providers enabled
  - Authorized domains restricted to active app domains
  - Sign-up quota per IP enabled in Firebase Auth settings

For local development before production cutover, `localhost` can be temporarily included in both API key referrers and Firebase Auth authorized domains. After deployment, remove `localhost` and rotate the web API key.

### 3. Configure environment variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env.local
```

| Variable              | Description                                                                           |
| --------------------- | ------------------------------------------------------------------------------------- |
| `FIREBASE_PROJECT_ID` | Firebase project ID (server-only)                                                     |
| `FIREBASE_CLIENT_EMAIL` | Firebase Admin SDK service account email                                            |
| `FIREBASE_PRIVATE_KEY` | Firebase Admin SDK private key — must be a single line with literal `\n` for newlines |
| `OPENAI_API_KEY`      | OpenAI API key for the AI interviewer and feedback generation                         |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint                                                        |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST auth token                                                    |
| `EXECUTOR_URL`        | URL for the code execution service — leave unset to use the default Docker DNS value  |
| `FIREBASE_BROWSER_API_KEY` | Firebase web API key used by Playwright E2E auth bootstrap                         |

> Most variables above are server-only secrets and must never be committed or exposed publicly. `FIREBASE_BROWSER_API_KEY` is a web key used for E2E bootstrap.

### 4. Build and start all services

Both the app server and the code executor run as Docker containers. From the project root:

```bash
docker compose up --build
```

This builds and starts:

- **web** — the Next.js app server on [http://localhost:3000](http://localhost:3000)
- **executor** — the Python code execution service (internal only, accessed via Docker DNS)

This is the recommended local development path because Docker keeps the runtime
consistent and avoids host-level dependency/version issues.

### 5. Open the app

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
src/
├── app/                    # Next.js App Router — pages and API routes
│   ├── about/              # About / mission page
│   ├── feedback/           # Post-session feedback report
│   ├── history/            # Session history
│   ├── practice/           # Main practice session
│   ├── signin/             # Sign-in page
│   └── api/                # API routes (chat, execute, sessions, problems, users)
│
├── components/
│   ├── pages/              # Full-page feature components (ChatBox, CodeEditor, Timer, etc.)
│   ├── layout/             # Global layout components (Navbar)
│   ├── shared/             # Reusable components
│   └── ui/                 # shadcn/Radix UI primitives
│
├── lib/
│   └── firebase/           # Firebase client, admin, and auth helpers
│
├── services/
│   ├── llm/                # OpenAI structured output + streaming, Zod schemas
│   ├── sessionHistory.ts   # Session history transformation + response shaping
│   └── leetcode/           # LeetCode problem syncing utilities
│
├── repositories/
│   └── firestore/          # Firestore query and mutation helpers
│
├── context/                # React Context providers
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript interfaces and enums
└── constants/              # App-wide constants (API paths, section config, etc.)

executor/                   # Standalone Docker code execution service (Python/FastAPI)
```

---

## Contributing

Contributions are welcome. If you find a bug or have a feature idea, feel free to open an issue or submit a pull request.

If you'd like to self-host or fork this project to remove the daily session limits or add your own changes, you have my blessing!

---

## Testing

If you run tests outside Docker, install Node dependencies first:

```bash
npm install
```

Run TypeScript tests (Vitest):

```bash
npm run test:js
```

Run FastAPI executor tests (pytest):

```bash
python3 -m pip install -r executor/requirements-dev.txt
npm run test:py
```

Run Playwright E2E tests:

```bash
npm run test:e2e
```

Run unit + integration + executor suites:

```bash
npm test
```

Recent additions include service-level tests for `sessionHistory` and a Playwright
E2E suite that runs in CI.

## CI/CD

The repository uses a single GitHub Actions pipeline:
- `.github/workflows/deploy.yml` (named **CI/CD**)

Behavior:
- On PR to `main`: run `check` (lint, typecheck, test, build) and `e2e`
- On push to `main`: run `check` and `e2e`, then build/push images to ECR, then
  deploy on EC2 via SSH + Docker Compose pull/up

Production deploys use:
- `docker-compose.prod.yml` (image-based, pulls from ECR)

Local dev uses:
- `docker-compose.yml` (build-based for local iteration)

## API Note

- Session history is served by `GET /api/sessions` using
  `src/services/sessionHistory.ts`.
- The sessions-remaining indicator is client-side via Firestore snapshot
  subscription (`useSessionsRemaining`) and does not require a separate
  `/api/sessions/remaining` endpoint.
