const form = document.getElementById("emailForm");
const emailInput = document.getElementById("username");
const resultContainer = document.getElementById("resultcont");
const submitButton = document.getElementById("btn");

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderError(message) {
  resultContainer.innerHTML = `<p class="error">${escapeHtml(message)}</p>`;
}

function toTitleCase(text) {
  return text
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatPrimitive(value) {
  if (typeof value === "boolean") {
    return `<span class="${value ? "pill-ok" : "pill-no"}">${value ? "Yes" : "No"}</span>`;
  }

  if (typeof value === "number") {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }

  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  return escapeHtml(String(value));
}

function flattenObject(obj, prefix = "", map = {}) {
  Object.entries(obj || {}).forEach(([key, value]) => {
    const currentKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      flattenObject(value, currentKey, map);
      return;
    }
    map[currentKey] = value;
  });
  return map;
}

function firstValue(dataMap, keys) {
  for (const key of keys) {
    if (key in dataMap && dataMap[key] !== null && dataMap[key] !== undefined && dataMap[key] !== "") {
      return dataMap[key];
    }
  }
  return null;
}

function riskLevelClass(level) {
  const normalized = String(level || "").toLowerCase();
  if (["low", "safe", "good", "valid"].includes(normalized)) return "metric-ok";
  if (["medium", "moderate", "unknown"].includes(normalized)) return "metric-warn";
  return "metric-bad";
}

function renderSummary(data) {
  const map = flattenObject(data);
  const deliverability = firstValue(map, [
    "email_deliverability.status",
    "email_deliverability.deliverability",
    "email_deliverability.value"
  ]);
  const risk = firstValue(map, ["email_risk.level", "email_risk.risk", "email_risk.label"]);
  const disposable = firstValue(map, [
    "email_quality.is_disposable",
    "email_quality.disposable",
    "email_quality.is_disposable_email"
  ]);
  const freeProvider = firstValue(map, [
    "email_sender.is_free_provider",
    "email_sender.free_provider",
    "email_domain.is_free"
  ]);

  const cards = [
    {
      label: "Deliverability",
      value: deliverability || "Unknown",
      className: riskLevelClass(deliverability)
    },
    {
      label: "Risk",
      value: risk || "Unknown",
      className: riskLevelClass(risk)
    },
    {
      label: "Disposable",
      value: disposable === null ? "Unknown" : disposable ? "Yes" : "No",
      className: disposable === null ? "metric-warn" : disposable ? "metric-bad" : "metric-ok"
    },
    {
      label: "Free Provider",
      value: freeProvider === null ? "Unknown" : freeProvider ? "Yes" : "No",
      className: freeProvider === null ? "metric-warn" : "metric-ok"
    }
  ];

  return `
    <div class="summary-grid">
      ${cards
        .map(
          (card) => `
            <div class="summary-card">
              <p class="summary-label">${card.label}</p>
              <p class="summary-value ${card.className}">${escapeHtml(card.value)}</p>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderLoadingState() {
  resultContainer.innerHTML = `
    <div class="loading-grid">
      <div class="loading-block"></div>
      <div class="loading-block"></div>
      <div class="loading-block"></div>
    </div>
  `;
}

function renderRows(obj) {
  return Object.entries(obj)
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .map(([key, value]) => {
      if (typeof value === "object" && !Array.isArray(value)) {
        return `
          <div class="result-block">
            <div class="result-title">${toTitleCase(key)}</div>
            ${renderRows(value)}
          </div>
        `;
      }

      const displayValue = Array.isArray(value)
        ? value.length > 0
          ? escapeHtml(
              value
                .map((item) => (typeof item === "object" ? JSON.stringify(item) : String(item)))
                .join(", ")
            )
          : "N/A"
        : formatPrimitive(value);

      return `
        <div class="result-row">
          <div class="result-key">${toTitleCase(key)}</div>
          <div class="result-value">${displayValue}</div>
        </div>
      `;
    })
    .join("");
}

function renderResults(data) {
  const detailHtml = renderRows(data);
  const summaryHtml = renderSummary(data);
  resultContainer.innerHTML = `${summaryHtml}${detailHtml || "<p>No result fields returned.</p>"}`;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  resultContainer.innerHTML = "";

  const email = emailInput.value.trim();
  if (!email) {
    renderError("Please enter an email address.");
    return;
  }

  submitButton.disabled = true;
  submitButton.value = "Checking...";
  renderLoadingState();

  try {
    const res = await fetch("/api/validate-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });
    const data = await res.json();

    if (!res.ok || data.error) {
      renderError(data.error || "Validation request failed.");
      return;
    }

    renderResults(data);
  } catch (error) {
    renderError("Unable to reach server. Please try again.");
  } finally {
    submitButton.disabled = false;
    submitButton.value = "Validate";
  }
});
