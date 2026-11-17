/* ═══ v21.96 cty（2026-11-17 第9回相当 UAT・21.95.1 に対して）販売先国の推奨・規制の AI 詳細調査・商材の判定（中身。見せ方は rd_v96cty.js）
   No.517（中）販売先国の推奨がカテゴリー間で完全に一致する（G 木製パズル HS 9503.00 と H 犬用おやつ HS 2309.10 が、アメリカ48・フランス44・シンガポール42 で同じ）
     原因：採点（ctyScoreAll・本体 41788 行＋v56 の包み）の4つの観点が、どれも商材の違いを拾っていなかった。
           ① 規制：regsFor のひな形が無いカテゴリー（文化・教育用品・ペット用品＝catKey other）は、どの国も「未確認 50点」。
           ② 市場性・競合：通関統計（kbStats）は HS 9503 も 2309 も相手国別の数字が無い（2309 は別の品目 2304 の統計に落ちる）→ 競合は未評価、市場性は基準の 10点。
           ③ バイヤー数：v41MyCat が文化・教育用品もペット用品も「その他」に数える → 同じ社数。④ 拠点：商材に関係しない。
           → HS・カテゴリー・単価・保存条件が違っても、4つの観点の点がすべて同じになっていた。
     直し：採点の最後（ctyScoreAll の外側）で、商材の入力を点に入れる（どれも出どころのあるアプリの表だけを使う・推測の数字は作らない）。
           ・規制：書類の判断の表（V85DOC_D・2026-11-08 確認）を、この商品の HS・印（子ども向け・肉を含む など）と国ごとに当てる。
             この国だけに要る手続き（HS か印で当たり、国が限られる行）は 必須 −6点（最大 −24）・条件つき −2点（最大 −6）。輸入を止める行は規制を 5点に。
             どの国にも同じに要る手続き（SDS など）は、国の差に入れずに「共通」と書く。ひな形の書類の減点と重なる分は二重に引かない。
           ・関税：ひな形の無い商材で、シンガポール・香港の課税の区分（21.95 の V95REG.dutyFree・税関の頁）に HS が当たらなければ「関税なし」＋15点。
           ・市場性の「届けやすさ」：単価（価格表の US$）が安いほど、参考の海上運賃（内蔵の参考レーン表 DDP_LANES・目安）の高い国を下げる（〜−8点）。
             賞味期限 12か月以下・冷蔵・冷凍は、海上の日数が長い国を下げる（〜−12点）。
           各国の「点数の内訳（効いた入力）」を r.v96 に残す（文言は表示のときに作る＝英語の画面でも出せる）。AI に渡す依頼文にも国ごとの内訳を足す。
   No.518（低）販売先国のリスク注記が商材に合わない（B 除菌スプレー HS 3808.94 のアメリカに、食品接触材の注記）
     原因：日用雑貨のひな形（RD2.daily）が、アメリカに「FDA 食品接触材規制の確認（飲食器の場合）」の書類と注記を、どの日用雑貨にも付けていた。
     直し：regsFor の結果を、商材の HS（飲食器の項：3924・6911・7013・7323・9617 など）と品名で見分け、食品に触れる物でなければ、食品接触材の書類と注記を外す。
   No.515（中）＋No.508（条件つき）規制の AI 詳細調査が Web 検索エラーで一般知識ベースに切り替わる
     直し：① 規制の AI 詳細調査（regAIRun の llmAsk）が、Web 検索のエラーで Web 検索なしの AI に切り替わった・出典が返らなかったときは、自動で1回だけ、
             同じ道（21.94 の Web 検索の対応 AI へ回す仕組み）でもう一度調べる。
           ② それでも Web 検索で確かめられなかったときは、結果の先頭に「一般知識による下書き・裏取りはできていない」を出し、再試行のボタンを置く（見せ方は rd 側）。
           ③ 「確認できませんでした」の項目ごとに、確かめる先（判断の表の出どころ・関税の公式の検索・JETRO）と、輸入者への質問（英語）を結びつける。
   R-5（条件つき）F ブレーキパッド（HS 8708.30）の初回の取り込みで中古車と誤判定
     原因：21.95 の直し（v95pCatNorm）は、資料の文に中古車の強い語（中古車・オークション・車検証・排気量・走行距離など）が2つ以上あると中古車のままにする。
           補修部品の資料は、適合する車の説明（「車検証の型式・年式・排気量でご確認ください」「中古車の整備にも」）にこの語が多く出るため、初回で中古車になった。
     直し：判定の入口（取り込み fileToTenant・entriesToTenant と、商品を作る adoptReal）で、HS が 87.08（部品・附属品）・68.13・40.11 などの部品の項か、
           品名にブレーキパッド・パッド・部品・parts などがあり、品名が車両そのもの（中古車・車両本体）でなく、HS が車両の項（87.01〜87.05・87.11）でもなければ、
           資料の文の語に関係なく「自動車部品」にする（利用者が選んだ区分は変えない）。訂正バナー「自動車部品に直す」はそのまま残る（前の版で誤判定された商品用）。 */
