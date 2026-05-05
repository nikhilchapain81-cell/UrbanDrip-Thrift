// ═══════════════════════════════════════════
// DATA LAYER
// ═══════════════════════════════════════════
const DB = {
  getOwners:    () => { try { return JSON.parse(localStorage.getItem('udt_owners') || '[]') } catch { return [] } },
  setOwners:    d => localStorage.setItem('udt_owners', JSON.stringify(d)),
  getCustomers: () => { try { return JSON.parse(localStorage.getItem('udt_customers') || '[]') } catch { return [] } },
  setCustomers: d => localStorage.setItem('udt_customers', JSON.stringify(d)),
  getItems:     () => { try { return JSON.parse(localStorage.getItem('udt_items') || '[]') } catch { return [] } },
  setItems:     d => localStorage.setItem('udt_items', JSON.stringify(d)),
}

// ═══════════════════════════════════════════
// SECURITY
// ═══════════════════════════════════════════
const MAX_OWNERS = 3, MAX_ATTEMPTS = 5, LOCKOUT_MS = 60000, SESSION_MS = 30 * 60 * 1000
let SESSION = null, attempts = 0, lockedUntil = 0
let currentRole = null, authMode = 'si', setupCount = 0
const pickLabels = ['Drop-off', 'We Pick Up', 'Courier', 'Shop Handover']
const SPLIT = 0.6

async function sha256(s) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, '0')).join('')
}
function genToken() {
  const a = new Uint8Array(32); crypto.getRandomValues(a)
  return Array.from(a).map(b => b.toString(16).padStart(2, '0')).join('')
}

// ═══════════════════════════════════════════
// BOOT
// ═══════════════════════════════════════════
function boot() {
  const owners = DB.getOwners()
  if (owners.length === 0) {
    show('sc-setup')
    updateSlots(0)
  } else {
    show('sc-login')
  }
}

// ═══════════════════════════════════════════
// OWNER SETUP
// ═══════════════════════════════════════════
function updateSlots(n) {
  for (let i = 0; i < 3; i++) {
    const d = document.getElementById('slot' + i)
    d.className = 'slot'
    if (i < n) { d.classList.add('done'); d.textContent = '✓' }
    else if (i === n) { d.classList.add('cur'); d.textContent = i + 1 }
    else { d.textContent = i + 1 }
  }
  const hints = ['👑 Registering <strong>Owner 1</strong> — required',
    '👑 Registering <strong>Owner 2</strong> — optional',
    '👑 Registering <strong>Owner 3</strong> — optional']
  document.getElementById('setup-hint').innerHTML = hints[n] || ''
  document.getElementById('setup-done-wrap').style.display = n >= 1 ? 'block' : 'none'
}

function chkStr() {
  const v = document.getElementById('setup-pass').value
  const fill = document.getElementById('str-fill')
  const lbl = document.getElementById('str-lbl')
  let s = 0
  if (v.length >= 6) s++; if (v.length >= 10) s++
  if (/[A-Z]/.test(v)) s++; if (/[0-9]/.test(v)) s++; if (/[^A-Za-z0-9]/.test(v)) s++
  const c = ['#dc2626','#dc2626','#ca8a04','#ca8a04','#16a34a']
  const l = ['Too weak','Weak','Fair','Good','Strong 💪']
  fill.style.width = (s * 20) + '%'; fill.style.background = c[Math.max(0, s - 1)]
  lbl.textContent = v.length ? l[Math.max(0, s - 1)] : ''
  lbl.style.color = c[Math.max(0, s - 1)]
}

function chkLoginStr() {
  const v = document.getElementById('lf-pass').value
  const fill = document.getElementById('ls-fill')
  const lbl = document.getElementById('ls-lbl')
  let s = 0
  if (v.length >= 6) s++; if (v.length >= 10) s++
  if (/[A-Z]/.test(v)) s++; if (/[0-9]/.test(v)) s++; if (/[^A-Za-z0-9]/.test(v)) s++
  const c = ['#dc2626','#dc2626','#ca8a04','#ca8a04','#16a34a']
  const l = ['Too weak','Weak','Fair','Good','Strong 💪']
  if (fill) { fill.style.width = (s * 20) + '%'; fill.style.background = c[Math.max(0, s - 1)] }
  if (lbl) { lbl.textContent = v.length ? l[Math.max(0, s - 1)] : ''; lbl.style.color = c[Math.max(0, s - 1)] }
}

async function doSetupRegister() {
  const owners = DB.getOwners()
  if (owners.length >= MAX_OWNERS) { toast('❌ Max 3 owners registered', '#ef4444'); return }
  const name = document.getElementById('setup-name').value.trim()
  const phone = document.getElementById('setup-phone').value.trim()
  const pass = document.getElementById('setup-pass').value
  const pass2 = document.getElementById('setup-pass2').value
  if (!name || !phone || !pass || !pass2) { toast('❌ Fill all fields', '#ef4444'); return }
  if (phone.length < 9) { toast('❌ Enter valid phone', '#ef4444'); return }
  if (pass.length < 6) { toast('❌ Password min 6 chars', '#ef4444'); return }
  if (pass !== pass2) { toast('❌ Passwords do not match', '#ef4444'); return }
  if (owners.find(o => o.phone === phone)) { toast('❌ Phone already registered', '#ef4444'); return }
  const hash = await sha256(pass)
  owners.push({ id: 'O' + (owners.length + 1), name, phone, passHash: hash, createdAt: Date.now() })
  DB.setOwners(owners)
  setupCount = owners.length
  ;['setup-name', 'setup-phone', 'setup-pass', 'setup-pass2'].forEach(id => document.getElementById(id).value = '')
  document.getElementById('str-fill').style.width = '0'
  document.getElementById('str-lbl').textContent = ''
  toast('✓ ' + name + ' registered as Owner ' + setupCount + '!', '#22c55e')
  updateSlots(setupCount)
  if (setupCount >= MAX_OWNERS) setTimeout(finishSetup, 800)
}

