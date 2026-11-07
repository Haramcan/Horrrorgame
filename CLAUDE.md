# DESTUR – Projektübergabe (aus dem Chat in Claude Code)

Dieses Dokument fasst alles zusammen, was im Chat geklärt und gebaut wurde. Lies es zuerst.

## Über den Nutzer
- Schreibt Deutsch, ist technisch Einsteiger. Anleitungen immer in kleinen, nummerierten Schritten, mit den deutschen Windows-/Blender-Bezeichnungen.
- Hardware: Windows-PC, AMD Radeon RX 9070 XT, Ryzen 7 5700X3D (AM4). Zwei Bildschirme: nur auf **Bildschirm 1** (Chrome) arbeiten, der hochkant stehende linke Bildschirm bleibt tabu.
- Blender 5.2.3 LTS ist installiert, das Blender-MCP-Addon ("MCP for Blender", Addon 1.8) ist verbunden. `uv` ist installiert. Der MCP-Server `blender` steht in `claude_desktop_config.json` (`uvx mcp-for-blender`).
- Er will am Ende ein richtiges Indie-Horror-Storygame (ca. 2,5–3 h Spielzeit) und Schritt für Schritt Spielbares sehen.

## Entscheidungen
- **Engine: three.js im Browser (nicht Unreal Engine).** Das PDF erwähnt UE5-Tipps, die sind gestrichen.
- Grafik über Blender (Modelle als .glb), Look eher stilisiert/Low-Poly (PS1-Retro denkbar), PC mit Maus und Tastatur.
- Alles in Phasen: 0 Konzept, 1 Mechanik-Prototyp, 2 Vertical Slice (ein Gebiet mit echtem Look), 3 Welt, 4 Story/Content, 5 Audio/Feinschliff, 6 Test/Balancing. Nach jeder Phase etwas Spielbares.

## Story (Kurzfassung, Details: `Horrorspielstory.pdf` und `Story_OCR_roh.txt`)
Titel **DESTUR**. First-Person-Story-Horror über türkische Dschinn. Verlassenes Bergdorf Kuyulu bei Kars, eine Nacht in der Zemheri (kälteste 40 Tage).
- **Emre Aydın (29)** Spielfigur, skeptisch, in Deutschland aufgewachsen. **Selin** seine Frau, im 8. Monat schwanger, verschwindet in der ersten Nacht. **Nuriye (Babaanne)**, Großmutter, Heilerin ("Ocaklı"), gerade gestorben. **Kör Hasan**, blinder Schäfer, per Funk. **Al Karısı**, zentraler Dschinn (roter Haarschopf, Füße nach hinten), von Nuriye vor 29 Jahren mit einer Eisennadel gebunden.
- **Twist:** Die "Stimme der Großmutter" (Briefe, Kassetten, Flüstern) ist die Al Karısı selbst. Nur der erste Brief ist echt (erkennbar am Satz "Mein Löwe… antworte nicht, auch wenn es meine Stimme ist" und an Rosenwasser-Duft).
- **Kapitel:** Prolog "Yol" (10 min) · K1 "Babaannemin Evi" (25) Haus, erste Karabasan-Sequenz · K2 "Boş Köy" (30) Dorf, Hamam-Stealth · K3 "Zemheri" (30) Schneesturm, Karakoncolos, Gulyabani, Friedhof · K4 "Değirmen" (25) Mühle, Belagerung, Hasan stirbt, echte Kassette · K5 "Kuyu" (25) Spiegelwelt im Brunnen, drei Erinnerungsszenen · Finale (10–15) drei Enden: A "Yeni Efendi" (Standard), B "Destur" (geheimes gutes Ende, braucht echten Brief + Hasans Kassette + alle Destur-Schwellen), C "Kuyu" (schlechtes Ende).
- **Sammelobjekte:** 12 Briefe (11 gefälscht), 7 Muskas, 9 Nazar-Amulette, Dschinn-Heft des Lehrers.
- **Mechaniken laut PDF:** Destur (Schwellen), Spiegel (Al Karısı nur in Spiegeln/Wasser sichtbar), Eisen (verbraucht sich), nicht pfeifen/nicht antworten, Karabasan (Schlaflähmung, Atmung), Muskas (retten einmal), Kälte/Aufwärmen, Rezitieren ("Okumak") mit Angstanzeige.
- **Gebete/Duas:** Im Spiel nur mit echten, korrekt gesprochenen/geschriebenen Texten (Quelle prüfen, Arabisch nicht per OCR übernehmen). Verse nie verdrehen, rückwärts abspielen, verspotten oder an unpassenden Orten (Böden, Toiletten, Leichen) zeigen. Die Gebete scheitern nie, weil sie "nicht wirken", sondern weil Emre sie vor Angst nicht ruhig sprechen kann. Aktuell nur neutrale Platzhalter im Prototyp.
- **Hinweis zum Quellmaterial:** Das PDF ist ein Scan ohne Text, `Story_OCR_roh.txt` ist die Texterkennung (Fließtext brauchbar, Arabisch und einzelne Wörter fehlerhaft).

