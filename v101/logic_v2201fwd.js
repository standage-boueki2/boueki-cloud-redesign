/* ═══ v22.01 fwd（2026-11-22 第14回 UAT〔22.00.1〕の直し）物流会社の画面の中身の層（rd_v101fwd.css・rd_v101fwd.js の前に読む）
   No.625 見積の状況を「貴社の回答状況」で数える：他社だけが答えた依頼（RQ-OFILSY など）を「回答済み」と数えない・他社の金額を貴社の見積に見せない。
          受信箱のチップ・ホームの AI自動回答率（そのまま出せる回答）・「AI回答 N件」・理由の数を、貴社のレートで答えた依頼で数える。
          fwdReqStatus そのもの（保存される r.status）は変えない。画面に出す言葉は v101fStLabel で作る。
   No.626 容積の出どころをそろえる：B/L の容積「1.11m3」を 1.113 と読んでいた（21.99 v99fReqBl の数字だけを残す読み方）→ 最初の数（1.11）。
          依頼の容積が「荷主の共有」（貨物の欄・カートン・重量がある）か「標準 2 m³」（荷主が容積を入れていない依頼の既定値）かを見分ける（v101fVolSrc）。
   No.627 相見積・AI推奨のレーン：同じ国（COURIER など国あての行）・同じ港（LCL/FCL の港あての行）は1行に（v101fLaneKey）。地域の区分（西部・その他）は区分として同じ行の中に。
   No.628 スポット見積：見積は「区間のレート」で答えること（この依頼だけの金額は出せないこと）を入力の前に書く（見せ方は rd_v101fwd.js）。
   期待以上：自動回答が少ない理由（期限切れ・仕出港違い・貴社のレートが無い区間）と次の一手（v101fAutoWhy）。AI物流マンに渡す文脈にも同じ数え方。
   土台・前の層の関数は控えてから包むだけ。同じ包みを何度通っても結果が同じになるように書く（window.__v101f* の印）。 */
var V101FWD = window.V101FWD || { v: "22.01", err: null, errs: [], n: {} };
window.V101FWD = V101FWD;
function v101fErr(k, e) { try { const m = k + ": " + String((e && e.message) || e).slice(0, 180); V101FWD.err = m; V101FWD.errs.push(m); if (V101FWD.errs.length > 40) V101FWD.errs.shift(); } catch (x) { /* 記録できないときは何もしない */ } }
function v101fCnt(k) { try { V101FWD.n[k] = (V101FWD.n[k] || 0) + 1; } catch (e) { /* 無視 */ } }
function v101fM(ja, en, zh, es) { try { const l = (typeof I18N !== "undefined" && I18N && I18N.lang) || "ja"; return l === "en" ? (en || ja) : l === "zh" ? (zh || en || ja) : l === "es" ? (es || en || ja) : ja; } catch (e) { return ja; } }
window.v101fM = v101fM;
function v101fOn() { try { return typeof FWDON !== "undefined" && !!FWDON && typeof FWDB !== "undefined" && !!FWDB; } catch (e) { return false; } }
window.v101fOn = v101fOn;
function v101fMe() { try { return typeof fwdCo === "function" ? String(fwdCo() || "") : String((FWDB && FWDB.profile && FWDB.profile.co) || ""); } catch (e) { return ""; } }
window.v101fMe = v101fMe;
function v101fY(n) { return "¥" + Math.round(+n || 0).toLocaleString("ja-JP"); }
function v101fReqs() { try { return ((typeof FWDB !== "undefined" && FWDB && FWDB.reqs) || []).filter(Boolean); } catch (e) { return []; } }

/* ═══ No.625 貴社の回答状況 ═══════════════════════════════════════════ */
/* 国ごとの見積（leg）の中の、貴社の見積（offer）。offers の無い古い形は、選んだ会社が貴社か空のときだけ貴社とみなす */
function v101fOwnOffer(l) {
  try {
    if (!l || !l.ok) return null;
    const me = v101fMe(), O = Array.isArray(l.offers) ? l.offers : [];
    if (O.length) return O.find((o) => o && o.co === me && o.quote) || null;
    const who = l.sel || l.co || "";
    if (l.quote && (!who || who === me)) return { co: me, quote: l.quote, rate: l.rate || null, v101old: 1 };
    return null;
  } catch (e) { v101fErr("ownoffer", e); return null; }
}
window.v101fOwnOffer = v101fOwnOffer;
/* 1件の依頼の貴社の回答状況
   kind: "open"（どの会社も見積を出せなかった）／"own"（貴社が全部の国に回答）／"part"（一部の国だけ）／"others"（他社だけが回答・貴社は未回答） */
