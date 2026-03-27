# SKILL.md — Scalable SaaS Engineering Practices

## Purpose
This skill guides implementation for a production-grade SaaS application built with Next.js, TypeScript, Supabase, AI APIs, and modern deployment tooling.

## 1) Code Quality Standards
- Prefer small, explicit modules over large, multi-purpose files.
- Use strict TypeScript types end-to-end.
- Keep business logic out of UI components when possible.
- Avoid speculative abstraction; extract only when reuse or clarity is proven.
- Name things by domain meaning, not implementation detail.

## 2) Modularity and Abstraction
- Separate orchestration, domain logic, persistence, and presentation.
- Use pure functions for transformations whenever possible.
- Keep AI prompt construction isolated from route handlers.
- Treat shared types as contract files and update them intentionally.
- Prefer composition over inheritance.

## 3) API Design Principles
- Design APIs around product operations, not database tables.
- Make request and response shapes stable and explicit.
- Validate input at the boundary.
- Return actionable error messages and predictable status codes.
- Use idempotency where duplicate submissions are plausible.

## 4) Error Handling
- Fail fast on invalid input.
- Surface user-safe messages in the UI.
- Log internal diagnostics separately from user-facing errors.
- Handle upstream API timeouts, rate limits, and partial failures explicitly.
- Add retry/backoff only where retries are safe.

## 5) Logging and Observability
- Log request identifiers, route names, and outcome states.
- Track AI latency, search latency, database latency, and render latency separately.
- Include enough context to debug without exposing secrets.
- Prefer structured logs over free-form strings.
- Measure the product flow from input to output, not only API success.

## 6) Testing Strategy
- Add tests for critical business logic first.
- Cover success paths, edge cases, and permission boundaries.
- Prefer unit tests for deterministic logic and integration tests for workflows.
- Validate API contract changes with regression tests.
- Never ship a feature with no verification path.

## 7) Performance Considerations
- Keep route handlers lean.
- Cache expensive derived results when consistency allows.
- Batch database writes when possible.
- Stream long-running work rather than blocking the UI.
- Minimize repeated AI calls by persisting intermediate artifacts.

## 8) Security Practices
- Enforce auth at every protected route and API boundary.
- Apply row-level access checks to all user-owned data.
- Never expose service role credentials to client code.
- Store invite tokens and access tokens hashed when appropriate.
- Treat exported/shareable content as sensitive unless explicitly public.

## 9) Git Workflows and Versioning
- Work in small, reviewable milestones.
- Use clear commit messages that describe behavior change.
- Keep branches focused on one feature or fix.
- Commit schema changes separately from UI and logic changes when practical.
- Push after meaningful checkpoints so progress is not lost.

## 10) Scalability Mindset
- Design for growth in users, sessions, and generated artifacts.
- Avoid patterns that require manual cleanup at scale.
- Prefer background jobs for expensive work.
- Keep storage, compute, and presentation responsibilities separate.
- Build features that improve retention, collaboration, and repeat usage.

## 11) Default Development Sequence
1. Read the repo context and current conventions.
2. Identify the smallest safe implementation slice.
3. Update shared types and schema intentionally.
4. Implement backend logic.
5. Expose or modify APIs.
6. Build the UI.
7. Add tests.
8. Verify build/lint.
9. Commit and push the milestone.