function finishSetup() {
  show('sc-login')
  toast('🎉 Setup done! Log in.', '#e8440a')
}

// ═══════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════
function selectRole(role) {
  currentRole = role; authMode = 'si'
  document.getElementById('step-role').style.display = 'none'
  document.getElementById('step-form').style.display = 'block'
  const isO = role === 'owner'
  document.getElementById('role-ind').innerHTML =
    '<div class="rbadge ' + (isO ? 'rb-o' : 'rb-c') + '" style="display:inline-flex;padding:6px 14px;border-radius:100px">' + (isO ? '👑 Owner' : '👕 Customer') + '</div>'
  if (isO) {
    document.getElementById('auth-toggle').style.display = 'none'
    document.getElementById('name-row').style.display = 'none'
    document.getElementById('confirm-row').style.display = 'none'
    document.getElementById('pass-row').style.display = 'block'
    document.getElementById('lf-hint').innerHTML = '🔒 Restricted — registered owners only.'
    const btn = document.getElementById('login-btn')
    btn.className = 'btn btn-rust'; btn.textContent = 'SIGN IN'
  } else {
    document.getElementById('auth-toggle').style.display = 'flex'
    document.getElementById('pass-row').style.display = 'block'
    switchTab('si')
  }
}

function switchTab(mode) {
  authMode = mode
  document.getElementById('tab-si').className = 'atab' + (mode === 'si' ? ' atab-on' : '')
  document.getElementById('tab-su').className = 'atab' + (mode === 'su' ? ' atab-on' : '')
  document.getElementById('name-row').style.display = mode === 'su' ? 'block' : 'none'
  document.getElementById('confirm-row').style.display = mode === 'su' ? 'block' : 'none'
  document.getElementById('lf-hint').innerHTML = mode === 'si' ? '👕 Sign in to your account.' : '✨ Create your free account.'
  const btn = document.getElementById('login-btn')
  btn.className = 'btn btn-blue'
  btn.textContent = mode === 'si' ? 'SIGN IN' : 'CREATE ACCOUNT →'
  if (mode === 'su') document.getElementById('lf-pass').oninput = chkLoginStr
}

function backToRoles() {
  document.getElementById('step-role').style.display = 'block'
  document.getElementById('step-form').style.display = 'none'
  ;['lf-phone', 'lf-pass', 'lf-pass2', 'lf-name'].forEach(id => { const el = document.getElementById(id); if (el) el.value = '' })
  document.getElementById('lf-hint').innerHTML = ''
}

async function doLogin() {
  const phone = (document.getElementById('lf-phone').value || '').trim()
  const pass = document.getElementById('lf-pass').value
  if (!phone) { toast('❌ Enter your phone number', '#ef4444'); return }

  if (currentRole === 'owner') {
    if (Date.now() < lockedUntil) { toast('🔒 Locked ' + Math.ceil((lockedUntil - Date.now()) / 1000) + 's', '#ef4444'); return }
    if (!pass) { toast('❌ Enter password', '#ef4444'); return }
    const owners = DB.getOwners()
    const owner = owners.find(o => o.phone === phone)
    if (!owner) { ownerFail(); toast('❌ Phone not registered. ' + (MAX_ATTEMPTS - attempts) + ' left.', '#ef4444'); return }
    const hash = await sha256(pass)
    if (hash !== owner.passHash) { ownerFail(); if (MAX_ATTEMPTS - attempts > 0) toast('❌ Wrong password. ' + (MAX_ATTEMPTS - attempts) + ' left.', '#ef4444'); return }
    attempts = 0
    SESSION = { role: 'owner', name: owner.name, id: owner.id, token: genToken(), expiry: Date.now() + SESSION_MS }
    enterOwner(owner.name)
    return
  }

  if (authMode === 'si') {
    if (!pass) { toast('❌ Enter password', '#ef4444'); return }
    const customers = DB.getCustomers()
    const cust = customers.find(c => c.phone === phone)
    if (!cust) { toast('❌ No account. Sign Up first.', '#ef4444'); switchTab('su'); return }
    const hash = await sha256(pass)
    if (hash !== cust.passHash) { toast('❌ Wrong password.', '#ef4444'); return }
    SESSION = { role: 'customer', name: cust.name, phone: cust.phone, id: cust.id, token: genToken(), expiry: Date.now() + SESSION_MS }
    enterCustomer(cust.name)
    return
  }

  const name = (document.getElementById('lf-name').value || '').trim()
  const pass2 = document.getElementById('lf-pass2').value
  if (!name) { toast('❌ Enter your name', '#ef4444'); return }
  if (!pass || pass.length < 6) { toast('❌ Password min 6 chars', '#ef4444'); return }
  if (pass !== pass2) { toast('❌ Passwords do not match', '#ef4444'); return }
  const customers = DB.getCustomers()
  if (customers.find(c => c.phone === phone)) { toast('❌ Phone registered. Sign In.', '#ef4444'); switchTab('si'); return }
  const hash = await sha256(pass)
  const nc = { id: 'C' + (customers.length + 1), name, phone, passHash: hash, createdAt: Date.now() }
  customers.push(nc); DB.setCustomers(customers)
  SESSION = { role: 'customer', name, phone, id: nc.id, token: genToken(), expiry: Date.now() + SESSION_MS }
  toast('✓ Welcome, ' + name + '! 🎉', '#22c55e')
  enterCustomer(name)
}

