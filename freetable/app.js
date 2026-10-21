// FreeTable – prototip (brez strežnika, podatki se shranjujejo v localStorage)

const STORAGE_KEY = 'freetable-data-v3';
const RESERVATION_MIN = 120;   // rezervacija zasede mizo za 2 uri
const OCCUPIED_BLOCK_MIN = 90; // zasedena miza je predvidoma prosta čez 1,5 ure

// ---------- čas ----------

const pad = n => String(n).padStart(2, '0');
const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
const fmtMin = m => `${pad(Math.floor(m / 60) % 24)}:${pad(m % 60)}`;
const roundUp30 = m => Math.ceil(m / 30) * 30;

// Termini za danes: "zdaj" + vsakih 30 min do 23:30
function timeSlots() {
  const slots = [{ min: nowMin(), now: true, label: 'Zdaj' }];
  for (let m = roundUp30(nowMin() + 1); m <= 23 * 60 + 30; m += 30) slots.push({ min: m, now: false, label: fmtMin(m) });
  return slots;
}

// ---------- demo podatki ----------

function makeSeed() {
  const today = todayStr();
  const soon = Math.min(roundUp30(nowMin() + 45), 23 * 60);
  const later = Math.min(soon + 90, 23 * 60 + 30);
  const res = (name, people, min) => ({ id: uid(), name, phone: '', people, date: today, min });

  return {
    venues: [
      {
        id: 'v1',
        name: 'Vinoteka Malvazija',
        type: 'bar',
        address: 'Trubarjeva 12, Ljubljana',
        updatedAt: Date.now() - 4 * 60000,
        features: [
          { label: 'Šank', x: 50, y: 8, w: 60, h: 10 },
          { label: 'Vhod', x: 92, y: 92, w: 14, h: 8 },
          { label: 'Okno', x: 3, y: 50, w: 4, h: 60 }
        ],
        tables: [
          { id: 't1', label: '1', seats: 2, shape: 'round', x: 16, y: 32, occupied: true, note: 'ob oknu', reservations: [] },
          { id: 't2', label: '2', seats: 2, shape: 'round', x: 16, y: 56, occupied: false, note: 'ob oknu', reservations: [] },
          { id: 't3', label: '3', seats: 2, shape: 'round', x: 16, y: 80, occupied: true, note: 'ob oknu', reservations: [] },
          { id: 't4', label: '4', seats: 4, shape: 'rect', x: 42, y: 38, occupied: true, reservations: [] },
          { id: 't5', label: '5', seats: 4, shape: 'rect', x: 42, y: 70, occupied: false, reservations: [res('Novak', 4, soon)] },
          { id: 't6', label: '6', seats: 4, shape: 'rect', x: 66, y: 38, occupied: true, reservations: [] },
          { id: 't7', label: '7', seats: 6, shape: 'rect', x: 70, y: 70, occupied: false, reservations: [] },
          { id: 't8', label: 'Šank', seats: 6, shape: 'rect', x: 86, y: 30, occupied: true, note: 'barski stoli', reservations: [] }
        ],
        menu: [
          { id: 'm1', category: 'Bela vina', name: 'Malvazija – kozarec', desc: 'Istrska, sveža, z notami mandlja', price: 3.2, volumeDl: 1, tags: ['priporočamo'] },
          { id: 'm2', category: 'Bela vina', name: 'Malvazija – steklenica', desc: 'Istrska, sveža, z notami mandlja', price: 18, volumeDl: 7.5 },
          { id: 'm3', category: 'Bela vina', name: 'Rebula – kozarec', desc: 'Goriška brda, mineralna', price: 3.4, volumeDl: 1 },
          { id: 'm4', category: 'Bela vina', name: 'Rebula – steklenica', desc: 'Goriška brda, mineralna', price: 19.5, volumeDl: 7.5 },
          { id: 'm5', category: 'Bela vina', name: 'Sauvignon – kozarec', desc: 'Štajerska, aromatičen', price: 3.6, volumeDl: 1 },
          { id: 'm6', category: 'Bela vina', name: 'Sauvignon – steklenica', desc: 'Štajerska, aromatičen', price: 21, volumeDl: 7.5 },
          { id: 'm7', category: 'Rdeča vina', name: 'Teran – kozarec', desc: 'Kras, z rubinasto barvo', price: 3.5, volumeDl: 1 },
          { id: 'm8', category: 'Rdeča vina', name: 'Teran – steklenica', desc: 'Kras, z rubinasto barvo', price: 21, volumeDl: 7.5 },
          { id: 'm9', category: 'Rdeča vina', name: 'Refošk – kozarec', desc: 'Slovenska Istra, sadno', price: 3.3, volumeDl: 1 },
          { id: 'm10', category: 'Rdeča vina', name: 'Refošk – steklenica', desc: 'Slovenska Istra, sadno', price: 19, volumeDl: 7.5 },
          { id: 'm11', category: 'Rdeča vina', name: 'Cabernet sauvignon – kozarec', desc: 'Vipavska dolina, barrique', price: 4.2, volumeDl: 1 },
          { id: 'm12', category: 'Rdeča vina', name: 'Cabernet sauvignon – steklenica', desc: 'Vipavska dolina, barrique', price: 25, volumeDl: 7.5 },
          { id: 'm13', category: 'Peneča vina', name: 'Penina – kozarec', desc: 'Klasična metoda, brut', price: 4.5, volumeDl: 1.25 },
          { id: 'm14', category: 'Peneča vina', name: 'Penina – steklenica', desc: 'Klasična metoda, brut', price: 26, volumeDl: 7.5 },
          { id: 'm15', category: 'Peneča vina', name: 'Degustacija 3 vin', desc: '3 × 0,5 dl po izbiri someljeja', price: 8.5, tags: ['novo'] },
          { id: 'm16', category: 'Prigrizki', name: 'Pršut in sir', desc: 'Kraški pršut (24 mesecev) in tolminc', price: 12, tags: ['brez glutena'] },
          { id: 'm17', category: 'Prigrizki', name: 'Kraški krožnik za dva', desc: 'Pršut, salama, panceta, trije siri, olive, kruh', price: 22, tags: ['priporočamo'] },
          { id: 'm18', category: 'Prigrizki', name: 'Sirni krožnik', desc: 'Tolminc, nanoški sir, kozji sir z medom', price: 10, tags: ['vegi'] },
          { id: 'm19', category: 'Prigrizki', name: 'Bruschetta s paradižnikom', desc: 'Domač kruh, paradižnik, bazilika', price: 6, tags: ['vegan'] },
          { id: 'm20', category: 'Prigrizki', name: 'Marinirane olive', desc: 'Istrske olive s česnom in limono', price: 4, tags: ['vegan', 'brez glutena'] },
          { id: 'm21', category: 'Prigrizki', name: 'Kruh z oljčnim oljem', desc: 'Ekstra deviško olje iz Istre', price: 3.5, tags: ['vegan'] },
          { id: 'm22', category: 'Sladice', name: 'Čokoladni fondant', desc: 'S sladoledom iz burbonske vanilje', price: 6, tags: ['vegi'] },
          { id: 'm23', category: 'Sladice', name: 'Limonin sorbet', desc: 'Osvežilno, brez mleka', price: 4, tags: ['vegan'] },
          { id: 'm24', category: 'Brezalkoholno', name: 'Voda 0,25 l', price: 2, volumeDl: 2.5 },
          { id: 'm25', category: 'Brezalkoholno', name: 'Voda 0,75 l', price: 4.5, volumeDl: 7.5 },
          { id: 'm26', category: 'Brezalkoholno', name: 'Domači jabolčni sok 0,2 l', price: 2.8, volumeDl: 2 }
        ],
        upsells: [
          { id: 'u1', fromId: 'm1', toId: 'm2', minQty: 3 },
          { id: 'u2', fromId: 'm3', toId: 'm4', minQty: 3 },
          { id: 'u3', fromId: 'm5', toId: 'm6', minQty: 3 },
          { id: 'u4', fromId: 'm7', toId: 'm8', minQty: 3 },
          { id: 'u5', fromId: 'm9', toId: 'm10', minQty: 3 },
          { id: 'u6', fromId: 'm11', toId: 'm12', minQty: 3 },
          { id: 'u7', fromId: 'm13', toId: 'm14', minQty: 3 },
          { id: 'u8', fromId: 'm16', toId: 'm17', minQty: 2 },
          { id: 'u9', fromId: 'm24', toId: 'm25', minQty: 2 }
        ]
      },
      {
        id: 'v2',
        name: 'Pivnica Pri Zvonu',
        type: 'bar',
        address: 'Slovenska 5, Ljubljana',
        updatedAt: Date.now() - 12 * 60000,
        features: [
          { label: 'Šank', x: 8, y: 50, w: 10, h: 70 },
          { label: 'Vhod', x: 50, y: 94, w: 16, h: 8 },
          { label: 'Terasa', x: 86, y: 50, w: 24, h: 92 }
        ],
        tables: [
          { id: 'z1', label: '1', seats: 4, shape: 'rect', x: 30, y: 20, occupied: true, reservations: [] },
          { id: 'z2', label: '2', seats: 4, shape: 'rect', x: 30, y: 50, occupied: false, reservations: [] },
          { id: 'z3', label: '3', seats: 4, shape: 'rect', x: 30, y: 78, occupied: false, reservations: [] },
          { id: 'z4', label: '4', seats: 8, shape: 'rect', x: 55, y: 35, occupied: true, note: 'dolga miza', reservations: [] },
          { id: 'z5', label: '5', seats: 8, shape: 'rect', x: 55, y: 68, occupied: false, note: 'dolga miza', reservations: [res('Kranjc', 7, later)] },
          { id: 'z6', label: 'T1', seats: 2, shape: 'round', x: 82, y: 18, occupied: false, note: 'terasa', reservations: [] },
          { id: 'z7', label: 'T2', seats: 2, shape: 'round', x: 82, y: 42, occupied: false, note: 'terasa', reservations: [] },
          { id: 'z8', label: 'T3', seats: 4, shape: 'round', x: 82, y: 68, occupied: true, note: 'terasa', reservations: [] }
        ],
        menu: [
          { id: 'p1', category: 'Točeno pivo', name: 'Laško Zlatorog 0,3 l', desc: 'Svetlo lager pivo', price: 2.8, volumeDl: 3 },
          { id: 'p2', category: 'Točeno pivo', name: 'Laško Zlatorog 0,5 l', desc: 'Svetlo lager pivo', price: 3.9, volumeDl: 5 },
          { id: 'p3', category: 'Točeno pivo', name: 'Vrček za mizo 1,5 l', desc: 'Laško Zlatorog, s kozarci za vse', price: 10.5, volumeDl: 15, tags: ['priporočamo'] },
          { id: 'p4', category: 'Točeno pivo', name: 'Union Radler 0,5 l', desc: 'Grenivka ali limona', price: 3.9, volumeDl: 5 },
          { id: 'p5', category: 'Točeno pivo', name: 'Temno pivo 0,5 l', desc: 'Polno, karamelno', price: 4.2, volumeDl: 5 },
          { id: 'p6', category: 'Craft piva', name: 'IPA 0,33 l', desc: 'Lokalna pivovarna, grenko-citrusna', price: 4.8, volumeDl: 3.3 },
          { id: 'p7', category: 'Craft piva', name: 'Stout 0,33 l', desc: 'Kava in temna čokolada', price: 4.9, volumeDl: 3.3 },
          { id: 'p8', category: 'Craft piva', name: 'Pšenično 0,5 l', desc: 'Nefiltrirano, banana in klinček', price: 4.5, volumeDl: 5 },
          { id: 'p9', category: 'Craft piva', name: 'Degustacija craft piv', desc: '4 × 1 dl po izbiri', price: 7.5, tags: ['novo'] },
          { id: 'p10', category: 'Burgerji', name: 'Burger klasik', desc: '180 g govedine, cheddar, slanina, BBQ omaka', price: 11 },
          { id: 'p11', category: 'Burgerji', name: 'Pekoči burger', desc: 'Jalapeño, chipotle majoneza, poprov sir', price: 12, tags: ['pekoče'] },
          { id: 'p12', category: 'Burgerji', name: 'Veggie burger', desc: 'Polpeta iz čičerike, avokado, rukola', price: 11.5, tags: ['vegi'] },
          { id: 'p13', category: 'Prigrizki', name: 'Pomfri', desc: 'S parmezanom in rožmarinom', price: 3.5, tags: ['vegi'] },
          { id: 'p14', category: 'Prigrizki', name: 'Čebulni obročki', desc: 'V pivskem testu', price: 4.5, tags: ['vegi'] },
          { id: 'p15', category: 'Prigrizki', name: 'Piščančja krilca (8 kos)', desc: 'Buffalo ali BBQ', price: 9, tags: ['pekoče'] },
          { id: 'p16', category: 'Prigrizki', name: 'Piščančja krilca (16 kos)', desc: 'Buffalo ali BBQ, za deljenje', price: 16, tags: ['pekoče'] },
          { id: 'p17', category: 'Prigrizki', name: 'Pivski krožnik za 4', desc: 'Krilca, obročki, pomfri, nachosi, 3 omake', price: 26, tags: ['priporočamo'] },
          { id: 'p18', category: 'Sladice', name: 'Palačinke z Nutello', desc: 'Dve palačinki, lešniki', price: 5, tags: ['vegi'] },
          { id: 'p19', category: 'Brezalkoholno', name: 'Kokta 0,5 l', price: 3.2, volumeDl: 5 },
          { id: 'p20', category: 'Brezalkoholno', name: 'Coca-Cola 0,33 l', price: 3, volumeDl: 3.3 },
          { id: 'p21', category: 'Brezalkoholno', name: 'Brezalkoholno pivo 0,5 l', price: 3.6, volumeDl: 5 }
        ],
        upsells: [
          { id: 'u10', fromId: 'p2', toId: 'p3', minQty: 3 },
          { id: 'u11', fromId: 'p1', toId: 'p2', minQty: 2 },
          { id: 'u12', fromId: 'p15', toId: 'p16', minQty: 2 },
          { id: 'u13', fromId: 'p13', toId: 'p17', minQty: 3 }
        ]
      },
      {
        id: 'v3',
        name: 'Restavracija Lipa',
        type: 'restavracija',
        address: 'Cankarjeva 3, Ljubljana',
        updatedAt: Date.now() - 2 * 60000,
        features: [
          { label: 'Kuhinja', x: 50, y: 7, w: 40, h: 10 },
          { label: 'Vhod', x: 8, y: 92, w: 14, h: 8 },
          { label: 'Okno', x: 97, y: 50, w: 4, h: 60 }
        ],
        tables: [
          { id: 'l1', label: '1', seats: 2, shape: 'round', x: 20, y: 30, occupied: true, reservations: [] },
          { id: 'l2', label: '2', seats: 2, shape: 'round', x: 20, y: 60, occupied: true, reservations: [] },
          { id: 'l3', label: '3', seats: 4, shape: 'rect', x: 45, y: 32, occupied: true, reservations: [] },
          { id: 'l4', label: '4', seats: 4, shape: 'rect', x: 45, y: 62, occupied: true, reservations: [] },
          { id: 'l5', label: '5', seats: 4, shape: 'rect', x: 72, y: 30, occupied: true, note: 'ob oknu', reservations: [] },
          { id: 'l6', label: '6', seats: 2, shape: 'round', x: 80, y: 60, occupied: false, note: 'ob oknu', reservations: [res('Horvat', 2, soon)] },
          { id: 'l7', label: '7', seats: 6, shape: 'rect', x: 55, y: 85, occupied: false, reservations: [] }
        ],
        menu: [
          { id: 'r1', category: 'Predjedi', name: 'Goveja juha z rezanci', desc: 'Domači rezanci, zelenjava', price: 5 },
          { id: 'r2', category: 'Predjedi', name: 'Tatarski biftek', desc: 'Pripravljen ob mizi, opečen kruh', price: 16, tags: ['priporočamo'] },
          { id: 'r3', category: 'Predjedi', name: 'Burrata s paradižniki', desc: 'Pesto iz bazilike, balzamični kis', price: 12, tags: ['vegi', 'brez glutena'] },
          { id: 'r4', category: 'Predjedi', name: 'Carpaccio iz hobotnice', desc: 'Limona, kapre, oljčno olje', price: 15, tags: ['brez glutena'] },
          { id: 'r5', category: 'Glavne jedi', name: 'Njoki s tartufi', desc: 'Istrski črni tartuf, maslo, parmezan', price: 16, tags: ['vegi'] },
          { id: 'r6', category: 'Glavne jedi', name: 'Rižota z jurčki', desc: 'Carnaroli riž, gozdne gobe', price: 17, tags: ['vegi', 'brez glutena'] },
          { id: 'r7', category: 'Glavne jedi', name: 'Brancin na žaru', desc: 'Blitva s krompirjem', price: 24, tags: ['brez glutena'] },
          { id: 'r8', category: 'Glavne jedi', name: 'Goveji file', desc: '250 g, omaka iz terana, pečena zelenjava', price: 28, tags: ['brez glutena'] },
          { id: 'r9', category: 'Glavne jedi', name: 'Otroški meni', desc: 'Piščančji zrezek s pomfrijem', price: 9 },
          { id: 'r10', category: 'Degustacija', name: 'Degustacijski meni (5 hodov)', desc: 'Sezonski izbor chefa', price: 55, tags: ['priporočamo'] },
          { id: 'r11', category: 'Degustacija', name: 'Vinska spremljava (5 kozarcev)', desc: 'Vino k vsakemu hodu', price: 25 },
          { id: 'r12', category: 'Sladice', name: 'Prekmurska gibanica', price: 6, tags: ['vegi'] },
          { id: 'r13', category: 'Sladice', name: 'Tiramisu', price: 6.5, tags: ['vegi'] },
          { id: 'r14', category: 'Sladice', name: 'Sladoled (1 kepica)', desc: 'Vanilja, čokolada ali pistacija', price: 2, tags: ['vegi'] },
          { id: 'r15', category: 'Sladice', name: 'Sladoledni kup (4 kepice)', desc: 'S smetano in prelivom', price: 6.5, tags: ['vegi'] },
          { id: 'r16', category: 'Vino', name: 'Domače vino – kozarec', desc: 'Belo ali rdeče', price: 2.5, volumeDl: 1 },
          { id: 'r17', category: 'Vino', name: 'Domače vino – liter', desc: 'Belo ali rdeče', price: 14, volumeDl: 10 },
          { id: 'r18', category: 'Vino', name: 'Malvazija – kozarec', price: 3.8, volumeDl: 1 },
          { id: 'r19', category: 'Vino', name: 'Malvazija – steklenica', price: 22, volumeDl: 7.5 },
          { id: 'r20', category: 'Pijača', name: 'Voda 0,25 l', price: 2, volumeDl: 2.5 },
          { id: 'r21', category: 'Pijača', name: 'Voda 1 l', price: 4.5, volumeDl: 10 },
          { id: 'r22', category: 'Pijača', name: 'Espresso', price: 1.8 }
        ],
        upsells: [
          { id: 'u14', fromId: 'r16', toId: 'r17', minQty: 3 },
          { id: 'u15', fromId: 'r18', toId: 'r19', minQty: 3 },
          { id: 'u16', fromId: 'r20', toId: 'r21', minQty: 2 },
          { id: 'u17', fromId: 'r14', toId: 'r15', minQty: 3 }
        ]
      }
    ]
  };
}

