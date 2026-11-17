/* 貿易クラウドAI商社マン 21.95 info の刷新版の層（logic_v2195info.js のあとに読む）
   No.481 商品情報の「登録の項目で未登録 N件：…」と「未入力 N件」の説明（title・aria-label）も、日本語では項目の区切りを「、」に
   No.462 刷新版の「今日やること」「営業資料」「商品情報」に、英文社名の案と「この英文社名で登録する」（読めない漢字が残る案は「案を直して登録する」）を出す
          （21.94 は、刷新版のこの3画面が自前の部品で描くため、21.92 の案が画面に出なかった）
   No.490 %の意味の違い（商品情報＝登録の21項目／営業資料＝資料の材料）と、強みの件数（どちらも3件以上）を、両方の画面に1行で
   いつ：画面を描いたあと（RDX.page の鎖と RDX.after。商品情報の「登録の項目で未登録」は rd_v92item が RDX.after で作るため、その後にも回す）。何度回しても同じ結果 */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v95info) return;
  RD._v95info = 1;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const fn = (n) => { try { const f = window[n]; return typeof f === "function" ? f : null; } catch (e) { return null; } };
  const ten = () => { try { return typeof TEN !== "undefined" ? TEN : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const ja = () => { const f = fn("v95infoJa"); return f ? f() : true; };
  const strN = () => { const t = ten(); const f = fn("v95infoStrN"); return f && t ? f(t.strengths) : 0; };
  const STRN = () => { try { return (window.V95INFO && window.V95INFO.STRN) || 3; } catch (e) { return 3; } };
  const coenLine = (cls) => { const f = fn("v95infoCoEnHtml"); return f ? f(ten(), cls) : ""; };
  const sig = () => { const t = ten(); return t ? [t.uid || t.item, t.coEn || "", strN()].join("|") : ""; };

  /* ── 商品情報 ── */
  function fItem(w) {
    const t = ten(); if (!t || !w) return;
    // No.481 未登録の一覧（日本語だけ）
    if (ja()) {
      const rj = fn("v95infoRejoinEl");
      $$(".k-v92imiss span", w).forEach((sp) => { const tx = sp.textContent || ""; if (sp.getAttribute("data-v95n") === tx || !/登録の項目で未登録/.test(tx)) return; if (rj) rj(sp, "：", "", 0); sp.setAttribute("data-v95n", sp.textContent || ""); });
      const miss = fn("v92itemMiss") ? fn("v92itemMiss")(t) : null;
      if (Array.isArray(miss)) {
        $$('[data-v92iact="fill"][data-keys]', w).forEach((li) => {
          const ks = String(li.getAttribute("data-keys") || "").split(",").filter(Boolean);
          const names = ks.map((k) => (miss.find((x) => x && x.k === k) || {}).n).filter(Boolean);
          if (!names.length || names.length !== ks.length) return;
          const j = names.join("、");
          if (li.title && /を入れる窓が開きます$/.test(li.title)) li.setAttribute("title", "押すと、足りない項目（" + j + "）を入れる窓が開きます");
          const al = li.getAttribute("aria-label") || ""; const m = al.match(/^(.+?)：一部未入力 (\d+)件（/); if (m) li.setAttribute("aria-label", m[1] + "：一部未入力 " + m[2] + "件（" + j + "）。押すと入れる窓が開きます");
        });
      }
    }
    // No.462 英文社名の案
    const s0 = sig();
    const old = $(".v95coen.v95-item", w);
    if (old && old.getAttribute("data-v95sig") !== s0) old.remove();
    if (!String(t.coEn || "").trim() && !$(".v95coen.v95-item", w)) {
      const h = coenLine("v95-item");
      const host = $(".k-v92imiss", w);
      if (h && host) host.insertAdjacentHTML("afterend", h);
      else if (h) { const ring = $(".k-ring", w); const col = ring ? (ring.closest("div[style*='border-left']") || ring.parentElement) : null; if (col) col.insertAdjacentHTML("beforeend", h); }
      const nw = $(".v95coen.v95-item", w); if (nw) nw.setAttribute("data-v95sig", s0);
    }
    // No.490 %の意味と強みの件数
    const p1 = $(".k-v90opt p[data-v92prod-note]", w) || $(".k-v90opt p", w) || $("[data-v92prod-note]", w);
    if (p1 && !$(".v95pctnote", p1)) {
      p1.insertAdjacentHTML("beforeend", `<span class="v95pctnote" data-noi18n="1">${esc(ja() ? `営業資料の%（完成度）は、資料の材料（会社の情報・写真など）の項目で別に数えます。商品の強みは、どちらの画面も ${STRN()}件以上で「入力済み」です。` : `The sales deck % (completeness) counts different items (company info, photos, etc.). Strengths count as filled from ${STRN()} on both screens.`)}</span>`);
    }
    const sh = fn("v95infoStrShort"); const n = sh ? sh(t) : 0;
    const old2 = $(".v95strnote", w);
    if (old2 && (!n || old2.getAttribute("data-v95sig") !== s0)) old2.remove();
    if (n && !$(".v95strnote", w)) {
      const host = $(".k-v92imiss", w) || p1;
      if (host) host.insertAdjacentHTML("afterend", `<p class="v95strnote" data-noi18n="1" data-v95sig="${esc(s0)}">${esc(ja() ? `商品の強みは いま ${strN()}件です。営業資料と同じく、${STRN()}件以上で「入力済み」になります（あと ${n}件）。` : `${strN()} strength(s) now. As in the sales deck, ${STRN()} or more count as filled (${n} more).`)}<button type="button" class="k-btn white k-mini" data-v95str="1">${esc(ja() ? "＋ 強みを追加" : "+ Add a strength")}</button></p>`);
    }
    // 並び：「登録の項目で未登録」→ 英文社名の案 → 強みの件数（「登録の項目で未登録」はあとから作られることがあるため、そろえ直す）
    const im = $(".k-v92imiss", w);
    if (im) { let at = im; [$(".v95coen.v95-item", w), $(".v95strnote", w)].forEach((x) => { if (x) { if (at.nextElementSibling !== x) at.after(x); at = x; } }); }
  }

  /* ── 今日やること ── */
  function fToday(w) {
    const t = ten(); if (!t || !w) return;
    if (String(t.coEn || "").trim()) { $$(".v95coen.v95-today", w).forEach((x) => x.remove()); return; }
    $$("b.tdt", w).forEach((b) => {
      if (!/英文社名/.test(b.textContent || "")) return;
      const inner = b.closest(".rw"); const row = (inner && inner.parentElement && inner.parentElement.closest(".rw")) || inner || b.parentElement;
      const card = row && row.parentElement; if (!card || $(".v95coen", card)) return;
      const h = coenLine("v95-today"); if (h) row.insertAdjacentHTML("afterend", h);
    });
  }

  /* ── 営業資料 ── */
  function fDeck(w) {
    const t = ten(); if (!t || !w) return;
    if (!String(t.coEn || "").trim()) {
      $$(".k-it", w).forEach((it) => {
        const b = $("b", it); if (!b || (b.textContent || "").trim() !== "英文社名" || $(".v95coen", it)) return;
        const sp = b.parentElement; const h = coenLine("v95-deck"); if (h && sp) sp.insertAdjacentHTML("beforeend", h);
      });
    }
    const h2 = $$(".rd-x h2", w).find((x) => /項目で、完成版の営業資料を作れます|営業資料を作成できます/.test(x.textContent || ""));
    if (h2 && !$(".v95pctnote", h2.parentElement)) {
      const p = document.createElement("p"); p.className = "v95pctnote v95-deck"; p.setAttribute("data-noi18n", "1");
      p.textContent = ja() ? `この完成度は、営業資料の材料（会社の情報・写真・連絡先など）の項目で数えます。商品情報の%（商品の登録の項目）とは、見ている項目が違います。商品の強みは、どちらの画面も ${STRN()}件以上で「入力済み」です。`
        : `This completeness counts the sales-deck materials (company info, photos, contact, etc.), which are different items from the product-info % (product registration items). Strengths count as filled from ${STRN()} on both screens.`;
      const nx = h2.nextElementSibling; if (nx && nx.tagName === "P") nx.after(p); else h2.after(p);
    }
  }

  const FIX = { item: fItem, today: fToday, deck: fDeck };
  Object.keys(FIX).forEach((k) => { const p0 = RD.page[k]; RD.page[k] = (w, kk) => { if (p0) p0(w, kk); try { FIX[k](w); } catch (e) { console.error("[rd] v95info " + k, e); } }; });
  const a0 = RD.after;
  RD.after = function () {
    const r = a0.apply(this, arguments);
    try { const k = RD.curKey && RD.curKey(); const f = FIX[k]; if (f) f(document.getElementById("well") || document.body); } catch (e) { console.error("[rd] v95info after", e); }
    return r;
  };
  window.__v95infoFix = (k) => { const f = FIX[k || (RD.curKey && RD.curKey())]; if (f) f(document.getElementById("well") || document.body); };

  document.addEventListener("click", (e) => {
    const b = e.target && e.target.closest && e.target.closest("[data-v95str]"); if (!b) return;
    e.preventDefault(); const f = fn("openStrEdit"); if (f) f(-1);
  });
})();
