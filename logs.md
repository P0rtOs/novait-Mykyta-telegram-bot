# Diagnostic Logs

This file contains cleaned log fragments from local Telegram bot runs. Duplicate
lines and Node-RED startup messages were removed so each scenario shows only the
relevant structured bot events.

## Scenario 1: Successful Calculation

How to reproduce: open the calculator branch and send `1+2`.

```text
16 Sep 16:10:02 - [info] [function:Route: incoming] {"ts":"2026-09-16T13:10:02.507Z","level":"info","chatId":"806318742","step":"router:calculator_input","scope":"router","event":"calculator_input","details":{"content":"1+2","mode":"calculator"}}
16 Sep 16:10:02 - [info] [function:Calc: parse and calculate] {"ts":"2026-09-16T13:10:02.508Z","level":"info","chatId":"806318742","step":"calc:input_received","scope":"calc","event":"input_received","details":{"input":"1+2","inputLength":3,"config":{"maxInputLength":50,"maxAbsValue":1000000,"decimalPlaces":10}}}
16 Sep 16:10:02 - [info] [function:Calc: parse and calculate] {"ts":"2026-09-16T13:10:02.508Z","level":"info","chatId":"806318742","step":"calc:calculation_succeeded","scope":"calc","event":"calculation_succeeded","details":{"expression":"1+2","result":"3"}}
```

The router detected that the user was in calculator mode and passed the message
to the calculator function. The `calc:calculation_succeeded` line proves that
the expression was parsed and calculated successfully. The user saw the
calculator result message with `3`.

This is the captured analog of the required `12 + 7` successful-calculation
scenario. It goes through the same route, parse, calculate, and success-response
path.

## Scenario 2: Invalid Calculator Input

How to reproduce: open the calculator branch and send text instead of a valid
math expression, for example `порахуй`.

```text
16 Sep 16:10:16 - [info] [function:Route: incoming] {"ts":"2026-09-16T13:10:16.625Z","level":"info","chatId":"806318742","step":"router:calculator_input","scope":"router","event":"calculator_input","details":{"content":"порахуй","mode":"calculator"}}
16 Sep 16:10:16 - [info] [function:Calc: parse and calculate] {"ts":"2026-09-16T13:10:16.625Z","level":"info","chatId":"806318742","step":"calc:input_received","scope":"calc","event":"input_received","details":{"input":"порахуй","inputLength":7,"config":{"maxInputLength":50,"maxAbsValue":1000000,"decimalPlaces":10}}}
16 Sep 16:10:16 - [warn] [function:Calc: parse and calculate] {"ts":"2026-09-16T13:10:16.625Z","level":"warn","chatId":"806318742","step":"calc:validation_failed","scope":"calc","event":"validation_failed","details":{"reason":"invalidFormat"}}
```

The router still forwarded the message to the calculator because the user was
inside the calculator branch. The `calc:validation_failed` line with
`reason:"invalidFormat"` shows that the function rejected the non-numeric input.
The user saw a friendly validation message instead of a technical error or an
empty response.

Additional validation example from the same run:

```text
16 Sep 16:10:08 - [warn] [function:Calc: parse and calculate] {"ts":"2026-09-16T13:10:08.280Z","level":"warn","chatId":"806318742","step":"calc:validation_failed","scope":"calc","event":"validation_failed","details":{"reason":"numberTooLarge","left":3.213123123123123e+45,"right":1}}
```

This line shows the protection against unreasonably large numbers. The user saw
the calculator validation message about too large values.

This is the captured analog of the required `abc` invalid-input scenario. It
uses a text value that cannot be parsed as a calculator expression and therefore
triggers the same `invalidFormat` validation path.

## Scenario 3: NBU Exchange Rates Success

How to reproduce: open the main menu and click `Exchange rates`.

```text
16 Sep 16:10:33 - [info] [function:Route: incoming] {"ts":"2026-09-16T13:10:33.327Z","level":"info","chatId":"806318742","step":"router:rates","scope":"router","event":"rates","details":{"content":"rates","mode":null}}
16 Sep 16:10:33 - [info] [function:Rates: prepare NBU request] {"ts":"2026-09-16T13:10:33.328Z","level":"info","chatId":"806318742","step":"nbu:request_sent","scope":"nbu","event":"request_sent","details":{"url":"https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json"}}
16 Sep 16:10:33 - [info] [function:Rates: parse NBU response] {"ts":"2026-09-16T13:10:33.431Z","level":"info","chatId":"806318742","step":"nbu:response_received","scope":"nbu","event":"response_received","details":{"statusCode":200,"payloadType":"array"}}
16 Sep 16:10:33 - [info] [function:Rates: parse NBU response] {"ts":"2026-09-16T13:10:33.431Z","level":"info","chatId":"806318742","step":"nbu:rates_parsed","scope":"nbu","event":"rates_parsed","details":{"currencies":[{"cc":"USD","rate":44.6021,"exchangedate":"17.09.2026"},{"cc":"EUR","rate":51.449,"exchangedate":"17.09.2026"}]}}
```

The router selected the exchange-rate branch and the bot sent a request to the
public NBU API. The `nbu:response_received` and `nbu:rates_parsed` lines show a
successful HTTP response and successful extraction of USD and EUR. The user saw
a readable exchange-rate message with rates and date.

## Scenario 4: External API Failure

How to reproduce: temporarily set `NBU_EXCHANGE_RATES_URL` to a broken URL in
`.env`, restart the container, and click `Exchange rates`.

```text
16 Sep 16:20:14 - [info] [function:Route: incoming] {"ts":"2026-09-16T13:20:14.790Z","level":"info","chatId":"806318742","step":"router:rates","scope":"router","event":"rates","details":{"content":"rates","mode":null}}
16 Sep 16:20:14 - [info] [function:Rates: prepare NBU request] {"ts":"2026-09-16T13:20:14.791Z","level":"info","chatId":"806318742","step":"nbu:request_sent","scope":"nbu","event":"request_sent","details":{"url":"https://bank.gov.uaAAA/NBUStatService/v1/statdirectory/exchange?json"}}
16 Sep 16:20:14 - [error] [http request:HTTP: NBU rates] RequestError: getaddrinfo ENOTFOUND bank.gov.uaaaa
16 Sep 16:20:14 - [info] [function:Rates: parse NBU response] {"ts":"2026-09-16T13:20:14.858Z","level":"info","chatId":"806318742","step":"nbu:response_received","scope":"nbu","event":"response_received","details":{"statusCode":"ENOTFOUND","payloadType":"string"}}
16 Sep 16:20:14 - [warn] [function:Rates: parse NBU response] {"ts":"2026-09-16T13:20:14.858Z","level":"warn","chatId":"806318742","step":"nbu:error","scope":"nbu","event":"error","details":{"reason":"bad_status","statusCode":"ENOTFOUND"}}
```

The router selected the exchange-rate branch, but the configured API URL pointed
to an invalid host: `bank.gov.uaAAA`. The HTTP node logged `ENOTFOUND`, then the
parser produced the structured `nbu:error` log with `reason:"bad_status"`. The
user saw the friendly NBU failure message instead of raw technical text.
