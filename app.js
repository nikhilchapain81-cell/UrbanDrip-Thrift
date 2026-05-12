alert("JS is working!");
document.body.style.background = "red";
// ═══════════════════════════════════════════════════════════════════
// URBANDRIP THRIFT v7 — Vanilla JavaScript Edition
// ═══════════════════════════════════════════════════════════════════

const SPLIT = 0.6;
const PICK_LABELS = [‘Drop-off’, ‘We Pick Up’, ‘Courier’, ‘Shop Handover’];
const OWNER_WHATSAPP = ‘9779800000000’;
const OWNER_INSTAGRAM = ‘urbandrip.np’;
const SECRET = ‘setup-owner-secret-x9k2’;

const tinyHash = (s) => {
let h = 5381;
for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
return String(h);
};

const esc = (s) => String(s == null ? ‘’ : s).replace(/[&<>”’]/g, c => ({’&’:’&’,’<’:’<’,’>’:’>’,’”’:’"’,”’”:’'’}[c]));

// ─── STATE ───
const state = {
owner: null,
customers: [],
items: [
{id:‘UDT-1001’,custId:‘demo1’,custName:‘Rohan’,name:‘Nike Tech Fleece’,brand:‘Nike’,size:‘L’,cat:‘Hoodie / Sweatshirt’,price:3500,status:‘listed’,pickMethod:‘Drop-off’,createdAt:Date.now()-86400000,photos:[null,null,null,null,null],crits:[0,0,0,0]},
{id:‘UDT-1002’,custId:‘demo2’,custName:‘Aarav’,name:‘Carhartt Detroit Jacket’,brand:‘Carhartt’,size:‘M’,cat:‘Jacket / Coat’,price:5200,status:‘listed’,pickMethod:‘Courier’,createdAt:Date.now()-172800000,photos:[null,null,null,null,null],crits:[0,0,0,0]},
{id:‘UDT-1003’,custId:‘demo3’,custName:‘Priya’,name:‘Stussy Box Logo Tee’,brand:‘Stussy’,size:‘M’,cat:‘T-Shirt’,price:1800,status:‘listed’,pickMethod:‘Drop-off’,createdAt:Date.now()-43200000,photos:[null,null,null,null,null],crits:[0,0,0,0]},
{id:‘UDT-1004’,custId:‘demo4’,custName:‘Sita’,name:‘Adidas Samba OG’,brand:‘Adidas’,size:‘42’,cat:‘Shoes’,price:4800,status:‘listed’,pickMethod:‘Shop Handover’,createdAt:Date.now()-21600000,photos:[null,null,null,null,null],crits:[0,0,0,0]},
{id:‘UDT-1005’,custId:‘demo5’,custName:‘Bikash’,name:‘Supreme Box Logo Hoodie’,brand:‘Supreme’,size:‘L’,cat:‘Hoodie / Sweatshirt’,price:8500,status:‘listed’,pickMethod:‘Drop-off’,createdAt:Date.now()-129600000,photos:[null,null,null,null,null],crits:[0,0,0,0]},
{id:‘UDT-1006’,custId:‘demo6’,custName:‘Nisha’,name:“Levi’s 501 Vintage”,brand:“Levi’s”,size:‘32’,cat:‘Denim / Pants’,price:2400,status:‘pending’,pickMethod:‘We Pick Up’,createdAt:Date.now()-7200000,photos:[null,null,null,null,null],crits:[0,0,0,0]},
{id:‘UDT-1007’,custId:‘demo7’,custName:‘Ramesh’,name:‘Old Champion Hoodie’,brand:‘Champion’,size:‘L’,cat:‘Hoodie / Sweatshirt’,price:2200,status:‘listed’,pickMethod:‘Drop-off’,createdAt:Date.now()-(35*86400000),photos:[null,null,null,null,null],crits:[0,0,0,0]},
],
session: null,
screen: ‘c-home’,
modal: null,
oTab: 0, cTab: 0, invTab: ‘active’,
setupForm: { name:’’, phone:’’, pass:’’, pass2:’’ },
loginForm: { phone:’’, pass:’’ },
whoType: ‘ind’,
photos: [null,null,null,null,null],
pickIdx: 0, condIdx: 1,
itemForm: { name:’’, brand:’’, size:’’, cat:‘Hoodie / Sweatshirt’, price:’’ },
profileInd: { name:’’, phone:’’, loc:’’ },
lastRef: { ref:’’, pick:’’ },
accOpen: { profile: true, photos: true, details: false, send: false },
retSel: 0,
lookupPhone: ‘’,
interestedIds: [],
shopFilter: ‘all’,
searchQuery: ‘’,
showSearch: false,
};

// ─── ICONS (SVG) ───
const ICONS = {
home: ‘<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>’,
check: ‘<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>’,
box: ‘<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>’,
cash: ‘<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>’,
bell: ‘<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>’,
plus: ‘<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>’,
bag: ‘<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>’,
cart: ‘<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>’,
};

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

let toastTimer;
function toast(msg, bg = ‘#22c55e’) {
const t = document.getElementById(‘toast’);
t.textContent = msg;
t.style.background = bg;
t.classList.add(‘show’);
clearTimeout(toastTimer);
toastTimer = setTimeout(() => t.classList.remove(‘show’), 2800);
}

function setScreen(name) {
state.screen = name;
if (window.location.hash !== ‘#’ + name) {
try { window.location.hash = name; } catch(e) {}
}
render();
}

function setTab(role, idx) {
if (role === ‘o’) state.oTab = idx;
else state.cTab = idx;
}

function getStats() {
const items = state.items;
const s = state.session;
const myItems = items.filter(i => s?.role === ‘customer’ && i.custId === s.id);
return {
myItems,
myActive: myItems.filter(i => i.status === ‘listed’).length,
mySold: myItems.filter(i => i.status === ‘sold’).length,
myEarned: myItems.filter(i => i.status === ‘sold’).reduce((a, i) => a + Math.round(i.price * SPLIT), 0),
mySalesGross: myItems.filter(i => i.status === ‘sold’).reduce((a, i) => a + i.price, 0),
pendingItems: items.filter(i => i.status === ‘pending’),
listedItems: items.filter(i => i.status === ‘listed’),
soldItems: items.filter(i => i.status === ‘sold’),
unsoldItems: items.filter(i => i.status === ‘listed’ && Math.floor((Date.now() - i.createdAt) / 86400000) >= 30),
returnedItems: items.filter(i => i.status === ‘returned’),
rejectedItems: items.filter(i => i.status === ‘rejected’),
};
}

function getShopItems() {
const s = state.session;
return state.items.filter(i => {
if (i.status !== ‘listed’) return false;
if (s?.role === ‘customer’ && i.custId === s.id) return false;
if (state.shopFilter !== ‘all’ && !(i.cat || ‘’).toLowerCase().includes(state.shopFilter)) return false;
if (state.searchQuery.trim()) {
const q = state.searchQuery.toLowerCase().trim();
const hay = (i.name + ’ ’ + i.brand + ’ ’ + i.cat + ’ ’ + i.size).toLowerCase();
if (!hay.includes(q)) return false;
}
return true;
});
}

function strength(v) {
let s = 0;
if (v.length >= 6) s++;
if (v.length >= 10) s++;
if (/[A-Z]/.test(v)) s++;
if (/[0-9]/.test(v)) s++;
if (/[^A-Za-z0-9]/.test(v)) s++;
const cols = [’#dc2626’,’#dc2626’,’#ca8a04’,’#ca8a04’,’#16a34a’];
const lbls = [‘Too weak’,‘Weak’,‘Fair’,‘Good’,‘Strong 💪’];
const i = Math.max(0, s - 1);
return { pct: s * 20, color: cols[i], label: v.length ? lbls[i] : ‘’ };
}

// ═══════════════════════════════════════════════════════════════════
// HANDLERS (called via onclick)
// ═══════════════════════════════════════════════════════════════════

function updateForm(formName, field, value) {
state[formName][field] = value;
}
function updateState(key, value) {
state[key] = value;
render();
}

function handleSetupRegister() {
const { name, phone, pass, pass2 } = state.setupForm;
if (!name || !phone || !pass || !pass2) return toast(‘❌ Fill all fields’, ‘#ef4444’);
if (phone.length < 9) return toast(‘❌ Valid phone required’, ‘#ef4444’);
if (pass.length < 6) return toast(‘❌ Min 6 chars’, ‘#ef4444’);
if (pass !== pass2) return toast(‘❌ Passwords do not match’, ‘#ef4444’);
state.owner = { id: ‘O1’, name, phone, passHash: tinyHash(pass) };
toast(‘✓ ’ + name + ’ registered!’);
setTimeout(() => { setScreen(‘c-home’); toast(‘🎉 Setup done!’, ‘#e8440a’); }, 700);
}

function handleOwnerLogin() {
const { phone, pass } = state.loginForm;
if (!phone || !pass) return toast(‘❌ Enter phone & password’, ‘#ef4444’);
if (!state.owner) return toast(‘❌ No owner registered. Use #’ + SECRET, ‘#ef4444’);
if (state.owner.phone !== phone) return toast(‘❌ Phone not registered’, ‘#ef4444’);
if (tinyHash(pass) !== state.owner.passHash) return toast(‘❌ Wrong password’, ‘#ef4444’);
state.session = { role: ‘owner’, name: state.owner.name, id: state.owner.id };
state.loginForm = { phone: ‘’, pass: ‘’ };
state.oTab = 0;
setScreen(‘o-home’);
toast(’👑 Welcome, ’ + state.owner.name + ‘!’, ‘#e8440a’);
}

function logout() {
const wasOwner = state.session?.role === ‘owner’;
state.session = null;
state.loginForm = { phone: ‘’, pass: ‘’ };
state.cTab = 0;
setScreen(‘c-home’);
toast(wasOwner ? ‘👋 Owner signed out’ : ‘👋 Signed out’, ‘#777’);
}

function togCrit(itemId, idx) {
const item = state.items.find(i => i.id === itemId);
if (item) {
item.crits[idx] = item.crits[idx] ? 0 : 1;
render();
}
}

function verdict(itemId, type) {
const item = state.items.find(i => i.id === itemId);
if (item) {
item.status = type === ‘accept’ ? ‘listed’ : ‘rejected’;
item.verdictAt = Date.now();
toast(type === ‘accept’ ? ‘✓ Accepted & listed!’ : ‘✕ Rejected’, type === ‘accept’ ? ‘#22c55e’ : ‘#ef4444’);
render();
}
}

function markSold(id) {
const item = state.items.find(i => i.id === id);
if (item) {
item.status = ‘sold’;
item.soldAt = Date.now();
toast(‘🎉 Item sold!’);
render();
}
}

function initiateReturn(id) {
const item = state.items.find(i => i.id === id);
if (item) {
item.status = ‘returned’;
item.returnedAt = Date.now();
state.modal = null;
toast(‘📦 Return initiated!’, ‘#3b82f6’);
render();
}
}

function openBuyModal(itemId) {
const item = state.items.find(i => i.id === itemId);
if (item) { state.modal = { type: ‘buy’, item }; render(); }
}

function expressInterest(itemId) {
if (!state.interestedIds.includes(itemId)) {
state.interestedIds.push(itemId);
}
toast(‘💚 Interest noted! Owner will contact you.’, ‘#22c55e’);
}

function contactWhatsApp(itemId) {
const item = state.items.find(i => i.id === itemId);
if (!item) return;
const msg = encodeURIComponent(“Hi! I’m interested in: “ + item.name + “ (” + item.brand + “, size “ + item.size + “) - Rs.” + item.price.toLocaleString() + “. Is it still available?”);
expressInterest(itemId);
try { window.open(‘https://wa.me/’ + OWNER_WHATSAPP + ‘?text=’ + msg, ‘_blank’); } catch(e) {}
state.modal = null;
render();
}

function contactInstagram(itemId) {
expressInterest(itemId);
try { window.open(‘https://instagram.com/’ + OWNER_INSTAGRAM, ‘_blank’); } catch(e) {}
state.modal = null;
toast(‘📸 Send a DM about this item!’, ‘#dc2743’);
render();
}

function saveInterestOnly(itemId) {
expressInterest(itemId);
state.modal = null;
render();
}

function setPhoto(slot, fileInput) {
const file = fileInput.files?.[0];
if (!file) return;
const reader = new FileReader();
reader.onload = (e) => {
state.photos[slot] = e.target.result;
render();
};
reader.readAsDataURL(file);
fileInput.value = ‘’;
}

function removePhoto(slot, evt) {
if (evt) { evt.preventDefault(); evt.stopPropagation(); }
state.photos[slot] = null;
render();
}

function submitConsign() {
const { name, brand, size, price } = state.itemForm;
let activeSession = state.session;
if (!activeSession || activeSession.role !== ‘customer’) {
if (!state.profileInd.name || !state.profileInd.phone) {
state.accOpen.profile = true;
render();
return toast(‘❌ Fill name & phone in profile’, ‘#ef4444’);
}
let c = state.customers.find(c => c.phone === state.profileInd.phone);
if (!c) {
c = { id: ‘C’ + (state.customers.length + 1), name: state.profileInd.name, phone: state.profileInd.phone };
state.customers.push(c);
}
state.session = { role: ‘customer’, name: c.name, id: c.id, phone: c.phone };
activeSession = state.session;
}
if (!name || !brand || !size || !price) return toast(‘❌ Fill name, brand, size & price’, ‘#ef4444’);
if (state.photos.filter(Boolean).length === 0) return toast(‘❌ Upload at least 1 photo’, ‘#ef4444’);
const ref = ‘UDT-’ + (2000 + state.items.length + 1);
const pickMethod = PICK_LABELS[state.pickIdx];
state.items.push({
id: ref, custId: activeSession.id, custName: activeSession.name,
name, brand, size, cat: state.itemForm.cat,
price: parseInt(price, 10), status: ‘pending’,
pickMethod, createdAt: Date.now(),
photos: […state.photos], crits: [0,0,0,0],
});
state.lastRef = { ref: ‘#’ + ref, pick: pickMethod };
state.itemForm = { name: ‘’, brand: ‘’, size: ‘’, cat: ‘Hoodie / Sweatshirt’, price: ‘’ };
state.photos = [null,null,null,null,null];
state.accOpen = { profile: true, photos: true, details: false, send: false };
setScreen(‘c-success’);
toast(‘✅ Submitted! Owner will review.’);
}

function lookupItems() {
if (!state.lookupPhone || state.lookupPhone.length < 9) return toast(‘❌ Enter valid phone’, ‘#ef4444’);
const c = state.customers.find(c => c.phone === state.lookupPhone);
if (!c) return toast(‘❌ No items found’, ‘#ef4444’);
state.session = { role: ‘customer’, name: c.name, id: c.id, phone: c.phone };
toast(’👋 Welcome back, ’ + c.name + ‘!’, ‘#3b82f6’);
render();
}

function toggleAcc(key) {
state.accOpen[key] = !state.accOpen[key];
render();
}

function toggleSearch() {
state.showSearch = !state.showSearch;
if (!state.showSearch) state.searchQuery = ‘’;
render();
}

function closeModal() {
state.modal = null;
render();
}

// ═══════════════════════════════════════════════════════════════════
// RENDER HELPERS
// ═══════════════════════════════════════════════════════════════════

function sb(rightHtml) {
return `<div class="sb"><span class="sb-time">9:41</span><span style="display:flex;gap:8px;align-items:center">${rightHtml || ''}</span></div>`;
}

function lcTrack(stage, ok, warn) {
const labels = [‘Submitted’,‘Accepted’,‘Listed’,‘Sold’,‘Paid’];
let html = ‘<div class="lc"><div class="lc-track">’;
for (let i = 0; i < 5; i++) {
const dot = i < stage ? (ok ? ‘ok’ : ‘done’) : i === stage ? (warn ? ‘warn’ : ok ? ‘ok’ : ‘cur’) : ‘’;
const line = i < stage ? (ok ? ‘ok’ : ‘done’) : (i === stage && warn) ? ‘warn’ : ‘’;
html += `<div class="lcd ${dot}"></div>`;
if (i < 4) html += `<div class="lcl ${line}"></div>`;
}
html += ‘</div><div class="lc-lbls">’;
labels.forEach((l, i) => {
let style = ‘’;
if (i === stage && warn) style = ‘color:var(–red)’;
else if (i === stage && ok) style = ‘color:var(–green)’;
else if (i === stage) style = ‘color:var(–rust)’;
const txt = (warn && i === stage) ? ‘⚠ Unsold’ : (ok && i === 4) ? ‘Done ✓’ : l;
html += `<span style="${style}">${txt}</span>`;
});
html += ‘</div></div>’;
return html;
}

function litem(item) {
const ph = item.photos?.find(Boolean);
return `<div class="litem"> <div class="li-thumb">${ph ? `<img src="${ph}" alt="">` : ‘👕’}</div>
<div class="li-info">
<div class="li-brand">${esc(item.brand)}</div>
<div class="li-name">${esc(item.name)}</div>
<div class="li-sub">${esc(item.size)} · ${esc(item.custName)}</div>
</div>
<div class="li-right"><div class="li-price">Rs.${item.price.toLocaleString()}</div></div>

  </div>`;
}

function shopCard(item) {
const ph = item.photos?.find(Boolean);
const interested = state.interestedIds.includes(item.id);
return `<div class="shop-card ${interested ? 'interested' : ''}" onclick="openBuyModal('${item.id}')"> <div class="shop-img"> ${ph ? `<img src="${ph}" alt="">` : ‘👕’}
<div class="shop-tag">${esc(item.cat || ‘Item’)}</div>
${interested ? ‘<div class="shop-int-badge">💚 Saved</div>’ : ‘’}
</div>
<div class="shop-body">
<div class="shop-brand">${esc(item.brand)}</div>
<div class="shop-name">${esc(item.name)}</div>
<div class="shop-row">
<div class="shop-price">Rs.${item.price.toLocaleString()}</div>
<div class="shop-size">Size ${esc(item.size)}</div>
</div>
<button class="shop-btn ${interested ? 'done' : ''}">${interested ? ‘✓ INTERESTED’ : ‘🛒 I WANT THIS’}</button>
</div>

  </div>`;
}

// ═══════════════════════════════════════════════════════════════════
// SCREENS
// ═══════════════════════════════════════════════════════════════════

function renderSetup() {
const s = strength(state.setupForm.pass);
return `<div class="screen">${sb(’’)}
<div class="login-wrap">
<div style="font-size:48px;margin-bottom:12px">👑</div>
<div class="logo" style="font-size:42px">Setup <em>Owner</em></div>
<div class="tagline">One-time setup</div>
<div class="notice-box">
<div class="nb-title">⚠️ One-Time Setup</div>
<div class="nb-body">Only one owner account is allowed.</div>
</div>
<div style="display:flex;justify-content:center;margin-bottom:28px">
<div class="slot ${state.owner ? 'done' : 'cur'}">${state.owner ? ‘✓’ : ‘1’}</div>
</div>
<div class="form-wrap">
<div class="fl"><label>Full Name</label>
<input class="fi" placeholder="e.g. Aayush" value="${esc(state.setupForm.name)}" oninput="state.setupForm.name=this.value">
</div>
<div class="fl"><label>Phone</label>
<input class="fi" type="tel" placeholder="98XXXXXXXX" value="${esc(state.setupForm.phone)}" oninput="state.setupForm.phone=this.value">
</div>
<div class="fl"><label>Password</label>
<input class="fi" type="password" placeholder="Min 6 chars" value="${esc(state.setupForm.pass)}" oninput="state.setupForm.pass=this.value;render()">
<div style="height:3px;background:var(--border);border-radius:2px;margin-top:6px"><div style="height:100%;width:${s.pct}%;background:${s.color};border-radius:2px;transition:all .3s"></div></div>
<div style="font-size:10px;margin-top:4px;text-align:right;color:${s.color}">${s.label}</div>
</div>
<div class="fl"><label>Confirm Password</label>
<input class="fi" type="password" placeholder="Re-enter" value="${esc(state.setupForm.pass2)}" oninput="state.setupForm.pass2=this.value">
</div>
<button class="btn btn-rust" onclick="handleSetupRegister()">REGISTER OWNER →</button>
</div>
</div>

  </div>`;
}

function renderOwnerLogin() {
return `<div class="screen">${sb(’’)}
<div class="login-wrap">
<div style="font-size:42px;margin-bottom:8px">👑</div>
<div class="logo">Owner <em>Access</em></div>
<div class="tagline">Restricted · Authorized only</div>
<div class="notice-box" style="margin-top:20px">
<div class="nb-title">🔒 Owner Sign In</div>
<div class="nb-body">${state.owner ? ‘Enter your registered phone & password.’ : ‘No owner yet. Tap register below.’}</div>
</div>
<div class="form-wrap">
<div class="fl"><label>Phone</label>
<input class="fi" type="tel" placeholder="98XXXXXXXX" value="${esc(state.loginForm.phone)}" oninput="state.loginForm.phone=this.value">
</div>
<div class="fl"><label>Password</label>
<input class="fi" type="password" placeholder="••••••••" value="${esc(state.loginForm.pass)}" oninput="state.loginForm.pass=this.value" onkeydown="if(event.key==='Enter')handleOwnerLogin()">
</div>
<button class="btn btn-rust" onclick="handleOwnerLogin()">SIGN IN AS OWNER →</button>
${!state.owner ? ‘<button class="btn btn-blue" onclick="setScreen(\'sc-setup\')">🆕 Register New Owner</button>’ : ‘’}
<button class="btn btn-ghost" onclick="setScreen('c-home')">← Back to Shop</button>
</div>
</div>

  </div>`;
}

function renderCustomerHome() {
const st = getStats();
const shopItems = getShopItems();
const rightHtml = state.session?.role === ‘customer’
? `<span class="rbadge rb-c">👕 ${esc(state.session.name)}</span><span class="ibtn" onclick="logout()">🚪</span>`
: `<span class="ibtn" onclick="setScreen('o-login')">👑</span>`;
return `<div class="screen">${sb(rightHtml)} <div class="topbar"><div class="logo">Urban<em>Drip</em></div></div> <div class="sa"> <div class="hero hero-shop"> <div class="htag htag-s">🛒 Live Marketplace</div> <h2>SHOP THE<br>STREET DRIP.</h2> <p>${st.listedItems.length} curated · Nike · Adidas · Carhartt · Supreme</p> <button class="hbtn hbtn-s" onclick="setTab('c',1);setScreen('c-shop')">BROWSE ALL →</button> </div> <div class="hero hero-c"> <div class="htag htag-c">Sell & Earn 60%</div> <h2>CONSIGN.<br>EARN. REPEAT.</h2> <p>Got old clothes? We sell them. You earn 60%.</p> <button class="hbtn hbtn-c" onclick="setTab('c',2);setScreen('c-consign')">CONSIGN MY CLOTHES →</button> </div> <div class="stats3"> <div class="stat"><div class="sv" style="color:var(--blue)">${st.myActive}</div><div class="sl">Listed</div></div> <div class="stat"><div class="sv" style="color:var(--green)">${st.mySold}</div><div class="sl">Sold</div></div> <div class="stat"><div class="sv" style="color:var(--yellow);font-size:18px">Rs.${st.myEarned.toLocaleString()}</div><div class="sl">Earned</div></div> </div> ${shopItems.length > 0 ? `
<div class="sec-row">
<div class="sec-lbl">🔥 Hot Drops</div>
<div class="see-all" onclick="setTab('c',1);setScreen('c-shop')">See all (${shopItems.length})</div>
</div>
<div class="shop-grid">${shopItems.slice(0,4).map(shopCard).join(’’)}</div>
`: ''} ${st.myItems.filter(i => i.status === 'listed').length > 0 ?`
<div class="sec-row">
<div class="sec-lbl">My Listed Items</div>
<div class="see-all" onclick="setTab('c',3);setScreen('c-myitems')">See all</div>
</div>
<div style="padding:0 20px">${st.myItems.filter(i => i.status === ‘listed’).slice(0,2).map(litem).join(’’)}</div>
` : ‘’}
<div class="gap"></div>
</div>

  </div>`;
}

function renderCustomerShop() {
const filters = [‘all’,‘hoodie’,‘t-shirt’,‘denim’,‘jacket’,‘shoes’];
const shopItems = getShopItems();
const rightHtml = state.session?.role === ‘customer’
? `<span class="rbadge rb-c">👕 ${esc(state.session.name)}</span>${state.interestedIds.length > 0 ? `<span class="rbadge rb-g">💚 ${state.interestedIds.length}</span>` : ''}`
: `<span class="ibtn" onclick="setScreen('o-login')">👑</span>`;
return `<div class="screen">${sb(rightHtml)} <div class="topbar"> <div class="logo">Shop <em>Drip</em></div> <div class="ibtn" onclick="toggleSearch()" style="${state.showSearch ? 'background:var(--rust);border-color:var(--rust)' : ''}">${state.showSearch ? '✕' : '🔍'}</div> </div> <div class="sa"> ${state.showSearch ? `
<div class="search-wrap">
<div class="search-input">
<input type="text" placeholder="Search by name, brand, size..." value="${esc(state.searchQuery)}" oninput="state.searchQuery=this.value;render();setTimeout(()=>{const i=document.querySelector('.search-input input');if(i){i.focus();i.setSelectionRange(i.value.length,i.value.length);}},0)">
${state.searchQuery ? `<span class="search-clear" onclick="state.searchQuery='';render()">✕</span>` : ‘’}
</div>
${state.searchQuery ? `<div class="search-meta">${shopItems.length} RESULT${shopItems.length!==1?'S':''} FOR "${esc(state.searchQuery.toUpperCase())}"</div>` : ‘’}
</div>
`: ''} <div class="cat-chips"> ${filters.map(f =>`<button class="cat-chip ${state.shopFilter===f?'on':''}" onclick="state.shopFilter='${f}';render()">${f === ‘all’ ? ‘All Items’ : f}</button>`).join('')} </div> ${shopItems.length === 0 ? `
<div class="empty">
<div class="ei">${state.searchQuery ? ‘🔍’ : ‘🛍️’}</div>
<div class="et">${state.searchQuery ? ‘No Matches’ : ‘No Items’}</div>
<div class="es">${state.searchQuery ? `Nothing matches "${esc(state.searchQuery)}"` : ‘Check back soon!’}</div>
</div>
`:`
<div class="sec-lbl">${shopItems.length} Items Available</div>
<div class="shop-grid">${shopItems.map(shopCard).join(’’)}</div>
`}
<div class="gap"></div>
</div>

  </div>`;
}

function renderConsign() {
const profileFilled = state.whoType === ‘ind’ ? !!(state.profileInd.phone && state.profileInd.loc) : false;
const photoCount = state.photos.filter(Boolean).length;
const detailsFilled = !!(state.itemForm.name && state.itemForm.brand && state.itemForm.size && state.itemForm.price);
const sendLabel = [‘Drop-off’,‘Pick Up’,‘Courier’,‘Shop’][state.pickIdx];

function acc(id, num, title, status, statusOn, body) {
return `<div class="acc"> <button class="acc-btn" onclick="toggleAcc('${id}')"> <span class="acc-slot ${statusOn?'done':''}">${statusOn?'✓':num}</span> <span class="acc-title">${title}</span> <span class="acc-status ${statusOn?'done':''}">${status}</span> <span class="acc-arrow">${state.accOpen[id]?'▾':'▸'}</span> </button> ${state.accOpen[id] ? `<div class="acc-body">${body}</div>` : ''} </div>`;
}

const profileBody = state.whoType === ‘ind’ ? `<div class="pcard"> <div class="pcard-top"> <div class="pav">😊</div> <div> <div class="pcard-name">${esc(state.profileInd.name || state.session?.name || 'Your Name')}</div> <div class="pcard-type">Individual Consigner</div> </div> </div> <div class="pcard-fields"> <div class="pf"><span>👤</span><input placeholder="Full Name" value="${esc(state.profileInd.name)}" oninput="state.profileInd.name=this.value"></div> <div class="pf"><span>📱</span><input placeholder="Phone Number" type="tel" value="${esc(state.profileInd.phone)}" oninput="state.profileInd.phone=this.value"></div> <div class="pf"><span>📍</span><input placeholder="Your Area" value="${esc(state.profileInd.loc)}" oninput="state.profileInd.loc=this.value"></div> </div> </div>` : `<div class="pcard"> <div class="pcard-top"> <div class="pav">🏪</div> <div><div class="pcard-name">Shop Name</div><div class="pcard-type">Shop Partner</div></div> </div> <div class="pcard-fields"> <div class="pf"><span>🏪</span><input placeholder="Shop Name"></div> <div class="pf"><span>👤</span><input placeholder="Owner / Contact"></div> <div class="pf"><span>📱</span><input placeholder="Phone" type="tel"></div> <div class="pf"><span>📍</span><input placeholder="Shop Address"></div> </div> </div>`;

const photosBody = `<div class="photo-grid"> ${['MAIN','BACK','DETAIL','TAG','MORE'].map((label, i) =>`
<label class="pslot ${i===0?'main-s':''} ${state.photos[i]?'filled':''}">
<input type="file" accept="image/*" style="display:none" onchange="setPhoto(${i},this)">
${state.photos[i] ? `${i===0?'<div class="mbadge">MAIN</div>':''} <img src="${state.photos[i]}" alt=""> <span class="px-remove" onclick="removePhoto(${i},event)">✕</span>` : `<div class="psi ${i===0?'on':''}">${i===0?'📸':'+'}</div> <div class="psl ${i===0?'on':''}">${label}</div>`}
</label>
`).join('')} </div> <div class="photo-note">📷 Clear photos help owner approve faster · Min 1</div> `;

const detailsBody = `<div style="padding:0 16px"> <div class="fl"><label>Item Name</label> <input class="fi" placeholder="e.g. Nike Tech Fleece" value="${esc(state.itemForm.name)}" oninput="state.itemForm.name=this.value"> </div> <div style="display:flex;gap:10px"> <div class="fl" style="flex:1"><label>Brand</label> <input class="fi" placeholder="Nike..." value="${esc(state.itemForm.brand)}" oninput="state.itemForm.brand=this.value"> </div> <div class="fl" style="flex:1"><label>Size</label> <input class="fi" placeholder="M / 32" value="${esc(state.itemForm.size)}" oninput="state.itemForm.size=this.value"> </div> </div> <div class="fl"><label>Category</label> <select class="fi" onchange="state.itemForm.cat=this.value"> ${['Hoodie / Sweatshirt','T-Shirt','Denim / Pants','Jacket / Coat','Shoes','Accessories'].map(c =>`<option ${state.itemForm.cat===c?‘selected’:’’}>${c}</option>`).join('')} </select> </div> <div class="fl"><label>Condition</label> <div class="cond-sel"> ${[{n:10,l:'New'},{n:9,l:'Like New'},{n:8,l:'Good'},{n:7,l:'Fair'}].map((c, i) => `
<div class="cb ${state.condIdx===i?'on':''}" onclick="state.condIdx=${i};render()">
<div class="cb-n">${c.n}</div><div class="cb-l">${c.l}</div>
</div>
`).join('')} </div> </div> <div class="fl"><label>Asking Price (Rs.)</label> <input class="fi" type="number" placeholder="e.g. 1200" value="${esc(state.itemForm.price)}" oninput="state.itemForm.price=this.value"> </div> </div> `;

const sendBody = `<div class="pickup-box"> <div class="pb-head">📦 Delivery to Us</div> <div class="pb-opts"> ${[ {l:'🚶 Drop off at our location',d:'Bring it to us directly'}, {l:"🛵 We'll pick it up",d:'We come to your address'}, {l:'📦 Send via courier',d:'Ship to us'}, {l:'🏪 Shop handover (token)',d:'Hand at shop'}, ].map((opt, i) =>`
<div class="pbopt" onclick="state.pickIdx=${i};render()">
<div class="pb-radio ${state.pickIdx===i?'on':''}"></div>
<div><div class="pb-lbl">${opt.l}</div><div class="pb-desc">${opt.d}</div></div>
</div>
`).join('')} </div> </div> `;

return `<div class="screen">${sb('')} <div class="con-hdr"> <h1>SEND YOUR DRIP</h1> <p>Tap each section to expand. Fill in any order.</p> </div> <div class="sa"> <div class="sec-lbl">Type</div> <div class="who-grid"> <div class="who-card ${state.whoType==='ind'?'on':''}" onclick="state.whoType='ind';render()"> <div class="wc-icon">👤</div><div class="wc-title">Individual</div><div class="wc-sub">Personal clothes</div> </div> <div class="who-card ${state.whoType==='shop'?'on':''}" onclick="state.whoType='shop';render()"> <div class="wc-icon">🏪</div><div class="wc-title">Shop Partner</div><div class="wc-sub">Registered store</div> </div> </div> ${acc('profile','1','Your Profile', profileFilled?'Filled':'Tap to add', profileFilled, profileBody)} ${acc('photos','2','Cloth Photos', photoCount>0?`${photoCount}/5`:‘Tap to add’, photoCount>0, photosBody)}
${acc(‘details’,‘3’,‘Item Details’, detailsFilled?‘Filled’:‘Tap to add’, detailsFilled, detailsBody)}
${acc(‘send’,‘4’,‘How Will You Send It?’, sendLabel, true, sendBody)}
<button class="btn btn-blue" style="margin:8px 20px 20px;width:calc(100% - 40px)" onclick="submitConsign()">SUBMIT MY DRIP →</button>
</div>

  </div>`;
}

function renderSuccess() {
return `<div class="screen">${sb(’’)}
<div class="suc-wrap">
<div class="suc-icon">🎉</div>
<div class="suc-title" style="color:var(--green)">DRIP SUBMITTED!</div>
<div class="suc-sub">Your item is in the owner’s curation queue. You’ll be notified once reviewed.</div>
<div class="suc-card">
<div class="sr"><span class="sk">Reference #</span><span class="sv2 mono" style="color:var(--blue)">${esc(state.lastRef.ref)}</span></div>
<div class="sr"><span class="sk">Status</span><span class="sv2" style="color:var(--yellow)">Pending Review</span></div>
<div class="sr"><span class="sk">Send Method</span><span class="sv2">${esc(state.lastRef.pick)}</span></div>
<div class="sr"><span class="sk">Your Split</span><span class="sv2" style="color:var(--green)">60%</span></div>
</div>
<button class="btn btn-blue" style="max-width:280px" onclick="setTab('c',3);setScreen('c-myitems')">VIEW MY ITEMS →</button>
</div>

  </div>`;
}

function renderMyItems() {
const st = getStats();
if (!state.session || state.session.role !== ‘customer’) {
return `<div class="screen">${sb('')} <div class="topbar"><div class="logo">My Items</div></div> <div class="sa"> <div style="padding:40px 24px;text-align:center"> <div style="font-size:48px;margin-bottom:12px">🔍</div> <div style="font-family:'Bebas Neue',sans-serif;font-size:28px;margin-bottom:8px">Track Your Items</div> <div style="font-size:13px;color:var(--muted2);line-height:1.6;margin-bottom:24px">Enter the phone number you used to consign.</div> <div class="fl" style="text-align:left"> <label>Phone Number</label> <input class="fi" type="tel" placeholder="98XXXXXXXX" value="${esc(state.lookupPhone)}" oninput="state.lookupPhone=this.value"> </div> <button class="btn btn-blue" onclick="lookupItems()">LOOK UP MY ITEMS →</button> <button class="btn btn-ghost" onclick="setTab('c',2);setScreen('c-consign')">Or consign a new item →</button> </div> </div> </div>`;
}
const stageMap = {pending:1,listed:2,sold:3,paid:4,rejected:0,returned:0};
const pillCls = {pending:‘sp-pend’,listed:‘sp-list’,sold:‘sp-sold’,returned:‘sp-ret’,rejected:‘sp-ret’};
const pillTxt = {pending:‘PENDING ⏱’,listed:‘LISTED’,sold:‘SOLD ✓’,returned:‘RETURNED’,rejected:‘REJECTED’};
return `<div class="screen">${sb(`<span class="rbadge rb-c">👕 ${esc(state.session.name)}</span><span class="ibtn" onclick="logout()">🚪</span>`)} <div class="topbar"> <div class="logo">My Items</div> <div class="ibtn">🔔</div> </div> <div class="sa"> <div class="stats2"> <div class="stat"><div class="sv" style="color:var(--blue)">${st.myItems.filter(i=>i.status!=='rejected').length}</div><div class="sl">Active</div></div> <div class="stat"><div class="sv" style="color:var(--green);font-size:18px">Rs.${st.myEarned.toLocaleString()}</div><div class="sl">Earned</div></div> </div> <div class="sec-lbl">My Consigned Items</div> ${st.myItems.length === 0 ? `
<div class="empty">
<div class="ei">👕</div>
<div class="et">No Items Yet</div>
<div class="es">Consign your first item and track it here.</div>
<button class="btn btn-blue" style="max-width:200px;margin:16px auto 0;padding:11px;font-size:13px" onclick="setTab('c',2);setScreen('c-consign')">Consign Now →</button>
</div>
`: st.myItems.map(item => { const stage = stageMap[item.status] || 0; const cut = (item.status==='sold'||item.status==='paid') ? Math.round(item.price*SPLIT) : null; const ph = item.photos?.find(Boolean); const noteColor = cut?'var(--green)':item.status==='rejected'?'var(--red)':'var(--muted2)'; const noteTxt = cut ?`✓ Rs.${cut.toLocaleString()} paid to you (60%)`: item.status==='rejected' ? '✕ Owner rejected this item.' : item.status==='pending' ? '⏱ Waiting for review — usually within 24 hrs' : 'Listed on UrbanDrip · Your split: 60%'; return`<div class="mi-card">
<div class="mi-top">
<div class="mi-img">${ph?`<img src="${ph}" alt="">`:‘👕’}</div>
<div>
<div class="mi-name">${esc(item.name)}</div>
<div class="mi-sub">${esc(item.brand)} · ${esc(item.size)} · Rs.${item.price.toLocaleString()}</div>
</div>
<div class="mi-status"><div class="spill ${pillCls[item.status]||'sp-pend'}">${pillTxt[item.status]||‘PENDING’}</div></div>
</div>
<div class="mi-lc">${lcTrack(stage)}</div>
<div class="mi-note" style="color:${noteColor}">${noteTxt}</div>
</div>`;
}).join(’’)}
<div class="gap"></div>
</div>

  </div>`;
}

function renderEarnings() {
const st = getStats();
if (!state.session || state.session.role !== ‘customer’) {
return `<div class="screen">${sb('')} <div class="topbar"><div class="logo">Earnings</div></div> <div class="sa"> <div style="padding:40px 24px;text-align:center"> <div style="font-size:48px;margin-bottom:12px">💰</div> <div style="font-family:'Bebas Neue',sans-serif;font-size:28px;margin-bottom:8px">Track Earnings</div> <div class="fl" style="text-align:left"><label>Phone</label> <input class="fi" type="tel" placeholder="98XXXXXXXX" value="${esc(state.lookupPhone)}" oninput="state.lookupPhone=this.value"> </div> <button class="btn btn-blue" onclick="lookupItems()">VIEW EARNINGS →</button> </div> </div> </div>`;
}
return `<div class="screen">${sb(`<span class="rbadge rb-c">👕 ${esc(state.session.name)}</span><span class="ibtn" onclick="logout()">🚪</span>`)} <div class="topbar"> <div class="logo">Earnings</div> <div class="ibtn">📋</div> </div> <div class="sa"> <div class="earn-card earn-c"> <div class="earn-lbl">My Total Earned</div> <div class="earn-amt">Rs. ${st.myEarned.toLocaleString()}</div> <div class="earn-sub">${st.mySold} items sold</div> <div class="earn-row"> <div class="em"><div class="em-v">Rs.${st.mySalesGross.toLocaleString()}</div><div class="em-l">Sale Price</div></div> <div class="em"><div class="em-v">60%</div><div class="em-l">My Split</div></div> <div class="em"><div class="em-v">${st.myActive}</div><div class="em-l">Active</div></div> </div> </div> <div class="sec-lbl">My Deals</div> ${st.myItems.length === 0 ? `
<div class="empty"><div class="ei">💰</div><div class="et">No Deals Yet</div><div class="es">Once items sell, earnings appear here.</div></div>
`: st.myItems.map(item => { const sold = item.status==='sold' || item.status==='paid'; const cut = sold ? Math.round(item.price*SPLIT) : 0; const ph = item.photos?.find(Boolean); return`<div class="deal-card">
<div class="dc-top">
<div class="dc-img">${ph?`<img src="${ph}" alt="">`:‘👕’}</div>
<div>
<div class="dc-name">${esc(item.name)}</div>
<div class="dc-from">${sold?‘Sold by UrbanDrip · 60/40’:item.status===‘rejected’?‘Rejected’:‘Awaiting sale’}</div>
</div>
<div class="dc-badge ${sold?'dbs':item.status==='rejected'?'dbr':'dba'}">${sold?‘PAID ✓’:item.status===‘rejected’?‘REJECTED’:‘PENDING’}</div>
</div>
${sold ? `<div class="sbar"><div class="sfill-b" style="width:60%"></div></div> <div class="slbls"> <span class="sm-b">My cut: Rs.${cut.toLocaleString()}</span> <span class="sth">UrbanDrip: Rs.${(item.price-cut).toLocaleString()}</span> </div>` : ‘’}
<div class="snote">Listed Rs.${item.price.toLocaleString()}</div>
</div>`;
}).join(’’)}
<div class="gap"></div>
</div>

  </div>`;
}

function renderOwnerHome() {
const st = getStats();
return `<div class="screen">${sb(`<span class="rbadge rb-o">👑 ${esc(state.session.name)}</span><span class="ibtn" onclick="logout()">🚪</span>`)} <div class="topbar"> <div class="logo">Urban<em>Drip</em></div> <div style="display:flex;gap:8px"> <span class="ibtn">🔍</span> <span class="ibtn" onclick="setTab('o',4);setScreen('o-alerts')">🔔</span> </div> </div> <div class="sa"> <div class="hero hero-o"> <div class="htag htag-o">Owner Dashboard</div> <h2>YOUR DRIP<br>EMPIRE.</h2> <p>${st.pendingItems.length} pending · ${st.listedItems.length} live · ${st.soldItems.length} sold</p> <button class="hbtn hbtn-o" onclick="setTab('o',1);setScreen('o-curate')">REVIEW QUEUE (${st.pendingItems.length}) →</button> </div> <div class="stats4"> <div class="stat"><div class="sv">${st.listedItems.length}</div><div class="sl">Active</div></div> <div class="stat"><div class="sv" style="color:var(--yellow)">${st.pendingItems.length}</div><div class="sl">Curate</div></div> <div class="stat"><div class="sv" style="color:var(--red)">${st.returnedItems.length}</div><div class="sl">Returned</div></div> <div class="stat"><div class="sv" style="color:var(--green)">${st.soldItems.length}</div><div class="sl">Sold</div></div> </div> ${st.pendingItems.length > 0 ? `
<div class="alert-box">
<div style="font-size:26px">⏱</div>
<div style="flex:1">
<div class="ab-title">${st.pendingItems.length} Item${st.pendingItems.length>1?‘s’:’’} Awaiting Review</div>
<div class="ab-sub">Customers are waiting — curate now</div>
</div>
<button class="ab-btn" onclick="setTab('o',1);setScreen('o-curate')">Curate</button>
</div>
`: ''} ${state.interestedIds.length > 0 ?`
<div class="alert-box" style="background:rgba(232,68,10,.07);border-color:rgba(232,68,10,.2)">
<div style="font-size:26px">🛒</div>
<div style="flex:1">
<div class="ab-title" style="color:var(--rust)">${state.interestedIds.length} Buyer Interest${state.interestedIds.length>1?‘s’:’’}!</div>
<div class="ab-sub">Customers want these items — check messages</div>
</div>
</div>
`: ''} <div class="sec-row"> <div class="sec-lbl">Active Listings</div> <div class="see-all" onclick="setTab('o',2);setScreen('o-inventory')">See all</div> </div> ${st.listedItems.length === 0 ?`
<div style="padding:0 20px 20px"><div class="empty" style="padding:24px"><div class="ei">👕</div><div class="et">No Listings Yet</div><div class="es">Accept submissions to list items.</div></div></div>
`:`<div>${st.listedItems.slice(0,3).map(litem).join(’’)}</div>`}
<div class="gap"></div>
</div>

  </div>`;
}

function renderOwnerCurate() {
const st = getStats();
return `<div class="screen">${sb('')} <div class="topbar" style="padding-bottom:8px"> <div class="logo">Curate</div> <div class="badge-pill">${st.pendingItems.length} Pending</div> </div> <div class="sa"> <div class="stats3"> <div class="stat"><div class="sv" style="color:var(--yellow)">${st.pendingItems.length}</div><div class="sl">Pending</div></div> <div class="stat"><div class="sv" style="color:var(--green)">${st.listedItems.length}</div><div class="sl">Accepted</div></div> <div class="stat"><div class="sv" style="color:var(--red)">${st.rejectedItems.length}</div><div class="sl">Rejected</div></div> </div> <div class="sec-lbl">Review Queue</div> ${st.pendingItems.length === 0 ? `
<div class="empty"><div class="ei">🎉</div><div class="et">Queue Clear!</div><div class="es">All items reviewed.</div></div>
`: st.pendingItems.map(q => { const score = Math.round(q.crits.filter(Boolean).length/4*100); const sc = score>=75?'var(--green)':score>=50?'var(--yellow)':'var(--red)'; const ph = q.photos?.find(Boolean); const CRITS = ['🎨 Style / Streetwear','✅ Condition','🏷️ Brand & Look','📈 Demand']; return`<div class="qi">
<div class="qi-top">
<div class="qi-photo">${ph?`<img src="${ph}" alt="">`:‘👕’}</div>
<div>
<div class="qi-from">👤 ${esc(q.custName)}</div>
<div class="qi-name">${esc(q.name)}</div>
<div class="qi-meta">${esc(q.brand)} · ${esc(q.size)} · Rs.${q.price.toLocaleString()}</div>
<div class="qi-when">⏱ ${esc(q.pickMethod)} · ${esc(q.cat)}</div>
</div>
</div>
<div class="qi-send">📦 Send: <strong>${esc(q.pickMethod)}</strong></div>
<div class="crit-wrap">
${CRITS.map((lbl, idx) => `<div class="crit-row"> <div class="crit-l">${lbl}</div> <button class="tog ${q.crits[idx]?'on':''}" onclick="togCrit('${q.id}',${idx})"><div class="tog-knob"></div></button> </div>`).join(’’)}
</div>
<div class="q-score">
<span class="qs-lbl">Score</span>
<div class="qs-bar"><div class="qs-fill" style="width:${score}%;background:${sc}"></div></div>
<span class="qs-pct" style="color:${sc}">${score}%</span>
</div>
<div class="vrow">
<button class="vbtn vrej" onclick="verdict('${q.id}','reject')">✕ Reject</button>
<button class="vbtn vacc" onclick="verdict('${q.id}','accept')">✓ Accept & List</button>
</div>
</div>`;
}).join(’’)}
<div class="gap"></div>
</div>

  </div>`;
}

function renderOwnerInventory() {
const st = getStats();
const tabItems = { active: st.listedItems, unsold: st.unsoldItems, sold: st.soldItems, returned: st.returnedItems }[state.invTab] || [];
return `<div class="screen">${sb('')} <div class="topbar" style="padding-bottom:8px"> <div class="logo">Inventory</div> <div class="ibtn">⬇️</div> </div> <div class="sa"> <div class="inv-tabs"> <button class="itab ${state.invTab==='active'?'on':''}" onclick="state.invTab='active';render()">Active<span class="cnt cy2">${st.listedItems.length}</span></button> <button class="itab ${state.invTab==='unsold'?'on':''}" onclick="state.invTab='unsold';render()">Unsold<span class="cnt cr2">${st.unsoldItems.length}</span></button> <button class="itab ${state.invTab==='sold'?'on':''}" onclick="state.invTab='sold';render()">Sold<span class="cnt cg2">${st.soldItems.length}</span></button> <button class="itab ${state.invTab==='returned'?'on':''}" onclick="state.invTab='returned';render()">Returned</button> </div> ${state.invTab==='unsold' && st.unsoldItems.length>0 ? `
<div style="margin:0 20px 14px;background:rgba(239,68,68,.07);border:1px solid rgba(239,68,68,.2);border-radius:12px;padding:13px 14px">
<div style="font-size:11px;font-weight:700;color:var(--red);margin-bottom:3px">⚠️ 30-Day Unsold Policy</div>
<div style="font-size:11px;color:var(--muted2);line-height:1.5">Items past 30 days must be returned, relisted, or notify consigner.</div>
</div>
`: ''} ${tabItems.length===0 ?`
<div class="empty"><div class="ei">${state.invTab===‘returned’?‘📦’:state.invTab===‘sold’?‘🎉’:‘👕’}</div><div class="et">No ${state.invTab} Items</div><div class="es">Nothing here yet.</div></div>
`: tabItems.map(l => { const isSold = l.status==='sold'; const ph = l.photos?.find(Boolean); const days = Math.floor((Date.now()-l.createdAt)/86400000) || 0; const isUnsold = state.invTab==='unsold'; return`<div class="icard ${isUnsold?'warn':''}">
<div class="ic-top">
<div class="ic-img">${ph?`<img src="${ph}" alt="">`:‘👕’}</div>
<div>
<div class="ic-name">${esc(l.name)}</div>
<div class="ic-sub">👤 ${esc(l.custName)} · ${esc(l.size)}</div>
</div>
<div style="margin-left:auto;text-align:right">
<div class="ic-price" style="${isUnsold?'color:var(--red)':isSold?'color:var(--green)':''}">Rs.${l.price.toLocaleString()}</div>
<div class="ic-days ${isUnsold?'red':''}">${isSold?‘✓ Sold’:`${days}d listed`}</div>
</div>
</div>
${lcTrack(isSold?4:isUnsold?3:2, isSold, isUnsold && !isSold)}
<div class="ic-actions">
${isSold ? `<div style="font-size:12px;color:var(--green);font-weight:700;padding:4px 12px 12px">✓ Sold — split processed</div>` :
isUnsold ? `<button class="ia ia-ret" onclick="state.modal={type:'return',id:'${l.id}'};render()">↩ Return</button> <button class="ia ia-low" onclick="toast('💸 Price reduced!','#eab308')">↓ Relist</button> <button class="ia ia-msg" onclick="toast('📣 Notified!','#3b82f6')">Notify</button>` : `<button class="ia ia-sold" onclick="markSold('${l.id}')">✓ Mark Sold</button> <button class="ia ia-low" onclick="toast('💸 Price reduced!','#eab308')">↓ Lower</button> <button class="ia ia-msg" onclick="toast('📣 Notified!','#3b82f6')">Notify</button>`}
</div>
</div>`;
}).join(’’)}
<div class="gap"></div>
</div>

  </div>`;
}

function renderOwnerProfit() {
const st = getStats();
const ownerProfit = st.soldItems.reduce((s,i)=>s+Math.round(i.price*(1-SPLIT)),0);
const ownerSales = st.soldItems.reduce((s,i)=>s+i.price,0);
const ownerPaidOut = st.soldItems.reduce((s,i)=>s+Math.round(i.price*SPLIT),0);
return `<div class="screen">${sb('')} <div class="topbar" style="padding-bottom:8px"> <div class="logo">Profit</div> <div class="ibtn">📊</div> </div> <div class="sa"> <div class="earn-card earn-o"> <div class="earn-lbl">My Total Earned</div> <div class="earn-amt">Rs. ${ownerProfit.toLocaleString()}</div> <div class="earn-sub">${st.soldItems.length} sold</div> <div class="earn-row"> <div class="em"><div class="em-v">Rs.${ownerSales.toLocaleString()}</div><div class="em-l">Sales</div></div> <div class="em"><div class="em-v">Rs.${ownerPaidOut.toLocaleString()}</div><div class="em-l">Paid Out</div></div> <div class="em"><div class="em-v">${st.listedItems.length}</div><div class="em-l">Active</div></div> </div> </div> <div class="sec-lbl" style="margin-bottom:14px">Deal History</div> ${st.soldItems.length===0 && st.rejectedItems.length===0 ? `
<div class="empty"><div class="ei">💰</div><div class="et">No Deals Yet</div><div class="es">Accept & sell items to see profit here.</div></div>
`: [...st.soldItems, ...st.rejectedItems].map(d => { const sold = d.status==='sold'; const cut = sold?Math.round(d.price*(1-SPLIT)):0; const theirCut = sold?Math.round(d.price*SPLIT):0; const ph = d.photos?.find(Boolean); return`<div class="deal-card">
<div class="dc-top">
<div class="dc-img">${ph?`<img src="${ph}" alt="">`:‘👕’}</div>
<div><div class="dc-name">${esc(d.name)}</div><div class="dc-from">👤 ${esc(d.custName)}</div></div>
<div class="dc-badge ${sold?'dbs':'dbr'}">${sold?‘SOLD’:‘REJECTED’}</div>
</div>
${sold ? `<div class="sbar"><div class="sfill" style="width:${(1-SPLIT)*100}%"></div></div> <div class="slbls"> <span class="sm-r">My cut: Rs.${cut.toLocaleString()}</span> <span class="sth">${esc(d.custName)}: Rs.${theirCut.toLocaleString()}</span> </div>` : ‘’}
<div class="snote">Listed Rs.${d.price.toLocaleString()} · ${esc(d.pickMethod)}</div>
</div>`;
}).join(’’)}
<div class="gap"></div>
</div>

  </div>`;
}

function renderOwnerAlerts() {
const st = getStats();
return `<div class="screen">${sb('')} <div class="topbar"><div class="logo">Alerts</div></div> <div class="sa"> <div class="sec-lbl" style="margin-bottom:14px">Live Notifications</div> <div class="notif-list"> ${state.interestedIds.map(id => { const it = state.items.find(i => i.id===id); if (!it) return ''; return `<div class="nitem unread">
<div class="ni-ico ico-buy">🛒</div>
<div>
<div class="ni-title">Buyer Interest: ${esc(it.name)}</div>
<div class="ni-sub">Customer wants this · Rs.${it.price.toLocaleString()}</div>
<div class="ni-time">Just now</div>
</div>
</div>`; }).join('')} ${st.pendingItems.map(it => `<div class="nitem unread">
<div class="ni-ico ico-pend">⏱</div>
<div>
<div class="ni-title">New Submission: ${esc(it.name)}</div>
<div class="ni-sub">By ${esc(it.custName)} · Rs.${it.price.toLocaleString()}</div>
<div class="ni-time">Just now</div>
<div class="ni-act" onclick="setTab('o',1);setScreen('o-curate')">Curate Now →</div>
</div>
</div>`).join('')} ${st.soldItems.map(it => `<div class="nitem">
<div class="ni-ico ico-sold">🎉</div>
<div>
<div class="ni-title">SOLD: ${esc(it.name)}</div>
<div class="ni-sub">Rs.${it.price.toLocaleString()} · Your cut: Rs.${Math.round(it.price*(1-SPLIT)).toLocaleString()}</div>
</div>
</div>`).join('')} ${state.items.length===0 && state.interestedIds.length===0 ? `
<div class="empty"><div class="ei">🔔</div><div class="et">No Alerts</div><div class="es">Submissions & buyer interest appear here.</div></div>
` : ‘’}
</div>
<div class="gap"></div>
</div>

  </div>`;
}

// ═══════════════════════════════════════════════════════════════════
// NAV & MODALS
// ═══════════════════════════════════════════════════════════════════

function renderOwnerNav() {
const st = getStats();
const items = [
{sc:‘o-home’,l:‘Home’,i:ICONS.home},
{sc:‘o-curate’,l:‘Curate’,i:ICONS.check,dot:st.pendingItems.length>0},
{sc:‘o-inventory’,l:‘Stock’,i:ICONS.box},
{sc:‘o-profit’,l:‘Profit’,i:ICONS.cash},
{sc:‘o-alerts’,l:‘Alerts’,i:ICONS.bell,dot:st.pendingItems.length>0 || state.interestedIds.length>0},
];
return `<nav class="nav">${items.map((n, i) => `
<button class="ni ${state.oTab===i?'on':''}" onclick="setTab('o',${i});setScreen('${n.sc}')">
${n.i}${n.l}${n.dot?’<div class="ndot"></div>’:’’}
</button>
`).join('')}</nav>`;
}

function renderCustomerNav() {
const items = [
{sc:‘c-home’,l:‘Home’,i:ICONS.home},
{sc:‘c-shop’,l:‘Shop’,i:ICONS.cart},
{sc:‘c-consign’,l:‘Consign’,i:ICONS.plus},
{sc:‘c-myitems’,l:‘My Items’,i:ICONS.bag},
{sc:‘c-earnings’,l:‘Earnings’,i:ICONS.cash},
];
return `<nav class="nav">${items.map((n, i) => `
<button class="ni ${state.cTab===i?'on':''}" onclick="setTab('c',${i});setScreen('${n.sc}')">
${n.i}${n.l}
</button>
`).join('')}</nav>`;
}

function renderReturnModal() {
const opts = [
{t:‘🔄 Return to Consigner’, d:‘Send back — they keep or retry later.’},
{t:‘💸 Reduce Price & Relist’, d:‘Drop price to boost chances.’},
{t:‘📣 Notify Consigner First’, d:‘Message them before deciding.’},
];
return `<div class="modal-ov" onclick="closeModal()"> <div class="modal" onclick="event.stopPropagation()"> <div class="mhandle"></div> <div class="mtitle">📦 Return to Consigner</div> <div class="msub">Item unsold. Choose next action.</div> <div class="ret-opts"> ${opts.map((o, i) => `
<div class="ropt ${state.retSel===i?'sel':''}" onclick="state.retSel=${i};render()">
<div class="ropt-radio"></div>
<div><div class="ropt-title">${o.t}</div><div class="ropt-desc">${o.d}</div></div>
</div>
`).join(’’)}
</div>
<button class="btn btn-rust" onclick="initiateReturn('${state.modal.id}')">Confirm</button>
<button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
</div>

  </div>`;
}

function renderBuyModal() {
const item = state.modal.item;
const ph = item.photos?.find(Boolean);
return `<div class="modal-ov" onclick="closeModal()"> <div class="modal" onclick="event.stopPropagation()"> <div class="mhandle"></div> <div class="mtitle">🛒 ${esc(item.name)}</div> <div class="msub">Contact owner to confirm availability & arrange purchase</div> <div class="buy-hero">${ph?`<img src="${ph}" alt="">`:‘👕’}</div>
<div class="buy-meta">
<div class="buy-row"><span class="buy-k">Brand</span><span class="buy-v">${esc(item.brand)}</span></div>
<div class="buy-row"><span class="buy-k">Size</span><span class="buy-v">${esc(item.size)}</span></div>
<div class="buy-row"><span class="buy-k">Category</span><span class="buy-v">${esc(item.cat)}</span></div>
<div class="buy-row"><span class="buy-k">Price</span><span class="buy-v" style="color:var(--rust);font-family:'Bebas Neue';font-size:18px">Rs.${item.price.toLocaleString()}</span></div>
</div>
<div style="font-size:11px;color:var(--muted2);text-align:center;margin-bottom:14px;line-height:1.5">💡 First to pay gets it!</div>
<button class="btn btn-wa" onclick="contactWhatsApp('${item.id}')">💬 MESSAGE OWNER ON WHATSAPP</button>
<button class="btn btn-ig" onclick="contactInstagram('${item.id}')">📸 DM ON INSTAGRAM</button>
<button class="btn btn-ghost" onclick="saveInterestOnly('${item.id}')">💚 Just Save Interest</button>
</div>

  </div>`;
}

// ═══════════════════════════════════════════════════════════════════
// MAIN RENDER
// ═══════════════════════════════════════════════════════════════════

function render() {
const screenHost = document.getElementById(‘screen-host’);
const navHost = document.getElementById(‘nav-host’);
const modalHost = document.getElementById(‘modal-host’);

let screenHTML = ‘’;
switch (state.screen) {
case ‘sc-setup’: screenHTML = renderSetup(); break;
case ‘o-login’: screenHTML = renderOwnerLogin(); break;
case ‘o-home’: screenHTML = renderOwnerHome(); break;
case ‘o-curate’: screenHTML = renderOwnerCurate(); break;
case ‘o-inventory’: screenHTML = renderOwnerInventory(); break;
case ‘o-profit’: screenHTML = renderOwnerProfit(); break;
case ‘o-alerts’: screenHTML = renderOwnerAlerts(); break;
case ‘c-home’: screenHTML = renderCustomerHome(); break;
case ‘c-shop’: screenHTML = renderCustomerShop(); break;
case ‘c-consign’: screenHTML = renderConsign(); break;
case ‘c-success’: screenHTML = renderSuccess(); break;
case ‘c-myitems’: screenHTML = renderMyItems(); break;
case ‘c-earnings’: screenHTML = renderEarnings(); break;
default: screenHTML = renderCustomerHome();
}
screenHost.innerHTML = screenHTML;

const isOwnerScreen = state.screen.startsWith(‘o-’) && state.screen !== ‘o-login’ && state.session?.role === ‘owner’;
const isCustomerScreen = state.screen.startsWith(‘c-’) && state.screen !== ‘c-success’;
navHost.innerHTML = isOwnerScreen ? renderOwnerNav() : isCustomerScreen ? renderCustomerNav() : ‘’;

if (state.modal?.type === ‘return’) modalHost.innerHTML = renderReturnModal();
else if (state.modal?.type === ‘buy’) modalHost.innerHTML = renderBuyModal();
else modalHost.innerHTML = ‘’;
}

// ═══════════════════════════════════════════════════════════════════
// ROUTING & INIT
// ═══════════════════════════════════════════════════════════════════

function initRoute() {
const init = window.location.hash.slice(1);
const valid = [‘o-login’,‘c-home’,‘c-shop’,‘c-consign’,‘c-myitems’,‘c-earnings’,‘o-home’,‘o-curate’,‘o-inventory’,‘o-profit’,‘o-alerts’,‘c-success’];
if (init === SECRET) {
if (state.owner) { state.screen = ‘o-login’; toast(‘🔒 Owner already registered’,’#ef4444’); }
else state.screen = ‘sc-setup’;
} else if (init && valid.includes(init)) {
if (init.startsWith(‘o-’) && init !== ‘o-login’ && !state.session) state.screen = ‘o-login’;
else state.screen = init;
} else {
state.screen = ‘c-home’;
}
render();
}

window.addEventListener(‘hashchange’, () => {
const h = window.location.hash.slice(1);
if (!h) return;
if (h === SECRET) {
if (state.owner) state.screen = ‘o-login’;
else state.screen = ‘sc-setup’;
render();
return;
}
if (h === ‘sc-setup’) { state.screen = ‘c-home’; window.location.hash = ‘c-home’; render(); return; }
if (h.startsWith(‘o-’) && h !== ‘o-login’ && state.session?.role !== ‘owner’) {
state.screen = ‘o-login’;
window.location.hash = ‘o-login’;
render();
return;
}
state.screen = h;
render();
});

// Expose functions globally for onclick handlers
window.setScreen = setScreen;
window.setTab = setTab;
window.handleSetupRegister = handleSetupRegister;
window.handleOwnerLogin = handleOwnerLogin;
window.logout = logout;
window.togCrit = togCrit;
window.verdict = verdict;
window.markSold = markSold;
window.initiateReturn = initiateReturn;
window.openBuyModal = openBuyModal;
window.expressInterest = expressInterest;
window.contactWhatsApp = contactWhatsApp;
window.contactInstagram = contactInstagram;
window.saveInterestOnly = saveInterestOnly;
window.setPhoto = setPhoto;
window.removePhoto = removePhoto;
window.submitConsign = submitConsign;
window.lookupItems = lookupItems;
window.toggleAcc = toggleAcc;
window.toggleSearch = toggleSearch;
window.closeModal = closeModal;
window.toast = toast;
window.render = render;
window.state = state;

// Boot
initRoute();
