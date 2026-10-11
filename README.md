# Pauls Physiklabor

Eine kleine Lernseite für alle, die ihr Wissen zu Wärme, Teilchen und Temperatur testen oder auffrischen möchten.

**[Übungstest öffnen](https://tobsent.github.io/pauls-physiklabor/)**

## Was die Seite bietet

- 24 Aufgaben zu sechs Themen: Wärmeübertragung, Zentralheizung, Aggregatzustände, Teilchen und Ausdehnung, Anomalie des Wassers und Thermometer.
- Eine kurze Runde mit acht Aufgaben sowie vier Aufgaben pro einzelnem Thema.
- Auswahlfragen, Mehrfachauswahl, Zuordnungen und eine Reihenfolgeaufgabe.
- Sofortige Rückmeldung, Erklärungen, freiwillige Tipps, Punkte und gezielte Wiederholung falscher Antworten.
- Sechs Merkkarten und pausierbare Runden.
- Bedienung auf Tablet, Smartphone und Computer.

Eine Anmeldung ist nicht erforderlich. Antworten und Lernfortschritt werden ausschließlich im jeweiligen Browser (`localStorage`) gespeichert und nicht an einen Server übertragen. Verschiedene Geräte oder Browser teilen keinen Lernfortschritt. Die Schriftarten können von Google Fonts geladen werden; bei fehlender Verbindung werden Systemschriften verwendet.

## Inhalt und Betrieb

Die Inhalte basieren auf einer Zusammenfassung von Physik-Arbeitsblättern. Einige vereinfachte Formulierungen sind präzisiert: Auch in Feststoffen schwingen Teilchen; beim Erwärmen werden die Teilchen selbst nicht größer; Eis schwimmt wegen seiner geringeren Dichte als Wasser.

Die Seite besteht aus statischem HTML, CSS und JavaScript. GitHub Pages veröffentlicht den Inhalt des Hauptverzeichnisses auf dem Branch `main`; `.nojekyll` verhindert eine Jekyll-Verarbeitung. Änderungen an diesem Branch werden automatisch veröffentlicht.

Für eine lokale Vorschau im Repository-Verzeichnis:

```sh
python3 -m http.server 8765
```

Danach `http://localhost:8765` öffnen. Es werden keine Abhängigkeiten und kein Build-Schritt benötigt.
