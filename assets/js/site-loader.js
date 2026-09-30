// ==== MAINTENANCE_GUARD_V1 ====
(function() {
  try {
    const p = location.pathname.toLowerCase();
    const skip = /\/(admin|super-admin|maintenance|login|signup|forgot-password|parent-signup)\b/.test(p)
              || p.endsWith('maintenance.html')
              || p.endsWith('login.html')
              || p.endsWith('signup.html')
              || p.endsWith('forgot-password.html')
              || p.endsWith('parent-signup.html')
              || p.includes('/super-admin/');
    if (skip) return;

    const URL = 'https://vgsgisyneymtszuslftb.supabase.co';
    const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnc2dpc3luZXltdHN6dXNsZnRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0NTg0NjQsImV4cCI6MjEwNjAzNDQ2NH0.HaYptmVnZCbGiOCg1NyYkcdHQDqjXlAHeq_i_bTC6Yk';

    fetch(URL + '/rest/v1/site_settings?key=eq.maintenance_mode&select=value', {
      headers: { apikey: KEY, Authorization: 'Bearer ' + KEY }
    })
    .then(r => r.ok ? r.json() : null)
    .then(async rows => {
      const on = rows && rows[0] && (rows[0].value === 'true' || rows[0].value === true);
      if (!on) return;

      // Check if current user is admin / super_admin — those bypass maintenance
      try {
        const sess = localStorage.getItem('sb-vgsgisyneymtszuslftb-auth-token');
        if (sess) {
          const parsed = JSON.parse(sess);
          const uid = parsed?.user?.id;
          if (uid) {
            const pr = await fetch(URL + '/rest/v1/profiles?id=eq.' + uid + '&select=role', {
              headers: { apikey: KEY, Authorization: 'Bearer ' + (parsed.access_token || KEY) }
            });
            if (pr.ok) {
              const prow = await pr.json();
              const role = prow?.[0]?.role;
              if (role === 'admin' || role === 'super_admin') return;
            }
          }
        }
      } catch(_) {}

      location.replace('/maintenance.html');
    })
    .catch(() => { /* fail open */ });
  } catch(e) { /* fail open */ }
})();
// ==== END MAINTENANCE_GUARD_V1 ====

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

