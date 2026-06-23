const cont = document.getElementById("container");

const redBtn = document.getElementById("red");
const blueBtn = document.getElementById("blue");
const greenBtn = document.getElementById("green");
const blackBtn = document.getElementById("black");
const whiteBtn = document.getElementById("white");
const autoBtn = document.getElementById("auto");

redBtn.addEventListener("click", () => {
  cont.style.backgroundColor = "#ff0000";
});

blueBtn.addEventListener("click", () => {
  cont.style.backgroundColor = "#0000ff";
});

greenBtn.addEventListener("click", () => {
  cont.style.backgroundColor = "#00ff00";
});

whiteBtn.addEventListener("click", () => {
  cont.style.backgroundColor = "#ffffff";
});

blackBtn.addEventListener("click", () => {
  cont.style.backgroundColor = "#000000";
});

autoBtn.addEventListener("click", () => {
  setTimeout(() => {}, 2000);
});