// ---------- stanje ----------

let data = load();
let route = { view: 'guest' };      // guest | menu | owner
let cart = {};                      // { itemId: qty }
let upsellDone = false;             // gost dobi največ en predlog na naročilo
let menuQuery = '';
let cartOpen = false;
let guestFilter = 'vsi';
let ownerVenueId = data.venues[0]?.id;
let ownerTableId = null;            // izbrana miza na tlorisu lastnika
let booking = { people: 2, slot: 0, tableId: null, done: null };

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignoriraj */ }
  return makeSeed();
}

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) { /* ignoriraj */ }
}

function uid() { return Math.random().toString(36).slice(2, 9); }
const venueById = id => data.venues.find(v => v.id === id);
const eur = n => n.toLocaleString('sl-SI', { style: 'currency', currency: 'EUR' });
const perDl = item => item.volumeDl ? item.price / item.volumeDl : null;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const freeTablesWord = n => n === 1 ? 'prosta miza' : n === 2 ? 'prosti mizi' : n <= 4 ? 'proste mize' : 'prostih miz';
const seatWord = n => n === 1 ? 'oseba' : n === 2 ? 'osebi' : n <= 4 ? 'osebe' : 'oseb';

// ---------- mize in zasedenost ----------

const capacityOf = v => v.tables.reduce((s, t) => s + t.seats, 0);
const occupiedSeats = v => v.tables.filter(t => t.occupied).reduce((s, t) => s + t.seats, 0);

