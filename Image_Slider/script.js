const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("prev");
const imgCont = document.getElementById("img-cont");
const imgs = document.querySelectorAll("img");

let currentImg = 1;

nextBtn.addEventListener("click", () => {
  currentImg++;
  clearTimeout(timeout);
  updateImg();
});

prevBtn.addEventListener("click", () => {
  currentImg--;
  clearTimeout(timeout);
  updateImg();
});

updateImg();

function updateImg() {
  if (currentImg > imgs.length) currentImg = 1;
  else if (currentImg < 1) currentImg = imgs.length;
  imgCont.style.transform = `translateX(-${(currentImg - 1) * 500}px)`;
  timeout = setTimeout(() => {
    currentImg++;
    updateImg();
  }, 3000);
}
