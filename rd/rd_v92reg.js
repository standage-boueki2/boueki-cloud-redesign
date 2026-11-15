/* 貿易クラウドAI商社マン 21.92 reg の刷新版の層（rd_v90cty・rd_v91smp のあとに読む）
   R-4 販売先国の選定のおすすめのカード：
     ・データの無い観点（null）を「0」と出していた（今の版の表は「未評価」）→ カードの観点の欄も「未評価」に。レーダーの図には、未評価の観点は中心に描いていると注記
     ・同点の国の「総合点の順位」に「同点」と、並べた理由（配点の大きい観点の順＝アプリの層 logic_v2192reg の V92REGX.tieTxt）を出す
     ・AI の文から順位の言い方を外したこと（数）と、同点の説明を、カードの下に1枚の注記で出す
   No.456 規制を調べる（今の版の #rO の中）の「該当するか確認」の枠と、書類をつくるの「登録から決められない商品の印」の枠の見た目（rd_v92reg.css） */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v92reg) return;
  RD._v92reg = 1;
  const { $, $$, esc } = RD;
  const X = () => window.V92REGX || null;
  const fn = (n) => { try { return typeof window[n] === "function" ? window[n] : null; } catch (e) { return null; } };
  const chain = (k, f) => { const p0 = RD.page[k]; RD.page[k] = (w, kk) => { if (p0) p0(w, kk); try { f(w, kk); } catch (e) { console.error("[rd] v92reg " + k, e); } }; };
  const store = () => { try { const f = fn("ctyStore"); return f ? f() : null; } catch (e) { return null; } };
  const AXN = { "市場性": "mkt", "規制": "reg", "競合": "comp", "拠点": "base" };

  chain("cty", (w) => {
    const box = $(".rd-p2", w);
    const S = store(), x = X();
    if (!box || !S || !Array.isArray(S.rec) || !x) return;
    const recOf = (c) => S.rec.find((r) => r && r.c === c) || null;
    let na = false;
    $$(".k-tiles > .k-card", box).forEach((card) => {
      const b0 = $("[data-rdcty]", card);
      const c = b0 ? b0.getAttribute("data-rdcty") : "";
      const r = c ? recOf(c) : null;
      if (!r || !r.sc || card.dataset.v92reg) return;
      card.dataset.v92reg = "1";
      // 観点の欄：データが無い観点は「未評価」（「0」と出さない）
      $$("div[title]", card).forEach((d) => {
        const sm = $("small", d), b = $("b", d);
        const k = sm ? AXN[(sm.textContent || "").trim()] : "";
        if (!k || !b || r.sc[k] != null) return;
        na = true;
        b.textContent = "未評価"; b.classList.add("k-v92na"); b.style.color = "";
        d.title = `${sm.textContent.trim()}：データが無いため未評価（総合点は、この観点を除いて出しています）`;
        d.dataset.v92na = k;
      });
      // 同点
      const g = x.tieOf(S, c);
      const rk = $(".k-ctyrank", card);
      if (g && rk && !$(".k-v92tie", rk)) {
        const o = g.L.filter((y) => y.c !== c).map((y) => y.c).join("・");
        rk.insertAdjacentHTML("beforeend", `<span class="k-v92tie" title="${esc(x.tieTxt(g))}">${esc(o)}と同点（${esc(g.t)}点）</span>`);
      }
    });
    // 主要指標の比較の表：同点の国の順位に「同点」
    $$("table.rd-tbl tbody tr", box).forEach((tr) => {
      const b = $("td b", tr); const c = b ? (b.textContent || "").trim() : "";
      const g = c ? x.tieOf(S, c) : null; const td = tr.children[2];
      if (g && td && !$(".k-v92tie", td)) td.insertAdjacentHTML("beforeend", `<span class="k-v92tie">同点</span>`);
    });
    if (S.rec.some((r) => r && r.sc && (r.sc.comp == null || r.sc.mkt == null))) na = true;
    // 注記（1枚）：未評価・同点・順位の言い方
    if (!$(".k-v92cty", box)) {
      const L = [];
      const T = x.ties(S);
      T.forEach((g) => L.push(x.tieTxt(g)));
      const n = S.ai && +S.ai.v92rank;
      if (n) L.push(`順位は総合点で付けています。AI商社マンの文の中の順位の言い方（「最も推奨」「第二候補」など）は、総合点の順と食い違うことがあるため外しました（${n}か所）。`);
      if (na) L.push("「未評価」は、その国のデータが無い観点です（例：通関統計に相手国ごとの数字が無いときの競合）。0点ではなく、総合点からも外しています。上の比較の図では、未評価の観点を中心（0の位置）に描いています。");
      if (L.length) {
        const n2 = document.createElement("section");
        n2.className = "k-card k-v92cty"; n2.setAttribute("role", "note"); n2.dataset.v92reg = "cty";
        n2.innerHTML = `<b>点数と順位の見方</b>${L.map((t) => `<p>${esc(t)}</p>`).join("")}`;
        const grid = $(".k-grid", box);
        if (grid) grid.after(n2); else box.appendChild(n2);
      }
    }
  });
})();
