// FreeTable – prototip (brez strežnika, podatki se shranjujejo v localStorage)

const STORAGE_KEY = 'freetable-data-v1';

const SEED = {
  venues: [
    {
      id: 'v1',
      name: 'Vinoteka Malvazija',
      type: 'bar',
      address: 'Trubarjeva 12, Ljubljana',
      capacity: 40,
      occupied: 31,
      updatedAt: Date.now() - 4 * 60000,
      menu: [
        { id: 'm1', category: 'Vino', name: 'Malvazija – kozarec', price: 3.2, volumeDl: 1 },
        { id: 'm2', category: 'Vino', name: 'Malvazija – steklenica', price: 18, volumeDl: 7.5 },
        { id: 'm3', category: 'Vino', name: 'Teran – kozarec', price: 3.5, volumeDl: 1 },
        { id: 'm4', category: 'Vino', name: 'Teran – steklenica', price: 21, volumeDl: 7.5 },
        { id: 'm5', category: 'Prigrizki', name: 'Pršut in sir', price: 12 },
        { id: 'm6', category: 'Prigrizki', name: 'Olive', price: 4 }
      ],
      upsells: [
        { id: 'u1', fromId: 'm1', toId: 'm2', minQty: 3 },
        { id: 'u2', fromId: 'm3', toId: 'm4', minQty: 3 }
      ]
    },
    {
      id: 'v2',
      name: 'Pivnica Pri Zvonu',
      type: 'bar',
      address: 'Slovenska 5, Ljubljana',
      capacity: 80,
      occupied: 22,
      updatedAt: Date.now() - 12 * 60000,
      menu: [
        { id: 'p1', category: 'Pivo', name: 'Točeno pivo 0,3 l', price: 2.8, volumeDl: 3 },
        { id: 'p2', category: 'Pivo', name: 'Točeno pivo 0,5 l', price: 3.9, volumeDl: 5 },
        { id: 'p3', category: 'Pivo', name: 'Vrček 1,5 l (za mizo)', price: 10.5, volumeDl: 15 },
        { id: 'p4', category: 'Hrana', name: 'Burger', price: 11 },
        { id: 'p5', category: 'Hrana', name: 'Pomfri', price: 3.5 }
      ],
      upsells: [
        { id: 'u3', fromId: 'p2', toId: 'p3', minQty: 2 },
        { id: 'u4', fromId: 'p1', toId: 'p2', minQty: 2 }
      ]
    },
    {
      id: 'v3',
      name: 'Restavracija Lipa',
      type: 'restavracija',
      address: 'Cankarjeva 3, Ljubljana',
      capacity: 50,
      occupied: 49,
      updatedAt: Date.now() - 2 * 60000,
      menu: [
        { id: 'r1', category: 'Glavne jedi', name: 'Njoki s tartufi', price: 16 },
        { id: 'r2', category: 'Glavne jedi', name: 'Goveji file', price: 28 },
        { id: 'r3', category: 'Pijača', name: 'Domače vino – kozarec', price: 2.5, volumeDl: 1 },
        { id: 'r4', category: 'Pijača', name: 'Domače vino – liter', price: 14, volumeDl: 10 },
        { id: 'r5', category: 'Pijača', name: 'Voda 0,25 l', price: 2, volumeDl: 2.5 },
        { id: 'r6', category: 'Pijača', name: 'Voda 1 l', price: 4.5, volumeDl: 10 }
      ],
      upsells: [
        { id: 'u5', fromId: 'r3', toId: 'r4', minQty: 3 },
        { id: 'u6', fromId: 'r5', toId: 'r6', minQty: 2 }
      ]
    }
  ]
};

// ---------- stanje ----------

let data = load();
let route = { view: 'guest' };      // guest | menu | owner
let cart = {};                      // { itemId: qty }
let dismissedUpsells = new Set();   // pravila, ki jih je gost zavrnil
let guestFilter = 'vsi';
let ownerVenueId = data.venues[0]?.id;

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignoriraj */ }
  return structuredClone(SEED);
}

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) { /* ignoriraj */ }
}

