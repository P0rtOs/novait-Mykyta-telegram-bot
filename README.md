# NovaIT Telegram Bot Test Task

Simple Telegram bot built with Node-RED, RedBot, and Docker.

## How to Run

### Prerequisites

- Docker Desktop
- Git
- Telegram bot token from `@BotFather`

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/P0rtOs/novait-Mykyta-telegram-bot.git
   cd novait-Mykyta-telegram-bot
   ```

2. Create a local environment file:

   ```bash
   cp .env.example .env
   ```

   On Windows PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

   Keep `NODE_RED_CREDENTIAL_SECRET` stable after saving Node-RED credentials.
   If this value changes later, Node-RED may not be able to decrypt the saved
   Telegram bot token.

3. Start the project:

   ```bash
   docker compose up -d --build
   ```

4. Open the Node-RED editor:

   ```text
   http://localhost:1880
   ```

5. Add the Telegram token:

   - Open the `NovaIT Telegram Bot` flow.
   - Open either `Telegram: receive` or `Telegram: send`.
   - Edit the shared Telegram bot configuration.
   - Paste the token from `@BotFather`.
   - Click `Done`, then `Deploy`.

   The token is stored in local Node-RED credentials and is intentionally not
   committed to Git.

6. Test the bot in Telegram:

   ```text
   /start
   ```

7. View runtime logs:

   ```bash
   docker compose logs -f redbot
   ```

8. Stop the project:

   ```bash
   docker compose down
   ```

## What's Implemented

- RedBot runs in Docker on port `1880`.
- Telegram bot works in polling mode.
- Main menu with inline buttons:
  - Calculator
  - Exchange rates
  - About bot
- Back navigation with `Back` button and `/menu`.
- `/start` returns the user to the main menu.
- Fallback for unknown input returns the user to the menu.
- Calculator is implemented in a JavaScript Function node.
- Calculator validation covers invalid format, division by zero, empty input,
  multiline input, too long input, and too large numbers.
- Exchange rates are loaded from the public NBU API:
  `https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json`.
- USD and EUR rates are parsed from JSON and shown as readable text.
- NBU API errors and invalid responses are handled with a friendly user message.
- Structured logs are written for router, calculator, and exchange-rate steps.

## Architecture Notes

At first, the bot routing was built mostly with no-code RedBot node outputs:
inline buttons tracked user clicks and routed every branch through separate
visual connections. This worked for the first menu, but the flow quickly became
hard to read: too many wires, duplicated "back to menu" nodes, and unclear
state handling.

The current version keeps user-facing screens in no-code RedBot nodes, but moves
routing decisions into one central `Route: incoming` Function node. Button values
such as `calc`, `rates`, `about`, and `menu` go through the same receiver as
normal Telegram messages, and the router decides which branch should handle them.
This keeps the canvas cleaner and makes the behavior easier to debug.

## Known Issues / Not Done

- Telegram credentials are not included in the repository by design. A new user
  must paste their own bot token in Node-RED after starting the project.
- The bot is configured for local development with polling, not production
  webhooks.
- Screenshots or GIFs of the Telegram dialog are not included yet.
- `logs.md` with the three required diagnostic scenarios should be captured from
  a local run before final submission.

## Time Spent

Approximately 4-5 hours for Docker setup, Node-RED flow implementation,
debugging, API integration, logging, documentation, and GitHub setup.

## Checklist

Statuses: ✅ done · 🟨 partial · ❌ not done.

| Item | Status | Comment |
| --- | --- | --- |
| RedBot deployed, bot responds to `/start` | ✅ done | Runs in Docker, Telegram polling is configured locally. |
| Menu with 3 items and Back button | ✅ done | Calculator, exchange rates, about bot, and Back are implemented. |
| Fallback for unknown input | ✅ done | Unknown input is routed back to the main menu. |
| Calculator calculates correctly | ✅ done | Implemented in `Calc: parse and calculate` Function node. |
| Validation: non-numeric value | ✅ done | Invalid format returns a user-friendly message. |
| Validation: division by zero | ✅ done | Division by zero is blocked. |
| Validation: empty / too long input | ✅ done | Empty, multiline, too long, and too large values are handled. |
| NBU exchange rates API | ✅ done | Uses the public NBU JSON endpoint. |
| API unavailability handling | ✅ done | Bad status or invalid payload returns a friendly fallback message. |
| Logs: successful scenario | 🟨 partial | Structured logs are implemented; final `logs.md` still needs captured snippets. |
| Logs: invalid input | 🟨 partial | Structured logs are implemented; final `logs.md` still needs captured snippets. |
| Logs: API failure | 🟨 partial | Error handling is implemented; final `logs.md` still needs a forced-failure snippet. |
| README in English | ✅ done | This README contains setup instructions, status, notes, and checklist. |
