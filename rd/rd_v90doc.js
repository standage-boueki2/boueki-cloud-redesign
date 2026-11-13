/* 貿易クラウドAI商社マン デザイン刷新：21.90 doc（2026-11-13・改修一覧〔大森パート〕No.424・426・427・433・440）刷新版の層
   ① No.424 送り状番号に「？」が重なる：用語の印（rd_uat.js termScan）が「MN-CI-JD7-2608-01」の中の CI・PI を用語として拾っていた
        → 番号・コードの中（前後が「-」「_」「/」や英数字）に付いた印は外し、その部分を英語の欄（lang=en）にして付け直さない
   ② No.426 スタートガイド：ログイン前に開くと「各手順のボタンから、その画面を開けます」とあるのにボタンが無い
        → ログイン前でも各手順にボタンを出す（押すとログインの欄へ。ログインしたらその画面を開く）。冒頭の文もログイン前は合わせる
   ③ No.427 用語集：学ぶ画面に見えない（登録・CSV・5か国語の欄と同居）
        → 用語集の画面の上に「貿易のことばを学ぶ」（言葉で探せる一覧・全語）を置き、下の登録の欄の前に「会社の訳を登録する」の区切りを入れる（今の欄は1つも隠さない）。
          見出しの説明と「点線の言葉は…」の案内も、マウスを乗せても出ることを書く
   ④ No.433 一覧で英語のメッセージが途中で切れる → 案件の一覧の「最終やりとり」は2行まで出し、指を置くと全文。案件の詳細のやりとりは「全文を表示」で開く。
        ほかの「…」で切れる欄も、指を置くと全文（title）
   今のアプリの関数・刷新版の層の関数は呼ぶだけ（差し替えない） */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v90doc) return;
  RD._v90doc = 1;
  const esc = RD.esc || ((s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]));
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const V = (window.V90RD = { err: [], qgPend: "" });
  const err = (k, e) => { try { V.err.push(k + ": " + String((e && e.message) || e).slice(0, 160)); if (V.err.length > 30) V.err.shift(); } catch (x) { /* 無視 */ } };
  const fwd = () => { try { return !!RD.isFwd(); } catch (e) { return false; } };
  const locked = () => { try { return !!RD.locked(); } catch (e) { return false; } };
  const cur = () => { try { return RD.curKey(); } catch (e) { return ""; } };

  /* ───── ① 番号・コードの中の用語の印を外す ───── */
  const CODE_L = /[A-Za-z0-9][-_/.]$|[-_/]$/, CODE_R = /^[-_/][A-Za-z0-9]|^[A-Za-z0-9]/;
  function unmarkCodes() {
    const w = document.getElementById("well"); if (!w) return 0;
    let n = 0;
    $$("abbr.k-term", w).forEach((ab) => {
      const p = ab.previousSibling, q = ab.nextSibling;
      const pt = p && p.nodeType === 3 ? p.nodeValue : "", qt = q && q.nodeType === 3 ? q.nodeValue : "";
      if (!(CODE_L.test(pt) || CODE_R.test(qt))) return;
      const sp = document.createElement("span"); sp.setAttribute("lang", "en"); sp.className = "v90no"; sp.textContent = ab.textContent;
      ab.replaceWith(sp); n++;
    });
    return n;
  }
  V.unmarkCodes = unmarkCodes;

  /* ───── ② スタートガイド（ログイン前） ───── */
  const QS_GO = [[["up", "商品を登録する"]], [["cty", "販売先国の選定を開く"]], [["deck", "営業資料を開く"], ["db", "AIバイヤー開拓を開く"]], [["dash:home", "案件を開く"]], [["ai", "AI商社マンに聞く"]]];
  function qgFix() {
    const d = document.getElementById("k-qg"); if (!d || d.dataset.v90) return;
    d.dataset.v90 = "1";
    if (d.querySelector("[data-qggo]")) return; // ログイン後は今のまま（ボタンあり）
    if (!/荷主向け/.test((d.querySelector(".k-qgchip") || {}).textContent || "")) return;
    const p = d.querySelector(".k-qghd p");
    if (p) p.textContent = "AI商社マンは、この5つの順で使います。各手順のボタンを押すとログインの欄へ進み、ログインすると、その画面が開きます。";
    $$(".k-qgst > li", d).forEach((li, i) => {
      const go = QS_GO[i]; const tx = li.querySelector(".k-qgtx"); if (!go || !tx || tx.querySelector(".k-qggo")) return;
      tx.insertAdjacentHTML("beforeend", `<div class="k-qggo">${go.map((g) => `<button type="button" class="k-btn white k-mini" data-v90qg="${esc(g[0])}">${esc(g[1])}（ログインして開く）</button>`).join("")}</div>`);
    });
  }
  function qgLoginFocus() { const c = document.getElementById("lg-code") || document.getElementById("lg-mail") || document.querySelector("#lgv input"); if (c) { try { c.focus(); c.scrollIntoView({ block: "center" }); } catch (e) { /* 無視 */ } } }
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest("[data-v90qg]"); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    V.qgPend = b.dataset.v90qg; try { sessionStorage.setItem("bc20_v90qg", V.qgPend); } catch (x) { /* 無視 */ }
    const d = document.getElementById("k-qg"); if (d) { const x = d.querySelector("[data-qgclose]"); if (x) x.click(); else { d.remove(); document.documentElement.classList.remove("k-qgon"); } }
    setTimeout(qgLoginFocus, 50);
  }, true);
  function qgAfterLogin() {
    let k = V.qgPend; try { k = k || sessionStorage.getItem("bc20_v90qg") || ""; } catch (e) { /* 無視 */ }
    if (!k || locked()) return;
    V.qgPend = ""; try { sessionStorage.removeItem("bc20_v90qg"); } catch (e) { /* 無視 */ }
    if (fwd()) return;
    setTimeout(() => { try { RD.goKey(k); } catch (e) { err("qggo", e); } }, 600);
  }

  /* ───── ③ 用語集：学ぶ欄と登録の欄を分ける ───── */
  function glList() {
    const D = RD.termDict ? RD.termDict() : {}; const seen = new Set(), L = [];
    Object.keys(D).forEach((k) => { const x = D[k]; if (!x || !x.s) return; const n = x.n || k; const id = n + "\n" + x.s; if (seen.has(id)) return; seen.add(id); L.push({ n, s: x.s, long: x.long || "" }); });
    return L.sort((a, b) => a.n.localeCompare(b.n, "ja"));
  }
  function glossPage() {
    if (cur() !== "gloss" || fwd()) return;
    const w = document.getElementById("well"); if (!w || w.querySelector(".v90gl")) return;
    const hero = w.querySelector("[data-rdhero]");
    const hp = hero && hero.querySelector(".rd-ht > p:not(.k-termhint)");
    if (hp && !hp.dataset.v90) { hp.dataset.v90 = "1"; hp.textContent = "貿易のことばを、探して学べるページです。下の「会社の訳を登録する」では、営業資料・メールの訳をそろえられます。"; }
    const L = glList();
    const sec = document.createElement("section");
    sec.className = "k-card v90gl"; sec.setAttribute("aria-labelledby", "v90glt");
    sec.innerHTML = `<div class="v90glh"><h2 id="v90glt">貿易のことばを学ぶ（${L.length}語）</h2><p>画面の点線の言葉は、押すか、マウスを乗せると説明が出ます。ここでは、言葉で探して読めます。</p></div>
      <label class="k-glq v90glq"><input type="search" id="v90glq" placeholder="言葉で探す（例：FOB、B/L、HS、コード）" autocomplete="off" aria-label="用語を言葉で探す"></label>
      <p class="v90gln" id="v90gln" aria-live="polite"></p>
      <ul class="v90gll" id="v90gll">${L.map((x) => `<li data-q="${esc((x.n + " " + x.s + " " + x.long).toLowerCase())}"><b>${esc(x.n)}</b><p>${esc(x.s)}</p>${x.long ? `<details><summary>くわしく</summary><p>${esc(x.long)}</p></details>` : ""}</li>`).join("")}</ul>`;
    const anchor = hero ? hero.nextElementSibling : w.firstElementChild;
    if (anchor) anchor.before(sec); else w.prepend(sec);
    const q = sec.querySelector("#v90glq");
    q.addEventListener("input", () => {
      const v = q.value.trim().toLowerCase(); let n = 0;
      $$("#v90gll li", sec).forEach((li) => { const hit = !v || li.dataset.q.includes(v); li.hidden = !hit; if (hit) n++; });
      sec.querySelector("#v90gln").textContent = v ? (n ? `${n}語が見つかりました` : "見つかりませんでした。英字・カタカナなど、別の書き方でも探せます。わからないときは「AIに聞く」で聞けます。") : "";
    });
    // 登録の欄の前に区切り（今の欄はそのまま）
    const reg = $$(".c, .k-card, section", w).find((c) => c !== sec && !c.contains(sec) && /CSV で書き出す|登録した用語/.test(c.textContent || "") && !c.querySelector(".c, .k-card"));
    if (reg && !w.querySelector(".v90glreg")) reg.insertAdjacentHTML("beforebegin", `<div class="v90glreg" role="note"><h2>会社の訳を登録する（営業資料・メールの訳をそろえる）</h2><p>ここから下は、学ぶ欄ではなく、会社で決めた訳（商品名・ブランド名・決まった言い方）を登録する欄です。登録した訳は、営業資料・メールの点検で使います。</p></div>`);
  }
  function termHintFix() {
    const h = document.querySelector("#well .k-termhint"); if (!h || h.dataset.v90) return;
    h.dataset.v90 = "1";
    const t = Array.from(h.childNodes).find((n) => n.nodeType === 3 && /押すと説明が出ます/.test(n.nodeValue));
    if (t) t.nodeValue = t.nodeValue.replace("押すと説明が出ます", "押すか、マウスを乗せると説明が出ます");
  }

  /* ───── ④ 途中で切れる文：全文を出す道 ───── */
  const clean = (s) => String(s || "").replace(/[*#>`_]/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  function caseTable() {
    const rows = $$("#well .k-cltbl tr.k-clrow"); if (!rows.length) return;
    let all = null; const ord = RD._caseOrder || [];
    rows.forEach((r, i) => {
      const lt = r.querySelector(".k-lt"); if (!lt || lt.dataset.v90) return;
      if (!all) { try { all = RD.allCases(); } catch (e) { all = []; } }
      const c = all.find((x) => x.key === ord[i]); const lm = c && c.last; if (!lm) return;
      const full = clean(lm.subj || lm.body); if (!full) return;
      lt.dataset.v90 = "1"; lt.title = full; lt.classList.add("v90lt");
      const b = lt.querySelector("b"); const tn = b ? b.nextSibling : lt.firstChild;
      const one = full.replace(/\s+/g, " ");
      if (tn && tn.nodeType === 3) tn.nodeValue = one.length > 90 ? one.slice(0, 89) + "…" : one;
    });
  }
  function caseMsgs() {
    if (cur() !== "dash:case") return;
    const ol = document.querySelector("#well .k-cdmsgs .k-tl"); if (!ol || ol.dataset.v90 === String(RD.caseKey)) return;
    let c = null; try { c = RD.allCases().find((x) => x.key === RD.caseKey); } catch (e) { c = null; }
    if (!c) return;
    ol.dataset.v90 = String(RD.caseKey);
    const msgs = c.msgs.slice().reverse();
    $$(":scope > li", ol).forEach((li, i) => {
      const m = msgs[i]; const p = li.querySelector(".k-tlb p"); if (!m || !p || li.querySelector(".v90more")) return;
      const full = clean(m.body); const short = p.textContent;
      const cut = full.replace(/\s+/g, " ").length > short.replace(/\s+/g, " ").replace(/…$/, "").length + 1 || p.scrollHeight > p.clientHeight + 2;
      if (!cut) return;
      const bt = document.createElement("button"); bt.type = "button"; bt.className = "k-link v90more"; bt.setAttribute("aria-expanded", "false"); bt.textContent = "全文を表示";
      bt.addEventListener("click", (e) => { e.stopPropagation(); const on = !p.classList.contains("v90open"); p.classList.toggle("v90open", on); p.textContent = on ? full : short; bt.textContent = on ? "たたむ" : "全文を表示"; bt.setAttribute("aria-expanded", String(on)); });
      p.after(bt);
    });
  }
  const ELL = ".k-row .k-rt b, .k-row .k-rt small, .k-cltbl .c-who small, .k-tlh b, .k-tn, .k-pcnm small, .rd-li .rd-lt, .rd-kv dd";
  function ellTitles() { $$(ELL, document.getElementById("well") || document).forEach((x) => { if (x.title || x.scrollWidth <= x.clientWidth + 1) return; x.title = (x.textContent || "").trim(); }); }

  /* ───── まとめて動かす ───── */
  let busy = false;
  function pass() {
    if (busy) return; busy = true;
    try { unmarkCodes(); } catch (e) { err("codes", e); }
    try { qgFix(); } catch (e) { err("qg", e); }
    try { if (!locked()) { qgAfterLogin(); glossPage(); termHintFix(); caseTable(); caseMsgs(); ellTitles(); } } catch (e) { err("pass", e); }
    busy = false;
  }
  V.pass = pass;
  let tmo = 0;
  const mo = new MutationObserver(() => { if (busy || tmo) return; tmo = setTimeout(() => { tmo = 0; pass(); }, 120); });
  const start = () => { try { mo.observe(document.body, { childList: true, subtree: true }); } catch (e) { /* 無視 */ } pass(); };
  if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
})();
