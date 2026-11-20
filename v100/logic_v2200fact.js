/* 22.00 分野 fact（英語営業資料の中身の事実の正しさ）2026-11-20 第13回 UAT の直し
   No.592（高）否定の読み違い（B「ラベル：紙、食品に触れる部材なし」→ 食品接触あり・Food contact: yes）
   No.593（中）保証→Shelf life の取り違え（B「保証：なし」・G「保証：初期不良のみ交換」）
   No.594（中）回答と矛盾する除外（D 追加ヒアリング「防腐剤は含まない」なのに Preservative-free を外す）
   No.596（中）入力した値が空欄（E「滅菌：なし」→ Sterilization 空欄・除外の理由「空欄で根拠なし」）
   No.601（低）REACH の扱いの食い違い（除外の理由「表面処理のみ」・材質表「REACH compliant」）
   No.603（中）材質表の矛盾（ZZ を Rubber）・未解決の気づき（寿命2倍）が資料に残る
   No.543 の残り（A の Allergen の重複）・No.553（入力に無い表現：vet-recommended など）
   考え方：入力（利用者が打った・答えた事実。否定も）を正とし、AI の答え（ヒアリングの整え・追加ヒアリング・訳・照合・文章）が
   入力と食い違ったら入力どおりに戻す。資料の値を正しくする側だけを持ち、最終チェック・送信の判定（out の分野）は触らない。
   取り決め：window.v100neg(text) …「なし／無し／ない／不使用／含まない／非該当／ではない／該当なし」などを見分け {neg, subject, …} を返す。
   どの包みも、何度通っても同じ結果（二重にかけても壊れない）。 */
