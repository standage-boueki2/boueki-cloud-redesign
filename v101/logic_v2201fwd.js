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
/* 22.01.1（v3 N2）：他社の見積が「荷主の画面で取り下げになる見積」か。荷主の画面は 21.82 の v82fBad／v82fFixLegs と同じ決まりで、
   有効期限の切れたレートしか無い見積・依頼と違う仕出港のレートで組んだ見積を取り下げ、「レーン未登録」と出す（仮押さえ中は取り下げない）。
   物流会社の画面で「荷主が検討中」と書かないために、同じ決まりで見分ける（データは変えない） */
function v101fExpD(v) {
  try { if (typeof v82fExp === "function") return !!v82fExp(v); } catch (e) { /* 下で */ }
  const s = String(v || "").replace(/\//g, "-");
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && s < (typeof TODAYS !== "undefined" ? TODAYS : new Date().toISOString().slice(0, 10));
}
function v101fLegStale(r, l) {
  const o = { stale: false, exp: false, pol: false, valid: "", lanePol: "" };
  try {
    if (!l || !l.ok || l.hold) return o;
    const q = l.quote || {};
    const lp = typeof v82fLanePol === "function" ? v82fLanePol(q) : ((/^(.*?)\s*→/.exec(String(q.lane || "")) || [])[1] || "").trim();
    const pk = typeof v82fPolKey === "function" ? v82fPolKey : ((s) => String(s || "").replace(/\s+/g, "").replace(/(?:国際)?(?:空港|港)$/, "").toLowerCase());
    o.lanePol = lp;
    o.pol = !!(r && r.pol && lp && !q.v56shipFob && pk(lp) !== pk(r.pol));
    const O = (l.offers || []).filter((x) => x && x.rate);
    o.exp = O.length ? O.every((x) => v101fExpD(x.rate.valid)) : v101fExpD(q.valid);
    const vs = (O.length ? O.map((x) => x.rate.valid) : [q.valid]).filter(Boolean).sort();
    o.valid = vs.length ? vs[vs.length - 1] : "";
    let bad = "";
    try { bad = typeof v82fBad === "function" ? String(v82fBad(r, l) || "") : ""; } catch (e) { bad = ""; }
    o.stale = !!bad || o.exp || o.pol;
  } catch (e) { v101fErr("legstale", e); }
  return o;
}
window.v101fLegStale = v101fLegStale;
/* 22.01.3（x3 X1・X2）：貴社の見積（その国の貴社の見積の写し）について
   valid＝貴社の見積に入っているレートの写しの期限（他社の期限と混ぜない）・exp＝それが切れている・pol＝依頼と違う仕出港のレートで組んだ。
   now＝貴社のレート表の、いまの有効なレート（依頼の仕出港発・同じ仕向け〔同じ国・港〕・同じ形態＝同じ区間が更新済み）。
   ※FOB の依頼は本船渡しまでの費用なので、アプリは仕向け先の違う同じ港発のレートでも組めるが、ここでは同じ区間のレートがあるときだけ「組み直し待ち」と数える
     （荷主の画面に届いているレートは物流会社の画面から確かめられないため、言い切れる場合だけにする）
   cat：now がある＝"wait"（荷主が画面を開くと、いまのレートで組み直される）／無くて仕出港違い＝"pol"（依頼の仕出港発のレートを登録）／無くて期限切れ＝"renew"（この区間を入れ直す） */
function v101fPolKey(s) { try { if (typeof v82fPolKey === "function") return v82fPolKey(s); } catch (e) { /* 下で */ } return String(s || "").replace(/\s+/g, "").replace(/(?:国際)?(?:空港|港)$/, "").toLowerCase(); }
function v101fRateOk(x) { try { if (typeof fwdRateValid === "function") return !!fwdRateValid(x); } catch (e) { /* 下で */ } return !v101fExpD(x && x.valid); }
function v101fIsFob(r) { try { if (typeof v56shipTermCode === "function") return v56shipTermCode(String((r && r.term) || "")) === "FOB"; } catch (e) { /* 下で */ } return /^FOB/i.test(String((r && r.term) || "")); }
function v101fOwnLegInfo(r, l, ow) {
  const o = { exp: false, pol: false, valid: "", lanePol: "", cat: "", now: null, fob: false };
  try {
    const q = (ow && ow.quote) || {}, rt = (ow && ow.rate) || {};
    o.valid = String(rt.valid || q.valid || "");
    o.exp = v101fExpD(o.valid);
    o.lanePol = typeof v82fLanePol === "function" ? v82fLanePol(q) : ((/^(.*?)\s*→/.exec(String(q.lane || "")) || [])[1] || "").trim();
    o.pol = !!(r && r.pol && o.lanePol && !q.v56shipFob && v101fPolKey(o.lanePol) !== v101fPolKey(r.pol));
    o.fob = v101fIsFob(r);
    const me = v101fMe(), md = String((r && r.mode) || q.mode || "LCL").toUpperCase();
    const K = typeof v101fLaneKey === "function" ? v101fLaneKey(l.pod || l.cty, md).key : "";
    const cand = ((typeof FWDB !== "undefined" && FWDB && FWDB.rates) || []).filter((x) => x && (x.co || me) === me && String(x.mode || "").toUpperCase() === md && v101fPolKey(x.pol) === v101fPolKey(r && r.pol) && v101fRateOk(x)
      && ([l.pod, l.cty].indexOf(x.pod) >= 0 || (K && typeof v101fLaneKey === "function" && v101fLaneKey(x.pod, md).key === K)));
    if (cand.length) { const x = cand.slice().sort((a, b) => String(b.valid || "").localeCompare(String(a.valid || "")))[0]; o.now = { pol: x.pol, pod: x.pod, mode: md, valid: x.valid || "", price: x.price, cur: x.cur || "¥", unit: x.unit || "", fob: o.fob }; }
    o.cat = o.now ? "wait" : o.pol ? "pol" : "renew";
  } catch (e) { v101fErr("ownleginfo", e); }
  return o;
}
window.v101fOwnLegInfo = v101fOwnLegInfo;
/* 期限切れのレートが、いまの見積（どの会社の見積の写しでも）に使われているか（x3 X1：16本は COURIER で、LCL の見積には使われていない） */
function v101fExpRatesUse() {
  const o = { exp: [], used: 0, modes: {} };
  try {
    const R = ((typeof FWDB !== "undefined" && FWDB && FWDB.rates) || []).filter((x) => x && !v101fRateOk(x));
    o.exp = R; R.forEach((x) => { const m = String(x.mode || "").toUpperCase(); o.modes[m] = (o.modes[m] || 0) + 1; });
    const me = v101fMe();
    v101fReqs().forEach((r) => (r.legs || []).forEach((l) => {
      if (!l || !l.ok) return;
      const ow = (l.offers || []).find((x) => x && x.co === me); if (!ow || !ow.rate) return;
      if (R.some((x) => String(x.mode || "").toUpperCase() === String(ow.rate.mode || r.mode || "").toUpperCase() && v101fPolKey(x.pol) === v101fPolKey(ow.rate.pol) && String(x.pod) === String(ow.rate.pod) && String(x.valid || "") === String(ow.rate.valid || ""))) o.used++;
    }));
  } catch (e) { v101fErr("expuse", e); }
  return o;
}
window.v101fExpRatesUse = v101fExpRatesUse;
/* 1件の依頼の貴社の回答状況
   kind: "open"（どの会社も見積を出せなかった）／"own"（貴社が全部の国に回答）／"part"（一部の国だけ）／"others"（他社だけが回答・貴社は未回答）
   22.01.1：othersSel の各国に stale（荷主の画面で取り下げになる他社の見積）を足す。stale＝他社の見積が全部そう（kind は変えない＝貴社は未回答のまま） */
function v101fOwnSt(r) {
  const o = { kind: "open", okN: 0, ownN: 0, own: [], cos: [], othersMin: null, othersSel: [], staleN: 0, stale: false, staleValid: "", stalePol: false, staleExp: false, lanePols: [], ownStaleN: 0, ownStale: false, ownSt: { exp: false, pol: false, valid: "", lanePols: [] } };
  try {
    if (!r) return o;
    if (r.quote) { o.kind = "own"; o.okN = o.ownN = 1; o.own.push({ l: null, o: { quote: r.quote, co: v101fMe() } }); return o; }
    const ok = (Array.isArray(r.legs) ? r.legs : []).filter((l) => l && l.ok);
    o.okN = ok.length;
    if (r.open || !ok.length) return o;
    const me = v101fMe(), cos = new Set();
    ok.forEach((l) => {
      const ow = v101fOwnOffer(l);
      if (ow) {
        /* 22.01.2（w3 W2）：貴社の見積の国にも同じ決まり（荷主の画面で取り下げになるか）。仮押さえ中の国は取り下げにならない */
        const ST = v101fLegStale(r, l);
        /* 22.01.3（x3 X1・X2）：貴社の見積そのものの期限（他社の期限と混ぜない）と、荷主が画面を開いたときに貴社のいまのレートで組み直せるか（cat） */
        const OI = ST.stale ? v101fOwnLegInfo(r, l, ow) : null;
        o.own.push({ l, o: ow, stale: ST.stale, ST, OI });
        if (ST.stale) {
          o.ownStaleN++; const X = o.ownSt;
          if (OI.exp) X.exp = true; if (OI.pol) X.pol = true;
          if (OI.valid && (!X.valid || OI.valid > X.valid)) X.valid = OI.valid;
          if (OI.lanePol && X.lanePols.indexOf(OI.lanePol) < 0) X.lanePols.push(OI.lanePol);
          X.cats = X.cats || {}; X.cats[OI.cat] = (X.cats[OI.cat] || 0) + 1;
          if (OI.now && !X.now) X.now = OI.now;
        }
      }
      (Array.isArray(l.offers) ? l.offers : []).forEach((x) => { if (x && x.co && x.co !== me) cos.add(x.co); });
      if (!ow) {
        const sel = (l.offers || []).find((x) => x && x.co === (l.sel || l.co)) || null;
        const tot = sel && sel.quote ? +sel.quote.total : (l.quote ? +l.quote.total : null);
        const ST = v101fLegStale(r, l);
        o.othersSel.push({ cty: l.cty || l.pod || "", co: (sel && sel.co) || l.sel || l.co || "", total: tot, stale: ST.stale, exp: ST.exp, pol: ST.pol, valid: ST.valid, lanePol: ST.lanePol });
        if (tot != null && (o.othersMin == null || tot < o.othersMin)) o.othersMin = tot;
        if (ST.stale) { o.staleN++; if (ST.exp) o.staleExp = true; if (ST.pol) o.stalePol = true; if (ST.valid && (!o.staleValid || ST.valid > o.staleValid)) o.staleValid = ST.valid; if (ST.lanePol && o.lanePols.indexOf(ST.lanePol) < 0) o.lanePols.push(ST.lanePol); }
      }
    });
    o.ownN = o.own.length;
    o.cos = [...cos];
    o.kind = !o.ownN ? "others" : o.ownN < o.okN ? "part" : "own";
    o.stale = o.kind === "others" && o.othersSel.length > 0 && o.staleN === o.othersSel.length;
    o.ownStale = o.ownN > 0 && o.ownStaleN === o.ownN;
    /* 依頼ごとの次の一手：pol＝依頼の仕出港発の貴社のレートが無い（登録する）／renew＝この区間の有効なレートが無い（入れ直す）／wait＝貴社のレート表にいまの有効なレートがあり、荷主が画面を開くと組み直される */
    if (o.ownStale) { const c = o.ownSt.cats || {}; o.ownSt.cat = c.pol ? "pol" : c.renew ? "renew" : "wait"; }
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
      if (O.stale) {
        /* 22.01.1（v3 N2）：他社の見積は期限切れ（または依頼と違う仕出港）で、荷主の画面では取り下げ＝「レーン未登録」。「荷主が検討中」と書かない */
        const why = v101fStaleWhy(O, r);
        out.sub = v101fM(`他社 ${O.cos.length}社の見積は${why}・荷主の画面では取り下げ（レーン未登録）`, `${O.cos.length} other forwarder quote(s) ${O.staleExp ? "expired" : "from another port"}; withdrawn on the shipper's screen (no lane)`, `其他 ${O.cos.length} 家的报价${O.staleExp ? "已过期" : "起运港不同"}・货主画面已撤回（未登记线路）`, `Cotización de otra(s) ${O.staleExp ? "vencida" : "de otro puerto"}; retirada para el cargador`);
        out.stale = 1;
      } else if (O.staleN) {
        out.sub = v101fM(`他社 ${O.cos.length}社が回答済み・荷主が検討中（うち ${O.staleN}か国は期限切れなどで荷主の画面では取り下げ）`, `${O.cos.length} other forwarder(s) answered (${O.staleN} withdrawn as expired)`);
      } else {
        out.sub = v101fM(`他社 ${O.cos.length}社が回答済み・荷主が検討中`, `${O.cos.length} other forwarder(s) answered; shipper is reviewing`, `其他 ${O.cos.length} 家已回复・货主研究中`, `${O.cos.length} otra(s) respondieron`);
      }
    } else if ((O.kind === "own" || O.kind === "part") && O.ownStale && /回答済み|AI回答/.test(st)) {
      /* 22.01.2（w3 W2）：貴社の見積が全部、荷主の画面の決まり（21.82 v82fBad）で取り下げになる＝期限切れ・依頼と違う仕出港のレートで組んだ見積。
         「回答済み（荷主が検討中）」と書かない（他社の見積の N2 と同じ決まり）。荷主の画面では、依頼の仕出港発の有効なレートで組み直す（無ければレーン未登録） */
      /* 22.01.3（x3 X1・X2）：日付は貴社の見積のレートの写しの期限（他社の期限ではない）。次の一手で言い分ける */
      const X = O.ownSt, pol = (r && r.pol) || v101fM("依頼の仕出港", "the request's port");
      const copy = v101fM(`${X.lanePols.length ? X.lanePols.join("・") + "発の" : ""}レートの写し（期限 ${X.valid || "—"}${X.exp ? "・期限切れ" : ""}）で組まれたまま${X.pol ? `（依頼は${pol}発）` : ""}`, `built from a copy of ${X.lanePols.join(", ") || "a"} rate (valid ${X.valid || "—"})`);
      if (X.cat === "wait") {
        const N = X.now || {};
        out.txt = v101fM("組み直し待ち（貴社の見積は古いレートの写し）", "Waiting to be rebuilt (old rate copy)", "等待重新报价（旧费率副本）", "Pendiente de recalcular (copia de tarifa antigua)");
        out.sub = v101fM(`貴社の見積は${copy}。貴社のレート表の同じ区間（${N.pol} → ${N.pod}）は ${N.valid} まで有効に更新済みで、荷主が画面を開くと、いまのレートで組み直されます`, `Your quote is ${copy}; the shipper's screen rebuilds it with your current rate (valid until ${N.valid}).`);
      } else if (X.cat === "pol") {
        out.txt = v101fM("取り下げ（貴社の見積は仕出港違い）", "Withdrawn (your quote is from another port)", "已撤回（贵司报价起运港不同）", "Retirada (cotización de otro puerto)");
        out.sub = v101fM(`貴社の見積は${copy}。${pol}発の貴社のレートが無いため、荷主の画面では取り下げ → ${pol}発のレートを登録`, `Your quote is ${copy}; you have no rate from ${pol}, so it is withdrawn. Register a rate from ${pol}.`);
      } else {
        out.txt = v101fM("取り下げ（貴社の見積は期限切れ）", "Withdrawn (your quote expired)", "已撤回（贵司报价已过期）", "Retirada (su cotización venció)");
        out.sub = v101fM(`貴社の見積は${copy}。この区間の貴社の有効なレートが無いため、荷主の画面では取り下げ → この区間のレートを入れ直す`, `Your quote is ${copy}; no valid rate of yours for this lane. Renew it.`);
      }
      out.ownStale = 1; out.ownCat = X.cat;
    } else if (O.kind === "part" && /回答済み/.test(st)) {
      out.txt = v101fM(`回答済み（貴社 ${O.ownN}/${O.okN}か国）・荷主が検討中`, `Answered (${O.ownN}/${O.okN} countries by you); shipper reviewing`, `已回复（贵司 ${O.ownN}/${O.okN} 国）`, `Respondida (${O.ownN}/${O.okN} países)`);
      out.sub = v101fM(`ほかの ${O.okN - O.ownN}か国は他社だけが回答（貴社のレートなし）`, `The other ${O.okN - O.ownN} only by other forwarders`, `其余 ${O.okN - O.ownN} 国仅其他公司回复`, `Las otras ${O.okN - O.ownN} solo por otras`);
    }
  } catch (e) { v101fErr("stlabel", e); }
  return out;
}
window.v101fStLabel = v101fStLabel;
/* 取り下げの理由の言葉（期限切れ〔日付〕・横浜港発〔依頼は神戸港発〕） */
function v101fStaleWhy(O, r) {
  try {
    const a = [];
    if (O.staleExp) a.push(v101fM(`期限切れ（${O.staleValid || "—"}）`, `expired (${O.staleValid || "—"})`));
    if (O.stalePol && O.lanePols.length) a.push(v101fM(`${O.lanePols.join("・")}発（依頼は${(r && r.pol) || "—"}発）`, `from ${O.lanePols.join(", ")} (request: ${(r && r.pol) || "—"})`));
    return a.join(v101fM("・", ", ")) || v101fM("期限切れ", "expired");
  } catch (e) { return v101fM("期限切れ", "expired"); }
}
window.v101fStaleWhy = v101fStaleWhy;
/* 22.01.2：貴社の見積の取り下げの理由（期限切れ〔日付〕・横浜港発〔依頼は神戸港発〕） */
function v101fOwnStaleWhy(O, r) {
  try { const X = O.ownSt || {}; return v101fStaleWhy({ staleExp: X.exp, stalePol: X.pol, staleValid: X.valid, lanePols: X.lanePols || [] }, r); } catch (e) { return v101fM("期限切れ", "expired"); }
}
window.v101fOwnStaleWhy = v101fOwnStaleWhy;
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
      /* 22.01.2（w3 W2）：貴社の見積が荷主の画面で取り下げになる（期限切れ・仕出港違い）ときは、金額のそばにもそう書く */
      if (O.ownStale) { P.own += O.ownSt.cat === "wait" ? v101fM("（組み直し待ち）", " (to be rebuilt)", "（等待重新报价）", " (pendiente)") : v101fM("（取り下げ）", " (withdrawn)", "（已撤回）", " (retirada)"); P.ownStale = 1; }
      /* 選択中が他社の国 */
      const oth = O.own.filter((x) => x.l && (x.l.sel || x.l.co) && (x.l.sel || x.l.co) !== v101fMe()).map((x) => { const s = (x.l.offers || []).find((y) => y && y.co === (x.l.sel || x.l.co)); return s && s.quote ? { co: s.co, total: +s.quote.total } : null; }).filter(Boolean);
      if (oth.length) { P.other = v101fM(`選択中は他社 ${oth.length > 1 ? v101fY(Math.min(...oth.map((x) => x.total))) + "〜" : v101fY(oth[0].total)}`, `Selected: another forwarder ${v101fY(oth[0].total)}`); P.otherShort = P.other; }
    } else {
      P.own = v101fM("貴社の見積なし", "No quote of yours", "贵司无报价", "Sin cotización suya");
      if (O.othersMin != null) {
        const amt = O.othersSel.length > 1 ? v101fY(O.othersMin) + "〜" : v101fY(O.othersMin);
        if (O.stale) { P.stale = 1; P.other = v101fM(`他社の見積 ${amt}（${v101fStaleWhy(O, r)}・荷主の画面では取り下げ。貴社の見積ではありません）`, `Other forwarders: ${amt} (expired; withdrawn on the shipper's screen; not yours)`); P.otherShort = v101fM(`他社の見積 ${amt}（期限切れ）`, `other forwarders ${amt} (expired)`); }
        else { P.other = v101fM(`他社の見積 ${amt}（貴社の見積ではありません）`, `Other forwarders: ${amt} (not yours)`); P.otherShort = v101fM(`他社の見積 ${amt}`, `other forwarders ${amt}`); }
      }
    }
  } catch (e) { v101fErr("cell", e); }
  return P;
}
window.v101fCellParts = v101fCellParts;

