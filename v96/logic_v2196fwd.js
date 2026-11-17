/* ═══ v21.96 fwd（2026-11-17 第9回相当 UAT・21.95.1）物流会社（フォワーダー）側の直し — 中身の層
   担当の行：
   No.519 容積の不一致が見積に再計算されない
     原因：案件の B/L の容積（1.11m³）と荷主の共有（2m³）の食い違いは v69f が警告し、v90f が「見積は荷主の値で計算」と書くだけ。
           見積（依頼の国ごとの見積＝FWDB.reqs[].legs[].quote）は荷主の依頼の容積で作られ、物流会社の画面には計算し直す手段が無かった。
           物流会社の画面の依頼（FWDB.reqs）は荷主の持ち物で、物流会社からは同期サーバーへ送り返せない（v45Merge：fv=1 のとき reqs は毎回サーバーの値）。
     直し方：国ごとの見積に「どちらの容積で計算しているか」を持たせ、「B/L の容積で計算し直す」→ 今の見積との差を見せる → 物流会社が選んで反映 → 元に戻す。
           計算は今の見積と同じ条件（見積のときのレートの単価・形態・FOB の有無）で、容積だけを B/L の値にして fwdQuoteCalc（上の層の包みごと）で出す。
           反映の記録は物流会社のアカウントの「依頼ごとの対応」（v33 の fa・v96vol）に置く＝アカウントの同期で残る。依頼そのもの（荷主の見積）は書き換えない。
   No.520 COURIER の日数が一律10日
     原因：日数の既定値 10日 は「取り込み時の補完」。fwdRatesFromGrids（土台・v92 の analyzeGrids とも）・fwdRatesLLM（AI 読み取り）・手入力の「追加」が、
           日数が空欄・読めないときに tt=10 を入れていた。レートのデータには「既定値かどうか」の印が無く、表示時には判別できない。
     直し方：取り込み・手入力のときにレートへ印を持たせる（ttDef:1＝既定値の10日／ttDef:0＝登録された値）。見積（quote.ttDef）・相見積の会社（rate.ttDef）にも写す。
           これより前に登録されたレート（印なし）は記録が無いので判別できない。判別できる条件：日数が10日で、同じ会社の同じ形態・単位の行（3本以上）か
           同じ取り込み（同じ会社・同じ時刻）の行（3本以上）が全部10日 →「既定値かも」。見本の組み込みレート（fwdSeedRates・dfw）は登録された値として扱う。
           「日数を確かめる」で実際の日数を入れる（または10日で正しいと確かめる）と、登録された値になる。
   No.521 見本データの B/L に HS コードの誤り（日本酒に 2208.90）
     原因：日本酒（清酒）の HS は 22.06（2206.00）。案件の B/L の情報（v33 の cs）に 2208.90 が入っていた（見本データの誤り。v90doc は警告だけ）。
     直し方：読み込み時（ログイン・同期の取り込みのたび）に、見本・体験用のアカウント（共通のコード・デモ用アカウント）の B/L の情報と、
           まだ確かめていない B/L の HS の取り込み（確認待ち）で、品名が日本酒で HS が 22.08 のものを 2206.00 に直して保存する（記録 v96hs に元の値）。
           そのほかのアカウント（利用者が入れた値）は自動では変えず、案件の HS の欄に「2206.00 に直す」を出す（元に戻せる）。
   6.1 の所見（参考）：調べた結果は報告に書く（COURIER ¥12,000・LA 港 ¥300,000 は組み込みの見本の値ではない＝触らない／期限切れの警告は No.337 と整合）。
   今のアプリの関数は控えてから包むだけ（中身は書き換えない）。見せ方（刷新版の部品）は rd_v96fwd.js・rd_v96fwd.css。 */
var V96FWD = window.V96FWD = { v: "21.96", err: [], n: {}, pv: {} };
function v96fErr(k, e) { try { V96FWD.err.push(k + ": " + String((e && e.message) || e).slice(0, 160)); if (V96FWD.err.length > 40) V96FWD.err.shift(); } catch (x) { /* 記録できないときは何もしない */ } }
function v96fCnt(k) { try { V96FWD.n[k] = (V96FWD.n[k] || 0) + 1; } catch (e) { /* 数えられなくても動きは変えない */ } }
function v96fLang() { try { const el = document.getElementById("lang"); const v = String((el && el.value) || (typeof I18N !== "undefined" && I18N && I18N.lang) || "ja"); return /^en/.test(v) ? "en" : /^zh/.test(v) ? "zh" : /^es/.test(v) ? "es" : "ja"; } catch (e) { return "ja"; } }
function v96fM(ja, en) { return v96fLang() === "ja" ? ja : (en || ja); }
function v96fE(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]); }
function v96fY(n) { return "¥" + Math.round(+n || 0).toLocaleString("ja-JP"); }
function v96fNum(s) { const m = String(s == null ? "" : s).replace(/,/g, "").match(/-?\d+(?:\.\d+)?/); return m ? +m[0] : null; }
function v96fCbm(v) { const x = Math.round((+v || 0) * 100) / 100; return String(x); }
function v96fMe() { try { return (typeof fwdCo === "function") ? fwdCo() : ((FWDB && FWDB.profile && FWDB.profile.co) || ""); } catch (e) { return ""; } }
function v96fWho() { try { return (typeof v33Me === "function") ? v33Me() : ""; } catch (e) { return ""; } }
function v96fOn() { try { return typeof FWDON !== "undefined" && !!FWDON && typeof FWDB !== "undefined" && !!FWDB; } catch (e) { return false; } }
function v96fUp(s) { return String(s == null ? "" : s).toUpperCase(); }

