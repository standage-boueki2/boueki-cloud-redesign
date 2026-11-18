/* ═══ v21.98 reg（2026-11-18 第11回相当 UAT・21.97.2 に対して）規制の手続きを、商品カテゴリーと「医療機器かどうか」で絞る（中身。見せ方は rd_v98reg.js）
   土台・前の層（v95〜v97）は書き換えず、前の関数を控えてから包む（この層は v97 の後に読まれる＝いちばん外側）。
   No.518（未解消・3回目）B 除菌スプレー（「医療機器ではありません」と答えた）・E マスク（医療・衛生用品→日用雑貨）に、医療機器の手続きが出続ける
     再現（直す前 /L-.html）：ヒアリングでカテゴリー「医療・衛生用品」・HS 3808.94・構成・規格表の問い（「クラス分類（一般医療機器など）…を教えてください」）に
           「…／分類：医療機器ではありません」と答えると、販売先分析・規制を調べる・営業資料の市場の表に ISO13485証明書・HSA 医療機器の製品登録（クラスB〜D）・
           輸入者のディーラーライセンス（HSA）・医療機器の輸出証明（自由販売証明・CFS）・TFDA 医療機器・FDA 機器リスティング・510(k)・米国代理人 が出る。滅菌証明書だけ外れる。
     原因：① 本人の答えがどこにも残らない。構成・規格表の問いに「分類：医療機器ではありません」と答えると、ヒアリングは「分類：」を商材カテゴリの指示とみなして
             「カテゴリはもう登録されているため、そのままにしました」と答え、文を捨てる（TEN のどのキーにも入らない）。「分類：」を付けなければ
             構成・規格表の行の中身に混ざる（例：内容液「次亜塩素酸水／医療機器ではありません」）、認証の問いで答えれば TEN.cert に入る。どれも、規制の判定は読んでいない。
           ② 規制の判定は「医療機器か」を、カテゴリー「医療・衛生用品」だけで決めていた（v68indOf → meddev・v68regInd（131249 行）がそのまま meddev）。
             ここから、カテゴリーのひな形（RD2.medical：ISO13485証明書・滅菌証明書・タイFDA医療機器登録・MOHAP 登録など）、
             v68regAdj の医療機器の枝（V68REG_MD：HSA の製品登録・ディーラーライセンス・TFDA・FDA 807・510(k)）、v92 の層（kind().meddev：医療機器の輸出証明・米国代理人、
             書類の判断の表を HS 9018 に読み替えて当てる「区分（医療機器）から当てはめ」）、AI に渡す事実（v68regFactTxt の「業種：医療機器」）が、全部出ていた。
           ③ 21.96 で滅菌証明書だけ外れたのは、v68regAdj の医療機器の枝が「品名・構成表に滅菌の語が無ければ滅菌証明書を外す」（131401 行）作りだったから。
             21.96 の No.518 の直し（v96 cty の regsFor の包み）は、食品接触材の注記を外すだけで、医療機器かどうかは見ていなかった＝ほかは外れなかった。
           ④ E は、カテゴリーを日用雑貨に変える前に作った販売先分析（保存した s.rec の facts・リスクの文）・国別戦略・AI 詳細調査の控えに、医療機器の手続きが残る。
             新しく作り直すまで、画面はその保存した値を出す。
     直し：「医療機器か」を1か所で決める（V98REG.md：本人の答え〔この画面のボタン・ヒアリングの答え・登録の文〕→ カテゴリー「医療機器」→ 登録の HS
           〔医療機器の項 9018〜9022・3005・3006 など〕・品名〔滅菌・ガーゼ・注射器・血圧計など〕→ カテゴリー「医療・衛生用品」で HS が化学品・衛生用品の項〔28〜38類・4818・9619〕
           → ほかのカテゴリー＝医療機器ではない）。手続きの名前が、どの分野（医療機器・医薬品・化粧品・食品）の手続きかを見分け（V98REG.tags）、
           商品がその分野に当たるか（V98REG.doms：カテゴリー・HS・医療機器の判定）で、出してよいかを決める関数を1つにする（window.v98regAllowed(TEN, 手続き)）。
           すべての画面と資料が通る入口で、この関数を通す：
             ・v68regInd（業種の判定）：医療機器ではない商品は meddev にしない → v68regAdj・v92 の層・書類の判断の表の「区分（医療機器）から当てはめ」・AI に渡す事実が医療機器の扱いをしない。
             ・regsFor（規制の表＝規制を調べる・販売先分析の国の事実・営業資料の市場の表・AI 相談の事実・書類の必要書類のもと）：いちばん外側で、出してはいけない手続きと注記を外す。
             ・v85docRuleHit（書類の判断の表＝販売先分析の点数の内訳・推奨の国の詳細の必要書類・規制の画面の「確かめる点」・書類をつくる）：当たらない分野の行は当てない。
               v85docHsProv：医療機器ではない商品に、区分から HS「90」を推定しない。
             ・保存した販売先分析・国別戦略：表示のときに同じ関数で外す（facts の必要書類・注記・リスクの文）。
             ・AI 詳細調査：依頼に「医療機器ではない（本人の答え）・医療機器の手続きは挙げない」を足す。前の調査の控えは、表示のときに医療機器の手続きの行を隠す（rd）。
             ・ヒアリング：答えに「医療機器ではありません」などがあれば、どの問いへの答えでも TEN.v98md に控え、会話に「控えました」と出す（吸収）。
           規制を調べる画面に「医療機器かどうか」の欄を出し、判定と理由・選び直しのボタンを置く（rd）。
   No.541（中）A 有機味噌の販売先分析で、台湾の規制欄に「化粧品の製品登録（この商品・この国で必須）」
     再現：A（食品・HS 2103.90）で販売先分析 → 台湾の内訳・推奨の国の詳細の必要書類に「台湾 TFDA の輸入査験・化粧品の製品登録（この商品・この国で必須）」。
     原因：書類の判断の表（V85DOC_D）の書類 TW_TFDA の名前が、食品の行（r099：食品・食品用の器具・容器の輸入査験）と化粧品の行（r135：化粧品の製品登録・PIF）の
           2つを1つにまとめた名前だった。食品の行が当たると、まとめた名前（化粧品の製品登録を含む）がそのまま出た。UAE の AE_REG（食品・化粧品の登録）も同じ作り。
     直し：まとめた名前の書類は、商品の分野で名前を分ける（食品：「台湾 TFDA の輸入査験（食品・食品用の器具・容器）」／化粧品：「台湾 TFDA 化粧品の製品登録（PIF の作成・保管）」）。
           名前を読むところ（V85DOC_D.docs）を、その時の商品で名前を返す形にする＝どの画面でも同じ名前。分野の違う手続き（食品に化粧品・医療機器、化粧品に食品の登録、
           玩具に食品の衛生証明 など）は、上の v98regAllowed で出さない。
   同期サーバーは変えない（TEN に v98md を足すだけ＝商品のデータと一緒に保存される）。 */
