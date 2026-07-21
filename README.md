# Trapwise

**See the trap. Learn the pattern. Beat the test.**

Trapwise is a local-first SAT-style learning app. Instead of treating a wrong answer as a single event, it builds a **Mistake Twin**: a transparent profile of the distractor patterns a learner repeatedly selects. It then gives the learner a verified follow-up, a Trap Forge recognition activity, and a visible before-and-after pattern change.

Trapwise is an independent educational project. It is not affiliated with, sponsored by, or endorsed by the College Board. Every question in the included bank is original and is not copied from an official SAT, College Board material, or commercial preparation resource.

## The problem

Most practice products explain the correct answer after a miss. That can leave the underlying habit untouched: solving for the wrong value, choosing a plausible intermediate result, using the wrong operation, or over-reading evidence. Trapwise turns the learner's selected distractor into evidence, then teaches a concrete counter-strategy.

## Core experience

The complete guest flow works without an OpenAI or Supabase key:

1. Start an adaptive diagnostic.
2. Select an incorrect mapped distractor.
3. View the Mistake Twin reveal, including strengths, recurring pattern, confidence check, counter-strategy, and deterministic pattern strength.
4. Read verified local feedback about why that distractor was tempting.
5. Complete a verified local follow-up.
6. See the pattern weaken when the targeted reasoning is applied correctly.
7. Complete a Trap Forge recognition round.
8. View the updated impact and local progress timeline.

Trapwise mastery is an internal learning estimate, not an official SAT score.

## Implemented features

- Five fixed diagnostic questions followed by local adaptive selection, up to 15 questions total.
- Original, typed SAT-style Math, Reading and Writing, and visual-question records with four answer choices, verified explanations, strategies, distractor mappings, and approval status.
- A deterministic Mistake Twin profile that tracks dominant and secondary mistake categories, skills, difficulty, high-confidence misses, improvement trend, and corrected patterns.
- Deterministic 0–100 mastery and pattern-strength calculations; neither is calculated by AI.
- Verified local mistake feedback, targeted follow-up, Daily Practice, streaks, a progress timeline, and a clearly fictional leaderboard/demo-data mode.
- Trap Forge local evaluation and a before-and-after impact screen.
- Four accessible theme options, reduced-motion handling, keyboard-operable choices, semantic form controls, and visual-question captions/alt text.
- Optional Supabase authentication UI and a schema/migration with Row Level Security.

## Free Tier and optional AI

The Free Tier is intentionally complete: diagnostics, adaptation, local feedback, follow-ups, Daily Practice, Trap Forge, mastery, progress, achievements, visual questions, and the fictional demo board all work in browser storage with no API key.

AI Enhanced is optional and disabled by default. It becomes available only when `OPENAI_API_KEY`, `OPENAI_MODEL`, and `ENABLE_AI_FEATURES=true` are set on the server. The learner must explicitly press **Analyze deeper** before any AI request is made. The request has a 12-second timeout, validates a constrained JSON response, and immediately returns the verified local explanation if it fails or is malformed.

AI never changes a verified answer, calculates mastery, or adds generated questions to the approved question bank.

## Architecture

```text
src/
├── app/                  # App Router pages and API routes
├── components/           # Diagnostic, Mistake Twin, progress, auth, and theme UI
├── data/sampleQuestions  # Approved original question bank
├── lib/                  # Adaptive engine, local feedback, progress, storage, and API guards
└── types/                # Question, visual, mistake, and progress contracts
supabase/migrations/      # Optional cloud schema and RLS policies
```

The application uses Next.js 16, React 19, TypeScript, Tailwind CSS 4, browser `localStorage`, and the Supabase JavaScript client.

## Codex and GPT-5.6 usage


For an OpenAI Build Week submission, describe the specific GPT-5.6 work from the primary build session in your own words and include that session's `/feedback` ID. Do not claim a model, workflow, or capability that was not actually used.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Blank environment values are supported: the app remains in guest/local mode.

### Environment variables

```env
# Optional: required only for Supabase account features.
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY

# Optional: required only for explicit AI Enhanced feedback.
OPENAI_API_KEY=YOUR_SERVER_ONLY_OPENAI_KEY
OPENAI_MODEL=YOUR_AVAILABLE_MODEL_ID
ENABLE_AI_FEATURES=false

# Leave unset unless a new secure server-only operation needs it.
SUPABASE_SERVICE_ROLE_KEY=
```

