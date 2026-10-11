(function () {
  const DATA = window.__SHELF__;
  const LS_KEY = "aacpl-shelf-renew-v1";
  const TODAY = new Date();
  TODAY.setHours(0, 0, 0, 0);

  let kidFilter = "all";
  let view = "board";

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  function loadRenew() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); }
    catch { return {}; }
  }
  function saveRenew(obj) {
    localStorage.setItem(LS_KEY, JSON.stringify(obj));
  }

  function kidMeta(id) {
    return (DATA.kids || []).find((k) => k.id === id) || { id, name: id, short: id, emoji: "📖" };
  }

  function parseDate(s) {
    if (!s) return null;
    const d = new Date(s + "T00:00:00");
    return isNaN(d) ? null : d;
  }

  function daysUntil(s) {
    const d = parseDate(s);
    if (!d) return null;
    return Math.round((d - TODAY) / 86400000);
  }

  function dueBadge(dueDate) {
    const n = daysUntil(dueDate);
    if (n === null) return { cls: "demo", text: "EXAMPLE" };
    if (n < 0) return { cls: "overdue", text: "Overdue " + Math.abs(n) + "d" };
    if (n === 0) return { cls: "due-soon", text: "Due today" };
    if (n <= 3) return { cls: "due-soon", text: "Due in " + n + "d" };
    return { cls: "ok", text: "Due " + dueDate };
  }

  function filterKid(items) {
    if (kidFilter === "all") return items;
    return items.filter((x) => x.kid === kidFilter);
  }

  function cardBook(item, extraBadges) {
    const k = kidMeta(item.kid);
    const overdue = item.due_date && daysUntil(item.due_date) < 0;
    const cls = ["card", item.kid, overdue ? "overdue" : ""].filter(Boolean).join(" ");
    const badges = [
      '<span class="badge demo">DEMO</span>',
      ...(extraBadges || []),
    ].join(" ");
    return `
      <article class="${cls}">
        <div class="kid-tag ${item.kid}">${k.emoji} ${k.short}</div>
        <h3>${esc(item.title)}</h3>
        <p class="meta">${esc(item.author || "")}${item.format ? " · " + esc(item.format) : ""}</p>
        <p class="meta">${badges}</p>
        ${item.branch ? `<p class="meta">${esc(item.branch)}</p>` : ""}
        ${item.note ? `<p class="meta"><em>${esc(item.note)}</em></p>` : ""}
        ${item.why ? `<p class="meta">${esc(item.why)}</p>` : ""}
        ${item.ready_until ? `<p class="meta">Ready until EXAMPLE ${esc(item.ready_until)}</p>` : ""}
        ${item.position ? `<p class="meta">Queue position EXAMPLE #${item.position}</p>` : ""}
        ${item.due_date ? `<p class="meta">Due EXAMPLE ${esc(item.due_date)}${item.renewable === false ? " · not renewable" : item.renewable ? " · renewable" : ""}</p>` : ""}
      </article>`;
  }

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderBoard() {
    const holds = filterKid(DATA.holds || []);
    const due = filterKid(DATA.due || []);
    const picks = filterKid(DATA.picks || []);
    const overdueN = due.filter((d) => daysUntil(d.due_date) < 0).length;
    const readyN = holds.filter((h) => h.status === "ready").length;
    const el = $("#view-board");
    el.innerHTML = `
      <div class="section-head">
        <div>
          <h2 class="view-title">Fridge board</h2>
          <p class="lede">EXAMPLE shelf snapshot · filter by kid · real account at <a href="https://www.aacpl.net" target="_blank" rel="noopener">aacpl.net</a></p>
        </div>
      </div>
      <div class="stats-row">
        <div class="stat ready"><div class="n">${readyN}</div><div class="l">Ready holds</div></div>
        <div class="stat"><div class="n">${due.length}</div><div class="l">Due items</div></div>
        <div class="stat overdue"><div class="n">${overdueN}</div><div class="l">Overdue (demo)</div></div>
        <div class="stat"><div class="n">${picks.length}</div><div class="l">Kid picks</div></div>
      </div>
      <div class="board-cols">
        <div>
          <h3 class="col-title">📦 Holds</h3>
          <div class="grid">${holds.length ? holds.map((h) => cardBook(h, [
            h.status === "ready" ? '<span class="badge ready">Ready</span>' : '<span class="badge queued">Queued</span>'
          ])).join("") : '<p class="empty">No holds for this filter</p>'}</div>
        </div>
        <div>
          <h3 class="col-title">📅 Due dates</h3>
          <div class="grid">${due.length ? due.map((d) => {
            const b = dueBadge(d.due_date);
            return cardBook(d, [`<span class="badge ${b.cls}">${b.text}</span>`]);
          }).join("") : '<p class="empty">No dues for this filter</p>'}</div>
        </div>
      </div>
      <h3 class="col-title" style="margin-top:1.25rem">⭐ Kid picks</h3>
      <div class="grid">${picks.length ? picks.map((p) => cardBook(p, ['<span class="badge ok">Wishlist</span>'])).join("") : '<p class="empty">No picks</p>'}</div>
    `;
  }

  function renderHolds() {
    const holds = filterKid(DATA.holds || []);
    $("#view-holds").innerHTML = `
      <div class="section-head">
        <div>
          <h2 class="view-title">Holds</h2>
          <p class="lede">DEMO / EXAMPLE only — pick up status is fictional for fridge layout.</p>
        </div>
      </div>
      <div class="grid">${holds.map((h) => cardBook(h, [
        h.status === "ready" ? '<span class="badge ready">Ready</span>' : '<span class="badge queued">Queued</span>'
      ])).join("") || '<p class="empty">No holds</p>'}</div>
    `;
  }

  function renderDue() {
    const due = filterKid(DATA.due || []).slice().sort((a, b) => (a.due_date || "").localeCompare(b.due_date || ""));
    $("#view-due").innerHTML = `
      <div class="section-head">
        <div>
          <h2 class="view-title">Due dates</h2>
          <p class="lede">Overdue rows highlighted in red. Still EXAMPLE — not real checkouts.</p>
        </div>
      </div>
      <div class="grid">${due.map((d) => {
        const b = dueBadge(d.due_date);
        return cardBook(d, [`<span class="badge ${b.cls}">${b.text}</span>`]);
      }).join("") || '<p class="empty">No dues</p>'}</div>
    `;
  }

  function renderPicks() {
    const picks = filterKid(DATA.picks || []);
    $("#view-picks").innerHTML = `
      <div class="section-head">
        <div>
          <h2 class="view-title">Kid picks</h2>
          <p class="lede">Wishlist ideas for Char &amp; Vic — place real holds on <a href="https://www.aacpl.net" target="_blank" rel="noopener">aacpl.net</a>.</p>
        </div>
      </div>
      <div class="grid">${picks.map((p) => cardBook(p, ['<span class="badge ok">Wishlist</span>'])).join("") || '<p class="empty">No picks</p>'}</div>
    `;
  }

  function renderRenew() {
    const state = loadRenew();
    const items = DATA.renew_checklist || [];
    const done = items.filter((i) => state[i.id]).length;
    $("#view-renew").innerHTML = `
      <div class="section-head">
        <div>
          <h2 class="view-title">Renew reminder</h2>
          <p class="lede">Checklist for parents — progress saved in localStorage (${done}/${items.length}).</p>
        </div>
      </div>
      <ul class="check-list" id="renewList">
        ${items.map((i) => `
          <li class="${state[i.id] ? "done" : ""}">
            <input type="checkbox" id="${i.id}" ${state[i.id] ? "checked" : ""} data-id="${i.id}">
            <label for="${i.id}">${esc(i.label)}</label>
          </li>`).join("")}
      </ul>
      <p class="hint" style="margin-top:1rem">Tip: open <a href="https://www.aacpl.net" target="_blank" rel="noopener">aacpl.net</a> to renew for real — this board never talks to the library API.</p>
    `;
    $$("#renewList input").forEach((inp) => {
      inp.addEventListener("change", () => {
        const s = loadRenew();
        s[inp.dataset.id] = inp.checked;
        saveRenew(s);
        renderRenew();
        updateFoot();
      });
    });
  }

  function setView(name) {
    view = name;
    $$(".tab").forEach((t) => {
      const on = t.dataset.view === name;
      t.classList.toggle("active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    $$(".view").forEach((v) => v.classList.toggle("active", v.id === "view-" + name));
    if (name === "about") {
      /* static */
    } else if (name === "holds") renderHolds();
    else if (name === "due") renderDue();
    else if (name === "picks") renderPicks();
    else if (name === "renew") renderRenew();
    else renderBoard();
    location.hash = name;
    updateFoot();
  }

  function updateFoot() {
    const due = filterKid(DATA.due || []);
    const overdueN = due.filter((d) => daysUntil(d.due_date) < 0).length;
    const renew = loadRenew();
    const items = DATA.renew_checklist || [];
    const done = items.filter((i) => renew[i.id]).length;
    $("#footStats").textContent = `filter=${kidFilter} · overdue demo=${overdueN} · renew ${done}/${items.length}`;
  }

  function bind() {
    $$(".tab").forEach((t) => t.addEventListener("click", () => setView(t.dataset.view)));
    $$(".chip").forEach((c) => c.addEventListener("click", () => {
      kidFilter = c.dataset.kid;
      $$(".chip").forEach((x) => x.classList.toggle("active", x.dataset.kid === kidFilter));
      setView(view);
    }));
    const reset = $("#btnResetRenew");
    if (reset) reset.addEventListener("click", () => {
      localStorage.removeItem(LS_KEY);
      $("#aboutHint").textContent = "Renew checklist cleared.";
      if (view === "renew") renderRenew();
      updateFoot();
    });
  }

  function boot() {
    if (!DATA) {
      document.body.innerHTML = "<p style='padding:2rem'>Missing shelf data.</p>";
      return;
    }
    bind();
    const hash = (location.hash || "#board").replace("#", "") || "board";
    const ok = ["board", "holds", "due", "picks", "renew", "about"];
    setView(ok.includes(hash) ? hash : "board");
    window.addEventListener("hashchange", () => {
      const h = (location.hash || "#board").replace("#", "");
      if (ok.includes(h) && h !== view) setView(h);
    });
  }

  boot();
})();