const uid = () => Math.random().toString(36).slice(2, 9);
const venueById = id => data.venues.find(v => v.id === id);
const eur = n => n.toLocaleString('sl-SI', { style: 'currency', currency: 'EUR' });
const perDl = item => item.volumeDl ? item.price / item.volumeDl : null;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function occupancyLevel(v) {
  const pct = v.capacity ? v.occupied / v.capacity : 1;
  if (pct >= 0.9) return { cls: 'full', label: 'Skoraj polno' };
  if (pct >= 0.6) return { cls: 'busy', label: 'Precej zasedeno' };
  return { cls: 'free', label: 'Veliko prostora' };
}

function timeAgo(ts) {
  const min = Math.round((Date.now() - ts) / 60000);
  if (min < 1) return 'pravkar';
  if (min < 60) return `pred ${min} min`;
  return `pred ${Math.round(min / 60)} h`;
}

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.add('hidden'), 2200);
}

// ---------- navigacija ----------

function go(newRoute) {
  route = newRoute;
  if (route.view !== 'menu') { cart = {}; dismissedUpsells.clear(); }
  document.querySelectorAll('.mode-switch button').forEach(b =>
    b.classList.toggle('active', b.dataset.nav === (route.view === 'owner' ? 'owner' : 'guest')));
  render();
  window.scrollTo(0, 0);
}

document.addEventListener('click', e => {
  const nav = e.target.closest('[data-nav]');
  if (nav) go({ view: nav.dataset.nav });
});

function render() {
  const app = document.getElementById('app');
  if (route.view === 'guest') app.innerHTML = renderGuest();
  else if (route.view === 'menu') app.innerHTML = renderMenu(venueById(route.venueId));
  else app.innerHTML = renderOwner();
  renderCart();
}

// ---------- pogled gosta: seznam lokalov ----------

function renderGuest() {
  const list = data.venues
    .filter(v => guestFilter === 'vsi' || v.type === guestFilter)
    .sort((a, b) => (b.capacity - b.occupied) - (a.capacity - a.occupied));

  const filters = [['vsi', 'Vsi'], ['bar', 'Bari'], ['restavracija', 'Restavracije']]
    .map(([k, l]) => `<button class="chip ${guestFilter === k ? 'active' : ''}" onclick="setFilter('${k}')">${l}</button>`)
    .join('');

  return `
    <section class="hero">
      <h1>Kje je danes prosta miza?</h1>
      <p>Zasedenost lokalov v živo in digitalni meniji na enem mestu.</p>
    </section>
    <div class="chips">${filters}</div>
    <div class="venue-list">
      ${list.map(venueCard).join('') || '<p class="muted">Ni lokalov.</p>'}
    </div>`;
}

function venueCard(v) {
  const lvl = occupancyLevel(v);
  const free = Math.max(0, v.capacity - v.occupied);
  const pct = Math.min(100, Math.round(v.occupied / v.capacity * 100));
  return `
    <article class="card venue">
      <div class="venue-top">
        <div>
          <span class="tag">${v.type === 'bar' ? 'Bar' : 'Restavracija'}</span>
          <h2>${esc(v.name)}</h2>
          <p class="muted">${esc(v.address)}</p>
        </div>
        <div class="free-count ${lvl.cls}">
          <strong>${free}</strong><span>prostih mest</span>
        </div>
      </div>
      <div class="meter"><div class="meter-fill ${lvl.cls}" style="width:${pct}%"></div></div>
      <div class="venue-bottom">
        <span class="${lvl.cls}-text">${lvl.label} · ${pct} %</span>
        <span class="muted small">posodobljeno ${timeAgo(v.updatedAt)}</span>
      </div>
      <button class="btn" onclick="openMenu('${v.id}')">Poglej meni</button>
    </article>`;
}

function setFilter(f) { guestFilter = f; render(); }
function openMenu(id) { go({ view: 'menu', venueId: id }); }

// ---------- pogled gosta: digitalni meni ----------

