/* 貿易クラウドAI商社マン デザイン刷新 第2弾：ログイン画面（手元だけ・2026-11-11）
   今のログインの部品（メール＋パスワード・アクセスコード・管理者・言語・エラー表示）はそのまま動かし、並べ方と見た目だけを変える。
   「無料」とは書かない（トライアルは有償） */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._lg) return;
  RD._lg = 1;
  const { I, $, $$, IMG } = RD;
  function deco() {
    const v = document.getElementById("lgv");
    if (!v || v.hidden) return;
    const c = $(".lgc", v);
    if (!c || c.dataset.k) return;
    c.dataset.k = "1";
    v.classList.add("k-lgv");
    const top = document.createElement("div");
    top.className = "k-lgtop rd-x";
    // 見出し・説明は言葉の切れ目（span.k-nw）でだけ改行する（スマホで「もっとか／んたん」と切れないように）
    const nw = (a) => a.map((t) => `${t[0] === " " ? " " : ""}<span class="k-nw">${t.trim()}</span>`).join("");
    top.innerHTML = `<span class="k-lgver">${/^(127\.0\.0\.1|localhost)$/.test(location.hostname) ? "刷新版プレビュー（手元だけ）" : "刷新版（社内確認用・データは今の版と共通）"}</span><img class="k-lglogo2" src="${IMG}logo_t.png" alt="貿易クラウド AI商社マン">
      <div class="k-lgcatch"><img src="${IMG}robot.png" alt="" class="k-lgbot"><div><h1>${nw(["貿易業務を、もっと", "かんたん・スマートに。"])}</h1><p>${nw(["AI商社マンは、", "海外展開の調査・交渉・", "規制確認などを", " AI でサポートする、", "貿易業務の", "クラウドサービスです。"])}</p>
        <div class="k-chips">${["市場・規制をすばやく調査", "バイヤーの候補を提案", "商談・見積・出荷まで支援"].map((t) => `<span class="k-chip">${I("check", 16, 3)}${t}</span>`).join("")}</div></div></div>
      <img class="k-lgport" src="${IMG}hero.png" alt="">`;
    const st = document.createElement("div");
    st.className = "k-lgsteps rd-x";
    st.innerHTML = `<b class="k-lgsth">ご利用までの<br><span>3ステップ</span></b>${[["monitor", "ログイン方法を選ぶ", "お客様 または 管理者"], ["edit", "必要な情報を入力", "メール・パスワード または アクセスコード"], ["play", "利用を開始", "すぐにご利用いただけます"]].map((x, i) => `${i ? `<span class="k-arr">${I("chevR", 20, 2.4)}</span>` : ""}<div class="k-step ${i === 0 ? "on" : ""}" style="cursor:default"><span class="k-sn">${i + 1}</span><span class="k-si">${I(x[0], 26)}</span><span><b>${x[1]}</b><small>${x[2]}</small></span></div>`).join("")}`;
    v.insertBefore(top, c);
    v.insertBefore(st, c);
    // 中の並べ替え（部品は動かすだけ）
    // 今の版のロゴの段（上のロゴと二重になる）。手元の案内の箱が先頭に入っても見つかるように、入力のない最初の画像の段を探す
    const logo = $$(":scope > div", c).find((d) => $("img", d) && !$("input,button,select,details,a", d));
    if (logo) logo.classList.add("k-lghide");
    const intro = $$(":scope > p", c).find((p) => /暗号化/.test(p.textContent || ""));
    if (intro) {
      const d = document.createElement("details");
      d.className = "k-lgsafe";
      d.innerHTML = `<summary>${I("shield", 18)}安心・安全について（データの暗号化と、AI・物流会社に送る範囲）</summary>`;
      intro.before(d); d.appendChild(intro);
    }
    const box = $("#v65a-box", c), code = $("#v65a-code", c), tabs = $(".lgtabs", c);
    if (box || code) {
      const g = document.createElement("div");
      const two = box && !box.hidden;
      g.className = "k-lg2" + (two ? " two" : "");
      if (two) {
        const p1 = document.createElement("section");
        p1.className = "k-lgp";
        p1.innerHTML = `<div class="k-lgph">${I("user", 26)}<b>会員の方<small>（お客様ログイン）</small></b><span class="k-tag bl">アカウントをお持ちの方</span></div>`;
        p1.appendChild(box);
        g.appendChild(p1);
      }
      if (code) {
        const p2 = document.createElement("section");
        p2.className = "k-lgp" + (two ? " warm" : "");
        p2.innerHTML = `<div class="k-lgph">${I("key", 26)}<b>アクセスコードでログイン<small>（体験用・デモ用のコード）</small></b>${two ? '<span class="k-tag or">メール未登録の方</span>' : ""}</div>`;
        p2.appendChild(code);
        code.open = true;
        g.appendChild(p2);
      }
      (tabs ? tabs.after(g) : c.prepend(g));
    }
    const adm = $("#ad-id", c);
    if (adm) {
      const p3 = document.createElement("section");
      p3.className = "k-lgp";
      p3.innerHTML = `<div class="k-lgph">${I("gear", 26)}<b>管理者<small>（STANDAGE・会社ごとの管理者）</small></b></div>`;
      const parts = [adm, $("#ad-pw", c), $("#ad-otp", c), $("#ad-go", c)].filter(Boolean);
      parts[0].before(p3);
      parts.forEach((x) => p3.appendChild(x));
    }
    const help = document.createElement("div");
    help.className = "k-lghelp rd-x";
    help.innerHTML = `<b>${I("help", 22)}はじめての方へ</b><a href="guide/" target="_blank" rel="noopener">${I("book", 18)}3分でわかるスタートガイド ${I("chevR", 16, 2.4)}</a><span class="k-hs">アカウントの発行・再有効化は、STANDAGE の担当までご連絡ください。</span>`;
    v.appendChild(help);
  }
  const mo = new MutationObserver(() => { try { deco(); } catch (e) { console.error("[rd login]", e); } });
  const start = () => { mo.observe(document.body, { childList: true, subtree: true }); deco(); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
