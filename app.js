alert("JS is working!");
document.body.style.background = "red";
// ———————————————————————————————————————————————————————————————————
// URBANDRIP THRIFT v7 — FIXED QUOTES EDITION
// ———————————————————————————————————————————————————————————————————

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

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]));

// ——— STATE ———
const state = {
    owner: null,
    customers: [],
    items: [
        {id:'UDT-1001',custId:'demo1',custName:'Rohan',name:'Nike Tech Fleece',brand:'Nike',size:'L',cat:'Hoodie / Sweatshirt',price:3500,status:'listed',pickMethod:'Drop-off',createdAt:Date.now()-86400000,photos:[null,null,null,null,null],crits:[0,0,0,0]},
        {id:'UDT-1002',custId:'demo2',custName:'Aarav',name:'Carhartt Detroit Jacket',brand:'Carhartt',size:'M',cat:'Jacket / Coat',price:5200,status:'listed',pickMethod:'Courier',createdAt:Date.now()-172800000,photos:[null,null,null,null,null],crits:[0,0,0,0]}
    ],
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
