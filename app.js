// ═══════════════════════════════════════════════════════════════════
// URBANDRIP THRIFT v7 — FIXED PRODUCTION VERSION
// ═══════════════════════════════════════════════════════════════════

const SPLIT = 0.6;
const PICK_LABELS = ['Drop-off', 'We Pick Up', 'Courier', 'Shop Handover'];
const OWNER_WHATSAPP = '9779800000000';
const OWNER_INSTAGRAM = 'urbandrip.np';
const SECRET = 'setup-owner-secret-x9k2';

const tinyHash = (s) => {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return String(h);
};

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ─── STATE ───
const state = {
    owner: null,
    customers: [],
    items: [
        { id: 'UDT-1001', custId: 'demo1', custName: 'Rohan', name: 'Nike Tech Fleece', brand: 'Nike', size: 'L', cat: 'Hoodie / Sweatshirt', price: 3500, status: 'listed', pickMethod: 'Drop-off', createdAt: Date.now() - 86400000, photos: [null, null, null, null, null], crits: [0, 0, 0, 0] },
        { id: 'UDT-1002', custId: 'demo2', custName: 'Aarav', name: 'Carhartt Detroit Jacket', brand: 'Carhartt', size: 'M', cat: 'Jacket / Coat', price: 5200, status: 'listed', pickMethod: 'Courier', createdAt: Date.now() - 172800000, photos: [null, null, null, null, null], crits: [0, 0, 0, 0] },
        { id: 'UDT-1003', custId: 'demo3', custName: 'Priya', name: 'Stussy Box Logo Tee', brand: 'Stussy', size: 'M', cat: 'T-Shirt', price: 1800, status: 'listed', pickMethod: 'Drop-off', createdAt: Date.now() - 43200000, photos: [null, null, null, null, null], crits: [0, 0, 0, 0] },
        { id: 'UDT-1004', custId: 'demo4', custName: 'Sita', name: 'Adidas Samba OG', brand: 'Adidas', size: '42', cat: 'Shoes', price: 4800, status: 'listed', pickMethod: 'Shop Handover', createdAt: Date.now() - 21600000, photos: [null, null, null, null, null], crits: [0, 0, 0, 0] },
        { id: 'UDT-1005', custId: 'demo5', custName: 'Bikash', name: 'Supreme Box Logo Hoodie', brand: 'Supreme', size: 'L', cat: 'Hoodie / Sweatshirt', price: 8500, status: 'listed', pickMethod: 'Drop-off', createdAt: Date.now() - 129600000, photos: [null, null, null, null, null], crits: [0, 0, 0, 0] },
        { id: 'UDT-1006', custId: 'demo6', custName: 'Nisha', name: "Levi's 501 Vintage", brand: "Levi's", size: '32', cat: 'Denim / Pants', price: 2400, status: 'pending', pickMethod: 'We Pick Up', createdAt: Date.now() - 7200000, photos: [null, null, null, null, null], crits: [0, 0, 0, 0] },
        { id: 'UDT-1007', custId: 'demo7', custName: 'Ramesh', name: 'Old Champion Hoodie', brand: 'Champion', size: 'L', cat: 'Hoodie / Sweatshirt', price: 2200, status: 'listed', pickMethod: 'Drop-off', createdAt: Date.now() - (35 * 86400000), photos: [null, null, null, null, null], crits: [0, 0, 0, 0] },
    ],
    session: null,
    screen: 'c-home',
    modal: null,
    oTab: 0, cTab: 0, invTab: 'active',
    setupForm: { name: '', phone: '', pass: '', pass2: '' },
    loginForm: { phone: '', pass: '' },
    whoType: 'ind',
    photos: [null, null, null, null, null],
    pickIdx: 0, condIdx: 1,
    itemForm: { name: '', brand: '', size: '', cat: 'Hoodie / Sweatshirt', price: '' },
    profileInd: { name: '', phone: '', loc: '' },
    lastRef: { ref: '', pick: '' },
    accOpen: { profile: true, photos: true, details: false, send: false },
    retSel: 0,
    lookupPhone: '',
    interestedIds: [],
    shopFilter: 'all',
    searchQuery: '',
    showSearch: false,
};

// ─── ICONS (SVG) ───
const ICONS = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
    cash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>',
    cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>',
};

