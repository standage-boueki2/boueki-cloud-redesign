/* 貿易クラウドAI商社マン 21.95 misc（刷新版の層）：見せ方だけ。数え方は本体の層 logic_v2195misc.js
   No.497 物流会社のホーム「AI自動回答率」＝そのまま出せる回答の割合（内訳と同じ数え方）
   No.498 相見積・AI推奨「レーン別の集計」：国名をそろえて出す（登録の表記は小さく残す）・運賃の「要確認」
   No.499 案件一覧（ホーム）：表示中の会社の案件で、タブ・ステータスの数・件数を数える。ほかの会社の案件は「すべての会社」で
   今のアプリの関数・刷新版の前の層は差し替えず、RDX.after・RDX.homeView を包むだけ。onclick= と style= は書かない。 */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v95misc) return;
  RD._v95misc = 1;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const I = (n, sz, sw) => { try { return RD.I ? RD.I(n, sz, sw) : ""; } catch (e) { return ""; } };
  const lang = () => { try { const el = document.getElementById("lang"); const v = String((el && el.value) || "ja"); return /^en/.test(v) ? "en" : /^zh/.test(v) ? "zh" : /^es/.test(v) ? "es" : "ja"; } catch (e) { return "ja"; } };
  const M = (ja, en) => (lang() === "ja" ? ja : en || ja);
  const fwd = () => { try { return !!(RD.isFwd && RD.isFwd()); } catch (e) { return false; } };
  const key = () => { try { return RD.curKey ? RD.curKey() : ""; } catch (e) { return ""; } };
  const ls = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* 無視 */ } } };
  const err = (k, e) => { try { console.error("[rd] v95misc " + k, e); } catch (x) { /* 無視 */ } };
  const yen = (n) => "¥" + Math.round(+n || 0).toLocaleString("ja-JP");
  RD.v95misc = { auto: 0, lane: 0, scope: 0 };

  /* ───── No.497 AI自動回答率 ───── */
  function fixAuto() {
    const t = $('#well [data-rdtile="1"]'); if (!t) return;
    const b = $("b", t); if (!b || !/AI自動回答率|AI auto-answer rate/.test(b.textContent || "")) return;
    const A = typeof window.v95miscAutoRate === "function" ? window.v95miscAutoRate() : null; if (!A || !A.recv) return;
    const box = b.parentElement;
    const tn = $(".rd-tn", t);
    const num = `${A.rate}<small>%</small>`;
    if (tn && (tn.textContent || "").replace(/\s/g, "") !== A.rate + "%") { tn.innerHTML = num; tn.dataset.v95 = String(A.rate); }
    let s1 = $$(".rd-ts", t).find((x) => !x.classList.contains("v90fautos") && !x.classList.contains("v95auto2"));
    if (!s1) { s1 = document.createElement("span"); s1.className = "rd-ts"; (tn || b).after(s1); }
    const t1 = M(`そのまま出せる ${A.clean} / ${A.recv}件`, `Ready as is: ${A.clean} / ${A.recv}`);
    if (s1.textContent !== t1) { s1.textContent = t1; s1.setAttribute("data-noi18n", ""); s1.classList.add("v95auto1"); }
    let s2 = $(".v90fautos", t) || $(".v95auto2", t);
    if (!s2) { s2 = document.createElement("span"); s2.className = "rd-ts v95auto2"; s1.after(s2); }
    const t2 = !A.auto ? M("AIが答えた依頼はまだありません", "No AI answers yet")
      : A.warn ? M(`AI回答 ${A.auto}件のうち 要確認 ${A.warn}件`, `${A.warn} of ${A.auto} AI answers need checking`)
        : M(`AI回答 ${A.auto}件は すべて有効なレート`, `All ${A.auto} AI answers use valid rates`);
    if (s2.textContent !== t2) { s2.textContent = t2; s2.setAttribute("data-noi18n", ""); }
    s2.classList.add("v95auto2"); s2.classList.toggle("v95warn", !!A.warn);
    const tip = M(`AI自動回答率＝そのまま荷主に出せる回答（有効なレート・依頼の仕出港どおり）÷ 受信した見積依頼。AI が金額を出した ${A.auto}件（${A.rateAll}%）のうち、期限切れ・仕出港違いのレートを含む ${A.warn}件は、荷主に出す前に確かめるので数えません`,
      "AI auto-answer rate = answers ready to send as is (valid rate, matching origin port) ÷ requests received");
    if (t.title !== tip) t.title = tip;
    if (box) box.setAttribute("data-noi18n", "");
    RD.v95misc.auto++;
  }

  /* ───── No.498 レーン別の集計 ───── */
  function fixLanes() {
    const h = $$("#well h3").find((x) => /^(レーン別の集計とAI物流マンの推奨|Lane summary & AI pick)/.test((x.textContent || "").trim())); if (!h) return;
    const card = h.closest(".c") || h.parentElement; const tb = card && $("table tbody", card); if (!tb) return;
    const std = typeof window.v95miscCtyStd === "function" ? window.v95miscCtyStd : null; if (!std) return;
    let F = null;
    $$(":scope > tr", tb).forEach((tr) => {
      if (tr.dataset.v95) return;
      const td = tr.cells[0]; if (!td) return;
      const b = $("b", td); if (!b) return;
      const pod = (b.textContent || "").trim();
      const pm = $(".p", td); const mode = ((pm && pm.textContent) || "").trim().toUpperCase();
      const cs = Array.from(td.children).find((x) => x.tagName === "SPAN" && !x.classList.contains("p") && !x.classList.contains("k-v95raw"));
      tr.dataset.v95 = "1"; tr.dataset.v95pod = pod;
      if (cs) {
        const S = std((cs.textContent || "").trim());
        if (S.changed) { cs.textContent = S.std; cs.title = M("登録の表記：", "As registered: ") + S.raw; }
        tr.dataset.v95cty = S.std;
      } else {
        const S = std(pod);
        tr.dataset.v95cty = S.std;
        if (S.changed) {
          b.textContent = S.std;
          const r = document.createElement("span"); r.className = "k-v95raw"; r.setAttribute("data-noi18n", "");
          r.textContent = M("登録の表記：", "As registered: ") + S.raw; r.title = M("物流レート管理に登録したときの書き方です（データはそのまま）。国名は同じ書き方にそろえて出しています", "As written in the rate table; the country name is shown in a common form");
          b.after(r);
        }
      }
      if (!F) F = typeof window.v95miscLaneFlags === "function" ? window.v95miscLaneFlags() : {};
      const f = F[pod + "|" + mode]; if (!f) return;
      const cell = tr.cells[2] || td;
      const box = document.createElement("div"); box.className = "k-v95lchk"; box.setAttribute("data-noi18n", ""); box.setAttribute("role", "note");
      const u = f.unit || "";
      const L = f.flags.map((x) => x.t === "out"
        ? M(`運賃 ${yen(x.p)}${u} が、同じ輸送の形（${f.mode}）の有効なレートの中央値 ${yen(x.med)}${u} の約${x.x}倍です。単位（m³・本・kg）や桁の入れ間違いがないか確かめてください`, `${yen(x.p)}${u} is about ${x.x}× the ${f.mode} median (${yen(x.med)}${u}). Check the unit and digits`)
        : M(`同じ運賃 ${yen(x.p)}${u} が ${x.n}か国（${x.cs.slice(0, 5).join("・")}${x.n > 5 ? " ほか" : ""}）で同じです。料金表の地域の区分（ゾーン）どおりなら問題ありません`, `The same ${yen(x.p)}${u} is used for ${x.n} countries. Fine if it follows the rate zones`));
      box.innerHTML = `<b class="k-v95lbad">${I("alert", 13, 2.4)}${esc(M("要確認", "Check"))}</b><span>${L.map(esc).join("<br>")}</span><button type="button" class="k-link k-v95lgo">${esc(M("レート管理で確かめる", "Check in rate table"))}</button><small>${esc(M("推奨・見積の計算はそのままです（データは書き換えていません）", "Recommendations are unchanged"))}</small>`;
      $(".k-v95lgo", box).addEventListener("click", (e) => { e.stopPropagation(); try { RD.goKey("frates"); } catch (x) { err("go", x); } });
      cell.appendChild(box);
      tr.classList.add("k-v95lrow");
      RD.v95misc.lane++;
    });
  }

  /* ───── No.499 案件一覧：表示中の会社で数える ───── */
  const SC_KEY = "rd_v95clsc";
  const scope = () => (ls.get(SC_KEY, "co") === "all" ? "all" : "co");
  const tensAll = () => { try { return typeof TENS !== "undefined" && Array.isArray(TENS) ? TENS : []; } catch (e) { return []; } }; // eslint-disable-line no-undef
  const curTen = () => { try { return RD.G ? RD.G("TEN") : (typeof TEN !== "undefined" ? TEN : null); } catch (e) { return null; } }; // eslint-disable-line no-undef
  const coOf = (t) => { try { return t ? (typeof tenCoOf === "function" ? tenCoOf(t) : String(t.co || "").trim()) : ""; } catch (e) { return ""; } }; // eslint-disable-line no-undef
  const isSmpT = (t) => !!t && (t.src === "sample2" || t.src === "demo" || t.kind === "demo");
  function countAll() {
    const T = tensAll(), t0 = curTen(), co0 = coOf(t0);
    let L = []; try { L = typeof RD.allCases === "function" ? RD.allCases() || [] : []; } catch (e) { L = []; }
    const mineL = L.filter((c) => coOf(T[c.pi] || (c.pi < 0 ? t0 : null)) === co0);
    return { co0, inList: T.indexOf(t0) >= 0, all: L.length, mine: mineL.length, others: L.length - mineL.length, smpMine: mineL.filter((c) => isSmpT(c.t)).length };
  }
  if (typeof RD.homeView === "function") {
    const hv = RD.homeView;
    RD.homeView = function (w) {
      let C = null; const sw = [];
      try {
        C = countAll();
        if (scope() === "co" && C.inList && C.co0 && C.others > 0) {
          tensAll().forEach((t) => { if (t && coOf(t) !== C.co0 && t.dmThreads && typeof t.dmThreads === "object" && Object.keys(t.dmThreads).length) { sw.push([t, t.dmThreads]); t.dmThreads = {}; } });
        }
      } catch (e) { err("hv0", e); }
      let r;
      try { r = hv.apply(this, arguments); } finally { sw.forEach((x) => { x[0].dmThreads = x[1]; }); }
      try { scopeBar(w, C, sw.length > 0); } catch (e) { err("bar", e); }
      return r;
    };
  }
  function scopeBar(w, C, swapped) {
    const box = $(".k-cl[data-kcl]", w || document); if (!box || !C) return;
    const card = $(".k-clcard", box); if (!card) return;
    let bar = $(".k-v95sc", card);
    const sc = scope();
    box.classList.toggle("k-v95co", sc === "co" && swapped);
    if (!(C.inList && C.co0 && C.others > 0)) { if (bar) bar.remove(); return; }
    const t = sc === "co"
      ? (C.mine ? M(`表示中の「${C.co0}」の案件 ${C.mine}件で数えています（ほかの会社の案件 ${C.others}件は「すべての会社」で見られます）`, `Showing ${C.mine} cases of “${C.co0}” (${C.others} more in other companies)`)
        : M(`表示中の「${C.co0}」の案件は、まだありません。ほかの会社の案件 ${C.others}件は「すべての会社」で見られます`, `No cases yet for “${C.co0}”. ${C.others} cases in other companies`))
      + (C.smpMine ? M(`（うち見本（架空）の商品の案件 ${C.smpMine}件）`, "") : "")
      : M(`このアカウントのすべての会社の案件 ${C.all}件で数えています（表示中の「${C.co0}」：${C.mine}件）`, `Counting all ${C.all} cases in this account (“${C.co0}”: ${C.mine})`);
    const html = `<div class="k-v95scb" role="group" aria-label="${esc(M("案件の範囲", "Case scope"))}">
        <button type="button" class="k-v95scx ${sc === "co" ? "on" : ""}" aria-pressed="${sc === "co"}" data-v95sc="co">${I("bldg", 15, 2.2)}<span>${esc(M("表示中の会社", "This company"))}</span><b>${C.mine}</b></button>
        <button type="button" class="k-v95scx ${sc === "all" ? "on" : ""}" aria-pressed="${sc === "all"}" data-v95sc="all">${I("list", 15, 2.2)}<span>${esc(M("すべての会社", "All companies"))}</span><b>${C.all}</b></button></div>
      <p class="k-v95scn">${esc(t)}</p>`;
    if (!bar) { bar = document.createElement("div"); bar.className = "k-v95sc"; bar.setAttribute("data-noi18n", ""); card.prepend(bar); }
    if (bar.dataset.h !== html) {
      bar.innerHTML = html; bar.dataset.h = html;
      $$("[data-v95sc]", bar).forEach((b) => b.addEventListener("click", (e) => {
        e.stopPropagation();
        const v = b.dataset.v95sc; if (v === scope()) return;
        ls.set(SC_KEY, v);
        const y = window.scrollY;
        try { RD.goKey(key() || "dash:home"); } catch (x) { err("re", x); }
        try { window.scrollTo(0, y); } catch (x) { /* 無視 */ }
        RD.v95misc.scope++;
      }));
    }
  }
  RD.v95clScope = scope;

  /* ───── いつ直すか：画面を描いたあと（RD.after）と、#well の中が変わったとき（物流会社のホームは見張りが後から描く） ───── */
  function run() {
    try {
      if (fwd()) {
        const k = key();
        if (k === "fhome") fixAuto();
        else if (k === "fagg") fixLanes();
      }
    } catch (e) { err("run", e); }
  }
  const a0 = RD.after;
  RD.after = function () { const r = a0.apply(this, arguments); run(); return r; };
  let tm = 0;
  try {
    new MutationObserver((ms) => {
      if (!fwd()) return;
      if (ms.every((m) => m.target && m.target.closest && m.target.closest(".k-v95lchk, .v95auto1, .v95auto2"))) return;
      clearTimeout(tm); tm = setTimeout(run, 60);
    }).observe(document.getElementById("well") || document.body, { childList: true, subtree: true });
  } catch (e) { err("mo", e); }
  setTimeout(run, 0);
})();
