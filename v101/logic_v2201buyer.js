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
    const prod = comOfHs(Fc.hs);
    const key = s + "|" + u + "|" + ok + "|" + dest + "|" + [...prod].sort().join(",");
    if (MEMO[key]) return MEMO[key];
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
      r = { s: same ? s : s2, u: linkOk ? u : "", ok: same ? ok : okFilt(ok, dest), v101: { all: parts.length, kept: idx.length, link: linkOk } };
      if (!same) { trParts(s, idx, parts.length, s2); trOk(ok, r.ok); }
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
      const raw = { s: R.s, u: R.u, ok: R.ok, c: R.c };
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
      const name = clean(s.name) || MK.name, mail = mailOf(s.mail || "") && !isFake(s.mail) ? mailOf(s.mail) : MK.mail, addr = clean(s.addr) || MK.addr;
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
    const name = clean(s.name), mail = mailOf(s.mail || "") && !isFake(s.mail) ? mailOf(s.mail) : "", addr = clean(s.addr), tel = clean(s.tel), web = clean(s.web), title = clean(s.title), co = clean(s.co);
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
          const c = obCount(run);
          const tl = B.toasts.filter(Boolean);
          let msg = "";
          if (run.how === "ai" && !run.v100) {
            msg = F(M("AI が挙げた {a}社のうち、表に {s}社を出しました", "Of the {a} companies the AI listed, {s} are shown in the table"), { a: c.total, s: c.shown });
            if (c.gone) msg += F(M("（公式サイトに届かない {g}社は外しました）", " ({g} removed: website unreachable)"), { g: c.gone });
            if (c.asked && c.total < c.asked) msg += F(M("。頼んだのは {n}社でしたが、AI が挙げたのは {a}社でした", ". You asked for {n}; the AI listed {a}"), { n: c.asked, a: c.total });
            if (c.unchk) msg += F(M("。公式サイトを確かめられなかった {u}社は下に並べています", ". {u} not verified on their website are listed at the bottom"), { u: c.unchk });
            const ng = tl.find((x) => /確かめられませんでした|could not be checked|Could not check/i.test(x));
            if (ng) msg = ng + " " + msg;
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
})();
