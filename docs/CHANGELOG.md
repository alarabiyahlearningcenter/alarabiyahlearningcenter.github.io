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