var V96CTY = window.V96CTY = { v: "21.96", err: [], n: { fit: 0, fc: 0, car: 0, retry: 0, gen: 0 }, rt: {}, rtPend: {} };
(function () {
  "use strict";
  const W = window;
  const err = (k, e) => { try { V96CTY.err.push(k + ": " + String((e && e.message) || e).slice(0, 160)); if (V96CTY.err.length > 40) V96CTY.err.shift(); } catch (x) { /* 記録だけ */ } };
  V96CTY.errf = err;
  const lang = () => { try { const el = document.getElementById("lang"); const l = String((el && el.value) || (typeof I18N !== "undefined" && I18N && I18N.lang) || "ja"); return /^en/.test(l) ? "en" : /^zh/.test(l) ? "zh" : /^es/.test(l) ? "es" : "ja"; } catch (e) { return "ja"; } };
  const M = (ja, en, zh, es) => { const l = lang(); return l === "en" ? en : l === "zh" ? (zh || en) : l === "es" ? (es || en) : ja; };
  V96CTY.M = M;
  V96CTY.lang = lang;
  const E = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  V96CTY.E = E;
  const digits = (s) => String(s == null ? "" : s).replace(/[^\d]/g, "");
  const dd = () => { try { return (typeof D !== "undefined" && D) ? D : null; } catch (e) { return null; } };
  const ten = () => { try { return (typeof TEN !== "undefined" && TEN) ? TEN : null; } catch (e) { return null; } };
  const fn = (n) => { try { return typeof W[n] === "function" ? W[n] : null; } catch (e) { return null; } };
  const hsFmt = (h) => { h = digits(h); return h.length >= 6 ? h.slice(0, 4) + "." + h.slice(4, 6) : h; };
  const ctyNm = (c) => { try { if (lang() === "ja") return c; const DI = I18N && I18N.dict && I18N.dict[lang()]; return (DI && DI[c]) || c; } catch (e) { return c; } };
  V96CTY.ctyNm = ctyNm;
  // 英語などの画面では、カテゴリー名などをアプリの辞書で訳す（辞書に無ければそのまま）
  const tr = (t) => { try { if (lang() === "ja" || !t) return t; const DI = I18N && I18N.dict && I18N.dict[lang()]; return (DI && DI[t]) || t; } catch (e) { return t; } };

  /* ════════════ No.518 食品接触材の注記は、食品に触れる物だけに ════════════ */
  // 飲食器・台所用品・食品の容器の項（HS 4桁）。3923・4823・7010・7310・7612 は容器・包装一般なので、品名・資料で食品用と分かるときだけ
  const FC_HS = ["3923", "3924", "4419", "4823", "6911", "6912", "7010", "7013", "7310", "7323", "7418", "7612", "7615", "8210", "8211", "8215", "8516", "9617"];
  const FC_HS_TXT = ["3923", "4823", "7010", "7310", "7612"];
  const RE_FC_NM = /食器|弁当|ランチ(?:ジャー|ボックス)|タンブラー|水筒|マグ(?!ネ)|コップ|グラス|茶碗|お椀|汁椀|箸|カトラリー|スプーン|フォーク|まな板|調理器具|フライパン|鍋|保存容器|食品容器|哺乳瓶|魔法瓶|ボトル|カップ|皿|tumbler|bottle|tableware|kitchenware|cutlery|lunch\s*box|\bmug\b|\bcup\b|\bplate\b|chopsticks/i;
  const RE_FC_DOC = /食品接触|食品器具容器包装|溶出試験|GB 4806|器具・容器包装の基準/;
  const RE_FC_SENT = /食品接触|飲食に使う器物|溶出試験|food[- ]?contact/i;
  function prodOf() {
    try { if (typeof V68REG !== "undefined" && V68REG && V68REG.cur) return V68REG.cur; } catch (e) { /* 次へ */ }
    try { if (typeof PID !== "undefined" && PID === "custom" && ten()) return ten(); } catch (e) { /* 次へ */ }
    return dd() || ten();
  }
  function isFC(p) {
    try {
      if (!p) return null;
      const vc = Array.isArray(p.v68comp) ? p.v68comp : null;
      if (vc && vc.some((x) => x && x.food === true)) return true;
      const nm = String((p.item || "") + " " + (p.itemEn || ""));
      let txt = false;
      try { txt = typeof v68regFC === "function" ? !!v68regFC(p, "daily") : RE_FC_NM.test(nm); } catch (e) { txt = RE_FC_NM.test(nm); }
      const hs = digits(p.hs), h4 = hs.slice(0, 4);
      if (hs.length >= 4) {
        if (FC_HS.indexOf(h4) >= 0) return FC_HS_TXT.indexOf(h4) >= 0 ? txt : true;
        return RE_FC_NM.test(nm); // HS が飲食器の項でないときは、品名が飲食器のときだけ（資料の「食器の除菌にも」などでは付けない）
      }
      return txt;
    } catch (e) { err("fc", e); return null; }
  }
  V96CTY.isFC = isFC;
  function fcScrub(r, p) {
    if (!r || typeof r !== "object") return false;
    let ch = false;
    if (Array.isArray(r.docs)) {
      const d2 = r.docs.filter((d) => !RE_FC_DOC.test(String(d)));
      if (d2.length !== r.docs.length) { r.docs = d2; ch = true; }
    }
    if (typeof r.warn === "string" && RE_FC_SENT.test(r.warn)) {
      const keep = r.warn.split(/(?<=。)/).filter((s) => s.trim() && !RE_FC_SENT.test(s)).join("");
      r.warn = keep;
      ch = true;
    }
    if (ch) {
      try { Object.defineProperty(r, "_v96fc", { value: { hs: digits(p && p.hs) }, enumerable: false, configurable: true, writable: true }); } catch (e) { /* 印だけ */ }
      V96CTY.n.fc++;
    }
    return ch;
  }
  if (typeof regsFor === "function") {
    const __rf96 = regsFor;
    regsFor = function (cat, targets) { // eslint-disable-line no-global-assign
      const out = __rf96.apply(this, arguments);
      try {
        const p = prodOf();
        if (p && isFC(p) === false) Object.keys(out || {}).forEach((c) => fcScrub(out[c], p));
      } catch (e) { err("regsFor", e); }
      return out;
    };
  }
  // 前の版で保存した分析（s.rec の risk）に残っている食品接触材の注記も外す（AI の文はそのまま）
  V96CTY.scrubRec = function (s) {
    try {
      if (!s || !Array.isArray(s.rec)) return 0;
      const p = prodOf();
      if (!p || isFC(p) !== false) return 0;
      let n = 0;
      s.rec.forEach((r) => {
        if (!r) return;
        if (r.facts) { if (fcScrub(r.facts, p)) n++; }
        const per = s.ai && s.ai.per && s.ai.per[r.c];
        if (typeof r.risk === "string" && RE_FC_SENT.test(r.risk) && !(per && per.risk === r.risk)) {
          r.risk = r.risk.split("／").filter((x) => !RE_FC_SENT.test(x)).join("／") || M("目立ったリスクなし（要確認事項は規制の詳細調査で）", "No notable risks (check details in the regulation research)");
          n++;
        }
      });
      return n;
    } catch (e) { err("scrubRec", e); return 0; }
  };

  if (typeof vCty === "function") {
    const __vc96 = vCty;
    vCty = function () { // eslint-disable-line no-global-assign
      try { if (!W.__ctyBusy && typeof ctyStore === "function") V96CTY.scrubRec(ctyStore()); } catch (e) { err("vCty", e); }
      return __vc96.apply(this, arguments);
    };
  }

  /* ════════════ No.517 商材の入力を採点に入れる ════════════ */
  function usdRate() { try { const f = fn("v54fobRate"); const v = f ? +f() : 0; return v > 0 ? v : 150; } catch (e) { return 150; } }
  // 価格表の最も安い単価（US$）。円だけのときは、価格の画面と同じ為替（v54fobRate）で換算
  function unitUsd(p) {
    try {
      let best = null, jp = false;
      (p.priceRows || []).forEach((row) => (Array.isArray(row) ? row : [row]).forEach((cell) => {
        const s = String(cell == null ? "" : cell);
        let v = null, j = false;
        let m = s.match(/(?:US\s*\$|USD\s*|＄|\$)\s*([\d,]+(?:\.\d+)?)/i) || s.match(/([\d,]+(?:\.\d+)?)\s*(?:USD|米ドル|ドル)/i);
        if (m) v = +m[1].replace(/,/g, "");
        else { m = s.match(/(?:¥|￥)\s*([\d,]+(?:\.\d+)?)/) || s.match(/([\d,]+(?:\.\d+)?)\s*円/); if (m) { v = +m[1].replace(/,/g, "") / usdRate(); j = true; } }
        if (v > 0 && (best == null || v < best)) { best = v; jp = j; }
      }));
      return best == null ? null : { usd: Math.round(best * 100) / 100, jpy: jp };
    } catch (e) { return null; }
  }
  function rowsTxt(a) { return (Array.isArray(a) ? a : []).map((r) => (Array.isArray(r) ? r.join(" ") : String(r == null ? "" : r))).join(" "); }
  function shelfMonths(p) {
    try {
      const cands = [p.shelf];
      (p.compRows || []).forEach((r) => { const s = Array.isArray(r) ? r.join(" ") : String(r || ""); if (/賞味期限|消費期限|使用期限|保存期間|shelf/i.test(s)) cands.push(s); });
      for (const s0 of cands) {
        const s = String(s0 == null ? "" : s0);
        if (!s.trim() || /該当なし|資料参照|^-+$/.test(s.trim())) continue;
        let m = s.match(/(\d+(?:\.\d+)?)\s*(?:ヶ月|か月|カ月|ケ月|箇月|ヵ月|months?)/i);
        if (m) return +m[1];
        m = s.match(/(\d+(?:\.\d+)?)\s*年/);
        if (m && !/\d{4}\s*年/.test(s)) return +m[1] * 12;
        m = s.match(/(\d+)\s*日/);
        if (m) return Math.max(1, Math.round(+m[1] / 30));
      }
    } catch (e) { /* 分からない */ }
    return null;
  }
  function storeOf(p) {
    const s = [p.store, p.shelf, rowsTxt(p.compRows), p.ctn].filter(Boolean).join(" ");
    if (/冷凍|frozen|−18|-18\s*℃/i.test(s)) return "frozen";
    if (/冷蔵|チルド|chilled|要冷|10\s*℃以下|refrigerat/i.test(s)) return "chilled";
    if (/常温|ambient|room temperature/i.test(s)) return "ambient";
    return "";
  }
  // 輸送は 21.95 の決め方（V95REG.mode：案件 → 書類の画面 → 商品の登録 → 海上）をそのまま使う
  function modeOf() { try { const x = W.V95REG && typeof V95REG.mode === "function" ? V95REG.mode() : null; const m = x && typeof x === "object" ? x.m : x; return String(m || "sea"); } catch (e) { return "sea"; } }
  function laneOf(c) {
    try {
      if (typeof DDP_CITY === "undefined" || typeof DDP_LANES === "undefined") return null;
      const row = DDP_CITY.find((x) => x && x[0] === c);
      const z = row && row[2], L = z && DDP_LANES[z];
      return L ? { z, sea: +L.sea || 0, lcl: +L.lcl || 0, port: row[3] || "" } : null;
    } catch (e) { return null; }
  }
  const tplCat = (ck) => { try { return (typeof CIDX !== "undefined" && CIDX[ck] !== undefined) || (typeof RD2 !== "undefined" && !!RD2[ck]); } catch (e) { return false; } };
  // この商品の入力（採点に使ったもの）
  function inputs() {
    const p = dd() || ten() || {};
    const hs = digits(p.hs);
    let ck = "";
    try { ck = typeof ctyCatKey === "function" ? ctyCatKey() : String(p.catKey || ""); } catch (e) { ck = String(p.catKey || ""); }
    const u = unitUsd(p);
    const t = ten();
    return { item: String(p.item || ""), cat: String(p.cat || ""), ck, tpl: tplCat(ck), hs, hsGuess: !!(t && t.hsGuess && t.src === "upload"), ch: hs.slice(0, 2),
      usd: u ? u.usd : null, usdJp: !!(u && u.jpy), shelf: shelfMonths(p), store: storeOf(p), mode: modeOf(), pol: String(p.pol || "") };
  }
  V96CTY.inputs = inputs;

  // 書類の判断の表を読むだけにする：v85docCase は、まだ無い案件の入れ物（空）を作るので、読む前に無かった空の入れ物は消す（21.95 の「空の案件を作らない」と同じ）
  function readOnly(fn0) {
    let t = null, hadDocs = true, k = "", had = true;
    try { t = typeof v85docTen === "function" ? v85docTen() : null; hadDocs = !!(t && t.v85docs); k = typeof v85docCaseKey === "function" ? v85docCaseKey() : ""; had = !!(hadDocs && t.v85docs.cases && Object.prototype.hasOwnProperty.call(t.v85docs.cases, k)); } catch (e) { /* 読めないときはそのまま */ }
    try { return fn0(); } finally {
      try {
        const empty = (o) => !o || (typeof o === "object" && !Object.keys(o).length);
        const S = t && t.v85docs;
        if (S && S.cases && !had && k && S.cases[k]) { const c = S.cases[k]; if (Object.keys(c).every((x) => empty(c[x]))) delete S.cases[k]; }
        if (t && !hadDocs && S && empty(S.cases) && empty(S.learn) && Object.keys(S).every((x) => x === "cases" || x === "learn")) delete t.v85docs;
      } catch (e) { err("readOnly", e); }
    }
  }
  V96CTY.readOnly = readOnly;
  const docFacts = () => readOnly(() => (typeof v85docFacts === "function" ? v85docFacts() : null));

  // 書類の判断の表（V85DOC_D）を、この商品と国ごとに当てる
  let RULEIX = null;
  function ruleIx() {
    if (RULEIX) return RULEIX;
    RULEIX = {};
    try { (V85DOC_D.rules || []).forEach((r) => { if (r && r.id) RULEIX[r.id] = r; }); } catch (e) { /* 表が無い版 */ }
    return RULEIX;
  }
  const LVN = { required: 3, conditional: 2, check: 1 };
  function dtOf(c, F0) {
    try {
      if (!F0 || typeof v85docJudge !== "function" || typeof v85docCC !== "function") return null;
      const cc = v85docCC(c);
      if (!cc) return { nocc: 1 };
      if (!F0.hs) return { nohs: 1 };
      const J = readOnly(() => v85docJudge(Object.assign({}, F0, { dest: cc })));
      const ix = ruleIx();
      const list = (typeof v85docList === "function" ? v85docList(J) : Object.keys(J.rows || {}).map((k) => J.rows[k])).filter((r) => r && !r.skip);
      const out = { cc, req: [], con: [], com: [], ban: (J.ban || []).map((b) => ({ id: b.id, s: b.s || "", u: b.u || "" })), prov: !!F0.hsProv };
      list.forEach((row) => {
        const ws = (row.why || []).map((w) => ({ w, r: ix[w.id] })).filter((x) => x.r && x.r.w);
        const ps = ws.filter((x) => { const w = x.r.w; return (w.h || []).indexOf("*") < 0 || (Array.isArray(w.f) && w.f.length); });
        if (!ps.length) return; // HS・印に関係しない（どの商品にも要る船積みの書類）
        const cs = ps.filter((x) => (x.r.w.d || []).indexOf("*") < 0);
        const lvOf = (L) => L.reduce((a, x) => (LVN[x.w.lv] || 0) > (LVN[a] || 0) ? x.w.lv : a, "check");
        const srcR = (cs.length ? cs : ps).map((x) => x.r).find((r) => r.u && /^https:\/\//.test(r.u));
        const it = { k: row.k, ld: +row.ld || 0, s: srcR ? String(srcR.s || "") : "", u: srcR ? srcR.u : "", f: (cs.length ? cs : ps).some((x) => Array.isArray(x.r.w.f) && x.r.w.f.length) ? 1 : 0 };
        if (!cs.length) { const lv = lvOf(ps); if (lv === "required" || lv === "conditional") { it.lv = lv; out.com.push(it); } return; }
        it.lv = lvOf(cs);
        if (it.lv === "required") out.req.push(it); else if (it.lv === "conditional") out.con.push(it);
      });
      return out;
    } catch (e) { err("dt " + c, e); return null; }
  }
  V96CTY.dtOf = dtOf;
  function docNm(k) {
    try { const x = (V85DOC_D.docs || {})[k]; if (x) return lang() === "ja" ? x[0] : (x[1] || x[0]); } catch (e) { /* 次へ */ }
    return k;
  }
  V96CTY.docNm = docNm;

  const lg = (v) => Math.log1p(Math.max(0, +v || 0));
  const clamp = (v) => Math.max(0, Math.min(100, Math.round(v)));
  function wts() { try { return (typeof CTY_W !== "undefined" && CTY_W) || { reg: 25, mkt: 35, comp: 20, base: 20 }; } catch (e) { return { reg: 25, mkt: 35, comp: 20, base: 20 }; } }
  function totalOf(sc) {
    const Wt = wts();
    let sw = 0, sv = 0;
    ["reg", "mkt", "comp", "base"].forEach((k) => { if (sc[k] == null) return; sw += Wt[k]; sv += sc[k] * Wt[k]; });
    return sw ? Math.round(sv / sw) : 0;
  }
  // 単価が安いほど運賃の重さが効く（目安）。運賃は内蔵の参考レーン表の LCL の ¥/m³
  const frtBand = (lcl) => (lcl <= 11000 ? 0 : lcl <= 13500 ? 2 : lcl <= 16000 ? 4 : lcl <= 20000 ? 6 : 8);
  const frtSens = (usd) => (usd == null ? 0 : usd < 5 ? 1 : usd < 15 ? 0.5 : 0);
  function apply(L, facts, S) {
    if (!Array.isArray(L) || !L.length) return;
    const I = inputs();
    let F0 = null;
    try { F0 = docFacts(); } catch (e) { err("facts", e); F0 = null; }
    const fs = L.map((r) => (r && r.facts) || {});
    const maxV = Math.max(...fs.map((f) => lg(f.exportUsd)), 0.0001), maxB = Math.max(...fs.map((f) => lg(f.buyers)), 0.0001), maxSh = Math.max(...fs.map((f) => f.share || 0), 0.0001);
    const s4 = S && S.hs ? digits(S.hs).slice(0, 4) : "";
    L.forEach((r) => {
      try {
        if (!r || !r.sc) return;
        const f = r.facts || {}, sc = r.sc, c = r.c;
        const P = [];
        const add = (ax, k, p, x) => P.push(Object.assign({ ax, k, p: p == null ? null : Math.round(p * 10) / 10 }, x || {}));
        const from = { reg: sc.reg, mkt: sc.mkt, comp: sc.comp, base: sc.base, total: sc.total };
        /* 規制（元の採点の中身を、そのまま書き出す） */
        const warnReal = !!f.warn && !(typeof v5324NoTpl === "function" && v5324NoTpl(f.warn));
        add("reg", f.known ? "tpl" : "notpl", f.known ? 70 : 50, { duty: f.duty || "", n: (f.docs || []).length });
        if (f.known) {
          if (f.dutyN === 0) add("reg", "duty0", 30);
          else if (f.dutyN != null && f.dutyN <= 5) add("reg", "dutyLo", 15, { duty: f.duty });
          else if (f.dutyN != null && f.dutyN > 15) add("reg", "dutyHi", -15, { duty: f.duty });
        }
        if (warnReal) add("reg", "warn", -10);
        const basePen = Math.min(15, Math.max(0, (f.docs || []).length - 4) * 3);
        if (basePen) add("reg", "docs", -basePen, { n: (f.docs || []).length });
        if (f.regKb) add("reg", "kb", 5);
        if (r.facts && r.facts._v96fc) add("reg", "fcOff", null, { hs: I.hs });
        let regAdj = 0;
        /* 規制：書類の判断の表（この商品の HS・印 × この国） */
        const dt = dtOf(c, F0);
        let ban = false;
        if (dt && dt.nohs) add("reg", "dtNoHs", null);
        else if (dt && !dt.nocc) {
          const pr = Math.min(24, dt.req.length * 6), pc = Math.min(6, dt.con.length * 2);
          const pen = pr + pc;
          const extra = f.known ? Math.max(0, pen - basePen) : pen;
          if (dt.req.length) add("reg", "dtReq", -Math.min(pr, extra), { L: dt.req.map((x) => x.k), u: (dt.req.find((x) => x.u) || {}).u || "", s: (dt.req.find((x) => x.u) || {}).s || "", ld: Math.max(0, ...dt.req.map((x) => x.ld || 0)), prov: dt.prov ? 1 : 0 });
          if (dt.con.length) add("reg", "dtCon", -Math.max(0, Math.min(pc, extra - Math.min(pr, extra))), { L: dt.con.map((x) => x.k), prov: dt.prov ? 1 : 0 });
          if (f.known && pen > extra && pen) add("reg", "dtOver", null, { b: basePen });
          if (!dt.req.length && !dt.con.length) add("reg", "dtNone", 0, { hs: I.hs });
          if (dt.com.length) add("reg", "dtCom", null, { L: dt.com.map((x) => x.k) });
          regAdj -= extra;
          if (dt.ban.length) { ban = true; add("reg", "ban", null, { n: dt.ban.length, u: (dt.ban.find((b) => b.u) || {}).u || "" }); }
        }
        /* 規制：HS から分かる関税（ひな形の無い商材のとき） */
        // 車両（87.01〜87.05・87.11）は、関税が無くても登録の税（香港の初回登録税など）が重いので、関税なしの加点はしない
        if (!f.known && I.hs.length >= 4 && ["8701", "8702", "8703", "8704", "8705", "8711"].indexOf(I.hs.slice(0, 4)) < 0) {
          let df = "";
          try { df = W.V95REG && typeof V95REG.dutyFree === "function" ? V95REG.dutyFree(c, I.hs) : ""; } catch (e) { df = ""; }
          if (df) {
            let u = "";
            try { u = (V95REG.DUTYFREE[df] || {}).u || ""; } catch (e) { u = ""; }
            add("reg", "dfree", 15, { hs: I.hs, cc: df, u });
            regAdj += 15;
          }
        }
        /* 市場性（元の採点の中身） */
        if (sc.mkt != null) {
          const sp = S && f.exportUsd ? 60 * lg(f.exportUsd) / maxV : (S ? 10 : 30);
          add("mkt", f.exportUsd ? "exp" : (S ? "noPart" : "noStat"), sp, { v: f.exportUsd || 0, y: f.statsYear || "", sh: S ? S.hs : "", other: s4 && I.hs.length >= 4 && s4 !== I.hs.slice(0, 4) ? 1 : 0 });
          add("mkt", "yoy", f.yoy == null ? 5 : f.yoy > 0.1 ? 15 : f.yoy > 0 ? 10 : 0, { yoy: f.yoy });
          add("mkt", "buy", f.buyers ? 25 * lg(f.buyers) / maxB : 0, { n: f.buyers || 0, all: f.buyersAll || 0, cat: f.bcat || "" });
        }
        let mktAdj = 0;
        /* 市場性：届けやすさ（単価×運賃・保存×日数） */
        const ln = laneOf(c);
        if (!ln) add("mkt", "noLane", null);
        else {
          const sens = frtSens(I.usd);
          if (I.usd == null) add("mkt", "noUsd", null);
          else {
            const p = -Math.round(frtBand(ln.lcl) * sens);
            add("mkt", "frt", p, { usd: I.usd, lcl: ln.lcl, z: ln.z, sea: ln.sea });
            mktAdj += p;
          }
          if (I.mode === "sea" || !I.mode) {
            if (I.store === "chilled" || I.store === "frozen") {
              const p = ln.sea >= 14 ? -8 : ln.sea >= 7 ? -4 : 0;
              add("mkt", "cold", p, { st: I.store, sea: ln.sea });
              mktAdj += p;
            } else if (I.shelf != null && I.shelf <= 12) {
              let p = ln.sea >= 25 ? -6 : ln.sea >= 14 ? -3 : 0;
              if (I.shelf <= 6) p *= 2;
              add("mkt", "shelf", p, { m: I.shelf, sea: ln.sea });
              mktAdj += p;
            }
          }
        }
        /* 競合 */
        if (sc.comp != null) {
          add("comp", "share", f.exportUsd ? 100 - 55 * ((f.share || 0) / maxSh) : 70, { sh: f.share || 0 });
          if (f.yoy != null && f.yoy > 0) add("comp", "grow", 5);
          if (f.priceAdv) add("comp", "price", f.priceAdv * 12);
        }
        /* 拠点 */
        let bt = "";
        try { bt = typeof v56priceCBaseTxt === "function" ? v56priceCBaseTxt(f.base, 0, 1) : ""; } catch (e) { bt = ""; }
        add("base", "base", sc.base, { t: bt });
        /* 点を直す */
        if (regAdj) sc.reg = clamp(sc.reg + regAdj);
        if (ban) sc.reg = Math.min(sc.reg, 5);
        if (sc.mkt != null && mktAdj) sc.mkt = clamp(sc.mkt + mktAdj);
        else if (sc.mkt == null && mktAdj) P.forEach((x) => { if (x.ax === "mkt" && (x.k === "frt" || x.k === "shelf" || x.k === "cold") && x.p) x.na = 1; });
        sc.total = totalOf(sc);
        r.v96 = { v: 1, from, na: ["reg", "mkt", "comp", "base"].filter((k) => sc[k] == null), P,
          inp: { hs: I.hs, hsGuess: I.hsGuess ? 1 : 0, cat: I.cat, ck: I.ck, tpl: I.tpl ? 1 : 0, usd: I.usd, usdJp: I.usdJp ? 1 : 0, shelf: I.shelf, store: I.store, mode: I.mode, item: I.item.slice(0, 60) } };
        V96CTY.n.fit++;
      } catch (e) { err("apply " + (r && r.c), e); }
    });
  }
  V96CTY.apply = apply;
  if (typeof ctyScoreAll === "function") {
    const __csa96 = ctyScoreAll;
    ctyScoreAll = function (facts, S) { // eslint-disable-line no-global-assign
      const L = __csa96.apply(this, arguments);
      try { apply(L, facts, S); } catch (e) { err("score", e); }
      return L;
    };
  }

  // 要点の文（ctyWhyLocal）：HS から関税なしと分かった国は「関税・規制は要確認」と書かない（内訳と同じ言い方に）
  if (typeof ctyWhyLocal === "function") {
    const __cw96 = ctyWhyLocal;
    ctyWhyLocal = function (r) { // eslint-disable-line no-global-assign
      let s = __cw96.apply(this, arguments);
      try {
        const df = r && r.v96 && Array.isArray(r.v96.P) ? r.v96.P.find((x) => x.k === "dfree") : null;
        const W0 = typeof V5324_WHY !== "undefined" ? V5324_WHY : "規制のひな形なし（関税・規制は要確認）";
        if (df && typeof s === "string" && s.indexOf(W0) >= 0) s = s.replace(W0, "規制のひな形なし（関税なし＝HS " + hsFmt(df.hs) + " から判定・登録などの規制は要確認）");
      } catch (e) { err("why", e); }
      return s;
    };
  }

  /* 内訳の文言（保存は数と記号だけ・文言は表示のときに作る） */
  const AXN = { mkt: ["市場性", "Market"], reg: ["規制", "Regulation"], comp: ["競合", "Competition"], base: ["STANDAGE拠点", "STANDAGE base"] };
  const axNm = (k) => M(AXN[k][0], AXN[k][1]);
  V96CTY.axNm = axNm;
  const usdT = (v) => "US$" + (v >= 100 ? Math.round(v).toLocaleString("en-US") : v.toFixed(2));
  const yen = (v) => "¥" + Math.round(v).toLocaleString("ja-JP");
  const money = (v) => { try { return typeof ctyM === "function" ? ctyM(v) : "$" + Math.round(v); } catch (e) { return "$" + Math.round(v); } };
  const names = (L, n) => { const a = (L || []).slice(0, n || 4).map(docNm); return a.join(M("・", ", ")) + ((L || []).length > (n || 4) ? M(" ほか", " etc.") : ""); };
  const ZN = { hk: ["香港", "Hong Kong"], cn: ["中国", "China"], tw: ["台湾", "Taiwan"], kr: ["韓国", "Korea"], sg: ["シンガポール", "Singapore"], th: ["タイ", "Thailand"], vn: ["ベトナム", "Vietnam"], my: ["マレーシア", "Malaysia"], id: ["インドネシア", "Indonesia"], ph: ["フィリピン", "Philippines"], in: ["インド", "India"], ae: ["中東（UAE）", "Middle East (UAE)"], sa: ["サウジアラビア", "Saudi Arabia"], usw: ["米国西岸", "US West Coast"], use: ["米国東岸", "US East Coast"], latam: ["中南米", "Latin America"], eu: ["欧州", "Europe"], au: ["豪州", "Australia"], africa: ["アフリカ", "Africa"] };
  const zn = (z) => { const x = ZN[z]; return x ? M(x[0], x[1]) : z; };
  function partTxt(x, c) {
    const hs = x.hs ? hsFmt(x.hs) : "";
    switch (x.k) {
      case "tpl": return M("規制のひな形あり（関税 " + x.duty + "・必要書類 " + x.n + "件）→ 基準 70点", "Regulation template available (duty " + x.duty + ", " + x.n + " documents) → base 70");
      case "notpl": return M("規制のひな形なし（このカテゴリーは、関税・登録が要るかがアプリの表にまだありません）→ 基準 50点（未確認）", "No regulation template for this category (duty and registrations not in the app yet) → base 50 (unconfirmed)");
      case "duty0": return M("関税 0%", "Duty 0%");
      case "dutyLo": return M("関税 " + x.duty + "（5%以下）", "Duty " + x.duty + " (5% or less)");
      case "dutyHi": return M("関税 " + x.duty + "（15%超）", "Duty " + x.duty + " (over 15%)");
      case "warn": return M("ひな形の注意点あり", "Template caution applies");
      case "docs": return M("ひな形の必要書類 " + x.n + "件（4件を超える分）", "Template documents: " + x.n + " (beyond 4)");
      case "kb": return M("AI 詳細調査をAI商社マンに反映済み", "AI regulation research applied");
      case "fcOff": return M("食品接触材の注記は、この商品（HS " + hs + "・食品に触れる物ではない）には当たらないため外しました", "Food-contact notes were removed: this product (HS " + hs + ") does not touch food");
      case "dtNoHs": return M("HS コードが未登録のため、書類の判断の表を当てていません（HS を入れると、この国で要る手続きが点に入ります）", "No HS code, so the document decision table was not applied (enter the HS code to include required procedures)");
      case "dtReq": return M("書類の判断の表：この商品とこの国で要る【必須】" + x.L.length + "件（" + names(x.L) + "）" + (x.ld ? "・準備の目安 最長 " + x.ld + "日" : "") + (x.prov ? "（HS を推定して当てはめ・要確認）" : ""), "Document decision table: " + x.L.length + " required for this product and country (" + names(x.L) + ")" + (x.ld ? ", up to " + x.ld + " days to prepare" : "") + (x.prov ? " (HS estimated; to be confirmed)" : ""));
      case "dtCon": return M("書類の判断の表：【条件つき】" + x.L.length + "件（" + names(x.L) + "）", "Document decision table: " + x.L.length + " conditional (" + names(x.L) + ")");
      case "dtOver": return M("（ひな形の必要書類の減点 −" + x.b + " と重なる分は、二重に引いていません）", "(Overlap with the template document deduction −" + x.b + " is not counted twice)");
      case "dtNone": return M("書類の判断の表：この商品（HS " + hs + "）とこの国だけに要る手続きは、表にはありません（無いと確かめたものではありません）", "Document decision table: no procedure specific to this product (HS " + hs + ") and country in the table (not confirmed as none)");
      case "dtCom": return M("どの国にも共通の手続き：" + names(x.L) + "（国の差には入れていません）", "Needed for every country: " + names(x.L) + " (not counted as a difference)");
      case "ban": return M("輸入を止める決まりに当たります（" + x.n + "件）→ 規制は 5点まで", "An import ban applies (" + x.n + ") → regulation capped at 5");
      case "dfree": return M("関税：HS " + hs + " は" + ctyNm(c) + "の課税の区分に当たらない＝関税なし（税関の頁から）", "Duty: HS " + hs + " is outside " + ctyNm(c) + "'s dutiable categories = no duty (customs website)");
      case "exp": return M("日本からの輸出 " + money(x.v) + "（通関統計・HS " + x.sh + "・" + x.y + "年）", "Exports from Japan " + money(x.v) + " (customs statistics, HS " + x.sh + ", " + x.y + ")");
      case "noPart": return M("通関統計：HS " + x.sh + " には相手国ごとの数字がありません → 基準 10点" + (x.other ? "（登録の HS とは別の品目の統計です）" : ""), "Customs statistics: no per-country figures for HS " + x.sh + " → base 10" + (x.other ? " (statistics are for a different item than your HS)" : ""));
      case "noStat": return M("通関統計：この HS の統計がありません → 基準 30点", "Customs statistics: none for this HS → base 30");
      case "yoy": return x.yoy == null ? M("前年比のデータなし", "No year-on-year data") : M("日本からの輸出の前年比 " + (x.yoy >= 0 ? "+" : "") + Math.round(x.yoy * 100) + "%", "Exports year on year " + (x.yoy >= 0 ? "+" : "") + Math.round(x.yoy * 100) + "%");
      case "buy": return M("STANDAGE が" + (x.cat ? "「" + x.cat + "」の商品で" : "") + "商談したバイヤー " + x.n + "社（この国で計 " + x.all + "社・候補国の中で最も多い国を25点）", "Buyers STANDAGE has talked with" + (x.cat ? " for “" + tr(x.cat) + "” products" : "") + ": " + x.n + " (" + x.all + " in total; the most among candidates = 25)");
      case "noLane": return M("届けやすさ：この国は内蔵の参考レーン表に無いため、運賃・日数は見ていません", "Ease of delivery: this country is not in the built-in lane table, so freight and days were not used");
      case "noUsd": return M("届けやすさ：価格表に US$ の単価が無いため、運賃の重さは見ていません", "Ease of delivery: no unit price in US$ in the price table, so freight weight was not used");
      case "frt": return M("届けやすさ：単価 " + usdT(x.usd) + "・参考の海上運賃 LCL " + yen(x.lcl) + "/m³（" + zn(x.z) + "・内蔵の参考レーン表・目安）" + (x.usd >= 15 ? "（単価が高いため運賃の重さは小さい）" : ""), "Ease of delivery: unit price " + usdT(x.usd) + ", reference sea freight LCL " + yen(x.lcl) + "/m³ (" + zn(x.z) + ", built-in lane table, estimate)" + (x.usd >= 15 ? " (high unit price, freight matters little)" : ""));
      case "shelf": return M("保存：賞味期限 " + x.m + "か月・海上 約" + x.sea + "日（内蔵の参考レーン表）", "Storage: shelf life " + x.m + " months, about " + x.sea + " days by sea (built-in lane table)");
      case "cold": return M("保存：" + (x.st === "frozen" ? "冷凍" : "冷蔵") + "・海上 約" + x.sea + "日（内蔵の参考レーン表）", "Storage: " + (x.st === "frozen" ? "frozen" : "chilled") + ", about " + x.sea + " days by sea (built-in lane table)");
      case "share": return x.sh ? M("日本からの輸出シェア " + Math.round(x.sh * 100) + "%（高いほど競合が多い）", "Japan's export share " + Math.round(x.sh * 100) + "% (higher = more competition)") : M("通関統計に日本からの輸出実績なし（先行者不在）→ 70点", "No exports from Japan in the statistics (no first mover) → 70");
      case "grow": return M("輸出が伸びている", "Exports growing");
      case "price": return M("価格の比較（推奨FOB と市場平均）", "Price comparison (recommended FOB vs market average)");
      case "base": return x.t || M("STANDAGE の拠点の状況", "STANDAGE base status");
      default: return x.k;
    }
  }
  V96CTY.partTxt = partTxt;
  // 観点の基準の点（足し算の出発点）は符号を付けずに出す
  const BASEK = ["tpl", "notpl", "exp", "noPart", "noStat", "share", "base"];
  function ptTxt(p, na, k) {
    if (p == null) return "";
    if (na) return M("（未評価のため点に入れていません）", "(not counted: not rated)");
    const v = Math.round(p);
    if (k && BASEK.indexOf(k) >= 0) return String(v);
    return v > 0 ? "+" + v : v < 0 ? "−" + Math.abs(v) : "±0";
  }
  function inpTxt(v) {
    const a = [];
    if (!v) return "";
    a.push(v.hs ? M("HS " + hsFmt(v.hs) + "（" + v.hs.slice(0, 2) + "類" + (v.hsGuess ? "・推定" : "") + "）", "HS " + hsFmt(v.hs) + " (chapter " + v.hs.slice(0, 2) + (v.hsGuess ? ", estimated" : "") + ")") : M("HS 未登録", "HS not set"));
    if (v.cat) a.push(M("カテゴリー " + v.cat + (v.tpl ? "（規制のひな形あり）" : "（規制のひな形なし）"), "Category " + tr(v.cat) + (v.tpl ? " (template available)" : " (no regulation template)")));
    a.push(v.usd != null ? M("単価 " + usdT(v.usd) + (v.usdJp ? "（円から換算）" : ""), "Unit price " + usdT(v.usd) + (v.usdJp ? " (converted from JPY)" : "")) : M("単価 不明", "Unit price unknown"));
    if (v.shelf != null) a.push(M("賞味期限 " + v.shelf + "か月", "Shelf life " + v.shelf + " months"));
    if (v.store) a.push(v.store === "frozen" ? M("冷凍", "Frozen") : v.store === "chilled" ? M("冷蔵", "Chilled") : M("常温", "Ambient"));
    a.push(v.mode === "air" ? M("航空", "Air") : v.mode === "courier" ? M("クーリエ", "Courier") : M("海上", "Sea"));
    return a.join(M("・", " · "));
  }
  V96CTY.inpTxt = inpTxt;
  // 1か国の内訳（HTML。文字はすべてエスケープ・リンクは https だけ）
  V96CTY.bdHtml = function (r, o) {
    try {
      o = o || {};
      const v = r && r.v96;
      if (!v || !Array.isArray(v.P)) return "";
      const sc = r.sc || {}, Wt = wts();
      const ax = ["mkt", "reg", "comp", "base"];
      const used = ax.filter((k) => sc[k] != null);
      const formula = M("総合 " + sc.total + "点 ＝（" + used.map((k) => axNm(k) + " " + sc[k] + "×" + Wt[k]).join(" ＋ ") + "）÷ " + used.reduce((a, k) => a + Wt[k], 0),
        "Total " + sc.total + " = (" + used.map((k) => axNm(k) + " " + sc[k] + "×" + Wt[k]).join(" + ") + ") ÷ " + used.reduce((a, k) => a + Wt[k], 0))
        + (v.na.length ? M("　※" + v.na.map(axNm).join("・") + "は未評価のため配点から外しています", "  * " + v.na.map(axNm).join(", ") + " not rated, so left out of the weights") : "");
      const MINE = /^(dt|dfree|frt|shelf|cold|fcOff|ban|noUsd|noLane)/;
      const li = (x) => {
        let t = partTxt(x, r.c);
        if (x.k === "base" && lang() !== "ja") { try { if (typeof v56priceCBaseTxt === "function" && r.facts) t = v56priceCBaseTxt(r.facts.base, 0, 0) || t; } catch (e) { /* 日本語のまま */ } }
        const pt = ptTxt(x.p, x.na, x.k);
        const cls = x.p == null || x.na || BASEK.indexOf(x.k) >= 0 ? "z" : Math.round(x.p) > 0 ? "pos" : Math.round(x.p) < 0 ? "neg" : "z";
        const mine = MINE.test(x.k);
        const link = x.u && /^https:\/\//.test(x.u) ? ' <a href="' + E(x.u) + '" target="_blank" rel="noopener noreferrer">' + E(M("出どころ", "source")) + " ↗</a>" : "";
        return '<li class="' + (mine ? "v96cty-mine" : "") + '"><span class="v96cty-pt ' + cls + '">' + E(pt) + "</span><span>" + E(t) + link + "</span></li>";
      };
      if (o.compact) {
        // カード用：商品から付けた点（★）と、観点の点の動きだけ。全部の内訳は下の表へ
        const mv = ax.filter((k) => v.from[k] != null && sc[k] != null && v.from[k] !== sc[k]).map((k) => axNm(k) + " " + v.from[k] + " → " + sc[k]);
        const mineAll = v.P.filter((x) => MINE.test(x.k) && x.k !== "dtCom" && x.k !== "dtOver");
        const mineL = mineAll.filter((x) => x.k === "ban" || (x.p != null && !x.na && Math.round(x.p) !== 0));
        return '<div class="v96cty-bdb v96cty-cmp" data-noi18n="1"><p class="v96cty-in">' + E(M("この商品で使った入力：", "Inputs from this product: ") + inpTxt(v.inp)) + "</p>" +
          '<p class="v96cty-mv">' + E(mv.length ? mv.join(M("・", " · ")) : M("この商品の入力では、点は動いていません", "This product's inputs did not change the score")) + "</p>" +
          (mineL.length ? '<div class="v96cty-ax"><ul>' + mineL.map(li).join("") + "</ul></div>" : "") +
          (mineAll.length > mineL.length ? '<p class="v96cty-note">' + E(M("点の動かなかった入力 " + (mineAll.length - mineL.length) + "件（±0・未評価）は、全部の内訳に出しています。", (mineAll.length - mineL.length) + " input(s) with no effect (±0 / not rated) are in the full breakdown.")) + "</p>" : "") +
          '<p class="v96cty-f">' + E(formula) + '</p><button type="button" class="v96cty-goto" data-v96goto="' + E(r.c) + '">' + E(M("全部の内訳（市場性・規制・競合・拠点）を見る", "See the full breakdown")) + " ↓</button></div>";
      }
      const blocks = ax.map((k) => {
        const parts = v.P.filter((x) => x.ax === k);
        const fr = v.from[k], to = sc[k];
        const head = to == null ? M("未評価（データが無いため配点から外す）", "not rated (no data; left out)") : (fr != null && fr !== to ? fr + " → " + to : String(to));
        const naWhy = k === "comp" && to == null ? '<li><span class="v96cty-pt z"></span><span>' + E(M("通関統計に、日本からこの国への輸出の数字が無いため", "No figures for exports from Japan to this country in the customs statistics")) + "</span></li>" : "";
        return '<div class="v96cty-ax"><b>' + E(axNm(k)) + '</b><span class="v96cty-axv">' + E(head) + "</span>" + (parts.length || naWhy ? '<ul>' + parts.map(li).join("") + naWhy + "</ul>" : "") + "</div>";
      }).join("");
      return '<div class="v96cty-bdb" data-noi18n="1">' + (o.noIn ? "" : '<p class="v96cty-in">' + E(M("この商品で使った入力：", "Inputs from this product: ") + inpTxt(v.inp)) + '</p>') + blocks + '<p class="v96cty-f">' + E(formula) + "</p>" +
        '<p class="v96cty-note">' + E(M("★の行は、この商品（HS・カテゴリー・単価・保存）から付けた点です。商品を変えると、ここが変わります。運賃・日数は内蔵の参考レーン表の目安、手続きは出どころのある書類の判断の表（2026-11-08 確認）だけを使っています。", "Rows marked ★ come from this product (HS, category, unit price, storage) and change when the product changes. Freight and days are estimates from the built-in lane table; procedures come only from the sourced document decision table (checked 2026-11-08).")) + "</p></div>";
    } catch (e) { err("bd", e); return ""; }
  };
  // 商品が違えば何が変わるかを一言で（推奨の決め方の欄に足す）
  V96CTY.diffLine = function (rec) {
    try {
      const L = (rec || []).filter((r) => r && r.v96);
      if (!L.length) return "";
      const sum = (r, ax) => r.v96.P.filter((x) => x.ax === ax && /^(dt|dfree|frt|shelf|cold)/.test(x.k) && x.p && !x.na).reduce((a, x) => a + x.p, 0);
      const moved = L.filter((r) => sum(r, "reg") || sum(r, "mkt")).length;
      return M("この商品の HS・単価・保存条件から付けた点（★）が、" + moved + "か国で点数を動かしています（各国の「点数の内訳」）。", "Points from this product's HS, unit price and storage (★) change the score in " + moved + " countries (see each country's breakdown).");
    } catch (e) { return ""; }
  };

  /* 接続 AI に渡す依頼文に、国ごとの内訳（商材の当てはまり）を足す */
  if (typeof ctyAnalyzeAI === "function") {
    const __caa96 = ctyAnalyzeAI;
    ctyAnalyzeAI = async function (rec) { // eslint-disable-line no-global-assign
      const prev = V96CTY.aiRec;
      V96CTY.aiRec = Array.isArray(rec) ? rec : null;
      try { return await __caa96.apply(this, arguments); } finally { V96CTY.aiRec = prev; }
    };
  }
  const CTY_Q = /の販売先国を、候補\d+か国から3か国に絞り込む/;
  if (typeof llmAsk === "function") {
    const __la96c = llmAsk;
    llmAsk = function (q, maxTok, opts) { // eslint-disable-line no-global-assign
      try {
        if (typeof q === "string" && CTY_Q.test(q.slice(0, 600)) && q.indexOf("=== 商材の当てはまり") < 0) {
          // ctyRun は、分析の結果（rec）を店に入れる前に AI に渡す。AI に渡した rec を先に見る
          const s = typeof ctyStore === "function" ? ctyStore() : null;
          const rec = Array.isArray(V96CTY.aiRec) ? V96CTY.aiRec : (s && Array.isArray(s.rec)) ? s.rec : [];
          const lines = rec.filter((r) => r && r.v96).map((r) => r.c + "：" + r.v96.P.filter((x) => /^(dt|dfree|frt|shelf|cold|ban)/.test(x.k)).map((x) => (x.p ? ptTxt(x.p) + " " : "") + partTxt(x, r.c)).join("／"));
          if (lines.length) {
            const k = "=== 商品・会社の登録データ ===";
            const add = "=== 商材の当てはまり（内蔵の採点に入れた・国ごと。この商品の HS・印・単価・保存から。score はこれを入れたあとの点） ===\n" + lines.join("\n").slice(0, 3500) + "\n";
            q = q.indexOf(k) >= 0 ? q.replace(k, add + k) : q + "\n" + add;
          }
        }
      } catch (e) { err("ctyq", e); }
      return __la96c.apply(this, [q, maxTok, opts].concat([].slice.call(arguments, 3)));
    };
  }

  /* ════════════ R-5 自動車部品を初回の取り込みで中古車にしない（判定の入口） ════════════ */
  const PART_HS = ["8708", "8714", "6813", "4011", "4012", "4013", "8511", "8512", "8409", "8483"];
  const VEH_HS = ["8701", "8702", "8703", "8704", "8705", "8711"];
  const RE_PART_NM = /ブレーキ|パッド|ライニング|ローター|キャリパー|部品|パーツ|補修用|純正品|社外品|互換品|フィルター|ワイパー|プラグ|ベルト|ショック|マフラー|ラジエ|オルタネーター|クラッチ|ベアリング|タイヤ|ホイール|ランプ|バルブ|\bparts?\b|\bpads?\b|brake|filter|wiper|spark\s*plug|bearing|tyre|tire/i;
  const RE_VEH_NM = /中古(?:車|自動車|乗用車|トラック|バス|二輪|バイク)|(?:^|[^部])車両本体|^(?:乗用車|自動車|トラック|バス)(?:\s|$)|used\s*(?:car|vehicle|truck)/i;
  function carGuard(t, why) {
    try {
      if (!t || typeof t !== "object") return false;
      if (t.v95catUser || t.v92catWhy === "商品情報の画面で選び直し") return false;
      const nm = [t.item, t.itemEn].filter(Boolean).join(" ");
      const hs = digits(t.hs), h4 = hs.slice(0, 4);
      const cat0 = String(t.cat || "").trim();
      // HS 87.08（自動車の部品・附属品）は、自動の判定が工業部品・未分類でも自動車部品に（区分の中身 catKey は parts のまま＝規制・書類は同じ）
      if (h4 === "8708" && (cat0 === "工業部品" || cat0 === "" || cat0 === "その他") && t.catKey !== "car" && !/自転車|bicycle/i.test(nm)) {
        if (typeof v95pSetAuto === "function") v95pSetAuto(t, "HS " + hsFmt(hs) + "（自動車の部品・附属品）から自動車部品と判断");
        else { t.cat = "自動車部品"; t.catKey = "parts"; }
        t.v96carGuard = why || 1;
        V96CTY.n.car++;
        return true;
      }
      if (!(cat0 === "中古車" || t.catKey === "car")) return false;
      if (hs.length >= 4 && VEH_HS.indexOf(h4) >= 0) return false;
      if (/自転車|bicycle/i.test(nm)) return false;
      // HS が部品・附属品の項なら、それを先に信じる（利用者・資料が書いた HS）。品名だけのときは、品名が車両そのものでないこと
      const byHs = hs.length >= 4 && PART_HS.indexOf(h4) >= 0;
      const vehNm = !!nm && (RE_VEH_NM.test(nm) || (typeof V95P_VEHNM !== "undefined" && V95P_VEHNM.test(nm)));
      const byNm = !!nm && !vehNm && (RE_PART_NM.test(nm) || (typeof V95P_PART !== "undefined" && V95P_PART.test(nm)));
      if (!byHs && !byNm) return false;
      const msg = byHs ? "HS " + hsFmt(hs) + "（部品・附属品）" + (byNm ? "と品名" : "") + "から自動車部品と判断（資料の中古車の語は、適合する車の説明として扱いました）"
        : "品名から自動車部品と判断（資料の中古車の語は、適合する車の説明として扱いました）";
      if (typeof v95pSetAuto === "function") v95pSetAuto(t, msg);
      else { t.cat = "自動車部品"; t.catKey = "parts"; t.v92catWhy = msg; if (!t.compTitle || /車両情報表/.test(String(t.compTitle))) t.compTitle = "材質・素材表"; }
      t.v96carGuard = why || 1;
      V96CTY.n.car++;
      return true;
    } catch (e) { err("car", e); return false; }
  }
  V96CTY.carGuard = carGuard;
  ["fileToTenant", "entriesToTenant"].forEach((nm) => {
    try {
      const f = W[nm];
      if (typeof f !== "function" || f._v96c) return;
      const g = function () {
        const out = f.apply(this, arguments);
        const fix = (t) => { try { carGuard(t, nm); if (t && t._pend && Array.isArray(t._pend.prods)) t._pend.prods.forEach((p) => { if (p && p.x) carGuard(p.x, nm); }); } catch (e) { err(nm, e); } return t; };
        return (out && typeof out.then === "function") ? out.then(fix) : fix(out);
      };
      g._v96c = 1;
      W[nm] = g;
    } catch (e) { err("wrap " + nm, e); }
  });
  if (typeof adoptReal === "function") {
    const __ar96 = adoptReal;
    adoptReal = function (t) { // eslint-disable-line no-global-assign
      try { carGuard(t, "adoptReal"); } catch (e) { err("adopt", e); }
      return __ar96.apply(this, arguments);
    };
  }
  // 判定そのもの（文だけで決める detectCat）も：文に HS 87.08 などの部品の項が書かれていれば、中古車にしない
  if (typeof detectCat === "function") {
    const __dc96 = detectCat;
    detectCat = function (all) { // eslint-disable-line no-global-assign
      const r = __dc96.apply(this, arguments);
      try {
        if (r === "car") {
          const s = String(all || "");
          const m = s.match(/(?:hs|ＨＳ|関税|品目|分類)[^\d\n]{0,12}(\d{4})[.．]?(\d{2})?/i);
          if (m && PART_HS.indexOf(m[1]) >= 0) return "parts";
        }
      } catch (e) { err("detect", e); }
      return r;
    };
  }

  /* ════════════ No.515・No.508 規制の AI 詳細調査：Web 検索のエラーは自動で1回だけ再試行・一般知識の結果の先頭に明示 ════════════ */
  const REGQ = /^([^\n「」]{1,40}?)向けに日本から「[\s\S]{0,600}?最新の輸入規制を、Web検索で確認して/;
  const R10 = () => W.__v2192r10w || null;
  // Web 検索で確かめられたか（21.94 の r10w の結果を読む）
  function webOk(r) {
    if (!r || typeof r !== "object") return false;
    const x = r.r10w;
    if (x) return !!(x.web && x.n > 0);
    return !!((r.cits && r.cits.length) || (r.extHits && r.extHits.length));
  }
  // 再試行して意味がある失敗か（設定で Web 検索が使えない・添付つき などは、何度試しても同じ）
  function retryable(r) {
    const x = r && r.r10w;
    if (x) {
      if (x.web) return !(x.n > 0); // 出典が返らなかった
      return x.why === "fallback";   // 検索に対応した AI がエラーで、検索なしの AI に切り替わった
    }
    return /がエラーのため自動切替/.test(String((r && r.why) || ""));
  }
  V96CTY.webOk = webOk;
  function sumOf(r, e) {
    const x = (r && r.r10w) || {};
    return { web: x.web ? 1 : 0, n: x.n || 0, why: x.why || (e ? "error" : ""), prov: x.prov || (r && r.prov) || "", err: String(x.err || (e && (e.message || e)) || "").slice(0, 120) };
  }
  function busyMsg(c, k) {
    try {
      const o = document.getElementById("regaiO");
      if (!o || (W.V54ASK && V54ASK.c && V54ASK.c !== c)) return;
      o.innerHTML = '<div class="rw v96reg-busy" role="status"><span class="spin"></span>' + E(k === "err"
        ? M("1回目の調査がエラーになりました。Web 検索つきで、自動でもう一度調べています（1回だけ）…", "The first research attempt failed. Retrying automatically with web search (once)…")
        : M("1回目は Web 検索で確かめられませんでした（検索に対応した AI のエラー・出典なし）。Web 検索つきで、自動でもう一度調べています（1回だけ）…", "The first attempt could not be checked by web search (search-capable AI error / no sources). Retrying automatically with web search (once)…")) + "</div>";
    } catch (e) { /* 表示だけ */ }
  }
  const wait = (ms) => new Promise((res) => setTimeout(res, ms));
  if (typeof llmAsk === "function") {
    const __la96r = llmAsk;
    llmAsk = async function (q, maxTok, opts) { // eslint-disable-line no-global-assign
      const args = [].slice.call(arguments);
      let c = "";
      try { const m = typeof q === "string" && opts && opts.forceWeb ? REGQ.exec(q) : null; c = m ? m[1] : ""; } catch (e) { c = ""; }
      if (!c || (opts && opts._v96rt)) return __la96r.apply(this, args);
      const o2 = Object.assign({}, opts || {}, { _v96rt: 1 });
      // 「AI商社マンが考え中」の表示を、再試行が終わるまで出したままにする（1回目の終わりで「完了しました」と出さない）
      let hold = 0;
      try { if (typeof aiThinkStart === "function") hold = aiThinkStart(typeof aiThinkLabel === "function" ? aiThinkLabel(q, opts) : "", ""); } catch (e) { hold = 0; }
      const end = (ok) => { try { if (hold && typeof aiThinkEnd === "function") aiThinkEnd(hold, ok); } catch (e) { /* 表示だけ */ } hold = 0; };
      let r1 = null, e1 = null;
      try { r1 = await __la96r.apply(this, args); } catch (e) { e1 = e; }
      if (r1 && (webOk(r1) || !retryable(r1))) { end(true); return r1; }
      // 自動の再試行（1回だけ）。21.94 の道（Web 検索の対応 AI へ回す）をそのまま通す
      const first = sumOf(r1, e1);
      busyMsg(c, e1 ? "err" : "web");
      V96CTY.n.retry++;
      await wait(1200);
      let r2 = null, e2 = null;
      try { r2 = await __la96r.call(this, q, maxTok, o2); } catch (e) { e2 = e; }
      const ok = !!(r2 && webOk(r2));
      const rec = { c, at: Date.now(), n: 1, ok: ok ? 1 : 0, first, second: sumOf(r2 || r1, e2) };
      V96CTY.rtPend[c] = rec;
      end(!!(r2 || r1));
      if (r2) return r2;
      if (r1) return r1;
      throw e2 || e1;
    };
  }
  // 結果のメモ（regStore の項目）に、再試行の記録を残す
  if (typeof regAIView === "function") {
    const __rv96 = regAIView;
    regAIView = function (c, html) { // eslint-disable-line no-global-assign
      const r = __rv96.apply(this, arguments);
      try {
        const cc = String(c || "");
        const st = typeof regStore === "function" ? regStore()[cc] : null;
        const P = V96CTY.rtPend[cc];
        if (st && P && typeof html === "string" && html === st.h) { st.v96rt = P; delete V96CTY.rtPend[cc]; try { if (typeof saveTen === "function") saveTen(); } catch (e) { /* 保存は次の機会 */ } }
        if (typeof V96CTY.paintReg === "function") { V96CTY.paintReg(cc); setTimeout(() => V96CTY.paintReg(cc), 0); setTimeout(() => V96CTY.paintReg(cc), 600); }
      } catch (e) { err("regView", e); }
      return r;
    };
  }
  // 「確認できなかった項目」を見出し（①〜⑥）ごとに拾う
  const SEC = [["①", "auth"], ["②", "reg"], ["③", "docs"], ["④", "label"], ["⑤", "duty"], ["⑥", "chg"]];
  const SECN = { auth: ["規制当局と根拠制度", "Regulator and legal basis"], reg: ["輸入登録・認証", "Import registration / certification"], docs: ["必要書類", "Required documents"], label: ["ラベル・表示", "Labelling"], duty: ["関税・税", "Duties and taxes"], chg: ["直近1年の変更・注意点", "Changes in the past year"] };
  const RE_UNK = /確認できませんでした|確認できない|確認できず|不明です|不明。|分かりません|わかりません|情報が(?:見つかり|得られ)ませんでした|unable to confirm|could not (?:be )?(?:confirm|verif)|not (?:be )?confirmed/i;
  V96CTY.secs = function (txt) {
    const s = String(txt || "");
    const out = [];
    SEC.forEach(([mk, k], i) => {
      const a = s.indexOf(mk);
      if (a < 0) { out.push({ k, mk, miss: 1, t: "" }); return; }
      let b = s.length;
      for (let j = i + 1; j < SEC.length; j++) { const x = s.indexOf(SEC[j][0], a + 1); if (x >= 0) { b = x; break; } }
      const t = s.slice(a, b);
      out.push({ k, mk, t, unk: RE_UNK.test(t) ? 1 : 0 });
    });
    return out;
  };
  V96CTY.secNm = (k) => M(SECN[k][0], SECN[k][1]);
  // 関税の公式の検索（国→頁）。ここに無い国は JETRO の「世界各国の関税率」と ITC の Market Access Map
  const EU_CC = ["AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE"];
  function dutySrc(c) {
    const L = [];
    let cc = "";
    try { cc = typeof v85docCC === "function" ? v85docCC(c) : ""; } catch (e) { cc = ""; }
    try { const R = W.V95REG && V95REG.DUTYFREE ? V95REG.DUTYFREE[cc] : null; if (R && R.u) L.push({ t: M(R.src[0], R.src[1]), u: R.u }); } catch (e) { /* 無い版 */ }
    if (cc === "US") L.push({ t: M("米国 国際貿易委員会（USITC）HTS の検索（HS から税率）", "USITC Harmonized Tariff Schedule search"), u: "https://hts.usitc.gov/" });
    if (cc === "GB") L.push({ t: M("英国政府『Trade Tariff』（HS から税率）", "UK Government Trade Tariff"), u: "https://www.trade-tariff.service.gov.uk/" });
    if (EU_CC.indexOf(cc) >= 0) L.push({ t: M("欧州委員会『Access2Markets』（HS と国から関税・必要な手続き）", "European Commission Access2Markets (duties and requirements by HS)"), u: "https://trade.ec.europa.eu/access-to-markets/en/home" });
    L.push({ t: M("JETRO『世界各国の関税率』（HS から各国の税率）", "JETRO World Tariff (duty rates by HS)"), u: "https://www.jetro.go.jp/theme/export/tariff/" });
    L.push({ t: M("ITC『Market Access Map』（国・HS ごとの関税）", "ITC Market Access Map (duties by country and HS)"), u: "https://www.macmap.org/" });
    return L;
  }
  // 判断の表（この国）の出どころ。規制当局・登録・書類・表示の確かめ先
  function dtSrc(c) {
    const L = [];
    try {
      const F0 = docFacts();
      const dt = dtOf(c, F0);
      // この国に限った行の出どころだけ（どの国にも共通の行の出どころは、別の国の頁のことがある）
      if (dt && !dt.nohs && !dt.nocc) dt.req.concat(dt.con).forEach((x) => { if (x.u && !L.some((y) => y.u === x.u) && L.length < 4) L.push({ t: docNm(x.k) + (x.s ? M("（" + x.s.slice(0, 60) + "）", " (" + x.s.slice(0, 60) + ")") : ""), u: x.u }); });
    } catch (e) { err("dtSrc", e); }
    return L;
  }
  V96CTY.srcOf = function (c, k) {
    if (k === "duty") return dutySrc(c);
    const L = dtSrc(c);
    if (k === "chg") L.unshift({ t: M("JETRO『ビジネス短信』（国・地域の最新の制度の変更）", "JETRO Biz News (latest regulatory changes)"), u: "https://www.jetro.go.jp/biznews/" });
    L.push({ t: M("JETRO『国・地域別に見る』（貿易・投資制度）", "JETRO country pages (trade and investment rules)"), u: "https://www.jetro.go.jp/world/" });
    return L.slice(0, 5);
  };
  // 輸入者への質問（英語・項目ごと）
  V96CTY.askOf = function (c, k) {
    const d = dd() || {}, t = ten() || {};
    const item = d.itemEn || t.itemEn || d.item || t.item || "our product";
    const hs = hsFmt(d.hs || t.hs || "");
    let cn = c;
    try { const cc = typeof v85docCC === "function" ? v85docCC(c) : ""; if (cc && typeof Intl !== "undefined" && Intl.DisplayNames) cn = new Intl.DisplayNames(["en"], { type: "region" }).of(cc) || c; } catch (e) { cn = c; }
    if (/^(United |Netherlands$|Philippines$)/.test(cn)) cn = "the " + cn;
    const P = "\"" + item + "\"" + (hs ? " (HS " + hs + ")" : "");
    const Q = {
      auth: "Which authority regulates the import and sale of " + P + " in " + cn + ", and under which law or standard?",
      reg: "Before import or sale of " + P + " in " + cn + ", are any registrations, licences, notifications or certifications required (by you as the importer, or by us)? How long do they take?",
      docs: "Which documents do you need from us for the import clearance of " + P + " in " + cn + " (e.g. certificate of origin, health certificate, test reports)?",
      label: "What labelling is mandatory for " + P + " in " + cn + " (language, mandatory items, stickers allowed)?",
      duty: "Could you confirm the import duty rate and other taxes (VAT/GST, excise) for " + P + " in " + cn + ", including any additional duties?",
      chg: "Have there been any changes in the past year to the import rules for " + P + " in " + cn + " that we should know about?"
    };
    return Q[k] || Q.reg;
  };
})();
