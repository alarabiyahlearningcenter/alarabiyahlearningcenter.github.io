# Al-Arabiyah Learning Center

An online learning management system built with HTML, Tailwind CSS, Vanilla JavaScript, and Supabase.

## Features
- **Role-Based Access:** Super Admin, Admin, Teacher, Student, Parent.
- **Live Classes:** Powered by LiveKit.
- **KYC Verification:** For teachers.
- **Automated Reminders:** GitHub Actions + EmailJS + Web Push.

## Security
- RLS (Row Level Security) enabled on Supabase.
- Database Triggers to prevent privilege escalation.
- Secure Edge Function for LiveKit Token generation.

## Setup
This is a static site deployed via GitHub Pages. Backend is handled by Supabase.
