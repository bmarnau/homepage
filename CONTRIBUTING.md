# Arbeitsweise

1. Änderungen immer auf einem Feature-Branch, Übernahme per Pull Request; `main` nur nach Freigabe.
2. Vor jedem Commit `npm test` ausführen.
3. Nur Freigegebenes committen. Keine privaten Daten, keine Namen Dritter ohne Einwilligung, keine Zugangsdaten. Die Git-Historie ist dauerhaft.
4. Neue Anforderungen in `docs/requirements.yaml` mit Modalverb („muss“/„sollte“) und prüfbarem Kriterium; Entscheidungen als ADR in `docs/adr/`.
5. Tonalität nach `docs/tonalitaet.yaml` einhalten.
6. Commit-Nachrichten: kurze Zusammenfassung im Imperativ, bei Bedarf Begründung im Textkörper.
