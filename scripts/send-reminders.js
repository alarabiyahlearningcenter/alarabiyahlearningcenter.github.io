// ============================================
// CLASS REMINDER SENDER
// Runs every 5 min via GitHub Actions
// ============================================

const { createClient } = require('@supabase/supabase-js');
const webpush = require('web-push');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@alarabiyahlearningcenter.com';

// EmailJS
const EMAILJS_SERVICE = process.env.EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE = process.env.EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC = process.env.EMAILJS_PUBLIC_KEY;

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

async function alreadySent(classId, type) {
  const { data } = await sb.from('notification_log')
    .select('id').eq('class_id', classId).eq('reminder_type', type).maybeSingle();
  return !!data;
}

async function logSent(classId, type) {
  await sb.from('notification_log').insert({ class_id: classId, reminder_type: type });
}

async function sendPush(recipientIds, payload) {
  if (!recipientIds.length) return 0;

  const { data: subs } = await sb.from('push_subscriptions').select('*').in('user_id', recipientIds);
  if (!subs || !subs.length) return 0;

  let sent = 0;
  for (const sub of subs) {
    try {
      await webpush.sendNotification({
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth }
      }, JSON.stringify(payload));
      sent++;
    } catch (err) {
      console.log(`Push failed for ${sub.id}:`, err.statusCode);
      if (err.statusCode === 410 || err.statusCode === 404) {
        await sb.from('push_subscriptions').delete().eq('id', sub.id);
      }
    }
  }
  return sent;
}

async function sendEmail(recipientEmail, payload) {
  if (!EMAILJS_SERVICE || !EMAILJS_TEMPLATE || !EMAILJS_PUBLIC) {
    console.log('EmailJS not configured, skipping email');
    return false;
  }
  if (!recipientEmail) return false;

  try {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE,
        template_id: EMAILJS_TEMPLATE,
        user_id: EMAILJS_PUBLIC,
        template_params: payload
      })
    });

    if (!res.ok) {
      const text = await res.text();
      console.log('Email send failed:', res.status, text);
      return false;
    }
    return true;
  } catch (err) {
    console.log('Email error:', err.message);
    return false;
  }
}

async function getAdmins() {
  const { data } = await sb.from('profiles').select('id').in('role', ['admin', 'super_admin']);
  return (data || []).map(a => a.id);
}

async function processReminders() {
  const now = new Date();
  const in35Min = new Date(now.getTime() + 35 * 60 * 1000);

  const { data: classes, error } = await sb.from('classes')
    .select('*')
    .eq('status', 'scheduled')
    .gte('scheduled_at', now.toISOString())
    .lte('scheduled_at', in35Min.toISOString());

  if (error) {
    console.error('Supabase error:', error);
    return;
  }

  if (!classes || !classes.length) {
    console.log('No upcoming classes in next 35 min');
    return;
  }

  const adminIds = await getAdmins();

  for (const cls of classes) {
    const minutesUntil = Math.round((new Date(cls.scheduled_at) - now) / 60000);

    let type = null;
    if (minutesUntil >= 25 && minutesUntil <= 32) type = '30min';
    else if (minutesUntil >= 10 && minutesUntil <= 17) type = '15min';
    else if (minutesUntil >= 0 && minutesUntil <= 7) type = '5min';

    if (!type) continue;
    if (await alreadySent(cls.id, type)) continue;

    // Build recipient list
    const recipients = [cls.student_id].filter(Boolean);
    if (cls.teacher_id) {
      const { data: teacher } = await sb.from('teachers').select('profile_id').eq('id', cls.teacher_id).single();
      if (teacher?.profile_id) recipients.push(teacher.profile_id);
    }
    if (cls.dedicated_admin_id) recipients.push(cls.dedicated_admin_id);
    else recipients.push(...adminIds);

    const timeStr = new Date(cls.scheduled_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const title = type === '30min' ? '⏰ Class in 30 minutes'
      : type === '15min' ? '⏰ Class in 15 minutes'
      : '🚨 Class starting in 5 minutes!';
    const body = `${cls.title || 'Quran Class'} at ${timeStr}`;

    const sentCount = await sendPush(recipients, {
      title,
      body,
      url: '/student/live-class.html',
      tag: `class-${cls.id}-${type}`,
      requireInteraction: type === '5min',
      icon: '/assets/images/logo.png'
    });

    // Send email to student
    let emailSent = 0;
    if (cls.student_id) {
      const { data: student } = await sb.from('profiles').select('email, full_name').eq('id', cls.student_id).single();
      if (student?.email) {
        const classDate = new Date(cls.scheduled_at);
        const dateStr = classDate.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' });
        const ok = await sendEmail(student.email, {
          to_email: student.email,
          reminder_type: type === '30min' ? 'Class starts in 30 minutes' : type === '15min' ? 'Class starts in 15 minutes' : 'Class starting NOW!',
          class_title: cls.title || 'Quran Class',
          class_date: dateStr,
          class_time: timeStr,
          class_duration: cls.duration_min || 30,
          join_link: 'https://alarabiyahlearningcenter.github.io/student/live-class.html'
        });
        if (ok) emailSent++;
      }
    }

    await logSent(cls.id, type);
    console.log(`✓ ${type} reminder for class ${cls.id} → push: ${sentCount}, email: ${emailSent}`);
  }
}

processReminders().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
