const billingToggle = document.querySelector("#billing-toggle");
const cards = document.querySelectorAll(".card[data-monthly]");
const selectionMessage = document.querySelector("#selection-message");
const pricingView = document.querySelector("#pricing-view");
const thankYouView = document.querySelector("#thank-you");
const selectedPlan = document.querySelector("#selected-plan");
const backToPlans = document.querySelector("#back-to-plans");

function updatePrices() {
  const billingPeriod = billingToggle.checked ? "yearly" : "monthly";

  cards.forEach((card) => {
    const amount = card.querySelector(".amount");
    const period = card.querySelector(".period");

    amount.textContent = card.dataset[billingPeriod];
    period.textContent =
      billingPeriod === "yearly" ? "/month, billed yearly" : "/month";
  });
}

billingToggle.addEventListener("change", updatePrices);

cards.forEach((card) => {
  card.querySelector(".btn").addEventListener("click", () => {
    cards.forEach((currentCard) => currentCard.classList.remove("selected"));
    card.classList.add("selected");
    selectedPlan.textContent = `${card.dataset.plan} plan`;
    pricingView.hidden = true;
    thankYouView.hidden = false;
    backToPlans.focus();
  });
});

backToPlans.addEventListener("click", () => {
  thankYouView.hidden = true;
  pricingView.hidden = false;
  pricingView.querySelector(".selected .btn")?.focus();
});
