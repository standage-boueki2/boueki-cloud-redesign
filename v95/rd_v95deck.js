/* v21.95 deck（刷新版の層）：外国語 営業資料の画面の「情報の入力状況」の写真の行から、使えない写真の直し方（本体の層 logic_v2195deck が出す箱）へ飛べるようにする
   onclick= と style= は書かない（addEventListener と classList だけ） */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v95deck) return;
  RD._v95deck = 1;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const key = () => { try { return RD.curKey ? RD.curKey() : ""; } catch (e) { return ""; } };
  function paint() {
    try {
      if (key() !== "deck") return;
      const g = $("[data-v95dkph]");
      $$(".rd-p2 .k-it").forEach((row) => {
        const b = $("b", row);
        if (!b || !/^納品品質の写真/.test((b.textContent || "").trim())) return;
        const has = $(".v95dk-jump", row);
        if (!g) { if (has) has.remove(); return; }
        if (has) return;
        const btn = document.createElement("button");
        btn.type = "button"; btn.className = "v95dk-jump"; btn.textContent = "直し方を見る";
        btn.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); const x = $("[data-v95dkph]"); if (!x) return; try { x.scrollIntoView({ block: "center", behavior: "smooth" }); } catch (er) { x.scrollIntoView(); } x.classList.remove("k-r5c-pulse"); void x.offsetWidth; x.classList.add("k-r5c-pulse"); setTimeout(() => x.classList.remove("k-r5c-pulse"), 3200); });
        b.after(btn);
      });
    } catch (e) { /* 前の動きのまま */ }
  }
  const a0 = RD.after;
  if (typeof a0 === "function") RD.after = function () { const r = a0.apply(this, arguments); paint(); return r; };
  let tm = 0;
  document.addEventListener("click", () => { clearTimeout(tm); tm = setTimeout(paint, 900); }, true);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", paint); else paint();
})();
