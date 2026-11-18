/* ═══ v21.97 cty（2026-11-18 第10回相当 UAT・21.96 に対して）販売先国・規制の AI 詳細調査・AI 相談の数字の根拠（中身。見せ方は rd_v97cty.js）
   土台・前の層（v95/logic_v2195reg.js・v96/logic_v2196cty.js ほか）は書き換えず、前の関数を控えてから包む。
   No.536（中）H おやつ（HS 2309.10）の販売先分析で、香港の要約は「関税なし」・詳細は「関税 要確認」
     原因：21.96 は、ひな形の無い商材の香港・シンガポールで「HS から関税なし」を採点（r.v96 の dfree）と要点の文（ctyWhyLocal）にだけ入れていた。
           国の事実（ctyFacts の f.duty）は regsFor の「要確認」のままで、推奨の国の詳細（📋 規制：関税 要確認）・リスク（規制・関税が未確認）・
           国別戦略（価格根拠の関税 要確認・「規制のひな形が無いため、関税・必要書類は要確認」）・AI に渡す事実（duty 要確認）・規制の画面は「要確認」。
           同じ根の食い違いがもう1つ：詳細の「必要書類」は基本の3点だけで、点数の内訳（書類の判断の表）にある、この商品とこの国で要る手続き
           （例：アメリカ FDA の施設登録・事前通報、シンガポール AVS の許可）が出ていなかった。
     直し：関税の判定を1か所（regsFor の結果）に入れる。ひな形の無い・国の税率が「要確認」の行で、登録の HS（推定でない・4桁以上）が
           香港・シンガポールの課税の区分に当たらなければ（21.95 の決め D3・V95REG.dutyFree・車両は除く）、規制の表そのものを「関税 0%」にし、
           21.95 と同じ印（v95own）を付ける（規制の画面の「関税なし」の説明・出どころの表示がそのまま出る）。注意書きの「関税・必要書類は基本のものだけ」は
           「関税は HS から判定・必要書類は基本のものだけ」に。採点は 21.96 と同じ（ひな形の有無 known は「無い」のまま・dfree +15）。
           ここから作る国の事実・推奨の国の詳細・リスク・国別戦略・AI に渡す事実・営業資料（21.96 No.512 は規制の画面の値を使う）が、同じ値になる。
           推奨の国の詳細と国別戦略の「必要書類」に、書類の判断の表で当たる手続き（必須・条件つき・共通）を足す（内訳と同じもの）。
           前の版で保存した分析（facts が要確認のまま）も、表示のときに同じ判定にそろえる。HS が推定のときは、どこでも「関税なし」と言わない（営業資料と同じ）。
           要約（AI の総評・国ごとの理由・リスク）と詳細の関税を照らし合わせ、食い違いがあれば分析の結果に出す（V97CTY.audit）。
           国別戦略（AI の調査）の関税が、アプリの判定と違う・要確認のときは、アプリの判定（出どころつき）を並べる。
   No.517（条件つき）同じ商材でも、第9回から推奨・点数が説明なく変わる（A：タイ→韓国、E：アメリカを外してイギリス）
     原因：① 推奨の3か国は、AI が接続されていると AI の top3 で決まる（実行ごとに揺れる）。前回の推奨も、変えた理由も残していなかった。
           ② 競合の「価格の比較」が、その画面の間に最後に開いた推奨FOB（window.__fobLast：別の商品のことも・AI の値・開いていなければ無し）で
              決まっていた＝同じ商品・同じ入力でも、画面の開き方で点が変わる。
           ③ 市場性・バイヤーの点は「候補国の中で最大の国」を基準にした割合のため、候補国が変わるとほかの国の点も動く（説明が無かった）。
     直し：・価格の比較は、この商品の価格表の単価（いちばん安い段・US$）と市場平均で決める（推奨FOB の画面を開いたかどうかで変わらない）。内訳に両方の数字。
           ・分析のたびに、商品ごとに結果を記録（入力・候補国・進出希望国・推奨・誰が決めたか・国ごとの点と内訳・事実。直近4回）。
             前回と比べて、推奨・点数が変わったら「何が変わったか・なぜか」を出す（入力・候補国・進出希望国・観点の点・内訳の行・バイヤー数・統計・AI の判断）。
           ・AI に渡す依頼に、前回の推奨と点・前回からの変化を足し、「入力・点数に意味のある変化が無ければ前回と同じ3か国を保つ／変えるなら理由（change）」を頼む。
             AI の答えの change を記録して出す。
   No.515・No.508（未解消）規制の AI 詳細調査が、G・H で Web 検索エラーのため一般知識に切り替わる
     原因：21.96 は1回だけ・1.2秒後にもう一度調べる作り。失敗の中身（AI の会社の混み合い〔529〕・上限〔429〕・時間切れ・設定〔400/401/403〕）を見ていない。
           本体の自動切り替え（llmAsk の外側）が1つ目のエンジンのエラーを捨てるので、利用者に「なぜ」が出ず、何度押しても同じかどうかも分からなかった。
     直し：・AI の会社への依頼の答え（状態・エラーの種類）を記録し（fetch のいちばん外）、一時的な失敗（混み合い・429・5xx・時間切れ・通信）と、
             何度やっても同じ失敗（設定・キー・上限・Web 検索が使えない設定）を見分ける。
           ・一時的な失敗は、最大3回まで、間を空けて（4秒・12秒）調べ直す。2回目からは Web 検索に対応したエンジンだけで（検索なしの AI に黙って切り替えない）、
             同期サーバーを通る依頼は検索の回数を減らして軽くする（5→3回）。3回目は、ほかに検索に対応したエンジンがあればそちらで。
           ・それでも確かめられないときは、何回・どのエンジンで・なぜ失敗したか、何度やっても同じかを出し、
             「アプリの内蔵データで分かっていること（出どころ・確かめた日）」（関税の判定・書類の判断の表の手続き・規制のひな形）を、AI の下書きと分けて出す。
             「⏰ 10分後にもう一度調べる」（この画面を開いている間）と、「今もう一度調べる」を置く（見せ方は rd）。
   No.537（低）H の境界の計算（500個×$4.00=$2,000）は正しいのに「社内データと出典に見つかりませんでした」と点線になり、価格帯の名前も無い
     原因：21.84 の「AI の答えの数字の印」（v84cfAnsMark）は、社内データ・質問にそのまま出てくる数字だけを根拠ありとする。価格表から計算した合計は根拠なし扱い。
     直し：質問（または答え）の数量と、この商品の価格表の段（数量の範囲）から、当たる段・単価・合計を計算する。答えの合計がそれと合えば点線にせず、
           答えの下に「計算の根拠（この商品の価格表）：『段の名前（数量の範囲）』単価 × 数量 ＝ 合計」を出す。合わないときは、価格表から計算した値を並べて確かめを促す。
   同期サーバーは変えない。 */
