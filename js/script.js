const form = document.getElementById("validator-form");
const emailInput = document.getElementById("email-input");
const resultContainer = document.getElementById("resultcont");
const statusBadge = document.getElementById("status-badge");

const disposableDomains = new Set([
  "mailinator.com",
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "yopmail.com"
]);

const roleBasedPrefixes = new Set([
  "admin",
  "contact",
  "help",
  "info",
  "noreply",
  "sales",
  "support"
]);

function updateStatusBadge(text, type) {
  statusBadge.className = `status-badge ${type}`;
  statusBadge.textContent = text;
}

function createCard(title, value, tone) {
  return `
    <article class="result-card ${tone}">
      <h3>${title}</h3>
      <p>${value}</p>
    </article>
  `;
}

function validateEmailQuality(rawEmail) {
  const email = rawEmail.trim().toLowerCase();
  const response = {
    email,
    isEmpty: email.length === 0,
    hasAtSymbol: email.includes("@"),
    syntaxValid: false,
    domain: "",
    localPart: "",
    hasValidLength: email.length > 5 && email.length <= 254,
    hasConsecutiveDots: email.includes(".."),
    isDisposable: false,
    isRoleBased: false,
    hasTld: false,
    score: 0
  };

  if (response.hasAtSymbol) {
    const parts = email.split("@");
    if (parts.length === 2) {
      [response.localPart, response.domain] = parts;
    }
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
  response.syntaxValid = emailRegex.test(email);

  response.hasTld = response.domain.includes(".") && !response.domain.endsWith(".");
  response.isDisposable = disposableDomains.has(response.domain);
  response.isRoleBased = roleBasedPrefixes.has(response.localPart);

  let score = 0;
  if (response.hasValidLength) score += 20;
  if (response.syntaxValid) score += 35;
  if (!response.hasConsecutiveDots) score += 15;
  if (response.hasTld) score += 10;
  if (!response.isDisposable) score += 10;
  if (!response.isRoleBased) score += 10;
  response.score = Math.max(0, Math.min(score, 100));

  return response;
}

function renderResults(result) {
  if (result.isEmpty) {
    updateStatusBadge("Input required", "error");
    resultContainer.innerHTML = `
      <article class="result-card bad">
        <h3>Email Missing</h3>
        <p>Enter an email address to begin validation.</p>
      </article>
    `;
    return;
  }

  const verdictText =
    result.score >= 80
      ? "Strong email quality"
      : result.score >= 55
        ? "Moderate quality"
        : "Low quality";

  const verdictType =
    result.score >= 80 ? "success" : result.score >= 55 ? "warning" : "error";

  updateStatusBadge(`${verdictText} (${result.score}/100)`, verdictType);

  resultContainer.innerHTML = [
    createCard(
      "Format",
      result.syntaxValid ? "Valid standard format" : "Invalid format",
      result.syntaxValid ? "good" : "bad"
    ),
    createCard(
      "Length",
      result.hasValidLength ? "Within recommended limits" : "Too short or too long",
      result.hasValidLength ? "good" : "bad"
    ),
    createCard(
      "Domain",
      result.domain || "Not detected",
      result.domain ? "good" : "bad"
    ),
    createCard(
      "Top-Level Domain",
      result.hasTld ? "Detected and valid" : "Missing or malformed",
      result.hasTld ? "good" : "bad"
    ),
    createCard(
      "Disposable Domain",
      result.isDisposable ? "Yes, temporary provider detected" : "No disposable provider detected",
      result.isDisposable ? "warn" : "good"
    ),
    createCard(
      "Role-Based Account",
      result.isRoleBased ? "Role account (e.g., support@)" : "Personal-style account",
      result.isRoleBased ? "warn" : "good"
    ),
    createCard(
      "Consecutive Dots",
      result.hasConsecutiveDots ? "Found consecutive dots" : "No consecutive dots",
      result.hasConsecutiveDots ? "bad" : "good"
    ),
    createCard(
      "Recommendation",
      result.score >= 80
        ? "Ready for sign-up or contact forms."
        : "Review address and improve format quality.",
      result.score >= 80 ? "good" : "warn"
    ),
    createCard("Normalized Email", result.email, "good")
  ].join("");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const validationResult = validateEmailQuality(emailInput.value);
  renderResults(validationResult);
});



















