/* ═══════════════════════════════════════════
   TiviForge main.js — v20260318c
   Fixes: commission calc IDs, banner one-time,
   academy unlock on login, Tesla PW3 battery,
   apply email CC
═══════════════════════════════════════════ */

/* ── Google Analytics ── */
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
if (typeof window.gtag !== 'function') { window.gtag = gtag; }
gtag('js', new Date());
gtag('config', 'G-TIVIFORGE02', { send_page_view: true });

/* ── Scroll depth tracking ── */
const scrollDepths = [25, 50, 75, 90, 100];
const firedDepths = new Set();
window.addEventListener('scroll', () => {
  const pct = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
  scrollDepths.forEach(d => {
    if (pct >= d && !firedDepths.has(d)) {
      firedDepths.add(d);
      gtag('event', 'scroll_depth', { depth_percentage: d });
    }
  });
}, { passive: true });

const pageStart = Date.now();
window.addEventListener('beforeunload', () => {
  gtag('event', 'engagement_time', { seconds: Math.round((Date.now() - pageStart) / 1000) });
});

function trackCTA(name, location) { gtag('event', 'cta_click', { cta_name: name, cta_location: location }); }
function trackCalc(type, result)  { gtag('event', 'calculator_use', { calc_type: type, result_value: result }); }
function trackForm(name, status)  { gtag('event', 'form_interaction', { form_name: name, status }); }

/* ── AOS Init ── */
if (typeof AOS !== 'undefined') {
  AOS.init({ duration: 700, easing: 'ease-out-cubic', once: true, offset: 80 });
}

/* ── Custom Cursor ── */
const ring = document.getElementById('cursor-ring');
const dot  = document.getElementById('cursor-dot');
let mx = 0, my = 0, rx = 0, ry = 0;
if (ring && dot) {
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
  });
  (function animCursor() {
    rx += (mx - rx) * 0.14; ry += (my - ry) * 0.14;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(animCursor);
  })();
}

/* ── Progress Bar ── */
const prog = document.getElementById('progress');
if (prog) {
  window.addEventListener('scroll', () => {
    const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    prog.style.width = Math.min(pct, 100) + '%';
  }, { passive: true });
}

/* ── Scrolled Nav ── */
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

/* ── Mobile Menu ── */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
}
function closeMobile() {
  if (mobileMenu) mobileMenu.classList.remove('open');
}

/* ── Toast ── */
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3600);
}

/* ── Module accordion ── */
function toggleModule(header) {
  const item    = header.parentElement;
  const wasOpen = item.classList.contains('open');
  document.querySelectorAll('.module-item').forEach(i => i.classList.remove('open'));
  if (!wasOpen) item.classList.add('open');
}

/* ── Calculator tab switch ── */
function switchTab(tab) {
  document.querySelectorAll('.calc-tab').forEach((t, i) => {
    t.classList.toggle('active', (i === 0 && tab === 'commission') || (i === 1 && tab === 'battery'));
  });
  const commTab = document.getElementById('tab-commission');
  const battTab = document.getElementById('tab-battery');
  if (commTab) commTab.classList.toggle('active', tab === 'commission');
  if (battTab) battTab.classList.toggle('active', tab === 'battery');
  const calcSection = document.getElementById('calculators');
  if (calcSection) {
    setTimeout(() => calcSection.scrollIntoView({ behavior: 'smooth' }), 80);
  }
}

/* ── Formatters ── */
function fmt(n)  { return '$' + Math.round(n).toLocaleString('en-US'); }
function fmtD(n) { return '$' + n.toFixed(2); }

