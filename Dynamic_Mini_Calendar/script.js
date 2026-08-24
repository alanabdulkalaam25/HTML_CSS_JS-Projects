const monthEle = document.getElementById("monthName");
const yearEle = document.getElementById("year");
const dayName = document.getElementById("dayName");
const dayNum = document.getElementById("dayNumber");

const date = new Date();
const month = date.getMonth();

monthEle.innerText = date.toLocaleString("en", { month: "long" });
dayName.innerText = date.toLocaleString("en", { weekday: "long" });
dayNum.innerText = date.getDate();
yearEle.innerText = date.getFullYear();
