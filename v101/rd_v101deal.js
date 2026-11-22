/* 22.01 deal：刷新版の見せ方。中身は logic_v2201deal.js（window.V101DEAL）
   No.609 STEP06 と商談・バイヤーへの橋渡し
     ・現在地バー（rd_v94jny.js は閉じた関数 stepsNow() の答えを RDX._jny に入れてから描く）：RDX._jny に入る時と RDX.jnyNow で、
       STEP05 の「連絡する」と STEP06（6項目）を V101DEAL.fixR で差し替える（v100 flow の STEP03・STEP04 の差し替えの外側から包む。
       どちらが先に効いても、いまここ・抜け・次の一手は同じ手順で数え直す）。STEP06 の項目は押すと、相手を選ぶ窓か見積・条件の下書きの窓が開く。
     ・バイヤーの画面：「選択中のバイヤー」に、AI バイヤーリストでチェックした会社（1社なら詳しく・複数なら一覧）を出し、
       「＋ 商談の相手に加える（送りません）」「見積・条件の下書き」を押せるように。リストの各行の「状態・次の一手」の欄に、
       商談の相手かどうかと「＋ 商談の相手に加える」（行の印は data-v101-deal-*。文面のボタン・件数・署名・公式サイトは buyer の担当）。
     ・「商談・バイヤー」の画面：一覧の上に「見積を出す相手と下書き（送る前）」の箱（相手の数・下書き・AI バイヤーリストのまだ加えていない会社）。
       一覧の行に「送る前」「見積の下書き」の札。
     ・案件（ホーム）：案件がまだ無いとき、商談の相手（送る前）と下書きの数を1行で（案件は連絡すると相手ごとにできる）。
   No.533 の副作用：カテゴリーを変えて STEP03 の項目の数が変わったら、バーの下に理由を1行（知らせも1回）。
   成長度：バーの見出しに「AI商社マンの成長度 N%（Lv.n 段階）」（押すと AI商社マンの画面）。ホームの札の名前も「成長度」に。
   インラインの onclick・style は使わない（CSP）。外から来た文字はエスケープする。新しい文言は日・英・中・西（data-noi18n）。
   ── 22.01.1 ──
   S1：キー "v101:dims"（logic の「次は 寸法・重量を入れる」の行き先）を RDX.goKey で受け、書類をつくるの寸法・重量の欄（hear の .v101dim）へ移して最初の欄に入れる所を置く
   S2：選択中のバイヤーのボタン・状態を折り返して全文を見せる（css）
   S5：「商流を決める」の窓（相手ごと・送らない）・「受注する」の窓（受注したら「商談を記録する」で「取引中」）
   N12：見積の文面は欄で直せる。「文面をコピー」は【】・仮の値が残る間はその場で知らせ（role=alert）、押すと必ずその場に「コピーしました／できませんでした」（role=status） */