/* ═══════════════════════════════════════════
   COMMISSION CALCULATOR — Fixed
   IDs match calculators.html:
   Inputs:  cc-kw, cc-ppw, cc-batt, cc-roof, cc-other, cc-split
   Outputs: r-total, r-total-sub, r-redline, r-redline-sub,
            r-margin, r-margin-sub, r-earnings, r-earnings-sub
═══════════════════════════════════════════ */
function calcCommission() {
  const kw    = parseFloat(document.getElementById('cc-kw')?.value)    || 0;
  const ppw   = parseFloat(document.getElementById('cc-ppw')?.value)   || 0;
  const batt  = parseFloat(document.getElementById('cc-batt')?.value)  || 0;
  const roof  = parseFloat(document.getElementById('cc-roof')?.value)  || 0;
  const other = parseFloat(document.getElementById('cc-other')?.value) || 0;
  const split = parseFloat(document.getElementById('cc-split')?.value) || 50;

  const REDLINE     = 2.90;
  const watts       = kw * 1000;
  const totalAdders = batt + roof + other;
  const solarValue  = ppw * watts;
  const totalContr  = solarValue + totalAdders;
  const redlineCost = REDLINE * watts;
  const grossSpread = Math.max((ppw - REDLINE) * watts, 0);
  const earnings    = grossSpread * (split / 100);

  const el = id => document.getElementById(id);

  if (el('r-total'))       el('r-total').textContent       = fmt(totalContr);
  if (el('r-total-sub'))   el('r-total-sub').textContent   =
    `${kw.toFixed(1)} kW × ${fmtD(ppw)}/W${totalAdders > 0 ? ' + ' + fmt(totalAdders) + ' adders' : ''}`;

  if (el('r-redline'))     el('r-redline').textContent     = fmt(redlineCost);
  if (el('r-redline-sub')) el('r-redline-sub').textContent = `${kw.toFixed(1)} kW × $2.90/W`;

  if (el('r-margin'))      el('r-margin').textContent      = fmt(grossSpread);
  if (el('r-margin-sub'))  el('r-margin-sub').textContent  =
    `($${ppw.toFixed(2)} − $2.90) × ${watts.toLocaleString()} W`;

  if (el('r-earnings'))    el('r-earnings').textContent    = fmt(earnings);
  if (el('r-earnings-sub'))el('r-earnings-sub').textContent=
    `${split}% of ${fmt(grossSpread)} gross margin`;

  if (earnings > 0) trackCalc('commission', Math.round(earnings));
}

/* ═══════════════════════════════════════════
   BATTERY CALCULATOR — Tesla Powerwall 3
   $11,500 per unit · 13.5 kWh each
   Inputs:  bc-kw, bc-quantity, bc-utility, bc-bill
   Outputs: br-units, br-kwh, br-cost, br-cost-sub,
            br-savings, br-savings-sub,
            br-payback, br-payback-sub,
            br-commission, br-commission-sub
═══════════════════════════════════════════ */
const PW3_KWH      = 13.5;
const PW3_PRICE    = 11500;
const ADDER_MARGIN = 0.143; // ~14.3% commission on battery adder

const UTILITY_BOOST = {
  pge: 0.72, sce: 0.68, sdge: 0.76, ladwp: 0.60, smud: 0.64, other: 0.65
};

