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
2. Create/update `.env`:
   ```env
   ABSTRACT_API_KEY=your_key_here
   PORT=3000
   DEFAULT_EMAIL=example@domain.com
   ```
3. Start server:
   ```bash
   npm start
   ```
4. Open:
   - `http://localhost:3000/`

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
