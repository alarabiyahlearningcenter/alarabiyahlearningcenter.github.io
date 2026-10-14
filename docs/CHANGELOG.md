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

### F-006: Notice Section Missing (COMPLETED)
- JS (loadNotices) referenced #noticesSection and #noticesGrid elements.
- Neither element existed in HTML; getElementById returned null, silently aborting.
- Added section markup after Courses, before Why Choose Us.
- Verified on live site: "ওয়েলকাম!" notice renders correctly.
- Commit: (see git log)

### F-002: Repository Hygiene (COMPLETED)
- Untracked from Git (files preserved on disk):
  - _backup_f5_20260930_224940/ (3 HTML, 88 KB)
  - _diag/ (4 diagnostic files, 76 KB)
  - assets/js/admin-shell.js.bak (12 KB)
  - assets/js/super-admin-shell.js.bak (12 KB)
- Verified unused via grep across active HTML/JS/CSS/JSON.
- .gitignore already prevents future re-additions.
- Commit: 441edf7

### F-002: Repository Hygiene (COMPLETED)
- Untracked 9 files from Git (preserved on disk):
  _backup_f5_20260930_224940/ (3 files, 88 KB)
  _diag/ (4 files, 76 KB)
  admin-shell.js.bak (12 KB)
  super-admin-shell.js.bak (12 KB)
- Verified unused via grep across active code.
- Commit: 441edf7

### F-002: Repository Hygiene (COMPLETED)
- Untracked 9 files: _backup_f5_*/ (3), _diag/ (4), 2 .bak files
- Verified unused via grep. Commit: 441edf7

### F-007: Broken settings.html link (COMPLETED)
- parent/dashboard.html line 58 pointed to non-existent parent/settings.html
- Replaced with existing parent/notification-preferences.html
- Verified no remaining settings.html references

### F-008: Wrong logo path (COMPLETED)
- teacher-profile.html line 32 used src="images/logo.png" (missing assets/)
- Fixed to src="assets/images/logo.png"
- Removed onerror="this.style.display='none'" which was masking the broken path
- Verified no remaining wrong-logo paths across all HTML

### F-009: teacher-profile.html was a mislabeled dashboard (COMPLETED)
- Root teacher-profile.html was actually a duplicate of teacher/dashboard.html
  (299 lines, contained "Add Student" button, sidebar menu)
- Public "View Profile" links from index.html:406 and teachers.html:189/207/256
  were sending visitors to an internal dashboard
- Replaced with a proper public teacher profile page:
  - Fetches teacher data from `teachers` table by ?id= query param
  - Shows name, photo, bio, experience, specialties
  - Includes loading, error, and not-found states
  - Uses same header/footer as rest of site
- Backup: ~/audit_backup/teacher-profile_dashboard_version_*.html

### F-010: teachers.html broken interpolation (COMPLETED)
- Fallback array had no `id` field AND main data path had escaped \${t.id}
- URL became literal "teacher-profile.html?id=${t.id}" causing null lookup
- Unescaped 1 interpolation in teachers.html (F-004 pattern)
- Verified: 0 remaining escapes, 3/3 script blocks pass syntax check
- All "View Profile" links now resolve to real teacher UUIDs
