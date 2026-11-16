/* rd_v92all.js：刷新版の層の JS 63 本をタグの順にまとめたもの（21.94 r9p の build.py が作る。元は rd/ の同じ名前のファイル。ファイルごとに try で区切る） */
/* ==== rd_v92z9zr9pboot.js ==== */
try {
/* 貿易クラウドAI商社マン 21.94 r9p：読み込みの遅さと、読み込み中の画面のカクつき（刷新版の層の「いちばん前」に読む。build.py が rd.js の前に置く）
   計測（fix/r9p/notes.txt）で分かったこと：
   ・「更新」のあと、刷新版の層（約60本）が1本ずつ読まれる間に、画面が何度も別の形で描かれる
     （本体の前のデザインのダッシュボード → 途中まで仕上げた画面 →「こんばんは！」の前のホーム → 案件一覧）。layout shift の合計 約1.0（8820 も同じ）。
   ・rd.js の見張り（0.5秒おき・最初の20秒）が、何も変わっていなくても毎回 RDX.after（この作業で 34 層に包まれた）を最後まで回す。
     1回 約40ms（CPU 1/4 の条件で 約150ms）× 約40回。読み込みのあとも 20〜30 秒、画面のどこかが描き直され続ける。
     自分の描いた変化（見出しを #well に入れる）で見張りがもう一度動き、同じ仕上げを2回することもある。
   直し（全部の層に効く仕組み。特定の層の中身には頼らない）：
   ① 読み込みの間（文書の解析が終わる＝DOMContentLoaded まで）は RDX.after を動かさない（呼ばれたら「あとで1回」に印だけ付ける）。
      全部の層がそろったあと（rd.js の start の見張り）に1回だけ仕上げる。この間、画面は build.py が head に入れた「読み込み中」の表示で隠す。
   ② 読み込みのあと：rd.js の見張り（0.5秒おき・#well の子の入れ替え）から来た RDX.after は、前に仕上げてから
      アプリが画面を入れ替えて（#well の子の足し引き・#well そのものの入れ替え＝rd.js の見張りが見ているのと同じ所）おらず、
      状態（画面のキー・言語・鍵・ホーム／分析・幅・商品・body の class）も変わっていなければ飛ばす。
      ほかの層・アプリが直接呼んだ RDX.after は、今までどおり毎回動かす。
      仕上げが #well の子を足し引きしたときは、今までその変化で見張りがもう一度動いて必ず2回目があったので、同じ2回目をその場で1回だけ行う
      （後ろの層が前の層の仕上げた所を書き換える順のものが、2回目でそろう）。
   ③ 最初の仕上げが終わったら「読み込み中」を外して、仕上がった画面を1回で出す（鍵のかかった画面＝ログインはすぐ出す。5秒たっても仕上げが来なければ出す。
      それでも外れないときは CSS の側で 15 秒で出る） */
(function () {
  "use strict";
  if (window.__rdBoot) return;
  const now = () => (window.performance && performance.now ? performance.now() : Date.now());
  const B = (window.__rdBoot = { on: true, pend: 0, runs: 0, second: 0, skips: 0, gated: 0, depth: 0, dirty: true, sig: "", last: 0, shown: false, t: {} });
  const html = document.documentElement;
  const locked = () => !!(document.body && document.body.classList.contains("locked"));
  // 画面を出す（「読み込み中」を外す）
  function reveal(why) {
    if (B.shown) return;
    B.shown = true;
    B.t.reveal = Math.round(now());
    B.why = why;
    const go = () => { try { html.classList.add("rd-ready"); } catch (e) { /* 無視 */ } };
    // 仕上げた DOM を同じフレームで出す（次の描画の前に印を付ける）
    try { requestAnimationFrame(go); } catch (e) { go(); }
    setTimeout(go, 100);
  }
  B.reveal = reveal;
  // 状態の印：これが変わったら仕上げ直す
  function sigNow(R) {
    const g = (f) => { try { return f(); } catch (e) { return ""; } };
    return [
      g(() => R.curKey()),
      g(() => (typeof cur !== "undefined" ? cur : "")), // eslint-disable-line no-undef
      g(() => (typeof fwdCur !== "undefined" ? fwdCur : "")), // eslint-disable-line no-undef
      g(() => (typeof opsTab !== "undefined" ? opsTab : "")), // eslint-disable-line no-undef
      g(() => R.dashMode),
      g(() => (typeof I18N !== "undefined" && I18N ? I18N.lang : "") + "/" + html.lang), // eslint-disable-line no-undef
      locked() ? "L" : "U",
      g(() => (R.isFwd && R.isFwd() ? "F" : "S")),
      innerWidth <= 760 ? "m" : innerWidth <= 1100 ? "t" : "d",
      g(() => (typeof PID !== "undefined" ? PID : "")), // eslint-disable-line no-undef
      g(() => (typeof TENS !== "undefined" && TENS ? TENS.length : "")), // eslint-disable-line no-undef
      document.body ? document.body.className : "",
    ].join("|");
  }
  // 画面の入れ替え（アプリの描き直し＝#well の子の入れ替え・#well そのものの入れ替え）を見る。RDX.after が自分で描いた分は数えない。
  //   rd.js の見張り（MutationObserver）が見ているのと同じ所。中の細かい変化（ほかの層の 1.5 秒おきの仕上げ など）は数えない
  let mo = null, well = null;
  function watch() {
    try {
      if (!mo) mo = new MutationObserver(() => { B.dirty = true; });
      const w = document.getElementById("well");
      if (w !== well) { well = w; B.dirty = true; mo.disconnect(); if (w) mo.observe(w, { childList: true }); }
    } catch (e) { mo = null; B.dirty = true; }
  }
  function settle(R) {
    // 仕上げた直後の状態を覚える（仕上げが描いた分の変化の知らせは捨てる）
    watch();
    try { if (mo) mo.takeRecords(); } catch (e) { /* 無視 */ }
    B.dirty = !mo;
    B.sig = sigNow(R);
    B.last = now();
  }
  function install(R) {
    if (!R || typeof R !== "object" || R.__rdBootGate) return;
    R.__rdBootGate = 1;
    let cur = null;
    const gate = (f) => {
      if (typeof f !== "function" || f.__rdGate) return f;
      const g = function () {
        // 層の中で前の層を呼ぶときは、そのまま通す
        if (B.depth > 0) return f.apply(this, arguments);
        if (B.on) { B.pend++; B.gated++; return undefined; }
        // rd.js の見張り（onWell の中＝R._busy）から来て、前に仕上げてから何も変わっていなければ飛ばす
        if (R._busy && mo) {
          watch(); // #well が入れ替わっていたら見直す（そのときは仕上げる）
          // rd.js の見張りは、この見張りより先に知らせを受ける（先に作られたため）。まだ届いていない知らせもここで読む
          try { if (mo.takeRecords().length) B.dirty = true; } catch (e) { B.dirty = true; }
          if (!B.dirty && B.sig && sigNow(R) === B.sig) { B.skips++; return undefined; }
        }
        B.depth++;
        B.runs++;
        try {
          const r = f.apply(this, arguments);
          // 仕上げが #well の子を足し引きしたとき（見出し・案件一覧などを入れたとき）は、続けてもう1回だけ通す。
          //   今までは、その足し引きで rd.js の見張りがもう一度動き、2回目の仕上げが必ずあった。後ろの層が前の層の仕上げた所を書き換える順のもの
          //   （例：案件一覧の「次は：商品を登録（足りない情報を埋める）」を、文言が入ったあとで shortBtns が縮める）は、その2回目でそろっていた。
          //   同じ2回目を、知らせを待たずにこの場で行う（3回目以降の空回りはしない）
          let echo = false;
          try { echo = !!(mo && mo.takeRecords().length); } catch (e) { echo = false; }
          if (echo && !locked()) { B.second++; try { f.apply(this, arguments); } catch (e) { /* 無視 */ } }
          return r;
        } finally {
          B.depth--;
          settle(R);
          if (!B.shown) reveal("after");
        }
      };
      g.__rdGate = 1;
      return g;
    };
    try {
      cur = gate(R.after);
      Object.defineProperty(R, "after", { configurable: true, enumerable: true, get() { return cur; }, set(f) { cur = gate(f); } });
    } catch (e) { /* 包めないときは今までどおり */ }
  }
  // window.RDX ができた瞬間に包む（rd.js の「const RD = (window.RDX = {…})」）
  try {
    if (window.RDX) install(window.RDX);
    else {
      let rdx;
      Object.defineProperty(window, "RDX", {
        configurable: true, enumerable: true,
        get() { return rdx; },
        set(v) {
          rdx = v;
          try { install(v); } catch (e) { /* 無視 */ }
          try { Object.defineProperty(window, "RDX", { value: v, writable: true, configurable: true, enumerable: true }); } catch (e) { /* 無視 */ }
        },
      });
    }
  } catch (e) { B.on = false; }
  // 文書の解析が終わったら（全部の層がそろったら）止めるのをやめる。rd.js の start（このあとの DOMContentLoaded）が仕上げを呼ぶ
  function end() {
    if (!B.on) return;
    B.on = false;
    B.t.end = Math.round(now());
    watch();
    // 鍵のかかった画面（ログイン）は仕上げを待たずに出す。仕上げが来ないときも 5 秒で出す
    setTimeout(() => { if (locked()) reveal("locked"); }, 0);
    setTimeout(() => reveal("timeout"), 5000);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", end); else end();
  window.addEventListener("load", () => { end(); setTimeout(() => reveal("load"), 1500); });
})();

} catch (e) { try { console.error("[rd] rd_v92z9zr9pboot.js", e); } catch (x) { } }
/* ==== rd.js ==== */
try {
/* 貿易クラウドAI商社マン デザイン刷新プレビュー（手元だけ・2026-11-10）
   今のアプリ（21.85.1）の上に重ねる層。元の関数は呼ぶだけ（中身は変えない）。
   ・左のメニューを「仕事の流れ」の7つにまとめ、いま居る場所の下にだけ細かい画面を出す
   ・どの画面も上に「大きな題＋一言の説明＋AI商社マン」の見出し
   ・ホーム（荷主／物流会社）は「まずやること」「数字」「流れ」「最新の動き」「AIに相談」だけ。今のダッシュボードは「分析・レポート」に
   ・数字はアプリが今出している数字（同じ計算）だけ。架空の数字や増減の矢印は出さない
   ・長い説明文は2行でたたみ「続きを読む」で開く（消さない） */
(function () {
  "use strict";
  if (window.RDX) return;
  const RD = (window.RDX = { ver: "デザイン刷新プレビュー 1（2026-11-10・土台 21.85.1）", dashMode: "home" });
  document.documentElement.classList.add("rd");
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const num = (s) => { const m = String(s == null ? "" : s).replace(/,/g, "").match(/-?\d+(\.\d+)?/); return m ? +m[0] : 0; };
  const IMG = "rd/img/";
  /* アプリの安全設定（CSP）で eval は使えないため、読む名前を決めておく（無い版でも止まらない） */
  function G(n) {
    try {
      switch (n) {
        case "SES": return typeof SES !== "undefined" ? SES : undefined; // eslint-disable-line no-undef
        case "TEN": return typeof TEN !== "undefined" ? TEN : undefined; // eslint-disable-line no-undef
        case "FWDB": return typeof FWDB !== "undefined" ? FWDB : undefined; // eslint-disable-line no-undef
        case "cur": return typeof cur !== "undefined" ? cur : undefined; // eslint-disable-line no-undef
        case "fwdCur": return typeof fwdCur !== "undefined" ? fwdCur : undefined; // eslint-disable-line no-undef
        case "opsTab": return typeof opsTab !== "undefined" ? opsTab : undefined; // eslint-disable-line no-undef
        case "PAGES": return typeof PAGES !== "undefined" ? PAGES : undefined; // eslint-disable-line no-undef
        case "render": return typeof render !== "undefined" ? render : undefined; // eslint-disable-line no-undef
        case "go": return typeof go !== "undefined" ? go : undefined; // eslint-disable-line no-undef
        case "fwdRender": return typeof fwdRender !== "undefined" ? fwdRender : undefined; // eslint-disable-line no-undef
        case "fwdNav": return typeof fwdNav !== "undefined" ? fwdNav : undefined; // eslint-disable-line no-undef
      }
    } catch (e) { /* 宣言の前 */ }
    return undefined;
  }
  const isFwd = () => { const s = G("SES"); return !!(s && s.role === "fwd"); };
  const locked = () => { const S = G("SES"); return document.body.classList.contains("locked") || !S || !(S.code || S.t === "admin"); };

  /* ───── アイコン（線の絵） ───── */
  const P = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h5v-6h4v6h5V9.5"/>',
    box: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
    shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
    brief: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
    ship: '<path d="M2.5 16.5 5 21h14l2.5-4.5z"/><path d="M5 16.5V11h14v5.5"/><path d="M8 11V7.5h8V11M12 3v4.5"/>',
    chart: '<path d="M5 20v-7M11 20V8M17 20V4"/><path d="M3 20h18"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.2 9.3a2.9 2.9 0 0 1 5.6 1c0 1.9-2.8 2.4-2.8 2.4M12 17h.01"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    bell: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
    bldg: '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 21v-4h6v4M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2"/>',
    chev: '<path d="m6 9 6 6 6-6"/>',
    arr: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    chevR: '<path d="m9 6 6 6-6 6"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    research: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3M8 13.5v-2M11 13.5V9M14 13.5v-3.5"/>',
    send: '<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5"/>',
    doc: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h6"/>',
    db: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>',
    hand: '<path d="M11 17l2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.9-3.9a2 2 0 0 0-2.8 0l-.9.9a1 1 0 1 1-3-3l2.8-2.8a5 5 0 0 1 6 .8L21 7"/><path d="m21 3 1 11h-2M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3M3 4h8"/>',
    chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-5.6A8 8 0 1 1 21 12z"/><path d="M8 12h.01M12 12h.01M16 12h.01"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5M12 3v12"/>',
    fileup: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M12 18v-6M9 15l3-3 3 3"/>',
    alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    trend: '<path d="m3 17 6-6 4 4 8-8"/><path d="M14 7h7v7"/>',
    ai: '<rect x="5" y="5" width="14" height="14" rx="3"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/><path d="M9.3 15 11 9h2l1.7 6M10 13h4"/>',
    zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
    book: '<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>',
    award: '<circle cx="12" cy="8" r="6"/><path d="M8.2 13.4 7 22l5-3 5 3-1.2-8.6"/>',
    truck: '<path d="M1 4h14v12H1zM15 9h4l3 3v4h-7"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    list: '<path d="M11 6h10M11 12h10M11 18h10M3 6l1.5 1.5L7 5M3 12l1.5 1.5L7 11M3 18l1.5 1.5L7 17"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    folder: '<path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z"/>',
    sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    rate: '<path d="M4 4h16v4H4zM4 10h16v4H4zM4 16h16v4H4z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z"/>',
    slides: '<rect x="3" y="4" width="18" height="13" rx="1.5"/><path d="M8 21h8M12 17v4M7 9h6M7 12h4"/>',
    coins: '<circle cx="9" cy="9" r="6"/><path d="M15.5 9.5a6 6 0 1 1-6 6"/><path d="M9 6.5v5M7 8h3.5"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/><path d="M10 11v6M14 11v6"/>',
    cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.6 12.4a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L22 7H6"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 9.8-9.8M17 6l3 3M14 9l2 2"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>',
    monitor: '<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-2.6-6.4L21 8"/><path d="M21 3v5h-5"/>',
    play: '<circle cx="12" cy="12" r="10"/><path d="m10 8 6 4-6 4z"/>',
    flag: '<path d="M4 22V4M4 4h12l-2 4 2 4H4"/>',
    filter: '<path d="M3 4h18l-7 8v7l-4 2v-9z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
    bulb: '<path d="M9 18h6M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V17h6v-.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M5 12v9h14v-9M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
    msg: '<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 21l1.9-5.1A8.4 8.4 0 0 1 4 11.5a8.4 8.4 0 0 1 8.5-8.4h.5a8.4 8.4 0 0 1 8 8z"/>',
  };
  const I = (n, sz, sw) => `<svg width="${sz || 20}" height="${sz || 20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw || 1.9}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || ""}</svg>`;

  /* ───── メニューの形（荷主）：今の版のメニューの全画面を、仕事の流れのグループに分けて全部見せる ─────
     [キー, 名前, アイコン, バッジを読む元の data-p] */
  const NAV_S = [
    { g: "ホーム", ic: "home", items: [["dash:home", "ホーム", "home"], ["today", "今日やること", "sun"], ["inbox", "受信箱", "inbox", "inbox"], ["ai", "AI商社マンに相談", "chat"]] },
    { g: "商談・案件", ic: "brief", items: [["db", "AIバイヤー開拓・拠点", "users"], ["deck", "外国語 営業資料", "slides"], ["deal", "商談・バイヤー", "brief"], ["msg", "やりとり", "msg", "msg"], ["memo", "会議メモ・議事録", "doc", "", 1], ["rqp", "依頼ページ", "doc", "", 1], ["tcd", "商社デスク（STANDAGE）", "bldg", "", 1]] },
    { g: "調査・規制", ic: "shield", items: [["cty", "販売先国の選定", "globe"], ["ops:reg", "規制を調べる", "shield"]] },
    { g: "物流・出荷", ic: "ship", items: [["ops:doc", "書類をつくる", "doc"], ["ops:ship", "出荷を進める", "ship"], ["ops:ord", "受注・請求・入金", "coins"], ["ops:file", "この案件の書類", "folder"], ["ship", "出荷を進める（前の画面）", "ship", "", 1]] },
    { g: "資産（ナレッジ）", ic: "db", items: [["item", "商品情報", "box"], ["up", "商品情報を登録", "upload"], ["docs", "ドキュメント", "folder"], ["legal", "契約書関連", "doc"], ["gloss", "用語集（貿易のことば）", "book"],["srcs", "取り込んだ情報", "list", "", 1]] },
    { g: "分析・レポート", ic: "chart", items: [["dash:rep", "分析・レポート", "chart"], ["task", "タスク・進行", "list"]] },
    { g: "設定", ic: "gear", items: [["team", "メンバー・権限・セキュリティ", "users", "team"], ["trash", "ゴミ箱", "trash"]] },
  ];
  /* ───── メニューの形（物流会社）：今の版の7画面＋ホーム ───── */
  const NAV_F = [
    { g: "ホーム", items: [["fhome", "ホーム", "home"], ["fai", "AI物流マンに相談", "chat"]] },
    { g: "見積", items: [["finbox", "見積受信箱", "mail", "finbox"], ["fagg", "相見積・AI推奨", "chart"], ["frates", "物流レート管理", "db"]] },
    { g: "案件", items: [["fcase", "案件・出荷管理", "box", "fcase"], ["frq", "依頼ページ", "doc", "frq"]] },
    { g: "設定", items: [["fteam", "メンバー・権限・セキュリティ", "users", "fteam"]] },
  ];
  /* ───── よく使う項目（11/12 大瀧さんのご意見：左のメニューはよく使う数項目だけにし、ほかは「すべての機能」にまとめる） ─────
     [キー, 名前, アイコン, バッジを読む元, この項目を「いま居る」と見なす画面]。キー "@help" は ヘルプセンター（窓）を開く */
  const MAIN_S = [["dash:home", "ホーム", "home"], ["today", "今日やること", "sun"], ["item", "商品", "box", "", ["item", "up", "srcs"]], ["ai", "AIに聞く", "chat"], ["@help", "困ったとき", "help"]];
  const MAIN_F = [["fhome", "ホーム", "home"], ["finbox", "見積受信箱", "mail", "finbox"], ["fcase", "案件・出荷管理", "box", "fcase"], ["fai", "AIに聞く", "chat"], ["@help", "困ったとき", "help"]];
  // 今の版のメニューにある画面（試験で「全部ある」を確かめる）
  RD.NAV_S = NAV_S; RD.NAV_F = NAV_F; RD.MAIN_S = MAIN_S; RD.MAIN_F = MAIN_F;

  /* ───── 画面ごとの見出し ───── */
  const HERO = {
    "dash:rep": ["分析・レポート", "商談の進み具合・国ごとの手応え・タスクを、データでまとめています。"],
    "dash:case": ["案件の詳細", "この案件のやりとり・タスク・書類・商談の記録を、1画面で見られます。"],
    "dash:prod": ["商品", "登録した商品の一覧です。商品ごとに、販売先国・準備の進み・案件の数を見られます。押すと、その商品に切り替わります。"],
    today: ["タスク（今日やること）", "AI商社マンが、今日やることを大事な順に並べました。タスクの一覧（期限・担当）も、この画面の下と「タスク・進行」で見られます。"],
    inbox: ["受信箱", "バイヤー・メンバー・AI商社マンからの知らせと、確認待ちをまとめています。"],
    ai: ["AI商社マンに相談", "貴社の商品・商談・規制を覚えたAI商社マンに、何でも相談できます。"],
    up: ["商品情報を登録", "輸出したい商品の資料をアップロードするだけ。AIが読み取り、足りない情報だけ質問します。"],
    item: ["商品情報", "AI商社マンが覚えている、この商品の情報です。書類・見積・提案はすべてここから作られます。"],
    srcs: ["取り込んだ情報", "AI商社マンが読み込んだ資料の一覧です。"],
    docs: ["ドキュメント", "商品・会社の資料を1か所にまとめ、AI商社マンの知識にします。"],
    legal: ["契約書関連", "NDA・販売店契約などの契約書を、ひな形と確認の観点つきで管理します。"],
    gloss: ["用語集", "貿易の言葉と、営業資料の訳をそろえます。"],
    cty: ["販売先国の選定", "商品に合った有望な販売先国を、AIがデータでおすすめします。"],
    "ops:reg": ["規制・必要な書類", "送り先の国の決まりごと・関税・必要な書類を、商品に合わせて確かめます。"],
    db: ["AIバイヤー開拓・商談", "AIが有望なバイヤーを見つけ、提案・商談までを一気通貫で支援します。"],
    deck: ["外国語 営業資料", "海外のバイヤーが返信したくなる資料を、商品に合わせてAIが作ります。"],
    deal: ["商談・バイヤー", "相手ごとの進み具合と商談の記録を、1か所で追えます。"],
    msg: ["やりとり", "バイヤーやメンバーとのやりとりを、AI商社マンが覚えて次に生かします。"],
    memo: ["会議メモ・議事録", "商談の議事録から、宿題と次の一手をAIが拾います。"],
    rqp: ["依頼ページ", "物流会社やメンバーへの依頼を、1つのページで送って回答を集めます。"],
    tcd: ["商社デスク（STANDAGE）", "STANDAGEに商社業務を任せた案件のやりとりです。"],
    "ops:doc": ["書類・出荷管理", "輸出に必要な書類の作成から出荷まで、やさしくガイドします。"],
    "ops:file": ["この案件の書類", "案件で使う書類と、下書き・申請の状況です。"],
    "ops:ship": ["出荷を進める", "物流AI見積・仮押さえ・出荷の手続きです（準備中の機能を含みます）。"],
    "ops:ord": ["受注・請求・入金", "受注書・請求書・入金の管理です（準備中の機能を含みます）。"],
    ship: ["出荷を進める", "出荷の手続きを、順番どおりに進めます。"],
    task: ["タスク・進行", "誰が・いつまでに・何をするかを、チームでそろえます。"],
    team: ["メンバー・担当", "メンバーの招待・担当・権限と、ログインの安全を設定します。"],
    trash: ["ゴミ箱", "消したものは、ここから元に戻せます。"],
    adm: ["管理コンソール", "アカウント・利用状況・AIの設定を管理します。"],
    finbox: ["見積受信箱", "荷主からの見積依頼を受信・判断し、すぐに対応できます。"],
    fcase: ["案件・出荷管理", "案件の仮押さえから出荷完了まで、進行状況の管理と実行を行います。"],
    frq: ["依頼ページ", "荷主への確認や依頼を、1つのページで送って回答を集めます。"],
    frates: ["レート管理", "運賃表のアップロード・登録・更新を、かんたん・正確に。"],
    fagg: ["相見積・AI推奨", "複数の見積を比較し、選定状況とAIの評価理由、改善のヒントを確認できます。"],
    fai: ["AI物流マンに相談", "レート表と見積依頼を覚えたAI物流マンに、何でも相談できます。"],
    fteam: ["メンバー・担当", "メンバーの招待・担当・権限と、ログインの安全を設定します。"],
  };

  /* ───── いまの場所と移動 ───── */
  function curKey() {
    if (isFwd()) { const c = G("fwdCur") || "finbox"; return c === "finbox" && RD.fhome ? "fhome" : c; }
    const p = G("cur") || "dash";
    if (p === "ops") return "ops:" + (G("opsTab") || "reg");
    if (p === "dash") return "dash:" + (RD.dashMode || "home");
    return p;
  }
  function goKey(k) {
    closePops();
    if (isFwd()) return fGo(k);
    const [p, sub] = String(k).split(":");
    if (p === "ops" && sub) { try { opsTab = sub; } catch (e) { /* 無い版 */ } } // eslint-disable-line no-undef
    if (p === "dash") RD.dashMode = sub || "home";
    RD._want = k; // 見張りが受け取る（自分のメニューからの移動）
    if (G("cur") === p && typeof render === "function") render(); else go(p); // eslint-disable-line no-undef
    try { window.scrollTo(0, 0); const st = $(".stage"); if (st) st.scrollTop = 0; } catch (e) { /* 無視 */ }
  }
  // No.364 の再発防止（11/12）：物流会社の画面の切り替えは、今のアプリの物流会社の画面（NAV_F）と fhome だけを受け付ける。
  //   前は荷主用のキー（gloss など）もそのまま fwdCur に入れ、見出しと中身が食い違う画面になっていた。よく使う荷主用のキーは物流会社の画面に読み替える
  const F_ALIAS = { ai: "fai", dash: "fhome", "dash:home": "fhome", inbox: "finbox", today: "fhome" };
  function fKey(p) {
    const k = F_ALIAS[p] || p;
    const ok = k === "fhome" || NAV_F.some((g) => g.items.some((it) => it[0] === k));
    if (!ok) console.warn("[rd] 物流会社の画面に無いキー（切り替えない）：", p);
    return ok ? k : "";
  }
  function fGo(p0) {
    const p = fKey(p0);
    if (!p) return;
    RD._want = p;
    RD.fhome = p === "fhome";
    try { fwdCur = p === "fhome" ? "finbox" : p; } catch (e) { return; } // eslint-disable-line no-undef
    try { fwdNav(); } catch (e) { /* 無視 */ }
    try { fwdRender(); } catch (e) { console.error(e); }
    try { window.scrollTo(0, 0); } catch (e) { /* 無視 */ }
  }
  function openHelp() {
    const hb = document.getElementById("helpb");
    if (hb) { hb.click(); return; }
    try { window.open("guide/", "_blank", "noopener"); } catch (e) { /* 無視 */ }
  }
  RD.openHelp = openHelp;

  /* ───── 左のメニュー ───── */
  function origBadge(sel) {
    const b = $("#nav " + sel);
    if (!b) return "";
    const sp = $$("span", b).filter((s) => /^\d+$/.test(s.textContent.trim()) && +s.textContent.trim() > 0);
    return sp.length ? sp[0].textContent.trim() : "";
  }
  function navMine() {
    // 管理コンソールなど、荷主・物流会社の画面でないときは今の版のメニューをそのまま使う
    try { if (typeof v84AdmMode === "function" && v84AdmMode()) return false; } catch (e) { /* 無視 */ } // eslint-disable-line no-undef
    const S = G("SES");
    return !!(S && S.code);
  }
  // 「すべての機能」の開け閉め（11/12）：はじめは閉じる。開けたら、閉じるまで開いたまま（この PC に覚える）
  function allGet() { try { return localStorage.getItem("rd_navall") === "1"; } catch (e) { return false; } }
  function allSet(v) { try { localStorage.setItem("rd_navall", v ? "1" : "0"); } catch (e) { /* 無視 */ } }
  function buildSide() {
    const side = $(".side");
    if (!side) return;
    const mine = navMine();
    document.documentElement.classList.toggle("rd-nav", mine);
    let el = $("#rdside");
    if (!el) { el = document.createElement("div"); el.id = "rdside"; side.appendChild(el); el.addEventListener("click", onSide); }
    if (!mine) return;
    const fwd = isFwd();
    const A = fwd ? NAV_F : NAV_S;
    const M = fwd ? MAIN_F : MAIN_S;
    const k = curKey();
    const kp = k.split(":")[0];
    const open = allGet();
    // 今の版のメニュー下の欄（#sft）は、描き直しで消さないよう、いったん元の場所へ戻してから描く（アプリが #sft を書き換えるため）
    const sft0 = $("#sft");
    if (sft0 && el.contains(sft0)) side.insertBefore(sft0, el);
    const bdgN = (key) => (key ? (fwd ? origBadge('[data-fp="' + key + '"]') : origBadge('[data-p="' + key + '"]')) : "");
    const bdg = (key) => { const n = bdgN(key); return n ? `<span class="rd-bdg">${esc(n)}</span>` : ""; };
    const isOn = (x) => x === k || (x.indexOf(":") < 0 && k.indexOf(":") < 0 && x === kp);
    const mainOn = (it) => (it[4] || [it[0]]).some(isOn);
    // よく使う項目
    const main = M.map((it) => it[0] === "@help"
      ? `<button type="button" class="rd-ni rd-main" data-rdact="help">${I(it[2], 20)}<span>${esc(it[1])}</span></button>`
      : `<button type="button" class="rd-ni rd-main" data-rdk="${esc(it[0])}" aria-current="${mainOn(it)}">${I(it[2], 20)}<span>${esc(it[1])}</span>${bdg(it[3])}</button>`).join("");
    // すべての機能（今の版の全画面を、仕事の流れのグループで。隠しの画面は開いているときだけ）
    const items = A.reduce((n, G2) => n + G2.items.filter((it) => !it[4]).length, 0);
    const inMain = M.some(mainOn);
    const here = inMain ? null : A.reduce((f, G2) => f || G2.items.find((it) => isOn(it[0])), null);
    const sumB = A.reduce((n, G2) => n + G2.items.reduce((m, it) => m + (+bdgN(it[3]) || 0), 0), 0);
    const grp = (G2) => {
      const on = G2.items.some((it) => isOn(it[0]));
      return `<div class="rd-grp ${on ? "on" : ""}"><div class="rd-gl">${esc(G2.g)}</div>
        ${G2.items.filter((it) => !it[4] || isOn(it[0])).map((it) => `<button type="button" class="rd-ni" data-rdk="${esc(it[0])}" aria-current="${isOn(it[0])}">${I(it[2], 19)}<span>${esc(it[1])}</span>${bdg(it[3])}</button>`).join("")}</div>`;
    };
    el.innerHTML = `<button type="button" class="rd-logo" data-rdk="${fwd ? "fhome" : "dash:home"}" aria-label="ホームへ"><img src="${IMG}logo.png" alt="貿易クラウド AI商社マン"></button>
      <div class="k-modechip">${I("bldg", 18)}<span>${fwd ? "物流会社向け" : "荷主向け"}</span></div>
      <nav aria-label="メニュー"><div class="rd-mains">${main}</div>
        <div class="rd-all ${open ? "open" : ""} ${here ? "on" : ""}">
          <button type="button" class="rd-allh" data-rdall="1" aria-expanded="${open}" aria-controls="rdallb">${I("list", 19)}<span class="rd-allt">すべての機能<small>${items}</small></span>${!open && sumB ? `<span class="rd-bdg" title="未読・対応待ち">${esc(sumB)}</span>` : ""}${I("chev", 16, 2.4)}</button>
          ${!open && here ? `<button type="button" class="rd-here" data-rdall="1">${I("pin", 14)}<span>いま：${esc(here[1])}</span></button>` : ""}
          <div class="rd-allb" id="rdallb" ${open ? "" : "hidden"}>${A.map(grp).join("")}</div>
        </div></nav>
      <div class="rd-sp"></div>
      <button type="button" class="rd-start" data-rdact="quick"><img src="${IMG}robot.png" alt=""><span><b>はじめての方へ<br>3分でわかる<br>スタートガイド<span class="rd-go">${I("chevR", 12, 3)}</span></b><small>5つの手順で、使い方の流れだけ</small></span></button>
      <div class="rd-sftw"></div>`;
    // メニューの下の欄（トライアルの残り日数・検索のショートカット）は今の版のものをそのまま入れる
    const sft = $("#sft");
    if (sft) $(".rd-sftw", el).appendChild(sft);
  }
  function onSide(e) {
    const f = e.target.closest("[data-rdall]");
    if (f) { allSet(!allGet()); buildSide(); const h = $("#rdside .rd-allh"); if (h) h.focus(); return; }
    const b = e.target.closest("[data-rdk],[data-rdact]");
    if (!b) return;
    const act = b.getAttribute("data-rdact");
    if (act === "help") { if (document.body.classList.contains("navopen")) document.body.classList.remove("navopen"); return openHelp(); }
    if (act === "quick") { if (document.body.classList.contains("navopen")) document.body.classList.remove("navopen"); return RD.quickGuide ? RD.quickGuide() : openHelp(); }
    const k = b.getAttribute("data-rdk");
    if (k) goKey(k);
    if (document.body.classList.contains("navopen")) document.body.classList.remove("navopen");
  }

  /* ───── 上の帯（検索・通知・会社） ───── */
  function coName() {
    if (isFwd()) { const F = G("FWDB"); return (F && F.profile && F.profile.co) || "物流会社"; }
    const T = G("TEN"); return (T && T.co) || "";
  }
  function closePops() { $$(".rd-pop.on").forEach((p) => p.classList.remove("on")); }
  function buildBar() {
    // 今の版の上の帯の部品（検索・言語・やさしい説明・表示の密度・右パネル・通知・ヘルプ・ログアウト・会社・商材の切り替え）は
    // 元の場所・元の働きのまま見せ、見た目だけを刷新版に合わせる（CSS）。何も動かさない・隠さない
    const bar = $(".bar");
    if (!bar) return;
    bar.classList.add("rd-bar");
    if (RD.buildBar2) { try { RD.buildBar2(); } catch (e) { /* 無視 */ } }
  }
  function toggle(sel) { const p = $(sel); if (!p) return; const on = !p.classList.contains("on"); closePops(); if (on) p.classList.add("on"); }

  /* ───── 見出し（ヒーロー） ───── */
  function greet() { const h = new Date().getHours(); return h < 10 ? "おはようございます！" : h < 18 ? "こんにちは！" : "こんばんは！"; }
  function heroHtml(t, s, cta) {
    return `<div class="rd-hero rd-x" data-rdhero="1" data-k="${esc(curKey())}"><img class="rd-port" src="${IMG}hero.png" alt=""><img class="rd-bot" src="${IMG}robot.png" alt="AI商社マン"><div class="rd-ht"><h1>${esc(t)}</h1><p>${esc(s)}</p></div>${cta || ""}</div>`;
  }
  function putHero(w, t, s, cta) {
    $$("[data-rdhero]", w).forEach((x) => x.remove());
    w.insertAdjacentHTML("afterbegin", heroHtml(t, s, cta));
  }

  /* ───── 長い説明文をたたむ ───── */
  function clampLong(w) {
    $$("p.nn, .nn > p, .v69fst, p.kd, .kd, .v82fbrk, .info", w).forEach((p) => {
      if (p.dataset.rdcl || p.closest(".rd-x") || p.closest("details.rd-old")) return;
      const t = (p.textContent || "").trim();
      if (t.length < 90) return;
      p.dataset.rdcl = "1";
      p.style.cssText += ";display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden";
      const b = document.createElement("button");
      b.type = "button"; b.className = "rd-more"; b.textContent = "続きを読む";
      b.style.cssText = "border:0;background:none;color:var(--rd-bl);font-weight:700;font-size:12.5px;cursor:pointer;padding:0;margin:2px 0 6px;font-family:inherit";
      b.addEventListener("click", (e) => { e.stopPropagation(); const open = p.style.webkitLineClamp !== "unset"; p.style.webkitLineClamp = open ? "unset" : "2"; p.style.display = open ? "block" : "-webkit-box"; b.textContent = open ? "たたむ" : "続きを読む"; });
      p.after(b);
    });
  }

  /* ───── 荷主のホーム ───── */
  // 節は見出しの文字で探す（本番のサーバーではデモの帯などで節の番号 sec-N がずれる）
  function secBy(w, re) { return $$("[id^=sec-], .c", w).find((c) => { const h = $("h3", c); return h && !c.closest(".rd-x") && re.test(h.textContent || ""); }) || null; }
  RD.secBy = (w, re) => secBy(w, re);
  function readDash(w) {
    const D = { wait: [], setup: [], funnel: [], byc: [] };
    $$(".v38wait .v38wt", w).forEach((b) => D.wait.push({ k: b.getAttribute("data-v38wf"), n: num($(".v38wn", b) && $(".v38wn", b).textContent), l: ($(".v38wl", b) || {}).textContent || "", s: ($(".v38ws", b) || {}).textContent || "", el: b }));
    $$("#ux32setup .ux32steps > li", w).forEach((li) => D.setup.push({ t: (($(".ux32st b", li) || {}).textContent || "").trim(), done: li.classList.contains("done"), next: li.classList.contains("next"), why: (($(".v68why", li) || {}).textContent || "").trim() }));
    const fun = secBy(w, /どこまで進んだか/), byc = secBy(w, /どの国で手応え/);
    $$(".ddr", fun || document.createElement("div")).forEach((r) => D.funnel.push({ l: (r.children[0] && r.children[0].textContent.trim()) || "", n: num(r.children[1] && r.children[1].textContent), el: r }));
    $$(".ddr", byc || document.createElement("div")).forEach((r) => D.byc.push({ l: (r.children[0] && r.children[0].textContent.trim()) || "", n: num(r.children[2] && r.children[2].textContent), el: r }));
    const sp = $("#ux32setup .v84m-ng", w); D.setupTxt = sp ? sp.textContent.trim() : "";
    return D;
  }
  function stepsOf(D) {
    const has = (re) => D.setup.filter((x) => re.test(x.t));
    const grp = [
      { no: 1, t: "商品を登録", s: "輸出する商品を追加", ic: "box", items: has(/資料を登録|足りない情報/), to: () => goKey(isDone(has(/資料を登録/)) ? "item" : "up") },
      { no: 2, t: "市場・規制を調査", s: "国のニーズや規制を調査", ic: "research", items: has(/国を決める|販売先/), to: () => goKey("cty") },
      { no: 3, t: "バイヤーに提案", s: "候補を選んで商談開始", ic: "send", items: has(/営業資料|バイヤーに連絡|商談を記録/), to: () => goKey("db") },
    ];
    function isDone(a) { return a.length > 0 && a.every((x) => x.done); }
    grp.forEach((g) => { g.done = isDone(g.items); g.known = g.items.length > 0; });
    const nx = grp.find((g) => g.known && !g.done);
    grp.forEach((g) => { g.now = g === nx; });
    return grp;
  }
  function homeShipper(w) {
    const D = readDash(w);
    // 今のダッシュボードは「分析・レポート」としてたたんで残す
    const old = document.createElement("details");
    old.className = "rd-old"; // 中身は今の版の部品（数える対象）
    old.innerHTML = `<summary>${I("chart", 20)}<span>詳しい数字と分析・はじめの設定の6項目（これまでのダッシュボード。左のメニューの「分析・レポート」と同じ内容）</span></summary><div class="rd-oldin"></div>`;
    const inner = $(".rd-oldin", old);
    Array.from(w.children).forEach((c) => { if (!c.matches("[data-rdhero], #uxsec, .ph")) inner.appendChild(c); });
    w.addEventListener("click", (e) => { if (e.target.closest("#uxsec [data-sec], .uxsc")) { const d = $("details.rd-old", w); if (d) d.open = true; } }, true);
    const steps = stepsOf(D);
    const nxItem = D.setup.find((x) => x.next) || D.setup.find((x) => !x.done);
    const wait = D.wait.length ? D.wait : [];
    const fun = D.funnel;
    const front = (() => { let j = -1; fun.forEach((f, i) => { if (f.n > 0) j = i; }); return j; })();
    let notes = [];
    try { notes = (notifCalc() || []).slice(0, 4); } catch (e) { notes = []; } // eslint-disable-line no-undef
    const unread = (() => { try { const db = notifDB(); return (k) => !db.seen[k]; } catch (e) { return () => false; } })(); // eslint-disable-line no-undef
    const T = G("TEN") || {};
    const stepHtml = steps.map((g, i) => `${i ? `<div class="rd-arr">${I("chevR", 22, 2.4)}</div>` : ""}
      <button type="button" class="rd-step ${g.done ? "done" : ""} ${g.now ? "now" : ""}" data-rdstep="${i}">
        <span class="rd-no">${g.done ? I("check", 16, 3) : g.no}</span>
        <div class="rd-sic">${I(g.ic, 48, 1.6)}</div>
        <b>${esc(g.t)}</b><small>${esc(g.s)}</small>
        <span class="rd-stt ${g.done ? "ok" : g.now ? "next" : "wait"}">${g.done ? I("check", 14, 3) + "完了" : g.now ? "次はこれ " + I("arr", 14, 2.4) : "これから"}</span>
      </button>`).join("");
    const kpiIc = { appr: "check", reply: "chat", today: "clock" };
    const kpiHtml = wait.length ? wait.map((x, i) => `<button type="button" class="rd-kpi" data-rdwait="${i}"><div class="rd-kl">${I(kpiIc[x.k] || "list", 22)}<span>${esc(x.l)}</span></div><div class="rd-kn">${x.n}<small>件</small></div><div class="rd-ks">${esc(x.s)}</div></button>`).join("") : `<div class="rd-empty" style="grid-column:1/-1">対応待ちはありません</div>`;
    const flowHtml = fun.length ? fun.map((f, i) => `<button type="button" class="rd-fs ${i === front ? "on" : ""}" data-rdfun="${i}"><div class="rd-fl">${esc(f.l)}</div><div class="rd-fn">${f.n}<small>件</small></div></button>`).join("") : `<div class="rd-empty" style="flex:1">商談を記録すると、ここに流れが出ます</div>`;
    const noteHtml = notes.length ? notes.map((n, i) => `<button type="button" class="rd-li" data-rdnote="${i}"><span style="font-size:20px;flex:none">${esc(n.icon || "🔔")}</span><span class="rd-lt">${esc(n.t)}</span>${unread(n.key) ? '<span class="rd-tag or">新着</span>' : '<span class="rd-tag gy">既読</span>'}</button>`).join("") : `<div class="rd-empty">新しい動きはまだありません</div>`;
    const chips = [
      ["globe", "市場・ニーズを調べる", `${T.item || "この商品"}が売れそうな国と、そのニーズを調べて`],
      ["shield", "規制・認証を確認", `${(T.targets && T.targets[0]) || "販売先の国"}に${T.item || "この商品"}を輸出するときの規制と必要な書類を教えて`],
      ["users", "バイヤーを探す", `${T.item || "この商品"}に合うバイヤーの探し方と、最初の連絡の文面を考えて`],
      ["doc", "見積・コストを相談", `${T.item || "この商品"}の輸出の見積の出し方と、かかるコストを教えて`],
    ];
    const box = document.createElement("div");
    box.className = "rd-x rd-home";
    box.innerHTML = `
      <div class="rd-grid rd-home-top" style="grid-template-columns:minmax(0,1.45fr) minmax(0,1fr);margin-bottom:18px">
        <section class="rd-card">
          <div class="rd-ch"><span class="rd-ck">${I("check", 18, 3)}</span><h2>まずやること</h2><span class="rd-chs">海外展開を始める 3つのステップ${D.setupTxt ? "（はじめの設定 " + esc(D.setupTxt) + "）" : ""}</span></div>
          <div class="rd-steps">${stepHtml}</div>
          ${nxItem && nxItem.why ? `<p class="rd-why"><b>次は「${esc(nxItem.t)}」</b>　${esc(nxItem.why.replace(/^まだの理由：/, ""))}</p>` : ""}
        </section>
        <section class="rd-card">
          <div class="rd-ch">${I("chart", 24)}<h2>対応待ち</h2><span class="rd-chs">押すと、その分だけを開きます</span></div>
          <div class="rd-kpis">${kpiHtml}</div>
          <button type="button" class="rd-btn ghost" data-rdgo="today" style="width:100%;margin-top:18px">${I("list", 18)}今日やること（AIが大事な順に並べた一覧）${I("arr", 16, 2.4)}</button>
        </section>
      </div>
      <section class="rd-card" style="margin-bottom:18px">
        <div class="rd-ch">${I("brief", 24)}<h2>商談の流れ</h2><span class="rd-chs">（いまの状況・商談の記録から）</span><button type="button" class="rd-more" data-rdgo="deal">すべての商談を見る ${I("arr", 16)}</button></div>
        <div class="rd-flow">${flowHtml}</div>
      </section>
      <div class="rd-grid rd-home-mid" style="grid-template-columns:minmax(0,1fr) minmax(0,1.15fr)">
        <section class="rd-card">
          <div class="rd-ch">${I("clock", 24)}<h2>最新の動き</h2><button type="button" class="rd-more" data-rdgo="inbox">受信箱を開く ${I("arr", 16)}</button></div>
          <div class="rd-list">${noteHtml}</div>
        </section>
        <section class="rd-card">
          <div class="rd-askhd"><img src="${IMG}robot.png" alt=""><h2>AI商社マンに相談する</h2></div>
          <form class="rd-ask" id="rdask"><input id="rdaskq" placeholder="例）香港での販売規制を調べて ／ この商品の輸出先候補を提案して" autocomplete="off"><button type="submit" aria-label="相談する">${I("send", 20, 2.2)}</button></form>
          <div class="rd-chips">${chips.map((c, i) => `<button type="button" class="rd-chip" data-rdchip="${i}">${I(c[0], 24)}<span>${esc(c[1])}</span></button>`).join("")}</div>
        </section>
      </div>`;
    w.appendChild(box);
    w.appendChild(old);
    // 働き
    $$("[data-rdstep]", box).forEach((b) => b.addEventListener("click", () => steps[+b.dataset.rdstep].to()));
    $$("[data-rdwait]", box).forEach((b) => b.addEventListener("click", () => { const x = wait[+b.dataset.rdwait]; if (x && x.el) x.el.click(); }));
    $$("[data-rdfun]", box).forEach((b) => b.addEventListener("click", () => { const x = fun[+b.dataset.rdfun]; if (x && x.el) x.el.click(); }));
    $$("[data-rdnote]", box).forEach((b) => b.addEventListener("click", () => { try { notifAct(+b.dataset.rdnote); } catch (e) { goKey("inbox"); } })); // eslint-disable-line no-undef
    $$("[data-rdgo]", box).forEach((b) => b.addEventListener("click", () => goKey(b.dataset.rdgo)));
    // 質問は「AI商社マンに相談」の画面（今の会話の画面）で送る（askFree はその画面の会話欄に書く）
    const ask = (q) => {
      q = String(q || "").trim(); if (!q) return;
      goKey("ai");
      let n = 0;
      const tm = setInterval(() => { n++; if (document.getElementById("chat") || n > 30) { clearInterval(tm); try { askFree(q); } catch (e) { console.error("[rd] askFree", e); } } }, 100); // eslint-disable-line no-undef
    };
    $("#rdask", box).addEventListener("submit", (e) => { e.preventDefault(); const q = $("#rdaskq", box); if (!q.value.trim()) { q.focus(); q.placeholder = "ここに質問を書いてから押してください（例：香港での販売規制を調べて）"; q.classList.add("k-need"); setTimeout(() => q.classList.remove("k-need"), 1600); return; } ask(q.value); });
    $$("[data-rdchip]", box).forEach((b) => b.addEventListener("click", () => ask(chips[+b.dataset.rdchip][2])));
  }
  function reportShipper(w) {
    // 分析・レポート：これまでのダッシュボードをそのまま見せる（「はじめの設定」「対応待ち」はホームにあるので小さく）
    // 何も隠さない（これまでのダッシュボードを、そのまま全部見せる）
  }

  /* ───── 商品情報を登録（手順の帯・読み取り結果・充足度・AIヒアリング） ───── */
  function stepbarHtml(on) {
    const S = [["up", "商品登録", "box"], ["cty", "国選定", "globe"], ["ops:reg", "規制確認", "shield"], ["deck", "提案準備", "send"]];
    const T = G("TEN") || {};
    const doneOf = { up: !!(T.item), cty: !!(T.ctySel && T.ctySel.chosen && T.ctySel.chosen.length), "ops:reg": false, deck: !!(T.deckGen && T.deckGen.length) };
    return `<div class="rd-stepbar rd-x" data-rdsb="1">${S.map((s, i) => `${i ? `<span class="rd-sbar">${I("chevR", 22, 2.4)}</span>` : ""}<button type="button" class="rd-sb ${s[0] === on ? "on" : doneOf[s[0]] ? "done" : ""}" data-rdk="${s[0]}">${I(s[2], 22)}<span class="rd-sbn">${doneOf[s[0]] && s[0] !== on ? I("check", 14, 3) : i + 1}</span><span>${s[1]}</span></button>`).join("")}</div>`;
  }
  function wireStepbar(w) { $$("[data-rdsb] [data-rdk]", w).forEach((b) => b.addEventListener("click", () => goKey(b.dataset.rdk))); }
  function productSummary(w, mode) {
    const T = G("TEN") || {};
    let sc = null;
    try { sc = scoreOf(T); } catch (e) { sc = null; } // eslint-disable-line no-undef
    const pct = sc && typeof sc.pct === "number" ? Math.round(sc.pct) : null;
    const miss = (sc && (sc.missing || sc.miss || sc.need)) || [];
    const filled = (sc && sc.filled) || [];
    const rows = [["商品名", T.item], ["HSコード", T.hs], ["規格", T.ctn || T.sku], ["MOQ", T.moq], ["リードタイム", T.lead], ["建値", T.term]];
    const fn = filled.slice(0, 2).map((x) => x.n).join("・");
    const newMode = mode === "up" && /既存の商品は表示していません/.test(w.textContent || "");
    const qs = newMode ? filled.concat(miss).filter((x) => /^(hs|moq)$/.test(x.k)).slice(0, 2) : miss.slice(0, 2);
    const fields = filled.concat(miss).map((x) => x.n).filter(Boolean);
    const html = `<div class="rd-x" data-rdprod="1">
      <div class="rd-grid rd-3col" style="grid-template-columns:minmax(0,1fr) minmax(0,1.15fr) minmax(0,1.05fr);margin-bottom:18px">
        <section class="rd-card">
          <div class="rd-ch"><span class="rd-ck" style="background:var(--rd-or2)">1</span><h2 style="font-size:18px">商品の資料をアップロード</h2></div>
          <div class="rd-drop" id="rddrop">${I("fileup", 46, 1.6)}<b>ここにファイルを<br>ドラッグ＆ドロップ</b>
            <div class="rd-fmt"><span>Excel</span><span>PDF</span><span>Word</span><span>画像</span><span>ZIP</span></div>
            <span class="rd-btn ghost">${I("folder", 18)}ファイルを選択</span></div>
          <p class="rd-note">${mode === "item" ? "別の資料を読み込むと、足りない項目だけを足します（入っている値は消しません）。" : "複数のファイルを一度に入れても、1つの商品にまとめます。"}</p>
        </section>
        <section class="rd-card">
          ${newMode ? `<div class="rd-ch">${I("doc", 22)}<h2 style="font-size:18px">AIが読み取る項目</h2></div>
          <div style="display:flex;flex-wrap:wrap;gap:8px">${fields.slice(0, 14).map((n) => `<span class="rd-tag bl" style="font-size:13px;padding:6px 12px">${esc(n)}</span>`).join("")}</div>
          <p class="rd-note" style="font-size:13.5px">資料を入れると、ここに読み取り結果と<b>情報の充足度</b>が出ます。足りない項目は、AIが質問して埋めます。</p>` : `<div class="rd-ch">${I("doc", 22)}<h2 style="font-size:18px">読み取り結果</h2>${T.item ? "" : '<span class="rd-chs">（まだありません）</span>'}</div>
          <dl class="rd-kv">${rows.map((r) => `<dt>${esc(r[0])}</dt><dd class="${r[1] ? "" : "miss"}" title="${esc(r[1] || "")}">${esc(r[1] || "未入力")}</dd>`).join("")}</dl>
          <div style="display:flex;gap:16px;align-items:center;margin-top:16px">
            <div class="rd-ring" style="--p:${pct == null ? 0 : pct}"><span>${pct == null ? "—" : pct}<small>%</small></span></div>
            <div><b style="font-size:16px">情報の充足度</b>
              <ul class="rd-ckl" style="margin-top:8px">${fn ? `<li class="ok">${I("check", 16, 3)}${esc(fn)} など ${filled.length}項目</li>` : ""}${miss.length ? `<li class="ng">${I("alert", 16)}残り ${miss.length}項目（${esc(miss.slice(0, 2).map((x) => x.n).join("・"))}${miss.length > 2 ? " など" : ""}）</li>` : `<li class="ok">${I("check", 16, 3)}必要な項目はそろっています</li>`}</ul></div>
          </div>`}
        </section>
        <section class="rd-card rd-warm">
          <div class="rd-askhd"><img src="${IMG}robot.png" alt=""><div><h2 style="font-size:20px">AIヒアリング</h2><div class="rd-chs" style="font-size:13px;color:var(--rd-ink2);font-weight:600">${newMode ? "読み取ったあと、足りない情報だけを質問します。（質問の例）" : miss.length ? "登録を完成させるため、いくつか教えてください。" : "いま聞きたいことはありません。"}</div></div></div>
          ${qs.length ? qs.map((q, i) => `<div style="border:1px solid var(--rd-line);border-radius:14px;padding:12px 14px;margin-bottom:10px;background:#fff"><b style="color:var(--rd-bl);margin-right:6px">Q${i + 1}</b><b style="font-size:15px">${esc((String(q.q || q.n || "").replace(/<[^>]+>/g, "").match(/^[^？?]*[？?]?/) || [""])[0].slice(0, 48))}</b>${q.chips && q.chips.length ? `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px">${q.chips.slice(0, 4).map((c) => `<span class="rd-tag bl" style="font-size:12.5px;padding:5px 12px">${esc(c)}</span>`).join("")}</div>` : ""}</div>`).join("") : `<div class="rd-empty">${I("check", 18, 3)} 商品の情報はそろっています</div>`}
          ${newMode ? "" : `<button type="button" class="rd-btn" id="rdfill" style="width:100%;margin-top:4px">${miss.length ? "AIの質問に答える" : "AI商社マンに相談する"} ${I("arr", 18, 2.4)}</button>`}
        </section>
      </div></div>`;
    const hero = $("[data-rdhero]", w);
    (hero || w.firstChild) ? (hero || w.firstElementChild).insertAdjacentHTML("afterend", stepbarHtml("up") + html) : w.insertAdjacentHTML("afterbegin", html);
    wireStepbar(w);
    // ドロップは今のアプリの登録の欄へ渡す（読み取り・保存は今の処理のまま）
    const target = () => $$(".well .dz, .well [class*=drop], .well label[for=fin]", document).find((x) => !x.closest(".rd-x")) || $("#fin");
    const dz = $("#rddrop", w);
    dz.addEventListener("click", () => { if (mode === "item") { goKey("up"); return; } const t = target(); if (t) t.click(); });
    ["dragover", "dragenter"].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.style.background = "#E3F0FF"; }));
    dz.addEventListener("dragleave", () => { dz.style.background = ""; });
    dz.addEventListener("drop", (e) => {
      e.preventDefault(); dz.style.background = "";
      const t = target();
      if (t && t.id !== "fin") { try { t.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: e.dataTransfer })); return; } catch (x) { /* 下へ */ } }
      const f = $("#fin"); if (f && e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) { try { f.files = e.dataTransfer.files; f.dispatchEvent(new Event("change", { bubbles: true })); } catch (x) { f.click(); } }
    });
    const fb = $("#rdfill", w);
    if (fb) fb.addEventListener("click", () => { if (miss.length) { try { fillStart(); return; } catch (e) { /* 無い版 */ } } goKey("ai"); }); // eslint-disable-line no-undef
  }

  /* ───── 販売先国の選定（おすすめ3か国） ───── */
  /* 国旗（Windows では絵文字の国旗が文字になるため、簡単な絵で。無い国は地球のアイコン） */
  const STAR = (cx, cy, r, f) => { let d = ""; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.42 : r; d += (i ? "L" : "M") + (cx + rr * Math.cos(a)).toFixed(2) + " " + (cy + rr * Math.sin(a)).toFixed(2); } return `<path d="${d}z" fill="${f}"/>`; };
  const hs = (cs) => cs.map((c, i) => `<rect y="${(20 / cs.length) * i}" width="30" height="${20 / cs.length + 0.2}" fill="${c}"/>`).join("");
  const vs = (cs) => cs.map((c, i) => `<rect x="${(30 / cs.length) * i}" width="${30 / cs.length + 0.2}" height="20" fill="${c}"/>`).join("");
  const UK = '<rect width="30" height="20" fill="#012169"/><path d="M0 0 30 20M30 0 0 20" stroke="#fff" stroke-width="4"/><path d="M0 0 30 20M30 0 0 20" stroke="#C8102E" stroke-width="1.5"/><path d="M15 0v20M0 10h30" stroke="#fff" stroke-width="6"/><path d="M15 0v20M0 10h30" stroke="#C8102E" stroke-width="3.4"/>';
  const FL = {
    香港: '<rect width="30" height="20" fill="#DE2910"/>' + [0, 72, 144, 216, 288].map((a) => `<ellipse cx="15" cy="6.6" rx="1.7" ry="3.3" fill="#fff" transform="rotate(${a} 15 10)"/>`).join(""),
    台湾: '<rect width="30" height="20" fill="#FE0000"/><rect width="15" height="10" fill="#000095"/><circle cx="7.5" cy="5" r="2.6" fill="#fff"/>',
    シンガポール: '<rect width="30" height="10" fill="#EF3340"/><rect y="10" width="30" height="10" fill="#fff"/><circle cx="6.2" cy="5" r="3.3" fill="#fff"/><circle cx="7.6" cy="5" r="3.1" fill="#EF3340"/>' + [[10.5, 3], [12.6, 4.4], [11.8, 6.8], [9.2, 6.8], [8.4, 4.4]].map(([x, y]) => STAR(x, y, 0.75, "#fff")).join(""),
    アメリカ: '<rect width="30" height="20" fill="#fff"/>' + [0, 2, 4, 6, 8, 10, 12].map((i) => `<rect y="${i * 1.54}" width="30" height="1.54" fill="#B22234"/>`).join("") + '<rect width="12.5" height="10.8" fill="#3C3B6E"/>',
    フランス: vs(["#0055A4", "#fff", "#EF4135"]), イタリア: vs(["#009246", "#fff", "#CE2B37"]), ドイツ: hs(["#000", "#DD0000", "#FFCE00"]), オランダ: hs(["#AE1C28", "#fff", "#21468B"]),
    スペイン: '<rect width="30" height="20" fill="#AA151B"/><rect y="5" width="30" height="10" fill="#F1BF00"/>', インドネシア: hs(["#CE1126", "#fff"]),
    タイ: '<rect width="30" height="20" fill="#A51931"/><rect y="3.33" width="30" height="13.34" fill="#F4F5F8"/><rect y="6.67" width="30" height="6.66" fill="#2D2A4A"/>',
    イギリス: UK,
    中国: '<rect width="30" height="20" fill="#DE2910"/>' + STAR(5, 5, 3, "#FFDE00") + STAR(10, 2, 1, "#FFDE00") + STAR(12, 4, 1, "#FFDE00") + STAR(12, 7, 1, "#FFDE00") + STAR(10, 9, 1, "#FFDE00"),
    ベトナム: '<rect width="30" height="20" fill="#DA251D"/>' + STAR(15, 10.4, 6, "#FFFF00"),
    韓国: '<rect width="30" height="20" fill="#fff"/><circle cx="15" cy="10" r="5" fill="#CD2E3A"/><path d="M10 10a5 5 0 0 0 10 0 2.5 2.5 0 0 0-5 0 2.5 2.5 0 0 1-5 0z" fill="#0047A0"/><path d="M4 4.5l3-2M5 6l3-2M22 2.5l3 2M23 4l3 2M4 15.5l3 2M5 14l3 2M22 17.5l3-2M23 16l3-2" stroke="#000" stroke-width=".9"/>',
    日本: '<rect width="30" height="20" fill="#fff"/><circle cx="15" cy="10" r="6" fill="#BC002D"/>',
    マレーシア: '<rect width="30" height="20" fill="#fff"/>' + [0, 2, 4, 6, 8, 10, 12].map((i) => `<rect y="${i * 1.43}" width="30" height="1.43" fill="#CC0001"/>`).join("") + '<rect width="15" height="11.4" fill="#010066"/><circle cx="6" cy="5.7" r="3.6" fill="#FFCC00"/><circle cx="7" cy="5.7" r="3" fill="#010066"/>' + STAR(11, 5.7, 2, "#FFCC00"),
    インド: hs(["#FF9933", "#fff", "#138808"]) + '<circle cx="15" cy="10" r="2.4" fill="none" stroke="#000080" stroke-width=".8"/>',
    カナダ: '<rect width="30" height="20" fill="#fff"/><rect width="7.5" height="20" fill="#D52B1E"/><rect x="22.5" width="7.5" height="20" fill="#D52B1E"/><path d="M15 4l1.5 3 2-1-1 4 2 0-4.5 4-4.5-4 2 0-1-4 2 1z" fill="#D52B1E"/>',
    オーストラリア: '<rect width="30" height="20" fill="#012169"/>' + STAR(7.5, 15, 2, "#fff") + STAR(22.5, 5, 1, "#fff") + STAR(25, 10, 1, "#fff") + STAR(22.5, 16, 1, "#fff") + STAR(19.5, 9, 1, "#fff"),
    ニュージーランド: '<rect width="30" height="20" fill="#012169"/>' + STAR(22.5, 5, 1.2, "#CC142B") + STAR(25, 10, 1.2, "#CC142B") + STAR(22.5, 16, 1.2, "#CC142B") + STAR(19.5, 9, 1.2, "#CC142B"),
    UAE: hs(["#00732F", "#fff", "#000"]) + '<rect width="7.5" height="20" fill="#FF0000"/>',
    サウジアラビア: '<rect width="30" height="20" fill="#006C35"/><rect x="8" y="12" width="14" height="1.2" fill="#fff"/>',
    フィリピン: '<rect width="30" height="10" fill="#0038A8"/><rect y="10" width="30" height="10" fill="#CE1126"/><path d="M0 0 17 10 0 20z" fill="#fff"/><circle cx="5.6" cy="10" r="2" fill="#FCD116"/>',
    マカオ: '<rect width="30" height="20" fill="#00785E"/><circle cx="15" cy="11" r="3.2" fill="#fff"/>',
    ブラジル: '<rect width="30" height="20" fill="#009C3B"/><path d="M15 2.5 27 10 15 17.5 3 10z" fill="#FFDF00"/><circle cx="15" cy="10" r="4" fill="#002776"/>',
    メキシコ: vs(["#006847", "#fff", "#CE1126"]) + '<circle cx="15" cy="10" r="1.8" fill="#8C5A2B"/>',
    トルコ: '<rect width="30" height="20" fill="#E30A17"/><circle cx="11" cy="10" r="5" fill="#fff"/><circle cx="12.3" cy="10" r="4" fill="#E30A17"/>' + STAR(17, 10, 2.2, "#fff"),
    カタール: '<rect width="30" height="20" fill="#8A1538"/><rect width="10" height="20" fill="#fff"/>',
  };
  FL.米国 = FL.アメリカ; FL.英国 = FL.イギリス; FL.ドバイ = FL.UAE;
  const flag = (c, sz) => { const k = String(c || "").trim(); const f = FL[k]; const h = sz || 18; return f ? `<svg width="${Math.round(h * 1.5)}" height="${h}" viewBox="0 0 30 20" style="border-radius:3px;box-shadow:0 0 0 1px rgba(0,0,0,.08);vertical-align:-3px;flex:none" aria-hidden="true">${f}</svg>` : I("globe", h); };
  function ctySummary(w) {
    const T = G("TEN") || {};
    const S = T.ctySel || {};
    const top = Array.isArray(S.top) ? S.top : [];
    const chosen = Array.isArray(S.chosen) ? S.chosen : [];
    const cands = Array.isArray(S.cands) ? S.cands : [];
    const nameOf = (x) => (typeof x === "string" ? x : x && (x.cty || x.name || x.c || x.country)) || "";
    const scoreOf2 = (x) => (x && typeof x === "object" ? (x.score != null ? x.score : x.total != null ? x.total : x.s) : null);
    const why = (x) => (x && typeof x === "object" ? (x.why || x.reason || x.note || (Array.isArray(x.reasons) ? x.reasons[0] : "")) : "");
    const list = top.length ? top.slice(0, 3) : [];
    const aiBtn = $$("button", w).find((b) => /おまかせ/.test(b.textContent) && !b.closest(".rd-x"));
    let body;
    if (list.length) {
      body = `<div class="rd-grid" style="grid-template-columns:repeat(${list.length},minmax(0,1fr))">${list.map((x, i) => { const n = nameOf(x), sc = scoreOf2(x); return `<div class="rd-card ${i === 0 ? "rd-warm" : ""}" style="padding:18px;${i === 0 ? "border:2px solid var(--rd-or)" : ""}"><div style="display:flex;align-items:center;gap:10px"><span class="rd-ck" style="width:30px;height:30px">${i + 1}</span>${flag(n, 26)}<b style="font-size:22px">${esc(n)}</b>${chosen.indexOf(n) >= 0 ? '<span class="rd-tag gr">確定</span>' : ""}</div>${sc != null ? `<div style="margin:12px 0 6px;font-size:13px;color:var(--rd-ink2);font-weight:700">おすすめスコア</div><div style="font-size:40px;font-weight:900;color:var(--rd-or2);line-height:1">${esc(Math.round(+sc))}<small style="font-size:16px;color:var(--rd-ink3)">/100</small></div>` : ""}${why(x) ? `<p style="margin:10px 0 0;font-size:13.5px;font-weight:600;color:#2C3B52;line-height:1.6">${esc(String(why(x)).slice(0, 80))}</p>` : ""}</div>`; }).join("")}</div>`;
    } else {
      const tg = (T.targets || []).slice(0, 6);
      body = `<div class="rd-grid" style="grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);align-items:center">
        <div><p style="margin:0 0 12px;font-size:16px;font-weight:700;color:#22324A;line-height:1.7">まだ分析していません。<br>AI商社マンが、規制・市場・競合のデータから<b style="color:var(--rd-or2)">おすすめの3か国</b>を選びます。</p>
          ${tg.length ? `<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:6px">${tg.map((c) => `<span class="rd-tag bl" style="font-size:14px;padding:6px 12px">${flag(c, 16)} ${esc(c)}</span>`).join("")}</div><p class="rd-note" style="margin-top:4px">商品の登録で選んだ「出したい国の候補」${cands.length ? `・候補 ${cands.length}か国` : ""}</p>` : ""}</div>
        <div style="text-align:center">${aiBtn ? `<button type="button" class="rd-btn big" id="rdctyai">${I("spark", 22)}AI商社マンにおまかせ</button><p class="rd-note">1クリックで候補選び・分析・おすすめまで</p>` : ""}</div></div>`;
    }
    const html = `<section class="rd-card rd-x" data-rdcty="1" style="margin-bottom:18px"><div class="rd-ch">${I("award", 26)}<h2>おすすめ3か国</h2><span class="rd-chs">自社の商品と市場データから、優先度の高い販売先をAIが選びます</span></div>${body}</section>`;
    const hero = $("[data-rdhero]", w);
    hero.insertAdjacentHTML("afterend", stepbarHtml("cty") + html);
    wireStepbar(w);
    const b = $("#rdctyai", w);
    if (b && aiBtn) b.addEventListener("click", () => aiBtn.click());
  }

  /* ───── 書類・出荷（手順の帯） ───── */
  function opsBar(w, tab) {
    const S = [["受注", "cart"], ["書類準備", "doc"], ["出荷手配", "ship"], ["通関", "shield"], ["完了", "check"]];
    const on = tab === "doc" || tab === "file" ? 1 : tab === "ship" ? 2 : tab === "ord" ? 0 : 1;
    P.cart = '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.6 12.4a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L22 7H6"/>';
    const html = `<div class="rd-stepbar rd-x" data-rdops="1">${S.map((s, i) => `${i ? `<span class="rd-sbar">${I("chevR", 22, 2.4)}</span>` : ""}<div class="rd-sb ${i === on ? "on" : i < on ? "done" : ""}" style="cursor:default">${I(s[1], 22)}<span>${s[0]}</span></div>`).join("")}</div>`;
    $("[data-rdhero]", w).insertAdjacentHTML("afterend", html);
  }

  /* ───── 物流会社のホーム ───── */
  function readFinbox(w) {
    const F = {};
    $$(".v70fov [data-v70fgo]", w).forEach((b) => { F[b.getAttribute("data-v70fgo")] = { n: num($("b", b) && $("b", b).textContent), l: ($("span", b) || {}).textContent || "" }; });
    $$(".g4 > .c", w).forEach((c) => { const l = (($(".lbl", c) || {}).textContent || "").trim(); const kv = $(".kv", c); if (l && kv) F["g:" + l] = { n: num(kv.textContent), u: (($("small", kv) || {}).textContent || "").trim() }; });
    return F;
  }
  function homeFwd(w) {
    const F = readFinbox(w);
    w.innerHTML = "";
    const v = (k) => (F[k] ? F[k].n : 0);
    const recv = F["g:受信した依頼"], auto = F["g:AI自動回答"], lane = F["g:登録レーン"], held = F["g:仮押さえ"];
    const rate = recv && recv.n ? Math.round(((auto ? auto.n : 0) / recv.n) * 100) : null;
    const todo = [
      { ic: "mail", t: "AIが回答できない見積依頼を確認", s: "レーン未登録・情報不足の依頼です", n: v("rv"), btn: "対応する", go: () => fwdFilter("rv") },
      { ic: "cal", t: "仮押さえの依頼を確認", s: "荷主からのスペース仮押さえです", n: v("held"), btn: "確認する", go: () => fwdFilter("held") },
      { ic: "box", t: "出荷の手配を進める", s: "案件の B/L・ETD/ETA を登録・更新", n: v("fcase"), btn: "開く", go: () => goKey("fcase") },
    ];
    const total = todo.filter((x) => x.n > 0).length;
    const six = [
      { ic: "db", t: "1. レート登録", s: "料金表を取り込む", n: lane ? `${lane.n}${lane.u}` : "", go: () => goKey("frates") },
      { ic: "mail", t: "2. 見積対応", s: "AIが自動で回答", n: auto ? `AI回答 ${auto.n}件` : "", go: () => goKey("finbox") },
      { ic: "alert", t: "3. 例外対応", s: "AIで回答できない依頼を手動で対応", n: `要確認 ${v("rv")}件`, go: () => fwdFilter("rv"), hot: v("rv") > 0 },
      { ic: "chart", t: "4. 選ばれる工夫", s: "相見積の順位・差分を確認", n: "", go: () => goKey("fagg") },
      { ic: "hand", t: "5. 仮押さえ", s: "荷主からの仮押さえを確認", n: `${v("held")}件`, go: () => fwdFilter("held") },
      { ic: "ship", t: "6. 出荷手配", s: "B/L・本船・ETD/ETA を管理", n: `案件 ${v("fcase")}件`, go: () => goKey("fcase") },
    ];
    const hot = six.findIndex((x) => x.hot);
    const tiles = [
      { ic: "mail", l: "受信した見積依頼", n: recv ? recv.n : null, u: "件", go: () => goKey("finbox") },
      { ic: "ai", l: "AI自動回答率", n: rate, u: "%", s: auto && recv ? `${auto.n} / ${recv.n}件` : "", go: () => goKey("finbox") },
      { ic: "hand", l: "仮押さえの依頼", n: v("held"), u: "件", s: held ? `国ごとに数えると ${held.n}件` : "", go: () => fwdFilter("held"), or: 1 },
      { ic: "db", l: "登録レーン", n: lane ? lane.n : null, u: lane ? lane.u.replace(/^本/, "本") : "本", go: () => goKey("frates"), gr: 1 },
    ];
    putHero(w, greet(), "AI物流マンが、見積対応から出荷までの業務をサポートします。");
    const box = document.createElement("div");
    box.className = "rd-x";
    box.innerHTML = `
      <div class="rd-grid rd-fhome-top" style="grid-template-columns:minmax(0,1.55fr) minmax(0,1fr);margin-bottom:18px">
        <section class="rd-card rd-warm">
          <div class="rd-ch"><span class="rd-ck">${I("check", 18, 3)}</span><h2>今日やること <span style="color:var(--rd-or2);font-size:30px">${total}</span> 件</h2><span class="rd-chs">まずは、この3つから対応しましょう。</span></div>
          <div class="rd-todo">${todo.map((x, i) => `<div class="rd-td"><span class="rd-tdi">${I(x.ic, 22)}</span><div><b>${esc(x.t)}</b><small>${esc(x.s)}</small></div><span class="rd-cnt ${x.n ? "" : "z"}">${x.n} 件</span><button type="button" class="rd-btn ${x.n ? (i ? "ghost" : "") : "done"}" data-rdtodo="${i}">${x.n ? esc(x.btn) + " " + I("arr", 16, 2.4) : "対応済み " + I("check", 16, 2.4)}</button></div>`).join("")}</div>
        </section>
        <div style="display:flex;flex-direction:column;gap:18px">
          <section class="rd-card"><div class="rd-ch">${I("zap", 24)}<h2>すぐに始める</h2></div>
            <div class="rd-quick"><button type="button" class="rd-q" data-rdq="frates">${I("upload", 32, 1.6)}レート表を<br>登録・更新</button><button type="button" class="rd-q" data-rdq="finbox">${I("research", 32, 1.6)}新しい<br>見積を確認</button><button type="button" class="rd-q" data-rdq="fcase">${I("ship", 32, 1.6)}出荷案件を<br>確認</button></div></section>
          <button type="button" class="rd-card" data-rdact="help" style="display:flex;align-items:center;gap:14px;cursor:pointer;text-align:left;font-family:inherit">${I("book", 40, 1.6)}<span><b style="font-size:19px;display:block">はじめての方へ</b><span style="font-size:13.5px;color:var(--rd-ink2);font-weight:600">14日で運用を始めるステップ</span></span><span style="margin-left:auto">${I("chevR", 22, 2.4)}</span></button>
        </div>
      </div>
      <section class="rd-card" style="margin-bottom:18px">
        <div class="rd-ch">${I("chart", 24)}<h2>全体の状況</h2><span class="rd-chs">（見積受信箱と同じ数え方）</span></div>
        <div class="rd-tiles">${tiles.map((t, i) => `<button type="button" class="rd-tile ${t.or ? "or" : t.gr ? "gr" : ""}" data-rdtile="${i}"><span class="rd-ti">${I(t.ic, 26)}</span><span><b>${esc(t.l)}</b><span class="rd-tn">${t.n == null ? "—" : esc(t.n)}<small>${esc(t.u || "")}</small></span>${t.s ? `<span class="rd-ts" style="display:block">${esc(t.s)}</span>` : ""}</span></button>`).join("")}</div>
      </section>
      <section class="rd-card">
        <div class="rd-ch">${I("ship", 24)}<h2>見積から出荷までの流れ</h2><span class="rd-chs">（6ステップ）</span></div>
        <div class="rd-six">${six.map((x, i) => `<button type="button" class="rd-sx ${i === hot ? "on" : ""}" data-rdsix="${i}">${i === hot ? '<span class="rd-badge">対応中</span>' : ""}<span class="rd-sxi">${I(x.ic, 22)}</span><b>${esc(x.t)}</b><small>${esc(x.s)}</small>${x.n ? `<span class="rd-sxn">${esc(x.n)}</span>` : ""}</button>`).join("")}</div>
      </section>`;
    w.appendChild(box);
    $$("[data-rdtodo]", box).forEach((b) => b.addEventListener("click", () => { const x = todo[+b.dataset.rdtodo]; if (x.n) x.go(); }));
    $$("[data-rdq]", box).forEach((b) => b.addEventListener("click", () => goKey(b.dataset.rdq)));
    $$("[data-rdsix]", box).forEach((b) => b.addEventListener("click", () => six[+b.dataset.rdsix].go()));
    $$("[data-rdtile]", box).forEach((b) => b.addEventListener("click", () => tiles[+b.dataset.rdtile].go()));
    const hb = $("[data-rdact=help]", box); if (hb) hb.addEventListener("click", openHelp);
  }
  function fwdFilter(k) {
    fGo("finbox");
    setTimeout(() => { const b = $$('.well [data-v70fgo="' + k + '"]').find((x) => !x.closest(".rd-x")); if (b) b.click(); }, 60);
  }
  function finboxSummary(w) {
    const html = `<div class="rd-x" data-rdfin="1">
      <div class="rd-card" style="display:flex;align-items:center;gap:14px;margin-bottom:16px;padding:14px 20px;flex-wrap:wrap">${I("zap", 26)}<b style="font-size:19px">AIが自動で見積回答します</b><span style="width:1px;height:26px;background:var(--rd-line)"></span><span style="font-size:13.5px;color:var(--rd-ink2);font-weight:600">レーン登録済みの条件はAIが自動で回答します。例外（情報不足など）のみ、あなたの確認が必要です。</span></div></div>`;
    $("[data-rdhero]", w).insertAdjacentHTML("afterend", html);
  }
  function tilesFrom(w, sel, map) {
    // 今の画面の小さな数字のタイル（.g4 など）を、刷新版のタイルに描き直す（数はそのまま）
    const g = $(sel, w);
    if (!g || g.dataset.rdt) return;
    const cs = $$(":scope > .c", g);
    if (!cs.length) return;
    g.dataset.rdt = "1";
    const html = `<div class="rd-tiles rd-x" style="margin-bottom:18px;grid-template-columns:repeat(${Math.min(cs.length, 4)},minmax(0,1fr))">${cs.map((c, i) => { const l = (($(".lbl", c) || {}).textContent || "").trim(); const kv = $(".kv", c); const kd = (($(".kd", c) || {}).textContent || "").trim(); const m = map[i] || {}; return `<div class="rd-tile ${m.cls || ""}" style="cursor:default"><span class="rd-ti">${I(m.ic || "chart", 26)}</span><span style="min-width:0"><b>${esc(l)}</b><span class="rd-tn">${kv ? esc(num(kv.textContent)) : "—"}<small>${esc(kv && $("small", kv) ? $("small", kv).textContent : "")}</small></span><span class="rd-ts" style="display:block">${esc(kd.slice(0, 40))}</span></span></div>`; }).join("")}</div>`;
    g.insertAdjacentHTML("beforebegin", html);
    g.style.display = "none";
  }

  /* ───── レート管理（期限・登録の状況） ───── */
  function ymd(d) { const z = (n) => String(n).padStart(2, "0"); return d.getFullYear() + "-" + z(d.getMonth() + 1) + "-" + z(d.getDate()); }
  function ratesSummary(w) {
    const F = G("FWDB") || {};
    const R = Array.isArray(F.rates) ? F.rates : [];
    const t = ymd(new Date()), t30 = ymd(new Date(Date.now() + 30 * 864e5));
    const exp = R.filter((r) => r && r.valid && r.valid < t).length;
    const soon = R.filter((r) => r && r.valid && r.valid >= t && r.valid <= t30).length;
    const cos = new Set(R.map((r) => r && r.co).filter(Boolean)).size;
    const unreg = (Array.isArray(F.reqs) ? F.reqs : []).filter((r) => /レーン未登録/.test(String((r && (r.st || r.status)) || ""))).length;
    const T = [
      { ic: "alert", l: "有効期限切れ", n: exp, u: "本", s: "見積・推奨に使われません（更新が必要）", cls: exp ? "rd" : "gr" },
      { ic: "cal", l: "30日以内に期限", n: soon, u: "本", s: "早めに新しいレートへ", cls: soon ? "or" : "gr" },
      { ic: "fileup", l: "未登録レーンの依頼", n: unreg, u: "件", s: "荷主の依頼があるのにレートが無い区間", cls: unreg ? "or" : "gr" },
      { ic: "db", l: "登録レーン", n: R.length, u: cos ? `本／${cos}社` : "本", s: "同じ区間は集計して推奨", cls: "" },
    ];
    const html = `<div class="rd-x" data-rdrates="1">
      <div class="rd-card" style="display:flex;align-items:center;gap:14px;margin-bottom:16px;padding:14px 20px"><span class="rd-ck">${I("check", 18, 3)}</span><b style="font-size:19px">AI物流マンが、このレートを使って見積依頼に<span style="color:var(--rd-or2)">自動で回答</span>します。</b></div>
      <div class="rd-tiles" style="margin-bottom:18px">${T.map((x) => `<div class="rd-tile ${x.cls}" style="cursor:default"><span class="rd-ti">${I(x.ic, 26)}</span><span style="min-width:0"><b>${esc(x.l)}</b><span class="rd-tn">${x.n}<small>${esc(x.u)}</small></span><span class="rd-ts" style="display:block">${esc(x.s)}</span></span></div>`).join("")}</div></div>`;
    $("[data-rdhero]", w).insertAdjacentHTML("afterend", html);
    const ai = $("#v65fwdai", w);
    if (ai) w.appendChild(ai); // たたまず、いちばん下へ（設定なので）
  }
  function casesSummary(w) {
    const C = $$("section.v33case", w);
    if (!C.length) return;
    let bl = 0, part = 0, done = 0;
    C.forEach((c) => { const t = c.textContent || ""; if (/B\/L 未登録/.test(t)) bl++; const m = t.match(/対応済み\s*(\d+)\s*\/\s*(\d+)/); if (m) { if (+m[1] > 0 && +m[1] >= +m[2]) done++; else if (+m[1] > 0) part++; } });
    const T = [
      { ic: "brief", l: "案件", n: C.length, s: "荷主の会社×案件番号", cls: "" },
      { ic: "doc", l: "B/L 未登録", n: bl, s: "出荷の情報（B/L・本船・ETD/ETA）がまだ", cls: bl ? "or" : "gr" },
      { ic: "clock", l: "対応中", n: part, s: "依頼の一部を完了にした案件", cls: "" },
      { ic: "check", l: "すべて対応済み", n: done, s: "依頼をすべて完了にした案件", cls: "gr" },
    ];
    const html = `<div class="rd-tiles rd-x" data-rdcases="1" style="margin-bottom:18px">${T.map((x) => `<div class="rd-tile ${x.cls}" style="cursor:default"><span class="rd-ti">${I(x.ic, 26)}</span><span style="min-width:0"><b>${esc(x.l)}</b><span class="rd-tn">${x.n}<small>件</small></span><span class="rd-ts" style="display:block">${esc(x.s)}</span></span></div>`).join("")}</div>`;
    $("[data-rdhero]", w).insertAdjacentHTML("afterend", html);
  }

  /* ───── AIバイヤー開拓・商談（デザイン案 d05）：やり取り中の相手の数・流れ・相手の一覧・選んだ相手・最近の動き ─────
     数は、この画面の「やり取り中のBuyer」と同じ（やりとりのスレッドと、その状況）。元の画面はすべて下にそのまま */
  const BMS = [["コンタクト中（一方的なアプローチ）", "コンタクト中", "send"], ["商談中", "商談中", "chat"], ["サンプル出荷", "サンプル出荷", "box"], ["見積提示", "見積提示", "doc"], ["契約交渉", "契約交渉", "hand"], ["取引中", "取引中", "check"]];
  const stShort = (s) => (String(s || "").indexOf("コンタクト中") === 0 ? "コンタクト中" : String(s || "") || "コンタクト中");
  const stCls = (s) => ({ コンタクト中: "gy", 商談中: "bl", サンプル出荷: "bl", 見積提示: "or", 契約交渉: "or", 取引中: "gr", 失注: "rd" }[stShort(s)] || "gy");
  function dbThreads() {
    let L = [];
    try { L = bmThreadsAll() || []; } catch (e) { L = []; } // eslint-disable-line no-undef
    let MB = [];
    try { MB = (typeof myBuyers === "function" ? myBuyers() : []) || []; } catch (e) { MB = []; } // eslint-disable-line no-undef
    const lastAt = (t) => (t.msgs || []).reduce((a, m) => Math.max(a, +m.at || 0), 0);
    return L.map((t) => { const b = MB.find((x) => x && x.id === t.id); return { t, id: t.id, name: b ? b.co : `${t.cty || ""}の${t.biz || "バイヤー"}（ID ${t.id}）`, locked: !b, cty: t.cty || (b && b.cty) || "", biz: (b && b.biz) || t.biz || "", st: t.status || "コンタクト中（一方的なアプローチ）", why: t.statusWhy || "", at: lastAt(t), last: (t.msgs || []).slice().sort((a, c) => (+c.at || 0) - (+a.at || 0))[0] }; }).sort((a, b) => b.at - a.at);
  }
  const mtxt = (m) => String((m && (m.subj || m.body)) || "").replace(/[*#>`]/g, "").replace(/\s+/g, " ").trim();
  const ago = (ms) => { if (!ms) return ""; const d = Math.floor((Date.now() - ms) / 864e5); return d <= 0 ? "今日" : d + "日前"; };
  function dbSummary(w) {
    const T = dbThreads();
    const cnt = (lab) => T.filter((x) => stShort(x.st) === lab).length;
    const replied = T.filter((x) => (x.t.msgs || []).some((m) => m.w === "by")).length;
    const nego = T.filter((x) => /^(商談中|サンプル出荷|見積提示|契約交渉)$/.test(stShort(x.st))).length;
    const quote = cnt("見積提示") + cnt("契約交渉");
    let runs = [];
    try { runs = ((G("TEN") || {}).v71ob || {}).runs || []; } catch (e) { runs = []; }
    const lastRun = runs[runs.length - 1];
    const runN = lastRun ? (lastRun.list || lastRun.items || lastRun.rows || lastRun.cands || []).length : 0;
    const front = (() => { let j = -1; BMS.forEach((s, i) => { if (cnt(s[1]) > 0) j = i; }); return j; })();
    const acts = [];
    T.forEach((x) => (x.t.msgs || []).forEach((m) => acts.push({ x, m })));
    acts.sort((a, b) => (+b.m.at || 0) - (+a.m.at || 0));
    const sumT = [
      { ic: "users", l: "連絡した相手", n: T.length, s: "やり取り中のBuyer" },
      { ic: "mail", l: "返信が届いた相手", n: replied, s: "相手から1回以上の返信", cls: "gr" },
      { ic: "chat", l: "商談が進んでいる相手", n: nego, s: "商談中〜契約交渉", cls: "or" },
      { ic: "doc", l: "見積・契約の段階", n: quote, s: "見積提示・契約交渉" },
    ];
    const box = document.createElement("div");
    box.className = "rd-x"; box.setAttribute("data-rddb", "1");
    box.innerHTML = `
      <section class="rd-card" style="margin-bottom:16px;padding:16px 20px"><div class="rd-ch" style="margin-bottom:12px">${I("chart", 24)}<h2 style="font-size:20px">開拓・商談のサマリー</h2><span class="rd-chs">（この画面の「やり取り中のBuyer」と同じ数え方）</span></div>
        <div class="rd-tiles">${sumT.map((t) => `<div class="rd-tile ${t.cls || ""}" style="cursor:default"><span class="rd-ti">${I(t.ic, 26)}</span><span><b>${esc(t.l)}</b><span class="rd-tn">${t.n}<small>社</small></span><span class="rd-ts" style="display:block">${esc(t.s)}</span></span></div>`).join("")}</div></section>
      <div class="rd-grid rd-3col" style="grid-template-columns:minmax(0,1.15fr) minmax(0,1fr) minmax(0,1fr);margin-bottom:16px">
        <section class="rd-card"><div class="rd-ch">${I("users", 22)}<h2 style="font-size:18px">やり取り中のバイヤー</h2><span class="rd-chs">（${T.length}社・新しい順）</span></div>
          ${T.length ? `<div class="rd-list">${T.slice(0, 6).map((x, i) => `<button type="button" class="rd-li" data-rddbi="${i}" style="${i === 0 ? "border-color:var(--rd-or);background:#FFF8F0" : ""}">${flag(x.cty, 16)}<span class="rd-lt" title="${esc(x.name)}">${x.locked ? "🔒 " : ""}${esc(x.name)}</span><span class="rd-tag ${stCls(x.st)}">${esc(stShort(x.st))}</span></button>`).join("")}</div>` : `<div class="rd-empty">まだ相手はいません。下の「AIバイヤー開拓」でリストを作れます</div>`}</section>
        <section class="rd-card" id="rddbsel"></section>
        <section class="rd-card rd-warm"><div class="rd-askhd"><img src="${IMG}robot.png" alt=""><div><h2 style="font-size:18px">AIバイヤー開拓</h2><div style="font-size:13px;color:var(--rd-ink2);font-weight:600">AI商社マンが、商談になりやすい相手を探して文面まで提案します</div></div></div>
          ${lastRun ? `<p style="font-size:14px;font-weight:700;margin:0 0 10px">最新のリスト：${runN}件</p>` : `<p style="font-size:14px;font-weight:700;margin:0 0 10px;color:#2C3B52">まだリストを作っていません。国・業態・件数を決めると、AIがリストと最初の文面を作ります。</p>`}
          <button type="button" class="rd-btn" id="rddbob" style="width:100%">${I("spark", 18)}条件を決めてリストを作る ${I("arr", 16, 2.4)}</button>
          <p class="rd-note">送る前に必ず文面を確認・承認できます（勝手には送りません）。</p></section>
      </div>
      <section class="rd-card" style="margin-bottom:16px"><div class="rd-ch">${I("target", 24)}<h2 style="font-size:20px">商談パイプライン</h2><span class="rd-chs">（押すと、その状況の相手だけを下の一覧に出します）</span></div>
        <div class="rd-flow">${BMS.map((s, i) => `<button type="button" class="rd-fs ${i === front ? "on" : ""}" data-rddbst="${esc(s[1])}"><div class="rd-fl">${I(s[2], 18)}${esc(s[1])}</div><div class="rd-fn">${cnt(s[1])}<small>社</small></div></button>`).join("")}</div>
        ${cnt("失注") ? `<p class="rd-note">失注 ${cnt("失注")}社（理由は「分析・レポート」の断られた理由へ）</p>` : ""}</section>
      <section class="rd-card" style="margin-bottom:18px"><div class="rd-ch">${I("clock", 24)}<h2 style="font-size:20px">最近のアクティビティ</h2><button type="button" class="rd-more" data-rdgo="msg">すべてのやりとりを見る ${I("arr", 16)}</button></div>
        ${acts.length ? `<div class="rd-list">${acts.slice(0, 4).map((a, i) => `<button type="button" class="rd-li" data-rddba="${i}">${I(a.m.w === "me" ? "send" : "mail", 18)}<span class="rd-lm" style="min-width:70px">${esc(ago(+a.m.at))}</span><b style="min-width:0;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px">${esc(a.x.name)}</b><span class="rd-tag ${a.m.w === "me" ? "or" : "bl"}">${a.m.w === "me" ? "送信" : "返信あり"}</span><span class="rd-lt" style="font-weight:600">${esc(mtxt(a.m).slice(0, 70))}</span></button>`).join("")}</div>` : `<div class="rd-empty">まだやりとりはありません</div>`}</section>`;
    $("[data-rdhero]", w).insertAdjacentElement("afterend", box);
    const sel = (i) => {
      const x = T[i]; const el = $("#rddbsel", box);
      $$("[data-rddbi]", box).forEach((b) => { const on = +b.dataset.rddbi === i; b.style.borderColor = on ? "var(--rd-or)" : ""; b.style.background = on ? "#FFF8F0" : ""; });
      if (!x) { el.innerHTML = `<div class="rd-ch">${I("bldg", 22)}<h2 style="font-size:18px">選択中のバイヤー</h2></div><div class="rd-empty">左の一覧から選ぶと、ここに出ます</div>`; return; }
      el.innerHTML = `<div class="rd-ch">${I("bldg", 22)}<h2 style="font-size:18px">選択中のバイヤー</h2></div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">${flag(x.cty, 22)}<b style="font-size:17px;line-height:1.4">${x.locked ? "🔒 " : ""}${esc(x.name)}</b></div>
        <dl class="rd-kv" style="grid-template-columns:90px 1fr"><dt>国</dt><dd>${esc(x.cty || "—")}</dd><dt>業態</dt><dd title="${esc(x.biz)}">${esc(x.biz || "—")}</dd><dt>状況</dt><dd><span class="rd-tag ${stCls(x.st)}">${esc(stShort(x.st))}</span></dd><dt>最後の動き</dt><dd>${esc(x.last ? x.last.t || "" : "—")}</dd></dl>
        ${x.why ? `<div style="margin-top:12px;padding:12px 14px;border-radius:12px;background:#FFF7EC;border:1px solid #FBD9B0"><b style="font-size:13.5px;color:#C25F00">${I("spark", 16)} 状況の理由（AI）</b><p style="margin:6px 0 0;font-size:13.5px;font-weight:600;line-height:1.6">${esc(String(x.why).slice(0, 140))}</p></div>` : ""}
        <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap"><button type="button" class="rd-btn" id="rddbopen">${I("msg", 18)}やりとりを開く</button><button type="button" class="rd-btn ghost" id="rddbdeal">商談の記録</button></div>`;
      $("#rddbopen", el).addEventListener("click", () => { try { openDMThread(x.id); } catch (e) { goKey("msg"); } }); // eslint-disable-line no-undef
      $("#rddbdeal", el).addEventListener("click", () => goKey("deal"));
    };
    sel(T.length ? 0 : -1);
    $$("[data-rddbi]", box).forEach((b) => b.addEventListener("click", () => sel(+b.dataset.rddbi)));
    $$("[data-rddba]", box).forEach((b) => b.addEventListener("click", () => { const a = acts[+b.dataset.rddba]; try { openDMThread(a.x.id); } catch (e) { goKey("msg"); } })); // eslint-disable-line no-undef
    $$("[data-rdgo]", box).forEach((b) => b.addEventListener("click", () => goKey(b.dataset.rdgo)));
    $("#rddbob", box).addEventListener("click", () => { const c = $("#v71ob", w); if (c) { c.scrollIntoView({ behavior: "smooth", block: "start" }); c.style.boxShadow = "0 0 0 3px var(--rd-or)"; setTimeout(() => { c.style.boxShadow = ""; }, 2400); } });
    $$("[data-rddbst]", box).forEach((b) => b.addEventListener("click", () => {
      const lab = b.dataset.rddbst;
      const f = $$("#bmStF button", w).find((x) => x.textContent.replace(/\s+/g, "").indexOf(lab) === 0);
      const card = $("#bmThreadsCard", w);
      if (f) f.click();
      setTimeout(() => { const c2 = $("#bmThreadsCard"); if (c2 || card) (c2 || card).scrollIntoView({ behavior: "smooth", block: "start" }); }, 80);
      if (!f) goKey("deal");
    }));
  }

  /* ───── 相見積・AI推奨（デザイン案 d09）：貴社の順位・相見積の比較・AI の推奨の理由・1位との差・選ばれる工夫 ─────
     数は、荷主の依頼に付いた相見積（AI物流マンが依頼を受けたときに出した候補と点数）そのまま。元の画面はすべて下にそのまま */
  const yen = (n) => "¥" + Math.round(+n || 0).toLocaleString("ja-JP");
  function aggLanes() {
    const F = G("FWDB") || {}; const me = (F.profile && F.profile.co) || "";
    const L = [];
    (Array.isArray(F.reqs) ? F.reqs : []).forEach((r) => (r.legs || []).forEach((lg, li) => {
      const O = (lg.offers || []).filter((x) => x && x.quote).slice().sort((a, b) => (+b.score || 0) - (+a.score || 0));
      const mi = O.findIndex((x) => x.co === me);
      if (mi < 0 || O.length < 2) return;
      L.push({ r, lg, li, O, mi, me, d: r.d || "" });
    }));
    L.sort((a, b) => (a.d < b.d ? 1 : a.d > b.d ? -1 : 0));
    return L;
  }
  RD.aggSel = RD.aggSel == null ? -1 : RD.aggSel;
  function aggSummary(w) {
    const L = aggLanes();
    if (!L.length) return;
    let ix = RD.aggSel;
    if (ix < 0 || ix >= L.length) { ix = L.findIndex((x) => x.mi > 0); if (ix < 0) ix = 0; }
    const x = L[ix], top = x.O[0], mine = x.O[x.mi];
    const q = (o) => o.quote || {};
    const tt = (o) => (+o.ttx || +q(o).tt || 0);
    const dp = q(mine).total - q(top).total, dd = tt(mine) - tt(top), dv = (+mine.vd || 0) - (+top.vd || 0);
    const tips = [];
    if (x.mi === 0) tips.push(["award", "いまは1位です", `AIの推奨の理由：${(x.lg.recWhy || [])[0] || "総合点が最も高い"}。有効期限（あと${mine.vd || "—"}日）が切れると対象外になるので、早めに更新を。`]);
    if (dp > 0) tips.push(["coins", "価格を見直す", `目安：${yen(q(top).total)} 以下（いまより ${yen(dp)} 下げる・${(dp / q(top).total * 100).toFixed(1)}%）。1位との差を縮めると順位が上がる可能性があります。`]);
    if (dd > 0) tips.push(["clock", "所要日数を縮める", `1位より約${dd}日長い見込みです。直行便・早い便があれば提案メモに書くと伝わります。`]);
    if (dd < 0) tips.push(["zap", "早さを伝える", `1位より約${-dd}日早い見込みです。納期を急ぐ荷主には強みになります（提案メモに）。`]);
    if (dv < 0) tips.push(["cal", "有効期限を延ばす", `有効期限が1位より${-dv}日短い（あと${mine.vd}日）。レートを更新すると、見積の対象に長く残ります。`]);
    if (!tips.length) tips.push(["hand", "条件の柔軟性を示す", "スペースの優先確保や出荷日の前倒しなど、調整できる点を提案メモで伝えましょう。"]);
    const lane = `${q(top).lane || (x.r.pol + " → " + (x.lg.pod || x.lg.cty))}`;
    const box = document.createElement("div");
    box.className = "rd-x"; box.setAttribute("data-rdagg", "1");
    box.innerHTML = `
      <section class="rd-card" style="margin-bottom:16px;display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:20px;align-items:center" id="rdaggtop">
        <div><div class="rd-ch" style="margin-bottom:8px">${I("box", 22)}<h2 style="font-size:18px">対象の依頼（レーン）</h2>
          <select class="sel" id="rdaggsel" style="margin-left:auto;max-width:360px;height:36px;border-radius:999px;padding:0 10px">${L.slice(0, 60).map((y, i) => `<option value="${i}" ${i === ix ? "selected" : ""}>${esc(y.r.id)}・${esc(y.lg.cty || y.lg.pod)}・貴社 ${y.mi + 1}位/${y.O.length}社</option>`).join("")}</select></div>
          <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;font-size:18px;font-weight:800"><span>${esc(lane.split("→")[0] || "")}</span>${I("arr", 18, 2.4)}<span>${flag(x.lg.cty, 18)} ${esc((lane.split("→")[1] || x.lg.cty || "").trim())}</span></div>
          <div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:8px;font-size:13.5px;font-weight:700;color:var(--rd-ink2)"><span>${I("ship", 16)} ${esc(q(top).mode || x.r.mode || "")}・${esc(q(top).basis || (x.r.cbm ? x.r.cbm + "m³" : ""))}</span><span>${I("box", 16)} ${esc(x.r.item || "")}</span><span>${I("cal", 16)} 依頼 ${esc(x.r.d || "")}${x.r.etd ? "・希望 " + esc(x.r.etd) : ""}</span><span>${I("bldg", 16)} ${esc(x.r.co || "")}</span></div></div>
        <div style="display:flex;align-items:center;gap:16px;border-left:1px solid var(--rd-line);padding-left:20px">
          <div>${I("award", 20)}<b style="font-size:15px;margin-left:6px">現在の選定状況（貴社）</b><div style="font-size:16px;font-weight:800;margin-top:6px">第 <span style="font-size:52px;font-weight:900;color:var(--rd-or2);line-height:1">${x.mi + 1}</span> 位 / ${x.O.length} 社</div></div>
          <div style="padding:10px 14px;border-radius:12px;background:${x.mi ? "#FFF7EC" : "var(--rd-good-soft)"};font-size:13px;font-weight:700;line-height:1.6">${x.mi ? `1位（${esc(top.co)}）との差は主に${dp > 0 ? "価格" : dd > 0 ? "日数" : "総合点"}です。` : "AIの推奨は貴社です。"}<br>AIの点：貴社 ${esc(mine.score)} ／ 1位 ${esc(top.score)}</div></div>
      </section>
      <div class="rd-grid" style="grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);margin-bottom:16px">
        <section class="rd-card"><div class="rd-ch">${I("chart", 22)}<h2 style="font-size:18px">相見積の比較（${x.O.length}社）</h2><span class="rd-chs">AIの点の高い順</span></div>
          <div style="overflow-x:auto"><table class="rd-tbl"><thead><tr><th>順位</th><th>会社</th><th>合計</th><th>所要</th><th>有効期限</th><th>AIの点</th></tr></thead><tbody>${x.O.map((o, i) => `<tr style="${o.co === x.me ? "background:#FFF6EC" : ""}"><td><b style="font-size:18px">${i === 0 ? "👑" : i + 1}</b></td><td><b>${esc(o.co)}</b>${o.co === x.me ? ' <span class="rd-tag or">貴社</span>' : ""}${(o.tags || []).map((t) => ` <span class="rd-tag ${t === "最安" ? "gr" : "bl"}">${esc(t)}</span>`).join("")}</td><td><b>${yen(q(o).total)}</b>${i ? `<div style="font-size:12px;color:${q(o).total > q(top).total ? "var(--rd-crit)" : "var(--rd-good)"}">${q(o).total > q(top).total ? "+" : ""}${(((q(o).total - q(top).total) / q(top).total) * 100).toFixed(1)}%</div>` : ""}</td><td>${tt(o)}日</td><td>${esc(q(o).valid || "")}<div style="font-size:12px;color:var(--rd-ink3)">あと${esc(o.vd)}日</div></td><td><b>${esc(o.score)}</b></td></tr>`).join("")}</tbody></table></div></section>
        <section class="rd-card"><div class="rd-ch">${I("spark", 22)}<h2 style="font-size:18px">AI推奨の理由</h2><span class="rd-tag or" style="margin-left:auto;font-size:13px">推奨：${esc(x.lg.rec || top.co)}</span></div>
          <ul class="rd-ckl">${(x.lg.recWhy || []).slice(0, 4).map((t) => `<li style="align-items:flex-start;font-weight:600;line-height:1.6"><span class="ok" style="flex:none">${I("check", 16, 3)}</span><span>${esc(t)}</span></li>`).join("")}</ul>
          <div class="rd-ch" style="margin:16px 0 8px">${I("chart", 20)}<h2 style="font-size:16px">ギャップ分析（1位との差）</h2></div>
          <dl class="rd-kv" style="grid-template-columns:96px 1fr">${x.mi ? `<dt>価格差</dt><dd style="color:${dp > 0 ? "var(--rd-crit)" : "var(--rd-good)"}">${dp > 0 ? "+" : ""}${yen(dp)}（${dp > 0 ? "+" : ""}${(dp / q(top).total * 100).toFixed(1)}%）</dd><dt>日数差</dt><dd>${dd > 0 ? "+" : dd < 0 ? "−" : "±"}${Math.abs(dd)}日</dd><dt>有効期限</dt><dd>${dv > 0 ? "+" : dv < 0 ? "−" : "±"}${Math.abs(dv)}日</dd><dt>AIの点</dt><dd>${esc(mine.score)} ／ ${esc(top.score)}</dd>` : `<dt>2位との差</dt><dd>${x.O[1] ? yen(q(x.O[1]).total - q(mine).total) + " 安い・AIの点 " + esc(mine.score) + " ／ " + esc(x.O[1].score) : "—"}</dd>`}</dl></section>
      </div>
      <section class="rd-card" style="margin-bottom:18px"><div class="rd-ch">${I("target", 24)}<h2 style="font-size:20px">選ばれる工夫</h2><span class="rd-chs">（相見積の数字から出した目安です）</span></div>
        <div class="rd-grid" style="grid-template-columns:repeat(${Math.min(tips.length, 3)},minmax(0,1fr))">${tips.slice(0, 3).map((t) => `<div style="border:1px solid var(--rd-line);border-radius:16px;padding:16px;display:flex;gap:12px"><span class="rd-ti" style="width:46px;height:46px;border-radius:50%;background:var(--rd-or-soft);color:var(--rd-or2);display:flex;align-items:center;justify-content:center;flex:none">${I(t[0], 24)}</span><div><b style="font-size:16px">${esc(t[1])}</b><p style="margin:6px 0 0;font-size:13.5px;font-weight:600;line-height:1.6;color:#2C3B52">${esc(t[2])}</p></div></div>`).join("")}</div>
        ${dv < 0 || x.mi === 0 ? `<button type="button" class="rd-btn ghost" data-rdgo="frates" style="margin-top:12px">${I("db", 18)}レート管理で有効期限を更新する</button>` : ""}</section>`;
    $("[data-rdhero]", w).insertAdjacentElement("afterend", box);
    $("#rdaggsel", box).addEventListener("change", (e) => { RD.aggSel = +e.target.value; $$("[data-rdagg]", w).forEach((n) => n.remove()); aggSummary(w); });
    $$("[data-rdgo]", box).forEach((b) => b.addEventListener("click", () => goKey(b.dataset.rdgo)));
  }

  /* ───── 案件・出荷管理（デザイン案 d10）：状況ごとの列・選んだ案件・次のアクション ─────
     状況は、この画面の案件の欄（B/L・対応済み・荷主の状況）から。元の案件の欄はすべて下にそのまま */
  // 案件の行の「日付 ・ 積み港 → 国 ・ 品目」から区間を取り出す。区間の中にも「・」が入る書き方（21.87 の「ロサンゼルス（アメリカ）・香港」など）があるので、
  //   「 ・ 」（前後に空白）で区切った最初と最後の間を全部使う（No.356 の続き・11/12）
  //   21.87 の行は「日付 ・ 区間 ・ 品目」で、日付や品目が無い行は空のまま詰めるため、まず「→」のある区切りを区間とする
  function routeOf(t) {
    const seg = String(t || "").split(" ・ ").find((x) => x.indexOf("→") >= 0);
    if (seg) return seg.trim();
    const a = t.indexOf(" ・ "), b = t.lastIndexOf(" ・ ");
    if (a >= 0 && b > a) return t.slice(a + 3, b).trim();
    return (t.split("・")[1] || "").trim();
  }
  function caseInfo(w) {
    return $$("section.v33case", w).map((c, i) => {
      const h = $("h3", c); const no = (($(".v33mute", h) || {}).textContent || "").replace(/^案件\s*/, "").trim();
      const co = h ? h.childNodes[0] && h.childNodes[0].textContent.trim() : "";
      const t = c.textContent || "";
      const bl = !/B\/L 未登録/.test(t);
      const m = t.match(/対応済み\s*(\d+)\s*\/\s*(\d+)/);
      const done = m ? +m[1] : 0, all = m ? +m[2] : 0;
      const held = /仮押さえ/.test(t);
      const items = $$(".v33li", c).map((li) => ({ id: (($("b", li) || {}).textContent || "").trim(), st: ($$(".v33lv", li).map((x) => x.textContent.trim()).find((s) => /^荷主：/.test(s)) || "").replace(/^荷主：/, ""), route: routeOf((($(".v33li-m .v33mute", li) || {}).textContent || "")) }));
      const stage = all && done >= all ? "done" : bl ? "ship" : held ? "held" : "quote";
      return { i, el: c, co, no, bl, done, all, held, items, stage, route: (items[0] && items[0].route.trim()) || "" };
    });
  }
  RD.caseSel = RD.caseSel == null ? -1 : RD.caseSel;
  function casesKanban(w) {
    const C = caseInfo(w);
    if (!C.length) return;
    const COL = [["quote", "見積対応中", "mail"], ["held", "仮押さえ", "hand"], ["ship", "出荷手配（B/L 登録済み）", "ship"], ["done", "完了", "check"]];
    const col = (k) => C.filter((x) => x.stage === k);
    let sel = C.find((x) => x.i === RD.caseSel) || col("held")[0] || C[0];
    const box = document.createElement("div");
    box.className = "rd-x"; box.setAttribute("data-rdkb", "1");
    box.innerHTML = `
      <section class="rd-card" style="margin-bottom:16px;padding:14px 18px"><div class="rd-ch" style="margin:0">${I("chart", 22)}<h2 style="font-size:18px">案件の進行フロー</h2>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-left:12px">${COL.map((c, i) => `${i ? `<span style="color:#6B7B93;align-self:center">${I("chevR", 18, 2.4)}</span>` : ""}<span class="rd-tag ${c[0] === "held" ? "or" : c[0] === "done" ? "gr" : "bl"}" style="font-size:14px;padding:7px 14px">${I(c[2], 16)} ${esc(c[1])} ${col(c[0]).length}</span>`).join("")}</div></div></section>
      <section class="rd-card" style="margin-bottom:16px"><div class="rd-ch">${I("db", 22)}<h2 style="font-size:18px">案件一覧（状況ごと）</h2><span class="rd-chs">押すと、右下にその案件と次のアクションが出ます</span></div>
          <div class="rd-kbcols" style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px">${COL.map((c) => `<div><div style="font-size:13px;font-weight:800;padding:6px 8px;border-radius:10px;background:${c[0] === "held" ? "#FFF3E4" : c[0] === "done" ? "var(--rd-good-soft)" : "#EEF4FC"};margin-bottom:8px">${esc(c[1].replace(/（.*/, ""))} ${col(c[0]).length}</div>${col(c[0]).slice(0, 5).map((x) => `<button type="button" class="rd-li" data-rdkc="${x.i}" style="flex-direction:column;align-items:flex-start;gap:2px;padding:8px 10px;margin-bottom:6px;${x === sel ? "border-color:var(--rd-or);background:#FFF8F0" : ""}"><b style="font-size:13px;white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis">${esc(x.no)}</b><span style="font-size:12.5px;font-weight:700;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(x.co)}</span><span style="font-size:11.5px;color:var(--rd-ink3);max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(x.route)}</span></button>`).join("")}${col(c[0]).length > 5 ? `<div class="rd-note" style="margin:0">ほか ${col(c[0]).length - 5}件（下の一覧）</div>` : ""}${col(c[0]).length ? "" : `<div class="rd-note" style="margin:0">なし</div>`}</div>`).join("")}</div></section>
      <div class="rd-grid" style="grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);margin-bottom:18px">
        <section class="rd-card" id="rdkbsel"></section>
        <section class="rd-card rd-warm" id="rdkbnext"></section>
      </div>`;
    const hero = $("[data-rdhero]", w);
    const tiles = $("[data-rdcases]", w);
    (tiles || hero).insertAdjacentElement("afterend", box);
    const paint = () => {
      $$("[data-rdkc]", box).forEach((b) => { const on = +b.dataset.rdkc === sel.i; b.style.borderColor = on ? "var(--rd-or)" : ""; b.style.background = on ? "#FFF8F0" : ""; });
      const stLab = { quote: "見積対応中", held: "仮押さえ", ship: "出荷手配", done: "完了" }[sel.stage];
      $("#rdkbsel", box).innerHTML = `<div class="rd-ch">${I("ship", 22)}<h2 style="font-size:18px">案件 ${esc(sel.no)}</h2><span class="rd-tag ${sel.stage === "held" ? "or" : sel.stage === "done" ? "gr" : "bl"}">${esc(stLab)}</span></div>
        <dl class="rd-kv" style="grid-template-columns:96px 1fr"><dt>荷主</dt><dd title="${esc(sel.co)}">${esc(sel.co)}</dd><dt>区間</dt><dd title="${esc(sel.route)}">${esc(sel.route || "—")}</dd><dt>B/L</dt><dd class="${sel.bl ? "" : "miss"}">${sel.bl ? "登録済み" : "未登録"}</dd><dt>対応済み</dt><dd>${sel.done} / ${sel.all}件</dd><dt>依頼</dt><dd>${sel.items.length}件</dd></dl>
        <div class="rd-list" style="margin-top:10px">${sel.items.slice(0, 4).map((it) => `<div class="rd-li" style="cursor:default"><b style="font-size:12.5px;min-width:96px">${esc(it.id)}</b><span class="rd-lt" style="font-size:12.5px;font-weight:600">${esc(it.st)}</span></div>`).join("")}</div>
        <button type="button" class="rd-btn ghost" id="rdkbopen" style="width:100%;margin-top:10px">この案件の欄を開く（B/L・担当・状態を変える）</button>`;
      const acts = [];
      if (sel.held) acts.push([false, "荷主へ本予約の可否を確認する", "仮押さえの依頼があります"]);
      if (!sel.bl) acts.push([false, "B/L 番号・本船・ETD/ETA を登録する", "案件の欄から登録します"]);
      if (sel.all > sel.done) acts.push([false, `依頼の対応を進める（残り ${sel.all - sel.done}件）`, "依頼ごとに「担当・状態を変える」"]);
      if (!acts.length) acts.push([true, "この案件の対応はすべて完了しています", ""]);
      $("#rdkbnext", box).innerHTML = `<div class="rd-ch">${I("list", 22)}<h2 style="font-size:18px">次のアクション</h2></div>
        <ul class="rd-ckl">${acts.map((a) => `<li style="align-items:flex-start;line-height:1.5"><span class="${a[0] ? "ok" : "ng"}" style="flex:none">${I(a[0] ? "check" : "alert", 18)}</span><span><b style="font-size:14px">${esc(a[1])}</b>${a[2] ? `<br><small style="color:var(--rd-ink2);font-weight:600">${esc(a[2])}</small>` : ""}</span></li>`).join("")}</ul>
        <p class="rd-note">次のアクションは、案件の状態（仮押さえ・B/L・対応済み）から出しています。</p>`;
      $("#rdkbopen", box).addEventListener("click", () => { sel.el.scrollIntoView({ behavior: "smooth", block: "start" }); sel.el.style.boxShadow = "0 0 0 3px var(--rd-or)"; setTimeout(() => { sel.el.style.boxShadow = ""; }, 2400); });
    };
    paint();
    $$("[data-rdkc]", box).forEach((b) => b.addEventListener("click", () => { sel = C.find((x) => x.i === +b.dataset.rdkc) || sel; RD.caseSel = sel.i; paint(); }));
  }

  /* ───── 描いたあとの仕上げ ───── */
  function after(force) {
    try {
      buildSide();
      buildBar();
      if (locked()) return;
      const w = $("#well");
      if (!w) return;
      const k = curKey();
      const hz = $("[data-rdhero]", w);
      if (hz && hz.getAttribute("data-k") === k && !force) { clampLong(w); return; } // もう仕上げてある
      if (force && hz && hz.getAttribute("data-k") === k) {
        if (k === "dash:home" || k === "fhome") { clampLong(w); return; } // ホームは描き直しのときだけ組み直す
        $$(":scope > .rd-x", w).forEach((n) => { if (!n.matches("[data-rdhero]")) n.parentNode.removeChild(n); }); // 前に足した部品を外してから足し直す（元の部品は .rd-x の外）
      }
      if (isFwd()) {
        if (k === "fhome") { /* homeFwd は見張り（onWell）が描く */ }
        else {
          const h = HERO[k] || [k, ""];
          putHero(w, h[0], h[1]);
          if (!RD.skip[k]) {
            if (k === "finbox") finboxSummary(w);
            if (k === "frates") ratesSummary(w);
            if (k === "fcase") { casesSummary(w); casesKanban(w); }
            if (k === "fagg") aggSummary(w);
          }
        }
      } else {
        if (k === "dash:home") {
          let lv = null;
          try { lv = typeof aiLevel === "function" ? aiLevel() : null; } catch (e) { lv = null; } // eslint-disable-line no-undef
          const chip = lv ? `<button type="button" class="k-lvchip" data-rdk="ai" title="AI商社マンの成長レベル（押すと AI商社マンの画面へ）"><img src="${IMG}robot.png" alt="" style="width:40px;height:auto"><span><small>AI商社マンの成長</small><span style="font-weight:800">Lv.${esc(lv.lv)} ${esc(lv.stage)}</span></span><b>${esc(lv.pct)}<small style="display:inline;font-size:13px">%</small></b></button>` : "";
          // 11/12 三井さんのご意見：ホーム＝案件一覧（rd_case.js の RD.homeView）。無い版では前のホーム
          if (RD.homeView) putHero(w, "案件", "1行が1つの案件（バイヤーとの商談）です。相手の最新メッセージの順に並びます。行を押すと、やりとり・タスク・書類・商談の記録を1画面で見られます。☆でお気に入り、上のタブで絞り込みます。", chip);
          else putHero(w, greet(), "AI商社マンが、貴社の海外展開をサポートします。", chip);
          const cb = $(".k-lvchip", w); if (cb) cb.addEventListener("click", () => goKey("ai"));
          if (RD.homeView) { try { RD.homeView(w); } catch (e) { console.error("[rd] homeView", e); homeShipper(w); } } else homeShipper(w);
        }
        else {
          const h = HERO[k] || HERO[k.split(":")[0]] || [((G("PAGES") || []).find((p) => p.id === k.split(":")[0]) || {}).nm || "", ""];
          putHero(w, h[0], h[1]);
          if (!RD.skip[k]) {
            if (k === "dash:rep") reportShipper(w);
            if (k === "up") productSummary(w, "up");
            if (k === "item") productSummary(w, "item");
            if (k === "cty") ctySummary(w);
            if (k === "db") dbSummary(w);
          }
        }
      }
      if (RD.page[k]) { try { RD.page[k](w, k); } catch (e) { console.error("[rd] page " + k, e); } }
      clampLong(w);
    } catch (e) { console.error("[rd]", e); }
  }
  RD.after = after;
  RD.page = RD.page || {};      // 画面のキー → 足す部品（rd_pages2.js など）
  RD.skip = RD.skip || {};      // 画面のキー → このファイルの前の部品を使わない
  Object.assign(RD, { I, P, esc, num, $, $$, G, flag, isFwd, locked, IMG, heroHtml, putHero, clampLong, greet, dbThreads, stShort, stCls, mtxt, ago, yen, coName, buildSide });
  RD.goKey = goKey;
  RD.curKey = curKey;

  /* ───── 見張り：今のアプリの関数は差し替えず、#well・#nav の描き直しを見て仕上げる（No.360・11/11） ───── */
  function onWell() {
    if (RD._busy) return;
    RD._busy = 1;
    try {
      if (locked()) { buildSide(); buildBar(); return; }
      const want = RD._want; RD._want = null;
      if (isFwd()) {
        const c = G("fwdCur") || "finbox";
        if (!want) {
          if (RD._lastFwd === undefined) RD.fhome = c === "finbox"; // ログインの直後の着地はホーム
          else if (c !== RD._lastFwd) RD.fhome = false;              // アプリが自分で別の画面へ移った
        }
        RD._lastFwd = c;
        const w = $("#well");
        if (w && curKey() === "fhome" && !$(".rd-fhome-top", w)) { try { homeFwd(w); } catch (e) { console.error("[rd]", e); } }
      } else {
        const c = G("cur");
        if (!want && c === "dash" && RD._lastCur !== "dash") RD.dashMode = "home"; // アプリが自分でダッシュボードへ＝ホーム
        RD._lastCur = c;
      }
      RD.after();
    } catch (e) { console.error("[rd]", e); } finally { RD._busy = 0; }
  }
  RD.onWell = onWell;
  const mo = new MutationObserver(onWell);
  const moNav = new MutationObserver(() => { try { buildSide(); } catch (e) { /* 無視 */ } });
  function start() {
    const w = $("#well");
    if (w) mo.observe(w, { childList: true });
    const n = $("#nav");
    if (n) moNav.observe(n, { childList: true, subtree: true, characterData: true });
    buildSide(); buildBar();
    after();
    const bd = document.createElement("div");
    bd.id = "rdbadge";
    const local = /^(127\.0\.0\.1|localhost)$/.test(location.hostname);
    bd.innerHTML = local ? `刷新版プレビュー（手元だけ・本番には出ていません）<a href="current.html" target="_blank">今の版を開く</a>` : `刷新版（社内確認用・データは今の版と共通）<a href="https://standage-boueki2.github.io/boueki-cloud-trial/" target="_blank" rel="noopener">今の版を開く</a>`;
    document.body.appendChild(bd);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
  // ログインの直後など、遅れて描かれる分
  let tries = 0;
  const iv = setInterval(() => { tries++; if (!locked()) onWell(); if (tries > 40) clearInterval(iv); }, 500);
})();

} catch (e) { try { console.error("[rd] rd.js", e); } catch (x) { } }
/* ==== rd_pages2.js ==== */
try {
/* 貿易クラウドAI商社マン デザイン刷新 第2弾（手元だけ・2026-11-11）
   デザイナーの追加案に合わせた、荷主の画面ごとの部品。rd.js のあとに読む。
   ・数字はアプリが持っている本物だけ（増減の矢印や架空の件数は出さない）
   ・ボタンは今のアプリのボタン・関数を呼ぶだけ（同じ働き）。今の画面の中身は下にそのまま残す */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._p2) return;
  RD._p2 = 1;
  const { I, esc, $, $$, G, flag, IMG } = RD;
  const goKey = (k) => RD.goKey(k);

  /* ───── 道具 ───── */
  let AN = 0;
  const ACT = new Map();
  const act = (fn) => { const id = "k" + (++AN); ACT.set(id, fn); if (ACT.size > 4000) ACT.delete(ACT.keys().next().value); return `data-kact="${id}"`; };
  document.addEventListener("click", (e) => { const b = e.target.closest && e.target.closest("[data-kact]"); if (!b) return; const f = ACT.get(b.dataset.kact); if (f) { e.preventDefault(); e.stopPropagation(); try { f(e, b); } catch (x) { console.error("[rd2]", x); } } });
  RD.act = act;
  const orig = (root, sel) => $$(sel, root).filter((x) => !x.closest(".rd-x"));
  const byText = (root, re, sel) => orig(root, sel || "button, a, summary, [role=button]").find((x) => re.test((x.textContent || "").replace(/\s+/g, "")));
  const flash = (el) => { if (!el) return; el.scrollIntoView({ behavior: "smooth", block: "start" }); el.classList.add("k-flash"); setTimeout(() => el.classList.remove("k-flash"), 2200); };
  const clickText = (root, re, sel) => { const b = byText(root, re, sel); if (b) { b.click(); return true; } return false; };
  const today = () => { const d = new Date(), z = (n) => String(n).padStart(2, "0"); return d.getFullYear() + "-" + z(d.getMonth() + 1) + "-" + z(d.getDate()); };
  const dayDiff = (s) => { if (!s) return null; const a = new Date(String(s).slice(0, 10) + "T00:00:00"), b = new Date(today() + "T00:00:00"); return Math.round((a - b) / 864e5); };
  const jpDate = (d) => { const w = "日月火水木金土"; return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${w[d.getDay()]}）`; };
  const T = () => G("TEN") || {};
  const H = (o) => `<div class="k-h">${o.ic ? I(o.ic, 24) : ""}<h2${o.sz ? ` style="font-size:${o.sz}px"` : ""}>${esc(o.t)}</h2>${o.s ? `<span class="k-hs">${esc(o.s)}</span>` : ""}${o.r ? `<div class="k-hr">${o.r}</div>` : ""}</div>`;
  const card = (o) => `<section class="k-card ${o.cls || ""}"${o.id ? ` id="${o.id}"` : ""}${o.st ? ` style="${o.st}"` : ""}>${o.t ? H(o) : ""}${o.b || ""}</section>`;
  const tiles = (arr, n) => `<div class="k-tiles" style="--n:${n || arr.length}">${arr.map((t) => { const tag = t.go ? "button" : "div"; return `<${tag} ${t.go ? `type="button" ${act(t.go)}` : ""} class="k-tile ${t.cls || ""}"><span class="k-ti">${I(t.ic, 24)}</span><span style="min-width:0"><span class="k-tl">${esc(t.l)}</span><span class="k-tn">${t.n == null ? "—" : esc(t.n)}<small>${esc(t.u || "")}</small></span>${t.s ? `<span class="k-ts">${esc(t.s)}</span>` : ""}</span>${t.go ? `<span style="margin-left:auto;color:var(--k-bl)">${I("chevR", 18, 2.4)}</span>` : ""}</${tag}>`; }).join("")}</div>`;
  const steps = (arr) => `<div class="k-steps">${arr.map((s, i) => { const tag = s.go ? "button" : "div"; return `${i ? `<span class="k-arr">${I("chevR", 20, 2.4)}</span>` : ""}<${tag} ${s.go ? `type="button" ${act(s.go)}` : 'aria-current="step"'} class="k-step ${s.st || ""}${s.go ? "" : " k-nogo"}"><span class="k-sn">${s.st === "done" ? I("check", 15, 3) : i + 1}</span>${s.ic ? `<span class="k-si">${I(s.ic, 26)}</span>` : ""}<span style="min-width:0"><b>${esc(s.t)}</b>${s.s ? `<small>${esc(s.s)}</small>` : ""}</span></${tag}>`; }).join("")}</div>`;
  const put = (w, html) => { const h = $("[data-rdhero]", w); const box = document.createElement("div"); box.className = "rd-x rd-p2"; box.innerHTML = html; if (h) h.after(box); else w.prepend(box); return box; };
  const fold = (w, nodes, title, ic) => { nodes = nodes.filter(Boolean); if (!nodes.length) return null; const d = document.createElement("details"); d.className = "rd-old"; d.innerHTML = `<summary>${I(ic || "list", 20)}<span>${esc(title)}</span></summary><div class="rd-oldin"></div>`; nodes[0].before(d); const inn = $(".rd-oldin", d); nodes.forEach((n) => inn.appendChild(n)); return d; };
  const img64 = (a) => (a && a.b64 ? `data:${a.mime || "image/jpeg"};base64,${a.b64}` : "");
  const threads = () => { try { return RD.dbThreads(); } catch (e) { return []; } };
  const chosenCty = () => { const S = T().ctySel || {}; const c = (Array.isArray(S.chosen) ? S.chosen : []).map((x) => (typeof x === "string" ? x : x && (x.c || x.cty))).filter(Boolean); return c; };
  const recCty = () => { const S = T().ctySel || {}; return (Array.isArray(S.rec) ? S.rec : []).filter((x) => x && x.c); };
  const cssOnce = (id, css) => { if (document.getElementById(id)) return; const s = document.createElement("style"); s.id = id; s.textContent = css; document.head.appendChild(s); };
  cssOnce("rd2css", `html.rd .k-flash{box-shadow:0 0 0 3px var(--k-or)!important;transition:box-shadow .3s}
    html.rd .rd-p2{margin-bottom:6px}`);
  Object.assign(RD, { card, tiles, steps, put, fold, H, byText, clickText, flash, orig, img64, dayDiff, today, jpDate, chosenCty, recCty });

  /* 輸出のステップ（今どこ？）：登録データから「いまの段」を出す */
  function exportSteps() {
    const t = T(), th = threads();
    const st = (x) => RD.stShort(x.st);
    const S = [
      { t: "商品を登録", s: "輸出する商品を用意", ic: "box", done: !!t.item, k: "item" },
      { t: "市場・規制を調査", s: "売る国と決まりを確かめる", ic: "research", done: chosenCty().length > 0, k: "cty" },
      { t: "バイヤーに提案", s: "相手を探して連絡", ic: "send", done: th.length > 0 || (t.outreach || []).length > 0, k: "db" },
      { t: "見積・交渉", s: "条件をそろえる", ic: "doc", done: th.some((x) => /^(見積提示|契約交渉|取引中)$/.test(st(x))), k: "deal" },
      { t: "出荷・実行", s: "書類と出荷の手配", ic: "ship", done: (t.shipCases || []).length > 0 || (t.poCases || []).length > 0, k: "ops:doc" },
    ];
    const on = S.findIndex((x) => !x.done);
    return S.map((x, i) => ({ t: x.t, s: x.s, st: x.done ? "done" : i === on ? "on" : "", go: () => goKey(x.k) }));
  }
  RD.exportSteps = exportSteps;

  /* ───── AI商社マンに聞く（ai） ───── */
  RD.page.ai = (w) => {
    const t = T();
    let L = null;
    try { L = typeof aiLevel === "function" ? aiLevel() : null; } catch (e) { L = null; } // eslint-disable-line no-undef
    const ph = (t.assets && t.assets.ph && t.assets.ph[0]) || null;
    const S0 = t.ctySel || {}, cs = chosenCty(), rc = Array.isArray(S0.top) && S0.top.length ? S0.top.slice() : recCty().map((x) => x.c); // 候補は AI のおすすめの順（UAT 11/11）
    const ctys = (cs.length ? cs : rc.length ? rc : t.targets || []).slice(0, 3);
    const ask = (q) => { q = String(q || "").trim(); if (!q) return; try { askFree(q); } catch (e) { console.error(e); } setTimeout(() => { const c = document.getElementById("chat"); if (c) c.scrollIntoView({ behavior: "smooth", block: "center" }); }, 150); }; // eslint-disable-line no-undef
    const item = t.item || "この商品", c0 = ctys[0] || "販売先の国";
    const chips = [
      ["shield", "現地の規制・認証を調べる", `${c0}に「${item}」を輸出するときの規制・認証と必要な書類を教えて`],
      ["users", "有望なバイヤーを探す", `「${item}」に合う${c0}のバイヤーの探し方と、最初の連絡の文面を考えて`],
      ["coins", "最適な価格を相談する", `「${item}」の${c0}向けの輸出価格（FOB）の考え方と、見積の出し方を教えて`],
      ["box", "輸出の進め方を相談する", `「${item}」の輸出について、貴社のいまの準備状況（済んだこと・残り）を踏まえて、結論・次にやること・手順の順で教えて`],
    ];
    const can = [
      ["research", "市場・規制を調査", "需要・競合・現地の規制・認証を調べます", "cty"],
      ["users", "バイヤーを提案", "条件に合う輸入バイヤーを探し、候補を出します", "db"],
      ["doc", "見積・交渉を支援", "返信案と見積、条件の整理を手伝います", "msg"],
      ["ship", "出荷・実行をサポート", "必要な書類の判定と下書きを作ります", "ops:doc"],
    ];
    const box = put(w, `
      <div class="k-card" style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:16px;padding:12px 18px">
        ${I("box", 22)}<b style="font-size:15px">対象の商品・案件</b><span class="k-hs" style="font-size:12.5px;color:var(--k-ink3)">（いまの相談の前提）</span>
        <span style="width:1px;height:28px;background:var(--k-line)"></span>
        ${ph ? `<img src="${img64(ph)}" alt="" style="width:40px;height:40px;object-fit:cover;border-radius:10px;border:1px solid var(--k-line)">` : ""}
        <b style="font-size:17px">${esc(t.item || "商品が未登録です")}</b>
        ${t.co ? `<span class="k-tag bl">${esc(t.co)}</span>` : ""}
        ${ctys.map((c) => `<span class="k-chip">${flag(c, 16)}${esc(c)}${cs.length ? "" : '<small style="color:var(--k-ink3);font-weight:700">（候補）</small>'}</span>`).join("")}
        <button type="button" class="k-btn white" style="margin-left:auto;min-height:38px;padding:6px 14px" ${act(() => { const f = document.getElementById("pfind"); if (f) f.click(); else { const s = document.getElementById("psw"); if (s) s.focus(); } })}>${I("refresh", 16)}変更</button>
      </div>
      <section class="k-card warm" style="margin-bottom:18px;display:grid;grid-template-columns:150px 1fr;gap:18px;align-items:center">
        <img src="${IMG}robot.png" alt="" style="width:140px;height:auto;-webkit-mask-image:radial-gradient(ellipse 60% 60% at 50% 50%,#000 70%,transparent 100%);mask-image:radial-gradient(ellipse 60% 60% at 50% 50%,#000 70%,transparent 100%)">
        <div style="min-width:0">
          <h2 style="margin:0 0 12px;font-size:23px;font-weight:900;line-height:1.45"><span style="color:#E06A06">この商品</span>や<span style="color:#E06A06">輸出の進め方</span>について、AIに何でも聞いてみましょう！</h2>
          <form class="rd-ask" id="k-ask" style="border-color:var(--k-or-line)"><input id="k-askq" placeholder="例）シンガポールでの販売規制を教えて ／ この商品の見込みバイヤーを探して ／ 最適な価格を相談したい" autocomplete="off"><button type="submit" aria-label="質問する" style="width:auto;padding:0 18px;gap:6px;font-weight:800;font-size:15px">${I("send", 18, 2.2)}質問する</button></form>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;align-items:center"><span style="font-size:13px;font-weight:800;color:var(--k-ink2)">よくある質問（例）</span>${chips.map((c) => `<button type="button" class="k-chip" style="cursor:pointer;border-radius:999px" ${act(() => ask(c[2]))}>${I(c[0], 17)}${esc(c[1])}</button>`).join("")}</div>
        </div>
      </section>
      <div class="k-grid" style="grid-template-columns:minmax(0,2fr) minmax(0,1fr)">
        ${card({ ic: "hand", t: "AIがあなたの代わりにできること", s: "調査からバイヤー提案、見積・交渉の準備まで、輸出の実務をサポートします", b: `<div class="k-tiles" style="--n:4">${can.map((c) => `<button type="button" class="k-step big" ${act(() => goKey(c[3]))}><span class="k-si">${I(c[0], 40, 1.6)}</span><span><b>${esc(c[1])}</b><small>${esc(c[2])}</small></span></button>`).join("")}</div>` })}
        ${L ? card({ ic: "chart", t: "AI商社マンの成長", b: `<div style="display:flex;align-items:center;gap:14px"><img src="${IMG}robot.png" alt="" style="width:70px;height:auto;-webkit-mask-image:radial-gradient(circle,#000 58%,transparent 72%);mask-image:radial-gradient(circle,#000 58%,transparent 72%)"><div style="flex:1;min-width:0"><div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap"><span class="k-tag or" style="font-size:15px">Lv.${esc(L.lv)} ${esc(L.stage)}</span><b style="margin-left:auto;font-size:30px;font-weight:900;color:#E06A06">${esc(L.pct)}<small style="font-size:16px">%</small></b></div><div class="k-bar" style="margin:8px 0"><i style="width:${Math.max(0, Math.min(100, +L.pct || 0))}%"></i></div><small style="font-size:12.5px;color:var(--k-ink2);font-weight:600">${L.nextStage ? `次の「${esc(L.nextStage)}」まで あと ${esc(Math.max(0, (L.nextTh || 0) - (L.pct || 0)))}%` : ""}・一人前は 90%</small></div></div>
          <p style="margin:10px 0 8px;font-size:13.5px;color:var(--k-ink2);font-weight:600">やり取りから、商品・市場・バイヤーの理解が深まり、提案の精度が高まります。</p>
          <button type="button" class="k-link" ${act(() => flash($(".grow", w) || $("#sec-0", w)))}>成長の内訳と育て方を見る ${I("arr", 15)}</button>` }) : ""}
      </div>`);
    $("#k-ask", box).addEventListener("submit", (e) => { e.preventDefault(); const q = $("#k-askq", box); if (!q.value.trim()) { q.focus(); q.placeholder = "ここに質問を書いてから押してください（下の「よくある質問」を押しても聞けます）"; q.closest("form").classList.add("k-need"); setTimeout(() => q.closest("form").classList.remove("k-need"), 1600); return; } ask(q.value); q.value = ""; });
  };

  /* ───── 受信箱（inbox） ───── */
  RD.page.inbox = (w) => {
    const th = threads();
    const nego = th.filter((x) => /^(商談中|サンプル出荷|見積提示|契約交渉)$/.test(RD.stShort(x.st)));
    const cn = [...new Set(nego.map((x) => x.cty).filter(Boolean))];
    let todayN = null;
    try { const n = (notifCalc() || []).find((x) => x.cat === "today"); const m = n && String(n.t).match(/(\d+)件/); if (m) todayN = +m[1]; } catch (e) { /* 無視 */ } // eslint-disable-line no-undef
    const tabs = orig(w, ".v38ix button, .v33ix button, .v33tab").map((b) => ({ b, t: (b.textContent || "").replace(/\s+/g, " ").trim() }));
    const tabN = (re) => { const x = tabs.find((y) => re.test(y.t)); const m = x && x.t.match(/(\d+)/); return m ? +m[1] : null; };
    const appr = tabN(/確認・承認/), mine = tabN(/自分の番/);
    const goTab = (re) => { const x = tabs.find((y) => re.test(y.t)); if (x) { x.b.click(); setTimeout(() => flash($("#sec-1", w) || x.b), 60); } };
    const first = appr ? "確認・承認" : mine ? "自分の番" : "";
    put(w, `<section class="k-card" style="display:grid;grid-template-columns:auto 1fr minmax(260px,330px);gap:22px;align-items:center;margin-bottom:18px">
      <div style="display:flex;align-items:center;gap:12px">${I("cal", 34)}<div><b style="font-size:26px;font-weight:900;display:block">今日のまとめ</b><span style="font-size:13.5px;color:var(--k-ink2);font-weight:700">${esc(jpDate(new Date()))}</span></div></div>
      <ul class="k-ck" style="border-left:1px solid var(--k-line);padding-left:22px">
        <li>${I("list", 18)}<span>今日やること：<span class="k-tag or" style="font-size:14px">${todayN == null ? "—" : todayN + "件"}</span></span></li>
        <li>${I("hand", 18)}<span>商談の進捗：<span class="k-tag bl" style="font-size:14px">${nego.length}社</span> が商談中〜契約交渉${cn.length ? `（${esc(cn.join("・"))}）` : ""}</span></li>
        <li>${I("check", 18)}<span>確認・承認：<span class="k-tag ${appr ? "or" : "gr"}" style="font-size:14px">${appr == null ? "—" : appr + "件"}</span>（AI の案・承認の依頼）</span></li>
      </ul>
      <div style="padding:16px;border-radius:16px;background:linear-gradient(180deg,#FFF5EA,#FFFBF6);border:1px solid #F8D9B4">${first ? `<b style="font-size:15px;line-height:1.5;display:block;margin-bottom:10px">${I("spark", 18)} まずは「${esc(first)}」の ${esc(first === "確認・承認" ? appr : mine)}件から対応しましょう</b><button type="button" class="k-btn wide" ${act(() => goTab(first === "確認・承認" ? /確認・承認/ : /自分の番/))}>${esc(first)}を開く ${I("chevR", 18, 2.4)}</button>` : `<b style="font-size:15px">${I("check", 18)} いま急ぎの対応はありません</b>`}</div>
    </section>`);
  };

  /* ───── 今日やること（today） ───── */
  RD.page.today = (w) => {
    const th = threads();
    const stale = th.filter((x) => x.at && (Date.now() - x.at) / 864e5 >= 30 && RD.stShort(x.st) !== "失注" && RD.stShort(x.st) !== "取引中").slice(0, 3);
    const lost = th.filter((x) => RD.stShort(x.st) === "失注").length;
    const lr = $("#lr83tdw", w);
    put(w, `<section class="k-card" style="margin-bottom:18px;padding:14px 18px"><div class="k-h" style="margin-bottom:10px">${I("flag", 22)}<h2 style="font-size:18px">輸出のステップ</h2><span class="k-hs">（今どこ？）押すと、その画面へ</span></div>${steps(exportSteps())}</section>
      <div class="k-grid" style="grid-template-columns:minmax(0,1fr) minmax(0,1fr)">
        ${card({ ic: "clock", t: "停滞中の案件", s: "30日以上動きのない相手", r: stale.length ? `<span class="k-tag rd">${stale.length}件</span>` : "", b: stale.length ? `<div class="k-rows">${stale.map((x) => `<div class="k-row">${flag(x.cty, 18)}<span class="k-rt"><b>${esc(x.name)}</b><small>${esc(x.cty || "")}・${esc(RD.stShort(x.st))}</small></span><span class="k-tag rd">動きなし ${Math.floor((Date.now() - x.at) / 864e5)}日</span><button type="button" class="k-btn white k-mini" ${act(() => { try { openDMThread(x.id); } catch (e) { goKey("msg"); } })}>対応する ${I("chevR", 14, 2.4)}</button></div>`).join("")}</div>${lr ? `<button type="button" class="k-link" style="margin-top:10px" ${act(() => flash(lr))}>続けるか・失注にするかを決める ${I("arr", 15)}</button>` : ""}` : `<div class="k-empty">${I("check", 18, 3)} 止まっている相手はいません</div>` })}
        ${card({ ic: "chart", t: "失注の振り返り", s: "学んで次に活かす", b: `${tiles([{ ic: "doc", l: "失注した相手", n: lost, u: "社" }, { ic: "users", l: "やりとり中の相手", n: th.length, u: "社" }], 2)}<button type="button" class="k-btn ghost wide" style="margin-top:12px" ${act(() => lr ? flash(lr) : goKey("deal"))}>${I("doc", 18)}失注の振り返りを始める ${I("chevR", 16, 2.4)}</button>` })}
      </div>`);
  };

  /* ───── 商品情報（item）：商品の顔・データの充足度・節への移動 ───── */
  RD.skip.item = 1;
  const GROUPS = [
    ["基本情報", ["co", "coEn", "item", "itemEn", "cat", "sku", "hs", "origin"], "box"],
    ["価格・取引条件", ["priceRows", "moq", "term", "pay", "lead", "pol"], "coins"],
    ["成分・仕様", ["compRows", "dimRows", "shelf", "store", "ctn", "cert"], "research"],
    ["強み", ["strengths"], "star"],
  ];
  RD.page.item = (w) => {
    const t = T();
    let sc = null;
    try { sc = scoreOf(t); } catch (e) { sc = null; } // eslint-disable-line no-undef
    const filled = (sc && sc.filled) || [], miss = (sc && (sc.missing || [])) || [];
    const has = (k) => filled.some((x) => x.k === k), known = (k) => has(k) || miss.some((x) => x.k === k);
    const pct = sc ? Math.round(sc.pct) : null;
    const ph = (t.assets && t.assets.ph) || [];
    const hdr = (re) => orig(w, "h3, h2").find((h) => re.test(h.textContent || ""));
    const sec = [[/①|商品情報・強み/, "基本情報・強み", "box"], [/②|価格表/, "価格・寸法", "coins"], [/③|成分/, "成分・仕様", "research"], [/④|業種/, "業種ごとの項目", "list"]].map((x) => ({ h: hdr(x[0]), t: x[1], ic: x[2] })).filter((x) => x.h);
    const str0 = Array.isArray(t.strengths) && t.strengths[0] ? (Array.isArray(t.strengths[0]) ? t.strengths[0][0] : t.strengths[0]) : "";
    const missN = miss.length;
    put(w, `<section class="k-card" style="display:grid;grid-template-columns:200px minmax(0,1fr) minmax(280px,360px);gap:22px;align-items:center;margin-bottom:16px">
        <div style="width:200px;height:170px;border-radius:16px;overflow:hidden;background:#F1F5FA;display:flex;align-items:center;justify-content:center">${ph[0] ? `<img src="${img64(ph[0])}" alt="" style="width:100%;height:100%;object-fit:cover">` : I("box", 60, 1.4)}</div>
        <div style="min-width:0"><div class="k-chips" style="margin-bottom:6px">${t.cat ? `<span class="k-tag gr">${esc(t.cat)}</span>` : ""}<span class="k-tag ${pct >= 100 ? "gr" : "or"}">${I("check", 13, 3)}${pct >= 100 ? "登録済み" : "登録中"}</span>${ph.length ? `<span class="k-tag gy">写真 ${ph.length}枚</span>` : ""}</div>
          <h2 style="margin:0;font-size:28px;font-weight:900;line-height:1.3">${esc(t.item || "商品が未登録です")}</h2>
          ${t.itemEn ? `<div style="font-size:15px;font-weight:700;color:var(--k-ink2);margin:2px 0 6px">${esc(t.itemEn)}</div>` : ""}
          ${str0 ? `<p style="margin:0 0 10px;font-size:14px;font-weight:600;color:#2A3B54">${esc(str0)}</p>` : ""}
          <div class="k-chips">${t.origin ? `<span class="k-chip">${I("pin", 16)}${esc(t.origin)}</span>` : ""}${t.co ? `<span class="k-chip">${I("bldg", 16)}${esc(t.co)}</span>` : ""}${t.hs ? `<span class="k-chip">${I("list", 16)}HSコード ${esc(t.hs)}</span>` : ""}${t.sku ? `<span class="k-chip">${I("rate", 16)}品番 ${esc(t.sku)}</span>` : ""}</div></div>
        <div style="border-left:1px solid var(--k-line);padding-left:20px"><div class="k-h" style="margin-bottom:8px">${I("chart", 22)}<h2 style="font-size:18px">データの充足度</h2>${sc ? `<span class="k-tag or" style="margin-left:auto">必須 ${filled.length + missN}件中 ${filled.length}件</span>` : ""}</div>
          <div style="display:flex;gap:14px;align-items:center"><div class="k-ring" style="--p:${pct || 0};--size:118px"><span>${pct == null ? "—" : pct}<small>%</small></span></div>
          <ul class="k-ck" style="flex:1;min-width:0">${GROUPS.map((g) => { const ks = g[1].filter(known); const ng = ks.filter((k) => !has(k)); return ks.length ? `<li><span class="${ng.length ? "ng" : "ok"}">${I(ng.length ? "alert" : "check", 16, 2.6)}</span><span style="flex:1">${esc(g[0])}</span><b style="font-size:13px;color:${ng.length ? "#D25F00" : "var(--k-gr)"}">${ng.length ? `一部未入力（${ng.length}）` : "入力済み"}</b></li>` : ""; }).join("")}</ul></div></div>
      </section>
      ${sec.length ? `<div class="v33tabs" style="margin-bottom:16px">${sec.map((x) => `<button type="button" class="v33tab" ${act(() => flash(x.h.closest(".c") || x.h))}>${I(x.ic, 18)}${esc(x.t)}</button>`).join("")}</div>` : ""}`);
    const end = document.createElement("div");
    end.className = "rd-x";
    end.style.cssText = "text-align:center;margin:22px 0 8px";
    end.innerHTML = `<button type="button" class="k-btn big" ${act(() => goKey("cty"))}>${I("send", 20)}この商品で輸出の次のステップへ（市場・規制の調査）${I("chevR", 18, 2.4)}</button>`;
    w.appendChild(end);
  };

  /* ───── 販売先国の選定（cty）：AIの提案3か国・指標の比較・選んだ国 ───── */
  RD.skip.cty = 1;
  const AX = [["mkt", "市場性"], ["reg", "規制"], ["comp", "競合"], ["base", "拠点"]];
  const lvTxt = (k, v) => { v = +v || 0; if (k === "reg") return v >= 80 ? "通りやすい" : v >= 60 ? "ふつう" : "厳しい"; if (k === "comp") return v >= 80 ? "少ない" : v >= 60 ? "ふつう" : "多い"; return v >= 80 ? "高" : v >= 60 ? "中" : "低"; };
  function radar(rows) {
    const cx = 150, cy = 135, R = 100, n = AX.length, col = ["#F57C0F", "#1F6FD1", "#14995A"];
    const pt = (i, v) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / n, r = (R * Math.max(0, Math.min(100, v))) / 100; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
    let g = "";
    [25, 50, 75, 100].forEach((v) => { g += `<polygon points="${AX.map((_, i) => pt(i, v).join(",")).join(" ")}" fill="none" stroke="#E1E9F3" stroke-width="1"/>`; });
    AX.forEach((a, i) => { const [x, y] = pt(i, 100), [lx, ly] = pt(i, 122); g += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#E1E9F3"/><text x="${lx}" y="${ly + 4}" text-anchor="middle" font-size="13" font-weight="800" fill="#2A3B54">${a[1]}</text>`; });
    rows.forEach((r, j) => { g += `<polygon points="${AX.map((a, i) => pt(i, (r.sc || {})[a[0]] || 0).join(",")).join(" ")}" fill="${col[j]}" fill-opacity=".14" stroke="${col[j]}" stroke-width="2.2"/>`; });
    return `<svg viewBox="0 0 300 270" width="100%" style="max-width:320px;display:block;margin:auto" role="img" aria-label="主要指標の比較">${g}</svg><div class="k-chips" style="justify-content:center;margin-top:4px">${rows.map((r, j) => `<span style="display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:800"><i style="width:12px;height:12px;border-radius:3px;background:${col[j]}"></i>${esc(r.c)}</span>`).join("")}</div>`;
  }
  RD.page.cty = (w) => {
    // UAT（11/11）：カードの3か国は「AI商社マンのおすすめ」（ctySel.top）。総合点の順（ctySel.rec）と違うときは、その理由の欄を出す（今の版の v54ctyOrderBox と同じ中身）
    const S0 = T().ctySel || {}, all = recCty(), N = all.length, byAI = !!S0.ai;
    const topC = (Array.isArray(S0.top) ? S0.top : []).filter((c) => all.some((r) => r.c === c));
    const rec = (topC.length ? topC.map((c) => all.find((r) => r.c === c)) : all).slice(0, 3), ch = chosenCty();
    const rankOf = (c) => all.findIndex((r) => r.c === c) + 1;
    let O = null;
    try { O = byAI && typeof v54ctyOrderInfo === "function" ? v54ctyOrderInfo(S0) : null; } catch (e) { O = null; } // eslint-disable-line no-undef
    const whyOf = (r) => { try { return typeof v54ctyReason === "function" ? v54ctyReason(S0, r) : r.why || ""; } catch (e) { return r.why || ""; } }; // eslint-disable-line no-undef
    let W = null;
    try { W = typeof CTY_W !== "undefined" && CTY_W ? CTY_W : null; } catch (e) { W = null; } // eslint-disable-line no-undef
    W = W || { mkt: 35, reg: 25, comp: 20, base: 20 };
    const oNote = String((S0.ai && S0.ai.orderNote) || "").trim();
    // No.365（21.87）：今の版が総評の下に出す「FOB価格帯（登録の価格表）」の1行を、おすすめのカードにも同じ文で写す（今の版の行はそのまま残る）
    const fobEl = $$("[data-v87fob]", w).find((x) => !x.closest(".rd-x"));
    const fobT = fobEl ? fobEl.textContent.replace(/\s+/g, " ").trim() : "";
    const ai = byText(w, /おまかせ/);
    const boxes = () => orig(w, "input[data-ctypick]");
    const box = (c) => boxes().find((x) => x.dataset.ctypick === c);
    const picked = () => (ch.length ? ch.slice() : boxes().filter((x) => x.checked).map((x) => x.dataset.ctypick));
    const tst = (m) => { try { toast(m); } catch (e) { alert(m); } }; // eslint-disable-line no-undef
    // 選ぶ・外す（最大3か国）。確定済みなら「選び直す」で開いてからチェックをそろえる
    const setPick = (next) => {
      const apply = () => { boxes().forEach((x) => { if (!x.disabled) x.checked = next.indexOf(x.dataset.ctypick) >= 0; }); RD.after(true); };
      if (chosenCty().length) {
        try { ctyUnconfirm(); } catch (e) { const u = byText(w, /選び直す/); if (u) u.click(); } // eslint-disable-line no-undef
        setTimeout(apply, 0);
      } else apply();
    };
    const toggle = (c) => {
      const cur = picked();
      const b = box(c);
      if (b && b.dataset.v83ban) { tst(`「${c}」は開拓しない国です（会社の方針）。選べません`); return; }
      if (cur.indexOf(c) >= 0) { setPick(cur.filter((x) => x !== c)); return; }
      if (cur.length >= 3) {
        tst("販売先国は3か国まで選べます。先に、選択中の国のどれかを外してください（選択中の札の × か、カードの「選択中」を押すと外れます）");
        const sel = $("#k-ctysel", w);
        if (sel) { // トーストを見落としても分かるように、選択中の欄の中にも出す
          let n = $(".k-ctymsg", sel);
          if (!n) { n = document.createElement("p"); n.className = "k-ctymsg"; n.setAttribute("role", "alert"); sel.appendChild(n); }
          n.textContent = `「${c}」を選ぶには、先に選択中の国のどれかを × で外してください（販売先国は3か国まで）`;
          try { sel.scrollIntoView({ block: "nearest", behavior: "smooth" }); } catch (e) { /* 古いブラウザ */ }
          flash(sel);
        }
        return;
      }
      setPick(cur.concat([c]));
    };
    const confirmIt = () => {
      if (!picked().length) { tst("国を1〜3か国選んでください"); return; }
      const b = $$("button", w).find((x) => !x.closest(".rd-x") && /ctyConfirm/.test(x.getAttribute("data-onclick") || ""));
      if (b) b.click(); else { try { ctyConfirm(); } catch (e) { console.error(e); } } // eslint-disable-line no-undef
    };
    const st = [{ t: "商品を登録", ic: "box", st: T().item ? "done" : "", go: () => goKey("item") }, { t: "販売先国の選定", ic: "globe", st: ch.length ? "done" : "on" }, { t: "規制確認", ic: "shield", st: ch.length ? "on" : "", go: () => goKey("ops:reg") }, { t: "提案準備", ic: "send", go: () => goKey("deck") }];
    const pk = picked();
    const isSel = (c) => pk.indexOf(c) >= 0;
    const selList = pk;
    put(w, `<section class="k-card" style="margin-bottom:16px;padding:12px 16px">${steps(st)}</section>
      ${rec.length ? `<div class="k-grid" style="grid-template-columns:minmax(0,1.75fr) minmax(0,1fr)">
        ${card({ ic: "spark", t: byAI ? "AI商社マンのおすすめ 3か国" : "総合点の上位 3か国", r: `<span class="k-tag or">${I("spark", 13)}${byAI ? "総合点に、商品の特性を加えて選びました" : "総合点の高い順（AI商社マンの判断の前）"}</span>${O ? `<button type="button" class="k-link" style="margin-left:8px" ${act(() => flash($("#k-ctyorder", w)))}>総合点の順とちがう理由 ${I("arr", 14)}</button>` : ""}`, cls: "warm", b: `<div class="k-tiles" style="--n:${rec.length}">${rec.map((r, i) => { const s = r.sc || {}; const on = isSel(r.c); return `<div class="k-card" style="padding:16px;${i === 0 ? "border:2px solid var(--k-or);" : ""}position:relative">${i === 0 ? `<span class="k-tag orf" style="position:absolute;right:12px;top:-12px">${byAI ? "最もおすすめ" : "総合点が最も高い"}</span>` : ""}
            <span class="k-tag ${i === 0 ? "orf" : "gy"}" style="font-size:13px">${byAI ? `おすすめ ${i + 1}` : `総合 ${rankOf(r.c)}位`}</span><div style="display:flex;align-items:center;gap:8px;margin-top:8px;min-width:0">${flag(r.c, 24)}<b style="font-size:20px;font-weight:900;line-height:1.3">${esc(r.c)}</b>${ch.indexOf(r.c) >= 0 ? '<span class="k-tag gr">確定</span>' : ""}</div>
            <div style="margin:10px 0 2px;font-size:40px;font-weight:900;color:#E06A06;line-height:1">${esc(Math.round(s.total || 0))}<small style="font-size:16px;color:var(--k-ink3)">/100</small></div>
            <div class="k-ctyrank">総合点の順位：<b>${N}か国中 ${rankOf(r.c)}位</b></div>
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-bottom:12px">${AX.map((a) => `<div style="display:flex;justify-content:space-between;align-items:center;gap:4px;padding:6px 10px;border-radius:10px;background:#F4F8FD;white-space:nowrap" title="${a[1]}：${esc(lvTxt(a[0], s[a[0]]))}"><small style="font-size:12.5px;font-weight:800;color:var(--k-ink2)">${a[1]}</small><b style="font-size:14px;color:${(s[a[0]] || 0) >= 80 ? "var(--k-gr)" : (s[a[0]] || 0) >= 60 ? "var(--k-am)" : "var(--k-rd)"}">${esc(Math.round(s[a[0]] || 0))}</b></div>`).join("")}</div>
            ${r.why ? `<p style="margin:0 0 10px;font-size:12.5px;font-weight:600;color:#2A3B54;line-height:1.6;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden" title="${esc(r.why)}">${esc(r.why)}</p>` : ""}
            <button type="button" class="k-btn ${on ? "" : "white"} wide" data-rdcty="${esc(r.c)}" title="${on ? "押すと外します" : "押すと選びます（3か国まで）"}" ${act(() => toggle(r.c))}>${I(on ? "check" : "plus", 18, 2.6)}${on ? "選択中（押すと外す）" : "選択する"}</button></div>`; }).join("")}</div>${fobT ? `<p class="k-ctyfob" data-rdfob="1">${I("chart", 16, 2.4)}<span>${esc(fobT)}</span></p>` : ""}` })}
        ${card({ ic: "chart", t: "主要指標の比較", b: radar(rec) + `<table class="rd-tbl" style="margin-top:10px"><thead><tr><th>国</th><th style="text-align:right">総合スコア</th><th style="text-align:right">総合点の順位</th></tr></thead><tbody>${rec.map((r) => `<tr><td>${flag(r.c, 16)} <b>${esc(r.c)}</b></td><td style="text-align:right"><b style="font-size:22px;color:#E06A06">${esc(Math.round((r.sc || {}).total || 0))}</b></td><td style="text-align:right;font-weight:800">${N}か国中 ${rankOf(r.c)}位</td></tr>`).join("")}</tbody></table><p class="rd-note" style="margin-top:8px">点数は0〜100点の目安（高いほど有利）。配点は市場性${esc(W.mkt)}・規制${esc(W.reg)}・競合${esc(W.comp)}・拠点${esc(W.base)}。${byAI ? "おすすめは、AI商社マンが点数に加えて商品の特性で決めています。" : ""}</p>` })}
      </div>
      ${O ? `<section class="k-card" id="k-ctyorder" style="margin-bottom:18px;border-left:5px solid var(--k-or)">
        ${H({ ic: "bulb", t: "総合点の順と、おすすめがちがう理由", s: "（数字とおすすめが食い違って見えるときの説明）" })}
        <p class="k-ctyex">総合点は、4つの観点の点数を配点（市場性${esc(W.mkt)}・規制${esc(W.reg)}・競合${esc(W.comp)}・拠点${esc(W.base)}）で足し合わせた目安です。おすすめの3か国は、AI商社マンがこの点数に加えて、商品の特性（成分・価格帯・強み・認証・賞味期限など）に照らして選んでいます。</p>
        ${oNote ? `<p class="k-ctyex"><b>AI商社マンの説明：</b>${esc(oNote)}</p>` : ""}
        <div class="k-ctyord">
          ${O.lower.length ? `<div><h4>${I("check", 16, 3)}総合点は低めでも、おすすめに入れた国</h4>${O.lower.map((r) => `<div class="k-ctyrow">${flag(r.c, 20)}<b>${esc(r.c)}</b><span class="k-tag gy">総合 ${esc(Math.round(r.sc.total))}点・${rankOf(r.c)}位</span><p>${esc(whyOf(r))}</p></div>`).join("")}</div>` : ""}
          ${O.higher.length ? `<div><h4>${I("alert", 16, 2.4)}総合点は高くても、おすすめに入れなかった国</h4>${O.higher.map((r) => { const on = isSel(r.c); return `<div class="k-ctyrow">${flag(r.c, 20)}<b>${esc(r.c)}</b><span class="k-tag gy">総合 ${esc(Math.round(r.sc.total))}点・${rankOf(r.c)}位</span>${ch.indexOf(r.c) >= 0 ? '<span class="k-tag gr">確定</span>' : ""}<button type="button" class="k-btn ${on ? "" : "white"} k-mini" data-rdcty="${esc(r.c)}" title="${on ? "押すと外します" : "押すと選びます（3か国まで）"}" ${act(() => toggle(r.c))}>${I(on ? "check" : "plus", 14, 2.6)}${on ? "選択中（外す）" : "選択する"}</button><p>${esc(whyOf(r))}</p></div>`; }).join("")}</div>` : ""}
        </div>
        <p class="rd-note">おすすめに入れなかった国も選べます（販売先国は3か国まで）。すべての国の点数は、このページの下の表にあります。</p>
      </section>` : ""}
      <section class="k-card" id="k-ctysel" style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:18px">
        <span class="k-ck">${I("check", 22, 3)}</span><b style="font-size:16px">${ch.length ? "確定した販売先国" : "選択中の販売先国"}</b><b style="font-size:30px;color:#E06A06;font-weight:900">${selList.length}</b><b>/ 3 か国</b>
        <div class="k-chips">${selList.map((c) => `<span class="k-chip">${flag(c, 16)}${esc(c)}<button type="button" class="k-chipx" aria-label="${esc(c)}を外す" title="外す" ${act(() => toggle(c))}>${I("x", 14, 2.6)}</button></span>`).join("") || '<span class="k-hs">まだ選んでいません（カードの「選択する」で1〜3か国）</span>'}</div>
        ${ch.length
          ? `<span style="margin-left:auto;display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="k-btn white" ${act(() => setPick(ch.slice()))}>${I("edit", 18)}選び直す</button><button type="button" class="k-btn big" ${act(() => goKey("ops:reg"))}>${I("chevR", 20, 2.6)}確定した国で次へ（規制確認）</button></span>`
          : `<button type="button" class="k-btn big" style="margin-left:auto" ${selList.length ? "" : "disabled"} ${act(confirmIt)}>${I("check", 20, 2.6)}${selList.length ? `この${selList.length}か国で確定する` : "国を選ぶと確定できます"}</button>`}
      </section>` : card({ ic: "spark", t: "AIが有望な販売先国を提案します", cls: "warm", b: `<div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap"><p style="margin:0;flex:1;min-width:260px;font-size:15px;font-weight:700;color:#2A3B54;line-height:1.8">まだ分析していません。AI商社マンが、規制・市場・競合・拠点のデータから<b style="color:#E06A06">おすすめの3か国</b>を選びます。</p>${ai ? `<button type="button" class="k-btn big" ${act(() => ai.click())}>${I("spark", 20)}AI商社マンにおまかせ（1クリック）</button>` : ""}</div>` })}`);
  };

  /* ───── 外国語の営業資料（deck）：準備の状況・項目・生成 ───── */
  RD.page.deck = (w) => {
    const s0 = RD.secBy(w, /納品レベルチェック/) || $("#sec-0", w), s3 = RD.secBy(w, /営業資料を作る/) || $("#sec-3", w);
    if (!s0) return;
    // 今の画面の「納品レベルチェック」の項目と数をそのまま使う（数を合わせる）
    const items = $$(".dk3-gi", s0).map((g) => { const b = $("b", g); const n = b ? b.textContent.trim() : ""; return { el: g, n: n.replace(/（推奨）$/, ""), rec: /（推奨）$/.test(n) || g.classList.contains("rec"), ok: g.classList.contains("ok"), how: (($(".nn", g) || {}).textContent || "").trim() }; }).filter((x) => x.n);
    if (!items.length) return;
    const mt = (s0.textContent || "").replace(/\s+/g, "");
    const mReq = mt.match(/必須(\d+)\/(\d+)/), mAll = mt.match(/全体(\d+)\/(\d+)/);
    const reqOk = mReq ? +mReq[1] : items.filter((x) => !x.rec && x.ok).length, reqN = mReq ? +mReq[2] : items.filter((x) => !x.rec).length;
    const okN = mAll ? +mAll[1] : items.filter((x) => x.ok).length, allN = mAll ? +mAll[2] : items.length;
    const req = items.filter((x) => !x.rec), rec = items.filter((x) => x.rec);
    const recOk = rec.filter((x) => x.ok).length;
    const pct = allN ? Math.round((okN / allN) * 100) : 0, allReq = reqOk >= reqN;
    const nx = (($(".v84m-nx b", s0) || {}).textContent || "").trim();
    const aiFill = () => { const b = document.getElementById("dk3wiz"); if (b) b.click(); else flash(s0); };
    const siteFill = () => clickText(w, /公式サイト/) || flash(RD.secBy(w, /ロゴ・商品写真/) || $("#sec-1", w));
    const fix = (x) => { if (x.el.matches("[data-dk3fix]")) x.el.click(); else { const d = $("details.rd-old", w); if (d) d.open = true; flash(x.el); } };
    const it = (x) => `<div class="k-it"><span style="color:${x.ok ? "var(--k-gr)" : x.rec ? "var(--k-bl)" : "#D25F00"}">${I(x.ok ? "check" : x.rec ? "plus" : "alert", 20, 2.6)}</span><span style="min-width:0"><b>${esc(x.n)}</b>${!x.ok && x.how ? `<small>${esc(x.how)}</small>` : ""}</span><span class="k-st ${x.ok ? "ok" : "ng"}">${x.ok ? "入力済み" : "未入力"}</span>${x.ok ? "<span></span>" : `<button type="button" class="k-btn ghost k-mini" ${act(() => fix(x))}>${I("edit", 14)}入力する</button>`}</div>`;
    put(w, `<section class="k-card" style="margin-bottom:16px;padding:12px 16px">${steps([{ t: "情報の充実度をチェック", s: "（この画面の上）", ic: "list", st: "on" }, { t: "不足情報を補う", ic: "edit", st: okN >= allN ? "done" : "", go: aiFill }, { t: "外国語の営業資料を生成", ic: "slides", go: () => flash(s3) }])}</section>
      <div class="k-grid" style="grid-template-columns:minmax(0,1.8fr) minmax(0,1fr)">
        <div style="min-width:0">
          <section class="k-card" style="display:flex;align-items:center;gap:22px;margin-bottom:18px;flex-wrap:wrap">
            <div class="k-ring" style="--p:${pct};--size:150px"><span><small>完成度</small>${pct}<small>%（${okN}/${allN}項目）</small></span></div>
            <div style="flex:1;min-width:240px"><h2 style="margin:0 0 6px;font-size:23px;font-weight:900;color:${allReq ? "var(--k-gr)" : "#D25F00"}">${allReq ? `${I("check", 24, 3)} 資料生成の準備が整っています！` : `あと ${reqN - reqOk} 項目で営業資料を作成できます`}</h2>
              <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#2A3B54">${allReq ? "必須項目はすべて入力済みです。推奨項目を足すほど、ページが増えて説得力が上がります。" : "下のオレンジ色の「未入力」の項目を入力すると、営業資料を作れるようになります。"}${nx ? `<br><b style="color:#C25600">次は：${esc(nx)}</b>` : ""}</p>
              <div class="k-chips"><span class="k-chip" style="background:#FFF4E8;border-color:var(--k-or-line)">${I("check", 16, 3)}必須項目 <b style="color:#D25F00">${reqOk} / ${reqN}</b></span><span class="k-chip" style="background:#F2F8FF;border-color:var(--k-bl-line)">${I("star", 16)}推奨項目 <b style="color:var(--k-bl)">${recOk} / ${rec.length}</b></span></div></div>
          </section>
          ${card({ ic: "list", t: "情報の入力状況", s: "（資料に掲載する項目・上の数と同じ）", b: `<div class="k-items"><div class="k-ig"><div class="k-igh req">必須<small>資料の基本情報</small></div><div>${req.map(it).join("")}</div></div>${rec.length ? `<div class="k-ig"><div class="k-igh rec">推奨<small>あると、より魅力が伝わる</small></div><div>${rec.map(it).join("")}</div></div>` : ""}</div>` })}
        </div>
        <div style="min-width:0">
          ${card({ ic: "spark", t: "不足している情報をかんたんに補完", b: `<div style="display:grid;gap:10px"><button type="button" class="k-row" ${act(aiFill)}><span style="color:var(--k-or)">${I("spark", 26)}</span><span class="k-rt"><b>AI商社マンと埋める</b><small>不足項目の下書きを AI が作ります</small></span>${I("chevR", 18, 2.4)}</button><button type="button" class="k-row" ${act(siteFill)}><span style="color:var(--k-bl)">${I("link", 26)}</span><span class="k-rt"><b>公式サイトから取り込み</b><small>会社情報・商品写真を Web サイトから</small></span>${I("chevR", 18, 2.4)}</button></div>` })}
          ${card({ ic: "bulb", t: "より良い資料にするためのポイント", b: `<ul class="k-ck"><li class="ok">${I("check", 16, 3)}<span>商品の強みは、できるだけ具体的な数値や実績で書きましょう</span></li><li class="ok">${I("check", 16, 3)}<span>写真は商品の特徴がわかる高品質な画像を3枚以上入れましょう</span></li><li class="ok">${I("check", 16, 3)}<span>認証・規格（ISO・HACCP など）があると、海外のバイヤーに安心感を与えられます</span></li></ul>` })}
          <button type="button" class="k-btn big wide" ${act(() => flash(s3))}>${I("slides", 22)}外国語の営業資料を生成する ${I("arr", 20, 2.4)}</button>
          <p class="rd-note" style="text-align:center">${allReq ? "下の「営業資料を作る」で、言語と相手の国を選んで作ります。" : "必須の項目がそろうと作れます。"}</p>
        </div>
      </div>`);
    fold(w, [s0], "詳しい点検（これまでの「納品レベルチェック」の表示・同じ項目）", "list");
  };

  /* ───── 商談・バイヤー（deal） ───── */
  RD.page.deal = (w) => {
    const th = threads(), c = (re) => th.filter((x) => re.test(RD.stShort(x.st))).length;
    const rec = byText(w, /商談を記録する/);
    const cmpB = byText(w, /以前との違い/);
    if (cmpB) cmpB.style.display = "none"; // 引き算：営業説明用の比較
    put(w, `<section class="k-card" style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;margin-bottom:16px;padding:14px 20px">
        <div style="display:flex;align-items:center;gap:8px">${I("chart", 24)}<b style="font-size:18px">商談の状況</b><span class="k-hs">（やり取り中の相手）</span></div>
        ${[["hand", "商談中", c(/^(商談中|サンプル出荷)$/), "bl"], ["doc", "提案済み（見積提示）", c(/^見積提示$/), "or"], ["target", "受注見込み（契約交渉）", c(/^契約交渉$/), "pu"], ["check", "取引中", c(/^取引中$/), "gr"]].map((x) => `<span style="width:1px;height:40px;background:var(--k-line)"></span><div style="display:flex;align-items:center;gap:10px"><span style="color:var(--k-${x[3]})">${I(x[0], 28)}</span><div><small style="display:block;font-size:13px;font-weight:800;color:#2A3B54">${esc(x[1])}</small><b style="font-size:28px;font-weight:900">${x[2]}</b><b> 社</b></div></div>`).join("")}
      </section>
      <div class="k-ai"><img src="${IMG}robot.png" alt=""><div><span class="k-tag orf" style="margin-bottom:4px">次のアクション</span><b style="display:block">商談を記録して、商談の進み具合を更新しましょう！</b><span class="k-ais">${I("check", 14, 3)} バイヤーの反応を記録 → ${I("check", 14, 3)} 提案の内容を登録 → ${I("check", 14, 3)} 受注見込みに更新</span></div>${rec ? `<button type="button" class="k-btn big" ${act(() => rec.click())}>${I("plus", 20, 2.6)}商談を記録する</button>` : ""}</div>`);
  };

  /* ───── 規制を調べる（ops:reg）：選択中の輸出先 ───── */
  RD.page["ops:reg"] = (w) => {
    const ch = chosenCty(), tg = T().targets || [];
    const L = ch.length ? ch : tg;
    put(w, `<section class="k-card" style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:16px;padding:12px 18px">${I("pin", 22)}<b style="font-size:16px">${ch.length ? "選択中の輸出先（仕向け国）" : "進出希望国（まだ販売先国は確定していません）"}</b><div class="k-chips">${L.map((c) => `<span class="k-chip">${flag(c, 16)}${esc(c)}</span>`).join("")}</div><span class="k-hs">計 <b style="font-size:20px;color:#E06A06">${L.length}</b> か国</span><button type="button" class="k-btn white k-mini" style="margin-left:auto" ${act(() => goKey("cty"))}>${I("edit", 14)}輸出先を変更</button></section>`);
  };

  /* ───── やりとり（msg）：まずやること・メールの取り込み・概要 ───── */
  RD.page.msg = (w) => {
    const th = threads();
    const lastW = (x) => (x.last && x.last.w) || "";
    const need = th.filter((x) => lastW(x) === "by" && !/^(失注|取引中)$/.test(RD.stShort(x.st))).length;
    const wait = th.filter((x) => lastW(x) === "me").length;
    const nego = th.filter((x) => /^(商談中|サンプル出荷|見積提示|契約交渉)$/.test(RD.stShort(x.st))).length;
    const quote = th.filter((x) => /^(見積提示|契約交渉)$/.test(RD.stShort(x.st))).length;
    const imp = byText(w, /メールを取り込む/);
    const list = orig(w, ".g2")[0];
    put(w, `<div class="k-grid" style="grid-template-columns:minmax(0,2fr) minmax(0,1fr)">
        ${card({ ic: "check", t: "まずやること", s: "新しいメッセージを確認し、必要な対応を進めましょう", b: steps([{ t: `返信が要るメッセージを確認（${need}件）`, ic: "mail", st: need ? "on" : "done", go: () => flash(list) }, { t: "返信・共有・社内連携", s: "（対応を進める）", ic: "share", go: () => flash(list) }, { t: "対応を完了にする", s: "（状況を更新）", ic: "check", go: () => flash(list) }]) })}
        ${card({ ic: "mail", t: "メールを取り込む", s: "取引先とのメールを取り込んで整理します", cls: "warm", b: imp ? `<button type="button" class="k-btn wide" ${act(() => imp.click())}>${I("upload", 18)}メールを取り込む</button>` : `<div class="k-empty">この画面では使えません</div>` })}
      </div>
      ${card({ ic: "inbox", t: "受信箱の概要", s: "今の状況がすぐわかります（直接連絡のやりとり）", st: "margin-bottom:18px", b: tiles([{ ic: "alert", l: "要対応（相手から返信）", n: need, u: "件", cls: need ? "hot" : "", go: () => flash(list) }, { ic: "clock", l: "返信待ち", n: wait, u: "件", go: () => flash(list) }, { ic: "chat", l: "商談中〜契約交渉", n: nego, u: "件", cls: "gr", go: () => goKey("deal") }, { ic: "doc", l: "見積・契約の段階", n: quote, u: "件", cls: "or", go: () => goKey("deal") }]) })}`);
  };

  /* ───── ドキュメント（docs） ───── */
  RD.page.docs = (w) => {
    // 今の版の「アップロード」は <label> の中の隠れたファイル選択（#d30up）＝そのファイル選択を開く（11/11 の総点検で、押しても反応しなかった）
    const upIn = $("#d30up", w) || orig(w, "input[type=file]")[0];
    const up = upIn ? { click: () => upIn.click() } : byText(w, /アップロード/, "button, a, label"), ln = byText(w, /リンクを登録/), rq = byText(w, /提出を依頼/);
    const wrap = $("#d30wrap", w);
    const vis = {};
    if (wrap) { const ths = $$("th", wrap).map((x) => (x.textContent || "").trim()); const ci = ths.findIndex((x) => /公開範囲/.test(x)); if (ci >= 0) $$("tbody tr", wrap).forEach((tr) => { const td = tr.children[ci]; const v = td ? (td.textContent || "").replace(/\s+/g, "").trim() : ""; if (v) vis[v] = (vis[v] || 0) + 1; }); }
    const visE = Object.entries(vis);
    put(w, `<div class="k-grid" style="grid-template-columns:minmax(0,2fr) minmax(0,1fr)">
        ${card({ ic: "check", t: "このページでできること", s: "書類の登録・依頼・共有を、かんたんに行えます", b: steps([{ t: "ファイルをアップロード", s: "PCから書類を登録", ic: "upload", st: "on", go: () => up && up.click() }, { t: "リンクを登録", s: "クラウド等の共有リンク", ic: "link", go: () => ln && ln.click() }, { t: "提出を依頼", s: "社内外に書類を依頼", ic: "send", go: () => rq && rq.click() }, { t: "共有・公開を設定", s: "公開範囲を管理", ic: "users", go: () => flash(wrap) }]) })}
        <section class="k-card warm" style="border-style:dashed;border-width:2px;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px">${I("upload", 44, 1.6)}<b style="font-size:20px;font-weight:900">ファイルをアップロード</b><span class="k-hs">PDF・Excel・Word・画像など（1件 20MB まで）</span><button type="button" class="k-btn" ${act(() => up && up.click())}>${I("folder", 18)}アップロードする</button></section>
      </div>
      ${visE.length ? card({ ic: "chart", t: "公開範囲の状況", s: `（${visE.reduce((a, b) => a + b[1], 0)}件）`, st: "margin-bottom:18px", b: tiles(visE.slice(0, 4).map(([k, n], i) => ({ ic: /社外|共有/.test(k) ? "share" : /非公開|自分/.test(k) ? "lock" : "users", l: k, n, u: "件", cls: ["gr", "", "or", "pu"][i] }))) }) : ""}`);
  };

  /* ───── 契約書関連（legal）：3つの流れ ───── */
  RD.page.legal = (w) => {
    const c1 = $("#legconsult", w), g2 = orig(w, ".g2")[0];
    const c2 = g2 && g2.children[0], c3 = g2 && g2.children[1];
    put(w, card({ ic: "check", t: "契約書対応の3つの流れ", s: "状況に合わせて、次のいずれかを選んで進めましょう", st: "margin-bottom:18px", b: steps([{ t: "AI法務に相談する", s: "契約の内容・リスク・進め方など、まずは気軽に相談", ic: "chat", st: "on", go: () => flash(c1) }, { t: "ひな型が来ない → AI法務が起草", s: "相手からドラフトがない場合", ic: "edit", go: () => flash(c2 || g2) }, { t: "契約書をチェックに出す", s: "届いた契約書のリスク・修正点を AI が確認", ic: "shield", go: () => flash(c3 || g2) }]) }));
  };

  /* ───── タスク・進行（task）：状況・次にやること ───── */
  RD.page.task = (w) => {
    let all = [];
    try { all = (taskStats() || {}).all || []; } catch (e) { all = []; } // eslint-disable-line no-undef
    if (!all.length) return;
    const td = today();
    const open = all.filter((x) => !/^(完了|中止)$/.test(x.st));
    const over = open.filter((x) => x.e && x.e < td);
    const late = open.filter((x) => x.st === "未着手" && x.s && x.s < td);
    const in7 = open.filter((x) => { const d = RD.dayDiff(x.e); return d != null && d >= 0 && d <= 7; });
    const done = all.filter((x) => x.st === "完了").length, doing = all.filter((x) => x.st === "対応中").length;
    const rate = all.length ? Math.round((done / all.length) * 100) : 0;
    const pri = open.slice().sort((a, b) => (a.e || "9") < (b.e || "9") ? -1 : 1).slice(0, 5);
    const listC = orig(w, ".c").find((c) => /タスク（/.test(c.textContent || ""));
    const ph = orig(w, ".ph")[0];
    const btns = ph ? $$("button", ph).filter((b) => /新規作成|まとめて作成|AIにタスク|定型セット/.test(b.textContent || "")) : [];
    const box = put(w, `${card({ ic: "cal", t: "タスク全体の状況", s: "（すべての案件）", st: "margin-bottom:16px", b: tiles([{ ic: "list", l: "総タスク数", n: all.length, u: "件" }, { ic: "refresh", l: "対応中", n: doing, u: "件" }, { ic: "check", l: "完了", n: done, u: "件", cls: "gr" }, { ic: "alert", l: "期限切れ", n: over.length, u: "件", cls: over.length ? "rd" : "" }, { ic: "clock", l: "期限7日以内", n: in7.length, u: "件", cls: "or" }, { ic: "target", l: "完了率", n: rate, u: "%" }], 6) })}
      <div class="k-grid" style="grid-template-columns:minmax(0,1fr) minmax(0,2fr)">
        ${card({ ic: "chart", t: "タスクの完了状況", b: `<div style="display:flex;justify-content:center"><div class="k-ring" style="--p:${rate};--size:170px"><span><small>タスク完了率</small>${rate}<small>%</small></span></div></div>` })}
        ${card({ ic: "alert", t: "タスクの状況", s: "（件数）", b: '<div class="k-vt">' + tiles([{ ic: "alert", l: "期限切れ（対応必須）", n: over.length, u: "件", s: "すぐに対応が必要です", cls: over.length ? "crit" : "", go: () => flash(listC) }, { ic: "clock", l: "開始が遅れている", n: late.length, u: "件", s: "予定より遅れています", cls: late.length ? "hot" : "", go: () => flash(listC) }, { ic: "cal", l: "7日以内の予定", n: in7.length, u: "件", s: "期限が近づいています", go: () => flash(listC) }], 3) + "</div>" })}
      </div>
      ${btns.length ? `<section class="k-card" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:18px;padding:14px 20px" id="k-tkmk">${I("zap", 24)}<div><b style="font-size:17px;display:block">タスクを作成する</b><span class="k-hs">業務に合わせて、すぐにタスクを登録できます</span></div><div class="k-chips" style="margin-left:auto" id="k-tkbtn"></div></section>` : ""}
      ${card({ ic: "target", t: "次にやること", s: "（期限の近い順・優先タスク）", r: `<button type="button" class="k-link" ${act(() => flash(listC))}>すべてのタスクを見る（${open.length}件）${I("arr", 15)}</button>`, st: "margin-bottom:18px", b: `<div style="overflow-x:auto"><table class="rd-tbl"><thead><tr><th>優先度</th><th>タスク</th><th>関連・根拠</th><th>期限</th><th>担当</th></tr></thead><tbody>${pri.map((x, i) => { const d = RD.dayDiff(x.e); const lab = d == null ? ["予定", "gy"] : d < 0 ? ["期限切れ", "rdf"] : d <= 3 ? ["期限間近", "or"] : ["予定", "bl"]; return `<tr><td><span class="k-tag ${lab[1]}"><b>${i + 1}</b>　${lab[0]}</span></td><td><b>${esc(x.n)}</b></td><td>${esc(x.ref || "")}</td><td style="white-space:nowrap">${esc(x.e || "—")}${d == null ? "" : `<small style="display:block;color:${d < 0 ? "var(--k-rd)" : "var(--k-ink3)"};font-weight:700">${d < 0 ? -d + "日前" : "あと" + d + "日"}</small>`}</td><td>${esc(x.who || "")}</td></tr>`; }).join("")}</tbody></table></div>` })}`);
    const tb = $("#k-tkbtn", box);
    // 今のボタンそのものを、この枠へ移す（働きは同じ）
    if (tb) btns.forEach((b, i) => { b.classList.toggle("g", i > 0); b.dataset.rdorig = "1"; tb.appendChild(b); });
    const g4 = orig(w, ".g4")[0];
    if (g4) fold(w, [g4], "これまでの数字の表示（タスク消化率・残タスク数など）", "chart");
  };

  /* ───── メンバー・権限・セキュリティ（team） ───── */
  RD.page.team = (w) => {
    const main = orig(w, ".c").find((c) => /メンバー一覧/.test(c.textContent || ""));
    const sec = $("#v80sec", w);
    const txt = main ? main.textContent || "" : "";
    const n = (re) => { const m = txt.match(re); return m ? +m[1] : null; };
    const shared = /共通アカウント/.test(txt);
    put(w, `${shared ? `<section class="k-card warm" style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:16px;padding:14px 20px">${I("users", 26)}<b style="font-size:16px">現在のアカウント：</b><span class="k-tag orf" style="font-size:14px">トライアル（共通アカウント）</span><span style="width:1px;height:30px;background:var(--k-line)"></span><span style="font-size:13.5px;font-weight:600;color:#2A3B54;flex:1;min-width:260px">複数の方で共有する体験用のアカウントです。メンバーの招待・詳しい権限の設定は、ご契約のアカウントで使えます。</span></section>` : ""}
      ${card({ ic: "users", t: "チームの概要", st: "margin-bottom:18px", b: tiles([{ ic: "users", l: "参加中のメンバー", n: n(/参加中\s*(\d+)/), u: "名" }, { ic: "mail", l: "招待中", n: n(/招待中\s*(\d+)/), u: "名", cls: "or" }, { ic: "lock", l: "停止中", n: n(/停止中\s*(\d+)/), u: "名" }, { ic: "box", l: "登録している商品", n: (G("TENS") || []).length, u: "商品", cls: "gr" }]) })}`);
    if (main && sec && !main.parentElement.classList.contains("k-team2")) {
      const g = document.createElement("div");
      g.className = "k-grid k-team2";
      g.style.gridTemplateColumns = "minmax(0,1.7fr) minmax(0,1fr)";
      main.before(g); g.appendChild(main); g.appendChild(sec);
      main.style.marginBottom = "0"; sec.style.marginBottom = "0";
    }
  };

  /* ───── ゴミ箱（trash） ───── */
  RD.page.trash = (w) => {
    const c = orig(w, ".c")[0];
    const empty = c && /ゴミ箱は空です/.test(c.textContent || "");
    put(w, card({ st: "margin-bottom:18px", b: `<div style="display:grid;grid-template-columns:200px 1fr;gap:20px;align-items:center">
        <img src="${IMG}robot.png" alt="" style="width:180px;height:auto;-webkit-mask-image:radial-gradient(ellipse 60% 60% at 50% 50%,#000 70%,transparent 100%);mask-image:radial-gradient(ellipse 60% 60% at 50% 50%,#000 70%,transparent 100%)">
        <div><h2 style="margin:0 0 6px;font-size:26px;font-weight:900">${empty ? "ゴミ箱は空です" : "削除した資料や案件を、ここで元に戻せます"}</h2><p style="margin:0 0 14px;font-size:14.5px;font-weight:600;color:#2A3B54">削除した資料・案件などが、一定期間ここに保管されます。誤って削除した場合も、期間内であれば復元できます。</p>
          <div class="k-tiles" style="--n:3">${[["clock", "保管期間", "削除から30日"], ["refresh", "復元できる", "期間内なら元の一覧に戻せます"], ["list", "一括変更の取り消し", "まとめて変えた操作も戻せます"]].map((x) => `<div class="k-tile" style="padding:12px 14px"><span class="k-ti" style="width:40px;height:40px">${I(x[0], 20)}</span><span><span class="k-tl">${esc(x[1])}</span><span class="k-ts">${esc(x[2])}</span></span></div>`).join("")}</div></div></div>` }));
  };

  /* ───── 書類をつくる（ops:doc）・用語集（gloss）は見た目の決まり（rd2.css）でそろえる ───── */

  /* ───── 窓：ヘルプセンター・通知センター ───── */
  const GUIDE = [["s09", "upload", "資料（商品・営業資料）を登録する方法"], ["s28", "chat", "AI への質問のコツ（わからないときの対応）"], ["s13", "globe", "販売先国の選定と規制の調べ方"], ["s15", "slides", "外国語の営業資料をつくる方法"], ["s16", "users", "AIバイヤー開拓の進め方"], ["s21", "doc", "書類・ドキュメントの管理"]];
  function decoHelp(pn) {
    if ($(".k-helphd", pn)) return;
    const dw = document.getElementById("dw"); if (dw) dw.classList.add("rd-wide");
    const hd = document.createElement("div");
    hd.className = "rd-x k-helphd";
    hd.innerHTML = `<div class="rd-hero" style="min-height:110px;margin-bottom:12px"><img class="rd-bot" src="${IMG}robot.png" alt="" style="width:96px"><div class="rd-ht"><h1 style="font-size:28px">ヘルプセンター（使い方ガイド）</h1><p>AI商社マンの使い方・困ったときの解決方法が、すぐに見つかります。</p></div></div>
      <div class="k-grid" style="grid-template-columns:repeat(2,minmax(0,1fr));margin-bottom:14px">
        <button type="button" class="k-card k-row" data-rdquick="1">${I("book", 30)}<span class="k-rt"><b>3分でわかるスタートガイド</b><small>はじめての方へ（5つの手順・この画面の上で開きます）</small></span>${I("chevR", 18, 2.4)}</button>
        <a class="k-card k-row" href="guide/" target="_blank" rel="noopener" style="text-decoration:none">${I("folder", 30)}<span class="k-rt"><b>はじめてガイド（くわしい版）</b><small>目次から、知りたいところだけ読めます（別のタブ）</small></span>${I("chevR", 18, 2.4)}</a>
        <button type="button" class="k-card k-row" ${act(() => { try { closeDW(); } catch (e) { /* 無視 */ } const s = document.getElementById("uxsearch"); if (s) s.click(); })}>${I("search", 30)}<span class="k-rt"><b>画面・操作を検索する</b><small>Ctrl＋K または ／</small></span>${I("chevR", 18, 2.4)}</button>
        <button type="button" class="k-card k-row" ${act(() => { const h = $$("h3, h4, b, p", pn).find((x) => /お問い合わせ/.test(x.textContent || "")); flash(h && (h.closest(".c") || h)); })}>${I("mail", 30)}<span class="k-rt"><b>お問い合わせ・サポート</b><small>担当の STANDAGE 営業・CS へ</small></span>${I("chevR", 18, 2.4)}</button>
      </div>
      <section class="k-card" style="margin-bottom:14px">${H({ ic: "star", t: "よく見られているヘルプ", sz: 18 })}<div class="k-rows">${GUIDE.map((g) => `<button type="button" class="k-row v40gb" data-s="${g[0]}" style="box-shadow:none;border-radius:14px!important;justify-content:flex-start">${I(g[1], 20)}<span class="k-rt"><b>${esc(g[2])}</b></span>${I("chevR", 18, 2.4)}</button>`).join("")}</div></section>`;
    pn.prepend(hd);
  }
  function decoNotif(pn) {
    if ($(".k-ntfhd", pn)) return;
    const dw = document.getElementById("dw"); if (dw) dw.classList.add("rd-wide");
    let L = [];
    try { L = notifCalc() || []; } catch (e) { L = []; } // eslint-disable-line no-undef
    const c = {}; L.forEach((n) => { c[n.cat] = (c[n.cat] || 0) + 1; });
    const NM = { msg: ["chat", "バイヤー・交渉"], today: ["list", "今日のタスク"], task: ["clock", "期限"], ship: ["ship", "出荷"], reg: ["shield", "規制"], doc: ["doc", "書類"] };
    const hd = document.createElement("div");
    hd.className = "rd-x k-ntfhd";
    hd.innerHTML = `<div class="rd-hero" style="min-height:110px;margin-bottom:12px"><img class="rd-bot" src="${IMG}robot.png" alt="" style="width:96px"><div class="rd-ht"><h1 style="font-size:28px">通知センター</h1><p>今すぐ対応すべきことを、ひと目で確認して進められます。</p></div></div>
      <section class="k-card" style="margin-bottom:14px">${H({ ic: "check", t: "今すぐ対応が必要なこと", sz: 18, r: `<span class="k-tag orf" style="font-size:14px">${L.length}件</span>` })}${tiles(Object.keys(c).map((k, i) => ({ ic: (NM[k] || ["bell"])[0], l: (NM[k] || [0, "そのほか"])[1], n: c[k], u: "件", cls: i === 0 ? "hot" : "" })), Math.min(4, Object.keys(c).length || 1))}</section>`;
    pn.prepend(hd);
  }
  const mo = new MutationObserver(() => {
    const pn = document.getElementById("pn"), dw = document.getElementById("dw");
    if (!pn || !dw || dw.dataset.open !== "true") { if (dw) dw.classList.remove("rd-wide"); return; }
    const t = pn.textContent || "";
    if (/ヘルプ・使い方/.test(t)) decoHelp(pn);
    else if (/通知センター/.test(t) && !/ヘルプ/.test(t.slice(0, 40))) decoNotif(pn);
    else if (!pn.querySelector(".k-qhd, .k-aahd, .k-helphd2")) dw.classList.remove("rd-wide");
  });
  const startMo = () => { const dw = document.getElementById("dw"); if (dw) mo.observe(dw, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-open"] }); else setTimeout(startMo, 400); };
  startMo();
  try { RD.after(true); } catch (e) { /* まだ描かれていない */ }
})();

} catch (e) { try { console.error("[rd] rd_pages2.js", e); } catch (x) { } }
/* ==== rd_adm.js ==== */
try {
/* 貿易クラウドAI商社マン デザイン刷新 第2弾：管理コンソール（手元だけ・2026-11-11）
   今の管理コンソールの部品（数字・発行・商社デスク・アカウント一覧・AI・連携）はそのまま動かし、見出し・概要・並べ方を足す。
   数字は管理コンソールが出している本物だけ（日別の記録が無いときは「まだ記録がありません」のまま） */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._adm) return;
  RD._adm = 1;
  const { I, esc, $, $$ } = RD;
  const act = (fn) => RD.act(fn);
  const navClick = (re) => { const b = $$("#nav .nb").find((x) => re.test(x.textContent || "")); if (b) { b.click(); return true; } return false; };
  const KPI_IC = [[/発行済み/, "users", ""], [/ログイン/, "out", ""], [/解析/, "upload", "gr"], [/AIへの質問/, "chat", "or"], [/7日以内/, "user", "pu"], [/同期/, "refresh", "gr"]];
  function decoKpi(w) {
    $$("#admkpi > .kpi", w).forEach((b) => {
      if (b.querySelector(".k-ti")) return;
      const l = (($(".lbl", b) || {}).textContent || "");
      const m = KPI_IC.find((x) => x[0].test(l)) || [0, "chart", ""];
      const s = document.createElement("span");
      s.className = "k-ti"; s.innerHTML = I(m[1], 24);
      b.prepend(s);
      if (m[2]) b.classList.add("k-" + m[2]);
    });
  }
  function decoIssue(w) {
    const nc = $("#nc", w);
    if (!nc || $(".k-isst", w)) return;
    const lab = (n, t, sub) => { const d = document.createElement("div"); d.className = "k-isst rd-x"; d.innerHTML = `<span class="k-sn">${n}</span><b>${t}</b>${sub ? `<small>${sub}</small>` : ""}`; return d; };
    nc.before(lab(1, "企業・担当者の入力", "会社名・ご担当者名"));
    const role = $("#nrole", w);
    const rw = role && role.closest(".rw");
    if (rw) rw.before(lab(2, "アカウント種別・プラン・期間", "荷主／物流会社／STANDAGE 社員・個社版／全社版・日数"));
    const go = $$("#issue button", w).find((b) => /発行/.test(b.textContent || ""));
    if (go) { const host = go.closest(".rw") || go; host.before(lab(3, "発行", "内容を確かめて、トライアルアカウントを発行します")); }
  }
  function donut(parts) {
    const tot = parts.reduce((a, b) => a + b.n, 0);
    if (!tot) return `<div class="k-empty">まだ利用の記録がありません</div>`;
    let a0 = -Math.PI / 2, g = "";
    const R = 70, r = 46, cx = 90, cy = 90;
    parts.forEach((p) => { const a1 = a0 + (p.n / tot) * Math.PI * 2; const big = a1 - a0 > Math.PI ? 1 : 0; const P = (a, rr) => `${(cx + rr * Math.cos(a)).toFixed(2)} ${(cy + rr * Math.sin(a)).toFixed(2)}`; if (p.n > 0) g += `<path d="M${P(a0, R)} A${R} ${R} 0 ${big} 1 ${P(a1 - 0.0001, R)} L${P(a1 - 0.0001, r)} A${r} ${r} 0 ${big} 0 ${P(a0, r)}z" fill="${p.c}"/>`; a0 = a1; });
    return `<div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap"><svg viewBox="0 0 180 180" width="170" height="170" role="img" aria-label="利用内訳">${g}<text x="90" y="84" text-anchor="middle" font-size="13" font-weight="800" fill="#44546B">合計</text><text x="90" y="108" text-anchor="middle" font-size="24" font-weight="900" fill="#13233B">${tot.toLocaleString("ja-JP")}</text></svg>
      <table class="rd-tbl" style="flex:1;min-width:220px"><tbody>${parts.map((p) => `<tr><td><i style="display:inline-block;width:12px;height:12px;border-radius:3px;background:${p.c};margin-right:8px;vertical-align:-1px"></i><b>${esc(p.l)}</b></td><td style="text-align:right">${Math.round((p.n / tot) * 100)}%</td><td style="text-align:right"><b>${p.n.toLocaleString("ja-JP")}</b> ${esc(p.u)}</td></tr>`).join("")}</tbody></table></div>`;
  }
  const kpiNum = (w, re) => { const b = $$("#admkpi > .kpi", w).find((x) => re.test((($(".lbl", x) || {}).textContent || ""))); const v = b && $(".kv", b); const m = v && (v.textContent || "").replace(/,/g, "").match(/\d+/); return m ? +m[0] : 0; };
  RD.page.adm = (w) => {
    const hero = $("[data-rdhero]", w);
    if (hero) { const h1 = $("h1", hero), p = $("p", hero); if (h1) h1.textContent = "トライアル管理"; if (p) p.textContent = "トライアル環境の利用状況をひと目で確認し、アカウント・AI・連携をまとめて管理できます。"; const ver = $("#v70admver b", w); if (ver && !$(".rd-crumb", hero)) { const c = document.createElement("span"); c.className = "rd-crumb"; c.textContent = "管理者コンソール"; $(".rd-ht", hero).prepend(c); } }
    decoKpi(w);
    decoIssue(w);
    const rows = $$("#accounts tbody tr[data-st]", w);
    const cnt = (f) => rows.filter(f).length;
    const td = $("#v84admToday", w);
    const tdItems = td ? $$(".v84td-c", td).map((b) => ({ b, l: (($("span", b) || {}).textContent || "").trim(), n: (($("b", b) || {}).textContent || "").trim() })) : [];
    const notes = [];
    tdItems.forEach((x) => { if (/^\d+$/.test(x.n) && +x.n > 0) notes.push({ lv: "rd", t: x.l.replace(/（件）/, ""), d: `${x.n}件あります。押すと、その一覧へ移ります。`, go: () => x.b.click() }); });
    const bm = $("#bmAdm", w);
    if (bm && /確かめられませんでした/.test(bm.textContent || "")) notes.push({ lv: "am", t: "バイヤーへのメール中継の状態を確かめられませんでした", d: "通信の問題です。少しして画面を開き直してください。", go: () => RD.flash(bm) });
    const mem = $("#admmem", w);
    const mm = mem && (mem.textContent || "").match(/メール未登録：メンバー\s*(\d+)\s*名・代表\s*(\d+)\s*名/);
    if (mm && (+mm[1] + +mm[2]) > 0) notes.push({ lv: "or", t: "メール未登録の方がいます", d: `メンバー ${mm[1]}名・代表 ${mm[2]}名。メールの無い方は、確認コードなしでログインできる状態です。`, go: () => RD.flash(mem) });
    const syncOk = $("#v214adm .ok", w);
    const ai = kpiNum(w, /AIへの質問/), web = (() => { const b = $$("#admkpi > .kpi", w).find((x) => /AIへの質問/.test(x.textContent || "")); const m = b && (b.textContent || "").match(/Web検索\s*(\d+)/); return m ? +m[1] : 0; })();
    const parts = [{ l: "AIへの質問", n: Math.max(0, ai - web), u: "回", c: "#F57C0F" }, { l: "Web検索", n: web, u: "回", c: "#1F6FD1" }, { l: "商品データの解析", n: kpiNum(w, /解析/), u: "件", c: "#14995A" }, { l: "ログイン", n: kpiNum(w, /ログイン/), u: "回", c: "#6B7B93" }];
    const box = RD.put(w, `<div class="k-grid" style="grid-template-columns:minmax(0,1.25fr) minmax(0,1fr) minmax(0,.9fr)">
        ${RD.card({ ic: "alert", t: "重要なお知らせ・対応が必要な項目", b: notes.length ? `<div class="k-rows">${notes.map((n) => `<button type="button" class="k-row" ${act(n.go)}><span class="k-tag ${n.lv === "rd" ? "rdf" : n.lv === "am" ? "am" : "or"}">${n.lv === "rd" ? "要対応" : "確認"}</span><span class="k-rt"><b>${esc(n.t)}</b><small>${esc(n.d)}</small></span>${I("chevR", 18, 2.4)}</button>`).join("")}</div>` : `<div class="k-empty">${I("check", 18, 3)} いま対応が必要な項目はありません</div>` }) + (syncOk ? `` : "")}
        ${RD.card({ ic: "users", t: "アカウントの状況", s: `（${rows.length}件）`, b: `<ul class="k-ck">${[["有効", cnt((r) => r.dataset.st === "active"), "gr"], ["期限切れ", cnt((r) => r.dataset.st === "expired"), "or"], ["無効", cnt((r) => r.dataset.st === "disabled"), "gy"], ["うち物流会社", cnt((r) => r.dataset.role === "fwd"), "bl"]].map((x) => `<li style="justify-content:space-between"><span><span class="k-tag ${x[2]}" style="min-width:10px">●</span> ${x[0]}</span><b style="font-size:18px">${x[1]} <small style="font-size:13px">件</small></b></li>`).join("")}</ul><button type="button" class="k-link" style="margin-top:10px" ${act(() => navClick(/アカウント一覧/) || RD.flash($("#accounts", w)))}>アカウント一覧へ ${I("arr", 15)}</button>` })}
        ${RD.card({ ic: "zap", t: "クイック操作", b: `<div class="k-rows">${[["plus", "アカウントを発行", /新しいアカウントを発行/, "#issue"], ["bldg", "商社デスクの依頼", /商社デスク/, "#v75adm"], ["users", "メンバー管理", /メンバー管理/, "#admmem"], ["refresh", "同期・端末を確かめる", /クラウド同期/, "#syncslot"], ["doc", "操作の記録（CSV）", /操作の記録/, "#v33admlog"]].map((x, i) => `<button type="button" class="k-row" style="${i === 0 ? "border-color:var(--k-or-line);background:#FFF8F0" : ""}" ${act(() => navClick(x[2]) || RD.flash($(x[3], w)))}>${I(x[0], 20)}<span class="k-rt"><b>${esc(x[1])}</b></span>${I("chevR", 18, 2.4)}</button>`).join("")}</div>` })}
      </div>
      ${RD.card({ ic: "chart", t: "利用内訳", s: "（累計・全アカウント。日ごとの推移は「利用とコスト」）", st: "margin-bottom:18px", b: donut(parts) })}`);
    box.dataset.v84tab = "daily";
  };
})();

} catch (e) { try { console.error("[rd] rd_adm.js", e); } catch (x) { } }
/* ==== rd_login.js ==== */
try {
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
    // 11/12 大瀧さんのご意見：「3分でわかる」の先が55ページのガイドだった → 1枚の短い案内（5つの手順）を開く。くわしい版は別に残す
    help.innerHTML = `<b>${I("help", 22)}はじめての方へ</b><button type="button" class="k-lgquick" data-rdquick="1">${I("book", 18)}3分でわかるスタートガイド ${I("chevR", 16, 2.4)}</button><a class="k-lgfull" href="guide/" target="_blank" rel="noopener">くわしい版（はじめてガイド・別のタブ）</a><span class="k-hs">アカウントの発行・再有効化は、STANDAGE の担当までご連絡ください。</span>`;
    v.appendChild(help);
  }
  const mo = new MutationObserver(() => { try { deco(); } catch (e) { console.error("[rd login]", e); } });
  const start = () => { mo.observe(document.body, { childList: true, subtree: true }); deco(); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();

} catch (e) { try { console.error("[rd] rd_login.js", e); } catch (x) { } }
/* ==== rd_bar.js ==== */
try {
/* 貿易クラウドAI商社マン デザイン刷新 第2弾：上の帯（手元だけ・2026-11-11）
   デザイン案どおり「検索・言語・通知・会社」の4つにそろえる。
   会社・商品の切り替え／新しい会社の商品を登録／やさしい説明／トライアルの残り日数／アカウント／ログアウトは、
   会社名のボタンを押すと開く窓の中に、今の部品をそのまま入れる（働きは同じ・1回押せば出る） */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._bar) return;
  RD._bar = 1;
  const { I, esc, $ } = RD;
  const PUT = [["#tenant", "a"], ["#psw", "a"], ["#pfind", "a"], ["#v56upldNewco", "b"], ["#easy", "c"], ["#lgpill", "d"], ["#usrchip", "d"], ["#lgout", "d"]];
  function build() {
    const bar = document.querySelector(".bar");
    if (!bar) return;
    bar.classList.add("k-bar2");
    bar.style.position = "relative";
    let co = $(".k-co", bar), dd = $(".k-dd", bar);
    if (!co) {
      co = document.createElement("button");
      co.type = "button"; co.className = "k-co"; co.setAttribute("aria-haspopup", "true"); co.setAttribute("aria-expanded", "false");
      dd = document.createElement("div");
      dd.className = "k-dd"; dd.setAttribute("role", "dialog"); dd.setAttribute("aria-label", "会社・商品・アカウント");
      dd.innerHTML = `<h4>表示している会社・商品（切り替え）</h4><div class="k-ddr" data-z="a"></div><h4>追加</h4><div class="k-ddr" data-z="b"></div><h4>表示</h4><div class="k-ddr" data-z="c"></div><h4>アカウント</h4><div class="k-ddr" data-z="d"></div><p class="k-ddnote">このボタンの中に、会社・商品の切り替え、新しい会社の商品の登録、やさしい説明、ログアウトがあります。</p>`;
      const bell = document.getElementById("bell");
      (bell ? bell.after(co) : bar.appendChild(co));
      bar.appendChild(dd);
      co.addEventListener("click", (e) => { e.stopPropagation(); const on = !dd.classList.contains("on"); dd.classList.toggle("on", on); co.setAttribute("aria-expanded", String(on)); });
      dd.addEventListener("click", (e) => e.stopPropagation());
      document.addEventListener("click", () => { dd.classList.remove("on"); co.setAttribute("aria-expanded", "false"); });
      document.addEventListener("keydown", (e) => { if (e.key === "Escape") dd.classList.remove("on"); });
    }
    PUT.forEach(([sel, z]) => { const x = document.querySelector(sel); const t = dd.querySelector(`[data-z="${z}"]`); if (x && t && x.parentElement !== t) t.appendChild(x); if (x) { x.classList.remove("hm"); /* hidden はアプリの決めのまま（No.361） */ } });
    // 区切りが空なら見出しごと隠す（物流会社・管理者は商品の切り替えが無い）
    // No.369（11/12）：部品が入っていても、今のアプリが隠している部品（hidden・表示なし・選択肢の無い切り替え）だけなら空と見なす。
    //   前は「部品が入っているか」だけを見ていたので、荷主の「表示」（やさしい説明はアプリが隠す）と、物流会社・管理者の空の商品の切り替えが出ていた
    const shown = (k) => !k.hidden && getComputedStyle(k).display !== "none" && !(k.tagName === "SELECT" && !k.options.length);
    const on = {};
    dd.querySelectorAll(".k-ddr").forEach((r) => { const h = r.previousElementSibling; const has = Array.from(r.children).some(shown); on[r.dataset.z] = has; r.style.display = has ? "" : "none"; if (h && h.tagName === "H4") h.style.display = has ? "" : "none"; });
    const psw = document.getElementById("psw");
    const ha = dd.querySelector('[data-z="a"]'); const h4a = ha && ha.previousElementSibling;
    if (h4a && h4a.tagName === "H4") { const t = psw && shown(psw) ? "表示している会社・商品（切り替え）" : "表示している会社"; if (h4a.textContent !== t) h4a.textContent = t; }
    const note = dd.querySelector(".k-ddnote");
    if (note) {
      const parts = [on.a && psw && shown(psw) ? "会社・商品の切り替え" : "", on.b ? "新しい会社の商品の登録" : "", on.c ? "やさしい説明" : "", on.d ? "ログアウト" : ""].filter(Boolean);
      const t = parts.length ? `このボタンの中に、${parts.join("、")}があります。` : "";
      if (note.textContent !== t) note.textContent = t;
      note.style.display = t ? "" : "none";
    }
    const S = RD.G("SES") || {};
    const nm = S.t === "admin" ? "STANDAGE 管理者" : RD.coName() || "会社・商品";
    co.innerHTML = `${I(S.t === "admin" ? "gear" : "bldg", 20)}<span>${esc(nm)}</span>${I("chev", 16)}`;
    const us = document.getElementById("uxsearch");
    if (us && !us.dataset.k) { us.dataset.k = "1"; const t = Array.from(us.childNodes).find((n) => n.nodeType === 3 && /検索/.test(n.textContent)); if (t) t.textContent = "案件・バイヤー・国名で検索"; }
  }
  RD.buildBar2 = build;
  const old = RD.after;
  RD.after = function () { const r = old.apply(this, arguments); try { build(); } catch (e) { console.error("[rd bar]", e); } return r; };
  setInterval(() => { try { if (!RD.locked()) build(); } catch (e) { /* 無視 */ } }, 1500);
  try { build(); } catch (e) { /* まだ */ }
})();

} catch (e) { try { console.error("[rd] rd_bar.js", e); } catch (x) { } }
/* ==== rd_pages3.js ==== */
try {
/* 貿易クラウドAI商社マン デザイン刷新 第3弾（最終・手元だけ・2026-11-11）
   デザイナーの最後の案（8画面）に合わせた部品：
   ・全画面：見出しの上のパンくず（貿易クラウド AI商社マン ／ 荷主向け・物流会社向け・管理者コンソール）・左上の利用モードの札・管理者のメニューに「ヘルプ」
   ・荷主：外国語営業資料の「完成した営業資料」（保存した資料があるとき）と4つの手順
   ・物流会社：AI見積の窓（依頼番号・ルート・概算・確認状況・内訳・確認ポイント）／AI物流マンに相談／依頼ページ／メンバー
   ・ヘルプの窓：荷主・物流会社・管理者で中身を分ける／管理者AIの窓
   数字はアプリが持っている本物だけ。今の部品はそのまま動かす */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._p3 || !RD.card) return;
  RD._p3 = 1;
  const { I, esc, $, $$, G, flag, IMG, card, tiles, steps, put, flash } = RD;
  const act = (fn) => RD.act(fn);
  const goKey = (k) => RD.goKey(k);
  const role = () => { const S = G("SES") || {}; return S.t === "admin" ? "adm" : S.role === "fwd" ? "fwd" : "ship"; };
  const ROLE_NM = { ship: "荷主向け", fwd: "物流会社向け", adm: "管理者コンソール" };
  const yen = (n) => "¥" + Math.round(+n || 0).toLocaleString("ja-JP");

  /* ───── 見出しのパンくず・利用モードの札・管理者のヘルプ ───── */
  function crumb() {
    $$(".rd-hero .rd-ht").forEach((h) => {
      if ($(".k-bc", h)) return;
      const c = document.createElement("div");
      c.className = "k-bc";
      c.textContent = `貿易クラウド AI商社マン ／ ${ROLE_NM[role()]}`;
      h.prepend(c);
    });
    $$(".rd-hero .rd-crumb").forEach((x) => x.remove());
  }
  function modeChip() {
    const side = $(".side");
    if (!side) return;
    if ($("#rdside .k-modechip", side)) { $$(".k-modechip", side).forEach((x) => { if (!x.closest("#rdside")) x.remove(); }); return; } // 荷主・物流会社は左のメニューの中に出している
    let m = $(".k-modechip", side);
    if (!m) { m = document.createElement("div"); m.className = "k-modechip"; }
    const anchor = $("#rdside .rd-logo", side) || $(":scope > .logo", side);
    if (anchor && anchor.nextElementSibling !== m) anchor.after(m); else if (!anchor && !m.parentElement) side.prepend(m);
    const r = role();
    m.innerHTML = `${I(r === "adm" ? "gear" : "bldg", 18)}<span>${ROLE_NM[r]}</span>`;
    $$("#rdside .rd-mode").forEach((x) => { x.style.display = "none"; });
    if (r === "adm") {
      const nav = document.getElementById("nav");
      if (nav && !$(".k-admhelp", nav)) {
        const b = document.createElement("button");
        b.type = "button"; b.className = "nb k-admhelp"; b.dataset.rdorig = "1";
        b.innerHTML = `${I("help", 16)}<span>ヘルプ</span>`;
        b.addEventListener("click", () => RD.openHelp());
        nav.appendChild(b);
      }
    }
  }

  /* ───── 荷主：外国語営業資料（完成した営業資料・4つの手順） ───── */
  const deck0 = RD.page.deck;
  RD.page.deck = (w, k) => {
    if (deck0) deck0(w, k);
    const d14 = $("#dk14", w);
    const tabsO = d14 ? $$("[data-dk14tab]", d14) : [];
    const saved = tabsO.map((b) => ({ b, lang: b.dataset.dk14tab, nm: (b.textContent || "").replace(/\d+\s*\/\s*\d+/, "").trim(), n: +(((b.textContent || "").match(/(\d+)\s*\/\s*\d+/) || [])[1] || 0) })).filter((x) => x.n > 0);
    const t = G("TEN") || {};
    const okBox = $(".rd-p2 .k-ring", w);
    const pct = okBox ? +((okBox.getAttribute("style") || "").match(/--p:(\d+)/) || [0, 0])[1] : 0;
    const allReq = !!$(".rd-p2 h2", w) && /準備が整っています/.test($(".rd-p2", w).textContent || "");
    // 手順の帯を4つに
    const sb = $(".rd-p2 .k-steps", w);
    if (sb) {
      const st = [
        { t: "情報を確認", s: `完成度 ${pct}%`, ic: "list", st: allReq ? "done" : "on", go: () => flash($(".rd-p2 .k-items", w)) },
        { t: "AIが資料を生成", s: "言語と相手の国を選ぶ", ic: "spark", st: saved.length ? "done" : allReq ? "on" : "", go: () => flash(RD.secBy(w, /営業資料を作る/) || $("#sec-3", w)) },
        { t: "完成版をチェック", s: saved.length ? `保存 ${saved.reduce((a, b) => a + b.n, 0)}件` : "作ったあと", ic: "eye", st: saved.length ? "on" : "", go: () => flash($("#k-deckdone", w) || d14) },
        { t: "バイヤーに提案", s: "AIバイヤー開拓へ", ic: "send", go: () => goKey("db") },
      ];
      sb.outerHTML = steps(st);
    }
    // 完成した営業資料（保存した資料があるとき）／作る前の表紙の見本
    const ph = (t.assets && t.assets.ph && t.assets.ph[0]) || null;
    const logo = t.assets && t.assets.logo;
    const str = (Array.isArray(t.strengths) ? t.strengths : []).slice(0, 3).map((x) => (Array.isArray(x) ? x[0] : x)).filter(Boolean);
    const cover = `<div class="k-cover"><div class="k-cvh"><b>${esc(t.coEn || t.co || "")}</b><span>JAPAN</span></div>
      <div class="k-cvb"><div style="min-width:0"><small>${esc(String(t.catKey || "").replace(/_/g, " ").toUpperCase() || "MADE IN JAPAN")}</small><h3>${esc(t.itemEn || t.item || "")}</h3>${str.length ? `<ul>${str.map((s) => `<li>✓ ${esc(s)}</li>`).join("")}</ul>` : ""}</div>${ph ? `<img src="${RD.img64(ph)}" alt="">` : logo ? `<img src="${RD.img64(logo)}" alt="" style="object-fit:contain;background:#fff">` : ""}</div>
      <div class="k-cvf"><span>${esc([t.ctn, t.moq ? "MOQ " + t.moq : ""].filter(Boolean).join(" · "))}</span><span>Made in Japan</span></div></div>`;
    const checks = [
      ["英語の商品名と紹介文", !!t.itemEn],
      ["商品の強み（3件以上）", str.length >= 3],
      ["商品の写真", !!ph],
      ["問い合わせ先", !!(t.deckMeta && (t.deckMeta.mail || t.deckMeta.person))],
    ];
    const html = card({ id: "k-deckdone", ic: "slides", t: saved.length ? "完成した営業資料" : "営業資料の表紙（見本）", s: saved.length ? "保存した資料から" : "まだ作っていません。登録データから表紙の見本を出しています", r: `<span class="k-tag ${saved.length ? "or" : "gy"}">${saved.length ? "AI生成・要確認" : "見本"}</span>`, st: "margin-bottom:18px", b: `<div class="k-grid" style="grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);margin:0">
      <div style="min-width:0">${saved.length ? `<div class="k-chips" style="margin-bottom:12px">${saved.map((x, i) => `<button type="button" class="k-btn ${i ? "white" : ""} k-mini" ${act(() => { x.b.click(); setTimeout(() => flash(d14), 60); })}>${I("globe", 15)}${esc(x.nm)}（${x.n}）</button>`).join("")}</div>` : ""}${cover}
        <div class="k-chips" style="margin-top:12px">${saved.length ? `<button type="button" class="k-btn white k-mini" ${act(() => { saved[0].b.click(); setTimeout(() => { const o = $$(".dk14-l button", d14).find((b) => /開く/.test(b.textContent || "")); if (o) o.click(); else flash(d14); }, 120); })}>${I("eye", 15)}開く（見本・PowerPoint・PDF）</button>` : ""}<button type="button" class="k-btn white k-mini" ${act(() => flash($("#sec-1", w)))}>${I("box", 15)}画像を変更</button><button type="button" class="k-btn white k-mini" ${act(() => { const b = document.getElementById("dk3wiz"); if (b) b.click(); })}>${I("edit", 15)}文章を整える</button></div></div>
      <div style="min-width:0">${saved.length ? `<div class="k-okbox">${I("check", 22, 3)}<div><b>営業資料が完成しました！</b><small>バイヤーに送る前に内容を確認しましょう。</small></div></div>` : `<div class="k-okbox gy">${I("slides", 22)}<div><b>まだ営業資料を作っていません</b><small>下の「営業資料を作る」で言語と相手の国を選ぶと、ここに完成版が出ます。</small></div></div>`}
        <h4 style="margin:14px 0 8px;font-size:16px;font-weight:900">AIが確認するポイント</h4>
        <ul class="k-ck">${checks.map((c) => `<li><span class="${c[1] ? "ok" : "ng"}">${I(c[1] ? "check" : "alert", 16, 2.6)}</span><span>${esc(c[0])}</span></li>`).join("")}<li><span class="ng">${I("alert", 16)}</span><span style="color:#C25600">価格・MOQ は送る前に最終確認</span></li></ul>
        <div class="k-card warm" style="margin-top:14px;padding:14px 16px;box-shadow:none"><span class="k-tag orf" style="margin-bottom:6px">次にやること</span><b style="display:block;font-size:15px">この資料を使ってバイヤーへ提案</b><small style="display:block;color:var(--k-ink2);font-weight:600;margin:2px 0 10px">相手に合わせた営業メールを AI が下書きします（送る前に必ず確認・承認）。</small><button type="button" class="k-btn wide" ${act(() => goKey("db"))}>${I("arr", 18, 2.4)}バイヤーへの提案に進む</button></div></div></div>` });
    const host = $(".rd-p2", w);
    if (host) host.insertAdjacentHTML("afterend", `<div class="rd-x">${html}</div>`);
  };

  /* ───── 物流会社：AI物流マンに相談（fai） ───── */
  RD.page.fai = (w) => {
    const F = G("FWDB") || {}; const me = (F.profile && F.profile.co) || "";
    const R = Array.isArray(F.rates) ? F.rates : [], Q = Array.isArray(F.reqs) ? F.reqs : [];
    const cos = new Set(R.map((r) => r && r.co).filter(Boolean)).size;
    const last = Q.slice().sort((a, b) => ((b.d || "") > (a.d || "") ? 1 : -1))[0];
    const fc = document.getElementById("fwdchat");
    const chat = (fc && fc.closest(".c")) || $("#sec-0", w);
    if (!chat) return;
    const qs = $$(".qb .q[data-fq]", chat);
    const ask = (q) => { const ta = document.getElementById("fwdq"), go = document.getElementById("fwdqgo"); if (ta && go) { ta.value = q; go.click(); } };
    const aside = document.createElement("div");
    aside.className = "rd-x k-aside";
    aside.innerHTML = `${card({ ic: "db", t: "今、AIが参照している条件", b: `<dl class="k-dl"><dt>会社</dt><dd>${esc(me)}</dd><dt>レート表</dt><dd>${R.length} レーン${cos ? `（${cos}社）` : ""}</dd><dt>見積依頼</dt><dd>${Q.length} 件</dd>${last ? `<dt>最新の依頼</dt><dd>${esc(last.id)}・${esc(last.pol || "")} → ${esc(last.cty || last.pod || "")}</dd><dt>貨物</dt><dd>${esc(last.item || "")}${last.cbm ? `・${esc(last.cbm)}m³ ${esc(last.mode || "")}` : ""}</dd><dt>条件</dt><dd>${esc(last.term || "—")}</dd>` : ""}</dl><button type="button" class="k-btn white wide k-mini" style="margin-top:12px" ${act(() => goKey("frates"))}>${I("edit", 15)}レートを登録・更新する</button>` })}
      ${qs.length ? card({ ic: "help", t: "よくある質問", b: `<div class="k-rows">${qs.slice(0, 5).map((b) => `<button type="button" class="k-row" ${act(() => ask(b.dataset.fq))}><span class="k-rt"><b>${esc(b.dataset.fq)}</b></span>${I("arr", 16)}</button>`).join("")}</div>` }) : ""}
      ${card({ ic: "flag", t: "次のステップ", cls: "warm", b: `<b style="display:block;font-size:15px">この相談から見積を進めます</b><small style="display:block;color:var(--k-ink2);font-weight:600;margin:2px 0 10px">担当者が確認してから荷主へ送ります。</small><button type="button" class="k-btn wide" ${act(() => goKey("finbox"))}>${I("arr", 18, 2.4)}見積受信箱を開く</button>` })}`;
    const grid = document.createElement("div");
    grid.className = "k-grid k-faigrid";
    grid.style.gridTemplateColumns = "minmax(0,1.7fr) minmax(0,1fr)";
    chat.before(grid); grid.appendChild(chat); grid.appendChild(aside);
    chat.style.marginBottom = "0";
  };

  /* ───── 物流会社：依頼ページ（frq） ───── */
  RD.page.frq = (w) => {
    const box = $(".v33rq", w);
    const t = box ? box.textContent || "" : "";
    const n = (re) => { const m = t.replace(/\s+/g, "").match(re); return m ? +m[1] : 0; };
    const draft = n(/未提出(\d+)/), mid = n(/途中保存(\d+)/), done = n(/提出済み(\d+)/), exp = n(/期限切れ(\d+)/);
    const total = draft + mid + done + exp;
    const nb = $("#v33rqnew", w), poll = $("#v33rqpoll", w);
    const first = done ? ["回答を確認しましょう", `提出済みの回答が ${done}件あります。内容を見て見積に反映します。`, () => poll && poll.click(), "回答を確かめる"] : exp ? ["期限切れの依頼をフォロー", `期限を過ぎた依頼が ${exp}件あります。リンクを送り直しましょう。`, () => flash(box), "依頼の一覧へ"] : ["まず依頼を作りましょう", "荷主に確かめたいこと（貨物・梱包・出荷日など）を選んでリンクを送ります。", () => nb && nb.click(), "新しい依頼を作る"];
    put(w, `<section class="k-card" style="margin-bottom:16px;padding:12px 16px">${steps([{ t: "荷主への依頼を作成", ic: "edit", st: total ? "done" : "on", go: () => nb && nb.click() }, { t: "リンクを送る", ic: "link", st: total ? "done" : "" }, { t: "回答を受け取る", ic: "inbox", st: done ? "done" : total ? "on" : "", go: () => poll && poll.click() }, { t: "内容を確認する", ic: "check", st: done ? "on" : "" }])}</section>
      ${card({ ic: "chart", t: "依頼の状況", st: "margin-bottom:16px", b: tiles([{ ic: "edit", l: "未提出", n: draft, u: "件", s: "まだ荷主が開いていない" }, { ic: "clock", l: "途中保存", n: mid, u: "件", s: "荷主が入力中", cls: "or" }, { ic: "check", l: "提出済み（新しい回答）", n: done, u: "件", s: "内容の確認が必要", cls: done ? "hot" : "gr" }, { ic: "alert", l: "期限切れ", n: exp, u: "件", s: "フォローの対象", cls: exp ? "rd" : "" }]) })}
      <div class="k-grid" style="grid-template-columns:minmax(0,1fr) minmax(0,1fr)">
        ${card({ ic: "spark", t: "AIが整理した優先アクション", cls: "warm", b: `<b style="display:block;font-size:16px">${esc(first[0])}</b><small style="display:block;color:var(--k-ink2);font-weight:600;margin:4px 0 12px">${esc(first[1])}</small><button type="button" class="k-btn" ${act(first[2])}>${I("arr", 18, 2.4)}${esc(first[3])}</button>` })}
        ${card({ ic: "help", t: "依頼ページとは？", b: `<div class="k-tiles" style="--n:3">${[["list", "必要事項を選ぶ"], ["link", "リンクを送る"], ["check", "回答を確認"]].map((x) => `<div class="k-tile v" style="align-items:center;text-align:center;padding:12px"><span class="k-ti" style="width:40px;height:40px">${I(x[0], 20)}</span><span class="k-tl">${esc(x[1])}</span></div>`).join("")}</div><p class="rd-note" style="font-size:13px">荷主に出荷情報・商品仕様などを依頼し、ログイン不要のリンクで答えてもらう機能です。回答は受信箱と案件にまとまります。</p>` })}
      </div>`);
  };

  /* ───── メンバー（荷主・物流会社）：誰が何をできる？ ───── */
  const who = () => card({ ic: "users", t: "誰が何をできる？", st: "margin-bottom:18px", b: `<div class="k-tiles" style="--n:3">${[["管理者", "招待・担当・役割・停止・削除。全部の案件とレートの管理"], ["メンバー", "見る・投稿する・担当の仕事（割り当てられた見積・案件に対応）"], ["代表", "アカウント発行時の担当者。外せません"]].map((x) => `<div class="k-tile v" style="padding:14px 16px"><span class="k-tl">${esc(x[0])}</span><span class="k-ts" style="font-size:13px;color:var(--k-ink2)">${esc(x[1])}</span></div>`).join("")}</div>` });
  const team0 = RD.page.team;
  RD.page.team = (w, k) => { if (team0) team0(w, k); const p = $(".rd-p2", w); if (p) p.insertAdjacentHTML("beforeend", who()); };
  RD.page.fteam = (w, k) => { if (team0) team0(w, k); const p = $(".rd-p2", w); if (p) p.insertAdjacentHTML("beforeend", who()); };

  /* ───── 窓：物流会社の AI見積（openFwdQuote） ───── */
  function decoQuote(pn) {
    if ($(".k-qhd", pn)) return;
    const h = $(".dwhead h3", pn);
    const id = h && ((h.textContent || "").match(/RQ-[A-Z0-9]+/) || [])[0];
    const F = G("FWDB") || {}; const me = (F.profile && F.profile.co) || "";
    const r = id && (F.reqs || []).find((x) => x && x.id === id);
    if (!r) return;
    const legs = (r.legs || []).map((lg) => { const own = (lg.offers || []).find((o) => o && o.co === me); const q = (own && own.quote) || null; return { lg, q, own: !!own, sel: lg.co || lg.sel || "" }; });
    const ownN = legs.filter((x) => x.q).length;
    const sum = legs.reduce((a, x) => a + (x.q ? +x.q.total || 0 : 0), 0);
    const warns = $$(".dwbody p, .dwbody div", pn).filter((p) => /^⚠/.test((p.textContent || "").trim()) && !p.querySelector("p")).map((p) => (p.textContent || "").trim().replace(/^⚠\s*/, ""));
    const sent = /荷主に届いています/.test(pn.textContent || "");
    const hd = document.createElement("div");
    hd.className = "rd-x k-qhd";
    hd.innerHTML = `<div class="k-steps" style="margin-bottom:14px">${[["依頼の確認", "done"], ["AI見積を確認", sent ? "done" : "on"], ["荷主へ提出", sent ? "done" : ""]].map((s, i) => `${i ? `<span class="k-arr">${I("chevR", 18, 2.4)}</span>` : ""}<div class="k-step ${s[1]}" style="cursor:default"><span class="k-sn">${s[1] === "done" ? I("check", 14, 3) : i + 1}</span><b>${s[0]}</b></div>`).join("")}</div>
      ${tiles([{ ic: "doc", l: "見積依頼番号", n: id, s: r.co || "" }, { ic: "ship", l: "輸送ルート", n: `${r.pol || ""} → ${r.cty || r.pod || ""}`, s: `${r.mode || ""}${r.cbm ? "・" + r.cbm + "m³" : ""}` }, { ic: "coins", l: `貴社の概算見積（${ownN}/${legs.length}か国）`, n: ownN ? yen(sum) : "—", s: ownN ? "諸掛込み・税等別" : "貴社のレートでの見積なし", cls: "or" }, { ic: "alert", l: "確認状況", n: warns.length ? `要確認 ${warns.length}件` : "問題なし", s: sent ? "荷主に届いています" : "提出前に確認", cls: warns.length ? "rd" : "gr" }])}
      <div class="k-grid" style="grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);margin:16px 0 0">
        ${card({ ic: "list", t: "見積の内訳（貴社のレート）", b: ownN ? `<div style="overflow-x:auto"><table class="rd-tbl"><thead><tr><th>国</th><th>区間</th><th style="text-align:right">海上運賃</th><th style="text-align:right">THC等</th><th style="text-align:right">書類費</th><th style="text-align:right">合計</th><th>有効期限</th></tr></thead><tbody>${legs.filter((x) => x.q).map((x) => `<tr><td>${flag(x.lg.cty, 16)} ${esc(x.lg.cty || "")}</td><td>${esc(x.q.lane || "")}</td><td style="text-align:right">${yen(x.q.freight)}</td><td style="text-align:right">${yen(x.q.thc)}</td><td style="text-align:right">${yen(x.q.doc)}</td><td style="text-align:right"><b>${yen(x.q.total)}</b></td><td>${esc(x.q.valid || "")}</td></tr>`).join("")}</tbody></table></div><p class="rd-note">金額・納期を直すときは「レート管理」で更新します（荷主の画面にも反映）。</p>` : `<div class="k-empty">貴社のレートでの見積はありません</div>` })}
        ${card({ ic: "spark", t: "AIの判断と確認ポイント", cls: warns.length ? "warm" : "", b: warns.length ? `<ul class="k-ck">${warns.slice(0, 4).map((x) => `<li><span class="ng">${I("alert", 16)}</span><span>${esc(x.slice(0, 90))}${x.length > 90 ? "…" : ""}</span></li>`).join("")}</ul>` : `<div class="k-empty">${I("check", 18, 3)} 確認が要る点はありません</div>` + "" }) }
      </div>`;
    const body = $(".dwbody", pn) || pn;
    body.prepend(hd);
    const dw = document.getElementById("dw"); if (dw) dw.classList.add("rd-wide");
  }

  /* ───── 窓：管理者AI ───── */
  function decoAdmAi(pn) {
    if ($(".k-aahd", pn)) return;
    const kv = (re) => { const b = $$("#admkpi > .kpi").find((x) => re.test(x.textContent || "")); const v = b && $(".kv", b); return v ? (v.textContent || "").trim() : "—"; };
    const today = $$("#v84admToday .v84td-c b").map((b) => +((b.textContent || "").match(/\d+/) || [0])[0]).reduce((a, b) => a + b, 0);
    const hd = document.createElement("div");
    hd.className = "rd-x k-aahd";
    hd.innerHTML = `<div class="rd-hero" style="min-height:100px;margin-bottom:10px"><img class="rd-bot" src="${IMG}robot.png" alt="" style="width:88px"><div class="rd-ht"><div class="k-bc">貿易クラウド AI商社マン ／ 管理者コンソール</div><h1 style="font-size:26px">管理者AIに相談</h1><p>アカウント・AI利用コスト・同期の状況など、運用に必要なことを AI に聞けます。</p></div></div>
      ${card({ ic: "chart", t: "今の管理状況", st: "margin-bottom:12px", b: tiles([{ ic: "users", l: "発行済み", n: kv(/発行済み/).replace(/件$/, ""), u: "件" }, { ic: "alert", l: "今日の作業（要確認）", n: today, u: "件", cls: today ? "or" : "" }, { ic: "refresh", l: "同期の状態", n: kv(/同期/), cls: "gr" }], 3) })}
      <p class="rd-note" style="margin:0 0 10px">${I("shield", 14)} 管理者の権限の範囲で答えます。アカウントの操作や設定の変更は、管理画面で確かめてから行ってください。</p>`;
    const body = $(".dwbody", pn) || pn;
    body.prepend(hd);
    const dw = document.getElementById("dw"); if (dw) dw.classList.add("rd-wide");
  }

  /* ───── 窓：ヘルプ（物流会社・管理者は中身を分ける） ───── */
  const navTo = (re) => { const b = $$("#nav .nb").find((x) => re.test(x.textContent || "")); if (b) { try { closeDW(); } catch (e) { /* 無視 */ } b.click(); } }; // eslint-disable-line no-undef
  const closeGo = (k) => { try { closeDW(); } catch (e) { /* 無視 */ } goKey(k); }; // eslint-disable-line no-undef
  function helpHd(pn) {
    const r = role();
    if (r === "ship") return false;
    if ($(".k-helphd2", pn)) return true;
    $$(".k-helphd", pn).forEach((x) => x.remove());
    const hd = document.createElement("div");
    hd.className = "rd-x k-helphd k-helphd2";
    const search = () => { try { closeDW(); } catch (e) { /* 無視 */ } const s = document.getElementById("uxsearch"); if (s) s.click(); }; // eslint-disable-line no-undef
    const contact = () => { const h = $$("h3, h4, b, p", pn).find((x) => /お問い合わせ/.test(x.textContent || "") && !x.closest(".rd-x")); flash(h && (h.closest(".c") || h)); };
    if (r === "fwd") {
      hd.innerHTML = `<div class="rd-hero" style="min-height:100px;margin-bottom:10px"><img class="rd-bot" src="${IMG}robot.png" alt="" style="width:88px"><div class="rd-ht"><div class="k-bc">貿易クラウド AI商社マン ／ 物流会社向け</div><h1 style="font-size:26px">物流会社向け・使い方ガイド</h1><p>初めての方も、見積・レート・依頼ページを迷わず使えるように案内します。</p></div></div>
        ${card({ ic: "flag", t: "初めての方は、まずこの3ステップから", st: "margin-bottom:12px", b: steps([{ t: "見積依頼を受け取る", s: "荷主から届いた依頼を確認", ic: "mail", go: () => closeGo("finbox") }, { t: "自社レートを登録する", s: "AI が見積案を作れるように", ic: "db", go: () => closeGo("frates") }, { t: "AI見積を確認して送る", s: "内容を見て、承認・提出", ic: "send", go: () => closeGo("finbox") }]) })}
        <div class="k-grid" style="grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);margin-bottom:12px">
          ${card({ ic: "search", t: "ヘルプを探す", b: `<button type="button" class="k-row" ${act(search)}>${I("search", 18)}<span class="k-rt"><b>画面・操作を検索する</b><small>Ctrl＋K または ／</small></span></button><div class="k-rows" style="margin-top:10px">${[["レート表の登録（Excel・CSV から取り込み）", "frates"], ["依頼ページ（荷主への質問と回答の管理）", "frq"], ["相見積と AI の推奨の見方", "fagg"]].map((x) => `<button type="button" class="k-row" ${act(() => closeGo(x[1]))}><span class="k-rt"><b>${esc(x[0])}</b></span>${I("arr", 16)}</button>`).join("")}</div>` })}
          <div>${card({ ic: "chat", t: "AI物流マンに質問する", st: "margin-bottom:12px", b: `<small style="display:block;color:var(--k-ink2);font-weight:600;margin-bottom:10px">操作も物流の知識も AI に聞けます。</small><button type="button" class="k-btn wide" ${act(() => closeGo("fai"))}>${I("chat", 18)}AI物流マンに相談</button>` })}
          ${card({ ic: "help", t: "お困りのときは", b: `<button type="button" class="k-btn white wide" ${act(contact)}>${I("mail", 18)}お問い合わせを送る</button><button type="button" class="k-btn white wide" style="margin-top:8px" data-rdquick="1">${I("book", 18)}3分でわかるスタートガイド</button><a class="k-btn white wide" style="margin-top:8px;text-decoration:none" href="guide/" target="_blank" rel="noopener">${I("book", 18)}はじめてガイド（別のタブ）</a>` })}</div>
        </div>`;
    } else {
      hd.innerHTML = `<div class="rd-hero" style="min-height:100px;margin-bottom:10px"><img class="rd-bot" src="${IMG}robot.png" alt="" style="width:88px"><div class="rd-ht"><div class="k-bc">貿易クラウド AI商社マン ／ 管理者コンソール</div><h1 style="font-size:26px">管理者サポートセンター</h1><p>トライアルの発行・利用状況・AI設定や同期の困りごとを、すぐに解決できます。</p></div></div>
        ${card({ ic: "flag", t: "管理者が最初にやること", st: "margin-bottom:12px", b: steps([{ t: "トライアルを発行", s: "会社名と担当者を入れて発行", ic: "users", go: () => navTo(/新しいアカウントを発行/) }, { t: "利用状況を確認", s: "ログイン・質問・アップロード", ic: "chart", go: () => navTo(/数字（概要）|利用の推移/) }, { t: "AIと連携を確認", s: "接続テストと同期の状態", ic: "link", go: () => navTo(/AIエンジン設定/) }]) })}
        <div class="k-grid" style="grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);margin-bottom:12px">
          ${card({ ic: "alert", t: "よくある困りごと", b: `<div class="k-rows">${[["招待したお客様がログインできない", /メンバー管理/], ["同期サーバーにつながらない", /クラウド同期/], ["AI の回答が返らない・遅い", /AIエンジン設定/], ["トライアルの期間を変えたい", /アカウント一覧/]].map((x) => `<button type="button" class="k-row" ${act(() => navTo(x[1]))}><span class="k-rt"><b>${esc(x[0])}</b></span>${I("arr", 16)}</button>`).join("")}</div>` })}
          ${card({ ic: "zap", t: "すぐできる操作", b: `<div class="k-rows">${[["users", "トライアルアカウントを発行", /新しいアカウントを発行/], ["chart", "利用状況（数字）", /数字（概要）/], ["refresh", "同期・端末を確かめる", /クラウド同期/], ["chat", "管理者AIに相談", /管理者AI/]].map((x) => `<button type="button" class="k-row" ${act(() => navTo(x[2]))}>${I(x[0], 18)}<span class="k-rt"><b>${esc(x[1])}</b></span>${I("chevR", 16, 2.4)}</button>`).join("")}</div>` })}
        </div>`;
    }
    pn.prepend(hd);
    const dw = document.getElementById("dw"); if (dw) dw.classList.add("rd-wide");
    return true;
  }
  const mo = new MutationObserver(() => {
    const pn = document.getElementById("pn"), dw = document.getElementById("dw");
    if (!pn || !dw || dw.dataset.open !== "true") return;
    const t = pn.textContent || "";
    if (/ヘルプ・使い方/.test(t)) helpHd(pn);
    else if (/AI見積 RQ-/.test(t)) decoQuote(pn);
    else if (/管理者AIに質問/.test(t) && role() === "adm") decoAdmAi(pn);
  });
  const startMo = () => { const dw = document.getElementById("dw"); if (dw) mo.observe(dw, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-open"] }); else setTimeout(startMo, 400); };
  startMo();

  /* ───── 仕上げに足す ───── */
  const after0 = RD.after;
  RD.after = function () { const r = after0.apply(this, arguments); try { crumb(); modeChip(); } catch (e) { console.error("[rd3]", e); } return r; };
  setInterval(() => { try { if (!RD.locked()) { crumb(); modeChip(); } } catch (e) { /* 無視 */ } }, 800);
  try { RD.after(true); } catch (e) { /* まだ */ }
})();

} catch (e) { try { console.error("[rd] rd_pages3.js", e); } catch (x) { } }
/* ==== rd_uat.js ==== */
try {
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
    "検疫": "動物・植物・食品などが、病気や害虫を持ち込まないかを、国境で調べる手続きです。",
    "通関業者": "税関への申告を、荷主の代わりに行う会社（通関の専門業者）です。",
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
    [["HS コード", "HSコード"], ["仕向け地", "仕向地"], ["原産地証明", "原産地証明書"]].forEach(([a, k]) => { if (M[k] && !M[a]) M[a] = Object.assign({}, M[k], { k: a }); }); // 書き方の揺れ
    const er = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
    const keys = Object.keys(M).sort((a, b) => b.length - a.length);
    // 英字の語は前が英数字でなく、後ろが英字でないときだけ（「FOB/CIF」の FOB・CIF、「MOQ300本」の MOQ も拾う）
    TERM_RE = new RegExp(keys.map((k) => (/^[A-Za-z0-9/]+$/.test(k) ? `(?<![A-Za-z0-9])${er(k)}(?![A-Za-z])` : er(k))).join("|"), "g");
    TERM = M;
    return M;
  }
  RD.termDict = termDict;
  /* 11/12 大瀧さんのご意見「HSコードなどの専門用語は、押すと説明が出るように」：
     前は「画面ごとに最初の16語・1回目だけ」で、2回目以降・入力欄の名前・札（チップ）・表の見出しの用語は押せなかった。
     → 画面の中の用語は、どこに出ても押すと説明（カードごとの1回目に「？」、同じカードの2回目からは点線だけ）。
       今のアプリが付けている用語の印（.tm・.v54term）も同じ見た目・同じ説明の窓にそろえる。
     押せる部品（ボタン・リンク・押せる行）の中の文字は、押した先が変わらないよう印を付けない */
  // [data-noi18n]（訳さない印）は外した：数字の欄の説明（「FOB 相当」など）も日本語なので押せるように。外国語の欄は [lang] で除く
  const SKIP = "script,style,textarea,input,select,option,button,a,code,pre,abbr,svg,summary,h1,[contenteditable],.k-term,.tm,.v54term,.bb,.ci,[lang]:not([lang^=ja]),[role=button],[data-onclick],[data-kact],.k-tag,.p,#k-tp,.k-termhint";
  const TERM_SEL = ".k-term:not(.k-termdemo), .tm, .v54term";
  const TERM_MAX = 400; // 1画面で付ける印の上限（重くならないように）
  const BLOCK = ".c, .k-card, section, details, table, .rd-hero, .rd-card";
  let termBusy = false;
  const termKeyOf = (el) => {
    if (el.dataset.kterm) return el.dataset.kterm;
    const s = String(el.dataset.term || el.textContent || "").trim();
    return /^HS\s?コード/.test(s) ? "HSコード" : s;
  };
  function termScan() {
    if (termBusy || RD.locked() || isAdmin() || !isJa()) return 0;
    const w = document.getElementById("well"); if (!w) return 0;
    const D = termDict(); if (!TERM_RE) return 0;
    termBusy = true;
    let made = 0;
    try {
      let n0 = $$(".k-term", w).length;
      if (n0 >= TERM_MAX) return 0;
      // カードごとに「？」を付けた用語（今のアプリの印も数える）
      const blk = (el) => (el.parentElement && el.parentElement.closest(BLOCK)) || w;
      const seen = new Map();
      const saw = (b, k) => { let s = seen.get(b); if (!s) { s = new Set(); seen.set(b, s); } if (s.has(k)) return true; s.add(k); return false; };
      $$(".k-term:not(.k-t2), .tm, .v54term", w).forEach((x) => saw(blk(x), termKeyOf(x)));
      const tw = document.createTreeWalker(w, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
        acceptNode(n) {
          if (n.nodeType === 1) { if (n.matches(SKIP)) return NodeFilter.FILTER_REJECT; if (!n.getClientRects().length && n.tagName !== "TBODY" && n.tagName !== "TR") return NodeFilter.FILTER_REJECT; return NodeFilter.FILTER_SKIP; }
          return /\S/.test(n.nodeValue || "") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        },
      });
      const texts = [];
      for (let n = tw.nextNode(); n; n = tw.nextNode()) texts.push(n);
      for (const t0 of texts) {
        if (n0 + made >= TERM_MAX) break;
        let t = t0;
        TERM_RE.lastIndex = 0;
        let s = t.nodeValue, m, guard = 0;
        while (t && (m = TERM_RE.exec(s)) && guard++ < 40) {
          const key = m[0];
          if (!D[key]) continue;
          const b = blk(t);
          const again = saw(b, key);
          const mid = t.splitText(m.index);
          const rest = mid.splitText(key.length);
          const ab = document.createElement("abbr");
          ab.className = again ? "k-term k-t2" : "k-term"; ab.tabIndex = 0; ab.dataset.kterm = key;
          ab.setAttribute("aria-label", key + "（押すと説明）");
          mid.parentNode.replaceChild(ab, mid); ab.appendChild(mid);
          made++;
          t = rest; s = t.nodeValue; TERM_RE.lastIndex = 0;
          if (n0 + made >= TERM_MAX) break;
        }
      }
      if (made || $(".k-term", w)) termHint(w);
    } catch (e) { console.error("[rd uat term]", e); } finally { termBusy = false; }
    return made;
  }
  RD.termScan = termScan;
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
    const D = termDict(), key = termKeyOf(ab);
    let x = D[key];
    if (!x && ab.getAttribute("data-def")) x = { n: key, s: ab.getAttribute("data-def"), long: "" }; // 今のアプリの印（辞書に無い語は、アプリの説明をそのまま）
    if (!x) return;
    if (tpFor === ab && document.getElementById("k-tp")) { if (pin) tpPin = true; return; }
    tpClose();
    const d = document.createElement("div");
    d.id = "k-tp"; d.setAttribute("role", "tooltip");
    const canAsk = !RD.locked() && !isAdmin() && !RD.isFwd();
    d.innerHTML = `<b>${esc(x.n)}</b><p>${esc(x.s)}</p>${x.long ? `<details><summary>くわしく</summary><p class="k-tpl">${esc(x.long)}</p></details>` : ""}<div class="k-tpgo">${canAsk ? `<button type="button" class="k-link" data-kaskterm="${esc(x.k || key)}">${I("chat", 15)}AI商社マンに、うちの場合を聞く</button>` : ""}<button type="button" class="k-link" data-kgloss="1">${I("book", 15)}用語集（貿易のことばの一覧）を開く</button></div>`; // 物流会社は一覧を窓で開く（rd_1112.js・No.364）
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
  // 今のアプリの印（.tm・.v54term）も、刷新版では同じ説明の窓で出す（ログイン後・日本語の画面だけ）
  // 押せる部品（ボタン・リンク・押せる行）の中にある今のアプリの印は、押したときは部品の働きを優先する（説明は指を置いたときだけ）
  const termAt = (t, click) => {
    if (!t || !t.closest || RD.locked() || isAdmin() || !isJa()) return null;
    const ab = t.closest(TERM_SEL);
    if (!ab || ab.closest(".k-termdemo")) return null;
    if (click && !ab.classList.contains("k-term") && ab.parentElement && ab.parentElement.closest("button,a,[data-onclick],[role=button],summary,[data-kact]")) return null;
    return ab;
  };
  document.addEventListener("mouseover", (e) => {
    const ab = termAt(e.target);
    if (!ab) return;
    clearTimeout(tpT);
    tpT = setTimeout(() => tpOpen(ab, false), 180);
  });
  document.addEventListener("mouseout", (e) => {
    const ab = termAt(e.target);
    if (!ab || tpPin) return;
    clearTimeout(tpT);
    tpT = setTimeout(() => { if (!tpPin) tpClose(); }, 250);
  });
  document.addEventListener("click", (e) => {
    const g = e.target.closest && e.target.closest("[data-kgloss]");
    if (g) { e.preventDefault(); e.stopPropagation(); tpClose(); try { closeDW(); } catch (x) { /* 無い */ } goKey("gloss"); return; } // eslint-disable-line no-undef
    const q = e.target.closest && e.target.closest("[data-kaskterm]");
    if (q) { e.preventDefault(); e.stopPropagation(); const k = q.dataset.kaskterm; tpClose(); try { closeDW(); } catch (x) { /* 無い */ } askPrefill(`「${k}」について、うちの商品・販売先国の場合に気をつけることを教えて`); return; } // eslint-disable-line no-undef
    const ab = termAt(e.target, true);
    if (ab) { e.preventDefault(); e.stopPropagation(); if (tpFor === ab && tpPin) tpClose(); else { clearTimeout(tpT); tpClose(); tpOpen(ab, true); } return; }
    if (!(e.target.closest && e.target.closest("#k-tp"))) tpClose();
  }, true);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { tpClose(); densClose(); }
    const ab = termAt(e.target, true);
    if (ab && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); tpOpen(ab, true); }
  });
  window.addEventListener("scroll", () => { if (!tpPin) tpClose(); }, { passive: true, capture: true });
  // 中身が描き直されたら、少し待って用語を付け直す
  // 書き換えが続く画面（時計・進み具合の表示など）でも後回しにし続けないよう、待つのは最長1.5秒（11/12）
  let termT = 0, termT0 = 0;
  const termRun = () => { termT0 = 0; termScan(); };
  const termMo = new MutationObserver(() => { if (termBusy) return; if (!termT0) termT0 = Date.now(); clearTimeout(termT); termT = setTimeout(termRun, Date.now() - termT0 > 1500 ? 0 : 700); });

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
      <p>ふだん <b>30〜60秒</b>ほどかかります。データが多いと、もう少しかかります。この画面のままお待ちください。${sec > 90 ? "<br><b>時間がかかっています。</b>通信の状態を確かめて、2分たっても進まないときは、ページを読み込み直してください。" : ""}</p></div></div>`; // No.367（11/12）：前は「15〜30秒」・60秒で切り替え。実測は荷主・物流会社とも 40〜45秒（大半は同期サーバーの待ち）
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
    clearTimeout(termT); termT = setTimeout(termRun, 250);
  }
  const old = RD.after;
  RD.after = function () { const r = old.apply(this, arguments); try { afterUat(); } catch (e) { console.error("[rd uat]", e); } return r; };
  setInterval(() => { try { if (!RD.locked()) densBtn(); } catch (e) { /* 無視 */ } }, 1500);
  try { afterUat(); } catch (e) { /* まだ */ }
})();

} catch (e) { try { console.error("[rd] rd_uat.js", e); } catch (x) { } }
/* ==== rd_1112.js ==== */
try {
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
    // 11/12 三井さんのご意見：ログイン後の最初の画面＝案件一覧。導線は「商品管理」と「案件管理」の2つ
    st: [
      { ic: "box", t: "商品を登録する", b: "商品の資料（PDF・Excel・写真など）をアップロードするだけ。AIが読み取り、足りない情報だけを質問します。", go: [["up", "商品を登録する"]] },
      { ic: "globe", t: "売り先の国を選ぶ", b: "AIが、商品に合った国をデータでおすすめします。3か国まで選んで「確定」します。", go: [["cty", "販売先国の選定を開く"]] },
      { ic: "send", t: "営業資料をつくり、バイヤーを探す", b: "外国語の営業資料は、AIが商品に合わせて作ります。「AIバイヤー開拓」で相手を見つけて、提案します。", go: [["deck", "営業資料を開く"], ["db", "AIバイヤー開拓を開く"]] },
      { ic: "brief", t: "「案件」で商談を進める", b: "連絡した相手ごとに案件ができます（ログインすると最初に開く画面）。行を押すと、次の行動・やりとり・書類が1画面で見られます。", go: [["dash:home", "案件を開く"]] },
      { ic: "chat", t: "困ったら「AI商社マン」", b: "わからないことは、日本語でそのまま聞けます。案件の中からも聞けます。説明は「？」を押すと出ます。", go: [["ai", "AI商社マンに聞く"]] },
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

  /* ───────── No.364（11/12 回帰）：物流会社の「用語集」 ─────────
     今のアプリの物流会社の画面には、用語集のページが無い。見出しの「用語集」・説明の窓の「一覧を開く」は goKey("gloss") を呼ぶので、
     物流会社では fwdCur が "gloss" になり、見出しだけ「用語集」で中身は見積受信箱が描かれていた
     → 物流会社では、用語の一覧（説明つき・言葉で探せる）を、この画面の上の窓で開く。荷主は今のアプリの用語集のページのまま */
  let glBack = null;
  function glClose() {
    const d = document.getElementById("k-gl"); if (!d) return;
    d.remove();
    document.documentElement.classList.remove("k-qgon");
    if (glBack && document.contains(glBack)) { try { glBack.focus(); } catch (e) { /* 無視 */ } }
    glBack = null;
  }
  function glList() {
    const D = RD.termDict ? RD.termDict() : {};
    const seen = new Set(), L = [];
    Object.keys(D).forEach((k) => { const x = D[k]; if (!x || !x.s) return; const n = x.n || k; const id = n + "\n" + x.s; if (seen.has(id)) return; seen.add(id); L.push({ n, s: x.s, long: x.long || "" }); });
    return L.sort((a, b) => a.n.localeCompare(b.n, "ja"));
  }
  function glossFwd() {
    glClose(); qgClose();
    const L = glList();
    glBack = document.activeElement;
    const d = document.createElement("div");
    d.id = "k-gl"; d.className = "k-qg k-gl rd-x";
    d.setAttribute("role", "dialog"); d.setAttribute("aria-modal", "true"); d.setAttribute("aria-labelledby", "k-glt");
    d.innerHTML = `<div class="k-qgbox">
      <button type="button" class="k-qgx" data-glclose="1" aria-label="閉じる">${I("x", 22, 2.4)}</button>
      <div class="k-glhd"><span class="k-qgi">${I("book", 24, 1.9)}</span><div><h2 id="k-glt">用語集（貿易のことばの一覧）</h2><p>画面に出てくる貿易の言葉を、やさしく説明します（${L.length}語）。画面の点線の言葉は、押すとその場で説明が出ます。</p></div></div>
      <label class="k-glq">${I("search", 18)}<input type="search" id="k-glq" placeholder="言葉で探す（例：FOB、B/L、通関）" autocomplete="off" aria-label="言葉で探す"></label>
      <p class="k-gln" id="k-gln" aria-live="polite"></p>
      <ul class="k-gll" id="k-gll">${L.map((x) => `<li data-q="${esc((x.n + " " + x.s + " " + x.long).toLowerCase())}"><b>${esc(x.n)}</b><p>${esc(x.s)}</p>${x.long ? `<details><summary>くわしく</summary><p>${esc(x.long)}</p></details>` : ""}</li>`).join("")}</ul>
      <div class="k-qgft"><div class="k-qgfb"><span></span><button type="button" class="k-btn" data-glclose="1">${I("check", 17, 2.6)}閉じる</button></div></div>
    </div>`;
    document.body.appendChild(d);
    document.documentElement.classList.add("k-qgon");
    const q = $("#k-glq", d);
    q.addEventListener("input", () => {
      const v = q.value.trim().toLowerCase(); let n = 0;
      $$("#k-gll li", d).forEach((li) => { const hit = !v || li.dataset.q.includes(v); li.hidden = !hit; if (hit) n++; });
      $("#k-gln", d).textContent = v ? (n ? `${n}語が見つかりました` : "見つかりませんでした。英字・カタカナなど、別の書き方でも探せます。わからないときは「AIに聞く」で聞けます。") : "";
    });
    q.focus();
  }
  RD.glossFwd = glossFwd;
  const goKey1 = RD.goKey;
  RD.goKey = function (k) { if (k === "gloss" && !RD.locked() && !isAdmin() && RD.isFwd()) { glossFwd(); return; } return goKey1.apply(this, arguments); };

  document.addEventListener("click", (e) => {
    const q = e.target.closest && e.target.closest("[data-rdquick]");
    if (q) { e.preventDefault(); e.stopPropagation(); quickGuide(); return; }
    const gd = document.getElementById("k-gl");
    if (gd && (e.target === gd || (e.target.closest && e.target.closest("[data-glclose]")))) { e.preventDefault(); glClose(); return; }
    const d = document.getElementById("k-qg"); if (!d) return;
    if (e.target === d || (e.target.closest && e.target.closest("[data-qgclose]"))) { e.preventDefault(); qgClose(); return; }
    const g = e.target.closest && e.target.closest("[data-qggo]");
    if (g) { e.preventDefault(); const k = g.dataset.qggo; qgClose(); try { closeDW(); } catch (x) { /* 無い */ } RD.goKey(k); return; } // eslint-disable-line no-undef
    const h = e.target.closest && e.target.closest("[data-qghelp]");
    if (h) { e.preventDefault(); qgClose(); if (RD.openHelp) RD.openHelp(); }
  }, true);
  document.addEventListener("keydown", (e) => {
    const d = document.getElementById("k-qg") || document.getElementById("k-gl"); if (!d) return;
    if (e.key === "Escape") { e.preventDefault(); if (d.id === "k-gl") glClose(); else qgClose(); return; }
    if (e.key === "Tab") { // 窓の中だけを回る
      const f = $$("button, a[href], input, summary", d).filter((x) => x.getClientRects().length);
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

} catch (e) { try { console.error("[rd] rd_1112.js", e); } catch (x) { } }
/* ==== rd_case.js ==== */
try {
/* 貿易クラウドAI商社マン デザイン刷新：社内の意見（2026-11-12 三井さん）への改良
   SaaS としてお客様が毎日自分で開いて使う形に。
   ① 文字を減らす：画面は「見出し・数字・ボタン」。説明は見出しの「？」（押す・乗せると出る）へ。長いボタンの文言は短く（全文は乗せると出る）
   ② 流れ：ログイン後の最初の画面＝案件一覧。左のメニューは 案件／商品／タスク／やりとり／AI商社マン の5つ（＋困ったとき・すべての機能）。
      どの画面も見出しの上に「いまどこ」（押せるパンくず）、見出しの右に「次は」
   ③ 貿易クラウド1.0 の案件一覧の使いやすさ：1行＝1案件（相手・国・ステータス・次の行動・最終やりとり）、
      相手の最新メッセージ順・お気に入り・絞り込み。行を押すと案件の詳細（次の行動・やりとり・タスク・書類・商談の記録・相手の情報）を1画面で。
      AI の機能（返信の文案・見積・規制・次の一手）は案件の中から呼ぶ
   導線は2つ（三井さんの返信）：案件管理（案件一覧）と商品管理（商品一覧）
   今のアプリの関数は呼ぶだけ（差し替えない）。数字・状況・次の行動は、アプリが持っているデータから出す（架空の数字は出さない）。
   今の版の機能は1つも消さない：これまでのホーム（ダッシュボード）は案件一覧のいちばん下にたたんで残し、「すべての機能」の「分析・レポート」でも全部見える */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._case) return;
  RD._case = 1;
  const { I, esc, $, $$, G, flag } = RD;
  const act = (fn) => RD.act(fn);
  const goKey = (k) => RD.goKey(k);
  const isAdmin = () => { const S = G("SES"); return !!(S && S.t === "admin"); };
  const isJa = () => { const s = document.getElementById("lang"); return !s || !s.value || /^ja/.test(s.value); };
  const ls = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* 無視 */ } } };
  const DAY = 864e5;
  const days = (ms) => (ms ? Math.max(0, Math.floor((Date.now() - ms) / DAY)) : null);
  const md = (ms) => { if (!ms) return ""; const d = new Date(ms); return `${d.getMonth() + 1}/${d.getDate()}`; };
  const when = (ms) => { const n = days(ms); return n == null ? "" : n === 0 ? "今日" : n === 1 ? "昨日" : n < 7 ? n + "日前" : md(ms); };
  const clip = (s, n) => { s = String(s || "").replace(/[*#>`_]/g, "").replace(/\s+/g, " ").trim(); return s.length > n ? s.slice(0, n - 1) + "…" : s; };
  const tensAll = () => { try { return typeof TENS !== "undefined" && Array.isArray(TENS) ? TENS : []; } catch (e) { return []; } }; // eslint-disable-line no-undef
  const curTen = () => G("TEN") || null;
  const curPi = () => tensAll().indexOf(curTen());

  /* ───────── 案件（＝相手ごとのやりとり。今のアプリの dmThreads） ───────── */
  const BM = ["コンタクト中（一方的なアプローチ）", "商談中", "サンプル出荷", "見積提示", "契約交渉", "取引中", "失注"];
  const STS = (s) => RD.stShort(s);
  const ST_ORDER = { コンタクト中: 0, 商談中: 1, サンプル出荷: 2, 見積提示: 3, 契約交渉: 4, 取引中: 5, 失注: -1 };
  const msgAt = (m) => +((m && m.at) || 0);
  function nextOf(c) {
    // 次の行動：AI の読み取り（返事ごとの「次にやること」）＞ やりとりの順番（どちらの番か）＞ 経過日数。どれもアプリのデータから
    if (c.ss === "失注") return { t: "失注（振り返りを残す）", kind: "lost", ic: "doc" };
    if (!c.msgs.length) return { t: "最初の連絡を送る", kind: "start", ic: "send" };
    if (c.lastW === "by" || c.unread > 0) {
      const v = c.th.v72;
      const ok = v && c.lastIn && String(v.sig || "").indexOf(String(msgAt(c.lastIn)) + "|") === 0 && Array.isArray(v.next) && v.next[0];
      if (ok) return { t: String(v.next[0]), more: v.next.slice(1).map(String), ai: 1, draft: !!v.draft, kind: "reply", ic: "spark", why: v.summary || "" };
      return { t: "返信する", kind: "reply", ic: "mail" };
    }
    const n = days(c.lastAt) || 0;
    if (n >= 7) return { t: `フォローの連絡（${n}日 返事なし）`, kind: "follow", ic: "clock" };
    return { t: "相手の返事を待つ", kind: "wait", ic: "clock", sub: `${when(c.lastAt)}に送信` };
  }
  function favKey(c) { const S = G("SES") || {}; return [S.code || S.who || "", c.prod || "", c.id].join("|"); }
  const favs = () => ls.get("rd_fav", {});
  const isFav = (c) => !!favs()[favKey(c)];
  function toggleFav(c) { const F = favs(), k = favKey(c); if (F[k]) delete F[k]; else F[k] = 1; ls.set("rd_fav", F); return !!F[k]; }
  function casesOf(t, pi) {
    if (!t) return [];
    const MB = Array.isArray(t.myBuyers) ? t.myBuyers : [];
    const prod = t.sku || t.item || "";
    return Object.values(t.dmThreads || {}).filter((th) => th && Array.isArray(th.msgs) && th.msgs.length).map((th) => {
      const b = MB.find((x) => x && x.id === th.id);
      const msgs = th.msgs.slice().sort((a, c) => msgAt(a) - msgAt(c));
      const last = msgs[msgs.length - 1] || null;
      const ins = msgs.filter((m) => m.w === "by"), mes = msgs.filter((m) => m.w === "me");
      const c = {
        key: pi + "|" + th.id, pi, th, t, id: th.id, b, prod, item: t.item || "",
        name: b && b.co ? b.co : `${th.cty || ""}の${th.biz || "バイヤー"}`, named: !!(b && b.co),
        cty: th.cty || (b && b.cty) || "", biz: (b && b.biz) || th.biz || "", lang: th.lang || "",
        st: th.status || BM[0], why: th.statusWhy || "", msgs, last, lastAt: msgAt(last) || +th.statusAt || 0,
        lastIn: ins[ins.length - 1] || null, lastMe: mes[mes.length - 1] || null, lastW: last ? last.w : "", unread: +th.unread || 0,
      };
      c.ss = STS(c.st);
      c.inAt = msgAt(c.lastIn);
      c.next = nextOf(c);
      c.todo = c.next.kind === "reply";
      return c;
    });
  }
  function allCases() {
    const T = tensAll(), t0 = curTen();
    let L = [];
    if (T.length && T.indexOf(t0) >= 0) T.forEach((t, i) => { L = L.concat(casesOf(t, i)); });
    else L = casesOf(t0, -1); // 見本の商品など、商品の一覧の外を表示しているとき
    return L;
  }
  RD.allCases = allCases;

  /* ───────── 商品の切り替え（今のアプリの「会社・商品の切り替え」#psw と同じ動き） ───────── */
  function switchProd(pi) {
    return new Promise((res) => {
      const T = tensAll();
      if (pi < 0 || T[pi] === curTen()) return res(true);
      const s = document.getElementById("psw");
      if (!s || !Array.from(s.options).some((o) => o.value === "t:" + pi)) return res(false);
      s.value = "t:" + pi;
      s.dispatchEvent(new Event("change"));
      let n = 0;
      const tm = setInterval(() => { n++; if (tensAll()[pi] === curTen() || n > 50) { clearInterval(tm); res(tensAll()[pi] === curTen()); } }, 100);
    });
  }

  /* ───────── ① 説明は「？」へ（押す・乗せると出る） ───────── */
  let tip = null, tipFor = null, tipPin = false;
  function tipClose() { if (tip) tip.remove(); tip = null; if (tipFor) { tipFor.setAttribute("aria-expanded", "false"); tipFor.removeAttribute("aria-describedby"); } tipFor = null; tipPin = false; }
  function tipOpen(b, pin) {
    if (tipFor === b) { if (pin) tipPin = !tipPin ? true : false; if (pin && !tipPin) { tipClose(); } return; }
    tipClose();
    const tx = String(b.dataset.kq || "").trim(); if (!tx) return;
    tip = document.createElement("div");
    tip.id = "k-qtip"; tip.className = "k-qtip"; tip.setAttribute("role", "tooltip");
    tip.innerHTML = tx.split(/\n{2,}/).map((p) => `<p>${esc(p)}</p>`).join("");
    document.body.appendChild(tip);
    const r = b.getBoundingClientRect(), tw = Math.min(360, window.innerWidth - 24);
    tip.style.maxWidth = tw + "px";
    const th = tip.offsetHeight, ww = tip.offsetWidth;
    let x = Math.min(Math.max(12, r.left + r.width / 2 - ww / 2), window.innerWidth - ww - 12);
    let y = r.bottom + 8; if (y + th > window.innerHeight - 8 && r.top - th - 8 > 8) y = r.top - th - 8;
    tip.style.left = x + "px"; tip.style.top = y + "px";
    tipFor = b; tipPin = !!pin;
    b.setAttribute("aria-expanded", "true"); b.setAttribute("aria-describedby", "k-qtip");
  }
  const qBtn = (text, lab) => `<button type="button" class="k-q" data-kq="${esc(text)}" aria-label="${esc(lab || "説明")}" aria-expanded="false">?</button>`;
  RD.qBtn = qBtn;
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest(".k-q");
    if (b) { e.preventDefault(); e.stopPropagation(); if (tipFor === b && tipPin) { tipClose(); return; } tipOpen(b, true); return; }
    if (tip && !(e.target.closest && e.target.closest("#k-qtip"))) tipClose();
  }, true);
  document.addEventListener("mouseover", (e) => { const b = e.target.closest && e.target.closest(".k-q"); if (b && !tipPin) tipOpen(b, false); });
  document.addEventListener("mouseout", (e) => { const b = e.target.closest && e.target.closest(".k-q"); if (b && tipFor === b && !tipPin && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest("#k-qtip"))) tipClose(); });
  document.addEventListener("focusin", (e) => { const b = e.target.closest && e.target.closest(".k-q"); if (b && !tipPin) tipOpen(b, false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && tip) { tipClose(); } });
  window.addEventListener("scroll", () => { if (tip && !tipPin) tipClose(); }, true);

  // 見出し（ヒーロー）：説明の1行を「？」へ。ヒーローは細く（題・？・次は）
  function slimHero(w) {
    const h = $("[data-rdhero]", w);
    if (!h) return null;
    h.classList.add("k-slim");
    const ht = $(".rd-ht", h), h1 = ht && $("h1", ht);
    if (!h1) return h;
    // 「？」は見出しのすぐ横（見出しの文字には入れない＝読み上げ・見出しの文字は今のまま）
    let q = $(":scope > .k-q", ht);
    const ps = $$(":scope > p:not(.k-termhint)", ht).filter((p) => (p.textContent || "").trim());
    const hint = $(".k-termhint", ht);
    const txt = ps.map((p) => p.textContent.trim()).concat(hint ? ["点線の言葉は、押すと説明が出ます（一覧は用語集）。"] : []).join("\n\n");
    ps.forEach((p) => { p.hidden = true; p.classList.add("k-qhide"); });
    if (hint) hint.classList.add("k-hint2");
    if (txt) {
      if (!q) { h1.insertAdjacentHTML("afterend", qBtn(txt, "この画面の説明")); }
      else { if (q.dataset.kq !== txt) q.dataset.kq = txt; if (q.previousElementSibling !== h1) h1.after(q); }
    }
    return h;
  }
  // カードの見出しの小さな説明（k-hs・rd-chs）を「？」へ
  function foldSubs(w) {
    $$(".k-h > .k-hs, .rd-ch > .rd-chs", w).forEach((s) => {
      if (s.dataset.kq) return;
      const t = (s.textContent || "").replace(/^[（(]|[）)]$/g, "").trim();
      s.dataset.kq = "1";
      if (t.length < 6 || /[0-9０-９]/.test(t) || s.querySelector("button, a, input, select")) return; // 数字の入った説明（件数など）は数字なので残す
      const hd = s.parentElement && $("h2, h3", s.parentElement);
      s.hidden = true; s.classList.add("k-qhide");
      if (hd && !$(".k-q", hd)) hd.insertAdjacentHTML("beforeend", qBtn(t));
      else if (hd) { const q = $(".k-q", hd); q.dataset.kq += "\n\n" + t; }
    });
  }
  // 今のアプリの説明文・注意書き（.nn など）：見出しの「？」へ移す（押せる部品の入った文・警告は、そのまま見せる）
  const NOTE_SEL = "p.nn, .nn > p, div.nn, p.kd, .kd, .info, .v69fst, .v82fbrk, .v84m-note";
  const WARN_RE = /warn|alert|err|crit|danger/i;
  function foldNotes(w) {
    let n = 0;
    $$(NOTE_SEL, w).forEach((p) => {
      if (p.dataset.kqn || p.closest(".rd-x") || p.closest("[data-rdhero]") || p.closest(".k-hold")) return;
      p.dataset.kqn = "1";
      const t = (p.textContent || "").replace(/\s+/g, " ").trim();
      if (t.length < 40) return;
      if (p.querySelector("button, a[href], input, select, textarea, label, summary, [data-onclick], [role=button], [data-kact], .p, .k-tag")) return;
      if (/⚠|❗|‼|🚫/.test(t) || WARN_RE.test(p.className) || (p.parentElement && WARN_RE.test(p.parentElement.className))) return;
      if (p.nextElementSibling && p.nextElementSibling.classList.contains("rd-more")) p.nextElementSibling.remove();
      p.style.webkitLineClamp = ""; p.style.display = "";
      const box = p.closest(".c, section, .card, .k-card, details") || p.parentElement;
      const hs = box ? $$("h3, h2, h4, summary", box).filter((x) => !x.closest(".rd-x") && (x.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_FOLLOWING)) : [];
      let hd = hs[hs.length - 1] || null; // いちばん近い前の見出し
      if (hd && (hd.tagName === "SUMMARY" || hd.closest("button, a, summary, [role=button], [data-onclick]"))) hd = null; // 押せる見出しの中にボタンは置かない
      p.classList.add("k-qhide");
      if (hd) {
        const q = $(".k-q", hd);
        if (q) q.dataset.kq += "\n\n" + t; else hd.insertAdjacentHTML("beforeend", qBtn(t));
      } else {
        p.insertAdjacentHTML("beforebegin", `<span class="k-qline">${qBtn(t, "説明を見る")}<span>説明</span></span>`);
      }
      n++;
    });
    return n;
  }
  // 長いボタンの文言を短く（全文は乗せると出る・押した先は同じ）
  //   「〇〇」で進める → 進める ／ 末尾の（説明）は隠す（数字の入った（）は数字なので残す）
  function shortBtns(w) {
    $$("button, [role=button], a.k-link", w).forEach((b) => {
      if (b.dataset.kfull || b.closest(".k-dd") || b.classList.contains("k-q")) return;
      if (!b.getClientRects().length) return; // たたんだ欄の中など、見えていないボタンは見えたときに（全文を見えている文字で取るため）
      const tn = Array.from(b.childNodes).filter((x) => x.nodeType === 3 && x.nodeValue.trim());
      if (tn.length !== 1 || b.querySelector("span:not(.k-paren):not([aria-hidden]), b, small, strong")) { b.dataset.kfull = ""; return; } // 飾りの絵文字（aria-hidden）はよい
      const cl = b.cloneNode(true); cl.querySelectorAll("[aria-hidden], svg").forEach((x) => x.remove());
      const node = tn[0], s = node.nodeValue, full = (cl.textContent || "").replace(/\s+/g, " ").trim(); // 全文（飾りの絵文字〔aria-hidden〕は入れない＝今の版の見え方とそろえる）
      let m = s.match(/^(\s*🔗?\s*)(「[^」]{2,}」で)(進める|開く|確認する|始める)(\s*)$/);
      if (m) {
        const sp = document.createElement("span"); sp.className = "k-paren"; sp.textContent = m[2];
        node.nodeValue = m[1]; b.insertBefore(sp, node.nextSibling); b.insertBefore(document.createTextNode(m[3] + m[4]), sp.nextSibling);
        b.dataset.kfull = full; if (!b.title) b.title = full; return;
      }
      m = s.match(/^(.{4,}?)(\s*（[^（）0-9０-９]{6,}）)(\s*)$/);
      if (m && full.length > 14) {
        const sp = document.createElement("span"); sp.className = "k-paren"; sp.textContent = m[2];
        node.nodeValue = m[1]; b.insertBefore(sp, node.nextSibling); if (m[3]) b.insertBefore(document.createTextNode(m[3]), sp.nextSibling);
        b.dataset.kfull = full; if (!b.title) b.title = full; return;
      }
      b.dataset.kfull = "";
    });
  }
  RD.shortBtns = shortBtns;
  // ボタン・数のタイルの中の「説明の小さな字」は、乗せると出る（title）へ。数字・状態（準備中など）の字は残す
  const KEEP_RE = /[0-9０-９]|Coming|準備中|開発中|済み|未|件|%|％|円|\$|日前|今日/;
  function descSmall(w) {
    $$("button small, [role=button] small, button .k-ts, .k-tile .k-ts, .rd-tile .rd-ts, .rd-kpi .rd-ks", w).forEach((s) => {
      if (s.dataset.kds || !s.getClientRects().length) return; // 見えていないものは見えたときに
      s.dataset.kds = "1";
      const t = (s.textContent || "").replace(/\s+/g, " ").trim();
      if (t.length < 6 || KEEP_RE.test(t) || s.querySelector("button, a, input, select")) return;
      const host = s.closest("button, [role=button], .k-tile, .rd-tile, .rd-kpi");
      if (!host || host.closest(".k-dd, #rdside, .k-cl, .k-cd, .k-pl")) return;
      const full = (host.innerText || host.textContent || "").replace(/\s+/g, " ").trim(); // 隠す前の見えている文字
      s.classList.add("k-qhide");
      if (!host.title) host.title = full;
      if (host.tagName === "BUTTON" && !host.dataset.kfull) host.dataset.kfull = full;
    });
  }

  /* ───────── ② 左のメニュー：5つ（案件／商品／タスク／やりとり／AI商社マン）＋困ったとき＋すべての機能 ───────── */
  const MAIN = [
    ["dash:home", "案件", "brief", "", ["dash:home", "dash:case"]],
    ["dash:prod", "商品", "box", "", ["dash:prod", "item", "up", "srcs"]],
    ["today", "タスク", "list", "", ["today", "task"]],
    ["msg", "やりとり", "msg", "msg", ["msg", "inbox"]],
    ["ai", "AI商社マン", "chat"],
    ["@help", "困ったとき", "help"],
  ];
  if (Array.isArray(RD.MAIN_S)) RD.MAIN_S.splice(0, RD.MAIN_S.length, ...MAIN);
  (function navAll() {
    const N = RD.NAV_S; if (!Array.isArray(N)) return;
    const g0 = N[0]; if (g0 && g0.items && g0.items[0] && g0.items[0][0] === "dash:home") g0.items[0][1] = "案件一覧（ホーム）";
    const asset = N.find((g) => /資産/.test(g.g));
    if (asset && !asset.items.some((x) => x[0] === "dash:prod")) asset.items.unshift(["dash:prod", "商品一覧", "box"]);
  })();
  // 案件の札（要対応の数）を左のメニューの「案件」に出す
  function sideBadge() {
    const b = $('#rdside .rd-main[data-rdk="dash:home"]'); if (!b) return;
    let n = 0; try { n = allCases().filter((c) => c.todo).length; } catch (e) { n = 0; }
    let s = $(".rd-bdg", b);
    if (!n) { if (s) s.remove(); return; }
    if (!s) { s = document.createElement("span"); s.className = "rd-bdg"; b.appendChild(s); }
    if (s.textContent !== String(n)) s.textContent = String(n);
    s.title = "要対応（相手の返信に、まだ返していない案件）";
  }

  /* ───────── いまどこ（押せるパンくず）・次は ───────── */
  const NAME = { "dash:home": "案件", "dash:case": "案件", "dash:prod": "商品", "dash:rep": "分析・レポート", today: "タスク", task: "タスク・進行", msg: "やりとり", inbox: "受信箱", ai: "AI商社マン", item: "商品情報", up: "商品情報を登録", srcs: "取り込んだ情報" };
  const PARENT = { item: "dash:prod", up: "dash:prod", srcs: "dash:prod", task: "today", inbox: "msg", "dash:case": "dash:home" };
  const FLOW = { up: ["item", "商品情報を確かめる"], item: ["cty", "販売先国を選ぶ"], cty: ["ops:reg", "規制を調べる"], "ops:reg": ["deck", "営業資料をつくる"], deck: ["db", "バイヤーを探す"], db: ["dash:home", "案件を進める"], deal: ["dash:home", "案件一覧へ"], "dash:prod": null };
  const FLOW_F = { frates: ["finbox", "見積の依頼に答える"], finbox: ["fcase", "案件を進める"], fagg: ["finbox", "見積受信箱へ"] };
  function navGroupOf(k) {
    const N = RD.isFwd() ? RD.NAV_F : RD.NAV_S;
    for (const g of N || []) { const it = g.items.find((x) => x[0] === k || (k.indexOf(":") < 0 && x[0] === k)); if (it) return { g: g.g, nm: it[1] }; }
    return null;
  }
  function crumbHtml(k) {
    const fwd = RD.isFwd();
    const parts = [];
    const mainK = (fwd ? RD.MAIN_F : RD.MAIN_S) || [];
    const inMain = mainK.find((it) => (it[4] || [it[0]]).indexOf(k) >= 0 || it[0] === k);
    if (k === "dash:case") {
      parts.push(["dash:home", "案件"]);
      const c = RD._case0; parts.push(["", c ? c.name : "案件の詳細"]);
    } else if (inMain && (!PARENT[k] || inMain[0] === k)) {
      parts.push(["", inMain[1]]);
    } else if (PARENT[k]) {
      const pk = PARENT[k], pm = mainK.find((it) => it[0] === pk);
      parts.push([pk, (pm && pm[1]) || NAME[pk] || pk]);
      parts.push(["", (navGroupOf(k) || {}).nm || NAME[k] || k]);
    } else {
      const g = navGroupOf(k);
      parts.push(["@all", "すべての機能"]);
      if (g) { parts.push(["", g.g]); parts.push(["", g.nm]); } else parts.push(["", NAME[k] || k]);
    }
    return parts.map((p, i) => (i ? `<span class="k-bcsep">${I("chevR", 12, 2.6)}</span>` : "") + (p[0] && i < parts.length - 1 ? `<button type="button" class="k-bcb" data-kbc="${esc(p[0])}">${esc(p[1])}</button>` : `<span class="k-bcc"${i === parts.length - 1 ? ' aria-current="page"' : ""}>${esc(p[1])}</span>`)).join("");
  }
  function crumbNext(w, k) {
    const h = $("[data-rdhero]", w); if (!h) return;
    const ht = $(".rd-ht", h); if (!ht) return;
    let bc = $(".k-bc", ht);
    if (!bc) { bc = document.createElement("div"); bc.className = "k-bc"; ht.prepend(bc); }
    const html = crumbHtml(k);
    if (bc.dataset.k !== k + "|" + html.length) { bc.innerHTML = html; bc.dataset.k = k + "|" + html.length; bc.setAttribute("aria-label", "いまの場所"); bc.setAttribute("role", "navigation"); }
    // よく使う5つの画面は、パンくずが題と同じ1語になる＝出さない（左のメニューの色で「いまどこ」がわかる）
    bc.classList.toggle("k-bc1", !$(".k-bcsep", bc));
    const F = RD.isFwd() ? FLOW_F : FLOW;
    const nx = F[k];
    let nb = $(".k-next", h);
    if (nx && !nb) {
      h.insertAdjacentHTML("beforeend", `<button type="button" class="k-next" data-kbc="${esc(nx[0])}" title="次の手順：${esc(nx[1])}"><small>次は</small><b>${esc(nx[1])}</b>${I("arr", 16, 2.4)}</button>`);
    } else if (!nx && nb) nb.remove();
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest("[data-kbc]");
    if (!b) return;
    e.preventDefault();
    const k = b.dataset.kbc;
    if (k === "@all") { try { localStorage.setItem("rd_navall", "1"); } catch (x) { /* 無視 */ } if (RD.buildSide) RD.buildSide(); const h = $("#rdside .rd-allh"); if (h) { h.focus(); h.scrollIntoView({ block: "nearest" }); } if (window.innerWidth <= 820) document.body.classList.add("navopen"); return; }
    goKey(k);
  });

  /* ───────── 案件一覧（ホーム） ───────── */
  // 並びはこの PC に覚える。絞り込み（タブ・ステータス・探す）は開くたびに「すべて」から（案件が見えなくなったと迷わないように）
  const CL = { f: "all", st: "", sort: (ls.get("rd_cl", {}) || {}).sort || "in", q: "" };
  const saveCL = () => ls.set("rd_cl", { sort: CL.sort });
  const setupKey = (t) => (/営業資料/.test(t) ? "deck" : /バイヤー/.test(t) ? "db" : /商談/.test(t) ? "deal" : /国/.test(t) ? "cty" : /資料|足りない|商品/.test(t) ? "up" : "today");
  const SORTS = [["in", "相手の最新メッセージ順"], ["last", "最終やりとり順"], ["st", "ステータス順"], ["cty", "国順"]];
  function filtered(L) {
    let R = L.slice();
    if (CL.f === "fav") R = R.filter(isFav);
    else if (CL.f === "todo") R = R.filter((c) => c.todo);
    else if (CL.f === "open") R = R.filter((c) => c.ss !== "失注");
    if (CL.st) R = R.filter((c) => c.ss === CL.st);
    const q = CL.q.trim().toLowerCase();
    if (q) R = R.filter((c) => [c.name, c.cty, c.biz, c.id, c.ss, c.item, c.next.t].join(" ").toLowerCase().indexOf(q) >= 0);
    const by = {
      in: (a, b) => (b.inAt || 0) - (a.inAt || 0) || b.lastAt - a.lastAt,
      last: (a, b) => b.lastAt - a.lastAt,
      st: (a, b) => (ST_ORDER[b.ss] ?? 0) - (ST_ORDER[a.ss] ?? 0) || b.lastAt - a.lastAt,
      cty: (a, b) => String(a.cty).localeCompare(String(b.cty), "ja") || b.lastAt - a.lastAt,
    }[CL.sort] || ((a, b) => b.lastAt - a.lastAt);
    // お気に入りは、どの並びでも上に
    return R.sort((a, b) => (isFav(b) ? 1 : 0) - (isFav(a) ? 1 : 0) || by(a, b));
  }
  function foldOld(w, label) {
    if ($("details.k-oldb", w)) return $("details.k-oldb", w);
    const old = document.createElement("details");
    old.className = "rd-old k-oldb";
    old.innerHTML = `<summary>${I("chart", 20)}<span>${esc(label)}</span></summary><div class="rd-oldin"></div>`;
    const inner = $(".rd-oldin", old);
    Array.from(w.children).forEach((c) => { if (!c.matches("[data-rdhero], .rd-x, details.k-oldb")) inner.appendChild(c); });
    w.appendChild(old);
    return old;
  }
  function holdOld(w) {
    // 案件の詳細・商品一覧：今のダッシュボードの部品は、見えない箱に入れておく（アプリの描き直しでそのまま使えるように・同じものは「分析・レポート」で全部見える）
    let h = $(":scope > .k-hold", w);
    if (!h) { h = document.createElement("div"); h.className = "k-hold"; h.hidden = true; w.appendChild(h); }
    Array.from(w.children).forEach((c) => { if (!c.matches("[data-rdhero], .rd-x, .k-hold")) h.appendChild(c); });
  }
  function readWait(w) {
    return $$(".v38wait .v38wt", w).map((b) => ({ k: b.getAttribute("data-v38wf"), n: RD.num((($(".v38wn", b) || {}).textContent) || ""), l: ((($(".v38wl", b) || {}).textContent) || "").trim(), el: b })).filter((x) => x.n > 0);
  }
  function readSetup(w) {
    const L = $$("#ux32setup .ux32steps > li", w).map((li) => ({ t: ((($(".ux32st b", li) || {}).textContent) || "").trim(), done: li.classList.contains("done"), next: li.classList.contains("next") }));
    return { all: L.length, done: L.filter((x) => x.done).length, nx: L.find((x) => x.next) || L.find((x) => !x.done) || null };
  }
  function homeView(w) {
    const old = foldOld(w, "これまでのダッシュボード（数字と分析・はじめの設定）");
    const hz = $("[data-rdhero]", w);
    if (hz && !$(".k-hcta", hz)) hz.insertAdjacentHTML("beforeend", `<button type="button" class="k-btn k-hcta" data-kbc="db">${I("plus", 18, 2.4)}バイヤーを探す</button>`);
    const L = allCases();
    const multi = new Set(L.map((c) => c.pi)).size > 1;
    const wait = readWait(old);
    const setup = readSetup(old);
    const box = document.createElement("div");
    box.className = "rd-x k-cl"; box.setAttribute("data-kcl", "1");
    old.before(box);
    const cnt = (fn) => L.filter(fn).length;
    const tabs = [["all", "すべて", L.length], ["todo", "要対応", cnt((c) => c.todo)], ["fav", "お気に入り", cnt(isFav)], ["open", "進行中", cnt((c) => c.ss !== "失注")]];
    const stc = BM.map((s) => [STS(s), cnt((c) => c.ss === STS(s))]);
    const top = [];
    wait.forEach((x) => top.push(`<button type="button" class="k-pill ${x.k === "appr" ? "or" : ""}" data-kwait="${esc(x.k)}">${I(x.k === "appr" ? "check" : x.k === "reply" ? "mail" : "list", 16)}${esc(x.l)}<b>${x.n}</b></button>`));
    if (setup.all && setup.done < setup.all && setup.nx) top.push(`<button type="button" class="k-pill bl" data-kbc="${setupKey(setup.nx.t)}">${I("flag", 16)}はじめの設定 <b>${setup.done}/${setup.all}</b><span class="k-pn">次：${esc(clip(setup.nx.t, 18))}</span></button>`);
    box.innerHTML = `
      ${top.length ? `<div class="k-pills" role="group" aria-label="対応待ち">${top.join("")}</div>` : ""}
      <section class="k-card k-clcard">
        <div class="k-cltool">
          <div class="k-tabs" role="tablist" aria-label="絞り込み">${tabs.map((t) => `<button type="button" role="tab" class="k-tab ${CL.f === t[0] ? "on" : ""}" aria-selected="${CL.f === t[0]}" data-kclf="${t[0]}">${t[0] === "fav" ? I("star", 15, 2.2) : t[0] === "todo" ? I("alert", 15, 2.2) : ""}${esc(t[1])}<b>${t[2]}</b></button>`).join("")}</div>
          <label class="k-clq">${I("search", 17)}<input type="search" id="k-clq" placeholder="相手・国・ID で探す" value="${esc(CL.q)}" autocomplete="off" aria-label="案件を探す"></label>
          <label class="k-clsort">${I("sliders", 16)}<select id="k-clsort" aria-label="並び">${SORTS.map((s) => `<option value="${s[0]}" ${CL.sort === s[0] ? "selected" : ""}>${esc(s[1])}</option>`).join("")}</select></label>
        </div>
        <div class="k-stchips" role="group" aria-label="ステータス">${stc.map((s) => `<button type="button" class="k-stc st-${esc(s[0])} ${CL.st === s[0] ? "on" : ""}" aria-pressed="${CL.st === s[0]}" data-kclst="${esc(s[0])}" ${s[1] ? "" : "data-zero=1"}>${esc(s[0])}<b>${s[1]}</b></button>`).join("")}</div>
        <div id="k-clbody"></div>
      </section>`;
    const body = $("#k-clbody", box);
    const paint = () => {
      const R = filtered(L);
      RD._caseOrder = R.map((c) => c.key);
      if (!L.length) {
        const S = RD.exportSteps ? RD.exportSteps() : [];
        body.innerHTML = `<div class="k-clempty"><img src="${RD.IMG}robot.png" alt=""><div><b>まだ案件はありません</b><p>バイヤーに連絡すると、相手ごとに案件ができます。</p>
          ${S.length ? `<div class="k-clsteps">${S.slice(0, 3).map((s, i) => `<button type="button" class="k-clstep ${s.st}" ${act(s.go)}><span>${s.st === "done" ? I("check", 14, 3) : i + 1}</span>${esc(s.t)}</button>`).join(`<i>${I("chevR", 14, 2.4)}</i>`)}</div>` : ""}
          <button type="button" class="k-btn" data-kbc="db">${I("users", 18)}バイヤーを探す</button></div></div>`;
        return;
      }
      if (!R.length) { body.innerHTML = `<div class="k-empty">${CL.f === "fav" ? "お気に入りの案件はまだありません（行の ☆ で登録）" : "この条件の案件はありません"}</div>`; return; }
      body.innerHTML = `<table class="k-cltbl"><thead><tr><th class="c-fav"><span class="k-sr">お気に入り</span></th><th>相手</th><th>国</th><th>ステータス</th><th>次の行動</th><th>最終やりとり</th><th class="c-go"></th></tr></thead><tbody>${R.map((c) => {
        const fv = isFav(c), nx = c.next, lm = c.last;
        return `<tr class="k-clrow ${c.todo ? "todo" : ""}" tabindex="0" ${act(() => openCase(c.key))} aria-label="${esc(c.name)}を開く">
          <td class="c-fav"><button type="button" class="k-star ${fv ? "on" : ""}" aria-pressed="${fv}" aria-label="お気に入り" title="お気に入り" ${act((e, b) => { const on = toggleFav(c); b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); })}>${I("star", 18, 2)}</button></td>
          <td class="c-who"><b>${c.named ? "" : `<span class="k-lock" title="AIバイヤー開拓の相手（連絡先は仲介のため非開示）">${I("lock", 13, 2.4)}</span>`}${esc(c.name)}</b><small>${esc(clip(c.biz, 26))}${c.named ? "" : ""} · ID ${esc(c.id)}${multi ? ` · ${esc(clip(c.item, 16))}` : ""}</small>${c.unread ? `<span class="k-new">新着 ${c.unread}</span>` : ""}</td>
          <td class="c-cty"><span>${flag(c.cty, 18)}${esc(c.cty || "—")}</span></td>
          <td class="c-st"><span class="k-tag ${RD.stCls(c.st)}">${esc(c.ss)}</span></td>
          <td class="c-nx k-nx-${nx.kind}">${I(nx.ic, 16, 2.2)}<span>${esc(clip(nx.t, 34))}${nx.sub ? `<small>${esc(nx.sub)}</small>` : ""}</span>${nx.ai ? `<em class="k-ai" title="AI商社マンが、相手の最新の返事を読んで出した次の行動">AI</em>` : ""}</td>
          <td class="c-last"><span class="k-who ${lm && lm.w === "by" ? "by" : "me"}">${lm && lm.w === "by" ? "相手" : "貴社"}</span><span class="k-lt"><b>${esc(when(c.lastAt))}</b>${esc(clip(lm && (lm.subj || lm.body), 30))}</span></td>
          <td class="c-go">${I("chevR", 18, 2.4)}</td></tr>`;
      }).join("")}</tbody></table>
      <div class="k-clfoot"><span>${R.length}件</span>${L.length > R.length ? `<span>（全 ${L.length}件のうち）</span>` : ""}<button type="button" class="k-link" data-kbc="db">${I("users", 15)}新しいバイヤーを探す</button><button type="button" class="k-link" data-kbc="deal">${I("brief", 15)}商談の記録</button></div>`;
    };
    paint();
    $$("[data-kclf]", box).forEach((b) => b.addEventListener("click", () => { CL.f = b.dataset.kclf; saveCL(); $$("[data-kclf]", box).forEach((x) => { const on = x === b; x.classList.toggle("on", on); x.setAttribute("aria-selected", String(on)); }); paint(); }));
    $$("[data-kclst]", box).forEach((b) => b.addEventListener("click", () => { CL.st = CL.st === b.dataset.kclst ? "" : b.dataset.kclst; saveCL(); $$("[data-kclst]", box).forEach((x) => { const on = x.dataset.kclst === CL.st; x.classList.toggle("on", on); x.setAttribute("aria-pressed", String(on)); }); paint(); }));
    $("#k-clsort", box).addEventListener("change", (e) => { CL.sort = e.target.value; saveCL(); paint(); });
    $("#k-clq", box).addEventListener("input", (e) => { CL.q = e.target.value; paint(); });
    $$("[data-kwait]", box).forEach((b) => b.addEventListener("click", () => { const x = wait.find((y) => y.k === b.dataset.kwait); if (x && x.el) x.el.click(); }));
    body.addEventListener("keydown", (e) => { const r = e.target.closest && e.target.closest("tr.k-clrow"); if (r && (e.key === "Enter" || e.key === " ") && e.target === r) { e.preventDefault(); r.click(); } });
  }
  RD.homeView = homeView;

  /* ───────── 案件の詳細 ───────── */
  function openCase(key) {
    const [pi] = String(key).split("|");
    const go = () => { RD.caseKey = key; goKey("dash:case"); };
    if (+pi >= 0 && tensAll()[+pi] !== curTen()) switchProd(+pi).then(go); else go();
  }
  RD.openCase = openCase;
  function askCase(c, q) {
    q = String(q || "").trim(); if (!q) return;
    const head = `【案件：${c.name}（${c.cty}・${c.ss}・ID ${c.id}）】`;
    goKey("ai");
    let n = 0;
    const tm = setInterval(() => { n++; if (document.getElementById("chat") || n > 30) { clearInterval(tm); try { askFree(head + q); } catch (e) { console.error("[rd case] askFree", e); } setTimeout(() => { const ch = document.getElementById("chat"); if (ch) ch.scrollIntoView({ behavior: "smooth", block: "center" }); }, 200); } }, 100); // eslint-disable-line no-undef
  }
  function openThread(c) { try { openDMThread(c.id); } catch (e) { goKey("msg"); } } // eslint-disable-line no-undef
  function openStatus(c) {
    openThread(c);
    setTimeout(() => { const s = document.getElementById("bmStSel"); if (s) { s.scrollIntoView({ block: "center" }); s.focus(); s.classList.add("k-flash"); setTimeout(() => s.classList.remove("k-flash"), 2200); } }, 250);
  }
  function tasksFor(c) {
    let T = [];
    try { T = ((typeof D !== "undefined" && D && D.tasks) || []).slice(); } catch (e) { T = []; } // eslint-disable-line no-undef
    let A = [];
    try { A = (typeof todayItems === "function" ? todayItems() : []) || []; } catch (e) { A = []; } // eslint-disable-line no-undef
    const hasW = (s, w) => w && String(s || "").indexOf(w) >= 0;
    const mine = [], cty = [];
    T.forEach((t) => { if (!t || !t.n) return; const s = t.n + " " + (t.ref || ""); if (hasW(s, c.id) || (c.named && hasW(s, c.name))) mine.push(t); else if (c.cty && hasW(t.n, c.cty)) cty.push(t); });
    const ai = A.filter((x) => x && (hasW(x.t, c.id) || (c.named && hasW(x.t, c.name))));
    return { mine, cty, ai };
  }
  function docsFor(c) {
    let R = null;
    try { R = (typeof D !== "undefined" && D && D.regs && D.regs[c.cty]) || null; } catch (e) { R = null; } // eslint-disable-line no-undef
    if (R && Array.isArray(R.docs)) return { from: "reg", docs: R.docs, warn: R.warn || "", duty: R.duty || "" };
    const S = (c.t && c.t.ctySel) || {};
    const r = (Array.isArray(S.rec) ? S.rec : []).find((x) => x && x.c === c.cty);
    if (r && r.facts && Array.isArray(r.facts.docs)) return { from: "cty", docs: r.facts.docs, warn: "", duty: r.facts.duty || "" };
    return { from: "", docs: [], warn: "", duty: "" };
  }
  function fbFor(c) {
    let F = [];
    try { F = ((typeof D !== "undefined" && D && D.fb) || []).slice(); } catch (e) { F = []; } // eslint-disable-line no-undef
    return F.filter((r) => r && c.named && String(r.b || "").trim() === c.name).sort((a, b) => String(b.d || "").localeCompare(String(a.d || "")));
  }
  const tShort = (m) => { const s = String((m && m.t) || ""); const y = String(new Date().getFullYear()); const x = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{1,2}:\d{2}))?/); if (!x) return s || md(msgAt(m)); return (x[1] === y ? "" : x[1] + "/") + (+x[2]) + "/" + (+x[3]) + (x[4] ? " " + x[4] : ""); };
  // 文の言語：かなが一定の割合（8%）より多ければ日本語。少なければ相手の言語（中国語の文に会社名の「みなと」が入るなど、かなが少しだけ混じる文は日本語にしない）
  const langAttr = (c, m) => {
    const s = String((m && (m.body || m.subj)) || "").slice(0, 400).replace(/\s+/g, "");
    const kana = (s.match(/[ぁ-んァ-ヶー]/g) || []).length;
    if (s && kana / s.length > 0.08) return "ja";
    const L = { English: "en", 日本語: "ja", 繁體中文: "zh-Hant", 简体中文: "zh-Hans", Español: "es", 한국어: "ko", Français: "fr", Deutsch: "de", ไทย: "th", "Tiếng Việt": "vi", "Bahasa Indonesia": "id" };
    const l = L[c.lang] || "en";
    return l === "ja" ? (/[一-鿿]/.test(s) && !kana ? "zh" : "en") : l; // 相手の言語が日本語なのに、かなの少ない文＝英語か中国語
  };
  function caseView(w) {
    const L = allCases();
    const c = L.find((x) => x.key === RD.caseKey) || L.find((x) => x.id === String(RD.caseKey || "").split("|")[1]);
    if (!c) { RD.dashMode = "home"; setTimeout(() => goKey("dash:home"), 0); return; }
    RD._case0 = c;
    holdOld(w);
    const h = $("[data-rdhero]", w);
    if (h) { const h1 = $("h1", h); if (h1) h1.textContent = c.name; const p = $(".rd-ht > p", h); if (p) p.textContent = `${c.cty}の${c.biz}・ID ${c.id}`; }
    const ord = (RD._caseOrder && RD._caseOrder.indexOf(c.key) >= 0) ? RD._caseOrder : filtered(L).map((x) => x.key);
    const ix = ord.indexOf(c.key), pv = ix > 0 ? ord[ix - 1] : "", nv = ix >= 0 && ix < ord.length - 1 ? ord[ix + 1] : "";
    const nx = c.next, fv = isFav(c);
    const tk = tasksFor(c), dc = docsFor(c), fb = fbFor(c);
    const msgs = c.msgs.slice().reverse();
    const MSGN = 5;
    const stLog = (Array.isArray(c.th.stLog) ? c.th.stLog : []).slice(-6);
    const v72 = nx.ai ? c.th.v72 : null;
    const B = c.b || {};
    const tRow = (t) => { const due = t.e || ""; const late = due && t.st !== "完了" && due < RD.today(); return `<li class="${t.st === "完了" ? "done" : ""}"><span class="k-tst">${t.st === "完了" ? I("check", 14, 3) : I("clock", 14, 2.2)}</span><span class="k-tn">${esc(t.n)}</span><span class="k-tdue ${late ? "late" : ""}">${esc(t.st || "")}${due ? "・" + esc(due.slice(5).replace("-", "/")) : ""}</span></li>`; };
    const box = document.createElement("div");
    box.className = "rd-x k-cd"; box.setAttribute("data-kcd", c.key);
    box.innerHTML = `
      <section class="k-card k-cdhd">
        <div class="k-cdtop">
          <span class="k-cdflag">${flag(c.cty, 34)}</span>
          <div class="k-cdname"><div class="k-cdrow1"><span class="k-tag ${RD.stCls(c.st)} k-cdst">${esc(c.ss)}</span><button type="button" class="k-link k-mini" ${act(() => openStatus(c))}>${I("edit", 14)}ステータスを変える</button></div>
            <small>${esc(c.cty)}・${esc(c.biz)}・ID ${esc(c.id)}${c.item ? `・商品 ${esc(clip(c.item, 22))}` : ""}</small></div>
          <div class="k-cdnav">
            <button type="button" class="k-star big ${fv ? "on" : ""}" aria-pressed="${fv}" aria-label="お気に入り" title="お気に入り" ${act((e, b) => { const on = toggleFav(c); b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); })}>${I("star", 20, 2)}</button>
            <button type="button" class="k-btn white k-mini" ${pv ? act(() => openCase(pv)) : "disabled"} aria-label="前の案件">${I("chevR", 16, 2.6)}</button>
            <button type="button" class="k-btn white k-mini" ${nv ? act(() => openCase(nv)) : "disabled"} aria-label="次の案件">${I("chevR", 16, 2.6)}</button>
          </div>
        </div>
        <div class="k-cdacts">
          <button type="button" class="k-btn" ${act(() => openThread(c))}>${I("mail", 18)}${c.todo ? "返信する" : "やりとりを開く"}</button>
          <button type="button" class="k-btn white" data-kbc="ops:doc">${I("doc", 18)}書類をつくる</button>
          <button type="button" class="k-btn white" ${act(() => { try { opsRegC = c.cty; } catch (e) { /* 無い版 */ } goKey("ops:reg"); })}>${I("shield", 18)}${esc(c.cty)}の規制</button>
          <button type="button" class="k-btn white" data-kbc="deck">${I("slides", 18)}営業資料</button>
        </div>
      </section>
      <div class="k-cdgrid">
        <div class="k-cdmain">
          <section class="k-card k-cdnext k-nx-${nx.kind}">
            <div class="k-h">${I("flag", 22)}<h2>次の行動</h2>${nx.ai ? `<span class="k-tag or">AI</span>` : ""}</div>
            <p class="k-cdnx">${esc(nx.t)}${nx.sub ? `<small>${esc(nx.sub)}</small>` : ""}</p>
            ${nx.more && nx.more.length ? `<ul class="k-cdmore">${nx.more.map((x) => `<li>${I("chevR", 14, 2.6)}${esc(x)}</li>`).join("")}</ul>` : ""}
            ${v72 && v72.draft ? `<div class="k-cddraft">${I("spark", 18)}<span><b>AIの返信の下書きがあります</b>${v72.lang ? `<small>${esc(v72.lang)}</small>` : ""}</span><button type="button" class="k-btn k-mini" ${act(() => openThread(c))}>下書きを見る</button></div>` : ""}
            ${v72 && v72.unknown && v72.unknown.length ? `<div class="k-cdunk"><b>${I("alert", 15, 2.2)}確かめること</b>${v72.unknown.slice(0, 3).map((x) => `<span class="k-tag am">${esc(clip(x, 30))}</span>`).join("")}</div>` : ""}
          </section>
          <section class="k-card k-cdai">
            <div class="k-h"><img src="${RD.IMG}robot.png" alt="" class="k-cdbot"><h2>この案件をAIに聞く</h2></div>
            <form class="rd-ask k-cdask"><input placeholder="例）この相手への返信の文案を作って" autocomplete="off" aria-label="この案件についての質問"><button type="submit" aria-label="聞く">${I("send", 18, 2.2)}</button></form>
            <div class="k-cdchips">
              <button type="button" class="k-chip" ${act(() => askCase(c, "これまでのやりとりを踏まえて、この相手への返信の文案を作って"))}>${I("mail", 16)}返信の文案</button>
              <button type="button" class="k-chip" ${act(() => askCase(c, `この相手に出す見積（取引条件・数量帯・有効期限）の出し方と注意点を教えて`))}>${I("coins", 16)}見積の出し方</button>
              <button type="button" class="k-chip" ${act(() => askCase(c, `${c.cty}にこの商品を輸出するときの規制・必要な書類を教えて`))}>${I("shield", 16)}${esc(c.cty)}の規制</button>
              <button type="button" class="k-chip" ${act(() => askCase(c, `いまのステータス（${c.ss}）から商談を進める次の一手を、結論から教えて`))}>${I("target", 16)}次の一手</button>
            </div>
          </section>
          <section class="k-card k-cdmsgs">
            <div class="k-h">${I("msg", 22)}<h2>やりとり</h2><span class="k-cnt">${c.msgs.length}</span><div class="k-hr"><button type="button" class="k-link" ${act(() => openThread(c))}>すべて開く ${I("arr", 15)}</button></div></div>
            <ol class="k-tl">${msgs.slice(0, MSGN).map((m) => `<li class="${m.w === "by" ? "by" : "me"}"><div class="k-tlb"><div class="k-tlh"><span class="k-who ${m.w === "by" ? "by" : "me"}">${m.w === "by" ? "相手" : "貴社"}</span><b lang="${langAttr(c, m)}">${esc(clip(m.subj || "", 60))}</b><time>${esc(tShort(m))}</time></div><p lang="${langAttr(c, m)}">${esc(clip(m.body, 220))}</p></div></li>`).join("")}</ol>
            ${c.msgs.length > MSGN ? `<button type="button" class="k-link" ${act(() => openThread(c))}>前の ${c.msgs.length - MSGN}件も見る ${I("arr", 15)}</button>` : ""}
          </section>
        </div>
        <div class="k-cdside">
          <section class="k-card">
            <div class="k-h">${I("trend", 20)}<h2>ステータスの流れ</h2></div>
            <ol class="k-stl">${stLog.length ? stLog.map((s, i) => `<li class="${i === stLog.length - 1 ? "now" : ""}"><span class="k-tag ${RD.stCls(s.st)}">${esc(STS(s.st))}</span><time>${esc(md(s.at))}</time><small>${esc(String(s.by || "").replace(/（.*/, ""))}</small></li>`).join("") : `<li class="now"><span class="k-tag ${RD.stCls(c.st)}">${esc(c.ss)}</span></li>`}</ol>
            ${c.why ? `<p class="k-cdwhy">${I("spark", 14)}<span>${esc(clip(c.why, 90))}</span></p>` : ""}
          </section>
          <section class="k-card">
            <div class="k-h">${I("list", 20)}<h2>タスク</h2><span class="k-cnt">${tk.mine.length + tk.cty.length + tk.ai.length}</span><div class="k-hr"><button type="button" class="k-link" data-kbc="task">タスクを開く ${I("arr", 15)}</button></div></div>
            ${tk.ai.length ? `<div class="k-tg">今日やること（AI）</div><ul class="k-tasks">${tk.ai.map((x) => `<li><span class="k-tst">${I("spark", 14)}</span><span class="k-tn">${esc(x.t)}</span><span class="k-tdue">${esc(x.pr || "")}</span></li>`).join("")}</ul>` : ""}
            ${tk.mine.length ? `<div class="k-tg">この相手</div><ul class="k-tasks">${tk.mine.slice(0, 5).map(tRow).join("")}</ul>` : ""}
            ${tk.cty.length ? `<div class="k-tg">${esc(c.cty)}向け</div><ul class="k-tasks">${tk.cty.slice(0, 4).map(tRow).join("")}</ul>` : ""}
            ${!tk.ai.length && !tk.mine.length && !tk.cty.length ? `<div class="k-empty k-sm">この案件のタスクはありません</div>` : ""}
          </section>
          <section class="k-card">
            <div class="k-h">${I("folder", 20)}<h2>書類</h2><div class="k-hr"><button type="button" class="k-link" data-kbc="ops:doc">書類をつくる ${I("arr", 15)}</button></div></div>
            ${dc.docs.length ? `<div class="k-tg">${esc(c.cty)}への輸出に要る書類${dc.from === "cty" ? "（販売先国の調べ）" : ""}</div><div class="k-docs">${dc.docs.map((d) => `<span class="k-doc">${I("doc", 14)}${esc(d)}</span>`).join("")}</div>${dc.duty ? `<p class="k-cdsm">関税：${esc(dc.duty)}</p>` : ""}${dc.warn ? `<p class="k-cdwarn">${I("alert", 14, 2.2)}${esc(dc.warn)}</p>` : ""}`
              : `<div class="k-empty k-sm">${esc(c.cty)}の規制はまだ調べていません<button type="button" class="k-link" ${act(() => { try { opsRegC = c.cty; } catch (e) { /* 無い版 */ } goKey("ops:reg"); })}>規制を調べる ${I("arr", 14)}</button></div>`}
          </section>
          <section class="k-card">
            <div class="k-h">${I("brief", 20)}<h2>商談の記録</h2><span class="k-cnt">${fb.length}</span><div class="k-hr"><button type="button" class="k-link" data-kbc="deal">開く ${I("arr", 15)}</button></div></div>
            ${fb.length ? fb.slice(0, 2).map((r) => `<dl class="k-kv"><dt>日付</dt><dd>${esc(r.d || "")}・${esc(r.ch || "")}</dd>${r.price ? `<dt>価格</dt><dd>${esc(r.price)}</dd>` : ""}${r.lot ? `<dt>数量</dt><dd>${esc(r.lot)}</dd>` : ""}${r.term ? `<dt>条件</dt><dd>${esc(r.term)}</dd>` : ""}${r.react ? `<dt>反応</dt><dd>${esc(r.react)}</dd>` : ""}</dl>`).join("") : `<div class="k-empty k-sm">${c.named ? "まだ記録はありません" : "相手の会社名がわかると、商談の記録と結びつきます"}</div>`}
          </section>
          <section class="k-card">
            <div class="k-h">${I("bldg", 20)}<h2>相手の情報</h2></div>
            ${c.b ? `<dl class="k-kv">${B.contact ? `<dt>担当</dt><dd>${esc(B.contact)}</dd>` : ""}${B.size ? `<dt>規模</dt><dd>${esc(B.size)}</dd>` : ""}${B.ints ? `<dt>関心</dt><dd>${esc(B.ints)}</dd>` : ""}${B.url ? `<dt>Web</dt><dd>${esc(B.url)}</dd>` : ""}</dl>${B.ai && Array.isArray(B.ai.missing) && B.ai.missing.length ? `<div class="k-tg">足りない情報（AI）</div><div class="k-docs">${B.ai.missing.slice(0, 4).map((x) => `<span class="k-tag am">${esc(clip(x, 26))}</span>`).join("")}</div>` : ""}`
              : `<p class="k-cdsm">${I("lock", 14)}AIバイヤー開拓で見つけた相手です（連絡先は仲介のため非開示）</p>`}
          </section>
        </div>
      </div>`;
    (h || w.firstChild) ? (h ? h.after(box) : w.prepend(box)) : w.appendChild(box);
    const f = $(".k-cdask", box);
    f.addEventListener("submit", (e) => { e.preventDefault(); const q = $("input", f); if (!q.value.trim()) { q.focus(); f.classList.add("k-need"); setTimeout(() => f.classList.remove("k-need"), 1600); return; } askCase(c, q.value); });
    // 前の案件の矢印は左向き
    const pb = $$(".k-cdnav .k-btn", box)[0]; if (pb) pb.classList.add("k-flip");
  }

  /* ───────── 商品一覧（商品管理） ───────── */
  function prodView(w) {
    holdOld(w);
    const T = tensAll(), t0 = curTen();
    const list = T.length ? T.map((t, i) => ({ t, i })) : t0 ? [{ t: t0, i: -1 }] : [];
    const L = allCases();
    const h = $("[data-rdhero]", w);
    if (h && !$(".k-hcta", h)) h.insertAdjacentHTML("beforeend", `<button type="button" class="k-btn k-hcta" ${act(() => { const s = document.getElementById("psw"); if (s && Array.from(s.options).some((o) => o.value === "__new")) { s.value = "__new"; s.dispatchEvent(new Event("change")); } else goKey("up"); })}>${I("plus", 18, 2.4)}新しい商品を登録</button>`);
    const box = document.createElement("div");
    box.className = "rd-x k-pl"; box.setAttribute("data-kpl", "1");
    box.innerHTML = `<div class="k-plgrid">${list.map(({ t, i }) => {
      const on = t === t0;
      const S = t.ctySel || {};
      const ch = (Array.isArray(S.chosen) ? S.chosen : []).map((x) => (typeof x === "string" ? x : x && (x.c || x.cty))).filter(Boolean);
      const ct = ch.length ? ch : (t.targets || []);
      const cs = L.filter((c) => c.pi === i || (i < 0 && c.pi < 0));
      const todo = cs.filter((c) => c.todo).length;
      const ph = t.assets && Array.isArray(t.assets.ph) && t.assets.ph[0];
      const src = ph && ph.b64 ? `data:${ph.mime || "image/jpeg"};base64,${ph.b64}` : "";
      const steps = [["商品", !!t.item], ["国", ch.length > 0], ["営業資料", !!(t.deckGen && t.deckGen.length) || !!(t.deck3 && Object.keys(t.deck3).length)], ["バイヤー", cs.length > 0 || (t.outreach || []).length > 0]];
      return `<section class="k-card k-pc ${on ? "on" : ""}">
        <div class="k-pctop">${src ? `<img src="${src}" alt="" class="k-pcimg">` : `<span class="k-pcimg">${I("box", 30, 1.6)}</span>`}
          <div class="k-pcnm"><b>${esc(t.item || t.file || "（名前のない商品）")}</b><small>${esc([t.co, t.cat, t.sku].filter(Boolean).join("・"))}</small></div>${on ? `<span class="k-tag orf">表示中</span>` : ""}</div>
        <div class="k-pcst">${steps.map((s) => `<span class="${s[1] ? "ok" : ""}">${s[1] ? I("check", 13, 3) : ""}${esc(s[0])}</span>`).join(`<i></i>`)}</div>
        <div class="k-pcrow"><span class="k-pcl">販売先国</span><span class="k-pcv">${ct.length ? ct.slice(0, 4).map((c) => `<span class="k-chip">${flag(c, 15)}${esc(c)}</span>`).join("") + (ch.length ? "" : `<small>（候補）</small>`) : "—"}</span></div>
        <div class="k-pcrow"><span class="k-pcl">案件</span><span class="k-pcv"><b class="k-pcn">${cs.length}</b>件${todo ? `<span class="k-tag rd">要対応 ${todo}</span>` : ""}</span></div>
        <div class="k-pcacts"><button type="button" class="k-btn k-mini" ${act(() => switchProd(i).then(() => goKey("dash:home")))}>${I("brief", 16)}案件を見る</button><button type="button" class="k-btn white k-mini" ${act(() => switchProd(i).then(() => goKey("item")))}>${I("box", 16)}商品情報</button></div>
      </section>`;
    }).join("")}</div>
    ${list.length ? "" : `<div class="k-empty">まだ商品はありません。「新しい商品を登録」から始めます。</div>`}`;
    (h ? h.after(box) : w.prepend(box));
  }
  RD.page["dash:case"] = (w) => caseView(w);
  RD.page["dash:prod"] = (w) => prodView(w);

  /* ───────── 仕上げ（rd.js の after のあと） ───────── */
  function finish() {
    if (RD.locked() || isAdmin()) return;
    const w = document.getElementById("well"); if (!w) return;
    const k = RD.curKey();
    // 案件一覧では、これまでのダッシュボードの「このページの内容」・操作の段も、いちばん下のたたんだ欄へ（アプリがあとから足し直すため毎回）
    if (k === "dash:home") { const inn = $("details.k-oldb > .rd-oldin", w); if (inn) $$(":scope > #uxsec, :scope > .ph", w).forEach((x) => inn.prepend(x)); }
    if (k === "dash:case" || k === "dash:prod") { const hold = $(":scope > .k-hold", w); if (hold) $$(":scope > #uxsec, :scope > .ph", w).forEach((x) => hold.prepend(x)); }
    slimHero(w);
    crumbNext(w, k);
    if (isJa()) { foldSubs(w); foldNotes(w); shortBtns(w); descSmall(w); }
    sideBadge();
  }
  const old = RD.after;
  RD.after = function () { const r = old.apply(this, arguments); try { finish(); } catch (e) { console.error("[rd case]", e); } return r; };
  setInterval(() => { try { if (!RD.locked() && !isAdmin()) { finish(); } } catch (e) { /* 無視 */ } }, 1500);
})();

} catch (e) { try { console.error("[rd] rd_case.js", e); } catch (x) { } }
/* ==== rd_rm88.js ==== */
try {
/* 貿易クラウドAI商社マン デザイン刷新：21.88「目標と道筋」＋「AI商社マンからの能動的な提案」を刷新版にも（2026-11-12 大森さん）
   今のアプリの層 logic_v2188rm.js（v88Eval・v88PropHtml・v88Get・v88Plan など）を呼ぶだけ。無い版（21.87 まで）では何もしない
   ① 左のメニューの「すべての機能」＞ホームに「目標と道筋」（今日やることの次）。よく使う5つ（三井さんの意見）はそのまま
   ② 案件一覧（ホーム）・タスク・AI商社マンの見出しのすぐ下に、AI商社マンからの提案（1つだけ・出しすぎない決まりはアプリの層のまま）と、
      目標の帯（目標・届く見込み・いまの段階・確からしさ → 目標と道筋へ）。今のアプリの層がたたんだ欄に入れた提案は外す（二重に出さない）
   ③ 目標と道筋の画面：見出しの文。長い説明（data-v88note）は rd_case.js の決まりに合わせて見出しの「？」へ
   ボタンは data-act（BCACT・アプリの層の rm.*）。onclick= と style= は書かない */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD) return;
  const has = () => typeof v88Eval === "function" && typeof v88PropHtml === "function" && typeof v88Get === "function"; // eslint-disable-line no-undef
  if (!has()) return;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  try { if (RD.P && !RD.P.road) RD.P.road = '<path d="M3 20l6-6 4 4 8-8"/><path d="M15 6h6v6"/><circle cx="5" cy="5" r="2"/>'; } catch (e) { /* 無い版 */ }

  /* ① すべての機能のホームに「目標と道筋」 */
  (function nav() {
    const N = RD.NAV_S; if (!Array.isArray(N)) return;
    const g = N.find((x) => x.items && x.items.some((it) => it[0] === "today")) || N[0];
    if (!g || g.items.some((it) => it[0] === "rm")) return;
    const i = g.items.findIndex((it) => it[0] === "today");
    g.items.splice(i >= 0 ? i + 1 : g.items.length, 0, ["rm", "目標と道筋", "road"]);
    try { if (typeof RD.buildSide === "function") RD.buildSide(); } catch (e) { /* 描き直しは次の画面で */ }
  })();

  /* ② 提案カードと目標の帯 */
  const FEAS = { easy: ["今のペースでも届く見込み", "good"], yes: ["標準のペースで届く見込み", "good"], stretch: ["挑戦のペースなら届く見込み", "warn"], no: ["今の道筋では届かない見込み", "crit"] };
  function stripHtml() {
    const R = v88Get(); // eslint-disable-line no-undef
    const G = v88Goal(R); // eslint-disable-line no-undef
    if (!G) return `<div class="k-rm88g"><span class="k-rm88i">🎯</span><span class="k-rm88t"><b>目指す貿易の姿を教えてください</b><span>達成の年数・道筋・費用・期待できる売上を、STANDAGE の記録から出します</span></span><button class="btn" type="button" data-act="rm.form">目標を入れる</button></div>`;
    let pl = null; try { pl = v88Plan(R); } catch (e) { pl = null; } // eslint-disable-line no-undef
    if (!pl) return "";
    const f = FEAS[pl.feas] || null;
    const tgt = pl.T ? `${esc(G.year || "")}年に海外売上 ${esc(v88Man(pl.T.v))}` : "目標の金額が未記入"; // eslint-disable-line no-undef
    return `<div class="k-rm88g"><span class="k-rm88i">🎯</span><span class="k-rm88t"><b>${tgt}</b><span>${f ? `<em class="k-rm88f k-rm88f-${f[1]}">${esc(f[0])}</em>・` : ""}いま「${esc(v88StNm(pl.st.stage))}」・確からしさ ${pl.conf.score}</span></span><button class="btn g" type="button" data-act="rm.open">目標と道筋を見る</button></div>`; // eslint-disable-line no-undef
  }
  function propNow() {
    let p = null; try { p = v88Eval(); } catch (e) { p = null; } // eslint-disable-line no-undef
    try { if (typeof V88 !== "undefined" && V88.noask) { const q = v88Get().props.find((x) => x && x.id === V88.noask); if (q) p = q; } } catch (e) { /* 無い */ } // eslint-disable-line no-undef
    return p;
  }
  function put(w, withStrip) {
    if (!w) return;
    $$(".k-rm88", w).forEach((x) => x.remove());
    $$(".v88prop", w).forEach((x) => { if (!x.closest(".k-rm88")) x.remove(); }); // 今のアプリの層が入れた提案（ホームではたたんだ欄の中）は外す
    const p = propNow();
    let noGoal = false; try { noGoal = !v88Goal(v88Get()); } catch (e) { noGoal = false; } // eslint-disable-line no-undef
    if (withStrip && p && p.kind === "goal" && noGoal) withStrip = false; // 目標を聞く提案が出ているときは帯で同じことを言わない
    const html = `<div class="rd-x k-rm88">${p ? v88PropHtml(p, true) : ""}${withStrip ? stripHtml() : ""}</div>`; // eslint-disable-line no-undef
    if (!p && !withStrip) return;
    const hero = $("[data-rdhero]", w);
    if (hero) hero.insertAdjacentHTML("afterend", html); else w.insertAdjacentHTML("afterbegin", html);
    try { if (p && p.st === "new") { p.st = "seen"; v88Save(); } } catch (e) { /* 無い */ } // eslint-disable-line no-undef
  }
  const chain = (k, fn) => { const p0 = RD.page[k]; RD.page[k] = (w, kk) => { if (p0) p0(w, kk); try { fn(w, kk); } catch (e) { console.error("[rd] rm88 " + k, e); } }; };
  chain("dash:home", (w) => put(w, true));
  chain("today", (w) => put(w, false));
  chain("ai", (w) => put(w, true));

  /* ③ 目標と道筋の画面 */
  chain("rm", (w) => {
    const h = $("[data-rdhero]", w);
    if (h) {
      const h1 = $(".rd-ht h1", h), p = $(".rd-ht p", h);
      if (h1) h1.textContent = "目標と道筋";
      if (p) p.textContent = "目指す貿易の姿から、達成の年数・道筋・費用の目安・期待できる売上を出し、貿易の進みに合わせて AI商社マンから提案します。根拠は STANDAGE の記録（商談記録の匿名の集計）と、確かめた公的な情報です。";
    }
    $$("[data-v88note]", w).forEach((x) => x.classList.add("nn")); // 長い説明は rd_case.js の決まりで見出しの「？」へ
    const pr = $(":scope > .v88prop", w); if (pr && h && pr.previousElementSibling !== h) h.after(pr);
  });
  // 提案の答え（あとで・今は要らない・タスク）でアプリの層が描き直すとき、刷新版のホームの帯も描き直す
  try {
    if (typeof v88Repaint === "function") { // eslint-disable-line no-undef
      const r0 = v88Repaint; // eslint-disable-line no-undef
      window.v88Repaint = function () { const r = r0.apply(this, arguments); try { const k = RD.curKey && RD.curKey(); if (k === "dash:home" || k === "today" || k === "ai") put($("#well"), k !== "today"); } catch (e) { /* 無視 */ } return r; };
    }
  } catch (e) { /* 無い */ }
})();

} catch (e) { try { console.error("[rd] rd_rm88.js", e); } catch (x) { } }
/* ==== rd_v89cty.js ==== */
try {
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

} catch (e) { try { console.error("[rd] rd_v89cty.js", e); } catch (x) { } }
/* ==== rd_v89fwd.js ==== */
try {
/* 貿易クラウドAI商社マン デザイン刷新：21.89 fwd（2026-11-13）物流会社の画面の直し。改修一覧〔大森パート〕No.376・377・378（11/12 夜 刷新版の再検証）
   No.376 相見積・AI推奨（fagg）の「対象の依頼（レーン）」の箱が、期限 2026-10-31 を「あと45日」と出した（本番の依頼は 9/16 に見積を組んだもの）。
     原因：刷新版の箱（rd.js の aggSummary）は、依頼に残った数（offers[].vd・推奨の理由 recWhy＝荷主の端末が見積を組んだ日に数えたもの）をそのまま出していた。
       今の版の画面（相見積もり一覧・推奨カード・AI の答え）は 21.80（No.313）で「見ている日」を基準に数え直しているが、刷新版の箱はその直しを通っていなかった。
       アプリの「今日」は物流会社では実際の日付（logic_tenant の isDemoClock＝物流会社は見本の時計 2026-08-04 を使わない）。基準日を固定している所は無い。
     直し：箱を描くあいだだけ、依頼を 21.80 と同じ写し（v80fwdReq＝各社の残り日数・札・推奨の理由を今日を基準に。依頼のデータは書き換えない）にして描く。
       切れたものは「あと-13日」ではなく「期限切れ（13日前に終了）」、今日までは「今日まで」。依頼の切り替え（選ぶ欄）でも同じ。
   No.377 English にした直後、物流会社のホームの「全体の状況」が「—items」「—%」「—lanes」になる（日本語に戻すと直る）。
     原因：刷新版のホーム（rd.js の homeFwd → readFinbox）は、見積受信箱の数のカードを日本語の見出し（「受信した依頼」「AI自動回答」「登録レーン」「仮押さえ」）で探していた。
       English では見出しが辞書で「Requests received」などに訳されたあとに読むため見つからず、数が無い＝「—」。AI の翻訳（AI translating…）のせいではない。
     直し：ホームを描いたあと、見積受信箱と同じ数（fwdInboxHtml の数のカード＝訳す前の日本語の HTML から読む）で、数が違う所だけ入れ直す（日本語では何も変わらない）。
   No.378 物流レート管理：アプリの層（logic_v2189fwd.js）で期限切れの行をたたむ。刷新版の「有効期限切れ」の札を押すと、その行を開く。
   今のアプリの関数・刷新版の前の層は差し替えず、RDX.after を包む（rd_bar.js などと同じ形） */
(function () {
  const RD = window.RDX;
  if (!RD || RD.v89fwd) return;
  RD.v89fwd = { ver: "21.89", err: [], days: 0, nums: 0 };
  const err = (k, e) => { try { RD.v89fwd.err.push(k + ": " + String((e && e.message) || e).slice(0, 160)); } catch (x) { /* 無視 */ } };
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const num = (s) => { const m = String(s == null ? "" : s).replace(/,/g, "").match(/-?\d+(\.\d+)?/); return m ? +m[0] : null; };
  const FW = () => { try { return typeof FWDB !== "undefined" ? FWDB : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const key = () => { try { return RD.curKey ? RD.curKey() : ""; } catch (e) { return ""; } };
  const fwd = () => { try { return RD.isFwd ? RD.isFwd() : false; } catch (e) { return false; } };
  const viewReq = (r) => { try { return typeof v80fwdReq === "function" ? v80fwdReq(r) : r; } catch (e) { return r; } }; // eslint-disable-line no-undef

  /* ───── No.376 相見積の箱：描くあいだだけ今日を基準の写し ───── */
  let saved = null;
  function swapIn() { const D = FW(); if (!D || !Array.isArray(D.reqs) || saved) return; saved = { D, reqs: D.reqs }; try { D.reqs = D.reqs.map(viewReq); } catch (e) { saved = null; err("swap", e); } }
  function swapOut() { if (!saved) return; try { saved.D.reqs = saved.reqs; } catch (e) { err("unswap", e); } saved = null; }
  function fixDays() {
    const box = document.querySelector("#well [data-rdagg]"); if (!box) return;
    // 表の「あと◯日」
    box.querySelectorAll("table.rd-tbl td div").forEach((d) => {
      const m = /^あと(-?\d+)日$/.exec((d.textContent || "").trim()); if (!m) return; const n = +m[1];
      if (n < 0) { d.textContent = `期限切れ（${-n}日前に終了）`; d.style.color = "var(--rd-crit)"; d.style.fontWeight = "700"; RD.v89fwd.days++; }
      else if (n === 0) { d.textContent = "今日まで"; d.style.color = "var(--rd-crit)"; RD.v89fwd.days++; }
    });
    // 選ばれる工夫の文
    box.querySelectorAll("p").forEach((p) => {
      const t = p.textContent || "";
      if (!/あと-?\d+日|あと—日/.test(t)) return;
      let s = t.replace(/有効期限（あと(-\d+)日）が切れると対象外になるので、早めに更新を。/, (m0, n) => `有効期限は${-n}日前に切れています（見積の対象外）。レート管理で新しいレートに更新を。`)
        .replace(/有効期限（あと0日）が切れると対象外になるので、早めに更新を。/, "有効期限は今日までです。レート管理で早めに更新を。")
        .replace(/（あと(-\d+)日）/g, (m0, n) => `（${-n}日前に期限切れ）`).replace(/（あと0日）/g, "（今日まで）");
      if (s !== t) { p.textContent = s; RD.v89fwd.days++; }
    });
  }

  /* ───── No.377 物流会社のホームの数：見積受信箱と同じ数（訳す前の HTML から） ───── */
  function inboxNums() {
    try {
      if (typeof fwdInboxHtml !== "function") return null; // eslint-disable-line no-undef
      const tp = document.createElement("template"); tp.innerHTML = fwdInboxHtml(); // eslint-disable-line no-undef
      const N = {};
      tp.content.querySelectorAll(".g4 > .c").forEach((c) => { const l = ((c.querySelector(".lbl") || {}).textContent || "").trim(); const kv = c.querySelector(".kv"); if (l && kv) N[l] = { n: num(kv.textContent), u: ((kv.querySelector("small") || {}).textContent || "").trim() }; });
      return N;
    } catch (e) { err("nums", e); return null; }
  }
  function tileNum(t) { const tn = t && t.querySelector(".rd-tn"); if (!tn) return undefined; const x = [...tn.childNodes].find((n) => n.nodeType === 3 && n.nodeValue.trim()); return x ? num(x.nodeValue) : null; }
  function setTile(t, n, u, s) {
    if (!t || n == null) return false;
    const tn = t.querySelector(".rd-tn"); if (!tn) return false;
    if (tileNum(t) === n) return false;
    tn.innerHTML = `${esc(n)}<small>${esc(u || "")}</small>`;
    if (s) { let ts = t.querySelector(".rd-ts"); if (!ts) { tn.insertAdjacentHTML("afterend", '<span class="rd-ts" style="display:block"></span>'); ts = t.querySelector(".rd-ts"); } ts.textContent = s; }
    return true;
  }
  function fixHome() {
    const w = document.getElementById("well"); if (!w || !w.querySelector(".rd-fhome-top")) return;
    const N = inboxNums(); if (!N) return;
    const recv = N["受信した依頼"], auto = N["AI自動回答"], lane = N["登録レーン"], held = N["仮押さえ"];
    const T = (i) => w.querySelector(`[data-rdtile="${i}"]`);
    let ch = 0;
    if (recv && setTile(T(0), recv.n, "件")) ch++;
    if (recv && recv.n) { const rate = Math.round(((auto ? auto.n : 0) / recv.n) * 100); if (setTile(T(1), rate, "%", auto ? `${auto.n} / ${recv.n}件` : "")) ch++; }
    if (lane && setTile(T(3), lane.n, lane.u || "本")) ch++;
    if (held) { const t2 = T(2); if (t2 && !t2.querySelector(".rd-ts")) { const tn = t2.querySelector(".rd-tn"); if (tn) { tn.insertAdjacentHTML("afterend", `<span class="rd-ts" style="display:block">${esc(`国ごとに数えると ${held.n}件`)}</span>`); ch++; } } }
    // 6ステップの「1. レート登録」「2. 見積対応」の数
    const six = (i) => w.querySelector(`[data-rdsix="${i}"]`);
    const put = (b, s) => { if (!b || !s) return; if (b.querySelector(".rd-sxn")) return; b.insertAdjacentHTML("beforeend", `<span class="rd-sxn">${esc(s)}</span>`); ch++; };
    if (lane) put(six(0), `${lane.n}${lane.u}`);
    if (auto) put(six(1), `AI回答 ${auto.n}件`);
    if (ch) RD.v89fwd.nums += ch;
  }

  /* ───── No.378 レート管理：「有効期限切れ」の札から、たたんだ行を開く ───── */
  function ratesTile() {
    const w = document.getElementById("well"); if (!w) return;
    const t = [...w.querySelectorAll("[data-rdrates] .rd-tile")].find((x) => /有効期限切れ|Expired|已过期|vencid/i.test(((x.querySelector("b") || {}).textContent) || ""));
    if (!t || t.dataset.v89f || typeof window.v89fShowExpired !== "function") return;
    if (!(tileNum(t) > 0)) return;
    t.dataset.v89f = "1"; t.style.cursor = "pointer"; t.setAttribute("role", "button"); t.setAttribute("tabindex", "0"); t.title = "押すと、たたんである期限切れの行を開きます";
    const go = () => { try { window.v89fShowExpired(true); } catch (e) { err("tile", e); } };
    t.addEventListener("click", go); t.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
  }

  const old = RD.after;
  RD.after = function () {
    const k = key(), on = fwd() && k === "fagg";
    if (on) swapIn();
    let r;
    try { r = old.apply(this, arguments); } finally { if (on) swapOut(); }
    try { if (fwd()) { if (k === "fagg") fixDays(); else if (k === "fhome") fixHome(); else if (k === "frates") ratesTile(); } } catch (e) { err("after", e); }
    return r;
  };
  // 相見積の箱の「対象の依頼」の切り替え（rd.js が選ぶ欄で箱を描き直す）も同じ写しで
  window.addEventListener("change", (e) => { if (e.target && e.target.id === "rdaggsel" && fwd()) swapIn(); }, true);
  window.addEventListener("change", (e) => { if (e.target && e.target.id === "rdaggsel") { swapOut(); try { fixDays(); } catch (x) { err("sel", x); } } }, false);
  // 描いたあとに切り替わった言語でも（English の辞書が見出しを訳したあと）
  setTimeout(() => { try { if (fwd() && key() === "fhome") fixHome(); } catch (e) { /* まだ */ } }, 0);
})();

} catch (e) { try { console.error("[rd] rd_v89fwd.js", e); } catch (x) { } }
/* ==== rd_v89badge.js ==== */
try {
/* 21.89 No.379（2026-11-13 週次レビュー）：「刷新版（社内確認用…）」の札を、画面の下に固定で浮かせず、上の帯（.bar）のすぐ下に細い帯として置く。
   前は position:fixed で左下に浮いていたため、どのスクロール位置でも下の本文（管理者の「契約満了が近いアカウント」の説明・
   「APIコスト分析」の見出しなど）を覆っていた。下に余白を足しても、途中までスクロールしたときの重なりは消えない。
   本文の流れの中に置けば重ならない（上の帯の中に入れると、狭い幅で検索欄を押しつぶし右で切れるので、帯の下にした）。
   「今の版を開く」のリンクも残す。上の帯が無い画面（ログイン）は今まで通り。 */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v89badge) return;
  RD._v89badge = 1;
  function place() {
    const bd = document.getElementById("rdbadge");
    if (!bd) return;
    const bar = document.querySelector(".bar");
    const barOk = bar && bar.offsetParent !== null && bar.getBoundingClientRect().height > 0;
    if (barOk) {
      if (bar.nextElementSibling !== bd) bar.after(bd);
      bd.classList.add("k-instrip");
    } else if (bd.parentNode !== document.body) {
      document.body.appendChild(bd);
      bd.classList.remove("k-instrip");
    }
  }
  let n = 0;
  const iv = setInterval(() => { n++; try { place(); } catch (e) { /* 無視 */ } if (n > 120) clearInterval(iv); }, 500);
  try { new MutationObserver(() => { try { place(); } catch (e) { /* 無視 */ } }).observe(document.body, { childList: true }); } catch (e) { /* 無視 */ }
  window.addEventListener("resize", () => { try { place(); } catch (e) { /* 無視 */ } });
  RD.v89badgePlace = place;
})();

} catch (e) { try { console.error("[rd] rd_v89badge.js", e); } catch (x) { } }
/* ==== rd_v90ana.js ==== */
try {
/* 貿易クラウドAI商社マン 21.90 ana の刷新版の層（rd_v89badge.js のあとに読む）
   No.382 やりとり（msg）の「受信箱の概要」：刷新版が自分で数えていた（最後の発言が相手＝要対応・最後の発言がこちら＝返信待ち〔日数の区切りなし〕）
          → アプリの v90anaMsgStat（受信箱・分析・レポートと同じ数え方）の数にし、何を数えたかを数の下に書く
   No.425 左のメニュー「案件」の札（要対応の数）が、案件の数（すべて 5）と同じ場所で「4」とだけ出て、案件の数に見えた
          → 札に「要対応」と書く（数は案件一覧の「要対応」のタブと同じ）
   No.388 通知センターの見出し「今すぐ対応が必要なこと N件」は既読・急ぎでない知らせも含めた全部の数だった → 「いま出ている知らせ（既読を含む）」に
   No.383 チーム概要の数の下の説明（台帳に登録 N名＋ログイン中のあなた）が、刷新版の「小さな字を隠す」（descSmall）で隠れていた → 隠さない
   No.432 物流会社のメンバー・担当のチーム概要に、荷主の項目「登録している商品 0商品」が出ていた → 「見積依頼の荷主 N社」（荷主ごとの担当と同じ数）に
   No.400 「誰が何をできる？」の「代表」の説明が、同じ descSmall で隠れて空に見えた → 隠さない（管理者・メンバーと同じく見せる）
   No.451 見本（架空）のデータと実データの区別がつかない（前の決め「見本の案件は『見本』の札」に合わせる。データは消さない・隠さない）
          荷主：案件一覧の行・商品一覧のカードに「見本」の札（見本の商品＝TENS の src "sample2"）、一覧の上に「見本 N件／全 M件」の帯
          物流会社：見本の物流会社（今のアプリの V45_SMPCO）のレート・推奨・相見積が出ている画面の上に、どれが見本かと
          「数字に見本のレートが入っている」ことを書き、表の見本の会社のセルに「見本」の札 */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v90ana) return;
  RD._v90ana = 1;
  const { $, $$ } = RD;
  const fn = (n) => { try { return typeof window[n] === "function" ? window[n] : null; } catch (e) { return null; } };
  const chain = (k, f) => { const p0 = RD.page[k]; RD.page[k] = (w, kk) => { if (p0) p0(w, kk); try { f(w, kk); } catch (e) { console.error("[rd] v90ana " + k, e); } }; };
  const tileOf = (w, re) => $$(".rd-p2 .k-tile", w).find((x) => re.test(((($(".k-tl", x) || {}).textContent) || "").trim()));
  const keepTs = (s) => { if (!s) return; s.dataset.kds = "1"; s.classList.remove("k-qhide"); s.hidden = false; };
  const setTile = (el, n, sub, lab) => {
    if (!el) return;
    if (lab) { const l = $(".k-tl", el); if (l) l.textContent = lab; }
    const tn = $(".k-tn", el);
    if (tn && n != null) { const u = $("small", tn); tn.textContent = String(n); if (u) tn.appendChild(u); tn.dataset.v90n = String(n); }
    if (sub) {
      let s = $(".k-ts", el);
      if (!s) { s = document.createElement("span"); s.className = "k-ts"; if (tn) tn.after(s); else el.appendChild(s); }
      s.textContent = sub; s.classList.add("k-v90ts"); keepTs(s);
    }
  };

  /* ── No.382 やりとり ── */
  chain("msg", (w) => {
    const st = fn("v90anaMsgStat"); if (!st) return;
    const S = st();
    const need = S.need.length, wait = S.wait.length;
    setTile(tileOf(w, /^要対応/), need, "相手から届いて、まだ返していない相手（受信箱の「返信」と同じ）");
    setTile(tileOf(w, /^返信待ち/), wait, "こちらが送って、相手の返事を待っている相手（60日以内・受信箱の「相手の番」と同じ）");
    $$(".rd-p2 b, .rd-p2 span", w).forEach((x) => { if (x.children.length) return; const t = x.textContent || ""; if (/^返信が要るメッセージを確認（\d+件）$/.test(t)) x.textContent = `返信が要るメッセージを確認（${need}件）`; });
  });

  /* ── No.383・400・432 メンバー・担当 ── */
  function teamFix(w, fwd) {
    $$(".rd-p2 .k-tile .k-ts", w).forEach(keepTs); // 数の下の説明・誰が何をできる？の説明（代表を含む）を隠さない
    if (!fwd) return;
    const prod = tileOf(w, /^登録している商品$/);
    if (prod) {
      let n = null;
      try { const a = fn("tmAcct") && window.tmAcct(); const T = a && fn("tmTargets") ? window.tmTargets(a) : []; n = Array.isArray(T) ? T.length : null; } catch (e) { n = null; }
      setTile(prod, n == null ? "—" : n, "見積依頼をくれた荷主の数（「荷主ごとの担当」と同じ）", "見積依頼の荷主");
      const u = $(".k-tn small", prod); if (u) u.textContent = "社";
      const ic = $(".k-ti", prod); if (ic && RD.I) ic.innerHTML = RD.I("users", 24);
    }
  }
  chain("team", (w) => teamFix(w, false));
  chain("fteam", (w) => teamFix(w, true));
  // 誰が何をできる？の小さな説明が、あとから隠されたとき（見えたときに隠す仕組み）も戻す
  try {
    new MutationObserver(() => {
      const k = (RD.curKey && RD.curKey()) || "";
      if (!/team/.test(k) && !document.querySelector("#well .tm-cnt")) return;
      $$("#well .rd-p2 .k-tile .k-ts.k-qhide").forEach(keepTs);
    }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ["class"] });
  } catch (e) { /* 無視 */ }

  /* ── No.425 左のメニュー「案件」の札 ── */
  function sideLabel() {
    const s = $('#rdside .rd-main[data-rdk="dash:home"] .rd-bdg');
    if (!s) return;
    if (!s.classList.contains("k-v90todo")) s.classList.add("k-v90todo");
    const t = `要対応 ${s.textContent}件（相手の返信に、まだ返していない案件。案件の数ではありません）`;
    if (s.title !== t) s.title = t;
    if (s.getAttribute("aria-label") !== t) s.setAttribute("aria-label", t);
  }

  /* ── No.388 通知センターの見出し ── */
  function ntfHead() {
    const hd = $("#pn .k-ntfhd"); if (!hd || hd.dataset.v90) return;
    hd.dataset.v90 = "1";
    $$("h2, h3, b, span", hd).forEach((x) => { if (!x.children.length && /^今すぐ対応が必要なこと$/.test((x.textContent || "").trim())) x.textContent = "いま出ている知らせ（既読を含む）"; });
    const p = $("#v90bell");
    if (p && !$(".k-v90bell", hd)) { const q = document.createElement("p"); q.className = "k-v90bell"; q.dataset.kqn = "1"; q.textContent = p.textContent; hd.appendChild(q); p.hidden = true; }
  }
  const tick = () => { try { sideLabel(); } catch (e) { /* 無視 */ } try { ntfHead(); } catch (e) { /* 無視 */ } };
  try { new MutationObserver(tick).observe(document.body, { childList: true, subtree: true, characterData: true }); } catch (e) { /* 無視 */ }
  // 札の title は刷新版（rd_case の sideBadge）が描くたびに書き直すので、title の変化も見る
  const watchSide = () => { const sd = document.getElementById("rdside"); if (!sd) { setTimeout(watchSide, 500); return; } try { new MutationObserver(() => { try { sideLabel(); } catch (e) { /* 無視 */ } }).observe(sd, { subtree: true, attributes: true, attributeFilter: ["title"] }); } catch (e) { /* 無視 */ } };
  watchSide();
  setTimeout(tick, 500);

  /* ── No.451 見本と実データの区別 ── */
  // 見本の物流会社：今のアプリの見本の一覧（V45_SMPCO＝21.60 からデモ物流①〜⑤）＋以前の見本（V60_OLD＝サンプル海運（デモ）など。前に作った依頼の相見積に残る）
  const SMP_CO = () => { const o = {}; try { if (typeof V45_SMPCO !== "undefined" && V45_SMPCO) Object.keys(V45_SMPCO).forEach((k) => { o[k] = 1; }); } catch (e) { /* 無視 */ } // eslint-disable-line no-undef
    try { if (typeof V60_OLD !== "undefined" && V60_OLD) Object.keys(V60_OLD).forEach((k) => { o[k] = 1; }); } catch (e) { /* 無視 */ } // eslint-disable-line no-undef
    return Object.keys(o); };
  const isSmpTen = (t) => !!t && (t.src === "sample2" || t.src === "demo" || t.kind === "demo");
  const tag = () => { const x = document.createElement("span"); x.className = "k-tag gy k-v90smp"; x.textContent = "見本"; x.title = "見本（架空）のデータです。実在の取引ではありません"; return x; };
  const fwdNow = () => { try { return !!(RD.isFwd && RD.isFwd()); } catch (e) { return false; } };
  function smpShipper() {
    const W = document.getElementById("well"); if (!W || fwdNow()) return;
    // 案件一覧
    const cl = $(".k-cl .k-clcard", W);
    if (cl && RD.allCases) {
      let L = []; try { L = RD.allCases(); } catch (e) { L = []; }
      const by = {}; L.forEach((c) => { by[c.key] = c; });
      const rows = $$("#k-clbody tr.k-clrow", cl), ord = RD._caseOrder || [];
      // 札は名前の後ろ。名前（b＝flex・はみ出しは隠す）が長いと札が右で切れるので、名前の文字だけを縮む箱（k-v90nm・…で省略）に入れ、札は縮まない（flex:none）
      rows.forEach((tr, i) => {
        const c = by[ord[i]]; if (!c || !isSmpTen(c.t)) return;
        const b = $(".c-who b", tr); if (!b || $(".k-v90smp", b)) return;
        const tx = Array.from(b.childNodes).filter((n) => n.nodeType === 3 && n.nodeValue.trim());
        if (tx.length) { const nm = document.createElement("span"); nm.className = "k-v90nm"; tx[0].before(nm); tx.forEach((n) => nm.appendChild(n)); nm.title = (nm.textContent || "").trim(); }
        b.appendChild(tag());
      });
      const m = L.filter((c) => isSmpTen(c.t)).length;
      let bar = $(".k-v90smpbar", cl);
      if (m && !bar) { bar = document.createElement("p"); bar.className = "k-v90smpbar"; bar.dataset.kqn = "1"; cl.prepend(bar); }
      if (bar) {
        const t = !m ? "" : m === L.length ? `この一覧の案件 ${L.length}件は、すべて見本（架空）の商品のものです。数も見本の数で、実在の取引は入っていません。` : `全 ${L.length}件のうち ${m}件は見本（架空）の商品の案件です（行に「見本」の札）。`;
        if (bar.textContent !== t) bar.textContent = t;
        bar.hidden = !m;
      }
    }
    // 商品一覧
    let T = []; try { T = typeof TENS !== "undefined" ? TENS : []; } catch (e) { T = []; } // eslint-disable-line no-undef
    $$(".k-pc", W).forEach((card) => {
      const nm = $(".k-pcnm b", card); if (!nm || $(".k-v90smp", nm)) return;
      const t = T.find((x) => x && (x.item || x.file || "（名前のない商品）") === nm.textContent);
      if (isSmpTen(t)) nm.appendChild(tag());
    });
  }
  function smpFwd() {
    const W = document.getElementById("well"); if (!W || !fwdNow()) return;
    const K = SMP_CO(); if (!K.length) return;
    let F = null; try { F = typeof FWDB !== "undefined" ? FWDB : null; } catch (e) { F = null; } // eslint-disable-line no-undef
    const me = (F && F.profile && F.profile.co) || "";
    const rates = (F && F.rates) || [];
    const others = K.filter((k) => k !== me);
    const txt = W.textContent || "";
    const shown = others.filter((k) => txt.indexOf(k) >= 0);
    // データの中の「（デモ）」の付いた会社（相見積の回答・レート）も見本として数える（画面の文字からは拾わない）
    const dn = new Set(); try { rates.forEach((r) => r && r.co && dn.add(r.co)); ((F && F.reqs) || []).forEach((q) => ((q && q.legs) || []).forEach((lg) => ((lg && lg.offers) || []).forEach((o) => o && o.co && dn.add(o.co)))); } catch (e) { /* 無視 */ }
    dn.forEach((k) => { if (/（デモ）$/.test(k) && k !== me && !others.includes(k)) { others.push(k); if (txt.indexOf(k) >= 0) shown.push(k); } });
    const meSmp = !!me && K.includes(me);
    let bar = $(".k-v90smpbar", W);
    if (!shown.length && !meSmp) { if (bar) bar.hidden = true; return; }
    const t = (shown.length ? `「${shown.join("」「")}」は見本（架空）の物流会社です。この画面の社数・最安・推奨・相見積には、見本の会社のレート・回答が入っています（実在の他社のレートではありません）。` : "")
      + (meSmp ? `貴社名「${me}」も体験用の見本の会社です。` : "");
    if (!bar) { bar = document.createElement("p"); bar.className = "k-v90smpbar"; bar.dataset.kqn = "1"; const top = $(":scope > .rd-p2", W) || $(":scope > [data-rdhero]", W); if (top) top.after(bar); else W.prepend(bar); }
    bar.hidden = false;
    if (bar.textContent !== t) bar.textContent = t;
    // 表：見本の会社の名前だけのセルに札
    $$("td", W).forEach((td) => { if (td.children.length > 1 || $(".k-v90smp", td)) return; const v = (td.textContent || "").trim(); if (others.includes(v)) td.appendChild(tag()); });
  }
  let smpT = 0;
  const smpTick = () => { if (smpT) return; smpT = setTimeout(() => { smpT = 0; try { smpShipper(); } catch (e) { console.error("[rd] v90ana smp", e); } try { smpFwd(); } catch (e) { console.error("[rd] v90ana smpf", e); } }, 120); };
  try { new MutationObserver((ms) => { if (ms.every((m) => m.target && m.target.closest && m.target.closest(".k-v90smpbar, .k-v90smp"))) return; smpTick(); }).observe(document.body, { childList: true, subtree: true }); } catch (e) { /* 無視 */ }
  smpTick();
  RD.v90smp = { shipper: smpShipper, fwd: smpFwd };
})();

} catch (e) { try { console.error("[rd] rd_v90ana.js", e); } catch (x) { } }
/* ==== rd_v90cty.js ==== */
try {
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

} catch (e) { try { console.error("[rd] rd_v90cty.js", e); } catch (x) { } }
/* ==== rd_v90doc.js ==== */
try {
/* 貿易クラウドAI商社マン デザイン刷新：21.90 doc（2026-11-13・改修一覧〔大森パート〕No.424・426・427・433・440）刷新版の層
   ① No.424 送り状番号に「？」が重なる：用語の印（rd_uat.js termScan）が「MN-CI-JD7-2608-01」の中の CI・PI を用語として拾っていた
        → 番号・コードの中（前後が「-」「_」「/」や英数字）に付いた印は外し、その部分を英語の欄（lang=en）にして付け直さない
   ② No.426 スタートガイド：ログイン前に開くと「各手順のボタンから、その画面を開けます」とあるのにボタンが無い
        → ログイン前でも各手順にボタンを出す（押すとログインの欄へ。ログインしたらその画面を開く）。冒頭の文もログイン前は合わせる
   ③ No.427 用語集：学ぶ画面に見えない（登録・CSV・5か国語の欄と同居）
        → 用語集の画面の上に「貿易のことばを学ぶ」（言葉で探せる一覧・全語）を置き、下の登録の欄の前に「会社の訳を登録する」の区切りを入れる（今の欄は1つも隠さない）。
          見出しの説明と「点線の言葉は…」の案内も、マウスを乗せても出ることを書く
   ④ No.433 一覧で英語のメッセージが途中で切れる → 案件の一覧の「最終やりとり」は2行まで出し、指を置くと全文。案件の詳細のやりとりは「全文を表示」で開く。
        ほかの「…」で切れる欄も、指を置くと全文（title）
   今のアプリの関数・刷新版の層の関数は呼ぶだけ（差し替えない） */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v90doc) return;
  RD._v90doc = 1;
  const esc = RD.esc || ((s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]));
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const V = (window.V90RD = { err: [], qgPend: "" });
  const err = (k, e) => { try { V.err.push(k + ": " + String((e && e.message) || e).slice(0, 160)); if (V.err.length > 30) V.err.shift(); } catch (x) { /* 無視 */ } };
  const fwd = () => { try { return !!RD.isFwd(); } catch (e) { return false; } };
  const locked = () => { try { return !!RD.locked(); } catch (e) { return false; } };
  const cur = () => { try { return RD.curKey(); } catch (e) { return ""; } };

  /* ───── ① 番号・コードの中の用語の印を外す ───── */
  const CODE_L = /[A-Za-z0-9][-_/.]$|[-_/]$/, CODE_R = /^[-_/][A-Za-z0-9]|^[A-Za-z0-9]/;
  function unmarkCodes() {
    const w = document.getElementById("well"); if (!w) return 0;
    let n = 0;
    $$("abbr.k-term", w).forEach((ab) => {
      const p = ab.previousSibling, q = ab.nextSibling;
      const pt = p && p.nodeType === 3 ? p.nodeValue : "", qt = q && q.nodeType === 3 ? q.nodeValue : "";
      if (!(CODE_L.test(pt) || CODE_R.test(qt))) return;
      const sp = document.createElement("span"); sp.setAttribute("lang", "en"); sp.className = "v90no"; sp.textContent = ab.textContent;
      ab.replaceWith(sp); n++;
    });
    return n;
  }
  V.unmarkCodes = unmarkCodes;

  /* ───── ② スタートガイド（ログイン前） ───── */
  const QS_GO = [[["up", "商品を登録する"]], [["cty", "販売先国の選定を開く"]], [["deck", "営業資料を開く"], ["db", "AIバイヤー開拓を開く"]], [["dash:home", "案件を開く"]], [["ai", "AI商社マンに聞く"]]];
  function qgFix() {
    const d = document.getElementById("k-qg"); if (!d || d.dataset.v90) return;
    d.dataset.v90 = "1";
    if (d.querySelector("[data-qggo]")) return; // ログイン後は今のまま（ボタンあり）
    if (!/荷主向け/.test((d.querySelector(".k-qgchip") || {}).textContent || "")) return;
    const p = d.querySelector(".k-qghd p");
    if (p) p.textContent = "AI商社マンは、この5つの順で使います。各手順のボタンを押すとログインの欄へ進み、ログインすると、その画面が開きます。";
    $$(".k-qgst > li", d).forEach((li, i) => {
      const go = QS_GO[i]; const tx = li.querySelector(".k-qgtx"); if (!go || !tx || tx.querySelector(".k-qggo")) return;
      tx.insertAdjacentHTML("beforeend", `<div class="k-qggo">${go.map((g) => `<button type="button" class="k-btn white k-mini" data-v90qg="${esc(g[0])}">${esc(g[1])}（ログインして開く）</button>`).join("")}</div>`);
    });
  }
  function qgLoginFocus() { const c = document.getElementById("lg-code") || document.getElementById("lg-mail") || document.querySelector("#lgv input"); if (c) { try { c.focus(); c.scrollIntoView({ block: "center" }); } catch (e) { /* 無視 */ } } }
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest("[data-v90qg]"); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    V.qgPend = b.dataset.v90qg; try { sessionStorage.setItem("bc20_v90qg", V.qgPend); } catch (x) { /* 無視 */ }
    const d = document.getElementById("k-qg"); if (d) { const x = d.querySelector("[data-qgclose]"); if (x) x.click(); else { d.remove(); document.documentElement.classList.remove("k-qgon"); } }
    setTimeout(qgLoginFocus, 50);
  }, true);
  function qgAfterLogin() {
    let k = V.qgPend; try { k = k || sessionStorage.getItem("bc20_v90qg") || ""; } catch (e) { /* 無視 */ }
    if (!k || locked()) return;
    V.qgPend = ""; try { sessionStorage.removeItem("bc20_v90qg"); } catch (e) { /* 無視 */ }
    if (fwd()) return;
    setTimeout(() => { try { RD.goKey(k); } catch (e) { err("qggo", e); } }, 600);
  }

  /* ───── ③ 用語集：学ぶ欄と登録の欄を分ける ───── */
  function glList() {
    const D = RD.termDict ? RD.termDict() : {}; const seen = new Set(), L = [];
    Object.keys(D).forEach((k) => { const x = D[k]; if (!x || !x.s) return; const n = x.n || k; const id = n + "\n" + x.s; if (seen.has(id)) return; seen.add(id); L.push({ n, s: x.s, long: x.long || "" }); });
    return L.sort((a, b) => a.n.localeCompare(b.n, "ja"));
  }
  function glossPage() {
    if (cur() !== "gloss" || fwd()) return;
    const w = document.getElementById("well"); if (!w || w.querySelector(".v90gl")) return;
    const hero = w.querySelector("[data-rdhero]");
    const hp = hero && hero.querySelector(".rd-ht > p:not(.k-termhint)");
    if (hp && !hp.dataset.v90) { hp.dataset.v90 = "1"; hp.textContent = "貿易のことばを、探して学べるページです。下の「会社の訳を登録する」では、営業資料・メールの訳をそろえられます。"; }
    const L = glList();
    const sec = document.createElement("section");
    sec.className = "k-card v90gl"; sec.setAttribute("aria-labelledby", "v90glt");
    sec.innerHTML = `<div class="v90glh"><h2 id="v90glt">貿易のことばを学ぶ（${L.length}語）</h2><p>画面の点線の言葉は、押すか、マウスを乗せると説明が出ます。ここでは、言葉で探して読めます。</p></div>
      <label class="k-glq v90glq"><input type="search" id="v90glq" placeholder="言葉で探す（例：FOB、B/L、HS、コード）" autocomplete="off" aria-label="用語を言葉で探す"></label>
      <p class="v90gln" id="v90gln" aria-live="polite"></p>
      <ul class="v90gll" id="v90gll">${L.map((x) => `<li data-q="${esc((x.n + " " + x.s + " " + x.long).toLowerCase())}"><b>${esc(x.n)}</b><p>${esc(x.s)}</p>${x.long ? `<details><summary>くわしく</summary><p>${esc(x.long)}</p></details>` : ""}</li>`).join("")}</ul>`;
    const anchor = hero ? hero.nextElementSibling : w.firstElementChild;
    if (anchor) anchor.before(sec); else w.prepend(sec);
    const q = sec.querySelector("#v90glq");
    q.addEventListener("input", () => {
      const v = q.value.trim().toLowerCase(); let n = 0;
      $$("#v90gll li", sec).forEach((li) => { const hit = !v || li.dataset.q.includes(v); li.hidden = !hit; if (hit) n++; });
      sec.querySelector("#v90gln").textContent = v ? (n ? `${n}語が見つかりました` : "見つかりませんでした。英字・カタカナなど、別の書き方でも探せます。わからないときは「AIに聞く」で聞けます。") : "";
    });
    // 登録の欄の前に区切り（今の欄はそのまま）
    const reg = $$(".c, .k-card, section", w).find((c) => c !== sec && !c.contains(sec) && /CSV で書き出す|登録した用語/.test(c.textContent || "") && !c.querySelector(".c, .k-card"));
    if (reg && !w.querySelector(".v90glreg")) reg.insertAdjacentHTML("beforebegin", `<div class="v90glreg" role="note"><h2>会社の訳を登録する（営業資料・メールの訳をそろえる）</h2><p>ここから下は、学ぶ欄ではなく、会社で決めた訳（商品名・ブランド名・決まった言い方）を登録する欄です。登録した訳は、営業資料・メールの点検で使います。</p></div>`);
  }
  function termHintFix() {
    const h = document.querySelector("#well .k-termhint"); if (!h || h.dataset.v90) return;
    h.dataset.v90 = "1";
    const t = Array.from(h.childNodes).find((n) => n.nodeType === 3 && /押すと説明が出ます/.test(n.nodeValue));
    if (t) t.nodeValue = t.nodeValue.replace("押すと説明が出ます", "押すか、マウスを乗せると説明が出ます");
  }

  /* ───── ④ 途中で切れる文：全文を出す道 ───── */
  const clean = (s) => String(s || "").replace(/[*#>`_]/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  function caseTable() {
    const rows = $$("#well .k-cltbl tr.k-clrow"); if (!rows.length) return;
    let all = null; const ord = RD._caseOrder || [];
    rows.forEach((r, i) => {
      const lt = r.querySelector(".k-lt"); if (!lt || lt.dataset.v90) return;
      if (!all) { try { all = RD.allCases(); } catch (e) { all = []; } }
      const c = all.find((x) => x.key === ord[i]); const lm = c && c.last; if (!lm) return;
      const full = clean(lm.subj || lm.body); if (!full) return;
      lt.dataset.v90 = "1"; lt.title = full; lt.classList.add("v90lt");
      const b = lt.querySelector("b"); const tn = b ? b.nextSibling : lt.firstChild;
      const one = full.replace(/\s+/g, " ");
      if (tn && tn.nodeType === 3) tn.nodeValue = one.length > 90 ? one.slice(0, 89) + "…" : one;
    });
  }
  function caseMsgs() {
    if (cur() !== "dash:case") return;
    const ol = document.querySelector("#well .k-cdmsgs .k-tl"); if (!ol || ol.dataset.v90 === String(RD.caseKey)) return;
    let c = null; try { c = RD.allCases().find((x) => x.key === RD.caseKey); } catch (e) { c = null; }
    if (!c) return;
    ol.dataset.v90 = String(RD.caseKey);
    const msgs = c.msgs.slice().reverse();
    $$(":scope > li", ol).forEach((li, i) => {
      const m = msgs[i]; const p = li.querySelector(".k-tlb p"); if (!m || !p || li.querySelector(".v90more")) return;
      const full = clean(m.body); const short = p.textContent;
      const cut = full.replace(/\s+/g, " ").length > short.replace(/\s+/g, " ").replace(/…$/, "").length + 1 || p.scrollHeight > p.clientHeight + 2;
      if (!cut) return;
      const bt = document.createElement("button"); bt.type = "button"; bt.className = "k-link v90more"; bt.setAttribute("aria-expanded", "false"); bt.textContent = "全文を表示";
      bt.addEventListener("click", (e) => { e.stopPropagation(); const on = !p.classList.contains("v90open"); p.classList.toggle("v90open", on); p.textContent = on ? full : short; bt.textContent = on ? "たたむ" : "全文を表示"; bt.setAttribute("aria-expanded", String(on)); });
      p.after(bt);
    });
  }
  const ELL = ".k-row .k-rt b, .k-row .k-rt small, .k-cltbl .c-who small, .k-tlh b, .k-tn, .k-pcnm small, .rd-li .rd-lt, .rd-kv dd";
  function ellTitles() { $$(ELL, document.getElementById("well") || document).forEach((x) => { if (x.title || x.scrollWidth <= x.clientWidth + 1) return; x.title = (x.textContent || "").trim(); }); }

  /* ───── まとめて動かす ───── */
  let busy = false;
  function pass() {
    if (busy) return; busy = true;
    try { unmarkCodes(); } catch (e) { err("codes", e); }
    try { qgFix(); } catch (e) { err("qg", e); }
    try { if (!locked()) { qgAfterLogin(); glossPage(); termHintFix(); caseTable(); caseMsgs(); ellTitles(); } } catch (e) { err("pass", e); }
    busy = false;
  }
  V.pass = pass;
  let tmo = 0;
  const mo = new MutationObserver(() => { if (busy || tmo) return; tmo = setTimeout(() => { tmo = 0; pass(); }, 120); });
  const start = () => { try { mo.observe(document.body, { childList: true, subtree: true }); } catch (e) { /* 無視 */ } pass(); };
  if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
})();

} catch (e) { try { console.error("[rd] rd_v90doc.js", e); } catch (x) { } }
/* ==== rd_v90fwd.js ==== */
try {
/* 貿易クラウドAI商社マン デザイン刷新：21.90 fwd（2026-11-13）物流会社の画面の直し。改修一覧〔大森パート〕No.390・395・429・431（11/13 再検証 第4回・ペルソナ評価）
   No.390 相見積・AI推奨（fagg）の箱：rd.js の aggSummary は相見積を AI の点の高い順に並べ直すため、期限切れの見積（RQ-OG1RXF：期限 10/31・91点）が 👑1位・推奨のまま。
     直し：箱を描く間だけ、アプリの層（logic_v2190fwd.js の v90fRank）が期限切れの見積の点を「並びは最後・表示は同じ数」にする（V90F.rdSort）。
       描いた後、期限切れの行の順位を「期限切れ・取り直し（順位の外）」に、貴社の見積が期限切れなら「現在の選定状況」を「順位の外」に、
       全社が期限切れなら「推奨なし」と知らせを出す。対象の依頼を選ぶ欄の「貴社 ◯位」も同じ。点（AIの点）は残す
   No.395 見積受信箱の注意のセル：刷新版で描き直した後も、同じ警告は1回（アプリの層の v90fDedupe）
   No.429 担当の保存の後：刷新版の受信箱の上の数（全体の状況・タブ）を描き直す（アプリの層が描き直した後に呼ぶ RDX.v90fRefresh）
   No.431 左のメニューに「全体の状況」（ホームの「全体の状況」へ移る）・ホームの全体の状況に「期限切れのレート」のタイル（押すと物流レート管理で期限切れの行を開く）
   No.447 ギャップ分析（1位との差）の「価格差 +¥1,400／日数差 −2日／有効期限 −31日」を「1位より ¥1,400 高い（3.7%・不利）」「1位より 2日 早い（有利）」「1位より 31日 短い（不利）」に（元の数は title に）
   fwd-auto・fwd-valid（ペルソナ評価）ホームの「AI自動回答率」に内訳（有効なレート・仕出港どおり／期限切れ・港違いを含む）・レート管理の「登録レーン」に「有効なレートは M本中 N本」
   今のアプリの関数・刷新版の前の層は差し替えず、RDX.after を包む */
(function () {
  const RD = window.RDX;
  if (!RD || RD.v90fwd) return;
  RD.v90fwd = { ver: "21.90", err: [], agg: 0, nav: 0, tile: 0 };
  const err = (k, e) => { try { RD.v90fwd.err.push(k + ": " + String((e && e.message) || e).slice(0, 160)); } catch (x) { /* 無視 */ } };
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const FW = () => { try { return typeof FWDB !== "undefined" ? FWDB : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const key = () => { try { return RD.curKey ? RD.curKey() : ""; } catch (e) { return ""; } };
  const fwd = () => { try { return RD.isFwd ? RD.isFwd() : false; } catch (e) { return false; } };
  const dwOpen = () => { const d = document.getElementById("dw"); return !!(d && d.dataset.open === "true"); };
  const view = (l) => { try { return typeof v80fwdLeg === "function" ? v80fwdLeg(l) : l; } catch (e) { return l; } }; // eslint-disable-line no-undef
  const me = () => { try { return typeof fwdCo === "function" ? fwdCo() : ((FW() && FW().profile && FW().profile.co) || ""); } catch (e) { return ""; } }; // eslint-disable-line no-undef
  if (typeof V90F !== "undefined") V90F.rdSort = () => fwd() && key() === "fagg" && !dwOpen(); // eslint-disable-line no-undef

  /* ───── No.390 相見積の箱 ───── */
  function laneOf(optText) {
    const m = /^(RQ-[A-Za-z0-9]+)・(.+?)・貴社/.exec(String(optText || "").trim()); if (!m) return null;
    const D = FW(); const r = D && (D.reqs || []).find((x) => x && x.id === m[1]); if (!r) return null;
    const l = (r.legs || []).find((x) => x && (x.cty === m[2] || x.pod === m[2])); if (!l) return null;
    const v = view(l); return { r, l, v };
  }
  function fixAgg() {
    const box = document.querySelector("#well [data-rdagg]"); if (!box) return;
    const sel = box.querySelector("#rdaggsel"); if (!sel) return;
    const my = me();
    // 選ぶ欄の「貴社 ◯位」
    [...sel.options].forEach((op) => { if (op.dataset.v90f) return; const x = laneOf(op.textContent); if (!x || !x.v || !x.v.v90exp) return; op.dataset.v90f = "1";
      const O = x.v.offers || []; const mi = O.findIndex((o) => o && o.co === my); const mo = O[mi];
      op.textContent = op.textContent.replace(/貴社 \d+位\/(\d+)社/, (s, n) => mo && mo.v90x ? `貴社 期限切れ（順位の外）/${n}社` : `貴社 ${mi + 1}位/${n}社（期限切れ ${x.v.v90exp}社は順位の外）`); });
    const cur = sel.options[sel.selectedIndex]; const x = cur && laneOf(cur.dataset.v90f ? (cur.textContent.replace(/貴社 .*$/, "貴社")) : cur.textContent);
    if (!x || !x.v || !x.v.v90exp || box.dataset.v90f === cur.value) return;
    box.dataset.v90f = cur.value;
    const O = x.v.offers || [], byCo = (co) => O.find((o) => o && o.co === co);
    // 表：期限切れの行の順位
    box.querySelectorAll("table.rd-tbl tbody tr").forEach((tr) => { const b = tr.querySelector("td:nth-child(2) b"); const o = b && byCo((b.textContent || "").trim()); if (!o || !o.v90x) return;
      const td = tr.children[0]; if (td) td.innerHTML = `<span class="rd-tag rd v90fout" style="white-space:nowrap">期限切れ・取り直し</span><div style="font-size:11px;color:var(--rd-ink3)">順位の外</div>`;
      tr.style.opacity = ".78"; });
    // 現在の選定状況（貴社）
    const mine = byCo(my);
    const big = [...box.querySelectorAll("#rdaggtop div")].find((d) => /^第\s*\d+\s*位/.test((d.textContent || "").trim()) && d.querySelector("span"));
    if (mine && mine.v90x && big) { big.innerHTML = `<span style="font-size:26px;font-weight:900;color:var(--rd-crit)">順位の外</span><div style="font-size:13px;font-weight:700;color:var(--rd-ink2)">貴社の見積は有効期限切れ（取り直しが必要）</div>`; }
    const note = big && big.parentElement && big.parentElement.nextElementSibling;
    if (note && mine && mine.v90x) note.innerHTML = `貴社の見積は有効期限が切れているため、推奨・順位の対象外です。<br>レート管理で新しい期限のレートを登録すると、次の見積から順位に入ります。<br>AIの点（参考）：貴社 ${esc(String(mine.score))}`;
    // 推奨のタグ
    const tag = [...box.querySelectorAll(".rd-tag.or")].find((t) => /^推奨：/.test((t.textContent || "").trim()));
    if (tag && x.v.v90noRec) tag.textContent = "推奨なし（全社の見積が期限切れ）";
    // 知らせ
    if (!box.querySelector(".v90fagnote")) {
      const top = box.querySelector("#rdaggtop");
      const msg = x.v.v90noRec ? `この依頼（${x.r.id}・${x.l.cty}）の相見積は、${O.length}社とも見積の有効期限が切れています。期限切れの見積は AI の推奨・順位の対象外です（AIの点は参考に残しています）。新しい期限のレートで取り直してください。`
        : `期限切れの見積 ${x.v.v90exp}社は、AI の推奨・順位の外にしました（表の下に「期限切れ・取り直し」で残しています）。推奨は有効な見積の中で AI の点が最も高い会社です。`;
      if (top) top.insertAdjacentHTML("beforebegin", `<div class="rd-card v90fagnote" role="note" style="margin-bottom:12px;padding:12px 18px;border-left:5px solid var(--rd-crit);font-weight:700;font-size:14px;line-height:1.6">${esc(msg)}</div>`);
    }
    RD.v90fwd.agg++;
  }


  /* ───── No.447 ギャップ分析の符号を言葉に ───── */
  function fixGap() {
    const box = document.querySelector("#well [data-rdagg]"); if (!box) return;
    box.querySelectorAll("dl.rd-kv dt").forEach((dt) => {
      const dd = dt.nextElementSibling; if (!dd || dd.dataset.v90f) return; const k = (dt.textContent || "").trim(); const t = (dd.textContent || "").trim();
      let sg = t[0] === "+" ? 1 : (t[0] === "−" || t[0] === "-") ? -1 : 0; let body = t.replace(/^[+−\-±]\s*/, ""); if (/^¥-/.test(body)) { sg = -1; body = "¥" + body.slice(2); } else if (k === "価格差" && sg === 0 && /^¥[1-9]/.test(body)) sg = 1;
      let s = "";
      if (k === "価格差") { const m = /^(¥[\d,]+)（([^）]*)）/.exec(body); const amt = m ? m[1] : body, pc = m ? m[2].replace(/^[+−\-]/, "") : "";
        s = sg > 0 ? `1位より ${amt} 高い（${pc}・不利）` : sg < 0 ? `1位より ${amt} 安い（${pc}・有利）` : "1位と同じ価格"; }
      else if (k === "日数差") s = sg > 0 ? `1位より ${body} 遅い（不利）` : sg < 0 ? `1位より ${body} 早い（有利）` : "1位と同じ日数";
      else if (k === "有効期限") s = sg > 0 ? `1位より ${body} 長い（有利）` : sg < 0 ? `1位より ${body} 短い（不利）` : "1位と同じ";
      else return;
      dd.dataset.v90f = "1"; dd.title = t; dd.textContent = s; dd.style.color = /不利/.test(s) ? "var(--rd-crit)" : /有利/.test(s) ? "var(--rd-good)" : "";
    });
    RD.v90fwd.gap = (RD.v90fwd.gap || 0) + 1;
  }


  /* ───── fwd-auto・fwd-valid：ホームの「AI自動回答率」とレート管理の「登録レーン」に内訳 ───── */
  function autoSub() {
    const t = document.querySelector('#well [data-rdtile="1"]'); if (!t || t.querySelector(".v90fautos") || typeof window.v90fAutoSplit !== "function") return;
    const A = window.v90fAutoSplit(); if (!A.auto) return; const sp = t.querySelector(".rd-tn"); if (!sp) return;
    sp.parentElement.insertAdjacentHTML("beforeend", `<span class="rd-ts v90fautos" style="display:block;color:${A.warn ? "var(--rd-crit)" : "inherit"}">有効なレート・仕出港どおり ${A.clean}件／期限切れ・港違いを含む ${A.warn}件</span>`);
  }
  function validSub() {
    const t = [...document.querySelectorAll("#well [data-rdrates] .rd-tile")].find((x) => /^登録レーン/.test(((x.querySelector("b") || {}).textContent || "").trim())); if (!t || t.querySelector(".v90fvalids") || typeof window.v90fValidCount !== "function") return;
    const V = window.v90fValidCount(); const ts = t.querySelector(".rd-ts");
    const h = `<span class="rd-ts v90fvalids" style="display:block;font-weight:800">有効なレートは ${V.all}本中 ${V.valid}本</span>`;
    if (ts) ts.insertAdjacentHTML("beforebegin", h); else { const tn = t.querySelector(".rd-tn"); if (tn) tn.insertAdjacentHTML("afterend", h); }
  }

  /* ───── No.431 左のメニューの「全体の状況」・ホームのタイル ───── */
  try { if (Array.isArray(RD.MAIN_F) && !RD.MAIN_F.some((it) => it[0] === "@ov")) { const i = RD.MAIN_F.findIndex((it) => it[0] === "fhome"); RD.MAIN_F.splice(i + 1, 0, ["@ov", "全体の状況", "chart"]); } } catch (e) { err("main", e); }
  function goOverview() {
    try { RD.goKey("fhome"); } catch (e) { err("ov", e); }
    let n = 0; const t = setInterval(() => { n++; const h = [...document.querySelectorAll("#well .rd-card h2")].find((x) => /^全体の状況/.test((x.textContent || "").trim())); if (h || n > 20) { clearInterval(t); if (h) { const c = h.closest(".rd-card"); c.scrollIntoView({ block: "start", behavior: "smooth" }); c.style.boxShadow = "0 0 0 3px var(--rd-or)"; setTimeout(() => { c.style.boxShadow = ""; }, 2400); } } }, 100);
  }
  document.addEventListener("click", (e) => { const b = e.target && e.target.closest && e.target.closest('#rdside [data-rdk="@ov"]'); if (!b) return; e.preventDefault(); e.stopPropagation(); if (document.body.classList.contains("navopen")) document.body.classList.remove("navopen"); goOverview(); RD.v90fwd.nav++; }, true);
  function navMark() { const b = document.querySelector('#rdside [data-rdk="@ov"]'); if (b) { b.setAttribute("aria-current", "false"); b.title = "物流会社の全体の状況（ダッシュボード）：受信・AI回答・要確認・仮押さえ・期限切れのレートの数"; } }
  function homeTile() {
    const w = document.getElementById("well"); if (!w) return; const box = w.querySelector(".rd-tiles"); if (!box || box.querySelector("[data-v90ftile]")) return;
    const h = [...w.querySelectorAll(".rd-card h2")].find((x) => /^全体の状況/.test((x.textContent || "").trim())); if (!h || !h.closest(".rd-card").contains(box)) return;
    const n = typeof window.v90fExpRates === "function" ? window.v90fExpRates() : 0;
    box.insertAdjacentHTML("beforeend", `<button type="button" class="rd-tile ${n ? "rd" : "gr"}" data-v90ftile="1" data-v90fov="1"><span class="rd-ti">${RD.I ? RD.I("alert", 26) : ""}</span><span><b>期限切れのレート</b><span class="rd-tn">${n}<small>本</small></span><span class="rd-ts" style="display:block">見積・推奨に使われません（押すと一覧）</span></span></button>`);
    RD.v90fwd.tile++;
  }

  /* ───── No.429 担当の保存の後 ───── */
  RD.v90fRefresh = function () { try { if (fwd() && key() === "finbox" && typeof RD.after === "function") RD.after(true); } catch (e) { err("refresh", e); } };

  const old = RD.after;
  RD.after = function () {
    const r = old.apply(this, arguments);
    try {
      if (fwd()) {
        const k = key(); const w = document.getElementById("well");
        if (k === "fagg") { fixAgg(); fixGap(); }
        else if (k === "finbox" && w && typeof window.v90fDedupe === "function") window.v90fDedupe(w);
        else if (k === "fhome") { homeTile(); autoSub(); }
        else if (k === "frates") validSub();
        navMark();
      }
    } catch (e) { err("after", e); }
    return r;
  };
  window.addEventListener("change", (e) => { if (e.target && e.target.id === "rdaggsel" && fwd()) { setTimeout(() => { try { fixAgg(); fixGap(); } catch (x) { err("sel", x); } }, 0); } }, false);
  // ホームは見張り（onWell）が後から描くので、少し後にもう一度
  const mo = new MutationObserver(() => { try { if (fwd() && key() === "fhome") { homeTile(); autoSub(); } navMark(); } catch (e) { /* まだ */ } });
  try { const w = document.getElementById("well"); if (w) mo.observe(w, { childList: true }); } catch (e) { err("mo", e); }
})();

} catch (e) { try { console.error("[rd] rd_v90fwd.js", e); } catch (x) { } }
/* ==== rd_v90adm.js ==== */
try {
/* 貿易クラウドAI商社マン 21.90 adm（刷新版の管理コンソール・2026-11-13）
   403 刷新版の「アカウントの状況（N件）」に母数（台帳の行・アクセスコードの種類）を書く
   404 アカウント一覧が横にはみ出すときは「横に動かせます」の案内を出す（右端の操作の列は刷新版の CSS で常に見える） */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v90adm) return;
  RD._v90adm = 1;
  const isAdm = () => { try { return typeof SES !== "undefined" && !!SES && SES.t === "admin"; } catch (e) { return false; } }; // eslint-disable-line no-undef
  function basis(w) {
    try {
      const card = [...w.querySelectorAll("section.k-card")].find((c) => /アカウントの状況/.test(((c.querySelector(".k-h h2") || {}).textContent) || ""));
      const hs = card && card.querySelector(".k-hs"); if (!hs) return;
      const I = typeof v90admDupInfo === "function" ? v90admDupInfo() : null; // eslint-disable-line no-undef
      const rows = w.querySelectorAll("#accounts tbody tr[data-st]").length;
      const t = I ? `（台帳の行 ${rows}件・アクセスコード ${I.codes}種類${I.dupRows || I.lid ? "・重なりの印 " + (I.dupRows + I.lid) + "行" : ""}）` : `（台帳の行 ${rows}件）`;
      if (hs.textContent !== t) { hs.textContent = t; hs.title = "件数は台帳の行（記録）の数です。同じアクセスコードの行などは、アカウント一覧に印を付けています"; }
    } catch (e) { /* 無視 */ }
  }
  function hscroll(w) {
    try {
      const card = w.querySelector("#accounts"); const tw = card && card.querySelector(".tw"); if (!tw) return;
      const over = tw.scrollWidth > tw.clientWidth + 2; let h = card.querySelector(".v90hs");
      if (!over) { if (h) h.remove(); return; }
      if (over && !h) { h = document.createElement("p"); h.className = "v90hs rd-x"; h.setAttribute("role", "note");
        h.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5M3 12h18"/></svg><span></span>`;
        tw.before(h); }
      if (h) { const last = card.querySelector("tbody tr td:last-child"); const st = last && getComputedStyle(last).position === "sticky";
        const t = "表は横に動かせます（" + (st ? "表の下のつまみ・Shift＋ホイール・トラックパッドの横スワイプ）。右端の「無効化」「詳細」はいつも見えています。" : "指で横にずらす）。「無効化」「詳細」は右端にあります。");
        const sp = h.querySelector("span"); if (sp && sp.textContent !== t) sp.textContent = t; }
    } catch (e) { /* 無視 */ }
  }
  const prev = RD.page && RD.page.adm;
  if (prev) RD.page.adm = function (w) { const r = prev.apply(this, arguments); try { basis(w); hscroll(w); } catch (e) { /* 無視 */ } return r; };
  let t = 0;
  const run = () => { if (!isAdm()) return; const w = document.getElementById("well"); if (!w) return; basis(w); hscroll(w); };
  try { new MutationObserver(() => { if (!isAdm()) return; clearTimeout(t); t = setTimeout(run, 120); }).observe(document.body, { childList: true, subtree: true }); } catch (e) { /* 無視 */ }
  window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(run, 150); });
})();

} catch (e) { try { console.error("[rd] rd_v90adm.js", e); } catch (x) { } }
/* ==== rd_v90reg.js ==== */
try {
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

} catch (e) { try { console.error("[rd] rd_v90reg.js", e); } catch (x) { } }
/* ==== rd_v90per.js ==== */
try {
/* 貿易クラウドAI商社マン 21.90 per：ペルソナ評価 第4回（2026-11-13・v21.89）の横断の課題（刷新版の層・rd_case.js のあとに読む）
   番号の無い共通課題のうち、案件一覧（ホーム）で直すもの。今のアプリの関数・ほかの層の部品は呼ぶだけ（差し替えない）。
   ① 共通課題8：TRIAL-2026 では見本の会社（デモ商材3社・業種サンプル5社）を選べるのに、評価者は「みなと酒造で固定」と思った
      （切り替えは右上の会社名の窓の中だけ）→ 案件一覧の上の札に「業種を変えて試す」。押すと今のアプリの「サンプルで試す」の窓（v84SmpOpen）
      出すのは、見本を表示しているとき・まだ自社の商品が無いときだけ（自社の商品を使っているお客様の画面は今のまま）
   ② 案件一覧は「このアカウントの全部の会社・商品の案件」を並べる。TRIAL-2026 で スドウ金属工業 を表示中でも、みなと酒造 の5件が
      会社名なしで並び、表示中の会社の案件に見えた（数の信頼の問題）→ 表示中と違う会社の行に会社名の札、表の上に1行の説明
   ③ 見本の完成形（食品・化粧品・工業部品）を開くと、案件一覧は「まだ案件はありません」だけ（完成形の商談は「商談の記録」と
      これまでのダッシュボードにあり、案件一覧＝メールのやりとりには無い）→ その2つへのボタンと件数（架空の行は作らない）
   ④ 共通課題5（D：高齢寄り）：文字の大きさ「ゆったり」で、案件一覧の小さな字（12〜13px）を引き上げる（rd_v90per.css） */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v90per) return;
  RD._v90per = 1;
  const { I, esc, $, $$, G } = RD;
  const fn = (n) => { try { return typeof window[n] === "function" ? window[n] : null; } catch (e) { return null; } };
  const tens = () => { try { return typeof TENS !== "undefined" && Array.isArray(TENS) ? TENS : []; } catch (e) { return []; } }; // eslint-disable-line no-undef
  const cur = () => G("TEN") || null;
  const pid = () => { try { return typeof PID !== "undefined" ? PID : ""; } catch (e) { return ""; } }; // eslint-disable-line no-undef
  const demoP = () => { try { const k = pid(); return k && typeof PRODUCTS !== "undefined" && PRODUCTS && PRODUCTS[k] ? PRODUCTS[k] : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const isSmp = (t) => { const f = fn("v84IsSmpT"); try { return !!(t && f && f(t)); } catch (e) { return false; } };
  const smpN = () => { const f = fn("v84SmpN"); try { return f ? +f() || 0 : 0; } catch (e) { return 0; } };
  const coOf = (t) => (t && (t.co || "")) || "";
  const chain = (k, f) => { const p0 = RD.page[k]; RD.page[k] = (w, kk) => { if (p0) p0(w, kk); try { f(w, kk); } catch (e) { console.error("[rd] v90per " + k, e); } }; };

  /* 見本を表示しているか（業種サンプル・デモ商材）、自社の商品がまだ無いか */
  function showSmp() {
    if (!smpN() || !fn("v84SmpOpen")) return false;
    const S = G("SES") || {};
    if (S.t === "admin" || RD.isFwd()) return false;
    if (demoP() || isSmp(cur())) return true;
    const own = tens().filter((t) => t && !isSmp(t));
    return own.length === 0;
  }
  function catNow() {
    const P = demoP(), t = cur();
    return String((P && (P.cat || "")) || (t && (t.cat || "")) || "").trim();
  }

  /* ── ① 業種を変えて試す ── */
  function smpPill(box) {
    const old = $(".k-v90persmp", box);
    if (!showSmp()) { if (old) old.remove(); return; }
    const cat = catNow(), n = smpN();
    const html = `${I("refresh", 16, 2.2)}業種を変えて試す<span class="k-pn">${cat ? `いま：${esc(cat)}・` : ""}見本 ${n}社</span>`;
    if (old) { if (old.dataset.v !== html) { old.innerHTML = html; old.dataset.v = html; } return; }
    let row = $(".k-pills", box);
    if (!row) {
      const card = $(".k-clcard", box);
      row = document.createElement("div");
      row.className = "k-pills"; row.setAttribute("role", "group"); row.setAttribute("aria-label", "対応待ち");
      if (card) card.before(row); else box.prepend(row);
    }
    const b = document.createElement("button");
    b.type = "button"; b.className = "k-pill k-v90persmp"; b.innerHTML = html; b.dataset.v = html;
    b.title = "見本（架空の会社）を、食品・化粧品・工業部品・日用雑貨・アパレル・医療衛生・中古車・酒類から選んで、同じ画面で試せます。見本は貴社の商品の一覧・数・成長レベルには入りません（右上の会社名の窓の中の「会社・商品の切り替え」と同じです）";
    b.setAttribute("aria-label", "業種を変えて試す（見本の会社を選ぶ）");
    b.addEventListener("click", (e) => { e.stopPropagation(); const f = fn("v84SmpOpen"); if (f) f(); });
    row.appendChild(b);
  }

  /* ── ② 表示中と違う会社の案件に会社名 ── */
  function coTags(box) {
    const T = tens(), t0 = cur(), co0 = coOf(t0);
    const tb = $("#k-clbody", box);
    if (!tb) return;
    const keys = Array.isArray(RD._caseOrder) ? RD._caseOrder : [];
    const rows = $$("tbody tr.k-clrow", tb);
    let other = 0;
    rows.forEach((tr, i) => {
      const k = keys[i] || "";
      const pi = +String(k).split("|")[0];
      const t = pi >= 0 ? T[pi] : null;
      const co = coOf(t);
      const diff = !!(co && co0 && co !== co0);
      const td = $("td.c-who", tr);
      const tag = td && $(".k-v90perco", td);
      if (diff) other++;
      if (!td) return;
      if (diff && !tag) { const s = document.createElement("span"); s.className = "k-v90perco"; s.title = "表示中の会社（" + co0 + "）とは別の会社の案件です"; s.innerHTML = `${I("bldg", 13, 2.2)}${esc(co)}`; ($("small", td) || td.lastChild).after(s); }
      else if (!diff && tag) tag.remove();
      else if (diff && tag && tag.textContent !== co) tag.innerHTML = `${I("bldg", 13, 2.2)}${esc(co)}`;
    });
    const L = typeof RD.allCases === "function" ? RD.allCases() : [];
    const mine = L.filter((c) => coOf(T[c.pi] || (c.pi < 0 ? t0 : null)) === co0).length;
    const others = L.length - mine;
    let note = $(".k-v90perconote", box);
    if (others > 0 && co0) {
      const t = mine ? `この一覧は、このアカウントの全部の会社の案件です（表示中の ${co0}：${mine}件・ほかの会社：${others}件。ほかの会社の行には会社名）`
        : `表示中の ${co0} の案件は、まだありません。下は、このアカウントのほかの会社の案件（${others}件・会社名つき）です`;
      if (!note) { note = document.createElement("p"); note.className = "k-v90perconote"; const card = $(".k-clcard", box); const st = card && $(".k-stchips", card); if (st) st.after(note); else if (card) card.prepend(note); }
      if (note.dataset.t !== t) { note.innerHTML = `${I("bldg", 15, 2.2)}<span>${esc(t)}</span>`; note.dataset.t = t; }
    } else if (note) note.remove();
    return other;
  }

  /* ── ③ 見本の完成形：案件一覧が空のとき、商談の記録とこれまでのダッシュボードへ ── */
  function demoEmpty(box) {
    const P = demoP();
    const em = $(".k-clempty", box);
    const old = $(".k-v90perdemo", box);
    if (!P || !em) { if (old && !em) old.remove(); return; }
    if (old) return;
    const nfb = Array.isArray(P.fb) ? P.fb.length : 0;
    const nb = Array.isArray(P.hotList) ? P.hotList.length : 0;
    const d = document.createElement("div");
    d.className = "k-v90perdemo";
    d.innerHTML = `<p title="案件一覧は、バイヤーとのメールのやりとり（「やりとり」の相手ごとのスレッド）から作ります。見本の完成形（${esc(P.co || "")}）は、2年分の商談を「商談の記録」と、これまでのダッシュボードに入れてあり、メールのやりとりは入っていません">${I("alert", 16, 2.2)}<span>見本（完成形）の商談は「商談の記録」${nfb ? `<b>${nfb}件</b>` : ""}${nb ? `・見込みのバイヤー<b>${nb}社</b>` : ""}にあります（この一覧はメールのやりとりから作るため空です）</span></p>
      <div class="k-v90perdemob"><button type="button" class="k-btn white k-mini" data-v90pergo="deal">${I("doc", 15, 2.2)}商談の記録を見る</button><button type="button" class="k-btn white k-mini" data-v90pergo="old">${I("chart", 15, 2.2)}これまでのダッシュボードを開く</button></div>`;
    $$("[data-v90pergo]", d).forEach((b) => b.addEventListener("click", (e) => {
      e.stopPropagation();
      if (b.dataset.v90pergo === "deal") { RD.goKey("deal"); return; }
      const f = document.querySelector("details.rd-old");
      if (f) { f.open = true; try { f.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (x) { f.scrollIntoView(); } }
    }));
    const tx = $("div", em) || em;
    const p = $("p", tx);
    if (p) p.after(d); else tx.appendChild(d);
  }

  function apply(w) {
    const box = $(".k-cl[data-kcl]", w || document);
    if (!box) return;
    smpPill(box);
    coTags(box);
    demoEmpty(box);
    const tb = $("#k-clbody", box);
    if (tb && !tb.dataset.v90per) {
      tb.dataset.v90per = "1";
      try { new MutationObserver(() => { try { coTags(box); demoEmpty(box); } catch (e) { /* 無視 */ } }).observe(tb, { childList: true }); } catch (e) { /* 無視 */ }
    }
  }
  chain("dash:home", (w) => apply(w));
  chain("dash", (w) => apply(w));
  RD.v90perApply = apply;
  RD.v90per = { showSmp, catNow };
})();

} catch (e) { try { console.error("[rd] rd_v90per.js", e); } catch (x) { } }
/* ==== rd_v90i18n.js ==== */
try {
/* 21.90 i18n：刷新版の層の文言の英語の辞書（rd_v90i18n.js の前に読む・window.V90I18N_EN に置くだけ） */
window.V90I18N_EN = [
  /* ── 左のメニュー（グループ・項目・よく使う項目） ── */
  ["ホーム", "Home"], ["今日やること", "Today's tasks"], ["受信箱", "Inbox"], ["AI商社マンに相談", "Ask the AI Trade Agent"],
  ["商談・案件", "Deals & cases"], ["AIバイヤー開拓・拠点", "AI buyer sourcing & bases"], ["外国語 営業資料", "Foreign-language sales deck"], ["商談・バイヤー", "Deals & buyers"],
  ["やりとり", "Messages"], ["会議メモ・議事録", "Meeting notes"], ["依頼ページ", "Request pages"], ["商社デスク（STANDAGE）", "Trading desk (STANDAGE)"],
  ["調査・規制", "Research & regulations"], ["販売先国の選定", "Target market selection"], ["規制を調べる", "Check regulations"],
  ["物流・出荷", "Logistics & shipping"], ["書類をつくる", "Create documents"], ["出荷を進める", "Ship an order"], ["受注・請求・入金", "Orders, invoices & payments"],
  ["この案件の書類", "Documents for this case"], ["出荷を進める（前の画面）", "Ship an order (previous screen)"],
  ["資産（ナレッジ）", "Assets (knowledge)"], ["商品情報", "Product info"], ["商品情報を登録", "Register product info"], ["ドキュメント", "Documents"], ["契約書関連", "Contracts"],
  ["用語集（貿易のことば）", "Glossary (trade terms)"], ["取り込んだ情報", "Imported information"],
  ["分析・レポート", "Analytics & reports"], ["タスク・進行", "Tasks & progress"], ["設定", "Settings"], ["メンバー・権限・セキュリティ", "Members, roles & security"], ["ゴミ箱", "Trash"],
  ["見積", "Quotes"], ["見積受信箱", "Quote inbox"], ["相見積・AI推奨", "Quote comparison & AI pick"], ["物流レート管理", "Freight rates"], ["案件", "Cases"], ["案件・出荷管理", "Cases & shipments"],
  ["AI物流マンに相談", "Ask AI Logistics"], ["商品", "Products"], ["AIに聞く", "Ask AI"], ["困ったとき", "Help"], ["すべての機能", "All features"], ["未読・対応待ち", "Unread / waiting"],
  ["案件一覧（ホーム）", "Cases (Home)"], ["商品一覧", "Product list"], ["荷主向け", "For shippers"], ["物流会社向け", "For forwarders"], ["ホームへ", "Go to Home"], ["メニュー", "Menu"],
  ["はじめての方へ", "New here?"], ["3分でわかる", "3-minute"], ["スタートガイド", "start guide"], ["5つの手順で、使い方の流れだけ", "The basics in 5 steps"],
  /* ── 刷新版の札・上の帯 ── */
  ["刷新版プレビュー（手元だけ・本番には出ていません）", "Redesign preview (local only · not in production)"], ["刷新版（社内確認用・データは今の版と共通）", "Redesign (internal review · data shared with the current version)"],
  ["今の版を開く", "Open the current version"], ["文字の大きさ", "Text size"], ["いまの場所", "You are here"], ["次は", "Next"],
  ["会社・商品", "Company & product"], ["会社・商品の切り替え", "Switch company / product"], ["会社・商品・アカウント", "Company, product & account"], ["新しい会社の商品の登録", "Register a new company's product"],
  ["表示している会社", "Company shown"], ["表示している会社・商品（切り替え）", "Company / product shown (switch)"], ["アカウント", "Account"], ["表示", "Display"], ["追加", "Add"],
  ["このボタンの中に、会社・商品の切り替え、新しい会社の商品の登録、やさしい説明、ログアウトがあります。", "This button holds company / product switching, registering a new company's product, plain language and log out."],
  /* ── 見出し（題と一言） ── */
  ["分析・レポート", "Analytics & reports"], ["商談の進み具合・国ごとの手応え・タスクを、データでまとめています。", "Deal progress, traction by country and tasks, summarized with data."],
  ["案件の詳細", "Case details"], ["この案件のやりとり・タスク・書類・商談の記録を、1画面で見られます。", "See this case's messages, tasks, documents and meeting records on one screen."],
  ["登録した商品の一覧です。商品ごとに、販売先国・準備の進み・案件の数を見られます。押すと、その商品に切り替わります。", "Your registered products. See each product's target markets, readiness and number of cases. Click one to switch to it."],
  ["タスク（今日やること）", "Tasks (today)"], ["AI商社マンが、今日やることを大事な順に並べました。タスクの一覧（期限・担当）も、この画面の下と「タスク・進行」で見られます。", "The AI Trade Agent has ranked today's tasks by importance. The full task list (due dates, owners) is below and in “Tasks & progress”."],
  ["バイヤー・メンバー・AI商社マンからの知らせと、確認待ちをまとめています。", "Updates from buyers, members and the AI Trade Agent, plus items waiting for your check."],
  ["貴社の商品・商談・規制を覚えたAI商社マンに、何でも相談できます。", "Ask the AI Trade Agent anything — it knows your products, deals and regulations."],
  ["輸出したい商品の資料をアップロードするだけ。AIが読み取り、足りない情報だけ質問します。", "Just upload documents for the product you want to export. The AI reads them and only asks about what's missing."],
  ["AI商社マンが覚えている、この商品の情報です。書類・見積・提案はすべてここから作られます。", "What the AI Trade Agent knows about this product. Documents, quotes and proposals are all built from here."],
  ["AI商社マンが読み込んだ資料の一覧です。", "Documents the AI Trade Agent has read."],
  ["商品・会社の資料を1か所にまとめ、AI商社マンの知識にします。", "Keep product and company documents in one place as knowledge for the AI Trade Agent."],
  ["NDA・販売店契約などの契約書を、ひな形と確認の観点つきで管理します。", "Manage NDAs, distribution agreements and other contracts, with templates and review points."],
  ["用語集", "Glossary"], ["貿易の言葉と、営業資料の訳をそろえます。", "Keep trade terms and sales-deck translations consistent."],
  ["商品に合った有望な販売先国を、AIがデータでおすすめします。", "The AI recommends promising target markets for your product, backed by data."],
  ["規制・必要な書類", "Regulations & required documents"], ["送り先の国の決まりごと・関税・必要な書類を、商品に合わせて確かめます。", "Check the destination's rules, duties and required documents for your product."],
  ["AIバイヤー開拓・商談", "AI buyer sourcing & deals"], ["AIが有望なバイヤーを見つけ、提案・商談までを一気通貫で支援します。", "The AI finds promising buyers and supports you all the way from proposal to negotiation."],
  ["海外のバイヤーが返信したくなる資料を、商品に合わせてAIが作ります。", "The AI builds a deck tailored to your product that overseas buyers want to reply to."],
  ["相手ごとの進み具合と商談の記録を、1か所で追えます。", "Track progress and meeting records for each buyer in one place."],
  ["バイヤーやメンバーとのやりとりを、AI商社マンが覚えて次に生かします。", "The AI Trade Agent remembers your messages with buyers and members and uses them next time."],
  ["商談の議事録から、宿題と次の一手をAIが拾います。", "The AI picks out to-dos and next steps from meeting minutes."],
  ["物流会社やメンバーへの依頼を、1つのページで送って回答を集めます。", "Send requests to forwarders or members on one page and collect the answers."],
  ["STANDAGEに商社業務を任せた案件のやりとりです。", "Messages for cases you've handed to STANDAGE as your trading desk."],
  ["書類・出荷管理", "Documents & shipping"], ["輸出に必要な書類の作成から出荷まで、やさしくガイドします。", "A simple guide from preparing export documents to shipping."],
  ["案件で使う書類と、下書き・申請の状況です。", "Documents used in this case and the status of drafts and applications."],
  ["物流AI見積・仮押さえ・出荷の手続きです（準備中の機能を含みます）。", "AI freight quotes, space holds and shipping procedures (includes features in preparation)."],
  ["受注書・請求書・入金の管理です（準備中の機能を含みます）。", "Order confirmations, invoices and payments (includes features in preparation)."],
  ["出荷の手続きを、順番どおりに進めます。", "Go through the shipping steps in order."],
  ["誰が・いつまでに・何をするかを、チームでそろえます。", "Align the team on who does what by when."],
  ["メンバー・担当", "Members & assignments"], ["メンバーの招待・担当・権限と、ログインの安全を設定します。", "Invite members, set assignments and roles, and secure sign-in."],
  ["消したものは、ここから元に戻せます。", "Restore anything you deleted from here."],
  ["管理コンソール", "Admin console"], ["アカウント・利用状況・AIの設定を管理します。", "Manage accounts, usage and AI settings."],
  ["荷主からの見積依頼を受信・判断し、すぐに対応できます。", "Receive and assess shippers' quote requests and respond right away."],
  ["案件の仮押さえから出荷完了まで、進行状況の管理と実行を行います。", "Manage and run each case from space hold to completed shipment."],
  ["荷主への確認や依頼を、1つのページで送って回答を集めます。", "Send questions and requests to shippers on one page and collect the answers."],
  ["レート管理", "Rate management"], ["運賃表のアップロード・登録・更新を、かんたん・正確に。", "Upload, register and update rate sheets — simply and accurately."],
  ["複数の見積を比較し、選定状況とAIの評価理由、改善のヒントを確認できます。", "Compare quotes and see where you stand, why the AI scored them, and tips to improve."],
  ["レート表と見積依頼を覚えたAI物流マンに、何でも相談できます。", "Ask AI Logistics anything — it knows your rate sheets and quote requests."],
  ["トライアル管理", "Trial management"], ["管理者コンソール", "Admin console"],
  ["トライアル環境の利用状況をひと目で確認し、アカウント・AI・連携をまとめて管理できます。", "See trial usage at a glance and manage accounts, AI and integrations in one place."],
  ["タスク", "Tasks"], ["AI商社マン", "AI Trade Agent"], ["商品情報を確かめる", "Check product info"], ["販売先国を選ぶ", "Choose target markets"], ["営業資料をつくる", "Create a sales deck"],
  ["バイヤーを探す", "Find buyers"], ["案件を進める", "Move cases forward"], ["案件一覧へ", "To case list"], ["見積の依頼に答える", "Answer quote requests"], ["見積受信箱へ", "To quote inbox"],
  /* ── あいさつ・ホームの部品（荷主） ── */
  ["おはようございます！", "Good morning!"], ["こんにちは！", "Hello!"], ["こんばんは！", "Good evening!"],
  ["まずやること", "Start here"], ["海外展開を始める 3つのステップ", "3 steps to start selling overseas"], ["商品を登録", "Register a product"], ["輸出する商品を追加", "Add the product to export"],
  ["市場・規制を調査", "Research markets & rules"], ["国のニーズや規制を調査", "Research demand and regulations by country"], ["バイヤーに提案", "Pitch to buyers"], ["候補を選んで商談開始", "Pick candidates and start talks"],
  ["完了", "Done"], ["次はこれ", "Do this next"], ["これから", "Upcoming"], ["対応待ち", "Waiting for you"], ["押すと、その分だけを開きます", "Click to open just those"], ["対応待ちはありません", "Nothing waiting for you"],
  ["今日やること（AIが大事な順に並べた一覧）", "Today's tasks (ranked by the AI)"], ["商談を記録すると、ここに流れが出ます", "Record a meeting to see the flow here"],
  ["新着", "New"], ["既読", "Read"], ["新しい動きはまだありません", "No new activity yet"],
  ["市場・ニーズを調べる", "Research markets & demand"], ["規制・認証を確認", "Check regulations & certifications"], ["見積・コストを相談", "Ask about quotes & costs"],
  ["詳しい数字と分析・はじめの設定の6項目（これまでのダッシュボード。左のメニューの「分析・レポート」と同じ内容）", "Detailed numbers & analysis, plus the 6 setup items (the previous dashboard — same as “Analytics & reports” in the menu)"],
  ["これまでのダッシュボード（数字と分析・はじめの設定）", "Previous dashboard (numbers, analysis & setup)"], ["お気に入り", "Favorites"], ["最終やりとり", "Last message"], ["新しいバイヤーを探す", "Find new buyers"],
  ["AI商社マンの成長", "AI Trade Agent growth"], ["目標を入れる", "Set a goal"], ["目標と道筋", "Goal & roadmap"], ["今の版を開く", "Open the current version"],
  ["続きを読む", "Read more"], ["たたむ", "Collapse"], ["相手", "Buyer"], ["貴社", "You"], ["下書きを見る", "View draft"], ["AIの返信の下書きがあります", "There's an AI reply draft"],
  ["相手の最新メッセージ順", "Buyer's latest message"], ["最終やりとり順", "Last message"], ["ステータス順", "Status"], ["国順", "Country"],
  /* ── 今日やること ── */
  ["30日以上動きのない相手", "Buyers with no activity for 30+ days"], ["やりとり中の相手", "Buyers in conversation"], ["停滞中の案件", "Stalled cases"], ["失注した相手", "Lost buyers"], ["失注の振り返り", "Lost-deal review"],
  ["失注の振り返りを始める", "Start the lost-deal review"], ["学んで次に活かす", "Learn and apply next time"], ["続けるか・失注にするかを決める", "Decide whether to continue or mark as lost"],
  ["売る国と決まりを確かめる", "Confirm markets and rules"], ["条件をそろえる", "Line up the terms"], ["相手を探して連絡", "Find and contact buyers"], ["出荷・実行", "Shipping & execution"], ["見積・交渉", "Quotes & negotiation"],
  ["書類と出荷の手配", "Documents & shipping arrangements"], ["輸出する商品を用意", "Prepare the product to export"], ["輸出のステップ", "Export steps"], ["（今どこ？）押すと、その画面へ", "(Where am I?) Click to go to that screen"],
  ["対応する", "Handle"], ["Webでは確認できませんでした。", "Could not be confirmed on the web."],
  /* ── AI商社マンに相談 ── */
  ["AIがあなたの代わりにできること", "What the AI can do for you"], ["について、AIに何でも聞いてみましょう！", " — ask the AI anything!"], ["バイヤーを提案", "Suggest buyers"], ["出荷・実行をサポート", "Support shipping & execution"],
  ["必要な書類の判定と下書きを作ります", "Works out the required documents and drafts them"], ["最適な価格を相談する", "Discuss the best price"], ["有望なバイヤーを探す", "Find promising buyers"],
  ["条件に合う輸入バイヤーを探し、候補を出します", "Finds importers that fit your criteria and lists candidates"], ["現地の規制・認証を調べる", "Research local regulations & certifications"],
  ["需要・競合・現地の規制・認証を調べます", "Researches demand, competitors, local regulations and certifications"], ["見積・交渉を支援", "Support quotes & negotiation"], ["返信案と見積、条件の整理を手伝います", "Helps with reply drafts, quotes and terms"],
  ["輸出の進め方", "How to export"], ["輸出の進め方を相談する", "Ask how to proceed with exports"], ["調査からバイヤー提案、見積・交渉の準備まで、輸出の実務をサポートします", "Supports export work from research to buyer proposals and quote/negotiation prep"],
  ["よくある質問（例）", "Common questions (examples)"], ["対象の商品・案件", "Product / case in scope"], ["（いまの相談の前提）", "(context for this chat)"], ["貴社のいまの準備：", "Your current readiness:"],
  ["AI商社マンは、この準備の状況と登録した商品・国・商談を踏まえて答えます。答えのあとにも、いまの準備を添えます。", "The AI Trade Agent answers based on this readiness and your registered products, markets and deals, and adds your current readiness after each answer."],
  ["やり取りから、商品・市場・バイヤーの理解が深まり、提案の精度が高まります。", "Every exchange deepens its understanding of your product, markets and buyers, so its proposals get sharper."],
  ["成長の内訳と育て方を見る", "See the growth breakdown and how to grow it"], ["次をひらく", "Open next"], ["1つ", "1"], ["5つ", "5"], ["（候補）", "(candidate)"],
  ["AI商社マンの記憶", "AI Trade Agent's memory"], ["クリックで開く", "Click to open"],
  ["まだ記録はありません。質問・資料の取り込み・商談記録のたびに、ここに積み上がります。", "No records yet. They build up here with every question, imported document and meeting record."],
  ["回答に「👎 ちがう・直したい」と押して正しい内容を書くと、次から優先して使います。", "Press “👎 Wrong / fix” on an answer and write the correct content — it will be used first from then on."],
  /* ── AIバイヤー開拓 ── */
  ["AI商社マンが、商談になりやすい相手を探して文面まで提案します", "The AI Trade Agent finds buyers likely to engage and drafts the message too"], ["すべてのやりとりを見る", "See all messages"],
  ["まだリストを作っていません。国・業態・件数を決めると、AIがリストと最初の文面を作ります。", "No list yet. Choose countries, business types and how many, and the AI builds a list and the first message."],
  ["やりとりを開く", "Open messages"], ["やり取り中のバイヤー", "Buyers in conversation"], ["商談が進んでいる相手", "Buyers moving forward"], ["商談パイプライン", "Deal pipeline"], ["商談中〜契約交渉", "In talks to contract negotiation"],
  ["条件を決めてリストを作る", "Set criteria and build a list"], ["最後の動き", "Last activity"], ["最近のアクティビティ", "Recent activity"], ["状況の理由（AI）", "Why this status (AI)"],
  ["相手から1回以上の返信", "Replied at least once"], ["返信が届いた相手", "Buyers who replied"], ["連絡した相手", "Buyers contacted"], ["開拓・商談のサマリー", "Sourcing & deal summary"],
  ["送る前に必ず文面を確認・承認できます（勝手には送りません）。", "You always review and approve the message before it's sent (nothing is sent without you)."],
  ["見積・契約の段階", "Quote / contract stage"], ["（この画面の「やり取り中のBuyer」と同じ数え方）", "(counted the same way as “Buyers in conversation” on this screen)"], ["（押すと、その状況の相手だけを下の一覧に出します）", "(click to show only buyers in that status below)"],
  /* ── 外国語 営業資料 ── */
  ["AIが確認するポイント", "What the AI checks"], ["AIが資料を生成", "AI generates the deck"], ["AIバイヤー開拓へ", "To AI buyer sourcing"], ["あると、より魅力が伝わる", "Makes the deck more compelling"],
  ["この資料を使ってバイヤーへ提案", "Pitch buyers with this deck"], ["まだ作っていません。登録データから表紙の見本を出しています", "Not created yet. Showing a sample cover from your registered data"], ["まだ営業資料を作っていません", "No sales deck yet"],
  ["より良い資料にするためのポイント", "Tips for a better deck"], ["バイヤーへの提案に進む", "Go on to pitch buyers"], ["下の「営業資料を作る」で言語と相手の国を選ぶと、ここに完成版が出ます。", "Choose the language and the buyer's country under “Create sales deck” below and the finished deck appears here."],
  ["下のオレンジ色の「未入力」の項目を入力すると、営業資料を作れるようになります。", "Fill in the orange “Not entered” items below to be able to create the sales deck."], ["不足している情報をかんたんに補完", "Fill in missing information easily"],
  ["不足項目の下書きを AI が作ります", "The AI drafts the missing items"], ["会社情報・商品写真を Web サイトから", "Company info and product photos from your website"], ["作ったあと", "After creating"], ["価格・MOQ は送る前に最終確認", "Double-check price and MOQ before sending"],
  ["公式サイトから取り込み", "Import from official site"], ["写真は商品の特徴がわかる高品質な画像を3枚以上入れましょう", "Add at least 3 high-quality photos that show the product's features"], ["入力する", "Enter"], ["入力済み", "Entered"],
  ["商品の写真", "Product photos"], ["商品の強みは、できるだけ具体的な数値や実績で書きましょう", "Describe the product's strengths with concrete numbers and track record"], ["問い合わせ先", "Contact"], ["営業資料の表紙（見本）", "Sales deck cover (sample)"],
  ["外国語の営業資料を生成する", "Generate a foreign-language sales deck"], ["完成度", "Completeness"], ["完成版をチェック", "Check the finished deck"], ["必須の項目がそろうと作れます。", "You can create it once the required items are filled."], ["必須項目", "Required items"],
  ["情報の入力状況", "Input status"], ["情報を確認", "Check info"], ["推奨項目", "Recommended items"], ["文章を整える", "Polish the text"], ["次にやること", "Next steps"], ["画像を変更", "Change image"],
  ["相手に合わせた営業メールを AI が下書きします（送る前に必ず確認・承認）。", "The AI drafts a sales email for each buyer (you always review and approve before sending)."], ["英語の商品名と紹介文", "English product name and description"],
  ["言語と相手の国を選ぶ", "Choose language and buyer's country"], ["詳しい点検（これまでの「納品レベルチェック」の表示・同じ項目）", "Detailed check (the previous “delivery level check” — same items)"],
  ["認証・規格（ISO・HACCP など）があると、海外のバイヤーに安心感を与えられます", "Certifications and standards (ISO, HACCP, etc.) reassure overseas buyers"], ["資料の基本情報", "Deck basics"], ["（資料に掲載する項目・上の数と同じ）", "(items shown in the deck — same as the count above)"],
  ["表紙・見出し・パネルなど資料全体の配色", "Colors for the whole deck (cover, headings, panels)"], ["酒・飲料", "Alcohol & beverages"], ["✓ 納品品質", "✓ Delivery quality"], ["に使われます。", " is used."],
  /* ── 商談・バイヤー ── */
  ["バイヤーの反応を記録 →", "Record the buyer's response →"], ["受注見込みに更新", "Update to likely win"], ["受注見込み（契約交渉）", "Likely win (contract negotiation)"], ["商談の状況", "Deal status"],
  ["商談を記録して、商談の進み具合を更新しましょう！", "Record meetings to keep deal progress up to date!"], ["提案の内容を登録 →", "Register the proposal →"], ["提案済み（見積提示）", "Proposed (quote sent)"], ["次のアクション", "Next action"], ["（やり取り中の相手）", "(buyers in conversation)"],
  /* ── やりとり・受信箱 ── */
  ["この画面では使えません", "Not available on this screen"], ["今の状況がすぐわかります（直接連絡のやりとり）", "See the current status at a glance (direct messages)"], ["取引先とのメールを取り込んで整理します", "Import and organize emails with business partners"],
  ["受信箱の概要", "Inbox overview"], ["対応を完了にする", "Mark as handled"], ["新しいメッセージを確認し、必要な対応を進めましょう", "Check new messages and take the needed action"], ["要対応（相手から返信）", "Needs action (buyer replied)"],
  ["返信・共有・社内連携", "Reply, share & internal handoff"], ["返信待ち", "Awaiting reply"], ["（対応を進める）", "(take action)"], ["（状況を更新）", "(update status)"], ["いま急ぎの対応はありません", "Nothing urgent right now"],
  ["商談の進捗：", "Deal progress:"], ["（AI の案・承認の依頼）", "(AI proposals & approval requests)"],
  /* ── 販売先国・規制 ── */
  ["AIが有望な販売先国を提案します", "The AI suggests promising target markets"], ["おすすめの3か国", "Top 3 recommended markets"], ["まだ分析していません。AI商社マンが、規制・市場・競合・拠点のデータから", "Not analyzed yet. From regulation, market, competitor and base data, the AI Trade Agent"],
  ["を選びます。", " will pick them."], ["提案準備", "Proposal prep"], ["規制確認", "Regulation check"], ["国選定", "Market selection"], ["営業資料", "Sales deck"], ["輸出先を変更", "Change destination"],
  ["進出希望国（まだ販売先国は確定していません）", "Desired markets (target markets not decided yet)"], ["計", "Total"], ["まだ候補がありません", "No candidates yet"], ["バイヤー数", "Buyers"],
  ["この分析は、以前の数え方のときに作られました", "This analysis was made with the previous counting method"], ["再分析する", "Re-analyze"],
  /* ── 書類・出荷・受注 ── */
  ["HS コード", "HS code"], ["「出荷を進める」の画面は開発中です（Coming Soon）。リリースまでは、いま使える機能でつなげます。", "The “Ship an order” screen is in development (Coming Soon). Until release, you can bridge with the features available now."],
  ["「受注・請求・入金」の画面は開発中です（Coming Soon）。リリースまでは、いま使える機能でつなげます。", "The “Orders, invoices & payments” screen is in development (Coming Soon). Until release, you can bridge with the features available now."],
  ["「書類をつくる」で下書きを作り、その場で直して保存・印刷できます", "Draft in “Create documents”, edit on the spot, then save or print"], ["この出荷に要る船積書類を AI が判断し、PI・CI・PL・S/I の下書きを作ります", "The AI works out the shipping documents needed and drafts the PI, CI, PL and S/I"],
  ["価格・数量・取引条件を残すと、AI商社マンの答えに使われます", "Recording price, quantity and terms lets the AI Trade Agent use them in answers"], ["価格表・寸法と販売先国の登録から、物流会社の見積受信箱に依頼が届きます", "From your price list, dimensions and target markets, a request reaches the forwarders' quote inbox"],
  ["入金の予定をタスクに入れる", "Add the expected payment to tasks"], ["出荷の段取りを AI商社マンに相談", "Plan the shipment with the AI Trade Agent"], ["出荷はこの順で進められます", "Shipping goes in this order"],
  ["受注と条件を商談の記録に残す", "Record the order and terms in the meeting log"], ["受注・請求・入金はこの順で進められます", "Orders, invoices and payments go in this order"], ["売買契約・NDA などを確かめます", "Check the sales contract, NDA, etc."],
  ["期限つきのタスクにすると、今日やることと通知に出ます", "Make it a task with a due date to see it in Today's tasks and notifications"], ["物流会社に AI見積を依頼（相見積）", "Request AI quotes from forwarders (compare quotes)"],
  ["見積書（PI）・請求書（CI）を作る", "Create a quote (PI) and invoice (CI)"], ["質問の文を入れた状態で、相談の画面を開きます（送るのはあなた）", "Opens the chat with the question filled in (you send it)"], ["送り先の決まりごと・関税・必要な書類を確かめます", "Check the destination's rules, duties and required documents"],
  ["（リリースまでの進め方）", "(how to proceed until release)"], ["船積書類", "Shipping documents"],
  /* ── 商品情報・登録 ── */
  ["この商品で輸出の次のステップへ（市場・規制の調査）", "Take this product to the next export step (market & regulation research)"], ["データの充足度", "Data completeness"], ["基本情報・強み", "Basics & strengths"], ["強み", "Strengths"], ["成分・仕様", "Ingredients & specs"],
  ["業種ごとの項目", "Industry-specific items"], ["AIヒアリング", "AI interview"], ["いま聞きたいことはありません。", "No questions right now."], ["ここにファイルを", "Drop files here"], ["ドラッグ＆ドロップ", "Drag & drop"], ["ファイルを選択", "Choose files"],
  ["商品の情報はそろっています", "Product info is complete"], ["商品の資料をアップロード", "Upload product documents"], ["商品登録", "Product registration"], ["必要な項目はそろっています", "All required items are in"], ["情報の充足度", "Info completeness"],
  ["画像", "Images"], ["規格", "Specs"], ["複数のファイルを一度に入れても、1つの商品にまとめます。", "Multiple files at once are combined into one product."], ["読み取り結果", "Extraction results"],
  /* ── ドキュメント・契約・用語集 ── */
  ["PCから書類を登録", "Add documents from your PC"], ["PDF・Excel・Word・画像など（1件 20MB まで）", "PDF, Excel, Word, images, etc. (up to 20 MB each)"], ["このページでできること", "What you can do here"], ["クラウド等の共有リンク", "Shared links (cloud, etc.)"],
  ["ファイルをアップロード", "Upload files"], ["公開範囲を管理", "Manage visibility"], ["共有・公開を設定", "Set sharing & visibility"], ["提出を依頼", "Request submission"], ["書類の登録・依頼・共有を、かんたんに行えます", "Add, request and share documents easily"], ["社内外に書類を依頼", "Request documents inside or outside the company"],
  ["AI法務に相談する", "Ask AI Legal"], ["ひな型が来ない → AI法務が起草", "No template from the buyer → AI Legal drafts one"], ["売買契約", "Sales contract"], ["契約の内容・リスク・進め方など、まずは気軽に相談", "Ask freely about contract terms, risks and next steps"],
  ["契約書をチェックに出す", "Send a contract for review"], ["契約書対応の3つの流れ", "3 ways to handle contracts"], ["届いた契約書のリスク・修正点を AI が確認", "The AI checks a received contract for risks and edits"], ["状況に合わせて、次のいずれかを選んで進めましょう", "Pick one of the following to suit your situation"],
  ["相手からドラフトがない場合", "If the buyer has no draft"], ["種別", "Type"], ["中文", "Chinese"], ["チェック結果", "Review results"], ["形式", "Format"], ["結果を見る", "See results"], ["契約書の種別", "Contract type"], ["どの契約書が良いか相談する", "Ask which contract fits"],
  ["AI法務にドラフトを起草させる", "Have AI Legal draft it"], ["どのBuyerとの契約ですか（やり取り中のみ表示）", "Which buyer is the contract with? (only buyers in conversation)"], ["直接メッセージでやり取りのある相手か、商談を記録した相手", "Buyers you message directly or have recorded meetings with"], ["相手からドラフトが上がってこない場合、", "If the buyer doesn't send a draft,"],
  /* ── タスク ── */
  ["すぐに対応が必要です", "Needs action now"], ["タスクの完了状況", "Task completion"], ["タスクの状況", "Task status"], ["タスク全体の状況", "Overall task status"], ["タスク完了率", "Completion rate"], ["予定より遅れています", "Behind schedule"],
  ["完了率", "Completion rate"], ["期限7日以内", "Due within 7 days"], ["期限が近づいています", "Due soon"], ["期限切れ（対応必須）", "Overdue (action required)"], ["総タスク数", "Total tasks"], ["7日以内の予定", "Due in the next 7 days"], ["開始が遅れている", "Late to start"],
  ["これまでの数字の表示（タスク消化率・残タスク数など）", "Previous number display (task completion rate, remaining tasks, etc.)"], ["（すべての案件）", "(all cases)"], ["（件数）", "(count)"], ["（期限の近い順・優先タスク）", "(priority tasks by due date)"],
  ["タスクを作成する", "Create tasks"], ["業務に合わせて、すぐにタスクを登録できます", "Add tasks that fit your work right away"], ["優先度", "Priority"], ["関連・根拠", "Related / basis"], ["期限切れ", "Overdue"], ["期限間近", "Due soon"], ["予定", "Planned"], ["対応中", "In progress"],
  /* ── メンバー・ゴミ箱 ── */
  ["アカウント発行時の担当者。外せません", "The contact at account issue. Cannot be removed"], ["チームの概要", "Team overview"], ["参加中のメンバー", "Active members"], ["招待中", "Invited"], ["停止中", "Suspended"], ["登録している商品", "Registered products"], ["商品一覧に登録している数", "Number in the product list"],
  ["誰が何をできる？", "Who can do what?"], ["招待・担当・役割・停止・削除。全部の案件とレートの管理", "Invite, assign, set roles, suspend, delete. Manage all cases and rates"], ["見る・投稿する・担当の仕事（割り当てられた見積・案件に対応）", "View, post, and handle assigned work (assigned quotes and cases)"],
  ["現在のアカウント：", "Current account:"], ["トライアル（共通アカウント）", "Trial (shared account)"], ["複数の方で共有する体験用のアカウントです。メンバーの招待・詳しい権限の設定は、ご契約のアカウントで使えます。", "A trial account shared by several people. Inviting members and detailed permissions are available on a paid account."],
  ["メンバーの台帳に登録している人の数", "People registered in the member list"],
  ["まとめて変えた操作も戻せます", "Bulk changes can be undone too"], ["一括変更の取り消し", "Undo bulk changes"], ["保管期間", "Retention"], ["削除から30日", "30 days after deletion"], ["削除した資料や案件を、ここで元に戻せます", "Restore deleted documents and cases here"],
  ["削除した資料・案件などが、一定期間ここに保管されます。誤って削除した場合も、期間内であれば復元できます。", "Deleted documents, cases, etc. are kept here for a while. If you deleted something by mistake, you can restore it within that period."],
  ["復元できる", "Restorable"], ["期間内なら元の一覧に戻せます", "Restore to the original list within the period"],
  /* ── 商品の一覧 ── */
  ["新しい商品を登録", "Register a new product"], ["案件を見る", "View cases"], ["販売先国", "Target markets"],
  /* ── 物流会社：ホーム ── */
  ["14日で運用を始めるステップ", "Steps to get running in 14 days"], ["1. レート登録", "1. Register rates"], ["2. 見積対応", "2. Answer quotes"], ["3. 例外対応", "3. Handle exceptions"], ["4. 選ばれる工夫", "4. Win more picks"], ["5. 仮押さえ", "5. Space holds"], ["6. 出荷手配", "6. Arrange shipping"],
  ["AIが回答できない見積依頼を確認", "Review quote requests the AI can't answer"], ["AIが自動で回答", "The AI answers automatically"], ["AIで回答できない依頼を手動で対応", "Handle requests the AI can't answer yourself"], ["AI自動回答率", "AI auto-answer rate"], ["B/L・本船・ETD/ETA を管理", "Manage B/L, vessel and ETD/ETA"],
  ["すぐに始める", "Get started"], ["まずは、この3つから対応しましょう。", "Start with these three."], ["レート表を", "Rate sheets:"], ["レーン未登録・情報不足の依頼です", "Requests with no registered lane or missing info"], ["仮押さえの依頼", "Space hold requests"], ["仮押さえの依頼を確認", "Review space hold requests"],
  ["全体の状況", "Overview"], ["出荷の手配を進める", "Arrange shipping"], ["出荷案件を", "Shipping cases:"], ["受信した見積依頼", "Quote requests received"], ["料金表を取り込む", "Import rate sheets"], ["新しい", "New"], ["案件の B/L・ETD/ETA を登録・更新", "Register / update B/L and ETD/ETA for cases"],
  ["相見積の順位・差分を確認", "Check quote ranking and gaps"], ["確認する", "Review"], ["荷主からのスペース仮押さえです", "Space holds from shippers"], ["荷主からの仮押さえを確認", "Review space holds from shippers"], ["見積から出荷までの流れ", "From quote to shipment"], ["見積を確認", "Review quotes"], ["（6ステップ）", "(6 steps)"],
  ["（見積受信箱と同じ数え方）", "(counted the same way as the quote inbox)"], ["物流会社モード／デモ物流株式会社", "Forwarder mode / Demo Logistics Co., Ltd."],
  /* ── 物流会社：見積受信箱・相見積 ── */
  ["AIが自動で見積回答します", "The AI answers quotes automatically"], ["レーン登録済みの条件はAIが自動で回答します。例外（情報不足など）のみ、あなたの確認が必要です。", "The AI answers automatically for registered lanes. Only exceptions (such as missing info) need your check."],
  ["同じ区間は集計して推奨", "Same route aggregated for recommendations"], ["AIの点", "AI score"], ["AIの点の高い順", "Highest AI score first"], ["AI推奨の理由", "Why the AI picked it"], ["ギャップ分析（1位との差）", "Gap analysis (vs. No. 1)"], ["レート管理で有効期限を更新する", "Update validity in rate management"],
  ["価格を見直す", "Review the price"], ["価格差", "Price gap"], ["対象の依頼（レーン）", "Request (lane)"], ["推奨は", "Recommended:"], ["日数差", "Transit gap"], ["早さを伝える", "Highlight speed"], ["有効期限を延ばす", "Extend validity"], ["現在の選定状況（貴社）", "Current selection status (you)"],
  ["社数", "Forwarders"], ["第", "No."], ["選ばれる工夫", "Ways to get picked"], ["順位", "Rank"], ["（相見積の数字から出した目安です）", "(estimated from the quote figures)"], ["ロサンゼルス", "Los Angeles"], ["1社のみ", "1 forwarder only"],
  ["2社以上が同じ区間・形態に登録", "2+ forwarders registered for the same route and mode"], ["レートを登録している会社", "Forwarders with registered rates"], ["推奨・見積の対象外", "Excluded from recommendations & quotes"], ["情勢メモを登録", "Add a market note"], ["情勢メモ（AI物流マンの推奨に反映）", "Market notes (used in AI Logistics recommendations)"],
  ["最新の実勢はAIエンジン接続時に、依頼ごとのWeb検索で補足します。", "When an AI engine is connected, the latest conditions are added by a web search for each request."], ["運賃レンジ", "Freight range"], ["標準2m³・希望納期なし", "Standard 2 m³ · no requested date"],
  ["港湾ストや航路の混雑など、所要日数や逼迫度に影響する情報を登録すると、該当区間の推奨（遅延見込みの加", "Register info that affects transit time or tightness (port strikes, route congestion, etc.) and recommendations for those routes (added expected delay"],
  ["本予約待ちの案件（国別）", "Cases awaiting booking (by country)"], ["AI物流マンのしくみ", "How AI Logistics works"], ["① レート表を学習", "① Learns your rate sheets"], ["② AI同士で条件確認", "② AIs confirm terms with each other"], ["③ 見積を自動提示", "③ Presents quotes automatically"],
  ["レート表から数十秒で回答", "Answers from rate sheets in seconds"], ["アップロードまたは手入力したレーン別運賃・所要日数・有効期限を使います。", "Uses lane rates, transit days and validity you uploaded or entered."], ["内訳つきの見積と交渉記録が両者に残ります。人は例外対応だけすればOK。", "Itemized quotes and the negotiation log are kept for both sides. People only handle exceptions."],
  ["危険物該当・貨物量などを荷主のAI商社マンに確認。商社マンは登録済みデータから即答します。", "Checks dangerous goods, volume, etc. with the shipper's AI Trade Agent, which answers instantly from registered data."],
  ["AI物流マンが自動で回答", "AI Logistics answers automatically"], ["AI物流マンが見積に自動対応", "AI Logistics handles quotes automatically"], ["デモ物流株式会社", "Demo Logistics Co., Ltd."],
  /* ── 物流会社：レート ── */
  ["AI物流マンが、このレートを使って見積依頼に", "AI Logistics uses these rates to answer quote requests"], ["自動で回答", " automatically"], ["します。", "."], ["30日以内に期限", "Expiring within 30 days"], ["早めに新しいレートへ", "Switch to new rates early"], ["未登録レーンの依頼", "Requests on unregistered lanes"],
  ["荷主の依頼があるのにレートが無い区間", "Routes with shipper requests but no rate"], ["見積・推奨に使われません（更新が必要）", "Not used in quotes or recommendations (update needed)"], ["見積の依頼に答える", "Answer quote requests"],
  ["Excel（.xlsx）・CSV・PDF・画像", "Excel (.xlsx), CSV, PDF, images"], ["お使いいただけます。列名が特殊な表やPDF・画像は、接続中のAIが読み取ります。", " can be used as is. Sheets with unusual column names, PDFs and images are read by the connected AI."], ["お手元の料金表をそのまま", "your own rate sheet"],
  ["ここにレート表をドラッグ＆ドロップ", "Drag & drop a rate sheet here"], ["に対応。表のヘッダー行（仕出港・仕向港・運賃…）から列を自動判別するので、", " supported. Columns are detected from the header row (origin, destination, freight…), so "], ["またはクリックして選択（.xlsx .xlsm .csv .txt .pdf .png .jpg）", "or click to choose (.xlsx .xlsm .csv .txt .pdf .png .jpg)"],
  ["を荷主に提示します（「相見積・AI推奨」画面）。", " to shippers (on the “Quote comparison & AI pick” screen)."], ["手入力で1レーン追加", "Add one lane manually"], ["推奨と相見積もり一覧", "the recommendation and quote list"], ["複数社を登録すると相見積・推奨に反映", "Register several forwarders to reflect them in quote comparison & picks"],
  ["小包", "Parcel"], ["航空", "Air"], ["/本", "/container"], ["/個(1kg)", "/piece (1 kg)"],
  ["AI物流マンはこの表から即時に見積を作ります。有効期限切れは自動で対象外になります。同じ区間・形態に複数社の登録があると、集計して推奨と相見積もり一覧を荷主に提示します。", "AI Logistics builds quotes from this table instantly. Expired rates are excluded automatically. When several forwarders register the same route and mode, it aggregates them and shows shippers the recommendation and quote list."],
  /* ── 物流会社：案件・依頼・AI相談 ── */
  ["この案件の対応はすべて完了しています", "Everything for this case is done"], ["この案件の欄を開く（B/L・担当・状態を変える）", "Open this case's panel (change B/L, owner, status)"], ["すべて対応済み", "All handled"], ["依頼の一部を完了にした案件", "Cases with some requests completed"], ["依頼をすべて完了にした案件", "Cases with all requests completed"],
  ["出荷の情報（B/L・本船・ETD/ETA）がまだ", "Shipping info (B/L, vessel, ETD/ETA) not yet entered"], ["出荷手配", "Shipping arrangements"], ["押すと、右下にその案件と次のアクションが出ます", "Click to show that case and its next action at the bottom right"], ["案件の進行フロー", "Case flow"], ["案件一覧（状況ごと）", "Cases (by status)"],
  ["次のアクションは、案件の状態（仮押さえ・B/L・対応済み）から出しています。", "The next action is based on the case status (space hold, B/L, handled)."], ["荷主の会社×案件番号", "Shipper × case no."], ["仮押さえ", "Space hold"], ["見積対応中", "Quoting"], ["出荷手配（B/L 登録済み）", "Shipping arranged (B/L registered)"],
  ["AIが整理した優先アクション", "Priority actions sorted by the AI"], ["まず依頼を作りましょう", "Start by creating a request"], ["まだ荷主が開いていない", "Not opened by the shipper yet"], ["フォローの対象", "Needs follow-up"], ["リンクを送る", "Send the link"], ["依頼の状況", "Request status"], ["依頼ページとは？", "What is a request page?"],
  ["内容の確認が必要", "Content needs checking"], ["内容を確認する", "Check content"], ["回答を受け取る", "Receive answers"], ["回答を確認", "Check answers"], ["必要事項を選ぶ", "Choose what you need"], ["提出済み（新しい回答）", "Submitted (new answer)"], ["新しい依頼を作る", "Create a new request"], ["荷主が入力中", "Shipper is filling it in"],
  ["荷主に出荷情報・商品仕様などを依頼し、ログイン不要のリンクで答えてもらう機能です。回答は受信箱と案件にまとまります。", "Ask shippers for shipping info, product specs, etc. and let them answer via a link without signing in. Answers are collected in the inbox and the case."],
  ["荷主に確かめたいこと（貨物・梱包・出荷日など）を選んでリンクを送ります。", "Choose what to confirm with the shipper (cargo, packing, ship date, etc.) and send the link."], ["荷主への依頼を作成", "Create a request to the shipper"],
  ["この相談から見積を進めます", "Move to a quote from this chat"], ["よくある質問", "Common questions"], ["レートを登録・更新する", "Register / update rates"], ["レート表", "Rate sheet"], ["今、AIが参照している条件", "Conditions the AI is using now"], ["回答は", "Answers are"],
  ["担当者が確認してから荷主へ送ります。", "reviewed by your staff before going to the shipper."], ["最新の依頼", "Latest requests"], ["次のステップ", "Next steps"], ["操作ガイド（使い方）", "How-to guide"],
  ["インドネシア向けは出せる？", "Can we quote for Indonesia?"], ["最近いつレート表をアップロードした？", "When did we last upload a rate sheet?"], ["有効期限が近いレートは？", "Which rates expire soon?"], ["未対応の依頼は？", "Which requests are unhandled?"], ["相見積があるレーンは？", "Which lanes have competing quotes?"],
  ["韓国向けのレーンはある？", "Do we have lanes to South Korea?"], ["香港向けの推奨はどの会社？", "Who is recommended for Hong Kong?"], ["を読み込んでいます。何でも聞いてください。", "is loaded. Ask me anything."],
  ["アメリカ合衆国", "United States"], ["アラブ首長国連邦", "United Arab Emirates"], ["中華人民共和国", "China"], ["大韓民国", "South Korea"], ["グアム", "Guam"], ["ホーチミン", "Ho Chi Minh City"], ["ジェベルアリ", "Jebel Ali"], ["レムチャバン", "Laem Chabang"], ["基隆", "Keelung"], ["釜山", "Busan"],
  ["インド向けは積替が一般的で、CFSの混雑による遅延に注意", "Transshipment is common for India; watch for delays from CFS congestion"], ["中東向けは紅海情勢により一部航路で遅延・保険料加算。直行便の有無と最新のサーチャージを要確認", "Some Middle East routes face delays and insurance surcharges due to the Red Sea situation. Check direct services and the latest surcharges"],
  ["東南アジア向けはシンガポール等での積替が多く、積替待ちで所要にばらつき。直行便は割高だが納期が読みやすい", "Southeast Asia often transships via Singapore, so transit varies. Direct services cost more but are more predictable"],
  ["欧州向けは紅海情勢の影響で喜望峰迂回が続き、所要が+10〜14日、緊急サーチャージが加算される可能性", "Europe routes still divert via the Cape of Good Hope due to the Red Sea situation: +10–14 days and possible emergency surcharges"],
  ["豪州向けは検疫（燻蒸・木材梱包の証明）の書類不備で滞留しやすい。書類を先行手配", "Australia shipments often get held over quarantine paperwork (fumigation / wood packing certificates). Arrange documents early"],
  ["内蔵の情勢メモ（一般的な傾向・目安。2026-09時点の整理）", "Built-in market notes (general trends; compiled as of 2026-09)"],
  /* ── 追加（ホームの提案・入力欄の例・開く） ── */
  ["目指す貿易の姿を教えてください。達成の年数・道筋・費用・期待できる売上をお出しします", "Tell us the trade you're aiming for. We'll show the years it takes, the roadmap, costs and expected sales"],
  ["🧭 目指す貿易の姿を教えてください。達成の年数・道筋・費用・期待できる売上をお出しします", "🧭 Tell us the trade you're aiming for. We'll show the years it takes, the roadmap, costs and expected sales"],
  ["STANDAGE がキックオフで最初に伺う項目と同じです（5分ほど・あとで直せます）", "The same items STANDAGE asks first at kickoff (about 5 minutes; you can change them later)"],
  ["相手・国・ID で探す", "Search by buyer, country or ID"], ["言葉で探す（例：FOB、B/L、通関）", "Search terms (e.g. FOB, B/L, customs)"],
  ["例）この相手への返信の文案を作って", "e.g. Draft a reply to this buyer"], ["例）シンガポールでの販売規制を教えて ／ この商品の見込みバイヤーを探して ／ 最適な価格を相談したい", "e.g. What are the sales regulations in Singapore? / Find prospective buyers for this product / Help me set the best price"],
  ["例）香港での販売規制を調べて ／ この商品の輸出先候補を提案して", "e.g. Research sales regulations in Hong Kong / Suggest export markets for this product"],
  ["開く", "Open"], ["＋ 開く", "+ Open"], ["AIバイヤー開拓を開く", "Open AI buyer sourcing"], ["やりとりを開く", "Open messages"], ["ホームを開く", "Open Home"], ["営業資料を開く", "Open sales deck"], ["案件を開く", "Open case"],
  ["案件・出荷管理を開く", "Open cases & shipments"], ["物流レート管理を開く", "Open freight rates"], ["見積受信箱を開く", "Open quote inbox"], ["販売先国の選定を開く", "Open target market selection"],
  ["用語集（貿易のことばの一覧）を開く", "Open the glossary (trade terms)"], ["物流会社向け・使い方ガイドを開く", "Open the forwarder how-to guide"], ["あとで", "Later"], ["今回は不要", "Not now"],
  ["AI物流マンはこの表から即時に見積を作ります。有効期限切れは自動で対象外になります。同じ区間・形態に複数社の登録があると、集計して", "AI Logistics builds quotes from this table instantly. Expired rates are excluded automatically. When several forwarders register the same route and mode, it aggregates them and shows "],
  ["検索", "Search"],
];
/* 21.90 i18n：ほかの分野（doc・adm・cty）が 21.90 で足した日本語の文言の英訳（統合の担当の依頼・11/13）。
   V90I18N_EN2＝そのままの文言（タグで区切られた1つの文字のかたまり）、V90I18N_PAT2＝数・国名などが入る文の形（英語だけ） */
window.V90I18N_EN2 = [
  /* ── doc：書類をつくる・支払条件・送る前の点検 ── */
  ["未定（要確認）", "Not decided (to check)"], ["相手と決めた条件（例：T/T 前払い・L/C）。未定なら空のまま", "Terms agreed with the buyer (e.g. T/T in advance, L/C). Leave blank if not decided"],
  ["支払条件が未定です（要確認）", "Payment terms are not decided (to check)"],
  ["相手と決めた条件（前払い〔T/T〕・L/C など）を、受注内容の「支払」に入れてください。書類には「To be agreed」（相手と決める）と出ています", "Enter the terms agreed with the buyer (T/T in advance, L/C, etc.) under “Payment” in the order details. The documents show “To be agreed” for now"],
  ["見積書", "Quotation"], ["請求書", "Invoice"], ["梱包明細", "Packing list"],
  ["支払条件は", "Payment terms are "], ["です。相手と決めていない条件は入れていません（書類には「To be agreed」＝相手と決める、と出ます）。決めたら「受注内容の編集」の「支払」に入れてください。", ". Terms not agreed with the buyer are not filled in (the documents show “To be agreed”). Once agreed, enter them under “Payment” in “Edit order details”."],
  ["支払条件は、商品情報に登録の「", "Payment terms are taken from the product info (“"], ["」から入れています（相手と違う条件に決めたら「受注内容の編集」の「支払」で直せます）。", "”). If you agree different terms with the buyer, change them under “Payment” in “Edit order details”."],
  ["支払条件は、受注内容の編集で入れた「", "Payment terms are “"], ["」です。", "”, as entered in the order details."], ["支払条件は、発注書の「", "Payment terms are “"],
  ["送る前に入れる項目があります（下の赤の行）", "Some items must be filled in before sending (red rows below)"], ["入れる", "Fill in"],
  ["税関「実行関税率表」第22類（22.06 項の見出しに「清酒」・22.08 項は蒸留酒など）", "Japan Customs tariff schedule, Chapter 22 (heading 22.06 names “seishu” (sake); 22.08 covers spirits, etc.)"],
  ["日本酒（清酒）は、関税率表では 22.06 項（見出しに「清酒」）で、22.08 項は蒸留酒などです。荷主の商品情報の HS と合わせて確かめてください", "Sake (seishu) falls under heading 22.06 of the tariff schedule (the heading names “seishu”); 22.08 covers spirits, etc. Check it against the HS in the shipper's product info"],
  ["清酒", "Sake (seishu)"], ["HS コード：要確認", "HS code: to check"], ["出どころ：", "Source: "],
  ["物流会社の画面で、まだ社名を出していない荷主を表す4文字のコード（例：DBOO・QEQ9・IMWA）です。荷主の社名は、仮押さえ（または荷主が社名を出した）までは伏せます。同じ荷主からの依頼には同じ4文字が付くので、送り直しや同じ荷主の依頼をまとめて見分けられます。英字と数字だけで意味はありません（荷主の会社名の略ではありません）。", "A 4-character code (e.g. DBOO, QEQ9, IMWA) that stands for a shipper whose name is not yet shown on forwarder screens. The shipper's name stays hidden until a space hold (or until the shipper reveals it). Requests from the same shipper get the same code, so you can spot resubmissions and group requests from one shipper. It is just letters and digits with no meaning (not an abbreviation of the company name)."],
  ["荷主（非公開）", "Shipper (undisclosed)"], ["荷主の印", "Shipper code"],
  ["アクセスコードと氏名でのログインは 11月9日 9:14 で終わります（デモ用・体験用のコードは例外で、その後もアクセスコードで使えます）。", "Sign-in with an access code and name ends on Nov 9, 9:14 (demo and trial codes are exceptions and keep working with the access code)."],
  ["販売先国・営業資料・物流会社の画面の直し", "Fixes to target markets, sales decks and forwarder screens"],
  ["販売先国：保存した分析の理由の社数を、今の数え方にそろえました。商品の一覧とメンバーの数も、画面ごとにそろえました", "Target markets: company counts in saved analysis reasons now use the current counting method. Product list and member counts now match across screens"],
  ["営業資料：照合（ファクトチェック）の返事が届かないときは自動でもう一度照合し、それでも届かないときは理由と「照合だけやり直す」を出します。創業からの年数は今日の日付で数え、登録に無いメールアドレス・仮のドメインのメールは要確認として出します", "Sales decks: if the fact-check reply doesn't arrive, it retries automatically; if it still fails, it shows why and a “Redo fact-check only” button. Years since founding are counted from today, and unregistered or placeholder-domain emails are flagged as to check"],
  ["物流会社：相見積の残り日数・件数の数え方と、画面の上の札の位置を直しました", "Forwarders: fixed the days-left and counts in quote comparison, and the position of the top label"],
  ["書類・HS コード・用語集・ガイドの直し", "Fixes to documents, HS codes, glossary and guides"],
  ["書類をつくる：支払条件が未定のときは、見積書・請求書に支払条件を自動で入れず「To be agreed（相手と決める）」と出し、画面で「未定（要確認）」と知らせます（前払いも自動では入れません）。支払条件の出どころ（商品情報・受注内容・発注書）も1行で出します", "Create documents: when payment terms aren't decided, quotations and invoices show “To be agreed” instead of filling terms automatically, and the screen shows “Not decided (to check)” (advance payment is not filled in automatically either). The source of the payment terms (product info, order details, PO) is shown in one line"],
  ["書類をつくる：売り手の住所・海外送金の振込先が未登録のときは「点検して相手に送る」を押せない形にし、何を入れれば送れるかをすぐ下に出します。請求書・梱包明細のタブでは注意の文の書類の名前をそのタブに合わせました", "Create documents: if the seller's address or bank details for overseas remittance are missing, “Check and send” is disabled and what to fill in is shown right below. On the invoice and packing list tabs, the document name in the notice now matches the tab"],
  ["HS コード：日本酒（清酒）は 2206.00 を先に出します。荷主の商品情報の HS が正です。物流会社の案件・書類をつくるで HS が違うときは「要確認」を出します", "HS code: for sake (seishu), 2206.00 is shown first. The HS in the shipper's product info is authoritative. If the HS differs in forwarder cases or document creation, “To check” is shown"],
  ["用語集：貿易のことばを探して学べる欄を、会社の訳の登録と分けて上に置きました。物流会社の画面の4文字のコード（荷主の印）の説明も足しました", "Glossary: the section for searching and learning trade terms is now separate from company translations and placed on top. Added an explanation of the 4-character shipper code on forwarder screens"],
  ["スタートガイド：各手順から、その画面へ行くボタンを出します（ログイン前は、ログインしてからその画面を開きます）。案件の一覧・やりとりで途中で切れる文は、全文を開けます", "Start guide: each step has a button to its screen (before sign-in, the screen opens after you sign in). Truncated text in the case list and messages can be expanded in full"],
  ["版と build を、メニューの下の欄にいつも出します", "The version and build are always shown below the menu"], ["版", "Version"],
  /* ── doc：刷新版（スタートガイド・用語集・全文） ── */
  ["商品を登録する", "Register a product"], ["AI商社マンに聞く", "Ask the AI Trade Agent"],
  ["AI商社マンは、この5つの順で使います。各手順のボタンを押すとログインの欄へ進み、ログインすると、その画面が開きます。", "Use the AI Trade Agent in these 5 steps. Each step's button takes you to sign-in, and the screen opens after you sign in."],
  ["貿易のことばを、探して学べるページです。下の「会社の訳を登録する」では、営業資料・メールの訳をそろえられます。", "Search and learn trade terms here. Under “Register company translations” below, you can keep translations for sales decks and emails consistent."],
  ["画面の点線の言葉は、押すか、マウスを乗せると説明が出ます。ここでは、言葉で探して読めます。", "Click or hover over dotted words on screen to see an explanation. Here you can search terms and read them."],
  ["くわしく", "More"], ["見つかりませんでした。英字・カタカナなど、別の書き方でも探せます。わからないときは「AIに聞く」で聞けます。", "Nothing found. Try another spelling (Latin letters, katakana, etc.). If you're unsure, use “Ask AI”."],
  ["会社の訳を登録する（営業資料・メールの訳をそろえる）", "Register company translations (keep sales-deck and email wording consistent)"],
  ["ここから下は、学ぶ欄ではなく、会社で決めた訳（商品名・ブランド名・決まった言い方）を登録する欄です。登録した訳は、営業資料・メールの点検で使います。", "Below is not for learning: it's where you register your company's set translations (product names, brand names, set phrases). They are used when checking sales decks and emails."],
  ["押すと説明が出ます", "Click for an explanation"], ["押すか、マウスを乗せると説明が出ます", "Click or hover for an explanation"], ["全文を表示", "Show full text"],
  /* ── adm：管理コンソール ── */
  ["会社名", "Company name"], ["ご担当者名", "Contact name"], ["用途", "Purpose"], ["問い", "Question"], ["答え", "Answer"], ["出典", "Source"], ["分野・語", "Field / term"],
  ["氏名", "Name"], ["メールアドレス", "Email"], ["部署・役職", "Department / title"], ["台帳の行", "Ledger rows"], ["種類", "kinds"], ["・同じコードの重複", " · duplicate codes"], ["・端末の控えの名前", " · device-copy names"],
  ["件数は台帳の行（記録）の数です。同じアクセスコードの行や、端末の控えの名前（k＋16桁）の行は、同じアカウントの記録が重なっている可能性があります（消さずに印を付けています）", "Counts are ledger rows (records). Rows with the same access code, or with a device-copy name (k + 16 characters), may be overlapping records of one account (marked, not deleted)"],
  ["同じアクセスコードの行が複数あります（同じアカウントの記録が重なっています）。消さずに印だけ付けています", "Several rows share the same access code (overlapping records of one account). Marked only, not deleted"],
  ["端末の控えの名前", "Device-copy name"], ["この「コード」は、端末の保存でアクセスコードを伏せた名前（k＋16桁）です。", "This “code” is the masked name used in device storage in place of the access code (k + 16 characters)."],
  ["本当のアクセスコードではありません（同じブラウザでお客様のコードでログインした後に管理者でログインすると、台帳の控えに残ります）。消さずに印だけ付けています", "It is not a real access code (it stays in the ledger copy when an admin signs in on the same browser after a customer code). Marked only, not deleted"],
  ["会社名と担当者が同じで、コードが違う行です。同じお客様の重複か、意図した別のアカウントかを確かめてください", "Same company and contact but a different code. Check whether it's a duplicate of the same customer or an intended separate account"],
  ["Web検索", "Web search"], ["Web検索を許可しているか（アカウントの状態ではありません。状態は「状態」の列）", "Whether web search is allowed (not the account status — see the “Status” column)"], ["許可しない", "Not allowed"],
  ["Web検索を許可していません（アカウントは止まっていません）", "Web search not allowed (the account is not suspended)"],
  ["同じ方（メールアドレス、無ければ氏名が同じ）の行が複数あります。実人数では1名と数えています（消さずに印だけ付けています）", "Several rows for the same person (same email, or same name if no email). Counted as 1 person (marked only, not deleted)"],
  ["全社版のアカウント：", "Company-wide accounts: "], ["（台帳の行の数・物流会社を除く・無効と期限切れを含む）", "(ledger rows; excluding forwarders; including disabled and expired)"], ["匿名ダイジェスト：", "Anonymous digest: "],
  ["（匿名の集計を送ってきたアカウントの数・120日更新が無いものは整理）", "(accounts that sent anonymous totals; those not updated for 120 days are cleaned up)"],
  ["匿名ダイジェストの週次更新（同期サーバー）：", "Weekly anonymous digest update (sync server): "], ["サーバーの直接取込（DIGITRAD_TOKEN）は使っていません・管理者PCの週次ジョブで取込", "Direct server import (DIGITRAD_TOKEN) is not used; imported by the weekly job on the admin PC"],
  ["期間の開始日", "Start date"], ["期間の終了日", "End date"], ["いま表示している期間の開始日（変えて「期間指定」で切り替え）", "Start of the period shown (change it and use “Set period”)"], ["いま表示している期間の終了日", "End of the period shown"],
  ["※ 行ごと・日ごとの金額は1円未満を四捨五入して出しています。足し合わせると、上の合計（丸める前の額から計算）と1〜数円ずれることがあります。", "* Amounts per row and per day are rounded to the nearest yen. Their sum may differ by a few yen from the total above (calculated before rounding)."],
  ["画面", "Screen"], ["お客様の画面（デモ）", "Customer screen (demo)"], ["操作の記録（台帳の変更履歴・利用状況）", "Activity log (ledger change history & usage)"], ["管理", "Admin"],
  ["管理者への知らせは、管理コンソールの「今日の作業」に出ます（期限が近い・期限切れのアカウント、商社デスクの依頼）", "Admin notices appear under “Today's work” in the admin console (accounts expiring or expired, trading desk requests)"],
  ["今日の作業を見る", "See today's work"], ["CS横断の受信箱を開く", "Open the cross-CS inbox"], ["元に戻しています…", "Restoring…"], ["削除した知識", "Deleted knowledge"],
  ["ふだん使わない区画をたたんでいます。数は、このタブでたたんでいる区画の数です", "Rarely used sections are collapsed. The number is how many sections are collapsed on this tab"],
  ["まだ変更履歴がありません（サーバーの台帳を取り込むと出ます）。", "No change history yet (it appears after importing the server ledger)."], ["日時", "Date & time"], ["端末・版", "Device / version"], ["変更", "Change"],
  ["0〜100,000（同期サーバーが受け付ける範囲）", "0–100,000 (range accepted by the sync server)"],
  ["件数は台帳の行（記録）の数です。同じアクセスコードの行などは、アカウント一覧に印を付けています", "Counts are ledger rows (records). Rows with the same access code, etc. are marked in the account list"],
  ["表は横に動かせます（", "The table scrolls sideways ("], ["表の下のつまみ・Shift＋ホイール・トラックパッドの横スワイプ）。右端の「無効化」「詳細」はいつも見えています。", "scrollbar below the table, Shift + wheel, or a horizontal trackpad swipe). “Disable” and “Details” on the right are always visible."],
  ["指で横にずらす）。「無効化」「詳細」は右端にあります。", "swipe sideways). “Disable” and “Details” are at the right end."],
  /* ── cty：販売先国・国別詳細・商品情報 ── */
  ["いまのプラン（ライト）では、AI の Web 検索の調査は使えません。内蔵データ（規制DB・通関統計・拠点）の骨組みだけを表示しています", "Web-search research by the AI isn't available on the current plan (Lite). Showing only the outline from built-in data (regulation DB, customs statistics, bases)"],
  ["AI エンジンが未接続のため、Web 検索の調査を始められません（管理者が AI エンジンを接続すると調べられます）。いまは内蔵データ（規制DB・通関統計・拠点）の骨組みだけを表示しています", "No AI engine is connected, so web-search research can't start (it works once an admin connects an AI engine). Showing only the outline from built-in data (regulation DB, customs statistics, bases)"],
  ["上場", "Listed"], ["規模", "Size"], ["年商", "Annual sales"], ["：同上", ": same as above"],
  ["🤖 AIで詳しく調査（AI未接続）", "🤖 Research in depth with AI (AI not connected)"], ["🔄 調査をやり直す（止まっているため）", "🔄 Redo research (it stalled)"], ["🔄 AIで再調査（前回は Web検索の結果なし）", "🔄 Re-research with AI (no web results last time)"],
  ["・詳細を開いたときに自動で調査", " · researched automatically when details were opened"], ["・「AIで詳しく調査」で調査", " · researched via “Research in depth with AI”"],
  ["出典なし（Web検索が使えないエンジン、または未接続）", "No sources (engine without web search, or not connected)"],
  ["⚠ 出典なし（AI エンジンが未接続のため、Web 検索で調べていません）", "⚠ No sources (no AI engine connected, so no web search was done)"],
  ["この分析は以前の数え方で作られていたため、", "This analysis was made with the previous counting method, so "],
  ["総合点と順位を、いまの数え方（STANDAGE がおまかせ貿易で商談したバイヤーの社数）で付け直しました（AI は使っていません）。", "total scores and ranks were recalculated with the current method (number of buyers STANDAGE has met through Omakase Boeki) — no AI was used."],
  ["おすすめの3か国と理由は前回の AI 商社マンの判断のままです。いまの点数で AI に選び直してもらうときは「再分析」を押してください。", "The 3 recommended markets and reasons are still the AI Trade Agent's previous judgment. Press “Re-analyze” to have the AI choose again with the current scores."],
  ["② 分析結果と推奨3か国", "② Analysis results & 3 recommended markets"],
  ["統計の平均単価は、同じHS（", "The statistical average unit price lumps together items under the same HS ("],
  ["）の規格違いの品（等級・容量・業務用など）もまとめた目安で、1個・1本の価格とそのまま比べられません。この差だけで値下げを決めず、同じ規格の現地の店頭・EC価格で確かめてください（要確認）。", ") with different specs (grade, size, food-service, etc.), so it can't be compared directly with a per-unit or per-bottle price. Don't cut prices based on this gap alone; check local retail and e-commerce prices for the same spec (to check)."],
  ["要確認", "To check"], ["（開設準備中）", "(opening soon)"],
  ["🧪 見本（架空）の会社・商品の価格表です。数字は使い方を説明するための例で、実際の取引価格ではありません。", "🧪 A price list for a sample (fictitious) company and product. The figures are examples to explain usage, not real transaction prices."],
  ["デモ用の共通アカウントです。だれでも操作できるため、実際の価格や取引先の情報は入れないでください。", "This is a shared demo account. Anyone can use it, so don't enter real prices or business partner information."],
  ["価格の有効期限", "Price valid until"], ["価格の有効期限（切れています）", "Price valid until (expired)"], ["供給できる最大数量", "Maximum supply quantity"],
  ["おすすめ", "Recommended"], ["最もおすすめ", "Top pick"], ["おすすめの中で総合点が最も高い", "Highest total score among the recommended"], ["点数と順位を、いまの数え方で付け直しました", "Scores and ranks recalculated with the current method"],
  ["総合点に商品の特性を加えて選び、総合点の高い順に並べています", "Chosen from total score plus product traits, listed by total score"], ["（総合点の高い順に並べています）", "(listed by total score)"],
  ["データの充足度（必須の項目）", "Data completeness (required items)"], ["%は、必須の項目がそろっている割合です。", "% is the share of required items filled in."], ["任意の項目は含みません。", "Optional items are not included."],
  ["（入れると、見積・営業資料・AI商社マンの答えが詳しくなります）", "(adding them makes quotes, sales decks and the AI Trade Agent's answers more detailed)"], ["未登録の項目へ", "Go to missing items"], ["任意の項目もそろっています。", "Optional items are complete too."],
];
// 文の形（[正規表現, 英語を返す関数, 1＝国名など訳せない語が残ってよい]）。tr(語, 辞書) は辞書で語を訳す
window.V90I18N_PAT2 = (tr, cnt, plur) => [
  [/^送る前の点検（(.+)）$/, (m, d) => "Check before sending (" + tr(m[1], d) + ")"],
  [/^この(.+)は、まだ相手に送れません（入れていない必須の項目 (\d+)件）$/, (m, d) => "This " + tr(m[1], d).toLowerCase() + " can't be sent to the buyer yet (" + plur(+m[2], "1 required item", m[2] + " required items") + " missing)"],
  [/^荷主の商品情報の HS（(.+)）と違います。正は荷主の商品情報の HS です。どちらかを確かめてそろえてください$/, (m) => "Differs from the HS in the shipper's product info (" + m[1] + "). The shipper's product info is authoritative; check and align them", 1],
  [/^貿易のことばを学ぶ（(\d+)語）$/, (m) => "Learn trade terms (" + plur(+m[1], "1 term", m[1] + " terms") + ")"],
  [/^(\d+)語が見つかりました$/, (m) => plur(+m[1], "1 term", m[1] + " terms") + " found"],
  [/^📰 新機能と改善（版の履歴(?: (\d+)件)?(?:・いまの版 (.+))?）— 押すと開きます$/, (m) => "📰 What's new (" + (m[1] ? "version history: " + m[1] : "version history") + (m[2] ? " · current " + m[2] : "") + ") — click to open"],
  [/^それより前の版（(\d+)件）を開く$/, (m) => "Open earlier versions (" + m[1] + ")"],
  [/^いま(.+?)を調べています（1〜3分）。終わったら、続けて(.+?)を調べます（順番待ち）$/, (m, d) => "Researching " + tr(m[1], d) + " now (1–3 min). " + tr(m[2], d) + " will be researched next (queued)", 1],
  [/^(.+?)はいま調べています（1〜3分）。終わるまでお待ちください$/, (m, d) => tr(m[1], d) + " is being researched now (1–3 min). Please wait until it finishes", 1],
  [/^⏳ 順番待ち（(.+?)のあと）$/, (m, d) => "⏳ Queued (after " + tr(m[1], d) + ")", 1],
  [/^⏳ いま(.+?)を調べます（順番待ち）。(.*)$/, (m, d) => "⏳ " + tr(m[1], d) + " is next (queued). " + m[2], 1],
  [/^(.+?)の調査が5分以上終わっていません（通信が止まった可能性があります）。「調査をやり直す」を押すと、もう一度調べます。$/, (m, d) => "Research on " + tr(m[1], d) + " hasn't finished for over 5 minutes (the connection may have stalled). Press “Redo research” to try again.", 1],
  [/^・⚠ AI の調査に失敗しました（(.*)）。内蔵データの骨組みを表示しています$/, (m) => " · ⚠ AI research failed (" + m[1] + "). Showing the outline from built-in data", 1],
  [/^任意の項目で未登録 (\d+)件：$/, (m) => plur(+m[1], "1 optional item", m[1] + " optional items") + " not entered:"],
  [/^（台帳の行 (\d+)件・アクセスコード (\d+)種類(.*)）$/, (m) => "(" + m[1] + " ledger rows · " + m[2] + " access codes" + m[3] + ")", 1],
  [/^同じコードの行 × ?(\d+)$/, (m) => "Same-code rows × " + m[1]],
  [/^同じ会社・担当の行 × ?(\d+)$/, (m) => "Same company/contact rows × " + m[1]],
  [/^同じ方の行 × ?(\d+)$/, (m) => "Same-person rows × " + m[1]],
  [/^取得中…（(\d+)秒）$/, (m) => "Fetching… (" + m[1] + " s)"],
  [/^変更履歴を画面で見る（新しい順・(\d+)件）$/, (m) => "View change history (newest first · " + m[1] + ")"],
];
/* 貿易クラウドAI商社マン 21.90 i18n の刷新版の層（rd_v90i18n.js＝辞書 V90I18N_EN のあとに続く本体。いちばん最後に読む）
   No.384 英語に切り替えても刷新版のメニュー・見出し・パンくず・札・ホームの部品が日本語のまま
          → 刷新版の層が描く文言は今のアプリの辞書（I18N.dict）に無かった（AI 翻訳は遅く、描き直しのたびに日本語に戻る）。
            刷新版の文言の英語の辞書を今のアプリの辞書に足し（今のアプリにある語は上書きしない）、刷新版の部品の中だけは刷新版の訳を優先する。
            言語を切り替えると、今のアプリが描き直す（render / fwdRender）のに合わせて刷新版も描き直され、足した辞書で訳される。日本語に戻すと元に戻る
   No.394 物流会社の英語：メンバー概要の「— people」（数を日本語の「参加中 N」から読んでいたため英語で拾えない）／「3cos.」「/lanes」など
          → チームの概要の数は台帳（v89ctyTeamCounts）か、今のアプリの札の数（日本語・英語のどちらでも）から入れる。
            数の後ろの単位（件・社・名・本・商品・か国・日・回・点）は、英語では数に合わせて単数・複数にし、間を空ける（3 companies・1 item）。
            「/本」（コンテナ1本あたり）は「/container」。左のメニューの英語の名前は省略せず折り返す（CSS）
   日本語の画面は何も変えない（英語のときだけ働く）。中国語・スペイン語は今まで通り（辞書に無い文言は AI 翻訳） */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v90i18n) return;
  RD._v90i18n = 1;
  const PAIRS = window.V90I18N_EN || [];
  const MY = Object.create(null);
  PAIRS.forEach((p) => { if (p && p[0] && p[1] && !MY[p[0]]) MY[p[0]] = p[1]; });
  RD.v90i18nDict = MY;
  const I18 = () => { try { return typeof I18N !== "undefined" ? I18N : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const lang = () => { const o = I18(); return (o && o.lang) || "ja"; };
  const isEn = () => lang() === "en";
  const JA = /[぀-ヿ一-鿿]/;
  const plur = (n, one, many) => (Math.abs(n) === 1 ? one : many);
  const tr = (s, d) => { const k = String(s).trim(); return MY[k] || (d && d[k]) || k; };
  // 数の後ろの単位：[単数, 複数]
  const UNIT = { "件": ["item", "items"], "社": ["company", "companies"], "名": ["person", "people"], "人": ["person", "people"], "本": ["lane", "lanes"], "商品": ["product", "products"], "か国": ["country", "countries"], "日": ["day", "days"], "回": ["time", "times"], "点": ["pt", "pts"], "レーン": ["lane", "lanes"], "項目": ["item", "items"], "種類": ["kind", "kinds"] };
  const unitEn = (u, n) => { const x = UNIT[u]; return x ? plur(n, x[0], x[1]) : null; };
  const cnt = (n, u) => n + " " + unitEn(u, +String(n).replace(/,/g, ""));

  /* ── 文の形（数が入るもの）。英語だけ（中国語・スペイン語は p.zh / p.es が無い＝今まで通り） ── */
  const PAT = [
    [/^いま：(.+)$/, (m, d) => "Now: " + tr(m[1], d), 1],
    [/^物流会社モード／(.+)$/, (m, d) => "Forwarder mode / " + tr(m[1], d), 1],
    [/^次：(.+)$/, (m, d) => "Next: " + tr(m[1], d), 1],
    [/^フォローの連絡（(\d+)日 返事なし）$/, (m) => "Follow up (no reply for " + cnt(m[1], "日") + ")"],
    [/^似た商材（(.+)）の STANDAGE の記録 (\d+)案件から、道筋の目安を出します$/, (m, d) => "Estimates the roadmap from " + m[2] + " STANDAGE cases with similar products (" + tr(m[1], d) + ")", 1],
    [/^(\d[\d,]*)\s*(件|社|名|人|商品|か国|日|回|点|レーン|項目)$/, (m) => cnt(m[1], m[2])],
    [/^(\d+)\s*〜\s*(\d+)日$/, (m) => m[1] + "–" + m[2] + " days"],
    [/^[−-](\d+)日$/, (m) => "−" + cnt(m[1], "日")],
    [/^[+＋](\d+)日$/, (m) => "+" + cnt(m[1], "日")],
    [/^(\d+)日前$/, (m) => cnt(m[1], "日") + " ago"],
    [/^あと(\d+)日$/, (m) => cnt(m[1], "日") + " left"],
    [/^期限切れ（(\d+)日前に終了）$/, (m) => "Expired (" + cnt(m[1], "日") + " ago)"],
    [/^(\d+)\s*レーン（(\d+)社）$/, (m) => cnt(m[1], "レーン") + " (" + plur(+m[2], "1 forwarder", m[2] + " forwarders") + ")"],
    [/^(\d+)レーン・(\d+)社$/, (m) => cnt(m[1], "レーン") + " · " + plur(+m[2], "1 forwarder", m[2] + " forwarders")],
    [/^AI回答 (\d+)件$/, (m) => "AI answers: " + m[1]],
    [/^案件 (\d+)件$/, (m) => plur(+m[1], "1 case", m[1] + " cases")],
    [/^要確認 (\d+)件$/, (m) => m[1] + " to check"],
    [/^国ごとに数えると (\d+)件$/, (m) => "Counted per country: " + m[1]],
    [/^(仮押さえ|完了|出荷手配|見積対応中|出荷手配（B\/L 登録済み）) (\d+)$/, (m, d) => tr(m[1], d) + " " + m[2]],
    [/^すべてのタスクを見る（(\d+)件）$/, (m) => "See all tasks (" + m[1] + ")"],
    [/^完成度 (\d+)%$/, (m) => "Completeness " + m[1] + "%"],
    [/^あと (\d+) 項目で営業資料を作成できます$/, (m) => plur(+m[1], "1 more item", m[1] + " more items") + " to create the sales deck"],
    [/^返信が要るメッセージを確認（(\d+)件）$/, (m) => "Check messages needing a reply (" + m[1] + ")"],
    [/^チームのメモ（(\d+)）$/, (m) => "Team notes (" + m[1] + ")"],
    [/^自分だけのメモ（(\d+)）$/, (m) => "My notes (" + m[1] + ")"],
    [/^ほか (\d+)件（下の一覧）$/, (m) => m[1] + " more (list below)"],
    [/^相見積の比較（(\d+)社）$/, (m) => "Quote comparison (" + plur(+m[1], "1 forwarder", m[1] + " forwarders") + ")"],
    [/^位 \/ (\d+) 社$/, (m) => " of " + m[1]],
    [/^(.+?) (\d+)社$/, (m, d) => tr(m[1], d) + ": " + plur(+m[2], "1 company", m[2] + " companies")],
    [/^（有効期限内 (\d+)社）$/, (m) => "(" + m[1] + " within validity)"],
    [/^要対応 (\d+)$/, (m) => m[1] + " need action"],
    [/^指摘 (\d+)件（重大 (\d+)）$/, (m) => m[1] + " issues (" + m[2] + " major)"],
    [/^必須 (\d+)件中 (\d+)件$/, (m) => m[2] + " of " + m[1] + " required"],
    [/^次の手順：(.+)$/, (m, d) => "Next step: " + tr(m[1], d)],
    [/^次は「(.+)」$/, (m, d) => "Next: “" + tr(m[1], d) + "”"],
    [/^（はじめの設定 (.+)）$/, (m) => "(setup " + m[1] + ")"],
    [/^海外展開を始める 3つのステップ（はじめの設定 (.+)）$/, (m) => "3 steps to start selling overseas (setup " + m[1] + ")"],
    [/^🕘 これまでの相談（(\d+)件）$/, (m) => "🕘 Past chats (" + m[1] + ")"],
    [/^（(\d+)社・新しい順）$/, (m) => "(" + plur(+m[1], "1 company", m[1] + " companies") + " · newest first)"],
    [/^👁 既読 (\d+)$/, (m) => "👁 Read " + m[1]],
    [/^推奨：(.+)$/, (m, d) => "Recommended: " + tr(m[1], d), 1],
    [/^・推奨 (.+)$/, (m, d) => "· Recommended: " + m[1].split(/\s*[／/]\s*/).map((x) => { const q = x.match(/^(.+?) (\d+)社$/); return q ? tr(q[1], d) + " (" + plur(+q[2], "1 forwarder", q[2] + " forwarders") + ")" : tr(x, d); }).join(" / "), 1],
    [/^・選択 (.+)$/, (m, d) => "· Selected: " + tr(m[1], d), 1],
    [/^(.+?) → (.+)$/, (m, d) => { const a = tr(m[1], d), b = m[2].split("・").map((x) => tr(x, d)).join(" · "); return JA.test(a + b) ? null : a + " → " + b; }],
  ];
  // 3つめが 1 の形は、会社名などのデータ（訳せない固有名）が日本語のまま残ってよい
  const patOut = (p) => (m, d) => { try { const r = p[1](m, d); return r == null || (!p[2] && JA.test(r)) ? null : r; } catch (e) { return null; } };

  function install() {
    const o = I18();
    if (!o || !o.dict || !o.dict.en || !Array.isArray(o.pat)) return false;
    if (o._v90i18n) return true;
    o._v90i18n = 1;
    const d = o.dict.en;
    Object.keys(MY).forEach((k) => { if (!d[k]) d[k] = MY[k]; }); // 今のアプリにある語は上書きしない（今の画面の訳を変えない）
    // ほかの分野（doc・adm・cty）が 21.90 で足した文言（rd_v90i18n_others の V90I18N_EN2）。刷新版の部品の中でも優先はしない（足すだけ）
    (window.V90I18N_EN2 || []).forEach((p) => { if (p && p[0] && p[1] && !d[p[0]]) d[p[0]] = p[1]; });
    let P2 = [];
    try { P2 = typeof window.V90I18N_PAT2 === "function" ? window.V90I18N_PAT2(tr, cnt, plur) || [] : []; } catch (e) { P2 = []; }
    // 数の形は今のアプリの形より先に見る（「3社」を「3cos.」にしない）。英語だけ
    o.pat.unshift(...PAT.concat(P2).map((p) => ({ re: p[0], en: patOut(p) })));
    return true;
  }

  /* ── 刷新版の部品の中は刷新版の訳を優先・数の単位を自然に ── */
  const RDSEL = "#rdside, #rdbadge, [data-rdhero], .rd-x, .rd-p2, .k-card, .k-bc, .k-next, .k-tiles, .rd-home, .rd-fhome";
  function origOf(n) { const o = I18(); return (o && o.orig && o.orig.has(n)) ? o.orig.get(n) : n.nodeValue; }
  // この層で直した訳（今のアプリが描き直しのたびに辞書で訳し直しても、元の日本語が同じならこの訳を保つ）
  const FIXED = new WeakMap();
  function setTxt(n, v) {
    const o = I18(); if (!o) return;
    if (!o.orig.has(n)) o.orig.set(n, n.nodeValue); // 日本語に戻すとき（i18nRestore）に元に戻る
    const lead = (n.nodeValue.match(/^\s*/) || [""])[0], tail = (n.nodeValue.match(/\s*$/) || [""])[0];
    const nv = (lead ? lead + v.replace(/^\s+/, "") : v) + tail;
    if (n.nodeValue !== nv) n.nodeValue = nv;
    FIXED.set(n, { o: o.orig.get(n), v: nv });
  }
  function numBefore(n) {
    // 単位の直前の数（同じ親の中の直前の文字。単位だけの <small>・<span> なら、その要素の直前）
    let p = n.previousSibling;
    while (p && p.nodeType === 3 && !p.nodeValue.trim()) p = p.previousSibling;
    if (!p) { const el = n.parentElement; if (el && el.childNodes.length === 1 && /^(SMALL|SPAN|B|I|EM|STRONG)$/.test(el.nodeName)) { p = el.previousSibling; while (p && p.nodeType === 3 && !p.nodeValue.trim()) p = p.previousSibling; } }
    if (!p) return null;
    const t = p.nodeType === 3 ? p.nodeValue : (p.textContent || "");
    const m = String(t).replace(/,/g, "").match(/(-?\d+(?:\.\d+)?)\s*$/);
    return m ? +m[1] : (/[—–-]\s*$/.test(t) ? NaN : null);
  }
  const SING = { items: "item", companies: "company", people: "person", lanes: "lane", products: "product", countries: "country", days: "day", forwarders: "forwarder", times: "time", pts: "pt" };
  const RE_NOSP = /(\d)(items|companies|people|lanes|products|countries|days|forwarders|times|pts|cos\.)(?!\w)/g, RE_ONE = /(^|[^\d.,])1 (items|companies|people|lanes|products|countries|days|forwarders|times|pts)\b/g;
  function fixNode(n) {
    if (!isEn()) return; // 日本語・中国語・スペイン語の画面は何も変えない
    const o = I18(); const had = !!(o && o.orig && o.orig.has(n));
    const v0 = origOf(n); const k = String(v0 || "").trim();
    if (!k) return;
    const el = n.parentElement; if (!el) return;
    // 単位（<small>件</small>・<span>件</span>・「3 件」の「件」など）：数に合わせて単数・複数にし、前を空ける
    if (UNIT[k]) {
      const num = numBefore(n);
      if (num !== null) { setTxt(n, " " + unitEn(k, isNaN(num) ? 2 : num)); el.classList.add("v90u"); return; }
    }
    let m = k.match(/^本[／/](\d+)社$/);
    if (m) { const num = numBefore(n); setTxt(n, " " + unitEn("本", num == null || isNaN(num) ? 2 : num) + " / " + plur(+m[1], "1 forwarder", m[1] + " forwarders")); return; }
    if (k === "/本" || k === "/ 本") { setTxt(n, "/container"); return; }
    if (MY[k] && el.closest(RDSEL) && n.nodeValue.trim() !== MY[k]) { setTxt(n, MY[k]); return; }
    // 訳された文の中の「3items」「1 days」「3cos.」
    if (had || !JA.test(n.nodeValue)) {
      const v = n.nodeValue;
      const v2 = v.replace(RE_NOSP, (x, d, u) => d + " " + (u === "cos." ? "companies" : u)).replace(RE_ONE, (x, a, u) => a + "1 " + SING[u]);
      if (v2 !== v && had) n.nodeValue = v2;
    }
  }
  function fixIn(root) {
    if (!isEn() || !root) return;
    if (root.nodeType === 3) { fixNode(root); return; }
    if (root.nodeType !== 1 || /^(SCRIPT|STYLE|TEXTAREA)$/.test(root.nodeName)) return;
    if (root.closest && root.closest("[data-noi18n]")) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: (x) => { const p = x.parentElement; if (!p || /^(SCRIPT|STYLE|TEXTAREA|CODE|PRE)$/.test(p.nodeName) || p.closest("[data-noi18n],[lang]:not([lang^=ja]):not(html)")) return NodeFilter.FILTER_REJECT; return NodeFilter.FILTER_ACCEPT; } });
    const L = []; while (w.nextNode()) L.push(w.currentNode);
    L.forEach(fixNode);
  }
  RD.v90i18nFix = () => fixIn(document.body);
  // 今のアプリの見張り（訳す）のあとに動く見張り（同じ変化の知らせは、作られた順に届く）
  try {
    new MutationObserver((muts) => {
      if (!isEn()) return;
      install();
      muts.forEach((m) => m.addedNodes.forEach((n) => { try { fixIn(n); } catch (e) { /* 無視 */ } }));
    }).observe(document.body, { childList: true, subtree: true });
  } catch (e) { /* 無視 */ }

  /* ── チームの概要の数（No.394「— people」） ── */
  function teamFix(w) {
    const tiles = Array.from(w.querySelectorAll(".rd-p2 .k-tile"));
    if (!tiles.length) return;
    const lab = (x) => { const e = x.querySelector(".k-tl"); if (!e) return ""; const t = e.firstChild; return String((t && t.nodeType === 3 ? origOf(t) : e.textContent) || "").trim(); };
    const tile = (re) => tiles.find((x) => re.test(lab(x)));
    let K = null;
    try { if (typeof window.v89ctyTeamCounts === "function") K = window.v89ctyTeamCounts(); } catch (e) { K = null; }
    // 今のアプリの札（参加中 N・招待中 N・停止中 N）の数。日本語でも英語でも読む
    const txt = Array.from(w.querySelectorAll(".p")).map((x) => x.textContent || "").join(" ");
    const pick = (re) => { const m = txt.match(re); return m ? +m[1] : null; };
    const vals = {
      act: K && K.ok ? K.act + (K.meUnreg ? 1 : 0) : pick(/(?:参加中|Active)\s*(\d+)/),
      inv: K && K.ok ? K.inv : pick(/(?:招待中|Invited)\s*(\d+)/),
      stop: K && K.ok ? K.stop : pick(/(?:停止中|Suspended|Off)\s*(\d+)/),
    };
    // 台帳が無い（数えられない）ときでも、今のアプリの札の数が読めればそれを出す
    if (K && K.ok && vals.act === 0) { const a = pick(/(?:参加中|Active)\s*(\d+)/); if (a) vals.act = a; }
    const setN = (el, n) => {
      if (!el || n == null || isNaN(n)) return;
      const tn = el.querySelector(".k-tn"); if (!tn) return;
      const first = tn.firstChild;
      if (first && first.nodeType === 3 && /^\s*[—–-]?\s*\d*\s*$/.test(first.nodeValue)) {
        if (first.nodeValue.trim() === "—") { first.nodeValue = String(n); tn.dataset.v90n = String(n); }
      } else if (!first || first.nodeType !== 3) { tn.insertBefore(document.createTextNode(String(n)), first || null); tn.dataset.v90n = String(n); }
      const sm = tn.querySelector("small"); if (sm && sm.firstChild) fixNode(sm.firstChild);
    };
    setN(tile(/^参加中のメンバー$/), vals.act);
    setN(tile(/^招待中$/), vals.inv);
    setN(tile(/^停止中$/), vals.stop);
  }
  const chain = (k, f) => { const p0 = RD.page && RD.page[k]; if (!RD.page) return; RD.page[k] = function (w, kk) { const r = p0 ? p0.apply(this, arguments) : undefined; try { f(w, kk); } catch (e) { console.error("[rd] v90i18n " + k, e); } return r; }; };
  chain("team", teamFix);
  chain("fteam", teamFix);
  RD.v90teamFix = teamFix;

  try {
    if (typeof i18nText === "function") { // eslint-disable-line no-undef
      const t0 = i18nText; // eslint-disable-line no-undef
      i18nText = function (n) { const r = t0.apply(this, arguments); try { const f = FIXED.get(n); if (f && isEn()) { if (f.o === origOf(n)) { if (n.nodeValue !== f.v) n.nodeValue = f.v; } else FIXED.delete(n); } } catch (e) { /* 無視 */ } return r; }; // eslint-disable-line no-global-assign, no-undef
    }
  } catch (e) { /* 無視 */ }
  /* ── 言語の切り替え ── */
  try {
    if (typeof i18nSet === "function") { // eslint-disable-line no-undef
      const s0 = i18nSet; // eslint-disable-line no-undef
      i18nSet = function () { install(); const r = s0.apply(this, arguments); try { if (isEn()) { if (typeof RD.buildSide === "function") RD.buildSide(); fixIn(document.body); } } catch (e) { /* 無視 */ } return r; }; // eslint-disable-line no-global-assign, no-undef
    }
  } catch (e) { /* 無視 */ }
  install();
  if (isEn()) { try { const o = I18(); if (o && typeof i18nApply === "function") i18nApply(document.body); fixIn(document.body); } catch (e) { /* 無視 */ } } // eslint-disable-line no-undef
})();

} catch (e) { try { console.error("[rd] rd_v90i18n.js", e); } catch (x) { } }
/* ==== rd_v91smp.js ==== */
try {
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

} catch (e) { try { console.error("[rd] rd_v91smp.js", e); } catch (x) { } }
/* ==== rd_v92prod.js ==== */
try {
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

} catch (e) { try { console.error("[rd] rd_v92prod.js", e); } catch (x) { } }
/* ==== rd_v92reg.js ==== */
try {
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

} catch (e) { try { console.error("[rd] rd_v92reg.js", e); } catch (x) { } }
/* ==== rd_v92goal.js ==== */
try {
/* 貿易クラウドAI商社マン 21.92 goal の刷新版の層（rd_v91smp.js のあとに読む）
   R-11（レポート第5回「改善 No.11 ホームのバッジ」の残り・No.474 と一緒に）
     左のメニュー「案件」の札（要対応の数）は、アカウントの全商品（見本の会社＝酒造などの業種サンプルを含む）の案件から数えていた（rd_case.js の sideBadge＝allCases）。
     自社の商品に切り替えても、酒造の見本の「要対応 4」が出続けた
     → 札の数を「いま表示している会社の範囲」にする：御社の商品を表示しているときは御社の商品（見本を除く）の案件だけ、
       見本の会社を表示しているときは、その見本の会社の案件だけ。見本の無いアカウントは今まで通り（全部が御社の商品）。
       札の title は 21.90 ana（sideLabel）が書くので触らない（2つの層が title を書き合わない）
   No.466（初期状態の商品数）：メンバー・担当の「登録している商品 N商品」に、内訳（見本＝デモの初期状態の商品 n・御社が登録した商品 m）を足す。
     数そのもの（商品一覧の数）は変えない＝ほかの画面と同じ数
   ボタンは書かない。onclick= と style= も書かない */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v92goal) return;
  RD._v92goal = 1;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const chain = (k, f) => { const p0 = RD.page[k]; RD.page[k] = (w, kk) => { if (p0) p0(w, kk); try { f(w, kk); } catch (e) { console.error("[rd] v92goal " + k, e); } }; };
  const isSmp = (t) => !!t && (t.src === "sample" || t.src === "sample2" || !!t.v91smp);
  const trial = () => { try { return typeof SES !== "undefined" && !!SES && SES.t === "trial"; } catch (e) { return false; } }; // eslint-disable-line no-undef
  const tens = () => { try { return (typeof TENS !== "undefined" && Array.isArray(TENS)) ? TENS : []; } catch (e) { return []; } }; // eslint-disable-line no-undef
  const ten = () => { try { return typeof TEN !== "undefined" ? TEN : null; } catch (e) { return null; } }; // eslint-disable-line no-undef

  /* ── R-11 札は「いま表示している会社の範囲」の要対応 ── */
  function scopeTodo() {
    if (!RD.allCases) return null;
    let L = []; try { L = RD.allCases(); } catch (e) { return null; }
    const t0 = ten(); const smp = isSmp(t0);
    const inScope = (c) => smp ? (!!c.t && isSmp(c.t) && String(c.t.co || "") === String((t0 && t0.co) || "")) : !isSmp(c.t);
    const all = L.filter((c) => c.todo).length, n = L.filter((c) => c.todo && inScope(c)).length;
    return { n, all, other: all - n, smp };
  }
  let busy = false;
  function fixBadge() {
    if (busy || !trial()) return;
    const s = $('#rdside .rd-main[data-rdk="dash:home"] .rd-bdg'); if (!s) return;
    if (!tens().some(isSmp)) { if (s.hidden && s.dataset.v92) { busy = true; s.hidden = false; delete s.dataset.v92; busy = false; } return; } // 見本の無いアカウント＝今まで通り
    const r = scopeTodo(); if (!r) return;
    busy = true;
    try {
      s.dataset.v92 = "1"; s.dataset.v92other = String(r.other);
      if (!r.n) { if (!s.hidden) s.hidden = true; }
      else { if (s.hidden) s.hidden = false; if (s.textContent !== String(r.n)) s.textContent = String(r.n); }
    } finally { busy = false; }
  }
  RD.v92goalBadge = { fix: fixBadge, scope: scopeTodo };
  const watch = () => { const sd = document.getElementById("rdside"); if (!sd) { setTimeout(watch, 500); return; }
    try { new MutationObserver(() => { if (!busy) fixBadge(); }).observe(sd, { childList: true, subtree: true, characterData: true }); } catch (e) { /* 無視 */ } fixBadge(); };
  watch();
  ["dash:home", "dash:prod", "today", "ai", "msg", "rm", "dash:rep"].forEach((k) => chain(k, () => setTimeout(fixBadge, 0)));

  /* ── No.466 登録している商品の内訳 ── */
  chain("team", (w) => {
    const tl = $$(".rd-p2 .k-tile", w);
    const tile = tl.find((x) => /^登録している商品$/.test((($(".k-tl", x) || {}).textContent || "").trim()));
    if (!tile) return;
    const T = tens(); const smp = T.filter(isSmp).length, own = T.length - smp;
    if (!smp) return;
    let s = $(".k-v92mix", tile);
    // 数（.k-tn）と同じ文字の列に入れる（タイルの横に並べると数が「6…」と切れる）
    const col = ($(".k-ts", tile) || $(".k-tn", tile) || {}).parentElement || tile;
    if (!s) { s = document.createElement("small"); s.className = "k-v92mix"; s.dataset.kqn = "1"; }
    if (s.parentElement !== col) col.appendChild(s);
    const t = `内訳：見本（デモの初期状態）${smp}・御社が登録 ${own}`;
    if (s.textContent !== t) s.textContent = t;
  });
})();

} catch (e) { try { console.error("[rd] rd_v92goal.js", e); } catch (x) { } }
/* ==== rd_v92misc.js ==== */
try {
/* 貿易クラウドAI商社マン 21.92 misc の刷新版の層（rd_v92misc.js）
   R-9（ペルソナ評価 第5回「改善 No.9 用語集」の残り）：用語集が「すべての機能＞資産（ナレッジ）」の下にしか無く、初めての人が見つけにくい。
     → 「困ったとき」（ヘルプセンター）の先頭の段に「用語集（貿易のことば）」の札を足し、左のメニューの「はじめての方へ（スタートガイド）」の下にも入口を足す。
       点線の言葉の説明の窓（「？」）と見出しの一言には、もう「用語集」への入口がある（rd_uat.js の data-kgloss）。今の場所（資産（ナレッジ））からは消さない。
       用語集は荷主の画面だけ（物流会社・管理者には出さない）。左のメニューのよく使う5つ（案件・商品・タスク・やりとり・AI商社マン）は変えない（11/12 の決め）
   No.471 の知らせ（アプリの層 logic_v2192misc の #v92miscTr）は、刷新版では左のメニューの右に出す（アプリの層で位置を決める・ここは見た目だけ） */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v92misc) return;
  RD._v92misc = 1;
  const I = typeof RD.I === "function" ? RD.I : () => "";
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const G = (n) => { try { switch (n) { case "SES": return typeof SES !== "undefined" ? SES : undefined; } } catch (e) { /* 前 */ } return undefined; }; // eslint-disable-line no-undef
  const shipper = () => { const S = G("SES"); if (!S || document.body.classList.contains("locked")) return false; if (S.t === "admin") return false; try { if (typeof RD.isFwd === "function" && RD.isFwd()) return false; } catch (e) { /* 無視 */ } return S.role !== "fwd"; };
  const SUB = "FOB・HS コードなど、貿易の言葉の意味";
  const CARD = "FOB・HS コード・インコタームズなど、貿易の言葉の意味と例。点線の言葉を押しても説明が出ます";
  // 英訳（今のアプリの辞書に足す・ある語は上書きしない）
  try {
    if (typeof I18N !== "undefined" && I18N && I18N.dict) { // eslint-disable-line no-undef
      [[SUB, "Meanings of FOB, HS codes and other trade terms", "FOB、HS 编码等贸易用语的含义", "Significado de FOB, códigos HS y otros términos"],
        [CARD, "Meanings and examples of FOB, HS codes, Incoterms and other trade terms. You can also click a dotted word for its meaning", "FOB、HS 编码、国际贸易术语等贸易用语的含义和例子。点击带虚线的词也会显示说明", "Significado y ejemplos de FOB, códigos HS, Incoterms y otros términos. También puede pulsar una palabra subrayada con puntos"]]
        .forEach((r) => { const d = I18N.dict; if (d.en && !d.en[r[0]]) d.en[r[0]] = r[1]; if (d.zh && !d.zh[r[0]]) d.zh[r[0]] = r[2]; if (d.es && !d.es[r[0]]) d.es[r[0]] = r[3]; }); // eslint-disable-line no-undef
    }
  } catch (e) { /* 無視 */ }
  const tr = (el) => { try { if (typeof i18nApply === "function" && typeof I18N !== "undefined" && I18N.lang && I18N.lang !== "ja") i18nApply(el); } catch (e) { /* 無視 */ } }; // eslint-disable-line no-undef
  const curGloss = () => { try { return typeof RD.curKey === "function" && RD.curKey() === "gloss"; } catch (e) { return false; } };

  function side() {
    const sd = document.getElementById("rdside"); if (!sd) return;
    let b = sd.querySelector(".v92misc-gl");
    if (!shipper()) { if (b) b.remove(); return; }
    const st = sd.querySelector(".rd-start"); if (!st) return;
    if (!b) {
      b = document.createElement("button"); b.type = "button"; b.className = "v92misc-gl"; b.setAttribute("data-v92miscgl", "side");
      b.innerHTML = `${I("book", 20)}<span><b>用語集（貿易のことば）</b><small>${esc(SUB)}</small></span>`;
      st.insertAdjacentElement("afterend", b); tr(b);
    } else if (b.previousElementSibling !== st) st.insertAdjacentElement("afterend", b);
    const on = curGloss() ? "true" : "false"; if (b.getAttribute("aria-current") !== on) b.setAttribute("aria-current", on);
  }
  function help() {
    document.querySelectorAll(".k-helphd").forEach((hd) => {
      let c = hd.querySelector(".v92misc-glc");
      if (!shipper()) { if (c) c.remove(); return; }
      if (c) return;
      const grid = hd.querySelector(".k-grid"); if (!grid) return;
      c = document.createElement("button"); c.type = "button"; c.className = "k-card k-row v92misc-glc"; c.setAttribute("data-v92miscgl", "help");
      c.innerHTML = `${I("book", 30)}<span class="k-rt"><b>用語集（貿易のことば）</b><small>${esc(CARD)}</small></span>${I("chevR", 18, 2.4)}`;
      grid.insertAdjacentElement("afterend", c); tr(c);
    });
  }
  document.addEventListener("click", (e) => {
    const b = e.target && e.target.closest && e.target.closest("[data-v92miscgl]"); if (!b) return;
    e.preventDefault();
    try { if (typeof closeDW === "function") closeDW(); } catch (x) { /* 無い */ } // eslint-disable-line no-undef
    try { document.body.classList.remove("navopen"); } catch (x) { /* 無視 */ }
    try { if (typeof RD.goKey === "function") RD.goKey("gloss"); } catch (x) { console.error("[rd v92misc] gloss", x); }
  });
  let t = 0;
  const run = () => { try { side(); help(); } catch (e) { console.error("[rd v92misc]", e); } };
  try { new MutationObserver(() => { if (t) return; t = setTimeout(() => { t = 0; run(); }, 60); }).observe(document.body, { childList: true, subtree: true }); } catch (e) { /* 無視 */ }
  // 見張りが1回分の描き直しを取りこぼしても、用語集の入口が消えたままにならないように（1秒ごとに確かめるだけ・変化が無ければ何もしない）
  try { setInterval(run, 1000); } catch (e) { /* 無視 */ }
  run();
})();

} catch (e) { try { console.error("[rd] rd_v92misc.js", e); } catch (x) { } }
/* ==== rd_v92admin.js ==== */
try {
/* 貿易クラウドAI商社マン 21.92 admin（刷新版の層）：管理者の上の帯の直し（xi18n-91）
   ③ 上の帯の「STANDAGE 管理者」のメニューに、荷主向けの「表示している会社：未登録・商品情報を登録してください」が出ていた
      → 管理者のときは、その区切りをたたむ（部品はそのまま残し、見せないだけ。印は .k-dd.k-v92adm。見た目は rd_v92admin.css）
   今のアプリの関数・刷新版の前の層は差し替えず、RDX.after を包む。 */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v92admin) return;
  RD._v92admin = 1;
  const isAdm = () => { try { return typeof SES !== "undefined" && !!SES && SES.t === "admin"; } catch (e) { return false; } }; // eslint-disable-line no-undef
  function mark() {
    const dd = document.querySelector(".k-dd");
    if (!dd) return;
    const on = isAdm();
    if (dd.classList.contains("k-v92adm") !== on) dd.classList.toggle("k-v92adm", on);
  }
  const old = RD.after;
  RD.after = function () { const r = old.apply(this, arguments); try { mark(); } catch (e) { /* 無視 */ } return r; };
  setInterval(() => { try { mark(); } catch (e) { /* 無視 */ } }, 1500);
  try { mark(); } catch (e) { /* まだ */ }
})();

} catch (e) { try { console.error("[rd] rd_v92admin.js", e); } catch (x) { } }
/* ==== rd_v92core.js ==== */
try {
/* 貿易クラウドAI商社マン 21.92 core（刷新版の層・rd_v92per.js のあとに読む）
   2026-11-14 の「8カテゴリー×ペルソナ評価」の、横断の課題（刷新版が足した部品）の直し。
   今のアプリの関数・刷新版の前の層は差し替えず、RDX.after を包む。数字・進み具合はアプリが持っているものだけ（本体の層 logic_v2192core の window.v92coreSteps()）。
   ① 手順の数え方を1つに（indagri-10・other-13・other-16・culture-13・health-12・medical-13・food-15）
      「はじめの設定」の6つの手順（商品を登録 → 販売先の国を選ぶ → 規制を調べる → 営業資料をつくる → バイヤーを探す → 商談を進める）を、
      画面の帯（商品情報を登録・商品情報・販売先国の選定・規制を調べる・営業資料・AIバイヤー開拓）・ホームの空の状態・タスク・スタートガイドで同じ名前・同じ数で出す。
      規制の画面のタブの帯（1〜4）は「出荷までの流れ」と名前を付けて区別する。画面の中の手順の帯には「この画面の中での進め方」と添える
   ② ホーム（案件）：はじめての人の「次にやること」を1つに。右上は「次は ○○」（ほかの画面と同じ場所・同じ言葉）、空の状態の主ボタンも同じ行き先。
      「はじめの設定 N/6」の札は空の状態の中へ（同じことを2か所で言わない）。目標の提案は小さくたたんで一覧の下へ（消さない）
   ③ スタートガイド：6つの手順に（「規制を調べる」を入れ、「営業資料」と「バイヤー」を分ける）。「困ったら AI商社マン」は番号の外に残す
   ④ 画面の題をメニュー・パンくずの名前に（daily-22）：規制を調べる／書類をつくる／AIバイヤー開拓・拠点／メンバー・権限・セキュリティ／用語集（貿易のことば）
   ⑤ 用語の「？」：二重（印の入れ子）をなくす・語の途中（関税？率・通関？にかかる日数）は語のあとへ（daily-18・health-09・medical-17）
   ⑥ 営業資料：ポイントの例（ISO・HACCP）と表紙の見本の区分（OTHER）を商材に合わせる（culture-10 の残り） */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v92core) return;
  RD._v92core = 1;
  const { $, $$, esc, I } = RD;
  const fwd = () => { try { return !!RD.isFwd(); } catch (e) { return false; } };
  const locked = () => { try { return !!RD.locked(); } catch (e) { return true; } };
  const curKey = () => { try { return RD.curKey(); } catch (e) { return ""; } };
  // 進み具合（本体の層）。続けて何度も読むので、ごく短い間だけ控える（画面を描き直したら読み直す）
  let stMemo = null, stAt = 0;
  const steps = () => {
    const now = Date.now();
    if (stMemo && now - stAt < 250) return stMemo;
    try { stMemo = typeof window.v92coreSteps === "function" ? window.v92coreSteps() : null; } catch (e) { stMemo = null; }
    stAt = now;
    return stMemo;
  };
  const cases = () => { try { return (typeof RD.allCases === "function" ? RD.allCases() : RD.dbThreads()) || []; } catch (e) { return []; } };
  const dict = (l) => { try { return (typeof I18N !== "undefined" && I18N && I18N.dict && I18N.dict[l]) || null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const setTxt = (el, v) => { if (el && el.textContent !== v) el.textContent = v; };
  // 題・ボタンの言い直し：今の文字が「前の言い方」（日本語か、その訳）のときだけ替える
  function reword(el, oldJa, newJa) {
    if (!el) return false;
    const cur = (el.textContent || "").trim();
    if (cur === newJa) return false;
    if (cur === oldJa) { el.textContent = newJa; return true; }
    for (const l of ["en", "zh", "es"]) { const d = dict(l); if (d && d[oldJa] && cur === d[oldJa] && d[newJa]) { el.textContent = d[newJa]; return true; } }
    return false;
  }
  const stepKey = (s) => (s.id === "fill" ? (s.done ? "item" : "up") : s.key);
  const firstTimer = (S) => !!(S && S.has && S.idx >= 0 && S.idx < 4 && !cases().length); // バイヤーを探す前の準備の途中・案件はまだ無い

  /* ───── ① 6つの手順の帯 ───── */
  function flowHtml(S, on, cls) {
    const cells = S.steps.map((s, i) => {
      const here = s.key === on || (on === "item" && s.id === "fill");
      const c = here ? "on" : s.done ? "done" : s.now ? "nx" : "";
      return (i ? `<span class="k92c-ar" aria-hidden="true">${I("chevR", 15, 2.6)}</span>` : "") +
        `<button type="button" class="k92c-st ${c}" data-kbc="${esc(stepKey(s))}"${here ? ' aria-current="step"' : ""}><span class="k92c-n">${s.done ? I("check", 13, 3.2) : i + 1}</span><span class="k92c-t">${esc(s.t)}</span>${s.now && !here ? '<em class="k92c-nxt">次</em>' : ""}</button>`;
    }).join("");
    const sig = on + "|" + S.steps.map((s) => (s.done ? 1 : 0) + (s.now ? "n" : "")).join("");
    return `<div role="navigation" class="rd-x k92c-flow ${cls || ""}" data-k92cflow="${esc(sig)}" aria-label="はじめの設定（6つの手順）"><span class="k92c-fl"><span>はじめの設定</span> <b>${S.done}/${S.all}</b></span><div class="k92c-sts">${cells}</div></div>`;
  }
  function putFlow(w, k, S) {
    const old = $("[data-k92cflow]", w);
    // 商品情報を登録・販売先国の選定には、いつも出す（前の4つの帯の代わり）。ほかの手順の画面は、はじめの設定が終わるまで
    const want = k === "up" || k === "cty" || (S.has && (k === "item" || k === "ops:reg" || k === "deck" || k === "db") && S.done < S.all);
    if (!want) { if (old && !old.closest(".k-card")) old.remove(); return; }
    const html = flowHtml(S, k, "");
    const sig = (html.match(/data-k92cflow="([^"]*)"/) || [])[1];
    if (old && old.getAttribute("data-k92cflow") === sig) return;
    if (old) { old.outerHTML = html; return; }
    // 前の4つの帯（商品登録・国選定・規制確認・提案準備）は、この帯に置き換える
    const sb = $(".rd-stepbar[data-rdsb]", w);
    if (sb) { sb.outerHTML = html; return; }
    const c0 = k === "cty" ? $$(".rd-p2 > section.k-card", w).find((c) => { const st = $(":scope > .k-steps", c); return st && /規制確認|提案準備/.test(st.textContent || ""); }) : null;
    if (c0) { c0.outerHTML = html; return; }
    const hero = $("[data-rdhero]", w);
    if (hero) hero.insertAdjacentHTML("afterend", html);
  }
  // 画面の中の別の帯：名前を付けて、6つの手順と混ざらないように
  function capBands(w, k) {
    const cap = (el, t) => { if (!el || el.previousElementSibling && el.previousElementSibling.classList.contains("k92c-cap")) return; el.insertAdjacentHTML("beforebegin", `<div class="k92c-cap rd-x">${esc(t)}</div>`); };
    if (/^ops:/.test(k) || k === "ship") {
      const ot = $$(".optabs", w).find((x) => !x.closest(".rd-x") && /出荷を進める/.test(x.textContent || ""));
      cap(ot, "出荷までの流れ（下の 1〜4 は、この流れの中の順番です。タブで切り替えます）");
    }
    if (k === "deck") {
      const sb = $$(".k-steps", w).find((x) => /情報を確認/.test(x.textContent || ""));
      cap(sb, "この画面の中での進め方");
      if (sb) $$(".k-step b", sb).forEach((b) => reword(b, "バイヤーに提案", "バイヤーを探す"));
    }
    if (k === "db") {
      const vs = $$(".v71steps", w).find((x) => x.getClientRects().length);
      cap(vs, "この画面の中での進め方");
    }
    if (k === "cty") {
      // 「確定した国で次へ（規制確認）」→ 手順の名前に
      $$(".rd-p2 button", w).forEach((b) => { const t = Array.from(b.childNodes).find((n) => n.nodeType === 3 && /確定した国で次へ（規制確認）/.test(n.nodeValue)); if (t) t.nodeValue = t.nodeValue.replace("（規制確認）", "（規制を調べる）"); });
    }
  }
  // 「次は」の言葉を、手順の名前に
  function nextWords(w) {
    $$(".k-next", w).forEach((b) => {
      const k = b.dataset.kbc, bb = $("b", b);
      if (k === "cty" && reword(bb, "販売先国を選ぶ", "販売先の国を選ぶ")) b.title = "次の手順：販売先の国を選ぶ";
      if (k === "dash:home" && reword(bb, "案件を進める", "商談を進める")) b.title = "次の手順：商談を進める（案件の一覧へ）";
    });
  }

  /* ───── ② ホーム（案件）：次にやることを1つに ───── */
  // 空の状態の手順は、刷新版の部品（rd_case.js）が RD.exportSteps() の先頭3つを出す → 6つの手順を全部出す
  const exp0 = RD.exportSteps;
  RD.exportSteps = function () {
    try {
      const S = steps();
      if (S && S.has) {
        const a = S.steps.map((s) => ({ t: s.t, s: "", st: s.done ? "done" : s.now ? "on" : "", go: () => RD.goKey(stepKey(s)) }));
        a.slice = function () { return a; }; // 「先頭の3つ」ではなく6つとも出す
        return a;
      }
    } catch (e) { /* 前の形で */ }
    return exp0 ? exp0.apply(this, arguments) : [];
  };
  function fixHome(w) {
    const S = steps();
    if (!S || !S.has) return;
    const box = $(".k-cl[data-kcl]", w);
    if (!box) return;
    const ft = firstTimer(S), nx = S.next;
    // 「はじめの設定」の札：行き先と言葉を6つの手順に。空の状態に同じ内容が出ているときは出さない
    const pill = $$(".k-pills .k-pill", box).find((p) => /はじめの設定/.test(p.textContent || ""));
    const empty = $(".k-clempty", box);
    if (pill) {
      if (empty && nx) { const ps = pill.parentElement; pill.remove(); if (ps && !ps.children.length) ps.remove(); }
      else if (nx) {
        const key = stepKey(nx);
        if (pill.dataset.kbc !== key) pill.dataset.kbc = key;
        const b = $("b", pill), pn = $(".k-pn", pill);
        setTxt(b, S.done + "/" + S.all);
        setTxt(pn, "次：" + nx.t + (nx.sub ? "（" + nx.sub + "）" : ""));
      }
    }
    // 空の状態：主ボタンを、いま強調している手順（次の1手）に
    if (empty && nx) {
      const p = $("p", empty);
      if (p && !p.dataset.k92c) { p.dataset.k92c = "1"; p.insertAdjacentHTML("beforeend", ` <span class="k92c-ehint">その前に、はじめの設定（6つの手順）を順に進めます：<b>${S.done}/${S.all}</b></span>`); }
      const btn = $$(".k-btn", empty).find((b) => b.dataset.kbc);
      if (btn && S.idx < 4) {
        const key = stepKey(nx), sig = key + "|" + (nx.sub || "");
        if (btn.dataset.kbc !== key || btn.dataset.k92c !== sig) {
          btn.dataset.kbc = key; btn.dataset.k92c = sig;
          btn.innerHTML = `${I("arr", 18, 2.4)}次は：${esc(nx.t)}${nx.sub ? `（${esc(nx.sub)}）` : ""}`;
          btn.title = nx.why || "";
        }
        // 何が残っているか（アプリが出している「まだの理由」）をボタンの下に
        let wy = $(".k92c-why", empty);
        if (nx.why) {
          if (!wy) { btn.insertAdjacentHTML("afterend", '<small class="k92c-why"></small>'); wy = $(".k92c-why", empty); }
          setTxt(wy, nx.why);
        } else if (wy) wy.remove();
      }
    }
    // 右上：準備の途中は「次は ○○」（ほかの画面と同じ場所・同じ形）。準備が進んだら今の「バイヤーを探す」のまま
    const hero = $("[data-rdhero]", w), cta = hero && $(".k-hcta", hero);
    if (cta) {
      if (ft && nx) {
        const key = stepKey(nx);
        if (cta.dataset.k92c !== key) {
          cta.dataset.k92c = key; cta.dataset.kbc = key;
          cta.className = "k-hcta k92c-hnext"; // 「次は」と同じ見た目（k-next の名前は付けない：パンくずの層が、ホームの k-next を外すため）
          cta.title = "次の手順：" + nx.t;
          cta.innerHTML = `<small>次は</small><b>${esc(nx.t)}</b>${I("arr", 16, 2.4)}`;
        }
      }
    }
    // 目標の提案：準備の途中は、小さくたたんで一覧の下へ（主ボタンを1つにする。提案は消さない）
    const rm = $(".k-rm88", w);
    if (rm && ft) { subProp(rm); if (box.nextElementSibling !== rm) box.after(rm); }
  }
  function subProp(rm) {
    if (rm.classList.contains("k92c-sub")) return;
    rm.classList.add("k92c-sub");
    const ul = $(".v88prop .v88ul", rm);
    if (ul && !ul.closest("details")) { const d = document.createElement("details"); d.className = "k92c-more"; d.innerHTML = "<summary>くわしく</summary>"; ul.before(d); d.appendChild(ul); }
  }

  /* ───── タスク（今日やること）：「輸出のステップ」の帯も6つの手順で ───── */
  function fixToday(w) {
    const S = steps();
    if (!S || !S.has) return;
    // 準備の途中は、目標の提案の主ボタンを控えめに（次の1手は、下の帯の「次」）
    const rm = $(".k-rm88", w);
    if (rm && firstTimer(S)) subProp(rm);
    const card = $$(".rd-p2 > section.k-card", w).find((c) => { const h = $("h2", c); return h && /輸出のステップ|はじめの設定/.test(h.textContent || ""); });
    if (!card) return;
    const ks = $(".k-steps", card);
    if (ks) {
      const h = $("h2", card);
      if (h) h.textContent = "はじめの設定（6つの手順）";
      ks.outerHTML = flowHtml(S, "", "k92c-in") + `<p class="k92c-after">商談が始まったあとは：<button type="button" class="k-link" data-kbc="deal">見積・交渉</button><span aria-hidden="true"> → </span><button type="button" class="k-link" data-kbc="ops:doc">出荷・実行（書類と出荷の手配）</button></p>`;
      return;
    }
    const old = $("[data-k92cflow]", card);
    if (old) { const html = flowHtml(S, "", "k92c-in"); const sig = (html.match(/data-k92cflow="([^"]*)"/) || [])[1]; if (old.getAttribute("data-k92cflow") !== sig) old.outerHTML = html; }
  }

  /* ───── ③ スタートガイド（荷主）：6つの手順 ───── */
  const GUIDE = [
    { id: "fill", ic: "box", b: "商品の資料（PDF・Excel・写真など）をアップロードするだけ。AIが読み取り、足りない情報だけを質問します。", go: [["up", "商品を登録する"]] },
    { id: "cty", ic: "globe", b: "AIが、商品に合った国をデータでおすすめします。3か国まで選んで「確定」します。", go: [["cty", "販売先国の選定を開く"]] },
    { id: "reg", ic: "shield", b: "選んだ国の決まりごと・関税・必要な書類を、商品に合わせて確かめます。", go: [["ops:reg", "規制を調べるを開く"]] },
    { id: "deck", ic: "slides", b: "外国語の営業資料は、AIが商品に合わせて作ります。", go: [["deck", "営業資料を開く"]] },
    { id: "buyer", ic: "send", b: "「AIバイヤー開拓」で相手を見つけて、提案します。", go: [["db", "AIバイヤー開拓を開く"]] },
    { id: "fb", ic: "brief", b: "連絡した相手ごとに「案件」ができます（ログインすると最初に開く画面）。行を押すと、次の行動・やりとり・書類が1画面で見られます。", go: [["dash:home", "案件を開く"]] },
  ];
  function fixGuide() {
    const d = document.getElementById("k-qg");
    if (!d || d.dataset.k92c) return;
    if (!/荷主向け/.test((($(".k-qgchip", d) || {}).textContent) || "")) return; // 物流会社向けの5つの手順は今のまま
    const ol = $(".k-qgst", d);
    if (!ol) return;
    d.dataset.k92c = "1"; d.dataset.v90 = "1"; // ログイン前のボタンも、ここで付ける（rd_v90doc の後付けは要らない）
    const inApp = !locked();
    const S = inApp ? steps() : null;
    const names = (window.V92CORE_STEPS || []).reduce((m, s) => { m[s.id] = s.t; return m; }, {});
    const p = $(".k-qghd p", d);
    if (p) p.textContent = inApp ? "AI商社マンは、この6つの順で使います（「はじめの設定」と同じ並びです）。各手順のボタンから、その画面を開けます。" : "AI商社マンは、この6つの順で使います。各手順のボタンを押すとログインの欄へ進み、ログインすると、その画面が開きます。";
    const btn = (g) => (inApp ? `<button type="button" class="k-btn white k-mini" data-qggo="${esc(g[0])}">${esc(g[1])} ${I("chevR", 14, 2.4)}</button>` : `<button type="button" class="k-btn white k-mini" data-v90qg="${esc(g[0])}">${esc(g[1])}（ログインして開く）</button>`);
    const li = GUIDE.map((x, i) => {
      const s = S && S.has ? S.steps.find((y) => y.id === x.id) : null;
      const tag = s ? (s.done ? '<span class="k92c-gtag ok">済み</span>' : s.now ? `<span class="k92c-gtag nx">次はここ${s.sub ? "（" + esc(s.sub) + "）" : ""}</span>` : "") : "";
      return `<li><span class="k-qgn">${i + 1}</span><span class="k-qgi">${I(x.ic, 24, 1.9)}</span><div class="k-qgtx"><b>${esc(names[x.id] || "")}${tag}</b><p>${esc(x.b)}</p><div class="k-qggo">${x.go.map(btn).join("")}</div></div></li>`;
    }).join("");
    const help = `<li class="k92c-ghelp"><span class="k-qgn" aria-hidden="true">?</span><span class="k-qgi">${I("chat", 24, 1.9)}</span><div class="k-qgtx"><b>困ったら「AI商社マン」</b><p>わからないことは、日本語でそのまま聞けます。案件の中からも聞けます。説明は「？」を押すと出ます。</p><div class="k-qggo">${btn(["ai", "AI商社マンに聞く"])}</div></div></li>`;
    ol.innerHTML = li + help;
  }
  // 「5つの手順」の言い方（左下の入口・困ったとき）を6つに（荷主だけ。物流会社は5つのまま）
  function fixCount() {
    if (locked() || fwd()) return;
    const s = $("#rdside .rd-start small");
    if (s) reword(s, "5つの手順で、使い方の流れだけ", "6つの手順で、使い方の流れだけ");
    $$("#well [data-rdquick] small").forEach((x) => reword(x, "はじめての方へ（5つの手順・この画面の上で開きます）", "はじめての方へ（6つの手順・この画面の上で開きます）"));
  }

  /* ───── ④ 画面の題を、メニュー・パンくずの名前に ───── */
  const TITLE = { "ops:reg": ["規制・必要な書類", "規制を調べる"], "ops:doc": ["書類・出荷管理", "書類をつくる"], db: ["AIバイヤー開拓・商談", "AIバイヤー開拓・拠点"], team: ["メンバー・担当", "メンバー・権限・セキュリティ"], gloss: ["用語集", "用語集（貿易のことば）"] };
  function fixTitle(w, k) {
    const t = TITLE[k];
    if (!t) return;
    reword($("[data-rdhero] .rd-ht h1", w), t[0], t[1]);
  }

  /* ───── ⑤ 用語の「？」 ───── */
  const MARK = ".k-term:not(.k-termdemo), .tm, .v54term";
  const SUF = /^(率|額|費|法|士|手続き|手続|書類|番号|価格|条件|制度|申告|検査|統計)/;
  function fixMarks(w) {
    // 印の入れ子（刷新版の印の中に今のアプリの印）は、内側を外す
    $$(".k-term .tm, .k-term .v54term, .tm .k-term, .v54term .k-term", w).forEach((x) => { const p = x.parentNode; if (!p) return; while (x.firstChild) p.insertBefore(x.firstChild, x); p.removeChild(x); p.normalize(); });
    $$(MARK, w).forEach((el) => {
      if (el.dataset.k92m || el.classList.contains("k-t2")) return;
      const nx = el.nextSibling;
      if (!nx || nx.nodeType !== 3 || !nx.nodeValue) { return; }
      const par = el.parentElement;
      if (!par || par.closest("p.k-termhint")) return;
      const key = el.dataset.kterm || (el.dataset.term || el.textContent || "").trim();
      const full = (par.textContent || "").trim();
      // 短い見出し・ラベル（関税率・通関にかかる日数 など。かな・漢字だけが続くもの）：「？」はラベルの最後に。値・かっこ・空白が続くものは今のまま
      const label = full.length <= 12 && nx === par.lastChild && $$(MARK, par).length === 1 && /^[ぁ-んァ-ヶー一-龠々]{1,8}$/.test(nx.nodeValue);
      const m = label ? null : nx.nodeValue.match(SUF);
      if (!label && !m) return;
      el.dataset.k92m = "1";
      if (!el.dataset.kterm) el.dataset.kterm = key;
      if (label) { el.appendChild(nx); return; }
      const rest = nx.splitText(m[0].length);
      el.appendChild(nx);
      if (rest && !rest.nodeValue) rest.remove();
    });
  }

  /* ───── ⑥ 営業資料：例と見本の区分を商材に合わせる ───── */
  function deckKind() {
    try {
      const T = typeof TEN !== "undefined" ? TEN : null; // eslint-disable-line no-undef
      if (!T || typeof V85DK === "undefined" || !V85DK || typeof V85DK.cat !== "function") return null; // eslint-disable-line no-undef
      const J = V85DK.cat(T); // eslint-disable-line no-undef
      const k = String((J && J.k) || "");
      const P = (typeof V85DK_CATS !== "undefined" && V85DK_CATS && V85DK_CATS[k]) || null; // eslint-disable-line no-undef
      return { k, food: /^(food|fresh|tea|beverage_alcohol|supplement|pet|feed_agri)$/.test(k), en: (P && P.en) || "" };
    } catch (e) { return null; }
  }
  function fixDeck(w) {
    const K = deckKind();
    if (!K || !K.k) return;
    if (!K.food) {
      $$(".rd-p2 li span, .rd-x li span", w).forEach((s) => {
        if (s.children.length) return;
        reword(s, "認証・規格（ISO・HACCP など）があると、海外のバイヤーに安心感を与えられます", "認証・規格（ISO・製品の安全規格 など）があると、海外のバイヤーに安心感を与えられます");
      });
    }
    const sm = $(".k-cover .k-cvb small", w);
    if (sm && /^(OTHER|OTHERS)$/.test((sm.textContent || "").trim())) sm.textContent = K.en ? K.en.toUpperCase() : "MADE IN JAPAN";
  }

  /* ───── まとめて動かす ───── */
  function apply() {
    try { fixGuide(); } catch (e) { console.error("[rd v92core] guide", e); }
    if (locked()) return;
    try { fixCount(); } catch (e) { /* 無視 */ }
    if (fwd()) return;
    const w = $("#well");
    if (!w) return;
    const k = curKey();
    const S = steps();
    try { if (S) putFlow(w, k, S); } catch (e) { console.error("[rd v92core] flow", e); }
    try { capBands(w, k); } catch (e) { console.error("[rd v92core] bands", e); }
    try { nextWords(w); } catch (e) { /* 無視 */ }
    try { fixTitle(w, k); } catch (e) { /* 無視 */ }
    try { if (k === "dash:home") fixHome(w); } catch (e) { console.error("[rd v92core] home", e); }
    try { if (k === "today") fixToday(w); } catch (e) { console.error("[rd v92core] today", e); }
    try { if (k === "deck") fixDeck(w); } catch (e) { /* 無視 */ }
    try { fixMarks(w); } catch (e) { console.error("[rd v92core] marks", e); }
  }
  const prev = RD.after;
  RD.after = function () {
    const r = prev.apply(this, arguments);
    stMemo = null;
    try { apply(); } catch (e) { console.error("[rd v92core]", e); }
    return r;
  };
  // 描き直し（一覧の絞り込み・用語の印の付け直し・スタートガイドの窓）のあとにも同じ仕上げをする。どの直しも、済んでいれば何も書き換えない
  let tmo = 0, busy = false;
  const mo = new MutationObserver(() => { if (busy || tmo) return; tmo = setTimeout(() => { tmo = 0; busy = true; try { apply(); } catch (e) { /* 無視 */ } busy = false; }, 160); });
  const start = () => { try { mo.observe(document.body, { childList: true, subtree: true }); } catch (e) { /* 無視 */ } try { apply(); } catch (e) { /* 最初の描画の前 */ } };
  if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);

  /* ───── 足した文言の辞書（英語。手順の名前の中・西は本体の層に） ───── */
  try {
    const en = dict("en");
    if (en) {
      [
        ["はじめの設定（6つの手順）", "Getting started (6 steps)"],
        ["その前に、はじめの設定（6つの手順）を順に進めます：", "First, go through the 6 getting-started steps in order:"],
        ["次", "Next"], ["済み", "Done"], ["次はここ", "You are here next"], ["くわしく", "More"],
        ["この画面の中での進め方", "How to proceed on this screen"],
        ["出荷までの流れ（下の 1〜4 は、この流れの中の順番です。タブで切り替えます）", "Flow up to shipping (numbers 1–4 below are the order within this flow; switch with the tabs)"],
        ["商談が始まったあとは：", "Once deals have started:"], ["見積・交渉", "Quotes & negotiation"], ["出荷・実行（書類と出荷の手配）", "Shipping (documents and arrangements)"],
        ["6つの手順で、使い方の流れだけ", "The basics in 6 steps"],
        ["はじめての方へ（6つの手順・この画面の上で開きます）", "New here? (6 steps, opens on this screen)"],
        ["AI商社マンは、この6つの順で使います（「はじめの設定」と同じ並びです）。各手順のボタンから、その画面を開けます。", "Use the AI Trade Agent in these 6 steps (the same order as “Getting started”). Each step's button opens that screen."],
        ["AI商社マンは、この6つの順で使います。各手順のボタンを押すとログインの欄へ進み、ログインすると、その画面が開きます。", "Use the AI Trade Agent in these 6 steps. Each step's button takes you to sign-in, and the screen opens after you sign in."],
        ["選んだ国の決まりごと・関税・必要な書類を、商品に合わせて確かめます。", "Check the rules, duties and required documents of the countries you chose, for your product."],
        ["外国語の営業資料は、AIが商品に合わせて作ります。", "The AI creates a foreign-language sales deck tailored to your product."],
        ["「AIバイヤー開拓」で相手を見つけて、提案します。", "Find buyers with “AI buyer sourcing” and pitch to them."],
        ["規制を調べるを開く", "Open “Check regulations”"],
        ["認証・規格（ISO・製品の安全規格 など）があると、海外のバイヤーに安心感を与えられます", "Certifications and standards (ISO, product safety standards, etc.) reassure overseas buyers"],
      ].forEach((p) => { if (!en[p[0]]) en[p[0]] = p[1]; });
      const pat = (typeof I18N !== "undefined" && I18N && Array.isArray(I18N.pat)) ? I18N.pat : null; // eslint-disable-line no-undef
      if (pat) {
        const nm = (x, d) => (x === "商品を登録" ? "Register a product" : ((d && d[x]) || x)); // 帯・「次は」と同じ訳に
        pat.unshift({ re: /^次は：(.+?)(?:（(.+)）)?$/, en: (m, d) => "Next: " + nm(m[1], d) + (m[2] ? " (" + ((d && d[m[2]]) || m[2]) + ")" : "") });
        pat.unshift({ re: /^次はここ（(.+)）$/, en: (m, d) => "You are here next (" + ((d && d[m[1]]) || m[1]) + ")" });
        pat.unshift({ re: /^次の手順：(.+)（案件の一覧へ）$/, en: (m, d) => "Next step: " + ((d && d[m[1]]) || m[1]) + " (to the case list)" });
      }
      if (!en["足りない情報を埋める"]) en["足りない情報を埋める"] = "Fill in missing information";
    }
  } catch (e) { /* 辞書が無い版 */ }

  // AI商社マンの画面「貴社のいまの準備」の「次をひらく」：足した手順（規制を調べる）の行き先
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest('[data-kprep="reg"]');
    if (b) { try { RD.goKey("ops:reg"); } catch (x) { /* 無視 */ } }
  });
  // 「次は：商品を登録（足りない情報を埋める）」：商品情報を登録・AIヒアリングの層（up）に「質問の欄へ直接」の入口があれば、それを使う（無ければ商品情報を登録の画面へ）
  document.addEventListener("click", (e) => {
    try {
      const b = e.target.closest && e.target.closest('.k-clempty .k-btn[data-kbc="up"], .k92c-hnext[data-kbc="up"]');
      if (!b || typeof window.v92upHearGo !== "function") return;
      const S = steps();
      if (S && S.next && S.next.id === "fill" && S.next.sub && window.v92upHearGo()) { e.preventDefault(); e.stopImmediatePropagation(); }
    } catch (x) { /* 無視 */ }
  }, true);
})();

} catch (e) { try { console.error("[rd] rd_v92core.js", e); } catch (x) { } }
/* ==== rd_v92cty.js ==== */
try {
/* 貿易クラウドAI商社マン 21.92 cty の刷新版の層（rd_v92per.js のあとに読む）
   2026-11-14 の「8カテゴリー×ペルソナ評価」のうち、販売先国の選定（cty）の刷新版だけの直し。
   共通の層（rd_v92per.js ④）が済ませた分（カード・レーダーの「未評価」、国の詳細の間は上のカードをたたむ）には重ねない。
   今のアプリの関数・刷新版の前の層は差し替えず、RDX.after を包む。数字はアプリが持っているものだけ（本体の層 logic_v2192cty の v92ctyInfo）。
   ① 上の「選択中の販売先国」の帯・カードと、下の表のチェックが連動しなかった（auto-10・indagri-05）
      → 表のチェックを変えたら帯とカードを描き直す。カード・帯で変えた分は、本体の層の「選んだ国」（ctySel.v92pick）に写す
   ② おすすめのカード：内蔵の採点（AI 未接続）のときの決め方（進出希望国を先に・データ不足の国は入れない）に合わせて、
      見出し（まず検討する N か国）・札（進出希望国／データ不足）・決め方の説明・「入れていない国」を出す（auto-12・indagri-02・medical-05）
   ③ 「AI商社マンにおまかせ（1クリック）」が上下に2つ（daily-21・health-13・indagri-16）→ 上の大きいボタンがある間は、下の同じボタンを隠す
   ④ レーダーの軸の名前（規制・競合）が図形に重なる（daily-20）→ 軸の外へ。3か国とも未評価の軸は、名前の下に「未評価」
   ⑤ 比較の表の見出しが、送ると行に重なる（health-10）→ 見出しの固定をやめる（rd_v92cty.css）
   足す文言は、画面の言語（日本語・英語・中国語・スペイン語）に合わせて出す（M()。足した部品には data-noi18n） */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v92cty) return;
  RD._v92cty = 1;
  const { $, $$, esc, I } = RD;
  const fn = (n) => { try { return typeof window[n] === "function" ? window[n] : null; } catch (e) { return null; } };
  const info = () => { try { const f = fn("v92ctyInfo"); return f ? f() : null; } catch (e) { return null; } };
  const orig = (w, sel) => $$(sel, w).filter((x) => !x.closest(".rd-x"));
  const isDeep = (w) => orig(w, "[data-onclick]").some((b) => /ctyDeepClose/.test(b.getAttribute("data-onclick") || ""));
  const recAll = () => { try { return RD.recCty ? RD.recCty() : []; } catch (e) { return []; } };
  const AXK = ["mkt", "reg", "comp", "base"];
  // 言語：この層が足す文言は、画面の言語に合わせて出す（足した部品には data-noi18n を付け、辞書の訳は通さない）
  const lang = () => { try { const v = String((typeof I18N !== "undefined" && I18N && I18N.lang) || "ja"); return /^en/.test(v) ? "en" : /^zh/.test(v) ? "zh" : /^es/.test(v) ? "es" : "ja"; } catch (e) { return "ja"; } }; // eslint-disable-line no-undef
  const M = (ja, en, zh, es) => { const l = lang(); return l === "en" ? en : l === "zh" ? zh || en : l === "es" ? es || en : ja; };
  const tc = (c) => { try { const f = fn("v30T"); return lang() !== "ja" && f ? String(f(c) || c) : c; } catch (e) { return c; } };
  const isNA = (sc, k) => !sc || sc[k] == null || (Array.isArray(sc.na) && sc.na.indexOf(k) >= 0);

  /* ① 表のチェック ⇔ 帯・カード */
  function syncFromDom() { try { const f = fn("v92ctyPickFromDom"); if (f && f()) { const p = fn("v92ctySelPaint"); if (p) p(); } } catch (e) { /* 無視 */ } }
  document.addEventListener("v92ctypick", () => {
    try {
      if (RD.locked && RD.locked()) return;
      if (RD.curKey() !== "cty") return;
      const a = document.activeElement;
      const el = a && a.matches && a.matches("input[data-ctypick]") ? a : null;
      const y0 = el ? el.getBoundingClientRect().top : null;
      RD.after(true);
      // 上の部品の高さが変わっても、押したチェックが画面の同じ位置に残るように（あとから入る飾り＝用語の印などの分も、少し待ってもう一度）
      const keep = () => { try { if (!el || y0 == null || !el.isConnected) return; const d = el.getBoundingClientRect().top - y0; if (Math.abs(d) > 1 && Math.abs(d) < 600) window.scrollBy(0, d); } catch (e) { /* 無視 */ } };
      keep(); setTimeout(keep, 120); setTimeout(keep, 420);
    } catch (e) { console.error("[rd v92cty] sync", e); }
  });
  // カードの下の「選択する」（入れていない国）：下の表のチェックを押すのと同じ（3か国までの確かめも同じ道を通る）
  function tick(w, c) {
    const b = orig(w, "input[data-ctypick]").find((x) => x.dataset.ctypick === c);
    if (!b) return;
    if (b.disabled) {
      // 確定のあと：今の版の「選び直す」と同じ道（確定していた国にチェックが入った状態に戻る）を通してから
      try { if (typeof toast === "function") toast(M("確定のあとは、先に「選び直す」を押してください（確定していた国にチェックが入った状態に戻ります）", "After confirming, press “Choose again” first (the confirmed countries come back ticked).", "确定后，请先点击“重新选择”（已确定的国家会恢复为勾选状态）。", "Tras confirmar, pulse primero «Elegir de nuevo» (los países confirmados vuelven marcados).")); } catch (e) { /* 無視 */ } // eslint-disable-line no-undef
      return;
    }
    b.focus({ preventScroll: true });
    b.click();
  }

  /* ② おすすめのカード */
  function fixCards(w, box, N) {
    const all = recAll();
    const rankOf = (c) => all.findIndex((r) => r.c === c) + 1;
    const tiles = $$(".k-tiles > .k-card", box).filter((c) => $("[data-rdcty]", c));
    if (!tiles.length) return;
    const warm = tiles[0].closest("section.k-card");
    const T = {
      hope: M("進出希望国", "Target market", "目标市场", "Mercado objetivo"), hopeT: M("商品の登録で選んだ進出希望国です", "A target market you chose at product registration", "商品登记时选择的目标市场", "Mercado objetivo elegido en el registro"),
      thin: M("データ不足", "Insufficient data", "数据不足", "Datos insuficientes"), thinT: M("市場性と競合がどちらも未評価です。総合点は、規制と拠点の2つの観点だけで出しています", "Market and Competition are both not rated. The total comes only from Regulation and Base", "市场性和竞争均未评估。综合分仅由法规和据点两项得出", "Mercado y Competencia sin evaluar. El total sale solo de Regulación y Base"),
      notHope: M("進出希望国ではない", "not a target market", "非目标市场", "no es mercado objetivo"),
    };
    tiles.forEach((card, i) => {
      if (card.dataset.v92c) return;
      card.dataset.v92c = "1";
      const c = $("[data-rdcty]", card).getAttribute("data-rdcty");
      const tags = $$(":scope > .k-tag", card);
      const abs = tags.find((t) => /position:\s*absolute/.test(t.getAttribute("style") || ""));
      const rk = tags.find((t) => t !== abs);
      if (N.rule && abs && rankOf(c) !== 1) abs.remove(); // 「総合点が最も高い」は、総合1位の国にだけ
      let h = "";
      if (N.hope.indexOf(c) >= 0) h += `<span class="k-tag bl k-v92hope" title="${esc(T.hopeT)}">${esc(T.hope)}</span>`;
      if (N.thin.indexOf(c) >= 0) h += `<span class="k-tag gy k-v92thin" title="${esc(T.thinT)}">${esc(T.thin)}</span>`;
      // 札は、順位の札の下の1行に（国によって札の数が違っても、国名の高さがそろうように）
      if (rk && (N.hope.length || N.thin.length)) rk.insertAdjacentHTML("afterend", '<div class="k-v92tags" data-noi18n>' + h + "</div>");
    });
    if (!N.rule || !warm || warm.dataset.v92r) return;
    warm.dataset.v92r = "1";
    const h2 = $(".k-h h2", warm);
    const n3 = tiles.length;
    if (h2) { h2.textContent = M("まず検討する " + n3 + "か国", n3 + (n3 > 1 ? " countries" : " country") + " to consider first", "优先考虑的" + n3 + "个国家", n3 + (n3 > 1 ? " países" : " país") + " para considerar primero"); h2.setAttribute("data-noi18n", ""); }
    const tg = $$(".k-h .k-tag", warm).find((x) => /総合点の高い順/.test(x.textContent || ""));
    if (tg) {
      tg.classList.add("k-v92wrap"); tg.setAttribute("data-noi18n", "");
      const t = Array.from(tg.childNodes).find((n) => n.nodeType === 3 && /総合点の高い順/.test(n.nodeValue || ""));
      if (t) t.nodeValue = N.hope.length
        ? M("進出希望国を先に・残りは総合点の高い順（AI商社マンの判断の前）", "Your target markets first, then by total score (before the AI Trade Agent's judgement)", "目标市场优先・其余按综合分排序（AI商社专员判断之前）", "Primero sus mercados objetivo; el resto por puntuación total (antes del juicio del Agente IA)")
        : M("データのある国を総合点の高い順（AI商社マンの判断の前）", "Countries with data, by total score (before the AI Trade Agent's judgement)", "有数据的国家按综合分排序（AI商社专员判断之前）", "Países con datos, por puntuación total (antes del juicio del Agente IA)");
    }
    const sc = (c) => { const r = all.find((x) => x.c === c); return r && r.sc ? Math.round(r.sc.total || 0) : null; };
    const chip = (c, why) => {
      const on = N.pick.indexOf(c) >= 0;
      const meta = M("総合 " + sc(c) + "点・" + rankOf(c) + "位", "Total " + sc(c) + " · rank " + rankOf(c), "综合 " + sc(c) + "分・第" + rankOf(c) + "位", "Total " + sc(c) + " · puesto " + rankOf(c)) + (why ? "・" + why : "");
      return `<span class="k-v92out">${RD.flag ? RD.flag(c, 18) : ""}<b>${esc(tc(c))}</b><small>${esc(meta)}</small><button type="button" class="k-btn ${on ? "" : "white"} k-mini" data-v92tick="${esc(c)}" title="${esc(on ? M("押すと外します", "Click to remove", "点击移除", "Pulse para quitar") : M("押すと選びます（3か国まで）", "Click to select (up to 3)", "点击选择（最多3个国家）", "Pulse para seleccionar (hasta 3)"))}">${I(on ? "check" : "plus", 14, 2.6)}${esc(on ? M("選択中（外す）", "Selected (remove)", "已选（移除）", "Seleccionado (quitar)") : M("選択する", "Select", "选择", "Seleccionar"))}</button></span>`;
    };
    const outH = N.hopeOut.map((c) => chip(c, N.thin.indexOf(c) >= 0 ? T.thin : "")).join("");
    const outO = N.higher.map((x) => chip(x.c, x.thin ? T.thin : T.notHope)).join("");
    const n = document.createElement("div");
    n.className = "k-v92rule"; n.setAttribute("role", "note"); n.setAttribute("data-noi18n", "");
    const pMain = N.hope.length
      ? M("内蔵の採点は、商品の特性（用途・価格帯・強み）を見ていません。そのため、商品の登録で選んだ<b>進出希望国を先に</b>、残りを総合点の高い順に選んでいます。",
        "The built-in scoring does not look at your product's characteristics (use, price range, strengths). So <b>the target markets you chose at registration come first</b>, and the rest are filled in by total score. ",
        "内置评分不考虑商品特性（用途・价格带・优势）。因此，<b>优先选择商品登记时选定的目标市场</b>，其余按综合分从高到低选择。",
        "La puntuación integrada no considera las características del producto. Por eso <b>van primero los mercados objetivo elegidos en el registro</b> y el resto se completa por puntuación total. ")
      : M("内蔵の採点は、商品の特性（用途・価格帯・強み）を見ていません。<b>データのある国</b>を総合点の高い順に選んでいます（進出希望国の登録が無いか、候補に入っていません）。",
        "The built-in scoring does not look at your product's characteristics. <b>Countries with data</b> are chosen by total score (no target market is registered, or none is among the candidates). ",
        "内置评分不考虑商品特性。按综合分从高到低选择<b>有数据的国家</b>（未登记目标市场，或不在候选中）。",
        "La puntuación integrada no considera las características del producto. Se eligen <b>los países con datos</b> por puntuación total (no hay mercados objetivo registrados o no están entre los candidatos). ");
    const pThin = M("市場性と競合がどちらも未評価の国は「データ不足」とし、進出希望国でなければ入れていません。AI が接続されると、商品の特性に照らして選び直します。",
      "Countries where both Market and Competition are not rated are marked “insufficient data” and are left out unless they are your target markets. When AI is connected, it re-selects in light of your product.",
      "市场性和竞争均未评估的国家标为“数据不足”，除非是目标市场，否则不列入。连接AI后，将结合商品特性重新选择。",
      "Los países sin evaluación de Mercado ni Competencia se marcan «datos insuficientes» y quedan fuera salvo que sean sus mercados objetivo. Con la IA conectada, se vuelve a elegir según su producto.");
    const pFlat = M("この商品は、通関統計と規制のひな形のデータが無いため、国ごとの点数の差は「STANDAGE が商談したバイヤーの数」と「拠点の開設の状況」だけで付いています（商品の売れやすさの差ではありません）。",
      "For this product there are no customs statistics and no regulation template, so the differences between countries come only from the number of buyers STANDAGE has talked with and the status of its bases (not from how well the product would sell).",
      "该商品没有海关统计和法规模板的数据，各国分数的差异仅来自“STANDAGE洽谈过的买家数量”和“据点的开设状况”（并非商品好卖程度的差异）。",
      "Para este producto no hay estadísticas aduaneras ni plantilla de regulación; las diferencias entre países provienen solo del número de compradores con los que STANDAGE ha negociado y del estado de sus bases.");
    n.innerHTML = `<div class="k-v92rh">${I("bulb", 18, 2.4)}<b>${esc(M("この" + n3 + "か国の決め方", "How these were chosen", "这" + n3 + "个国家的决定方式", "Cómo se eligieron"))}</b><span>${esc(M("（AI 未接続・内蔵の採点）", "(AI not connected · built-in scoring)", "（未连接AI・内置评分）", "(IA no conectada · puntuación integrada)"))}</span></div>
      <p>${pMain}${esc(pThin)}</p>
      ${N.flat ? "<p>" + esc(pFlat) + "</p>" : ""}
      ${outH ? `<div class="k-v92outs"><span class="k-v92ol">${esc(M("進出希望国のうち、3か国までのため入れていない国", "Target markets left out because the limit is 3", "因最多3个国家而未列入的目标市场", "Mercados objetivo fuera por el límite de 3"))}</span>${outH}</div>` : ""}
      ${outO ? `<div class="k-v92outs"><span class="k-v92ol">${esc(M("総合点は高いが、入れていない国", "Higher total score but not included", "综合分较高但未列入的国家", "Mayor puntuación total pero no incluidos"))}</span>${outO}</div>` : ""}
      <button type="button" class="k-link" data-v92totbl="1">${esc(M("すべての国の点数と、くわしい決め方（下の表）", "All countries' scores and the full explanation (table below)", "所有国家的分数和详细的决定方式（下表）", "Puntuaciones de todos los países y la explicación completa (tabla de abajo)"))}${I("arr", 14)}</button>`;
    const tl = $(".k-tiles", warm);
    if (tl) tl.after(n); else warm.appendChild(n);
    $$("[data-v92tick]", n).forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); tick(w, b.getAttribute("data-v92tick")); }));
    const go = $("[data-v92totbl]", n);
    if (go) go.addEventListener("click", (e) => { e.preventDefault(); const t = document.getElementById("v92ctyrule") || document.getElementById("v54ctyleg"); if (t) { try { t.scrollIntoView({ block: "start", behavior: "smooth" }); window.scrollBy(0, -90); } catch (x) { t.scrollIntoView(); } } });
  }

  /* ③ 「おまかせ」のボタンは1つ */
  function fixDup(w, box) {
    // 分析の前（結果がまだ無い）は、刷新版の上のカードに大きい「おまかせ」のボタンがある（言語が変わっても同じ見分け方）
    const top = !!box && !recAll().length && !!$("section.k-card.warm .k-btn.big", box);
    orig(w, ".ph button, .ph a").forEach((b) => { if (/ctyRun\(true\)/.test(b.getAttribute("data-onclick") || "")) b.classList.toggle("k-v92dup", !!top); });
  }

  /* ④ レーダー：軸の名前を図形の外へ */
  function fixRadar(box, rows) {
    const svg = $('svg[aria-label="主要指標の比較"]', box);
    if (!svg || svg.dataset.v92lab) return;
    svg.dataset.v92lab = "1";
    const cx = 150, cy = 135, R = 100;
    const naAll = AXK.map((k) => rows.length > 0 && rows.every((r) => isNA(r.sc, k)));
    const texts = $$("text", svg).slice(0, 4); // 市場性（上）・規制（右）・競合（下）・拠点（左）の順
    const pos = [[cx, naAll[0] ? cy - R - 26 : cy - R - 12, "middle"], [cx + R + 12, cy + 5, "start"], [cx, cy + R + 24, "middle"], [cx - R - 12, cy + 5, "end"]];
    texts.forEach((t, i) => {
      const p = pos[i];
      t.setAttribute("x", p[0]); t.setAttribute("y", p[1]); t.setAttribute("text-anchor", p[2]);
      if (naAll[i] && !$("tspan", t)) t.insertAdjacentHTML("beforeend", `<tspan x="${p[0]}" dy="14" font-size="10.5" font-weight="700" fill="#7C8AA0" data-noi18n>${esc(M("未評価", "Not rated", "未评估", "Sin evaluar"))}</tspan>`);
    });
    svg.setAttribute("viewBox", "-16 -4 332 292");
  }

  function apply() {
    if (RD.locked && RD.locked()) return;
    const w = $("#well");
    if (!w || RD.curKey() !== "cty") return;
    const box = $(".rd-x.rd-p2", w);
    if (!box) return;
    fixDup(w, box);
    if (isDeep(w)) return;
    syncFromDom();
    const N = info();
    if (!N || !N.on) return;
    try { fixCards(w, box, N); } catch (e) { console.error("[rd v92cty] cards", e); }
    const all = recAll();
    const rows = $$(".k-tiles > .k-card", box).map((card) => { const b = $("[data-rdcty]", card); return b ? all.find((x) => x.c === b.getAttribute("data-rdcty")) : null; }).filter((r) => r && r.sc);
    try { fixRadar(box, rows); } catch (e) { console.error("[rd v92cty] radar", e); }
  }
  const prev = RD.after;
  RD.after = function () {
    const r = prev.apply(this, arguments);
    try { apply(); } catch (e) { console.error("[rd v92cty]", e); }
    return r;
  };
  try { apply(); } catch (e) { /* 最初の描画の前 */ }
})();

} catch (e) { try { console.error("[rd] rd_v92cty.js", e); } catch (x) { } }
/* ==== rd_v92entry.js ==== */
try {
/* 貿易クラウドAI商社マン 21.92 entry（刷新版の層・ほかの rd_v92*.js のあとに読む）
   2026-11-15 評価（xlogin）の、入口と案内の課題のうち、刷新版が足した部品の直し。今のアプリの関数・前の層は差し替えず、RDX.after を包む。
   ① ログイン画面の言葉（3ステップの1・アクセスコードの札・ご担当者名の欄）（xlogin-04）
   ② 上の帯の会社名のボタン：見本を開いたまま再読み込みすると、切り替えの一覧と「貴社の商品に戻る」が出ない → 出す（xlogin-20）
      （前の層は「部品が見えているか」を、隠した親の中で確かめていたため、いちど隠れると戻らなかった）
   ③ 「商品情報を登録」で商品が0件のとき：「次は」を「資料をアップロード（下の枠へ）」に（xlogin-06）
   ④ はじめてガイド（使い方を見る・くわしい版）：窓の上に、そのページの「刷新版での場所」を今のメニューの名前で出す（xlogin-12）
      ※ ガイドの本文と絵（guide/ の別ファイル）は、窓の外からは書き換えられない（安全のための仕切りの中）。道順だけを窓の上で言い直す
   ⑤ 商品一覧のカード：カードを押しても、その商品に切り替わる（「？」の説明どおりに）（xlogin-21）
   ⑥ 通知センターの上の札：同じ名前の札（そのほか）を1枚にまとめる（xlogin-23）
   ⑦ はじめての窓の文（「どの画面でも」→「次は」のある画面の名前）（xlogin-13）／用語集の余分なリンク（xlogin-16）
   ⑧ お問い合わせの「どの画面で」に出す、刷新版の画面の名前（本体の層が window.v92entryRdName を読む）（xlogin-15） */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v92entry) return;
  RD._v92entry = 1;
  const { $, $$, esc, I } = RD;
  const locked = () => { try { return !!RD.locked(); } catch (e) { return true; } };
  const fwd = () => { try { return !!RD.isFwd(); } catch (e) { return false; } };
  const curKey = () => { try { return RD.curKey(); } catch (e) { return ""; } };
  const setTxt = (el, v) => { if (el && el.textContent !== v) el.textContent = v; };
  const shown = (k) => { try { return !!k && !k.hidden && getComputedStyle(k).display !== "none" && !(k.tagName === "SELECT" && !k.options.length); } catch (e) { return false; } };

  /* ───── 画面の名前と道順（いまの左メニューの名前で） ───── */
  function mainLabel(key) {
    // 左メニューに実際に出ている名前を読む（前の層が名前を変えているため）
    try {
      const b = $$("#rdside [data-rdgo], #rdside [data-rdk], #rdside button, #rdside a").find((x) => (x.dataset.rdgo || x.dataset.rdk || x.dataset.k || "") === key);
      if (b) { const t = (b.querySelector("span, b") || b).textContent.trim(); if (t) return t.replace(/\s*\d+$/, ""); }
    } catch (e) { /* 無視 */ }
    return "";
  }
  const MAIN_FALL = { "dash:home": "案件", today: "タスク", item: "商品", msg: "やりとり", ai: "AI商社マン" };
  function pathOf(key) {
    const parts = ["左メニュー"];
    const M = (fwd() ? RD.MAIN_F : RD.MAIN_S) || [];
    const N = (fwd() ? RD.NAV_F : RD.NAV_S) || [];
    let nm = "", grp = "";
    N.forEach((g) => (g.items || []).forEach((it) => { if (!nm && String(it[0]) === key) { nm = it[1]; grp = g.g; } }));
    if (key === "dash:home") nm = "案件一覧（ホーム）";
    const main = M.find((m) => m[0] === key) || M.find((m) => Array.isArray(m[4]) && m[4].indexOf(key) >= 0);
    if (main) {
      const mk = main ? main[0] : key;
      const label = mainLabel(mk) || MAIN_FALL[mk] || (main && main[1]) || nm;
      parts.push(label);
      if (main && mk !== key && nm) parts.push(nm);
    } else {
      parts.push("すべての機能");
      if (grp) parts.push(grp);
      parts.push(nm || key);
    }
    return parts;
  }
  window.v92entryRdName = function () {
    try { const p = pathOf(curKey()); return p[p.length - 1] || ""; } catch (e) { return ""; }
  };

  /* ───── ① ログイン画面の言葉 ───── */
  function fixLogin() {
    const v = document.getElementById("lgv");
    if (!v || v.hidden) return;
    // 3ステップの1：実際に選ぶのは「メール・パスワード」か「アクセスコード」
    $$(".k-lgsteps .k-step", v).forEach((s) => {
      $$("b, small, span", s).forEach((el) => {
        if (el.children.length) return;
        const t = (el.textContent || "").trim();
        if (t === "お客様 または 管理者") el.textContent = "メール・パスワード か コード";
      });
    });
    // アクセスコードの箱の札：だれのための箱かを1つの言い方に
    $$(".k-lgp .k-lgph .k-tag", v).forEach((el) => { if ((el.textContent || "").trim() === "メール未登録の方") el.textContent = "体験用・デモ用のコードをお持ちの方"; });
    const nm = document.getElementById("lg-name");
    if (nm && /招待状に書かれた氏名/.test(nm.getAttribute("placeholder") || "") && !/任意/.test(nm.getAttribute("placeholder") || "")) {
      nm.setAttribute("placeholder", "ご担当者名（任意。招待された方は、招待状の氏名）");
    }
  }

  /* ───── ② 上の帯の会社名のボタン：切り替えの一覧と「貴社の商品に戻る」 ───── */
  function fixBar() {
    const dd = $(".bar .k-dd");
    if (!dd) return;
    const za = dd.querySelector('[data-z="a"]');
    if (!za) return;
    // 「貴社の商品に戻る」は、切り替えの区切りの中へ（帯の直下に置かれたままだと、刷新版の帯では見えない）
    const back = document.getElementById("v84smpBack");
    if (back && back.parentElement !== za) za.appendChild(back);
    let changed = false;
    $$(".k-ddr", dd).forEach((r) => {
      if (r.style.display !== "none") return;
      // 隠したままでは中の部品が「見えていない」と数えられる → いちど出してから、中の部品そのものを確かめる
      r.style.display = "";
      const has = Array.from(r.children).some(shown);
      if (!has) { r.style.display = "none"; return; }
      const h = r.previousElementSibling;
      if (h && h.tagName === "H4") h.style.display = "";
      changed = true;
    });
    if (changed && typeof RD.buildBar2 === "function") { try { RD.buildBar2(); } catch (e) { /* 無視 */ } }
  }

  /* ───── ③ 商品が0件のときの「次は」 ───── */
  const noProduct = () => { try { const T = RD.G("TENS"); return !(Array.isArray(T) && T.length > 0); } catch (e) { return false; } };
  function fixUpNext(w) {
    const b = $(".k-next", w);
    if (!b) return;
    const none = noProduct();
    const bb = $("b", b);
    if (none && b.dataset.kbc === "item") {
      b.dataset.v92eKbc = "item";
      b.removeAttribute("data-kbc");
      b.dataset.v92eDrop = "1";
      b.title = "次の手順：商品の資料をアップロードする（下の枠へ進みます）";
      if (bb) { b.dataset.v92eOld = bb.textContent; bb.textContent = "資料をアップロード（下の枠へ）"; }
    } else if (!none && b.dataset.v92eDrop) {
      b.dataset.kbc = b.dataset.v92eKbc || "item";
      delete b.dataset.v92eDrop;
      if (bb && b.dataset.v92eOld) bb.textContent = b.dataset.v92eOld;
      b.title = "次の手順：" + ((bb && bb.textContent) || "");
    }
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest(".k-next[data-v92e-drop]");
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    try {
      const fin = document.getElementById("fin");
      const box = (fin && (fin.closest("label, .drop, .dz, [class*=drop]") || fin.parentElement)) || $("#well [class*=drop]");
      if (box) {
        box.scrollIntoView({ block: "center", behavior: "smooth" });
        box.classList.add("k92e-flash");
        setTimeout(() => box.classList.remove("k92e-flash"), 2200);
      }
    } catch (x) { /* 無視 */ }
  }, true);

  /* ───── ④ はじめてガイドの窓：刷新版での場所 ───── */
  const SLIDE_KEY = { s09: "up", s10: "up", s11: "item", s11b: "item", s12: "today", s13: "cty", s13b: "cty", s14: "ops:reg", s15: "deck", s16: "db", s17: "deal", s18: "deal", s18a: "msg", s18b: "msg", s18c: "msg",
    s19: "ops:doc", s19a: "ops:ship", s19b: "ops:ship", s20: "legal", s21: "docs", s22: "msg", s22b: "msg", s23: "team", s24: "task", s24b: "task", s25: "memo", s26: "dash:rep", s27: "dash:rep", s27b: "inbox",
    s27c: "deal", s27d: "rqp", s27e: "gloss", s27f: "trash", s28: "ai", s28a: "ai", s28b: "ai", s29: "ai" };
  let slideNow = "";
  function guideStrip() {
    const ov = document.getElementById("v40gd");
    if (!ov || ov.hidden) return;
    const dlg = $(".v40dlg", ov);
    if (!dlg) return;
    let s = $(".k92e-gd", dlg);
    if (!s) {
      s = document.createElement("div");
      s.className = "k92e-gd rd-x";
      s.setAttribute("role", "note");
      dlg.appendChild(s);
    }
    let id = slideNow;
    if (!id) { try { id = (typeof V40 !== "undefined" && V40 && V40.last) || ""; } catch (e) { id = ""; } } // eslint-disable-line no-undef
    const key = fwd() ? "" : SLIDE_KEY[id];
    const note = "このガイドの絵と道順は、刷新前の配置で書かれています";
    let html;
    if (key) {
      const p = pathOf(key);
      html = `<b>刷新版での場所</b><span class="k92e-gdp">${p.map((x, i) => (i ? '<i aria-hidden="true">›</i>' : "") + `<span>${esc(x)}</span>`).join("")}</span><small>${note}</small>`;
    } else {
      html = fwd() ? `<small>${note}</small>` : `<b>刷新版の左メニュー</b><span class="k92e-gdp"><span>案件／商品／タスク／やりとり／AI商社マン／困ったとき ＋ すべての機能</span></span><small>${note}（「ガイドバー」は、いまは見出しの右の「次は」ボタンです）</small>`;
    }
    if (s.dataset.h !== html) { s.innerHTML = html; s.dataset.h = html; }
  }
  window.addEventListener("message", (e) => {
    try {
      const d = e.data;
      if (!d || typeof d !== "object" || !d.bc20guide) return;
      if ((d.bc20guide === "page" || d.bc20guide === "ready") && typeof d.id === "string" && d.id) slideNow = d.id;
      guideStrip();
    } catch (x) { /* 無視 */ }
  });
  // 「使い方を見る」などで窓が開いたとき
  document.addEventListener("click", () => { setTimeout(() => { try { const ov = document.getElementById("v40gd"); if (ov && !ov.hidden) { try { slideNow = (typeof V40 !== "undefined" && V40 && V40.last) || slideNow; } catch (e) { /* 無視 */ } guideStrip(); } } catch (e) { /* 無視 */ } }, 150); }, true); // eslint-disable-line no-undef
  // 「くわしい版（はじめてガイド）」は、ログインしたあとは別のタブではなくこの窓で開く（上の「刷新版での場所」が付く）。Ctrl／中ボタンでは今までどおり別のタブ
  document.addEventListener("click", (e) => {
    try {
      const a = e.target.closest && e.target.closest('a[href="guide/"], a[href="guide/index.html"]');
      if (!a || locked() || e.ctrlKey || e.metaKey || e.shiftKey || e.button) return;
      if (typeof v40Open !== "function") return; // eslint-disable-line no-undef
      e.preventDefault();
      slideNow = "s01";
      v40Open("s01", a); // eslint-disable-line no-undef
      setTimeout(guideStrip, 100);
    } catch (x) { /* 無視 */ }
  }, true);

  /* ───── ⑤ 商品一覧のカード：カードを押しても切り替わる ───── */
  function fixProdCards(w) {
    $$(".k-pc", w).forEach((c) => {
      if (c.dataset.v92e) return;
      const btn = $$(".k-pcacts button", c).find((b) => /商品情報/.test(b.textContent || ""));
      if (!btn) return;
      c.dataset.v92e = "1";
      c.classList.add("k92e-pc");
      c.title = "押すと、この商品に切り替えて、商品情報を開きます";
    });
  }
  document.addEventListener("click", (e) => {
    try {
      const c = e.target.closest && e.target.closest(".k-pc.k92e-pc");
      if (!c || e.target.closest("button, a, input, select, label, summary, [data-kact], abbr, .tm")) return;
      if (String(window.getSelection && window.getSelection()) !== "") return; // 文字を選んでいるときは動かさない
      const btn = $$(".k-pcacts button", c).find((b) => /商品情報/.test(b.textContent || ""));
      if (btn) btn.click();
    } catch (x) { /* 無視 */ }
  });

  /* ───── ⑥ 通知センターの上の札：同じ名前を1枚に ───── */
  function fixBellTiles() {
    const pn = document.getElementById("pn");
    if (!pn) return;
    $$(".k-tiles", pn).forEach((box) => {
      const seen = {};
      let removed = 0;
      $$(":scope > .k-tile", box).forEach((t) => {
        const l = $(".k-tl", t), n = $(".k-tn", t);
        if (!l || !n) return;
        const name = (l.textContent || "").trim();
        const num = parseInt((n.textContent || "").replace(/[^\d]/g, ""), 10);
        if (!name || isNaN(num)) return;
        if (seen[name]) {
          const n0 = $(".k-tn", seen[name].el);
          seen[name].num += num;
          const sm = n0.querySelector("small");
          const txt = Array.from(n0.childNodes).find((x) => x.nodeType === 3);
          if (txt) txt.nodeValue = String(seen[name].num); else n0.insertBefore(document.createTextNode(String(seen[name].num)), sm || null);
          if (t.classList.contains("hot")) seen[name].el.classList.add("hot");
          t.remove(); removed++;
        } else seen[name] = { el: t, num };
      });
      if (removed) { const left = $$(":scope > .k-tile", box).length; box.style.setProperty("--n", String(left)); }
    });
  }

  /* ───── ⑦ はじめての窓・用語集 ───── */
  function fixWelcome() {
    const v = document.getElementById("welv");
    if (!v) return;
    $$("span, p", v).forEach((el) => {
      if (el.children.length === 0 && (el.textContent || "").trim() === "どの画面でも、見出しの右の「次は」のボタンが、次にやることを教えてくれます。") {
        el.textContent = "「案件」（ホーム）と、商品・販売先の国・規制・営業資料・バイヤーの画面では、見出しの右の「次は」のボタンが、次にやることを教えてくれます。";
      }
    });
  }
  let prevKey = "", lastKey = "";
  // 用語集に足す語（インコタームズ 2020 の残り4つと、決済の D/P・D/A）。一覧にだけ足す（画面の文字への印は付けない）
  const GL_ADD = [
    ["FAS", "船側渡し。輸出港で、本船の横（岸壁やはしけの上）に貨物を置くまでが売り手の負担です。船に積む費用と、その先の運賃・保険は買い手が持ちます。主に、ばら積みの貨物で使います。"],
    ["CPT", "輸送費込み。売り手が、指定の仕向地までの運賃を払います。貨物のリスクは、最初の運送人に引き渡した時点で買い手に移ります（保険は付きません）。"],
    ["CIP", "輸送費保険料込み。CPT に、売り手が手配する貨物保険を足した条件です。コンテナ・航空など、どの輸送手段でも使えます。"],
    ["DPU", "荷卸込持込渡し。指定の仕向地で、貨物を荷卸しして引き渡すまでが売り手の負担です。輸入の通関と関税は買い手が持ちます。"],
    ["D/P", "支払渡し。銀行を通じて、買い手が代金を支払うのと引き換えに船積書類を渡す決済方法です（L/C のような銀行の支払保証はありません）。"],
    ["D/A", "引受渡し。買い手が期限付きの手形を引き受けると船積書類を渡し、代金は期日に支払われる決済方法です。売り手にとっては、D/P より回収のリスクが大きくなります。"],
  ];
  function fixGlossList(w) {
    const ul = $("#v90gll", w);
    if (!ul || ul.dataset.v92e) return;
    ul.dataset.v92e = "1";
    const lis = () => $$(":scope > li", ul);
    const nameOf = (li) => ((li.querySelector("b") || {}).textContent || "").trim();
    // 「仕向け国」と「仕向国」は同じ語 → 1つにまとめる
    const a = lis().find((li) => nameOf(li) === "仕向け国"), b = lis().find((li) => nameOf(li) === "仕向国");
    if (a && b) {
      const bb = a.querySelector("b"), p = a.querySelector("p");
      if (bb) bb.textContent = "仕向け国（仕向国）";
      if (p) p.textContent = "商品を送る先の国（輸出先の国）のことです。「仕向国」とも書きます。";
      a.dataset.q = (a.dataset.q || "") + " 仕向国";
      ul.removeChild(b);
    }
    const have = {};
    lis().forEach((li) => { have[nameOf(li)] = 1; });
    GL_ADD.forEach(([n, s0]) => {
      if (have[n]) return;
      const li = document.createElement("li");
      li.className = "k92e-gl";
      li.dataset.q = (n + " " + s0).toLowerCase();
      li.innerHTML = `<b>${esc(n)}</b><p>${esc(s0)}</p>`;
      const next = lis().find((x) => nameOf(x).localeCompare(n, "ja") > 0);
      ul.insertBefore(li, next || null);
    });
    const h = $("#v90glt", w);
    if (h) h.textContent = h.textContent.replace(/（\d+語）/, `（${lis().length}語）`);
  }
  function fixGloss(w) {
    try { fixGlossList(w); } catch (e) { /* 無視 */ }
    // 用語集の画面の中の「（一覧は「用語集」）」のリンクは、いま居る画面なので押せなくする
    $$(".k-link[data-kgloss]", w).forEach((b) => { if (!b.dataset.v92e) { b.dataset.v92e = "1"; b.disabled = true; b.classList.add("k92e-here"); b.title = "いま開いている画面です"; } });
    // 「← 外国語 営業資料」は、営業資料から来たときだけ。ほかの画面から来たときは、その画面へ戻る
    const a = $('a[data-v83go="deck"]', w);
    if (a && prevKey && prevKey !== "deck" && prevKey !== "gloss") {
      const p = pathOf(prevKey);
      const nm = p[p.length - 1];
      if (nm && a.dataset.v92eBack !== prevKey) { a.dataset.v92eBack = prevKey; a.textContent = "← " + nm; }
    }
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest("a[data-v92e-back]");
    if (!a) return;
    e.preventDefault(); e.stopPropagation();
    try { RD.goKey(a.dataset.v92eBack); } catch (x) { /* 無視 */ }
  }, true);

  function apply() {
    try { fixWelcome(); } catch (e) { /* 無視 */ }
    try { fixBar(); } catch (e) { /* 無視 */ }
    try { fixBellTiles(); } catch (e) { /* 無視 */ }
    try { guideStrip(); } catch (e) { /* 無視 */ }
    if (locked()) { try { fixLogin(); } catch (e) { /* 無視 */ } return; }
    const w = $("#well");
    if (!w) return;
    const k = curKey();
    if (k !== lastKey) { prevKey = lastKey; lastKey = k; }
    if (fwd()) return;
    if (k === "up") fixUpNext(w);
    if (k === "dash:prod") fixProdCards(w);
    if (k === "gloss") fixGloss(w);
  }
  const prev = RD.after;
  RD.after = function () {
    const r = prev.apply(this, arguments);
    try { apply(); } catch (e) { console.error("[rd v92entry]", e); }
    return r;
  };
  // ログイン画面・上の帯・通知の窓は、#well の描き直しの外で変わる
  setInterval(() => { try { if (locked()) fixLogin(); else { fixBar(); fixBellTiles(); const w = $("#well"); if (w && curKey() === "up") fixUpNext(w); } fixWelcome(); } catch (e) { /* 無視 */ } }, 900);
  try { apply(); } catch (e) { /* 最初の描画の前 */ }
})();

} catch (e) { try { console.error("[rd] rd_v92entry.js", e); } catch (x) { } }
/* ==== rd_v92flow.js ==== */
try {
/* 貿易クラウドAI商社マン 21.92 flow（刷新版の層・ほかの rd_v92*.js のあとに読む）
   2026-11-15 の2回目の評価：商談 → 見積 → 書類の流れと、数字・状態の食い違いのうち、刷新版が足した部品の直し。
   今のアプリの関数・刷新版の前の層は差し替えず、RDX.after を包む。数字はアプリが持っているものだけ（本体の層 logic_v2192flow と同じ出どころ）。
   ① 商談・バイヤーの上の「商談の状況」：刷新版は直接連絡のスレッドだけを数えていた（下のバイヤー一覧の札は、商談の記録・スレッドを合わせた1社1行）
      → バイヤー一覧の札と同じ行（b30Collect・失注を除く）から数える。「商談中」はサンプル出荷を別の数に分ける（health-N03・N05・daily-N03・food-N12・indagri-N09・other-N03・auto-N04）
   ② 案件一覧・案件の詳細の「次の行動」：商談の記録から作った案件（まだ送っていない）は「最初の連絡を送る」。「今日に送信」→「今日 送信済み」（health-N17）
   ③ 案件の詳細の「〇〇への輸出に要る書類」：条件つきの手続き（規制の画面で「該当するときだけ」）に印（medical-N07）。注意書きが3列に割れる（other-N02・auto-N11）
   ④ タスク・進行の「タスク全体の状況」：刷新版は端末の今日で数え、分析・レポート（アプリの時計＝見本の会社は見本の日付）と食い違った（food-N04：期限切れ 10件と 2件）
      → アプリの数（taskStats）にそろえ、見本の会社では「見本の日付で数えています」と書く
   ⑤ 荷主が開く「AI見積」の窓：物流会社向けの言葉（荷主へ提出・貴社のレート）を、荷主の言葉に（medical-N02・daily-N02）
   ⑥ 商談の記録の表：日付・国が欄の中で割れる（other-N09） */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v92flow) return;
  RD._v92flow = 1;
  const { $, $$, esc, I } = RD;
  const G = (n) => { try { return RD.G ? RD.G(n) : undefined; } catch (e) { return undefined; } };
  const isFwd = () => { const S = G("SES"); return !!(S && (S.role === "fwd" || S.t === "fwd")); };
  const safe = (fn) => { try { return fn(); } catch (e) { return undefined; } };

  /* ① 商談の状況 */
  function fixDeal(w) {
    const sec = $$(".rd-x section.k-card", w).find((s) => /商談の状況/.test((s.firstElementChild && s.firstElementChild.textContent) || ""));
    if (!sec || sec.dataset.v92f) return;
    const rows = safe(() => b30Collect()); // eslint-disable-line no-undef
    if (!Array.isArray(rows)) return;
    sec.dataset.v92f = "1";
    const act = rows.filter((r) => r && r.lead !== "失注");
    const n = (st) => act.filter((r) => r.st === st).length;
    const cells = $$(":scope > div", sec).slice(1);
    const set = (i, label, v) => { const c = cells[i]; if (!c) return; const sm = $("small", c), b = $("b", c); if (sm && label) sm.textContent = label; if (b) b.textContent = String(v); };
    set(0, "商談中", n("商談中"));
    set(1, "提案済み（見積提示）", n("見積提示"));
    set(2, "受注見込み（契約交渉）", n("契約交渉"));
    set(3, "取引中", n("取引中"));
    const extra = [["コンタクト中", n("コンタクト中")], ["サンプル出荷", n("サンプル出荷")]].filter((x) => x[1] > 0);
    const hs = $(".k-hs", sec);
    if (hs) hs.textContent = "（下のバイヤー一覧の札と同じ数え方・失注を除く）";
    if (extra.length && !$(".k-v92fx", sec)) sec.insertAdjacentHTML("beforeend", `<span class="k-v92fx">ほかに ${extra.map((x) => `${esc(x[0])} <b>${x[1]}</b>社`).join("・")}</span>`);
  }

  /* ② 次の行動の言い方 */
  const sentTxt = (s) => String(s || "").replace(/^(.+?)に送信$/, "$1 送信済み");
  function caseByKey(k) { return (safe(() => RD.allCases()) || []).find((c) => c.key === k) || null; }
  const logOnly = (c) => !!(c && c.msgs && c.msgs.length && c.msgs.every((m) => m && m.v92fb));
  function fixHome(w) {
    const body = $("#k-clbody", w);
    if (!body) return;
    const paint = () => {
      const ord = RD._caseOrder || [];
      $$("tr.k-clrow", body).forEach((tr, i) => {
        if (tr.dataset.v92f) return;
        tr.dataset.v92f = "1";
        const c = caseByKey(ord[i]);
        const nx = $(".c-nx > span", tr);
        if (!nx) return;
        const sm = $("small", nx);
        if (c && logOnly(c) && c.ss !== "失注") {
          const t = Array.from(nx.childNodes).find((n) => n.nodeType === 3);
          if (t) t.nodeValue = "最初の連絡を送る";
          if (sm) sm.textContent = "商談の記録から作った案件（まだ送っていません）";
          const who = $(".c-last .k-who", tr); if (who) who.textContent = "記録";
        } else if (sm) sm.textContent = sentTxt(sm.textContent);
      });
    };
    paint();
    if (!body.dataset.v92fo) { body.dataset.v92fo = "1"; new MutationObserver(() => paint()).observe(body, { childList: true }); }
  }

  /* ③ 案件の詳細 */
  function fixCase(w) {
    const box = $(".k-cd", w);
    if (!box || box.dataset.v92f) return;
    box.dataset.v92f = "1";
    const c = RD._case0;
    const p = $(".k-cdnx", box);
    if (p) {
      const sm = $("small", p);
      if (c && logOnly(c) && c.ss !== "失注") {
        const t = Array.from(p.childNodes).find((n) => n.nodeType === 3);
        if (t) t.nodeValue = "最初の連絡を送る";
        if (sm) sm.textContent = "商談の記録から作った案件です（相手にはまだ送っていません）";
        $$(".k-tl .k-who.me", box).forEach((x) => { x.textContent = "記録"; });
      } else if (sm) sm.textContent = sentTxt(sm.textContent);
    }
    // 注意書き：絵と文の2列に（文の中の用語の印で列が割れない）
    $$(".k-cdwarn", box).forEach((x) => { if ($(":scope > .k-v92ft", x)) return; const sp = document.createElement("span"); sp.className = "k-v92ft"; Array.from(x.childNodes).forEach((n) => { if (!(n.nodeType === 1 && n.tagName.toLowerCase() === "svg")) sp.appendChild(n); }); x.appendChild(sp); });
    // 条件つきの手続きの印（規制の画面と同じ判断：本体の層 ops の v54rStatusFor().cond）
    if (!c) return;
    const cond = safe(() => { const d = D, r = d.regs && d.regs[c.cty]; if (!r) return []; const st = v54rStatusFor(c.cty, r, typeof v54rCatOf === "function" ? v54rCatOf(d) : "", d.compRows || []); return (st && st.cond) || []; }) || []; // eslint-disable-line no-undef
    if (!cond.length) return;
    let n = 0;
    $$(".k-docs .k-doc", box).forEach((el) => {
      const nm = (el.textContent || "").trim();
      const x = cond.find((y) => String(y.nm) === nm);
      if (!x || x.v === "y") return;
      el.classList.add("k-v92cond"); if (x.v === "n") el.classList.add("no");
      el.title = x.why || "";
      el.insertAdjacentHTML("beforeend", `<em>${x.v === "n" ? "対象外" : "該当するときだけ"}</em>`);
      n++;
    });
    const docs = $(".k-docs", box);
    if (n && docs && !$(".k-v92cn", box)) docs.insertAdjacentHTML("afterend", `<p class="k-cdsm k-v92cn">「該当するときだけ」の印は、条件に当たるときだけ要る手続きです（必須の件数には入れていません）。当たるかどうかは「${esc(c.cty)}の規制」で選べます。</p>`);
  }

  /* ④ タスク全体の状況：アプリの数にそろえる */
  function fixTask(w) {
    const S = safe(() => taskStats()); // eslint-disable-line no-undef
    if (!S || !S.total) return;
    const tiles = $$(".rd-x .k-tile", w);
    if (!tiles.length || tiles[0].dataset.v92f) return;
    tiles[0].dataset.v92f = "1";
    const set = (re, v) => tiles.filter((t) => { const l = $(".k-tl", t); return l && re.test((l.textContent || "").trim()); }).forEach((t) => { const nEl = $(".k-tn", t); if (!nEl) return; const tx = Array.from(nEl.childNodes).find((n) => n.nodeType === 3); if (tx) tx.nodeValue = String(v); t.classList.toggle("rd", /^期限切れ$/.test(($(".k-tl", t).textContent || "").trim()) && v > 0); t.classList.toggle("crit", /対応必須/.test($(".k-tl", t).textContent || "") && v > 0); if (/^開始が遅れている$/.test(($(".k-tl", t).textContent || "").trim())) t.classList.toggle("hot", v > 0); });
    set(/^期限切れ(（対応必須）)?$/, S.overdue);
    set(/^(期限7日以内|7日以内の予定)$/, S.soon);
    set(/^開始が遅れている$/, S.late);
    const td = safe(() => TODAYS) || ""; // eslint-disable-line no-undef
    const demo = !!safe(() => isDemoClock()); // eslint-disable-line no-undef
    // 「次にやること」の札と日数も、同じ日付で
    if (td) {
      const day = (s) => new Date(String(s).slice(0, 10) + "T00:00:00");
      $$(".rd-x table.rd-tbl tbody tr", w).forEach((tr) => {
        const tds = $$("td", tr); if (tds.length < 5) return;
        const tag = $(".k-tag", tds[0]); const m = (tds[3].textContent || "").match(/\d{4}-\d{2}-\d{2}/);
        if (!tag || !m) return;
        const d = Math.round((day(m[0]) - day(td)) / 864e5);
        const lab = d < 0 ? ["期限切れ", "rdf"] : d <= 3 ? ["期限間近", "or"] : ["予定", "bl"];
        const b = $("b", tag); const no = b ? b.textContent : "";
        tag.className = "k-tag " + lab[1]; tag.innerHTML = `<b>${esc(no)}</b>　${lab[0]}`;
        const sm = $("small", tds[3]); if (sm) { sm.textContent = d < 0 ? -d + "日前" : "あと" + d + "日"; sm.style.color = d < 0 ? "var(--k-rd)" : "var(--k-ink3)"; }
      });
    }
    const card = tiles[0].closest(".k-card");
    if (card && !$(".k-v92fn", card)) card.insertAdjacentHTML("beforeend", `<p class="rd-note k-v92fn">期限切れ・7日以内の数は、分析・レポートと同じ数え方です${demo && td ? `（見本の会社は、見本の日付 ${esc(td)} を「今日」として数えています）` : ""}。</p>`);
  }

  /* ⑤ 荷主が開く「AI見積」の窓 */
  function fixQuoteDw() {
    if (isFwd()) return;
    const dw = document.getElementById("dw");
    const hd = dw && $(".k-qhd", dw);
    if (!hd || hd.dataset.v92f) return;
    hd.dataset.v92f = "1";
    const id = ((dw.textContent || "").match(/RQ-[A-Z0-9]+/) || [])[0];
    const F = G("FWDB") || {};
    const r = id && (F.reqs || []).find((x) => x && x.id === id);
    const legs = (r && r.legs) || [];
    const got = legs.filter((lg) => (lg.offers || []).some((o) => o && o.quote)).length;
    const steps = $$(".k-steps .k-step", hd);
    const stepTxt = ["依頼を出した", "物流会社の見積を待つ", "比べて選ぶ"];
    steps.forEach((s, i) => { const b = $("b", s); if (b && stepTxt[i]) b.textContent = stepTxt[i]; });
    if (steps[1]) { steps[1].classList.toggle("done", got > 0); steps[1].classList.toggle("on", !got); }
    if (steps[2]) { steps[2].classList.remove("done"); steps[2].classList.toggle("on", got > 0); }
    $$(".k-tile", hd).forEach((t) => {
      const l = $(".k-tl", t), s = $(".k-ts", t), nEl = $(".k-tn", t);
      const lt = (l && l.textContent) || "";
      if (/貴社の概算見積/.test(lt)) {
        l.textContent = `物流会社の見積（${got}/${legs.length}か国）`;
        if (s) s.textContent = got ? "下の一覧で比べられます" : "まだ届いていません";
        if (nEl && !got) nEl.textContent = "—";
        if (nEl && got) nEl.textContent = got + "か国";
      }
      if (/確認状況/.test(lt) && s && /提出前に確認/.test(s.textContent || "")) s.textContent = "依頼の内容を確かめてください";
    });
    $$(".k-card", hd).forEach((c) => {
      const h = $("h2, h3", c);
      if (h && /見積の内訳（貴社のレート）/.test(h.textContent || "")) {
        h.textContent = "届いた見積";
        const b = $$("div, p", c).find((x) => /貴社のレートでの見積はありません/.test(x.textContent || "") && !x.querySelector("div, p"));
        if (b) b.textContent = "物流会社の見積はまだ届いていません。届くと、この窓の下の一覧と「出荷を進める」に出ます。";
        const nt = $$(".rd-note", c).find((x) => /レート管理/.test(x.textContent || "")); if (nt) nt.style.display = "none";
      }
    });
  }
  let qt = 0;
  const startObs = () => {
    const dw = document.getElementById("dw");
    if (!dw || RD._v92flowObs) return;
    RD._v92flowObs = 1;
    new MutationObserver(() => { clearTimeout(qt); qt = setTimeout(() => { try { fixQuoteDw(); } catch (e) { /* 無視 */ } }, 120); }).observe(dw, { childList: true, subtree: true });
  };
  startObs(); setTimeout(startObs, 1500);

  const old = RD.after;
  RD.after = function () {
    const r = old.apply(this, arguments);
    try {
      startObs();
      const w = document.getElementById("well") || document.querySelector(".stage") || document.body;
      const k = RD.curKey ? RD.curKey() : "";
      if (k === "deal") fixDeal(w);
      if (k === "dash:home" || k === "dash") fixHome(w);
      if (k === "dash:case") fixCase(w);
      if (k === "task") fixTask(w);
    } catch (e) { console.error("[rd v92flow]", e); }
    return r;
  };
})();

} catch (e) { try { console.error("[rd] rd_v92flow.js", e); } catch (x) { } }
/* ==== rd_v92fwd.js ==== */
try {
/* 貿易クラウドAI商社マン 21.92 fwd（刷新版の層・rd_v92per.js のあとに読む）
   2026-11-14「8カテゴリー×ペルソナ評価」の物流会社の画面の課題（cross-03・04・10〜14・18）のうち、刷新版が足した部品の直し。
   今のアプリの関数・刷新版の前の層は差し替えず、RDX.after を包む。数字はアプリが持っているものだけ（見積受信箱と同じ数＝本体の層 logic_v2192fwd が控えた数）。
   ① ホーム「今日やること N 件／この3つ」：件数と行の数の関係を書く。「14日で運用を始めるステップ」→ 開く中身（使い方ガイド）の名前に（cross-12）
   ② 手順の数え方：ホームの「見積から出荷までの流れ（6ステップ）」にそろえる。左下の「3分でわかるスタートガイド」・使い方ガイドの最初の箱も同じ6ステップに。
      「AI見積を確認して送る／承認・提出」→ 見積は自動で荷主に届く（承認の操作は無い）と書く（cross-12）
   ③ 「全体の状況」はホームの1か所に：ホームの札を、見積受信箱の上の数字と同じ札・同じ並びにそろえる（10枚＝5枚×2段）。
      見積受信箱の上の札は「受信箱の状況」と名前を変え、全体の状況はホームと書く。左メニューの「全体の状況」を押したら、その項目を選ばれた表示に（cross-11・14）
   ④ 見積受信箱：数字のカード（受信・AI自動回答・登録レーン・仮押さえ）と「AI物流マンのしくみ」は依頼の表の下へ。要確認のタスクの長い説明はたたむ（cross-10）
   ⑤ 用語の「？」が2つ付く（abbr.k-term の中に今のアプリの印 .tm）→ 印は1つに（cross-13）
   ⑥ 交渉記録の窓：輸送ルートの札が「横浜港 → ア…」で切れる・「問題なし」の絵が注意の三角・「荷主へ提出」の手順（提出の操作は無い）（cross-18）
   物流レート管理・見積受信箱の表の幅は rd_v92fwd.css */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v92fwd) return;
  RD._v92fwd = { err: [], ovSel: false };
  const { $, $$, esc, I } = RD;
  const err = (k, e) => { try { RD._v92fwd.err.push(k + ": " + String((e && e.message) || e).slice(0, 160)); } catch (x) { /* 無視 */ } };
  const fwd = () => { try { return !RD.locked() && RD.isFwd(); } catch (e) { return false; } };
  const key = () => { try { return RD.curKey(); } catch (e) { return ""; } };
  const V = () => window.__v2192fwd || {};
  const ja = () => { try { return ((typeof I18N !== "undefined" && I18N && I18N.lang) || "ja") === "ja"; } catch (e) { return true; } }; // eslint-disable-line no-undef
  const T = (j, e) => (ja() ? j : e); // 日本語の画面は日本語、ほかの言語は英語（要素には data-noi18n）

  /* 見積から出荷までの流れ（ホームの6ステップと同じ） */
  const SIX = [
    { ic: "db", t: "レート登録", b: "「物流レート管理」で、自社の運賃表（Excel・CSV）を取り込むか、1本ずつ手で入れます。取り込みは、読めた行・読めなかった行を確かめてから登録します。", go: [["frates", "物流レート管理を開く"]] },
    { ic: "mail", t: "見積対応", b: "レートのある区間の依頼には、AI物流マンが自動で見積を出し、そのまま荷主に届きます（承認・提出の操作はありません）。内容は「見積受信箱」の「交渉記録」で確かめます。", go: [["finbox", "見積受信箱を開く"]] },
    { ic: "alert", t: "例外対応", b: "レートが無い区間の依頼は「要確認のタスク」に出ます。その区間のレートを登録すると、見積が付きます。金額を直すときは、区間のレートを直します。", go: [["finbox", "要確認の依頼を見る"]] },
    { ic: "chart", t: "選ばれる工夫", b: "「相見積・AI推奨」で、ほかの会社との順位・差を見て、運賃・日数・有効期限を見直します。", go: [["fagg", "相見積・AI推奨を開く"]] },
    { ic: "hand", t: "仮押さえ", b: "荷主が貴社を選んで仮押さえすると、見積受信箱と案件に出ます。", go: [["finbox", "見積受信箱を開く"]] },
    { ic: "ship", t: "出荷手配", b: "「案件・出荷管理」で、B/L・本船・ETD/ETA を登録し、出荷完了まで進めます。", go: [["fcase", "案件・出荷管理を開く"]] },
  ];

  /* ───── ①③ ホーム ───── */
  function ovGo(k) {
    if (k === "frates" || k === "fcase") { RD.goKey(k); return; }
    if (k === "exp") { RD.goKey("frates"); setTimeout(() => { try { if (window.v89fShowExpired) window.v89fShowExpired(true); } catch (e) { /* 無視 */ } }, 250); return; }
    RD.goKey("finbox");
    setTimeout(() => { const b = $$('#well [data-v70fgo="' + k + '"]').find((x) => !x.closest(".rd-x")); if (b) b.click(); }, 80);
  }
  function fixHome(w) {
    const top = $(".rd-fhome-top", w); if (!top) return;
    // 今日やること：件数と行の数の関係
    const ch = $(".rd-warm .rd-ch", top);
    if (ch && !ch.dataset.v92) {
      const rows = $$(".rd-todo .rd-td", top);
      const need = rows.filter((r) => { const c = $(".rd-cnt", r); return c && !c.classList.contains("z"); }).length;
      const h2 = $("h2", ch), chs = $(".rd-chs", ch);
      if (h2 && chs && ja()) {
        ch.dataset.v92 = "1";
        h2.setAttribute("data-noi18n", ""); chs.setAttribute("data-noi18n", "");
        h2.innerHTML = `今日やること`;
        chs.className = "rd-chs k-v92todo";
        chs.textContent = need ? `下の${rows.length}つのうち、対応が要るのは ${need}つ です（右の数字は依頼・案件の件数）。` : `いま対応が要るものはありません（下の${rows.length}つは、いつでも開けます）。`;
      }
    }
    // はじめての方へ：開く中身（使い方ガイド）の名前に
    const hb = $("[data-rdact=help]", top);
    if (hb && !hb.dataset.v92 && ja()) {
      const sp = $$("span span", hb).find((x) => /14日で運用を始めるステップ/.test(x.textContent || ""));
      if (sp) { hb.dataset.v92 = "1"; sp.setAttribute("data-noi18n", ""); sp.textContent = "使い方ガイド（見積から出荷までの6ステップ）"; }
    }
    // 全体の状況：見積受信箱の上の数字と同じ札・同じ並び（10枚＝5枚×2段）
    const h = $$(".rd-card h2", w).find((x) => /^全体の状況/.test((x.textContent || "").trim()));
    const card = h && h.closest(".rd-card");
    const box = card && $(".rd-tiles", card);
    const ov = V().ov;
    if (box && ov && !box.dataset.v92 && $("[data-v90ftile]", box)) {
      box.dataset.v92 = "1";
      box.classList.add("k-v92ov");
      const Ti = (i) => $(`[data-rdtile="${i}"]`, box);
      const mk = (k, ic, l, n, u, s, cls, ord) => `<button type="button" class="rd-tile ${cls || ""}" data-v92ov="${k}" style="order:${ord}"><span class="rd-ti">${I(ic, 26)}</span><span><b>${esc(l)}</b><span class="rd-tn">${esc(n)}<small>${esc(u)}</small></span>${s ? `<span class="rd-ts" style="display:block">${esc(s)}</span>` : ""}</span></button>`;
      const n = (k) => (ov[k] == null ? 0 : ov[k]);
      const set = (el, ord) => { if (el) el.style.order = String(ord); };
      set(Ti(0), 1); set(Ti(1), 2); set(Ti(2), 5); set(Ti(3), 7); set($("[data-v90ftile]", box), 9);
      box.insertAdjacentHTML("beforeend",
        `<div class="k-v92ovg" style="order:0" data-noi18n>${T("依頼", "Requests")}</div>` +
        mk("rv", "alert", T("要確認", "Needs check"), n("rv"), T("件", ""), T("AIが見積を出せなかった依頼", "Requests the AI could not quote"), n("rv") ? "or" : "gr", 3) +
        mk("none", "users", T("未担当", "Unassigned"), n("none"), T("件", ""), T("担当を決めていない依頼", "Requests with no owner yet"), n("none") ? "or" : "gr", 4) +
        `<div class="k-v92ovg" style="order:6" data-noi18n>${T("レート・案件", "Rates & cases")}</div>` +
        mk("frates", "cal", T("30日以内に期限のレート", "Rates expiring within 30 days"), n("frates"), T("本", ""), T("早めに新しいレートへ", "Renew them soon"), n("frates") ? "or" : "gr", 8) +
        mk("rdy", "check", T("出せる状態（荷主待ち）", "Ready (awaiting shipper)"), n("rdy"), T("件", ""), T("貴社のレートで出せる依頼", "Quotable with your rates"), "", 10) +
        mk("fcase", "box", T("案件", "Cases"), n("fcase"), T("件", ""), T("荷主の会社×案件番号", "Shipper × case no."), "", 11));
      $$("[data-v92ov]", box).forEach((b) => b.setAttribute("data-noi18n", ""));
      $$("[data-v92ov]", box).forEach((b) => b.addEventListener("click", () => ovGo(b.dataset.v92ov)));
      const chs = $(".rd-chs", card);
      const tip = "物流会社の全体の状況（ダッシュボード）は、ここ1か所です。見積受信箱の上の「受信箱の状況」と同じ数え方で、依頼（受信・AI自動回答率・要確認・未担当・仮押さえ）と、レート・案件（登録レーン・30日以内に期限・期限切れ・出せる状態・案件）を出します。数字を押すと、その一覧に移ります。";
      if (chs && ja()) { chs.setAttribute("data-noi18n", ""); chs.textContent = "（見積受信箱の上の数字と同じ数え方です。数字を押すと、その一覧に移ります）"; }
      const q = h && $(".k-q", h); if (q && ja()) q.setAttribute("data-kq", tip);
    }
    // 「？」が後から付いたときも、説明をそろえる
    const q2 = h && $(".k-q", h);
    if (q2 && ja() && box && box.dataset.v92 && !/1か所/.test(q2.getAttribute("data-kq") || "")) q2.setAttribute("data-kq", "物流会社の全体の状況（ダッシュボード）は、ここ1か所です。見積受信箱の上の「受信箱の状況」と同じ数え方で、依頼（受信・AI自動回答率・要確認・未担当・仮押さえ）と、レート・案件（登録レーン・30日以内に期限・期限切れ・出せる状態・案件）を出します。数字を押すと、その一覧に移ります。");
    // AI自動回答率の内訳は短く（3行に折れない）
    const au = box && $(".v90fautos", box);
    if (au && !au.dataset.v92 && ja() && typeof window.v90fAutoSplit === "function") {
      const A = window.v90fAutoSplit(); au.dataset.v92 = "1"; au.title = au.textContent || "";
      au.textContent = A.warn ? `うち 期限切れ・港違いを含む ${A.warn}件（要確認）` : "期限切れ・港違いの見積なし";
    }
  }
  RD.v92fGoOv = function () {
    RD._v92fwd.ovSel = true;
    try { RD.goKey("fhome"); } catch (e) { err("ov", e); }
    let n = 0; const t = setInterval(() => { n++; const h = $$("#well .rd-card h2").find((x) => /^全体の状況/.test((x.textContent || "").trim())); if (h || n > 20) { clearInterval(t); if (h) h.closest(".rd-card").scrollIntoView({ block: "start", behavior: "smooth" }); navSel(); } }, 100);
  };
  /* 左メニューの「全体の状況」：押したら、その項目を選ばれた表示に（ほかの項目を押すまで） */
  function navSel() {
    const ov = $('#rdside [data-rdk="@ov"]'); if (!ov) return;
    const on = RD._v92fwd.ovSel && key() === "fhome";
    if (!on) RD._v92fwd.ovSel = false;
    const home = $('#rdside .rd-mains [data-rdk="fhome"]');
    const setA = (el, k, v) => { if (el && el.getAttribute(k) !== v) el.setAttribute(k, v); };
    if (on) { setA(ov, "aria-current", "true"); setA(home, "aria-current", "false"); }
    setA(ov, "title", "物流会社の全体の状況（ホームの「全体の状況」）：受信・AI回答・要確認・未担当・仮押さえ・レートの期限・案件の数");
  }
  document.addEventListener("click", (e) => {
    // 前の層（rd_v90fwd）が先に画面を移して左メニューを描き直すため、押したボタンはもう画面の外にある。印（data-rdk）だけで見る
    const b = e.target && e.target.closest && e.target.closest("[data-rdk]"); if (!b || !fwd()) return;
    RD._v92fwd.ovSel = b.getAttribute("data-rdk") === "@ov";
    if (RD._v92fwd.ovSel) { setTimeout(navSel, 0); setTimeout(navSel, 400); setTimeout(navSel, 1200); }
  }, true);

  /* ───── ③④ 見積受信箱 ───── */
  function fixInbox(w) {
    const ov = $(".v70fov", w);
    if (ov && !ov.dataset.v92 && ja()) {
      ov.dataset.v92 = "1";
      const h3 = $(".v70fov-h h3", ov), sp = $(".v70fov-h span", ov);
      if (h3) h3.textContent = "受信箱の状況";
      if (sp) sp.innerHTML = `数字を押すと、その一覧に移ります。全体の状況（ダッシュボード）は <button type="button" class="k-link" data-v92ovhome="1">ホームの「全体の状況」</button> にまとめています（同じ数え方）。`;
    }
    // 数字のカード・しくみ・要確認のタスクのたたみは、本体の層（logic_v2192fwd の inboxLayout）が今の版・刷新版の両方で行う。
    // 刷新版では「ここに届く依頼」の説明（？ 説明）も、同じ「数字の内訳」の中へ（上の「受信箱の状況」のすぐ下に依頼の表が来るように）
    const det = $("details.k-v92more", w);
    const st = $$(":scope > .k-qline", w).find((x) => x.nextElementSibling && x.nextElementSibling.classList.contains("v69fst"));
    if (det && st) { const nx = st.nextElementSibling; const sm = $(":scope > summary", det); if (sm) { sm.insertAdjacentElement("afterend", nx); sm.insertAdjacentElement("afterend", st); } }
    // 「推奨・選択中・（自社）（他社）」の説明の「？」は、担当・対応の絞り込みの行の右端へ（1行ぶん、表が上に来る）
    const tabs = $(".v33tabs", w);
    const ql = $$(".k-qline", w).find((x) => x.nextElementSibling && x.nextElementSibling.classList.contains("v79fwdlg"));
    if (tabs && ql && !tabs.contains(ql)) { ql.classList.add("k-v92ql"); const nx = ql.nextElementSibling; tabs.appendChild(ql); const s = $("span", ql); if (s && ja()) s.textContent = "推奨・選択中の見方"; if (nx) tabs.insertAdjacentElement("afterend", nx); }
  }
  document.addEventListener("click", (e) => { const b = e.target && e.target.closest && e.target.closest("[data-v92ovhome]"); if (!b) return; e.preventDefault(); RD.v92fGoOv(); }, true);

  /* ───── ⑤ 用語の印は1つに ───── */
  function fixTerms(root) {
    if (!root) return;
    // 今のアプリの印（ux25Terms の span.tm）は、abbr の中の文字にも付く（ABBR を除いていない）ため、刷新版の印（abbr.k-term）と二重になっていた。
    // 外して終わりにすると、今のアプリがまた付け直す（書き換え合う）ので、abbr に data-noterm（今のアプリが見る「付けない」印）を付けてから外す
    $$("abbr.k-term:not([data-noterm])", root).forEach((x) => { if (!x.closest(".k-termdemo")) x.setAttribute("data-noterm", ""); });
    $$("abbr.k-term .tm, abbr.k-term .v54term, abbr.k-term abbr.k-term", root).forEach((x) => { if (x.closest(".k-termdemo")) return; x.replaceWith(document.createTextNode(x.textContent || "")); });
    $$(".tm abbr.k-term, .v54term abbr.k-term", root).forEach((x) => { const p = x.closest(".tm, .v54term"); if (p && p.parentNode) p.replaceWith(x); });
    // 「ETD/ETA」「FCL20」のように記号・数字に続く英字は、刷新版（rd_v90doc の unmarkCodes）が番号・コードとみなして印を外している（span.v90no）。
    // ここにも今のアプリの印が付いたり付かなかったり（開いた直後だけ「ETA ？」）だったので、付けない側にそろえる
    $$("span.v90no:not([data-noterm])", root).forEach((x) => x.setAttribute("data-noterm", ""));
    $$("span.v90no .tm, span.v90no .v54term", root).forEach((x) => x.replaceWith(document.createTextNode(x.textContent || "")));
    $$(".tm > span.v90no:only-child, .v54term > span.v90no:only-child", root).forEach((x) => { const p = x.parentElement; if (p && p.parentNode && (p.textContent || "") === (x.textContent || "")) p.replaceWith(x); });
  }

  /* ───── ② スタートガイド・使い方ガイド：6ステップにそろえる ───── */
  function fixSide() {
    const sm = $("#rdside .rd-start small");
    if (sm && fwd() && ja() && !sm.dataset.v92) { sm.dataset.v92 = "1"; sm.setAttribute("data-noi18n", ""); sm.textContent = "見積から出荷までの6ステップ"; }
  }
  if (typeof RD.quickGuide === "function") {
    const qg = RD.quickGuide;
    RD.quickGuide = function () {
      const r = qg.apply(this, arguments);
      try {
        const d = document.getElementById("k-qg");
        if (d && fwd() && ja()) {
          const p = $(".k-qghd p", d); if (p) p.textContent = "AI物流マンは、この6つの順（ホームの「見積から出荷までの流れ」と同じ）で使います。各手順のボタンから、その画面を開けます。";
          const ol = $(".k-qgst", d);
          if (ol) ol.innerHTML = SIX.map((x, i) => `<li><span class="k-qgn">${i + 1}</span><span class="k-qgi">${I(x.ic, 24, 1.9)}</span><div class="k-qgtx"><b>${esc(x.t)}</b><p>${esc(x.b)}</p><div class="k-qggo">${x.go.map((g) => `<button type="button" class="k-btn white k-mini" data-qggo="${esc(g[0])}">${esc(g[1])} ${I("chevR", 14, 2.4)}</button>`).join("")}</div></div></li>`).join("");
          const ft = $(".k-qgft p", d); if (ft) ft.innerHTML = `${I("list", 16)}迷ったら「ホーム」の「今日やること」へ。わからないことは「AIに聞く」で聞けます。ほかの機能は、左のメニューの「<b>すべての機能</b>」に全部あります。`;
        }
      } catch (e) { err("qg", e); }
      return r;
    };
  }
  function fixHelp(pn) {
    const hd = $(".k-helphd2", pn); if (!hd || hd.dataset.v92 || !fwd() || !ja()) return;
    hd.dataset.v92 = "1";
    const card = $$(".k-card", hd).find((c) => /まずこの3ステップから/.test(c.textContent || ""));
    if (card) {
      const h = $$("h2, h3, b", card).find((x) => /まずこの3ステップから/.test(x.textContent || "")); if (h) h.textContent = "見積から出荷までの6ステップ（ホームと同じ流れ）";
      const st = $(".k-steps", card);
      if (st) {
        st.style.cssText += ";display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px";
        st.innerHTML = SIX.map((s, i) => `<button type="button" class="k-step" data-v92six="${esc(s.go[0][0])}"><span class="k-sn">${i + 1}</span><span class="k-si">${I(s.ic, 24)}</span><span style="min-width:0"><b style="white-space:nowrap">${esc(s.t)}</b></span></button>`).join("");
        st.insertAdjacentHTML("afterend", `<p class="rd-note" style="margin:10px 0 0">見積は、レートのある区間なら AI物流マンが自動で出し、そのまま荷主に届きます（承認・提出の操作はありません）。金額を直すときは、見積受信箱の「回答の金額を直す」から区間のレートを直します。</p>`);
        $$("[data-v92six]", st).forEach((b) => b.addEventListener("click", () => { try { closeDW(); } catch (e) { /* 無視 */ } RD.goKey(b.dataset.v92six); })); // eslint-disable-line no-undef
      }
    }
    // 今の版の説明「物流会社モードの3ステップ」は、上の6ステップと重なるのでたたむ（消さない）
    const lb = $$("p.lbl", pn).find((x) => /物流会社モードの3ステップ/.test(x.textContent || "") && !x.closest(".rd-x"));
    if (lb && !lb.closest("details")) {
      const d = document.createElement("details"); d.className = "k-v92fold"; d.setAttribute("data-noi18n", ""); d.style.margin = "10px 0";
      d.innerHTML = `<summary>今の版の説明（受け取る・レートを整える・相見積で速く返す）を開く</summary>`;
      lb.insertAdjacentElement("beforebegin", d);
      const grid = lb.nextElementSibling; // 見出しのすぐ下の、3つの手順の箱だけ（その下のボタン・お問い合わせはそのまま）
      d.appendChild(lb);
      if (grid && grid.tagName === "DIV" && !grid.classList.contains("rw") && !grid.querySelector("button")) d.appendChild(grid);
    }
  }

  /* ───── ⑥ 交渉記録の窓 ───── */
  function fixQuote(pn) {
    const hd = $(".k-qhd", pn); if (!hd || hd.dataset.v92) return;
    hd.dataset.v92 = "1";
    $$(".k-tile", hd).forEach((t) => {
      const l = (($(".k-tl", t) || {}).textContent || "").trim(), tn = $(".k-tn", t);
      if (l === "輸送ルート" && tn) { tn.classList.add("k-v92route"); tn.style.fontSize = "20px"; tn.style.lineHeight = "1.35"; tn.title = tn.textContent || ""; }
      if (l === "確認状況" && tn && /問題なし/.test(tn.textContent || "")) { const ti = $(".k-ti", t); if (ti) ti.innerHTML = I("check", 24, 2.6); }
      if (l === "見積依頼番号" && tn) { tn.style.fontSize = "22px"; }
    });
    if (ja()) {
      const st = $$(".k-steps .k-step b", hd).find((b) => (b.textContent || "").trim() === "荷主へ提出"); if (st) st.textContent = "荷主に届く（自動）";
      const st2 = $$(".k-steps .k-step b", hd).find((b) => (b.textContent || "").trim() === "AI見積を確認"); if (st2) st2.textContent = "AI見積の内容を確認";
      const nt = $$(".rd-note", hd).find((p) => /金額・納期を直すときは「レート管理」で更新します/.test(p.textContent || ""));
      const F = (() => { try { return typeof FWDB !== "undefined" ? FWDB : null; } catch (e) { return null; } })(); // eslint-disable-line no-undef
      const id = ((($(".dwhead h3", pn) || {}).textContent || "").match(/RQ-[A-Z0-9]+/) || [])[0];
      const r = F && id && (F.reqs || []).find((x) => x && x.id === id);
      const fob = r && (r.legs || []).some((l) => l && (l.v56shipFob || (l.quote && l.quote.v56shipFob)));
      if (nt && fob) nt.textContent = "FOB の依頼は、海上運賃（航空運賃）は買い手の負担のため ¥0 と出ます（見積は、港で積むまでの THC等・書類費だけ）。金額・納期を直すときは「レート管理」で区間のレートを更新します（同じ区間のほかの依頼にも同じレートが使われます）。";
    }
  }

  function apply() {
    if (!fwd()) return;
    const w = $("#well"); if (!w) return;
    const k = key();
    try { if (k === "fhome") fixHome(w); else if (k === "finbox") fixInbox(w); } catch (e) { err("apply", e); }
    try { fixTerms(w); } catch (e) { err("terms", e); }
    try { fixSide(); navSel(); } catch (e) { err("side", e); }
  }
  const prev = RD.after;
  RD.after = function () {
    const r = prev.apply(this, arguments);
    try { apply(); } catch (e) { err("after", e); }
    return r;
  };
  // ホームは見張りが後から描く・用語の印は後から付く → 画面の中が変わったら、少し後にもう一度
  let t1 = 0;
  const mo = new MutationObserver(() => { try { if (RD._v92fwd.ovSel) navSel(); } catch (e) { /* まだ */ } clearTimeout(t1); t1 = setTimeout(() => { try { apply(); } catch (e) { /* まだ */ } }, 60); });
  try { const w = document.getElementById("well"); if (w) mo.observe(w, { childList: true, subtree: true }); } catch (e) { err("mo", e); }
  let t2 = 0;
  const mo2 = new MutationObserver(() => { clearTimeout(t2); t2 = setTimeout(() => { try { const pn = document.getElementById("pn"), dw = document.getElementById("dw"); if (!pn || !dw || dw.dataset.open !== "true" || !fwd()) return; const t = pn.textContent || ""; if (/ヘルプ・使い方/.test(t)) fixHelp(pn); else if (/AI見積 RQ-/.test(t)) fixQuote(pn); fixTerms(pn); } catch (e) { err("pn", e); } }, 80); });
  try { const pn = document.getElementById("pn"); if (pn) mo2.observe(pn, { childList: true, subtree: true }); } catch (e) { err("mo2", e); }
  const mo3 = new MutationObserver(() => { try { if (fwd()) { fixSide(); navSel(); } } catch (e) { /* まだ */ } });
  try { const s = document.querySelector(".side"); if (s) mo3.observe(s, { childList: true, subtree: true }); } catch (e) { err("mo3", e); }
  try { apply(); } catch (e) { /* 最初の描画の前 */ }
})();

} catch (e) { try { console.error("[rd] rd_v92fwd.js", e); } catch (x) { } }
/* ==== rd_v92i18n.js ==== */
try {
/* 貿易クラウドAI商社マン 21.92 i18n（刷新版の層・rd_v90i18n.js のあとに読む）
   刷新版の英語の辞書（RDX.v90i18nDict）のうち、部品ごとの差し替えで文が壊れていた訳を、本体の層 logic_v2192i18n の直した訳に合わせる（xi18n-74）。
   刷新版の部品の中は rd_v90i18n が自分の辞書を優先して当てるため、ここで同じ鍵の値だけを差し替える（鍵は足さない・ほかは変えない）。 */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v92i18n) return;
  RD._v92i18n = 1;
  try {
    const MY = RD.v90i18nDict, OV = window.__v2192i18nOV;
    if (MY && OV && OV.en) Object.keys(OV.en).forEach((k) => { if (MY[k]) MY[k] = OV.en[k]; });
  } catch (e) { /* 無視 */ }
})();

} catch (e) { try { console.error("[rd] rd_v92i18n.js", e); } catch (x) { } }
/* ==== rd_v92item.js ==== */
try {
/* 貿易クラウドAI商社マン 21.92 item（刷新版の層・rd_v92per.js のあとに読む）
   2026-11-14「8カテゴリー×ペルソナ評価」の、商品情報（item）の画面の刷新版だけの直し。RDX.after を包む（今の部品は差し替えない）。
   数字はアプリが持っているものだけ。押したときの働きは、本体の層（logic_v2192item）の窓（data-v92iact）を呼ぶ。
   ① データの充足度の円：推定のままの HS コードを「入っている」と数えて 100% と出し、横の「全体 20/21・必須 8/9」と食い違った（auto-17）
      → 円・「登録済み／登録中」の札・4つの区分の件数を、同じ数え方（推定の HS は未登録）にそろえる
   ② 足りない項目（必須を含む）を入れる入口が無い（indagri-14）→ 区分の行（「基本情報 一部未入力（2）」）を押すと入れる窓が開く。
      「登録の項目で未登録 N件：…」と「足りない項目を入れる」のボタンを出す。右上の「次は」も、必須が足りない間は「必須の項目を入れる」に
   ③ 商材カテゴリーを、上のカードの札の横で選び直せるようにする（other-02）
   ④ 「未登録の項目へ」は任意の項目へ移るボタンなので、「任意の項目へ」と書く */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v92item) return;
  RD._v92item = 1;
  const { $, $$, esc, I } = RD;
  const call = (n) => { try { return typeof window[n] === "function" ? window[n]() : null; } catch (e) { return null; } };
  const lang = () => { try { const v = String((document.getElementById("lang") || {}).value || "ja"); return /^en/.test(v) ? "en" : /^zh/.test(v) ? "zh" : /^es/.test(v) ? "es" : "ja"; } catch (e) { return "ja"; } };
  const M = (ja, en, zh, es) => { const l = lang(); return l === "en" ? en : l === "zh" ? (zh || en) : l === "es" ? (es || en) : ja; };
  const GROUPS = [["基本情報", ["co", "coEn", "item", "itemEn", "cat", "sku", "hs", "origin", "targets"]], ["価格・取引条件", ["priceRows", "moq", "term", "pay", "lead", "pol"]], ["成分・仕様", ["compRows", "dimRows", "shelf", "ctn", "cert"]], ["強み", ["strengths"]]];

  function fixItem(w) {
    const box = $(".rd-x.rd-p2", w);
    const ring = box && $(".k-ring", box);
    if (!ring || ring.dataset.v92i) return;
    const miss = call("v92itemMiss");
    if (!Array.isArray(miss)) return;
    ring.dataset.v92i = "1";
    const pct = call("v92itemPct");
    const col = ring.closest("div[style*='border-left']") || ring.parentElement.parentElement;
    const missK = miss.map((x) => x.k);
    const req = miss.filter((x) => x.req);
    const pend = !!call("v92itemPending"); // 読み取った内容が未反映の間は、先に「すべて登録する」
    /* ① 円・札・区分の件数 */
    if (pct != null) {
      ring.style.setProperty("--p", String(pct));
      const sp = $("span", ring);
      if (sp) sp.innerHTML = esc(pct) + "<small>%</small>";
      const tg = $$(".k-tag", box).find((x) => /^(登録済み|登録中)$/.test((x.textContent || "").trim()));
      if (tg) { const done = !miss.length; tg.className = "k-tag " + (done ? "gr" : "or"); tg.innerHTML = I("check", 13, 3) + (done ? "登録済み" : "登録中"); }
    }
    const ul = col && $(".k-ck", col);
    if (ul) {
      $$("li", ul).forEach((li) => {
        const nm = ($$("span", li)[1] || {}).textContent || "";
        const g = GROUPS.find((x) => x[0] === nm.trim());
        if (!g) return;
        const ng = g[1].filter((k) => missK.indexOf(k) >= 0);
        const names = miss.filter((x) => ng.indexOf(x.k) >= 0).map((x) => x.n);
        li.innerHTML = `<span class="${ng.length ? "ng" : "ok"}">${I(ng.length ? "alert" : "check", 16, 2.6)}</span><span class="k-v92inm" style="flex:1">${esc(g[0])}</span><b class="k-v92ist"${ng.length ? " data-noi18n" : ""} style="font-size:13px;color:${ng.length ? "#D25F00" : "var(--k-gr)"}">${ng.length ? `${esc(M(`未入力 ${ng.length}件`, `${ng.length} missing`, `未填 ${ng.length} 项`, `Faltan ${ng.length}`))}${pend ? "" : `<span class="k-v92ichev">${I("chevR", 13, 2.8)}</span>`}` : "入力済み"}</b>`;
        if (ng.length && !pend) {
          li.classList.add("k-v92ili");
          li.setAttribute("role", "button");
          li.setAttribute("tabindex", "0");
          li.setAttribute("data-v92iact", "fill");
          li.setAttribute("data-keys", ng.join(","));
          li.setAttribute("title", M("押すと、足りない項目（" + names.join("・") + "）を入れる窓が開きます", "Press to fill in: " + names.join(", "), "点击填写：" + names.join("・"), "Pulse para completar: " + names.join(", ")));
          li.setAttribute("aria-label", M(g[0] + "：一部未入力 " + ng.length + "件（" + names.join("・") + "）。押すと入れる窓が開きます", ng.length + " missing (" + names.join(", ") + "). Press to fill in", ng.length + " 项未填（" + names.join("・") + "）。点击填写", "Faltan " + ng.length + " (" + names.join(", ") + "). Pulse para completar"));
          li.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); li.click(); } });
        }
      });
    }
    /* ② 登録の項目で未登録のもの＋入れるボタン */
    if (col && pend && !$(".k-v92imiss", col)) {
      const n = document.createElement("div");
      n.className = "k-v92imiss";
      n.setAttribute("role", "note");
      n.setAttribute("data-noi18n", "");
      n.innerHTML = `<p>${I("alert", 15, 2.4)}<span>${esc(M("資料から読み取った内容が、まだ反映されていません。先に「すべて登録する」を押すと、読み取った価格表などが入ります。", "What was read from your file is not applied yet. Press “Register all” first to apply the price list and other items.", "从资料读取的内容尚未反映。请先点击“全部登记”。", "Lo leído del archivo aún no se ha aplicado. Pulse primero «Registrar todo»."))}</span></p><button type="button" class="k-btn k-mini" data-v92ipend="1">${I("chevR", 14, 2.6)}${esc(M("未反映の内容へ", "Go to the pending items", "前往未反映的内容", "Ir a lo pendiente"))}</button>`;
      const opt = $(".k-v90opt", col);
      if (opt) col.insertBefore(n, opt); else col.appendChild(n);
      const pb = $("[data-v92ipend]", n);
      if (pb) pb.addEventListener("click", (e) => { e.preventDefault(); const el = document.getElementById("v188pend"); if (el) { try { el.scrollIntoView({ block: "center", behavior: "smooth" }); } catch (x) { el.scrollIntoView(); } el.style.boxShadow = "0 0 0 3px #F57C0F"; setTimeout(() => { el.style.boxShadow = ""; }, 2200); } });
    } else if (col && miss.length && !$(".k-v92imiss", col)) {
      const n = document.createElement("div");
      n.className = "k-v92imiss";
      n.setAttribute("role", "note");
      n.setAttribute("data-noi18n", "");
      const shown = miss.slice(0, 6).map((x) => esc(x.n) + (x.req ? `<small class="k-v92irq">${esc(M("必須", "required", "必填", "obligatorio"))}</small>` : "")).join(M("・", ", ", "・", ", "));
      n.innerHTML = `<p>${I("alert", 15, 2.4)}<span><b>${esc(M(`登録の項目で未登録 ${miss.length}件`, `${miss.length} registration item(s) missing`, `登记项目中有 ${miss.length} 项未填`, `Faltan ${miss.length} campos de registro`))}</b>${req.length ? esc(M(`（うち必須 ${req.length}件）`, ` (${req.length} required)`, `（其中必填 ${req.length} 项）`, ` (${req.length} obligatorios)`)) : ""}${M("：", ": ", "：", ": ")}${shown}${miss.length > 6 ? esc(M(` ほか${miss.length - 6}件`, ` +${miss.length - 6}`, ` 等${miss.length - 6}项`, ` +${miss.length - 6}`)) : ""}</span></p><button type="button" class="k-btn k-mini" data-v92iact="fill">${I("edit", 14)}${esc(M("足りない項目を入れる", "Fill in missing items", "填写缺少的项目", "Completar lo que falta"))}</button>`;
      const opt = $(".k-v90opt", col);
      if (opt) col.insertBefore(n, opt); else col.appendChild(n);
    }
    /* ④ 任意の項目へ */
    const ob = $("[data-v90opt]", col || box);
    if (ob && !ob.dataset.v92i) {
      ob.dataset.v92i = "1";
      const tn = Array.from(ob.childNodes).reverse().find((x) => x.nodeType === 3 && (x.nodeValue || "").trim());
      const lb = M("任意の項目へ", "Go to optional items", "前往可选项目", "Ir a campos opcionales");
      if (tn) tn.nodeValue = lb;
      ob.setAttribute("data-noi18n", "");
      ob.setAttribute("data-kfull", lb);
    }
    /* ③ 商材カテゴリーを選び直す */
    const chips = $(".k-chips", box);
    if (chips && !$("[data-v92iact='cat']", chips)) {
      const cat = $$(".k-tag.gr", chips).find((x) => !/^(登録済み|登録中)$/.test((x.textContent || "").trim()));
      const b = document.createElement("button");
      b.type = "button";
      b.className = "k-v92icatb";
      b.setAttribute("data-v92iact", "cat");
      b.setAttribute("data-noi18n", "");
      b.setAttribute("title", M("商材カテゴリーを選び直す（規制の調べ方・業種ごとの項目に使います）", "Change the product category (used for regulation research and industry-specific fields)", "重新选择商品类别", "Cambiar la categoría del producto"));
      b.innerHTML = I("edit", 12) + esc(cat ? M("変える", "Change", "更改", "Cambiar") : M("商材カテゴリーを選ぶ", "Choose a category", "选择商品类别", "Elegir categoría"));
      if (cat) cat.after(b); else chips.prepend(b);
    }
    /* ② 右上の「次は」：必須が足りない間は、先に入れる */
    const nb = $("[data-rdhero] .k-next", w);
    if (nb && req.length && !pend && !nb.dataset.v92i) {
      nb.dataset.v92i = "1";
      nb.removeAttribute("data-kbc");
      nb.setAttribute("data-v92iact", "fill");
      nb.setAttribute("data-keys", req.map((x) => x.k).join(","));
      nb.setAttribute("title", M("必須の項目（" + req.map((x) => x.n).join("・") + "）を入れてから、販売先国を選ぶと進めやすくなります", "Fill in the required items first (" + req.map((x) => x.n).join(", ") + "), then choose destination countries", "请先填写必填项目（" + req.map((x) => x.n).join("・") + "）", "Complete primero los campos obligatorios (" + req.map((x) => x.n).join(", ") + ")"));
      const bb = $("b", nb);
      if (bb) { bb.textContent = M("必須の項目を入れる（あと" + req.length + "件）", "Fill in required items (" + req.length + " left)", "填写必填项目（还剩" + req.length + "项）", "Completar obligatorios (faltan " + req.length + ")"); bb.setAttribute("data-noi18n", ""); }
    }
  }

  function apply() {
    if (RD.locked && RD.locked()) return;
    const w = $("#well");
    if (!w) return;
    if (RD.curKey() === "item") fixItem(w);
  }
  const prev = RD.after;
  RD.after = function () {
    const r = prev.apply(this, arguments);
    try { apply(); } catch (e) { console.error("[rd v92item]", e); }
    return r;
  };
  try { apply(); } catch (e) { /* 最初の描画の前 */ }
})();

} catch (e) { try { console.error("[rd] rd_v92item.js", e); } catch (x) { } }
/* ==== rd_v92mobile.js ==== */
try {
/* 貿易クラウドAI商社マン 21.92 mobile（刷新版の層・rd_v92*.js のあとに読む）
   2026-11-15「スマホ幅と表示の評価」（xmobile-01〜27）のうち、刷新版が足した部品の直し。今のアプリの関数・前の層は差し替えず、RDX.after を包む。
   ① xmobile-01：スマホ・タブレットで、左メニューの項目を選んでもメニューと暗い幕が残った（荷主：案件・商品・書類をつくる・出荷・受注・この案件の書類／物流会社：全項目）
      原因：メニューを閉じるのは、今のアプリの go()（別の画面へ移るとき）と、今のメニューのボタン（.nb）だけ。刷新版のメニューのボタンは .nb ではなく、
      同じ画面の中の切り替え（dash:home → dash:prod、ops:reg → ops:doc）と物流会社の切り替え（fGo）は go() を通らない → メニューの項目を押したら必ず閉じる
   ② xmobile-08：物流会社のホームで、下のタブ「受信箱」を押しても動かない（ホームのあいだ今のアプリの画面は「受信箱」のままなので、同じ画面と見なされた）
      → ホームにいるときは受信箱へ移す。ホームでは下のタブを選ばれた表示にしない
   ③ xmobile-04：タスク「停滞中の案件」の相手名が切れる → 名前を1行目、日数とボタンを次の行に（rd_v92mobile.css。ここは印を付けるだけ）
   ④ xmobile-07：文字「ゆったり」のホームの一覧（rd_v92mobile.css） */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v92mobile) return;
  RD._v92mobile = 1;
  const { $, $$ } = RD;
  const closeNav = () => { try { document.body.classList.remove("snav"); document.body.classList.remove("navopen"); } catch (e) { /* 無視 */ } };

  /* ① メニューの項目を押したら閉じる（「すべての機能」の開閉は閉じない） */
  document.addEventListener("click", (e) => {
    try {
      const t = e.target && e.target.closest ? e.target.closest("[data-rdk],[data-rdact]") : null; // 前の層が先にメニューを描き直すと、押したボタンはもうメニューの外にある。印だけで見る（メニューの外の同じ印でも、閉じて困ることはない）
      if (!t) return;
      setTimeout(closeNav, 0);
    } catch (x) { /* 無視 */ }
  }, true); // 取り込みの段で受ける（押したあとメニューが描き直され、押したボタンが外れるため）

  /* ② 物流会社のホーム：下のタブ「受信箱」 */
  const fwdHome = () => { try { return RD.isFwd() && RD.curKey() === "fhome"; } catch (e) { return false; } };
  document.addEventListener("click", (e) => {
    try {
      const t = e.target && e.target.closest ? e.target.closest("#tabbar [data-tb]") : null;
      if (!t || !fwdHome()) return;
      if (t.getAttribute("data-tb") === "finbox") { e.stopPropagation(); e.preventDefault(); RD.goKey("finbox"); }
    } catch (x) { /* 無視 */ }
  }, true);
  function tabMark() {
    const tb = $("#tabbar"); if (!tb) return;
    const home = fwdHome();
    if (home) $$(".tb", tb).forEach((b) => { if (b.classList.contains("on") || b.getAttribute("aria-current")) { b.classList.remove("on"); b.removeAttribute("aria-current"); b.setAttribute("data-v92moff", "1"); } });
    else $$(".tb[data-v92moff]", tb).forEach((b) => { b.removeAttribute("data-v92moff"); try { if (RD.isFwd() && b.getAttribute("data-tb") === RD.curKey()) { b.classList.add("on"); b.setAttribute("aria-current", "page"); } } catch (e) { /* 無視 */ } });
  }

  /* ③ 停滞中の案件のカードに印 */
  function markStale(w) {
    $$(".rd-x .k-card", w).forEach((c) => { if (c.classList.contains("k-v92mstale")) return; const h = $("h2, h3", c); if (h && /停滞中の案件/.test(h.textContent || "")) c.classList.add("k-v92mstale"); });
  }

  /* xmobile-18 スマホ（日本語の画面）：資料を入れる枠の「ここにファイルをドラッグ＆ドロップ」→「ここを押してファイルを選ぶ」 */
  function dropCopy(w) {
    let ok = false;
    try { ok = matchMedia("(max-width:820px) and (pointer:coarse)").matches && (typeof I18N === "undefined" || !I18N.lang || I18N.lang === "ja"); } catch (e) { ok = false; } // eslint-disable-line no-undef
    if (!ok) return;
    $$(".rd-drop b", w).forEach((b) => {
      if ((b.textContent || "").replace(/\s+/g, "") !== "ここにファイルをドラッグ＆ドロップ") return;
      const ns = Array.from(b.childNodes).filter((n) => n.nodeType === 3 && (n.nodeValue || "").trim());
      if (ns.length === 2) { ns[0].nodeValue = "ここを押して"; ns[1].nodeValue = "ファイルを選ぶ"; } else if (ns.length === 1) ns[0].nodeValue = "ここを押してファイルを選ぶ";
    });
  }

  /* xmobile-26 案件の詳細（や商品一覧）から別の画面へ進み、ブラウザの「戻る」を押すと、案件一覧（ホーム）に戻っていた
     原因：案件の詳細・商品一覧は、今のアプリでは同じ「ダッシュボード」の画面の中の切り替え（刷新版の dashMode）で、履歴には「ダッシュボード」としか残らない。
           戻ってきたとき、刷新版は「アプリが自分でダッシュボードへ移った＝ホーム」と見なしていた。
     直し：ダッシュボードを離れる前に見ていた中身（案件の詳細・商品一覧）を覚えておき、「戻る」で戻ってきたときはそれを開く */
  let lastDash = "", lastKey = "", popAt = 0;
  try { window.addEventListener("popstate", () => { popAt = Date.now(); }, true); } catch (e) { /* 無視 */ }
  function backFix(k) {
    try { if (RD.isFwd()) return false; } catch (e) { return false; }
    if (k.indexOf("dash:") === 0) {
      if (k === "dash:home" && lastKey && lastKey.indexOf("dash:") !== 0 && lastDash && lastDash !== k) {
        // 「戻る」の合図（popstate）は、画面の描き直しの少しあとに届くことがある → 少し待ってから確かめる
        const want = lastDash; lastKey = k; lastDash = k;
        setTimeout(() => { try { if (Date.now() - popAt < 700 && RD.curKey() === "dash:home") { popAt = 0; RD.goKey(want); } } catch (e) { /* 無視 */ } }, 90);
        return false;
      }
      lastDash = k;
    }
    lastKey = k;
    return false;
  }

  function apply() {
    const w = $("#well");
    tabMark();
    if (!w) return;
    let k = ""; try { k = RD.curKey(); } catch (e) { k = ""; }
    if (k && backFix(k)) return;
    if (k === "today") markStale(w);
    if (k === "up" || k === "item") dropCopy(w);
  }
  const prev = RD.after;
  RD.after = function () {
    const r = prev.apply(this, arguments);
    try { apply(); } catch (e) { console.error("[rd v92mobile]", e); }
    return r;
  };
  try { apply(); } catch (e) { /* 最初の描画の前 */ }
  try { const tb = $("#tabbar"); if (tb) new MutationObserver(() => { try { tabMark(); } catch (e) { /* 無視 */ } }).observe(tb, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] }); } catch (e) { /* 無視 */ }
})();

} catch (e) { try { console.error("[rd] rd_v92mobile.js", e); } catch (x) { } }
/* ==== rd_v92ops.js ==== */
try {
/* 貿易クラウドAI商社マン 21.92 ops（刷新版の層・rd_v92per.js のあとに読む）
   2026-11-14 の「8カテゴリー×ペルソナ評価」の、規制を調べる（ops:reg）の刷新版だけの課題。
   ① 「商品に合わせて表を直しました」などの枠（.info の箱）が、枠ごと2行でたたまれ、3行目が枠の下端で半分だけ見えていた
      （長い説明文を2行でたたむ仕組みが、段落の入った箱にも当たっていた）→ 箱はたたまない（中の長い段落は、今までどおり段落ごとにたたむ）
   今のアプリの関数・刷新版の前の層は差し替えず、RDX.after を包む。国を切り替えたとき（#rO の中だけ描き直る）にも効くよう、#rO を見張る。 */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v92ops) return;
  RD._v92ops = 1;
  const { $$ } = RD;
  // 段落や見出しを中に持つ箱か（＝文ではなく枠）
  const isBox = (el) => !!el.querySelector(":scope > p, :scope > b, :scope > ul, :scope > div");
  const drop = (el) => { if (el && el.parentNode) el.parentNode.removeChild(el); };
  function unclamp(root) {
    $$(".info", root).forEach((el) => {
      if (el.closest(".rd-x") || !isBox(el)) return;
      // これからたたまれないように印を付け、もうたたまれていたら戻す
      el.dataset.rdcl = "1";
      el.classList.add("k-v92open");
      if (el.style.overflow === "hidden" || (el.style.webkitLineClamp && el.style.webkitLineClamp !== "unset")) {
        el.style.webkitLineClamp = "unset"; el.style.display = "block"; el.style.overflow = "visible";
      }
      const nx = el.nextElementSibling;
      if (nx && nx.classList.contains("rd-more")) drop(nx);
    });
  }
  function apply() {
    if (RD.locked && RD.locked()) return;
    if (RD.curKey() !== "ops:reg") return;
    const box = document.getElementById("rO");
    if (!box) return;
    unclamp(box);
    if (!box._v92mo) {
      box._v92mo = new MutationObserver(() => { try { unclamp(box); } catch (e) { /* 次の描き直しで */ } });
      box._v92mo.observe(box, { childList: true });
    }
  }
  const prev = RD.after;
  RD.after = function () {
    try { apply(); } catch (e) { console.error("[rd v92ops]", e); } // たたむ前に印を付ける
    const r = prev.apply(this, arguments);
    try { apply(); } catch (e) { console.error("[rd v92ops]", e); }
    return r;
  };
  try { apply(); } catch (e) { /* 最初の描画の前 */ }
})();

} catch (e) { try { console.error("[rd] rd_v92ops.js", e); } catch (x) { } }
/* ==== rd_v92per.js ==== */
try {
/* 貿易クラウドAI商社マン 21.92 per（刷新版の層・rd_v91smp.js のあとに読む）
   2026-11-14 の「8カテゴリー×ペルソナ評価」（食品／生活用品／工業・農業／健康・美容／医療・衛生／自動車・建機／文化・教育／その他 ×
   貿易素人・少し経験者・商社経験豊富、＋物流会社・ログイン・スマホ・言語・管理者）で見つかった、刷新版だけの課題の直し。
   今のアプリの関数・刷新版の前の層は差し替えず、RDX.after を包む（rd_v89fwd.js などと同じ形）。数字はアプリが持っているものだけ。
   ① 左のメニュー「すべての機能」の札（未読・対応待ちの合計）が、絵と「す」の字に重なっていた → ボタンの右上の角へ（rd_v92per.css）
   ② タスク（今日やること）の「停滞中の案件」：一覧は3件までなのに、札も「3件」と出て、下の見直しの件数（全件）と食い違った → 札は全件・一覧は「ほか N件」
   ③ 商品の登録・商品情報の「AIヒアリング」の箱：商材カテゴリーの質問の選択肢が先頭の4つだけ出て、ほかの業種は選べないように見えた
      → 8つの大カテゴリー（本体の層 logic_v2192cat の V92_GROUPS）を出す
   ④ 販売先国の選定：上位3か国のカードとレーダーが、データの無い観点を「0」（赤）と出し、下の表の「未評価」と食い違った → 「未評価」に。
      国の詳細を開くと上のカードが「選択中 0／3」になり、詳細は画面の下に出ていた → 詳細の間は上のカードをたたみ、詳細の見出しへ送る
   ⑤ 「？ 説明」が2つ並ぶ → 同じ場所の説明は1つの「？」にまとめる
   ⑥ AIヒアリングの箱：選択肢が押せるボタンに見える・質問が途中で切れる → 「選択肢の例」の見た目に・切れた文には「…」
   ⑦ 右下の「AI商社マンに聞く」が表やボタンに重なる → 下へ送ったら丸い小さなボタンに・画面のいちばん下に余白 */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v92per) return;
  RD._v92per = 1;
  const { $, $$, esc } = RD;
  const DAY = 864e5;
  const threads = () => { try { return RD.dbThreads() || []; } catch (e) { return []; } };
  const isStale = (x) => x.at && (Date.now() - x.at) / DAY >= 30 && RD.stShort(x.st) !== "失注" && RD.stShort(x.st) !== "取引中";
  const drop = (el) => { if (el && el.parentNode) el.parentNode.removeChild(el); };

  /* ② タスク（今日やること）：停滞中の案件の件数 */
  function fixToday(w) {
    const card = $$(".rd-x .k-card", w).find((c) => { const h = $("h2, h3", c); return h && /停滞中の案件/.test(h.textContent || ""); });
    if (!card || card.dataset.v92) return;
    const all = threads().filter(isStale);
    const shown = $$(".k-rows > .k-row", card).length;
    card.dataset.v92 = "1";
    if (all.length <= shown) return;
    const tag = $$(".k-tag", card).find((t) => /^\d+件$/.test((t.textContent || "").trim()));
    if (tag) tag.textContent = all.length + "件";
    const rows = $(".k-rows", card);
    if (rows && !$(".k-v92more", card)) rows.insertAdjacentHTML("afterend", '<p class="k-v92more">ほか ' + (all.length - shown) + "件（下の「動きのない相手の見直し」に全部あります）</p>");
  }

  /* ③ AIヒアリングの箱：商材カテゴリーの質問は 8つの大カテゴリーで見せる */
  function fixHearCats(w) {
    const G8 = window.V92_GROUPS;
    if (!Array.isArray(G8)) return;
    $$("[data-rdprod] .rd-warm > div", w).forEach((q) => {
      if (q.dataset.v92 || !/商材カテゴリ/.test(q.textContent || "")) return;
      const tags = $$(".rd-tag", q);
      if (!tags.length) return;
      q.dataset.v92 = "1";
      const box = tags[0].parentElement;
      box.setAttribute("data-noi18n", "");
      box.innerHTML = G8.map((g) => '<span class="rd-tag bl k-v92cat" title="' + esc(g.hint) + '">' + esc(g.ja) + "</span>").join("");
      box.insertAdjacentHTML("afterend", '<p class="k-v92catn">8つの分類から、近いものを選べます（細かい種類はそのあとで）。</p>');
    });
  }

  /* ④ 販売先国の選定：データの無い観点は「0」ではなく「未評価」（下の表・詳細と同じ言い方に） */
  const AXK = { 市場性: "mkt", 規制: "reg", 競合: "comp", 拠点: "base" };
  const isNA = (sc, k) => !sc || sc[k] == null || (Array.isArray(sc.na) && sc.na.indexOf(k) >= 0);
  function fixCty(w) {
    const box = $(".rd-x.rd-p2", w);
    if (!box) return;
    // 国の詳細（国別戦略）を開いている間は、上のおすすめのカードをたたむ（選択中 0／3 と出て、選んだ国が消えたように見えていた）
    const deep = $$("[data-onclick]", w).some((b) => !b.closest(".rd-x") && /ctyDeepClose/.test(b.getAttribute("data-onclick") || ""));
    box.classList.toggle("k-v92deep", deep);
    if (deep) {
      if (!$(".k-v92deepn", box)) box.insertAdjacentHTML("afterbegin", '<p class="k-v92deepn">国別の詳細を表示しています。おすすめの3か国と選択中の国は、下の「← 一覧へ戻る」で戻ると表示されます（選んだ国はそのまま残っています）。</p>');
      if (!w.dataset.v92deep) {
        w.dataset.v92deep = "1";
        const h = $$(".lbl", w).find((x) => /COUNTRY DEEP-DIVE/.test(x.textContent || ""));
        if (h) setTimeout(() => { try { h.scrollIntoView({ block: "start" }); window.scrollBy(0, -90); } catch (e) { /* 無視 */ } }, 60);
      }
      return;
    }
    delete w.dataset.v92deep;
    const all = RD.recCty ? RD.recCty() : [];
    const rows = [];
    $$(".k-tiles > .k-card", box).forEach((card) => {
      const btn = $("[data-rdcty]", card);
      const r = btn ? all.find((x) => x.c === btn.getAttribute("data-rdcty")) : null;
      if (!r || !r.sc) return;
      rows.push(r);
      if (card.dataset.v92) return;
      card.dataset.v92 = "1";
      $$("[title]", card).forEach((cell) => {
        const m = /^(市場性|規制|競合|拠点)：/.exec(cell.getAttribute("title") || "");
        if (!m || !isNA(r.sc, AXK[m[1]])) return;
        const b = $("b", cell);
        if (b) { b.textContent = "未評価"; b.classList.add("k-v92na"); b.style.color = ""; }
        cell.setAttribute("title", m[1] + "：未評価（この国のデータが無いため、配点から外しています。0点ではありません）");
      });
    });
    // レーダー：未評価の観点には線を引かない（0点に見えないように）
    const svg = $('svg[aria-label="主要指標の比較"]', box);
    if (svg && !svg.dataset.v92 && rows.length) {
      svg.dataset.v92 = "1";
      const AX = ["mkt", "reg", "comp", "base"], cx = 150, cy = 135, R = 100, col = ["#F57C0F", "#1F6FD1", "#14995A"];
      const pt = (i, v) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 4, r = (R * Math.max(0, Math.min(100, v))) / 100; return [(cx + r * Math.cos(a)).toFixed(1), (cy + r * Math.sin(a)).toFixed(1)]; };
      if (rows.some((r) => AX.some((k) => isNA(r.sc, k)))) {
        $$("polygon[fill-opacity]", svg).forEach(drop);
        let g = "";
        rows.forEach((r, j) => {
          const P = AX.map((k, i) => (isNA(r.sc, k) ? null : pt(i, +r.sc[k] || 0))).filter(Boolean);
          if (P.length >= 3) g += '<polygon points="' + P.map((x) => x.join(",")).join(" ") + '" fill="' + col[j] + '" fill-opacity=".14" stroke="' + col[j] + '" stroke-width="2.2"/>';
          else if (P.length === 2) g += '<polyline points="' + P.map((x) => x.join(",")).join(" ") + '" fill="none" stroke="' + col[j] + '" stroke-width="2.2"/>';
          P.forEach((x) => { g += '<circle cx="' + x[0] + '" cy="' + x[1] + '" r="3.2" fill="' + col[j] + '"/>'; });
        });
        svg.insertAdjacentHTML("beforeend", g);
        const naAll = AX.filter((k) => rows.every((r) => isNA(r.sc, k)));
        const names = { mkt: "市場性", reg: "規制", comp: "競合", base: "拠点" };
        if (!$(".k-v92nan", box) && naAll.length) svg.insertAdjacentHTML("afterend", '<p class="k-v92nan">' + esc(naAll.map((k) => names[k]).join("・")) + "は未評価です（この国のデータが無いため、点を付けず、総合点の配点からも外しています）。</p>");
      }
    }
  }

  /* ⑤ 「？ 説明」が2つ並ぶ：同じ場所の説明は1つの「？」にまとめる */
  function mergeQlines(w) {
    const seen = new Map();
    $$(".k-qline", w).forEach((ql) => {
      const par = ql.parentElement;
      const first = seen.get(par);
      if (!first) { seen.set(par, ql); return; }
      // 間に見える本文をはさまないときだけ、前の「？」へまとめる
      let n = first.nextElementSibling, between = false;
      while (n && n !== ql) {
        if (!n.classList.contains("k-qhide") && !n.classList.contains("k-qline") && (n.textContent || "").trim() && n.offsetParent !== null) { between = true; break; }
        n = n.nextElementSibling;
      }
      if (between) { seen.set(par, ql); return; }
      const q0 = $(".k-q", first), q = $(".k-q", ql);
      if (q0 && q) q0.dataset.kq = (q0.dataset.kq || "") + "\n\n" + (q.dataset.kq || "");
      drop(ql);
    });
  }

  /* ⑥ AIヒアリングの箱：選択肢は「例」の見た目に（押せるボタンに見えていた）。途中で切れた質問には「…」 */
  function fixHearCard(w) {
    $$("[data-rdprod] .rd-warm > div", w).forEach((q) => {
      if (q.dataset.v92h) return;
      const bs = $$(":scope > b", q);
      if (bs.length < 2) return;
      q.dataset.v92h = "1";
      const t = bs[1];
      const tx = (t.textContent || "").trim();
      if (tx.length >= 46 && !/[？?。]$/.test(tx)) t.textContent = tx + "…";
      const tags = $$(".rd-tag", q);
      if (tags.length && !tags[0].classList.contains("k-v92cat")) {
        tags.forEach((x) => x.classList.add("k-v92ex"));
        if (!$(".k-v92exl", q)) tags[0].parentElement.insertAdjacentHTML("afterbegin", '<span class="k-v92exl">選択肢の例：</span>');
      }
    });
  }

  /* ⑦ 右下の「AI商社マンに聞く」：下へ送ったら丸い小さなボタンにする（表やボタンに重なる面積を減らす） */
  function fabWatch() {
    if (RD._v92fab) return;
    RD._v92fab = 1;
    const upd = () => { const f = document.getElementById("askfab"); if (f) f.classList.toggle("k-v92min", (window.scrollY || 0) > 160); };
    window.addEventListener("scroll", upd, { passive: true });
    upd();
  }

  /* ⑧ はじめての窓：「画面上部のオレンジのバーが…」は今の版の言い方。刷新版では見出しの右の「次は」のボタン */
  function fixWelcome() {
    const v = document.getElementById("welv");
    if (!v || v.dataset.v92) return;
    v.dataset.v92 = "1";
    $$("span, p", v).forEach((el) => {
      if (el.children.length === 0 && /オレンジのバー/.test(el.textContent || "")) el.textContent = "どの画面でも、見出しの右の「次は」のボタンが、次にやることを教えてくれます。";
    });
  }

  function apply() {
    try { fixWelcome(); } catch (e) { /* 無視 */ }
    if (RD.locked && RD.locked()) return;
    const w = $("#well");
    if (!w) return;
    const k = RD.curKey();
    if (k === "today") fixToday(w);
    if (k === "up" || k === "item") { fixHearCats(w); fixHearCard(w); }
    if (k === "cty") fixCty(w);
    mergeQlines(w);
    fabWatch();
  }
  const prev = RD.after;
  RD.after = function () {
    const r = prev.apply(this, arguments);
    try { apply(); } catch (e) { console.error("[rd v92per]", e); }
    return r;
  };
  try { apply(); } catch (e) { /* 最初の描画の前 */ }
})();

} catch (e) { try { console.error("[rd] rd_v92per.js", e); } catch (x) { } }
/* ==== rd_v92up.js ==== */
try {
/* 貿易クラウドAI商社マン 21.92 up（刷新版の層・rd_v92per.js のあとに読む）
   2026-11-14 の「8カテゴリー×ペルソナ評価」のうち、商品情報を登録・商品情報の上のカード（刷新版が足した部品）の直し。
   今のアプリの関数・刷新版の前の層は差し替えず、RDX.after を包む。数字・文はアプリが持っているものだけ。
   ① 「読み取り結果」の「規格」の欄：登録の前は品番、あとは梱包の文が入っていた（culture-17・indagri-19・auto-06）
      → 「品番」と「梱包・入数」（車両・機械は「積み方」）に分ける。「建値」は 取引条件＋仕出港（FOB 横浜港）
   ② 「AIヒアリング」の箱：質問の順番が、実際に聞かれる順（重要な順）と違った（medical-02）。質問が途中で切れた（auto-16・daily-19・food-16・medical-12）
      → 本体の層（logic_v2192up の v92upHearOrder）の順で、質問の1文目を全部出す。仕出港は所在地に近い港を先に（other-12）
   ③ 情報がそろったあと、登録した取引条件・支払条件・仕出港を見る・直す場所への入口（auto-04）
   ④ ヒアリングを開いている間に上の「AIの質問に答える」を押すと、会話が最初からになっていた → いまの質問の欄へ送るだけ
   ⑤ ホーム「はじめの設定 次：足りない情報を埋める」→ 登録メニューを通らず、質問の欄へ直接（other-07・indagri-12） */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v92up) return;
  RD._v92up = 1;
  const { $, $$, esc } = RD;
  const ten = () => { try { return RD.G("TEN") || null; } catch (e) { return null; } };
  const isJa = () => { const s = document.getElementById("lang"); return !s || !s.value || /^ja/.test(s.value); };
  const L = (ja, en) => (isJa() ? ja : en);

  /* ① 読み取り結果：品番／梱包・入数／建値 */
  function fixKv(card, T) {
    const dl = $("dl.rd-kv", card);
    if (!dl || dl.dataset.v92up) return;
    dl.dataset.v92up = "1";
    const dts = $$("dt", dl);
    const row = (re) => { const dt = dts.find((x) => re.test((x.textContent || "").trim())); return dt ? [dt, dt.nextElementSibling] : null; };
    const put = (dd, v) => { if (!dd) return; const s = String(v || "").trim(); dd.textContent = s || "未入力"; dd.title = s; dd.classList.toggle("miss", !s); };
    const spec = row(/^規格/);
    if (spec) {
      let kind = "";
      try { kind = window.v92upKindOf ? window.v92upKindOf(T) : ""; } catch (e) { kind = ""; }
      spec[0].textContent = "品番";
      put(spec[1], T.sku);
      const dt = document.createElement("dt"), dd = document.createElement("dd");
      dt.textContent = kind === "machine" || kind === "car" ? "積み方" : "梱包・入数";
      put(dd, T.ctn);
      spec[1].after(dt, dd);
    }
    const term = row(/^建値/);
    if (term) {
      const t = String(T.term || "").trim(), p = String(T.pol || "").trim();
      const plain = /^[A-Za-z&]{3}$/.test(t);
      put(term[1], t ? (p && plain ? t + " " + p : t) : "");
      if (t && p && plain) term[1].title = L("取引条件 " + t + "／仕出港 " + p, "Terms " + t + " / Port " + p);
    }
  }

  /* ② AIヒアリングの箱：実際に聞く順・質問の文は切らない */
  function fixQs(card) {
    const warm = $(".rd-warm", card);
    if (!warm || warm.dataset.v92up || typeof window.v92upHearOrder !== "function") return;
    if (/既存の商品は表示していません/.test((($("#well") || {}).textContent) || "")) return; // 新しい会社の登録の表示（質問の例）はそのまま
    const olds = $$(":scope > div", warm).filter((d) => !d.classList.contains("rd-askhd") && !d.classList.contains("rd-empty") && $$(":scope > b", d).length >= 2);
    if (!olds.length) return;
    let Q = [];
    try { Q = window.v92upHearOrder() || []; } catch (e) { Q = []; }
    if (!Q.length) return;
    warm.dataset.v92up = "1";
    const G8 = Array.isArray(window.V92_GROUPS) ? window.V92_GROUPS : null;
    const html = Q.slice(0, 2).map((q, i) => {
      let chips = "";
      if (q.k === "cat" && G8) chips = `<div class="k-v92upqc" data-noi18n>${G8.map((g) => `<span class="rd-tag bl k-v92cat" title="${esc(g.hint)}">${esc(g.ja)}</span>`).join("")}</div><p class="k-v92catn">8つの分類から、近いものを選べます（細かい種類はそのあとで）。</p>`;
      else if (q.chips && q.chips.length) chips = `<div class="k-v92upqc"><span class="k-v92exl">選択肢の例：</span>${q.chips.slice(0, 5).map((c) => `<span class="rd-tag bl k-v92ex">${esc(c)}</span>`).join("")}</div>`;
      return `<div class="k-v92upq" data-v92="1" data-v92h="1"><b class="k-v92upqn">Q${i + 1}</b><b class="k-v92upqt" title="${esc(q.q)}">${esc(q.q || q.n)}</b>${chips}</div>`;
    }).join("");
    olds[0].insertAdjacentHTML("beforebegin", html);
    olds.forEach((d) => d.parentNode.removeChild(d));
    if (Q.length > 2 && !$(".k-v92upqm", warm)) {
      const b = $("#rdfill", warm);
      if (b) b.insertAdjacentHTML("beforebegin", `<p class="k-v92upqm" data-noi18n>${esc(L("ほかに " + (Q.length - 2) + "項目（重要な順に、1つずつ伺います）", (Q.length - 2) + " more item(s), asked one by one"))}</p>`);
    }
  }

  /* ③ そろったあと：登録した内容を見る・直す場所への入口 */
  function fixDone(card, mode) {
    const warm = $(".rd-warm", card), b = $("#rdfill", card);
    if (!warm || !b || mode !== "up" || $(".k-v92updone", warm)) return;
    if (!$(".rd-empty", warm)) return;
    b.insertAdjacentHTML("afterend", `<button type="button" class="k-link k-v92updone" data-v92upitem="1">登録した内容を見る・直す（商品情報）</button>`);
  }

  function apply() {
    if (RD.locked && RD.locked()) return;
    const w = $("#well");
    if (!w) return;
    const k = RD.curKey();
    if (k !== "up" && k !== "item") return;
    const card = $("[data-rdprod]", w), T = ten();
    if (!card || !T) return;
    try { fixKv(card, T); } catch (e) { console.error("[rd v92up] kv", e); }
    try { fixQs(card); } catch (e) { console.error("[rd v92up] qs", e); }
    try { fixDone(card, k); } catch (e) { console.error("[rd v92up] done", e); }
  }
  const prev = RD.after;
  RD.after = function () {
    const r = prev.apply(this, arguments);
    try { apply(); } catch (e) { console.error("[rd v92up]", e); }
    return r;
  };
  try { apply(); } catch (e) { /* 最初の描画の前 */ }

  /* ④⑤ 押したときの行き先（今のアプリのボタンより先に見る） */
  document.addEventListener("click", (e) => {
    try {
      const t = e.target;
      if (!t || !t.closest) return;
      if (t.closest("[data-v92upitem]")) { e.preventDefault(); e.stopPropagation(); RD.goKey("item"); return; }
      // ④ ヒアリングを開いている間の「AIの質問に答える」＝いまの質問の欄へ（会話を最初からにしない）
      if (t.closest("#rdfill") && typeof window.v92upHearing === "function" && window.v92upHearing()) {
        e.preventDefault(); e.stopImmediatePropagation();
        window.v92upShowBox();
        return;
      }
      // ⑤ ホーム「はじめの設定 次：足りない情報を埋める」
      const pill = t.closest('.k-pill[data-kbc="up"]');
      if (pill && /足りない|missing|缺少|falta/i.test(pill.textContent || "") && typeof window.v92upHearGo === "function") {
        if (window.v92upHearGo()) { e.preventDefault(); e.stopImmediatePropagation(); }
      }
    } catch (x) { console.error("[rd v92up] click", x); }
  }, true);
})();

} catch (e) { try { console.error("[rd] rd_v92up.js", e); } catch (x) { } }
/* ==== rd_v92z1r3a.js ==== */
try {
/* 貿易クラウドAI商社マン 21.92 r3a の刷新版の層（rd_v92flow.js のあとに読む）
   ① 案件一覧・案件の詳細の「次の行動」：商談の記録から作った案件（まだ送っていない）は、記録した「次の行動・期限」を出す
      （出どころは本体の層 v92r3a.next＝バイヤー一覧の「次のアクション」と同じ）。記録に次の行動が無いときだけ「最初の連絡を送る」
      （auto-M02・medical-M02・health-M07・other-M03）
   ② 「要対応」の数：受信箱で「済み・あとで」にした分を、案件一覧のタブ・やりとりの札に内訳で書く（daily-N08）
   ほかは下の各ブロックの頭に書く */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v92r3a) return;
  RD._v92r3a = 1;
  const { $, $$, esc } = RD;
  const safe = (fn) => { try { return fn(); } catch (e) { return undefined; } };
  const A = () => window.v92r3a || {};
  const G = (n) => { try { return RD.G ? RD.G(n) : undefined; } catch (e) { return undefined; } };
  const isFwd = () => { const S = G("SES"); return !!(S && (S.role === "fwd" || S.t === "fwd")); };
  const caseByKey = (k) => (safe(() => RD.allCases()) || []).find((c) => c.key === k) || null;
  const logOnly = (c) => !!(c && c.th && A().logOnly && A().logOnly(c.th));
  const setTxt = (el, t) => { const n = Array.from(el.childNodes).find((x) => x.nodeType === 3); if (n) n.nodeValue = t; else el.insertBefore(document.createTextNode(t), el.firstChild); };
  const nxSub = (N) => [N.due ? "期限 " + N.due + (N.when && N.when !== N.due ? "（" + N.when + "）" : "") : "期限なし", "商談の記録の「次の行動」（相手にはまだ送っていません）"].join("・");

  // 送ったあとの案件（相手の返事待ち）で、記録した次の行動があるとき（culture-M06）
  const nxSubW = (N, c) => [N.due ? "期限 " + N.due + (N.when && N.when !== N.due ? "（" + N.when + "）" : "") : "期限なし", "記録した次の行動", (c.next && c.next.kind === "follow") ? c.next.t : "相手の返事待ち"].join("・");

  /* ① 案件一覧 */
  function fixHome(w) {
    const body = $("#k-clbody", w);
    if (!body) return;
    const paint = () => {
      const ord = RD._caseOrder || [];
      $$("tr.k-clrow", body).forEach((tr, i) => {
        if (tr.dataset.r3a) return;
        tr.dataset.r3a = "1";
        const c = caseByKey(ord[i]);
        if (!c || c.ss === "失注") return;
        const lo = logOnly(c), wt = !lo && c.next && (c.next.kind === "wait" || c.next.kind === "follow");
        if (!lo && !wt) return; // 返信が要る案件は「返信する」が先
        const N = safe(() => A().next(c.id));
        const nx = $(".c-nx > span", tr);
        if (!nx || !N || !N.t) return;
        let sm = $("small", nx);
        setTxt(nx, N.t.length > 34 ? N.t.slice(0, 33) + "…" : N.t);
        nx.title = N.t;
        if (!sm) { sm = document.createElement("small"); nx.appendChild(sm); }
        sm.textContent = lo ? nxSub(N) : nxSubW(N, c);
        const td = nx.closest("td"); if (td && N.od) td.classList.add("k-r3aod");
      });
    };
    paint();
    if (!body.dataset.r3ao) { body.dataset.r3ao = "1"; new MutationObserver(() => paint()).observe(body, { childList: true }); }
    needNote(w);
  }
  /* ① 案件の詳細 */
  function fixCase(w) {
    const box = $(".k-cd", w);
    if (!box || box.dataset.r3a) return;
    box.dataset.r3a = "1";
    const c = RD._case0;
    const p = $(".k-cdnx", box);
    if (!p || !c || c.ss === "失注") return;
    const lo = logOnly(c), wt = !lo && c.next && (c.next.kind === "wait" || c.next.kind === "follow");
    if (!lo && !wt) return;
    const N = safe(() => A().next(c.id));
    if (!N || !N.t) return;
    let sm = $("small", p);
    setTxt(p, N.t);
    if (!sm) { sm = document.createElement("small"); p.appendChild(sm); }
    sm.textContent = lo ? nxSub(N) : nxSubW(N, c);
  }

  /* ② 「要対応」の内訳 */
  function needInfo() { return safe(() => A().needInfo && A().needInfo()) || null; }
  function needNote(w) {
    const S = needInfo();
    const tab = $('[data-kclf="todo"]', w);
    if (!tab) return;
    let n = $(".k-r3ann", w);
    if (!S || !S.done) { if (n) n.remove(); return; }
    const txt = `「要対応」${S.all}件のうち ${S.done}件は、受信箱で「済み／あとで」にした分です（相手への返信はまだ記録されていません。上の「返信が要る」と受信箱は、この分を除いた ${S.all - S.done}件）。`;
    if (!n) { n = document.createElement("p"); n.className = "k-r3ann"; const tool = tab.closest(".k-cltool"); if (tool) tool.after(n); else return; }
    n.textContent = txt;
  }
  function fixMsg(w) {
    const S = needInfo();
    if (!S || !S.done) return;
    const tile = $$(".rd-p2 .k-tile", w).find((x) => /^要対応/.test(((($(".k-tl", x) || {}).textContent) || "").trim()));
    const s = tile && $(".k-ts", tile);
    if (s && !s.dataset.r3a) { s.dataset.r3a = "1"; s.textContent = `相手から届いて、まだ返していない相手。うち ${S.done}件は受信箱で「済み／あとで」にした分（受信箱の「返信」はそれを除いた ${S.all - S.done}件）`; }
  }

  /* ③ 右上の「次は」（商品情報を登録・商品情報）：はじめの設定の手順（ホームの「次は」・手順の帯と同じ出どころ＝RD.exportSteps）に合わせる
        （daily-M01・medical-M03・health-M04・indagri-M07・other-N16）。商品がまだ無い間・必須の項目が足りない間の案内はそのまま */
  const curStep = () => { const S = safe(() => (RD.exportSteps ? RD.exportSteps() : [])) || []; if (!S.length || S[0].st !== "done") return null; return S.find((s) => s.st === "on") || null; };
  function fixNext(w, k) {
    if (k !== "up" && k !== "item") return;
    const b = $("[data-rdhero] .k-next", w);
    if (!b || b.dataset.v92i) return; // 商品情報の「必須の項目を入れる」はそのまま
    const s = curStep();
    if (!s) {
      const t0 = G("TEN");
      if (k === "up" && b.dataset.v92eDrop && t0 && (t0.item || t0.file)) {
        // 商品はある（手順1の途中、または全部済み）：「下の枠へ」ではなく、元の「商品情報を確かめる」に戻す
        b.dataset.kbc = b.dataset.v92eKbc || "item"; delete b.dataset.v92eDrop;
        const bb = $("b", b); if (bb && b.dataset.v92eOld) bb.textContent = b.dataset.v92eOld;
        b.title = "次の手順：" + ((bb && bb.textContent) || "");
      }
      return;
    }
    const bb = $("b", b);
    if (!bb) return;
    if (b.dataset.r3ago === s.t && bb.textContent === s.t) return;
    b.removeAttribute("data-kbc"); delete b.dataset.v92eDrop;
    b.dataset.r3ago = s.t;
    bb.textContent = s.t;
    b.title = "次の手順：" + s.t + "（はじめの設定の、いまの手順）";
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest(".k-next[data-r3ago]");
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    const s = curStep();
    if (s && typeof s.go === "function") s.go();
  }, true);

  /* ④ 案件の詳細の「返信の文案」「見積の出し方」など：AI商社マンの画面へ移る前に一言（auto-N12） */
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest(".k-cd .k-chip");
    if (!b || isFwd()) return;
    const k0 = RD.curKey ? RD.curKey() : "";
    setTimeout(() => {
      try {
        const k1 = RD.curKey ? RD.curKey() : "";
        if (k0 === "dash:case" && k1 === "ai") toast("AI商社マンの画面に移って答えます。案件へは、左の「案件」から戻れます。"); // eslint-disable-line no-undef
      } catch (x) { /* 無視 */ }
    }, 350);
  }, true);

  /* ⑤ 「やり取り中の相手」の数（daily-M05）：今日やることの札は、分析・商談と同じ数え方（失注・終了を除く＝v70dealDashCalc）に。
        AIバイヤー開拓の一覧（失注を含む・直接連絡のある相手）は「連絡した相手」と呼ぶ */
  function fixToday(w) {
    const n = safe(() => v70dealDashCalc().n); // eslint-disable-line no-undef
    const tile = $$(".rd-x .k-tile", w).find((x) => (((($(".k-tl", x) || {}).textContent) || "").trim() === "やりとり中の相手"));
    if (tile && typeof n === "number" && !tile.dataset.r3a) {
      tile.dataset.r3a = "1";
      const tn = $(".k-tn", tile);
      if (tn) { const u = $("small", tn); tn.textContent = String(n); if (u) tn.appendChild(u); }
      tile.title = "失注・終了を除く（商談・バイヤー、分析・レポートと同じ数え方）";
      const l = $(".k-tl", tile); if (l) l.textContent = "やりとり中の相手（失注を除く）";
    }
    dueCard(w);
  }
  function fixDb(w) {
    $$(".rd-x .rd-card .rd-ch", w).forEach((ch) => {
      const h = $("h2", ch), s = $(".rd-chs", ch);
      if (!h || h.textContent !== "やり取り中のバイヤー" || !s || s.dataset.r3a) return;
      s.dataset.r3a = "1";
      const t0 = G("TEN"); const lost = (safe(() => RD.allCases()) || []).filter((c) => c.t === t0 && c.ss === "失注").length;
      h.textContent = "連絡した相手";
      s.textContent = s.textContent.replace(/）$/, lost ? `・うち失注 ${lost}社）` : "）");
      s.title = "直接連絡のやりとりがある相手（失注を含む）。「やり取り中」の数（失注を除く）は、商談・バイヤーと分析・レポートに出ます";
    });
  }

  /* ⑥ 今日やること：期限切れ・今日までのタスク（health-M08・indagri-N06）。タスク・進行と同じ数え方（taskStats・アプリの日付） */
  function dueCard(w) {
    const x0 = $(".rd-x", w);
    if (!x0 || $(".k-r3adue", w)) return;
    const all = (safe(() => (taskStats() || {}).all) || []); // eslint-disable-line no-undef
    const td = String(safe(() => TODAYS) || "").slice(0, 10); // eslint-disable-line no-undef
    if (!td) return;
    const L = all.filter((t) => t && t.e && !/^(完了|中止)$/.test(String(t.st || "")) && String(t.e).slice(0, 10) <= td).sort((a, b) => String(a.e).localeCompare(String(b.e)));
    if (!L.length) return;
    const row = (t) => { const od = String(t.e).slice(0, 10) < td; return `<div class="k-row"><span class="k-tag ${od ? "rd" : "or"}">${od ? "期限切れ" : "今日まで"}</span><span class="k-rt"><b>${esc(t.n || "")}</b><small>期限 ${esc(String(t.e).slice(0, 10))}${t.w ? "・担当 " + esc(t.w) : ""}</small></span></div>`; };
    const sec = document.createElement("section");
    sec.className = "k-card k-r3adue";
    sec.setAttribute("style", "margin-bottom:18px;padding:14px 18px");
    sec.innerHTML = `<div class="k-h" style="margin-bottom:10px"><h2 style="font-size:18px">期限が今日まで・期限切れのタスク</h2><span class="k-hs">（${L.length}件。タスク・進行と同じ数え方）</span></div><div class="k-rows">${L.slice(0, 6).map(row).join("")}</div>${L.length > 6 ? `<p class="k-r3ann">ほか ${L.length - 6}件</p>` : ""}<button type="button" class="k-btn ghost" style="margin-top:10px" data-kbc="task">タスク・進行で開く</button>`;
    x0.insertBefore(sec, x0.firstChild);
  }

  /* ⑦ タスク・進行の「次にやること」の行を押すとタスクが開く（health-M15）：下の一覧の同じタスクの行と同じ動き */
  function fixTaskRows(w) {
    const card = $$(".rd-x .k-card", w).find((c) => { const h = $("h2", c); return h && /^次にやること/.test(h.textContent || ""); });
    if (!card || card.dataset.r3a) return;
    card.dataset.r3a = "1";
    $$("table.rd-tbl tbody tr", card).forEach((tr) => {
      const tds = $$("td", tr); if (tds.length < 2) return;
      const b = $("b", tds[1]);
      const name = ((b || tds[1]).textContent || "").trim();
      if (!name) return;
      tr.style.cursor = "pointer"; tr.tabIndex = 0; tr.title = "押すと、このタスクを開きます";
      const open = () => { const o = $$("#well tr[data-k30]").find((x) => (x.textContent || "").indexOf(name) >= 0); if (o) o.click(); else toast("下の一覧でこのタスクを探してください（絞り込みで隠れている場合があります）"); }; // eslint-disable-line no-undef
      tr.addEventListener("click", open);
      tr.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    });
  }

  /* ⑧ 「入金の予定をタスクに入れる」（daily-M07）：タスクの新規作成の窓を、題つきで開く（本体の層 v92r3a.payTask） */
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest("button, [role=button]");
    if (!b || isFwd() || !A().payTask) return;
    if ((RD.curKey ? RD.curKey() : "") !== "ops:ord") return;
    if (!/入金の予定をタスクに入れる/.test(b.textContent || "") || b.getAttribute("data-act") === "v90reg.task") return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    A().payTask();
  }, true);

  /* ⑨ 目標と道筋：言葉の言い直し（本体の層 v92r3a.rmWords）を、描き直しのたびに */
  function fixRm() { safe(() => A().rmWords && A().rmWords()); }

  const old = RD.after;
  RD.after = function () {
    const r = old.apply(this, arguments);
    try {
      if (isFwd()) return r;
      const w = document.getElementById("well") || document.querySelector(".stage") || document.body;
      const k = RD.curKey ? RD.curKey() : "";
      if (k === "dash:home" || k === "dash") fixHome(w);
      if (k === "dash:case") fixCase(w);
      if (k === "msg") fixMsg(w);
      fixNext(w, k);
      if (k === "today") fixToday(w);
      if (k === "db") fixDb(w);
      if (k === "task") fixTaskRows(w);
      if (k === "rm") fixRm();
      if (RD._r3aPages) RD._r3aPages.forEach((f) => { try { f(w, k); } catch (e) { console.error("[rd v92r3a]", e); } });
    } catch (e) { console.error("[rd v92r3a]", e); }
    return r;
  };
  RD._r3aPages = [];
})();

} catch (e) { try { console.error("[rd] rd_v92z1r3a.js", e); } catch (x) { } }
/* ==== rd_v92z2r3b.js ==== */
try {
/* 21.92 r3b（刷新版の層）
   ① 販売先国の選定：確定のあとは、上のカードと「主要指標の比較」を、確定した国で出す（auto-N10・indagri-N15）。
      この商品を登録・輸入できない国（規制の判定が「できません」）には、カードにその札を付け、「総合点が最も高い」の札は外す
   ② ヒアリングの「選択肢の例：」の札：押すと、下の会話の同じ選択肢を押す（無ければ答えの欄に入れる）（daily-08） */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v92r3b) return;
  RD._v92r3b = 1;
  const { $, $$, esc } = RD;
  const lang = () => { try { return String((window.I18N && window.I18N.lang) || document.documentElement.lang || "ja").slice(0, 2); } catch (e) { return "ja"; } };
  const M = (ja, en, zh, es) => { const l = lang(); return l === "en" ? en : l === "zh" ? (zh || en) : l === "es" ? (es || en) : ja; };
  const ten = () => { try { return typeof TEN !== "undefined" ? TEN : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const dd = () => { try { return typeof D !== "undefined" ? D : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const chosen = () => { const S = (ten() || {}).ctySel || {}; return (Array.isArray(S.chosen) ? S.chosen : []).map((x) => (typeof x === "string" ? x : x && (x.c || x.cty))).filter(Boolean); };
  const ngOf = (c) => { try { const r = ((dd() || {}).regs || {})[c]; const cd = r && r.v56tariffCond; return !!(cd && cd.lvl === "ng"); } catch (e) { return false; } };

  /* ① 確定のあとのカード：確定した国で描く（描く間だけ、おすすめの並びを確定した国に替える。保存の中身は変えない） */
  let swapped = false;
  if (RD.page && typeof RD.page.cty === "function") {
    const p0 = RD.page.cty;
    RD.page.cty = function (w) {
      const t = ten();
      const S = t && t.ctySel;
      const ch = chosen();
      const rec = S && Array.isArray(S.rec) ? S.rec.filter((x) => x && x.c).map((x) => x.c) : [];
      const want = ch.filter((c) => rec.indexOf(c) >= 0);
      swapped = false;
      if (!S || !want.length) return p0.apply(this, arguments);
      const cur = (Array.isArray(S.top) ? S.top : []).filter((c) => rec.indexOf(c) >= 0).slice(0, 3);
      const same = cur.length === want.length && want.every((c) => cur.indexOf(c) >= 0);
      if (same) return p0.apply(this, arguments);
      const top0 = S.top, ai0 = S.ai, hasTop = Object.prototype.hasOwnProperty.call(S, "top"), hasAi = Object.prototype.hasOwnProperty.call(S, "ai");
      try {
        S.top = want.slice(0, 3);
        S.ai = null;
        swapped = true;
        return p0.apply(this, arguments);
      } finally {
        if (hasTop) S.top = top0; else delete S.top;
        if (hasAi) S.ai = ai0; else delete S.ai;
      }
    };
  }
  function fixCty(w) {
    const box = w;
    const tiles = $$(".k-tiles > .k-card", box).filter((c) => $("[data-rdcty]", c));
    if (!tiles.length) return;
    const warm = tiles[0].closest("section.k-card");
    const ch = chosen();
    const shown = tiles.map((c) => $("[data-rdcty]", c).getAttribute("data-rdcty"));
    const allChosen = ch.length > 0 && shown.every((c) => ch.indexOf(c) >= 0);
    if (warm && allChosen && !warm.dataset.v92r3b) {
      warm.dataset.v92r3b = "1";
      const h2 = $(".k-h h2", warm);
      if (h2) { h2.textContent = M("確定した販売先国（" + shown.length + "か国）", "Confirmed sales countries (" + shown.length + ")", "已确定的销售国（" + shown.length + "个）", "Países de venta confirmados (" + shown.length + ")"); h2.setAttribute("data-noi18n", ""); }
      const tg = $$(".k-h .k-tag", warm).find((x) => /総合点|おすすめ|進出希望国を先に|データのある国/.test(x.textContent || ""));
      if (tg) {
        const missing = ch.filter((c) => shown.indexOf(c) < 0);
        tg.setAttribute("data-noi18n", "");
        const tn = Array.from(tg.childNodes).find((n) => n.nodeType === 3 && (n.nodeValue || "").trim());
        const txt = M("確定した国を出しています（選び直すと、おすすめの並びに戻ります）", "Showing your confirmed countries (choose again to return to the suggested order)", "显示已确定的国家（重新选择后恢复推荐顺序）", "Se muestran los países confirmados (elija de nuevo para volver al orden sugerido)")
          + (missing.length ? M("。点数の無い国：" + missing.join("・"), ". No score: " + missing.join(", ")) : "");
        if (tn) tn.nodeValue = txt; else tg.appendChild(document.createTextNode(txt));
      }
    }
    tiles.forEach((card) => {
      const c = $("[data-rdcty]", card).getAttribute("data-rdcty");
      const abs = $$(":scope > .k-tag", card).find((t) => /position:\s*absolute/.test(t.getAttribute("style") || ""));
      if (allChosen && abs && !abs.dataset.v92r3b) {
        // 確定した国だけを並べているので、「総合点が最も高い／最もおすすめ」の札は、全体の1位の国にだけ
        const all = RD.recCty ? RD.recCty() : [];
        if (!(all[0] && all[0].c === c)) abs.remove();
      }
      if (ngOf(c) && !$(".k92r3b-ng", card)) {
        const abs2 = $$(":scope > .k-tag", card).find((t) => /position:\s*absolute/.test(t.getAttribute("style") || ""));
        if (abs2) abs2.remove();
        const nm = $("b", card);
        const at = nm && nm.parentElement ? nm.parentElement : card.firstElementChild;
        if (at) at.insertAdjacentHTML("afterend", `<p class="k92r3b-ng" data-noi18n style="margin:6px 0 0;padding:6px 10px;border-radius:10px;background:#FDECEC;color:#B42318;font-size:12.5px;font-weight:800;line-height:1.5">⛔ ${esc(M("この商品は、この国では登録・輸入できない判定です（「規制を調べる」で理由を確認）。点数は参考です", "Judged not registrable / importable in this country for this product (see “Check regulations”). The score is for reference only", "判定为本商品在该国无法登记・进口（请在“查询法规”确认原因）。分数仅供参考", "Este producto se considera no registrable / importable en este país (véase «Consultar normativa»). La puntuación es solo de referencia"))}</p>`);
      }
    });
  }

  /* ② 「選択肢の例：」の札 */
  function fixTags(w) {
    $$(".rd-tag.k-v92ex", w).forEach((tg) => {
      if (tg.dataset.v92r3b) return;
      tg.dataset.v92r3b = "1";
      tg.classList.add("k92r3b-pick");
      tg.setAttribute("role", "button");
      tg.setAttribute("tabindex", "0");
      tg.title = M("押すと、この選択肢で答えます", "Press to answer with this option", "点击即以此选项回答", "Pulse para responder con esta opción");
      const pick = () => {
        const tx = (tg.textContent || "").trim();
        const chip = $$("[data-chip]").find((b) => !b.closest(".rd-x") && ((b.dataset.chip || "").trim() === tx || (b.textContent || "").trim() === tx));
        if (chip) { chip.click(); return; }
        const fa = document.getElementById("fans");
        if (fa) { fa.value = tx; try { fa.dispatchEvent(new Event("input", { bubbles: true })); fa.focus(); fa.scrollIntoView({ block: "center", behavior: "smooth" }); } catch (e) { /* 無視 */ } }
      };
      tg.addEventListener("click", pick);
      tg.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
    });
    const l = $(".k-v92exl", w);
    if (l && !l.dataset.v92r3b) { l.dataset.v92r3b = "1"; l.textContent = M("選択肢（押すと答えます）：", "Options (press to answer):", "选项（点击回答）：", "Opciones (pulse para responder):"); l.setAttribute("data-noi18n", ""); }
  }

  function apply() {
    if (RD.locked && RD.locked()) return;
    const w = $("#well");
    if (!w) return;
    const k = RD.curKey();
    if (k === "cty") fixCty(w);
    if (k === "up" || k === "item") fixTags(w);
  }
  const prev = RD.after;
  RD.after = function () {
    const r = prev.apply(this, arguments);
    try { apply(); } catch (e) { console.error("[rd v92r3b]", e); }
    return r;
  };
  try { apply(); } catch (e) { /* 最初の描画の前 */ }
})();

} catch (e) { try { console.error("[rd] rd_v92z2r3b.js", e); } catch (x) { } }
/* ==== rd_v92z4r3c.js ==== */
try {
/* 貿易クラウドAI商社マン 21.92 r3c（刷新版の層・いちばん後ろに読む）：多言語の残り（xi18n-73）
   左メニューの札・上の帯のボタンのツールチップ（title・aria-label）は、刷新版の層が描き直すたびに日本語で付け直す
   （例：「要対応 5件（相手の返信に、まだ返していない案件。…）」「文字の大きさ（表示の密度）：標準」）。
   辞書の当て込みのあとで付け直されるので、英語・中国語・スペイン語でも日本語のまま残っていた。
   → RDX.after（描き直しのたびに呼ばれる）のいちばん最後で、左メニューと上の帯の属性だけを、いまの辞書（i18nStr）に通す。
   日本語の画面では何もしない。今の関数は差し替えず、RDX.after を包むだけ。 */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD.__v92r3c) return;
  RD.__v92r3c = 1;
  const JP = /[ぁ-ゖァ-ヺ一-鿿々]/;
  const miss = Object.create(null);
  let nMiss = 0;
  function fix() {
    if (typeof I18N === "undefined" || !I18N || I18N.lang === "ja" || typeof i18nStr !== "function") return;
    const d = I18N.dict && I18N.dict[I18N.lang];
    if (!d) return;
    const els = document.querySelectorAll("#rdside [title], #rdside [aria-label], .bar [title], .bar [aria-label], .k-top [title], .k-top [aria-label]");
    for (let i = 0; i < els.length && i < 400; i++) {
      const e = els[i];
      for (const a of ["title", "aria-label"]) {
        const v = e.getAttribute(a);
        if (!v || !JP.test(v)) continue;
        const mk = I18N.lang + "\u0001" + v;
        if (miss[mk]) continue;
        let t = null;
        try { t = i18nStr(v, d); } catch (err) { t = null; }
        if (t == null || t === v) { if (nMiss < 3000) { miss[mk] = 1; nMiss++; } continue; }
        try {
          const o = I18N.attr.get(e) || {};
          o[a] = v;
          I18N.attr.set(e, o);
        } catch (err) { }
        e.setAttribute(a, t);
      }
    }
  }
  const prev = RD.after;
  RD.after = function () {
    const r = typeof prev === "function" ? prev.apply(this, arguments) : undefined;
    try { fix(); } catch (e) { }
    return r;
  };
})();

} catch (e) { try { console.error("[rd] rd_v92z4r3c.js", e); } catch (x) { } }
/* ==== rd_v92z5r4a.js ==== */
try {
/* 21.92 r4a（刷新版の層）：書類まわりの直し。
   中身の直しは本体の層（logic_v2192r4a.ts）にある。ここは、刷新版が画面を描き直したあとにも、本体の層の「描いたあとの直し」
   （契約書の相手の選択・この案件の書類の注記・点検の欄）が残るよう、RDX.after の最後で呼び直すだけ。 */
(function () {
  'use strict';
  if (window.__rdV92r4a) return;
  window.__rdV92r4a = 1;
  try {
    if (typeof RDX === 'undefined' || !RDX || typeof RDX.after !== 'function') return;
    var __a = RDX.after;
    RDX.after = function () {
      var r = __a.apply(this, arguments);
      try { if (window.v92r4a && typeof window.v92r4a.after === 'function') window.v92r4a.after(); } catch (e) {}
      return r;
    };
  } catch (e) {}
})();

} catch (e) { try { console.error("[rd] rd_v92z5r4a.js", e); } catch (x) { } }
/* ==== rd_v92z6r4b.js ==== */
try {
/* 貿易クラウドAI商社マン 21.92 r4b の刷新版の層（いちばん後ろに読む）
   ① health-M13：ホームの「はじめの設定 n/6 次：商談を進める」の札を押しても何も起きない（行き先が今の画面）
      → 下の「これまでのダッシュボード」を開いて、はじめの設定の欄まで送る
   ほかは下の各ブロックの頭に書く */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v92r4b) return;
  RD._v92r4b = 1;
  const { $, $$, esc } = RD;
  const safe = (fn) => { try { return fn(); } catch (e) { return undefined; } };
  const A = () => window.v92r4b || {};
  const M = (ja, en, zh, es) => (A().M ? A().M(ja, en, zh, es) : ja);
  const G = (n) => { try { return RD.G ? RD.G(n) : undefined; } catch (e) { return undefined; } };

  /* ① はじめの設定の札 */
  document.addEventListener("click", (e) => {
    try {
      const b = e.target.closest && e.target.closest(".k-pills .k-pill[data-kbc]");
      if (!b || !/はじめの設定|Getting started|Setup|入门设置|Configuración inicial/i.test(b.textContent || "")) return;
      const k = b.dataset.kbc, now = safe(() => RD.curKey());
      if (k && now && k !== now && !(k === "dash" && /^dash:home/.test(now))) return; // 別の画面へ行く札は今までどおり
      const old = $("details.k-oldb");
      if (!old) return;
      e.preventDefault(); e.stopImmediatePropagation();
      old.open = true;
      const t = $("#ux32setup", old) || old;
      setTimeout(() => {
        try {
          t.scrollIntoView({ block: "start", behavior: "smooth" });
          t.classList.add("k92r4b-flash");
          setTimeout(() => t.classList.remove("k92r4b-flash"), 2600);
        } catch (x) { /* 無視 */ }
      }, 60);
    } catch (x) { /* 無視 */ }
  }, true);

  const isFwd = () => { const S = G("SES"); return !!(S && (S.role === "fwd" || S.t === "fwd")); };
  const walk = (root, fn) => {
    try {
      const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const L = []; let n;
      while ((n = tw.nextNode())) L.push(n);
      L.forEach(fn);
    } catch (e) { /* 無視 */ }
  };

  /* ② culture-N07：足した商材カテゴリー（文化・教育用品・ペット用品 など）が、道筋の目安・物差しでは「その他」とだけ出る
        → 「その他」が、この商材の専用の区分が無いときの共通の区分であることを書く（数字・物差しそのものは変えない） */
  function fixOther(w) {
    const T = G("TEN");
    const cat = String((T && T.cat) || "").trim();
    if (!cat || /^(その他|未分類)$/.test(cat)) return;
    const shelf = cat === "文化・教育用品"; // culture-M09：食品でない商材の「賞味期限・保証期間」→「保証・品質の条件」
    const all = w.textContent || "";
    if (all.indexOf("その他（共通の物差し）") < 0 && all.indexOf("似た商材（その他）") < 0 && !(shelf && all.indexOf("賞味期限・保証期間") >= 0)) return;
    walk(w, (n) => {
      const s = n.nodeValue;
      if (!s) return;
      if (shelf && s.indexOf("賞味期限・保証期間") >= 0) { n.nodeValue = s.replace(/賞味期限・保証期間/g, "保証・品質の条件"); return; }
      if (s.indexOf("その他") < 0) return;
      let t = s;
      t = t.replace(/似た商材（その他）の STANDAGE の記録 (\d+)案件から/, (m, a) => `STANDAGE の記録 ${a}案件（さまざまな業種を含む区分「その他」。「${cat}」だけの記録はまだありません）から`);
      t = t.replace(/その他（共通の物差し）/g, `共通の物差し（「${cat}」専用の物差しはまだありません）`);
      if (t !== s) n.nodeValue = t;
    });
  }

  /* ③ other-N17：荷主のメンバーの画面の「誰が何をできる？」に、物流会社向けの言葉（レート・見積）が出る → 荷主の言葉に */
  function fixTeam(w) {
    if (isFwd()) return;
    $$(".k-tile .k-ts", w).forEach((el) => {
      const s = (el.textContent || "").trim();
      if (s === "招待・担当・役割・停止・削除。全部の案件とレートの管理") el.textContent = "メンバーの招待・担当する商品の割り当て・役割の変更・停止・削除。すべての商品と案件を扱えます";
      else if (s === "見る・投稿する・担当の仕事（割り当てられた見積・案件に対応）") el.textContent = "担当する商品の案件を見る・やりとりに投稿する（担当する商品は、招待のときに管理者が選びます）";
    });
  }

  /* ④ food-N13：リストを作ったあとも、上の札が「最新のリスト：0件」→ 最新のリストの相手の数（leads）を出す */
  function fixDbRun(w) {
    const T = G("TEN");
    const runs = safe(() => ((T || {}).v71ob || {}).runs) || [];
    const last = runs[runs.length - 1];
    const n = last ? (last.leads || last.list || last.items || last.rows || last.cands || []).length : 0;
    if (!n) return;
    $$("p", w).forEach((p) => { if (p.children.length === 0 && /^最新のリスト：0件$/.test((p.textContent || "").trim())) p.textContent = `最新のリスト：${n}件`; });
  }

  /* ⑤ other-13・indagri-10：ホームに「次にやること」が同時に3つ（右上「＋ バイヤーを探す」・提案の「目標を入れる」・「はじめの設定 n/6 次：…」）
        → はじめの設定が終わるまでは、主のボタンは「はじめの設定 次：…」の1つにする（ほかの2つは消さず、控えめな見た目に） */
  function fixHomeOne(w) {
    const pill = $$(".k-pills .k-pill[data-kbc]", w).find((p) => /はじめの設定|Getting started|Setup/.test(p.textContent || ""));
    const hero = $(".k-hcta", w);
    const prop = $$(".v88prop .btn, [class*='v88prop'] .btn", w).filter((b) => !b.classList.contains("g"));
    if (pill) {
      pill.classList.add("k92r4b-main");
      if (hero && pill.dataset.kbc !== hero.dataset.kbc) hero.classList.add("k92r4b-sub"); else if (hero) hero.classList.remove("k92r4b-sub");
      prop.forEach((b) => { b.classList.add("g"); b.dataset.k92r4bDem = "1"; });
    } else {
      if (hero) hero.classList.remove("k92r4b-sub");
      $$("[data-k92r4b-dem]", w).forEach((b) => { b.classList.remove("g"); delete b.dataset.k92r4bDem; });
    }
  }

  const old = RD.after;
  RD.after = function () {
    const r = old.apply(this, arguments);
    try {
      const w = document.getElementById("well") || document.querySelector(".stage") || document.body;
      const k = RD.curKey ? RD.curKey() : "";
      if (!isFwd()) {
        if (k === "ai" || k === "rm" || k === "dash:rep" || k === "dash:home" || k === "dash" || k === "today" || k === "item" || k === "up" || k === "task" || k === "dash:prod") fixOther(w);
        if (k === "dash:home" || k === "dash") fixHomeOne(w);
        if (k === "team") fixTeam(w);
        if (k === "db") fixDbRun(w);
      }
      // ⑥ cross-10：物流会社の見積受信箱は、依頼の表が1画面目に入るよう、上の札と表の行を詰める（中身は消さない。見た目は CSS）
      if (w.classList) w.classList.toggle("k92r4b-fin", isFwd() && k === "finbox");
      if (isFwd() && k === "finbox") safe(() => {
        // 見本の会社の説明：1行にたたむ（押すと全文）
        const bar = $(":scope > p.k-v90smpbar", w);
        if (bar && !bar.dataset.k92r4b) {
          bar.dataset.k92r4b = "1"; bar.classList.add("k92r4b-clamp"); bar.setAttribute("tabindex", "0"); bar.title = bar.textContent || "";
          const tg = (e) => { if (e.target.closest && e.target.closest("abbr,button,a")) return; bar.classList.toggle("k92r4b-clamp"); };
          bar.addEventListener("click", tg);
          bar.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tg(e); } });
        }
        // 「AI物流マン（内蔵エンジン）」「レート・AI設定」を、上の「AIが自動で見積回答します」の札の右へ（1段ぶん詰める）
        const card = $(":scope > [data-rdfin] .rd-card", w), ph = $(":scope > .ph", w);
        const rw = ph && ph.lastElementChild && ph.lastElementChild.classList.contains("rw") ? ph.lastElementChild : null;
        if (card && rw && rw.children.length) {
          let box = $(".k92r4b-phr", card);
          if (!box) { box = document.createElement("span"); box.className = "k92r4b-phr"; card.appendChild(box); }
          Array.from(rw.children).forEach((c) => box.appendChild(c));
          ph.classList.add("k92r4b-phempty");
        }
      });
      if (RD._r4bPages) RD._r4bPages.forEach((f) => { try { f(w, k); } catch (e) { console.error("[rd v92r4b]", e); } });
    } catch (e) { console.error("[rd v92r4b]", e); }
    return r;
  };
  RD._r4bPages = [];
})();

} catch (e) { try { console.error("[rd] rd_v92z6r4b.js", e); } catch (x) { } }
/* ==== rd_v92z7r4c.js ==== */
try {
/* 21.92 r4c：刷新版の層（4巡目の直し）。今の部品は差し替えず、RDX.after を包む
   ① 商品情報を登録：資料を入れたあと、足りない項目が残っている間の「次は」を「足りない情報に答える（残り N項目）」に（xcut-M06）
   ② 商品が0件のあいだ：左メニューの、まだ開けない項目を薄くして理由を添える（xlogin-07）
   ③ ヘルプの窓：「5つの手順」→「6つの手順」、くわしい版のガイドに「絵と道順は刷新前の配置」と一言（culture-13・health-12・indagri-N13・xlogin-12）
   ④ 物流会社の見積受信箱：上の説明をたたみ、状況の札と行の高さを詰めて、依頼の表を1画面目に（other F2）
   出どころは本体の層 window.v92r4c（商品の有無・足りない項目の数） */
(function () {
  'use strict';
  const RD = window.RDX;
  if (!RD || RD._v92r4c) return;
  RD._v92r4c = 1;
  const { $, $$ } = RD;
  const lang = () => { try { return String((window.I18N && window.I18N.lang) || document.documentElement.lang || 'ja').slice(0, 2); } catch (e) { return 'ja'; } };
  const M = (ja, en, zh, es) => { const l = lang(); return l === 'en' ? en : l === 'zh' ? (zh || en) : l === 'es' ? (es || en) : ja; };
  const fwd = () => { try { return !!RD.isFwd(); } catch (e) { return false; } };
  const locked = () => { try { return !!RD.locked(); } catch (e) { return document.body.classList.contains('locked'); } };
  const state = () => { try { return window.v92r4c.state(); } catch (e) { return { n: 0, has: false, miss: 0, names: [] }; } };
  const setTxt = (el, t) => { if (el && el.textContent !== t) el.textContent = t; };

  /* ①' 「次は」：はじめの設定で、この画面より前の手順がまだのときは、その手順を出す（手順の帯・ホームと同じ。culture-N17・other-N16） */
  const PAGE_IDX = { up: 0, item: 0, cty: 1, 'ops:reg': 2, deck: 3, db: 4, deal: 5 };
  const coreSteps = () => { try { return window.v92coreSteps ? window.v92coreSteps() : null; } catch (e) { return null; } };
  function fixStepNext(w, k) {
    const b = $('[data-rdhero] .k-next', w);
    if (!b) return;
    const bb = $('b', b);
    if (!bb || b.dataset.r4cfill || b.dataset.v92i) return;
    const pi = PAGE_IDX[k];
    const S = coreSteps();
    const want = (pi != null && S && S.has && S.next && S.idx >= 0 && S.idx < pi) ? S.next : null;
    if (want) {
      const def = (window.V92CORE_STEPS || []).find((x) => x.id === want.id) || {};
      const label = M(want.t, def.en || want.t, def.zh, def.es);
      if (b.dataset.r4cstep !== want.id || bb.textContent !== label) {
        if (!b.dataset.r4cstep) { b.dataset.r4ckbc = b.getAttribute('data-kbc') || ''; b.dataset.r4cold = bb.textContent; }
        b.removeAttribute('data-kbc'); delete b.dataset.r3ago;
        b.dataset.r4cstep = want.id;
        bb.setAttribute('data-noi18n', '1');
        setTxt(bb, label);
        b.title = M('次の手順：' + want.t + '（はじめの設定の、いまの手順）', 'Next: ' + label + ' (the current setup step)', '下一步：' + label + '（初始设置的当前步骤）', 'Siguiente: ' + label + ' (paso actual)');
      }
    } else if (b.dataset.r4cstep) {
      delete b.dataset.r4cstep;
      bb.removeAttribute('data-noi18n');
      if (b.dataset.r4ckbc) b.setAttribute('data-kbc', b.dataset.r4ckbc);
      if (b.dataset.r4cold) { setTxt(bb, b.dataset.r4cold); b.title = '次の手順：' + b.dataset.r4cold; }
    }
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('.k-next[data-r4cstep]');
    if (!b) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    const S = coreSteps();
    const s = S && S.next;
    if (s) RD.goKey(s.id === 'fill' ? 'up' : s.key);
  }, true);

  /* ① 「次は」：足りない情報に答える */
  function fixUpNext(w, k) {
    if (k !== 'up' && k !== 'item') return;
    const b = $('[data-rdhero] .k-next', w);
    if (!b) return;
    const bb = $('b', b);
    if (!bb || b.dataset.v92i) return;
    const st = state();
    if (st.has && st.miss > 0 && !st.pend) {
      const t = M(`足りない情報に答える（残り ${st.miss}項目）`, `Answer the missing items (${st.miss} left)`, `回答缺少的信息（还剩 ${st.miss} 项）`, `Responder lo que falta (${st.miss})`);
      if (b.dataset.r4cfill !== '1' || bb.textContent !== t) {
        if (!b.dataset.r4cfill) { b.dataset.r4cfkbc = k === 'up' ? (b.dataset.v92eKbc || b.getAttribute('data-kbc') || 'item') : (b.getAttribute('data-kbc') || ''); b.dataset.r4cfold = k === 'up' ? (b.dataset.v92eOld || bb.textContent) : bb.textContent; }
        b.removeAttribute('data-kbc'); delete b.dataset.v92eDrop; delete b.dataset.r3ago;
        b.dataset.r4cfill = '1';
        bb.setAttribute('data-noi18n', '1');
        setTxt(bb, t);
        b.title = M('次の手順：AI の質問に答えて、足りない項目（' + st.names.join('・') + '）を入れる', 'Next: answer the AI questions to fill the missing items', '下一步：回答 AI 的提问，补全缺少的项目', 'Siguiente: responda a las preguntas de la IA');
      }
    } else if (b.dataset.r4cfill) {
      delete b.dataset.r4cfill;
      bb.removeAttribute('data-noi18n');
      if (b.dataset.r4cfkbc) b.setAttribute('data-kbc', b.dataset.r4cfkbc);
      setTxt(bb, b.dataset.r4cfold || '商品情報を確かめる');
      b.title = '次の手順：' + bb.textContent;
    }
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('.k-next[data-r4cfill]');
    if (!b) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    const open = () => {
      const go = document.getElementById('rdfill') || $$('#well button').find((x) => /AIの質問に答える|Answer the AI/.test(x.textContent || ''));
      if (go) { try { go.scrollIntoView({ block: 'center' }); } catch (x) { /* 無視 */ } go.click(); }
      else { const box = $('#well .v54hear, #well #chat, #well .chat'); if (box) box.scrollIntoView({ block: 'center' }); }
    };
    if ((RD.curKey ? RD.curKey() : '') !== 'up') { RD.goKey('up'); setTimeout(open, 900); } else open();
  }, true);

  /* ①'' ホーム（案件）：はじめの設定が終わるまでは、「次」として目立たせるのを「はじめの設定 n/6 次：…」の1つにする
        （右上の「バイヤーを探す」と提案の「目標を入れる」は白いボタンに。押せるのは今のまま）（other-13） */
  function fixHomeOne(w, k) {
    const S = k === 'dash:home' ? coreSteps() : null;
    const on = !!(S && S.has && S.next);
    const H = document.documentElement;
    if (H.classList.contains('k-r4c-one') !== on) H.classList.toggle('k-r4c-one', on);
  }

  /* ② 商品が0件のあいだの左メニュー */
  const OPEN0 = { item: 1, up: 1 };
  function fixZeroNav() {
    const side = document.getElementById('rdside');
    if (!side) return;
    const zero = !locked() && !fwd() && state().n === 0;
    const tip = M('商品を1つ登録する（または「サンプルで試す」）と使えます', 'Available after you register a product (or try a sample)', '登记1个商品（或“试用样本”）后即可使用', 'Disponible tras registrar un producto (o probar una muestra)');
    if (zero === (side.dataset.r4czero === '1') && (!zero || side.dataset.r4cl === lang())) return;
    side.dataset.r4czero = zero ? '1' : '';
    side.dataset.r4cl = lang();
    $$('.rd-ni[data-rdk]', side).forEach((x) => {
      const key = String(x.getAttribute('data-rdk') || '').split(':')[0];
      const off = zero && !OPEN0[key];
      x.classList.toggle('k-r4c-off', off);
      if (off) { if (!x.dataset.r4ct) x.dataset.r4ct = x.title || ' '; x.title = tip; }
      else if (x.dataset.r4ct) { x.title = x.dataset.r4ct.trim(); delete x.dataset.r4ct; }
    });
  }

  /* ③ ヘルプの窓・ログイン画面の案内 */
  function fixHelp() {
    const dw = document.getElementById('dw');
    if (dw && !fwd()) {
      $$('[data-rdquick] small', dw).forEach((x) => { if (/5つの手順/.test(x.textContent || '')) x.textContent = x.textContent.replace('5つの手順', '6つの手順'); });
      $$('a[href^="guide"]', dw).forEach((a) => {
        const s = $('small', a);
        if (!s || s.dataset.r4c) return;
        s.dataset.r4c = '1';
        s.setAttribute('data-noi18n', '1');
        s.textContent = M('目次から、知りたいところだけ読めます（別のタブ）。絵と道順は刷新前の配置です。いまの場所は、左メニューの名前か、各画面の「使い方を見る」の上に出る「刷新版での場所」で確かめられます。',
          'Read only what you need from the contents (new tab). Its pictures and paths show the previous layout; find the current place by the left-menu names or “Where it is now” above each “How to use”.',
          '可从目录中只阅读需要的部分（新标签页）。图片和路径为改版前的布局；现在的位置请以左侧菜单名称或各画面“查看用法”上方的“改版后的位置”为准。',
          'Lea solo lo que necesite desde el índice (pestaña nueva). Las imágenes y rutas muestran el diseño anterior; la ubicación actual está en el menú izquierdo.');
      });
      try { if (window.v92r4c && window.v92r4c.helpWords) window.v92r4c.helpWords(); } catch (e) { /* 無視 */ }
    }
    if (locked()) {
      $$('a[href^="guide"]').forEach((a) => {
        if (a.dataset.r4c || a.closest('#dw')) return;
        if (!/くわしい版/.test(a.textContent || '')) return;
        a.dataset.r4c = '1';
        const n = document.createElement('small');
        n.className = 'k-r4c-gnote'; n.setAttribute('data-noi18n', '1');
        n.textContent = M('※ くわしい版の絵と道順は、刷新前の配置です', '* The detailed guide shows the previous layout', '※ 详细版的图片和路径为改版前的布局', '* La guía detallada muestra el diseño anterior');
        a.insertAdjacentElement('afterend', n);
      });
    }
  }

  /* ④ 物流会社の見積受信箱 */
  function fixFinbox(w, k) {
    const on = fwd() && k === 'finbox';
    const H = document.documentElement;
    if (H.classList.contains('k-r4c-finbox') !== on) H.classList.toggle('k-r4c-finbox', on);
    if (!on) return;
    const bar = $$(':scope > .k-v90smpbar', w)[0];
    let d = $('.k-r4c-fold', w);
    if (d) { if (bar) d.appendChild(bar); return; }
    const card = $$(':scope > .rd-x', w).find((x) => !x.classList.contains('rd-hero') && $('.rd-card', x) && !$('table', x));
    if (!bar && !card) return;
    d = document.createElement('details');
    d.className = 'k-r4c-fold';
    const sum = document.createElement('summary');
    sum.setAttribute('data-noi18n', '1');
    sum.textContent = bar && !bar.hidden
      ? M('この画面には、見本（架空）の物流会社のレート・回答が入っています／AI の自動回答について — 押すと説明を開きます', 'This screen includes rates and replies from sample (fictitious) forwarders / about AI auto-reply — press to open', '本画面包含样本（虚构）物流公司的运价和回复／关于 AI 自动回复 — 点击展开说明', 'Esta pantalla incluye tarifas de transitarios de muestra (ficticios) / sobre la respuesta automática — pulse para abrir')
      : M('この画面の説明（AI の自動回答について）— 押すと開きます', 'About this screen (AI auto-reply) — press to open', '本画面的说明（关于 AI 自动回复）— 点击展开', 'Acerca de esta pantalla (respuesta automática de la IA) — pulse para abrir');
    d.appendChild(sum);
    const first = bar || card;
    first.parentNode.insertBefore(d, first);
    if (bar) d.appendChild(bar);
    if (card) d.appendChild(card);
  }

  const old = RD.after;
  RD.after = function () {
    const r = old.apply(this, arguments);
    try {
      const w = document.getElementById('well') || document.querySelector('.stage') || document.body;
      const k = RD.curKey ? RD.curKey() : '';
      if (!fwd()) { fixUpNext(w, k); fixStepNext(w, k); fixHomeOne(w, k); }
      fixZeroNav();
      fixHelp();
      fixFinbox(w, k);
    } catch (e) { console.error('[rd v92r4c]', e); }
    return r;
  };
  // 窓（ヘルプ）とログイン画面は、描き直しの外で開くことがある
  document.addEventListener('click', () => { setTimeout(() => { try { fixHelp(); } catch (e) { /* 無視 */ } }, 300); }, false);
  setTimeout(() => { try { fixHelp(); fixZeroNav(); } catch (e) { /* 無視 */ } }, 1200);
})();

} catch (e) { try { console.error("[rd] rd_v92z7r4c.js", e); } catch (x) { } }
/* ==== rd_v92z8r5a.js ==== */
try {
/* 21.92 r5a：刷新版の層。5巡目の書類まわりの直しは本体の層（logic_v2192r5a）で行う（今の版と刷新版の両方に効かせるため）。
   ここは、刷新版が画面を描き直したあとに本体の層の「描いたあとの直し」（出港の予定日の注記・書類の下の注記・宛先）をもう一度呼ぶだけ。 */
(function () {
  if (window.__rdV92r5a) return;
  window.__rdV92r5a = 1;
  try {
    if (window.RDX && typeof RDX.after === "function") {
      var _a = RDX.after;
      RDX.after = function () {
        var r = _a.apply(this, arguments);
        try { if (window.v92r5a && window.v92r5a.after) setTimeout(window.v92r5a.after, 200); } catch (e) {}
        return r;
      };
    }
  } catch (e) {}
})();

} catch (e) { try { console.error("[rd] rd_v92z8r5a.js", e); } catch (x) { } }
/* ==== rd_v92z90r5b.js ==== */
try {
/* 貿易クラウドAI商社マン 21.92 r5b の刷新版の層（いちばん後ろに読む）
   ① medical-Q03：入り直した直後に、案件一覧ではなく「こんばんは！」の前のホーム（「まずやること 3つのステップ」）が出ることがある
      原因：rd.js は読み込まれてすぐ 0.5 秒おきの見張りを始める。続きのセッション（鍵のかかっていない状態）では、後ろの rd の層
            （rd_case.js＝案件一覧 ほか約40本）が読み終わる前に見張りが動き、その時点にある部品だけでホームを仕上げてしまう
            （仕上げたホームは、描き直しまで組み直さない）。読み込みが遅いほど起きやすい
      直し：いちばん後ろのこの層が読まれた時点で、先に仕上げられた画面があれば、アプリの画面を1回描き直す（全部の層がそろった状態で仕上げ直す）
   ほかは下の各ブロックの頭に書く */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v92r5b) return;
  RD._v92r5b = 1;
  const { $, $$ } = RD;
  const safe = (fn) => { try { return fn(); } catch (e) { return undefined; } };
  const A = () => window.v92r5b || {};
  const M = (ja, en, zh, es) => (A().M ? A().M(ja, en, zh, es) : ja);

  /* ① 先に仕上げられた画面の描き直し */
  const redo = () => {
    try {
      if (document.body.classList.contains("locked")) return false;
      const w = $("#well");
      if (!w || !$("[data-rdhero]", w)) return false; // まだ仕上げられていない（ふつうの順）
      if (typeof render !== "function") return false; // eslint-disable-line no-undef
      // 入力の途中・開いている窓があるときは触らない
      const ae = document.activeElement;
      if (ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName) && w.contains(ae)) return false;
      render(); // eslint-disable-line no-undef
      return true;
    } catch (e) { return false; }
  };
  RD._v92r5bEarly = redo() ? 1 : 0;
  // 念のため：描き直しのあとも前のホームが残っていたら（見張りの順のずれ）、もう1回だけ
  /* ② auto-Q02：案件一覧で、ステータスの札（見積提示 0 など）で絞ったあと「すべて」を押しても戻らない
        原因：「すべて」はタブの絞り込みだけを外し、ステータスの札の絞り込みは残る → 「すべて」を押したら、ステータスの札も外す */
  document.addEventListener("click", (e) => {
    try {
      const b = e.target.closest && e.target.closest('[data-kclf="all"]');
      if (!b) return;
      const box = b.closest("[data-kcl]") || document;
      const on = $(".k-stc.on", box);
      if (on) on.click(); // 札をもう一度押すのと同じ動き（絞り込みを外して描き直す）
    } catch (x) { /* 無視 */ }
  }, true);

  /* ③ food-M05 の残り：バイヤー一覧から削除した相手（一覧から外した相手）が、案件一覧に残る
        → 案件一覧を作る間だけ、外した相手のスレッドを見せない（やりとり・商談の記録そのものは残る。ゴミ箱から戻すと、また出る） */
  if (typeof RD.homeView === "function") {
    const hv = RD.homeView;
    RD.homeView = function (w) {
      let t = null, orig = null;
      try {
        const ids = (A().hidThreads ? A().hidThreads() : []);
        t = typeof TEN !== "undefined" ? TEN : null; // eslint-disable-line no-undef
        if (ids.length && t && t.dmThreads && typeof t.dmThreads === "object") {
          const keep = {};
          let cut = 0;
          Object.keys(t.dmThreads).forEach((k) => { const th = t.dmThreads[k]; if (th && ids.indexOf(String(th.id)) >= 0) cut++; else keep[k] = th; });
          if (cut) { orig = t.dmThreads; t.dmThreads = keep; }
        }
      } catch (e) { orig = null; }
      try { return hv.apply(this, arguments); } finally { if (orig && t) t.dmThreads = orig; }
    };
  }

  setTimeout(() => { try { if (RD.homeView && $("#well .rd-home") && !$("#well [data-kcl]") && safe(() => RD.curKey()) === "dash:home") { RD._v92r5bEarly = 2; redo(); } } catch (e) { /* 無視 */ } }, 700);
})();

} catch (e) { try { console.error("[rd] rd_v92z90r5b.js", e); } catch (x) { } }
/* ==== rd_v92z91r5c.js ==== */
try {
/* 21.92 r5c：刷新版の層（5巡目の直し）。今の部品は差し替えず、RDX.after を包む
   ① 右上の「次は」：その画面の手順がまだなら、その画面の中の主な操作へ送る（行き来しない）。済みなら、まだの次の手順へ。
      全部済みの商品情報は「商談を進める」へ（medical-Q02・food-Q02・health-Q04・xcut-Q03・indagri-Q04）
   ② 規制を調べる：開いただけでは済みにしない。画面の中を見た（下へ送った・押した）ときに済みにする（culture-N17。印は本体の層 window.v92r5c）
   ③ 空の案件一覧：手元に相手がいる人のために「商談を記録する」も置く（indagri-Q04）
   ④ 物流会社の見積受信箱：表を枠に収める（other-Q03）
   ⑤ ログイン画面（390）の入力例・「マウスを乗せると」・見出しの「?」の大きさ（xcut-Q04） */
(function () {
  'use strict';
  const RD = window.RDX;
  if (!RD || RD._v92r5c) return;
  RD._v92r5c = 1;
  const { $, $$ } = RD;
  const lang = () => { try { return String((window.I18N && window.I18N.lang) || document.documentElement.lang || 'ja').slice(0, 2); } catch (e) { return 'ja'; } };
  const M = (ja, en, zh, es) => { const l = lang(); return l === 'en' ? en : l === 'zh' ? (zh || en) : l === 'es' ? (es || en) : ja; };
  const fwd = () => { try { return !!RD.isFwd(); } catch (e) { return false; } };
  const locked = () => { try { return !!RD.locked(); } catch (e) { return document.body.classList.contains('locked'); } };
  const setTxt = (el, t) => { if (el && el.textContent !== t) el.textContent = t; };
  const vis = (el) => !!(el && (el.offsetWidth || el.offsetHeight));
  const coreSteps = () => { try { return window.v92coreSteps ? window.v92coreSteps() : null; } catch (e) { return null; } };
  const A = () => window.v92r5c || {};
  const well = () => document.getElementById('well') || document.querySelector('.stage') || document.body;
  const touch = RD.after ? () => { try { RD.after(); } catch (e) { /* 無視 */ } } : () => { };

  /* ───── ① 右上の「次は」 ───── */
  const PAGE_IDX = { up: 0, item: 0, cty: 1, 'ops:reg': 2, deck: 3, db: 4, deal: 5 };
  const byText = (w, sel, re) => $$(sel, w).find((x) => vis(x) && re.test((x.textContent || '').trim()));
  // その画面の中の主な操作：[送り先の要素, 「次は」に出す言葉]
  function inPage(w, k) {
    if (k === 'cty') {
      const ok = byText(w, '.rd-p2 .k-btn.big, .rd-p2 .k-btn', /確定する|Confirm|确定|Confirmar/);
      if (ok) return [ok, M('この画面で国を確定する', 'Confirm the countries on this screen', '在本页确定销售国', 'Confirmar los países aquí')];
      const om = byText(w, '.rd-p2 .k-btn.big, .rd-p2 .k-btn, #well .btn', /おまかせ|Leave it to|交给|Dejar/);
      if (om) return [om, M('この画面で国を選ぶ（おまかせ）', 'Pick countries on this screen (auto)', '在本页选择销售国（交给AI）', 'Elegir países aquí (automático)')];
      return [$('#v54rCtyGo', w) || $('.rd-p2', w), M('この画面で国を確定する', 'Confirm the countries on this screen', '在本页确定销售国', 'Confirmar los países aquí')];
    }
    if (k === 'ops:reg') return [$('#sec-0', w) || $('#rO', w), M('この画面で規制を確かめる', 'Review the regulations on this screen', '在本页确认法规', 'Revisar las regulaciones aquí')];
    if (k === 'deck') {
      const g = byText(w, '.rd-p2 .k-btn.big, .rd-p2 .k-btn.wide', /作る|つくる|生成|Create|Generate|Crear|Generar|制作/) || $('.rd-p2 .k-btn.big', w);
      return [g || $('.rd-p2', w), M('この画面で資料を作る', 'Create the deck on this screen', '在本页制作资料', 'Crear la presentación aquí')];
    }
    if (k === 'db') {
      const mk = $('#rddbob', w);
      if (vis(mk)) return [mk, M('この画面でリストを作る', 'Build the buyer list on this screen', '在本页制作买家名单', 'Crear la lista aquí')];
      const ob = $('#v71obGo', w);
      const box = (ob && ob.closest('.c')) || byText(w, '#well .c h3', /AIバイヤー開拓|AI buyer/);
      return [box || $('.rd-p2', w), M('この画面で相手を選んで連絡する', 'Pick a buyer and contact them on this screen', '在本页选择对象并联系', 'Elegir y contactar aquí')];
    }
    if (k === 'deal') {
      const r = byText(w, '.rd-p2 .k-btn.big, #well .btn', /商談を記録する|Record a deal|记录商谈|Registrar/);
      return [r || $('.rd-p2', w), M('この画面で商談を記録する', 'Record a deal on this screen', '在本页记录商谈', 'Registrar una negociación aquí')];
    }
    return null;
  }
  function restoreNext(b, bb) {
    if (!b.dataset.r5c) return;
    delete b.dataset.r5c; delete b.dataset.r5cgo;
    b.classList.remove('k-r5c-here');
    bb.removeAttribute('data-noi18n');
    if (b.dataset.r5ckbc) b.setAttribute('data-kbc', b.dataset.r5ckbc);
    if (b.dataset.r5cold) { setTxt(bb, b.dataset.r5cold); b.title = '次の手順：' + b.dataset.r5cold; }
    const sm = $('small', b); if (sm && sm.dataset.r5c) { sm.removeAttribute('data-noi18n'); delete sm.dataset.r5c; setTxt(sm, '次は'); }
  }
  function setNext(b, bb, mode, label, title, goKey) {
    if (!b.dataset.r5c) { b.dataset.r5ckbc = b.getAttribute('data-kbc') || ''; b.dataset.r5cold = bb.textContent; }
    if (b.hasAttribute('data-kbc')) b.removeAttribute('data-kbc');
    if (b.dataset.r5c !== mode) b.dataset.r5c = mode;
    if ((b.dataset.r5cgo || '') !== (goKey || '')) b.dataset.r5cgo = goKey || '';
    if (bb.getAttribute('data-noi18n') == null) bb.setAttribute('data-noi18n', '1');
    setTxt(bb, label);
    if (b.title !== title) b.title = title;
    const here = mode === 'act';
    if (b.classList.contains('k-r5c-here') !== here) b.classList.toggle('k-r5c-here', here);
  }
  function fixNext(w, k) {
    const b = $('[data-rdhero] .k-next', w);
    if (!b) return;
    const bb = $('b', b);
    if (!bb) return;
    const pi = PAGE_IDX[k];
    const S = coreSteps();
    if (pi == null || !S || !S.has || b.dataset.v92i || b.dataset.r4cfill || b.dataset.r4cstep || b.dataset.v92eDrop) { restoreNext(b, bb); return; }
    const stepName = (s) => { const def = (window.V92CORE_STEPS || []).find((x) => x.id === s.id) || {}; return M(s.t, def.en || s.t, def.zh, def.es); };
    if (S.idx >= 0 && S.idx < pi) { restoreNext(b, bb); return; } // 前の手順がまだ：r4c の層が、その手順を出す
    const me = S.steps[pi];
    if (pi >= 1 && me && !me.done) {
      const ip = inPage(w, k);
      if (ip && ip[0]) {
        setNext(b, bb, 'act', ip[1], M('この画面の手順「' + me.t + '」がまだです。押すと、この画面の中の操作へ進みます', 'This step is not finished yet. Press to jump to the action on this screen', '本页的步骤尚未完成。按下后跳到本页中的操作', 'Este paso aún no está hecho. Pulse para ir a la acción en esta pantalla'));
        return;
      }
      restoreNext(b, bb); return;
    }
    if (S.next && S.idx > pi) {
      if (pi === 0 && b.dataset.r3ago) { restoreNext(b, bb); return; } // 商品情報：r3a の層が同じ手順を出している
      const nm = stepName(S.next);
      setNext(b, bb, 'go', nm, M('次の手順：' + S.next.t + '（はじめの設定の、まだの手順）', 'Next: ' + nm + ' (the next unfinished setup step)', '下一步：' + nm + '（初始设置中尚未完成的步骤）', 'Siguiente: ' + nm + ' (paso pendiente)'), S.next.id === 'fill' ? 'up' : S.next.key);
      return;
    }
    if (S.idx < 0 && k === 'item') {
      // はじめの設定が全部済み：商品情報の「次は」は、国選びへ戻さず、案件へ
      const nm = M('商談を進める', 'Advance your deals', '推进商谈', 'Avanzar las negociaciones');
      setNext(b, bb, 'go', nm, M('次の手順：商談を進める（案件の一覧へ）', 'Next: advance your deals (deal list)', '下一步：推进商谈（案件一览）', 'Siguiente: avanzar las negociaciones'), 'dash:home');
      return;
    }
    restoreNext(b, bb);
  }
  function pulse(el) {
    if (!el) return;
    try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) { try { el.scrollIntoView(); } catch (x) { /* 無視 */ } }
    el.classList.remove('k-r5c-pulse');
    void el.offsetWidth;
    el.classList.add('k-r5c-pulse');
    setTimeout(() => { try { el.classList.remove('k-r5c-pulse'); } catch (e) { /* 無視 */ } }, 3200);
    try { if (/^(BUTTON|A|INPUT)$/.test(el.tagName)) el.focus({ preventScroll: true }); } catch (e) { /* 無視 */ }
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('.k-next[data-r5c]');
    if (!b) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    const k = RD.curKey ? RD.curKey() : '';
    if (b.dataset.r5c === 'go') { if (b.dataset.r5cgo) RD.goKey(b.dataset.r5cgo); return; }
    const ip = inPage(well(), k);
    if (ip && ip[0]) pulse(ip[0]);
    if (k === 'ops:reg') { try { if (A().regMark && A().regMark()) setTimeout(touch, 400); } catch (x) { /* 無視 */ } }
  }, true);

  /* ───── ② 規制を調べる：中を見たら済み ───── */
  let regT = 0;
  const regSeen = () => {
    if (locked() || fwd()) return;
    if ((RD.curKey ? RD.curKey() : '') !== 'ops:reg') return;
    try { if (A().regMark && A().regMark()) { clearTimeout(regT); regT = setTimeout(touch, 300); } } catch (e) { /* 無視 */ }
  };
  window.addEventListener('scroll', () => { try { if ((window.scrollY || document.documentElement.scrollTop || 0) > 260) regSeen(); } catch (e) { /* 無視 */ } }, { passive: true });
  document.addEventListener('click', (e) => { try { if (e.target.closest && e.target.closest('#sec-0')) regSeen(); } catch (x) { /* 無視 */ } }, false);

  /* ───── ③ 空の案件一覧：「商談を記録する」も置く ───── */
  function fixHomeRec(w, k) {
    if (k !== 'dash:home') return;
    const S = coreSteps();
    const nb = byText(w, '.k-btn', /^(次は：|Next:|下一步：|Siguiente:)/);
    const old = $('.k-r5c-rec', w);
    const on = !!(nb && S && S.has && S.steps[0].done && S.steps[1].done && !S.steps[5].done);
    if (!on) { if (old) old.remove(); return; }
    if (old) return;
    const p = document.createElement('p');
    p.className = 'k-r5c-rec';
    p.setAttribute('data-noi18n', '1');
    const sp = document.createElement('span');
    sp.textContent = M('すでに話をしている相手がいる方は：', 'Already talking to a buyer? ', '已经有在谈的对象：', '¿Ya habla con un comprador? ');
    const bt = document.createElement('button');
    bt.type = 'button'; bt.className = 'k-btn white k-mini';
    bt.textContent = M('商談を記録する', 'Record a deal', '记录商谈', 'Registrar una negociación');
    bt.title = M('「商談・バイヤー」の画面で、相手を追加して商談を記録します（案件の一覧に出ます）', 'Add the buyer and record the deal on the Deals & buyers screen', '在“商谈·买家”页面添加对象并记录商谈', 'Añada el comprador y registre la negociación');
    bt.addEventListener('click', () => RD.goKey('deal'));
    p.appendChild(sp); p.appendChild(bt);
    const host = nb.parentNode;
    if (nb.nextSibling) host.insertBefore(p, nb.nextSibling.nextSibling || null); else host.appendChild(p);
  }

  /* ───── ⑥ 商品情報を登録：開き直した直後（会話の欄が閉じている）でも、選択肢の札で答えられる（indagri-Q01） ───── */
  const chatReady = () => vis(document.getElementById('fans')) || $$('[data-chip]').some((b) => vis(b) && !b.closest('.rd-x'));
  function pickAfterOpen(tg) {
    const go = document.getElementById('rdfill') || $$('#well button').find((x) => vis(x) && /AIの質問に答える|Answer the AI|回答AI|Responder a la IA/.test(x.textContent || ''));
    if (!go) return false;
    const tx = (tg.textContent || '').trim();
    go.click();
    let n = 0;
    const iv = setInterval(() => {
      n++;
      if (chatReady()) {
        clearInterval(iv);
        // 描き直しで札が作り直されることがある：同じ文字の札を探して押す
        setTimeout(() => {
          const t2 = (tg.isConnected ? tg : null) || $$('.k92r3b-pick').find((x) => (x.textContent || '').trim() === tx);
          if (t2) { t2.dataset.r5cgo = '1'; t2.click(); delete t2.dataset.r5cgo; }
          else { const fa = document.getElementById('fans'); if (fa) { fa.value = tx; try { fa.dispatchEvent(new Event('input', { bubbles: true })); fa.focus(); } catch (e) { /* 無視 */ } } }
        }, 250);
      } else if (n > 24) clearInterval(iv);
    }, 150);
    return true;
  }
  const onPick = (e) => {
    const tg = e.target.closest && e.target.closest('.k92r3b-pick');
    if (!tg || tg.dataset.r5cgo) return;
    if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
    if (chatReady()) return;
    if (pickAfterOpen(tg)) { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); }
  };
  document.addEventListener('click', onPick, true);
  document.addEventListener('keydown', onPick, true);

  /* ───── ⑤ スマホ（マウスの無い画面）：「押すか、マウスを乗せると説明が出ます」→「押すと説明が出ます」（xcut-Q04） ───── */
  const touchy = () => { try { return window.innerWidth <= 820 || window.matchMedia('(hover: none)').matches; } catch (e) { return window.innerWidth <= 820; } };
  function fixHoverWords(w) {
    if (lang() !== 'ja' || !touchy()) return;
    $$('[data-rdhero], .k-qline, .v90glh', w).forEach((root) => {
      if ((root.textContent || '').indexOf('マウスを乗せると') < 0) return;
      const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = tw.nextNode())) { if (n.nodeValue.indexOf('押すか、マウスを乗せると') >= 0) n.nodeValue = n.nodeValue.replace('押すか、マウスを乗せると', '押すと'); }
    });
  }

  /* ───── ⑦ 販売先国：確定したあとは、「3か国までのため入れていない国」から確定済みの国を外す（auto-Q03） ───── */
  function fixCtyOuts(w, k) {
    if (k !== 'cty') return;
    const box = $('.k-v92outs', w);
    if (!box) return;
    let chosen = [];
    try { const t = RD.G('TEN'); chosen = (t && t.ctySel && Array.isArray(t.ctySel.chosen)) ? t.ctySel.chosen.map((x) => String((x && (x.c || x.cty || x.name)) || x)) : []; } catch (e) { chosen = []; }
    if (!chosen.length) return;
    $$('.k-v92out', box).forEach((el) => { const b = $('[data-v92tick]', el); const c = b ? b.getAttribute('data-v92tick') : ''; if (c && chosen.indexOf(c) >= 0) el.remove(); });
    if (!$('.k-v92out', box)) box.remove();
  }

  const old = RD.after;
  RD.after = function () {
    const r = old.apply(this, arguments);
    try {
      const w = well();
      const k = RD.curKey ? RD.curKey() : '';
      if (!fwd() && !locked()) { fixNext(w, k); fixHomeRec(w, k); }
      if (!locked()) fixHoverWords(w);
      if (!locked() && !fwd()) fixCtyOuts(w, k);
    } catch (e) { console.error('[rd v92r5c]', e); }
    return r;
  };
})();

} catch (e) { try { console.error("[rd] rd_v92z91r5c.js", e); } catch (x) { } }
/* ==== rd_v92z92r6a.js ==== */
try {
/* 21.92 r6a：刷新版の層（6巡目の直し）。今の部品は差し替えず、RDX.after を包む
   ① 「いまの次の手順」を1か所（本体の層 window.v92r6a.now()）で決め、右上の「次は」・案件一覧の右上・空の案件一覧の大きいボタン・
      「はじめの設定 n/6 次：…」の札・手順の札が、どれも同じ手順・同じ行き先を指すようにそろえる
      （daily-R01・R02、food-R01、xcut-R01・R02、medical-R05、culture-R05、indagri-R01、auto-R04、other-13）
      ・AIバイヤー開拓：リストがまだ → 作る／リストあり・選んでいない → 選ぶ／選んだ → 確かめて送る・自社のバイヤーに入れる／済み → 商談を進める
      ・最後の手順「商談を進める」は、商談を記録する所（商談・バイヤー）へ1回で着く
      ・「次は」に出す名前は、言語に合わせる（商品情報の画面も）
   ② 規制を調べる：「次は」を押しただけでは済みにしない。調べる枠を見た（4秒）・枠の中を押した ときに済み（culture-N17）
   ③ 多言語の残り（xcut-R04・R05、daily-R07）と、言い回し（food-R04・health-R03・auto-N12・auto-Q03） */
(function () {
  'use strict';
  const RD = window.RDX;
  if (!RD || RD._v92r6a) return;
  RD._v92r6a = 1;
  const { $, $$ } = RD;
  const lang = () => { try { const el = document.getElementById('lang'); const v = String((el && el.value) || (window.I18N && window.I18N.lang) || document.documentElement.lang || 'ja'); return /^en/.test(v) ? 'en' : /^zh/.test(v) ? 'zh' : /^es/.test(v) ? 'es' : 'ja'; } catch (e) { return 'ja'; } };
  const M = (ja, en, zh, es) => { const l = lang(); return l === 'en' ? en : l === 'zh' ? (zh || en) : l === 'es' ? (es || en) : ja; };
  const fwd = () => { try { return !!RD.isFwd(); } catch (e) { return false; } };
  const locked = () => { try { return !!RD.locked(); } catch (e) { return document.body.classList.contains('locked'); } };
  const setTxt = (el, t) => { if (el && el.textContent !== t) el.textContent = t; };
  const vis = (el) => !!(el && (el.offsetWidth || el.offsetHeight));
  const A = () => window.v92r6a || {};
  const now = () => { try { return A().now ? A().now() : null; } catch (e) { return null; } };
  const well = () => document.getElementById('well') || document.querySelector('.stage') || document.body;
  const curKey = () => { try { return RD.curKey ? RD.curKey() : ''; } catch (e) { return ''; } };
  const esc = RD.esc || ((s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])));
  const I = RD.I || (() => '');
  const NEXT_W = () => M('次は', 'Next', '下一步', 'Siguiente');

  /* ───── ① 右上の「次は」 ───── */
  const PAGE_IDX = { up: 0, item: 0, cty: 1, 'ops:reg': 2, deck: 3, db: 4, deal: 5 };
  const byText = (w, sel, re) => $$(sel, w).find((x) => vis(x) && re.test((x.textContent || '').trim()));
  let dbOpened = false; // AIバイヤー開拓：上の札を押して、条件の欄まで来た
  let deckOpened = false; // 営業資料：「下書きを作る」を押して、言語の札まで来た
  // AIバイヤー開拓のいまの段階（リストの有無は本体の層、選んだ数は画面のチェック）
  function dbStage(w) {
    const st = (A().dbList ? A().dbList() : null) || { n: 0 };
    const ob = $('#v71ob', w);
    const rows = ob ? $$('input[type=checkbox][data-v71sel]', ob) : [];
    if (!st.n || !rows.length) return { s: st.n ? 'list' : 'make', n: st.n, ob };
    const sel = rows.filter((x) => x.checked).length;
    return { s: sel ? 'send' : 'pick', n: st.n, sel, ob };
  }
  // その画面の中の主な操作：{ el: 送り先の要素, label: 「次は」に出す言葉, also: いっしょに目立たせる要素 }
  function inPage(w, k) {
    if (k === 'cty') {
      const ok = byText(w, '.rd-p2 .k-btn.big, .rd-p2 .k-btn', /確定する|Confirm|确定|Confirmar/);
      const lb = M('この画面で国を確定する', 'Confirm the countries on this screen', '在本页确定销售国', 'Confirmar los países aquí');
      if (ok) return { el: ok, label: lb };
      const om = byText(w, '.rd-p2 .k-btn.big, .rd-p2 .k-btn, #well .btn', /おまかせ|Leave it to|交给|Dejar/);
      if (om) return { el: om, label: M('この画面で国を選ぶ（おまかせ）', 'Pick countries on this screen (auto)', '在本页选择销售国（交给AI）', 'Elegir países aquí (automático)') };
      return { el: $('#v54rCtyGo', w) || $('.rd-p2', w), label: lb };
    }
    if (k === 'ops:reg') return { el: $('#sec-0', w) || $('#rO', w), label: M('この画面で規制を確かめる', 'Review the regulations on this screen', '在本页确认法规', 'Revisar las regulaciones aquí') };
    if (k === 'deck') {
      const langs = $('.dk3-langs', w);
      if (deckOpened && vis(langs)) {
        const lb = $('button.v54rec', langs) || $('button[data-dk3lang]', langs);
        if (lb) return { el: lb, label: M('この画面で言語を選んで作る', 'Pick a language to create the deck', '在本页选择语言并制作', 'Elegir el idioma y crear aquí') };
      }
      const g = byText(w, '.rd-p2 .k-btn.big, .rd-p2 .k-btn.wide', /作る|つくる|生成|Create|Generate|Crear|Generar|制作/) || $('.rd-p2 .k-btn.big', w);
      return { el: g || $('.rd-p2', w), label: M('この画面で資料を作る', 'Create the deck on this screen', '在本页制作资料', 'Crear la presentación aquí') };
    }
    if (k === 'db') {
      const D = dbStage(w);
      if (D.s === 'make') {
        const mk = $('#rddbob', w), go = $('#v71obGo', w);
        // 上の札「条件を決めてリストを作る」を押したあとは、条件の欄の「AI商社マンにリストを作らせる」へ（上の札へ戻さない）
        return { el: (dbOpened && vis(go)) ? go : vis(mk) ? mk : (go || D.ob || $('.rd-p2', w)), label: M('この画面でリストを作る', 'Build the buyer list on this screen', '在本页制作买家名单', 'Crear la lista aquí') };
      }
      if (D.s === 'pick' || D.s === 'list') {
        const all = D.ob && $('[data-v71act=all]', D.ob);
        return { el: (vis(all) && all) || D.ob || $('.rd-p2', w), label: M('この画面で相手を選ぶ', 'Pick buyers on this screen', '在本页选择对象', 'Elegir compradores aquí'), title: M('リストはできています（' + D.n + '社）。行の左のチェックか「すべて選ぶ」で相手を選ぶと、「確かめて送る」「自社のバイヤーに入れる」が押せます', 'Your list is ready (' + D.n + '). Tick the rows or press “Select all”; then you can send or add them to your buyers', '名单已生成（' + D.n + '家）。勾选各行或按“全选”后，即可发送或加入自有买家', 'La lista está lista (' + D.n + '). Marque las filas o pulse «Seleccionar todo»; luego podrá enviar o añadirlos') };
      }
      const sd = $('[data-v71act=send]', D.ob), my = $('[data-v71act=my]', D.ob);
      return { el: (vis(sd) && sd) || D.ob, also: vis(my) ? my : null, label: M('この画面で確かめて送る／自社のバイヤーに入れる', 'Review & send, or add to your buyers', '在本页确认后发送／加入自有买家', 'Revisar y enviar, o añadir a sus compradores'), title: M('選んだ ' + D.sel + '社に、文面を1件ずつ確かめて送る（承認するまで送りません）か、「＋ 自社のバイヤーに入れる」で、この手順が済みます', 'Review and send to the ' + D.sel + ' selected (nothing is sent until you approve), or add them to your buyers — either finishes this step', '对所选 ' + D.sel + ' 家逐一确认后发送（批准前不会发送），或“加入自有买家”，即可完成此步骤', 'Revise y envíe a los ' + D.sel + ' seleccionados (nada se envía sin su aprobación) o añádalos a sus compradores') };
    }
    if (k === 'deal') {
      const r = $$('.rd-p2 .k-btn.big, #well [data-onclick="openDealForm()"]', w).find(vis) || byText(w, '.rd-p2 .k-btn.big, #well .btn', /商談を記録する|Record a deal|记录商谈|Registrar/);
      return { el: r || $('.rd-p2', w), label: M('この画面で商談を記録する', 'Record a meeting on this screen', '在本页记录商谈', 'Registrar una negociación aquí') };
    }
    return null;
  }
  function decide(w, k, b) {
    const N = now(), pi = PAGE_IDX[k];
    if (!N || pi == null || N.idx < 0) return null;                              // 全部済み：前の層のまま
    if (b.dataset.v92i || b.dataset.r4cfill || b.dataset.v92eDrop) return null;   // 商品の登録の途中（足りない情報・資料がまだ）の案内はそのまま
    if (N.idx === 0 && pi === 0) return null;
    if (N.idx === pi) {
      const ip = inPage(w, k);
      if (!ip || !ip.el) return null;
      return { mode: 'act', label: ip.label, title: ip.title || M('この画面の手順「' + N.next.t + '」がまだです。押すと、この画面の中の操作へ進みます', 'This step is not finished yet. Press to jump to the action on this screen', '本页的步骤尚未完成。按下后跳到本页中的操作', 'Este paso aún no está hecho. Pulse para ir a la acción en esta pantalla') };
    }
    return { mode: 'go', label: N.label, key: N.key, title: M('次の手順：' + N.next.t + '（はじめの設定の、まだの手順）', 'Next: ' + N.label + ' (the next unfinished setup step)', '下一步：' + N.label + '（初始设置中尚未完成的步骤）', 'Siguiente: ' + N.label + ' (paso pendiente)') };
  }
  function fixNext(w, k) {
    const b = $('[data-rdhero] .k-next', w);
    if (!b) return;
    const bb = $('b', b);
    if (!bb) return;
    const d = decide(w, k, b);
    if (!d) { if (b.dataset.r6a) { delete b.dataset.r6a; delete b.dataset.r6ago; } return; }
    if (b.dataset.r6a !== d.mode) b.dataset.r6a = d.mode;
    if ((b.dataset.r6ago || '') !== (d.key || '')) b.dataset.r6ago = d.key || '';
    if (b.hasAttribute('data-kbc')) b.removeAttribute('data-kbc');
    if (bb.getAttribute('data-noi18n') == null) bb.setAttribute('data-noi18n', '1');
    setTxt(bb, d.label);
    if (b.title !== d.title) b.title = d.title;
    const sm = $('small', b);
    if (sm) { if (sm.getAttribute('data-noi18n') == null) sm.setAttribute('data-noi18n', '1'); setTxt(sm, NEXT_W()); }
    const here = d.mode === 'act';
    if (b.classList.contains('k-r5c-here') !== here) b.classList.toggle('k-r5c-here', here);
  }
  function pulse(el, noFocus) {
    if (!el) return;
    try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) { try { el.scrollIntoView(); } catch (x) { /* 無視 */ } }
    flash(el);
    try { if (!noFocus && /^(BUTTON|A|INPUT)$/.test(el.tagName)) el.focus({ preventScroll: true }); } catch (e) { /* 無視 */ }
  }
  function flash(el) {
    if (!el) return;
    el.classList.remove('k-r5c-pulse');
    void el.offsetWidth;
    el.classList.add('k-r5c-pulse');
    setTimeout(() => { try { el.classList.remove('k-r5c-pulse'); } catch (e) { /* 無視 */ } }, 3200);
  }
  function doAct(k) {
    const ip = inPage(well(), k);
    if (!ip || !ip.el) return;
    pulse(ip.el);
    if (ip.also) flash(ip.also);
  }
  // 「商談を進める」で商談・バイヤーに着いたら、「商談を記録する」を目立たせる（1回で着く）
  let arriveT = 0;
  function goStep(key) {
    if (!key) return;
    RD.goKey(key);
    if (key === 'deal') { clearTimeout(arriveT); arriveT = setTimeout(() => { try { const N = now(); if (curKey() === 'deal' && N && N.idx === 5) doAct('deal'); } catch (e) { /* 無視 */ } }, 900); }
  }
  // 前の層（r3a・r4c・r5c）より先に受ける（window で受ける）
  window.addEventListener('click', (e) => {
    const t = e.target;
    if (!t || !t.closest) return;
    const b = t.closest('.k-next[data-r6a]');
    if (b) {
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      if (b.dataset.r6a === 'go') { goStep(b.dataset.r6ago); return; }
      doAct(curKey());
      return;
    }
    // 案件一覧の「次は」・大きいボタン・札・手順の札：最後の手順は、商談を記録する所へ
    const h = t.closest('[data-r6astep]');
    if (h) { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); goStep(h.dataset.r6astep); return; }
    const k = curKey();
    if (k === 'dash:home') {
      const N = now();
      if (N && N.idx === 5) {
        const pill = t.closest('.k-pills .k-pill[data-kbc]');
        const stp = t.closest('.k-clempty .k-clstep.on, .k-clempty .k-clstep:last-of-type');
        if ((pill && /はじめの設定|Getting started|Setup|入门设置|初始设置|Configuración inicial/i.test(pill.textContent || '')) || (stp && !stp.classList.contains('done') && /商談を進める|Advance your deals|推进商谈|Avanzar/.test(stp.textContent || ''))) {
          e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); goStep('deal'); return;
        }
      }
    }
    if (k === 'db' && t.closest('#rddbob')) dbOpened = true;
    if (k === 'deck' && t.closest('[data-kact]') && /下書き|作る|Create|draft|Crear|制作|草稿/i.test((t.closest('[data-kact]').textContent || ''))) deckOpened = true;
  }, true);

  /* ───── ①' AIバイヤー開拓：リストができたら、上の札・押せない理由も合わせる ───── */
  function fixDb(w, k) {
    if (k !== 'db') return;
    const D = dbStage(w);
    const box = $('[data-rddb]', w);
    if (box && D.n) {
      const mk = $('#rddbob', box);
      const card = mk && mk.closest('.rd-card');
      const p = card && $$('p', card).find((x) => !x.classList.contains('rd-note'));
      if (p) {
        const t = M('最新のリスト：' + D.n + '件（この下に出ています）', 'Latest list: ' + D.n + ' (shown below)', '最新名单：' + D.n + ' 家（显示在下方）', 'Última lista: ' + D.n + ' (abajo)');
        if (p.textContent !== t) { p.setAttribute('data-noi18n', '1'); p.textContent = t; p.style.color = ''; }
      }
      if (mk) {
        const tn = Array.from(mk.childNodes).find((n) => n.nodeType === 3 && n.nodeValue.trim());
        const t = M('リストを見る・条件を変えて作り直す ', 'See the list / rebuild with other conditions ', '查看名单／更改条件重新制作 ', 'Ver la lista / rehacerla ');
        if (tn && tn.nodeValue !== t) { mk.setAttribute('data-noi18n', '1'); tn.nodeValue = t; }
      }
      const em = $$('.rd-empty', box).find((x) => /まだ相手はいません|No buyers yet|还没有对象|Aún no hay/.test(x.textContent || ''));
      if (em) { em.setAttribute('data-noi18n', '1'); setTxt(em, M('まだ連絡した相手はいません。下のリストで相手を選んで送ると、ここに出ます', 'No one contacted yet. Pick buyers in the list below and send — they will appear here', '尚未联系任何对象。在下方名单中选择并发送后，会显示在这里', 'Aún no ha contactado a nadie. Elija en la lista de abajo y envíe')); }
    }
    // 押せない間は、理由を一言
    const ob = D.ob;
    const sd = ob && $('[data-v71act=send]', ob);
    let why = ob && $('.k-r6a-why', ob);
    if (sd && sd.disabled && vis(sd)) {
      const t = M('↑ 3つのボタンは、相手を選ぶと押せます（行の左のチェック、または「すべて選ぶ」）', '↑ These buttons work once you select buyers (tick the rows, or “Select all”)', '↑ 选择对象后即可按下（勾选各行，或“全选”）', '↑ Estos botones se activan al elegir compradores (marque las filas o «Seleccionar todo»)');
      if (!why) { why = document.createElement('p'); why.className = 'k-r6a-why'; why.setAttribute('data-noi18n', '1'); (sd.parentElement || ob).insertAdjacentElement('afterend', why); }
      setTxt(why, t);
      [sd, $('[data-v71act=my]', ob), $('[data-v71act=ap]', ob)].forEach((x) => { if (x && x.disabled && !x.title) x.title = M('相手を選ぶと押せます', 'Select buyers first', '请先选择对象', 'Elija compradores primero'); });
    } else if (why) why.remove();
  }

  /* ───── ①'' 案件一覧（ホーム）：右上・大きいボタン・札は、同じ「いまの次の手順」 ───── */
  function fixHome(w, k) {
    const H = document.documentElement;
    if (k !== 'dash:home') { if (H.classList.contains('k-r6a-goal')) H.classList.remove('k-r6a-goal'); return; }
    const N = now();
    const hero = $('[data-rdhero]', w), cta = hero && $('.k-hcta', hero);
    if (N && N.next) {
      const coreKey = N.next.id === 'fill' ? 'up' : N.next.key;
      // 右上：はじめの設定が終わるまでは「次は ◯◯」
      if (cta) {
        const sig = N.key + '|' + N.label + '|' + lang();
        if (cta.dataset.r6asig !== sig) {
          cta.dataset.r6asig = sig; cta.dataset.k92c = coreKey; cta.dataset.kbc = N.key; cta.dataset.r6astep = N.key;
          cta.className = 'k-hcta k92c-hnext';
          cta.title = M('次の手順：' + N.next.t, 'Next: ' + N.label, '下一步：' + N.label, 'Siguiente: ' + N.label);
          cta.innerHTML = '<small data-noi18n="1">' + esc(NEXT_W()) + '</small><b data-noi18n="1">' + esc(N.label) + '</b>' + I('arr', 16, 2.4);
        }
      }
      // 空の案件一覧の大きいボタン：5/6・6/6 の手前でも「次は：◯◯」（済んだ手順の「バイヤーを探す」に戻さない）
      const empty = $('.k-clempty', w);
      if (empty) {
        const btn = $$('.k-btn', empty).find((b) => b.dataset.kbc || b.dataset.r6astep);
        if (btn && N.idx >= 4) {
          const sig = N.key + '|' + N.label;
          if (btn.dataset.r6asig !== sig) {
            btn.dataset.r6asig = sig; btn.dataset.kbc = N.key; btn.dataset.r6astep = N.key;
            btn.setAttribute('data-noi18n', '1');
            btn.innerHTML = I('arr', 18, 2.4) + esc(M('次は：', 'Next: ', '下一步：', 'Siguiente: ') + N.label);
            btn.title = N.next.why || '';
          }
          let wy = $('.k92c-why', empty);
          if (N.next.why) { if (!wy) { btn.insertAdjacentHTML('afterend', '<small class="k92c-why"></small>'); wy = $('.k92c-why', empty); } setTxt(wy, N.next.why); }
          else if (wy) wy.remove();
        }
        // 大きいボタンが「商談を進める」のときは、同じ行き先の小さい入口は要らない
        const rec = $('.k-r5c-rec', empty) || $('.k-r5c-rec', w);
        if (rec) rec.style.display = N.idx === 5 ? 'none' : '';
      }
    } else if (cta && cta.dataset.r6asig) {
      // 6/6 になった：元の「＋ バイヤーを探す」に戻す
      delete cta.dataset.r6asig; delete cta.dataset.r6astep; delete cta.dataset.k92c;
      cta.dataset.kbc = 'db'; cta.className = 'k-btn k-hcta'; cta.title = '';
      cta.innerHTML = I('plus', 18, 2.4) + 'バイヤーを探す';
    }
    // 6/6 のあと・目標を入れる前：「次」に見えるのは提案の「目標を入れる」の1つ（右上は白いボタンに）
    const prop = $$('.v88prop .btn, [class*=v88prop] .btn', w).find((b) => vis(b) && b.getAttribute('data-act') === 'rm.form');
    const goal = !!(N && !N.next && prop);
    if (H.classList.contains('k-r6a-goal') !== goal) H.classList.toggle('k-r6a-goal', goal);
  }

  /* ───── ② 規制を調べる：調べる枠を見た（4秒）・枠の中を押した ときに済み ───── */
  let regN = 0;
  const regOn = () => !locked() && !fwd() && curKey() === 'ops:reg';
  function regDone() {
    try {
      if (A().regLook && A().regLook()) {
        setTimeout(apply, 60);
        try { RD.after(); } catch (e) { /* 無視 */ }
        try { const tt = RD.G && RD.G('toast'); if (typeof tt === 'function') tt(M('規制を確かめました（はじめの設定の「規制を調べる」が済みになりました）', 'Regulations reviewed (setup step done)', '已确认法规（初始设置的该步骤已完成）', 'Regulaciones revisadas (paso completado)')); } catch (e) { /* 無視 */ }
      }
    } catch (e) { /* 無視 */ }
  }
  setInterval(() => {
    try {
      if (!regOn() || document.hidden) { regN = 0; return; }
      const s = document.getElementById('sec-0');
      if (!s) { regN = 0; return; }
      const r = s.getBoundingClientRect(), vh = window.innerHeight || 800;
      const inView = Math.min(r.bottom, vh) - Math.max(r.top, 0);
      if (inView >= Math.min(220, r.height * 0.6) && r.top < vh * 0.6) { regN++; if (regN >= 4) { regN = 0; regDone(); } } else regN = 0;
    } catch (e) { /* 無視 */ }
  }, 1000);
  window.addEventListener('click', (e) => { try { if (regOn() && e.target.closest && e.target.closest('#sec-0') && !e.target.closest('.k-q')) regDone(); } catch (x) { /* 無視 */ } }, true);

  /* ───── ③ 多言語の残り ───── */
  // 言語の印（CSS 用）
  function langClass() {
    const H = document.documentElement, l = lang();
    ['en', 'zh', 'es'].forEach((x) => { const on = l === x; if (H.classList.contains('k-r6a-' + x) !== on) H.classList.toggle('k-r6a-' + x, on); });
  }
  // ログイン画面：言葉の切れ目（span.k-nw）の間に空白が無く、英語・スペイン語で「isa／yourtrade」とつながる（culture-R06）
  function fixLoginGaps() {
    const l = lang();
    if (l !== 'en' && l !== 'es') return;
    $$('.k-lgcatch .k-nw').forEach((s) => {
      const nx = s.nextSibling;
      if (nx && nx.nodeType === 1 && nx.classList && nx.classList.contains('k-nw')) s.after(document.createTextNode(' '));
    });
  }
  // 物流会社：前の層が「日本語／英語」の2つだけで出している文（中国語・スペイン語で英語のまま。xcut-R05 (2)）
  const FW = {
    'Quote status:': ['报价状态：', 'Estado de la cotización:'],
    'Assignment:': ['负责・处理：', 'Asignación:'],
    'Requests with no matching rate:': ['因没有费率而未能报价的委托：', 'Solicitudes sin tarifa aplicable:'],
    'open / close': ['展开／收起', 'abrir / cerrar'],
    'What happens when you press Done': ['按“完成”后会怎样', 'Qué ocurre al pulsar «Hecho»'],
    'Register a rate to quote': ['登记费率并回复', 'Registrar tarifa y cotizar'],
    'Edit quoted rate': ['修改已回复的金额', 'Editar importe cotizado'],
    'Number details (requests received, AI auto-answers, lanes, holds)': ['数字明细（收到的委托・AI自动回复・已登记航线・暂留）', 'Detalle de cifras (solicitudes recibidas, respuestas automáticas de IA, rutas, reservas)'],
  };
  function fixFwdWords(w) {
    const l = lang();
    if (l !== 'zh' && l !== 'es') return;
    const ix = l === 'zh' ? 0 : 1;
    const tw = document.createTreeWalker(w, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = tw.nextNode())) {
      const v = n.nodeValue, t = v.trim();
      if (t.length < 8 || !/^[A-Za-z0-9]/.test(t)) continue;
      const hit = FW[t];
      if (hit) { n.nodeValue = v.replace(t, hit[ix]); continue; }
      const m = /^(\d+) days past the (\S+) target$/.exec(t);
      if (m) n.nodeValue = l === 'zh' ? '已超过处理目标日 ' + m[2] + ' ' + m[1] + ' 天' : m[1] + ' días después del objetivo del ' + m[2];
    }
  }

  /* ───── ④ 言い回し ───── */
  const cases = () => { try { return RD.allCases ? (RD.allCases() || []) : []; } catch (e) { return []; } };
  const WON = (c) => !!(c && /^(取引中|受注)$/.test(String(c.ss || '')));
  const T_FIRST = '最初の連絡を送る';
  const firstTxt = (el) => Array.from(el.childNodes).find((x) => x.nodeType === 3 && x.nodeValue.trim());
  const WAIT_RE = /・記録した次の行動・相手の返事待ち$/;
  const WAIT_TO = '・記録した次の行動（先に送った連絡は、相手の返事待ち）';
  const WON_T = () => M('受注の書類をつくる（見積書・請求書）', 'Create the order documents (quote / invoice)', '制作订单文件（报价单・发票）', 'Crear los documentos del pedido (cotización / factura)');
  const WON_S = () => M('受注を記録した案件です。「書類をつくる」で作れます（相手にはまだ送っていません）', 'An order is recorded for this case. Create them in “Create documents” (nothing has been sent yet)', '此案件已记录订单。可在“制作文件”中制作（尚未发送给对方）', 'Este caso tiene un pedido registrado. Créelos en «Crear documentos» (aún no se ha enviado nada)');
  // 案件一覧：受注を記録した相手の次の行動（food-R04）／自分の行動の行の「・相手の返事待ち」（health-R03）
  function paintRows(body) {
    const ord = RD._caseOrder || [];
    const L = cases();
    $$('tr.k-clrow', body).forEach((tr, i) => {
      const nx = $('.c-nx > span', tr);
      if (!nx) return;
      const sm = $('small', nx);
      if (sm && WAIT_RE.test(sm.textContent || '')) sm.textContent = sm.textContent.replace(WAIT_RE, WAIT_TO);
      const t = firstTxt(nx);
      if (t && t.nodeValue.trim() === T_FIRST) {
        const c = L.find((x) => x.key === ord[i]);
        if (WON(c)) { nx.setAttribute('data-noi18n', '1'); t.nodeValue = WON_T(); nx.title = WON_T(); if (sm) sm.textContent = WON_S(); }
      }
    });
  }
  function fixRows(w, k) {
    if (k !== 'dash:home') return;
    const body = $('#k-clbody', w);
    if (!body) return;
    paintRows(body);
    if (!body.dataset.r6ao) { body.dataset.r6ao = '1'; new MutationObserver(() => { try { paintRows(body); } catch (e) { /* 無視 */ } }).observe(body, { childList: true }); }
  }
  // 案件の詳細：同じ直し＋「見積の出し方」などは AI商社マンの画面へ移ることを先に書く（auto-N12）
  function fixCase(w, k) {
    if (k !== 'dash:case') return;
    const box = $('.k-cd', w);
    if (!box) return;
    const p = $('.k-cdnx', box);
    if (p) {
      const sm = $('small', p);
      if (sm && WAIT_RE.test(sm.textContent || '')) sm.textContent = sm.textContent.replace(WAIT_RE, WAIT_TO);
      const t = firstTxt(p);
      if (t && t.nodeValue.trim() === T_FIRST && WON(RD._case0)) { p.setAttribute('data-noi18n', '1'); t.nodeValue = WON_T(); if (sm) sm.textContent = WON_S(); }
    }
    const chips = $$('button.k-chip', box).filter((b) => !b.dataset.r6a);
    if (chips.length && !$('.k-r6a-ainote', box)) {
      const host = chips[0].parentElement;
      if (host) {
        const s = document.createElement('small');
        s.className = 'k-r6a-ainote'; s.setAttribute('data-noi18n', '1');
        s.textContent = M('↓ 押すと「AI商社マンに相談」の画面に移って答えます（案件へは、左の「案件」で戻れます）', '↓ Pressing one opens the “Ask the AI Trade Agent” screen with the answer (return via “Cases” on the left)', '↓ 按下后会转到“咨询AI商社人”页面作答（可从左侧“案件”返回）', '↓ Al pulsar se abre la pantalla «Consultar al agente de IA» con la respuesta (vuelva por «Casos» a la izquierda)');
        host.insertAdjacentElement('beforebegin', s);
      }
      chips.forEach((b) => { b.dataset.r6a = '1'; if (!b.title) b.title = M('押すと「AI商社マンに相談」の画面に移って答えます', 'Opens the AI Trade Agent screen with the answer', '将转到“咨询AI商社人”页面作答', 'Abre la pantalla del agente de IA con la respuesta'); });
    }
  }
  // 中古車・建設機械（1台から売る商材）：例の言葉が「個・サンプル・成分」のまま残る所（auto-07・08。日本語の画面）
  const isAuto = () => { try { const c = String(((RD.G && RD.G('TEN')) || {}).cat || ''); return c === '中古車' || c === '建設機械'; } catch (e) { return false; } };
  const AUTO_T = [['成分・仕様', '仕様・状態'], ['500個でいくら？', '1台でいくら？'], ['数量帯ごとの単価', '台数ごとの単価']];
  const AUTO_P = [['例：来月バイヤーが来日予定。サンプル3種を先送りしたい', '例：来月バイヤーが来日予定。先に仕様書と写真を送りたい'], ['例：38.00', '例：46000']];
  function fixAutoWords() {
    if (lang() !== 'ja' || !isAuto()) return;
    const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = tw.nextNode())) {
      const v = n.nodeValue;
      if (v.length < 5 || v.length > 400) continue;
      for (const p of AUTO_T) { if (v.indexOf(p[0]) >= 0) { const pe = n.parentElement; if (pe && !/^(SCRIPT|STYLE|TEXTAREA)$/.test(pe.tagName)) n.nodeValue = v.split(p[0]).join(p[1]); } }
    }
    $$('input[placeholder], textarea[placeholder]').forEach((el) => { for (const p of AUTO_P) { if (el.placeholder === p[0]) el.placeholder = p[1]; } });
  }
  function more(w, k) {
    langClass();
    if (fwd()) { fixFwdWords(w); return; }
    fixRows(w, k); fixCase(w, k); fixAutoWords();
  }
  /*__MORE__*/

  let lastK = '';
  function apply() {
    try {
      if (locked()) { langClass(); fixLoginGaps(); return; }
      const w = well(), k = curKey();
      if (k !== lastK) { lastK = k; if (k !== 'deck') deckOpened = false; if (k !== 'db') dbOpened = false; }
      if (!fwd()) { fixNext(w, k); fixDb(w, k); fixHome(w, k); }
      more(w, k);
    } catch (e) { console.error('[rd v92r6a]', e); }
  }
  const old = RD.after;
  RD.after = function () {
    const r = old.apply(this, arguments);
    apply();
    return r;
  };
  // 画面の中だけが描き直されたとき（リストを作った・相手を選んだ・商談を記録した）も、すぐ合わせる
  let t1 = 0, t2 = 0;
  const soon = () => { clearTimeout(t1); clearTimeout(t2); t1 = setTimeout(apply, 250); t2 = setTimeout(apply, 1600); };
  document.addEventListener('click', soon, false);
  document.addEventListener('change', soon, false);
  const lg = document.getElementById('lang');
  if (lg) lg.addEventListener('change', () => setTimeout(apply, 700));
})();

} catch (e) { try { console.error("[rd] rd_v92z92r6a.js", e); } catch (x) { } }
/* ==== rd_v92z93r6b.js ==== */
try {
/* 貿易クラウドAI商社マン 21.92 r6b（刷新版の層）
   6巡目の直し（受注と見積の数え方・目標と道筋の ✓）は、本体の層 logic_v2192r6b.ts に入れた（今の版・刷新版の両方に効く）。
   刷新版が足した部品（商談・バイヤーの札・案件一覧）は、やりとりのステータスをそのまま読むので、手を入れていない。 */

} catch (e) { try { console.error("[rd] rd_v92z93r6b.js", e); } catch (x) { } }
/* ==== rd_v92z94r6c.js ==== */
try {
/* 21.92 r6c：刷新版の層。6巡目の書類・物流 AI の直しは本体の層（logic_v2192r6c）で行う（今の版と刷新版の両方に効かせるため）。
   ここは、刷新版が画面を描き直したあとに本体の層の「描いたあとの直し」（仕向港の食い違いの箱・出港済みの注記・ボタンのそばの理由）をもう一度呼ぶだけ。 */
(function () {
  if (window.__rdV92r6c) return;
  window.__rdV92r6c = 1;
  try {
    if (window.RDX && typeof RDX.after === "function") {
      var _a = RDX.after;
      RDX.after = function () {
        var r = _a.apply(this, arguments);
        try { if (window.v92r6c && window.v92r6c.after) setTimeout(window.v92r6c.after, 220); } catch (e) {}
        return r;
      };
    }
  } catch (e) {}
})();

} catch (e) { try { console.error("[rd] rd_v92z94r6c.js", e); } catch (x) { } }
/* ==== rd_v92z95r6x.js ==== */
try {
/* 21.92 r6x：刷新版の層（6巡目の直しを重ねた版の確かめで見つけた食い違い）。今の部品は差し替えず、RDX.after を包む
   ① 受注を記録した案件の「次の行動」（r6a の food-R04）と、受注の案件の書類（r6b の caseList）の食い違い
      r6a は、状況が 取引中 で次の行動が「最初の連絡を送る」の案件を、いつも
      「受注の書類をつくる（見積書・請求書）／…「書類をつくる」で作れます」にする（書類があるかは見ていない）。
      書類をつくり「受注内容を編集」で直したあとも「作れます」のままで、分析の内訳（r6b）は同じ案件を
      「金額の出どころ：書類の額」と出す。→ その案件に書類（出荷案件）があるかを r6b の window.v92r6b.cases() の
      1か所で見て、あれば「受注の書類を確かめて送る／書類は「書類をつくる」に入っています（案件 No.）」にする。
      書類が無い間は r6a の文のまま。案件一覧の行と、案件の詳細の両方。 */
(function () {
  'use strict';
  const RD = window.RDX;
  if (!RD || RD._v92r6x) return;
  RD._v92r6x = 1;
  const { $, $$ } = RD;
  const lang = () => { try { const el = document.getElementById('lang'); const v = String((el && el.value) || (window.I18N && window.I18N.lang) || document.documentElement.lang || 'ja'); return /^en/.test(v) ? 'en' : /^zh/.test(v) ? 'zh' : /^es/.test(v) ? 'es' : 'ja'; } catch (e) { return 'ja'; } };
  const M = (ja, en, zh, es) => { const l = lang(); return l === 'en' ? en : l === 'zh' ? (zh || en) : l === 'es' ? (es || en) : ja; };
  const well = () => document.getElementById('well') || document.querySelector('.stage') || document.body;
  const curKey = () => { try { return RD.curKey ? RD.curKey() : ''; } catch (e) { return ''; } };
  const fwd = () => { try { return !!RD.isFwd(); } catch (e) { return false; } };
  const locked = () => { try { return !!RD.locked(); } catch (e) { return document.body.classList.contains('locked'); } };

  // r6a が入れる文（4つの言語）と、もとの文。どちらが出ていても同じ扱いにする
  const T_FIRST = '最初の連絡を送る';
  const R6A_T = ['受注の書類をつくる（見積書・請求書）', 'Create the order documents (quote / invoice)', '制作订单文件（报价单・发票）', 'Crear los documentos del pedido (cotización / factura)'];
  const DOC_ALL = ['受注の書類を確かめて送る（見積書・請求書）', 'Review and send the order documents (quote / invoice)', '确认并发送订单文件（报价单・发票）', 'Revisar y enviar los documentos del pedido (cotización / factura)'];
  const DOC_T = () => M(DOC_ALL[0], DOC_ALL[1], DOC_ALL[2], DOC_ALL[3]);
  const DOC_S = (no) => M(`受注を記録した案件です。書類は「書類をつくる」に入っています（案件 No. ${no}）。相手にはまだ送っていません`,
    `An order is recorded for this case. Its documents are in “Create documents” (case no. ${no}). Nothing has been sent yet`,
    `此案件已记录订单。文件已在“制作文件”中（案件编号 ${no}）。尚未发送给对方`,
    `Este caso tiene un pedido registrado. Sus documentos están en «Crear documentos» (caso n.º ${no}). Aún no se ha enviado nada`);
  const WON = (c) => !!(c && /^(取引中|受注)$/.test(String(c.ss || '')));
  const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();
  const firstTxt = (el) => Array.from(el.childNodes).find((x) => x.nodeType === 3 && x.nodeValue.trim());
  // 受注の案件のうち、書類（出荷案件）があるもの。r6b の caseList が決めた「受注」と「書類の案件 No.」だけを使う
  const wonDocs = () => { try { const A = window.v92r6b; return A && A.cases ? (A.cases() || []).filter((x) => x && x.stage === 'won' && x.S && x.no) : []; } catch (e) { return []; } };
  const docOf = (c, L) => {
    if (!WON(c) || !c.name) return null;
    const n = norm(c.name);
    return L.find((x) => norm(x.buyer) === n && (c.pi == null || !x.u || x.u.i == null || x.u.i === c.pi)) || null;
  };
  function paint(host, c, L) {
    const t = firstTxt(host);
    if (!t) return;
    const v = t.nodeValue.trim();
    if (v !== T_FIRST && R6A_T.indexOf(v) < 0 && DOC_ALL.indexOf(v) < 0) return;
    const d = docOf(c, L);
    if (!d) return;
    const sm0 = $('small', host);
    if (v === DOC_T() && (!sm0 || sm0.textContent === DOC_S(d.no))) return;
    host.setAttribute('data-noi18n', '1');
    t.nodeValue = DOC_T();
    if (host.title) host.title = DOC_T();
    const sm = $('small', host);
    if (sm) sm.textContent = DOC_S(d.no);
  }
  function paintRows(body) {
    const ord = RD._caseOrder || [];
    let C = []; try { C = RD.allCases ? (RD.allCases() || []) : []; } catch (e) { C = []; }
    const L = wonDocs();
    if (!L.length) return;
    $$('tr.k-clrow', body).forEach((tr, i) => {
      const nx = $('.c-nx > span', tr);
      if (!nx) return;
      paint(nx, C.find((x) => x.key === ord[i]), L);
    });
  }
  function apply() {
    try {
      if (locked() || fwd()) return;
      const w = well(), k = curKey();
      if (k === 'dash:home') {
        const body = $('#k-clbody', w);
        if (body) {
          paintRows(body);
          if (!body.dataset.r6xo) { body.dataset.r6xo = '1'; new MutationObserver(() => { try { paintRows(body); } catch (e) { /* 無視 */ } }).observe(body, { childList: true, subtree: true, characterData: true }); }
        }
      } else if (k === 'dash:case') {
        const p = $('.k-cd .k-cdnx', w);
        if (p) { const L = wonDocs(); if (L.length) paint(p, RD._case0, L); }
      }
    } catch (e) { console.error('[rd v92r6x]', e); }
  }
  const old = RD.after;
  RD.after = function () {
    const r = old.apply(this, arguments);
    apply();
    return r;
  };
  let t1 = 0, t2 = 0;
  const soon = () => { clearTimeout(t1); clearTimeout(t2); t1 = setTimeout(apply, 300); t2 = setTimeout(apply, 1700); };
  document.addEventListener('click', soon, false);
  const lg = document.getElementById('lang');
  if (lg) lg.addEventListener('change', () => setTimeout(apply, 800));
})();

} catch (e) { try { console.error("[rd] rd_v92z95r6x.js", e); } catch (x) { } }
/* ==== rd_v92z96r7a.js ==== */
try {
/* 21.92 r7a（刷新版の層）
   health-S08：案件一覧・案件の詳細の「次の行動」。状況「見積提示」を記録した相手（アプリからはまだ連絡を送っていない）に
   「最初の連絡を送る」と出ていた → 状況に合った行動「見積の返事を確かめる」に（受注の相手は r6a が直している。ここは見積提示だけ）。 */
(function () {
  const RD = window.RDX;
  if (!RD || RD._v92r7a) return;
  RD._v92r7a = 1;
  const { $, $$ } = RD;
  const lang = () => { try { const el = document.getElementById('lang'); const v = String((el && el.value) || (window.I18N && window.I18N.lang) || document.documentElement.lang || 'ja'); return /^en/.test(v) ? 'en' : /^zh/.test(v) ? 'zh' : /^es/.test(v) ? 'es' : 'ja'; } catch (e) { return 'ja'; } };
  const M = (ja, en, zh, es) => { const l = lang(); return l === 'en' ? en : l === 'zh' ? (zh || en) : l === 'es' ? (es || en) : ja; };
  const well = () => document.getElementById('well') || document.querySelector('.stage') || document.body;
  const curKey = () => { try { return RD.curKey ? RD.curKey() : ''; } catch (e) { return ''; } };
  const cases = () => { try { return RD.allCases ? (RD.allCases() || []) : []; } catch (e) { return []; } };
  const T_FIRST = '最初の連絡を送る';
  const QUO = (c) => !!(c && /^見積提示/.test(String(c.ss || '')));
  const firstTxt = (el) => Array.from(el.childNodes).find((x) => x.nodeType === 3 && x.nodeValue.trim());
  const Q_T = () => M('見積の返事を確かめる', 'Check for a reply to the quote', '确认报价的回复', 'Comprobar la respuesta a la cotización');
  const Q_S = () => M('見積提示を記録した案件です（アプリからは、まだ連絡を送っていません。返事が来たら、商談の記録に残します）', 'A quote is recorded for this case (nothing has been sent from the app yet; record the reply when it arrives)', '此案件已记录报价（尚未从应用发送联系；收到回复后请记入商谈记录）', 'Hay una cotización registrada (aún no se ha enviado nada desde la app)');
  function rows(w) {
    const body = $('#k-clbody', w);
    if (!body) return;
    const ord = RD._caseOrder || [];
    const L = cases();
    $$('tr.k-clrow', body).forEach((tr, i) => {
      const nx = $('.c-nx > span', tr);
      if (!nx) return;
      const t = firstTxt(nx);
      if (!t || t.nodeValue.trim() !== T_FIRST) return;
      const c = L.find((x) => x.key === ord[i]);
      if (!QUO(c)) return;
      const sm = $('small', nx);
      nx.setAttribute('data-noi18n', '1'); t.nodeValue = Q_T(); nx.title = Q_T(); if (sm) sm.textContent = Q_S();
    });
    if (!body.dataset.r7ao) { body.dataset.r7ao = '1'; new MutationObserver(() => { try { rows(well()); } catch (e) { /* 無視 */ } }).observe(body, { childList: true }); }
  }
  function detail(w) {
    const p = $('.k-cd .k-cdnx', w);
    if (!p) return;
    const t = firstTxt(p);
    if (t && t.nodeValue.trim() === T_FIRST && QUO(RD._case0)) { p.setAttribute('data-noi18n', '1'); t.nodeValue = Q_T(); const sm = $('small', p); if (sm) sm.textContent = Q_S(); }
  }
  function apply() {
    try {
      const w = well(), k = curKey();
      if (k === 'dash:home') rows(w);
      if (k === 'dash:case') detail(w);
    } catch (e) { console.error('[rd v92r7a]', e); }
  }
  const old = RD.after;
  RD.after = function () { const r = old.apply(this, arguments); apply(); return r; };
  let t1 = 0;
  document.addEventListener('click', () => { clearTimeout(t1); t1 = setTimeout(apply, 300); }, false);
})();

} catch (e) { try { console.error("[rd] rd_v92z96r7a.js", e); } catch (x) { } }
/* ==== rd_v92z97r7b.js ==== */
try {
/* 21.92 r7b：刷新版の層（7巡目の直し：AIバイヤー開拓と受信箱〔確認・承認〕）。今の部品は差し替えず、RDX.after を包む
   ① 受信箱にも右上の「次は」（出どころは本体の層の v92r6a.now()＝ほかの画面と同じ）。
      承認待ちの初回の営業メールがある間は「この画面で承認して送る（N件）」（押すと「確認・承認」を開いて「承認して送る」を光らせる）。
      手順が済んだら「次は 商談を進める」（auto-S01・daily-S04・xcut-S06・indagri-S04）
   ② 「次は」が光らせたボタンは、続けて押しても毎回 光る（前の光を消すタイマーが、付け直した光を消していた。health-S04）
   ③ 規制を調べる：調べる枠の中を実際に操作したときだけ済み（見ただけ・「次は」を押しただけでは済みにしない。culture-N17）
   ④ AIバイヤー開拓の「連絡した相手」の数え方を、目標と道筋の根拠と同じに（other-S03）／販売先国の目次（auto-Q03） */
(function () {
  'use strict';
  const RD = window.RDX;
  if (!RD || RD._v92r7b) return;
  RD._v92r7b = 1;
  const { $, $$ } = RD;
  const lang = () => { try { const el = document.getElementById('lang'); const v = String((el && el.value) || (window.I18N && window.I18N.lang) || document.documentElement.lang || 'ja'); return /^en/.test(v) ? 'en' : /^zh/.test(v) ? 'zh' : /^es/.test(v) ? 'es' : 'ja'; } catch (e) { return 'ja'; } };
  const M = (ja, en, zh, es) => { const l = lang(); return l === 'en' ? en : l === 'zh' ? (zh || en) : l === 'es' ? (es || en) : ja; };
  const fwd = () => { try { return !!RD.isFwd(); } catch (e) { return false; } };
  const locked = () => { try { return !!RD.locked(); } catch (e) { return document.body.classList.contains('locked'); } };
  const setTxt = (el, t) => { if (el && el.textContent !== t) el.textContent = t; };
  const vis = (el) => !!(el && (el.offsetWidth || el.offsetHeight));
  const A6 = () => window.v92r6a || {};
  const A7 = () => window.v92r7b || {};
  const now = () => { try { return A6().now ? A6().now() : null; } catch (e) { return null; } };
  const well = () => document.getElementById('well') || document.querySelector('.stage') || document.body;
  const curKey = () => { try { return RD.curKey ? RD.curKey() : ''; } catch (e) { return ''; } };
  const esc = RD.esc || ((s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])));
  const I = RD.I || (() => '');
  const G = (n) => { try { return RD.G ? RD.G(n) : undefined; } catch (e) { return undefined; } };
  const NEXT_W = () => M('次は', 'Next', '下一步', 'Siguiente');

  /* ───── ② 光：続けて押しても、3秒あまりは光ったまま ───── */
  const live = new Set();
  let liveT = 0;
  function keep(el, ms) {
    if (!el) return;
    el.__r7bU = Date.now() + (ms || 3200);
    live.add(el);
    if (!liveT) liveT = setInterval(() => {
      const t = Date.now();
      live.forEach((x) => {
        if (!x.isConnected || t >= x.__r7bU) { live.delete(x); try { if (x.isConnected && t >= x.__r7bU) x.classList.remove('k-r5c-pulse'); } catch (e) { /* 無視 */ } return; }
        if (!x.classList.contains('k-r5c-pulse')) { x.__r7bSelf = Date.now(); x.classList.add('k-r5c-pulse'); }
      });
      if (!live.size) { clearInterval(liveT); liveT = 0; }
    }, 120);
  }
  function pulse(el, noScroll) {
    if (!el) return;
    if (!noScroll) { try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) { try { el.scrollIntoView(); } catch (x) { /* 無視 */ } } }
    el.__r7bSelf = Date.now();
    el.classList.remove('k-r5c-pulse');
    void el.offsetWidth;
    el.classList.add('k-r5c-pulse');
    keep(el, 3200);
    try { if (/^(BUTTON|A|INPUT|SELECT)$/.test(el.tagName)) el.focus({ preventScroll: true }); } catch (e) { /* 無視 */ }
  }

  /* ───── ① 受信箱の「次は」 ───── */
  const okBtn = (w) => { const b = $('#v84q .v84q-cur [data-act="card.qok"]', w); return vis(b) ? b : null; };
  const okIsOb = (b) => /^ob:/.test(String((b && b.getAttribute('data-arg')) || ''));
  function fixInbox(w, k) {
    const hero = $('[data-rdhero]', w);
    let b = hero && $('.k-r7b-next', hero);
    const N = k === 'inbox' && !fwd() ? now() : null;
    if (!hero || !N || !N.next) { if (b) b.remove(); return; }
    const act = N.r7b === 'inbox';
    const label = act ? M('この画面で承認して送る（' + N.pend + '件）', 'Approve & send on this screen (' + N.pend + ')', '在本页确认后发送（' + N.pend + '件）', 'Aprobar y enviar aquí (' + N.pend + ')') : N.label;
    const title = act
      ? M('承認待ちの営業メールが ' + N.pend + '件あります。押すと「確認・承認」を開き、「承認して送る」を光らせます（1件でも送ると、手順「バイヤーを探す」が済みになります）', N.pend + ' sales e-mail(s) are waiting for approval. Press to open “Review & approve” and highlight “Approve and send” (sending one completes the “Find buyers” step)', '有 ' + N.pend + ' 件营业邮件等待确认。按下后打开“确认・批准”并高亮“批准并发送”（发送1件即完成“寻找买家”步骤）', 'Hay ' + N.pend + ' correo(s) pendientes de aprobación. Pulse para abrir «Revisar y aprobar» y resaltar «Aprobar y enviar»')
      : M('次の手順：' + N.next.t + '（はじめの設定の、まだの手順）', 'Next: ' + N.label + ' (the next unfinished setup step)', '下一步：' + N.label + '（初始设置中尚未完成的步骤）', 'Siguiente: ' + N.label + ' (paso pendiente)');
    const sig = (act ? 'act' : 'go:' + N.key) + '|' + label + '|' + lang();
    if (!b) {
      b = document.createElement('button');
      b.type = 'button'; b.className = 'k92c-hnext k-r7b-next';
      hero.appendChild(b);
    }
    if (b.dataset.sig !== sig) {
      b.dataset.sig = sig;
      b.dataset.r7b = act ? 'act' : 'go';
      if (act) delete b.dataset.r6astep; else b.dataset.r6astep = N.key;   // 移るときは、ほかの画面の「次は」と同じ受け口（r6a）で動く
      b.title = title;
      b.innerHTML = '<small data-noi18n="1">' + esc(NEXT_W()) + '</small><b data-noi18n="1">' + esc(label) + '</b>' + I('arr', 16, 2.4);
    }
    b.classList.toggle('k-r5c-here', act);
  }
  function actInbox() {
    const w = well();
    let b = okBtn(w);
    if (b && okIsOb(b)) { pulse(b); return; }
    try { if (A7().openApprove) A7().openApprove(); } catch (e) { /* 無視 */ }
    let n = 0;
    const tm = setInterval(() => {
      n++;
      const x = okBtn(well());
      if (x) { clearInterval(tm); pulse(x); } else if (n > 12) clearInterval(tm);
    }, 250);
  }

  /* ───── ③ 規制を調べる：調べる枠の中の操作で済み ───── */
  const regOn = () => !locked() && !fwd() && curKey() === 'ops:reg';
  function regDone() {
    try {
      if (A7().regOp && A7().regOp()) {
        try { RD.after(); } catch (e) { /* 無視 */ }
        setTimeout(apply, 80);
        try { const tt = G('toast'); if (typeof tt === 'function') tt(M('規制を確かめました（はじめの設定の「規制を調べる」が済みになりました）', 'Regulations reviewed (setup step done)', '已确认法规（初始设置的该步骤已完成）', 'Regulaciones revisadas (paso completado)')); } catch (e) { /* 無視 */ }
      }
    } catch (e) { /* 無視 */ }
  }
  const REG_CTL = 'button, a[href], select, input, summary, label, [data-act], [data-onclick]';
  const regHit = (t) => !!(t && t.closest && t.closest('#sec-0') && !t.closest('.k-q') && !t.closest('.k-r7b-reghint') && t.closest(REG_CTL));
  function fixReg(w, k) {
    const s = k === 'ops:reg' && !fwd() ? $('#sec-0', w) : null;
    let h = $('.k-r7b-reghint', w);
    const N = s ? now() : null;
    const need = !!(N && N.next && N.next.id === 'reg');
    if (!need) { if (h) h.remove(); return; }
    const t = M('この手順は、この枠の中を操作すると済みになります（送り先の国を選ぶ・表の「対応済みにする」などを押す・「AIで最新規制を詳細調査」を押す）。開いただけ・見ただけでは済みになりません。',
      'This step is completed when you operate something in this box (choose the destination country, press a button in the table such as “Mark as done”, or run the AI research). Just opening or viewing it does not complete it.',
      '在此框内进行操作后，本步骤才算完成（选择目的国、点击表中的“标记为已处理”等按钮，或点击“用AI详细调查最新法规”）。仅打开或查看不会算作完成。',
      'Este paso se completa al operar algo en este cuadro (elegir el país de destino, pulsar un botón de la tabla o ejecutar la investigación con IA). Solo abrirlo o verlo no lo completa.');
    if (!h) {
      h = document.createElement('p');
      h.className = 'k-r7b-reghint'; h.setAttribute('data-noi18n', '1'); h.setAttribute('role', 'note');
      const rc = $('#rC', s);
      const host = (rc && (rc.closest('.rw, .g2, p, div') || rc.parentElement)) || null;
      if (host && host !== s) host.insertAdjacentElement('afterend', h); else s.insertAdjacentElement('afterbegin', h);
    }
    setTxt(h, t);
  }

  /* ───── ④ AIバイヤー開拓：「連絡した相手」の数え方（目標と道筋の根拠と同じ：商談の記録だけの相手は数えない） ───── */
  function fixDbCount(w, k) {
    if (k !== 'db') return;
    try {
      const T = G('TEN');
      const ths = Object.values((T && T.dmThreads) || {}).filter((th) => th && Array.isArray(th.msgs) && th.msgs.length);
      const real = ths.filter((th) => th.msgs.some((m) => m && !m.sim && (m.w !== 'me' || !/^商談の記録（/.test(String(m.subj || ''))))).length;
      const tile = $$('.rd-x .rd-tile, .rd-x .k-tile', w).find((x) => /^(連絡した相手|Buyers contacted)$/.test((((($('b, .k-tl', x) || {}).textContent) || '').trim())));
      if (!tile) return;
      const tn = $('.rd-tn, .k-tn', tile);
      const shown = tn ? parseInt(String(tn.textContent).replace(/[^\d]/g, ''), 10) : NaN;
      const total = ths.length;
      if (!(shown >= 0) || !(total >= 0)) return;
      const rec = Math.max(0, total - real);
      let note = $('.k-r7b-cnt', tile);
      if (!rec) { if (note) note.remove(); return; }
      if (tn && shown !== real) { const u = $('small', tn); tn.textContent = String(real); if (u) tn.appendChild(u); }
      const t = M('ほかに、商談の記録だけの相手 ' + rec + '社（まだ送っていません）', 'Plus ' + rec + ' with a meeting record only (nothing sent yet)', '另有仅有商谈记录的对象 ' + rec + ' 家（尚未发送）', 'Además, ' + rec + ' solo con registro de negociación (sin envío)');
      if (!note) { note = document.createElement('small'); note.className = 'k-r7b-cnt'; note.setAttribute('data-noi18n', '1'); (tn && tn.parentElement ? tn.parentElement : tile).appendChild(note); }
      setTxt(note, t);
      tile.title = M('連絡した相手＝メッセージを送った・受け取った相手（目標と道筋の「連絡した相手」と同じ数え方）。商談の記録だけの相手は別に数えます', 'Buyers contacted = buyers you have exchanged messages with (same count as in Goal & roadmap). Buyers with only a meeting record are counted separately', '已联系对象＝有消息往来的对象（与“目标与路径”相同的统计方式）。仅有商谈记录的对象另计', 'Contactados = con mensajes enviados o recibidos (igual que en Objetivo y hoja de ruta). Los que solo tienen registro se cuentan aparte');
      // 下の一覧の見出し（全部の相手が並ぶ）
      $$('.rd-x .rd-card .rd-ch', w).forEach((ch) => {
        const h = $('h2', ch);
        if (h && h.textContent === '連絡した相手' && !h.dataset.r7b) { h.dataset.r7b = '1'; h.setAttribute('data-noi18n', '1'); h.textContent = M('連絡した相手・商談を記録した相手', 'Buyers contacted or with a meeting record', '已联系或已记录商谈的对象', 'Contactados o con registro de negociación'); }
      });
    } catch (e) { /* 無視 */ }
  }
  /* 販売先国：確定した国が AI の推奨と違うとき、目次の「② 分析結果と推奨3か国」に、確定は別であることを一言（auto-Q03） */
  function fixCtyToc(w, k) {
    if (k !== 'cty') return;
    try {
      const T = G('TEN');
      const ch = (T && T.ctySel && Array.isArray(T.ctySel.chosen)) ? T.ctySel.chosen.filter(Boolean) : [];
      const top = (T && T.ctySel && Array.isArray(T.ctySel.top)) ? T.ctySel.top.filter(Boolean) : [];
      const diff = ch.length && top.length && (ch.length !== top.length || ch.some((c) => top.indexOf(c) < 0));
      $$('a, button, li, [role=tab], .k-toc *, [class*=toc] *', w).forEach((x) => {
        if (x.children.length > 6) return;
        const t = (x.textContent || '').trim();
        if (!/^② 分析結果と推奨3か国|^② Analysis results/.test(t) || t.length > 120) return;
        if (x.querySelector('a, button, li') && !x.matches('a, button')) return;
        let n = $('.k-r7b-toc', x);
        if (!diff) { if (n) n.remove(); return; }
        const s = M('（AI の推奨。確定は ' + ch.join('・') + '）', ' (AI recommendation; confirmed: ' + ch.join(', ') + ')', '（AI 的推荐；已确定：' + ch.join('・') + '）', ' (recomendación de IA; confirmados: ' + ch.join(', ') + ')');
        if (!n) { n = document.createElement('small'); n.className = 'k-r7b-toc'; n.setAttribute('data-noi18n', '1'); x.appendChild(n); }
        setTxt(n, s);
      });
    } catch (e) { /* 無視 */ }
  }

  function apply() {
    try {
      if (locked() || fwd()) return;
      const w = well(), k = curKey();
      fixInbox(w, k); fixReg(w, k); fixDbCount(w, k); fixCtyToc(w, k);
    } catch (e) { console.error('[rd v92r7b]', e); }
  }
  const old = RD.after;
  RD.after = function () {
    const r = old.apply(this, arguments);
    apply();
    return r;
  };

  // 前の層（r6a）の受け口のあとで受ける（window の同じ段で、あとから登録した順）
  window.addEventListener('click', (e) => {
    const t = e.target;
    if (!t || !t.closest) return;
    try {
      const mine = t.closest('.k-r7b-next[data-r7b="act"]');
      if (mine) { e.preventDefault(); e.stopPropagation(); actInbox(); return; }
      if (regOn() && regHit(t)) regDone();
    } catch (x) { /* 無視 */ }
  }, true);
  window.addEventListener('change', (e) => { try { if (regOn() && e.target && e.target.closest && e.target.closest('#sec-0')) regDone(); } catch (x) { /* 無視 */ } }, true);
  // r6a が付けた光（前の層の受け口は、あとの受け口を止めるので、光が付いたこと自体を見る）：
  //   ・続けて押して付け直した光は、前の光を消すタイマーに消されないよう、付け直してから3秒あまり保つ
  //   ・規制を調べる：枠の全体ではなく、最初に操作する「送り先の国」を光らせる
  try {
    new MutationObserver((recs) => {
      for (const r of recs) {
        const x = r.target;
        if (!x || !x.classList || !x.classList.contains('k-r5c-pulse')) continue;
        if (x.__r7bSelf && Date.now() - x.__r7bSelf < 80) continue;
        if (x.id === 'sec-0' && curKey() === 'ops:reg') {
          const rc = document.getElementById('rC');
          if (rc && vis(rc)) {
            x.classList.remove('k-r5c-pulse');
            pulse(rc);
            const h = $('.k-r7b-reghint'); if (h) { h.classList.remove('k-r7b-blink'); void h.offsetWidth; h.classList.add('k-r7b-blink'); }
            continue;
          }
        }
        keep(x, 3200);
      }
    }).observe(document.body, { attributes: true, attributeFilter: ['class'], subtree: true });
  } catch (e) { /* 無視 */ }

  // 画面の中だけが描き直されたとき（承認した・見送った・相手を選んだ）も、すぐ合わせる
  let t1 = 0, t2 = 0, t3 = 0;
  const soon = () => { try { if (A7().pendingReset) A7().pendingReset(); } catch (e) { /* 無視 */ } clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); t1 = setTimeout(apply, 300); t2 = setTimeout(() => { try { if (A7().pendingReset) A7().pendingReset(); } catch (e) { /* 無視 */ } apply(); }, 1700); t3 = setTimeout(() => { try { if (A7().pendingReset) A7().pendingReset(); } catch (e) { /* 無視 */ } apply(); }, 3600); };
  document.addEventListener('click', soon, false);
  document.addEventListener('change', soon, false);
  const lg = document.getElementById('lang');
  if (lg) lg.addEventListener('change', () => setTimeout(apply, 750));
})();

} catch (e) { try { console.error("[rd] rd_v92z97r7b.js", e); } catch (x) { } }
/* ==== rd_v92z9ar8a.js ==== */
try {
/* 21.92 r8a（刷新版の層）
   health-T08：受注を記録した（次の行動は空）あとも、案件一覧・案件の詳細の「次の行動」が前の記録の「サンプルを送る」のままだった
     → window.v92r3a.next（rd_v92z1r3a が使う1か所）を包み、いちばん新しい記録が「受注」で次の行動が空のときは、前の記録の次の行動を返さない
       （そのときは r6a・r6x の「受注の書類を確かめて送る」などが出る）。判定は本体の層 v92r8a.staleNext。
   other-T09：AIバイヤー開拓・拠点の「最近のアクティビティ」で、送っていない商談の記録に「送信」の札が付いていた → 「記録」 */
(function () {
  'use strict';
  const RD = window.RDX;
  if (!RD || RD._v92r8a) return;
  RD._v92r8a = 1;
  const { $$ } = RD;
  const lang = () => { try { const el = document.getElementById('lang'); const v = String((el && el.value) || (window.I18N && window.I18N.lang) || document.documentElement.lang || 'ja'); return /^en/.test(v) ? 'en' : /^zh/.test(v) ? 'zh' : /^es/.test(v) ? 'es' : 'ja'; } catch (e) { return 'ja'; } };
  const M = (ja, en, zh, es) => { const l = lang(); return l === 'en' ? en : l === 'zh' ? (zh || en) : l === 'es' ? (es || en) : ja; };
  const well = () => document.getElementById('well') || document.querySelector('.stage') || document.body;
  const curKey = () => { try { return RD.curKey ? RD.curKey() : ''; } catch (e) { return ''; } };

  /* health-T08 */
  const wrapNext = () => {
    try {
      const A = window.v92r3a, B = window.v92r8a;
      if (!A || typeof A.next !== 'function' || A.next._r8a || !B || typeof B.staleNext !== 'function') return;
      const o = A.next;
      const f = function (id) {
        const N = o.apply(this, arguments);
        try {
          if (!N || !N.t) return N;
          const c = (RD.allCases ? (RD.allCases() || []) : []).find((x) => x && String(x.id) === String(id));
          if (c && c.name && B.staleNext(c.name, N.t)) return null;
        } catch (e) { /* 無視 */ }
        return N;
      };
      f._r8a = 1;
      A.next = f;
    } catch (e) { /* 無視 */ }
  };
  wrapNext();

  /* other-T09 */
  function actTags(w) {
    $$('.rd-li[data-rddba]', w).forEach((b) => {
      const tg = b.querySelector('.rd-tag');
      const lt = b.querySelector('.rd-lt');
      if (!tg || !lt || tg.dataset.r8a) return;
      if (/^送信$/.test(String(tg.textContent || '').trim()) && /^商談の記録（|^Meeting record \(/.test(String(lt.textContent || '').trim())) {
        tg.dataset.r8a = '1';
        tg.textContent = M('記録', 'Record', '记录', 'Registro');
        tg.setAttribute('data-noi18n', '1');
        tg.classList.remove('or');
        tg.title = M('商談の記録です（相手には送っていません）', 'A meeting record (not sent to the buyer)', '商谈记录（未发送给对方）', 'Registro de reunión (no enviado)');
      }
    });
  }
  function apply() {
    try {
      wrapNext();
      const k = curKey();
      if (k === 'db') actTags(well());
    } catch (e) { console.error('[rd v92r8a]', e); }
  }
  const old = RD.after;
  RD.after = function () { const r = old.apply(this, arguments); apply(); return r; };
  let t1 = 0;
  document.addEventListener('click', () => { clearTimeout(t1); t1 = setTimeout(apply, 350); }, false);
})();

} catch (e) { try { console.error("[rd] rd_v92z9ar8a.js", e); } catch (x) { } }
/* ==== rd_v92z9br8b.js ==== */
try {
/* 21.94 r8b：刷新版の層（8巡目の直し：21.93 の直しとこの作業の直しのかみ合わせ）。今の部品は差し替えず、RDX.after を包む
   ① 規制を調べる：「次は この画面で規制を確かめる」が光らせるのは、押すと済みになるボタン「表で確かめる（国名）」（daily-T02）。
      押すと、その国の表（必要な手続き）へ送って済みにする。「次は」を押しただけ・開いただけでは済みにしない（culture-N17 のまま）
   ② 受信箱の「次は」：承認待ちが残る間は「この画面で承認して送る（残り N件）」（xcut-T01）
   ③ 商品情報の円：真ん中は「入っている数/全体」と、数どおりの %（21.93 の数え方）にそろえる（other-T01）
   ④ ログイン：担当者名の欄から「任意」を外す（登録のあるアカウントでは要るため。daily-T10・medical-T08）
   ⑤ 用語集の入口：左の帯の箱があるときは、見出しの下の「📖 用語集」を出さない（food-T01） */
(function () {
  'use strict';
  const RD = window.RDX;
  if (!RD || RD._v92r8b) return;
  RD._v92r8b = 1;
  const { $, $$ } = RD;
  const lang = () => { try { const el = document.getElementById('lang'); const v = String((el && el.value) || (window.I18N && window.I18N.lang) || document.documentElement.lang || 'ja'); return /^en/.test(v) ? 'en' : /^zh/.test(v) ? 'zh' : /^es/.test(v) ? 'es' : 'ja'; } catch (e) { return 'ja'; } };
  const M = (ja, en, zh, es) => { const l = lang(); return l === 'en' ? en : l === 'zh' ? (zh || en) : l === 'es' ? (es || en) : ja; };
  const fwd = () => { try { return !!RD.isFwd(); } catch (e) { return false; } };
  const locked = () => { try { return !!RD.locked(); } catch (e) { return document.body.classList.contains('locked'); } };
  const setTxt = (el, t) => { if (el && el.textContent !== t) el.textContent = t; };
  const vis = (el) => !!(el && (el.offsetWidth || el.offsetHeight));
  const A6 = () => window.v92r6a || {};
  const A7 = () => window.v92r7b || {};
  const now = () => { try { return A6().now ? A6().now() : null; } catch (e) { return null; } };
  const well = () => document.getElementById('well') || document.querySelector('.stage') || document.body;
  const curKey = () => { try { return RD.curKey ? RD.curKey() : ''; } catch (e) { return ''; } };
  const esc = RD.esc || ((s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])));
  const I = RD.I || (() => '');
  const G = (n) => { try { return RD.G ? RD.G(n) : undefined; } catch (e) { return undefined; } };
  const NEXT_W = () => M('次は', 'Next', '下一步', 'Siguiente');

  function pulse(el) {
    if (!el) return;
    try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) { try { el.scrollIntoView(); } catch (x) { /* 無視 */ } }
    el.classList.remove('k-r5c-pulse');
    void el.offsetWidth;
    el.classList.add('k-r5c-pulse');
    clearTimeout(el.__r8bT);
    el.__r8bT = setTimeout(() => { try { el.classList.remove('k-r5c-pulse'); } catch (e) { /* 無視 */ } }, 3400);
    try { el.focus({ preventScroll: true }); } catch (e) { /* 無視 */ }
  }

  /* ───── ① 規制を調べる ───── */
  const regNeed = () => { const N = now(); return !!(N && N.next && N.next.id === 'reg'); };
  const ctyNm = () => { const rc = $$('select#rC').find(vis) || document.getElementById('rC'); if (!rc) return ''; const o = rc.options && rc.options[rc.selectedIndex]; return String((o && o.textContent) || rc.value || '').trim(); };
  const regLbl = () => { const c = ctyNm(); return c ? M('表で確かめる（' + c + '）', 'Review the table (' + c + ')', '查看法规表（' + c + '）', 'Revisar la tabla (' + c + ')') : M('表で確かめる', 'Review the table', '查看法规表', 'Revisar la tabla'); };
  function fixReg(w, k) {
    const s = k === 'ops:reg' && !fwd() ? $('#sec-0', w) : null;
    let b = $('.k-r8b-regok', w);
    if (!s || !regNeed() || !$('#rO', s)) { if (b) b.remove(); return; }
    if (!b) {
      b = document.createElement('button');
      b.type = 'button'; b.className = 'btn k-r8b-regok'; b.setAttribute('data-noi18n', '1');
      const h = $('.k-r7b-reghint', s);
      const rc = $('#rC', s);
      const host = h || (rc && (rc.closest('.rw, .g2, p, div') || rc.parentElement)) || null;
      if (host && host !== s) host.insertAdjacentElement('afterend', b); else s.insertAdjacentElement('afterbegin', b);
    }
    setTxt(b, '✓ ' + regLbl());
    b.title = M('押すと、この国の「販売・出荷の前に必要な手続き」の表へ移り、はじめの設定の「規制を調べる」が済みになります', 'Jumps to this country’s table of required procedures and completes the setup step “Check regulations”', '跳转到该国“销售・出货前所需手续”表，并完成初始设置的“查法规”', 'Va a la tabla de trámites de este país y completa el paso «Revisar regulaciones»');
    // 枠の中の説明（r7b）：押すボタンを先に書く
    const h = $('.k-r7b-reghint', s);
    if (h) setTxt(h, M('この手順は、下の「表で確かめる」を押すと済みになります（送り先の国を選び替える・表の「対応済みにする」などを押す・「AIで最新規制を詳細調査」を押す、でも済みになります）。開いただけ・見ただけでは済みになりません。',
      'This step is completed when you press “Review the table” below (choosing another destination, pressing a button in the table such as “Mark as done”, or running the AI research also completes it). Just opening or viewing does not.',
      '点击下方“查看法规表”即可完成本步骤（选择其他目的国、点击表中的“标记为已处理”等按钮或“用AI详细调查最新法规”也可完成）。仅打开或查看不算完成。',
      'Este paso se completa al pulsar «Revisar la tabla» abajo (también al elegir otro destino, pulsar un botón de la tabla o ejecutar la investigación con IA). Solo abrir o ver no lo completa.'));
  }
  function regTable() {
    const o = document.getElementById('rO');
    if (!o) return null;
    return $$('.v54r-h', o).find(vis) || $$('p.lbl', o).find((x) => vis(x) && /必要な書類|Required documents/.test(x.textContent || '')) || o;
  }
  // 「表で確かめる」：済みにして（r7b と同じ受け口）、表へ送る
  document.addEventListener('click', (e) => {
    const b = e.target && e.target.closest && e.target.closest('.k-r8b-regok');
    if (!b) return;
    e.preventDefault();
    try {
      if (regNeed() && A7().regOp && A7().regOp()) {
        try { const tt = G('toast'); if (typeof tt === 'function') tt(M('規制を確かめました（はじめの設定の「規制を調べる」が済みになりました）', 'Regulations reviewed (setup step done)', '已确认法规（初始设置的该步骤已完成）', 'Regulaciones revisadas (paso completado)')); } catch (x) { /* 無視 */ }
      }
    } catch (x) { /* 無視 */ }
    const t = regTable();
    setTimeout(() => { try { RD.after(); } catch (x) { /* 無視 */ } const t2 = regTable() || t; if (t2) { try { t2.scrollIntoView({ block: 'start', behavior: 'smooth' }); } catch (x) { /* 無視 */ } } }, 60);
  }, false);
  // 「次は この画面で規制を確かめる」：光らせるのは「表で確かめる」。前の層（r6a）が枠を光らせ、r7b が「送り先の国」へ移した光を、このボタンへ移す
  let regMv = 0;
  function moveRegPulse() {
    regMv = 0;
    try {
      if (locked() || fwd() || curKey() !== 'ops:reg' || !regNeed()) return;
      const b = $('.k-r8b-regok', well());
      if (!b || !vis(b)) return;
      ['rC', 'sec-0'].forEach((id) => { const x = document.getElementById(id); if (x) { x.__r7bU = 1; x.classList.remove('k-r5c-pulse'); } });
      b.__r7bSelf = Date.now();
      pulse(b);
    } catch (e) { /* 無視 */ }
  }
  try {
    new MutationObserver((recs) => {
      for (const r of recs) {
        const x = r.target;
        if (!x || (x.id !== 'rC' && x.id !== 'sec-0') || !x.classList || !x.classList.contains('k-r5c-pulse')) continue;
        if (!regMv) regMv = setTimeout(moveRegPulse, 30);
      }
    }).observe(document.body, { attributes: true, attributeFilter: ['class'], subtree: true });
  } catch (e) { /* 無視 */ }
  document.addEventListener('change', (e) => { try { if (e.target && e.target.id === 'rC') { const b = $('.k-r8b-regok'); if (b) setTxt(b, '✓ ' + regLbl()); } } catch (x) { /* 無視 */ } }, false);

  /* ───── ② 受信箱の「次は」：承認待ちが残る間 ───── */
  function fixInbox(w, k) {
    if (k !== 'inbox' || fwd()) return;
    const hero = $('[data-rdhero]', w);
    const b = hero && $('.k-r7b-next', hero);
    if (!b) return;
    const N = now();
    let P = null;
    try { P = A7().pending ? A7().pending() : null; } catch (e) { P = null; }
    if (!N || !N.next || !P || !(P.n > 0)) { if (b.dataset.r8b) { delete b.dataset.r8b; delete b.dataset.sig; } return; }
    const rest = !!N.rest || (N.next && N.next.id !== 'buyer');
    const label = rest ? M('この画面で承認して送る（残り ' + P.n + '件）', 'Approve & send on this screen (' + P.n + ' left)', '在本页确认后发送（剩余 ' + P.n + ' 件）', 'Aprobar y enviar aquí (quedan ' + P.n + ')')
      : M('この画面で承認して送る（' + P.n + '件）', 'Approve & send on this screen (' + P.n + ')', '在本页确认后发送（' + P.n + '件）', 'Aprobar y enviar aquí (' + P.n + ')');
    const sig = 'r8b|' + label + '|' + lang();
    if (b.dataset.r8b !== sig || b.dataset.r7b !== 'act') {
      b.dataset.r8b = sig;
      b.dataset.r7b = 'act';
      delete b.dataset.r6astep;
      b.title = M('承認待ちの営業メールが ' + P.n + '件あります。押すと「確認・承認」を開き、「承認して送る」を光らせます', P.n + ' sales e-mail(s) are waiting for approval. Press to open “Review & approve”.', '有 ' + P.n + ' 封营销邮件等待确认。点击后打开“确认・批准”。', 'Hay ' + P.n + ' correo(s) pendientes de aprobación. Pulse para abrir «Revisar y aprobar».');
      b.innerHTML = '<small data-noi18n="1">' + esc(NEXT_W()) + '</small><b data-noi18n="1">' + esc(label) + '</b>' + I('arr', 16, 2.4);
    }
    b.classList.add('k-r5c-here');
  }

  /* ───── ③ 商品情報の円 ───── */
  function fixRing(w, k) {
    if (k !== 'item') return;
    const f = window.v92prodFill;
    let t = null; try { t = G('TEN'); } catch (e) { t = null; }
    const K = typeof f === 'function' && t ? f(t) : null;
    const ring = $('.rd-p2 .k-ring', w) || $('.k-ring', w);
    if (!K || !ring) return;
    const optN = K.optMiss.length;
    const sub = K.full && optN ? '任意 あと' + optN + '件' : K.pct + '%';
    ring.style.setProperty('--p', String(K.pct));
    ring.setAttribute('data-v92prod-pct', String(K.pct));
    ring.classList.add('v92prod-ring');
    ring.classList.toggle('v92prod-done', !!K.allDone);
    ring.classList.toggle('v92prod-optleft', !!(K.full && optN && !K.allDone));
    const sp = ring.querySelector(':scope > span') || ring.appendChild(document.createElement('span'));
    const html = '<b class="v92prod-rn">' + K.c + '<small>/' + K.d + '</small></b><em class="v92prod-rs">' + esc(sub) + '</em>';
    if (sp.innerHTML !== html) sp.innerHTML = html;
  }

  /* ───── ④ ログイン：担当者名 ───── */
  function fixLogin() {
    const nm = document.getElementById('lg-name');
    if (!nm) return;
    const ph = M('ご担当者名（招待状・申し込みのときの氏名）', 'Your name (as on the invitation or application)', '负责人姓名（邀请函或申请时的姓名）', 'Su nombre (como en la invitación o la solicitud)');
    if (nm.getAttribute('placeholder') !== ph) nm.setAttribute('placeholder', ph);
    if (nm.getAttribute('aria-label') !== ph) nm.setAttribute('aria-label', ph);
  }

  /* ───── ⑤ 用語集の入口の重なり ───── */
  function fixGloss() {
    const side = document.querySelector('#rdside .v92misc-gl');
    const on = !!(side && vis(side));
    if (document.documentElement.classList.contains('k-r8b-glside') !== on) document.documentElement.classList.toggle('k-r8b-glside', on);
  }

  /* ───── ⑥ 販売先国の選定：確定した国のカードで、国名を途中で折り返さない（health-T10・indagri-T05） ───── */
  function fixCty(w, k) {
    if (k !== 'cty') return;
    $$('.k-tiles', w).forEach((t) => { if (!t.classList.contains('k-r8b-ctyt') && $('.k-card svg + b', t)) t.classList.add('k-r8b-ctyt'); });
  }

  function apply() {
    try { fixLogin(); } catch (e) { /* 無視 */ }
    try {
      if (locked() || fwd()) return;
      const w = well(), k = curKey();
      fixReg(w, k); fixInbox(w, k); fixRing(w, k); fixGloss(); fixCty(w, k);
    } catch (e) { console.error('[rd v92r8b]', e); }
  }
  const old = RD.after;
  RD.after = function () {
    const r = old.apply(this, arguments);
    apply();
    return r;
  };
  // 受信箱で承認したあと（画面の中だけが描き直される）も、すぐ合わせる
  let t1 = 0, t2 = 0;
  const soon = () => { clearTimeout(t1); clearTimeout(t2); t1 = setTimeout(apply, 380); t2 = setTimeout(apply, 1800); };
  document.addEventListener('click', soon, false);
  document.addEventListener('change', soon, false);
  setTimeout(apply, 600);
  try { const lg = document.getElementById('lang'); if (lg) lg.addEventListener('change', () => setTimeout(apply, 800)); } catch (e) { /* 無視 */ }
})();

} catch (e) { try { console.error("[rd] rd_v92z9br8b.js", e); } catch (x) { } }
/* ==== rd_v92z9cr8c.js ==== */
try {
/* 21.92 r8c の刷新版の層：xcut-T03（英語・中国語・スペイン語で、販売先国の同点の説明が2か所に出る）
   21.93 の刷新版の層（rd_v92reg）が「点数と順位の見方」の欄に、同点の説明と順位の言い方の注記を出す。
   同じ文が候補の表の下（アプリの層 logic_v2192reg の p.nn.v92reg-tie・v92reg-rk）にもある。
   日本語では表の下の注記は「？説明」へたたまれる（rd_case の foldNotes は日本語だけ）ので1か所。日本語以外は2か所に出ていた。
   → 日本語以外で「点数と順位の見方」の欄があるときは、表の下の同じ注記を出さない（欄の中の同じ文を見る）。日本語の画面は何もしない */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v92r8c) return;
  RD._v92r8c = 1;
  const { $, $$ } = RD;
  const isJa = () => { const s = document.getElementById("lang"); return !s || !s.value || /^ja/.test(s.value); };
  const chain = (k, f) => { const p0 = RD.page[k]; RD.page[k] = (w, kk) => { if (p0) p0(w, kk); try { f(w, kk); } catch (e) { console.error("[rd] v92r8c " + k, e); } }; };
  const norm = (s) => String(s || "").replace(/\s+/g, " ").trim();
  /* 訳す前の文で見比べる（訳が当たる時刻が欄と表で違っても同じに見える） */
  const src = (el) => {
    let I = null;
    try { I = (typeof I18N !== "undefined" && I18N && I18N.orig) ? I18N.orig : null; } catch (e) { I = null; } // eslint-disable-line no-undef
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let s = "", n;
    while ((n = w.nextNode())) s += (I && I.has(n)) ? String(I.get(n)) : String(n.nodeValue || "");
    return norm(s);
  };
  function dedupe(w) {
    const root = w || document;
    const card = $(".k-v92cty", root);
    const notes = $$("p.v92reg-tie, p.v92reg-rk", root).filter((p) => !p.closest(".k-v92cty"));
    if (!notes.length) return;
    if (isJa() || !card) { notes.forEach((p) => { if (p.dataset.v92r8c) { p.hidden = false; delete p.dataset.v92r8c; } }); return; }
    const inCard = new Set($$("p", card).map((p) => src(p)));
    notes.forEach((p) => {
      const same = inCard.has(src(p));
      if (same && !p.hidden) { p.hidden = true; p.dataset.v92r8c = "dup"; }
      else if (!same && p.dataset.v92r8c) { p.hidden = false; delete p.dataset.v92r8c; }
    });
  }
  chain("cty", (w) => { dedupe(w); setTimeout(() => dedupe(document.getElementById("well")), 400); });
})();

} catch (e) { try { console.error("[rd] rd_v92z9cr8c.js", e); } catch (x) { } }
/* ==== rd_v92z9yr9a.js ==== */
try {
/* 21.92 r9a（刷新版の層）
   ① 受注のあとの「次の行動」（medical-U01・health-T08）
      ・営業メールを送ったあとに受注になった案件が「相手の返事を待つ／フォローの連絡」のままだった
        → 受注（取引中）の案件は、受注のあとに送った連絡が無い限り、受注の行動（書類があれば「受注の書類を確かめて送る」＋案件 No.、無ければ「受注の書類をつくる」）。
          文は r6a・r6x と同じ（案件 No. は r6b の案件の書類 No.＝「書類をつくる」が開く案件）。
      ・アプリを開き直した直後の案件一覧で、前の記録の次の行動（サンプルを送る）が残っていた（r3a が先に描き、r8a の判定が後から入るため）
        → 描いたあとと、開いた直後（少し待って）にも、同じ判定（本体の層 v92r8a.staleNext）で直す。
   ② 案件の詳細の「商談の記録」：確定単価だけの記録に価格の行が無かった（daily-U02） → 確定単価（希望価格があれば併記）を出す */
(function () {
  'use strict';
  const RD = window.RDX;
  if (!RD || RD._v92r9a) return;
  RD._v92r9a = 1;
  const { $, $$ } = RD;
  const lang = () => { try { const el = document.getElementById('lang'); const v = String((el && el.value) || (window.I18N && window.I18N.lang) || document.documentElement.lang || 'ja'); return /^en/.test(v) ? 'en' : /^zh/.test(v) ? 'zh' : /^es/.test(v) ? 'es' : 'ja'; } catch (e) { return 'ja'; } };
  const M = (ja, en, zh, es) => { const l = lang(); return l === 'en' ? en : l === 'zh' ? (zh || en) : l === 'es' ? (es || en) : ja; };
  const well = () => document.getElementById('well') || document.querySelector('.stage') || document.body;
  const curKey = () => { try { return RD.curKey ? RD.curKey() : ''; } catch (e) { return ''; } };
  const locked = () => { try { return !!RD.locked(); } catch (e) { return document.body.classList.contains('locked'); } };
  const fwd = () => { try { return !!RD.isFwd(); } catch (e) { return false; } };
  const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();
  const firstTxt = (el) => Array.from(el.childNodes).find((x) => x.nodeType === 3 && x.nodeValue.trim());
  const WON = (c) => !!(c && /^(取引中|受注)$/.test(String(c.ss || '')));
  // r6a・r6x と同じ文
  const DOC_T = () => M('受注の書類を確かめて送る（見積書・請求書）', 'Review and send the order documents (quote / invoice)', '确认并发送订单文件（报价单・发票）', 'Revisar y enviar los documentos del pedido (cotización / factura)');
  const DOC_S = (no) => M(`受注を記録した案件です。書類は「書類をつくる」に入っています（案件 No. ${no}）。相手にはまだ送っていません`,
    `An order is recorded for this case. Its documents are in “Create documents” (case no. ${no}). Nothing has been sent yet`,
    `此案件已记录订单。文件已在“制作文件”中（案件编号 ${no}）。尚未发送给对方`,
    `Este caso tiene un pedido registrado. Sus documentos están en «Crear documentos» (caso n.º ${no}). Aún no se ha enviado nada`);
  const WON_T = () => M('受注の書類をつくる（見積書・請求書）', 'Create the order documents (quote / invoice)', '制作订单文件（报价单・发票）', 'Crear los documentos del pedido (cotización / factura)');
  const WON_S = () => M('受注を記録した案件です。「書類をつくる」で作れます（相手にはまだ送っていません）', 'An order is recorded for this case. Create them in “Create documents” (nothing has been sent yet)', '此案件已记录订单。可在“制作文件”中制作（尚未发送给对方）', 'Este caso tiene un pedido registrado. Créelos en «Crear documentos» (aún no se ha enviado nada)');
  const R6cases = () => { try { const A = window.v92r6b; return A && A.cases ? (A.cases() || []) : []; } catch (e) { return []; } };
  const caseOf = (c, L) => { const n = norm(c && c.name); return n ? (L.find((x) => x && norm(x.buyer) === n && (c.pi == null || !x.u || x.u.i == null || x.u.i === c.pi)) || null) : null; };
  const ymdOf = (ms) => { try { const d = new Date(+ms); if (isNaN(d.getTime())) return ''; return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); } catch (e) { return ''; } };
  const wonDay = (x) => { try { const W = (x.recs || []).filter((y) => y && y.r && y.r.st === '受注').map((y) => String(y.r.d || '').slice(0, 10)).sort(); return W[W.length - 1] || String(x.wonD || ''); } catch (e) { return ''; } };
  const stale = (c, t) => { try { const B = window.v92r8a; return !!(B && typeof B.staleNext === 'function' && c && c.name && B.staleNext(c.name, t)); } catch (e) { return false; } };

  /* その案件の「次の行動」を受注の行動にするか。返す：{ t, s } か null */
  function wonNext(c, host, L) {
    if (!WON(c) || !c.next) return null;
    const k = c.next.kind;
    if (k === 'reply' || k === 'lost') return null;                        // 相手からの返事がある・失注は、そのまま
    const t0 = firstTxt(host);
    if (!t0) return null;
    const v = String(host.title || t0.nodeValue || '').trim();
    const sm = $('small', host);
    const smT = String((sm && sm.textContent) || '');
    const x = caseOf(c, L);
    const fromRec = /記録した次の行動|商談の記録の「次の行動」/.test(smT);
    if (fromRec) { if (!stale(c, v)) return null; }                       // 記録した次の行動は、受注の後も生きているものはそのまま
    else if (k !== 'wait' && k !== 'follow') return null;                   // 「最初の連絡を送る」は r6a・r6x が受注の行動にする
    else {
      // 受注の後に、こちらから送った連絡がある（書類を送ったなど）ときは「返事を待つ」のまま
      const me = c.lastMe ? ymdOf(c.lastMe.at) : '';
      const wd = x ? wonDay(x) : '';
      if (me && wd && me > wd) return null;
    }
    if (x && x.S && x.no) return { t: DOC_T(), s: DOC_S(x.no) };
    return { t: WON_T(), s: WON_S() };
  }
  function paintOne(host, c, L) {
    try {
      const N = wonNext(c, host, L);
      if (!N) return;
      const t = firstTxt(host);
      const sm = $('small', host);
      if (t.nodeValue.trim() === N.t && (!sm || sm.textContent === N.s)) return;
      host.setAttribute('data-noi18n', '1');
      t.nodeValue = N.t;
      if (host.title) host.title = N.t;
      if (sm) sm.textContent = N.s;
      else { const s = document.createElement('small'); s.textContent = N.s; host.appendChild(s); }
      const td = host.closest('td'); if (td) td.classList.remove('k-r3aod');
    } catch (e) { /* 無視 */ }
  }
  function paintRows(body) {
    const ord = RD._caseOrder || [];
    let C = []; try { C = RD.allCases ? (RD.allCases() || []) : []; } catch (e) { C = []; }
    const L = R6cases();
    $$('tr.k-clrow', body).forEach((tr, i) => {
      const nx = $('.c-nx > span', tr);
      if (!nx) return;
      const c = C.find((x) => x.key === ord[i]);
      if (c) paintOne(nx, c, L);
    });
  }
  /* ② 案件の詳細の「商談の記録」：価格の行（確定単価 ＞ 希望価格） */
  function recPrice(box, c) {
    try {
      const sec = $$('section.k-card', box).find((s) => { const h = $('h2', s); return h && /^(商談の記録|Meeting records?|商谈记录|Registros?)/.test(String(h.textContent || '').trim()); });
      if (!sec || !c || !c.named) return;
      const DLs = $$('dl.k-kv', sec);
      if (!DLs.length) return;
      let F = []; try { F = ((typeof D !== 'undefined' && D && D.fb) || []).slice(); } catch (e) { F = []; } // eslint-disable-line no-undef
      F = F.filter((r) => r && String(r.b || '').trim() === c.name).sort((a, b) => String(b.d || '').localeCompare(String(a.d || '')));
      const P = window.v92r9a && window.v92r9a.priceTxt;
      if (typeof P !== 'function') return;
      DLs.forEach((dl, i) => {
        const r = F[i];
        if (!r || dl.dataset.r9a) return;
        dl.dataset.r9a = '1';
        const p = P(r);
        if (!p || !p.fixed) return;
        const nm = (s) => { const m = String(s || '').replace(/,/g, '').match(/\d+(?:\.\d+)?/); return m ? +m[0] : NaN; };
        const val = p.s + M('（確定単価）', ' (confirmed)', '（确定单价）', ' (confirmado)') + (r.price && String(r.price).trim() !== p.s && nm(r.price) !== nm(p.s) ?M(`・希望 ${r.price}`, ` · requested ${r.price}`, `・期望 ${r.price}`, ` · deseado ${r.price}`) : '');
        const dts = $$('dt', dl);
        const pd = dts.find((d) => /^(価格|Price|价格|Precio)$/.test(String(d.textContent || '').trim()));
        if (pd && pd.nextElementSibling) { pd.nextElementSibling.textContent = val; pd.nextElementSibling.setAttribute('data-noi18n', '1'); }
        else {
          const d0 = dts[0];
          const dt = document.createElement('dt'); dt.textContent = M('価格', 'Price', '价格', 'Precio'); dt.setAttribute('data-noi18n', '1');
          const dv = document.createElement('dd'); dv.textContent = val; dv.setAttribute('data-noi18n', '1');
          const after = d0 && d0.nextElementSibling ? d0.nextElementSibling : null;
          if (after) { after.insertAdjacentElement('afterend', dt); dt.insertAdjacentElement('afterend', dv); } else { dl.appendChild(dt); dl.appendChild(dv); }
        }
      });
    } catch (e) { /* 無視 */ }
  }
  function apply() {
    try {
      if (locked() || fwd()) return;
      const w = well(), k = curKey();
      if (k === 'dash:home') {
        const body = $('#k-clbody', w);
        if (body) {
          paintRows(body);
          if (!body.dataset.r9ao) {
            body.dataset.r9ao = '1';
            let tm = 0;
            new MutationObserver(() => { clearTimeout(tm); tm = setTimeout(() => { try { if (document.body.contains(body)) paintRows(body); } catch (e) { /* 無視 */ } }, 60); }).observe(body, { childList: true, subtree: true, characterData: true });
          }
        }
      } else if (k === 'dash:case') {
        const box = $('.k-cd', w);
        const p = box && $('.k-cdnx', box);
        if (p && RD._case0) paintOne(p, RD._case0, R6cases());
        if (box) recPrice(box, RD._case0);
      }
    } catch (e) { console.error('[rd v92r9a]', e); }
  }
  const old = RD.after;
  RD.after = function () {
    const r = old.apply(this, arguments);
    apply();
    setTimeout(apply, 60);
    return r;
  };
  let t1 = 0, t2 = 0;
  document.addEventListener('click', () => { clearTimeout(t1); clearTimeout(t2); t1 = setTimeout(apply, 380); t2 = setTimeout(apply, 1800); }, false);
  // 開いた直後：ほかの層が先に描いた一覧を、データがそろってから直す（health-T08）
  [300, 1200, 3000, 6000].forEach((ms) => setTimeout(apply, ms));
  const lg = document.getElementById('lang');
  if (lg) lg.addEventListener('change', () => setTimeout(apply, 900));
})();

} catch (e) { try { console.error("[rd] rd_v92z9yr9a.js", e); } catch (x) { } }
/* ==== rd_v92z9yr9b.js ==== */
try {
/* 21.94 r9b：刷新版の層（9巡目の直し）。今の部品は差し替えず、RDX.after を包む
   ① 用語集の入口：左の帯の用語集の箱が見えている間は、見出しの下の「📖 用語集」のリンクだけを外す（説明の行は残す。other-U02）。
      r8b の判定（箱が見えるか）は、21.93 の層が箱を描き直す前に読んで外れていた（r8x の記録）→ 描いたあと少し遅れて見直す
   ② スマホ幅：表が枠の中で横に送れるときは、送れることを表の上に書く（xcut-U06。目標と道筋の年ごとの表は CSS で縦に積む）
   ③ 「次は 受信箱で承認して送る（残り N件）」の吹き出し（title）を、受信箱の同じボタンと同じ文に（daily-U04）
   ④ メンバー・権限：完成形の見本を開いている間は、見本の商品も「登録している商品」に数える（商品一覧と同じ数。food-U05）
   ⑤ 中古車・建設機械：入力欄の例文（相手の会社名・建値の場所・荷印・港）と、営業資料の画面の「価格表（単価・数量帯）」「図面で見積」を商材に合わせる（auto-08・auto-N16）
   （CSS：目標と道筋の年ごとの表を 390 で縦に積む・「Coming Soon・開発中」の札・確定した販売先国のカード） */
(function () {
  'use strict';
  const RD = window.RDX;
  if (!RD || RD._v92r9b) return;
  RD._v92r9b = 1;
  const $ = RD.$ || ((s, r) => (r || document).querySelector(s));
  const $$ = RD.$$ || ((s, r) => Array.from((r || document).querySelectorAll(s)));
  const lang = () => { try { const el = document.getElementById('lang'); const v = String((el && el.value) || (window.I18N && window.I18N.lang) || document.documentElement.lang || 'ja'); return /^en/.test(v) ? 'en' : /^zh/.test(v) ? 'zh' : /^es/.test(v) ? 'es' : 'ja'; } catch (e) { return 'ja'; } };
  const M = (ja, en, zh, es) => { const l = lang(); return l === 'en' ? en : l === 'zh' ? (zh || en) : l === 'es' ? (es || en) : ja; };
  const fwd = () => { try { return !!RD.isFwd(); } catch (e) { return false; } };
  const locked = () => { try { return !!RD.locked(); } catch (e) { return document.body.classList.contains('locked'); } };
  const setTxt = (el, t) => { if (el && el.textContent !== t) el.textContent = t; };
  const vis = (el) => !!(el && (el.offsetWidth || el.offsetHeight));
  const curKey = () => { try { return RD.curKey ? RD.curKey() : ''; } catch (e) { return ''; } };
  const well = () => document.getElementById('well') || document.querySelector('.stage') || document.body;
  const G = (n) => { try { return RD.G ? RD.G(n) : window[n]; } catch (e) { return undefined; } };
  const now = () => { try { const A = window.v92r6a; return A && A.now ? A.now() : null; } catch (e) { return null; } };

  /* ───── ① 用語集の入口 ───── */
  const shown = (el) => {
    if (!el || !(el.offsetWidth || el.offsetHeight)) return false;
    const r = el.getBoundingClientRect();
    const c = getComputedStyle(el);
    return c.visibility !== 'hidden' && r.right > 0 && r.left < window.innerWidth;
  };
  function fixGloss() {
    try {
      const s = document.querySelector('#rdside .v92misc-gl');
      // 見出しの下の行が「📖 用語集」だけになっている（説明の文が見えない）ときだけ外す。説明の文が見える幅では、文の中の「用語集」は残す
      const p = document.querySelector('.rd-hero.k-slim p.k-termhint.k-hint2');
      const only = !p || parseFloat(getComputedStyle(p).fontSize) === 0;
      const on = !!(s && only && shown(s) && shown(document.getElementById('rdside')));
      const h = document.documentElement;
      if (h.classList.contains('k-r9b-glside') !== on) h.classList.toggle('k-r9b-glside', on);
    } catch (e) { /* 無視 */ }
  }

  /* ───── ② スマホ幅：横に送れる表 ───── */
  function fixSwipe(w) {
    const narrow = window.innerWidth <= 640;
    $$('.k-r9b-swipe', w).forEach((p) => { const box = p.nextElementSibling; if (!narrow || !box || !(box.scrollWidth > box.clientWidth + 12)) p.remove(); });
    if (!narrow) return;
    $$('table', w).forEach((t) => {
      if (!vis(t)) return;
      let p = t.parentElement, box = null;
      for (let i = 0; p && p !== w && i < 4; i++, p = p.parentElement) { const c = getComputedStyle(p); if (/auto|scroll/.test(c.overflowX)) { box = p; break; } }
      if (!box || !(box.scrollWidth > box.clientWidth + 12)) return;
      const prev = box.previousElementSibling;
      if (prev && prev.classList.contains('k-r9b-swipe')) { setTxt(prev, M('← 表は横に動かせます →', '← Swipe the table sideways →', '← 表格可左右滑动 →', '← Deslice la tabla hacia los lados →')); return; }
      const h = document.createElement('p');
      h.className = 'k-r9b-swipe'; h.setAttribute('data-noi18n', '1');
      h.textContent = M('← 表は横に動かせます →', '← Swipe the table sideways →', '← 表格可左右滑动 →', '← Deslice la tabla hacia los lados →');
      box.before(h);
    });
  }

  /* ───── ③ 「次は 受信箱で承認して送る」の吹き出し ───── */
  function fixNextTitle(w) {
    const N = now();
    if (!N || N.r7b !== 'inbox' || !(N.pend > 0)) return;
    const t = M('承認待ちの営業メールが ' + N.pend + '件あります。押すと受信箱の「確認・承認」を開き、「承認して送る」を光らせます',
      N.pend + ' sales e-mail(s) are waiting for approval. Press to open “Review & approve” in the inbox.',
      '有 ' + N.pend + ' 封营销邮件等待确认。按下后打开收件箱的“确认・批准”。',
      'Hay ' + N.pend + ' correo(s) de ventas pendientes de aprobación. Pulse para abrir «Revisar y aprobar» en la bandeja.');
    const L = $$('[data-rdhero] .k-hcta, [data-rdhero] .k-next', w).filter((b) => vis(b) && /^次の手順：|^Next: |^下一步：|^Siguiente: /.test(b.title || ''));
    L.forEach((b) => { if (b.title !== t) b.title = t; });
  }

  /* ───── ④ メンバー・権限：登録している商品（完成形の見本を開いている間） ───── */
  function fixTeam(w, k) {
    if (k !== 'team') return;
    let T = null, TS = null;
    try { T = typeof TEN !== 'undefined' ? TEN : null; TS = typeof TENS !== 'undefined' ? TENS : null; } catch (e) { return; } // eslint-disable-line no-undef
    if (!T || T.src !== 'sample' || !Array.isArray(TS) || TS.indexOf(T) >= 0) return;
    const tile = $$('.rd-p2 .k-tile', w).find((x) => /^登録している商品$|^Registered products$|^已登记的商品$|^Productos registrados$/.test((($('.k-tl', x) || {}).textContent || '').trim()));
    if (!tile) return;
    const own = TS.length, n = own + 1;
    const tn = $('.k-tn', tile);
    if (tn && tn.dataset.r9b !== String(n)) {
      const u = $('small', tn);
      tn.textContent = String(n); if (u) tn.appendChild(u);
      tn.dataset.r9b = String(n); tn.dataset.v89n = String(n);
    }
    let s = $('.k-v92mix', tile);
    const col = ($('.k-ts', tile) || $('.k-tn', tile) || {}).parentElement || tile;
    if (!s) { s = document.createElement('small'); s.className = 'k-v92mix'; s.dataset.kqn = '1'; col.appendChild(s); }
    s.setAttribute('data-noi18n', '1');
    setTxt(s, M('内訳：見本（いま開いている完成形の見本・保存しません）1・御社が登録 ' + own, 'Breakdown: sample (the finished sample you are viewing; not saved) 1, registered by you ' + own, '明细：样本（当前打开的完成样本・不保存）1・贵公司登记 ' + own, 'Desglose: muestra (la muestra completa abierta; no se guarda) 1, registrados por usted ' + own));
  }

  /* ───── ⑤ 中古車・建設機械（1台から売る商材）：入力欄の例文を商材に合わせる（auto-08 の残り。日本語の画面） ───── */
  const AUTO_P = [
    ['例：Golden Harvest Trading', '例：Delta Heavy Equipment Trading'],
    ['場所（例：パリ・横浜港）', '場所（例：ハイフォン港・横浜港）'],
    ['例：ETINCELLE / SEOUL', '例：DHE / HAIPHONG / UNIT NO.1'],
    ['例：Le Havre／Bangkok', '例：Haiphong／Manila']
  ];
  function fixAutoPh() {
    if (lang() !== 'ja') return;
    let c = '';
    try { c = String(((typeof TEN !== 'undefined' && TEN) || {}).cat || ''); } catch (e) { return; } // eslint-disable-line no-undef
    if (c !== '中古車' && c !== '建設機械') return;
    $$('input[placeholder], textarea[placeholder]').forEach((el) => { for (const p of AUTO_P) { if (el.placeholder === p[0]) el.placeholder = p[1]; } });
    // 営業資料の画面：価格の言い方（1台ごと）と、次の一歩の選択肢（図面ではなく仕様書。資料の中身は本体の層で同じにしている。auto-N16）
    if (curKey() !== 'deck') return;
    const AUTO_T = [['価格表（単価・数量帯）', '価格表（1台ごとの価格）'], ['で数量帯と単価を入力', 'で1台の価格を入力'], ['図面で見積', '仕様書']];
    const w = well();
    const tw = document.createTreeWalker(w, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = tw.nextNode())) {
      const v = n.nodeValue;
      if (!v || v.length < 4 || v.length > 600) continue;
      let v2 = v;
      for (const p of AUTO_T) if (v2.indexOf(p[0]) >= 0) v2 = v2.split(p[0]).join(p[1]);
      if (v2 !== v) n.nodeValue = v2;
    }
  }

  function apply() {
    try {
      fixGloss();
      fixAutoPh();
      if (locked()) return;
      const w = well(), k = curKey();
      if (!fwd()) { fixNextTitle(w); fixTeam(w, k); }
      fixSwipe(w);
    } catch (e) { console.error('[rd v92r9b]', e); }
  }
  let t1 = 0, t2 = 0;
  const soon = () => { clearTimeout(t1); clearTimeout(t2); t1 = setTimeout(apply, 300); t2 = setTimeout(apply, 1500); };
  const old = RD.after;
  if (typeof old === 'function') RD.after = function () { const r = old.apply(this, arguments); try { apply(); } catch (e) { /* 無視 */ } soon(); return r; };
  document.addEventListener('click', soon, false);
  window.addEventListener('resize', soon);
  // 用語集の箱は、ほかの層があとから描き直す・html の class を書き直すことがある → そのたびに見直す
  let gT = 0;
  const gSoon = () => { clearTimeout(gT); gT = setTimeout(fixGloss, 60); };
  try { new MutationObserver(gSoon).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] }); } catch (e) { /* 無視 */ }
  const watchSide = () => { const sd = document.getElementById('rdside'); if (!sd) { setTimeout(watchSide, 600); return; } try { new MutationObserver(gSoon).observe(sd, { childList: true, subtree: true }); } catch (e) { /* 無視 */ } gSoon(); };
  watchSide();
  try { const lg = document.getElementById('lang'); if (lg) lg.addEventListener('change', () => setTimeout(apply, 900)); } catch (e) { /* 無視 */ }
  soon();
})();

} catch (e) { try { console.error("[rd] rd_v92z9yr9b.js", e); } catch (x) { } }
/* ==== rd_v92z9yr9c.js ==== */
try {
/* 21.94 r9c：刷新版の層（9巡目の直し：英語・中国語・スペイン語）。今の部品は差し替えず、RDX.after を包む
   ① 受信箱の「今日のまとめ」の札（xcut-T01）：日本語以外では「確認・承認：—」「急ぎの対応はありません」のままだった。
      札は受信箱のタブの文字（訳したあとの文字）から数を読んでいたため。訳す前の文字（I18N.orig）から読み、無ければ右上の「残り N件」と同じ数（承認待ちの数）を使う。
      数・まずの案内・ボタンを、その言語で出す（日本語の画面は何もしない）
   ② スペイン語の「(quedan 1)」→「(queda 1)」（xcut-U09 (1)） */
(function () {
  'use strict';
  const RD = window.RDX;
  if (!RD || RD._v92r9c) return;
  RD._v92r9c = 1;
  const { $, $$ } = RD;
  // I18N は今のアプリのスクリプトの const（window の持ち物ではない）ので名前で読む。言語の欄の値を先に見る
  const I18 = () => { try { return typeof I18N !== 'undefined' ? I18N : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const lang = () => { try { const el = document.getElementById('lang'); const v = String((el && el.value) || (I18() && I18().lang) || 'ja'); return /^en/.test(v) ? 'en' : /^zh/.test(v) ? 'zh' : /^es/.test(v) ? 'es' : 'ja'; } catch (e) { return 'ja'; } };
  const M = (ja, en, zh, es) => { const l = lang(); return l === 'en' ? en : l === 'zh' ? (zh || en) : l === 'es' ? (es || en) : ja; };
  const esc = RD.esc || ((s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])));
  const I = RD.I || (() => '');
  const fwd = () => { try { return !!RD.isFwd(); } catch (e) { return false; } };
  const locked = () => { try { return !!RD.locked(); } catch (e) { return document.body.classList.contains('locked'); } };
  const curKey = () => { try { return RD.curKey ? RD.curKey() : ''; } catch (e) { return ''; } };
  const well = () => document.getElementById('well') || document.querySelector('.stage') || document.body;
  // 訳す前の文字（今のアプリの辞書の仕組みが元の日本語を持っている）
  const origText = (el) => {
    let s = '';
    try {
      const o = I18() && I18().orig;
      const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = w.nextNode())) s += (o && o.has(n)) ? String(o.get(n)) : String(n.nodeValue || '');
    } catch (e) { s = String(el.textContent || ''); }
    return s.replace(/\s+/g, ' ').trim();
  };
  const tabsOf = (w) => $$('.v38ix button, .v33ix button, .v33tab', w).filter((x) => !x.closest('.rd-x')).map((b) => ({ b, t: origText(b) }));
  const numOf = (tabs, re) => { const x = tabs.find((y) => re.test(y.t)); const m = x && x.t.match(/(\d+)/); return m ? +m[1] : null; };
  const pendN = () => { try { const P = window.v92r7b && window.v92r7b.pending ? window.v92r7b.pending() : null; return P && P.n > 0 ? +P.n : 0; } catch (e) { return 0; } };
  const cnt = (n) => M(n + '件', n === 1 ? '1 item' : n + ' items', n + ' 件', n === 1 ? '1 pendiente' : n + ' pendientes');

  function fixInboxCard(w, k) {
    if (k !== 'inbox' || fwd() || lang() === 'ja') return;
    const ul = $('ul.k-ck', w) || $('.stage ul.k-ck') || $('ul.k-ck');
    const sec = ul && ul.closest('section.k-card');
    if (!sec) return;
    const tabs = tabsOf(w);
    // タブの文字は、訳す前の日本語のことも、はじめからその言語のこともある
    let appr = numOf(tabs, /確認・承認|Review & approve|确认・审批|确认・批准|Revisar y aprobar/);
    const mine = numOf(tabs, /自分の番|My turn|轮到我|我的回合|Mi turno|Su turno/);
    if (!appr) { const p = pendN(); if (p) appr = p; }
    const lis = $$(':scope > li', ul);
    const li = lis[2];
    const tag = li && $('.k-tag', li);
    const first = appr ? 'appr' : mine ? 'mine' : '';
    const sig = 'r9c|' + lang() + '|' + appr + '|' + mine;
    if (sec.dataset.r9c === sig && (!tag || tag.dataset.r9c === sig)) return;
    if (tag) {
      tag.setAttribute('data-noi18n', '1');
      tag.textContent = appr == null ? '—' : cnt(appr);
      tag.classList.toggle('or', !!appr); tag.classList.toggle('gr', !appr);
      tag.dataset.r9c = sig;
    }
    const box = ul.nextElementSibling;
    if (box && first) {
      const nm = first === 'appr' ? M('確認・承認', 'Review & approve', '确认・审批', 'Revisar y aprobar') : M('自分の番', 'Your turn', '轮到我', 'Su turno');
      const n = first === 'appr' ? appr : mine;
      box.setAttribute('data-noi18n', '1');
      box.innerHTML = `<b style="font-size:15px;line-height:1.5;display:block;margin-bottom:10px">${I('spark', 18)} ${esc(M('まずは「' + nm + '」の ' + n + '件から対応しましょう', 'Start with the ' + (n === 1 ? '1 item' : n + ' items') + ' in “' + nm + '”', '先处理“' + nm + '”中的 ' + n + ' 件', 'Empiece por ' + (n === 1 ? 'el elemento' : 'los ' + n + ' elementos') + ' de «' + nm + '»'))}</b><button type="button" class="k-btn wide" data-r9c-go="${first}">${esc(M(nm + 'を開く', 'Open ' + nm, '打开' + nm, 'Abrir ' + nm))} ${I('chevR', 18, 2.4)}</button>`;
      const go = $('[data-r9c-go]', box);
      if (go) go.addEventListener('click', () => {
        try {
          const re = first === 'appr' ? /確認・承認|Review & approve|确认・审批|确认・批准|Revisar y aprobar/ : /自分の番|My turn|轮到我|我的回合|Mi turno|Su turno/;
          const x = tabsOf(well()).find((y) => re.test(y.t));
          if (x) { x.b.click(); setTimeout(() => { const s = document.getElementById('sec-1') || x.b; try { s.scrollIntoView({ block: 'start', behavior: 'smooth' }); } catch (e) { /* 無視 */ } }, 60); }
        } catch (e) { /* 無視 */ }
      });
    }
    sec.dataset.r9c = sig;
  }

  function fixQuedan() {
    if (lang() !== 'es') return;
    $$('.k-r7b-next b, .k-next b, .k92c-hnext b', document).forEach((b) => {
      const t = String(b.textContent || '');
      if (/\(quedan 1\)/.test(t)) b.textContent = t.replace('(quedan 1)', '(queda 1)');
    });
  }

  function apply() {
    try {
      if (locked() || fwd() || lang() === 'ja') return;
      const w = well(), k = curKey();
      fixInboxCard(w, k); fixQuedan();
    } catch (e) { console.error('[rd v92r9c]', e); }
  }
  const old = RD.after;
  RD.after = function () {
    const r = old.apply(this, arguments);
    apply();
    return r;
  };
  let t1 = 0, t2 = 0;
  const soon = () => { if (lang() === 'ja') return; clearTimeout(t1); clearTimeout(t2); t1 = setTimeout(apply, 460); t2 = setTimeout(apply, 1900); };
  document.addEventListener('click', soon, false);
  document.addEventListener('change', soon, false);
  setTimeout(apply, 700);
})();

} catch (e) { try { console.error("[rd] rd_v92z9yr9c.js", e); } catch (x) { } }
/* ==== rd_v92z9yr9g.js ==== */
try {
/* 21.94 r9g（刷新版の層）：AI商社マンの画面の上の「AI商社マンの成長」（rd_pages2.js の RD.page.ai のカード）の帯に、
   一人前ライン（90%＝本体の GROW_PRO）の印を付ける。下の「成長レベル」の輪の印・凡例と同じ濃紺の棒（rd_v92r9g.css の .k-g9bar）。
   カードの文「…・一人前は 90%」はそのまま。数字・帯の長さは変えない。RDX.after を包む（ほかの刷新版の層と同じ形）。 */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v92r9g) return;
  RD._v92r9g = 1;
  const { $$ } = RD;
  const pro = () => { try { return typeof GROW_PRO !== "undefined" ? +GROW_PRO || 90 : 90; } catch (e) { return 90; } }; // eslint-disable-line no-undef
  function markBar(w) {
    const cards = $$(".k-card", w).filter((c) => !c.closest(".c.grow") && c.querySelector(".k-bar"));
    cards.forEach((c) => {
      const h = c.querySelector("h2, h3, .k-h b, .k-h");
      const t = (h && h.textContent) || "";
      if (!/AI商社マンの成長|AI trading|growth|成长|crecimiento/i.test(t) && !c.querySelector('[data-rdk="ai"]')) return;
      const bar = c.querySelector(".k-bar");
      if (!bar || bar.classList.contains("k-g9bar")) return;
      if (!/(一人前|90%|full|独当|completo)/i.test(c.textContent || "")) return;
      bar.classList.add("k-g9bar");
      bar.style.setProperty("--g9pro", pro() + "%");
    });
  }
  const prev = RD.after;
  RD.after = function () {
    const r = prev.apply(this, arguments);
    try { if (RD.curKey() === "ai") { const w = document.getElementById("well"); if (w) markBar(w); } } catch (e) { console.error("[rd v92r9g]", e); }
    return r;
  };
})();

} catch (e) { try { console.error("[rd] rd_v92z9yr9g.js", e); } catch (x) { } }
/* ==== rd_v92z9zr9p.js ==== */
try {
/* 貿易クラウドAI商社マン 21.94 r9p の刷新版の層（いちばん後ろに読む）
   読み込みの仕組みの直し（RDX.after を読み込みの間は止めて最後に1回・見張りの空回りを飛ばす・「読み込み中」の表示）は
   rd_v92r9pboot.js（いちばん前に読む）と build.py（CSS・JS を1本ずつにまとめる）にある。ここは、読み込みのあとも止まらない描き直しの直し。
   ① 案件一覧ほかのボタンの data-kfull（rd_case.js の shortBtns の「済み」の印）が、1.5 秒おき（と RDX.after のたび）に同じ値で書き直され続けていた（8820 も同じ）。
      shortBtns は「印がある（中身が空でない）ボタンは飛ばす」形だが、縮めなかったボタンには空の印（""）を付けるため、毎回やり直しになる
      （getClientRects で配置の計算をさせ、属性を書き直す。1回 約100か所・CPU 1/4 で 1 回 約36ms。DOM の変化の知らせが 1秒に約100件）。
      直し：shortBtns が空の印を付けたら、中身を空白1文字にする（次からは「済み」として飛ばされる）。data-kfull の中身を読む所は無い
            （title は別に付く。CSS・ほかの層・本体は data-kfull の中身を読まない）。縮めたボタン（全文が入る）・ほかの層が付けた印はそのまま。
            ボタンの文字があとから書き換わったとき（右上の「次は」など、同じボタンの文言が変わる）は、印を空に戻して、shortBtns にもう一度見させる
            （今までどおり「次は：商品を登録（足りない情報を埋める）」→「次は：商品を登録」と縮む）。 */
(function () {
  "use strict";
  const RD = window.RDX;
  if (!RD || RD._v92r9p) return;
  RD._v92r9p = 1;
  const S = (window.__rd92r9p = { kfull: 0, reset: 0 });
  const DONE = " ";
  const SEL = '[data-kfull=" "]';
  try {
    // shortBtns が付けた空の印 → 「済み」の印（自分が空に戻した分＝前の値が「済み」のものは、そのままにして shortBtns に見させる）
    const mo = new MutationObserver((recs) => {
      // 1回の知らせの中に同じボタンの変化が続けて入ることがある（自分の書き換え → 空に戻した分 など）。ボタンごとに、いちばん後ろの変化だけを見る：
      // 今の値が空で、その変化の前の値が「済み」でない（＝空に戻した分ではなく、shortBtns が付けた空の印）ときだけ「済み」にする
      const last = new Map();
      for (let i = 0; i < recs.length; i++) if (recs[i].target && recs[i].target.nodeType === 1) last.set(recs[i].target, recs[i].oldValue);
      last.forEach((old, t) => {
        if (old === DONE) return;
        if (t.getAttribute("data-kfull") === "") { t.setAttribute("data-kfull", DONE); S.kfull++; }
      });
    });
    mo.observe(document.body || document.documentElement, { subtree: true, attributes: true, attributeOldValue: true, attributeFilter: ["data-kfull"] });
    // 「済み」のボタンの中の文字が変わったら、印を空に戻す
    const mo2 = new MutationObserver((recs) => {
      for (let i = 0; i < recs.length; i++) {
        let t = recs[i].target;
        if (t && t.nodeType !== 1) t = t.parentElement;
        const b = t && t.closest ? t.closest(SEL) : null;
        if (b) { b.setAttribute("data-kfull", ""); S.reset++; }
      }
    });
    mo2.observe(document.body || document.documentElement, { subtree: true, childList: true, characterData: true });
  } catch (e) { /* 無視 */ }
})();

} catch (e) { try { console.error("[rd] rd_v92z9zr9p.js", e); } catch (x) { } }
/* ==== rd_v92z9zr9x.js ==== */
try {
/* 21.94 r9x：刷新版の層（9巡目の5本を重ねた版の確かめで見つけた違い）。RDX.after を包む
   ⑧ 商品情報を登録の「ほかに N項目（重要な順に、1つずつ伺います）」（rd_v92up.js の L(ja, en)。中・西の訳が無く英語の文が出る）
      r9b で「—」だけの値を未登録と数えるようになり、資料で登録した書道セット・建機の質問が 3つになって、この行が出るようになった
      （r9c の通しのスペイン語 02_report で英語の行が 1 つ増えた）。中・西のときだけ、その言語の文にする（英語・日本語は今までどおり）。 */
(function () {
  "use strict";
  if (window.__rd92r9x) return;
  window.__rd92r9x = 1;
  const RD = window.RDX;
  if (!RD || typeof RD.after !== "function") return;
  const lg = () => { try { return String((typeof I18N !== "undefined" && I18N && I18N.lang) || "ja").slice(0, 2); } catch (e) { return "ja"; } }; // eslint-disable-line no-undef
  function fixQm() {
    const l = lg();
    if (l !== "zh" && l !== "es") return;
    document.querySelectorAll(".k-v92upqm").forEach((p) => {
      const m = String(p.textContent || "").trim().match(/^(\d+) more item\(s\), asked one by one$/);
      if (!m) return;
      p.textContent = l === "zh" ? "另有 " + m[1] + " 项（按重要程度逐一询问）" : m[1] + " campo(s) más (se preguntan uno a uno, por orden de importancia)";
    });
  }
  const prev = RD.after;
  RD.after = function () {
    const r = prev.apply(this, arguments);
    try { fixQm(); } catch (e) { /* 無視 */ }
    return r;
  };
})();

} catch (e) { try { console.error("[rd] rd_v92z9zr9x.js", e); } catch (x) { } }