function conflictingReservation(t, min) {
  const today = todayStr();
  return t.reservations.find(r => r.date === today && Math.abs(r.min - min) < RESERVATION_MIN);
}

// Stanje mize ob izbranem terminu: free | occupied | reserved
function tableStatus(t, slot) {
  if (t.occupied && (slot.now || slot.min - nowMin() < OCCUPIED_BLOCK_MIN)) return 'occupied';
  if (conflictingReservation(t, slot.min)) return 'reserved';
  return 'free';
}

const freeTablesNow = v => v.tables.filter(t => tableStatus(t, { now: true, min: nowMin() }) === 'free');

function occupancyLevel(v) {
  const cap = capacityOf(v);
  const pct = cap ? occupiedSeats(v) / cap : 1;
  if (!freeTablesNow(v).length || pct >= 0.9) return { cls: 'full', label: 'Skoraj polno' };
  if (pct >= 0.6) return { cls: 'busy', label: 'Precej zasedeno' };
  return { cls: 'free', label: 'Veliko prostora' };
}

function touch(v) { v.updatedAt = Date.now(); }

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
  if (route.view !== 'menu') { cart = {}; upsellDone = false; menuQuery = ''; }
  booking = { people: booking.people, slot: 0, tableId: null, done: null };
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
  else if (route.view === 'menu') app.innerHTML = renderVenue(venueById(route.venueId));
  else app.innerHTML = renderOwner();
  if (route.view === 'menu' && route.tab === 'meni') applyMenuFilter();
  renderCart();
}

