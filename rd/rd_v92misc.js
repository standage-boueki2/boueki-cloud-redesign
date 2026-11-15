/* 貿易クラウドAI商社マン 21.92 misc の刷新版の層（rd_v92misc.js）
   R-9（ペルソナ評価 第5回「改善 No.9 用語集」の残り）：用語集が「すべての機能＞資産（ナレッジ）」の下にしか無く、初めての人が見つけにくい。
     → 「困ったとき」（ヘルプセンター）の先頭の段に「用語集（貿易のことば）」の札を足し、左のメニューの「はじめての方へ（スタートガイド）」の下にも入口を足す。
       点線の言葉の説明の窓（「？」）と見出しの一言には、もう「用語集」への入口がある（rd_uat.js の data-kgloss）。今の場所（資産（ナレッジ））からは消さない。
       用語集は荷主の画面だけ（物流会社・管理者には出さない）。左のメニューのよく使う5つ（案件・商品・タスク・やりとり・AI商社マン）は変えない（11/12 の決め）
   No.471 の知らせ（アプリの層 logic_v2192misc の #v92miscTr）は、刷新版では左のメニューの右に出す（アプリの層で位置を決める・ここは見た目だけ） */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v92misc) return;
  RD._v92misc = 1;
  const I = typeof RD.I === "function" ? RD.I : () => "";
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const G = (n) => { try { switch (n) { case "SES": return typeof SES !== "undefined" ? SES : undefined; } } catch (e) { /* 前 */ } return undefined; }; // eslint-disable-line no-undef
  const shipper = () => { const S = G("SES"); if (!S || document.body.classList.contains("locked")) return false; if (S.t === "admin") return false; try { if (typeof RD.isFwd === "function" && RD.isFwd()) return false; } catch (e) { /* 無視 */ } return S.role !== "fwd"; };
  const SUB = "FOB・HS コードなど、貿易の言葉の意味";
  const CARD = "FOB・HS コード・インコタームズなど、貿易の言葉の意味と例。点線の言葉を押しても説明が出ます";
  // 英訳（今のアプリの辞書に足す・ある語は上書きしない）
  try {
    if (typeof I18N !== "undefined" && I18N && I18N.dict) { // eslint-disable-line no-undef
      [[SUB, "Meanings of FOB, HS codes and other trade terms", "FOB、HS 编码等贸易用语的含义", "Significado de FOB, códigos HS y otros términos"],
        [CARD, "Meanings and examples of FOB, HS codes, Incoterms and other trade terms. You can also click a dotted word for its meaning", "FOB、HS 编码、国际贸易术语等贸易用语的含义和例子。点击带虚线的词也会显示说明", "Significado y ejemplos de FOB, códigos HS, Incoterms y otros términos. También puede pulsar una palabra subrayada con puntos"]]
        .forEach((r) => { const d = I18N.dict; if (d.en && !d.en[r[0]]) d.en[r[0]] = r[1]; if (d.zh && !d.zh[r[0]]) d.zh[r[0]] = r[2]; if (d.es && !d.es[r[0]]) d.es[r[0]] = r[3]; }); // eslint-disable-line no-undef
    }
  } catch (e) { /* 無視 */ }
  const tr = (el) => { try { if (typeof i18nApply === "function" && typeof I18N !== "undefined" && I18N.lang && I18N.lang !== "ja") i18nApply(el); } catch (e) { /* 無視 */ } }; // eslint-disable-line no-undef
  const curGloss = () => { try { return typeof RD.curKey === "function" && RD.curKey() === "gloss"; } catch (e) { return false; } };

  function side() {
    const sd = document.getElementById("rdside"); if (!sd) return;
    let b = sd.querySelector(".v92misc-gl");
    if (!shipper()) { if (b) b.remove(); return; }
    const st = sd.querySelector(".rd-start"); if (!st) return;
    if (!b) {
      b = document.createElement("button"); b.type = "button"; b.className = "v92misc-gl"; b.setAttribute("data-v92miscgl", "side");
      b.innerHTML = `${I("book", 20)}<span><b>用語集（貿易のことば）</b><small>${esc(SUB)}</small></span>`;
      st.insertAdjacentElement("afterend", b); tr(b);
    } else if (b.previousElementSibling !== st) st.insertAdjacentElement("afterend", b);
    const on = curGloss() ? "true" : "false"; if (b.getAttribute("aria-current") !== on) b.setAttribute("aria-current", on);
  }
  function help() {
    document.querySelectorAll(".k-helphd").forEach((hd) => {
      let c = hd.querySelector(".v92misc-glc");
      if (!shipper()) { if (c) c.remove(); return; }
      if (c) return;
      const grid = hd.querySelector(".k-grid"); if (!grid) return;
      c = document.createElement("button"); c.type = "button"; c.className = "k-card k-row v92misc-glc"; c.setAttribute("data-v92miscgl", "help");
      c.innerHTML = `${I("book", 30)}<span class="k-rt"><b>用語集（貿易のことば）</b><small>${esc(CARD)}</small></span>${I("chevR", 18, 2.4)}`;
      grid.insertAdjacentElement("afterend", c); tr(c);
    });
  }
  document.addEventListener("click", (e) => {
    const b = e.target && e.target.closest && e.target.closest("[data-v92miscgl]"); if (!b) return;
    e.preventDefault();
    try { if (typeof closeDW === "function") closeDW(); } catch (x) { /* 無い */ } // eslint-disable-line no-undef
    try { document.body.classList.remove("navopen"); } catch (x) { /* 無視 */ }
    try { if (typeof RD.goKey === "function") RD.goKey("gloss"); } catch (x) { console.error("[rd v92misc] gloss", x); }
  });
  let t = 0;
  const run = () => { try { side(); help(); } catch (e) { console.error("[rd v92misc]", e); } };
  try { new MutationObserver(() => { if (t) return; t = setTimeout(() => { t = 0; run(); }, 60); }).observe(document.body, { childList: true, subtree: true }); } catch (e) { /* 無視 */ }
  // 見張りが1回分の描き直しを取りこぼしても、用語集の入口が消えたままにならないように（1秒ごとに確かめるだけ・変化が無ければ何もしない）
  try { setInterval(run, 1000); } catch (e) { /* 無視 */ }
  run();
})();
