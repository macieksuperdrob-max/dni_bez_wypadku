
/* ===========================
   CONFIG (ES5)
   =========================== */
var CONFIG = {
  LAST_ACCIDENT_ISO: '2023-04-19',
  RECORD_BASE_DAYS: 2370,
  AUTO_SAVE_NEW_RECORD: true,
  LOCALSTORAGE_KEY: 'planttec_bhp_record_days',
  LOGO_URL: 'PT.png'
};

/* ===========================
   PARSER PARAMETRÓW URL (ES5)
   =========================== */
function getQueryParams() {
  var params = {};
  var href = window.location.href;
  var qIndex = href.indexOf('?');
  if (qIndex === -1) return params;

  var query = href.substring(qIndex + 1).split('&');
  for (var i = 0; i < query.length; i++) {
    var part = query[i];
    var eq = part.indexOf('=');
    if (eq > -1) {
      var key = decodeURIComponent(part.substring(0, eq));
      var val = decodeURIComponent(part.substring(eq + 1));
      params[key] = val;
    }
  }
  return params;
}

var params = getQueryParams();

if (params.date) CONFIG.LAST_ACCIDENT_ISO = params.date;
if (params.record && !isNaN(Number(params.record))) {
  CONFIG.RECORD_BASE_DAYS = Number(params.record);
}
if (params.logo) CONFIG.LOGO_URL = params.logo;

/* ===========================
   PARSER DATY – BEZ ES6
   =========================== */
function parseISO(iso) {
  var p = iso.split('-');
  if (p.length !== 3) return new Date(NaN);

  var y = parseInt(p[0], 10);
  var m = parseInt(p[1], 10);
  var d = parseInt(p[2], 10);

  if (!y || !m || !d) return new Date(NaN);

  return new Date(y, m - 1, d);
}

/* ===========================
   FORMATOWANIE DATY – ES5
   =========================== */
function pad2(v) {
  v = String(v);
  return v.length < 2 ? '0' + v : v;
}

function formatPL(d) {
  return pad2(d.getDate()) + '.' + pad2(d.getMonth() + 1) + '.' + d.getFullYear();
}

/* ===========================
   FUNKCJE POMOCNICZE
   =========================== */
function atMidnight(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysBetween(a, b) {
  var MS = 24 * 60 * 60 * 1000;
  return Math.floor((atMidnight(b) - atMidnight(a)) / MS);
}

/* ===========================
   START SKRYPTU
   =========================== */
window.onload = function() {

  var lastAccident = parseISO(CONFIG.LAST_ACCIDENT_ISO);
  var now = new Date();
  var today = atMidnight(now);
  var currentStreak = daysBetween(lastAccident, today);

  /* ===========================
     LOCAL STORAGE (ES5)
     =========================== */
  var storageOK = true;
  try {
    localStorage.setItem('test_ls', '1');
    localStorage.removeItem('test_ls');
  } catch (e) {
    storageOK = false;
  }

  var saved = null;
  var record = Math.max(CONFIG.RECORD_BASE_DAYS, currentStreak);

  if (storageOK) {
    try {
      saved = localStorage.getItem(CONFIG.LOCALSTORAGE_KEY);
      if (saved !== null && !isNaN(Number(saved))) {
        record = Math.max(record, Number(saved));
      }
      if (CONFIG.AUTO_SAVE_NEW_RECORD && currentStreak > Number(saved || -1)) {
        localStorage.setItem(CONFIG.LOCALSTORAGE_KEY, String(currentStreak));
      }
    } catch (e) {}
  }

  /* ===========================
     RENDER
     =========================== */
  document.getElementById('days').innerHTML = currentStreak;
  document.getElementById('record').innerHTML = record;
  document.getElementById('last-date').innerHTML = formatPL(lastAccident);
  document.getElementById('logoImg').src = CONFIG.LOGO_URL;

  document.getElementById('buildInfo').innerHTML =
    "Build: " +
    pad2(now.getDate()) + "." +
    pad2(now.getMonth() + 1) + "." +
    now.getFullYear() + " " +
    pad2(now.getHours()) + ":" +
    pad2(now.getMinutes());

  /* ===========================
     AUTO‑REFRESH O PÓŁNOCY
     =========================== */
  var nextMidnight = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  var ms = nextMidnight - now;
  setTimeout(function() {
    location.reload(true);
  }, ms + 2000);

};
