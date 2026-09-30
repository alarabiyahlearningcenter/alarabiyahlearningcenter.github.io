// ==== CERTIFICATE_PDF_V1 ====
window.CertPDF = (function () {
  const CDN = {
    jspdf: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    qrcode: 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js'
  };

  function loadScript(src) {
    return new Promise((res, rej) => {
      if (document.querySelector(`script[src="${src}"]`)) return res();
      const s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  async function ensureLibs() {
    await Promise.all([loadScript(CDN.jspdf), loadScript(CDN.qrcode)]);
  }

  async function makeQrDataUrl(text) {
    return await window.QRCode.toDataURL(text, {
      width: 220, margin: 1, color: { dark: '#0A3622', light: '#FFFFFF' }
    });
  }

  function niceDate(iso) {
    return new Date(iso).toLocaleDateString('en-GB',
      { day: '2-digit', month: 'long', year: 'numeric' });
  }

  async function generate(cert, opts = {}) {
    await ensureLibs();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const W = 297, H = 210;

    // Outer border
    doc.setDrawColor(10, 54, 34);
    doc.setLineWidth(1.2);
    doc.rect(8, 8, W - 16, H - 16);

    // Inner gold border
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.5);
    doc.rect(11, 11, W - 22, H - 22);

    // Background cream
    doc.setFillColor(249, 247, 242);
    doc.rect(12, 12, W - 24, H - 24, 'F');

    // Header — Brand
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(10, 54, 34);
    doc.text('AL-ARABIYAH LEARNING CENTER', W / 2, 30, { align: 'center' });

    // Divider
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.8);
    doc.line(W / 2 - 40, 34, W / 2 + 40, 34);

    // Title
    doc.setFontSize(38);
    doc.setTextColor(10, 54, 34);
    doc.text('Certificate of Completion', W / 2, 58, { align: 'center' });

    // Subtitle
    doc.setFont('times', 'italic');
    doc.setFontSize(13);
    doc.setTextColor(80, 80, 80);
    doc.text('This is to certify that', W / 2, 76, { align: 'center' });

    // Student name
    doc.setFont('times', 'bolditalic');
    doc.setFontSize(32);
    doc.setTextColor(212, 175, 55);
    doc.text(cert.student_name || 'Student', W / 2, 98, { align: 'center' });

    // Name underline
    const nameW = doc.getTextWidth(cert.student_name || 'Student');
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.4);
    doc.line(W / 2 - nameW / 2, 102, W / 2 + nameW / 2, 102);

    // Course line
    doc.setFont('times', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(80, 80, 80);
    doc.text('has successfully completed', W / 2, 114, { align: 'center' });

    doc.setFont('times', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(10, 54, 34);
    doc.text(cert.course_name || 'Qur\'an Learning Course', W / 2, 128, { align: 'center' });

    // Footer left — date + cert id
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text('Issued on', 30, 168);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(10, 54, 34);
    doc.text(niceDate(cert.issued_at || new Date().toISOString()), 30, 175);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text('Certificate ID', 30, 184);
    doc.setFont('courier', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(10, 54, 34);
    doc.text(cert.certificate_id || cert.id || 'ALC-XXXX', 30, 190);

    // Footer right — signature line
    doc.setDrawColor(10, 54, 34);
    doc.setLineWidth(0.4);
    doc.line(W - 90, 180, W - 30, 180);
    doc.setFont('times', 'italic');
    doc.setFontSize(12);
    doc.setTextColor(10, 54, 34);
    doc.text('Director', W - 60, 187, { align: 'center' });

    // QR code — verify link
    const verifyUrl = (opts.verifyBase || 'https://alarabiyahlearningcenter.github.io/certificate-verification.html')
      + '?id=' + encodeURIComponent(cert.certificate_id || cert.id || '');
    try {
      const qr = await makeQrDataUrl(verifyUrl);
      doc.addImage(qr, 'PNG', W - 55, 130, 32, 32);
      doc.setFontSize(7);
      doc.setTextColor(120, 120, 120);
      doc.text('Scan to verify', W - 39, 166, { align: 'center' });
    } catch (e) { console.warn('[CertPDF] QR failed:', e); }

    // Watermark circle (subtle)
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.3);
    doc.circle(W / 2, 100, 42);

    return doc;
  }

  async function download(cert, opts = {}) {
    const doc = await generate(cert, opts);
    const safe = (s) => (s || '').replace(/[^a-z0-9\-]+/gi, '_').slice(0, 40);
    const fname = `ALC_Certificate_${safe(cert.student_name)}_${safe(cert.course_name)}.pdf`;
    doc.save(fname);
    return fname;
  }

  async function blob(cert, opts = {}) {
    const doc = await generate(cert, opts);
    return doc.output('blob');
  }

  async function upload(cert, db, opts = {}) {
    if (!db) return null;
    const b = await blob(cert, opts);
    const path = `${cert.student_id || 'unknown'}/${cert.certificate_id || cert.id}.pdf`;
    const { error } = await db.storage.from('certificates')
      .upload(path, b, { contentType: 'application/pdf', upsert: true });
    if (error) { console.warn('[CertPDF] upload:', error); return null; }
    const { data } = db.storage.from('certificates').getPublicUrl(path);
    const url = data?.publicUrl || null;
    if (url && db.from) {
      await db.from('certificates').update({
        pdf_url: url, pdf_generated_at: new Date().toISOString()
      }).eq('id', cert.id).catch(() => {});
    }
    return url;
  }

  return { generate, download, blob, upload };
})();
// ==== END CERTIFICATE_PDF_V1 ====
