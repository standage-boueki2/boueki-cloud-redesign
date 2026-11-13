/* 貿易クラウドAI商社マン 21.90 cty の刷新版の層（rd_v89cty.js のあとに読む）
   No.418 販売先国の選定のおすすめのカード：並びはアプリの層（logic_v2190cty）で総合点の高い順にそろえた。
          カードの「おすすめ 1・2・3」と「最もおすすめ」は AI の順位に見えて総合点の順位と食い違うため、「おすすめ」と「総合点が最も高い」にする。
   No.421 商品情報のデータの充足度：100% は必須の項目の割合だと書き、任意の項目で未登録のもの（価格の有効期限・最大供給量・業種の項目）を下に出す。 */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v90cty) return;
  RD._v90cty = 1;
  const { $, $$, esc, I } = RD;
  const fn = (n) => { try { return typeof window[n] === "function" ? window[n] : null; } catch (e) { return null; } };
  const chain = (k, f) => { const p0 = RD.page[k]; RD.page[k] = (w, kk) => { if (p0) p0(w, kk); try { f(w, kk); } catch (e) { console.error("[rd] v90cty " + k, e); } }; };
  const flash = (el) => { if (!el) return; try { el.scrollIntoView({ block: "center", behavior: "smooth" }); } catch (e) { el.scrollIntoView(); } el.classList.add("k-v90flash"); setTimeout(() => el.classList.remove("k-v90flash"), 1600); };

  /* ── No.418 ── */
  chain("cty", (w) => {
    const box = $(".rd-p2", w);
    if (!box) return;
    $$(".k-tiles > .k-card", box).forEach((card, i) => {
      if (!$("[data-rdcty]", card)) return;
      $$(".k-tag", card).forEach((tg) => {
        const t = (tg.textContent || "").trim();
        if (/^おすすめ \d+$/.test(t)) { tg.textContent = "おすすめ"; tg.dataset.v90tag = "1"; }
        else if (t === "最もおすすめ") { tg.textContent = "おすすめの中で総合点が最も高い"; tg.dataset.v90tag = "top"; }
      });
      card.dataset.v90i = String(i);
    });
    /* No.371・cty-old：以前の数え方の分析を付け直したことと、おすすめの扱い */
    let S = null;
    try { S = fn("ctyStore") ? fn("ctyStore")() : null; } catch (e) { S = null; }
    const mt = fn("v90ctyMigTxt");
    if (S && S.v90mig && mt && !$(".k-v90mig", box)) {
      const n = document.createElement("section");
      n.className = "k-card k-v90mig"; n.setAttribute("role", "note");
      n.innerHTML = `<span class="k-v90mi">${I("refresh", 20, 2.4)}</span><div><b>点数と順位を、いまの数え方で付け直しました</b><p>${esc(mt(S))}</p></div>${S.v90mig.ai ? `<button type="button" class="k-btn white" data-v90rerun="1">${I("refresh", 18)}再分析する</button>` : ""}`;
      const first = box.firstElementChild;
      if (first && first.nextSibling) box.insertBefore(n, first.nextSibling); else box.prepend(n);
      const b = $("[data-v90rerun]", n);
      if (b) b.addEventListener("click", (e) => { e.preventDefault(); const run = fn("ctyRun"); if (run) { b.disabled = true; Promise.resolve(run(false)).catch((x) => console.error("[rd] v90cty rerun", x)); } });
    }
    const tg = $$(".k-tag.or", box).find((x) => /総合点に、商品の特性を加えて選びました/.test(x.textContent || ""));
    if (tg && !tg.dataset.v90) { tg.dataset.v90 = "1"; tg.lastChild && tg.lastChild.nodeType === 3 ? (tg.lastChild.textContent = "総合点に商品の特性を加えて選び、総合点の高い順に並べています") : tg.insertAdjacentText("beforeend", "（総合点の高い順に並べています）"); }
  });

  /* ── No.421 ── */
  chain("item", (w) => {
    const miss = fn("v90ctyOptMiss");
    const ring = $(".rd-p2 .k-ring", w);
    if (!ring || !miss || $(".k-v90opt", w)) return;
    const col = ring.closest("div[style*='border-left']") || ring.parentElement;
    const h2 = col && $$("h2", col).find((x) => /データの充足度/.test(x.textContent || ""));
    /* 21.90 統合での直し：この輪の数は登録の項目の全体（NEED 21件）で、今の版の「必須 9/9・全体 21/21」の「全体」にあたる。
       「必須 21件中 21件」の札は今の版の「必須」（大事な9件）と食い違うので、今の版と同じ言い方（全体・必須）にそろえる */
    const fc = fn("v90ctyFillCnt");
    const K = fc ? fc() : null;
    if (h2 && !/登録の項目/.test(h2.textContent)) h2.textContent = "データの充足度（登録の項目）";
    const tag = col && $$(".k-tag", col).find((x) => /^必須 \d+件中 \d+件$/.test((x.textContent || "").trim()));
    if (tag && K) { tag.textContent = `全体 ${K.c}/${K.d}・必須 ${K.a}/${K.b}`; tag.dataset.v90fill = "1"; }
    const L = miss();
    const n = document.createElement("div");
    n.className = "k-v90opt"; n.setAttribute("role", "note");
    n.innerHTML = `<p><b>%は、登録の項目（全体${K ? " " + K.d + "件" : ""}）がそろっている割合です</b>（大事な項目ほど重く数えます${K ? `。そのうち必須は ${K.b}件` : ""}）。下の任意の項目は含みません。</p>` +
      (L.length ? `<p class="k-v90optl">${I("alert", 15, 2.4)}<span>任意の項目で未登録 ${L.length}件：${L.map((x) => esc(x.n)).join("・")}（入れると、見積・営業資料・AI商社マンの答えが詳しくなります）</span></p><button type="button" class="k-btn white k-mini" data-v90opt="1">${I("edit", 14)}未登録の項目へ</button>` : `<p class="k-v90optl ok">任意の項目もそろっています。</p>`);
    col.appendChild(n);
    const b = $("[data-v90opt]", n);
    if (b) b.addEventListener("click", (e) => {
      e.preventDefault();
      const k = L[0] && L[0].go;
      const el = k === "v68" ? $$("[data-v68card]", w).find((x) => !x.closest(".rd-x")) : document.getElementById("v83pxc");
      flash(el && (el.closest(".c") || el));
    });
  });
})();
