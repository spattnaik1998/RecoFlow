# Product Specification — Recommendation Feedback Controls

## 1) Overview
Add explicit feedback controls so users can shape future recommendations. This creates a learning loop that improves recommendation quality and makes the product feel personal and accountable.

## 2) Problem Statement
The current app generates strong one-off recommendations, but users have limited control over what happens next. Without feedback signals, the system cannot learn from disliked titles, overused themes, or preferred authors. That weakens long-term value and churns users who feel the output is generic.

## 3) Goals and Non-Goals
### Goals
- Capture positive and negative feedback on recommendations.
- Learn preferred themes, authors, and formats over time.
- Let users exclude topics, books, or authors.
- Surface controls without disrupting the elegant session flow.

### Non-Goals
- Full supervised learning pipeline or model training.
- Social ranking based on community data.
- A separate machine learning admin console.

## 4) User Stories
- As a user, I want to like or dislike a recommendation.
- As a user, I want to say why I disliked a recommendation.
- As a user, I want to block an author or theme.
- As a returning user, I want future results to reflect my feedback.

## 5) Functional Requirements
- Thumbs up/down on each recommendation.
- Reasons for dislike: too academic, too commercial, already read, wrong tone, not relevant.
- Save user exclusions for authors, titles, themes, and keywords.
- Use feedback to rerank or filter future recommendations.
- Display a “Why this changed” note when recommendations are influenced by prior feedback.

## 6) Non-Functional Requirements
- Feedback writes must be idempotent.
- Feedback should be stored with timestamps and session context.
- Recommendation generation must remain fast despite filtering.
- The system must respect user preferences immediately on the next session.

## 7) System Design
### Backend
- Add a `recommendation_feedback` table.
- Add a `user_preferences` table for durable exclusions and boosts.
- Extend recommendation generation to merge session context with preference state.
- Add a lightweight scoring adjustment layer before final ranking.

### Frontend
- Add feedback buttons on each recommendation card.
- Add a preferences page or drawer for exclusions.
- Show a confirmation state after feedback is saved.
- Surface a small explanation badge like “Adjusted for your dislike of dense theory.”

### Data Flow
1. User reacts to a recommendation.
2. Feedback is stored with a session reference.
3. User preferences are updated.
4. Future ranking uses the preference profile to filter and rerank results.

## 8) API Design
### `POST /api/recommendations/[id]/feedback`
Save like/dislike and optional reason.

### `GET /api/preferences`
Load preference state.

### `PATCH /api/preferences`
Update blocked authors, blocked themes, and positive preference weights.

### `POST /api/recommendations/rerank`
Internal endpoint to recalculate ordering from stored candidates.

## 9) Data Model Changes
- `recommendation_feedback(id, recommendation_id, session_id, user_id, vote, reason, created_at)`
- `user_preferences(user_id, blocked_authors, blocked_titles, blocked_themes, preferred_themes, updated_at)`
- Optional `preference_events(id, user_id, source, payload, created_at)` for auditability

## 10) UI/UX Design Instructions
- Feedback controls must be visible but subtle.
- Use icon buttons with short labels only on hover or in a compact action row.
- Keep the preferences page crisp and task-oriented.
- Use clear empty states for users with no feedback yet.
- Avoid making the UI feel like a survey; it should feel like refinement.

## 11) Edge Cases and Failure Handling
- Duplicate feedback submissions.
- Feedback submitted after a session is already archived.
- Conflicting preferences, such as blocked author but preferred theme.
- Missing metadata for a recommendation.
- Offline or failed feedback write should retry silently.

## 12) Metrics for Success
- Feedback submission rate.
- Reduction in repeated bad recommendations.
- Increase in recommendation acceptance.
- Retention of users with at least three feedback events.
- Preference hit rate across new sessions.

## 13) Rollout Strategy
### MVP
- Like/dislike controls and durable blocks.

### Iteration 2
- Reasons for feedback and preference page.

### Iteration 3
- Preference-aware reranking and explanation notes.

## Claude Code Implementation Plan
1. Add the feedback and preference tables.
2. Extend the recommendation model and API to capture votes and reasons.
3. Build recommendation card controls in the UI.
4. Add the preference management surface.
5. Update ranking logic to filter and rerank using stored preferences.
6. Add tests for idempotency, preference persistence, and reranking behavior.
