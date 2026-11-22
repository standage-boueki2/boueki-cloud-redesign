/* 22.01 分野「buyer」の中身（2026-11-22 第14回 UAT〔22.00.1〕の直し）
   No.621 規制の画面・書類の画面の「公的な出どころ」：確定した国（販売先国）と商材に関係する出どころだけを出す
          原因：書類の判断の表（V85DOC_D.rules）の「全部の国に当たる行」（r008 ラベル・r041 分析証明書・r003 荷印・r002 PL など）に、
                サウジ・UAE・インドネシア・ブラジルの資料が出どころとして付いていて、規制の画面（v92 の tableHits→srcHtml）と
                書類の画面（v85docJudge→v85docSrcHtml）と「調べ方と次の一歩」（rd_v95reg の li3）が、国・商材を見ずにそのまま出していた
          直し：v85docRuleHit（行が当たるかの判定・全部の画面が通る）を包み、その判定の間だけ、行の出どころ（s・u・ok）を
                「この国・この商材に関係する部分」に絞って返す。関係する部分が無ければ「要確認（この国・商材の公的な出どころは未登録）」
   No.622 バイヤーリストの件数：要約・旅程・前のリストの選択肢の社数を、表に並ぶ社数（届かず外した会社を除く）にそろえる。
          外した数・AI が挙げなかった数（頼んだ数より少ない）は別に出す（rd_v101buyer.js）
   No.623 文面ボタン：文面の有無（その会社の L.ap だけ）で「文面を作る／文面を見る／開く」（rd_v101buyer.js）。文面を作ったら表を描き直す
   No.624 文面の署名：署名は登録済みの会社情報（英文社名・住所・電話・Web・メール）とログインの担当者名から作り、無い項目は
          【…を入れてください】で残す。仮の値（[Your Name]・export@your-company.example・1-2-3 …, Tokyo・+81-3-0000-0000・Taro Yamada）を残さない。
          送る前の関所（v79obPh）で【…】と仮の値を止める。コピー・DM・返信は rd_v101buyer.js で止める
   No.597 公式サイトの確かめ：URL の無い会社は、AI の Web 検索の出どころ（cits）と検索（rsSearch）で候補を探す・時間切れは1回だけ確かめ直す・
          確かめられなかった会社は表の下に並べ、理由を各行に出す（確かめていない会社を確かめた扱いにはしない）
   書き方：前の関数を控えてから包む・二重に包んでも同じ結果（__v101buyer の印）・例外は V101BUYER.err に残す */
