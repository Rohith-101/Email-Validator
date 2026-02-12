require("dotenv").config();
const path = require("path");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.ABSTRACT_API_KEY;
const DEFAULT_EMAIL = process.env.DEFAULT_EMAIL || "";

app.use(express.static(path.join(__dirname)));
app.use(express.json());
app.get("/favicon.ico", (req, res) => {
  res.redirect(301, "/favicon.svg");
});

async function validateEmailHandler(req, res) {
  const bodyEmail = typeof req.body?.email === "string" ? req.body.email : "";
  const queryEmail = typeof req.query?.email === "string" ? req.query.email : "";
  const email = (bodyEmail || queryEmail || DEFAULT_EMAIL).trim();

  if (!email) {
    return res.status(400).json({ error: "Email is required in request body or DEFAULT_EMAIL in .env." });
  }

  if (!API_KEY) {
    return res.status(500).json({ error: "Server is missing ABSTRACT_API_KEY." });
  }

  try {
    const url = new URL("https://emailreputation.abstractapi.com/v1/");
    url.searchParams.set("api_key", API_KEY);
    url.searchParams.set("email", email);

    const response = await fetch(url);
    const rawBody = await response.text();

    let data = null;
    try {
      data = rawBody ? JSON.parse(rawBody) : null;
    } catch {
      data = null;
    }

    if (!response.ok) {
      const upstreamMessage =
        (data && (data.error?.message || data.error_message || data.message || data.error)) ||
        response.statusText ||
        "Unknown upstream error";

      return res.status(response.status).json({
        error: `Abstract API error (${response.status}): ${upstreamMessage}`,
        upstream_status: response.status,
        upstream_status_text: response.statusText,
        upstream_body: data || rawBody || null
      });
    }

    if (!data) {
      return res.status(502).json({ error: "Abstract API returned an invalid response body." });
    }

    return res.json(data);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to reach Abstract API. Check your internet connection and try again."
    });
  }
}

app.get("/api/validate-email", validateEmailHandler);
app.post("/api/validate-email", validateEmailHandler);

app.listen(PORT, () => {
  console.log(`Email Validator running at http://localhost:${PORT}`);
});
