const queryForm = document.getElementById("queryForm");
const inputEle = document.getElementById("input");
const searchBtn = document.getElementById("searchBtn");
const outputPane = document.getElementById("outputPane");
const idleLine = document.getElementById("idleLine");
const entryEle = document.getElementById("entry");
const titleEle = document.getElementById("title");
const phoneticEle = document.getElementById("phonetic");
const audioRowEle = document.getElementById("audioRow");
const meaningsListEle = document.getElementById("meaningsList");
const sourceRowEle = document.getElementById("sourceRow");
const recentRowEle = document.getElementById("recentRow");

const audioPlayer = new Audio();
const RECENT_KEY = "dict_recent_words";
const RECENT_MAX = 8;
const DEFS_VISIBLE_DEFAULT = 5;
const CHIPS_VISIBLE_DEFAULT = 6;

let statusLineEle = null;

function showIdle() {
  entryEle.hidden = true;
  if (statusLineEle) statusLineEle.remove();
  statusLineEle = null;
  idleLine.hidden = false;
}

function showStatus(mainText, detailText, isWarn) {
  entryEle.hidden = true;
  idleLine.hidden = true;
  if (statusLineEle) statusLineEle.remove();

  statusLineEle = document.createElement("p");
  statusLineEle.className = "status-line" + (isWarn ? " warn" : "");
  statusLineEle.textContent = mainText;

  if (detailText) {
    const detail = document.createElement("span");
    detail.className = "detail";
    detail.textContent = detailText;
    statusLineEle.appendChild(detail);
  }

  outputPane.appendChild(statusLineEle);
}

function showLoading(word) {
  showStatus(`resolving "${word}"`, null, false);
  statusLineEle.classList.add("loading-dots");
}

function getRecent() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
  } catch {
    return [];
  }
}

function addRecent(word) {
  let recent = getRecent().filter((w) => w !== word);
  recent.unshift(word);
  recent = recent.slice(0, RECENT_MAX);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
  } catch {}
  renderRecent();
}

function renderRecent() {
  recentRowEle.innerHTML = "";
  getRecent().forEach((word, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.action = "lookup";
    btn.dataset.word = word;

    const idx = document.createElement("span");
    idx.className = "hist-index";
    idx.textContent = `${i + 1}`;
    btn.appendChild(idx);
    btn.appendChild(document.createTextNode(word));

    recentRowEle.appendChild(btn);
  });
}

function guessAccentLabel(url, index) {
  const lower = url.toLowerCase();
  if (lower.includes("-us-") || lower.includes("_us_")) return "US";
  if (
    lower.includes("-uk-") ||
    lower.includes("_gb_") ||
    lower.includes("_uk_")
  )
    return "UK";
  if (lower.includes("-au-") || lower.includes("_au_")) return "AU";
  return `audio ${index + 1}`;
}

function createTagGroup(words, type, groupId) {
  if (!words || words.length === 0) return null;

  const row = document.createElement("div");
  row.className = "tag-group";

  const label = document.createElement("span");
  label.className = "tag-label";
  label.textContent = type === "synonym" ? "syn:" : "ant:";
  row.appendChild(label);

  const visible = words.slice(0, CHIPS_VISIBLE_DEFAULT);
  const rest = words.slice(CHIPS_VISIBLE_DEFAULT);

  visible.forEach((w) => row.appendChild(createChip(w, type)));

  if (rest.length > 0) {
    const restWrap = document.createElement("span");
    restWrap.className = "hidden-item";
    restWrap.dataset.group = groupId;
    rest.forEach((w) => restWrap.appendChild(createChip(w, type)));
    row.appendChild(restWrap);

    const moreBtn = document.createElement("button");
    moreBtn.type = "button";
    moreBtn.className = "more-btn";
    moreBtn.dataset.action = "toggle";
    moreBtn.dataset.target = groupId;
    moreBtn.textContent = `+${rest.length} more`;
    row.appendChild(moreBtn);
  }

  return row;
}

function createChip(word, type) {
  const chip = document.createElement("button");
  chip.type = "button";
  chip.className = `chip ${type}`;
  chip.dataset.action = "lookup";
  chip.dataset.word = word;
  chip.textContent = word;
  return chip;
}

function createDefinitionItem(def) {
  const li = document.createElement("li");
  li.appendChild(document.createTextNode(def.definition));

  if (def.example) {
    const ex = document.createElement("span");
    ex.className = "example-line";
    ex.textContent = `// "${def.example}"`;
    li.appendChild(ex);
  }

  const synGroup = createTagGroup(
    def.synonyms,
    "synonym",
    `syn-${Math.random().toString(36).slice(2)}`,
  );
  if (synGroup) li.appendChild(synGroup);

  const antGroup = createTagGroup(
    def.antonyms,
    "antonym",
    `ant-${Math.random().toString(36).slice(2)}`,
  );
  if (antGroup) li.appendChild(antGroup);

  return li;
}