function v101fOwnSt(r) {
  const o = { kind: "open", okN: 0, ownN: 0, own: [], cos: [], othersMin: null, othersSel: [] };
  try {
    if (!r) return o;
    if (r.quote) { o.kind = "own"; o.okN = o.ownN = 1; o.own.push({ l: null, o: { quote: r.quote, co: v101fMe() } }); return o; }
    const ok = (Array.isArray(r.legs) ? r.legs : []).filter((l) => l && l.ok);
    o.okN = ok.length;
    if (r.open || !ok.length) return o;
    const me = v101fMe(), cos = new Set();
    ok.forEach((l) => {
      const ow = v101fOwnOffer(l);
      if (ow) o.own.push({ l, o: ow });
      (Array.isArray(l.offers) ? l.offers : []).forEach((x) => { if (x && x.co && x.co !== me) cos.add(x.co); });
      if (!ow) {
        const sel = (l.offers || []).find((x) => x && x.co === (l.sel || l.co)) || null;
        const tot = sel && sel.quote ? +sel.quote.total : (l.quote ? +l.quote.total : null);
        o.othersSel.push({ cty: l.cty || l.pod || "", co: (sel && sel.co) || l.sel || l.co || "", total: tot });
        if (tot != null && (o.othersMin == null || tot < o.othersMin)) o.othersMin = tot;
      }
    });
    o.ownN = o.own.length;
    o.cos = [...cos];
    o.kind = !o.ownN ? "others" : o.ownN < o.okN ? "part" : "own";
  } catch (e) { v101fErr("ownst", e); }
  return o;
}
window.v101fOwnSt = v101fOwnSt;
/* 画面に出す状況の言葉（fwdReqStatus の言葉を、貴社の回答状況に合わせる。仮押さえ・他社に決定・レーン未登録はそのまま） */
function v101fStLabel(r) {
  let st = "";
  try { st = typeof fwdReqStatus === "function" ? String(fwdReqStatus(r) || "") : String((r && r.status) || ""); } catch (e) { st = String((r && r.status) || ""); }
  const O = v101fOwnSt(r);
  const out = { txt: st, sub: "", kind: O.kind, base: st, O };
  try {
    if (/他社に決定|仮押さえ|未登録/.test(st)) return out;
    if (O.kind === "others") {
      out.txt = v101fM("未回答（貴社のレートなし）", "Not answered (no rate of yours)", "未回复（贵司无费率）", "Sin respuesta (sin tarifa suya)");
      out.sub = v101fM(`他社 ${O.cos.length}社が回答済み・荷主が検討中`, `${O.cos.length} other forwarder(s) answered; shipper is reviewing`, `其他 ${O.cos.length} 家已回复・货主研究中`, `${O.cos.length} otra(s) respondieron`);
    } else if (O.kind === "part" && /回答済み/.test(st)) {
      out.txt = v101fM(`回答済み（貴社 ${O.ownN}/${O.okN}か国）・荷主が検討中`, `Answered (${O.ownN}/${O.okN} countries by you); shipper reviewing`, `已回复（贵司 ${O.ownN}/${O.okN} 国）`, `Respondida (${O.ownN}/${O.okN} países)`);
      out.sub = v101fM(`ほかの ${O.okN - O.ownN}か国は他社だけが回答（貴社のレートなし）`, `The other ${O.okN - O.ownN} only by other forwarders`, `其余 ${O.okN - O.ownN} 国仅其他公司回复`, `Las otras ${O.okN - O.ownN} solo por otras`);
    }
  } catch (e) { v101fErr("stlabel", e); }
  return out;
}
window.v101fStLabel = v101fStLabel;
/* 見積合計の欄（貴社の金額を先に・他社の金額は「他社」と書く） */
function v101fCellParts(r) {
  const O = v101fOwnSt(r);
  const P = { kind: O.kind, own: "", other: "" };
  try {
    if (O.kind === "open") return P;
    if (O.ownN) {
      const T = O.own.map((x) => +((x.o && x.o.quote && x.o.quote.total) || 0)).filter((x) => x >= 0);
      const mn = T.length ? Math.min(...T) : 0;
      P.own = O.okN > 1 || O.ownN > 1 ? v101fM(`貴社 ${O.ownN}/${O.okN}か国 ${v101fY(mn)}〜`, `Yours ${O.ownN}/${O.okN}: from ${v101fY(mn)}`) : v101fM(`貴社 ${v101fY(mn)}`, `Yours ${v101fY(mn)}`);
      /* 選択中が他社の国 */
      const oth = O.own.filter((x) => x.l && (x.l.sel || x.l.co) && (x.l.sel || x.l.co) !== v101fMe()).map((x) => { const s = (x.l.offers || []).find((y) => y && y.co === (x.l.sel || x.l.co)); return s && s.quote ? { co: s.co, total: +s.quote.total } : null; }).filter(Boolean);
      if (oth.length) { P.other = v101fM(`選択中は他社 ${oth.length > 1 ? v101fY(Math.min(...oth.map((x) => x.total))) + "〜" : v101fY(oth[0].total)}`, `Selected: another forwarder ${v101fY(oth[0].total)}`); P.otherShort = P.other; }
    } else {
      P.own = v101fM("貴社の見積なし", "No quote of yours", "贵司无报价", "Sin cotización suya");
      if (O.othersMin != null) { const amt = O.othersSel.length > 1 ? v101fY(O.othersMin) + "〜" : v101fY(O.othersMin); P.other = v101fM(`他社の見積 ${amt}（貴社の見積ではありません）`, `Other forwarders: ${amt} (not yours)`); P.otherShort = v101fM(`他社の見積 ${amt}`, `other forwarders ${amt}`); }
    }
  } catch (e) { v101fErr("cell", e); }
  return P;
}
window.v101fCellParts = v101fCellParts;