var V97CTY = window.V97CTY = { v: "21.97", err: [], n: { own: 0, facts: 0, migr: 0, snap: 0, aiPrev: 0, rt: 0, rtOk: 0, calc: 0, calcNg: 0, audit: 0 }, flog: [], light: 0, later: {} };
(function () {
  "use strict";
  const W = window;
  const err = (k, e) => { try { V97CTY.err.push(k + ": " + String((e && e.message) || e).slice(0, 160)); if (V97CTY.err.length > 40) V97CTY.err.shift(); } catch (x) { /* 記録だけ */ } };
  V97CTY.errf = err;
  const lang = () => { if (V97CTY._ja) return "ja"; try { const el = document.getElementById("lang"); const l = String((typeof I18N !== "undefined" && I18N && I18N.lang) || (el && el.value) || "ja"); return /^en/.test(l) ? "en" : /^zh/.test(l) ? "zh" : /^es/.test(l) ? "es" : "ja"; } catch (e) { return "ja"; } };
  const M = (ja, en, zh, es) => { const l = lang(); return l === "en" ? (en || ja) : l === "zh" ? (zh || en || ja) : l === "es" ? (es || en || ja) : ja; };
  V97CTY.M = M; V97CTY.lang = lang;
  const E = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  V97CTY.E = E;
  const digits = (s) => String(s == null ? "" : s).replace(/[^\d]/g, "");
  const hsFmt = (h) => { h = digits(h); return h.length >= 6 ? h.slice(0, 4) + "." + h.slice(4, 6) : h; };
  const dd = () => { try { return (typeof D !== "undefined" && D) ? D : null; } catch (e) { return null; } };
  const ten = () => { try { return (typeof TEN !== "undefined" && TEN) ? TEN : null; } catch (e) { return null; } };
  const V95 = () => (W.V95REG || null);
  const V96 = () => (W.V96CTY || null);
  const store = () => { try { return typeof ctyStore === "function" ? ctyStore() : null; } catch (e) { return null; } };
  /* 固定の文の訳（アプリの辞書に足す＝画面の訳の仕組みがそのまま訳す） */
  function addDict(ja, en, zh, es) {
    try {
      if (typeof I18N === "undefined" || !I18N || !I18N.dict || !ja) return;
      const X = { en, zh: zh || en, es: es || en };
      ["en", "zh", "es"].forEach((l) => { if (I18N.dict[l] && X[l] && !I18N.dict[l][ja]) I18N.dict[l][ja] = X[l]; });
    } catch (e) { /* 訳が無いだけ */ }
  }
  V97CTY.addDict = addDict;

  /* ════════════ No.536 関税の判定を1か所に ════════════ */
  // どの商品の規制の表を作っているか（tenantToD の中＝営業資料などの別の商品・それ以外は表示中の商品）
  let CTX = null;
  if (typeof tenantToD === "function") {
    const __td97 = tenantToD;
    tenantToD = function (t) { const prev = CTX; CTX = t || null; try { return __td97.apply(this, arguments); } finally { CTX = prev; } }; // eslint-disable-line no-global-assign
  }
  function prodNow() {
    if (CTX) return { p: CTX, t: CTX };
    let p = null, t = null;
    try { if (typeof V68REG !== "undefined" && V68REG && V68REG.cur) p = V68REG.cur; } catch (e) { /* 次へ */ }
    try { if (typeof PID !== "undefined" && PID === "custom") t = ten(); } catch (e) { /* 次へ */ }
    if (!p) p = dd() || t || ten();
    if (!t && p && p === ten()) t = p;
    return { p, t };
  }
  // 登録の HS（推定の HS では「関税なし」と言わない＝営業資料〔21.96 No.512〕の判定と同じ）
  function regHs() {
    const x = prodNow();
    const hs = digits(x.p && x.p.hs);
    let guess = !!(x.t && x.t.hsGuess);
    try { if (!guess && x.p && x.p.hsGuess) guess = true; } catch (e) { /* 無視 */ }
    return { hs, guess, ok: hs.length >= 4 && !guess };
  }
  V97CTY.regHs = regHs;
  const VEH4 = ["8701", "8702", "8703", "8704", "8705", "8711"];
  // V95REG.dutyFree（21.96 の採点・要点の文が使う）も、推定の HS では空にする（どこでも同じ判定）
  try {
    const R = V95();
    if (R && typeof R.dutyFree === "function" && !R.dutyFree._v97) {
      const __df = R.dutyFree;
      R.dutyFree = function (c, hs) {
        try {
          const h = digits(hs), g = regHs();
          if (g.guess && h && g.hs && h === g.hs) return "";
          if (VEH4.indexOf(h.slice(0, 4)) >= 0) return "";
        } catch (e) { err("df", e); }
        return __df.apply(this, arguments);
      };
      R.dutyFree._v97 = 1;
    }
  } catch (e) { err("dfwrap", e); }
  const NOTPL_DUTY = "関税・必要書類は基本のものだけで、";
  function ownWarn(w, cc, hsTxt) {
    const s = String(w || "");
    if (s.indexOf(NOTPL_DUTY) < 0) return s;
    const nm = cc === "SG" ? "シンガポール" : "香港";
    const add = "関税は、この商品の HS（" + hsTxt + "）から判定しました（" + nm + "：関税なし・税関の一覧から）。必要書類は基本のものだけで、";
    const out = s.replace(NOTPL_DUTY, add);
    const tail = (k) => ({ en: "Duty was judged from this product's HS (" + hsTxt + ") (" + (cc === "SG" ? "Singapore" : "Hong Kong") + ": no customs duty, per the customs list). ", zh: "关税已按本商品的HS（" + hsTxt + "）判定（" + (cc === "SG" ? "新加坡" : "香港") + "：无关税，依据海关清单）。", es: "El arancel se determinó con el HS de este producto (" + hsTxt + ") (" + (cc === "SG" ? "Singapur" : "Hong Kong") + ": sin arancel, según la lista de aduanas). " })[k];
    try {
      const base = (typeof I18N !== "undefined" && I18N && I18N.dict) ? I18N.dict : null;
      if (base) ["en", "zh", "es"].forEach((l) => { const t0 = base[l] && base[l][s]; if (t0 && base[l] && !base[l][out]) base[l][out] = tail(l) + t0; });
    } catch (e) { /* 訳が無いだけ */ }
    return out;
  }
  function ownSet(c, r) {
    try {
      if (!r || typeof r !== "object" || r.v95own || r.v95proxy || r.v70mktHk) return false;
      if (!/要確認/.test(String(r.duty == null ? "" : r.duty))) return false;
      const g = regHs();
      if (!g.ok) return false;
      const R = V95();
      if (!R || typeof R.dutyFree !== "function") return false;
      const cc = R.dutyFree(c, g.hs);
      if (!cc) return false;
      const hsTxt = hsFmt(g.hs);
      Object.defineProperty(r, "v95own", { value: { cc, duty: r.duty, dutyBase: r.dutyBase, dutyNote: r.dutyNote, dutyCell: r.dutyCell, warn: r.warn, hs: hsTxt, noHs: false, v97: 1 }, enumerable: false, configurable: true, writable: true });
      r.duty = "0%";
      if (r.dutyTpl != null) r.dutyTpl = "0%";
      if (typeof r.warn === "string") r.warn = ownWarn(r.warn, cc, hsTxt);
      V97CTY.n.own++;
      return true;
    } catch (e) { err("own " + c, e); return false; }
  }
  V97CTY.ownSet = ownSet;
  if (typeof regsFor === "function") {
    const __rf97 = regsFor;
    regsFor = function (cat, targets) { // eslint-disable-line no-global-assign
      const out = __rf97.apply(this, arguments);
      try { Object.keys(out || {}).forEach((c) => ownSet(c, out[c])); } catch (e) { err("regsFor", e); }
      return out;
    };
  }
  // 表示中の商品の表（D.regs）：前に作られていた表にも当てる（規制の画面・営業資料は D.regs を読む）
  function fixD() {
    try {
      const d = dd(); if (!d || !d.regs) return 0;
      try { if (typeof PRODUCTS !== "undefined" && PRODUCTS && ten() && d === PRODUCTS[ten().catKey]) return 0; } catch (e) { /* 次へ */ }
      let n = 0; Object.keys(d.regs).forEach((c) => { if (ownSet(c, d.regs[c])) n++; }); return n;
    } catch (e) { err("fixD", e); return 0; }
  }
  V97CTY.fixD = fixD;
  if (typeof rReg === "function") { const __rr97 = rReg; rReg = function () { try { fixD(); } catch (e) { /* 無視 */ } return __rr97.apply(this, arguments); }; } // eslint-disable-line no-global-assign
  if (typeof switchTen === "function") { const __sw97 = switchTen; switchTen = function () { const r = __sw97.apply(this, arguments); try { fixD(); } catch (e) { err("sw", e); } return r; }; } // eslint-disable-line no-global-assign

  // 関税なしの出どころ（表示用）
  function freeInfo(cc) {
    try {
      const R = V95() && V95().DUTYFREE ? V95().DUTYFREE[cc] : null;
      if (!R) return null;
      return { cc, u: R.u, src: R.src, tax: R.tax, cats: R.cats };
    } catch (e) { return null; }
  }
  V97CTY.freeInfo = freeInfo;
  const priceUsd = () => { try { const v = V96() && typeof V96().inputs === "function" ? V96().inputs() : null; return v && v.usd != null ? +v.usd : null; } catch (e) { return null; } };
  // この商品の価格表 → 市場平均と同じ単位の単価（kg の統計なら1kg あたりに直す。直せないときは比べない）
  function usdOfCell(s) {
    const t = String(s == null ? "" : s).normalize("NFKC");
    let m = t.match(/(?:US\s*\$|USD\s*|\$)\s*([\d,]+(?:\.\d+)?)/i) || t.match(/([\d,]+(?:\.\d+)?)\s*(?:USD|米ドル|ドル)/i);
    if (m) return +m[1].replace(/,/g, "");
    m = t.match(/[¥￥]\s*([\d,]+(?:\.\d+)?)/) || t.match(/([\d,]+(?:\.\d+)?)\s*円/);
    if (m) { let r = 150; try { const f0 = typeof v54fobRate === "function" ? +v54fobRate() : 0; if (f0 > 0) r = f0; } catch (e) { /* 150 */ } return +m[1].replace(/,/g, "") / r; } // eslint-disable-line no-undef
    return null;
  }
  const kgOf = (s) => { const m = String(s == null ? "" : s).normalize("NFKC").match(/(\d+(?:\.\d+)?)\s*(kg|g)(?![a-z])/i); return m ? (+m[1]) * (/^kg$/i.test(m[2]) ? 1 : 0.001) : null; };
  function priceCmp(f) {
    try {
      const up = +f.upunit || 0;
      if (!(up > 0)) return null;
      const unit = String(f.unit || "");
      const d = dd(), t = ten();
      const rows = (d && Array.isArray(d.priceRows) && d.priceRows.length ? d.priceRows : (t && t.priceRows) || []).map((r) => (Array.isArray(r) ? r : [r]));
      if (!rows.length) return { up, why: "noprice" };
      const lows = rows.map((r) => { let lo = null; r.forEach((c) => { const v = usdOfCell(c); if (v > 0 && (lo == null || v < lo)) lo = v; }); return lo; });
      if (/kg|キロ/i.test(unit)) {
        const P = f.upkg > 0 ? +f.upkg : up;
        const itemKg = kgOf(d && d.item) || kgOf(t && t.item);
        let best = null;
        rows.forEach((r, i) => {
          if (!(lows[i] > 0)) return;
          const kg = r.map(kgOf).find((x) => x > 0) || (rows.length === 1 ? itemKg : null);
          if (!kg) return;
          const it = { ours: lows[i] / kg, row: r.map((c) => String(c || "")).find((c) => kgOf(c)) || "", kg };
          if (!best || (itemKg && Math.abs(kg - itemKg) < 1e-9 && Math.abs(best.kg - itemKg) > 1e-9)) best = it;
        });
        if (!best) return { up: P, per: "kg", why: "noweight" };
        return { ours: Math.round(best.ours * 100) / 100, up: P, per: "kg", row: best.row.slice(0, 24) };
      }
      if (/^(?:個|台|本|枚|足|組|頭|対|u|no|pcs?|pieces?|number|units?)$/i.test(unit.trim()) || /個|台|本|枚/.test(unit)) {
        const lo = lows.filter((x) => x > 0).sort((a, b) => a - b)[0];
        return lo ? { ours: lo, up, per: "unit" } : { up, why: "noprice" };
      }
      return { up, why: "unit" };
    } catch (e) { err("priceCmp", e); return null; }
  }
  V97CTY.priceCmp = priceCmp;
  // 国の事実：ひな形の有無は前と同じ（関税だけ分かった＝ known は false のまま）。価格の比較はこの商品の価格表から
  if (typeof ctyFacts === "function") {
    const __cf97 = ctyFacts;
    ctyFacts = function (c, S) { // eslint-disable-line no-global-assign
      const f = __cf97.apply(this, arguments);
      try {
        if (f && typeof f === "object") {
          let reg = null;
          try { reg = regsFor(typeof ctyCatKey === "function" ? ctyCatKey() : "", [c])[c]; } catch (e) { reg = null; }
          const own = reg && reg.v95own;
          if (own && own.v97) {
            f.known = false;
            f.duty = "0%";
            f.dutyN = 0;
            f.v97df = { cc: own.cc, hs: own.hs };
            V97CTY.n.facts++;
          }
          /* No.517 ②：価格の比較＝この商品の価格表と市場平均（通関統計の単価）。単位をそろえられるときだけ比べる */
          const pc = priceCmp(f);
          if (pc && pc.ours > 0 && pc.up > 0) {
            f.priceAdv = pc.ours <= pc.up * 1.05 ? 1 : -1;
            const u = pc.per === "kg" ? "/kg" : "";
            f.priceNote = "当社の価格表 $" + pc.ours.toFixed(2) + u + (pc.row ? "（" + pc.row + "）" : "") + (f.priceAdv > 0 ? " ≦ " : " ＞ ") + "市場平均 $" + pc.up.toFixed(2) + u + (f.priceAdv > 0 ? "（価格競争力あり）" : "（価格の説明材料が必要）");
          } else { f.priceAdv = 0; f.priceNote = ""; }
          f.v97price = pc ? { usd: pc.ours || null, up: pc.up || null, per: pc.per, row: pc.row || "", why: pc.why || "" } : null;
        }
      } catch (e) { err("facts " + c, e); }
      return f;
    };
  }
  // 価格の比較の内訳の行に、両方の数字を入れる（表示は v96 の partTxt の包み）
  if (typeof ctyScoreAll === "function") {
    const __csa97 = ctyScoreAll;
    ctyScoreAll = function (facts, S) { // eslint-disable-line no-global-assign
      const L = __csa97.apply(this, arguments);
      try {
        (L || []).forEach((r) => {
          const P = r && r.v96 && r.v96.P, f = r && r.facts;
          if (!P || !f) return;
          const pr = P.find((x) => x.k === "price");
          if (pr && f.v97price) { pr.usd = f.v97price.usd; pr.up = f.v97price.up; pr.per = f.v97price.per; pr.row = f.v97price.row; }
          if (f.v97df) { const df = P.find((x) => x.k === "dfree"); if (df) df.cc = f.v97df.cc; }
        });
      } catch (e) { err("score", e); }
      return L;
    };
  }
  try {
    const V = V96();
    if (V && typeof V.partTxt === "function" && !V.partTxt._v97) {
      const __pt = V.partTxt;
      V.partTxt = function (x, c) {
        try {
          if (x && x.k === "price" && x.usd && x.up) { const u = x.per === "kg" ? "/kg" : ""; return M("価格の比較：この商品の価格表 US$" + (+x.usd).toFixed(2) + u + (x.row ? "（" + x.row + "）" : "") + "・市場平均 US$" + (+x.up).toFixed(2) + u + "（通関統計の単価）", "Price comparison: your price list US$" + (+x.usd).toFixed(2) + u + (x.row ? " (" + x.row + ")" : "") + " vs market average US$" + (+x.up).toFixed(2) + u + " (customs statistics unit value)"); }
        } catch (e) { /* 前の文 */ }
        return __pt.apply(this, arguments);
      };
      V.partTxt._v97 = 1;
    }
  } catch (e) { err("pt", e); }

  const RISK_OLD = "規制・関税が未確認";
  const RISK_NEW = "登録などの規制が未確認（関税はなし＝HS から判定）";
  addDict(RISK_NEW, "Registration and other rules not yet confirmed (no duty, judged from the HS)", "注册等法规尚未确认（按HS判定无关税）", "Registro y otras normas sin confirmar (sin arancel, según el HS)");
  if (typeof ctyRiskLocal === "function") {
    const __rl97 = ctyRiskLocal;
    ctyRiskLocal = function (r) { // eslint-disable-line no-global-assign
      let s = __rl97.apply(this, arguments);
      try { if (r && r.facts && r.facts.v97df && typeof s === "string") s = s.split(RISK_OLD).join(RISK_NEW); } catch (e) { err("risk", e); }
      return s;
    };
  }
  // 書類の判断の表で当たる手続き（点数の内訳と同じもの）を、詳細の「必要書類」に並べる名前に
  function dtNames(r) {
    try {
      const P = r && r.v96 && Array.isArray(r.v96.P) ? r.v96.P : null;
      const V = V96();
      if (!P || !V || typeof V.docNm !== "function") return [];
      const base = ((r.facts && r.facts.docs) || []).map(String);
      const out = [];
      const add = (L, tag) => (L || []).forEach((k) => { const n = V.docNm(k); if (!n || base.indexOf(n) >= 0 || out.some((x) => x.indexOf(n) === 0)) return; out.push(n + tag); });
      add((P.find((x) => x.k === "dtReq") || {}).L, M("（この商品・この国で必須）", " (required for this product and country)"));
      add((P.find((x) => x.k === "dtCon") || {}).L, M("（条件つき）", " (conditional)"));
      add((P.find((x) => x.k === "dtCom") || {}).L, M("（どの国にも）", " (for every country)"));
      return out;
    } catch (e) { err("dtNames", e); return []; }
  }
  V97CTY.dtNames = dtNames;
  // 前の版で保存した分析：表示のときに、同じ判定にそろえる（AI の文はそのまま・照らし合わせは audit）
  function migr(s) {
    try {
      if (!s || !Array.isArray(s.rec)) return 0;
      const g = regHs();
      let n = 0;
      s.rec.forEach((r) => {
        const f = r && r.facts;
        if (!f || f.v97df) return;
        const df = r.v96 && Array.isArray(r.v96.P) ? r.v96.P.find((x) => x.k === "dfree") : null;
        if (!df || !/要確認/.test(String(f.duty || ""))) return;
        if (!g.ok || digits(df.hs) !== g.hs) return;
        let cc = "";
        try { cc = V95().dutyFree(r.c, g.hs); } catch (e) { cc = ""; }
        if (!cc) return;
        f.duty = "0%"; f.dutyN = 0; f.v97df = { cc, hs: hsFmt(g.hs) };
        const per = s.ai && s.ai.per && s.ai.per[r.c];
        if (typeof r.risk === "string" && r.risk.indexOf(RISK_OLD) >= 0 && !(per && per.risk === r.risk)) r.risk = r.risk.split(RISK_OLD).join(RISK_NEW);
        if (typeof f.warn === "string") f.warn = ownWarn(f.warn, cc, hsFmt(g.hs));
        n++;
      });
      if (n) { V97CTY.n.migr += n; try { if (typeof ctySave === "function") ctySave(); } catch (e) { /* 次の保存で */ } }
      return n;
    } catch (e) { err("migr", e); return 0; }
  }
  V97CTY.migr = migr;
  // 推奨の国の詳細（vCty）：必要書類に、書類の判断の表の手続きを足して描く（描いたら元に戻す＝保存のデータは変えない）
  if (typeof vCty === "function") {
    const __vc97 = vCty;
    vCty = function () { // eslint-disable-line no-global-assign
      const s = store();
      const back = [];
      try {
        if (!W.__ctyBusy) migr(s);
        if (s && Array.isArray(s.rec)) {
          const top = s.top || [];
          s.rec.forEach((r) => {
            if (!r || !r.facts || top.indexOf(r.c) < 0) return;
            const add = dtNames(r);
            if (!add.length) return;
            back.push([r.facts, r.facts.docs]);
            r.facts.docs = (r.facts.docs || []).concat(add);
          });
        }
      } catch (e) { err("vCty", e); }
      try { return __vc97.apply(this, arguments); } finally { back.forEach(([f, d]) => { try { f.docs = d; } catch (e) { /* 無視 */ } }); }
    };
  }
  // 国別戦略の骨組み（AI 未接続・未調査のとき）：関税・必要書類を同じ判定に
  if (typeof ctyDeepBase === "function") {
    const __db97 = ctyDeepBase;
    ctyDeepBase = function (c) { // eslint-disable-line no-global-assign
      const b = __db97.apply(this, arguments);
      try {
        const s = store();
        const r = s && Array.isArray(s.rec) ? s.rec.find((x) => x && x.c === c) : null;
        if (b && r) {
          const add = dtNames(r);
          if (add.length) b.docs = (b.docs || []).concat(add);
          if (r.facts && r.facts.v97df) { b.v97df = r.facts.v97df; b.duty = "0%"; }
        }
      } catch (e) { err("deepBase", e); }
      return b;
    };
  }
  function freeTxt(df) {
    const F = df ? freeInfo(df.cc) : null;
    if (!F) return "";
    return M("0%（関税なし＝この商品の HS " + df.hs + " は課税の区分に当たらない・" + F.src[0] + "）", "0% (no duty: HS " + df.hs + " is outside the dutiable categories; " + F.src[1] + ")");
  }
  V97CTY.freeTxt = freeTxt;
  // 国別戦略（保存した調査も・AI の調査も）を、表示のときにアプリの判定と照らし合わせる
  function fixDeep(DP, c) {
    try {
      if (!DP || !DP.d) return;
      const s = store();
      const r = s && Array.isArray(s.rec) ? s.rec.find((x) => x && x.c === c) : null;
      const df = r && r.facts && r.facts.v97df;
      const d = DP.d;
      const sig = [df ? df.cc + df.hs : "", lang()].join("|");
      if (d.v97sig === sig) return;
      if (df) {
        const ft = freeTxt(df);
        d.pricing = d.pricing || {};
        d.pricing.tax = d.pricing.tax || {};
        const cur = String(d.pricing.tax.duty || "");
        if (DP.local || !cur || /要確認|未確認|to be confirmed|tbc/i.test(cur)) d.pricing.tax.duty = ft;
        else if (!/(?:^|[^\d.])0(?:\.0+)?\s*%|関税なし|無関税|免税|duty[- ]free|no (?:import )?duty|free port|自由港/i.test(cur)) d.pricing.tax.duty = cur + M("　※アプリの判定（HS から）：関税なし。違いを確かめてください", "  * App's judgement (from the HS): no duty. Please check the difference");
        if (DP.local && d.overview && typeof d.overview.headline === "string") d.overview.headline = d.overview.headline.replace(/^規制DB未登録/, "規制のひな形なし（関税なし＝HS " + df.hs + " から判定）");
        if (DP.local && d.entry && typeof d.entry.reason === "string" && typeof V5324_DEEP !== "undefined" && d.entry.reason === V5324_DEEP) d.entry.reason = "規制のひな形が無いため、登録・必要書類は要確認です（AI詳細調査で確かめてください）。関税は、この商品の HS（" + df.hs + "）から関税なしと判定しました（税関の一覧から）。";
        if (DP.local && d.regulation && typeof d.regulation.notes === "string" && r.facts.warn) d.regulation.notes = r.facts.warn;
      }
      if (DP.local && d.regulation && r) {
        const add = dtNames(r);
        const ex = Array.isArray(d.regulation.docs) ? d.regulation.docs : [];
        if (add.length) d.regulation.docs = ex.concat(add.filter((x) => ex.indexOf(x) < 0));
      }
      d.v97sig = sig;
    } catch (e) { err("deep " + c, e); }
  }
  V97CTY.fixDeep = fixDeep;
  if (typeof ctyDeepView === "function") {
    const __dv97 = ctyDeepView;
    ctyDeepView = function (c) { // eslint-disable-line no-global-assign
      try { fixDeep(typeof ctyDeepOf === "function" ? ctyDeepOf(c) : null, c); } catch (e) { err("deepView", e); }
      return __dv97.apply(this, arguments);
    };
  }
  addDict("規制のひな形が無いため、登録・必要書類は要確認です（AI詳細調査で確かめてください）。", "There is no regulation template, so registration and documents are to be confirmed (check with AI research). ");
  // 要約（AI の総評・国ごとの理由・リスク）と詳細（国の事実）の関税を照らし合わせる
  const RE_FREE = /関税(?:は|が)?(?:なし|無し|ゼロ|かから(?:ない|ず)|0\s*%|０\s*％)|無関税|免税|ゼロ関税|自由港|duty[- ]free|no (?:import )?(?:duty|tariff)|free port|零关税|免关税|sin arancel/i;
  const RE_RATE = /関税(?:率)?(?:は|が)?\s*(?:約|およそ)?\s*(\d+(?:\.\d+)?)\s*[%％]|(\d+(?:\.\d+)?)\s*[%％]\s*の関税|duty (?:of |rate of )?(\d+(?:\.\d+)?)\s*%/i;
  const RE_TBC = /関税[^。]{0,8}要確認|関税・規制は要確認|規制・関税が未確認|duty[^.]{0,12}to be confirmed/i;
  function sentences(txt) { return String(txt || "").split(/(?<=[。．.!！?？\n])/).map((x) => x.trim()).filter(Boolean); }
  function audit(s) {
    const out = [];
    try {
      if (!s || !Array.isArray(s.rec)) return out;
      const ctys = s.rec.map((r) => r && r.c).filter(Boolean);
      const appOf = (r) => { const f = r.facts || {}; if (f.v97df || /^0\s*%/.test(String(f.duty || ""))) return { free: 1, txt: "0%" }; const m = String(f.duty || "").match(/(\d+(?:\.\d+)?)\s*%/); return m ? { rate: +m[1], txt: f.duty } : { tbc: 1, txt: String(f.duty || "要確認") }; };
      const check = (where, txt, cOnly) => {
        sentences(txt).forEach((sn) => {
          const hit = ctys.filter((c) => sn.indexOf(c) >= 0);
          const list = cOnly ? [cOnly] : hit;
          if (!list.length || (!cOnly && hit.length !== 1)) return; // 1か国に言い切れる文だけ
          list.forEach((c) => {
            const r = s.rec.find((x) => x.c === c);
            if (!r) return;
            const a = appOf(r);
            let claim = "";
            if (RE_FREE.test(sn)) claim = "free";
            else if (RE_TBC.test(sn)) claim = "tbc";
            else { const m = sn.match(RE_RATE); if (m) claim = "rate:" + (m[1] || m[2] || m[3]); }
            if (!claim) return;
            let bad = false;
            if (claim === "free") bad = !a.free;
            else if (claim === "tbc") bad = !!a.free;
            else { const v = +claim.slice(5); bad = a.free ? v > 0 : (a.rate != null ? Math.abs(a.rate - v) > 0.05 : false); }
            if (bad) out.push({ c, where, claim, app: a.txt, s: sn.slice(0, 140) });
          });
        });
      };
      if (s.ai && s.ai.summary) check("summary", s.ai.summary);
      s.rec.forEach((r) => {
        if (!r) return;
        check("why", r.why, r.c);
        check("risk", r.risk, r.c);
      });
      V97CTY.n.audit++;
    } catch (e) { err("audit", e); }
    return out;
  }
  V97CTY.audit = audit;

  /* ════════════ No.517 前回からの変化 ════════════ */
  const PK = ["tpl", "notpl", "duty0", "dutyLo", "dutyHi", "warn", "docs", "kb", "dtReq", "dtCon", "dfree", "ban", "exp", "noPart", "noStat", "yoy", "buy", "frt", "shelf", "cold", "share", "grow", "price", "base"];
  function snapOf(s, extra) {
    const rec = (s && Array.isArray(s.rec)) ? s.rec : [];
    const v0 = (rec.find((r) => r && r.v96) || {}).v96;
    const per = {};
    rec.forEach((r, i) => {
      if (!r || !r.sc) return;
      const P = {};
      ((r.v96 && r.v96.P) || []).forEach((x) => { if (PK.indexOf(x.k) < 0) return; P[x.k] = { p: x.p == null ? null : Math.round(x.p), L: x.L ? x.L.slice(0, 6) : undefined, n: x.n }; });
      const f = r.facts || {};
      per[r.c] = { t: r.sc.total, rg: r.sc.reg, mk: r.sc.mkt, cp: r.sc.comp, bs: r.sc.base, rk: r.rank || i + 1, P,
        f: { d: String(f.duty || ""), b: f.buyers || 0, x: Math.round(f.exportUsd || 0), sh: Math.round((f.share || 0) * 1000) / 1000, y: f.yoy == null ? null : Math.round(f.yoy * 100), bk: f.base && f.base.kind || "", kb: f.regKb ? 1 : 0, pa: f.priceAdv || 0 } };
    });
    let tg = [];
    try { tg = ((ten() && ten().targets) || []).slice(0, 10); } catch (e) { tg = []; }
    return Object.assign({ at: Date.now(), t: String(s && s.at || ""), v: "21.97", inp: v0 && v0.inp ? Object.assign({}, v0.inp) : null, cands: (s && s.cands || []).slice(), tg,
      top: (s && s.top || []).slice(0, 3), by: s && s.ai ? "ai" : "local", eng: s && s.ai ? String(s.ai.eng || "") : "", loc: (V97CTY.locTop || []).slice(0, 3), per,
      ch: s && s.ai && s.ai.v97change ? String(s.ai.v97change).slice(0, 300) : "" }, extra || {});
  }
  V97CTY.snapOf = snapOf;
  const INPN = { hs: ["HS", "HS"], cat: ["カテゴリー", "category"], usd: ["単価（US$）", "unit price (US$)"], shelf: ["賞味期限（か月）", "shelf life (months)"], store: ["保存", "storage"], mode: ["輸送", "transport"] };
  const AXN = { rg: ["規制", "Regulation"], mk: ["市場性", "Market"], cp: ["競合", "Competition"], bs: ["STANDAGE拠点", "STANDAGE base"] };
  const nmC = (c) => { if (V97CTY._ja) return c; try { return V96() && V96().ctyNm ? V96().ctyNm(c) : c; } catch (e) { return c; } };
  const joinC = (a) => (a || []).map(nmC).join(M("・", ", "));
  const pv = (v) => (v == null ? M("未評価", "n/a") : String(v));
  const PJA = { tpl: "規制のひな形", notpl: "規制のひな形なし", duty0: "関税0%", dutyLo: "関税が低い", dutyHi: "関税が高い", warn: "規制の注意", docs: "必要書類の数", kb: "AI詳細調査の反映", dtReq: "この国で必須の手続き", dtCon: "条件つきの手続き", dfree: "HSから関税なし", ban: "輸入を止める決まり", exp: "日本からの輸出（通関統計）", noPart: "相手国別の統計なし", noStat: "統計なし", yoy: "前年比", buy: "商談したバイヤー数", frt: "単価×運賃", shelf: "賞味期限×日数", cold: "冷蔵・冷凍×日数", share: "日本勢のシェア", grow: "輸出の伸び", price: "価格の比較", base: "STANDAGE拠点" };
  function partLabel(k, c, x) {
    if (V97CTY._ja) return PJA[k] || k;
    try { if (V96() && typeof V96().partTxt === "function") return V96().partTxt(Object.assign({ k, L: [], hs: "" }, x || {}), c); } catch (e) { /* 次へ */ }
    return k;
  }
  // 2回の記録の違い（文はここで作る＝表示の言語で）
  function diff(a, b) {
    const D0 = { lines: [], per: [], topChanged: false, same: false, a, b };
    if (!a || !b) return D0;
    try {
      const L = D0.lines;
      const tA = a.top || [], tB = b.top || [];
      D0.topChanged = tA.join("|") !== tB.join("|");
      // 入力
      const ia = a.inp || {}, ib = b.inp || {};
      const inCh = Object.keys(INPN).filter((k) => String(ia[k] == null ? "" : ia[k]) !== String(ib[k] == null ? "" : ib[k]));
      if (inCh.length) L.push({ k: "inp", t: M("商品の入力が変わりました：", "Product inputs changed: ") + inCh.map((k) => M(INPN[k][0], INPN[k][1]) + " " + (ia[k] == null || ia[k] === "" ? "—" : ia[k]) + " → " + (ib[k] == null || ib[k] === "" ? "—" : ib[k])).join(M("・", ", ")) });
      // 候補国
      const add = (b.cands || []).filter((c) => (a.cands || []).indexOf(c) < 0), del = (a.cands || []).filter((c) => (b.cands || []).indexOf(c) < 0);
      if (add.length || del.length) L.push({ k: "cand", t: M("候補国が変わりました（" + (add.length ? "足した国：" + joinC(add) : "") + (add.length && del.length ? "・" : "") + (del.length ? "外れた国：" + joinC(del) : "") + "）。市場性とバイヤー数の点は、候補国の中でいちばん大きい国を基準にした割合のため、ほかの国の点も動くことがあります。", "Candidate countries changed (" + (add.length ? "added: " + joinC(add) : "") + (add.length && del.length ? "; " : "") + (del.length ? "removed: " + joinC(del) : "") + "). Market and buyer points are relative to the largest candidate, so other countries' scores can move too.") });
      // 進出希望国
      if ((a.tg || []).join("|") !== (b.tg || []).join("|")) L.push({ k: "tg", t: M("進出希望国が変わりました：" + (joinC(a.tg) || "なし") + " → " + (joinC(b.tg) || "なし") + "（推奨は進出希望国を先に選びます）", "Target countries changed: " + (joinC(a.tg) || "none") + " → " + (joinC(b.tg) || "none") + " (targets are recommended first)") });
      // 国ごと
      const cs = [];
      tA.concat(tB).forEach((c) => { if (cs.indexOf(c) < 0) cs.push(c); });
      Object.keys(b.per || {}).forEach((c) => { const x = a.per && a.per[c], y = b.per[c]; if (x && y && x.t !== y.t && cs.indexOf(c) < 0) cs.push(c); });
      let scoreCh = 0;
      cs.forEach((c) => {
        const x = a.per && a.per[c], y = b.per && b.per[c];
        const row = { c, from: x ? x.t : null, to: y ? y.t : null, rkA: x ? x.rk : null, rkB: y ? y.rk : null, inA: tA.indexOf(c) >= 0, inB: tB.indexOf(c) >= 0, why: [] };
        if (!x || !y) { row.why.push(!x ? M("前回は候補国に無かった国です", "Was not a candidate last time") : M("今回は候補国にありません", "Not a candidate this time")); D0.per.push(row); return; }
        if (x.t !== y.t) scoreCh++;
        Object.keys(AXN).forEach((k) => { if (x[k] !== y[k]) row.why.push(M(AXN[k][0], AXN[k][1]) + " " + pv(x[k]) + " → " + pv(y[k])); });
        // 内訳の行の違い
        const ks = [];
        Object.keys(x.P || {}).concat(Object.keys(y.P || {})).forEach((k) => { if (ks.indexOf(k) < 0) ks.push(k); });
        ks.forEach((k) => {
          const p = x.P && x.P[k], q = y.P && y.P[k];
          const same = JSON.stringify(p || null) === JSON.stringify(q || null);
          if (same) return;
          const lab = partLabel(k, c, q || p || {});
          const pt = (o) => (o && o.p != null ? (o.p > 0 && ["tpl", "notpl", "exp", "noPart", "noStat", "share", "base"].indexOf(k) < 0 ? "+" + o.p : String(o.p)) : "—");
          row.why.push((!p ? M("（今回から）", "(new) ") : !q ? M("（今回は無し）", "(gone) ") : "") + String(lab).slice(0, 90) + "：" + pt(p) + " → " + pt(q));
        });
        // 事実の違い（内訳に出ない分）
        const fa = x.f || {}, fb = y.f || {};
        if (fa.b !== fb.b) row.why.push(M("STANDAGE が商談したバイヤー " + fa.b + "社 → " + fb.b + "社", "Buyers " + fa.b + " → " + fb.b));
        if (fa.x !== fb.x) row.why.push(M("日本からの輸出（通関統計）の数字が変わりました", "Customs statistics figure changed"));
        if (fa.kb !== fb.kb) row.why.push(fb.kb ? M("規制の AI 詳細調査をこの国に反映しました（＋5）", "AI regulation research applied (+5)") : M("規制の AI 詳細調査の反映を外しました", "AI research no longer applied"));
        if (fa.d !== fb.d) row.why.push(M("関税 " + fa.d + " → " + fb.d, "Duty " + fa.d + " → " + fb.d));
        if (fa.bk !== fb.bk) row.why.push(M("STANDAGE 拠点の状況が変わりました", "STANDAGE base status changed"));
        if (row.inA !== row.inB && x.t === y.t) {
          const tgA = (a.tg || []).indexOf(c) >= 0, tgB = (b.tg || []).indexOf(c) >= 0;
          if (tgA !== tgB) row.why.push(tgB ? M("進出希望国に入ったため（推奨は進出希望国を先に選びます）", "Became a target country (targets are recommended first)") : M("進出希望国から外れたため（点の順では " + y.rk + "位）", "No longer a target country (rank " + y.rk + " by score)"));
          else if (b.by === "ai" || a.by === "ai") row.why.push(M("AI商社マンの判断（点の順では " + x.rk + "位 → " + y.rk + "位）", "AI's judgement (rank by score " + x.rk + " → " + y.rk + ")"));
          else if (x.rk !== y.rk) row.why.push(M("ほかの国との順位が変わったため（" + x.rk + "位 → " + y.rk + "位）", "Rank changed relative to other countries (" + x.rk + " → " + y.rk + ")"));
        }
        if (x.t !== y.t && !row.why.length) row.why.push(M("ほかの候補国の点の基準が変わったため（市場性・バイヤー数は候補の中の最大を基準にした割合）", "The reference among candidates changed (market and buyers are relative to the largest candidate)"));
        if (x.t !== y.t || row.inA !== row.inB) D0.per.push(row);
      });
      // 誰が決めたか
      if (D0.topChanged) {
        if (b.by === "ai") {
          const aiSaid = b.ch ? M("AI商社マンが答えた変更の理由：「" + b.ch + "」", "Reason given by AI: “" + b.ch + "”") : "";
          if (!inCh.length && !add.length && !del.length && !scoreCh && (a.tg || []).join("|") === (b.tg || []).join("|")) L.push({ k: "ai", t: M("入力・候補国・点数は前回と同じですが、AI商社マンの判断で推奨の3か国が変わりました（AI の判断は実行ごとに揺れることがあります）。内蔵の点の順の推奨は：" + (joinC(b.loc) || "—") + "。", "Inputs, candidates and scores are the same, but the AI's judgement changed the 3 recommended countries (AI judgements can vary between runs). Built-in ranking: " + (joinC(b.loc) || "—") + ".") + (aiSaid ? " " + aiSaid : "") });
          else L.push({ k: "ai", t: M("今回の推奨は AI商社マンの判断です（内蔵の点の順：" + (joinC(b.loc) || "—") + "）。", "This recommendation is the AI's judgement (built-in ranking: " + (joinC(b.loc) || "—") + ").") + (aiSaid ? " " + aiSaid : "") });
        } else if (a.by === "ai") L.push({ k: "ai", t: M("前回の推奨は AI商社マンの判断、今回は内蔵の点の順です（AI に接続できなかった・未接続）。", "Last time the AI chose; this time the built-in ranking was used (AI not available).") });
      }
      D0.same = !D0.topChanged && !scoreCh && !L.length;
    } catch (e) { err("diff", e); }
    return D0;
  }
  V97CTY.diff = diff;
  V97CTY.last2 = function (s) {
    s = s || store();
    const h = s && Array.isArray(s.v97h) ? s.v97h : [];
    return h.length >= 2 ? diff(h[h.length - 2], h[h.length - 1]) : null;
  };
  // AI に渡す前の推奨（内蔵の点の順）を控える
  if (typeof ctyAnalyzeAI === "function") {
    const __caa97 = ctyAnalyzeAI;
    ctyAnalyzeAI = async function (rec) { // eslint-disable-line no-global-assign
      try { const s = store(); V97CTY.locTop = s && s.top ? s.top.slice(0, 3) : []; V97CTY.aiChange = ""; V97CTY.aiRec = Array.isArray(rec) ? rec : null; } catch (e) { err("caa", e); }
      try { return await __caa97.apply(this, arguments); } finally { V97CTY.aiRec = null; }
    };
  }
  // 分析が終わったら記録する（商品ごと・直近4回）
  if (typeof ctyRun === "function") {
    const __cr97 = ctyRun;
    ctyRun = async function (quick) { // eslint-disable-line no-global-assign
      const s0 = store();
      const before = s0 ? String(s0.at || "") + "|" + (s0.rec ? s0.rec.length : 0) : "";
      if (!W.__ctyBusy) V97CTY.locTop = [];
      const out = await __cr97.apply(this, arguments);
      try {
        const s = store();
        if (s && Array.isArray(s.rec) && s.rec.length && !W.__ctyBusy) {
          if (s.ai && V97CTY.aiChange) s.ai.v97change = V97CTY.aiChange;
          if (!V97CTY.locTop || !V97CTY.locTop.length) V97CTY.locTop = (s.top || []).slice(0, 3);
          const h = Array.isArray(s.v97h) ? s.v97h : [];
          const sg = String(s.at || "") + "|" + s.rec.length;
          const last = h[h.length - 1];
          if (!(last && last.t === String(s.at || "") && sg === before)) {
            s.v97h = h.concat([snapOf(s)]).slice(-4);
            V97CTY.n.snap++;
            if (typeof ctySave === "function") ctySave();
          }
          try { if (typeof render === "function") render(); } catch (e) { /* 次の描き直しで */ }
        }
      } catch (e) { err("run", e); }
      return out;
    };
  }
  // AI への依頼に、前回の推奨と変化を足す（同じ入力なら同じ3か国を保つ・変えるなら理由）
  const CTY_Q = /の販売先国を、候補\d+か国から3か国に絞り込む/;
  if (typeof llmAsk === "function") {
    const __la97c = llmAsk;
    llmAsk = async function (q, maxTok, opts) { // eslint-disable-line no-global-assign
      let isC = false;
      try {
        if (typeof q === "string" && CTY_Q.test(q.slice(0, 600)) && q.indexOf("=== 前回の推奨") < 0) {
          isC = true;
          const s = store();
          const h = s && Array.isArray(s.v97h) ? s.v97h : [];
          const prev = h[h.length - 1];
          if (prev && Array.isArray(V97CTY.aiRec)) {
            const now = snapOf({ rec: V97CTY.aiRec, cands: s.cands, top: V97CTY.locTop, at: "" });
            let lines = [];
            V97CTY._ja = 1; // 依頼の文は日本語で作る（画面の言語によらない）
            try { const D2 = diff(prev, Object.assign({}, now, { by: prev.by })); lines = D2.lines.map((x) => "・" + x.t).concat(D2.per.map((r) => "・" + r.c + "：" + (r.from == null ? "—" : r.from) + "点 → " + (r.to == null ? "—" : r.to) + "点（" + r.why.slice(0, 4).join("／") + "）")); } finally { V97CTY._ja = 0; }
            const pt = Object.keys(prev.per || {}).map((c) => c + " " + prev.per[c].t).join("・");
            const add = "=== 前回の推奨（同じ商品・前回の分析 " + (prev.t || "") + "） ===\n推奨：" + (prev.top || []).join("・") + "（" + (prev.by === "ai" ? "AI の判断" : "内蔵の点の順") + "）\n前回の総合点：" + pt.slice(0, 600) + "\n" +
              "前回からの入力・点数の変化：" + (lines.length ? "\n" + lines.join("\n").slice(0, 1500) : "なし（入力・候補国・点数は前回と同じ）") + "\n" +
              "規則（前回との一貫性）：入力・点数に意味のある変化が無ければ、前回と同じ3か国（順番も）を保つ。変える場合は、JSON に \"change\":\"前回から変えた理由（1〜2文・上の変化か事実を引用）\" を足す。変えない場合は \"change\":\"\"。\n";
            const k = "=== 依頼 ===";
            q = q.indexOf(k) >= 0 ? q.replace(k, add + k) : q + "\n" + add;
            V97CTY.n.aiPrev++;
          }
        }
      } catch (e) { err("ctyq", e); }
      const r = await __la97c.apply(this, [q, maxTok, opts].concat([].slice.call(arguments, 3)));
      try {
        if (isC && r && typeof r.txt === "string") {
          const t = r.txt.replace(/```json|```/g, ""), a = t.indexOf("{"), b = t.lastIndexOf("}");
          if (a >= 0 && b > a) { const j = JSON.parse(t.slice(a, b + 1)); V97CTY.aiChange = j && typeof j.change === "string" ? j.change.slice(0, 300) : ""; }
        }
      } catch (e) { /* 答えの形は ctyAnalyzeAI が確かめる */ }
      return r;
    };
  }

  /* ════════════ No.515・No.508 規制の AI 詳細調査の調べ直し ════════════ */
  const AIH = { "generativelanguage.googleapis.com": "gemini", "api.anthropic.com": "anthropic", "api.openai.com": "openai", "api.perplexity.ai": "perplexity" };
  const hostOf = (u) => { const m = /^https:\/\/([^/?#]+)/i.exec(String(u || "")); return m ? m[1].toLowerCase() : ""; };
  // 失敗の種類：tr＝一時的（間を空ければ通りうる）・pm＝何度やっても同じ
  function cls(st, msg, type) {
    const m = String(msg || "");
    if (st === "x") return /timeout|タイムアウト|abort/i.test(m) ? { k: "timeout", tr: 1 } : { k: "net", tr: 1 };
    if (type === "bc20_air") return st === 429 ? { k: "quota", tr: 0 } : { k: "relay", tr: 0 };
    if (st === 429) return { k: "rate", tr: 1 };
    if (st === 529 || /overload/i.test(m)) return { k: "busy", tr: 1 };
    if (st === 408 || st === 500 || st === 502 || st === 503 || st === 504) return { k: "server", tr: 1 };
    if (st === 401 || st === 403) return { k: "auth", tr: 0 };
    if (st === 400 || st === 404 || st === 422) return { k: "bad", tr: 0 };
    return { k: "other", tr: 1 };
  }
  V97CTY.cls = cls;
  (function () {
    try {
      const F = W.fetch;
      if (typeof F !== "function" || F.__v97cty) return;
      const Wf = async function (input, init) {
        let p = "", web = 0, rec = null;
        try {
          const u = (typeof input === "string") ? input : (input && typeof input.url === "string") ? input.url : "";
          p = AIH[hostOf(u)] || "";
          if (p) {
            const b = init && typeof init.body === "string" ? init.body : "";
            web = b.indexOf("[[r10w:") >= 0 ? 1 : 0;
            rec = { at: Date.now(), p, web, st: 0, k: "", msg: "" };
          }
        } catch (e) { rec = null; }
        if (!rec) return F.apply(this, arguments);
        let resp;
        try { resp = await F.apply(this, arguments); } catch (e) {
          rec.st = "x"; rec.msg = String((e && e.message) || e).slice(0, 140); const c = cls("x", rec.msg); rec.k = c.k; rec.tr = c.tr; rec.end = Date.now();
          V97CTY.flog.push(rec); if (V97CTY.flog.length > 60) V97CTY.flog.shift();
          throw e;
        }
        try {
          rec.st = resp.status; rec.end = Date.now();
          if (!resp.ok) {
            let t = "", type = "";
            try { t = await resp.clone().text(); const j = JSON.parse(t); type = (j && j.error && j.error.type) || ""; t = (j && j.error && (j.error.message || j.error.type)) || t; } catch (e) { /* 文のまま */ }
            rec.msg = String(t || "").slice(0, 140); rec.type = type;
            const c = cls(resp.status, t, type); rec.k = c.k; rec.tr = c.tr;
          }
          V97CTY.flog.push(rec); if (V97CTY.flog.length > 60) V97CTY.flog.shift();
        } catch (e) { /* 記録だけ */ }
        return resp;
      };
      Wf.__v97cty = 1;
      W.fetch = Wf;
    } catch (e) { err("fetch", e); }
  })();
  // 同期サーバーを通る依頼は、調べ直しのときだけ Web 検索の回数を減らして軽くする（時間切れを避ける）
  if (typeof v63aRelay === "function") {
    const __vr97 = v63aRelay;
    v63aRelay = async function (url, init) { // eslint-disable-line no-global-assign
      try {
        if (V97CTY.light && init && typeof init.body === "string" && init.body.indexOf("web_search") >= 0) {
          const b = JSON.parse(init.body);
          let ch = 0;
          (b.tools || []).forEach((t) => { if (t && /^web_search/.test(String(t.type || "")) && (+t.max_uses || 5) > 3) { t.max_uses = 3; ch = 1; } });
          if (ch) init = Object.assign({}, init, { body: JSON.stringify(b) });
        }
      } catch (e) { err("relay", e); }
      return __vr97.call(this, url, init);
    };
  }
  const REGQ = /^([^\n「」]{1,40}?)向けに日本から「[\s\S]{0,600}?最新の輸入規制を、Web検索で確認して/;
  const R10 = () => W.__v2192r10w || null;
  const PN = (p) => { try { return (PROV[p] && PROV[p].short) || p; } catch (e) { return p; } }; // eslint-disable-line no-undef
  V97CTY.PN = PN;
  function webOk(r) { try { return V96() && typeof V96().webOk === "function" ? V96().webOk(r) : !!(r && r.cits && r.cits.length); } catch (e) { return false; } }
  function webEngines() {
    try {
      const R = R10();
      const d = R && typeof R.decide === "function" ? R.decide({ forceWeb: 1 }) : null;
      return d && d.web ? (d.sr || []).slice() : [];
    } catch (e) { return []; }
  }
  // 1回の試みの結果をまとめる（AI の会社の答え・r10w の記録から）
  function sumAtt(i, r, e, from, prov) {
    const L = V97CTY.flog.filter((x) => x.at >= from);
    const fails = L.filter((x) => x.st === "x" || (x.st && x.st >= 400));
    const webFail = fails.filter((x) => x.web && x.p !== "openai");
    const x = (r && r.r10w) || {};
    const a = { i, prov: prov || (webFail[0] && webFail[0].p) || x.prov || (r && r.prov) || "", fb: x.why === "fallback" && x.prov ? x.prov : "", web: x.web ? 1 : 0, n: x.n || 0, why: x.why || (e ? "error" : ""), ms: Date.now() - from, fails: fails.slice(0, 3).map((f) => ({ p: f.p, st: f.st, k: f.k, tr: f.tr ? 1 : 0, msg: String(f.msg || "").slice(0, 80) })) };
    if (e) a.err = String((e && e.message) || e).slice(0, 120);
    // 何度やっても同じ失敗か
    const perm = ["off", "noeng", "noai", "att", "reject"].indexOf(a.why) >= 0 || fails.some((f) => !f.tr) || (e && /HTTP (400|401|403|404)/.test(a.err || ""));
    a.perm = perm ? 1 : 0;
    a.k = (fails[0] && fails[0].k) || (a.why === "fallback" ? "fallback" : a.web && !a.n ? "nosrc" : a.why || (e ? "error" : ""));
    return a;
  }
  V97CTY.sumAtt = sumAtt;
  const wait = (ms) => new Promise((res) => setTimeout(res, ms));
  const BACK = [0, 4000, 12000];
  function busy(c, txt) {
    try {
      const o = document.getElementById("regaiO");
      if (!o || (W.V54ASK && V54ASK.c && V54ASK.c !== c)) return; // eslint-disable-line no-undef
      o.innerHTML = '<div class="rw v96reg-busy v97reg-busy" role="status" data-noi18n="1"><span class="spin"></span><span>' + E(txt) + "</span></div>";
    } catch (e) { /* 表示だけ */ }
  }
  V97CTY.kTxt = function (k) {
    return ({
      busy: M("AI の会社の側が混み合っていました（一時的）", "the AI provider was overloaded (temporary)", "AI服务商繁忙（暂时）", "el proveedor de IA estaba saturado (temporal)"),
      rate: M("短い時間に依頼が多く、AI の会社に断られました（一時的）", "too many requests in a short time (temporary)", "短时间内请求过多（暂时）", "demasiadas solicitudes en poco tiempo (temporal)"),
      server: M("AI の会社の側のエラーでした（一時的）", "an error on the AI provider side (temporary)", "AI服务商端出错（暂时）", "un error del proveedor de IA (temporal)"),
      timeout: M("時間内に答えが返りませんでした（Web 検索に時間がかかった可能性・一時的）", "no answer in time (web search may have taken too long; temporary)", "未在时限内返回（可能是网络搜索耗时；暂时）", "no hubo respuesta a tiempo (temporal)"),
      net: M("通信が途中で切れました（同期サーバーを通る経路・一時的）", "the connection dropped (via the sync server; temporary)", "连接中断（经同步服务器；暂时）", "se cortó la conexión (temporal)"),
      relay: M("同期サーバーが AI への取り次ぎを断りました（AI 接続の共有が止まっている・設定。何度やっても同じ・管理者の確認が要ります）", "the sync server declined to relay to the AI (sharing stopped or settings; retrying will not help — the admin must check)", "同步服务器拒绝转发给AI（共享已停止或设置问题；需管理员确认）", "el servidor de sincronización no reenvió a la IA (configuración; el administrador debe revisarlo)"),
      quota: M("このアカウントの AI の利用の上限に達しています（何度やっても同じ・上限が戻るまで）", "this account has reached its AI usage limit (retrying will not help until it resets)", "此账户已达到AI使用上限（重试无效）", "esta cuenta alcanzó su límite de uso de IA (reintentar no sirve)"),
      auth: M("AI の接続の設定（キー・権限）のエラーです（何度やっても同じ・管理者の確認が要ります）", "an AI connection setting error (key/permission; retrying will not help — the admin must check)", "AI连接设置错误（密钥/权限；需管理员确认）", "error de configuración de la IA (clave/permiso; el administrador debe revisarlo)"),
      bad: M("AI の会社がこの依頼の形を受け付けませんでした（何度やっても同じ）", "the AI provider rejected the request format (retrying will not help)", "AI服务商不接受此请求格式（重试无效）", "el proveedor rechazó el formato de la solicitud (reintentar no sirve)"),
      fallback: M("検索に対応したエンジンがエラーになり、Web 検索なしの AI に切り替わりました", "the web-capable engine failed and it switched to an AI without web search", "支持搜索的引擎出错，已切换到无网络搜索的AI", "el motor con búsqueda falló y cambió a una IA sin búsqueda"),
      nosrc: M("Web 検索を頼みましたが、出典が返ってきませんでした", "web search was requested but no sources came back", "已请求网络搜索但未返回来源", "se pidió búsqueda web pero no hubo fuentes"),
      error: M("エラーになりました", "it failed", "出错", "falló"),
      off: M("管理画面で、このアカウントの Web 検索が「許可しない」になっています（何度やっても同じ）", "web search is turned off for this account in the admin console (retrying will not help)", "管理后台已关闭此账户的网络搜索（重试无效）", "la búsqueda web está desactivada para esta cuenta (reintentar no sirve)"),
      noeng: M("このアカウントの AI 接続は Web 検索に対応していません（何度やっても同じ）", "this account's AI connection does not support web search (retrying will not help)", "此账户的AI连接不支持网络搜索（重试无效）", "la conexión de IA de esta cuenta no admite búsqueda web (reintentar no sirve)"),
      reject: M("Claude の Web 検索が、AI の会社の側で使えない設定です（何度やっても同じ）", "Claude web search is not enabled on the provider side (retrying will not help)", "Claude的网络搜索在服务商一侧未启用（重试无效）", "la búsqueda web de Claude no está habilitada (reintentar no sirve)"),
      noai: M("AI が接続されていません", "AI is not connected", "未连接AI", "La IA no está conectada")
    })[k] || "";
  };
  if (typeof llmAsk === "function") {
    const __la97r = llmAsk;
    llmAsk = async function (q, maxTok, opts) { // eslint-disable-line no-global-assign
      const args = [].slice.call(arguments);
      let c = "";
      try { const m = typeof q === "string" && opts && opts.forceWeb ? REGQ.exec(q) : null; c = m ? m[1] : ""; } catch (e) { c = ""; }
      if (!c || (opts && (opts._v97rt || opts._v96rt))) return __la97r.apply(this, args);
      V97CTY.n.rt++;
      let hold = 0;
      try { if (typeof aiThinkStart === "function") hold = aiThinkStart(typeof aiThinkLabel === "function" ? aiThinkLabel(q, opts) : "", ""); } catch (e) { hold = 0; }
      const end = (ok) => { try { if (hold && typeof aiThinkEnd === "function") aiThinkEnd(hold, ok); } catch (e) { /* 表示だけ */ } hold = 0; };
      const att = [];
      let best = null, bestWeb = null, lastE = null, failedP = "";
      const self = this;
      for (let i = 0; i < 3; i++) {
        let o2 = Object.assign({}, opts || {}, { _v96rt: 1, _v97rt: 1 });
        if (i > 0) {
          const prevA = att[att.length - 1];
          if (prevA.perm) break; // 何度やっても同じ失敗は、調べ直さない
          const eng = webEngines();
          if (!eng.length) break;
          // 2回目は同じ（検索に対応した）エンジン・3回目はほかに検索に対応したエンジンがあればそちら
          let p = failedP && eng.indexOf(failedP) >= 0 ? failedP : eng[0];
          if (i === 2) { const other = eng.find((x) => x !== failedP); if (other) p = other; }
          o2 = Object.assign(o2, { prov: p });
          const why = V97CTY.kTxt(prevA.k) || V97CTY.kTxt("error");
          busy(c, M(i + "回目：" + (prevA.prov ? PN(prevA.prov) + "が" : "") + why + "。" + Math.round(BACK[i] / 1000) + "秒おいて、Web 検索つきでもう一度調べます（" + (i + 1) + "／3回目・" + PN(p) + "）…",
            "Attempt " + i + ": " + why + ". Retrying with web search in " + Math.round(BACK[i] / 1000) + "s (attempt " + (i + 1) + " of 3, " + PN(p) + ")…",
            "第" + i + "次：" + why + "。" + Math.round(BACK[i] / 1000) + "秒后用网络搜索重试（第" + (i + 1) + "/3次・" + PN(p) + "）…",
            "Intento " + i + ": " + why + ". Reintentando con búsqueda web en " + Math.round(BACK[i] / 1000) + " s (intento " + (i + 1) + " de 3, " + PN(p) + ")…"));
          await wait(BACK[i]);
          V97CTY.light = 1;
        }
        const from = Date.now();
        let r = null, e = null;
        try { r = await __la97r.call(self, q, maxTok, o2); } catch (x) { e = x; lastE = x; }
        V97CTY.light = 0;
        const a = sumAtt(i + 1, r, e, from, o2.prov);
        att.push(a);
        if (!failedP) { const wf = a.fails.find((f) => f.p && f.p !== "openai"); failedP = wf ? wf.p : (a.web ? a.prov : ""); if (!failedP) { const eng = webEngines(); failedP = eng[0] || ""; } }
        if (r && !best) best = r;
        if (r && webOk(r)) { bestWeb = r; break; }
        if (r && i > 0) best = best || r;
      }
      const ok = !!bestWeb;
      const out = bestWeb || best;
      try {
        const first = att[0] || {}, lastA = att[att.length - 1] || {};
        const s1 = (a) => ({ web: a.web, n: a.n, why: a.why === "error" ? "error" : a.why, prov: a.prov, err: a.err || "" });
        const V6 = V96();
        V97CTY.rt = V97CTY.rt || {};
        V97CTY.rt[c] = { c, at: Date.now(), n: att.length - 1, ok: ok ? 1 : 0, first: s1(first), second: s1(lastA), v97: 1, att, perm: lastA.perm ? 1 : 0 };
        if (V6 && V6.rtPend) V6.rtPend[c] = V97CTY.rt[c];
        if (ok && att.length > 1) V97CTY.n.rtOk++;
      } catch (x) { err("rtrec", x); }
      end(!!out);
      if (out) return out;
      throw lastE || new Error("AI の答えがありませんでした");
    };
  }
  // 「アプリの内蔵データで分かっていること」（Web 検索なしでも出どころのある事実）
  V97CTY.known = function (c) {
    const out = { duty: null, procs: [], tpl: null, asOf: "" };
    try {
      const d = dd();
      const r = d && d.regs ? d.regs[c] : null;
      if (r) {
        if (r.v95own) { const F = freeInfo(r.v95own.cc); out.duty = { t: M("関税なし（この商品の HS " + r.v95own.hs + " は課税の区分に当たらない）", "No customs duty (HS " + r.v95own.hs + " is outside the dutiable categories)"), u: F ? F.u : "", s: F ? M(F.src[0], F.src[1]) : "" }; }
        else if (r.duty && !/要確認/.test(String(r.duty))) out.duty = { t: M("関税 " + r.duty + "（規制のひな形の値・品目により異なる）", "Duty " + r.duty + " (template value; varies by item)"), u: "", s: M("アプリの規制のひな形", "App regulation template") };
        const tplOk = !(typeof v5324NoTpl === "function" && v5324NoTpl(r.warn));
        if (tplOk && (r.docs || []).length) out.tpl = { docs: (r.docs || []).slice(0, 8), lead: r.lead || "" };
      }
      const V = V96();
      if (V && typeof V.dtOf === "function" && typeof V.readOnly === "function" && typeof v85docFacts === "function") {
        const F0 = V.readOnly(() => v85docFacts());
        const dt = V.dtOf(c, F0);
        if (dt && !dt.nocc && !dt.nohs) {
          dt.req.forEach((x) => out.procs.push({ n: V.docNm(x.k), lv: "req", u: x.u, s: x.s }));
          dt.con.forEach((x) => out.procs.push({ n: V.docNm(x.k), lv: "con", u: x.u, s: x.s }));
          (dt.ban || []).forEach((b) => out.procs.push({ n: String(b.s || M("輸入を止める決まり", "Import ban")), lv: "ban", u: b.u, s: "" }));
          out.prov = dt.prov ? 1 : 0;
        } else if (dt && dt.nohs) out.nohs = 1;
        out.asOf = "2026-11-08";
      }
    } catch (e) { err("known " + c, e); }
    return out;
  };
  // あとでもう一度（この画面を開いている間）
  V97CTY.laterSet = function (c, min) {
    try {
      const k = String(c);
      if (V97CTY.later[k]) clearTimeout(V97CTY.later[k].tm);
      const at = Date.now() + (min || 10) * 60000;
      const tm = setTimeout(() => {
        delete V97CTY.later[k];
        try {
          const onReg = (typeof cur !== "undefined" && cur === "ops") && document.getElementById("regaiO"); // eslint-disable-line no-undef
          if (onReg && typeof regAIRun === "function") { regAIRun(k); if (typeof toast === "function") toast(M(nmC(k) + "の規制を、Web 検索つきでもう一度調べています", "Researching " + nmC(k) + " again with web search")); } // eslint-disable-line no-undef
          else if (typeof toast === "function") toast(M(nmC(k) + "の規制の調べ直しの時間です。「規制を調べる」で「Web 検索つきでもう一度調べる」を押してください", "Time to research " + nmC(k) + " again: open Regulations and press “Research again with web search”")); // eslint-disable-line no-undef
        } catch (e) { err("later", e); }
      }, Math.max(1000, at - Date.now()));
      V97CTY.later[k] = { at, tm };
      return at;
    } catch (e) { err("laterSet", e); return 0; }
  };
  V97CTY.laterOff = function (c) { try { const x = V97CTY.later[String(c)]; if (x) clearTimeout(x.tm); delete V97CTY.later[String(c)]; } catch (e) { /* 無視 */ } };

  /* ════════════ No.537 価格表から計算した数字の根拠 ════════════ */
  const NUM = (s) => { const t = String(s == null ? "" : s).normalize("NFKC").replace(/(\d),(?=\d{3}(?!\d))/g, "$1"); const m = t.match(/\d+(?:\.\d+)?/); return m ? +m[0] : null; };
  // 価格表の1行 → { label, min, max, unit, cur }
  function tierOf(row) {
    try {
      const cells = (Array.isArray(row) ? row : [row]).map((x) => String(x == null ? "" : x));
      let unit = null, cur = "", pc = -1;
      cells.forEach((s, i) => {
        if (unit != null) return;
        const t = s.normalize("NFKC");
        let m = t.match(/(?:US\s*\$|USD\s*|\$)\s*([\d,]+(?:\.\d+)?)/i);
        if (m) { unit = +m[1].replace(/,/g, ""); cur = "US$"; pc = i; return; }
        m = t.match(/([\d,]+(?:\.\d+)?)\s*(?:USD|米ドル|ドル)/i);
        if (m) { unit = +m[1].replace(/,/g, ""); cur = "US$"; pc = i; return; }
        m = t.match(/[¥￥]\s*([\d,]+(?:\.\d+)?)/) || t.match(/([\d,]+(?:\.\d+)?)\s*円/);
        if (m) { unit = +m[1].replace(/,/g, ""); cur = "¥"; pc = i; }
      });
      if (unit == null) return null;
      const lab = cells.filter((s, i) => i !== pc && s.trim()).join(" ").trim() || cells[0] || "";
      const t = lab.normalize("NFKC").replace(/(\d),(?=\d{3}(?!\d))/g, "$1");
      let min = null, max = null, m;
      if ((m = t.match(/(\d+(?:\.\d+)?)\s*(?:個|本|枚|袋|箱|ケース|セット|pcs?|units?|kg|ctn|cs)?\s*[〜~～\-–－]\s*(\d+(?:\.\d+)?)/i))) { min = +m[1]; max = +m[2]; }
      else if ((m = t.match(/(\d+(?:\.\d+)?)\s*(?:個|本|枚|袋|箱|ケース|セット|pcs?|units?|kg|ctn|cs)?\s*(?:以上|〜|~|～|\+|から|or more)/i))) min = +m[1];
      else if ((m = t.match(/(\d+(?:\.\d+)?)\s*(?:個|本|枚|袋|箱|ケース|セット|pcs?|units?)\s*(?:未満|以下|まで)/i))) { min = 0; max = +m[1]; }
      else if ((m = t.match(/(?:MOQ|最小)[^\d]{0,6}(\d+(?:\.\d+)?)/i))) min = +m[1];
      else if ((m = t.match(/^(\d+(?:\.\d+)?)\s*(?:個|本|枚|袋|箱|ケース|セット|pcs?|units?)$/i))) min = +m[1];
      return { label: lab, min, max, unit, cur };
    } catch (e) { return null; }
  }
  V97CTY.tierOf = tierOf;
  function priceRows() {
    try { const d = dd(); if (d && Array.isArray(d.priceRows) && d.priceRows.length) return d.priceRows; } catch (e) { /* 次へ */ }
    try { const t = ten(); if (t && Array.isArray(t.priceRows)) return t.priceRows; } catch (e) { /* 無し */ }
    return [];
  }
  const QTY_RE = /(\d[\d,，]*(?:\.\d+)?)\s*(?:個|本|枚|袋|箱|ケース|セット|pcs?\.?|units?|pieces?)/gi;
  function qtyIn(s) {
    const t = String(s || "").normalize("NFKC");
    const out = [];
    let m;
    QTY_RE.lastIndex = 0;
    while ((m = QTY_RE.exec(t))) { const v = +m[1].replace(/[,，]/g, ""); if (v > 0 && out.indexOf(v) < 0) out.push(v); }
    return out;
  }
  function calcFor(q, ans) {
    const rows = priceRows().map(tierOf).filter(Boolean);
    if (!rows.length) return null;
    const qs = qtyIn(q);
    const qty = qs.length ? qs[0] : (qtyIn(ans)[0] || null);
    if (!qty) return null;
    let cand = rows.filter((r) => r.min != null && qty >= r.min && (r.max == null || qty <= r.max));
    if (!cand.length && rows.length === 1 && rows[0].min == null) cand = rows;
    if (!cand.length) return null;
    cand.sort((a, b) => (b.min || 0) - (a.min || 0));
    const t = cand[0];
    const total = Math.round(t.unit * qty * 100) / 100;
    return { qty, tier: t, total, rows };
  }
  V97CTY.calcFor = calcFor;
  const money = (cur, v, unit) => cur === "¥" ? "¥" + (Math.round(v) === v ? v.toLocaleString("en-US") : v.toLocaleString("en-US", { maximumFractionDigits: 2 })) : "US$" + (unit || Math.round(v * 100) % 100 ? v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : Math.round(v).toLocaleString("en-US"));
  const ASK_PRICE = /いくら|幾ら|金額|価格|値段|見積|合計|総額|費用|代金|price|cost|quot|total|how much|amount|多少钱|价格|precio|cuánto/i;
  if (typeof v84cfAnsMark === "function") {
    const __am97 = v84cfAnsMark;
    v84cfAnsMark = function (o, q, n0) { // eslint-disable-line no-global-assign
      let C = null, has = false;
      try {
        if (o && typeof o === "object" && typeof o.a === "string") {
          const tpl = document.createElement("template");
          tpl.innerHTML = o.a;
          const txt = tpl.content.textContent || "";
          C = calcFor(q, txt);
          if (C) {
            const key = (v) => String(Math.round(v * 1e6) / 1e6);
            const nums = (typeof v84cfNums === "function" ? v84cfNums(txt) : []).map((x) => key(parseFloat(x)));
            has = nums.indexOf(key(C.total)) >= 0;
          }
        }
      } catch (e) { err("calc", e); C = null; }
      // 価格表から計算した合計・単価・数量は「根拠あり」として渡す（点線にしない）
      const q2 = C && has ? String(q || "") + "\n" + [C.total, C.tier.unit, C.qty].join(" ") : q;
      let r = __am97.call(this, o, q2, n0);
      try {
        if (C && r && typeof r.a === "string" && r.a.indexOf("v97calc") < 0) {
          const rng = C.tier.min != null ? (C.tier.max != null ? C.tier.min.toLocaleString("en-US") + "〜" + C.tier.max.toLocaleString("en-US") : C.tier.min.toLocaleString("en-US") + M("〜", "+")) : "";
          const lab = C.tier.label || M("価格表", "price list");
          const tierTxt = M("『" + lab + "』" + (rng && lab.indexOf(rng.replace("〜", "")) < 0 ? "（" + rng + M("の段", "") + "）" : ""), "“" + lab + "”" + (rng && lab.indexOf(rng.replace("〜", "")) < 0 ? " (" + rng + ")" : ""));
          if (!has && !ASK_PRICE.test(String(q || ""))) return r; // 値段を聞いていない質問には出さない
          const line = money(C.tier.cur, C.tier.unit, 1) + M("／個 × ", " × ") + C.qty.toLocaleString("en-US") + M("個 ＝ ", " = ") + money(C.tier.cur, C.total);
          let h;
          if (has) { h = '<p class="v97calc ok" data-noi18n="1">' + E(M("計算の根拠（この商品の価格表）：", "Basis of the calculation (this product's price list): ") + tierTxt + " " + line) + "</p>"; V97CTY.n.calc++; }
          else { h = '<p class="v97calc ng" data-noi18n="1">' + E(M("価格表から計算すると：", "From the price list: ") + tierTxt + " " + line + M("。答えの金額と違うときは、価格表の段を確かめてください。", ". If this differs from the answer, check the price tier.")) + "</p>"; V97CTY.n.calcNg++; }
          const r0 = r === o ? Object.assign({}, o) : r;
          r0.a = r0.a + h;
          r = r0;
        }
      } catch (e) { err("calcFoot", e); }
      return r;
    };
  }
})();
