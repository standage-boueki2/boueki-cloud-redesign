/* ═══ v21.98 price（2026-11-18 第11回相当 UAT・21.97.2）No.540 価格帯の第1帯の数量下限・帯の形の照合
   土台・前の層（base97.html・rd・v95〜v97）は書き換えず、前の関数を控えてから包む。
   No.540（高）ヒアリングで「600個以上 $4.80、1000個以上 $4.30」と答えても、価格表の第1行が数量帯なしの「FOB $4.80」になり、
     A 有機味噌の 600個の PI が「1000個以上 $4.30」の帯で 600×$4.30＝$2,580（正しくは $2,880）になった。
     原因：① ヒアリングの価格の読み取り（v54hearPrices・決まった処理。AI モードでも AI が返した値を同じ処理で読む）は、
              金額の前後に建値（FOB など）があると、行の名前（数量帯の欄）を建値の「FOB」にして、前にある「600個以上」を捨てていた。
              「$4.80（600個以上）」のように数量が金額の後ろにあると「単価」、「MOQ 600個 $4.80」は MOQ の答えに取られて行ごと消えていた。
           ② 帯の判定（tierFor → v54docTiers・v54docPick）は、数量の無い行を帯から外し、残りの帯で選ぶ。
              帯が2つ以上残る（1000個以上・3000個以上）と、600個はどの帯にも入らず「いちばん近い帯」＝1000個以上の $4.30 を返し、
              PI・AI 相談・価格の答えがその単価で合計を出していた（⚠「どの帯にも入っていません」は出すが、金額は誤ったまま）。
              帯が1つしか残らないと帯の判定をやめ、1行目（FOB $4.80）の単価を数量に関係なく使っていた（5,000個でも $4.80）。
     直し：① 読み取り：金額ごとに、同じ区切り（、・／・改行）の中の前後の文から数量の言い方（600個以上・1〜99個・600pcs+・MOQ 600個）を探し、
              行の名前にする（建値は商品の建値が空なら建値に入れる）。MOQ の答えに取られた「MOQ 600個 $4.80」は、価格の質問では価格表にも残す。
           ② 帯の形の照合（v98pxShape）：数量の列・単価の列・各行の数量の下限と上限・単位・通貨を読み、
              「数量の無い行（第1帯の数量が未登録）」「同じ下限の帯」「単位・通貨の混在」を機械的に見つける。
           ③ 直せるものは直す（v98pxRepair）：数量の無い行は、ヒアリングの答え（新しく覚える）・取り込んだ資料の文から同じ金額の帯を探して戻す。
              戻せないときは、商品情報の価格表に「第1帯の数量が未登録です」と入れる欄を出す。
           ④ 金額に使う所（PI・見積の受注内容の編集・AI 相談の価格の計算・価格の答え）は、数量がどの帯にも入らない
              （最小の帯より少ない・最大の帯より多い・帯の間・数量の無い行の帯）ときは、推し量った単価で計算しない。
              PI は単価・合計を「—」にして、理由と「価格表に帯を足す」「単価を手で入れる」を出し、送る前の点検で止める。
              AI 相談は、AI に「価格表から決められない数量」と渡し、答えの金額は確かめられていないと出す。 */
