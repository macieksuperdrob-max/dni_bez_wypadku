/* ===========================
   CONFIG
   =========================== */
const CONFIG = {
  LAST_ACCIDENT_ISO: '2023-04-19',     // domyślna data (RRRR-MM-DD)
  RECORD_BASE_DAYS: 2370,              // dotychczasowy rekord historyczny
  AUTO_SAVE_NEW_RECORD: true,          // zapamiętywanie nowego rekordu
  LOCALSTORAGE_KEY: 'planttec_bhp_record_days',
  LOGO_URL: 'PT.png'
};
 
/* ===========================
   Parametry URL (opcjonalne)
   ?date=RRRR-MM-DD
   ?record=1234
   ?logo=https://.../logo.svg
   =========================== */
const url = new URL(window.location.href);
const dateParam   = url.searchParams.get('date');
const recordParam = url.searchParams.get('record');
const logoParam   = url.searchParams.get('logo');
 
if (dateParam)   CONFIG.LAST_ACCIDENT_ISO = dateParam;
if (recordParam && !Number.isNaN(Number(recordParam))) {
  CONFIG.RECORD_BASE_DAYS = Number(recordParam);
}
if (logoParam)   CONFIG.LOGO_URL = logoParam;
 
/* ===========================
   Pomocnicze funkcje
   =========================== */
function atMidnight(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function daysBetween(a, b) {
  const MS = 24*60*60*1000;
  return Math.floor((atMidnight(b) - atMidnight(a)) / MS);
}
 
/* ===========================
   Logika wyliczeń + render
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
} catch(e){ /* player może blokować localStorage – ignorujemy */ }
 
document.getElementById('days').textContent   = currentStreak;
document.getElementById('record').textContent = record;
 
const fmtPL = new Intl.DateTimeFormat('pl-PL', { day:'2-digit', month:'2-digit', year:'numeric' });
document.getElementById('last-date').textContent = fmtPL.format(lastAccident);
 
// ustaw logo z config / parametru
document.getElementById('logoImg').src = CONFIG.LOGO_URL;
 
// build info do diagnostyki cache
document.getElementById('buildInfo').textContent =
  'Build: ' + new Date().toLocaleString('pl-PL');
 
/* Auto‑refresh po północy */
(function scheduleMidnightUpdate(){
  const nextMidnight = new Date(today.getTime() + 24*60*60*1000);
  const ms = nextMidnight - now;
  setTimeout(() => location.reload(true), ms + 2000);
})();