(function () {
  "use strict";
  const RD = window.RDX;
  const V = window.V101DEAL;
  if (!RD || !V || window.__v101dealRd) return;
  window.__v101dealRd = 1;
  const W = window;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const M = V.M, F = V.F;
  const E = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const err = (k, e) => { try { V.e("rd " + k, e); } catch (x) { /* 記録だけ */ } };
  const ten = () => { try { return typeof TEN !== "undefined" ? TEN : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const curKey = () => { try { return RD.curKey ? RD.curKey() : ""; } catch (e) { return ""; } };
  const vis = (el) => !!(el && (el.offsetWidth || el.offsetHeight || el.getClientRects().length));
  const I = (n, sz, sw) => { try { return RD.I ? RD.I(n, sz, sw) : ""; } catch (e) { return ""; } };
  const toast = (s) => { try { const t = RD.G ? RD.G("toast") : (typeof W.toast === "function" ? W.toast : null); if (typeof t === "function") t(s); } catch (e) { /* 無視 */ } };
  const repaint = () => { try { if (RD.jnyPaint) RD.jnyPaint(true); } catch (e) { /* 無視 */ } };
  const shipper = () => { try { return !RD.locked() && !RD.isFwd() && !!ten(); } catch (e) { return false; } };
  const hhmm = () => { const d = new Date(); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };

  /* ══════ 現在地バー：STEP05・STEP06 を実態に（v100 flow の STEP03・STEP04 の差し替えの外側から） ══════ */
  function post(R) {
    try { const s3 = R && R.S && R.S[2]; const c = V.catSeen(s3); if (c) { toast(V.catText(c)); } } catch (e) { err("post", e); }
    try { queueMicrotask(decoBar); } catch (e) { setTimeout(decoBar, 0); }
  }
  try {
    const d0 = Object.getOwnPropertyDescriptor(RD, "_jny");
    let cur = d0 && "value" in d0 ? d0.value : undefined;
    if (!d0 || d0.configurable) {
      Object.defineProperty(RD, "_jny", {
        configurable: true, enumerable: true,
        get() { return d0 && d0.get ? d0.get.call(RD) : cur; },
        set(v) {
          try { V.fixR(v, false); } catch (e) { err("fixR", e); }
          if (d0 && d0.set) d0.set.call(RD, v); else cur = v;
          // 下の層（v100 flow）が数え直さない版でも、いまここ・抜け・次の一手を同じ手順で
          try { if (v && !v.v100) V.recompute(v); } catch (e) { err("recompute", e); }
          post(v);
        },
      });
      if (cur) { try { V.fixR(cur, true); } catch (e) { /* 無視 */ } }
    }
  } catch (e) { err("defJny", e); }
  if (typeof RD.jnyNow === "function" && !RD.jnyNow.__v101deal) {
    const j0 = RD.jnyNow;
    RD.jnyNow = function () { const R = j0.apply(this, arguments); try { V.fixR(R, true); } catch (e) { err("jnyNow", e); } return R; };
    RD.jnyNow.__v101deal = 1;
  }

  /* ══════ バーの飾り：成長度の札・カテゴリーを変えたときの理由 ══════ */
  function growHtml() {
    const g = V.grow(); if (!g) return "";
    const tip = F(M("AI商社マンの成長度（成長レベル）：{p}%・Lv.{l} {s}。一人前は {pro}% 以上（必須の情報がそろうこと）。押すと AI商社マンの画面で内訳と次の一手を見られます", "AI trade agent growth: {p}% (Lv.{l} {s}). Fully trained at {pro}% or more. Press to see the breakdown."), { p: g.pct, l: g.lv, s: g.stage, pro: g.pro });
    return `<button type="button" class="v101d-grow" data-v101-deal-grow="1" title="${E(tip)}" aria-label="${E(tip)}" data-noi18n><span class="v101d-growl">${E(M("AI商社マンの成長度", "AI agent growth", "AI商社成长度", "Crecimiento del agente"))}</span><b>${g.pct}%</b><span class="v101d-grows">${E("Lv." + g.lv + " " + g.stage + M("・一人前 " + g.pro + "%", " · full " + g.pro + "%"))}</span></button>`;
  }
  function decoBar() {
    try {
      const bar = document.getElementById("rdjny"); if (!bar) return;
      const hd = $(".k-jny-hd", bar);
      if (hd) {
        const h = growHtml();
        let gb = $("[data-v101-deal-grow]", hd);
        if (!h) { if (gb) gb.remove(); }
        else if (!gb || gb.__h !== h) {
          if (gb) gb.remove();
          const tools = $(".k-jny-tools", hd);
          const tmp = document.createElement("span"); tmp.innerHTML = h; gb = tmp.firstElementChild; gb.__h = h;
          if (tools) hd.insertBefore(gb, tools); else hd.appendChild(gb);
        }
      }
      // カテゴリーを変えた理由（100% に戻るか閉じるまで）
      const t = ten();
      const c = t && t.v101catChg;
      let nb = $("[data-v101-deal-cat]", bar);
      const dismissed = c && t.v101catX === c.at;
      if (!c || dismissed) { if (nb) nb.remove(); }
      else {
        const txt = V.catText(c);
        if (!nb || nb.__t !== txt) {
          if (nb) nb.remove();
          nb = document.createElement("div"); nb.className = "v101d-cat"; nb.setAttribute("data-v101-deal-cat", "1"); nb.setAttribute("role", "status"); nb.setAttribute("data-noi18n", "1"); nb.__t = txt;
          nb.innerHTML = `<span class="v101d-catt">${E(txt)}</span><button type="button" class="btn g" data-v101-deal-catgo="1">${E(M("規制の確かめへ（STEP 03）", "Go to STEP 03", "前往 STEP 03", "Ir al PASO 03"))}</button><button type="button" class="v101d-x" data-v101-deal-catx="1" aria-label="${E(M("この知らせを閉じる", "Close"))}">×</button>`;
          const hd2 = $(".k-jny-hd", bar);
          if (hd2 && hd2.nextSibling) bar.insertBefore(nb, hd2.nextSibling); else bar.appendChild(nb);
        }
      }
      // STEP06 の項目の一覧に、何をすれば進むか（項目は 〔状態〕つき。下書きは「送った」に数えない）
      const det = $(".k-jny-det", bar);
      if (det && /STEP 6\b|STEP 6 /.test(det.getAttribute("aria-label") || "") && !$("[data-v101-deal-det]", det)) {
        const R = RD._jny; const s6 = R && R.S ? R.S[5] : null;
        if (s6 && s6.v101) {
          const p = document.createElement("p"); p.className = "v101d-det"; p.setAttribute("data-v101-deal-det", "1"); p.setAttribute("data-noi18n", "1");
          p.textContent = F(M("いま：商談の相手 {p}社（送った {s}社）・見積の下書き {d}件・送信済み {q}。下書きを保存しても相手には届きません（「送った」に数えません）。", "Now: {p} partner(s) ({s} contacted), {d} draft(s), sent: {q}. Saving a draft sends nothing."), { p: s6.nP, s: s6.nS, d: s6.nD, q: s6.quoteSent ? M("あり", "yes") : M("なし", "no") });
          const ul = $(".k-jny-ul", det) || $(".k-jny-ok", det);
          if (ul) det.insertBefore(p, ul); else det.appendChild(p);
        }
      }
    } catch (e) { err("decoBar", e); }
  }
  V.decoBar = decoBar;
  document.addEventListener("click", (e) => {
    const g = e.target && e.target.closest && e.target.closest("[data-v101-deal-grow]");
    if (g) { e.preventDefault(); e.stopPropagation(); try { RD.goKey("ai"); } catch (x) { /* 無視 */ } return; }
    const cg = e.target && e.target.closest && e.target.closest("[data-v101-deal-catgo]");
    if (cg) { e.preventDefault(); e.stopPropagation(); try { RD.goKey("ops:reg"); setTimeout(() => { const x = document.getElementById("v100fReg"); if (x) try { x.scrollIntoView({ block: "center" }); } catch (y) { /* 無視 */ } }, 900); } catch (x) { /* 無視 */ } return; }
    const cx = e.target && e.target.closest && e.target.closest("[data-v101-deal-catx]");
    if (cx) { e.preventDefault(); e.stopPropagation(); const t = ten(); if (t && t.v101catChg) t.v101catX = t.v101catChg.at; const nb = cx.closest("[data-v101-deal-cat]"); if (nb) nb.remove(); }
  }, true);
  try { const mo = new MutationObserver(() => { if (mo._t) return; mo._t = setTimeout(() => { mo._t = 0; decoBar(); }, 60); }); const st = () => { const m = document.querySelector(".main") || document.body; mo.observe(m, { childList: true, subtree: false }); const b = document.getElementById("rdjny"); if (b && !b.__v101mo) { b.__v101mo = 1; mo.observe(b, { childList: true }); } }; st(); setInterval(() => { const b = document.getElementById("rdjny"); if (b && !b.__v101mo) { b.__v101mo = 1; mo.observe(b, { childList: true }); decoBar(); } }, 1500); } catch (e) { err("barMo", e); }

  /* ══════ 窓（相手を選ぶ・見積・条件の下書き）：アプリの右の窓（#dw・role=dialog）を使う ══════ */
  function openWin(label, html, bind) {
    try {
      if (typeof openDW === "function") openDW(html); // eslint-disable-line no-undef
      else return false;
      const dw = document.getElementById("dw");
      if (dw) { if (!dw.__v101lab) dw.__v101lab = dw.getAttribute("aria-label") || "詳細"; dw.setAttribute("aria-label", label); }
      const pn = document.getElementById("pn");
      if (pn && bind) bind(pn);
      if (pn) { const h = $("h3", pn); if (h) { h.setAttribute("tabindex", "-1"); try { h.focus({ preventScroll: true }); } catch (x) { /* 無視 */ } } }
      return true;
    } catch (e) { err("openWin", e); return false; }
  }
  try { const dwo = new MutationObserver(() => { const dw = document.getElementById("dw"); if (dw && dw.dataset.open !== "true" && dw.__v101lab) { dw.setAttribute("aria-label", dw.__v101lab); } }); const s = () => { const dw = document.getElementById("dw"); if (dw) dwo.observe(dw, { attributes: true, attributeFilter: ["data-open"] }); else setTimeout(s, 500); }; s(); } catch (e) { /* 無視 */ }
  const closeWin = () => { try { if (typeof closeDW === "function") closeDW(); } catch (e) { /* 無視 */ } }; // eslint-disable-line no-undef
  const after = () => { repaint(); setTimeout(() => { paintDb(); paintDeal(); paintHome(); }, 60); };

  // 相手を選ぶ窓（送りません）。then＝加えたあとに見積の下書きの窓を開く
  function pickWin(then) {
    const t = ten(); if (!t) return;
    const P = V.partners(t), C = V.candidates(t), info = V.listInfo(t);
    const rows = C.map((c) => `<li><label class="v101d-pk"><input type="checkbox" data-v101-deal-pk="${E(c.id)}"> <b data-noi18n>${E(c.name)}</b><span class="v101d-pks" data-noi18n>${E([c.cty, c.biz, c.rank ? M("見込み ", "fit ") + c.rank + (c.pts != null ? "（" + c.pts + M("点", " pts") + "）" : "") : ""].filter(Boolean).join("・"))}</span>${c.smp ? `<em class="v101d-tag">${E(M("見本（架空）", "sample"))}</em>` : c.verify ? `<em class="v101d-tag">${E(M("要確認", "to check"))}</em>` : ""}</label></li>`).join("");
    const have = P.length ? `<p class="v101d-have"><b>${E(F(M("いまの商談の相手：{n}社", "Current partners: {n}"), { n: P.length }))}</b> <span data-noi18n>${E(P.slice(0, 6).map((p) => p.name + (p.sent ? M("（送信済み）", " (contacted)") : M("（送る前）", " (not sent)"))).join("、") + (P.length > 6 ? "…" : ""))}</span></p>` : "";
    const body = C.length
      ? `<p class="nn">${E(F(M("AIバイヤーリスト（{c}・{n}社）から、見積を出す相手を選んでください。選んだ会社は「商談・バイヤー」の一覧に入ります。メールは送りません（送るのは、リストの各行の文面を確かめてから）。", "Pick buyers from the AI buyer list ({c}, {n}). They are added to “Deals & buyers”. Nothing is sent."), { c: info ? info.cty : "", n: info ? info.n : C.length }))}</p>
         <div class="v101d-pkbar"><button type="button" class="btn g" data-v101-deal-pkall="1">${E(M("すべて選ぶ", "Select all"))}</button><span class="v101d-pkn" role="status" data-v101-deal-pkn="1">${E(M("0社を選んでいます", "0 selected"))}</span></div>
         <ul class="v101d-pkl">${rows}</ul>
         <div class="rw v101d-btns"><button type="button" class="btn" data-v101-deal-pkgo="1" disabled>${E(then ? M("選んだ会社を商談の相手に加えて、見積の下書きへ（送りません）", "Add and draft a quote (nothing is sent)") : M("選んだ会社を商談の相手に加える（送りません）", "Add as deal partners (nothing is sent)"))}</button><button type="button" class="btn g" data-v101-deal-x="1">${E(M("やめる", "Cancel"))}</button></div>`
      : (info
        ? `<p class="nn">${E(F(M("AIバイヤーリスト（{c}・{n}社）の会社は、すべて商談の相手に入っています。別の国・業態の相手は、「AIバイヤー開拓」でリストを作り直すと選べます。", "All companies in the AI buyer list ({c}) are already partners."), { c: info.cty, n: info.n }))}</p>`
        : `<p class="nn">${E(M("まだ AIバイヤーリストがありません。見積を出す相手は、AIバイヤーリスト（国・業態を決めると AI が作ります）か、自社のバイヤーの登録から選べます。", "There is no AI buyer list yet. Make one, or register your own buyer."))}</p>`)
        + `<div class="rw v101d-btns">${P.length ? `<button type="button" class="btn" data-v101-deal-toq="1">${E(M("見積・条件の下書きへ", "Go to the quote draft"))}</button>` : ""}<button type="button" class="btn${P.length ? " g" : ""}" data-v101-deal-tolist="1">${E(info ? M("AIバイヤーリストを作り直す（条件を決める）", "Rebuild the AI buyer list") : M("AIバイヤーリストを作る（条件を決める）", "Make the AI buyer list"))}</button><button type="button" class="btn g" data-v101-deal-own="1">${E(M("自社のバイヤーを登録する", "Register your own buyer"))}</button><button type="button" class="btn g" data-v101-deal-x="1">${E(M("閉じる", "Close"))}</button></div>`;
    openWin(M("見積を出す相手を選ぶ", "Choose the buyer to quote"), `<div class="v101d-win" data-v101-deal-win="pick" data-noi18n><h3>${E(M("見積を出す相手を選ぶ（送りません）", "Choose who to quote (nothing is sent)", "选择报价对象（不发送）", "Elegir a quién cotizar (no se envía)"))}</h3>${have}${body}</div>`, (pn) => {
      const cnt = () => { const n = $$("[data-v101-deal-pk]", pn).filter((x) => x.checked).length; const g = $("[data-v101-deal-pkgo]", pn); if (g) g.disabled = !n; const s = $("[data-v101-deal-pkn]", pn); if (s) s.textContent = F(M("{n}社を選んでいます", "{n} selected"), { n }); };
      $$("[data-v101-deal-pk]", pn).forEach((x) => x.addEventListener("change", cnt));
      const all = $("[data-v101-deal-pkall]", pn); if (all) all.addEventListener("click", () => { const L = $$("[data-v101-deal-pk]", pn); const on = !L.every((x) => x.checked); L.forEach((x) => { x.checked = on; }); cnt(); });
      const go = $("[data-v101-deal-pkgo]", pn);
      if (go) go.addEventListener("click", () => {
        const ids = $$("[data-v101-deal-pk]", pn).filter((x) => x.checked).map((x) => x.getAttribute("data-v101-deal-pk"));
        const res = ids.map((id) => W.v101addDealBuyer(ten(), id)).filter((r) => r && r.ok);
        toast(F(M("{n}社を商談の相手に加えました（送っていません）。「商談・バイヤー」の一覧に出ます", "Added {n} partner(s) (nothing sent)"), { n: res.length }));
        after();
        if (then && res.length) setTimeout(() => quoteWin(res[0].id), 120); else pickWin(false);
      });
      const toq = $("[data-v101-deal-toq]", pn); if (toq) toq.addEventListener("click", () => quoteWin());
      const tl = $("[data-v101-deal-tolist]", pn); if (tl) tl.addEventListener("click", () => { closeWin(); goList(); });
      const own = $("[data-v101-deal-own]", pn); if (own) own.addEventListener("click", () => { closeWin(); try { RD.goKey("deal"); setTimeout(() => { try { if (typeof b30Add === "function") b30Add(); } catch (x) { /* 無視 */ } }, 700); } catch (x) { /* 無視 */ } }); // eslint-disable-line no-undef
      $$("[data-v101-deal-x]", pn).forEach((b) => b.addEventListener("click", closeWin));
    });
  }
  function goList() {
    try {
      const fx = () => { const f = document.getElementById("v71obGo") || document.getElementById("v71ob"); if (f) { try { f.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (x) { f.scrollIntoView(); } f.classList.add("v101d-hit"); setTimeout(() => f.classList.remove("v101d-hit"), 3000); } };
      if (curKey() !== "db") { RD.goKey("db"); setTimeout(fx, 900); } else fx();
    } catch (e) { err("goList", e); }
  }
  const CURS = ["USD", "JPY", "EUR", "CNY", "HKD", "SGD", "TWD", "THB", "AUD", "GBP"];
  // 見積・条件の下書きの窓（送りません）
  function quoteWin(pid) {
    const t = ten(); if (!t) return;
    const P = V.partners(t);
    if (!P.length) { pickWin(true); return; }
    let p = P.find((x) => x.id === pid) || P.find((x) => !x.q) || P[0];
    const Q = p.q || null;
    const D0 = V.qDefaults(t);
    const v = (k) => (Q && Q[k] != null && Q[k] !== "" ? Q[k] : (D0[k] || ""));
    const opt = (L, cur) => L.map((x) => `<option value="${E(x)}"${x === cur ? " selected" : ""}>${E(x)}</option>`).join("");
    const route = V.routeOf ? V.routeOf(t, p.id) : ((Q && Q.route) || ""); // 22.01.1 S5：商流の窓で決めた値も
    const html = `<div class="v101d-win" data-v101-deal-win="quote" data-noi18n>
      <h3>${E(M("見積・条件の下書き（送りません）", "Quote draft (nothing is sent)", "报价・条件草稿（不发送）", "Borrador de cotización (no se envía)"))}</h3>
      <p class="nn">${E(M("相手ごとに、価格・数量・建値・有効期限を下書きします。保存しても相手には届きません。送るのは、下の英語の文面を確かめてから、貴社が行います（送ったら「商談の記録」で状況を「見積提示」にすると、STEP 06 の「相手に出す」が済みになります）。", "Draft price, quantity, Incoterms and validity per buyer. Saving sends nothing."))}</p>
      <div class="v101d-f">
        <label class="v101d-full"><span>${E(M("相手", "Buyer"))}</span><select id="v101dqP">${P.map((x) => `<option value="${E(x.id)}"${x.id === p.id ? " selected" : ""}>${E(x.name + (x.cty ? "（" + x.cty + "）" : "") + (x.q ? M("・下書きあり", " · draft") : "") + (x.sent ? M("・送信済み", " · contacted") : M("・送る前", " · not sent")))}</option>`).join("")}</select></label>
        <p class="v101d-full v101d-item">${E(M("商品：", "Product: ") + (t.item || "") + (t.itemEn ? "（" + t.itemEn + "）" : M("（英文の商品名が未登録です）", " (no English name)")))}</p>
        <label><span>${E(M("単価", "Unit price"))}</span><input id="v101dqPrice" inputmode="decimal" value="${E(v("price"))}" placeholder="${E(M("例：4.30", "e.g. 4.30"))}"></label>
        <label><span>${E(M("通貨", "Currency"))}</span><select id="v101dqCur"><option value="">${E(M("（選ぶ）", "(choose)"))}</option>${opt(CURS, v("cur"))}</select></label>
        <label><span>${E(M("単位", "Unit"))}</span><input id="v101dqUnit" value="${E(v("unit"))}" placeholder="${E(M("例：個", "e.g. pcs"))}"></label>
        <label><span>${E(M("数量", "Quantity"))}</span><input id="v101dqQty" inputmode="numeric" value="${E(v("qty"))}" placeholder="${E(M("例：600", "e.g. 600"))}"></label>
        <label><span>${E(M("建値（インコタームズ）", "Incoterms"))}</span><select id="v101dqTerm"><option value="">${E(M("（選ぶ）", "(choose)"))}</option>${opt(V.INC, v("term"))}</select></label>
        <label><span>${E(M("建値の場所", "Named place"))}</span><input id="v101dqPlace" value="${E(v("place"))}" placeholder="${E(M("例：東京港", "e.g. Tokyo port"))}"></label>
        <label><span>${E(M("建値の場所（英語・文面に入ります）", "Named place (English)"))}</span><input id="v101dqPlaceEn" value="${E(v("placeEn"))}" placeholder="${E(M("例：Tokyo", "e.g. Tokyo"))}"></label>
        <label><span>${E(M("有効期限", "Valid until"))}</span><input id="v101dqValid" type="date" value="${E(v("valid"))}"></label>
        <label><span>${E(M("支払条件", "Payment"))}</span><input id="v101dqPay" value="${E(v("pay"))}" placeholder="${E(M("例：T/T 前払100%", "e.g. T/T in advance"))}"></label>
        <label><span>${E(M("支払条件（英語・文面に入ります）", "Payment (English)"))}</span><input id="v101dqPayEn" value="${E(v("payEn"))}" placeholder="${E(M("例：T/T 100% in advance", "e.g. T/T 100% in advance"))}"></label>
        <fieldset class="v101d-full v101d-route"><legend>${E(M("商流（直接貿易／間接貿易）", "Trade route"))}</legend>
          <label><input type="radio" name="v101dqR" value=""${route ? "" : " checked"}> ${E(M("まだ決めていない", "Not decided"))}</label>
          <label><input type="radio" name="v101dqR" value="direct"${route === "direct" ? " checked" : ""}> ${E(M("直接貿易（貴社が輸出者になる）", "Direct (you export)"))}</label>
          <label><input type="radio" name="v101dqR" value="indirect"${route === "indirect" ? " checked" : ""}> ${E(M("間接貿易（商社を通す）", "Indirect (via a trading company)"))}</label></fieldset>
        <label class="v101d-full"><span>${E(M("メモ（社内用・文面には入りません）", "Note (internal)"))}</span><textarea id="v101dqNote" rows="2">${E((Q && Q.note) || "")}</textarea></label>
      </div>
      <p class="nn v101d-src">${E(Q ? F(M("前に保存した下書き（{d}）です。", "Saved draft ({d})."), { d: new Date(Q.upd || Q.at).toLocaleString("ja-JP") }) : M("最初の値は、", "Defaults from ") + (D0.src.length ? D0.src.join("・") + M("・", ", ") : "") + M("商品情報の取引条件・仕出港・支払・", "terms, port, payment, ") + D0.validWhy + M("から入れました。空の所は推し量っていません。直してから保存してください。", ". Empty fields were not guessed."))}</p>
      <div class="rw v101d-btns"><button type="button" class="btn" data-v101-deal-qsave="1">${E(M("下書きを保存（送りません）", "Save draft (nothing is sent)"))}</button><button type="button" class="btn g" data-v101-deal-x="1">${E(M("やめる", "Cancel"))}</button>${C0() ? `<button type="button" class="btn g" data-v101-deal-qadd="1">${E(M("ほかの相手を加える", "Add another buyer"))}</button>` : ""}</div>
      <div class="v101d-qout" data-v101-deal-qout="1" role="status" aria-live="polite"></div>
    </div>`;
    openWin(M("見積・条件の下書き", "Quote draft"), html, (pn) => {
      const sel = $("#v101dqP", pn);
      if (sel) sel.addEventListener("change", () => quoteWin(sel.value));
      const pl = $("#v101dqPlace", pn), ple = $("#v101dqPlaceEn", pn);
      if (pl && ple) pl.addEventListener("change", () => { if (!ple.value) ple.value = V.portEn(pl.value); });
      const py = $("#v101dqPay", pn), pye = $("#v101dqPayEn", pn);
      if (py && pye) py.addEventListener("change", () => { if (!pye.value) pye.value = V.payEn(py.value); });
      const sv = $("[data-v101-deal-qsave]", pn);
      if (sv) sv.addEventListener("click", () => {
        const g = (id) => { const x = $("#" + id, pn); return x ? x.value : ""; };
        const r = $$("input[name=v101dqR]", pn).find((x) => x.checked);
        const q = V.qSave(ten(), sel ? sel.value : p.id, { price: g("v101dqPrice").trim(), cur: g("v101dqCur"), unit: g("v101dqUnit").trim(), qty: g("v101dqQty").trim(), term: g("v101dqTerm"), place: g("v101dqPlace").trim(), placeEn: g("v101dqPlaceEn").trim(), valid: g("v101dqValid"), pay: g("v101dqPay").trim(), payEn: g("v101dqPayEn").trim(), route: r ? r.value : "", note: g("v101dqNote") });
        if (!q) { toast(M("下書きを保存できませんでした", "Could not save the draft")); return; }
        showSaved(pn, q);
        toast(F(M("✓ 見積・条件の下書きを保存しました（{n}・送っていません）", "✓ Quote draft saved ({n} — not sent)"), { n: q.name }));
        after();
      });
      const add = $("[data-v101-deal-qadd]", pn); if (add) add.addEventListener("click", () => pickWin(true));
      $$("[data-v101-deal-x]", pn).forEach((b) => b.addEventListener("click", closeWin));
      if (Q) showSaved(pn, Q, true);
    });
  }
  const C0 = () => { try { return V.candidates(ten()).length > 0; } catch (e) { return false; } };
  function showSaved(pn, q, old) {
    const out = $("[data-v101-deal-qout]", pn); if (!out) return;
    const miss = V.qMissing(q, ten());
    const txt = V.qText(q, ten());
    out.innerHTML = `<p class="v101d-ok"><b>${E(old ? F(M("保存してある下書き（{d}）・相手には送っていません", "Saved draft ({d}) — not sent"), { d: new Date(q.upd || q.at).toLocaleString("ja-JP") }) : F(M("✓ 下書きを保存しました（{t}）。相手には送っていません", "✓ Draft saved ({t}). Nothing was sent"), { t: hhmm() }))}</b></p>`
      + `<p class="v101d-sum" data-noi18n>${E(sumOf(q))}</p>`
      + `<p class="v101d-miss">${E(M("相手に出す前に埋める所：", "Fill in before sending: ") + miss.join("・"))}</p>`
      + `<details class="v101d-txt" open><summary>${E(M("相手に出す文面（英語・コピー用。【】の所は、送る前に入れてください）", "Text for the buyer (English, copy). Fill in the 【】 parts before sending."))}</summary><textarea rows="14" data-v101-deal-qtxt="1" lang="en" aria-label="${E(M("相手に出す文面（英語）", "Quote text (English)"))}">${E(txt)}</textarea>`
      + `<p class="v101d-src">${E(M("この欄で直してからコピーできます（直した文は下書きには残りません。署名は AIバイヤー開拓の「✍ 署名」に入れると、次から文面に入ります）。", "You can edit here before copying (edits are not saved in the draft)."))}</p>`
      + `<div class="rw v101d-cprow"><button type="button" class="btn g" data-v101-deal-copy="1">${E(M("文面をコピー", "Copy text"))}</button><span class="v101d-cpst" data-v101-deal-cpst="1" role="status" aria-live="polite"></span></div></details>`
      + `<div class="rw v101d-btns"><button type="button" class="btn g" data-v101-deal-rec="1">${E(M("送ったあとで：商談の記録に「見積提示」で残す", "After sending: record as “Quote sent”"))}</button><button type="button" class="btn g" data-v101-deal-topi="1">${E(M("正式な見積書（PI）は「書類をつくる」へ（STEP 07）", "Formal quotation (PI): go to Documents (STEP 07)"))}</button><button type="button" class="btn g" data-v101-deal-qdel="1">${E(M("この下書きを消す", "Delete this draft"))}</button></div>`
      + `<p class="nn v101d-src">${E(M("この下書きは見積書（PI）には入りません。PI は「書類をつくる」で、数量・単価・建値を案件として入れて作ります（送るのは貴社が「点検して相手に送る」を押したときだけ）。", "This draft is not copied into the PI. Make the PI in Documents."))}</p>`;
    const cp = $("[data-v101-deal-copy]", out);
    const ta0 = $("[data-v101-deal-qtxt]", out);
    if (ta0) ta0.addEventListener("input", () => { const w0 = $("[data-v101-deal-qwarn]", out); if (w0) { const ph = V.phOf(ta0.value); if (!ph) w0.remove(); else qWarn(out, ta0, ph); } });
    if (cp) cp.addEventListener("click", () => {
      const ta = $("[data-v101-deal-qtxt]", out); if (!ta) return;
      const ph = V.phOf(ta.value);
      // 22.01.1 N12：【】・仮の値が残っている間は、コピーの前に知らせる（AI バイヤー開拓の文面のコピーと同じ）
      if (ph) {
        qWarn(out, ta, ph);
        cpSt(out, M("まだコピーしていません（【】が残っています）", "Not copied yet (【】 parts remain)"));
        toast(M("署名・本文に【】や仮の値が残っています。直してからコピーしてください（まだ送っていません）", "The signature or text still has 【】 or dummy values. Fix them before copying (nothing was sent)"));
        return;
      }
      doCopy(out, ta, false);
    });
    const rec = $("[data-v101-deal-rec]", out);
    if (rec) rec.addEventListener("click", () => recordWin(q));
    const pi = $("[data-v101-deal-topi]", out);
    if (pi) pi.addEventListener("click", () => { closeWin(); try { RD.goKey("ops:doc"); } catch (x) { /* 無視 */ } });
    const del = $("[data-v101-deal-qdel]", out);
    if (del) del.addEventListener("click", () => { if (V.qDel(ten(), q.pid)) { toast(M("下書きを消しました", "Draft deleted")); after(); quoteWin(q.pid); } });
  }
  // コピーの状態の1行（その場に・読み上げでも）とボタンの一時的な表示
  function cpSt(out, txt, ok) {
    const s0 = $("[data-v101-deal-cpst]", out); if (s0) { s0.textContent = txt; s0.classList.toggle("ok", !!ok); }
    const b = $("[data-v101-deal-copy]", out);
    if (b && ok) { if (!b.__lab) b.__lab = b.textContent; b.textContent = M("✓ コピーしました", "✓ Copied"); clearTimeout(b.__t); b.__t = setTimeout(() => { b.textContent = b.__lab; }, 2500); }
  }
  async function doCopy(out, ta, withBlanks) {
    let ok = false;
    try { if (navigator.clipboard && navigator.clipboard.writeText) { await navigator.clipboard.writeText(ta.value); ok = true; } } catch (e) { ok = false; }
    if (!ok) { try { const x = document.createElement("textarea"); x.value = ta.value; x.setAttribute("readonly", ""); x.className = "v101d-cptmp"; document.body.appendChild(x); x.select(); ok = document.execCommand("copy"); x.remove(); } catch (e) { ok = false; } }
    if (ok) {
      cpSt(out, F(withBlanks ? M("✓ コピーしました（{t}）。【】の所は、貼った先で直してから送ってください（まだ送っていません）", "✓ Copied ({t}). Fix the 【】 parts where you paste before sending (nothing was sent)") : M("✓ コピーしました（{t}）。まだ送っていません（貼った先で確かめて、貴社から送ってください）", "✓ Copied ({t}). Nothing was sent"), { t: hhmm() }), true);
      toast(withBlanks ? M("コピーしました（【】の所は貼った先で直してください・まだ送っていません）", "Copied (fix the 【】 parts where you paste — not sent)") : M("文面をコピーしました（まだ送っていません）", "Copied (not sent)"));
    } else {
      try { ta.focus(); ta.select(); } catch (e) { /* 無視 */ }
      cpSt(out, M("コピーできませんでした。文面を選んだので、Ctrl+C（Mac は ⌘+C）でコピーしてください", "Could not copy. The text is selected — press Ctrl+C (⌘+C on Mac)"));
      toast(M("コピーできませんでした。文面を選んでコピーしてください", "Could not copy; select the text and copy"));
    }
    return ok;
  }
  // 【】・仮の値が残っているときの知らせ（文面の上・role=alert）。署名を入れる所へ・【】を残したままコピーする
  function qWarn(out, ta, ph) {
    let box = $("[data-v101-deal-qwarn]", out);
    const left = V.leftOf(ta.value);
    const t = left.length
      ? F(M("署名・本文に、まだ入っていない所があります：{x}。【】が残ったままでは送れません（コピーするときも直してください）。署名は AIバイヤー開拓の「✍ 署名」に入れると、【】の所に入ります。", "Some parts are still empty: {x}. You cannot send while 【】 remains (fix them before copying too). Fill in your signature in “✍ Signature” of the AI buyer search."), { x: left.join("・") })
      : F(M("本文に仮の情報（見本の値・穴埋め）が残っています：「{p}」。直してから送ってください（コピーするときも直してください）。", "The text still contains dummy information: “{p}”. Fix it before sending (and before copying)."), { p: ph });
    if (!box) { box = document.createElement("div"); box.className = "v101d-qwarn"; box.setAttribute("data-v101-deal-qwarn", "1"); box.setAttribute("role", "alert"); box.setAttribute("data-noi18n", "1"); ta.parentNode.insertBefore(box, ta); }
    if (box.__s !== t) {
      box.__s = t;
      box.innerHTML = `<b>⚠ ${E(M("送る前に直してください", "Fix before sending", "发送前请修改", "Corrija antes de enviar"))}</b><span>${E(t)}</span><span class="rw v101d-btns">`
        + (left.length ? `<button type="button" class="btn g" data-v101-deal-sigopen="1">${E(M("署名を入れる →", "Add signature →", "填写签名 →", "Añadir firma →"))}</button>` : "")
        + `<button type="button" class="btn g" data-v101-deal-copyok="1">${E(M("【】を残したままコピーする（貼った先で自分で直す）", "Copy anyway with 【】 (fix them where you paste)", "保留【】直接复制（粘贴后自行修改）", "Copiar igualmente con 【】 (corríjalos donde pegue)"))}</button></span>`;
      const ok = $("[data-v101-deal-copyok]", box); if (ok) ok.addEventListener("click", () => doCopy(out, ta, true));
      const so = $("[data-v101-deal-sigopen]", box); if (so) so.addEventListener("click", () => sigOpen());
    }
    try { box.scrollIntoView({ block: "nearest" }); } catch (e) { /* 無視 */ }
    return box;
  }
  // 署名を入れる所（AIバイヤー開拓の「✍ 署名」）へ
  function sigOpen() {
    closeWin();
    const fx = (n) => {
      const d = document.getElementById("v79sig");
      if (d) {
        try { d.open = true; } catch (e) { /* 無視 */ }
        try { d.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) { d.scrollIntoView(); }
        d.classList.add("v101d-hit"); setTimeout(() => d.classList.remove("v101d-hit"), 3000);
        const i = document.getElementById("v79s_name"); if (i) { try { i.focus({ preventScroll: true }); } catch (e) { /* 無視 */ } }
        return;
      }
      if (n < 8) setTimeout(() => fx(n + 1), 300);
      else toast(M("AIバイヤー開拓の「✍ 署名」で、お名前（英字）・メール・住所を入れてください", "Fill in your name, e-mail and address in “✍ Signature” of the AI buyer search"));
    };
    try { if (curKey() !== "db") { RD.goKey("db"); setTimeout(() => fx(0), 800); } else fx(0); } catch (e) { err("sigOpen", e); }
  }
  function sumOf(q) {
    const u = q.unit || "";
    return [q.name, (q.cur || "") + " " + (q.price || "—") + (u ? " / " + u : ""), (q.qty || "—") + u, [q.term, q.placeEn || q.place].filter(Boolean).join(" ") || "—", M("有効期限 ", "valid until ") + (q.valid || "—"), q.route === "direct" ? M("直接貿易", "direct") : q.route === "indirect" ? M("間接貿易", "indirect") : M("商流は未定", "route not decided")].join("　");
  }
  // 送ったあとの記録：アプリの「商談を記録する」の窓を、下書きの値を入れて開く（保存は利用者が押す。送信はしない）
  function recordWin(q) {
    try {
      if (typeof openDealForm !== "function") { toast(M("商談の記録の窓を開けません", "Cannot open the deal form")); return; } // eslint-disable-line no-undef
      openDealForm(); // eslint-disable-line no-undef
      setTimeout(() => {
        const set = (id, val) => { const x = document.getElementById(id); if (x && val != null && val !== "") { x.value = val; x.dispatchEvent(new Event("input", { bubbles: true })); x.dispatchEvent(new Event("change", { bubbles: true })); } };
        set("dfB", String(q.name || "").replace(/（見本）$/, ""));
        set("dfC", q.cty || "");
        set("dfP", (q.cur || "") + " " + (q.price || "") + (q.unit ? "/" + q.unit : ""));
        set("dfL", (q.qty || "") + (q.unit || ""));
        const tm = document.getElementById("dfT"); if (tm && q.term) { const o = Array.from(tm.options).find((x) => x.value === q.term || x.textContent === q.term); if (o) tm.value = o.value; }
        const st = document.getElementById("dfSt"); if (st) { const o = Array.from(st.options).find((x) => (x.value || x.textContent) === "見積提示"); if (o) st.value = o.value; }
        set("dfNote", M("見積・条件（下書きから）：", "Quote (from draft): ") + sumOf(q));
        const pn = document.getElementById("pn");
        if (pn && !$("[data-v101-deal-recnote]", pn)) { const p = document.createElement("p"); p.className = "nn v101d-recnote"; p.setAttribute("data-v101-deal-recnote", "1"); p.setAttribute("data-noi18n", "1"); p.textContent = M("見積・条件の下書きの値を入れました。相手に送ったあとで「保存」を押してください（この窓は記録だけで、相手には何も送りません）。", "Filled from the draft. Save after you have sent the quote (this form only records)."); const h = $("h3", pn); if (h) h.after(p); }
      }, 200);
    } catch (e) { err("recordWin", e); }
  }
  // 現在地バーの STEP06 の項目・次の一手から呼ばれる（rd_v94jny の goItem が act の名前で呼ぶ）
  W.v101dealPick = function () { try { pickWin(true); } catch (e) { err("pick", e); } };
  W.v101dealQuote = function (pid) { try { quoteWin(typeof pid === "string" ? pid : undefined); } catch (e) { err("quote", e); } };
  W.v101dealRoute = function () { try { routeWin(); } catch (e) { err("route", e); } };
  W.v101dealWon = function () { try { wonWin(); } catch (e) { err("won", e); } };
  V.pickWin = pickWin; V.quoteWin = quoteWin;

  /* ══════ 22.01.1 S5：「商流を決める」の窓（相手ごと・送りません） ══════ */
  const ROUTES = () => [["", M("まだ決めていない", "Not decided", "尚未决定", "Sin decidir")], ["direct", M("直接貿易", "Direct trade", "直接贸易", "Comercio directo")], ["indirect", M("間接貿易", "Indirect trade", "间接贸易", "Comercio indirecto")]];
  const routeNm = (v) => (v === "direct" ? M("直接貿易", "direct") : v === "indirect" ? M("間接貿易", "indirect") : M("まだ", "not decided"));
  function routeWin() {
    const t = ten(); if (!t) return;
    const P = V.partners(t);
    if (!P.length) { toast(M("商流は相手ごとに決めます。先に、見積を出す相手を決めてください（送りません）", "The trade route is decided per buyer. Choose the buyer first (nothing is sent).")); pickWin(false); return; }
    const rows = P.map((p, i) => {
      const r = V.routeOf(t, p.id);
      return `<li class="v101d-rl"><span class="v101d-rln"><b data-noi18n>${E(p.name)}</b><small data-noi18n>${E([p.cty, p.sent ? M("送信済み", "contacted") : M("送る前", "not sent")].filter(Boolean).join("・"))}</small></span>`
        + `<span class="v101d-rr" role="radiogroup" aria-label="${E(p.name + M(" の商流", " — trade route"))}">${ROUTES().map(([v, lb]) => `<label><input type="radio" name="v101drR${i}" value="${v}" data-v101-deal-rp="${E(p.id)}"${r === v ? " checked" : ""}> ${E(lb)}</label>`).join("")}</span></li>`;
    }).join("");
    const html = `<div class="v101d-win" data-v101-deal-win="route" data-noi18n>
      <h3>${E(M("商流（直接貿易／間接貿易）を決める（送りません）", "Decide the trade route (direct / indirect) — nothing is sent", "决定商流（直接贸易／间接贸易・不发送）", "Decidir la ruta comercial (no se envía)"))}</h3>
      <p class="nn">${E(M("商流は、相手ごとに決めます。直接貿易＝貴社が輸出者になり、相手に直接売る（書類・代金のやりとりは相手と）。間接貿易＝国内の商社などを通して売る（書類・代金のやりとりは商社と）。まだ相手に送っていないので、決めた商流はここに控えます（相手には何も届きません）。見積・条件の下書きがある相手は、下書きの商流も同じにします。相手に連絡して案件ができたあとは、案件の画面の「商流」で決めます。",
        "Decide the route per buyer. Direct: you export and sell to the buyer. Indirect: you sell through a domestic trading company. Nothing is sent; the choice is kept here (and in the quote draft, if any)."))}</p>
      <ul class="v101d-rlist">${rows}</ul>
      <div class="rw v101d-btns"><button type="button" class="btn" data-v101-deal-rsave="1">${E(M("商流を保存（送りません）", "Save the route (nothing is sent)"))}</button><button type="button" class="btn g" data-v101-deal-toq="1">${E(M("見積・条件の下書きへ", "Go to the quote draft"))}</button><button type="button" class="btn g" data-v101-deal-x="1">${E(M("閉じる", "Close"))}</button></div>
      <div class="v101d-qout" data-v101-deal-rout="1" role="status" aria-live="polite"></div>
    </div>`;
    openWin(M("商流を決める", "Decide the trade route"), html, (pn) => {
      const sv = $("[data-v101-deal-rsave]", pn);
      if (sv) sv.addEventListener("click", () => {
        const tt = ten(); const got = {};
        $$("input[data-v101-deal-rp]", pn).forEach((x) => { if (x.checked) got[x.getAttribute("data-v101-deal-rp")] = x.value; });
        Object.keys(got).forEach((pid) => V.rSet(tt, pid, got[pid], true));
        V.save();
        const P2 = V.partners(tt);
        const sum = P2.map((p) => p.name + "：" + routeNm(V.routeOf(tt, p.id))).join("／");
        const o = $("[data-v101-deal-rout]", pn);
        if (o) o.innerHTML = `<p class="v101d-ok"><b>${E(F(M("✓ 商流を保存しました（{t}）。相手には送っていません", "✓ Route saved ({t}). Nothing was sent"), { t: hhmm() }))}</b></p><p class="v101d-sum" data-noi18n>${E(sum)}</p>`;
        toast(M("✓ 商流を保存しました（相手には送っていません）", "✓ Route saved (nothing was sent)"));
        after();
      });
      const toq = $("[data-v101-deal-toq]", pn); if (toq) toq.addEventListener("click", () => quoteWin());
      $$("[data-v101-deal-x]", pn).forEach((b) => b.addEventListener("click", closeWin));
    });
  }
  V.routeWin = routeWin;

  /* ══════ 22.01.1 S5：「受注する」の窓（受注とは・いまの状態・受注したら「商談を記録する」で「取引中」に） ══════ */
  function wonWin() {
    const t = ten(); if (!t) return;
    const s6 = V.step6(t);
    const cases = (() => { try { return (RD.allCases ? RD.allCases() : RD.dbThreads ? RD.dbThreads() : []) || []; } catch (e) { return []; } })();
    const now = F(M("いま：商談の相手 {p}社（送った {s}社）・見積の下書き {d}件・相手に出した見積：{q}。", "Now: {p} partner(s) ({s} contacted), {d} draft(s), quote sent: {q}."), { p: s6.nP, s: s6.nS, d: s6.nD, q: s6.quoteSent ? M("あり", "yes") : M("まだ送っていません", "not sent yet") });
    const html = `<div class="v101d-win" data-v101-deal-win="won" data-noi18n>
      <h3>${E(M("受注する（状況を「取引中」にする）", "Win the order (status “In business”)", "成交（状态改为“交易中”）", "Ganar el pedido (estado «En negocio»)"))}</h3>
      <p class="v101d-have">${E(now)}</p>
      <p class="nn">${E(M("受注は、見積・条件を相手に出して（送って）、相手が注文を決めたときです。受注したら「商談を記録する」で状況を「取引中」にすると、この項目が済みになります（記録だけで、相手には何も送りません）。", "You win the order when the buyer accepts a quote you sent. Then record the deal with status “In business” (this only records; nothing is sent)."))}${s6.nS ? "" : E(M("まだ相手に送っていないので、先に見積・条件の下書きを作り、文面を確かめて送ってください。", " You have not contacted anyone yet: draft the quote, check the text and send it first."))}</p>
      <div class="rw v101d-btns"><button type="button" class="btn" data-v101-deal-wrec="1">${E(M("商談を記録する（受注したとき・状況「取引中」）", "Record the deal (when won — “In business”)"))}</button><button type="button" class="btn g" data-v101-deal-toq="1">${E(M("見積・条件の下書きへ", "Go to the quote draft"))}</button>${cases.length ? `<button type="button" class="btn g" data-v101-deal-wcase="1">${E(M("案件の一覧を開く", "Open the deal list"))}</button>` : ""}<button type="button" class="btn g" data-v101-deal-x="1">${E(M("閉じる", "Close"))}</button></div>
    </div>`;
    openWin(M("受注する", "Win the order"), html, (pn) => {
      const rec = $("[data-v101-deal-wrec]", pn);
      if (rec) rec.addEventListener("click", () => wonRecord());
      const toq = $("[data-v101-deal-toq]", pn); if (toq) toq.addEventListener("click", () => quoteWin());
      const wc = $("[data-v101-deal-wcase]", pn); if (wc) wc.addEventListener("click", () => { closeWin(); try { RD.goKey("dash:home"); } catch (x) { /* 無視 */ } });
      $$("[data-v101-deal-x]", pn).forEach((b) => b.addEventListener("click", closeWin));
    });
  }
  V.wonWin = wonWin;
  // アプリの「商談を記録する」の窓を、状況「取引中」で開く（保存は利用者が押す。送信はしない）
  function wonRecord() {
    try {
      if (typeof openDealForm !== "function") { toast(M("商談の記録の窓を開けません", "Cannot open the deal form")); return; } // eslint-disable-line no-undef
      openDealForm(); // eslint-disable-line no-undef
      setTimeout(() => {
        const st = document.getElementById("dfSt"); if (st) { const o = Array.from(st.options).find((x) => (x.value || x.textContent) === "取引中"); if (o) { st.value = o.value; st.dispatchEvent(new Event("change", { bubbles: true })); } }
        const P = V.partners(ten()); const b = document.getElementById("dfB"); if (b && P.length === 1 && !b.value) { b.value = String(P[0].name || "").replace(/（見本）$/, ""); b.dispatchEvent(new Event("input", { bubbles: true })); }
        const pn = document.getElementById("pn");
        if (pn && !$("[data-v101-deal-recnote]", pn)) { const p = document.createElement("p"); p.className = "nn v101d-recnote"; p.setAttribute("data-v101-deal-recnote", "1"); p.setAttribute("data-noi18n", "1"); p.textContent = M("受注したときの記録です（状況「取引中」を選んであります）。受注したら「保存」を押してください（この窓は記録だけで、相手には何も送りません）。", "This records a won order (status “In business” is selected). Save after the order is confirmed (nothing is sent)."); const h = $("h3", pn); if (h) h.after(p); }
      }, 200);
    } catch (e) { err("wonRecord", e); }
  }

  /* ══════ 22.01.1 S1：「次は 寸法・重量を入れる」の行き先＝書類をつくるの寸法・重量の欄（入れる所に移る） ══════ */
  function goDims() {
    try {
      const fx = (tries) => {
        const w = document.getElementById("well");
        const f = w ? $$(".v101dim", w).find(vis) : null;
        if (f) {
          try { f.scrollIntoView({ block: "center" }); } catch (x) { f.scrollIntoView(); }
          f.classList.add("v101d-hit"); setTimeout(() => f.classList.remove("v101d-hit"), 3000);
          const i = $('input[data-f="cl"]', f) || $('input[data-f="ul"]', f) || $("input", f);
          if (i) { try { i.focus({ preventScroll: true }); } catch (x) { i.focus(); } }
          return;
        }
        if (tries < 10) { setTimeout(() => fx(tries + 1), 300); return; }
        // 欄が画面に無い（寸法の要らない書類を先に作った・hear の層が無い）：寸法・重量を入れる窓か、土台の表
        if (typeof W.v101hearDimDialog === "function" && W.v101hearDimDialog("")) return;
        const b = $$("[data-v101dim-open], [data-onclick*=\"openTableEdit('dim')\"]").find(vis);
        if (b) { try { b.scrollIntoView({ block: "center" }); } catch (x) { /* 無視 */ } b.classList.add("v101d-hit"); setTimeout(() => b.classList.remove("v101d-hit"), 3000); try { b.focus(); } catch (x) { /* 無視 */ } return; }
        try { if (typeof openTableEdit === "function") openTableEdit("dim"); } catch (x) { /* 無視 */ } // eslint-disable-line no-undef
      };
      toast(M("寸法・重量は「書類をつくる」の画面の欄で入れます（数字だけ）。まだ分からないときは「まだ分からない」を押すと、先へ進めます", "Enter the dimensions/weight on the Documents screen. If not known yet, press “Not known yet” to move on.", "请在“制作单据”页面填写尺寸・重量。还不知道时按“还不知道”即可继续。", "Introduzca medidas y peso en Documentos. Si aún no lo sabe, pulse «Aún no lo sé»."));
      if (curKey() !== "ops:doc") { RD.goKey("ops:doc"); setTimeout(() => fx(0), 700); } else fx(0);
    } catch (e) { err("goDims", e); }
  }
  const gk0 = RD.goKey;
  if (typeof gk0 === "function" && !gk0.__v101deal) {
    RD.goKey = function (k) { if (k === "v101:dims") { goDims(); return; } return gk0.apply(this, arguments); };
    RD.goKey.__v101deal = 1;
  }
  W.v101dealDims = function () { goDims(); };
  V.goDims = goDims;

  /* ══════ バイヤーの画面（db）：選択中のバイヤー・リストの各行 ══════ */
  const SEL = { kind: "", id: "", at: 0 };
  function selLeads() {
    try {
      const run = typeof v71obRun === "function" ? v71obRun() : null; // eslint-disable-line no-undef
      const S = (typeof V71OB !== "undefined" && V71OB && V71OB.sel) || {}; // eslint-disable-line no-undef
      return run ? (run.leads || []).filter((l) => l && S[l.id]).map((l) => ({ l, run })) : [];
    } catch (e) { return []; }
  }
  function leadStatus(l) {
    const t = ten();
    const b = l.myId ? V.myOf(t, l.myId) : null;
    const p = b ? V.partners(t).find((x) => x.id === b.id) : null;
    return { partner: !!b, id: b ? b.id : "", sent: !!(l.sent && l.sent.length) || !!(p && p.sent), q: p ? p.q : null };
  }
  function stTxt(s) {
    if (!s.partner) return s.sent ? M("送信済み", "contacted") : M("まだ商談の相手に入っていません（送っていません）", "Not a deal partner yet (nothing sent)");
    return (s.sent ? M("✓ 商談の相手・送信済み", "✓ Partner · contacted") : M("✓ 商談の相手（まだ送っていません）", "✓ Partner (not sent yet)")) + (s.q ? M("・見積の下書きあり", " · quote draft") : "");
  }
  function selHtml() {
    const t = ten(); if (!t) return null;
    const L = selLeads();
    const P = V.partners(t);
    const hd = `<div class="rd-ch">${I("bldg", 22)}<h2 class="v101d-selh">${E(M("選択中のバイヤー", "Selected buyer", "已选买家", "Comprador seleccionado"))}</h2></div>`;
    if (SEL.kind === "thread") return null; // 左の一覧（やり取り中）で選んだ相手は、前のまま（あとでリストの行を選び直すとこちらへ）
    let one = null;
    if (SEL.kind === "lead") one = L.find((x) => x.l.id === SEL.id) || null;
    if (!one && L.length === 1) one = L[0];
    if (one) {
      const l = one.l, s = leadStatus(l);
      return hd + `<div class="v101d-selb"><b data-noi18n class="v101d-seln">${E(String(l.name || "").replace(/^\[見本\]\s*/, ""))}</b>${l.smp ? `<em class="v101d-tag">${E(M("見本（架空）", "sample"))}</em>` : l.verify ? `<em class="v101d-tag">${E(M("要確認", "to check"))}</em>` : ""}</div>
        <dl class="rd-kv v101d-kv"><dt>${E(M("国", "Country"))}</dt><dd data-noi18n>${E(one.run.cty || "—")}</dd><dt>${E(M("業態", "Type"))}</dt><dd data-noi18n>${E(l.biz || "—")}</dd><dt>${E(M("見込み", "Fit"))}</dt><dd>${E((l.rank || "—") + (l.pts != null ? "（" + l.pts + M("点", " pts") + "）" : ""))}</dd><dt>${E(M("状態", "Status"))}</dt><dd>${E(stTxt(s))}</dd></dl>
        ${L.length > 1 ? `<p class="v101d-more">${E(F(M("ほかに {n}社を選んでいます", "{n} more selected"), { n: L.length - 1 }))}</p>` : ""}
        <div class="v101d-btns rw">${s.partner ? `<button type="button" class="rd-btn" data-v101-deal-selq="${E(s.id)}">${I("doc", 18)}${E(s.q ? M("見積・条件の下書きを開く", "Open the quote draft") : M("見積・条件の下書きを作る", "Draft a quote"))}</button><button type="button" class="rd-btn ghost" data-v101-deal-seldeal="1">${E(M("商談・バイヤーで見る", "See in Deals"))}</button>` : `<button type="button" class="rd-btn" data-v101-deal-seladd="${E(L.length > 1 ? "*" : l.id)}">${I("plus", 18, 2.4)}${E(L.length > 1 ? F(M("選んだ {n}社を商談の相手に加える（送りません）", "Add the {n} selected as partners (nothing is sent)"), { n: L.length }) : M("商談の相手に加える（送りません）", "Add as deal partner (nothing is sent)"))}</button>`}</div>
        <p class="rd-note v101d-note">${E(M("加えると「商談・バイヤー」の一覧に入り、見積・条件の下書きを作れます。メールは送りません（送るのは、各行の文面を確かめてから）。", "Adding puts them in “Deals & buyers” so you can draft a quote. Nothing is sent."))}</p>`;
    }
    if (L.length > 1) {
      const np = L.filter((x) => leadStatus(x.l).partner).length;
      return hd + `<p class="v101d-selb"><b>${E(F(M("{n}社を選んでいます（うち商談の相手 {p}社）", "{n} selected ({p} already partners)"), { n: L.length, p: np }))}</b></p><ul class="v101d-sell" data-noi18n>${L.slice(0, 8).map((x) => `<li>${E(String(x.l.name || "").replace(/^\[見本\]\s*/, ""))}<small>${E(stTxt(leadStatus(x.l)))}</small></li>`).join("")}</ul>
        <div class="v101d-btns rw"><button type="button" class="rd-btn" data-v101-deal-seladd="*">${I("plus", 18, 2.4)}${E(F(M("選んだ {n}社を商談の相手に加える（送りません）", "Add the {n} selected as partners (nothing is sent)"), { n: L.length }))}</button>${np ? `<button type="button" class="rd-btn ghost" data-v101-deal-selq="">${E(M("見積・条件の下書き", "Quote draft"))}</button>` : ""}</div>`;
    }
    if (SEL.kind === "thread") return null; // 左の一覧（やり取り中）の選択は、前のまま
    const sel0 = document.getElementById("rddbsel");
    if (sel0 && $("#rddbopen", sel0) && !sel0.querySelector("[data-v101-deal-sel]")) return null; // やり取り中の相手を出している
    if (P.length) {
      const cur = P.find((x) => x.id === SEL.id) || P[0];
      return hd + `<p class="v101d-selsub">${E(F(M("商談の相手 {n}社（送った {s}社）。押すと詳しく出ます", "{n} partner(s) ({s} contacted)"), { n: P.length, s: P.filter((x) => x.sent).length }))}</p>
        <div class="v101d-chips" role="group" aria-label="${E(M("商談の相手", "Deal partners"))}">${P.slice(0, 8).map((x) => `<button type="button" class="v101d-chip${x.id === cur.id ? " on" : ""}" aria-pressed="${x.id === cur.id}" data-v101-deal-psel="${E(x.id)}" data-noi18n>${E(x.name)}</button>`).join("")}</div>
        <div class="v101d-selb"><b data-noi18n class="v101d-seln">${E(cur.name)}</b></div>
        <dl class="rd-kv v101d-kv"><dt>${E(M("国", "Country"))}</dt><dd data-noi18n>${E(cur.cty || "—")}</dd><dt>${E(M("業態", "Type"))}</dt><dd data-noi18n>${E(cur.biz || "—")}</dd><dt>${E(M("状態", "Status"))}</dt><dd>${E((cur.sent ? M("送信済み", "contacted") : M("まだ送っていません", "not sent yet")) + (cur.q ? M("・見積の下書きあり", " · quote draft") : ""))}</dd></dl>
        <div class="v101d-btns rw"><button type="button" class="rd-btn" data-v101-deal-selq="${E(cur.id)}">${I("doc", 18)}${E(cur.q ? M("見積・条件の下書きを開く", "Open the quote draft") : M("見積・条件の下書きを作る", "Draft a quote"))}</button><button type="button" class="rd-btn ghost" data-v101-deal-seldeal="1">${E(M("商談・バイヤーで見る", "See in Deals"))}</button></div>`;
    }
    const info = V.listInfo(t);
    return hd + `<div class="rd-empty v101d-empty">${E(info ? F(M("まだ選んでいません。下の「AI がつくったリスト」（{c}・{n}社）の行の左のチェックを入れると、ここに出ます。", "Nothing selected. Tick a row in the AI list below ({c}, {n})."), { c: info.cty, n: info.n }) : M("まだ選んでいません。先に右の「条件を決めてリストを作る」で AI バイヤーリストを作ると、行を選んでここに出せます。", "Nothing selected. Make the AI buyer list first."))}</div>
      ${info ? `<div class="v101d-btns rw"><button type="button" class="rd-btn ghost" data-v101-deal-selpick="1">${E(M("リストから選ぶ（送りません）", "Pick from the list"))}</button></div>` : ""}`;
  }
  function paintSel() {
    try {
      const el = document.getElementById("rddbsel"); if (!el) return;
      const h = selHtml();
      if (h == null) return;
      if (el.__v101h === h && el.querySelector("[data-v101-deal-sel]")) return;
      el.innerHTML = h + `<span hidden data-v101-deal-sel="1"></span>`;
      el.__v101h = h;
    } catch (e) { err("paintSel", e); }
  }
  function decoRows() {
    try {
      const ob = document.getElementById("v71ob"); if (!ob) return;
      const run = typeof v71obRun === "function" ? v71obRun() : null; // eslint-disable-line no-undef
      if (!run) return;
      $$("tr[data-v71row]", ob).forEach((tr) => {
        const id = tr.getAttribute("data-v71row");
        const l = (run.leads || []).find((x) => x && x.id === id); if (!l) return;
        const s = leadStatus(l);
        const td = $("td.v71st", tr) || tr.cells[5]; if (!td) return;
        const h = `<span class="v101d-rowst${s.partner ? " on" : ""}">${E(s.partner ? stTxt(s) : M("商談の相手：まだ", "Deal partner: not yet"))}</span>`
          + (s.partner ? `<button type="button" class="btn g v101d-rowb" data-v101-deal-rowq="${E(s.id)}">${E(s.q ? M("見積の下書きを開く", "Open quote draft") : M("見積の下書きを作る", "Draft a quote"))}</button>`
            : `<button type="button" class="btn g v101d-rowb" data-v101-deal-rowadd="${E(id)}">${E(M("＋ 商談の相手に加える（送りません）", "+ Add as deal partner (not sent)"))}</button>`);
        let box = $("[data-v101-deal-row]", td);
        if (box && box.__h === h) return;
        if (!box) { box = document.createElement("span"); box.className = "v101d-row"; box.setAttribute("data-v101-deal-row", id); box.setAttribute("data-noi18n", "1"); td.appendChild(box); }
        box.innerHTML = h; box.__h = h;
      });
      // まとめのボタン「＋ 自社のバイヤーに入れる」：何が起きるかを名前に（送らない・商談・バイヤーの一覧に入る）
      const my = $('[data-v71act="my"]', ob);
      if (my && !my.dataset.v101Deal) { my.dataset.v101Deal = "1"; my.textContent = M("＋ 商談の相手に加える（自社のバイヤーに入れる・送りません）", "+ Add as deal partners (to your buyers — nothing is sent)", "＋ 加为商谈对象（不发送）", "+ Añadir como socios (no se envía)"); my.title = M("選んだ会社を、送らずに「商談・バイヤー」の一覧（自社のバイヤー）に入れます。見積・条件の下書きを作れるようになります", "Adds the selected companies to Deals & buyers without sending anything"); }
    } catch (e) { err("decoRows", e); }
  }
  function paintDb() { if (curKey() !== "db" || !shipper()) return; decoRows(); paintSel(); }
  document.addEventListener("change", (e) => {
    const x = e.target && e.target.closest && e.target.closest("input[data-v71sel]");
    if (!x) return;
    const id = x.getAttribute("data-v71sel");
    if (x.checked) { SEL.kind = "lead"; SEL.id = id; SEL.at = Date.now(); } else if (SEL.kind === "lead" && SEL.id === id) { const L = selLeads(); SEL.id = L.length ? L[L.length - 1].l.id : ""; if (!SEL.id) SEL.kind = ""; }
    setTimeout(paintDb, 30);
  }, true);
  document.addEventListener("click", (e) => {
    const tg = e.target; if (!tg || !tg.closest) return;
    if (tg.closest("[data-rddbi]")) { SEL.kind = "thread"; SEL.at = Date.now(); return; }
    if (tg.closest('[data-v71act="all"]')) { SEL.kind = "lead"; SEL.id = ""; setTimeout(paintDb, 120); return; }
    const ps = tg.closest("[data-v101-deal-psel]"); if (ps) { SEL.kind = "partner"; SEL.id = ps.getAttribute("data-v101-deal-psel"); paintSel(); return; }
    const sa = tg.closest("[data-v101-deal-seladd], [data-v101-deal-rowadd]");
    if (sa) {
      e.preventDefault(); e.stopPropagation();
      const v = sa.getAttribute("data-v101-deal-seladd") || sa.getAttribute("data-v101-deal-rowadd");
      const ids = v === "*" ? selLeads().map((x) => x.l.id) : [v];
      const res = ids.map((id) => W.v101addDealBuyer(ten(), id)).filter((r) => r && r.ok);
      toast(res.length ? F(M("{n}社を商談の相手に加えました（送っていません）。「商談・バイヤー」の一覧に出ます。見積・条件の下書きを作れます", "Added {n} partner(s) — nothing sent"), { n: res.length }) : M("加えられませんでした", "Could not add"));
      if (res.length === 1) { SEL.kind = SEL.kind || "partner"; }
      try { if (typeof v71obPaint === "function") v71obPaint(); } catch (x) { /* 無視 */ } // eslint-disable-line no-undef
      after();
      return;
    }
    const sq = tg.closest("[data-v101-deal-selq], [data-v101-deal-rowq]");
    if (sq) { e.preventDefault(); e.stopPropagation(); quoteWin(sq.getAttribute("data-v101-deal-selq") || sq.getAttribute("data-v101-deal-rowq") || undefined); return; }
    if (tg.closest("[data-v101-deal-seldeal]")) { e.preventDefault(); try { RD.goKey("deal"); } catch (x) { /* 無視 */ } return; }
    if (tg.closest("[data-v101-deal-selpick]")) { e.preventDefault(); pickWin(false); return; }
    const dq = tg.closest("[data-v101-deal-dq]"); if (dq) { e.preventDefault(); quoteWin(dq.getAttribute("data-v101-deal-dq") || undefined); return; }
    if (tg.closest("[data-v101-deal-dpick]")) { e.preventDefault(); pickWin(true); return; }
    if (tg.closest("[data-v101-deal-hgo]")) { e.preventDefault(); try { RD.goKey("deal"); } catch (x) { /* 無視 */ } return; }
  }, true);
  try { const mo2 = new MutationObserver(() => { if (mo2._t) return; mo2._t = setTimeout(() => { mo2._t = 0; paintDb(); paintDeal(); paintHome(); }, 150); }); const s = () => { const w = document.getElementById("well"); if (w && !w.__v101dmo) { w.__v101dmo = 1; mo2.observe(w, { childList: true, subtree: true }); } }; s(); setInterval(s, 2000); } catch (e) { err("wellMo", e); }

  /* ══════ 「商談・バイヤー」の画面（deal）：見積を出す相手と下書き（送る前）の箱・一覧の行の札 ══════ */
  function dealBoxHtml() {
    const t = ten(); if (!t) return "";
    const P = V.partners(t), C = V.candidates(t), info = V.listInfo(t);
    const Q = V.qStore(t, true); const drafts = Object.keys(Q).map((k) => Q[k]).filter((q) => q && q.pid);
    const s6 = V.step6(t);
    const head = `<div class="v101d-dh"><h3>${E(M("見積を出す相手と下書き（送る前）", "Buyers to quote & drafts (before sending)", "报价对象与草稿（发送前）", "Compradores y borradores (antes de enviar)"))}</h3><span class="v101d-d6" role="status">${E(F(M("STEP 06 見積・契約：{p}%（{n}/{m}項目）", "STEP 06: {p}% ({n}/{m})"), { p: s6.pct, n: s6.n, m: s6.m }))}</span></div>`;
    const nums = `<ul class="v101d-nums"><li><b>${P.length}</b>${E(M("社 商談の相手", " partners"))}<small>${E(F(M("うち送った {s}社", "{s} contacted"), { s: P.filter((x) => x.sent).length }))}</small></li><li><b>${drafts.length}</b>${E(M("件 見積の下書き", " drafts"))}<small>${E(M("送っていません", "not sent"))}</small></li><li><b>${C.length}</b>${E(M("社 AIバイヤーリストでまだ加えていない", " in the AI list not added"))}<small>${E(info ? info.cty + "・" + info.n + M("社のリスト", " in list") : M("リストはまだありません", "no list yet"))}</small></li></ul>`;
    const dl = drafts.length ? `<ul class="v101d-dl" data-noi18n>${drafts.map((q) => `<li><span>${E(sumOf(q))}</span><em class="v101d-tag">${E(M("下書き・送っていません", "draft — not sent"))}</em><button type="button" class="btn g" data-v101-deal-dq="${E(q.pid)}">${E(M("開く", "Open"))}</button></li>`).join("")}</ul>` : "";
    const btns = `<div class="rw v101d-btns">${P.length ? `<button type="button" class="btn" data-v101-deal-dq="">${E(M("見積・条件の下書きを作る（送りません）", "Draft a quote (nothing is sent)"))}</button>` : ""}<button type="button" class="btn${P.length ? " g" : ""}" data-v101-deal-dpick="1">${E(C.length ? F(M("AIバイヤーリストから相手を加える（{n}社・送りません）", "Add from the AI buyer list ({n} — nothing is sent)"), { n: C.length }) : M("相手を選ぶ・リストを作る", "Choose a buyer / make a list"))}</button></div>`;
    const lead = !P.length ? `<p class="nn">${E(C.length ? F(M("AIバイヤーリスト（{c}・{n}社）の会社は、送るまでこの一覧に入りません。送る前でも「AIバイヤーリストから相手を加える」で入れて、見積・条件の下書きを作れます（メールは送りません）。", "Companies in the AI buyer list are not listed here until you contact them. You can add them now without sending."), { c: info.cty, n: info.n }) : M("見積を出す相手がまだいません。AIバイヤーリストを作るか、自社のバイヤーを登録してください。", "No buyers yet."))}</p>` : "";
    return head + lead + nums + dl + btns;
  }
  function paintDeal() {
    try {
      if (curKey() !== "deal" || !shipper()) return;
      const wrap = document.getElementById("b30wrap");
      const w = document.getElementById("well"); if (!w) return;
      let box = $("[data-v101-deal-box]", w);
      const h = dealBoxHtml();
      if (!box) {
        box = document.createElement("section"); box.className = "c v101d-box"; box.setAttribute("data-v101-deal-box", "1"); box.setAttribute("data-noi18n", "1"); box.setAttribute("aria-label", M("見積を出す相手と下書き（送る前）", "Buyers to quote & drafts"));
        const anchor = wrap || $(".rd-p2", w);
        if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(box, anchor); else w.appendChild(box);
      }
      if (box.__h !== h) { box.innerHTML = h; box.__h = h; }
      // 一覧の行の札（自社のバイヤーの行＝ data-b30="my:ID"）
      const t = ten(); const P = V.partners(t);
      P.forEach((p) => {
        const tr = document.querySelector('tr[data-b30="my:' + (W.CSS && CSS.escape ? CSS.escape(p.id) : p.id) + '"]'); if (!tr) return;
        const nm = $("td.nm", tr) || tr.cells[1]; if (!nm) return;
        const tag = (p.sent ? "" : M("送る前", "not sent")) + (p.q ? (p.sent ? "" : "・") + M("見積の下書きあり", "quote draft") : "") + (p.src === "ai" ? (p.sent || p.q ? "・" : "") + M("AIバイヤーリストから", "from AI list") : "");
        let sp = $("[data-v101-deal-tag]", nm);
        if (!tag) { if (sp) sp.remove(); return; }
        if (!sp) { sp = document.createElement("span"); sp.className = "v101d-tag v101d-rtag"; sp.setAttribute("data-v101-deal-tag", "1"); sp.setAttribute("data-noi18n", "1"); nm.appendChild(sp); }
        if (sp.textContent !== tag) sp.textContent = tag;
      });
    } catch (e) { err("paintDeal", e); }
  }

  /* ══════ 案件（ホーム）：案件がまだ無いときに、商談の相手（送る前）と下書きの数 ══════ */
  function paintHome() {
    try {
      if (curKey() !== "dash:home" || !shipper()) return;
      // ホームの成長の札：名前を「AI商社マンの成長度」に
      $$(".k-lvchip small").forEach((s) => { if (/^AI商社マンの成長$/.test((s.textContent || "").trim())) s.textContent = M("AI商社マンの成長度", "AI agent growth", "AI商社成长度", "Crecimiento del agente"); });
      const em = $(".k-clempty");
      const t = ten(); const P = V.partners(t);
      const Q = V.qStore(t, true); const nD = Object.keys(Q).length;
      let box = em ? $("[data-v101-deal-home]", em) : null;
      if (!em || !P.length) { if (box) box.remove(); return; }
      const h = `<p>${E(F(M("商談の相手（送る前を含む）{n}社・見積の下書き {d}件があります。案件は、相手に連絡すると相手ごとにできます。", "{n} deal partner(s) and {d} quote draft(s). Deals appear here once you contact them."), { n: P.length, d: nD }))}</p><button type="button" class="k-btn ghost" data-v101-deal-hgo="1">${E(M("商談・バイヤーで見る", "Open Deals & buyers"))}</button>`;
      if (!box) { box = document.createElement("div"); box.className = "v101d-home"; box.setAttribute("data-v101-deal-home", "1"); box.setAttribute("data-noi18n", "1"); box.setAttribute("role", "status"); const inner = $("div", em) || em; inner.appendChild(box); }
      if (box.__h !== h) { box.innerHTML = h; box.__h = h; }
    } catch (e) { err("paintHome", e); }
  }

  /* いつ描くか：画面を描いたあと（RD.after）・#well の中が変わったとき（上の見張り） */
  const a0 = RD.after;
  RD.after = function () { const r = a0.apply(this, arguments); try { paintDb(); paintDeal(); paintHome(); } catch (e) { err("after", e); } try { setTimeout(() => { paintDb(); paintDeal(); paintHome(); decoBar(); }, 50); } catch (e) { err("after2", e); } return r; };
  setInterval(() => { if (document.hidden) return; const k = curKey(); if (k === "db") paintDb(); else if (k === "deal") paintDeal(); else if (k === "dash:home") paintHome(); }, 1500);
})();