function calcBattery() {
  const kw       = parseFloat(document.getElementById('bc-kw')?.value)       || 0;
  const qty      = parseInt(document.getElementById('bc-quantity')?.value)    || 1;
  const utility  = document.getElementById('bc-utility')?.value               || 'sce';
  const bill     = parseFloat(document.getElementById('bc-bill')?.value)      || 0;

  const safeQty    = Math.max(1, Math.min(qty, 10));
  const totalKwh   = safeQty * PW3_KWH;
  const battCost   = safeQty * PW3_PRICE;
  const annualBill = bill * 12;

  const savingsNoBatt  = annualBill * 0.35;
  const boostFactor    = UTILITY_BOOST[utility] || 0.65;
  const savingsWBatt   = annualBill * boostFactor;
  const incremental    = Math.max(savingsWBatt - savingsNoBatt, 0);

  const payback        = incremental > 0 ? battCost / incremental : 0;
  const battCommission = battCost * ADDER_MARGIN;

  const el = id => document.getElementById(id);

  if (el('br-units'))        el('br-units').textContent        = safeQty + (safeQty === 1 ? ' unit' : ' units');
  if (el('br-kwh'))          el('br-kwh').textContent          = totalKwh.toFixed(1) + ' kWh total';
  if (el('br-cost'))         el('br-cost').textContent         = fmt(battCost);
  if (el('br-cost-sub'))     el('br-cost-sub').textContent     =
    `${safeQty} × $${PW3_PRICE.toLocaleString()} — Tesla Powerwall 3`;
  if (el('br-savings'))      el('br-savings').textContent      = fmt(savingsWBatt);
  if (el('br-savings-sub'))  el('br-savings-sub').textContent  =
    `vs. ${fmt(savingsNoBatt)} without battery (NEM 3.0 est.)`;
  if (el('br-payback'))      el('br-payback').textContent      =
    payback > 0 ? payback.toFixed(1) + ' yrs' : '—';
  if (el('br-payback-sub'))  el('br-payback-sub').textContent  = 'Battery cost ÷ incremental annual savings';
  if (el('br-commission'))   el('br-commission').textContent   = fmt(battCommission);
  if (el('br-commission-sub'))el('br-commission-sub').textContent =
    `${fmt(battCost)} × 14.3% adder commission rate`;

  if (battCommission > 0) trackCalc('battery', Math.round(battCommission));
}

/* ═══════════════════════════════════════════
   APPLICATION FORM
   CC both emails in every Formspree POST
═══════════════════════════════════════════ */
async function submitApplication() {
  const fname  = document.getElementById('ap-fname')?.value.trim();
  const lname  = document.getElementById('ap-lname')?.value.trim();
  const phone  = document.getElementById('ap-phone')?.value.trim();
  const email  = document.getElementById('ap-email')?.value.trim();
  const city   = document.getElementById('ap-city')?.value.trim();
  const exp    = document.getElementById('ap-exp')?.value;
  const his    = document.getElementById('ap-his')?.value;
  const src    = document.getElementById('ap-source')?.value;

  if (!fname || !lname || !phone || !email || !city || !exp || !his) {
    showToast('Please complete all required fields.'); return;
  }
  if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
    showToast('Please enter a valid email address.'); return;
  }

  trackForm('rep_application', 'submit');
  trackCTA('Application Submit', 'apply_form');

  const btn = document.querySelector('.apply-submit');
  if (btn) { btn.textContent = 'Submitting…'; btn.disabled = true; }

  try {
    const res = await fetch('https://formspree.io/f/xpwqqbqq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        fname, lname, phone, email, city, exp, his, source: src,
        _subject: `New TiviForge Application — ${fname} ${lname}`,
        _cc: 'Tivi@tiviforge.com,photonscheduling@gmail.com',
        _replyto: email
      })
    });
    if (res.ok) {
      const formContent = document.getElementById('apply-form-content');
      const success     = document.getElementById('apply-success');
      if (formContent) formContent.style.display = 'none';
      if (success) success.classList.add('show');
      showToast('Application submitted — check your email!');
      trackForm('rep_application', 'success');
    } else {
      if (btn) { btn.textContent = 'Submit Application →'; btn.disabled = false; }
      showToast('Submission error — email Tivi@tiviforge.com directly.');
    }
  } catch (e) {
    const formContent = document.getElementById('apply-form-content');
    const success     = document.getElementById('apply-success');
    if (formContent) formContent.style.display = 'none';
    if (success) success.classList.add('show');
    showToast("Application received — we'll be in touch!");
  }
}

