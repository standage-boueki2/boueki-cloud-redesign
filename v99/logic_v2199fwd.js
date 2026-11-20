/* ═══ v21.99 fwd（2026-11-19 第12回相当 UAT・21.98）物流会社（フォワーダー）側の直し — 中身の層（データ・計算・判定・AI の扱い）
   担当の行：
   No.554 見積受信箱の行・依頼番号を押しても明細が開かない／受信箱から日数（No.520 の目安）が見えない
     原因：受信箱の表（fwdInboxHtml・21.33 の v33FwdInbox）は、行と依頼番号（<b>RQ-…</b>）に押したときの動きが無く、
           明細（openFwdQuote の窓）は右端の「交渉記録」のボタンからしか開けなかった。表には日数の列が無かった。
     直し方：この層は「依頼の明細（荷主・品目・数量・重量/容積・仕向け・届いた見積・日数・期限・B/L の容積の食い違い）」と
           「国ごとの日数（COURIER の既定値は 21.97 の目安＝v97fLegEst を使い、目安なら目安と書く）」を1か所で出す（v99fReqDetail・v99fLegDays）。
           見せ方（行・依頼番号を押すと窓・日数の列）は rd_v99fwd.js。
   No.555 「要確認」の理由（価格の突出か、日数の既定値か）が見分けられない
     原因：レート管理の「要確認」の札（21.90 の v90fRatesPaint）は、理由が何でも同じ1つの札。21.96・21.97 は理由の文（⚠…）だけを直した。
     直し方：理由をこの層の1つの関数（v99fRateWhy）で出す。価格＝21.97 の v97fMedOf（中央値の5倍以上・5分の1以下）、
           日数＝21.96 の v96fTtKind（既定値・既定値かも）。数え方（v99fRateWhyAll・v99fAutoWhy・v99fRvWhy）も理由ごと。
   観察（p11）① AI の答えの末尾の「実AIは使っていません」「内蔵の計算」：v99fBasisTxt で、利用者に分かる1行に言い換える（荷主側の同じ文言も）。
   観察（p11）② AI の回答が遅い：AI物流マンへの質問のあいだ、何をしているか・経過秒数・目安を出し、途中で止める・あとで知らせる。
     止める＝AI の答えを待つのをやめ、21.33 からある「AI に接続できないとき」と同じ道（登録データから計算した答え）で答える（AI をもう1回呼ばない）。
     縮める：AI に渡す文脈の重複（21.96 と 21.97 が同じ COURIER の既定値のレーンを2回書く）だけを外す（AI の回数・同時の本数は増やさない）。
   今のアプリの関数・前の層は、控えてから包むだけ（中身は書き換えない）。同期サーバーは変えない。 */
