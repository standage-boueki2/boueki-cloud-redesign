/* 21.98 misc：刷新版の層（見せ方）。中身は logic_v2198misc.js（window.V98MISC）
   No.530 取り込みの %（商品情報の充足）と、貿易の旅程の全体 %（7ステップの平均）を言葉で分ける：
     ・現在地バー：「全体 N%」→「貿易の旅程 全体 N%（7ステップの平均）」。見出しの下に、7ステップの内訳（商品・国・規制・資料・商談・契約・出荷の %）と、
       取り込みの %（商品情報の充足 c/21）との違いを1行で（たたんでいるときは、乗せると出る説明に）。STEP 01 の説明と「？」の見方にも同じことを書く。
     ・商品情報・商品情報を登録の輪：見出しを「商品情報の充足度」にそろえ、札の「全体 c/d」を「全項目 c/d」に。輪の下に「旅程の STEP 01 の数・旅程の全体は N%」。
     ・ホーム：AI商社マンの成長（Lv と %）の札の「AI商社マンの成長」の言葉を見せる（旅程の % と別のものだと分かるように・CSS）。
   No.520 目安の無い COURIER の既定値：レート管理の行・比べる表・推奨・荷主の AI のレートの表・見積の画面に「日数は要確認（物流会社に確認）」。
   インラインの onclick・style は使わない（CSP）。外から来た文字はエスケープする。 */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || window.__v98miscRd) return;
  window.__v98miscRd = 1;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const M = (ja, en, zh, es) => (typeof v98mM === "function" ? v98mM(ja, en, zh, es) : ja);
  const E = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const err = (k, e) => { try { if (typeof v98mErr === "function") v98mErr("rd " + k, e); } catch (x) { /* 記録だけ */ } };
  const ten = () => { try { return typeof TEN !== "undefined" ? TEN : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const SH = () => [M("商品", "Product", "商品", "Producto"), M("国", "Country", "国家", "País"), M("規制", "Rules", "法规", "Normas"), M("資料", "Deck", "资料", "Material"), M("商談", "Deals", "商谈", "Negocios"), M("契約", "Contract", "合同", "Contrato"), M("出荷", "Shipping", "出货", "Envío")];

  /* ───── No.530 旅程の数（バーと同じ RD.jnyNow）と、商品情報の充足（v92prodFill） ───── */
  function jny() { try { return RD._jny || (RD.jnyNow ? RD.jnyNow() : null); } catch (e) { return null; } }
  function fill() { try { const t = ten(); return t && t.item && typeof v92prodFill === "function" ? v92prodFill(t) : null; } catch (e) { return null; } }
  function basis(R) {
    const K = fill();
    const sh = SH();
    const parts = R.S.map((s, i) => `${sh[i] || s.sh} ${s.pct}`);
    const sum = R.S.reduce((a, s) => a + s.pct, 0);
    const kTxt = K ? `${K.c}/${K.d}＝${K.pct}%` : `${R.S[0].n}/${R.S[0].m}＝${R.S[0].pct}%`;
    const kTxtE = K ? `${K.c}/${K.d} = ${K.pct}%` : `${R.S[0].n}/${R.S[0].m} = ${R.S[0].pct}%`;
    return {
      f: M(`全体 ${R.all}%＝7ステップの % の平均（${parts.join("・")}／合計 ${sum}÷7）`, `Overall ${R.all}% = average of the 7 steps (${parts.join(", ")}; total ${sum} ÷ 7)`, `整体 ${R.all}%＝7个步骤的平均（${parts.join("・")}／合计 ${sum}÷7）`, `Total ${R.all}% = promedio de los 7 pasos (${parts.join(", ")}; suma ${sum} ÷ 7)`),
      d: R.S[0].pct >= 100
        ? M(`取り込みの %（商品情報の充足 ${kTxt}）は STEP 01 だけの数です。全体は、国・規制・資料・商談・契約・出荷が進むと上がります。`, `The import % (product info ${kTxtE}) is only STEP 01. The overall % rises as country, rules, deck, deals, contract and shipping progress.`, `导入的 %（商品信息完整度 ${kTxt}）只是 STEP 01 的数。国家、法规、资料、商谈、合同、出货推进后，整体才会上升。`, `El % de importación (información del producto ${kTxtE}) es solo el PASO 01. El total sube al avanzar los demás pasos.`)
        : M(`取り込みの %（商品情報の充足 ${kTxt}）は STEP 01 だけの数で、全体は7ステップの平均なので、全体の % とは違います。`, `The import % (product info ${kTxtE}) is only STEP 01; the overall % is the average of the 7 steps, so they differ.`, `导入的 %（商品信息完整度 ${kTxt}）只是 STEP 01 的数，整体是7个步骤的平均，所以两者不同。`, `El % de importación (información del producto ${kTxtE}) es solo el PASO 01; el total es el promedio de los 7 pasos.`),
      sig: [R.all, sum, R.S.map((s) => s.pct).join(","), K ? K.c + "/" + K.d : "", typeof v98mLang === "function" ? v98mLang() : "ja"].join("|")
    };
  }
  function paintBar() {
    try {
      const bar = document.getElementById("rdjny");
      if (!bar) return;
      const R = jny();
      if (!R || !Array.isArray(R.S) || R.S.length !== 7) return;
      const B = basis(R);
      const min = !$(".k-jny-route", bar);
      const dh = $(".k-jny-det .k-jny-dh b", bar);
      const sig = B.sig + "|" + (min ? 1 : 0) + "|" + (dh ? dh.textContent : "") + "|" + ($(".k-jny-help", bar) ? 1 : 0);
      if (bar.dataset.v98m === sig && $(".v98m-jall", bar)) return;
      bar.dataset.v98m = sig;
      // 見出しの「全体 N%」
      const all = $(".k-jny-all", bar);
      if (all) {
        all.classList.add("v98m-jall");
        all.setAttribute("data-noi18n", "1");
        // 「（7ステップの平均）」は、たたんだとき（下の1行が無いとき）だけ見出しに出す（開いているときは下の1行に内訳ごと書く）
        all.innerHTML = `${E(M("貿易の旅程 全体", "Trade journey overall", "贸易旅程 整体", "Ruta comercial total"))} <b>${R.all}</b>%${min ? `<small class="v98m-avg">${E(M("（7ステップの平均）", " (avg. of 7 steps)", "（7个步骤的平均）", " (promedio de 7 pasos)"))}</small>` : ""}`;
        all.title = B.f + "\n" + B.d;
      }
      // 見出しの下の1行（7ステップの内訳と、取り込みの % との違い）
      let p = $(".v98m-jb", bar);
      if (min) { if (p) p.remove(); }
      else {
        if (!p) { p = document.createElement("p"); p.className = "v98m-jb"; p.setAttribute("data-noi18n", "1"); p.setAttribute("role", "note"); }
        const hd = $(".k-jny-hd", bar), help = $(".k-jny-help", bar);
        const after = help || hd;
        if (after && after.nextElementSibling !== p) after.after(p);
        p.innerHTML = `<b class="v98m-jbf">${E(B.f)}</b><span class="v98m-jbd">${E(B.d)}</span>`;
      }
      // STEP 01 の札の説明（乗せると出る）と、開いたときの説明
      const s1 = $('[data-jnys="0"]', bar);
      if (s1 && String(s1.title || "").indexOf("商品情報の充足度") < 0) s1.title = String(s1.title || "").replace(/。押すと/, "＝" + M("商品情報の充足度（取り込みの % と同じ数）", "product info completeness (same as the import %)") + "。押すと");
      const dn = $(".k-jny-det .k-jny-dn", bar);
      if (dn && /商品情報の21項目/.test(dn.textContent || "") && !dn.dataset.v98m) { dn.dataset.v98m = "1"; dn.textContent = String(dn.textContent).replace("「情報の充足度」と同じ数です", "「商品情報の充足度」（取り込みの %）と同じ数です。旅程の全体 % は、この STEP 01 を含む7ステップの平均です"); }
      const hp = $(".k-jny-help", bar);
      if (hp && !hp.dataset.v98m) { hp.dataset.v98m = "1"; hp.insertAdjacentHTML("beforeend", `<span class="v98m-jhelp" data-noi18n> ${E(M("取り込みの %（商品情報の充足度＝21項目のうち入っている数）は STEP 01 の数で、全体の % とは数え方が違います。", "The import % (product info completeness = items filled out of 21) is STEP 01 only; the overall % is counted differently."))}</span>`); }
    } catch (e) { err("bar", e); }
  }
  /* ───── 商品情報（item）・商品情報を登録（up）の輪 ───── */
  function ringNote(host, K) {
    const R = jny();
    if (!host || !K) return;
    let p = host.parentElement && host.parentElement.querySelector(":scope > .v98m-rn");
    const txt = M(`＝貿易の旅程の STEP 01「商品を整える」の数（取り込みの %）。旅程の全体${R ? " " + R.all + "%" : ""} は、7ステップの平均です（上の現在地バー）。`,
      `= STEP 01 “Prepare the product” of the trade journey (the import %). The journey's overall${R ? " " + R.all + "%" : ""} is the average of 7 steps (bar above).`,
      `＝贸易旅程 STEP 01「整理商品」的数（导入的 %）。旅程整体${R ? " " + R.all + "%" : ""} 是7个步骤的平均（上方的进度条）。`,
      `= PASO 01 de la ruta comercial (el % de importación). El total de la ruta${R ? " " + R.all + "%" : ""} es el promedio de 7 pasos.`);
    if (!p) { p = document.createElement("p"); p.className = "v98m-rn"; p.setAttribute("data-noi18n", "1"); host.after(p); }
    if (p.textContent !== txt) p.textContent = txt;
  }
  function swapText(root, re, to) {
    if (!root) return 0;
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n = 0, x;
    while ((x = tw.nextNode())) { if (re.test(x.nodeValue)) { x.nodeValue = x.nodeValue.replace(re, to); n++; } }
    return n;
  }
  function paintItem(w) {
    try {
      const K = fill();
      if (!K) return;
      const ring = $(".rd-p2 .k-ring", w) || $(".k-ring", w);
      if (!ring) return;
      const card = ring.closest("section") || w;
      const h2 = $$("h2", card).find((x) => /データの充足度|Data completeness/.test(x.textContent || ""));
      if (h2) { swapText(h2, /データの充足度（登録の項目）|データの充足度/, M("商品情報の充足度（登録の項目）", "Product info completeness (registered items)", "商品信息完整度（登记项目）", "Completitud de la información del producto")); swapText(h2, /Data completeness \(registered items\)|Data completeness/, M("商品情報の充足度（登録の項目）", "Product info completeness (registered items)")); h2.setAttribute("data-noi18n", "1"); }
      const tag = $$(".k-tag", card).find((x) => x.dataset.v90fill || /^全体 \d+\/\d+/.test((x.textContent || "").trim()));
      if (tag) { const t = M(`全項目 ${K.c}/${K.d}・必須 ${K.a}/${K.b}`, `All items ${K.c}/${K.d} · required ${K.a}/${K.b}`, `全部项目 ${K.c}/${K.d}・必填 ${K.a}/${K.b}`, `Todos ${K.c}/${K.d} · obligatorios ${K.a}/${K.b}`); if (tag.textContent !== t) tag.textContent = t; tag.setAttribute("data-noi18n", "1"); }
      ring.setAttribute("aria-label", M(`商品情報の充足 ${K.c}/${K.d}項目（${K.pct}%）`, `Product info ${K.c}/${K.d} items (${K.pct}%)`));
      const col = ring.closest("div[style*='border-left']") || ring.parentElement;
      swapText(col, /（全体 (\d+)件）/g, "（全 $1件）");
      const row = ring.parentElement && ring.parentElement !== col ? ring.parentElement : ring;
      ringNote(row, K);
    } catch (e) { err("item", e); }
  }
  function paintUp(w) {
    try {
      const K = fill();
      const box = $("[data-rdprod]", w);
      const ring = box && $(".rd-ring", box);
      if (!K || !ring) return;
      const hd = ring.parentElement ? $$("b", ring.parentElement).find((x) => /^\s*(情報の充足度|Info completeness)\s*$/.test(x.textContent || "")) : null;
      if (hd) { hd.textContent = M("商品情報の充足度", "Product info completeness", "商品信息完整度", "Completitud de la información del producto"); hd.setAttribute("data-noi18n", "1"); }
      const ul = ring.parentElement && $("ul.rd-ckl", ring.parentElement);
      if (ul) swapText(ul, /（全体 (\d+)）/g, "（全 $1項目）");
      const em = $(".rd-empty[data-v92prod-empty]", box);
      if (em) swapText(em, /全体 (\d+)\/(\d+)/, "全項目 $1/$2");
      ring.setAttribute("aria-label", M(`商品情報の充足 ${K.c}/${K.d}項目（${K.pct}%）`, `Product info ${K.c}/${K.d} items (${K.pct}%)`));
      ringNote(ul || ring, K);
    } catch (e) { err("up", e); }
  }
  const chain = (k, f) => { const p0 = RD.page[k]; RD.page[k] = (w, kk) => { if (p0) p0(w, kk); try { f(w, kk); } catch (e) { err("page " + k, e); } }; };
  chain("item", paintItem);
  chain("up", paintUp);
  /* バーは描き直し（RD.after・押したあと・5秒ごと）のたびに中身が入れ替わる → そのあとに付け直す（変わったときだけ） */
  const a0 = RD.after;
  RD.after = function () { const r = a0.apply(this, arguments); try { paintBar(); refreshRingNotes(); } catch (e) { err("after", e); } return r; };
  function refreshRingNotes() {
    try {
      const k = RD.curKey ? RD.curKey() : "";
      const w = $("#well");
      if (!w) return;
      if (k === "item" && !$(".v98m-rn", w)) paintItem(w);
      else if (k === "up" && !$(".v98m-rn", w)) paintUp(w);
      else { const p = $(".v98m-rn", w); const R = jny(); if (p && R && p.textContent.indexOf(R.all + "%") < 0) (k === "item" ? paintItem : paintUp)(w); }
    } catch (e) { err("rings", e); }
  }
  let mo = null, moBar = null;
  function watch() {
    try {
      const bar = document.getElementById("rdjny");
      if (bar && bar !== moBar) {
        if (mo) mo.disconnect();
        moBar = bar;
        mo = new MutationObserver(() => { if (!$(".v98m-jall", bar) || (!$(".k-jny-route", bar) === !!$(".v98m-jb", bar))) paintBar(); else if ($(".k-jny-help", bar) && !$(".v98m-jhelp", bar)) paintBar(); });
        mo.observe(bar, { childList: true });
        paintBar();
      }
    } catch (e) { err("watch", e); }
  }
  setInterval(() => { if (document.hidden) return; watch(); const bar = document.getElementById("rdjny"); if (bar && !$(".v98m-jall", bar)) paintBar(); }, 1000);
  document.addEventListener("click", (e) => { if (e.target && e.target.closest && e.target.closest("#rdjny")) setTimeout(paintBar, 30); }, true);

  /* ───── No.520 目安の無い COURIER の既定値（物流会社の画面・荷主の AI のレートの表） ───── */
  const UNK = () => M("日数は要確認", "days to be confirmed", "天数待确认", "días por confirmar");
  const UNKB = () => `<span class="v96ttb v97est v98m-unk" data-noi18n title="${E(M("この仕向地は国際宅配便の日数の目安がアプリに無く、登録の日数は空欄（既定値の10日）です。物流会社に実際の日数を確かめてください。", "No courier transit estimate for this destination and the registered days were blank (default 10). Ask the forwarder for the actual days."))}">${E(M("物流会社に確認", "ask the forwarder", "请向物流公司确认", "consultar al transitario"))}</span>`;
  function unkHtml(s) {
    return String(s).replace(/約\s*(\d+)\s*日(\s*(?:<br>)?\s*)?<span class="v96ttb(?![^"]*v97est)[^"]*"[^>]*>[^<]*<\/span>/g, (m0, d, gap) => `${E(UNK())}${gap && /<br>/.test(gap) ? "<br>" : " "}${UNKB()}`)
      .replace(/約\s*(\d+)\s*日（(既定値かも|既定値)）/g, () => `${E(UNK())} ${UNKB()}`);
  }
  if (typeof fwdCompareHtml === "function") {
    const __cm98 = fwdCompareHtml;
    fwdCompareHtml = function (r, l) { const s = __cm98.apply(this, arguments); try { if (typeof v98mUnkLeg === "function" && v98mUnkLeg(l)) return unkHtml(s); } catch (e) { err("cmp", e); } return s; }; // eslint-disable-line no-global-assign
  }
  if (typeof fwdRecHtml === "function") {
    const __rh98 = fwdRecHtml;
    fwdRecHtml = function (r, l) { const s = __rh98.apply(this, arguments); try { if (typeof v98mUnkLeg === "function" && v98mUnkLeg(l)) return unkHtml(s); } catch (e) { err("rec", e); } return s; }; // eslint-disable-line no-global-assign
  }
  if (typeof shipRateTbl === "function") {
    const __st98 = shipRateTbl;
    shipRateTbl = function (rows) { // eslint-disable-line no-global-assign
      const s = __st98.apply(this, arguments);
      try {
        const U = (rows || []).map((r) => (typeof v98mUnkRate === "function" ? v98mUnkRate(r) : false));
        if (!U.some(Boolean)) return s;
        const tp = document.createElement("template");
        tp.innerHTML = String(s);
        $$("tbody tr", tp.content).forEach((tr, i) => { if (!U[i]) return; const td = [...tr.children].find((x) => /約\s*\d+\s*日/.test(x.textContent || "")); if (td) td.innerHTML = unkHtml(td.innerHTML); });
        return tp.innerHTML;
      } catch (e) { err("shiptbl", e); return s; }
    };
  }
  /* 見積の画面（荷主・物流会社）：国ごとのカードの「約10日（既定値かも）」 */
  function paintDrawer(id) {
    try {
      const r = ((typeof FWDB !== "undefined" && FWDB && FWDB.reqs) || []).find((x) => x && x.id === id); // eslint-disable-line no-undef
      const body = document.querySelector(".dwbody");
      if (!r || !body || !Array.isArray(r.legs)) return;
      $$(".fwdleg", body).forEach((card) => {
        const b = card.querySelector("b"), cty = b && (b.textContent || "").trim();
        const l = r.legs.find((x) => x && x.cty === cty);
        if (!l || typeof v98mUnkLeg !== "function" || !v98mUnkLeg(l) || card.dataset.v98m) return;
        card.dataset.v98m = "1";
        $$(".v96ttb:not(.v97est)", card).forEach((bd) => { const p = bd.previousSibling; if (p && p.nodeType === 3) p.nodeValue = p.nodeValue.replace(/約\s*\d+\s*日\s*$/, UNK() + " "); bd.outerHTML = UNKB(); });
        swapText(card, /(所要\s*)?約\s*(\d+)\s*日（(既定値かも|既定値)）/g, UNK() + "（" + M("物流会社に確認", "ask the forwarder") + "）");
      });
    } catch (e) { err("drawer", e); }
  }
  ["v45OpenQuote", "openFwdQuote"].forEach((nm) => {
    try {
      const f = window[nm];
      if (typeof f !== "function") return;
      window[nm] = function (x) { const o = f.apply(this, arguments); try { const id = x && typeof x === "object" ? x.id : x; if (id) { paintDrawer(id); setTimeout(() => paintDrawer(id), 160); } } catch (e) { err(nm, e); } return o; };
    } catch (e) { err(nm + "0", e); }
  });
  /* レート管理の一覧：目安の無い COURIER の既定値の行に「見積・AI の答えでは：日数は要確認」 */
  function paintRates() {
    try {
      if (!(RD.isFwd && RD.isFwd())) return;
      const w = $("#well");
      const t = w && $$("table", w).find((x) => x.querySelector("tbody [data-frdel]"));
      if (!t) return;
      const R = (typeof FWDB !== "undefined" && FWDB && FWDB.rates) || []; // eslint-disable-line no-undef
      $$("tbody tr", t).forEach((tr) => {
        const del = tr.querySelector("[data-frdel]");
        if (!del) return;
        const r = R[+del.dataset.frdel];
        const td = [...tr.children].find((x) => /^\s*\d+\s*日/.test(x.textContent || ""));
        if (!td) return;
        const unk = typeof v98mUnkRate === "function" && v98mUnkRate(r);
        const has = td.querySelector(".v98m-unkn");
        if (unk && !has && !td.querySelector(".v97ttest")) td.insertAdjacentHTML("beforeend", `<span class="v97ttest v98m-unkn" data-noi18n title="${E(M("この仕向地は国際宅配便の日数の目安がアプリに無いため、見積・AI の答えでは「10日」と書かず「日数は要確認（物流会社に確認）」と出します。「日数を確かめる」で実際の日数を入れてください。", "No courier estimate for this destination, so quotes and AI answers say “days to be confirmed” instead of 10 days."))}">${E(M("見積・AI の答えでは：日数は要確認（物流会社に確認）", "Quotes/AI: days to be confirmed (ask the forwarder)"))}</span>`);
        else if (!unk && has) has.remove();
      });
    } catch (e) { err("rates", e); }
  }
  const a1 = RD.after;
  RD.after = function () { const r = a1.apply(this, arguments); try { paintRates(); } catch (e) { err("after2", e); } return r; };
  if (typeof fwdRender === "function") {
    const __fr98 = fwdRender;
    fwdRender = function () { const r = __fr98.apply(this, arguments); try { setTimeout(paintRates, 0); } catch (e) { err("fr", e); } return r; }; // eslint-disable-line no-global-assign
  }
  window.v98mRdPaint = function () { paintBar(); refreshRingNotes(); paintRates(); };
})();