/* ══════════════════════════════════════════════════════════════════════
   No.519 見積の容積（荷主の共有／B/L）を選んで計算し直す
   ══════════════════════════════════════════════════════════════════════ */
function v96fVolAll(rid) {
  try { const a = (typeof v33FaOf === "function") ? v33FaOf(String(rid)) : {}; return (a && a.v96vol && typeof a.v96vol === "object") ? a.v96vol : {}; } catch (e) { v96fErr("volall", e); return {}; }
}
/* 反映中の B/L の容積の見積（無ければ null） */
function v96fVolOf(rid, cty) { const x = v96fVolAll(rid)[String(cty)]; return (x && x.on === 1 && x.q && +x.q.total > 0) ? x : null; }
function v96fVolPut(rid, cty, ent) {
  const all = Object.assign({}, v96fVolAll(rid));
  all[String(cty)] = ent;
  if (typeof v33FaSet === "function") v33FaSet(String(rid), { v96vol: all });
}
/* 案件（v33Cases の1件）と、その B/L の情報（v33 cs） */
function v96fCaseOf(rid) {
  try {
    const C = (typeof v33Cases === "function") ? v33Cases() : [];
    const c = C.find((k) => (k.reqs || []).some((r) => r && r.id === rid));
    if (!c) return null;
    const id = (typeof v33CsId === "function") ? v33CsId(c.key) : "";
    const cs = (id && typeof v33One === "function" ? v33One("cs", id) : null) || {};
    return { c, id, cs };
  } catch (e) { v96fErr("caseof", e); return null; }
}
function v96fShared(reqs) {
  try { if (typeof v69fShared === "function") return v69fShared(reqs) || {}; } catch (e) { v96fErr("shared", e); }
  const r = (reqs || [])[0] || {};
  return { cbm: +r.cbm || null, gw: +r.weight || null, ctn: +r.cartons || null };
}
/* 見積に使われている会社の回答（v90fBasis と同じ選び方：自社 → 選択中の会社） */
function v96fLegPick(l) {
  const me = v96fMe(), O = (l && Array.isArray(l.offers)) ? l.offers : [];
  const o = O.find((x) => x && x.co === me) || O.find((x) => x && x.co === (l.sel || l.co)) || null;
  const q = (o && o.quote) || (l && l.quote) || null;
  return { o, q, co: (o && o.co) || (l && (l.sel || l.co)) || me };
}
/* 見積のときと同じ条件のレート（単価は見積のときの値。今のレート表から会社・区間・形態が同じものを探して足りない項目を補う） */
function v96fRateOf(l, P) {
  try {
    const q = P.q || {}, o = P.o;
    let base = (o && o.rate) ? Object.assign({}, o.rate) : null;
    if (!base) {
      const u = String(q.unit || ""), m = u.match(/^(US\$|¥)\s*([\d,]+)(.*)$/), ln = String(q.lane || "").split(/\s*→\s*/);
      if (!m || ln.length < 2) return null;
      base = { pol: ln[0], pod: ln[1], mode: q.mode, price: +m[2].replace(/,/g, ""), cur: m[1], unit: m[3], tt: q.tt, valid: q.valid };
    }
    const key = [P.co, base.pol, base.pod, v96fUp(base.mode)].join("|");
    const dco = (FWDB && FWDB.profile && FWDB.profile.co) || "";
    const full = ((FWDB && FWDB.rates) || []).find((r) => r && [r.co || dco, r.pol, r.pod, v96fUp(r.mode)].join("|") === key) || null;
    const r = Object.assign({}, full || {}, base, { co: P.co });
    if (!r.mode) r.mode = q.mode;
    if (q.dfw && !r.dfw) r.dfw = q.dfw;
    if (q.v56shipFob) r.v56shipFob = 1;
    return r;
  } catch (e) { v96fErr("rateof", e); return null; }
}
/* 容積だけを変えて計算する（上の層の包みごと。デモの物流会社のレートは V60.ctx の容積・重量で計算するので、計算の間だけ入れる） */
function v96fCalc(rate, cbm, sh) {
  const hasV60 = (typeof V60 !== "undefined") && !!V60 && !!rate && !!rate.dfw;
  const keep = hasV60 ? V60.ctx : null;
  try {
    if (hasV60) V60.ctx = { cbm: +cbm, weight: +(sh && sh.gw) || 0, cartons: +(sh && sh.ctn) || 0 };
    const q = (typeof fwdQuoteCalc === "function") ? fwdQuoteCalc(rate, cbm) : null;
    return q ? Object.assign({}, q) : null;
  } finally { if (hasV60) V60.ctx = keep; }
}
function v96fQSlim(q) {
  const o = {};
  ["freight", "thc", "doc", "total", "basis", "unit", "mode", "lane", "tt", "valid", "courier", "v56shipFob", "dfw", "ttDef", "ttMaybe"].forEach((k) => { if (q && q[k] !== undefined && q[k] !== null) o[k] = q[k]; });
  return o;
}
/* 案件の国ごとの見積の行（見積・どちらの容積で計算しているか・B/L の容積・計算し直した案） */
function v96fVolLines(c, cs) {
  const out = [];
  try {
    const sh = v96fShared(c.reqs), bl = v96fNum(cs && cs.cbm);
    (c.reqs || []).forEach((r) => {
      (r && Array.isArray(r.legs) ? r.legs : []).forEach((l) => {
        if (!l || !l.ok) return;
        const P = v96fLegPick(l);
        if (!P.q || !(+P.q.total > 0)) return;
        out.push({ rid: r.id, cty: l.cty, r, l, P, from: +r.cbm || +sh.cbm || null, bl: bl > 0 ? bl : null, ap: v96fVolOf(r.id, l.cty), pv: V96FWD.pv[r.id + "|" + l.cty] || null, sh });
      });
    });
  } catch (e) { v96fErr("lines", e); }
  return out;
}
/* B/L の容積で計算し直した案（まだ反映しない） */
function v96fVolPreview(rid, cty) {
  try {
    const r = ((FWDB && FWDB.reqs) || []).find((x) => x && x.id === rid);
    const l = r && (r.legs || []).find((x) => x && x.cty === cty);
    if (!r || !l || !l.ok) return { err: v96fM("この国の見積が見つかりません", "Quote not found") };
    const K = v96fCaseOf(rid), cs = (K && K.cs) || {};
    const bl = v96fNum(cs.cbm);
    if (!(bl > 0)) return { err: v96fM("B/L の情報に容積が入っていません（「B/L・出荷の情報を入れる」で入れてください）", "No volume in the B/L info") };
    const P = v96fLegPick(l), rate = v96fRateOf(l, P);
    if (!rate) return { err: v96fM("この見積のレートが見つからないため、計算し直せません", "The rate of this quote was not found") };
    const sh = v96fShared(K ? K.c.reqs : [r]);
    const nq = v96fCalc(rate, bl, { gw: sh.gw, ctn: sh.ctn });  /* 重量・カートン数は荷主の共有のまま（画面の説明と同じ） */
    if (!nq || !(+nq.total >= 0)) return { err: v96fM("計算できませんでした", "Could not calculate") };
    const pv = { cbm: bl, from: +r.cbm || +sh.cbm || null, old: +P.q.total, neu: +nq.total, q: v96fQSlim(nq), oq: v96fQSlim(P.q), co: P.co, at: Date.now() };
    V96FWD.pv[rid + "|" + cty] = pv;
    v96fCnt("preview");
    return pv;
  } catch (e) { v96fErr("preview", e); return { err: v96fM("計算できませんでした", "Could not calculate") }; }
}
function v96fVolCancel(rid, cty) { delete V96FWD.pv[rid + "|" + cty]; }
function v96fHist(s) { try { if (typeof fwdHist === "function") fwdHist(s); } catch (e) { v96fErr("hist", e); } }
/* 反映する（物流会社のアカウントの依頼ごとの対応に記録。元の見積は残る） */
function v96fVolApply(rid, cty) {
  const pv = V96FWD.pv[rid + "|" + cty];
  if (!pv) return false;
  try {
    const ent = Object.assign({}, pv, { on: 1, src: "bl", by: v96fWho(), at: Date.now() });
    v96fVolPut(rid, cty, ent);
    delete V96FWD.pv[rid + "|" + cty];
    v96fHist(`見積の容積を B/L の値で計算し直して反映：${rid}／${cty}／荷主の共有 ${pv.from != null ? v96fCbm(pv.from) + "m³" : "—"} → B/L ${v96fCbm(pv.cbm)}m³／${v96fY(pv.old)} → ${v96fY(pv.neu)}`);
    v96fCnt("apply");
    return true;
  } catch (e) { v96fErr("apply", e); return false; }
}
/* 元に戻す（荷主の共有の容積の見積に） */
function v96fVolUndo(rid, cty) {
  try {
    const cur = v96fVolAll(rid)[String(cty)];
    if (!cur || cur.on !== 1) return false;
    v96fVolPut(rid, cty, Object.assign({}, cur, { on: 0, offAt: Date.now(), offBy: v96fWho() }));
    v96fHist(`見積の容積を元に戻す（荷主の共有の値）：${rid}／${cty}／${v96fY(cur.neu)} → ${v96fY(cur.old)}`);
    v96fCnt("undo");
    return true;
  } catch (e) { v96fErr("undo", e); return false; }
}
window.v96fVolOf = v96fVolOf; window.v96fVolLines = v96fVolLines; window.v96fVolPreview = v96fVolPreview;
window.v96fVolApply = v96fVolApply; window.v96fVolUndo = v96fVolUndo; window.v96fVolCancel = v96fVolCancel;