/* ═══════════════════════════════════════════
   TOP BANNER — One-time per browser
   Uses localStorage key tf_banner_seen
═══════════════════════════════════════════ */
(function initBanner() {
  const banner = document.getElementById('top-banner');
  if (!banner) return;

  // Already dismissed forever → remove immediately
  if (localStorage.getItem('tf_banner_seen')) {
    banner.remove(); return;
  }

  // Close button → dismiss forever
  const closeBtn = banner.querySelector('.top-banner-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      localStorage.setItem('tf_banner_seen', '1');
      banner.remove();
    });
  }
})();

function submitBannerEmail(e) {
  e.preventDefault();
  const emailEl = document.getElementById('banner-email');
  if (!emailEl) return;
  const email = emailEl.value.trim();
  if (!email) return;

  fetch('https://formspree.io/f/xpwqqbqq', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      email, source: 'top_banner_pdf',
      _subject: 'TiviForge PDF Lead — Top Banner',
      _cc: 'Tivi@tiviforge.com,photonscheduling@gmail.com'
    })
  }).catch(() => {});

  localStorage.setItem('tf_banner_seen', '1');

  const banner = document.getElementById('top-banner');
  if (banner) {
    banner.innerHTML =
      '<div style="font-family:var(--font-mono);font-size:0.65rem;letter-spacing:0.18em;text-transform:uppercase;' +
      'color:var(--energy-green);padding:6px 0;text-align:center;width:100%;">' +
      '✓ Commission Calculator PDF sent — check your inbox!</div>';
    setTimeout(() => banner.remove(), 4000);
  }
  trackCTA('Banner PDF Submit', 'top_banner');
}

/* ── Exit Intent (disabled) ── */
const DISABLE_EXIT_INTENT_POPUP = true;
let exitShown = false;

if (DISABLE_EXIT_INTENT_POPUP) {
  const popup = document.getElementById('exit-popup');
  if (popup) popup.remove();
}

function closeExitPopup() {
  if (DISABLE_EXIT_INTENT_POPUP) return;
  const popup = document.getElementById('exit-popup');
  if (popup) popup.classList.remove('show');
  sessionStorage.setItem('exitDismissed', '1');
}

function submitExitEmail(e) {
  if (DISABLE_EXIT_INTENT_POPUP) return;
  e.preventDefault();
  const emailEl = document.getElementById('exit-email');
  if (!emailEl) return;
  const email = emailEl.value.trim();
  if (!email) return;
  fetch('https://formspree.io/f/xpwqqbqq', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ email, source: 'exit_intent_pdf', _subject: 'TiviForge PDF Lead — Exit Intent',
      _cc: 'Tivi@tiviforge.com,photonscheduling@gmail.com' })
  }).catch(() => {});
  const inner = document.querySelector('.exit-popup-inner');
  if (inner) {
    inner.innerHTML =
      '<div style="text-align:center;padding:24px 0;">' +
      '<div style="font-size:2.5rem;margin-bottom:14px;">☀️</div>' +
      '<p style="font-family:var(--font-display);font-size:1.6rem;color:var(--energy-green);margin-bottom:10px;">PDF Sent!</p>' +
      '<a href="apply.html" style="display:inline-block;padding:12px 28px;background:var(--solar-blue);color:#fff;' +
      'font-family:var(--font-mono);font-size:0.65rem;letter-spacing:0.14em;text-transform:uppercase;" onclick="closeExitPopup()">Apply as a 1099 Rep →</a>' +
      '</div>';
  }
  trackCTA('Exit Popup PDF Submit', 'exit_popup');
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !DISABLE_EXIT_INTENT_POPUP) closeExitPopup();
});

/* ═══════════════════════════════════════════
   SUPABASE CONFIG
═══════════════════════════════════════════ */
const SUPABASE_URL      = 'https://kjeaaldcvrczakziwalp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqZWFhbGRjdnJjemFreml3YWxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MTQxMTQsImV4cCI6MjA4OTM5MDExNH0.vWt0x6aerAEvt93JfhzUrOIz0kiI2bHCLwLKW6Dkq7A';

