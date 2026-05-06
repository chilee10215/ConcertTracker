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

### **Commit Frequently (Test-First Workflow)**

Follow TDD (Test-Driven Development) pattern for **every feature**:

1. **Red** — Write failing test(s) first
2. **Green** — Write minimal code to pass test
3. **Refactor** — Clean up code while tests pass

Commits should reflect this flow:
- `test: add failing test for user login flow` (Red phase)
- `feat: implement JWT auth to pass login test` (Green phase)
- `refactor: extract auth logic to service` (Refactor phase)

This ensures code is designed for testability from the start.

### **Commit Message Format**

Use Conventional Commits:

```
test: add failing test for concert filtering
feat: implement concert platform filter
refactor: consolidate filter logic
fix: prevent 401 redirect on expired JWT
docs: add testing guidelines
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
  - Test coverage summary (e.g., "Added 15 tests, maintained 82% coverage")
- **Status Checks** (must pass before merge):
  - ✅ All unit tests pass (frontend + backend)
  - ✅ Minimum 80% code coverage (files touched)
  - ✅ TypeScript strict mode (frontend)
  - ✅ Build succeeds (`npm run build` + backend imports)

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
- [ ] Test coverage ≥ 80% for changed files
- [ ] Tests follow project conventions (naming, structure, mocks)

---

## Test-Driven Development (TDD)

### **Why TDD?**
- **Better design** — Writing tests first forces modular, testable code
- **Fewer bugs** — Edge cases are caught during development, not production
- **Confidence** — Comprehensive tests enable fearless refactoring
- **Documentation** — Tests serve as executable examples of how code should behave

### **TDD Workflow (Red → Green → Refactor)**

For every feature, follow this cycle:

**1. Red — Write Failing Test**
```bash
# Frontend example:
# File: frontend/src/pages/__tests__/ArtistConcertsPage.test.tsx
test('displays concert list when artist ID is provided', () => {
  render(<ArtistConcertsPage artistId="123" />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  // Test fails because component doesn't exist yet
});

# Backend example:
# File: backend/tests/test_concerts.py
def test_filter_concerts_by_platform():
    concerts = get_concerts(platform="Ticketmaster")
    assert all(c.platform == "Ticketmaster" for c in concerts)
    # Test fails because filter doesn't exist yet
```

**2. Green — Write Minimal Code to Pass**
```bash
# Implement just enough to make test pass
# frontend/src/pages/ArtistConcertsPage.tsx
export function ArtistConcertsPage({ artistId }: Props) {
  return <div>Loading...</div>;  // Minimal to pass test
}

# backend/app/routers/concerts.py
@router.get("/concerts")
def get_concerts(platform: str = None, db: Session = Depends(get_db)):
    query = db.query(Concert)
    if platform:
        query = query.filter(Concert.platform == platform)
    return query.all()
```

**3. Refactor — Improve Code (Tests Stay Green)**
```bash
# Refactor for clarity, performance, without breaking tests
# Extract logic, rename variables, consolidate duplicates
# Run tests frequently to ensure they still pass
```

**Commit at Each Phase:**
- Phase 1: `test: add failing test for concert filtering`
- Phase 2: `feat: implement concert platform filter`
- Phase 3: `refactor: extract filter logic to service`

### **Frontend Testing (Vitest + React Testing Library)**

**Setup is done.** Already configured with:
- `vitest` — Fast unit test runner (Vite-native)
- `@testing-library/react` — Render components, query DOM
- `jsdom` — Browser simulation

**File Structure:**
```
frontend/src/
├── pages/
│   ├── ArtistConcertsPage.tsx
│   └── __tests__/
│       └── ArtistConcertsPage.test.tsx
├── components/
│   ├── ArtistCard.tsx
│   └── __tests__/
│       └── ArtistCard.test.tsx
├── hooks/
│   ├── useAuth.ts
│   └── __tests__/
│       └── useAuth.test.ts
├── services/
│   ├── apiClient.ts
│   └── __tests__/
│       └── apiClient.test.ts
```

**Running Tests:**
```bash
cd frontend
npm run test          # Run once (CI mode)
npm run test:watch   # Watch mode (re-run on file change)
```

**Example Test (useAuth Hook):**
```typescript
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';
import * as api from '../services/api';

vi.mock('../services/api');

test('logs in user with email and password', async () => {
  const { result } = renderHook(() => useAuth());
  
  // Initially logged out
  expect(result.current.user).toBeNull();
  
  // Log in
  await act(async () => {
    await result.current.login('test@example.com', 'password');
  });
  
  // Now logged in
  expect(result.current.user).toBeDefined();
  expect(result.current.user.email).toBe('test@example.com');
});
```

**Example Test (Component):**
```typescript
test('renders artist card with concert info', () => {
  const artist = { id: '1', name: 'Taylor Swift', image: 'url' };
  const concert = { id: '1', date: '2025-05-15', venue: 'Madison Square Garden' };
  
  render(<ArtistCard artist={artist} concert={concert} />);
  
  expect(screen.getByText('Taylor Swift')).toBeInTheDocument();
  expect(screen.getByText('2025-05-15')).toBeInTheDocument();
  expect(screen.getByText('Madison Square Garden')).toBeInTheDocument();
});
```

**Mocking API Calls:**
```typescript
import { vi } from 'vitest';
import * as api from '../services/api';

vi.mock('../services/api');

test('fetches concerts on mount', async () => {
  const mockConcerts = [{ id: '1', title: 'Concert 1' }];
  vi.mocked(api.getConcerts).mockResolvedValue(mockConcerts);
  
  render(<ConcertList />);
  
  await waitFor(() => {
    expect(screen.getByText('Concert 1')).toBeInTheDocument();
  });
});
```

### **Backend Testing (pytest)**

**Setup:**
```bash
cd backend
pip install pytest pytest-cov  # Already in requirements if not, add it
```

**File Structure:**
```
backend/
├── app/
│   ├── main.py
│   ├── models/
│   │   ├── user.py
│   │   └── concert.py
│   ├── routers/
│   │   ├── auth.py
│   │   └── concerts.py
│   └── services/
│       └── concert_service.py
├── tests/
│   ├── conftest.py          # Shared fixtures
│   ├── test_auth.py         # Auth router tests
│   ├── test_concerts.py     # Concert router tests
│   ├── services/
│   │   └── test_concert_service.py
│   └── fixtures/
│       ├── users.py
│       └── concerts.py
└── pytest.ini               # Config
```

**Running Tests:**
```bash
cd backend
pytest                      # Run all tests
pytest -v                   # Verbose output
pytest --cov               # Show coverage
pytest tests/test_auth.py   # Run specific file
pytest -k "test_login"      # Run tests matching pattern
```

**Example Test (Router):**
```python
# backend/tests/test_auth.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_user_signup_success():
    response = client.post(
        "/api/auth/signup",
        json={"email": "test@example.com", "password": "securepass"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "token" in data

def test_user_signup_duplicate_email():
    # First signup succeeds
    client.post(
        "/api/auth/signup",
        json={"email": "test@example.com", "password": "securepass"}
    )
    
    # Second signup with same email fails
    response = client.post(
        "/api/auth/signup",
        json={"email": "test@example.com", "password": "different"}
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]
```

**Example Test (Service with Fixtures):**
```python
# backend/tests/conftest.py
import pytest
from app.database import SessionLocal
from app.models.user import User

@pytest.fixture
def db():
    database = SessionLocal()
    yield database
    database.close()

@pytest.fixture
def test_user(db):
    user = User(email="test@example.com", password_hash="hashed")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

# backend/tests/services/test_concert_service.py
from app.services.concert_service import get_concerts_for_artist

def test_get_concerts_for_artist(db, test_user):
    concerts = get_concerts_for_artist(artist_id=1, db=db)
    assert len(concerts) > 0
    assert all(c.artist_id == 1 for c in concerts)
```

**Mocking External APIs:**
```python
from unittest.mock import patch, MagicMock

def test_search_concerts_ticketmaster():
    mock_response = {
        "_embedded": {
            "events": [
                {"name": "Concert 1", "dates": {"start": {"localDate": "2025-05-15"}}}
            ]
        }
    }
    
    with patch('app.services.concert_service.requests.get') as mock_get:
        mock_get.return_value.json.return_value = mock_response
        concerts = search_concerts("Taylor Swift", source="ticketmaster")
        
        assert len(concerts) == 1
        assert concerts[0]["name"] == "Concert 1"
```

### **Coverage Requirements**

**Minimum 80% coverage** for changed files. Check coverage:

```bash
# Frontend
cd frontend
npm run test -- --coverage

# Backend
cd backend
pytest --cov=app --cov-report=term-missing

# View HTML report
pytest --cov=app --cov-report=html
# Open htmlcov/index.html
```

**Coverage targets by file type:**
- **Core logic** (services, auth, database) — 100% (no exceptions)
- **Components/Routes** — 80%+ (UI integration harder to test fully)
- **Utilities/Helpers** — 90%+

**Exclude from coverage:**
- `__pycache__`, `node_modules`
- Config files, migrations, seed data
- Main entry points (app initialization)

### **Pre-Commit Hook (Optional But Recommended)**

Run tests automatically before committing:

**Setup:**
```bash
cd /Users/jinlee/Desktop/claudeCodeDrill/ConcertTracingPorject/ConcertTracing
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
set -e

echo "🧪 Running frontend tests..."
cd frontend && npm run test || exit 1

echo "🧪 Running backend tests..."
cd ../backend && pytest || exit 1

echo "✅ All tests passed!"
EOF

chmod +x .git/hooks/pre-commit
```

Now tests run before every commit. Bypass with `git commit --no-verify` (only for WIP).

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

**Automated (Required Before PR):**
```bash
# Frontend unit tests
cd frontend
npm run test              # Run all tests once
npm run test:watch       # Watch mode (re-run on change)

# Backend unit tests
cd backend
pytest                   # Run all tests
pytest --cov            # With coverage report

# Build & type check
cd frontend && npm run build    # Verifies TypeScript & Vite
cd ../backend && python -c "import app; print('✓ Backend imports OK')"
```

**Manual (Test Features End-to-End):**
- Sign up with email/password
- Follow artist and add to wishlist
- Check calendar view shows wishlist concerts
- Verify status indicators (ticket open, lottery, etc.)
- Test logout and re-login

---

## Skills Available in This Project

- **shadcn** — UI component help
- **vercel-react-best-practices** — React/Next.js optimization
- **prompt-master** — Prompt engineering

Use via `/shadcn`, `/vercel-react-best-practices`, etc. in prompts.

---

## Common Tasks (TDD Examples)

### **Add a New Concert Field (Ticket Price)**

**Step 1: Red — Write Failing Tests**
```bash
git checkout -b feat/concert-ticket-price-display develop

# Backend test: backend/tests/test_concerts.py
test("concert includes ticket price in response"):
    response = client.get("/api/concerts/123")
    assert "ticket_price" in response.json()
    assert response.json()["ticket_price"] == {"min": 50, "max": 150}

# Frontend test: frontend/src/components/__tests__/ConcertCard.test.tsx
test("displays price range on concert card", () => {
    const concert = { ..., ticketPrice: { min: 50, max: 150 } };
    render(<ConcertCard concert={concert} />);
    expect(screen.getByText(/\$50 - \$150/)).toBeInTheDocument();
});

# Run tests (they fail — expected)
cd backend && pytest tests/test_concerts.py
cd frontend && npm run test
```

**Step 2: Green — Write Minimal Code**
```bash
# Backend: backend/app/models/concert.py
class Concert(Base):
    __tablename__ = "concerts"
    # ... existing fields ...
    ticket_price_min: int = Column(Integer)
    ticket_price_max: int = Column(Integer)

# Backend: backend/app/schemas/concert.py
class ConcertResponse(BaseModel):
    # ... existing fields ...
    ticket_price: dict  # {"min": int, "max": int}

# Backend: backend/app/routers/concerts.py
@router.get("/concerts/{concert_id}")
def get_concert(concert_id: int, db: Session = Depends(get_db)):
    concert = db.query(Concert).filter(Concert.id == concert_id).first()
    return {
        **concert.__dict__,
        "ticket_price": {"min": concert.ticket_price_min, "max": concert.ticket_price_max}
    }

# Frontend: frontend/src/components/ConcertCard.tsx
export function ConcertCard({ concert }: Props) {
    return (
        <div>
            <p>{concert.title}</p>
            <p>${concert.ticketPrice.min} - ${concert.ticketPrice.max}</p>
        </div>
    );
}

# Run tests (they pass)
cd backend && pytest tests/test_concerts.py
cd frontend && npm run test
```

**Step 3: Refactor — Improve Code**
```bash
# Extract price formatting to helper
frontend/src/utils/formatPrice.ts:
export const formatPrice = (min: number, max: number) => `$${min} - $${max}`;

# Update component to use helper
<p>{formatPrice(concert.ticketPrice.min, concert.ticketPrice.max)}</p>

# Run tests to ensure still passing
npm run test
```

**Step 4: Commit & PR**
```bash
git add backend/app/models/concert.py backend/app/schemas/concert.py ...
git commit -m "test: add failing test for concert ticket price"

git add backend/app/routers/concerts.py
git commit -m "feat: include ticket price in concert response"

git add frontend/src/components/ConcertCard.tsx
git commit -m "feat: display ticket price on concert card"

git add frontend/src/utils/formatPrice.ts
git commit -m "refactor: extract price formatting helper"

git push -u origin feat/concert-ticket-price-display
# Create PR to develop with test coverage report
```

### **Fix Auth Bug (JWT Expiry)**

**Step 1: Red — Write Failing Test**
```bash
git checkout -b fix/jwt-expiry-issue develop

# Backend test: backend/tests/test_auth.py
def test_expired_jwt_returns_401():
    # Create token that expired 1 hour ago
    expired_token = create_token(user_id=1, expires_in=-3600)
    
    response = client.get(
        "/api/user",
        headers={"Authorization": f"Bearer {expired_token}"}
    )
    assert response.status_code == 401
    assert "token expired" in response.json()["detail"].lower()

# Run test (fails — expected)
pytest tests/test_auth.py::test_expired_jwt_returns_401
```

**Step 2: Green — Fix the Code**
```bash
# backend/app/services/auth_service.py
def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        if "exp" in payload and payload["exp"] < time.time():
            raise HTTPException(status_code=401, detail="Token expired")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")

# Run test (passes)
pytest tests/test_auth.py::test_expired_jwt_returns_401
```

**Step 3: Refactor & Test End-to-End**
```bash
# Refactor token verification to reusable service
# Update frontend to handle 401 → redirect to login

# Manual test
npm run dev  # Start app
# Sign up, wait for token to conceptually expire (or mock it)
# Verify redirected to login page
```

**Step 4: Commit & PR**
```bash
git commit -m "test: add failing test for expired JWT handling"
git commit -m "fix: prevent expired JWT from hanging"
git commit -m "refactor: consolidate token verification logic"
git push -u origin fix/jwt-expiry-issue
# Create PR with reproduction steps and test coverage
```

---

## GitHub Actions — Automated Test Checks

PR cannot merge to `develop` unless these checks pass:

**Setup Required (One-time):**

Create `.github/workflows/test.yml`:
```yaml
name: Tests & Coverage

on:
  pull_request:
    branches: [develop, main]
  push:
    branches: [develop, main]

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd frontend && npm ci
      
      - name: Run tests
        run: cd frontend && npm run test
      
      - name: Check coverage (80% minimum)
        run: cd frontend && npm run test -- --coverage --coverage.lines.lines 80

  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: cd backend && pip install -r requirements.txt
      
      - name: Run tests
        run: cd backend && pytest
      
      - name: Check coverage (80% minimum)
        run: cd backend && pytest --cov=app --cov-fail-under=80

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Build frontend
        run: cd frontend && npm ci && npm run build
      
      - name: Check backend imports
        run: cd backend && python -c "import app.main; print('✓ Backend OK')"
```

**How It Works:**
1. Push to feature branch → Tests run automatically
2. Open PR → Tests must pass before merge button appears
3. All checks pass → Green ✅ (can merge)
4. Any check fails → Red ❌ (must fix and push again)

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

## TDD Best Practices & Quick Reference

### **When to Write Tests**
- ✅ All new features (write test first)
- ✅ Bug fixes (write test to reproduce, then fix)
- ✅ Complex logic (services, utilities, auth)
- ⚠️  UI that's hard to test (but try — use React Testing Library)
- ❌ Trivial getters/setters (skip)
- ❌ Configuration/setup files (skip)

### **Test Naming Convention**
```typescript
// Good: Describes behavior, not implementation
test('displays artist name when artist data loads')
test('prevents login with invalid email format')

// Bad: Describes implementation, vague
test('renders data')
test('works correctly')
```

### **Keep Tests Focused**
```typescript
// ✅ Good: One assertion (or one logical group)
test('sends correct request when user logs in', async () => {
  await userEvent.type(emailInput, 'test@example.com');
  await userEvent.type(passwordInput, 'password');
  await userEvent.click(loginButton);
  
  expect(mockLoginAPI).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password'
  });
});

// ❌ Bad: Too many things being tested
test('login works and shows error and handles API failure', ...)
```

### **Mock External Dependencies**
```typescript
// ✅ Good: Mock API calls, external services
vi.mock('../services/api');
vi.mocked(api.loginUser).mockResolvedValue({ token: 'abc123' });

// ❌ Bad: Making real API calls in tests (slow, unreliable)
// Don't do: fetch('http://localhost:8000/api/auth/login')
```

### **Don't Over-Test**
```typescript
// ❌ Bad: Testing React internals (implementation detail)
test('calls useState setter', () => {
  // Don't test state directly
});

// ✅ Good: Test behavior/output
test('shows success message when form submits', () => {
  expect(screen.getByText('Success!')).toBeInTheDocument();
});
```

### **Test the Happy Path + Edge Cases**
```typescript
// ✅ Good coverage:
test('logs in successfully with valid credentials')
test('shows error for empty email')
test('shows error for wrong password')
test('handles network timeout gracefully')
```

### **Debugging Tests**
```bash
# Frontend: Watch mode (re-run on file change)
cd frontend && npm run test:watch

# Add debugging to test
test('something', () => {
  screen.debug();  // Prints DOM
  console.log(mockAPI.mock.calls);  // Prints mock calls
});

# Backend: Run single test with output
cd backend && pytest tests/test_auth.py::test_login_success -v -s
```

---

## Questions or Issues?

- **Tests not running?** — Check test file is named `*.test.ts` or `*.spec.ts` (frontend) or `test_*.py` (backend)
- **Coverage too low?** — Add tests for uncovered branches (if statements, error cases)
- **Tests flaking?** — Add waits for async operations (`waitFor`, `await`)
- **Can't test something?** — May indicate code isn't modular enough. Consider refactoring to extract testable logic
- **Architecture questions?** — Use Claude Code Pro for design advice
