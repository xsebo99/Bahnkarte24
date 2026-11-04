// Baut die Erweiterung für den Chrome Web Store und für Firefox (addons.mozilla.org).
// 1. kopiert core.js nach extension/core.js (damit Webseite und Erweiterung dieselbe Logik nutzen),
// 2. stellt in dist/extension und dist/extension-firefox die Store-Fassungen zusammen (ohne localhost-Adressen),
// 3. packt sie als dist/bahnkarte24-<version>.zip und dist/bahnkarte24-<version>-firefox.zip.
// Aufruf: node tools/build-extension.mjs   (mit --check nur prüfen, ob extension/core.js aktuell ist)
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const EXT = join(ROOT, 'extension');
const DIST = join(ROOT, 'dist');

// Feste ID für addons.mozilla.org – nach der ersten Einreichung nicht mehr ändern.
const GECKO_ID = 'bahnkarte24@bahnkarte24.de';

const core = readFileSync(join(ROOT, 'core.js'), 'utf8');
const extCorePath = join(EXT, 'core.js');
const aktuell = existsSync(extCorePath) && readFileSync(extCorePath, 'utf8') === core;
if (process.argv.includes('--check')) {
  console.log(aktuell ? 'extension/core.js ist aktuell.' : 'extension/core.js ist veraltet – node tools/build-extension.mjs ausführen.');
  process.exit(aktuell ? 0 : 1);
}
if (!aktuell) {
  writeFileSync(extCorePath, core);
  console.log('extension/core.js aktualisiert.');
}

const manifest = JSON.parse(readFileSync(join(EXT, 'manifest.json'), 'utf8'));
for (const cs of manifest.content_scripts) {
  cs.matches = cs.matches.filter((m) => !/^http:\/\/(localhost|127\.0\.0\.1)[:/]/.test(m));
}

// Firefox kennt in Manifest V3 keinen Service Worker, sondern eine Hintergrundseite (background.scripts).
// Die Seiten der Content-Scripts stehen zusätzlich in host_permissions, damit Firefox sie bei der Installation erteilt.
// data_collection_permissions: Die Erweiterung schickt nichts an uns oder Dritte – alles bleibt im Browser.
const firefox = {
  ...manifest,
  background: { scripts: ['background.js'] },
  host_permissions: [...new Set(manifest.content_scripts.flatMap((cs) => cs.matches))],
  browser_specific_settings: {
    gecko: { id: GECKO_ID, strict_min_version: '140.0', data_collection_permissions: { required: ['none'] } },
    gecko_android: { strict_min_version: '142.0' },
  },
};

rmSync(DIST, { recursive: true, force: true });

function bauen(ordner, mf, zipName) {
  const out = join(DIST, ordner);
  mkdirSync(out, { recursive: true });
  cpSync(EXT, out, { recursive: true });
  writeFileSync(join(out, 'manifest.json'), JSON.stringify(mf, null, 2) + '\n');

  const zip = join(DIST, zipName);
  if (process.platform === 'win32') {
    // Nicht Compress-Archive: Windows PowerShell 5.1 schreibt Backslashes in die Pfade, die der Web Store nicht findet.
    const tar = join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'tar.exe');
    execFileSync(tar, ['-a', '-c', '-f', zip, '*'], { cwd: out, stdio: 'inherit' });
  } else {
    execFileSync('zip', ['-qr', zip, '.'], { cwd: out, stdio: 'inherit' });
  }
  console.log('Fertig:', zip);
}

bauen('extension', manifest, `bahnkarte24-${manifest.version}.zip`);
bauen('extension-firefox', firefox, `bahnkarte24-${manifest.version}-firefox.zip`);
