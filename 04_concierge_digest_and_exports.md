# Product Specification — Concierge Digests and Exports

## 1) Overview
Add generated reading digests that turn a completed consultation into a polished deliverable: a weekly email, a PDF report, or a shareable summary page. This gives the product a concrete artifact users can keep, send, or act on.

## 2) Problem Statement
Recommendations are valuable, but they disappear after the session. Users often need a compact artifact that helps them decide what to read next, revisit the rationale later, or share the results with someone else. Exportable outputs also improve monetization through premium reporting and email workflows.

## 3) Goals and Non-Goals
### Goals
- Generate a concise consultation recap.
- Support PDF and shareable link exports.
- Send scheduled or on-demand email digests.
- Highlight why each recommendation matters now.

### Non-Goals
- Full newsletter platform.
- Complex template editor.
- Multi-recipient marketing automation.

## 4) User Stories
- As a user, I want a PDF summary of my session.
- As a user, I want a shareable link I can send to a friend.
- As a user, I want a weekly digest of new insights and suggestions.
- As a premium subscriber, I want polished exports without manual copying.

## 5) Functional Requirements
- Generate a digest containing book inputs, core themes, questions asked, and final recommendations.
- Provide PDF, HTML share link, and email delivery options.
- Allow users to choose branded or minimal export styles.
- Include a clear CTA to continue reading or start a new consultation.
- Store export history per session.

## 6) Non-Functional Requirements
- Export generation must be asynchronous.
- Export assets must be secure and access-controlled.
- PDF rendering must be deterministic and readable.
- Email delivery must retry safely and avoid duplicate sends.

## 7) System Design
### Backend
- Add an export job queue or background task abstraction.
- Build a digest renderer that converts session data into HTML and PDF.
- Store generated file metadata in the database.
- Integrate with an email delivery provider for digest delivery.

### Frontend
- Add an export button on the recommendations and library pages.
- Show export status: queued, generating, ready, failed.
- Provide a preview panel before finalizing the export style.
- Allow copying a secure share link.

### Data Flow
1. User requests export.
2. System creates an export job.
3. Job renders digest content.
4. Output is saved and linked back to the session.
5. User receives a ready notification or email.

## 8) API Design
### `POST /api/exports`
Create a new export job.

### `GET /api/exports/[id]`
Check export status and metadata.

### `GET /api/exports/[id]/download`
Download the PDF output.

### `POST /api/exports/[id]/send`
Send the export by email.

### `GET /s/[shareId]`
Render a public or private shareable summary page.

## 9) Data Model Changes
- `exports(id, session_id, user_id, type, style, status, file_url, share_id, sent_at, created_at, updated_at)`
- Optional `digest_preferences(user_id, default_style, delivery_email, weekly_digest_enabled)`

## 10) UI/UX Design Instructions
- Make the export panel feel like a formal document builder.
- Use a clear preview layout with section headers.
- Keep CTA buttons strong and obvious.
- Preserve the product's atmospheric design, but make export screens more minimal and readable.
- Use progress states that reassure the user during generation.

## 11) Edge Cases and Failure Handling
- Export generation timeout.
- Missing content for older sessions.
- Failed email delivery.
- Expired or revoked share links.
- Duplicate export requests for the same session.

## 12) Metrics for Success
- Export creation rate.
- Share-link opens.
- PDF download rate.
- Email open and click-through rate.
- Conversion to repeat sessions after export.

## 13) Rollout Strategy
### MVP
- PDF export and download.

### Iteration 2
- Shareable links and email send.

### Iteration 3
- Scheduled digests and style preferences.

## Claude Code Implementation Plan
1. Add the export database model and status lifecycle.
2. Build the digest renderer from existing session data.
3. Implement asynchronous PDF generation and secure file storage.
4. Add export controls and status UI.
5. Add share links and email delivery.
6. Add tests for rendering, permissions, and duplicate export handling.
