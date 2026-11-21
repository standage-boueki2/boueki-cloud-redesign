/* 22.01 分野 fact（英語営業資料と書類の中身の事実の正しさ）2026-11-22 第14回 UAT（22.00.1）の直し
   いまの中心の問題：「根拠のない表現を入れない仕組みが、根拠のある内容を外し、根拠のない断定を通す」逆転。
   No.611（高）根拠照合が、資料にある HS コード（A〜D）・C の強み（型番 6204ZZ の「6204」を数字の主張と読む）・D のメーカー紹介を「記載なし」で外す
   No.616（高）原産地が未登録（ヒアリングで「わからない」）なのに、表紙の見本（JAPAN PARTS など）・資料・PL に「Japan」の断定
   No.618（高）F：「不明」と答えた適合（主要メーカー対応・application chart）・アスベスト不使用（NAO non-asbestos）を資料に断定
   No.620（中）確認の文言「値が入っていない行は資料に載せていません（…）」の中身が、資料の本体に載っている
   No.553 の残り（入力に無い数値・主張）
   考え方（6つの決まりの 1・2・3・6）：
     ・根拠の範囲＝登録の項目（HS・品番を含む）・ヒアリングと追加ヒアリングの答え・📎の資料の文字・会社情報。照合の AI がこの範囲にあるものを
       「記載なし」と言っても、アプリが原文と突き合わせて根拠を見つけたら残す（引用は根拠の原文そのまま）。
     ・型番・品番（6204ZZ・FP-201 など、登録の品番・商品名に出てくる英数字のかたまり）の数字は「数字の主張」として数えない。
     ・「わからない」「不明」と答えた事柄（原産地・適合・アスベスト不使用・認証・試験 など）は値ではなく「未確認」。資料・表紙の見本・書類に断定で書かない
       （文章は外す・表の値は「要確認（to be confirmed）」を付ける）。AI への頼みの文だけに頼らず、入力との突き合わせで必ず正す。
     ・会社が日本にあること（Tokyo-based・Japanese company・積出港）と、商品の原産地は別。会社の紹介は触らない。
   取り決め：window.v101origin(ten) → {known, country, src, raw}（「わからない」「不明」・未入力は known:false）。
   どの包みも、何度通っても同じ結果（二重にかけても壊れない）。ほかの担当（buyer・deal・fwd・hear・out）と同じ関数を包んでも、自分が最後とは限らない前提。 */
