/* 貿易クラウドAI商社マン 21.92 goal の刷新版の層（rd_v91smp.js のあとに読む）
   R-11（レポート第5回「改善 No.11 ホームのバッジ」の残り・No.474 と一緒に）
     左のメニュー「案件」の札（要対応の数）は、アカウントの全商品（見本の会社＝酒造などの業種サンプルを含む）の案件から数えていた（rd_case.js の sideBadge＝allCases）。
     自社の商品に切り替えても、酒造の見本の「要対応 4」が出続けた
     → 札の数を「いま表示している会社の範囲」にする：御社の商品を表示しているときは御社の商品（見本を除く）の案件だけ、
       見本の会社を表示しているときは、その見本の会社の案件だけ。見本の無いアカウントは今まで通り（全部が御社の商品）。
       札の title は 21.90 ana（sideLabel）が書くので触らない（2つの層が title を書き合わない）
   No.466（初期状態の商品数）：メンバー・担当の「登録している商品 N商品」に、内訳（見本＝デモの初期状態の商品 n・御社が登録した商品 m）を足す。
     数そのもの（商品一覧の数）は変えない＝ほかの画面と同じ数
   ボタンは書かない。onclick= と style= も書かない */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v92goal) return;
  RD._v92goal = 1;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const chain = (k, f) => { const p0 = RD.page[k]; RD.page[k] = (w, kk) => { if (p0) p0(w, kk); try { f(w, kk); } catch (e) { console.error("[rd] v92goal " + k, e); } }; };
  const isSmp = (t) => !!t && (t.src === "sample" || t.src === "sample2" || !!t.v91smp);
  const trial = () => { try { return typeof SES !== "undefined" && !!SES && SES.t === "trial"; } catch (e) { return false; } }; // eslint-disable-line no-undef
  const tens = () => { try { return (typeof TENS !== "undefined" && Array.isArray(TENS)) ? TENS : []; } catch (e) { return []; } }; // eslint-disable-line no-undef
  const ten = () => { try { return typeof TEN !== "undefined" ? TEN : null; } catch (e) { return null; } }; // eslint-disable-line no-undef

  /* ── R-11 札は「いま表示している会社の範囲」の要対応 ── */
  function scopeTodo() {
    if (!RD.allCases) return null;
    let L = []; try { L = RD.allCases(); } catch (e) { return null; }
    const t0 = ten(); const smp = isSmp(t0);
    const inScope = (c) => smp ? (!!c.t && isSmp(c.t) && String(c.t.co || "") === String((t0 && t0.co) || "")) : !isSmp(c.t);
    const all = L.filter((c) => c.todo).length, n = L.filter((c) => c.todo && inScope(c)).length;
    return { n, all, other: all - n, smp };
  }
  let busy = false;
  function fixBadge() {
    if (busy || !trial()) return;
    const s = $('#rdside .rd-main[data-rdk="dash:home"] .rd-bdg'); if (!s) return;
    if (!tens().some(isSmp)) { if (s.hidden && s.dataset.v92) { busy = true; s.hidden = false; delete s.dataset.v92; busy = false; } return; } // 見本の無いアカウント＝今まで通り
    const r = scopeTodo(); if (!r) return;
    busy = true;
    try {
      s.dataset.v92 = "1"; s.dataset.v92other = String(r.other);
      if (!r.n) { if (!s.hidden) s.hidden = true; }
      else { if (s.hidden) s.hidden = false; if (s.textContent !== String(r.n)) s.textContent = String(r.n); }
    } finally { busy = false; }
  }
  RD.v92goalBadge = { fix: fixBadge, scope: scopeTodo };
  const watch = () => { const sd = document.getElementById("rdside"); if (!sd) { setTimeout(watch, 500); return; }
    try { new MutationObserver(() => { if (!busy) fixBadge(); }).observe(sd, { childList: true, subtree: true, characterData: true }); } catch (e) { /* 無視 */ } fixBadge(); };
  watch();
  ["dash:home", "dash:prod", "today", "ai", "msg", "rm", "dash:rep"].forEach((k) => chain(k, () => setTimeout(fixBadge, 0)));

  /* ── No.466 登録している商品の内訳 ── */
  chain("team", (w) => {
    const tl = $$(".rd-p2 .k-tile", w);
    const tile = tl.find((x) => /^登録している商品$/.test((($(".k-tl", x) || {}).textContent || "").trim()));
    if (!tile) return;
    const T = tens(); const smp = T.filter(isSmp).length, own = T.length - smp;
    if (!smp) return;
    let s = $(".k-v92mix", tile);
    // 数（.k-tn）と同じ文字の列に入れる（タイルの横に並べると数が「6…」と切れる）
    const col = ($(".k-ts", tile) || $(".k-tn", tile) || {}).parentElement || tile;
    if (!s) { s = document.createElement("small"); s.className = "k-v92mix"; s.dataset.kqn = "1"; }
    if (s.parentElement !== col) col.appendChild(s);
    const t = `内訳：見本（デモの初期状態）${smp}・御社が登録 ${own}`;
    if (s.textContent !== t) s.textContent = t;
  });
})();
