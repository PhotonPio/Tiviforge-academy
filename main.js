<!-- TiviForge Multi-Page v2.1 — GitHub Pages Ready -->

window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
if (typeof window.gtag !== 'function') {
  window.gtag = gtag;
}
gtag('js', new Date());
gtag('config', 'G-TIVIFORGE02', { send_page_view: true });

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

function trackCTA(name, location) {
  gtag('event', 'cta_click', { cta_name: name, cta_location: location });
}
function trackCalc(type, result) {
  gtag('event', 'calculator_use', { calc_type: type, result_value: result });
}
function trackForm(name, status) {
  gtag('event', 'form_interaction', { form_name: name, status });
}

if (typeof AOS !== 'undefined') {
  AOS.init({ duration: 700, easing: 'ease-out-cubic', once: true, offset: 80 });
}

const ring = document.getElementById('cursor-ring');
const dot  = document.getElementById('cursor-dot');
let mx = 0, my = 0, rx = 0, ry = 0;
if (ring && dot) {
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; dot.style.left = mx+'px'; dot.style.top = my+'px'; });
  (function animCursor() {
    rx += (mx - rx) * 0.14; ry += (my - ry) * 0.14;
    ring.style.left = rx+'px'; ring.style.top = ry+'px';
    requestAnimationFrame(animCursor);
  })();
}

const prog = document.getElementById('progress');
if (prog) {
  window.addEventListener('scroll', () => {
    const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    prog.style.width = Math.min(pct, 100) + '%';
  }, { passive: true });
}

const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
}
function closeMobile() {
  if (mobileMenu) mobileMenu.classList.remove('open');
}

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3200);
}

function toggleModule(header) {
  const item = header.parentElement;
  const wasOpen = item.classList.contains('open');
  document.querySelectorAll('.module-item').forEach(i => i.classList.remove('open'));
  if (!wasOpen) item.classList.add('open');
}

function switchTab(tab) {
  document.querySelectorAll('.calc-tab').forEach((t, i) => {
    t.classList.toggle('active', (i === 0 && tab === 'commission') || (i === 1 && tab === 'battery'));
  });
  const commissionTab = document.getElementById('tab-commission');
  const batteryTab = document.getElementById('tab-battery');
  if (commissionTab) commissionTab.classList.toggle('active', tab === 'commission');
  if (batteryTab) batteryTab.classList.toggle('active', tab === 'battery');
  const calcSection = document.getElementById('calculators');
  if (calcSection && (tab === 'battery' || tab === 'commission')) {
    setTimeout(() => calcSection.scrollIntoView({ behavior: 'smooth' }), 80);
  }
}

