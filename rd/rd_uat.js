/* 貿易クラウドAI商社マン デザイン刷新：UAT（2026-11-11 ペルソナ評価）の指摘への直し
   ① 文字の大きさ（表示の密度：ゆったり・標準・コンパクト）を上の帯に戻す（今の版の ux32DensSet をそのまま使う）
   ② 用語の一言説明：どの画面でも、最初に出た貿易の用語に点線と「？」を付け、押すと一言の説明（今の版の用語集 GL・V54_TERMS ＋足りない語）
   ③ AIの「考え中」の表示を右下の小さな表示に。別の画面へ移ったら1行にたたむ（画面の真ん中を覆わない）
   ④ ログインの直後は、いつもホームに着地（メッセージへのリンク #msg= などで開いたときは除く）
   ⑤ ログインの待ち時間に、進み具合（いまの段・経過の秒・ふだんの目安）を出す
   ⑥ アクセスコードの注意書きを「体験用・デモ用のコードは使える」から書く（「11月9日で終わりました」と矛盾して見えないように）
   ⑦ AI商社マンへの相談：答えのあとに「貴社のいまの準備（あと○つ・次はこれ）」を添え、画面にも準備の状況を出す
   ⑧ 出荷を進める・受注・請求・入金（開発中）に「リリースまでの進め方」（いま使える機能でつなぐ）
   今のアプリの関数は呼ぶだけ（差し替えない）。架空の数字は出さない */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._uat) return;
  RD._uat = 1;
  const { I, esc, $, $$, G } = RD;
  const goKey = (k) => RD.goKey(k);
  const isAdmin = () => { const S = G("SES"); return !!(S && S.t === "admin"); };
  const isJa = () => { const s = document.getElementById("lang"); return !s || !s.value || /^ja/.test(s.value); };

  /* ───────── ① 文字の大きさ（表示の密度） ───────── */
  const DENS = [["comfy", "ゆったり", "文字と余白を大きく。はじめての方・画面から離れて見るときに"], ["std", "標準", "おすすめ"], ["compact", "コンパクト", "一覧を詰めて、1画面に多く表示（PC）"]];
  const densGet = () => { try { return typeof ux32DensGet === "function" ? ux32DensGet() : "std"; } catch (e) { return "std"; } }; // eslint-disable-line no-undef
  function densSet(v) {
    try { ux32DensSet(v); } // eslint-disable-line no-undef
    catch (e) { document.body.classList.toggle("dens-comfy", v === "comfy"); document.body.classList.toggle("dens-compact", v === "compact"); }
    densPaint();
  }
  function densClose() { const m = document.getElementById("k-densm"); if (m) m.remove(); const b = $(".bar .k-dens"); if (b) b.setAttribute("aria-expanded", "false"); }
  function densOpen(b) {
    if (document.getElementById("k-densm")) { densClose(); return; }
    const cur = densGet();
    const m = document.createElement("div");
    m.id = "k-densm"; m.setAttribute("role", "menu"); m.setAttribute("aria-label", "文字の大きさ");
    m.innerHTML = `<p class="k-densh">文字の大きさ（表示の密度）</p>` + DENS.map(([k, l, d]) => `<button type="button" role="menuitemradio" aria-checked="${k === cur}" data-kdens="${k}"><span class="k-densaa k-${k}">Aa</span><span><b>${esc(l)}</b><small>${esc(d)}</small></span></button>`).join("");
    document.body.appendChild(m);
    const r = b.getBoundingClientRect();
    m.style.top = Math.round(r.bottom + 8) + "px";
    m.style.right = Math.max(8, Math.round(innerWidth - r.right)) + "px";
    b.setAttribute("aria-expanded", "true");
    m.addEventListener("click", (e) => { e.stopPropagation(); const x = e.target.closest("[data-kdens]"); if (x) { densSet(x.dataset.kdens); densClose(); } });
    m.addEventListener("keydown", (e) => { if (e.key === "Escape") { densClose(); b.focus(); } });
    const f = $('[aria-checked="true"]', m) || $("button", m); if (f) f.focus();
    setTimeout(() => document.addEventListener("click", function h() { densClose(); document.removeEventListener("click", h); }), 0);
  }
  function densPaint() {
    const b = $(".bar .k-dens"); if (!b) return;
    const v = densGet(), d = DENS.find((x) => x[0] === v) || DENS[1];
    const html = `<span class="k-aa" aria-hidden="true">Aa</span><span class="k-dl">文字の大きさ<small>${esc(d[1])}</small></span>`;
    if (b.dataset.v !== v) { b.innerHTML = html; b.dataset.v = v; }
    b.setAttribute("aria-label", "文字の大きさ（表示の密度）：" + d[1]);
  }
  function densBtn() {
    const bar = document.querySelector(".bar.k-bar2"); if (!bar) return;
    let b = $(".k-dens", bar);
    if (!b) {
      b = document.createElement("button");
      b.type = "button"; b.className = "k-dens"; b.setAttribute("aria-haspopup", "menu"); b.setAttribute("aria-expanded", "false");
      b.title = "文字の大きさ・表示の密度（ゆったり・標準・コンパクト）";
      b.addEventListener("click", (e) => { e.stopPropagation(); densOpen(b); });
      const bell = document.getElementById("bell");
      if (bell && bell.parentElement === bar) bell.before(b); else bar.appendChild(b);
    }
    densPaint();
  }

  /* ───────── ② 用語の一言説明 ───────── */
  const EXTRA = {
    "仕向け国": "商品を送る先の国（輸出先の国）のことです。「仕向国」とも書きます。",
    "仕向国": "商品を送る先の国（輸出先の国）のことです。「仕向け国」とも書きます。",
    "仕向地": "商品を届ける先の場所（国・港・都市）のことです。",
    "スリーティア制": "アメリカでお酒を売るときの決まりです。①輸入業者（インポーター）②卸（ディストリビューター）③小売店・飲食店の3段階を通して売ります。メーカーが小売店や消費者へ直接売ることは、原則できません。",
    "三層流通": "アメリカでお酒を売るときの決まり（スリーティア制）です。輸入業者→卸→小売店・飲食店の3段階を通して売ります。",
    "インポーター": "相手の国で輸入の手続きをして、商品を受け取る会社（輸入業者）です。",
    "ディストリビューター": "相手の国で商品を仕入れて、小売店や飲食店に卸す会社（卸・販売代理店）です。",
    "建値": "値段がどこまでの費用を含むかの条件（FOB・CIF など）です。同じ商品でも、建値で金額が変わります。",
    "船積書類": "輸出の貨物と一緒に要る書類一式（インボイス・パッキングリスト・B/L・原産地証明など）です。",
    "インボイス": "送り状。出荷する商品の内容と金額を書いた書類で、通関に必ず要ります（CI と同じ）。",
    "パッキングリスト": "梱包明細書。何をいくつ、どの箱に、何kgで詰めたかを書いた書類です（PL と同じ）。",
    "関税": "商品を輸入するときに、相手の国でかかる税金です。HSコードと相手の国で率が決まります。",
    "仮押さえ": "船や飛行機の荷物のスペースを、本予約の前に一時的に確保しておくことです。",
    "相見積": "いくつかの会社から見積を取って、値段や条件を比べることです。",
    "リードタイム": "注文を受けてから、商品が届くまでにかかる日数です。",
    "THC": "港のターミナルで荷物を扱う費用（Terminal Handling Charge）です。",
    "CBM": "荷物の体積の単位（立方メートル）です。船の運賃の計算に使います。",
    "SDS": "安全データシート。成分と危険性・取り扱いを書いた書類です（MSDS と同じ）。",
    "COA": "分析証明書。製品の成分や品質を検査した結果を示す書類です。",
    "FDA": "アメリカの食品医薬品局。食品・化粧品を輸出するときの施設登録や事前通報を受け付けます。",
  };
  let TERM = null, TERM_RE = null;
  function termDict() {
    if (TERM) return TERM;
    const M = {}, V = {};
    let GLx = {};
    try { (typeof V54_TERMS !== "undefined" && Array.isArray(V54_TERMS) ? V54_TERMS : []).forEach((x) => { if (x && x.k) V[x.k] = x; }); } catch (e) { /* 無い版 */ } // eslint-disable-line no-undef
    try { GLx = typeof GL !== "undefined" && GL ? GL : {}; } catch (e) { GLx = {}; } // eslint-disable-line no-undef
    const add = (k, s, n, long) => { if (!k || !s || M[k]) return; M[k] = { k, n: n || k, s: String(s), long: long && long !== s ? String(long) : "" }; };
    Object.keys(GLx).forEach((k) => add(k, GLx[k], V[k] && V[k].n, V[k] && V[k].t));
    Object.keys(EXTRA).forEach((k) => add(k, EXTRA[k]));
    Object.keys(V).forEach((k) => add(k, V[k].t, V[k].n));
    [["HS コード", "HSコード"], ["仕向け地", "仕向地"]].forEach(([a, k]) => { if (M[k] && !M[a]) M[a] = Object.assign({}, M[k], { k: a }); }); // 書き方の揺れ
    const er = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
    const keys = Object.keys(M).sort((a, b) => b.length - a.length);
    TERM_RE = new RegExp(keys.map((k) => (/^[A-Za-z0-9/]+$/.test(k) ? `(?<![A-Za-z0-9/])${er(k)}(?![A-Za-z0-9/])` : er(k))).join("|"), "g");
    TERM = M;
    return M;
  }
  RD.termDict = termDict;
  const SKIP = "script,style,textarea,input,select,option,button,a,code,pre,abbr,svg,summary,label,h1,[contenteditable],.k-term,.tm,.v54term,.bb,.ci,[data-noi18n],[lang]:not([lang^=ja]),[role=button],[data-onclick],[data-kact],.k-tag,.k-chip,.p,#k-tp,.k-termhint";
  const TERM_MAX = 16;
  let termBusy = false;
  function termScan() {
    if (termBusy || RD.locked() || isAdmin() || !isJa()) return 0;
    const w = document.getElementById("well"); if (!w) return 0;
    const D = termDict(); if (!TERM_RE) return 0;
    termBusy = true;
    let made = 0;
    try {
      const seen = new Set($$(".k-term", w).map((x) => x.dataset.kterm));
      if (seen.size >= TERM_MAX) return 0;
      const tw = document.createTreeWalker(w, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
        acceptNode(n) {
          if (n.nodeType === 1) { if (n.matches(SKIP)) return NodeFilter.FILTER_REJECT; if (!n.getClientRects().length && n.tagName !== "TBODY" && n.tagName !== "TR") return NodeFilter.FILTER_REJECT; return NodeFilter.FILTER_SKIP; }
          return /\S/.test(n.nodeValue || "") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        },
      });
      const texts = [];
      for (let n = tw.nextNode(); n; n = tw.nextNode()) texts.push(n);
      for (const t0 of texts) {
        if (seen.size >= TERM_MAX) break;
        let t = t0;
        TERM_RE.lastIndex = 0;
        let s = t.nodeValue, m, guard = 0;
        while (t && (m = TERM_RE.exec(s)) && guard++ < 20) {
          const key = m[0];
          if (seen.has(key) || !D[key]) continue;
          const mid = t.splitText(m.index);
          const rest = mid.splitText(key.length);
          const ab = document.createElement("abbr");
          ab.className = "k-term"; ab.tabIndex = 0; ab.dataset.kterm = key;
          ab.setAttribute("aria-label", key + "（押すと説明）");
          mid.parentNode.replaceChild(ab, mid); ab.appendChild(mid);
          seen.add(key); made++;
          t = rest; s = t.nodeValue; TERM_RE.lastIndex = 0;
          if (seen.size >= TERM_MAX) break;
        }
      }
      if (made || $(".k-term", w)) termHint(w);
    } catch (e) { console.error("[rd uat term]", e); } finally { termBusy = false; }
    return made;
  }
  function termHint(w) {
    const ht = $("[data-rdhero] .rd-ht", w);
    if (!ht || $(".k-termhint", ht)) return;
    const p = document.createElement("p");
    p.className = "k-termhint";
    p.innerHTML = `<span class="k-term k-termdemo" aria-hidden="true">点線</span>の言葉は、押すと説明が出ます（一覧は「<button type="button" class="k-link" data-kgloss="1">用語集</button>」）`;
    ht.appendChild(p);
  }
  let tpPin = false, tpT = 0, tpFor = null;
  function tpClose() { const d = document.getElementById("k-tp"); if (d) d.remove(); if (tpFor) tpFor.removeAttribute("aria-describedby"); tpFor = null; tpPin = false; }
  function tpOpen(ab, pin) {
    const D = termDict(), x = D[ab.dataset.kterm];
    if (!x) return;
    if (tpFor === ab && document.getElementById("k-tp")) { if (pin) tpPin = true; return; }
    tpClose();
    const d = document.createElement("div");
    d.id = "k-tp"; d.setAttribute("role", "tooltip");
    d.innerHTML = `<b>${esc(x.n)}</b><p>${esc(x.s)}</p>${x.long ? `<details><summary>くわしく</summary><p class="k-tpl">${esc(x.long)}</p></details>` : ""}<button type="button" class="k-link" data-kgloss="1">${I("book", 15)}貿易のことばの一覧（用語集）を開く</button>`;
    document.body.appendChild(d);
    ab.setAttribute("aria-describedby", "k-tp");
    const r = ab.getBoundingClientRect(), Wd = Math.min(360, innerWidth - 24);
    d.style.width = Wd + "px";
    let left = Math.max(12, Math.min(r.left, innerWidth - Wd - 12)), top = r.bottom + 8;
    const h = d.offsetHeight;
    if (top + h > innerHeight - 8 && r.top - h - 8 > 8) top = r.top - h - 8;
    d.style.left = Math.round(left) + "px"; d.style.top = Math.round(top) + "px";
    d.addEventListener("mouseenter", () => clearTimeout(tpT));
    d.addEventListener("mouseleave", () => { if (!tpPin) { clearTimeout(tpT); tpT = setTimeout(tpClose, 250); } });
    tpFor = ab; tpPin = !!pin;
  }
  document.addEventListener("mouseover", (e) => {
    const ab = e.target.closest && e.target.closest(".k-term:not(.k-termdemo)");
    if (!ab) return;
    clearTimeout(tpT);
    tpT = setTimeout(() => tpOpen(ab, false), 180);
  });
  document.addEventListener("mouseout", (e) => {
    const ab = e.target.closest && e.target.closest(".k-term:not(.k-termdemo)");
    if (!ab || tpPin) return;
    clearTimeout(tpT);
    tpT = setTimeout(() => { if (!tpPin) tpClose(); }, 250);
  });
  document.addEventListener("click", (e) => {
    const g = e.target.closest && e.target.closest("[data-kgloss]");
    if (g) { e.preventDefault(); e.stopPropagation(); tpClose(); goKey("gloss"); return; }
    const ab = e.target.closest && e.target.closest(".k-term:not(.k-termdemo)");
    if (ab) { e.preventDefault(); e.stopPropagation(); if (tpFor === ab && tpPin) tpClose(); else { clearTimeout(tpT); tpClose(); tpOpen(ab, true); } return; }
    if (!(e.target.closest && e.target.closest("#k-tp"))) tpClose();
  }, true);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { tpClose(); densClose(); }
    const ab = e.target && e.target.closest && e.target.closest(".k-term:not(.k-termdemo)");
    if (ab && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); tpOpen(ab, true); }
  });
  window.addEventListener("scroll", () => { if (!tpPin) tpClose(); }, { passive: true, capture: true });
  // 中身が描き直されたら、少し待って用語を付け直す
  let termT = 0;
  const termMo = new MutationObserver(() => { if (termBusy) return; clearTimeout(termT); termT = setTimeout(termScan, 700); });

  /* ───────── ③ AIの「考え中」の表示（右下・移ったら1行に） ───────── */
  let thinkKey = null;
  setInterval(() => {
    const d = document.getElementById("aiThink"); if (!d) return;
    if (!d.classList.contains("on")) { thinkKey = null; d.classList.remove("k-mini"); return; }
    const k = RD.locked() ? "" : RD.curKey();
    if (thinkKey === null) thinkKey = k;
    if (k !== thinkKey) d.classList.add("k-mini");
  }, 400);

  /* ───────── ④ ログインの直後はホーム ／ ⑤ ログインの待ち時間 ／ ⑥ アクセスコードの注意書き ───────── */
  let wasLocked = true, landAt = 0, userActed = false;
  // 着地の見張りは、押す・キー・画面の移動の呼び出し（メニュー・ボタン・リンク・ほかの部品から）のどれかがあれば、その場で止める
  ["pointerdown", "click", "keydown"].forEach((ev) => document.addEventListener(ev, () => { if (landAt) userActed = true; }, true));
  const goKey0 = RD.goKey;
  RD.goKey = function () { if (landAt) userActed = true; return goKey0.apply(this, arguments); };
  function land() {
    if (!landAt) return;
    if (userActed || Date.now() - landAt > 6000) { landAt = 0; return; } // 着地の見張りは6秒だけ（自分で押したら止める）
    if (RD.locked() || isAdmin() || /^#(msg|rep)=/.test(location.hash || "")) return;
    if (document.getElementById("welv")) return; // はじめての方の案内（今の版の窓）は閉じるまで待つ
    const home = (() => { const S = G("SES"); return S && S.role === "fwd" ? "fhome" : "dash:home"; })();
    if (RD.curKey() !== home) goKey0(home); // 自分の移動は見張りを止めない
  }
  function lgWait() {
    const v = document.getElementById("lgv");
    let p = document.getElementById("k-lgwait");
    const lockedNow = document.body.classList.contains("locked");
    if (!v || !lockedNow || v.hidden) { if (p) p.remove(); RD._lgT0 = 0; return; }
    const st = ((document.getElementById("lg-err") || {}).textContent || "") + " " + ((document.getElementById("lg-go") || {}).textContent || "");
    const all = st + " " + ($$("#lgv [role=status], #lgv [aria-live]").map((x) => x.textContent || "").join(" "));
    const busy = /台帳を確認しています|サーバーで確認できました|データを読み込んでいます|同期しています/.test(all);
    const err = /⚠|✕|できません|ちがいます|違います|見つかりません|無効|切れ/.test(((document.getElementById("lg-err") || {}).textContent) || "");
    if (!busy || err) { if (p) p.remove(); RD._lgT0 = 0; return; }
    if (!RD._lgT0) RD._lgT0 = Date.now();
    const sec = Math.round((Date.now() - RD._lgT0) / 1000);
    const s2 = /サーバーで確認できました|データを読み込んでいます/.test(all) || !!(G("SES") && G("SES").code);
    if (!p) {
      p = document.createElement("div");
      p.id = "k-lgwait"; p.className = "rd-x"; p.setAttribute("role", "status"); p.setAttribute("aria-live", "polite");
      document.body.appendChild(p);
    }
    const html = `<div class="k-lgwc"><img src="${RD.IMG}robot.png" alt="" class="k-lgwbot"><div style="min-width:0;flex:1">
      <h2>ログインしています<span class="k-lgwsec">${sec}秒</span></h2>
      <ol class="k-lgwst"><li class="${s2 ? "ok" : "on"}">${s2 ? I("check", 16, 3) : '<i class="k-dot"></i>'}サーバーでアカウントを確かめる</li><li class="${s2 ? "on" : ""}">${s2 ? '<i class="k-dot"></i>' : '<i class="k-dot off"></i>'}貴社のデータ（商品・商談・やり取り）を読み込む</li><li>${'<i class="k-dot off"></i>'}ホームを開く</li></ol>
      <div class="k-lgwbar"><i></i></div>
      <p>ふだん <b>15〜30秒</b>ほどかかります。データが多いと、もう少しかかります。この画面のままお待ちください。${sec > 60 ? "<br><b>時間がかかっています。</b>通信の状態を確かめて、1〜2分たっても進まないときは、ページを読み込み直してください。" : ""}</p></div></div>`;
    if (p.dataset.h !== html) { p.innerHTML = html; p.dataset.h = html; }
  }
  function codeNote() {
    const n = document.getElementById("v80lgCode");
    let k = document.getElementById("k-lgcode");
    if (!n) { if (k) k.remove(); return; }
    if (!isJa()) { if (k) k.remove(); n.style.display = ""; return; }
    let u = 0, d = "";
    try { u = typeof v80admUntil === "function" ? +v80admUntil() || 0 : 0; d = u && typeof v80admDay === "function" ? v80admDay(u, 1) : ""; } catch (e) { u = 0; } // eslint-disable-line no-undef
    const ended = u && Date.now() >= u;
    const html = `<p class="k-ok">${I("check", 16, 3)}体験用・デモ用のアクセスコードは、これまでどおりこの欄で使えます。</p>
      <p>お渡ししたアクセスコードを、そのまま入れてください（例：BC-XXXX-XXXX-XXXX。大文字・小文字は区別しません）。</p>
      ${u && d ? `<p class="k-sm">${ended ? `※ お客様ごとのアクセスコードと氏名でのログインは、${esc(d)} で終わりました。ご契約のアカウントは、メールアドレスとパスワードでログインしてください（体験用・デモ用のコードは対象外です）。` : `※ お客様ごとのアクセスコードと氏名でのログインは、メールアドレスが登録されていない方だけ ${esc(d)} まで使えます（体験用・デモ用のコードは、その後も使えます）。`}</p>` : ""}
      <p class="k-sm">存在しないコードでの試行が続くと、待ち時間を入れて STANDAGE に知らせます。</p>`;
    if (!k) { k = document.createElement("div"); k.id = "k-lgcode"; k.className = "k-lgcode rd-x"; n.after(k); }
    if (k.previousElementSibling !== n) n.after(k);
    if (k.dataset.h !== html) { k.innerHTML = html; k.dataset.h = html; }
    n.style.display = "none"; // 同じ中身を上で言い直している（今の版の文はそのまま残す）
  }
  setInterval(() => {
    try {
      const L = document.body.classList.contains("locked");
      if (wasLocked && !L && G("SES") && (G("SES").code || G("SES").t)) { landAt = Date.now(); userActed = false; }
      wasLocked = L;
      land(); lgWait(); codeNote();
    } catch (e) { /* 次の回で */ }
  }, 300);

  /* ───────── ⑦ AI商社マンへの相談：貴社のいまの準備 ───────── */
  const PREP_GO = { up: () => goKey("up"), fill: () => { try { ux32Fill(); } catch (e) { goKey("up"); } }, cty: () => goKey("cty"), deck: () => goKey("deck"), buyer: () => goKey("db"), fb: () => goKey("deal"), team: () => goKey("team") }; // eslint-disable-line no-undef
  function prep() {
    let S = null;
    try { S = typeof ux32Setup === "function" ? ux32Setup() : null; } catch (e) { S = null; } // eslint-disable-line no-undef
    if (!Array.isArray(S) || !S.length) return null;
    const left = S.filter((s) => !s[4]);
    return { all: S.length, done: S.length - left.length, left, next: left[0] || null };
  }
  RD.prep = prep;
  function prepLine(P, cls) {
    if (!P) return "";
    const nx = P.next;
    return `<div class="k-prep ${cls || ""} rd-x">${I("list", 20)}<span class="k-prept"><b>貴社のいまの準備：</b>はじめの設定 ${P.all}つ中 <b>${P.done}つ</b> 完了${P.left.length ? `（あと <b class="k-or">${P.left.length}つ</b>）` : "（すべて完了）"}${nx ? `。次は「<b>${esc(nx[1])}</b>」` : ""}${P.left.length > 1 ? `<small>残り：${P.left.map((s) => esc(s[1])).join("・")}</small>` : ""}</span>${nx ? `<button type="button" class="k-btn k-mini" data-kprep="${esc(nx[0])}">${I("chevR", 14, 2.6)}次をひらく</button>` : ""}</div>`;
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest("[data-kprep]");
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    const f = PREP_GO[b.dataset.kprep]; if (f) f();
  });
  function prepAfterAnswers() {
    if (RD.locked() || isAdmin() || RD.isFwd()) return;
    const c = document.getElementById("chat"); if (!c) return;
    const ans = $$(":scope > .m.a", c).filter((m) => { const bb = $(".bb", m); return bb && $(".ci", bb) && !$(".car", bb); });
    const last = ans[ans.length - 1];
    if (!last) return;
    const prev = last.previousElementSibling;
    if (!prev || !prev.matches(".m.u")) return; // 最初のあいさつには付けない
    const P = prep(); if (!P) return;
    const html = prepLine(P, "k-prepans");
    const nx = last.nextElementSibling;
    if (nx && nx.classList.contains("k-prepans")) { if (nx.dataset.h !== html) { nx.outerHTML = html; const n2 = last.nextElementSibling; if (n2) n2.dataset.h = html; } return; }
    $$(".k-prepans", c).forEach((x) => x.remove());
    last.insertAdjacentHTML("afterend", html);
    const n2 = last.nextElementSibling; if (n2) n2.dataset.h = html;
  }
  setInterval(() => { try { prepAfterAnswers(); } catch (e) { /* 無視 */ } }, 800);
  const pageAi0 = RD.page.ai;
  RD.page.ai = (w, k) => {
    if (pageAi0) pageAi0(w, k);
    const P = prep(); if (!P) return;
    const box = $(".rd-p2", w); if (!box) return;
    const ask = $("#k-ask", box); const sec = ask && ask.closest("section");
    const html = `<section class="k-card k-prepcard" style="margin-bottom:18px">${prepLine(P, "k-prepbig")}<p class="rd-note" style="margin:8px 0 0">AI商社マンは、この準備の状況と登録した商品・国・商談を踏まえて答えます。答えのあとにも、いまの準備を添えます。</p></section>`;
    if (sec) sec.insertAdjacentHTML("afterend", html); else box.insertAdjacentHTML("afterbegin", html);
  };

  /* ───────── ⑧ 出荷を進める・受注・請求・入金（開発中）：リリースまでの進め方 ───────── */
  function askPrefill(q) {
    goKey("ai");
    let n = 0;
    const tm = setInterval(() => { n++; const x = document.getElementById("k-askq"); if (x || n > 30) { clearInterval(tm); if (x) { x.value = q; x.focus(); x.closest("form") && x.closest("form").classList.add("k-need"); setTimeout(() => { const f = x.closest("form"); if (f) f.classList.remove("k-need"); }, 1600); } } }, 100);
  }
  const BRIDGE = {
    "ops:ship": { t: "出荷はこの順で進められます", s: "「出荷を進める」の画面は開発中です（Coming Soon）。リリースまでは、いま使える機能でつなげます。", st: [
      ["doc", "書類をつくる", "この出荷に要る船積書類を AI が判断し、PI・CI・PL・S/I の下書きを作ります", () => goKey("ops:doc")],
      ["truck", "物流会社に AI見積を依頼（相見積）", "価格表・寸法と販売先国の登録から、物流会社の見積受信箱に依頼が届きます", () => { Promise.resolve().then(() => fwdRequest()).catch((e) => { console.error("[rd uat] fwdRequest", e); try { toast("物流会社への依頼を始められませんでした。先に価格表・寸法と販売先国を登録してください"); } catch (x) { /* 無視 */ } }); }], // eslint-disable-line no-undef
      ["shield", "規制を調べる", "送り先の決まりごと・関税・必要な書類を確かめます", () => goKey("ops:reg")],
      ["chat", "出荷の段取りを AI商社マンに相談", "質問の文を入れた状態で、相談の画面を開きます（送るのはあなた）", () => askPrefill("この商品を出荷するまでの段取り（書類・物流会社への依頼・日程）を、いまの準備状況に合わせて順番に教えて")],
    ] },
    "ops:ord": { t: "受注・請求・入金はこの順で進められます", s: "「受注・請求・入金」の画面は開発中です（Coming Soon）。リリースまでは、いま使える機能でつなげます。", st: [
      ["doc", "見積書（PI）・請求書（CI）を作る", "「書類をつくる」で下書きを作り、その場で直して保存・印刷できます", () => goKey("ops:doc")],
      ["brief", "受注と条件を商談の記録に残す", "価格・数量・取引条件を残すと、AI商社マンの答えに使われます", () => goKey("deal")],
      ["list", "入金の予定をタスクに入れる", "期限つきのタスクにすると、今日やることと通知に出ます", () => goKey("task")],
      ["doc", "契約書関連", "売買契約・NDA などを確かめます", () => goKey("legal")],
    ] },
  };
  Object.keys(BRIDGE).forEach((key) => {
    const p0 = RD.page[key];
    RD.page[key] = (w, k) => {
      if (p0) p0(w, k);
      const B = BRIDGE[key];
      const act = RD.act || (() => "");
      RD.put(w, `<section class="k-card warm k-bridge" style="margin-bottom:18px">${RD.H({ ic: "arr", t: B.t, s: "（リリースまでの進め方）" })}<p class="k-ctyex" style="margin-top:0">${esc(B.s)}</p>
        <div class="k-tiles" style="--n:${B.st.length}">${B.st.map((x, i) => `<button type="button" class="k-step big" ${act(x[3])}><span class="k-sn">${i + 1}</span><span class="k-si">${I(x[0], 30, 1.7)}</span><span><b>${esc(x[1])}</b><small>${esc(x[2])}</small></span></button>`).join("")}</div></section>`);
    };
  });

  /* ───────── つなぎ ───────── */
  function afterUat() {
    densBtn();
    const w = document.getElementById("well");
    if (w && !w.dataset.kterm) { w.dataset.kterm = "1"; termMo.observe(w, { childList: true, subtree: true }); }
    clearTimeout(termT); termT = setTimeout(termScan, 250);
  }
  const old = RD.after;
  RD.after = function () { const r = old.apply(this, arguments); try { afterUat(); } catch (e) { console.error("[rd uat]", e); } return r; };
  setInterval(() => { try { if (!RD.locked()) densBtn(); } catch (e) { /* 無視 */ } }, 1500);
  try { afterUat(); } catch (e) { /* まだ */ }
})();
