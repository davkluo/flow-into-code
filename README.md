# Flow Into Code

**Practice technical interviews like the real thing.**

Flow Into Code is an AI-powered technical interview preparation platform that guides engineers through a consistent, communication-first problem-solving process. The primary intent is to conduct coding practice the way a real interview actually works. Instead of jumping straight into code, each session walks you through clarifying requirements, identifying edge cases, designing an algorithm, implementing it, and analyzing complexity.

Free, open source, and built by a fellow engineer trying to navigate the world of technical interviews.

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

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Firebase client

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

### 4. Configure environment variables

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

> These variables are server-only secrets and must never be committed or exposed publicly.

### 4. Build and start all services

Both the app server and the code executor run as Docker containers. From the project root:

```bash
docker compose up --build
```

This builds and starts:

- **web** — the Next.js app server on [http://localhost:3000](http://localhost:3000)
- **executor** — the Python code execution service (internal only, accessed via Docker DNS)

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