function renderMenu(v) {
  if (!v) return '<p>Lokal ne obstaja.</p>';
  const lvl = occupancyLevel(v);
  const cats = [...new Set(v.menu.map(i => i.category))];
  return `
    <button class="link back" data-nav="guest">← nazaj na lokale</button>
    <section class="menu-head">
      <h1>${esc(v.name)}</h1>
      <p class="${lvl.cls}-text">${lvl.label} · ${Math.max(0, v.capacity - v.occupied)} prostih mest</p>
    </section>
    ${cats.map(c => `
      <h3 class="cat">${esc(c)}</h3>
      <div class="card menu-list">
        ${v.menu.filter(i => i.category === c).map(menuRow).join('')}
      </div>`).join('')}
    <div class="cart-spacer"></div>`;
}

function menuRow(item) {
  const q = cart[item.id] || 0;
  const pd = perDl(item);
  return `
    <div class="menu-row">
      <div>
        <div class="item-name">${esc(item.name)}</div>
        ${pd ? `<div class="muted small">${eur(pd)} / dl</div>` : ''}
      </div>
      <div class="item-right">
        <span class="price">${eur(item.price)}</span>
        <div class="qty">
          ${q ? `<button onclick="changeQty('${item.id}',-1)">−</button><span>${q}</span>` : ''}
          <button onclick="changeQty('${item.id}',1)">+</button>
        </div>
      </div>
    </div>`;
}

function changeQty(id, d) {
  cart[id] = Math.max(0, (cart[id] || 0) + d);
  if (!cart[id]) delete cart[id];
  render();
}

// Upsell: poišči pravila, kjer je gost naročil vsaj minQty manjše enote
function activeUpsells(v) {
  return v.upsells
    .filter(r => !dismissedUpsells.has(r.id) && (cart[r.fromId] || 0) >= r.minQty)
    .map(r => ({ rule: r, from: v.menu.find(i => i.id === r.fromId), to: v.menu.find(i => i.id === r.toId) }))
    .filter(u => u.from && u.to);
}

function upsellCard({ rule, from, to }) {
  const qty = cart[from.id];
  const currentCost = qty * from.price;
  const fromPd = perDl(from), toPd = perDl(to);
  let body;

  if (fromPd && toPd) {
    const saving = Math.round((1 - toPd / fromPd) * 100);
    const glassesInBottle = Math.round(to.volumeDl / from.volumeDl * 10) / 10;
    const bottleAsGlasses = glassesInBottle * from.price;
    body = `
      <p>Imate <b>${qty}× ${esc(from.name)}</b> (${eur(currentCost)}).</p>
      <table class="compare">
        <tr><td>${esc(from.name)}</td><td>${eur(fromPd)} / dl</td></tr>
        <tr class="best"><td>${esc(to.name)}</td><td>${eur(toPd)} / dl</td></tr>
      </table>
      <p>${esc(to.name)} (${String(to.volumeDl).replace('.', ',')} dl) stane <b>${eur(to.price)}</b>
        – to je <b>${saving > 0 ? saving + ' % ceneje na dl' : 'ista cena na dl'}</b>.
        ${saving > 0 ? `Za enako količino bi v posameznih enotah plačali ${eur(bottleAsGlasses)}.` : ''}</p>`;
  } else {
    body = `<p>Imate <b>${qty}× ${esc(from.name)}</b> (${eur(currentCost)}). Morda vam bolj ustreza <b>${esc(to.name)}</b> za ${eur(to.price)}?</p>`;
  }

  return `
    <div class="upsell">
      <div class="upsell-title">💡 Namig: vzemite raje: ${esc(to.name)}</div>
      ${body}
      <div class="upsell-actions">
        <button class="btn small" onclick="acceptUpsell('${rule.id}')">Zamenjaj (${qty}× → 1×)</button>
        <button class="link" onclick="dismissUpsell('${rule.id}')">Ne, hvala</button>
      </div>
    </div>`;
}

function acceptUpsell(ruleId) {
  const v = venueById(route.venueId);
  const r = v.upsells.find(x => x.id === ruleId);
  delete cart[r.fromId];
  cart[r.toId] = (cart[r.toId] || 0) + 1;
  toast('Zamenjano – na zdravje! 🍷');
  render();
}

function dismissUpsell(ruleId) { dismissedUpsells.add(ruleId); render(); }

