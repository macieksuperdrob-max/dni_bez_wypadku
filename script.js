/* ===========================
   CONFIG
   =========================== */
const CONFIG = {
  LAST_ACCIDENT_ISO: '2024-04-19',
  RECORD_BASE_DAYS: 1070,
  AUTO_SAVE_NEW_RECORD: true,
  LOCALSTORAGE_KEY: 'planttec_bhp_record_days',
  LOGO_URL: 'PT.png'
};

/* ===========================
   Parametry URL
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
   Funkcje pomocnicze
   =========================== */
function atMidnight(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysBetween(a, b) {
  const MS = 24 * 60 * 60 * 1000;
  return Math.floor((atMidnight(b) - atMidnight(a)) / MS);
}

/* ===========================
   Logika obliczeń
   =========================== */
const lastAccident = new Date(CONFIG.LAST_ACCIDENT_ISO + 'T00:00:00');
const now = new Date();
const today = atMidnight(now);

const currentStreak = daysBetween(lastAccident, today);

let record = Math.max(CONFIG.RECORD_BASE_DAYS, currentStreak);

try {
  const saved = localStorage.getItem(CONFIG.LOCALSTORAGE_KEY);

  if (saved !== null && !Number.isNaN(Number(saved))) {
    record = Math.max(record, Number(saved));
  }

  if (CONFIG.AUTO_SAVE_NEW_RECORD && currentStreak > Number(saved ?? -1)) {
    localStorage.setItem(CONFIG.LOCALSTORAGE_KEY, String(currentStreak));
  }
} catch (e) {}

/* ===========================
   Render
   =========================== */
document.getElementById('days').textContent   = currentStreak;
document.getElementById('record').textContent = record;

const fmtPL = new Intl.DateTimeFormat('pl-PL', {
  day:'2-digit', month:'2-digit', year:'numeric'
});

document.getElementById('last-date').textContent = fmtPL.format(lastAccident);

document.getElementById('logoImg').src = CONFIG.LOGO_URL;

document.getElementById('buildInfo').textContent =
  'Build: ' + new Date().toLocaleString('pl-PL');

/* Odświeżanie o północy */
(function scheduleMidnightUpdate(){
  const nextMidnight = new Date(today.getTime() + 24*60*60*1000);
  const ms = nextMidnight - now;
  setTimeout(() => location.reload(true), ms + 2000);
})();