function ownerFail() {
  attempts++
  if (attempts >= MAX_ATTEMPTS) {
    lockedUntil = Date.now() + LOCKOUT_MS; attempts = 0
    const h = document.getElementById('lf-hint')
    const t = setInterval(() => {
      const r = Math.ceil((lockedUntil - Date.now()) / 1000)
      if (r <= 0) { clearInterval(t); h.innerHTML = '🔒 Restricted — registered owners only.' }
      else h.innerHTML = '🔴 <strong style="color:#ef4444">Locked ' + r + 's</strong>'
    }, 1000)
    toast('🔒 Too many attempts — 60s lockout', '#ef4444')
  }
}

function guardOwner() {
  if (!SESSION || SESSION.role !== 'owner') { forceLogout('Session invalid.'); return false }
  if (Date.now() > SESSION.expiry) { forceLogout('Session expired.'); return false }
  SESSION.expiry = Date.now() + SESSION_MS
  return true
}

function forceLogout(msg) {
  SESSION = null
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'))
  document.getElementById('owner-nav').style.display = 'none'
  document.getElementById('customer-nav').style.display = 'none'
  backToRoles(); show('sc-login')
  if (msg) setTimeout(() => toast('🔒 ' + msg, '#ef4444'), 200)
}

function logout() {
  SESSION = null
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'))
  document.getElementById('owner-nav').style.display = 'none'
  document.getElementById('customer-nav').style.display = 'none'
  backToRoles(); show('sc-login')
  toast('👋 Logged out', '#777')
}

// ═══════════════════════════════════════════
// ENTER APP
// ═══════════════════════════════════════════
function enterOwner(name) {
  show('o-home')
  document.getElementById('owner-nav').style.display = 'flex'
  document.getElementById('o-badge').textContent = '👑 ' + name
  buildOwnerData()
  toast('👑 Welcome back, ' + name + '!', '#e8440a')
}

function enterCustomer(name) {
  show('c-home')
  document.getElementById('customer-nav').style.display = 'flex'
  document.getElementById('c-badge').textContent = '👕 ' + name
  buildCustomerData()
  toast('👋 Welcome, ' + name + '!', '#3b82f6')
}

// ═══════════════════════════════════════════
// LISTINGS DATA
// ═══════════════════════════════════════════
const LISTINGS = [
  { id:1, brand:'Nike', name:'Tech Fleece Hoodie', size:'M', cond:9, price:1200, img:'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=300&q=80', badge:'NEW', consigner:'Raju', type:'Individual', desc:'Barely worn, no stains.' },
  { id:2, brand:'Supreme', name:'Box Logo Tee', size:'L', cond:8, price:2500, img:'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300&q=80', badge:'HOT', consigner:'StyleShop', type:'Shop', desc:'Authentic. Slight fade.' },
  { id:3, brand:"Levi's", name:'501 Denim Jeans', size:'32x30', cond:9, price:800, img:'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=300&q=80', badge:'', consigner:'Priya', type:'Individual', desc:'Classic indigo. Very good.' },
  { id:4, brand:'Adidas', name:'Campus 00s', size:'UK 9', cond:8, price:3000, img:'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=300&q=80', badge:'', consigner:'StyleShop', type:'Shop', desc:'Clean. Minor sole yellowing.' },
  { id:5, brand:'New Era', name:'59FIFTY Cap', size:'7 3/8', cond:9, price:650, img:'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=120&q=80', badge:'', consigner:'Raju', type:'Individual', desc:'Like new.' },
  { id:6, brand:'H&M', name:'Oversized Hoodie', size:'XL', cond:8, price:950, img:'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=120&q=80', badge:'', consigner:'StyleShop', type:'Shop', desc:'Cream, super soft.' },
]

function ccls(c) { return c >= 9 ? 'cg' : c >= 8 ? 'cy' : 'cr' }

function buildHrow(items, id) {
  const el = document.getElementById(id); if (!el) return
  el.innerHTML = items.slice(0, 4).map(l => `
    <div class="hcard" onclick="openDel()">
      <div class="hcard-wrap">
        <img class="hcard-img" src="${l.img}" alt="" loading="lazy">
        ${l.badge ? `<div class="hbadge ${l.badge === 'NEW' ? 'bn' : 'bh'}">${l.badge}</div>` : ''}
      </div>
      <div class="hbody">
        <div class="hbrand">${l.brand}</div>
        <div class="hname">${l.name}</div>
        <div class="hsz">${l.size} · ${l.cond}/10</div>
        <div class="hprice">Rs. ${l.price.toLocaleString()}</div>
      </div>
    </div>`).join('')
}

