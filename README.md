# NovaIT Telegram Bot Test Task

Simple Telegram bot built with Node-RED and RedBot.

## How to Run

1. Copy the environment example:

   ```bash
   cp .env.example .env
   ```

2. Start Node-RED with RedBot:

   ```bash
   docker compose up -d --build
   ```

3. Open the Node-RED editor:

   ```text
   http://localhost:1880
   ```

4. Create a Telegram bot with `@BotFather` and paste the token into the
   Telegram bot configuration in Node-RED. Do not commit real Telegram tokens.

5. View runtime logs:

   ```bash
   docker compose logs -f redbot
   ```

6. Stop the project:

   ```bash
   docker compose down
   ```

## Current Status

- Docker setup is ready.
- Node-RED runs on port `1880`.
- RedBot is installed in the Docker image.
- Telegram bot flow is implemented with polling.
- Main menu, about branch, calculator branch, and NBU exchange-rate branch are available.
- Exchange rates are loaded from the public NBU API:
  `https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json`.

## Architecture Notes

At first, the bot routing was built mostly with no-code RedBot node outputs:
inline buttons tracked user clicks and routed every branch through separate
visual connections. This worked for the first menu, but the flow quickly became
hard to read: too many wires, duplicated "back to menu" nodes, and unclear
state handling.

The current version keeps the user-facing screens in no-code RedBot nodes, but
moves routing decisions into one central `Route: incoming` Function node. Button
values such as `calc`, `rates`, `about`, and `menu` go through the same receiver
as normal Telegram messages, and the router decides which branch should handle
them. This keeps the canvas cleaner and makes the behavior easier to debug.