// ============================================
// AUTO-INJECT SOCIAL ICONS INTO FOOTER
// ============================================
(function() {
  function onReady(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  onReady(() => {
    window.addEventListener('siteSettingsLoaded', (e) => {
      const S = e.detail || {};
      const footer = document.querySelector('footer');
      if (!footer) return;
      if (footer.querySelector('#autoSocialLinks')) return;

      const socials = [
        { key: 'facebook',  label: 'Facebook',  color: '#1877F2', svg: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>' },
        { key: 'youtube',   label: 'YouTube',   color: '#FF0000', svg: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>' },
        { key: 'instagram', label: 'Instagram', color: '#E4405F', svg: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>' },
        { key: 'tiktok',    label: 'TikTok',    color: '#000000', svg: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>' },
        { key: 'twitter',   label: 'Twitter',   color: '#000000', svg: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>' },
        { key: 'telegram',  label: 'Telegram',  color: '#229ED9', svg: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>' }
      ];

      const active = socials.filter(s => S[s.key] && S[s.key].trim());

      const wrap = document.createElement('div');
      wrap.id = 'autoSocialLinks';
      wrap.className = 'mt-4';

      if (active.length === 0) {
        wrap.innerHTML = `
          <p class="text-sm font-semibold text-secondary mb-3">Follow Us</p>
          <p class="text-xs text-white/40">Social links coming soon</p>
        `;
      } else {
        wrap.innerHTML = `
          <p class="text-sm font-semibold text-secondary mb-3">Follow Us</p>
          <div class="flex gap-2 flex-wrap">
            ${active.map(s => `
              <a href="${S[s.key]}" target="_blank" rel="noopener" class="w-10 h-10 rounded-full bg-white/10 hover:bg-secondary hover:text-primary text-white flex items-center justify-center transition" title="${s.label}">
                ${s.svg}
              </a>
            `).join('')}
          </div>
        `;
      }

      // Insert into footer — find first column (logo column) and append
      const firstCol = footer.querySelector('div.grid > div, .grid > div, [class*="grid"] > div');
      if (firstCol) {
        firstCol.appendChild(wrap);
      } else {
        footer.appendChild(wrap);
      }
    });
  });
})();

// ============================================
// SEO META TAG INJECTION
// Applies settings from Super Admin → SEO page
// ============================================
(function() {
  function onReady(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  onReady(() => {
    window.addEventListener('siteSettingsLoaded', (e) => {
      const S = e.detail || {};

      function setMeta(attr, name, content) {
        if (!content) return;
        let tag = document.querySelector(`meta[${attr}="${name}"]`);
        if (!tag) {
          tag = document.createElement('meta');
          tag.setAttribute(attr, name);
          document.head.appendChild(tag);
        }
        tag.setAttribute('content', content);
      }

      // ---- Meta Title ----
      if (S.meta_title) document.title = S.meta_title;

      // ---- Standard Meta ----
      if (S.meta_description) setMeta('name', 'description', S.meta_description);
      if (S.meta_keywords) setMeta('name', 'keywords', S.meta_keywords);

      // ---- Open Graph ----
      if (S.og_title) setMeta('property', 'og:title', S.og_title);
      if (S.og_description) setMeta('property', 'og:description', S.og_description);
      if (S.og_image) setMeta('property', 'og:image', S.og_image);

      // ---- Twitter Card ----
      setMeta('name', 'twitter:card', 'summary_large_image');
      if (S.og_title) setMeta('name', 'twitter:title', S.og_title);
      if (S.og_description) setMeta('name', 'twitter:description', S.og_description);
      if (S.og_image) setMeta('name', 'twitter:image', S.og_image);

      // ---- Google Search Console Verification ----
      if (S.gsc_code) {
        const cleanCode = S.gsc_code.replace(/^google-site-verification=/, '');
        setMeta('name', 'google-site-verification', cleanCode);
      }
    });
  });
})();

// ============================================
// AUTO-INJECT PRICING LINK IN NAVIGATION
// ============================================
(function() {
  function onReady(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  onReady(() => {
    // Skip admin/student/teacher/super-admin/auth pages
    const path = window.location.pathname;
    if (path.match(/\/(admin|student|teacher|super-admin|auth)\//)) return;

    // ---- 1. Desktop Nav (before About) ----
    document.querySelectorAll('nav.hidden.lg\\:flex a[href="about.html"]').forEach(aboutLink => {
      if (aboutLink.parentElement.querySelector('a[href="pricing.html"]')) return;
      const p = document.createElement('a');
      p.href = 'pricing.html';
      p.className = 'text-primary/80 hover:text-secondary transition';
      p.textContent = 'Pricing';
      aboutLink.parentElement.insertBefore(p, aboutLink);
    });

    // ---- 2. Mobile Nav (before About) ----
    document.querySelectorAll('#mobileMenu nav a[href="about.html"]').forEach(aboutLink => {
      if (aboutLink.parentElement.querySelector('a[href="pricing.html"]')) return;
      const p = document.createElement('a');
      p.href = 'pricing.html';
      p.className = 'text-primary/80 py-2';
      p.textContent = 'Pricing';
      aboutLink.parentElement.insertBefore(p, aboutLink);
    });

    // ---- 3. Footer Quick Links (after Teachers) ----
    document.querySelectorAll('footer a[href="teachers.html"]').forEach(t => {
      const parentLi = t.parentElement;
      if (!parentLi || parentLi.tagName !== 'LI') return;
      if (parentLi.parentElement.querySelector('a[href="pricing.html"]')) return;
      const li = document.createElement('li');
      li.innerHTML = '<a href="pricing.html" class="hover:text-secondary transition">Pricing</a>';
      parentLi.parentElement.insertBefore(li, parentLi.nextSibling);
    });
  });
})();

// ============================================
// HERO BANNER AUTO-INJECT
// ============================================
(function() {
  function onReady(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  onReady(() => {
    window.addEventListener('siteSettingsLoaded', (e) => {
      const S = e.detail || {};
      if (!S.hero_banner_url) return;

      // Find hero image on home page (has alt "Child reading Quran")
      const heroImg = document.querySelector('img[alt*="Quran"], img[alt*="reading"], img[alt*="hero"]');
      if (heroImg && heroImg.src !== S.hero_banner_url) {
        heroImg.src = S.hero_banner_url;
      }
    });
  });
})();