function buildLlist(items, id) {
  const el = document.getElementById(id); if (!el) return
  el.innerHTML = items.map(l => `
    <div class="litem" onclick="openDel()">
      <img class="li-img" src="${l.img}" alt="" loading="lazy">
      <div class="li-info">
        <div class="li-brand">${l.brand}</div>
        <div class="li-name">${l.name}</div>
        <div class="li-sub">${l.size} · ${l.consigner}</div>
      </div>
      <div class="li-right">
        <div class="li-price">Rs.${l.price.toLocaleString()}</div>
        <div class="cond ${ccls(l.cond)}">${l.cond}/10</div>
      </div>
    </div>`).join('')
}

function openDel() { openModal('deliveryModal') }

// ═══════════════════════════════════════════
// OWNER DATA
// ═══════════════════════════════════════════
const QUEUE = [
  { id:'qi1', photo:'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=120&q=80', from:'🏪 StyleShop · Token #ST-44', name:'Zara Oversized Blazer', meta:'Size M · Rs.1,500', when:'2 hrs ago · Shop Handover', send:'Shop Handover', imgs:['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=120&q=80','https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=120&q=80'], crits:[1,1,0,1] },
  { id:'qi2', photo:'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=120&q=80', from:'👤 Suman Thapa', name:'Nike Air Force 1', meta:'UK 9 · Rs.2,800', when:'5 hrs ago · We Pick Up', send:'We Pick Up · Pokhara-6', imgs:['https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=120&q=80'], crits:[1,1,1,1] },
  { id:'qi3', photo:'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=120&q=80', from:'👤 Aarti KC', name:'Generic Knit Scarf', meta:'One Size · Rs.200', when:'1 day ago · Drop-off', send:'Drop-off', imgs:['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=120&q=80'], crits:[0,1,0,0] },
]

let pendingCount = 3

function buildOwnerData() {
  buildHrow(LISTINGS, 'o-hrow')
  buildLlist(LISTINGS.slice(4), 'o-llist')
  buildCurate()
  buildInvActive()
  buildInvUnsold()
  buildInvSold()
  buildOwnerDeals()
  buildAlerts()
}

function buildCurate() {
  const el = document.getElementById('curate-list')
  el.innerHTML = QUEUE.map(q => {
    const score = Math.round(q.crits.filter(Boolean).length / 4 * 100)
    const sc = score >= 75 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444'
    return `<div class="qi" id="${q.id}">
      <div class="qi-top">
        <img class="qi-photo" src="${q.photo}" alt="">
        <div>
          <div class="qi-from">${q.from}</div>
          <div class="qi-name">${q.name}</div>
          <div class="qi-meta">${q.meta}</div>
          <div class="qi-when">⏱ ${q.when}</div>
        </div>
      </div>
      <div class="qi-imgs">${q.imgs.map(i => `<img class="qi-thumb" src="${i}" alt="">`).join('')}</div>
      <div class="qi-send">📦 Send: <strong>${q.send}</strong></div>
      <div class="crit-wrap">
        <div class="crit-row"><div class="crit-l">🎨 Style / Streetwear</div><div class="tog${q.crits[0] ? ' on' : ''}" onclick="togCrit(this,'${q.id}')"></div></div>
        <div class="crit-row"><div class="crit-l">✅ Condition</div><div class="tog${q.crits[1] ? ' on' : ''}" onclick="togCrit(this,'${q.id}')"></div></div>
        <div class="crit-row"><div class="crit-l">🏷️ Brand & Look</div><div class="tog${q.crits[2] ? ' on' : ''}" onclick="togCrit(this,'${q.id}')"></div></div>
        <div class="crit-row"><div class="crit-l">📈 Demand</div><div class="tog${q.crits[3] ? ' on' : ''}" onclick="togCrit(this,'${q.id}')"></div></div>
      </div>
      <div class="q-score">
        <span class="qs-lbl">Score</span>
        <div class="qs-bar"><div class="qs-fill" id="qf-${q.id}" style="width:${score}%;background:${sc}"></div></div>
        <span class="qs-pct" id="qp-${q.id}" style="color:${sc}">${score}%</span>
      </div>
      <div class="vrow">
        <button class="vbtn vrej" onclick="doVerdict('${q.id}','reject')">✕ Reject</button>
        <button class="vbtn vacc" onclick="doVerdict('${q.id}','accept')">✓ Accept & List</button>
      </div>
    </div>`
  }).join('')
}

function lcHTML(stage, warn, ok) {
  const states = Array.from({ length: 5 }, (_, i) => i < stage ? (ok ? 'ok' : 'done') : i === stage ? (warn ? 'warn' : ok ? 'ok' : 'cur') : '')
  const lines = Array.from({ length: 4 }, (_, i) => i < stage ? (ok ? 'ok' : 'done') : i === stage && warn ? 'warn' : '')
  const track = states.map((s, i) => (i < 4 ? `<div class="lcd ${s}"></div><div class="lcl ${lines[i]}"></div>` : `<div class="lcd ${s}"></div>`)).join('')
  const lbls = ['Received','Curated','Listed','Sold','Done'].map((l, i) => {
    let style = ''
    if (i === stage && warn) style = 'color:#ef4444'
    else if (i === stage && ok) style = 'color:#22c55e'
    else if (i === stage) style = 'color:#e8440a'
    return `<span style="${style}">${warn && i === stage ? '⚠️ Unsold' : ok && i === 4 ? 'Done ✓' : l}</span>`
  }).join('')
  return `<div class="lc"><div class="lc-track">${track}</div><div class="lc-lbls">${lbls}</div></div>`
}