// ─── HELPERS ───
let toastTimer;
function toast(msg, bg = '#22c55e') {
    const t = document.getElementById('toast');
    if(!t) return;
    t.textContent = msg;
    t.style.background = bg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

function setScreen(name) {
    state.screen = name;
    window.location.hash = name;
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
    const cols = ['#dc2626', '#dc2626', '#ca8a04', '#ca8a04', '#16a34a'];
    const lbls = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong 💪'];
    const i = Math.max(0, s - 1);
    return { pct: s * 20, color: cols[i], label: v.length ? lbls[i] : '' };
}

// ─── HANDLERS ───
function handleSetupRegister() {
    const { name, phone, pass, pass2 } = state.setupForm;
    if (!name || !phone || !pass || !pass2) return toast('❌ Fill all fields', '#ef4444');
    if (pass !== pass2) return toast('❌ Passwords do not match', '#ef4444');
    state.owner = { id: 'O1', name, phone, passHash: tinyHash(pass) };
    toast('✓ Registered!');
    setScreen('c-home');
}

function handleOwnerLogin() {
    const { phone, pass } = state.loginForm;
    if (!state.owner) return toast('❌ No owner registered', '#ef4444');
    if (state.owner.phone === phone && tinyHash(pass) === state.owner.passHash) {
        state.session = { role: 'owner', name: state.owner.name, id: state.owner.id };
        setScreen('o-home');
    } else {
        toast('❌ Invalid credentials', '#ef4444');
    }
}

function logout() {
    state.session = null;
    setScreen('c-home');
}

function verdict(itemId, type) {
    const item = state.items.find(i => i.id === itemId);
    if (item) {
        item.status = type === 'accept' ? 'listed' : 'rejected';
        render();
    }
}

function markSold(id) {
    const item = state.items.find(i => i.id === id);
    if (item) { item.status = 'sold'; render(); }
}

function submitConsign() {
    const { name, brand, size, price } = state.itemForm;
    if (!name || !brand || !price) return toast('❌ Missing Info', '#ef4444');
    const ref = 'UDT-' + (2000 + state.items.length + 1);
    state.items.push({
        id: ref, custId: state.session?.id || 'guest', custName: state.profileInd.name || 'Guest',
        name, brand, size, cat: state.itemForm.cat,
        price: parseInt(price), status: 'pending', photos: [...state.photos], crits: [0, 0, 0, 0], createdAt: Date.now()
    });
    state.lastRef = { ref, pick: PICK_LABELS[state.pickIdx] };
    setScreen('c-success');
}

// ─── RENDER ENGINE ───
function render() {
    const screenHost = document.getElementById('screen-host');
    const navHost = document.getElementById('nav-host');
    const modalHost = document.getElementById('modal-host');
    if(!screenHost) return;

    let html = '';
    // Basic routing
    if (state.screen === 'sc-setup') html = renderSetup();
    else if (state.screen === 'o-login') html = renderOwnerLogin();
    else if (state.screen === 'o-home') html = renderOwnerHome();
    else if (state.screen === 'c-home') html = renderCustomerHome();
    else if (state.screen === 'c-shop') html = renderCustomerShop();
    else if (state.screen === 'c-consign') html = renderConsign();
    else if (state.screen === 'c-success') html = renderSuccess();
    else if (state.screen === 'c-myitems') html = renderMyItems();
    else html = `<h1>Screen ${state.screen} Under Construction</h1><button onclick="setScreen('c-home')">Go Home</button>`;

    screenHost.innerHTML = html;

    // Nav
    if (state.screen.startsWith('o-') && state.session?.role === 'owner') navHost.innerHTML = renderOwnerNav();
    else if (state.screen.startsWith('c-')) navHost.innerHTML = renderCustomerNav();
    else navHost.innerHTML = '';
}

// ─── SCREEN TEMPLATES ───
function renderCustomerHome() {
    return `<div class="sa" style="padding:20px">
        <div class="logo" style="font-size:40px; margin-bottom:20px">Urban<em>Drip</em></div>
        <div class="hero hero-shop" style="background:#111; color:white; padding:30px; border-radius:20px; margin-bottom:20px">
            <h2>SHOP THE<br>STREET DRIP.</h2>
            <button class="btn btn-rust" onclick="setScreen('c-shop')">BROWSE SHOP →</button>
        </div>
        <div class="hero hero-c" style="background:#eee; padding:30px; border-radius:20px">
            <h2>SELL YOUR<br>CLOTHES.</h2>
            <button class="btn btn-blue" onclick="setScreen('c-consign')">CONSIGN NOW →</button>
        </div>
    </div>`;
}

function renderCustomerShop() {
    const items = getShopItems();
    return `<div class="sa" style="padding:20px">
        <h3>Live Marketplace</h3>
        <div class="shop-grid">
            ${items.map(i => `
                <div class="shop-card" style="border:1px solid #ddd; padding:10px; border-radius:12px; margin-bottom:10px">
                    <strong>${esc(i.brand)}</strong><br>${esc(i.name)}<br>
                    <span style="color:var(--rust)">Rs. ${i.price}</span>
                </div>
            `).join('')}
        </div>
    </div>`;
}

function renderConsign() {
    return `<div class="sa" style="padding:20px">
        <h3>Consign Item</h3>
        <input class="fi" placeholder="Item Name" oninput="state.itemForm.name=this.value">
        <input class="fi" placeholder="Brand" oninput="state.itemForm.brand=this.value">
        <input class="fi" placeholder="Price" type="number" oninput="state.itemForm.price=this.value">
        <button class="btn btn-blue" onclick="submitConsign()">SUBMIT DRIP</button>
    </div>`;
}

function renderSuccess() {
    return `<div style="text-align:center; padding:50px">
        <h1>🎉 Success!</h1>
        <p>Ref: ${state.lastRef.ref}</p>
        <button class="btn btn-rust" onclick="setScreen('c-home')">BACK TO HOME</button>
    </div>`;
}

function renderOwnerNav() { return `<nav class="nav"><button class="ni" onclick="setScreen('o-home')">HOME</button></nav>`; }
function renderCustomerNav() { return `<nav class="nav">
    <button class="ni" onclick="setScreen('c-home')">HOME</button>
    <button class="ni" onclick="setScreen('c-shop')">SHOP</button>
    <button class="ni" onclick="setScreen('c-consign')">SELL</button>
</nav>`; }

// ─── INITIALIZE ───
window.onload = () => {
    console.log("App booting...");
    render();
};

// Global Exposure
window.setScreen = setScreen;
window.submitConsign = submitConsign;
