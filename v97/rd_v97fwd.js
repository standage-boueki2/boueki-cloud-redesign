/* ═══ v21.97 fwd（2026-11-18 第10回相当 UAT）物流会社の画面と荷主の見積の画面の見せ方の層（logic_v2197fwd.js・rd_v97fwd.css のあとに読む）
   No.535 レート管理・相見積・AI推奨に「中央値の出し方」（母集団：形態・単位・有効期限内の本数・仕向地・期限切れを除いた本数）を出す。
          相見積のレーン別の「要確認」にも同じ母集団の一言を添える（数字はレート管理と同じ関数）。
   No.520 物流レート管理：既定値の COURIER の行に「見積では 2〜4日（目安）」を出し、「日数を確かめる」の欄に目安を入れておく。
          まとめて確かめる窓（COURIER の既定値の行・目安の日数を入れた表）。荷主の見積の画面・相見積の表・推奨・荷主の AI のレートの表で
          「約10日［既定値］」を「約2〜4日［目安］」に（理由は札の説明）。
   No.519 案件：容積が違う案件の上に、B/L の容積で計算した金額と差を大きく出し、「B/L の容積で反映する」1回（確かめの窓のあと）。
          反映のあとは「元に戻す」と「荷主に知らせる（依頼ページ）」。見積受信箱の行にも「容積の食い違い」。荷主の見積の画面に「計算に使った容積」。
   土台・前の層の関数は控えてから包むだけ。インラインの onclick・style は書かない（イベントは document への委譲）。 */
