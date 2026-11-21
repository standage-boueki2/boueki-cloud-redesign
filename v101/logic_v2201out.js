/* ═══ v22.01 out（2026-11-22 第14回 UAT〔22.00.1〕）書類と英語営業資料の中身・写真の加工の反映・納品版の不足の案内 ═══
   土台・rd・v95〜v100 の層は書き換えず、前の関数を控えてから包む。v101 の中では out が最後に読まれるが、自分が最後に包むとは
   限らない前提で、何度通っても同じ結果になるように書く（印・同じ値なら何もしない）。失敗したら前の動きのまま（try/catch）。
   No.617（中）E の梱包明細（PL）で、単品サイズ 175×95mm が「Carton size」（外装の寸法）に流用された（外装カートンは未入力）
     原因：土台の buildShip が、寸法表の1行目（単品の行でも・「不明」でも）をそのまま Carton size と貨物（cargo）に入れる。
           外装の入数・重量・寸法がどれも読めないとき、v68trPlFill はその文字（rawTxt）を Carton size に残す。
           入数も、外装の入数の欄（ctn）に「外装40ケース／パレット」（1パレットあたりのケース数）や「50枚／箱」（1箱の中身）があると、
           その数を「1カートンあたりの入数」として読み、カートン数・総重量を計算していた。
     直し：外装（外装・外箱・カートン・ケース・carton）と書かれた所の寸法だけを Carton size にする。外装の寸法が無ければ「—」
           （書類の画面では「（要入力）」と出て、「梱包明細の Carton size（外装の寸法）が未入力です」の知らせと直す場所へのボタンが出る）。
           単品の寸法・「不明」「資料に記載なし」は値にしない（hear の window.v101dims があれば使う）。貨物の文は「単品 175×95mm／外装は未登録」。
           入数は、パレットあたりの数・1箱の中身（売る単位と数え方が違う）を1カートンの入数として読まない。
           原産地（Origin）の行は fact の window.v101origin に任せる（触らない）。
   No.619（中）G の英語資料「MATERIAL & SPECIFICATIONS」で「Ingredient」列に「No food contact」が繰り返し出て、行と列の対応が崩れた
   No.543（未解消）A の英語資料で同じアレルゲンが「WHAT'S INSIDE」と「INGREDIENT LIST」の2枚に出る
   No.552 の残り：写真の加工（切り取る・ぼかす）が保存済みの資料に入ったか分からない／加工後の AI の再確認の「日本語の文字が残る可能性」
   納品版の不足の案内：何が足りず、どこで入れればよいか・その画面へ1回で行けるか
   （それぞれの節の頭に原因と直しを書く） */
