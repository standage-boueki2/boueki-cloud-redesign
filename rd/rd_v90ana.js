/* 貿易クラウドAI商社マン 21.90 ana の刷新版の層（rd_v89badge.js のあとに読む）
   No.382 やりとり（msg）の「受信箱の概要」：刷新版が自分で数えていた（最後の発言が相手＝要対応・最後の発言がこちら＝返信待ち〔日数の区切りなし〕）
          → アプリの v90anaMsgStat（受信箱・分析・レポートと同じ数え方）の数にし、何を数えたかを数の下に書く
   No.425 左のメニュー「案件」の札（要対応の数）が、案件の数（すべて 5）と同じ場所で「4」とだけ出て、案件の数に見えた
          → 札に「要対応」と書く（数は案件一覧の「要対応」のタブと同じ）
   No.388 通知センターの見出し「今すぐ対応が必要なこと N件」は既読・急ぎでない知らせも含めた全部の数だった → 「いま出ている知らせ（既読を含む）」に
   No.383 チーム概要の数の下の説明（台帳に登録 N名＋ログイン中のあなた）が、刷新版の「小さな字を隠す」（descSmall）で隠れていた → 隠さない
   No.432 物流会社のメンバー・担当のチーム概要に、荷主の項目「登録している商品 0商品」が出ていた → 「見積依頼の荷主 N社」（荷主ごとの担当と同じ数）に
   No.400 「誰が何をできる？」の「代表」の説明が、同じ descSmall で隠れて空に見えた → 隠さない（管理者・メンバーと同じく見せる）
   No.451 見本（架空）のデータと実データの区別がつかない（前の決め「見本の案件は『見本』の札」に合わせる。データは消さない・隠さない）
          荷主：案件一覧の行・商品一覧のカードに「見本」の札（見本の商品＝TENS の src "sample2"）、一覧の上に「見本 N件／全 M件」の帯
          物流会社：見本の物流会社（今のアプリの V45_SMPCO）のレート・推奨・相見積が出ている画面の上に、どれが見本かと
          「数字に見本のレートが入っている」ことを書き、表の見本の会社のセルに「見本」の札 */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v90ana) return;
  RD._v90ana = 1;
  const { $, $$ } = RD;
  const fn = (n) => { try { return typeof window[n] === "function" ? window[n] : null; } catch (e) { return null; } };
  const chain = (k, f) => { const p0 = RD.page[k]; RD.page[k] = (w, kk) => { if (p0) p0(w, kk); try { f(w, kk); } catch (e) { console.error("[rd] v90ana " + k, e); } }; };
  const tileOf = (w, re) => $$(".rd-p2 .k-tile", w).find((x) => re.test(((($(".k-tl", x) || {}).textContent) || "").trim()));
  const keepTs = (s) => { if (!s) return; s.dataset.kds = "1"; s.classList.remove("k-qhide"); s.hidden = false; };
  const setTile = (el, n, sub, lab) => {
    if (!el) return;
    if (lab) { const l = $(".k-tl", el); if (l) l.textContent = lab; }
    const tn = $(".k-tn", el);
    if (tn && n != null) { const u = $("small", tn); tn.textContent = String(n); if (u) tn.appendChild(u); tn.dataset.v90n = String(n); }
    if (sub) {
      let s = $(".k-ts", el);
      if (!s) { s = document.createElement("span"); s.className = "k-ts"; if (tn) tn.after(s); else el.appendChild(s); }
      s.textContent = sub; s.classList.add("k-v90ts"); keepTs(s);
    }
  };

  /* ── No.382 やりとり ── */
  chain("msg", (w) => {
    const st = fn("v90anaMsgStat"); if (!st) return;
    const S = st();
    const need = S.need.length, wait = S.wait.length;
    setTile(tileOf(w, /^要対応/), need, "相手から届いて、まだ返していない相手（受信箱の「返信」と同じ）");
    setTile(tileOf(w, /^返信待ち/), wait, "こちらが送って、相手の返事を待っている相手（60日以内・受信箱の「相手の番」と同じ）");
    $$(".rd-p2 b, .rd-p2 span", w).forEach((x) => { if (x.children.length) return; const t = x.textContent || ""; if (/^返信が要るメッセージを確認（\d+件）$/.test(t)) x.textContent = `返信が要るメッセージを確認（${need}件）`; });
  });

  /* ── No.383・400・432 メンバー・担当 ── */
  function teamFix(w, fwd) {
    $$(".rd-p2 .k-tile .k-ts", w).forEach(keepTs); // 数の下の説明・誰が何をできる？の説明（代表を含む）を隠さない
    if (!fwd) return;
    const prod = tileOf(w, /^登録している商品$/);
    if (prod) {
      let n = null;
      try { const a = fn("tmAcct") && window.tmAcct(); const T = a && fn("tmTargets") ? window.tmTargets(a) : []; n = Array.isArray(T) ? T.length : null; } catch (e) { n = null; }
      setTile(prod, n == null ? "—" : n, "見積依頼をくれた荷主の数（「荷主ごとの担当」と同じ）", "見積依頼の荷主");
      const u = $(".k-tn small", prod); if (u) u.textContent = "社";
      const ic = $(".k-ti", prod); if (ic && RD.I) ic.innerHTML = RD.I("users", 24);
    }
  }
  chain("team", (w) => teamFix(w, false));
  chain("fteam", (w) => teamFix(w, true));
  // 誰が何をできる？の小さな説明が、あとから隠されたとき（見えたときに隠す仕組み）も戻す
  try {
    new MutationObserver(() => {
      const k = (RD.curKey && RD.curKey()) || "";
      if (!/team/.test(k) && !document.querySelector("#well .tm-cnt")) return;
      $$("#well .rd-p2 .k-tile .k-ts.k-qhide").forEach(keepTs);
    }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ["class"] });
  } catch (e) { /* 無視 */ }

  /* ── No.425 左のメニュー「案件」の札 ── */
  function sideLabel() {
    const s = $('#rdside .rd-main[data-rdk="dash:home"] .rd-bdg');
    if (!s) return;
    if (!s.classList.contains("k-v90todo")) s.classList.add("k-v90todo");
    const t = `要対応 ${s.textContent}件（相手の返信に、まだ返していない案件。案件の数ではありません）`;
    if (s.title !== t) s.title = t;
    if (s.getAttribute("aria-label") !== t) s.setAttribute("aria-label", t);
  }

  /* ── No.388 通知センターの見出し ── */
  function ntfHead() {
    const hd = $("#pn .k-ntfhd"); if (!hd || hd.dataset.v90) return;
    hd.dataset.v90 = "1";
    $$("h2, h3, b, span", hd).forEach((x) => { if (!x.children.length && /^今すぐ対応が必要なこと$/.test((x.textContent || "").trim())) x.textContent = "いま出ている知らせ（既読を含む）"; });
    const p = $("#v90bell");
    if (p && !$(".k-v90bell", hd)) { const q = document.createElement("p"); q.className = "k-v90bell"; q.dataset.kqn = "1"; q.textContent = p.textContent; hd.appendChild(q); p.hidden = true; }
  }
  const tick = () => { try { sideLabel(); } catch (e) { /* 無視 */ } try { ntfHead(); } catch (e) { /* 無視 */ } };
  try { new MutationObserver(tick).observe(document.body, { childList: true, subtree: true, characterData: true }); } catch (e) { /* 無視 */ }
  // 札の title は刷新版（rd_case の sideBadge）が描くたびに書き直すので、title の変化も見る
  const watchSide = () => { const sd = document.getElementById("rdside"); if (!sd) { setTimeout(watchSide, 500); return; } try { new MutationObserver(() => { try { sideLabel(); } catch (e) { /* 無視 */ } }).observe(sd, { subtree: true, attributes: true, attributeFilter: ["title"] }); } catch (e) { /* 無視 */ } };
  watchSide();
  setTimeout(tick, 500);

  /* ── No.451 見本と実データの区別 ── */
  // 見本の物流会社：今のアプリの見本の一覧（V45_SMPCO＝21.60 からデモ物流①〜⑤）＋以前の見本（V60_OLD＝サンプル海運（デモ）など。前に作った依頼の相見積に残る）
  const SMP_CO = () => { const o = {}; try { if (typeof V45_SMPCO !== "undefined" && V45_SMPCO) Object.keys(V45_SMPCO).forEach((k) => { o[k] = 1; }); } catch (e) { /* 無視 */ } // eslint-disable-line no-undef
    try { if (typeof V60_OLD !== "undefined" && V60_OLD) Object.keys(V60_OLD).forEach((k) => { o[k] = 1; }); } catch (e) { /* 無視 */ } // eslint-disable-line no-undef
    return Object.keys(o); };
  const isSmpTen = (t) => !!t && (t.src === "sample2" || t.src === "demo" || t.kind === "demo");
  const tag = () => { const x = document.createElement("span"); x.className = "k-tag gy k-v90smp"; x.textContent = "見本"; x.title = "見本（架空）のデータです。実在の取引ではありません"; return x; };
  const fwdNow = () => { try { return !!(RD.isFwd && RD.isFwd()); } catch (e) { return false; } };
  function smpShipper() {
    const W = document.getElementById("well"); if (!W || fwdNow()) return;
    // 案件一覧
    const cl = $(".k-cl .k-clcard", W);
    if (cl && RD.allCases) {
      let L = []; try { L = RD.allCases(); } catch (e) { L = []; }
      const by = {}; L.forEach((c) => { by[c.key] = c; });
      const rows = $$("#k-clbody tr.k-clrow", cl), ord = RD._caseOrder || [];
      // 札は名前の後ろ。名前（b＝flex・はみ出しは隠す）が長いと札が右で切れるので、名前の文字だけを縮む箱（k-v90nm・…で省略）に入れ、札は縮まない（flex:none）
      rows.forEach((tr, i) => {
        const c = by[ord[i]]; if (!c || !isSmpTen(c.t)) return;
        const b = $(".c-who b", tr); if (!b || $(".k-v90smp", b)) return;
        const tx = Array.from(b.childNodes).filter((n) => n.nodeType === 3 && n.nodeValue.trim());
        if (tx.length) { const nm = document.createElement("span"); nm.className = "k-v90nm"; tx[0].before(nm); tx.forEach((n) => nm.appendChild(n)); nm.title = (nm.textContent || "").trim(); }
        b.appendChild(tag());
      });
      const m = L.filter((c) => isSmpTen(c.t)).length;
      let bar = $(".k-v90smpbar", cl);
      if (m && !bar) { bar = document.createElement("p"); bar.className = "k-v90smpbar"; bar.dataset.kqn = "1"; cl.prepend(bar); }
      if (bar) {
        const t = !m ? "" : m === L.length ? `この一覧の案件 ${L.length}件は、すべて見本（架空）の商品のものです。数も見本の数で、実在の取引は入っていません。` : `全 ${L.length}件のうち ${m}件は見本（架空）の商品の案件です（行に「見本」の札）。`;
        if (bar.textContent !== t) bar.textContent = t;
        bar.hidden = !m;
      }
    }
    // 商品一覧
    let T = []; try { T = typeof TENS !== "undefined" ? TENS : []; } catch (e) { T = []; } // eslint-disable-line no-undef
    $$(".k-pc", W).forEach((card) => {
      const nm = $(".k-pcnm b", card); if (!nm || $(".k-v90smp", nm)) return;
      const t = T.find((x) => x && (x.item || x.file || "（名前のない商品）") === nm.textContent);
      if (isSmpTen(t)) nm.appendChild(tag());
    });
  }
  function smpFwd() {
    const W = document.getElementById("well"); if (!W || !fwdNow()) return;
    const K = SMP_CO(); if (!K.length) return;
    let F = null; try { F = typeof FWDB !== "undefined" ? FWDB : null; } catch (e) { F = null; } // eslint-disable-line no-undef
    const me = (F && F.profile && F.profile.co) || "";
    const rates = (F && F.rates) || [];
    const others = K.filter((k) => k !== me);
    const txt = W.textContent || "";
    const shown = others.filter((k) => txt.indexOf(k) >= 0);
    // データの中の「（デモ）」の付いた会社（相見積の回答・レート）も見本として数える（画面の文字からは拾わない）
    const dn = new Set(); try { rates.forEach((r) => r && r.co && dn.add(r.co)); ((F && F.reqs) || []).forEach((q) => ((q && q.legs) || []).forEach((lg) => ((lg && lg.offers) || []).forEach((o) => o && o.co && dn.add(o.co)))); } catch (e) { /* 無視 */ }
    dn.forEach((k) => { if (/（デモ）$/.test(k) && k !== me && !others.includes(k)) { others.push(k); if (txt.indexOf(k) >= 0) shown.push(k); } });
    const meSmp = !!me && K.includes(me);
    let bar = $(".k-v90smpbar", W);
    if (!shown.length && !meSmp) { if (bar) bar.hidden = true; return; }
    const t = (shown.length ? `「${shown.join("」「")}」は見本（架空）の物流会社です。この画面の社数・最安・推奨・相見積には、見本の会社のレート・回答が入っています（実在の他社のレートではありません）。` : "")
      + (meSmp ? `貴社名「${me}」も体験用の見本の会社です。` : "");
    if (!bar) { bar = document.createElement("p"); bar.className = "k-v90smpbar"; bar.dataset.kqn = "1"; const top = $(":scope > .rd-p2", W) || $(":scope > [data-rdhero]", W); if (top) top.after(bar); else W.prepend(bar); }
    bar.hidden = false;
    if (bar.textContent !== t) bar.textContent = t;
    // 表：見本の会社の名前だけのセルに札
    $$("td", W).forEach((td) => { if (td.children.length > 1 || $(".k-v90smp", td)) return; const v = (td.textContent || "").trim(); if (others.includes(v)) td.appendChild(tag()); });
  }
  let smpT = 0;
  const smpTick = () => { if (smpT) return; smpT = setTimeout(() => { smpT = 0; try { smpShipper(); } catch (e) { console.error("[rd] v90ana smp", e); } try { smpFwd(); } catch (e) { console.error("[rd] v90ana smpf", e); } }, 120); };
  try { new MutationObserver((ms) => { if (ms.every((m) => m.target && m.target.closest && m.target.closest(".k-v90smpbar, .k-v90smp"))) return; smpTick(); }).observe(document.body, { childList: true, subtree: true }); } catch (e) { /* 無視 */ }
  smpTick();
  RD.v90smp = { shipper: smpShipper, fwd: smpFwd };
})();
