/* ═══ v21.95 reg（2026-11-17 週次レビュー）改修一覧〔大森パート〕の第6回 UAT（No.477・482・494・508 の中身。No.493 と画面の見せ方は rd_v95reg.js）
   No.477（高）関税の目安に別品目の代理値を使わない
     原因：regsFor（7192 行）が、カテゴリーのひな形（食品＝茶 HS 0902・日用雑貨＝魔法瓶 HS 9617・医療＝衛生材料 HS 3005 など）の税率を
           そのまま D.regs[国].duty に入れる。HS が違う自社の商品でも数字が残り、後の層（v92ct・v92r3b）は「別の品目の目安」と注記を足すだけで、
           規制の画面・税の一覧（関税 0%）・米国の追加関税の枠（通常の関税 0%＋追加 12.5%）・販売先国・関税の比較表に数字が出ていた。
     直し：自社の商品（資料から登録）で、HS の上4桁がひな形の品目と違い、税率がひな形の値のままのときは、関税を「要確認」にする（元の値は v95proxy に控える）。
           米国は追加関税の説明も「要確認」の文に作り直す。「気をつけること」の中の「関税◯%」の文も外す。HS が同じ・HS ごとの値を出している層（衣料の米国・香港の酒）は今まで通り。
   No.482（中）輸送方法（航空／海上）に合わせて文言と SDS などの条件を出し分ける
     原因：① 規制の画面の「この商品と送り先で確かめる点」（v92o の tableHits）は輸送を「海上」と決め打ちで判定していた。
           ② 書類の画面（v85docFacts）は案件の輸送か、画面で選んだ輸送だけを見て、商品の登録（積み地「成田空港」・取引条件「FOB 成田空港」）を見ていなかった。
           ③ 価格の条件の「輸出港まで含む（FOB 相当・海上運賃と保険は含まない）」は輸送に関係なく海上運賃と書いていた。
     直し：輸送は「案件の輸送 → 書類の画面で選んだ輸送 → 商品の登録（積み地・取引条件の空港・航空）→ 海上」の順で1か所で決め（V95REG.mode）、
           規制の画面と書類の画面の両方で同じ輸送を使う。航空の商品では価格の条件の文言を「航空運賃」に。
   No.494（中）同じ規制項目について画面内で矛盾する説明を出さない
     原因：判断の表の r105（シンガポールの食品＝SFA の輸入ライセンス・必須）の HS に 2309（飼料）が入っていて、ペットフードにも「必須」が付いた。
           同じ表の r171 と r105 の注記は「ペットフードは SFA のライセンス不要（管轄は AVS）」。
     直し：シンガポール向けのペットフード（HS 2309.10、またはペット用品の 2309）には r105 を当てない。代わりに AVS の手続き（積荷ごとの CCP＝AVS の輸入許可・
           肉を含むときの衛生証明書と事前の承認）を、AVS の公式の頁（2026-10-19 更新・2026-11-17 に確かめた）を出どころに足す。
           必須の件数の食い違い（ひな形の表「入っていません」と、判断の表「必須 1件」）は rd_v95reg.js でそろえる（数え方は V95REG.reqOf）。
   No.508（中）ひな形の無いカテゴリーでも、調べ方と次の一歩を示す（中身は V95REG.steps。手続きの名前は、出どころのある判断の表の行だけを使う＝架空の手続きは作らない） */