(function () {
  "use strict";
  if (window.__v97fwdRd) return;
  window.__v97fwdRd = 1;
  const V = window.V97FWD || (window.V97FWD = { v: "21.97", err: [], n: {} });
  const err = (k, e) => { try { V.err.push("rd." + k + ": " + String((e && e.message) || e).slice(0, 160)); if (V.err.length > 40) V.err.shift(); } catch (x) { /* 記録できないときは何もしない */ } };
  const M = (ja, en, zh, es) => (typeof v97fM === "function" ? v97fM(ja, en, zh, es) : ja);
  const E = (s) => (typeof v97fE === "function" ? v97fE(s) : String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]));
  const Y = (n) => "¥" + Math.round(+n || 0).toLocaleString("ja-JP");
  const CB = (v) => (typeof v96fCbm === "function" ? v96fCbm(v) : String(Math.round((+v || 0) * 100) / 100));
  const fwdOn = () => { try { return typeof FWDON !== "undefined" && !!FWDON && typeof FWDB !== "undefined" && !!FWDB; } catch (e) { return false; } };
  const page = () => { try { return (typeof fwdCur !== "undefined" && fwdCur) || ""; } catch (e) { return ""; } };
  const well = () => document.getElementById("well");
  const hash = (s) => { let h = 5381; s = String(s); for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36) + "." + s.length; };
  const put = (anchor, where, cls, html) => {
    /* 同じ中身なら DOM を変えない（MutationObserver で回り続けない） */
    let el = anchor && anchor.parentElement ? anchor.parentElement.querySelector(":scope > ." + cls) : null;
    const sig = hash(html);
    if (el && el.dataset.sig === sig) return el;
    if (el) el.remove();
    anchor.insertAdjacentHTML(where, html);
    el = anchor.parentElement ? anchor.parentElement.querySelector(":scope > ." + cls) : null;
    if (el) el.dataset.sig = sig;
    return el;
  };

  /* ─── No.535 中央値の出し方 ─────────────────────────────── */
  function medNoteHtml() {
    const G = typeof v97fMedGroups === "function" ? v97fMedGroups() : [];
    if (!G.length) return "";
    const L = G.map((g) => g.n >= 3 ? (typeof v97fBasis === "function" ? v97fBasis(g, true) : "")
      : M(`${g.mode}・${g.unit || "単位なし"}：有効期限内のレートが ${g.n}本のため、中央値での点検はしていません${g.exp ? `（期限切れ ${g.exp}本）` : ""}`, `${g.mode} ${g.unit}: only ${g.n} valid rates — not checked`));
    return `<div class="v97fmednote" data-noi18n role="note"><b>${E(M("運賃の中央値の出し方（レート管理・相見積・登録のときの確かめで同じ数字）", "How the freight median is calculated (same on every screen)"))}</b>`
      + `<span>${E(M("同じ輸送の形・同じ単位の、有効期限内のレートだけ（仕向地はすべて・米ドルは円に換算・点検する行も含める・3本以上のときだけ点検）。中央値の5倍以上・5分の1以下に「要確認」を付けます。", "Valid rates of the same mode and unit only (all destinations, US$ converted to yen, the row itself included, checked only with 3+ rates). Rows at 5× or more / 1/5 or less are flagged."))}</span>`
      + `<ul>${L.map((x) => `<li>${E(x)}</li>`).join("")}</ul></div>`;
  }
  function paintMedRates(w) {
    try {
      const t = [...w.querySelectorAll("table")].find((x) => x.querySelector("tbody [data-frdel]"));
      if (!t) return;
      const tw = t.closest(".tw") || t;
      const html = medNoteHtml();
      if (!html) { const o = tw.parentElement && tw.parentElement.querySelector(":scope > .v97fmednote"); if (o) o.remove(); return; }
      put(tw, "beforebegin", "v97fmednote", html);
    } catch (e) { err("medrates", e); }
  }
  function paintMedAgg(w) {
    try {
      const h = [...w.querySelectorAll("h3")].find((x) => /^(レーン別の集計とAI物流マンの推奨|Lane summary & AI pick)/.test((x.textContent || "").trim()));
      if (!h) return;
      const card = h.closest(".c") || h.parentElement;
      const tw = card && (card.querySelector(".tw") || card.querySelector("table"));
      const html = medNoteHtml();
      if (tw && html) put(tw, "beforebegin", "v97fmednote", html);
      /* No.520：COURIER の行の「所要」に、見積で使う目安の日数 */
      const R = (FWDB && FWDB.rates) || [];
      card.querySelectorAll("tbody tr").forEach((tr) => {
        const pm = tr.cells[0] && tr.cells[0].querySelector(".p"), mode = String((pm && pm.textContent) || "").trim().toUpperCase();
        if (!/COURIER/.test(mode)) return;
        const pod = tr.dataset.v95pod || ((tr.cells[0].querySelector("b") || {}).textContent || "").trim();
        const E2 = R.filter((r) => r && r.pod === pod && /COURIER/i.test(String(r.mode || "")) && (typeof v97fValid !== "function" || v97fValid(r))).map((r) => (typeof v97fTtEst === "function" ? v97fTtEst(r) : null)).filter(Boolean);
        const cell = tr.cells[3];
        if (!cell) return;
        const want = E2.length ? M(`見積では ${Math.min(...E2.map((e) => e.lo))}〜${Math.max(...E2.map((e) => e.hi))}日（${v97fEstWord(E2[0])}）`, `Quotes use ${Math.min(...E2.map((e) => e.lo))}–${Math.max(...E2.map((e) => e.hi))} days (${v97fEstWord(E2[0])})`) : "";
        let sm = cell.querySelector(".v97ttest");
        if (!want) { if (sm) sm.remove(); return; }
        if (sm && sm.textContent === want) return;
        if (!sm) { sm = document.createElement("small"); sm.className = "v97ttest"; sm.setAttribute("data-noi18n", ""); cell.appendChild(sm); }
        sm.textContent = want; sm.title = v97fEstWhy(E2[0]);
      });
      /* 行の「要確認」に同じ母集団の一言 */
      const F = typeof v95miscLaneFlags === "function" ? v95miscLaneFlags() : {};
      card.querySelectorAll("tr.k-v95lrow").forEach((tr) => {
        const box = tr.querySelector(".k-v95lchk");
        const pm = tr.cells[0] && tr.cells[0].querySelector(".p");
        const f = F[(tr.dataset.v95pod || "") + "|" + String((pm && pm.textContent) || "").trim().toUpperCase()];
        const o = f && f.flags.find((x) => x.t === "out" && x.v97);
        if (!box || !o) return;
        const txt = M(`（${o.basis}・レート管理の「要確認」と同じ中央値）`, `(${o.basis}; same median as the rate table)`);
        let s = box.querySelector(".v97fbasis");
        if (s && s.textContent === txt) return;
        if (!s) { s = document.createElement("small"); s.className = "v97fbasis"; s.setAttribute("data-noi18n", ""); const sp = box.querySelector("span"); (sp || box).appendChild(s); }
        s.textContent = txt;
      });
    } catch (e) { err("medagg", e); }
  }

  /* ─── No.520 COURIER の日数 ─────────────────────────────── */
  const estBadge = (e) => `<span class="v96ttb v97est${e.src === "region" ? "" : " reg"}" data-noi18n title="${E(typeof v97fEstWhy === "function" ? v97fEstWhy(e) : "")}">${E(typeof v97fEstWord === "function" ? v97fEstWord(e) : "")}</span>`;
  const rng = (e) => (typeof v97fRange === "function" ? v97fRange(e) : e.lo + "〜" + e.hi);
  /* HTML の中の「約10日」＋v96 の札を、目安の日数＋札に */
  function swapHtml(s, e) {
    if (!e) return s;
    const re = new RegExp("約\\s*(?:" + [...new Set([e.cur != null ? e.cur : e.was, e.was])].join("|") + ")\\s*日(\\s*(?:<br>)?\\s*)?(?:<span class=\"v96ttb[^\"]*\"[^>]*>[^<]*</span>)?");
    if (!re.test(String(s))) return s;
    return String(s).replace(re, (m0, gap) => `約${rng(e)}日${gap && /<br>/.test(gap) ? "<br>" : " "}${estBadge(e)}`);
  }
  function estRowsSwap(html, ests, nameOf) {
    if (!ests.some(Boolean)) return html;
    const tp = document.createElement("template");
    tp.innerHTML = String(html);
    tp.content.querySelectorAll("tbody tr").forEach((tr, i) => {
      const e = nameOf ? nameOf(tr, i) : ests[i];
      if (!e) return;
      const td = [...tr.children].find((x) => new RegExp("約\\s*(?:" + [...new Set([e.cur != null ? e.cur : e.was, e.was])].join("|") + ")\\s*日").test(x.textContent || ""));
      if (td && !td.querySelector(".v97est")) td.innerHTML = swapHtml(td.innerHTML, e);
    });
    return tp.innerHTML;
  }
  /* HTML の文字列を、カードと同じ置き換え（会社ごと・情勢見込みつき）にかける */
  function swapStr(s, l, defCo) {
    try {
      if (!l || !l.ok || !/約\s*\d+\s*日/.test(String(s))) return s;
      const O = l.offers || [];
      const any = O.some((o) => typeof v97fOfferEst === "function" && v97fOfferEst(o)) || (typeof v97fLegEst === "function" && v97fLegEst(l));
      if (!any) return s;
      const box = document.createElement("div");
      box.innerHTML = String(s);
      swapCard(box, l, defCo);
      return box.innerHTML;
    } catch (e) { err("swapstr", e); return s; }
  }
  if (typeof fwdCompareHtml === "function") {
    const __cm97r = fwdCompareHtml;
    fwdCompareHtml = function (r, l) { const s = __cm97r.apply(this, arguments); return swapStr(s, l); };
  }
  if (typeof fwdRecHtml === "function") {
    const __rh97r = fwdRecHtml;
    fwdRecHtml = function (r, l) { const s = __rh97r.apply(this, arguments); return swapStr(s, l, l && l.rec); };
  }
  if (typeof shipRateTbl === "function") {
    const __st97r = shipRateTbl;
    shipRateTbl = function (rows) {
      const s = __st97r.apply(this, arguments);
      try { const ks = (rows || []).map((r) => (typeof v97fTtEst === "function" ? v97fTtEst(r) : null)); return estRowsSwap(s, ks); } catch (e) { err("shiptbl", e); return s; }
    };
  }
  function paintRatesTt(w) {
    try {
      const t = [...w.querySelectorAll("table")].find((x) => x.querySelector("tbody [data-frdel]"));
      if (!t) return;
      const R = (FWDB && FWDB.rates) || [];
      const todo = [];
      [...t.querySelectorAll("tbody tr")].forEach((tr) => {
        const del = tr.querySelector("[data-frdel]");
        if (!del) return;
        const i = +del.dataset.frdel, r = R[i];
        const e = r && typeof v97fTtEst === "function" ? v97fTtEst(r) : null;
        const live = !!e && (typeof v97fValid !== "function" || v97fValid(r));
        const td = [...tr.children].find((x) => /^\s*\d+\s*日/.test(x.textContent || ""));
        const want = e ? `${i}:${e.lo}-${e.hi}-${e.src}` : "";
        if (live) todo.push({ i, r, e });
        if (!td || (td.dataset.v97e || "") === want) return;
        td.dataset.v97e = want;
        td.querySelectorAll(".v97ttest").forEach((x) => x.remove());
        if (e) td.insertAdjacentHTML("beforeend", `<span class="v97ttest" data-noi18n title="${E(v97fEstWhy(e))}">${E(M(`見積・AI の答えでは ${rng(e)}日（${v97fEstWord(e)}）`, `Quotes use ${rng(e)} days (${v97fEstWord(e)})`))}</span>`);
      });
      /* まとめて確かめる */
      const tw = t.closest(".tw") || t;
      const old = tw.parentElement && tw.parentElement.querySelector(":scope > .v97ttbulk");
      if (!todo.length) { if (old) old.remove(); return; }
      put(tw, "beforebegin", "v97ttbulk", `<div class="v97ttbulk" data-noi18n role="note"><span>${E(M(`COURIER の日数が空欄（既定値の10日）のレートが ${todo.length}本あります。見積と AI の答えでは、10日の代わりに備考・同じ国の登録・国際宅配便の目安の日数を「目安」として出しています。実際の日数を確かめると、登録の値になります。`, `${todo.length} COURIER rates have blank transit days (default 10). Quotes and AI answers show estimates instead; confirm the real days to register them.`))}</span><button type="button" class="btn g" data-v97tt="bulk">${E(M(`日数をまとめて確かめる（${todo.length}本）`, `Confirm days (${todo.length})`))}</button></div>`);
    } catch (e) { err("ratestt", e); }
  }
  function bulkSheet() {
    try {
      if (typeof v33Sheet !== "function") return;
      const R = (FWDB && FWDB.rates) || [];
      const L = R.map((r, i) => ({ r, i, e: typeof v97fTtEst === "function" ? v97fTtEst(r) : null })).filter((x) => x.e && (typeof v97fValid !== "function" || v97fValid(x.r)));
      if (!L.length) return;
      const el = v33Sheet({
        title: M("COURIER の日数をまとめて確かめる", "Confirm COURIER transit days"), wide: 1,
        html: `<p class="v33p" data-noi18n>${E(M("目安の日数を入れてあります。実際の所要日数（営業日）に直してから「この日数で登録する」を押してください。チェックを外した行は、今のまま（既定値）です。", "Estimates are filled in. Correct them to the real transit days, then register. Unchecked rows stay as they are."))}</p>`
          + `<div class="tw"><table class="v97tttbl" data-noi18n><thead><tr><th></th><th>${E(M("区間", "Lane"))}</th><th>${E(M("会社", "Company"))}</th><th>${E(M("いま", "Now"))}</th><th>${E(M("日数（日）", "Days"))}</th><th>${E(M("入れた目安の出どころ", "Source of the estimate"))}</th></tr></thead><tbody>`
          + L.map((x) => `<tr><td><input type="checkbox" data-v97ttc="${x.i}" checked aria-label="${E(M("登録する", "register"))}"></td><td>${E(x.r.pol)} → ${E(x.r.pod)}</td><td>${E(x.r.co || "")}</td><td>${E(String(x.r.tt))}${E(M("日（既定値）", " days (default)"))}</td><td><input class="v33in v97ttin" type="number" min="1" max="365" value="${E(String(x.e.hi))}" data-v97tti="${x.i}"></td><td><small title="${E(v97fEstWhy(x.e))}">${E(rng(x.e))}${E(M("日・", " days · "))}${E(x.e.src === "region" ? M(`国際宅配便の一般的な目安（${x.e.reg}・営業日）`, `general express estimate (${x.e.reg})`) : x.e.src === "peer" ? M(`同じ国の登録の日数${x.e.co ? "（" + x.e.co + "）" : ""}`, "registered days to the same country") : M("このレートの備考の日数", "days in this rate's note"))}</small></td></tr>`).join("")
          + `</tbody></table></div><p class="v97ttmsg" data-noi18n role="status"></p>`,
        foot: `<button class="btn g" type="button" data-v97ttx data-noi18n>${E(M("やめる", "Cancel"))}</button><button class="btn" type="button" data-v97ttok data-noi18n>${E(M("この日数で登録する", "Register these days"))}</button>`
      });
      if (!el) return;
      el.querySelector("[data-v97ttx]").addEventListener("click", () => { if (typeof v33SheetClose === "function") v33SheetClose(); });
      el.querySelector("[data-v97ttok]").addEventListener("click", () => {
        let n = 0, bad = 0;
        el.querySelectorAll("[data-v97ttc]").forEach((c) => {
          if (!c.checked) return;
          const i = c.getAttribute("data-v97ttc"), inp = el.querySelector(`[data-v97tti="${i}"]`);
          const d = parseInt(inp && inp.value, 10);
          if (!(d > 0 && d <= 365)) { bad++; return; }
          if (typeof v96fTtConfirm === "function" && v96fTtConfirm(+i, d)) n++;
        });
        if (bad) { const m = el.querySelector(".v97ttmsg"); if (m) m.textContent = M(`1〜365 の日数を入れてください（${bad}行）`, `Enter 1–365 days (${bad} rows)`); if (!n) return; }
        if (typeof v33SheetClose === "function") v33SheetClose();
        try { if (typeof toast === "function") toast(M(`${n}本の日数を登録しました（確認済み）`, `Registered transit days for ${n} rates`)); } catch (e) { /* 無視 */ }
        rerender();
      });
    } catch (e) { err("bulk", e); }
  }
  /* 21.96 の「日数を確かめる」の窓：目安を入れておき、出どころを書く */
  document.addEventListener("click", (ev) => {
    try {
      const b = ev.target && ev.target.closest && ev.target.closest("[data-v96tt]");
      if (!b) return;
      const i = +b.dataset.v96tt, r = FWDB && FWDB.rates && FWDB.rates[i];
      const e = r && typeof v97fTtEst === "function" ? v97fTtEst(r) : null;
      if (!e) return;
      setTimeout(() => {
        try {
          const inp = document.getElementById("v96ttin");
          if (inp && (!inp.value || +inp.value === +e.was)) inp.value = String(e.hi);
          if (inp && !document.querySelector(".v97ttwhy")) inp.closest("label").insertAdjacentHTML("afterend", `<p class="v97ttwhy" data-noi18n>${E(M(`入れてあるのは ${rng(e)}日（${v97fEstWord(e)}）の長いほうです。`, `Pre-filled with the longer end of ${rng(e)} days (${v97fEstWord(e)}). `))}${E(v97fEstWhy(e))}</p>`);
        } catch (x) { err("ttpre", x); }
      }, 0);
    } catch (x) { err("ttclick", x); }
  }, true);
  /* 見積のカードの中の「約10日」（情勢見込みつきの「所要 約12日（クーリエ 約10日＋…）」・相見積の表・AI物流マンの選定の表）を、
     その会社の COURIER の目安の日数に。文字だけ替える（同じ中身なら替えない＝回り続けない） */
  function swapCard(card, l, defCo, flat) {
    const O = l.offers || [], sel = defCo || l.sel || l.co || "";
    const estOf = (co) => {
      const o = O.find((x) => x && x.co === co);
      if (o) return typeof v97fOfferEst === "function" ? v97fOfferEst(o) : null;
      return co === sel && typeof v97fLegEst === "function" ? v97fLegEst(l) : null;
    };
    const coOf = (el) => {
      if (flat) return sel;
      const tr = el.closest("tr"), row = el.closest(".v64row");
      if (row) { const c = row.querySelector(".v64co"); return c ? (c.textContent || "").trim() : sel; }
      if (tr) { const c = tr.querySelector("td b"); return c ? (c.textContent || "").trim() : sel; }
      return sel;
    };
    const d = +l.delay || 0;
    const tw = document.createTreeWalker(card, NodeFilter.SHOW_TEXT);
    const L = [];
    while (tw.nextNode()) L.push(tw.currentNode);
    let any = 0;
    L.forEach((n) => {
      const t = n.data;
      if (!/約\s*\d+\s*日/.test(t)) return;
      const el = n.parentElement;
      if (!el || el.closest(".v97est") || el.classList.contains("v64rng")) return;
      const e = estOf(coOf(el));
      if (!e || typeof v97fSwapText !== "function") return;
      const y = v97fSwapText(t, e, d, typeof v97fEstWord === "function" ? v97fEstWord(e) : "");
      if (y !== t) { n.data = y; any++; if (!el.title) el.title = typeof v97fEstWhy === "function" ? v97fEstWhy(e) : ""; }
    });
    /* 21.96 の札（既定値かも）を「目安」に */
    card.querySelectorAll(".v96ttb:not(.v97est)").forEach((bd) => {
      const e = estOf(coOf(bd));
      if (!e) return;
      bd.classList.add("v97est"); if (e.src !== "region") bd.classList.add("reg");
      bd.textContent = typeof v97fEstWord === "function" ? v97fEstWord(e) : "";
      bd.title = typeof v97fEstWhy === "function" ? v97fEstWhy(e) : "";
      any++;
    });
    /* 選定の表の「所要 約A〜B日」（各社の幅）を、目安の日数で数え直す */
    card.querySelectorAll(".v64rng").forEach((x) => {
      const m = /所要\s*約\s*(\d+)\s*〜\s*(\d+)\s*日/.exec(x.textContent || "");
      if (!m || !O.length) return;
      let lo = Infinity, hi = 0, est = 0;
      O.forEach((o) => {
        if (!o || !o.quote) return;
        const e = estOf(o.co);
        if (e) { est++; lo = Math.min(lo, e.lo + d); hi = Math.max(hi, e.hi + d); } else { const t = (+o.quote.tt || 0) + d; lo = Math.min(lo, t); hi = Math.max(hi, t); }
      });
      if (!est || !(hi > 0)) return;
      const ny = `所要 約${lo}〜${hi}日`;
      if (m[0] !== ny) { x.textContent = String(x.textContent).replace(m[0], ny); any++; }
    });
    if (any) v97fCnt2("swapCard");
  }
  /* 見積の画面（荷主・物流会社）：日数と、計算に使った容積 */
  function paintDrawer(id) {
    try {
      const r = ((typeof FWDB !== "undefined" && FWDB && FWDB.reqs) || []).find((x) => x && x.id === id);
      if (!r) return;
      const body = document.querySelector(".dwbody");
      if (!body) return;
      if (Array.isArray(r.legs)) {
        body.querySelectorAll(".fwdleg").forEach((card) => {
          const b = card.querySelector("b"), cty = b && (b.textContent || "").trim();
          const l = r.legs.find((x) => x && x.cty === cty);
          if (l && l.ok) swapCard(card, l);
        });
      }
      /* 計算に使った容積（荷主の画面にも物流会社の画面にも） */
      if (!body.querySelector(".v97fvolused")) {
        const legs = (r.legs || []).filter((l) => l && l.ok && l.quote);
        const cour = legs.length && legs.every((l) => l.quote.courier);
        const air = legs.some((l) => /AIR/i.test(String(l.quote.mode || "")));
        let t = cour ? M("この見積は小包（最小重量帯の1個）の運賃で計算しています（容積は使いません）。", "This quote uses the courier rate for one parcel (volume not used).")
          : M(`この見積は、依頼のときに共有した容積 ${CB(r.cbm)} m³ で計算しています${air ? `（航空は容積重量 ${Math.round((+r.cbm || 0) * 167)}kg）` : ""}。`, `This quote is calculated with the shared volume ${CB(r.cbm)} m³${air ? ` (air: volumetric ${Math.round((+r.cbm || 0) * 167)} kg)` : ""}.`);
        if (fwdOn()) {
          const ap = legs.map((l) => (typeof v96fVolOf === "function" ? v96fVolOf(r.id, l.cty) : null)).filter(Boolean);
          if (ap.length) t += M(` B/L の容積 ${CB(ap[0].cbm)} m³ で計算し直した見積を反映しています（${ap.length}か国・元に戻せます）。荷主の画面の見積は、荷主が数量を直して再見積するまで元の金額です。`, ` The B/L volume ${CB(ap[0].cbm)} m³ is applied (${ap.length}).`);
        } else if (!cour) t += M(" B/L などで容積が変わったときは、物流会社から依頼ページかメールで知らせが届きます（数量を直して「再見積を依頼」できます）。", " If the B/L volume differs, the forwarder will tell you by a request page or e-mail (you can correct the quantity and request a new quote).");
        const lbl = [...body.querySelectorAll("p.lbl")].find((x) => /国ごとの見積|Quotes by country/.test(x.textContent || ""));
        const html = `<p class="nn v97fvolused" data-noi18n role="note"><b>${E(M("計算に使った容積", "Volume used"))}</b>${E(M("：", ": "))}${E(t)}</p>`;
        if (lbl) lbl.insertAdjacentHTML("beforebegin", html);
      }
    } catch (e) { err("drawer", e); }
  }
  if (typeof v45OpenQuote === "function") {
    const __vq97r = v45OpenQuote;
    v45OpenQuote = function (r) {
      const o = __vq97r.apply(this, arguments);
      try { const id = r && r.id; if (id) { paintDrawer(id); setTimeout(() => paintDrawer(id), 120); } } catch (e) { err("v45oq", e); }
      return o;
    };
  }
  if (typeof openFwdQuote === "function") {
    const __oq97r = openFwdQuote;
    openFwdQuote = function (id) {
      const o = __oq97r.apply(this, arguments);
      try { paintDrawer(id); setTimeout(() => paintDrawer(id), 120); } catch (e) { err("oq", e); }
      return o;
    };
  }

  /* ─── No.519 案件の容積の食い違い ──────────────────────── */
  const LAST = {};   /* 反映した一覧（元に戻す用）：案件の id → [{rid,cty}] */
  function volBar(c, cs, csid) {
    const A = typeof v97fVolAuto === "function" ? v97fVolAuto(c, cs) : [];
    const P = typeof v97fVolApplied === "function" ? v97fVolApplied(c, cs) : [];
    if (!A.length && !P.length) return "";
    if (A.length) {
      const so = A.reduce((a, x) => a + x.old, 0), sn = A.reduce((a, x) => a + x.neu, 0), d = Math.round(sn - so);
      const dt = d < 0 ? M(`${Y(-d)} 安い`, `${Y(-d)} lower`) : d > 0 ? M(`${Y(d)} 高い`, `${Y(d)} higher`) : M("同じ金額", "same amount");
      const x0 = A[0];
      return `<div class="v97fvolbar" data-noi18n role="alert" data-v97cs="${E(csid)}"><div class="v97fvolbar-h"><b>${E(M("容積の食い違い", "Volume mismatch"))}</b><span>${E(M(`荷主の共有 ${CB(x0.from)} m³ ／ B/L ${CB(x0.bl)} m³`, `Shipper ${CB(x0.from)} m³ / B/L ${CB(x0.bl)} m³`))}</span></div>`
        + `<p class="v97fvolbar-amt">${E(M("B/L の容積で計算すると ", "With the B/L volume: "))}<b>${Y(sn)}</b>${E(M(`（今の見積 ${Y(so)} より `, ` (current ${Y(so)}, `))}<b class="${d < 0 ? "dn" : d > 0 ? "up" : ""}">${E(dt)}</b>${E(M("）", ")"))}</p>`
        + (A.length > 1 ? `<ul class="v97fvolbar-l">${A.map((x) => `<li>${E(x.cty)}（${E(x.rid)}）：${Y(x.old)} → <b>${Y(x.neu)}</b></li>`).join("")}</ul>` : "")
        + `<div class="v97fvolbar-act"><button type="button" class="btn" data-v97vol="apply" data-cs="${E(csid)}">${E(M(A.length > 1 ? `B/L の容積で反映する（${A.length}か国）` : "B/L の容積で反映する", A.length > 1 ? `Apply the B/L volume (${A.length})` : "Apply the B/L volume"))}</button>`
        + `<small>${E(M("押すと確かめの窓が出ます。反映しても元の見積は残り、いつでも元に戻せます。どちらが正しいかは荷主に確かめてください。", "A confirmation appears first. The original quote is kept and you can undo. Please confirm with the shipper which is correct."))}</small></div></div>`;
    }
    const so = P.reduce((a, x) => a + x.old, 0), sn = P.reduce((a, x) => a + x.neu, 0);
    return `<div class="v97fvolbar ok" data-noi18n role="status" data-v97cs="${E(csid)}"><div class="v97fvolbar-h"><b>${E(M("B/L の容積で反映済み", "B/L volume applied"))}</b><span>${E(M(`B/L ${CB(P[0].bl)} m³ で ${Y(sn)}（元の見積 ${Y(so)}・荷主の共有 ${CB(P[0].from)} m³）`, `B/L ${CB(P[0].bl)} m³: ${Y(sn)} (was ${Y(so)})`))}</span></div>`
      + `<div class="v97fvolbar-act"><button type="button" class="btn g" data-v97vol="undo" data-cs="${E(csid)}">${E(M("元に戻す（荷主の共有の容積に）", "Undo (back to the shipper's volume)"))}</button><button type="button" class="btn g" data-v97vol="tell" data-cs="${E(csid)}" data-co="${E(c.co || "")}">${E(M("荷主に知らせる（依頼ページ）", "Tell the shipper (request page)"))}</button>`
      + `<small>${E(M("荷主の画面の見積は、荷主が数量を直して再見積するまで元の金額です。依頼ページで、どちらの容積で計算したかを伝えられます。", "The shipper's screen keeps the original amount until they correct the quantity. Use a request page to tell them."))}</small></div></div>`;
  }
  function caseOf(csid) {
    try { const C = typeof v33Cases === "function" ? v33Cases() : []; const c = C.find((k) => typeof v33CsId === "function" && v33CsId(k.key) === csid); const cs = c && typeof v33One === "function" ? (v33One("cs", csid) || {}) : {}; return c ? { c, cs } : null; } catch (e) { err("caseof", e); return null; }
  }
  function paintCases(w) {
    try {
      const C = typeof v33Cases === "function" ? v33Cases() : [];
      w.querySelectorAll("section.v33case").forEach((sec) => {
        const ed = sec.querySelector("[data-csed]");
        if (!ed) return;
        const csid = ed.dataset.csed, c = C.find((k) => typeof v33CsId === "function" && v33CsId(k.key) === csid);
        if (!c) return;
        const cs = (typeof v33One === "function" ? v33One("cs", csid) : null) || {};
        const html = volBar(c, cs, csid);
        const old = sec.querySelector(".v97fvolbar");
        if (!html) { if (old) old.remove(); return; }
        const sig = hash(html);
        if (old && old.dataset.sig === sig) return;
        if (old) old.remove();
        const h = sec.querySelector(".v33case-h") || sec.firstElementChild;
        if (h) h.insertAdjacentHTML("afterend", html); else sec.insertAdjacentHTML("afterbegin", html);
        const nb = sec.querySelector(".v97fvolbar");
        if (nb) nb.dataset.sig = sig;
      });
    } catch (e) { err("cases", e); }
  }
  function paintInbox(w) {
    try {
      const C = typeof v33Cases === "function" ? v33Cases() : [];
      const byRid = {};
      C.forEach((c) => {
        const csid = typeof v33CsId === "function" ? v33CsId(c.key) : "";
        const cs = (csid && typeof v33One === "function" ? v33One("cs", csid) : null) || {};
        const A = typeof v97fVolAuto === "function" ? v97fVolAuto(c, cs) : [];
        A.forEach((x) => { (byRid[x.rid] = byRid[x.rid] || []).push(x); });
      });
      const R0 = (typeof FWDB !== "undefined" && FWDB && FWDB.reqs) || [];
      w.querySelectorAll("table tbody tr").forEach((tr) => {
        const m = /RQ-[A-Za-z0-9]+/.exec(tr.textContent || "");
        /* No.520：COURIER の日数（国が1つの依頼だけ。ほかの国の日数と取り違えない） */
        try {
          const rq = m && R0.find((x) => x && x.id === m[0]), ok = rq ? (rq.legs || []).filter((x) => x && x.ok) : [];
          if (ok.length === 1) swapCard(tr, ok[0], null, true);
        } catch (e) { err("inboxtt", e); }
        const L = m ? byRid[m[0]] : null;
        const want = L ? L.map((x) => x.cty + ":" + Math.round(x.neu)).join(",") : "";
        if ((tr.dataset.v97v || "") === want) return;
        tr.dataset.v97v = want;
        tr.querySelectorAll(".v97fvtag").forEach((x) => x.remove());
        if (!L) return;
        const d = Math.round(L.reduce((a, x) => a + x.neu - x.old, 0));
        const td = [...tr.children].find((x) => /¥\s*[\d,]+/.test(x.textContent || "")) || tr.lastElementChild;
        if (td) td.insertAdjacentHTML("beforeend", `<br><span class="v97fvtag" data-noi18n title="${E(M("案件・出荷管理で B/L の容積で反映できます", "Apply the B/L volume in Cases"))}">${E(M(`容積の食い違い：B/L なら ${d < 0 ? Y(-d) + " 安い" : d > 0 ? Y(d) + " 高い" : "同額"}`, `Volume mismatch: B/L ${d < 0 ? Y(-d) + " lower" : d > 0 ? Y(d) + " higher" : "same"}`))}</span>`);
      });
    } catch (e) { err("inbox", e); }
  }
  function applySheet(csid) {
    try {
      const K = caseOf(csid);
      if (!K || typeof v33Sheet !== "function") return;
      const A = typeof v97fVolAuto === "function" ? v97fVolAuto(K.c, K.cs) : [];
      if (!A.length) return;
      const so = A.reduce((a, x) => a + x.old, 0), sn = A.reduce((a, x) => a + x.neu, 0);
      const el = v33Sheet({
        title: M("B/L の容積で見積を反映しますか？", "Apply the B/L volume to the quotes?"),
        html: `<div data-noi18n><p class="v33p">${E(M(`荷主の共有 ${CB(A[0].from)} m³ の見積を、B/L の ${CB(A[0].bl)} m³ で計算し直した金額にします。`, `Quotes for the shipper's ${CB(A[0].from)} m³ become the amounts for the B/L ${CB(A[0].bl)} m³.`))}</p>`
          + `<ul class="v97fvolbar-l">${A.map((x) => `<li>${E(x.cty)}（${E(x.rid)}）：${Y(x.old)} → <b>${Y(x.neu)}</b></li>`).join("")}</ul>`
          + `<p class="v33p"><b>${E(M(`合計 ${Y(so)} → ${Y(sn)}`, `Total ${Y(so)} → ${Y(sn)}`))}</b></p>`
          + `<p class="v33mute">${E(M("この画面・見積受信箱・見積の詳細の金額が B/L の容積の見積になります（同じレート・単価で、容積だけ替えた計算）。元の見積は残り、いつでも元に戻せます。荷主の画面の見積は、荷主が数量を直して再見積するまで元の金額のままです。", "Amounts on this screen, the inbox and the quote details change. The original quote is kept; you can undo. The shipper's screen keeps the original until they correct the quantity."))}</p></div>`,
        foot: `<button class="btn g" type="button" data-v97vx data-noi18n>${E(M("やめる", "Cancel"))}</button><button class="btn" type="button" data-v97vok data-noi18n>${E(M("反映する", "Apply"))}</button>`
      });
      if (!el) return;
      el.querySelector("[data-v97vx]").addEventListener("click", () => { if (typeof v33SheetClose === "function") v33SheetClose(); });
      el.querySelector("[data-v97vok]").addEventListener("click", () => {
        const done = typeof v97fVolApplyAll === "function" ? v97fVolApplyAll(A) : [];
        if (typeof v33SheetClose === "function") v33SheetClose();
        LAST[csid] = done;
        undoToast(csid, done, A);
        rerender();
      });
    } catch (e) { err("applysheet", e); }
  }
  function undoToast(csid, done, A) {
    try {
      document.querySelectorAll(".v97fvoltoast").forEach((x) => x.remove());
      if (!done.length) { if (typeof toast === "function") toast(M("反映できませんでした", "Could not apply")); return; }
      const sn = A.reduce((a, x) => a + x.neu, 0);
      const d = document.createElement("div");
      d.className = "v97fvoltoast"; d.setAttribute("role", "status"); d.setAttribute("data-noi18n", "");
      d.innerHTML = `<span>${E(M(`B/L の容積の見積（${Y(sn)}）にしました`, `Applied the B/L-based quotes (${Y(sn)})`))}</span><button type="button" class="btn g" data-v97vol="undo" data-cs="${E(csid)}">${E(M("元に戻す", "Undo"))}</button><button type="button" class="v97fvoltoast-x" aria-label="${E(M("閉じる", "Close"))}">×</button>`;
      document.body.appendChild(d);
      d.querySelector(".v97fvoltoast-x").addEventListener("click", () => d.remove());
      setTimeout(() => { try { d.remove(); } catch (e) { /* 無視 */ } }, 12000);
    } catch (e) { err("toast", e); }
  }
  function tellShipper(csid, co) {
    try {
      const K = caseOf(csid);
      const P = K && typeof v97fVolApplied === "function" ? v97fVolApplied(K.c, K.cs) : [];
      const note = typeof v97fVolNote === "function" ? v97fVolNote(P) : "";
      if (typeof v33RqForm !== "function") return;
      v33RqForm({ kind: "shipper", toCo: co, cs: csid });
      setTimeout(() => { try { const t = document.getElementById("rqnote"); if (t && !t.value) { t.value = note; v97fCnt2("tell"); } } catch (e) { err("tellnote", e); } }, 0);
    } catch (e) { err("tell", e); }
  }
  const v97fCnt2 = (k) => { try { V.n[k] = (V.n[k] || 0) + 1; } catch (e) { /* 無視 */ } };

  /* ─── 描き直しのたびに付ける ─────────────────────────────── */
  function paint() {
    try {
      if (!fwdOn()) return;
      const w = well();
      if (!w) return;
      const pg = page();
      if (pg === "frates") { paintMedRates(w); paintRatesTt(w); }
      else if (pg === "fagg") paintMedAgg(w);
      else if (pg === "fcase") paintCases(w);
      else if (pg === "finbox") paintInbox(w);
    } catch (e) { err("paint", e); }
  }
  function rerender() { try { const y = window.scrollY; if (typeof fwdRender === "function") fwdRender(); else paint(); window.scrollTo(0, y); } catch (e) { err("rerender", e); } }
  window.v97fRepaint = paint;
  if (typeof fwdRender === "function") {
    const __fr97r = fwdRender;
    fwdRender = function () { const o = __fr97r.apply(this, arguments); paint(); return o; };
  }
  try {
    let t = 0, mo = null;
    const w0 = well();
    if (w0) {
      mo = new MutationObserver(() => {
        if (t || !fwdOn()) return;
        t = setTimeout(() => { t = 0; paint(); try { mo.takeRecords(); } catch (e) { /* 無視 */ } }, 90);
      });
      mo.observe(w0, { childList: true, subtree: true });
    }
  } catch (e) { err("mo", e); }
  document.addEventListener("click", (ev) => {
    try {
      const t = ev.target && ev.target.closest && ev.target.closest("[data-v97vol],[data-v97tt]");
      if (!t) return;
      ev.preventDefault();
      if (t.dataset.v97tt === "bulk") { bulkSheet(); return; }
      const a = t.dataset.v97vol, csid = t.dataset.cs;
      if (a === "apply") applySheet(csid);
      else if (a === "undo") {
        let L = LAST[csid];
        if (!L || !L.length) { const K = caseOf(csid); L = K && typeof v97fVolApplied === "function" ? v97fVolApplied(K.c, K.cs) : []; }
        const n = typeof v97fVolUndoAll === "function" ? v97fVolUndoAll(L) : 0;
        LAST[csid] = [];
        document.querySelectorAll(".v97fvoltoast").forEach((x) => x.remove());
        try { if (typeof toast === "function") toast(n ? M("見積を荷主の共有の容積の金額に戻しました", "Back to the shipper's volume") : M("戻す見積がありません", "Nothing to undo")); } catch (e) { /* 無視 */ }
        rerender();
      } else if (a === "tell") tellShipper(csid, t.dataset.co || "");
    } catch (e) { err("click", e); }
  });
  try { if (typeof v30I18n === "function") v30I18n([["目安", "estimate", "参考", "estimado"], ["登録の日数", "registered", "已登记", "registrado"]]); } catch (e) { err("i18n", e); }
})();
