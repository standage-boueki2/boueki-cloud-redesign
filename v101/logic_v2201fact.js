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
  var SHIP_CTX = /\b(?:ship\w*|export\w*|deliver\w*|dispatch\w*|supplied|supplying|supply|send|sent|FOB|CIF|CFR|EXW|port|sea|air|freight|lead time|transit|from (?:our|the) (?:port|warehouse))\b[^.!?]{0,30}$/i;
  /* 22.01.2（w2-2）：「Japanese ○○（商品）」も原産地の言い切り（「Japanese company / maker / supplier」は会社のことなので除く） */
  var JP_NOUN = "(?:products?|goods|supplies|items?|toys?|puzzles?|masks?|treats?|snacks?|jerky|parts?|pads?|components?|bearings?|cosmetics?|skincare|serums?|miso|foods?|sprays?|sanitizers?|hygiene|craftsmanship|manufacturing|production)";
  var JP_CO = "(?:company|companies|maker|makers|manufacturer|manufacturers|supplier|suppliers|brand|brands|exporter|exporters|producer|producers|firm|firms|business|team|partner|partners|corporation|market|buyers?|sanitation|act|acts|law|laws|standards?|regulations?|safety|labeling|labelling)";
  var JP_PROD = new RegExp("\\bJapanese\\s+(?:[A-Za-z-]+\\s+){0,2}" + JP_NOUN + "\\b(?!\\s+" + JP_CO + "\\b)", "i");
  var JP_PROD_STRIP = new RegExp("\\bJapanese\\s+(?=(?:[A-Za-z-]+\\s+){0,2}" + JP_NOUN + "\\b(?!\\s+" + JP_CO + "\\b))", "gi");
  function originHits(s) {
    s = String(s || "");
    if (ORIGIN_EN.test(s) || JP_PROD.test(s)) return true;
    var re = /\b(?:from|of)\s+Japan\b/gi, m;
    while ((m = re.exec(s))) { var pre = s.slice(Math.max(0, m.index - 40), m.index); if (!SHIP_CTX.test(pre) && !/\b(?:company|maker|manufacturer|brand|team|we|us|supplier|exporter|partner|based)\b[^.!?]{0,20}$/i.test(pre)) return true; }
    return false;
  }
  V.originHits = originHits;
  /* 文から原産地の断定の言い回しだけを外す（残りの文は残す）。外せなければ null */
  function stripOrigin(s) {
    var o = String(s || ""), b = o;
    o = o.replace(JP_PROD_STRIP, "");
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
    /* 22.01.1：「成分適合性」「基準適合」など車種・機種の適合でない「適合」は話題にしない（B の容器の耐性試験の問いで適合の話題になっていた） */
    { k: "fit", lab: "適合（車種・機種・品番）", ja: /適合(?:車種|車|表|品番|機種|型式|一覧|リスト|する(?:車|機種|型式))|車種|対応車|対応機種|互換|フィッティング|fitment|application (?:list|chart)/i,
      en: /application (?:chart|list|guide|table|catalog(?:ue)?|data)|\bfitments?\b|\bcompatib(?:le|ility)\b|\bfits?\s+(?:most|all|major|leading|many|popular)\b|\b(?:major|leading|all|most|popular|many)[\s-]+(?:japanese[\s-]+)?(?:passenger[- ]car[\s-]+|car[\s-]+|vehicle[\s-]+|auto(?:motive)?[\s-]+|automobile[\s-]+)?(?:makers?|brands?|manufacturers?|models?|OEMs?)\b|\bOEM[- ](?:equivalent|replacement|compatible)\b|\bdirect[- ]fit\b|\bcovers? (?:most|major|all) (?:models|vehicles|cars)\b|主要メーカー|適合表|車種対応|适配|适用车型|compatible con|aplicaci[oó]n/i,
      ja2: /主要メーカー|適合|対応車種|全車種|多車種|互換/ },
    { k: "asbestos", lab: "アスベスト不使用", ja: /アスベスト|石綿|asbestos/i, en: /non-?asbestos|asbestos[- ]free(?! certificate)|free (?:of|from) asbestos|without asbestos|no asbestos|无石棉|sin amianto|sin asbesto/i, ja2: /アスベスト|石綿|NAO/i,
      /* 「NAO 材」は登録した材質の名前なので消さない。「non-asbestos」「asbestos-free」の言い切りだけを外し、NAO には「アスベスト不使用の証明は要確認」を付ける */
      strip: function (s) { return String(s).replace(/\s*\(\s*non-?asbestos[^)]*\)/gi, "").replace(/\bnon-?asbestos(?:\s+organic)?\s*/gi, "").replace(/\s*[,;]?\s*\basbestos[- ]free\b\s*/gi, " ").replace(/\b(?:free (?:of|from)|without|no) asbestos\b\s*/gi, "").replace(/\s{2,}/g, " ").replace(/\s+([,.;:)])/g, "$1").trim(); },
      qual: /\bNAO\b/, qtxt: { en: "asbestos-free certificate: to be confirmed", es: "certificado sin amianto: por confirmar", zh: "无石棉证明：待确认" } },
    { k: "halal", lab: "ハラール", ja: /ハラール|ハラル|halal/i, en: /\bhalal\b/i, ja2: /ハラ[ー]?ル/ },
    { k: "organic", lab: "有機（オーガニック）", ja: /有機(?!溶剤|化合物|物|ハロゲン|EL)|オーガニック|organic/i, en: /\borganic\b/i, ja2: /有機|オーガニック/ },
    { k: "oem", lab: "OEM・PB の受託", ja: /OEM|ODM|PB|プライベートブランド|受託/i, en: /\b(?:OEM|ODM|private[- ]label)\b/i, ja2: /OEM|ODM|PB|受託/ },
    { k: "capacity", lab: "生産能力・供給量", ja: /生産能力|月産|年産|供給(?:量|能力)|生産量/i, en: /\b(?:monthly|annual|production) capacity\b|\bper month\b[^.]{0,20}\b(?:units|pcs|sets)\b|\bstable supply\b|\blarge[- ]volume supply\b/i, ja2: /月産|生産能力|安定供給/ },
    { k: "shelflife", lab: "期限", ja: /賞味期限|消費期限|使用期限|有効期限/i, en: /\bshelf[- ]life\b|\bbest before\b|\bexpir\w*\b/i, ja2: null, tableOnly: 1 }
  ];
  var ASK_HAVE = /あります|ありますか|有無|取得|持って|お持ち|していますか|ですか|ますか|教えて|可能|でしょうか/;
  var TOK_STOP = /^(?:AI|OK|NG|PDF|URL|Q|A|TEL|FAX|HS|MOQ|FOB|CIF|EXW|DDP|T\/T|L\/C|JPY|USD|EUR|SKU|JAN|PI|CI|PL|EC|SNS|PB)$/;
  /* 22.01.1（検証役 v1 N10）：「不明」の話題は、問いがその事柄そのものを聞いているときだけ当てはめる（同じ事柄にだけ）。
     ・資料（試験報告書・証明書・規格書…）の項目として出てくる言葉（「試験報告書について、対象菌種・試験方法・接触時間・有効期限」の「有効期限」）は、
       商品の事柄ではない → 当てはめない（B：試験報告書の有効期限に「わからない」→ 商品の使用期限「製造から3年」に (to be confirmed) が付いていた）
     ・期限は、商品情報に期限（賞味期限・使用期限）が登録されていれば、ほかの問いの「不明」で上書きしない（入力が正）
     ・登録に同じ事柄がはっきり書かれていて（有機JAS など）、問いがその細目（番号・詳細・条件・範囲・銘柄）を聞いているだけなら、事柄そのものは未確認にしない
       （アスベストは 22.01 の決めどおり：証明書が「不明」なら材質名に「要確認」を付ける） */
  var DOC_W = /試験報告書|報告書|成績書|証明書|規格書|分析書|検査書|認証書|データシート|SDS|COA|カタログ|資料|書類/;
  var DETAIL_Q = /番号|詳細|内容|範囲|条件|方法|銘柄|硬度|深さ|期間|日付|発行|有効期限|ロット|バージョン/;
  function topicApplies(tp, u, T) {
    try {
      var q = NF(u.q), mT = q.match(tp.ja);
      if (!mT) return false;
      var mD = q.match(DOC_W);
      if (mD && mD.index < mT.index && /について|の(?:内容|詳細|項目)|[、・,]/.test(q.slice(mD.index, mT.index))) return false;
      if (tp.k === "shelflife" && u.src !== "field" && T && typeof T.shelf === "string" && T.shelf.trim() && !isUnk(T.shelf) && /\d/.test(T.shelf)) return false;
      if (!tp.qual && tp.ja2 && u.src !== "field" && DETAIL_Q.test(q.replace(tp.ja, ""))) {
        var reg = regText(T);
        if (tp.ja2.test(reg) || tp.ja.test(reg)) return false;
      }
    } catch (e) { err("tpa", e); }
    return true;
  }
  V.topicApplies = topicApplies;
  function topicsOf(u, T) {
    var q = NF(u.q), out = [];
    TOPICS.forEach(function (tp) { if (tp.ja.test(q) && topicApplies(tp, u, T)) out.push(tp); });
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
  function qcut(q, n) { q = NF(q).trim(); if (q.length <= n) return q; var c = q.slice(0, n); var k = Math.max(c.lastIndexOf("、"), c.lastIndexOf("・"), c.lastIndexOf("，")); return (k >= n * 0.6 ? c.slice(0, k) : c) + "…"; }
  V.qcut = qcut;
  function whyUnk(tp) {
    if (tp.origin) return "原産国・製造国は未登録（ヒアリングの答え「" + String(tp.a || "未登録").slice(0, 12) + "」）のため、原産地を断定して書きません（商品情報の「産地・製造国」に入れると載せられます）";
    return "「" + qcut(tp.q || tp.lab, 48) + "」に「" + String(tp.a || "不明").slice(0, 12) + "」と答えているため、" + tp.lab + "を断定して書きません（追加ヒアリングで答えると載せられます）";
  }
  V.whyUnk = whyUnk;
  var NOT_ASSERT = /\b(?:is|are)\s+not\s+(?:yet\s+)?(?:registered|specified|confirmed|available|provided|stated|listed|known|verified)\b|\b(?:not|un)\s*(?:yet\s+)?(?:confirmed|registered|specified|verified)\b|\bunknown\b|未確認|未登録|要確認/i;
  V.NOT_ASSERT = NOT_ASSERT;
  function hitTopic(s, L) { s = String(s || ""); if (TBC_RE.test(s) || NOT_ASSERT.test(s)) { if (!L.some(function (tp) { return tp.origin; }) || !originHits(s.replace(NOT_ASSERT, " ").replace(TBC_RE, " "))) return null; } for (var i = 0; i < L.length; i++) { var tp = L[i]; if (tp.tableOnly) continue; if (tp.origin ? originHits(s) : (tp.en && tp.en.test(s))) return tp; } return null; }
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
    /* 22.01.1（v1 N6・v2-7）：会社と商品の関係（「会社と品番の結合根拠なし」「供給するとの記載なし」で外していた） */
    try { var coN = NF(t.co || (T && T.co) || "").trim(), coE = NF(t.coEn || (T && T.coEn) || "").trim(); if (coN || coE) L.push("販売する会社：" + [coN, coE].filter(Boolean).join("（") + (coN && coE ? "）" : "") + "（この会社が海外に販売する自社の商品）"); } catch (e) { /* 無視 */ }
    if (O.known) L.push("原産国・製造国（" + (O.src || "登録") + "）：" + (NF(O.raw || "").trim() || O.country) + "（" + O.country + "）");
    if (!O.known) L.push("原産国・製造国：未登録（ヒアリングの答え「" + ((unkList(t).filter(function (u) { return u.k === "origin" || ORIG_Q.test(u.q); })[0] || {}).a || "未登録") + "」。原産国を断定して書かない。会社の所在地は原産国の根拠にならない）");
    var U = unkTopics(t).filter(function (x) { return !x.origin; });
    if (U.length) L.push("■利用者が「不明」「わからない」と答えた事柄（確かめるまで資料に断定して書かない）\n" + U.map(function (x) { return "・" + String(x.q).slice(0, 60) + " → " + x.a; }).join("\n"));
    return L.join("\n");
  }
  /* 📎の資料（取り込んだ資料）の文字 */
  function srcText(T) {
    var a = [];
    try { prodsOf(T).forEach(function (t) { (Array.isArray(t.sources) ? t.sources : []).forEach(function (s) { if (s && s.on !== false && s.txt && !/^regkb_/.test(String(s.id || ""))) a.push({ name: String(s.name || ""), txt: NF(s.txt) }); }); }); } catch (e) { /* 無視 */ }
    return a;
  }
  /* 📎の資料の「会社の紹介：…」「事業内容：…」（会社情報の事業内容が未登録のときの根拠） */
  function srcIntro(T) {
    var r = null;
    srcText(T).some(function (s) { var m = s.txt.match(/(?:^|\n)\s*(?:会社の紹介|会社紹介|企業紹介|会社概要|事業内容|当社について)\s*[:：]\s*([^\n]{4,160})/); if (m) { r = { txt: m[1].trim(), name: s.name }; return true; } return false; });
    return r;
  }
  V.srcIntro = srcIntro;
  /* 会社の所在国（商品の原産地とは別）。住所が登録されていればそれ、無ければ社名の会社の形（株式会社など）と仕出港 */
  var JP_PORT = /東京|横浜|名古屋|大阪|神戸|博多|門司|清水|新潟|仙台|苫小牧|北九州|四日市|千葉|川崎|堺|水島|広島|那覇|成田|羽田|関西|中部|福岡|鹿児島|富山|金沢|敦賀|舞鶴|秋田|八戸|釧路|室蘭|函館|小樽|石狩|酒田|小名浜|日立|鹿島|下関|徳山|高松|松山|高知|大分|細島|志布志|伊万里|長崎|熊本|三河|衣浦|田子の浦|御前崎|伏木/;
  function coCountry(T) {
    try {
      var DM = fn("dk3Meta") ? (dk3Meta(T) || {}) : {}, F = DM.facts || {};
      var ad = NF(DM.addr || F.addrEn || F.addr || "");
      if (ad && !isUnk(ad)) { var c = countryOf(ad); if (c) return { c: c, why: "登録の住所" }; }
      var co = NF((T && T.co) || ""), pol = NF((T && T.pol) || "");
      var form = /株式会社|有限会社|合同会社|合資会社|合名会社|[（(]株[)）]|[（(]有[)）]/.test(co), port = JP_PORT.test(pol);
      if (form || port) return { c: "Japan", why: [form ? "社名が日本の会社の形（株式会社など）" : "", port ? "仕出港が日本の港（" + pol.slice(0, 12) + "）" : ""].filter(Boolean).join("・") };
    } catch (e) { err("cocty", e); }
    return null;
  }
  V.coCountry = coCountry;
  function coLines(T) {
    var L = [];
    var CC = coCountry(T);
    if (CC) L.push("会社の所在国：" + (CC.c === "Japan" ? "日本" : CC.c) + "（" + CC.why + "）。会社の所在国は商品の原産国の根拠にはならない");
    var DM = fn("dk3Meta") ? (dk3Meta(T) || {}) : {};
    var it = srcIntro(T);
    if (it && !NF(DM.biz || "").trim()) L.push("事業内容（📎の資料「" + it.name.slice(0, 40) + "」の会社の紹介）：" + it.txt);
    var cats = prodsOf(T).map(function (t) { return NF(t.cat || "").trim(); }).filter(Boolean);
    if (cats.length) L.push("取り扱う商品の区分：" + cats.filter(function (v, i, a) { return a.indexOf(v) === i; }).join("・"));
    var items = prodsOf(T).map(function (t) { return [NF(t.item || ""), NF(t.itemEn || "")].filter(Boolean).join("／") + (t.sku ? "（品番 " + NF(t.sku) + "）" : ""); }).filter(Boolean);
    if (items.length) L.push("取扱商品（この会社の自社の商品）：" + items.join("、"));
    return L.join("\n");
  }
  V.coLines = coLines;
  function strengthsJa(t) {
    return (Array.isArray(t && t.strengths) ? t.strengths : []).map(function (s) { return Array.isArray(s) ? [NF(s[0] || "").trim(), NF(s[1] || "").trim()] : [NF(s || "").trim(), ""]; })
      .filter(function (s) { if (!s[0] || isUnk(s[0])) return false; try { if (fn("dk3Sick") && dk3Sick(s[0])) return false; } catch (e) { /* 無視 */ } return true; });
  }
  V.strengthsJa = strengthsJa;
  if (fn("dk3Corpus")) {
    var oCO = window.dk3Corpus;
    window.dk3Corpus = function (T) {
      var C = oCO.apply(this, arguments);
      try {
        var TT = T || (typeof TEN !== "undefined" ? TEN : null);
        if (!C || !Array.isArray(C.blocks) || !TT || C.__v101) return C;
        C.__v101 = 1;
        var extra = "";
        /* 22.01.1（v1 N6・N7）：会社の所在国・事業内容（📎の「会社の紹介」）・業種・取扱商品を会社の段に（照合の AI が「日本所在が不明」「生産者との明記なし」「用途の記載なし」としていた） */
        try {
          var cl = coLines(TT), c1 = C.blocks.filter(function (x) { return x.id === "C1"; })[0];
          if (cl) {
            if (c1) { if (c1.txt.indexOf(cl.split("\n")[0]) < 0) { c1.txt += "\n" + cl; extra += "\n" + cl; } }
            else { C.blocks.unshift({ id: "C1", label: "会社情報（登録）", txt: cl, trust: "A" }); extra += "\n" + cl; }
          }
        } catch (e) { err("coLines", e); }
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
  /* 会社と商品の関係だけの文か（社名・商品名・品番・区分の言葉・つなぎの言葉を除いて何が残るか） */
  var FUNC_W = /^(?:the|a|an|of|for|to|from|by|with|and|or|in|on|at|as|is|are|be|our|we|us|its|it|this|that|these|those|regarding|about|re|contact|contacts|please|item|items|product|products|model|models|no|supplies|supply|supplied|supplier|suppliers|offers|offer|offering|offered|provides|provide|provider|sells|sell|seller|exports|export|exporter|exporters|company|companies|co|ltd|inc|corp|corporation|limited|profile|overview|range|line|lineup|introducing|presents|from|here|via|direct|directly|available|part|number|code|sku|brand|sale|sales|selling|overseas|international|abroad|markets?|buyers?|business|discuss|terms|your|you|us)$/i;
  var MAKER_EN = /^(?:producer|producers|maker|makers|manufacturer|manufacturers|manufactures|manufacture|manufactured|produces|produce|produced|brewery|brewer|brewers|brews|brewed|develops|developer|development|factory|production|producing|manufacturing|making)$/i;
  var MAKER_JA = /製造|醸造|メーカー|生産|工業|製作所|製薬|酒造|工場|開発・製造|自社製/;
  var CAT_EN = [[/食品|味噌|みそ|調味|菓子|飲料|茶/, ["food", "foods", "seasoning"]], [/化粧|美容|コスメ|スキンケア/, ["cosmetic", "cosmetics", "skincare", "beauty"]], [/工業|部品|機械|軸受|ベアリング/, ["industrial", "parts", "component", "components", "machinery", "bearing", "bearings"]],
    [/日用|雑貨|衛生|除菌|マスク/, ["household", "daily", "hygiene", "goods", "sanitizing"]], [/医療/, ["medical", "hygiene"]], [/ペット|犬|猫/, ["pet", "pets", "dog", "dogs", "cat", "cats"]], [/玩具|おもちゃ|知育|パズル/, ["toy", "toys", "educational", "wooden"]],
    [/自動車|車|ブレーキ/, ["automotive", "auto", "car", "vehicle", "brake"]], [/酒/, ["sake", "liquor"]], [/アパレル|衣料/, ["apparel", "clothing"]]];
  function residualWords(txt, T, MT) {
    try {
      var prods = prodsOf(T), allow = {}, need = { japan: 0, maker: 0 }, sku = 0;
      var addW = function (s) { (NF(s).toLowerCase().match(/[a-z]{2,}/g) || []).forEach(function (w) { allow[w] = 1; allow[w.replace(/s$/, "")] = 1; }); };
      prods.concat([T]).forEach(function (t) { if (!t) return; addW(t.coEn); addW(t.itemEn); CAT_EN.forEach(function (c) { if (c[0].test(NF((t.cat || "") + " " + (t.item || "")))) c[1].forEach(function (w) { allow[w] = 1; }); }); });
      var s = " " + NF(txt) + " ";
      (MT || []).forEach(function (tk) { if (s.toUpperCase().indexOf(tk.toUpperCase()) >= 0) sku = 1; s = s.split(tk).join(" "); });
      prods.concat([T]).forEach(function (t) { if (!t) return; var sk = NF(t.sku || "").trim(); if (sk.length >= 3 && s.toUpperCase().indexOf(sk.toUpperCase()) >= 0) { sku = 1; s = s.replace(new RegExp(sk.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), " "); } [t.coEn, t.itemEn].forEach(function (n) { n = NF(n || "").trim(); if (n.length >= 3) s = s.split(n).join(" "); }); });
      var CC = coCountry(T), makerOk = MAKER_JA.test(NF((T && T.co) || "")) || !!(srcIntro(T) && MAKER_JA.test(srcIntro(T).txt));
      var left = [];
      (s.match(/[A-Za-z][A-Za-z'-]*|\d+(?:\.\d+)?/g) || []).forEach(function (w) {
        var lw = w.toLowerCase().replace(/'s$/, "");
        if (/^\d/.test(lw)) { left.push(w); return; }
        if (FUNC_W.test(lw) || allow[lw] || allow[lw.replace(/s$/, "")]) return;
        if (/-/.test(lw) && lw.split("-").filter(Boolean).every(function (q) { return FUNC_W.test(q) || allow[q] || allow[q.replace(/s$/, "")]; })) return;
        if (/^(?:japan|japanese)$/.test(lw)) { if (CC && CC.c === "Japan") { need.japan = 1; return; } left.push(w); return; }
        if (MAKER_EN.test(lw)) { if (makerOk) { need.maker = 1; return; } left.push(w); return; }
        left.push(w);
      });
      return { left: left, need: need, sku: sku };
    } catch (e) { err("resid", e); return null; }
  }
  V.residualWords = residualWords;
  /* 22.01.2：照合の引用を作る部品 */
  function SQ0(z) { try { return fn("dk3Squash") ? dk3Squash(z) : String(z).replace(/\s/g, ""); } catch (e) { return String(z); } }
  /* 値（「紙」）を含む、表でない根拠の行。土台は引用を「｜」と「|」で切り、各片が3字以上・合わせて6字以上・根拠の原文（空白と改行を除いたもの）にあることを見る。
     短い行は隣の行（表でない行）とつなぐ（空白と改行を除くとつながった原文の一部になる） */
  function evFor(blocks, ids, v, SQ) {
    SQ = SQ || SQ0;
    var vs = SQ(v); if (!vs) return null;
    for (var k = 0; k < ids.length; k++) {
      var id = ids[k], lines = String(blocks[id] || "").split("\n");
      for (var i = 0; i < lines.length; i++) {
        var ln = lines[i].trim();
        if (!ln || /[|｜]/.test(ln) || SQ(ln).indexOf(vs) < 0) continue;
        var cand = ln;
        if (SQ(cand).length < 6) { var nx = (lines[i + 1] || "").trim(), pv = (lines[i - 1] || "").trim(); if (nx && !/[|｜]/.test(nx)) cand = cand + " " + nx; else if (pv && !/[|｜]/.test(pv)) cand = pv + " " + cand; }
        if (SQ(cand).length < 6) continue;
        if (cand.length > 80) cand = cutAround(cand, function (q) { return SQ(q).indexOf(vs) >= 0 && SQ(q).length >= 6; });
        if (SQ(cand).indexOf(vs) < 0 || SQ(cand).length < 6) continue;
        return { id: id, ln: cand };
      }
    }
    return null;
  }
  V.evFor = evFor;
  var FREE_RE = /\b(?:fragrance|colou?r(?:ant|ing)?s?|preservatives?|alcohol|ethanol|parabens?|additives?|gluten|grains?|asbestos|latex|sulfates?|silicones?)[- ]free\b/i;
  var FREE_RE_G = new RegExp(FREE_RE.source, "gi");
  var CTA_RE = /^(?:Please\s+)?(?:Contact|Discuss|Request|Ask|Reach out|Get in touch|Let's|Let us|Send|Email|Talk|Explore|Start|Book|Schedule|Inquire|Enquire|Partner)\b/i;
  var CTA_WORDS = /\b(?:contact|discuss|request|ask|reach|out|get|touch|let's|let|send|email|talk|explore|start|book|schedule|inquire|enquire|partner|partnership|opportunit(?:y|ies)|distribution|importing|import|samples?|quotes?|quotations?|pricing|prices?|list|details?|information|terms|your|market|markets|needs|requirements|today|together|now|more|learn|next|steps?|options?|collaboration|plans?|volumes?|channels?)\b/gi;
  /* 用途・買い手の言葉 → 根拠（日本語）の言葉。用途の言葉が全部根拠にあるときだけ残す */
  var USE_DICT = [[/^motors?$/, /モーター|電動機/], [/^pumps?$/, /ポンプ/], [/^(?:conveyors?|conveying|conveyance)$/, /搬送|コンベア/], [/^fans?$/, /ファン|送風/], [/^compressors?$/, /コンプレッサー|圧縮機/], [/^(?:gearbox(?:es)?|gears?|reducers?)$/, /ギア|歯車|減速機/],
    [/^(?:rotating|rotary|rotation)$/, /回転/], [/^(?:industrial|industry)$/, /産業|工業/], [/^(?:automotive|cars?|vehicles?|automobiles?)$/, /自動車|乗用車|車/], [/^bicycles?$/, /自転車/], [/^appliances?$/, /家電/], [/^kitchens?$/, /キッチン|台所|厨房/],
    [/^restaurants?$/, /飲食店|レストラン/], [/^hotels?$/, /ホテル/], [/^(?:hospitals?|clinics?)$/, /病院|クリニック|医療機関/], [/^(?:schools?|kindergartens?|nurser(?:y|ies))$/, /学校|幼稚園|保育/], [/^(?:pets?|dogs?|cats?)$/, /ペット|犬|猫/],
    [/^salons?$/, /サロン/], [/^(?:retail|retailers?|stores?|shops?)$/, /小売|店舗|販売店|ショップ/], [/^supermarkets?$/, /スーパー/], [/^(?:pharmac(?:y|ies)|drugstores?)$/, /薬局|ドラッグストア/], [/^(?:machinery|machines?)$/, /機械|機器/], [/^equipment$/, /機器|装置|設備/]];
  var BUYER_W = /^(?:buyers?|customers?|users?|makers?|manufacturers?|oems?|components?|parts?|applications?|uses?|sourcing|procurement|teams?|distributors?|importers?|wholesalers?|brands?|companies|operators?|owners?|segments?|need|needs|for|and|or|the|a|an|of|in|to|with|who|that|requiring|seeking|looking)$/i;
  function useEv(txt, blocks, ids) {
    var words = (NF(txt).toLowerCase().match(/[a-z][a-z'-]*/g) || []).filter(function (w) { return !BUYER_W.test(w) && !FUNC_W.test(w); });
    if (!words.length) return null;
    var srcTxt = ids.map(function (id) { return String(blocks[id] || ""); }).join("\n");
    var jas = [];
    for (var i = 0; i < words.length; i++) {
      var d = USE_DICT.filter(function (e) { return e[0].test(words[i]); })[0];
      if (!d || !d[1].test(srcTxt)) return null;
      jas.push(d[1]);
    }
    var first = jas[0];
    for (var k = 0; k < ids.length; k++) {
      var lines = String(blocks[ids[k]] || "").split("\n");
      for (var j = 0; j < lines.length; j++) {
        var ln = lines[j].trim();
        if (!ln || /[|｜]/.test(ln) || !first.test(ln)) continue;
        var all = jas.every(function (re) { return re.test(ln); });
        if (!all) continue;
        var m = ln.match(first), cand = ln.length > 80 ? ln.slice(Math.max(0, m.index - 20), Math.max(0, m.index - 20) + 70) : ln;
        if (SQ0(cand).length >= 6) return { id: ids[k], ln: cand };
      }
    }
    return null;
  }
  V.useEv = useEv;
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
  var FC_HINT = "【アプリからの補足】①型番・品番（例：6204ZZ・FP-201）の数字は数値の主張ではない（根拠は商品ブロックの「品番」「商品名」の行）。②HSコードの主張は、商品ブロックの「HSコード：」の行が根拠。③主張の［ ］のブロック番号は書き手の目安で、根拠はその商品・会社・取り込んだ資料のほかのブロックにあってもよい（blk には実際に引用したブロックを書く）。" +
    "④商品ブロック（P）の商品は、会社ブロック（C1）の会社が海外に販売する自社の商品（P の「販売する会社」の行）。「<会社> supplies / offers <商品>」「Contact <会社> about <品番>」は C1 と P の組み合わせが根拠で ok。⑤会社の所在国・事業内容・商品の用途は、C1 の「会社の所在国」「事業内容」の行と、取り込んだ資料（S）の「会社の紹介」「商品の説明」の文も根拠。⑥「registered」「listed」は言い回しの違いで、事実そのものが根拠にあれば ok。\n";
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
        /* ③' 22.01.1（v2-7・v1 N6）：会社と商品の関係だけの文（「Contact Kakuu Wood Toys Co., Ltd. regarding item WT-PZ5.」「Japanese Bearing Supplier」「Japanese miso producer」）。
           社名・商品名・品番・区分・所在国（会社）・つなぎの言葉を除いて、言葉が何も残らなければ、会社の段と商品の段を合わせた根拠で残す */
        if (x.ok === false && !x.v101 && (aboutCo || /\b(?:supplier|supplies|maker|producer|manufacturer|company|exporter)\b/i.test(txt)) && !SUP_RE.test(txt) && !hitTopic(txt, UT)) {
          var rs = residualWords(txt, T, MT);
          if (rs && !rs.left.length) {
            var cA = lineWith(F.blocks, allIds.filter(function (id) { return /^P\d+$/.test(id); }), function (z) { return /^販売する会社[:：]/.test(z); }) || lineWith(F.blocks, ["C1"], function (z) { return /^(?:英文社名|会社名)[:：]/.test(z); });
            var pA = lineWith(F.blocks, [ref || "P1"], function (z) { return /^(?:品番|商品名|英文商品名)[:：]/.test(z) && (!rs.sku || z.indexOf("品番") === 0); }) || lineWith(F.blocks, [ref || "P1"], function (z) { return /^(?:商品名|英文商品名)[:：]/.test(z); });
            var xs = [cA, pA];
            if (rs.need.japan) xs.push(lineWith(F.blocks, ["C1"], function (z) { return /^会社の所在国[:：]/.test(z); }));
            if (rs.need.maker) xs.push(lineWith(F.blocks, allIds, function (z) { return /会社の紹介|事業内容|^会社名[:：]/.test(z) && MAKER_JA.test(z); }));
            if (xs.every(Boolean)) { x.whyAI = x.why; x.okAI = false; x.ok = true; x.blk = xs.map(function (z) { return z.id; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).join(","); x.ev = xs.map(function (z) { return z.ln; }).join("｜"); x.why = ""; ch++; cnt("relRescue"); lg({ k: "relRescue", txt: txt.slice(0, 60), ev: x.ev.slice(0, 90), whyAI: String(x.whyAI || "").slice(0, 40) }); }
          }
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
        /* ②'' 22.01.1：原産国が登録済みの「The country of origin is Japan.」が、引用「産地：日本」（5字）で「根拠の引用が短すぎる」になる → 原産国の行を引用に */
        if (x.ok === true && /\b(?:country of origin|origin|made in|manufactured in|produced in)\b/i.test(txt) && String(x.ev || "").replace(/\s/g, "").length < 8) {
          var O9 = v101origin(T);
          if (O9.known && O9.country && new RegExp("\\b(?:" + O9.country + (O9.country === "Japan" ? "|Japanese" : "") + ")\\b", "i").test(txt)) {
            var ol = lineWith(F.blocks, ids, function (z) { return /^原産国・製造国（/.test(z); });
            if (ol) { x.blk = ol.id; x.ev = ol.ln; ch++; cnt("originEv"); }
          }
        }
        /* ②''' 22.01.1・22.01.2（v2-7・w1-5・w2-7）：引用が短い（「紙」「ブナ材」）・表の行の「|」で切れて短くなる（土台は「｜」と「|」の両方で切る）
           → 同じ値を含む、表でない根拠の行（📎の仕様書「容器：PET／トリガー：PP／ラベル：紙」など）を引用に。短ければ隣の行も含める */
        if (x.ok === true && x.ev && String(x.blk || "").trim() && String(x.blk).trim() !== "-") {
          var SQ = function (z) { try { return fn("dk3Squash") ? dk3Squash(z) : String(z).replace(/\s/g, ""); } catch (e) { return String(z); } };
          var evs = String(x.ev).split(/[｜|]/).map(function (z) { return z.trim(); }).filter(function (z) { return SQ(z); });
          var needN = numsOf(txt, "en").length ? 4 : 6;
          var shortQ = evs.length && (evs.some(function (z) { return SQ(z).length < 3; }) || evs.map(SQ).join("").length < needN);
          if (shortQ) {
            var vals = evs.map(function (z) { return z.replace(/^#\d+\s*/, "").trim(); }).filter(function (z) { return SQ(z).length >= 1 && !/^[—\-–]$/.test(z); });
            var outE = [], outB = [], okE = vals.length > 0;
            vals.forEach(function (v) { if (!okE) return; var e1 = evFor(F.blocks, ids, v, SQ); if (!e1) { okE = false; return; } if (outE.indexOf(e1.ln) < 0) outE.push(e1.ln); if (outB.indexOf(e1.id) < 0) outB.push(e1.id); });
            if (okE && outE.length && outE.map(SQ).join("").length >= needN) { x.ev = outE.join("｜"); x.blk = outB.join(","); ch++; cnt("shortEv"); lg({ k: "shortEv", txt: txt.slice(0, 50), ev: x.ev.slice(0, 80) }); }
          }
        }
        /* ⑤ 22.01.2（w1-1）：22.00.1 の層の「入力と食い違う（無香料・無着色）」は、「fragrance-free」の「with fragrance」を香料入りと読んだもの。
              「〜-free」を外しても食い違いが無ければ、AI の答え（ok）に戻す */
        if (x.ok === false && /^入力と食い違う（/.test(String(x.why || "")) && FREE_RE.test(txt)) {
          try {
            var V100 = window.V100FACT;
            if (V100 && typeof V100.contraOf === "function" && typeof V100.factsOf === "function") {
              var neut = txt.replace(FREE_RE_G, " free ");
              if (!V100.contraOf(neut, V100.factsOf(T)) && (x.blk || x.ev)) { x.whyV100 = x.why; x.ok = true; x.why = ""; ch++; cnt("freeUndo"); lg({ k: "freeUndo", txt: txt.slice(0, 60) }); }
            }
          } catch (e) { err("freeundo", e); }
        }
        /* ⑥ 22.01.2（w1-5）：事実を言わない呼びかけ（「Contact us to discuss export terms for your market.」）を土台が「事実を含むのに根拠の引用が無い」で外す
              → 会社名の行を引用に（呼びかけの言葉・つなぎの言葉だけのときだけ） */
        if (x.ok === true && (!String(x.blk || "").trim() || String(x.blk).trim() === "-") && CTA_RE.test(txt) && !/\d/.test(txt.replace(/\b[A-Z]{1,6}[-‐]?[A-Z0-9-]*\d[A-Z0-9-]*\b/g, " ")) && !SUP_RE.test(txt) && !hitTopic(txt, UT)) {
          var rc = residualWords(txt.replace(CTA_WORDS, " "), T, MT);
          if (rc && !rc.left.length) {
            var cc1 = lineWith(F.blocks, ["C1"], function (z) { return /^(?:英文社名|会社名)[:：]/.test(z) && SQ0(z).length >= 6; }) || lineWith(F.blocks, allIds.filter(function (id) { return /^P\d+$/.test(id); }), function (z) { return /^販売する会社[:：]/.test(z); });
            if (cc1) { x.blk = cc1.id; x.ev = cc1.ln; ch++; cnt("ctaEv"); lg({ k: "ctaEv", txt: txt.slice(0, 60) }); }
          }
        }
        /* ⑦ 22.01.2（w1-5 C）：買い手・用途の項目（「Motor / Pump / Conveyor Component Buyers」）を「購入者の記載なし」で外す
              → 買い手の言葉を除いた用途の言葉が、全部📎の商品の説明・登録に（カタカナ・漢字の用途の言葉として）あるときだけ、その行を引用にして残す */
        if (x.ok === false && !x.v101 && /購入者|買い手|顧客|バイヤー|対象|用途|使い道|使用先|buyer|customer|application/i.test(String(x.why || ""))) {
          try {
            var ul = useEv(txt, F.blocks, allIds);
            if (ul && x.ok === false && !SUP_RE.test(txt) && !hitTopic(txt, UT)) { x.whyAI = x.why; x.okAI = false; x.ok = true; x.blk = ul.id; x.ev = ul.ln; x.why = ""; ch++; cnt("useRescue"); lg({ k: "useRescue", txt: txt.slice(0, 60), ev: ul.ln.slice(0, 60), whyAI: String(x.whyAI || "").slice(0, 30) }); }
          } catch (e) { err("use", e); }
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
  /* 22.01.1（v2-7・N17 の残り）：「The registered target age is…」「Registered product code: …」の登録の読み上げ調を、照合の前に普通の言い方に。
     照合の AI はこの言い方を「登録済みとの記載なし」として外していた（事実そのものは根拠にある） */
  var REG_NOUN = "(?:product|model|item|part|parts|ingredient|ingredients|country|shelf|trade|payment|target|material|materials|formulation|HS|specifications?|components?|table|classification|lead|origin|port|age|use|uses|warranty|storage|composition|formula|INCI|label|labels|package|packaging|weight|dimensions?|size|price|prices|MOQ|quantity|details|data|information|code|number|strengths?|features?|category|certifications?|values?|rows?|list|unit|units|item code|range|name)";
  var REG_RE1 = new RegExp("\\b(The|the|Its|its|This|this|Each|each|All|all)\\s+registered\\s+(?=" + REG_NOUN + "\\b)", "g");
  var REG_RE2 = new RegExp("(^|[.!?]\\s+|[—:–]\\s*|\\*\\*)Registered\\s+(?=" + REG_NOUN + "\\b)([a-zA-Z])", "gi");
  var REG_RE3 = new RegExp("\\bregistered\\s+(?=" + REG_NOUN + "\\b)", "gi");
  /* 22.01.2（w1-1）：「with fragrance-free」を 22.00.1 の層の「with fragrance（香料入り）」の点検が「入力と食い違う」と読む → 「featuring fragrance-free」に（意味は同じ） */
  var FREE_W = "(?:added\\s+)?(?:fragrance|colou?r(?:ant|ing)?s?|preservatives?|alcohol|ethanol|parabens?|additives?|gluten|grains?|asbestos|latex|sulfates?|silicones?)[- ]free\\b";
  var SOFT_FREE = new RegExp("\\b(With|with|Contains|contains|Contain|contain)\\s+(?=" + FREE_W + ")", "g");
  function softFree(s) { return String(s).replace(SOFT_FREE, function (m0, w) { return (/^[A-Z]/.test(w) ? "Featuring" : "featuring") + " "; }); }
  V.softFree = softFree;
  var CAP = function (x) { x = String(x || ""); return x.charAt(0).toUpperCase() + x.slice(1); };
  function deReg(s) {
    var o = String(s == null ? "" : s);
    if (SOFT_FREE.test(o)) { SOFT_FREE.lastIndex = 0; o = softFree(o); }
    SOFT_FREE.lastIndex = 0;
    if (!/registered|registration|stated|specified|classified|categori[sz]ed|designated|documented|identified|own\s|listed/i.test(o)) return o;
    o = o.replace(REG_RE1, "$1 ").replace(REG_RE2, function (m0, a, c) { return a + c.toUpperCase(); }).replace(REG_RE3, "");
    o = o.replace(/\s+(?:is|are)\s+(?:registered|listed)\s+for\s+(?:the|this)\s+product(?=\s*(?:[.!?]|$))/g, "");
    o = o.replace(/\b([Cc])ompany-registered\s+/g, "").replace(/\b(its|their|our|Its|Their|Our)\s+registered\s+(?=(?:[a-z-]+\s+){0,2}(?:products?|items?|goods)\b)/g, "$1 ");
    o = o.replace(/(^|[.!?]\s+|[—:–]\s*)Registered\s+(?:as|under)\s+(?=(?:a|an|the|product|item|model|part|HS)\b)([a-zA-Z])/g, function (m0, a, c) { return a + c.toUpperCase(); });
    o = o.replace(/\b(?:as registered|per (?:the )?registration)\b\s*/gi, "");
    /* 22.01.2（w1-7・w2-6）：登録を読み上げる言い方 */
    o = o.replace(/\b(is|are)\s+(?:explicitly\s+|clearly\s+|officially\s+)?(?:specified|stated|listed|documented|registered|identified|described|indicated)\s+as\s+(?!having\b|being\b)/gi, "$1 ");
    o = o.replace(/(^|[.!?]\s+)(?:The|This)\s+product\s+is\s+(?:classified|categori[sz]ed)\s+(?:as|under)\s+([^.!?]+)([.!?]|$)/g, function (m0, a, b, c) { return a + "Category: " + CAP(b.trim()) + c; });
    o = o.replace(/\b(the\s+|The\s+)?(?:product\s+)?registration\s+and\s+(?:the\s+)?specification\s+(?:document|sheet|data)s?\s+(?:identify|identifies|show|shows|list|lists|state|states|indicate|indicates)\b/g, function (m0, a) { return (a && /^T/.test(a) ? "The" : (a ? "the" : "The")) + " specification sheet lists"; });
    o = o.replace(/(^|[.!?]\s+)(?:The\s+)?(?:product\s+)?registration\s+(?:data|record|information|details)\s+(?:shows?|states?|lists?|indicates?)\s+(?:that\s+)?([a-z])/gi, function (m0, a, c) { return a + c.toUpperCase(); });
    o = o.replace(/\b(The|the)\s+(?:stated|specified|documented|declared)\s+(?=(?:origin|country|countries|shelf|materials?|ingredients?|composition|uses?|age|target|manufacturing)\b)/g, "$1 ");
    o = o.replace(/(?<!\b(?:on|of|in)\s)\b(its|their|our|Its|Their|Our)\s+own\s+(?=[A-Za-z])/g, "$1 ");
    /* 22.01.2（w2-7）：「Compatible vehicle models … are not registered.」（アプリの中の言葉）→「…: to be confirmed.」（買い手向けの言い方・断定しない） */
    o = o.replace(/(^|[.!?]\s+)([A-Z][^.!?]{3,180}?)\s+(?:is|are)\s+not\s+(?:yet\s+)?(?:registered|specified|provided|entered|listed)(?:\s+(?:yet|in the registration|in the product information))?\s*([.!?]|$)/g, function (m0, a, b, c) { return a + b.replace(/[,;:]\s*$/, "") + ": to be confirmed" + (c || "."); });
    o = o.replace(/\s{2,}/g, " ").replace(/\s+([,.;:])/g, "$1");
    return o;
  }
  V.deReg = deReg;
  function deRegObj(o, n) {
    if (o == null) return o;
    if (typeof o === "string") { var x = deReg(o); if (x !== o) n.c++; return x; }
    if (Array.isArray(o)) return o.map(function (y) { return deRegObj(y, n); });
    if (typeof o === "object") { Object.keys(o).forEach(function (k) { if (SKIPK.test(k)) return; o[k] = deRegObj(o[k], n); }); return o; }
    return o;
  }
  function fixWriter(r) {
    var T = curT(), L = unkTopics(T);
    var t0 = String((r && r.txt) || ""), j = null;
    try { j = (typeof xParseJson === "function") ? xParseJson(t0) : JSON.parse(t0.replace(/```json|```/g, "").match(/\{[\s\S]*\}/)[0]); } catch (e) { return r; }
    if (!j || typeof j !== "object") return r;
    var nReg = { c: 0 };
    try { deRegObj(j, nReg); } catch (e) { err("dereg", e); }
    /* 22.01.2（w2-1 の資料側）：登録の「ささみ」を書き手が chicken breast（胸肉）と訳すと、照合が「鶏むね肉の記載なし」で外す → 照合の前に登録の言葉にそろえる */
    try { var tf = termFixer(T); if (tf) { var nT = { c: 0 }; (function walk(o) { if (!o || typeof o !== "object") return; Object.keys(o).forEach(function (k) { if (SKIPK.test(k)) return; var v = o[k]; if (typeof v === "string") { var y = tf(v); if (y !== v) { o[k] = y; nT.c++; } } else walk(v); }); })(j); if (nT.c) { nReg.c += nT.c; cnt("termFix", nT.c); } } } catch (e) { err("termw", e); }
    if (nReg.c) { cnt("deReg", nReg.c); lg({ k: "deReg", n: nReg.c }); }
    var rec = [];
    if (L.length) cleanObj(j, L, "", rec);
    if (!rec.length) return nReg.c ? Object.assign({}, r, { txt: JSON.stringify(j) }) : r;
    V.pend = V.pend.concat(rec.map(function (x) { return { path: x.path, txt: x.txt, why: x.why, v101: 1 }; })).slice(-80);
    cnt("writerFix", rec.length); lg({ k: "writerFix", n: rec.length, ex: rec.slice(0, 6).map(function (x) { return x.txt.slice(0, 50) + " → " + String(x.to).slice(0, 40); }) });
    return Object.assign({}, r, { txt: JSON.stringify(j) });
  }
  V.fixWriter = fixWriter;
  /* 22.01.2（w1-7・w2-4・w2-6）：書き手の AI への頼みに言い方の決まりを足す（同じ呼び出しの中・AI の呼び出しは増えない）。
     頼みの文だけに頼らず、答えはこのあと必ず deReg・照合の突き合わせ・表紙のバッジの組み直しを通す */
  var PLAN_HINT = "\n■言い方（アプリからの補足・必ず守る）\n" +
    "- 「registered」「stated」「specified as」「classified as」「listed as」「registration shows」など、登録を読み上げる言い方をしない。事実をそのまま書く（× The registered target age is 3 years and up → ○ For ages 3 and up）。\n" +
    "- about（会社の紹介）は「supplies its own … product for export」のような決まり文句でなく、根拠にある事業内容・会社の紹介を書く。無ければ短くてよい。\n" +
    "- hero.badges は、P の「■強み」から選ぶ（HSコード・賞味期限・港・取引条件・所在地・「Japan-based company」は badges に使わない。同じ文言を2回使わない）。\n" +
    "- why（売れる理由）は、P の「■強み」を1つずつ、バイヤーの利益として書く。同じ強みを2回書かない。\n" +
    "- 「無香料」などは「fragrance-free formula」のように書く（「with fragrance-free」と書かない）。\n" +
    "- 原産国が未登録のときは、商品に「from Japan」「Japanese ○○」と書かない（会社の所在地は別のこと）。\n";
  if (fn("dk3PlanPrompt")) {
    var oPP = window.dk3PlanPrompt;
    window.dk3PlanPrompt = function (lang, C, nProd) {
      var q = oPP.apply(this, arguments);
      try { q = String(q); if (lang && lang !== "ja" && q.indexOf("■言い方（アプリからの補足") < 0) { var i = q.indexOf("=== 根拠"); q = i >= 0 ? q.slice(0, i) + PLAN_HINT + q.slice(i) : q + PLAN_HINT; cnt("planHint"); } } catch (e) { err("pp", e); }
      return q;
    };
  }
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
    /* 22.01.1（v2-10）：「(asbestos-free certificate: to be confirmed)」は資料の中で1回だけ。見出しには付けない。
       付ける所の順：表（仕様・成分のページ）→ 本文の最初の文 → （本文が無ければ）見出し。すでに付いていれば増やさない */
    var l2q = lang2(deck.lang), qOf0 = function (tp) { return (tp.qtxt && (tp.qtxt[l2q] || tp.qtxt.en)) || tb; };
    var paraTxt = function (p) { return (p.r || []).filter(function (r) { return r && typeof r.t === "string"; }).map(function (r) { return r.t; }).join(""); };
    var isHead = function (p) { return (p.r || []).some(function (r) { return r && +r.sz >= 17; }); };
    var qualAt = {};
    LN.filter(function (x) { return x.qual; }).forEach(function (tq) {
      var q = qOf0(tq), cands = [], had = [];
      deck.slides.forEach(function (S) { (S.els || []).forEach(function (e) { if (!e || e.k !== "text" || !Array.isArray(e.ps) || e.name === "foot" || e.name === "pno") return; e.ps.forEach(function (p) { var t = paraTxt(p); if (!t) return; var c = { p: p, head: isHead(p), tbl: /^(?:specs|ingr|pack)/.test(String(S.kind || "")) && t.length <= 80 }; if (t.indexOf(q) >= 0) had.push(c); if (tq.qual.test(t)) cands.push(c); }); }); });
      var pick = had.length ? (had.filter(function (c) { return !c.head; })[0] || had[0]) : (cands.filter(function (c) { return c.tbl && !c.head; })[0] || cands.filter(function (c) { return !c.head; })[0] || cands[0]);
      qualAt[tq.k] = pick ? pick.p : "none";
    });
    var curP = null, qualUsed = {};
    var mayQual = function (tq) { return !qualAt[tq.k] || qualAt[tq.k] === curP; };
    /* 文から付いている「要確認」の注記を外す（見出し・2回目以降） */
    var unQual = function (s) { var o = String(s); LN.forEach(function (tq) { if (!tq.qual) return; var q = qOf0(tq); o = o.split(" (" + q + ")").join("").split("(" + q + ")").join(""); }); return o; };
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
        if (tq && tq.qual && !mayQual(tq)) { var uq = unQual(o); if (uq !== o) { o = uq; hitAny = true; } }
        else if (tq && !TBC_RE.test(o)) { o = o.replace(/\s*([.!?。])?\s*$/, function (m0, pu) { return " (" + qOf(tq) + ")" + (pu || ""); }); hitAny = true; }
      } else {
        var parts = sentsOf(o), keep = [];
        parts.forEach(function (s) {
          var tp2 = hitTopic(s, LN);
          if (tp2) { if (tp2.strip) { var s3 = tp2.strip(s); if (s3 && s3.split(/\s+/).length >= 3 && !hitTopic(s3, [tp2])) { s = s3; } else { hitAny = true; return; } } else { hitAny = true; return; } hitAny = true; }
          var tq2 = LN.filter(function (x) { return x.qual && x.qual.test(s); })[0];
          if (tq2 && !mayQual(tq2)) { var uq2 = unQual(s); if (uq2 !== s) { s = uq2; hitAny = true; } }
          else if (tq2 && !TBC_RE.test(s) && !qualUsed[tq2.k]) { s = s.replace(/\s*([.!?。])?\s*$/, function (m0, pu) { return " (" + qOf(tq2) + ")" + (pu || ""); }); hitAny = true; qualUsed[tq2.k] = 1; }
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
            curP = p; qualUsed = {};
          var x = fixOne(full);
          curP = null;
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

  /* ══════════════════════════════════════════════════════════════════════════════════════════════
     22.01.1（22.01 の公開後の検証 v1・v2 の指摘）
     ══════════════════════════════════════════════════════════════════════════════════════════════ */

  /* ── ① 📎の資料（ヒアリングで渡した 商品紹介.txt・仕様書・価格表）の文字を、商品の「取り込んだ資料」として残す ──
     原因：ヒアリングの📎（fillAttach）は、資料を読み取って項目（mergeTen）に入れるだけで、資料の文字（buildTenant が作る sources）を
           商品に残していなかった（ファイルから登録する経路では残る）。照合の根拠は「会社情報（登録）／商品の登録」だけになり、
           📎の「会社の紹介：新潟県で米発酵の化粧品を開発・製造しているメーカー」「モーター・ポンプ・搬送機の回転部に使われます」が
           根拠に無く、「日本企業との記載なし」「用途の記載なし」で外れ、会社紹介のページが「Business: Cosmetics」だけになった（v1 N6・N7）。
     直し：mergeTen（資料の読み取り結果を商品に入れる所）で、読み取り結果に資料の原文（sources）があれば、同じ商品の「取り込んだ資料」に足す
           （同じ名前・同じ長さは1つ。別の商品の資料と判定された＝食い違いの確かめに回るときは足さない）。AI は呼ばない。 */
  function addSources(t, x) {
    var n = 0;
    try {
      if (!t || !x || t === x || typeof t !== "object" || !Array.isArray(x.sources) || !x.sources.length) return 0;
      var L = (typeof TENS !== "undefined" && Array.isArray(TENS)) ? TENS : [];
      if (!(L.indexOf(t) >= 0 || (typeof TEN !== "undefined" && t === TEN))) return 0;
      try { if (typeof v56upldMismatch === "function" && v56upldMismatch(t, x)) return 0; } catch (e) { /* 無視 */ }
      t.sources = Array.isArray(t.sources) ? t.sources : [];
      x.sources.forEach(function (s) {
        if (!s || !s.txt || !String(s.txt).trim()) return;
        var key = String(s.name || "") + "|" + String(s.txt).length;
        if (t.sources.some(function (o) { return o && (String(o.name || "") + "|" + String(o.txt || "").length) === key; })) return;
        var e = Object.assign({}, s); e.id = e.id || ("S" + Date.now().toString(36) + n); e.on = e.on === false ? false : 1; e.v101 = 1;
        t.sources.push(e); n++;
      });
    } catch (e) { err("addsrc", e); }
    if (n) { cnt("srcKeep", n); lg({ k: "srcKeep", n: n }); }
    return n;
  }
  V.addSources = addSources;
  if (fn("mergeTen")) {
    var oMT = window.mergeTen;
    window.mergeTen = function (t, x) {
      var r = oMT.apply(this, arguments);
      try { if (addSources(t, x)) { try { if (typeof saveTen === "function") saveTen(); } catch (e) { /* 無視 */ } } } catch (e) { err("mt", e); }
      return r;
    };
  }

  /* ── ② 訳すデータ（dk3DataSrc）に、登録の強み・📎の会社の紹介を足し、日本側の該非判定書を国ごとの輸入の書類から外す ──
     ・登録の強みは「売れる理由」のページの元（入力が正）。訳は土台の訳（dk3DataTr・数字・単位・語の点検つき）で付く＝AI の呼び出しは増えない
     ・会社情報の事業内容が未登録で、📎の資料に「会社の紹介：…」があれば、それを事業内容に（v1 N7）
     ・「該非判定書」は日本から出すときの輸出側の書類。国ごとの「輸入の書類」に並べない（ページの小見出しで輸出側として分けて書く・v2-10） */
  var XC_RE = /該非判定|該非|輸出令別表/;
  if (fn("dk3DataSrc")) {
    var oDSf = window.dk3DataSrc;
    window.dk3DataSrc = function (T) {
      var d = oDSf.apply(this, arguments);
      try {
        var TT = T || curT();
        if (!d || !TT) return d;
        var ps = prodsOf(TT);
        (Array.isArray(d.prods) ? d.prods : []).forEach(function (q, i) { var t = ps[i]; if (!q || !t) return; var st = strengthsJa(t).slice(0, 4).map(function (s) { return s[0] + (s[1] ? "：" + s[1] : ""); }); if (st.length) q.v101str = st; else delete q.v101str; });
        if (d.co && typeof d.co === "object" && !NF(d.co.biz || "").trim()) { var it = srcIntro(TT); if (it) { d.co.biz = it.txt.replace(/(?:です|でございます)?。?\s*$/, ""); d.co.v101biz = 1; } }
        var xc = 0;
        (Array.isArray(d.markets) ? d.markets : []).forEach(function (m) { if (!m || !Array.isArray(m.docs)) return; var n0 = m.docs.length; m.docs = m.docs.filter(function (z) { return !XC_RE.test(String(z)); }); if (m.docs.length !== n0) xc = 1; });
        if (xc) d.v101xc = 1;
        /* 22.01.2（w1-4）：規制の画面の書類の判断の表で「条件つき」の行（buyer の USEPA・EU BPR・台湾の環境用薬・ペットフードの行など）を、
           市場のページの国ごとの書類に「（該当する場合・要確認）」の形で出す（断定しない）。必須の行は 22.00.1 の層（v100 flow）がもう足している */
        try {
          var VF = window.V100FLOW;
          if (VF && typeof VF.sepReq === "function" && (!T || T === (typeof TEN !== "undefined" ? TEN : null))) {
            (Array.isArray(d.markets) ? d.markets : []).forEach(function (m) {
              if (!m || !m.c) return;
              var rows = (VF.sepReq(m.c) || []).filter(function (x) { return x && x.lv === "conditional" && x.ja && !XC_RE.test(String(x.ja)); });
              if (!rows.length) return;
              var docs = Array.isArray(m.docs) ? m.docs.slice() : [];
              rows.forEach(function (x) {
                var ja = String(x.ja).replace(/（[^（）]*）$/, "").trim() + "（該当する場合・要確認）";
                if (docs.some(function (y) { return String(y).indexOf(String(x.ja).slice(0, 8)) >= 0; })) return;
                docs.push(ja);
                try { if (typeof VF.addTerm === "function" && x.en) VF.addTerm(ja, String(x.en).replace(/\s*\([^()]*\)\s*$/, "").trim() + " (if applicable; to be confirmed)"); } catch (e) { /* 訳は土台の訳に任せる */ }
              });
              m.docs = docs.slice(0, 8);
              m.v101cond = rows.map(function (x) { return x.k; });
            });
          }
        } catch (e) { err("cond", e); }
      } catch (e) { err("ds", e); }
      return d;
    };
  }

  /* ── ③ 「売れる理由」のページ：登録した強みは根拠そのもの。照合で外れても、登録の強み（の訳）で組み立て直す（v1 N2・v2-7・611 の仲間） ──
     原因：このページは書き手の AI の why（3件）だけで作られ、照合で外れて2件未満になるとページごと消える（v85 の決まり）。
           A は「アレルゲン表示」と「FOB」、G は「初期不良の交換」と「FOB・T/T・港」だけ、E・F はページなし。登録した強み（有機JAS・木桶で天然醸造・
           保存料不使用）は、どのページにも根拠として扱われていなかった。
     直し（AI は呼ばない）：資料の組み立て（dk3Model）で、登録の強みを1つずつ見て、
           ・AI の理由の中に同じ強みを言う項目があればそれを使う（強みの数字が抜けていれば、訳の数字の文を補う）
           ・無ければ登録の強みの訳（土台の訳＝数字・単位の点検つき）で項目を作る（訳が日本語のまま・点検で落ちたものは使わない）
           ・「不明」と答えた事柄・未登録の原産地を言い切る強みは入れない（外した理由は一覧に出る）
           ・強みの数字の試験の条件に「わからない」と答えていれば「(test conditions to be confirmed)」を付ける（C の 0.8 mm/s）
           ・残りは AI の理由（取引条件だけのものは後回し）で3件まで。2件に届かなければ、いままでどおり（ページなし＋理由の知らせ） */
  var JP_CH = /[ぁ-ゖァ-ヺ一-龯]/;
  /* 訳されていない（日本語のまま）か：かながある・原文と同じ・中国語以外で漢字がある */
  function untr(ja, en, lang) { if (typeof en !== "string" || !en.trim()) return true; if (ja && NF(en).trim() === NF(ja).trim()) return true; if (/[ぁ-ゖァ-ヺ]/.test(en)) return true; return !/^zh/.test(String(lang || "")) && JP_CH.test(en); }
  var STOP_EN = /^(?:with|from|that|this|than|have|has|for|and|the|are|its|our|your|into|only|using|uses|used|make|each|more|less|very|also|their|which|while|other|such|will|can|product|products|item)$/;
  function cwords(s) { return (NF(s).toLowerCase().match(/[a-z][a-z-]{2,}/g) || []).filter(function (w) { return !STOP_EN.test(w); }).map(function (w) { return w.slice(0, 5); }); }
  function covers(it, en) {
    var A = cwords(en).filter(function (v, i, a) { return a.indexOf(v) === i; }); if (!A.length) return false;
    var B = cwords(String(it.t || "") + " " + String(it.d || ""));
    var h = A.filter(function (w) { return B.indexOf(w) >= 0; }).length;
    return h >= Math.min(2, A.length) && h / A.length >= 0.5;
  }
  function numsJa(s) { return NF(s).match(/\d+(?:\.\d+)?/g) || []; }
  function hasNum(txt, n) { return new RegExp("(^|[^0-9.])" + String(n).replace(".", "\\.") + "(?![0-9])").test(NF(txt)); }
  var TESTQ = { en: "test conditions to be confirmed", zh: "测试条件待确认", es: "condiciones de ensayo por confirmar" };
  var LOGI = /\b(?:FOB|CIF|CFR|EXW|DDP|DAP|incoterms?|T\/T|payment|advance|port|shipment|shipping|ships?|lead time|HS code|customs|clearance|trade terms?|transaction terms?|export (?:arrangement|terms|route))\b|離岸|付款|港口|装运|FOB/i;
  function splitTD(en) {
    var s = NF(en).trim().replace(/[。.]\s*$/, "");
    var m = s.match(/^(.{3,60}?)\s*[(（]([^)）]{3,})[)）]\s*$/); if (m) return { t: m[1].trim(), d: m[2].trim().charAt(0).toUpperCase() + m[2].trim().slice(1) };
    m = s.match(/^([^:：]{3,48})[:：]\s*(.{3,})$/); if (m) return { t: m[1].trim(), d: m[2].trim() };
    return { t: s, d: "" };
  }
  function icOf(ja) {
    var c = /認証|JAS|ISO|試験|検査|証明/.test(ja) ? "badge-check" : /有機|オーガニック|天然|自然|植物|木|ブナ/.test(ja) ? "leaf" : /寿命|耐久|長持ち/.test(ja) ? "clock" : /実績|採用|導入/.test(ja) ? "factory" : "circle-check";
    try { return fn("dk3IcN") ? dk3IcN(c, "circle-check") : c; } catch (e) { return "circle-check"; }
  }
  function supportOf(plan, en, usedSup) {
    try {
      var A = cwords(en).filter(function (v, i, a) { return a.indexOf(v) === i; }), best = null, bs = 0;
      usedSup = usedSup || {};
      (fn("dk3Leaves") ? dk3Leaves(plan) : []).forEach(function (c) {
        if (!c || !c.txt || /^(?:why|hero|contact|flow|targets|about)\./.test(String(c.path || "")) || !/\.(?:d|desc|sub|lead|note)$/.test(String(c.path || ""))) return;
        var tx = String(c.txt); if (tx.length < 20 || tx.length > 140 || usedSup[tx]) return;
        var B = cwords(tx), h = A.filter(function (w) { return B.indexOf(w) >= 0; }).length;
        var extra = B.filter(function (w, i, a) { return a.indexOf(w) === i && A.indexOf(w) < 0; }).length;
        if (extra < 2) return; /* 見出しの言い直しだけの文は使わない */
        if (h > bs && h >= Math.min(2, A.length) && h / A.length >= 0.5) { bs = h; best = tx; }
      });
      return best;
    } catch (e) { return null; }
  }
  /* 22.01.2（out の申し送り）：強みの訳の形を確かめる。空の括弧「()」は外し、語の無いもの（「3」）・括弧の数が合わないものは使わない（表紙のバッジ・売れる理由の両方） */
  function cleanTr(s) { return NF(s).replace(/\s*[(（]\s*[)）]/g, "").replace(/\s{2,}/g, " ").replace(/[\s,;:・、]+$/, "").trim(); }
  function goodTr(s) {
    s = cleanTr(s);
    if (s.length < 4) return false;
    if (!(s.match(/[A-Za-zÀ-ɏ]{3,}|[一-鿿]{2,}/g) || []).length) return false;
    return (s.match(/[(（]/g) || []).length === (s.match(/[)）]/g) || []).length;
  }
  V.cleanTr = cleanTr; V.goodTr = goodTr;
  function rebuildWhy(M, lang, plan, data, src, T) {
    if (!M || !M.v85) return null;
    var d0 = (data && data.prods && data.prods[0]) || {}, s0 = (src && src.prods && src.prods[0]) || {};
    var jas = Array.isArray(s0.v101str) ? s0.v101str : [], trs = Array.isArray(d0.v101str) ? d0.v101str : [];
    if (!jas.length) return null;
    var W0 = M.v85.plan || (plan && plan.why) || null;
    var ai = ((W0 && W0.items) || []).filter(Boolean).map(function (x) { return Object.assign({}, x); });
    var L = unkTopics(T), LN = L.filter(function (x) { return !x.origin; }), O = v101origin(T), U = unkList(T), l2 = lang2(lang);
    var used = {}, usedSup = {}, out = [], strEn = [], info = { n: jas.length, kept: 0, fromStr: 0, skip: [], noTr: 0, badges: [] };
    ai.forEach(function (it) { if (it && it.d) usedSup[String(it.d)] = 1; });
    jas.forEach(function (ja, i) {
      var en = trs[i];
      if (untr(ja, en, lang)) en = null;
      if (en) { en = cleanTr(en); if (!goodTr(en)) { info.bad = (info.bad || 0) + 1; en = null; } }
      if (en) { try { if (fn("dk3TrOk") && dk3TrOk(ja, en, lang)) en = null; } catch (e) { /* 無視 */ } }
      var tpJ = LN.filter(function (tp) { return tp.ja2 && !tp.qual && tp.ja2.test(ja); })[0] || (en ? (function () { var h = hitTopic(en, LN); return h && !h.qual ? h : null; })() : null);
      if (tpJ) { info.skip.push(ja + "｜" + tpJ.k); return; }
      if (!O.known && (/日本製|国産|国内(?:で)?(?:生産|製造)/.test(ja) || (en && originHits(en)))) { info.skip.push(ja + "｜origin"); return; }
      var nums = numsJa(ja), k = -1;
      if (en) { strEn.push(en); var spb = splitTD(en); var bc = [en.length <= 48 ? en : "", spb.t && spb.t.length <= 48 ? spb.t : ""].filter(function (z, ii, aa) { return z && goodTr(z) && aa.indexOf(z) === ii; }); if (bc.length) info.badges.push({ ic: icOf(ja), t: bc[0], alt: bc[1] || "" }); }
      if (en) ai.some(function (it, j) { if (!used[j] && covers(it, en)) { k = j; return true; } return false; });
      var item = null;
      if (k >= 0) {
        used[k] = 1; item = ai[k]; info.kept++;
        if (nums.length && en && !nums.every(function (n) { return hasNum(String(item.t || "") + " " + String(item.d || ""), n); })) { var sp0 = splitTD(en); item.d = sp0.d ? sp0.t + ": " + sp0.d : en; item.v101num = 1; }
      } else if (en) {
        var sp = splitTD(en);
        var sup = sp.d ? "" : (supportOf(plan, en, usedSup) || "");
        if (sup) usedSup[sup] = 1;
        item = { ic: icOf(ja), t: sp.t, d: sp.d || sup, src: "P1", v101: 1 };
        info.fromStr++;
      } else { info.noTr++; return; }
      if (nums.length && U.some(function (u) { return nums.some(function (n) { return hasNum(u.q, n); }); }) && !TBC_RE.test(String(item.d || ""))) item.d = (item.d ? String(item.d).replace(/[.。]\s*$/, "") + " " : "") + "(" + (TESTQ[l2] || TESTQ.en) + ")";
      out.push(item);
    });
    if (!out.length) return Object.assign(info, { done: 0 });
    /* 22.01.2（w2-6）：残りの AI の理由は、入れた強みと同じこと（F「Address Dust Concerns」＝Low Dust の繰り返し）なら入れない */
    var dupOf = function (it) { var tx = String(it.t || "") + " " + String(it.d || ""); return out.some(function (o) { var ot = String(o.t || "") + " " + String(o.d || ""); return covers(it, ot) || covers(o, tx); }) || strEn.some(function (e) { return covers(it, e); }); };
    ai.forEach(function (it, j) { if (out.length >= 3 || used[j]) return; if (LOGI.test(String(it.t || "") + " " + String(it.d || ""))) return; if (dupOf(it)) { used[j] = 1; info.dup = (info.dup || 0) + 1; return; } used[j] = 1; out.push(it); });
    ai.forEach(function (it, j) { if (out.length >= 2 || used[j]) return; if (dupOf(it)) return; used[j] = 1; out.push(it); });
    if (out.length < 2) return Object.assign(info, { done: 0 });
    var title = (W0 && W0.title && info.kept > 0 && !LOGI.test(W0.title)) ? W0.title : "";
    M.v85.plan = { title: title, items: out.slice(0, 3) };
    info.done = 1; info.items = M.v85.plan.items.map(function (x) { return String(x.t || "").slice(0, 40); });
    return info;
  }
  V.rebuildWhy = rebuildWhy; V.untr = untr;
  V.covers = covers; V.splitTD = splitTD;

  /* ── ④ 会社のページ「Who We Are」の事業内容：書き手の AI が短い区分（「Cosmetics」）だけを書いたとき、📎の会社の紹介（の訳）を使う（v1 N7） ── */
  function fixAbout(M, lang, data) {
    try {
      var c = (data && data.co) || {};
      if (!c.v101biz || !c.biz || untr("", String(c.biz), lang) || !M.co || !Array.isArray(M.co.facts)) return 0;
      var lab = fn("dk3Lb") ? dk3Lb(lang, "biz") : "Business";
      var row = M.co.facts.filter(function (r) { return r && (r.ic === "briefcase" || r.k === lab); })[0];
      var v = NF(c.biz).trim();
      if (row) { if (String(row.v || "").trim().split(/\s+/).length <= 3 && String(row.v) !== v) { row.v = v; cnt("aboutBiz"); return 1; } return 0; }
      M.co.facts.splice(Math.min(2, M.co.facts.length), 0, { ic: "briefcase", k: lab, v: v }); cnt("aboutBiz"); return 1;
    } catch (e) { err("about", e); return 0; }
  }
  V.fixAbout = fixAbout;
  /* ── ④' 22.01.2（w2-4）：表紙のバッジは登録の強みから（「Japan-based company」2回・「HS code 9503.00」・「Shelf life from manufacture」をやめる）。
        「売れる理由」と同じ強みの訳の短い見出し。未解決の気づきの数字（v100 の表紙・見出しの決まり）・「不明」の事柄・未登録の原産地は使わない（強みの段階で除いてある） ── */
  var BADGE_BAD = /\bHS\b|HS code|shelf[- ]life|best before|lead time|\bMOQ\b|minimum order|\bport\b|\bFOB\b|\bCIF\b|T\/T|payment|replacement part|incoterms?/i;
  function fixBadges(M, wi, T) {
    try {
      if (!M || !M.hero || !wi || !Array.isArray(wi.badges) || !wi.badges.length) return 0;
      var MH = [];
      try { var V100 = window.V100FACT; if (V100 && typeof V100.headMatchers === "function" && typeof V100.factsOf === "function") { var F0 = V100.factsOf(T); MH = V100.headMatchers(F0.unres, F0) || []; } } catch (e) { MH = []; }
      var res = [];
      wi.badges.forEach(function (b) { if (res.length >= 3 || !b || !b.t) return; if (MH.some(function (m) { return m.re && m.re.test(b.t); })) { if (b.alt && !MH.some(function (m) { return m.re && m.re.test(b.alt); })) b = { ic: b.ic, t: b.alt }; else return; } if (!goodTr(b.t)) return; if (res.some(function (r) { return r.t.toLowerCase() === String(b.t).toLowerCase(); })) return; res.push({ ic: b.ic, t: b.t }); });
      (M.hero.badges || []).forEach(function (a) {
        if (res.length >= 3) return;
        var t = String((a && a.t) || "").trim();
        if (!t || BADGE_BAD.test(t)) return;
        if (res.some(function (r) { return r.t.toLowerCase() === t.toLowerCase() || covers({ t: r.t }, t) || covers({ t: t }, r.t); })) return;
        res.push(a);
      });
      if (!res.length) return 0;
      var before = (M.hero.badges || []).map(function (a) { return a && a.t; }).join("|");
      M.hero.badges = res;
      if (before !== res.map(function (a) { return a.t; }).join("|")) { cnt("badges"); V.lastBadges = { at: Date.now(), from: before, to: res.map(function (a) { return a.t; }) }; }
      return res.length;
    } catch (e) { err("badges", e); return 0; }
  }
  V.fixBadges = fixBadges;
  /* ── ⑤ 市場別の輸入要件：日本側の該非判定書は輸出側の書類として小見出しに分けて書く（v2-10） ── */
  var XC_NOTE = { en: "— import side. Export side (Japan): export-control classification certificate (Certificate of Applicability/Non-Applicability), prepared by the exporter.",
    zh: "（进口方）。出口方（日本）：出口管制的该非判定书，由出口方准备。", es: "(lado de importación). Lado de exportación (Japón): certificado de clasificación de control de exportaciones, lo prepara el exportador." };
  function fixMarkets(M, lang, data, src) {
    try {
      if (!M.markets || !((src && src.v101xc) || (data && data.v101xc))) return 0;
      var note = XC_NOTE[lang2(lang)] || XC_NOTE.en, base = M.markets.sub || (fn("dk3Lb") ? dk3Lb(lang, "marketsSub") : "");
      if (String(base).indexOf(note) >= 0) return 0;
      M.markets.sub = (base ? base + " " : "") + note;
      (M.markets.items || []).forEach(function (m) { if (m && Array.isArray(m.docs)) m.docs = m.docs.filter(function (z) { return !/Applicability|Non-?applicability|該非|该非|export[- ]control classification/i.test(String(z)); }); });
      cnt("xcNote"); return 1;
    } catch (e) { err("mk", e); return 0; }
  }
  V.fixMarkets = fixMarkets;
  V.lastWhy = null;
  if (fn("dk3Model")) {
    var oMDf = window.dk3Model;
    window.dk3Model = function (lang, plan, data, ph, deck, src, T) {
      var M = oMDf.apply(this, arguments);
      try {
        if (M && lang && !/^ja/.test(String(lang))) {
          var TT = T || curT();
          var wi = rebuildWhy(M, lang, plan, data, src, TT);
          V.lastWhy = wi ? Object.assign({ at: Date.now(), lang: lang, uid: String((TT && TT.uid) || "") }, wi) : null;
          if (deck && M.v85) deck.v85 = M.v85;
          fixBadges(M, wi, TT);
          fixAbout(M, lang, data);
          fixMarkets(M, lang, data, src);
        }
      } catch (e) { err("model", e); }
      return M;
    };
  }

  /* ── ⑥ 組み上がった資料の言葉をそろえる（入力が正・資料の中で食い違わない） ──
     ・登録の原材料が「ささみ」なら「chicken breast（胸肉）」と書かない（H：表は Chicken tenderloin、文章は chicken breast で混在・v2-10）
     ・「The registered … is」の登録の読み上げ調を普通の言い方に（照合の前に直しきれなかった所の安全網） */
  var TERMS = [{ w: 1, ja: /ささみ|笹身/, not: /胸肉|むね肉/, re: /\b([Cc]hicken)\s+([Bb]reast)(?:\s+[Tt]enderloin)?(s?)\b(?!\s+[Tt]enderloin|\s+fillet)/g, to: function (m0, a, b, s) { return a + " " + (b.charAt(0) === "B" ? "Tenderloin" : "tenderloin") + s; } },
    /* 訳に残った「・」（英語の語と語の間）は「, 」に（H「Low fat・high protein」・E「PFE・BFE」） */
    { ja: /./, not: /^$/, re: /([A-Za-z0-9%)])\s*・\s*(?=[A-Za-z0-9(])/g, to: function (m0, a) { return a + ", "; } }];
  /* 登録の言葉にそろえる直し（書き手の答え・組み上がった資料の両方で使う）。当てはまるものが無ければ null */
  function termFixer(T) {
    var reg = ""; try { prodsOf(T).forEach(function (t) { reg += " " + NF(t.item || "") + " " + JSON.stringify(t.compRows || []) + " " + JSON.stringify(t.strengths || []); }); } catch (e) { /* 無視 */ }
    var TM = TERMS.filter(function (x) { return x.ja.test(reg) && !x.not.test(reg) && x.w; });
    if (!TM.length) return null;
    return function (s) { var o = String(s); TM.forEach(function (x) { o = o.replace(x.re, x.to); }); return o; };
  }
  V.termFixer = termFixer;
  function polish(deck, T) {
    var n = 0;
    try {
      if (!deck || !Array.isArray(deck.slides) || /^ja/.test(String(deck.lang || ""))) return 0;
      var reg = ""; try { prodsOf(T).forEach(function (t) { reg += " " + NF(t.item || "") + " " + JSON.stringify(t.compRows || []) + " " + JSON.stringify(t.strengths || []); }); } catch (e) { /* 無視 */ }
      var TM = TERMS.filter(function (x) { return x.ja.test(reg) && !x.not.test(reg); });
      var fix = function (s) { var o = String(s); TM.forEach(function (x) { o = o.replace(x.re, x.to); }); if (/registered/i.test(o)) o = deReg(o); return o; };
      deck.slides.forEach(function (S) {
        (S.els || []).forEach(function (e) {
          if (!e || e.k !== "text" || !Array.isArray(e.ps)) return;
          var ch = false;
          e.ps.forEach(function (p) { (p.r || []).forEach(function (r) { if (r && typeof r.t === "string" && r.t) { var y = fix(r.t); if (y !== r.t) { r.t = y; ch = true; n++; } } }); });
          if (ch) { try { delete e.mh; } catch (z) { /* 無視 */ } }
        });
        if (typeof S.notes === "string" && S.notes) { var yn = fix(S.notes); if (yn !== S.notes) { S.notes = yn; n++; } }
      });
    } catch (e) { err("polish", e); }
    if (n) cnt("polish", n);
    return n;
  }
  V.polish = polish;
  if (fn("dk3Assemble")) {
    var oAS2 = window.dk3Assemble;
    window.dk3Assemble = async function (lang, opts) {
      var deck = await oAS2.apply(this, arguments);
      try { if (deck && deck.slides && deck.lang && deck.lang !== "ja") polish(deck, (opts && opts.T) || curT()); } catch (e) { err("polish2", e); }
      return deck;
    };
  }

  /* ── ⑦ 食品の効能の点検（土台の dk3CompRe）：ペットのおやつの「treat（おやつ）」を効能の「治療する」と読まない ──
     原因：土台は「treats?」をそのまま「医薬品的な効能表現」に数える。H（犬用おやつ）が食品の区分になると「Dog Treat」「Lean, High-Protein Treats」など
           10件が外れ、強み「低脂肪・高たんぱく」が資料から消えた（v2-1・v2-7）。区分の直しは hear の担当。ここは物差しの直し（区分が何でも効く）。
     直し：登録の商品がペット向け（犬・猫・ペット・dog・cat・pet）のときだけ、「treat」を「治療する」と読むのは、病気・症状の言葉が続くときと
           「to / helps / can … treat」の動詞の形のときだけにする。 */
  var PET_RE = /犬|猫|ペット|ドッグ|キャット|\bdogs?\b|\bcats?\b|\bpets?\b|\bpuppy|\bkitten/i;
  var TREAT_MED = "(?:(?<=\\b(?:to|helps?|helping|can|may|will|which|that|and)\\s+)treat(?:s|ed|ing)?\\b|\\btreat(?:s|ed|ing)?(?=\\s+(?:\\w+\\s+){0,2}(?:pain|disease|diseases|infection|infections|arthritis|diarrh\\w*|allerg\\w*|conditions?|symptoms?|illness\\w*|itch\\w*|inflammation|parasites?|worms?|fleas?|ticks?|obesity|diabetes|cancer|dermatitis|disorders?|injur\\w*)\\b))";
  function petTen() { try { return prodsOf(curT()).some(function (t) { return PET_RE.test(NF((t.item || "") + " " + (t.itemEn || "") + " " + (t.cat || ""))); }); } catch (e) { return false; } }
  if (fn("dk3CompRe")) {
    var oCR = window.dk3CompRe;
    window.dk3CompRe = function () {
      var re = oCR.apply(this, arguments);
      try {
        if (!(re instanceof RegExp) || !petTen()) return re;
        var s = re.source.replace("treats?|treated|treating|", "");
        if (s === re.source) return re;
        cnt("petTreat");
        return new RegExp(s + "|" + TREAT_MED, re.flags);
      } catch (e) { err("compre", e); return re; }
    };
  }

  /* ── ⑧ 外した理由と資料の本体をそろえる（v1 N5）：「…の数値（0.8mm/s）は、答えが出るまで表紙・見出しに使いません」と書いたのに、
         本文にもその数字が無いときは、理由を「資料に載せていません」に直す（本文にあれば、いまの理由のまま＝本文にはある） ── */
  var HEAD_WHY = /^(未解決の気づき「[\s\S]*?」の数値（([\s\S]*?)）は、答えが出るまで)表紙・見出しに使いません（追加ヒアリングで答えると使えます）$/;
  function bodyText(deck) {
    var a = [];
    try { (deck.slides || []).forEach(function (S) { if (S && S.kind === "cover") return; (S.els || []).forEach(function (e) { if (e && e.k === "text" && Array.isArray(e.ps)) a.push(e.ps.map(function (p) { return (p.r || []).map(function (r) { return r && r.t != null ? String(r.t) : ""; }).join(""); }).join("\n")); }); }); } catch (e) { /* 無視 */ }
    return a.join("\n");
  }
  function alignHeadWhy(deck, r) {
    var n = 0;
    try {
      var T = curT(), SP = T && T.deck3 && T.deck3.plans && T.deck3.plans[deck.lang];
      var body = bodyText(deck);
      var fixW = function (w) { var m = String(w || "").match(HEAD_WHY); if (!m) return null; var num = (m[2].match(/\d+(?:\.\d+)?/) || [""])[0]; if (!num || hasNum(body, num)) return null; return m[1] + "資料に載せていません（追加ヒアリングで答えると載せられます）"; };
      ((SP && SP.dropped) || []).forEach(function (d) { var y = d && fixW(d.why); if (y) { d.why = y; n++; } });
      (r.warn || []).forEach(function (w) { if (!w || w.k !== "drop" || typeof w.t !== "string") return; var m = w.t.match(/^(外した文言：[\s\S]*?)（([\s\S]+)）$/); if (!m) return; var y = fixW(m[2]); if (y) { w.t = m[1] + "（" + y + "）"; n++; } });
    } catch (e) { err("headwhy", e); }
    if (n) cnt("headWhy", n);
    return n;
  }
  V.alignHeadWhy = alignHeadWhy;
  if (fn("dk3Check")) {
    var oCK2 = window.dk3Check;
    window.dk3Check = function (deck) {
      var r = oCK2.apply(this, arguments);
      try {
        if (r && deck && deck.lang && deck.lang !== "ja" && Array.isArray(r.warn)) {
          alignHeadWhy(deck, r);
          var W = V.lastWhy, hasWhy = (deck.slides || []).some(function (s) { return s && s.kind === "why"; });
          r.ok = Array.isArray(r.ok) ? r.ok : [];
          if (W && W.done && hasWhy && W.lang === deck.lang && Date.now() - W.at < 15 * 60000) {
            var okT = "「売れる理由」のページに、登録した商品の強みを入れました（強み " + (W.kept + W.fromStr) + "件のうち、登録の強みの訳から作った項目 " + W.fromStr + "件）";
            if (r.ok.indexOf(okT) < 0) r.ok.push(okT);
            r.warn = r.warn.filter(function (w) { return !(w && (w.k === "v101why" || w.k === "v85why")); });
          }
        }
      } catch (e) { err("check2", e); }
      return r;
    };
  }
  try {
    if (typeof I18N !== "undefined" && Array.isArray(I18N.pat)) {
      I18N.pat.unshift({ re: /^「売れる理由」のページに、登録した商品の強みを入れました（強み (\d+)件のうち、登録の強みの訳から作った項目 (\d+)件）$/,
        en: (m) => "Added your registered product strengths to the “Reasons to stock” page (" + m[1] + " strengths; " + m[2] + " item(s) built from the translation of the registered strengths)",
        zh: (m) => "已把登记的商品优势放入“畅销理由”页面（优势 " + m[1] + " 条，其中按登记优势的译文生成 " + m[2] + " 条）",
        es: (m) => "Se añadieron los puntos fuertes registrados a la página «Razones para comprar» (" + m[1] + " puntos; " + m[2] + " creados a partir de la traducción de lo registrado)" });
    }
  } catch (e) { err("i18n2", e); }
  WHY_TR.unshift([/^未解決の気づき「([\s\S]*?)」の数値（([\s\S]*?)）は、答えが出るまで資料に載せていません（追加ヒアリングで答えると載せられます）$/, { en: "the figure in the open AI note “$1” ($2) is not shown in the deck until it is answered (answer it in the follow-up questions)", zh: "未解决的提示“$1”中的数字（$2）在得到回答前不放入资料（在追加询问中回答即可）", es: "la cifra de la nota pendiente «$1» ($2) no se muestra hasta responderla (responda en las preguntas de seguimiento)" }]);
  try { if (typeof I18N !== "undefined" && Array.isArray(I18N.pat)) { var x0 = WHY_TR[0]; I18N.pat.unshift({ re: x0[0], en: function (m) { return whyTr(m[0], "en"); }, zh: function (m) { return whyTr(m[0], "zh"); }, es: function (m) { return whyTr(m[0], "es"); } }); } } catch (e) { err("i18n3", e); }

  /* ── ⑨ 取り決め（読むだけ）：「不明」と答えた事柄の一覧。buyer の担当（バイヤー文面の適合の断定・v2-2）などが使う ──
     window.v101unkTopics(ten) → [{k:'fit'|'asbestos'|'origin'|'halal'|…|'tok:ISO 13485', lab:'適合（車種・機種・品番）', q:'問い', a:'不明'}]
     window.v101unkHit(ten, 文) → その文が「不明」の事柄を言い切っていれば {k, lab, why}（why＝外す理由の日本語）、無ければ null */
  window.v101unkTopics = function (ten) { try { return unkTopics(ten || curT()).map(function (x) { return { k: x.k, lab: x.lab, q: String(x.q || ""), a: String(x.a || ""), origin: !!x.origin }; }); } catch (e) { err("api", e); return []; } };
  window.v101unkHit = function (ten, s) { try { var L = unkTopics(ten || curT()), tp = hitTopic(String(s || ""), L); return tp ? { k: tp.k, lab: tp.lab, why: whyUnk(tp) } : null; } catch (e) { err("api2", e); return null; } };

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
