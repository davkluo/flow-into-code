import fs from "fs";
import path from "path";
import { test as base, Page } from "@playwright/test";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { SectionKey } from "../../src/types/practice";
import type { Problem, ProblemSolution } from "../../src/types/problem";
import type { Session } from "../../src/types/session";
import type { AuthState } from "./global-setup";

/**
 * Seeds Firebase auth state into the browser's IndexedDB before the page
 * initializes. Firebase reads from this DB on startup, so injecting here
 * makes it find an authenticated user without going through OAuth.
 *
 * This runs via page.addInitScript(), which executes before any page scripts.
 */
async function seedFirebaseAuth(page: Page, auth: AuthState) {
  await page.addInitScript(
    ({ auth }) => {
      const key = `firebase:authUser:${auth.apiKey}:[DEFAULT]`;
      const value = {
        uid: auth.uid,
        email: auth.email,
        displayName: auth.displayName,
        photoURL: null,
        emailVerified: true,
        isAnonymous: false,
        providerData: [
          {
            uid: auth.email,
            displayName: auth.displayName,
            email: auth.email,
            phoneNumber: null,
            photoURL: null,
            providerId: "password",
          },
        ],
        stsTokenManager: {
          accessToken: auth.idToken,
          refreshToken: auth.refreshToken,
          expirationTime: Date.now() + 3_600_000,
        },
        createdAt: String(Date.now()),
        lastLoginAt: String(Date.now()),
        apiKey: auth.apiKey,
        appName: "[DEFAULT]",
      };

      const openReq = indexedDB.open("firebaseLocalStorageDb");

      openReq.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("firebaseLocalStorage")) {
          db.createObjectStore("firebaseLocalStorage", {
            keyPath: "fbase_key",
          });
        }
      };

      openReq.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const tx = db.transaction("firebaseLocalStorage", "readwrite");
        tx.objectStore("firebaseLocalStorage").put({ fbase_key: key, value });
      };
    },
    { auth },
  );
}

type SessionWithStringDate = Omit<Session, "createdAt"> & { createdAt: string };

type SessionHistoryResponse = {
  sessions: Array<{
    id: string;
    problemTitleSlug: string;
    problemId: string | null;
    createdAt: string;
    feedback: {
      sections: Record<SectionKey, { score: number | null }>;
      interviewerCommunication: { score: number | null };
      summary: string;
    };
  }>;
};

export type MockSessionDoc = {
  session: SessionWithStringDate & { id: string };
  problem: Problem | null;
  solutions: ProblemSolution[];
};

const SECTION_KEYS: SectionKey[] = [
  "problem_understanding",
  "approach_and_reasoning",
  "algorithm_design",
  "implementation",
  "complexity_analysis",
];

function loadAuthState(): AuthState {
  const authPath = path.join(process.cwd(), "playwright", ".auth", "user.json");
  return JSON.parse(fs.readFileSync(authPath, "utf8")) as AuthState;
}

function getE2EAdminDb() {
  const app =
    getApps().find((candidate) => candidate.name === "e2e-tests") ??
    initializeApp(
      {
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      },
      "e2e-tests",
    );
  return getFirestore(app);
}