// ---------- tloris ----------

function tableSize(t) {
  const w = t.seats <= 2 ? 10 : t.seats <= 4 ? 13 : t.seats <= 6 ? 17 : 21;
  return { w, ratio: t.shape === 'round' ? 1 : t.seats >= 6 ? 1.9 : 1.25 };
}

// mode: 'guest' (izbira proste mize) ali 'owner' (urejanje)
function floorPlan(v, { mode, slot, people, selectedId }) {
  const features = (v.features || []).map(f => `
    <div class="feature" style="left:${f.x}%;top:${f.y}%;width:${f.w}%;height:${f.h}%">${esc(f.label)}</div>`).join('');

  const tables = v.tables.map(t => {
    const status = tableStatus(t, slot);
    const { w, ratio } = tableSize(t);
    const tooSmall = mode === 'guest' && t.seats < people;
    const pickable = mode === 'guest' && status === 'free' && !tooSmall;
    const cls = ['table', t.shape, status, tooSmall ? 'dim' : '', pickable ? 'pickable' : '',
      selectedId === t.id ? 'selected' : ''].join(' ');
    const r = status === 'reserved' ? conflictingReservation(t, slot.min) : null;
    const attrs = mode === 'owner'
      ? `data-table="${t.id}"`
      : pickable ? `onclick="pickTable('${t.id}')"` : '';
    const title = `Miza ${t.label} · ${t.seats} mest${t.note ? ' · ' + t.note : ''}`;
    return `
      <button class="${cls}" ${attrs} title="${esc(title)}" aria-label="${esc(title)}"
        style="left:${t.x}%;top:${t.y}%;width:max(${w}%, ${Math.round(44 * Math.max(1, ratio * 0.8))}px);aspect-ratio:${ratio}" ${mode === 'guest' && !pickable ? 'tabindex="-1"' : ''}>
        <span class="t-label">${esc(t.label)}</span>
        <span class="t-seats">${t.seats} 👤</span>
        ${r ? `<span class="t-time">${fmtMin(r.min)}</span>` : ''}
      </button>`;
  }).join('');

  return `<div class="floor ${mode}" id="floor-${mode}">${features}${tables}</div>
    <div class="legend">
      <span><i class="dot free"></i>prosta</span>
      <span><i class="dot reserved"></i>rezervirana</span>
      <span><i class="dot occupied"></i>zasedena</span>
      ${mode === 'guest' ? '<span><i class="dot dim"></i>premajhna</span>' : ''}
    </div>`;
}

// ---------- pogled gosta: seznam lokalov ----------

function renderGuest() {
  const list = data.venues
    .filter(v => guestFilter === 'vsi' || v.type === guestFilter)
    .sort((a, b) => freeTablesNow(b).length - freeTablesNow(a).length);

  const filters = [['vsi', 'Vsi'], ['bar', 'Bari'], ['restavracija', 'Restavracije']]
    .map(([k, l]) => `<button class="chip ${guestFilter === k ? 'active' : ''}" onclick="setFilter('${k}')">${l}</button>`)
    .join('');

  return `
    <section class="hero">
      <h1>Kje je danes prosta miza?</h1>
      <p>Poglej, katera miza je prosta, in jo rezerviraj v nekaj sekundah.</p>
    </section>
    <div class="chips">${filters}</div>
    <div class="venue-list">
      ${list.map(venueCard).join('') || '<p class="muted">Ni lokalov.</p>'}
    </div>`;
}