function buildInvActive() {
  const el = document.getElementById('inv-active')
  el.innerHTML = LISTINGS.slice(0, 3).map(l => `
    <div class="icard">
      <div class="ic-top">
        <img class="ic-img" src="${l.img}" alt="">
        <div><div class="ic-name">${l.name}</div><div class="ic-sub">${l.consigner === 'StyleShop' ? '🏪' : '👤'} ${l.consigner} · ${l.size}</div></div>
        <div style="margin-left:auto;text-align:right"><div class="ic-price">Rs.${l.price.toLocaleString()}</div><div class="ic-days">12 days</div></div>
      </div>
      ${lcHTML(2, false, false)}
      <div class="ic-actions">
        <button class="ia ia-sold" onclick="markSold(this)">✓ Sold</button>
        <button class="ia ia-low" onclick="toast('💸 Price reduced!','#eab308')">↓ Lower</button>
        <button class="ia ia-msg" onclick="toast('📣 Notified!','#3b82f6')">Notify</button>
      </div>
    </div>`).join('')
}

function buildInvUnsold() {
  const el = document.getElementById('inv-unsold')
  const unsold = [{ ...LISTINGS[5], days: 34 }, { ...LISTINGS[4], days: 31 }]
  el.innerHTML = `<div class="unsold-warn"><div class="uw-t">⚠️ 30-Day Unsold Policy</div><div class="uw-s">Items past 30 days must be returned, relisted, or consigner notified.</div></div>` +
    unsold.map(l => `
      <div class="icard warn">
        <div class="ic-top">
          <img class="ic-img" src="${l.img}" alt="">
          <div><div class="ic-name">${l.name}</div><div class="ic-sub">${l.consigner === 'StyleShop' ? '🏪' : '👤'} ${l.consigner} · ${l.size}</div></div>
          <div style="margin-left:auto;text-align:right"><div class="ic-price" style="color:#ef4444">Rs.${l.price.toLocaleString()}</div><div class="ic-days red">⏱ ${l.days} days</div></div>
        </div>
        ${lcHTML(3, true, false)}
        <div class="ic-actions">
          <button class="ia ia-ret" onclick="openModal('returnModal')">↩ Return</button>
          <button class="ia ia-low" onclick="toast('💸 Price reduced!','#eab308')">↓ Relist</button>
          <button class="ia ia-msg" onclick="toast('📣 Notified!','#3b82f6')">Notify</button>
        </div>
      </div>`).join('')
}

function buildInvSold() {
  const el = document.getElementById('inv-sold')
  el.innerHTML = [LISTINGS[3], LISTINGS[0]].map(l => `
    <div class="icard">
      <div class="ic-top">
        <img class="ic-img" src="${l.img}" alt="">
        <div><div class="ic-name">${l.name}</div><div class="ic-sub">${l.consigner === 'StyleShop' ? '🏪' : '👤'} ${l.consigner}</div></div>
        <div style="margin-left:auto;text-align:right"><div class="ic-price" style="color:#22c55e">Rs.${l.price.toLocaleString()}</div><div class="ic-days" style="color:#22c55e">✓ Sold</div></div>
      </div>
      ${lcHTML(4, false, true)}
      <div style="padding:0 12px 12px;font-size:11px;color:#4a4a4a">Split paid · 50/50 with ${l.consigner}</div>
    </div>`).join('')
}

const DEALS = [
  { name:'Adidas Campus 00s', from:'🏪 StyleShop', img:LISTINGS[3].img, split:50, price:3000, status:'sold', cut:'Rs.1,500', their:'Rs.1,500', note:'COD · May 1' },
  { name:'Nike Tech Fleece', from:'👤 Raju', img:LISTINGS[0].img, split:40, price:1200, status:'sold', cut:'Rs.480', their:'Rs.720', note:'Meet-up · Apr 28' },
  { name:'Zara Oversized Blazer', from:'🏪 StyleShop', img:LISTINGS[5].img, split:0, price:1500, status:'unsold', cut:'', their:'', note:'34 days — return pending' },
]

function buildOwnerDeals() {
  const el = document.getElementById('o-deals')
  el.innerHTML = DEALS.map(d => `
    <div class="deal-card">
      <div class="dc-top">
        <img class="dc-img" src="${d.img}" alt="">
        <div><div class="dc-name">${d.name}</div><div class="dc-from">${d.from}</div></div>
        <div class="dc-badge ${d.status === 'sold' ? 'dbs' : d.status === 'unsold' ? 'dbr' : 'dba'}">${d.status.toUpperCase()}</div>
      </div>
      <div class="sbar"><div class="sfill" style="width:${d.split}%"></div></div>
      <div class="slbls">
        <span class="sm-r">${d.status === 'sold' ? 'My cut: ' + d.cut : d.status === 'unsold' ? '⚠️ No sale' : 'Pending'}</span>
        <span class="sth">${d.status === 'sold' ? d.from.split('·')[0] + ': ' + d.their : ''}</span>
      </div>
      <div class="snote">Listed Rs.${d.price.toLocaleString()} · ${d.note}</div>
    </div>`).join('')
}

