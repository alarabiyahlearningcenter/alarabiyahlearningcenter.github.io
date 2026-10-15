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

### F-011: Reminder marked as sent even when all deliveries failed (COMPLETED)
- logSent() was called unconditionally, preventing retry on transient failures
- Fixed: logSent() now only called when at least one channel (push or email) succeeded
- If both channels fail, no log is written, allowing next cron run to retry

### F-012: Race condition on duplicate reminders (COMPLETED)
- alreadySent() check-then-insert pattern could allow duplicate sends
- Added UNIQUE constraint: notification_log (class_id, reminder_type)
- New atomic pattern: claimReminder() inserts first; releaseReminder() on total failure
- SQL migration executed: notification_log_class_type_unique
- alreadySent() function is now unused (kept as harmless dead code for future reference)

### F-014: Notification bell not mounting (COMPLETED)
- notifications.js defined NotifBell.mount() but no page ever called it
- Result: no bell rendered, no unread badge, no dropdown panel
- Fix: appended auto-mount block that:
  - Waits for window.db and window.NotifBell to be ready
  - Checks session via db.auth.getSession()
  - Calls NotifBell.mount(user.id) on DOMContentLoaded
  - Retries up to 20 times if db not yet available
- No changes needed in 30+ HTML files
- All syntax checks pass

### F-015: is_read default verification
- Verified DB column has default 'false' — no change needed
- Nullable but functionally safe

### F-016: window.db not exposed on student/dashboard (COMPLETED)
- dashboard created local `const db` but never set `window.db`
- notifications.js auto-mount required window.db, so mount silently failed
- Result: bell icon rendered (by inject-bell.js) but unread badge never appeared
- Verified via debug-bell.html: unreadCount() returned 10 for st3@gmail.com
- Fix: single line `window.db = db;` added after createClient call

### F-017: window.db missing on 9 student/teacher pages (COMPLETED)
- Same root cause as F-016: local const db never assigned to window.db
- pages affected: student/payment, my-courses, profile, certificate,
  select-teacher, live-class; teacher/my-classes, my-students, dashboard
- Result: notification bell auto-mount silently failed (badge, panel empty)
- Fix: added `window.db = db;` after createClient call in each file
- All 9 files pass syntax check; backups preserved in ~/audit_backup/F017_*

### F-020/F-021/F-022/F-023: KYC-driven teacher activation (COMPLETED)
- Root cause: two separate authorization paths (profiles.kyc_status vs teachers.is_active)
  were not synced, leaving rejected teachers publicly visible
- DB migration: teachers.is_active default changed to false
- DB trigger: profiles.kyc_status='approved' auto-activates, 'rejected' auto-deactivates
- teacher-profile.html: added .eq('is_active', true) to prevent direct URL access to hidden teachers
- Existing 3 teachers remain active (kyc_status='approved')

### F-024: Admin panel deactivate/reject out of sync with profiles (COMPLETED)
- admin/teachers.html rejectTeacher was deleting teachers row without
  updating profiles.kyc_status, so the sync trigger could recreate the
  teacher row on next profile update.
- approveTeacher only set is_active=true but not kyc_status='approved'.
- Fix:
  - rejectTeacher now deactivates (is_active=false) and sets kyc_status='rejected'
  - approveTeacher now also sets kyc_status='approved'
  - Data preserved; no row deletions on reject

### F-025: Teacher self-service profile page (COMPLETED)
- Created teacher/profile.html (401 lines):
  - Photo upload (Supabase Storage bucket 'teachers')
  - Photo remove
  - Edit name, bio, experience_years, specialties
  - Loading / error / not-found states
- Storage policies added for teacher self-service:
  - teachers_upload_own (INSERT), teachers_update_own (UPDATE), teachers_delete_own (DELETE)
  - Path scoped to: teachers/<auth.uid>/avatar.*
- Added "My Profile" link to all 10 teacher pages:
  - 8 pages: sidebar link added after Dashboard
  - notification-preferences.html & kyc.html: header nav link added

### F-031: test-debug.html leaked auth tokens (COMPLETED)
- Root cause: leftover debug page from earlier LiveKit token investigation
- Page read supabase auth token from localStorage and printed it to console
- Any logged-in student visiting the URL directly would leak their session
- Not linked anywhere (orphaned) but publicly accessible via GitHub Pages
- Removed from repo; backup preserved at ~/audit_backup/test-debug_removed_*.html
