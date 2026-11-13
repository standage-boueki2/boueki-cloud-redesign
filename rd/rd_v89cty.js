/* 貿易クラウドAI商社マン 21.89 cty の刷新版の層（rd_pages2・rd_pages3 のあとに読む）
   No.371 販売先国の選定のおすすめのカード：国ごとの理由の文（r.why）をそのまま出していたため、以前の数え方で保存された分析では
          「STANDAGEの実績 バイヤー約43社（同カテゴリ換算・全710名）」のような古い数が出て、詳しい調査（いまの数え方）と食い違った。
          → 理由の文はアプリの v89ctyWhy を通し、カードに「バイヤー数」の行（詳しい調査・表と同じ文＝v89ctyBuyerTxt）を足す。
            分析が以前の数え方のときは、点数も以前の数で付けていることと「再分析」を、カードの上に出す
   No.375 設定（メンバー・権限）のチーム概要：商品の数を G("TENS")（G に無い名前＝いつも 0）で読んでいた → アプリの v89ctyTeamCounts の数に。
          参加中のメンバーは、今の版の「参加中 N」（台帳に無いログイン中のあなたを含めた数）と同じ数にし、内訳を下に書く */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v89cty) return;
  RD._v89cty = 1;
  const { $, $$, esc, I } = RD;
  const fn = (n) => { try { return typeof window[n] === "function" ? window[n] : null; } catch (e) { return null; } };
  const chain = (k, f) => { const p0 = RD.page[k]; RD.page[k] = (w, kk) => { if (p0) p0(w, kk); try { f(w, kk); } catch (e) { console.error("[rd] v89cty " + k, e); } }; };
  const ctyS = () => { try { const f = fn("ctyStore"); return f ? f() : null; } catch (e) { return null; } };

  /* ── No.371 ── */
  chain("cty", (w) => {
    const why = fn("v89ctyWhy"), txt = fn("v89ctyBuyerTxt");
    if (!why || !txt) return;
    const box = $(".rd-p2", w);
    if (!box) return;
    $$(".k-tiles > .k-card", box).forEach((card) => {
      const btn = $("[data-rdcty]", card);
      const c = btn ? btn.getAttribute("data-rdcty") : "";
      if (!c || card.dataset.v89cty) return;
      card.dataset.v89cty = "1";
      const t = txt(c);
      const p = $$("p[title]", card)[0];
      if (p) {
        let s = why(c, p.getAttribute("title") || "");
        if (t) s = s.split("／").filter((x) => x.trim() !== t).join("／"); // 同じ文は下の行に出すので重ねない
        p.setAttribute("title", s); p.textContent = s;
        if (!s.trim()) p.remove();
      }
      if (t) {
        const b = document.createElement("p");
        b.className = "k-v89buy"; b.dataset.v89buy = c;
        b.innerHTML = `${I("users", 15, 2.4)}<span><b>バイヤー数</b>${esc(t)}</span>`;
        if (btn) btn.before(b); else card.appendChild(b);
      }
    });
    const S = ctyS(), old = fn("v89ctyOldDef");
    if (S && old && old(S) && !$(".k-v89old", box)) {
      const n = document.createElement("section");
      n.className = "k-card k-v89old"; n.setAttribute("role", "note");
      n.innerHTML = `<span class="k-v89oi">${I("alert", 20, 2.4)}</span><div><b>この分析は、以前の数え方のときに作られました</b><p>カードの「バイヤー数」は、いまの数え方（STANDAGE がおまかせ貿易で商談したバイヤーの社数・貿易クラウド Ver.1 の商談記録）で出しています。総合点と順位は以前の数で付けたままです。再分析すると、点数もいまの数え方にそろいます。</p></div><button type="button" class="k-btn white" data-v89rerun="1">${I("refresh", 18)}再分析する</button>`;
      const first = box.firstElementChild;
      if (first && first.nextSibling) box.insertBefore(n, first.nextSibling); else box.prepend(n);
      const b = $("[data-v89rerun]", n);
      if (b) b.addEventListener("click", (e) => { e.preventDefault(); const run = fn("ctyRun"); if (run) { b.disabled = true; Promise.resolve(run(false)).catch((x) => console.error("[rd] v89cty rerun", x)); } });
    }
  });

  /* ── No.375 ── */
  chain("team", (w) => {
    const cnt = fn("v89ctyTeamCounts");
    if (!cnt) return;
    const K = cnt();
    const tl = $$(".rd-p2 .k-tile", w);
    const tile = (re) => tl.find((x) => re.test((($(".k-tl", x) || {}).textContent || "")));
    const setN = (el, n, sub) => {
      if (!el) return;
      const tn = $(".k-tn", el);
      if (tn) { const u = $("small", tn); tn.textContent = String(n); if (u) tn.appendChild(u); tn.dataset.v89n = String(n); }
      if (sub) { let s = $(".k-ts", el); if (!s) { s = document.createElement("span"); s.className = "k-ts"; const tn2 = $(".k-tn", el); if (tn2) tn2.after(s); } s.textContent = sub; s.classList.add("k-v89ts"); }
    };
    setN(tile(/^登録している商品$/), K.prods, "商品一覧に登録している数");
    if (K.ok) {
      // 今の版の「参加中 N」と同じ数（台帳に無いログイン中のあなたを足した数）
      const act = K.act + (K.meUnreg ? 1 : 0);
      const sub = K.meUnreg
        ? (K.shared ? `ログイン中のあなた（${K.me}）だけを数えています（共通アカウントのため、メンバーの台帳はありません）` : `台帳に登録 ${K.act}名＋ログイン中のあなた（${K.me}・台帳には未登録）`)
        : `メンバーの台帳に登録している人の数`;
      setN(tile(/^参加中のメンバー$/), act, sub);
      setN(tile(/^招待中$/), K.inv, "");
      setN(tile(/^停止中$/), K.stop, "");
    }
  });
})();
