/* ═══ v21.99 cty（2026-11-19 第12回相当 UAT・21.98 に対して）販売先国の分析（中身。見せ方は rd_v99cty.js）
   土台・前の層（v95〜v98）は書き換えず、前の関数を控えてから包む。同期サーバーは変えない。
   No.549（高）H ささみジャーキーで、ヒアリングの進出希望国に「指定なし」と答えると、販売先候補に架空の国「指定」（39点）が出て、
           確定ダイアログにも「進出希望国（指定）」と出た。
     原因：ヒアリングの答えは applyAnswer → 21.54 の層（v54u）の v54upldTargets で国に分ける。v54upldTargets は、国の表に無い語でも
           「前後のひらがなを削って、2〜15字でひらがなが無ければ国として足す」作り。「指定なし」→ 後ろの「なし」が削られて「指定」が国になった。
           「なし・未定」は削った後の語でしか見ていなかった（「指定」は見ていない）。
           入った「指定」は ctyAutoCands（候補国）→ 採点（規制も統計も無い国＝39点前後）→ AI への依頼 → 推奨（進出希望国を先に選ぶ）→
           確定ダイアログ（TEN.targets から「商品の登録で選んだ進出希望国」）→ 保存された分析（ctySel・21.97 の記録 v97h）と、全部の経路に流れた。
     直し：① 「希望なし」の言い方（指定なし・特になし・なし・未定・どこでも・おまかせ・全世界・まだ決めていない・no preference・any・
             Not specified・未指定・Sin especificar など）を「希望なし」として扱う（V99CTY.noneOf）。ヒアリングでは「希望なし」と受け取って
             次の質問へ進み（国としては登録しない・2回目の聞き直しもしない）、商品に印（targetsNone）を残す。
           ② 国の一覧（アプリの国名の表：販売先国の表・規制DB・バイヤーの国・地域の表・通関統計の相手国・登録の国名の表＋世界の国・地域の通称）
             に無い文字列は、どの経路でも国にしない（V99CTY.isCty）：答えの読み取り（v54upldTargets・applyAnswer）、候補国（ctyAutoCands・ctyAddCand・
             ctyAnalyzeLocal）、AI への依頼（ctyAnalyzeAI に渡す国）、商品の進出希望国（tenantToD の前に TEN.targets）、保存された分析
             （ctyStore：候補・推奨・確定・点数・AI の答え・21.92 の進出希望国の控え・21.97 の記録）から外す。表示の前にも弾く。
   No.517（記録）販売先スコアの変動の説明（B 香港 44→61・E 香港 43→61 で B と同一・競合は A・D 以外「未評価」）
     直し：・前回の分析と比べた点の動きを、国ごとに（総合・市場性・規制・競合・拠点の何点・何の入力／データで動いたか）作る（V99CTY.chgOf）。
             見せ方は国の行のすぐ下（rd）。前回が前の版の分析なら、その旨と、その版で直した点の決め方を出す。
           ・同じ国の点が、別の商品の分析と同じになったとき、同じになった理由（同じカテゴリーの規制のひな形・同じ関税・統計が無く同じ扱い 等）（V99CTY.twinOf）。
           ・競合が「未評価」のとき、なぜ未評価か（この HS の通関統計が無い／国別の内訳が無い／この国への記録が無い）と、どうすれば評価できるか（V99CTY.compWhy）。
             データの出どころ（通関統計＝UN Comtrade・日本の計数は財務省貿易統計。アプリに入っている写しの取得日）を確かめて書く。無いデータは作らない。 */
