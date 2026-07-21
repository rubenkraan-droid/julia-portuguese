# Julia T. — website

Statische één-pagina site (GitHub Pages). De inhoud komt uit een Notion-database,
zodat Julia teksten kan bewerken zonder code aan te raken.

**Live:** https://rubenkraan-droid.github.io/julia-portuguese/

## Hoe het werkt

```
Notion (database "Julia T. — Website content")
   │   GitHub Action leest Notion elk half uur (of bij "Run workflow")
   ▼
content.json  ──►  index.html leest dit in bij elke paginalading
```

- `index.html` — de site. Elk bewerkbaar stukje heeft een `data-cms="..."`-label.
- `content.json` — de actuele teksten (automatisch bijgewerkt, niet met de hand aanpassen).
- `scripts/sync-notion.js` — leest de Notion-database en schrijft `content.json`.
- `.github/workflows/sync-notion.yml` — draait het script periodiek + met een knop.

## Eenmalige setup (nodig zodat de sync werkt)

De GitHub Action heeft een eigen Notion-sleutel nodig — deze wordt éénmalig ingesteld.

1. **Maak een Notion-integratie**
   Ga naar https://www.notion.so/my-integrations → **New integration** →
   type "Internal", geef 'm een naam (bv. `website-sync`) → **Save** →
   kopieer de **Internal Integration Secret** (begint met `ntn_` of `secret_`).

2. **Geef de integratie toegang tot de database**
   Open de database **"Julia T. — Website content"** in Notion →
   knop `•••` rechtsboven → **Connections** → kies je integratie.

3. **Zet de sleutel als GitHub-secret**
   GitHub repo → **Settings** → **Secrets and variables** → **Actions** →
   **New repository secret** → naam `NOTION_TOKEN`, waarde = de sleutel uit stap 1.

4. **Test**
   GitHub → tab **Actions** → *Sync content from Notion* → **Run workflow**.
   Na ~1 min is `content.json` bijgewerkt en staat de wijziging live.

De database-id staat al in de workflow, dus die hoef je niet in te stellen.

## Voor Julia — content aanpassen

1. Open de Notion-database **"Julia T. — Website content"**.
2. Bewerk alleen de kolom **Value**. Laat **Key** met rust.
3. Klaar — binnen ~30 min staat het op de site (of eerder via *Run workflow* op GitHub).

Leeg laten van `instagram_url` of `email` verbergt die knop automatisch.

## Foto toevoegen

Upload een `julia.jpg` in deze repo en vervang in `index.html` het blokje
`<div class="about-photo">…</div>` door
`<img src="julia.jpg" alt="Photo of Julia T.">`.