## Stand: Phase 1 (Mechanik-Prototyp)
Datei: `index.html` (eine Datei, three.js r170 per CDN-Importmap von jsdelivr, Code inline als `<script type="module">`). Nur über http(s) oder per Doppelklick im Browser mit Internet nutzen.
- Graue Testwelt mit fünf Teststationen (Taste 1–5): Start/Lagerfeuer, Destur-Korridor, Spiegelraum (3 Spiegel), Schlafzimmer (Bett = Karabasan-Test), Schneefeld (Karakoncolos).
- Umgesetzt: Ego-Steuerung (WASD, Shift, Maus, Drag-Fallback ohne Pointer-Lock), Taschenlampe (F), Interaktion (E), Angstanzeige mit Herzschlag/Flackern/Wackeln, Destur-Schwellen (Q halten), Al Karısı (Layer 1, nur in Spiegeln und im Taschenspiegel/RMB sichtbar, Verfolgung ab Angst > 45, Muska rettet einmal), Eisen (V halten), Rezitieren (R, bei Angst im Takt mit Leertaste), Karabasan-Atemspiel (Bett), Karakoncolos (Stillstehen schützt, Rennen/T lockt an), Teleports, Lautstärkeregler, M = Ton aus/an, P/Esc = Pause.
- Audio ist komplett prozedural (WebAudio), keine Dateien.
- **Getestet:** Spiel lädt, Rendering und alle fünf Stationen per Teleport (live in Chrome über ein privates Artifact). **Nicht getestet** (Halte-Tasten lassen sich nicht fernsteuern): Destur, Rezitieren, Eisen, Karabasan-Atmung, Karakoncolos-Verhalten, Spiegel-Spiegelbild der Al Karısı, Balance der Werte. Der Nutzer testet und gibt Feedback.
- Veröffentlicht war die Version als privates Artifact (nur für den Nutzer): https://claude.ai/artifact/EriDaWpiVWMoDZVRu3kRMy

