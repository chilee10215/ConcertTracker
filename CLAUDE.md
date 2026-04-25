# Concert Tracker — Development Guidelines

This document describes the required Git workflow and development practices for the Concert Tracker web app.

---

## Git Workflow

### **Branching Strategy**

We use a **Git Flow** branching model:

- **`main`** — Production-ready code (stable, deployable)
- **`develop`** — Integration branch for features (pre-release testing)
- **Feature branches** — Individual feature work (branch from `develop`)

### **Branching Rules**

- **Never commit directly to main or develop** — all work must be in feature branches
- Feature branches must merge to `develop` first via pull request
- Once features are tested and validated on `develop`, merge to `main` via release PR
- All branches require code review before merging
- Main branch should always remain stable and deployable

### **Feature Branch Naming**

Use Conventional Commits format:
- `feat/<description>` — new feature
- `fix/<description>` — bug fix
- `refactor/<description>` — code refactoring
- `docs/<description>` — documentation
- `test/<description>` — tests or test improvements

Examples:
- `feat/wishlist-calendar-view`
- `fix/artist-search-debounce`
- `refactor/api-error-handling`

---

## Commit Rules

### **Commit Frequently**

Commit at meaningful steps, including:
- After completing each feature component
- When switching between frontend/backend
- Before testing changes
- After fixing bugs

### **Commit Message Format**

Use Conventional Commits:

```
feat: add concert filtering by platform
fix: prevent 401 redirect on login page
refactor: consolidate API error handling
docs: update README with setup instructions
test: add auth context unit tests
```

Keep messages concise (~50 chars max) and descriptive.

---

## Pull Request Workflow

### **Before Opening a PR**

1. Create feature branch from `develop`: `git checkout -b feat/your-feature develop`
2. Code and commit frequently with Conventional Commits
3. Push to remote: `git push -u origin feat/your-feature`

### **PR Target Branches**

- **Feature PRs** → target `develop` (for feature integration and testing)
- **Release PRs** → target `main` (from `develop` after validation)

### **PR Requirements**

Every PR must include:

- **Title**: Brief description (same as commit message)
- **Description**:
  - What changed and why
  - Files affected (frontend, backend, or both)
  - Any breaking changes
  - Testing notes (e.g., "Tested with 10 artists and 26 concerts from seed")

### **Merging**

- Squash commits if appropriate (use GitHub's squash option)
- Delete branch after merging
- Verify target branch is still stable after merge

---

## Code Review Process

### **Automated Review** (Optional)

For deeper review, paste PR diff in Claude Code Pro and ask:
> "Review this diff for architecture, security, performance, and best practices."

### **Manual Review Checklist**

Before merging, verify:
- [ ] Code builds successfully (`npm run build` + backend imports)
- [ ] No console errors or warnings
- [ ] Follows project conventions (TypeScript strict, auth guards, etc.)
- [ ] No unrelated changes included
- [ ] Commit messages are clear

---

## Tech Stack & Conventions

### **Frontend** (React + TypeScript + Tailwind + shadcn/ui)

- Use functional components with hooks
- Type everything with TypeScript
- Use `/api` prefix for backend calls (Vite proxy handles routing)
- Auth context for login state (`useAuth()`)
- Protected routes via `<ProtectedRoute>` wrapper

### **Backend** (FastAPI + SQLAlchemy + SQLite)

- Use dependency injection (`get_db`, `get_current_user`)
- Pydantic schemas for validation
- Router-based structure (auth, artists, concerts, wishlist)
- Meaningful HTTP status codes (400, 401, 404, 500)

### **Database**

- SQLite for MVP (migration path to PostgreSQL documented)
- Run `python -m app.seed` to populate test data

---

## Local Development

### **Setup**

```bash
# Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m app.seed  # Populate mock data

# Frontend
cd frontend
npm install
```

### **Running Locally**

**Terminal 1 — Backend:**
```bash
cd backend && source venv/bin/activate
uvicorn app.main:app --reload  # Runs on :8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev  # Runs on :5173
```

Access at: `http://localhost:5173`

### **Testing**

- Frontend: `npm run build` (verify TypeScript & Vite build)
- Backend: `python -m app.seed` (verify database + imports)
- Manual: Sign up, follow artist, add to wishlist, check calendar

---

## Skills Available in This Project

- **shadcn** — UI component help
- **vercel-react-best-practices** — React/Next.js optimization
- **prompt-master** — Prompt engineering

Use via `/shadcn`, `/vercel-react-best-practices`, etc. in prompts.

---

## Common Tasks

### **Add a New Concert Field**

1. Create branch: `git checkout -b feat/concert-ticket-price-display develop`
2. Update model: `backend/app/models/concert.py`
3. Update schema: `backend/app/schemas/concert.py`
4. Update router: `backend/app/routers/concerts.py`
5. Update frontend type: `frontend/src/types/index.ts`
6. Update component: `frontend/src/pages/ArtistConcertsPage.tsx`
7. Commit: `feat: add ticket price display to concert details`
8. PR to `develop` with before/after screenshots

### **Fix Auth Bug**

1. Create branch: `git checkout -b fix/jwt-expiry-issue develop`
2. Fix in `backend/app/services/auth_service.py` and `frontend/src/context/AuthContext.tsx`
3. Test locally: Sign up, wait, verify redirect to login
4. Commit: `fix: prevent expired JWT from hanging`
5. PR to `develop` with reproduction steps

---

## Release Process (Future)

When ready to release to production:

1. Create a release PR from `develop` → `main`
2. Title: `release: v1.0.0` (or appropriate version)
3. Include changelog of features/fixes since last release
4. Merge after approval
5. Tag the commit: `git tag -a v1.0.0 -m "Release v1.0.0"`
6. Push tags: `git push origin v1.0.0`

---

## Deployment Notes (Future)

When ready to deploy:
- Frontend: Vercel (auto-deploy from main)
- Backend: Heroku free tier or similar
- Database: Migrate to PostgreSQL (update `DATABASE_URL`)
- Secrets: Store `TICKETMASTER_API_KEY` and `SECRET_KEY` in env vars

---

## Questions or Issues?

- Check error logs: `npm run build` for frontend, backend imports for backend
- Review existing code in similar routes/components
- Use Claude Code Pro for architecture questions
