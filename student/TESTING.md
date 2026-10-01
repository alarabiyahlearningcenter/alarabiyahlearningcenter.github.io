# ✅ LiveKit Classroom — Testing Checklist

## 1. Pre-Launch Checks
- [ ] student/livekit-class.html আছে
- [ ] student/sw.js আছে
- [ ] student/manifest.json আছে
- [ ] student/icons/ এ ৫টা PNG
- [ ] Supabase URL + Anon Key সঠিক
- [ ] livekit-token Edge Function deployed
- [ ] Storage bucket assignments public read

## 2. Database Tables
- [ ] profiles
- [ ] classes
- [ ] attendance
- [ ] assignments
- [ ] assignment_submissions
- [ ] class_materials
- [ ] class_recordings
- [ ] error_logs

## 3. Pre-Join
- [ ] Login check redirect
- [ ] ?room=xxx check
- [ ] Camera preview
- [ ] Mic level bar
- [ ] Device dropdown
- [ ] Background select
- [ ] Join button

## 4. Main Meeting
- [ ] Room connect
- [ ] Local tile (mirrored)
- [ ] Remote tile
- [ ] Grid adjust (1,2,3,4,6,9,16)
- [ ] Speaker detection
- [ ] Connection bar

## 5. Controls
- [ ] Mic toggle (M)
- [ ] Camera toggle (V)
- [ ] Screen share (S)
- [ ] Leave + confirm
- [ ] Hand raise (H)
- [ ] Reactions

## 6. Side Panels
- [ ] Chat
- [ ] Participants
- [ ] Settings
- [ ] Islamic

## 7. Host Features
- [ ] Mute all
- [ ] Lock room
- [ ] Broadcast
- [ ] Poll
- [ ] Quiz
- [ ] Breakout
- [ ] Co-host
- [ ] Waiting room
- [ ] Attendance CSV

## 8. Advanced
- [ ] Whiteboard
- [ ] Recording + cloud upload
- [ ] Live transcription
- [ ] Chat translation
- [ ] AI summary
- [ ] Content library
- [ ] Multi-room
- [ ] Session replay

## 9. PWA
- [ ] Service Worker registered
- [ ] Manifest valid
- [ ] Install button
- [ ] Offline banner
- [ ] Online sync
- [ ] iOS hint

## 10. Accessibility
- [ ] Tab focus
- [ ] Screen reader
- [ ] Focus trap
- [ ] High contrast
- [ ] Font size

## 11. Performance
- [ ] Lighthouse > 85
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] Heap < 300MB
- [ ] No console errors
