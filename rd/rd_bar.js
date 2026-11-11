/* 貿易クラウドAI商社マン デザイン刷新 第2弾：上の帯（手元だけ・2026-11-11）
   デザイン案どおり「検索・言語・通知・会社」の4つにそろえる。
   会社・商品の切り替え／新しい会社の商品を登録／やさしい説明／トライアルの残り日数／アカウント／ログアウトは、
   会社名のボタンを押すと開く窓の中に、今の部品をそのまま入れる（働きは同じ・1回押せば出る） */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._bar) return;
  RD._bar = 1;
  const { I, esc, $ } = RD;
  const PUT = [["#tenant", "a"], ["#psw", "a"], ["#pfind", "a"], ["#v56upldNewco", "b"], ["#easy", "c"], ["#lgpill", "d"], ["#usrchip", "d"], ["#lgout", "d"]];
  function build() {
    const bar = document.querySelector(".bar");
    if (!bar) return;
    bar.classList.add("k-bar2");
    bar.style.position = "relative";
    let co = $(".k-co", bar), dd = $(".k-dd", bar);
    if (!co) {
      co = document.createElement("button");
      co.type = "button"; co.className = "k-co"; co.setAttribute("aria-haspopup", "true"); co.setAttribute("aria-expanded", "false");
      dd = document.createElement("div");
      dd.className = "k-dd"; dd.setAttribute("role", "dialog"); dd.setAttribute("aria-label", "会社・商品・アカウント");
      dd.innerHTML = `<h4>表示している会社・商品（切り替え）</h4><div class="k-ddr" data-z="a"></div><h4>追加</h4><div class="k-ddr" data-z="b"></div><h4>表示</h4><div class="k-ddr" data-z="c"></div><h4>アカウント</h4><div class="k-ddr" data-z="d"></div><p class="k-ddnote">このボタンの中に、会社・商品の切り替え、新しい会社の商品の登録、やさしい説明、ログアウトがあります。</p>`;
      const bell = document.getElementById("bell");
      (bell ? bell.after(co) : bar.appendChild(co));
      bar.appendChild(dd);
      co.addEventListener("click", (e) => { e.stopPropagation(); const on = !dd.classList.contains("on"); dd.classList.toggle("on", on); co.setAttribute("aria-expanded", String(on)); });
      dd.addEventListener("click", (e) => e.stopPropagation());
      document.addEventListener("click", () => { dd.classList.remove("on"); co.setAttribute("aria-expanded", "false"); });
      document.addEventListener("keydown", (e) => { if (e.key === "Escape") dd.classList.remove("on"); });
    }
    PUT.forEach(([sel, z]) => { const x = document.querySelector(sel); const t = dd.querySelector(`[data-z="${z}"]`); if (x && t && x.parentElement !== t) t.appendChild(x); if (x) { x.classList.remove("hm"); if (sel === "#psw" || sel === "#pfind") x.hidden = false; } });
    // 区切りが空なら見出しごと隠す（物流会社・管理者は商品の切り替えが無い）
    dd.querySelectorAll(".k-ddr").forEach((r) => { const h = r.previousElementSibling; const has = r.children.length > 0; r.style.display = has ? "" : "none"; if (h && h.tagName === "H4") h.style.display = has ? "" : "none"; });
    const S = RD.G("SES") || {};
    const nm = S.t === "admin" ? "STANDAGE 管理者" : RD.coName() || "会社・商品";
    co.innerHTML = `${I(S.t === "admin" ? "gear" : "bldg", 20)}<span>${esc(nm)}</span>${I("chev", 16)}`;
    const us = document.getElementById("uxsearch");
    if (us && !us.dataset.k) { us.dataset.k = "1"; const t = Array.from(us.childNodes).find((n) => n.nodeType === 3 && /検索/.test(n.textContent)); if (t) t.textContent = "案件・バイヤー・国名で検索"; }
  }
  RD.buildBar2 = build;
  const old = RD.after;
  RD.after = function () { const r = old.apply(this, arguments); try { build(); } catch (e) { console.error("[rd bar]", e); } return r; };
  setInterval(() => { try { if (!RD.locked()) build(); } catch (e) { /* 無視 */ } }, 1500);
  try { build(); } catch (e) { /* まだ */ }
})();
