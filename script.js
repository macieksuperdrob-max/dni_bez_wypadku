/* ===========================
   CONFIG
   =========================== */
const CONFIG = {
  LAST_ACCIDENT_ISO: '2023-04-19',
  RECORD_BASE_DAYS: 2370,
  AUTO_SAVE_NEW_RECORD: true,
  LOCALSTORAGE_KEY: 'planttec_bhp_record_days',
  LOGO_URL: 'PT.png'
};

/* ===========================
   URL PARAMS
   =========================== */
const url = new URL(window.location.href);
const dateParam   = url.searchParams.get('date');
const recordParam = url.searchParams.get('record');
const logoParam   = url.searchParams.get('logo');

if (dateParam) CONFIG.LAST_ACCIDENT_ISO = dateParam;
if (recordParam && !Number.isNaN(Number(recordParam))) {
  CONFIG.RECORD_BASE_DAYS = Number(recordParam);
}
if (logoParam) CONFIG.LOGO_URL = logoParam;

/* ===========================
   PARSER 100% KOMPATYBILNY
   =========================== */
function parseDateCompat(iso) {
  // akceptuje też format 2023-4-9 itd.
  let p = iso.split('-');
  if (p.length !== 3) return new Date(NaN);

  let y = parseInt(p[0], 10);
  let m = parseInt(p[1], 10);
  let d = parseInt(p[2], 10);

  if (!y || !m || !d) return new Date(NaN);

  return new Date(y, m - 1, d);
}

/* ===========================
   FORMAT DD.MM.RRRR — BEZ INTL
   =========================== */
function formatPL(d) {
  let dd = String(d.getDate()).padStart(2, '0');
  let mm = String(d.getMonth() + 1).padStart(2, '0');
  let yyyy = d.getFullYear();
  return dd + '.' + mm + '.' + yyyy;
}

/* ===========================
   FUNKCJE POMOCNICZE
   =========================== */
function atMidnight(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysBetween(a, b) {
  const MS = 24*60*60*1000;
  return Math.floor((atMidnight(b) - atMidnight(a)) / MS);
}

/* ===========================
   LOGIKA — kompatybilna z Android 7 WebView
   =========================== */
window.addEventListener('DOMContentLoaded', () => {

  const lastAccident = parseDateCompat(CONFIG.LAST_ACCIDENT_ISO);
  const now = new Date();
  const today = atMidnight(now);
  const currentStreak = daysBetween(lastAccident, today);

  /* ===== LOCAL STORAGE FALLBACK ===== */
  let storageOK = true;
  try {
    localStorage.setItem('ls_test', '1');
    localStorage.removeItem('ls_test');
  } catch(e) {
    storageOK = false;
  }

  let saved = null;
  let record = Math.max(CONFIG.RECORD_BASE_DAYS, currentStreak);

  if (storageOK) {
    try {
      saved = localStorage.getItem(CONFIG.LOCALSTORAGE_KEY);
      if (saved !== null && !Number.isNaN(Number(saved))) {
        record = Math.max(record, Number(saved));
      }
      if (CONFIG.AUTO_SAVE_NEW_RECORD && currentStreak > Number(saved ?? -1)) {
        localStorage.setItem(CONFIG.LOCALSTORAGE_KEY, String(currentStreak));
      }
    } catch(e){}
  }

  /* ===========================
     RENDER DANYCH
     =========================== */
  document.getElementById('days').textContent = currentStreak;
  document.getElementById('record').textContent = record;
  document.getElementById('last-date').textContent = formatPL(lastAccident);
  document.getElementById('logoImg').src = CONFIG.LOGO_URL;

  document.getElementById('buildInfo').textContent =
    'Build: ' + now.getDate().toString().padStart(2,'0') + '.' +
    (now.getMonth()+1).toString().padStart(2,'0') + '.' +
    now.getFullYear() + ' ' + now.getHours() + ':' +
    now.getMinutes().toString().padStart(2,'0');

  /* ===========================
     AUTO-REFRESH O PÓŁNOCY
     =========================== */
  (function scheduleMidnightUpdate(){
    const nextMidnight = new Date(today.getTime() + 24*60*60*1000);
    const ms = nextMidnight - now;
    setTimeout(() => location.reload(true), ms + 2000);
  })();

});