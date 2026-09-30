// ============================================
// EMAILJS CONFIGURATION
// ============================================

window.EMAILJS_CONFIG = {
  PUBLIC_KEY: 'gHWB0scyych0N1qQ_',
  SERVICE_ID: 'service_aivyn07',
  TEMPLATE_ID: 'template_bl9vrgh'
};

// Load EmailJS SDK dynamically
(function() {
  if (window.emailjs) return;
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
  script.onload = () => {
    if (window.emailjs && window.EMAILJS_CONFIG.PUBLIC_KEY) {
      window.emailjs.init(window.EMAILJS_CONFIG.PUBLIC_KEY);
      console.log('✓ EmailJS initialized');
    }
  };
  document.head.appendChild(script);
})();

// Helper: Send email
window.sendEmail = async function(params) {
  if (!window.emailjs || !window.EMAILJS_CONFIG.SERVICE_ID) {
    console.warn('EmailJS not configured');
    return { error: 'Email not configured' };
  }

  try {
    const result = await window.emailjs.send(
      window.EMAILJS_CONFIG.SERVICE_ID,
      window.EMAILJS_CONFIG.TEMPLATE_ID,
      params
    );

    if (window.db) {
      await window.db.from('email_logs').insert({
        to_email: params.to_email,
        subject: params.class_title || 'Notification',
        template: window.EMAILJS_CONFIG.TEMPLATE_ID,
        status: 'sent'
      }).catch(() => {});
    }

    return { success: true, result };
  } catch (err) {
    console.error('Email send failed:', err);

    if (window.db) {
      await window.db.from('email_logs').insert({
        to_email: params.to_email,
        subject: params.class_title || 'Notification',
        template: window.EMAILJS_CONFIG.TEMPLATE_ID,
        status: 'failed',
        error: err.message
      }).catch(() => {});
    }

    return { error: err.message };
  }
};