/* ══════════════════════════════════════════════════════════════════════
   No.520 日数の既定値（取り込み時の補完 10日）に印を持たせる
   ══════════════════════════════════════════════════════════════════════ */
var V96F_TT_DEF = 10;
function v96fRateKey(r) { return [r && r.co, r && r.pol, r && r.pod, v96fUp(r && r.mode), r && r.price, r && r.at].join("|"); }
/* 組み込みの見本のレート（デモの物流会社の自動のレート・見本の会社の組み込みレート）＝日数は登録された値 */
function v96fIsSeed(r) {
  try {
    if (!r) return false;
    if (r.dfw || r.smp || r.fk === "dfw") return true;
    if (typeof V82SEED_KEYS !== "undefined" && typeof v82seedKey === "function" && V82SEED_KEYS.has(v82seedKey(r))) return true;
  } catch (e) { v96fErr("seed", e); }
  return false;
}
/* 印の無い 10日 のうち「既定値かも」と言える行（同じ会社の同じ形態・単位の3本以上が全部10日／同じ取り込みの3本以上が全部10日）。
   確かめた行は、確かめる前の日数（ttWas）で数える（1本を確かめても、ほかの行の判断は変わらない） */
function v96fTtLikely() {
  const R = ((typeof FWDB !== "undefined" && FWDB && FWDB.rates) || []);
  const C = V96FWD.lk;
  if (C && C.R === R && C.n === R.length && Date.now() - C.t < 1500) return C.set;
  const set = new Set(), g1 = {}, g2 = {};
  R.forEach((r) => {
    if (!r || v96fIsSeed(r)) return;
    const a = String(r.co || "") + "|" + v96fUp(r.mode) + "|" + String(r.unit || "");
    (g1[a] = g1[a] || []).push(r);
    if (+r.at > 0) { const b = String(r.co || "") + "|" + Math.round(+r.at / 2000); (g2[b] = g2[b] || []).push(r); }
  });
  const was = (r) => (r.ttOk && r.ttWas != null) ? +r.ttWas : +r.tt;
  [g1, g2].forEach((G) => Object.values(G).forEach((L) => {
    if (L.length >= 3 && L.every((r) => was(r) === V96F_TT_DEF)) L.forEach((r) => { if (r.ttDef === undefined && !r.ttOk) set.add(v96fRateKey(r)); });
  }));
  V96FWD.lk = { R, n: R.length, t: Date.now(), set };
  return set;
}
/* def＝既定値（印あり）／maybe＝既定値かも（印なし・上の条件）／unk＝印なしの10日（判別できない）／set＝登録された値 */
function v96fTtKind(r) {
  try {
    if (!r) return "set";
    if (r.ttDef === 1) return "def";
    if (r.ttDef === 0 || r.ttOk) return "set";
    if (+r.tt !== V96F_TT_DEF) return "set";
    if (v96fIsSeed(r)) return "set";
    return v96fTtLikely().has(v96fRateKey(r)) ? "maybe" : "unk";
  } catch (e) { v96fErr("ttkind", e); return "set"; }
}
/* 見積・回答の会社（o）または見積（q）の日数の種類。印が無い前の見積は、今のレート表の同じ会社・区間・形態・日数の行から判断する */
function v96fFindRate(co, pol, pod, mode, tt) {
  const dco = (FWDB && FWDB.profile && FWDB.profile.co) || "";
  return ((FWDB && FWDB.rates) || []).find((r) => r && (r.co || dco) === co && r.pol === pol && r.pod === pod && v96fUp(r.mode) === v96fUp(mode) && (tt == null || +r.tt === +tt)) || null;
}
function v96fOfferKind(o) {
  try {
    if (!o) return "";
    const q = o.quote || {}, r = o.rate || {};
    if (q.ttDef === 1 || r.ttDef === 1) return "def";
    if (q.ttMaybe === 1 || r.ttMaybe === 1) return "maybe";
    if (r.ttDef === 0 || q.ttDef === 0) return "";
    const f = v96fFindRate(o.co, r.pol, r.pod, r.mode || q.mode, r.tt != null ? r.tt : q.tt);
    const k = f ? v96fTtKind(f) : "";
    return k === "def" || k === "maybe" ? k : "";
  } catch (e) { v96fErr("okind", e); return ""; }
}
function v96fQuoteKind(l) {
  try {
    if (!l || !l.ok) return "";
    const q = l.quote || {};
    if (q.ttDef === 1) return "def";
    if (q.ttMaybe === 1) return "maybe";
    const co = l.sel || l.co, o = (l.offers || []).find((x) => x && x.co === co);
    if (o) return v96fOfferKind(o);
    const ln = String(q.lane || "").split(/\s*→\s*/);
    const f = ln.length > 1 ? v96fFindRate(co || v96fMe(), ln[0], ln[1], q.mode, q.tt) : null;
    const k = f ? v96fTtKind(f) : "";
    return k === "def" || k === "maybe" ? k : "";
  } catch (e) { v96fErr("qkind", e); return ""; }
}
function v96fTtWord(k) { return k === "def" ? v96fM("既定値", "default") : k === "maybe" ? v96fM("既定値かも", "may be default") : ""; }
function v96fTtWhy(k) {
  return k === "def" ? v96fM("日数は既定値です（取り込み・入力のとき日数が空欄だったため 10日 を入れています。実際の日数は確かめていません）", "Transit days are the default (10 days were filled in because the cell was blank; not confirmed)")
    : k === "maybe" ? v96fM("日数 10日 は既定値かもしれません（前の取り込みでは、空欄のとき 10日 を入れていました。この行がそうかは記録が無く判別できません）", "10 days may be the default (blank cells used to be filled with 10 days; this row has no record)")
      : "";
}
function v96fTtWhyShort(k) {
  return k === "def" ? v96fM("日数は既定値です（空欄だったため 10日 を入れています・実際の日数は未確認）", "Transit days are the default (blank → 10 days; not confirmed)")
    : k === "maybe" ? v96fM("日数 10日 は既定値かもしれません（記録が無く判別できません）", "10 days may be the default (no record)") : "";
}
/* 「約10日」の後ろに（既定値）を足す（文の中の最初の1か所） */
function v96fTtTxt(s, k) {
  if (!k) return s;
  const w = v96fTtWord(k);
  return String(s).replace(/(約\s*\d+\s*日|所要\s*\d+\s*日)(?!（既定値)/, `$1（${w}）`);
}
window.v96fTtKind = v96fTtKind; window.v96fOfferKind = v96fOfferKind; window.v96fQuoteKind = v96fQuoteKind; window.v96fTtWord = v96fTtWord; window.v96fTtWhy = v96fTtWhy; window.v96fTtWhyShort = v96fTtWhyShort;