(function () {
  "use strict";
  var V = window.V101FACT = window.V101FACT || {};
  if (V.__loaded) return;
  V.__loaded = 1; V.ver = "22.01-fact"; V.err = null; V.errs = []; V.n = {}; V.log = [];
  function err(w, e) { var m = w + ": " + String((e && e.message) || e).slice(0, 200); V.err = m; V.errs.push(m); if (V.errs.length > 30) V.errs.shift(); try { console.warn("v101fact", m); } catch (x) { /* 無視 */ } }
  function cnt(k, d) { V.n[k] = (V.n[k] || 0) + (d || 1); }
  function lg(o) { try { o.at = Date.now(); V.log.push(o); if (V.log.length > 300) V.log.shift(); } catch (e) { /* 無視 */ } }
  function NF(s) { return String(s == null ? "" : s).normalize("NFKC"); }
  function fn(n) { try { return typeof window[n] === "function"; } catch (e) { return false; } }
  function curT() { try { return (typeof DK3G !== "undefined" && DK3G && DK3G.run && DK3G.ten) || (typeof TEN !== "undefined" ? TEN : null); } catch (e) { return null; } }
  function prodsOf(T) { try { if (fn("dk3Prods")) { var a = dk3Prods(T); if (Array.isArray(a) && a.length) return a; } } catch (e) { /* 無視 */ } return T ? [T] : []; }
  function lang2(l) { return String(l || "en").slice(0, 2); }
  V.isOn = function () { return true; };

  /* ══════════ 「わからない」「不明」の答え ══════════ */
  var UNK_W = /(?:わから|分から|わかりません|分かりません|不明|未定|未確認|確認中|調査中|知らない|不詳|unknown|not sure|no idea|\bn\/a\b|\btbd\b|\btbc\b)/i;
  function isUnk(v) {
    var s = NF(v).trim();
    if (!s || s.length > 60) return false;
    if (/^(?:-|—|－|ー|\?|？)$/.test(s)) return true;
    if (!UNK_W.test(s)) return false;
    var rest = s.replace(/[（(][^）)]*[）)]/g, "").replace(new RegExp(UNK_W.source, "gi"), "").replace(/[ですまし。、,.\s！!？?ので]|ない|です|ません/g, "");
    return rest.length <= 4;
  }
  V.isUnk = isUnk;

  /* ══════════ 原産地（取り決め：window.v101origin） ══════════ */
  var CTY = [
    [/日本|国産|国内(?:生産|製造|製|工場)?|和製|[一-龯々]{1,4}[都道府県](?![a-z])|北海道|東京|大阪|京都|japan|nippon/i, "Japan"], [/中国|中華人民共和国|china|\bprc\b/i, "China"], [/台湾|taiwan/i, "Taiwan"],
    [/韓国|大韓民国|korea/i, "South Korea"], [/ベトナム|vietnam|viet nam/i, "Vietnam"], [/タイ(?![ルヤプムミトマツ])|thailand/i, "Thailand"], [/インドネシア|indonesia/i, "Indonesia"],
    [/マレーシア|malaysia/i, "Malaysia"], [/フィリピン|philippines/i, "Philippines"], [/インド(?!ネシア)|\bindia\b/i, "India"], [/アメリカ|米国|合衆国|\busa\b|united states/i, "USA"],
    [/ドイツ|germany/i, "Germany"], [/イタリア|italy/i, "Italy"], [/フランス|france/i, "France"], [/バングラデシュ|bangladesh/i, "Bangladesh"], [/ミャンマー|myanmar/i, "Myanmar"], [/カンボジア|cambodia/i, "Cambodia"]
  ];
  function countryOf(s) { s = NF(s); for (var i = 0; i < CTY.length; i++) if (CTY[i][0].test(s)) return CTY[i][1]; return ""; }
  var ORIG_LAB = /^(?:原産国|原産地|製造国|生産国|産地|製造地|生産地|country of origin|origin|made in)$/i;
  var ORIG_Q = /原産|製造国|生産国|産地|製造地|どこで(?:作|製造|生産)|どこの国|made in|origin/i;
  function unkList(T) {
    var L = [];
    try {
      if (!T) return L;
      (Array.isArray(T.v101unk) ? T.v101unk : []).forEach(function (u) { if (u && (u.q || u.k)) L.push({ src: "hear", k: String(u.k || ""), q: NF(u.q || u.n || u.k || ""), a: NF(u.a || "") }); });
      (Array.isArray(T.extraQA) ? T.extraQA : []).forEach(function (x, i) { if (x && x.q && isUnk(x.a)) L.push({ src: "extra", k: "extraQA." + i, q: NF(x.q), a: NF(x.a) }); });
      var A = T.v68attrs;
      if (A && typeof A === "object" && !Array.isArray(A)) Object.keys(A).forEach(function (k) { var v = A[k]; if (!/^_/.test(k) && typeof v === "string" && isUnk(v)) { var lab = k; try { if (typeof v68dAttrLab === "function") lab = v68dAttrLab(k) || k; } catch (e) { /* 無視 */ } L.push({ src: "attr", k: "v68attrs." + k, q: NF(lab), a: NF(v) }); } });
      ["origin", "cert", "shelf", "store", "moq", "lead", "ctn"].forEach(function (k) { if (typeof T[k] === "string" && isUnk(T[k])) L.push({ src: "field", k: k, q: ({ origin: "原産地・製造国", cert: "認証・規格", shelf: "期限・保証", store: "保存方法", moq: "最小ロット", lead: "リードタイム", ctn: "入数" })[k], a: NF(T[k]) }); });
    } catch (e) { err("unk", e); }
    /* 同じ問いは1つに */
    var seen = {};
    return L.filter(function (u) { var key = u.q.replace(/\s+/g, "").slice(0, 40); if (seen[key]) return false; seen[key] = 1; return true; });
  }
  V.unkList = unkList;
  function v101origin(ten) {
    var r = { known: false, country: "", src: "", raw: "" };
    try {
      var T = ten || curT();
      if (!T) return r;
      var U = unkList(T), saidUnk = U.some(function (u) { return u.k === "origin" || (u.src !== "field" && ORIG_Q.test(u.q)); });
      var hit = function (val, src) { var v = NF(val).trim(); if (!v || isUnk(v)) return false; var c = countryOf(v); r.known = true; r.country = c || v.replace(/[（(].*$/, "").trim().slice(0, 40); r.src = src; r.raw = v.slice(0, 60); return true; };
      /* ① 登録の項目（原産地） */
      if (typeof T.origin === "string" && hit(T.origin, "入力")) return r;
      /* ② 表（成分・材質・寸法）の「原産国」の行・④ 業種ごとの項目 */
      var rowsHit = false;
      ["compRows", "dimRows"].forEach(function (k) { if (rowsHit) return; (Array.isArray(T[k]) ? T[k] : []).forEach(function (row) { if (rowsHit || !Array.isArray(row)) return; if (ORIG_LAB.test(NF(row[0]).trim())) { var v = row.slice(1).map(NF).filter(function (x) { return x.trim(); }).join(" "); if (hit(v, "入力")) rowsHit = true; } }); });
      if (rowsHit) return r;
      var A = T.v68attrs;
      if (A && typeof A === "object") { var ak = Object.keys(A).filter(function (k) { return /origin/i.test(k) && typeof A[k] === "string"; })[0]; if (ak && hit(A[ak], "入力")) return r; }
      /* ③ 追加ヒアリングの答え */
      var xq = (Array.isArray(T.extraQA) ? T.extraQA : []).filter(function (x) { return x && ORIG_Q.test(NF(x.q)) && !isUnk(x.a); }).slice(-1)[0];
      if (xq && countryOf(xq.a) && hit(xq.a, "ヒアリング")) return r;
      if (saidUnk) return r;
      /* ④ 強み・説明の「日本製・国産・国内生産」 */
      var st = (Array.isArray(T.strengths) ? T.strengths : []).map(function (s) { return Array.isArray(s) ? s.join(" ") : String(s || ""); }).join("／") + "／" + NF(T.desc || "");
      var m = NF(st).match(/(日本製|国産|国内(?:で)?(?:生産|製造)|国内の(?:自社)?工場で(?:製造|生産)|made in japan)/i);
      if (m) { r.known = true; r.country = "Japan"; r.src = "入力"; r.raw = m[1]; return r; }
      /* ⑤ 📎 の資料の文字（「原産国：日本」「Made in Japan」） */
      var src = (Array.isArray(T.sources) ? T.sources : []).filter(function (s) { return s && s.on !== false && s.txt; }).map(function (s) { return String(s.txt); }).join("\n");
      var m2 = NF(src).match(/(?:^|\n)\s*(?:原産国|原産地|製造国|生産国|country of origin|made in)\s*[:：]?\s*([^\n]{1,40})/i);
      if (m2 && hit(m2[1], "資料")) return r;
      var m3 = NF(src).match(/(日本製|made in japan|国内(?:で)?(?:生産|製造))/i);
      if (m3) { r.known = true; r.country = "Japan"; r.src = "資料"; r.raw = m3[1]; return r; }
    } catch (e) { err("origin", e); }
    return r;
  }
  window.v101origin = v101origin;
  V.origin = v101origin;

  /* ══════════ ヒアリングの「わからない・不明」を記録（あとで「答えた」と分かるように） ══════════ */
  function recUnk(T, cur, v) {
    try {
      if (!T || !cur) return;
      var k = String(cur.k || ""), q = NF(cur.qPlain || cur.n || cur.q || k).replace(/<[^>]+>/g, "").slice(0, 120);
      T.v101unk = Array.isArray(T.v101unk) ? T.v101unk : [];
      var i = T.v101unk.findIndex(function (u) { return u && (u.k === k && !cur.x || (cur.x && u.q === q)); });
      if (isUnk(v)) { var o = { k: k, q: q, a: NF(v).slice(0, 60), x: cur.x ? 1 : 0, at: Date.now() }; if (i >= 0) T.v101unk[i] = o; else T.v101unk.push(o); cnt("unkRec"); }
      else if (i >= 0) { T.v101unk.splice(i, 1); cnt("unkClear"); }
      if (T.v101unk.length > 60) T.v101unk = T.v101unk.slice(-60);
    } catch (e) { err("recunk", e); }
  }
  V.recUnk = recUnk;
  if (fn("fillAnswer")) {
    var oFA = window.fillAnswer;
    var faW = function (v) {
      try { if (typeof FILL !== "undefined" && FILL && FILL.cur && typeof TEN !== "undefined" && TEN && FILL.cur.k !== "_pend" && !FILL._xbz) recUnk(TEN, FILL.cur, v); } catch (e) { err("fa", e); }
      return oFA.apply(this, arguments);
    };
    faW.__v101fact = 1;
    window.fillAnswer = faW;
  }

  /* ══════════ 話題（「不明」と答えた事柄 → 資料での主張の言い方） ══════════ */
  var ORIGIN_EN = /\bmade in japan\b|\bjapan[- ]made\b|\bjapanese[- ]made\b|\b(?:produced|manufactured|made|crafted|built|brewed|dried|processed|assembled|sewn|milled)\s+(?:\w+\s+){0,2}in\s+(?:[A-Z][\w-]+(?:\s+Prefecture)?\s*,\s*)?japan\b|\b(?:produced|manufactured|made|crafted|built)\s+in\s+[A-Z][a-z]+\s+Prefecture\b|\bjapanese quality\b|\bjapan quality\b|\bjapanese[- ]origin\b|\bdomestically (?:produced|made|manufactured)\b|\b(?:country of )?origin\s*[:：]\s*japan\b|日本製|国産|原産国\s*[:：]?\s*日本|hecho en jap[oó]n|fabricado en jap[oó]n|日本制造|日本製造|产自日本|產自日本/i;
  var SHIP_CTX = /\b(?:ship\w*|export\w*|deliver\w*|dispatch\w*|suppl\w*|send|sent|FOB|CIF|CFR|EXW|port|sea|air|freight|lead time|transit|from (?:our|the) (?:port|warehouse))\b[^.!?]{0,30}$/i;
  function originHits(s) {
    s = String(s || "");
    if (ORIGIN_EN.test(s)) return true;
    var re = /\b(?:from|of)\s+Japan\b/gi, m;
    while ((m = re.exec(s))) { var pre = s.slice(Math.max(0, m.index - 40), m.index); if (!SHIP_CTX.test(pre) && !/\b(?:company|maker|manufacturer|brand|team|we|us|supplier|exporter|partner|based)\b[^.!?]{0,20}$/i.test(pre)) return true; }
    return false;
  }
  V.originHits = originHits;
  /* 文から原産地の断定の言い回しだけを外す（残りの文は残す）。外せなければ null */
  function stripOrigin(s) {
    var o = String(s || ""), b = o;
    o = o.replace(/\s*[,;–—-]?\s*\(?\s*(?:proudly\s+|all\s+|fully\s+|carefully\s+)?(?:made|produced|manufactured|crafted|built|brewed|dried|processed|assembled|sewn|milled)\s+(?:\w+\s+){0,2}in\s+(?:[A-Z][\w-]+(?:\s+Prefecture)?\s*,\s*)?Japan\b\s*\)?/gi, " ")
      .replace(/\s*[,;–—-]?\s*\(?\s*(?:[Mm]ade|[Pp]roduced|[Mm]anufactured|[Cc]rafted|[Bb]uilt)\s+in\s+[A-Z][a-z]+\s+Prefecture\b\s*\)?/g, " ")
      .replace(/\bJapan(?:ese)?[- ]made\s+/gi, "").replace(/\s*\bJapan(?:ese)?[- ]made\b/gi, "")
      .replace(/\bJapanese[- ]origin\s+/gi, "").replace(/\bdomestically (?:produced|made|manufactured)\s*/gi, "")
      .replace(/\bJapan(?:ese)? quality\b/gi, "quality")
      .replace(/\b((?:country of )?origin)\s*[:：]\s*Japan\b(?:\s*\([^)]*\))?/gi, function (m0, a) { return a.charAt(0).toUpperCase() + a.slice(1) + ": to be confirmed"; })
      .replace(/\s*\bmade in japan\b\s*/gi, " ")
      .replace(/(?:hecho|fabricado) en jap[oó]n/gi, "").replace(/日本製造|日本制造|产自日本|產自日本/g, "");
    o = o.replace(/\b(?:from|of)\s+Japan\b/gi, function (m0, off, all) { var pre = all.slice(Math.max(0, off - 40), off); return (SHIP_CTX.test(pre) || /\b(?:company|maker|manufacturer|brand|team|we|us|supplier|exporter|partner|based)\b[^.!?]{0,20}$/i.test(pre)) ? m0 : ""; });
    o = o.replace(/\s{2,}/g, " ").replace(/\s+([,.;:!?)])/g, "$1").replace(/\(\s*\)/g, "").replace(/([,;:])\s*([.!?]|$)/g, "$2").replace(/^\s*[,;:–—-]\s*/, "").replace(/\s*[,;–—-]\s*$/, "").trim();
    if (o === b) return null;
    if (/^[A-Z]/.test(b.trim()) && /^[a-z]/.test(o)) o = o.charAt(0).toUpperCase() + o.slice(1);
    return o;
  }
  V.stripOrigin = stripOrigin;
  var TOPICS = [
    { k: "fit", lab: "適合（車種・機種・品番）", ja: /適合|車種|対応車|対応機種|互換|フィッティング|fitment|applications?/i,
      en: /application (?:chart|list|guide|table|catalog(?:ue)?|data)|\bfitments?\b|\bcompatib(?:le|ility)\b|\bfits?\s+(?:most|all|major|leading|many|popular)\b|\b(?:major|leading|all|most|popular|many)[\s-]+(?:japanese[\s-]+)?(?:passenger[- ]car[\s-]+|car[\s-]+|vehicle[\s-]+|auto(?:motive)?[\s-]+|automobile[\s-]+)?(?:makers?|brands?|manufacturers?|models?|OEMs?)\b|\bOEM[- ](?:equivalent|replacement|compatible)\b|\bdirect[- ]fit\b|\bcovers? (?:most|major|all) (?:models|vehicles|cars)\b|主要メーカー|適合表|車種対応|适配|适用车型|compatible con|aplicaci[oó]n/i,
      ja2: /主要メーカー|適合|対応車種|全車種|多車種|互換/ },
    { k: "asbestos", lab: "アスベスト不使用", ja: /アスベスト|石綿|asbestos/i, en: /non-?asbestos|asbestos[- ]free(?! certificate)|free (?:of|from) asbestos|without asbestos|no asbestos|无石棉|sin amianto|sin asbesto/i, ja2: /アスベスト|石綿|NAO/i,
      /* 「NAO 材」は登録した材質の名前なので消さない。「non-asbestos」「asbestos-free」の言い切りだけを外し、NAO には「アスベスト不使用の証明は要確認」を付ける */
      strip: function (s) { return String(s).replace(/\s*\(\s*non-?asbestos[^)]*\)/gi, "").replace(/\bnon-?asbestos(?:\s+organic)?\s*/gi, "").replace(/\s*[,;]?\s*\basbestos[- ]free\b\s*/gi, " ").replace(/\b(?:free (?:of|from)|without|no) asbestos\b\s*/gi, "").replace(/\s{2,}/g, " ").replace(/\s+([,.;:)])/g, "$1").trim(); },
      qual: /\bNAO\b/, qtxt: { en: "asbestos-free certificate: to be confirmed", es: "certificado sin amianto: por confirmar", zh: "无石棉证明：待确认" } },
    { k: "halal", lab: "ハラール", ja: /ハラール|ハラル|halal/i, en: /\bhalal\b/i, ja2: /ハラ[ー]?ル/ },
    { k: "organic", lab: "有機（オーガニック）", ja: /有機|オーガニック|organic/i, en: /\borganic\b/i, ja2: /有機|オーガニック/ },
    { k: "oem", lab: "OEM・PB の受託", ja: /OEM|ODM|PB|プライベートブランド|受託/i, en: /\b(?:OEM|ODM|private[- ]label)\b/i, ja2: /OEM|ODM|PB|受託/ },
    { k: "capacity", lab: "生産能力・供給量", ja: /生産能力|月産|年産|供給(?:量|能力)|生産量/i, en: /\b(?:monthly|annual|production) capacity\b|\bper month\b[^.]{0,20}\b(?:units|pcs|sets)\b|\bstable supply\b|\blarge[- ]volume supply\b/i, ja2: /月産|生産能力|安定供給/ },
    { k: "shelflife", lab: "期限", ja: /賞味期限|消費期限|使用期限|有効期限/i, en: /\bshelf[- ]life\b|\bbest before\b|\bexpir\w*\b/i, ja2: null, tableOnly: 1 }
  ];
  var ASK_HAVE = /あります|ありますか|有無|取得|持って|お持ち|していますか|ですか|ますか|教えて|可能|でしょうか/;
  var TOK_STOP = /^(?:AI|OK|NG|PDF|URL|Q|A|TEL|FAX|HS|MOQ|FOB|CIF|EXW|DDP|T\/T|L\/C|JPY|USD|EUR|SKU|JAN|PI|CI|PL|EC|SNS|PB)$/;
  function topicsOf(u, T) {
    var q = NF(u.q), out = [];
    TOPICS.forEach(function (tp) { if (tp.ja.test(q)) out.push(tp); });
    if (ORIG_Q.test(q)) out.push({ k: "origin", lab: "原産国・製造国", en: ORIGIN_EN, origin: 1 });
    /* 問いに出てくる認証・試験・規格の名前（ISO 13485・CE・FDA・BFE…）：「ありますか」の形の問いで、登録に無いものだけ */
    if (/認証|証明|証書|登録|届出|承認|試験|テスト|検査|成績書|規格|適合宣言|certif|test|report/i.test(q) && ASK_HAVE.test(q)) {
      var reg = regText(T), toks = [];
      q.replace(/\b([A-Z][A-Z0-9&./-]{1,}(?:\s?\d{2,6}(?:[-:]\d+)?)?)\b/g, function (m) { var t = m.trim(); if (!TOK_STOP.test(t) && toks.indexOf(t) < 0) toks.push(t); return m; });
      toks.forEach(function (t) {
        if (reg.indexOf(NF(t).replace(/\s/g, "").toUpperCase()) >= 0) return;
        var src = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s/g, "\\s?");
        out.push({ k: "tok:" + t, lab: t, en: new RegExp("(?:^|[^A-Za-z0-9])" + src + "(?![A-Za-z0-9])", "i"), ja2: new RegExp(src, "i"), tok: 1 });
      });
    }
    return out;
  }
  function regText(T) {
    var a = [];
    try {
      prodsOf(T).forEach(function (t) {
        ["cert", "item", "itemEn", "sku", "desc"].forEach(function (k) { if (t[k]) a.push(NF(t[k])); });
        (Array.isArray(t.strengths) ? t.strengths : []).forEach(function (s) { a.push(NF(Array.isArray(s) ? s.join(" ") : s)); });
        ["compRows", "dimRows"].forEach(function (k) { (Array.isArray(t[k]) ? t[k] : []).forEach(function (r) { if (Array.isArray(r)) a.push(NF(r.join(" "))); }); });
      });
    } catch (e) { /* 無視 */ }
    return a.join(" ").replace(/\s/g, "").toUpperCase();
  }
  /* 「不明」と答えた事柄の一覧（資料で断定しないもの）。原産地は v101origin が known:false のとき */
  function unkTopics(T) {
    var L = [];
    try {
      var U = unkList(T);
      U.forEach(function (u) { topicsOf(u, T).forEach(function (tp) { if (tp.origin) return; if (!L.some(function (x) { return x.k === tp.k; })) L.push({ k: tp.k, lab: tp.lab, en: tp.en, ja2: tp.ja2, tableOnly: tp.tableOnly, strip: tp.strip, qual: tp.qual, qtxt: tp.qtxt, q: u.q, a: u.a, src: u.src }); }); });
      var O = v101origin(T);
      if (!O.known) L.push({ k: "origin", lab: "原産国・製造国", en: ORIGIN_EN, ja2: /日本製|国産|国内生産|国内製造|Made in Japan/i, q: "原産地・製造国", a: (U.filter(function (u) { return u.k === "origin" || ORIG_Q.test(u.q); })[0] || {}).a || "未登録", origin: 1 });
    } catch (e) { err("topics", e); }
    return L;
  }
  V.unkTopics = unkTopics;
  function whyUnk(tp) {
    if (tp.origin) return "原産国・製造国は未登録（ヒアリングの答え「" + String(tp.a || "未登録").slice(0, 12) + "」）のため、原産地を断定して書きません（商品情報の「産地・製造国」に入れると載せられます）";
    return "「" + String(tp.q || tp.lab).slice(0, 40) + "」に「" + String(tp.a || "不明").slice(0, 12) + "」と答えているため、" + tp.lab + "を断定して書きません（追加ヒアリングで答えると載せられます）";
  }
  V.whyUnk = whyUnk;
  function hitTopic(s, L) { s = String(s || ""); for (var i = 0; i < L.length; i++) { var tp = L[i]; if (tp.tableOnly) continue; if (tp.origin ? originHits(s) : (tp.en && tp.en.test(s))) return tp; } return null; }
  V.hitTopic = hitTopic;
  var TBC = { en: "to be confirmed", es: "por confirmar", zh: "待确认", fr: "à confirmer", de: "zu bestätigen", it: "da confermare", pt: "a confirmar", ko: "확인 필요", ja: "要確認" };
  var TBC_RE = /to be confirmed|por confirmar|待确认|待確認|à confirmer|zu bestätigen|da confermare|a confirmar|확인 필요|要確認|未確認/i;
  V.TBC = TBC;

  /* ══════════ No.611 根拠の範囲：商品の根拠（P の段）に HS コードを入れる・「不明」と答えた事柄・原産地の未登録を書く ══════════
     原因：土台の dk3Corpus は商品の段に「商品名・品番・産地・認証・期限…」を入れるが、HS コード（TEN.hs）を入れていなかった。
           照合の AI は根拠の段に HS が無いので「登録項目に HS コード無し」「P1 に記載なし」と判定した（資料の仕様書・登録には HS がある）。 */
  function hsLine(t) {
    var h = NF(t && t.hs || "").trim();
    if (!h || isUnk(h)) return "";
    var inSrc = (Array.isArray(t.sources) ? t.sources : []).some(function (s) { return s && s.txt && NF(s.txt).replace(/\s/g, "").indexOf(h.replace(/\s/g, "")) >= 0; });
    return (t.hsGuess && !inSrc ? "HSコード（AIの推定・要確認）：" : "HSコード：") + h;
  }
  V.hsLine = hsLine;
  function corpusAdd(t, T) {
    var L = [];
    var h = hsLine(t); if (h) L.push(h);
    var O = v101origin(t);
    if (!O.known) L.push("原産国・製造国：未登録（ヒアリングの答え「" + ((unkList(t).filter(function (u) { return u.k === "origin" || ORIG_Q.test(u.q); })[0] || {}).a || "未登録") + "」。原産国を断定して書かない。会社の所在地は原産国の根拠にならない）");
    var U = unkTopics(t).filter(function (x) { return !x.origin; });
    if (U.length) L.push("■利用者が「不明」「わからない」と答えた事柄（確かめるまで資料に断定して書かない）\n" + U.map(function (x) { return "・" + String(x.q).slice(0, 60) + " → " + x.a; }).join("\n"));
    return L.join("\n");
  }
  if (fn("dk3Corpus")) {
    var oCO = window.dk3Corpus;
    window.dk3Corpus = function (T) {
      var C = oCO.apply(this, arguments);
      try {
        var TT = T || (typeof TEN !== "undefined" ? TEN : null);
        if (!C || !Array.isArray(C.blocks) || !TT || C.__v101) return C;
        C.__v101 = 1;
        var extra = "";
        prodsOf(TT).forEach(function (t, i) {
          var b = C.blocks.filter(function (x) { return x.id === "P" + (i + 1); })[0];
          if (!b) return;
          var a = corpusAdd(t, TT);
          if (a && b.txt.indexOf(a.split("\n")[0]) < 0) { b.txt += "\n" + a; extra += "\n" + a; }
        });
        if (extra) {
          C.text = C.blocks.map(function (b) { return "【" + b.id + "】" + b.label + "\n" + b.txt; }).join("\n\n").slice(0, 70000);
          try { if (fn("dk3NumBank") && C.N) { var N2 = dk3NumBank(extra, TT); Object.keys(N2 || {}).forEach(function (k) { if (N2[k] instanceof Set && C.N[k] instanceof Set) N2[k].forEach(function (v) { C.N[k].add(v); }); }); } } catch (e) { /* 無視 */ }
          try { C.key = String(C.key || "") + "|v101:" + (typeof djb2 === "function" ? djb2(extra) : extra.length); } catch (e) { /* 無視 */ }
          cnt("corpusAdd");
        }
      } catch (e) { err("corpus", e); }
      return C;
    };
  }

  /* ══════════ No.611 照合の AI の答えを、根拠の原文と突き合わせて直す（逆転を正す） ══════════
     ・HS コードの主張：AI が「記載なし」としても、根拠の段に同じ HS の行があれば残す（引用はその行）
     ・型番の数字（6204ZZ の 6204・FP-201 の 201）：引用に型番が無く「引用に数字が含まれていない：6204」で外れる → 型番の行を引用に足す
       （22.00.1 の直しは「KB-6204」のように英字が前に付く型番だけを見ていた。UAT の品番は「6204ZZ」＝数字が先で英字が後ろ）
     ・メーカー紹介（「C1 に商品の記載なし」）：会社の段と商品の段を合わせて根拠にする（数字・最上級・受賞などが無い文だけ）
     ・逆に、原産地が未登録なのに原産地を言う主張・「不明」と答えた事柄の主張は、AI が ok としても外す（616・618） */
  var SUP_RE = /No\.?\s?1|\b(?:leading|largest|biggest|best|only|first|top|unique|award|patent|certified|world|global|famous|renowned|premium|guaranteed?)\b|唯一|最大|最高|最多|業界初|世界初|日本初/i;
  function fcParse(q) {
    var cl = {}, sec = String(q).split("=== 主張 ===")[1] || ""; sec = sec.split("=== 根拠 ===")[0];
    sec.split("\n").forEach(function (line) { var m = line.match(/^(\d+)\. \[([^\]]*)\] (.*)$/); if (m) cl[+m[1]] = { txt: m[3], src: m[2] }; });
    var blocks = {}, order = [], cp = String(q).split("=== 根拠 ===")[1] || "";
    cp.split(/\n(?=【[A-Z]\d+】)/).forEach(function (x) { var m = x.match(/^\s*【([A-Z]\d+)】[^\n]*\n([\s\S]*)$/); if (m) { blocks[m[1]] = m[2]; order.push(m[1]); } });
    return { cl: cl, blocks: blocks, order: order };
  }
  function sameNum(a, b) { return Math.abs(a.full - b.full) <= Math.max(1e-6, Math.abs(b.full) * 0.001); }
  function numsOf(s, l) { try { return fn("dk3NumsIn") ? dk3NumsIn(String(s || ""), l || "ja") : []; } catch (e) { return []; } }
  function modelToks(T) {
    var toks = [];
    prodsOf(T).forEach(function (t) {
      [t.sku, t.item, t.itemEn].forEach(function (s) {
        NF(s || "").replace(/[A-Za-z]{0,6}[-‐ ]?\d{2,}[A-Za-z0-9-]*|\d{2,}[A-Za-z]{1,6}[A-Za-z0-9-]*/g, function (m) { var x = m.trim(); if (/[A-Za-z]/.test(x) && /\d/.test(x) && toks.indexOf(x) < 0) toks.push(x); return m; });
      });
    });
    return toks;
  }
  V.modelToks = modelToks;
  function lineWith(blocks, ids, test) {
    for (var i = 0; i < ids.length; i++) {
      var bt = String(blocks[ids[i]] || ""); if (!bt) continue;
      var ln = bt.split(/\n/).map(function (z) { return z.trim(); }).filter(function (z) { return z.length >= 4; }).filter(test)[0];
      if (ln) return { id: ids[i], ln: ln.length > 58 ? cutAround(ln, test) : ln };
    }
    return null;
  }
  function cutAround(ln, test) {
    /* 58字まで：条件に当たる所を含むように切る（根拠の原文の一部そのまま） */
    for (var s = 0; s + 20 <= ln.length; s += 6) { var p = ln.slice(s, s + 58); if (test(p)) return p; }
    return ln.slice(0, 58);
  }
  function refOf(c, blocks) { var m = String((c && c.src) || "").match(/P\d+/); return m && blocks[m[0]] ? m[0] : (blocks.P1 ? "P1" : ""); }
  var FC_HINT = "【アプリからの補足】①型番・品番（例：6204ZZ・FP-201）の数字は数値の主張ではない（根拠は商品ブロックの「品番」「商品名」の行）。②HSコードの主張は、商品ブロックの「HSコード：」の行が根拠。③主張の［ ］のブロック番号は書き手の目安で、根拠はその商品・会社・取り込んだ資料のほかのブロックにあってもよい（blk には実際に引用したブロックを書く）。\n";
  function fixFC(q, r) {
    var t0 = String((r && r.txt) || ""), j = null;
    try { j = (typeof xParseJson === "function") ? xParseJson(t0) : JSON.parse(t0.replace(/```json|```/g, "").match(/\{[\s\S]*\}/)[0]); } catch (e) { return r; }
    if (!j || !Array.isArray(j.v)) return r;
    var F = fcParse(q), T = curT(), ch = 0;
    var prods = prodsOf(T), HSs = prods.map(function (t) { return NF(t.hs || "").trim(); }).filter(function (h) { return h && /\d{4}/.test(h); });
    var MT = modelToks(T), UT = unkTopics(T);
    var allIds = F.order.slice();
    j.v.forEach(function (x) {
      if (!x) return;
      var c = F.cl[+x.n]; if (!c) return;
      var txt = c.txt, ref = refOf(c, F.blocks), ids = [ref].concat(allIds.filter(function (id) { return id !== ref; })).filter(Boolean);
      try {
        /* ① HS コード */
        var hs = HSs.filter(function (h) { var d = h.replace(/[^\d.]/g, ""); return d && (txt.indexOf(h) >= 0 || txt.indexOf(d) >= 0 || txt.indexOf(d.replace(".", "")) >= 0 || (d.length >= 4 && new RegExp("\\b" + d.slice(0, 4) + "\\b").test(txt))); })[0];
        if (hs && x.ok === false && /\bHS\b|HS[- ]?code|tariff|harmoni[sz]ed|customs (?:code|classification)|classif/i.test(txt)) {
          var hd = hs.replace(/\s/g, "");
          var hl = lineWith(F.blocks, ids, function (z) { return z.replace(/\s/g, "").indexOf(hd) >= 0; });
          var restN = numsOf(txt, "en").filter(function (n) { return n.k !== "yr" && !numsOf(hs, "ja").some(function (e) { return sameNum(e, n); }) && !numsOf(hs.replace(".", ""), "ja").some(function (e) { return sameNum(e, n); }) && !(String(hd).indexOf(String(n.v)) === 0); });
          if (hl && !restN.length && !SUP_RE.test(txt)) { x.whyAI = x.why; x.okAI = false; x.ok = true; x.blk = hl.id; x.ev = hl.ln; x.why = ""; ch++; cnt("hsRescue"); lg({ k: "hsRescue", txt: txt.slice(0, 60), ev: hl.ln, whyAI: String(x.whyAI || "").slice(0, 40) }); }
        }
        /* ② 型番の数字・HS の数字が引用に無い（「引用に数字が含まれていない」になる） */
        if (x.ok === true && /\d/.test(txt)) {
          var cn = numsOf(txt, "en").filter(function (n) { return n && n.k !== "yr" && n.k !== "year"; });
          var evN = numsOf(String(x.ev || "").replace(/([A-Za-z])([-‐]?)(\d)/g, "$1$2 $3"), "ja");
          var miss = cn.filter(function (n) { return !evN.some(function (e) { return sameNum(e, n); }); });
          if (miss.length) {
            var add = [], bl = String(x.blk || "").split(/[,\s、]+/).filter(Boolean), okAll = true;
            miss.forEach(function (n) {
              var digits = String(n.raw || n.v).replace(/[^\d.]/g, "");
              var mt = MT.filter(function (tk) { var dd = (tk.match(/\d+/g) || []); return dd.indexOf(digits) >= 0 && (txt.replace(/[\s‐-]/g, "").toUpperCase().indexOf(tk.replace(/[\s‐-]/g, "").toUpperCase()) >= 0 || /^(?:n|thing)$/.test(n.k)); })[0];
              var hsHit = HSs.filter(function (h) { var d = h.replace(/[^\d.]/g, ""); return d === digits || d.replace(".", "") === digits || d.split(".")[0] === digits; })[0];
              var key = mt || hsHit;
              if (!key) { okAll = false; return; }
              var kd = key.replace(/\s/g, "");
              var hl2 = lineWith(F.blocks, ids, function (z) { return z.replace(/\s/g, "").toUpperCase().indexOf(kd.toUpperCase()) >= 0 && numsOf(z.replace(/([A-Za-z])([-‐]?)(\d)/g, "$1$2 $3"), "ja").some(function (e) { return sameNum(e, n); }); });
              if (!hl2) { okAll = false; return; }
              if (add.indexOf(hl2.ln) < 0) add.push(hl2.ln);
              if (bl.indexOf(hl2.id) < 0) bl.push(hl2.id);
            });
            if (okAll && add.length) { x.ev = [String(x.ev || "")].concat(add).filter(Boolean).join("｜"); x.blk = bl.join(","); ch++; cnt("modelEv"); lg({ k: "modelEv", txt: txt.slice(0, 60), add: add }); }
          }
        }
        /* ③ メーカー紹介（「C1 に商品の記載なし」） */
        var txtNoModel = txt; MT.forEach(function (tk) { txtNoModel = txtNoModel.split(tk).join(" "); });
        var coNames = prods.map(function (t) { return NF(t.coEn || "").replace(/\s*(?:Co\.,?\s*Ltd\.?|Inc\.?|Corp\.?|Corporation|K\.K\.)\s*$/i, "").trim(); }).concat([NF((T && T.coEn) || "").replace(/\s*(?:Co\.,?\s*Ltd\.?|Inc\.?|Corp\.?)\s*$/i, "").trim()]).filter(function (s) { return s.length >= 3; });
        var aboutCo = /^C\d/.test(String(c.src || "")) || /\b(?:we|our|us)\b/i.test(txt) || coNames.some(function (n) { return txt.toLowerCase().indexOf(n.toLowerCase()) >= 0; });
        if (x.ok === false && /\bC\d\b|会社/.test(String(x.why || "")) && /商品|製品|美容液|品目|product|提供|製造|販売|関係|主体/i.test(String(x.why || "")) && /記載|言及|ない|無し|なし|not|不明/i.test(String(x.why || "")) && aboutCo && !/\d/.test(txtNoModel) && !SUP_RE.test(txt) && !hitTopic(txt, UT)) {
          var cl1 = lineWith(F.blocks, allIds.filter(function (id) { return /^[CS]\d+$/.test(id); }), function (z) { return /会社の紹介|会社概要|事業内容/.test(z); }) || lineWith(F.blocks, ["C1"], function (z) { return /^会社名[:：]/.test(z) || /^英文社名[:：]/.test(z); });
          var pl1 = lineWith(F.blocks, [ref || "P1"], function (z) { return /^(?:商品名|英文商品名|カテゴリ)[:：]/.test(z); });
          if (cl1 && pl1) { x.whyAI = x.why; x.okAI = false; x.ok = true; x.blk = [cl1.id, pl1.id].filter(function (v, i, a) { return a.indexOf(v) === i; }).join(","); x.ev = cl1.ln + "｜" + pl1.ln; x.why = ""; ch++; cnt("makerRescue"); lg({ k: "makerRescue", txt: txt.slice(0, 60), ev: x.ev.slice(0, 80), whyAI: String(x.whyAI || "").slice(0, 40) }); }
        }
        /* ②' 型番しか事実の無い文（「Why the 6204ZZ sells in your market」）：AI が引用を付けないと「事実を含むのに根拠の引用が無い」で外れる → 品番の行を引用に */
        if (x.ok === true && (!x.blk || String(x.blk).trim() === "-") && /\d/.test(txt) && MT.length) {
          var rest2 = txt; MT.forEach(function (tk) { var esc = tk.replace(/[.*+?^${}()|[\]\\]/g, function (m0) { return "\\" + m0; }).replace(/[-‐ ]/g, "[-‐ ]?"); rest2 = rest2.replace(new RegExp(esc, "gi"), " "); });
          var DF = (typeof DK3_FACT !== "undefined" && DK3_FACT) ? DK3_FACT : /\d/;
          if (rest2 !== txt && !/\d/.test(rest2) && !DF.test(rest2) && !SUP_RE.test(txt)) {
            var tk0 = MT.filter(function (tk) { return txt.replace(/[\s‐-]/g, "").toUpperCase().indexOf(tk.replace(/[\s‐-]/g, "").toUpperCase()) >= 0; })[0];
            var hl3 = tk0 && lineWith(F.blocks, ids, function (z) { return z.replace(/\s/g, "").toUpperCase().indexOf(tk0.replace(/\s/g, "").toUpperCase()) >= 0; });
            if (hl3) { x.blk = hl3.id; x.ev = hl3.ln; ch++; cnt("modelOnly"); lg({ k: "modelOnly", txt: txt.slice(0, 60), ev: hl3.ln }); }
          }
        }
        /* ④ 原産地の未登録・「不明」と答えた事柄の主張は、AI が ok としても外す */
        if (x.ok === true) { var tp = hitTopic(txt, UT); if (tp) { x.okAI = true; x.ok = false; x.why = tp.origin ? "原産国は未登録（断定しない）" : "「不明」と回答（" + tp.lab + "）"; x.v101 = 1; ch++; cnt("unkNg"); lg({ k: "unkNg", txt: txt.slice(0, 60), tp: tp.k }); } }
      } catch (e) { err("fcx", e); }
    });
    if (!ch) return r;
    cnt("fcFix", ch);
    return Object.assign({}, r, { txt: JSON.stringify(j) });
  }
  V.fixFC = fixFC;

  /* ══════════ 書き手の AI の答え（資料の文章）：原産地の断定・「不明」と答えた事柄の文を、照合の前に外す（616・618） ══════════ */
  var SKIPK = /^(?:src|ref|ic|icon|k|kind|id|lang|style|img|photo|col|color|u|unit|blk)$/;
  V.pend = [];
  function cleanStr(s, L, path, rec) {
    var o = String(s);
    if (!/[A-Za-z぀-ヿ一-鿿]/.test(o) || o.length < 3) return o;
    var tpO = L.filter(function (x) { return x.origin; })[0];
    if (tpO && originHits(o)) {
      var st = stripOrigin(o);
      if (st != null && st !== o) { rec.push({ path: path, txt: o, why: whyUnk(tpO), to: st }); o = st; }
      if (originHits(o)) { rec.push({ path: path, txt: o, why: whyUnk(tpO), to: "" }); return ""; }
    }
    var parts = sentsOf(o), keep = [], hit = null;
    parts.forEach(function (p) { var tp = hitTopic(p, L.filter(function (x) { return !x.origin; })); if (tp) { hit = tp; if (tp.strip) { var s2 = tp.strip(p); if (s2 && s2.split(/\s+/).length >= 2 && !hitTopic(s2, [tp])) keep.push(s2); } return; } keep.push(p); });
    if (hit) { var nv = keep.join(" ").trim(); rec.push({ path: path, txt: o, why: whyUnk(hit), to: nv }); o = nv; }
    return o;
  }
  function sentsOf(s) { try { if (typeof v98dkSents === "function") return v98dkSents(s); } catch (e) { /* 無視 */ } return String(s).split(/(?<=[.!?。])\s+/); }
  function cleanObj(o, L, path, rec) {
    if (o == null) return o;
    if (typeof o === "string") return cleanStr(o, L, path, rec);
    if (Array.isArray(o)) { var out = []; o.forEach(function (x, i) { var y = cleanObj(x, L, path + "." + i, rec); if (!(typeof x === "string" && x && !y)) out.push(y); }); return out; }
    if (typeof o === "object") { Object.keys(o).forEach(function (k) { if (SKIPK.test(k)) return; o[k] = cleanObj(o[k], L, path ? path + "." + k : k, rec); }); return o; }
    return o;
  }
  function fixWriter(r) {
    var T = curT(), L = unkTopics(T);
    if (!L.length) return r;
    var t0 = String((r && r.txt) || ""), j = null;
    try { j = (typeof xParseJson === "function") ? xParseJson(t0) : JSON.parse(t0.replace(/```json|```/g, "").match(/\{[\s\S]*\}/)[0]); } catch (e) { return r; }
    if (!j || typeof j !== "object") return r;
    var rec = [];
    cleanObj(j, L, "", rec);
    if (!rec.length) return r;
    V.pend = V.pend.concat(rec.map(function (x) { return { path: x.path, txt: x.txt, why: x.why, v101: 1 }; })).slice(-80);
    cnt("writerFix", rec.length); lg({ k: "writerFix", n: rec.length, ex: rec.slice(0, 6).map(function (x) { return x.txt.slice(0, 50) + " → " + String(x.to).slice(0, 40); }) });
    return Object.assign({}, r, { txt: JSON.stringify(j) });
  }
  V.fixWriter = fixWriter;
  if (fn("llmAsk")) {
    var oAsk = window.llmAsk;
    var askW = async function (q, maxTok, opts) {
      /* 照合の AI への頼みに、根拠の範囲と型番の扱いを足す（頼みの文だけに頼らず、答えはこのあと fixFC で必ず突き合わせる） */
      try { if (opts && /ファクトチェッカー/.test(String(opts.sys || "")) && typeof q === "string" && q.indexOf("=== 主張 ===") >= 0 && q.indexOf("【アプリからの補足】") < 0) { q = q.replace("=== 主張 ===", FC_HINT + "=== 主張 ==="); arguments[0] = q; cnt("fcHint"); } } catch (e) { err("hint", e); }
      var r = await oAsk.apply(this, arguments);
      try {
        var sys = String((opts && opts.sys) || "");
        if (/ファクトチェッカー/.test(sys) && typeof q === "string" && q.indexOf("=== 主張 ===") >= 0 && r && r.txt) r = fixFC(q, r);
        else if (r && r.txt && typeof q === "string" && (/B2B export copywriter/i.test(sys) || /海外バイヤー向け営業資料（スライド）/.test(q))) r = fixWriter(r);
      } catch (e) { err("ask", e); }
      return r;
    };
    askW.__v101fact = 1;
    window.llmAsk = askW;
  }

  /* ══════════ 資料の計画（dk3Plan の答え）：残った断定を外し、外した文言の一覧に理由つきで載せる ══════════ */
  function setAt(p, path, val) { var seg = String(path).split("."), o = p; for (var i = 0; i < seg.length - 1; i++) { if (o == null) return false; o = o[seg[i]]; } if (o == null) return false; var k = seg[seg.length - 1]; if (typeof o[k] !== "string") return false; o[k] = val; return true; }
  if (fn("dk3Plan")) {
    var oPL = window.dk3Plan;
    window.dk3Plan = async function (lang, say, force, T) {
      var p0 = V.pend.length;
      var r = await oPL.apply(this, arguments);
      try {
        var TT = T || curT();
        if (!r || !r.plan || !lang || lang === "ja" || !TT) return r;
        var L = unkTopics(TT), drops = V.pend.slice(p0), dropN = 0;
        if (L.length && fn("dk3Leaves")) {
          dk3Leaves(r.plan).forEach(function (c) {
            if (!c || !c.txt) return;
            var rec = [], nv = cleanStr(c.txt, L, c.path, rec);
            if (!rec.length) return;
            if (nv && nv.trim().split(/\s+/).length >= 2 && setAt(r.plan, c.path, nv)) { drops.push({ path: c.path, txt: c.txt, why: rec[0].why, v101: 1 }); return; }
            try { dk3Drop(r.plan, c.path); dropN++; } catch (e) { /* 無視 */ }
            drops.push({ path: c.path, txt: c.txt, why: rec[0].why, v101: 1 });
          });
          if (dropN) { try { if (fn("dk3Compact")) dk3Compact(r.plan); } catch (e) { /* 無視 */ } }
        }
        /* 照合で外した（④）主張の理由を、利用者に分かる言葉に */
        (r.dropped || []).forEach(function (d) {
          if (!d || !d.why) return;
          var w = String(d.why);
          if (/原産国は未登録（断定しない）/.test(w)) { var to = L.filter(function (x) { return x.origin; })[0]; if (to) d.why = whyUnk(to); }
          var m = w.match(/「不明」と回答（([^）]*)）/); if (m) { var tp = L.filter(function (x) { return x.lab === m[1]; })[0]; if (tp) d.why = whyUnk(tp); }
        });
        if (drops.length) {
          var seen = {};
          (r.dropped || []).forEach(function (d) { if (d) seen[String(d.txt || "")] = 1; });
          r.dropped = (r.dropped || []).concat(drops.filter(function (d) { if (seen[d.txt]) return false; seen[d.txt] = 1; return true; }));
          cnt("planDrop", drops.length); lg({ k: "planDrop", d: drops.slice(0, 8).map(function (x) { return String(x.txt).slice(0, 50) + "｜" + String(x.why).slice(0, 30); }) });
        }
        /* 保存した資料の控え（T.deck3.plans）にもそろえる（画面の「外した文言」と同じに） */
        try {
          var SP = TT.deck3 && TT.deck3.plans && TT.deck3.plans[lang];
          if (SP && Array.isArray(r.dropped)) { SP.dropped = r.dropped.map(function (d) { return { path: d.path, txt: d.txt, why: d.why }; }); if (drops.length && r.plan) SP.p = JSON.parse(JSON.stringify(r.plan)); }
        } catch (e) { err("plansync", e); }
      } catch (e) { err("plan", e); }
      return r;
    };
  }

  /* ══════════ 組み上がった資料の全部の文字（表・ノート・1枚の紹介も）：原産地・「不明」の事柄を断定しない（安全網） ══════════
     文章の中の断定は外す。表の値・短い札（60字まで）は「要確認（to be confirmed）」を付ける（登録した値そのものは消さない）。 */
  function sweep(deck, T) {
    var L = unkTopics(T), log = [];
    if (!L.length || !deck || !Array.isArray(deck.slides)) return log;
    var tb = TBC[lang2(deck.lang)] || TBC.en;
    var tpO = L.filter(function (x) { return x.origin; })[0], LN = L.filter(function (x) { return !x.origin; });
    var fixOne = function (full) {
      var o = String(full);
      if (!o.trim()) return null;
      var short = o.length <= 70 && !/[.!?。]\s+\S/.test(o);
      if (tpO && originHits(o)) {
        var st = stripOrigin(o);
        if (st != null && st.trim() && !originHits(st)) o = st;
        else if (short) o = /origin/i.test(o) ? o.replace(/\bjapan\b.*$/i, tb) : "";
        else o = sentsOf(o).filter(function (s) { return !originHits(s); }).join(" ");
      }
      var hitAny = false;
      var l2 = lang2(deck.lang), qOf = function (tp) { return (tp.qtxt && (tp.qtxt[l2] || tp.qtxt.en)) || tb; };
      if (short) {
        var tp = hitTopic(o, LN) || LN.filter(function (x) { return x.tableOnly && x.en && x.en.test(o); })[0];
        if (tp && tp.strip) { var s2 = tp.strip(o); if (s2 && !hitTopic(s2, [tp])) { o = s2; hitAny = true; } }
        var tq = tp || LN.filter(function (x) { return x.qual && x.qual.test(o); })[0];
        if (tq && !TBC_RE.test(o)) { o = o.replace(/\s*([.!?。])?\s*$/, function (m0, pu) { return " (" + qOf(tq) + ")" + (pu || ""); }); hitAny = true; }
      } else {
        var parts = sentsOf(o), keep = [];
        parts.forEach(function (s) {
          var tp2 = hitTopic(s, LN);
          if (tp2) { if (tp2.strip) { var s3 = tp2.strip(s); if (s3 && s3.split(/\s+/).length >= 3 && !hitTopic(s3, [tp2])) { s = s3; } else { hitAny = true; return; } } else { hitAny = true; return; } hitAny = true; }
          var tq2 = LN.filter(function (x) { return x.qual && x.qual.test(s); })[0];
          if (tq2 && !TBC_RE.test(s)) { s = s.replace(/\s*([.!?。])?\s*$/, function (m0, pu) { return " (" + qOf(tq2) + ")" + (pu || ""); }); hitAny = true; }
          keep.push(s);
        });
        if (hitAny) o = keep.join(" ");
      }
      return (o !== full) ? { t: o, why: hitAny ? "unk" : "origin" } : null;
    };
    deck.slides.forEach(function (S, si) {
      (S.els || []).forEach(function (e) {
        if (!e || e.k !== "text" || !Array.isArray(e.ps) || e.name === "foot" || e.name === "pno") return;
        var ch = false;
        e.ps.forEach(function (p) {
          var rs = (p.r || []).filter(function (r) { return r && typeof r.t === "string"; });
          if (!rs.length) return;
          var full = rs.map(function (r) { return r.t; }).join("");
          var x = fixOne(full);
          if (!x) return;
          rs[0].t = x.t; for (var i = 1; i < rs.length; i++) rs[i].t = "";
          log.push({ si: si + 1, a: full.slice(0, 80), b: x.t.slice(0, 80), why: x.why }); ch = true;
        });
        if (ch) { try { delete e.mh; } catch (z) { /* 無視 */ } }
      });
      if (S.notes) { var xn = fixOne(S.notes); if (xn) { S.notes = xn.t; log.push({ si: si + 1, a: "notes", b: xn.t.slice(0, 60), why: xn.why }); } }
    });
    deck.v101fact = log;
    if (log.length) { cnt("sweep", log.length); lg({ k: "sweep", n: log.length, ex: log.slice(0, 8) }); }
    return log;
  }
  V.sweep = sweep;
  if (fn("dk3Assemble")) {
    var oAS = window.dk3Assemble;
    window.dk3Assemble = async function (lang, opts) {
      var deck = await oAS.apply(this, arguments);
      try { if (deck && deck.slides && deck.lang && deck.lang !== "ja") sweep(deck, (opts && opts.T) || curT()); } catch (e) { err("sweep", e); }
      return deck;
    };
  }
  if (fn("v85dkOneDeck")) {
    var oOD = window.v85dkOneDeck;
    window.v85dkOneDeck = function () {
      var r = oOD.apply(this, arguments);
      var fin = function (one) { try { if (one && Array.isArray(one.slides) && one.lang && one.lang !== "ja") sweep(one, curT()); } catch (e) { err("one", e); } return one; };
      return (r && typeof r.then === "function") ? r.then(fin) : fin(r);
    };
  }

  /* ══════════ No.620 確認の文言「値が入っていない行は資料に載せていません（…）」を資料の本体と一致させる ══════════
     原因：21.80 の層（v79）は、表の「値の欄が空の行」を表から外し、その行の項目名を全部「載せていません」に並べる。
           E「PFE・BFE・VFE 99%カット」・H「内容量200g・賞味期限12か月」は項目名に値が入った行（値の欄は空）で、表には載らないが、
           同じ内容は資料のほかのページ（強み・仕様）に出ている → 「載せていません」と本体が食い違う。
     直し：項目名に入っている数字が全部、資料の本文に出ている行は「載せていません」から外し、「表の行には入れていませんが、資料のほかのページに出ています」と分けて書く。 */
  function deckText(deck) {
    var a = [];
    try { (deck.slides || []).forEach(function (S) { (S.els || []).forEach(function (e) { if (e && e.k === "text" && Array.isArray(e.ps)) a.push(e.ps.map(function (p) { return (p.r || []).map(function (r) { return r && r.t != null ? String(r.t) : ""; }).join(""); }).join("\n")); }); }); } catch (e) { /* 無視 */ }
    return a.join("\n");
  }
  function shownElsewhere(lab, txt) {
    var nums = NF(lab).match(/\d+(?:\.\d+)?/g) || [];
    if (!nums.length) return false;
    return nums.every(function (n) { return new RegExp("(^|[^0-9.])" + n.replace(".", "\\.") + "(?![0-9])").test(txt); });
  }
  V.shownElsewhere = shownElsewhere;
  var EMPTY_RE = /^値が入っていない行は資料に載せていません（([\s\S]+?)）。値を商品情報の成分表・寸法表に入れると載ります$/;
  if (fn("dk3Check")) {
    var oCK = window.dk3Check;
    window.dk3Check = function (deck) {
      var r = oCK.apply(this, arguments);
      /* No.611：照合で「売れる理由」のページの文が全部外れて、ページごと無くなったときは、黙って消さず理由と次の一手を出す */
      try {
        if (r && Array.isArray(r.warn) && deck && Array.isArray(deck.slides) && deck.lang && deck.lang !== "ja" && !r.warn.some(function (w) { return w && w.k === "v101why"; })) {
          var T9 = curT(), SP9 = T9 && T9.deck3 && T9.deck3.plans && T9.deck3.plans[deck.lang];
          var hasWhy = deck.slides.some(function (s) { return s && s.kind === "why"; });
          var whyDrop = ((SP9 && SP9.dropped) || []).filter(function (d) { return d && /^why\./.test(String(d.path || "")); });
          var hasStr = prodsOf(T9).some(function (t) { return Array.isArray(t.strengths) && t.strengths.some(function (s) { return Array.isArray(s) ? String(s[0] || "").trim() : String(s || "").trim(); }); });
          if (!hasWhy && whyDrop.length && hasStr) { r.warn.push({ k: "v101why", t: "「売れる理由」のページは、根拠の確かめで文が全部外れたため入れていません（外した文言 " + whyDrop.length + "件・下に表示）。商品の強みを、数字や試験の条件つきで1つずつ登録するか、追加ヒアリングで答えてから「↻ もう一度作る」を押すと載ります" }); cnt("whyGone"); }
          /* 「売れる理由」が取引条件（建値・支払・港・HS）だけ＝的外れ：登録の強みがあるのに理由に1つも出ていないことを知らせる */
          if (hasWhy && hasStr) {
            var WS = deck.slides.filter(function (s) { return s && s.kind === "why"; })[0];
            var wt = (WS.els || []).filter(function (e) { return e && e.k === "text" && Array.isArray(e.ps); }).map(function (e) { return e.ps.map(function (p) { return (p.r || []).map(function (x) { return x && x.t != null ? String(x.t) : ""; }).join(""); }).join(" "); }).filter(function (t) { return t.trim().length > 12 && !/^(?:Page \d+|DRAFT|Reasons to Stock|Why\b)/i.test(t.trim()); });
            var LOG = /\b(?:FOB|CIF|CFR|EXW|DDP|incoterms?|T\/T|payment|advance|port|shipment|shipping|ships?|lead time|HS code|customs|clearance|transaction term|trade term)\b/i;
            var items = wt.filter(function (t) { return !/Kakuu|Co\., Ltd\./.test(t) || t.length > 60; });
            if (items.length >= 2 && items.every(function (t) { return LOG.test(t); })) { r.warn.push({ k: "v101why", t: "「売れる理由」のページが取引条件（建値・支払・港など）だけになっています。登録した商品の強みは理由に入っていません。強みを数字や試験の条件つきで1つずつ登録してから「↻ もう一度作る」を押してください" }); cnt("whyLogi"); }
          }
        }
      } catch (e) { err("why", e); }
      try {
        if (!r || !Array.isArray(r.warn) || !deck) return r;
        var wi = r.warn.findIndex(function (w) { return w && w.k === "v79empty"; });
        if (wi < 0) return r;
        var labs = [];
        try { ((deck.v79 && deck.v79.empty) || []).forEach(function (x) { (x.labels || []).forEach(function (l) { if (labs.indexOf(l) < 0) labs.push(l); }); }); } catch (e) { /* 無視 */ }
        if (!labs.length) { var m = String(r.warn[wi].t || "").match(EMPTY_RE); if (m) labs = [m[1]]; }
        var txt = deckText(deck);
        var shown = labs.filter(function (l) { return shownElsewhere(l, txt); }), keep = labs.filter(function (l) { return shown.indexOf(l) < 0; });
        if (!shown.length) return r;
        if (keep.length) r.warn[wi] = Object.assign({}, r.warn[wi], { t: "値が入っていない行は資料に載せていません（" + keep.slice(0, 6).join("・") + "）。値を商品情報の成分表・寸法表に入れると載ります", v101: 1 });
        else r.warn.splice(wi, 1);
        r.ok = Array.isArray(r.ok) ? r.ok : [];
        var okT = "表の行には入れていませんが、同じ内容は資料のほかのページに出ています（" + shown.slice(0, 6).join("・") + "）";
        if (r.ok.indexOf(okT) < 0) r.ok.push(okT);
        cnt("emptyFix", shown.length); lg({ k: "emptyFix", shown: shown, keep: keep });
      } catch (e) { err("check", e); }
      return r;
    };
  }

  /* ══════════ No.616 書類（PI・CI・PL・S/I・原産地証明の下書き）：原産地が未登録なら「Japan」を入れない ══════════
     原因：土台の buildShip（商品から作る出荷の見本）は PL の「Origin」を「Japan」＋産地で決め打ち。原産地証明の下書き（poDocHtml・v85docSpec）も
           「Wholly obtained / produced in Japan」「JAPAN」で決め打ちだった。 */
  var ORG_TBC = "To be confirmed (country of origin not registered)";
  function originTxt(O) { return O.known ? (O.country === "Japan" ? "Japan" + (O.raw && !/^日本$|^japan$/i.test(O.raw) && countryOf(O.raw) === "Japan" ? " (" + O.raw.replace(/^日本\s*[（(]?|[)）]$/g, "") + ")" : "") : O.country) : ORG_TBC; }
  function fixPlEx(rows, T) {
    if (!Array.isArray(rows)) return 0;
    var O = v101origin(T), n = 0;
    rows.forEach(function (x) { if (Array.isArray(x) && /^(?:origin|country of origin)$/i.test(String(x[0]).trim()) && /japan/i.test(String(x[1] || "")) && (!O.known || O.country !== "Japan")) { x[1] = originTxt(O); n++; } });
    return n;
  }
  V.fixPlEx = fixPlEx;
  function fixShip(S, T) {
    var n = 0;
    try {
      if (!S || !T) return 0;
      if (S.docRows) n += fixPlEx(S.docRows.plEx, T);
      var O = v101origin(T);
      if (typeof S.origin === "string" && /japan/i.test(S.origin) && (!O.known || O.country !== "Japan")) { S.origin = originTxt(O); n++; }
      if (Array.isArray(S.link) && !O.known) S.link.forEach(function (l) { if (Array.isArray(l) && /日本製であることの証明/.test(String(l[1] || ""))) { l[1] = "原産国が未登録です。原産国を確かめてから申請します（必要な場合のみ）"; n++; } });
    } catch (e) { err("ship", e); }
    if (n) cnt("shipFix", n);
    return n;
  }
  V.fixShip = fixShip;
  if (fn("buildShip")) {
    var oBS = window.buildShip;
    window.buildShip = function (d, t) { var S = oBS.apply(this, arguments); try { if (S && t) fixShip(S, t); } catch (e) { err("bs", e); } return S; };
  }
  function shipTen() { try { return (typeof TEN !== "undefined" && TEN) || null; } catch (e) { return null; } }
  if (fn("rDoc")) {
    var oRD = window.rDoc;
    window.rDoc = function (k) { try { if (typeof D !== "undefined" && D && D.ship) fixShip(D.ship, shipTen()); } catch (e) { err("rdoc", e); } return oRD.apply(this, arguments); };
  }
  if (fn("poDocHtml")) {
    var oPD = window.poDocHtml;
    window.poDocHtml = function (k) {
      try { if (typeof D !== "undefined" && D && D.ship) fixShip(D.ship, shipTen()); } catch (e) { err("podoc0", e); }
      var h = oPD.apply(this, arguments);
      try { var O = v101origin(shipTen()); if (!O.known && typeof h === "string") h = h.replace(/Wholly obtained \/ produced in Japan/g, ORG_TBC); } catch (e) { err("podoc", e); }
      return h;
    };
  }
  if (fn("v85docSpec")) {
    var oDS = window.v85docSpec;
    window.v85docSpec = function (K, F) {
      var sp = oDS.apply(this, arguments);
      try {
        var T = null; try { T = (typeof v85docTen === "function" && v85docTen()) || shipTen(); } catch (e) { T = shipTen(); }
        var O = v101origin(T);
        if (sp && Array.isArray(sp.rows) && !O.known) {
          var Q = fn("v85docQ") ? v85docQ() : "［要確認］";
          sp.rows.forEach(function (r) { if (Array.isArray(r) && (/^(?:origin|isf5)$/.test(String(r[1] || "")) || /country of origin/i.test(String(r[0] || ""))) && /^\s*japan\s*$/i.test(String(r[2] || ""))) { r[2] = Q; cnt("docSpec"); } });
        }
      } catch (e) { err("docspec", e); }
      return sp;
    };
  }

  /* ══════════ 外した数字の点検（21.86）：手順の番号「01」「02」を数字として数えない ══════════
     F の本物の AI の資料で、手順のページの「01  Friction material: NAO」の「01」を、外した数字「1」が残っているとして
     「登録の情報の値を確かめてから、もう一度作ってください」（直しようのない行き止まり）と出ていた（22.00.1 の N14 と同じ種類） */
  if (fn("v86dkElText")) {
    var oET = window.v86dkElText;
    window.v86dkElText = function (e) {
      var t = oET.apply(this, arguments);
      try { return String(t || "").replace(/(^|\n|\s{2,})0\d(?=\s)/g, "$1").replace(/\bRow\s+\d{1,2}\b/gi, "Row"); } catch (x) { return t; }
    };
  }

  /* ══════════ 外した理由・確認の文言の訳（英・中・西） ══════════ */
  var WHY_TR = [
    [/^原産国・製造国は未登録（ヒアリングの答え「([\s\S]*?)」）のため、原産地を断定して書きません（商品情報の「産地・製造国」に入れると載せられます）$/, { en: "the country of origin is not registered (your answer: “$1”), so the deck does not state an origin (enter it under “Origin / country of manufacture” in the product information to show it)", zh: "原产国／制造国未登记（您的回答：“$1”），因此资料中不断定原产地（在商品信息的“产地・制造国”中填写后即可显示）", es: "el país de origen no está registrado (su respuesta: «$1»), así que no se afirma el origen (introdúzcalo en «Origen / país de fabricación» de la información del producto para mostrarlo)" }],
    [/^「([\s\S]*?)」に「([\s\S]*?)」と答えているため、([\s\S]*?)を断定して書きません（追加ヒアリングで答えると載せられます）$/, { en: "you answered “$2” to “$1”, so the deck does not state this ($3) as fact (answer it in the follow-up questions to show it)", zh: "您对“$1”回答了“$2”，因此资料中不断定（$3）（在追加询问中回答后即可放入）", es: "respondió «$2» a «$1», así que no se afirma ($3) (respóndalo en las preguntas de seguimiento para incluirlo)" }],
    [/^(?:AIの根拠確認：)?原産国は未登録（断定しない）$/, { en: "country of origin not registered (not stated)", zh: "原产国未登记（不断定）", es: "país de origen no registrado (no se afirma)" }],
    [/^(?:AIの根拠確認：)?「不明」と回答（([\s\S]*?)）$/, { en: "answered “unknown” ($1)", zh: "回答为“不明”（$1）", es: "respondido «desconocido» ($1)" }]
  ];
  function whyTr(w, l) { for (var i = 0; i < WHY_TR.length; i++) { var m = String(w).match(WHY_TR[i][0]); if (m) { var t = WHY_TR[i][1][l]; if (t) return t.replace("$1", m[1] || "").replace("$2", m[2] || "").replace("$3", m[3] || ""); } } return null; }
  V.whyTr = whyTr;
  if (fn("i13Why")) {
    var oIW = window.i13Why;
    window.i13Why = function (w, l) { try { var x = whyTr(w, l); if (x != null) return x; } catch (e) { err("whytr", e); } return oIW.apply(this, arguments); };
  }
  try {
    if (typeof I18N !== "undefined" && Array.isArray(I18N.pat)) {
      I18N.pat.unshift({ re: /^表の行には入れていませんが、同じ内容は資料のほかのページに出ています（([\s\S]+)）$/,
        en: (m) => "Not added as table rows, but the same content appears on other pages of the deck (" + m[1] + ")",
        zh: (m) => "未作为表格行放入，但相同内容已出现在资料的其他页面（" + m[1] + "）",
        es: (m) => "No se añadió como fila de tabla, pero el mismo contenido aparece en otras páginas de la presentación (" + m[1] + ")" });
      I18N.pat.unshift({ re: /^「売れる理由」のページは、根拠の確かめで文が全部外れたため入れていません（外した文言 (\d+)件・下に表示）。商品の強みを、数字や試験の条件つきで1つずつ登録するか、追加ヒアリングで答えてから「↻ もう一度作る」を押すと載ります$/,
        en: (m) => "The “Reasons to stock” page was left out because every sentence on it was removed by the evidence check (" + m[1] + " removed, shown below). Register each product strength separately with figures or test conditions, or answer the follow-up questions, then press “↻ Create again” to include it",
        zh: (m) => "“畅销理由”页面的文字在依据确认中全部被删除，因此未放入（删除 " + m[1] + " 条，见下方）。请逐条登记带数字或检测条件的商品优势，或在追加询问中回答后，按“↻ 重新生成”即可放入",
        es: (m) => "La página «Razones para comprar» no se incluyó porque la revisión de fuentes quitó todas sus frases (" + m[1] + " quitadas, ver abajo). Registre cada punto fuerte por separado con cifras o condiciones de ensayo, o responda las preguntas de seguimiento, y pulse «↻ Crear de nuevo»" });
      I18N.pat.unshift({ re: /^「売れる理由」のページが取引条件（建値・支払・港など）だけになっています。登録した商品の強みは理由に入っていません。強みを数字や試験の条件つきで1つずつ登録してから「↻ もう一度作る」を押してください$/,
        en: () => "The “Reasons to stock” page only lists trade terms (Incoterms, payment, port). None of your registered product strengths made it into the reasons. Register each strength separately with figures or test conditions, then press “↻ Create again”",
        zh: () => "“畅销理由”页面只有交易条件（贸易术语・付款・港口）。登记的商品优势没有放入理由。请逐条登记带数字或检测条件的优势后，按“↻ 重新生成”",
        es: () => "La página «Razones para comprar» solo muestra condiciones comerciales (Incoterms, pago, puerto). Ninguno de los puntos fuertes registrados aparece. Registre cada punto fuerte por separado con cifras o condiciones de ensayo y pulse «↻ Crear de nuevo»" });
      WHY_TR.forEach(function (x) { I18N.pat.unshift({ re: x[0], en: function (m) { return whyTr(m[0], "en"); }, zh: function (m) { return whyTr(m[0], "zh"); }, es: function (m) { return whyTr(m[0], "es"); } }); });
    }
  } catch (e) { err("i18n", e); }

  /* ══════════ 資料の中の食い違いを数える検査（試験の道具・画面からも呼べる） ══════════ */
  V.audit = function (deck, T) {
    var ng = [];
    try {
      var L = unkTopics(T || curT()), txt = deckText(deck);
      sentsOf(txt.replace(/\n/g, " . ")).forEach(function (s) { var tp = hitTopic(s, L); if (tp && !TBC_RE.test(s)) ng.push((tp.origin ? "616:" : "618:") + s.slice(0, 80)); });
    } catch (e) { err("audit", e); }
    return ng;
  };
})();
