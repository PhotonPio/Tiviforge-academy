<!-- TiviForge Multi-Page v2.1 — GitHub Pages Ready -->
// ── AI Solar Coach ──
const SOLAR_SYSTEM_PROMPT = `You are the official TiviForge Solar Expert AI Coach for 1099 California solar sales representatives. You are helpful, direct, encouraging, and highly knowledgeable.

Always answer using only the $2.90/W redline for reps. Never mention, calculate, or hint at any owner override, internal margins, or higher redlines.

You are an expert on:
- Aurora Solar software (design best practices, sub-accounts, sales mode, common errors)
- All California utilities: PG&E, SCE, SDG&E, LADWP, SMUD, Anaheim Public Utilities, Pasadena Water & Power, Glendale Water & Power, Burbank Water & Power, and other municipals
- NEM 3.0 / Net Billing Tariff (current 2026 avoided-cost export rates ~$0.05–$0.08/kWh, TOU impacts, why batteries matter under NEM 3.0)
- Battery systems: sizing (5, 6.5, 9.6, 13.5 kWh), SGIP incentives, payback under NEM 3.0, Qcells/Axia battery options
- California energy bill reading, TOU rates, baseline allowances, savings calculations
- CSLB Home Improvement Salesperson (HIS) registration process (mandatory for solicitors)
- Solar Energy System Disclosure Document (16-pt bold requirement)
- Home Solicitation Sales Act (3-day rescission right)
- Title 24 basics and permitting
- California senior and elder consumer protections
- Compliant D2D sales practices

Be professional, specific, and actionable. Keep answers concise (3–5 sentences max unless detail is needed). If a rep asks about joining or getting access, direct them to Apply Now on the website.`;

let coachOpen = false;
let coachInitialized = false;
const coachMsgs = [];

function toggleCoach() {
  coachOpen = !coachOpen;
  const panel = document.getElementById('coach-panel');
  panel.classList.toggle('open', coachOpen);
  if (coachOpen && !coachInitialized) {
    coachInitialized = true;
    addCoachMsg("Hi! I'm your TiviForge Solar Coach. Ask me anything — Aurora setup, NEM 3.0, battery sizing, CSLB HIS registration, California utilities, or how to close more deals. What do you need?", 'assistant');
  }
}

function addCoachMsg(text, type) {
  const msgs = document.getElementById('coachMessages');
  const div  = document.createElement('div');
  div.className = `coach-msg ${type}`;
  const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  div.innerHTML = `<div class="coach-bubble">${text}</div><div class="coach-time">${t}</div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  coachMsgs.push({ role: type === 'user' ? 'user' : 'assistant', content: text });
}

function showCoachTyping() {
  const msgs = document.getElementById('coachMessages');
  const div  = document.createElement('div');
  div.className = 'coach-msg assistant'; div.id = 'coach-typing';
  div.innerHTML = `<div class="coach-bubble"><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}
function hideCoachTyping() { const t = document.getElementById('coach-typing'); if(t) t.remove(); }

async function askCoach(question) {
  if (!coachOpen) toggleCoach();
  document.getElementById('quickAsks').style.display = 'none';
  addCoachMsg(question, 'user');
  showCoachTyping();

  const messages = coachMsgs.slice(0, -1).map(m => ({ role: m.role, content: m.content }));
  messages.push({ role: 'user', content: question });

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: SOLAR_SYSTEM_PROMPT,
        messages: messages
      })
    });
    const data = await res.json();
    hideCoachTyping();
    const reply = data.content?.[0]?.text || getSolarFallback(question);
    addCoachMsg(reply, 'assistant');
  } catch(e) {
    hideCoachTyping();
    addCoachMsg(getSolarFallback(question), 'assistant');
  }
}

function sendCoachMessage() {
  const inp = document.getElementById('coachInput');
  const val = inp.value.trim();
  if (!val) return;
  inp.value = '';
  askCoach(val);
}

document.getElementById('coachInput').addEventListener('keypress', e => {
  if (e.key === 'Enter') sendCoachMessage();
});

function getSolarFallback(q) {
  const ql = q.toLowerCase();
  if (ql.includes('nem') || ql.includes('net billing')) return "Under NEM 3.0 (Net Billing Tariff), export credits are based on avoided cost — roughly $0.05–$0.08/kWh as of 2026, depending on your utility and time of export. That's why batteries are critical now: they shift more solar production to self-consumption instead of exporting at low rates. Want me to break down the math for a specific utility?";
  if (ql.includes('his') || ql.includes('cslb') || ql.includes('license')) return "CSLB HIS registration is required for any 1099 rep who solicits, negotiates, or sells home improvement contracts in California — that includes solar. Visit CSLB.gov, search 'Home Improvement Salesperson,' complete the application with a $50 fee, pass the background check, and you'll receive your HIS card. TiviForge provides a step-by-step PDF guide after enrollment.";
  if (ql.includes('battery') || ql.includes('sgip')) return "For NEM 3.0 customers, battery sizing depends on their daily usage pattern and TOU window. A 9.6 kWh battery (like the Qcells Q.SAVE) handles most average homes. SGIP incentives can offset up to $1,000+/kWh in higher tiers — file early as allocations go fast. Check the Battery Calculator on this page for deal-specific estimates.";
  if (ql.includes('aurora')) return "Aurora Solar is your proposal and design engine. Under your TiviForge sub-account, you'll model the roof in LIDAR, run shading analysis, and build a professional proposal in Sales Mode. The most common errors are incorrect roof pitch leading to overproduction estimates and panel placement in shaded zones — Aurora flags both if you use the shading simulation tool. Apply to get your sub-account credentials.";
  if (ql.includes('pge') || ql.includes('sce') || ql.includes('sdge') || ql.includes('utility')) return "Each California utility has different TOU rates and NEM 3.0 export schedules. SDG&E has the highest baseline rates ($0.40+/kWh tier 2), making solar ROI strongest there. SCE TOU-D-PRIME peaks 4–9pm, so battery dispatch timing is critical. PG&E E-TOU-C peaks 4–9pm with $0.42+/kWh peak rates. Want a breakdown of a specific utility?";
  return "Great question. I'm best at Aurora Solar design, NEM 3.0 / Net Billing Tariff, battery sizing and SGIP, CSLB HIS registration, California utility rates, CSLB compliance, and how to read California energy bills. Try asking me something specific and I'll give you the most useful answer I can. Or apply now at tiviforge.com to get full academy access.";
}
