# Firefox Add-ons – Einreichung „Bahnkarte24“

Einreichen unter [addons.mozilla.org/developers](https://addons.mozilla.org/developers/) → „Neues Add-on einreichen“.
ZIP bauen: `node tools/build-extension.mjs` → `dist/bahnkarte24-<version>-firefox.zip`
Prüfen vor dem Hochladen: `npx web-ext lint -s dist/extension-firefox`

## Unterschiede zur Chrome-Fassung

Baut das Build-Skript automatisch, `extension/manifest.json` bleibt unverändert:

- `background.scripts` statt `service_worker` (Firefox hat in Manifest V3 eine Hintergrundseite).
- `host_permissions` mit denselben Seiten wie die Content-Scripts, damit Firefox sie bei der Installation erteilt.
- `browser_specific_settings.gecko.id` = `bahnkarte24@bahnkarte24.de`. **Nach der ersten Einreichung nie mehr ändern**, sonst ist es für Firefox ein anderes Add-on.
- Mindestversion Firefox 140 (Desktop) / 142 (Android), weil erst ab dort `data_collection_permissions` gilt.
- `data_collection_permissions: none`: Die Erweiterung überträgt nichts an uns oder Dritte, alles wird im Browser ausgewertet.

## Formular

**Wo verteilen:** „Auf dieser Website“ (öffentlich auf addons.mozilla.org).
**Plattformen:** Firefox und Firefox für Android.
**Quellcode einreichen?** Nein – der Code ist nicht minifiziert oder gebündelt.

**Name, Zusammenfassung, Beschreibung:** wie in [chrome-web-store.md](chrome-web-store.md). Die Zusammenfassung darf bis 250 Zeichen lang sein, die Kurzbeschreibung passt also.
**Kategorie:** Shopping (alternativ: Other) – eine Kategorie „Reisen“ gibt es nicht.
**Lizenz:** dieselbe wie im GitHub-Repository.
**Datenschutzerklärung:** https://bahnkarte24.de/datenschutz.html
**Homepage:** https://bahnkarte24.de
**Support:** https://github.com/xsebo99/Bahnkarte24/issues

**Hinweise für die Prüfer** (Feld „Notes to Reviewer“):
> Die Erweiterung liest nach Klick des Nutzers in einem selbst geöffneten bahn.de-Tab dessen BahnCard und vergangene Buchungen über die Schnittstellen, die bahn.de selbst für „Meine Reisen“ nutzt (Anmeldung durch den Nutzer nötig, wir haben kein Testkonto). Die Daten werden per Nachricht an die Seite bahnkarte24.de im selben Browser übergeben und dort lokal ausgewertet. Nichts wird an einen Server gesendet. Quellcode: https://github.com/xsebo99/Bahnkarte24

**Screenshots:** dieselben wie für Chrome (`store/screenshots/`).

## Neue Version veröffentlichen

1. `version` in `extension/manifest.json` erhöhen.
2. `node tools/build-extension.mjs`
3. Auf addons.mozilla.org unter „Neue Version hochladen“ die `-firefox.zip` einreichen.