let supabaseClient = null;
function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  if (!window.supabase?.createClient) return null;
  if (SUPABASE_URL.includes('YOUR_PROJECT_REF')) return null;
  try { supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY); }
  catch(e) { return null; }
  return supabaseClient;
}

/* ═══════════════════════════════════════════
   RESOURCE VAULT — unlock for logged-in reps
═══════════════════════════════════════════ */
function unlockVault(userEmail) {
  const bar = document.getElementById('resources-auth-bar');
  const msg = document.getElementById('resources-auth-msg');
  if (bar && msg) {
    msg.textContent = '✓ Logged in as ' + userEmail + ' — full vault unlocked';
    bar.style.display = 'block';
  }
  const gate = document.getElementById('vault-gate-banner');
  if (gate) gate.style.display = 'none';

  document.querySelectorAll('.vault-card').forEach(card => {
    card.classList.add('unlocked');
    const lockIcon    = card.querySelector('.vault-lock-icon');
    const lockedLabel = card.querySelector('.vault-locked-label');
    const dlLink      = card.querySelector('.vault-dl-link');
    if (lockIcon)    lockIcon.textContent = '✓';
    if (lockedLabel) lockedLabel.style.display = 'none';
    if (dlLink)      dlLink.style.display = 'inline-flex';
  });

  // Update nav login button
  ['nav-login-btn', 'mobile-login-btn'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = 'Logout';
      el.href = '#';
      el.onclick = (e) => { e.preventDefault(); signOutUser(); };
    }
  });
}

function lockVault() {
  const cta = document.getElementById('vault-apply-cta');
  if (cta) cta.style.display = 'block';
}

async function signOutUser() {
  const client = getSupabaseClient();
  if (client) await client.auth.signOut();
  window.location.reload();
}

/* ═══════════════════════════════════════════
   ACADEMY UNLOCK — called when rep is logged in
═══════════════════════════════════════════ */
function unlockAcademy(userEmail) {
  // Visual indicator
  const hero = document.querySelector('.page-hero');
  if (hero && !document.getElementById('academy-unlocked-bar')) {
    const bar = document.createElement('div');
    bar.id = 'academy-unlocked-bar';
    bar.style.cssText =
      'display:inline-block;margin-top:20px;padding:10px 20px;' +
      'border-left:3px solid var(--energy-green);background:rgba(0,204,102,0.07);' +
      'font-family:var(--font-mono);font-size:0.62rem;letter-spacing:0.16em;' +
      'text-transform:uppercase;color:var(--energy-green);';
    bar.textContent = '✓ Academy unlocked — logged in as ' + userEmail;
    hero.appendChild(bar);
  }

  // PDF map: module-num → actual PDF path
  const pdfMap = {
    '01': 'assets/docs/utility-rate-cheat-sheets.pdf',
    '02': 'assets/docs/nem3-full-summary-2026.pdf',
    '03': null, // link to calculator
    '04': 'assets/docs/axia-qcells-product-reference.pdf',
    '05': 'assets/docs/his-registration-guide.pdf',
    '06': 'assets/docs/utility-rate-cheat-sheets.pdf',
    '07': 'assets/docs/d2d-compliance-closing-scripts.pdf',
  };

  document.querySelectorAll('.module-item').forEach(item => {
    const numEl = item.querySelector('.module-num');
    const num   = numEl?.textContent?.trim();

    // Change "Start Module" button
    const primaryBtn = item.querySelector('.module-btn.primary');
    if (primaryBtn) {
      primaryBtn.textContent = '▶ Module Unlocked';
      primaryBtn.style.background = 'var(--energy-mid)';
      primaryBtn.onclick = () =>
        showToast('✓ Logged in — full video modules arriving Q2 2026. Use AI Coach for live support now.');
    }

    // Change PDF download buttons to real links
    item.querySelectorAll('.module-btn:not(.primary)').forEach(btn => {
      if (btn.tagName !== 'A') { // it's a button, convert to real download
        const pdf = pdfMap[num];
        if (pdf) {
          btn.onclick = () => {
            const a = document.createElement('a');
            a.href = pdf; a.download = ''; document.body.appendChild(a);
            a.click(); document.body.removeChild(a);
          };
          // Strip "after enrollment" text
          btn.textContent = btn.textContent
            .replace('available after enrollment', '→ Download PDF')
            .replace('unlocked after enrollment', '→ Download PDF');
        } else if (num === '03') {
          btn.onclick = () => { window.location.href = 'calculators.html'; };
          btn.textContent = '⚡ Open Battery Calculator';
        }
      }
    });
  });
}