async function seedTwoSumProblemData() {
  const db = getE2EAdminDb();
  const now = Date.now();

  await db.collection("meta").doc("problemIndex").set(
    {
      fullyPopulated: true,
      lastFetchedAt: now,
      totalProblems: 1,
    },
    { merge: true },
  );

  await db.collection("problems").doc("two-sum").set(
    {
      id: "1",
      idNumber: 1,
      title: "Two Sum",
      titleSlug: "two-sum",
      difficulty: "Easy",
      isPaidOnly: false,
      topicTags: [
        { id: "array", name: "Array", slug: "array" },
        { id: "hash-table", name: "Hash Table", slug: "hash-table" },
      ],
      searchTerms: ["1", "two", "sum", "two-sum", "easy", "array", "hash"],
    },
    { merge: true },
  );

  await db.collection("problemDetails").doc("two-sum").set(
    {
      titleSlug: "two-sum",
      source: {
        originalContent:
          "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        codeSnippets: {
          python3:
            "def twoSum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        need = target - n\n        if need in seen:\n            return [seen[need], i]\n        seen[n] = i",
        },
        examples: [
          {
            input: "nums = [2,7,11,15], target = 9",
            output: "[0,1]",
            explanation: "nums[0] + nums[1] == 9",
          },
        ],
      },
      derived: {
        framing: {
          canonical:
            "Find two distinct indices whose values sum to target and return them.",
          backend:
            "Treat the input as request payload and return index pairs deterministically.",
          systems:
            "Optimize for linear scan and predictable memory for large arrays.",
        },
        testCases: [
          {
            input: "nums = [2,7,11,15], target = 9",
            expectedOutput: "[0,1]",
            description: "basic positive integers",
          },
        ],
        edgeCases: [
          {
            input: "nums = [3,3], target = 6",
            expectedOutput: "[0,1]",
            description: "duplicate values",
          },
        ],
        hints: [
          { level: 1, text: "Try tracking seen values as you iterate." },
          { level: 2, text: "For each number, check if target - number was seen." },
        ],
        pitfalls: [
          { level: 1, text: "Do not reuse the same element twice." },
          { level: 2, text: "Insert current value after complement check." },
        ],
      },
      processingMeta: {
        schemaVersion: 1,
        layers: {
          framing: {
            status: "complete",
            updatedAt: now,
            model: "e2e-seed",
            promptVersion: 9999,
          },
          testCases: {
            status: "complete",
            updatedAt: now,
            model: "e2e-seed",
            promptVersion: 9999,
          },
          edgeCases: {
            status: "complete",
            updatedAt: now,
            model: "e2e-seed",
            promptVersion: 9999,
          },
          hints: {
            status: "complete",
            updatedAt: now,
            model: "e2e-seed",
            promptVersion: 9999,
          },
          pitfalls: {
            status: "complete",
            updatedAt: now,
            model: "e2e-seed",
            promptVersion: 9999,
          },
        },
      },
    },
    { merge: true },
  );
}

function buildDefaultMockSessionDocs(uid: string): MockSessionDoc[] {
  return [
    {
      session: {
        id: "mock-session-two-sum",
        userId: uid,
        createdAt: "2026-02-28T17:42:00.000Z",
        problemTitleSlug: "two-sum",
        chatLog: [
          {
            role: "user",
            content: "Can I use a hash map?",
            section: "approach_and_reasoning",
            timestamp: 1_772_000_000_000,
          },
          {
            role: "assistant",
            content: "Yes, explain the time-space tradeoff clearly.",
            section: "approach_and_reasoning",
            timestamp: 1_772_000_000_500,
          },
        ],
        feedback: {
          sections: {
            problem_understanding: {
              score: 4,
              comments: "Clear understanding with key constraints noted.",
              compliments: "Good edge-case awareness.",
              advice: "Call out assumptions more explicitly.",
            },
            approach_and_reasoning: {
              score: 4,
              comments: "Reasoning is coherent and mostly complete.",
              compliments: "Good optimization path from brute force.",
              advice: "Compare alternatives more directly.",
            },
            algorithm_design: {
              score: 3,
              comments: "Algorithm is understandable with minor gaps.",
              compliments: "Logical step ordering.",
              advice: "Be more explicit with map update timing.",
            },
            implementation: {
              score: 4,
              comments: "Implementation is correct and readable.",
              compliments: "Clean variable naming.",
              advice: "Add a quick guard clause explanation.",
            },
            complexity_analysis: {
              score: 3,
              comments: "Complexity mostly correct.",
              compliments: "Correct time bound identified.",
              advice: "Clarify auxiliary space from map usage.",
            },
          },
          interviewerCommunication: {
            score: 4,
            comments: "Engaged and concise communication.",
            compliments: "Asked focused clarifying questions.",
            advice: "Occasionally elaborate tradeoffs a bit more.",
          },
          summary:
            "Strong overall interview performance with solid structure and communication.",
        },
        fields: {
          problem_understanding: {
            restatement: "Find two indices whose values sum to target.",
            inputsOutputs:
              "Input int[] nums, int target; output int[] of indices.",
            constraints: "Exactly one answer exists; cannot reuse element.",
            edgeCases: "Negative numbers and duplicates.",
          },
          approach_and_reasoning: {
            approach: "Single-pass hash map from value to index.",
            reasoning: "Complement lookup gives O(1) average retrieval.",
          },
          algorithm_design: {
            pseudocode:
              "for i in nums:\n  need = target - nums[i]\n  if need in map return [map[need], i]\n  map[nums[i]] = i",
          },
          implementation: {
            language: "python3",
            code: "def twoSum(nums, target):\n  seen = {}\n  for i, n in enumerate(nums):\n    need = target - n\n    if need in seen:\n      return [seen[need], i]\n    seen[n] = i",
            output: "[0, 1]",
          },
          complexity_analysis: {
            timeComplexity: "O(n)",
            spaceComplexity: "O(n)",
          },
        },
      },
      problem: {
        id: "1",
        title: "Two Sum",
        titleSlug: "two-sum",
        difficulty: "Easy",
        isPaidOnly: false,
        topicTags: [
          { id: "array", name: "Array", slug: "array" },
          { id: "hash-table", name: "Hash Table", slug: "hash-table" },
        ],
      },
      solutions: [
        {
          approach: "Hash map",
          explanation:
            "Store visited values and look up each needed complement in O(1) average time.",
          algorithm:
            "Iterate once, check complement in map, then insert current value with index.",
          tradeoffs: "Uses extra memory to reduce time complexity.",
          timeComplexity: "O(n)",
          spaceComplexity: "O(n)",
        },
      ],
    },
  ];
}

