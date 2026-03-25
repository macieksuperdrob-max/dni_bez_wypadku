const dataOstatniegoWypadku = new Date("2024-04-19");
let rekord = 697;

function obliczDni() {

  const dzis = new Date();
  const roznica = dzis - dataOstatniegoWypadku;
  const dni = Math.floor(roznica / (1000 * 60 * 60 * 24));

  if (dni > rekord) {
    rekord = dni;
  }

  document.getElementById("dni").textContent = dni;
  document.getElementById("rekord").textContent = rekord;

  document.getElementById("data").textContent =
    dataOstatniegoWypadku.toLocaleDateString("pl-PL");

}

obliczDni();
setInterval(obliczDni, 3600000);

function refreshAtMidnight() {

  const now = new Date();
  const midnight = new Date();

  midnight.setHours(24, 0, 0, 0);

  const timeout = midnight - now;

  setTimeout(() => location.reload(), timeout);

}

refreshAtMidnight();