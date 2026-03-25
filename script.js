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
   Parser gwarantujący działanie wszędzie
   =========================== */
function parseISODate(d) {
  const parts = d.split('-').map(Number);
  if (parts.length !== 3) return new Date(NaN);
  const [y, m, day] = parts;
  return new Date(y, m - 1, day);
}

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
   Start po załadowaniu DOM
   =========================== */
window.addEventListener('DOMContentLoaded', () => {

  function atMidnight(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function daysBetween(a, b) {
    const MS = 24*60*60*1000;
    return Math.floor((atMidnight(b) - atMidnight(a)) / MS);
  }

  const lastAccident = parseISODate(CONFIG.LAST_ACCIDENT_ISO);
  const now = new Date();
  const today = atMidnight(now);
  const currentStreak = daysBetween(lastAccident, today);

  /* ===========================
     LocalStorage – bezpiecznie
     =========================== */
  let storageWorking = true;
  try {
    localStorage.setItem('ls_test', '1');
    localStorage.removeItem('ls_test');
  } catch(e) {
    storageWorking = false;
  }

  let saved = null;
  let record = Math.max(CONFIG.RECORD_BASE_DAYS, currentStreak);

  if (storageWorking) {
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
     Formatter daty – bezpieczny
     =========================== */
  let fmtPL;
  try {
    fmtPL = new Intl.DateTimeFormat('pl-PL', {
      day:'2-digit', month:'2-digit', year:'numeric'
    });
  } catch(e) {
    fmtPL = {
      format: d =>
        String(d.getDate()).padStart(2,'0') + '.' +
        String(d.getMonth()+1).padStart(2,'0') + '.' +
        d.getFullYear()
    };
  }

  /* ===========================
     Render danych
     =========================== */
  document.getElementById('days').textContent = currentStreak;
  document.getElementById('record').textContent = record;
  document.getElementById('last-date').textContent = fmtPL.format(lastAccident);
  document.getElementById('logoImg').src = CONFIG.LOGO_URL;

  document.getElementById('buildInfo').textContent =
    'Build: ' + new Date().toLocaleString('pl-PL');

  /* ===========================
     Auto‑reload po północy
     =========================== */
  (function scheduleMidnightUpdate(){
    const nextMidnight = new Date(today.getTime() + 24*60*60*1000);
    const ms = nextMidnight - now;
    setTimeout(() => location.reload(true), ms + 2000);
  })();

});