function fmt(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
function fmtW(n) { return '$' + n.toFixed(2) + ' / W'; }

function calcCommission() {
  const kwEl = document.getElementById('cc-kw');
  const ppwEl = document.getElementById('cc-ppw');
  const battEl = document.getElementById('cc-batt');
  const roofEl = document.getElementById('cc-roof');
  const otherEl = document.getElementById('cc-other');
  const adderRateEl = document.getElementById('cc-adder-rate');
  if (!kwEl || !ppwEl || !battEl || !roofEl || !otherEl || !adderRateEl) return;

  const kw        = parseFloat(kwEl.value) || 0;
  const ppw       = parseFloat(ppwEl.value) || 0;
  const batt      = parseFloat(battEl.value) || 0;
  const roof      = parseFloat(roofEl.value) || 0;
  const other     = parseFloat(otherEl.value) || 0;
  const adderRate = parseFloat(adderRateEl.value) || 0;
  const REDLINE   = 2.90;

  const watts       = kw * 1000;
  const baseSpread  = Math.max((ppw - REDLINE) * watts, 0);
  const totalAdders = batt + roof + other;
  const solarEarn   = Math.max(baseSpread - totalAdders, 0);
  const adderEarn   = totalAdders * (adderRate / 100);
  const totalEarn   = solarEarn + adderEarn;

  document.getElementById('r-base-spread').textContent      = fmt(baseSpread);
  document.getElementById('r-base-spread-sub').textContent  = `$${ppw.toFixed(2)} sold − $${REDLINE.toFixed(2)} redline × ${watts.toLocaleString()} W`;

  if (totalAdders > 0) {
    document.getElementById('r-adder-deduct').textContent    = '− ' + fmt(totalAdders);
    document.getElementById('r-adder-deduct-sub').textContent =
      [batt > 0 ? `Batt ${fmt(batt)}` : '', roof > 0 ? `Roof ${fmt(roof)}` : '', other > 0 ? `Other ${fmt(other)}` : '']
        .filter(Boolean).join(' + ') + ' — deducted from gross spread';
  } else {
    document.getElementById('r-adder-deduct').textContent    = '$0';
    document.getElementById('r-adder-deduct-sub').textContent = 'No adders entered';
  }

  document.getElementById('r-solar-earn').textContent = fmt(solarEarn);
  document.getElementById('r-solar-sub').textContent  = totalAdders > 0
    ? `${fmt(baseSpread)} gross − ${fmt(totalAdders)} adders`
    : '100% of $/W spread — no adders';

  document.getElementById('r-adder-earn').textContent = fmt(adderEarn);
  document.getElementById('r-adder-sub').textContent  = totalAdders > 0
    ? `${fmt(totalAdders)} × ${adderRate}% adder commission`
    : 'No adders entered';

  document.getElementById('r-earnings').textContent     = fmt(totalEarn);
  document.getElementById('r-earnings-sub').textContent = totalAdders > 0
    ? `${fmt(solarEarn)} solar + ${fmt(adderEarn)} adder commission`
    : '100% of $/W spread — add adders above to see full breakdown';

  if (totalEarn > 0) trackCalc('commission', Math.round(totalEarn));
}

const NEM3_SAVINGS_BOOST = {
  pge: 0.72, sce: 0.68, sdge: 0.76, ladwp: 0.60, smud: 0.64, other: 0.65
};
function calcBattery() {
  const kwEl = document.getElementById('bc-kw');
  const kwhEl = document.getElementById('bc-kwh');
  const utilityEl = document.getElementById('bc-utility');
  const billEl = document.getElementById('bc-bill');
  if (!kwEl || !kwhEl || !utilityEl || !billEl) return;

  const kw       = parseFloat(kwEl.value) || 0;
  const kwh      = parseFloat(kwhEl.value) || 9.6;
  const utility  = utilityEl.value;
  const bill     = parseFloat(billEl.value) || 0;

  const battCostPerKwh = 850;
  const battAdder = kwh * battCostPerKwh;

  const annualBill = bill * 12;
  const savingsNoBatt  = annualBill * 0.35;
  const boostFactor = NEM3_SAVINGS_BOOST[utility] || 0.65;
  const savingsWithBatt = annualBill * boostFactor;
  const incrementalSavings = Math.max(savingsWithBatt - savingsNoBatt, 0);

  const payback = incrementalSavings > 0 ? battAdder / incrementalSavings : 0;
  const adderCommissionRate = 0.143;
  const battCommission = battAdder * adderCommissionRate;

  document.getElementById('br-cost').textContent    = fmt(battAdder);
  document.getElementById('br-cost-sub').textContent = `${kwh} kWh × $${battCostPerKwh}/kWh — verify current Axia pricing`;
  document.getElementById('br-savings').textContent  = fmt(savingsWithBatt);
  document.getElementById('br-savings-sub').textContent = `vs. ${fmt(savingsNoBatt)} without battery (NEM 3.0 est.)`;
  document.getElementById('br-payback').textContent  = payback > 0 ? payback.toFixed(1) + ' yrs' : '—';
  document.getElementById('br-payback-sub').textContent = 'Battery adder ÷ incremental annual savings';
  document.getElementById('br-commission').textContent = fmt(battCommission);
  document.getElementById('br-commission-sub').textContent = `${fmt(battAdder)} × 14.3% adder commission rate`;
  if (battCommission > 0) trackCalc('battery', Math.round(battCommission));
}

async function submitApplication() {
  const fnameEl = document.getElementById('ap-fname');
  const lnameEl = document.getElementById('ap-lname');
  const phoneEl = document.getElementById('ap-phone');
  const emailEl = document.getElementById('ap-email');
  const cityEl  = document.getElementById('ap-city');
  const expEl   = document.getElementById('ap-exp');
  const hisEl   = document.getElementById('ap-his');
  const srcEl   = document.getElementById('ap-source');
  if (!fnameEl || !lnameEl || !phoneEl || !emailEl || !cityEl || !expEl || !hisEl || !srcEl) return;

  const fname = fnameEl.value.trim();
  const lname = lnameEl.value.trim();
  const phone = phoneEl.value.trim();
  const email = emailEl.value.trim();
  const city  = cityEl.value.trim();
  const exp   = expEl.value;
  const his   = hisEl.value;
  const src   = srcEl.value;

  if (!fname || !lname || !phone || !email || !city || !exp || !his) {
    showToast('Please complete all required fields.');
    return;
  }
  if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
    showToast('Please enter a valid email address.');
    return;
  }

  trackForm('rep_application', 'submit');
  trackCTA('Application Submit', 'apply_form');

  const btn = document.querySelector('.apply-submit');
  if (!btn) return;
  btn.textContent = 'Submitting…'; btn.disabled = true;

  try {
    const res = await fetch('https://formspree.io/f/xpwqqbqq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ fname, lname, phone, email, city, exp, his, source: src,
        _subject: `New TiviForge Academy Application — ${fname} ${lname}` })
    });
    if (res.ok) {
      document.getElementById('apply-form-content').style.display = 'none';
      document.getElementById('apply-success').classList.add('show');
      showToast('Application submitted — check your email!');
      trackForm('rep_application', 'success');
    } else {
      btn.textContent = 'Submit Application — Review in 24 Hours →'; btn.disabled = false;
      showToast('Submission error — email academy@tiviforge.com directly.');
    }
  } catch(e) {
    document.getElementById('apply-form-content').style.display = 'none';
    document.getElementById('apply-success').classList.add('show');
    showToast('Application received — we\'ll be in touch!');
  }
}

