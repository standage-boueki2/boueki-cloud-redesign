/* 22.01 hear：中身（データ・判定・AI の扱い）。見せ方は rd_v101hear.css／rd_v101hear.js（刷新版）。2026-11-22 第14回 UAT〔22.00.1〕の直し
   No.610（中）寸法・重量：資料に無い商品で「出荷案件・見積書を作るには…足りないのは 寸法・重量です」で書類が作れない。
     「不明（資料に記載なし）」と入れると通り、数字でない値が寸法・重量として登録され、STEP01 の充足度にも数えられた。
     原因：①書類の画面の「寸法・重量を入れる」は、何の表か分からない2列の表（項目／内容）を開くだけ。保存（tblSave）は中身を確かめずに
           寸法の行として登録し、値があるかだけで数える充足度（v92prodFill・scoreOf）も「入っている」に数えた。
           ②寸法が無いと出荷案件（buildShip）を作らないので、寸法が要らない見積書・請求書まで作れなかった（v68 の案内の箱だけになる）。
     直し：・window.v101num(v)（数字として読めるか）・window.v101numVal(v)・window.v101dims(ten)（取り決め：外装〔カートン〕と単品を分けて読む）
           ・「不明」「わからない」「資料に記載なし」などは、寸法・価格・MOQ・リードタイム・入数の値として登録しない（TEN.v101hunk に「未確認」として控える）。
             ほかの欄（産地・認証・期限など）も、その言葉だけの値は充足度に数えない（値は消さない）
           ・足りないときの案内に、単品／外装（カートン）の寸法・重さ・入数を単位つきで入れる欄と「まだ分からない」を出す（rd 側）。
             「まだ分からない」を選ぶと、見積書・PI・請求書は作れる（出荷案件は寸法「未確認」で作る）。梱包明細・船積依頼書（S/I）・運賃の見積は「要確認」にして、寸法を入れるまで止める。
   No.612（低）件数：「あとで、にした4項目」なのに5つに見える（項目名の中の「・」と区切りの「・」が同じ）。「AI追加ヒアリング4件」なのに質問は3問
           （成分の答えから移した「不使用の主張」〔v100 fact〕まで数えていた）。→ 項目は「」で1つずつ囲む。件数は並べた項目・実際の質問から数える。
   No.613（低）強み：1通にまとめて送ると「1件」、残りを個別に送ると同じ内容が2回ずつ。→ まとめた強みを分けて数え、重なり（同じ・含む）は登録しない。
   No.614（低）材質表：1行目が「原材料名／RoHS・REACH 対応は資料に記載なし」。→ 規制の注記（RoHS・REACH・記載なし など）は表の行にせず、表の注記（TEN.v101regNote）へ。
           工業部品などの表の項目名に「原材料名」を使わない。
   No.518 の残り：「医療機器ではない」と答えたのに、任意項目に「医療機器のクラス分類」、AI も「どのクラス（Class I／II）ですか」。
           → 否定の答え（医療機器ではない・食品に触れない・電池なし・滅菌なし・防腐剤なし・保証なし・アレルゲンなし）のあとは、
             それを前提にした問い（AI の追加ヒアリング・任意項目）を出さない。
   失敗しても画面が止まらないよう try/catch。最後のエラーは window.V101HEAR.err。 */
