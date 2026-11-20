/* 22.00 flow：中身（データ・計算・判定）。見せ方は rd_v100flow.js（刷新版）。2026-11-20 第13回 UAT の直し
   信頼の決まり 1「表示は実態どおり」を、進捗の表示（旅程・現在地バー・はじめの設定・成長度・準備点）に当てはめる。
   No.590（高）STEP03（規制を確かめる）が、販売先国を確定しただけで 100%・ほかの国も「済み」になる
     原因：rd_v94jny.js の stepsNow() は「確定した国に規制の表（D.regs[c]）があるか」＋「表のひな形の必須の手続き（v54rStatus.req）」だけで数えていた。
           表は国を確定した時点でひな形から自動で入る（v70 の benchRows・regsFor）ので、ひな形に手続きの名前が無い国（未調査・要確認）は確定しただけで 100%。
           書類の判断の表で当たる必須（安全データシート SDS など・v95 の「別枠」）は数に入っていなかった。
           「表で確かめる（国名）」のボタン（v95 rd_v95reg.js）は、はじめの設定の「規制を調べる」が1度済むと、どの国でも「・済み」と出していた。
     直し：確定した国ごとに、次を全部済ませたときだけ 100%。「未調査」「要確認」は済みに数えない。
           ① その国の規制の表を確かめた（「表で確かめる（国名）」を押した記録・国ごと）
           ② 表のひな形の必須の手続き（「対応済みにする」）
           ③ 書類の判断の表の必須（SDS など。規制の画面の「この商品と送り先で確かめる点」と同じ判定）＝「対応済みにする」を押した記録
           ④ ひな形が無い国（未調査）・必須の手続きがあるかが要確認の国＝「確かめました」を押した記録（輸入者・専門家・公的な出どころ・AI 詳細調査で確かめた）
           ⑤ 配合が禁止されている成分（このままでは販売不可）は済みにならない
           記録は商品ごと（TEN.v100reg）。取り消せる（押し直すと未確認に戻る）。
   No.599（中）準備点：英語資料の作成に失敗したのに「貴社の準備 25/25点 ✓ 外国語営業資料」
     原因：v71obReady の deck は「会社の資料の情報（deckMeta）があるか」で、資料そのものを見ていなかった。reg は「規制の表があるか」。
     直し：window.v100deckState(ten)（取り決め）＝資料の実際の状態（none／failed／partial／draft／final）。準備点の資料は
           納品レベル 7点・下書き（要修正）5点・途中まで 2点・失敗 0点・無し 0点。規制は STEP03 と同じ判定（国の確かめが全部済み 8点・表は確かめたが残りあり 4点・未確認 0点）。
   そのほか：はじめの設定の「規制を調べる」（確定した国を全部「表で確かめる」まで済みにしない）・成長度の「規制調査 N か国」（表があるだけの国は数えない）。
   失敗しても画面が止まらないよう try/catch。最後のエラーは window.V100FLOW.err。 */