function submitBannerEmail(e) {
  e.preventDefault();
  const bannerEmailEl = document.getElementById('banner-email');
  if (!bannerEmailEl) return;
  const email = bannerEmailEl.value.trim();
  if (!email) return;
  fetch('https://formspree.io/f/xpwqqbqq', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ email, source: 'top_banner_pdf', _subject: 'TiviForge PDF Lead — Top Banner' })
  }).catch(() => {});
  const banner = document.getElementById('top-banner');
  if (banner) {
    banner.innerHTML =
      '<div style="font-family:var(--font-mono);font-size:0.65rem;letter-spacing:0.18em;text-transform:uppercase;color:var(--energy-green);padding:6px 0;text-align:center;width:100%;">✓ Commission Calculator PDF sent — check your inbox!</div>';
  }
  trackCTA('Banner PDF Submit', 'top_banner');
}

const DISABLE_EXIT_INTENT_POPUP = true;
let exitShown = false;

if (DISABLE_EXIT_INTENT_POPUP) {
  const popup = document.getElementById('exit-popup');
  if (popup) popup.remove();
} else {
  document.addEventListener('mouseleave', function(e) {
    if (e.clientY <= 0 && !exitShown && !sessionStorage.getItem('exitDismissed')) {
      exitShown = true;
      setTimeout(function() {
        const popup = document.getElementById('exit-popup');
        if (popup) popup.classList.add('show');
        trackCTA('Exit Intent Shown', 'exit_popup');
      }, 200);
    }
  });
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
  const exitEmailEl = document.getElementById('exit-email');
  if (!exitEmailEl) return;
  const email = exitEmailEl.value.trim();
  if (!email) return;
  fetch('https://formspree.io/f/xpwqqbqq', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ email, source: 'exit_intent_pdf', _subject: 'TiviForge PDF Lead — Exit Intent' })
  }).catch(() => {});
  const popupInner = document.querySelector('.exit-popup-inner');
  if (popupInner) {
    popupInner.innerHTML =
      '<div style="text-align:center;padding:24px 0;">' +
      '<div style="font-size:2.5rem;margin-bottom:14px;">☀️</div>' +
      '<p style="font-family:var(--font-display);font-size:1.6rem;color:var(--energy-green);margin-bottom:10px;">PDF Sent!</p>' +
      '<p style="font-size:0.85rem;color:var(--forge-ash);line-height:1.75;max-width:320px;margin:0 auto 20px;">Check your inbox for the $2.90/W Redline Calculator PDF. While you\'re here —</p>' +
      '<a href="apply.html" style="display:inline-block;padding:12px 28px;background:var(--solar-blue);color:#fff;font-family:var(--font-mono);font-size:0.65rem;letter-spacing:0.14em;text-transform:uppercase;" onclick="closeExitPopup()">Apply as a 1099 Rep →</a>' +
      '</div>';
  }
  trackCTA('Exit Popup PDF Submit', 'exit_popup');
}

