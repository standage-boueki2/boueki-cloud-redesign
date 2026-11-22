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
      /* 22.01.1（543 の残り・v1 N2 の一部）「売れる理由」（Why It Sells）にも「Clear allergen identification / Soybeans are identified as the allergen.」が出て、
         成分・仕様の表と2か所になった。アレルゲンは表にあれば、売れる理由のページからも外す（控えの文章は変えず、この資料の写しだけ）。
         残りが1項目になるとページが作られない（土台）ため、黙って消さず最終チェックに理由を出す（V.lastWhy） */
      try {
        const W0 = M.v85 && M.v85.plan;
        V.lastWhy = null;
        if (W0 && Array.isArray(W0.items) && has("allergen")) {
          const n0 = W0.items.length;
          const keep = W0.items.filter((it) => {
            const head = NF((it && it.t) || ""), d0 = NF((it && it.d) || "");
            const k = factOf(head) === "allergen" || (factOf(d0) === "allergen" && /allerg|alérg|过敏|アレルゲン/i.test(head + " " + d0) && head.length < 60) ? "allergen" : "";
            if (k) { out.push({ where: "why", k, t: txt(it) }); return false; }
            return true;
          });
          if (keep.length !== n0) {
            M.v85.plan = Object.assign({}, W0, { items: keep }); // M.v85 は deck.v85 と同じもの（控えの文章 plan.why は変えない）
            cnt("dupWhy", n0 - keep.length);
            if (keep.length < 2 && n0 >= 2) V.lastWhy = { at: Date.now(), left: keep.map((x) => NF(x && x.t)).filter(Boolean) };
          }
        }
      } catch (e) { err("dupWhy", e); }
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
        M.quality = Object.assign({}, M.quality, { items: q1 }); // 控えの文章（plan.quality）は変えず、この資料の写しだけ
        if (q1.length !== n0) cnt("dupQuality", n0 - q1.length);
        if (!q1.length) M.quality = null;
        /* 22.01.2（w1-11）A の8枚目「Storage and Product Identification」に保存の記載が無い：保存の項目は表のページ（梱包・物流）に
           あるため外したが、見出しは AI が書いたまま。外した事実の言葉が、残った項目に無ければ見出しからも外す（中身に合わせる） */
        try {
          if (M.quality && M.quality.title) {
            const gone = [...new Set(out.slice(mark).filter((x) => x.where === "quality" && x.k).map((x) => x.k))];
            const left = M.quality.items.map((x) => factOf(NF((x && (x.t || "")) + " " + (x && x.d || "")))).filter(Boolean);
            const KW = { storage: "storage|storing|保存|储存|almacenamiento|conservation", shelf: "shelf[- ]life|best[- ]before|保质期|vida útil", payment: "payment(?: terms)?|付款|pago", allergen: "allerg(?:en|ens|y)|过敏原|alérgenos?", warranty: "warrant(?:y|ies)|保修|garantía", sterile: "steril(?:e|ity|ization)|灭菌|esterilización", lead: "lead[- ]time|交期|plazo", moq: "MOQ|minimum order", incoterms: "incoterms?|trade terms", netc: "net (?:content|weight|volume)s?" };
            let t = String(M.quality.title), t0 = t;
            gone.filter((k) => KW[k] && left.indexOf(k) < 0).forEach((k) => {
              const w = "(?:" + KW[k] + ")";
              t = t.replace(new RegExp("^\\s*" + w + "\\s*(?:,|&|\\+|/|\\band\\b|与|和|及|・|y)\\s*", "i"), "")
                .replace(new RegExp("\\s*(?:,|&|\\+|/|\\band\\b|与|和|及|・|\\by\\b)\\s*" + w + "\\b", "ig"), "")
                .replace(/\s{2,}/g, " ").trim();
              if (new RegExp("^" + w + "$", "i").test(t)) t = "";
            });
            if (t !== t0) { M.quality.title = t ? t.charAt(0).toUpperCase() + t.slice(1) : ""; V.lastQTitle = { at: Date.now(), was: t0, now: M.quality.title }; cnt("qTitle"); }
          }
        } catch (e) { err("qTitle", e); }
      }
      ingrTitle(M);
    } catch (e) { err("dedupe", e); }
    return out;
  }
  /* 22.01.1（v1 N14）成分のページの見出しが「Ingredients and allergen」なのに、ページにアレルゲンが無い（表に1か所）。
     成分のページにアレルゲンが無いときは、見出し・小見出しから「and allergen」などを外す（中身に合わせる） */
  const ALW = /allerg|alérg|allergè|过敏|過敏|アレルゲン|アレルギー/i;
  function ingrTitle(M) {
    try {
      const ig = M && M.ingr; if (!ig) return 0;
      const inPage = (ig.groups || []).some((g) => ALW.test(NF(g && g.name)) || (g && g.items || []).some((x) => ALW.test(txt(x)))) || (ig.hero && ALW.test(NF(ig.hero.name))) || ALW.test(NF(ig.note));
      if (inPage) return 0;
      let n = 0;
      ["title", "sub"].forEach((k) => {
        const s0 = String(ig[k] || ""); if (!s0 || !ALW.test(s0)) return;
        let s = s0
          .replace(/\s*(?:,|&|\+|\/|\band\b|\bwith\b)\s*(?:key\s+)?allerg(?:en|ens|y|ies)(?:\s+(?:info(?:rmation)?|declarations?|labell?ing|notes?))?\b/gi, "")
          .replace(/\ballerg(?:en|ens|y|ies)(?:\s+(?:info(?:rmation)?|declarations?))?\s*(?:,|&|\+|\/|\band\b)\s*/gi, "")
          .replace(/\s*(?:,|&|\/|\by\b|\be\b)\s*al[ée]rgenos?\b/gi, "").replace(/\bal[ée]rgenos?\s*(?:,|&|\/|\by\b)\s*/gi, "")
          .replace(/\s*(?:,|&|\/|\bet\b)\s*allerg[èe]nes?\b/gi, "")
          .replace(/[与和及、・\/]\s*过敏原(?:信息)?/g, "").replace(/过敏原(?:信息)?\s*[与和及、・\/]/g, "")
          .replace(/[・と、／\/]\s*アレルゲン(?:情報)?/g, "").replace(/アレルゲン(?:情報)?\s*[・と、／\/]/g, "")
          .replace(/\s{2,}/g, " ").trim();
        if (ALW.test(s) && s.replace(/[^A-Za-z぀-鿿]/g, "").length <= 12) s = ""; // 見出しがアレルゲンだけ＝土台の見出しに戻す
        if (s !== s0) { ig[k] = s; n++; V.lastIngrTitle = { at: Date.now(), was: s0, now: s }; }
      });
      if (n) cnt("ingrTitle", n);
      return n;
    } catch (e) { err("ingrTitle", e); return 0; }
  }
  V.ingrTitle = ingrTitle;
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
  /* 22.01.1（v2-5 の見出し）E 不織布マスク（区分は医療・衛生）の材質表の小見出しが「Ingredients & Composition」。医療・衛生の区分は
     22.01 では「食品・化粧品と同じく成分の表」とみなして直していなかった。医療・衛生でも、医薬品でなく、表に成分の行（原材料・成分・有効成分・
     全成分・INCI）が無ければ、部位・材質の表として同じ直しをする（医薬品・成分の行がある表は今まで通り） */
  function medParts(T) {
    try {
      const ck = String((T && T.catKey) || ""), c = String((T && T.cat) || "") + " " + String((T && T.item) || "");
      if (/医薬品|サプリ|健康食品|化粧|美容液|コスメ|食品|飲料|ペットフード/.test(c)) return false;
      return ck === "medical" || /医療|衛生|マスク|手袋|ガーゼ|包帯|絆創膏/.test(c);
    } catch (e) { return false; }
  }
  const ING_ROW = /^(?:ingredients?|active ingredients?|inactive ingredients?|composition|full ingredients?|inci(?: name)?|成分|全成分|原材料名?|有効成分|配料|ingredientes?)$/i;
  function matFix(M, data, lang, T) {
    let n = 0; const what = [];
    try {
      if (!M || !T) return 0;
      const nf = nonFood(T), med = !nf && medParts(T);
      if (!nf && !med) return 0;
      const L2 = String(lang || "en").slice(0, 2);
      [].concat(M.specsList || [], M.specsP1 ? [M.specsP1] : []).forEach((sp) => {
        if (!sp) return;
        const ingRows = (sp.rows || []).some((r) => ING_ROW.test(NF(r && r[0]).trim()));
        if (med && ingRows) return; // 医療・衛生で成分の行がある表（医薬部外品の有効成分など）は今まで通り
        if (!ingRows && Array.isArray(sp.hdr) && INGH.test(NF(sp.hdr[0]).trim())) { what.push("見出し「" + sp.hdr[0] + "」→「" + (PARTH[L2] || PARTH.en) + "」"); sp.hdr[0] = PARTH[L2] || PARTH.en; n++; }
        if (!ingRows && sp.eb && /ingredient|成分|原材料|配料|ingrediente/i.test(sp.eb)) { const e0 = sp.eb; sp.eb = String(sp.eb).replace(/\bIngredients?\b/g, "Materials").replace(/\bINGREDIENTS?\b/g, "MATERIALS").replace(/成分表|原材料/g, "材质表").replace(/\bIngredientes\b/g, "Materiales"); if (sp.eb !== e0) { what.push("小見出し「" + e0 + "」→「" + sp.eb + "」"); n++; } }
        try { // 土台の見出し（食品なら「Ingredients & Composition」・それ以外は材質の見出し）を、その言語の材質の見出しに
          if (!ingRows && sp.title && typeof W.dk3Lb === "function" && sp.title === W.dk3Lb(lang, "ingr") && W.dk3Lb(lang, "mat") && W.dk3Lb(lang, "mat") !== sp.title) { const t0 = sp.title; sp.title = W.dk3Lb(lang, "mat"); what.push("見出し「" + t0 + "」→「" + sp.title + "」"); n++; }
        } catch (e) { /* 次へ */ }
        if (!ingRows && sp.title && /ingredient/i.test(sp.title)) { const t0 = sp.title; sp.title = String(sp.title).replace(/\bIngredients?\b/g, "Materials").replace(/\bINGREDIENTS?\b/g, "MATERIALS"); if (sp.title !== t0) { what.push("見出し「" + t0 + "」→「" + sp.title + "」"); n++; } }
        if (!ingRows && sp.sub && /ingredient|成分|配料|ingrediente/i.test(sp.sub)) { const t0 = sp.sub; sp.sub = String(sp.sub).replace(/\bIngredients?\b/g, "Materials").replace(/\bINGREDIENTS?\b/g, "MATERIALS").replace(/成分表/g, "材质表").replace(/\bIngredientes\b/g, "Materiales"); if (sp.sub !== t0) { what.push("小見出し「" + t0 + "」→「" + sp.sub + "」"); n++; } }
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
  /* ════ 22.01.1（v2-4・v1 N4）梱包・物流のページの食い違い：登録の表（訳す前）で決める ════
     E：「Quantity per case(1 case)｜50 pieces」（登録は「入数（1ケース）＝50枚入」・MOQ は 500箱＝1箱 50枚入の中身）・「Product number｜To be confirmed」（品番 KM-M50 は登録済み）。
     C：「Master carton: 100 pieces」（登録の外装「外装 100個入」）と「Quantity per Case｜To be confirmed」が同じページ・「Part Number｜To be confirmed」（6204ZZ は登録済み）。
     原因：22.01 の packFix は訳した後の文字（「50 pieces」）で決めていたため 1箱の中身と分からず、空の欄は全部「To be confirmed」にしていた。
     直し：PL（No.617）と同じ決まりを、訳す前の登録の表（dk3Model の src）で当てる。
           ・入数の欄の値が、売る単位（MOQ・価格表の単位）と数え方が違う（50枚入・売る単位は箱）＝1箱の中身 → 項目名を「Quantity per box」（売る単位）に
           ・入数の欄が空で、外装（外装・カートン・ケース）と書かれた所に「N個入」がある（パレットあたりでない）→ その数を入れ、同じページの「Master carton: …」は外す（2回出さない）
           ・品番の欄が空で、商品の品番（sku）が登録済み → 品番を出す（1商品の資料だけ。複数商品の表はどの行がどの商品か分からないので触らない） */
  const UNITW = { "箱": ["box", "盒", "caja"], "袋": ["bag", "袋", "bolsa"], "缶": ["can", "罐", "lata"], "瓶": ["bottle", "瓶", "botella"], "パック": ["pack", "包", "paquete"], "セット": ["set", "套", "juego"], "個": ["piece", "个", "pieza"], "本": ["unit", "件", "unidad"], "枚": ["sheet", "张", "hoja"], "ケース": ["case", "箱", "caja"] };
  const perLab = (u, L2) => { const x = UNITW[u] || ["sales unit", "销售单位", "unidad de venta"]; return L2 === "zh" ? "每" + x[1] + "数量" : L2 === "es" ? "Cantidad por " + x[2] : L2 === "fr" ? "Quantité par " + x[0] : L2 === "de" ? "Menge pro " + x[0] : "Quantity per " + x[0]; };
  const EN_U = { "個": "pcs", "本": "pcs", "枚": "pcs", "袋": "bags", "箱": "boxes", "セット": "sets", "缶": "cans", "瓶": "bottles", "パック": "packs" };
  const SKUH = /品番|型番|品目コード|商品コード|製品番号|部品番号|^sku$|item\s*(?:no|code)|product\s*(?:no|number|code)|part\s*(?:no|number)/i;
  const PERH = /入数|入り数|ケース入|カートン入|per\s*(?:case|carton)/i;
  function packSrc(M, src, data, lang, T) {
    let n = 0; const what = [];
    try {
      if (!M || !T || !Array.isArray(M.packs) || (M.products || []).length !== 1) return 0;
      const L2 = String(lang || "en").slice(0, 2);
      const i0 = (M.products[0] && M.products[0].idx) || 0;
      const prods = (typeof W.dk3Prods === "function" ? W.dk3Prods(T) : null) || [T];
      const T0 = prods[i0] || T;
      const sd = (((src && src.prods) || [])[i0] || {}).dim;
      const td = ((((data && data.prods) || [])[i0]) || {});
      if (!sd || !Array.isArray(sd.cols) || !Array.isArray(sd.rows)) return 0;
      const sku = NF(T0.sku || "").trim();
      const moqU = (V.badPerText && (NF(T0.moq || "").match(/\d[\d,]*(?:\.\d+)?\s*([^\s\d（(,.]{1,4})/) || [])[1]) || "";
      const ctnS = NF(T0.ctn || "");
      const ctnM = ctnS.match(/(\d[\d,]*)\s*(個|本|枚|袋|箱|セット|缶|瓶|パック|pcs?|units?|pieces?)\s*入/i);
      const ctnOk = !!(ctnM && /外装|外箱|カートン|ケース|段ボール|carton|case|ctn/i.test(ctnS) && !PALLET2.test(ctnS) && !(V.badPerText && V.badPerText(ctnS, T0, +ctnM[1].replace(/,/g, ""))));
      const ctnVal = () => { const tc = NF(td.ctn || ""); const m = tc.match(/(\d[\d,]*)\s*([A-Za-z一-鿿]+)/); if (m && m[1].replace(/,/g, "") === ctnM[1].replace(/,/g, "")) return m[1] + " " + m[2]; return ctnM[1] + " " + (EN_U[ctnM[2]] || ctnM[2]); };
      const fix = (sh, sv, getL, setL, getV, setV) => {
        const s = NF(sh), v = NF(sv).trim(), tv = NF(getV() || "").trim();
        const emptyT = !tv || /^[—\-–]$/.test(tv) || /^(to be confirmed|待确认|por confirmar)$/i.test(tv);
        if (SKUH.test(s) && (!v || NOVAL2.test(v)) && sku && emptyT) { setV(sku); what.push("品番＝" + sku); n++; return; }
        if (!PERH.test(s)) return;
        const num = (v.match(/\d[\d,]*/) || [])[0];
        if (v && num && V.badPerText && V.badPerText(v, T0, +num.replace(/,/g, ""))) { const nl = perLab(moqU, L2); if (getL() !== nl) { setL(nl); what.push("入数「" + v + "」は1" + (moqU || "単位") + "の中身"); n++; } return; }
        if ((!v || NOVAL2.test(v)) && ctnOk && emptyT) { setV(ctnVal()); V._dropCtnFact = 1; what.push("入数＝外装の「" + ctnM[0] + "」"); n++; }
      };
      M.packs.forEach((pk) => {
        if (!pk || pk.cmp || !Array.isArray(pk.rows)) return;
        V._dropCtnFact = 0;
        const cols = Array.isArray(pk.cols) ? pk.cols : [];
        if (cols.length > 2 && cols.length === sd.cols.length && pk.rows.length === 1 && sd.rows.length === 1) {
          const row = pk.rows[0], srow = sd.rows[0] || [];
          if (!Array.isArray(row)) return;
          sd.cols.forEach((sc, ci) => fix(sc, srow[ci], () => cols[ci], (x) => { cols[ci] = x; }, () => row[ci], (x) => { row[ci] = x; }));
        } else if (cols.length <= 2 && pk.rows.length === sd.rows.length) {
          pk.rows.forEach((r, ri) => { const sr = sd.rows[ri] || []; if (Array.isArray(r)) fix(sr[0], (sr.slice(1) || []).join(" "), () => r[0], (x) => { r[0] = x; }, () => r[1], (x) => { r[1] = x; }); });
        }
        if (V._dropCtnFact && Array.isArray(pk.facts)) { const f0 = pk.facts.length; pk.facts = pk.facts.filter((f) => !(f && f.ic === "boxes")); if (pk.facts.length !== f0) what.push("同じページの「" + (td.ctn || T0.ctn) + "」の行は表と重なるため外しました"); }
      });
      V._dropCtnFact = 0;
    } catch (e) { err("packSrc", e); }
    if (n) { cnt("packSrc", n); V.lastPack = { at: Date.now(), n, msg: "梱包・物流のページの表を登録の表に合わせました：" + what.join("・") }; }
    return n;
  }
  const PALLET2 = /パレット|pallet|plt\b/i;
  const NOVAL2 = /不明|わからない|分からない|未定|未確認|未登録|未入力|記載なし|要確認|unknown|tbd|to be confirmed/i;
  V.packSrc = packSrc;
  /* ════ 22.01.1（v1 N12 の資料側）価格の桁がそろわない：「US$11」「US$9.75」が同じ表に並ぶ（B）・「US$12」「US$10.50」（D）。
     同じ価格の表の中で、同じ通貨の値の小数の桁を、登録の値のうち小数のある値の桁（2桁）にそろえる（値は変えない：11 → 11.00）。円は小数を付けない ════ */
  const MONEY = /(US\$|USD\s?|HK\$|S\$|NT\$|A\$|C\$|€|EUR\s?|£|GBP\s?|(?<![A-Za-z])\$)\s?(\d{1,3}(?:,\d{3})+|\d+)(?:([.,])(\d{1,2}))?(?![\d.,]*\d)/g;
  function priceDec(M) {
    let n = 0;
    try {
      const P = (M && M.pricing) || {};
      const tabs = [];
      (P.groups || []).forEach((g) => { if (g && g.table && tabs.indexOf(g.table) < 0) tabs.push(g.table); });
      (P.tables || []).forEach((t) => { if (t && tabs.indexOf(t) < 0) tabs.push(t); });
      tabs.forEach((t) => {
        const rows = (t.rows || []).filter(Array.isArray);
        const mx = {};
        const key = (cu) => cu.trim().replace(/^USD$/, "US$").replace(/^EUR$/, "€").replace(/^GBP$/, "£");
        rows.forEach((r) => r.forEach((c) => { if (typeof c === "string") { c.replace(MONEY, (m, cu, ip, sep, dp) => { if (dp) { const k = key(cu); if (!mx[k] || mx[k].d < dp.length) mx[k] = { d: dp.length, sep }; } return m; }); } }));
        if (!Object.keys(mx).length) return;
        rows.forEach((r) => r.forEach((c, ci) => {
          if (typeof c !== "string") return;
          const nc = c.replace(MONEY, (m, cu, ip, sep, dp) => { const X = mx[key(cu)]; if (!X) return m; if (!dp) { n++; return m + X.sep + "0".repeat(X.d); } if (dp.length < X.d) { n++; return m + "0".repeat(X.d - dp.length); } return m; });
          if (nc !== c) r[ci] = nc;
        }));
      });
    } catch (e) { err("priceDec", e); }
    if (n) { cnt("priceDec", n); V.lastPrice = { at: Date.now(), n }; }
    return n;
  }
  V.priceDec = priceDec;
  /* ════ 22.01.1（v1 N13）B・D の表紙で社名が2回続く（ロゴの無い「根拠重視」の表紙は、上に小さく社名・その下に大きく「ブランド名か社名」を出す。
     ブランド名が無いと同じ社名が2回）。表紙で同じ文字の要素が2つあるときは、小さい方を外す ════ */
  const elTx = (e) => (e && Array.isArray(e.ps) ? e.ps.map((p) => (p.r || []).map((r) => (r && r.r ? r.r.map((x) => x.t || "").join("") : String((r && r.t) || ""))).join("")).join(" ") : "");
  const elSz = (e) => { let s = 0; try { (e.ps || []).forEach((p) => (p.r || []).forEach((r) => { s = Math.max(s, +(r && r.sz) || 0); (r && r.r || []).forEach((x) => { s = Math.max(s, +(x && x.sz) || 0); }); })); } catch (x) { /* 0 */ } return s; };
  function coverDup(S) {
    try {
      if (!S || !Array.isArray(S.els)) return 0;
      const T = S.els.filter((e) => e && e.k === "text" && !/^(deco|draft|v54draft|pno|foot)$/.test(e.name || ""));
      const norm = (s) => NF(s).replace(/\s+/g, " ").trim().toLowerCase();
      const drop = new Set();
      /* 22.01.2（w1-6）：同じ文字だけでなく「社名 | Household Goods」のように、ほかの要素の文字（社名）に区切り（| · • — – - / :）と
         別の言葉が続く形でも2回になる（B の表紙）。長い方から重なった部分と区切りだけを外す（「Household Goods」は残す） */
      const esc = (x) => String(x).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const SEPS = "(?:\\||·|•|—|–|-|/|:|,)";
      const trimmed = [];
      for (let a = 0; a < T.length; a++) for (let b = a + 1; b < T.length; b++) {
        if (drop.has(T[a]) || drop.has(T[b])) continue;
        const ta = norm(elTx(T[a])), tb = norm(elTx(T[b]));
        if (!ta || !tb) continue;
        if (ta === tb) { if (ta.length >= 4) drop.add(elSz(T[a]) <= elSz(T[b]) ? T[a] : T[b]); continue; }
        [[T[a], T[b], ta, tb], [T[b], T[a], tb, ta]].forEach(([short, long, ts, tl]) => {
          if (ts.length < 6 || tl.length <= ts.length || drop.has(long) || trimmed.some((x) => x.e === long)) return;
          const raw = NF(elTx(long)).replace(/\s+/g, " ").trim(), rs = NF(elTx(short)).replace(/\s+/g, " ").trim();
          const re1 = new RegExp("^" + esc(rs) + "\\s*" + SEPS + "\\s*(.+)$", "i"), re2 = new RegExp("^(.+?)\\s*" + SEPS + "\\s*" + esc(rs) + "$", "i");
          const m = raw.match(re1) || raw.match(re2);
          if (!m || !m[1] || m[1].trim().length < 2) return;
          try {
            const p0 = long.ps[0] || {}; const r0 = Object.assign({}, ((p0.r || [])[0]) || {}); delete r0.r;
            r0.t = m[1].trim(); long.ps = [Object.assign({}, p0, { r: [r0] })]; delete long.mh;
            trimmed.push({ e: long, was: raw, now: r0.t }); cnt("coverTrim");
          } catch (x) { /* そのまま */ }
        });
      }
      if (!drop.size && !trimmed.length) return 0;
      S.els = S.els.filter((e) => !drop.has(e));
      V.lastCover = { at: Date.now(), n: drop.size + trimmed.length, t: [...drop].map(elTx).concat(trimmed.map((x) => x.was + "」→「" + x.now)).join("」「").slice(0, 100) };
      cnt("coverDup", drop.size);
      return drop.size + trimmed.length;
    } catch (e) { err("coverDup", e); return 0; }
  }
  V.coverDup = coverDup;
  try {
    if (typeof DK3_SL !== "undefined" && DK3_SL && typeof DK3_SL.cover === "function" && !DK3_SL.cover.v101out) { // eslint-disable-line no-undef
      const __cv101 = DK3_SL.cover; // eslint-disable-line no-undef
      const f = function () { const S = __cv101.apply(this, arguments); try { coverDup(S); } catch (e) { err("cover", e); } return S; };
      f.v101out = 1;
      DK3_SL.cover = f; // eslint-disable-line no-undef
    }
  } catch (e) { err("coverWrap", e); }
  if (typeof W.dk3Model === "function" && !W.dk3Model.v101out) {
    const __dm101 = W.dk3Model;
    const f = function (lang0, plan, data, ph, deck, src, T) {
      const M = __dm101.apply(this, arguments);
      try {
        if (M && lang0 && !/^ja/.test(String(lang0))) {
          const tt = T || V.ten();
          V.lastPack = null; V.lastPrice = null; V.lastIngrTitle = null; V.lastCover = null; V.lastMat = null; V.lastQTitle = null; V.lastUnitSpec = null; V.lastPolish = null; // この資料の分だけを最終チェックに書く
          if (typeof V.matFix === "function") V.matFix(M, data, lang0, tt);
          if (typeof V.packSrc === "function") V.packSrc(M, src, data, lang0, tt);
          if (typeof V.packFix === "function") V.packFix(M, lang0);
          if (typeof V.priceDec === "function") V.priceDec(M);
          if (typeof V.packUnitSpec === "function") V.packUnitSpec(M, lang0); // 22.01.2（w1-11）
          if (typeof V.polishModel === "function") V.polishModel(M, lang0); // 22.01.2（w2-15）
          const d = dedupe(M, tt, lang0);
          V.lastDup = { at: Date.now(), uid: V.pkey(tt), lang: lang0, list: d };
          /* 22.01.2：営業資料の画面の「表紙（見本）」が、資料の表紙と同じバッジを出せるように、ほかの層（fact）の直しの後の表紙のバッジを
             商品に控える（見本は作り直さなくても、この控えを読む） */
          try { if (tt && M.hero) { tt.deck3 = tt.deck3 || {}; const cv = Object.assign({}, tt.deck3.v101cover || {}); cv[lang0] = { b: (M.hero.badges || []).map((x) => String((x && x.t) || "").replace(/\*\*/g, "").trim()).filter(Boolean).slice(0, 3), at: Date.now() }; tt.deck3.v101cover = cv; } } catch (e) { err("coverRec", e); }
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
          const W2 = { ingr: "成分のページ", feat: "商品の特長", quality: "品質のページ", pack: "梱包・物流のページ", why: "売れる理由のページ" };
          const s = L.list.slice(0, 6).map((x) => (W2[x.where] || x.where) + "「" + String(x.t).replace(/\s+/g, " ").slice(0, 40) + "」").join("・");
          r.ok.push("同じ情報が2枚に重ならないよう、表のページ（成分・仕様の表・要約・取引条件）にある事実を、ほかのページから外しました（" + L.list.length + "件）：" + s);
        }
        if (r && V.lastMat && V.lastMat.n && Date.now() - V.lastMat.at < 15 * 60000 && Array.isArray(r.ok) && !r.ok.some((x) => /^材質・仕様の表の列を/.test(String(x)))) r.ok.push(V.lastMat.msg);
        const fresh = (x) => x && Date.now() - x.at < 15 * 60000 && L && deck && deck.lang === L.lang;
        if (r && Array.isArray(r.ok) && fresh(V.lastPack) && !r.ok.some((x) => /^梱包・物流のページの表を登録の表に/.test(String(x)))) r.ok.push(V.lastPack.msg);
        if (r && Array.isArray(r.ok) && fresh(V.lastPrice) && !r.ok.some((x) => /^価格の表の小数の桁を/.test(String(x)))) r.ok.push("価格の表の小数の桁を、同じ表の登録の値（小数2桁）にそろえました（" + V.lastPrice.n + "か所・値は変えていません）");
        if (r && Array.isArray(r.ok) && fresh(V.lastIngrTitle) && !r.ok.some((x) => /^成分のページの見出しを/.test(String(x)))) r.ok.push("成分のページの見出しを中身に合わせました（アレルゲンは成分・仕様の表に載せています）：「" + V.lastIngrTitle.was + "」→「" + (V.lastIngrTitle.now || "（標準の見出し）") + "」");
        if (r && Array.isArray(r.ok) && fresh(V.lastCover) && !r.ok.some((x) => /^表紙で同じ文字が2回/.test(String(x)))) r.ok.push("表紙で同じ文字が2回続いていたため、小さい方を外しました：「" + V.lastCover.t + "」");
        if (r && Array.isArray(r.ok) && fresh(V.lastQTitle) && !r.ok.some((x) => /^品質のページの見出しを/.test(String(x)))) r.ok.push("品質のページの見出しを中身に合わせました（表のページに移した事実の言葉を外しました）：「" + V.lastQTitle.was + "」→「" + (V.lastQTitle.now || "（標準の見出し）") + "」");
        if (r && Array.isArray(r.ok) && fresh(V.lastUnitSpec) && !r.ok.some((x) => /^梱包・物流のページの単品の寸法/.test(String(x)))) r.ok.push("梱包・物流のページの単品の寸法を、仕様の表の寸法に合わせました：" + V.lastUnitSpec.t);
        if (r && Array.isArray(r.warn) && fresh(V.lastWhy) && !(deck.slides || []).some((s) => s && s.kind === "why") && !r.warn.some((w) => w && (w.k === "v101outWhy" || w.k === "v101why"))) r.warn.push({ k: "v101outWhy", t: "「売れる理由」のページは入れていません：アレルゲンの項目は成分・仕様の表に載せたため外し、残りが1項目（" + (V.lastWhy.left.join("・") || "なし") + "）だけになりました（2項目から作ります）。登録した商品の強みを、数字や試験の条件つきで1つずつ登録するか、追加ヒアリングで答えてから「↻ もう一度作る」を押すと載ります" });
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
  /* ── 22.01.1（v1 N1・No.552・高）写真を加工すると、存在しない「加工した写真で作り直す」ボタンを押すよう言われる ──
     原因：22.01 は「加工した時刻 ＞ 資料の時刻」で「まだ入っていない」を決めていた。資料の時刻（deck.v101at）は dk3Generate の
           約束（promise）が解けた時刻で付けていたが、その約束は資料を作り終えた後の保存（dk14Save→保存した資料の一覧の読み直し）まで待つ。
           本番は保存と一覧の読み直しに数秒かかるため、その間に加工すると、資料の時刻が加工より後になって判定が消え、
           知らせ（押してください）だけ出て箱とボタンが出なかった（v1 の APH2：加工の 2.6 秒後に v101at が付いた）。
     直し：時刻に頼らない。資料を組むとき（dk3Media＝写真を資料に入れる所）に「資料に入れた写真の中身の指紋」を資料に控え（deck.v101ph）、
           「いまの写真の指紋」と比べて決める。保存済みの資料（dk14 の写し）にも指紋が入る。指紋の無い古い資料は、資料の中の写真そのもの
           （deck.media）と比べる。知らせ（toast）と資料の画面の箱は同じ判定（editState）を使い、ボタンが出ないのに押してと言わない。 */
  const phIdent = (o) => (o && o.b64) ? phFp(o) + "|" + (o.hid || "") : "";
  V.phIdent = phIdent;
  const HI = V.hiFp = V.hiFp || {}; // 高解像度の控え（hid）→ その中身の指紋（古い資料と比べるときだけ・読み終えたら描き直す）
  function kickHi(hid) {
    try {
      if (!hid || HI[hid] !== undefined || typeof W.dk3HiGet !== "function") return;
      HI[hid] = null;
      Promise.resolve().then(() => W.dk3HiGet(hid)).then((hi) => { HI[hid] = hi && hi.b64 ? phFp(hi) : ""; try { if (typeof cur !== "undefined" && cur === "deck" && typeof W.render === "function") W.render(); } catch (e) { /* 次へ */ } }, () => { HI[hid] = ""; }); // eslint-disable-line no-undef
    } catch (e) { HI[hid] = ""; }
  }
  /* 資料（deck）の i 番目の写真が、いまの写真 o と同じ中身か："same"｜"diff"｜"absent"（資料の写真の候補に入らない写真）｜"unknown" */
  function inDeckState(deck, i, o) {
    try {
      if (!deck || !o || !o.b64) return "unknown";
      const R = deck.v101ph;
      if (R && typeof R === "object") {
        if (!Object.prototype.hasOwnProperty.call(R, String(i))) return "diff"; // 資料を作った後に足した写真
        const r = R[i];
        if (r === "-") return "absent";
        return r === phIdent(o) ? "same" : "diff";
      }
      const md = deck.media || {};
      const m = md["p0:" + i];
      if (!m || !m.b64) return Object.keys(md).length ? "absent" : "unknown";
      if (!o.hid) return (!m.hi && phFp(m) === phFp(o)) ? "same" : "diff";
      const h = HI[o.hid];
      if (h === undefined) { kickHi(o.hid); return "unknown"; }
      if (!h) return "unknown";
      return phFp(m) === h ? "same" : "diff";
    } catch (e) { err("inDeck", e); return "unknown"; }
  }
  V.inDeckState = inDeckState;
  /* 資料（DK3G.deck）がいつ作られたか（表示用）：組んだとき（dk3Media）・開いた保存済みの資料が組まれたとき */
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
  const edited = (o) => !!(o && o.b64 && o.v96edit); // 「加工の前に戻す」で v96edit は消える
  const edAt = (o) => (o && o.v101edit && o.v101edit.fp === phFp(o) && +o.v101edit.at) || 0;
  /* 加工した写真のうち、いま開いている資料に入っていないもの（中身の指紋で比べる） */
  function pendingEdits(T, deck) {
    const out = [];
    try {
      if (!deck) return out;
      ((T && T.assets && T.assets.ph) || []).forEach((o, i) => {
        if (!edited(o) || decOf(o) === "no") return;
        const st = inDeckState(deck, i, o);
        if (st === "diff" || (st === "unknown" && edAt(o) && edAt(o) > deckAt(deck))) out.push({ i, o, at: edAt(o), st });
      });
    } catch (e) { err("pend", e); }
    return out;
  }
  V.pendingEdits = pendingEdits;
  /* 加工した写真のうち、いま開いている資料に入っているもの（作り直した後の知らせ）。inDeck＝スライドに使われたか */
  function doneEdits(T, deck) {
    const out = [];
    try {
      if (!deck) return out;
      const used = (W.V99PHOTO && typeof W.V99PHOTO.deckPhotos === "function") ? W.V99PHOTO.deckPhotos(deck) : null;
      ((T && T.assets && T.assets.ph) || []).forEach((o, i) => {
        if (!edited(o) || decOf(o) === "no") return;
        if (inDeckState(deck, i, o) === "same") out.push({ i, o, at: edAt(o), inDeck: used ? used.has(i) : null });
      });
    } catch (e) { err("done", e); }
    return out;
  }
  V.doneEdits = doneEdits;
  /* 知らせと資料の画面の箱が同じ判定を使う：いまの状態（"run"＝作っている途中／"pend"＝箱とボタンが出る／"in"＝もう入っている／"none"＝資料がない） */
  function editState(T, i) {
    try {
      const g = V.G();
      const same = !!(g && T && g.ten && V.pkey(g.ten) === V.pkey(T));
      if (g && g.run && same) return "run";
      if (g && g.deck && same) {
        const P = pendingEdits(T, g.deck);
        if (i == null ? P.length : P.some((x) => x.i === i)) return "pend";
        return "in";
      }
    } catch (e) { err("state", e); }
    return "none";
  }
  V.editState = editState;
  /* 加工の保存：時刻と中身の指紋を控え、知らせを資料の画面と同じ判定で出す */
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
            const nm = M("商品写真" + (i + 1), "Product photo " + (i + 1), "商品照片" + (i + 1), "Foto " + (i + 1));
            const st = editState(T, i);
            V.lastEditState = { i, st, at: Date.now() };
            toast0(st === "pend" ? M(nm + "を加工して保存しました。いま開いている資料・保存済みの資料には、まだ入っていません（作り直すと入ります）。営業資料の画面の「加工した写真で作り直す（文章はそのまま）」を押してください",
              nm + " was edited and saved. It is not in the open deck or the saved decks yet; press “Rebuild with the edited photo (same text)” on the sales deck page",
              nm + "已编辑并保存。当前打开的资料和已保存的资料中还没有放入（重新制作后放入）。请在营业资料页面点击“用编辑后的照片重新制作（文字不变）”",
              nm + " se editó y guardó. Aún no está en la presentación abierta ni en las guardadas; pulse «Rehacer con la foto editada (mismo texto)»")
              : st === "run" ? M(nm + "を加工して保存しました。いまは資料を作っている途中です。できあがった資料に加工した写真が入っていないときは、営業資料の画面に「加工した写真で作り直す（文章はそのまま）」が出ます",
                nm + " was edited and saved. A deck is being made now; if the finished deck does not have the edited photo, “Rebuild with the edited photo (same text)” appears on the sales deck page",
                nm + "已编辑并保存。正在制作资料；如果完成的资料中没有编辑后的照片，营业资料页面会出现“用编辑后的照片重新制作（文字不变）”",
                nm + " se editó y guardó. Se está creando una presentación; si no incluye la foto editada, aparecerá «Rehacer con la foto editada (mismo texto)»")
              : st === "in" ? M(nm + "を加工して保存しました。いま開いている資料には、加工した写真がもう入っています", nm + " was edited and saved. The open deck already has the edited photo", nm + "已编辑并保存。当前打开的资料中已经有编辑后的照片", nm + " se editó y guardó; la presentación abierta ya la incluye")
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
  /* 資料を組むとき：資料に入れた写真の中身の指紋と、組んだ時刻を資料に控える（保存済みの資料の写しにも入る） */
  if (typeof W.dk3Media === "function" && !W.dk3Media.v101out) {
    const __md101 = W.dk3Media;
    const f = async function (deck, T) {
      const t0 = T || V.ten();
      const snap = () => { try { return ((t0 && t0.assets && t0.assets.ph) || []).map(phIdent); } catch (e) { return []; } };
      const s0 = snap();
      const P = await __md101.apply(this, arguments);
      try {
        if (deck && t0) {
          const s1 = snap(), md = deck.media || {}, rec = {};
          s1.forEach((id, i) => {
            if (!id) return;
            const m = md["p0:" + i];
            if (!m || !m.b64) { rec[i] = "-"; return; }
            const o = t0.assets.ph[i];
            if (!m.hi && !o.hid) rec[i] = phFp(m) + "|"; // 資料に入れた中身そのものの指紋（組む途中で写真が替わっても正しい）
            else rec[i] = s0[i] === id ? id : "?"; // 高解像度の控えを使った写真：組む前と後で同じときだけ（途中で加工されたら「まだ入っていない」）
          });
          deck.v101ph = rec; deck.v101at = Date.now(); deck.v101uid = V.pkey(t0);
          cnt("deckFp");
        }
      } catch (e) { err("mediaFp", e); }
      return P;
    };
    f.v101out = 1;
    W.dk3Media = f;
  }
  /* 作り始めた時刻（資料の時刻が無いときの控え。判定には使わない） */
  if (typeof W.dk3Generate === "function" && !W.dk3Generate.v101out) {
    const __gen101 = W.dk3Generate;
    const f = async function () {
      const t0 = Date.now();
      const r = await __gen101.apply(this, arguments);
      try { const g = V.G(); if (g && g.deck && !g.deck.v101at) { g.deck.v101at = t0; cnt("deckAt0"); } } catch (e) { err("genAt", e); }
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
        if (g && g.deck && it && it.at && !g.deck.v101at) g.deck.v101at = Date.parse(it.at) || 0; // 組んだ時刻が控えてあればそのまま
      } catch (e) { err("openAt", e); }
      return r;
    };
    f.v101out = 1;
    W.dk14Open = f;
  }
  /* 文章はそのまま、写真だけ入れ直して作り直す（前回の文章＝dk3Plan の控えを使う。force なし）。始まらなかったとき（写真を選ぶ窓が出た・
     必要な項目が足りない）は、ボタンを元に戻す（押しても何も起きないボタンにしない。窓・知らせはその層が出す） */
  V.regenPhoto = function () {
    try {
      const g = V.G(); if (!g || g.run) return false;
      const lg = (g.deck && g.deck.lang) || g.lang || "en";
      V.regenAt = Date.now();
      W.dk3Generate(lg, false);
      cnt("regenPhoto");
      setTimeout(() => { try { const g2 = V.G(); if (g2 && !g2.run && typeof W.render === "function" && typeof cur !== "undefined" && cur === "deck") W.render(); } catch (e) { /* 次へ */ } }, 900); // eslint-disable-line no-undef
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
    const f = async function () {
      /* 22.01.1：22.00.1（v100）の「切り取った後も、日本語の文字が残っている…」の知らせが、この層の「ぼかした範囲の外にも…」と続けて2つ出ていた
         （手元の再現で確認）。v100 の知らせは同じ指紋の写真には出ない作りなので、加工した写真に先に指紋を控えて v100 の知らせだけを止める
         （最終チェックの文は 22.01 で置き換え済み。日本語が無いと AI が言えば v100 が控えを消す＝今まで通り） */
      try { const T = V.ten(); ((T && T.assets && T.assets.ph) || []).forEach((o) => { if (o && o.b64 && o.v96edit) { const fp = phFp(o); if (!o.v100editJa || o.v100editJa.fp !== fp) o.v100editJa = { fp, at: Date.now(), v101: 1 }; } }); } catch (e) { err("audit0", e); }
      const r = await __au101.apply(this, arguments);
      try { editJaCheck101(); } catch (e) { err("audit", e); }
      return r;
    };
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

/* ═══ 22.01.1 out（v2-3・中〜高）英語資料のスペースの「直し」が正しい英単語を壊す ═══
   症状：H「Portioning」→「Port ioning」・「portions」→「port ions」、E「nonwoven」→「non woven」。最終チェックに「スペースの抜けを直しました」。
   原因：その ✓ は 21.86 の校正（v86dkPost → v86dkParaGlue → v86dkSplit）。8文字以上で語彙（画面の英訳から集めた語＋21.99.2 の 7,755語）に
         無い語を「2つの語がくっついたもの」とみなし、前後とも語彙にあれば分ける。語彙の判定（v86dkIn）は語尾を外して調べるため、
         「ioning」は「ion」＋ing、「ions」は「ion」＋s で語とみなされ、「port」と組んで分けていた。「non」も語彙に入っている（non-… から）。
         21.98 の校正（v98dkProofPara）も同じ v86dkParaGlue を使い、21.99 の校正（v99dkSplit）も似た分け方をする。
   直し：分ける前に、次のどれかに当たる分け方は「正しい1語」として分けない（v86dkSplit・v99dkSplit の両方）。
         ① 前が語の頭にしか付かない接頭辞（non・anti・multi・semi・micro・poly・bio・eco・pre・pro・dis・ultra など）：nonwoven・antibacterial
         ② 後ろが語尾だけ（ion・ions・ioning・ing・ings・ness・ment・ity・able・ation・ism・ist・ive・ous など）：port|ions・port|ioning
         ③ 語全体が、語彙・資料の中の語の活用形（-ing・-s・-es・-ed・-er・-ly・-ment・-ness）：portioning（資料に portions がある）
         あわせて、営業資料によく出るのに語彙に無い語（portion・nonwoven・polypropylene・antibacterial など）を語彙に足す。
         くっついた語（organicsoy・forkitchens・woodpuzzle・therepair）は今まで通り分ける。分けなかった語は V101OUT.splitKept に控える。 */
(function () {
  "use strict";
  const W = window, V = W.V101OUT;
  if (!V || V._split) return;
  V._split = 1;
  const err = V.errf;
  const cnt = (k, d) => { try { const x = d == null ? 1 : +d; if (x) V.n[k] = (V.n[k] || 0) + x; } catch (e) { /* 数えるだけ */ } };
  const BOUNDP = new Set("non anti semi multi sub super inter intra micro nano poly mono bio eco pre pro dis mis tri hyper ultra mega mini auto trans extra counter neo pan para proto pseudo quasi retro tele thermo hydro photo macro meta omni uni vice infra ortho cyber geo aero agro electro hemi hypo iso mid un".split(" "));
  const SUFB = /^(?:ions?|ion(?:ing|ings|ed|al|ally|ate|ates|ated|ic|ics)|ings?|ers?|ness(?:es)?|ments?|ive(?:ly|ness|s)?|ous(?:ly|ness)?|ity|ities|ably|ibly|able|ible|ance[sd]?|ence[sd]?|ancy|ency|isms?|ists?|i[sz]e[sdr]?|i[sz]ing|i[sz]ations?|ures?|ural|ured|ates?|ated|ating|ations?|ally|ical(?:ly)?|ics|ish|less(?:ly|ness)?|ful(?:ly|ness)?|ies|ier|iest|edly|ingly)$/;
  const EXTRA = ("portion portions portioned portioning proportion proportions nonwoven nonwovens woven polypropylene polyethylene polyurethane polyester polymer polymers spunbond meltblown earloop earloops earband antibacterial antimicrobial antiviral antifungal antioxidant antioxidants antistatic hypoallergenic biodegradable compostable recyclable reusable resealable dishwasher microwave microwavable stainless nonstick nontoxic nonslip nonsterile semifinished multilayer multipurpose ultrasonic ultraviolet preservative preservatives premium prebiotic prebiotics probiotic probiotics protein proteins provenance packaging packaged unpackaged refrigerated refrigeration individually wrapped portionable lightweight waterproof dustproof shockproof breathable stretchable adjustable washable foldable stackable durable traceable traceability certified certification certifications inspection inspections lubricated lubricant tolerance tolerances deodorizing deodorant sanitizing sanitizer disinfecting disinfectant fermented fermentation unpasteurized pasteurized dehydrated freeze dried nonalcoholic jerky treats tenderloin tenderloins chewable chewy palatable palatability digestible digestibility formulated formulation formulations foodservice").split(" ");
  /* 語彙に足す（21.99 と同じやり方。v86dkVocab の控えを捨てて作り直させる） */
  if (typeof W.v86dkVocab === "function" && !W.v86dkVocab.v101out) {
    const __voc101 = W.v86dkVocab;
    const f = function () {
      const Vv = __voc101.apply(this, arguments);
      try { if (Vv && typeof Vv.add === "function" && !Vv.__v101out) { EXTRA.forEach((w) => Vv.add(w)); Vv.__v101out = 1; } } catch (e) { err("voc", e); }
      return Vv;
    };
    f.v101out = 1;
    W.v86dkVocab = f;
    try { if (typeof V86DK !== "undefined" && V86DK) V86DK.voc = null; } catch (e) { /* 次に作るときに */ } // eslint-disable-line no-undef
  }
  const has = (x, Vv, Ww) => !!x && ((Vv && Vv.has && Vv.has(x)) || (Ww && Ww.has && Ww.has(x)));
  const inV = (x, Vv, Ww) => { try { return has(x, Vv, Ww) || (typeof W.v86dkIn === "function" && Vv ? !!W.v86dkIn(x, Vv, Ww) : false); } catch (e) { return false; } };
  /* 語全体が、語彙・資料の中の語の活用形か（portioning ← portion(s)） */
  function inflected(lw, Vv, Ww) {
    const SF = ["ings", "ing", "ers", "er", "ed", "es", "s", "ly", "ments", "ment", "ness"];
    for (const sf of SF) {
      if (lw.length - sf.length < 5 || !lw.endsWith(sf)) continue;
      const st = lw.slice(0, -sf.length);
      const cands = [st, st + "e", /(.)\1$/.test(st) ? st.slice(0, -1) : "", /i$/.test(st) ? st.slice(0, -1) + "y" : ""].filter((x) => x && x.length >= 5);
      if (cands.some((c) => [c, c + "s", c + "es"].some((x) => x !== lw && has(x, Vv, Ww)))) return true; // 語そのもの（資料の中の語の一覧に入っている）は数えない
    }
    return false;
  }
  /* 分けてはいけない分け方か（理由を返す。分けてよければ ""） */
  function keepWord(w, i, Vv, Ww) {
    const lw = String(w || "").toLowerCase();
    if (!(i > 0) || i >= lw.length) return "";
    const a = lw.slice(0, i), b = lw.slice(i);
    if (EXTRA.indexOf(lw) >= 0) return "known";
    if (BOUNDP.has(a) && lw.length >= 6) return "prefix";
    if (/^ion/.test(b) || SUFB.test(b)) return "suffix";
    if (inflected(lw, Vv, Ww)) return "inflected";
    return "";
  }
  V.keepWord = keepWord;
  V.splitKept = V.splitKept || [];
  const note = (w, i, why) => { try { V.splitKept.push({ w: String(w).slice(0, 40), a: String(w).slice(0, i), b: String(w).slice(i), why, at: Date.now() }); if (V.splitKept.length > 60) V.splitKept.shift(); cnt("splitKeep"); } catch (e) { /* 控えだけ */ } };
  if (typeof W.v86dkSplit === "function" && !W.v86dkSplit.v101out) {
    const __sp101 = W.v86dkSplit;
    const f = function (w, Vv, Ww) {
      const r = __sp101.apply(this, arguments);
      try { if (r && r.i > 0) { const why = keepWord(w, r.i, Vv, Ww); if (why) { note(w, r.i, why); return null; } } } catch (e) { err("split86", e); }
      return r;
    };
    f.v101out = 1;
    W.v86dkSplit = f;
    V.splitOrig = Object.assign(V.splitOrig || {}, { v86: __sp101 }); // 試験で直す前の分け方と比べる用
  }
  if (typeof W.v99dkSplit === "function" && !W.v99dkSplit.v101out) {
    const __sp99 = W.v99dkSplit;
    const f = function (tok, ctx) {
      const r = __sp99.apply(this, arguments);
      try { if (r && r.i > 0 && !r.fa) { const why = keepWord(tok, r.i, ctx && ctx.V, ctx && ctx.W); if (why) { note(tok, r.i, why); return null; } } } catch (e) { err("split99", e); }
      return r;
    };
    f.v101out = 1;
    W.v99dkSplit = f;
    V.splitOrig = Object.assign(V.splitOrig || {}, { v99: __sp99 });
  }
})();

/* ═══ 22.01.2 out（22.01.1 の公開後の検証 w1・w2 の指摘） ═══
   w1-11・w2-15（低）資料の細かい所：
     ① C の梱包のページ「Unit W×D×H｜To be confirmed」なのに、仕様の表に外径 47mm・幅 14mm がある（packUnitSpec）
     ② D の仕様の表「Butylene Glycol｜—」：登録の表示名称（和名）が「BG」（略号）で、和名の列が空になった（v99dkInciRows を包む）
     ③ 連絡のページ「…ingredients/materials and packaging details.」が木のパズル・マスクにも出る（区分に合わせる・DK3_SL.contact を包む）
     ④ E「fabric(3 layers)」の括弧の前の空白・見出し「Composition, Specifications Table」（polishModel）
   w1-8・w2-3（中）AI につながらないとき（11時ごろの通信の切れ目で実際に起きた）の英語資料：
     ⑤ 同じ確認の欄に「日本語のまま残っていた 23か所を、決まった訳語に直しました」と「日本語が残っています」が並んで食い違う
     ⑥ 案内「管理画面でAIを接続してから…」は、トライアルの人には操作できない（理由どおりに「少し待ってから作り直す」）
     ⑦ 決まった訳語の並びが英語の語順でない（「after order 30 days」「from manufacture 3 years」）・「T/T 前払100%」が訳せず残る */
(function () {
  "use strict";
  const W = window, V = W.V101OUT;
  if (!V || V._v1012) return;
  V._v1012 = 1;
  const err = V.errf, NF = V.NF, M = V.M;
  const cnt = (k, d) => { try { const x = d == null ? 1 : +d; if (x) V.n[k] = (V.n[k] || 0) + x; } catch (e) { /* 数えるだけ */ } };
  const L2 = (lang) => String(lang || "en").slice(0, 2);
  const TBCV = /^\s*(?:to be confirmed|待确认|待確認|por confirmar|à confirmer|noch zu bestätigen|확인 예정|—|-|–)?\s*$/i;

  /* ① 単品の寸法の欄が空・To be confirmed で、仕様の表に寸法の行（外径・内径・幅・高さ・長さ・厚さ・直径・サイズ）があれば、
       「See specifications: Inner Diameter 20mm · Outer Diameter 47mm · Width 14mm」（推し量りの W×D×H は作らない） */
  const UNITCOL = /^(?:unit|individual(?: item)?|single(?: unit)?|item|product|piece)\b.*(?:W\s*[×x]\s*D|dimension|size)|单品|單品|unidad.*(?:dimens|medid)|dimensiones? (?:de la )?unidad/i;
  const DIMROW = /\b(?:outer|inner|outside|inside)?\s*(?:diameter|width|height|length|depth|thickness|size|dimensions?|bore|o\.?d\.?|i\.?d\.?)\b|外径|内径|直径|宽|寬|高|长|長|厚|尺寸|diámetro|ancho|alto|largo|espesor/i;
  const DIMVAL = /\d+(?:\.\d+)?\s*(?:mm|cm|m|in|inch|″|")\b/i;
  const SEESPEC = { en: "See specifications: ", zh: "见规格表：", es: "Ver especificaciones: ", fr: "Voir les spécifications : ", de: "Siehe Spezifikationen: " };
  function specDims(M0) {
    const out = [];
    try {
      [].concat(M0.specsList || [], M0.specsP1 ? [M0.specsP1] : []).forEach((sp) => (sp && sp.rows || []).forEach((r) => {
        const a = NF(r && r[0]).trim(), b = NF(r && r[1]).trim();
        if (a && b && DIMROW.test(a) && DIMVAL.test(b) && !/weight|重量|peso|容量|volume/i.test(a) && out.length < 4) out.push(a + " " + b.replace(/\s*·\s*$/, ""));
      }));
    } catch (e) { err("specDims", e); }
    return out;
  }
  V.packUnitSpec = function (M0, lang) {
    let n = 0;
    try {
      if (!M0 || !Array.isArray(M0.packs)) return 0;
      const dims = specDims(M0); if (!dims.length) return 0;
      const pre = SEESPEC[L2(lang)] || SEESPEC.en, sep = L2(lang) === "zh" ? "、" : " · ";
      const val = pre + dims.join(sep);
      M0.packs.forEach((pk) => {
        if (!pk || pk.cmp || !Array.isArray(pk.rows)) return;
        const cols = Array.isArray(pk.cols) ? pk.cols : [];
        if (cols.length > 2 && pk.rows.length === 1 && Array.isArray(pk.rows[0])) {
          cols.forEach((c, ci) => { if (UNITCOL.test(NF(c)) && TBCV.test(NF(pk.rows[0][ci]))) { pk.rows[0][ci] = val; n++; } });
        } else if (cols.length <= 2) {
          pk.rows.forEach((r) => { if (Array.isArray(r) && UNITCOL.test(NF(r[0])) && TBCV.test(NF(r[1]))) { r[1] = val; n++; } });
        }
      });
      if (n) { V.lastUnitSpec = { at: Date.now(), t: val }; cnt("unitSpec", n); }
    } catch (e) { err("unitSpec", e); }
    return n;
  };

  /* ② 全成分表の和名の列：登録の表示名称が略号（BG・DPG・PG・EDTA-2Na・PEG-8 など＝日本の表示名称そのもの）のとき、
       21.99 の作りは「日本語でない」として和名を空（資料では「—」）にしていた。登録の表示名称をそのまま出す（作らない・訳さない） */
  const ABBR = /^[A-Z0-9][A-Za-z0-9\-.・\s]{0,14}$/;
  function abbrMap(t) {
    const m = new Map();
    try {
      const cols = (t.compCols || []).map((c) => String(c == null ? "" : c));
      let iI = cols.findIndex((c, i) => i > 0 && /INCI/i.test(c)); if (iI < 0) iI = 1;
      (t.compRows || []).forEach((r) => {
        if (!Array.isArray(r)) return;
        const c0 = NF(r[0] == null ? "" : r[0]).trim(), inc = NF(r[iI] == null ? "" : r[iI]).trim();
        const one = c0.match(/^([A-Za-z0-9.\-]{1,12})\s*[/／]\s*([A-Za-z][A-Za-z0-9 ,.\-'&+()]{2,})$/); // 「BG/Butylene Glycol」
        if (one && !/[ぁ-ゖァ-ヺ一-龯]/.test(one[1])) { m.set(one[2].trim().toLowerCase(), one[1]); return; }
        if (c0 && inc && ABBR.test(c0) && c0.toLowerCase() !== inc.toLowerCase() && c0.length < inc.length) m.set(inc.toLowerCase(), c0);
      });
    } catch (e) { err("abbr", e); }
    return m;
  }
  if (typeof W.v99dkInciRows === "function" && !W.v99dkInciRows.v101out) {
    const __ir101 = W.v99dkInciRows;
    const f = function (t) {
      const r = __ir101.apply(this, arguments);
      try {
        if (Array.isArray(r) && t) {
          const mp = abbrMap(t);
          if (mp.size) r.forEach((x) => { if (Array.isArray(x) && !String(x[1] || "").trim()) { const a = mp.get(NF(x[0]).trim().toLowerCase()) || mp.get(NF(x[0]).replace(/\s*\(.*\)\s*$/, "").trim().toLowerCase()); if (a) { x[1] = a; cnt("inciAbbr"); } } });
        }
      } catch (e) { err("inciAbbr", e); }
      return r;
    };
    f.v101out = 1;
    W.v99dkInciRows = f;
  }

  /* ③ 連絡のページ「Request the product data sheet / Full specifications, ingredients/materials and packaging details.」：
       食品・化粧品・ペットフードなど成分のある商品は ingredients、木のパズル・マスク・部品など成分の無い商品は materials だけにする */
  const IM = [[/ingredients\s*\/\s*materials/gi, "ingredients", "materials"], [/成分[/／]材料/g, "成分", "材料"], [/ingredientes\s*\/\s*materiales/gi, "ingredientes", "materiales"], [/ingrédients\s*\/\s*matériaux/gi, "ingrédients", "matériaux"], [/Zutaten\s*\/\s*Materialien/gi, "Zutaten", "Materialien"], [/성분\s*\/\s*소재/g, "성분", "소재"], [/thành phần\s*\/\s*vật liệu/gi, "thành phần", "vật liệu"]];
  function matKind(T) {
    try {
      if (typeof V.nonFood === "function" && V.nonFood(T)) return "mat";
      const ck = String((T && T.catKey) || ""), c = String((T && T.cat) || "") + " " + String((T && T.item) || "");
      if (ck === "medical" && !/医薬品|サプリ|健康食品/.test(c)) return "mat";
      if (/^(food|cosme|liquor|pet)$/.test(ck) || /食品|飲料|酒|茶|化粧|美容液|ペットフード|おやつ|サプリ|医薬品/.test(c)) return "ingr";
    } catch (e) { /* 決めない */ }
    return "";
  }
  V.matKind = matKind;
  function contactFix(S, K) {
    try {
      const g = V.G(); const T = (g && g.run && g.ten) || V.ten();
      const kind = matKind(T); if (!kind || !S || !Array.isArray(S.els)) return 0;
      let n = 0;
      S.els.forEach((e) => (e && e.k === "text" && Array.isArray(e.ps) ? e.ps : []).forEach((p) => (p.r || []).forEach((r) => {
        if (!r || typeof r.t !== "string") return;
        let t = r.t;
        IM.forEach(([re, a, b]) => { t = t.replace(re, kind === "ingr" ? a : b); });
        if (t !== r.t) { r.t = t; n++; delete e.mh; }
      })));
      if (n) cnt("contactWord", n);
      return n;
    } catch (e) { err("contact", e); return 0; }
  }
  V.contactFix = contactFix;
  try {
    if (typeof DK3_SL !== "undefined" && DK3_SL && typeof DK3_SL.contact === "function" && !DK3_SL.contact.v101out) { // eslint-disable-line no-undef
      const __ct101 = DK3_SL.contact; // eslint-disable-line no-undef
      const f = function (K) { const S = __ct101.apply(this, arguments); try { (Array.isArray(S) ? S : [S]).forEach((x) => contactFix(x, K)); } catch (e) { err("contactW", e); } return S; };
      f.v101out = 1;
      DK3_SL.contact = f; // eslint-disable-line no-undef
    }
  } catch (e) { err("contactWrap", e); }

  /* ④ 括弧の前の空白（「fabric(3 layers)」→「fabric (3 layers)」・複数形の「(s)」は変えない）・見出し「Composition, Specifications Table」→「Composition and Specifications Table」 */
  const LATIN = /^(en|es|fr|de|id|ms|vi|pt|it)/;
  const SKIPK = new Set(["ic", "src", "ref", "url", "web", "mail", "photos", "media", "hero", "pal", "font", "idx", "key", "k0"]);
  const parenFix = (s) => String(s).replace(/([A-Za-z]{2,})\((?!s\)|es\)|\d+\)(?:\s|$)|e\)|ies\))(?=[A-Za-z0-9])/g, "$1 (");
  const titleFix = (s, lg) => (lg === "en" ? String(s).replace(/^([A-Z][a-z]+), ([A-Z][a-z]+) (Table|List|Sheet)$/, "$1 and $2 $3") : String(s));
  V.polishModel = function (M0, lang) {
    let n = 0;
    try {
      if (!M0 || !LATIN.test(String(lang || ""))) return 0;
      const lg = L2(lang);
      const seen = new WeakSet();
      const walk = (o, depth) => {
        if (!o || typeof o !== "object" || seen.has(o) || depth > 8) return;
        seen.add(o);
        if (Array.isArray(o)) { o.forEach((v, i) => { if (typeof v === "string") { const nv = parenFix(v); if (nv !== v) { o[i] = nv; n++; } } else walk(v, depth + 1); }); return; }
        Object.keys(o).forEach((k) => {
          if (SKIPK.has(k)) return;
          const v = o[k];
          if (typeof v === "string") { let nv = parenFix(v); if (k === "eb" || k === "title") nv = titleFix(nv, lg); if (nv !== v) { o[k] = nv; n++; } }
          else walk(v, depth + 1);
        });
      };
      ["specsList", "specsP1", "packs", "products", "quality", "ingr", "v85", "pricing", "glance"].forEach((k) => walk(M0[k], 0));
      if (n) { V.lastPolish = { at: Date.now(), n }; cnt("polish", n); }
    } catch (e) { err("polish", e); }
    return n;
  };

  /* ⑦ 決まった訳語（21.97 の訳語の表）で直した文の語順・訳せなかった「前払」 */
  if (typeof W.v97dkTermFix === "function" && !W.v97dkTermFix.v101out) {
    const __tf101 = W.v97dkTermFix;
    const pre = (s, lang) => {
      const lg = L2(lang); let x = String(s == null ? "" : s);
      const IN_ADV = { en: "in advance", es: "por adelantado", fr: "d'avance", de: "im Voraus", zh: "预付", ko: "선불" }[lg === "zh" ? "zh" : lg] || "in advance";
      if (lg === "zh") return x.replace(/前払い?/g, IN_ADV);
      return x.replace(/前払い?\s*(\d+(?:\.\d+)?\s*[%％])/g, (m0, p) => p.replace("％", "%") + " " + IN_ADV).replace(/前払い?/g, IN_ADV);
    };
    const post = (x, lang) => {
      if (typeof x !== "string") return x;
      const lg = L2(lang);
      if (lg === "en") return x.replace(/\bafter order\s+(\d[\d,.]*\s*(?:business days?|days?|weeks?|months?))/gi, "$1 after order").replace(/\bfrom manufacture\s+(\d[\d,.]*\s*(?:years?|months?|weeks?|days?))/gi, "$1 from manufacture").replace(/\bafter delivery\s+(\d[\d,.]*\s*(?:days?|weeks?|months?|years?))/gi, "$1 after delivery");
      if (lg === "es") return x.replace(/\btras el pedido\s+(\d[\d,.]*\s*(?:días?|semanas?|meses?))/gi, "$1 tras el pedido").replace(/\bdesde la fabricación\s+(\d[\d,.]*\s*(?:años?|meses?|días?))/gi, "$1 desde la fabricación");
      return x;
    };
    const f = function (s, lang) {
      let r = null;
      try {
        const s2 = pre(s, lang);
        r = __tf101.call(this, s2, lang);
        if (r == null && s2 !== String(s == null ? "" : s) && typeof W.v97dkJpRes === "function" && !W.v97dkJpRes(lang, s2)) r = s2; // 前払だけが残っていた文
        if (r != null) { const r2 = post(r, lang); if (r2 !== r) cnt("termOrder"); r = r2; }
      } catch (e) { err("termFix", e); try { r = __tf101.apply(this, arguments); } catch (x) { r = null; } }
      return r;
    };
    f.v101out = 1;
    W.v97dkTermFix = f;
    try { if (W.V97DK) W.V97DK.termFix = f; } catch (e) { /* 次へ */ }
  }

  /* ⑤⑥ AI につながらないときの確認の欄・資料の画面の案内 */
  const OFF_FIX_OLD = ["管理画面でAIを接続してから、「↻ もう一度作る」を押してください。", "管理画面でAIを接続してください。"];
  const OFF_FIX_NEW = "いま AI につながらないため（通信の一時的な切れ目など）、少し待ってから「↻ もう一度作る」を押してください（何度やってもつながらないときは、管理者に AI の接続を確かめてもらってください）。";
  /* 資料の画面の上の知らせ（作る前）：理由どおりに（トライアルの人は管理画面を開けない） */
  const BAN = [["⚠ AIエンジンにつながっていないため、新しく外国語の文章を書けません。管理画面でAIを接続してください。", "⚠ いま AI につながっていないため、新しく外国語の文章を書けません（通信の一時的な切れ目など）。少し待ってから画面を開き直し、もう一度作ってください（何度やってもつながらないときは、管理者に AI の接続を確かめてもらってください）。", "⚠ The AI cannot be reached right now, so no new foreign-language text can be written (for example, a temporary network break). Wait a moment, reopen this page and make it again (if it keeps failing, ask your administrator to check the AI connection).", "⚠ 暂时无法连接 AI，因此无法撰写新的外语文案（例如网络短暂中断）。请稍候重新打开本页面再制作（多次仍无法连接时，请让管理员确认 AI 的连接）。", "⚠ No se puede conectar con la IA en este momento, así que no se puede redactar texto nuevo en otros idiomas (p. ej., un corte breve de la red). Espere, vuelva a abrir la página y créelo de nuevo (si sigue fallando, pida al administrador que revise la conexión de la IA)."], ["⚠ AIエンジン未接続のため、外国語の文章を作れません（登録データのまま＝最終チェックで止まります）。管理画面でAIを接続してください。", "⚠ いま AI につながっていないため、外国語の文章を作れません（登録データのまま＝最終チェックで止まります）。少し待ってから画面を開き直してください（何度やってもつながらないときは、管理者に AI の接続を確かめてもらってください）。", "⚠ The AI cannot be reached right now, so no foreign-language text can be written (the registered data stays as it is, and the final check will stop it). Wait a moment and reopen this page (if it keeps failing, ask your administrator to check the AI connection).", "⚠ 暂时无法连接 AI，无法撰写外语文案（保持登记数据原样＝会在最终检查时被拦下）。请稍候重新打开本页面（多次仍无法连接时，请让管理员确认 AI 的连接）。", "⚠ No se puede conectar con la IA en este momento, así que no se puede redactar texto en otros idiomas (los datos registrados quedan como están y la revisión final lo detendrá). Espere y vuelva a abrir la página (si sigue fallando, pida al administrador que revise la conexión de la IA)."]];
  V.offBan = (h) => { let x = String(h == null ? "" : h); BAN.forEach((b) => { if (x.indexOf(b[0]) >= 0) { x = x.split(b[0]).join(b[1]); cnt("offBan"); } }); return x; };
  V.OFF_FIX_NEW = OFF_FIX_NEW;
  const offFix = (s) => { let x = String(s == null ? "" : s); OFF_FIX_OLD.forEach((o) => { if (x.indexOf(o) >= 0) x = x.split(o).join(OFF_FIX_NEW); }); return x; };
  V.offFix = offFix;
  const FIXED_RE = /^(この保存した資料の)?日本語のまま残っていた (\d+)か所を、決まった訳語に直しました（([\s\S]*)）$/;
  function ckOffline(r) {
    try {
      if (!r) return r;
      ["crit", "warn"].forEach((k) => (r[k] || []).forEach((c) => { if (c && typeof c.t === "string") { const t2 = offFix(c.t); if (t2 !== c.t) { c.t = t2; cnt("offFix"); } } }));
      const jp = (r.crit || []).some((c) => c && c.k === "jp");
      if (jp && Array.isArray(r.ok)) {
        r.ok = r.ok.map((x) => {
          const m = String(x).match(FIXED_RE); if (!m) return x;
          cnt("fixedReword");
          return (m[1] || "") + "決まった訳語で直せた所：" + m[2] + "か所（" + m[3] + "）。訳語の無い所は日本語のまま残っています（「送れない」の欄の「日本語が残っています」）";
        });
      }
    } catch (e) { err("ckOff", e); }
    return r;
  }
  V.ckOffline = ckOffline;
  if (typeof W.dk3Check === "function" && !W.dk3Check.v101outOff) {
    const __ck101o = W.dk3Check;
    const f = function () { const r = __ck101o.apply(this, arguments); return ckOffline(r); };
    f.v101outOff = 1;
    W.dk3Check = f;
  }
  /* 保存した資料を開いたとき（控えの確認の欄は前の文のまま）も同じ言い方に */
  if (typeof W.dk14Open === "function" && !W.dk14Open.v101outOff) {
    const __op101o = W.dk14Open;
    const f = async function () { const r = await __op101o.apply(this, arguments); try { const g = V.G(); if (g && g.check) ckOffline(g.check); } catch (e) { err("openOff", e); } return r; };
    f.v101outOff = 1;
    W.dk14Open = f;
  }
  try {
    if (typeof I18N !== "undefined" && I18N && I18N.dict) { // eslint-disable-line no-undef
      BAN.map((b) => b.slice(1)).concat([[OFF_FIX_NEW, "The AI cannot be reached right now (for example, a temporary network break). Wait a moment and press “↻ Make it again” (if it keeps failing, ask your administrator to check the AI connection).", "暂时无法连接 AI（例如网络短暂中断）。请稍候再点击“↻ 重新制作”（多次仍无法连接时，请让管理员确认 AI 的连接）。", "No se puede conectar con la IA en este momento (por ejemplo, un corte breve de la red). Espere un momento y pulse «↻ Crear de nuevo» (si sigue fallando, pida al administrador que revise la conexión de la IA)."]])
        .forEach((x) => { ["en", "zh", "es"].forEach((l, i) => { if (I18N.dict[l] && !I18N.dict[l][x[0]]) I18N.dict[l][x[0]] = x[i + 1]; }); }); // eslint-disable-line no-undef
    }
    if (typeof I18N !== "undefined" && I18N && Array.isArray(I18N.pat)) { // eslint-disable-line no-undef
      I18N.pat.unshift({ re: /^(この保存した資料の)?決まった訳語で直せた所：(\d+)か所（([\s\S]*)）。訳語の無い所は日本語のまま残っています（「送れない」の欄の「日本語が残っています」）$/, // eslint-disable-line no-undef
        en: (m) => (m[1] ? "In this saved deck, " : "") + "Fixed with the set glossary: " + m[2] + " place(s) (" + m[3] + "). Places without a glossary term are still in Japanese (see “Japanese remains” under “Cannot send”)",
        zh: (m) => "已用固定译语修正：" + m[2] + " 处（" + m[3] + "）。没有固定译语的部分仍为日语（见“无法发送”中的“仍有日语”）",
        es: (m) => "Corregido con el glosario: " + m[2] + " lugar(es) (" + m[3] + "). Lo que no tiene término sigue en japonés (vea «Queda japonés» en «No se puede enviar»)" });
      I18N.pat.unshift({ re: /^品質のページの見出しを中身に合わせました（表のページに移した事実の言葉を外しました）：([\s\S]+)$/, // eslint-disable-line no-undef
        en: (m) => "Matched the quality page heading to its content (removed words for facts moved to the table pages): " + m[1], zh: (m) => "已使品质页的标题与内容一致：" + m[1], es: (m) => "Se ajustó el título de la página de calidad a su contenido: " + m[1] });
      I18N.pat.unshift({ re: /^梱包・物流のページの単品の寸法を、仕様の表の寸法に合わせました：([\s\S]+)$/, // eslint-disable-line no-undef
        en: (m) => "Unit dimensions on the packaging page now point to the dimensions in the specifications table: " + m[1], zh: (m) => "包装・物流页的单品尺寸已与规格表一致：" + m[1], es: (m) => "Las dimensiones de la unidad en la página de embalaje remiten a la tabla de especificaciones: " + m[1] });
    }
  } catch (e) { err("i18n1012", e); }
})();

/* ═══ v22.01 out：最終チェックの ✓ の文（英・中・西） ═══ */
(function () {
  "use strict";
  const V = window.V101OUT;
  if (!V || V._i18n) return;
  V._i18n = 1;
  try {
    if (typeof I18N !== "undefined" && I18N && Array.isArray(I18N.pat)) { // eslint-disable-line no-undef
      const W = { en: [["成分のページ", "ingredients page"], ["商品の特長", "product features"], ["品質のページ", "quality page"], ["梱包・物流のページ", "packaging page"], ["売れる理由のページ", "Why It Sells page"]], zh: [["成分のページ", "成分页"], ["商品の特長", "商品特点"], ["品質のページ", "品质页"], ["梱包・物流のページ", "包装・物流页"], ["売れる理由のページ", "畅销理由页"]], es: [["成分のページ", "página de ingredientes"], ["商品の特長", "características del producto"], ["品質のページ", "página de calidad"], ["梱包・物流のページ", "página de embalaje"], ["売れる理由のページ", "página Por qué se vende"]] };
      const tw = (s, l) => { let x = String(s); (W[l] || []).forEach(([a, b]) => { x = x.split(a).join(b); }); return x.replace(/・/g, l === "zh" ? "、" : ", "); };
      I18N.pat.unshift({ re: /^同じ情報が2枚に重ならないよう、表のページ（成分・仕様の表・要約・取引条件）にある事実を、ほかのページから外しました（(\d+)件）：([\s\S]+)$/, // eslint-disable-line no-undef
        en: (m) => "To avoid showing the same facts on two slides, " + m[1] + " item(s) already on the table pages (specs table, at a glance, trade terms) were removed from other pages: " + tw(m[2], "en"),
        zh: (m) => "为避免同一信息出现在两页，已从其他页面删除表格页（成分・规格表、概要、交易条件）中已有的 " + m[1] + " 项：" + tw(m[2], "zh"),
        es: (m) => "Para no repetir los mismos datos en dos diapositivas, se quitaron " + m[1] + " elemento(s) que ya están en las páginas de tablas: " + tw(m[2], "es") });
      I18N.pat.unshift({ re: /^梱包・物流のページの表を登録の表に合わせました：([\s\S]+)$/, // eslint-disable-line no-undef
        en: (m) => "Aligned the packaging table with the registered table: " + String(m[1]).replace(/品番＝/g, "product no. = ").replace(/入数＝外装の/g, "quantity per case = outer carton ").replace(/・/g, ", "),
        zh: (m) => "已按登记的表格调整包装・物流页的表格：" + m[1],
        es: (m) => "Se ajustó la tabla de embalaje a la tabla registrada: " + String(m[1]).replace(/・/g, ", ") });
      I18N.pat.unshift({ re: /^価格の表の小数の桁を、同じ表の登録の値（小数2桁）にそろえました（(\d+)か所・値は変えていません）$/, // eslint-disable-line no-undef
        en: (m) => "Aligned decimal places in the price table with the registered values (2 decimals) (" + m[1] + " places; values unchanged)",
        zh: (m) => "已将价格表的小数位与登记的值（2位小数）统一（" + m[1] + " 处・数值未变）",
        es: (m) => "Se igualaron los decimales de la tabla de precios a los valores registrados (2 decimales) (" + m[1] + "; valores sin cambios)" });
      I18N.pat.unshift({ re: /^成分のページの見出しを中身に合わせました（アレルゲンは成分・仕様の表に載せています）：([\s\S]+)$/, // eslint-disable-line no-undef
        en: (m) => "Matched the ingredients page heading to its content (allergens are in the specifications table): " + m[1],
        zh: (m) => "已使成分页的标题与内容一致（过敏原列在成分・规格表中）：" + m[1],
        es: (m) => "Se ajustó el título de la página de ingredientes a su contenido (los alérgenos están en la tabla de especificaciones): " + m[1] });
      I18N.pat.unshift({ re: /^表紙で同じ文字が2回続いていたため、小さい方を外しました：([\s\S]+)$/, // eslint-disable-line no-undef
        en: (m) => "The same text appeared twice on the cover; the smaller one was removed: " + m[1],
        zh: (m) => "封面上同样的文字出现了两次，已删除较小的一处：" + m[1],
        es: (m) => "El mismo texto aparecía dos veces en la portada; se quitó el más pequeño: " + m[1] });
      I18N.pat.unshift({ re: /^「売れる理由」のページは入れていません：([\s\S]+)$/, // eslint-disable-line no-undef
        en: () => "The “Why It Sells” page is not included: the allergen item is already in the specifications table, which left only one item (the page needs two). Register the product strengths one by one with figures or test conditions (or answer the follow-up questions), then press “↻ Make it again”",
        zh: () => "未放入“畅销理由”页：过敏原已列在成分・规格表中而被删除，只剩 1 项（需要 2 项）。请逐条登记带数字或试验条件的商品优势（或回答追加问题），再点“↻ 重新制作”",
        es: () => "No se incluyó la página «Por qué se vende»: el alérgeno ya está en la tabla y quedó un solo punto (se necesitan dos). Registre los puntos fuertes con cifras o condiciones de prueba y pulse «↻ Crear de nuevo»" });
      I18N.pat.unshift({ re: /^材質・仕様の表の列を、食品でない商品の形に直しました：([\s\S]+)$/, // eslint-disable-line no-undef
        en: (m) => "Adjusted the materials/specifications table for a non-food product: " + String(m[1]).replace(/見出し/g, "header ").replace(/小見出し/g, "subtitle ").replace(/行/g, " row(s)").replace(/・/g, ", "),
        zh: (m) => "已将材质・规格表调整为非食品商品的形式：" + m[1],
        es: (m) => "Se ajustó la tabla de materiales/especificaciones para un producto no alimentario: " + String(m[1]).replace(/・/g, ", ") });
    }
  } catch (e) { try { V.errf("i18n", e); } catch (x) { /* 記録だけ */ } }
})();
