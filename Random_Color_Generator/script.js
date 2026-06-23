const cont = document.querySelector(".container");

for (let i = 0; i < 32; i++) {
  const colorCont = document.createElement("div");
  colorCont.classList.add("color-container");
  cont.appendChild(colorCont);
}

const colorConts = document.querySelectorAll(".color-container");

function generateColor() {
  colorConts.forEach((colorCont) => {
    const newClrCode = randomColor();
    colorCont.style.backgroundColor = `#${newClrCode}`;
    colorCont.innerHTML = `#${newClrCode}`;
  });
}

function randomColor() {
  const chars = "0123456789abcdef";
  const clrCodeLen = 6;
  let colorCode = "";
  for (let i = 0; i < clrCodeLen; i++) {
    const randNum = Math.floor(Math.random() * chars.length);
    colorCode += chars.substring(randNum, randNum + 1);
  }
  return colorCode;
}

generateColor();
