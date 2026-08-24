const inputEle = document.getElementById("input");
const infoTxtEle = document.getElementById("infoTxt");
const resultCont = document.querySelector(".result");
const titleEle = document.getElementById("title");
const resultEle = document.getElementById("meaning");
const audioEle = document.getElementById("audio");

async function fetchAPI(rawWord) {
  const word = rawWord.trim().toLowerCase();
  if (!word) return;

  inputEle.disabled = true;
  infoTxtEle.style.display = "block";
  resultCont.style.display = "none";
  infoTxtEle.innerText = `Searching the meaning of "${word}"...`;

  try {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
    const response = await fetch(url);

    if (response.status === 404) {
      infoTxtEle.innerText = `No definitions found for "${word}". Try another word!`;
      return;
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const entry = data[0];

    // find the first phonetics entry that actually has an audio file
    const phoneticWithAudio = entry.phonetics.find((p) => p.audio);

    titleEle.innerText = entry.word;
    resultEle.innerText =
      entry.meanings?.[0]?.definitions?.[0]?.definition ??
      "No definition available.";

    if (phoneticWithAudio) {
      audioEle.src = phoneticWithAudio.audio;
      audioEle.style.display = "inline-flex";
    } else {
      audioEle.removeAttribute("src");
      audioEle.style.display = "none";
    }

    infoTxtEle.style.display = "none";
    resultCont.style.display = "block";
  } catch (err) {
    console.error("Fetch failed:", err.message);
    infoTxtEle.innerText = "Something went wrong. Try again later.";
  } finally {
    inputEle.disabled = false;
  }
}

inputEle.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    fetchAPI(e.target.value);
  }
});