function venueCard(v) {
  const lvl = occupancyLevel(v);
  const free = freeTablesNow(v);
  const pct = Math.min(100, Math.round(occupiedSeats(v) / capacityOf(v) * 100));
  return `
    <article class="card venue">
      <div class="venue-top">
        <div>
          <span class="tag">${v.type === 'bar' ? 'Bar' : 'Restavracija'}</span>
          <h2>${esc(v.name)}</h2>
          <p class="muted">${esc(v.address)}</p>
        </div>
        <div class="free-count ${lvl.cls}">
          <strong>${free.length}</strong><span>${freeTablesWord(free.length)}</span>
        </div>
      </div>
      <div class="meter"><div class="meter-fill ${lvl.cls}" style="width:${pct}%"></div></div>
      <div class="venue-bottom">
        <span class="${lvl.cls}-text">${lvl.label} · ${pct} %</span>
        <span class="muted small">posodobljeno ${timeAgo(v.updatedAt)}</span>
      </div>
      <div class="venue-actions">
        <button class="btn" onclick="openVenue('${v.id}','mize')">Izberi mizo</button>
        <button class="btn ghost" onclick="openVenue('${v.id}','meni')">Meni</button>
      </div>
    </article>`;
}

function setFilter(f) { guestFilter = f; render(); }
function openVenue(id, tab) { go({ view: 'menu', venueId: id, tab }); }
function setTab(tab) { route.tab = tab; render(); }

// ---------- pogled gosta: lokal (mize + meni) ----------

function renderVenue(v) {
  if (!v) return '<p>Lokal ne obstaja.</p>';
  const lvl = occupancyLevel(v);
  const tab = route.tab || 'mize';
  return `
    <button class="link back" data-nav="guest">← nazaj na lokale</button>
    <section class="menu-head">
      <h1>${esc(v.name)}</h1>
      <p class="${lvl.cls}-text">${lvl.label} · ${freeTablesNow(v).length} ${freeTablesWord(freeTablesNow(v).length)}</p>
    </section>
    <div class="tabs">
      <button class="${tab === 'mize' ? 'active' : ''}" onclick="setTab('mize')">Mize in rezervacija</button>
      <button class="${tab === 'meni' ? 'active' : ''}" onclick="setTab('meni')">Meni</button>
    </div>
    ${tab === 'mize' ? renderBooking(v) : renderMenu(v)}`;
}

function renderBooking(v) {
  if (booking.done) {
    const d = booking.done;
    return `
      <section class="card confirm">
        <div class="confirm-icon">✓</div>
        <h2>Rezervacija potrjena</h2>
        <p><b>Miza ${esc(d.table)}</b>${d.note ? ` (${esc(d.note)})` : ''} · danes ob <b>${fmtMin(d.min)}</b> · ${d.people} ${seatWord(d.people)}</p>
        <p class="muted small">Na ime ${esc(d.name)}. Miza je za vas rezervirana 15 minut po dogovorjeni uri.</p>
        <div class="venue-actions">
          <button class="btn" onclick="setTab('meni')">Poglej meni</button>
          <button class="btn ghost" onclick="booking.done=null; render()">Nova rezervacija</button>
        </div>
      </section>`;
  }

  const slots = timeSlots();
  booking.slot = Math.min(booking.slot, slots.length - 1);
  const slot = slots[booking.slot];
  const fitting = v.tables.filter(t => t.seats >= booking.people && tableStatus(t, slot) === 'free');

  const peopleOpts = Array.from({ length: 10 }, (_, i) => i + 1)
    .map(n => `<option value="${n}" ${n === booking.people ? 'selected' : ''}>${n} ${seatWord(n)}</option>`).join('');
  const slotOpts = slots.map((s, i) => `<option value="${i}" ${i === booking.slot ? 'selected' : ''}>${s.label}</option>`).join('');

  const table = v.tables.find(t => t.id === booking.tableId);

  return `
    <section class="card">
      <div class="booking-controls">
        <label class="field">Koliko vas bo?
          <select id="b-people" onchange="booking.people=+this.value; booking.tableId=null; render()">${peopleOpts}</select>
        </label>
        <label class="field">Kdaj?
          <select id="b-slot" onchange="booking.slot=+this.value; booking.tableId=null; render()">${slotOpts}</select>
        </label>
      </div>
      <p class="hint ${fitting.length ? 'free-text' : 'full-text'}">
        ${fitting.length
          ? `${slot.now ? 'Zdaj' : 'Ob ' + slot.label} ${fitting.length === 1 ? 'je prosta 1 primerna miza' : fitting.length === 2 ? 'sta prosti 2 primerni mizi' : fitting.length <= 4 ? `so proste ${fitting.length} primerne mize` : `je prostih ${fitting.length} primernih miz`}. Tapnite zeleno mizo.`
          : 'Ob tem času ni proste mize za vaše število oseb. Poskusite drug termin.'}
      </p>
      ${floorPlan(v, { mode: 'guest', slot, people: booking.people, selectedId: booking.tableId })}
    </section>
    ${table ? reserveForm(v, table, slot) : ''}`;
}

