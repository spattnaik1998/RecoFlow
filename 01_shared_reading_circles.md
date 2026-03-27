# Product Specification — Shared Reading Circles

## 1) Overview
Add collaborative workspaces so users can share consultations, recommendations, and reading context with friends, book clubs, or small teams. This moves the product from a solo recommender into a social reading platform.

## 2) Problem Statement
The current app is highly personal and private. That is useful for individual discovery, but it limits retention and monetization because users cannot invite others, compare interpretations, or build a shared reading identity. A business-ready reading product needs collaborative surfaces.

## 3) Goals and Non-Goals
### Goals
- Allow a user to create a shared circle with invited members.
- Support shared consultations and shared recommendation history.
- Let members comment on a consultation and vote on recommended books.
- Preserve private sessions for individual use.

### Non-Goals
- Full enterprise org management.
- Real-time co-authoring inside the brain-dump experience.
- Public social network features like follower graphs or open feeds.

## 4) User Stories
- As a reader, I want to invite friends to a circle so we can explore books together.
- As a circle owner, I want to choose whether a consultation is private or shared.
- As a member, I want to vote on recommendations and leave comments.
- As a returning user, I want to see shared history alongside my private history.

## 5) Functional Requirements
- Create, rename, archive, and delete reading circles.
- Invite users by email with a secure token.
- Support roles: owner, editor, viewer.
- Attach sessions to a circle.
- Show shared consultation history and shared recommendations.
- Allow comments on sessions and recommendations.
- Allow simple voting signals: like, neutral, dislike.

## 6) Non-Functional Requirements
- Invitations must expire.
- Role checks must be enforced on every API route.
- Shared history must load quickly even with many sessions.
- Comments and votes must be auditable.
- Data access must remain isolated by circle membership.

## 7) System Design
### Backend
- Add `circles`, `circle_members`, `circle_invites`, `circle_comments`, and `circle_votes` tables.
- Reuse the existing `reading_sessions`, `current_books`, and `recommendations` tables by adding optional `circle_id`.
- Add membership and role middleware for all circle-scoped routes.

### Frontend
- Add a circle switcher in the navigation.
- Add a circle dashboard with member list, session feed, and recent recommendations.
- Add comment and vote UI on the recommendations page.
- Preserve the current solo flow when no circle is selected.

### Data Flow
1. User creates a circle.
2. Invitees join via tokenized email link.
3. Sessions can be launched in the circle context.
4. Results are persisted under both the user and the circle.

## 8) API Design
### `POST /api/circles`
Create a circle.

### `GET /api/circles`
List circles for the authenticated user.

### `POST /api/circles/[id]/invite`
Send invite email.

### `POST /api/circles/[id]/join`
Accept invite token.

### `POST /api/sessions/[id]/share`
Attach an existing session to a circle.

### `POST /api/recommendations/[id]/vote`
Store a vote.

### `POST /api/comments`
Create a comment on a session or recommendation.

## 9) Data Model Changes
- `circles(id, name, owner_id, created_at, updated_at, status)`
- `circle_members(id, circle_id, user_id, role, joined_at)`
- `circle_invites(id, circle_id, email, token_hash, expires_at, accepted_at)`
- `circle_comments(id, circle_id, session_id?, recommendation_id?, user_id, body, created_at)`
- `circle_votes(id, circle_id, recommendation_id, user_id, vote, created_at)`
- Add nullable `circle_id` to `reading_sessions`

## 10) UI/UX Design Instructions
- Keep the existing gothic visual language, but make collaborative elements feel lighter and more legible.
- Add a dedicated circle dashboard card with member avatars, status chips, and recent activity.
- Use clean modal-based invite flows.
- Comments should appear in a threaded side panel, not inside the core question flow.
- Voting controls should be small, elegant, and unobtrusive.

## 11) Edge Cases and Failure Handling
- Invitation token expired.
- Invited email already belongs to another circle member entry.
- Owner leaves the circle.
- A private session is accidentally selected for sharing.
- A member loses access after being removed.

## 12) Metrics for Success
- Circles created per active user.
- Invite acceptance rate.
- Shared sessions per week.
- Comment and vote participation.
- Retention lift versus solo-only users.

## 13) Rollout Strategy
### MVP
- Circle creation, invitation, and shared session history.

### Iteration 2
- Comments, votes, and circle dashboard.

### Iteration 3
- Shared recommendations ranking influenced by group feedback.

## Claude Code Implementation Plan
1. Add the database schema for circles, members, and invites.
2. Implement auth and membership checks for circle-scoped routes and APIs.
3. Build the circle creation and invitation flow in the frontend.
4. Persist session `circle_id` and wire shared history views.
5. Add comments and recommendation voting.
6. Add tests for permissions, invite lifecycle, and shared-session persistence.
