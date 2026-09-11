const themeButtons = document.querySelectorAll("[data-theme-choice]");
const root = document.documentElement;
const themeStorageKey = "team-showcase-theme";
const systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");

function getSavedTheme() {
  try {
    return localStorage.getItem(themeStorageKey) || "system";
  } catch {
    return "system";
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem(themeStorageKey, theme);
  } catch {}
}

function applyTheme(theme) {
  if (theme === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.dataset.theme = theme;
  }

  themeButtons.forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.themeChoice === theme),
    );
  });
}

function setTheme(theme) {
  saveTheme(theme);
  applyTheme(theme);
}

themeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setTheme(button.dataset.themeChoice);
  });
});

systemThemeQuery.addEventListener("change", () => {
  if (getSavedTheme() === "system") {
    applyTheme("system");
  }
});

applyTheme(getSavedTheme());
