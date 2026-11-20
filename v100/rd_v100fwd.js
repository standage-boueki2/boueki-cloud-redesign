/* ═══ v22.00 fwd（2026-11-20 第13回 UAT）物流会社の画面の見せ方の層（logic_v2200fwd.js・rd_v100fwd.css のあとに読む）
   No.604 見積受信箱：一覧を 20件ずつのページに分け、「全 N件中 a〜b件を表示」を表の上と下に出す。「次の20件」「前の20件」・ページ番号・「すべて表示（N件）」。
          絞り込み（見積の状況・担当・検索）を変えると1ページ目へ。明細（No.554）・日数（No.520）・B/L の差額（No.519）は行ごとなので、どのページの行にも効く。
          取り込みの確認の表（レート表のアップロード）は 60行で切れていた →「残りの N行も見る」で全部の行（チェックも外せる）。
   No.605 物流レート管理：同じ国のレーンの重なり（表記の違い）の知らせ・行の札・「重なっている行だけ表示」・まとめ方の案（データは変えない）。
          手入力の「追加」で同じ国のレーンがあれば、確かめの窓で知らせる（キャンセルで登録しない）。取り込みの確認の表の行にも知らせる。相見積にも1行。
   開示事項（第7章）：受信箱の行・明細・ホームの全体の状況・受信箱の上に「体験用の依頼・3日で消えます」と、体験用を除いた数。
          荷主（デモ用）の画面の「3日で消えます」の1行と、物流会社（デモ用）の「ログアウトすると戻ります」の1行に、ログアウトで消えないものを書き足す。
   土台・前の層の関数は控えてから包むだけ。インラインの onclick・style は書かない（イベントは document への委譲）。書き換えは中身が変わったときだけ。 */