function renderCart() {
  const el = document.getElementById('cart');
  const v = route.view === 'menu' ? venueById(route.venueId) : null;
  const items = v ? Object.entries(cart).map(([id, q]) => ({ item: v.menu.find(i => i.id === id), q })).filter(x => x.item) : [];
  if (!items.length) { el.classList.add('hidden'); return; }
  el.classList.remove('hidden');

  const total = items.reduce((s, x) => s + x.item.price * x.q, 0);
  document.getElementById('cart-body').innerHTML = `
    ${activeUpsells(v).map(upsellCard).join('')}
    <ul class="cart-items">
      ${items.map(x => `<li><span>${x.q}× ${esc(x.item.name)}</span><span>${eur(x.q * x.item.price)}</span></li>`).join('')}
    </ul>
    <div class="cart-total"><span>Skupaj</span><strong>${eur(total)}</strong></div>
    <button class="btn full" onclick="placeOrder()">Pošlji naročilo natakarju</button>`;
}

function placeOrder() {
  cart = {};
  dismissedUpsells.clear();
  toast('Naročilo poslano ✔');
  render();
}

document.getElementById('cart-toggle').addEventListener('click', () => {
  document.getElementById('cart').classList.toggle('collapsed');
});

// ---------- pogled lokala (lastnik) ----------

