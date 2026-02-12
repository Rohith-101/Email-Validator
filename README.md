# Email Validator

A polished email reputation checker powered by Abstract API.

## Features

- Responsive, professional UI
- Server-side API key handling (`.env`)
- Email reputation check via Abstract API
- Structured result rendering for nested API data
- Summary insights for deliverability, risk, disposable, and provider type

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env` from the template:
   ```bash
   cp .env.example .env
   ```
3. Update `.env` with your credentials:
   ```env
   ABSTRACT_API_KEY=your_abstract_api_key
   PORT=3000
   DEFAULT_EMAIL=example@domain.com
   ```
4. Start server:
   ```bash
   npm start
   ```
5. Open:
   - `http://localhost:3000/`

**Note:** Never commit `.env` to version control. The `.env.example` file shows the required variables.

## Netlify Deployment

- The frontend calls `POST /api/validate-email`.
- In Netlify, this path is handled by `netlify/functions/validate-email.js` via `netlify.toml` redirect.
- Set `ABSTRACT_API_KEY` (and optional `DEFAULT_EMAIL`) in Netlify environment variables.

## API Route

- `POST /api/validate-email` with JSON body:
  ```json
  { "email": "name@example.com" }
  ```
- `GET /api/validate-email?email=name@example.com` (compat route)

## Project Structure

- `server.js` - Express server and API proxy
- `index.html` - App markup
- `css/style.css` - Styles
- `js/script.js` - Client logic
