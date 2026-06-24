const heightIn = document.getElementById("height");
const heightUnit = document.getElementById("heightUnit");
const feetInput = document.getElementById("feet");
const inchesInput = document.getElementById("inches");
const feetInchBox = document.getElementById("feetInch");
const weightIn = document.getElementById("weight");
const weightUnit = document.getElementById("weightUnit");
const bmiIn = document.getElementById("bmiOut");
const btn = document.getElementById("btn");
const weightCon = document.getElementById("weightCondition");
const healthyRange = document.getElementById("healthyRange");
const errorEl = document.getElementById("error");

function parseNumber(v) {
  if (v === null || v === undefined) return NaN;
  // Accept commas as decimal separators
  return parseFloat(String(v).trim().replace(",", "."));
}

function showError(msg) {
  errorEl.textContent = msg || "";
}

function getHeightMeters() {
  const unit = heightUnit.value;
  if (unit === "ft") {
    const ft = parseNumber(feetInput.value);
    const inch = parseNumber(inchesInput.value) || 0;
    if (isNaN(ft) || ft <= 0) return NaN;
    if (isNaN(inch) || inch < 0 || inch >= 12) return NaN;
    const totalInches = ft * 12 + inch;
    return totalInches * 0.0254;
  }

  const val = parseNumber(heightIn.value);
  if (isNaN(val) || val <= 0) return NaN;
  if (unit === "cm") return val / 100;
  if (unit === "m") return val;
  return NaN;
}

function getWeightKg() {
  const unit = weightUnit.value;
  const val = parseNumber(weightIn.value);
  if (isNaN(val) || val <= 0) return NaN;
  if (unit === "kg") return val;
  if (unit === "lb") return val * 0.45359237;
  return NaN;
}

function toDisplayWeight(kg, unit) {
  if (unit === "kg") return `${kg.toFixed(1)} kg`;
  if (unit === "lb") return `${(kg / 0.45359237).toFixed(1)} lb`;
  return `${kg.toFixed(1)} kg`;
}

function categoryForBMI(bmi) {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Healthy";
  if (bmi < 30) return "Overweight";
  if (bmi < 35) return "Obese (Class I)";
  if (bmi < 40) return "Obese (Class II)";
  return "Obese (Class III)";
}

function calculateBMI() {
  showError("");
  healthyRange.textContent = "";

  const h = getHeightMeters();
  const wKg = getWeightKg();

  if (isNaN(h) || h <= 0) {
    showError("Please enter a valid height in the selected unit.");
    return;
  }
  if (isNaN(wKg) || wKg <= 0) {
    showError("Please enter a valid weight in the selected unit.");
    return;
  }

  // Reasonable real-world bounds
  if (h < 0.5 || h > 2.7) {
    showError("Height out of typical human range (0.5m - 2.7m).");
    return;
  }
  if (wKg < 10 || wKg > 635) {
    showError("Weight out of typical human range (10kg - 635kg).");
    return;
  }

  const bmi = wKg / (h * h);
  const bmiRounded = Math.round(bmi * 10) / 10;
  bmiIn.value = bmiRounded.toFixed(1);

  weightCon.innerHTML = categoryForBMI(bmiRounded);

  // Healthy weight range for this height (BMI 18.5 - 24.9)
  const minKg = 18.5 * h * h;
  const maxKg = 24.9 * h * h;
  healthyRange.textContent = `${toDisplayWeight(minKg, weightUnit.value)} — ${toDisplayWeight(maxKg, weightUnit.value)}`;
}

// UI helpers
heightUnit.addEventListener("change", () => {
  if (heightUnit.value === "ft") {
    feetInchBox.classList.remove("hidden");
    heightIn.classList.add("hidden");
  } else {
    feetInchBox.classList.add("hidden");
    heightIn.classList.remove("hidden");
  }
});

// Support pressing Enter to compute
["height", "weight", "feet", "inches"].forEach((id) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter") calculateBMI();
  });
});

btn.addEventListener("click", calculateBMI);

// Initialize UI state
(function init() {
  if (heightUnit.value === "ft") {
    feetInchBox.classList.remove("hidden");
    heightIn.classList.add("hidden");
  } else {
    feetInchBox.classList.add("hidden");
    heightIn.classList.remove("hidden");
  }
})();