var V100FLOW = window.V100FLOW || { err: null, errs: [], ver: "22.00-flow" };
window.V100FLOW = V100FLOW;
(function () {
  "use strict";
  const W = window;
  if (W.__v100flowLogic) return;
  W.__v100flowLogic = 1;
  const err = (k, e) => { try { const s = k + ": " + String((e && (e.stack || e.message)) || e).slice(0, 300); V100FLOW.err = s; V100FLOW.errs.push(s); if (V100FLOW.errs.length > 40) V100FLOW.errs.shift(); } catch (x) { /* 記録だけ */ } };
  V100FLOW.e = err;
  const ten = () => { try { return typeof TEN !== "undefined" ? TEN : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const dd = () => { try { return typeof D !== "undefined" && D ? D : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const fn = (n) => { try { const f = W[n]; return typeof f === "function" ? f : null; } catch (e) { return null; } };
  const lang = () => { try { const el = document.getElementById("lang"); const v = String((el && el.value) || (W.I18N && W.I18N.lang) || document.documentElement.lang || "ja"); return /^en/.test(v) ? "en" : /^zh/.test(v) ? "zh" : /^es/.test(v) ? "es" : "ja"; } catch (e) { return "ja"; } };
  const M = (ja, en, zh, es) => { const l = lang(); return l === "en" ? (en || ja) : l === "zh" ? (zh || en || ja) : l === "es" ? (es || en || ja) : ja; };
  V100FLOW.M = M; V100FLOW.lang = lang;
  const nowStr = () => { try { if (fn("v54rNow")) return W.v54rNow(); } catch (e) { /* 下へ */ } const d = new Date(); const p = (n) => String(n).padStart(2, "0"); return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes()); };
  const save = () => { try { if (typeof saveTen === "function") saveTen(); } catch (e) { err("save", e); } }; // eslint-disable-line no-undef

  /* ══════ No.590 国ごとの確かめの記録（商品ごと） ══════ */
  function store(t) { t = t || ten(); if (!t) return {}; if (!t.v100reg || typeof t.v100reg !== "object" || Array.isArray(t.v100reg)) t.v100reg = {}; return t.v100reg; }
  function rec(c, t) { const S = store(t); const r = S[c]; return r && typeof r === "object" ? r : {}; }
  // k：'tbl'（表を確かめた）・'self'（未調査・要確認を確かめた）・'x'（書類の判断の表の必須。sub に書類の記号）
  function setRec(c, k, on, sub) {
    const t = ten(); if (!t || !c) return false;
    const S = store(t); const r = (S[c] = S[c] && typeof S[c] === "object" ? S[c] : {});
    if (k === "x") { r.x = r.x && typeof r.x === "object" ? r.x : {}; if (on) r.x[sub] = nowStr(); else delete r.x[sub]; }
    else if (on) r[k] = nowStr(); else delete r[k];
    save();
    return true;
  }
  V100FLOW.rec = rec; V100FLOW.setRec = setRec; V100FLOW.store = store;

  /* 確定した国（rd_v94jny の STEP 02 と同じ判定） */
  function chosenOf(t) {
    t = t || ten() || {};
    const cs = t.ctySel || {};
    const ch = Array.isArray(cs.chosen) ? cs.chosen.filter(Boolean) : [];
    let conf = !!(ch.length && cs.chosenAt);
    try { if (t === ten() && fn("ux32Setup")) { const S = W.ux32Setup.__v100orig ? W.ux32Setup.__v100orig() : null; const x = Array.isArray(S) ? S.find((s) => s && s[0] === "cty") : null; if (x) conf = !!x[4]; } } catch (e) { /* 下の判定のまま */ }
    if (!conf && ch.length) { try { const S = fn("ux32Setup") ? W.ux32Setup() : null; const x = Array.isArray(S) ? S.find((s) => s && s[0] === "cty") : null; if (x) conf = !!x[4]; } catch (e) { /* そのまま */ } }
    return { chosen: ch, conf: conf && ch.length > 0 };
  }
  V100FLOW.chosenOf = chosenOf;

  /* 書類の判断の表で、この商品とこの国に当たる「必須」（規制の画面の「この商品と送り先で確かめる点」と同じ判定。
     本体の層 __v2192ops の tableHits は閉じた関数なので、同じ手順で数える。表のひな形にある書類・汎用の書類は外す） */
  const GENERIC = new Set(["CI", "PL", "SI", "SHIP_MARK", "BL", "AWB", "EXP_DEC", "INS", "ISF_DATA", "CO_GEN", "CO_EPA_3P", "CO_EPA_AE", "CO_EPA_SELF", "ORIGIN_EVID", "BENE_CERT", "DRAFT", "SIGN_CERT", "INV_LEGAL", "E_ATTEST", "FUMI", "EXP_LICENSE", "INSP_CERT", "SPEC_EN"]);
  const DUP = { FDA_FFR: /FDA食品施設登録/, FDA_PN: /事前通知|Prior Notice/i, SG_SFA: /SFA/, TH_FDA: /タイFDA/, CIFER: /GACC/, HALAL: /ハラル/, RAD_TEST: /放射性物質/, FDA_MOCRA: /MoCRA|製品リスティング/, EU_RP: /EU域内責任者/, EU_CPSR: /CPSR/, EU_CPNP: /CPNP/,
    UK_SCPN: /SCPN/, NMPA: /NMPA/, ID_BPOM: /BPOM/, FDA_DEVICE: /FDA 施設登録|510\(k\)/, AU_BICON: /BICON/, TW_TFDA: /TFDA|査験/, COA: /成分分析表|全成分表|成分表（INCI）/, GAIHI: /該非判定書/, IN_IMPORT: /FSSAI|CDSCO|BIS/, FSC_MD: /自由販売証明/, KR_MFDS: /食品等の輸入申告/,
    FCM_DOC: /食品接触|食品器具|GB 4806|溶出試験|器具・容器包装/, SAKE_CERT: /製造地証明/, ORIGIN_PREF: /産地証明書/, LABEL: /ラベル|表示|表記/, AE_REG: /ESMA/, CONFORMITY: /UKCA|CE|RoHS/ };
  const LVO = { ban: 4, required: 3, conditional: 2, check: 1 };
  /* 22.00.1 N6：「適合宣言・製品認証（CE・UKCA・KC・CCC・SABER など）」は国によらない名前で、関係の無い制度名が並んでいた。
     → 送り先の国（と品目）の制度名だけにする。米国の子ども向け製品（玩具 9503〜9505）は CPC（CPSC の公式ページで確かめた：
       12歳以下向けの子ども用製品は、CPSC が認めた第三者の試験所の試験にもとづき輸入者・国内メーカーが CPC を出す〔16 CFR 1110〕・
       玩具は ASTM F963 が義務〔16 CFR 1250〕・製品と包装に追跡ラベル。2026-11-20 確認）。確かめていない国は「要確認」 */
  const CPSC_SRC = "CPSC『Children\u2019s Product Certificate (CPC)』『Toy Safety Business Guidance』（2026-11-20 確認）";
  function confName(cc, hs) {
    const h = String(hs || "").replace(/\D/g, "");
    const toy = /^950[345]/.test(h);
    let eu = false; try { eu = fn("v85docInGroup") ? W.v85docInGroup(cc, ["EU"]) : false; } catch (e) { eu = false; }
    if (cc === "US" && toy) return { ja: "子ども用製品の適合証明書（CPC）：CPSC が認めた試験所の第三者試験（ASTM F963 など）・製品と包装の追跡ラベル", en: "Children's Product Certificate (CPC): third-party testing at a CPSC-accepted lab (ASTM F963 etc.), tracking labels on product and packaging", src: CPSC_SRC };
    if (cc === "US") return { ja: "米国の適合の証明（品目しだい：無線は FCC、CPSC の規則がある製品は GCC・CPC。要確認）", en: "US conformity (depends on the product: FCC for radio devices, GCC/CPC for CPSC-regulated products; to be confirmed)" };
    if (eu) return { ja: "EU 適合宣言・CE マーキング" + (toy ? "（玩具の安全の決まり）" : "（当たる指令・規則は品目しだい）"), en: "EU Declaration of Conformity and CE marking" + (toy ? " (toy safety)" : "") };
    if (cc === "GB") return { ja: "UKCA（または CE）の適合宣言", en: "UKCA (or CE) Declaration of Conformity" };
    if (cc === "CN") return { ja: "CCC 強制認証（目録に載る品目）", en: "CCC compulsory certification (listed products)" };
    if (cc === "KR") return { ja: "KC 認証（要確認）", en: "KC certification (to be confirmed)" };
    if (cc === "SA") return { ja: "SABER の製品適合証明（PCoC）・出荷証明（SC）", en: "SABER Product Certificate of Conformity (PCoC) and Shipment Certificate (SC)" };
    return { ja: "適合宣言・製品認証（この国の制度名は要確認）", en: "Declaration of Conformity / product certification (scheme to be confirmed)" };
  }
  V100FLOW.confName = confName;
  V100FLOW.CONF_GENERIC = "適合宣言・製品認証（CE・UKCA・KC・CCC・SABER など）";
  const SEPC = { sig: "", v: {} };
  function sepReq(c) {
    const out = [];
    try {
      const d = dd() || {}, t = ten() || {};
      const r = d.regs ? d.regs[c] : null;
      if (typeof V85DOC_D === "undefined" || !V85DOC_D || !Array.isArray(V85DOC_D.rules) || !fn("v85docRuleHit") || !fn("v85docCC")) return out; // eslint-disable-line no-undef
      const cc = W.v85docCC(c); if (!cc) return out;
      const hsRaw = d.hs || t.hs || "";
      const hs0 = fn("v85docHsDigits") ? W.v85docHsDigits(hsRaw) : String(hsRaw).replace(/\D/g, "").slice(0, 10);
      if (!hs0) return out;
      const sig = [t.uid || t.item, c, hs0, d.cat, d.catKey, (r && r.docs || []).join("/"), JSON.stringify(d.compRows || []).length, String(d.item || ""), lang()].join("|");
      if (SEPC.v[sig]) return SEPC.v[sig];
      let fa = {}; try { fa = fn("v85docFlagsAuto") ? (W.v85docFlagsAuto(d, hs0) || {}) : {}; } catch (e) { fa = {}; }
      const flags = {}; Object.keys(fa).forEach((k) => { flags[k] = true; });
      let pref = ""; try { if (fn("v85docPref")) pref = W.v85docPref(d.origin || t.origin || "") || W.v85docPref(d.city || t.city || "") || W.v85docPref((t.corp && t.corp.addr) || ""); } catch (e) { pref = ""; }
      const tplDocs = (r && Array.isArray(r.docs)) ? r.docs.map((x) => String(x)) : [];
      const tplHasReg = tplDocs.some((x) => /登録|届出|備案|公示|ライセンス|許可/.test(x));
      const rows = {};
      const RE_MEDHS = /^(9018|9019|9020|9021|9022|902511|3005|3006|9402)/;
      const run = (hs, prov) => {
      const F = { hs, hsProv: null, item: d.item || "", itemEn: d.itemEn || "", dest: cc, mode: "sea", inc: "", lc: false, pref, flags, epa: false };
      V85DOC_D.rules.forEach((R) => { // eslint-disable-line no-undef
        try {
          const keys = (R.k || []).filter((k) => !GENERIC.has(k));
          if (!keys.length) return;
          const w = R.w || {};
          if ((w.h || []).indexOf("*") >= 0 && (w.d || []).indexOf("*") >= 0 && !w.f) return;
          if (prov && !(w.h || []).some((x) => RE_MEDHS.test(String(x)))) return;
          const h = W.v85docRuleHit(R, F);
          if (!h) return;
          const pend = h.pend || [];
          if (pend.indexOf("hs") >= 0 || pend.indexOf("dest") >= 0 || pend.indexOf("pref") >= 0) return;
          const prefN = pend.indexOf("prefn") >= 0;
          keys.forEach((k) => {
            if (k === "IMPORT_BAN") return;
            if (DUP[k] && tplDocs.some((x) => DUP[k].test(x))) return;
            if (k === "DEST_REG" && tplHasReg) return;
            const di = ((V85DOC_D.docs || {})[k]) || [k, "", "", "", 0]; // eslint-disable-line no-undef
            const row = rows[k] || (rows[k] = { k, ja: di[0], en: di[1], lv: "check" });
            const lv = prefN ? "check" : R.lv;
            if (LVO[lv] > LVO[row.lv]) row.lv = lv;
          });
        } catch (e) { /* 1行の失敗は飛ばす */ }
      });
      };
      run(hs0, false);
      // 規制の画面と同じ：医療機器かもしれない商品（v92opsKind の meddev）で HS が医療機器の号でないときは、医療機器の号（9018）でも当てる
      try { const K = fn("v92opsKind") ? W.v92opsKind() : null; if (K && K.meddev && !RE_MEDHS.test(hs0)) run("9018", true); } catch (e) { /* そのまま */ }
      Object.keys(rows).forEach((k) => {
        const x = rows[k];
        if (x.lv !== "required" && x.lv !== "conditional") return;
        try { if (fn("v98regAllowed") && !W.v98regAllowed(t, x.ja)) return; } catch (e) { /* 出す */ }
        if (k === "CONFORMITY") { const nm = confName(cc, hs0); x.ja = nm.ja; x.en = nm.en; x.src = nm.src || ""; }
        out.push(x);
      });
      SEPC.v[sig] = out;
      if (Object.keys(SEPC.v).length > 60) SEPC.v = {};
    } catch (e) { err("sepReq", e); }
    return out;
  }
  V100FLOW.sepReq = sepReq;
  const NOTPL = /ひな形は、アプリにまだありません|ひな形が、アプリにまだありません/;
  const nm1 = (s) => String(s || "").replace(/[（(].*$/, "").replace(/\s/g, "");

  /* 国ごとの確かめの項目（STEP03 の中身）。it：{k, t, ok, at, go, nm, key} */
  function ctyState(c) {
    const d = dd() || {};
    const r = d.regs ? d.regs[c] : null;
    const R = rec(c);
    const it = [];
    const go = (find) => ({ k: "ops:reg", cty: c, find });
    if (!r) {
      it.push({ k: "tbl", t: M(c + "：規制の表を出す（「規制を調べる」で国を選ぶ）", c + ": open the regulation table (choose the country in “Check regulations”)", c + "：打开法规表（在“查法规”中选择国家）", c + ": abrir la tabla de normas (elija el país en «Revisar normas»)"), ok: false, go: go(["送り先ごとの決まりごと", "送り先の国"]) });
      it.forEach((x) => { x.lb = String(x.t).replace(c + "：", "").replace(c + ": ", ""); });
      return { c, it, n: 0, m: 1, kind: "none", left: it.slice() };
    }
    let st = null; try { st = fn("v54rStatus") ? W.v54rStatus(c) : null; } catch (e) { st = null; }
    const tblLbl = M("表で確かめる（" + c + "）", "Review the table (" + c + ")", "查看法规表（" + c + "）", "Revisar la tabla (" + c + ")");
    it.push({ k: "tbl", t: M(c + "：規制の表を確かめる（「" + tblLbl + "」を押す）", c + ": review the regulation table (press “" + tblLbl + "”)", c + "：确认法规表（点击“" + tblLbl + "”）", c + ": revise la tabla (pulse «" + tblLbl + "»)"), ok: !!R.tbl, at: R.tbl || "", go: go(["表で確かめる（" + c, "表で確かめる", "Review the table"]) });
    const req = (st && Array.isArray(st.req)) ? st.req : [];
    const done = (st && Array.isArray(st.done)) ? st.done : [];
    req.forEach((x) => it.push({ k: "req", nm: String(x), t: c + "：" + x + M("（必要な手続き）", " (required procedure)", "（所需手续）", " (trámite obligatorio)"), ok: done.indexOf(x) >= 0, go: go([String(x), "対応済みにする", "未対応"]) }));
    const reqN = req.map(nm1);
    // 22.00.1 N4：表のひな形の「必要なときだけの手続き」（該当するか未確認）も数える（「該当する」「対象外」を選ぶと済み）
    const cond = (st && Array.isArray(st.cond)) ? st.cond : [];
    cond.forEach((x) => {
      if (x.v === "y" && !x.doc) return; // 該当する＝上の必要な手続きに入っている
      it.push({ k: "cond", nm: String(x.nm), t: c + "：" + x.nm + M("（必要なときだけ：当たるかを確かめる）", " (only when it applies: check whether it applies)", "（仅在适用时：确认是否适用）", " (solo si aplica: verifique)"), ok: x.v === "y" || x.v === "n", at: x.v === "n" ? M("対象外", "Not applicable") : x.v === "y" ? M("該当する", "Applies") : "", go: go([String(x.nm), "該当するか未確認"]) });
    });
    sepReq(c).forEach((x) => {
      if (reqN.some((q) => q && (q === nm1(x.ja) || q.indexOf(nm1(x.ja)) >= 0 || nm1(x.ja).indexOf(q) >= 0))) return;
      if (cond.some((q) => nm1(q.nm) === nm1(x.ja))) return;
      const at = (R.x && R.x[x.k]) || "";
      const reqd = x.lv === "required";
      it.push({ k: "x", key: x.k, nm: x.ja, lv: x.lv, t: c + "：" + (lang() === "ja" ? x.ja : (x.en || x.ja)) + (reqd ? M("（必須・書類の判断の表）", " (required — document decision table)", "（必需・文件判断表）", " (obligatorio — tabla de documentos)") : M("（条件つき・書類の判断の表：当たるかを確かめる）", " (conditional — document decision table: check whether it applies)", "（有条件・文件判断表：确认是否适用）", " (condicional — tabla de documentos: verifique)")), ok: !!at, at, go: go([x.ja, "この商品と送り先で確かめる点"]) });
    });
    // 22.00.1 N4：輸出の規制（制裁など）・産地による措置（規制の画面の上の枠と同じ v56regCheck）
    try {
      if (fn("v56regCheck") && fn("v56regCtxD")) {
        const K = W.v56regCheck(c, r, W.v56regCtxD());
        if (K && K.sanc) {
          if (K.sanc.lv === "all") it.push({ k: "ban", t: c + "：" + M("日本からの輸出が禁止されている国（輸出できない）", "exports from Japan are banned"), ok: false, go: go(["輸出の禁止", "外為法"]) });
          else it.push({ k: "x", key: "sanc", nm: "sanc", t: c + "：" + M("日本の輸出の規制（制裁など）に当たらないかを確かめる", "check Japan's export restrictions (sanctions, etc.)"), ok: !!(R.x && R.x.sanc), at: (R.x && R.x.sanc) || "", go: go(["輸出の禁止の措置", "外為法"]) });
        }
        ((K && K.ban) || []).concat((K && K.stop) || []).forEach((o) => it.push({ k: "ban", t: c + "：" + String(o.h || "").replace(/^[⛔⚠\uFE0F\s]+/, ""), ok: false, go: go([String(o.h || "").slice(0, 12)]) }));
        ((K && K.doc) || []).forEach((o) => { const key = "od:" + (o.id || String(o.h || "").slice(0, 20)); it.push({ k: "x", key, nm: String(o.h || ""), t: c + "：" + String(o.h || "").replace(/^[⛔⚠\uFE0F\s]+/, ""), ok: !!(R.x && R.x[key]), at: (R.x && R.x[key]) || "", go: go([String(o.h || "").slice(0, 12)]) }); });
      }
    } catch (e) { err("regCheck", e); }
    const noTpl = NOTPL.test(String(r.warn || ""));
    const warnReg = !!(st && !req.length && (st.warnReg || st.medEU));
    const kind = noTpl ? "notpl" : warnReg ? "warn" : "ok";
    if (kind !== "ok") {
      it.push({ k: "self", t: kind === "notpl"
        ? M(c + "：未調査（アプリに規制のひな形がありません）。必要な手続きを確かめる", c + ": not yet researched (no template in the app). Check the required procedures", c + "：未调查（应用中没有法规模板）。确认所需手续", c + ": sin investigar (no hay plantilla). Verifique los trámites")
        : M(c + "：必須の手続きがあるかは要確認。確かめる", c + ": whether mandatory procedures apply is unconfirmed. Check it", c + "：是否需要必需手续待确认。请确认", c + ": falta confirmar si hay trámites obligatorios. Verifíquelo"), ok: !!R.self, at: R.self || "", go: go(["確かめました", "未調査", "要確認"]) });
    }
    if (st && st.ban && st.ban.ban && st.ban.ban.length) it.push({ k: "ban", t: M(c + "：配合が禁止されている成分がある（このままでは販売不可）", c + ": contains a banned ingredient (cannot be sold as is)", c + "：含有禁用成分（无法照此销售）", c + ": contiene un ingrediente prohibido (no se puede vender así)"), ok: false, go: go(["販売不可", "禁止"]) });
    it.forEach((x) => { x.lb = String(x.t).replace(c + "：", "").replace(c + ": ", ""); if (x.go && Array.isArray(x.go.find)) x.go.find.unshift(x.lb); });
    const n = it.filter((x) => x.ok).length;
    return { c, it, n, m: it.length, kind, left: it.filter((x) => !x.ok), ban: it.some((x) => x.k === "ban") };
  }
  V100FLOW.ctyState = ctyState;

  /* STEP03 全体（rd_v94jny の STEP03 と同じ形） */
  function step3() {
    const t = ten() || {}, d = dd() || t;
    const C = chosenOf(t);
    const it = [], per = {};
    if (!C.conf) it.push({ k: "conf", t: M("先に販売先国を確定する（STEP 02）", "Confirm the target countries first (STEP 02)", "请先确定销售国（STEP 02）", "Confirme primero los países (STEP 02)"), ok: false, go: { k: "cty", find: ["確定", "おすすめ"] } });
    else {
      // 22.00.1 N4：輸出管理（該非判定）は国によらず商品に1つ（規制の画面の「該非判定の結果しだいで、輸出許可が要ります」）
      try {
        if (fn("v56regXc") && fn("v56regCtxD")) {
          const ctx = W.v56regCtxD();
          const need = C.chosen.some((c) => d && d.regs && d.regs[c] && W.v56regXc(c, d.regs[c], ctx));
          if (need) {
            const R0 = rec("_all");
            const tx = M("輸出管理（該非判定）：該非判定をして該非判定書を用意する（リスト規制に当たれば、どの国に送るときも経済産業大臣の輸出許可が要る）", "Export control: classify the product and prepare the classification sheet (an export licence is needed for any country if it is a listed item)", "出口管制（是否符合判定）：进行判定并准备判定书（如属清单管制，出口到任何国家都需要许可）", "Control de exportaciones: clasifique el producto (si está en la lista, necesita licencia para cualquier país)");
            it.push({ k: "xc", cty: "", t: tx, lb: tx, ok: !!R0.xc, at: R0.xc || "", go: { k: "ops:reg", cty: C.chosen[0], find: [tx, "輸出管理（該非判定）"] } });
          }
        }
      } catch (e) { err("xc", e); }
      C.chosen.forEach((c) => { const s = ctyState(c); per[c] = s; s.it.forEach((x) => it.push(Object.assign({ cty: c }, x))); });
    }
    const n = it.filter((x) => x.ok).length;
    const core = !!(C.conf && C.chosen.length && C.chosen.every((c) => d && d.regs && d.regs[c]));
    return {
      no: 3, nm: "規制を確かめる", sh: "規制", ic: "shield", it, n, m: it.length, pct: it.length ? Math.round((n / it.length) * 100) : 0, core, unit: "項目", per, chosen: C.chosen, v100: 1,
      note: M("確定した国ごとに、①規制の表を「表で確かめる（国名）」で確かめる ②表の必須の手続きを「対応済みにする」 ③書類の判断の表の必須（SDS など）を「対応済みにする」 ④未調査・要確認の国は確かめて「確かめました」。全部そろった国だけを「済み」に数えます（表があるだけ・未調査・要確認は数えません）",
        "For each confirmed country: (1) review the table, (2) mark the table’s required procedures done, (3) mark required documents from the decision table (e.g. SDS) done, (4) for not-yet-researched / unconfirmed countries, check and press “Checked”. Only countries with everything done count as done.",
        "每个已确定的国家：①确认法规表 ②将必需手续标记为已处理 ③将文件判断表的必需项（如 SDS）标记为已处理 ④未调查・待确认的国家确认后点击“已确认”。全部完成的国家才算完成。",
        "Para cada país: (1) revise la tabla, (2) marque los trámites obligatorios, (3) marque los documentos obligatorios (p. ej. SDS), (4) en países sin investigar o por confirmar, verifique y pulse «Verificado». Solo cuentan los países completos.")
    };
  }
  V100FLOW.step3 = step3;
  /* 国ごとの要約（準備点・はじめの設定・成長度で使う）：'done'（全部済み）・'part'（表は確かめた・残りあり）・'none'（未確認）・'nores'（表なし） */
  function ctyLevel(c) {
    try { const s = ctyState(c); if (!s.m || s.kind === "none") return { lv: "nores", s }; const xc = step3().it.find((x) => x.k === "xc"); if (s.n >= s.m && !s.ban && !(xc && !xc.ok)) return { lv: "done", s }; const tb = s.it.find((x) => x.k === "tbl"); return { lv: tb && tb.ok ? "part" : "none", s }; } catch (e) { err("ctyLevel", e); return { lv: "none", s: null }; }
  }
  V100FLOW.ctyLevel = ctyLevel;

  /* ══════ No.599 資料の状態（取り決め：window.v100deckState(ten)） ══════
     {state:'none'|'failed'|'partial'|'draft'|'final', slides, reason, lang, at}
     ・v100partial（ai の担当が途中の下書きに付ける）があれば 'partial'
     ・いちばん新しい試みが失敗（この層が記録する t.v100deckFail）なら 'failed'
     ・作れた資料（t.deck3.last）：納品レベルの検査に通れば 'final'、通らなければ 'draft'（下書き・要修正）。枚数 0 は 'failed' */
  function tsOf(x) { if (x == null) return 0; if (typeof x === "number") return x; const v = Date.parse(String(x)); return isNaN(v) ? 0 : v; }
  function partialOf(t) {
    const cands = [];
    try {
      const d3 = t.deck3 || {};
      if (d3.last && d3.last.v100partial) cands.push(Object.assign({ lang: d3.last.lang, slides: d3.last.n }, d3.last.v100partial));
      if (d3.v100partial && typeof d3.v100partial === "object") {
        if (d3.v100partial.at || d3.v100partial.reason) cands.push(Object.assign({}, d3.v100partial));
        else Object.keys(d3.v100partial).forEach((l) => { const P = d3.v100partial[l]; if (P && typeof P === "object" && (P.at || P.reason)) cands.push(Object.assign({ lang: l }, P)); }); // ai の担当の形：{言語: {reason, stage, at, …}}
      }
      if (d3.plans && typeof d3.plans === "object") Object.keys(d3.plans).forEach((l) => { const P = d3.plans[l]; if (P && P.v100partial) cands.push(Object.assign({ lang: l }, P.v100partial)); });
      if (d3.partial && typeof d3.partial === "object") Object.keys(d3.partial).forEach((l) => { const P = d3.partial[l]; if (P && P.v100partial) cands.push(Object.assign({ lang: l, slides: P.slides ? P.slides.length : P.n }, P.v100partial)); });
      if (t.v100partial) cands.push(Object.assign({}, t.v100partial));
    } catch (e) { err("partialOf", e); }
    cands.sort((a, b) => tsOf(b.at) - tsOf(a.at));
    return cands[0] || null;
  }
  W.v100deckState = function (t) {
    try {
      t = t || ten();
      if (!t) return { state: "none", slides: 0, reason: "" };
      const last = t.deck3 && t.deck3.last ? t.deck3.last : null;
      const fail = t.v100deckFail || null;
      const part = partialOf(t);
      const gen = Array.isArray(t.deckGen) ? t.deckGen : [];
      const lastAt = last ? tsOf(last.at) : (gen.length ? tsOf(gen[gen.length - 1].at) : 0);
      const partAt = part ? tsOf(part.at) : 0, failAt = fail ? tsOf(fail.at) : 0;
      if (part && partAt >= lastAt && partAt >= failAt - 1) return { state: "partial", slides: +part.slides || 0, reason: String(part.reason || ""), stage: part.stage, lang: part.lang || "", at: partAt };
      if (fail && failAt > lastAt) return { state: "failed", slides: 0, reason: String(fail.err || fail.reason || ""), lang: fail.lang || "", at: failAt };
      if (last) {
        const n = +last.n || 0;
        if (!n) return { state: "failed", slides: 0, reason: "0 slides", lang: last.lang || "", at: lastAt };
        return { state: last.pass ? "final" : "draft", slides: n, reason: last.pass ? "" : "check", lang: last.lang || "", at: lastAt, score: last.score };
      }
      if (gen.length) return { state: "draft", slides: 0, reason: "legacy", lang: gen[gen.length - 1].lang || "", at: lastAt };
      return { state: "none", slides: 0, reason: "" };
    } catch (e) { err("deckState", e); return { state: "none", slides: 0, reason: "error" }; }
  };
  // 作成の失敗を商品に記録する（作れたら消す）。v100partial は ai の担当が付ける
  if (typeof dk3Generate === "function") { // eslint-disable-line no-undef
    const __dg = dk3Generate; // eslint-disable-line no-undef
    const wrapped = async function (lang) {
      const T0 = ten();
      const before = T0 && T0.deck3 && T0.deck3.last ? T0.deck3.last.at : "";
      let r;
      try { r = await __dg.apply(this, arguments); } finally {
        try {
          const G = typeof DK3G !== "undefined" ? DK3G : null; // eslint-disable-line no-undef
          const T = (G && G.ten) || T0;
          if (T0) {
            const after = T0.deck3 && T0.deck3.last ? T0.deck3.last.at : "";
            if (G && G.err && after === before) { T0.v100deckFail = { at: Date.now(), lang: String(lang || G.lang || ""), err: String(G.err).slice(0, 160) }; save(); }
            else if (after && after !== before && T0.v100deckFail) { delete T0.v100deckFail; save(); }
          }
          void T;
        } catch (e) { err("deckFail", e); }
      }
      return r;
    };
    wrapped.__v100 = 1;
    dk3Generate = wrapped; // eslint-disable-line no-global-assign
  }

  /* ══════ No.599 準備点（v71obReady）：資料と規制を実態から ══════ */
  function readyFix(R, cty) {
    if (!R || typeof R !== "object") return R;
    const ds = W.v100deckState(ten());
    const dpt = { final: 7, draft: 5, partial: 2, failed: 0, none: 0 }[ds.state] || 0;
    const lv = cty ? ctyLevel(cty).lv : "none";
    const rpt = lv === "done" ? 8 : lv === "part" ? 4 : 0;
    const price = !!R.price, moq = !!R.moq;
    R.v100 = { deck: ds.state, deckPts: dpt, reg: lv, regPts: rpt, slides: ds.slides };
    R.deck = ds.state === "final" || ds.state === "draft";
    R.reg = lv === "done";
    R.pts = rpt + dpt + (price ? 5 : 0) + (moq ? 5 : 0);
    const miss = (Array.isArray(R.miss) ? R.miss : []).filter((m) => !(m && /^(規制調査|外国語営業資料)/.test(String(m[0]))));
    if (lv !== "done") miss.unshift([lv === "part" ? "規制調査（国の確かめの残り）" : "規制調査（国ごとに表で確かめる）", "ops"]);
    if (ds.state !== "final") miss.splice(lv !== "done" ? 1 : 0, 0, [ds.state === "failed" ? "外国語営業資料（作成に失敗・作り直す）" : ds.state === "partial" ? "外国語営業資料（途中まで・続きを作る）" : ds.state === "draft" ? "外国語営業資料（下書き・要修正）" : "外国語営業資料", "deck"]);
    R.miss = miss;
    return R;
  }
  if (typeof v71obReady === "function") { // eslint-disable-line no-undef
    const __r = v71obReady; // eslint-disable-line no-undef
    v71obReady = function (cty) { const R = __r.apply(this, arguments); try { return readyFix(R, cty); } catch (e) { err("ready", e); return R; } }; // eslint-disable-line no-global-assign
  }
  V100FLOW.readyFix = readyFix;

  /* ══════ はじめの設定の「規制を調べる」：確定した国を全部「表で確かめる」まで済みにしない ══════ */
  if (typeof ux32Setup === "function") { // eslint-disable-line no-undef
    const __u = ux32Setup; // eslint-disable-line no-undef
    const wrapped = function () {
      const S = __u.apply(this, arguments);
      try {
        if (!Array.isArray(S)) return S;
        const r = S.find((x) => x && x[0] === "reg");
        const cy = S.find((x) => x && x[0] === "cty");
        const t = ten();
        if (!r || !t) return S;
        const ch = (t.ctySel && Array.isArray(t.ctySel.chosen)) ? t.ctySel.chosen.filter(Boolean) : [];
        if (!ch.length || !(cy && cy[4])) return S;
        const ok = ch.filter((c) => rec(c).tbl), left = ch.filter((c) => !rec(c).tbl);
        r[4] = !left.length;
        r[5] = left.length
          ? M("「規制を調べる」で、確定した国ごとに「表で確かめる」を押すと済みになります（" + ok.length + "/" + ch.length + "か国・残り：" + left.join("・") + "）",
            "Press “Review the table” for each confirmed country in “Check regulations” (" + ok.length + "/" + ch.length + " · left: " + left.join(", ") + ")",
            "在“查法规”中为每个已确定的国家点击“查看法规表”（" + ok.length + "/" + ch.length + "・剩余：" + left.join("・") + "）",
            "Pulse «Revisar la tabla» para cada país (" + ok.length + "/" + ch.length + " · faltan: " + left.join(", ") + ")")
          : M("確定した " + ch.length + "か国の規制の表を確かめました（" + ch.join("・") + "）", "Tables reviewed for all " + ch.length + " countries", "已确认 " + ch.length + " 个国家的法规表", "Tablas revisadas en los " + ch.length + " países");
      } catch (e) { err("setup", e); }
      return S;
    };
    wrapped.__v100orig = function () { return __u.apply(this, arguments); };
    ux32Setup = wrapped; // eslint-disable-line no-global-assign
  }

  /* ══════ 成長度の「市場・規制の知識」：「規制調査 N か国」は、表があるだけの国を数えない ══════ */
  if (typeof aiLevelFor === "function") { // eslint-disable-line no-undef
    const __al = aiLevelFor; // eslint-disable-line no-undef
    aiLevelFor = function (d, t) { // eslint-disable-line no-global-assign
      const L = __al.apply(this, arguments);
      try {
        if (!L || !Array.isArray(L.cats)) return L;
        const curD = dd();
        const dx = d || curD || {};
        const tx = (t === undefined) ? ((dx === curD) ? ten() : null) : t;
        const c2 = L.cats.find((c) => c && c.k === "market");
        if (!c2 || c2.__v100) return L;
        const regs = Object.keys(dx.regs || {});
        const S = tx && tx.v100reg && typeof tx.v100reg === "object" ? tx.v100reg : {};
        const ai = tx && tx.regsAI && typeof tx.regsAI === "object" ? tx.regsAI : {};
        const n = regs.filter((c) => (S[c] && (S[c].tbl || S[c].self)) || (ai[c] && ai[c].ts)).length;
        const growN = typeof W.growN === "function" ? W.growN : (v, g) => Math.max(0, Math.min(100, Math.round((+v || 0) / g * 100)));
        const u = typeof growUsage === "function" ? growUsage() : {}; // eslint-disable-line no-undef
        const ev = Array.isArray(u.events) ? u.events : [];
        const web = +u.webQ || 0, stats = ev.filter((e) => /通関統計|推奨FOB|DDP|価格設定|競合|市場/.test(String(e[2] || ""))).length;
        c2.__v100 = 1;
        c2.pct = Math.round(growN(n, 4) * 0.5 + growN(web, 12) * 0.3 + growN(stats, 6) * 0.2);
        c2.detail = String(c2.detail || "").replace(/規制調査 \d+か国（目安4か国）/, "規制を確かめた国 " + n + "か国（目安4か国・表があるだけの国 " + (regs.length - n) + "か国は数えません）");
        if (c2.next && /送り先の規制を調べる/.test(String(c2.next.t || "")) && n >= 4) c2.next = null; else if (!c2.next && n < 4) c2.next = { t: "送り先の規制を確かめる", go: "ops", pre: "reg" };
        const pct = Math.max(0, Math.min(100, Math.round(L.cats.reduce((a, c) => a + c.pct * c.w / 100, 0))));
        if (pct !== L.pct && typeof GROW_STAGES !== "undefined") { // eslint-disable-line no-undef
          let lvIdx = 0; GROW_STAGES.forEach((s, i) => { if (pct >= s[0]) lvIdx = i; }); // eslint-disable-line no-undef
          const PRO = typeof GROW_PRO !== "undefined" ? GROW_PRO : 90; // eslint-disable-line no-undef
          Object.assign(L, { pct, lv: lvIdx + 1, lvIdx, stage: GROW_STAGES[lvIdx][1], nextStage: GROW_STAGES[lvIdx + 1] ? GROW_STAGES[lvIdx + 1][1] : null, nextTh: GROW_STAGES[lvIdx + 1] ? GROW_STAGES[lvIdx + 1][0] : null, to: Math.max(0, PRO - pct), pro: pct >= PRO }); // eslint-disable-line no-undef
        }
      } catch (e) { err("grow", e); }
      return L;
    };
  }
})();

/* ══════ No.600 相談の提案カードを商品ごとに結び付ける ══════
   原因：AI商社マンの提案（logic 21.88 の v88）は会社名ごとに控え、作ったときの会社（v95co）と違う商品を表示しているときは
         「この提案は『〇〇』を表示していたときに出したものです。商材の数字は…出し直しています」と一言そえて出していた（21.95）。
   直し：提案を作ったときの会社（v100co・前の提案は v95co）と、いま表示している商品の会社が違うときは、その提案を出さない（待ちの提案にも数えない・
         「出し直しています」の一言つきで出すこともしない）。同じ会社のほかの商品では出す（提案は会社ごとの道筋のため）。作ったときの商品も v100uid に控える */
(function () {
  "use strict";
  const W = window, V = W.V100FLOW;
  if (!V || W.__v100flowProp) return;
  W.__v100flowProp = 1;
  const ten = () => { try { return typeof TEN !== "undefined" ? TEN : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const uidNow = () => { const t = ten(); return t ? String(t.uid || t.item || "") : ""; };
  const coNow = () => { try { return typeof v88CoRaw === "function" ? v88CoRaw() : String((ten() || {}).co || ""); } catch (e) { return ""; } }; // eslint-disable-line no-undef
  // 提案は会社ごとの道筋（目指す姿・段階・止まり）なので、同じ会社のほかの商品では出してよい（本体の控えも会社ごと）。
  // 違う会社の商品（UAT の G→H）では出さない。作ったときの会社は v95co（21.95）か、この層の v100co
  function own(p) {
    if (!p || typeof p !== "object") return true;
    const co = coNow();
    const pc = p.v100co || p.v95co || "";
    return !(pc && co && pc !== co);
  }
  V.propOwn = own;
  if (typeof v88MakeProp === "function") { // eslint-disable-line no-undef
    const __mp = v88MakeProp; // eslint-disable-line no-undef
    v88MakeProp = function () { const p = __mp.apply(this, arguments); try { if (p && typeof p === "object" && !p.v100uid) { p.v100uid = uidNow(); p.v100item = String((ten() || {}).item || ""); p.v100co = coNow(); } } catch (e) { V.e("mkprop", e); } return p; }; // eslint-disable-line no-global-assign
  }
  if (typeof v88Pending === "function") { // eslint-disable-line no-undef
    const __pd = v88Pending; // eslint-disable-line no-undef
    v88Pending = function (R) { // eslint-disable-line no-global-assign
      try {
        if (R && Array.isArray(R.props)) {
          const now = typeof v88Now === "function" ? v88Now() : Date.now(); // eslint-disable-line no-undef
          return R.props.find((p) => p && own(p) && (p.st === "new" || p.st === "seen" || (p.st === "later" && (p.until || 0) <= now))) || null;
        }
      } catch (e) { V.e("pending", e); }
      return __pd.apply(this, arguments);
    };
  }
  if (typeof v88PropHtml === "function") { // eslint-disable-line no-undef
    const __ph = v88PropHtml; // eslint-disable-line no-undef
    v88PropHtml = function (p) { try { if (p && !own(p)) return ""; } catch (e) { V.e("prophtml", e); } return __ph.apply(this, arguments); }; // eslint-disable-line no-global-assign
  }
})();

/* ══════ No.602 PI（見積書）の有効期限：どう決めたかを書き、価格の有効期限にそろえられるように ══════
   前：見積書の日付から30日と、商品の価格の有効期限の早い方（v92docValid）。価格の有効期限が先（2027-02-20）でも PI は30日（2026-12-20）で先に切れ、理由が分かりにくかった。
   既定（推奨・決めてほしいこと 1）：運賃を含まない取引条件（EXW・FCA・FAS・FOB）は、商品の価格の有効期限にそろえる（未設定なら30日）。
        運賃を含む取引条件（CFR・CIF・CPT・CIP・DAP・DPU・DDP）は、30日と価格の有効期限の早い方（運賃が変わるため・今まで通り）。
   利用者が選んだとき（TEN.v100piValid[案件番号]）：「価格の有効期限にそろえる」「30日にする」。価格の有効期限より後の日付は知らせる。 */
(function () {
  "use strict";
  const W = window, V = W.V100FLOW;
  if (!V || W.__v100flowPi) return;
  W.__v100flowPi = 1;
  const ten = () => { try { return typeof TEN !== "undefined" ? TEN : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const FREIGHT = /^(CFR|CIF|CPT|CIP|DAP|DPU|DDP)$/;
  const codeOf = (s) => { const m = String(s || "").toUpperCase().match(/\b(EXW|FCA|FAS|FOB|CFR|CIF|CPT|CIP|DAP|DPU|DDP)\b/); return m ? m[1] : ""; };
  function pick(S, t) { try { const P = t && t.v100piValid; const k = String((S && S.no) || "_"); return P && P[k] ? P[k] : null; } catch (e) { return null; } }
  V.piPick = pick;
  V.piSet = function (S, how) {
    const t = ten(); if (!t || !S) return false;
    t.v100piValid = t.v100piValid && typeof t.v100piValid === "object" ? t.v100piValid : {};
    const k = String(S.no || "_");
    if (!how) delete t.v100piValid[k]; else t.v100piValid[k] = { how, at: Date.now() };
    try { if (typeof saveTen === "function") saveTen(); } catch (e) { /* 無視 */ } // eslint-disable-line no-undef
    return true;
  };
  if (typeof v92docValid === "function") { // eslint-disable-line no-undef
    const __v = v92docValid; // eslint-disable-line no-undef
    v92docValid = function (S, t) { // eslint-disable-line no-global-assign
      const V0 = __v.apply(this, arguments);
      try {
        if (!V0 || V0.why === "exp") return V0;
        const code = codeOf((S && S.term) || (t && t.term) || "");
        const fr = FREIGHT.test(code);
        const X = Object.assign({}, V0, { code, freight: fr, base: V0.why });
        const man = pick(S, t || ten());
        if (man && man.how === "price" && X.pu && X.pu >= X.date) { X.why = "price-set"; X.until = X.pu; X.en = "Until " + X.pu + " (price list validity)"; }
        else if (man && man.how === "d30") { X.why = X.pu && X.pu < X.d30 ? "price" : "30-set"; X.until = X.pu && X.pu < X.d30 ? X.pu : X.d30; X.en = X.why === "price" ? "Until " + X.pu + " (price list validity)" : "30 days (until " + X.d30 + ")"; }
        else if (V0.why === "30" && X.pu && X.pu > X.d30 && !fr) { X.why = "price-def"; X.until = X.pu; X.en = "Until " + X.pu + " (price list validity)"; }
        return X;
      } catch (e) { V.e("piValid", e); return V0; }
    };
  }
})();

/* ══════ 22.00.1 N12：進出希望国に「指定なし」と答えた商品は、進出希望国を「答えた」に数える ══════
   21.99 cty が「指定なし」を国として登録せず TEN.targetsNone に控える。確定するまで「進出希望国 必須・未登録」・充足度 20/21・はじめの設定 0/6 だった。
   → 商品情報の充足（v92prodFill。旅程の STEP 01・はじめの設定・取り込みの % が使う）で、targetsNone のときは進出希望国を入っているに数える */
(function () {
  "use strict";
  const W = window, V = W.V100FLOW;
  if (!V || W.__v100flowTn) return;
  W.__v100flowTn = 1;
  const none = (t) => !!(t && t.targetsNone && !(Array.isArray(t.targets) && t.targets.length));
  V.targetsNone = none;
  if (typeof v92prodFill === "function") { // eslint-disable-line no-undef
    const __pf = v92prodFill; // eslint-disable-line no-undef
    v92prodFill = function (t) { // eslint-disable-line no-global-assign
      const K = __pf.apply(this, arguments);
      try {
        const tt = t === undefined ? (typeof TEN !== "undefined" ? TEN : null) : t; // eslint-disable-line no-undef
        if (K && none(tt) && Array.isArray(K.missKeys) && K.missKeys.indexOf("targets") >= 0) {
          K.missKeys = K.missKeys.filter((k) => k !== "targets");
          K.okKeys = (K.okKeys || []).concat(["targets"]);
          K.c = K.okKeys.length;
          K.pct = K.d ? Math.round((K.c / K.d) * 100) : 0;
          try { const req = NEED.filter((x) => x.w >= 5); if (req.some((x) => x.k === "targets")) K.a = Math.min(K.b, (K.a || 0) + 1); } catch (e) { /* そのまま */ } // eslint-disable-line no-undef
          K.full = K.c === K.d; K.allDone = K.full && !((K.optMiss || []).length);
          K.v100none = 1;
        }
      } catch (e) { V.e("fillNone", e); }
      return K;
    };
  }
  if (typeof v92itemMiss === "function") { // eslint-disable-line no-undef
    const __im = v92itemMiss; // eslint-disable-line no-undef
    v92itemMiss = function () { // eslint-disable-line no-global-assign
      const L = __im.apply(this, arguments);
      try { const t = typeof TEN !== "undefined" ? TEN : null; if (Array.isArray(L) && none(t)) return L.filter((x) => !(x && x.k === "targets")); } catch (e) { V.e("missNone", e); } // eslint-disable-line no-undef
      return L;
    };
  }
})();

/* ══════ 22.00.1 N6：英語などの営業資料の「Import Requirements by Market」（書類のページ）に、規制の画面で必須の書類を渡す ══════
   原因：資料の国ごとの書類（土台の dk3DataSrc）は、表のひな形（regsFor）の書類だけ（Invoice・Packing List・Certificate of Origin）で、
         規制の画面の「書類の判断の表」で必須の書類（米国の子ども向け製品の CPC・EU の適合宣言 など）が入っていなかった。
   直し：資料の国ごとに、書類の判断の表の「必須」を足す（名前は国ごとの制度名＝confName。英語などの訳は決まった訳語の表 V97DK_TERMS に足す）。 */
(function () {
  "use strict";
  const W = window, V = W.V100FLOW;
  if (!V || W.__v100flowDk) return;
  W.__v100flowDk = 1;
  const ten = () => { try { return typeof TEN !== "undefined" ? TEN : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  function addTerm(ja, en) {
    try {
      if (typeof V97DK_TERMS === "undefined" || !Array.isArray(V97DK_TERMS) || !ja || !en) return; // eslint-disable-line no-undef
      if (V97DK_TERMS.some((r) => r && r[0] === ja)) return; // eslint-disable-line no-undef
      V97DK_TERMS.unshift([ja, en, en, en, en, en]); // eslint-disable-line no-undef
    } catch (e) { V.e("term", e); }
  }
  V.addTerm = addTerm;
  if (typeof dk3DataSrc === "function") { // eslint-disable-line no-undef
    const __ds = dk3DataSrc; // eslint-disable-line no-undef
    dk3DataSrc = function (T) { // eslint-disable-line no-global-assign
      const d = __ds.apply(this, arguments);
      try {
        if (!d || !Array.isArray(d.markets) || (T && T !== ten())) return d;
        d.markets.forEach((m) => {
          if (!m || !m.c) return;
          const rows = (V.sepReq(m.c) || []).filter((x) => x.lv === "required");
          if (!rows.length) return;
          const docs = Array.isArray(m.docs) ? m.docs.slice() : [];
          rows.forEach((x) => {
            const ja = String(x.ja || "");
            if (!ja || docs.some((y) => String(y) === ja)) return;
            docs.push(ja);
            addTerm(ja, x.en || "");
          });
          m.docs = docs.slice(0, 7);
          m.v100req = rows.map((x) => x.k);
        });
      } catch (e) { V.e("dk3DataSrc", e); }
      return d;
    };
  }
})();