var V99FWD = window.V99FWD = { v: "21.99", err: null, errs: [], n: {}, ask: null };
function v99fErr(k, e) { try { const m = k + ": " + String((e && e.message) || e).slice(0, 180); V99FWD.err = m; V99FWD.errs.push(m); if (V99FWD.errs.length > 40) V99FWD.errs.shift(); } catch (x) { /* 記録できないときは何もしない */ } }
function v99fCnt(k) { try { V99FWD.n[k] = (V99FWD.n[k] || 0) + 1; } catch (e) { /* 数えられなくても動きは変えない */ } }
function v99fLang() { try { const el = document.getElementById("lang"); const v = String((typeof I18N !== "undefined" && I18N && I18N.lang) || (el && el.value) || "ja"); return /^en/.test(v) ? "en" : /^zh/.test(v) ? "zh" : /^es/.test(v) ? "es" : "ja"; } catch (e) { return "ja"; } }
function v99fM(ja, en, zh, es) { const l = v99fLang(); return l === "en" ? (en || ja) : l === "zh" ? (zh || en || ja) : l === "es" ? (es || en || ja) : ja; }
function v99fE(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]); }
function v99fY(n) { return "¥" + Math.round(+n || 0).toLocaleString("ja-JP"); }
function v99fOn() { try { return typeof FWDON !== "undefined" && !!FWDON && typeof FWDB !== "undefined" && !!FWDB; } catch (e) { return false; } }
function v99fToday() { try { if (typeof v97fToday === "function") return v97fToday(); } catch (e) { /* 下で */ } const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
function v99fDayDiff(ymd) {
  const s = String(ymd || "").replace(/\//g, "-");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const a = Date.parse(s + "T00:00:00"), b = Date.parse(v99fToday() + "T00:00:00");
  return (isFinite(a) && isFinite(b)) ? Math.round((a - b) / 864e5) : null;
}
function v99fReqOf(id) { try { return ((typeof FWDB !== "undefined" && FWDB && FWDB.reqs) || []).find((x) => x && x.id === id) || null; } catch (e) { return null; } }
window.v99fReqOf = v99fReqOf;

/* ══════════════════════════════════════════════════════════════════════
   No.554・No.520 国ごとの日数（目安なら目安と書く）と、依頼の明細
   ══════════════════════════════════════════════════════════════════════ */
/* 見積（q）と会社の回答（o）から、日数の書き方。e＝21.97 の COURIER の目安（無ければ null） */
function v99fDaysOf(q, e, delay, kind) {
  const d = +delay || 0;
  if (e && typeof v97fRange === "function") {
    const est = e.src === "region";
    const w = typeof v97fEstWord === "function" ? v97fEstWord(e) : v99fM("目安", "estimate");
    return { lo: e.lo, hi: e.hi, est, src: e.src, word: w, why: typeof v97fEstWhy === "function" ? v97fEstWhy(e) : "", delay: d,
      txt: v99fM(`${v97fRange(e)}日（${w}）`, `${v97fRange(e)} days (${w})`, `${v97fRange(e)}天（${w}）`, `${v97fRange(e)} días (${w})`) };
  }
  const tt = q && q.tt != null && q.tt !== "" ? +q.tt : null;
  if (!(tt > 0)) return { none: 1, delay: d, txt: v99fM("日数の登録なし", "no transit days", "未登记天数", "sin días") , why: v99fM("この見積のもとのレートに、所要日数が登録されていません（レート管理で日数を入れると出ます）", "The rate has no transit days registered") };
  const k = kind === "def" || kind === "maybe" ? kind : "";
  const kw = k === "def" ? v99fM("既定値", "default") : k === "maybe" ? v99fM("既定値かも", "may be default") : "";
  return { lo: tt, hi: tt, def: k, delay: d, why: k && typeof v96fTtWhy === "function" ? v96fTtWhy(k) : "",
    txt: v99fM(`約${tt}日${kw ? "（" + kw + "）" : ""}`, `about ${tt} days${kw ? " (" + kw + ")" : ""}`, `约${tt}天${kw ? "（" + kw + "）" : ""}`, `unos ${tt} días${kw ? " (" + kw + ")" : ""}`) };
}
/* 国（leg）の日数＝選択中（または推奨）の会社の見積の日数 */
function v99fLegDays(l) {
  try {
    if (!l || !l.ok || !l.quote) return null;
    let e = null; try { e = typeof v97fLegEst === "function" ? v97fLegEst(l) : null; } catch (x) { e = null; }
    let k = ""; try { k = typeof v96fQuoteKind === "function" ? v96fQuoteKind(l) : ""; } catch (x) { k = ""; }
    return v99fDaysOf(l.quote, e, l.delay, k);
  } catch (x) { v99fErr("legdays", x); return null; }
}
function v99fOfferDays(o, l) {
  try {
    if (!o || !o.quote) return null;
    let e = null; try { e = typeof v97fOfferEst === "function" ? v97fOfferEst(o) : null; } catch (x) { e = null; }
    let k = ""; try { k = typeof v96fOfferKind === "function" ? v96fOfferKind(o) : ""; } catch (x) { k = ""; }
    return v99fDaysOf(o.quote, e, l && l.delay, k);
  } catch (x) { v99fErr("offdays", x); return null; }
}
/* 依頼の国ごとの日数（受信箱の列・明細） */
function v99fReqDays(r) {
  const out = [];
  try {
    if (!r) return out;
    const L = Array.isArray(r.legs) ? r.legs : null;
    if (L) L.forEach((l) => { if (l && l.ok && l.quote) { const d = v99fLegDays(l); if (d) out.push(Object.assign({ cty: l.cty || l.pod || "" }, d)); } });
    else if (r.quote) out.push(Object.assign({ cty: r.cty || r.pod || "" }, v99fDaysOf(r.quote, null, 0, "")));
  } catch (e) { v99fErr("reqdays", e); }
  return out;
}
window.v99fLegDays = v99fLegDays; window.v99fReqDays = v99fReqDays; window.v99fOfferDays = v99fOfferDays;

/* 有効期限の書き方（あと◯日／今日まで／期限切れ） */
function v99fValidTxt(v) {
  const s = String(v || "").trim();
  if (!s) return { txt: v99fM("期限の登録なし", "no validity"), exp: false };
  const n = v99fDayDiff(s);
  if (n == null) return { txt: s, exp: false };
  if (n < 0) return { txt: v99fM(`${s}（期限切れ・${-n}日前）`, `${s} (expired ${-n} days ago)`, `${s}（已过期 ${-n} 天）`, `${s} (vencida hace ${-n} días)`), exp: true, n };
  if (n === 0) return { txt: v99fM(`${s}（今日まで）`, `${s} (today)`, `${s}（今天到期）`, `${s} (hoy)`), exp: false, n };
  return { txt: v99fM(`${s}（あと${n}日）`, `${s} (${n} days left)`, `${s}（还剩 ${n} 天）`, `${s} (quedan ${n} días)`), exp: false, n };
}
/* B/L の容積の食い違い（21.97 の v97fVolAuto＝まだ反映していない国／v97fVolApplied＝反映済み） */
function v99fReqBl(r) {
  try {
    if (!r || typeof v33Cases !== "function") return null;
    const C = v33Cases() || [];
    const c = C.find((k) => (k.reqs || []).some((x) => x && x.id === r.id));
    if (!c) return null;
    const csid = typeof v33CsId === "function" ? v33CsId(c.key) : "";
    const cs = (csid && typeof v33One === "function" ? v33One("cs", csid) : null) || {};
    const A = (typeof v97fVolAuto === "function" ? v97fVolAuto(c, cs) : []).filter((x) => x.rid === r.id);
    const P = (typeof v97fVolApplied === "function" ? v97fVolApplied(c, cs) : []).filter((x) => x.rid === r.id);
    const bl = +String(cs.cbm == null ? "" : cs.cbm).replace(/[^\d.]/g, "") || null;
    return { csid, caseKey: c.key, bl, from: +r.cbm || null, A, P };
  } catch (e) { v99fErr("bl", e); return null; }
}
/* 依頼の明細（受信箱の行・依頼番号を押したときの窓に出す中身） */
function v99fReqDetail(id) {
  try {
    const r = typeof id === "object" ? id : v99fReqOf(id);
    if (!r) return null;
    const fa = typeof v33FaOf === "function" ? (v33FaOf(r.id) || {}) : {};
    let st = ""; try { st = typeof fwdReqStatus === "function" ? fwdReqStatus(r) : (r.status || ""); } catch (e) { st = r.status || ""; }
    const legs = [];
    (Array.isArray(r.legs) ? r.legs : []).forEach((l) => {
      if (!l) return;
      if (!l.ok || !l.quote) { legs.push({ cty: l.cty || l.pod || "", pod: l.pod || "", ok: 0 }); return; }
      const q = l.quote, O = Array.isArray(l.offers) ? l.offers : [];
      const sel = l.sel || l.co || "", rec = l.rec || "";
      let held = false; try { held = typeof fwdLegHeld === "function" ? !!fwdLegHeld(r, l) : !!l.hold; } catch (e) { held = !!l.hold; }
      const offers = O.filter((o) => o && o.quote).map((o) => ({ co: o.co || "", total: +o.quote.total || 0, days: v99fOfferDays(o, l), valid: v99fValidTxt(o.quote.valid), sel: o.co === sel, rec: o.co === rec }));
      legs.push({ cty: l.cty || l.pod || "", pod: l.pod || "", ok: 1, lane: q.lane || "", mode: q.mode || r.mode || "", total: +q.total || 0, co: sel, rec, held, n: offers.length || 1, offers, days: v99fLegDays(l), valid: v99fValidTxt(q.valid), fob: !!q.v56shipFob, courier: !!q.courier });
    });
    if (!legs.length && r.quote) legs.push({ cty: r.cty || r.pod || "", pod: r.pod || "", ok: 1, lane: r.quote.lane || "", mode: r.quote.mode || r.mode || "", total: +r.quote.total || 0, co: "", rec: "", held: false, n: 1, offers: [], days: v99fDaysOf(r.quote, null, 0, ""), valid: v99fValidTxt(r.quote.valid) });
    const task = fa.task && !fa.task.done ? { t: fa.task.t || "", due: fa.task.due ? new Date(+fa.task.due) : null } : null;
    return {
      id: r.id, d: r.d || "", co: r.co || "", item: r.item || "", cat: r.cat || "", cartons: +r.cartons || 0, pack: typeof r.pack === "string" ? r.pack : "", cargo: typeof r.cargo === "string" ? r.cargo : "",
      weight: +r.weight || 0, cbm: +r.cbm || 0, mode: r.mode || "", term: r.term || "", pol: r.pol || "", cty: r.cty || "", pod: r.pod || "", etd: r.etd || "", status: st,
      who: fa.who || "", done: fa.st === "done", task, note: r.note || "", requote: !!r.requote, parentId: r.parentId || "", caseNo: r.caseNo || "", legs, bl: v99fReqBl(r)
    };
  } catch (e) { v99fErr("detail", e); return null; }
}
window.v99fReqDetail = v99fReqDetail; window.v99fValidTxt = v99fValidTxt;

/* ══════════════════════════════════════════════════════════════════════
   No.555 「要確認」の理由を分ける（価格の突出／日数の既定値）と、理由ごとの数
   ══════════════════════════════════════════════════════════════════════ */
function v99fRateWhy(r, R) {
  const out = [];
  try {
    if (!r) return out;
    const o = typeof v97fMedOf === "function" ? v97fMedOf(r, R) : null;
    if (o && o.out) {
      const hi = o.x >= 1;
      const xs = hi ? (typeof v97fXNum === "function" ? v97fXNum(o.x) : Math.round(o.x * 10) / 10) : Math.round(1 / o.x);
      out.push({ k: "price", hi, x: o.x, xs, med: o.med, unit: (o.g && o.g.unit) || r.unit || "", n: o.n,
        label: hi ? v99fM(`価格が突出（中央値の約${xs}倍）`, `Price outlier (about ${xs}× the median)`, `价格异常（约为中位数的 ${xs} 倍）`, `Precio atípico (unas ${xs} veces la mediana)`)
          : v99fM(`価格が低すぎ（中央値の約${xs}分の1）`, `Price too low (about 1/${xs} of the median)`, `价格过低（约为中位数的 1/${xs}）`, `Precio demasiado bajo (aprox. 1/${xs} de la mediana)`) });
    }
    const k = typeof v96fTtKind === "function" ? v96fTtKind(r) : "";
    if (k === "def" || k === "maybe") {
      const tt = +r.tt || 10;
      out.push({ k: "days", kind: k, tt,
        label: k === "def" ? v99fM(`日数が既定値（${tt}日のまま）`, `Days are the default (${tt} days as is)`, `天数为默认值（仍为 ${tt} 天）`, `Días por defecto (${tt} días)`)
          : v99fM(`日数が既定値かも（${tt}日のまま）`, `Days may be the default (${tt} days as is)`, `天数可能为默认值（仍为 ${tt} 天）`, `Días quizá por defecto (${tt} días)`) });
    }
  } catch (e) { v99fErr("ratewhy", e); }
  return out;
}
function v99fRateWhyAll() {
  const R = ((typeof FWDB !== "undefined" && FWDB && FWDB.rates) || []);
  const res = { by: {}, price: 0, priceHi: 0, priceLo: 0, days: 0, both: 0, any: 0, n: R.length };
  try {
    R.forEach((r, i) => {
      const W = v99fRateWhy(r, R);
      if (!W.length) return;
      res.by[i] = W;
      res.any++;
      const p = W.find((x) => x.k === "price"), d = W.some((x) => x.k === "days");
      if (p) { res.price++; if (p.hi) res.priceHi++; else res.priceLo++; }
      if (d) res.days++;
      if (p && d) res.both++;
    });
  } catch (e) { v99fErr("whyall", e); }
  return res;
}
/* AI回答のうち要確認（21.95 の v95miscAutoRate＝21.90 の v90fRowKinds が1つでもある依頼）の理由ごとの数 */
function v99fAutoWhy() {
  const out = { auto: 0, warn: 0, exp: 0, port: 0, days: 0 };
  try {
    ((typeof FWDB !== "undefined" && FWDB && FWDB.reqs) || []).forEach((r) => {
      if (!r) return;
      const ok = (r.legs || []).some((l) => l && l.ok);
      if (!(r.quote || ok)) return;
      out.auto++;
      const K = typeof v90fRowKinds === "function" ? v90fRowKinds(r) : [];
      if (K.length) out.warn++;
      if (K.some((s) => /期限切れ|expired/i.test(s))) out.exp++;
      if (K.some((s) => /仕出港が違う|different port/i.test(s))) out.port++;
      if (v99fReqDays(r).some((d) => d && (d.est || d.def || (d.src && d.src !== "region")))) out.days++;
    });
  } catch (e) { v99fErr("autowhy", e); }
  return out;
}
/* 依頼の「要確認」（21.33 の v33FwdNeeds＝国ごとの見積が1つも出せなかった依頼）の理由 */
function v99fRvWhy() {
  const out = { rv: 0, nolane: 0 };
  try {
    ((typeof FWDB !== "undefined" && FWDB && FWDB.reqs) || []).forEach((r) => {
      if (!r || typeof v33FwdNeeds !== "function" || !v33FwdNeeds(r)) return;
      if (typeof v33FwdState === "function" && v33FwdState(r) === "done") return;
      out.rv++; out.nolane++;
    });
  } catch (e) { v99fErr("rvwhy", e); }
  return out;
}
window.v99fRateWhy = v99fRateWhy; window.v99fRateWhyAll = v99fRateWhyAll; window.v99fAutoWhy = v99fAutoWhy; window.v99fRvWhy = v99fRvWhy;

/* ══════════════════════════════════════════════════════════════════════
   観察① AI の答えの末尾の「実AIは使っていません」「内蔵の計算」を、利用者に分かる1行に
   ══════════════════════════════════════════════════════════════════════ */
var V99F_NOAI = "AI は使わず、登録データから計算した答えです（AI の回数は使っていません）";
function V99F_STOPTXT() { return "⚠ 待たずに止めたため、AI の答えは使わず、登録データから計算して答えました（AI をもう一度呼んではいません）"; }
var V99F_BASIS = [
  /* 物流会社の内蔵の答え（21.68〜21.90 の層）。「相見積の画面と同じ数」などの説明は残す */
  [/（内蔵の計算。相見積の画面と同じ数。外の相場は使っていません）/g, "（相見積の画面と同じ数。" + V99F_NOAI + "。外の相場は使っていません）"],
  [/・内蔵の計算。外の相場は使っていません）/g, "）。" + V99F_NOAI + "。外の相場は使っていません"],
  [/（内蔵の計算。外の相場は使っていません）/g, "。" + V99F_NOAI + "。外の相場は使っていません"],
  [/（内蔵の計算。実\s*AI\s*は使っていません）/g, "。" + V99F_NOAI],
  [/内蔵の計算。実\s*AI\s*は使っていません/g, V99F_NOAI],
  /* 操作ガイドからの答え（荷主・物流会社）。荷主の答えの末尾は 60字を超えると「調べた手順」にたたまれる（21.38 v38FoldBB）ので短く */
  [/（実画面の見出し・ボタン名どおり。実\s*AI\s*は使っていません）/g, "（AI を使わずガイドから答えました・AI の回数は使っていません）"],
  [/実画面の見出し・ボタン名どおり。実\s*AI\s*は使っていません/g, "AI を使わずガイドから答えました・AI の回数は使っていません"],
  /* AI に聞けなかったとき（21.33 の fwdAsk の catch）・止めたとき */
  [/⚠\s*実\s*AI\s*に接続できず内蔵エンジンで回答（利用者が止めました[^）]*）/g, V99F_STOPTXT()],
  [/⚠\s*実\s*AI\s*に接続できず内蔵エンジンで回答/g, "⚠ AI に接続できなかったため、AI の答えは使わず、登録データから計算して答えました"],
  [/AIにつながらなかったため、登録データ（内蔵エンジン）で答えています。/g, "AIにつながらなかったため、AI の答えではなく、登録データから計算した答えです。"],
  [/⚠\s*接続AIの応答が(\d+)秒以内に返らなかったため内蔵エンジンで回答/g, "⚠ AI の答えが$1秒以内に届かなかったため、AI の答えは使わず、登録データから答えました"],
  [/⚠\s*接続AI失敗のため内蔵エンジンで回答/g, "⚠ AI につながらなかったため、AI の答えは使わず、登録データから答えました"],
  [/⚠\s*接続AIの回答が空だったため内蔵エンジンで回答/g, "⚠ AI の答えが空だったため、AI の答えは使わず、登録データから答えました"],
  /* 「エンジン：内蔵」（物流会社の答え・荷主の資料の読み取り） */
  [/（エンジン：内蔵（ローカル解析））|エンジン：内蔵（ローカル解析）/g, "AI を使わず画面の中で読み取りました（AI の回数は使っていません）"],
  [/（エンジン：内蔵）/g, "（" + V99F_NOAI + "）"],
  /* AI が答えたとき（対比のため、AI を使ったことを同じ言葉で） */
  [/（実\s*AI・社内物流データを注入済み）/g, "（AI が貴社の登録データを読んで答えました。AI の回数を使っています）"],
  /* 英語 */
  [/\(built-in calculation, no live AI\)/g, "(calculated from your registered data without AI; no AI usage counted)"],
  [/built-in calculation, no live AI/g, "calculated from your registered data without AI; no AI usage counted"]
];
function v99fBasisTxt(s) {
  let t = String(s == null ? "" : s);
  if (!/内蔵|実\s*AI|no live AI|利用者が止めました|接続AI|待たずに止めた|つながらなかった|届かなかった/.test(t)) return t;
  V99F_BASIS.forEach((x) => { t = t.replace(x[0], x[1]); });
  /* AI に送ったあとで止めた・つながらなかった答えでは「AI の回数は使っていません」と言い切らない（数えられたかは画面から分からない） */
  if (/⚠\s*(待たずに止めた|AI に接続できなかった|AIにつながらなかった|AI につながらなかった|AI の答えが\d+秒以内に届かなかった|AI の答えが空だった)/.test(t)) t = t.replace(/（AI の回数は使っていません）/g, "");
  return t.replace(/。。/g, "。");
}
window.v99fBasisTxt = v99fBasisTxt;
/* 新しく作る答えの文（チャットの記録）も言い換えて残す（前の答えは見せるときに言い換える＝rd_v99fwd.js） */
if (typeof fwdBrain === "function") {
  const __fb99f = fwdBrain;
  fwdBrain = function () {
    const o = __fb99f.apply(this, arguments);
    try { if (o && typeof o.c === "string") o.c = v99fBasisTxt(o.c); } catch (e) { v99fErr("brain", e); }
    return o;
  };
}

/* ══════════════════════════════════════════════════════════════════════
   観察② AI物流マンの答えを待つあいだ（進み・止める・あとで知らせる）
   ══════════════════════════════════════════════════════════════════════ */
function v99fAskStop() {
  const A = V99FWD.ask;
  if (!A || A.done || A.stopped) return false;
  A.stopped = Date.now();
  try { (A.rej || []).forEach((f) => { try { f(new Error("利用者が止めました")); } catch (e) { /* 無視 */ } }); } catch (e) { v99fErr("stop", e); }
  /* 右下の「考え中…」も隠す（元の AI の問い合わせは裏で終わるまで続くが、答えは使わない） */
  try { if (typeof AIT !== "undefined" && AIT) { AIT.hidden = 1; const d = document.getElementById("aiThink"); if (d) d.classList.remove("on"); } } catch (e) { /* 無視 */ }
  v99fCnt("stop");
  return true;
}
function v99fAskLater() { const A = V99FWD.ask; if (!A || A.done) return false; A.later = 1; v99fCnt("later"); return true; }
window.v99fAskStop = v99fAskStop; window.v99fAskLater = v99fAskLater;
if (typeof llmAsk === "function") {
  const __la99f = llmAsk;
  llmAsk = function (q, maxTok, opts) {
    const A = V99FWD.ask;
    if (!A || A.done || A.stopped || (opts && opts.bg)) return __la99f.apply(this, arguments);
    A.calls = (A.calls || 0) + 1;
    if (opts && opts._retry2) A.retry = 1;
    A.phase = A.retry ? "retry" : "ai";
    let rj = null;
    const stopP = new Promise((_, rej) => { rj = rej; });
    (A.rej = A.rej || []).push(rj);
    let p;
    try { p = Promise.resolve(__la99f.apply(this, arguments)); } catch (e) { return Promise.reject(e); }
    p.catch(() => { /* 止めたあとに届いた失敗は使わない */ });
    stopP.catch(() => { /* 止めなかったとき */ });
    return Promise.race([p, stopP]);
  };
}
if (typeof fwdAsk === "function") {
  const __fa99f = fwdAsk;
  fwdAsk = async function (v) {
    const q = String(v || "").trim();
    if (!q || !v99fOn() || (V99FWD.ask && !V99FWD.ask.done)) return __fa99f.apply(this, arguments);
    const A = { q, t0: Date.now(), phase: "read", calls: 0, rej: [], id: Date.now().toString(36) };
    V99FWD.ask = A;
    try { if (typeof window.v99fAskPaint === "function") window.v99fAskPaint(); } catch (e) { v99fErr("askpaint", e); }
    try { return await __fa99f.apply(this, arguments); }
    finally {
      A.done = Date.now();
      V99FWD.last = { q, ms: A.done - A.t0, calls: A.calls, stopped: !!A.stopped, retry: !!A.retry };
      /* 止めたときの答えの末尾（21.33 の「実AIに接続できず…（利用者が止めました）」・21.65 の言い換え）を、止めたことが分かる文に（記録にも） */
      if (A.stopped) {
        try {
          const C = (FWDB && FWDB.chat) || [], a = C[C.length - 1];
          if (a && a.w === "a" && typeof a.t === "string") {
            const y = a.t.replace(/⚠\s*実\s*AI\s*に接続できず内蔵エンジンで回答（利用者が止めました）|⚠\s*AIにつながらなかったため、登録データ（内蔵エンジン）で答えています。少し時間をおいて、もう一度お試しください/, V99F_STOPTXT());
            const y2 = v99fBasisTxt(y);
            if (y2 !== a.t) { a.t = y2; if (typeof fwdSave === "function") fwdSave(); if (typeof fwdCur !== "undefined" && fwdCur === "fai" && typeof fwdRender === "function") fwdRender(); }
          }
        } catch (e) { v99fErr("stoptxt", e); }
      }
      V99FWD.ask = null;
      try { if (typeof window.v99fAskDone === "function") window.v99fAskDone(A); } catch (e) { v99fErr("askdone", e); }
    }
  };
}
/* 縮める：AI に渡す文脈の重複を外す（21.96 の「日数が既定値のレーン」の COURIER の行は、21.97 の「COURIER の日数」と同じレーン） */
function v99fCtxDedupe(s) {
  try {
    const t = String(s);
    const a = t.indexOf("\n## 日数が既定値のレーン"), b = t.indexOf("\n## COURIER の日数");
    if (a < 0 || b < 0 || b < a) return t;
    const sec = t.slice(a, b);
    const lines = sec.split("\n");
    /* 21.99.3（11/20 回帰の洗い出し）：21.97 の節は有効期限内のレートしか載せない。期限切れの COURIER のレーン（例：ベトナム）まで外すと
       「日数は既定値」の印が AI に届かなくなったため、21.97 の節に同じレーンがある行だけを外す */
    const sec97 = t.slice(b);
    const dup97 = (ln) => { const m = /^(・.+?) COURIER（/.exec(ln); return !!m && sec97.indexOf("\n" + m[1] + " COURIER：") >= 0; };
    const keep = lines.filter((ln) => !dup97(ln));
    const body = keep.filter((ln) => /^・/.test(ln));
    let ns;
    if (!body.length) ns = "";   /* COURIER だけだった＝21.97 の節と同じ中身 */
    else ns = keep.filter((ln) => !/^ほか \d+レーン$/.test(ln)).join("\n");
    if (ns.length < sec.length) v99fCnt("ctxDedupe");
    return t.slice(0, a) + ns + t.slice(b);
  } catch (e) { v99fErr("dedupe", e); return s; }
}
window.v99fCtxDedupe = v99fCtxDedupe;
if (typeof fwdContext === "function") {
  const __cx99f = fwdContext;
  fwdContext = function () { const s = __cx99f.apply(this, arguments); try { return v99fCtxDedupe(s); } catch (e) { v99fErr("cx", e); return s; } };
}
