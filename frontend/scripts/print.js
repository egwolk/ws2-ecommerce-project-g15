(function () {
  console.log('[print.js] script loaded');
  // Global click logger to verify clicks reach the page
  document.addEventListener('click', function (e) {
    var t = e.target;
    console.log('[print.js] document click on:', t && (t.id || t.tagName));
  }, true);
  function bindPrintButton() {
    var btn = document.getElementById('printReportBtn');
    if (!btn) {
      console.warn('[print.js] printReportBtn not found');
      return;
    }
    btn.addEventListener('click', function (e) {
      console.log('[print.js] Print button clicked');
      try {
        // Prevent any default navigation or interference
        e.preventDefault();
        e.stopPropagation();
        showBanner('Preparing print preview…');
        // Use a microtask to ensure UI thread is free
        setTimeout(function () {
          window.print();
        }, 0);
      } catch (err) {
        console.error('[print.js] Print call failed', err);
      }
    });
    console.log('[print.js] Print button bound');
  }

  // Fallback: event delegation in case the button is rendered later
  document.addEventListener('click', function (e) {
    var target = e.target;
    if (target && target.id === 'printReportBtn') {
      console.log('[print.js] Delegated click captured');
      try {
        e.preventDefault();
        e.stopPropagation();
        showBanner('Preparing print preview…');
        setTimeout(function () {
          window.print();
        }, 0);
      } catch (err) {
        console.error('[print.js] Delegated print failed', err);
      }
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      console.log('[print.js] DOMContentLoaded');
      bindPrintButton();
    });
  } else {
    console.log('[print.js] Document already loaded');
    bindPrintButton();
  }
  
  // Lightweight banner to confirm click; hidden in print via CSS .no-print
  function showBanner(message) {
    try {
      var existing = document.getElementById('print-banner');
      if (!existing) {
        existing = document.createElement('div');
        existing.id = 'print-banner';
        existing.className = 'no-print admin-message';
        existing.style.position = 'fixed';
        existing.style.bottom = '10px';
        existing.style.right = '10px';
        existing.style.zIndex = '2000';
        existing.style.backgroundColor = '#e6ffed';
        existing.style.color = 'green';
        existing.style.border = '1px solid green';
        existing.style.borderRadius = '4px';
        existing.style.padding = '8px 12px';
        existing.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
        document.body.appendChild(existing);
      }
      existing.textContent = message || 'Preparing print…';
      existing.style.display = 'block';
      // Auto-hide after a short delay
      setTimeout(function () {
        existing.style.display = 'none';
      }, 2500);
    } catch (e) {
      // Silent fail; banner is non-critical
      console.warn('[print.js] showBanner failed', e);
    }
  }
})();