/* 数え方を1つに（ホーム・受信箱のチップ・内訳）：AI回答＝貴社のレートで AI が見積を出した依頼／他社だけ＝貴社は未回答／レーン未登録＝どの会社も見積を出せなかった */
function v101fCounts() {
  const R = v101fReqs();
  const out = { all: R.length, own: 0, part: 0, others: 0, open: 0, othersStale: 0, ownStale: 0, ids: { own: [], others: [], open: [], othersStale: [], ownStale: [] } };
  R.forEach((r) => {
    const O = v101fOwnSt(r);
    if (O.kind === "own" || O.kind === "part") { out.own++; out.ids.own.push(r.id); if (O.kind === "part") out.part++; if (O.ownStale) { out.ownStale++; out.ids.ownStale.push(r.id); } }
    else if (O.kind === "others") { out.others++; out.ids.others.push(r.id); if (O.stale) { out.othersStale++; out.ids.othersStale.push(r.id); } }
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
  const out = { recv: R.length, auto: 0, clean: 0, warn: 0, rate: null, rateAll: null, others: 0, othersStale: 0, open: 0, exp: 0, port: 0, both: 0, ports: {}, own: 1, ownStale: 0 };
  try {
    R.forEach((r) => {
      const O = v101fOwnSt(r);
      if (O.kind === "open") { out.open++; return; }
      if (O.kind === "others") { out.others++; if (O.stale) out.othersStale++; return; }
      out.auto++;
      if (O.ownStale) out.ownStale++;
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
/* 22.01.3（x3 X5・X1）：貴社の見積の「取り下げ／組み直し待ち」の数を1か所で数える（ホーム・受信箱の見方・行で同じ数） */
function v101fOwnSummary() {
  const o = { total: 0, wait: 0, pol: 0, renew: 0, other: 0, ports: {}, polIds: [], waitIds: [], valids: {}, now: null, decided: 0, held: 0 };
  try {
    const A = v101fAutoRate();
    o.total = A.warn;
    v101fReqs().forEach((r) => {
      const O = v101fOwnSt(r);
      if (O.kind !== "own" && O.kind !== "part") return;
      const L = v101fStLabel(r);
      O.own.forEach((x) => {
        if (!x.OI) return;
        if (x.OI.valid) o.valids[x.OI.valid] = (o.valids[x.OI.valid] || 0) + 1;
        if (x.OI.lanePol) (o.lanePolSet = o.lanePolSet || {})[x.OI.lanePol] = 1;
        /* レート表の同じ区間（写しと同じ仕出港・仕向け・形態）の、いまの有効期限 */
        try { const N = v101fLaneNow(r, { ok: 1, quote: x.o.quote, pod: x.l && x.l.pod, cty: x.l && x.l.cty }); if (N && N.valid && (!o.tableValid || N.valid > o.tableValid)) o.tableValid = N.valid; } catch (e) { /* 無視 */ }
      });
      if (L.ownStale) {
        o[L.ownCat] = (o[L.ownCat] || 0) + 1;
        if (L.ownCat === "pol") { const p = String(r.pol || "—"); o.ports[p] = (o.ports[p] || 0) + 1; o.polIds.push(r.id); }
        if (L.ownCat === "wait") { o.waitIds.push(r.id); if (!o.now && O.ownSt.now) o.now = O.ownSt.now; }
      } else if (O.ownStaleN) { if (/他社に決定/.test(L.base)) o.decided++; else if (/仮押さえ/.test(L.base)) o.held++; }
    });
    o.other = Math.max(0, o.total - o.wait - o.pol - o.renew);
    o.portList = Object.keys(o.ports).map((k) => ({ pol: k, n: o.ports[k] })).sort((a, b) => b.n - a.n);
    o.validList = Object.keys(o.valids).sort();
    o.lanePolList = Object.keys(o.lanePolSet || {});
  } catch (e) { v101fErr("ownsum", e); }
  return o;
}
window.v101fOwnSummary = v101fOwnSummary;
/* 22.01.3（x3 X1）：明細の注意「有効なレートがありません（…2026-09-30など）…新しい期限のレートを登録してください」が、レート表（同じ区間は 2026-12-31 まで有効）と食い違っていた
   → 見積に入っているレートの写しの期限の話だと書き、レート表の同じ区間にいまの有効なレートがあれば、そう書く（21.82 の v82fLegNotes を包む） */
function v101fLaneNow(r, l) {
  try {
    const q = (l && l.quote) || {};
    const lp = typeof v82fLanePol === "function" ? v82fLanePol(q) : ((/^(.*?)\s*→/.exec(String(q.lane || "")) || [])[1] || "").trim();
    const pod = ((/→\s*(.+)$/.exec(String(q.lane || "")) || [])[1] || l.pod || l.cty || "").trim();
    const md = String(q.mode || (r && r.mode) || "LCL").toUpperCase();
    const R = ((typeof FWDB !== "undefined" && FWDB && FWDB.rates) || []).filter((x) => x && String(x.mode || "").toUpperCase() === md && v101fPolKey(x.pol) === v101fPolKey(lp) && String(x.pod || "") === pod && v101fRateOk(x));
    if (!R.length) return null;
    const best = R.slice().sort((a, b) => String(b.valid || "").localeCompare(String(a.valid || "")))[0];
    return { pol: lp, pod, valid: best.valid || "", n: R.length };
  } catch (e) { return null; }
}
window.v101fLaneNow = v101fLaneNow;
if (typeof v82fLegNotes === "function" && !window.__v101fLegNotes) {
  window.__v101fLegNotes = 1;
  const __ln101 = v82fLegNotes;
  window.v82fLegNotes = function (r, l) {
    const out = __ln101.apply(this, arguments);
    try {
      if (!Array.isArray(out) || !l || !l.ok || !v101fOn()) return out;
      const N = v101fLaneNow(r, l);
      if (!N) return out;
      const polMis = !!(r && r.pol && N.pol && v101fPolKey(N.pol) !== v101fPolKey(r.pol) && !((l.quote || {}).v56shipFob));
      return out.map((x) => {
        if (!Array.isArray(x) || typeof x[1] !== "string" || !/有効なレートがありません（/.test(x[1])) return x;
        const t = x[1].replace(/有効なレートがありません（(\d+)社とも有効期限切れ・([^）]*)）。推奨・仮押さえの対象外です。「物流レート管理」で新しい期限のレートを登録してください。/,
          (m, n, d) => v101fM(`この見積に入っているレートの写しは期限切れです（${n}社とも・${d}）。推奨・仮押さえの対象外です。レート表の同じ区間（${N.pol} → ${N.pod}）は、いまは ${N.valid} まで有効です${polMis ? `。ただし依頼は${r.pol}発のため、荷主の画面では${r.pol}発のレートで組み直します（無ければ取り下げ）` : "（荷主が画面を開くと、いまのレートで組み直されます）"}。`, `The rate copies in this quote expired (${d}); the rate table already has this lane valid until ${N.valid}.`));
        return t === x[1] ? x : [x[0], t].concat(x.slice(2));
      });
    } catch (e) { v101fErr("legnotes", e); return out; }
  };
}

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
    const out = __al101.apply(this, arguments);
    /* 22.01.3（x3 X3）：貴社の見積が依頼と違う仕出港のレートの写し（横浜港→香港 など）の国は、21.90 が入れる写しの区間（横浜港発）では、この依頼の見積に使われない
       → 21.90 が欄に入れた後（350ms）に、仕出港を依頼の仕出港（神戸港 など）に直し、そう知らせる（「追加」は押さない） */
    try {
      const r = v101fReqs().find((x) => x.id === id), l = r && (r.legs || [])[+i];
      const ow = l && v101fOwnOffer(l), OI = ow ? v101fOwnLegInfo(r, l, ow) : null;
      if (r && OI && OI.pol && r.pol) {
        setTimeout(() => {
          try {
            const e = document.getElementById("frPol"); if (!e) return;
            e.value = String(r.pol); e.dispatchEvent(new Event("input", { bubbles: true }));
            V101FWD.prefill = Object.assign({}, V101FWD.prefill || {}, { polFix: r.pol, at: Date.now() });
            const pod = (document.getElementById("frPod") || {}).value || "";
            if (typeof toast === "function") toast(v101fM(`${id}：依頼の仕出港 ${r.pol} 発の区間（${r.pol} → ${pod}）にしました（貴社の見積は ${OI.lanePol} 発のレートの写しだったため）。運賃・日数・有効期限を確かめて「追加」を押すと、${r.pol} 発のレートとして登録され、荷主が次に画面を開いたときにこの依頼の見積が組み直されます`, `${id}: set to the request's port ${r.pol}. Check and press Add.`));
          } catch (e2) { v101fErr("anslegpol", e2); }
        }, 650);
      }
    } catch (e) { v101fErr("anslegpol0", e); }
    return out;
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
    const others = v101fReqs().filter((r) => v101fOwnSt(r).kind === "others").map((r) => { const O = v101fOwnSt(r); return `・${r.id}（${r.pol || ""}→${r.cty || ""}・${r.mode || ""}）：貴社は未回答（貴社のレートなし）。届いている見積は他社だけ（${O.cos.join("・")}${O.othersMin != null ? "・他社の最安 " + v101fY(O.othersMin) : ""}）。${O.stale ? `他社の見積は${v101fStaleWhy(O, r)}で、荷主の画面では取り下げ（レーン未登録）。荷主はこの見積を検討していない` : "荷主が検討しているのは他社の見積"}`; });
    /* 22.01.2（w3 W2）：貴社の見積の取り下げ */
    const ownSt = v101fReqs().filter((r) => v101fOwnSt(r).ownStale).map((r) => { const L = v101fStLabel(r); return `・${r.id}（${r.pol || ""}→${r.cty || ""}）：${L.txt}。${L.sub}`; });
    if (ownSt.length) {
      const SM = v101fOwnSummary(), EU = v101fExpRatesUse();
      s += `\n## 貴社の見積の取り下げ・組み直し待ち（v22.01.3）\n貴社の見積は、レートの写し（期限 ${SM.validList.join("・")}）で組まれたまま。荷主の画面は、期限切れ・依頼と違う仕出港の見積をそのまま出さず、いまの有効なレートで組み直す（無ければ取り下げ）。組み直し待ち ${SM.wait}件（貴社のレート表に依頼の仕出港発の有効なレートがある）・取り下げ ${SM.pol + SM.renew}件（依頼の仕出港発の貴社のレートが無い：${SM.portList.map((p) => p.pol + " " + p.n + "件").join("・")}）。本当の一手は、依頼の仕出港発のレートを登録すること。期限切れのレート ${EU.exp.length}本（${Object.keys(EU.modes).join("・")}）は、いまの見積に使われているのは ${EU.used}区間（入れ直しても、いまの見積は変わらない）。\n${ownSt.slice(0, 30).join("\n")}`;
    }
    s += `\n## 貴社の回答状況（v22.01）\n受信 ${C.all}件のうち、貴社のレートで AI が見積を出した依頼 ${C.own}件・他社だけが見積を出した依頼（貴社は未回答）${C.others}件（うち他社の見積も期限切れなどで荷主の画面では取り下げ ${C.othersStale}件）・どの会社も見積を出せなかった依頼 ${C.open}件。AI自動回答率は貴社の見積で数える：そのまま出せる ${A.clean} / ${A.recv}件＝${A.rate}%（期限切れの貴社のレートで組んだ見積 ${A.exp}件・依頼と違う仕出港のレートで組んだ見積 ${A.port}件）。「回答済み」と聞かれたら、貴社が回答したかどうかを分けて答える。他社の金額を貴社の見積として答えない。見積は区間のレート（仕出港→仕向け・形態）で答えるしくみで、この依頼だけの金額（スポット見積）を出す機能はいまの版にない（できると答えない。区間のレートを登録・直すと、同じ区間のほかの依頼にも使われる）。\n${others.join("\n")}`;
    /* 容積の出どころ（B/L のある案件） */
    const C2 = typeof v33Cases === "function" ? (v33Cases() || []) : [];
    const lines = [];
    C2.forEach((c) => {
      const V = v101fCaseVol(c); if (V.bl == null) return;
      /* 22.01.1：B/L と荷主の共有の照らし合わせ（総重量・箱数・数量も）と、B/L の容積で計算し直す区間（B/L の仕向地だけ） */
      try {
        const cs = typeof v101fCsOfCase === "function" ? v101fCsOfCase(c) : {};
        (c.reqs || []).filter(Boolean).forEach((r) => { const X = typeof v101fBlCmp === "function" ? v101fBlCmp(r, cs) : null; if (X && X.shared && X.diff.length) lines.push(`・${r.id} と B/L ${V.blNo || ""}：${X.items.map((d) => `${d.k} 荷主の共有 ${d.reqTxt}／B/L ${d.blTxt}（${d.same === true ? "同じ" : d.same === false ? "違う" : "比べられない"}）`).join("・")}`); });
        const SC = typeof v101fVolScope === "function" ? v101fVolScope(c, cs) : null;
        if (SC && SC.restricted) lines.push(`・B/L ${V.blNo || ""} の仕向地は${SC.dest}。B/L の容積で計算し直す（反映する）のは${SC.dest}の区間 ${SC.keep.length}件だけ（${[...new Set(SC.drop.map((x) => x.cty))].join("・")}の ${SC.drop.length}区間は、この B/L の出荷ではないため対象外）`);
      } catch (e) { v101fErr("ctxbl", e); }
      lines.push(`・案件（B/L ${V.blNo || "—"}）：B/L の容積 ${v101fCbmTxt(V.bl)} m³（入力のまま「${V.blRaw}」）／${V.reqs.map((x) => `${x.id} ${x.cbm != null ? v101fCbmTxt(x.cbm) + " m³" : "—"}（${x.kind === "default" ? "標準値・荷主は容積を入れていない" : x.kind === "shared" ? "荷主の共有" : "出どころ不明"}${x.trial ? "・体験用の依頼" : ""}・B/L と${x.same ? "同じ" : "違う"}）`).join("／")}`); });
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
      if (L.kind !== "others" && L.kind !== "part" && !L.ownStale) return;
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

/* ═══ 22.01.1（22.01 の公開後の検証 v3 の直し）═══════════════════════════════════
   N4 B/L と荷主の共有を、容積だけでなく総重量・箱数・数量でも比べる（v101fBlCmp）。
   N5 「B/L の容積で反映する」の対象を B/L の仕向地の国の区間に（v97fVolAuto を包む。B/L は1回の出荷＝仕向地は1つ。ほかの国の見積は、この B/L の出荷ではない）。
   N3 荷主の「物流会社に見積を依頼（相見積）」の確かめの窓に、送る中身と同じ容積・箱数・総重量を出す（v101fShipPlan。見せ方は rd_v101fwd.js）。 */
V101FWD.v = "22.01.3";
function v101fNumOf(s) {
  if (s == null || s === "") return null;
  if (typeof s === "number") return isFinite(s) ? s : null;
  const t = (String(s).normalize ? String(s).normalize("NFKC") : String(s)).replace(/,/g, "");
  const m = t.match(/-?\d+(?:\.\d+)?/);
  return m ? +m[0] : null;
}
window.v101fNumOf = v101fNumOf;
/* 依頼の数量（本・個など）：「25カートン（…・12本入）」→ 25×12＝300本 */
function v101fReqQty(r) {
  try {
    const cg = (String(r && r.cargo || "").normalize ? String(r.cargo || "").normalize("NFKC") : String(r.cargo || ""));
    const ctn = +(r && r.cartons) || v101fNumOf((/(\d+)\s*(?:カートン|箱|ケース|ctn)/i.exec(cg) || [])[1]);
    const m = /(\d+)\s*(本|個|枚|袋|缶|瓶|足|台|セット|pcs)\s*入/i.exec(cg);
    if (!ctn || !m) return null;
    return { n: ctn * +m[1], unit: m[2], per: +m[1], ctn };
  } catch (e) { return null; }
}
/* B/L（案件の「B/L・出荷の情報」）と、依頼で荷主が共有した値の照らし合わせ：容積・総重量・箱数・数量 */
function v101fBlCmp(r, cs) {
  const o = { items: [], diff: [], shared: false, any: false };
  try {
    if (!r || !cs) return o;
    const S = v101fVolSrc(r);
    o.shared = S.kind === "shared";
    const blCbm = v101fCbm(cs.cbm), blGw = v101fNumOf(cs.gw), blCtn = v101fNumOf(cs.pack);
    const qs = String(cs.qty == null ? "" : cs.qty).normalize ? String(cs.qty == null ? "" : cs.qty).normalize("NFKC") : String(cs.qty || "");
    const qm = /(\d[\d,]*(?:\.\d+)?)\s*([^\d\s（(、,・]+)?/.exec(qs);
    const blQty = qm ? +qm[1].replace(/,/g, "") : null, blQu = qm && qm[2] ? qm[2].trim() : "";
    const rq = v101fReqQty(r);
    const add = (k, bl, req, blTxt, reqTxt, tol, cmp) => {
      if (bl == null && !req) return;
      const has = req != null && req !== 0 && o.shared;
      const same = has && bl != null && cmp !== false ? Math.abs(bl - req) <= tol : null;
      const it = { k, bl, req: has ? req : null, blTxt: bl != null ? blTxt : v101fM("B/L に記載なし", "not on the B/L"), reqTxt: has ? reqTxt : (k === "容積" && S.kind === "default" ? v101fM(`標準 ${v101fCbmTxt(req)} m³（荷主は入れていません）`, `standard ${req} m³ (not entered)`) : v101fM("荷主は入れていません", "not entered by the shipper")), same };
      if (has && bl != null && cmp !== false && !same) { it.ratio = bl ? req / bl : null; o.diff.push(it); }
      o.items.push(it);
    };
    add(v101fM("容積", "Volume"), blCbm, +r.cbm || null, `${v101fCbmTxt(blCbm)} m³`, `${v101fCbmTxt(+r.cbm)} m³`, 0.005);
    add(v101fM("総重量", "Gross weight"), blGw, +r.weight || null, `${(blGw || 0).toLocaleString("ja-JP")} kg`, `${(+r.weight || 0).toLocaleString("ja-JP")} kg`, 0.5);
    add(v101fM("箱数", "Cartons"), blCtn, +r.cartons || null, String(cs.pack || ""), `${+r.cartons || 0}${v101fM("カートン", " cartons")}`, 0);
    if (rq) add(v101fM("数量", "Quantity"), blQty, rq.n, String(cs.qty || ""), v101fM(`${rq.n}${rq.unit}（${rq.ctn}カートン×${rq.per}${rq.unit}入）`, `${rq.n} ${rq.unit} (${rq.ctn} × ${rq.per})`), 0, !blQu || blQu === rq.unit);
    else add(v101fM("数量", "Quantity"), blQty, null, String(cs.qty || ""), "", 0);
    o.any = o.items.length > 0;
  } catch (e) { v101fErr("blcmp", e); }
  return o;
}
window.v101fBlCmp = v101fBlCmp;
function v101fCsOfCase(c) {
  try { const id = typeof v33CsId === "function" ? v33CsId(c.key) : ""; return (id && typeof v33One === "function" ? v33One("cs", id) : null) || {}; } catch (e) { return {}; }
}
window.v101fCsOfCase = v101fCsOfCase;

/* N5：B/L の仕向地の国（同じ国の書き方の違いはそろえて比べる） */
function v101fCtyK(s) {
  const x = String(s == null ? "" : s).trim();
  if (!x) return "";
  try { if (typeof v100fCtyOf === "function") { const C = v100fCtyOf(x); if (C && C.key) return C.key; } } catch (e) { /* 下で */ }
  try { if (typeof cnorm === "function") return cnorm(x); } catch (e) { /* 下で */ }
  return x;
}
window.v101fCtyK = v101fCtyK;
function v101fVolScope(c, cs) {
  const o = { all: [], keep: [], drop: [], dest: "", restricted: false };
  try {
    const f = window.__v101fVolAll || (typeof v97fVolAuto === "function" ? v97fVolAuto : null);
    o.all = f ? (f(c, cs) || []) : [];
    o.dest = String((cs && cs.dest) || "").trim();
    const dk = v101fCtyK(o.dest);
    if (!dk) { o.keep = o.all.slice(); return o; }
    o.keep = o.all.filter((x) => v101fCtyK(x.cty) === dk);
    o.drop = o.all.filter((x) => v101fCtyK(x.cty) !== dk);
    if (!o.keep.length) { o.keep = o.all.slice(); o.drop = []; return o; }
    o.restricted = o.drop.length > 0;
  } catch (e) { v101fErr("volscope", e); }
  return o;
}
window.v101fVolScope = v101fVolScope;
if (typeof v97fVolAuto === "function" && !window.__v101fVolAll) {
  window.__v101fVolAll = v97fVolAuto;
  const __va101 = v97fVolAuto;
  window.v97fVolAuto = function (c, cs) {
    const A = __va101.apply(this, arguments);
    try {
      if (!v101fOn() || !Array.isArray(A) || !A.length) return A;
      const dk = v101fCtyK((cs && cs.dest) || "");
      if (!dk) return A;
      const keep = A.filter((x) => v101fCtyK(x.cty) === dk);
      if (!keep.length || keep.length === A.length) return A;
      v101fCnt("volScope");
      return keep;
    } catch (e) { v101fErr("volauto", e); return A; }
  };
}

/* N3：荷主の相見積の依頼で、物流会社に送る容積・箱数・総重量（21.56 の v56shipPack と同じ決め方。入れた条件があればそれ） */
function v101fShipPlan(opts) {
  const o = { src: "default", cbm: 2, cartons: 0, gw: 0, txt: "", pol: "" };
  try {
    opts = opts || {};
    const S = (typeof D !== "undefined" && D && D.ship) || null;
    try { if (S && typeof v56shipOn === "function" && v56shipOn() && typeof v56shipCasePol === "function") o.pol = v56shipCasePol(S, String(opts.term || S.term || (D && D.term) || "FOB")) || ""; } catch (e) { o.pol = ""; }
    if (opts.cbm != null && opts.cbm !== "" && +opts.cbm > 0) { o.src = opts.__v101cond ? "cond" : "opts"; o.cbm = Math.round(+opts.cbm * 100) / 100; o.cartons = +opts.cartons || 0; o.gw = +opts.weight || 0; return o; }
    if (S && typeof v56shipOn === "function" && v56shipOn() && typeof v56shipPack === "function") {
      const pk = v56shipPack(S);
      if (pk && pk.ok) { o.src = "pack"; o.cbm = Math.max(0.01, Math.round(+pk.cbm * 100) / 100); o.cartons = +pk.cartons || 0; o.gw = +pk.gw || 0; o.txt = pk.txt || ""; }
    }
  } catch (e) { v101fErr("shipplan", e); }
  return o;
}
window.v101fShipPlan = v101fShipPlan;
