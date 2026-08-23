const imageCont = document.querySelector(".image-cont");
const btn = document.querySelector(".btn");

function addNewImages() {
  const imgEle = document.createElement("img");
  imgEle.src = `https://picsum.photos/350?random=${Math.floor(Math.random() * 2000)}`;
  imageCont.appendChild(imgEle);
}

btn.addEventListener("click", () => {
  addNewImages();
  addNewImages();
  addNewImages();
});
