const inputEle = document.getElementById("input");
const infoTxtEle = document.getElementById("infoTxt");
const resultCont = document.querySelector(".result");
const titleEle = document.getElementById("title");
const resultEle = document.getElementById("meaning");
const audioEle = document.getElementById("audio");

async function fetchAPI(word) {
  try {
    infoTxtEle.style.display = "block";
    resultCont.style.display = "none";
    infoTxtEle.innerText = `Searching the meaning of ${word}...`;
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.title) {
      resultCont.style.display = "block";
      titleEle.innerText = word;
      resultEle.innerText = "N/A";
      audioEle.style.display = "none";
    } else {
      infoTxtEle.style.display = "none";
      resultCont.style.display = "block";
      audioEle.style.display = "inline-flex";
      titleEle.innerText = data[0].word;
      resultEle.innerText = data[0].meanings[0].definitions[0].definition;
      audioEle.src = data[0].phonetics[0].audio;
    }
  } catch (err) {
    console.error("Fetch failed:", err.message);
    infoTxtEle.innerText = "Something went wrong. Try again later.";
  }
}

inputEle.addEventListener("keyup", (e) => {
  if (e.target.value && e.key === "Enter") {
    fetchAPI(e.target.value);
  }
});
