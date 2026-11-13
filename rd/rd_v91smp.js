/* 貿易クラウドAI商社マン 21.91 smp（刷新版の層・rd_v90ana.js のあとに読む）
   完成形の見本（デモ商材 food・cosme・parts）に足した見本の案件（logic_v2191smp.js・スレッドに v91smp）に、案件一覧で「見本」の札と1行の説明。
   21.90 の ana（No.451）の札は業種サンプル（src "sample2"）だけを見本と数えるので、完成形（src "sample"）の案件には付かない。
   見た目は ana の札・説明と同じ（名前の文字だけを縮む箱に入れ、札は縮まない）。ana の札・説明（k-v90smp・k-v90smpbar）には触らない（名前は k-v91…） */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v91smp) return;
  RD._v91smp = 1;
  const { $, $$, esc } = RD;
  const isDemo = (c) => !!(c && c.th && c.th.v91smp);
  const coNow = () => { try { const t = RD.G("TEN"); return (t && t.co) || ""; } catch (e) { return ""; } };
  function tagEl() { const x = document.createElement("span"); x.className = "k-tag gy k-v91smp"; x.textContent = "見本"; x.title = "見本（架空）の完成形の「商談の記録」から作った案件です。実在の取引ではなく、保存もされません"; return x; }
  function apply() {
    const W = document.getElementById("well"); if (!W || (RD.isFwd && RD.isFwd())) return;
    const cl = $(".k-cl .k-clcard", W); if (!cl || typeof RD.allCases !== "function") return;
    let L = []; try { L = RD.allCases(); } catch (e) { L = []; }
    const by = {}; L.forEach((c) => { by[c.key] = c; });
    const ord = RD._caseOrder || [];
    $$("#k-clbody tr.k-clrow", cl).forEach((tr, i) => {
      const c = by[ord[i]]; if (!isDemo(c)) return;
      const b = $(".c-who b", tr); if (!b || $(".k-v91smp", b) || $(".k-v90smp", b)) return;
      if (!$(".k-v90nm", b)) {
        const tx = Array.from(b.childNodes).filter((n) => n.nodeType === 3 && n.nodeValue.trim());
        if (tx.length) { const nm = document.createElement("span"); nm.className = "k-v90nm k-v91nm"; tx[0].before(nm); tx.forEach((n) => nm.appendChild(n)); nm.title = (nm.textContent || "").trim(); }
      }
      b.appendChild(tagEl());
    });
    const m = L.filter(isDemo).length;
    let bar = $(".k-v91smpbar", cl);
    if (m && !bar) { bar = document.createElement("p"); bar.className = "k-v91smpbar"; bar.dataset.kqn = "1"; cl.prepend(bar); }
    if (bar) {
      const co = coNow();
      const t = !m ? "" : m === L.length ? `この一覧の案件 ${m}件は、見本（架空）の完成形${co ? `「${co}」` : ""}の商談の記録から作った案件です。実在の取引ではなく、保存もされません。`
        : `全 ${L.length}件のうち ${m}件は、見本（架空）の完成形の商談の記録から作った案件です（行に「見本」）。`;
      if (bar.textContent !== t) bar.textContent = t;
      bar.hidden = !m;
    }
  }
  const chain = (k) => { const p0 = RD.page[k]; RD.page[k] = (w, kk) => { if (p0) p0(w, kk); try { apply(); } catch (e) { console.error("[rd] v91smp", e); } }; };
  chain("dash:home"); chain("dash");
  try {
    new MutationObserver((ms) => { if (ms.every((x) => x.target && x.target.closest && x.target.closest(".k-v91smpbar, .k-v91smp"))) return; try { apply(); } catch (e) { /* 無視 */ } })
      .observe(document.body, { childList: true, subtree: true });
  } catch (e) { /* 無視 */ }
  RD.v91smpApply = apply;
  void esc;
})();
