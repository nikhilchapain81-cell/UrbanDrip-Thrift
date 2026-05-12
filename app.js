const SPLIT = 0.6;
const PICK_LABELS = ['Drop-off', 'We Pick Up', 'Courier', 'Shop Handover'];
const OWNER_WHATSAPP = '977980000000';
const OWNER_INSTAGRAM = 'urbandrip.np';
const SECRET = 'setup-owner-secret-x9k2';
const tinyHash = (s) => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return String(h);
};

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const state = {
  owner: null,
  customers: [],
  items: [
    {id:'UDT-1001',custId:'demo1',custName:'Rohan',name:'Nike Tech Fleece',brand:'Nike',size:'L',cat:'Hoodie / Sweatshirt',price:3500,status:'listed',pickMethod:'Drop-off',createdAt:Date.now()-86400000,photos:[null,null,null,null,null],crits:[0,0,0,0]},
    {id:'UDT-1002',custId:'demo2',custName:'Aarav',name:'Carhartt Detroit Jacket',brand:'Carhartt',size:'M',cat:'Jacket / Coat',price:5200,status:'listed',pickMethod:'Courier',createdAt:Date.now()-172800000,photos:[null,null,null,null,null],crits:[0,0,0,0]},
    {id:'UDT-1003',custId:'demo3',custName:'Priya',name:'Stussy Box Logo Tee',brand:'Stussy',size:'M',cat:'T-Shirt',price:1800,status:'listed',pickMethod:'Drop-off',createdAt:Date.now()-43200000,photos:[null,null,null,null,null],crits:[0,0,0,0]},
    {id:'UDT-1004',custId:'demo4',custName:'Sita',name:'Adidas Samba OG',brand:'Adidas',size:'42',cat:'Shoes',price:4800,status:'listed',pickMethod:'Shop Handover',createdAt:Date.now()-21600000,photos:[null,null,null,null,null],crits:[0,0,0,0]},
    {id:'UDT-1005',custId:'demo5',custName:'Bikash',name:'Supreme Box Logo Hoodie',brand:'Supreme',size:'L',cat:'Hoodie / Sweatshirt',price:8500,status:'listed',pickMethod:'Drop-off',createdAt:Date.now()-129600000,photos:[null,null,null,null,null],crits:[0,0,0,0]},
    {id:'UDT-1006',custId:'demo6',custName:'Nisha',name:"Levi's 501 Vintage",brand:"Levi's",size:'32',cat:'Denim / Pants',price:2400,status:'pending',pickMethod:'We Pick Up',createdAt:Date.now()-7200000,photos:[null,null,null,null,null],crits:[0,0,0,0]},
    {id:'UDT-1007',custId:'demo7',custName:'Ramesh',name:'Old Champion Hoodie',brand:'Champion',size:'L',cat:'Hoodie / Sweatshirt',price:2200,status:'listed',pickMethod:'Drop-off',createdAt:Date.now()-(35*86400000),photos:[null,null,null,null,null],crits:[0,0,0,0]},
  ],
  session: null,
  screen: 'c-home',
  modal: null,
  oTab: 0, cTab: 0, invTab: 'active',
  setupForm: { name:'', phone:'', pass:'', pass2:'' },
  loginForm: { phone:'', pass:'' },
  whoType: 'ind',
  photos: [null,null,null,null,null],
  pickIdx: 0, condIdx: 1,
  itemForm: { name:'', brand:'', size:'', cat:'Hoodie / Sweatshirt', price:'' },
  profileInd: { name:'', phone:'', loc:'' },
  lastRef: { ref:'', pick:'' },
  accOpen: { profile: true, photos: true, details: false, send: false },
  retSel: 0,
  lookupPhone: '',
  interestedIds: [],
  shopFilter: 'all',
  searchQuery: '',
  showSearch: false,
};

const ICONS = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
  cash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>',
  bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>',
  cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>',
};

let toastTimer;
function toast(msg, bg = '#22c55e') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.background = bg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

function setScreen(name) {
  state.screen = name;
  if (window.location.hash !== '#' + name) {
    try { window.location.hash = name; } catch(e) {}
  }
  render();
}

function setTab(role, idx) {
  if (role === 'o') state.oTab = idx;
  else state.cTab = idx;
}