## Bekannte Grenzen / Hinweise
- `file://` kann der eingebaute Browser und das Chrome-Tool nicht öffnen. Zum Testen entweder lokalen Server starten (z. B. `uv run python -m http.server 8000` im Projektordner, dann http://localhost:8000) oder als Artifact veröffentlichen.
- In der Claude-Chat-Umgebung war kein Internet für three.js möglich. In Claude Code mit Shell auf dem PC lässt sich three.js lokal ablegen (z. B. `npm install three` + Vite), was für spätere Phasen (mehrere Dateien, .glb-Modelle laden) ohnehin sinnvoll ist.
- Vorschlag fürs Projekt: ab Phase 2 auf mehrere Dateien/Module und lokalen Dev-Server umstellen, Modelle aus Blender als .glb nach `assets/` exportieren.

## Nächste Schritte
1. Feedback des Nutzers zum Prototyp einarbeiten (Angst-Werte, Takt-Minispiel, Atmung, Sichtbarkeit/Helligkeit).
2. Phase 2: ein Gebiet mit echtem Look (Blender-Modelle, Beleuchtung, Sound), z. B. das Haus der Großmutter (Kapitel 1) inklusive erster Karabasan-Sequenz.
3. Danach Kapitel für Kapitel gemäß Story.

## Designänderungen (zweiter Chat, Vorrang vor älteren Angaben)
- **Open World statt Schlauch:** Das Dorf Kuyulu (Köy auf einem Berg) ist ein freies Gebiet von ca. **1000 × 1000 m**, Hang steigt nach Norden, Fluss im Süden. Karte: `map/kuyulu_map.json` (Quelle der Wahrheit für Ortspositionen, Viertel, Zufallsorte). Kapitel sind keine Tore, sondern Story-Orte, die frei erreichbar sind. Gegenstände schalten Fortschritt frei (Kessel-Schlüssel, Nadel, Kassette, echter Brief).
- **Zufalls-Ereignisse („Director"):** Ein System löst abhängig von Ort, Angst und Uhrzeit Ereignisse aus (Stimmen, Schatten, Türen, Funk, Spiegelbilder usw.). Freie Wohnhäuser, Hirtenhütten, Nebenbrunnen sind Zufallsorte mit kleinen Geschichten.
- **Neuer Prolog in Oberhausen (PLZ 46117, Stadtname im Spiel frei wählbar):** Wohnung, Anrufbeantworter oder Brief über Nuriyes Tod, Selin packt, kleine unheimliche Spiegel-Szene. Dann Flug in die Türkei, Mietwagen, ca. 8 bis 9 Stunden Fahrt (Flughafen und Fahrzeit noch prüfen), Ankunft bei Sonnenuntergang, Mann im Schnee, Graben. Danach beginnt die Dorf-Nacht.
- **Nachtverlauf mit Uhr:** Start ca. 17 Uhr (Sonnenuntergang), Ende ca. 7:30 Uhr. Vorschlag: 1 Spielstunde ≈ 12 Minuten echte Zeit.
- **Assets:** Quaternius-Modelle (CC0) unter `assets/models/`, Quellen in `assets/CREDITS.md`. Es fehlen Moschee, Hamam, kleine Hütte (Eigenbau oder weitere Quellen). Kenney und Poly Pizza sind für die Cloud-Umgebung gesperrt, der Nutzer holt von dort selbst.
- **Veröffentlichung:** GitHub Pages unter https://haramcan.github.io/Horrrorgame/ (Prototyp liegt in `index.html`). Pages lässt sich von Claude nicht einschalten, ist aber bereits aktiv.
- **3D-Geländeansicht:** `world.html` (Seite `.../Horrrorgame/world.html`) zeigt das Dorf als 3D-Gelände mit Berg (Höhenfunktion in `baseH`, Häuser auf eingeebneten Plätzen), Flug- und Geh-Modus, Licht Dämmerung/Tag/Nacht. Daten aus `map/kuyulu_map.json` (`houses` = Kulissenhäuser in Terrassenreihen, `lanes` = Gassen). three.js liegt lokal unter `lib/three/` (r170). Generator für die Kartendaten war ein Skript im Scratchpad (gen_map.py), Ergebnis steht im JSON. Modelle sind mit Faktor 2,8 skaliert (Häuser ca. 6 × 7 m). Noch nicht umgesetzt: Hamam, Moschee, Hütten sind rote Platzhalter-Quader.
- **Gelände = Bergkranz:** Das Dorf liegt in einem Talkessel, rundherum Berge (bis ca. 300 m). Die Straße kommt durch einen niedrigen Pass im Osten herein (Mietwagen im Graben liegt im Pass), der Fluss verlässt das Tal durch eine Schlucht im Westen. Hirtenhütten, Ruine und Höhle liegen am unteren Berghang im Norden. Höhenfunktion: `baseH` in `world.html`.
- **Weltgröße:** Das Gelände ist jetzt 2000 × 2000 m (Koordinaten −500 bis 1500, Dorf liegt bei 0 bis 1000). Die Berge sind dadurch lange, sanftere Hänge (Talfuß ca. 600 bis 830 m vom Rand). Die Straße beginnt weit im Osten (x 1500), der Fluss verlässt das Tal im Westen (x −500). `ringT` und `baseH` in `world.html` steuern die Berge. Die 2D-Karte (Artifact) zeigt nur das Dorfgebiet 0 bis 1000 und ist noch nicht auf den neuen Stand gebracht.
