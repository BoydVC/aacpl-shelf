#!/usr/bin/env python3
"""Inline web/ + data/shelf.json into one offline file: dist/aacpl-shelf.html."""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))


def rd(rel):
    with open(os.path.join(HERE, rel), encoding="utf-8") as f:
        return f.read()


def main():
    shelf_path = os.path.join(HERE, "data", "shelf.json")
    with open(shelf_path, encoding="utf-8") as f:
        shelf = json.load(f)
    shelf_js = json.dumps(shelf, ensure_ascii=False)
    n_holds = len(shelf.get("holds", []))
    n_due = len(shelf.get("due", []))
    n_picks = len(shelf.get("picks", []))
    html = rd("web/index.html")
    html = html.replace("/*__CSS__*/", rd("web/app.css"))
    html = html.replace("/*__SHELF__*/ null /*__/SHELF__*/", shelf_js)
    app = rd("web/app.js").replace("</script", "<\\/script")
    html = html.replace("/*__APP__*/", app)
    os.makedirs(os.path.join(HERE, "dist"), exist_ok=True)
    out = os.path.join(HERE, "dist", "aacpl-shelf.html")
    with open(out, "w", encoding="utf-8") as f:
        f.write(html)
    print(
        f"built {out} ({os.path.getsize(out):,} bytes) · "
        f"holds={n_holds} due={n_due} picks={n_picks}"
    )


if __name__ == "__main__":
    main()
