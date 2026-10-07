# Contributing to BrewPoints

## Branching Model

- `main` — production-ready code only
- `develop` — integration branch for features
- `feature/<name>` — individual feature branches (e.g., `feature/reward-catalog`)
- `fix/<name>` — bug fix branches (e.g., `fix/points-rounding`)

Branch from `develop`. Open a PR to `develop`. Merge to `main` for releases.

## Commit Convention (Conventional Commits)

All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) spec:

```
<type>(<scope>): <short description>

[optional body]
```

### Types

| Type | Use for |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `chore` | Dependency updates, tooling |
| `test` | Adding or updating tests |
| `docs` | Documentation only |
| `refactor` | Code change that is neither a fix nor feature |
| `perf` | Performance improvements |

**Examples:**
```
feat(api): add reward soft-delete endpoint
fix(points): correct rounding for fractional amounts
test(redemption): add anti-replay integration test
docs(readme): update placeholder auth section
```

## Code Style

- **PHP**: Follow PSR-12. Use `./vendor/bin/pint` to auto-format.
- **JavaScript/TypeScript**: Prettier with default settings.
- **Naming**: snake_case for PHP, camelCase for JS/TS.

## Laravel Guidelines

- All new database queries must go through Eloquent models or the Query Builder — no raw SQL.
- Business logic lives in `app/Services/`, never in controllers.
- Controllers stay thin: validate (Form Request) → call service → return JSON.
- Always wrap multi-step DB operations in `DB::transaction()`.

## Testing

- Run `php artisan test` before pushing.
- New endpoints must have at least one feature test covering the happy path.
- Use `RefreshDatabase` for database isolation between tests.