Use the base Supabase project URL; do not include `/rest/v1`. Only the Supabase URL and publishable key are public browser variables. Never prefix OpenAI or service-role keys with `NEXT_PUBLIC_`. `.env.local` is ignored by Git; `.env.example` contains placeholders only.

## Optional Supabase setup

1. Create a Supabase project and enable Email/Password authentication.
2. Add `http://localhost:3000/login` and `http://localhost:3000/reset-password` to Supabase Auth redirect URLs for local development.
3. For deployment, add the equivalent production URLs and set the Supabase Site URL to your deployed origin.
4. Run the migration files in `supabase/migrations/` in filename order. The second migration intentionally disables browser writes to score-bearing tables until a server-verified RPC or Edge Function exists.

The migrations enable RLS for learner data and keep credentials in Supabase Auth rather than application tables. Cloud progress writes and public leaderboard ranking still require a server-verified RPC or Edge Function; browser clients can read their own records but cannot write score-bearing fields.

## Testing

```bash
npm run lint
npm run build
```

The focused browser suite below covers the guest flow, mobile overflow, and accessibility once its optional local dependencies are installed. Before recording or deploying, also manually test the guest flow above in an incognito window with every environment value blank, then test optional authentication and AI only in a configured project.

### Browser test suite

The repository includes focused Judge Demo, mobile-overflow, Daily fallback, keyboard, and axe accessibility tests under `tests/e2e/`. Browser packages are intentionally not committed as project dependencies so a minimal guest deployment stays lightweight.

```bash
npm install -D @playwright/test @axe-core/playwright
npx playwright install chromium
npm run test:e2e
```

The command starts a local Next.js server on port `3001`. To test a deployed environment instead, set `E2E_BASE_URL=https://your-deployment.example` before running the command. Playwright retains screenshots, video, and traces for failures in its test-results directory.

## Deployment to Vercel

1. Push the repository to your Git provider and import it into Vercel.
2. Deploy with no variables for the guest-only demo, or add the optional variables above in Vercel Project Settings.
3. If using Supabase authentication, configure the deployed origin, `/login`, and `/reset-password` in Supabase Auth URL Configuration.
4. Run `npm run lint` and `npm run build` before deploying.
5. Re-test the guest flow in a production incognito window. Never add secret values to the repository or client-side variables.

## Build Week submission checklist

- [ ] Select the **Education** category.
- [ ] Provide a working public demo or a simple guest flow; Trapwise needs no account for the core experience.
- [ ] Link a public repository with a license, or share a private repository with `testing@devpost.com` and `build-week-event@openai.com`.
- [ ] Add the final public video URL below.
- [ ] Record a public YouTube video under three minutes with spoken narration showing the core flow.
- [ ] Explain how Codex and GPT-5.6 were actually used.
- [ ] Enter the primary Codex `/feedback` Session ID in Devpost.
- [ ] Include screenshots, test instructions, the College Board disclaimer, and no secrets.

Public demo: https://trapwise.vercel.app<br>
Demo video: _add public YouTube URL_<br>
Codex `/feedback` Session ID: _add primary build-session ID_

## Judge Testing Instructions

### Fastest option

1. Open the public demo: https://trapwise.vercel.app
2. Click **Try Judge Demo**.
3. Complete the five-question guided diagnostic; on Question 1, choose **C** to demonstrate the deterministic **Solved Wrong Value** pattern.
4. View the Mistake Twin reveal.
5. Complete the verified targeted follow-up.
6. Try one Trap Forge interaction.
7. View the before-and-after impact and progress summary.

Estimated time: 3–5 minutes. No account, payment, API key, Supabase configuration, or local setup is required. **Reset Demo Data** removes the fictional profile and restores previously saved local progress when available.

## Known limitations

- The question bank is deliberately small and is not a complete SAT curriculum.
- The follow-up route currently demonstrates the verified `solved_wrong_value` pattern; it is not yet dynamically selected for every possible dominant pattern.
- Trap Forge currently teaches distractor-pattern recognition through a local, fixed scenario rather than collecting and grading a learner-authored distractor.
- The achievement catalog is not yet wired to verified unlock events and is hidden from primary navigation. XP and the leaderboard are local/demo presentation features; cloud-backed awards and rankings are not implemented.
- The optional AI route provides explanation only; it does not generate permanent questions or make mastery decisions.
- `/practice` and `/challenges` are early standalone pages and are intentionally absent from primary navigation.