var V98REG = window.V98REG = { v: "21.98", err: null, errs: [], n: { cut: 0, warn: 0, ind: 0, rule: 0, prov: 0, rec: 0, deep: 0, hear: 0, ai: 0, nm: 0 } };
(function () {
  "use strict";
  const W = window;
  const err = (k, e) => { try { const m = k + ": " + String((e && e.message) || e).slice(0, 160); V98REG.err = m; V98REG.errs.push(m); if (V98REG.errs.length > 40) V98REG.errs.shift(); } catch (x) { /* 記録だけ */ } };
  V98REG.errf = err;
  const lang = () => { try { const el = document.getElementById("lang"); const l = String((typeof I18N !== "undefined" && I18N && I18N.lang) || (el && el.value) || "ja"); return /^en/.test(l) ? "en" : /^zh/.test(l) ? "zh" : /^es/.test(l) ? "es" : "ja"; } catch (e) { return "ja"; } };
  const M = (ja, en, zh, es) => { const l = lang(); return l === "en" ? (en || ja) : l === "zh" ? (zh || en || ja) : l === "es" ? (es || en || ja) : ja; };
  V98REG.M = M; V98REG.lang = lang;
  const E = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  V98REG.E = E;
  const digits = (s) => String(s == null ? "" : s).replace(/[^\d]/g, "");
  const dd = () => { try { return (typeof D !== "undefined" && D) ? D : null; } catch (e) { return null; } };
  const ten = () => { try { return (typeof TEN !== "undefined" && TEN) ? TEN : null; } catch (e) { return null; } };
  const fn = (n) => { try { return typeof W[n] === "function" ? W[n] : null; } catch (e) { return null; } };
  function addDict(ja, en, zh, es) {
    try {
      if (typeof I18N === "undefined" || !I18N || !I18N.dict || !ja) return;
      const X = { en, zh: zh || en, es: es || en };
      ["en", "zh", "es"].forEach((l) => { if (I18N.dict[l] && X[l] && !I18N.dict[l][ja]) I18N.dict[l][ja] = X[l]; });
    } catch (e) { /* 訳が無いだけ */ }
  }
  V98REG.addDict = addDict;

  /* ════════════ どの商品の判定か（tenantToD の中＝その商品・資料の作成中＝V68REG.cur・それ以外は表示中の商品） ════════════ */
  let CTX = null;
  if (typeof tenantToD === "function") {
    const __td98 = tenantToD;
    tenantToD = function (t) { const prev = CTX; CTX = t || null; try { return __td98.apply(this, arguments); } finally { CTX = prev; } }; // eslint-disable-line no-global-assign
  }
  function prodNow() {
    if (CTX) return CTX;
    try { if (typeof V68REG !== "undefined" && V68REG && V68REG.cur) return V68REG.cur; } catch (e) { /* 次へ */ }
    try { if (typeof PID !== "undefined" && PID === "custom" && ten()) return ten(); } catch (e) { /* 次へ */ }
    return dd() || ten();
  }
  V98REG.prod = prodNow;
  // D（表示中の自社商品）なら、本人の答えを持っている TEN を見る
  function tenOf(p) {
    try { const t = ten(); if (p && t && p !== t && p === dd() && typeof PID !== "undefined" && PID === "custom") return t; } catch (e) { /* そのまま */ }
    return p;
  }
  const ckOf = (p) => { try { let ck = String((p && p.catKey) || ""); if (!ck || ck === "custom") ck = typeof catKeyOf === "function" ? String(catKeyOf(p && p.cat) || "") : ""; return ck; } catch (e) { return ""; } };
  const nmOf = (p) => String(((p && p.item) || "") + " " + ((p && p.itemEn) || ""));
  const rowsTxt = (a) => (Array.isArray(a) ? a : []).map((r) => (Array.isArray(r) ? r.filter((x) => x != null).join(" ") : String(r == null ? "" : r))).join(" ／ ");

  /* ════════════ 医療機器か（1か所で決める） ════════════ */
  // 「医療機器ではない」の言い方（本人の答え・登録の文）
  const RE_NOT_MD = /医療機器\s*(?:では|でも|じゃ)\s*(?:な[いくかし]|ありません|ございません)|医療機器\s*でな[いく]|医療機器\s*(?:に|には|と|とは)?\s*(?:該当|当た|あた|分類され|なら)(?:しない|しません|せず|らない|りません|らず|ない|れない|れません)|非医療機器|医療機器以外|(?:医療機器|クラス分類|分類)\s*(?:の(?:届出|認証|承認|登録|区分))?\s*[：:は]\s*(?:なし|無し|不要|対象外|非該当|該当なし|該当しない|いいえ|雑品|一般(?:雑貨|品))|雑品(?:扱い|として|です|となり|に当た|マスク|\s*[）)]|$)|not\s+(?:a\s+)?medical\s+device|non[-\s]?medical\s+(?:device|product|use)/i;
  // 「医療機器である」の言い方（クラス・届出番号など）
  const RE_IS_MD = /一般医療機器|管理医療機器|高度管理医療機器|医療機器\s*(?:の)?\s*(?:届出|認証|承認|製造販売)\s*(?:番号|済み?|を取得|取得済|あり)|(?:クラス分類|医療機器(?:の分類)?)\s*[：:は]?\s*(?:クラス)?\s*(?:Ⅰ|Ⅱ|Ⅲ|Ⅳ|I{1,3}|IV)(?![A-Za-z])|クラス\s*(?:Ⅰ|Ⅱ|Ⅲ|Ⅳ|I{1,3}|IV)\s*(?:の)?\s*医療機器|510\s*\(\s*k\s*\)\s*(?:取得|clearance|cleared|番号)|medical\s+device\s+class/i;
  V98REG.RE_NOT_MD = RE_NOT_MD; V98REG.RE_IS_MD = RE_IS_MD;
  function stmtOf(s) {
    s = String(s == null ? "" : s);
    if (!s) return "";
    try { s = s.normalize("NFKC"); } catch (e) { /* そのまま */ }
    if (RE_NOT_MD.test(s)) return "no";
    if (RE_IS_MD.test(s)) return "yes";
    return "";
  }
  V98REG.stmt = stmtOf;
  // 医療機器の項（書類の判断の表の「医療機器の輸出証明」の行と同じ HS）
  function mdHsList() {
    try { const r = (V85DOC_D.rules || []).find((x) => x && Array.isArray(x.k) && x.k.indexOf("FSC_MD") >= 0); if (r && r.w && Array.isArray(r.w.h) && r.w.h.length) return r.w.h.map(String); } catch (e) { /* 既定 */ }
    return ["9018", "9019", "9020", "9021", "9022", "902511", "3005", "3006", "9402"];
  }
  const RE_DEV_NM = /滅菌|無菌|注射|カテーテル|縫合|ガーゼ|包帯|絆創膏|ばんそうこう|手術用|インプラント|穿刺|サージカル|医療用|聴診器|血圧計|体温計|血糖|パルスオキシ|ネブライザ|補聴器|内視鏡|心電|超音波診断|\bAED\b|sterile|surgical|syringe|catheter|gauze|bandage|stethoscope|thermometer|sphygmomanometer|medical\s*device/i;
  // 化学品・衛生用品の項（医療機器にはならない）：28〜38類（除菌剤 3808・石けん 3401・洗剤 3402・化粧品 33 など）、紙の衛生用品 4818、おむつ・生理用品 9619
  const nonDevHs = (hs) => { const h2 = +hs.slice(0, 2); return (h2 >= 28 && h2 <= 38 && !/^300[56]/.test(hs)) || /^4818|^9619/.test(hs); };
  function mdOf(p0) {
    const p = tenOf(p0);
    const out = (v, why, txt) => ({ v, why, txt: txt || "" });
    try {
      if (!p) return out("unk", "none");
      const x = p.v98md;
      if (x && x.from === "btn" && (x.v === "no" || x.v === "yes")) return out(x.v, "btn", x.txt);
      const cat = String(p.cat || "").trim(), ck = ckOf(p), hs = digits(p.hs), hsOk = hs.length >= 4 && !p.hsGuess, nm = nmOf(p);
      if (cat === "医療機器") return out("yes", "cat", cat);
      if (/医薬品/.test(cat) && !/医療機器/.test(cat)) return out("no", "pharma", cat);
      if (x && (x.v === "no" || x.v === "yes")) return out(x.v, "ans", x.txt);
      // 登録の文（構成・規格表・認証・種類のひとこと・属性）
      const txt = [rowsTxt(p.compRows), p.cert, p.catRaw, p.v79indFree, (function () { try { const a = p.v68attrs; return a && typeof a === "object" ? Object.keys(a).map((k) => k + "：" + (typeof a[k] === "object" ? JSON.stringify(a[k]) : a[k])).join(" ／ ") : ""; } catch (e) { return ""; } })()].filter(Boolean).join(" ／ ");
      const st = stmtOf(txt);
      if (st) { const m = String(txt).normalize("NFKC").match(st === "no" ? RE_NOT_MD : RE_IS_MD); return out(st, "text", m ? m[0] : ""); }
      if (hsOk && mdHsList().some((h) => hs.indexOf(digits(h)) === 0)) return out("yes", "hs", hs.slice(0, 4) + "." + hs.slice(4, 6));
      if (RE_DEV_NM.test(nm) || (typeof V68REG_MEDDEV !== "undefined" && V68REG_MEDDEV.test(nm))) return out("yes", "name", nm.trim());
      const medCat = /医療|衛生/.test(cat) || ck === "medical";
      if (medCat) {
        if (hsOk && nonDevHs(hs)) return out("no", "hs", hs.slice(0, 4) + "." + hs.slice(4, 6));
        return out("unk", "cat", cat);
      }
      if (!cat && !ck) return out("unk", "none");
      return out("no", "cat", cat || ck);
    } catch (e) { err("md", e); return out("unk", "err"); }
  }
  V98REG.md = (p) => mdOf(p || prodNow());

  /* ════════════ 手続きの分野（名前から）と、商品が当たる分野 ════════════ */
  const NM_MD = /ISO\s*13485|医療機器|滅菌証明|QMS\s*適合|品質管理系統|510\s*\(\s*k\s*\)|機器リスティング|機器リスト|MOHAP|Kemenkes|保健省（MOH）クラスA|ディーラーライセンス|dealer'?s\s+licen[cs]e|米国代理人（US\s*Agent）の指名|Designation\s+of\s+a\s+US\s+Agent|輸入者の施設登録（タイFDA）|medical\s+device|device\s+(?:registration|listing)|sterili[sz]ation\s+certificate/i;
  const NM_PH = /医薬品|TPIL|薬品許可|薬商|製剤証明|薬事証明|pharmaceutical|therapeutic\s+product/i;
  const NM_COS = /化粧品|全成分表|INCI|\bPIF\b|製品情報ファイル|CPNP|SCPN|MoCRA|ACD準拠|cosmetic/i;
  const NM_FOOD = /食品(?!接触|器具|用の器具|衛生法の規格|に触れ)|食肉|水産物|乳製品|卵製品|Prior\s*Notice|事前通知|事前通報|FSVP|\bSFA\b|栄養成分表示|栄養表示|飼料|ペットフード|酒類|酒税|\bCOLA\b|FSSAI|衛生証明|food(?!\s*contact)/i;
  function tagsOf(nm) {
    const s = String(nm == null ? "" : nm);
    const T = new Set();
    if (!s) return T;
    if (NM_MD.test(s)) T.add("md");
    if (NM_PH.test(s)) T.add("pharma");
    if (NM_COS.test(s)) T.add("cos");
    if (NM_FOOD.test(s)) T.add("food");
    return T;
  }
  V98REG.tags = (nm) => [...tagsOf(nm)];
  function isFood(p) {
    const ck = ckOf(p), cat = String(p.cat || ""), hs = digits(p.hs), nm = nmOf(p);
    if (/^(food|liquor|supp)$/.test(ck) || /食品|酒類/.test(cat)) return true;
    if (hs.length >= 2) { const h2 = +hs.slice(0, 2); if (h2 >= 1 && h2 <= 24) return true; }
    if (/ペット/.test(cat) && /フード|おやつ|ジャーキー|ガム|飼料|treat|food|jerky/i.test(nm)) return true;
    return false;
  }
  function isFC(p) { // 食品に触れる物（食品用の器具・容器の手続きは「食品」の手続きと同じ名前のことがある）
    try { if (W.V96CTY && typeof V96CTY.isFC === "function") { const v = V96CTY.isFC(p); if (v === true) return true; if (v === false) return false; } } catch (e) { /* 次へ */ }
    try { return typeof v68regFC === "function" ? !!v68regFC(p) : false; } catch (e) { return false; }
  }
  let __ind0 = null; // 包む前の業種の判定
  function domsOf(p0) {
    const p = tenOf(p0);
    const S = new Set();
    if (!p) return S;
    try {
      const ck = ckOf(p), cat = String(p.cat || ""), hs = digits(p.hs);
      if (isFood(p) || isFC(p)) S.add("food");
      if (ck === "cosme" || /化粧品/.test(cat) || /^33/.test(hs) || /^3401/.test(hs)) S.add("cos");
      let ind0 = "";
      try { ind0 = __ind0 ? String(__ind0(p) || "") : ""; } catch (e) { ind0 = ""; }
      if (ind0 === "cosmetics") S.add("cos");
      if (ind0 === "food") S.add("food");
      if (/医薬品/.test(cat) || ind0 === "pharma" || (/^30/.test(hs) && !/^300[56]/.test(hs))) S.add("pharma");
      if (mdOf(p).v !== "no") S.add("md");
    } catch (e) { err("doms", e); }
    return S;
  }
  V98REG.doms = (p) => [...domsOf(p || prodNow())];
  // 商品の種類が分からない（カテゴリーも HS も無い）ときは、外さない
  const known = (p0) => { const p = tenOf(p0); return !!p && (!!String(p.cat || "").trim() || !!ckOf(p) || digits(p.hs).length >= 2); };
  function allowed(p, nm) {
    try {
      p = p || prodNow();
      if (!p || !known(p)) return true;
      const T = tagsOf(nm);
      if (!T.size) return true;
      const S = domsOf(p);
      for (const t of T) if (S.has(t)) return true; // まとめた名前（食品・化粧品など）は、どれか1つに当たれば出す（名前は商品の分野に分ける）
      return false;
    } catch (e) { err("allowed", e); return true; }
  }
  W.v98regAllowed = (p, nm) => allowed(p || prodNow(), nm);
  V98REG.allowed = W.v98regAllowed;

  /* ════════════ 業種の判定（v68regInd）：医療機器ではない商品は meddev にしない ════════════ */
  function altInd(p) {
    try {
      const cat = String(p.cat || "").trim();
      const k = typeof v68indByCat === "function" ? v68indByCat(cat) : "";
      if (k && k !== "meddev") return k;
      if (/医療|衛生/.test(cat) || ckOf(p) === "medical") return "daily"; // 医療機器ではない衛生用品（除菌剤・マスクなど）は、日用品として扱う
    } catch (e) { /* 次へ */ }
    return "other";
  }
  if (typeof v68regInd === "function") {
    __ind0 = v68regInd;
    v68regInd = function (p) { // eslint-disable-line no-global-assign
      const k = __ind0.apply(this, arguments);
      try {
        if (k === "meddev") {
          const P = p || (typeof v68regP === "function" ? v68regP() : prodNow());
          if (P && mdOf(P).v === "no") { V98REG.n.ind++; return altInd(tenOf(P)); }
        }
      } catch (e) { err("ind", e); }
      return k;
    };
  }

  /* ════════════ 注記（気をつけること）の文 ════════════ */
  // 70 字ちょうど（販売先国のリスクの文は、注記の先頭 70 字を使う＝途中で切れない）
  const HYG = "医療機器ではないため、医療機器の手続きは外しました。衛生用品は、国により化学品・衛生用品の届出・表示の決まりがあることがあります（要確認）。";
  addDict(HYG, "Not a medical device, so medical-device procedures were removed. Hygiene products may need chemical or hygiene-product notification and labelling in some countries (to be confirmed).",
    "不是医疗器械，因此已去掉医疗器械的手续。卫生用品在部分国家可能须按化学品或卫生用品办理备案和标示（待确认）。",
    "No es un dispositivo médico, así que se quitaron los trámites de dispositivos médicos. Los productos de higiene pueden requerir notificación y etiquetado como químicos o productos de higiene en algunos países (por confirmar).");
  V98REG.HYG = HYG;
  const HOLD = "\u0001";
  const hold = (s) => String(s).split(HYG).join(HOLD).split(HYG.slice(0, 70)).join(HOLD);
  const unhold = (s) => String(s).split(HOLD).join(HYG);
  // 医療機器のひな形の注記（リスクの文には 70 字で切って入る＝切った形も）
  function medWarns() {
    try {
      const R = typeof RD2 !== "undefined" && RD2 && RD2.medical;
      const L = R && R.w ? Object.keys(R.w).map((k) => String(R.w[k] || "")).filter(Boolean) : [];
      return L.concat(L.map((x) => x.slice(0, 70))).filter((x, i, a) => x && a.indexOf(x) === i).sort((a, b) => b.length - a.length);
    } catch (e) { return []; }
  }
  // 手続きの名前の一覧（ひな形・業種の手続き・書類の判断の表）。文の中の名前を、まるごと外すのに使う
  let NAMES = null;
  function names() {
    if (NAMES) return NAMES;
    const S = new Set();
    const addA = (a) => (Array.isArray(a) ? a : []).forEach((x) => { if (typeof x === "string" && x.length >= 3) S.add(x); });
    try { if (typeof RD2 !== "undefined" && RD2) Object.keys(RD2).forEach((k) => { const R = RD2[k]; if (!R) return; addA(R.base); if (R.x) Object.keys(R.x).forEach((c) => addA(R.x[c])); }); } catch (e) { /* 次へ */ }
    try { if (typeof RD !== "undefined" && RD) Object.keys(RD).forEach((c) => { const r = RD[c]; if (r && r.x) Object.keys(r.x).forEach((k) => addA(r.x[k])); }); } catch (e) { /* 次へ */ }
    try { [typeof V68REG_MD !== "undefined" ? V68REG_MD : null, typeof V68REG_PH !== "undefined" ? V68REG_PH : null].forEach((T) => { if (T) Object.keys(T).forEach((c) => addA(T[c])); }); } catch (e) { /* 次へ */ }
    try { Object.keys(V85DOC_D.docs || {}).forEach((k) => { const x = V85DOC_D.docs[k]; if (Array.isArray(x)) addA([x[0], x[1]]); }); } catch (e) { /* 次へ */ }
    addA(["医療機器の輸出証明（自由販売証明・CFS）", "米国代理人（US Agent）の指名", "ISO13485証明書", "滅菌証明書（該当品）", "ISO13485", "ISO 13485"]);
    Object.keys(SPLIT_NM).forEach((k) => ["food", "cos"].forEach((d) => addA([SPLIT_NM[k][d][0], SPLIT_NM[k][d][1]])));
    Object.keys(RAW_NM).forEach((k) => addA(RAW_NM[k]));
    NAMES = [...S].filter((x) => tagsOf(x).size).sort((a, b) => b.length - a.length);
    return NAMES;
  }
  const SPLIT_NM = {}, RAW_NM = {};
  function cutNames(s, p) {
    let t = String(s == null ? "" : s);
    if (!t) return t;
    let hit = false;
    names().forEach((nm) => { if (t.indexOf(nm) >= 0 && !allowed(p, nm)) { t = t.split(nm).join("\u0000"); hit = true; } });
    if (!hit) return t;
    t = t.replace(/[・、,]\s*\u0000(?=\s*[・、,])/g, "").replace(/[・、,]\s*\u0000/g, "").replace(/\u0000\s*[・、,]\s*/g, "").replace(/\u0000(?:の準備|の取得|が必要|が要ります)?/g, "");
    return t;
  }
  function scrubWarn(w, p) {
    const s0 = String(w == null ? "" : w);
    if (!s0) return s0;
    let s = hold(s0);
    if (!allowed(p, "医療機器")) medWarns().forEach((x) => { if (s.indexOf(x) >= 0) s = s.split(x).join(""); });
    const parts = s.split(/(?<=[。．])/);
    const keep = parts.filter((x) => !x.trim() || x.indexOf(HOLD) >= 0 || allowed(p, x));
    if (keep.length !== parts.length) s = keep.join("");
    s = unhold(s).trim();
    return s === s0.trim() ? s0 : s;
  }
  V98REG.scrubWarn = (w, p) => scrubWarn(w, p || prodNow());
  // 「／」「。」「→」で区切った文のうち、出してはいけない手続きを含む部分を外す（AI の文・リスクの文）。名前の並びの中の名前は、名前だけ外す
  function scrubSeg(s, p) {
    const t = String(s == null ? "" : s);
    if (!t) return t;
    let out = hold(t);
    if (!allowed(p, "医療機器")) medWarns().forEach((x) => { if (out.indexOf(x) >= 0) out = out.split(x).join(""); });
    out = cutNames(out, p);
    out = out.split(/(?<=[／。．→])/).filter((x) => { const y = x.replace(/[／。．→\s]/g, ""); return !y || x.indexOf(HOLD) >= 0 || allowed(p, x); }).join("");
    out = out.replace(/／{2,}/g, "／").replace(/→\s*→/g, "→").replace(/^[／→\s]+|[／→\s]+$/g, "").replace(/\s{2,}/g, " ").trim();
    out = unhold(out);
    return out === t.trim() ? t : out;
  }
  V98REG.scrubSeg = (s, p) => scrubSeg(s, p || prodNow());
  V98REG.cutNames = (s, p) => cutNames(s, p || prodNow());

  /* ════════════ 規制の表（regsFor）：いちばん外側で、出してはいけない手続き・注記を外す ════════════ */
  function mark(r, info) { try { Object.defineProperty(r, "_v98", { value: info, enumerable: false, configurable: true, writable: true }); } catch (e) { /* 印だけ */ } }
  function fixOne(c, r, p) {
    try {
      if (!r || typeof r !== "object" || !p || !known(p)) return false;
      const docs0 = Array.isArray(r.docs) ? r.docs.slice() : [];
      const keep = [], cut = [];
      docs0.forEach((d) => { (allowed(p, String(d)) ? keep : cut).push(d); });
      let ch = false;
      if (cut.length) { r.docs = keep; ch = true; V98REG.n.cut += cut.length; }
      const md = mdOf(p);
      if (typeof r.warn === "string" && r.warn) {
        const w1 = scrubWarn(r.warn, p);
        if (w1 !== r.warn) { r.warn = w1; ch = true; V98REG.n.warn++; }
      }
      const medTpl = ckOf(tenOf(p)) === "medical";
      if (md.v === "no" && (medTpl || cut.some((d) => tagsOf(d).has("md"))) && !r.warn) { r.warn = HYG; ch = true; }
      // v68 の「ひな形（医療機器向け）と業種が食い違う」は、外したあとは食い違っていない
      try { if (md.v === "no" && r._v68 && r._v68.mis === "meddev") r._v68.mis = ""; } catch (e) { /* 無視 */ }
      try { if (md.v === "no" && r._v68 && Array.isArray(r._v68.notes)) r._v68.notes = r._v68.notes.filter((x) => x !== "meddev" && x !== "nosterile"); } catch (e) { /* 無視 */ }
      if (ch || r._v98) mark(r, { cut: ((r._v98 && r._v98.cut) || []).concat(cut).filter((x, i, a) => a.indexOf(x) === i), md: md.v, why: md.why, txt: md.txt });
      return ch;
    } catch (e) { err("fix " + c, e); return false; }
  }
  V98REG.fixOne = fixOne;
  if (typeof regsFor === "function") {
    const __rf98 = regsFor;
    regsFor = function (cat, targets) { // eslint-disable-line no-global-assign
      const out = __rf98.apply(this, arguments);
      try { const p = prodNow(); if (out && p) Object.keys(out).forEach((c) => fixOne(c, out[c], p)); } catch (e) { err("regsFor", e); }
      return out;
    };
  }
  // 表示中の商品の表（D.regs）：前に作られた表にも当てる。医療機器の枝で作られた表（v68 の印）は作り直す
  function fixD() {
    try {
      const d = dd(); if (!d || !d.regs) return 0;
      const p = prodNow(); if (!p || !known(p)) return 0;
      let n = 0;
      const md = mdOf(p);
      Object.keys(d.regs).forEach((c) => {
        const r = d.regs[c];
        const stale = md.v === "no" && r && r._v68 && r._v68.ind === "meddev";
        if (stale && typeof regsFor === "function") {
          try { const k = d.catKey || ckOf(p); const r2 = regsFor(k, [c])[c]; if (r2) { d.regs[c] = r2; n++; return; } } catch (e) { err("rebuild " + c, e); }
        }
        if (fixOne(c, r, p)) n++;
      });
      return n;
    } catch (e) { err("fixD", e); return 0; }
  }
  V98REG.fixD = fixD;
  if (typeof rReg === "function") { const __rr98 = rReg; rReg = function () { try { fixD(); } catch (e) { /* 無視 */ } return __rr98.apply(this, arguments); }; } // eslint-disable-line no-global-assign
  if (typeof switchTen === "function") { const __sw98 = switchTen; switchTen = function () { const r = __sw98.apply(this, arguments); try { fixD(); } catch (e) { err("sw", e); } return r; }; } // eslint-disable-line no-global-assign

  /* ════════════ 書類の判断の表（V85DOC_D） ════════════ */
  // まとめた名前の書類は、商品の分野で名前を分ける（どの画面も V85DOC_D.docs を読む＝同じ名前になる）
  const SPLIT = {
    TW_TFDA: { food: ["台湾 TFDA の輸入査験（食品・食品用の器具・容器）", "Taiwan TFDA Import Inspection (food, food utensils and containers)", "台湾TFDA输入查验（食品・食品用器具和容器）", "Inspección de importación de la TFDA de Taiwán (alimentos, utensilios y envases para alimentos)"],
      cos: ["台湾 TFDA 化粧品の製品登録（PIF の作成・保管）", "Taiwan TFDA Cosmetic Product Registration (PIF kept on file)", "台湾TFDA化妆品产品登录（制作并保存PIF）", "Registro de producto cosmético ante la TFDA de Taiwán (con PIF archivado)"] },
    AE_REG: { food: ["UAE の食品の登録とラベル審査", "UAE Food Registration and Label Assessment", "阿联酋食品注册及标签审查", "Registro de alimentos y evaluación de etiquetas en los EAU"],
      cos: ["UAE の化粧品の登録とラベル審査", "UAE Cosmetic Registration and Label Assessment", "阿联酋化妆品注册及标签审查", "Registro de cosméticos y evaluación de etiquetas en los EAU"] }
  };
  Object.keys(SPLIT).forEach((k) => { SPLIT_NM[k] = SPLIT[k]; });
  try {
    if (typeof V85DOC_D !== "undefined" && V85DOC_D && V85DOC_D.docs) {
      Object.keys(SPLIT).forEach((k) => {
        const D0 = V85DOC_D.docs;
        let base = Array.isArray(D0[k]) ? D0[k].slice() : null;
        if (!base) return;
        const desc = Object.getOwnPropertyDescriptor(D0, k);
        if (desc && desc.get) return; // もう分けてある
        RAW_NM[k] = [String(base[0] || ""), String(base[1] || "")];
        ["food", "cos"].forEach((dm) => { const x = SPLIT[k][dm]; addDict(x[0], x[1], x[2], x[3]); });
        Object.defineProperty(D0, k, {
          enumerable: true, configurable: true,
          get() {
            try {
              const p = prodNow();
              if (p && known(p)) {
                const S = domsOf(p);
                const f = S.has("food"), c = S.has("cos");
                if (f !== c) { const x = SPLIT[k][f ? "food" : "cos"]; V98REG.n.nm++; return [x[0], x[1]].concat(base.slice(2)); }
              }
            } catch (e) { err("nm " + k, e); }
            return base;
          },
          set(v) { if (Array.isArray(v)) base = v.slice(); }
        });
      });
    }
  } catch (e) { err("split", e); }
  const docNameRaw = (k) => { try { const x = (V85DOC_D.docs || {})[k]; return x ? String(x[0] || k) + " " + String(x[1] || "") : String(k); } catch (e) { return String(k); } };
  V98REG.docName = (k) => { try { const x = (V85DOC_D.docs || {})[k]; return x ? (lang() === "ja" ? x[0] : (x[1] || x[0])) : k; } catch (e) { return k; } };
  // 当たらない分野の行は当てない（判断の表のすべての使い道が通る入口）
  if (typeof v85docRuleHit === "function") {
    const __rh98 = v85docRuleHit;
    v85docRuleHit = function (r, F) { // eslint-disable-line no-global-assign
      const h = __rh98.apply(this, arguments);
      if (!h) return h;
      try {
        const p = prodNow();
        if (!p || !known(p)) return h;
        const ks = (r && Array.isArray(r.k) ? r.k : []).filter((k) => k !== "IMPORT_BAN");
        if (!ks.length) return h;
        if (!ks.some((k) => allowed(p, docNameRaw(k)))) { V98REG.n.rule++; return null; }
      } catch (e) { err("ruleHit", e); }
      return h;
    };
  }
  // 区分からの HS の推定：医療機器ではない商品に「90（医療機器）」を当てない
  if (typeof v85docHsProv === "function") {
    const __hp98 = v85docHsProv;
    v85docHsProv = function (d) { // eslint-disable-line no-global-assign
      const r = __hp98.apply(this, arguments);
      try { if (r && /^90/.test(String(r.hs || "")) && mdOf(d || prodNow()).v === "no") { V98REG.n.prov++; return null; } } catch (e) { err("hsProv", e); }
      return r;
    };
  }

  /* ════════════ 保存した販売先分析・国別戦略（前の版・カテゴリーを変える前に作ったもの） ════════════ */
  function scrubRec(s) {
    try {
      if (!s || !Array.isArray(s.rec)) return 0;
      const p = prodNow();
      if (!p || !known(p)) return 0;
      let n = 0;
      const LOCAL = { risk: "ctyRiskLocal", why: "ctyWhyLocal", next: "ctyNextLocal", comp: "ctyCompLocal" };
      s.rec.forEach((r) => {
        if (!r) return;
        const f = r.facts;
        let fch = false;
        if (f) {
          if (Array.isArray(f.docs)) { const d2 = f.docs.filter((d) => allowed(p, String(d))); if (d2.length !== f.docs.length) { f.docs = d2; n++; fch = true; } }
          if (typeof f.warn === "string" && f.warn) { let w1 = scrubWarn(f.warn, p); if (!w1 && mdOf(p).v === "no" && ckOf(tenOf(p)) === "medical") w1 = HYG; if (w1 !== f.warn) { f.warn = w1; n++; fch = true; } }
        }
        // 点数の内訳（書類の判断の表の手続きの一覧）：当たらない分野の手続きを外す
        try {
          const P = r.v96 && Array.isArray(r.v96.P) ? r.v96.P : null;
          if (P) P.forEach((x) => { if (x && Array.isArray(x.L)) { const L2 = x.L.filter((k) => allowed(p, docNameRaw(k))); if (L2.length !== x.L.length) { x.L = L2; n++; } } });
          if (P) for (let i = P.length - 1; i >= 0; i--) { const x = P[i]; if (x && /^dt(Req|Con|Com)$/.test(x.k) && Array.isArray(x.L) && !x.L.length) P.splice(i, 1); }
        } catch (e) { err("recP", e); }
        const per = s.ai && s.ai.per && s.ai.per[r.c];
        ["risk", "why", "next", "comp"].forEach((k) => {
          if (typeof r[k] !== "string" || !r[k]) return;
          const fromAI = !!(per && per[k] && per[k] === r[k]);
          let v = r[k];
          if (!fromAI && fch) { const g = fn(LOCAL[k]); if (g) { try { v = String(g(r) || ""); } catch (e) { v = r[k]; } } } // アプリが作った文は、直した事実から作り直す
          v = scrubSeg(v, p);
          if (v !== r[k]) { r[k] = v || (k === "risk" ? M("目立ったリスクなし（要確認事項は規制の詳細調査で）", "No notable risks (check details in the regulation research)") : v); n++; }
        });
        if (per) ["risk", "why", "next", "comp"].forEach((k) => { if (typeof per[k] === "string" && per[k]) { const v = scrubSeg(per[k], p); if (v !== per[k]) { per[k] = v; n++; } } });
      });
      if (s.ai && typeof s.ai.summary === "string") { const v = scrubSeg(s.ai.summary, p); if (v !== s.ai.summary) { s.ai.summary = v; n++; } }
      if (n) { V98REG.n.rec += n; try { if (typeof ctySave === "function") ctySave(); } catch (e) { /* 次の保存で */ } }
      return n;
    } catch (e) { err("scrubRec", e); return 0; }
  }
  V98REG.scrubRec = scrubRec;
  if (typeof vCty === "function") {
    const __vc98 = vCty;
    vCty = function () { // eslint-disable-line no-global-assign
      try { if (!W.__ctyBusy && typeof ctyStore === "function") scrubRec(ctyStore()); } catch (e) { err("vCty", e); }
      return __vc98.apply(this, arguments);
    };
  }
  // 推奨の国の詳細・国別戦略の「必要書類」に足す、書類の判断の表の手続き（21.97 の dtNames）も同じ関数を通す
  try {
    if (W.V97CTY && typeof V97CTY.dtNames === "function" && !V97CTY.dtNames._v98) {
      const __dn98 = V97CTY.dtNames;
      V97CTY.dtNames = function (r) {
        const L = __dn98.apply(this, arguments);
        try { const p = prodNow(); if (Array.isArray(L) && p) return L.filter((x) => allowed(p, String(x))); } catch (e) { err("dtNames", e); }
        return L;
      };
      V97CTY.dtNames._v98 = 1;
    }
  } catch (e) { err("dtwrap", e); }
  function scrubArr(a, p) { return Array.isArray(a) ? a.filter((x) => allowed(p, typeof x === "string" ? x : JSON.stringify(x))) : a; }
  function scrubDeep(DP) {
    try {
      if (!DP || !DP.d) return;
      const p = prodNow(); if (!p || !known(p)) return;
      const d = DP.d;
      if (d.regulation) {
        ["docs", "labeling", "limits", "claimsOK", "claimsNG"].forEach((k) => { if (Array.isArray(d.regulation[k])) d.regulation[k] = scrubArr(d.regulation[k], p); });
        ["registration", "scheme", "notes", "cost", "period"].forEach((k) => { if (typeof d.regulation[k] === "string") d.regulation[k] = scrubSeg(d.regulation[k], p); });
      }
      if (d.entry) {
        if (Array.isArray(d.entry.adjustments)) d.entry.adjustments = scrubArr(d.entry.adjustments, p);
        if (typeof d.entry.reason === "string") d.entry.reason = scrubSeg(d.entry.reason, p);
      }
      if (d.overview) ["classification", "regCost", "headline", "summary"].forEach((k) => { if (typeof d.overview[k] === "string") d.overview[k] = scrubSeg(d.overview[k], p); });
      if (Array.isArray(d.risks)) d.risks = d.risks.filter((x) => allowed(p, JSON.stringify(x)));
      V98REG.n.deep++;
    } catch (e) { err("deep", e); }
  }
  V98REG.scrubDeep = scrubDeep;
  if (typeof ctyDeepView === "function") {
    const __dv98 = ctyDeepView;
    ctyDeepView = function (c) { // eslint-disable-line no-global-assign
      try { scrubDeep(typeof ctyDeepOf === "function" ? ctyDeepOf(c) : null); } catch (e) { err("deepView", e); }
      return __dv98.apply(this, arguments);
    };
  }

  /* ════════════ AI：詳細調査の依頼・AI 相談に渡す事実 ════════════ */
  function mdLine(p) {
    const m = mdOf(p);
    if (m.v !== "no" || !V98REG.showMd(p)) return ""; // 医療・衛生用品・本人の答えがある商品だけ（食品などには書かない）
    const src = m.why === "btn" ? "本人が規制の画面で選んだ" : m.why === "ans" || m.why === "text" ? "本人の答え" + (m.txt ? "「" + m.txt + "」" : "") : m.why === "hs" ? "登録の HS " + m.txt + " は化学品・衛生用品の項" : "カテゴリー「" + (m.txt || "") + "」";
    return "この商品は医療機器ではありません（" + src + "）。医療機器の手続き（ISO 13485・医療機器の製品登録・販売業（ディーラー）の許可・医療機器の輸出証明・FDA の機器の登録や 510(k) など）は対象外として扱い、挙げないでください。";
  }
  V98REG.mdLine = (p) => mdLine(p || prodNow());
  let REGAI = 0;
  if (typeof regAIRun === "function") {
    const __ar98 = regAIRun;
    regAIRun = async function (c) { // eslint-disable-line no-global-assign
      REGAI++;
      try { return await __ar98.apply(this, arguments); } finally { REGAI = Math.max(0, REGAI - 1); }
    };
  }
  if (typeof llmAsk === "function") {
    const __la98 = llmAsk;
    llmAsk = function (q, maxTok, opts) { // eslint-disable-line no-global-assign
      try {
        if (REGAI && typeof q === "string" && /輸入規制|規制/.test(q)) {
          const ln = mdLine(prodNow());
          if (ln && q.indexOf(ln) < 0) { q = q + "\n" + ln; V98REG.n.ai++; arguments[0] = q; }
        }
      } catch (e) { err("llm", e); }
      return __la98.apply(this, arguments);
    };
  }
  if (typeof v68regFactTxt === "function") {
    const __ft98 = v68regFactTxt;
    v68regFactTxt = function () { // eslint-disable-line no-global-assign
      let s = __ft98.apply(this, arguments);
      try { const ln = mdLine(prodNow()); if (ln && typeof s === "string" && s) s += "\n- " + ln + "（AI詳細調査の控えに医療機器の手続きが書かれていても当てない）"; } catch (e) { err("fact", e); }
      return s;
    };
  }
  // 規制の画面の「商品に合わせて表を直しました」の欄に、外した手続きを書く
  if (typeof v68regBanner === "function") {
    const __bn98 = v68regBanner;
    v68regBanner = function (c, r, p) { // eslint-disable-line no-global-assign
      let h = __bn98.apply(this, arguments);
      try {
        const x = r && r._v98;
        if (x && x.cut && x.cut.length) {
          const line = M("この商品に当たらない手続き（" + x.cut.slice(0, 4).join("・") + (x.cut.length > 4 ? " ほか" : "") + "）は、表から外しました。", "Procedures that do not apply to this product (" + x.cut.slice(0, 4).join(", ") + (x.cut.length > 4 ? ", etc." : "") + ") were removed from the table.", "已从表中删除不适用于本商品的手续（" + x.cut.slice(0, 4).join("、") + (x.cut.length > 4 ? "等" : "") + "）。", "Se quitaron de la tabla los trámites que no corresponden a este producto (" + x.cut.slice(0, 4).join(", ") + (x.cut.length > 4 ? ", etc." : "") + ").");
          const p0 = '<p data-v98reg="cut" data-noi18n>' + E(line) + "</p>";
          if (h && /<\/div>\s*$/.test(h)) h = h.replace(/<\/div>\s*$/, p0 + "</div>");
          else if (!h) h = '<div class="v68reg-box info" data-v68reg="tpl" role="note"><b class="v68reg-h" data-noi18n>' + E(M("ℹ 商品に合わせて表を直しました", "ℹ Table adjusted to this product", "ℹ 已按商品调整表格", "ℹ Tabla ajustada a este producto")) + "</b>" + p0 + "</div>";
        }
      } catch (e) { err("banner", e); }
      return h;
    };
  }

  /* ════════════ ヒアリング：「医療機器ではありません」などの答えを控える（どの問いへの答えでも） ════════════ */
  const SAID = { no: ["「医療機器ではない」と控えました。規制・必要書類・営業資料に、医療機器の手続き（ISO 13485・医療機器の登録など）は出しません。違うときは「規制を調べる」の「医療機器かどうか」で選び直せます。", "Noted: not a medical device. Medical-device procedures (ISO 13485, device registration, etc.) will not be shown in regulations, documents or sales materials. You can change this under “Medical device?” in Check regulations.", "已记录：不是医疗器械。法规、所需文件和营销资料中不会显示医疗器械的手续（ISO 13485、医疗器械注册等）。如有不同，可在“查询法规”的“是否为医疗器械”中重新选择。", "Anotado: no es un dispositivo médico. No se mostrarán trámites de dispositivos médicos (ISO 13485, registro, etc.) en normativa, documentos ni materiales de venta. Puede cambiarlo en «¿Dispositivo médico?» de Consultar normativa."],
    yes: ["「医療機器」と控えました。規制の画面で、相手国でのクラスと医療機器の手続きを確かめてください。", "Noted: medical device. Please confirm the device class and procedures in each destination in Check regulations.", "已记录：医疗器械。请在“查询法规”中确认目的国的分类和医疗器械手续。", "Anotado: dispositivo médico. Confirme la clase y los trámites en cada destino en Consultar normativa."] };
  SAID.no.concat(SAID.yes).forEach(() => { /* 訳は M で出す */ });
  if (typeof fillAnswer === "function") {
    const __fa98 = fillAnswer;
    fillAnswer = function (v) { // eslint-disable-line no-global-assign
      let st = "", k = "", t = null;
      try {
        t = ten();
        const cu = (typeof FILL !== "undefined" && FILL) ? FILL.cur : null;
        k = cu ? String(cu.k || "") : "";
        st = t && cu ? stmtOf(v) : "";
        if (st) {
          const prev = t.v98md;
          if (!(prev && prev.from === "btn")) {
            const m = String(v).normalize("NFKC").match(st === "no" ? RE_NOT_MD : RE_IS_MD);
            t.v98md = { v: st, from: "hear", k, txt: m ? m[0].slice(0, 40) : String(v).slice(0, 40), at: Date.now() };
            V98REG.n.hear++;
          } else st = "";
        }
      } catch (e) { err("hear", e); st = ""; }
      const r = __fa98.apply(this, arguments);
      try {
        if (st && typeof FILL !== "undefined" && FILL && Array.isArray(FILL.log)) {
          const S = SAID[st];
          const msg = { who: "ai", html: '<span data-v98reg="said">' + E(M(S[0], S[1], S[2], S[3])) + "</span>" };
          const L = FILL.log;
          const last = L[L.length - 1];
          if (last && last.who === "ai" && last.extra && last.extra.ask) L.splice(L.length - 1, 0, msg); else L.push(msg);
          try { if (typeof saveTen === "function") saveTen(); } catch (e) { /* 次の保存で */ }
          try { if (typeof render === "function") render(); } catch (e) { /* 無視 */ }
        }
      } catch (e) { err("hear2", e); }
      return r;
    };
  }

  /* ════════════ 規制の画面の「医療機器かどうか」（選び直し） ════════════ */
  // 欄を出す商品：カテゴリーが医療・衛生用品／医療機器、または本人の答えがあるとき、または判定で医療機器の手続きを外したとき
  V98REG.showMd = function (p) {
    p = tenOf(p || prodNow());
    try {
      if (!p || !known(p)) return false;
      const cat = String(p.cat || "");
      if (/医療|衛生/.test(cat) || ckOf(p) === "medical") return true;
      if (p.v98md && (p.v98md.v === "no" || p.v98md.v === "yes")) return true;
      const k0 = __ind0 ? __ind0(p) : "";
      return k0 === "meddev";
    } catch (e) { return false; }
  };
  V98REG.setMd = function (v) {
    try {
      const t = ten(); if (!t) return false;
      // ヒアリングの答えは控えたまま（「自動の判定に戻す」で答えの判定に戻る）
      const prev = t.v98md;
      const hear = prev && prev.from === "hear" ? prev : (prev && prev.hear) || null;
      if (v === "no" || v === "yes") t.v98md = Object.assign({ v, from: "btn", at: Date.now() }, hear ? { hear } : {});
      else if (hear) t.v98md = hear;
      else delete t.v98md;
      try { if (typeof syncTenant === "function") syncTenant(); } catch (e) { err("sync", e); }
      try { fixD(); } catch (e) { /* 無視 */ }
      try { if (typeof ctyStore === "function") scrubRec(ctyStore()); } catch (e) { /* 無視 */ }
      try { if (typeof saveTen === "function") saveTen(); } catch (e) { /* 次の保存で */ }
      try { if (typeof logU === "function") logU("reg", "医療機器かどうか:" + (v || "自動")); } catch (e) { /* 記録だけ */ }
      return true;
    } catch (e) { err("setMd", e); return false; }
  };
  V98REG.mdWhyTxt = function (m) {
    m = m || mdOf(prodNow());
    switch (m.why) {
      case "btn": return M("この画面で選びました", "chosen on this screen", "已在此画面选择", "elegido en esta pantalla");
      case "ans": case "text": return M("本人の答え", "your answer", "您的回答", "su respuesta") + (m.txt ? "「" + m.txt + "」" : "");
      case "cat": return M("カテゴリー「" + m.txt + "」", "category “" + m.txt + "”", "类别“" + m.txt + "”", "categoría «" + m.txt + "»");
      case "hs": return M("登録の HS " + m.txt + (m.v === "no" ? "（化学品・衛生用品の項）" : "（医療機器の項）"), "registered HS " + m.txt + (m.v === "no" ? " (chemicals / hygiene goods)" : " (medical devices)"), "登记的HS " + m.txt + (m.v === "no" ? "（化学品・卫生用品）" : "（医疗器械）"), "HS registrado " + m.txt + (m.v === "no" ? " (químicos / higiene)" : " (dispositivos médicos)"));
      case "name": return M("品名", "product name", "品名", "nombre del producto");
      case "pharma": return M("医薬品", "medicine", "药品", "medicamento");
      default: return M("決め手がありません", "no deciding information", "没有判断依据", "sin información decisiva");
    }
  };
  // 決まり文句の訳（rd で出す固定の文）
  addDict("医療機器かどうか", "Medical device?", "是否为医疗器械", "¿Dispositivo médico?");

  /* 起動時：表示中の商品の表にも当てる */
  try { fixD(); } catch (e) { /* 無視 */ }
})();
