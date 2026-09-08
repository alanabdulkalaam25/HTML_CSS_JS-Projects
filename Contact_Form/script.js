const formContainer = document.querySelector(".form-container");
const originalFormContent = formContainer.innerHTML;

function handleSubmit(event) {
  event.preventDefault();

  formContainer.innerHTML = `
		<div class="success-message" role="status" aria-live="polite">
			<div class="success-icon">
				<i class="fas fa-check"></i>
			</div>
			<h1>Message Sent!</h1>
			<p>Thank you for reaching out. We'll get back to you soon.</p>
			<button type="button" class="submit-another-button">
				<span>Submit Another Form</span>
				<i class="fas fa-rotate-right"></i>
			</button>
		</div>
	`;

  formContainer
    .querySelector(".submit-another-button")
    .addEventListener("click", () => {
      formContainer.innerHTML = originalFormContent;
      formContainer
        .querySelector("form")
        .addEventListener("submit", handleSubmit);
    });
}

formContainer.querySelector("form").addEventListener("submit", handleSubmit);