const exitPopup = document.getElementById('exit-popup');
if (exitPopup && !DISABLE_EXIT_INTENT_POPUP) {
  exitPopup.addEventListener('click', function(e) {
    if (e.target === this) closeExitPopup();
  });
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && !DISABLE_EXIT_INTENT_POPUP) closeExitPopup();
});

/* ══════════════════════════════════════════════════════════════
   SUPABASE AUTH + RESOURCE GATING
   ── Step 1: Create a free project at supabase.com
   ── Step 2: Replace the two values below with yours
   ── Step 3: In Supabase → Authentication → Users, create:
              Email: tivi@tiviforge.com  |  Password: password
   ══════════════════════════════════════════════════════════════ */
const SUPABASE_URL     = 'https://kjeaaldcvrczakziwalp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqZWFhbGRjdnJjemFreml3YWxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MTQxMTQsImV4cCI6MjA4OTM5MDExNH0.vWt0x6aerAEvt93JfhzUrOIz0kiI2bHCLwLKW6Dkq7A';

let supabaseClient = null;

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  if (!window.supabase || !window.supabase.createClient) return null;
  if (SUPABASE_URL.includes('YOUR_PROJECT_REF') || SUPABASE_ANON_KEY.includes('YOUR_SUPABASE')) return null;
  try {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch(e) { return null; }
  return supabaseClient;
}

/* ── Resource Vault Gating ───────────────────────────────── */
function unlockVault(userEmail) {
  /* Show auth status bar */
  const bar = document.getElementById('resources-auth-bar');
  const msg = document.getElementById('resources-auth-msg');
  if (bar && msg) {
    msg.textContent = '✓ Logged in as ' + userEmail + ' — full vault unlocked';
    bar.style.display = 'block';
  }

  /* Hide the gate banner */
  const gateBanner = document.getElementById('vault-gate-banner');
  if (gateBanner) gateBanner.style.display = 'none';

  /* Unlock every vault card */
  document.querySelectorAll('.vault-card').forEach(card => {
    card.classList.add('unlocked');

    /* Swap lock icon → green check */
    const lockIcon = card.querySelector('.vault-lock-icon');
    if (lockIcon) lockIcon.textContent = '✓';

    /* Show download link, hide locked label */
    const lockedLabel = card.querySelector('.vault-locked-label');
    const dlLink      = card.querySelector('.vault-dl-link');
    if (lockedLabel) lockedLabel.style.display = 'none';
    if (dlLink)      dlLink.style.display = 'inline-flex';
  });

  /* Update nav login button to show logout */
  const navLoginBtn    = document.getElementById('nav-login-btn');
  const mobileLoginBtn = document.getElementById('mobile-login-btn');
  if (navLoginBtn)    { navLoginBtn.textContent = 'Logout'; navLoginBtn.href = '#'; navLoginBtn.onclick = () => { signOutUser(); return false; }; }
  if (mobileLoginBtn) { mobileLoginBtn.textContent = 'Logout'; mobileLoginBtn.href = '#'; mobileLoginBtn.onclick = () => { signOutUser(); return false; }; }
}