function createMeaningBlock(meaning) {
  const block = document.createElement("div");
  block.className = "meaning-block";

  const pos = document.createElement("div");
  pos.className = "part-of-speech";
  pos.textContent = meaning.partOfSpeech || "unknown";
  block.appendChild(pos);

  const list = document.createElement("ol");
  list.className = "definitions-list";

  const defs = meaning.definitions || [];
  const visible = defs.slice(0, DEFS_VISIBLE_DEFAULT);
  const rest = defs.slice(DEFS_VISIBLE_DEFAULT);

  visible.forEach((def) => list.appendChild(createDefinitionItem(def)));

  if (rest.length > 0) {
    const hiddenWrap = document.createElement("li");
    hiddenWrap.className = "hidden-item";
    const groupId = `defs-${Math.random().toString(36).slice(2)}`;
    hiddenWrap.dataset.group = groupId;
    rest.forEach((def) => hiddenWrap.appendChild(createDefinitionItem(def)));
    list.appendChild(hiddenWrap);
    block.appendChild(list);

    const moreBtn = document.createElement("button");
    moreBtn.type = "button";
    moreBtn.className = "more-btn";
    moreBtn.dataset.action = "toggle";
    moreBtn.dataset.target = groupId;
    moreBtn.textContent = `show ${rest.length} more definition${rest.length > 1 ? "s" : ""}`;
    block.appendChild(moreBtn);
  } else {
    block.appendChild(list);
  }

  const meaningSyn = createTagGroup(
    meaning.synonyms,
    "synonym",
    `msyn-${Math.random().toString(36).slice(2)}`,
  );
  if (meaningSyn) block.appendChild(meaningSyn);

  const meaningAnt = createTagGroup(
    meaning.antonyms,
    "antonym",
    `mant-${Math.random().toString(36).slice(2)}`,
  );
  if (meaningAnt) block.appendChild(meaningAnt);

  return block;
}

function renderSources(entry) {
  sourceRowEle.innerHTML = "";
  if (!entry.sourceUrls || entry.sourceUrls.length === 0) return;

  sourceRowEle.appendChild(document.createTextNode("source \u00bb "));

  entry.sourceUrls.forEach((url, i) => {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    try {
      a.textContent = new URL(url).hostname;
    } catch {
      a.textContent = url;
    }
    sourceRowEle.appendChild(a);
    if (i < entry.sourceUrls.length - 1) {
      sourceRowEle.appendChild(document.createTextNode(", "));
    }
  });

  if (entry.license?.name) {
    sourceRowEle.appendChild(
      document.createTextNode(` (${entry.license.name})`),
    );
  }
}

async function fetchAPI(rawWord) {
  const word = rawWord.trim().toLowerCase();
  if (!word) return;

  inputEle.disabled = true;
  searchBtn.disabled = true;
  showLoading(word);

  try {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
    const response = await fetch(url);

    if (response.status === 404) {
      showStatus(
        `404 — no entry for "${word}"`,
        "try a different spelling, or another word",
        true,
      );
      return;
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const entry = data[0];

    titleEle.textContent = entry.word;
    phoneticEle.textContent =
      entry.phonetic || entry.phonetics?.find((p) => p.text)?.text || "";

    audioRowEle.innerHTML = "";
    const withAudio = (entry.phonetics || []).filter((p) => p.audio);
    withAudio.forEach((p, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.action = "play-audio";
      btn.dataset.src = p.audio.startsWith("http")
        ? p.audio
        : `https:${p.audio}`;
      btn.textContent = `\u25b6 ${guessAccentLabel(p.audio, i)}`;
      audioRowEle.appendChild(btn);
    });

    meaningsListEle.innerHTML = "";
    (entry.meanings || []).forEach((meaning) => {
      meaningsListEle.appendChild(createMeaningBlock(meaning));
    });

    renderSources(entry);

    idleLine.hidden = true;
    if (statusLineEle) {
      statusLineEle.remove();
      statusLineEle = null;
    }
    entryEle.hidden = false;
    outputPane.scrollTop = 0;

    addRecent(entry.word);
  } catch (err) {
    console.error("Fetch failed:", err.message);
    showStatus(
      "connection lost \u2014 dictionary service unreachable",
      "check your connection and try again",
      true,
    );
  } finally {
    inputEle.disabled = false;
    searchBtn.disabled = false;
  }
}

queryForm.addEventListener("submit", (e) => {
  e.preventDefault();
  fetchAPI(inputEle.value);
});

document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-action]");
  if (!el) return;

  const { action } = el.dataset;

  if (action === "lookup") {
    inputEle.value = el.dataset.word;
    fetchAPI(el.dataset.word);
  } else if (action === "play-audio") {
    audioPlayer.src = el.dataset.src;
    audioPlayer.play().catch(() => {
      showStatus("couldn't play that pronunciation", null, true);
    });
  } else if (action === "toggle") {
    const target = document.querySelector(
      `[data-group="${el.dataset.target}"]`,
    );
    if (target) {
      target.classList.remove("hidden-item");
      el.remove();
    }
  }
});

renderRecent();
showIdle();
