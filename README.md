# homepage – berndmarnau.de

Persönliche Landingpage von Bernd Marnau (Lanzerath, Eifel). Leitbild: *„Ich war gerade bei jemandem zu Besuch.“* Einladend, warmherzig-verspielt, keine Marketingseite.

- Reines HTML5/CSS, **kein JavaScript**, keine Cookies, keine Drittanbieter-Anfragen
- Blaue Farbwelt, lokale Schriften (OFL)
- Git ist die Single Source of Truth; dieses Repository enthält nur freigegebene Inhalte

## Struktur

| Pfad | Zweck |
|---|---|
| `index.html`, `impressum.html`, `datenschutz.html` | Seiten (Impressum und Datenschutz) |
| `css/`, `fonts/`, `bilder/` | Gestaltung, lokale Schriften, Bilder |
| `yogaundgong/` | Rückblickseite „Yoga und Gong am See“ (eigene Seiten, Impressum, Datenschutz, Bilder) |
| `docs/` | Anforderungen, Entscheidungen (ADR), Architektur (ADF), Technik (TDF), Tonalität, Datenschutzkonzept |
| `data/inhalte.yaml` | Freigegebene Inhalte (nur `publish: true`) |
| `deploy-manifest.yaml` | Liste der Pfade, die hochgeladen werden dürfen |
| `tests/check.mjs` | Abhängigkeitsfreie Prüfungen |

## Prüfen

```sh
npm test               # Struktur, externe Ressourcen, Skripte, Kontrast, Tonalität
npm run release-check  # zusätzlich: schlägt fehl, solange Platzhalter [...] oder ENTWURF-Hinweise vorhanden sind
```

## Veröffentlichen (manuell)

Nur Pfade aus `deploy-manifest.yaml` hochladen. Auf dem Server liegen `/relingit/` und `/kundalinieifel/`; diese dürfen **nicht** überschrieben oder gelöscht werden. `/yogaundgong/` wird aus diesem Repository gepflegt (Ordner `yogaundgong/`) und beim Upload durch die bereinigte Fassung ersetzt. Danach die drei Pfade per Aufruf prüfen. Das Verwaltungs-Panel des Hosters wird nie verlinkt.

## Zwei-Repo-Konzept

Öffentlich: dieses Repository (nur Freigegebenes, Git-Historie ist dauerhaft). Privat: `homepage-sammlung` (Profil, Ideen, Freigaben, Rechte-Notizen, Originalkopien).

## Lizenz

Code: MIT (`LICENSE`). Texte und Bilder: alle Rechte vorbehalten (`NOTICE`). Schriften: SIL OFL 1.1.