function buildAlerts() {
  const el = document.getElementById('notif-list')
  el.innerHTML = `
    <div class="nitem unread">
      <div class="ni-ico ico-ret">📦</div>
      <div><div class="ni-title">Return Needed: Zara Blazer</div><div class="ni-sub">Unsold 34 days. Action required.</div><div class="ni-time">2 hours ago</div>
      <div class="ni-act" onclick="goOwner('o-inventory');oNav(2);switchInv('unsold')">Review →</div></div>
    </div>
    <div class="nitem unread">
      <div class="ni-ico ico-pend">⏱</div>
      <div><div class="ni-title">3 Items in Curation Queue</div><div class="ni-sub">Submissions awaiting review.</div><div class="ni-time">5 hours ago</div>
      <div class="ni-act" onclick="goOwner('o-curate');oNav(1)">Curate Now →</div></div>
    </div>
    <div class="nitem">
      <div class="ni-ico ico-sold">🎉</div>
      <div><div class="ni-title">SOLD: Adidas Campus 00s</div><div class="ni-sub">Rs.3,000 sold. Your cut: Rs.1,500.</div><div class="ni-time">Yesterday</div></div>
    </div>`
}

function togCrit(el, qid) {
  if (!guardOwner()) return
  el.classList.toggle('on')
  const card = document.getElementById(qid)
  const on = [...card.querySelectorAll('.tog')].filter(t => t.classList.contains('on')).length
  const pct = Math.round(on / 4 * 100)
  const c = pct >= 75 ? '#22c55e' : pct >= 50 ? '#eab308' : '#ef4444'
  const fill = document.getElementById('qf-' + qid); const lbl = document.getElementById('qp-' + qid)
  if (fill) { fill.style.width = pct + '%'; fill.style.background = c }
  if (lbl) { lbl.textContent = pct + '%'; lbl.style.color = c }
}

function doVerdict(qid, type) {
  if (!guardOwner()) return
  const card = document.getElementById(qid)
  card.classList.add(type === 'accept' ? 'acc' : 'rej')
  toast(type === 'accept' ? '✓ Accepted & listed!' : '✕ Rejected.', type === 'accept' ? '#22c55e' : '#ef4444')
  setTimeout(() => {
    card.style.transition = 'all .3s'
    card.style.maxHeight = '0'; card.style.overflow = 'hidden'; card.style.opacity = '0'; card.style.marginBottom = '0'
    pendingCount--
    document.getElementById('cs-pend').textContent = pendingCount
    document.getElementById('q-badge').textContent = pendingCount + ' Pending'
    setTimeout(() => { card.remove(); if (pendingCount <= 0) document.getElementById('curate-empty').style.display = 'block' }, 320)
  }, 380)
}

function markSold(btn) {
  if (!guardOwner()) return
  const item = btn.closest('.icard')
  item.querySelectorAll('.lcd').forEach(d => { d.className = 'lcd ok' })
  item.querySelectorAll('.lcl').forEach(l => { l.className = 'lcl ok' })
  btn.closest('.ic-actions').innerHTML = '<div style="font-size:12px;color:#22c55e;font-weight:700;padding:4px 12px 12px">✓ Marked Sold — split processing</div>'
  toast('🎉 Item sold! Profit split initiated.', '#22c55e')
}

// ═══════════════════════════════════════════
// CUSTOMER DATA
// ═══════════════════════════════════════════
function buildCustomerData() {
  buildHrow(LISTINGS, 'c-hrow')
  buildLlist(LISTINGS.slice(4), 'c-llist')
  updateCustomerStats()
  buildMyItems()
  buildEarnings()
}

function updateCustomerStats() {
  if (!SESSION || SESSION.role !== 'customer') return
  const items = DB.getItems().filter(i => i.custId === SESSION.id)
  const active = items.filter(i => i.status === 'listed').length
  const sold = items.filter(i => i.status === 'sold').length
  const earned = items.filter(i => i.status === 'sold').reduce((s, i) => s + Math.round(i.price * SPLIT), 0)
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v }
  set('c-listed', active); set('c-sold', sold); set('c-earned', 'Rs.' + earned.toLocaleString())
  set('mi-active', active + sold + items.filter(i => i.status === 'pending').length)
  set('mi-earned', 'Rs.' + earned.toLocaleString())
  set('earn-total', 'Rs. ' + earned.toLocaleString())
  set('earn-sub', sold + ' items sold')
  set('earn-active', active)
  set('earn-sales', 'Rs.' + items.filter(i => i.status === 'sold').reduce((s, i) => s + i.price, 0).toLocaleString())
}