function toHistoryResponse(docs: MockSessionDoc[]): SessionHistoryResponse {
  const sessions = [...docs]
    .sort((a, b) => {
      return (
        new Date(b.session.createdAt).getTime() -
        new Date(a.session.createdAt).getTime()
      );
    })
    .map((doc) => {
      const sectionScores = Object.fromEntries(
        SECTION_KEYS.map((key) => [
          key,
          { score: doc.session.feedback.sections[key].score },
        ]),
      ) as Record<SectionKey, { score: number | null }>;

      return {
        id: doc.session.id,
        problemTitleSlug: doc.session.problemTitleSlug,
        problemId: doc.problem?.id ?? null,
        createdAt: doc.session.createdAt,
        feedback: {
          sections: sectionScores,
          interviewerCommunication: {
            score: doc.session.feedback.interviewerCommunication.score,
          },
          summary: doc.session.feedback.summary ?? "",
        },
      };
    });

  return { sessions };
}

type Fixtures = {
  authState: AuthState;
  signedInPage: Page;
  mockSessionDocs: (docs?: MockSessionDoc[]) => MockSessionDoc[];
  seedTwoSumProblem: () => Promise<void>;
};

export const test = base.extend<Fixtures>({
  authState: async ({}, provide) => {
    await provide(loadAuthState());
  },
  signedInPage: async ({ page, authState }, provide) => {
    const auth: AuthState = authState;
    await seedFirebaseAuth(page, auth);
    await provide(page);
  },
  mockSessionDocs: async ({ signedInPage, authState }, provide) => {
    let docs = buildDefaultMockSessionDocs(authState.uid);

    await signedInPage.route("**/api/sessions", async (route) => {
      if (route.request().method() !== "GET") {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(toHistoryResponse(docs)),
      });
    });

    await signedInPage.route("**/api/sessions/*", async (route) => {
      if (route.request().method() !== "GET") {
        await route.continue();
        return;
      }

      const pathname = new URL(route.request().url()).pathname;
      const match = pathname.match(/^\/api\/sessions\/([^/]+)$/);
      if (!match) {
        await route.continue();
        return;
      }

      const sessionId = decodeURIComponent(match[1]);
      const found = docs.find((doc) => doc.session.id === sessionId);

      if (!found) {
        await route.fulfill({
          status: 404,
          contentType: "application/json",
          body: JSON.stringify({ error: "Not Found" }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          session: found.session,
          problem: found.problem,
          solutions: found.solutions,
        }),
      });
    });

    await provide((nextDocs?: MockSessionDoc[]) => {
      docs = nextDocs ?? buildDefaultMockSessionDocs(authState.uid);
      return docs;
    });
  },
  seedTwoSumProblem: async ({}, provide) => {
    await provide(async () => {
      await seedTwoSumProblemData();
    });
  },
});
