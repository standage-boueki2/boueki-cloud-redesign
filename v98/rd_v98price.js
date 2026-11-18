/* ═══ 21.98 分野 price の見せ方（刷新版）：商品情報の価格表に、帯の形の照合の結果と「第1帯の数量を入れる」欄 ═══
   中身（帯の形・決め方・直し方）は logic_v2198price.js（V98PRICE）。onclick= は書かない（押す所は data-v98px-act を logic 側でまとめて受ける）。 */
(function () {
  if (typeof V98PRICE === "undefined") return;
  const M = V98PRICE.M;
  const E = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const fmt = (n) => (+n || 0).toLocaleString("en-US");
  const err = (k, e) => { try { V98PRICE.err = "rd " + k + ": " + String((e && e.message) || e).slice(0, 200); V98PRICE.errs.push(V98PRICE.err); } catch (x) { /* 記録だけ */ } };
  const locked = () => { try { return document.body.classList.contains("locked"); } catch (e) { return true; } };
  // 商品情報の画面の価格表（見出しに「価格表」がある区画の、単価のある最初の表）
  function priceTable() {
    const secs = [...document.querySelectorAll("#well .c, #well section, #well [id^='sec-']")];
    for (const s of secs) {
      const h = s.querySelector("h2, h3, .ttl, .hd, b");
      const head = (h && h.textContent) || "";
      if (!/価格表|Price list|价格表|Lista de precios/i.test(head)) continue;
      const tb = [...s.querySelectorAll("table")].find((x) => /US\$|\$|¥|€/.test(x.innerText || ""));
      if (tb) return tb;
    }
    return null;
  }
  function moqN(t) { const m = String((t && t.moq) || "").replace(/,/g, "").match(/\d+/); return m ? +m[0] : 0; }
  function boxHtml(S) {
    const t = S.t;
    const parts = [];
    const L = S.bands.slice().sort((a, b) => a.lo - b.lo);
    const first = L[0];
    S.loose.forEach((x, k) => {
      const nx = S.bands.filter((b) => b.ri > x.ri).sort((a, b) => a.ri - b.ri)[0] || first;
      const u = (nx && nx.u) || "";
      const isFirst = x.ri < S.bands[0].ri;
      const head = isFirst
        ? M(`価格表の第1帯（${x.label ? x.label + " " : ""}${x.v}）の数量が未登録です。`, `The quantity of the first band (${x.label ? x.label + " " : ""}${x.v}) is not registered.`, `价格表第1档（${x.label ? x.label + " " : ""}${x.v}）的数量未登记。`, `La cantidad del primer tramo (${x.label ? x.label + " " : ""}${x.v}) no está registrada.`)
        : M(`価格表の ${x.ri + 1}行目（${x.label ? x.label + " " : ""}${x.v}）の数量が未登録です。`, `Row ${x.ri + 1} (${x.label ? x.label + " " : ""}${x.v}) has no quantity.`, `价格表第 ${x.ri + 1} 行（${x.label ? x.label + " " : ""}${x.v}）未填写数量。`, `La fila ${x.ri + 1} (${x.label ? x.label + " " : ""}${x.v}) no tiene cantidad.`);
      const eff = nx ? M(`この行が何${u || "個"}からの価格か分からないため、${fmt(nx.lo)}${u}より少ない数量では、PI・AI 相談の単価を出していません（推し量った単価で計算しません）。`, `Because it is unknown from what quantity this price applies, PIs and AI answers do not show a unit price below ${fmt(nx.lo)} ${u} (no guessed prices).`, `由于不清楚该价格从多少${u || "个"}起适用，少于 ${fmt(nx.lo)}${u} 的数量在 PI・AI 咨询中不显示单价（不使用推测单价）。`, `Como no se sabe desde qué cantidad aplica, las PI y la IA no muestran precio por debajo de ${fmt(nx.lo)} ${u} (sin precios supuestos).`) : "";
      const mq = moqN(t);
      const chips = [];
      if (isFirst && mq && nx && mq < nx.lo) chips.push(`<button type="button" class="btn g v98px-btn" data-v98px-act="moq" data-v98px-n="${mq}">${E(F2(M("MOQ の {n}{u} から", "From the MOQ ({n} {u})", "从 MOQ {n}{u} 起", "Desde el MOQ ({n} {u})"), { n: fmt(mq), u }))}</button>`);
      if (isFirst && nx && nx.lo > 1 && !(mq === 1)) chips.push(`<button type="button" class="btn g v98px-btn" data-v98px-act="one">${E(F2(M("1{u}から（1〜{m}{u}）", "From 1 (1–{m} {u})", "从 1{u} 起（1〜{m}{u}）", "Desde 1 (1–{m} {u})"), { u, m: fmt(nx.lo - 1) }))}</button>`);
      parts.push(`<div class="v98px-row" data-v98px-ri="${x.ri}" data-v98px-u="${E(u)}">
        <p class="v98px-h"><b>⚠ ${E(head)}</b></p>${eff ? `<p class="v98px-eff">${E(eff)}</p>` : ""}
        <div class="v98px-form"><label><span>${E(M("この行は", "This row applies from", "该行适用于", "Esta fila aplica desde"))}</span>
          <input type="number" min="1" step="1" inputmode="numeric" data-v98px-n="1" aria-label="${E(M("この行の数量の下限", "Lower quantity of this row", "该行数量下限", "Cantidad mínima de esta fila"))}" placeholder="${mq && nx && mq < nx.lo ? mq : ""}">
          <span>${E(u)}${E(M(" 以上の価格", " or more", " 以上的价格", " o más"))}</span></label>
          <button type="button" class="btn v98px-btn" data-v98px-act="set">${E(M("入れる", "Save", "保存", "Guardar"))}</button>${chips.join("")}</div>
        <p class="v98px-msg" role="alert" hidden></p></div>`);
    });
    S.issues.filter((x) => x.k === "dupLo").forEach((x) => parts.push(`<p class="v98px-h">⚠ ${E(F2(M("同じ数量（{n}〜）の帯が2つあり、単価が違います。どちらかを直してください。", "Two bands start at the same quantity ({n}) with different prices. Please fix one.", "有两个从相同数量（{n}）开始的档位且单价不同。请修改其中一个。", "Dos tramos empiezan en la misma cantidad ({n}) con precios distintos."), { n: fmt(x.lo) }))}</p>`));
    S.issues.filter((x) => x.k === "unit").forEach((x) => parts.push(`<p class="v98px-h">⚠ ${E(F2(M("帯の数え方がそろっていません（{u}）。同じ数え方にそろえてください。", "The bands use different units ({u}). Please use one unit.", "各档的计量单位不一致（{u}）。请统一。", "Los tramos usan unidades distintas ({u})."), { u: (x.units || []).join("・") }))}</p>`));
    S.issues.filter((x) => x.k === "cur").forEach((x) => parts.push(`<p class="v98px-h">⚠ ${E(F2(M("帯の通貨がそろっていません（{c}）。PI・AI 相談では単価を出していません。", "The bands use different currencies ({c}). PIs and AI answers do not show a unit price.", "各档币种不一致（{c}）。PI・AI 咨询不显示单价。", "Los tramos usan monedas distintas ({c})."), { c: (x.curs || []).join("・") }))}</p>`));
    if (!parts.length) return "";
    return `<div class="v98px-box" role="note"><p class="v98px-ttl">${E(M("価格表の帯の確かめ（PI・見積・AI 相談で金額に使う前の照合）", "Price-band check (before the bands are used for PIs, quotes and AI answers)", "价格档位核对（用于 PI・报价・AI 咨询金额之前）", "Revisión de tramos (antes de usarlos en PI, cotizaciones e IA)"))}</p>${parts.join("")}
      <p class="v98px-acts"><button type="button" class="btn g v98px-btn" data-v98px-act="table">${E(M("価格表を編集", "Edit price list", "编辑价格表", "Editar lista de precios"))}</button></p></div>`;
  }
  const F2 = (s, o) => String(s).replace(/\{(\w+)\}/g, (m, k) => (o && o[k] != null ? String(o[k]) : ""));
  let lastKey = "";
  function deco() {
    try {
      if (locked()) return;
      const tb = priceTable();
      let box = document.getElementById("v98pxBox");
      const S = tb ? V98PRICE.curShape() : null;
      const bad = S && S.kind === "bands" && S.issues.some((x) => !x.soft);
      if (!tb || !bad) { if (box) box.remove(); lastKey = ""; return; }
      const key = JSON.stringify([S.t.uid || S.t.item, S.t.priceRows, S.t.moq, (document.getElementById("lang") || {}).value || ""]);
      const host = tb.closest(".v186tw") || tb;
      if (box && key === lastKey && box.nextElementSibling === host) return;
      const h = boxHtml(S);
      if (!h) { if (box) box.remove(); return; }
      if (!box) { box = document.createElement("div"); box.id = "v98pxBox"; }
      box.innerHTML = h;
      if (box.nextElementSibling !== host) host.insertAdjacentElement("beforebegin", box);
      lastKey = key;
      // 数量の無い行に札
      const trs = [...tb.querySelectorAll("tbody tr")];
      S.loose.forEach((x) => { const tr = trs[x.ri]; const td = tr && tr.querySelector("td"); if (td && !td.querySelector(".v98px-tag")) td.insertAdjacentHTML("beforeend", ` <span class="v98px-tag" data-noi18n="1">${E(M("数量が未登録", "no quantity", "数量未登记", "sin cantidad"))}</span>`); });
    } catch (e) { err("deco", e); }
  }
  V98PRICE.deco = deco;
  /* PI の「単価を入れていません」は大事な注意なので、2行でたたまない（刷新版の「続きを読む」を外す） */
  function unclamp() {
    try {
      document.querySelectorAll(".v98px-stop").forEach((sp) => {
        const p = sp.closest("p");
        if (!p) return;
        if (p.dataset.rdcl) {
          p.style.webkitLineClamp = "unset";
          p.style.display = "block";
          p.style.overflow = "visible";
          const nx = p.nextElementSibling;
          if (nx && nx.classList && nx.classList.contains("rd-more")) nx.remove();
        } else p.dataset.rdcl = "1";
      });
    } catch (e) { err("unclamp", e); }
  }
  V98PRICE.unclamp = unclamp;
  let tm = 0;
  try {
    new MutationObserver(() => { if (locked()) return; unclamp(); clearTimeout(tm); tm = setTimeout(deco, 180); }).observe(document.body, { childList: true, subtree: true });
  } catch (e) { err("mo", e); }
  // Enter で入れる
  document.addEventListener("keydown", (e) => {
    try {
      const inp = e.target && e.target.matches && e.target.matches("input[data-v98px-n]") ? e.target : null;
      if (!inp || e.key !== "Enter") return;
      e.preventDefault();
      const b = inp.closest("[data-v98px-ri]") && inp.closest("[data-v98px-ri]").querySelector('[data-v98px-act="set"]');
      if (b) b.click();
    } catch (x) { err("key", x); }
  });
})();