/* 数え方を1つに（ホーム・受信箱のチップ・内訳）：AI回答＝貴社のレートで AI が見積を出した依頼／他社だけ＝貴社は未回答／レーン未登録＝どの会社も見積を出せなかった */
function v101fCounts() {
  const R = v101fReqs();
  const out = { all: R.length, own: 0, part: 0, others: 0, open: 0, ids: { own: [], others: [], open: [] } };
  R.forEach((r) => {
    const O = v101fOwnSt(r);
    if (O.kind === "own" || O.kind === "part") { out.own++; out.ids.own.push(r.id); if (O.kind === "part") out.part++; }
    else if (O.kind === "others") { out.others++; out.ids.others.push(r.id); }
    else { out.open++; out.ids.open.push(r.id); }
  });
  return out;
}
window.v101fCounts = v101fCounts;
/* 22.00.1 の受信箱の数え方（v100fInboxCounts）：チップ「AI回答済み」を貴社のレートで答えた依頼に。ids.others（貴社は未回答）を足す */
if (typeof v100fInboxCounts === "function" && !window.__v101fIbc) {
  window.__v101fIbc = 1;
  const __ibc101 = v100fInboxCounts;
  window.v100fInboxCounts = function () {
    const o = __ibc101.apply(this, arguments);
    try {
      if (!v101fOn() || !o || !o.ids) return o;
      const C = v101fCounts();
      o.ai = C.own; o.ids.ai = C.ids.own.slice();
      o.others = C.others; o.ids.others = C.ids.others.slice();
      o.v101 = 1;
    } catch (e) { v101fErr("ibc", e); }
    return o;
  };
}
/* 貴社の1件の見積の確かめどころ（21.90 v90fRowKinds と同じ決まり＝期限切れのレート・依頼と違う仕出港。ただし貴社の見積で） */
function v101fOwnKinds(r, l, ow) {
  const k = { exp: false, port: false };
  try {
    const q = (ow && ow.quote) || {}, rt = (ow && ow.rate) || {};
    const exp = (typeof v82fExp === "function") ? v82fExp : ((v) => { const s = String(v || "").replace(/\//g, "-"); return /^\d{4}-\d{2}-\d{2}$/.test(s) && s < (typeof TODAYS !== "undefined" ? TODAYS : ""); });
    k.exp = !!exp(rt.valid || q.valid);
    const lp = typeof v82fLanePol === "function" ? v82fLanePol(q) : "";
    const pk = typeof v82fPolKey === "function" ? v82fPolKey : ((s) => String(s || "").replace(/\s+/g, "").replace(/(?:国際)?(?:空港|港)$/, "").toLowerCase());
    k.port = !!(r && r.pol && lp && !q.v56shipFob && pk(lp) !== pk(r.pol));
    k.lp = lp;
  } catch (e) { v101fErr("ownkinds", e); }
  return k;
}
/* AI自動回答率（21.95 v95miscAutoRate）と理由（21.99 v99fAutoWhy）を、貴社のレートで答えた依頼で数える */
function v101fAutoRate(reqs) {
  const R = reqs || v101fReqs();
  const out = { recv: R.length, auto: 0, clean: 0, warn: 0, rate: null, rateAll: null, others: 0, open: 0, exp: 0, port: 0, both: 0, ports: {}, own: 1 };
  try {
    R.forEach((r) => {
      const O = v101fOwnSt(r);
      if (O.kind === "open") { out.open++; return; }
      if (O.kind === "others") { out.others++; return; }
      out.auto++;
      let e = false, p = false;
      O.own.forEach((x) => { const k = v101fOwnKinds(r, x.l, x.o); if (k.exp) e = true; if (k.port) { p = true; } });
      if (e) out.exp++;
      if (p) { out.port++; const pl = String(r.pol || "—"); out.ports[pl] = (out.ports[pl] || 0) + 1; }
      if (e && p) out.both++;
      if (e || p) out.warn++; else out.clean++;
    });
    if (out.recv) { out.rate = Math.round((out.clean / out.recv) * 100); out.rateAll = Math.round((out.auto / out.recv) * 100); }
  } catch (e) { v101fErr("autorate", e); }
  return out;
}
window.v101fAutoRate = v101fAutoRate;
if (typeof v95miscAutoRate === "function" && !window.__v101fAuto) {
  window.__v101fAuto = 1;
  const __ar101 = v95miscAutoRate;
  window.v95miscAutoRate = function () {
    try { if (v101fOn()) { v101fCnt("autoRate"); return v101fAutoRate(); } } catch (e) { v101fErr("auto95", e); }
    return __ar101.apply(this, arguments);
  };
}
if (typeof v99fAutoWhy === "function" && !window.__v101fWhy) {
  window.__v101fWhy = 1;
  const __aw101 = v99fAutoWhy;
  window.v99fAutoWhy = function () {
    const o = __aw101.apply(this, arguments);
    try {
      if (!v101fOn() || !o) return o;
      const A = v101fAutoRate();
      return Object.assign({}, o, { auto: A.auto, warn: A.warn, exp: A.exp, port: A.port, v101: 1 });
    } catch (e) { v101fErr("why99", e); return o; }
  };
}
/* 自動回答が少ない理由と、次にできること（ホームの箱・AI の文脈で同じ数） */
function v101fAutoWhy() {
  const A = v101fAutoRate();
  const out = { A, expRates: 0, validRates: 0, allRates: 0, ports: [], lanes: [], trial: null };
  try {
    const VC = typeof v90fValidCount === "function" ? v90fValidCount() : null;
    if (VC) { out.expRates = VC.exp; out.validRates = VC.valid; out.allRates = VC.all; }
    out.ports = Object.keys(A.ports).map((k) => ({ pol: k, n: A.ports[k] })).sort((a, b) => b.n - a.n);
    /* 貴社のレートが無い区間（他社だけ・どの会社も無し） */
    const seen = {};
    v101fReqs().forEach((r) => {
      const O = v101fOwnSt(r);
      if (O.kind !== "others" && O.kind !== "open") return;
      const legs = (r.legs || []).filter((l) => l && !v101fOwnOffer(l));
      legs.forEach((l) => { const k = `${r.pol || "—"} → ${l.cty || l.pod || r.cty || "—"}・${r.mode || ""}`; (seen[k] = seen[k] || { lane: k, ids: [], others: O.kind === "others" }).ids.indexOf(r.id) < 0 && seen[k].ids.push(r.id); });
    });
    out.lanes = Object.values(seen).sort((a, b) => b.ids.length - a.ids.length);
    if (typeof v100fTrialStats === "function") { const S = v100fTrialStats(); if (S && S.temp) out.trial = { base: S.base, cleanBase: S.cleanBase, rateBase: S.rateBase }; }
  } catch (e) { v101fErr("autowhy", e); }
  return out;
}
window.v101fAutoWhy = v101fAutoWhy;

/* ═══ No.626 容積の出どころ ═══════════════════════════════════════════ */
/* 容積の文字を数に（「1.11m3」→ 1.11。21.99 は数字だけを残して 1.113 と読んでいた） */
function v101fCbm(v) {
  if (v == null || v === "") return null;
  if (typeof v === "number") return isFinite(v) ? v : null;
  const s = String(v).normalize ? String(v).normalize("NFKC") : String(v);
  const m = s.replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  return m ? +m[0] : null;
}
window.v101fCbm = v101fCbm;
function v101fCbmTxt(x) { const n = +x; return isFinite(n) ? (Math.round(n * 1000) / 1000).toLocaleString("ja-JP", { maximumFractionDigits: 3 }) : "—"; }
window.v101fCbmTxt = v101fCbmTxt;
/* 依頼の容積の出どころ：shared（荷主が貨物の欄・カートン・重量を共有）／default（荷主が容積を入れていない依頼の標準 2 m³） */
function v101fVolSrc(r) {
  const o = { cbm: null, kind: "unknown", why: "" };
  try {
    if (!r) return o;
    o.cbm = +r.cbm || null;
    const cg = String(r.cargo || "").trim();
    const has = !!(cg || +r.weight > 0 || +r.cartons > 0);
    if (has) { o.kind = "shared"; o.why = cg ? cg.slice(0, 80) : ""; }
    else if (o.cbm != null && Math.abs(o.cbm - 2) < 1e-9) o.kind = "default";
    else if (o.cbm != null) o.kind = "shared";
  } catch (e) { v101fErr("volsrc", e); }
  return o;
}
window.v101fVolSrc = v101fVolSrc;
function v101fVolLabel(r) {
  const S = v101fVolSrc(r);
  if (S.kind === "default") return v101fM(`標準 ${v101fCbmTxt(S.cbm)} m³（荷主が容積を入れていない依頼の既定値）`, `standard ${v101fCbmTxt(S.cbm)} m³ (the shipper did not enter a volume)`, `标准 ${v101fCbmTxt(S.cbm)} m³（货主未填写体积的默认值）`, `estándar ${v101fCbmTxt(S.cbm)} m³ (sin volumen del cargador)`);
  if (S.kind === "shared") return v101fM(`荷主の共有 ${v101fCbmTxt(S.cbm)} m³`, `shared by the shipper ${v101fCbmTxt(S.cbm)} m³`, `货主共享 ${v101fCbmTxt(S.cbm)} m³`, `del cargador ${v101fCbmTxt(S.cbm)} m³`);
  return S.cbm != null ? `${v101fCbmTxt(S.cbm)} m³` : "—";
}
window.v101fVolLabel = v101fVolLabel;
/* 案件の容積の出どころの一覧（B/L・依頼ごと） */
function v101fCaseVol(c, cs) {
  const o = { bl: null, blRaw: "", blNo: "", reqs: [], csid: "" };
  try {
    if (!c) return o;
    o.csid = typeof v33CsId === "function" ? v33CsId(c.key) : "";
    const C = cs || (o.csid && typeof v33One === "function" ? v33One("cs", o.csid) : null) || {};
    o.blRaw = String(C.cbm == null ? "" : C.cbm); o.bl = v101fCbm(C.cbm); o.blNo = String(C.bl || "");
    (c.reqs || []).filter(Boolean).forEach((r) => {
      const S = v101fVolSrc(r);
      let trial = false; try { trial = typeof v100fIsTempId === "function" && v100fIsTempId(r.id); } catch (e) { trial = false; }
      const O = v101fOwnSt(r);
      o.reqs.push({ id: r.id, d: r.d || "", cbm: S.cbm, kind: S.kind, why: S.why, trial, same: o.bl != null && S.cbm != null && Math.abs(o.bl - S.cbm) < 0.005, own: O.kind, cos: O.cos });
    });
  } catch (e) { v101fErr("casevol", e); }
  return o;
}
window.v101fCaseVol = v101fCaseVol;
function v101fCaseOfReq(id) {
  try { const C = typeof v33Cases === "function" ? (v33Cases() || []) : []; return C.find((k) => (k.reqs || []).some((x) => x && x.id === id)) || null; } catch (e) { return null; }
}
window.v101fCaseOfReq = v101fCaseOfReq;
/* 21.99 の依頼の明細の B/L の容積：「1.11m3」を 1.113 と読んでいた → 最初の数。出どころ（B/L 番号・入力のままの文字・同じ案件のほかの依頼）を足す */
if (typeof v99fReqBl === "function" && !window.__v101fBl) {
  window.__v101fBl = 1;
  const __bl101 = v99fReqBl;
  window.v99fReqBl = function (r) {
    const B = __bl101.apply(this, arguments);
    try {
      if (!B || !r) return B;
      const c = v101fCaseOfReq(r.id);
      const V = c ? v101fCaseVol(c) : null;
      if (V) {
        if (B.bl != null && V.bl != null && Math.abs(B.bl - V.bl) > 1e-9) v101fCnt("blFix");
        B.bl = V.bl; B.blRaw = V.blRaw; B.blNo = V.blNo; B.v101 = V;
      }
    } catch (e) { v101fErr("reqbl", e); }
    return B;
  };
}
/* 21.69 の「荷主の共有」：標準 2 m³（荷主が容積を入れていない依頼）から取った容積には印（見せ方で「標準 2 m³」と書く） */
if (typeof v69fShared === "function" && !window.__v101fShared) {
  window.__v101fShared = 1;
  const __sh101 = v69fShared;
  window.v69fShared = function (reqs) {
    const o = __sh101.apply(this, arguments);
    try {
      if (o && o.cbm != null) {
        const L = (reqs || []).filter(Boolean);
        const from = L.filter((r) => +r.cbm && Math.abs(+r.cbm - o.cbm) < 1e-9);
        if (from.length && from.every((r) => v101fVolSrc(r).kind === "default")) { o.v101cbm = "default"; o.v101ids = from.map((r) => r.id); }
      }
    } catch (e) { v101fErr("shared", e); }
    return o;
  };
}
if (typeof v69fDiff === "function" && !window.__v101fDiff) {
  window.__v101fDiff = 1;
  const __df101 = v69fDiff;
  window.v69fDiff = function (cs, sh) {
    const out = __df101.apply(this, arguments);
    try {
      if (!Array.isArray(out) || !sh || sh.v101cbm !== "default" || sh.cbm == null) return out;
      const re = new RegExp(`（荷主の共有：${String(sh.cbm).replace(/\./g, "\\.")} m³）`);
      return out.map((t) => typeof t === "string" ? t.replace(re, v101fM(`（見積に使った標準 ${v101fCbmTxt(sh.cbm)} m³。荷主はこの依頼の容積を入れていません：${(sh.v101ids || []).join("・")}）`, ` (standard ${sh.cbm} m³ used for the quotes; the shipper did not enter a volume)`)) : t);
    } catch (e) { v101fErr("diff", e); return out; }
  };
}

/* ═══ No.627 相見積・AI推奨のレーンの見出し（同じ国・同じ港は1行） ═══════════════ */
var V101F_PORT = [
  ["ロサンゼルス", /^(la|l\.a\.?|los\s*angeles|ロサンゼルス|ロスアンゼルス|ロス)(港)?$/i],
  ["ロングビーチ", /^(long\s*beach|ロングビーチ)(港)?$/i],
  ["ニューヨーク", /^(new\s*york|ny|nyc|ニューヨーク)(港)?$/i],
  ["シアトル", /^(seattle|シアトル)(港)?$/i],
  ["オークランド", /^(oakland|オークランド)(港)?$/i],
  ["釜山", /^(釜山|busan|pusan|プサン)(港)?$/i],
  ["上海", /^(上海|shanghai|シャンハイ)(港)?$/i],
  ["基隆", /^(基隆|keelung|kee\s*lung|キールン)(港)?$/i],
  ["高雄", /^(高雄|kaohsiung|カオシュン)(港)?$/i],
  ["ホーチミン", /^(ホーチミン|ho\s*chi\s*minh(\s*city)?|hcmc?|サイゴン|cat\s*lai|カットライ)(港)?$/i],
  ["ハイフォン", /^(ハイフォン|haiphong|hai\s*phong)(港)?$/i],
  ["レムチャバン", /^(レムチャバン|laem\s*chabang)(港)?$/i],
  ["ジェベルアリ", /^(ジェベルアリ|jebel\s*ali)(港)?$/i],
  ["ロッテルダム", /^(ロッテルダム|rotterdam)(港)?$/i],
  ["ハンブルク", /^(ハンブルク|ハンブルグ|hamburg)(港)?$/i],
  ["ルアーブル", /^(ルアーブル|ル・アーブル|le\s*havre)(港)?$/i]
];
function v101fPort(s) {
  const x = (typeof v100fNfkc === "function" ? v100fNfkc(s) : String(s || "").trim()).replace(/\s*港$/, "");
  if (!x) return "";
  const hit = V101F_PORT.find((p) => p[1].test(x) || p[1].test(x + "港"));
  return hit ? hit[0] : x;
}
var V101F_ZONE = /西部|東部|中部|南部|北部|その他|それ以外|ゾーン|zone|地域|州|本土|離島|全土|全域/i;
/* 仕向け（pod）と形態 → 同じ国・同じ港をまとめる鍵。COURIER・AIR の国あての行は国で、LCL・FCL の港あての行は港で（国だけの行は国で） */
function v101fLaneKey(pod, mode) {
  const raw = String(pod == null ? "" : pod).trim();
  const md = String(mode || "").toUpperCase();
  const C = typeof v100fCtyOf === "function" ? v100fCtyOf(raw) : { key: raw, detail: "", norm: raw };
  const norm = C.norm || raw;
  let head = norm.replace(/[（(][^)）]*[)）]/g, "").trim();
  const sp = head.split(/[、,，\/／]/).map((x) => x.trim()).filter(Boolean); if (sp.length) head = sp[0];
  let isCty = false;
  try { isCty = (typeof V100F_SYN !== "undefined" && V100F_SYN.some((x) => x[1].test(head))) || head === C.key; } catch (e) { isCty = head === C.key; }
  const det = String(C.detail || "").trim();
  const o = { key: "", cty: C.key || head, port: "", zone: "", raw, mode: md };
  if (isCty) {
    if (det && V101F_ZONE.test(det)) o.zone = det;
    else if (det && (/港$/.test(det) || V101F_PORT.some((p) => p[1].test(det.replace(/港$/, ""))))) o.port = v101fPort(det);
    else if (det) o.zone = det;
  } else o.port = v101fPort(head);
  o.key = md + "|" + (o.port ? "p:" + o.port : "c:" + o.cty);
  return o;
}
window.v101fLaneKey = v101fLaneKey;
/* レーンの組：同じ鍵（同じ国・同じ港・同じ形態）の登録の書き方・会社・有効／期限切れ。データは変えない */
function v101fLaneGroups() {
  const G = {};
  try {
    const rates = ((typeof FWDB !== "undefined" && FWDB && FWDB.rates) || []).filter(Boolean);
    const valid = (r) => { try { return typeof fwdRateValid === "function" ? !!fwdRateValid(r) : true; } catch (e) { return true; } };
    const jpy = (r) => { try { return typeof fwdRateJpy === "function" ? fwdRateJpy(r) : (+r.price || 0); } catch (e) { return +r.price || 0; } };
    rates.forEach((r, i) => {
      const K = v101fLaneKey(r.pod, r.mode);
      const g = G[K.key] = G[K.key] || { key: K.key, cty: K.cty, port: K.port, mode: K.mode, pods: {}, rates: [] };
      const p = g.pods[r.pod] = g.pods[r.pod] || { pod: r.pod, zone: K.zone, n: 0, valid: 0, exp: 0, pols: {}, rows: [] };
      p.n++; if (valid(r)) p.valid++; else p.exp++;
      p.pols[r.pol || "—"] = (p.pols[r.pol || "—"] || 0) + 1;
      p.rows.push({ i, co: r.co || ((FWDB.profile && FWDB.profile.co) || ""), price: r.price, cur: r.cur || "¥", unit: r.unit || "", tt: r.tt, valid: r.valid || "", ok: valid(r), jpy: jpy(r), pol: r.pol || "" });
      g.rates.push(r);
    });
    Object.values(G).forEach((g) => {
      g.list = Object.values(g.pods);
      g.multi = g.list.length > 1;
      /* 同じ国・港として集計：区分の無い書き方の有効なレートを、会社ごとに安い方1本で */
      const nz = g.list.filter((p) => !p.zone);
      const pool = (nz.some((p) => p.valid) ? nz : g.list).flatMap((p) => p.rows.filter((x) => x.ok));
      const best = {}; pool.forEach((x) => { if (!best[x.co] || x.jpy < best[x.co].jpy) best[x.co] = x; });
      const B = Object.values(best);
      g.nValid = B.length; g.min = B.length ? Math.min(...B.map((x) => x.jpy)) : null; g.max = B.length ? Math.max(...B.map((x) => x.jpy)) : null;
      g.pols = [...new Set(g.rates.map((r) => r.pol || "—"))];
    });
  } catch (e) { v101fErr("lanegroups", e); }
  return G;
}
window.v101fLaneGroups = v101fLaneGroups;
/* その国・港あての、受信箱の依頼（仕出港・容積）：相見積の目安（標準 2m³）と依頼ごとの計算の前提が違うことを書くため */
function v101fReqsFor(cty, port, mode) {
  const out = [];
  try {
    const md = String(mode || "").toUpperCase();
    v101fReqs().forEach((r) => {
      if (String(r.mode || "LCL").toUpperCase() !== md) return;
      (r.legs || []).forEach((l) => {
        if (!l) return;
        const K = v101fLaneKey(l.pod || l.cty, md);
        const hit = port ? K.port === port : (K.cty === cty || (typeof v100fCtyOf === "function" && v100fCtyOf(l.cty).key === cty));
        if (hit && !out.some((x) => x.id === r.id)) out.push({ id: r.id, pol: r.pol || "", cbm: +r.cbm || null, kind: v101fVolSrc(r).kind, own: !!v101fOwnOffer(l) });
      });
    });
  } catch (e) { v101fErr("reqsfor", e); }
  return out;
}
window.v101fReqsFor = v101fReqsFor;

/* 依頼の明細（21.99 v99fReqDetail）の「状況」を貴社の回答状況の言葉に */
if (typeof v99fReqDetail === "function" && !window.__v101fDet) {
  window.__v101fDet = 1;
  const __dt101 = v99fReqDetail;
  window.v99fReqDetail = function (id) {
    const D = __dt101.apply(this, arguments);
    try {
      if (!D || !v101fOn()) return D;
      const r = v101fReqs().find((x) => x.id === D.id);
      if (!r) return D;
      const L = v101fStLabel(r);
      if (L.txt !== L.base) { D.status = L.txt + (L.sub ? v101fM(`（${L.sub}）`, ` (${L.sub})`) : ""); D.v101st = L.kind; }
    } catch (e) { v101fErr("detail", e); }
    return D;
  };
}
/* No.628：「レートを登録して回答」「この区間の金額を直す」から手入力の欄に入れた依頼を覚える（レート管理で「どの依頼の区間か・ほかに何件に使われるか」を書くため） */
if (typeof v90fAnsLeg === "function" && !window.__v101fAnsLeg) {
  window.__v101fAnsLeg = 1;
  const __al101 = v90fAnsLeg;
  window.v90fAnsLeg = function (id, i) {
    try { V101FWD.prefill = { id: String(id || ""), i: +i || 0, at: Date.now() }; } catch (e) { v101fErr("ansleg", e); }
    return __al101.apply(this, arguments);
  };
}
/* 同じ区間（仕出港・仕向け〔同じ国・港〕・形態）の依頼：区間のレートを登録・直すと、どの依頼の見積に使われるか */
function v101fLaneReqs(pol, pod, mode) {
  const out = [];
  try {
    const pk = typeof v82fPolKey === "function" ? v82fPolKey : ((s) => String(s || "").replace(/\s+/g, "").replace(/(?:国際)?(?:空港|港)$/, "").toLowerCase());
    const K = v101fLaneKey(pod, mode);
    v101fReqs().forEach((r) => {
      if (pk(r.pol) !== pk(pol) || String(r.mode || "LCL").toUpperCase() !== K.mode) return;
      if ((r.legs || []).some((l) => l && v101fLaneKey(l.pod || l.cty, K.mode).key === K.key)) out.push(r.id);
    });
  } catch (e) { v101fErr("lanereqs", e); }
  return out;
}
window.v101fLaneReqs = v101fLaneReqs;

/* ═══ AI物流マンに渡す文脈：貴社の回答状況・容積の出どころ・同じ国のレーン ═══════════════ */
function v101fCtxAdd(s) {
  if (typeof s !== "string" || /## 貴社の回答状況（v22\.01）/.test(s)) return s;
  try {
    const C = v101fCounts(), A = v101fAutoRate();
    const others = v101fReqs().filter((r) => v101fOwnSt(r).kind === "others").map((r) => { const O = v101fOwnSt(r); return `・${r.id}（${r.pol || ""}→${r.cty || ""}・${r.mode || ""}）：貴社は未回答（貴社のレートなし）。届いている見積は他社だけ（${O.cos.join("・")}${O.othersMin != null ? "・他社の最安 " + v101fY(O.othersMin) : ""}）。状況の「回答済み（荷主が検討中）」は他社の見積のこと`; });
    s += `\n## 貴社の回答状況（v22.01）\n受信 ${C.all}件のうち、貴社のレートで AI が見積を出した依頼 ${C.own}件・他社だけが見積を出した依頼（貴社は未回答）${C.others}件・どの会社も見積を出せなかった依頼 ${C.open}件。AI自動回答率は貴社の見積で数える：そのまま出せる ${A.clean} / ${A.recv}件＝${A.rate}%（期限切れの貴社のレートで組んだ見積 ${A.exp}件・依頼と違う仕出港のレートで組んだ見積 ${A.port}件）。「回答済み」と聞かれたら、貴社が回答したかどうかを分けて答える。他社の金額を貴社の見積として答えない。見積は区間のレート（仕出港→仕向け・形態）で答えるしくみで、この依頼だけの金額（スポット見積）を出す機能はいまの版にない（できると答えない。区間のレートを登録・直すと、同じ区間のほかの依頼にも使われる）。\n${others.join("\n")}`;
    /* 容積の出どころ（B/L のある案件） */
    const C2 = typeof v33Cases === "function" ? (v33Cases() || []) : [];
    const lines = [];
    C2.forEach((c) => { const V = v101fCaseVol(c); if (V.bl == null) return; lines.push(`・案件（B/L ${V.blNo || "—"}）：B/L の容積 ${v101fCbmTxt(V.bl)} m³（入力のまま「${V.blRaw}」）／${V.reqs.map((x) => `${x.id} ${x.cbm != null ? v101fCbmTxt(x.cbm) + " m³" : "—"}（${x.kind === "default" ? "標準値・荷主は容積を入れていない" : x.kind === "shared" ? "荷主の共有" : "出どころ不明"}${x.trial ? "・体験用の依頼" : ""}・B/L と${x.same ? "同じ" : "違う"}）`).join("／")}`); });
    if (lines.length) s += `\n## 容積の出どころ（案件ごと・v22.01）\n${lines.join("\n")}\n標準 2 m³ は荷主が容積を入れていない依頼の既定値で、荷主が共有した値ではない。相見積・AI推奨の「レーン別の集計」も標準 2m³ の目安（依頼ごとの見積は依頼の容積で計算）。`;
    /* 同じ国・同じ港のレーン（書き方の違い） */
    const G = Object.values(v101fLaneGroups()).filter((g) => g.multi);
    if (G.length) s += `\n## 同じ国・同じ港のレーン（書き方の違いは同じレーンとして読む・v22.01）\n${G.map((g) => `・${g.port ? g.port + "（" + g.cty + "）" : g.cty} ${g.mode}：${g.list.map((p) => `${p.pod}${p.zone ? "（区分）" : ""} 有効 ${p.valid}本・期限切れ ${p.exp}本`).join("／")}`).join("\n")}\n地域の区分（西部・その他など）は運送会社の料金の区分として同じ国の中で分けて扱う。期限切れの書き方の行は見積に使われない。`;
  } catch (e) { v101fErr("ctx", e); }
  return s;
}
window.v101fCtxAdd = v101fCtxAdd;
if (typeof fwdContext === "function" && !window.__v101fCtx) {
  window.__v101fCtx = 1;
  const __cx101 = fwdContext;
  fwdContext = function () { // eslint-disable-line no-global-assign
    const s = __cx101.apply(this, arguments);
    try { if (v101fOn()) return v101fCtxAdd(s); } catch (e) { v101fErr("ctxw", e); }
    return s;
  };
}
/* 内蔵の答え（AI を使わない答え）：依頼の行の「回答済み（荷主が検討中）」を、貴社が未回答の依頼では言い直す */
function v101fBrainFix(o) {
  try {
    if (!o || typeof o.a !== "string" || /v101fb1/.test(o.a) || !v101fOn()) return o;
    let a = o.a, n = 0;
    v101fReqs().forEach((r) => {
      const L = v101fStLabel(r);
      if (L.kind !== "others" && L.kind !== "part") return;
      if (L.txt === L.base) return;
      const re = new RegExp("(" + r.id + "(?:(?!RQ-[A-Za-z0-9]{5,8})[\\s\\S]){0,260}?)" + L.base.replace(/[()（）]/g, (c) => "\\" + c));
      if (re.test(a)) { a = a.replace(re, (m, pre) => pre + L.txt + (L.sub ? `（${L.sub}）` : "")); n++; }
    });
    if (!n) return o;
    v101fCnt("brain");
    return Object.assign({}, o, { a: a + `<p class="v101fb1">${v101fM("（「未回答（貴社のレートなし）」の依頼は、他社だけが見積を出した依頼です。貴社の見積はまだありません）", "(“Not answered” = only other forwarders quoted; you have no quote yet)")}</p>` });
  } catch (e) { v101fErr("brain", e); return o; }
}
if (typeof fwdBrain === "function" && !window.__v101fBrain) {
  window.__v101fBrain = 1;
  const __fb101 = fwdBrain;
  fwdBrain = function () { // eslint-disable-line no-global-assign
    const o = __fb101.apply(this, arguments);
    try { if (o && typeof o.then === "function") return o.then(v101fBrainFix); } catch (e) { v101fErr("brainp", e); }
    return v101fBrainFix(o);
  };
}
