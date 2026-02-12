"use strict";

const DEFAULT_EMAIL = process.env.DEFAULT_EMAIL || "";
const API_KEY = process.env.ABSTRACT_API_KEY;

function parseJsonBody(rawBody) {
  if (!rawBody) return {};
  try {
    return JSON.parse(rawBody);
  } catch {
    return {};
  }
}

exports.handler = async (event) => {
  const method = event.httpMethod || "GET";
  if (method !== "GET" && method !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method not allowed." })
    };
  }

  const body = parseJsonBody(event.body);
  const bodyEmail = typeof body.email === "string" ? body.email : "";
  const queryEmail = typeof event.queryStringParameters?.email === "string" ? event.queryStringParameters.email : "";
  const email = (bodyEmail || queryEmail || DEFAULT_EMAIL).trim();

  if (!email) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Email is required in request body or DEFAULT_EMAIL env var." })
    };
  }

  if (!API_KEY) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Server is missing ABSTRACT_API_KEY." })
    };
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

      return {
        statusCode: response.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: `Abstract API error (${response.status}): ${upstreamMessage}`,
          upstream_status: response.status,
          upstream_status_text: response.statusText,
          upstream_body: data || rawBody || null
        })
      };
    }

    if (!data) {
      return {
        statusCode: 502,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Abstract API returned an invalid response body." })
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    };
  } catch {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Failed to reach Abstract API. Check network connectivity and try again."
      })
    };
  }
};