function buildMyItems() {
  if (!SESSION || SESSION.role !== 'customer') return
  const items = DB.getItems().filter(i => i.custId === SESSION.id)
  const el = document.getElementById('my-items-list')
  const empty = document.getElementById('my-items-empty')
  if (!el) return
  if (items.length === 0) { el.innerHTML = ''; if (empty) empty.style.display = 'block'; return }
  if (empty) empty.style.display = 'none'
  const stageMap = { pending: 1, listed: 2, sold: 3, paid: 4 }
  const pillCls = { pending: 'sp-pend', listed: 'sp-list', sold: 'sp-sold', returned: 'sp-ret' }
  const pillTxt = { pending: 'PENDING ⏱', listed: 'LISTED', sold: 'SOLD ✓', returned: 'RETURNED' }
  el.innerHTML = items.map(item => {
    const stage = stageMap[item.status] || 0
    const cut = (item.status === 'sold' || item.status === 'paid') ? Math.round(item.price * SPLIT) : null
    return `<div class="mi-card">
      <div class="mi-top">
        <div class="mi-img">👕</div>
        <div><div class="mi-name">${item.name}</div><div class="mi-sub">${item.brand} · ${item.size} · Rs.${item.price.toLocaleString()}</div></div>
        <div class="mi-status"><div class="spill ${pillCls[item.status] || 'sp-pend'}">${pillTxt[item.status] || 'PENDING'}</div></div>
      </div>
      <div class="mi-lc"><div class="lc-track">
        ${Array.from({ length: 5 }, (_, i) => {
          const cls = i < stage ? 'done' : i === stage ? 'cur' : ''
          const line = i < 4 ? (i < stage ? 'done' : '') : null
          return (i < 4 ? `<div class="lcd ${cls}"></div><div class="lcl ${line}"></div>` : `<div class="lcd ${cls}"></div>`)
        }).join('')}
      </div>
      <div class="lc-lbls"><span>Submitted</span><span>Accepted</span><span style="${stage===2?'color:#3b82f6':''}">Listed</span><span style="${stage>=3?'color:#22c55e':''}">Sold</span><span style="${stage>=4?'color:#22c55e':''}">Paid</span></div></div>
      <div class="mi-note" style="color:${cut ? '#22c55e' : '#777'}">
        ${cut ? '✓ Rs.' + cut.toLocaleString() + ' paid to you (60%)' : item.status === 'pending' ? '⏱ In curation review — usually 24 hrs' : 'Listed ' + (item.daysListed || 0) + ' days · Your split: 60%'}
      </div>
    </div>`
  }).join('')
}

function buildEarnings() {
  if (!SESSION || SESSION.role !== 'customer') return
  const items = DB.getItems().filter(i => i.custId === SESSION.id)
  const el = document.getElementById('earn-deals')
  const empty = document.getElementById('earn-empty')
  if (!el) return
  if (items.length === 0) { el.innerHTML = ''; if (empty) empty.style.display = 'block'; return }
  if (empty) empty.style.display = 'none'
  el.innerHTML = items.map(item => {
    const sold = item.status === 'sold' || item.status === 'paid'
    const cut = sold ? Math.round(item.price * SPLIT) : 0
    return `<div class="deal-card">
      <div class="dc-top">
        <div class="dc-img" style="display:flex;align-items:center;justify-content:center;font-size:20px">👕</div>
        <div><div class="dc-name">${item.name}</div><div class="dc-from">${sold ? 'Sold by UrbanDrip · 60/40' : 'Pending sale'}</div></div>
        <div class="dc-badge ${sold ? 'dbs' : 'dba'}">${sold ? 'PAID ✓' : 'ACTIVE'}</div>
      </div>
      <div class="sbar"><div class="sfill-b" style="width:${sold ? 60 : 0}%"></div></div>
      <div class="slbls"><span class="sm-b">${sold ? 'My cut: Rs.' + cut.toLocaleString() : 'Potential: Rs.' + Math.round(item.price * SPLIT).toLocaleString()}</span><span class="sth">${sold ? 'UrbanDrip: Rs.' + (item.price - cut).toLocaleString() : ''}</span></div>
      <div class="snote">Listed Rs.${item.price.toLocaleString()} · ${sold ? 'Sold' : 'Awaiting buyer'}</div>
    </div>`
  }).join('')
}

// ═══════════════════════════════════════════
// CONSIGN SUBMIT
// ═══════════════════════════════════════════
let curSlot = 0, photoCount = 0
const slotLabels = ['MAIN', 'BACK', 'DETAIL', 'TAG', 'MORE']

function doSubmit() {
  const name = document.getElementById('item-name').value.trim()
  const brand = document.getElementById('item-brand').value.trim()
  const size = document.getElementById('item-size').value.trim()
  const price = parseInt(document.getElementById('item-price').value) || 0
  if (!name || !brand || !size || !price) { toast('❌ Fill item name, brand, size & price', '#ef4444'); return }
  if (photoCount === 0) { toast('❌ Upload at least one photo', '#ef4444'); return }
  const sel = document.querySelector('.pb-radio.on')
  const pickIdx = sel ? parseInt(sel.id.replace('pbr', '')) : 0
  const pickMethod = pickLabels[pickIdx] || 'Drop-off'
  const items = DB.getItems()
  const ref = 'UDT-' + (1000 + items.length + 1)
  items.push({ id: ref, custId: SESSION.id, customerName: SESSION.name, name, brand, size, price, status: 'pending', pickMethod, createdAt: Date.now() })
  DB.setItems(items)
  document.getElementById('suc-ref').textContent = '#' + ref
  document.getElementById('suc-pick').textContent = pickMethod
  ;['item-name', 'item-brand', 'item-size', 'item-price'].forEach(id => { const el = document.getElementById(id); if (el) el.value = '' })
  for (let i = 0; i < 5; i++) resetSlot(i)
  photoCount = 0
  goCustomer('c-success')
  updateCustomerStats()
}