function getStats() {
  const items = state.items;
  const s = state.session;
  const myItems = items.filter(i => s?.role === 'customer' && i.custId === s.id);
  return {
    myItems,
    myActive: myItems.filter(i => i.status === 'listed').length,
    mySold: myItems.filter(i => i.status === 'sold').length,
    myEarned: myItems.filter(i => i.status === 'sold').reduce((a, i) => a + Math.round(i.price * SPLIT), 0),
    mySalesGross: myItems.filter(i => i.status === 'sold').reduce((a, i) => a + i.price, 0),
    pendingItems: items.filter(i => i.status === 'pending'),
    listedItems: items.filter(i => i.status === 'listed'),
    soldItems: items.filter(i => i.status === 'sold'),
    unsoldItems: items.filter(i => i.status === 'listed' && Math.floor((Date.now() - i.createdAt) / 86400000) >= 30),
    returnedItems: items.filter(i => i.status === 'returned'),
    rejectedItems: items.filter(i => i.status === 'rejected'),
  };
}

function getShopItems() {
  const s = state.session;
  return state.items.filter(i => {
    if (i.status !== 'listed') return false;
    if (s?.role === 'customer' && i.custId === s.id) return false;
    if (state.shopFilter !== 'all' && !(i.cat || '').toLowerCase().includes(state.shopFilter)) return false;
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase().trim();
      const hay = (i.name + ' ' + i.brand + ' ' + i.cat + ' ' + i.size).toLowerCase();
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
  const cols = ['#dc2626','#dc2626','#ca8a04','#ca8a04','#16a34a'];
  const lbls = ['Too weak','Weak','Fair','Good','Strong'];
  const i = Math.max(0, s - 1);
  return { pct: s * 20, color: cols[i], label: v.length ? lbls[i] : '' };
}function updateForm(formName, field, value) {
  state[formName][field] = value;
}
function updateState(key, value) {
  state[key] = value;
  render();
}

function handleSetupRegister() {
  const { name, phone, pass, pass2 } = state.setupForm;
  if (!name || !phone || !pass || !pass2) return toast('Fill all fields', '#ef4444');
  if (phone.length < 9) return toast('Valid phone required', '#ef4444');
  if (pass.length < 6) return toast('Min 6 chars', '#ef4444');
  if (pass !== pass2) return toast('Passwords do not match', '#ef4444');
  state.owner = { id: 'O1', name, phone, passHash: tinyHash(pass) };
  toast(name + ' registered!');
  setTimeout(() => { setScreen('c-home'); toast('Setup done!', '#e8440a'); }, 700);
}

function handleOwnerLogin() {
  const { phone, pass } = state.loginForm;
  if (!phone || !pass) return toast('Enter phone & password', '#ef4444');
  if (!state.owner) return toast('No owner registered yet', '#ef4444');
  if (state.owner.phone !== phone) return toast('Phone not registered', '#ef4444');
  if (tinyHash(pass) !== state.owner.passHash) return toast('Wrong password', '#ef4444');
  state.session = { role: 'owner', name: state.owner.name, id: state.owner.id };
  state.loginForm = { phone: '', pass: '' };
  state.oTab = 0;
  setScreen('o-home');
  toast('Welcome, ' + state.owner.name + '!', '#e8440a');
}

function logout() {
  const wasOwner = state.session?.role === 'owner';
  state.session = null;
  state.loginForm = { phone: '', pass: '' };
  state.cTab = 0;
  setScreen('c-home');
  toast(wasOwner ? 'Owner signed out' : 'Signed out', '#777');
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
    item.status = type === 'accept' ? 'listed' : 'rejected';
    item.verdictAt = Date.now();
    toast(type === 'accept' ? 'Accepted & listed!' : 'Rejected', type === 'accept' ? '#22c55e' : '#ef4444');
    render();
  }
}

function markSold(id) {
  const item = state.items.find(i => i.id === id);
  if (item) {
    item.status = 'sold';
    item.soldAt = Date.now();
    toast('Item sold!');
    render();
  }
}

function initiateReturn(id) {
  const item = state.items.find(i => i.id === id);
  if (item) {
    item.status = 'returned';
    item.returnedAt = Date.now();
    state.modal = null;
    toast('Return initiated', '#3b82f6');
    render();
  }
}

function openBuyModal(itemId) {
  const item = state.items.find(i => i.id === itemId);
  if (item) { state.modal = { type: 'buy', item }; render(); }
}

function expressInterest(itemId) {
  if (!state.interestedIds.includes(itemId)) {
    state.interestedIds.push(itemId);
  }
  toast('Interest noted! Owner will contact you.', '#22c55e');
}

function contactWhatsApp(itemId) {
  const item = state.items.find(i => i.id === itemId);
  if (!item) return;
  const msg = encodeURIComponent("Hi! I'm interested in: " + item.name + " (" + item.brand + ", size " + item.size + ") - Rs." + item.price.toLocaleString() + ". Is it still available?");
  expressInterest(itemId);
  try { window.open('https://wa.me/' + OWNER_WHATSAPP + '?text=' + msg, '_blank'); } catch(e) {}
  state.modal = null;
  render();
}

function contactInstagram(itemId) {
  expressInterest(itemId);
  try { window.open('https://instagram.com/' + OWNER_INSTAGRAM, '_blank'); } catch(e) {}
  state.modal = null;
  toast('Send a DM about this item!', '#dc2743');
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
  fileInput.value = '';
}

function removePhoto(slot, evt) {
  if (evt) { evt.preventDefault(); evt.stopPropagation(); }
  state.photos[slot] = null;
  render();
}

function submitConsign() {
  const { name, brand, size, price } = state.itemForm;
  let activeSession = state.session;
  if (!activeSession || activeSession.role !== 'customer') {
    if (!state.profileInd.name || !state.profileInd.phone) {
      state.accOpen.profile = true;
      render();
      return toast('Fill name & phone in profile', '#ef4444');
    }
    let c = state.customers.find(c => c.phone === state.profileInd.phone);
    if (!c) {
      c = { id: 'C' + (state.customers.length + 1), name: state.profileInd.name, phone: state.profileInd.phone };
      state.customers.push(c);
    }
    state.session = { role: 'customer', name: c.name, id: c.id, phone: c.phone };
    activeSession = state.session;
  }
  if (!name || !brand || !size || !price) return toast('Fill name, brand, size & price', '#ef4444');
  if (state.photos.filter(Boolean).length === 0) return toast('Upload at least 1 photo', '#ef4444');
  const ref = 'UDT-' + (2000 + state.items.length + 1);
  const pickMethod = PICK_LABELS[state.pickIdx];
  state.items.push({
    id: ref, custId: activeSession.id, custName: activeSession.name,
    name, brand, size, cat: state.itemForm.cat,
    price: parseInt(price, 10), status: 'pending',
    pickMethod, createdAt: Date.now(),
    photos: [...state.photos], crits: [0,0,0,0],
  });
  state.lastRef = { ref: '#' + ref, pick: pickMethod };
  state.itemForm = { name: '', brand: '', size: '', cat: 'Hoodie / Sweatshirt', price: '' };
  state.photos = [null,null,null,null,null];
  state.accOpen = { profile: true, photos: true, details: false, send: false };
  setScreen('c-success');
  toast('Submitted! Owner will review.');
}

function lookupItems() {
  if (!state.lookupPhone || state.lookupPhone.length < 9) return toast('Enter valid phone', '#ef4444');
  const c = state.customers.find(c => c.phone === state.lookupPhone);
  if (!c) return toast('No items found', '#ef4444');
  state.session = { role: 'customer', name: c.name, id: c.id, phone: c.phone };
  toast('Welcome back, ' + c.name + '!', '#3b82f6');
  render();
}

function toggleAcc(key) {
  state.accOpen[key] = !state.accOpen[key];
  render();
}

function toggleSearch() {
  state.showSearch = !state.showSearch;
  if (!state.showSearch) state.searchQuery = '';
  render();
}

function closeModal() {
  state.modal = null;
  render();
}

function sb(rightHtml) {
  return '<div class="sb"><span class="sb-time">9:41</span><span style="display:flex;gap:8px;align-items:center">' + (rightHtml || '') + '</span></div>';
}

function lcTrack(stage, ok, warn) {
  const labels = ['Submitted','Accepted','Listed','Sold','Paid'];
  let html = '<div class="lc"><div class="lc-track">';
  for (let i = 0; i < 5; i++) {
    const dot = i < stage ? (ok ? 'ok' : 'done') : i === stage ? (warn ? 'warn' : ok ? 'ok' : 'cur') : '';
    const line = i < stage ? (ok ? 'ok' : 'done') : (i === stage && warn) ? 'warn' : '';
    html += '<div class="lcd ' + dot + '"></div>';
    if (i < 4) html += '<div class="lcl ' + line + '"></div>';
  }
  html += '</div><div class="lc-lbls">';
  labels.forEach((l, i) => {
    let style = '';
    if (i === stage && warn) style = 'color:var(--red)';
    else if (i === stage && ok) style = 'color:var(--green)';
    else if (i === stage) style = 'color:var(--rust)';
    const txt = (warn && i === stage) ? 'Unsold' : (ok && i === 4) ? 'Done' : l;
    html += '<span style="' + style + '">' + txt + '</span>';
  });
  html += '</div></div>';
  return html;
}function litem(item) {
  const ph = item.photos?.find(Boolean);
  return '<div class="litem">' +
    '<div class="li-thumb">' + (ph ? '<img src="' + ph + '" alt="">' : '👕') + '</div>' +
    '<div class="li-info">' +
      '<div class="li-brand">' + esc(item.brand) + '</div>' +
      '<div class="li-name">' + esc(item.name) + '</div>' +
      '<div class="li-sub">' + esc(item.size) + ' · ' + esc(item.custName) + '</div>' +
    '</div>' +
    '<div class="li-right"><div class="li-price">Rs.' + item.price.toLocaleString() + '</div></div>' +
  '</div>';
}

function shopCard(item) {
  const ph = item.photos?.find(Boolean);
  const interested = state.interestedIds.includes(item.id);
  return '<div class="shop-card ' + (interested ? 'interested' : '') + '" onclick="openBuyModal(\'' + item.id + '\')">' +
    '<div class="shop-img">' +
      (ph ? '<img src="' + ph + '" alt="">' : '👕') +
      '<div class="shop-tag">' + esc(item.cat || 'Item') + '</div>' +
      (interested ? '<div class="shop-int-badge">💚 Saved</div>' : '') +
    '</div>' +
    '<div class="shop-body">' +
      '<div class="shop-brand">' + esc(item.brand) + '</div>' +
      '<div class="shop-name">' + esc(item.name) + '</div>' +
      '<div class="shop-row">' +
        '<div class="shop-price">Rs.' + item.price.toLocaleString() + '</div>' +
        '<div class="shop-size">Size ' + esc(item.size) + '</div>' +
      '</div>' +
      '<button class="shop-btn ' + (interested ? 'done' : '') + '">' + (interested ? '✓ INTERESTED' : '🛒 I WANT THIS') + '</button>' +
    '</div>' +
  '</div>';
}

function renderSetup() {
  const s = strength(state.setupForm.pass);
  return '<div class="screen">' + sb('') +
    '<div class="login-wrap">' +
      '<div style="font-size:48px;margin-bottom:12px">👑</div>' +
      '<div class="logo" style="font-size:42px">Setup <em>Owner</em></div>' +
      '<div class="tagline">One-time setup</div>' +
      '<div class="notice-box">' +
        '<div class="nb-title">One-Time Setup</div>' +
        '<div class="nb-body">Only one owner account is allowed.</div>' +
      '</div>' +
      '<div style="display:flex;justify-content:center;margin-bottom:28px">' +
        '<div class="slot ' + (state.owner ? 'done' : 'cur') + '">' + (state.owner ? '✓' : '1') + '</div>' +
      '</div>' +
      '<div class="form-wrap">' +
        '<div class="fl"><label>Full Name</label>' +
          '<input class="fi" placeholder="e.g. Aayush" value="' + esc(state.setupForm.name) + '" oninput="state.setupForm.name=this.value">' +
        '</div>' +
        '<div class="fl"><label>Phone</label>' +
          '<input class="fi" type="tel" placeholder="98XXXXXXXX" value="' + esc(state.setupForm.phone) + '" oninput="state.setupForm.phone=this.value">' +
        '</div>' +
        '<div class="fl"><label>Password</label>' +
          '<input class="fi" type="password" placeholder="Min 6 chars" value="' + esc(state.setupForm.pass) + '" oninput="state.setupForm.pass=this.value;render()">' +
          '<div style="height:3px;background:var(--border);border-radius:2px;margin-top:6px"><div style="height:100%;width:' + s.pct + '%;background:' + s.color + ';border-radius:2px;transition:all .3s"></div></div>' +
          '<div style="font-size:10px;margin-top:4px;text-align:right;color:' + s.color + '">' + s.label + '</div>' +
        '</div>' +
        '<div class="fl"><label>Confirm Password</label>' +
          '<input class="fi" type="password" placeholder="Re-enter" value="' + esc(state.setupForm.pass2) + '" oninput="state.setupForm.pass2=this.value">' +
        '</div>' +
        '<button class="btn btn-rust" onclick="handleSetupRegister()">REGISTER OWNER</button>' +
      '</div>' +
    '</div>' +
  '</div>';
}

function renderOwnerLogin() {
  return '<div class="screen">' + sb('') +
    '<div class="login-wrap">' +
      '<div style="font-size:42px;margin-bottom:8px">👑</div>' +
      '<div class="logo">Owner <em>Access</em></div>' +
      '<div class="tagline">Restricted · Authorized only</div>' +
      '<div class="notice-box" style="margin-top:20px">' +
        '<div class="nb-title">Owner Sign In</div>' +
        '<div class="nb-body">' + (state.owner ? 'Enter your registered phone & password.' : 'No owner yet. Tap register below.') + '</div>' +
      '</div>' +
      '<div class="form-wrap">' +
        '<div class="fl"><label>Phone</label>' +
          '<input class="fi" type="tel" placeholder="98XXXXXXXX" value="' + esc(state.loginForm.phone) + '" oninput="state.loginForm.phone=this.value">' +
        '</div>' +
        '<div class="fl"><label>Password</label>' +
          '<input class="fi" type="password" placeholder="Password" value="' + esc(state.loginForm.pass) + '" oninput="state.loginForm.pass=this.value">' +
        '</div>' +
        '<button class="btn btn-rust" onclick="handleOwnerLogin()">SIGN IN AS OWNER</button>' +
        (!state.owner ? '<button class="btn btn-blue" onclick="setScreen(\'sc-setup\')">Register New Owner</button>' : '') +
        '<button class="btn btn-ghost" onclick="setScreen(\'c-home\')">Back to Shop</button>' +
      '</div>' +
    '</div>' +
  '</div>';
}

function renderCustomerHome() {
  const st = getStats();
  const shopItems = getShopItems();
  const rightHtml = state.session?.role === 'customer'
    ? '<span class="rbadge rb-c">👕 ' + esc(state.session.name) + '</span><span class="ibtn" onclick="logout()">🚪</span>'
    : '<span class="ibtn" onclick="setScreen(\'o-login\')">👑</span>';
  let html = '<div class="screen">' + sb(rightHtml) +
    '<div class="topbar"><div class="logo">Urban<em>Drip</em></div></div>' +
    '<div class="sa">' +
      '<div class="hero hero-shop">' +
        '<div class="htag htag-s">🛒 Live Marketplace</div>' +
        '<h2>SHOP THE<br>STREET DRIP.</h2>' +
        '<p>' + st.listedItems.length + ' curated · Nike · Adidas · Carhartt · Supreme</p>' +
        '<button class="hbtn hbtn-s" onclick="setTab(\'c\',1);setScreen(\'c-shop\')">BROWSE ALL</button>' +
      '</div>' +
      '<div class="hero hero-c">' +
        '<div class="htag htag-c">Sell & Earn 60%</div>' +
        '<h2>CONSIGN.<br>EARN. REPEAT.</h2>' +
        '<p>Got old clothes? We sell them. You earn 60%.</p>' +
        '<button class="hbtn hbtn-c" onclick="setTab(\'c\',2);setScreen(\'c-consign\')">CONSIGN MY CLOTHES</button>' +
      '</div>' +
      '<div class="stats3">' +
        '<div class="stat"><div class="sv" style="color:var(--blue)">' + st.myActive + '</div><div class="sl">Listed</div></div>' +
        '<div class="stat"><div class="sv" style="color:var(--green)">' + st.mySold + '</div><div class="sl">Sold</div></div>' +
        '<div class="stat"><div class="sv" style="color:var(--yellow);font-size:18px">Rs.' + st.myEarned.toLocaleString() + '</div><div class="sl">Earned</div></div>' +
      '</div>';
  if (shopItems.length > 0) {
    html += '<div class="sec-row">' +
      '<div class="sec-lbl">🔥 Hot Drops</div>' +
      '<div class="see-all" onclick="setTab(\'c\',1);setScreen(\'c-shop\')">See all (' + shopItems.length + ')</div>' +
    '</div>' +
    '<div class="shop-grid">' + shopItems.slice(0,4).map(shopCard).join('') + '</div>';
  }
  const myListed = st.myItems.filter(i => i.status === 'listed');
  if (myListed.length > 0) {
    html += '<div class="sec-row">' +
      '<div class="sec-lbl">My Listed Items</div>' +
      '<div class="see-all" onclick="setTab(\'c\',3);setScreen(\'c-myitems\')">See all</div>' +
    '</div>' +
    '<div>' + myListed.slice(0,2).map(litem).join('') + '</div>';
  }
  html += '<div class="gap"></div></div></div>';
  return html;
}function renderCustomerShop() {
  const filters = ['all','hoodie','t-shirt','denim','jacket','shoes'];
  const shopItems = getShopItems();
  let rightHtml;
  if (state.session?.role === 'customer') {
    rightHtml = '<span class="rbadge rb-c">👕 ' + esc(state.session.name) + '</span>';
    if (state.interestedIds.length > 0) {
      rightHtml += '<span class="rbadge rb-g">💚 ' + state.interestedIds.length + '</span>';
    }
  } else {
    rightHtml = '<span class="ibtn" onclick="setScreen(\'o-login\')">👑</span>';
  }
  let html = '<div class="screen">' + sb(rightHtml) +
    '<div class="topbar">' +
      '<div class="logo">Shop <em>Drip</em></div>' +
      '<div class="ibtn" onclick="toggleSearch()" style="' + (state.showSearch ? 'background:var(--rust);border-color:var(--rust)' : '') + '">' + (state.showSearch ? '✕' : '🔍') + '</div>' +
    '</div>' +
    '<div class="sa">';
  if (state.showSearch) {
    html += '<div class="search-wrap"><div class="search-input">' +
      '<input type="text" placeholder="Search by name, brand, size..." value="' + esc(state.searchQuery) + '" oninput="state.searchQuery=this.value;render()">';
    if (state.searchQuery) {
      html += '<span class="search-clear" onclick="state.searchQuery=\'\';render()">✕</span>';
    }
    html += '</div>';
    if (state.searchQuery) {
      html += '<div class="search-meta">' + shopItems.length + ' RESULT' + (shopItems.length !== 1 ? 'S' : '') + ' FOR "' + esc(state.searchQuery.toUpperCase()) + '"</div>';
    }
    html += '</div>';
  }
  html += '<div class="cat-chips">';
  filters.forEach(f => {
    html += '<button class="cat-chip ' + (state.shopFilter === f ? 'on' : '') + '" onclick="state.shopFilter=\'' + f + '\';render()">' + (f === 'all' ? 'All Items' : f) + '</button>';
  });
  html += '</div>';
  if (shopItems.length === 0) {
    html += '<div class="empty">' +
      '<div class="ei">' + (state.searchQuery ? '🔍' : '🛍️') + '</div>' +
      '<div class="et">' + (state.searchQuery ? 'No Matches' : 'No Items') + '</div>' +
      '<div class="es">' + (state.searchQuery ? 'Nothing matches "' + esc(state.searchQuery) + '"' : 'Check back soon!') + '</div>' +
    '</div>';
  } else {
    html += '<div class="sec-lbl">' + shopItems.length + ' Items Available</div>' +
      '<div class="shop-grid">' + shopItems.map(shopCard).join('') + '</div>';
  }
  html += '<div class="gap"></div></div></div>';
  return html;
}

function renderConsign() {
  const profileFilled = state.whoType === 'ind' ? !!(state.profileInd.phone && state.profileInd.loc) : false;
  const photoCount = state.photos.filter(Boolean).length;
  const detailsFilled = !!(state.itemForm.name && state.itemForm.brand && state.itemForm.size && state.itemForm.price);
  const sendLabel = ['Drop-off','Pick Up','Courier','Shop'][state.pickIdx];

  function acc(id, num, title, status, statusOn, body) {
    let h = '<div class="acc"><button class="acc-btn" onclick="toggleAcc(\'' + id + '\')">' +
      '<span class="acc-slot ' + (statusOn ? 'done' : '') + '">' + (statusOn ? '✓' : num) + '</span>' +
      '<span class="acc-title">' + title + '</span>' +
      '<span class="acc-status ' + (statusOn ? 'done' : '') + '">' + status + '</span>' +
      '<span class="acc-arrow">' + (state.accOpen[id] ? '▾' : '▸') + '</span>' +
    '</button>';
    if (state.accOpen[id]) h += '<div class="acc-body">' + body + '</div>';
    h += '</div>';
    return h;
  }

  let profileBody;
  if (state.whoType === 'ind') {
    profileBody = '<div class="pcard">' +
      '<div class="pcard-top">' +
        '<div class="pav">😊</div>' +
        '<div>' +
          '<div class="pcard-name">' + esc(state.profileInd.name || state.session?.name || 'Your Name') + '</div>' +
          '<div class="pcard-type">Individual Consigner</div>' +
        '</div>' +
      '</div>' +
      '<div class="pcard-fields">' +
        '<div class="pf"><span>👤</span><input placeholder="Full Name" value="' + esc(state.profileInd.name) + '" oninput="state.profileInd.name=this.value"></div>' +
        '<div class="pf"><span>📱</span><input placeholder="Phone Number" type="tel" value="' + esc(state.profileInd.phone) + '" oninput="state.profileInd.phone=this.value"></div>' +
        '<div class="pf"><span>📍</span><input placeholder="Your Area" value="' + esc(state.profileInd.loc) + '" oninput="state.profileInd.loc=this.value"></div>' +
      '</div>' +
    '</div>';
  } else {
    profileBody = '<div class="pcard">' +
      '<div class="pcard-top"><div class="pav">🏪</div><div><div class="pcard-name">Shop Name</div><div class="pcard-type">Shop Partner</div></div></div>' +
      '<div class="pcard-fields">' +
        '<div class="pf"><span>🏪</span><input placeholder="Shop Name"></div>' +
        '<div class="pf"><span>👤</span><input placeholder="Owner / Contact"></div>' +
        '<div class="pf"><span>📱</span><input placeholder="Phone" type="tel"></div>' +
        '<div class="pf"><span>📍</span><input placeholder="Shop Address"></div>' +
      '</div>' +
    '</div>';
  }

  let photosBody = '<div class="photo-grid">';
  ['MAIN','BACK','DETAIL','TAG','MORE'].forEach((label, i) => {
    photosBody += '<label class="pslot ' + (i === 0 ? 'main-s' : '') + ' ' + (state.photos[i] ? 'filled' : '') + '">' +
      '<input type="file" accept="image/*" style="display:none" onchange="setPhoto(' + i + ',this)">';
    if (state.photos[i]) {
      if (i === 0) photosBody += '<div class="mbadge">MAIN</div>';
      photosBody += '<img src="' + state.photos[i] + '" alt="">' +
        '<span class="px-remove" onclick="removePhoto(' + i + ',event)">✕</span>';
    } else {
      photosBody += '<div class="psi ' + (i === 0 ? 'on' : '') + '">' + (i === 0 ? '📸' : '+') + '</div>' +
        '<div class="psl ' + (i === 0 ? 'on' : '') + '">' + label + '</div>';
    }
    photosBody += '</label>';
  });
  photosBody += '</div><div class="photo-note">📷 Clear photos help owner approve faster · Min 1</div>';

  let detailsBody = '<div style="padding:0 16px">' +
    '<div class="fl"><label>Item Name</label>' +
      '<input class="fi" placeholder="e.g. Nike Tech Fleece" value="' + esc(state.itemForm.name) + '" oninput="state.itemForm.name=this.value">' +
    '</div>' +
    '<div style="display:flex;gap:10px">' +
      '<div class="fl" style="flex:1"><label>Brand</label>' +
        '<input class="fi" placeholder="Nike..." value="' + esc(state.itemForm.brand) + '" oninput="state.itemForm.brand=this.value">' +
      '</div>' +
      '<div class="fl" style="flex:1"><label>Size</label>' +
        '<input class="fi" placeholder="M / 32" value="' + esc(state.itemForm.size) + '" oninput="state.itemForm.size=this.value">' +
      '</div>' +
    '</div>' +
    '<div class="fl"><label>Category</label>' +
      '<select class="fi" onchange="state.itemForm.cat=this.value">';
  ['Hoodie / Sweatshirt','T-Shirt','Denim / Pants','Jacket / Coat','Shoes','Accessories'].forEach(c => {
    detailsBody += '<option ' + (state.itemForm.cat === c ? 'selected' : '') + '>' + c + '</option>';
  });
  detailsBody += '</select></div>' +
    '<div class="fl"><label>Condition</label><div class="cond-sel">';
  [{n:10,l:'New'},{n:9,l:'Like New'},{n:8,l:'Good'},{n:7,l:'Fair'}].forEach((c, i) => {
    detailsBody += '<div class="cb ' + (state.condIdx === i ? 'on' : '') + '" onclick="state.condIdx=' + i + ';render()">' +
      '<div class="cb-n">' + c.n + '</div><div class="cb-l">' + c.l + '</div></div>';
  });
  detailsBody += '</div></div>' +
    '<div class="fl"><label>Asking Price (Rs.)</label>' +
      '<input class="fi" type="number" placeholder="e.g. 1200" value="' + esc(state.itemForm.price) + '" oninput="state.itemForm.price=this.value">' +
    '</div></div>';

  let sendBody = '<div class="pickup-box"><div class="pb-head">📦 Delivery to Us</div><div class="pb-opts">';
  const sendOpts = [
    {l:'🚶 Drop off at our location',d:'Bring it to us directly'},
    {l:"🛵 We'll pick it up",d:'We come to your address'},
    {l:'📦 Send via courier',d:'Ship to us'},
    {l:'🏪 Shop handover (token)',d:'Hand at shop'},
  ];
  sendOpts.forEach((opt, i) => {
    sendBody += '<div class="pbopt" onclick="state.pickIdx=' + i + ';render()">' +
      '<div class="pb-radio ' + (state.pickIdx === i ? 'on' : '') + '"></div>' +
      '<div><div class="pb-lbl">' + opt.l + '</div><div class="pb-desc">' + opt.d + '</div></div>' +
    '</div>';
  });
  sendBody += '</div></div>';

  return '<div class="screen">' + sb('') +
    '<div class="con-hdr"><h1>SEND YOUR DRIP</h1><p>Tap each section to expand. Fill in any order.</p></div>' +
    '<div class="sa">' +
      '<div class="sec-lbl">Type</div>' +
      '<div class="who-grid">' +
        '<div class="who-card ' + (state.whoType === 'ind' ? 'on' : '') + '" onclick="state.whoType=\'ind\';render()">' +
          '<div class="wc-icon">👤</div><div class="wc-title">Individual</div><div class="wc-sub">Personal clothes</div>' +
        '</div>' +
        '<div class="who-card ' + (state.whoType === 'shop' ? 'on' : '') + '" onclick="state.whoType=\'shop\';render()">' +
          '<div class="wc-icon">🏪</div><div class="wc-title">Shop Partner</div><div class="wc-sub">Registered store</div>' +
        '</div>' +
      '</div>' +
      acc('profile','1','Your Profile', profileFilled ? 'Filled' : 'Tap to add', profileFilled, profileBody) +
      acc('photos','2','Cloth Photos', photoCount > 0 ? photoCount + '/5' : 'Tap to add', photoCount > 0, photosBody) +
      acc('details','3','Item Details', detailsFilled ? 'Filled' : 'Tap to add', detailsFilled, detailsBody) +
      acc('send','4','How Will You Send It?', sendLabel, true, sendBody) +
      '<button class="btn btn-blue" style="margin:8px 20px 20px;width:calc(100% - 40px)" onclick="submitConsign()">SUBMIT MY DRIP</button>' +
    '</div>' +
  '</div>';
}
