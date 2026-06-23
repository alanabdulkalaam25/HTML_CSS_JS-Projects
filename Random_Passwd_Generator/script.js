const genBtn = document.getElementById("gen");
const input = document.getElementById("input");
const copyBtn = document.querySelector(".fa-copy");
const alertCont = document.querySelector(".alert-container");

genBtn.addEventListener("click", () => {
  createPassword();
});

copyBtn.addEventListener("click", () => {
  copyPassword();
  if (input.value) {
    alertCont.classList.remove("active");
    setTimeout(() => {
      alertCont.classList.add("active");
    }, 2000);
  }
});

function createPassword() {
  const chars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIKJLMNOPQRSTUVWXYZ@_!&*#^?+-:{}[]$%()";
  const passLen = 14;
  let password = "";
  for (let i = 0; i < passLen; i++) {
    const randNum = Math.floor(Math.random() * chars.length);
    password += chars.substring(randNum, randNum + 1);
  }
  input.value = password;
  alertCont.innerHTML = `${password} copied!`;
}

function copyPassword() {
  input.select();
  input.setSelectionRange(0, 9999);
  navigator.clipboard.writeText(input.value);
}
