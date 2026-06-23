const currFirst = document.getElementById("currency-first");
const wortFirst = document.getElementById("worth-first");
const currSecond = document.getElementById("currency-second");
const wortSecond = document.getElementById("worth-second");
const exRate = document.getElementById("ex-rate");

updateRate();

function updateRate() {
  fetch(
    `https://v6.exchangerate-api.com/v6/f3d17c79433009b4694d4759/latest/${currFirst.value}`,
  )
    .then((res) => res.json())
    .then((data) => {
      if (!data || !data.conversion_rates) {
        exRate.innerText = "Exchange rate unavailable";
        return;
      }
      const rate = data.conversion_rates[currSecond.value];
      const amount = parseFloat(wortFirst.value) || 0;
      const displayRate =
        rate >= 1 ? rate.toFixed(2) : rate.toFixed(6).replace(/\.?0+$/, "");
      exRate.innerHTML = `1 ${currFirst.value} = ${displayRate} ${currSecond.value}`;
      wortSecond.value = (amount * rate).toFixed(2);
    })
    .catch((err) => {
      console.error("Fetch error:", err);
      exRate.innerText = "Exchange rate unavailable";
    });
}

currFirst.addEventListener("change", updateRate);

currSecond.addEventListener("change", updateRate);

wortFirst.addEventListener("input", updateRate);