var V98PRICE = window.V98PRICE = { v: "21.98", err: null, errs: [], n: { lbl: 0, moq: 0, repair: 0, stop: 0, tier: 0, ai: 0, ans: 0, ck: 0, term: 0 }, last: null };
(function () {
  "use strict";
  const W = window;
  const err = (k, e) => { try { const s = k + ": " + String((e && e.message) || e).slice(0, 200); V98PRICE.err = s; V98PRICE.errs.push(s); if (V98PRICE.errs.length > 40) V98PRICE.errs.shift(); console.warn("[v98price]", k, e); } catch (x) { /* 記録だけ */ } };
  const lang = () => { try { const el = document.getElementById("lang"); const v = String((el && el.value) || (typeof I18N !== "undefined" && I18N && I18N.lang) || "ja"); return /^en/.test(v) ? "en" : /^zh/.test(v) ? "zh" : /^es/.test(v) ? "es" : "ja"; } catch (e) { return "ja"; } };
  const M = (ja, en, zh, es) => { const l = lang(); return l === "en" ? en : l === "zh" ? (zh || en) : l === "es" ? (es || en) : ja; };
  const F = (s, o) => String(s).replace(/\{(\w+)\}/g, (m, k) => (o && o[k] != null ? String(o[k]) : ""));
  const E = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const NF = (s) => { let x = String(s == null ? "" : s); try { x = x.normalize("NFKC"); } catch (e) { /* そのまま */ } return x.replace(/[\s　]+/g, " ").trim(); };
  const fn = (n) => { try { return typeof W[n] === "function" ? W[n] : null; } catch (e) { return null; } };
  const ten = () => { try { return typeof TEN !== "undefined" ? TEN : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const dd = () => { try { return typeof D !== "undefined" ? D : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const fmt = (n) => (+n || 0).toLocaleString("en-US");
  V98PRICE.M = M;
  /* 固定の文の訳（アプリの辞書に足す） */
  function addDict(rows) {
    try {
      if (typeof I18N === "undefined" || !I18N || !I18N.dict) return;
      rows.forEach((r) => { ["en", "zh", "es"].forEach((l, i) => { if (r[i + 1] && I18N.dict[l] && !I18N.dict[l][r[0]]) I18N.dict[l][r[0]] = r[i + 1]; }); });
    } catch (e) { /* 訳が無いだけ */ }
  }

  /* ════════════ 数量の言い方 ════════════ */
  const UNIT = "個|本|袋|箱|ケース|カートン|瓶|缶|枚|パック|セット|台|着|足|組|冊|双|反|巻|ロール|pcs|pc|pieces?|units?|ctns?|cartons?|cases?|boxes|box|bags?|bottles?|sets?|packs?";
  const TERMS = /\b(FOB|EXW|CIF|CFR|CPT|CIP|DAP|DPU|DDP|FCA|FAS)\b/i;
  const NOTQ = (u) => { try { return typeof V54_NOTQTY_U !== "undefined" && V54_NOTQTY_U.test(String(u || "")); } catch (e) { return false; } }; // eslint-disable-line no-undef
  const rangeOf = (s) => { try { return typeof v54docQtyRange === "function" ? v54docQtyRange(s) : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const priceOf = (s) => { try { return typeof v54docPrice === "function" ? v54docPrice(s) : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const pnum = (v) => { const m = String(v == null ? "" : v).replace(/,/g, "").match(/\d+(?:\.\d+)?/); return m ? parseFloat(m[0]) : null; };
  const curOf = (v) => { const s = NF(v); return /¥|円|JPY/i.test(s) ? "JPY" : /€|EUR|ユーロ/i.test(s) ? "EUR" : /\$|USD|ドル/i.test(s) ? "USD" : ""; };
  const ugrp = (u) => { try { return typeof v54docUnitGrp === "function" ? v54docUnitGrp(u) : (String(u || "").trim().toLowerCase() || -1); } catch (e) { return -1; } }; // eslint-disable-line no-undef
  // 文の中の数量の言い方（帯）。前後の数字・金額の一部は拾わない
  const QTOK = new RegExp(
    "(?:\\d[\\d,]*\\s*(?:" + UNIT + ")?\\s*(?:[〜~～]|から|to)\\s*\\d[\\d,]*\\s*(?:" + UNIT + ")?\\s*(?:まで)?" +
    "|\\d[\\d,]*\\s*(?:" + UNIT + ")\\s*[-–]\\s*\\d[\\d,]*\\s*(?:" + UNIT + ")?" +
    "|[〜~～]\\s*\\d[\\d,]*\\s*(?:" + UNIT + ")\\s*(?:まで)?" +
    "|(?:up to|over|more than)\\s*\\d[\\d,]*\\s*(?:" + UNIT + ")" +
    "|\\d[\\d,]*\\s*(?:" + UNIT + ")?\\s*(?:以上|以下|未満|まで|から|より|\\+|or more|and above|and up|[〜~～](?!\\s*\\d)))", "gi");
  const LOT = new RegExp("(?:MOQ|最小(?:発注)?(?:数量|ロット)?|最低(?:発注)?(?:数量|ロット)?|ロット|lot|min(?:imum)?\\.?(?:\\s*order)?(?:\\s*q(?:ty|uantity))?)\\s*[:：=は]?\\s*(\\d[\\d,]*)\\s*(" + UNIT + ")", "i");
  function okTok(s, i, len) {
    const b = s.slice(Math.max(0, i - 1), i), a = s.slice(i + len, i + len + 3);
    if (/[\d.,$¥￥€]/.test(b)) return false;              // 金額・小数の一部
    if (/^\s*(?:入|ずつ|×|x\s*\d|\*|\/\s*\d)/i.test(a)) return false;   // 入り数（24個入り・12本×）
    return true;
  }
  // 文の一部から帯を1つ読む（最後に出てくるもの・前から探すときは first）
  function qtyIn(s, first) {
    s = NF(s);
    if (!s || !/\d/.test(s)) return null;
    const C = [];
    let m;
    QTOK.lastIndex = 0;
    while ((m = QTOK.exec(s))) {
      if (!m[0]) { QTOK.lastIndex++; continue; }
      const tok = m[0].trim();
      if (!okTok(s, m.index, m[0].length)) continue;
      const rg = rangeOf(tok);
      if (rg && !NOTQ(rg.u)) C.push({ label: tok.replace(/^[(（\s]+|[)）\s]+$/g, ""), lo: rg.lo, hi: rg.hi, u: rg.u || "" });
    }
    const l = s.match(LOT);
    if (l && okTok(s, l.index + l[0].indexOf(l[1]), (l[1] + l[2]).length + 1)) {
      const n = parseInt(l[1].replace(/,/g, ""), 10);
      if (n > 0 && !C.some((c) => c.lo === n)) C.push({ label: l[1] + l[2] + "以上", lo: n, hi: Infinity, u: l[2], lot: 1 });
    }
    if (!C.length) return null;
    return first ? C[0] : C[C.length - 1];
  }
  // 価格表の数量の欄のセルを読む（帯・下限だけの「600個」・飾りつき「FOB 600個以上」「MOQ 600個」）
  function qtyOf(cell) {
    const s = NF(cell);
    if (!s || !/\d/.test(s)) return null;
    const r = rangeOf(s);
    if (r) return NOTQ(r.u) ? null : { lo: r.lo, hi: r.hi, u: r.u || "", how: "range" };
    try {
      const ln = typeof v54docLotNum === "function" ? v54docLotNum(s) : null; // eslint-disable-line no-undef
      if (ln && ln.u && !NOTQ(ln.u)) return { lo: ln.n, hi: Infinity, u: ln.u, how: "lot" };
    } catch (e) { /* 下へ */ }
    const q = qtyIn(s);
    if (q && !/[$¥￥€]|US\$|USD|円|ドル/.test(s)) return { lo: q.lo, hi: q.hi, u: q.u, how: q.lot ? "lot" : "deco", label: q.label };
    return null;
  }
  V98PRICE.qtyIn = qtyIn;
  V98PRICE.qtyOf = qtyOf;

  /* ════════════ 帯の形の照合 ════════════ */
  const INTERNAL = /国内|卸値|小売|上代|下代|定価|参考|社内|サンプル|sample|見本|送料|運賃|物流費|freight|shipping/i;
  const OTHERH = /走行|距離|mileage|odometer|\bkm\b|稼働|稼動|アワー|hour|年式|model\s*year|サイズ|size|容量|重量|weight|色|カラー|color|colour|品番|型番|sku|規格|グレード|grade/i;
  const QTYH = /数量|ロット|qty|quantity|moq|発注|注文|区分|個数|本数|枚数|台数|lot/i;
  const PRICEH = /単価|価格|price|卸|fob|cif|exw|usd|ドル|円|金額/i;
  function shape(cols, rows) {
    const S = { kind: "none", qi: 0, pi: -1, bands: [], loose: [], issues: [], ok: true };
    try {
      cols = Array.isArray(cols) ? cols.map((c) => NF(c)) : [];
      rows = (Array.isArray(rows) ? rows : []).filter(Array.isArray);
      if (!rows.length) return S;
      try {
        if ((typeof v54docColTiers === "function" && v54docColTiers(cols)) || (typeof v54docHdrTiers === "function" && v54docHdrTiers(cols, rows[0]).length)) { S.kind = "hdr"; return S; } // eslint-disable-line no-undef
        if (typeof v54docCellTiers === "function" && rows.some((r) => r.some((c) => v54docCellTiers(c).length))) { S.kind = "cell"; return S; } // eslint-disable-line no-undef
      } catch (e) { /* 下へ */ }
      const h0 = cols[0] || "";
      if (h0 && OTHERH.test(h0) && !QTYH.test(h0)) { S.kind = "other"; return S; }
      let qi = cols.findIndex((c) => QTYH.test(c) && !OTHERH.test(c));
      if (qi < 0) qi = 0;
      S.qi = qi;
      let pi = -1;
      try { if (typeof v56hearPxIsFixed === "function" && v56hearPxIsFixed(cols)) pi = 1; } catch (e) { /* 下へ */ } // eslint-disable-line no-undef
      if (pi < 0) pi = cols.findIndex((c, i) => i !== qi && PRICEH.test(c) && !QTYH.test(c));
      S.pi = pi;
      const cellPrice = (r) => {
        if (pi >= 0) { const p = priceOf(r[pi]); if (p) return p; }
        for (let i = 0; i < r.length; i++) { if (i === qi) continue; const p = priceOf(r[i]); if (p && p.cur) return p; }
        return null;
      };
      rows.forEach((r, ri) => {
        const pr = cellPrice(r);
        if (!pr) return;
        const lab = NF(r[qi]);
        const q = qtyOf(lab);
        const cur = curOf(pr.v) || curOf(cols[pi] || "");
        if (q) { S.bands.push({ ri, lo: q.lo, hi: q.hi, u: q.u, how: q.how, label: lab, v: pr.v, cur, n: pnum(pr.v) }); return; }
        if (INTERNAL.test(lab)) return;
        // 数字のある名前（「1ケース（12本）」など入り数・荷姿の価格）は帯の候補にしない。数量の無い帯＝建値・「単価」・空欄など
        if (/\d/.test(lab)) return;
        S.loose.push({ ri, label: lab, v: pr.v, cur, n: pnum(pr.v) });
      });
      // 帯の表：「以上・〜」の帯が1つ以上あるか、数だけの下限（600個・1,000個）が2つ以上
      if (!S.bands.length || !(S.bands.some((b) => b.how !== "lot") || S.bands.length >= 2)) { S.kind = "flat"; S.loose = []; return S; }
      // 最後の帯の後ろの数量の無い行は、最後の帯が「以上」（上限なし）なら単価の決め方に関わらない（荷姿・参考の行）
      const lastB = S.bands[S.bands.length - 1];
      S.loose = S.loose.filter((x) => !(x.ri > lastB.ri && lastB.hi === Infinity));
      if (qi !== 0 && rows.some((r) => NF(r[0]) && !qtyOf(r[0]) && !priceOf(r[0]))) {
        // 品目ごとに帯がある表（1列目が品名）は、品目が1つのときだけ照らす
        const names = new Set(rows.map((r) => NF(r[0])).filter(Boolean));
        if (names.size > 1) { S.kind = "multi"; return S; }
      }
      S.kind = "bands";
      const B = S.bands;
      // 帯の順番（行の順に下限が増えるか）
      S.asc = B.every((b, i) => i === 0 || b.lo > B[i - 1].lo);
      if (S.loose.length) {
        const first = S.loose[0].ri < B[0].ri;
        S.loose.forEach((x) => { S.issues.push({ k: x.ri < B[0].ri ? "firstNoQty" : "noQty", ri: x.ri, v: x.v, label: x.label }); });
        S.firstNoQty = first;
      }
      const los = {};
      B.forEach((b) => { if (los[b.lo] != null && B[los[b.lo]].v !== b.v) S.issues.push({ k: "dupLo", ri: b.ri, lo: b.lo }); los[b.lo] = B.indexOf(b); });
      const us = [...new Set(B.map((b) => ugrp(b.u)).filter((g) => g !== -1))];
      if (us.length > 1) S.issues.push({ k: "unit", units: [...new Set(B.map((b) => b.u).filter(Boolean))] });
      const cs = [...new Set(B.concat(S.loose).map((b) => b.cur).filter(Boolean))];
      if (cs.length > 1) S.issues.push({ k: "cur", curs: cs });
      if (!S.asc) S.issues.push({ k: "order", soft: 1 });
      S.ok = !S.issues.some((x) => !x.soft);
    } catch (e) { err("shape", e); }
    return S;
  }
  V98PRICE.shape = shape;
  W.v98pxShape = shape;

  // 帯を数量の順に並べ、開いた上限（以上）を次の帯の下限の手前で切る
  function ladder(S) {
    const s = S.bands.slice().sort((a, b) => a.lo - b.lo).map((b) => Object.assign({}, b));
    for (let i = 0; i < s.length - 1; i++) if (s[i].hi === Infinity && s[i + 1].lo - 1 >= s[i].lo) s[i].hi = s[i + 1].lo - 1;
    return s;
  }
  // 数量 n の単価を決める。決められないときは stop（理由）を返す。帯の表でないときは pass（今まで通り）
  function pick(S, n, u) {
    if (!S || S.kind !== "bands") return { pass: 1 };
    n = +n;
    if (!(n > 0)) return { pass: 1 };
    const L = ladder(S);
    const lo0 = L[0], top = L[L.length - 1];
    const hits = L.filter((b) => n >= b.lo && n <= b.hi);
    const hit = hits.length ? hits.reduce((a, b) => (b.lo >= a.lo ? b : a)) : null;
    const info = { n, u: u || (hit || lo0).u || "", min: lo0, max: top, loose: S.loose[0] || null, bands: L };
    if (S.issues.some((x) => x.k === "cur")) return Object.assign(info, { stop: "cur" });
    if (hit) {
      // 数量の無い行が、この帯と次の帯の間にあるとき（並びが昇順の表だけ）は、どちらの単価か決められない
      if (S.loose.length) {
        if (!S.asc) { if (hit !== top) return Object.assign(info, { stop: "noQty", near: hit }); }
        else {
          const nx = S.bands.find((b) => b.ri > hit.ri);
          const mid = S.loose.find((x) => x.ri > hit.ri && (!nx || x.ri < nx.ri));
          if (mid) return Object.assign(info, { stop: "noQty", near: hit, loose: mid });
        }
      }
      return Object.assign(info, { ok: 1, v: hit.v, label: hit.label, lo: hit.lo, hi: hit.hi, b: hit });
    }
    if (n < lo0.lo) return Object.assign(info, { stop: S.loose.length && S.loose[0].ri < S.bands[0].ri ? "firstNoQty" : "below", near: lo0 });
    if (n > top.hi) return Object.assign(info, { stop: "above", near: top });
    const a = L.filter((b) => b.hi < n).pop(), b = L.find((x) => x.lo > n);
    return Object.assign(info, { stop: S.loose.length ? "noQty" : "gap", near: a || b, a, b });
  }
  function rowsFor(cols, row) {
    try { if (typeof v54docRowsFor === "function") return v54docRowsFor(cols, row); } catch (e) { /* 下へ */ } // eslint-disable-line no-undef
    return [row];
  }
  function pxFor(t, n, u) {
    if (!t || !Array.isArray(t.priceRows) || !t.priceRows.length) return { pass: 1 };
    return pick(shape(t.priceCols, t.priceRows), n, u);
  }
  V98PRICE.pick = pick;
  V98PRICE.pxFor = pxFor;
  W.v98pxFor = pxFor;

  /* 決められない理由の文（PI・AI 相談・価格の答え・受注内容の編集で同じ文） */
  function whyText(g) {
    const n = fmt(g.n) + (g.u || "");
    const lb = (b) => (b ? `${b.label}（${b.v}）` : "");
    switch (g.stop) {
      case "firstNoQty": return M(`価格表の第1帯（${g.loose ? g.loose.v : ""}）の数量が未登録のため、${n} がどの帯か決められません。`, `The quantity of the first band (${g.loose ? g.loose.v : ""}) is not registered in your price list, so the band for ${n} cannot be determined.`, `价格表第1档（${g.loose ? g.loose.v : ""}）的数量未登记，无法确定 ${n} 属于哪一档。`, `La cantidad del primer tramo (${g.loose ? g.loose.v : ""}) no está registrada, así que no se puede saber el tramo de ${n}.`);
      case "noQty": return M(`価格表に数量の無い行（${g.loose ? (g.loose.label || "—") + " " + g.loose.v : ""}）があり、${n} がどの帯か決められません。`, `Your price list has a row without a quantity (${g.loose ? (g.loose.label || "—") + " " + g.loose.v : ""}), so the band for ${n} cannot be determined.`, `价格表中有未填写数量的行（${g.loose ? (g.loose.label || "—") + " " + g.loose.v : ""}），无法确定 ${n} 属于哪一档。`, `La lista tiene una fila sin cantidad (${g.loose ? (g.loose.label || "—") + " " + g.loose.v : ""}), así que no se puede saber el tramo de ${n}.`);
      case "below": return M(`${n} は、価格表の最小の帯「${lb(g.min)}」より少ない数量です。この数量の単価は価格表にありません。`, `${n} is below the smallest band “${lb(g.min)}”. Your price list has no unit price for this quantity.`, `${n} 少于价格表最小档“${lb(g.min)}”。价格表中没有该数量的单价。`, `${n} es menor que el tramo más pequeño «${lb(g.min)}». La lista no tiene precio para esta cantidad.`);
      case "above": return M(`${n} は、価格表の最大の帯「${lb(g.max)}」より多い数量です。この数量の単価は価格表にありません。`, `${n} is above the largest band “${lb(g.max)}”. Your price list has no unit price for this quantity.`, `${n} 多于价格表最大档“${lb(g.max)}”。价格表中没有该数量的单价。`, `${n} supera el tramo más grande «${lb(g.max)}». La lista no tiene precio para esta cantidad.`);
      case "gap": return M(`${n} は、価格表の帯と帯の間（「${lb(g.a)}」と「${lb(g.b)}」の間）の数量です。この数量の単価は価格表にありません。`, `${n} falls between two bands (“${lb(g.a)}” and “${lb(g.b)}”). Your price list has no unit price for this quantity.`, `${n} 位于两个档位之间（“${lb(g.a)}”与“${lb(g.b)}”之间）。价格表中没有该数量的单价。`, `${n} queda entre dos tramos («${lb(g.a)}» y «${lb(g.b)}»). La lista no tiene precio para esta cantidad.`);
      case "cur": return M("価格表の帯で通貨がそろっていません（US$ と ¥ など）。どの通貨の単価か決められません。", "The bands in your price list use different currencies (e.g. US$ and ¥), so the unit price cannot be determined.", "价格表各档的币种不一致（如 US$ 与 ¥），无法确定单价。", "Los tramos usan monedas distintas (p. ej. US$ y ¥), así que no se puede fijar el precio.");
      default: return "";
    }
  }
  const STOP_HEAD = () => M("推し量った単価では計算していません。", "No unit price has been guessed.", "未使用推测的单价计算。", "No se ha calculado con un precio supuesto.");
  const FIX_HOW = (g) => (g.stop === "firstNoQty" || g.stop === "noQty")
    ? M("商品情報の価格表で、その行の数量（例：600個以上）を入れると計算できます。", "Enter the quantity of that row (e.g. 600 pcs or more) in the price list on the product page to calculate.", "在商品信息的价格表中填写该行的数量（例：600个以上）即可计算。", "Introduzca la cantidad de esa fila (p. ej. 600 uds. o más) en la lista de precios del producto.")
    : M("価格表にこの数量の帯を足すか、この取引の単価を手で入れてください。", "Add a band for this quantity to the price list, or enter the unit price for this deal by hand.", "请在价格表中添加该数量的档位，或手动填写本次交易的单价。", "Añada un tramo para esta cantidad o introduzca el precio a mano.");
  V98PRICE.whyText = whyText;
  V98PRICE.fixHow = FIX_HOW;

  /* ════════════ ① ヒアリングの価格の読み取り：行の名前に数量の帯を残す ════════════ */
  const AMT = /(US\$|USD|\$|¥|JPY|€|EUR)\s?(\d[\d,]*(?:\.\d+)?)|(\d[\d,]*(?:\.\d+)?)\s?(円|米ドル|ドル|USD|ユーロ|EUR)/gi;
  function cleanText(text) {
    let s = "";
    try { s = (typeof v54hearNorm === "function" ? v54hearNorm(text) : NF(text)).replace(/￥/g, "¥"); } catch (e) { s = NF(text); } // eslint-disable-line no-undef
    try { if (typeof V54HEAR_FX !== "undefined") V54HEAR_FX.forEach((re) => { s = s.replace(re, " "); }); } catch (e) { /* そのまま */ } // eslint-disable-line no-undef
    return s;
  }
  const SEPRE = () => { let U = UNIT; try { if (typeof V54HEAR_UNIT !== "undefined") U = V54HEAR_UNIT; } catch (e) { /* 既定 */ } return new RegExp("\\n|、|;|。|\\/(?!\\s*(?:" + U + "))|／|,(?!\\d{3})", "g"); }; // eslint-disable-line no-undef
  // 文の中の金額と、その金額の帯（同じ区切りの中の、前の金額の後ろ〜次の金額の前）
  function amountsWithQty(text) {
    const s = cleanText(text);
    const seps = [];
    const re = SEPRE();
    let m;
    while ((m = re.exec(s))) { seps.push(m.index); if (!m[0]) re.lastIndex++; }
    const A = [];
    AMT.lastIndex = 0;
    while ((m = AMT.exec(s))) {
      const num = parseFloat(String(m[2] || m[3]).replace(/,/g, ""));
      if (!isFinite(num) || num <= 0) continue;
      A.push({ i: m.index, j: m.index + m[0].length, num, cur: curOf(m[0]), raw: m[0] });
    }
    A.forEach((a, k) => {
      const segA = seps.filter((x) => x < a.i).pop(), segB = seps.find((x) => x >= a.j);
      const from = Math.max(segA == null ? 0 : segA + 1, k ? A[k - 1].j : 0);
      const to = Math.min(segB == null ? s.length : segB, k < A.length - 1 ? A[k + 1].i : s.length);
      const before = s.slice(from, a.i), after = s.slice(a.j, to);
      a.q = qtyIn(before) || qtyIn(after, true);
      a.ctx = before + " " + after;
    });
    return A;
  }
  V98PRICE.amountsWithQty = amountsWithQty;
  const isQtyLabel = (lab) => { const q = qtyOf(lab); return !!(q && q.how === "range"); };
  if (fn("v54hearPrices")) {
    const __hp98 = v54hearPrices; // eslint-disable-line no-undef
    v54hearPrices = function (text, opt) { // eslint-disable-line no-global-assign
      const r = __hp98.apply(this, arguments);
      try {
        if (!Array.isArray(r) || !r.length) return r;
        const ex = r.filter((f) => f && (f.kind === "exp" || f.kind === "amb"));
        if (!ex.length) return r;
        const srcs = [String(text || "")];
        const li = V98PRICE.lastIn;
        if (li && li.k === "priceRows" && Date.now() - li.at < 120000 && li.v && li.v !== String(text || "")) srcs.push(li.v);
        const lists = srcs.map(amountsWithQty);
        const used = lists.map(() => new Set());
        r.forEach((f) => {
          if (!f || !(f.kind === "exp" || f.kind === "amb")) return;
          const curF = f.cur || curOf(f.price);
          let q = null;
          for (let s = 0; s < lists.length && !q; s++) {
            const k = lists[s].findIndex((a, i) => !used[s].has(i) && Math.abs(a.num - f.num) < 1e-9 && (!a.cur || !curF || a.cur === curF));
            if (k < 0) continue;
            used[s].add(k);
            q = lists[s][k].q;
          }
          if (!q) return;
          if (isQtyLabel(f.label)) {
            // 行の名前がもう帯なら変えない（同じ下限のとき）
            const q0 = qtyOf(f.label);
            if (q0 && q0.lo === q.lo) return;
            if (q0) return;
          }
          f.v98from = f.label;
          f.label = q.label;
          V98PRICE.n.lbl++;
        });
      } catch (e) { err("hearPrices", e); }
      return r;
    };
  }
  /* ヒアリングの AI の読み取りの前に、利用者が書いたそのままの答えを覚える（AI が数量を落として返しても、元の答えから帯を戻す） */
  if (fn("llmFillTriage")) {
    const __ft98 = llmFillTriage; // eslint-disable-line no-undef
    llmFillTriage = function (cu, v) { // eslint-disable-line no-global-assign
      try { if (cu && cu.k === "priceRows") V98PRICE.lastIn = { k: "priceRows", v: String(v == null ? "" : v).slice(0, 1000), at: Date.now() }; } catch (e) { err("triage", e); }
      return __ft98.apply(this, arguments);
    };
  }
  /* 「MOQ 600個 $4.80／1,000個以上 $4.30」：価格の質問では、MOQ に取られた「600個 $4.80」も価格表に残す（MOQ には数だけ） */
  if (fn("v56hearPrep")) {
    const __pp98 = v56hearPrep; // eslint-disable-line no-undef
    v56hearPrep = function (v) { // eslint-disable-line no-global-assign
      const R = __pp98.apply(this, arguments);
      try {
        const cu = (typeof FILL !== "undefined" && FILL) ? FILL.cur : null; // eslint-disable-line no-undef
        if (R && cu && cu.k === "priceRows" && Array.isArray(R.items)) {
          const hit = R.items.filter((it) => it && it.k === "moq" && /(US\$|USD|\$|¥|￥|JPY|€|EUR)\s?\d|\d\s?(円|米ドル|ドル|USD|ユーロ|EUR)/i.test(NF(it.v)));
          if (hit.length) {
            hit.forEach((it) => { it.v = NF(it.v).replace(/(?:US\$|USD|\$|¥|JPY|€|EUR)\s?\d[\d,]*(?:\.\d+)?|\d[\d,]*(?:\.\d+)?\s?(?:円|米ドル|ドル|USD|ユーロ|EUR)/gi, " ").replace(/[\s:：=]+$/, "").trim(); });
            R.items = R.items.filter((it) => !(it && it.k === "moq" && !String(it.v || "").trim()));
            R.rest = String(v == null ? "" : v).trim();
            V98PRICE.n.moq++;
            if (!R.items.length) return null;
          }
        }
      } catch (e) { err("prep", e); }
      return R;
    };
  }
  /* 保存のとき：答えを覚える（あとで帯を戻せるように）・建値（FOB など）が答えにあり、商品の建値が空なら入れる・形を照らして直す */
  if (fn("v54hearPriceSave")) {
    const __ps98 = v54hearPriceSave; // eslint-disable-line no-undef
    v54hearPriceSave = function (Fs, raw) { // eslint-disable-line no-global-assign
      const t = ten();
      const r = __ps98.apply(this, arguments);
      try {
        if (t && Array.isArray(Fs) && Fs.some((f) => f && f.kind === "exp")) {
          const L = Array.isArray(t.v98pxRaw) ? t.v98pxRaw.slice(-4) : [];
          [raw, V98PRICE.lastIn && V98PRICE.lastIn.k === "priceRows" && Date.now() - V98PRICE.lastIn.at < 120000 ? V98PRICE.lastIn.v : ""].forEach((x) => { x = String(x || "").trim().slice(0, 400); if (x && L.indexOf(x) < 0) L.push(x); });
          t.v98pxRaw = L.slice(-5);
          const ex = Fs.filter((f) => f && f.kind === "exp");
          const codes = [...new Set(ex.map((f) => String(f.term || "").toUpperCase()).filter(Boolean))];
          if (codes.length === 1 && !String(t.term || "").trim() && typeof applyAnswer === "function") { applyAnswer(t, "term", codes[0]); V98PRICE.n.term++; } // eslint-disable-line no-undef
          repair(t, "hear");
          try { if (typeof saveTen === "function") saveTen(); } catch (e) { /* 保存は本体の流れでも */ } // eslint-disable-line no-undef
        }
      } catch (e) { err("hearSave", e); }
      return r;
    };
  }

  /* ════════════ ③ 保存ずみの価格表を直す（元の答え・資料の文から、同じ金額の帯を戻す） ════════════ */
  function textsOf(t) {
    const L = [];
    try {
      (Array.isArray(t.v98pxRaw) ? t.v98pxRaw : []).forEach((x) => L.push({ src: "hear", txt: String(x) }));
      (Array.isArray(t.sources) ? t.sources : []).forEach((s) => { if (s && s.on !== false && s.txt) L.push({ src: "doc", txt: String(s.txt).slice(0, 60000), name: s.name || "" }); });
      if (t.srcCorpus) L.push({ src: "doc", txt: String(t.srcCorpus).slice(0, 60000) });
      (Array.isArray(t.domPx) ? t.domPx : []).forEach((x) => { if (x && x.raw) L.push({ src: "hear", txt: String(x.raw) }); });
    } catch (e) { err("texts", e); }
    return L;
  }
  const CHK = typeof WeakMap === "function" ? new WeakMap() : null;   // 同じ表・同じ文は2回読まない（描画のたびに呼ばれるため）
  function repair(t, why) {
    try {
      if (!t || !Array.isArray(t.priceRows) || !t.priceRows.length) return null;
      if (t.src === "sample") return null;
      const S = shape(t.priceCols, t.priceRows);
      if (S.kind !== "bands" || !S.loose.length) return null;
      const T = textsOf(t);
      if (!T.length) return null;
      const sig = JSON.stringify(t.priceRows) + "|" + T.map((x) => x.txt.length + ":" + x.txt.slice(0, 40)).join(",");
      if (CHK && why === "load" && CHK.get(t) === sig) return null;
      if (CHK) CHK.set(t, sig);
      const lists = T.map((x) => ({ x, A: amountsWithQty(x.txt) }));
      const fixed = [];
      S.loose.forEach((x) => {
        const cands = [];
        lists.forEach(({ x: src, A }) => A.forEach((a) => { if (a.q && Math.abs(a.num - x.n) < 1e-9 && (!a.cur || !x.cur || a.cur === x.cur)) cands.push({ q: a.q, src: src.src }); }));
        if (!cands.length) return;
        const labs = [...new Set(cands.map((c) => c.q.lo + "|" + c.q.hi))];
        if (labs.length !== 1) return;          // 同じ金額で違う帯が書かれている＝決められない
        const q = cands[0].q;
        if (S.bands.some((b) => b.lo === q.lo)) return;  // ほかの帯と同じ下限
        const nx = S.bands.filter((b) => b.ri > x.ri).sort((a, b) => a.ri - b.ri)[0];
        if (S.asc && nx && !(q.lo < nx.lo)) return;      // 並びと合わない
        const row = t.priceRows[x.ri];
        if (!Array.isArray(row)) return;
        const before = String(row[S.qi] == null ? "" : row[S.qi]);
        row[S.qi] = q.label;
        fixed.push({ ri: x.ri, from: before, to: q.label, src: cands[0].src });
      });
      if (!fixed.length) return null;
      const L = Array.isArray(t.v98pxFix) ? t.v98pxFix : [];
      fixed.forEach((f) => L.push(Object.assign({ at: Date.now(), why: why || "" }, f)));
      t.v98pxFix = L.slice(-10);
      V98PRICE.n.repair += fixed.length;
      V98PRICE.last = { repair: fixed, item: t.item || "" };
      return fixed;
    } catch (e) { err("repair", e); return null; }
  }
  V98PRICE.repair = repair;
  W.v98pxRepair = repair;

  /* ════════════ ② 帯の判定：数量の無い行がある表でも、決まっている帯で選ぶ。決められない数量は out（理由つき） ════════════ */
  if (fn("tierFor")) {
    const __tf98 = tierFor; // eslint-disable-line no-undef
    tierFor = function (row, cols, qty) { // eslint-disable-line no-global-assign
      const r = __tf98.apply(this, arguments);
      try {
        if (!Array.isArray(row) || !(+qty > 0)) return r;
        const rows = rowsFor(cols, row);
        if (!rows.includes(row)) return r;
        const S = shape(cols, rows);
        if (S.kind !== "bands") return r;
        const g = pick(S, +qty);
        if (g.pass) return r;
        if (g.ok) {
          if (r && r.v54 && !r.out && String(r.v) === String(g.v)) return r;
          V98PRICE.n.tier++;
          return { v: g.v, label: g.label, v54: 1, out: false, lo: g.lo, hi: g.hi, v98: 1 };
        }
        V98PRICE.n.stop++;
        const nb = g.near || g.min;
        return Object.assign({}, r || {}, { v: (r && r.v) || (nb && nb.v), label: (r && r.label) || (nb && nb.label) || "", v54: 1, out: true, v98stop: g.stop, v98g: g });
      } catch (e) { err("tierFor", e); return r; }
    };
  }

  /* ════════════ ④ PI（見積送り状）：決められない数量では単価を入れない ════════════ */
  const qtyU = (s) => { const m = NF(s).match(/[\d,]+(?:\.\d+)?\s*([^\d\s（(、,，.。/／]+)/); return m ? m[1].replace(/（.*$/, "") : ""; };
  const numOf = (s) => { try { return typeof v54docNum === "function" ? v54docNum(s) : pnum(s); } catch (e) { return pnum(s); } }; // eslint-disable-line no-undef
  function gateShip(d, t) {
    try {
      const S = d && d.ship;
      if (!S || !t || S.poNo || !S.v54gen || S.v61fb) return;
      const P = S.v54price || {};
      if (!(P.k === "tier" || P.k === "table")) return;
      if (t.shipEdit && t.shipEdit.v54 && t.shipEdit.v54.manualPrice) return;
      const n = numOf(S.qty);
      if (!n) return;
      const g = pxFor(t, n, qtyU(S.qty));
      if (!g.stop) return;
      S.unitPrice = "—";
      S.total = "—";
      let how = FIX_HOW(g);
      // 下書きの数量が MOQ 未登録のための仮の数（想定シナリオ）のときは、MOQ を入れればその数量で作れることも出す
      if (/想定シナリオ/.test(String(S.qty || "")) && !numOf(t.moq)) how = M("この下書きの数量は、MOQ（最小発注数量）が未登録のための仮の数です。商品情報で MOQ を登録すると、その数量で下書きを作ります。", "The quantity in this draft is a placeholder because the MOQ is not registered. Register the MOQ on the product page to build the draft with that quantity.", "此草稿的数量是因未登记 MOQ（最小起订量）而使用的临时数量。在商品信息中登记 MOQ 后，将按该数量生成草稿。", "La cantidad de este borrador es provisional porque no hay MOQ registrado. Registre el MOQ para generar el borrador con esa cantidad.") + " " + how;
      S.v54price = { k: "none", v: "—", v98: { stop: g.stop, why: whyText(g), how, n, u: g.u } };
      try { if (typeof v54docSyncRows === "function") v54docSyncRows(S); } catch (e) { /* 表は次の描画で */ } // eslint-disable-line no-undef
      try { const R = S.docRows; if (R && Array.isArray(R.pi) && R.pi.length === 1 && Array.isArray(R.pi[0])) { R.pi[0][2] = "—"; R.pi[0][3] = "—"; } } catch (e) { /* そのまま */ }
      V98PRICE.n.stop++;
    } catch (e) { err("gateShip", e); }
  }
  V98PRICE.gateShip = gateShip;
  if (fn("tenantToD")) {
    const __ttd98 = tenantToD; // eslint-disable-line no-undef
    tenantToD = function (t) { // eslint-disable-line no-global-assign
      try { if (t && (t.src === "upload" || t.src === "sample2")) repair(t, "load"); } catch (e) { err("ttd-pre", e); }
      const d = __ttd98.apply(this, arguments);
      try { if (d && t) gateShip(d, t); } catch (e) { err("ttd", e); }
      return d;
    };
  }
  function stopHtml(g, where) {
    const why = g.why || whyText(g), how = g.how || FIX_HOW(g);
    return `<span class="v98px-stop" data-noi18n="1" role="note"><b>⚠ ${E(M("単価を入れていません", "No unit price entered", "未填写单价", "Sin precio unitario"))}</b>：${E(why)}${E(STOP_HEAD())}<br>${E(how)}
      <span class="v98px-acts"><button type="button" class="btn g v98px-btn" data-v98px-act="table">${E(M("価格表に帯を足す", "Add a band to the price list", "在价格表中添加档位", "Añadir un tramo"))}</button>${where === "pi" ? `<button type="button" class="btn g v98px-btn" data-v90act="setbuyer">${E(M("単価を手で入れる", "Enter the unit price by hand", "手动填写单价", "Introducir el precio a mano"))}</button>` : ""}</span></span>`;
  }
  V98PRICE.stopHtml = stopHtml;
  if (fn("v54docSrcNote")) {
    const __sn98 = v54docSrcNote; // eslint-disable-line no-undef
    v54docSrcNote = function (S) { // eslint-disable-line no-global-assign
      try {
        const k = String(W.__poDocK || "pi");
        if (S && !S.poNo && S.v54price && S.v54price.v98 && S.v54price.v98.stop && (k === "pi" || k === "ci")) return stopHtml(S.v54price.v98, "pi");
      } catch (e) { err("srcNote", e); }
      return __sn98.apply(this, arguments);
    };
  }
  /* 送る前の点検：単価が決められないときは赤で止める */
  if (fn("v33CkQuote")) {
    const __ck98 = v33CkQuote; // eslint-disable-line no-undef
    v33CkQuote = function () { // eslint-disable-line no-global-assign
      let F0 = __ck98.apply(this, arguments);
      try {
        const S = dd() && dd().ship;
        const x = S && !S.poNo && S.v54price && S.v54price.v98;
        if (x && x.stop && Array.isArray(F0)) {
          F0 = F0.filter((f) => !(f && f.v98px));
          F0.unshift({ lv: "red", t: M("単価が入っていません（数量が価格表のどの帯にも入りません）", "No unit price (the quantity is outside the bands of your price list)", "未填写单价（数量不在价格表的任何档位内）", "Sin precio unitario (la cantidad no está en ningún tramo)"), how: x.why + " " + x.how, go: () => { goTable(); }, v98px: 1 });
          V98PRICE.n.ck++;
        }
      } catch (e) { err("ck", e); }
      return F0;
    };
  }
  /* 受注内容の編集：数量を変えたとき、決められない数量なら単価を空にして理由を出す（決まる数量に戻したら帯の単価を入れる） */
  if (fn("openStepEdit")) {
    const __ose98 = openStepEdit; // eslint-disable-line no-undef
    openStepEdit = function () { // eslint-disable-line no-global-assign
      const r = __ose98.apply(this, arguments);
      try {
        const q = document.getElementById("seQ"), u = document.getElementById("seU"), tt = document.getElementById("seT"), g0 = document.getElementById("seGo");
        const t = ten();
        if (!q || !u || !t || q.dataset.v98px) return r;
        q.dataset.v98px = "1";
        const S = dd() && dd().ship;
        const P = (S && S.v54price) || {};
        const st = { auto: !!(P.v98 && P.v98.stop) || P.k === "tier", mU: false };
        let note = null;
        const show = (h) => {
          if (!note) { note = document.createElement("div"); note.className = "v98px-qh"; note.setAttribute("role", "note"); q.insertAdjacentElement("afterend", note); }
          note.innerHTML = h;
          note.hidden = !h;
        };
        const check = () => {
          const n = numOf(q.value);
          if (!n) return;
          const g = pxFor(t, n, qtyU(q.value));
          if (g.stop) {
            if (!st.mU) { u.value = ""; if (tt) tt.value = ""; }
            show(`<span data-noi18n="1">⚠ ${E(whyText(g))}${E(STOP_HEAD())}</span>`);
          } else {
            if (g.ok && st.auto && !st.mU) {
              u.value = g.v;
              const m = (typeof v54docMoney === "function") ? v54docMoney(g.v, n) : null; // eslint-disable-line no-undef
              if (m && tt) tt.value = m;
            }
            show("");
          }
        };
        q.addEventListener("input", check);
        u.addEventListener("input", () => { st.mU = true; });
        if (P.v98 && P.v98.stop) check();
        if (g0) g0.addEventListener("click", () => {
          try {
            if (st.auto && !st.mU && t.shipEdit && typeof t.shipEdit === "object") {
              t.shipEdit.v54 = Object.assign({}, t.shipEdit.v54 || {}, { manualPrice: false });
              if (typeof v54docSave === "function") v54docSave(); // eslint-disable-line no-undef
              if (typeof render === "function") render(); // eslint-disable-line no-undef
            }
          } catch (e) { err("seSave", e); }
        });
      } catch (e) { err("stepEdit", e); }
      return r;
    };
  }

  /* ════════════ ④ AI 相談の価格の計算・価格の答え ════════════ */
  if (fn("v92aiPriceCalc")) {
    const __pc98 = v92aiPriceCalc; // eslint-disable-line no-undef
    v92aiPriceCalc = function () { // eslint-disable-line no-global-assign
      const P = __pc98.apply(this, arguments);
      try {
        if (P && P.n) {
          const d = (typeof v92aiD === "function" ? v92aiD() : dd()) || null; // eslint-disable-line no-undef
          const g = d ? pxFor(d, P.n, P.qu || P.u) : { pass: 1 };
          if (g.stop) { P.v98 = { stop: g.stop, why: whyText(g), how: FIX_HOW(g) }; P.out = true; V98PRICE.n.ai++; }
          else if (g.ok && String(g.v) !== String(P.v)) {
            const up = pnum(g.v);
            P.v = String(g.v); P.label = String(g.label); P.up = up; P.total = Math.round(up * P.n * 100) / 100; P.out = false;
          }
        }
      } catch (e) { err("aiCalc", e); }
      return P;
    };
  }
  if (fn("v92aiPriceCtx")) {
    const __px98 = v92aiPriceCtx; // eslint-disable-line no-undef
    v92aiPriceCtx = function (P) { // eslint-disable-line no-global-assign
      try {
        if (P && P.v98 && P.v98.stop) {
          const bands = (P.tiers || []).map((x) => x[0] + " " + x[1]).join("／");
          return M("【価格表で計算できない数量（アプリの決まった照合）】", "[Quantity that cannot be priced from the price list (checked by the app)]") + "\n" + P.v98.why
            + "\n" + M("この数量の単価・合計金額は、推測で書かないこと。価格表のどの帯にも当てはまらないことを伝え、価格表に帯を足すか単価を確かめるよう勧めること。", "Do not guess a unit price or total for this quantity. Say it does not fit any band in the price list and suggest adding a band or confirming the unit price.")
            + (bands ? "\n" + M("数量帯：", "Bands: ") + bands : "");
        }
      } catch (e) { err("aiCtx", e); }
      return __px98.apply(this, arguments);
    };
  }
  /* 21.97 の層（v97 cty）が答えの下に足す「価格表から計算すると：… US$2,880」は AI の答えではないので、
     AI の答えの金額の照合（価格表と合うか）から外す（含めると、AI が誤った金額でも「合っている」と見なされていた） */
  const CALC_FOOT = /(?:価格表から計算すると：|計算の根拠（この商品の価格表）：|From the price list: |Basis of the calculation \(this product's price list\): )[^\n]*/g;
  if (fn("v92aiPriceHtml")) {
    const __ph98 = v92aiPriceHtml; // eslint-disable-line no-undef
    v92aiPriceHtml = function (P, ansTxt, ai) { // eslint-disable-line no-global-assign
      const args = Array.prototype.slice.call(arguments);
      try {
        if (typeof ansTxt === "string") {
          const a2 = ansTxt.replace(CALC_FOOT, " ");
          if (a2 !== ansTxt) { args[1] = a2; ansTxt = a2; V98PRICE.n.foot = (V98PRICE.n.foot || 0) + 1; }
        }
      } catch (e) { err("aiFoot", e); }
      try {
        if (P && P.v98 && P.v98.stop) {
          const amts = (typeof v92aiAmounts === "function" ? v92aiAmounts(ansTxt) : []).filter((x) => x && x.v > 0); // eslint-disable-line no-undef
          let h = `<div class="v92ai-price v98px-ai" data-v92ai-price="1" data-v98px-stop="${E(P.v98.stop)}"><p><b>${E(M("価格表からの計算（AI ではなく、決まった計算）", "Calculated from your price list (a fixed calculation, not the AI)", "根据价格表计算（非 AI，固定计算）", "Cálculo con su lista de precios (fijo, no la IA)"))}</b></p>`;
          h += `<p class="v92ai-ng" data-v98px-why="1">⚠ ${E(P.v98.why)}${E(STOP_HEAD())}</p><p class="nn">${E(P.v98.how)}</p>`;
          if ((P.tiers || []).length) h += `<p class="nn">${E(M("数量帯：", "Bands: ", "数量档：", "Tramos: "))}${P.tiers.map((x) => E(x[0] + " " + x[1])).join(M("／", " / ", "／", " / "))}</p>`;
          if (ai && amts.length) h += `<p class="v92ai-ng" data-v92ai-ng="1">${E(F(M("⚠ 下の AI の答えの金額（{a}）は、価格表で確かめられていません。見積・PI には使わないでください。", "⚠ The amounts in the AI's answer below ({a}) could not be checked against your price list. Do not use them for quotes or PIs.", "⚠ 下方 AI 回答中的金额（{a}）未能用价格表核对。请勿用于报价或 PI。", "⚠ Los importes de la respuesta de la IA ({a}) no se pudieron comprobar con su lista. No los use en cotizaciones ni PI."), { a: [...new Set(amts.map((x) => x.s))].slice(0, 3).join("、") }))}</p>`;
          h += `<p class="v98px-acts"><button type="button" class="btn g v98px-btn" data-v98px-act="table">${E(M("価格表に帯を足す", "Add a band to the price list", "在价格表中添加档位", "Añadir un tramo"))}</button></p></div>`;
          try { V92AI.n.price++; } catch (e) { /* 数えるだけ */ } // eslint-disable-line no-undef
          return h;
        }
      } catch (e) { err("aiHtml", e); }
      return __ph98.apply(this, args);
    };
  }
  /* 決められない数量のとき、21.97 の層の「価格表から計算すると：…」（帯を推し量った計算）を答えの下に出さない */
  if (fn("v84cfAnsMark")) {
    const __am98 = v84cfAnsMark; // eslint-disable-line no-undef
    v84cfAnsMark = function (o, q) { // eslint-disable-line no-global-assign
      const r = __am98.apply(this, arguments);
      try {
        if (r && typeof r.a === "string" && r.a.indexOf("v97calc") >= 0) {
          const d = dd();
          const qty = (typeof pickQty === "function") ? pickQty(String(q || "")) : null; // eslint-disable-line no-undef
          const g = d && qty && qty.n > 0 ? pxFor(d, qty.n, qty.u || "") : null;
          if (g && g.stop) {
            const r0 = r === o ? Object.assign({}, o) : r;
            r0.a = r.a.replace(/<p class="v97calc[^"]*"[^>]*>[\s\S]*?<\/p>/g, "");
            return r0;
          }
        }
      } catch (e) { err("ansMark", e); }
      return r;
    };
  }
  /* 営業資料（英語の資料の価格の欄）の前の確かめ：価格表に数量の無い帯があるときは、必須の「価格表」を未完了にして直し方を出す */
  if (fn("dk3Gate")) {
    const __dg98 = dk3Gate; // eslint-disable-line no-undef
    dk3Gate = function () { // eslint-disable-line no-global-assign
      const G = __dg98.apply(this, arguments);
      try {
        const t = ten();
        if (Array.isArray(G) && t && Array.isArray(t.priceRows) && t.priceRows.length) {
          const S = shape(t.priceCols, t.priceRows);
          const bad = S.kind === "bands" ? S.issues.filter((x) => x.k === "firstNoQty" || x.k === "noQty" || x.k === "cur") : [];
          const g = G.find((c) => c && c.k === "price");
          if (g && g.ok && bad.length) {
            const x = bad[0];
            g.ok = false;
            g.how = x.k === "cur"
              ? M("価格表の帯で通貨がそろっていません。商品情報の価格表で通貨をそろえてください（バイヤー向けの資料に載る価格です）", "The bands in the price list use different currencies. Please use one currency on the product page (these prices appear in buyer materials).", "价格表各档币种不一致。请在商品信息的价格表中统一币种（将显示在面向买家的资料中）。", "Los tramos usan monedas distintas. Unifique la moneda en la ficha del producto.")
              : F(M("価格表の{w}（{l}{v}）の数量が未登録です。商品情報の価格表で「何個から」の数量を入れてください（バイヤー向けの資料に、数量の無い価格を載せないため）", "The quantity of {w} ({l}{v}) in the price list is not registered. Enter “from how many” on the product page (so buyer materials do not show a price without a quantity).", "价格表{w}（{l}{v}）的数量未登记。请在商品信息的价格表中填写“从多少个起”（以免面向买家的资料出现无数量的价格）。", "La cantidad de {w} ({l}{v}) no está registrada. Indique «desde cuántas unidades» en la ficha del producto."), { w: x.k === "firstNoQty" ? M("第1帯", "the first band", "第1档", "el primer tramo") : M(`${x.ri + 1}行目`, `row ${x.ri + 1}`, `第 ${x.ri + 1} 行`, `la fila ${x.ri + 1}`), l: x.label ? x.label + " " : "", v: x.v });
            g.v98px = 1;
          }
        }
      } catch (e) { err("dkGate", e); }
      return G;
    };
  }
  /* AI が使えないときの価格の答え（決まった答え）：数量があり、決められないときは単価・合計を出さない */
  if (fn("ansPrice")) {
    const __ap98 = ansPrice; // eslint-disable-line no-undef
    ansPrice = function (q) { // eslint-disable-line no-global-assign
      try {
        const d = dd();
        const qty = (typeof pickQty === "function") ? pickQty(String(q || "")) : null; // eslint-disable-line no-undef
        if (d && qty && qty.n > 0 && Array.isArray(d.priceRows) && d.priceRows.length) {
          const g = pxFor(d, qty.n, qty.u || "");
          if (g.stop) {
            V98PRICE.n.ans++;
            const S = shape(d.priceCols, d.priceRows);
            const L = ladder(S).map((b) => `${E(b.label)}：<b>${E(b.v)}</b>`).join("　／　");
            const lo = S.loose.map((x) => `${E(x.label || "—")}：<b>${E(x.v)}</b>（${E(M("数量が未登録", "quantity not registered", "数量未登记", "cantidad sin registrar"))}）`).join("　／　");
            const a = `<span data-noi18n="1"><b>${E(d.item || M("この商品", "This product", "该商品", "Este producto"))}</b>${E(M("の価格表です。", " — price list.", "的价格表。", " — lista de precios."))}<br><br><b>${E(M("数量帯ごとの単価", "Unit price by band", "各数量档的单价", "Precio por tramo"))}</b><br>${[lo, L].filter(Boolean).join("　／　")}<br><br>
              <span class="v98px-why" style="color:var(--warn)">⚠ ${E(whyText(g))}${E(STOP_HEAD())}</span><br>${E(FIX_HOW(g))}</span>`;
            return { a, c: M("根拠：価格表（帯の形を照らしました）", "Source: price list (bands checked)", "依据：价格表（已核对档位）", "Fuente: lista de precios (tramos revisados)") };
          }
        }
      } catch (e) { err("ansPrice", e); }
      return __ap98.apply(this, arguments);
    };
  }

  /* ════════════ 商品情報の価格表：形の照合の結果と、第1帯の数量を入れる欄 ════════════ */
  function goTable() {
    try {
      if (typeof closeDW === "function") closeDW(); // eslint-disable-line no-undef
      if (W.RDX && typeof RDX.goKey === "function") RDX.goKey("item"); else if (typeof go === "function") go("item"); // eslint-disable-line no-undef
      setTimeout(() => { try { if (typeof openTableEdit === "function") openTableEdit("price"); } catch (e) { err("goTable2", e); } }, 350); // eslint-disable-line no-undef
    } catch (e) { err("goTable", e); }
  }
  V98PRICE.goTable = goTable;
  // 表示中の商品の価格表の形（商品情報の画面・営業資料の前の確かめ）
  function curShape() {
    const t = ten();
    if (!t || !Array.isArray(t.priceRows) || !t.priceRows.length) return null;
    const S = shape(t.priceCols, t.priceRows);
    S.t = t;
    return S;
  }
  V98PRICE.curShape = curShape;
  /* 第1帯の数量を入れる（数と単位→「600個以上」。次の帯の下限より小さいこと） */
  function setLoose(ri, n, u, mode) {
    const t = ten();
    if (!t || !Array.isArray(t.priceRows) || !Array.isArray(t.priceRows[ri])) return { ok: false };
    const S = shape(t.priceCols, t.priceRows);
    n = parseInt(String(n || "").replace(/[,\s]/g, ""), 10);
    if (!(n > 0)) return { ok: false, why: M("数を入れてください", "Enter a number", "请输入数字", "Introduzca un número") };
    const nx = S.bands.filter((b) => b.ri > ri).sort((a, b) => a.ri - b.ri)[0] || ladder(S)[0];
    if (nx && n >= nx.lo) return { ok: false, why: F(M("次の帯（{l}）の下限 {n} より小さい数にしてください", "Use a number below the next band ({l}, from {n})", "请填写小于下一档（{l}）下限 {n} 的数字", "Use un número menor que el siguiente tramo ({l}, desde {n})"), { l: nx.label, n: fmt(nx.lo) }) };
    const unit = String(u || (nx && nx.u) || "").trim();
    const lab = mode === "range" && nx ? `${fmt(n)}〜${fmt(nx.lo - 1)}${unit}` : `${fmt(n)}${unit}以上`;
    const row = t.priceRows[ri];
    const from = String(row[S.qi] == null ? "" : row[S.qi]);
    row[S.qi] = lab;
    const L = Array.isArray(t.v98pxFix) ? t.v98pxFix : [];
    L.push({ at: Date.now(), why: "hand", ri, from, to: lab, src: "hand" });
    t.v98pxFix = L.slice(-10);
    try { if (typeof saveTen === "function") saveTen(); } catch (e) { /* 次の保存で */ } // eslint-disable-line no-undef
    try { if (typeof syncTenant === "function") syncTenant(); } catch (e) { /* 次の同期で */ } // eslint-disable-line no-undef
    try { if (typeof logU === "function") logU("fill", "価格表の帯の数量（第1帯）"); } catch (e) { /* 記録だけ */ } // eslint-disable-line no-undef
    try { if (typeof render === "function") render(); } catch (e) { /* 次の描画で */ } // eslint-disable-line no-undef
    try { if (typeof toast === "function") toast(F(M("価格表の帯を「{l}」にしました（PI・AI 相談・営業資料に反映）", "Set the band to “{l}” (used in PIs, AI answers and sales materials)", "已将档位设为“{l}”（反映到 PI・AI 咨询・营销资料）", "Tramo fijado en «{l}» (se usa en PI, respuestas IA y materiales)"), { l: lab })); } catch (e) { /* 表示だけ */ } // eslint-disable-line no-undef
    return { ok: true, label: lab };
  }
  V98PRICE.setLoose = setLoose;

  /* ボタン（data-v98px-act）：インラインの onclick は使えないので、まとめて受ける */
  document.addEventListener("click", (e) => {
    try {
      const b = e.target && e.target.closest && e.target.closest("[data-v98px-act]");
      if (!b) return;
      const act = b.getAttribute("data-v98px-act");
      if (act === "table") { e.preventDefault(); goTable(); return; }
      if (act === "set" || act === "moq" || act === "one") {
        e.preventDefault();
        const box = b.closest("[data-v98px-ri]");
        if (!box) return;
        const ri = +box.getAttribute("data-v98px-ri");
        const inp = box.querySelector("input[data-v98px-n]");
        const u = box.getAttribute("data-v98px-u") || "";
        const n = act === "moq" ? b.getAttribute("data-v98px-n") : act === "one" ? "1" : (inp && inp.value);
        const r = setLoose(ri, n, u, act === "one" ? "range" : "from");
        const msg = box.querySelector(".v98px-msg");
        if (!r.ok && msg) { msg.textContent = r.why || ""; msg.hidden = false; }
      }
    } catch (x) { err("click", x); }
  });

  addDict([
    ["価格表の第1帯の数量が未登録です", "The quantity of the first band of the price list is not registered", "价格表第1档的数量未登记", "La cantidad del primer tramo no está registrada"],
    ["価格表の帯を直す", "Fix the price bands", "修正价格档位", "Corregir los tramos"],
    ["価格表に帯を足す", "Add a band to the price list", "在价格表中添加档位", "Añadir un tramo"],
    ["単価を手で入れる", "Enter the unit price by hand", "手动填写单价", "Introducir el precio a mano"],
    ["単価が入っていません（数量が価格表のどの帯にも入りません）", "No unit price (the quantity is outside the bands of your price list)", "未填写单价（数量不在价格表的任何档位内）", "Sin precio unitario (la cantidad no está en ningún tramo)"],
  ]);
})();
