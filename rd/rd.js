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
    { g: "資産（ナレッジ）", ic: "db", items: [["item", "商品情報", "box"], ["up", "商品情報を登録", "upload"], ["docs", "ドキュメント", "folder"], ["legal", "契約書関連", "doc"], ["gloss", "用語集", "book", "", 1], ["srcs", "取り込んだ情報", "list", "", 1]] },
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
  // 今の版のメニューにある画面（試験で「全部ある」を確かめる）
  RD.NAV_S = NAV_S; RD.NAV_F = NAV_F;

  /* ───── 画面ごとの見出し ───── */
  const HERO = {
    "dash:rep": ["分析・レポート", "商談の進み具合・国ごとの手応え・タスクを、データでまとめています。"],
    today: ["今日やること", "AI商社マンが、今日やることを大事な順に並べました。"],
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
    if (isFwd()) return G("fwdCur") || "finbox";
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
    RD._keep = 1;
    try { if (G("cur") === p && typeof render === "function") render(); else go(p); } finally { RD._keep = 0; }
    try { window.scrollTo(0, 0); const st = $(".stage"); if (st) st.scrollTop = 0; } catch (e) { /* 無視 */ }
  }
  function fGo(p) {
    try { fwdCur = p; } catch (e) { return; } // eslint-disable-line no-undef
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
  function foldGet() { try { return JSON.parse(localStorage.getItem("rd_navfold") || "{}") || {}; } catch (e) { return {}; } }
  function foldSet(o) { try { localStorage.setItem("rd_navfold", JSON.stringify(o)); } catch (e) { /* 無視 */ } }
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
    const k = curKey();
    const kp = k.split(":")[0];
    const fold = foldGet();
    // 今の版のメニュー下の欄（#sft）は、描き直しで消さないよう、いったん元の場所へ戻してから描く（アプリが #sft を書き換えるため）
    const sft0 = $("#sft");
    if (sft0 && el.contains(sft0)) side.insertBefore(sft0, el);
    const bdg = (key) => { if (!key) return ""; const n = fwd ? origBadge('[data-fp="' + key + '"]') : origBadge('[data-p="' + key + '"]'); return n ? `<span class="rd-bdg">${esc(n)}</span>` : ""; };
    const isOn = (x) => x === k || (x.indexOf(":") < 0 && k.indexOf(":") < 0 && x === kp);
    const grp = (G2) => {
      const on = G2.items.some((it) => isOn(it[0]));
      const closed = !!fold[G2.g] && !on;
      return `<div class="rd-grp ${on ? "on" : ""}"><button type="button" class="rd-gh" data-rdfold="${esc(G2.g)}" aria-expanded="${!closed}"><span>${esc(G2.g)}</span>${I("chev", 14, 2.4)}</button>
        ${closed ? "" : G2.items.filter((it) => !it[4] || isOn(it[0])).map((it) => `<button type="button" class="rd-ni" data-rdk="${esc(it[0])}" aria-current="${isOn(it[0])}">${I(it[2], 19)}<span>${esc(it[1])}</span>${bdg(it[3])}</button>`).join("")}</div>`;
    };
    el.innerHTML = `<button type="button" class="rd-logo" data-rdk="${fwd ? "fhome" : "dash:home"}" aria-label="ホームへ"><img src="${IMG}logo.png" alt="貿易クラウド AI商社マン"></button>
      <div class="k-modechip">${I("bldg", 18)}<span>${fwd ? "物流会社向け" : "荷主向け"}</span></div>
      <nav aria-label="メニュー">${A.map(grp).join("")}
        <div class="rd-grp rd-grp-help"><button type="button" class="rd-ni" data-rdact="help">${I("help", 19)}<span>ヘルプ</span></button></div></nav>
      <div class="rd-sp"></div>
      <button type="button" class="rd-start" data-rdact="help"><img src="${IMG}robot.png" alt=""><span><b>はじめての方へ<br>${fwd ? "14日で運用を始める" : "3分でわかる"}<br>スタートガイド<span class="rd-go">${I("chevR", 12, 3)}</span></b></span></button>
      <div class="rd-sftw"></div>`;
    // メニューの下の欄（トライアルの残り日数・検索のショートカット）は今の版のものをそのまま入れる
    const sft = $("#sft");
    if (sft) $(".rd-sftw", el).appendChild(sft);
  }
  function onSide(e) {
    const f = e.target.closest("[data-rdfold]");
    if (f) { const o = foldGet(); const g = f.getAttribute("data-rdfold"); o[g] = f.getAttribute("aria-expanded") === "true" ? 1 : 0; foldSet(o); buildSide(); return; }
    const b = e.target.closest("[data-rdk],[data-rdact]");
    if (!b) return;
    const act = b.getAttribute("data-rdact");
    if (act === "help") return openHelp();
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
  function readDash(w) {
    const D = { wait: [], setup: [], funnel: [], byc: [] };
    $$("#sec-0 .v38wt", w).forEach((b) => D.wait.push({ k: b.getAttribute("data-v38wf"), n: num($(".v38wn", b) && $(".v38wn", b).textContent), l: ($(".v38wl", b) || {}).textContent || "", s: ($(".v38ws", b) || {}).textContent || "", el: b }));
    $$("#ux32setup .ux32steps > li", w).forEach((li) => D.setup.push({ t: (($(".ux32st b", li) || {}).textContent || "").trim(), done: li.classList.contains("done"), next: li.classList.contains("next"), why: (($(".v68why", li) || {}).textContent || "").trim() }));
    $$("#sec-4 .ddr", w).forEach((r) => D.funnel.push({ l: (r.children[0] && r.children[0].textContent.trim()) || "", n: num(r.children[1] && r.children[1].textContent), el: r }));
    $$("#sec-5 .ddr", w).forEach((r) => D.byc.push({ l: (r.children[0] && r.children[0].textContent.trim()) || "", n: num(r.children[2] && r.children[2].textContent), el: r }));
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
    $("#rdask", box).addEventListener("submit", (e) => { e.preventDefault(); ask($("#rdaskq", box).value); });
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
  function caseInfo(w) {
    return $$("section.v33case", w).map((c, i) => {
      const h = $("h3", c); const no = (($(".v33mute", h) || {}).textContent || "").replace(/^案件\s*/, "").trim();
      const co = h ? h.childNodes[0] && h.childNodes[0].textContent.trim() : "";
      const t = c.textContent || "";
      const bl = !/B\/L 未登録/.test(t);
      const m = t.match(/対応済み\s*(\d+)\s*\/\s*(\d+)/);
      const done = m ? +m[1] : 0, all = m ? +m[2] : 0;
      const held = /仮押さえ/.test(t);
      const items = $$(".v33li", c).map((li) => ({ id: (($("b", li) || {}).textContent || "").trim(), st: ($$(".v33lv", li).map((x) => x.textContent.trim()).find((s) => /^荷主：/.test(s)) || "").replace(/^荷主：/, ""), route: (($(".v33li-m .v33mute", li) || {}).textContent || "").split("・")[1] || "" }));
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
        if (k === "fhome") { /* homeFwd は fwdRender の包みで描く */ }
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
          putHero(w, greet(), "AI商社マンが、貴社の海外展開をサポートします。", chip);
          const cb = $(".k-lvchip", w); if (cb) cb.addEventListener("click", () => goKey("ai"));
          homeShipper(w);
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

  /* ───── 今のアプリの関数を包む（中身はそのまま呼ぶ） ───── */
  function wrapAll() {
    if (RD._wrapped) return;
    if (typeof window.render !== "function" && typeof G("render") !== "function") return;
    RD._wrapped = 1;
    const r0 = G("render");
    render = function () { const r = r0.apply(this, arguments); after(); return r; }; // eslint-disable-line no-global-assign, no-undef
    const g0 = G("go");
    if (typeof g0 === "function") go = function (id) { if (id === "dash" && !RD._keep) RD.dashMode = "home"; return g0.apply(this, arguments); }; // eslint-disable-line no-global-assign, no-undef
    const f0 = G("fwdRender");
    if (typeof f0 === "function") {
      fwdRender = function () { // eslint-disable-line no-global-assign, no-undef
        if (!RD._fland) { RD._fland = 1; try { if (fwdCur === "finbox") fwdCur = "fhome"; } catch (e) { /* 無視 */ } } // eslint-disable-line no-undef
        let home = false;
        try { home = fwdCur === "fhome"; } catch (e) { /* 無視 */ } // eslint-disable-line no-undef
        if (home) {
          try { fwdCur = "finbox"; } catch (e) { /* 無視 */ } // eslint-disable-line no-undef
          let r;
          try { r = f0.apply(this, arguments); } finally { try { fwdCur = "fhome"; } catch (e) { /* 無視 */ } } // eslint-disable-line no-undef
          try { const w = $("#well"); if (w) homeFwd(w); } catch (e) { console.error("[rd]", e); }
          after();
          return r;
        }
        const r = f0.apply(this, arguments); after(); return r;
      };
    }
    const n0 = G("fwdNav");
    if (typeof n0 === "function") fwdNav = function () { const r = n0.apply(this, arguments); try { buildSide(); } catch (e) { /* 無視 */ } return r; }; // eslint-disable-line no-global-assign, no-undef
  }
  wrapAll();

  // 画面が描き直されて見出しが消えたら、もう一度仕上げる（受信箱の数の更新など、render を通らない描き直しに備える）
  let tmr = 0;
  const mo = new MutationObserver(() => {
    clearTimeout(tmr);
    tmr = setTimeout(() => {
      const w = $("#well");
      if (!w || locked()) { buildSide(); buildBar(); return; }
      if (!$("[data-rdhero]", w) || (isFwd() && curKey() === "fhome" && !$(".rd-fhome-top", w) && !$(".rd-tiles", w))) {
        if (isFwd() && curKey() === "fhome") { try { fwdRender(); } catch (e) { /* 無視 */ } } // eslint-disable-line no-undef
        else after();
      } else { buildSide(); clampLong(w); }
    }, 120);
  });
  /* プレビューのログインの手助け：手元（127.0.0.1）の模擬サーバーの架空デモアカウントで入る */
  function loginHelper() {
    if ($("#rdlogin")) return;
    const go = $("#lg-go");
    if (!go || !/^(127\.0\.0\.1|localhost)$/.test(location.hostname)) return;
    const box = document.createElement("div");
    box.id = "rdlogin";
    box.innerHTML = `<b>刷新版プレビュー（手元だけ）：どちらかを押すと入れます</b>本番のサーバー・お客様のデータには一切つながりません（手元の模擬サーバーの架空のデモデータです）。<button type="button" data-c="TRIAL-2026">荷主（お客様）の画面で入る</button><button type="button" class="b2" data-c="FWD-2026">物流会社の画面で入る</button>`;
    box.addEventListener("click", (e) => { const b = e.target.closest("[data-c]"); if (!b) return; const c = $("#lg-code"), n = $("#lg-name"); if (c) c.value = b.dataset.c; if (n) n.value = ""; go.click(); });
    go.closest("form, div") ? go.closest("form, div").before(box) : go.before(box);
  }
  function start() {
    loginHelper();
    const w = $("#well");
    if (w) mo.observe(w, { childList: true });
    const n = $("#nav");
    if (n) mo.observe(n, { childList: true, subtree: true, characterData: true });
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
  const iv = setInterval(() => { tries++; wrapAll(); if (!locked()) { after(); } else { loginHelper(); } if (tries > 40) clearInterval(iv); }, 500);
})();
