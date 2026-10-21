// Abhängigkeitsfreie Strukturprüfung (REQ-001, REQ-025, REQ-034, REQ-036, REQ-037).
// Aufruf: node tests/check.mjs [--release]
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, extname, relative } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const release = process.argv.includes("--release");
const fehler = [];
const fail = (msg) => fehler.push(msg);

function alleDateien(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if ([".git", "node_modules"].includes(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) alleDateien(p, out);
    else out.push(p);
  }
  return out;
}
const dateien = alleDateien(root);
const rel = (p) => relative(root, p);
const lies = (p) => readFileSync(p, "utf8");

// 1) Pflichtdateien aus dem Deploy-Manifest
const manifest = lies(join(root, "deploy-manifest.yaml"));
const upload = manifest
  .split("nicht_hochladen:")[0]
  .split("\n")
  .filter((l) => /^\s+-\s+\S/.test(l))
  .map((l) => l.replace(/^\s+-\s+/, "").trim());
for (const eintrag of upload) {
  if (!existsSync(join(root, eintrag))) fail(`Deploy-Manifest: "${eintrag}" fehlt`);
}

// 2) Verbotene Dateitypen
for (const p of dateien) {
  const name = rel(p);
  if (extname(name) === ".docx" || /(^|\/)\.env(\.|$)/.test(name)) {
    fail(`Verbotene Datei im Repository: ${name}`);
  }
}

// 3) HTML: keine Skripte, keine externen Ressourcen, Fußzeilen-Links
const htmlDateien = dateien.filter((p) => extname(p) === ".html");
for (const p of htmlDateien) {
  const t = lies(p);
  const n = rel(p);
  if (/<script\b/i.test(t)) fail(`${n}: <script> ist nicht erlaubt (REQ-001)`);
  if (/\son[a-z]+\s*=/i.test(t)) fail(`${n}: Inline-Event-Handler nicht erlaubt`);
  if (/<(img|iframe|source|video|audio|embed|object)\b[^>]*\ssrc\s*=\s*["']?(https?:)?\/\//i.test(t))
    fail(`${n}: externe Ressource per src (REQ-034)`);
  if (/<link\b[^>]*\shref\s*=\s*["']?(https?:)?\/\//i.test(t))
    fail(`${n}: externes <link> (REQ-034)`);
  if (!/href="impressum\.html"/.test(t) || !/href="datenschutz\.html"/.test(t))
    fail(`${n}: Links zu Impressum und Datenschutz fehlen in der Fußzeile`);
  if (!/<html lang="de">/.test(t)) fail(`${n}: lang="de" fehlt`);
}

// 4) CSS: keine externen URLs
for (const p of dateien.filter((f) => extname(f) === ".css")) {
  const t = lies(p);
  if (/url\(\s*["']?(https?:)?\/\//i.test(t) || /@import/i.test(t))
    fail(`${rel(p)}: externe Ressource oder @import (REQ-034)`);
}

// 5) Negativliste der Tonalität (nur sichtbarer Text der Startseite)
const negativ = ["Lösung", "Mehrwert", "ganzheitlich", "innovativ", "maßgeschneidert", "jetzt buchen", "nur für kurze Zeit", "Synergie", "Ihre Zufriedenheit"];
const start = lies(join(root, "index.html")).replace(/<[^>]+>/g, " ");
for (const w of negativ) {
  if (start.toLowerCase().includes(w.toLowerCase())) fail(`index.html: Wort aus Negativliste: "${w}"`);
}

// 6) Kontrast (WCAG AA, 4.5:1) für die verwendeten Paare
const tokens = lies(join(root, "css/tokens.css"));
const farbe = (name) => {
  const m = tokens.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) { fail(`Token --${name} fehlt`); return "#000000"; }
  return m[1];
};
const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const kontrast = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};
const paare = [
  ["blau-900", "weiss"], ["blau-900", "blau-50"], ["blau-800", "weiss"],
  ["blau-800", "blau-50"], ["blau-800", "blau-100"], ["blau-700", "weiss"],
  ["blau-700", "blau-50"], ["blau-700", "blau-100"], ["weiss", "blau-700"],
  ["weiss", "blau-900"], ["blau-100", "blau-900"], ["blau-100", "blau-700"],
  ["blau-200", "blau-700"],
];
for (const [vg, hg] of paare) {
  const k = kontrast(farbe(vg), farbe(hg));
  if (k < 4.5) fail(`Kontrast ${vg} auf ${hg} nur ${k.toFixed(2)}:1 (< 4.5:1)`);
}

// 7) Freigabe-Prüfung: keine Platzhalter mehr
if (release) {
  for (const p of htmlDateien) {
    const m = lies(p).match(/\[[^\]]*(folgt|Platzhalter|TODO)[^\]]*\]|ENTWURF/gi);
    if (m) fail(`${rel(p)}: offene Platzhalter (${[...new Set(m)].join(", ")})`);
  }
}

if (fehler.length) {
  console.error(`✗ ${fehler.length} Fehler:\n- ` + fehler.join("\n- "));
  process.exit(1);
}
console.log(`✓ Alle Prüfungen bestanden${release ? " (Freigabe-Modus)" : ""}.`);
