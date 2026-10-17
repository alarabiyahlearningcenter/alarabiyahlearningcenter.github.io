# Al-Arabiyah Learning Center - Audit & Fix Report

**Date:** 2026-10-17
**Status:** Completed & Pushed to Main

## Executive Summary
A comprehensive security and functionality audit was conducted. The following critical issues were identified and successfully patched.

## Fixed Issues

### F-01: LiveKit Teacher Authorization
*   **Issue:** Teachers were unable to join their own classes because the system was comparing `classes.teacher_id` with `user.id`.
*   **Fix:** Updated `supabase/functions/livekit-token/index.ts` to correctly fetch the teacher's record using the `profile_id` before authorizing.

### F-02: Admin Signup Security
*   **Issue:** Admin signup was client-side only, allowing bypasses. RLS policies allowed users to update their own `role`.
*   **Fix:** 
    1. Disabled public admin signup (`admin/signup.html`).
    2. Added a new database trigger `prevent_role_escalation` in Supabase. Now, only `admin` and `super-admin` roles can change the `role` column in `profiles`.

### F-03: Missing PWA Icons
*   **Issue:** Student PWA manifest referenced icons that did not exist.
*   **Fix:** Generated required icons in `student/icons/` using the main project logo.

### F-04 & F-05: Reminder Workflow
*   **Issue:** Script swallowed database errors and mishandled duplicate claims.
*   **Fix:** Updated `scripts/send-reminders.js` to `throw` on database failures and correctly catch PostgreSQL `23505` errors.

### F-06: Supabase Temp Metadata
*   **Issue:** Local CLI metadata was tracked in Git.
*   **Fix:** Stopped tracking `.temp/` files using `git rm -r --cached`.
