// ============================================
// SITE LOADER — Auto-apply dynamic settings
// Loads on every public page
// ============================================

(function() {
  const SUPABASE_URL = 'https://vgsgisyneymtszuslftb.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnc2dpc3luZXltdHN6dXNsZnRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0NTg0NjQsImV4cCI6MjEwNjAzNDQ2NH0.HaYptmVnZCbGiOCg1NyYkcdHQDqjXlAHeq_i_bTC6Yk';

  function onReady(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  onReady(async () => {
    if (!window.supabase) return;
    const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Fetch all site settings in one go
    const { data: settings } = await sb.from('site_settings').select('key, value');
    if (!settings) return;

    const S = {};
    settings.forEach(item => {
      try { S[item.key] = JSON.parse(item.value); }
      catch { S[item.key] = item.value; }
    });

    // ---- 1. Apply Brand Colors (CSS variables) ----
    if (S.primary_color) document.documentElement.style.setProperty('--primary', S.primary_color);
    if (S.secondary_color) document.documentElement.style.setProperty('--secondary', S.secondary_color);

    // ---- 2. Replace Logo Images ----
    if (S.logo_url) {
      document.querySelectorAll('img[src*="logo.png"], img[src*="logo.svg"]').forEach(img => {
        img.src = S.logo_url;
      });
      // Favicon
      const fav = document.querySelector('link[rel="icon"]');
      if (fav && S.favicon_url) fav.href = S.favicon_url;
    }

    // ---- 3. Site Name / Tagline ----
    if (S.site_name) {
      document.querySelectorAll('[data-site-name]').forEach(el => el.textContent = S.site_name);
    }
    if (S.tagline) {
      document.querySelectorAll('[data-tagline]').forEach(el => el.textContent = S.tagline);
    }

    // ---- 4. WhatsApp Links ----
    if (S.whatsapp) {
      const clean = S.whatsapp.replace(/[^0-9]/g, '');
      document.querySelectorAll('a[href*="wa.me/"]').forEach(a => {
        const href = a.getAttribute('href');
        a.setAttribute('href', href.replace(/wa\.me\/\d+/, 'wa.me/' + clean));
      });
    }

    // ---- 5. Phone / Email ----
    if (S.phone) {
      document.querySelectorAll('a[href^="tel:"]').forEach(a => {
        a.href = 'tel:' + S.phone.replace(/\s/g, '');
        const txt = a.querySelector('[data-phone-text]');
        if (txt) txt.textContent = S.phone;
      });
    }
    if (S.email) {
      document.querySelectorAll('a[href^="mailto:"]').forEach(a => {
        a.href = 'mailto:' + S.email;
        const txt = a.querySelector('[data-email-text]');
        if (txt) txt.textContent = S.email;
      });
    }

    // ---- 6. Announcement Bar ----
    if (S.announcement_enabled && S.announcement_text) {
      const body = document.body;
      const bar = document.createElement('div');
      bar.id = 'announcementBar';
      bar.style.cssText = 'background:#0A3622;color:#D4AF37;text-align:center;padding:10px 16px;font-size:13px;font-weight:600;position:relative;z-index:60';
      bar.innerHTML = `<span>${S.announcement_text}</span>
        <button onclick="this.parentElement.remove()" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);color:#D4AF37;opacity:.7;font-size:18px;line-height:1">&times;</button>`;
      body.insertBefore(bar, body.firstChild);
    }

    // ---- 7. Social Links in Footer ----
    if (S.facebook || S.youtube || S.instagram || S.tiktok || S.twitter || S.telegram) {
      document.querySelectorAll('[data-social="facebook"]').forEach(el => S.facebook ? el.href = S.facebook : el.remove());
      document.querySelectorAll('[data-social="youtube"]').forEach(el => S.youtube ? el.href = S.youtube : el.remove());
      document.querySelectorAll('[data-social="instagram"]').forEach(el => S.instagram ? el.href = S.instagram : el.remove());
      document.querySelectorAll('[data-social="tiktok"]').forEach(el => S.tiktok ? el.href = S.tiktok : el.remove());
      document.querySelectorAll('[data-social="twitter"]').forEach(el => S.twitter ? el.href = S.twitter : el.remove());
      document.querySelectorAll('[data-social="telegram"]').forEach(el => S.telegram ? el.href = S.telegram : el.remove());
    }

    // ---- 8. Analytics (GA + FB Pixel) ----
    if (S.ga_id && /^G-[A-Z0-9]+$/i.test(S.ga_id)) {
      const s1 = document.createElement('script');
      s1.async = true;
      s1.src = 'https://www.googletagmanager.com/gtag/js?id=' + S.ga_id;
      document.head.appendChild(s1);
      const s2 = document.createElement('script');
      s2.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${S.ga_id}');`;
      document.head.appendChild(s2);
    }
    if (S.fb_pixel && /^\d+$/.test(S.fb_pixel)) {
      const fb = document.createElement('script');
      fb.innerHTML = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${S.fb_pixel}');fbq('track','PageView');`;
      document.head.appendChild(fb);
    }

    // ---- 9. Custom Event for pages to react ----
    window.dispatchEvent(new CustomEvent('siteSettingsLoaded', { detail: S }));
  });
})();