function lockVault() {
  /* Show apply CTA at the bottom */
  const applyCtaEl = document.getElementById('vault-apply-cta');
  if (applyCtaEl) applyCtaEl.style.display = 'block';
}

async function signOutUser() {
  const client = getSupabaseClient();
  if (client) await client.auth.signOut();
  window.location.reload();
}

/* ── Auth Flow (login/signup/dashboard/resource pages) ───── */
async function initAuthFlow() {
  const page   = document.body.dataset.page;
  if (!page) return;

  const client     = getSupabaseClient();
  const authStatus = document.getElementById('auth-status');

  /* ── Supabase not configured yet ── */
  if (!client) {
    if (authStatus) {
      authStatus.textContent = '⚙ Supabase not configured — set SUPABASE_URL and SUPABASE_ANON_KEY in assets/js/main.js.';
    }
    if (page === 'dashboard') {
      showToast('Supabase not configured. See setup guide.');
    }
    if (page === 'resources') lockVault();
    return;
  }

  /* ── Get current session ── */
  let session = null;
  try {
    const { data } = await client.auth.getSession();
    session = data.session;
  } catch(e) { session = null; }

  /* ── Page-specific routing ── */
  if (page === 'dashboard' && !session) {
    window.location.href = 'login.html'; return;
  }
  if (page === 'login' && session) {
    window.location.href = 'dashboard.html'; return;
  }

  /* ── Dashboard: show email ── */
  if (page === 'dashboard' && session) {
    const welcomeEl = document.getElementById('dashboard-email');
    if (welcomeEl) welcomeEl.textContent = session.user.email || 'Rep';
  }

  /* ── Resources: gate/ungate vault ── */
  if (page === 'resources') {
    if (session) {
      unlockVault(session.user.email);
    } else {
      lockVault();
    }
  }

  /* ── Login page form handlers ── */
  const loginForm  = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email    = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const submitBtn = loginForm.querySelector('.auth-submit');
      if (submitBtn) { submitBtn.textContent = 'Logging in…'; submitBtn.disabled = true; }

      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) {
        showToast('Login failed: ' + error.message);
        if (authStatus) authStatus.textContent = '✕ ' + error.message;
        if (submitBtn) { submitBtn.textContent = 'Login'; submitBtn.disabled = false; }
        return;
      }
      window.location.href = 'dashboard.html';
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email    = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value;
      const submitBtn = signupForm.querySelector('.auth-submit');
      if (submitBtn) { submitBtn.textContent = 'Creating…'; submitBtn.disabled = true; }

      const { error } = await client.auth.signUp({ email, password });
      if (error) {
        showToast('Sign up failed: ' + error.message);
        if (authStatus) authStatus.textContent = '✕ ' + error.message;
        if (submitBtn) { submitBtn.textContent = 'Create Account'; submitBtn.disabled = false; }
        return;
      }
      showToast('Account created! Check your email to confirm, then log in.');
      if (authStatus) authStatus.textContent = '✓ Account created — check email to confirm, then log in.';
      if (submitBtn) { submitBtn.textContent = 'Create Account'; submitBtn.disabled = false; }
    });
  }

  /* ── Logout button (dashboard nav) ── */
  const logoutBtn       = document.getElementById('logoutBtn');
  const logoutBtnMobile = document.getElementById('logoutBtnMobile');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await client.auth.signOut();
      window.location.href = 'login.html';
    });
  }
  if (logoutBtnMobile) {
    logoutBtnMobile.addEventListener('click', async () => {
      await client.auth.signOut();
      window.location.href = 'login.html';
    });
  }

  /* ── Auth state listener (session expiry, etc.) ── */
  client.auth.onAuthStateChange((_event, updatedSession) => {
    if (page === 'dashboard' && !updatedSession) {
      window.location.href = 'login.html';
    }
    if (page === 'resources') {
      if (updatedSession) {
        unlockVault(updatedSession.user.email);
      } else {
        window.location.reload();
      }
    }
  });
}

if (document.getElementById('cc-kw')) calcCommission();
if (document.getElementById('bc-kw')) calcBattery();
initAuthFlow();