/* ═══════════════════════════════════════════
   AUTH FLOW
═══════════════════════════════════════════ */
async function initAuthFlow() {
  const page       = document.body.dataset.page;
  const authStatus = document.getElementById('auth-status');
  const client     = getSupabaseClient();

  if (!client) {
    if (authStatus) authStatus.textContent = '⚙ Supabase not configured.';
    if (page === 'resources') lockVault();
    return;
  }

  let session = null;
  try { const { data } = await client.auth.getSession(); session = data.session; }
  catch(e) { session = null; }

  // Page routing
  if (page === 'dashboard' && !session) { window.location.href = 'login.html'; return; }
  if (page === 'login'     &&  session) { window.location.href = 'dashboard.html'; return; }

  // Dashboard welcome
  if (page === 'dashboard' && session) {
    const el = document.getElementById('dashboard-email');
    if (el) el.textContent = session.user.email || 'Rep';
  }

  // Resources vault
  if (page === 'resources') {
    if (session) unlockVault(session.user.email);
    else lockVault();
  }

  // Academy unlock
  if (page === 'academy' && session) {
    unlockAcademy(session.user.email);
  }

  // Login form handlers
  const loginForm  = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');

  if (loginForm) {
    loginForm.addEventListener('submit', async e => {
      e.preventDefault();
      const email    = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const btn      = loginForm.querySelector('.auth-submit');
      if (btn) { btn.textContent = 'Logging in…'; btn.disabled = true; }
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) {
        showToast('Login failed: ' + error.message);
        if (authStatus) authStatus.textContent = '✕ ' + error.message;
        if (btn) { btn.textContent = 'Login'; btn.disabled = false; }
        return;
      }
      window.location.href = 'dashboard.html';
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async e => {
      e.preventDefault();
      const email    = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value;
      const btn      = signupForm.querySelector('.auth-submit');
      if (btn) { btn.textContent = 'Creating…'; btn.disabled = true; }
      const { error } = await client.auth.signUp({ email, password });
      if (error) {
        showToast('Sign up failed: ' + error.message);
        if (authStatus) authStatus.textContent = '✕ ' + error.message;
        if (btn) { btn.textContent = 'Create Account'; btn.disabled = false; }
        return;
      }
      showToast('Account created! Check your email to confirm, then log in.');
      if (authStatus) authStatus.textContent = '✓ Account created — confirm email, then log in.';
      if (btn) { btn.textContent = 'Create Account'; btn.disabled = false; }
    });
  }

  // Logout buttons
  ['logoutBtn', 'logoutBtnMobile'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', async () => {
      await client.auth.signOut();
      window.location.href = 'login.html';
    });
  });

  // Auth state change listener
  client.auth.onAuthStateChange((_event, updatedSession) => {
    if (page === 'dashboard' && !updatedSession) window.location.href = 'login.html';
    if (page === 'resources') {
      if (updatedSession) unlockVault(updatedSession.user.email);
      else window.location.reload();
    }
    if (page === 'academy' && updatedSession) unlockAcademy(updatedSession.user.email);
  });
}

/* ── Init calculators if present ── */
if (document.getElementById('cc-kw')) calcCommission();
if (document.getElementById('bc-kw')) calcBattery();
initAuthFlow();