function pickTable(id) {
  booking.tableId = id;
  render();
  document.getElementById('reserve-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function reserveForm(v, t, slot) {
  const min = slot.now ? nowMin() : slot.min;
  return `
    <form class="card reserve" id="reserve-form" onsubmit="reserve(event)">
      <h2>Miza ${esc(t.label)} · ${t.seats} mest</h2>
      <p class="muted">${t.note ? esc(t.note) + ' · ' : ''}danes ob <b>${fmtMin(min)}</b> · ${booking.people} ${seatWord(booking.people)}</p>
      <label class="field">Ime
        <input id="r-name" name="name" required placeholder="npr. Ana Novak" autocomplete="name">
      </label>
      <label class="field">Telefon
        <input id="r-phone" name="phone" type="tel" placeholder="040 123 456" autocomplete="tel">
      </label>
      <div class="venue-actions">
        <button class="btn">Rezerviraj mizo</button>
        <button type="button" class="link" onclick="booking.tableId=null; render()">Prekliči</button>
      </div>
    </form>`;
}

function reserve(e) {
  e.preventDefault();
  const v = venueById(route.venueId);
  const t = v.tables.find(x => x.id === booking.tableId);
  const slot = timeSlots()[booking.slot];
  if (!t || tableStatus(t, slot) !== 'free') { toast('Miza ni več prosta – izberite drugo'); booking.tableId = null; render(); return; }
  const f = new FormData(e.target);
  const min = slot.now ? nowMin() : slot.min;
  const r = { id: uid(), name: f.get('name').trim(), phone: f.get('phone').trim(), people: booking.people, date: todayStr(), min };
  t.reservations.push(r);
  touch(v); save();
  booking.done = { table: t.label, note: t.note, min, people: r.people, name: r.name };
  booking.tableId = null;
  toast('Miza rezervirana ✔');
  render();
  window.scrollTo(0, 0);
}

// ---------- pogled gosta: digitalni meni ----------

const DIETS = [['', 'Vse'], ['vegi', 'Vegi'], ['vegan', 'Vegan'], ['brez glutena', 'Brez glutena']];
let menuDiet = '';

function matchesDiet(item) {
  if (!menuDiet) return true;
  const tags = item.tags || [];
  return tags.includes(menuDiet) || (menuDiet === 'vegi' && tags.includes('vegan'));
}

function renderMenu(v) {
  const cats = [...new Set(v.menu.map(i => i.category))];
  const recommended = v.menu.filter(i => (i.tags || []).includes('priporočamo'));
  return `
    <div class="menu-tools">
      <input id="menu-search" type="search" placeholder="Išči po meniju …" value="${esc(menuQuery)}"
        oninput="menuQuery=this.value; applyMenuFilter()" aria-label="Išči po meniju">
      <div class="chips diet">
        ${DIETS.map(([k, l]) => `<button class="chip ${menuDiet === k ? 'active' : ''}" onclick="menuDiet='${k}'; render()">${l}</button>`).join('')}
      </div>
      <nav class="cat-nav">
        ${cats.map((c, i) => `<button class="cat-link" onclick="document.getElementById('cat-${i}').scrollIntoView({behavior:'smooth', block:'start'})">${esc(c)}</button>`).join('')}
      </nav>
    </div>
    ${recommended.length && !menuQuery && !menuDiet ? `
      <h3 class="cat">Priporočamo</h3>
      <div class="reco">
        ${recommended.map(i => `
          <button class="reco-card" onclick="changeQty('${i.id}',1)">
            <span class="item-name">${esc(i.name)}</span>
            ${i.desc ? `<span class="muted small">${esc(i.desc)}</span>` : ''}
            <span class="price">${eur(i.price)} <span class="plus">+ dodaj</span></span>
          </button>`).join('')}
      </div>` : ''}
    ${cats.map((c, i) => `
      <section class="cat-block" data-cat>
        <h3 class="cat" id="cat-${i}">${esc(c)}</h3>
        <div class="card menu-list">
          ${v.menu.filter(it => it.category === c).map(menuRow).join('')}
        </div>
      </section>`).join('')}
    <p class="muted center hidden" id="menu-empty">Ni zadetkov. Poskusite z drugo besedo.</p>
    <div class="cart-spacer"></div>`;
}

function menuRow(item) {
  const q = cart[item.id] || 0;
  const pd = perDl(item);
  const search = [item.name, item.desc, item.category, ...(item.tags || [])].join(' ').toLowerCase();
  return `
    <div class="menu-row ${matchesDiet(item) ? '' : 'hidden'}" data-search="${esc(search)}">
      <div class="item-main">
        <div class="item-name">${esc(item.name)}</div>
        ${item.desc ? `<div class="muted small">${esc(item.desc)}</div>` : ''}
        <div class="item-meta">
          ${pd ? `<span class="per-dl">${eur(pd)} / dl</span>` : ''}
          ${(item.tags || []).map(t => `<span class="pill ${t === 'priporočamo' ? 'pill-reco' : t === 'pekoče' ? 'pill-hot' : t === 'novo' ? 'pill-new' : ''}">${esc(t)}</span>`).join('')}
        </div>
      </div>
      <div class="item-right">
        <span class="price">${eur(item.price)}</span>
        <div class="qty">
          ${q ? `<button onclick="changeQty('${item.id}',-1)" aria-label="Odstrani">−</button><span>${q}</span>` : ''}
          <button onclick="changeQty('${item.id}',1)" aria-label="Dodaj">+</button>
        </div>
      </div>
    </div>`;
}

// Iskanje filtrira kar obstoječe vrstice, da polje ne izgubi fokusa
function applyMenuFilter() {
  const q = menuQuery.trim().toLowerCase();
  let shown = 0;
  document.querySelectorAll('.cat-block').forEach(block => {
    let any = false;
    block.querySelectorAll('.menu-row').forEach(row => {
      const ok = (!q || row.dataset.search.includes(q));
      row.classList.toggle('search-hidden', !ok);
      if (ok && !row.classList.contains('hidden')) any = true;
    });
    block.classList.toggle('hidden', !any);
    if (any) shown++;
  });
  document.getElementById('menu-empty')?.classList.toggle('hidden', shown > 0);
  document.querySelector('.reco')?.classList.toggle('hidden', !!q);
  document.querySelector('.reco')?.previousElementSibling?.classList.toggle('hidden', !!q);
}

function changeQty(id, d) {
  cart[id] = Math.max(0, (cart[id] || 0) + d);
  if (!cart[id]) delete cart[id];
  render();
}

// Koliko gost pridobi, če sprejme predlog (v €). Pri pijači primerjamo enako količino.
function upsellGain(from, to, qty) {
  if (perDl(from) && perDl(to)) return to.volumeDl / from.volumeDl * from.price - to.price;
  return qty * from.price - to.price;
}

// Gost dobi največ EN predlog na naročilo: izmed sproženih pravil izberemo najugodnejšega.
function bestUpsell(v) {
  if (upsellDone) return null;
  return v.upsells
    .filter(r => (cart[r.fromId] || 0) >= r.minQty)
    .map(r => ({ rule: r, from: v.menu.find(i => i.id === r.fromId), to: v.menu.find(i => i.id === r.toId) }))
    .filter(u => u.from && u.to)
    .map(u => ({ ...u, gain: upsellGain(u.from, u.to, cart[u.from.id]) }))
    .sort((a, b) => b.gain - a.gain)[0] || null;
}

function upsellCard({ rule, from, to }) {
  const qty = cart[from.id];
  const currentCost = qty * from.price;
  const fromPd = perDl(from), toPd = perDl(to);
  let body;

  if (fromPd && toPd) {
    const saving = Math.round((1 - toPd / fromPd) * 100);
    const equivalent = to.volumeDl / from.volumeDl * from.price;
    body = `
      <p>Imate <b>${qty}× ${esc(from.name)}</b> (${eur(currentCost)}).</p>
      <table class="compare">
        <tr><td>${esc(from.name)}</td><td>${eur(fromPd)} / dl</td></tr>
        <tr class="best"><td>${esc(to.name)}</td><td>${eur(toPd)} / dl</td></tr>
      </table>
      <p>${esc(to.name)} (${String(to.volumeDl).replace('.', ',')} dl) stane <b>${eur(to.price)}</b>
        – to je <b>${saving > 0 ? saving + ' % ceneje na dl' : 'ista cena na dl'}</b>.
        ${saving > 0 ? `Za enako količino bi v posameznih enotah plačali ${eur(equivalent)}.` : ''}</p>`;
  } else {
    const diff = to.price - currentCost;
    body = `<p>Imate <b>${qty}× ${esc(from.name)}</b> (${eur(currentCost)}).
      ${diff > 0
        ? `Za samo <b>${eur(diff)}</b> več dobite <b>${esc(to.name)}</b>${to.desc ? ` – ${esc(to.desc.toLowerCase())}` : ''}.`
        : `<b>${esc(to.name)}</b> stane ${eur(to.price)} – prihranite <b>${eur(-diff)}</b>.`}</p>`;
  }

  return `
    <div class="upsell">
      <div class="upsell-title">Namig: vzemite raje ${esc(to.name)}</div>
      ${body}
      <div class="upsell-actions">
        <button class="btn small" onclick="acceptUpsell('${rule.id}')">Zamenjaj (${qty}× → 1×)</button>
        <button class="link" onclick="dismissUpsell()">Ne, hvala</button>
      </div>
    </div>`;
}

function acceptUpsell(ruleId) {
  const v = venueById(route.venueId);
  const r = v.upsells.find(x => x.id === ruleId);
  delete cart[r.fromId];
  cart[r.toId] = (cart[r.toId] || 0) + 1;
  upsellDone = true;
  toast('Zamenjano ✔');
  render();
}

function dismissUpsell() { upsellDone = true; render(); }

function renderCart() {
  const el = document.getElementById('cart');
  const v = route.view === 'menu' && route.tab === 'meni' ? venueById(route.venueId) : null;
  const items = v ? Object.entries(cart).map(([id, q]) => ({ item: v.menu.find(i => i.id === id), q })).filter(x => x.item) : [];
  const spacer = document.querySelector('.cart-spacer');
  if (!items.length) { el.classList.add('hidden'); cartOpen = false; if (spacer) spacer.style.height = '0px'; return; }
  el.classList.remove('hidden');

  const total = items.reduce((s, x) => s + x.item.price * x.q, 0);
  const count = items.reduce((s, x) => s + x.q, 0);
  const up = bestUpsell(v);
  document.getElementById('cart-body').innerHTML = `
    ${up ? upsellCard(up) : ''}
    ${cartOpen ? `
      <ul class="cart-items">
        ${items.map(x => `<li><span>${x.q}× ${esc(x.item.name)}</span><span>${eur(x.q * x.item.price)}</span></li>`).join('')}
      </ul>` : ''}
    <div class="cart-bar">
      <span>Naročilo (${count}) · <strong>${eur(total)}</strong></span>
      <button class="link" onclick="cartOpen=!cartOpen; render()">${cartOpen ? 'Skrij' : 'Poglej naročilo'}</button>
    </div>
    ${cartOpen ? '<button class="btn full" onclick="placeOrder()">Pošlji naročilo natakarju</button>' : ''}`;
  if (spacer) spacer.style.height = el.offsetHeight + 24 + 'px';
}

function placeOrder() {
  cart = {};
  cartOpen = false;
  upsellDone = false;
  toast('Naročilo poslano ✔');
  render();
}


// ---------- pogled lokala (lastnik) ----------

function renderOwner() {
  const v = venueById(ownerVenueId) || data.venues[0];
  if (!v) return '<p>Ni lokalov.</p>';
  ownerVenueId = v.id;
  const lvl = occupancyLevel(v);
  const opts = data.venues.map(x => `<option value="${x.id}" ${x.id === v.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('');
  const itemOpts = sel => v.menu.map(i => `<option value="${i.id}" ${i.id === sel ? 'selected' : ''}>${esc(i.name)}</option>`).join('');
  const nowSlot = { now: true, min: nowMin() };
  const cap = capacityOf(v), occ = occupiedSeats(v);
  const today = todayStr();
  const allRes = v.tables.flatMap(t => t.reservations.filter(r => r.date === today).map(r => ({ r, t })))
    .sort((a, b) => a.r.min - b.r.min);

  return `
    <section class="hero small-hero">
      <h1>Nadzorna plošča lokala</h1>
      <label class="field inline">Lokal:
        <select id="o-venue" onchange="ownerVenueId=this.value; ownerTableId=null; render()">${opts}</select>
      </label>
    </section>

    <section class="card">
      <div class="section-head">
        <h2>Tloris in mize</h2>
        <span class="${lvl.cls}-text"><b>${occ}</b> / ${cap} mest zasedenih · ${freeTablesNow(v).length} ${freeTablesWord(freeTablesNow(v).length)}</span>
      </div>
      <p class="muted small">Tapnite mizo, da jo označite kot zasedeno ali prosto. Mize lahko premikate z vlečenjem.</p>
      ${floorPlan(v, { mode: 'owner', slot: nowSlot, selectedId: ownerTableId })}
      <div class="add-row">
        <button class="btn small ghost" onclick="addTable(2,'round')">+ okrogla (2)</button>
        <button class="btn small ghost" onclick="addTable(4,'rect')">+ miza (4)</button>
        <button class="btn small ghost" onclick="addTable(6,'rect')">+ velika (6)</button>
      </div>
      ${ownerTableId ? tablePanel(v, v.tables.find(t => t.id === ownerTableId)) : ''}
      <p class="muted small">Gostje vidijo: „${lvl.label}“ · posodobljeno ${timeAgo(v.updatedAt)}</p>
    </section>

    <section class="card">
      <h2>Današnje rezervacije</h2>
      ${allRes.length ? `<ul class="res-list">${allRes.map(({ r, t }) => `
        <li>
          <span class="res-time">${fmtMin(r.min)}</span>
          <span><b>${esc(r.name)}</b> · ${r.people} ${seatWord(r.people)} · miza ${esc(t.label)}${r.phone ? ` · ${esc(r.phone)}` : ''}</span>
          <span class="res-actions">
            <button class="btn small" onclick="seatReservation('${t.id}','${r.id}')">Gostje so prišli</button>
            <button class="link danger" onclick="cancelReservation('${t.id}','${r.id}')">Prekliči</button>
          </span>
        </li>`).join('')}</ul>` : '<p class="muted">Danes še ni rezervacij.</p>'}
    </section>

    <section class="card">
      <h2>Digitalni meni</h2>
      <table class="owner-table">
        <thead><tr><th>Kategorija</th><th>Artikel</th><th>Opis</th><th>Cena €</th><th>Količina dl</th><th></th></tr></thead>
        <tbody>
          ${v.menu.map(i => `
            <tr>
              <td data-label="Kategorija"><input value="${esc(i.category)}" onchange="editItem('${i.id}','category',this.value)"></td>
              <td data-label="Artikel"><input value="${esc(i.name)}" onchange="editItem('${i.id}','name',this.value)"></td>
              <td data-label="Opis"><input value="${esc(i.desc || '')}" placeholder="–" onchange="editItem('${i.id}','desc',this.value)"></td>
              <td data-label="Cena €"><input type="number" step="0.1" min="0" value="${i.price}" onchange="editItem('${i.id}','price',this.value)"></td>
              <td data-label="Količina dl"><input type="number" step="0.1" min="0" value="${i.volumeDl ?? ''}" placeholder="–" onchange="editItem('${i.id}','volumeDl',this.value)"></td>
              <td><button class="link danger" onclick="removeItem('${i.id}')">✕</button></td>
            </tr>`).join('')}
        </tbody>
      </table>
      <form class="add-row" onsubmit="addItem(event)">
        <input name="category" placeholder="Kategorija" required>
        <input name="name" placeholder="Artikel" required>
        <input name="desc" placeholder="Opis (neobvezno)">
        <input name="price" type="number" step="0.1" min="0" placeholder="Cena €" required>
        <input name="volumeDl" type="number" step="0.1" min="0" placeholder="dl (neobvezno)">
        <button class="btn small">Dodaj</button>
      </form>
      <p class="muted small">Pri pijači vpišite količino v dl – gostom se nato samodejno prikaže cena na dl.</p>
    </section>

    <section class="card">
      <h2>Upsell pravila</h2>
      <p class="muted small">Ko gost naroči vsaj <i>N</i> kosov artikla A, mu predlagamo artikel B in prikažemo primerjavo cene na dl. Gost vidi <b>največ en predlog na naročilo</b> – tistega, pri katerem največ pridobi.</p>
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

function tablePanel(v, t) {
  if (!t) return '';
  const today = todayStr();
  const res = t.reservations.filter(r => r.date === today).sort((a, b) => a.min - b.min);
  return `
    <div class="table-panel">
      <div class="section-head">
        <strong>Miza ${esc(t.label)}</strong>
        <button class="link" onclick="ownerTableId=null; render()">zapri</button>
      </div>
      <div class="status-toggle">
        <button class="${!t.occupied ? 'active free' : ''}" onclick="setTableOccupied('${t.id}', false)">Prosta</button>
        <button class="${t.occupied ? 'active occupied' : ''}" onclick="setTableOccupied('${t.id}', true)">Zasedena</button>
      </div>
      <div class="add-row">
        <label class="field">Oznaka <input id="tp-label" value="${esc(t.label)}" onchange="editTable('${t.id}','label',this.value)"></label>
        <label class="field">Mest <input id="tp-seats" type="number" min="1" max="20" value="${t.seats}" onchange="editTable('${t.id}','seats',this.value)"></label>
        <label class="field">Opomba <input id="tp-note" value="${esc(t.note || '')}" placeholder="npr. ob oknu" onchange="editTable('${t.id}','note',this.value)"></label>
      </div>
      ${res.length ? `<p class="small"><b>Rezervacije:</b> ${res.map(r => `${fmtMin(r.min)} ${esc(r.name)} (${r.people})`).join(', ')}</p>` : ''}
      <button class="link danger" onclick="removeTable('${t.id}')">Odstrani mizo</button>
    </div>`;
}

function currentOwnerVenue() { return venueById(ownerVenueId); }
const ownerTable = id => currentOwnerVenue().tables.find(t => t.id === id);

function setTableOccupied(id, occupied) {
  ownerTable(id).occupied = occupied;
  touch(currentOwnerVenue()); save(); render();
}

function editTable(id, field, val) {
  const t = ownerTable(id);
  if (field === 'seats') t.seats = Math.max(1, Math.min(20, parseInt(val, 10) || 1));
  else t[field] = val.trim();
  touch(currentOwnerVenue()); save(); render();
}

function addTable(seats, shape) {
  const v = currentOwnerVenue();
  const used = new Set(v.tables.map(t => t.label));
  let n = 1; while (used.has(String(n))) n++;
  const t = { id: uid(), label: String(n), seats, shape, x: 50, y: 50, occupied: false, reservations: [] };
  v.tables.push(t);
  ownerTableId = t.id;
  touch(v); save(); render(); toast('Miza dodana – povlecite jo na pravo mesto');
}

function removeTable(id) {
  const v = currentOwnerVenue();
  v.tables = v.tables.filter(t => t.id !== id);
  ownerTableId = null;
  touch(v); save(); render();
}

function seatReservation(tableId, resId) {
  const t = ownerTable(tableId);
  t.reservations = t.reservations.filter(r => r.id !== resId);
  t.occupied = true;
  touch(currentOwnerVenue()); save(); render(); toast(`Miza ${t.label} je zdaj zasedena`);
}

function cancelReservation(tableId, resId) {
  const t = ownerTable(tableId);
  t.reservations = t.reservations.filter(r => r.id !== resId);
  touch(currentOwnerVenue()); save(); render(); toast('Rezervacija preklicana');
}

// Vlečenje miz na tlorisu lastnika; kratek dotik = izbira mize
let drag = null;

document.addEventListener('pointerdown', e => {
  const el = e.target.closest('.floor.owner [data-table]');
  if (!el) return;
  const floor = el.parentElement.getBoundingClientRect();
  drag = { el, id: el.dataset.table, floor, startX: e.clientX, startY: e.clientY, moved: false };
  el.setPointerCapture(e.pointerId);
});

document.addEventListener('pointermove', e => {
  if (!drag) return;
  if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > 6) drag.moved = true;
  if (!drag.moved) return;
  const x = Math.max(4, Math.min(96, (e.clientX - drag.floor.left) / drag.floor.width * 100));
  const y = Math.max(5, Math.min(95, (e.clientY - drag.floor.top) / drag.floor.height * 100));
  drag.el.style.left = x + '%';
  drag.el.style.top = y + '%';
  drag.x = x; drag.y = y;
});

document.addEventListener('pointerup', () => {
  if (!drag) return;
  const t = ownerTable(drag.id);
  if (drag.moved && drag.x != null) {
    t.x = Math.round(drag.x); t.y = Math.round(drag.y);
    save();
  } else {
    ownerTableId = ownerTableId === drag.id ? null : drag.id;
  }
  drag = null;
  render();
});

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
    desc: f.get('desc').trim() || undefined,
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
  data = makeSeed();
  ownerVenueId = data.venues[0].id;
  ownerTableId = null;
  save(); render(); toast('Podatki ponastavljeni');
}

render();