function renderOwner() {
  const v = venueById(ownerVenueId) || data.venues[0];
  if (!v) return '<p>Ni lokalov.</p>';
  ownerVenueId = v.id;
  const lvl = occupancyLevel(v);
  const opts = data.venues.map(x => `<option value="${x.id}" ${x.id === v.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('');
  const itemOpts = sel => v.menu.map(i => `<option value="${i.id}" ${i.id === sel ? 'selected' : ''}>${esc(i.name)}</option>`).join('');

  return `
    <section class="hero small-hero">
      <h1>Nadzorna plošča lokala</h1>
      <label class="field inline">Lokal:
        <select onchange="ownerVenueId=this.value; render()">${opts}</select>
      </label>
    </section>

    <section class="card">
      <h2>Zasedenost</h2>
      <div class="occ-control">
        <button class="round" onclick="setOccupied(-5)">−5</button>
        <button class="round" onclick="setOccupied(-1)">−1</button>
        <div class="occ-number ${lvl.cls}-text"><strong>${v.occupied}</strong> / ${v.capacity}</div>
        <button class="round" onclick="setOccupied(1)">+1</button>
        <button class="round" onclick="setOccupied(5)">+5</button>
      </div>
      <div class="meter"><div class="meter-fill ${lvl.cls}" style="width:${Math.min(100, v.occupied / v.capacity * 100)}%"></div></div>
      <label class="field inline">Kapaciteta (mest):
        <input type="number" min="1" value="${v.capacity}" onchange="setCapacity(this.value)">
      </label>
      <p class="muted small">Gostje vidijo: „${lvl.label}“ · posodobljeno ${timeAgo(v.updatedAt)}</p>
    </section>

    <section class="card">
      <h2>Digitalni meni</h2>
      <table class="owner-table">
        <thead><tr><th>Kategorija</th><th>Artikel</th><th>Cena €</th><th>Količina dl</th><th></th></tr></thead>
        <tbody>
          ${v.menu.map(i => `
            <tr>
              <td data-label="Kategorija"><input value="${esc(i.category)}" onchange="editItem('${i.id}','category',this.value)"></td>
              <td data-label="Artikel"><input value="${esc(i.name)}" onchange="editItem('${i.id}','name',this.value)"></td>
              <td data-label="Cena €"><input type="number" step="0.1" min="0" value="${i.price}" onchange="editItem('${i.id}','price',this.value)"></td>
              <td data-label="Količina dl"><input type="number" step="0.1" min="0" value="${i.volumeDl ?? ''}" placeholder="–" onchange="editItem('${i.id}','volumeDl',this.value)"></td>
              <td><button class="link danger" onclick="removeItem('${i.id}')">✕</button></td>
            </tr>`).join('')}
        </tbody>
      </table>
      <form class="add-row" onsubmit="addItem(event)">
        <input name="category" placeholder="Kategorija" required>
        <input name="name" placeholder="Artikel" required>
        <input name="price" type="number" step="0.1" min="0" placeholder="Cena €" required>
        <input name="volumeDl" type="number" step="0.1" min="0" placeholder="dl (neobvezno)">
        <button class="btn small">Dodaj</button>
      </form>
      <p class="muted small">Pri pijači vpišite količino v dl – gostom se nato samodejno prikaže cena na dl.</p>
    </section>

    <section class="card">
      <h2>Upsell pravila</h2>
      <p class="muted small">Ko gost naroči vsaj <i>N</i> kosov artikla A, mu predlagamo artikel B in prikažemo primerjavo cene na dl.</p>
      ${v.upsells.map(r => {
        const from = v.menu.find(i => i.id === r.fromId), to = v.menu.find(i => i.id === r.toId);
        const pdInfo = from && to && perDl(from) && perDl(to)
          ? `<span class="muted small">${eur(perDl(from))}/dl → ${eur(perDl(to))}/dl</span>` : '';
        return `
          <div class="rule">
            <span>Če gost vzame ≥ <b>${r.minQty}×</b> ${esc(from?.name ?? '?')} → predlagaj <b>${esc(to?.name ?? '?')}</b></span>
            ${pdInfo}
            <button class="link danger" onclick="removeRule('${r.id}')">odstrani</button>
          </div>`;
      }).join('') || '<p class="muted">Ni pravil.</p>'}
      <form class="add-row" onsubmit="addRule(event)">
        <label>Če gost vzame ≥ <input name="minQty" type="number" min="1" value="3" style="width:4em"></label>
        <select name="fromId">${itemOpts()}</select>
        <span>→ predlagaj</span>
        <select name="toId">${itemOpts(v.menu[1]?.id)}</select>
        <button class="btn small">Dodaj pravilo</button>
      </form>
    </section>

    <p class="center"><button class="link" onclick="resetData()">Ponastavi demo podatke</button></p>`;
}

function currentOwnerVenue() { return venueById(ownerVenueId); }

function setOccupied(d) {
  const v = currentOwnerVenue();
  v.occupied = Math.max(0, Math.min(v.capacity, v.occupied + d));
  v.updatedAt = Date.now();
  save(); render();
}

function setCapacity(val) {
  const v = currentOwnerVenue();
  v.capacity = Math.max(1, parseInt(val, 10) || 1);
  v.occupied = Math.min(v.occupied, v.capacity);
  v.updatedAt = Date.now();
  save(); render();
}

function editItem(id, field, val) {
  const item = currentOwnerVenue().menu.find(i => i.id === id);
  if (field === 'price') item.price = parseFloat(val) || 0;
  else if (field === 'volumeDl') item.volumeDl = parseFloat(val) || undefined;
  else item[field] = val;
  save(); render();
}

function addItem(e) {
  e.preventDefault();
  const f = new FormData(e.target);
  currentOwnerVenue().menu.push({
    id: uid(),
    category: f.get('category').trim(),
    name: f.get('name').trim(),
    price: parseFloat(f.get('price')) || 0,
    volumeDl: parseFloat(f.get('volumeDl')) || undefined
  });
  save(); render(); toast('Artikel dodan');
}

function removeItem(id) {
  const v = currentOwnerVenue();
  v.menu = v.menu.filter(i => i.id !== id);
  v.upsells = v.upsells.filter(r => r.fromId !== id && r.toId !== id);
  save(); render();
}

function addRule(e) {
  e.preventDefault();
  const f = new FormData(e.target);
  if (f.get('fromId') === f.get('toId')) { toast('Izberite dva različna artikla'); return; }
  currentOwnerVenue().upsells.push({
    id: uid(),
    fromId: f.get('fromId'),
    toId: f.get('toId'),
    minQty: Math.max(1, parseInt(f.get('minQty'), 10) || 1)
  });
  save(); render(); toast('Pravilo dodano');
}

function removeRule(id) {
  const v = currentOwnerVenue();
  v.upsells = v.upsells.filter(r => r.id !== id);
  save(); render();
}

function resetData() {
  data = structuredClone(SEED);
  ownerVenueId = data.venues[0].id;
  save(); render(); toast('Podatki ponastavljeni');
}

render();