var V101OUT = window.V101OUT = window.V101OUT || { v: "22.01", err: null, errs: [], n: {} };
(function () {
  "use strict";
  const W = window;
  const V = V101OUT;
  if (V._logic) return; // 二度読まれても二重に包まない
  V._logic = 1;
  const err = (k, e) => { try { const m = k + ": " + String((e && e.message) || e).slice(0, 180); V.err = m; V.errs.push(m); if (V.errs.length > 40) V.errs.shift(); } catch (x) { /* 記録だけ */ } };
  V.errf = err;
  const cnt = (k, d) => { try { const x = d == null ? 1 : +d; if (x) V.n[k] = (V.n[k] || 0) + x; } catch (e) { /* 数えるだけ */ } };
  const lang = () => { try { const el = document.getElementById("lang"); const l = String((typeof I18N !== "undefined" && I18N && I18N.lang) || (el && el.value) || "ja"); return /^en/.test(l) ? "en" : /^zh/.test(l) ? "zh" : /^es/.test(l) ? "es" : "ja"; } catch (e) { return "ja"; } }; // eslint-disable-line no-undef
  const M = (ja, en, zh, es) => { const l = lang(); return l === "en" ? (en || ja) : l === "zh" ? (zh || en || ja) : l === "es" ? (es || en || ja) : ja; };
  V.M = M; V.lang = lang;
  const E = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  V.E = E;
  const NF = (s) => { s = String(s == null ? "" : s); try { return s.normalize("NFKC"); } catch (e) { return s; } };
  const ten = () => { try { return (typeof TEN !== "undefined" && TEN) ? TEN : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const G = () => { try { return (typeof DK3G !== "undefined" && DK3G) ? DK3G : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const pkey = (t) => { try { return typeof dk3PKey === "function" ? dk3PKey(t) : (t && t.uid) || ""; } catch (e) { return ""; } }; // eslint-disable-line no-undef
  const toast0 = (s) => { try { if (typeof toast === "function") toast(s); } catch (e) { /* 無視 */ } }; // eslint-disable-line no-undef
  V.ten = ten; V.G = G; V.pkey = pkey; V.NF = NF;

  /* ════════════ No.617 梱包明細（PL）の Carton size・入数：単品の寸法・1箱の中身・パレットの数を外装に流用しない ════════════ */
  const CTN = /外装|外箱|カートン|ケース|段ボール|ダンボール|梱包箱|輸送箱|master\s*(?:carton|case)|carton|ctn|shipping\s*box|outer\s*(?:box|case)|case\b/i;
  const UNIT = /単品|単体|個装|個箱|本体|製品|商品(?:の)?(?:サイズ|寸法)|1個|1本|1袋|1枚|1箱|内箱|化粧箱|パッケージ|unit|item|piece|each|per\s*(?:pc|piece|unit)/i;
  const PALLET = /パレット|pallet|plt\b/i;
  const NOVAL = /不明|わからない|分からない|未定|未確認|未登録|未入力|記載なし|資料に(?:記載|無|な)|要確認|調査中|確認中|n\/?a|unknown|tbd|to be confirmed|not (?:available|provided)|—|^-$/i;
  const DIM = /(\d+(?:\.\d+)?)\s*(mm|cm|m)?\s*[×xX＊*]\s*(\d+(?:\.\d+)?)\s*(mm|cm|m)?(?:\s*[×xX＊*]\s*(\d+(?:\.\d+)?)\s*(mm|cm|m)?)?/;
  const dimOf = (s) => {
    const x = NF(s).replace(/[＊*]/g, "×").replace(/(\d)\s*[xX]\s*(?=\d)/g, "$1×");
    const m = x.match(DIM); if (!m) return null;
    const n = [m[1], m[3], m[5]].filter((v) => v != null).map(Number);
    const u = (m[6] || m[4] || m[2] || "").toLowerCase();
    return { n, u, txt: n.join("×") + (u || "") };
  };
  const sameNums = (a, b) => !!(a && b && a.n.length === b.n.length && a.n.every((v, i) => v === b.n[i]));
  /* 寸法表を「区切り」ごとに読み、外装か単品か分からないかを付ける */
  function segsOf(t) {
    const out = [];
    try {
      const cols = (t && Array.isArray(t.dimCols) ? t.dimCols : []).map((c) => NF(c));
      const rows = (t && Array.isArray(t.dimRows) ? t.dimRows : []).filter(Array.isArray);
      const kv = cols.length <= 2 || cols.every((c, i) => i === 0 || /^(内容|値|value|details?|備考|内容・備考)$/i.test(c.trim()) || !c.trim());
      rows.forEach((r, ri) => {
        const lab = NF(r[0]);
        const cells = kv ? [r.slice(1).map(NF).join(" ")] : r.slice(1).map(NF);
        cells.forEach((cell, ci) => {
          const head = kv ? "" : (cols[ci + 1] || "");
          String(cell || "").split(/[／/;；\n]|、(?=\s*(?:外装|外箱|単品|個装|内箱|カートン))/).map((x) => x.trim()).filter(Boolean).forEach((sg) => {
            const ctx = (kv ? lab : head) + " " + sg;
            const kind = CTN.test(sg) || CTN.test(kv ? lab : head) ? (UNIT.test(sg) && !CTN.test(sg) ? "unit" : "ctn") : (UNIT.test(ctx) ? "unit" : "?");
            out.push({ ri, ci, lab, head, sg, kind, dim: dimOf(sg), noval: NOVAL.test(sg) && !/\d/.test(sg.replace(/\(.*?\)|（.*?）/g, "")) });
          });
        });
        if (kv && !r.slice(1).some((x) => String(x || "").trim())) { // 1列だけの行（「単品 175×95mm」など）
          String(lab).split(/[／/;；\n]/).map((x) => x.trim()).filter(Boolean).forEach((sg) => out.push({ ri, ci: -1, lab: "", head: "", sg, kind: CTN.test(sg) && !(/単品|個装/.test(sg) && !/外装|外箱|カートン/.test(sg)) ? "ctn" : (UNIT.test(sg) ? "unit" : "?"), dim: dimOf(sg), noval: NOVAL.test(sg) }));
        }
      });
    } catch (e) { err("segs", e); }
    return out;
  }
  /* hear の担当の window.v101dims（あれば）から外装の寸法を読む */
  function ctnFromHear(t) {
    try {
      if (typeof W.v101dims !== "function") return null;
      const d = W.v101dims(t); if (!d) return null;
      const c = d.ctn || d.outer || d.carton || d.case || null;
      if (!c) return null;
      if (c.txt && /\d/.test(c.txt)) return { txt: String(c.txt), n: (dimOf(c.txt) || {}).n || [] };
      /* まとめ役（11/22）：hear の取り決めでは carton.w は重さ（kg）。幅は wd だけを読み、縦・横・高さの3つがそろうときだけ使う */
      const L = [c.l, c.wd, c.h].filter((v) => v != null && isFinite(+v) && +v > 0).map(Number);
      if (L.length === 3) return { txt: L.join("×") + " cm", n: L };
    } catch (e) { err("hearDims", e); }
    return null;
  }
  /* 外装の寸法（読めなければ null）・単品の寸法（あれば） */
  function dimInfo(t) {
    const S = segsOf(t);
    let ctn = ctnFromHear(t);
    if (!ctn) { const c = S.find((x) => x.kind === "ctn" && x.dim); if (c) ctn = { txt: c.dim.txt.replace(/(\d)(mm|cm|m)$/, "$1 $2"), n: c.dim.n, sg: c.sg }; }
    const units = S.filter((x) => x.kind !== "ctn" && x.dim);
    const unit = units.find((x) => x.kind === "unit") || units[0] || null;
    return { segs: S, ctn, unit: unit ? { txt: unit.dim.txt, n: unit.dim.n, sg: unit.sg } : null, units };
  }
  V.dimInfo = dimInfo;
  /* その値は寸法表の単品・「不明」の行から来たものか（利用者が書類の編集で打った外装の寸法は残す） */
  function leaked(v, t, I) {
    const s = NF(v).trim();
    if (!s || /^[—\-–]$/.test(s)) return false;
    if (I.ctn) { const d = dimOf(s); if (d && sameNums(d, { n: I.ctn.n })) return false; }
    if (NOVAL.test(s) && !(dimOf(s))) return true; // 「不明（資料に記載なし）」など＝値ではない
    if (UNIT.test(s) && !CTN.test(s)) return true; // 「単品サイズ / 175×95mm」
    const d = dimOf(s);
    if (d && I.units.some((u) => sameNums(u.dim, d))) return true; // 単品の寸法と同じ数
    try { // 寸法表の1行目をそのままつないだもの（土台の buildShip の作り）
      const rows = (t && Array.isArray(t.dimRows) ? t.dimRows : []).filter(Array.isArray);
      const j = (r, sep) => r.filter(Boolean).join(sep);
      if (rows.some((r) => [" / ", "／", " "].some((sep) => NF(j(r, sep)).trim() === s)) && !(I.ctn && d && sameNums(d, { n: I.ctn.n }))) return true;
    } catch (e) { /* 次へ */ }
    return false;
  }
  /* 梱包明細の Carton size を直す。直したら true */
  function fixPlEx(S, t) {
    try {
      const R = S && S.docRows; if (!R || !Array.isArray(R.plEx)) return false;
      if (S.v92unitpl) return false; // 箱に入れない貨物（車両・機械など）は単品の寸法が正しい
      const row = R.plEx.find((x) => Array.isArray(x) && x[0] === "Carton size"); if (!row) return false;
      const I = dimInfo(t);
      const v = String(row[1] == null ? "" : row[1]);
      let nv = v;
      if (leaked(v, t, I)) nv = I.ctn ? I.ctn.txt : "—";
      else if ((!v.trim() || /^[—\-–]$/.test(v.trim())) && I.ctn) nv = I.ctn.txt;
      if (S.v68plRaw && leaked(S.v68plRaw, t, I)) { S.v68plRaw = ""; }
      if (nv !== v) { row[1] = nv; S.v101pl = { was: v.slice(0, 80), now: nv, at: Date.now() }; cnt("plCarton"); return true; }
    } catch (e) { err("plEx", e); }
    return false;
  }
  V.fixPlEx = fixPlEx;
  /* 出荷案件の貨物の文：単品の寸法を外装のように書かない */
  function fixCargo(S, t) {
    try {
      if (!S || S.poNo || S.v56shipPack === 1) return false;
      const c = String(S.cargo || "");
      const rows = (t && Array.isArray(t.dimRows) ? t.dimRows : []).filter(Array.isArray);
      const r0 = rows[0] ? rows[0].filter(Boolean).join("／") : "";
      if (!c || c !== r0) return false; // 土台の作り（1行目をつないだもの）のときだけ
      const I = dimInfo(t);
      if (I.ctn) return false;
      const nv = I.unit ? "単品 " + I.unit.txt.replace(/(\d)(mm|cm|m)$/, "$1$2") + "／外装（カートン）の寸法・入数：未登録" : "寸法・重量：未登録（外装のカートンの寸法・入数が寸法表にありません）";
      if (nv === c) return false;
      S.cargo = nv; S.v101cargo = c; cnt("cargo");
      return true;
    } catch (e) { err("cargo", e); }
    return false;
  }
  V.fixCargo = fixCargo;
  /* 入数：外装の入数の欄（ctn）・寸法表の「…入」が、パレットあたりの数・1箱の中身なら、1カートンの入数として読まない */
  const qtyUnitOf = (s) => { const m = NF(s).match(/\d[\d,]*(?:\.\d+)?\s*([^\s\d（(,.]{1,4})/); return m ? m[1].replace(/以上|から|〜/g, "") : ""; };
  const JPC = /^(枚|個|本|袋|箱|セット|パック|缶|瓶|ケース|カートン|台|足|着|点|粒|錠|包|組|ロール|巻|冊|脚)$/;
  function badPerText(txt, t, n) {
    try {
      const s = NF(txt).replace(/,/g, "");
      if (!s || !n) return false;
      const re = new RegExp("(^|[^\\d.])" + String(n) + "(?![\\d.])");
      const m = re.exec(s); if (!m) return false;
      const at = m.index + m[1].length + String(n).length;
      const after = s.slice(at, at + 16);
      if (PALLET.test(after) || (PALLET.test(s) && /^\s*(ケース|カートン|箱|cases?|cartons?|ctns?)/i.test(after))) return true; // 40ケース／パレット＝1パレットの箱の数
      const cm = (after.match(/^\s*([^\s\d入（(・、,／/]{1,4})/) || [])[1] || "";
      const qu = qtyUnitOf((t && t.moq) || "") || qtyUnitOf(((t && t.priceRows && t.priceRows[0]) || [])[0] || "");
      if (cm && qu && JPC.test(cm) && JPC.test(qu) && cm !== qu) return true; // 50枚入（売る単位は箱）＝1箱の中身
    } catch (e) { err("badPer", e); }
    return false;
  }
  V.badPerText = badPerText;
  if (typeof W.v68trPackInfo === "function" && !W.v68trPackInfo.v101out) {
    const __pi101 = W.v68trPackInfo;
    const f = function () {
      const r = __pi101.apply(this, arguments);
      try {
        const t = ten();
        if (r && r.per > 0 && t) {
          const ctnTxt = String(t.ctn || "");
          const fromCtn = new RegExp("(^|[^\\d])" + r.per + "(?![\\d])").test(NF(ctnTxt).replace(/,/g, ""));
          const ctnSeg = segsOf(t).some((x) => x.kind === "ctn" && new RegExp("(^|[^\\d])" + r.per + "\\s*(個|本|袋|枚|箱|セット|缶|瓶|pcs?|units?)?\\s*入").test(x.sg.replace(/,/g, "")));
          if (!ctnSeg && fromCtn && badPerText(ctnTxt, t, r.per)) { r.v101perWas = r.per; r.per = 0; cnt("perPallet"); }
          else if (!ctnSeg && !fromCtn) { const hit = segsOf(t).filter((x) => new RegExp("(^|[^\\d])" + r.per + "(?![\\d])").test(x.sg.replace(/,/g, ""))); if (hit.length && hit.every((x) => badPerText(x.sg, t, r.per))) { r.v101perWas = r.per; r.per = 0; cnt("perUnit2"); } }
        }
      } catch (e) { err("packInfo", e); }
      return r;
    };
    f.v101out = 1;
    W.v68trPackInfo = f;
  }
  /* 商品を切り替えた直後の tenantToD の中で、v56 の貨物の計算（v56shipPack → v56shipCtnInfo）が前の商品の D（寸法表）を読んでいた
     （手元：E の貨物が前の商品の「21カートン（420×300×260mm・24箱入）」になった＝商品またぎ）。作っている商品の d を読ませる */
  const ctxSwap = (fn, self, args) => {
    const nd = V.ctxD;
    let cur = null; try { cur = (typeof D !== "undefined") ? D : null; } catch (e) { cur = null; } // eslint-disable-line no-undef
    if (!nd || nd === cur) return fn.apply(self, args);
    try { D = nd; } catch (e) { return fn.apply(self, args); } // eslint-disable-line no-global-assign, no-undef
    cnt("ctxD");
    try { return fn.apply(self, args); } finally { try { D = cur; } catch (e) { /* 戻せないときはそのまま */ } } // eslint-disable-line no-global-assign, no-undef
  };
  if (typeof W.v56shipCtnInfo === "function" && !W.v56shipCtnInfo.v101out) {
    const __ci101 = W.v56shipCtnInfo;
    const f = function () {
      const r = ctxSwap(__ci101, this, arguments);
      try {
        const d = V.ctxD || (typeof D !== "undefined" && D) || null; // eslint-disable-line no-undef
        if (r && r.per > 0 && d) {
          const S = segsOf(d);
          const hit = S.filter((x) => new RegExp("(^|[^\\d])" + r.per + "(?![\\d])").test(x.sg.replace(/,/g, "")));
          if (hit.length && hit.every((x) => badPerText(x.sg, d, r.per) || (x.kind === "unit" && !/入数|入り数/.test(x.head + x.lab)))) { r.v101perWas = r.per; r.per = 0; cnt("perUnit"); }
          else if (!hit.length && badPerText(String(d.ctn || ""), d, r.per)) { r.v101perWas = r.per; r.per = 0; cnt("perUnit"); }
        }
      } catch (e) { err("ctnInfo", e); }
      return r;
    };
    f.v101out = 1;
    W.v56shipCtnInfo = f;
  }
  if (typeof W.buildShip === "function" && !W.buildShip.v101out) {
    const __bs101 = W.buildShip;
    const f = function (d, t) {
      if (d && V.inTTD) V.ctxD = d;
      const S = __bs101.apply(this, arguments);
      try { if (S && t) { fixPlEx(S, t); fixCargo(S, t); } } catch (e) { err("buildShip", e); }
      return S;
    };
    f.v101out = 1;
    W.buildShip = f;
  }
  if (typeof W.tenantToD === "function" && !W.tenantToD.v101out) { // 書類の編集の控え（shipEdit）が後から重なっても
    const __td101 = W.tenantToD;
    const f = function (t) {
      const was = V.inTTD, wasD = V.ctxD;
      V.inTTD = 1; V.ctxD = null;
      let d;
      try { d = __td101.apply(this, arguments); } finally { V.inTTD = was; V.ctxD = wasD; }
      try { if (d && d.ship && t) { fixPlEx(d.ship, t); fixCargo(d.ship, t); } } catch (e) { err("ttd", e); }
      return d;
    };
    f.v101out = 1;
    W.tenantToD = f;
  }
  if (typeof W.v68trPlFill === "function" && !W.v68trPlFill.v101out) {
    const __pf101 = W.v68trPlFill;
    const f = function (S) {
      const r = __pf101.apply(this, arguments);
      try { const t = ten(); if (S && t) fixPlEx(S, t); } catch (e) { err("plFill", e); }
      return r;
    };
    f.v101out = 1;
    W.v68trPlFill = f;
  }
})();

/* ═══ v22.01 out（英語営業資料の中身）No.543 同じ情報を2枚に出さない／No.619 材質表の見出しと行・列の対応 ═══
   No.543（未解消）A：6枚目「WHAT'S INSIDE」に「Allergen: Soybean」、7枚目「INGREDIENT LIST」にも「Allergens: Soybean」。
     本番の本物の AI（11/22・直す前）でも、6枚目の商品のページの特長に「Allergen declared: soybeans」・7枚目の成分の表に「Allergens｜Soybeans」、
     品質のページに「Ambient storage」「Payment by T/T, 100% in advance」（3枚目の要約・9枚目の取引条件と同じ）、商品の特長に「Shelf life of 12 months」
     （3枚目と10枚目にもある）が出た。
     原因：成分のページ（WHAT'S INSIDE の札）・商品の特長・品質のページは、AI が書いた文と登録の表から別々に作り、表のページ
           （成分・仕様の表・要約・取引条件）にある事実をもう一度書いても、重なりを見ていなかった。
     直し：アレルゲンは「成分・仕様の表」に1か所（バイヤーが表示・通関の確認で見る所）。表にあれば、成分のページの札・商品の特長・品質のページから外す。
           表が無く成分のページだけにあるときは、成分のページに残す。
           賞味期限・保存方法・支払・リードタイム・MOQ・建値・保証・内容量は、表のページ（要約・成分／仕様の表・取引条件）にあれば、
           AI が書いた商品の特長・品質のページの同じ事実だけの項目を外す（売りの文はそのまま）。外したものは最終チェックの ✓ に書く。
   No.619（中）G：6枚目「MATERIAL & SPECIFICATIONS」で「Ingredient」列に「No food contact」が繰り返し出て、ブナ材・水性塗料の行と混ざった。
     （原因と直しは下の節） */
(function () {
  "use strict";
  const W = window, V = W.V101OUT;
  if (!V || V._deck) return;
  V._deck = 1;
  const err = V.errf, NF = V.NF;
  const cnt = (k, d) => { try { const x = d == null ? 1 : +d; if (x) V.n[k] = (V.n[k] || 0) + x; } catch (e) { /* 数えるだけ */ } };
  const txt = (x) => (x == null ? "" : typeof x === "string" ? x : (x.t || x.name || x.n || "") + (x.d ? " / " + x.d : ""));
  /* 事実の種類（資料の言語は英・中・西・仏・独・日。見出しで見分ける） */
  const FACT = [
    ["allergen", /\ballerg|alérg|allergè|allergen|过敏|過敏|アレルゲン|アレルギー|알레르/i],
    ["shelf", /\bshelf[- ]?life\b|\bbest[- ]before\b|\bexpir(?:y|ation)\b|\buse[- ]by\b|保质期|保存期限|賞味期限|消費期限|vida útil|caducidad|durée de conservation|mindesthaltbar/i],
    ["storage", /\bstorage\b|\bstore (?:at|in|away)\b|\bambient\b|储存|貯存|保存方法|almacenamiento|conservation\b|lagerung/i],
    ["payment", /\bpayment\b|\bT\/T\b|\bL\/C\b|付款|支払|forma de pago|\bpago\b|paiement|zahlung/i],
    ["lead", /\blead[- ]?time\b|交货期|交期|リードタイム|plazo de entrega|délai/i],
    ["moq", /\bMOQ\b|\bminimum order\b|最小起订|起订量|最小発注|pedido mínimo|commande minimum/i],
    ["warranty", /\bwarrant(?:y|ies)\b|\bguarantee\b|保修|保証|garantía|garantie/i],
    ["netc", /\bnet (?:content|weight|volume)s?\b|净含量|内容量|contenido neto|contenu net|nettoinhalt/i],
    ["sterile", /\bsteril|\bnon[- ]sterile\b|灭菌|滅菌|无菌|estéril|stérile/i],
    ["incoterms", /\bincoterms?\b|^\s*(?:FOB|CIF|CFR|EXW|DDP|DAP|FCA)\b|\btrade terms\b|\bport of (?:shipment|loading)\b|贸易条件|建値|incoterm|condiciones de entrega/i]
  ];
  const factOf = (s) => { const t = NF(s); for (const [k, re] of FACT) if (re.test(t)) return k; return ""; };
  V.factOf = factOf;
  /* 表のページにある事実：成分・仕様の表（行の名前）・要約（ten の値）・取引条件（価格のページの条件） */
  function tableFacts(M, T) {
    const F = new Set();
    try {
      [].concat(M.specsList || [], M.specsP1 ? [M.specsP1] : []).forEach((sp) => (sp && sp.rows || []).forEach((r) => { const k = factOf(r && r[0]); if (k) F.add(k); }));
      const P = M.pricing || {};
      [].concat(P.terms || [], ...(P.groups || []).map((g) => g.terms || [])).forEach((x) => { const k = x && (x.key === "moq" ? "moq" : factOf(x.k)); if (k) F.add(k); });
      if (T) { if (String(T.shelf || "").trim()) F.add("shelf"); if (String(T.store || "").trim()) F.add("storage"); if (String(T.term || "").trim() && (P.groups || P.terms)) F.add("incoterms"); }
    } catch (e) { err("tableFacts", e); }
    return F;
  }
  const allergenInTable = (M) => [].concat(M.specsList || []).some((sp) => (sp && sp.rows || []).some((r) => factOf(r && r[0]) === "allergen"));
  function dedupe(M, T, lang) {
    const out = [];
    try {
      if (!M || /^ja/.test(String(lang || ""))) return out;
      const F = tableFacts(M, T);
      const inTbl = allergenInTable(M);
      // 成分のページ（WHAT'S INSIDE）：アレルゲンは表にあれば外す
      const ing = M.ingr;
      if (ing && inTbl) {
        (ing.groups || []).forEach((g) => {
          if (!g || !Array.isArray(g.items)) return;
          if (factOf(g.name) === "allergen") { g.items.forEach((x) => out.push({ where: "ingr", t: (g.name || "") + "：" + txt(x) })); g.items = []; return; }
          const n0 = g.items.length;
          g.items = g.items.filter((x) => { const hit = factOf(txt(x)) === "allergen"; if (hit) out.push({ where: "ingr", t: txt(x) }); return !hit; });
          if (g.items.length !== n0) cnt("dupIngr", n0 - g.items.length);
        });
        ing.groups = (ing.groups || []).filter((g) => g && (g.items || []).length);
        if (ing.hero && factOf(ing.hero.name) === "allergen") { out.push({ where: "ingr", t: ing.hero.name }); ing.hero = null; }
        if (ing.note && factOf(ing.note) === "allergen" && NF(ing.note).length < 160) { out.push({ where: "ingr", t: ing.note }); ing.note = ""; }
        if (!ing.hero && !(ing.groups || []).length) { M.ingr = null; if (M.specsP1) { M.specsList = [M.specsP1].concat(M.specsList || []); M.specsP1 = null; M.ingrCovers = 0; } }
      }
      // AI が書いた商品の特長・品質のページ：表のページにある事実だけの項目を外す（アレルゲンは表か成分のページにあれば）
      const has = (k) => F.has(k) || (k === "allergen" && (inTbl || !!(M.ingr && (M.ingr.groups || []).some((g) => factOf(g.name) === "allergen" || (g.items || []).some((x) => factOf(txt(x)) === "allergen")))));
      const prune = (arr, where) => (arr || []).filter((x) => {
        const head = NF((x && (x.t || x.name)) || (typeof x === "string" ? x : ""));
        if (where === "feat" && x && typeof x === "object" && !head.trim()) { out.push({ where, k: "empty", t: txt(x) }); return false; } // 見出しの無い特長（「 / Registered product category.」）
        const k = factOf(head) || (factOf(x && x.d) === "allergen" && /allerg|alérg|过敏|アレルゲン/i.test(head + " " + (x && x.d)) && NF(head).length < 40 ? "allergen" : "");
        if (k && has(k)) { out.push({ where, k, t: txt(x) }); return false; }
        return true;
      });
      (M.products || []).forEach((p) => { if (p && Array.isArray(p.feats)) { const n0 = p.feats.length; p.feats = prune(p.feats, "feat"); if (p.feats.length !== n0) cnt("dupFeat", n0 - p.feats.length); } });
      // 梱包・物流のページの「Warranty: …」は、仕様の表に保証の行があれば外す（物流の事実ではなく、表と重なる）
      try {
        const specW = [].concat(M.specsList || [], M.specsP1 ? [M.specsP1] : []).some((sp) => (sp && sp.rows || []).some((r) => factOf(r && r[0]) === "warranty"));
        if (specW) (M.packs || []).forEach((pk) => { if (pk && Array.isArray(pk.facts)) { const n0 = pk.facts.length; pk.facts = pk.facts.filter((f) => { const lab = NF((f && (f.k || f.t || f.l)) || (Array.isArray(f) ? f[0] : "")); const hit = factOf(lab) === "warranty"; if (hit) out.push({ where: "pack", k: "warranty", t: lab + "：" + NF((f && (f.v || f.d)) || (Array.isArray(f) ? f[1] : "")) }); return !hit; }); if (pk.facts.length !== n0) cnt("dupPack", n0 - pk.facts.length); } });
      } catch (e) { err("dupPack", e); }
      if (M.quality && Array.isArray(M.quality.items)) {
        const q0 = M.quality.items.slice(), n0 = q0.length, mark = out.length;
        let q1 = prune(q0, "quality");
        // 品質のページは2項目未満だと作られない（土台の DK3_SL.quality）。重なりを外して1項目だけ残るときは、その項目（売りの文）を
        // 商品の特長に移す（6項目まで）。移せないときは外すのをやめてページを残す（売りの文を失わない）
        if (q1.length === 1 && n0 >= 2) {
          const p0 = (M.products || [])[0];
          const same = (a, b) => NF(a && a.t).trim().toLowerCase() === NF(b && b.t).trim().toLowerCase();
          if (p0 && Array.isArray(p0.feats) && p0.feats.length < 6) { if (!p0.feats.some((f) => same(f, q1[0]))) p0.feats.push(q1[0]); q1 = []; cnt("qualityMoved"); }
          else { out.splice(mark); q1 = q0; }
        }
        M.quality.items = q1;
        if (q1.length !== n0) cnt("dupQuality", n0 - q1.length);
        if (!q1.length) M.quality = null;
      }
    } catch (e) { err("dedupe", e); }
    return out;
  }
  V.dedupe = dedupe;
  V.lastDup = null;

  /* ════ No.619 材質・仕様の表：食品でない商品で「Ingredient」の見出しを使わない／「No food contact」だけの行を部位の行にしない ════
     原因：仕様の表のページは、登録の表の1列目の見出し（「原材料名」「成分」など）と小見出し（compTitle「成分表／仕様表」）をそのまま訳して使う。
           食品でない商品（G 木製パズル）でも「Ingredient」「Ingredients / Specifications Table」になる（本番の本物の AI・11/22 の G でも小見出しが
           「Ingredients / Specifications Table」）。ヒアリングの取り込みで「食品接触なし」が行の名前（1列目）に入ると、材質の行（ブナ材・水性塗料）の
           間に「No food contact」の行が何度も並び、部位と材質の対応が崩れる（UAT の G）。
     直し：食品・化粧品・ペットフードでない商品の表は、1列目の見出しを「Part」（中「部件」・西「Pieza」）、小見出しの Ingredients を Materials に。
           1列目が「No food contact」などの注記だけの行は部位の行から外し、表の最後に「Food contact｜None of the parts come into contact with food」を1行だけ置く
           （入力どおり。2回以上は出さない）。値の列の「· No food contact」はそのまま（B の材質表の形＝第13回で直った形を変えない）。 */
  const FOODNOTE = /^(?:no food contact|not in contact with food|no (?:parts?|components?) (?:that )?(?:come|comes|coming) into contact with food|food contact\s*[:：]?\s*(?:none|no)|non[- ]food[- ]contact|食品接触なし|食品に触れ(?:る部材)?(?:ない|なし|は(?:ありません|ない))|不接触食品|无食品接触|sin contacto con (?:los )?alimentos)\.?$/i;
  const INGH = /^(?:ingredients?(?: list)?|raw materials?|composition|成分|原材料名?|配料|ingredientes?|ingrédients?|zutaten)$/i;
  const PARTH = { en: "Part", zh: "部件", es: "Pieza", fr: "Pièce", de: "Teil", ko: "부위" };
  const FCROW = { en: ["Food contact", "None of the parts come into contact with food"], zh: ["食品接触", "没有接触食品的部件"], es: ["Contacto con alimentos", "Ninguna pieza entra en contacto con alimentos"], fr: ["Contact alimentaire", "Aucune pièce n’entre en contact avec les aliments"], de: ["Lebensmittelkontakt", "Keine Teile kommen mit Lebensmitteln in Berührung"], ko: ["식품 접촉", "식품에 닿는 부품 없음"] };
  function nonFood(T) {
    try {
      const ck = String((T && T.catKey) || ""), c = String((T && T.cat) || "") + " " + String((T && T.item) || "");
      if (/^(food|cosme|liquor|medical|pet)$/.test(ck)) return false;
      if (/サプリ|健康食品|化粧|食品|飲料|酒|茶|調味|菓子|ペットフード|おやつ|ジャーキー|フード|飼料|みそ|味噌|醤油|食用|美容液|コスメ/.test(c)) return false;
      return true;
    } catch (e) { return false; }
  }
  V.nonFood = nonFood;
  function matFix(M, data, lang, T) {
    let n = 0; const what = [];
    try {
      if (!M || !T || !nonFood(T)) return 0;
      const L2 = String(lang || "en").slice(0, 2);
      [].concat(M.specsList || [], M.specsP1 ? [M.specsP1] : []).forEach((sp) => {
        if (!sp) return;
        const ingRows = (sp.rows || []).some((r) => /^(?:ingredients?|active ingredients?|composition|成分|原材料名?|有効成分|配料|ingredientes?)$/i.test(NF(r && r[0]).trim()));
        if (!ingRows && Array.isArray(sp.hdr) && INGH.test(NF(sp.hdr[0]).trim())) { what.push("見出し「" + sp.hdr[0] + "」→「" + (PARTH[L2] || PARTH.en) + "」"); sp.hdr[0] = PARTH[L2] || PARTH.en; n++; }
        if (!ingRows && sp.eb && /ingredient|成分|原材料|配料|ingrediente/i.test(sp.eb)) { const e0 = sp.eb; sp.eb = String(sp.eb).replace(/\bIngredients?\b/g, "Materials").replace(/\bINGREDIENTS?\b/g, "MATERIALS").replace(/成分表|原材料/g, "材质表").replace(/\bIngredientes\b/g, "Materiales"); if (sp.eb !== e0) { what.push("小見出し「" + e0 + "」→「" + sp.eb + "」"); n++; } }
        if (!ingRows && sp.title && /ingredient/i.test(sp.title)) { const t0 = sp.title; sp.title = String(sp.title).replace(/\bIngredients?\b/g, "Materials"); if (sp.title !== t0) n++; }
        if (Array.isArray(sp.rows)) {
          let fc = 0, sw = 0;
          const keep = sp.rows.filter((r) => {
            const a = NF(r && r[0]).trim(), b = NF(r && r[1]).trim();
            if (FOODNOTE.test(a) && (!b || FOODNOTE.test(b) || /^[—\-–]$/.test(b))) { fc++; return false; }
            if (FOODNOTE.test(a) && b) { r[0] = r[1]; r[1] = a; sw++; } // 「No food contact｜ブナ材」＝材質が値の欄に入った行：材質を1列目に、注記を値の欄に
            return true;
          });
          if (sw) {
            const MATH = { en: "Material", zh: "材质", es: "Material", fr: "Matériau", de: "Material", ko: "재질" };
            if (Array.isArray(sp.hdr)) sp.hdr[0] = MATH[L2] || MATH.en; else sp.hdr = [MATH[L2] || MATH.en, ""];
            what.push("材質が値の欄に入り1列目が「No food contact」だった行 " + sw + "行の、行と列の対応を直しました（1列目＝材質）");
            n += sw;
          }
          if (fc) {
            const has = keep.some((r) => /food contact|食品接触|contacto con|contact alimentaire|lebensmittel/i.test(NF(r && r[0])));
            const row = FCROW[L2] || FCROW.en;
            if (!has) keep.push([row[0], row[1]]);
            sp.rows = keep;
            what.push("「No food contact」だけの行 " + fc + "行を部位の行から外し、最後に1行「" + row[0] + "｜" + row[1] + "」");
            n += fc;
          }
        }
      });
    } catch (e) { err("matFix", e); }
    if (n) { cnt("matFix", n); V.lastMat = { at: Date.now(), n, msg: "材質・仕様の表の列を、食品でない商品の形に直しました：" + what.join("・") }; }
    return n;
  }
  V.matFix = matFix;

  /* ════ No.617 の同じ種類（資料の側）：梱包・物流のページの寸法表 ════
     本番の本物の AI（11/22・E）：「Quantity per Case｜50 pcs per box」（1箱の中身を1ケースの入数の欄に）・「Outer Carton W×D×H｜（空）」
     直し：1ケースの入数の欄の値が「per box / 枚入」など1箱の中身なら、項目名を「Quantity per box」に（1ケースの入数としない）。
           外装（Outer carton）の寸法・重量・入数の欄が空なら「To be confirmed」（空の欄で出さない・単品の寸法で埋めない）。 */
  const TBC = { en: "To be confirmed", zh: "待确认", es: "Por confirmar", fr: "À confirmer", de: "Noch zu bestätigen", ko: "확인 예정" };
  const PERBOX = { en: "Quantity per box", zh: "每盒数量", es: "Cantidad por caja", fr: "Quantité par boîte", de: "Menge pro Schachtel", ko: "상자당 수량" };
  const CTNLAB = /outer|carton|master|case|外箱|外装|カートン|箱规|外箱尺寸|caja (?:maestra|exterior)|carton/i;
  const PERCASE = /(?:quantity|units?|pcs|qty)\s*(?:per|\/)\s*(?:case|carton|ctn)|入数|每箱(?:数量)?|por caja (?:maestra|exterior)|cantidad por caja/i;
  const PERUNITV = /\bper\s+(?:box|pack|bag|bottle|set)\b|\/\s*(?:box|pack|bag)\b|枚入|個入|每盒|por (?:caja|paquete|bolsa)\b/i;
  const emptyV = (v) => { const s = NF(v).trim(); return !s || /^[—\-–]$/.test(s); };
  function packFix(M, lang) {
    let n = 0;
    try {
      const L2 = String(lang || "en").slice(0, 2);
      (M.packs || []).forEach((pk) => {
        if (!pk || !Array.isArray(pk.rows)) return;
        const cols = Array.isArray(pk.cols) ? pk.cols : [];
        const kv = !cols.length || cols.length <= 2;
        if (kv) {
          pk.rows.forEach((r) => {
            if (!Array.isArray(r) || r.length < 2) return;
            const lab = NF(r[0]);
            if (PERCASE.test(lab) && PERUNITV.test(NF(r[1]))) { r[0] = PERBOX[L2] || PERBOX.en; n++; }
            else if (emptyV(r[1]) && NF(lab).trim()) { r[1] = TBC[L2] || TBC.en; n++; } // 空の欄（外装の寸法・重量・単品の重量など）は「To be confirmed」
          });
        } else {
          cols.forEach((c, ci) => {
            const lab = NF(c);
            const vals = pk.rows.map((r) => (Array.isArray(r) ? r[ci] : ""));
            if (PERCASE.test(lab) && vals.some((v) => PERUNITV.test(NF(v))) && vals.every((v) => emptyV(v) || PERUNITV.test(NF(v)))) { cols[ci] = PERBOX[L2] || PERBOX.en; n++; }
            else if (NF(lab).trim() && vals.length && vals.every(emptyV)) { pk.rows.forEach((r) => { if (Array.isArray(r)) r[ci] = TBC[L2] || TBC.en; }); n++; }
          });
        }
      });
    } catch (e) { err("packFix", e); }
    if (n) cnt("packFix", n);
    return n;
  }
  V.packFix = packFix;
  if (typeof W.dk3Model === "function" && !W.dk3Model.v101out) {
    const __dm101 = W.dk3Model;
    const f = function (lang0, plan, data, ph, deck, src, T) {
      const M = __dm101.apply(this, arguments);
      try {
        if (M && lang0 && !/^ja/.test(String(lang0))) {
          const tt = T || V.ten();
          if (typeof V.matFix === "function") V.matFix(M, data, lang0, tt);
          if (typeof V.packFix === "function") V.packFix(M, lang0);
          const d = dedupe(M, tt, lang0);
          V.lastDup = { at: Date.now(), uid: V.pkey(tt), lang: lang0, list: d };
          V.lastM = M;
        }
      } catch (e) { err("model", e); }
      return M;
    };
    f.v101out = 1;
    W.dk3Model = f;
  }
  /* 最終チェックの ✓：外した重なり（何を・どこから・どこに残したか） */
  if (typeof W.dk3Check === "function" && !W.dk3Check.v101out) {
    const __ck101 = W.dk3Check;
    const f = function (deck) {
      const r = __ck101.apply(this, arguments);
      try {
        const L = V.lastDup;
        if (r && L && L.list && L.list.length && Date.now() - L.at < 15 * 60000 && deck && deck.lang === L.lang && Array.isArray(r.ok) && !r.ok.some((x) => /^同じ情報が2枚に重ならないよう/.test(String(x)))) {
          const W2 = { ingr: "成分のページ", feat: "商品の特長", quality: "品質のページ", pack: "梱包・物流のページ" };
          const s = L.list.slice(0, 6).map((x) => (W2[x.where] || x.where) + "「" + String(x.t).replace(/\s+/g, " ").slice(0, 40) + "」").join("・");
          r.ok.push("同じ情報が2枚に重ならないよう、表のページ（成分・仕様の表・要約・取引条件）にある事実を、ほかのページから外しました（" + L.list.length + "件）：" + s);
        }
        if (r && V.lastMat && V.lastMat.n && Date.now() - V.lastMat.at < 15 * 60000 && Array.isArray(r.ok) && !r.ok.some((x) => /^材質・仕様の表の列を/.test(String(x)))) r.ok.push(V.lastMat.msg);
      } catch (e) { err("check", e); }
      return r;
    };
    f.v101out = 1;
    W.dk3Check = f;
  }
})();

/* ═══ v22.01 out No.552 の残り：写真の加工（切り取る・ぼかす）が資料に入ったか分かるように／加工後の AI の再確認の言い方（第14回 No.629） ═══
   原因：①「切り取る・隠す」で保存すると、写真（登録）は加工した写真に替わるが、いま開いている資料・保存済みの資料（「保存した営業資料」）は
           作ったときの写真のまま。作り直すまで資料は変わらないのに、知らせは「加工しました。資料に使います」だけで、
           保存済みの資料の時刻も変わらないため、入ったのかどうかが画面から分からなかった。
         ② 加工のあと AI がもう一度確かめて「日本語の文字が残る」と言うと、22.00.1 は「切り取った後も…」と出す（ぼかした・塗ったときも）。
           UAT の写真（色背景＋商品名・会社名・UAT sample image）は文字が何段にもあり、帯（写真の 25%）で1段だけぼかすと、
           ほかの段の日本語（会社名など）が残る。AI の見立てはその残りを言っているが、言い方が「切り取った後も」で、どこが残るか分からなかった。
   直し：① 自動で作り直さず（文章を書き直さない・保存済みの版を勝手に替えない）、「作り直すと入る」を画面の文字で出す（決め：推奨 a）。
           加工した写真が、いま開いている資料より新しいときは、資料の画面に「加工した写真は、まだこの資料（◯時◯分に作成）には入っていません。
           保存済みの資料も加工の前の写真のままです」と、1回で入れ直せるボタン「加工した写真で作り直す（文章はそのまま）」を出す
           （前回の文章を使って組み立て直すだけ＝文章を書く AI は使わない）。作り直した後は「✓ 加工した写真を入れて作り直しました（◯時◯分）」。
           加工したときの知らせも「いまの資料には、作り直すと入ります」に。
         ② 加工のあとの知らせと最終チェックの文を、した加工（切り取る／ぼかす／塗る）どおりにし、「加工した範囲の外にも日本語の文字
           （会社名・説明文など）が写っている可能性」と、AI が見た文字の広さ（写真の約 N%）を出す。進め方は「ほかの文字の所も囲む／使わない」。 */
(function () {
  "use strict";
  const W = window, V = W.V101OUT;
  if (!V || V._photo) return;
  V._photo = 1;
  const err = V.errf, M = V.M;
  const cnt = (k, d) => { try { const x = d == null ? 1 : +d; if (x) V.n[k] = (V.n[k] || 0) + x; } catch (e) { /* 数えるだけ */ } };
  const toast0 = (s) => { try { if (typeof toast === "function") toast(s); } catch (e) { /* 無視 */ } }; // eslint-disable-line no-undef
  const phFp = (o) => { try { const s = String((o && o.b64) || ""); let h = 0; for (let k = 0; k < s.length; k += 61) h = (h * 31 + s.charCodeAt(k)) >>> 0; return s.length + ":" + h; } catch (e) { return ""; } };
  V.phFp = phFp;
  const OPN = { crop: ["切り取った", "cropping", "裁剪", "recortar"], blur: ["ぼかした", "blurring", "模糊处理", "difuminar"], fill: ["塗った", "filling", "涂色", "rellenar"] };
  const opWord = (o) => { const ops = (o && o.v101edit && o.v101edit.ops) || (o && o.v96edit && o.v96edit.ops) || []; const k = ops.length ? ops[ops.length - 1] : "crop"; const a = OPN[k] || OPN.crop; return M(a[0], a[1], a[2], a[3]); };
  V.opWord = opWord;
  const hhmm = (ms) => { try { const d = new Date(+ms); return (d.getMonth() + 1) + "/" + d.getDate() + " " + String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); } catch (e) { return ""; } };
  V.hhmm = hhmm;
  const decOf = (o) => { try { return typeof W.v96dkDec === "function" ? (W.v96dkDec(o) || "") : ""; } catch (e) { return ""; } };
  /* 資料（DK3G.deck）がいつ作られたか：作ったとき・開いた保存済みの資料の時刻 */
  function deckAt(deck) {
    try {
      if (!deck) return 0;
      if (deck.v101at) return +deck.v101at;
      const T = V.ten(); const L = T && T.deck3 && T.deck3.last;
      if (L && L.lang === deck.lang && L.at) return Date.parse(L.at) || 0;
    } catch (e) { err("deckAt", e); }
    return 0;
  }
  V.deckAt = deckAt;
  /* 加工した写真のうち、いま開いている資料より新しいもの */
  function pendingEdits(T, deck) {
    const out = [];
    try {
      const at = deckAt(deck); if (!at) return out;
      ((T && T.assets && T.assets.ph) || []).forEach((o, i) => {
        if (!o || !o.b64 || !o.v101edit || decOf(o) === "no") return;
        if (o.v101edit.fp !== phFp(o)) return; // 加工の後に差し替えた・戻した
        if (+o.v101edit.at > at) out.push({ i, o, at: +o.v101edit.at });
      });
    } catch (e) { err("pend", e); }
    return out;
  }
  V.pendingEdits = pendingEdits;
  /* 加工した写真のうち、いま開いている資料に入っているもの（作り直した後の知らせ） */
  function doneEdits(T, deck) {
    const out = [];
    try {
      const at = deckAt(deck); if (!at) return out;
      const used = (W.V99PHOTO && typeof W.V99PHOTO.deckPhotos === "function") ? W.V99PHOTO.deckPhotos(deck) : null;
      ((T && T.assets && T.assets.ph) || []).forEach((o, i) => {
        if (!o || !o.b64 || !o.v101edit || o.v101edit.fp !== phFp(o) || decOf(o) === "no") return;
        if (+o.v101edit.at <= at && at - +o.v101edit.at < 6 * 3600000) out.push({ i, o, at: +o.v101edit.at, inDeck: used ? used.has(i) : null });
      });
    } catch (e) { err("done", e); }
    return out;
  }
  V.doneEdits = doneEdits;
  /* 加工の保存：時刻と中身の指紋を控え、知らせを「作り直すと入る」に */
  function wrapSave(fn) {
    if (typeof fn !== "function" || fn.v101out) return fn;
    const f = async function (T, i, ops) {
      const r = await fn.apply(this, arguments);
      try {
        if (r) {
          const o = ((T && T.assets && T.assets.ph) || [])[i];
          if (o && o.b64) {
            o.v101edit = { at: Date.now(), fp: phFp(o), ops: (ops || []).map((x) => x && x.t).filter(Boolean) };
            try { if (typeof W.saveTen === "function") W.saveTen(); } catch (e) { /* 次の保存で */ }
            const g = V.G(); const has = !!(g && g.deck && T && g.ten && V.pkey(g.ten) === V.pkey(T));
            const nm = M("商品写真" + (i + 1), "Product photo " + (i + 1), "商品照片" + (i + 1), "Foto " + (i + 1));
            toast0(has ? M(nm + "を加工して保存しました。いま開いている資料・保存済みの資料には、まだ入っていません（作り直すと入ります）。営業資料の画面の「加工した写真で作り直す（文章はそのまま）」を押してください",
              nm + " was edited and saved. It is not in the open deck or the saved decks yet; press “Rebuild with the edited photo (same text)” on the sales deck page",
              nm + "已编辑并保存。当前打开的资料和已保存的资料中还没有放入（重新制作后放入）。请在营业资料页面点击“用编辑后的照片重新制作（文字不变）”",
              nm + " se editó y guardó. Aún no está en la presentación abierta ni en las guardadas; pulse «Rehacer con la foto editada (mismo texto)»")
              : M(nm + "を加工して保存しました。次に作る資料から入ります", nm + " was edited and saved. It goes into the next deck you make", nm + "已编辑并保存，下次制作的资料中会放入", nm + " se editó y guardó; entrará en la próxima presentación"));
            cnt("editSave");
            try { if (typeof W.render === "function") W.render(); } catch (e) { /* 次へ */ }
          }
        }
      } catch (e) { err("editSave", e); }
      return r;
    };
    f.v101out = 1;
    return f;
  }
  try { if (W.V96DK && typeof W.V96DK.saveEdit === "function") W.V96DK.saveEdit = wrapSave(W.V96DK.saveEdit); } catch (e) { err("wrapSave", e); }
  try { if (typeof W.v96dkSaveEdit === "function") W.v96dkSaveEdit = wrapSave(W.v96dkSaveEdit); } catch (e) { err("wrapSave2", e); }
  /* 作ったとき・保存済みの資料を開いたときの時刻 */
  if (typeof W.dk3Generate === "function" && !W.dk3Generate.v101out) {
    const __gen101 = W.dk3Generate;
    const f = async function () {
      const r = await __gen101.apply(this, arguments);
      try { const g = V.G(); if (g && g.deck && !g.run && !g.deck.v101at) { g.deck.v101at = Date.now(); cnt("deckAt"); } } catch (e) { err("genAt", e); }
      return r;
    };
    f.v101out = 1;
    W.dk3Generate = f;
  }
  if (typeof W.dk14Open === "function" && !W.dk14Open.v101out) {
    const __op101 = W.dk14Open;
    const f = async function (id) {
      const r = await __op101.apply(this, arguments);
      try {
        const g = V.G(); const it = ((typeof DK14 !== "undefined" && DK14 && DK14.items) || []).find((x) => x && x.id === id); // eslint-disable-line no-undef
        if (g && g.deck && it && it.at) g.deck.v101at = Date.parse(it.at) || g.deck.v101at;
      } catch (e) { err("openAt", e); }
      return r;
    };
    f.v101out = 1;
    W.dk14Open = f;
  }
  /* 文章はそのまま、写真だけ入れ直して作り直す（前回の文章＝dk3Plan の控えを使う。force なし） */
  V.regenPhoto = function () {
    try {
      const g = V.G(); if (!g || g.run) return false;
      const lg = (g.deck && g.deck.lang) || g.lang || "en";
      V.regenAt = Date.now();
      W.dk3Generate(lg, false);
      cnt("regenPhoto");
      return true;
    } catch (e) { err("regen", e); return false; }
  };
  /* ② 加工のあとの AI の再確認：した加工どおりの言い方・範囲の外・広さ */
  function editJaMsg(o, i) {
    const nm = M("商品写真" + (i + 1), "Photo " + (i + 1), "商品照片" + (i + 1), "Foto " + (i + 1));
    const a = o && o._dq ? Number(o._dq.jpArea) : NaN;
    const ar = isFinite(a) && a > 0 ? M("（AI が見た文字の広さ：写真の約 " + Math.round(a) + "%）", " (text area seen by the AI: about " + Math.round(a) + "% of the photo)", "（AI 看到的文字面积：约占照片 " + Math.round(a) + "%）", " (área de texto: aprox. " + Math.round(a) + "% de la foto)") : "";
    const w = opWord(o);
    return M(nm + "：" + w + "範囲の外にも、日本語の文字（会社名・説明文など）が写っている可能性があります（AI の見立て）" + ar + "。「切り取る・隠す」で、ほかの文字の所も囲んで（写真の上をなぞると広く選べます）もう一度加工するか、「使わない」を選んでください（" + w + "所の文字は読めなくなっています）",
      nm + ": Japanese text (company name, captions, etc.) may still be visible outside the area you edited by " + w + " (AI's view)" + ar + ". Use “Crop or hide” again to frame the other text (drag over the photo to select a wider area), or choose “Don't use”. The text inside the edited area is no longer readable",
      nm + "：在" + w + "的范围之外，可能仍有日文文字（公司名・说明文字等）（AI 的看法）" + ar + "。请用“裁剪・遮盖”把其他文字也框起来再处理一次，或选择“不使用”。已处理范围内的文字已无法辨认",
      nm + ": puede quedar texto en japonés (nombre de la empresa, rótulos…) fuera del área editada al " + w + " (opinión de la IA)" + ar + ". Vuelva a usar «Recortar u ocultar» para enmarcar el resto del texto o elija «No usar»");
  }
  V.editJaMsg = editJaMsg;
  function editJaCheck101() {
    try {
      const T = V.ten(); const A = T && T.assets; if (!A) return;
      (A.ph || []).forEach((o, i) => {
        if (!o || !o.b64 || !(o.v96edit || o.v101edit) || !o._dq) return;
        const fp = phFp(o);
        if (o._dq.jp) {
          if (!o.v101editJa || o.v101editJa.fp !== fp) { o.v101editJa = { fp, at: Date.now() }; toast0(editJaMsg(o, i)); cnt("editJa"); }
        } else if (o.v101editJa) { delete o.v101editJa; }
      });
    } catch (e) { err("editja", e); }
  }
  V.editJaCheck = editJaCheck101;
  if (typeof W.dkImgAudit === "function" && !W.dkImgAudit.v101out) {
    const __au101 = W.dkImgAudit;
    const f = async function () { const r = await __au101.apply(this, arguments); try { editJaCheck101(); } catch (e) { err("audit", e); } return r; };
    f.v101out = 1;
    W.dkImgAudit = f;
  }
  /* 最終チェック：22.00.1 の「切り取った後も…」を、した加工どおりの文に（同じ写真の行を置き換える） */
  if (typeof W.dk3Check === "function" && !W.dk3Check.v101outPh) {
    const __ck101p = W.dk3Check;
    const f = function () {
      const r = __ck101p.apply(this, arguments);
      try {
        if (r && Array.isArray(r.warn)) {
          const T = V.ten(); const A = (T && T.assets) || {};
          const L = (A.ph || []).map((o, i) => ({ o, i })).filter((x) => x.o && x.o.b64 && x.o._dq && x.o._dq.jp && (x.o.v96edit || x.o.v101edit) && decOf(x.o) !== "no");
          const k = r.warn.findIndex((w) => w && w.k === "v100editja");
          if (L.length) {
            const t = L.map((x) => editJaMsg(x.o, x.i)).join(" ／ ");
            if (k >= 0) r.warn[k] = { k: "v100editja", t, v101: 1 };
            else if (!r.warn.some((w) => w && w.v101 && w.k === "v100editja")) r.warn.unshift({ k: "v100editja", t, v101: 1 });
          }
        }
      } catch (e) { err("ckPh", e); }
      return r;
    };
    f.v101outPh = 1;
    W.dk3Check = f;
  }
})();

/* ═══ v22.01 out：最終チェックの ✓ の文（英・中・西） ═══ */
(function () {
  "use strict";
  const V = window.V101OUT;
  if (!V || V._i18n) return;
  V._i18n = 1;
  try {
    if (typeof I18N !== "undefined" && I18N && Array.isArray(I18N.pat)) { // eslint-disable-line no-undef
      const W = { en: [["成分のページ", "ingredients page"], ["商品の特長", "product features"], ["品質のページ", "quality page"], ["梱包・物流のページ", "packaging page"]], zh: [["成分のページ", "成分页"], ["商品の特長", "商品特点"], ["品質のページ", "品质页"], ["梱包・物流のページ", "包装・物流页"]], es: [["成分のページ", "página de ingredientes"], ["商品の特長", "características del producto"], ["品質のページ", "página de calidad"], ["梱包・物流のページ", "página de embalaje"]] };
      const tw = (s, l) => { let x = String(s); (W[l] || []).forEach(([a, b]) => { x = x.split(a).join(b); }); return x.replace(/・/g, l === "zh" ? "、" : ", "); };
      I18N.pat.unshift({ re: /^同じ情報が2枚に重ならないよう、表のページ（成分・仕様の表・要約・取引条件）にある事実を、ほかのページから外しました（(\d+)件）：([\s\S]+)$/, // eslint-disable-line no-undef
        en: (m) => "To avoid showing the same facts on two slides, " + m[1] + " item(s) already on the table pages (specs table, at a glance, trade terms) were removed from other pages: " + tw(m[2], "en"),
        zh: (m) => "为避免同一信息出现在两页，已从其他页面删除表格页（成分・规格表、概要、交易条件）中已有的 " + m[1] + " 项：" + tw(m[2], "zh"),
        es: (m) => "Para no repetir los mismos datos en dos diapositivas, se quitaron " + m[1] + " elemento(s) que ya están en las páginas de tablas: " + tw(m[2], "es") });
      I18N.pat.unshift({ re: /^材質・仕様の表の列を、食品でない商品の形に直しました：([\s\S]+)$/, // eslint-disable-line no-undef
        en: (m) => "Adjusted the materials/specifications table for a non-food product: " + String(m[1]).replace(/見出し/g, "header ").replace(/小見出し/g, "subtitle ").replace(/行/g, " row(s)").replace(/・/g, ", "),
        zh: (m) => "已将材质・规格表调整为非食品商品的形式：" + m[1],
        es: (m) => "Se ajustó la tabla de materiales/especificaciones para un producto no alimentario: " + String(m[1]).replace(/・/g, ", ") });
    }
  } catch (e) { try { V.errf("i18n", e); } catch (x) { /* 記録だけ */ } }
})();