/* 取り込み：Excel・CSV（v92 の analyzeGrids の行の注記「日数が空欄のため 10日 としました」から。v92 が動いていないときは土台と同じ読み方で） */
function v96fTtFromGridsBase(grids, rs) {
  try {
    if (typeof FWD_HDR === "undefined" || typeof fwdParsePrice !== "function") return;
    const flags = [];
    (grids || []).forEach((g) => {
      if (!g || !g.length) return;
      let hi = -1, map = null;
      for (let i = 0; i < Math.min(g.length, 12); i++) {
        const row = g[i] || [], m = {};
        row.forEach((c, ci) => { Object.keys(FWD_HDR).forEach((k) => { if (m[k] === undefined && FWD_HDR[k].test(String(c || ""))) m[k] = ci; }); });
        if (m.pod !== undefined && m.price !== undefined) { hi = i; map = m; break; }
      }
      if (hi >= 0) {
        for (let i = hi + 1; i < g.length; i++) {
          const r = g[i] || [];
          if (!String(r[map.pod] || "").trim() || !fwdParsePrice(r[map.price])) continue;
          flags.push(!parseInt(String(map.tt !== undefined ? r[map.tt] : ""), 10));
        }
      } else {
        g.forEach((r) => { if (!r || r.length < 4) return; if (!r[0] || !r[1] || !fwdParsePrice(r[3])) return; flags.push(!parseInt(String(r[4] || ""), 10)); });
      }
    });
    if (flags.length === rs.length) rs.forEach((r, i) => { if (r) r.ttDef = flags[i] ? 1 : 0; });
  } catch (e) { v96fErr("gridsbase", e); }
}
if (typeof fwdRatesFromGrids === "function") {
  const __rg96f = fwdRatesFromGrids;
  fwdRatesFromGrids = function (grids) {
    const out = __rg96f.apply(this, arguments);
    try {
      const rs = (out && Array.isArray(out.rates)) ? out.rates : [];
      const D = window.__v2192fwd && window.__v2192fwd.diag;
      if (D && Array.isArray(D.rows) && Date.now() - (+D.at || 0) < 10000 && D.rows.length === rs.length && D.rows.every((x, i) => x && x.rate === rs[i])) {
        D.rows.forEach((x) => { x.rate.ttDef = (x.notes || []).some((t) => /日数/.test(String(t)) && /10日/.test(String(t))) ? 1 : 0; });
      } else v96fTtFromGridsBase(grids, rs);
      v96fCnt("gridsMark");
    } catch (e) { v96fErr("grids", e); }
    return out;
  };
}
/* 取り込み：AI 読み取り（AI の答えの JSON の tt が空なら既定値）。読み取りの間だけ xParseJson の結果を控える */
if (typeof fwdRatesLLM === "function" && typeof xParseJson === "function") {
  const __xp96f = xParseJson;
  xParseJson = function () {
    const j = __xp96f.apply(this, arguments);
    try { if (V96FWD.llmCap && j && Array.isArray(j.rates)) V96FWD.llmCap.j = j; } catch (e) { v96fErr("xp", e); }
    return j;
  };
  const __rl96f = fwdRatesLLM;
  fwdRatesLLM = async function () {
    const cap = { j: null };
    V96FWD.llmCap = cap;
    let out;
    try { out = await __rl96f.apply(this, arguments); }
    finally { if (V96FWD.llmCap === cap) V96FWD.llmCap = null; }
    try {
      const L = cap.j ? (cap.j.rates || []).filter((x) => x && x.pod && +x.price) : null;
      if (L && Array.isArray(out) && L.length === out.length && out.every((r, i) => r && String(r.pod) === String(L[i].pod)))
        out.forEach((r, i) => { r.ttDef = (parseInt(L[i].tt, 10) > 0) ? 0 : 1; });
      v96fCnt("llmMark");
    } catch (e) { v96fErr("llm", e); }
    return out;
  };
}
/* 手入力の「追加」：押した時点の日数の欄が空なら、追加された行に既定値の印 */
document.addEventListener("click", (ev) => {
  try {
    const b = ev.target && ev.target.closest && ev.target.closest("#frAdd");
    if (!b || typeof FWDB === "undefined" || !FWDB) return;
    const g = (id) => { const el = document.getElementById(id); return el ? String(el.value || "").trim() : ""; };
    const raw = g("frTt"), n = parseInt(raw.replace(/[^\d]/g, ""), 10), mode = v96fUp(g("frMode") || "LCL"), pol = g("frPol"), pod = g("frPod"), t0 = Date.now() - 1500;
    let def = !(n > 0);
    if (!def && n === V96F_TT_DEF) {
      /* 「期限切れのレートを入れ直す」は元の日数を欄に入れる。元が既定値なら、10日のままの入れ直しも既定値のまま */
      const old = (FWDB.rates || []).find((r) => r && r.pol === pol && r.pod === pod && v96fUp(r.mode) === mode && r.ttDef === 1);
      if (old) def = true;
    }
    setTimeout(() => {
      try {
        const add = ((FWDB && FWDB.rates) || []).filter((r) => r && +r.at >= t0 && v96fUp(r.mode) === mode && r.ttDef === undefined);
        add.forEach((r) => { r.ttDef = def ? 1 : 0; });
        if (add.length) { V96FWD.lk = null; if (typeof fwdSave === "function") fwdSave(); v96fCnt("manualMark"); if (typeof window.v96fRepaint === "function") window.v96fRepaint(); }
      } catch (e) { v96fErr("addmark", e); }
    }, 0);
  } catch (e) { v96fErr("addclick", e); }
}, true);
/* 日数を確かめる（実際の日数を入れる／10日で正しい）→ 登録された値になる */
function v96fTtConfirm(i, days) {
  try {
    const r = FWDB && FWDB.rates && FWDB.rates[+i];
    const d = parseInt(days, 10);
    if (!r || !(d > 0) || d > 365) return false;
    const was = r.tt;
    r.ttWas = was; r.tt = d; r.ttDef = 0; r.ttOk = Date.now(); r.at = Date.now();
    V96FWD.lk = null;
    if (typeof fwdReevalPending === "function") { try { fwdReevalPending(); } catch (e) { v96fErr("reeval", e); } }
    v96fHist(`レートの日数を確かめました：${r.pol}→${r.pod}（${r.mode}）${was}日 → ${d}日（登録された値）`);
    if (typeof fwdSave === "function") fwdSave();
    v96fCnt("ttok");
    return true;
  } catch (e) { v96fErr("ttok", e); return false; }
}
window.v96fTtConfirm = v96fTtConfirm;
/* 見積：レートの印を見積（quote）と相見積の会社（rate）へ写す */
if (typeof fwdQuoteCalc === "function") {
  const __qc96f = fwdQuoteCalc;
  fwdQuoteCalc = function (rate) {
    const q = __qc96f.apply(this, arguments);
    try {
      if (q && rate) {
        const k = v96fTtKind(rate);
        if (k === "def") q.ttDef = 1; else if (k === "maybe") q.ttMaybe = 1; else if (rate.ttDef === 0) q.ttDef = 0;
      }
    } catch (e) { v96fErr("qc", e); }
    return q;
  };
}
if (typeof fwdScoreOffers === "function") {
  const __so96f = fwdScoreOffers;
  fwdScoreOffers = function () {
    const out = __so96f.apply(this, arguments);
    try {
      (Array.isArray(out) ? out : []).forEach((o) => {
        if (!o || !o.rate || !o.quote) return;
        const k = o.quote.ttDef === 1 ? "def" : o.quote.ttMaybe === 1 ? "maybe" : "";
        if (o.quote.ttDef === 0) o.rate.ttDef = 0;
        if (!k) return;
        if (k === "def") o.rate.ttDef = 1; else o.rate.ttMaybe = 1;
        if (Array.isArray(o.reasons)) o.reasons = o.reasons.map((s) => v96fTtTxt(s, k));
      });
    } catch (e) { v96fErr("score", e); }
    return out;
  };
}
/* 見積の1行（AI物流マンの回答・やりとりの文に入る）に（既定値）を添える */
if (typeof fwdLegLine === "function") {
  const __ll96f = fwdLegLine;
  fwdLegLine = function (l) {
    const s = __ll96f.apply(this, arguments);
    try { const k = v96fQuoteKind(l); if (k) return v96fTtTxt(s, k); } catch (e) { v96fErr("legline", e); }
    return s;
  };
}
/* AI物流マン・AI商社マンに渡すレートの文脈に、日数が既定値のレーンを書き添える（納期を答えるときに「既定値」と言わせる） */
function v96fTtCtx(maxN) {
  try {
    const R = ((typeof FWDB !== "undefined" && FWDB && FWDB.rates) || []);
    const L = R.map((r) => ({ r, k: v96fTtKind(r) })).filter((x) => x.k === "def" || x.k === "maybe");
    if (!L.length) return "";
    return `\n## 日数が既定値のレーン（取り込み・入力のとき日数が空欄だったため 10日 を入れたもの。実際の所要日数は確かめていません）\n${L.slice(0, maxN || 20).map((x) => `・${x.r.pol}→${x.r.pod} ${x.r.mode}${x.k === "maybe" ? "（既定値の可能性が高い・記録なし）" : "（既定値）"}`).join("\n")}${L.length > (maxN || 20) ? `\nほか ${L.length - (maxN || 20)}レーン` : ""}\n所要日数・納期を答えるときは、これらのレーンの日数に必ず「既定値（実際の日数は未確認）」と添え、確定した日数のように言わないこと。\n`;
  } catch (e) { v96fErr("ttctx", e); return ""; }
}
if (typeof fwdContext === "function") {
  const __cx96f = fwdContext;
  fwdContext = function () { const s = __cx96f.apply(this, arguments); try { return String(s) + v96fTtCtx(20); } catch (e) { v96fErr("cx", e); return s; } };
}
if (typeof shipRateCtx === "function") {
  const __sc96f = shipRateCtx;
  shipRateCtx = function () { const s = __sc96f.apply(this, arguments); try { return s ? String(s) + v96fTtCtx(15) : s; } catch (e) { v96fErr("sc", e); return s; } };
}
if (typeof v90fRateLine === "function") {
  const __rl96l = v90fRateLine;
  v90fRateLine = function (r) { const s = __rl96l.apply(this, arguments); try { const k = v96fTtKind(r); if (k === "def" || k === "maybe") return v96fTtTxt(s, k); } catch (e) { v96fErr("rline", e); } return s; };
}