(function () {
  "use strict";
  if (window.__v100fwdRd) return;
  window.__v100fwdRd = 1;
  const V = window.V100FWD || (window.V100FWD = { v: "22.00", err: null, errs: [], n: {} });
  const err = (k, e) => { try { const m = "rd." + k + ": " + String((e && e.message) || e).slice(0, 180); V.err = m; (V.errs = V.errs || []).push(m); if (V.errs.length > 40) V.errs.shift(); } catch (x) { /* 記録できないときは何もしない */ } };
  const cnt = (k) => { try { V.n[k] = (V.n[k] || 0) + 1; } catch (e) { /* 無視 */ } };
  const M = (ja, en, zh, es) => (typeof v100fM === "function" ? v100fM(ja, en, zh, es) : ja);
  const E = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const fwdOn = () => { try { return typeof FWDON !== "undefined" && !!FWDON && typeof FWDB !== "undefined" && !!FWDB; } catch (e) { return false; } };
  const page = () => { try { return (typeof fwdCur !== "undefined" && fwdCur) || ""; } catch (e) { return ""; } };
  const rdKey = () => { try { return window.RDX && RDX.curKey ? RDX.curKey() : page(); } catch (e) { return page(); } };
  const well = () => document.getElementById("well");
  const hash = (s) => { let h = 5381; s = String(s); for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36) + "." + s.length; };
  const ss = (k, v) => { try { if (v === undefined) return sessionStorage.getItem(k); if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) { /* 使えないブラウザ */ } return null; };
  /* 置く・置き換える（同じ中身なら触らない） */
  function put(parent, sel, html, where, ref) {
    let el = parent.querySelector(sel);
    if (!html) { if (el) el.remove(); return null; }
    const sig = hash(html);
    if (el && el.dataset.sig === sig) return el;
    const tmp = document.createElement("div"); tmp.innerHTML = html.trim();
    const nu = tmp.firstElementChild; if (!nu) return null;
    nu.dataset.sig = sig;
    if (el) el.replaceWith(nu);
    else if (ref) ref.insertAdjacentElement(where || "beforebegin", nu);
    else parent.appendChild(nu);
    return nu;
  }

  /* ═══ No.604 見積受信箱のページ送り ═══════════════════════════════════ */
  const PS = 20;
  const PG = { page: 0, all: ss("v100f_pgall") === "1", sig: null };
  function inboxTable(w) {
    return [...w.querySelectorAll("table")].find((t) => { const th = t.querySelector("thead th"); return th && /受信日|Received|收到|Recibid/.test(th.textContent || ""); }) || null;
  }
  function pgState(t) {
    const rows = t.tBodies[0] ? [...t.tBodies[0].rows] : [];
    const elig = rows.filter((tr) => !tr.hidden);
    const n = elig.length, ps = PG.all ? Math.max(1, n) : PS, pages = Math.max(1, Math.ceil(n / ps));
    if (PG.page >= pages) PG.page = pages - 1;
    if (PG.page < 0) PG.page = 0;
    const a = PG.page * ps, z = Math.min(n, a + ps);
    return { rows, elig, n, ps, pages, a, z, total: rows.length };
  }
  function paintPager(w) {
    const t = inboxTable(w);
    if (!t) return;
    const pre = pgState(t);
    const sig = pre.elig.map((tr) => tr.dataset.v99rid || (/RQ-[A-Za-z0-9]+/.exec(tr.textContent || "") || [""])[0]).join(",");
    if (PG.sig !== sig) { if (PG.sig != null) PG.page = 0; PG.sig = sig; }
    const S = pgState(t);
    S.rows.forEach((tr) => { const i = S.elig.indexOf(tr); const off = i >= 0 && (i < S.a || i >= S.z); if (tr.classList.contains("v100pgoff") !== off) tr.classList.toggle("v100pgoff", off); });
    const TS = typeof v100fTrialStats === "function" ? v100fTrialStats() : { temp: 0 };
    const filt = S.n !== S.total;
    const head = M(`全 ${S.total}件`, `${S.total} in total`, `共 ${S.total} 件`, `${S.total} en total`) + (TS.temp ? M(`（うち体験用の依頼 ${TS.temp}件・3日で消えます）`, ` (incl. ${TS.temp} trial request(s), removed after 3 days)`, `（含体验用请求 ${TS.temp} 件，3天后删除）`, ` (incl. ${TS.temp} de prueba)`) : "")
      + (filt ? M(`・絞り込みで ${S.n}件`, ` · ${S.n} match the filters`, `・筛选后 ${S.n} 件`, ` · ${S.n} filtradas`) : "");
    const shown = S.n ? M(`${S.a + 1}〜${S.z}件を表示`, `showing ${S.a + 1}–${S.z}`, `显示第 ${S.a + 1}–${S.z} 件`, `mostrando ${S.a + 1}–${S.z}`) : M("表示する依頼はありません", "nothing to show", "无可显示的请求", "nada que mostrar");
    const pgTxt = S.pages > 1 ? M(`（${S.pages}ページ中 ${PG.page + 1}ページ目）`, ` (page ${PG.page + 1} of ${S.pages})`, `（第 ${PG.page + 1}/${S.pages} 页）`, ` (página ${PG.page + 1} de ${S.pages})`) : PG.all && S.n > PS ? M("（すべて表示中）", " (all shown)", "（全部显示）", " (todo)") : "";
    const more = S.pages > 1 ? M("続きは表の下の「次の20件」・ページ番号・「すべて表示」で見られます。", "Use “Next 20”, page numbers or “Show all” below the table.", "可用表格下方的“下20件”、页码或“全部显示”查看其余。", "Use «Siguientes 20», los números o «Ver todo» bajo la tabla.") : "";
    const tw = t.closest(".tw") || t;
    const top = `<p class="v100pgtop" data-noi18n role="status" aria-live="polite">${E(head + M("中 ", " — ", "中 ", " — ") + shown + pgTxt)}${more ? `<small>${E(more)}</small>` : ""}</p>`;
    put(tw.parentElement, ":scope > .v100pgtop", top, "beforebegin", tw);
    let nav = "";
    if (S.n > PS) {
      const btn = (k, l, dis, cur) => `<button type="button" class="v100pgb${cur ? " on" : ""}" data-v100pg="${k}"${dis ? " disabled" : ""}${cur ? ' aria-current="page"' : ""}>${E(l)}</button>`;
      const nums = [];
      if (!PG.all) for (let i = 0; i < S.pages; i++) nums.push(btn("p" + i, String(i + 1), false, i === PG.page));
      const nextN = Math.min(PS, S.n - S.z);
      nav = `<nav class="v100pg" data-noi18n aria-label="${E(M("見積依頼の一覧のページ", "Quote request list pages", "报价请求列表分页", "Páginas de la lista"))}">
        <span class="v100pgt">${E(head + M("中 ", " — ") + shown + pgTxt)}</span>
        <span class="v100pgbs">${PG.all ? "" : btn("prev", M(`前の${PS}件`, `Previous ${PS}`, `上${PS}件`, `${PS} anteriores`), PG.page <= 0) + nums.join("") + btn("next", nextN > 0 ? M(`次の${nextN}件（${S.z + 1}〜${S.z + nextN}件）`, `Next ${nextN} (${S.z + 1}–${S.z + nextN})`, `下${nextN}件（${S.z + 1}–${S.z + nextN}）`, `Siguientes ${nextN}`) : M(`次の${PS}件`, `Next ${PS}`, `下${PS}件`, `Siguientes ${PS}`), nextN <= 0)}${btn(PG.all ? "pages" : "all", PG.all ? M(`${PS}件ずつ表示`, `Show ${PS} per page`, `每页显示${PS}件`, `Ver de ${PS} en ${PS}`) : M(`すべて表示（${S.n}件）`, `Show all (${S.n})`, `全部显示（${S.n}件）`, `Ver todo (${S.n})`), false)}</span></nav>`;
    }
    put(tw.parentElement, ":scope > .v100pg", nav, "afterend", tw);
    cnt("pager");
  }
  document.addEventListener("click", (ev) => {
    try {
      const b = ev.target && ev.target.closest && ev.target.closest("[data-v100pg]");
      if (!b || b.disabled) return;
      ev.preventDefault();
      const k = b.getAttribute("data-v100pg");
      if (k === "prev") PG.page = Math.max(0, PG.page - 1);
      else if (k === "next") PG.page++;
      else if (k === "all") { PG.all = true; PG.page = 0; ss("v100f_pgall", "1"); }
      else if (k === "pages") { PG.all = false; PG.page = 0; ss("v100f_pgall", null); }
      else if (/^p\d+$/.test(k)) PG.page = +k.slice(1);
      const w = well(); if (!w) return;
      paintPager(w);
      const t = inboxTable(w);
      const top = t && t.closest(".tw") && t.closest(".tw").parentElement && t.closest(".tw").parentElement.querySelector(":scope > .v100pgtop");
      if (top) { try { top.scrollIntoView({ block: "start" }); } catch (e) { /* 無視 */ } }
      /* キーボードで押したときは、同じ働きのボタンへ戻す（描き直しで消えるため） */
      if (ev.detail === 0) setTimeout(() => { try { const nb = w.querySelector(`.v100pg [data-v100pg="${k}"]:not([disabled])`) || w.querySelector(".v100pg [data-v100pg]:not([disabled])"); if (nb) nb.focus({ preventScroll: true }); } catch (e) { /* 無視 */ } }, 0);
      cnt("pgclick");
    } catch (e) { err("pgclick", e); }
  });
  /* 依頼番号で開く（知らせ・ホームの数字など）：その行がほかのページにあれば、そのページへ */
  window.v100fShowReq = function (id) {
    try {
      const w = well(); const t = w && inboxTable(w); if (!t) return false;
      const S = pgState(t);
      const i = S.elig.findIndex((tr) => (tr.dataset.v99rid || "") === id || new RegExp("\\b" + String(id).replace(/[^\w-]/g, "") + "\\b").test(tr.textContent || ""));
      if (i < 0) return false;
      if (!PG.all) { PG.page = Math.floor(i / PS); paintPager(w); }
      return true;
    } catch (e) { err("showreq", e); return false; }
  };
  if (typeof openFwdQuote === "function") {
    const __oq100 = openFwdQuote;
    openFwdQuote = function (id) { const o = __oq100.apply(this, arguments); try { if (fwdOn() && id && page() === "finbox") window.v100fShowReq(id); } catch (e) { err("oq", e); } setTimeout(() => { try { paintDetail(); paintVolUsed(); } catch (e) { err("oqd", e); } }, 200); setTimeout(() => { try { paintVolUsed(); } catch (e) { err("oqv", e); } }, 700); return o; }; // eslint-disable-line no-global-assign
  }

  /* 見積の状況のチップ：状況の言葉が「回答済み（荷主が検討中）」「未登録の区間（荷主は非公開）」に変わったのに、チップは前の言葉（AI回答済み・レーン未登録）で探していて 0件になっていた */
  const CHIPKW = { "AI回答済み|一部AI回答": "AI回答済み|一部AI回答|回答済み", "レーン未登録": "レーン未登録|未登録の区間" };
  function fixChips(w) {
    w.querySelectorAll("[data-uxf][data-kw]").forEach((b) => {
      const k = b.dataset.kw, nk = CHIPKW[k];
      if (nk && k !== nk) { b.dataset.kw = nk; b.dataset.v100kw = k; cnt("chip"); if (b.classList.contains("on") && typeof uxApplyFilter === "function") { try { uxApplyFilter(b.closest(".c")); } catch (e) { err("chipaf", e); } } }
    });
  }

  /* ═══ 開示事項：体験用の依頼の印 ═══════════════════════════════════════ */
  function paintTrialRows(w) {
    const t = inboxTable(w); if (!t || typeof v100fTrialOf !== "function") return;
    const R = (FWDB && FWDB.reqs) || [];
    [...(t.tBodies[0] ? t.tBodies[0].rows : [])].forEach((tr) => {
      const id = tr.dataset.v99rid || (/RQ-[A-Za-z0-9]+/.exec(tr.textContent || "") || [""])[0];
      const r = id && R.find((x) => x && x.id === id);
      const T = r ? v100fTrialOf(r) : null;
      const cell = tr.cells[2];
      if (!cell) return;
      const html = T ? `<span class="v100ftr ${T.kind}" data-noi18n title="${E(v100fTrialWhy(T))}">${E(v100fTrialLabel(T))}</span>` : "";
      put(cell, ":scope > .v100ftr", html);
      if (T && T.kind === "temp") { if (!tr.classList.contains("v100ftrrow")) tr.classList.add("v100ftrrow"); }
      else if (tr.classList.contains("v100ftrrow")) tr.classList.remove("v100ftrrow");
    });
  }
  function trialLines() {
    const S = typeof v100fTrialStats === "function" ? v100fTrialStats() : null;
    if (!S || !S.on || !S.temp) return null;
    return {
      S,
      recv: M(`うち体験用の依頼 ${S.temp}件（3日で消えます・次は ${v100fHm(S.next)}ごろ）・体験用を除くと ${S.base}件`, `incl. ${S.temp} trial request(s) (removed after 3 days) · ${S.base} without them`, `含体验用请求 ${S.temp} 件（3天后删除）・不含则 ${S.base} 件`, `incl. ${S.temp} de prueba · ${S.base} sin ellas`),
      rate: S.rateBase == null ? "" : M(`体験用を除くと そのまま出せる ${S.cleanBase} / ${S.base}件＝${S.rateBase}%`, `Without trial requests: ${S.cleanBase} / ${S.base} = ${S.rateBase}%`, `不含体验用：${S.cleanBase} / ${S.base} = ${S.rateBase}%`, `Sin las de prueba: ${S.cleanBase} / ${S.base} = ${S.rateBase}%`),
      why: M("体験用の依頼＝お客様デモ用のアカウント（荷主）から届いた依頼。受信から3日で消えます（荷主のログアウトでは消えません）。日によって数が変わるので、比べるときは「体験用を除く」数を使ってください。", "Trial requests come from the customer demo account and disappear 3 days after arrival (not on logout). Compare the numbers without them.")
    };
  }
  function paintTrialTiles(w) {
    const L = trialLines();
    const t0 = w.querySelector('[data-rdtile="0"]'), t1 = w.querySelector('[data-rdtile="1"]');
    const lab = (t) => ((t && t.querySelector("b")) || {}).textContent || "";
    if (t0 && /受信した見積依頼|Quote requests/.test(lab(t0))) {
      const box = t0.querySelector("b") ? t0.querySelector("b").parentElement : t0;
      put(box, ":scope > .v100ftrs", L ? `<span class="rd-ts v100ftrs" data-noi18n>${E(L.recv)}</span>` : "");
      if (L && t0.title !== L.why) t0.title = L.why;
    }
    if (t1 && /AI自動回答率|AI auto-answer/.test(lab(t1))) {
      const box = t1.querySelector("b") ? t1.querySelector("b").parentElement : t1;
      put(box, ":scope > .v100ftrs", L && L.rate ? `<span class="rd-ts v100ftrs" data-noi18n>${E(L.rate)}</span>` : "");
    }
  }
  function paintTrialInboxNote(w) {
    const L = trialLines();
    const t = inboxTable(w); if (!t) return;
    const card = t.closest(".c") || t.parentElement;
    const h3 = card && card.querySelector("h3");
    const html = L ? `<p class="v100ftrnote" data-noi18n role="note"><b>${E(M("体験用の依頼の数え方", "How trial requests are counted", "体验用请求的计数方式", "Cómo se cuentan las de prueba"))}</b>${E(M(`：受信 ${L.S.all}件のうち ${L.S.temp}件は、お客様デモ用のアカウント（荷主）から届いた体験用の依頼です（行に「体験用の依頼・3日で消えます」）。受信から3日で消え、荷主がログアウトしても消えません。体験用を除くと ${L.S.base}件${L.S.rateBase != null ? `・AI自動回答率 ${L.S.rateBase}%（そのまま出せる ${L.S.cleanBase}件）` : ""}。`, `: ${L.S.temp} of ${L.S.all} come from the customer demo account (marked “Trial request”). They disappear 3 days after arrival, not on logout. Without them: ${L.S.base}.`))}</p>` : "";
    if (h3) put(card, ":scope > .v100ftrnote", html, "afterend", h3);
  }
  /* 明細の窓 */
  function paintDetail() {
    if (!fwdOn() || typeof v100fTrialOf !== "function") return;
    const det = document.querySelector("#dw .v99fdet, .dwbody .v99fdet");
    if (!det) return;
    const id = det.getAttribute("data-v99rid");
    const r = ((FWDB && FWDB.reqs) || []).find((x) => x && x.id === id);
    const T = r ? v100fTrialOf(r) : null;
    const h = det.querySelector("h3");
    put(det, ":scope > .v100ftrd", T ? `<p class="v100ftrd ${T.kind}" data-noi18n role="note"><b>${E(v100fTrialLabel(T))}</b><span>${E(v100fTrialWhy(T))}</span></p>` : "", "afterend", h);
  }
  /* 物流会社（デモ用）の「ログアウトするとログインのときの状態に戻ります」に、戻らないもの（届いた依頼）を書き足す */
  function paintDemoNote(w) {
    w.querySelectorAll(".v69fst.info").forEach((box) => {
      if (!/デモ用の物流会社アカウント|Demo forwarder account/.test((box.querySelector("b") || {}).textContent || "")) return;
      const sp = box.querySelector("span"); if (!sp) return;
      put(sp, ":scope > .v100fdemo", `<em class="v100fdemo" data-noi18n>${E(M("　荷主から届いた依頼はサーバーにあるので、ログアウトしても消えません（体験用の依頼は、受信から3日で消えます）。", " Requests from shippers are on the server and stay after you log out (trial requests disappear 3 days after arrival).", " 货主发来的请求保存在服务器上，注销后不会消失（体验用请求3天后删除）。", " Las solicitudes de cargadores están en el servidor y no se borran al cerrar sesión."))}</em>`);
    });
  }
  /* 荷主（デモ用）の帯の「3日で消えます」：ログアウトで消えないことを書き足す（21.59 の1行は言葉が変わったときだけ書き直すので、同じ言葉のあいだは残る） */
  const NOTE59 = "物流会社への見積依頼と仮押さえは、デモ物流株式会社（物流会社のデモ用アカウント）の画面に届きます（3日で消えます）";
  function paintShipperNote() {
    try {
      const s = document.querySelector("#v57demobar .v59note");
      if (!s) return;
      const l = (typeof I18N !== "undefined" && I18N && I18N.lang) || "ja";
      if (l !== "ja") return;
      const want = "物流会社への見積依頼と仮押さえは、デモ物流株式会社（物流会社のデモ用アカウント）の受信箱に届き、サーバーに3日残ります（ログアウトしても、3日たつまで物流会社の画面からは消えません。この PC のほかの変更は、ログアウトで消えます）";
      if (s.textContent === NOTE59) { s.textContent = want; cnt("note59"); }
    } catch (e) { err("note59", e); }
  }

  /* ═══ No.605 レート管理：同じ国のレーンの重なり ═══════════════════════════ */
  const DUPF = { on: false, opened: false };
  function rateTable(w) { return [...w.querySelectorAll("table")].find((x) => x.querySelector("tbody [data-frdel]")) || null; }
  const Yp = (r) => `${r.cur || "¥"}${(+r.price || 0).toLocaleString("ja-JP")}${r.unit || ""}`;
  function dupBanner(D) {
    if (!D.groups.length) return "";
    const g2 = D.groups.map((g, gi) => {
      const sp = g.spell.join("・");
      const rows = g.rows.map((x) => `<li>${E(`${x.co ? x.co + "：" : ""}${x.r.pol} → ${x.raw}　${Yp(x.r)}・${x.valid ? M("有効", "valid") : M("期限切れ", "expired")}（${x.r.valid || "—"}）`)}</li>`).join("");
      return `<details class="v100fdupg"${gi === 0 && DUPF.opened ? " open" : ""}><summary>${E(M(`${g.cty}（${g.pol} 発・${g.mode}）${g.rows.length}本：${sp}`, `${g.cty} (from ${g.pol}, ${g.mode}) ${g.rows.length} rows: ${sp}`))}<small>${E(M(`（有効 ${g.nValid}本・期限切れ ${g.nExp}本）`, ` (${g.nValid} valid, ${g.nExp} expired)`))}</small></summary>
        <ul class="v100fdupr">${rows}</ul><p class="v100fduph">${E(M("まとめ方の案：", "Suggestions: "))}</p><ul class="v100fdupp2">${g.plan.map((p) => `<li>${E(p)}</li>`).join("")}</ul></details>`;
    }).join("");
    const sum = D.groups.map((g) => M(`${g.cty} ${g.rows.length}本`, `${g.cty} ${g.rows.length}`)).join("・");
    return `<div class="v100fdup" data-noi18n role="group" aria-label="${E(M("同じ国のレーンの重なり", "Same-country lanes"))}">
      <p class="v100fdupt"><b>${E(M(`同じ国のレーンが、書き方の違いで重なっています（${D.groups.length}組・${D.nRows}本：${sum}）`, `Lanes for the same country are registered under different names (${D.groups.length} groups, ${D.nRows} rows: ${sum})`, `同一国家的线路因写法不同而重复（${D.groups.length}组・${D.nRows}条）`, `Rutas del mismo país con nombres distintos (${D.groups.length} grupos)`))}</b>
      <span>${E(M("相見積・中央値では同じ国として数えます（No.535 の母集団の「か所」も国でそろえます）。データは消したり、まとめたりしていません。下の組を開くと、どれとどれが重なっているかと、まとめ方の案が出ます。", "Counted as one country in comparisons and medians. Nothing was deleted or merged. Open a group for details and suggestions."))}</span></p>
      ${g2}
      <p class="v100fdupb"><button type="button" class="v100fdupx${DUPF.on ? " on" : ""}" data-v100dup="on" aria-pressed="${DUPF.on}">${E(M(`重なっている行だけ表示（${D.nRows}本）`, `Show only overlapping rows (${D.nRows})`, `仅显示重复的行（${D.nRows}）`, `Solo las superpuestas (${D.nRows})`))}</button><button type="button" class="v100fdupx${DUPF.on ? "" : " on"}" data-v100dup="off" aria-pressed="${!DUPF.on}">${E(M("すべての行", "All rows", "全部", "Todas"))}</button></p></div>`;
  }
  function paintRates(w) {
    const t = rateTable(w); if (!t || typeof v100fLaneDups !== "function") return;
    const D = v100fLaneDups();
    V.dups = { groups: D.groups.length, rows: D.nRows, at: Date.now() };
    [...t.tBodies[0].rows].forEach((tr) => {
      const del = tr.querySelector("[data-frdel]"); if (!del) return;
      const i = +del.getAttribute("data-frdel"), g = D.byIdx[i];
      const cell = tr.cells[1] || tr.cells[0];
      put(cell, ":scope > .v100fdupp", g ? `<span class="v100fdupp" data-noi18n title="${E(M(`同じ国（${g.cty}）のレーンが別の書き方でもあります：${g.spell.join("・")}`, `Same country also registered as: ${g.spell.join(", ")}`))}">${E(M(`同じ国：${g.cty}（${g.rows.length}本）`, `Same country: ${g.cty} (${g.rows.length})`, `同一国家：${g.cty}（${g.rows.length}）`, `Mismo país: ${g.cty} (${g.rows.length})`))}</span>` : "");
      const off = DUPF.on && !g;
      if (tr.classList.contains("v100fdupoff") !== off) tr.classList.toggle("v100fdupoff", off);
    });
    const tw = t.closest(".tw") || t;
    put(tw.parentElement, ":scope > .v100fdup", dupBanner(D), "beforebegin", tw);
    cnt("rates");
  }
  document.addEventListener("click", (ev) => {
    try {
      const b = ev.target && ev.target.closest && ev.target.closest("[data-v100dup]");
      if (!b) return;
      ev.preventDefault();
      const on = b.getAttribute("data-v100dup") === "on";
      const w = well(); const t = w && rateTable(w);
      if (on && !DUPF.on) {
        /* 期限切れでたたんだ行も見せる（戻すときは元どおりにたたむ） */
        DUPF.unfold = false;
        try { if (t && t.classList.contains("v89fhide") && typeof window.v89fShowExpired === "function") { window.v89fShowExpired(true); DUPF.unfold = true; } } catch (e) { /* 無視 */ }
      } else if (!on && DUPF.on && DUPF.unfold) {
        try { if (typeof window.v89fShowExpired === "function") window.v89fShowExpired(false); } catch (e) { /* 無視 */ }
        DUPF.unfold = false;
      }
      DUPF.on = on;
      if (w) paintRates(w);
      cnt("dupf");
    } catch (e) { err("dupf", e); }
  });
  document.addEventListener("toggle", (ev) => { try { if (ev.target && ev.target.classList && ev.target.classList.contains("v100fdupg")) DUPF.opened = !!ev.target.open; } catch (e) { /* 無視 */ } }, true);

  /* 手入力の「追加」：同じ国のレーンがあれば確かめる（キャンセル＝登録しない） */
  document.addEventListener("click", (ev) => {
    try {
      const b = ev.target && ev.target.closest && ev.target.closest("#frAdd");
      if (!b || !fwdOn() || typeof v100fDupCheck !== "function") return;
      const v = (id) => { const e = document.getElementById(id); return e ? String(e.value || "").trim() : ""; };
      const pod = v("frPod"); if (!pod) return;
      const d = v100fDupCheck(v("frPol"), pod, v("frMode") || "LCL", v("frCo"));
      if (!d) return;
      const msg = v100fDupMsg(d) + "\n\n" + M("このまま登録しますか？（キャンセル＝登録しないで、仕向けの名前を直せます）", "Register anyway? (Cancel = do not register, fix the name)");
      V.lastDup = { pod, cty: d.cty, n: d.hit.length, at: Date.now() };
      let ok = true;
      try { ok = window.confirm(msg); } catch (e) { ok = true; }
      if (!ok) {
        ev.preventDefault(); ev.stopImmediatePropagation();
        try { const p = document.getElementById("frPod"); if (p) { p.focus(); p.select(); } } catch (e) { /* 無視 */ }
        try { if (typeof toast === "function") toast(M(`登録していません。仕向けの名前を「${d.cty}」にそろえると、同じ国のレーンとして扱われます`, `Not registered. Use “${d.cty}” to keep the same country together`)); } catch (e) { /* 無視 */ }
        V.lastDup.cancel = 1;
      } else {
        V.lastDup.ok = 1;
        setTimeout(() => { try { if (typeof toast === "function") toast(M(`登録しました（同じ国「${d.cty}」のレーンがほかにもあります。レート管理の上の「同じ国のレーンの重なり」で確かめられます）`, `Registered (other lanes for ${d.cty} exist)`)); } catch (e) { /* 無視 */ } }, 400);
      }
      cnt("adddup");
    } catch (e) { err("adddup", e); }
  }, true);

  /* 取り込みの確認の表：行ごとの「同じ国のレーン」と、60行で切れていた残りの行 */
  const IMP = { all: {} };
  function impBatches() { try { const X = window.__v2192fwd; return (X && X.imp && X.imp.batches) || []; } catch (e) { return []; } }
  function impRowHtml(b, bi, i) {
    const x = b.rows[i], r = x.rate || {};
    const nt = (x.notes || []).slice();
    if (x.dup) nt.unshift(M(`同じ区間が ${x.dup}行目にもあります。あとの行（${x.dup}行目）を使うので、この行は登録しません`, `Same lane also on row ${x.dup}`));
    if (x.exp) nt.unshift(M(`期限切れ（${r.valid} は過ぎた日付）。見積に使われないので、チェックを外してあります`, `Expired (${r.valid})`));
    return `<tr class="${x.exp ? "exp" : ""}${x.dup ? " dup" : ""} v100impx"><td><input type="checkbox" data-v92fimpc="${bi}:${i}"${x.use ? " checked" : ""}${x.dup ? " disabled" : ""} aria-label="${E(`${r.pol} → ${r.pod}・${r.mode}`)}"></td><td class="n">${E(x.line)}</td><td><b>${E(r.pol)} → ${E(r.pod)}</b> <span class="p ${r.mode === "LCL" ? "on" : "or"}">${E(r.mode)}</span>${nt.length ? `<div class="v92fnt">${nt.map(E).join("<br>")}</div>` : ""}</td><td class="num">${E(Yp(r))}</td><td class="num">${E(r.tt)}${E(M("日", "d"))}</td><td class="n">${E(r.valid)}</td></tr>`;
  }
  function paintImport() {
    const st = document.getElementById("fwdupst");
    if (!st) return;
    const B = impBatches();
    st.querySelectorAll(".v92fimp").forEach((box, bi) => {
      const b = B[bi]; if (!b) return;
      const tb = box.querySelector(".v92fimpt tbody");
      const MAX = 60;
      if (tb && b.rows.length > MAX) {
        const extra = b.rows.length - MAX;
        const p = [...box.querySelectorAll(".v92fimps")].find((x) => /ほか \d+行|and \d+ more rows/.test(x.textContent || ""));
        if (IMP.all[bi]) {
          if (!tb.querySelector("tr.v100impx")) { tb.insertAdjacentHTML("beforeend", b.rows.slice(MAX).map((_, j) => impRowHtml(b, bi, MAX + j)).join("")); cnt("impall"); }
          if (p && !p.dataset.v100) { p.dataset.v100 = "1"; p.textContent = M(`全 ${b.rows.length}行を表示しています（チェックを外した行は登録しません）`, `All ${b.rows.length} rows are shown`); }
        } else if (p && !p.querySelector("[data-v100imp]")) {
          p.insertAdjacentHTML("beforeend", ` <button type="button" class="btn g v100impb" data-v100imp="${bi}" data-noi18n>${E(M(`残りの ${extra}行も見る（チェックを外せます）`, `Show the other ${extra} rows`, `查看其余 ${extra} 行`, `Ver las otras ${extra} filas`))}</button>`);
        }
      }
      /* 同じ国のレーン（書き方の違い）の知らせ */
      if (typeof v100fDupCheck === "function") box.querySelectorAll(".v92fimpt tbody tr").forEach((tr) => {
        const c = tr.querySelector("input[data-v92fimpc]"); if (!c) return;
        const [bj, i] = String(c.getAttribute("data-v92fimpc")).split(":").map(Number);
        const x = B[bj] && B[bj].rows[i]; if (!x || !x.rate) return;
        const d = v100fDupCheck(x.rate.pol, x.rate.pod, x.rate.mode, b.co);
        const cell = tr.cells[2]; if (!cell) return;
        put(cell, ":scope > .v100fimpw", d ? `<div class="v100fimpw" data-noi18n>${E(v100fDupMsg(d))}</div>` : "");
      });
    });
  }
  document.addEventListener("click", (ev) => {
    try { const b = ev.target && ev.target.closest && ev.target.closest("[data-v100imp]"); if (!b) return; ev.preventDefault(); IMP.all[+b.getAttribute("data-v100imp")] = 1; b.remove(); paintImport(); } catch (e) { err("imp", e); }
  });

  /* 相見積：同じ国が別の行に分かれていることを1行で */
  function paintAgg(w) {
    const h = [...w.querySelectorAll("h3")].find((x) => /^(レーン別の集計とAI物流マンの推奨|Lane summary & AI pick)/.test((x.textContent || "").trim()));
    if (!h || typeof v100fLaneDups !== "function") return;
    const card = h.closest(".c") || h.parentElement; if (!card) return;
    const D = v100fLaneDups();
    const html = D.groups.length ? `<p class="v100faggdup" data-noi18n role="note">${E(M(`同じ国が書き方の違いで別の行になっている区間があります：${D.groups.map((g) => g.spell.join("／")).join("、")}。相見積で比べるときは同じ国として見てください（「物流レート管理」の上に、まとめ方の案があります）。`, `Some countries appear under different names: ${D.groups.map((g) => g.spell.join("/")).join(", ")}. See Rate management for suggestions.`))}</p>` : "";
    put(card, ":scope > .v100faggdup", html, "afterend", h);
  }

  /* ═══ 引き継ぎ① 見積の窓の「計算に使った容積」（21.97 No.519）═══════════════════
     21.97（v97\rd_v97fwd.js paintDrawer）は見出し「国ごとの見積」の前に入れるが、刷新版の窓にその見出しが無く、荷主・物流会社とも出ていなかった。
     刷新版の窓の「届いた見積」（なければ最初の国のカード・窓の見出し）の前に、同じ中身の1行を入れる（21.97 が入れたときは何もしない） */
  const CB = (n) => { const x = +n || 0; return x.toLocaleString("ja-JP", { maximumFractionDigits: 2 }); };
  function volUsedText(r) {
    const legs = (r.legs || []).filter((l) => l && l.ok && l.quote);
    const cour = (legs.length && legs.every((l) => l.quote.courier || /COURIER/i.test(String(l.quote.mode || "")))) || (!legs.length && /COURIER/i.test(String(r.mode || "")));
    const air = legs.some((l) => /AIR/i.test(String(l.quote.mode || "")));
    let t = cour ? M("この見積は小包（最小重量帯の1個）の運賃で計算しています（容積は使いません）。", "This quote uses the courier rate for one parcel (volume not used).")
      : M(`この見積は、依頼のときに共有した容積 ${CB(r.cbm)} m³ で計算しています${air ? `（航空は容積重量 ${Math.round((+r.cbm || 0) * 167)}kg）` : ""}。`, `This quote is calculated with the shared volume ${CB(r.cbm)} m³${air ? ` (air: volumetric ${Math.round((+r.cbm || 0) * 167)} kg)` : ""}.`);
    if (fwdOn() && page() !== "" && typeof v96fVolOf === "function") {
      const ap = legs.map((l) => { try { return v96fVolOf(r.id, l.cty); } catch (e) { return null; } }).filter(Boolean);
      if (ap.length) t += M(` B/L の容積 ${CB(ap[0].cbm)} m³ で計算し直した見積を反映しています（${ap.length}か国・元に戻せます）。荷主の画面の見積は、荷主が数量を直して再見積するまで元の金額です。`, ` The B/L volume ${CB(ap[0].cbm)} m³ is applied (${ap.length}).`);
    } else if (!cour) t += M(" B/L などで容積が変わったときは、物流会社から依頼ページかメールで知らせが届きます（数量を直して「再見積を依頼」できます）。", " If the B/L volume differs, the forwarder will tell you (you can correct the quantity and request a new quote).");
    return t;
  }
  function paintVolUsed() {
    try {
      ["#pn", "#dw"].forEach((sel) => {
        const box = document.querySelector(sel);
        if (!box || !box.getClientRects().length) return;
        const m = /RQ-[A-Za-z0-9]+/.exec(((box.querySelector("h3") || {}).textContent || "") + " " + (box.textContent || "").slice(0, 600));
        if (!m) return;
        const R = (typeof FWDB !== "undefined" && FWDB && FWDB.reqs) || [];
        const r = R.find((x) => x && x.id === m[0]);
        if (!r) return;
        const own = box.querySelector(".v97fvolused:not(.v100fvol)");
        if (own) { const o = box.querySelector(".v100fvol"); if (o) o.remove(); return; }
        const html = `<p class="nn v97fvolused v100fvol" data-noi18n role="note" data-rid="${E(r.id)}"><b>${E(M("計算に使った容積", "Volume used", "计算所用的体积", "Volumen usado"))}</b>${E(M("：", ": "))}${E(volUsedText(r))}</p>`;
        const cur = box.querySelector(".v100fvol");
        if (cur && cur.dataset.rid === r.id && cur.dataset.sig === hash(html)) return;
        if (cur) cur.remove();
        const anchor = [...box.querySelectorAll(".k-h, p.lbl, h4")].find((x) => /^(届いた見積|国ごとの見積|Quotes received|Quotes by country)/.test((x.textContent || "").trim())) || box.querySelector(".fwdleg") || box.querySelector(".v99fdet");
        const tmp = document.createElement("div"); tmp.innerHTML = html; const el = tmp.firstElementChild; el.dataset.sig = hash(html);
        if (anchor && anchor.parentElement) anchor.insertAdjacentElement(anchor.classList.contains("v99fdet") ? "afterend" : "beforebegin", el);
        else { const h = box.querySelector("h3"); if (h) h.insertAdjacentElement("afterend", el); else return; }
        cnt("volused");
      });
    } catch (e) { err("volused", e); }
  }
  if (typeof v45OpenQuote === "function") {
    const __vq100 = v45OpenQuote;
    v45OpenQuote = function () { const o = __vq100.apply(this, arguments); [60, 300, 900].forEach((ms) => setTimeout(paintVolUsed, ms)); return o; }; // eslint-disable-line no-global-assign
  }

  /* ═══ 引き継ぎ④ レート管理の書き換えが回り続ける（21.96 rd_v96fwd.js の .v90fchkt を毎回書く → 用語の印 → また書く）═══
     .v90fchkt の textContent に「同じ文字なら書かない」を付ける（違う文字のときは今までどおり書く）。用語の印（abbr）も消されない */
  const TCD = Object.getOwnPropertyDescriptor(Node.prototype, "textContent");
  function guardText(root) {
    if (!TCD || !TCD.get || !TCD.set) return;
    root.querySelectorAll(".v90fchkt").forEach((el) => {
      if (el.__v100tc) return;
      el.__v100tc = 1;
      try {
        Object.defineProperty(el, "textContent", { configurable: true, enumerable: true,
          get() { return TCD.get.call(this); },
          set(v) { const s = v == null ? "" : String(v); if (TCD.get.call(this) === s) { V.n.tcSkip = (V.n.tcSkip || 0) + 1; return; } TCD.set.call(this, s); } });
      } catch (e) { err("guard", e); }
    });
  }

  /* ═══ 引き継ぎ⑥ 会社のメニューを Esc で閉じても aria-expanded が "true" のまま（rd_v92all.js の .k-co）═══ */
  document.addEventListener("keydown", (e) => {
    try {
      if (e.key !== "Escape") return;
      setTimeout(() => {
        document.querySelectorAll(".k-co[aria-expanded]").forEach((co) => {
          const dd = co.parentElement && co.parentElement.querySelector(".k-dd");
          const open = !!(dd && dd.classList.contains("on"));
          if (co.getAttribute("aria-expanded") !== String(open)) {
            const had = dd && dd.contains(document.activeElement);
            co.setAttribute("aria-expanded", String(open));
            if (!open && had) { try { co.focus(); } catch (x) { /* 無視 */ } }
            cnt("escAria");
          }
        });
      }, 0);
    } catch (x) { err("esc", x); }
  });

  /* ═══ 描き直しのたびに ═══════════════════════════════════════════════ */
  function paint() {
    try { paintShipperNote(); } catch (e) { err("note", e); }
    try {
      if (!fwdOn()) return;
      const w = well(); if (!w) return;
      const pg = page(), k = rdKey();
      try { paintDemoNote(w); } catch (e) { err("demo", e); }
      if (k === "fhome") { try { paintTrialTiles(w); } catch (e) { err("tiles", e); } }
      if (k === "finbox" || pg === "finbox") {
        try { fixChips(w); } catch (e) { err("chips", e); }
        try { paintTrialRows(w); } catch (e) { err("trows", e); }
        try { paintTrialInboxNote(w); } catch (e) { err("tnote", e); }
        try { paintPager(w); } catch (e) { err("pager", e); }
      } else if (pg === "frates") {
        try { guardText(w); } catch (e) { err("guardp", e); }
        try { paintRates(w); } catch (e) { err("rates", e); }
        try { paintImport(); } catch (e) { err("import", e); }
      } else if (pg === "fagg") { try { paintAgg(w); } catch (e) { err("agg", e); } }
      try { paintDetail(); } catch (e) { err("det", e); }
      try { paintVolUsed(); } catch (e) { err("vol", e); }
    } catch (e) { err("paint", e); }
  }
  window.v100fRepaint = paint;
  if (typeof fwdRender === "function") {
    const __fr100 = fwdRender;
    fwdRender = function () { const o = __fr100.apply(this, arguments); try { paint(); } catch (e) { err("render", e); } return o; }; // eslint-disable-line no-global-assign
  }
  if (typeof uxApplyFilter === "function") {
    const __af100 = uxApplyFilter;
    uxApplyFilter = function () { const o = __af100.apply(this, arguments); try { const w = well(); if (w && fwdOn() && page() === "finbox") paintPager(w); } catch (e) { err("af", e); } return o; }; // eslint-disable-line no-global-assign
  }
  try {
    let t = 0;
    const mo = new MutationObserver(() => {
      if (t) return;
      t = setTimeout(() => { t = 0; paint(); try { mo.takeRecords(); } catch (e) { /* 無視 */ } }, 90);
    });
    const hookW = () => {
      const w0 = well(); if (w0 && !w0.dataset.v100mo) { w0.dataset.v100mo = "1"; mo.observe(w0, { childList: true, subtree: true }); }
      const pn = document.getElementById("dw"); if (pn && !pn.dataset.v100mo) { pn.dataset.v100mo = "1"; mo.observe(pn, { childList: true, subtree: true }); }
      const bar = document.getElementById("v57demobar"); if (bar && !bar.dataset.v100mo) { bar.dataset.v100mo = "1"; mo.observe(bar, { childList: true, subtree: true, characterData: true }); }
    };
    hookW();
    setInterval(hookW, 1500);
    /* 「hidden」（絞り込み）の付け外しは childList に出ないので、表の行の hidden だけを見張る */
    const moH = new MutationObserver(() => { if (t) return; t = setTimeout(() => { t = 0; paint(); try { moH.takeRecords(); } catch (e) { /* 無視 */ } }, 90); });
    setInterval(() => { try { const w = well(); const tb = w && page() === "finbox" && inboxTable(w); const body = tb && tb.tBodies[0]; if (body && !body.dataset.v100h) { body.dataset.v100h = "1"; moH.observe(body, { attributes: true, subtree: true, attributeFilter: ["hidden"] }); } } catch (e) { /* 無視 */ } }, 700);
  } catch (e) { err("mo", e); }
  try { if (window.RDX && typeof RDX.after === "function") { const prev = RDX.after; RDX.after = function () { const r = prev.apply(this, arguments); try { paint(); } catch (e) { err("after", e); } return r; }; } } catch (e) { err("afterwrap", e); }
  setInterval(() => { try { paintShipperNote(); } catch (e) { /* 無視 */ } }, 1600);
  setTimeout(paint, 0);
})();