// ═══════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════
const OWNER_SC = ['o-home','o-curate','o-inventory','o-profit','o-alerts']
const CUST_SC = ['c-home','c-consign','c-myitems','c-earnings','c-success']

function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'))
  document.getElementById(id).classList.add('active')
}
function goOwner(id) {
  if (!guardOwner()) return
  OWNER_SC.forEach(s => document.getElementById(s).classList.remove('active'))
  document.getElementById(id).classList.add('active')
}
function goCustomer(id) {
  CUST_SC.forEach(s => document.getElementById(s).classList.remove('active'))
  document.getElementById(id).classList.add('active')
  document.getElementById('customer-nav').style.display = id === 'c-success' ? 'none' : 'flex'
  if (id === 'c-myitems' || id === 'c-earnings') { buildMyItems(); buildEarnings(); updateCustomerStats() }
}
function oNav(i) { document.querySelectorAll('#owner-nav .ni').forEach((n, idx) => n.classList.toggle('active', idx === i)) }
function cNav(i) { document.querySelectorAll('#customer-nav .ni').forEach((n, idx) => n.classList.toggle('active', idx === i)) }

function switchInv(t) {
  ;['active','unsold','sold','returned'].forEach(k => {
    document.getElementById('itab-' + k).classList.toggle('active', k === t)
    document.getElementById('inv-' + k).style.display = k === t ? 'block' : 'none'
  })
}

// ═══════════════════════════════════════════
// FORMS
// ═══════════════════════════════════════════
function selWho(t) {
  document.getElementById('wc-ind').classList.toggle('active', t === 'ind')
  document.getElementById('wc-shop').classList.toggle('active', t === 'shop')
  document.getElementById('prf-ind').style.display = t === 'ind' ? 'block' : 'none'
  document.getElementById('prf-shop').style.display = t === 'shop' ? 'block' : 'none'
}
function loadAv(input, type) {
  if (!input.files[0]) return
  const url = URL.createObjectURL(input.files[0])
  document.getElementById('av-' + type + '-img').src = url
  document.getElementById('av-' + type + '-img').style.display = 'block'
  document.getElementById('av-' + type + '-ph').style.display = 'none'
}
function trigP(s) { curSlot = s; document.getElementById('pInp').click() }
function handlePhoto(inp) {
  if (!inp.files[0]) return
  const url = URL.createObjectURL(inp.files[0])
  const slot = document.getElementById('ps' + curSlot)
  slot.innerHTML = ''
  if (curSlot === 0) { const b = document.createElement('div'); b.className = 'mbadge'; b.textContent = 'MAIN'; slot.appendChild(b) }
  const img = document.createElement('img'); img.src = url; slot.appendChild(img)
  const rmv = document.createElement('div'); rmv.className = 'rmv'; rmv.textContent = '✕'
  rmv.onclick = e => { e.stopPropagation(); resetSlot(curSlot); photoCount-- }
  slot.appendChild(rmv); slot.onclick = () => {}
  photoCount++; inp.value = ''
}
function resetSlot(s) {
  const slot = document.getElementById('ps' + s); if (!slot) return
  slot.innerHTML = `<div class="psi">${s === 0 ? '📸' : '+'}</div><div class="psl">${slotLabels[s]}</div>`
  slot.onclick = () => trigP(s)
}
function selC(el) { document.querySelectorAll('.cb').forEach(b => b.classList.remove('active')); el.classList.add('active') }
function selPick(i) { ;[0,1,2,3].forEach(n => { const r = document.getElementById('pbr' + n); if (r) r.classList.toggle('on', n === i) }) }

// ═══════════════════════════════════════════
// MODALS & TOAST
// ═══════════════════════════════════════════
function openModal(id) { document.getElementById(id).classList.add('open') }
function closeModal(id) { document.getElementById(id).classList.remove('open') }
function selRet(el) { document.querySelectorAll('.ropt').forEach(r => r.classList.remove('sel')); el.classList.add('sel') }
function confirmReturn() {
  if (!guardOwner()) return
  closeModal('returnModal')
  setTimeout(() => { switchInv('returned'); toast('📦 Return initiated!', '#3b82f6') }, 300)
}
function pickDel(m) { closeModal('deliveryModal'); toast('📦 ' + m + ' confirmed!', '#22c55e') }

function toast(msg, bg = '#22c55e') {
  const t = document.getElementById('toast')
  t.textContent = msg; t.style.background = bg
  t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)'
  clearTimeout(t._t)
  t._t = setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(-50%) translateY(14px)' }, 2800)
}

// ═══════════════════════════════════════════
// PILLS
// ═══════════════════════════════════════════
document.querySelectorAll('.pills').forEach(wrap => {
  wrap.querySelectorAll('.pill').forEach(p => {
    p.addEventListener('click', function () {
      wrap.querySelectorAll('.pill').forEach(x => x.classList.remove('active'))
      this.classList.add('active')
    })
  })
})

// ═══════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════
boot()
