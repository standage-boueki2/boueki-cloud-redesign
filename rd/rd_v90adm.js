/* 貿易クラウドAI商社マン 21.90 adm（刷新版の管理コンソール・2026-11-13）
   403 刷新版の「アカウントの状況（N件）」に母数（台帳の行・アクセスコードの種類）を書く
   404 アカウント一覧が横にはみ出すときは「横に動かせます」の案内を出す（右端の操作の列は刷新版の CSS で常に見える） */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v90adm) return;
  RD._v90adm = 1;
  const isAdm = () => { try { return typeof SES !== "undefined" && !!SES && SES.t === "admin"; } catch (e) { return false; } }; // eslint-disable-line no-undef
  function basis(w) {
    try {
      const card = [...w.querySelectorAll("section.k-card")].find((c) => /アカウントの状況/.test(((c.querySelector(".k-h h2") || {}).textContent) || ""));
      const hs = card && card.querySelector(".k-hs"); if (!hs) return;
      const I = typeof v90admDupInfo === "function" ? v90admDupInfo() : null; // eslint-disable-line no-undef
      const rows = w.querySelectorAll("#accounts tbody tr[data-st]").length;
      const t = I ? `（台帳の行 ${rows}件・アクセスコード ${I.codes}種類${I.dupRows || I.lid ? "・重なりの印 " + (I.dupRows + I.lid) + "行" : ""}）` : `（台帳の行 ${rows}件）`;
      if (hs.textContent !== t) { hs.textContent = t; hs.title = "件数は台帳の行（記録）の数です。同じアクセスコードの行などは、アカウント一覧に印を付けています"; }
    } catch (e) { /* 無視 */ }
  }
  function hscroll(w) {
    try {
      const card = w.querySelector("#accounts"); const tw = card && card.querySelector(".tw"); if (!tw) return;
      const over = tw.scrollWidth > tw.clientWidth + 2; let h = card.querySelector(".v90hs");
      if (!over) { if (h) h.remove(); return; }
      if (over && !h) { h = document.createElement("p"); h.className = "v90hs rd-x"; h.setAttribute("role", "note");
        h.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5M3 12h18"/></svg><span></span>`;
        tw.before(h); }
      if (h) { const last = card.querySelector("tbody tr td:last-child"); const st = last && getComputedStyle(last).position === "sticky";
        const t = "表は横に動かせます（" + (st ? "表の下のつまみ・Shift＋ホイール・トラックパッドの横スワイプ）。右端の「無効化」「詳細」はいつも見えています。" : "指で横にずらす）。「無効化」「詳細」は右端にあります。");
        const sp = h.querySelector("span"); if (sp && sp.textContent !== t) sp.textContent = t; }
    } catch (e) { /* 無視 */ }
  }
  const prev = RD.page && RD.page.adm;
  if (prev) RD.page.adm = function (w) { const r = prev.apply(this, arguments); try { basis(w); hscroll(w); } catch (e) { /* 無視 */ } return r; };
  let t = 0;
  const run = () => { if (!isAdm()) return; const w = document.getElementById("well"); if (!w) return; basis(w); hscroll(w); };
  try { new MutationObserver(() => { if (!isAdm()) return; clearTimeout(t); t = setTimeout(run, 120); }).observe(document.body, { childList: true, subtree: true }); } catch (e) { /* 無視 */ }
  window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(run, 150); });
})();
