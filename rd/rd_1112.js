/* 貿易クラウドAI商社マン デザイン刷新：社内の意見（2026-11-12 大瀧さん）への直し
   ① 「3分でわかるスタートガイド」：押すと55ページのはじめてガイドが開いていた
      → この画面の上で開く1枚の案内（5つの手順・各手順からその画面へ）。くわしい版（はじめてガイド）は別に残す
   ② 左のメニュー：よく使う5つ（ホーム・今日やること・商品・AIに聞く・困ったとき）＋「すべての機能」（rd.js の buildSide）
   ③ 専門用語：画面のどこに出ても、押すと説明（rd_uat.js の termScan）。今のアプリの印（.tm・.v54term）も同じ見た目と窓に
   今のアプリの関数は呼ぶだけ（差し替えない） */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._r1112) return;
  RD._r1112 = 1;
  const { I, esc, $, $$, G } = RD;
  const isAdmin = () => { const S = G("SES"); return !!(S && S.t === "admin"); };

  /* ───────── ① 3分でわかるスタートガイド ───────── */
  const QS = {
    who: "荷主向け",
    s: "AI商社マンは、この5つの順で使います。各手順のボタンから、その画面を開けます。",
    st: [
      { ic: "home", t: "ホームで「まずやること」を見る", b: "次にやることを、AI商社マンが順番に出します。迷ったら、左のメニューの「ホーム」へ戻ります。", go: [["dash:home", "ホームを開く"]] },
      { ic: "box", t: "商品を登録する", b: "商品の資料（PDF・Excel・写真など）をアップロードするだけ。AIが読み取り、足りない情報だけを質問します。", go: [["up", "商品を登録する"]] },
      { ic: "globe", t: "売り先の国を選ぶ", b: "AIが、商品に合った国をデータでおすすめします。3か国まで選んで「確定」します。", go: [["cty", "販売先国の選定を開く"]] },
      { ic: "send", t: "営業資料をつくり、バイヤーに提案する", b: "外国語の営業資料は、AIが商品に合わせて作ります。「AIバイヤー開拓」で相手を見つけて、提案します。", go: [["deck", "営業資料を開く"], ["db", "AIバイヤー開拓を開く"]] },
      { ic: "chat", t: "困ったら「AIに聞く」", b: "わからないことは、日本語でそのまま聞けます。画面の点線の言葉は、押すと説明が出ます。", go: [["ai", "AIに聞く"]] },
    ],
  };
  const QF = {
    who: "物流会社向け",
    s: "AI物流マンは、この5つの順で使います。各手順のボタンから、その画面を開けます。",
    st: [
      { ic: "home", t: "ホームで「今日やること」を見る", b: "届いた見積の依頼など、対応が要るものを順番に出します。迷ったら、左のメニューの「ホーム」へ戻ります。", go: [["fhome", "ホームを開く"]] },
      { ic: "db", t: "自社のレートを登録する", b: "「物流レート管理」で、運賃表（Excel・CSV）を取り込みます。AIが見積の案を作るときに使います。", go: [["frates", "物流レート管理を開く"]] },
      { ic: "mail", t: "見積受信箱で、依頼に答える", b: "荷主から届いた見積の依頼を確かめ、AIの見積の案を見て、承認・提出します。", go: [["finbox", "見積受信箱を開く"]] },
      { ic: "box", t: "選ばれた案件を進める", b: "「案件・出荷管理」で、仮押さえから出荷完了まで、進み具合を管理します。", go: [["fcase", "案件・出荷管理を開く"]] },
      { ic: "chat", t: "困ったら「AIに聞く」", b: "AI物流マンに、操作のことも物流のことも聞けます。", go: [["fai", "AIに聞く"]] },
    ],
  };
  let qgBack = null;
  function qgClose() {
    const d = document.getElementById("k-qg"); if (!d) return;
    d.remove();
    document.documentElement.classList.remove("k-qgon");
    if (qgBack && document.contains(qgBack)) { try { qgBack.focus(); } catch (e) { /* 無視 */ } }
    qgBack = null;
  }
  function quickGuide() {
    qgClose();
    const inApp = !RD.locked() && !isAdmin();
    const fwd = inApp && RD.isFwd();
    const Q = fwd ? QF : QS;
    qgBack = document.activeElement;
    const d = document.createElement("div");
    d.id = "k-qg"; d.className = "k-qg rd-x";
    d.setAttribute("role", "dialog"); d.setAttribute("aria-modal", "true"); d.setAttribute("aria-labelledby", "k-qgt");
    d.innerHTML = `<div class="k-qgbox">
      <button type="button" class="k-qgx" data-qgclose="1" aria-label="閉じる">${I("x", 22, 2.4)}</button>
      <div class="k-qghd"><img src="${RD.IMG}robot.png" alt=""><div><span class="k-qgchip">${I("clock", 14, 2.4)}はじめての方へ・読むのは約3分・${esc(Q.who)}</span><h2 id="k-qgt">3分でわかるスタートガイド</h2><p>${esc(Q.s)}</p></div></div>
      <ol class="k-qgst">${Q.st.map((x, i) => `<li><span class="k-qgn">${i + 1}</span><span class="k-qgi">${I(x.ic, 24, 1.9)}</span><div class="k-qgtx"><b>${esc(x.t)}</b><p>${esc(x.b)}</p>${inApp ? `<div class="k-qggo">${x.go.map((g) => `<button type="button" class="k-btn white k-mini" data-qggo="${esc(g[0])}">${esc(g[1])} ${I("chevR", 14, 2.4)}</button>`).join("")}</div>` : ""}</div></li>`).join("")}</ol>
      <div class="k-qgft">${inApp ? `<p>${I("list", 16)}ほかの機能は、左のメニューの「<b>すべての機能</b>」に全部あります。</p>` : `<p>${I("lock", 16)}ログインすると、各手順のボタンから、その画面を開けます（物流会社の方は、ログイン後に物流会社向けの手順が出ます）。</p>`}
        <div class="k-qgfb">${fwd ? `<button type="button" class="k-btn ghost" data-qghelp="1">${I("help", 17)}物流会社向け・使い方ガイドを開く</button>` : `<a class="k-btn ghost" href="guide/" target="_blank" rel="noopener">${I("folder", 17)}もっとくわしく：はじめてガイド（くわしい版・別のタブ）</a>`}<button type="button" class="k-btn" data-qgclose="1">${I("check", 17, 2.6)}閉じる</button></div></div>
    </div>`;
    document.body.appendChild(d);
    document.documentElement.classList.add("k-qgon");
    const x = $(".k-qgx", d); if (x) x.focus();
  }
  RD.quickGuide = quickGuide;
  document.addEventListener("click", (e) => {
    const q = e.target.closest && e.target.closest("[data-rdquick]");
    if (q) { e.preventDefault(); e.stopPropagation(); quickGuide(); return; }
    const d = document.getElementById("k-qg"); if (!d) return;
    if (e.target === d || (e.target.closest && e.target.closest("[data-qgclose]"))) { e.preventDefault(); qgClose(); return; }
    const g = e.target.closest && e.target.closest("[data-qggo]");
    if (g) { e.preventDefault(); const k = g.dataset.qggo; qgClose(); try { closeDW(); } catch (x) { /* 無い */ } RD.goKey(k); return; } // eslint-disable-line no-undef
    const h = e.target.closest && e.target.closest("[data-qghelp]");
    if (h) { e.preventDefault(); qgClose(); if (RD.openHelp) RD.openHelp(); }
  }, true);
  document.addEventListener("keydown", (e) => {
    const d = document.getElementById("k-qg"); if (!d) return;
    if (e.key === "Escape") { e.preventDefault(); qgClose(); return; }
    if (e.key === "Tab") { // 窓の中だけを回る
      const f = $$("button, a[href]", d).filter((x) => x.getClientRects().length);
      if (!f.length) return;
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  }, true);

  /* ───────── ③ 今のアプリの用語の印（.tm の上に出る黒い吹き出し・#v54tp）は、刷新版の説明の窓と重ならないように隠す（ログイン後の日本語の画面だけ） ───────── */
  setInterval(() => {
    try {
      const s = document.getElementById("lang");
      const on = !RD.locked() && !isAdmin() && (!s || !s.value || /^ja/.test(s.value));
      document.documentElement.classList.toggle("k-tmon", on);
    } catch (e) { /* 無視 */ }
  }, 800);
})();
