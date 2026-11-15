/* 貿易クラウドAI商社マン 21.92 prod の刷新版の層（rd_v91smp.js のあとに読む）
   No.465／R-3 充足度のドーナツ（商品情報を登録 up・商品情報 item）：
     これまで＝scoreOf の重み付きの %（5/21 で 28%・20/21 で 97%）、小計は推定の HS を入れて数え、全体の札（全体 c/d）は入れない → 3つが食い違った。
     直し＝アプリの層の v92prodFill（全体 21件のうち入っている数・推定の HS は数えない）だけを使う。真ん中に「入っている数/全体」と、その下に数どおりの %。
       全体がそろっても任意の項目（価格の有効期限・最大供給量など）が残るときは 100% と書かず「任意 あと N件」（色も橙のまま）。全部そろって緑の 100%。
       小計（基本情報・価格・成分・強み）も同じ数え方で、任意の項目の行を足す。%の説明から「重く数えます」を外す。 */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v92prod) return;
  RD._v92prod = 1;
  const { $, $$, esc, I } = RD;
  const fn = (n) => { try { return typeof window[n] === "function" ? window[n] : null; } catch (e) { return null; } };
  const chain = (k, f) => { const p0 = RD.page[k]; RD.page[k] = (w, kk) => { if (p0) p0(w, kk); try { f(w, kk); } catch (e) { console.error("[rd] v92prod " + k, e); } }; };
  const ten = () => { try { return typeof TEN !== "undefined" ? TEN : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const GROUPS = [["基本情報", ["co", "coEn", "item", "itemEn", "cat", "sku", "hs", "origin"]], ["価格・取引条件", ["priceRows", "moq", "term", "pay", "lead", "pol"]],
    ["成分・仕様", ["compRows", "dimRows", "shelf", "ctn", "cert"]], ["強み・進出国", ["strengths", "targets"]]];
  const nm = (k, t) => { const f = fn("v92prodNm"); return f ? f(k, t) : k; };

  /* ドーナツの真ん中と色 */
  function ringPaint(ring, K) {
    if (!ring || !K) return;
    const optN = K.optMiss.length;
    const cls = K.allDone ? "v92prod-done" : K.full && optN ? "v92prod-optleft" : "";
    ring.classList.add("v92prod-ring");
    ring.classList.remove("v92prod-done", "v92prod-optleft");
    if (cls) ring.classList.add(cls);
    ring.style.setProperty("--p", String(K.pct));
    ring.setAttribute("data-v92prod-fill", `${K.c}/${K.d}`);
    ring.setAttribute("data-v92prod-pct", String(K.pct));
    ring.setAttribute("role", "img");
    const sub = K.full && optN ? `任意 あと${optN}件` : `${K.pct}%`;
    ring.setAttribute("aria-label", `全体 ${K.c}/${K.d} 項目（${sub}）`);
    const sp = ring.querySelector(":scope > span") || ring.appendChild(document.createElement("span"));
    sp.innerHTML = `<b class="v92prod-rn">${K.c}<small>/${K.d}</small></b><em class="v92prod-rs">${esc(sub)}</em>`;
  }

  /* ── 商品情報（item） ── */
  chain("item", (w) => {
    const f = fn("v92prodFill");
    const t = ten();
    const K = f && t ? f(t) : null;
    const ring = $(".rd-p2 .k-ring", w) || $(".k-ring", w);
    if (!K || !ring) return;
    ringPaint(ring, K);
    const col = ring.closest("div[style*='border-left']") || ring.parentElement;
    // 「登録済み／登録中」の札
    const card = ring.closest("section") || w;
    const chip = $$(".k-tag", card).find((x) => /^(登録済み|登録中)/.test((x.textContent || "").trim()));
    if (chip) {
      const txt = K.allDone ? "登録済み" : K.full ? `登録済み（任意 あと${K.optMiss.length}件）` : "登録中";
      chip.lastChild && chip.lastChild.nodeType === 3 ? (chip.lastChild.textContent = txt) : chip.insertAdjacentText("beforeend", txt);
      chip.classList.toggle("gr", K.allDone); chip.classList.toggle("or", !K.allDone);
      chip.setAttribute("data-v92prod-chip", K.allDone ? "done" : K.full ? "opt" : "doing");
    }
    // 商品の顔の「HSコード 3304.99」：推定なら推定と書く（数に入れていないことと合わせる）
    if (K.hsGuess) $$(".k-chip", card).forEach((c) => { if (/HSコード/.test(c.textContent || "") && !c.querySelector(".v92prod-hsg")) { c.insertAdjacentHTML("beforeend", '<small class="v92prod-hsg">（推定・要確認）</small>'); c.setAttribute("data-v92prod-hs", "guess"); } });
    // 小計（同じ数え方。推定の HS は「入っていない」）
    const ul = col && $("ul.k-ck", col);
    if (ul) {
      const ok = new Set(K.okKeys), all = new Set(K.okKeys.concat(K.missKeys));
      const rows = GROUPS.map(([g, ks]) => { const kk = ks.filter((k) => all.has(k)); return { g, n: kk.length, f: kk.filter((k) => ok.has(k)).length, ng: kk.filter((k) => !ok.has(k)) }; }).filter((r) => r.n);
      const li = rows.map((r) => `<li data-v92prod-grp="${esc(r.g)}" data-v92prod-f="${r.f}" data-v92prod-n="${r.n}"><span class="${r.ng.length ? "ng" : "ok"}">${I(r.ng.length ? "alert" : "check", 16, 2.6)}</span><span style="flex:1">${esc(r.g)}</span><b style="font-size:13px;color:${r.ng.length ? "#D25F00" : "var(--k-gr)"}" title="${esc(r.ng.map((k) => (k === "hs" && K.hsGuess ? "HSコード（推定・要確認）" : nm(k, t))).join("・"))}">${r.f}/${r.n}</b></li>`);
      if (K.od) li.push(`<li data-v92prod-grp="任意" data-v92prod-f="${K.oc}" data-v92prod-n="${K.od}" class="v92prod-optli"><span class="${K.optMiss.length ? "ng" : "ok"}">${I(K.optMiss.length ? "alert" : "check", 16, 2.6)}</span><span style="flex:1">任意の項目<small>（%の外）</small></span><b style="font-size:13px;color:${K.optMiss.length ? "#D25F00" : "var(--k-gr)"}">${K.oc}/${K.od}</b></li>`);
      ul.innerHTML = li.join("");
      ul.setAttribute("data-v92prod-sum", String(rows.reduce((a, r) => a + r.f, 0)));
    }
    // 説明（21.90 の k-v90opt の1行目）：重み付きではなくなった
    const note = col && $(".k-v90opt", col);
    const p1 = note && $("p", note);
    if (p1) {
      const frac = K.full && K.optMiss.length ? `${K.c}/${K.d}で全体はそろっています` : `${K.c}/${K.d}＝${K.pct}%`;
      p1.innerHTML = `<b>%は、登録の項目（全体 ${K.d}件）がそろっている割合です</b>（入っている数で数えます：${frac}。そのうち必須は ${K.b}件で、入っているのは ${K.a}件）。${K.hsGuess ? "HSコードの推定（要確認）は数に入れていません。" : ""}下の任意の項目は%に入れず、別に数えます（任意 ${K.oc}/${K.od}${K.optMiss.length ? `・あと${K.optMiss.length}件` : ""}）。`;
      p1.setAttribute("data-v92prod-note", "1");
    } else if (col && !$("[data-v92prod-note]", col)) {
      const n = document.createElement("p");
      n.className = "k-v92note"; n.setAttribute("data-v92prod-note", "1");
      n.innerHTML = `%は、登録の項目（全体 ${K.d}件）のうち入っている数の割合です（${K.c}/${K.d}）。${K.hsGuess ? "HSコードの推定（要確認）は数に入れていません。" : ""}`;
      col.appendChild(n);
    }
  });

  /* ── 商品情報を登録（up）：上の「情報の充足度」 ── */
  chain("up", (w) => {
    const f = fn("v92prodFill");
    const t = ten();
    const box = $("[data-rdprod]", w);
    const ring = box && $(".rd-ring", box);
    const K = f && t && t.item ? f(t) : null;
    if (!ring || !K) return;
    ringPaint(ring, K);
    const ul = ring.parentElement && $("ul.rd-ckl", ring.parentElement);
    if (ul) {
      const miss = K.missKeys.map((k) => (k === "hs" && K.hsGuess ? "HSコード（推定・要確認）" : nm(k, t)));
      const L = [`<li class="ok">${I("check", 16, 3)}入っている ${K.c}項目（全体 ${K.d}）</li>`];
      if (miss.length) L.push(`<li class="ng">${I("alert", 16)}残り ${miss.length}項目（${esc(miss.slice(0, 2).join("・"))}${miss.length > 2 ? " など" : ""}）</li>`);
      else L.push(`<li class="ok">${I("check", 16, 3)}全体の項目はそろっています</li>`);
      if (K.optMiss.length) L.push(`<li class="ng">${I("alert", 16)}任意 あと${K.optMiss.length}件（${esc(K.optMiss.slice(0, 2).map((x) => x.n).join("・"))}${K.optMiss.length > 2 ? " など" : ""}）</li>`);
      ul.innerHTML = L.join("");
      ul.setAttribute("data-v92prod-up", `${K.c}/${K.d}`);
    }
    // 右の AIヒアリング：重み付きの数え方では「そろっています」でも、推定の HS などが残るときは書き分ける
    const em = $(".rd-empty", box);
    if (em && !K.full && /そろっています/.test(em.textContent || "")) {
      const miss = K.missKeys.map((k) => (k === "hs" && K.hsGuess ? "HSコード（推定・要確認）" : nm(k, t)));
      em.innerHTML = `${I("alert", 18)} 全体 ${K.c}/${K.d}：あと ${esc(miss.slice(0, 2).join("・"))}${miss.length > 2 ? " など" : ""}`;
      em.setAttribute("data-v92prod-empty", "1");
    }
  });
})();
