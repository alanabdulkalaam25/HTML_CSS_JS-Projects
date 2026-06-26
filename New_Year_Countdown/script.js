const year = document.querySelector(".year");
const days = document.getElementById("days");
const hours = document.getElementById("hours");
const minutes = document.getElementById("minutes");
const seconds = document.getElementById("seconds");

const newYearTime = new Date("Jan 1 2027 00:00:00").getTime();

function updateCountdown() {
  const now = new Date().getTime();
  const gap = newYearTime - now;
  currYear = new Date().getFullYear();

  const sec = 1000;
  const min = sec * 60;
  const hor = min * 60;
  const day = hor * 24;

  const d = Math.floor(gap / day);
  const h = Math.floor((gap % day) / hor);
  const m = Math.floor((gap % hor) / min);
  const s = Math.floor((gap % min) / sec);

  year.innerHTML = 2027;
  days.innerHTML = d;
  hours.innerHTML = h;
  minutes.innerHTML = m;
  seconds.innerHTML = s;

  setTimeout(updateCountdown, 1000);
}

updateCountdown();