(function () {
  "use strict";
  var V = window.V100FACT = window.V100FACT || {};
  if (V.__loaded) return;
  V.__loaded = 1; V.ver = "22.00-fact"; V.err = null; V.errs = []; V.n = {}; V.log = [];
  function err(w, e) { var m = w + ": " + String((e && e.message) || e).slice(0, 200); V.err = m; V.errs.push(m); if (V.errs.length > 30) V.errs.shift(); try { console.warn("v100fact", m); } catch (x) { /* 無視 */ } }
  function cnt(k, d) { V.n[k] = (V.n[k] || 0) + (d || 1); }
  function lg(o) { try { o.at = Date.now(); V.log.push(o); if (V.log.length > 300) V.log.shift(); } catch (e) { /* 無視 */ } }
  function NF(s) { return String(s == null ? "" : s).normalize("NFKC"); }
  function fn(n) { try { return typeof window[n] === "function"; } catch (e) { return false; } }
  function curT() { try { return (typeof DK3G !== "undefined" && DK3G && DK3G.run && DK3G.ten) || (typeof TEN !== "undefined" ? TEN : null); } catch (e) { return null; } }
  var JA = /[ぁ-ゖァ-ヺ一-龯々]/;

  /* ══════════ 否定の読み取り（取り決め：window.v100neg） ══════════ */
  var NEG_W = "(?:なし|無し|ナシ|ない|無い|ありません|ございません|不使用|未使用|使用しない|使用せず|使用していない|使用していません|使用しておりません|使用しません|使っていない|使っていません|使っておりません|使わない|使わず|含まない|含まず|含みません|含有しない|含有していない|含有なし|入っていない|入っていません|入れていない|入れていません|入れない|配合していない|配合していません|配合しておりません|配合しない|配合なし|無配合|非配合|不含|非該当|該当なし|該当無し|該当しない|該当しません|対象外|ではない|ではありません|ではないです|でない|じゃない|しない|しません|していない|していません|しておりません|不要|フリー|ゼロ|0\\s*%)";
  var RE_TAIL = new RegExp("^(.*?)(?:は|が|も|を|に|:)?\\s*" + NEG_W + "(?:です|でした|。|\\.|!|！)*\\s*(?:\\([^()]*\\))?\\s*$");
  var NOT_NEG_STEM = /(?:少|危|切|汚|幼|頼り|仕方|ぎこち|もったい|せわし|情け|味気|はか|つまら|くだら|だらし|足り|間違い|違い|かもしれ|に違い|しか)$/;
  var PFX_NEG = /^(?:非|無|不|ノン|ノー|non-?)\s*(滅菌|接触|食品接触|香料|着色|着色料|添加|アスベスト|石綿|アルコール|シリコン|シリコーン|パラベン|鉛|カドミウム|農薬|保存料|防腐剤|塩素|リン|蛍光|漂白|界面活性剤|石油|合成|動物|グルテン|小麦|穀物|遺伝子組換え|BPA|ハロゲン|有機溶剤|溶剤|フタル酸|ホルムアルデヒド|ラテックス|天然ゴム)/i;
  var LIM_RE = /^(.*?)(?:は|:)?\s*([^:]{1,24}?)(?:のみ|だけ|に限る|に限り|に限定|限定)(?:で|です|。)?\s*(?:対応|適合|準拠|交換|保証|使用|含有|該当)?(?:です|。)?\s*$/;
  var ENEG = /\b(?:no|not|non|none|without|never|n\/a|zero|free of|free from)\b|\bnon-|\w-free\b|\bfree\b|^-$/i;
  var EN_LIM = /\b(?:only|limited|partial(?:ly)?|exclusively|solely|restricted)\b/i;

  function splitTop(s) {
    var out = [], c = "", d = 0; s = String(s || "");
    for (var i = 0; i < s.length; i++) {
      var ch = s[i];
      if ("(（[［【「『".indexOf(ch) >= 0) d++;
      else if (")）]］】」』".indexOf(ch) >= 0) d = Math.max(0, d - 1);
      var sep = d === 0 && ("。\n;；/／、|｜".indexOf(ch) >= 0 || (ch === "," && !(/\d/.test(s[i - 1] || "") && /\d/.test(s[i + 1] || ""))));
      if (sep && ch === "/" && /\d/.test(s[i - 1] || "") && /\d/.test(s[i + 1] || "")) sep = false;
      if (sep) { out.push(c); c = ""; continue; }
      c += ch;
    }
    out.push(c);
    return out.map(function (x) { return x.replace(/^[\s・•*\-]+|[\s。.]+$/g, "").trim(); }).filter(Boolean);
  }
  function cleanSubj(s) {
    s = String(s || "").replace(/^[\s・•*\-※]+/, "").replace(/(?:は|が|も|を|に|の|:|：)\s*$/, "").trim();
    var m = s.match(/^([^:]{1,24}):\s*(.*)$/);
    if (m) { var rest = m[2].trim(); if (!rest || /^[ぁ-ゖ]{0,6}$/.test(rest) || /^(?:設け|使用|使|含|入|配合|該当|対応)[ぁ-ゖ]*$/.test(rest)) return m[1].trim(); return rest.replace(/(?:は|が|も|を|に|の)\s*$/, "").trim(); }
    return s.replace(/(?:を)?(?:使用|使|含有|含|配合|入|入れ)$/, "").trim();
  }
  function negClause(c) {
    var t = NF(c).trim();
    if (!t) return null;
    var pm = t.replace(/^.*?:\s*/, "").match(PFX_NEG);
    if (pm && !/^(?:無料|不良|非常|無事|不明|無理|無印|不安|不足|非売|無限|不定)/.test(t.replace(/^.*?:\s*/, ""))) return { neg: true, subject: pm[1], word: pm[0], pfx: 1 };
    var m = t.match(RE_TAIL);
    if (!m) return null;
    var head = m[1] || "";
    if (/ない$|無い$/.test(t) && NOT_NEG_STEM.test(head.replace(/(?:は|が|も)$/, ""))) return null;
    var w = t.slice(head.length).replace(/^(?:は|が|も|を|に|:)\s*/, "").replace(/(?:です|でした|。|\.|!|！)+$/, "").replace(/\s*\([^()]*\)\s*$/, "");
    return { neg: true, subject: cleanSubj(head), word: w };
  }
  var LIM_RE2 = /^(.+?)\s*(?:は|:)\s*(.+?)(?:のみ|だけ|に限る|に限り|に限定|限定)(?:で|です|。)?\s*(?:対応|適合|準拠|交換|保証|使用|含有|該当)?(?:です|。)?\s*$/;
  function limClause(c) {
    var t = NF(c).trim(); var m = t.match(LIM_RE2) || t.match(LIM_RE);
    if (!m) return null;
    var subj = cleanSubj(m[1] || ""), scope = (m[2] || "").replace(/^(?:は|:)\s*/, "").trim();
    if (!subj && /:/.test(t)) subj = t.split(":")[0].trim();
    return { lim: true, subject: subj, scope: scope };
  }
  /* Q→A：答えが「いいえ」「含まない」だけのとき、問いの主語を使う */
  function qSubject(q) {
    var s = NF(q).replace(/\([^()]*\)/g, "").replace(/[?？。]+$/, "");
    var m = s.match(/([^\s、。,]{1,16}?)(?:は|を|が|も)(?:[^、。]{0,10}?)(?:使用|使|含|配合|入|あり|あります|ある|添加|付属|対応|適合|該当|接触|触れ)/);
    return m ? m[1].replace(/^(?:また|なお|この|その|商品の|本品の|製品の)/, "") : "";
  }
  function v100neg(text, q) {
    var r = { neg: false, subject: "", word: "", subjects: [], lim: false, scope: "", lims: [], clauses: [] };
    try {
      var s = NF(text).trim();
      if (!s) return r;
      if (/^(?:いいえ|いえ|no|nope|ありません|ないです|ない|なし|無し|含まない|含みません|使っていない|使っていません|使用していません|入っていません|配合していません|該当しません|該当なし|非該当|対象外)[。.!！]*$/i.test(s) && q) {
        var qs = qSubject(q);
        r.neg = true; r.subject = qs; r.word = s; if (qs) r.subjects.push(qs);
        r.clauses.push({ text: s, neg: true, subject: qs, word: s, fromQ: 1 });
        return r;
      }
      var parts = splitTop(s), pend = [];
      parts.forEach(function (c) {
        var n = negClause(c), l = limClause(c);
        var cl = { text: c, neg: !!n, subject: n ? n.subject : "", word: n ? n.word : "", lim: !!l, scope: l ? l.scope : "" };
        r.clauses.push(cl);
        if (n) {
          var nsub = n.subject && !/:/.test(n.subject) && /・/.test(n.subject) ? n.subject.split("・").map(function (x) { return x.trim(); }).filter(Boolean) : (n.subject ? [n.subject] : []);
          var subs = ((!nsub.length || !/[にとでをがへ]|する|れる/.test(nsub.join(""))) ? pend : []).concat(nsub);
          if (!subs.length && /:/.test(c)) subs = [c.split(":")[0].trim()];
          subs.forEach(function (x) { if (x && r.subjects.indexOf(x) < 0) r.subjects.push(x); });
          if (!r.neg) { r.neg = true; r.subject = subs[0] || ""; r.word = n.word; }
          pend = [];
        } else if (l) {
          r.lims.push({ subject: l.subject, scope: l.scope, text: c });
          if (!r.lim) { r.lim = true; r.scope = l.scope; }
          pend = [];
        } else if (!/:/.test(c) && c.length <= 12 && !/\d/.test(c)) pend.push(c);
        else pend = [];
      });
    } catch (e) { err("neg", e); }
    return r;
  }
  window.v100neg = v100neg;
  V.neg = v100neg;

  /* ══════════ 話題（主語の言い方と、英語での肯定・否定の言い方） ══════════ */
  var TOPIC = [
    { k: "food", ja: /食品|飲食物|飲み物|食べ物|口に?(?:入|触|接)|接液/, req: /触|接|食品接触|接液/, conK: "",
      pos: [/\bfood\s*contact\s*[:：]\s*(?:yes|applicable|contact)\b/i, /\b(?:parts?|materials?|surfaces?|components?)\s+(?:that\s+)?(?:come|comes|are|is)\s+(?:in\s+)?(?:direct\s+)?contact\s+with\s+food\b/i, /(?<!\bno\s)(?<!\bnon-)\bfood[- ]contact\s+(?:parts?|materials?|surfaces?|components?|safe|grade|approved)\b/i, /\bfood[- ](?:safe|grade)\b/i],
      en: { en: "no parts in contact with food", es: "sin piezas en contacto con alimentos", zh: "无接触食品的部件" }, flag: { en: "Food contact: no", es: "Contacto con alimentos: no", zh: "不接触食品" } },
    { k: "steril", ja: /滅菌/, conK: "", pos: [/(?<!non-)(?<!non\s)(?<!not\s)(?<!\bun)\bsterile\b/i, /(?<!non-)(?<!not\s)\bsterili[sz]ed\b/i, /\bsterili[sz]ation[- ](?:treated|processed|guaranteed)\b/i],
      en: { en: "Non-sterile", es: "No estéril", zh: "非无菌" } },
    { k: "warranty", ja: /保証|ギャランティ/, conK: "", pos: [/\bwarranty\s+(?:included|provided|available)\b/i, /\b\d+[- ](?:year|month)s?\s+warranty\b/i, /(?<!\bnot\s)(?<!\bno\s)(?<!\bun)\bguaranteed\b/i],
      en: { en: "No warranty", es: "Sin garantía", zh: "无保修" } },
    { k: "preserv", ja: /保存料|防腐剤|防腐/, conK: "preserv", pos: [/\bcontains?\s+(?:a\s+)?preservatives?\b/i, /\bwith\s+preservatives?\b/i], en: { en: "No preservatives", es: "Sin conservantes", zh: "不含防腐剂" } },
    { k: "paraben", ja: /パラベン/, conK: "paraben", pos: [/\bcontains?\s+parabens?\b/i], en: { en: "Paraben-free", es: "Sin parabenos", zh: "不含羟苯酯" } },
    { k: "fragrance", ja: /香料/, conK: "fragrance", pos: [/\b(?:contains?|with)\s+(?:added\s+)?fragrance\b/i, /\bscented\b/i], en: { en: "Fragrance-free", es: "Sin fragancia", zh: "无香料" } },
    { k: "colorant", ja: /着色料|着色|色素/, conK: "colorant", pos: [/\b(?:contains?|with)\s+(?:added\s+)?colou?r(?:ant|ing)s?\b/i], en: { en: "No colorants", es: "Sin colorantes", zh: "无色素" } },
    { k: "alcohol", ja: /アルコール|エタノール/, conK: "alcohol", pos: [/\b(?:contains?|with)\s+(?:added\s+)?(?:alcohol|ethanol)\b/i, /\balcohol[- ]based\b/i], en: { en: "Alcohol-free", es: "Sin alcohol", zh: "不含酒精" } },
    { k: "additive", ja: /添加物/, conK: "additive", pos: [/\b(?:contains?|with)\s+(?:food\s+)?additives\b/i], en: { en: "No additives", es: "Sin aditivos", zh: "无添加" } },
    { k: "asbestos", ja: /アスベスト|石綿/, conK: "", pos: [/\bcontains?\s+asbestos\b/i], en: { en: "Asbestos-free", es: "Sin amianto", zh: "无石棉" } },
    { k: "latex", ja: /ラテックス|天然ゴム/, conK: "", pos: [/\b(?:contains?|made\s+(?:with|of))\s+(?:natural\s+)?(?:rubber\s+)?latex\b/i], en: { en: "Latex-free", es: "Sin látex", zh: "不含乳胶" } },
    { k: "gluten", ja: /グルテン|小麦/, conK: "gluten", pos: [/\bcontains?\s+(?:gluten|wheat)\b/i], en: { en: "Gluten-free", es: "Sin gluten", zh: "无麸质" } },
    { k: "grain", ja: /穀物|グレイン/, conK: "grain", pos: [/\bcontains?\s+grains?\b/i], en: { en: "Grain-free", es: "Sin granos", zh: "无谷物" } }
  ];
  function topicOf(subj) {
    var s = NF(subj);
    for (var i = 0; i < TOPIC.length; i++) { var T0 = TOPIC[i]; if (T0.ja.test(s) && (!T0.req || T0.req.test(s))) return T0; }
    return null;
  }
  V.topicOf = topicOf;

  /* ══════════ 入力の事実（利用者が打った・答えたもの） ══════════ */
  var WARR = /保証|ギャランティ|初期不良|交換対応|返品|修理対応|warranty|guarantee/i;
  var EXPW = /賞味期限|消費期限|使用期限|使用推奨期限|有効期限|品質保持期限|日持ち|製造(?:日)?から|開封後|未開封|best before|expiry|expiration|use[- ]by|shelf/i;
  function inputTexts(T) {
    var L = [];
    var add = function (src, label, text, q) { text = NF(text).trim(); if (text && !/^(?:わからない|分からない|不明|未定|-|—)$/.test(text)) L.push({ src: src, label: NF(label || ""), text: text, q: q || "" }); };
    try {
      if (!T) return L;
      [["shelf", "賞味期限・保証期間"], ["store", "保存方法"], ["cert", "認証"], ["origin", "産地"], ["desc", "商品説明"]].forEach(function (f) { add(f[0], f[1], T[f[0]]); });
      ["compRows", "dimRows"].forEach(function (k) {
        (Array.isArray(T[k]) ? T[k] : []).forEach(function (r, i) {
          if (!Array.isArray(r)) return;
          var lab = NF(r[0] || ""), vals = r.slice(1).map(NF).filter(function (x) { return x.trim(); });
          vals.forEach(function (v) { add(k + "." + i, lab, (/^(?:なし|無し|ナシ|none|n\/a|該当なし|非該当|不使用|対象外)$/i.test(v.trim()) ? lab + ":" : "") + v); });
          if (!vals.length && lab) add(k + "." + i, "", lab);
        });
      });
      (Array.isArray(T.strengths) ? T.strengths : []).forEach(function (s, i) { if (Array.isArray(s)) { add("strengths." + i, "", s[0]); add("strengths." + i, "", s[1]); } else add("strengths." + i, "", s); });
      (Array.isArray(T.extraQA) ? T.extraQA : []).forEach(function (x, i) { if (x && x.a) add("extraQA." + i, "", x.a, x.q); });
      var A = T.v68attrs;
      if (A && typeof A === "object") Object.keys(A).forEach(function (k) { var v = A[k]; if (typeof v === "string") add("v68attrs." + k, k, v); });
      var R = T.v100raw;
      if (R && typeof R === "object") Object.keys(R).forEach(function (k) { add("raw." + k, k, R[k]); });
    } catch (e) { err("texts", e); }
    return L;
  }
  function factsOf(T) {
    var F = { negs: [], lims: [], food: null, foodGlobal: false, steril: null, warranty: "", texts: [], zz: false, rubber: false, unres: [] };
    try {
      if (!T) return F;
      var L = inputTexts(T); F.texts = L;
      L.forEach(function (x) {
        var r = v100neg(x.text, x.q);
        r.subjects.forEach(function (s) {
          var tp = topicOf(s) || (x.label ? topicOf(x.label + s) : null);
          F.negs.push({ subj: s, topic: tp ? tp.k : "", src: x.src, text: x.text });
          if (tp && tp.k === "food") { F.food = false; if (/部材|部分|もの|箇所|パーツ|部品|ところ|製品|商品|本品/.test(s) || !/(?:容器|キャップ|ラベル|本体|ノズル|トリガー|ボトル)/.test(s)) F.foodGlobal = true; }
          if (tp && tp.k === "steril") F.steril = "non";
        });
        r.lims.forEach(function (l) { F.lims.push({ subj: l.subject, scope: l.scope, src: x.src, text: l.text }); });
        if (/\bZZ\b|鋼板シールド|金属シールド|シールド板|シールド形|鉄板シールド/i.test(x.text)) F.zz = true;
        if (/ゴム|ラバー|NBR|ACM|FKM|エラストマー|\b2?RS\b|\bDDU?\b|接触シール|非接触シール/i.test(x.text)) F.rubber = true;
      });
      if (F.food == null && L.some(function (x) { return /食品接触あり|食品に(?:直接)?(?:触れる|接触する)(?!部材なし|部分なし|ものなし)/.test(x.text) && !v100neg(x.text).neg; })) F.food = true;
      var sh = NF(T.shelf || "") + " " + NF((T.v100raw && T.v100raw.shelf) || "");
      if (WARR.test(sh)) F.warranty = sh.trim();
      try { if (typeof v68pNotes === "function") F.unres = v68pNotes(T).filter(function (x) { return x && !x.done; }).map(function (x) { return String(x.n || ""); }).filter(Boolean); } catch (e) { /* 無視 */ }
    } catch (e) { err("facts", e); }
    return F;
  }
  V.factsOf = factsOf;
  function negHas(F, tk) { return F.negs.some(function (n) { return n.topic === tk; }); }

  /* ══════════ ヒアリング：材質表の「食品に触れる部材なし」（No.592） ══════════ */
  var FOOD_NEG_CL = /(?:^|[、,，・\s])\s*食品(?:に|と)?(?:は)?(?:直接)?(?:触れ|ふれ|接触)(?:る|す?る)?\s*(?:部材|部分|もの|箇所|パーツ|部品|ところ)?\s*(?:は|が)?\s*(?:なし|無し|ない|無い|ありません|ございません)\s*$/;
  function foodNegText(s) {
    try { var r = v100neg(s); return r.subjects.some(function (x) { var t = topicOf(x); return t && t.k === "food"; }) || /非接触|食品接触なし/.test(NF(s)); } catch (e) { return false; }
  }
  if (fn("v68hearFlags")) {
    var oFlags = window.v68hearFlags;
    window.v68hearFlags = function (s) {
      var f = oFlags.apply(this, arguments);
      try { if (f && f.food === true && foodNegText(s)) { f.food = false; cnt("flagNeg"); } } catch (e) { err("flags", e); }
      return f;
    };
  }
  if (fn("v68hearCompParse")) {
    var oCP = window.v68hearCompParse;
    window.v68hearCompParse = function (raw, ind) {
      var r = oCP.apply(this, arguments);
      try {
        if (!r || !Array.isArray(r.rows)) return r;
        var s = NF(raw);
        var segs = splitTop(s.replace(/^[^:]{1,20}:\s*/, ""));
        var glob = splitTop(s).some(function (x) { return FOOD_NEG_CL.test(" " + x) && !/^[^:]{1,20}:\s*[^、,]+$/.test(x.replace(FOOD_NEG_CL, "")); }) || segs.some(function (x) { return FOOD_NEG_CL.test(" " + x); });
        if (!glob) return r;
        var stmt = "";
        r.rows.forEach(function (row, i) {
          if (!Array.isArray(row)) return;
          if (row[0] === "補足") return;
          var v = String(row[1] || ""), v2 = v.replace(FOOD_NEG_CL, "").replace(/[、,，\s]+$/, "").trim();
          if (v2 !== v) { stmt = stmt || v.slice(v2.length).replace(/^[、,，\s]+/, "").trim(); row[1] = v2; }
          var note = String(row[2] || "");
          if (/食品接触あり/.test(note)) row[2] = note.replace(/食品接触あり/g, "食品接触なし");
          else if (!/食品接触/.test(note)) row[2] = note ? "食品接触なし・" + note : "食品接触なし";
          if (r.mat && r.mat[i]) { r.mat[i].food = false; if (v2 !== v) r.mat[i].mat = v2; }
        });
        if (Array.isArray(r.mat)) r.mat.forEach(function (m) { if (m) m.food = false; });
        stmt = stmt || "食品に触れる部材なし";
        var sup = r.rows.find(function (x) { return x && x[0] === "補足"; });
        if (sup) { if (String(sup[1] || "").indexOf(stmt) < 0) sup[1] = (stmt + " " + String(sup[1] || "")).trim(); }
        else r.rows.push(["補足", stmt, "食品接触なし"]);
        cnt("compGlobalFoodNeg"); lg({ k: "compFood", raw: s.slice(0, 120) });
      } catch (e) { err("compParse", e); }
      return r;
    };
  }

  /* ══════════ ヒアリング：AI の整えが入力の否定・保証・限定を落としたら入力どおりに（No.592・593・596・601） ══════════ */
  function negKeep(raw, val, q) {
    var R = v100neg(raw, q);
    var why = [];
    if (R.neg) {
      var VV = v100neg(val, q), vn = NF(val);
      R.subjects.forEach(function (s) {
        var tp = topicOf(s);
        var core = NF(s).replace(/(?:に触れる|と接触する|に接触する)?(?:部材|部分|もの|箇所|パーツ|部品)$/, "").slice(0, 6);
        var negOk = VV.subjects.some(function (x) { var t2 = topicOf(x); return (tp && t2 && t2.k === tp.k) || (core && NF(x).indexOf(core) >= 0); }) || (!s && VV.neg);
        if (tp && tp.k === "food" && /食品接触あり|食品に触れる(?!部材なし)/.test(vn) && !/食品接触なし/.test(vn)) negOk = false;
        if (tp && tp.k === "steril" && /滅菌済|滅菌あり|滅菌品/.test(vn)) negOk = false;
        if (!negOk) why.push("否定「" + (s ? s + "：" : "") + R.word + "」");
      });
      if (!R.subjects.length && !VV.neg) why.push("否定「" + R.word + "」");
    }
    if (WARR.test(NF(raw)) && !WARR.test(NF(val))) why.push("保証");
    R.lims.forEach(function (l) { if (!/のみ|だけ|限/.test(NF(val))) why.push("限定「" + l.subject + "は" + l.scope + "のみ」"); });
    /* 入力に無い材質を AI が足した（ZZ の鋼板シールドを「ゴムシール」に） */
    (NF(val).match(/ゴム|ラバー|樹脂|プラスチック|金属|アルミ|ガラス|シリコ|ナイロン|綿/g) || []).forEach(function (m) { if (NF(raw).indexOf(m) < 0 && why.indexOf("材質「" + m + "」") < 0) why.push("材質「" + m + "」"); });
    /* 入力に無い規制名・認証を AI が足した */
    regOf(val).forEach(function (g) { if (regOf(raw).indexOf(g) < 0) why.push("規制名「" + g + "」"); });
    return why;
  }
  V.negKeep = negKeep;
  if (fn("llmFillTriage")) {
    var oFT = window.llmFillTriage;
    window.llmFillTriage = async function (cu, v) {
      var raw = String(v == null ? "" : v).trim();
      try { var T0 = (typeof TEN !== "undefined") ? TEN : null; if (T0 && cu && cu.k && !cu.x && /^(compRows|dimRows|shelf|cert|store|strengths|origin)$/.test(String(cu.k)) && raw) { T0.v100raw = T0.v100raw || {}; T0.v100raw[cu.k] = raw.slice(0, 600); } } catch (e) { err("raw", e); }
      var j = await oFT.apply(this, arguments);
      try {
        if (j && cu && raw && !cu.x) {
          var k = String(cu.k || "");
          if (j.kind === "answer" && j.value != null && String(j.value) !== raw) {
            var why = negKeep(raw, String(j.value), "");
            if (why.length) { lg({ k: "triageRaw", f: k, raw: raw.slice(0, 80), ai: String(j.value).slice(0, 80), why: why.join("・") }); j.value = raw; j.v100raw = why; cnt("triageRaw"); }
          } else if (j.kind === "skip" && /^(compRows|dimRows|shelf|cert|store)$/.test(k) && v100neg(raw).neg && !/わから|分から|不明|未定/.test(raw)) {
            lg({ k: "triageSkip", f: k, raw: raw.slice(0, 80) }); j.kind = "answer"; j.value = raw; cnt("triageSkip");
          }
        }
      } catch (e) { err("triage", e); }
      return j;
    };
  }
  if (fn("llmExtraTriage")) {
    var oXT = window.llmExtraTriage;
    window.llmExtraTriage = async function (cu, val) {
      var raw = String(val == null ? "" : val).trim();
      var j = await oXT.apply(this, arguments);
      try {
        var q = (cu && cu.qPlain) || "";
        if (j && raw) {
          if (j.kind === "answer" && j.value != null && String(j.value) !== raw) {
            var why = negKeep(raw, String(j.value), q);
            if (why.length) { lg({ k: "extraRaw", raw: raw.slice(0, 80), ai: String(j.value).slice(0, 80), why: why.join("・") }); j.value = raw; cnt("extraRaw"); }
          } else if (j.kind === "skip" && v100neg(raw, q).neg && !/わから|分から|不明|未定/.test(raw)) { j.kind = "answer"; j.value = raw; cnt("extraSkip"); }
        }
      } catch (e) { err("xtriage", e); }
      return j;
    };
  }
  /* 追加ヒアリングの問い・AI の気づきが、入力で否定した事柄を前提にしていたら外す（No.592「食品接触あり」が前提の質問） */
  function premiseBad(txt, F) {
    var t = NF(txt);
    for (var i = 0; i < F.negs.length; i++) {
      var n = F.negs[i]; if (!n.topic) continue;
      var tp = TOPIC.filter(function (x) { return x.k === n.topic; })[0];
      if (!tp) continue;
      /* 問い・気づきが入力と同じ否定を言っている（「防腐剤不使用で…の試験はありますか」）なら、前提は入力どおり＝外さない */
      if (new RegExp("(?:" + tp.ja.source + ")[^。、？?]{0,8}(?:不使用|なし|無し|含ま(?:ない|ず)|使(?:用し|っ)?て(?:い)?(?:ない|ません)|配合して(?:い)?(?:ない|ません)|無配合|フリー|ゼロ|触れない|接触しない)|(?:非|無|ノン)(?:" + tp.ja.source + ")").test(t)) continue;
      if (n.topic === "food") { if (/食品(?:に|と)?(?:直接)?(?:触れる|接触する)|食品接触|溶出試験|食品衛生法.{0,8}(?:器具|容器|規格)|food[- ]contact/i.test(t) && !/(?:触れ|接触)(?:ない|しない)|なし/.test(t)) return n; }
      else if (tp.ja.test(t) && !v100neg(t).neg && !/[?？]$/.test(t.trim()) ) return n;
      else if (tp.ja.test(t) && /(?:の|について).{0,12}(?:方法|条件|種類|濃度|量|試験|成績|証明)/.test(t)) return n;
    }
    return null;
  }
  V.premiseBad = premiseBad;
  if (fn("llmGapAnalyze")) {
    var oGA = window.llmGapAnalyze;
    window.llmGapAnalyze = async function () {
      var res = await oGA.apply(this, arguments);
      try {
        var T0 = (typeof TEN !== "undefined") ? TEN : null; var F = factsOf(T0);
        if (res && F.negs.length) {
          var drop = [];
          res.questions = (res.questions || []).filter(function (x) { var b = premiseBad(x && x.q, F); if (b) drop.push({ q: x.q, why: "入力「" + b.text.slice(0, 40) + "」と食い違う前提" }); return !b; });
          res.insights = (res.insights || []).filter(function (x) { var b = premiseBad(x, F); if (b) drop.push({ q: x, why: "入力「" + b.text.slice(0, 40) + "」と食い違う前提" }); return !b; });
          if (drop.length) { cnt("gapDrop", drop.length); lg({ k: "gapDrop", drop: drop }); if (T0) T0.v100gapDrop = drop.slice(0, 6); }
        }
      } catch (e) { err("gap", e); }
      return res;
    };
  }

  /* ══════════ 表：「なし」を空欄にしない（No.596）・食品接触の印を入力どおりに（No.592） ══════════ */
  var PLACE_NEG = /^(?:なし|無し|ナシ|none|n\/a)$/i;
  function negWord(label) {
    var L = NF(label).trim();
    if (/滅菌/.test(L)) return "非滅菌";
    if (/保証/.test(L)) return "保証なし";
    if (/食品接触|食品に触/.test(L)) return "食品接触なし";
    if (L && L.length <= 10 && JA.test(L)) return L.replace(/の有無$|有無$/, "") + "なし";
    return "該当なし";
  }
  function fixRows(cols, rows) {
    var F = null, ch = 0;
    var fc = Array.isArray(cols) ? cols.findIndex(function (c) { return /食品接触/.test(NF(c)); }) : -1;
    var ingT = Array.isArray(cols) && cols.some(function (c) { return ING_COLS.test(NF(c)); });
    if (ingT) rows = rows.filter(function (r) { var st = negRow(cols, r); if (st) { ch++; return false; } return true; });
    var out = rows.map(function (r) {
      if (!Array.isArray(r)) return r;
      var a = r.slice(), lab = String(a[0] == null ? "" : a[0]);
      for (var j = 1; j < a.length; j++) {
        var c = String(a[j] == null ? "" : a[j]).trim();
        if (lab.trim() && PLACE_NEG.test(NF(c))) { a[j] = negWord(lab); ch++; }
        else if (lab.trim() && /^(?:未定|不明)$/.test(c)) { a[j] = c + "（要確認）"; ch++; }
      }
      var rowTxt = a.join(" ");
      var fi = fc >= 1 ? fc : a.findIndex(function (x, j) { return j >= 1 && /食品接触あり/.test(String(x || "")); });
      if (fi >= 1 && /食品接触あり/.test(String(a[fi] || ""))) {
        if (F == null) F = factsOf(curT());
        if (foodNegText(rowTxt.replace(/食品接触あり/g, "")) || (F.foodGlobal && !/食品(?:に|と)?(?:直接)?(?:触れる|接触する)(?!部材なし|部分なし)/.test(rowTxt.replace(/食品接触あり/g, "")))) { a[fi] = String(a[fi]).replace(/食品接触あり/g, "食品接触なし"); ch++; }
      }
      return a;
    });
    if (ch) cnt("tblFix", ch);
    return out;
  }
  V.fixRows = fixRows;
  if (fn("dk3Tbl")) {
    var oTbl = window.dk3Tbl;
    window.dk3Tbl = function (cols, rows, max, kind) {
      var a = [].slice.call(arguments);
      try { if (kind !== "price" && Array.isArray(rows) && rows.length) a[1] = fixRows(cols, rows); } catch (e) { err("tbl", e); }
      return oTbl.apply(this, a);
    };
  }

  /* ══════════ 期限の欄の保証を「保証（Warranty）」に分ける（No.593） ══════════ */
  function warrSplit(raw) {
    var s = NF(raw).trim();
    if (!s || !WARR.test(s)) return null;
    var parts = s.replace(/(\d)\.(\d)/g, "$1․$2").split(/[。;；\n／/]|[、・](?=[^、・]*(?:保証|初期不良|warranty|guarantee))|\s+(?=保証)/).map(function (x) { return x.replace(/․/g, ".").trim(); }).filter(Boolean);
    var w = [], e = [];
    parts.forEach(function (x) { if (WARR.test(x) && !EXPW.test(x)) w.push(x); else e.push(x); });
    if (!w.length) return null;
    var wt = w.join(" ").replace(/^(?:保証(?:期間)?|warranty)\s*[:：]\s*/i, "").trim();
    if (PLACE_NEG.test(wt) || /^(?:なし|無し|ありません|ない)$/.test(wt)) wt = "保証なし";
    else if (/^(?:保証)?(?:なし|無し)$/.test(wt)) wt = "保証なし";
    return { warranty: wt, shelf: e.filter(function (x) { return EXPW.test(x) || /\d\s*(?:か月|ヶ月|ケ月|カ月|年|日|months?|years?|days?)/i.test(x); }).join(" ") };
  }
  V.warrSplit = warrSplit;
  if (fn("dk3DataSrc")) {
    var oDS = window.dk3DataSrc;
    window.dk3DataSrc = function (T) {
      var r = oDS.apply(this, arguments);
      try {
        var TT = T || curT();
        var prods = fn("dk3Prods") ? dk3Prods(TT) : (TT ? [TT] : []);
        ((r && r.prods) || []).forEach(function (q, i) {
          var t = prods[i]; if (!q || !t) return;
          var raw = NF(t.shelf || "");
          if (!WARR.test(raw) && t.v100raw && WARR.test(NF(t.v100raw.shelf || "")) && !EXPW.test(raw)) raw = NF(t.v100raw.shelf);
          var sp = warrSplit(raw);
          if (!sp) return;
          if (q.warranty !== sp.warranty) { q.warranty = sp.warranty; q.shelf = sp.shelf; cnt("warrSplit"); }
        });
      } catch (e) { err("ds", e); }
      return r;
    };
  }
  var WLAB = { en: "Warranty", es: "Garantía", fr: "Garantie", de: "Garantie", it: "Garanzia", pt: "Garantia", zh: "保修", "zh-tw": "保固", ko: "보증", vi: "Bảo hành", th: "การรับประกัน", id: "Garansi", ms: "Waranti", ar: "الضمان" };
  function wlab(lang) { return WLAB[lang] || WLAB[String(lang || "").slice(0, 2)] || WLAB.en; }
  var WARR_EN = /\bwarrant|\bguarante|\bdefect|\breplace(?:ment)?\b|\brepair\b|\breturns?\b|\bexchange\b|保修|保固|garant[ií]a|reemplazo/i;
  var SHELF_LAB = /^(?:shelf life|best before|use[- ]by(?: period| date)?|expiry(?: date)?|expiration(?: date)?|vida útil|保质期|保存期限|有效期|consumo preferente)$/i;
  if (fn("dk3Model")) {
    var oMD = window.dk3Model;
    window.dk3Model = function (lang, plan, data, ph, deck, src, T) {
      var M = oMD.apply(this, arguments);
      try {
        if (!M || !lang || lang === "ja") return M;
        var W = wlab(lang), ws = ((data && data.prods) || []).map(function (q) { return q && q.warranty ? String(q.warranty) : ""; });
        var packs = Array.isArray(M.packs) ? M.packs : [];
        packs.forEach(function (pk) { (pk.facts || []).forEach(function (f) { if (f && SHELF_LAB.test(String(f.k || "").trim()) && WARR_EN.test(String(f.v || "")) && !/\d+\s*(?:months?|years?|days?)\s+(?:from|after)/i.test(String(f.v))) { f.k = W; f.ic = "shield-check"; cnt("factRelabel"); } }); });
        var w0 = ws.filter(Boolean)[0];
        if (w0 && !packs.some(function (pk) { return (pk.facts || []).some(function (f) { return f && f.k === W; }); })) {
          var pk = packs.filter(function (x) { return !x.cmp && Array.isArray(x.facts) && x.facts.length; })[0] || packs.filter(function (x) { return !x.cmp; })[0];
          if (pk) { pk.facts = pk.facts || []; var at = pk.facts.findIndex(function (f) { return f && SHELF_LAB.test(String(f.k || "")); }); var nf = { ic: "shield-check", k: W, v: w0 }; if (at >= 0) pk.facts.splice(at + 1, 0, nf); else pk.facts.push(nf); cnt("factWarr"); }
        }
      } catch (e) { err("model", e); }
      return M;
    };
  }

  /* ══════════ 訳：入力の否定・限定・材質・項目名を訳が変えたら直す（No.592・593・596・601・603） ══════════ */
  var LAB = [
    { ja: /^保証(?:期間|内容)?$/, fam: /warrant|guarante|garant|保修|保固/i, en: "Warranty", es: "Garantía", zh: "保修" },
    { ja: /^(?:賞味期限|品質保持期限)$/, fam: /shelf|best before|vida útil|保质期|consumo/i, en: "Best before", es: "Consumo preferente", zh: "保质期" },
    { ja: /^消費期限$/, fam: /use[- ]by|expir|caducidad|有效期|保质期/i, en: "Use-by date", es: "Fecha de caducidad", zh: "保质期" },
    { ja: /^(?:使用期限|有効期限|使用推奨期限)$/, fam: /use[- ]by|expir|shelf|caducidad|有效期|保质期|vida útil/i, en: "Use-by period", es: "Fecha de caducidad", zh: "有效期" },
    { ja: /^滅菌(?:の有無|方法)?$/, fam: /steril|esteril|灭菌/i, en: "Sterilization", es: "Esterilización", zh: "灭菌" },
    { ja: /^食品接触(?:・試験)?$/, fam: /food|aliment|食品/i, en: "Food contact / tests", es: "Contacto alimentario / ensayos", zh: "食品接触・检测" },
    { ja: /^保存方法$/, fam: /stor|keep|conserv|保存|储存/i, en: "Storage", es: "Conservación", zh: "保存方法" },
    { ja: /^(?:原産国|原産地|製造国)$/, fam: /origin|made in|origen|产地|原产/i, en: "Country of origin", es: "País de origen", zh: "原产国" },
    { ja: /^対象年齢$/, fam: /\bage|years|edad|年龄/i, en: "Age range", es: "Edad recomendada", zh: "适用年龄" },
    { ja: /^(?:アレルゲン|アレルギー物質|特定原材料)$/, fam: /allerg|alérg|过敏/i, en: "Allergens", es: "Alérgenos", zh: "过敏原" }
  ];
  function labFix(a, b, lang) {
    var A = NF(a).trim(); if (!A || !JA.test(A)) return null;
    for (var i = 0; i < LAB.length; i++) { var x = LAB[i]; if (x.ja.test(A) && !x.fam.test(String(b || ""))) return x[lang] || x[String(lang).slice(0, 2)] || x.en; }
    return null;
  }
  V.labFix = labFix;
  var SCOPE = [[/表面処理/, "surface treatment"], [/めっき|メッキ/, "plating"], [/塗装|塗料/, "coating"], [/本体/, "main body"], [/外装/, "exterior"], [/裏板/, "backing plate"], [/金属部/, "metal parts"], [/樹脂部/, "resin parts"], [/部品|パーツ/, "parts"], [/一部/, "some parts"], [/初期不良/, "initial defects"]];
  function scopeEN(sc) { var s = NF(sc); for (var i = 0; i < SCOPE.length; i++) if (SCOPE[i][0].test(s)) return SCOPE[i][1]; return ""; }
  var REG = /\b(REACH|RoHS|CE|FDA|UL|FCC|PSE|BPA|ISO\s?\d{3,5}|IATF\s?\d{4,5}|GMP|HACCP|FSSC\s?\d{4,5}|Halal|Kosher|CPSIA|EN\s?\d{2,5}|ASTM\s?F?\d{2,4})\b/g;
  var REG_CAN = { ROHS: "RoHS", HALAL: "Halal", KOSHER: "Kosher" };
  function regOf(s) { var m = NF(s).match(REG) || []; return m.map(function (x) { var u = x.replace(/\s+/g, " ").toUpperCase(); return REG_CAN[u] || u; }); }
  var MAT = [[/\brubber\b|\belastomer\b|\bNBR\b|\bFKM\b/i, /ゴム|ラバー|エラストマー|NBR|FKM|ACM|シリコ|\b2?RS\b|DDU/i], [/\bplastic\b|\bresin\b/i, /樹脂|プラスチック|PP|PE|PET|ナイロン|ABS|POM|PC|PVC/], [/\bpaper\b/i, /紙|ペーパー/], [/\bglass\b/i, /ガラス/], [/\bcotton\b/i, /綿|コットン/], [/\baluminu?m\b/i, /アルミ/]];
  function stripWord(b, re) {
    var t = String(b).replace(new RegExp("\\s*\\b(?:" + re.source.replace(/\\b/g, "") + ")\\b\\s*(?:seals?\\s*)?(?=\\()", "i"), "").replace(new RegExp("\\b(?:" + re.source.replace(/\\b/g, "") + ")\\b\\s*", "i"), "");
    t = t.trim().replace(/^\((.*)\)$/, "$1").replace(/\s{2,}/g, " ").replace(/^[,;\s]+/, "").trim();
    return t ? t[0].toUpperCase() + t.slice(1) : t;
  }
  function negEN(a, label, lang) {
    var L2 = String(lang || "en").slice(0, 2), R = v100neg(a), s = NF(a).trim();
    var tp = topicOf((label || "") + (R.subject || "")) || topicOf(R.subject || "") || topicOf(label || "");
    if (/^食品接触なし/.test(s)) return (TOPIC[0].flag[L2] || TOPIC[0].flag.en);
    if (tp && tp.en) return tp.en[L2] || tp.en.en;
    if (/^(?:なし|無し|ナシ|該当なし|非該当|対象外)$/.test(s)) return ({ en: "None", es: "Ninguno", zh: "无" })[L2] || "None";
    if (/不使用|使用しない|使っていない/.test(s) && R.subject) return null;
    return null;
  }
  function fixCell(a, b, label, lang, F, path) {
    var A = NF(a), B = String(b == null ? "" : b), why = [];
    if (!A.trim() || !JA.test(A)) return null;
    var out = B, L2 = String(lang || "en").slice(0, 2);
    var R = v100neg(A);
    /* 1. 否定：入力が否定なのに訳が否定でない・空 */
    if (R.neg && (!out.trim() || !ENEG.test(out))) {
      var whole = R.clauses.length === 1 || R.clauses.every(function (c) { return c.neg; });
      var tp = topicOf((label || "") + R.subject) || topicOf(R.subject) || R.subjects.map(function (x) { return topicOf(x); }).filter(Boolean)[0] || null;
      if (whole) { var ne = negEN(A, label, lang); if (ne) { out = ne; why.push("否定"); } }
      else if (tp && tp.en) {
        var t2 = out; (tp.pos || []).forEach(function (re) { t2 = t2.replace(new RegExp("[,;]?\\s*" + re.source, "gi"), ""); });
        t2 = t2.replace(/[,;\s]+$/, "").trim();
        out = (t2 ? t2 + ", " : "") + (tp.en[L2] || tp.en.en).replace(/^./, function (c) { return t2 ? c.toLowerCase() : c.toUpperCase(); });
        why.push("否定（" + tp.k + "）");
      }
    } else if (R.neg && tp0pos(A, out)) { var ne2 = negEN(A, label, lang); if (ne2) { out = ne2; why.push("否定の取り違え"); } }
    /* 保証の欄の「保証なし」は、保証の言葉で言う（「Not guaranteed」は期限の取り違えと読まれやすい） */
    else if (R.neg && L2 === "en" && /保証/.test(A + (label || "")) && R.clauses.every(function (c) { return c.neg; }) && !/warrant/i.test(out)) { out = "No warranty"; why.push("保証の言い方"); }
    /* 2. 限定：「REACH は表面処理のみ」を訳が「REACH compliant」に */
    R.lims.forEach(function (l) {
      var rg = regOf(l.subject);
      if (rg.length) {
        rg.forEach(function (g) {
          var re = new RegExp("\\b" + g.replace(/\s/g, "\\s?") + "\\b[^,;.]*", "i");
          var m = out.match(re);
          var sc = scopeEN(l.scope) || "limited scope (details on request)";
          var want = g + ": " + sc + " only";
          if (m && !EN_LIM.test(m[0])) { out = out.replace(re, want); why.push("限定（" + g + "）"); }
          else if (!m) { out = (out.trim() ? out.trim().replace(/[.;,]$/, "") + "; " : "") + want; why.push("限定（" + g + "）"); }
        });
      } else if (!EN_LIM.test(out) && L2 === "en") { var sc2 = scopeEN(l.scope); if (sc2 && out.toLowerCase().indexOf(sc2) >= 0) { out = out.replace(new RegExp(sc2, "i"), sc2 + " only"); why.push("限定"); } }
    });
    /* 3. 入力に無い規制名を訳が足した */
    var inReg = regOf(A);
    regOf(out).forEach(function (g) {
      if (inReg.indexOf(g) >= 0) return;
      if (F && F.texts.some(function (x) { return regOf(x.text).indexOf(g) >= 0; })) return;
      var re = new RegExp("[,;]?\\s*\\b" + g.replace(/\s/g, "\\s?") + "\\b[- ]?(?:compliant|compliance|certified|approved|conform\\w*)?", "i");
      var t3 = out.replace(re, "").replace(/^[,;\s]+/, "").trim(); if (t3 !== out) { out = t3; why.push("入力に無い規制名（" + g + "）"); }
    });
    /* 4. 材質：入力に無い材質（ZZ の鋼板シールドを Rubber） */
    MAT.forEach(function (mm) {
      if (mm[0].test(out) && !mm[1].test(A)) {
        var other = /鋼|鉄|金属|ZZ|シールド|SUS|ステンレス|SUJ|アルミ|樹脂|紙|木|ヒノキ|ガラス|綿/.test(A);
        if (other) { var t4 = stripWord(out, mm[0]); if (t4 && t4 !== out) { out = t4; why.push("入力に無い材質"); } }
      }
    });
    if (!why.length || out === B) return null;
    return { b: out, why: why.join("・") };
  }
  function tp0pos(A, out) {
    var R = v100neg(A); var hit = false;
    R.subjects.forEach(function (s) { var tp = topicOf(s); if (tp && (tp.pos || []).some(function (re) { return re.test(out); })) hit = true; });
    return hit;
  }
  V.fixCell = fixCell;
  function fixTr(r, lang, T) {
    var F = factsOf(T), log = [];
    var walk = function (a, b, path, label, setB) {
      if (typeof a === "string") {
        var x = fixCell(a, b, label, lang, F, path);
        if (x) { setB(x.b); log.push({ path: path, a: a.slice(0, 60), b: String(b || "").slice(0, 60), to: x.b.slice(0, 60), why: x.why }); }
        return;
      }
      if (Array.isArray(a) && Array.isArray(b)) {
        a.forEach(function (x, i) {
          var lab = label;
          if (/\.rows\.\d+$/.test(path) && i >= 1) lab = String(a[0] || "");
          if (/\.rows\.\d+$/.test(path) && i === 0 && typeof x === "string") { var lf = labFix(x, b[0], lang); if (lf && b[0] !== lf) { log.push({ path: path + ".0", a: x, b: String(b[0] || ""), to: lf, why: "項目名" }); b[0] = lf; } return; }
          if (/\.cols$/.test(path) && typeof x === "string") { var lf2 = labFix(x, b[i], lang); if (lf2 && b[i] !== lf2) { log.push({ path: path + "." + i, a: x, b: String(b[i] || ""), to: lf2, why: "項目名" }); b[i] = lf2; } return; }
          walk(x, b[i], path + "." + i, lab, function (v) { b[i] = v; });
        });
        return;
      }
      if (a && typeof a === "object" && b && typeof b === "object") {
        Object.keys(a).forEach(function (k) {
          var lab = { shelf: "賞味期限", warranty: "保証", store: "保存方法", cert: "認証", origin: "産地" }[k] || label;
          walk(a[k], b[k], path + "." + k, lab, function (v) { b[k] = v; });
        });
      }
    };
    walk(r.src, r.d, "d", "", function () { });
    if (log.length) { r.v100fact = log; cnt("trFix", log.length); lg({ k: "trFix", n: log.length, ex: log.slice(0, 6) }); try { if (typeof DK3G !== "undefined" && DK3G) DK3G.v100tr = log.slice(0, 40); } catch (e) { /* 無視 */ } }
    return log;
  }
  V.fixTr = fixTr;
  if (fn("dk3DataTr")) {
    var oDT = window.dk3DataTr;
    window.dk3DataTr = async function (lang, say, force, T) {
      var r = await oDT.apply(this, arguments);
      try { if (r && r.d && r.src && lang && lang !== "ja") fixTr(r, lang, T || curT()); } catch (e) { err("tr", e); }
      return r;
    };
  }

  /* ══════════ 未解決の気づき（No.603）・入力と食い違う主張：文章（計画）から外す ══════════ */
  var MULT = { 1.5: "(?:1\\.5\\s?(?:x|times)|one and a half times|50\\s?% (?:longer|more|higher))", 2: "(?:twice|double[sd]?|2\\s?(?:x|times)|two times|two-?fold|2-fold)", 3: "(?:three times|triple[sd]?|3\\s?(?:x|times)|three-?fold|3-fold)", 4: "(?:four times|quadruple[sd]?|4\\s?(?:x|times))", 5: "(?:five times|5\\s?(?:x|times))", 10: "(?:ten times|10\\s?(?:x|times)|ten-?fold)" };
  var TOPW = [[/寿命|長寿命|耐久|もち/, "(?:life|lifetime|lifespan|longevity|service life|durab\\w*|last\\w*)"], [/強度|強さ/, "(?:strength|strong\\w*)"], [/速|スピード/, "(?:speed|fast\\w*|quick\\w*)"], [/効果|効く/, "(?:effect\\w*|efficacy)"], [/保湿/, "(?:moistur\\w*|hydrat\\w*)"], [/吸水|吸収/, "(?:absorb\\w*)"], [/耐熱/, "(?:heat)"], [/静音|振動/, "(?:quiet\\w*|vibration|noise)"], [/除菌|殺菌/, "(?:germ\\w*|bacteri\\w*|disinfect\\w*|steril\\w*)"]];
  function noteMatchers(notes) {
    var out = [];
    (notes || []).forEach(function (n0) {
      var n = NF(n0);
      var qs = []; n.replace(/[「“"『]([^」”"』]{1,30})[」”"』]/g, function (m, a) { qs.push(a); return m; });
      var bases = qs.length ? qs : [n];
      bases.forEach(function (q) {
        var mm = q.match(/(\d+(?:\.\d+)?)\s*倍/);
        var tw = TOPW.filter(function (x) { return x[0].test(q); }).map(function (x) { return x[1]; });
        if (mm) {
          var mu = MULT[+mm[1]] || "(?:" + mm[1] + "\\s?(?:x|times))";
          out.push({ note: n0, re: new RegExp(tw.length ? "(?:" + mu + "[^.!?]{0,60}" + tw[0] + "|" + tw[0] + "[^.!?]{0,40}" + mu + ")" : mu, "i"), lab: q });
        } else if (qs.length) {
          var reg = regOf(q);
          if (reg.length) out.push({ note: n0, re: new RegExp("\\b" + reg[0].replace(/\s/g, "\\s?") + "\\b", "i"), lab: q });
          var pc = q.match(/(\d+(?:\.\d+)?)\s*(%|％)/);
          if (pc) out.push({ note: n0, re: new RegExp("\\b" + pc[1].replace(".", "\\.") + "\\s?%", "i"), lab: q });
        }
      });
    });
    return out;
  }
  V.noteMatchers = noteMatchers;
  function contraOf(txt, F) {
    var t = String(txt || "");
    if (F.zz && !F.rubber && /\brubber[- ](?:seal|seals|sealed|contact seal|lip)\b|\bseal(?:s|ed)? (?:made )?(?:of|with) rubber\b/i.test(t)) return { subj: "シール", topic: "seal", src: "zz", text: "シール：鋼板シールド（ZZ）" };
    if (F.warranty && /\b(?:shelf[- ]life|best[- ]before|expir\w*|use[- ]by)\b[^.!?]{0,40}\b(?:guarante\w*|warrant\w*)|\b(?:guarante\w*|warrant\w*)\b[^.!?]{0,30}\b(?:shelf[- ]life|best[- ]before|expir\w*)/i.test(t)) return { subj: "保証", topic: "warranty", src: "warr", text: "保証と期限の取り違え（登録は「" + String(F.warranty).slice(0, 16) + "」）" };
    for (var i = 0; i < F.negs.length; i++) {
      var n = F.negs[i]; if (!n.topic) continue;
      var tp = TOPIC.filter(function (x) { return x.k === n.topic; })[0];
      if (tp && (tp.pos || []).some(function (re) { return re.test(t); })) return n;
    }
    return null;
  }
  V.contraOf = contraOf;
  function claimKeysOfDropped(d) { var t = String((d && d.txt) || ""); return regOf(t); }
  if (fn("dk3Plan")) {
    var oPL = window.dk3Plan;
    window.dk3Plan = async function (lang, say, force, T) {
      var r = await oPL.apply(this, arguments);
      try {
        var TT = T || curT();
        if (!r || !r.plan || !lang || lang === "ja" || !TT) return r;
        var F = factsOf(TT), M = noteMatchers(F.unres), drops = [];
        var leaves = fn("dk3Leaves") ? dk3Leaves(r.plan) : [];
        leaves.forEach(function (c) {
          if (!c || !c.txt) return;
          var why = "";
          var hit = M.filter(function (m) { return m.re.test(c.txt); })[0];
          if (hit) why = "未解決の気づき「" + NF(hit.note).slice(0, 50) + "」があるため、解決するまで資料に載せません（追加ヒアリングで答えると載せられます）";
          var cn = !why && contraOf(c.txt, F);
          if (cn) why = cn.src === "warr" ? cn.text : "入力と食い違う主張（登録は「" + cn.text.slice(0, 40) + "」）";
          if (why) { drops.push({ path: c.path, txt: c.txt, why: why, v100: 1 }); }
        });
        if (drops.length) {
          drops.forEach(function (d) { try { dk3Drop(r.plan, d.path); } catch (e) { /* 無視 */ } });
          try { if (fn("dk3Compact")) dk3Compact(r.plan); } catch (e) { /* 無視 */ }
          r.dropped = (r.dropped || []).concat(drops);
          cnt("planDrop", drops.length); lg({ k: "planDrop", d: drops.map(function (x) { return x.txt.slice(0, 50) + "｜" + x.why.slice(0, 30); }) });
        }
        /* 除外の理由が入力と矛盾しない言葉に（「滅菌欄は空欄で根拠なし」→ 登録の値を書く） */
        (r.dropped || []).forEach(function (d) {
          if (!d || !d.why || d.v100) return;
          var w = NF(d.why);
          if (!/空欄|空白|未記入|未入力|記載(?:が)?(?:な|無)|根拠(?:が)?(?:な|無)|不明/.test(w)) return;
          var hitN = F.negs.filter(function (n) { return n.topic && TOPIC.some(function (tp) { return tp.k === n.topic && tp.ja.test(w); }); })[0];
          if (hitN) { d.whyAI = d.why; d.why = "入力と食い違う主張（登録は「" + hitN.text.slice(0, 40) + "」）"; cnt("whyFix"); return; }
          var lab = (w.match(/([^\s、。:：「」]{1,8})(?:欄|の欄)/) || [])[1];
          if (lab) { var tx = F.texts.filter(function (x) { return x.label && NF(x.label).indexOf(lab) >= 0; })[0]; if (tx) { d.whyAI = d.why; d.why = "登録の「" + tx.label + "：" + tx.text.replace(/^[^:]*:/, "").slice(0, 30) + "」と合わない主張"; cnt("whyFix"); } }
        });
        /* 外した文言の一覧：画面（最終チェック）に出るものと、保存した資料の控え（T.deck3.plans）をそろえる（同じ文は1つに） */
        try {
          var seen = {}; r.dropped = (r.dropped || []).filter(function (d) { var k = d ? String(d.txt || "") + "|" + String(d.why || "").slice(0, 20) : ""; if (!d || seen[k]) return false; seen[k] = 1; return true; });
          var SP = TT.deck3 && TT.deck3.plans && TT.deck3.plans[lang];
          if (SP && Array.isArray(SP.dropped) && r.dropped.length > SP.dropped.length) { SP.dropped = r.dropped.map(function (d) { return { path: d.path, txt: d.txt, why: d.why }; }); cnt("dropSync"); }
        } catch (e) { err("dropsync", e); }
        /* 外した主張（規制名）を控える：表・ノートでも同じ扱いにする（No.601） */
        V.dropRegs = [];
        (r.dropped || []).forEach(function (d) { claimKeysOfDropped(d).forEach(function (g) { if (V.dropRegs.indexOf(g) < 0) V.dropRegs.push(g); }); });
      } catch (e) { err("plan", e); }
      return r;
    };
  }

  /* ══════════ 照合の AI の答え：入力の否定が根拠になる主張を「根拠に無い」としない／入力と食い違う主張は外す（No.594・603） ══════════ */
  function freeCons(txt) {
    var out = [];
    try { if (typeof V98DK_CON !== "undefined" && Array.isArray(V98DK_CON)) V98DK_CON.forEach(function (c) { if (c && c.re && c.v99free && c.re.test(txt)) out.push(c); }); } catch (e) { /* 無視 */ }
    return out;
  }
  function freeSupported(c, F, blocks) {
    var tk = { preserv: "preserv", paraben: "paraben", fragrance: "fragrance", colorant: "colorant", alcohol: "alcohol", additive: "additive", gluten: "gluten", grain: "grain" }[c.k];
    var negHit = tk ? F.negs.filter(function (n) { return n.topic === tk; })[0] : null;
    var ev = null;
    Object.keys(blocks).forEach(function (id) {
      if (ev) return;
      var b = blocks[id];
      var m = c.ev ? b.match(c.ev) : null;
      if (m && m[0] && m[0].length >= 4) { ev = { id: id, t: m[0] }; return; }
      if (negHit) {
        var cand = [negHit.text].concat(splitTop(negHit.text));
        for (var i = 0; i < cand.length; i++) { var x = cand[i].trim(); if (x.length >= 4 && b.indexOf(x) >= 0 && v100neg(x).neg) { ev = { id: id, t: x }; return; } }
      }
    });
    return (negHit || ev) ? ev : null;
  }
  function fixVerify(q, r) {
    var t = String((r && r.txt) || "");
    var j = null;
    try { j = (typeof xParseJson === "function") ? xParseJson(t) : JSON.parse(t.replace(/```json|```/g, "").match(/\{[\s\S]*\}/)[0]); } catch (e) { return r; }
    if (!j || !Array.isArray(j.v)) return r;
    var cl = {}, sec = q.split("=== 主張 ===")[1] || ""; sec = sec.split("=== 根拠 ===")[0];
    sec.split("\n").forEach(function (line) { var m = line.match(/^(\d+)\. \[([^\]]*)\] (.*)$/); if (m) cl[+m[1]] = m[3]; });
    var blocks = {}, cp = q.split("=== 根拠 ===")[1] || "";
    cp.split(/\n(?=【[A-Z]\d+】)/).forEach(function (x) { var m = x.match(/^\s*【([A-Z]\d+)】[^\n]*\n([\s\S]*)$/); if (m) blocks[m[1]] = m[2]; });
    var T0 = curT(), F = factsOf(T0), M = noteMatchers(F.unres), ch = 0;
    j.v.forEach(function (x) {
      var txt = cl[+x.n]; if (!x || !txt) return;
      if (x.ok === false) {
        var cs = freeCons(txt);
        if (!cs.length) return;
        var rest = txt; cs.forEach(function (c) { rest = rest.replace(new RegExp(c.re.source, "gi"), " "); });
        if (/\d/.test(rest) || rest.replace(/[^A-Za-z]+/g, " ").trim().split(/\s+/).filter(function (w) { return w.length > 2 && !/^(and|with|the|for|our|formula|recipe|made|from|free|gentle|skin|care|serum|product|products)$/i.test(w); }).length > 3) return;
        var evs = cs.map(function (c) { return freeSupported(c, F, blocks); });
        if (evs.every(Boolean)) {
          x.okAI = false; x.whyAI = x.why; x.ok = true; x.blk = evs[0].id; x.ev = evs.map(function (e) { return e.t; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).join("｜"); x.why = "";
          ch++; lg({ k: "verifyUndrop", txt: txt.slice(0, 60), ev: x.ev.slice(0, 60) });
        }
      } else if (x.ok === true) {
        var hit = M.filter(function (m) { return m.re.test(txt); })[0];
        var cn = !hit && contraOf(txt, F);
        if (hit) { x.ok = false; x.why = "未解決の気づき（" + String(hit.lab).slice(0, 14) + "）"; ch++; }
        else if (cn) { x.ok = false; x.why = cn.src === "warr" ? cn.text : "入力と食い違う（" + cn.text.slice(0, 14) + "）"; ch++; }
      }
    });
    if (!ch) return r;
    cnt("verifyFix", ch);
    return Object.assign({}, r, { txt: JSON.stringify(j) });
  }
  V.fixVerify = fixVerify;
  if (fn("llmAsk")) {
    var oAsk = window.llmAsk;
    var askW = async function (q, maxTok, opts) {
      var r = await oAsk.apply(this, arguments);
      try { if (opts && /ファクトチェッカー/.test(String(opts.sys || "")) && typeof q === "string" && q.indexOf("=== 主張 ===") >= 0 && r && r.txt) r = fixVerify(q, r); } catch (e) { err("ask", e); }
      return r;
    };
    askW.__v100fact = 1;
    window.llmAsk = askW;
  }

  /* ══════════ 根拠の照らし（21.98 の主張の単位）：入力の否定（追加ヒアリングの答え・「いいえ」も）を根拠として数える（No.594） ══════════ */
  if (fn("v98dkEv")) {
    var oEv = window.v98dkEv;
    window.v98dkEv = function (C) {
      var E = oEv.apply(this, arguments);
      try {
        if (!E || !E.cons || E.__v100) return E;
        var F = factsOf(curT());
        Object.keys(E.cons).forEach(function (k) {
          if (E.cons[k] !== false) return;
          var tk = { preserv: "preserv", paraben: "paraben", fragrance: "fragrance", colorant: "colorant", alcohol: "alcohol", additive: "additive", gluten: "gluten", grain: "grain" }[k];
          if (tk && F.negs.some(function (n) { return n.topic === tk; })) { E.cons[k] = true; cnt("evNeg"); }
        });
        try { Object.defineProperty(E, "__v100", { value: 1, enumerable: false }); } catch (e) { /* 無視 */ }
      } catch (e) { err("ev", e); }
      return E;
    };
  }

  /* ══════════ No.553：入力していない表現の種類を足す（獣医師推奨・皮膚科医テスト済み・臨床で実証 など） ══════════ */
  try {
    var NEGJ = "(?:不使用|無添加|なし|無し|ゼロ|フリー|を?含ま(?:ない|ず)|使(?:用し|っ)?(?:てい)?(?:ない|ません|わない|わず))";
    var ADD = [
      { k: "vet", ja: "獣医師推奨", re: /\bvet(?:erinarian)?[- ](?:recommended|approved|formulated|endorsed|developed)\b|\brecommended by (?:vets|veterinarians)\b|\bveterinarian[- ]recommended\b/i, ev: /獣医(?:師)?(?:が|の)?(?:推奨|監修|すすめ|勧め|開発|推薦)|vet(?:erinarian)?[- ](?:recommended|approved)/i },
      { k: "derm", ja: "皮膚科医テスト済み", re: /\bdermatolog(?:ist|ically)[- ](?:tested|approved|recommended)\b/i, ev: /皮膚科(?:医|専門医)?(?:の)?(?:テスト|試験|監修|推奨)|パッチテスト|dermatolog/i },
      { k: "clinical", ja: "臨床で実証", re: /\bclinically[- ](?:proven|tested|shown)\b|\bclinical(?:ly)? (?:trials?|studies) (?:show|prove)\b/i, ev: /臨床(?:試験|研究|で)|clinical/i },
      { k: "nontoxic", ja: "無毒", re: /\bnon[- ]toxic\b|\btoxin[- ]free\b/i, ev: /無毒|毒性(?:が)?(?:ない|なし)|non[- ]toxic/i },
      { k: "bpa", ja: "BPAフリー", re: /\bBPA[- ]free\b/i, ev: new RegExp("BPA(?:フリー|[^。\\n]{0,8}" + NEGJ + ")|ビスフェノール[^。\\n]{0,8}" + NEGJ, "i") },
      { k: "vegan", ja: "ヴィーガン", re: /\bvegan\b|\bplant[- ]based only\b/i, ev: /ヴィーガン|ビーガン|vegan|動物性(?:原料|成分)?[^。\n]{0,6}(?:不使用|なし|無し)/i },
      { k: "cruelty", ja: "動物実験なし", re: /\bcruelty[- ]free\b|\bnot tested on animals\b/i, ev: /動物実験[^。\n]{0,8}(?:なし|していない|しません|不実施)|cruelty[- ]free/i },
      { k: "adoptCare", ja: "保育園・幼稚園での採用実績", re: /\b(?:trusted|used|adopted|chosen|loved|recommended|preferred|popular|relied on)\b[^.!?]{0,30}\b(?:by|in|at|among|with)\b[^.!?]{0,30}\b(?:daycare|day-care|day care|nurser(?:y|ies)|kindergartens?|pre-?schools?|childcare)\b/i, ev: /保育|託児|幼稚園|こども園|daycare|day care|nurser(?:y|ies)|kindergarten/i },
      { k: "adoptMed", ja: "病院・医療機関での採用実績", re: /\b(?:trusted|used|adopted|chosen|recommended|preferred|relied on)\b[^.!?]{0,30}\b(?:by|in|at|among)\b[^.!?]{0,30}\b(?:hospitals?|clinics?|medical (?:institutions?|facilities)|care homes?|nursing homes?)\b/i, ev: /病院|クリニック|医療機関|介護施設|老人ホーム|hospital|clinic/i },
      { k: "adoptPro", ja: "ホテル・飲食店・サロンなどプロの採用実績", re: /\b(?:trusted|used|adopted|chosen|loved|recommended|preferred|relied on)\b[^.!?]{0,30}\b(?:by|in|at|among)\b[^.!?]{0,30}\b(?:hotels?|restaurants?|chefs?|salons?|spas?|professionals?|beauticians?|groomers?|pet shops?|schools?)\b/i, ev: /ホテル|旅館|レストラン|飲食店|シェフ|料理人|サロン|美容室|エステ|スパ(?!イス)|プロ(?:の|用|向け|仕様)|専門家|トリマー|ペットショップ|学校|hotel|restaurant|salon|professional/i },
      { k: "sugar", ja: "砂糖不使用", re: /\bsugar[- ]free\b|\bno (?:added )?sugar\b/i, ev: new RegExp("(?:砂糖|糖類|甘味料)[^。\\n]{0,8}" + NEGJ + "|sugar[- ]free", "i") }
    ];
    if (typeof V98DK_CON !== "undefined" && Array.isArray(V98DK_CON)) ADD.forEach(function (c) { if (!V98DK_CON.some(function (x) { return x.k === c.k; })) V98DK_CON.push({ k: c.k, ja: c.ja, re: c.re, ev: c.ev, v99free: 1, v100: 1 }); });
    if (typeof V99DK_FREE !== "undefined" && Array.isArray(V99DK_FREE)) ADD.forEach(function (c) { if (!V99DK_FREE.some(function (x) { return x.k === c.k; })) V99DK_FREE.push(c); });
    if (typeof V98DK_CONJA !== "undefined") ADD.forEach(function (c) { V98DK_CONJA[c.k] = c.ja; });
  } catch (e) { err("free", e); }

  /* ══════════ 組み上がった資料の全部の文字（表・ノートも）を入力と突き合わせて直す（安全網） ══════════ */
  function sents(s) { try { if (typeof v98dkSents === "function") return v98dkSents(s); } catch (e) { /* 無視 */ } return String(s).split(/(?<=[.!?])\s+/); }
  function fixText(t, F, M, lang, ctx) {
    var s = String(t == null ? "" : t), why = [];
    if (!s.trim()) return null;
    var o = s;
    if (F.food === false) {
      o = o.replace(/\bfood\s*contact\s*[:：]\s*(?:yes|applicable)\b/gi, function () { why.push("食品接触"); return "Food contact: no"; }).replace(/接触食品(?!.*不)/g, function (m) { why.push("食品接触"); return "不接触食品"; }).replace(/Contacto con alimentos:\s*s[ií]\b/gi, function () { why.push("食品接触"); return "Contacto con alimentos: no"; });
    }
    if (F.zz && !F.rubber && /\brubber\b/i.test(o) && /\bZZ\b|shield|steel/i.test(o)) { var o2 = stripWord(o, /\brubber\b/i); if (o2 && o2 !== o) { o = o2; why.push("シールの材質（ZZ＝鋼板シールド）"); } }
    F.lims.forEach(function (l) {
      regOf(l.subj).forEach(function (g) {
        var re = new RegExp("\\b" + g.replace(/\s/g, "\\s?") + "\\b[- ]?(?:compliant|compliance|conform\\w*|certified|approved)", "gi");
        var re2 = new RegExp("\\b(?:compliant|compliance|conform\\w*) (?:with|to) " + g.replace(/\s/g, "\\s?") + "\\b", "gi");
        var sc = scopeEN(l.scope);
        if ((re.test(o) || re2.test(o)) && !new RegExp(g + "[^.;]{0,40}\\bonly\\b", "i").test(o)) {
          o = o.replace(re, g + ": " + (sc || "limited scope") + " only").replace(re2, g + ": " + (sc || "limited scope") + " only"); why.push("限定（" + g + "）");
        }
      });
    });
    var parts = sents(o), keep = [], dropped = false;
    parts.forEach(function (x) {
      var hit = M.filter(function (m) { return m.re.test(x); })[0];
      var cn = !hit && contraOf(x, F);
      if (hit && ctx !== "label") { dropped = true; why.push("未解決の気づき（" + String(hit.lab).slice(0, 12) + "）"); return; }
      if (cn && ctx !== "label" && !/food\s*contact\s*:\s*no/i.test(x)) { dropped = true; why.push("入力と食い違う（" + cn.text.slice(0, 12) + "）"); return; }
      keep.push(x);
    });
    if (dropped) o = keep.join(" ");
    if (o === s) return null;
    return { t: o, why: why.join("・") };
  }
  V.fixText = fixText;
  function sweep(deck, T) {
    var F = factsOf(T), M = noteMatchers(F.unres), lang = deck.lang, log = [];
    var W = wlab(lang);
    (deck.slides || []).forEach(function (S, si) {
      var els = (S.els || []).filter(function (e) { return e && e.k === "text" && Array.isArray(e.ps); });
      var txtOf = function (e) { return e.ps.map(function (p) { return (p.r || []).map(function (r) { return r && r.t != null ? String(r.t) : ""; }).join(""); }).join("\n"); };
      els.forEach(function (e) {
        var ch = false;
        e.ps.forEach(function (p) {
          var rs = (p.r || []).filter(function (r) { return r && typeof r.t === "string"; });
          if (!rs.length) return;
          var full = rs.map(function (r) { return r.t; }).join("");
          var x = fixText(full, F, M, lang, "");
          if (!x) return;
          var one = rs.filter(function (r) { var y = fixText(r.t, F, M, lang, ""); return !!y; });
          if (one.length && rs.every(function (r) { var y = fixText(r.t, F, M, lang, ""); return !y || true; }) && fixText(rs.map(function (r) { var y = fixText(r.t, F, M, lang, ""); return y ? y.t : r.t; }).join(""), F, M, lang, "") == null) {
            rs.forEach(function (r) { var y = fixText(r.t, F, M, lang, ""); if (y) r.t = y.t; });
          } else { rs[0].t = x.t; for (var i = 1; i < rs.length; i++) rs[i].t = ""; }
          log.push({ si: si + 1, a: full.slice(0, 70), b: x.t.slice(0, 70), why: x.why }); ch = true;
        });
        if (ch) { try { delete e.mh; } catch (z) { /* 無視 */ } }
      });
      /* 項目名と値が別の枠のとき：「Shelf life」の隣が保証の文 →「Warranty」／「Sterilization」の隣が空 → 入力の値 */
      els.forEach(function (e) {
        var lab = txtOf(e).trim();
        if (!SHELF_LAB.test(lab) && !/^steril/i.test(lab)) return;
        var cand = els.filter(function (z) { return z !== e && Math.abs((z.y || 0) - (e.y || 0)) < 6 && (z.x || 0) > (e.x || 0); }).sort(function (a2, b2) { return (a2.x || 0) - (b2.x || 0); })[0]
          || els.filter(function (z) { return z !== e && Math.abs((z.x || 0) - (e.x || 0)) < 6 && (z.y || 0) > (e.y || 0) && (z.y || 0) - (e.y || 0) < 60; }).sort(function (a2, b2) { return (a2.y || 0) - (b2.y || 0); })[0];
        if (!cand) return;
        var val = txtOf(cand).trim();
        if (SHELF_LAB.test(lab) && WARR_EN.test(val)) { var r0 = e.ps[0].r[0]; if (r0) { r0.t = W; e.ps[0].r.slice(1).forEach(function (r) { r.t = ""; }); log.push({ si: si + 1, a: lab, b: W, why: "保証を期限の欄に（項目名）" }); } }
        if (/^steril/i.test(lab) && !val && F.steril === "non") { var r1 = cand.ps[0] && cand.ps[0].r && cand.ps[0].r[0]; if (r1) { r1.t = TOPIC[1].en[String(lang).slice(0, 2)] || "Non-sterile"; log.push({ si: si + 1, a: lab + "（空欄）", b: r1.t, why: "滅菌：なし" }); } }
      });
      if (S.notes) { var xn = fixText(S.notes, F, M, lang, ""); if (xn) { S.notes = xn.t; log.push({ si: si + 1, a: "notes", b: xn.t.slice(0, 60), why: xn.why }); } }
    });
    deck.v100fact = log;
    if (log.length) { cnt("sweep", log.length); lg({ k: "sweep", n: log.length, ex: log.slice(0, 8) }); }
    try { if (typeof DK3G !== "undefined" && DK3G) DK3G.v100sweep = log.slice(0, 40); } catch (e) { /* 無視 */ }
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

  /* ══════════ 成分表の答えに混ざった「〜は含まない」を成分の行にしない（out の担当からの申し送り・No.594 と同じ種類） ══════════
     D のヒアリングで「全成分：水（Water）、…　防腐剤は含まない」と答えると、「防腐剤は含まない」が成分の1行として登録され、
     資料の INCI 表・商品情報・規制（成分の照合）に「成分」として出ていた。否定の文は成分ではなく「不使用の主張」として
     追加ヒアリングの答えと同じ所（TEN.extraQA）に移す（AI の根拠＝No.594 の Preservative-free の根拠になる）。表の頭の「全成分（…）：」も外す。 */
  var ING_COLS = /表示名称|INCI|成分|原材料|配合|ingredient/i;
  var STMT_NEG = /(?:は|を|が|も)\s*(?:含|使|配合|入|添加)[ぁ-ん]*(?:ない|ません|せず|ず)|不使用|無添加|無配合|非配合|フリー$|free$|を?使用(?:していない|しておりません|しません)/i;
  var HEAD_LAB = /^(?:全成分|配合成分|全成分表示)\s*(?:[（(][^）)]*[）)])?\s*[:：]\s*/i;
  function negRow(cols, r) {
    if (!Array.isArray(r)) return false;
    var L = NF(r[0] || "").trim(), rest = r.slice(1).map(function (x) { return NF(x || "").trim(); }).filter(function (x) { return x && x !== "-" && x !== "—"; });
    var ingT = Array.isArray(cols) && cols.some(function (c) { return ING_COLS.test(NF(c)); });
    var stmtL = L && !/[:：]/.test(L) && STMT_NEG.test(L) && v100neg(L).neg;
    if (stmtL && (!rest.length || rest.every(function (x) { return v100neg(x).neg || x === L; }))) return L;
    if (ingT) { var hit = r.map(function (x) { return NF(x || "").trim(); }).filter(function (x) { return x && STMT_NEG.test(x) && v100neg(x).neg && !/[:：]/.test(x); })[0]; if (hit && r.filter(function (x) { return String(x || "").trim(); }).length <= 2) return hit; }
    return false;
  }
  V.negRow = negRow;
  function moveNegRows(t) {
    var moved = [];
    try {
      if (!t || !Array.isArray(t.compRows) || !t.compRows.length) return moved;
      var cols = t.compCols;
      var keep = [];
      t.compRows.forEach(function (r) { var st = negRow(cols, r); if (st) moved.push(st); else keep.push(r); });
      /* 表の頭の「全成分（表示名称／INCI名）：水」 → 「水」 */
      if (keep[0] && Array.isArray(keep[0]) && Array.isArray(cols) && cols.some(function (c) { return /表示名称|INCI/i.test(NF(c)); }) && HEAD_LAB.test(NF(keep[0][0] || ""))) { var r0 = keep[0].slice(); r0[0] = NF(r0[0]).replace(HEAD_LAB, "").trim(); keep[0] = r0; t.compRows = keep; cnt("headLab"); }
      if (moved.length) {
        t.compRows = keep;
        t.extraQA = Array.isArray(t.extraQA) ? t.extraQA : [];
        moved.forEach(function (st) { if (!t.extraQA.some(function (x) { return x && NF(x.a) === NF(st); })) t.extraQA.push({ q: "成分・材質の答えに書かれた補足（不使用の主張）", a: st, v100: 1 }); });
        cnt("negRowMove", moved.length); lg({ k: "negRow", moved: moved });
      }
    } catch (e) { err("negrow", e); }
    return moved;
  }
  V.moveNegRows = moveNegRows;
  /* ══════════ 項目名が値に入る（「会社名：架空ブレーキ工業株式会社」）：AI なしの取り込みでも外す（21.99.3 の回帰の洗い出しから） ══════════
     その項目の名前の言い方だけを外す（「保証：なし」のように意味のある頭は外さない。期限・保存・成分表は対象外） */
  var FLD_LAB = { co: "会社名|社名|企業名|会社|メーカー名|製造者名?|販売者名?", coEn: "英文社名|英語社名|英文会社名|英語の社名|company name", item: "商品名|品名|製品名|商品", itemEn: "英文商品名|英語商品名|英文品名|product name",
    sku: "品番|型番|商品コード|製品コード|JAN|SKU", hs: "HSコード|HS ?code|HS|関税番号", origin: "原産地|原産国|産地|製造国", cat: "カテゴリー?|分類|業種|商材カテゴリー?", moq: "MOQ|最小ロット|最低発注数量?|最小発注数量?",
    lead: "リードタイム|納期", ctn: "入数|ケース入数|カートン入数|梱包入数", pol: "仕出港|積出港|出荷港", pay: "支払条件|支払い条件|決済条件", term: "取引条件|インコタームズ|貿易条件", cert: "認証|取得認証|認証・規格" };
  function stripLabels(t) {
    var ch = [];
    try {
      if (!t) return ch;
      Object.keys(FLD_LAB).forEach(function (k) {
        var v = t[k]; if (typeof v !== "string" || !v) return;
        var re = new RegExp("^\\s*[【\\[［(（]?(?:" + FLD_LAB[k] + ")[】\\]］)）]?\\s*[:：=＝]\\s*(.+)$", "i");
        var m = v.match(re);
        if (m && m[1].trim() && !re.test(m[1])) { t[k] = m[1].trim(); ch.push(k); }
      });
      if (ch.length) { cnt("labStrip", ch.length); lg({ k: "labStrip", f: ch }); }
    } catch (e) { err("labstrip", e); }
    return ch;
  }
  V.stripLabels = stripLabels;

  if (fn("applyAnswer")) {
    var oAA = window.applyAnswer;
    window.applyAnswer = function (t, k, raw) {
      var ok = oAA.apply(this, arguments);
      try { if (ok && t && k === "compRows") moveNegRows(t); if (ok && t && FLD_LAB[k]) stripLabels(t); } catch (e) { err("aa", e); }
      return ok;
    };
  }
  if (fn("saveTen")) {
    var oST = window.saveTen;
    window.saveTen = function () {
      try { var T0 = (typeof TEN !== "undefined") ? TEN : null; if (T0) { stripLabels(T0); if (Array.isArray(T0.compRows) && T0.compRows.length) moveNegRows(T0); } } catch (e) { err("save", e); }
      return oST.apply(this, arguments);
    };
  }

  /* ══════════ 規制の画面：「食品に触れる部材なし」を食品接触材の対象と読まない（No.592 と同じ種類・ほかの画面） ══════════ */
  if (fn("v68regFC")) {
    var oFC = window.v68regFC;
    window.v68regFC = function (p) {
      var r = oFC.apply(this, arguments);
      try {
        if (r === true && p) {
          var F = factsOf(p);
          var pos = (Array.isArray(p.v68comp) ? p.v68comp : []).some(function (x) { return x && x.food === true && !foodNegText(String(x.mat || "") + " " + String(x.part || "")); });
          var fx = (Array.isArray(p.compRows) ? p.compRows : []).some(function (row) { return Array.isArray(row) && /食品(?:に|と)?(?:直接)?(?:触れる|接触する)(?!部材なし|部分なし|ものなし)/.test(row.join(" ")) && !foodNegText(row.join(" ")); });
          if (F.food === false && F.foodGlobal && !fx && !(pos && !F.foodGlobal)) { cnt("regFC"); return false; }
        }
      } catch (e) { err("regFC", e); }
      return r;
    };
  }

  /* ══════════ 外した理由の訳（英・中・西）：この層が書く理由 ══════════ */
  var WHY_TR = [
    [/^未解決の気づき「([\s\S]*?)」があるため、解決するまで資料に載せません（追加ヒアリングで答えると載せられます）$/, { en: "open AI note “$1”: not shown until it is resolved (answer it in the follow-up questions)", zh: "AI 提示“$1”尚未解决：解决前不放入资料（在追加询问中回答即可）", es: "nota de la IA pendiente «$1»: no se incluye hasta resolverla (responda en las preguntas de seguimiento)" }],
    [/^入力と食い違う主張（登録は「([\s\S]*?)」）$/, { en: "contradicts your input (registered as “$1”)", zh: "与输入不符（登记为“$1”）", es: "contradice lo registrado («$1»)" }],
    [/^登録の「([\s\S]*?)」と合わない主張$/, { en: "does not match the registered “$1”", zh: "与登记的“$1”不符", es: "no coincide con lo registrado «$1»" }],
    [/^AIの根拠確認：未解決の気づき（([\s\S]*?)）$/, { en: "AI evidence check: open AI note ($1)", zh: "AI 依据确认：未解决的提示（$1）", es: "revisión de fuentes por IA: nota pendiente ($1)" }],
    [/^(?:AIの根拠確認：)?保証と期限の取り違え（登録は「([\s\S]*?)」）$/, { en: "warranty mistaken for shelf life (registered as “$1”)", zh: "将保修误当作保质期（登记为“$1”）", es: "garantía confundida con la vida útil (registrado como «$1»)" }],
    [/^AIの根拠確認：入力と食い違う（([\s\S]*?)）$/, { en: "AI evidence check: contradicts your input ($1)", zh: "AI 依据确认：与输入不符（$1）", es: "revisión de fuentes por IA: contradice lo registrado ($1)" }]
  ];
  function whyTr(w, l) { for (var i = 0; i < WHY_TR.length; i++) { var m = String(w).match(WHY_TR[i][0]); if (m) { var t = WHY_TR[i][1][l]; if (t) return t.replace("$1", m[1] || ""); } } return null; }
  V.whyTr = whyTr;
  if (fn("i13Why")) {
    var oIW = window.i13Why;
    window.i13Why = function (w, l) { try { var x = whyTr(w, l); if (x != null) return x; } catch (e) { err("whytr", e); } return oIW.apply(this, arguments); };
  }

  /* ══════════ 資料の中の食い違いを見つける検査（試験の道具・画面からも呼べる） ══════════ */
  V.audit = function (texts, T) {
    var F = factsOf(T || curT()), M = noteMatchers(F.unres), out = [];
    (texts || []).forEach(function (s, i) {
      s = String(s || "");
      if (/no parts in contact with food|non-food-contact/i.test(s) && /food\s*contact\s*:\s*yes/i.test(s)) out.push({ i: i, k: "negpos", t: s.slice(0, 90) });
      if (F.food === false && /food\s*contact\s*:\s*yes/i.test(s)) out.push({ i: i, k: "food", t: s.slice(0, 90) });
      if (/^(?:shelf life|best before|use[- ]by(?: period)?)\s*[:：]?\s*/i.test(s.trim()) && WARR_EN.test(s.replace(/^[^:：]*[:：]/, ""))) out.push({ i: i, k: "warrShelf", t: s.slice(0, 90) });
      var cn = contraOf(s, F); if (cn) out.push({ i: i, k: "contra:" + cn.topic, t: s.slice(0, 90) });
      M.forEach(function (m) { if (m.re.test(s)) out.push({ i: i, k: "unres", t: s.slice(0, 90) }); });
      F.lims.forEach(function (l) { regOf(l.subj).forEach(function (g) { if (new RegExp("\\b" + g + "[- ]?compliant|compliant with " + g, "i").test(s) && !new RegExp(g + "[^.;]{0,40}only", "i").test(s)) out.push({ i: i, k: "lim:" + g, t: s.slice(0, 90) }); }); });
      if (F.zz && !F.rubber && /\brubber\b/i.test(s)) out.push({ i: i, k: "rubber", t: s.slice(0, 90) });
    });
    return out;
  };
})();