(function () {
  "use strict";
  const W = window;
  if (W.V101BUYER && W.V101BUYER.loaded) return;
  const V = (W.V101BUYER = { ver: "22.01", loaded: 1, err: null, errs: [], srcOn: true, n: { src: 0, srcDrop: 0, srcNoReg: 0, sig: 0, scrub: 0, ph: 0, cand: 0, candHit: 0, retry: 0, order: 0 }, log: [], obCits: null });
  function err(k, e) { try { V.err = k + ": " + String((e && e.message) || e).slice(0, 200); V.errs.push(V.err); if (V.errs.length > 40) V.errs.shift(); } catch (x) { /* 記録だけ */ } }
  function log(o) { try { o.t = Date.now(); V.log.push(o); if (V.log.length > 200) V.log.shift(); } catch (e) { /* 記録だけ */ } }
  V.errf = err;
  function lang() { try { return (typeof I18N !== "undefined" && I18N && I18N.lang) || "ja"; } catch (e) { return "ja"; } } // eslint-disable-line no-undef
  function M(ja, en, zh, es) { const l = lang(); return l === "en" ? en || ja : l === "zh" ? zh || en || ja : l === "es" ? es || en || ja : ja; }
  function F(s, o) { let t = String(s); Object.keys(o || {}).forEach((k) => { t = t.split("{" + k + "}").join(String(o[k])); }); return t; }
  function E(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]); }
  V.M = M; V.F = F; V.E = E; V.lang = lang;
  function ten() { try { return (typeof TEN !== "undefined" && TEN) || null; } catch (e) { return null; } } // eslint-disable-line no-undef
  function dd() { try { return (typeof D !== "undefined" && D) || null; } catch (e) { return null; } } // eslint-disable-line no-undef
  function fn(n) { try { return typeof W[n] === "function"; } catch (e) { return false; } }
  function wrap(name, mk) {
    try {
      const f = W[name];
      if (typeof f !== "function" || f.__v101buyer) return false;
      const g = mk(f);
      g.__v101buyer = 1;
      W[name] = g;
      return true;
    } catch (e) { err("wrap " + name, e); return false; }
  }
  V.wrap = wrap;
  // 訳（ほかの層と同じく I18N.dict に足す。すでにある訳は上書きしない）
  function dictAdd(ja, en, zh, es) {
    try {
      const DI = (typeof I18N !== "undefined" && I18N && I18N.dict) || null; // eslint-disable-line no-undef
      if (!DI || !ja) return;
      [["en", en], ["zh", zh || en], ["es", es || en]].forEach(([l, v]) => { if (!v) return; DI[l] = DI[l] || {}; if (DI[l][ja] == null) DI[l][ja] = v; });
    } catch (e) { err("dict", e); }
  }
  V.dictAdd = dictAdd;

  /* ═════════ No.621 公的な出どころを、確定した国・商材に関係するものだけにする ═════════ */
  const SEP = "／";
  const NOREG = "要確認（この国・商材の公的な出どころは未登録）";
  const NOTHIS = "要確認（この国の分は未確認）";
  dictAdd(NOREG, "To be confirmed (no official source registered for this country and product)", "需确认（尚未登记该国家・该商品的官方出处）", "Por confirmar (no hay fuente oficial registrada para este país y producto)");
  dictAdd(NOTHIS, "To be confirmed (not yet checked for this country)", "需确认（该国部分尚未确认）", "Por confirmar (aún no verificado para este país)");
  V.NOREG = NOREG; V.NOTHIS = NOTHIS;
  // 国の名前（明示）→ 国コード
  const CTY = [
    [/サウジ|Saudi/i, ["SA"]], [/UAE|アラブ首長国|ドバイ|アブダビ|Dubai|Abu Dhabi/i, ["AE"]], [/カタール|Qatar/i, ["QA"]], [/クウェート|Kuwait/i, ["KW"]], [/バーレーン|Bahrain/i, ["BH"]], [/オマーン|Oman\b/i, ["OM"]], [/ヨルダン|Jordan/i, ["JO"]], [/イラク|Iraq/i, ["IQ"]], [/レバノン|Lebanon/i, ["LB"]],
    [/エジプト|Egypt/i, ["EG"]], [/ナイジェリア|Nigeria/i, ["NG"]], [/南ア|South Africa/i, ["ZA"]], [/ケニア|Kenya/i, ["KE"]],
    [/ブラジル|Brazil|Brasil/i, ["BR"]], [/メキシコ|Mexico|México/i, ["MX"]], [/カナダ|Canada/i, ["CA"]], [/米国|アメリカ|United States|U\.S\./, ["US"]],
    [/英国|イギリス|United Kingdom|\bUK\b|GOV\.UK|Great Britain/i, ["GB"]], [/スイス|Switzerland|Swiss/i, ["CH"]], [/ノルウェー|Norway/i, ["NO"]], [/ドイツ|Germany/i, ["DE"]], [/フランス|France/i, ["FR"]], [/オランダ|Netherlands/i, ["NL"]], [/イタリア|Italy/i, ["IT"]], [/スペイン|Spain/i, ["ES"]],
    [/欧州|\bEU\b|EUR-Lex|European/i, ["EU"]],
    [/香港|Hong Kong/i, ["HK"]], [/マカオ|Macau|Macao/i, ["MO"]], [/台湾|臺灣|Taiwan/i, ["TW"]], [/中国|中華人民共和国|China|Chinese/i, ["CN"]], [/韓国|Korea/i, ["KR"]],
    [/シンガポール|Singapore/i, ["SG"]], [/マレーシア|Malaysia/i, ["MY"]], [/タイ(?![ルプムヤミトーツ])|バンコク|Thailand|Bangkok/i, ["TH"]], [/ベトナム|Vietnam|Viet Nam/i, ["VN"]], [/インドネシア|Indonesia/i, ["ID"]], [/フィリピン|Philippines/i, ["PH"]], [/インド(?!ネシア)|\bIndia\b/i, ["IN"]],
    [/豪州|オーストラリア|Australia/i, ["AU"]], [/ニュージーランド|New Zealand|\bNZ\b/i, ["NZ"]], [/トルコ|Türk|Turkey|Turkiye/i, ["TR"]], [/イスラエル|Israel/i, ["IL"]]
  ];
  // 国の名前が無いときだけ使う：当局・法令の名前
  const AUTH = [
    [/SFDA|SABER|SASO|ZATCA/, ["SA"]], [/MoIAT|TDRA/, ["AE"]], [/GOEIC|EDREX/, ["EG"]], [/NAFDAC|SONCAP|NTIP/, ["NG"]], [/ANVISA|ANATEL|Receita/, ["BR"]], [/COFEPRIS|SENASICA/, ["MX"]],
    [/CFIA|Health Canada|ISED/, ["CA"]], [/(?<![A-Za-z])FDA(?![\w]*フィリピン)|\bCBP\b|\bTTB\b|USDA|APHIS|NOAA|eCFR|CPSC|\bFCC\b|USTR|PHMSA|\bFTC\b/, ["US"]],
    [/fedlex|Swissmedic|swissdamed/i, ["CH"]], [/legislation\.gov\.uk|UKCA/i, ["GB"]], [/EUDAMED|CPNP|欧州委員会/, ["EU"]],
    [/TFDA|BSMI|標準檢驗局|衛生福利部|關務署|經濟部|國家通訊/, ["TW"]], [/食物安全センター/, ["HK"]], [/NMPA|GACC|CNCA|国家市場監督管理総局|税関総署|国家衛生健康委員会/, ["CN"]], [/MFDS|食品医薬品安全処|国家法令情報センター|国立電波研究院/, ["KR"]],
    [/\bHSA\b|CPSO|\bSFA\b|\bAVS\b/, ["SG"]], [/NPRA|\bDVS\b|獣医局|エネルギー委員会/, ["MY"]], [/TISI/, ["TH"]], [/BPJPH|BPOM/, ["ID"]], [/FSSAI|\bBIS\b/, ["IN"]],
    [/AICIS|BICON/, ["AU"]], [/\bMPI\b/, ["NZ"]], [/EESS|ERAC/, ["AU", "NZ"]], [/TİTCK|TITCK|Gümrük|mevzuat|TAREKS/i, ["TR"]]
  ];
  // 国も当局も無いときだけ使う：地域
  const REG = { "中東": ["SA", "AE", "QA", "KW", "BH", "OM", "JO", "IQ", "LB", "IL", "TR", "EG"], "湾岸": ["SA", "AE", "QA", "KW", "BH", "OM"], "アジア": ["CN", "HK", "MO", "TW", "KR", "SG", "MY", "TH", "VN", "ID", "PH", "IN", "BN", "KH", "LA", "MM"], "アフリカ": ["EG", "NG", "ZA", "KE"], "北米": ["US", "CA"], "大洋州": ["AU", "NZ"] };
  function ccOf(txt) {
    const s = String(txt || "").replace(/中国四国/g, "").replace(/米国商務省/g, "");
    const out = new Set();
    CTY.forEach(([re, cs]) => { if (re.test(s)) cs.forEach((c) => out.add(c)); });
    if (!out.size) AUTH.forEach(([re, cs]) => { if (re.test(s)) cs.forEach((c) => out.add(c)); });
    if (!out.size) Object.keys(REG).forEach((k) => { if (s.indexOf(k) >= 0) REG[k].forEach((c) => out.add(c)); });
    return out;
  }
  // 出どころの商材（食品・化粧品・玩具…）。「日用品」を含むもの（食品・日用品の令など）は商材を決めない
  const COM = [
    ["fcm", /食品接触|食品に触れる|food[ -]contact|Foodware|食器/i],
    ["pet", /ペットフード|pet ?food|飼料/i],
    ["liquor", /酒類|酒の|清酒|ワイン|Alcohol|TTB/i],
    ["cosme", /化粧品|Cosmetic|パーソナルケア/i],
    ["med", /医療機器|医薬品|医薬発|Medical device|Device Registration|Swissmedic|EUDAMED|麻薬|向精神薬/i],
    ["elec", /電気製品|電気用品|電気・|電波|無線|Electrical|Wireless|電池|Battery|リチウム|充電/i],
    ["mach", /機械|Machinery/i],
    ["toy", /玩具|おもちゃ|子ども製品|子供用|\bToys?\b/i],
    ["textile", /繊維|Textile|Wool/i],
    ["vehicle", /中古車|自動車|車両|タイヤ/],
    ["food", /食品(?!接触|に触れる)|菓子|飲料|調味料|食肉|牛肉|鶏肉|豚肉|畜産物|畜肉|乳製品|乳及び|乳、|家きん|卵|水産|魚|漁獲|向け米|米の|精米|青果|残留農薬|混合食品|健康食品|はちみつ|ハラール|ハラル|Halal|Food(?!\s*Contact)|Seafood|Meat|Poultry|Milk|\bEgg/]
  ];
  function comOfText(txt) {
    const s = String(txt || ""), out = new Set();
    if (/日用品/.test(s)) return out;
    COM.forEach(([k, re]) => { if (re.test(s)) out.add(k); });
    if (out.has("fcm")) out.delete("food");
    return out;
  }
  // 商品の商材（HS から）
  function comOfHs(hs) {
    const h = String(hs || "").replace(/\D/g, ""), s = new Set();
    if (!h) return s;
    if (/^23/.test(h)) s.add("pet");
    else if (/^(0[1-9]|1\d|2[0-2]|24)/.test(h)) s.add("food");
    if (/^220[3-8]/.test(h)) s.add("liquor");
    if (/^(330[3-7]|3401)/.test(h)) s.add("cosme");
    if (/^(30|9018|9019|9020|9021|9022|9402)/.test(h)) s.add("med");
    if (/^85/.test(h)) s.add("elec");
    if (/^84/.test(h)) s.add("mach");
    if (/^950[3-5]/.test(h)) s.add("toy");
    if (/^(5\d|6[0-3])/.test(h)) s.add("textile");
    if (/^(3923|3924|4823|6911|6912|7013|7323|7615|4419|8215)/.test(h)) s.add("fcm");
    if (/^87/.test(h)) s.add("vehicle");
    return s;
  }
  function groups() { try { return (typeof V85DOC_D !== "undefined" && V85DOC_D && V85DOC_D.groups) || {}; } catch (e) { return {}; } } // eslint-disable-line no-undef
  function ccHit(set, dest) {
    const G = groups();
    for (const c of set) { if (c === dest) return true; if (Array.isArray(G[c]) && G[c].indexOf(dest) >= 0) return true; }
    return false;
  }
  // URL の国（相手国の当局のサイト）。日本の役所・国際機関・JETRO の Q&A は国を決めない（null）
  const JC = { sa: "SA", ae: "AE", qa: "QA", kw: "KW", eg: "EG", ng: "NG", za: "ZA", il: "IL", tr: "TR", br: "BR", mx: "MX", us: "US", ca: "CA", cn: "CN", hk: "HK", tw: "TW", kr: "KR", sg: "SG", th: "TH", vn: "VN", my: "MY", idn: "ID", ph: "PH", in: "IN", au: "AU", nz: "NZ", eu: "EU", uk: "GB", gb: "GB", de: "DE", fr: "FR", nl: "NL", ch: "CH" };
  const TLD = [[/\.sa$/, "SA"], [/\.ae$/, "AE"], [/\.qa$/, "QA"], [/\.kw$/, "KW"], [/\.eg$/, "EG"], [/\.ng$/, "NG"], [/\.za$/, "ZA"], [/\.il$/, "IL"], [/\.tr$/, "TR"], [/\.br$/, "BR"], [/\.mx$/, "MX"], [/\.gov$/, "US"],
    [/(^|\.)canada\.ca$/, "CA"], [/\.gc\.ca$/, "CA"], [/\.cn$/, "CN"], [/\.hk$/, "HK"], [/\.tw$/, "TW"], [/\.kr$/, "KR"], [/\.sg$/, "SG"], [/\.th$/, "TH"], [/\.vn$/, "VN"], [/\.my$/, "MY"], [/\.id$/, "ID"], [/\.ph$/, "PH"], [/\.in$/, "IN"],
    [/\.au$/, "AU"], [/\.nz$/, "NZ"], [/europa\.eu$/, "EU"], [/\.uk$/, "GB"], [/\.ch$/, "CH"]];
  function ccOfUrl(u) {
    let h = "", p = "";
    try { const x = new URL(String(u || "")); h = x.hostname.toLowerCase(); p = x.pathname.toLowerCase(); } catch (e) { return null; }
    if (/(^|\.)jetro\.go\.jp$/.test(h)) { const m = p.match(/^\/world\/[a-z_]+\/([a-z]+)\//); return m && JC[m[1]] ? JC[m[1]] : null; }
    if (/(^|\.)maff\.go\.jp$/.test(h)) { const m = p.match(/\/(hk|china|korea|tw|sg|us|eu|th|vn)[_-]/); return m ? ({ hk: "HK", china: "CN", korea: "KR", tw: "TW", sg: "SG", us: "US", eu: "EU", th: "TH", vn: "VN" })[m[1]] : null; }
    for (const [re, c] of TLD) if (re.test(h)) return c;
    return null;
  }
  function partOk(part, dest, prod) {
    const cc = ccOf(part);
    if (cc.size && !ccHit(cc, dest)) return false;
    const cm = comOfText(part);
    if (cm.size && prod.size && ![...cm].some((x) => prod.has(x))) return false;
    return true;
  }
  // 確かめた日の注記（ok）を、この国に関係する部分だけにする
  function okFilt(ok, dest) {
    const parts = String(ok || "").split(SEP).map((x) => x.trim()).filter(Boolean);
    const out = [];
    parts.forEach((p) => {
      const m = p.match(/^(確認済み\s*[\d-]+)\s*[（(]([\s\S]*)[）)]\s*$/);
      if (m) {
        const cc = ccOf(m[2]);
        if (!cc.size || ccHit(cc, dest)) { out.push(p); return; }
        if (/要確認|未確認/.test(m[2])) { out.push(m[1]); return; } // ほかの国の例外の注記だけ外す
        return; // 「サウジ・UAE の一部」など、ほかの国だけを確かめた日
      }
      const cc = ccOf(p);
      if (!cc.size || ccHit(cc, dest)) out.push(p);
    });
    return out.length ? out.join(SEP) : NOTHIS;
  }
  // 訳：元の文の訳（I18N.dict）を「 / 」で分け、残した部分と同じ番号だけをつなぐ
  function trParts(ja, keepIdx, nAll, newJa) {
    try {
      const DI = (typeof I18N !== "undefined" && I18N && I18N.dict) || null; // eslint-disable-line no-undef
      if (!DI || !newJa || newJa === ja) return;
      ["en", "zh", "es"].forEach((l) => {
        const D0 = DI[l]; if (!D0 || D0[newJa] != null || typeof D0[ja] !== "string") return;
        const T = D0[ja].split(/\s+\/\s+|／/);
        if (T.length !== nAll) return;
        D0[newJa] = keepIdx.map((i) => T[i]).join(" / ");
      });
    } catch (e) { err("trParts", e); }
  }
  const MEMO = {};
  function filt(raw, Fc) {
    const s = String(raw.s || ""), u = String(raw.u || ""), ok = String(raw.ok || "");
    const dest = String((Fc && Fc.dest) || "");
    if ((!s && !u) || !dest) return raw;
    // 22.01.1・22.01.2 でこの層が足した行（v101b・v101p）は、国・商材ごとに当局の頁を開いて選んだ出どころなので絞らない
    //   （「犬貓食品」「Animal Food」を人の食品の出どころと読んで外してしまうため）
    if (/^v101[bp]\d/.test(String(raw.id || ""))) return raw;
    const prod = comOfHs(Fc.hs);
    const key = (raw.id || "") + "|" + s + "|" + u + "|" + ok + "|" + dest + "|" + [...prod].sort().join(",");
    if (MEMO[key]) return MEMO[key];
    // 22.01.2 L2：どの国にも当たる行の出どころを、国ごと（香港・台湾・シンガポール）に、当局の頁を開いて確かめたものに置き換える
    try { const ov = V.l2Src ? V.l2Src(raw.id, dest, prod) : null; if (ov) { MEMO[key] = Object.assign({ v101: { l2: 1 } }, ov); V.n.srcDrop++; return MEMO[key]; } } catch (e) { err("l2", e); }
    const parts = s.split(SEP).map((x) => x.trim()).filter(Boolean);
    const keep = parts.map((p) => partOk(p, dest, prod));
    const idx = []; keep.forEach((k, i) => { if (k) idx.push(i); });
    let r;
    if (!idx.length) {
      r = { s: "", u: "", ok: NOREG, v101: { all: parts.length, kept: 0 } };
      V.n.srcNoReg++;
    } else {
      const uc = ccOfUrl(u);
      const linkOk = !!u && keep[0] && (!uc || ccHit(new Set([uc]), dest));
      const same = idx.length === parts.length && (linkOk || !u);
      const s2 = idx.map((i) => parts[i]).join(SEP);
      // 22.01.2（2回目）w2-15：残った出どころが「いくつもの国を並べた名前」で、リンクがほかの国の頁だった（相手国の頁ではない）ときは、
      //   名前だけを残さず「要確認（未登録）」に（例：UAE に「JETRO UAE・サウジ・エジプト・ナイジェリア 輸出入手続」＝リンクはサウジの頁）
      const multi = (x) => ccOf(x).size >= 2;
      if (u && !linkOk && uc && !ccHit(new Set([uc]), dest) && idx.every((i) => multi(parts[i]))) {
        r = { s: "", u: "", ok: NOREG, v101: { all: parts.length, kept: 0, multi: 1 } };
        V.n.srcNoReg++;
      } else {
        r = { s: same ? s : s2, u: linkOk ? u : "", ok: same ? ok : okFilt(ok, dest), v101: { all: parts.length, kept: idx.length, link: linkOk } };
        if (!same) { trParts(s, idx, parts.length, s2); trOk(ok, r.ok); }
      }
    }
    if (r.s !== s || r.u !== u) V.n.srcDrop++;
    MEMO[key] = r;
    return r;
  }
  function trOk(ok0, ok1) {
    try {
      if (!ok1 || ok1 === ok0 || ok1 === NOTHIS || ok1 === NOREG) return;
      const p0 = String(ok0).split(SEP).map((x) => x.trim()), p1 = String(ok1).split(SEP).map((x) => x.trim());
      const idx = p1.map((x) => p0.indexOf(x));
      if (idx.every((i) => i >= 0)) trParts(ok0, idx, p0.length, ok1);
    } catch (e) { err("trOk", e); }
  }
  // 「当たる時」の文（R.c）も、かっこの中が国ごとの説明（「ベトナムは…、マレーシアは…、シンガポールは…」）なら、この国の分だけにする
  //  （行の注記 R.n は土台の v85docNoteFor がもう国で絞っている。それと同じ扱い）
  function trC(ja, out, items, keepIdx) {
    try {
      const DI = (typeof I18N !== "undefined" && I18N && I18N.dict) || null; // eslint-disable-line no-undef
      if (!DI) return;
      ["en", "zh", "es"].forEach((l) => {
        const D0 = DI[l]; if (!D0 || D0[out] != null || typeof D0[ja] !== "string") return;
        const tr = D0[ja];
        const re = l === "zh" ? /（((?:[^（）]|（[^（）]*）)*)）/ : /\(((?:[^()]|\([^()]*\))*)\)/;
        const m = tr.match(re); if (!m) return;
        const T = m[1].split(l === "zh" ? /，|、|；/ : /;\s*/);
        if (T.length !== items) return;
        const x = keepIdx.map((i) => T[i].trim()).join(l === "zh" ? "，" : "; ");
        D0[out] = tr.replace(m[0], l === "zh" ? "（" + x + "）" : "(" + x + ")");
      });
    } catch (e) { err("trC", e); }
  }
  function cFilt(c, dest) {
    const s = String(c == null ? "" : c);
    if (!s || !dest) return s;
    const key = "c|" + s + "|" + dest;
    if (MEMO[key] != null) return MEMO[key];
    let out = s;
    const m = s.match(/^([^（]*)（([\s\S]*)）([^）]*)$/);
    if (m) {
      const items = m[2].split("、");
      if (items.length >= 2) {
        const keep = items.map((it) => { const cc = ccOf(it); return !cc.size || ccHit(cc, dest); });
        if (keep.some((k) => !k) && keep.some(Boolean)) {
          const idx = []; keep.forEach((k, i) => { if (k) idx.push(i); });
          out = m[1] + "（" + idx.map((i) => items[i]).join("、") + "）" + m[3];
          trC(s, out, items.length, idx);
        }
      }
    }
    MEMO[key] = out;
    return out;
  }
  V.cFilt = cFilt;
  // 行の注記（R.n）：土台の v85docNoteFor は「文」ごとに国で絞る。1つの文の中に「シンガポールは…、タイは…、ベトナムは…」と
  //   国ごとの部分が並ぶときは、この国の部分だけにする（かっこの釣り合いが崩れる切り方はしない・訳の無い言語では元のまま）
  function noteCut(n, dest) {
    const s = String(n || "");
    if (!s || !dest) return s;
    return s.split(/(?<=。)/).map((sen) => {
      const parts = sen.replace(/。$/, "").split("、");
      if (parts.length < 2) return sen;
      const bal = (x) => (x.match(/[（(]/g) || []).length === (x.match(/[）)]/g) || []).length;
      const keep = parts.map((x) => { const cc = ccOf(x); return !cc.size || ccHit(cc, dest) || !bal(x); });
      if (!keep.some((k) => !k) || !keep.some(Boolean)) return sen;
      return parts.filter((_, i) => keep[i]).join("、") + (/。$/.test(sen) ? "。" : "");
    }).join("");
  }
  V.noteCut = noteCut;
  // 文に分ける：「。」で切る。かっこの中の「。」では切らない（土台はかっこの中でも切るため、
  //   「サウジは…（…そろえる。SFDA.FD/GSO 9）、民生品はアラビア語の取扱説明書…」の後ろ半分が、ほかの国の注記に残っていた）
  function sentSplit(s) {
    const out = []; let d = 0, cur = "";
    for (const ch of String(s || "")) { cur += ch; if (ch === "（" || ch === "(") d++; else if ((ch === "）" || ch === ")") && d > 0) d--; else if (ch === "。" && d === 0) { out.push(cur); cur = ""; } }
    if (cur.trim()) out.push(cur);
    return out;
  }
  function enSplit(s) {
    const out = []; let d = 0, cur = ""; const t = String(s || "");
    for (let i = 0; i < t.length; i++) { const ch = t[i]; cur += ch; if (ch === "(") d++; else if (ch === ")" && d > 0) d--; else if (ch === "." && d === 0 && (i === t.length - 1 || (/\s/.test(t[i + 1]) && /[A-Z]/.test(t[i + 2] || "")))) { out.push(cur.trim()); cur = ""; } }
    if (cur.trim()) out.push(cur.trim());
    return out;
  }
  function noteFilt(n, dest) {
    const S = sentSplit(n);
    const idx = [];
    S.forEach((x, i) => { const cc = ccOf(x); if (!cc.size || ccHit(cc, dest)) idx.push(i); });
    return { out: idx.map((i) => noteCut(S[i], dest)).join("").trim(), idx, n: S.length, cut: idx.some((i) => noteCut(S[i], dest) !== S[i]) };
  }
  V.noteFilt = noteFilt;
  wrap("v85docNoteFor", (o) => function (n, dest) {
    const r = o.apply(this, arguments);
    try {
      if (!V.srcOn || !n || !dest) return r;
      const f = noteFilt(String(n), String(dest));
      if (lang() === "ja") return f.out;
      // 日本語以外：元の注記の訳を文に分け、残した文と同じ番号の訳だけにする（数が合わないときは土台のまま）
      const DI = (typeof I18N !== "undefined" && I18N && I18N.dict) || {}; // eslint-disable-line no-undef
      const D0 = DI[lang()] || {};
      if (D0[f.out] != null) return f.out;
      if (!f.cut && typeof D0[String(n)] === "string") {
        const T = enSplit(D0[String(n)]);
        if (T.length === f.n) { D0[f.out] = f.idx.map((i) => T[i]).join(" "); return f.out; }
      }
    } catch (e) { err("noteFor", e); }
    return r;
  });
  V.srcFilt = (raw, dest, hs) => filt(raw, { dest, hs });
  V.ccOf = (t) => [...ccOf(t)];
  V.comOfText = (t) => [...comOfText(t)];
  V.comOfHs = (h) => [...comOfHs(h)];
  V.ccOfUrl = ccOfUrl;
  // 行（R）の s・u・ok を、判定の間だけ絞った値で返す（判定の外では元のまま）
  const LIVE = new Set(); let pend = 0;
  function clearSoon() { if (pend) return; pend = 1; Promise.resolve().then(() => { pend = 0; LIVE.forEach((r) => { try { r.__v101F = null; } catch (e) { /* 無視 */ } }); LIVE.clear(); }); }
  function inst(R) {
    if (!R || typeof R !== "object") return false;
    if (Object.prototype.hasOwnProperty.call(R, "__v101raw")) return true;
    try {
      const raw = { s: R.s, u: R.u, ok: R.ok, c: R.c, id: R.id };
      Object.defineProperty(R, "__v101raw", { value: raw, writable: true, enumerable: false, configurable: true });
      Object.defineProperty(R, "__v101F", { value: null, writable: true, enumerable: false, configurable: true });
      ["s", "u", "ok"].forEach((k) => Object.defineProperty(R, k, {
        configurable: true, enumerable: true,
        get() { try { const Fc = R.__v101F; if (Fc && V.srcOn) { V.n.src++; return filt(raw, Fc)[k]; } } catch (e) { err("srcGet", e); } return raw[k]; },
        set(v) { raw[k] = v; }
      }));
      if (typeof raw.c === "string") Object.defineProperty(R, "c", {
        configurable: true, enumerable: true,
        get() {
          try {
            const Fc = R.__v101F;
            if (Fc && V.srcOn) {
              const x = cFilt(raw.c, Fc.dest);
              if (x === raw.c || lang() === "ja") return x;
              // 日本語以外の画面では、切った文の訳があるときだけ切る（訳の無い日本語を出さない）
              const DI = (typeof I18N !== "undefined" && I18N && I18N.dict) || {}; // eslint-disable-line no-undef
              return (DI[lang()] && DI[lang()][x] != null) ? x : raw.c;
            }
          } catch (e) { err("cGet", e); }
          return raw.c;
        },
        set(v) { raw.c = v; }
      });
      return true;
    } catch (e) { err("inst", e); return false; }
  }
  V.inst = inst;
  function wrapRuleHit() {
    return wrap("v85docRuleHit", (o) => function (r, Fx) {
      const h = o.apply(this, arguments);
      // 22.01.2 R4：ペットフードには、人の食品の手続き（台湾 TFDA の輸入査験・ベトナムの食品の自己公表など）の行を出さない
      try { if (h && r && Fx && V.petHuman && V.petHuman(r, Fx)) { V.n.petCut = (V.n.petCut || 0) + 1; return null; } } catch (e) { err("petHit", e); }
      try { if (h && r && Fx && Fx.dest && inst(r)) { r.__v101F = { dest: String(Fx.dest), hs: String(Fx.hs || "") }; LIVE.add(r); clearSoon(); } } catch (e) { err("ruleHit", e); }
      return h;
    });
  }
  wrapRuleHit();

  /* ═════════ No.624 文面の署名：登録済みの情報から作り、無い項目は【…】で残す ═════════ */
  // 【…】は画面の言語で（文面の中の文字なので、訳の仕組みでは変わらない）
  const MK_JA = { name: "【差出人の名前（英字）を入れてください】", mail: "【差出人のメールを入れてください】", addr: "【会社の住所（英語）を入れてください】", tel: "【電話番号を入れてください（要らなければこの行を消してください）】" };
  const MK_EN = { name: "【Sender name (Latin letters) — please fill in】", mail: "【Sender email — please fill in】", addr: "【Company address (English) — please fill in】", tel: "【Phone number — fill in or delete this line】" };
  const MKs = () => (lang() === "ja" ? MK_JA : MK_EN);
  const MK = new Proxy({}, { get: (_, k) => MKs()[k] });
  V.MK = MK; V.MK_ALL = [MK_JA, MK_EN];
  const MK_RE = /【[^】\n]{0,60}(?:入れてください|消してください|please fill in|delete this line)[^】\n]{0,30}】/;
  // 仮の値（例・見本の値・AI が書いた穴埋め）
  // 見本用に決められた名前（.example・.invalid・.test）で終わるメールも仮の値（土台の資料の決まりでも「連絡先：未入力」扱い）
  const FAKE_MAIL = /[\w.+-]*@(?:[\w-]+\.)*(?:your-?company|yourcompany|yourdomain|your-domain|example|domain|sample|company)\.[a-z.]{2,12}\b|\b(?:name|your\.?name|xxx+|test)@[\w.-]+\.[a-z]{2,}\b|[\w.+-]+@[\w-]+(?:\.[\w-]+)*\.(?:example|invalid|test)\b/gi;
  const FAKE_ADDR = /\b1-2-3\s*(?:…|\.{3}|Honmachi|Marunouchi)[^\n]*/gi;
  const FAKE_TEL = /\+?81[-\s.]?\(?0?\d{1,4}\)?[-\s.]?0000[-\s.]?0000|\+\d{1,3}[-\s]?X{2,}[-\sX\d]*|\b0\d-0000-0000\b|\bXXX-XXXX-XXXX\b/gi;
  const FAKE_NAME = /\bTaro Yamada\b/g;
  const PH_NAME = /\[(?:Your|Sender'?s?)\s*(?:Full\s*)?Name\]|\[Name\]|\{\{?\s*(?:your_?)?name\s*\}?\}|<Your Name>|【(?:お名前|氏名|担当者名)】/gi;
  const PH_TITLE = /\[(?:Your\s*)?(?:Job\s*)?(?:Title|Position)\]|【役職】/gi;
  const PH_CO = /\[(?:Your\s*)?Company(?:\s*Name)?\]|【会社名】/gi;
  const PH_MAIL = /\[(?:Your\s*)?E-?mail(?:\s*Address)?\]|【メール】/gi;
  const PH_TEL = /\[(?:Your\s*)?(?:Phone|Tel|Telephone)(?:\s*Number)?\]|【電話】/gi;
  const PH_ADDR = /\[(?:Your\s*)?(?:Company\s*)?Address\]|【住所】/gi;
  const PH_WEB = /\[(?:Your\s*)?(?:Website|Web\s*site|URL)\]/gi;
  function isFake(v) { const s = String(v || ""); if (!s.trim()) return false; FAKE_MAIL.lastIndex = 0; FAKE_ADDR.lastIndex = 0; FAKE_TEL.lastIndex = 0; return FAKE_MAIL.test(s) || FAKE_ADDR.test(s) || FAKE_TEL.test(s) || /\[[^\]\n]{1,30}\]/.test(s) || MK_RE.test(s); }
  function mailOf(s) { try { return typeof v71obMail === "function" ? v71obMail(s) : ((String(s || "").match(/[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}/) || [""])[0]); } catch (e) { return ""; } } // eslint-disable-line no-undef
  function clean(x) { const s = String(x == null ? "" : x).trim(); return s && !isFake(s) && !/[（(]案[)）]\s*$/.test(s) ? s : ""; }
  // 22.01.2 S3：署名の名前は英字（ローマ字）だけ。ログインの名前が英字でない（例「大森（Claude検証）」）ときは入れず【差出人の名前（英字）を入れてください】に
  //   （22.01 の L4「日本語の名前を入れて、ローマ字の氏名を入れてくださいと知らせる」を置き換える。英字の名前〔Taro Yamada など〕はそのまま）
  function latinName(x) { const s = clean(x); if (!s) return ""; if (/[^ -ɏḀ-ỿ’]/.test(s)) return ""; return /[A-Za-zÀ-ɏ]{2,}/.test(s) ? s : ""; }
  // 登録済みの会社情報（英文の住所・電話・Web・メール・担当者）
  function regInfo() {
    const t = ten() || {};
    let seller = {}; try { seller = fn("v54docSeller") ? (W.v54docSeller() || {}) : {}; } catch (e) { seller = {}; }
    let DM = {}; try { DM = fn("dk3Meta") ? (W.dk3Meta(t) || {}) : (t.deckMeta || {}); } catch (e) { DM = t.deckMeta || {}; }
    const Fa = DM.facts || {};
    const JA = /[ぁ-んァ-ヶ一-龠々]/;
    const en = (x) => { const s = clean(x); return s && !JA.test(s) ? s : ""; };
    const m = clean(mailOf(DM.mail || Fa.mail || t.dmFrom || ""));
    return { addr: en(seller.addr) || en(DM.addr) || en(Fa.addrEn) || en(t.sellerAddr), tel: clean(DM.tel || Fa.tel), web: clean(DM.web || Fa.web), mail: m && !isFake(m) ? m : "", person: clean(t.person || DM.person) };
  }
  V.regInfo = regInfo;
  // ログインの担当者名（「様」は外す・「—」は名前ではない）
  function loginName() {
    let n = "";
    try { if (typeof tmMe === "function") n = String((tmMe() || {}).name || ""); } catch (e) { n = ""; } // eslint-disable-line no-undef
    try { if (!n && typeof SES !== "undefined" && SES) n = String(SES.who || ""); } catch (e) { /* 無い版 */ } // eslint-disable-line no-undef
    n = n.replace(/様$/, "").trim();
    return /^[—\-]$/.test(n) ? "" : clean(n);
  }
  V.loginName = loginName;
  wrap("v79obSig", (o) => function () {
    const s = o.apply(this, arguments) || {};
    try {
      const R = regInfo();
      if (!clean(s.name)) s.name = loginName() || clean(R.person) || "";
      if (!mailOf(s.mail) || isFake(s.mail)) s.mail = R.mail || "";
      if (!clean(s.addr)) s.addr = R.addr || "";
      if (!clean(s.tel)) s.tel = R.tel || "";
      if (!clean(s.web)) s.web = R.web || "";
      if (isFake(s.title)) s.title = "";
    } catch (e) { err("sig", e); }
    return s;
  });
  // 署名の文：無い項目（名前・メール・住所）は【…を入れてください】
  wrap("v79obSigText", (o) => function (s) {
    try {
      s = s || (fn("v79obSig") ? W.v79obSig() : {});
      const name = latinName(s.name) || MK.name, mail = mailOf(s.mail || "") && !isFake(s.mail) ? mailOf(s.mail) : MK.mail, addr = clean(s.addr) || MK.addr;
      return [name, clean(s.title), clean(s.co), [mail, clean(s.tel), clean(s.web)].filter(Boolean).join(" | "), addr].filter(Boolean).join("\n");
    } catch (e) { err("sigText", e); return o.apply(this, arguments); }
  });
  // 取り決め（ほかの担当の文面も同じ署名に）：window.v101sigText() → 登録済みの値と【…を入れてください】の署名の文。
  //   window.v101scrubOut(text) → 仮の値・穴埋めを置き換えた文。window.v101phOf(text) → 残っている仮の値・【…】（無ければ ""）
  W.v101sigText = function () { try { return W.v79obSigText(W.v79obSig()); } catch (e) { err("sigTextApi", e); return ""; } };
  W.v101scrubOut = function (t) { try { return scrub(t); } catch (e) { err("scrubApi", e); return t; } };
  W.v101phOf = function (t) { try { return phOf(t); } catch (e) { return ""; } };
  // 本文の仮の値・穴埋めを、登録済みの値か【…】に置き換える
  function scrub(b, s) {
    s = s || (fn("v79obSig") ? W.v79obSig() : {});
    const name = latinName(s.name), mail = mailOf(s.mail || "") && !isFake(s.mail) ? mailOf(s.mail) : "", addr = clean(s.addr), tel = clean(s.tel), web = clean(s.web), title = clean(s.title), co = clean(s.co);
    let x = String(b || "");
    const x0 = x;
    const rep = (re, v) => { re.lastIndex = 0; x = x.replace(re, v); };
    rep(PH_NAME, name || MK.name); rep(PH_MAIL, mail || MK.mail); rep(PH_ADDR, addr || MK.addr); rep(PH_CO, co); rep(PH_TITLE, title); rep(PH_TEL, tel || MK.tel); rep(PH_WEB, web);
    rep(FAKE_MAIL, mail || MK.mail); rep(FAKE_ADDR, addr || MK.addr); rep(FAKE_TEL, tel || MK.tel);
    if (name !== "Taro Yamada") rep(FAKE_NAME, name || MK.name);
    // 中身が空になった「Title:」「Tel:」などの行は消す
    x = x.split("\n").filter((l) => !/^\s*(?:Title|Position|Tel|Phone|Mobile|Web(?:site)?|URL|E-?mail|Address|役職|電話|住所)\s*[:：]\s*$/i.test(l)).join("\n");
    if (x !== x0) V.n.scrub++;
    return x;
  }
  V.scrub = scrub;
  // 仮の値・【…】が残っているか（送る・コピーの前の関所）
  function phOf(text) {
    const t = String(text || "");
    const tests = [MK_RE, PH_NAME, PH_MAIL, PH_ADDR, PH_TEL, PH_TITLE, PH_CO, PH_WEB, FAKE_MAIL, FAKE_ADDR, FAKE_TEL, /\[(?:Your|Insert|Enter)[^\]\n]{0,40}\]/i];
    for (const re of tests) { re.lastIndex = 0; const m = t.match(re); if (m) return m[0]; }
    if (/\bTaro Yamada\b/.test(t)) { let nm = ""; try { nm = String((W.v79obSig() || {}).name || ""); } catch (e) { nm = ""; } if (nm !== "Taro Yamada") return "Taro Yamada"; }
    return "";
  }
  V.phOf = phOf;
  // 署名のかたまり（結びの言葉の後ろ・配信停止の1行の前）を、登録済みの情報の署名に置き換える
  const CLOSE = /^[ \t]*(?:Best regards|Kind regards|Warm regards|Warmest regards|Regards|Best wishes|With best regards|Sincerely(?: yours)?|Yours (?:sincerely|faithfully|truly)|Many thanks|Thank you(?: very much)?|Thanks(?: again)?|Cheers|此致|敬上|顺祝[^\n]{0,8}|順祝[^\n]{0,8}|祝好|Saludos(?: cordiales)?|Atentamente|Cordialmente|Un saludo|Cordialement|Mit freundlichen Grüßen|Atenciosamente|Trân trọng|Hormat kami|ขอแสดงความนับถือ|よろしくお願いいたします|敬具)[,，.!、。]?[ \t]*$/gim;
  function optIdx(b) {
    let cut = -1;
    try { if (typeof V79OB_OPTLINE !== "undefined" && V79OB_OPTLINE) Object.keys(V79OB_OPTLINE).forEach((k) => { const i = b.indexOf(V79OB_OPTLINE[k]); if (i >= 0 && (cut < 0 || i < cut)) cut = i; }); } catch (e) { /* 無い版 */ } // eslint-disable-line no-undef
    return cut;
  }
  function sigBlock(b, st) {
    b = String(b || "");
    const cut = optIdx(b);
    const head = cut >= 0 ? b.slice(0, cut) : b, tail = cut >= 0 ? b.slice(cut) : "";
    let m, last = null; CLOSE.lastIndex = 0;
    while ((m = CLOSE.exec(head))) last = { i: m.index, end: m.index + m[0].length };
    if (last) {
      const after = head.slice(last.end);
      const lines = after.replace(/^\n/, "").split("\n");
      if (lines.filter((l) => l.trim()).length <= 12) return head.slice(0, last.end) + "\n" + st + (tail ? "\n\n" + tail : "\n");
    }
    // 結びの言葉が無い：[Your Name] の行（と続く会社名の行）を署名に、無ければ最後に足す
    let x = head;
    const re = /\[Your Name\][^\n]*(\n[^\n]*)?/i;
    if (re.test(x)) x = x.replace(re, st);
    else x = x.replace(/\s+$/, "") + "\n\n" + st;
    return x + (tail ? "\n\n" + tail : "");
  }
  V.sigBlock = sigBlock;
  wrap("v79obSigApply", (o) => function (m) {
    if (!m) return;
    let s = {};
    try { s = W.v79obSig() || {}; } catch (e) { s = {}; }
    let miss = [];
    try { miss = fn("v79obSigMiss") ? W.v79obSigMiss(s) : []; } catch (e) { miss = []; }
    if (!miss.length) { try { o.apply(this, arguments); } catch (e) { err("sigApply0", e); } }
    try {
      const st = W.v79obSigText(s);
      let b = String(m.body || "");
      const b0 = b;
      if (m.v79sig && m.v79sig !== st && b.includes(m.v79sig)) b = b.split(m.v79sig).join(st);
      else if (!b.includes(st)) b = sigBlock(b, st);
      b = scrub(b, s);
      m.body = b;
      if (b.includes(st)) m.v79sig = st;
      if (b !== b0) { V.n.sig++; m.v101sig = Date.now(); }
    } catch (e) { err("sigApply", e); }
  });
  // 送る前の関所：【…】・仮の値が残っていれば止める（v79obGate が「文面に「…」が残っています」を出す）
  wrap("v79obPh", (o) => function (text) {
    let r = "";
    try { r = o.apply(this, arguments); } catch (e) { r = ""; }
    if (r) return r;
    try { const p = phOf(text); if (p) V.n.ph++; return p; } catch (e) { err("ph", e); return ""; }
  });
  // 前に作った文面も、開くときに署名を作り直す（UAT の前の文面に残った仮の値を消す）
  wrap("v71obOpen", (o) => async function (id) {
    try {
      const x = fn("v71obLead") ? W.v71obLead(id) : null;
      if (x && x.l && x.l.ap && Array.isArray(x.l.ap.seq) && fn("v79obFinish")) { W.v79obFinish(x.l, x.r); if (fn("v71obSave")) W.v71obSave(); }
    } catch (e) { err("open", e); }
    return o.apply(this, arguments);
  });
  // 文面を作ったら：署名をそろえ、表を描き直す（ボタンを「文面を見る」に）
  wrap("v71obApproach", (o) => async function (id) {
    const r = await o.apply(this, arguments);
    try {
      const x = fn("v71obLead") ? W.v71obLead(id) : null;
      if (x && x.l && x.l.ap && fn("v79obFinish")) W.v79obFinish(x.l, x.r);
      clearTimeout(V.paintT);
      V.paintT = setTimeout(() => { try { if (document.getElementById("v71obIn") && fn("v71obPaint")) W.v71obPaint(); } catch (e) { /* 無視 */ } }, 60);
    } catch (e) { err("approach", e); }
    return r;
  });

  /* ═════════ No.623 文面の有無（その会社の文面 L.ap だけで決める）═════════ */
  V.apState = function (L) {
    if (!L) return "new";
    if (Array.isArray(L.sent) && L.sent.length) return "sent";
    return L.ap && Array.isArray(L.ap.seq) && L.ap.seq.some((m) => m && String(m.body || "").trim()) ? "draft" : "new";
  };

  /* ═════════ No.622 件数：表に並ぶ社数（届かず外した会社を除く）═════════ */
  function obCount(run) {
    const L = (run && Array.isArray(run.leads)) ? run.leads : [];
    const shown = L.filter((l) => l && !l.v79x).length;
    const gone = L.filter((l) => l && l.v79x).length;
    const v = (run && run.v101) || {};
    const asked = +(v.asked || (run && run.n) || 0) || 0;
    const aiN = v.aiN == null ? null : +v.aiN;
    const unchk = L.filter((l) => l && !l.v79x && !l.smp && !(l.v79u && /^(ok|redir)$/.test(l.v79u.st)) && !l.v79ok).length;
    return { shown, gone, total: L.length, asked, aiN, named: L.length, unchk, smp: L.length && L.every((l) => l && l.smp) };
  }
  V.obCount = obCount;
  function wrapDbList() {
    try {
      const A = W.v92r6a;
      if (!A || typeof A.dbList !== "function" || A.dbList.__v101buyer) return;
      const o = A.dbList;
      A.dbList = function () {
        const r = o.apply(this, arguments);
        try {
          const t = ten(); const runs = (t && t.v71ob && t.v71ob.runs) || []; const last = runs[runs.length - 1];
          if (last && Array.isArray(last.leads)) { const c = obCount(last); return Object.assign({}, r || {}, { n: c.shown, all: c.total, gone: c.gone, asked: c.asked, aiN: c.aiN }); }
        } catch (e) { err("dbList", e); }
        return r;
      };
      A.dbList.__v101buyer = 1;
    } catch (e) { err("wrapDbList", e); }
  }
  wrapDbList();
  setTimeout(wrapDbList, 1500);
  // AI が答えた件数（社名の無いものを含む）を控える
  wrap("v71obJson", (o) => function () {
    const j = o.apply(this, arguments);
    try { if (V.building && j && Array.isArray(j.leads)) { V.building.aiN = j.leads.length; V.building.aiNamed = j.leads.filter((x) => x && String(x.name || "").trim()).length; } } catch (e) { err("json", e); }
    return j;
  });
  // AI のリストの答えに付いた Web の出どころ（cits）を控える（URL の無い会社の候補に使う）
  wrap("llmAsk", (o) => function (q, mx, opt) {
    const r = o.apply(this, arguments);
    try {
      if (opt && opt.task === "ob" && /アプローチ先リスト/.test(String(opt.sys || "")) && r && typeof r.then === "function") {
        r.then((x) => { try { const C = (x && Array.isArray(x.cits)) ? x.cits : []; V.obCits = { at: Date.now(), cits: C.map((c) => typeof c === "string" ? c : (c && (c.url || c.u || c.uri || c.link)) || "").filter((u) => /^https?:\/\//.test(u)) }; } catch (e) { /* 無視 */ } }, () => {});
      }
    } catch (e) { err("llmAsk", e); }
    return r;
  });
  // リストを作る：トーストを「表に出した社数」でまとめて1つに。頼んだ数・AI が挙げた数を run.v101 に残す
  wrap("v71obToast", (o) => function (s) {
    try { if (V.building) { V.building.toasts.push(String(s || "")); return; } } catch (e) { /* 無視 */ }
    return o.apply(this, arguments);
  });
  wrap("v71obBuild", (o) => async function () {
    if (V.building) return o.apply(this, arguments);
    let f = null; try { f = fn("v71obReadForm") ? W.v71obReadForm() : null; } catch (e) { f = null; }
    let before = null; try { before = fn("v71obRun") ? W.v71obRun() : null; } catch (e) { before = null; }
    V.obCits = null;
    V.building = { asked: (f && +f.n) || 10, cty: f && f.cty, toasts: [], at: Date.now() };
    const B = V.building;
    let r;
    try { r = await o.apply(this, arguments); }
    finally {
      V.building = null;
      try {
        const run = fn("v71obRun") ? W.v71obRun() : null;
        if (run && run !== before) {
          run.v101 = Object.assign({}, run.v101 || {}, { asked: B.asked, aiN: B.aiN == null ? null : B.aiN, aiNamed: B.aiNamed == null ? null : B.aiNamed, at: Date.now() });
          if (fn("v71obSave")) W.v71obSave();
          if (fn("v71obPaint")) W.v71obPaint();
          const c = V.obCount ? V.obCount(run) : obCount(run); // 22.01.1：確かめに失敗した会社を「確かめられなかった」と二重に数えない
          const tl = B.toasts.filter(Boolean);
          let msg = "";
          if (run.how === "ai" && !run.v100) {
            msg = F(M("AI が挙げた {a}社のうち、表に {s}社を出しました", "Of the {a} companies the AI listed, {s} are shown in the table"), { a: c.total, s: c.shown });
            if (c.gone) msg += F(M("（公式サイトに届かない {g}社は外しました）", " ({g} removed: website unreachable)"), { g: c.gone });
            if (c.asked && c.total < c.asked) msg += F(M("。頼んだのは {n}社でしたが、AI が挙げたのは {a}社でした", ". You asked for {n}; the AI listed {a}"), { n: c.asked, a: c.total });
            if (c.unchk) msg += F(M("。公式サイトを確かめられなかった {u}社は下に並べています", ". {u} not verified on their website are listed at the bottom"), { u: c.unchk });
            const ng = tl.find((x) => /確かめられませんでした|could not be checked|Could not check/i.test(x));
            const sp = tl.find((x) => /5社ずつに分けて確かめ直しました|groups of 5/.test(x));
            const end = (x) => (/[。.!?！？]\s*$/.test(x) ? x + " " : x + M("。", ". "));
            if (sp) msg = end(sp) + msg;
            else if (ng) msg = end(ng) + msg;
          } else msg = tl[tl.length - 1] || "";
          if (msg) { try { if (typeof toast === "function") toast(msg); } catch (e) { /* 無視 */ } } // eslint-disable-line no-undef
          log({ k: "build", asked: B.asked, aiN: B.aiN, total: c.total, shown: c.shown, gone: c.gone });
        } else if (B.toasts.length) { try { if (typeof toast === "function") toast(B.toasts[B.toasts.length - 1]); } catch (e) { /* 無視 */ } } // eslint-disable-line no-undef
      } catch (e) { err("buildAfter", e); }
    }
    return r;
  });

  /* ═════════ No.597 公式サイトの確かめ：候補 URL の探し方・時間切れの確かめ直し・並べ方 ═════════ */
  const GENW = new Set("ltd limited co company corp corporation inc group holdings holding international intl trading trade traders import importer importers imports export exports the and of hong kong hk singapore sg taiwan tw taipei pte pvt sdn bhd llc gmbh enterprise enterprises industries industrial services service global asia asian pacific distribution distributors distributor supply supplies store stores shop shops online retail foods food products product toys toy pet pets beauty medical auto parts japan japanese china shanghai limited. co. www com net org".split(" "));
  const BADHOST = /(^|\.)(linkedin|facebook|instagram|twitter|x|youtube|tiktok|wikipedia|hktdc|yellowpages|yp|alibaba|aliexpress|amazon|ebay|made-in-china|globalsources|indiamart|tradeindia|bloomberg|dnb|zoominfo|crunchbase|opencorporates|companieshouse|sgpbusiness|opengovsg|recordowl|checkcompany|kompass|europages|glassdoor|indeed|jobsdb|jobstreet|google|bing|duckduckgo|yahoo|baidu|mapquest|tripadvisor|shopee|lazada|carousell|rakuten|reddit|medium|pinterest)\.[a-z.]+$/i;
  function nameToks(nm) { return String(nm || "").toLowerCase().replace(/^\[見本\]\s*/, "").replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((w) => w.length >= 3 && !GENW.has(w)); }
  function hostOf(u) { try { return new URL(u).hostname.toLowerCase().replace(/^www\./, ""); } catch (e) { return ""; } }
  function originOf(u) { try { const x = new URL(u); return x.protocol === "https:" || x.protocol === "http:" ? x.protocol + "//" + x.hostname.toLowerCase() + "/" : ""; } catch (e) { return ""; } }
  function hostScore(host, toks) {
    if (!host || BADHOST.test(host)) return 0;
    const h = host.split(".")[0].replace(/[^a-z0-9]/g, "");
    let sc = 0; toks.forEach((t) => { if (h.indexOf(t) >= 0) sc += t.length >= 5 ? 2 : 1; });
    const ac = toks.map((t) => t[0]).join(""); if (ac.length >= 3 && h === ac) sc += 1; // 頭文字（例：Pet Care Trading → pct）
    return sc;
  }
  V.nameToks = nameToks; V.hostScore = hostScore;
  function candFromCits(L, cits) {
    const toks = nameToks(L.name);
    if (!toks.length) return "";
    let best = "", bs = 0;
    (cits || []).forEach((u) => { const h = hostOf(u); const sc = hostScore(h, toks); if (sc >= 2 && sc > bs && originOf(u)) { bs = sc; best = originOf(u); } });
    return best;
  }
  async function candFromSearch(L, ms) {
    if (typeof rsSearch !== "function") return { u: "", why: "nosearch" }; // eslint-disable-line no-undef
    const toks = nameToks(L.name);
    if (!toks.length) return { u: "", why: "noname" };
    const q = '"' + String(L.name || "").replace(/^\[見本\]\s*/, "").slice(0, 80) + '" ' + String(L.city || "").slice(0, 30) + " official site";
    try {
      const res = await Promise.race([rsSearch(q, 6), new Promise((_, rj) => setTimeout(() => rj(new Error("timeout")), ms || 15000))]); // eslint-disable-line no-undef
      let best = "", bs = 0;
      (res || []).forEach((x) => { const h = hostOf(x && x.u); const sc = hostScore(h, toks); if (sc >= 2 && sc > bs && originOf(x.u)) { bs = sc; best = originOf(x.u); } });
      return { u: best, why: best ? "" : ((res || []).length ? "nomatch" : "noresult") };
    } catch (e) { return { u: "", why: /timeout/.test(String(e && e.message)) ? "timeout" : "error" }; }
  }
  V.candFromCits = candFromCits; V.candFromSearch = candFromSearch;
  async function fillUrls(run) {
    const L = (run.leads || []).filter((l) => l && !l.smp && !l.v79x && !String(l.url || "").trim() && !l.v101url);
    if (!L.length) return;
    const cits = (V.obCits && Date.now() - V.obCits.at < 15 * 60e3) ? V.obCits.cits : [];
    L.forEach((l) => { const u = candFromCits(l, cits); if (u) { l.url = u; l.v101url = { src: "cits", at: Date.now(), host: hostOf(u) }; V.n.candHit++; } });
    const rest = L.filter((l) => !l.url).slice(0, 8);
    if (!rest.length || V.noSearch) return;
    V.n.cand += rest.length;
    const t0 = Date.now();
    const res = await Promise.all(rest.map((l) => candFromSearch(l, 15000)));
    rest.forEach((l, i) => {
      const x = res[i];
      if (x && x.u) { l.url = x.u; l.v101url = { src: "search", at: Date.now(), host: hostOf(x.u) }; V.n.candHit++; }
      else l.v101url = { src: "none", why: (x && x.why) || "noresult", at: Date.now() };
    });
    log({ k: "cand", n: rest.length, ms: Date.now() - t0, hit: rest.filter((l) => l.url).length });
  }
  function grp(l) {
    if (!l || l.smp) return 0;
    if (l.v79x) return 9;
    const st = l.v79u && l.v79u.st;
    let ver = false; try { ver = fn("v79obVerified") ? !!W.v79obVerified(l) : st === "ok"; } catch (e) { ver = st === "ok"; }
    if (l.v79ok || (st === "ok" && ver)) return 0;
    if (st === "ok") return 1;
    if (st === "redir") return 2;
    return 3;
  }
  V.grp = grp;
  function orderLeads(run) {
    if (!run || !Array.isArray(run.leads) || run.how === "smp") return false;
    const L = run.leads.map((l, i) => ({ l, i, g: grp(l) }));
    L.sort((a, b) => (a.g - b.g) || ((+b.l.pts || 0) - (+a.l.pts || 0)) || (a.i - b.i));
    const ch = L.some((x, i) => x.l !== run.leads[i]);
    if (ch) { run.leads = L.map((x) => x.l); V.n.order++; }
    return ch;
  }
  V.orderLeads = orderLeads;
  // 確かめられなかった理由（行に出す）
  V.whyNot = function (l, run) {
    if (!l || l.smp || l.v79x) return "";
    const st = l.v79u && l.v79u.st;
    if (l.v79ok || st === "ok" || st === "redir") return "";
    const c = run && run.v100chk;
    if (!st && c && c.capped) return M("今日の確かめの上限のため、まだ確かめていません（0時〈日本時間〉以降に「確かめ直す」）", "Not checked yet: today's check limit was reached (use “Check again” after midnight JST)");
    if (!String(l.url || "").trim()) {
      const w = l.v101url && l.v101url.why;
      return w === "nosearch" || w === "noname" ? M("公式サイトの URL がありません（AI が挙げませんでした）。会社名で調べてください", "No website URL (the AI did not give one). Search by the company name")
        : M("公式サイトの URL がありません（AI が挙げず、検索でも見つかりませんでした）。会社名で調べてください", "No website URL (not given by the AI and not found by search). Search by the company name");
    }
    if (st === "err") {
      const w = String((l.v79u && l.v79u.why) || ""), code = +((w.match(/^http(\d{3})$/) || [])[1] || (l.v79u && l.v79u.code) || 0);
      const tw = l.v101retry ? M("（2回試しました）", " (tried twice)") : "";
      if (code === 401 || code === 403) return M("公式サイトが、自動の確かめを受け付けませんでした。ブラウザで開いて確かめてください", "The website refused the automatic check. Open it in your browser to check");
      if (code >= 500) return M("公式サイトのサーバーがエラーを返しました", "The website's server returned an error") + tw;
      if (/time|abort/i.test(w)) return M("公式サイトが時間内に答えませんでした", "The website did not respond in time") + tw;
      if (!code) return M("公式サイトにつながりませんでした", "Could not connect to the website") + tw;
      return M("公式サイトを確かめられませんでした", "Could not check the website") + tw;
    }
    if (st === "bad") return M("URL の形が正しくありません", "The URL is not valid");
    if (st === "none") return M("公式サイトの URL がありません", "No website URL");
    return M("公式サイトを、まだ確かめていません", "The website has not been checked yet");
  };
  wrap("v79obCheck", (o) => async function (run, quiet) {
    if (!run || run.how === "smp" || V.inRetry) return o.apply(this, arguments);
    try { await fillUrls(run); } catch (e) { err("fillUrls", e); }
    const r = await o.apply(this, arguments);
    try {
      // 時間切れ・サーバーのエラーの会社は、1回だけ確かめ直す（上限の取り置きは v100 の層がする）
      // 401・403 など「断られた」サイトは、もう一度頼んでも同じなので確かめ直さない（時間切れ・5xx・不明だけ）
      const again = (l) => { const w = String((l.v79u && l.v79u.why) || ""); const c = +((w.match(/^http(\d{3})$/) || [])[1] || (l.v79u && l.v79u.code) || 0); return !(c >= 400 && c < 500 && c !== 408 && c !== 429); };
      const errs = (run.leads || []).filter((l) => l && !l.smp && !l.v79x && l.v79u && l.v79u.st === "err" && !l.v101retry && String(l.url || "").trim() && again(l)).slice(0, 5);
      if (errs.length) {
        errs.forEach((l) => { l.v101retry = 1; });
        V.n.retry += errs.length;
        await new Promise((res) => setTimeout(res, 1500));
        const sub = { how: run.how, cty: run.cty, at: run.at, leads: errs };
        V.inRetry = 1;
        try { await o.call(this, sub, true); } finally { V.inRetry = 0; }
        log({ k: "retry", n: errs.length, ok: errs.filter((l) => l.v79u && l.v79u.st === "ok").length });
      }
      // 検索で見つけた URL は、確かめても「要確認」の札は外さない（社名との一致を本人が確かめる）
      (run.leads || []).forEach((l) => { if (l && l.v101url && l.v101url.src === "search") l.verify = true; });
      orderLeads(run);
      if (fn("v71obSave")) W.v71obSave();
      if (fn("v71obPaint")) W.v71obPaint();
    } catch (e) { err("checkAfter", e); }
    return r;
  });

  /* ═════════════════════════════════════════════════════════════════════════════════════════════
     22.01.1（22.01 の公開後の検証で見つけた所の直し）
     ═════════════════════════════════════════════════════════════════════════════════════════════ */
  V.ver = "22.01.1";
  Object.assign(V.n, { unkFix: 0, unkHit: 0, unkCtx: 0, chkBusy: 0, chkSplit: 0, chkWhy: 0, epaFlag: 0 });
  function djb(s) { let h = 5381; s = String(s || ""); for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }

  /* ═════════ v2-2：バイヤー宛ての文面（AI バイヤー開拓の文面・DM・返信の案）で、「不明」と答えた事柄・未登録の原産地を断定しない ═════════
     原因：618 の直し（fact の担当）は英語の営業資料・表紙の見本・書類だけ。AI バイヤー開拓の文面は AI が別に書く（v71obApproach）ので、
           F の繁體中文の文面に「可對應主要汽車品牌車款」（登録の強み「主要メーカー対応」の訳）が残った。照合の仕組みは文面には掛かっていなかった。
     直し：①AI への頼み（v71obCtx の商品の段）に「不明」と答えた事柄を書く（頼みの文だけには頼らない）
           ②文面ができたら（v79obFinish）、文の中の断定を入力と突き合わせて直す：英・中（繁・簡）・西・日の言い回しで、
             「不明」と答えた話題（fact の担当の unkTopics と同じ話題：適合・アスベスト不使用・原産地・ハラール・有機・OEM・生産能力・認証の名前）の断定の句を外し、
             その話題の「待確認／to be confirmed／por confirmar」を1回だけ書く（同じ文の中で「確認」とすでに書いていれば足さない）。NAO などの材質名は残し、証明は要確認と付ける。
           ③利用者が手で直した文面は勝手に書き換えない（知らせだけ出す）。DM・返信の AI の案も同じ直しを掛ける（rd_v101buyer.js） */
  function unkFallback(T) {
    const out = [], qs = [];
    const UNKW = /(?:わから|分から|不明|未定|未確認|知らない|unknown|not sure)/i;
    (Array.isArray(T.extraQA) ? T.extraQA : []).forEach((x) => { if (x && x.q && UNKW.test(String(x.a || "")) && String(x.a).length <= 30) qs.push(String(x.q)); });
    (Array.isArray(T.v101unk) ? T.v101unk : []).forEach((u) => { if (u && u.q) qs.push(String(u.q)); });
    const add = (k, lab, q, o) => { if (!out.some((x) => x.k === k)) out.push(Object.assign({ k, lab, q, a: "不明" }, o || {})); };
    // 22.01.3 x2-1：問いの言い方に左右されない（「適合車種・年式・型式・純正互換番号」「対応車種」「fitment」「compatible」も適合）
    // 22.01.3：hear の担当が問いに付けた事柄の印（TEN.extraQA[i].v101tp・window.v101qaTopics(問い)）も並べて使う（どちらかで当たれば「不明」の事柄）
    const tpOf = (x) => { let a = []; try { if (x && Array.isArray(x.v101tp)) a = a.concat(x.v101tp); } catch (e) { /* 無視 */ } try { if (x && x.q && typeof W.v101qaTopics === "function") { const r = W.v101qaTopics(String(x.q)); if (Array.isArray(r)) a = a.concat(r); } } catch (e) { /* 無視 */ } return a.map((k) => String((k && k.k) || k)); };
    (Array.isArray(T.extraQA) ? T.extraQA : []).concat(Array.isArray(T.v101unk) ? T.v101unk : []).forEach((x) => {
      if (!x || !x.q) return;
      if (x.a != null && !(UNKW.test(String(x.a)) && String(x.a).length <= 30)) return;
      const tp = tpOf(x);
      if (tp.includes("fit")) add("fit", "適合（車種・機種・品番）", String(x.q));
      if (tp.includes("asbestos")) add("asbestos", "アスベスト不使用", String(x.q));
    });
    qs.forEach((q) => { if (/適合|車種|対応車|対応機種|適用機種|適用車|互換|純正品番|純正番号|fitment|compatib|applicable\s+(?:vehicle|model)/i.test(q)) add("fit", "適合（車種・機種・品番）", q); if (/アスベスト|石綿|asbestos/i.test(q)) add("asbestos", "アスベスト不使用", q); });
    let O = null; try { O = fn("v101origin") ? W.v101origin(T) : null; } catch (e) { O = null; }
    const known = O ? !!O.known : !!(String(T.origin || "").trim() && !UNKW.test(String(T.origin)));
    if (!known) add("origin", "原産国・製造国", "原産地・製造国", { origin: 1 });
    return out;
  }
  function unkTopicsOf(T) {
    T = T || ten();
    if (!T) return [];
    let L = null;
    try { if (W.V101FACT && typeof W.V101FACT.unkTopics === "function") L = W.V101FACT.unkTopics(T) || []; } catch (e) { err("unkTopics", e); L = null; }
    if (!L) L = unkFallback(T);
    else {
      // 22.01.3 x2-1：fact の見分けは問いの言い方で適合を落とすことがある（x2：「FP-201の適合車種・年式・型式・純正互換番号を…」→「不明」を見分けなかった）。
      // 問いの言葉から見分けた適合・アスベストを足す（原産地は fact の判定のまま。足すのは fact に無い話題だけ）
      try { unkFallback(T).forEach((x) => { if ((x.k === "fit" || x.k === "asbestos") && !L.some((y) => y && y.k === x.k)) L = L.concat([Object.assign({ v101q: 1 }, x)]); }); } catch (e) { err("unkTopics2", e); }
    }
    return L.filter((x) => x && x.k && x.k !== "shelflife");
  }
  V.unkTopicsOf = unkTopicsOf;
  // 文の言語（文面の言語の名前 hint を先に、無ければ文字から）：en・zht（繁）・zhs（簡）・es・ja
  const ZHT = /[們這為與貴車產國請對應裝價時間際關於會個發開門東來說樣點業務經過還讓從處單號額質機現圍種輪級齊廠歐韓檢證書]/g;
  const ZHS = /[们这为与贵车产国请对应装价时间际关于会个发开门东来说样点业务经过还让从处单号额质机现围种轮级齐厂欧韩检证书]/g;
  function zhKind(t, hint) { const a = (String(t).match(ZHT) || []).length, b = (String(t).match(ZHS) || []).length; if (a > b) return "zht"; if (b > a) return "zhs"; return /繁|Traditional|Hant|台|臺|香港|HK|TW/i.test(String(hint || "")) ? "zht" : "zhs"; }
  function langOf(t, hint) {
    const s = String(t || ""), h = String(hint || "");
    if (/[ぁ-ゖ]/.test(s) || (/[ァ-ヺー]{2,}/.test(s) && !/[們这們這]/.test(s))) return "ja";
    if (/[一-龥]/.test(s)) return zhKind(s, h);
    if (/[ñ¿¡áéíóú]/i.test(s) || /\b(?:para|con|nuestros?|nuestras?|productos?|empresa|marcas|sin|por)\b/i.test(s)) return "es";
    if (/Españ|Spanish|西/.test(h) && !/[A-Za-z]{3,}\s+(?:the|and|of|with)\b/.test(s)) return "es";
    return "en";
  }
  V.langOf = langOf;
  // 話題ごとの断定の言い回し（言語ごと）
  const CL = {
    fit: {
      en: [/\b(?:compatible|compatibility|fits?|fitting|suitable|suits?|designed|applicable|available)\s+(?:with|for|to|on)?\s*(?:the\s+)?(?:(?:most|all|major|leading|many|popular|main|various|numerous|a\s+wide\s+range\s+of|a\s+broad\s+range\s+of)\s+){1,3}(?:of\s+the\s+)?(?:japanese\s+|european\s+|asian\s+|korean\s+|german\s+|american\s+)?(?:passenger[- ]car\s+|car\s+|vehicle\s+|auto(?:motive)?\s+|automobile\s+)?(?:makers?|brands?|manufacturers?|models?|OEMs?|vehicles?|cars?|makes)\b/i,
        /\b(?:supports?|covers?|covering|fits?|suits?)\s+(?:the\s+)?(?:(?:most|all|major|leading|many|popular|main|various|numerous|a\s+wide\s+range\s+of|a\s+broad\s+range\s+of)\s+){1,3}(?:japanese\s+|european\s+|asian\s+)?(?:passenger[- ]car\s+|car\s+|vehicle\s+|auto(?:motive)?\s+|automobile\s+)?(?:makers?|brands?|manufacturers?|models?|OEMs?|vehicles?|cars?|makes)\b/i,
        /\b(?:major|leading|main|popular)\s+(?:japanese\s+|european\s+)?(?:passenger[- ]car\s+|car\s+|vehicle\s+|auto(?:motive)?\s+|automobile\s+)?(?:makers?|brands?|manufacturers?|OEMs?)\s+(?:support|coverage|compatib\w+|fitment|applications?)\b/i,
        /\bOEM[- ](?:equivalent|replacement|compatible)\b|\bdirect[- ]fit\b|\bwide\s+(?:application|vehicle|model)\s+coverage\b|\bmulti[- ](?:vehicle|model)\s+(?:fit|compatib\w+)\b/i],
      zh: [/(?:對應|对应|適用|适用|適配|适配|兼容|相容|匹配|支援|支持|配合|涵蓋|涵盖|覆蓋|覆盖)\s*(?:於|于)?\s*(?:市面上|市場上|市场上)?(?:的)?(?:主要|主流|多數|多数|大多數|大多数|大部分|各大|眾多|众多|多款|多種|多种|全部|所有|各種|各种|常見|常见|日系|歐系|欧系|德系|美系|韓系|韩系|日本|歐洲|欧洲)[^。；;！!？?\n，,（(]{0,12}?(?:品牌|廠牌|厂牌|車廠|车厂|製造商|制造商|車款|车款|車型|车型|車種|车种|車系|车系|機種|机种|機型|机型)/,
        /(?:主要|主流|各大|多數|多数|眾多|众多)(?:汽車|汽车|車|车)?(?:品牌|廠牌|厂牌|車廠|车厂|製造商|制造商)(?:車款|车款|車型|车型)?\s*(?:均|皆|都)?\s*(?:可|能)?\s*(?:適用|适用|對應|对应|使用|安裝|安装|兼容)/,
        /原廠同等|原厂同等|OEM\s*同等|直接替換|直接替换|多車種適用|多车种适用/],
      es: [/\bcompatibles?\s+con\s+(?:la\s+mayor[ií]a|las\s+principales|los\s+principales|muchas|muchos|numerosas|numerosos|diversas|diversos|todas|todos)\b/i, /\b(?:las|los)\s+principales\s+(?:marcas|fabricantes)\b/i, /\b(?:apto|aptas?|v[aá]lido|adecuado)s?\s+para\s+(?:la\s+mayor[ií]a|las\s+principales|los\s+principales|todos?\s+los)\b/i, /\bequivalente\s+(?:a\s+)?OEM\b/i],
      ja: [/主要(?:な)?(?:自動車)?メーカー(?:に)?対応|主要メーカー(?:の車種)?に対応|主要車種(?:に)?対応|多車種(?:に)?対応|幅広い車種(?:に)?対応|全車種(?:に)?対応|純正同等|主要メーカー対応/] },
    asbestos: {
      en: [/\bnon-?asbestos\b(?:\s+organic)?|\basbestos[- ]free\b(?!\s+certificate)|\bfree\s+(?:of|from)\s+asbestos\b|\b(?:without|no|zero|contains?\s+no)\s+asbestos\b/i],
      zh: [/(?:無石棉|无石棉|不含石棉|零石棉|非石棉)(?!證明|证明)/], es: [/(?<!certificado\s)\bsin\s+(?:amianto|asbesto)\b|\blibre\s+de\s+(?:amianto|asbesto)\b|\bno\s+contiene\s+(?:amianto|asbesto)\b/i],
      ja: [/ノンアスベスト|アスベスト(?:不使用|フリー|を含まない|ゼロ|なし)(?!の証明)|石綿(?:不使用|を含まない)|非石綿/] },
    origin: {
      en: [/\bmade\s+in\s+japan\b|\bjapan(?:ese)?[- ]made\b|\b(?:produced|manufactured|made|crafted|built|brewed|processed|assembled)\s+(?:\w+\s+){0,2}in\s+(?:[A-Z][\w-]+(?:\s+Prefecture)?\s*,\s*)?japan\b|\bjapan(?:ese)?\s+quality\b|\bjapanese[- ]origin\b|\bproducts?\s+of\s+japan\b/i],
      zh: [/日本(?:製造|制造|生產|生产|製(?!造)|制(?!造))(?![商業业者廠厂家])|(?:產|产)(?:自|於|于)日本|日本原(?:裝|装)|日本(?:品質|品质)|在日本(?:製造|制造|生產|生产|加工|製作|制作)|日本(?:國產|国产)/],
      es: [/\b(?:hecho|hecha|fabricad[oa]s?|producid[oa]s?|elaborad[oa]s?)\s+en\s+jap[oó]n\b|\bde\s+origen\s+japon[eé]s\b|\bcalidad\s+japonesa\b/i],
      ja: [/日本製|国産(?!化)|国内(?:で)?(?:生産|製造)|日本国内の工場で(?:生産|製造)/] },
    halal: { en: [/\bhalal\b/i], zh: [/清真|halal/i], es: [/\bhalal\b/i], ja: [/ハラ[ーｰ]?ル/] },
    organic: { en: [/\borganic\b/i], zh: [/有機|有机/], es: [/\borg[aá]nic[oa]s?\b/i], ja: [/有機|オーガニック/] },
    oem: { en: [/\b(?:OEM|ODM|private[- ]label)\b/i], zh: [/OEM|ODM|代工|貼牌|贴牌/], es: [/\b(?:OEM|ODM|marca\s+(?:blanca|propia|privada))\b/i], ja: [/OEM|ODM|PB|受託/] },
    capacity: { en: [/\b(?:monthly|annual|production)\s+capacity\b|\bstable\s+supply\b|\blarge[- ]volume\s+supply\b/i], zh: [/[月年]?(?:產能|产能)|穩定供(?:貨|應)|稳定供(?:货|应)|大量供(?:應|应)/], es: [/\bcapacidad\s+de\s+producci[oó]n\b|\bsuministro\s+estable\b/i], ja: [/生産能力|月産|年産|安定供給/] }
  };
  // 「確認する」の言い回し（断定ではない・この句と同じ節にあれば外さない）
  const HEDGE = /to be confirmed|\bTBC\b|\bunconfirmed\b|not (?:yet )?(?:confirmed|verified)|待確認|待确认|需[^。；;\n，,]{0,6}確認|需[^。；;\n，,]{0,6}确认|須[^。；;\n，,]{0,6}確認|须[^。；;\n，,]{0,6}确认|確認後|确认后|請(?:告知|提供)|请(?:告知|提供)|(?:we|I)\s+(?:will|can|would|'ll|shall)\s+(?:be\s+(?:happy|glad)\s+to\s+)?(?:confirm|check|verify)|(?:please|kindly)\s+(?:share|provide|send|let\s+us\s+know|tell\s+us|advise)|subject\s+to\s+confirmation|por\s+confirmar|a\s+confirmar|confirmaremos|pendiente\s+de\s+confirmaci|要確認|確認中|確認します|ご確認|未確認|certificate:\s*to be confirmed/i;
  V.HEDGE = HEDGE;
  // はっきり「確認が要る・未確認」と書いている（「待確認」を足さなくてよい）。「請告知車型」のような頼みだけでは足す
  const HEDGE2 = /to be confirmed|\bTBC\b|\bunconfirmed\b|not (?:yet )?(?:confirmed|verified)|待確認|待确认|需[^。；;\n，,]{0,6}確認|需[^。；;\n，,]{0,6}确认|須[^。；;\n，,]{0,6}確認|须[^。；;\n，,]{0,6}确认|確認後|确认后|(?:we|I)\s+(?:will|can|would|'ll|shall)\s+(?:be\s+(?:happy|glad)\s+to\s+)?(?:confirm|check|verify)|subject\s+to\s+confirmation|por\s+confirmar|a\s+confirmar|confirmaremos|pendiente\s+de\s+confirmaci|要確認|確認中|未確認/i;
  // 話題の語（同じ行で「確認」と書いているかを見る）
  const TOPW = { fit: /車型|车型|車款|车款|適用|适用|適配|适配|model|vehicle|fitment|compatib|modelo|veh[ií]culo|車種|機種|品番|part number|零件號碼|零件号码/i, asbestos: /石棉|asbestos|amianto|asbesto|アスベスト|石綿/i, origin: /原產|原产|原産|origin|origen|製造國|制造国/i };
  function vehOf(T, tp) { return /車|vehicle|car\b/i.test(String((tp && tp.q) || "") + " " + String((T && (T.cat || T.catKey)) || "") + " " + String((T && T.item) || "")); }
  function tbcText(tp, lg, T) {
    const k = tp.k;
    const veh = vehOf(T, tp);
    const P = {
      fit: veh ? { en: "Applicable vehicle models: to be confirmed", zht: "適用車型：待確認", zhs: "适用车型：待确认", es: "Modelos de vehículo compatibles: por confirmar", ja: "適合車種：要確認" }
        : { en: "Compatible models: to be confirmed", zht: "適用機型：待確認", zhs: "适用机型：待确认", es: "Modelos compatibles: por confirmar", ja: "適合機種：要確認" },
      asbestos: { en: "asbestos-free certificate: to be confirmed", zht: "無石棉證明：待確認", zhs: "无石棉证明：待确认", es: "certificado sin amianto: por confirmar", ja: "アスベスト不使用の証明：要確認" },
      origin: { en: "Country of origin: to be confirmed", zht: "原產國：待確認", zhs: "原产国：待确认", es: "País de origen: por confirmar", ja: "原産国：要確認" },
      halal: { en: "Halal certification: to be confirmed", zht: "清真認證：待確認", zhs: "清真认证：待确认", es: "Certificación halal: por confirmar", ja: "ハラール認証：要確認" },
      organic: { en: "Organic certification: to be confirmed", zht: "有機認證：待確認", zhs: "有机认证：待确认", es: "Certificación orgánica: por confirmar", ja: "有機の認証：要確認" },
      oem: { en: "OEM / private label: to be confirmed", zht: "OEM／貼牌：待確認", zhs: "OEM／贴牌：待确认", es: "OEM / marca blanca: por confirmar", ja: "OEM・PB の受託：要確認" },
      capacity: { en: "Production capacity: to be confirmed", zht: "產能：待確認", zhs: "产能：待确认", es: "Capacidad de producción: por confirmar", ja: "生産能力：要確認" }
    };
    const o = P[k] || { en: String(tp.lab || "") + ": to be confirmed", zht: String(tp.lab || "") + "：待確認", zhs: String(tp.lab || "") + "：待确认", es: String(tp.lab || "") + ": por confirmar", ja: String(tp.lab || "") + "：要確認" };
    return o[lg] || o.en;
  }
  V.tbcText = tbcText;
  function claimRes(tp, lg) {
    if (CL[tp.k]) { const c = CL[tp.k]; return (c[lg === "zht" || lg === "zhs" ? "zh" : lg] || []).concat(lg === "en" ? [] : (c.en || [])); }
    if (tp.en instanceof RegExp) return [tp.en]; // 認証・試験の名前（ISO 13485・BFE など）は言語によらない
    return [];
  }
  function claimHit(tp, s, lg) {
    const L = claimRes(tp, lg);
    for (const re of L) { re.lastIndex = 0; const m = String(s).match(re); if (m) return m[0]; }
    if (tp.k === "origin" && lg === "en") { try { if (W.V101FACT && typeof W.V101FACT.originHits === "function" && W.V101FACT.originHits(s)) return "origin"; } catch (e) { /* 無視 */ } }
    return "";
  }
  // 文に分ける（。！？!?；; と、英語の「. 」＋大文字。略語では切らない）
  function sents2(s) {
    const out = []; let cur = "";
    const t = String(s || "");
    for (let i = 0; i < t.length; i++) {
      const ch = t[i]; cur += ch;
      if (/[。！？!?；;]/.test(ch)) { while (i + 1 < t.length && /[\s」』”"）)]/.test(t[i + 1]) && !/\n/.test(t[i + 1])) { cur += t[++i]; } out.push(cur); cur = ""; continue; }
      if (ch === "." && (i === t.length - 1 || (/\s/.test(t[i + 1] || "") && /[A-Z¿¡"“(]/.test(t[i + 2] || ""))) && !/\b(?:Co|Ltd|Inc|No|e\.g|i\.e|approx|U\.S|Mr|Ms|Dr|vs|etc|Corp|St)\.$/i.test(cur)) { if (i + 1 < t.length) cur += t[++i]; out.push(cur); cur = ""; }
    }
    if (cur) out.push(cur);
    return out;
  }
  // 節に分ける（，,；;（）():：）。区切りは奇数の番号に
  const SUBSEP = /([，,；;（）()：:])/;
  function tidy(s, lg) {
    let x = String(s);
    x = x.replace(/[（(]\s*[)）]/g, "").replace(/([，,；;：:])\s*([，,；;。.!?！？])/g, "$2").replace(/^[\s，,；;：:、]+/, "").replace(/[\s，,；;：:、]+([。.!?！？]?)\s*$/, "$1").replace(/\s{2,}/g, " ").replace(/\s+([,.;:!?)])/g, "$1");
    if (lg === "en" || lg === "es") { x = x.replace(/^(?:and|but|while|so|which|that|y|pero|que)\s+/i, ""); if (/^[a-z]/.test(x)) x = x.charAt(0).toUpperCase() + x.slice(1); }
    return x;
  }
  function meaningful(s, lg) { const t = String(s || "").replace(/[\s。.!?！？，,；;：:、・•\-*（）()]/g, ""); if (!t) return false; return (lg === "en" || lg === "es") ? String(s).trim().split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length >= 3 : t.length >= 3; }
  function nonEmpty(s, lg) { const t = String(s || "").replace(/[\s。.!?！？，,；;：:、・•\-*（）()]/g, ""); return (lg === "en" || lg === "es") ? /[A-Za-z]{2,}/.test(t) : t.length >= 2; }
  function stripOriginWords(s, lg) {
    let x = String(s);
    if (lg === "en") { try { if (W.V101FACT && typeof W.V101FACT.stripOrigin === "function") { const y = W.V101FACT.stripOrigin(x); if (y != null) x = y; } } catch (e) { /* 無視 */ } x = x.replace(/\bJapan(?:ese)?[- ]quality\b/gi, "quality").replace(/\bJapan(?:ese)?[- ]made\s+/gi, "").replace(/\s*[-–—,]?\s*\bmade in japan\b/gi, ""); }
    else if (lg === "zht" || lg === "zhs") x = x.replace(/日本(?=品質|品质)/g, "").replace(/(?:於|于|在)?日本(?:製造|制造|生產|生产|製(?!造)|制(?!造))(?![商業业者廠厂家])(?:的)?/g, "").replace(/(?:產|产)(?:自|於|于)日本(?:的)?/g, "").replace(/日本原(?:裝|装)(?:的)?/g, "").replace(/日本(?:國產|国产)(?:的)?/g, "");
    else if (lg === "es") x = x.replace(/\s*,?\s*\b(?:hecho|hecha|fabricad[oa]s?|producid[oa]s?|elaborad[oa]s?)\s+en\s+jap[oó]n\b/gi, "").replace(/\s*\bde\s+origen\s+japon[eé]s\b/gi, "").replace(/\bcalidad\s+japonesa\b/gi, "calidad");
    else if (lg === "ja") x = x.replace(/日本製(?:の)?|国産(?!化)(?:の)?|国内(?:で)?(?:生産|製造)(?:の|した|された)?/g, "");
    return x;
  }
  // 1つの文を直す：返す値は直した文（"" は文ごと外す）
  function fixSent(sent, L, ctx) {
    const lg = langOf(sent, ctx.hint);
    let s = sent;
    // ① 札の形「原產地：日本」「Origin: Japan」は、札を残して値を要確認に
    if (L.some((tp) => tp.k === "origin")) {
      const tw = lg === "zht" ? "待確認" : lg === "zhs" ? "待确认" : lg === "es" ? "por confirmar" : lg === "ja" ? "要確認" : "to be confirmed";
      const s1 = s.replace(/((?:country\s+of\s+)?origin|原產(?:國|地)|原产(?:国|地)|原産(?:国|地)|產地|产地|製造國|制造国|製造国|pa[ií]s\s+de\s+origen|origen)(\s*[:：]\s*)(?:japan\b|日本|jap[oó]n\b)(?:\s*[（(][^）)]{0,20}[)）])?/gi, (m0, a, b) => a + b + tw);
      if (s1 !== s) { s = s1; ctx.hit("origin", m0Of(sent), true); }
    }
    const parts = s.split(SUBSEP);
    const segs = [];
    for (let i = 0; i < parts.length; i += 2) segs.push({ t: parts[i], d: parts[i + 1] || "", drop: false });
    let changed = s !== sent;
    const need = {}; // TBC を足す話題
    segs.forEach((sg) => {
      if (!sg.t || !sg.t.trim() || HEDGE.test(sg.t)) return;
      // 「無石棉證明：待確認」のように、札の後ろが「確認」なら、札は断定ではない
      { const j = segs.indexOf(sg); if (/^[:：]$/.test(sg.d) && segs[j + 1] && HEDGE.test(segs[j + 1].t)) return; }
      const lgs = langOf(sg.t, ctx.hint);
      for (const tp of L) {
        const m = claimHit(tp, sg.t, lgs);
        if (!m) continue;
        // 原産地：形容の語だけを外せるなら、節は残す（「日本品質」→「品質」・「Made in Japan」だけを外す）
        if (tp.k === "origin") {
          const y = stripOriginWords(sg.t, lgs);
          const frag = (lgs === "en" || lgs === "es") && /^\s*(?:with|in|at|for|by|from|and|con|en|de|y)\b/i.test(y); // 「With strict quality control.」のような切れ端は残さない
          if (!frag && y !== sg.t && nonEmpty(y, lgs) && !claimHit(tp, y, lgs)) { sg.t = y; changed = true; ctx.hit("origin", m, false); continue; }
        }
        // アスベスト：「NAO（無石棉有機）」「non-asbestos organic」の言い切りだけを外し、材質の名前（NAO）は残す
        if (tp.k === "asbestos") {
          const y = sg.t.replace(/\bnon-?asbestos(?:\s+organic)?\s*/gi, "").replace(/\s*\basbestos[- ]free\b\s*/gi, " ").replace(/(?:為|为|是|採用|采用|使用)?(?:無石棉|无石棉|不含石棉|非石棉)(?:有機|有机)?(?:的)?(?:配方|材料|材質|材质)?/g, "").replace(/\bsin\s+(?:amianto|asbesto)\b/gi, "").replace(/ノンアスベスト|アスベスト(?:不使用|フリー)/g, "");
          // 「…is asbestos-free」「…為無石棉」のように言い切りが述語のときは、述語（is・為）も外して「材質の名前（証明は要確認）」の形にする
          let y2 = y;
          if (/\b(?:is|are|was|were|be|being|es|son|está|están)\s*[.,;:!?]*\s*$/i.test(y.trim())) y2 = y.replace(/\s*\b(?:is|are|was|were|be|being|es|son|está|están)\s*([.,;:!?]*)\s*$/i, "$1");
          else if (/(?:是|為|为|係)\s*[。，,.]?\s*$/.test(y.trim())) y2 = y.replace(/(?:是|為|为|係)(\s*[。，,.]?)\s*$/, "$1");
          // 中・日は「採用無石棉配方」→「採用配方」のように語の途中が抜けて意味が変わるので、NAO（材質の名前）が無い文では節ごと外す
          const partOk = /\bNAO\b/.test(s) || ((lgs === "en" || lgs === "es") && y2 === y && meaningful(y2, lgs));
          if (partOk && y2 !== sg.t && nonEmpty(y2, lgs) && !claimHit(tp, y2, lgs) && (y2 === y || /\bNAO\b/.test(s))) { sg.t = y2; changed = true; ctx.hit("asbestos", m, false); ctx.naoQual = true; continue; }
        }
        sg.drop = true; changed = true;
        ctx.hit(tp.k, m, true);
        if (!ctx.lineHedge[tp.k] && !ctx.done[tp.k]) need[tp.k] = tp;
        break;
      }
    });
    if (!changed) return sent;
    // 組み立て直す（外す節は、その区切りと一緒に。かっこの中だけを外すときは、かっこも外す）
    const lgS = langOf(sent, ctx.hint);
    let out = "";
    segs.forEach((sg, j) => {
      if (!sg.drop) { out += sg.t + sg.d; return; }
      const prevD = j > 0 ? segs[j - 1].d : "";
      if (/[（(]/.test(prevD) && /[)）]/.test(sg.d)) { out = out.replace(/\s*[（(]\s*$/, ""); return; }
      const tail = (sg.t.match(/[。.!?！？]+\s*$/) || [""])[0]; // 文の終わりの「。」は残す
      if (/[，,；;：:]/.test(sg.d)) return;
      out = out.replace(/[，,；;：:、]\s*$/, "");
      out += tail + sg.d;
    });
    const kept = segs.filter((x) => !x.drop && x.t.trim());
    // 英語・西語で主語の節（最初の節）が断定なら、文ごと外す（「…, so you can …」だけ残さない）。残りが「確認」の文なら、その文は残す
    let wholeDrop = !kept.length, leadAdds = false;
    if (!wholeDrop && (lgS === "en" || lgS === "es") && segs[0].drop && segs.length > 1) {
      if (HEDGE.test(out)) out = out.replace(/[()（）]/g, " ");
      else {
        // 残りが主語から始まる文（「…, and the NAO friction material …」→「The NAO friction material …」）なら残し、「確認」の文は前に1文で置く
        const rest = tidy(out, lgS);
        if (/^(?:The|Our|This|These|It|Its|We|They|Each|All|El|La|Los|Las|Nuestr\w*|Este|Esta|[A-Z]{2,}|[A-Z]+-\d)/.test(rest) && meaningful(rest, lgS)) { out = rest; leadAdds = true; }
        else wholeDrop = true;
      }
    }
    // 22.01.2：節を外さず語だけ外した文（件名「Wooden puzzles from Japan」→「Wooden puzzles」など）は、2語でも残す（前は件名が空になった）
    if (!wholeDrop) { out = tidy(out, lgS); if (segs.some((x) => x.drop) ? !meaningful(out, lgS) : !nonEmpty(out, lgS)) wholeDrop = true; }
    const adds = Object.keys(need).map((k) => { ctx.done[k] = 1; return tbcText(need[k], lgS, ctx.T); });
    const cap = (x) => (lgS === "en" || lgS === "es") ? x.charAt(0).toUpperCase() + x.slice(1) : x;
    if (wholeDrop) {
      if (!adds.length) return "";
      const end = /[。！？]$/.test(sent.trim()) || lgS === "zht" || lgS === "zhs" || lgS === "ja" ? "。" : ".";
      const lead = (sent.match(/^\s*/) || [""])[0];
      return lead + cap(adds.join(lgS === "en" || lgS === "es" ? "; " : "；")) + (/[。.!?！？；;]\s*$/.test(sent) ? end : "") + (/\s$/.test(sent) && !/\n$/.test(sent) ? " " : "");
    }
    if (adds.length && leadAdds) {
      const lead = (sent.match(/^\s*/) || [""])[0];
      return lead + cap(adds.join("; ")) + ". " + out + ((/\s$/.test(sent) && !/\s$/.test(out)) ? " " : "");
    }
    if (adds.length) {
      const q = lgS === "en" || lgS === "es" ? " (" + adds.join("; ") + ")" : "（" + adds.join("；") + "）";
      out = out.replace(/([。.!?！？；;]?)\s*$/, (m0, pu) => q + pu);
    }
    return out + ((/\s$/.test(sent) && !/\s$/.test(out)) ? " " : "");
  }
  function m0Of(s) { return String(s || "").slice(0, 40); }
  // NAO（材質の名前）には、証明は要確認と1回だけ付ける
  function naoQualify(text, ctx) {
    if (!ctx.naoQual && !(ctx.L.some((tp) => tp.k === "asbestos") && /\bNAO\b/.test(text))) return text;
    const nl = (text.match(/[^\n]*\bNAO\b[^\n]*/) || [""])[0];
    if (HEDGE.test(nl) && /石棉|asbestos|amianto|asbesto|アスベスト|石綿/i.test(nl)) return text;
    let done = false;
    // 言語は行全体で決める（「NAO材」だけでは中国語と見分けられない）
    return text.replace(/([^\n。.!?！？；;]*\bNAO\b[^\n，,。.!?！？；;（(]*)/, (m) => { if (done) return m; done = true; const lg = langOf(nl, ctx.hint); const tp = ctx.L.find((x) => x.k === "asbestos") || { k: "asbestos" }; return m.replace(/\s+$/, "") + (lg === "en" || lg === "es" ? " (" + tbcText(tp, lg, ctx.T) + ")" : "（" + tbcText(tp, lg, ctx.T) + "）"); });
  }
  const BUL = /^(\s*(?:[・•\-*‧●◆▪■□◦▶►✓✔]|\d{1,2}[.)、．]|[（(]\d{1,2}[)）])\s*)/;
  function unkFix(text, hint, T) {
    const s0 = String(text == null ? "" : text);
    T = T || ten();
    let L = [];
    try { L = unkTopicsOf(T); } catch (e) { L = []; }
    // 22.01.2（2回目）w2-1：登録の名前（原材料・材質・品番）にそろえる直しは、「不明」の話題が無くても掛ける
    if (!s0.trim()) return { text: s0, hits: [] };
    if (!L.length) { try { if (V.termFix) return V.termFix(s0, hint, T); } catch (e) { err("termFix0", e); } return { text: s0, hits: [] }; }
    const hits = [];
    const ctx = { hint, T, L, done: {}, lineHedge: {}, naoQual: false, hit: (k, m, dropped) => { hits.push({ k, m: String(m || "").slice(0, 60), dropped: !!dropped }); } };
    // 同じ文面の中で、その話題を「確認」とすでに書いている（前に入れた「待確認」も）なら、もう足さない
    //   「確認」の文＝その話題の語と「確認」が同じ文にあり、その文に断定が無いもの（例：「具體車型…需按需求確認」）。ほかの話題の「確認」では足すのをやめない
    const hedgeOf = (txt) => { const o = {}; sents2(txt).forEach((x) => L.forEach((tp) => { if (TOPW[tp.k] && TOPW[tp.k].test(x) && HEDGE2.test(x) && !x.split(SUBSEP).some((sub, i) => !(i % 2) && sub.trim() && !HEDGE.test(sub) && claimHit(tp, sub, langOf(sub, hint)))) o[tp.k] = 1; })); return o; };
    s0.split("\n").forEach((line) => Object.assign(ctx.done, hedgeOf(line)));
    const lines = s0.split("\n");
    const out = [];
    for (const line of lines) {
      try {
        if (!line.trim()) { out.push(line); continue; }
        const m = line.match(BUL); const pre = m ? m[1] : ""; const body = line.slice(pre.length);
        ctx.lineHedge = hedgeOf(body);
        const S = sents2(body);
        let ch = false; const keep = [];
        for (const x of S) { const r = fixSent(x, L, ctx); if (r !== x) ch = true; if (r) keep.push(r); }
        if (!ch) { out.push(line); continue; }
        const nb = keep.join("").replace(/^\s+/, "");
        if (!nb.trim()) continue; // 行ごと外す
        out.push(pre + nb);
      } catch (e) { err("unkLine", e); out.push(line); }
    }
    let t = out.join("\n").replace(/\n{3,}/g, "\n\n");
    try { t = naoQualify(t, ctx); } catch (e) { err("nao", e); }
    try { if (V.termFix) { const r2 = V.termFix(t, hint, T); t = r2.text; r2.hits.forEach((x) => hits.push(x)); } } catch (e) { err("termFix1", e); }
    if (t !== s0) { V.n.unkFix++; V.n.unkHit += hits.length; }
    return { text: t, hits };
  }
  V.unkFix = unkFix;
  // 残っている断定（知らせ用）：[{k, lab, m}]
  function unkScan(text, hint, T) {
    T = T || ten();
    const L = unkTopicsOf(T), out = [];
    try { if (V.termScan) V.termScan(text, hint, T).forEach((x) => out.push(x)); } catch (e) { err("termScan0", e); }
    if (!L.length) return out;
    String(text || "").split("\n").forEach((line) => sents2(line).forEach((x) => x.split(SUBSEP).forEach((sub, i, arr) => {
      if (i % 2 || !sub.trim() || HEDGE.test(sub)) return;
      if (/^[:：]$/.test(arr[i + 1] || "") && HEDGE.test(arr[i + 2] || "")) return;
      L.forEach((tp) => { const lg = langOf(sub, hint); const m = claimHit(tp, sub, lg); if (m && !out.some((o) => o.k === tp.k)) out.push({ k: tp.k, lab: tp.lab, m: String(m).slice(0, 40) }); });
    })));
    return out;
  }
  V.unkScan = unkScan;
  // 取り決め（ほかの担当の文面も同じ扱いに）：window.v101unkFix(text, 言語の名前) → 直した文
  W.v101unkFix = function (t, hint) { try { return unkFix(t, hint).text; } catch (e) { err("unkFixApi", e); return t; } };
  // 文面の1通を直す（利用者が窓で手を入れた文面〈m.v101typed〉は書き換えない＝知らせだけ）
  function unkFixMsg(m, hint) {
    if (!m || typeof m.body !== "string" || m.v101typed) return false;
    const r = unkFix(m.body, hint);
    const r2 = unkFix(String(m.subj || ""), hint);
    let ch = false;
    if (r.text !== m.body) { m.body = r.text; ch = true; }
    if (r2.text !== String(m.subj || "")) { m.subj = r2.text; ch = true; }
    if (r.hits.length || r2.hits.length) { const old = Array.isArray(m.v101unk) ? m.v101unk : []; m.v101unk = old.concat(r.hits, r2.hits).filter((x, i, a) => a.findIndex((y) => y.k === x.k && y.m === x.m) === i).slice(0, 20); }
    if (ch) m.v101uf = djb(m.body);
    return ch;
  }
  V.unkFixMsg = unkFixMsg;
  wrap("v79obFinish", (o) => function (L, run) {
    const r = o.apply(this, arguments);
    try {
      const ap = L && L.ap;
      if (ap && Array.isArray(ap.seq)) { const hint = ap.lang || (run && run.lang) || ""; ap.seq.forEach((m) => { try { unkFixMsg(m, hint); } catch (e) { err("unkMsg", e); } }); }
    } catch (e) { err("finishUnk", e); }
    return r;
  });
  // AI への頼み（商品と会社の段）に、「不明」と答えた事柄を書く
  function unkPrompt(T) {
    const L = unkTopicsOf(T);
    if (!L.length) return "";
    const ex = { fit: "「主要メーカー対応」「compatible with major brands」「可對應主要汽車品牌」などと書かない", asbestos: "「non-asbestos」「asbestos-free」「無石棉」と書かない（NAO という材質の名前はそのまま）", origin: "「Made in Japan」「日本製造」「Japanese quality」と書かない（会社が日本にあることは書いてよい）" };
    return "■【v101unk】利用者が「不明」「わからない」と答えた事柄（文面で断定しない。触れるときは「to be confirmed／待確認」と書く）\n" +
      L.map((tp) => "・" + (tp.origin ? "原産国・製造国：未登録" : String(tp.lab) + "：「" + String(tp.q || "").slice(0, 50) + "」に「" + String(tp.a || "不明").slice(0, 10) + "」") + (ex[tp.k] ? "（" + ex[tp.k] + "）" : "")).join("\n");
  }
  V.unkPrompt = unkPrompt;
  wrap("v71obCtx", (o) => function () {
    let s = String(o.apply(this, arguments) || "");
    try { const a = unkPrompt(ten()); if (a && s.indexOf("【v101unk】") < 0) { s = s + "\n\n" + a; V.n.unkCtx++; } } catch (e) { err("ctx", e); }
    try { const b = V.termPrompt ? V.termPrompt(ten()) : ""; if (b && s.indexOf("【v101reg】") < 0) s = s + "\n\n" + b; } catch (e) { err("ctxTerm", e); } // 22.01.2（2回目）w2-1
    return s;
  });

  /* ═════════ v2-6：バイヤーリストを作った直後、確かめが終わるまでの表示・E の「通信できませんでした」 ═════════
     原因：①リストを作ると表を先に描き、そのあと公式サイトを確かめる（v79obCheck・最長 90秒）。その間、土台の v79obCheckHtml は
             確かめの記録（run.v79chk）が無いのを「21.78 までに作ったリスト」と決めつけて出していた。
           ②22.01 の件数の注記（この層の cntNote）は、まだ確かめていない会社も「確かめられなかった」と数えていた。行の理由も「まだ確かめていません」。
           ③確かめの通信が失敗したとき（E）、土台は理由を「通信できませんでした」にまとめ（本当の理由〈時間切れ・つながらない・答えが読めない〉を捨てる）、
             行には「まだ確かめていません」と出ていた。E は作り始めから約 90秒で失敗＝確かめの依頼（ob_url・10社まとめて）の時間切れ（90秒）と見ている。
     直し：確かめている間は「確かめています…」（表の上・注記・各行）。確かめの記録が無いだけなら「まだ確かめていません（「公式サイトを確かめる」を押す）」。
           失敗したら本当の理由を残して表の上と各行に出す。時間切れのときは、5社ずつに分けて1回だけ確かめ直す（1分に4回の上限の内） */
  V.chk = null; // 確かめている run（{run, at, n}）
  function busyRun(run) { return !!(V.chk && run && (V.chk.run === run || (V.chk.at0 && run.at === V.chk.at0))); }
  V.busyRun = busyRun;
  // （かっこの中に入れて出すので、文の中にかっこを入れない）
  const OBW = { timeout: ["{n}社まとめた確かめが時間内に終わりませんでした・{s}秒", "checking {n} companies at once did not finish in time, {s}s", "一次核实 {n} 家未能在时限内完成・{s}秒", "la verificación de {n} empresas a la vez no terminó a tiempo, {s} s"],
    offline: ["同期サーバーにつながりませんでした・ネットワーク", "could not reach the sync server, network", "无法连接同步服务器・网络", "no se pudo conectar con el servidor, red"],
    http: ["同期サーバーが応答しませんでした・HTTP {c}", "the sync server did not respond, HTTP {c}", "同步服务器未响应・HTTP {c}", "el servidor no respondió, HTTP {c}"],
    badres: ["同期サーバーの答えが読めませんでした", "could not read the sync server's reply", "无法读取同步服务器的回复", "no se pudo leer la respuesta del servidor"],
    net: ["通信できませんでした・{r}", "communication failed, {r}", "通信失败・{r}", "falló la comunicación, {r}"] };
  function obWhyText(x) { if (!x) return ""; const t = OBW[x.kind] || OBW.net; return F(M(t[0], t[1], t[2], t[3]), { s: Math.round((x.ms || 0) / 1000), n: x.n || 0, c: x.code || "", r: String(x.raw || "").slice(0, 40) }); }
  V.obWhyText = obWhyText;
  function obKind(msg, ms, timeout) {
    const m = String(msg || "");
    if (/abort/i.test(m) || (timeout && ms >= timeout - 3000)) return { kind: "timeout" };
    const h = m.match(/HTTP\s*(\d{3})/); if (h) return { kind: "http", code: +h[1] };
    if (/Failed to fetch|NetworkError|Load failed|TypeError/i.test(m)) return { kind: "offline" };
    if (/応答が読めません|接続先の応答/.test(m)) return { kind: "badres" };
    return { kind: "net" };
  }
  V.obKind = obKind;
  // 確かめの依頼（ob_url）の本当の失敗の理由を控える（土台は「通信できませんでした」にまとめるため）
  //   本番で E と同じ 10社をまとめて確かめると 117.6秒かかった（同期サーバーは答えを返したが、アプリは 90秒で打ち切っていた＝E の 0/10 の原因）。
  //   6社以上をまとめて確かめるときは、待つ時間を 150秒にする（それでも時間切れなら、下の包みで 5社ずつに分けて確かめ直す）
  V.obTimeout = 150000;
  wrap("v79obCall", (o) => async function (op, body, opt) {
    if (op !== "ob_url") return o.apply(this, arguments);
    const n = (body && Array.isArray(body.items)) ? body.items.length : 0;
    const o2 = Object.assign({ timeout: 90000 }, opt || {});
    if (n > 5 && o2.timeout < V.obTimeout) o2.timeout = V.obTimeout;
    const t0 = Date.now(), to = o2.timeout;
    const r = await o.call(this, op, body, o2);
    try { if (r && r.ok === false && r.reason === "net") { const ms = Date.now() - t0; V.obErr = Object.assign({ raw: String(r.msg || ""), ms, n, at: Date.now() }, obKind(r.msg, ms, to)); log({ k: "obErr", e: V.obErr }); } else if (r && r.ok) V.obErr = null; } catch (e) { err("obCall", e); }
    return r;
  });
  // 一番外側で包む（22.01 の包みの外）：確かめている間の印・失敗の理由・時間切れの分け直し
  (function () {
    const o = W.v79obCheck;
    if (typeof o !== "function" || o.__v101buyerB) return;
    const g = async function (run, quiet) {
      if (!run || run.how === "smp" || V.inRetry || V.inSplit) return o.apply(this, arguments);
      V.chk = { run, at0: run.at, at: Date.now(), n: (run.leads || []).filter((l) => l && !l.smp && !l.v79x).length };
      V.n.chkBusy++;
      V.obErr = null;
      try { if (fn("v71obPaint")) W.v71obPaint(); } catch (e) { /* 無視 */ }
      let r;
      try {
        // 1回目は知らせを出さずに確かめる（失敗したときの土台の知らせは「通信できませんでした」だけで、分けて確かめ直す前に出てしまうため）。知らせはこのあとで1つだけ
        r = await o.call(this, run, true);
        // 失敗の本当の理由を残す
        const ck = run.v79chk;
        if (ck && ck.st !== "ok" && (ck.why || "net") === "net" && V.obErr && Date.now() - V.obErr.at < 300000) {
          ck.v101 = { kind: V.obErr.kind, code: V.obErr.code || 0, ms: V.obErr.ms, n: V.obErr.n, raw: String(V.obErr.raw || "").slice(0, 80) };
          ck.msg = obWhyText(V.obErr); V.n.chkWhy++;
          // 時間切れ（まとめて確かめる数が多い）：5社ずつに分けて1回だけ確かめ直す
          const rest = (run.leads || []).filter((l) => l && !l.smp && !l.v79x && !(l.v79u && /^(ok|redir|dead)$/.test(l.v79u.st)));
          if (/^(timeout|badres)$/.test(ck.v101.kind) && rest.length > 5 && !run.v101split) {
            run.v101split = { at: Date.now(), n: rest.length };
            V.n.chkSplit++;
            V.chk.phase = "split";
            try { if (fn("v71obPaint")) W.v71obPaint(); } catch (e) { /* 無視 */ }
            const chunks = []; for (let i = 0; i < rest.length; i += 5) chunks.push(rest.slice(i, i + 5));
            V.inSplit = 1;
            try {
              for (const c of chunks.slice(0, 4)) { const sub = { how: run.how, cty: run.cty, at: run.at, leads: c }; await o.call(this, sub, true); }
            } finally { V.inSplit = 0; }
            const L = (run.leads || []).filter((l) => l && !l.smp);
            const done = L.filter((l) => l.v79u && /^(ok|redir|dead)$/.test(l.v79u.st)).length;
            run.v101split.done = done;
            if (done) {
              const at = Date.now();
              run.v79chk = { at, st: "ok", n: done, v101split: chunks.length, v101first: ck.v101 };
              L.forEach((l) => { if (!(l.v79u && /^(ok|redir|dead)$/.test(l.v79u.st))) l.verify = true; });
              run.v100chk = { done, total: L.length, capped: false, reuse: L.filter((l) => l.v100reuse).length, left: (W.V100AI && W.V100AI.ob && W.V100AI.ob.left != null) ? W.V100AI.ob.left : null, at };
              try { orderLeads(run); } catch (e) { /* 無視 */ }
              if (!quiet) { const c = (fn("v79obCounts") ? W.v79obCounts(run) : { ok: done, dead: 0, unk: 0 }); V.splitToasted = run.v101split.at; try { if (fn("v71obToast")) W.v71obToast(F(M("1回目は{w}。5社ずつに分けて確かめ直しました：届いた {a}社・届かない {d}社（外しました）・未確認 {u}社", "The first check {w}. Re-checked in groups of 5: reached {a}, unreachable {d} (removed), unverified {u}", "第一次{w}。已每 5 家分批重新核实：可访问 {a} 家・无法访问 {d} 家（已移除）・未确认 {u} 家", "La primera verificación {w}. Se verificó de nuevo en grupos de 5: accesibles {a}, inaccesibles {d} (quitadas), sin verificar {u}"), { w: obWhyText(ck.v101), a: c.ok, d: c.dead, u: c.unk })); } catch (e) { /* 無視 */ } }
            } else run.v79chk.msg = obWhyText(V.obErr || ck.v101);
            log({ k: "split", n: rest.length, chunks: chunks.length, done });
          }
          if (fn("v71obSave")) W.v71obSave();
        }
        // 知らせ（土台と同じ文。失敗は本当の理由で）
        if (!quiet && !(run.v101split && run.v79chk && run.v79chk.st === "ok" && run.v101split.at > Date.now() - 600000 && V.splitToasted === run.v101split.at)) {
          const ck2 = run.v79chk;
          const c = fn("v79obCounts") ? W.v79obCounts(run) : { ok: 0, dead: 0, unk: 0 };
          const tf = (s, o2) => { try { return fn("v71obF") ? W.v71obF(s, o2) : F(s, o2); } catch (e) { return F(s, o2); } };
          let t = "";
          if (ck2 && ck2.st === "ok") t = tf("公式サイトを確かめました：届いた {a}社・届かない {d}社（外しました）・未確認 {u}社", { a: c.ok, d: c.dead, u: c.unk });
          else if (ck2) t = ck2.v101 ? F(M("公式サイトを確かめられませんでした（{w}）。「確かめ直す」でもう一度確かめるか、送る前に1社ずつ確かめてください", "Could not check the websites ({w}). Use “Check again”, or check each company before sending", "无法核实官网（{w}）。请按“重新核实”，或在发送前逐家确认", "No se pudieron verificar los sitios ({w}). Use «Verificar de nuevo» o verifique cada empresa antes de enviar"), { w: ck2.msg }) : tf("公式サイトを確かめられませんでした（{w}）。送る前に1社ずつ確かめてください", { w: ck2.msg || "" });
          if (t) { try { if (fn("v71obToast")) W.v71obToast(t); } catch (e) { /* 無視 */ } }
        }
      } finally {
        V.chk = null;
        try { if (fn("v71obPaint")) W.v71obPaint(); } catch (e) { /* 無視 */ }
      }
      return r;
    };
    g.__v101buyerB = 1; g.__v101buyer = 1;
    W.v79obCheck = g;
  })();
  // 行の理由：確かめている間・失敗したとき・まだのとき を分ける（22.01 の whyNot を包む）
  (function () {
    const o = V.whyNot;
    V.whyNot = function (l, run) {
      if (!l || l.smp || l.v79x) return "";
      const st = l.v79u && l.v79u.st;
      if (l.v79ok || st === "ok" || st === "redir") return "";
      if (busyRun(run) && !st) return M("公式サイトを確かめています…", "Checking the website…", "正在核实官网…", "Verificando el sitio web…");
      const ck = run && run.v79chk;
      if (!st && ck && ck.st !== "ok" && ck.why !== "cap" && String(l.url || "").trim()) return F(M("公式サイトを確かめられませんでした（{w}）。表の上の「確かめ直す」を押してください", "Could not check the website ({w}). Press “Check again” above the table", "无法核实官网（{w}）。请按表格上方的“重新核实”", "No se pudo verificar el sitio ({w}). Pulse «Verificar de nuevo» encima de la tabla"), { w: ck.msg || obWhyText(ck.v101) || M("通信できませんでした", "communication failed") });
      if (!st && !ck && !(run && run.v100chk) && String(l.url || "").trim()) return M("公式サイトを、まだ確かめていません（表の上の「公式サイトを確かめる」を押してください）", "The website has not been checked yet (press “Check websites” above the table)", "尚未核实官网（请按表格上方的“核实官网”）", "Aún no se ha verificado el sitio (pulse «Verificar sitios» encima de la tabla)");
      return o.apply(this, arguments);
    };
  })();
  // 件数：確かめている間・確かめの記録が無いときは、未確認の数を「確かめられなかった」と数えない
  (function () {
    const o = V.obCount;
    V.obCount = function (run) {
      const c = o.apply(this, arguments);
      try {
        if (busyRun(run)) { c.busy = c.unchk; c.unchk = 0; }
        else if (run && !run.v79chk && !run.v100chk) { c.notyet = c.unchk; c.unchk = 0; }
        else if (run && run.v79chk && run.v79chk.st !== "ok" && !(run.leads || []).some((l) => l && l.v79u && /^(ok|redir|dead)$/.test(l.v79u.st))) { c.failAll = c.unchk; c.failMsg = run.v79chk.msg || ""; c.unchk = 0; }
      } catch (e) { err("obCount2", e); }
      return c;
    };
  })();
  // 表の上の確かめの行（土台の v79obCheckHtml・v100 の包みの外）
  const OLD178 = /公式サイト・窓口：まだ確かめていません（21\.78 までに作ったリスト）|Websites\/contacts: not checked yet \(list made before 21\.79\)|官网・联系窗口：尚未核实（21\.78之前生成的名单）|Sitios\/contactos: aún sin verificar \(lista anterior a 21\.79\)/;
  wrap("v79obCheckHtml", (o) => function (run) {
    let h = String(o.apply(this, arguments) || "");
    try {
      if (!run || run.how === "smp" || run.v100smp) return h;
      if (busyRun(run)) {
        const n = (run.leads || []).filter((l) => l && !l.smp && !l.v79x).length;
        const t = V.chk && V.chk.phase === "split" ? F(M("公式サイト・窓口：1回目は{w}。5社ずつに分けて確かめ直しています…（〜2分）。確かめ終わった会社から、各行に結果を出します（まだの行は「確かめています」）", "Websites/contacts: the first check {w}. Re-checking in groups of 5… (up to 2 min). Each row shows its result as soon as it is checked", "官网・联系窗口：第一次{w}。正在每 5 家分批重新核实…（约2分钟）。核实完的公司会依次在各行显示结果", "Sitios/contactos: la primera verificación {w}. Verificando de nuevo en grupos de 5… (hasta 2 min). Cada fila muestra su resultado en cuanto se verifica"), { w: obWhyText(run.v79chk && run.v79chk.v101) })
          : F(M("公式サイト・窓口を確かめています…（{n}社・1〜2分）。確かめ終わった会社から、各行に結果を出します（まだの行は「確かめています」）", "Checking websites and contacts… ({n} companies, 1–2 min). Each row shows its result as soon as it is checked (rows not yet checked show “Checking”)", "正在核实官网和联系窗口…（{n} 家・约1〜2分钟）。核实完的公司会依次在各行显示结果（尚未核实的行显示“正在核实”）", "Verificando sitios y contactos… ({n} empresas, 1–2 min). Cada fila muestra su resultado en cuanto se verifica (las pendientes muestran «Verificando»)"), { n });
        return `<div class="v79chk v101b-chkbusy" role="status" data-v101-buyer-chk="busy" data-noi18n="1">⏳ <span>${E(t)}</span></div>`;
      }
      if (OLD178.test(h)) { h = h.replace(OLD178, E(M("公式サイト・窓口：まだ確かめていません。右の「公式サイトを確かめる」を押すと確かめます", "Websites/contacts: not checked yet. Press “Check websites” on the right", "官网・联系窗口：尚未核实。按右侧的“核实官网”即可核实", "Sitios/contactos: aún sin verificar. Pulse «Verificar sitios» a la derecha"))); h = h.replace(/<div class="v79chk"/, '<div class="v79chk" data-v101-buyer-chk="notyet"'); }
      const ck = run.v79chk;
      if (ck && ck.st !== "ok" && !/data-v101-buyer-chkwhy/.test(h)) {
        const w = ck.msg || obWhyText(ck.v101);
        const t = F(M("⚠ 公式サイトを確かめられませんでした（{w}）。「確かめ直す」で、もう一度確かめられます。確かめるまで、各行は「要確認」のままです", "⚠ Could not check the websites ({w}). Use “Check again” to try again. Rows stay “to be confirmed” until checked", "⚠ 无法核实官网（{w}）。可按“重新核实”再试。核实前各行保持“需确认”", "⚠ No se pudieron verificar los sitios ({w}). Use «Verificar de nuevo». Las filas siguen «por confirmar»"), { w });
        h = h.replace(/(<div class="(?:v100ai-chk|v79chk)[^"]*"[^>]*>)/, `$1<span class="v101b-chkwhy" data-v101-buyer-chkwhy="1" data-noi18n="1">${E(t)}</span>`);
        // 22.00 の行の「まだ確かめていません」は、失敗の後は「確かめられていません」に（上の理由と食い違わないように）
        h = h.replace(/(\d+)社はまだ確かめていません（「要確認」のまま）。/, "$1社は確かめられていません（「要確認」のまま）。").replace(/(\d+) companies not checked yet \(still “to be confirmed”\)\./, "$1 companies could not be checked (still “to be confirmed”).");
      }
    } catch (e) { err("chkHtml", e); }
    return h;
  });

  /* ═════════ v3 S3：除菌・抗菌をうたう商品を米国で売るとき（EPA の抗菌剤の登録・FIFRA）を、書類の判断の表と規制の画面に「条件つき」で出す ═════════
     原因：書類の判断の表（V85DOC_D.rules）に、米国の殺菌・除菌剤（抗菌剤）の登録の行が無かった。B（除菌スプレー・HS 3808.94）でアメリカを確定すると、
           STEP03 は「規制の表・SDS・Non-DG・COA」の4項目だけで 100%「済み」になっていた。
     直し：商品の印「除菌・抗菌・殺菌をうたう」（品名・強み・成分などの語から自動・書類の画面で切り替えられる）を足し、印のある商品で米国が相手のとき、
           「米国 EPA の登録（抗菌剤・FIFRA）」を条件つきの行として出す。規制の画面（この商品と送り先で確かめる点）・書類の画面・STEP03 は同じ表を読むので、
           数え方（22.00 の v100 の sepReq：必須・条件つきの行を数える）は変えずに、米国の項目が1つ増える（「確かめました」で済み）。
     出どころ：EPA の公式の頁（2026-11-22 に開いて、下の文に書いた中身だけを確かめた）。登録が要るかは商品のうたい文句・使い方ごとに違うので「要確認」のまま（確認済みと書かない） */
  (function () {
    try {
      if (typeof V85DOC_D === "undefined" || !V85DOC_D || !Array.isArray(V85DOC_D.rules)) return; // eslint-disable-line no-undef
      const D85 = V85DOC_D; // eslint-disable-line no-undef
      D85.flags = D85.flags || {}; D85.docs = D85.docs || {}; D85.issuers = D85.issuers || {};
      const FLAG = "antimicrobial_claim";
      const FLAG_JA = "除菌・抗菌・殺菌をうたう（菌・ウイルスを減らす・殺す）";
      if (!D85.flags[FLAG]) D85.flags[FLAG] = FLAG_JA;
      const DOC_JA = "米国環境保護庁（USEPA）の登録（除菌・抗菌をうたう製品＝抗菌剤・FIFRA）"; // 「EPA」だけだと用語の説明（経済連携協定）が付いてしまうので、USEPA と書く
      const DOC_EN = "US EPA registration (antimicrobial pesticide, FIFRA)";
      if (!D85.docs.US_EPA_FIFRA) D85.docs.US_EPA_FIFRA = [DOC_JA, DOC_EN, "importer", "external", 90];
      const C_JA = "除菌・抗菌・殺菌をうたう商品を米国で売る時（物の表面・空間・布などに使い、菌・ウイルスを殺す・減らすとうたうもの）";
      const N_JA = "米国では、販売・流通する殺虫剤・殺菌剤などの「農薬（pesticide）」は、連邦の法律（FIFRA）で米国環境保護庁（USEPA）の登録が要る。物の表面などの菌・ウイルスを殺す・減らすとうたう消毒剤・除菌剤は「抗菌剤（antimicrobial pesticide）」に当たる。この商品が当たるか（うたい文句・使い方）と、登録の名義（米国の輸入者か、メーカーが米国の代理人を立てるか）を、輸入者と確かめる。手や肌に使うもの（手指の消毒など）は別の決まりになることがある（要確認）";
      const S_JA = "米国環境保護庁（USEPA）『About Pesticide Registration』（頁の更新 2026-10-15）／米国環境保護庁（USEPA）『What are Antimicrobial Pesticides?』・『Antimicrobial Pesticide Registration』（頁の更新 2026-01-29）";
      const OK_JA = "要確認（頁を開いた日 2026-11-22・登録が要るかは、商品のうたい文句・使い方ごとに USEPA の頁と輸入者に確かめる）"; // 22.01.2：開いた日を持たせる
      if (!D85.rules.some((r) => r && r.id === "v101b01")) {
        D85.rules.push({ id: "v101b01", k: ["US_EPA_FIFRA"], w: { h: ["*"], d: ["US"], f: [FLAG] }, lv: "conditional", c: C_JA, is: "輸入者（米国）・メーカー（米国の代理人を通じて）", ld: 90, n: N_JA, s: S_JA, u: "https://www.epa.gov/pesticide-registration/about-pesticide-registration", ok: OK_JA });
      }
      dictAdd(FLAG_JA, "Claims to sanitize / kill germs (antibacterial, disinfecting)", "宣称除菌・抗菌・杀菌（减少或杀灭细菌・病毒）", "Afirma desinfectar / eliminar gérmenes (antibacteriano)");
      dictAdd(DOC_JA, DOC_EN, "美国 EPA 注册（宣称除菌・抗菌的产品＝抗菌剂・FIFRA）", "Registro EPA de EE. UU. (plaguicida antimicrobiano, FIFRA)");
      dictAdd(C_JA, "When selling in the US a product that claims to sanitize, disinfect or kill germs (used on surfaces, air, fabrics, etc. and claimed to kill or reduce bacteria/viruses)", "在美国销售宣称除菌・抗菌・杀菌的商品时（用于物体表面・空间・布料等，宣称杀灭或减少细菌・病毒）", "Al vender en EE. UU. un producto que afirma desinfectar o eliminar gérmenes (en superficies, aire, tejidos, etc.)");
      dictAdd(N_JA, "In the US, pesticides sold or distributed must be registered by EPA under federal law (FIFRA). Disinfectants and sanitizers claimed to kill or reduce bacteria/viruses on surfaces are antimicrobial pesticides. Check with the importer whether this product is covered (claims and use) and who will hold the registration (the US importer, or the maker through a US agent). Products used on hands or skin may fall under different rules (to be confirmed).", "在美国，销售・流通的农药（pesticide）须依联邦法律（FIFRA）在 EPA 注册。宣称杀灭或减少物体表面细菌・病毒的消毒剂・除菌剂属于“抗菌剂（antimicrobial pesticide）”。请与进口商确认本商品是否适用（宣传用语・用途）以及注册名义人（美国进口商，或制造商通过美国代理人）。用于手部・皮肤的产品可能适用其他规定（需确认）。", "En EE. UU., los plaguicidas que se venden o distribuyen deben registrarse ante la EPA (ley FIFRA). Los desinfectantes que afirman eliminar o reducir bacterias/virus en superficies son plaguicidas antimicrobianos. Confirme con el importador si el producto está incluido y quién será el titular del registro. Los productos para manos o piel pueden tener otras normas (por confirmar).");
      dictAdd(S_JA, "US EPA “About Pesticide Registration” (page updated 2026-10-15) / US EPA “What are Antimicrobial Pesticides?” and “Antimicrobial Pesticide Registration” (pages updated 2026-01-29)");
      dictAdd(OK_JA, "To be confirmed (page opened 2026-11-22; whether registration is needed depends on the product's claims and use — check the EPA pages and with the importer)", "需确认（是否需要注册取决于商品的宣传用语和用途，请查看 EPA 页面并与进口商确认）", "Por confirmar (depende de las afirmaciones y el uso del producto — consulte la EPA y al importador)");
      dictAdd("輸入者（米国）・メーカー（米国の代理人を通じて）", "Importer (US) / maker (through a US agent)", "进口商（美国）・制造商（通过美国代理人）", "Importador (EE. UU.) / fabricante (mediante agente en EE. UU.)");
      V.epa = { flag: FLAG, rule: "v101b01", doc: "US_EPA_FIFRA" };
    } catch (e) { err("epaRule", e); }
  })();
  // 商品の印を自動で付ける：品名・英名・区分・強み・成分・説明に除菌・抗菌・殺菌の語（食品・化粧品・医薬品・石けんの HS は除く。加熱殺菌などの工程の語は除く）
  const AMC = /除菌|抗菌|殺菌|消毒|抗ウイルス|ウイルス(?:を)?(?:除去|不活化|対策|99)|sanitiz\w*|disinfect\w*|anti-?bacterial|anti-?microbial|anti-?viral|germicid\w*|bactericid\w*|kills?\s+(?:\d+(?:\.\d+)?\s*%\s+of\s+)?(?:germs|bacteria|viruses)/i;
  const AMC_NOT = /加熱殺菌|殺菌済|殺菌処理|低温殺菌|高温殺菌|殺菌工程|レトルト殺菌|UHT|pasteuri[sz]/i;
  function amcText(d) {
    const t = d || {};
    const rows = (Array.isArray(t.compRows) ? t.compRows : []).map((r) => (Array.isArray(r) ? r.join(" ") : String(r || ""))).join(" ");
    const st = (Array.isArray(t.strengths) ? t.strengths : []).map((s) => (Array.isArray(s) ? s.join(" ") : String(s || ""))).join(" ");
    return [t.item, t.itemEn, t.cat, t.desc, rows, st].filter(Boolean).join(" ／ ");
  }
  function amcWhy(d, hs) {
    const h = String(hs || "").replace(/\D/g, "");
    const ch = +h.slice(0, 2);
    if ((ch >= 1 && ch <= 24) || ch === 30 || ch === 33 || /^3401/.test(h)) return "";
    const txt = amcText(d).split(/[／\/、。,.;；\n]/).filter((x) => !AMC_NOT.test(x)).join(" ／ ");
    const m = txt.match(AMC);
    if (!m) return "";
    const near = txt.slice(m.index, m.index + m[0].length + 6);
    if (/^(?:[^／]{0,4})(?:なし|無し|不使用|ではない)/.test(txt.slice(m.index + m[0].length, m.index + m[0].length + 6)) || /\bnot\b/i.test(near)) return "";
    return "品名・強みに「" + m[0] + "」";
  }
  V.amcWhy = amcWhy;
  if (fn("v85docFlagsAuto") && !W.v85docFlagsAuto.__v101buyer) {
    const __fa = W.v85docFlagsAuto;
    const g = function (d, hs) {
      const o = __fa.apply(this, arguments);
      try { if (o && !o.antimicrobial_claim) { const why = amcWhy(d || (ten() || {}), hs); if (why) { o.antimicrobial_claim = why; V.n.epaFlag++; } } } catch (e) { err("amcFlag", e); }
      try { if (o && !o.pet_food) { const pw = petWhy(d || (ten() || {}), hs); if (pw) o.pet_food = pw; } } catch (e) { err("petFlag", e); } // 22.01.2 R4
      return o;
    };
    g.__v101buyer = 1;
    W.v85docFlagsAuto = g;
  }

  /* ═════════════════════════════════════════════════════════════════════════════════════════════
     22.01.2（大森さんの決め「22.01・22.01.1 は全部推奨で」のうち「次の版で」とした4つ）
       S3 署名の名前は英字だけ（上の latinName・v79obSigText・scrub）／ L2 どの国にも当たる行の出どころを国ごとに／
       T4 除菌・抗菌をうたう商品のほかの国の登録（EU・台湾）／ R4 ペットフードの行（香港・台湾・アメリカ・ベトナム）と人の食品の手続きを出さない
     出どころはどれも、2026-11-22 に当局の頁を開いて、行に書いた中身だけを確かめた。断定せず「要確認（頁を開いた日 …）」で出す（信頼の決まり 1・6）
     ═════════════════════════════════════════════════════════════════════════════════════════════ */
  V.ver = "22.01.2";
  V.latinName = latinName;
  const OPENED = "2026-11-22";
  const okOpen = (ja, en) => { const j = "要確認（頁を開いた日 " + OPENED + "・" + ja + "）"; dictAdd(j, "To be confirmed (page opened " + OPENED + "; " + en + ")", "需确认（打开页面日期 " + OPENED + "；" + en + "）", "Por confirmar (página abierta el " + OPENED + "; " + en + ")"); return j; };

  /* ── L2：どの国にも当たる行（r008 輸出先の表示ラベル）の出どころを、国ごと・商材ごとの当局の頁に ──
     22.01 は、サウジ・UAE の資料しか付いていない行を「要確認（この国・商材の公的な出どころは未登録）」にしていた。
     香港・台湾・シンガポールで、当局の頁（法令の条文・当局の FAQ・指針）を開いて表示の決まりを確かめられたものだけを付ける。
     確かめられなかった国・商材（香港の化粧品・化学品、シンガポールの玩具・化学品、医療機器・酒類など）は今までどおり「要確認（…未登録）」 */
  const L2 = {
    HK: {
      food: { s: "香港 食物安全センター（CFS）『Food Labelling』FAQ（食品・薬品〔成分・表示〕規則 Cap.132W：包装済みの食品は英語か中国語か両方で表示）", u: "https://www.cfs.gov.hk/english/faq/faq_03.html",
        en: "Hong Kong Centre for Food Safety “Food Labelling” FAQ (Cap. 132W: prepackaged food labelled in English or Chinese or both)" },
      toy: { s: "香港 税関（C&ED）『Toys and Children's Products Safety』FAQ（Cap.424C：安全の注意書きは英語と中国語の両方・輸入者などの名前と住所）", u: "https://www.customs.gov.hk/en/faqs/consumer_protection/toy_safety/index.html",
        en: "Hong Kong Customs and Excise Department “Toys and Children's Products Safety” FAQ (Cap. 424C: warnings in both English and Chinese; name and address of manufacturer, importer or supplier)" }
    },
    TW: {
      food: { s: "台湾 全国法規資料庫『食品安全衛生管理法』第22条（容器・包装に中文と通用の記号で表示・最終改正 2019-06-12）", u: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=L0040001",
        en: "Taiwan Laws & Regulations Database, Act Governing Food Safety and Sanitation, Art. 22 (labelling in Chinese; last amended 2019-06-12)" },
      cosme: { s: "台湾 全国法規資料庫『化粧品衛生安全管理法』第7条（品名・全成分・輸入者・原産国などを中文で表示・最終改正 2018-05-02）", u: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=L0030013",
        en: "Taiwan Laws & Regulations Database, Cosmetic Hygiene and Safety Act, Art. 7 (Chinese labelling incl. full ingredients, importer, origin; last amended 2018-05-02)" },
      other: { s: "台湾 全国法規資料庫『商品標示法』第6条・第11条（輸入品は輸入者・国外の製造者を表示・文字は中文が主・最終改正 2022-05-18）", u: "https://law.moj.gov.tw/LawClass/LawAll.aspx?PCode=J0080011",
        en: "Taiwan Laws & Regulations Database, Commodity Labeling Act, Arts. 6 and 11 (imported goods show the importer and foreign manufacturer; mainly in Chinese; last amended 2022-05-18)" }
    },
    SG: {
      food: { s: "シンガポール 食品庁（SFA）『A Guide to Food Labelling and Advertisements』（包装済みの食品は英語で表示・2025-11 改訂）", u: "https://www.sfa.gov.sg/docs/default-source/food-manufacturing-and-storage/a-guide-to-food-labelling-and-advertisements.pdf",
        en: "Singapore Food Agency “A Guide to Food Labelling and Advertisements” (prepacked food labelled in English; amended Nov 2025)" },
      cosme: { s: "シンガポール 保健科学庁（HSA）『Regulatory overview of cosmetic products』（表示は英語・全成分・製造国・国内の責任者・頁の更新 2026-11-20）", u: "https://www.hsa.gov.sg/cosmetic-products/overview/",
        en: "Singapore Health Sciences Authority “Regulatory overview of cosmetic products” (labels in English; full ingredients, country of manufacture, local responsible company; page updated 2026-11-20)" }
    }
  };
  const L2OK = okOpen("表示の項目と当てはまるかは、商品ごとに輸入者と確かめる", "check the label items and whether they apply for each product with the importer");
  Object.keys(L2).forEach((c) => Object.keys(L2[c]).forEach((k) => { const x = L2[c][k]; dictAdd(x.s, x.en, x.en, x.en); }));
  const L2RULES = { r008: 1 };
  V.L2 = L2;
  V.l2Src = function (id, dest, prod) {
    if (!id || !L2RULES[id]) return null;
    const T = L2[dest];
    if (!T || !prod || prod.has("liquor") || prod.has("med")) return null;
    let x = null;
    if (prod.has("food") && !prod.has("pet")) x = T.food || null;
    else if (prod.has("cosme")) x = T.cosme || null;
    else if (prod.has("toy")) x = T.toy || T.other || null;
    else x = T.other || null; // 台湾は商品一般の表示の法律（商品標示法）
    return x ? { s: x.s, u: x.u, ok: L2OK } : null;
  };

  /* ── T4：除菌・抗菌をうたう商品の、米国のほかの国の登録（条件つき・要確認）。当局の頁で確かめられた EU・台湾だけ ──
     香港（除害劑條例 Cap.133）・シンガポール（NEA の公衆衛生用の農薬の登録）は、除菌剤が対象かを当局の頁で確かめられなかったので足していない */
  const FLAG_AMC = "antimicrobial_claim";
  const ADD_RULES = [], ADD_DOCS = {}, ADD_TR = [];
  function addRule(r, doc, tr) { ADD_RULES.push(r); if (doc) ADD_DOCS[r.k[0]] = doc; (tr || []).forEach((x) => ADD_TR.push(x)); }
  {
    const c = "除菌・抗菌・殺菌をうたう商品を EU で売る時（殺生物性製品に当たるもの）";
    const n = "EU の殺生物性製品規則（BPR・規則 (EU) 528/2012）の第17条は、殺生物性製品は認可を受けなければ市場に出せず、使えないと定めている。この商品が当たるか（うたい文句・使い方・有効成分）と、認可の名義（EU の会社）を輸入者と確かめる。手や肌に使うものは別の決まりになることがある（要確認）";
    const s = "EUR-Lex 規則 (EU) No 528/2012（殺生物性製品規則 BPR）第17条（官報 OJ L 167・2012-06-27。統合版 2026-08-19 あり）";
    addRule({ id: "v101b02", k: ["EU_BPR"], w: { h: ["*"], d: ["EU"], f: [FLAG_AMC] }, lv: "conditional", c, is: "輸入者（EU）", ld: 180, n, s, u: "https://eur-lex.europa.eu/eli/reg/2012/528/oj", ok: okOpen("当たるかは商品ごとに確かめる", "whether it applies depends on the product") },
      ["EU の殺生物性製品の認可（除菌・抗菌をうたう製品・BPR）", "EU biocidal product authorisation (antimicrobial claims, BPR)", "importer", "external", 180],
      [[c, "When selling in the EU a product that claims to sanitize, disinfect or kill germs (a biocidal product)"], [n, "Article 17 of the EU Biocidal Products Regulation (BPR, Regulation (EU) 528/2012) provides that biocidal products shall not be made available on the market or used unless authorised. Check with the importer whether this product is covered (claims, use, active substance) and who holds the authorisation (an EU company). Products used on hands or skin may fall under other rules (to be confirmed)."],
        [s, "EUR-Lex Regulation (EU) No 528/2012 (Biocidal Products Regulation, BPR), Art. 17 (OJ L 167, 27.6.2012; consolidated version 2026-08-19)"], ["EU の殺生物性製品の認可（除菌・抗菌をうたう製品・BPR）", "EU biocidal product authorisation (antimicrobial claims, BPR)"], ["輸入者（EU）", "Importer (EU)"]]);
  }
  {
    const c = "除菌・抗菌・殺菌をうたう商品を台湾で売る時（環境衛生用の殺菌剤などに当たるもの）";
    const n = "台湾の環境用薬管理法は、環境衛生用の殺虫剤・殺鼠剤・殺菌剤などを「環境用薬」とし（第5条）、製造・加工・輸入には中央主管機関の許可証が要る（第9条。許可の無い輸入品は退運）。この商品が当たるか（物の表面・空間に使う殺菌剤か、化粧品・医薬品か）と、許可証の名義（台湾の輸入者）を確かめる（要確認）";
    const s = "台湾 全国法規資料庫『環境用藥管理法』第5条・第9条（最終改正 2016-12-07）";
    addRule({ id: "v101b03", k: ["TW_ENV_AGENT"], w: { h: ["*"], d: ["TW"], f: [FLAG_AMC] }, lv: "conditional", c, is: "輸入者（台湾）", ld: 180, n, s, u: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=O0060001", ok: okOpen("当たるかは商品ごとに確かめる", "whether it applies depends on the product") },
      ["台湾 環境用薬の許可証（環境衛生用の殺菌剤など）", "Taiwan environmental agent permit (e.g. sanitation bactericides)", "importer", "external", 180],
      [[c, "When selling in Taiwan a product that claims to sanitize, disinfect or kill germs (e.g. an environmental sanitation bactericide)"], [n, "Taiwan's Environmental Agents Control Act treats environmental sanitation insecticides, rodenticides, bactericides etc. as “environmental agents” (Art. 5); manufacturing, processing or importing requires a permit from the central authority (Art. 9; unpermitted imports must be returned). Check whether this product is covered (surface/space bactericide vs cosmetic or drug) and who holds the permit (the Taiwan importer) (to be confirmed)."],
        [s, "Taiwan Laws & Regulations Database, Environmental Agents Control Act, Arts. 5 and 9 (last amended 2016-12-07)"], ["台湾 環境用薬の許可証（環境衛生用の殺菌剤など）", "Taiwan environmental agent permit (e.g. sanitation bactericides)"], ["輸入者（台湾）", "Importer (Taiwan)"]]);
  }

  /* ── R4：ペットフード（犬用おやつなど・HS 2309）の行。当局の頁で確かめた手続きだけ（条件つき・要確認）──
     シンガポールは 21.95 の層（v95）の「AVS の輸入の手続き（積荷ごとの CCP）」の行が、同じ AVS の頁を出どころに既にある（今回の頁の更新 2026-11-17 も確かめた）ので足さない */
  const FLAG_PET = "pet_food";
  {
    const c = "牛・豚・家きん由来の原料や乳を含むペットフードを香港へ送る時（香港は、犬・猫・ワシントン条約の対象の種に由来しなければ、輸入の許可は要らない）";
    const n = "香港の漁農自然護理署（AFCD）は、ペットフードは犬・猫・ワシントン条約の対象の種に由来しなければ輸入の許可は要らないとし、牛・豚・家きん由来の原料や乳を含むものは、輸出国の獣医当局が出す（または裏書きした）証明書を付けることを勧めている（義務ではない）。日本の動物検疫所で出せるか・輸入者が求めるかを確かめる。表示の決まりは要確認";
    const s = "香港 漁農自然護理署（AFCD）『Import and Export of Animals and Animal Products』FAQ（頁の表示 2026-06-16）";
    addRule({ id: "v101p01", k: ["HK_PET_VC"], w: { h: ["*"], d: ["HK"], f: [FLAG_PET] }, lv: "conditional", c, is: "動物検疫所（日本）・輸入者", ld: 7, n, s, u: "https://www.afcd.gov.hk/english/quarantine/qua_ie/f_a_q.html", ok: okOpen("勧めか義務かと、日本で出せるかは輸入者と動物検疫所に確かめる", "check with the importer and Japan's Animal Quarantine Service whether it is needed and can be issued") },
      ["香港向けペットフードの獣医の証明書（輸出国の公的な証明・AFCD が勧めるもの）", "Veterinary certificate for pet food to Hong Kong (recommended by AFCD)", "aqs", "external", 7],
      [[c, "When sending pet food containing ruminant, porcine or poultry ingredients or milk to Hong Kong (no import permit is needed unless derived from cats, dogs or CITES-listed species)"], [n, "Hong Kong's AFCD says pet food needs no import permit unless derived from cats, dogs or CITES-listed species, and recommends (does not require) an official veterinary certificate issued or endorsed by the exporting country for products of ruminant, porcine or poultry origin or milk. Check whether Japan's Animal Quarantine Service can issue it and whether the importer wants it. Labelling rules to be confirmed."],
        [s, "Hong Kong AFCD “Import and Export of Animals and Animal Products” FAQ (page shows 2026-06-16)"], ["香港向けペットフードの獣医の証明書（輸出国の公的な証明・AFCD が勧めるもの）", "Veterinary certificate for pet food to Hong Kong (recommended by AFCD)"], ["動物検疫所（日本）・輸入者", "Animal Quarantine Service (Japan) / importer"]]);
  }
  {
    const c = "偶蹄類（牛・豚など）や鳥類（鶏など）由来の原料を含む犬猫用の食品（2309.10）・ペット用のかむおやつを台湾へ送る時";
    const n = "台湾 農業部動植物防疫検疫署の「犬猫食品輸入検疫条件」（2022-03-29 公告）は、製造工場が輸出国の当局に犬猫用食品の工場として認められていること、新しく清潔な容器で詰めること、荷ごとに輸出国の動物検疫当局が出す証明書の原本（英語か中国語：輸入者・輸出者・工場・品名・数量・重さ・製造日・原料の動物の種類など）を付けることを定めている。疫病の発生国からは加熱の条件（中心 70℃・30分など）や当局の審査もある。日本がどの区分か・証明書が出せるかを動物検疫所と輸入者に確かめる（要確認）";
    const s = "台湾 農業部動植物防疫検疫署『犬貓食品輸入檢疫條件』（英語版 Attachment 15-1・2022-03-29 公告・2022-04-29 から適用）";
    addRule({ id: "v101p02", k: ["HC_PETFOOD"], w: { h: ["*"], d: ["TW"], f: [FLAG_PET] }, lv: "conditional", c, is: "動物検疫所（日本）", ld: 14, n, s, u: "https://www.aphia.gov.tw/ws.php?id=9624", ok: okOpen("当てはまるかは原料と日本の区分で確かめる", "whether it applies depends on the ingredients and Japan's status") },
      null,
      [[c, "When sending dog/cat food (2309.10) or pet chews containing Artiodactyla (cattle, pigs…) or Aves (chicken…) ingredients to Taiwan"], [n, "Taiwan APHIA's Quarantine Requirements for the Importation of Dog and Cat Food (promulgated 2022-03-29) require the plant to be approved by the exporting country's authority, clean new containers, and an original veterinary certificate from the exporting country's animal quarantine authority with each consignment (English or Chinese: importer, exporter, plant, product, quantity, weight, manufacturing date, animal species of ingredients, etc.). Products from countries not free of designated diseases also need heat treatment (e.g. core 70°C for 30 min) and authority review. Check Japan's status and certificate availability with the Animal Quarantine Service and the importer (to be confirmed)."],
        [s, "Taiwan APHIA “Quarantine Requirements for the Importation of Dog and Cat Food” (English, Attachment 15-1; promulgated 2022-03-29, applicable from 2022-04-29)"], ["動物検疫所（日本）", "Animal Quarantine Service (Japan)"]]);
  }
  {
    const s = "米国 FDA『Importing - Animal Food』（Content current as of 2025-02-14）";
    const sEn = "US FDA “Importing - Animal Food” (content current as of 2025-02-14)";
    const c1 = "米国にペットフード（おやつを含む）を売る時";
    const n1 = "米国 FDA は、動物用の食品（ペットフード）も、施設の登録と荷ごとの事前通報（Prior Notice）の対象とし、正しく表示すること（連邦の動物用食品の表示の決まり 21 CFR Part 501）を求めている。州ごとの表示の決まりもある。表示の中身は輸入者と確かめる（要確認）";
    addRule({ id: "v101p03", k: ["US_PET_LABEL"], w: { h: ["*"], d: ["US"], f: [FLAG_PET] }, lv: "conditional", c: c1, is: "自社・輸入者", ld: 14, n: n1, s, u: "https://www.fda.gov/animal-veterinary/import-exports/importing-animal-food", ok: okOpen("表示の中身は輸入者と確かめる", "confirm the label content with the importer") },
      ["米国のペットフードの表示（21 CFR Part 501・州の決まり）", "US pet food labeling (21 CFR Part 501, state rules)", "self", "draft_template", 14],
      [[c1, "When selling pet food (including treats) in the US"], [n1, "US FDA treats animal food (pet food) as subject to facility registration and prior notice for each shipment, and requires truthful labeling (federal animal food labeling regulations, 21 CFR Part 501). States may have their own labeling rules. Confirm the label content with the importer (to be confirmed)."],
        [s, sEn], ["米国のペットフードの表示（21 CFR Part 501・州の決まり）", "US pet food labeling (21 CFR Part 501, state rules)"], ["自社・輸入者", "Your company / importer"]]);
    const c2 = "肉・乳などの動物由来の原料を含むペットフードを、家畜の伝染病がある国から米国へ送る時";
    const n2 = "FDA の頁は、家畜の伝染病（exotic livestock diseases）がある国からの動物由来の原料（乳製品・肉など）を含むものは、一般に USDA APHIS の獣医部門（VS）の輸入許可が要るとしている。日本の鶏肉などの原料が当たるかを輸入者と確かめる（要確認）";
    addRule({ id: "v101p04", k: ["US_APHIS_VS"], w: { h: ["*"], d: ["US"], f: [FLAG_PET] }, lv: "conditional", c: c2, is: "輸入者（米国）", ld: 30, n: n2, s, u: "https://www.fda.gov/animal-veterinary/import-exports/importing-animal-food", ok: okOpen("当たるかは原料と日本の状況で輸入者と確かめる", "check with the importer whether it applies to the ingredients from Japan") },
      ["米国 USDA APHIS の獣医部門の輸入許可（動物由来の原料を含む時）", "USDA APHIS Veterinary Services import permit (animal-origin ingredients)", "importer", "external", 30],
      [[c2, "When sending pet food with animal-origin ingredients (meat, milk…) to the US from a country with exotic livestock diseases"], [n2, "The FDA page says products with animal-origin ingredients (dairy, meat, etc.) from countries with exotic livestock diseases generally need a USDA APHIS Veterinary Services (VS) import permit. Check with the importer whether ingredients from Japan (e.g. chicken) are covered (to be confirmed)."],
        ["米国 USDA APHIS の獣医部門の輸入許可（動物由来の原料を含む時）", "USDA APHIS Veterinary Services import permit (animal-origin ingredients)"], ["輸入者（米国）", "Importer (US)"]]);
  }
  {
    const c = "ベトナムにペットフードを輸出する時（輸入の登録・検疫などの手続きは、アプリで当局の頁を確かめられていない）";
    const n = "ベトナムのペットフード（飼料）の輸入の手続きは、当局の頁で確かめられていない（要確認）。輸入者に聞くか、「AI で最新規制を詳細調査」で確かめる。人の食品の手続き（食品の自己公表など）はペットフードには当てはめていない";
    const ok = "要確認（ペットフードの手続きは AI 詳細調査で確かめてください）";
    addRule({ id: "v101p05", k: ["VN_PET_TBC"], w: { h: ["*"], d: ["VN"], f: [FLAG_PET] }, lv: "check", c, is: "輸入者（ベトナム）", ld: 0, n, s: "", u: "", ok },
      ["ベトナム ペットフードの輸入の手続き（アプリで未確認）", "Vietnam pet food import procedures (not verified in the app)", "importer", "external", 0],
      [[c, "When exporting pet food to Vietnam (the app has not verified the import registration/quarantine procedures on an official page)"], [n, "Vietnam's import procedures for pet food (animal feed) have not been verified on an official page (to be confirmed). Ask the importer or use “AI detailed research”. Human-food procedures (e.g. food self-declaration) are not applied to pet food."],
        [ok, "To be confirmed (check the pet food procedures with the AI detailed research)", "需确认（宠物食品的手续请用 AI 详细调查确认）", "Por confirmar (verifique los trámites de alimentos para mascotas con la investigación detallada de IA)"], ["ベトナム ペットフードの輸入の手続き（アプリで未確認）", "Vietnam pet food import procedures (not verified in the app)"], ["輸入者（ベトナム）", "Importer (Vietnam)"]]);
  }
  try {
    if (typeof V85DOC_D !== "undefined" && V85DOC_D && Array.isArray(V85DOC_D.rules)) { // eslint-disable-line no-undef
      const D85 = V85DOC_D; // eslint-disable-line no-undef
      D85.flags = D85.flags || {}; D85.docs = D85.docs || {};
      if (!D85.flags[FLAG_PET]) D85.flags[FLAG_PET] = "ペットフード（犬・猫のおやつ・かむおやつを含む）";
      dictAdd("ペットフード（犬・猫のおやつ・かむおやつを含む）", "Pet food (incl. dog/cat treats and chews)", "宠物食品（含犬猫零食・咬胶）", "Alimento para mascotas (incl. premios y masticables)");
      Object.keys(ADD_DOCS).forEach((k) => { if (!D85.docs[k]) D85.docs[k] = ADD_DOCS[k]; });
      ADD_RULES.forEach((r) => { if (!D85.rules.some((x) => x && x.id === r.id)) D85.rules.push(r); });
      ADD_TR.forEach((x) => dictAdd(x[0], x[1], x[2] || x[1], x[3] || x[1]));
    }
  } catch (e) { err("addRules", e); }

  /* ── R4：ペットフードに人の食品の手続きを出さない ──
     原因：H（犬用おやつ）が区分「食品（人の食品）」で登録されると（v2 の N1・区分の直しは hear の担当）、ひな形の表（regsFor）が人の食品の手続き
           （香港の食品表示・栄養表示・シンガポールの SFA 輸入ライセンスなど）を出し、書類の判断の表も人の食品の行（台湾 TFDA の輸入査験・
           ベトナムの食品の自己公表・自由販売証明〔食品〕など）を当てていた。区分の直しに関係なく、商品がペットフードなら外す */
  function petWhy(d, hs) {
    const h = String(hs || (d && d.hs) || "").replace(/\D/g, "");
    if (/^2309/.test(h)) return "HS 2309（ペットフード）";
    const t = d || {};
    const nm = [t.item, t.itemEn].join(" ");
    if (/ペット用品/.test(String(t.cat || "")) || t.catKey === "pet") { if (/フード|おやつ|ジャーキー|ガム|飼料|treat|food|jerky|chew/i.test(nm)) return "区分・品名（ペット用のフード・おやつ）"; }
    if (/犬用|猫用|ペット(?:フード|用(?:の)?(?:おやつ|フード))|\b(?:dog|cat|pet)\s+(?:food|treats?|chews?|jerky)\b/i.test(nm)) return "品名（犬用・猫用・ペット用のフード・おやつ）";
    return "";
  }
  V.petWhy = petWhy;
  function isPetNow() { try { const t = ten() || {}, d = dd() || {}; return !!(petWhy(t, t.hs || d.hs) || petWhy(d, d.hs || t.hs)); } catch (e) { return false; } }
  V.isPetNow = isPetNow;
  const PET_HUMAN_KEYS = new Set(["TW_TFDA", "VN_DECL", "FSC_FOOD", "TH_FDA", "KR_MFDS", "SG_SFA"]);
  V.petHuman = function (r, Fx) {
    if (!r || !Array.isArray(r.k) || !r.k.length || !r.k.every((k) => PET_HUMAN_KEYS.has(k))) return false;
    const pet = !!(Fx && Fx.flags && Fx.flags[FLAG_PET]) || !!petWhy({}, Fx && Fx.hs) || isPetNow();
    return pet;
  };
  const PET_HUMAN_DOC = /香港の食品表示|栄養成分表示|^栄養表示|Nutrition Facts|SFA ?輸入ライセンス|SFA import licen[cs]e|TFDA|食品の?輸入査験|輸入食品の査験|自己公表/i;
  V.PET_HUMAN_DOC = PET_HUMAN_DOC;
  function petDocsFix(r) {
    if (!r || typeof r !== "object" || !Array.isArray(r.docs)) return 0;
    const before = r.docs.length;
    const keep = r.docs.filter((d) => !PET_HUMAN_DOC.test(String(d)));
    if (keep.length !== before) { r.docs = keep; try { Object.defineProperty(r, "_v101pet", { value: before - keep.length, enumerable: false, configurable: true, writable: true }); } catch (e) { /* 印だけ */ } V.n.petDoc = (V.n.petDoc || 0) + (before - keep.length); }
    return before - keep.length;
  }
  function petFixD() { try { if (!isPetNow()) return 0; const d = dd(); if (!d || !d.regs) return 0; let n = 0; Object.keys(d.regs).forEach((c) => { n += petDocsFix(d.regs[c]); }); return n; } catch (e) { err("petFixD", e); return 0; } }
  V.petFixD = petFixD;
  if (fn("regsFor") && !W.regsFor.__v101buyer) {
    const __rf = W.regsFor;
    const g = function () { const out = __rf.apply(this, arguments); try { if (out && isPetNow()) Object.keys(out).forEach((c) => petDocsFix(out[c])); } catch (e) { err("regsForPet", e); } return out; };
    g.__v101buyer = 1;
    W.regsFor = g;
  }
  if (fn("v54rExtras") && !W.v54rExtras.__v101buyer) {
    const __ex = W.v54rExtras;
    const g = function (c, cat, docs) { try { if (isPetNow()) return; } catch (e) { /* 下へ */ } return __ex.apply(this, arguments); };
    g.__v101buyer = 1;
    W.v54rExtras = g;
  }
  if (fn("v54rStatus") && !W.v54rStatus.__v101buyer) {
    const __st = W.v54rStatus;
    const g = function () { try { petFixD(); } catch (e) { /* 無視 */ } return __st.apply(this, arguments); };
    g.__v101buyer = 1;
    W.v54rStatus = g;
  }

  /* ═════════════════════════════════════════════════════════════════════════════════════════════
     22.01.2（2回目・検証役 w1・w2 の報告から）
       w2-1 文面の原材料・材質・品番の言い方を登録にそろえる（H「雞胸肉」→ 登録は「ささみ」）
       w2-3 AI につながらずリストが作れないときの言い方（一時的な失敗は「少し待ってから」）・0社のときの形
       w2-9 確かめの時間の目安と、終わった後の「まだ確かめていません」と各行の「つながりませんでした」の食い違い
       （w2-5 本文の欄をその場で直せるように・w2-15 は rd_v101buyer.js と上の filt）
     ═════════════════════════════════════════════════════════════════════════════════════════════ */
  V.ver2 = "22.01.2-2";

  /* ── w2-1：登録の名前にそろえる ──
     原因：AI バイヤー開拓の文面は、資料の照合（fact の担当）を通らない。AI は登録の「ささみ」を「雞胸肉（鶏むね肉）」と訳し、件名・本文・フォローに残った。
     直し：①AI への頼みに、登録の名前（原材料・材質・品番）と、その英・中（繁・簡）・西の言い方を渡す（【v101reg】）
           ②できた文面（件名・本文・フォロー・DM・返信・見積の文面＝v101unkFix を通る文面）を登録と突き合わせ、同じ仲間の別の名前
             （ささみ／むね肉／もも肉・ブナ／ヒノキ／スギ／オーク／パイン・PP／PE／PET・ステンレス／アルミ・綿／ポリエステル／ナイロン）を
             登録の名前に置き換える。同じ文に登録の名前もあるとき（「ささみで、むね肉ではない」など）は触らない。
             品番は、登録の品番と英字が同じで数字だけ違うもの（FP-210 など）を登録の品番に。 */
  const cap1 = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const wre = (en) => new RegExp("\\b(?:" + en + "|" + cap1(en) + "(?=\\s*(?:wood|timber)))(?:\\s*wood)?\\b", "g"); // 英語の木の名前は小文字か「… wood」だけ（社名の「Cedar Toys」を拾わない）
  const FAM = [
    { k: "chicken", lab: "鶏肉の部位", items: [
      { id: "tender", ja: /ささみ|笹身|ササミ/, tr: { en: "chicken tenderloin", zht: "雞里肌", zhs: "鸡里脊", es: "solomillo de pollo", ja: "ささみ" },
        re: { en: /\bchicken\s+tenderloins?\b/gi, zh: /雞里肌|鸡里脊|雞柳|鸡柳/g, es: /\bsolomillos?\s+de\s+pollo\b/gi, ja: /ささみ|笹身|ササミ/g } },
      { id: "breast", ja: /むね肉|胸肉|ムネ肉/, tr: { en: "chicken breast", zht: "雞胸肉", zhs: "鸡胸肉", es: "pechuga de pollo", ja: "むね肉" },
        re: { en: /\bchicken\s+breasts?\b(?!\s+(?:tenderloin|fillet))/gi, zh: /雞胸肉|鸡胸肉|雞胸(?!里肌)|鸡胸(?!里脊)/g, es: /\bpechugas?\s+de\s+pollo\b/gi, ja: /鶏むね肉|鶏胸肉|むね肉|胸肉/g } },
      { id: "thigh", ja: /もも肉|モモ肉|腿肉/, tr: { en: "chicken thigh", zht: "雞腿肉", zhs: "鸡腿肉", es: "muslo de pollo", ja: "もも肉" },
        re: { en: /\bchicken\s+thighs?\b/gi, zh: /雞腿肉|鸡腿肉/g, es: /\bmuslos?\s+de\s+pollo\b/gi, ja: /鶏もも肉|もも肉/g } }] },
    { k: "wood", lab: "木の種類", items: [
      { id: "beech", ja: /ブナ|橅/, tr: { en: "beech", zht: "山毛櫸", zhs: "山毛榉", es: "haya", ja: "ブナ" }, re: { en: wre("beech"), zh: /山毛櫸|山毛榉|櫸木|榉木/g, es: /\bmadera\s+de\s+haya\b|\bhaya\b/g, ja: /ブナ材?|橅/g } },
      { id: "hinoki", ja: /ヒノキ|檜|桧/, tr: { en: "hinoki cypress", zht: "檜木", zhs: "桧木", es: "ciprés hinoki", ja: "ヒノキ" }, re: { en: /\bhinoki(?:\s+cypress)?\b|\bcypress(?:\s*wood)?\b/g, zh: /檜木|桧木|扁柏/g, es: /\bciprés(?:\s+hinoki)?\b/g, ja: /ヒノキ材?|檜|桧/g } },
      { id: "sugi", ja: /スギ材|杉材|杉の木/, tr: { en: "Japanese cedar (sugi)", zht: "杉木", zhs: "杉木", es: "cedro japonés", ja: "スギ" }, re: { en: wre("cedar"), zh: /杉木/g, es: /\bcedro(?:\s+japonés)?\b/g, ja: /スギ材|杉材/g } },
      { id: "oak", ja: /オーク|ナラ材|楢/, tr: { en: "oak", zht: "橡木", zhs: "橡木", es: "roble", ja: "オーク" }, re: { en: wre("oak"), zh: /橡木/g, es: /\broble\b/g, ja: /オーク材?|ナラ材|楢/g } },
      { id: "pine", ja: /パイン材|松材/, tr: { en: "pine", zht: "松木", zhs: "松木", es: "pino", ja: "パイン" }, re: { en: wre("pine"), zh: /松木/g, es: /\bpino\b/g, ja: /パイン材|松材/g } },
      { id: "maple", ja: /メープル|カエデ材|楓/, tr: { en: "maple", zht: "楓木", zhs: "枫木", es: "arce", ja: "メープル" }, re: { en: wre("maple"), zh: /楓木|枫木/g, es: /\barce\b/g, ja: /メープル材?|カエデ材/g } }] },
    { k: "resin", lab: "樹脂", skip: true, items: [
      { id: "pp", ja: /ポリプロピレン|\bPP\b/, tr: { en: "polypropylene", zht: "聚丙烯", zhs: "聚丙烯", es: "polipropileno", ja: "ポリプロピレン" }, re: { en: /\bpolypropylene\b/gi, zh: /聚丙烯/g, es: /\bpolipropileno\b/gi, ja: /ポリプロピレン/g } },
      { id: "pe", ja: /ポリエチレン(?!テレフタラート)|\bPE\b/, tr: { en: "polyethylene", zht: "聚乙烯", zhs: "聚乙烯", es: "polietileno", ja: "ポリエチレン" }, re: { en: /\bpolyethylene\b(?!\s+terephthalate)/gi, zh: /聚乙烯/g, es: /\bpolietileno\b(?!\s+tereftalato)/gi, ja: /ポリエチレン(?!テレフタラート)/g } },
      { id: "pet", ja: /\bPET\b|ポリエチレンテレフタラート/, tr: { en: "PET", zht: "PET", zhs: "PET", es: "PET", ja: "PET" }, re: { en: /\bpolyethylene\s+terephthalate\b/gi, zh: /聚對苯二甲酸乙二酯|聚对苯二甲酸乙二酯/g, es: /\bpolietileno\s+tereftalato\b/gi, ja: /ポリエチレンテレフタラート/g } }] },
    { k: "metal", lab: "金属", skip: true, items: [
      { id: "sus", ja: /ステンレス|SUS\d/, tr: { en: "stainless steel", zht: "不鏽鋼", zhs: "不锈钢", es: "acero inoxidable", ja: "ステンレス" }, re: { en: /\bstainless\s+steel\b/gi, zh: /不鏽鋼|不锈钢/g, es: /\bacero\s+inoxidable\b/gi, ja: /ステンレス/g } },
      { id: "al", ja: /アルミ/, tr: { en: "aluminium", zht: "鋁", zhs: "铝", es: "aluminio", ja: "アルミ" }, re: { en: /\balumin(?:i)?um\b/gi, zh: /鋁(?!箔)|铝(?!箔)/g, es: /\baluminio\b/gi, ja: /アルミ(?:ニウム)?(?!箔)/g } }] },
    { k: "fiber", lab: "繊維", skip: true, items: [
      { id: "cotton", ja: /綿|コットン/, tr: { en: "cotton", zht: "棉", zhs: "棉", es: "algodón", ja: "綿" }, re: { en: /\bcotton\b/gi, zh: /純棉|棉質|棉质|棉布/g, es: /\balgodón\b/gi, ja: /綿(?:100|素材)|コットン/g } },
      { id: "poly", ja: /ポリエステル/, tr: { en: "polyester", zht: "聚酯纖維", zhs: "聚酯纤维", es: "poliéster", ja: "ポリエステル" }, re: { en: /\bpolyester\b/gi, zh: /聚酯纖維|聚酯纤维|滌綸|涤纶/g, es: /\bpoliéster\b/gi, ja: /ポリエステル/g } },
      { id: "nylon", ja: /ナイロン/, tr: { en: "nylon", zht: "尼龍", zhs: "尼龙", es: "nailon", ja: "ナイロン" }, re: { en: /\bnylon\b/gi, zh: /尼龍|尼龙/g, es: /\bnail?on\b/gi, ja: /ナイロン/g } }] }
  ];
  V.FAM = FAM;
  const PACK_CTX = /\b(?:bags?|pack(?:s|ed|ing|aging|age)?|pouch(?:es)?|wrap(?:ped|ping)?|labels?|cartons?|boxes|bottles?|caps?|containers?)\b|袋|包装|包裝|ラベル|標籤|标签|容器|瓶|ボトル|キャップ|\b(?:bolsas?|envases?|embalaje|etiquetas?)\b/i;
  function regTextOf(T) {
    const t = T || {};
    const a = [t.item, t.itemEn, t.desc];
    try { (Array.isArray(t.compRows) ? t.compRows : []).forEach((r) => a.push(Array.isArray(r) ? r.join(" ") : String(r || ""))); } catch (e) { /* 無視 */ }
    try { (Array.isArray(t.strengths) ? t.strengths : []).forEach((s) => a.push(Array.isArray(s) ? s.join(" ") : String(s || ""))); } catch (e) { /* 無視 */ }
    try { const A = t.v68attrs; if (A && typeof A === "object") Object.keys(A).forEach((k) => { if (typeof A[k] === "string") a.push(A[k]); }); } catch (e) { /* 無視 */ }
    return a.filter(Boolean).join(" ／ ");
  }
  // 登録の名前（仲間ごとに1つだけ当たるとき＝あいまいでないとき）
  function regTerms(T) {
    const rt = regTextOf(T), out = [];
    FAM.forEach((f) => { const hit = f.items.filter((it) => it.ja.test(rt) || (it.re.en && new RegExp(it.re.en.source, "i").test(rt))); if (hit.length === 1) out.push({ fam: f, reg: hit[0] }); });
    return out;
  }
  V.regTerms = (T) => regTerms(T || ten()).map((x) => x.fam.k + ":" + x.reg.id);
  function skuOf(T) { const s = String((T && T.sku) || "").trim(); return /^[A-Za-z]{1,6}-?\d{2,6}[A-Za-z]{0,4}$/.test(s) ? s : ""; }
  function lgKey(lg) { return lg === "zht" || lg === "zhs" ? "zh" : lg; }
  function termFix(text, hint, T) {
    T = T || ten();
    const s0 = String(text == null ? "" : text);
    const hits = [];
    if (!s0.trim() || !T) return { text: s0, hits };
    const RT = regTerms(T), sku = skuOf(T);
    if (!RT.length && !sku) return { text: s0, hits };
    const lines = s0.split("\n").map((line) => {
      if (!line.trim()) return line;
      return sents2(line).map((sen) => {
        let x = sen;
        const lg = langOf(sen, hint), lk = lgKey(lg);
        RT.forEach(({ fam, reg }) => {
          if (fam.skip && PACK_CTX.test(x)) return; // 樹脂・金属・繊維は、包装・袋・ラベルの話の文では触らない（中身と包装は材質が違うことがある）
          const regRe = reg.re[lk] ? new RegExp(reg.re[lk].source, reg.re[lk].flags) : null;
          if (regRe && regRe.test(x)) return; // 同じ文に登録の名前もある（比べている文）は触らない
          fam.items.forEach((it) => {
            if (it === reg) return;
            const re = it.re[lk]; if (!re) return;
            const R = new RegExp(re.source, re.flags.indexOf("g") >= 0 ? re.flags : re.flags + "g");
            const to = reg.tr[lg] || reg.tr[lk] || reg.tr.en;
            x = x.replace(R, (m0) => { hits.push({ k: "term", m: m0 + "→" + to, dropped: false }); return (lk === "en" || lk === "es") && /^[A-Z]/.test(m0) ? cap1(to) : to; });
          });
        });
        if (sku) {
          const pre = sku.replace(/[-\d].*$/, "").toUpperCase(), norm = (y) => y.replace(/-/g, "").toUpperCase();
          x = x.replace(/\b([A-Za-z]{1,6})-?(\d{2,6})([A-Za-z]{0,4})\b/g, (m0, a) => {
            if (a.toUpperCase() !== pre || norm(m0) === norm(sku)) return m0;
            hits.push({ k: "term", m: m0 + "→" + sku, dropped: false });
            return sku;
          });
        }
        return x;
      }).join("");
    });
    const t = lines.join("\n");
    if (t !== s0) V.n.termFix = (V.n.termFix || 0) + 1;
    return { text: t, hits };
  }
  V.termFix = termFix;
  function termScan(text, hint, T) {
    const r = termFix(text, hint, T);
    return r.hits.length ? [{ k: "term", lab: "登録と違う名前", m: r.hits[0].m.slice(0, 40) }] : [];
  }
  V.termScan = termScan;
  function termPrompt(T) {
    T = T || ten();
    if (!T) return "";
    const RT = regTerms(T), sku = skuOf(T);
    const L = RT.map(({ fam, reg }) => {
      const ng = fam.items.filter((it) => it !== reg).map((it) => [it.tr.en, it.tr.zht, it.tr.zhs].join("・")).join("・");
      return "・" + fam.lab + "：「" + reg.tr.ja + "」（英 " + reg.tr.en + "／繁 " + reg.tr.zht + "／簡 " + reg.tr.zhs + "／西 " + reg.tr.es + "。" + ng + " と書かない）";
    });
    if (sku) L.push("・品番：" + sku + "（このとおりに書く）");
    if (T.itemEn) L.push("・英語の品名：" + String(T.itemEn).slice(0, 80));
    return L.length ? "■【v101reg】登録の名前（文面ではこの言い方を使う。訳すときもこの訳にそろえる）\n" + L.join("\n") : "";
  }
  V.termPrompt = termPrompt;

  /* ── w2-3：AI につながらずリストが作れないとき（22.00 の層は理由に関係なく「0時（日本時間）以降に「AI で作り直す」」と出していた） ──
     上限（cap）・取り置き（reserve）のときだけ「0時以降」。AI が応答しない・つながらない（error・off）は一時的なことが多いので「少し待ってから」 */
  const OFF_JA = /0時（日本時間）以降に「AI で作り直す」で(?:新しいリストを)?作れます。?/g;
  const OFF_EN = /Rebuild with AI after midnight JST\.?/g;
  const OFF_TO_JA = "少し待ってから「AI で作り直す」を押すと作り直せます（通信の切れ目など、一時的に AI が答えないことがあります）。";
  const OFF_TO_EN = "Wait a moment, then press “Rebuild with AI” (the AI sometimes does not answer for a short time).";
  dictAdd(OFF_TO_JA, OFF_TO_EN, "请稍等片刻后按“用 AI 重新生成”（AI 有时会暂时没有回应）。", "Espere un momento y pulse «Rehacer con IA» (a veces la IA no responde durante un momento).");
  function offTemp(run) { return !!(run && run.v100 && !/^(cap|reserve)$/.test(String(run.v100.reason || ""))); }
  V.offTemp = offTemp;
  V.offFix = function (h, run) { if (!offTemp(run)) return h; return String(h).replace(OFF_JA, OFF_TO_JA).replace(OFF_EN, OFF_TO_EN); };
  (function () {
    const o = W.v71obBuild;
    if (typeof o !== "function" || o.__v101b2) return;
    const g = async function () {
      let before = null; try { before = fn("v71obRun") ? W.v71obRun() : null; } catch (e) { before = null; }
      const r = await o.apply(this, arguments);
      try {
        const run = fn("v71obRun") ? W.v71obRun() : null;
        if (run && run !== before && offTemp(run)) {
          if (typeof run.insight === "string") run.insight = V.offFix(run.insight, run);
          if (fn("v71obSave")) W.v71obSave();
          if (fn("v71obPaint")) W.v71obPaint();
          const n = (run.leads || []).length;
          try { if (typeof toast === "function") toast(n ? F(M("AI の新しいリストは作れませんでした。前のリストの {n}社を出しています。少し待ってから「AI で作り直す」を押してください", "No new AI list. Showing {n} companies from earlier lists. Wait a moment, then press “Rebuild with AI”"), { n }) : M("AI のリストは作れませんでした（AI が答えませんでした）。少し待ってから「AI で作り直す」を押してください（通信の切れ目など、一時的なことがあります）", "The AI list could not be made. Wait a moment, then press “Rebuild with AI”")); } catch (e) { /* 無視 */ } // eslint-disable-line no-undef
        }
      } catch (e) { err("offBuild", e); }
      return r;
    };
    g.__v101b2 = 1; g.__v101buyer = 1;
    W.v71obBuild = g;
  })();
  // リストの中身（表の上の見出し・知らせ）：一時的な失敗の言い方と、0社のときの形
  (function () {
    const o = W.v71obInner;
    if (typeof o !== "function" || o.__v101b2) return;
    const g = function () {
      let h = String(o.apply(this, arguments) || "");
      try {
        const run = fn("v71obRun") ? W.v71obRun() : null;
        if (run && run.how !== "smp" && !run.v100smp) {
          h = V.offFix(h, run);
          if (!(run.leads || []).length) {
            // 0社：「0社（11:09 作成）」→「0社（11:09 に作ろうとしましたが、作れていません）」。公式サイトの確かめの行は出さない（確かめる会社が無い）
            h = h.replace(/：0社（([^）]+) 作成）/, (m0, d) => "：" + F(M("0社（{d} に作ろうとしましたが、作れていません）", "0 companies (tried at {d}; not made)"), { d }));
            h = h.replace(/<div class="v79chk"[\s\S]*?<\/div>/, "");
          }
        }
      } catch (e) { err("inner2", e); }
      return h;
    };
    g.__v101b2 = 1; g.__v101buyer = 1;
    W.v71obInner = g;
  })();

  /* ── w2-9：確かめの時間の目安・終わった後の言い方 ── */
  V.chkEta = function (n) { return n > 5 ? M("2〜5分", "2–5 min", "约2〜5分钟", "2–5 min") : M("1〜3分", "1–3 min", "约1〜3分钟", "1–3 min"); };
  (function () {
    const o = W.v79obCheckHtml;
    if (typeof o !== "function" || o.__v101b2) return;
    const g = function (run) {
      let h = String(o.apply(this, arguments) || "");
      try {
        if (!run || run.how === "smp" || run.v100smp) return h;
        const L = (run.leads || []).filter((l) => l && !l.smp && !l.v79x);
        if (!L.length) return ""; // 0社：確かめる会社が無い
        if (busyRun(run)) {
          // 時間の目安を実際に合わせ、経過の時間を出す（rd が毎秒書き換える）
          h = h.replace(/（(\d+)社・1〜2分）/, (m0, n) => "（" + n + M("社・", " companies, ") + V.chkEta(+n) + "）").replace(/\((\d+) companies, 1–2 min\)/, (m0, n) => "(" + n + " companies, " + V.chkEta(+n) + ")");
          const t0 = (V.chk && V.chk.at) || Date.now();
          if (!/data-v101-buyer-elapsed/.test(h)) h = h.replace(/<\/div>\s*$/, `<span class="v101b-elapsed" data-v101-buyer-elapsed="${t0}" data-noi18n="1"></span></div>`);
          return h;
        }
        // 終わった後：確かめようとして届かなかった会社を「まだ確かめていません」と言わない（各行の「つながりませんでした（2回試しました）」とそろえる）
        if (run.v79chk && run.v79chk.st === "ok") {
          const okSt = (l) => l.v79u && /^(ok|redir|dead)$/.test(l.v79u.st);
          const rest = L.filter((l) => !okSt(l) && String(l.url || "").trim());
          const att = rest.filter((l) => l.v79u && l.v79u.st).length, notyet = rest.length - att;
          if (att) {
            const ja = notyet ? F("{a}社は確かめられず（理由は各行に書いています）、{b}社はまだ確かめていません（「要確認」のまま）。", { a: att, b: notyet }) : F("{a}社は確かめられませんでした（理由は各行に書いています・「要確認」のまま）。", { a: att });
            const en = notyet ? F("{a} could not be checked (reason on each row) and {b} are not checked yet (still “to be confirmed”).", { a: att, b: notyet }) : F("{a} could not be checked (reason on each row; still “to be confirmed”).", { a: att });
            h = h.replace(/(\d+)社はまだ確かめていません（「要確認」のまま）。/, ja).replace(/(\d+) companies not checked yet \(still “to be confirmed”\)\./, en);
            h = h.replace(/確かめ直す（まだの (\d+)社）/, (m0, k) => F("確かめ直す（{k}社）", { k })).replace(/Check again \((\d+) left\)/, (m0, k) => "Check again (" + k + ")");
          }
        }
      } catch (e) { err("chkHtml2", e); }
      return h;
    };
    g.__v101b2 = 1; g.__v101buyer = 1;
    W.v79obCheckHtml = g;
  })();

  /* ══════ 22.01.3（22.01.2 の公開後の検証 x2 の直し）══════
     x2-1【高・戻り】適合の「不明」の見分けを問いの言い方に左右されないように（上の unkFallback・unkTopicsOf）
     x2-6 AI につながらないときの知らせの食い違い（「STANDAGE の AI につながりました」のすぐ後に「AI のリストは作れませんでした」）
     x2-7 確かめ中の言い方（上の表の上の帯）・AI の答えが届いた時点の「✅ 完了しました」（確かめはまだ続く）
     x2-8 署名が未登録の知らせに【差出人の名前（英字）】を入れる・行に残る古い知らせを今の署名で言い直す */
  V.ver3 = "22.01.3";
  function obBusyNow() { try { return !!(typeof V71OB !== "undefined" && V71OB && V71OB.busy); } catch (e) { return false; } } // eslint-disable-line no-undef
  // x2-6：リストを作っている間と、作れなかった直後（30秒）は「STANDAGE の AI につながりました」を出さない（AI が答えなかった知らせと食い違うため）
  (function () {
    const o = W.v63aToast;
    if (typeof o !== "function" || o.__v101b3) return;
    const g = function (k) {
      try {
        if (k === "on" && ((V.obBuilding && obBusyNow()) || Date.now() - (+V.obFailAt || 0) < 30000)) { V.airOnQuiet = (V.airOnQuiet || 0) + 1; return; }
      } catch (e) { err("airToast", e); }
      return o.apply(this, arguments);
    };
    g.__v101b3 = 1; g.__v101buyer = 1;
    W.v63aToast = g;
  })();
  (function () {
    const o = W.v71obBuild;
    if (typeof o !== "function" || o.__v101b3) return;
    const g = async function () {
      let before = null; try { before = fn("v71obRun") ? W.v71obRun() : null; } catch (e) { before = null; }
      V.obBuilding = Date.now();
      let r;
      try { r = await o.apply(this, arguments); } finally { V.obBuilding = 0; }
      try { const run = fn("v71obRun") ? W.v71obRun() : null; if (run && run !== before && offTemp(run)) V.obFailAt = Date.now(); } catch (e) { err("offBuild3", e); }
      return r;
    };
    g.__v101b3 = 1; g.__v101buyer = 1;
    W.v71obBuild = g;
  })();
  // x2-7：リストの AI の答えが届いた時点で「✅ 完了しました／結果を画面に反映しました」と出ていた（このあと公式サイトの確かめが続く）
  (function () {
    const o = W.aiThinkEnd;
    if (typeof o !== "function" || o.__v101b3) return;
    const g = function (id, ok) {
      const busy = !!V.obBuilding && obBusyNow(); // リストを作っている間だけ（「選んだ n社の文面を作る」などは今までどおり）
      const r = o.apply(this, arguments);
      try {
        const A = typeof AIT !== "undefined" ? AIT : null; // eslint-disable-line no-undef
        if (ok && busy && A && A.el && !(A.items || []).length && !A.hidden) {
          const a = A.el.querySelector(".att"), s = A.el.querySelector(".ats");
          if (a) a.textContent = M("✅ AI の答えが届きました", "✅ The AI answered", "✅ AI 已回答", "✅ La IA respondió");
          if (s) s.textContent = M("リストにして、公式サイト・窓口を確かめます（表の上に経過を出します）", "Making the list and checking websites and contacts (progress is shown above the table)", "正在整理名单并核实官网和联系窗口（进度显示在表格上方）", "Preparando la lista y verificando sitios y contactos (el progreso se muestra sobre la tabla)");
          V.n.aiEnd = (V.n.aiEnd || 0) + 1;
        }
      } catch (e) { err("aiThinkEnd", e); }
      return r;
    };
    g.__v101b3 = 1; g.__v101buyer = 1;
    W.aiThinkEnd = g;
  })();
  // x2-8：署名が未登録の知らせ（「📋 コピーしてフォームを開く」などの関所）に、英字でない名前も「お名前（英字）」として入れる
  function sigMissNow(s) {
    s = s || (fn("v79obSig") ? W.v79obSig() : {}) || {};
    let ms = [];
    try { ms = fn("v79obSigMiss") ? (W.v79obSigMiss(s) || []).slice() : []; } catch (e) { ms = []; }
    const tr = (x) => { try { return fn("v71obT") ? W.v71obT(x) : x; } catch (e) { return x; } };
    const NM = M("お名前（英字）", "name (in Latin letters)", "姓名（英文）", "nombre (en letras latinas)");
    const nm = String(s.name || "").trim();
    let out = ms.map((x) => (x === "お名前" ? NM : tr(x)));
    if (nm && !latinName(nm) && out.indexOf(NM) < 0) out = [NM].concat(out);
    return out;
  }
  V.sigMissNow = sigMissNow;
  const SIGMSG = (f) => F(M("署名の {f} が未登録です。「✍ 署名」に入れてから送ってください", "Signature: {f} not registered. Fill in “✍ Signature” before sending", "签名的 {f} 未登记。请在“✍ 签名”中填写后再发送", "Firma: falta {f}. Complete «✍ Firma» antes de enviar"), { f: f.join(M("・", ", ")) });
  (function () {
    const o = W.v79obGate;
    if (typeof o !== "function" || o.__v101b3) return;
    const g = function () {
      const r = o.apply(this, arguments);
      try {
        if (r && r.k === "sig") { const f = sigMissNow(); if (f.length) r.t = SIGMSG(f); }
      } catch (e) { err("gate3", e); }
      return r;
    };
    g.__v101b3 = 1; g.__v101buyer = 1;
    W.v79obGate = g;
  })();
  // 行に残る「署名の … が未登録です」（L.v79block・1時間残る）：表を描くたびに今の署名で言い直し、署名がそろったら消す
  V.sigBlockFix = function (run) {
    try {
      const f = sigMissNow();
      (run && run.leads || []).forEach((L) => {
        if (!L || !L.v79block || L.v79block.k !== "sig") return;
        if (!f.length) delete L.v79block; else L.v79block.t = SIGMSG(f);
      });
    } catch (e) { err("sigBlockFix", e); }
  };
  (function () {
    const o = W.v71obInner;
    if (typeof o !== "function" || o.__v101b3) return;
    const g = function () {
      try { const run = fn("v71obRun") ? W.v71obRun() : null; if (run) V.sigBlockFix(run); } catch (e) { err("inner3", e); }
      return o.apply(this, arguments);
    };
    g.__v101b3 = 1; g.__v101buyer = 1;
    W.v71obInner = g;
  })();
})();