var V101HEAR = window.V101HEAR || { err: null, errs: [], ver: "22.01-hear", n: {}, log: [] };
window.V101HEAR = V101HEAR;
(function () {
  "use strict";
  const W = window, V = V101HEAR;
  if (W.__v101hearLogic) return;
  W.__v101hearLogic = 1;
  const err = (k, e) => { try { const s = k + ": " + String((e && (e.stack || e.message)) || e).slice(0, 300); V.err = s; V.errs.push(s); if (V.errs.length > 40) V.errs.shift(); } catch (x) { /* 記録だけ */ } };
  V.e = err;
  const cnt = (k, n) => { V.n[k] = (V.n[k] || 0) + (n || 1); };
  const lg = (o) => { try { V.log.push(Object.assign({ at: Date.now() }, o)); if (V.log.length > 60) V.log.shift(); } catch (e) { /* 無視 */ } };
  const ten = () => { try { return typeof TEN !== "undefined" ? TEN : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const fillO = () => { try { return typeof FILL !== "undefined" && FILL ? FILL : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const dd = () => { try { return typeof D !== "undefined" && D ? D : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const fn = (n) => { try { const f = W[n]; return typeof f === "function" ? f : null; } catch (e) { return null; } };
  const lang = () => { try { const el = document.getElementById("lang"); const v = String((el && el.value) || (W.I18N && W.I18N.lang) || document.documentElement.lang || "ja"); return /^en/.test(v) ? "en" : /^zh/.test(v) ? "zh" : /^es/.test(v) ? "es" : "ja"; } catch (e) { return "ja"; } };
  const M = (ja, en, zh, es) => { const l = lang(); return l === "en" ? (en || ja) : l === "zh" ? (zh || en || ja) : l === "es" ? (es || en || ja) : ja; };
  const E = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const NF = (s) => { let x = String(s == null ? "" : s); try { x = x.normalize("NFKC"); } catch (e) { /* そのまま */ } return x; };
  const userT = (t) => !!(t && (t.src === "upload" || t.src === "sample2"));
  const save = () => { try { if (typeof saveTen === "function") saveTen(); } catch (e) { err("save", e); } }; // eslint-disable-line no-undef
  const toast = (m) => { try { if (typeof W.toast === "function") W.toast(m); } catch (e) { /* 無視 */ } };
  V.M = M; V.E = E; V.NF = NF; V.lang = lang; V.cnt = cnt;
  // 包む（同じ関数を何度包んでも二重にかからないよう、印を付ける）
  function wrap(name, mk) {
    try {
      const o = W[name];
      if (typeof o !== "function") return false;
      const f = mk(o);
      f.__v101hear = (o.__v101hear || 0) + 1;
      W[name] = f;
      try { if (typeof globalThis[name] === "function" && globalThis[name] !== f) globalThis[name] = f; } catch (e) { /* 無視 */ }
      return true;
    } catch (e) { err("wrap:" + name, e); return false; }
  }
  V.wrap = wrap;

  /* ════════════ No.610 ① 数字として読めるか（取り決め） ════════════ */
  const UNKW = /不明|わから|分から|判ら|わかりません|分かりません|知らない|しらない|未確認|記載(?:が|は)?(?:な|無)|資料に(?:な|無)|未記載|載って(?:い)?(?:ない|ません)|不詳|未定|調査中|確認中|検討中|未測定|測って(?:い)?(?:ない|ません)|はかって(?:い)?(?:ない|ません)|あとで|後で|まだ(?:ない|無い|ありません|分から|わから)|unknown|not\s*(?:known|stated|available|sure|specified)|\bn\/?a\b|\btbd\b|\btbc\b|to be (?:confirmed|determined)/i;
  function isUnk(v) {
    if (v == null) return false;
    if (Array.isArray(v)) { const a = v.filter((x) => x != null && String(x).trim()); return a.length > 0 && a.every(isUnk); }
    const s = NF(v).trim();
    if (!s) return false;
    if (/\d/.test(s)) return false; // 数字が入っていれば値（一部が分からないだけ）
    if (UNKW.test(s)) return true;
    return /^[?？\-—ー－‐・.。…]+$/.test(s);
  }
  V.isUnk = isUnk;
  W.v101isUnk = isUnk;
  const KANJI = { "〇": 0, "一": 1, "二": 2, "三": 3, "四": 4, "五": 5, "六": 6, "七": 7, "八": 8, "九": 9 };
  function numVal(v) {
    if (typeof v === "number") return isFinite(v) ? v : null;
    if (v == null) return null;
    const s0 = NF(v).trim();
    if (!s0 || isUnk(s0)) return null;
    const s = s0.replace(/(\d),(?=\d{3}(?!\d))/g, "$1");
    const m = s.match(/-?\d+(?:\.\d+)?/);
    if (m) { const x = parseFloat(m[0]); return isFinite(x) ? x : null; }
    const k = s.match(/^[〇一二三四五六七八九]$/);
    return k ? KANJI[k[0]] : null;
  }
  // 数値として読めるか（「不明」「わからない」「資料に記載なし」は false）
  W.v101num = function (v) { try { return numVal(v) != null; } catch (e) { err("num", e); return false; } };
  W.v101numVal = function (v) { try { return numVal(v); } catch (e) { err("numVal", e); return null; } };

  /* 寸法の文字（mm の「400×300×250」・「φ47×14」）→ cm */
  function mmTriple(s) {
    s = NF(s).replace(/[✕＊*xX]/g, "×").trim();
    if (!s || isUnk(s)) return null;
    const phi = /^[φΦ]/.test(s) || /直径/.test(s);
    const ns = (s.match(/\d+(?:\.\d+)?/g) || []).map(parseFloat).filter((x) => isFinite(x));
    if (!ns.length) return null;
    const unit = /cm|センチ/i.test(s) ? 10 : /(?<![a-z])m(?![a-z])|メートル/i.test(s) && !/mm/i.test(s) ? 1000 : 1;
    const cm = (x) => Math.round(((x * unit) / 10) * 100) / 100;
    if (phi) return { l: cm(ns[0]), wd: cm(ns[0]), h: ns[1] != null ? cm(ns[1]) : null };
    return { l: cm(ns[0]), wd: ns[1] != null ? cm(ns[1]) : null, h: ns[2] != null ? cm(ns[2]) : null };
  }
  function kgOf(s) {
    s = NF(s).trim();
    if (!s || isUnk(s)) return null;
    const m = s.match(/(\d+(?:[.,]\d+)?)\s*(kg|キログラム|キロ|グラム|g)?(?![a-z])/i);
    if (!m) return null;
    const x = parseFloat(m[1].replace(/,(?=\d{3}\b)/, "").replace(",", "."));
    if (!isFinite(x)) return null;
    const u = String(m[2] || "").toLowerCase();
    return Math.round((u === "g" || u === "グラム" ? x / 1000 : x) * 10000) / 10000;
  }
  function cntOf(s) { const m = NF(s).match(/(\d+)/); return m ? +m[1] : null; }
  const V54COLS = /単品\s*W×D×H|単品重量|入数|外装\s*W×D×H|外装重量/;
  function colIdx(cols, re) { return (Array.isArray(cols) ? cols : []).findIndex((c) => re.test(NF(c))); }
  // 寸法・重量の表を読む（外装〔カートン〕と単品を分けて）
  function readDims(t) {
    const out = { unit: { l: null, wd: null, h: null, w: null }, carton: { l: null, wd: null, h: null, w: null }, perCtn: null };
    try {
      const rows = (Array.isArray(t && t.dimRows) ? t.dimRows : []).filter((r) => Array.isArray(r) && r.some((x) => x != null && String(x).trim()));
      if (!rows.length) return out;
      const cols = Array.isArray(t.dimCols) ? t.dimCols : [];
      const put = (o, k, v) => { if (o[k] == null && v != null) o[k] = v; };
      const putD = (o, tr) => { if (tr) { put(o, "l", tr.l); put(o, "wd", tr.wd); put(o, "h", tr.h); } };
      if (cols.filter((c) => V54COLS.test(NF(c))).length >= 3) {
        const iU = colIdx(cols, /単品\s*W×D×H/), iUw = colIdx(cols, /単品重量/), iC = colIdx(cols, /入数/), iO = colIdx(cols, /外装\s*W×D×H/), iOw = colIdx(cols, /外装重量/);
        rows.forEach((r) => {
          if (iU >= 0) putD(out.unit, mmTriple(r[iU]));
          if (iUw >= 0) put(out.unit, "w", kgOf(r[iUw]));
          if (iC >= 0) put(out, "perCtn", cntOf(r[iC]));
          if (iO >= 0) putD(out.carton, mmTriple(r[iO]));
          if (iOw >= 0) put(out.carton, "w", kgOf(r[iOw]));
        });
        return out;
      }
      // ほかの形の表：行の文字をつないで、単品／外装の言葉で分けて読む（土台の読み取りと同じ v54upldDims を使えれば使う）
      const txt = rows.map((r) => r.filter((x) => x != null && String(x).trim()).join(" ")).join("／");
      if (fn("v54upldDims")) {
        const r = W.v54upldDims(txt, "");
        if (r && Array.isArray(r.rows) && r.rows[0]) {
          const x = r.rows[0];
          putD(out.unit, x[1] ? mmTriple(x[1]) : null); put(out.unit, "w", x[2] ? kgOf(x[2]) : null);
          put(out, "perCtn", x[3] ? cntOf(x[3]) : null);
          putD(out.carton, x[4] ? mmTriple(x[4]) : null); put(out.carton, "w", x[5] ? kgOf(x[5]) : null);
        }
      }
    } catch (e) { err("readDims", e); }
    return out;
  }
  const DIM_NM = { l: ["縦", "length"], wd: ["横", "width"], h: ["高さ", "height"], w: ["重さ", "weight"] };
  // 取り決め：{ w: kg|null, l, wd, h: cm|null（＝外装〔カートン〕の値。単品の値は入れない）, ok, missing, unit, carton, perCtn, unknown, later }
  W.v101dims = function (t) {
    try {
      t = t || ten();
      const r = readDims(t || {});
      const C = r.carton, U = r.unit;
      const missing = [];
      ["l", "wd", "h"].forEach((k) => { if (C[k] == null) missing.push(M("外装の" + DIM_NM[k][0], "carton " + DIM_NM[k][1])); });
      if (C.w == null) missing.push(M("外装の重さ", "carton weight"));
      if (r.perCtn == null) missing.push(M("入数（1箱あたり）", "units per carton"));
      const uOk = U.l != null && U.wd != null && U.h != null && U.w != null;
      const cOk = C.l != null && C.wd != null && C.h != null && C.w != null;
      const unk = !!(t && t.v101hunk && t.v101hunk.dimRows);
      return { w: C.w, l: C.l, wd: C.wd, h: C.h, ok: cOk, missing, unit: Object.assign({ ok: uOk }, U), carton: Object.assign({ ok: cOk }, C), perCtn: r.perCtn,
        any: [U.l, U.wd, U.h, U.w, C.l, C.wd, C.h, C.w, r.perCtn].some((x) => x != null), unknown: unk, later: !!(t && t.v101dimLater) };
    } catch (e) { err("dims", e); return { w: null, l: null, wd: null, h: null, ok: false, missing: [], unit: {}, carton: {}, perCtn: null, any: false, unknown: false, later: false }; }
  };

  /* ════════════ No.610 ② 「不明」などは値として登録しない ════════════ */
  const NUMK = ["dimRows", "moq", "lead", "ctn", "priceRows"]; // 数字の欄：値を「未確認」として控えて、欄は空にする
  const TXTK = ["origin", "cert", "shelf", "sku", "coEn", "itemEn", "pol", "hs", "co", "item"]; // 文字の欄：値は消さないが、充足度に数えない
  // 表の行：項目名（1列目）を除いて数字が1つも無い行は、寸法・価格の行にしない
  function rowHasNum(r, cols) {
    if (!Array.isArray(r)) return false;
    const vals = r.map((x) => (x == null ? "" : String(x)));
    const v54 = Array.isArray(cols) && cols.filter((c) => V54COLS.test(NF(c))).length >= 3;
    const body = (v54 || vals.length > 1) ? vals.slice(1) : vals;
    return body.some((x) => /\d/.test(NF(x)));
  }
  function unkStore(t) { if (!t.v101hunk || typeof t.v101hunk !== "object" || Array.isArray(t.v101hunk)) t.v101hunk = {}; return t.v101hunk; }
  function noteUnk(t, k, v, by) {
    try {
      const S = unkStore(t);
      const txt = Array.isArray(v) ? v.map((r) => (Array.isArray(r) ? r.filter((x) => x != null && String(x).trim()).join(" ") : String(r))).filter(Boolean).join("／") : String(v == null ? "" : v);
      S[k] = { v: txt.slice(0, 120), by: by || "", at: Date.now() };
      cnt("unk:" + k); lg({ k: "unk", f: k, v: txt.slice(0, 60), by });
    } catch (e) { err("noteUnk", e); }
  }
  // 数字の欄の「不明」を外して控える。変えたら true
  function clean(t, by) {
    let ch = false;
    if (!t || typeof t !== "object" || V.inShip) return false;
    try {
      ["dimRows", "priceRows"].forEach((k) => {
        const rows = t[k];
        if (!Array.isArray(rows) || !rows.length) return;
        const cols = k === "dimRows" ? t.dimCols : t.priceCols;
        const body = (r) => (Array.isArray(cols) && cols.length > 1 && r.length > 1 ? r.slice(1) : r);
        // 寸法・重量：数字の無い行は寸法にしない。価格：「不明」などだけの行は価格にしない（「応相談」などは残す）
        const keep = rows.filter((r) => !Array.isArray(r) || (k === "dimRows" ? rowHasNum(r, cols) : !(isUnk(body(r)) || isUnk(r))));
        if (keep.length === rows.length) return;
        const drop = rows.filter((r) => keep.indexOf(r) < 0);
        noteUnk(t, k, drop, by);
        t[k] = keep;
        if (!keep.length && k === "dimRows") { delete t.dimNote; }
        ch = true;
      });
      ["moq", "lead", "ctn"].forEach((k) => {
        const v = t[k];
        if (typeof v === "string" && v.trim() && isUnk(v)) { noteUnk(t, k, v, by); t[k] = ""; ch = true; }
      });
      if (t.v101hunk) {
        // 値が入ったら「未確認」の控えを消す
        Object.keys(t.v101hunk).forEach((k) => {
          const v = t[k];
          const has = Array.isArray(v) ? v.length > 0 : !!(v && String(v).trim() && !isUnk(v));
          if (has && NUMK.indexOf(k) >= 0) { delete t.v101hunk[k]; ch = true; }
        });
        if (t.dimRows && t.dimRows.length && t.v101dimLater) { delete t.v101dimLater; ch = true; }
      }
    } catch (e) { err("clean", e); }
    return ch;
  }
  V.clean = clean;
  const cleanAll = () => { try { (typeof TENS !== "undefined" && Array.isArray(TENS) ? TENS : []).forEach((x) => { if (x && userT(x)) clean(x, "sweep"); }); } catch (e) { err("cleanAll", e); } }; // eslint-disable-line no-undef

  // 答え（ヒアリング・AI の聞き取り）：数字の欄に「不明」だけの答えは登録しない
  wrap("applyAnswer", (o) => function (t, k, raw) {
    try {
      if (t && NUMK.indexOf(String(k)) >= 0 && isUnk(raw)) {
        noteUnk(t, String(k), raw, "hear");
        V.lastUnk = { k: String(k), at: Date.now() };
        return false;
      }
    } catch (e) { err("aa-pre", e); }
    const r = o.apply(this, arguments);
    try { if (r && t && NUMK.indexOf(String(k)) >= 0) clean(t, "hear"); } catch (e) { err("aa-post", e); }
    try { if (r && t && k === "strengths") strDedupe(t); } catch (e) { err("aa-str", e); }
    try { if (r && t && k === "compRows") compFix(t); } catch (e) { err("aa-comp", e); }
    return r;
  });
  // ヒアリングで数字の欄に「不明」などと答えたら（土台は後回しにして登録しない）、何と答えたかを「未確認」として控える（商品情報の画面に出す）
  wrap("fillAnswer", (o) => function (v) {
    try {
      const F = fillO(), t = ten();
      const k = F && F.cur && !F.cur.x ? String(F.cur.k || "") : "";
      if (t && k && NUMK.indexOf(k) >= 0 && isUnk(v)) noteUnk(t, k, v, "hear");
    } catch (e) { err("fa-unk", e); }
    return o.apply(this, arguments);
  });
  // 「不明」で登録しなかったとき、「うまく読み取れませんでした」と言って同じ問いを繰り返さず、「未確認として控えた」と言って次へ
  wrap("fillSay", (o) => function (who, html) {
    try {
      const u = V.lastUnk;
      if (who === "ai" && u && Date.now() - u.at < 3000 && typeof html === "string" && /^うまく読み取れませんでした/.test(html)) {
        V.lastUnk = null;
        const F = fillO();
        if (F && F.cur && F.cur.k === u.k && !F.cur.x && typeof W.skipCurrent === "function") {
          const nm = String(F.cur.n || "").replace(/<[^>]+>/g, "");
          cnt("unkSay");
          W.skipCurrent(E(M(`承知しました。${nm}は「未確認」として控えました（「不明」は値として登録しません）。分かったら、商品情報の画面から数字で入れられます。`,
            `Noted. ${nm} is kept as “not confirmed” (“unknown” is not registered as a value). When you know it, you can enter the figures on the product page.`,
            `已记录。${nm}记为“未确认”（“不明”不作为数值登记）。知道后可在商品信息画面中填写数字。`,
            `Anotado. ${nm} queda como «sin confirmar» («no sé» no se registra como valor). Cuando lo sepa, puede introducir las cifras en la ficha del producto.`)));
          return;
        }
      }
    } catch (e) { err("fs-unk", e); }
    return o.apply(this, arguments);
  });
  // 表の編集（寸法・重量／価格表）：数字の無い行は登録しない
  wrap("tblSave", (o) => function () {
    let kind = "", t = null, pre = 0;
    try {
      kind = (typeof __TBL !== "undefined" && __TBL) ? __TBL.kind : ""; t = ten(); // eslint-disable-line no-undef
      // 保存の中（saveTen）でも外すので、外す行の数は保存の前に数えておく（「保存しました」とだけ言わないため）
      if (t && (kind === "dim" || kind === "price")) {
        try { if (typeof tblSync === "function") tblSync(); } catch (e) { /* 無視 */ } // eslint-disable-line no-undef
        const T = __TBL, cols = (T.cols || []).map((c) => String(c || "").trim()); // eslint-disable-line no-undef
        const rows = (T.rows || []).map((r) => r.map((v) => String(v || "").trim())).filter((r) => r.some((v) => v));
        pre = rows.filter((r) => (kind === "dim" ? !rowHasNum(r, cols) : (isUnk(r.slice(cols.length > 1 ? 1 : 0)) || isUnk(r)))).length;
      }
    } catch (e) { /* 無視 */ }
    // 22.01.1（v1 N11）：「不明」などの行を外すときは、元の「寸法・重量を保存しました」を出さず、知らせを1つにまとめる
    const held = [];
    let oT = null;
    if (pre > 0) { try { oT = W.toast; if (typeof oT === "function") W.toast = function (m) { held.push(arguments); return undefined; }; } catch (e) { oT = null; } }
    let r;
    try { r = o.apply(this, arguments); } finally { if (oT) { try { W.toast = oT; } catch (e) { /* 無視 */ } } }
    try {
      if (t && (kind === "dim" || kind === "price")) {
        const k = kind === "dim" ? "dimRows" : "priceRows";
        const before = (Array.isArray(t[k]) ? t[k].length : 0) + pre;
        if (clean(t, "table") || pre > 0) {
          save(); try { if (typeof syncTenant === "function") syncTenant(); } catch (e) { /* 無視 */ } // eslint-disable-line no-undef
          try { if (typeof render === "function") render(); } catch (e) { /* 無視 */ } // eslint-disable-line no-undef
          const after = Array.isArray(t[k]) ? t[k].length : 0;
          const dropped = Math.max(0, before - after);
          const pre1 = after > 0 ? M(`${kind === "dim" ? "寸法・重量" : "価格表"}を保存しました（${after}行）。`, `Saved (${after} row(s)). `, `已保存（${after}行）。`, `Guardado (${after} fila(s)). `) : "";
          toast(pre1 + (kind === "dim"
            ? M(`寸法・重量は数字で入れてください。「不明」などの行（${dropped}行）は寸法として登録せず、「未確認」として控えました`, `Please enter dimensions/weight as figures. ${dropped} row(s) such as “unknown” were not registered and are kept as “not confirmed”.`, `请用数字填写尺寸・重量。“不明”等${dropped}行未登记为尺寸，已记为“未确认”。`, `Introduzca medidas y peso en cifras. ${dropped} fila(s) como «no sé» no se registraron y quedan «sin confirmar».`)
            : M(`価格は数字で入れてください。「不明」などの行（${dropped}行）は価格として登録せず、「未確認」として控えました`, `Please enter prices as figures. ${dropped} row(s) such as “unknown” were not registered.`, `请用数字填写价格。“不明”等${dropped}行未登记。`, `Introduzca los precios en cifras. ${dropped} fila(s) como «no sé» no se registraron.`)));
          cnt("tblClean");
        } else if (held.length) held.forEach((a) => { try { toast.apply(null, a); } catch (e) { /* 無視 */ } });
      } else if (held.length) held.forEach((a) => { try { toast.apply(null, a); } catch (e) { /* 無視 */ } });
    } catch (e) { err("tblSave", e); }
    return r;
  });
  // 保存の前に掃除（ほかの経路〔資料の取り込み・AI の読み取り・商品情報の画面〕から入った「不明」も）
  wrap("saveTen", (o) => function () { try { const t = ten(); if (t && userT(t)) clean(t, "save"); } catch (e) { err("saveClean", e); } return o.apply(this, arguments); });

  // 充足度（STEP 01・商品情報・取り込みの %）：「不明」「わからない」だけの値は、どの欄でも「入っている」に数えない
  wrap("v92prodFill", (o) => function (t) {
    const tt = t === undefined ? ten() : t;
    try { if (tt) clean(tt, "fill"); } catch (e) { /* 無視 */ }
    const K = o.apply(this, arguments);
    try {
      if (K && tt && Array.isArray(K.okKeys)) {
        const bad = K.okKeys.filter((k) => (TXTK.indexOf(k) >= 0 || NUMK.indexOf(k) >= 0) && isUnk(tt[k]));
        if (bad.length) {
          K.okKeys = K.okKeys.filter((k) => bad.indexOf(k) < 0);
          K.missKeys = (K.missKeys || []).concat(bad);
          K.c = K.okKeys.length;
          K.pct = K.d ? Math.round((K.c / K.d) * 100) : 0;
          try { const req = NEED.filter((x) => x.w >= 5).map((x) => x.k); K.a = Math.max(0, (K.a || 0) - bad.filter((k) => req.indexOf(k) >= 0).length); } catch (e) { /* そのまま */ } // eslint-disable-line no-undef
          K.full = K.c === K.d; K.allDone = K.full && !((K.optMiss || []).length);
          K.v101hunk = bad;
          cnt("fillUnk");
        }
      }
    } catch (e) { err("fill", e); }
    return K;
  });
  // 任意の項目（④ 業種ごとの項目：内容量・材質・対象年齢・入数など）：「不明（資料に記載なし）」も「入っていない」に（土台は「不明」ちょうどだけ）
  wrap("v68pPlace", (o) => function (v) { try { if (isUnk(v)) return true; } catch (e) { /* 下へ */ } return o.apply(this, arguments); });
  // 土台の数え方（v97 の層が無いときの scoreOf）も同じに
  wrap("scoreOf", (o) => function (t) {
    try { if (t) clean(t, "score"); } catch (e) { /* 無視 */ }
    const s = o.apply(this, arguments);
    try {
      if (s && t && Array.isArray(s.filled)) {
        const bad = s.filled.filter((x) => x && (TXTK.indexOf(x.k) >= 0 || NUMK.indexOf(x.k) >= 0) && isUnk(t[x.k]));
        if (bad.length) {
          s.filled = s.filled.filter((x) => bad.indexOf(x) < 0);
          s.missing = (s.missing || []).concat(bad);
          try { if (!s.basis) s.pct = Math.round(s.filled.reduce((a, y) => a + (y.w || 0), 0) / WSUM * 100); else { const K = fn("v92prodFill") ? W.v92prodFill(t) : null; if (K && typeof K.pct === "number") s.pct = K.pct; } } catch (e) { /* そのまま */ } // eslint-disable-line no-undef
        }
      }
    } catch (e) { err("score", e); }
    return s;
  });

  /* ════════════ No.610 ③ 寸法の登録・「まだ分からない」 ════════════ */
  // 入力欄の値から、ヒアリングの答えと同じ形の文を作って、土台の読み取り（applyAnswer → v54upldDims）で登録する
  V.setDims = function (f) {
    const t = ten();
    if (!t) return { ok: false, msg: "no product" };
    const bad = [];
    const g = (k, nm) => { const v = String(f[k] == null ? "" : f[k]).trim(); if (!v) return ""; if (!W.v101num(v)) { bad.push(nm); return ""; } return String(numVal(v)); };
    const ul = g("ul", M("単品の縦", "unit length")), uw = g("uw", M("単品の横", "unit width")), uh = g("uh", M("単品の高さ", "unit height")), ug = g("ug", M("単品の重さ", "unit weight"));
    const cl = g("cl", M("外装の縦", "carton length")), cw = g("cw", M("外装の横", "carton width")), ch = g("ch", M("外装の高さ", "carton height")), cg = g("cg", M("外装の重さ", "carton weight")), cn = g("cn", M("入数", "units per carton"));
    if (bad.length) return { ok: false, bad, msg: M(`「${bad.join("」「")}」は数字で入れてください（分からない欄は空のままで大丈夫です）。`, `Please enter ${bad.join(", ")} as figures (leave unknown boxes empty).`, `请用数字填写「${bad.join("」「")}」（不知道的栏可以留空）。`, `Introduzca ${bad.join(", ")} en cifras (deje vacías las que no sepa).`) };
    const du = f.du === "cm" ? "cm" : "mm", cu = f.cu === "cm" ? "cm" : "mm";
    const ugu = f.ugu === "kg" ? "kg" : "g", cgu = f.cgu === "g" ? "g" : "kg";
    const unitW = (() => { const m = NF(t.moq || "").match(/\d[\d,]*\s*([^\d\s,（(]{1,4})/); const u = m ? m[1].replace(/以上|から|〜|～/g, "") : ""; return /^(個|本|袋|枚|箱|缶|瓶|セット|パック|台|組|着|足|点)$/.test(u) ? u : "個"; })();
    const dimsTxt = (a, b, c, u) => [a, b, c].filter(Boolean).length >= 2 ? [a, b, c].filter(Boolean).join("×") + u : "";
    const U = [dimsTxt(ul, uw, uh, du), ug ? ug + ugu : ""].filter(Boolean).join("・");
    const C = [dimsTxt(cl, cw, ch, cu), cg ? cg + cgu : "", cn ? cn + unitW + "入" : ""].filter(Boolean).join("・");
    const lone = [ul, uw, uh, cl, cw, ch].filter(Boolean).length && !(dimsTxt(ul, uw, uh, du) || dimsTxt(cl, cw, ch, cu));
    if (!U && !C) return { ok: false, msg: lone ? M("寸法は、縦・横・高さのうち2つ以上を入れてください。", "Enter at least two of length, width and height.") : M("数字を1つ以上入れるか、「まだ分からない」を押してください。", "Enter at least one figure, or press “Not known yet”.", "请至少填写一个数字，或点击“还不知道”。", "Introduzca al menos una cifra o pulse «Aún no lo sé».") };
    const txt = [U ? "単品 " + U : "", C ? "外装 " + C : ""].filter(Boolean).join("／");
    let ok = false;
    try { ok = !!W.applyAnswer(t, "dimRows", txt); } catch (e) { err("setDims", e); }
    if (!ok) return { ok: false, msg: M("寸法・重量を読み取れませんでした。数字と単位を確かめてください。", "Could not read the dimensions/weight. Check the figures and units.") };
    delete t.v101dimLater;
    try { if (t.v101hunk) delete t.v101hunk.dimRows; } catch (e) { /* 無視 */ }
    if (cn && !String(t.ctn || "").trim()) { /* 入数は寸法の表に入る（パレットの積み数の欄 ctn は別） */ }
    save();
    try { if (typeof syncTenant === "function") syncTenant(); } catch (e) { err("sync", e); } // eslint-disable-line no-undef
    cnt("setDims"); lg({ k: "setDims", txt });
    const d = W.v101dims(t);
    return { ok: true, txt, dims: d, msg: d.ok ? M("寸法・重量を登録しました（梱包明細・運賃の見積に使います）。", "Dimensions/weight registered (used for the packing list and freight quotes).", "已登记尺寸・重量（用于装箱单和运费报价）。", "Medidas y peso registrados (para la lista de empaque y el flete).")
      : M(`寸法・重量を登録しました。まだ足りないのは ${d.missing.join("・")} です（梱包明細・運賃の見積の前に入れてください）。`, `Registered. Still missing: ${d.missing.join(", ")} (needed before the packing list and freight quotes).`, `已登记。还缺：${d.missing.join("・")}（制作装箱单・运费报价前请填写）。`, `Registrado. Falta: ${d.missing.join(", ")} (antes de la lista de empaque y el flete).`) };
  };
  V.dimLater = function (on) {
    const t = ten();
    if (!t) return false;
    if (on) t.v101dimLater = { at: Date.now() }; else delete t.v101dimLater;
    save();
    try { if (typeof syncTenant === "function") syncTenant(); } catch (e) { err("sync2", e); } // eslint-disable-line no-undef
    cnt(on ? "later" : "laterOff");
    return true;
  };
  // 寸法が要る書類（梱包明細・船積依頼書・運賃の見積・コンテナ計算）か
  const NEEDS_DIM = { PL: 1, SI: 1, "S/I": 1, FREIGHT: 1 };
  V.needsDim = (k) => !!NEEDS_DIM[String(k || "").toUpperCase()];
  V.dimsOk = (t) => { try { return W.v101dims(t || ten()).ok; } catch (e) { return false; } };

  // 足りない項目（v68 の案内）：「まだ分からない」を選んだら、寸法は足りない項目にしない（見積書・請求書は作れる）
  wrap("v68trNeed", (o) => function (t) {
    const m = o.apply(this, arguments);
    try { const tt = t || (fn("v68trTen") ? W.v68trTen() : ten()); if (Array.isArray(m) && tt && tt.v101dimLater) return m.filter((k) => k !== "dim"); } catch (e) { err("need", e); }
    return m;
  });
  // 出荷案件：寸法が「まだ分からない」なら、寸法「未確認」のまま作る（見積書・PI・請求書を先に作れるように）
  wrap("buildShip", (o) => function (d, t) {
    let S = o.apply(this, arguments);
    try {
      if (!S && t && userT(t) && t.v101dimLater && !(Array.isArray(t.dimRows) && t.dimRows.length) && Array.isArray(t.priceRows) && t.priceRows.length && Array.isArray(t.targets) && t.targets[0]) {
        const keep = t.dimRows, keepC = t.dimCols;
        t.dimRows = [["寸法・重量：未確認"]]; t.dimCols = ["寸法・重量"];
        V.inShip = 1;
        try { S = o.apply(this, arguments); } finally { t.dimRows = keep; t.dimCols = keepC; V.inShip = 0; }
        if (S) {
          S.v101noDim = 1;
          S.cargo = "寸法・重量：未確認（梱包明細・S/I・運賃の見積の前に入れてください）";
          if (typeof S.reason === "string") S.reason = S.reason.replace(/いま登録されている寸法（[^）]*）と\s*/, "寸法・重量は未確認のため運賃は試算していません。");
          cnt("shipNoDim");
        }
      }
    } catch (e) { err("ship", e); }
    return S;
  });
  // 運賃の見積（物流会社への AI 見積の依頼）：外装の寸法・重さが無いと出せない。止めて、その場で入れる欄を出す
  wrap("fwdRequest", (o) => async function () {
    try {
      const t = ten(), S = dd() && dd().ship;
      if (t && userT(t) && !W.v101dims(t).ok && !(S && S.poNo)) {
        cnt("fwdStop");
        toast(M("運賃の見積を頼むには、外装（カートン）の寸法・重さ・入数が要ります。下の欄で入れてください", "To request freight quotes, the carton dimensions, weight and units per carton are needed. Please enter them below.", "请求运费报价需要外箱尺寸・重量・入数。请在下方填写。", "Para pedir cotizaciones de flete se necesitan las medidas, el peso y las unidades por caja. Introdúzcalas abajo."));
        if (fn("v101hearDimDialog")) W.v101hearDimDialog("freight");
        return;
      }
    } catch (e) { err("fwd", e); }
    return o.apply(this, arguments);
  });
  // この出荷に要る書類（AI商社マンの判断）：梱包明細・S/I は、寸法が無ければ「要確認」
  wrap("v85docStatus", (o) => function (k) {
    const r = o.apply(this, arguments);
    try {
      const t = ten();
      if (Array.isArray(r) && t && userT(t) && (k === "PL" || k === "SI") && r[0] !== "ok" && !W.v101dims(t).ok) {
        cnt("docChk");
        return [r[0] === "draft" ? "draft" : "none", M("要確認：外装の寸法・重さが未登録", "To confirm: carton size/weight not registered", "待确认：外箱尺寸・重量未登记", "Por confirmar: medidas/peso de la caja sin registrar")];
      }
    } catch (e) { err("docSt", e); }
    return r;
  });

  /* ════════════ No.612 件数は並べた項目の数から ════════════ */
  function needName(k) {
    try { if (fn("v92prodNm")) { const n = W.v92prodNm(k, ten()); if (n) return String(n); } } catch (e) { /* 下へ */ }
    try { const x = (NEED || []).find((y) => y && y.k === k); return x ? String(x.n) : ""; } catch (e) { return ""; } // eslint-disable-line no-undef
  }
  function fixLaterList(html) {
    const m = html.match(/(「あとで」にした<b>)(\d+)(項目<\/b>（)([\s\S]*?)(）を、もう一度だけ伺います)/);
    if (!m) return html;
    const F = fillO();
    const ord = (F && Array.isArray(F.v54hearOrd)) ? F.v54hearOrd : [];
    const inner = m[4];
    // 並べた順のまま、画面に出ている項目名だけを拾う（ほかの層が外した項目は数えない）
    const names = [];
    ord.forEach((k) => { const n = needName(k); if (n && inner.indexOf(n) >= 0 && names.indexOf(n) < 0) names.push(n); });
    if (!names.length) return html;
    const list = names.map((n) => "「" + n + "」").join("");
    cnt("laterList");
    return html.replace(m[0], m[1] + names.length + m[3] + list + m[5]);
  }
  V.fixLaterList = fixLaterList;
  // 書類の画面の「足りないのは 価格表（輸出用の単価）・寸法・重量（外装の寸法・入数・重量） です」も、項目を「」で1つずつ（日本語のとき）
  wrap("v68trNeedTxt", (o) => function () {
    const nd = o.apply(this, arguments);
    try {
      if (nd && Array.isArray(nd.m) && nd.N && lang() === "ja") {
        const have = ["price", "dim", "cty"].filter((k) => nd.m.indexOf(k) < 0).map((k) => "「" + nd.N[k] + "」");
        nd.how = "足りないのは " + nd.m.map((k) => "「" + nd.N[k] + "」").join("") + " です" + (have.length ? "（" + have.join("") + "は登録済み）" : "");
      }
    } catch (e) { err("needTxt", e); }
    return nd;
  });
  function xqCounts() {
    const F = fillO(), t = ten();
    const qs = (F && Array.isArray(F.xq)) ? F.xq : [];
    const asked = qs.length;
    const QA = (t && Array.isArray(t.extraQA)) ? t.extraQA : [];
    const qset = qs.map((x) => String((x && x.q) || "").trim());
    const ans = QA.filter((x) => x && !x.v100 && !x.v101 && qset.indexOf(String(x.q || "").trim()) >= 0).length;
    return { asked, ans };
  }
  V.xqCounts = xqCounts;
  // fillSay の後（ほかの層が文を直した後）に、ログの最後の文を直す
  wrap("fillSay", (o) => function (who, html) {
    const F0 = fillO(); const n0 = F0 && Array.isArray(F0.log) ? F0.log.length : -1;
    const r = o.apply(this, arguments);
    try {
      const F = fillO();
      if (who === "ai" && F && Array.isArray(F.log) && F.log.length > n0 && n0 >= 0) {
        const it = F.log[F.log.length - 1];
        if (it && typeof it.html === "string") {
          let h = it.html;
          if (/「あとで」にした<b>\d+項目<\/b>/.test(h)) h = fixLaterList(h);
          const mm = h.match(/＋AI追加ヒアリング(\d+)件|＋追加の確認 (\d+)件/);
          if (mm) {
            const c = xqCounts();
            if (c.asked > 0) {
              const was = +(mm[1] || mm[2]);
              const rep = mm[1] != null
                ? "＋" + M("AI追加ヒアリング", "AI follow-up") + " " + c.asked + M("問", " questions") + (c.ans !== c.asked ? M(`（回答 ${c.ans}問・あとで ${c.asked - c.ans}問）`, ` (${c.ans} answered, ${c.asked - c.ans} later)`) : "")
                : "＋" + M("追加の確認", "follow-up") + " " + c.asked + M("問", " questions") + (c.ans !== c.asked ? M(`（回答 ${c.ans}問）`, ` (${c.ans} answered)`) : "");
              h = h.replace(mm[0], rep);
              if (was !== c.asked || c.ans !== c.asked) cnt("xqCount");
            }
          }
          // AI の気づきの内訳：最後の文と商品情報の「AIの気づき」で、並び（未解決→「不明」と回答→解決済み）をそろえる
          h = h.replace(/解決済み (\d+)件・「不明」と回答 (\d+)件・未解決 (\d+)件/, (m0, a, b, c) => `未解決 ${c}件・「不明」と回答 ${b}件・解決済み ${a}件`);
          if (h !== it.html) it.html = h;
        }
      }
    } catch (e) { err("fs-count", e); }
    return r;
  });

  /* ════════════ No.613 強み：まとめた強みを分け、重なりを登録しない ════════════ */
  const STRK = (s) => NF(s).toLowerCase().replace(/[\s　、,，。．.・･:：;；!！?？「」『』【】\[\]()（）"'“”‘’\-‐－—～〜/／]/g, "").replace(/(です|でした|ます|である)$/g, "");
  // 1つの強みの中の区切り（括弧の外の 、 ／ 。 改行）で分ける。数字の 1,000 は分けない
  function splitStr(s) {
    const x = String(s == null ? "" : s).replace(/\r/g, "");
    const out = []; let cur = "", d = 0;
    for (let i = 0; i < x.length; i++) {
      const ch = x[i];
      if ("（(［[【「『".includes(ch)) d++;
      else if ("）)］]】」』".includes(ch)) d = Math.max(0, d - 1);
      const isSep = ch === "\n" || (d === 0 && (ch === "、" || ch === "／" || ch === "。" || ch === "；" || ch === ";" || (ch === "," && !/\d/.test(x[i - 1] || "") ) || (ch === "，")));
      if (isSep) { out.push(cur); cur = ""; continue; }
      cur += ch;
    }
    out.push(cur);
    const P = out.map((p) => p.replace(/^[\s・•\-*]+|[\s。．]+$/g, "").trim()).filter((p) => p.length > 1);
    // 「〜を使い、〜で仕上げた」のような1つの文の途中の「、」では分けない（区切りの前が続きの形〔い・し・て・で…〕なら1つの強み）
    // 続きの形：〜て・〜で・〜し・〜り・〜ず・〜つつ・〜ながら、「使い・用い・扱い」などの動詞の形（「少ない」「高い」などの形容詞・「だけ」「仕上げ」などは区切りとみなす）
    const CONT = /(?:て|で|つつ|ながら|し|り|ず|(?:使|用|扱|伴|違|従|向|払|行|言|思|吸|洗|揃|補|生か|活か|含|選|重|込|組)[みいびりし])$/;
    if (P.length >= 2 && /[、,，]/.test(x) && !/[\n／。;；]/.test(x) && P.slice(0, -1).some((p) => CONT.test(p) && !/[）)」』】]$/.test(p))) return [x.trim()];
    return P;
  }
  V.splitStr = splitStr;
  function strDedupe(t) {
    if (!t || !Array.isArray(t.strengths) || !t.strengths.length) return false;
    const before = JSON.stringify(t.strengths);
    const items = [];
    t.strengths.forEach((x) => {
      const txt = String((Array.isArray(x) ? x[0] : x) || "").trim();
      const src = Array.isArray(x) ? String(x[1] || "") : "";
      if (!txt) return;
      const parts = splitStr(txt);
      // 「低振動（…）、長寿命、採用実績」のような1通のまとめ：3つ以下の短い区切りなら、分けて1つずつ数える
      const P = (parts.length >= 2 && parts.length <= 8 && parts.every((p) => p.length <= 60)) ? parts : [txt];
      P.forEach((p) => items.push({ p, src, k: STRK(p), orig: x }));
    });
    const keep = [];
    items.forEach((it) => {
      if (!it.k) return;
      const same = keep.find((y) => y.k === it.k || (y.k.length >= 4 && it.k.indexOf(y.k) >= 0 && it.k.length - y.k.length <= 2) || (it.k.length >= 4 && y.k.indexOf(it.k) >= 0 && y.k.length - it.k.length <= 2));
      if (same) { if (!same.src && it.src) same.src = it.src; return; }
      keep.push(it);
    });
    const out = keep.map((y) => [y.p.slice(0, 160), y.src]);
    if (JSON.stringify(out) === before) return false;
    t.strengths = out;
    cnt("strDedupe"); lg({ k: "str", n0: JSON.parse(before).length, n1: out.length });
    return true;
  }
  V.strDedupe = strDedupe;

  /* ════════════ No.614 材質表：規制の注記を表の行にしない ════════════ */
  const REG_NOTE = /RoHS|REACH|PFAS|SVHC|CPSIA|EN\s*71|ASTM|食品衛生法|規制|適合|対応|非該当|該当|証明|認証|宣誓|試験/i;
  const NOTE_TAIL = /記載(?:が|は)?(?:な|無)|資料に(?:な|無)|未記載|不明|未確認|要確認|わから|分から|確認中|調査中|対象外|なし$|無し$/;
  const ING_LAB = /^(?:原材料名?|原料|材料名?|全成分|成分)$/;
  function isRegNote(r) {
    if (!Array.isArray(r)) return false;
    const cells = r.map((x) => NF(x == null ? "" : x).trim());
    const all = cells.filter(Boolean).join(" ");
    if (!all || !REG_NOTE.test(all)) return false;
    const lab = cells[0] || "";
    const val = cells.slice(1).filter(Boolean).join(" ") || lab;
    if (!NOTE_TAIL.test(val) || val.length > 60) return false;
    // 「RoHS・REACH 対応は資料に記載なし」：規制の言葉で始まる値、または項目名が規制の言葉・原材料名・空のもの（部位の名前の行〔保持器：鋼板〕は残す）
    return new RegExp("^(?:" + REG_NOTE.source + ")", "i").test(val) || REG_NOTE.test(lab) || ING_LAB.test(lab) || !lab || lab === val;
  }
  function compFix(t) {
    if (!t || !Array.isArray(t.compRows) || !t.compRows.length) return false;
    let ch = false;
    const ck = String(t.catKey || (fn("catKeyOf") ? W.catKeyOf(t.cat) : "") || "");
    const food = /food|cosme|liquor|pharma|supple|pet/.test(ck) || /食品|化粧|酒|医薬|サプリ|ペット/.test(String(t.cat || ""));
    const keep = [], notes = [];
    // 材質の後ろに続けて書かれた注記（「鋼板シールド（ZZ）　RoHS・REACH 対応は資料に記載なし」）は、材質と注記に分ける
    const REG_HARD = /RoHS|REACH|PFAS|SVHC|CPSIA|EN\s*71|ASTM|食品衛生法/i;
    // 22.01.1（v2-5）：「滅菌：なし／PFE・BFE・VFE 99%カット」＝項目名の無い区切り（／の後）が前の行の値にくっついた形。
    //   「なし」「あり」のような1語で終わる答えの後ろに別の内容が続くときは、別の行（項目名「その他」）に分ける（消さない）
    const CLOSED = /^(?:なし|無し|ナシ|あり|有り|不要|非該当|該当なし|対象外|未実施|していない|しない|none|no|yes|n\/a)$/i;
    const split1 = [];
    t.compRows.forEach((r) => {
      if (!Array.isArray(r) || r.length < 2 || r[1] == null) { split1.push(r); return; }
      const s = NF(r[1]).trim();
      const m = s.match(/^([^／/]{1,8}?)\s*[／/]\s*(.+)$/);
      if (m && CLOSED.test(m[1].trim()) && !CLOSED.test(m[2].trim()) && !/^[（(]/.test(m[2].trim())) {
        const a = r.slice(); a[1] = m[1].trim();
        split1.push(a);
        const b = r.map(() => ""); b[0] = "その他"; b[1] = m[2].trim();
        split1.push(b);
        ch = true; cnt("compSplit");
        return;
      }
      split1.push(r);
    });
    const rows0 = split1.map((r) => {
      if (!Array.isArray(r)) return r;
      let mod = false;
      const a = r.map((x, j) => {
        if (j === 0 || x == null) return x;
        const s = NF(x);
        const i = s.search(REG_HARD);
        if (i <= 0) return x;
        const note = s.slice(i).trim(), pre = s.slice(0, i).replace(/[\s　、,，／/・;；]+$/, "").trim();
        if (pre && NOTE_TAIL.test(note) && note.length <= 60) { notes.push(note); mod = true; return pre; }
        return x;
      });
      if (mod) ch = true;
      return mod ? a : r;
    });
    rows0.forEach((r) => {
      if (isRegNote(r)) {
        const c = Array.isArray(r) ? r.map((x) => NF(x == null ? "" : x).trim()).filter(Boolean) : [];
        const lab0 = c[0] || "";
        const note = (c.length > 1 && (ING_LAB.test(lab0) || !REG_NOTE.test(lab0))) ? c.slice(1).join(" ") : c.join(" ");
        notes.push(note);
        ch = true;
        return;
      }
      keep.push(r);
    });
    // 工業部品・日用品などの材質表で、部位の欄に「原材料名」と出ている行は、項目名を「材質」に
    if (!food) {
      keep.forEach((r, i) => {
        if (Array.isArray(r) && ING_LAB.test(NF(r[0] || "").trim()) && r.slice(1).some((x) => String(x || "").trim())) { const a = r.slice(); a[0] = "材質"; keep[i] = a; ch = true; }
      });
    }
    if (!ch) return false;
    t.compRows = keep;
    if (notes.length) {
      const old = Array.isArray(t.v101regNote) ? t.v101regNote : [];
      t.v101regNote = old.concat(notes.filter((n) => old.indexOf(n) < 0)).slice(0, 6);
    }
    cnt("compFix"); lg({ k: "comp", notes });
    return true;
  }
  V.compFix = compFix;
  V.isRegNote = isRegNote;
  // 資料の取り込み（AI の読み取り）で入った表も、保存の前に直す
  wrap("saveTen", (o) => function () { try { const t = ten(); if (t && userT(t)) { strDedupe(t); compFix(t); } } catch (e) { err("saveFix", e); } return o.apply(this, arguments); });
  // 画面・資料に渡す D（tenantToD）でも同じに（保存の前に描かれる画面のため）
  wrap("tenantToD", (o) => function (t) {
    try { if (t && userT(t)) { clean(t, "ttd"); strDedupe(t); compFix(t); } } catch (e) { err("ttd-pre", e); }
    const d = o.apply(this, arguments);
    try {
      if (d && t && userT(t)) {
        if (Array.isArray(t.strengths)) d.strengths = t.strengths;
        if (Array.isArray(d.compRows) && d.compRows.some(isRegNote)) d.compRows = d.compRows.filter((r) => !isRegNote(r));
        if (Array.isArray(t.v101regNote) && t.v101regNote.length) d.v101regNote = t.v101regNote.slice();
      }
    } catch (e) { err("ttd", e); }
    return d;
  });

  /* ════════════ No.518 否定の答えのあとに、それを前提にした問いを出さない ════════════ */
  // 否定の話題：本人の答え（ヒアリング・追加ヒアリング・登録の欄）から
  const NEGS = [
    { k: "md", say: /医療機器\s*(?:では|でも|じゃ)\s*(?:な[いくかし]|ありません)|医療機器\s*でな[いく]|非医療機器|医療機器以外|医療機器(?:に|には)?\s*(?:該当|当た|分類され)(?:しない|しません|らない|りません|ない|れない)|not\s+(?:a\s+)?medical\s+device/i,
      // 22.01.1（v2 518 の残り）：「医療用と一般衛生用のどちら」「日本国内での届出状況」も、医療機器かどうかを問う＝「医療機器ではない」の後は聞かない
      q: /クラス\s*(?:分類|[IⅠⅡⅢ1-4]|\(|（)|class\s*(?:[I1-4]|\(|ification)|ISO\s*13485|医療機器(?:の|として)?(?:届出|認証|承認|登録|製造販売|区分|クラス)|一般医療機器|管理医療機器|510\s*\(?k|CE\s*マーク.{0,6}医療|MDR|薬機法.{0,8}(?:届出|承認|認証)|医療用.{0,6}(?:規格|クラス)|JIS\s*T\s*9001|医療用.{0,4}(?:と|か|・|／|or).{0,6}一般(?:衛生)?用|一般(?:衛生)?用.{0,4}(?:と|か|・|／).{0,6}医療用|医療用か(?:どうか)?|(?:日本)?国内(?:で)?の?(?:届出|承認|認証)(?:の)?(?:状況|有無)|医療機器(?:に)?(?:該当|あた|当た)(?:する|る)?か|medical\s+(?:or|vs\.?)\s+(?:general|hygiene)|medical[- ]grade\s+or/i },
    { k: "food", say: /食品(?:に|と)?(?:は)?(?:直接)?(?:触れ|接触し|ふれ)(?:ない|ません|る部材(?:は)?(?:なし|ない|ありません))|食品(?:に|と)?(?:は)?接触(?:なし|無し)|食品接触(?:なし|無し)|非食品接触|no food contact/i,
      q: /食品(?:に|と)?(?:直接)?(?:触れる|接触する)|食品接触|溶出試験|食品衛生法.{0,10}(?:試験|規格|適合)|food[- ]contact/i },
    { k: "batt", say: /電池(?:は)?(?:なし|無し|を?使(?:用し|っ)?て(?:い)?(?:ない|ません)|は?入って(?:い)?(?:ない|ません)|不使用|含ま(?:ない|ず|れ(?:てい)?ない))|バッテリー(?:は)?(?:なし|無し|不使用)|no batter/i,
      q: /電池|バッテリー|リチウム|UN\s*38\.3|battery|lithium/i },
    { k: "steril", say: /滅菌\s*[：:は]?\s*(?:なし|無し|して(?:い)?(?:ない|ません)|不要)|非滅菌|未滅菌|non[- ]?sterile/i,
      q: /滅菌(?:の)?(?:方法|条件|有効期限|バリデーション|証明|試験)|EOG|ガンマ線|sterilization (?:method|validation)/i },
    { k: "pres", say: /防腐剤(?:は)?(?:含ま(?:ない|ず)|不使用|なし|無し|無添加|フリー|使(?:用し|っ)?て(?:い)?(?:ない|ません))|パラベンフリー|preservative[- ]free|no preservatives?/i,
      q: /防腐剤(?:の)?(?:種類|名前|配合|量|濃度)|どの防腐剤|パラベン(?:の)?(?:種類|量)|preservative (?:type|system|level)/i },
    { k: "warr", say: /保証\s*[：:は]?\s*(?:なし|無し|ありません|しない|対象外)|保証なし|no warranty/i,
      q: /保証(?:の)?(?:期間|年数|範囲|条件)|何年(?:の)?保証|warranty (?:period|term)/i },
    { k: "allg", say: /アレルゲン\s*[：:は]?\s*(?:なし|無し|ありません|含ま(?:ない|ず))|アレルギー物質(?:は)?(?:なし|無し|含まない)|allergen[- ]free|no allergens?/i,
      q: /アレルゲン(?:の)?(?:表示|種類|一覧|名前)|どのアレルゲン|allergen (?:label|list|declaration)/i },
  ];
  V.NEGS = NEGS;
  function negSaid(t) {
    const out = {};
    try {
      if (!t) return out;
      // 医療機器：21.98 の 1か所の判定（V98REG.md）を正とする
      try { if (typeof V98REG !== "undefined" && V98REG && typeof V98REG.md === "function") { const md = V98REG.md(t); if (md && md.v === "no" && md.why !== "pharma" && !/医薬品/.test(String(t.cat || ""))) out.md = "V98REG"; } } catch (e) { /* 下へ */ } // eslint-disable-line no-undef
      if (t.v98md && t.v98md.v === "no") out.md = out.md || "hear";
      // 22.01.1：📎の資料に本人（会社）が書いた否定（「医療機器ではありません」など）も、本人の答えと同じに扱う
      try { if (t.v101docNeg && typeof t.v101docNeg === "object") Object.keys(t.v101docNeg).forEach((k) => { if (!out[k]) out[k] = "doc"; }); } catch (e) { /* 無視 */ }
      const txts = [];
      ["compRows", "dimRows"].forEach((k) => { (Array.isArray(t[k]) ? t[k] : []).forEach((r) => { if (Array.isArray(r)) txts.push(r.join(" ")); }); });
      ["shelf", "cert", "store", "catRaw"].forEach((k) => { if (typeof t[k] === "string") txts.push(t[k]); });
      (Array.isArray(t.extraQA) ? t.extraQA : []).forEach((x) => { if (x && x.a) txts.push(String(x.a)); });
      try { const A = t.v68attrs || {}; Object.keys(A).forEach((k) => { if (typeof A[k] === "string") txts.push(A[k]); }); } catch (e) { /* 無視 */ }
      try { const F = fillO(); (F && Array.isArray(F.log) ? F.log : []).forEach((x) => { if (x && x.who === "u") txts.push(String(x.html || "").replace(/<[^>]+>/g, "")); }); } catch (e) { /* 無視 */ }
      const all = NF(txts.join("\n"));
      NEGS.forEach((n) => { if (!out[n.k] && n.say.test(all)) out[n.k] = "said"; });
      if ((out.md === "said" || out.md === "doc") && t.v98md && t.v98md.v === "yes") delete out.md;
    } catch (e) { err("negSaid", e); }
    return out;
  }
  V.negSaid = negSaid;
  // 問いが否定した事柄を前提にしているか（問い自体が否定を確かめる形〔「〜は入っていますか」〕も、答えがもう出ているので出さない）
  function premiseOf(q, said) {
    const s = NF(q);
    for (const n of NEGS) {
      if (!said[n.k]) continue;
      if (n.q.test(s)) return n.k;
    }
    return "";
  }
  V.premiseOf = premiseOf;
  const NEG_NM = { md: ["医療機器ではない", "not a medical device"], food: ["食品に触れない", "no food contact"], batt: ["電池なし", "no battery"], steril: ["滅菌なし", "non-sterile"], pres: ["防腐剤なし", "no preservatives"], warr: ["保証なし", "no warranty"], allg: ["アレルゲンなし", "no allergens"] };
  // AI の追加ヒアリングの問い・気づき
  wrap("llmGapAnalyze", (o) => async function () {
    const res = await o.apply(this, arguments);
    try {
      const t = ten();
      const said = negSaid(t);
      if (res && Object.keys(said).length) {
        const drop = [];
        res.questions = (res.questions || []).filter((x) => { const k = premiseOf(x && x.q, said); if (k) drop.push({ q: String(x.q).slice(0, 80), k }); return !k; });
        res.insights = (res.insights || []).filter((x) => { const k = premiseOf(x, said); if (k) drop.push({ q: String(x).slice(0, 80), k, note: 1 }); return !k; });
        if (drop.length) { cnt("gapDrop", drop.length); lg({ k: "gapDrop", drop }); if (t) t.v101gapDrop = drop.slice(0, 8); }
      }
    } catch (e) { err("gap", e); }
    return res;
  });
  // 追加ヒアリングの途中で否定の答えが出たら、残りの問いからも外す
  wrap("llmExtraNext", (o) => function () {
    try {
      const F = fillO(), t = ten();
      if (F && Array.isArray(F.xq) && F.xq.length && t) {
        const said = negSaid(t);
        if (Object.keys(said).length) {
          const i0 = F.xi || 0;
          const drop = [];
          const rest = F.xq.slice(i0).filter((x) => { const k = premiseOf(x && x.q, said); if (k) drop.push(k); return !k; });
          if (drop.length) {
            cnt("xqDrop", drop.length);
            F.xq = F.xq.slice(0, i0).concat(rest);
            const why = [...new Set(drop)].map((k) => "「" + M(NEG_NM[k][0], NEG_NM[k][1]) + "」").join("");
            try { W.fillSay("ai", E(M(`前の答え${why}と合わない問い（${drop.length}問）は、聞かずに外しました。`, `${drop.length} question(s) that conflict with your earlier answer ${why} were removed.`, `与之前的回答${why}不符的问题（${drop.length}个）已略过。`, `Se quitaron ${drop.length} pregunta(s) que no encajan con su respuesta anterior ${why}.`))); } catch (e) { /* 無視 */ }
          }
        }
      }
    } catch (e) { err("xnext", e); }
    return o.apply(this, arguments);
  });
  // 任意項目（④ 業種ごとの項目）：医療機器ではない商品から「医療機器のクラス分類」「届出・認証・登録の番号」を外す（ほかの層の判定に頼らず、答えからも）
  wrap("v68pGroups", (o) => function (t) {
    const g = o.apply(this, arguments);
    try {
      if (Array.isArray(g) && t && g.indexOf("v92med") >= 0) {
        const said = negSaid(t);
        if (said.md && typeof V68P_G !== "undefined" && V68P_G) { // eslint-disable-line no-undef
          if (!V68P_G.v100hyg && V68P_G.v92med) V68P_G.v100hyg = { ja: "衛生用品の項目", f: V68P_G.v92med.f.filter((f) => f && f.k !== "mdClass" && f.k !== "mdReg").map((f) => Object.assign({}, f, { g: "v100hyg" })) }; // eslint-disable-line no-undef
          const i = g.indexOf("v92med"); g.splice(i, 1, "v100hyg"); cnt("hyg");
        }
      }
    } catch (e) { err("groups", e); }
    return g;
  });
  // ヒアリングの問いの文（医療・衛生用品）：医療機器かどうかが決まる前は、医療機器を前提にしない言い方に。
  // 「医療機器ではない」と答えたあとは、クラス分類・ISO 13485・届出の番号を聞かない
  const MD_Q = /クラス分類|ISO\s*13485|医療機器の認証|届出番号|一般医療機器/;
  wrap("v68hearNeed", (o) => function (nx, p) {
    const r = o.apply(this, arguments);
    try {
      const x = r || nx;
      const k = String((x && x.k) || "");
      if (!x || !/^(compRows|cert|shelf|strengths)$/.test(k) || !(MD_Q.test(String(x.q || "") + String(x.ex || "")) || (k === "shelf" && /滅菌/.test(String(x.q || "") + String(x.ex || ""))))) return r;
      const t = p || ten();
      const said = negSaid(t);
      const no = !!said.md;
      const y = Object.assign({}, x);
      if (k === "compRows") {
        y.q = no ? M("構成品と材質、滅菌の有無を教えてください。<b>医療機器ではないと伺っているので、医療機器のクラス分類は要りません。</b>", "Please tell us the components, materials and whether it is sterilized. <b>As it is not a medical device, no device class is needed.</b>")
          : M("構成品と材質、滅菌の有無を教えてください。<b>医療機器にあたるかどうか</b>（あたる場合はクラス分類も）をお書きください。相手国での登録・届出の要否は、ここで決まります。", "Please tell us the components, materials, whether it is sterilized, and <b>whether it is a medical device</b> (and its class if so).");
        y.ex = no ? M("例：本体：ポリプロピレン不織布／耳ひも：ポリウレタン／滅菌：なし", "e.g. Body: PP non-woven / Ear loops: polyurethane / Sterilized: no")
          : M("例：本体：ポリプロピレン不織布／耳ひも：ポリウレタン／滅菌：なし／医療機器ではない（医療機器なら：一般医療機器 クラスI）", "e.g. Body: PP non-woven / Sterilized: no / Not a medical device (if it is: class I)");
      } else if (k === "cert") {
        y.ex = no ? M("例：ISO 9001／試験機関の試験成績書（性能の表示の根拠）", "e.g. ISO 9001 / test reports from a testing body") : M("例：ISO 9001／試験機関の試験成績書／医療機器にあたる場合は届出・認証の番号", "e.g. ISO 9001 / test reports / notification number if it is a medical device");
      } else if (k === "shelf") {
        if (!(no || said.steril)) return r;
        y.n = M("使用期限・保証期間", "Expiry / warranty");
        y.q = M("使用期限（衛生用品）または保証期間を教えてください。無ければ「なし」で大丈夫です。", "Please tell us the expiry (hygiene products) or warranty. “None” is fine.");
        y.ex = M("例：製造から3年／保証なし", "e.g. 3 years from manufacture / no warranty");
      } else if (k === "strengths") {
        // 強みの例：医療機器かどうかが決まる前・医療機器ではないときは、ISO 13485・滅菌済み を例にしない
        y.ex = M("例：試験機関で確かめた性能（数字）／日本の工場で一貫生産／個包装", "e.g. performance verified by a testing body (figures) / made in our own factory in Japan / individually wrapped");
      }
      cnt("mdQ");
      return y;
    } catch (e) { err("hearNeed", e); return r; }
  });
  // 追加ヒアリングの途中で否定の問いを外したときは、外したことを言う（「あと3問」と言って2問で終わらないように）
  V.NEG_NM = NEG_NM;

  /* ════════════ その他（out の担当の申し送り）：味噌などの醸造食品が「酒類」になる ════════════
     A 有機味噌を📎の資料（区分の行なし・「木桶で天然醸造」「みそ醸造株式会社」）でヒアリングすると、資料の読み取り（土台の detectCat）が
     「醸造」を数えて酒類（catKey liquor）にし、区分は埋まったとみなされて聞かれない → 営業資料の札「Alcoholic beverages」・酒類の輸入免許。
     直し：①detectCat：味噌・醤油・酢・甘酒・酒粕・料理酒・みりん（調味料）・麹など醸造食品の言葉があり、酒そのものの言葉（日本酒・清酒・焼酎・ワイン・本みりん・アルコール分…）が無ければ食品
           ②本人が区分を答えたら（ヒアリング・選び直し）それを正とし、資料の読み取り・AI の推定（mergeTen）で上書きしない
           ③資料の読み取りで酒類になっても、品名が醸造食品で酒の言葉が無ければ食品に（今までに登録した商品も、本人が答えていなければ同じ） */
  const FERM = /味噌|みそ|ミソ|醤油|しょうゆ|しょう油|酢|ビネガー|甘酒|あまざけ|酒粕|酒かす|料理酒|みりん|味醂|麹|こうじ|糀|漬物|漬け|納豆|発酵調味料|調味料|たれ|タレ|ソース|ドレッシング|miso|soy\s*sauce|vinegar|amazake|sake\s*lees|mirin|koji/i;
  const HARDLIQ = /日本酒|清酒|純米酒|純米吟醸|純米大吟醸|吟醸酒|大吟醸|焼酎|泡盛|ウイスキー|ウィスキー|ワイン|ビール|発泡酒|リキュール|梅酒|ブランデー|ウォッカ|本みりん|本味醂|アルコール分|アルコール度数|度数\s*\d|酒税|whisk(?:e)?y|\bwine\b|\bbeer\b|liquor|spirits|shochu|\bsake\b(?!\s*lees)/i;
  const fermFood = (s) => { const x = NF(s); return FERM.test(x) && !HARDLIQ.test(x); };
  V.fermFood = fermFood;
  /* 22.01.1（v2-1・高）犬用おやつが「食品（人の食品）」になる：📎の仕様書（原材料・賞味期限）を土台の detectCat が「食品」と数え、
     区分の問い（AI の判定「ペット用品」）が答えられる前に区分が埋まった。→ 犬用・猫用・ペット・dog・cat・pet・treat などはペット用品に。 */
  const PET_STRONG = /犬用|猫用|ペット用|ペットフード|ペット用品|ドッグフード|キャットフード|愛犬|愛猫|犬のおやつ|猫のおやつ|犬・猫用|犬猫用|小型犬|子犬用|子猫用|for\s+(?:dogs?|cats?|pets?)\b|\b(?:dog|cat|pet|puppy|kitten)s?\s*(?:food|treats?|snacks?|chews?|jerky|biscuits?|supplies)\b/i;
  const PET_NAME = /ペット|犬用|猫用|愛犬|愛猫|ドッグフード|キャットフード|ドッグ(?:おやつ|ジャーキー|ガム|トリーツ|フード)|キャット(?:フード|おやつ|タワー)|\b(?:dogs?|cats?|pets?|puppy|puppies|kittens?|canine|feline)\b/i;
  const petName = (s) => { const x = NF(s); if (PET_NAME.test(x)) return true; return /\btreats?\b/i.test(x) && !/(?:heat|surface|thermal|water|chemical|anti)[\s-]*treat/i.test(x); };
  V.petName = petName;
  const PET_CAT = "ペット用品";
  const ckOfCat = (c) => { try { return fn("catKeyOf") ? String(W.catKeyOf(c) || "") : "other"; } catch (e) { return "other"; } };
  wrap("detectCat", (o) => function (all) {
    const r = o.apply(this, arguments);
    try { if (r === "liquor" && fermFood(all)) { cnt("catFerm"); return "food"; } } catch (e) { err("detectCat", e); }
    // 資料の文に「犬用」「ペットフード」「dog treats」などがあれば、人の食品・日用品ではなくペット用品（読み取りの結果に区分の名前を付けるのは下の buildTenant／tenantFromTextGrids の包み）
    try { if (PET_STRONG.test(NF(all))) { cnt("catPet"); return "pet"; } } catch (e) { err("detectPet", e); }
    return r;
  });
  wrap("applyAnswer", (o) => function (t, k) {
    const r = o.apply(this, arguments);
    try { if (r && t && k === "cat" && String(t.cat || "").trim()) t.v101catBy = { by: "hear", cat: String(t.cat), key: String(t.catKey || ""), at: Date.now() }; } catch (e) { err("catBy", e); }
    return r;
  });
  wrap("mergeTen", (o) => function (t, x) {
    const by = t && t.v101catBy && t.v101catBy.cat ? t.v101catBy : null;
    const c0 = t ? { cat: t.cat, catKey: t.catKey, catRaw: t.catRaw } : null;
    const r = o.apply(this, arguments);
    try {
      if (t && c0) {
        if (by && (t.cat !== c0.cat || t.catKey !== c0.catKey)) {
          // 本人の答えを正とする（資料・AI の推定で上書きしない）
          t.cat = c0.cat; t.catKey = c0.catKey; if (c0.catRaw === undefined) delete t.catRaw; else t.catRaw = c0.catRaw;
          cnt("catKeep");
        } else if (!by && t.catKey === "liquor" && c0.catKey !== "liquor" && fermFood(String(t.item || "") + " " + String(t.itemEn || "")) && !HARDLIQ.test(String(t.catRaw || ""))) {
          t.cat = "食品"; t.catKey = "food"; delete t.catRaw;
          t.v101catFix = { from: "酒類", why: "品名が醸造食品（味噌・醤油など）で、酒の言葉が無い", at: Date.now() };
          cnt("catFix");
        } else if (!by && t.cat && t.cat !== c0.cat && t.cat !== PET_CAT && (petName(String(t.item || "") + " " + String(t.itemEn || "")) || (x && x.catKey === "pet"))) {
          // 22.01.1（v2-1）：品名が犬用・猫用など（ヒアリングの AI の判定もペット用品）なのに、資料・AI の読み取りが「食品」などにした → ペット用品
          const from = String(t.cat);
          t.cat = PET_CAT; t.catKey = ckOfCat(PET_CAT);
          t.v101catFix = { from, why: "品名が犬用・猫用などのペット用（人の食品ではない）", at: Date.now() };
          cnt("catPetFix");
        }
      }
    } catch (e) { err("mergeCat", e); }
    return r;
  });
  // 今までに登録した商品：本人が区分を答えていない（資料の読み取りで決まった）酒類で、品名が醸造食品なら食品に
  function catSweep(t) {
    try {
      // 22.01.1（v2-1）：今までに資料の読み取りで「食品」になった犬用おやつ（本人が区分を答えていない）→ ペット用品
      if (t && userT(t) && !(t.v101catBy && t.v101catBy.cat) && !t.v101petFixed && t.cat !== PET_CAT && (t.catKey === "food" || /^食品/.test(String(t.cat || ""))) && petName(String(t.item || "") + " " + String(t.itemEn || ""))) {
        const from = String(t.cat || "");
        t.cat = PET_CAT; t.catKey = ckOfCat(PET_CAT); delete t.catRaw; t.v101petFixed = 1;
        t.v101catFix = { from, why: "品名が犬用・猫用などのペット用（人の食品ではない）", at: Date.now() };
        cnt("catPetSweep");
        return true;
      }
      if (!t || !userT(t) || t.catKey !== "liquor" || (t.v101catBy && t.v101catBy.cat) || t.v101catFixed) return false;
      if (!fermFood(String(t.item || "") + " " + String(t.itemEn || ""))) return false;
      if (/酒/.test(String(t.catRaw || "")) && HARDLIQ.test(String(t.catRaw || ""))) return false;
      t.cat = "食品"; t.catKey = "food"; delete t.catRaw; t.v101catFixed = 1;
      t.v101catFix = { from: "酒類", why: "品名が醸造食品（味噌・醤油など）で、酒の言葉が無い", at: Date.now() };
      cnt("catSweep");
      return true;
    } catch (e) { err("catSweep", e); return false; }
  }
  V.catSweep = catSweep;
  wrap("tenantToD", (o) => function (t) { try { catSweep(t); } catch (e) { /* 無視 */ } return o.apply(this, arguments); });

  /* ══════════════════════════════════════════════════════════════════════════════════════════════
     22.01.1（2026-11-22 公開後の検証 v1・v2・v3 の直し）
     ① v2-1  資料の読み取りの結果に、ペット用品の区分の名前を付ける（detectCat が "pet" を返したとき）
     ② v1 N3 資料・答えの「項目：値」（内径・外径・幅・シールなど）が読み取りで落ちたら、材質・仕様の表に残す
     ③ v2 518 の残り  📎の資料に書かれた否定（「医療機器ではありません」など）を、本人の答えと同じに扱う（AI の前提の問いを外す）
     ④ v1 N8・612 の残り  取り込みの知らせの項目を「」で1つずつ（数と並びをそろえる）
     ⑤ v2-9  「AIはこう理解しました」の寸法の文を、v101dims（外装の寸法・重さ・入数）で言う
     ⑥ v2-8  任意の項目：③の表・本人の答えに入っている項目（滅菌の有無・医療用／一般用の別・対象年齢）を未登録と数えない
     ⑦ v3 S4  寸法・重量を「不明（資料に記載なし）」と答えたら、最後にもう一度は聞かない
     ⑧ v1 N9  トライアルで「STANDAGEの担当が確認します」と言わない（担当への依頼は出ていない）
     ══════════════════════════════════════════════════════════════════════════════════════════════ */
  const trial = () => { try { return !!(typeof SES !== "undefined" && SES && SES.t === "trial"); } catch (e) { return false; } }; // eslint-disable-line no-undef
  V.trial = trial;
  const fileLines = (grids) => (Array.isArray(grids) ? grids : []).map((g) => (Array.isArray(g) ? g : []).map((r) => (Array.isArray(r) ? r : [r]).map((x) => String(x == null ? "" : x).trim()).filter(Boolean).join("：")).join("\n")).join("\n");
  function decorate(t2, txt, nm) {
    try {
      if (!t2 || typeof t2 !== "object") return;
      Object.defineProperty(t2, "__v101txt", { value: String(txt || "").slice(0, 40000), enumerable: false, configurable: true, writable: true });
      Object.defineProperty(t2, "__v101file", { value: String(nm || t2.file || ""), enumerable: false, configurable: true, writable: true });
      // 区分のキーは、ヒアリング・選び直しで「ペット用品」を選んだときと同じ（catKeyOf）にそろえる
      if (t2.catKey === "pet" && !String(t2.cat || "").trim()) { t2.cat = PET_CAT; t2.catKey = ckOfCat(PET_CAT); cnt("t2pet"); }
    } catch (e) { err("decorate", e); }
  }
  wrap("tenantFromTextGrids", (o) => function (text, grids, filename) {
    const t2 = o.apply(this, arguments);
    try { if (t2 && typeof t2 === "object" && typeof t2.then !== "function") decorate(t2, String(text || "") + "\n" + fileLines(grids), filename); } catch (e) { err("tg", e); }
    return t2;
  });
  wrap("buildTenant", (o) => async function (file) {
    const t2 = await o.apply(this, arguments);
    try {
      if (t2 && file) {
        const nm = String(file.name || "");
        let txt = "";
        if (/\.(txt|csv)$/i.test(nm)) txt = typeof zipTextDec === "function" ? zipTextDec(new Uint8Array(await file.arrayBuffer())) : await file.text(); // eslint-disable-line no-undef
        else if (/\.(xlsx|xlsm)$/i.test(nm) && typeof readWorkbook === "function") { const sh = await readWorkbook(file); txt = fileLines((sh || []).map((s) => s && s.grid)); } // eslint-disable-line no-undef
        decorate(t2, txt, nm);
      }
    } catch (e) { err("bt", e); }
    return t2;
  });

  /* ② 資料・答えの「項目：値」で、どこにも登録されなかったもの（仕様の言葉だけ。原材料・品名などは別の欄があるので対象外） */
  const KEEP_LAB = /^(?:内径|外径|幅|厚さ|厚み|高さ|長さ|奥行き?|直径|呼び径|ピッチ|外形寸法|本体寸法|寸法|サイズ|シール(?:形式)?|シールド|保持器|潤滑(?:剤)?|グリース|硬度|硬さ|公差|精度(?:等級)?|等級|表面処理|めっき|メッキ|塗装|材質|素材|構成|定格(?:電圧|電流|出力|荷重)?|電圧|消費電力|回転数|許容回転数|荷重|基本定格荷重|色|カラー|対象年齢|耐熱温度|使用温度(?:範囲)?|適合(?:車種|機種)|摩擦材|裏板|本体|耳ひも|ノーズワイヤー|容器|トリガー|キャップ|塗料|仕上げ)$/;
  function pairsOf(raw) {
    const out = [];
    // 値は資料・答えに書いてあるとおり（全角の括弧などを変えない）。項目名だけ NFKC で比べる
    String(raw == null ? "" : raw).replace(/\r/g, "").split(/\n/).forEach((line) => {
      line.split(/[／]/).forEach((seg) => {
        const m = seg.match(/^\s*[・•\-*]?\s*([^：:\s][^：:]{0,13}?)\s*[：:]\s*(.+?)\s*$/);
        if (!m) return;
        const lab = NF(m[1]).trim(), val = m[2].trim();
        if (!lab || !val || isUnk(val) || val.length > 80) return;
        out.push({ lab, val });
      });
    });
    return out;
  }
  function hayOf(t) {
    const a = [];
    ["compRows", "dimRows", "priceRows"].forEach((k) => (Array.isArray(t[k]) ? t[k] : []).forEach((r) => a.push(Array.isArray(r) ? r.join(" ") : String(r))));
    (Array.isArray(t.strengths) ? t.strengths : []).forEach((s) => a.push(Array.isArray(s) ? s.join(" ") : String(s)));
    ["item", "itemEn", "sku", "cert", "shelf", "store", "origin", "catRaw", "dimNote", "ctn", "moq"].forEach((k) => { if (typeof t[k] === "string") a.push(t[k]); });
    try { const A = t.v68attrs || {}; Object.keys(A).forEach((k) => { if (typeof A[k] === "string") a.push(A[k]); }); } catch (e) { /* 無視 */ }
    return NF(a.join(" ")).replace(/\s+/g, "");
  }
  function keepPairs(t, raw, by, file) {
    const kept = [];
    try {
      if (!t || !raw) return kept;
      // 資料の読み取りでは、材質・仕様の表がもう登録されているとき（読み取りが一部を落とした形）だけ足す。
      // 表がまだ空なら足さない（ヒアリングで「材質・仕様の表」を聞くので、本人の答えを先にする＝勝手に表を埋めて問いを飛ばさない）
      if (by === "doc" && !(Array.isArray(t.compRows) && t.compRows.some((r) => Array.isArray(r) && r.some((x) => String(x == null ? "" : x).trim())))) return kept;
      const P = pairsOf(raw).filter((x) => KEEP_LAB.test(x.lab));
      if (!P.length) return kept;
      const hay = hayOf(t);
      const labs = (Array.isArray(t.compRows) ? t.compRows : []).filter((r) => Array.isArray(r) && String(r[1] == null ? "" : r[1]).trim()).map((r) => NF(r[0] || "").trim());
      P.forEach((x) => {
        const nv = NF(x.val).replace(/\s+/g, "");
        if (hay.indexOf(nv) >= 0) return;
        if (labs.indexOf(x.lab) >= 0) return; // 同じ項目名の行がある（値の書き方が違うだけ）
        if (kept.some((y) => y.lab === x.lab)) return;
        kept.push(x);
      });
      if (!kept.length) return kept;
      if (!Array.isArray(t.compRows)) t.compRows = [];
      if (!Array.isArray(t.compCols) || t.compCols.length < 2) t.compCols = ["項目", "内容", "備考"];
      if (!String(t.compTitle || "").trim()) t.compTitle = String(t.catKey || "") === "parts" ? "材質・素材表" : "成分表・材質表";
      const w = Math.max(2, t.compCols.length);
      kept.forEach((x) => { const r = new Array(w).fill(""); r[0] = x.lab; r[1] = x.val; t.compRows.push(r); });
      const old = Array.isArray(t.v101keep) ? t.v101keep : [];
      t.v101keep = old.concat(kept.map((x) => ({ lab: x.lab, val: x.val, by: by || "", file: file || "", at: Date.now() }))).slice(-16);
      cnt("keep", kept.length); lg({ k: "keep", by, kept });
    } catch (e) { err("keep", e); }
    return kept;
  }
  V.keepPairs = keepPairs; V.pairsOf = pairsOf;
  /* ③ 資料に書かれた否定 */
  function docNeg(t, raw, file) {
    try {
      if (!t || !raw) return;
      const s = NF(raw);
      NEGS.forEach((n) => {
        const m = String(raw).match(n.say) || s.match(n.say); // 知らせには資料に書いてあるとおりの文字を出す
        if (!m) return;
        if (!t.v101docNeg || typeof t.v101docNeg !== "object") t.v101docNeg = {};
        if (!t.v101docNeg[n.k]) {
          t.v101docNeg[n.k] = { file: String(file || ""), txt: m[0].slice(0, 40), at: Date.now() }; cnt("docNeg:" + n.k);
          // 次の取り込みの知らせで伝える（同じ資料で2つ以上見つかっても、全部伝える）
          (V.docNegQ = V.docNegQ || []).push({ k: n.k, file: String(file || ""), txt: m[0].slice(0, 40), at: Date.now() });
        }
        // 医療機器かどうかの1か所の判定（21.98 の TEN.v98md）にも「資料の記載」として控える（追加ヒアリングで聞かなくなるので、規制・書類の判定が「未確認」に戻らないように）。
        // 本人がボタン・答えで決めた値（btn・hear）は上書きしない
        if (n.k === "md" && !(t.v98md && (t.v98md.v === "no" || t.v98md.v === "yes"))) {
          t.v98md = { v: "no", from: "doc", k: "", txt: m[0].slice(0, 40), file: String(file || ""), at: Date.now() };
          cnt("docMd");
        }
      });
    } catch (e) { err("docNeg", e); }
  }
  V.docNeg = docNeg;
  V.chNames = new Set(["会社名", "英文社名", "商品名", "英文商品名", "品番", "HSコード", "HSコード（4桁・要確定）", "産地", "認証", "賞味期限", "取引条件", "支払条件", "仕出港", "リードタイム", "MOQ", "入数", "商材カテゴリ", "希望小売価格", "保存方法", "進出希望国", "商品の強み", "価格表", "寸法・重量", "成分・材質表"]);
  wrap("mergeTen", (o) => function (t, x) {
    const r = o.apply(this, arguments);
    try {
      if (t && x && typeof x === "object" && t === ten()) {
        const raw = String(x.__v101txt || "");
        if (raw) {
          docNeg(t, raw, x.__v101file || x.file || "");
          const kept = keepPairs(t, raw, "doc", x.__v101file || x.file || "");
          if (kept.length) { V.lastKeep = { at: Date.now(), kept, file: x.__v101file || x.file || "" }; try { compFix(t); } catch (e) { /* 無視 */ } }
        }
        if (Array.isArray(r)) r.forEach((n) => { if (n) V.chNames.add(String(n)); });
      }
    } catch (e) { err("merge1011", e); }
    return r;
  });
  // ヒアリングで打った材質表の答え（「材質：…／内径：20mm／外径：47mm／幅：14mm」）も、仕様の項目が落ちたら残す（21.99.1 の AI の振り分けの直しと同じ考え）
  wrap("applyAnswer", (o) => function (t, k, raw) {
    const r = o.apply(this, arguments);
    try { if (r && t && k === "compRows" && raw) { const kept = keepPairs(t, String(raw), "hear", ""); if (kept.length) { V.lastKeepHear = { at: Date.now(), kept }; compFix(t); } } } catch (e) { err("aa-keep", e); }
    return r;
  });

  /* ④ 取り込みの知らせ：項目名の「・」と区切りの「・」が同じで、数より多く見える → 項目を「」で1つずつ */
  function splitNames(list, n) {
    const tk = String(list).split("・");
    const known = V.chNames;
    const out = [];
    for (let i = 0; i < tk.length;) {
      let hit = -1;
      for (let j = Math.min(tk.length, i + 4); j > i; j--) { const c = tk.slice(i, j).join("・").trim(); if (known.has(c)) { out.push(c); hit = j; break; } }
      if (hit < 0) { out.push(tk[i].trim()); i++; } else i = hit;
    }
    return out.filter(Boolean).length === n ? out.filter(Boolean) : null;
  }
  V.splitNames = splitNames;
  function fixImport(h) {
    const m = h.match(/(から\s*<b>)(\d+)(項目<\/b>\s*を取り込みました：)([^<]*?)(\s*<br>|$)/);
    if (!m || /「/.test(m[4])) return h;
    const n = +m[2];
    const names = splitNames(m[4].trim(), n);
    if (!names) return h;
    let add = "";
    try {
      const t = ten();
      if (t && names.indexOf("寸法・重量") >= 0) {
        const d = W.v101dims(t);
        if (!d.ok) add += M("<br>※「寸法・重量」は単品の分だけです（外装〔カートン〕の寸法・重さ・入数はまだ）。運賃の見積・梱包明細の前に入れてください。", "<br>* “Dimensions/weight” covers the single unit only (carton size, weight and units per carton are not yet registered).");
      }
      const GQ = (V.docNegQ || []).filter((g) => !g.said && Date.now() - g.at < 120000);
      GQ.forEach((G) => {
        G.said = 1;
        const nm = NEG_NM[G.k] ? M(NEG_NM[G.k][0], NEG_NM[G.k][1]) : G.k;
        add += M(`<br>資料${G.file ? "（" + E(G.file) + "）" : ""}に「${E(G.txt)}」とあるので、「${E(nm)}」と控えました（それを前提にした問いは聞きません。違うときは「規制を調べる」で直せます）。`, `<br>The file${G.file ? " (" + E(G.file) + ")" : ""} says “${E(G.txt)}”, so we noted “${E(nm)}” (we won't ask questions that assume otherwise; you can change it in Check regulations).`);
      });
      if (V.docNegQ && V.docNegQ.length > 20) V.docNegQ = V.docNegQ.filter((g) => !g.said);
      const K = V.lastKeep;
      if (K && Date.now() - K.at < 15000 && K.kept.length) add +=M(`<br>資料の${K.kept.map((x) => "「" + E(x.lab) + "：" + E(x.val) + "」").join("")}は、読み取りで落ちないように材質・仕様の表に入れました。`, `<br>${K.kept.map((x) => "“" + E(x.lab) + ": " + E(x.val) + "”").join(" ")} from the file were added to the materials/specifications table so they are not lost.`);
    } catch (e) { /* 無視 */ }
    cnt("importList");
    return h.replace(m[0], m[1] + m[2] + m[3] + names.map((x) => "「" + x + "」").join("") + add + m[5]);
  }
  V.fixImport = fixImport;

  /* ⑦ 寸法・重量を「不明（資料に記載なし）」と答えたら、最後にもう一度は聞かない */
  const NOREASK = /記載(?:が|は)?(?:な|無)|資料に(?:な|無)|載って(?:い)?(?:ない|ません)|未記載/;
  wrap("fillAnswer", (o) => function (v) {
    try {
      const F = fillO();
      const k = F && F.cur && !F.cur.x ? String(F.cur.k || "") : "";
      if (k && isUnk(v) && (k === "dimRows" || NOREASK.test(NF(v)))) {
        if (!Array.isArray(F.v101noReask)) F.v101noReask = [];
        if (F.v101noReask.indexOf(k) < 0) F.v101noReask.push(k);
        F.v101noReaskAns = Object.assign({}, F.v101noReaskAns || {}, { [k]: String(v).slice(0, 40) });
        V.lastNoReask = { k, at: Date.now() };
      }
    } catch (e) { err("fa-noreask", e); }
    return o.apply(this, arguments);
  });
  wrap("v54hearAsk", (o) => function (nx) {
    try {
      const F = fillO();
      if (F && F.v54hearR2 && nx && Array.isArray(F.v101noReask) && F.v101noReask.indexOf(nx.k) >= 0) {
        F.skip = (F.skip || []).concat(nx.k);
        cnt("noReask");
        return W.fillNext();
      }
    } catch (e) { err("ask-noreask", e); }
    return o.apply(this, arguments);
  });
  function noReaskNames() {
    const F = fillO();
    const ks = F && Array.isArray(F.v101noReask) ? F.v101noReask : [];
    return ks.map((k) => ({ k, n: needName(k) || k, a: (F.v101noReaskAns || {})[k] || "" })).filter((x) => x.n);
  }

  /* ⑧ トライアルで「STANDAGEの担当が確認します」と言わない */
  const STAFF_FIN = [
    ["「不明」と答えた点は、STANDAGEの担当があらためて確認します。AI商社マンは推測で断定しません。", "「不明」と答えた点は「未確認」のままです（トライアルでは STANDAGE の担当への確認の依頼は出ていません）。AI商社マンは推測で断定しません。分かったら商品情報の「AIの気づき」で「解決済みにする」を押してください。"],
    ["Points answered “unknown” will be checked by STANDAGE staff. The AI will not state guesses as fact.", "Points answered “unknown” stay “not confirmed” (in the trial, no check request is sent to STANDAGE staff). The AI will not state guesses as fact. Once you know, mark them as resolved under “AI notes” on the product page."],
    ["回答“不明”的点由 STANDAGE 负责人再次确认。AI 不会做出推测性的断定。", "回答“不明”的点仍为“未确认”（试用期间不会向 STANDAGE 负责人发出确认请求）。AI 不会做出推测性的断定。弄清楚后请在商品信息的“AI的发现”中标记为已解决。"],
    ["STANDAGE confirmará los puntos respondidos «no sé». La IA no dará suposiciones como hechos.", "Los puntos respondidos «no sé» quedan «sin confirmar» (en la prueba no se envía ninguna solicitud al equipo de STANDAGE). La IA no dará suposiciones como hechos. Cuando lo sepa, márquelos como resueltos en las notas de la IA de la ficha."],
  ];
  const STAFF_NOTE = [
    ["追加ヒアリングで「不明」と答えた点です。STANDAGEの担当があらためて確認します。AI商社マンは、この点を推測で断定しません。分かったら「解決済みにする」を押してください。", "追加ヒアリングで「不明」と答えた点です（未確認。トライアルでは STANDAGE の担当への確認の依頼は出ていません）。AI商社マンは、この点を推測で断定しません。分かったら「解決済みにする」を押してください。"],
    ["You answered “unknown” to this in the follow-up questions. STANDAGE staff will check it with you. The AI will not state guesses about it as fact. Once you know, press “Mark as resolved”.", "You answered “unknown” to this in the follow-up questions (not confirmed; in the trial, no check request is sent to STANDAGE staff). The AI will not state guesses about it as fact. Once you know, press “Mark as resolved”."],
    ["在追加询问中回答了“不明”。STANDAGE 的负责人会再次确认。AI 不会对此做出推测性的断定。弄清楚后请点击“标记为已解决”。", "在追加询问中回答了“不明”（未确认；试用期间不会向 STANDAGE 负责人发出确认请求）。AI 不会对此做出推测性的断定。弄清楚后请点击“标记为已解决”。"],
    ["Respondió «no sé» en las preguntas de seguimiento. El equipo de STANDAGE lo confirmará. La IA no dará suposiciones como hechos. Cuando lo sepa, pulse «Marcar como resuelto».", "Respondió «no sé» en las preguntas de seguimiento (sin confirmar; en la prueba no se envía ninguna solicitud al equipo de STANDAGE). La IA no dará suposiciones como hechos. Cuando lo sepa, pulse «Marcar como resuelto»."],
  ];
  const STAFF_QA = [["STANDAGEの担当が確認します", "未確認"], ["STANDAGE staff will check", "not confirmed"], ["STANDAGE 负责人将确认", "未确认"], ["STANDAGE lo confirmará", "sin confirmar"]];
  const swapAll = (h, L) => { let s = String(h); L.forEach(([a, b]) => { if (s.indexOf(a) >= 0) s = s.split(a).join(b); const ea = E(a); if (ea !== a && s.indexOf(ea) >= 0) s = s.split(ea).join(E(b)); }); return s; };
  wrap("v68pQaHtml", (o) => function () { const h = o.apply(this, arguments); try { if (trial() && typeof h === "string" && /STANDAGE/.test(h)) { cnt("n9qa"); return swapAll(h, STAFF_QA); } } catch (e) { err("n9qa", e); } return h; });
  wrap("v68pNoteHtml", (o) => function () { const h = o.apply(this, arguments); try { if (trial() && typeof h === "string" && /STANDAGE/.test(h)) { cnt("n9note"); return swapAll(h, STAFF_NOTE); } } catch (e) { err("n9note", e); } return h; });
  wrap("v68pNotesCtxFix", (o) => function () { const h = o.apply(this, arguments); try { if (trial() && typeof h === "string" && /STANDAGEの担当が確認する/.test(h)) return h.split("STANDAGEの担当が確認する").join("トライアルのため担当への確認の依頼は出ていない。利用者が分かったら入れる"); } catch (e) { err("n9ctx", e); } return h; });

  // 知らせの文（ヒアリングのログの最後の文）を、ほかの層が直した後に直す：④ 取り込み・⑦ 聞き直さない・⑧ 担当の確認
  wrap("fillSay", (o) => function (who) {
    const F0 = fillO(); const n0 = F0 && Array.isArray(F0.log) ? F0.log.length : -1;
    const r = o.apply(this, arguments);
    try {
      const F = fillO();
      if (who === "ai" && F && Array.isArray(F.log) && n0 >= 0 && F.log.length > n0) {
        const it = F.log[F.log.length - 1];
        if (it && typeof it.html === "string") {
          let h = it.html;
          if (/を取り込みました：/.test(h)) h = fixImport(h);
          const NR = noReaskNames();
          if (NR.length) {
            // 1回目：「後回しにして、ほかの質問が終わってから、もう一度伺います」→ 聞き直さない
            const ck = F.cur && !F.cur.x ? String(F.cur.k || "") : "";
            const mm = h.match(/承知しました。\s*<b>([^<]+)<\/b>\s*は後回しにして、ほかの質問が終わってから、もう一度伺います。/);
            if (mm && ck) {
              const x = NR.find((y) => y.k === ck);
              if (x) {
                h = M(`承知しました。<b>${mm[1]}</b>は「${E(x.a)}」と伺ったので、「未確認」として控えました（このヒアリングでは聞き直しません。「不明」は値として登録しません）。分かったら「商品情報」や「書類をつくる」の画面から入れられます。`,
                  `Noted. As you answered “${E(x.a)}”, <b>${mm[1]}</b> is kept as “not confirmed” (we won't ask again in this interview). You can enter it later on the product page or the documents page.`);
                cnt("noReaskSay");
              }
            }
            // 最後の聞き直し：「あとで」にした N項目（「a」「b」）→ 聞き直さない項目を外して数え直す
            const lm = h.match(/(「あとで」にした<b>)(\d+)(項目<\/b>（)([\s\S]*?)(）を、もう一度だけ伺います。)/);
            if (lm) {
              const names = (lm[4].match(/「[^」]+」/g) || []).map((s) => s.slice(1, -1));
              const drop = NR.filter((x) => names.indexOf(x.n) >= 0);
              if (drop.length) {
                const rest = names.filter((n) => !drop.some((x) => x.n === n));
                const why = M(`${drop.map((x) => "「" + E(x.n) + "」").join("")}は「${E(drop[0].a)}」と伺ったので、聞き直しません（「未確認」として控えています）。`, `${drop.map((x) => "“" + E(x.n) + "”").join(" ")}: not asked again, as you answered “${E(drop[0].a)}” (kept as “not confirmed”).`);
                if (rest.length) h = h.replace(lm[0], lm[1] + rest.length + lm[3] + rest.map((n) => "「" + n + "」").join("") + lm[5]) + "<br>" + why;
                else h = h.replace(/「あとで」にした<b>\d+項目<\/b>（[\s\S]*?）を、もう一度だけ伺います。(?:<br>)?\s*分からなければ、もう一度「わからない（あとで）」で飛ばしてください。/, why);
                cnt("noReaskList");
              }
            }
          }
          if (trial() && /STANDAGE/.test(h)) h = swapAll(h, STAFF_FIN.concat(STAFF_NOTE));
          if (h !== it.html) it.html = h;
        }
      }
    } catch (e) { err("fs1011", e); }
    return r;
  });

  /* ⑤「AIはこう理解しました」の寸法の文（v101dims で言う。データは日本語の1つの文にして、英・中・西は辞書で訳す） */
  const SUM_DIM = {
    unit: ["寸法・重量は単品の分だけです。外装（カートン）の寸法・重さ・入数がまだないので、運賃の見積依頼と梱包明細は「要確認」です（「書類をつくる」の画面で入れられます）。",
      "Dimensions/weight cover the single unit only. The carton size, weight and units per carton are not registered yet, so freight quote requests and the packing list are “to confirm” (you can enter them on the documents page).",
      "尺寸・重量只有单品的数据。外箱（纸箱）的尺寸・重量・入数尚未登记，因此运费报价请求和装箱单为“待确认”（可在“制作单据”页面填写）。",
      "Las medidas y el peso son solo de la unidad. Aún faltan las medidas, el peso y las unidades por caja, así que las solicitudes de flete y la lista de empaque quedan «por confirmar» (puede introducirlos en la pantalla de documentos)."],
    part: ["寸法・重量は、外装（カートン）の寸法・重さ・入数がまだそろっていません。そろうまで、運賃の見積依頼と梱包明細は「要確認」です（「書類をつくる」の画面で入れられます）。",
      "Dimensions/weight: the carton size, weight and units per carton are not complete yet. Until they are, freight quote requests and the packing list are “to confirm” (you can enter them on the documents page).",
      "尺寸・重量：外箱（纸箱）的尺寸・重量・入数尚未齐全。齐全之前，运费报价请求和装箱单为“待确认”（可在“制作单据”页面填写）。",
      "Medidas y peso: aún no están completos las medidas, el peso y las unidades por caja. Hasta entonces, las solicitudes de flete y la lista de empaque quedan «por confirmar» (puede introducirlos en la pantalla de documentos)."],
  };
  try {
    if (typeof I18N !== "undefined" && I18N && I18N.dict) { // eslint-disable-line no-undef
      ["en", "zh", "es"].forEach((l, i) => { const d = I18N.dict[l] = I18N.dict[l] || {}; Object.keys(SUM_DIM).forEach((k) => { if (!d[SUM_DIM[k][0]]) d[SUM_DIM[k][0]] = SUM_DIM[k][i + 1]; }); }); // eslint-disable-line no-undef
    }
  } catch (e) { err("i18n-sum", e); }
  wrap("buildSummary", (o) => function (t) {
    let h = o.apply(this, arguments);
    try {
      if (typeof h === "string" && t && /運賃の見積依頼と梱包明細の自動作成/.test(h)) {
        const d = W.v101dims(t);
        if (!d.ok) {
          const k = (d.carton && [d.carton.l, d.carton.wd, d.carton.h, d.carton.w].some((x) => x != null)) || d.perCtn != null ? "part" : "unit";
          h = h.replace(/寸法・重量は<b>\d+行<\/b>。\s*これで<b>運賃の見積依頼と梱包明細の自動作成<\/b>ができます。/, SUM_DIM[k][0]);
          cnt("sumDim");
        }
      }
    } catch (e) { err("sum", e); }
    return h;
  });

  /* ⑥ 任意の項目：③の表・本人の答えに入っている項目は「入っている」に数える（④の表示も同じ値を出す） */
  function fieldOf(fk) { try { if (typeof V68P_G === "undefined" || !V68P_G) return null; for (const g of Object.keys(V68P_G)) { const f = (V68P_G[g].f || []).find((x) => x && x.k === fk); if (f) return f; } } catch (e) { /* 無視 */ } return null; } // eslint-disable-line no-undef
  function labelWords(f) {
    let ja = "";
    try { if (typeof V68P_FL !== "undefined" && V68P_FL && V68P_FL[f.k]) ja = String(V68P_FL[f.k][0] || ""); } catch (e) { /* 無視 */ } // eslint-disable-line no-undef
    if (!ja) ja = String(f.ja || "");
    return NF(ja).replace(/[（(][^）)]*[）)]/g, "").split(/[・／\/、]/).map((x) => x.trim()).filter((x) => x.length >= 3 || /^(?:年齢|材質|素材|色)$/.test(x));
  }
  function optDerived(t, fk) {
    try {
      if (!t || !fk) return null;
      try { const O = W.V100OUT; if (O && typeof O.n8Val === "function" && /^(mdSterile|mdUse)$/.test(fk)) { const x = O.n8Val(t, fk); if (x && x.v && !isUnk(x.v)) return x; } } catch (e) { /* 下へ */ }
      const f = fieldOf(fk);
      if (!f) return null;
      const words = labelWords(f);
      const rows = Array.isArray(t.compRows) ? t.compRows : [];
      const hit = rows.find((r) => {
        if (!Array.isArray(r)) return false;
        const lab = NF(r[0] == null ? "" : r[0]).trim(), v = String(r[1] == null ? "" : r[1]).trim();
        if (!lab || !v || isUnk(v)) return false;
        if (f.re && f.re.test(lab)) return true;
        return words.some((w) => lab === w || (w.length >= 3 && lab.indexOf(w) === 0));
      });
      if (hit) return { v: String(hit[1]).trim(), src: M("③ の表から", "From table ③", "来自③表", "De la tabla ③") };
    } catch (e) { err("optDer", e); }
    return null;
  }
  V.optDerived = optDerived;
  wrap("v92prodOpt", (o) => function (t) {
    const L = o.apply(this, arguments);
    try {
      const tt = t === undefined ? ten() : t;
      if (Array.isArray(L) && tt) L.forEach((x) => { if (x && !x.ok && /^v68:/.test(String(x.k || "")) && optDerived(tt, String(x.k).slice(4))) { x.ok = true; x.v101der = 1; cnt("optOk"); } });
    } catch (e) { err("opt", e); }
    return L;
  });
  wrap("v90ctyOptMiss", (o) => function (t) {
    const L = o.apply(this, arguments);
    try {
      const tt = t === undefined ? ten() : t;
      if (Array.isArray(L) && tt) return L.filter((x) => !(x && /^v68:/.test(String(x.k || "")) && optDerived(tt, String(x.k).slice(4))));
    } catch (e) { err("optMiss", e); }
    return L;
  });
  wrap("v68pFieldRow", (o) => function (t, f) {
    const r = o.apply(this, arguments);
    try {
      // 「医療用／一般用の別」：資料の記載から控えたとき（TEN.v98md.from＝doc）は「登録の答え」ではなく「資料の記載」と出す
      if (f && f.k === "mdUse" && typeof r === "string" && /data-v100n8/.test(r) && t && t.v98md && t.v98md.from === "doc") {
        return r.replace("医療機器ではありません（登録の答え）", "医療機器ではありません（資料の記載）").replace("登録の答えから", "資料から" + (t.v98md.file ? "（" + E(t.v98md.file) + "）" : ""))
          .replace("Not a medical device (your answer)", "Not a medical device (stated in your file)").replace("From your answer", "From your file");
      }
      // 22.01.3（x2-13）：本人の答えのときは、規制の画面の決め手（V98REG.mdWhyTxt「本人の答え」）と同じ呼び名にそろえる。
      //   資料で控えたあとに本人も同じ答えをしたときは「本人の答え・資料の記載とも同じ」
      if (f && f.k === "mdUse" && typeof r === "string" && /data-v100n8/.test(r) && t && t.v98md && t.v98md.from !== "doc" && /登録の答え|your answer/.test(r)) {
        const both = !!t.v98md.doc;
        cnt("mdUseName");
        return r.replace("医療機器ではありません（登録の答え）", both ? "医療機器ではありません（本人の答え・資料の記載とも同じ）" : "医療機器ではありません（本人の答え）")
          .replace("登録の答えから", both ? "本人の答え・資料" + (t.v98md.doc.file ? "（" + E(t.v98md.doc.file) + "）" : "") + "から" : "本人の答えから")
          .replace("Not a medical device (your answer)", both ? "Not a medical device (your answer; same as your file)" : "Not a medical device (your answer)");
      }
      if (!f || typeof r !== "string" || r.indexOf('class="mute"') < 0 || /data-v100n8/.test(r)) return r;
      const x = optDerived(t, f.k);
      if (!x) return r;
      cnt("optRow");
      const nm = typeof W.v68pFL === "function" ? W.v68pFL(f.k) : f.k;
      return `<tr data-v68f="${E(f.k)}" data-v101opt="1"><td class="k">${E(nm)}</td><td>${E(x.v)}</td><td class="v68psrc">${E(x.src)}</td></tr>`;
    } catch (e) { err("fr", e); return r; }
  });

  /* ══════════════════════════════════════════════════════════════════════════════════════════════
     22.01.2（22.01.1 の公開後の検証 w1・w2 の直し）
     ① w1-3   📎で取り込んだ資料の名前を、商品情報の出どころに出す（記録：TEN.v101srcOf＝項目ごとの資料の名前）
     ② w1     会社名の括弧書き（「（検証w1）」）・「会社名：」の付いた読み取りで、同じ会社の資料を「別の会社の資料」と止めない
     ③ w2-8   任意の項目：③の表（材質・素材・成分）・品名（犬用・猫用）から分かる項目を未登録と数えない／例を商品に合わせる
     ④ w1-10  価格は答えた書き方（桁）のまま（US$12.00 → US$12.00）
     ⑤ w1-12  区分の問い：品名・答えの言葉から区分を拾う（除菌スプレー → 日用雑貨／「日用品・衛生用品（除菌スプレー）」→ 日用雑貨）
     ⑥ w2-3   AI がつながらないときの「決まった質問」で、このヒアリングで答えた項目（寸法など）を聞き直さない
     ⑦ w2-10  AI 追加ヒアリングの「〜のために伺っています」の重なり（防ぐためのために）を直す
     ⑧ w2-11  AIの気づきの「「不明」と回答」の数：答えた問いを「不明」に数えない（1つの答えは1つの気づきに）
     ⑨ w2-13  医療機器かどうかの決め手：資料の記載から控えたときは「資料の記載」と書く
     ══════════════════════════════════════════════════════════════════════════════════════════════ */

  /* ② 会社名：「会社名：」の付いた読み取り・括弧書きの付け足しは、同じ会社として比べる（本当に別の会社なら今までどおり止める） */
  const CO_LAB = /^\s*(?:会社名|社名|企業名|法人名|メーカー名?|製造(?:元|者|会社)|販売(?:元|者|会社)|company(?:\s*name)?|manufacturer|maker)\s*[：:]\s*/i;
  const coClean = (s) => NF(s).replace(CO_LAB, "").replace(/[（(【\[［][^）)】\]］]*[）)】\]］]/g, " ").replace(/\s+/g, " ").trim();
  V.coClean = coClean;
  wrap("v56upldSameCo", (o) => function (a, b) {
    const r = o.apply(this, arguments);
    try {
      if (r === true) return r;
      const a2 = coClean(a), b2 = coClean(b);
      if (a2 && b2 && (a2 !== NF(a).trim() || b2 !== NF(b).trim())) {
        const r2 = o.call(this, a2, b2);
        if (r2 === true) { cnt("coSame"); lg({ k: "coSame", a: String(a).slice(0, 40), b: String(b).slice(0, 40) }); return true; }
        if (r === null && r2 === false) return false;
      }
    } catch (e) { err("sameCo", e); }
    return r;
  });

  /* ① 項目ごとの出どころ（📎の資料の名前）を控える。② 読み取りの「会社名：架空コスメ株式会社」は「会社名：」を外して入れる */
  const SRC_K = { "成分・材質表": "compRows", "寸法・重量": "dimRows", "価格表": "priceRows", "商品の強み": "strengths" };
  wrap("mergeTen", (o) => function (t, x) {
    try {
      if (x && typeof x === "object") ["co", "coEn"].forEach((k) => { if (typeof x[k] === "string" && CO_LAB.test(x[k])) { x[k] = x[k].replace(CO_LAB, "").trim(); cnt("coLab"); } });
    } catch (e) { err("coLab", e); }
    const r = o.apply(this, arguments);
    try {
      const f = x && typeof x === "object" ? String(x.__v101file || x.file || "").trim() : "";
      if (t && Array.isArray(r) && r.length && f && !/^手入力/.test(f)) {
        const S = (t.v101srcOf && typeof t.v101srcOf === "object") ? t.v101srcOf : (t.v101srcOf = {});
        r.forEach((n) => { const k = SRC_K[n] || String(n); if (!S[k]) S[k] = f; });
        if (!Array.isArray(t.v101files)) t.v101files = [];
        if (t.v101files.indexOf(f) < 0) t.v101files.push(f);
      }
    } catch (e) { err("srcOf", e); }
    return r;
  });
  // 商品の📎の資料の名前（TEN.sources・取り込みの控え）。手入力の印（手入力（資料なし））は資料に数えない
  V.fileNames = function (t) {
    t = t || ten();
    const out = [];
    try {
      (Array.isArray(t && t.v101files) ? t.v101files : []).forEach((f) => { if (f && out.indexOf(f) < 0) out.push(f); });
      (Array.isArray(t && t.sources) ? t.sources : []).forEach((s) => { const n = String((s && s.name) || "").trim(); if (n && !/^手入力/.test(n) && out.indexOf(n) < 0) out.push(n); });
    } catch (e) { err("fileNames", e); }
    return out;
  };

  /* ③ 任意の項目：③の表・品名から分かる値 */
  const MAT_F = /材質|素材|組成|成分/;
  const PETFOOD = /おやつ|フード|ジャーキー|トリーツ|ガム|餌|えさ|treats?|food|jerky|snacks?|chews?|kibble/i;
  function optDerived2(t, fk) {
    try {
      const f = fieldOf(fk);
      if (!f || !t) return null;
      const ja = (() => { try { return String((typeof V68P_FL !== "undefined" && V68P_FL && V68P_FL[fk] && V68P_FL[fk][0]) || f.ja || ""); } catch (e) { return String(f.ja || ""); } })(); // eslint-disable-line no-undef
      // 材質・素材・成分の項目：③ の表（材質・素材表／成分表）に行があれば、その表を見る（同じ内容を2か所で聞かない）
      if (MAT_F.test(ja)) {
        const rows = (Array.isArray(t.compRows) ? t.compRows : []).filter((r) => Array.isArray(r) && String(r[1] == null ? "" : r[1]).trim() && !isUnk(r[1]));
        if (rows.length) {
          const v = rows.slice(0, 3).map((r) => String(r[0] || "").trim() + "：" + String(r[1]).trim()).join("／") + (rows.length > 3 ? M(` ほか${rows.length - 3}行`, ` +${rows.length - 3} rows`) : "");
          return { v, src: M("③ の表から", "From table ③", "来自③表", "De la tabla ③") };
        }
      }
      // 対象の動物：品名の「犬用」「猫用」から（サイズは品名に無いので書かない）
      if (fk === "ptTarget") {
        const nm = NF(String(t.item || "") + " " + String(t.itemEn || ""));
        const a = /犬|ドッグ|\bdogs?\b|puppy|canine/i.test(nm) ? M("犬用", "For dogs", "犬用", "Para perros") : /猫|キャット|\bcats?\b|kitten|feline/i.test(nm) ? M("猫用", "For cats", "猫用", "Para gatos") : "";
        if (a) return { v: a, src: M("品名から", "From the product name", "来自品名", "Del nombre del producto") };
      }
    } catch (e) { err("optDer2", e); }
    return null;
  }
  const optDerived0 = optDerived;
  V.optDerived = function (t, fk) { return optDerived0(t, fk) || optDerived2(t, fk); };
  wrap("v92prodOpt", (o) => function (t) {
    const L = o.apply(this, arguments);
    try {
      const tt = t === undefined ? ten() : t;
      if (Array.isArray(L) && tt) L.forEach((x) => { if (x && !x.ok && /^v68:/.test(String(x.k || "")) && optDerived2(tt, String(x.k).slice(4))) { x.ok = true; x.v101der = 2; cnt("optOk2"); } });
    } catch (e) { err("opt2", e); }
    return L;
  });
  wrap("v90ctyOptMiss", (o) => function (t) {
    const L = o.apply(this, arguments);
    try {
      const tt = t === undefined ? ten() : t;
      if (Array.isArray(L) && tt) return L.filter((x) => !(x && /^v68:/.test(String(x.k || "")) && optDerived2(tt, String(x.k).slice(4))));
    } catch (e) { err("optMiss2", e); }
    return L;
  });
  // ペットの項目の例：猫の爪とぎ向けの例を、ペットフード・犬用の商品には出さない
  const PET_EX = [["例：猫用・Mサイズ", (dog) => (dog ? "例：犬用・小型犬〜中型犬" : "例：猫用・成猫")], ["例：強化段ボール・でんぷん糊。またたびなど植物由来は国により確認", () => "例：原材料：鶏ささみ（国産）・添加物なし"]];
  wrap("v68pFieldRow", (o) => function (t, f) {
    let r = o.apply(this, arguments);
    try {
      if (!f || typeof r !== "string") return r;
      if (r.indexOf('class="mute"') >= 0 && !/data-v100n8|data-v101opt/.test(r)) {
        const x = optDerived2(t, f.k);
        if (x) {
          cnt("optRow2");
          const nm = typeof W.v68pFL === "function" ? W.v68pFL(f.k) : f.k;
          return `<tr data-v68f="${E(f.k)}" data-v101opt="2"><td class="k">${E(nm)}</td><td>${E(x.v)}</td><td class="v68psrc">${E(x.src)}</td></tr>`;
        }
      }
      if (/^pt(Target|Material)$/.test(f.k) && t) {
        const nm = NF(String(t.item || "") + " " + String(t.itemEn || ""));
        const dog = /犬|ドッグ|\bdogs?\b|puppy/i.test(nm);
        if (dog || PETFOOD.test(nm)) PET_EX.forEach(([a, b]) => { if (r.indexOf(a) >= 0) { r = r.split(a).join(b(dog)); cnt("petEx"); } });
      }
    } catch (e) { err("fr2", e); }
    return r;
  });

  /* ④ 価格の桁：答えに「US$12.00」と書いたら、登録・知らせも「12.00」のまま（10.50 は今までも 10.50） */
  let PXLIT = null;
  wrap("v54hearPrices", (o) => function (text) {
    const prev = PXLIT;
    try {
      const m = {};
      String(NF(text == null ? "" : text)).replace(/\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+\.\d+/g, (s) => { if (/\./.test(s)) { const v = parseFloat(s.replace(/,/g, "")); if (isFinite(v) && v % 1 === 0) m[v] = s; } return s; });
      PXLIT = Object.keys(m).length ? m : null;
    } catch (e) { PXLIT = null; }
    try { return o.apply(this, arguments); } finally { PXLIT = prev; }
  });
  wrap("v54hearNum", (o) => function (n) {
    try { if (PXLIT && typeof n === "number" && PXLIT[n] != null) { cnt("pxLit"); const s = String(PXLIT[n]); return /,/.test(s) ? s : Number(s).toLocaleString("en-US", { minimumFractionDigits: (s.split(".")[1] || "").length, maximumFractionDigits: (s.split(".")[1] || "").length }); } } catch (e) { err("pxNum", e); }
    return o.apply(this, arguments);
  });

  /* ⑤ 区分の問い：品名の「除菌」「消臭」「洗剤」から日用雑貨を判定して聞く。答え「日用品・衛生用品（除菌スプレー）」は頭の言葉（日用品）で拾う */
  const DAILY_W = /除菌|抗菌|消臭|芳香剤|洗剤|洗浄剤|ハンドソープ|ハンドジェル|ウェットティッシュ|住居用|台所用|キッチン用/;
  wrap("v54hearCatOf", (o) => function (name, strict) {
    const r = o.apply(this, arguments);
    try {
      if (r) return r;
      const s = NF(name == null ? "" : name).trim();
      if (!s) return r;
      if (strict) {
        const head = s.split(/[（(・／\/、,，]/)[0].trim();
        if (head && head !== s && head.length >= 2) { const r2 = o.call(this, head, true); if (r2) { cnt("catHead"); return r2; } }
      }
      const m = s.match(DAILY_W);
      if (m && !/医療|医薬|医療機器/.test(s)) { cnt("catDaily"); return { cat: "日用雑貨", kw: m[0], end: m.index + m[0].length, i: 99 }; }
    } catch (e) { err("catOf", e); }
    return r;
  });

  /* ⑥ AI がつながらないときの「決まった質問」：このヒアリングで聞いて「不明」「あとで」になった項目（寸法など）の問いは出さない */
  wrap("llmGapAnalyze", (o) => async function () {
    const res = await o.apply(this, arguments);
    try {
      const F = fillO();
      if (res && Array.isArray(res.questions) && F) {
        const done = [].concat(F.v101noReask || [], F.skip || [], F.v54hearHeld || []);
        if (done.length) {
          const qs = new Set();
          done.forEach((k) => { try { const x = (NEED || []).find((y) => y && y.k === k); if (x && x.q) qs.add(String(x.q).replace(/<[^>]*>/g, "").trim()); } catch (e) { /* 無視 */ } }); // eslint-disable-line no-undef
          const before = res.questions.length;
          res.questions = res.questions.filter((x) => !qs.has(String((x && x.q) || "").replace(/<[^>]*>/g, "").trim()));
          const dropped = before - res.questions.length;
          if (dropped) {
            cnt("gapAsked", dropped); lg({ k: "gapAsked", dropped });
            try { const G = W.V100AI && W.V100AI.gapMode; if (G && res.v100local) G.n = res.questions.length; } catch (e) { /* 無視 */ }
            try { const T = ten(); if (T && T.v100xq && res.v100local) T.v100xq.n = res.questions.length; } catch (e) { /* 無視 */ }
          }
        }
      }
    } catch (e) { err("gapAsked", e); }
    return res;
  });

  /* ⑦「〜のために伺っています」：AI の理由が「〜ため」「〜に必要」で終わるとき、日本語を整える */
  function whyFix(w) {
    let s = String(w == null ? "" : w).trim().replace(/[。．.]+$/, "");
    if (!s) return null;
    // 22.01.3（x2-11）：「〜に必要なために伺っています」も硬いので、「ため」で終わる理由は「〜ため、伺っています」にそろえる
    if (/(?:ための|のための)$/.test(s)) return s.replace(/の$/, "") + "、伺っています";
    if (/ため$/.test(s)) return s + "、伺っています";
    if (/ために$/.test(s)) return s + "伺っています";
    if (/(?:必要|重要|不可欠|大切|有用)$/.test(s)) return s + "なため、伺っています";
    if (/(?:必要|重要|不可欠|大切)な$/.test(s)) return s + "ため、伺っています";
    if (/(?:する|される|できる|なる|ある|いる|ない|防ぐ|確かめる|確認する|避ける|判断する)$/.test(s)) return s + "ために伺っています";
    // 決まった質問（AI がつながらないとき）の理由は「〜に使います」「〜に関わります」のような丁寧な文で終わる（「使いますのために」になっていた）
    const MASU = [[/使います$/, "使う"], [/関わります$/, "関わる"], [/なります$/, "なる"], [/変わります$/, "変わる"], [/決まります$/, "決まる"], [/確かめます$/, "確かめる"], [/できます$/, "できる"], [/あります$/, "ある"], [/します$/, "する"], [/(必要|重要|大切|不可欠)です$/, "$1な"]];
    for (const [re, to] of MASU) { if (re.test(s)) return s.replace(re, to) + "ため、伺っています"; }
    if (/(?:ます|です)$/.test(s)) return s + "。そのために伺っています";
    return null;
  }
  V.whyFix = whyFix;
  wrap("fillSay", (o) => function (who) {
    const F0 = fillO(); const n0 = F0 && Array.isArray(F0.log) ? F0.log.length : -1;
    const r = o.apply(this, arguments);
    try {
      const F = fillO();
      if (who === "ai" && F && Array.isArray(F.log) && n0 >= 0 && F.log.length > n0) {
        const it = F.log[F.log.length - 1];
        if (it && typeof it.html === "string" && /のために伺っています/.test(it.html)) {
          const h = it.html.replace(/(<div class="ci">)([^<]*?)のために伺っています/, (m0, a, w) => { const z = whyFix(w); if (z) { cnt("whyFix"); return a + z; } return m0; });
          if (h !== it.html) it.html = h;
        }
      }
    } catch (e) { err("fsWhy", e); }
    return r;
  });

  /* ⑧ AIの気づきの「「不明」と回答」：1つの答えは1つの気づきにだけ結び付け、答えた（不明でない）問いに近い気づきは「解決済み」に */
  wrap("v68pNotes", (o) => function (t) {
    const L = o.apply(this, arguments);
    try {
      const tt = t || (fn("v68pTen") ? W.v68pTen() : null);
      if (!Array.isArray(L) || !tt || !L.some((x) => x && x.st === "unk") || typeof v73prodSame !== "function") return L; // eslint-disable-line no-undef
      const man = tt.v68noteSt || {};
      const by = typeof v73prodBy !== "undefined" ? v73prodBy : "担当者の意向・補足"; // eslint-disable-line no-undef
      // 「不明と回答」は、答えが「不明」だけのとき。「製造から12か月。輸送での検証は不明」のように中身（数字など）があれば答えた扱い
      //  （AI の振り分けが答えを書き直して「不明」の語を足すことがあり、答えた問いまで「不明と回答」に数えていた＝w2-11）
      const unkOf = (a) => { try { const u = typeof v73prodUnk === "function" ? v73prodUnk(a) : true; return !!u && isUnk(a); } catch (e) { return isUnk(a); } }; // eslint-disable-line no-undef
      const QA = (Array.isArray(tt.extraQA) ? tt.extraQA : []).filter((x) => x && x.q !== by && String(x.a == null ? "" : x.a).trim());
      const free = L.filter((x) => x && !man[x.k] && (x.st === "unk" || (!x.done && x.st !== "done")));
      if (!free.length || !QA.length) return L;
      // すでに「解決済み」に使われた答えは除く
      const used = new Set(L.filter((x) => x && x.done && x.qa).map((x) => x.qa));
      const pairs = [];
      free.forEach((x) => QA.forEach((q) => { if (used.has(q)) return; const s = q.nk && q.nk === x.k ? 1e6 : v73prodSame(x.n, q); if (s > 0) pairs.push({ x, q, s }); })); // eslint-disable-line no-undef
      pairs.sort((a, b) => b.s - a.s);
      const gotX = new Set(), gotQ = new Set();
      const asg = new Map();
      pairs.forEach((p) => { if (gotX.has(p.x) || gotQ.has(p.q)) return; gotX.add(p.x); gotQ.add(p.q); asg.set(p.x, p.q); });
      // 似た言葉で結べなかった「不明と回答」の気づきは、残った答えに問いの順で結ぶ（追加ヒアリングの問いは気づきごとに作られるため）。
      // 答えが残っていなければ「未解決」（同じ答えを2つの気づきに使わない）
      const left = QA.filter((q) => !gotQ.has(q) && !used.has(q));
      free.forEach((x) => { if (x.st === "unk" && !asg.has(x) && left.length) { const q = left.shift(); asg.set(x, q); gotQ.add(q); } });
      let ch = 0;
      free.forEach((x) => {
        const q = asg.get(x);
        const was = x.st;
        if (q && !unkOf(q.a)) { x.done = true; x.st = "done"; x.by = "追加ヒアリング"; x.qa = q; x.unk = false; }
        else if (q) { x.st = "unk"; x.unk = true; x.qa = q; }
        else if (x.st === "unk") { x.st = "open"; x.unk = false; x.qa = null; }
        if (x.st !== was) ch++;
      });
      if (ch) cnt("noteFix", ch);
    } catch (e) { err("notes", e); }
    return L;
  });

  /* ⑨ 医療機器かどうかの決め手：資料の記載から控えたとき（TEN.v98md.from＝doc）は「資料の記載」。
        資料で控えたあとにヒアリングでも同じ答えをしたときは「本人の答え（資料の記載とも同じ）」 */
  wrap("fillAnswer", (o) => function () {
    let t = null, md0 = null;
    try { t = ten(); md0 = t && t.v98md ? Object.assign({}, t.v98md) : null; } catch (e) { /* 無視 */ }
    const r = o.apply(this, arguments);
    try {
      if (t && md0 && md0.from === "doc" && t.v98md && t.v98md !== md0 && t.v98md.from === "hear" && t.v98md.v === md0.v) { t.v98md.doc = { txt: md0.txt || "", file: md0.file || "" }; cnt("mdDocToo"); }
    } catch (e) { err("mdDoc", e); }
    return r;
  });
  function mdWhyFix() {
    try {
      if (typeof V98REG === "undefined" || !V98REG || typeof V98REG.mdWhyTxt !== "function" || V98REG.mdWhyTxt.__v101hear) return; // eslint-disable-line no-undef
      const o = V98REG.mdWhyTxt; // eslint-disable-line no-undef
      const g = function (m) {
        const r = o.apply(this, arguments);
        try {
          const t = ten();
          const x = t && t.v98md;
          const mm = m || (typeof V98REG.md === "function" ? V98REG.md(t) : null); // eslint-disable-line no-undef
          if (x && mm && (mm.why === "ans" || mm.why === "text") && x.v === mm.v) {
            if (x.from === "doc") { cnt("mdWhyDoc"); return M("資料の記載", "stated in your file", "资料的记载", "lo que dice su archivo") + (x.txt ? "「" + x.txt + "」" : "") + (x.file ? "（" + x.file + "）" : ""); }
            if (x.doc) return r + M("（資料の記載とも同じ）", " (same as your file)", "（与资料记载一致）", " (igual que su archivo)");
          }
        } catch (e) { err("mdWhy", e); }
        return r;
      };
      g.__v101hear = 1;
      V98REG.mdWhyTxt = g; // eslint-disable-line no-undef
    } catch (e) { err("mdWhyFix", e); }
  }
  mdWhyFix();
  V.mdWhyFix = mdWhyFix;

  /* ══════════════════════════════════════════════════════════════════════════════════════════════
     22.01.3（x2・x1 の直し）：AI 追加ヒアリングの問いの「事柄」の印（fact・buyer が使う・取り決めを足しただけ）
     x2 新規1（F）：問いが「FP-201の適合車種・年式・型式・純正互換番号をご提示いただけますか」の言い方だと、「不明」の答えの事柄（適合）が
     見分けられないことがあった。問いの言い方に左右されにくい言葉で事柄を付ける：
       window.v101qaTopics(問いの文) → ["fit"|"asbestos"|"origin"|"halal"|"organic"|"oem"|"capacity"|"shelflife"…]
       TEN.extraQA[i].v101tp ＝ 同じ（記録したとき・画面を描くときに付ける。答えが「不明」かどうかは見ない＝使う側で TEN.extraQA[i].a を見る）
     ══════════════════════════════════════════════════════════════════════════════════════════════ */
  const QA_TOPICS = [
    ["fit", /車種|年式|型式|互換(?:品|性|番号)?|純正(?:品)?(?:番号|品番|部品番号)|適合(?:車|表|機種|品番|リスト|一覧|する車|する機種|する型式)|対応(?:車|機種|表|品番)|フィッティング|fitment|compatib|application\s*(?:list|chart|guide|table)|cross[- ]?reference/i],
    ["asbestos", /アスベスト|石綿|asbestos/i],
    ["origin", /原産|製造国|生産国|産地|製造地|country\s*of\s*origin|made\s*in/i],
    ["halal", /ハラール|ハラル|halal/i],
    ["organic", /有機(?!溶剤|化合物|物|ハロゲン|EL)|オーガニック|organic/i],
    ["oem", /OEM|ODM|プライベートブランド|受託(?:生産|製造)?/i],
    ["capacity", /生産能力|月産|年産|供給(?:量|能力)|生産量|capacity/i],
    ["shelflife", /賞味期限|消費期限|使用期限|有効期限|保存期間|shelf[- ]?life/i],
  ];
  function qaTopics(q) { const s = NF(q == null ? "" : q); return QA_TOPICS.filter(([, re]) => re.test(s)).map(([k]) => k); }
  W.v101qaTopics = function (q) { try { return qaTopics(q); } catch (e) { err("qaTopics", e); return []; } };
  function tagQA(t) {
    try { (Array.isArray(t && t.extraQA) ? t.extraQA : []).forEach((x) => { if (x && typeof x === "object" && !Array.isArray(x.v101tp)) { const tp = qaTopics(x.q); x.v101tp = tp; } }); } catch (e) { err("tagQA", e); }
  }
  V.tagQA = tagQA;
  wrap("llmExtraRecord", (o) => function () { const r = o.apply(this, arguments); try { const t = ten(); if (t) { tagQA(t); cnt("qaTag"); } } catch (e) { err("qaRec", e); } return r; });
  wrap("tenantToD", (o) => function (t) { try { if (t && userT(t)) tagQA(t); } catch (e) { /* 無視 */ } return o.apply(this, arguments); });

  // 起動時と画面の描き直しの前に、今までに登録した商品も掃除する（保存はしない。次の保存で残る）
  wrap("render", (o) => function () { try { const t = ten(); if (t && userT(t)) { clean(t, "render"); strDedupe(t); compFix(t); } } catch (e) { err("render", e); } return o.apply(this, arguments); });
  try { cleanAll(); } catch (e) { err("boot", e); }
  V.ready = 1;
})();
