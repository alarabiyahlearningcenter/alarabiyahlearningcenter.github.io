# Changelog — Al-Arabiyah Learning Center

## 2026-10-14 — Security & Performance Fixes

### F-003: Logo Optimization (COMPLETED)
- Resized assets/images/logo.png from 7680x7680 (14 MB) to 512x512 (229 KB)
- Reduction: 98.3%
- Original backed up to ~/logo_backup/logo_original_20261014.png
- Verified visually on live site.

### F-005: LiveKit Class Authorization (COMPLETED)
- Fixed Critical authorization bypass in supabase/functions/livekit-token/index.ts
- Now verifies class enrollment via `classes` table (jitsi_room match).
- Role-based access: student, teacher, admin, super-admin.
- CORS restricted to production domain.
- Removed trust in client-provided participantName.
- Deployed via Supabase Dashboard (CLI blocked by DNS issue).
- Verified: unauthenticated request returns `{"error":"Missing auth"}`.

### F-001: .gitignore populated (COMPLETED)
- Added standard safety patterns to prevent accidental commits.

### F-004: JavaScript Syntax Repair (COMPLETED)
- Fixed malformed template literals in 4 HTML files.
- Root cause: auto-escape artifacts (\` and \${) from copy-paste.
- Files: admin/signup.html, student-resources.html, courses.html, index.html
- Restored missing if-condition for admin signup secret code check (fail-safe).
- All 12 inline script blocks now pass syntax validation.
- Commit: 07d65be

### F-002 (Partial): Repository Hygiene
- Untracked supabase/.temp/cli-latest from Git (temp file, must not be committed).