/* ══════════════════════════════════════════════════════════════════════
   No.521 見本データの B/L の HS（日本酒に 22.08）を 2206.00 に直す
   ══════════════════════════════════════════════════════════════════════ */
var V96F_SAKE_HS = "2206.00";
var V96F_PUBRE = /^(TRIAL-2026|FWD-2026|BC-MIDORI-24|BC-KAKO-77)/;
/* 見本・体験用のアカウント（共通のコード＝体験用・デモ用アカウント＝初期状態がサーバーの見本） */
function v96fSmpAcct() {
  try { if (typeof window.v57demoOn === "function" && window.v57demoOn()) return true; } catch (e) { v96fErr("demo", e); }
  try {
    if (typeof SES === "undefined" || !SES || SES.t !== "trial") return false;
    return V96F_PUBRE.test(String(SES.code || "").replace(/\s+/g, "").toUpperCase());
  } catch (e) { return false; }
}
function v96fSake(s) { try { return (typeof v90docIsSake === "function") ? v90docIsSake(s) : (/日本酒|清酒|純米|吟醸|sake/i.test(String(s || "")) && !/焼酎|ウイスキー|whisk|梅酒|リキュール/i.test(String(s || ""))); } catch (e) { return false; } }
function v96fHsBad(item, hs) { const d = String(hs == null ? "" : hs).replace(/[^\d]/g, ""); return !!d && /^2208/.test(d) && v96fSake(item); }
function v96fCsItem(id, e) {
  let it = String((e && e.item) || "");
  if (it) return it;
  try {
    const C = (typeof v33Cases === "function") ? v33Cases() : [];
    const c = C.find((k) => (e && e.key && k.key === e.key) || (typeof v33CsId === "function" && v33CsId(k.key) === id));
    if (c) it = c.reqs.map((r) => (r && r.item) || "").join(" ");
  } catch (e2) { v96fErr("csitem", e2); }
  return it;
}
/* 日本酒で HS が 22.08 の所（B/L の情報・確認待ちの HS の取り込み） */
function v96fHsScan() {
  const out = [];
  try {
    if (typeof v33Get !== "function") return out;
    const o = v33Get(), CS = o.cs || {}, AQ = o.aq || {};
    Object.keys(CS).forEach((id) => {
      const e = CS[id];
      if (!e || e.del) return;
      if (e.v96hs && e.v96hs.undone) return;
      const item = v96fCsItem(id, e);
      if (v96fHsBad(item, e.hs)) out.push({ sec: "cs", id, from: String(e.hs), item });
    });
    Object.keys(AQ).forEach((id) => {
      const x = AQ[id];
      if (!x || x.del || x.st || typeof x.prop !== "string") return;
      const t = x.tgt || {};
      if (t.key !== "hs") return;
      const c = (t.cs && CS[t.cs]) || {};
      const item = c.item || (t.cs ? v96fCsItem(t.cs, c) : "") || String(x.srcLabel || "");
      if (v96fHsBad(item, x.prop)) out.push({ sec: "aq", id, from: x.prop, item });
    });
  } catch (e) { v96fErr("hsscan", e); }
  return out;
}
function v96fHsPut(x, auto) {
  const rec = { from: x.from, to: V96F_SAKE_HS, at: Date.now(), by: v96fWho(), auto: auto ? 1 : 0 };
  if (x.sec === "cs") v33Put("cs", x.id, { hs: V96F_SAKE_HS, v96hs: rec }, true);
  else v33Put("aq", x.id, { prop: V96F_SAKE_HS, v96hs: rec }, true);
}
/* 読み込み時：見本・体験用のアカウントなら直して保存（同期でサーバーにも残る） */
function v96fHsAuto() {
  try {
    if (V96FWD.hsBusy || !v96fSmpAcct() || typeof v33Key !== "function" || !v33Key()) return 0;
    const L = v96fHsScan();
    if (!L.length) return 0;
    V96FWD.hsBusy = 1;
    try {
      L.forEach((x) => v96fHsPut(x, 1));
      v33Save(v33Get(), false);
    } finally { V96FWD.hsBusy = 0; }
    V96FWD.n.hsAuto = (V96FWD.n.hsAuto || 0) + L.length;
    return L.length;
  } catch (e) { V96FWD.hsBusy = 0; v96fErr("hsauto", e); return 0; }
}
/* 利用者が入れた値：「2206.00 に直す」・元に戻す */
function v96fHsFix(id) {
  try {
    const e = (typeof v33One === "function") ? v33One("cs", id) : null;
    if (!e || !v96fHsBad(v96fCsItem(id, e), e.hs)) return false;
    v96fHsPut({ sec: "cs", id, from: String(e.hs) }, 0);
    v33Save(v33Get(), false);
    v96fCnt("hsFix");
    return true;
  } catch (x) { v96fErr("hsfix", x); return false; }
}
function v96fHsUndo(id) {
  try {
    const e = (typeof v33One === "function") ? v33One("cs", id) : null;
    if (!e || !e.v96hs || e.v96hs.undone) return false;
    v33Put("cs", id, { hs: e.v96hs.from, v96hs: Object.assign({}, e.v96hs, { undone: Date.now(), undoneBy: v96fWho() }) });
    v96fCnt("hsUndo");
    return true;
  } catch (x) { v96fErr("hsundo", x); return false; }
}
window.v96fHsBad = v96fHsBad; window.v96fHsFix = v96fHsFix; window.v96fHsUndo = v96fHsUndo; window.v96fSmpAcct = v96fSmpAcct; window.v96fCsItem = v96fCsItem;
try {
  if (typeof V33 !== "undefined" && V33 && Array.isArray(V33.onChange)) {
    let t = 0;
    V33.onChange.push(() => { if (t || V96FWD.hsBusy) return; t = setTimeout(() => { t = 0; v96fHsAuto(); }, 250); });
  }
} catch (e) { v96fErr("hson", e); }
if (typeof fwdRender === "function") {
  const __fr96f = fwdRender;
  fwdRender = function () {
    try { if (typeof fwdCur !== "undefined" && fwdCur === "fcase") v96fHsAuto(); } catch (e) { v96fErr("hsrender", e); }
    return __fr96f.apply(this, arguments);
  };
}
setTimeout(v96fHsAuto, 0);
