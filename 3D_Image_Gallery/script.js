const imgCont = document.querySelector(".image-container");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");

let rotateY = 0;
let timer;

function updateGallery() {
  imgCont.style.transform = `perspective(1000px) rotateY(${rotateY}deg)`;
  timer = setTimeout(() => {
    rotateY = rotateY - 45;
    updateGallery();
  }, 3000);
}

prevBtn.addEventListener("click", () => {
  rotateY = rotateY + 45;
  clearTimeout(timer);
  updateGallery();
});

nextBtn.addEventListener("click", () => {
  rotateY = rotateY - 45;
  clearTimeout(timer);
  updateGallery();
});

updateGallery();
