# ENGAZ Lab V2 demo

This repository is a public synthetic, browser-local demonstration of a laboratory operations workflow. It is a static GitHub Pages site intended for review and presentation only.

- Every patient, phone number, order code, test, status, and amount is synthetic sample data.
- The demo has no API, server, database, analytics, or external integration; interactions run in the browser only.
- There is no persistence: reloading the page restores the built-in sample queue and no information is saved.
- Do not enter real patient or other sensitive information. The page displays a visible demo-only warning and retains `noindex, nofollow` robots metadata.

The custom Pages hostname is recorded in `CNAME`. The repository contains no deployment workflow; `validate.yml` performs read-only static safety checks.
