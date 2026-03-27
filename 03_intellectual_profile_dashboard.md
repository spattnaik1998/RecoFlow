# Product Specification — Intellectual Profile Dashboard

## 1) Overview
Build a persistent dashboard that shows a user's reading identity: themes, emotional signals, session history, recommendation patterns, and growth over time. This transforms the app from a session-based tool into a meaningful personal knowledge product.

## 2) Problem Statement
The app already stores session history and intellectual themes, but users do not have a clear place to see the value accumulating over time. Without a dashboard, the experience feels transient. A profile view increases stickiness, makes progress visible, and creates a premium-worthy product surface.

## 3) Goals and Non-Goals
### Goals
- Show accumulated themes and emotional context.
- Visualize reading history and recommendation trends.
- Surface repeat patterns across sessions.
- Provide a premium-feeling home for returning users.

### Non-Goals
- Social profile sharing.
- Deep analytics for publishers or administrators.
- Full data science experimentation tooling.

## 4) User Stories
- As a user, I want to see my dominant intellectual themes.
- As a user, I want to revisit past sessions and recommendations.
- As a user, I want to understand how my reading tastes have evolved.
- As a returning user, I want Nyx to reference my history without repeating the same content.

## 5) Functional Requirements
- Create a dashboard that summarizes profile themes, recent sessions, and top recommendation categories.
- Show trend cards for intellectual and emotional patterns.
- Allow opening a past session and re-reading the original recommendation set.
- Allow export of profile data as JSON or PDF summary.
- Show a “You often return to...” insight block generated from stored history.

## 6) Non-Functional Requirements
- Profile summaries should load quickly.
- Historical data access must scale with many sessions.
- Export jobs should be non-blocking.
- Visualizations must remain readable on small screens.

## 7) System Design
### Backend
- Reuse `profiles`, `reading_sessions`, `current_books`, and `recommendations`.
- Add a profile aggregation service that computes display-ready summaries.
- Add export generation jobs for JSON and PDF outputs.
- Cache computed dashboard summaries to reduce repeated aggregation costs.

### Frontend
- Add a `/profile` or enhanced `/library` surface.
- Include summary cards, timeline views, and theme clusters.
- Add expandable session rows with original books and recommendations.
- Show a polished first-time empty state that explains the value of the profile.

### Data Flow
1. User completes sessions.
2. The aggregation layer updates profile summaries.
3. Dashboard reads summary and history data.
4. Export is generated on demand.

## 8) API Design
### `GET /api/profile`
Return dashboard summary.

### `GET /api/profile/sessions`
Return paginated session history.

### `GET /api/profile/export`
Return or queue an export.

### `GET /api/profile/insights`
Return generated insight blocks for the dashboard.

## 9) Data Model Changes
- Optionally add `profile_snapshots(id, user_id, summary_json, created_at)` for cached aggregates.
- Optionally add `exports(id, user_id, type, status, file_url, created_at)`.

## 10) UI/UX Design Instructions
- Make the dashboard feel archival and premium, not analytical and sterile.
- Use cards, timelines, and compact charts.
- Keep typography aligned with the existing Victorian gothic identity.
- Use a hero summary section, then a history list, then analytics blocks.
- Preserve strong contrast and readability.

## 11) Edge Cases and Failure Handling
- Empty profile for new users.
- Very large history lists.
- Stale cached summaries.
- Export generation failure.
- Missing metadata in older sessions.

## 12) Metrics for Success
- Profile dashboard visits per returning user.
- Export requests.
- Sessions revisited from history.
- Time spent on profile page.
- Return rate after first dashboard visit.

## 13) Rollout Strategy
### MVP
- Summary cards and session history.

### Iteration 2
- Trends, insight blocks, and export.

### Iteration 3
- Cached snapshots and richer visualizations.

## Claude Code Implementation Plan
1. Build a profile aggregation function from existing session and recommendation data.
2. Add the dashboard API and paginated history endpoint.
3. Create the profile dashboard UI with summary cards and timelines.
4. Add export support and a basic file delivery flow.
5. Add tests for aggregation correctness, paging, and export failure handling.
