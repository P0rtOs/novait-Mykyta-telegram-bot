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

   `TELEGRAM_BOT_TOKEN` in `.env.example` is only a reminder for the setup
   process. RedBot does not automatically read the Telegram token from `.env`
   in this project; the token must be added through the Node-RED editor.

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
   committed to Git. The local credentials file is ignored by Git.

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
- Log format is centralized in `data/settings.js` via `formatLogEvent`.
- The Postman collection for the optional API check is stored in
  `postman/NBU_API.postman_collection.json`.
- Screenshots and video files for the final submission are duplicated in the
  `media/` folder.

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

The Docker setup uses a bind volume in `docker-compose.yml`:
`./data:/data`. Node-RED stores its editable flow files inside `/data` in the
container, so this volume connects the visual no-code editor with the local
repository files. When a flow is changed in the Node-RED UI and `Deploy` is
clicked, the local `data/flows.json` file is updated through that mounted
folder and can be committed to Git. Local runtime files and credentials are
ignored separately, so the repository keeps the flow structure without exposing
private bot credentials.

For logging, I used a small Winston-inspired structured logger instead of adding
the full Winston library. Winston is a strong general-purpose logging library,
and I used it as a reference point for the idea: consistent log levels, a shared
JSON structure, timestamps, step names, and contextual details. In this Node-RED
project, the formatter is centralized in `data/settings.js`, while Function
nodes pass events through it and write them with Node-RED's built-in
`node.log` / `node.warn` methods.

## Known Issues / Not Done

- Telegram credentials are not included in the repository by design. A new user
  must paste their own bot token in Node-RED after starting the project.
- The `.env` file is used for local runtime settings, but the Telegram token is
  configured through Node-RED credentials, not read automatically from `.env`.
- The bot is configured for local development with polling, not production
  webhooks.
- The Node-RED editor is intended for local use only and is not protected with
  `adminAuth` in this test setup.
- `npm audit` reports vulnerable transitive dependencies in the RedBot /
  `node-red-contrib-chatbot` dependency tree. The bot logic does not execute
  user calculator input as code, but the dependency stack should be reviewed
  before production use.
- Docker dependencies are not pinned tightly: the image uses
  `nodered/node-red:latest`, and RedBot is installed without a fixed version.
- `NODE_RED_CREDENTIAL_SECRET` has a local-development default. It should be
  changed to a strong stable value outside local testing.
- Screenshots or GIFs of the Telegram dialog are prepared separately for the
  final submission archive.

## Time Spent

Approximately 4-5 hours in total.

This was my first time building a Telegram bot and my first practical experience
with a no-code / visual flow tool like Node-RED. Because of that, roughly the
first hour was spent reading Node-RED and RedBot documentation and understanding
how to structure the bot as connected nodes.

The calculator branch took about 1.5 hours, mostly because I spent extra time on
validation, edge cases, and making the Function node readable. The NBU API
integration took about 30 minutes. The last hour was spent improving code
quality, adding a unified structured logger, cleaning up the flow, writing setup
instructions, and polishing the README.

## Checklist

Statuses: ✅ done | 🟨 partial | ❌ not done.

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
| Logs: successful scenario | ✅ done | Captured in `logs.md`. |
| Logs: invalid input | ✅ done | Captured in `logs.md`. |
| Logs: API failure | ✅ done | Captured in `logs.md` with a broken NBU URL. |
| README in English | ✅ done | This README contains setup instructions, status, notes, and checklist. |
