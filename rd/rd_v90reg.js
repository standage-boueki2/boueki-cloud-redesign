/* 貿易クラウドAI商社マン 21.90 reg の刷新版の層（rd_uat・rd_pages2 のあとに読む）
   No.441 出荷・受注のつなぎの画面（rd_uat の BRIDGE＝ops:ship・ops:ord）に、提供の時期（日付は決まっていない・決まりしだいお知らせ）の1行
   No.445 外国語の営業資料：必須が足りないとき、大きなボタン「外国語の営業資料を生成する」と「必須の項目がそろうと作れます。」が並び、作れるのか分からない
          → いま作れるもの（下書き〔空欄つき〕）と、完成版にあと何が要るかを、ボタンの文字と下の1行で出す。ボタンは押せるまま（下書きを作れる＝今の版と同じ）
   No.346 AIの「考え中」の表示（右下）：別の画面に移ると1行にたたみ、経過・目安・棒を隠していた。元の画面に戻っても1行のまま
          → たたんでも、進み具合の1行（経過／目安・いまの段）と棒は出す。始めた画面に戻ったら元の大きさに戻す
   No.452 ログインの待ちの表示（rd_uat の #k-lgwait）：段の印は画面の文から推し量り、目安は決め打ちの「30〜60秒」
          → 段の印はアプリが記録した実際の通信の終わり（V90REGLG）で付け、この端末の最近のログインの時間（真ん中の値）があれば、それと「あと約◯秒」を出す */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v90reg) return;
  RD._v90reg = 1;
  const { $, $$, esc } = RD;
  const chain = (k, f) => { const p0 = RD.page[k]; RD.page[k] = (w, kk) => { if (p0) p0(w, kk); try { f(w, kk); } catch (e) { console.error("[rd] v90reg " + k, e); } }; };

  /* ── No.441 ── */
  ["ops:ship", "ops:ord"].forEach((k) => chain(k, (w) => {
    const b = $(".k-bridge", w); if (!b || $(".k-v90when", b)) return;
    const p = document.createElement("p"); p.className = "k-ctyex k-v90when";
    p.textContent = "提供の時期（日付）はまだ決まっていません。決まりしだいお知らせします。それまでは下の手順で進められます（押すと、その画面が開きます）。";
    const ex = $(".k-ctyex", b); if (ex) ex.after(p); else b.appendChild(p);
  }));

  /* ── No.445 ── */
  chain("deck", (w) => {
    const big = $$(".rd-x .k-btn.big.wide", w).find((x) => /外国語の営業資料を生成する/.test(x.textContent || ""));
    if (!big || big.dataset.v90reg) return;
    const ring = $$(".rd-x h2", w).map((x) => x.textContent || "").join(" ");
    const m = ring.match(/あと\s*(\d+)\s*項目/);
    if (!m) return; // 必須がそろっている＝今のまま
    big.dataset.v90reg = "1";
    const n = +m[1];
    const nx = (($(".v84m-nx b", w) || {}).textContent || "").trim();
    // ボタンの文字だけ替える（アイコンと動きはそのまま）
    const tn = [...big.childNodes].find((x) => x.nodeType === 3 && /外国語の営業資料を生成する/.test(x.nodeValue));
    if (tn) tn.nodeValue = "下書き（空欄つき）を作る";
    big.setAttribute("aria-label", "外国語の営業資料の下書き（空欄つき）を作る");
    const note = big.nextElementSibling && big.nextElementSibling.matches(".rd-note") ? big.nextElementSibling : null;
    const html = `<span class="k-v90cando"><b class="ok">いま作れる：下書き（空欄つき・社内確認用）</b><b class="ng">完成版（バイヤーに渡せる版）：あと ${n} 項目${nx ? `：${esc(nx)}` : ""}。入れると作れます</b></span>`;
    if (note) { note.innerHTML = html; note.classList.add("k-v90note"); } else big.insertAdjacentHTML("afterend", `<p class="rd-note k-v90note">${html}</p>`);
    const h2 = $$(".rd-x h2", w).find((x) => /あと\s*\d+\s*項目で営業資料を作成できます/.test(x.textContent || ""));
    if (h2) h2.textContent = `あと ${n} 項目で、完成版の営業資料を作れます（下書きは今すぐ作れます）`;
  });

  /* ── No.346 ── */
  let startKey = null;
  const think = () => {
    const d = document.getElementById("aiThink"); if (!d) return;
    if (!d.classList.contains("on")) { startKey = null; d.classList.remove("k-v90"); return; }
    const k = RD.locked && RD.locked() ? "" : RD.curKey();
    if (startKey === null) startKey = k;
    d.classList.add("k-v90");
    if (k === startKey && d.classList.contains("k-mini")) d.classList.remove("k-mini");
  };
  setInterval(() => { try { think(); } catch (e) { /* 次の回で */ } }, 200);

  /* ── No.452 ── */
  const lgPatch = () => {
    const p = document.getElementById("k-lgwait"); const L = window.V90REGLG; if (!p || !L) return;
    const cur = L.cur && L.cur(); const M = L.med && L.med();
    const lis = $$(".k-lgwst li", p);
    if (cur && lis.length >= 2) {
      const dot = '<i class="k-dot"></i>';
      const mark = (li, st) => { if (!li || li.dataset.v90 === st) return; li.dataset.v90 = st; li.className = st === "ok" ? "ok" : st === "on" ? "on" : ""; const tx = li.textContent; li.innerHTML = (st === "ok" ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg>' : st === "on" ? dot : '<i class="k-dot off"></i>') + esc(tx); };
      mark(lis[0], cur.acct ? "ok" : "on");
      mark(lis[1], cur.data ? "ok" : cur.acct ? "on" : "");
    }
    const para = $$("p", p).find((x) => /ふだん/.test(x.textContent || "") && !x.dataset.v90);
    if (para && M) {
      const t0 = cur && cur.t0 ? cur.t0 : 0; const sec = t0 ? Math.round((Date.now() - t0) / 1000) : 0; const med = Math.round(M.med / 1000);
      const rest = med - sec;
      para.dataset.v90 = "1";
      para.innerHTML = `この端末の最近のログインは <b>約${med}秒</b>（最近${M.n}回の真ん中の値）でした。${rest > 0 ? `あと約${rest}秒の見込みです。` : "いつもより時間がかかっています（止まってはいません）。"}時間の大半は、同期サーバーでの確認と読み込みです。この画面のままお待ちください。${sec > 90 ? "<br><b>2分たっても進まないときは、通信の状態を確かめて、ページを読み込み直してください。</b>" : ""}`;
    }
  };
  const mo = new MutationObserver(() => { try { lgPatch(); } catch (e) { /* 無視 */ } });
  mo.observe(document.body, { childList: true, subtree: true });
})();