var V99CTY = window.V99CTY = { v: "21.99", err: null, errs: [], n: { none: 0, drop: 0, cand: 0, store: 0, ten: 0, ask: 0 } };
(function () {
  "use strict";
  const W = window;
  const err = (k, e) => { try { const m = k + ": " + String((e && e.message) || e).slice(0, 160); V99CTY.err = m; V99CTY.errs.push(m); if (V99CTY.errs.length > 40) V99CTY.errs.shift(); } catch (x) { /* 記録だけ */ } };
  V99CTY.errf = err;
  const lang = () => { try { const v = W.V98CTY; if (v && typeof v.lang === "function") return v.lang(); } catch (e) { /* 次へ */ } try { const l = String((typeof I18N !== "undefined" && I18N && I18N.lang) || "ja"); return /^en/.test(l) ? "en" : /^zh/.test(l) ? "zh" : /^es/.test(l) ? "es" : "ja"; } catch (e) { return "ja"; } };
  const M = (ja, en, zh, es) => { const l = lang(); return l === "en" ? (en || ja) : l === "zh" ? (zh || en || ja) : l === "es" ? (es || en || ja) : ja; };
  V99CTY.M = M; V99CTY.lang = lang;
  const E = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  V99CTY.E = E;
  const ten = () => { try { return (typeof TEN !== "undefined" && TEN) ? TEN : null; } catch (e) { return null; } };
  const store = () => { try { return typeof ctyStore === "function" ? ctyStore() : null; } catch (e) { return null; } };
  const digits = (s) => String(s == null ? "" : s).replace(/[^\d]/g, "");

  /* ════════════ No.549 ① 国の一覧 ════════════ */
  // 世界の国・地域の通称（アプリの表に無い国を「架空の国」として落とさないため。国名だけで、規制・関税などの事実は足さない）
  const WORLD = ("インド,インドネシア,カンボジア,シンガポール,スリランカ,タイ,韓国,中国,北朝鮮,ネパール,パキスタン,バングラデシュ,東ティモール,フィリピン,ブータン,ブルネイ,ベトナム,マレーシア,ミャンマー,モルディブ,モンゴル,ラオス,台湾,香港,マカオ," +
    "アフガニスタン,UAE,イエメン,イスラエル,イラク,イラン,オマーン,カタール,クウェート,サウジアラビア,シリア,トルコ,バーレーン,ヨルダン,レバノン,パレスチナ," +
    "アイスランド,アイルランド,アゼルバイジャン,アルバニア,アルメニア,アンドラ,イギリス,イタリア,ウクライナ,ウズベキスタン,エストニア,オーストリア,オランダ,カザフスタン,キプロス,キルギス,ギリシャ,クロアチア,コソボ,サンマリノ,ジョージア,スイス,スウェーデン,スペイン,スロバキア,スロベニア,セルビア,タジキスタン,チェコ,デンマーク,ドイツ,トルクメニスタン,ノルウェー,バチカン,ハンガリー,フィンランド,フランス,ブルガリア,ベラルーシ,ベルギー,ボスニア・ヘルツェゴビナ,ポーランド,ポルトガル,北マケドニア,マルタ,モナコ,モルドバ,モンテネグロ,ラトビア,リトアニア,リヒテンシュタイン,ルーマニア,ルクセンブルク,ロシア," +
    "アメリカ,カナダ,メキシコ,アルゼンチン,アンティグア・バーブーダ,ウルグアイ,エクアドル,エルサルバドル,ガイアナ,キューバ,グアテマラ,グレナダ,コスタリカ,コロンビア,ジャマイカ,スリナム,セントクリストファー・ネービス,セントビンセント及びグレナディーン諸島,セントルシア,チリ,ドミニカ共和国,ドミニカ国,トリニダード・トバゴ,ニカラグア,ハイチ,パナマ,バハマ,パラグアイ,バルバドス,ブラジル,ベネズエラ,ベリーズ,ペルー,ボリビア,ホンジュラス,プエルトリコ," +
    "アルジェリア,アンゴラ,ウガンダ,エジプト,エスワティニ,エチオピア,エリトリア,ガーナ,カーボベルデ,ガボン,カメルーン,ガンビア,ギニア,ギニアビサウ,ケニア,コートジボワール,コモロ,コンゴ共和国,コンゴ民主共和国,サントメ・プリンシペ,ザンビア,シエラレオネ,ジブチ,ジンバブエ,スーダン,セーシェル,赤道ギニア,セネガル,ソマリア,タンザニア,チャド,中央アフリカ,チュニジア,トーゴ,ナイジェリア,ナミビア,ニジェール,ブルキナファソ,ブルンジ,ベナン,ボツワナ,マダガスカル,マラウイ,マリ,南アフリカ,南スーダン,モーリシャス,モーリタニア,モザンビーク,モロッコ,リビア,リベリア,ルワンダ,レソト," +
    "オーストラリア,ニュージーランド,パプアニューギニア,フィジー,サモア,トンガ,バヌアツ,ソロモン諸島,キリバス,ツバル,ナウル,パラオ,マーシャル諸島,ミクロネシア,グアム,ニューカレドニア,フランス領ポリネシア").split(",");
  const NOT_CTY = /^(?:日本|日本国|国内|世界全体|世界|海外|全世界)$/;
  const nrm = (c) => { let s = String(c == null ? "" : c).normalize("NFKC").replace(/[\s　]+/g, "").trim(); if (!s) return ""; try { if (typeof ctyNorm === "function") s = ctyNorm(s) || s; } catch (e) { /* そのまま */ } return s; };
  let SET = null, SETAT = 0, BUILD = 0;
  function known() {
    if (SET && Date.now() - SETAT < 60000) return SET;
    if (BUILD) return SET || new Set(WORLD);
    BUILD = 1;
    try { return build(); } finally { BUILD = 0; }
  }
  function build() {
    const S = new Set();
    const add = (x) => { const s = nrm(x && typeof x === "object" ? (x.c || x.name || "") : x); if (s && !NOT_CTY.test(s)) S.add(s); };
    try { if (typeof ctyAll === "function") (ctyAll() || []).forEach(add); } catch (e) { err("ctyAll", e); }
    try { if (typeof KNOWN_CTY !== "undefined" && Array.isArray(KNOWN_CTY)) KNOWN_CTY.forEach(add); } catch (e) { /* 無い */ }
    try { if (typeof v54upldCty === "function") (v54upldCty().ja || []).forEach(add); } catch (e) { err("v54cty", e); }
    try { if (typeof RD !== "undefined" && RD && typeof RD === "object") Object.keys(RD).forEach(add); } catch (e) { /* 無い */ }
    try { if (typeof CTY_REGION !== "undefined" && CTY_REGION) Object.keys(CTY_REGION).forEach((k) => (CTY_REGION[k] || []).forEach(add)); } catch (e) { /* 無い */ }
    try { if (typeof BN_CTY !== "undefined" && Array.isArray(BN_CTY)) BN_CTY.forEach((r) => add(r && r[0])); } catch (e) { /* 無い */ }
    try { const n = (typeof NEED !== "undefined" && Array.isArray(NEED)) ? NEED.find((x) => x && x.k === "targets") : null; if (n && Array.isArray(n.chips)) n.chips.forEach(add); } catch (e) { /* 無い */ }
    try { const C = typeof csData === "function" ? csData() : null; if (C && C.partner) Object.keys(C.partner).forEach((k) => add(C.partner[k])); } catch (e) { /* 無い */ }
    WORLD.forEach(add);
    SET = S; SETAT = Date.now();
    return S;
  }
  function isCty(c) { const s = nrm(c && typeof c === "object" ? (c.c || c.name || "") : c); return !!s && !NOT_CTY.test(s) && known().has(s); }
  V99CTY.isCty = isCty;
  V99CTY.known = () => Array.from(known());
  V99CTY.nrm = nrm;
  // 国の並びを、一覧にある国だけにする（元の書き方は残す・同じ国は1つ）
  function cleanList(L) {
    const out = [], bad = [], seen = new Set();
    (Array.isArray(L) ? L : (L ? String(L).split(/[、,，・\/／]+/) : [])).forEach((x) => {
      const raw = String(x && typeof x === "object" ? (x.c || x.name || "") : (x == null ? "" : x)).trim();
      if (!raw) return;
      if (isCty(raw)) { const k = nrm(raw); if (!seen.has(k)) { seen.add(k); out.push(typeof x === "string" ? raw : x); } }
      else bad.push(raw);
    });
    return { out, bad };
  }
  V99CTY.cleanList = cleanList;

  /* ════════════ No.549 ② 「希望なし」の言い方 ════════════ */
  const NONE_WORDS = new Set(["指定なし", "指定無し", "特になし", "特に無し", "とくになし", "なし", "無し", "ない", "無い", "ありません", "未定", "未決定", "検討中", "どこでも", "おまかせ", "お任せ", "全世界", "世界中", "世界各国",
    "まだ決めていない", "まだ決めてない", "決めていない", "決めてない", "まだ決まっていない", "決まっていない", "未指定", "希望なし", "希望無し", "こだわりなし", "国の指定なし",
    "notspecified", "unspecified", "nopreference", "none", "no", "any", "anywhere", "anycountry", "allcountries", "worldwide", "global", "undecided", "notdecided", "notdecidedyet", "tbd", "n/a", "na", "nospecificcountry", "notsure", "nil",
    "没有", "无", "不限", "任何", "任何国家", "都可以", "全球", "随便", "无指定", "没有指定", "暂无", "未定", "不指定",
    "sinespecificar", "noespecificado", "sinpreferencia", "ninguno", "ninguna", "cualquiera", "cualquierpais", "cualquierpaís", "todoelmundo", "indiferente", "pordecidir", "nodecidido"]);
  const NONE_RE = /^(?:(?:今は|いまは|現時点では|現状|まだ)?(?:特に|とくに)?(?:国の?|国は|国も)?(?:指定|希望|こだわり|決まり|予定|制限|限定)?(?:は|も|が)?(?:特に|とくに)?(?:なし|無し|ない|無い|ありません|ないです|無いです|ございません|しない|しません|していない|していません))$|^(?:まだ)?(?:決めて(?:い)?(?:ない|ません)|決まって(?:い)?(?:ない|ません)|未定|未決定|検討中|これから(?:決める|決めます|考える|考えます))$|^(?:どこ|どの国|いずれの国|どちら)(?:でも|も)(?:いい|よい|良い|大丈夫|可|ok|構わない|かまわない|構いません|かまいません)?$|^(?:ai(?:商社マン)?に|アプリに)?(?:おまかせ|お任せ|任せ|まかせ)(?:します|る|ます|したい|で)?$|^(?:全世界|世界中|世界各国|全部の国|すべての国|全ての国|全部|すべて|全て|海外全般|海外ならどこでも)$/;
  function noneOf(raw) {
    try {
      if (Array.isArray(raw)) return raw.length > 0 && raw.every((x) => noneOf(x));
      let s = String(raw == null ? "" : raw).normalize("NFKC").toLowerCase().trim();
      if (!s || s.length > 60) return false;
      s = s.replace(/^(?:進出希望国|希望国|進出先|輸出先|販売先(?:国)?|target(?:\s+(?:markets?|countries?))?|countries?|国|目标(?:市场|国家)|países?(?:\s+objetivo)?)\s*(?:は|も|:|：|=)?\s*/, "");
      s = s.replace(/[。．.!！]+$/, "").trim();
      for (let i = 0; i < 3; i++) s = s.replace(/(?:です|でございます|でお願いします|でお願い|で大丈夫です|で大丈夫|でいいです|でいい|でok|で構いません|でかまいません|で|ね|よ|です。)$/, "").trim();
      s = s.replace(/[\s　「」『』"'（）()［］\[\]・、,，。.]/g, "");
      if (!s) return false;
      if (NONE_WORDS.has(s)) return true;
      return NONE_RE.test(s);
    } catch (e) { err("noneOf", e); return false; }
  }
  V99CTY.noneOf = noneOf;

  /* ════════════ No.549 ③ 答えの読み取り（どの経路も） ════════════ */
  // v54upldTargets：ヒアリング・資料の読み取り・確かめの窓で、答えを国に分ける（21.54 の層）
  if (typeof v54upldTargets === "function") {
    const __ut99 = v54upldTargets;
    v54upldTargets = function (raw) { // eslint-disable-line no-global-assign
      try { if (noneOf(raw)) { const r = []; r.bad = []; r.none = 1; V99CTY.n.none++; return r; } } catch (e) { err("utNone", e); }
      const r = __ut99.apply(this, arguments);
      try {
        if (Array.isArray(r)) {
          const c = cleanList(r);
          if (c.bad.length) {
            const r2 = c.out.slice();
            r2.bad = (Array.isArray(r.bad) ? r.bad : []).concat(c.bad);
            r2.v99bad = c.bad.slice();
            V99CTY.n.drop += c.bad.length;
            V99CTY.lastBad = { at: Date.now(), raw: String(raw == null ? "" : raw).slice(0, 80), bad: c.bad.slice(0, 6) };
            return r2;
          }
        }
      } catch (e) { err("ut", e); }
      return r;
    };
  }
  // 商品に「希望なし」の印をつける（国は登録しない）
  function markNone(t, raw) {
    if (!t) return;
    const c = cleanList(t.targets);
    t.targets = c.out.length ? c.out : [];
    t.targetsNone = { at: Date.now(), raw: String(raw == null ? "" : raw).slice(0, 40) };
  }
  V99CTY.markNone = markNone;
  // applyAnswer：ヒアリング・確かめの窓・AI の読み取り・修正の依頼で、進出希望国を登録する入口（いちばん外側で包む）
  if (typeof applyAnswer === "function") {
    const __aa99 = applyAnswer;
    applyAnswer = function (t, k, raw) { // eslint-disable-line no-global-assign
      if (k !== "targets" || !t) return __aa99.apply(this, arguments);
      try {
        if (noneOf(raw)) {
          markNone(t, raw);
          V99CTY.n.none++;
          try { if (curK() === "targets") skipTargets(); } catch (e) { /* 次へ */ }
          return true;
        }
      } catch (e) { err("aaNone", e); }
      const prev = Array.isArray(t.targets) ? t.targets.slice() : [];
      const ok = __aa99.apply(this, arguments);
      try {
        const L = Array.isArray(t.targets) ? t.targets : (t.targets ? String(t.targets).split(/[、,，・\/／]+/) : []);
        const c = cleanList(L);
        if (c.bad.length) {
          V99CTY.n.drop += c.bad.length;
          V99CTY.lastBad = { at: Date.now(), raw: String(Array.isArray(raw) ? raw.join("、") : (raw == null ? "" : raw)).slice(0, 80), bad: c.bad.slice(0, 6) };
          if (!c.out.length) { t.targets = cleanList(prev).out; return false; }
          t.targets = c.out;
        }
        if (Array.isArray(t.targets) && t.targets.length) delete t.targetsNone;
      } catch (e) { err("aa", e); }
      return ok;
    };
  }
  // ヒアリングの返事（画面の文）
  const MSG_NONE = () => M("承知しました。<b>進出希望国</b>は「希望なし（指定なし）」として受け取りました。国の名前としては登録していません。「販売先国の選定」で、AI商社マンが商品に合う国を候補から選びます（あとで国を足すこともできます）。",
    "Understood. <b>Target countries</b>: noted as “no preference (not specified)”. Nothing was registered as a country name. In “Target market selection”, the AI trading expert picks countries that suit the product (you can add countries later).",
    "明白了。<b>目标国家</b>已记录为“无指定（不限）”，没有作为国家名称登记。在“销售目标国选定”中，AI 商社顾问会从候选中挑选适合该商品的国家（之后也可以添加国家）。",
    "Entendido. <b>Países objetivo</b>: registrado como «sin preferencia (sin especificar)». No se registró como nombre de país. En «Selección de países objetivo», el experto IA elegirá los países adecuados para el producto (puede añadir países después).");
  const MSG_BAD = (bad) => M("「" + bad.join("・") + "」は、国の名前として見つかりませんでした（アプリの国の一覧にありません）。国の名前で答えてください（例：香港・台湾・シンガポール）。希望が無ければ「指定なし」で大丈夫です。",
    "“" + bad.join(", ") + "” was not found as a country name (not in the app's country list). Please answer with country names (e.g. Hong Kong, Taiwan, Singapore). If you have no preference, “not specified” is fine.",
    "“" + bad.join("、") + "”不是可识别的国家名称（不在应用的国家列表中）。请用国家名称回答（例：香港・台湾・新加坡）。如果没有指定，回答“无指定”即可。",
    "«" + bad.join(", ") + "» no se encontró como nombre de país (no está en la lista de países de la app). Responda con nombres de países (p. ej., Hong Kong, Taiwán, Singapur). Si no tiene preferencia, «sin especificar» está bien.");
  const MSG_DROP = (bad, ok) => M("「" + bad.join("・") + "」は国の一覧に無いため、進出希望国から外しました（登録した国：" + ok.join("・") + "）。",
    "“" + bad.join(", ") + "” is not in the country list, so it was left out (registered: " + ok.join(", ") + ").",
    "“" + bad.join("、") + "”不在国家列表中，已从目标国家中去除（已登记：" + ok.join("、") + "）。",
    "«" + bad.join(", ") + "» no está en la lista de países, así que se omitió (registrados: " + ok.join(", ") + ").");
  function sayAi(html) { try { if (typeof fillSay === "function") fillSay("ai", '<span data-noi18n="1" class="v99cty-say">' + html + "</span>"); } catch (e) { err("say", e); } }
  function persist() { try { if (typeof syncTenant === "function") syncTenant(); } catch (e) { /* 次の保存で */ } try { if (typeof saveTen === "function") saveTen(); } catch (e) { /* 次の保存で */ } }
  function skipTargets() { try { if (typeof FILL !== "undefined" && FILL) { FILL.skip = Array.isArray(FILL.skip) ? FILL.skip : []; if (FILL.skip.indexOf("targets") < 0) FILL.skip.push("targets"); } } catch (e) { /* 次へ */ } }
  // ヒアリングで「希望なし」と答えた
  function hearNone(vs) {
    const t = ten();
    try { if (typeof fillSay === "function") fillSay("u", E(vs)); } catch (e) { /* 次へ */ }
    markNone(t, vs);
    V99CTY.n.none++;
    skipTargets();
    try { if (FILL && FILL.cur && FILL.cur.k === "targets") FILL.cur = null; } catch (e) { /* 次へ */ }
    sayAi(MSG_NONE());
    persist();
    try { if (typeof logU === "function") logU("fill", "進出希望国：希望なし"); } catch (e) { /* 記録だけ */ }
    try { fillNext(); } catch (e) { err("next", e); try { if (typeof render === "function") render(); } catch (x) { /* 次の描き直しで */ } }
  }
  const curK = () => { try { return (typeof FILL !== "undefined" && FILL && FILL.cur && !FILL.cur.x) ? String(FILL.cur.k || "") : ""; } catch (e) { return ""; } };
  if (typeof fillAnswer === "function") {
    const __fa99 = fillAnswer;
    fillAnswer = function (v) { // eslint-disable-line no-global-assign
      try {
        const vs = String(v == null ? "" : v).trim();
        if (vs && curK() === "targets" && vs.length <= 60) {
          if (noneOf(vs)) return hearNone(vs);
          // 国の名前が1つも無く、国の一覧に無い語だけのとき：登録せずに聞き直す（地域の名前は 21.54 の層が案内する）
          if (typeof v54upldTargets === "function" && !/[?？]/.test(vs)) {
            const L = v54upldTargets(vs);
            const bad = (L && L.v99bad) || [];
            if (L && !L.length && bad.length && !(L.bad || []).some((b) => { try { return typeof V54U_REGION !== "undefined" && V54U_REGION.test(String(b).replace(/^[ぁ-ん]+|[ぁ-ん]+$/g, "").trim()); } catch (e) { return false; } })) {
              try { if (typeof fillSay === "function") fillSay("u", E(vs)); } catch (e) { /* 次へ */ }
              sayAi(E(MSG_BAD(bad.slice(0, 4))));
              V99CTY.n.bad = (V99CTY.n.bad || 0) + 1;
              try { if (typeof render === "function") render(); } catch (e) { /* 次の描き直しで */ }
              return;
            }
          }
        }
      } catch (e) { err("fa", e); }
      const k0 = curK(), n0 = (typeof FILL !== "undefined" && FILL && FILL.log) ? FILL.log.length : 0;
      V99CTY.lastBad = null;
      const r = __fa99.apply(this, arguments);
      try {
        const lb = V99CTY.lastBad, t = ten();
        if (k0 === "targets" && lb && lb.bad && lb.bad.length && t && Array.isArray(t.targets) && t.targets.length) sayAi(E(MSG_DROP(lb.bad.slice(0, 4), t.targets.slice(0, 6))));
        if (k0 === "targets" && n0 >= 0) V99CTY.lastBad = null;
      } catch (e) { err("fa2", e); }
      return r;
    };
  }
  // AI の聞き取り（triage）が「指定なし」を値として返したときも同じに
  if (typeof fillCommit === "function") {
    const __fc99 = fillCommit;
    fillCommit = function (v) { // eslint-disable-line no-global-assign
      try {
        if (curK() === "targets" && noneOf(v)) {
          const t = ten();
          markNone(t, v); V99CTY.n.none++; skipTargets();
          try { if (FILL && FILL.cur && FILL.cur.k === "targets") FILL.cur = null; } catch (e) { /* 次へ */ }
          sayAi(MSG_NONE()); persist();
          try { fillNext(); } catch (e) { err("next2", e); }
          return;
        }
      } catch (e) { err("fc", e); }
      return __fc99.apply(this, arguments);
    };
  }
  // 「あとで」にした項目の聞き直し（2回目）でも、「希望なし」と答えた進出希望国は聞き直さない
  if (typeof v54hearAsk === "function") {
    const __ha99 = v54hearAsk;
    v54hearAsk = function (cu) { // eslint-disable-line no-global-assign
      try {
        const t = ten();
        if (cu && cu.k === "targets" && t && t.targetsNone && !(Array.isArray(t.targets) && t.targets.length)) {
          skipTargets(); V99CTY.n.ask++;
          return fillNext();
        }
      } catch (e) { err("ask", e); }
      return __ha99.apply(this, arguments);
    };
  }

  // 2回目の聞き直しの前置き（「あとで」にした N 項目（…進出希望国…）を、もう一度だけ伺います）から、希望なしと答えた進出希望国を外す
  if (typeof fillSay === "function") {
    const __fs99 = fillSay;
    fillSay = function (who, html) { // eslint-disable-line no-global-assign
      try {
        const t = ten();
        if (who === "ai" && typeof html === "string" && t && t.targetsNone && !(Array.isArray(t.targets) && t.targets.length) && /ほかの質問は、これで終わりです/.test(html) && /進出希望国/.test(html)) {
          const m = html.match(/<b>(\d+)項目<\/b>（([^）]*)）/);
          if (m) {
            const L = m[2].split("・").filter((x) => x && x !== "進出希望国");
            if (!L.length) return; // 聞き直すのが進出希望国だけなら、前置きごと出さない
            const a = [].slice.call(arguments);
            a[1] = html.replace(m[0], "<b>" + L.length + "項目</b>（" + L.join("・") + "）");
            return __fs99.apply(this, a);
          }
        }
      } catch (e) { err("say2", e); }
      return __fs99.apply(this, arguments);
    };
  }

  /* ════════════ No.549 ④ 候補国・AI への依頼・保存された分析 ════════════ */
  if (typeof ctyAutoCands === "function") {
    const __ac99 = ctyAutoCands;
    ctyAutoCands = function () { // eslint-disable-line no-global-assign
      const L = __ac99.apply(this, arguments);
      try { if (Array.isArray(L)) { const c = cleanList(L); if (c.bad.length) { V99CTY.n.cand += c.bad.length; return c.out; } } } catch (e) { err("auto", e); }
      return L;
    };
  }
  if (typeof ctyAddCand === "function") {
    const __add99 = ctyAddCand;
    ctyAddCand = function (name) { // eslint-disable-line no-global-assign
      try {
        if (String(name == null ? "" : name).trim() && !isCty(name)) {
          try { if (typeof toast === "function") toast(M("「" + String(name).slice(0, 20) + "」は国の一覧に無いため、候補に入れられません", "“" + String(name).slice(0, 20) + "” is not in the country list, so it cannot be a candidate", "“" + String(name).slice(0, 20) + "”不在国家列表中，不能加入候选", "«" + String(name).slice(0, 20) + "» no está en la lista de países y no puede ser candidato")); } catch (e) { /* 次へ */ }
          V99CTY.n.cand++;
          return;
        }
      } catch (e) { err("add", e); }
      return __add99.apply(this, arguments);
    };
  }
  if (typeof ctyAnalyzeLocal === "function") {
    const __al99 = ctyAnalyzeLocal;
    ctyAnalyzeLocal = function (cands) { // eslint-disable-line no-global-assign
      try { if (Array.isArray(cands)) { const c = cleanList(cands); if (c.bad.length) { V99CTY.n.cand += c.bad.length; cands = c.out; try { const s = store(); if (s && Array.isArray(s.cands)) s.cands = cleanList(s.cands).out; } catch (x) { /* 次へ */ } } } } catch (e) { err("al", e); }
      return __al99.call(this, cands);
    };
  }
  if (typeof ctyAnalyzeAI === "function") {
    const __aai99 = ctyAnalyzeAI;
    ctyAnalyzeAI = async function (rec) { // eslint-disable-line no-global-assign
      try { if (Array.isArray(rec) && rec.some((r) => r && !isCty(r.c))) { rec = rec.filter((r) => r && isCty(r.c)); V99CTY.n.cand++; } } catch (e) { err("aai", e); }
      const args = [rec].concat([].slice.call(arguments, 1));
      return __aai99.apply(this, args);
    };
  }
  // 保存された分析から、一覧に無い国を外す（候補・推奨・確定・点数・AI の答え・進出希望国の控え・前回からの記録）
  const SIG = (typeof WeakMap === "function") ? new WeakMap() : null;
  function cleanSnap(sn) {
    if (!sn || typeof sn !== "object") return 0;
    let n = 0;
    ["cands", "tg", "top", "loc"].forEach((k) => { if (Array.isArray(sn[k])) { const c = cleanList(sn[k]); if (c.bad.length) { sn[k] = c.out; n += c.bad.length; } } });
    if (sn.per && typeof sn.per === "object") Object.keys(sn.per).forEach((c) => { if (!isCty(c)) { delete sn.per[c]; n++; } });
    if (sn.v98kept && typeof sn.v98kept === "object") ["ai", "prev"].forEach((k) => { if (Array.isArray(sn.v98kept[k])) { const c = cleanList(sn.v98kept[k]); if (c.bad.length) { sn.v98kept[k] = c.out; n += c.bad.length; } } });
    return n;
  }
  function cleanStore(s) {
    if (!s || typeof s !== "object") return 0;
    let n = 0;
    ["cands", "top", "chosen", "v92hope", "v92pick", "v92top", "prevTargets"].forEach((k) => { if (Array.isArray(s[k])) { const c = cleanList(s[k]); if (c.bad.length) { s[k] = c.out; n += c.bad.length; } } });
    if (Array.isArray(s.rec) && s.rec.some((r) => r && !isCty(r.c))) {
      const before = s.rec.length;
      s.rec = s.rec.filter((r) => r && isCty(r.c));
      s.rec.slice().sort((a, b) => ((a.rank || 99) - (b.rank || 99))).forEach((r, i) => { r.rank = i + 1; });
      n += before - s.rec.length;
    }
    if (s.ai && typeof s.ai === "object") {
      if (Array.isArray(s.ai.top3)) { const c = cleanList(s.ai.top3); if (c.bad.length) { s.ai.top3 = c.out; n += c.bad.length; } }
      if (s.ai.per && typeof s.ai.per === "object") Object.keys(s.ai.per).forEach((c) => { if (!isCty(c)) { delete s.ai.per[c]; n++; } });
      if (s.ai.v98kept) n += cleanSnap({ v98kept: s.ai.v98kept });
    }
    if (Array.isArray(s.v97h)) s.v97h.forEach((sn) => { n += cleanSnap(sn); });
    // 推奨が欠けたら、点の順で埋める（架空の国を外したあと）
    try {
      if (n && Array.isArray(s.top) && s.top.length < 3 && Array.isArray(s.rec) && s.rec.length) {
        const ord = s.rec.slice().sort((a, b) => ((a.rank || 99) - (b.rank || 99)));
        ord.forEach((r) => { if (s.top.length < 3 && s.top.indexOf(r.c) < 0) s.top.push(r.c); });
      }
    } catch (e) { /* 次へ */ }
    return n;
  }
  V99CTY.cleanStore = cleanStore;
  function sigOfStore(s) {
    try {
      const parts = [];
      ["cands", "top", "chosen", "v92hope", "v92pick", "prevTargets"].forEach((k) => { if (Array.isArray(s[k])) parts.push(s[k].join(",")); });
      if (Array.isArray(s.rec)) parts.push(s.rec.map((r) => r && r.c).join(","));
      if (s.ai && Array.isArray(s.ai.top3)) parts.push(s.ai.top3.join(","));
      if (Array.isArray(s.v97h)) parts.push(s.v97h.length + ":" + s.v97h.map((x) => x && x.at).join(","));
      return parts.join("|");
    } catch (e) { return String(Math.random()); }
  }
  if (typeof ctyStore === "function") {
    const __cs99 = ctyStore;
    let IN = 0;
    ctyStore = function () { // eslint-disable-line no-global-assign
      const s = __cs99.apply(this, arguments);
      if (IN) return s;
      IN = 1;
      try {
        if (s && typeof s === "object") {
          const sg = sigOfStore(s);
          if (!SIG || SIG.get(s) !== sg) {
            const n = cleanStore(s);
            if (n) { V99CTY.n.store += n; try { const t = ten(); if (t) cleanTen(t); } catch (x) { /* 次へ */ } }
            if (SIG) SIG.set(s, sigOfStore(s));
          }
        }
      } catch (e) { err("store", e); } finally { IN = 0; }
      return s;
    };
  }
  // 商品の進出希望国（保存された分も）
  function cleanTen(t) {
    if (!t || typeof t !== "object") return 0;
    let n = 0;
    try {
      if (t.targets != null && !Array.isArray(t.targets)) t.targets = String(t.targets).split(/[、,，・\/／]+/).map((x) => x.trim()).filter(Boolean);
      if (Array.isArray(t.targets) && t.targets.length) {
        const c = cleanList(t.targets);
        if (c.bad.length) {
          t.targets = c.out; n += c.bad.length;
          if (!c.out.length && c.bad.some((b) => noneOf(b) || /指定|希望|未定|なし/.test(b))) t.targetsNone = t.targetsNone || { at: Date.now(), raw: c.bad.join("・").slice(0, 40), fix: 1 };
        }
      }
      if (t.ctySel && typeof t.ctySel === "object") { const sg = sigOfStore(t.ctySel); if (!SIG || SIG.get(t.ctySel) !== sg) { n += cleanStore(t.ctySel); if (SIG) SIG.set(t.ctySel, sigOfStore(t.ctySel)); } }
    } catch (e) { err("ten", e); }
    if (n) V99CTY.n.ten += n;
    return n;
  }
  V99CTY.cleanTen = cleanTen;
  if (typeof tenantToD === "function") {
    const __td99 = tenantToD;
    tenantToD = function (t) { // eslint-disable-line no-global-assign
      try { if (t && typeof t === "object") cleanTen(t); } catch (e) { err("td", e); }
      return __td99.apply(this, arguments);
    };
  }
  if (typeof switchTen === "function") {
    const __sw99 = switchTen;
    switchTen = function () { // eslint-disable-line no-global-assign
      try { const i = +arguments[0]; if (typeof TENS !== "undefined" && Array.isArray(TENS) && TENS[i]) cleanTen(TENS[i]); } catch (e) { err("sw", e); }
      return __sw99.apply(this, arguments);
    };
  }
  // 確定（21.92 の確かめの窓は TEN.targets から「商品の登録で選んだ進出希望国」を作る）の前にも
  if (typeof ctyConfirm === "function") {
    const __cc99 = ctyConfirm;
    ctyConfirm = function () { // eslint-disable-line no-global-assign
      try { const t = ten(); if (t) cleanTen(t); const s = store(); if (s) cleanStore(s); } catch (e) { err("confirm", e); }
      return __cc99.apply(this, arguments);
    };
  }

  /* ════════════ No.517 前回からの点の動き（国ごと）・同じ点の理由・競合の未評価の理由 ════════════ */
  const AXK = [["mk", "mkt", "市場性", "Market", "市场性", "Mercado"], ["rg", "reg", "規制", "Regulation", "法规", "Regulación"], ["cp", "comp", "競合", "Competition", "竞争", "Competencia"], ["bs", "base", "STANDAGE拠点", "STANDAGE base", "STANDAGE据点", "Base STANDAGE"]];
  const axNm = (a) => M(a[2], a[3], a[4], a[5]);
  const verOf = () => { try { return String((typeof BC20_VER !== "undefined" && BC20_VER) || "21.99"); } catch (e) { return "21.99"; } };
  // 21.97 の記録に、作った版を残す（前回が前の版の分析か分かるように）
  try {
    const v = W.V97CTY;
    if (v && typeof v.snapOf === "function" && !v.snapOf._v99) {
      const __sn = v.snapOf;
      v.snapOf = function () { const o = __sn.apply(this, arguments); try { if (o && typeof o === "object") o.v99ver = verOf(); } catch (e) { /* 次へ */ } return o; };
      v.snapOf._v99 = 1;
    }
  } catch (e) { err("snapOf", e); }
  // 点の決め方を直した版（前回の分析が前の版なら、その分も動きうる）
  const VER_NOTES = [
    ["21.96", "商品の HS・単価・保存条件と、この国で要る手続きを点に入れました", "Product HS, unit price, storage and required procedures added to the score"],
    ["21.97", "価格の比較を、画面ごとの値ではなく商品の価格表から決めるようにしました", "Price comparison now uses the product price list"],
    ["21.98", "保証期間・使用期限を賞味期限として読まないようにしました（期限の欄が無い商材では点に使いません）。関税なしの判定に、ひな形の品目を入れました", "Warranty/use-by periods are no longer read as shelf life; duty-free judgement uses the template item"],
    ["21.99", "国の一覧に無い名前（「指定」など）を候補国から外しました。HS 3808.94・8482.10・6307.90・8708.30・9503.00・2309.10 の通関統計の国別の数字（UN Comtrade・2026-11-19 取得）を足し、競合を点にしました", "Names not in the country list are removed; per-country customs figures (UN Comtrade, fetched 2026-11-19) added for 6 HS codes so competition is now scored"],
  ];
  V99CTY.VER_NOTES = VER_NOTES;
  const verNum = (v) => { const m = String(v || "").match(/(\d+)\.(\d+)/); return m ? (+m[1]) * 1000 + (+m[2]) : 0; };
  function snapVer(sn) {
    if (!sn) return "";
    if (sn.v99ver) return String(sn.v99ver);
    // 21.97・21.98 の記録は v:"21.97" のまま。21.98 の期限の読み方（shelfK）が入っていれば 21.98
    if (sn.inp && sn.inp.shelfK != null) return "21.98";
    return String(sn.v || "21.97");
  }
  V99CTY.snapVer = snapVer;
  function lastTwo(s) {
    s = s || store();
    const h = s && Array.isArray(s.v97h) ? s.v97h : [];
    if (h.length < 2) return null;
    return { a: h[h.length - 2], b: h[h.length - 1] };
  }
  // 国ごとの点の動き：総合・4つの観点の何点・内訳の何の行（入力・データ）が動いたか
  function chgOf(c, s) {
    try {
      s = s || store();
      const L2 = lastTwo(s);
      if (!L2) return null;
      const { a, b } = L2;
      const x = a.per && a.per[c], y = b.per && b.per[c];
      const out = { c, from: x ? x.t : null, to: y ? y.t : null, d: (x && y && x.t != null && y.t != null) ? y.t - x.t : null, ax: [], parts: [], facts: [], inp: [], ver: null, src: (a && a.v98src) || null, at: String(a.t || ""), newC: !x && !!y, goneC: !!x && !y };
      if (!x || !y) return out;
      AXK.forEach((k) => { const p = x[k[0]], q = y[k[0]]; if (p !== q) out.ax.push({ k: k[1], nm: axNm(k), from: p == null ? null : p, to: q == null ? null : q, d: (p != null && q != null) ? q - p : null }); });
      // 内訳の行（21.96 の P）
      const ks = [];
      Object.keys(x.P || {}).concat(Object.keys(y.P || {})).forEach((k) => { if (ks.indexOf(k) < 0) ks.push(k); });
      const lab = (k) => (PART_JA[k] ? M(PART_JA[k][0], PART_JA[k][1]) : k);
      ks.forEach((k) => {
        const p = x.P && x.P[k], q = y.P && y.P[k];
        if (JSON.stringify(p || null) === JSON.stringify(q || null)) return;
        out.parts.push({ k, nm: lab(k), from: p && p.p != null ? p.p : null, to: q && q.p != null ? q.p : null, kind: PART_KIND[k] || "data" });
      });
      // 事実（データ）の違い
      const fa = x.f || {}, fb = y.f || {};
      if (fa.d !== fb.d) out.facts.push({ k: "duty", t: M("関税の判定 " + (fa.d || "—") + " → " + (fb.d || "—"), "Duty " + (fa.d || "—") + " → " + (fb.d || "—"), "关税判定 " + (fa.d || "—") + " → " + (fb.d || "—"), "Arancel " + (fa.d || "—") + " → " + (fb.d || "—")) });
      if (fa.x !== fb.x) out.facts.push({ k: "stat", t: M("通関統計（日本からの輸出）の数字が変わりました", "Customs statistics figure changed", "海关统计（日本出口）数字有变化", "Cambió la cifra de estadísticas aduaneras") });
      if (fa.b !== fb.b) out.facts.push({ k: "buy", t: M("STANDAGE が商談したバイヤー " + fa.b + "社 → " + fb.b + "社", "Buyers " + fa.b + " → " + fb.b, "STANDAGE 洽谈过的买家 " + fa.b + " → " + fb.b, "Compradores " + fa.b + " → " + fb.b) });
      if (fa.kb !== fb.kb) out.facts.push({ k: "kb", t: fb.kb ? M("規制の AI 詳細調査をこの国に反映しました", "AI regulation research applied", "已反映 AI 法规详细调查", "Se aplicó la investigación IA") : M("規制の AI 詳細調査の反映を外しました", "AI research no longer applied", "已取消反映 AI 详细调查", "Se quitó la investigación IA") });
      if (fa.bk !== fb.bk) out.facts.push({ k: "base", t: M("STANDAGE 拠点の状況が変わりました", "STANDAGE base status changed", "STANDAGE 据点状况有变化", "Cambió la base STANDAGE") });
      // 入力の違い（商品）
      const ia = a.inp || {}, ib = b.inp || {};
      const INP = { hs: ["HS", "HS"], cat: ["カテゴリー", "category"], usd: ["単価（US$）", "unit price (US$)"], shelf: ["期限（か月）", "expiry (months)"], store: ["保存", "storage"], mode: ["輸送", "transport"] };
      Object.keys(INP).forEach((k) => { const p = ia[k] == null ? "" : String(ia[k]), q = ib[k] == null ? "" : String(ib[k]); if (p !== q) out.inp.push({ k, t: M(INP[k][0], INP[k][1]) + " " + (p || "—") + " → " + (q || "—") }); });
      // 版の違い
      const va = snapVer(a), vb = snapVer(b) || verOf();
      if (va && vb && verNum(va) < verNum(vb)) {
        const notes = VER_NOTES.filter((n) => verNum(n[0]) > verNum(va) && verNum(n[0]) <= verNum(vb)).map((n) => n[0] + "：" + M(n[1], n[2]));
        out.ver = { from: va, to: vb, notes };
      }
      return out;
    } catch (e) { err("chgOf", e); return null; }
  }
  V99CTY.chgOf = chgOf;
  const PART_JA = { tpl: ["規制のひな形（あり）", "regulation template"], notpl: ["規制のひな形なし", "no regulation template"], duty0: ["関税0%", "0% duty"], dutyLo: ["関税が低い", "low duty"], dutyHi: ["関税が高い", "high duty"], warn: ["規制の注意", "regulation warning"], docs: ["必要書類の数", "number of documents"], kb: ["AI 詳細調査の反映", "AI research applied"], dtReq: ["この国で必須の手続き", "required procedure"], dtCon: ["条件つきの手続き", "conditional procedure"], dfree: ["HS から関税なし", "duty-free by HS"], ban: ["輸入を止める決まり", "import ban"], exp: ["日本からの輸出（通関統計）", "exports from Japan (customs stats)"], noPart: ["相手国別の統計なし", "no per-country stats"], noStat: ["統計なし", "no stats"], yoy: ["前年比", "year on year"], buy: ["商談したバイヤー数", "buyers"], frt: ["単価×運賃", "unit price × freight"], shelf: ["期限×海上の日数", "expiry × sea days"], cold: ["冷蔵・冷凍×日数", "chilled/frozen × days"], share: ["日本勢のシェア", "Japan's share"], grow: ["輸出の伸び", "export growth"], price: ["価格の比較", "price comparison"], base: ["STANDAGE拠点", "STANDAGE base"], fcOff: ["食品接触の判定", "food contact"] };
  const PART_KIND = { tpl: "reg", notpl: "reg", duty0: "reg", dutyLo: "reg", dutyHi: "reg", warn: "reg", docs: "reg", kb: "reg", dtReq: "reg", dtCon: "reg", dfree: "reg", ban: "reg", fcOff: "reg", exp: "stat", noPart: "stat", noStat: "stat", yoy: "stat", share: "stat", grow: "stat", buy: "buy", frt: "price", price: "price", shelf: "inp", cold: "inp", base: "base" };
  V99CTY.PART_JA = PART_JA;
  // 何の入力・データで動いたか（短い言葉）
  function causeOf(ch) {
    if (!ch) return [];
    const C = [];
    const push = (t) => { if (C.indexOf(t) < 0) C.push(t); };
    try {
      const cpAx = ch.ax.find((a) => a.k === "comp");
      const statMoved = ch.parts.some((p) => (p.k === "noPart" || p.k === "noStat" || p.k === "exp" || p.k === "share") && p.from !== p.to);
      const t0 = ten();
      if ((cpAx && cpAx.from == null && cpAx.to != null || statMoved) && t0 && V99CTY.ctAdded(t0.hs)) {
        push(M("通関統計の国別の数字（UN Comtrade・2026-11-19 取得）を足したため、競合の点が付きました" + (cpAx && cpAx.from == null && cpAx.to != null ? "（未評価 → " + cpAx.to + "点）" : "") + "。市場性も、この国への日本からの輸出の数字で計算し直しています",
          "Per-country customs figures (UN Comtrade, fetched 2026-11-19) were added, so competition is now scored" + (cpAx && cpAx.from == null && cpAx.to != null ? " (n/a → " + cpAx.to + ")" : "") + "; market is recalculated from exports to this country",
          "已补充海关统计的国别数字（UN Comtrade・2026-11-19 获取），竞争开始计分" + (cpAx && cpAx.from == null && cpAx.to != null ? "（未评价 → " + cpAx.to + "分）" : "") + "。市场性也按对该国的日本出口重新计算",
          "Se añadieron cifras por país (UN Comtrade, 2026-11-19); la competencia ya se puntúa" + (cpAx && cpAx.from == null && cpAx.to != null ? " (n/d → " + cpAx.to + ")" : "") + "; el mercado se recalcula con las exportaciones a este país"));
      }
    } catch (e) { err("causeCt", e); }
    ch.inp.forEach((x) => push(M("入力：", "input: ", "输入：", "entrada: ") + x.t));
    ch.parts.forEach((p) => {
      const kind = p.kind === "reg" ? M("規制の判定", "regulation", "法规判定", "regulación") : p.kind === "stat" ? M("通関統計", "customs stats", "海关统计", "estadísticas") : p.kind === "price" ? M("価格", "price", "价格", "precio") : p.kind === "buy" ? M("バイヤーのデータ", "buyer data", "买家数据", "compradores") : p.kind === "inp" ? M("商品の入力（期限・保存）", "product input (expiry/storage)", "商品输入（期限・保存）", "entrada (caducidad)") : M("拠点", "base", "据点", "base");
      push(kind + "：" + p.nm + " " + (p.from == null ? "—" : p.from) + " → " + (p.to == null ? "—" : p.to));
    });
    ch.facts.forEach((f) => push(f.t));
    if (ch.ver && ch.ver.notes.length) push(M("アプリの版 " + ch.ver.from + " → " + ch.ver.to + " で点の決め方を直した分（" + ch.ver.notes.join("／") + "）", "App version " + ch.ver.from + " → " + ch.ver.to + " changed how scores are made (" + ch.ver.notes.join("; ") + ")", "应用版本 " + ch.ver.from + " → " + ch.ver.to + " 调整了评分方法（" + ch.ver.notes.join("／") + "）", "La versión " + ch.ver.from + " → " + ch.ver.to + " cambió el cálculo (" + ch.ver.notes.join("; ") + ")"));
    if (!C.length && ch.d) push(M("ほかの候補国の点の基準が変わったため（市場性・バイヤー数は候補の中のいちばん大きい国を基準にした割合）", "The reference among candidates changed (market and buyers are relative to the largest candidate)", "其他候选国的基准变化（市场性・买家数按候选中最大者的比例）", "Cambió la referencia entre candidatos"));
    return C;
  }
  V99CTY.causeOf = causeOf;

  // 同じ国の点が、別の商品の分析と同じになったとき：同じになった理由
  function lastPerOf(t) {
    try {
      const S = t && t.ctySel;
      if (!S) return null;
      const h = Array.isArray(S.v97h) ? S.v97h : [];
      const sn = h[h.length - 1];
      if (sn && sn.per) return { per: sn.per, inp: sn.inp || {}, at: sn.t || "" };
      if (Array.isArray(S.rec) && S.rec.length) { const per = {}; S.rec.forEach((r) => { if (r && r.sc) per[r.c] = { t: r.sc.total, rg: r.sc.reg, mk: r.sc.mkt, cp: r.sc.comp, bs: r.sc.base, f: { d: String((r.facts && r.facts.duty) || ""), x: Math.round((r.facts && r.facts.exportUsd) || 0) }, P: {} }; }); return { per, inp: {}, at: S.at || "" }; }
    } catch (e) { /* 次へ */ }
    return null;
  }
  function twinOf(c, t0) {
    try {
      t0 = t0 || ten();
      const s = (t0 && t0.ctySel) || store();
      if (!s || !Array.isArray(s.rec)) return [];
      const me = s.rec.find((r) => r && r.c === c);
      if (!me || !me.sc) return [];
      const mine = lastPerOf(t0) || { per: {} };
      const my = mine.per[c] || { t: me.sc.total, rg: me.sc.reg, mk: me.sc.mkt, cp: me.sc.comp, bs: me.sc.base, f: {} };
      const myInp = (me.v96 && me.v96.inp) || mine.inp || {};
      const out = [];
      (typeof TENS !== "undefined" && Array.isArray(TENS) ? TENS : []).forEach((t) => {
        if (!t || t === t0 || !t.ctySel) return;
        if (t0 && String(t.item || "").trim() && String(t.item || "").trim() === String(t0.item || "").trim()) return; // 同じ商品の登録し直しは「前回の分析」で比べる
        try { const v8 = W.V98CTY, h6 = digits(t.hs).slice(0, 6); if (t0 && v8 && typeof v8.nameSim === "function" && h6.length === 6 && h6 === digits(t0.hs).slice(0, 6) && v8.nameSim(t.item, t0.item) >= 0.5) return; } catch (e) { /* 次へ */ } // 同じ商材（HS が同じ・品名が似ている）も同じ
        const o = lastPerOf(t);
        const y = o && o.per && o.per[c];
        if (!y || y.t == null || y.t !== my.t) return;
        const r2 = (t.ctySel.rec || []).find((r) => r && r.c === c);
        const yInp = (r2 && r2.v96 && r2.v96.inp) || o.inp || {};
        const why = [];
        const sameAx = AXK.filter((k) => my[k[0]] === y[k[0]]).map(axNm);
        const diffAx = AXK.filter((k) => my[k[0]] !== y[k[0]]).map((k) => axNm(k) + " " + (my[k[0]] == null ? M("未評価", "n/a") : my[k[0]]) + "／" + (y[k[0]] == null ? M("未評価", "n/a") : y[k[0]]));
        if (sameAx.length === 4) why.push(M("4つの観点（市場性・規制・競合・拠点）の点が全部同じです", "All 4 aspects (market, regulation, competition, base) are the same", "4个观点（市场性・法规・竞争・据点）的分数全部相同", "Los 4 aspectos son iguales"));
        else if (diffAx.length) why.push(M("総合は同じですが、観点の点は違います（この商品／" + String(t.item || "").slice(0, 20) + "：" + diffAx.join("・") + "）", "Same total but different aspects (this / other: " + diffAx.join(", ") + ")", "总分相同但各观点不同（" + diffAx.join("・") + "）", "Mismo total, distintos aspectos (" + diffAx.join(", ") + ")"));
        const ckA = String(myInp.ck || myInp.cat || ""), ckB = String(yInp.ck || yInp.cat || "");
        if (my.rg === y.rg && ckA && ckA === ckB) why.push(M("規制：同じカテゴリー（" + (myInp.cat || ckA) + "）の規制のひな形で、この国の判定（関税・書類の数）が同じ", "Regulation: same category template (" + (myInp.cat || ckA) + ") gives the same duty and documents", "法规：同一类别（" + (myInp.cat || ckA) + "）的模板，该国的判定相同", "Regulación: misma plantilla de categoría (" + (myInp.cat || ckA) + ")"));
        else if (my.rg === y.rg) why.push(M("規制：この国の関税・書類の数の判定が同じ", "Regulation: same duty and documents for this country", "法规：该国关税・文件数判定相同", "Regulación: mismo arancel y documentos"));
        const hsA = digits(myInp.hs).slice(0, 2), hsB = digits(yInp.hs).slice(0, 2);
        const h6A = digits(myInp.hs).slice(0, 6), h6B = digits(yInp.hs).slice(0, 6);
        if (h6A.length === 6 && h6A === h6B) why.push(M("HS が同じ（" + h6A.slice(0, 4) + "." + h6A.slice(4) + "）なので、市場性・競合は通関統計の同じ数字から計算しています", "Same HS (" + h6A + "), so market and competition use the same customs figures", "HS 相同（" + h6A + "），市场性・竞争使用相同的海关统计数字", "Mismo HS (" + h6A + "): mercado y competencia usan las mismas cifras"));
        else if (hsA && hsA === hsB) why.push(M("HS が同じ類（" + hsA + "類）です", "HS in the same chapter (" + hsA + ")", "HS 属于同一类（" + hsA + "类）", "HS del mismo capítulo (" + hsA + ")"));
        if (my.mk === y.mk && my.cp === y.cp && (my.cp == null || (my.f && y.f && !my.f.x && !y.f.x))) why.push(M("市場性・競合：どちらの HS も、この国への日本からの輸出（通関統計の国別の数字）が無いため、同じ基準の扱い（市場性は基準の点・競合は未評価）です", "Market and competition: neither HS has per-country export figures in the customs stats, so both use the same baseline (market base points, competition not rated)", "市场性・竞争：两个 HS 都没有该国的日本出口（海关统计国别数字），因此按同一基准处理（市场性为基准分・竞争未评价）", "Mercado y competencia: ninguno tiene cifras por país; se usa la misma base"));
        if (my.bs === y.bs) why.push(M("拠点：同じ STANDAGE 拠点の点です（商品によらない）", "Base: same STANDAGE base points (not product-specific)", "据点：相同的 STANDAGE 据点分数（与商品无关）", "Base: mismos puntos (no depende del producto)"));
        const nm = String(t.item || "").slice(0, 40);
        if (out.some((o) => o.item === nm)) return; // 同じ名前の別の登録は1つに
        out.push({ item: nm, co: String(t.co || "").slice(0, 40), t: y.t, why });
      });
      return out.slice(0, 3);
    } catch (e) { err("twin", e); return []; }
  }
  V99CTY.twinOf = twinOf;

  // 競合が「未評価」の理由と、どうすれば評価できるか（通関統計の出どころを確かめて書く）
  function statMeta() {
    try {
      const m = (typeof CS_META !== "undefined" && CS_META) ? CS_META : null;
      const d = m && (m.fetched || m.lastModified) ? String(m.fetched || m.lastModified).slice(0, 10) : "";
      return { src: M("通関統計（UN Comtrade・日本の計数は財務省貿易統計）", "customs statistics (UN Comtrade; Japan's figures from the Ministry of Finance trade statistics)", "海关统计（UN Comtrade・日本数据来自财务省贸易统计）", "estadísticas aduaneras (UN Comtrade; Japón: estadísticas del Ministerio de Finanzas)"), date: d };
    } catch (e) { return { src: "", date: "" }; }
  }
  function compWhy(c, r) {
    try {
      const s = store();
      r = r || (s && Array.isArray(s.rec) ? s.rec.find((x) => x && x.c === c) : null);
      if (!r || !r.sc || r.sc.comp != null) return null;
      const t = ten() || {};
      const hs = digits((r.v96 && r.v96.inp && r.v96.inp.hs) || t.hs || (typeof D !== "undefined" && D && D.hs) || "").slice(0, 6);
      const hsTxt = hs.length >= 6 ? hs.slice(0, 4) + "." + hs.slice(4, 6) : hs;
      let S = null, F = null;
      try { S = typeof kbStats === "function" ? kbStats(hs || "", "X") : null; } catch (e) { S = null; }
      try { F = (typeof csFind === "function" && typeof csHs6 === "function" && hs) ? csFind(csHs6(hs)) : null; } catch (e) { F = null; }
      const meta = statMeta();
      const srcTxt = (typeof V99CTY.ctAdded === "function" && V99CTY.ctAdded(hs))
        ? M("通関統計（UN Comtrade の公開の数字・日本の計数は財務省貿易統計）・この HS の国別の数字は 2026-11-19 取得", "customs statistics (UN Comtrade public figures; Japan's figures from the Ministry of Finance); per-country figures for this HS fetched 2026-11-19", "海关统计（UN Comtrade 公开数字・日本数据来自财务省贸易统计）・该 HS 的国别数字于 2026-11-19 获取", "estadísticas (UN Comtrade; Japón: Ministerio de Finanzas); cifras por país obtenidas el 2026-11-19")
        : meta.src + (meta.date ? M("・アプリの写しの取得日 " + meta.date, "; app copy fetched " + meta.date, "・应用副本获取日 " + meta.date, "; copia del " + meta.date) : "");
      let why, k;
      if (!hs) { k = "nohs"; why = M("HS コードが登録されていないため、通関統計を引けません", "No HS code registered, so customs statistics cannot be looked up", "未登记 HS 编码，无法查询海关统计", "No hay código HS; no se pueden consultar las estadísticas"); }
      else if (!S || !S.hs || (F && F.exact === 0) || (S.hs && digits(S.hs).slice(0, 6) !== hs)) { k = "nostat"; why = M("この HS（" + hsTxt + "）の日本からの輸出の統計が、アプリのデータにありません" + (S && S.hs && digits(S.hs).slice(0, 6) !== hs ? "（近い番号 " + S.hs + " は別の品目のため使っていません）" : ""), "The app's data has no export statistics for this HS (" + hsTxt + ")" + (S && S.hs && digits(S.hs).slice(0, 6) !== hs ? " (the nearby code " + S.hs + " is a different item, so it is not used)" : ""), "应用数据中没有该 HS（" + hsTxt + "）的日本出口统计", "Los datos de la app no tienen estadísticas de exportación para este HS (" + hsTxt + ")"); }
      else if (!Array.isArray(S.partners) || !S.partners.length) { k = "nopart"; why = M("この HS（" + hsTxt + "）の日本からの輸出の合計はありますが、相手国ごとの内訳がアプリのデータにありません", "The app's data has the total exports for this HS (" + hsTxt + ") but no breakdown by destination country", "该 HS（" + hsTxt + "）有日本出口总额，但应用数据中没有按国家的明细", "Hay el total de exportaciones de este HS (" + hsTxt + "), pero no el desglose por país"); }
      else { k = "nocty"; why = M("この HS（" + hsTxt + "）の通関統計に、この国への日本からの輸出の記録がありません（0 と決めつけず、未評価にしています）", "The customs statistics for this HS (" + hsTxt + ") have no record of exports from Japan to this country (not assumed to be 0; left unrated)", "该 HS（" + hsTxt + "）的海关统计中没有日本对该国的出口记录（不视为 0，作为未评价）", "Las estadísticas de este HS (" + hsTxt + ") no registran exportaciones de Japón a este país (no se asume 0)"); }
      const how = k === "nohs"
        ? M("HS コードを登録すると、統計があれば評価します", "Register the HS code; it will be rated if statistics exist", "登记 HS 编码后，如有统计即可评价", "Registre el código HS; se evaluará si hay estadísticas")
        : M("競合（日本勢のシェア）は、国別の数字が無い限り点にしません（作った数字は使いません）。現地の競合は「規制を調べる」の AI 詳細調査や、STANDAGE の担当の現地調査で確かめられます。HS がまだ推定なら、6桁で確定すると統計のある品目に当たることがあります", "Competition (Japan's share) is not scored without per-country figures (no made-up numbers). Local competitors can be checked with the AI research in “Check regulations” or by STANDAGE staff. If the HS is only estimated, confirming the 6-digit code may hit an item with statistics", "没有国别数字时，竞争（日本份额）不计分（不使用编造的数字）。当地竞争可通过“调查法规”的 AI 详细调查或 STANDAGE 负责人的现地调查确认。若 HS 仍是推定，确定6位后可能对应有统计的品目", "Sin cifras por país, la competencia no se puntúa (no se inventan números). Puede investigar a la competencia local con la investigación IA o con el personal de STANDAGE. Si el HS es estimado, confirmar los 6 dígitos puede dar con un artículo con estadísticas");
      return { c, k, hs: hsTxt, why, how, src: srcTxt };
    } catch (e) { err("compWhy", e); return null; }
  }
  V99CTY.compWhy = compWhy;
  // 前回の分析：21.98 は「同じカテゴリー」の別の登録だけを前回にしていた。UAT の B・E は回ごとにカテゴリーを変えて登録し直す
  //（医療・衛生用品 → 日用雑貨）ので、前回が見つからず、44→61 の理由（カテゴリーが変わった）が出なかった。
  // → 同じカテゴリーで見つからないときは、カテゴリーが違っても HS（6桁）が同じで品名が似ている（または会社名が同じ）別の登録の分析を前回にする。
  function findPrevAnyCat(t) {
    try {
      const v = W.V98CTY;
      if (!v || typeof v.sigOf !== "function" || typeof v.nameSim !== "function") return null;
      const me = v.sigOf(t);
      if (!me || String(me.hs || "").length < 6) return null;
      let best = null;
      const consider = (src, h, where) => {
        if (!src || !Array.isArray(h) || !h.length) return;
        const sg = v.sigOf(src);
        if (!sg || (me.uid && sg.uid && me.uid === sg.uid)) return;
        if (String(sg.hs || "").slice(0, 6) !== String(me.hs).slice(0, 6)) return;
        const ns = v.nameSim(me.nm, sg.nm);
        const coSame = !!me.co && String(me.co).replace(/\s/g, "") === String(sg.co || "").replace(/\s/g, "");
        if (!(ns >= 0.5 || (coSame && ns >= 0.3))) return;
        const sn = h[h.length - 1];
        if (!sn || !sn.per) return;
        const at = +(sn.at || 0);
        if (!best || at > best.at) best = { at, snap: sn, src: { item: String(sg.nm || "").slice(0, 60), co: String(sg.co || "").slice(0, 60), uid: sg.uid, where, at, t: String(sn.t || ""), v99cat: sg.ck && me.ck && sg.ck !== me.ck ? 1 : 0 } };
      };
      (typeof TENS !== "undefined" && Array.isArray(TENS) ? TENS : []).forEach((x) => { if (x && x !== t && x.ctySel) consider(x, x.ctySel.v97h, "list"); });
      try { if (typeof v33TrashList === "function") v33TrashList().forEach((e) => { const x = e && e.data; const tt = x && (x.ctySel ? x : (x.t && x.t.ctySel ? x.t : (x.ten && x.ten.ctySel ? x.ten : null))); if (tt) consider(tt, tt.ctySel.v97h, "trash"); }); } catch (e) { /* 次へ */ }
      try {
        let c = ""; try { c = (typeof SES !== "undefined" && SES && SES.code) || ""; } catch (e) { c = ""; }
        const L = JSON.parse(localStorage.getItem("bc20_v98cty_" + String(c).replace(/[^\w-]/g, "").slice(0, 40)) || "[]");
        (Array.isArray(L) ? L : []).forEach((x) => { if (x && x.sig && x.snap) consider({ catKey: x.sig.ck, hs: x.sig.hs, item: x.sig.nm, co: x.sig.co, uid: x.sig.uid }, [x.snap], "device"); });
      } catch (e) { /* この端末の記録が無い */ }
      return best;
    } catch (e) { err("prevAny", e); return null; }
  }
  V99CTY.findPrevAnyCat = findPrevAnyCat;
  if (typeof ctyRun === "function") {
    const __cr99 = ctyRun;
    ctyRun = async function () { // eslint-disable-line no-global-assign
      try {
        const s = store(), t = ten();
        if (s && t && !W.__ctyBusy && !(Array.isArray(s.v97h) && s.v97h.length)) {
          // いちばん新しい「同じ商材の別の登録」の分析を前回にする（カテゴリーを変えて登録し直した分も含む）
          const same = (W.V98CTY && typeof W.V98CTY.findPrev === "function") ? W.V98CTY.findPrev(t) : null;
          const P = findPrevAnyCat(t);
          const atSame = same && same.snap ? +(same.snap.at || 0) : 0;
          if (P && (!same || P.at > atSame)) { s.v97h = [Object.assign({}, P.snap, { v98src: P.src })]; V99CTY.n.prevCat = (V99CTY.n.prevCat || 0) + 1; }
        }
      } catch (e) { err("seed", e); }
      return __cr99.apply(this, arguments);
    };
  }

  /* ════════════ 決め2（大森さん 11/19）：通関統計の国別の内訳を足す ════════════
     アプリの通関統計の写し（csData＝STANDAGE 通関統計エクスプローラーの RAW_DATA）は、UN Comtrade の数字を
     「報告国 日本（392）・輸出 X／輸入 M・相手国 18か国と世界（0）・2023〜2025年・金額 primaryValue（US$・整数に丸め）・数量 qty・正味重量 netWgt」で持つ
     （A 2103.90 の 2025年の世界・米国・香港・台湾の輸出が、UN Comtrade の preview の値と一致することを確かめた）。
     国別の内訳が無かった UAT の8カテゴリーの HS（3808.94・8482.10・6307.90・8708.30・9503.00・2309.10）の内訳を、同じ形・同じ数え方で足す。
     数字は 2026-11-19 に UN Comtrade の公開の preview API から取った値をそのまま使う（作らない）。日本の計数は財務省貿易統計を原データとする（UN Comtrade の説明）。
     年ごとの合計（annual）は今の写しのまま（2309.10 だけは写しに無いので、取った世界の行から作る）。今ある内訳（A・D など）は上書きしない。 */
  const CT_ADD = { fetched: "2026-11-19",
    url: "https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=392&period={2023|2024|2025}&cmdCode={HS6桁}&flowCode=X,M&partnerCode=0,36,156,251,276,344,356,360,392,410,458,490,702,704,710,764,784,826,842&partner2Code=0&customsCode=C00&motCode=0",
    meta: { "230910": { ja: "犬・猫用の飼料（小売用）", en: "Dog or cat food, put up for retail sale", cat: "食品", sub: "ペットフード" } },
    hs: {"380894":{"p":{"2023":[[0,"X",14827942,1905760,1905760],[36,"X",86327,3254,3254],[156,"X",3860102,542831,542831],[276,"X",147506,2544,2544],[344,"X",3609330,311855,311855],[360,"X",107285,13760,13760],[410,"X",2554079,189551,189551],[458,"X",155597,11718,11718],[490,"X",1674685,451791,451791],[702,"X",299893,69276,69276],[704,"X",487076,74613,74613],[764,"X",443019,23310,23310],[784,"X",11422,4000,4000],[826,"X",7522,60,60],[842,"X",185627,10538,10538],[0,"M",95119073,32212821,32212821],[36,"M",413140,31656,31656],[156,"M",47616832,25458098,25458098],[251,"M",195071,11168,11168],[276,"M",2560890,295722,295722],[410,"M",1140935,812256,812256],[458,"M",1261263,300775,300775],[490,"M",387254,88403,88403],[702,"M",83735,19754,19754],[704,"M",3575870,1388528,1388528],[764,"M",2075212,691906,691906],[826,"M",6436599,645402,645402],[842,"M",5130150,780344,780344]],"2024":[[0,"X",12658187,1704408,1704408],[36,"X",92445,4460,4460],[156,"X",3602796,515242,515242],[344,"X",1459717,220581,220581],[360,"X",189501,16870,16870],[410,"X",2134537,150310,150310],[458,"X",156983,15483,15483],[490,"X",1980176,485045,485045],[702,"X",330166,84247,84247],[704,"X",615586,39369,39369],[764,"X",648249,40766,40766],[784,"X",8390,360,360],[826,"X",79278,1500,1500],[842,"X",584172,23826,23826],[0,"M",92428858,35575272,35575272],[36,"M",166563,9917,9917],[156,"M",48496248,28334760,28334760],[251,"M",220511,12609,12609],[276,"M",3038463,614877,614877],[360,"M",15314,9648,9648],[410,"M",1143775,831109,831109],[458,"M",1541578,361132,361132],[490,"M",317006,62804,62804],[702,"M",101013,24848,24848],[704,"M",3045843,1246193,1246193],[764,"M",9300531,1216723,1216723],[826,"M",5528099,618235,618235],[842,"M",5829144,816440,816440]],"2025":[[0,"X",14128825,1708141,1708141],[36,"X",335708,20147,20147],[156,"X",3883043,475962,475962],[344,"X",1687431,265711,265711],[360,"X",162366,11306,11306],[410,"X",2244918,186580,186580],[458,"X",241091,24077,24077],[490,"X",2270902,401452,401452],[702,"X",191284,29479,29479],[704,"X",643484,111763,111763],[764,"X",670178,33718,33718],[842,"X",659974,17037,17037],[0,"M",102203305,44262240,44262240],[36,"M",127172,678,678],[156,"M",59901408,36719160,36719160],[251,"M",112729,4103,4103],[276,"M",3310695,717129,717129],[410,"M",1160507,742465,742465],[458,"M",1134520,245145,245145],[490,"M",306088,62478,62478],[702,"M",115295,35746,35746],[704,"M",3852464,1663616,1663616],[764,"M",3235300,1172421,1172421],[826,"M",7222126,691858,691858],[842,"M",6865126,823665,823665]]},"u":8},"848210":{"p":{"2023":[[0,"X",1561536886,639600749,93911620],[36,"X",7622904,1391487,513192],[156,"X",355735570,176373636,20970146],[251,"X",56868157,10455864,2556367],[276,"X",82254207,38273681,5019983],[344,"X",39113711,45606876,1560426],[360,"X",51313137,26798153,4485313],[410,"X",104664713,26280821,5863312],[458,"X",20179211,7462328,1504713],[490,"X",59900886,17012340,2936731],[702,"X",80747708,62294668,6599028],[704,"X",15731842,15494355,974488],[710,"X",3387955,463611,169250],[764,"X",89447795,52313949,6544771],[784,"X",43387590,16353192,4060844],[826,"X",11080724,3047374,208101],[842,"X",273144758,50893666,13912628],[0,"M",403324306,688833371,20568942],[36,"M",41544,99,391],[156,"M",120568357,195638264,9562124],[251,"M",8184114,1922314,649452],[276,"M",17726275,4397845,315758],[344,"M",33969,54399,285],[360,"M",28406546,74367550,818691],[410,"M",46382785,19593267,3935206],[458,"M",8229950,32140269,142805],[490,"M",17201031,12006969,1131852],[702,"M",8177249,41940116,323341],[704,"M",20394108,4138068,326943],[764,"M",53339823,280941749,2512588],[784,"M",3799,1,194],[826,"M",2720920,65215,10008],[842,"M",47738085,638668,168232]],"2024":[[0,"X",1434973224,639721665,84773993],[36,"X",6677933,1450665,467949],[156,"X",330517978,198567965,19149337],[251,"X",50279954,9985504,2223767],[276,"X",75220114,34256212,4177594],[344,"X",40483626,48050657,1728509],[360,"X",42998023,24661696,3988188],[410,"X",88651769,19208525,4955153],[458,"X",19646155,6774556,1563454],[490,"X",47302792,11447593,1973128],[702,"X",64960691,59473749,4977365],[704,"X",17035006,19208570,1050449],[710,"X",3136636,309051,184775],[764,"X",77350106,52146194,5652376],[784,"X",39449750,13960844,3633268],[826,"X",6728419,2485026,191865],[842,"X",270367168,47064571,13740944],[0,"M",389789536,671768989,19741640],[36,"M",5160,378,21],[156,"M",115156664,192558900,9435650],[251,"M",8601914,1704114,556055],[276,"M",19958490,3923213,343661],[344,"M",3799,56,8],[360,"M",32277817,79229620,871626],[410,"M",38990051,21145056,3178251],[458,"M",5619712,24908610,118976],[490,"M",16358977,12195944,1285831],[702,"M",8302237,42325760,349237],[704,"M",16868516,2041083,283864],[764,"M",48182644,273652600,2350922],[826,"M",3805602,38543,7678],[842,"M",51435766,919240,232893]],"2025":[[0,"X",1539268506,675017343,88976220],[36,"X",7705380,1531066,513229],[156,"X",399066004,242143492,22371221],[251,"X",49388632,8013556,2140333],[276,"X",76227351,25140793,4299280],[344,"X",35384552,40410787,1471763],[360,"X",44636658,23349783,4484726],[410,"X",76102890,18233270,3876677],[458,"X",21442603,7349168,1515400],[490,"X",49987808,9135140,1871186],[702,"X",75863658,60272869,5467640],[704,"X",20434807,20281449,1179095],[710,"X",3483880,299116,185449],[764,"X",76281648,56549439,5477186],[784,"X",39866661,13808997,3397393],[826,"X",6640475,1811011,205350],[842,"X",286736321,51905773,14294370],[0,"M",405371204,672094585,19542683],[36,"M",47651,63,529],[156,"M",115223467,196026100,9246309],[251,"M",8547643,1668930,536772],[276,"M",25907257,4285962,371740],[344,"M",8398,449,29],[360,"M",36027879,79663950,877433],[410,"M",35423244,19331660,2847279],[458,"M",5134711,23579090,90001],[490,"M",19323287,15515337,1393727],[702,"M",7668584,38679860,326210],[704,"M",15209639,2573728,240112],[764,"M",45842134,270698900,2814656],[826,"M",2856902,69489,12946],[842,"M",62885136,798501,183368]]},"u":5},"630790":{"p":{"2023":[[0,"X",81975738,3569885,3569885],[36,"X",571892,17826,17826],[156,"X",25565088,677809,677809],[251,"X",554727,38712,38712],[276,"X",640170,18024,18024],[344,"X",3387048,74403,74403],[360,"X",2948449,81387,81387],[410,"X",5107199,139507,139507],[458,"X",1824083,54734,54734],[490,"X",4014750,163937,163937],[702,"X",2319201,70969,70969],[704,"X",10706040,1445675,1445675],[710,"X",44104,1384,1384],[764,"X",4082827,129828,129828],[784,"X",155798,7164,7164],[826,"X",624339,9856,9856],[842,"X",8350164,108786,108786],[0,"M",1510049600,156451727,156451727],[36,"M",209575,4425,4425],[156,"M",1228053052,140360730,140360730],[251,"M",3491619,35949,35949],[276,"M",4350386,73356,73356],[344,"M",104485,1634,1634],[360,"M",20528547,1675403,1675403],[410,"M",29887116,1001764,1001764],[458,"M",2784950,226135,226135],[490,"M",32407986,1630494,1630494],[702,"M",9654184,202990,202990],[704,"M",93438249,7600919,7600919],[764,"M",12313322,439679,439679],[784,"M",198712,6039,6039],[826,"M",1396718,10043,10043],[842,"M",18639866,391708,391708]],"2024":[[0,"X",90683305,4000596,4000596],[36,"X",1132035,39616,39616],[156,"X",22089804,623047,623047],[251,"X",481745,31927,31927],[276,"X",841323,18267,18267],[344,"X",4297264,104745,104745],[360,"X",2426716,82403,82403],[410,"X",5010798,137351,137351],[458,"X",1967248,61700,61700],[490,"X",3570590,136285,136285],[702,"X",3246390,190294,190294],[704,"X",15290351,1488937,1488937],[710,"X",14911,255,255],[764,"X",4742145,134581,134581],[784,"X",446374,19646,19646],[826,"X",598898,7443,7443],[842,"X",9136293,124308,124308],[0,"M",1439868382,151332820,151332820],[36,"M",156911,2512,2512],[156,"M",1166795163,135680603,135680603],[251,"M",3665921,22961,22961],[276,"M",4422589,52651,52651],[344,"M",64869,1554,1554],[360,"M",20493669,1710211,1710211],[410,"M",32473178,941524,941524],[458,"M",3313075,271827,271827],[490,"M",25612965,1410785,1410785],[702,"M",6702654,147364,147364],[704,"M",90861131,7713777,7713777],[710,"M",41079,431,431],[764,"M",11500730,376395,376395],[784,"M",12077,195,195],[826,"M",1981326,10215,10215],[842,"M",19338425,377573,377573]],"2025":[[0,"X",96152949,3905266,3905266],[36,"X",988935,29896,29896],[156,"X",20815178,442539,442539],[251,"X",606984,31443,31443],[276,"X",955752,17357,17357],[344,"X",3915311,83358,83358],[360,"X",2342280,70790,70790],[410,"X",6314493,173930,173930],[458,"X",1984387,63123,63123],[490,"X",5234946,193377,193377],[702,"X",2335197,130962,130962],[704,"X",16148876,1193657,1193657],[710,"X",6621,125,125],[764,"X",3960754,108514,108514],[784,"X",257267,54986,54986],[826,"X",635933,6939,6939],[842,"X",9346236,127883,127883],[0,"M",1447104402,150661434,150661434],[36,"M",238050,4276,4276],[156,"M",1163910097,134823314,134823314],[251,"M",4778042,50228,50228],[276,"M",4595902,45369,45369],[344,"M",84442,1209,1209],[360,"M",21481202,1696474,1696474],[410,"M",33708480,954285,954285],[458,"M",3759465,286516,286516],[490,"M",24979214,1378962,1378962],[702,"M",5338077,101389,101389],[704,"M",95378744,7872910,7872910],[710,"M",16954,185,185],[764,"M",12511150,389573,389573],[784,"M",7652,150,150],[826,"M",1372061,9850,9850],[842,"M",20284369,352464,352464]]},"u":8},"870830":{"p":{"2023":[[0,"X",1564002221,105756083,105756083],[36,"X",15546538,1084023,1084023],[156,"X",157183377,9156360,9156360],[251,"X",6687938,619610,619610],[276,"X",4795498,359732,359732],[344,"X",9107776,756865,756865],[360,"X",109295359,7302020,7302020],[410,"X",7117295,585158,585158],[458,"X",63468576,4383675,4383675],[490,"X",25761810,1424183,1424183],[702,"X",7416776,473854,473854],[704,"X",13460178,1601581,1601581],[710,"X",13433664,1095567,1095567],[764,"X",121204894,10327153,10327153],[784,"X",41365100,3560508,3560508],[826,"X",10703730,1156829,1156829],[842,"X",585941755,31826540,31826540],[0,"M",764509451,80556437,80556437],[36,"M",59054,3207,3207],[156,"M",389922841,54238581,54238581],[251,"M",9550431,455718,455718],[276,"M",51260003,1605827,1605827],[360,"M",2018858,470664,470664],[410,"M",12609924,1883429,1883429],[458,"M",205495,24672,24672],[490,"M",14761935,972227,972227],[702,"M",7739,645,645],[704,"M",12009867,1395385,1395385],[710,"M",572676,23922,23922],[764,"M",70540831,5850766,5850766],[826,"M",10277816,764256,764256],[842,"M",38309875,1843170,1843170]],"2024":[[0,"X",1599754511,104870122,104870122],[36,"X",15199400,1213988,1213988],[156,"X",151474785,9084326,9084326],[251,"X",7008957,560181,560181],[276,"X",3717135,335593,335593],[344,"X",7651353,667742,667742],[360,"X",90266633,6337405,6337405],[410,"X",2213009,190011,190011],[458,"X",63739237,4184474,4184474],[490,"X",27737216,1576825,1576825],[702,"X",8552683,592959,592959],[704,"X",15248037,1771943,1771943],[710,"X",14276044,1282120,1282120],[764,"X",116415418,8761594,8761594],[784,"X",41249457,3320092,3320092],[826,"X",3869560,602917,602917],[842,"X",701579225,34593395,34593395],[0,"M",755616858,84357454,84357454],[36,"M",57186,2125,2125],[156,"M",423389021,59513934,59513934],[251,"M",1876937,152339,152339],[276,"M",36692505,1266979,1266979],[360,"M",1771913,576515,576515],[410,"M",11090843,1555045,1555045],[458,"M",242273,27490,27490],[490,"M",14371580,960603,960603],[702,"M",1361,152,152],[704,"M",8368190,971085,971085],[710,"M",894473,34367,34367],[764,"M",84152650,7616510,7616510],[784,"M",4658,14,14],[826,"M",9409373,657948,657948],[842,"M",29228334,770424,770424]],"2025":[[0,"X",1617042939,104315458,104315458],[36,"X",14779356,1153059,1153059],[156,"X",160708585,9474559,9474559],[251,"X",3941583,362430,362430],[276,"X",3383486,275057,275057],[344,"X",9517539,772552,772552],[360,"X",88828732,6492423,6492423],[410,"X",1567563,118880,118880],[458,"X",65417308,3764348,3764348],[490,"X",27452334,1504690,1504690],[702,"X",9032264,531661,531661],[704,"X",15258197,1821299,1821299],[710,"X",15593470,1409119,1409119],[764,"X",120837067,7179752,7179752],[784,"X",44406216,3794556,3794556],[826,"X",4351241,619909,619909],[842,"X",673888326,35611662,35611662],[0,"M",797165977,91696361,91696361],[36,"M",42592,3104,3104],[156,"M",428275490,62415250,62415250],[251,"M",5179702,89369,89369],[276,"M",36849221,1288105,1288105],[360,"M",5619311,2850142,2850142],[410,"M",10876348,1322748,1322748],[458,"M",223360,21755,21755],[490,"M",13877633,901695,901695],[702,"M",13869,173,173],[704,"M",9127936,1010218,1010218],[710,"M",423360,18512,18512],[764,"M",102908214,8715722,8715722],[826,"M",11338023,724486,724486],[842,"M",25215217,1289283,1289283]]},"u":8},"950300":{"p":{"2023":[[0,"X",348005671,13450660,13450660],[36,"X",3959206,149414,149414],[156,"X",92150202,3760981,3760981],[251,"X",6233248,211883,211883],[276,"X",4798780,102821,102821],[344,"X",53610062,1148867,1148867],[360,"X",1430398,81240,81240],[410,"X",20931769,953376,953376],[458,"X",5274239,792513,792513],[490,"X",40830868,1188200,1188200],[702,"X",3815890,125421,125421],[704,"X",1758741,54110,54110],[710,"X",134058,4625,4625],[764,"X",8753011,1429377,1429377],[784,"X",868321,25687,25687],[826,"X",5770016,154461,154461],[842,"X",68144843,2096563,2096563],[0,"M",2668762986,141849970,141849970],[36,"M",110536,1681,1681],[156,"M",2164824749,116295816,116295816],[251,"M",1378291,15120,15120],[276,"M",7617461,237681,237681],[344,"M",2741515,27078,27078],[360,"M",13247239,540939,540939],[410,"M",10717527,315027,315027],[458,"M",2778160,322752,322752],[490,"M",27860248,985492,985492],[702,"M",29192,341,341],[704,"M",307311853,15804828,15804828],[764,"M",41093361,3120586,3120586],[784,"M",36180,71,71],[826,"M",3240071,82234,82234],[842,"M",7234684,219959,219959]],"2024":[[0,"X",398329435,13771507,13771507],[36,"X",4351127,185835,185835],[156,"X",123143514,3748807,3748807],[251,"X",6950212,261007,261007],[276,"X",5714746,132026,132026],[344,"X",62885969,1090567,1090567],[360,"X",1317334,81685,81685],[410,"X",25134107,1221783,1221783],[458,"X",5257055,798092,798092],[490,"X",50637656,1444241,1444241],[702,"X",4144456,131351,131351],[704,"X",1817723,64940,64940],[710,"X",152207,4577,4577],[764,"X",7792137,1266532,1266532],[784,"X",252018,6719,6719],[826,"X",7650157,186653,186653],[842,"X",61764128,1881224,1881224],[0,"M",2760028751,148046509,148046509],[36,"M",149241,1909,1909],[156,"M",2204594645,118975250,118975250],[251,"M",1087501,11339,11339],[276,"M",6142444,201066,201066],[344,"M",1977574,17284,17284],[360,"M",15913469,937581,937581],[410,"M",9268621,267680,267680],[458,"M",2392375,256043,256043],[490,"M",26871171,796130,796130],[702,"M",16787,99,99],[704,"M",355432948,19217020,19217020],[710,"M",3819,57,57],[764,"M",45016689,3186268,3186268],[784,"M",36739,168,168],[826,"M",4211908,96433,96433],[842,"M",6185333,176865,176865]],"2025":[[0,"X",441325053,14892304,14892304],[36,"X",4752917,188464,188464],[156,"X",153667511,4389588,4389588],[251,"X",8030552,278985,278985],[276,"X",5096039,115037,115037],[344,"X",56436196,1081510,1081510],[360,"X",1562747,91077,91077],[410,"X",22908260,993266,993266],[458,"X",6430921,1010146,1010146],[490,"X",48267866,1419694,1419694],[702,"X",4967290,144806,144806],[704,"X",2077589,87338,87338],[710,"X",98827,2601,2601],[764,"X",7566427,1126382,1126382],[784,"X",342735,4903,4903],[826,"X",5865454,138361,138361],[842,"X",76692239,2495410,2495410],[0,"M",3169221917,160948045,160948045],[36,"M",124674,1579,1579],[156,"M",2551040032,128756280,128756280],[251,"M",796594,6739,6739],[276,"M",5471040,151681,151681],[344,"M",2157837,19270,19270],[360,"M",13416414,556207,556207],[410,"M",8349758,200402,200402],[458,"M",2058964,163057,163057],[490,"M",26258191,746460,746460],[702,"M",89094,542,542],[704,"M",418928795,22857850,22857850],[710,"M",1513,5,5],[764,"M",42918638,3257656,3257656],[826,"M",4974167,88972,88972],[842,"M",4821852,144933,144933]]},"u":8},"230910":{"p":{"2023":[[0,"X",56123050,4810634,4810634],[36,"X",90404,7000,7000],[156,"X",295191,25303,25303],[344,"X",13905942,1136000,1136000],[360,"X",30479,2000,2000],[410,"X",21282324,2013000,2013000],[458,"X",116875,17000,17000],[490,"X",18755356,1424000,1424000],[702,"X",848648,102000,102000],[704,"X",247697,53000,53000],[764,"X",133939,9000,9000],[842,"X",199593,4000,4000],[0,"M",725016004,209716414,209716414],[36,"M",25267808,8469000,8469000],[156,"M",111118645,19608000,19608000],[251,"M",24341082,2502000,2502000],[276,"M",4456819,994000,994000],[360,"M",324160,54000,54000],[410,"M",70841612,24122000,24122000],[490,"M",514175,49000,49000],[704,"M",3701065,876000,876000],[764,"M",307783242,101005000,101005000],[826,"M",19505552,4492000,4492000],[842,"M",46015601,13287000,13287000]],"2024":[[0,"X",57839648,5303707,5303707],[36,"X",15433,1415,1415],[156,"X",217023,38867,38867],[344,"X",13015974,1102000,1102000],[360,"X",71205,10000,10000],[410,"X",21701936,2119000,2119000],[458,"X",97076,16538,16538],[490,"X",20427809,1600000,1600000],[702,"X",1165028,141000,141000],[704,"X",694567,223000,223000],[764,"X",268653,40645,40645],[842,"X",98443,5406,5406],[0,"M",747737006,218483013,218483013],[36,"M",28773378,8879000,8879000],[156,"M",114135102,19530000,19530000],[251,"M",11310133,2458899,2458899],[276,"M",3964350,1027449,1027449],[360,"M",487354,91552,91552],[410,"M",74928867,24940067,24940067],[490,"M",453694,47349,47349],[704,"M",4511288,658000,658000],[764,"M",309493431,104740000,104740000],[826,"M",19262034,4064478,4064478],[842,"M",48869085,13919894,13919894]],"2025":[[0,"X",61312489,5869581,5869581],[36,"X",13058,1250,1250],[156,"X",239738,33000,33000],[344,"X",13572571,1140000,1140000],[360,"X",59447,7000,7000],[410,"X",24518467,2400000,2400000],[458,"X",83518,4000,4000],[490,"X",20349445,1850000,1850000],[702,"X",1115975,131000,131000],[704,"X",855974,270000,270000],[764,"X",305037,21000,21000],[842,"X",29585,2832,2832],[0,"M",729378604,199735298,199735298],[36,"M",25230467,7923000,7923000],[156,"M",114551568,18885622,18885622],[251,"M",7862981,2328000,2328000],[276,"M",4911184,1243403,1243403],[360,"M",708467,94000,94000],[410,"M",68065973,22105000,22105000],[458,"M",1661,455,455],[490,"M",751936,83000,83000],[704,"M",4154765,428000,428000],[764,"M",302010069,95057000,95057000],[826,"M",17459510,3597000,3597000],[842,"M",42257277,12079000,12079000]]},"u":8,"a":{"2023":{"X":[56123050,4810634,4810634],"M":[725016004,209716414,209716414]},"2024":{"X":[57839648,5303707,5303707],"M":[747737006,218483013,218483013]},"2025":{"X":[61312489,5869581,5869581],"M":[729378604,199735298,199735298]}}}} };
  V99CTY.CT_ADD = CT_ADD;
  function ctMerge(C) {
    try {
      if (!C || !C.raw || C.__v99ct) return C;
      const added = [];
      Object.keys(CT_ADD.hs).forEach((h) => {
        const x = CT_ADD.hs[h];
        let d = C.raw[h];
        if (!d) {
          if (!x.a) return;
          d = C.raw[h] = { annual: JSON.parse(JSON.stringify(x.a)), partners: {}, world: {}, qty_unit_code: x.u };
          if (C.meta && !C.meta[h] && CT_ADD.meta[h]) C.meta[h] = Object.assign({}, CT_ADD.meta[h]);
        }
        if (d.partners && Object.keys(d.partners).length) return; // 今ある内訳は上書きしない
        d.partners = JSON.parse(JSON.stringify(x.p));
        if (d.qty_unit_code == null && x.u != null) d.qty_unit_code = x.u;
        d.v99src = { by: "UN Comtrade", fetched: CT_ADD.fetched };
        added.push(h);
      });
      C.__v99ct = { added, fetched: CT_ADD.fetched };
      V99CTY.n.ct = added.length;
    } catch (e) { err("ctMerge", e); }
    return C;
  }
  if (typeof csData === "function") {
    const __cd99 = csData;
    csData = function () { return ctMerge(__cd99.apply(this, arguments)); }; // eslint-disable-line no-global-assign
  }
  // この HS の国別の内訳が、21.99 で足した UN Comtrade の数字か
  V99CTY.ctAdded = function (hs) { const h = String(hs == null ? "" : hs).replace(/[^\d]/g, "").slice(0, 6); return !!(h && CT_ADD.hs[h]); };
  // 一覧で、競合を評価できている商品・できていない商品（A・D 以外が未評価の確かめ用）
  V99CTY.compCover = function (hsList) {
    const out = {};
    (hsList || []).forEach((h) => { try { const S = kbStats(h, "X"); out[h] = { hs: S && S.hs, n: S && Array.isArray(S.partners) ? S.partners.length : 0 }; } catch (e) { out[h] = { err: 1 }; } });
    return out;
  };
})();