var V95REG = { err: [], ver: "21.95-reg" };
(function () {
  "use strict";
  const W = window;
  const err = (k, e) => { try { V95REG.err.push(k + ": " + String((e && e.message) || e).slice(0, 160)); if (V95REG.err.length > 30) V95REG.err.shift(); } catch (x) { /* 無視 */ } };
  const lang = () => { try { const l = (typeof I18N !== "undefined" && I18N && I18N.lang) || "ja"; return /^en/.test(l) ? "en" : /^zh/.test(l) ? "zh" : /^es/.test(l) ? "es" : "ja"; } catch (e) { return "ja"; } };
  const M = (ja, en, zh, es) => { const l = lang(); return l === "en" ? en : l === "zh" ? (zh || en) : l === "es" ? (es || en) : ja; };
  V95REG.M = M;
  const ten = () => { try { return (typeof TEN !== "undefined" && TEN) ? TEN : null; } catch (e) { return null; } };
  const dd = () => { try { return (typeof D !== "undefined" && D) ? D : null; } catch (e) { return null; } };
  const digits = (s) => String(s == null ? "" : s).replace(/[^\d]/g, "");
  const dict = (rows) => { try { if (typeof I18N === "undefined" || !I18N || !I18N.dict) return; const DI = I18N.dict; ["en", "zh", "es"].forEach((l) => { if (!DI[l]) DI[l] = {}; });
    rows.forEach(([ja, en, zh, es]) => { if (DI.en[ja] == null) DI.en[ja] = en; if (DI.zh[ja] == null) DI.zh[ja] = zh || en; if (DI.es[ja] == null) DI.es[ja] = es || en; }); } catch (e) { err("dict", e); } };

  /* ══ No.477 関税の代理値 ══ */
  const TPLHS = { food: ["0902", "茶"], cosme: ["3304", "スキンケア"], parts: ["8482", "軸受"], daily: ["9617", "魔法瓶"], liquor: ["2206", "清酒"], apparel: ["6203", "綿のズボン"], car: ["8703", "乗用車"], medical: ["3005", "衛生材料"] };
  const own = (t) => !!t && (t.src === "upload" || t.src === "sample2");
  function ckOf(t, cat) {
    let ck = String(cat || (t && t.catKey) || "");
    if (!ck || ck === "custom") { try { ck = typeof catKeyOf === "function" ? catKeyOf(t && t.cat) : ""; } catch (e) { ck = ""; } }
    if (ck === "supp") { try { if (!(typeof RD2 !== "undefined" && RD2 && RD2.supp)) ck = "food"; } catch (e) { ck = "food"; } }
    return ck;
  }
  /* この商品の HS が、カテゴリーのひな形の品目と違うか（違えばひな形の税率は別の品目の値）
     決め D2（2026-11-17 大森さん）：HS が未登録の自社商品も、品名から HS を推定できない（または推定がひな形の品目と違う）ときは、ひな形の税率を出さない（noHs）。
       推定は v85docHsProv の品名からの4桁だけを使う（区分からの2桁は推定に数えない）。推定がひな形の品目と同じ4桁なら、今まで通り。 */
  function mis(t, cat) {
    try {
      if (!own(t)) return null;
      const hs = digits(t.hs);
      const ck = ckOf(t, cat), T = TPLHS[ck];
      if (!T) return null;
      if (hs.length < 4) {
        let est = "";
        try { const P = typeof v85docHsProv === "function" ? v85docHsProv(t) : null; if (P && digits(P.hs).length >= 4 && !/^区分/.test(String(P.why || ""))) est = digits(P.hs).slice(0, 4); } catch (e) { est = ""; }
        if (est && est === T[0]) return null;
        return { ck, tpl: T[0], nm: T[1], hs: "", noHs: true, est, hsTxt: est ? "未登録・品名からの推定 " + est : "未登録" };
      }
      if (hs.slice(0, 4) === T[0]) return null;
      return { ck, tpl: T[0], nm: T[1], hs, hsTxt: hs.slice(0, 4) + (hs.length >= 6 ? "." + hs.slice(4, 6) : "") };
    } catch (e) { err("mis", e); return null; }
  }
  /* 決め D3（2026-11-17 大森さん）：関税のかかる区分が税関の頁で決まっている国は、登録の HS（4桁以上）から「関税なし」と出す。
     区分に当たる・境目があいまいな HS（下の excl の類・項で始まるもの）は要確認のまま。
       シンガポール：酒類・たばこ製品・自動車・石油製品とバイオディーゼル混合油の4区分だけが関税・物品税の対象（それ以外は non-dutiable・GST はかかる）
         → 22類・24類・27類・87類と、アルコール・燃料を含みうる 2106（食品の調製品）・3302（香料の調製品）・3826（バイオディーゼル）を除く
       香港：自由港で輸出入に関税なし。物品税は酒類（アルコール 30% 超）・たばこ・炭化水素油・メチルアルコールの4種だけ
         → 22類・24類・27類・2905（メチルアルコールを含む項）と、アルコール・メタノール・燃料を含みうる 2106・3302・3814・3820・3824・3826 を除く */
  const DUTYFREE = {
    SG: { cc: "SG", excl: ["22", "24", "27", "87", "2106", "3302", "3826"],
      cats: ["酒類・たばこ製品・自動車・石油製品（バイオディーゼル混合油を含む）の4区分", "intoxicating liquors, tobacco products, motor vehicles and petroleum products (incl. biodiesel blends)"],
      tax: ["GST 9% はかかります", "GST of 9% still applies"],
      src: ["シンガポール税関『Duties and Dutiable Goods』（頁は 2026-03-09 更新・2026-11-17 確認）", "Singapore Customs, Duties and Dutiable Goods (updated 2026-03-09; checked 2026-11-17)"],
      u: "https://customs.gov.sg/businesses/valuation-duties-taxes-and-fees/duties-and-dutiable-goods/" },
    HK: { cc: "HK", excl: ["22", "24", "27", "2905", "2106", "3302", "3814", "3820", "3824", "3826"],
      cats: ["酒類（アルコール 30% 超）・たばこ・炭化水素油・メチルアルコールの4種（物品税）", "liquor (over 30% alcohol), tobacco, hydrocarbon oil and methyl alcohol (excise duty)"],
      tax: ["香港は自由港で、輸出入に関税はかかりません", "Hong Kong is a free port with no customs tariff on imports or exports"],
      src: ["香港税関『Cargo Clearance』（2026-11-17 確認）", "Hong Kong Customs and Excise Department, Cargo Clearance (checked 2026-11-17)"],
      u: "https://www.customs.gov.hk/en/cargo_clearance/index.html" }
  };
  function dutyFree(c, hs) {
    try {
      const cc = typeof v85docCC === "function" ? v85docCC(c) : "";
      const R = DUTYFREE[cc];
      hs = digits(hs);
      if (!R || hs.length < 4) return null;
      if (R.excl.some((p) => hs.indexOf(p) === 0)) return null;
      return R;
    } catch (e) { return null; }
  }
  V95REG.dutyFree = (c, hs) => { const R = dutyFree(c, hs); return R ? R.cc : ""; };
  V95REG.DUTYFREE = DUTYFREE;
  V95REG.mis = (t) => mis(t || ten());
  /* ひな形そのものの税率（regsFor の元の表 RD・RD2 から。層が手を入れる前の値） */
  function rawTpl(ck, c) {
    try {
      if (typeof CIDX !== "undefined" && CIDX[ck] !== undefined) { const r = (typeof RD !== "undefined" && RD) ? RD[c] : null; return r && r.d ? String(r.d[CIDX[ck]]) : "要確認"; }
      const R2 = (typeof RD2 !== "undefined" && RD2) ? RD2[ck] : null;
      return R2 ? String((R2.d && R2.d[c]) || "要確認") : "要確認";
    } catch (e) { return null; }
  }
  const isUS = (c) => { try { return typeof v54rIsUS === "function" ? !!v54rIsUS(c) : /アメリカ|米国/.test(String(c)); } catch (e) { return false; } };
  const RE_DUTY_SENT = /[^。]*関税[^。]*?\d+(?:\.\d+)?\s*%[^。]*。?/g;
  function fixOne(c, r, t, cat) {
    try {
      if (!r || typeof r !== "object" || r.v95proxy || r.v95own) return false;
      const m = mis(t, cat);
      if (!m) return false;
      if (r.v70mktHk) return false; // 香港の酒（度数から出した、この商品の値）
      const cur = String(r.dutyBase != null ? r.dutyBase : (r.duty == null ? "" : r.duty)).trim();
      if (!cur || /要確認/.test(cur) || cur === "—") return false;
      const cand = [rawTpl(m.ck, c)];
      try { if (typeof v68regInd === "function" && v68regInd(t) === "meddev") cand.push(rawTpl("medical", c)); } catch (e) { /* 無視 */ }
      if (cand.indexOf(cur) < 0) return false; // HS ごとの値を出す層が書いた値（衣料の米国など）はそのまま
      const keep = { duty: r.duty, dutyBase: r.dutyBase, dutyNote: r.dutyNote, dutyCell: r.dutyCell, warn: r.warn, tpl: m.tpl, nm: m.nm, hs: m.hsTxt, noHs: !!m.noHs };
      // 決め D3：シンガポール・香港は、登録の HS が関税のかかる区分に当たらなければ「関税なし（0%）」（この商品の HS から出した値）
      const F = m.noHs ? null : dutyFree(c, m.hs);
      if (F) {
        Object.defineProperty(r, "v95own", { value: Object.assign({ cc: F.cc }, keep), enumerable: false, configurable: true, writable: true });
        r.duty = "0%";
        if (typeof r.warn === "string" && r.warn.match(RE_DUTY_SENT)) { const w = r.warn.replace(RE_DUTY_SENT, "").trim(); r.warn = w || "関税は、この商品の HS（" + m.hsTxt + "）から判定しました（関税なし・税関の一覧から）。"; }
        return true;
      }
      Object.defineProperty(r, "v95proxy", { value: keep, enumerable: false, configurable: true, writable: true });
      r.duty = "要確認";
      if (r.dutyTpl != null) r.dutyTpl = "要確認";
      if (typeof r.warn === "string" && r.warn.match(RE_DUTY_SENT)) {
        const w = r.warn.replace(RE_DUTY_SENT, "").trim();
        r.warn = "この商品（HS " + m.hsTxt + "）の関税率は要確認です（カテゴリーのひな形の品目の税率は出していません）。" + (w ? w : "");
      }
      if (isUS(c)) {
        delete r.dutyCell; delete r.dutyNote; delete r.dutyAsOf;
        r.dutyBase = "要確認";
        try { delete r.__v54us; } catch (e) { /* 無視 */ }
        try { if (typeof v54rUsDuty === "function") v54rUsDuty(r, m.ck); } catch (e) { err("us", e); }
      }
      return true;
    } catch (e) { err("fix", e); return false; }
  }
  V95REG.fixOne = fixOne;
  let CTX = null; // tenantToD の中で、どの商品の表を作っているか
  if (typeof tenantToD === "function") {
    const __td95 = tenantToD;
    tenantToD = function (t) { const prev = CTX; CTX = t || null; try { return __td95.apply(this, arguments); } finally { CTX = prev; } };
  }
  if (typeof regsFor === "function") {
    const __rf95 = regsFor;
    regsFor = function (cat, targets) {
      const out = __rf95.apply(this, arguments);
      try {
        const t = CTX || ten();
        if (out && t && ckOf(t) === ckOf(t, cat)) Object.keys(out).forEach((c) => fixOne(c, out[c], t, cat));
      } catch (e) { err("regsFor", e); }
      return out;
    };
  }
  function fixD() {
    try { const d = dd(), t = ten(); if (!d || !d.regs || !t || d === (typeof PRODUCTS !== "undefined" && PRODUCTS && PRODUCTS[t.catKey])) return 0; let n = 0; Object.keys(d.regs).forEach((c) => { if (fixOne(c, d.regs[c], t, d.catKey)) n++; }); return n; } catch (e) { err("fixD", e); return 0; }
  }
  V95REG.fixD = fixD;
  if (typeof switchTen === "function") { const __sw95 = switchTen; switchTen = function () { const r = __sw95.apply(this, arguments); try { if (fixD()) { try { render(); } catch (x) { /* 無視 */ } } } catch (e) { err("sw", e); } return r; }; }
  if (typeof rReg === "function") { const __rr95 = rReg; rReg = function () { try { fixD(); } catch (e) { /* 無視 */ } return __rr95.apply(this, arguments); }; }
  try { fixD(); } catch (e) { /* 無視 */ }
  // 販売先国の要点の文（v92ct・v92r3b が「関税 要確認（別の品目の目安 0%）」と書き換える）：決め D3 で関税なしにした国は「関税 0%（関税なし）」に
  if (typeof ctyWhyLocal === "function") {
    const __cw95 = ctyWhyLocal;
    ctyWhyLocal = function (r) {
      let s = __cw95.apply(this, arguments);
      try {
        const c = r && r.facts && r.facts.c, d = dd();
        const x = c && d && d.regs && d.regs[c] ? d.regs[c].v95own : null;
        if (x && typeof s === "string") s = s.replace(/関税 要確認（別の品目の目安 [^）]*）/, "関税 0%（関税なし）").replace(/（別の品目〈[^〉]*〉の目安・要確認）/, "（関税なし）");
      } catch (e) { err("cw", e); }
      return s;
    };
  }

  /* ══ No.482 輸送の決め方を1か所に ══ */
  const RE_AIR = /空港|エアポート|airport|航空|空輸|エアカーゴ|air\s*(?:cargo|freight)|\bby\s+air\b|\bair\b|\b(?:NRT|HND|KIX|NGO|FUK|CTS|OKA)\b/i;
  const RE_COURIER = /クーリエ|国際宅配|courier|\bEMS\b|\bDHL\b|fedex|\bUPS\b/i;
  const RE_POST = /郵便|国際小包|\bpost(?:al)?\b/i;
  const RE_SEA = /海上|船便|本船|コンテナ|\bLCL\b|\bFCL\b|港|\bsea\b|\bocean\b|vessel|\bport\b/i;
  const MODE_NM = { sea: ["海上", "sea", "海运", "marítimo"], air: ["航空", "air", "空运", "aéreo"], courier: ["クーリエ", "courier", "快递", "mensajería"], post: ["郵便", "post", "邮政", "correo"] };
  V95REG.modeNm = (m) => { const x = MODE_NM[m] || MODE_NM.sea; return M(x[0], x[1], x[2], x[3]); };
  function judge1(s) { s = String(s == null ? "" : s); if (!s.trim()) return ""; if (RE_COURIER.test(s)) return "courier"; if (RE_POST.test(s)) return "post"; if (RE_AIR.test(s)) return "air"; if (RE_SEA.test(s)) return "sea"; return ""; }
  /* 商品の登録から読む輸送（輸送の欄 → 積み地 → 取引条件）。読めなければ null */
  function prodMode(t, d) {
    t = t || ten(); d = d || dd();
    try {
      const F = [];
      [["mode", "輸送"], ["transport", "輸送"], ["shipMode", "輸送"]].forEach(([k, nm]) => { [t, d].forEach((o) => { if (o && typeof o[k] === "string" && o[k]) F.push([o[k], nm]); }); });
      [["pol", "積み地"], ["term", "取引条件"]].forEach(([k, nm]) => { const v = (d && d[k]) || (t && t[k]) || ""; if (v) F.push([v, nm]); });
      for (const [v, nm] of F) { const m = judge1(v); if (m) return { m, from: nm, v: String(v) }; }
    } catch (e) { err("pmode", e); }
    return null;
  }
  V95REG.prodMode = prodMode;
  if (typeof v85docModeOf === "function") {
    const __mo95 = v85docModeOf;
    v85docModeOf = function (S) {
      try { if (!String((S && S.mode) || "")) { const P = prodMode(); if (P) return P.m; } } catch (e) { err("modeOf", e); }
      return __mo95.apply(this, arguments);
    };
  }
  /* いまの輸送（書類の画面と同じ順番）。案件の入力は読むだけ（空の案件を作らない） */
  function modeNow() {
    try {
      const t = ten();
      const key = typeof v85docCaseKey === "function" ? v85docCaseKey() : "_";
      const cs = t && t.v85docs && t.v85docs.cases ? t.v85docs.cases[key] : null;
      const S = typeof v85docShip === "function" ? v85docShip() : null;
      if (cs && cs.inp && cs.inp.mode) return { m: cs.inp.mode, from: "doc" };
      if (S && S.mode) return { m: v85docModeOf(S), from: "case" };
      const P = prodMode();
      if (P) return { m: P.m, from: "prod", by: P.from, v: P.v };
      return { m: "sea", from: "none" };
    } catch (e) { err("modeNow", e); return { m: "sea", from: "none" }; }
  }
  V95REG.mode = modeNow;
  /* ══ No.494 シンガポールのペットフード（SFA ではなく AVS） ══ */
  const RE_PETFOOD = /ペットフード|ドッグフード|キャットフード|犬用|猫用|pet\s*food|dog\s*food|cat\s*food/i;
  function petFood(hs) {
    hs = digits(hs);
    if (!/^2309/.test(hs)) return false;
    if (/^230910/.test(hs)) return true;
    try { const t = ten() || {}, d = dd() || {}; const cat = String(t.cat || d.cat || ""), ck = String(t.catKey || d.catKey || "");
      return cat === "ペット用品" || ck === "pet" || RE_PETFOOD.test([t.item, t.itemEn, d.item, d.itemEn].join(" ")); } catch (e) { return false; }
  }
  V95REG.petFood = petFood;
  const AVS_K = "SG_AVS_PF";
  const AVS_URL = "https://avs.nparks.gov.sg/businesses/commercial-importers-exporters/animal-feed/importing-pet-food/";
  const AVS_RULE = { id: "v95sgavs", k: [AVS_K], w: { h: ["2309"], d: ["SG"] }, lv: "required",
    c: "シンガポール向けのペットフード（管轄は AVS。SFA の輸入ライセンスは要らない）",
    is: "シンガポールの輸入者", ld: 0,
    n: "積荷ごとに貨物の通関許可（CCP）が要る（AVS の輸入許可を兼ねる。無い荷は留め置き・処分）。肉・肉製品を含むときは、輸出国の獣医当局の衛生証明書が要り、AVS の指定国（オーストラリア・カナダ・ニュージーランド・英国・米国）以外で作ったものは、製品と製造施設の事前の承認が要る。加熱処理したものは、出荷の前の自己申告で済む国の例に日本が挙がっている（BSE・口蹄疫の条件つき・要確認）。肉を含まないときは、製造者の宣誓書（肉を含まない・ペット用）・成分表・インボイス・パッキングリスト・B/L か AWB をそろえる。会社の登録は任意",
    s: "シンガポール国立公園庁 動物・獣医サービス（AVS）『Importing pet food』（頁は 2026-10-19 更新）／JETRO シンガポール ペットフード", u: AVS_URL, ok: "確認済み 2026-11-17" };
  try {
    if (typeof V85DOC_D !== "undefined" && V85DOC_D && Array.isArray(V85DOC_D.rules)) {
      if (!V85DOC_D.rules.some((r) => r && r.id === AVS_RULE.id)) V85DOC_D.rules.push(AVS_RULE);
      V85DOC_D.docs = V85DOC_D.docs || {};
      if (!V85DOC_D.docs[AVS_K]) V85DOC_D.docs[AVS_K] = ["シンガポール AVS の輸入の手続き（積荷ごとの CCP＝AVS の輸入許可）", "Singapore AVS import requirements (Cargo Clearance Permit for each consignment)", "importer", "external", 0];
    }
    if (typeof V85PRE !== "undefined" && V85PRE && typeof V85PRE.add === "function") V85PRE.add(AVS_K);
    if (typeof V85PRE_DESC !== "undefined" && V85PRE_DESC && !V85PRE_DESC[AVS_K]) V85PRE_DESC[AVS_K] = "シンガポールでペットフードを輸入するときの、輸入者の手続きです（管轄は AVS）。積荷ごとに CCP を取ります。肉を含むときは衛生証明書と事前の承認が要ります。";
  } catch (e) { err("avs", e); }
  if (typeof v85docRuleHit === "function") {
    const __rh95 = v85docRuleHit;
    v85docRuleHit = function (r, F) {
      try {
        // 規制の画面（v92o の tableHits）は輸送を「海上」と決め打ちしていた → 書類の画面と同じ輸送で判定する
        if (F && typeof F === "object" && !("ship" in F) && F.mode === "sea" && !F.__v95m) { F.__v95m = 1; F.mode = modeNow().m; }
        if (r && F && F.dest === "SG") {
          if (r.id === "r105" && petFood(F.hs)) return null;
          if (r.id === AVS_RULE.id && !petFood(F.hs)) return null;
        }
      } catch (e) { err("hit", e); }
      return __rh95.apply(this, arguments);
    };
  }
  /* 価格の条件の「FOB 相当・海上運賃と保険は含まない」：航空の商品では航空運賃と書く */
  const FOB_AIR = "輸出の空港まで含む（FOB 相当・航空運賃と保険は含まない）";
  try {
    if (typeof V83PX_INCL !== "undefined" && V83PX_INCL && V83PX_INCL.fob && !V83PX_INCL.fob.__v95) {
      const ja0 = V83PX_INCL.fob.ja;
      Object.defineProperty(V83PX_INCL.fob, "ja", { configurable: true, enumerable: true, get() { try { const P = prodMode(); return P && P.m === "air" ? FOB_AIR : ja0; } catch (e) { return ja0; } } });
      Object.defineProperty(V83PX_INCL.fob, "__v95", { value: 1, enumerable: false });
    }
  } catch (e) { err("incl", e); }

  /* ══ 規制の画面の数え方（No.494）と、調べ方と次の一歩（No.508）。画面に出すのは rd_v95reg.js ══ */
  // 判断の表（この商品と送り先で確かめる点）の行を、画面から読む
  V95REG.rowsOf = function (box) {
    const out = [];
    try {
      const pts = box && box.querySelector("[data-v92pts]");
      if (!pts) return out;
      pts.querySelectorAll("ul.v92o-ul > li").forEach((li) => {
        const lv = li.querySelector(":scope > .v92o-lv");
        if (!lv) return;
        const k = ["required", "conditional", "check", "ban"].find((x) => lv.classList.contains(x));
        if (!k) return;
        const b = li.querySelector(":scope > b");
        const why = li.querySelector(":scope > .v92o-tc");
        const who = [...li.querySelectorAll(".v92o-dt")].map((p) => p.textContent || "").find((s) => /発行・作る人|Issued/.test(s)) || "";
        const links = [...li.querySelectorAll("a[href^='https://']")].map((a) => ({ t: (a.textContent || "").trim(), u: a.getAttribute("href") }));
        let whys = [];
        try { if (why) { const tmp = document.createElement("div"); whys = String(why.innerHTML || "").split(/<br\s*\/?>/i).map((h) => { tmp.innerHTML = h; return (tmp.textContent || "").trim(); }).filter(Boolean); } } catch (x) { whys = []; }
        out.push({ lv: k, nm: (b && b.textContent || "").trim(), why: (why && why.textContent || "").trim(), whys, who: who.replace(/^[^：:]*[：:]/, "").replace(/\s*準備の目安.*$/, "").trim(), links });
      });
    } catch (e) { err("rows", e); }
    return out;
  };
  V95REG.reqOf = (box) => V95REG.rowsOf(box).filter((x) => x.lv === "required");
  // 英語の名前（輸入者への質問に使う）
  V95REG.enOf = function (ja) { try { const DD = (typeof V85DOC_D !== "undefined" && V85DOC_D && V85DOC_D.docs) || {}; const k = Object.keys(DD).find((x) => DD[x] && DD[x][0] === ja); return (k && DD[k][1]) || ja; } catch (e) { return ja; } };
  V95REG.noTpl = function (c) {
    try { const d = dd(); const r = d && d.regs ? d.regs[c] : null; return /ひな形は、アプリにまだありません|ひな形が、アプリにまだありません/.test(String((r && r.warn) || "")); } catch (e) { return false; }
  };
  V95REG.askText = function (c, rows) {
    const d = dd() || {}, t = ten() || {};
    let cn = c;
    try { const cc = typeof v85docCC === "function" ? v85docCC(c) : ""; if (cc && typeof Intl !== "undefined" && Intl.DisplayNames) cn = new Intl.DisplayNames(["en"], { type: "region" }).of(cc) || c; } catch (e) { cn = c; }
    const item = d.itemEn || t.itemEn || d.item || t.item || "our product";
    const hs = d.hs || t.hs || "";
    const L = (rows || []).filter((x) => x.lv !== "ban").slice(0, 6).map((x) => "  - " + V95REG.enOf(x.nm));
    const P = [
      "Dear importer,",
      "We are preparing to export \"" + item + "\"" + (hs ? " (HS " + hs + ")" : "") + " to " + cn + ".\nBefore shipping, could you please confirm the following for " + cn + "?\n" +
        "  1) Registrations, licences or notifications needed before sale (by you as the importer, or by us)\n" +
        "  2) Certifications or test reports required (and accepted testing laboratories)\n" +
        "  3) Labelling requirements (language and mandatory items)\n" +
        "  4) Documents needed for import clearance"
    ];
    if (L.length) P.push("In particular, we would like to know whether these apply:\n" + L.join("\n"));
    P.push("Thank you very much.");
    return P.join("\n\n");
  };

  dict([
    [AVS_RULE.c, "Pet food to Singapore (regulated by AVS; no SFA import licence needed)", "出口新加坡的宠物食品（主管机关为AVS，不需要SFA进口许可证）", "Alimento para mascotas a Singapur (regulado por AVS; no requiere licencia de importación de la SFA)"],
    ["シンガポール AVS の輸入の手続き（積荷ごとの CCP＝AVS の輸入許可）", "Singapore AVS import requirements (Cargo Clearance Permit for each consignment)", "新加坡AVS进口手续（每批货物的CCP＝AVS进口许可）", "Trámites de importación de AVS en Singapur (CCP por envío)"],
    ["シンガポールの輸入者", "Importer in Singapore", "新加坡进口商", "Importador en Singapur"],
    [FOB_AIR, "Includes delivery to the export airport (FOB equivalent; air freight and insurance not included)", "含至出口机场（相当于FOB，不含空运费和保险）", "Incluye la entrega en el aeropuerto de exportación (equivalente a FOB; sin flete aéreo ni seguro)"]
  ]);
})();
