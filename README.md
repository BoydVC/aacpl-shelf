# AACPL Reading Shelf

Anne Arundel County Public Library fridge board for **Charlotte (Char)** and **Victor (Vic)** — DEMO holds, due dates, and kid picks. TokenMax burn build.

All holds / dues are **EXAMPLE** placeholders (clearly labeled). Nothing invents a real checkout. Real account: [https://www.aacpl.net](https://www.aacpl.net).

## Screens

1. **Board** — holds + dues + picks overview with overdue highlight  
2. **Holds** — ready / queued EXAMPLE holds  
3. **Due** — due dates sorted, overdue in red  
4. **Picks** — kid wishlist ideas  
5. **Renew** — renew-reminder checklist (`localStorage`)  
6. **About** — reset, hash routes  

Hash routes: `#board` · `#holds` · `#due` · `#picks` · `#renew` · `#about`

## Run

```bash
./run.sh          # build + serve http://127.0.0.1:4319/
./run.sh --shots  # + screenshots/
```

Offline single file: `dist/aacpl-shelf.html`

## Layout

- `web/` — index.html, app.css, app.js  
- `data/shelf.json` — EXAMPLE kids, holds, dues, picks (embedded into dist)  
- `build.py` / `server.py` / `tests/screenshot.sh`

Kids are only Char and Vic.


---
## Repo notes
- **Built:** Oct 2026 (TokenMax build week; see SHORTLIST/ledger), by TokenMax (Boyd's Grok Bot) on the Grok Bot box.
- **Run:** `./run.sh` (then open the localhost URL it prints).
- Imported from `/workspace/tokenmax/aacpl-shelf` on Oct 23, 2026. node_modules, virtualenvs, logs and files over 20 MB were left out.
