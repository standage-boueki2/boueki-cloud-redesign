/* 22.01 deal（2026-11-22 第14回 UAT〔22.00.1〕の直し）：機能の中身（データ・数え方・判定）。見せ方は rd_v101deal.js
   No.609（高）STEP06「見積・条件（価格・数量・建値）を相手に出す」が押しても反応せず、AI バイヤーリストの会社が「商談・バイヤー」に入らない
     原因：①「商談・バイヤー」の一覧（土台 b30Collect）は、自社のバイヤー（TEN.myBuyers）・商談の記録・やりとりのスレッドだけを集める。
             AI バイヤーリスト（TEN.v71ob.runs[].leads）の会社は、送る（v71obSend）か、行を選んで「＋ 自社のバイヤーに入れる」（v71obToMy）まで入らない。
           ② バイヤーの画面の「選択中のバイヤー」（rd.js dbSummary の #rddbsel）は、送った相手（やりとりのスレッド）の一覧の選択しか映さない。
           ③ 現在地バー（rd_v94jny.js の閉じた関数 stepsNow）の STEP06 の4項目は、送ってスレッドができるまで1つも進まず、
             相手がいないときの行き先が「AIバイヤー開拓」の画面（すでにその画面にいると、カードが光るだけで窓も文字の変化も無い）。
     直し（この層）：
       ・取り決め window.v101addDealBuyer(ten, buyer)：AI バイヤーリストの会社（lead か lead の id）や {name, cty, biz…} を、送らずに商談の相手
         （自社のバイヤー＝「商談・バイヤー」の一覧に出る）に加える。送ったかどうかは、送った記録（やりとり・lead.sent・outreach）だけで決める。
       ・見積・条件の下書き（TEN.v101q[相手の id]）：価格・通貨・単位・数量・建値・場所・有効期限・支払・商流（直接／間接）・メモ。送らない。
       ・STEP06 の項目を6つに（実態どおり・下書きは「送った」に数えない）：①見積を出す相手を決める ②見積・条件の下書きを作る
         ③見積・条件を相手に出す（送信済み＝今までの判定：やりとりの状況が「見積提示」より先か、商談の記録の状況が見積提示・契約交渉・受注・取引中）
         ④商流を決める（今までの判定＋下書きで決めた商流） ⑤契約書を確かめる（今まで通り） ⑥受注する（今まで通り）
       ・STEP05 の「バイヤーに連絡する（営業メールを送る）」は、実際に送った記録があるときだけ ✓（前は、はじめの設定と同じく自社のバイヤーが
         1社でもいれば ✓＝送っていないのに「連絡した」）。はじめの設定の「バイヤーに連絡する」の注に「まだ送っていません」を書く。
   No.615（中）書類をつくるの規制の欄（土台 v56regFirstCard）：「香港　関税 0%　販売・出荷の前の手続き（未対応／全部） 0/1」
     「0%」は関税率、「0/1」は未対応の数／全部（0/1＝全部済み）で、STEP03 の記録を見ていない → 国ごとに「関税率（目安）」「規制の確かめ（STEP 03 と同じ数え方 n/m）」
       「販売・出荷の前の手続き 対応済み k/N」を見出しで分けて出す（V100FLOW.ctyState を使う＝現在地バー・規制の画面の箱と同じ数）。
   No.533 の副作用：カテゴリーを変えると STEP03 が下がる → 理由（確かめる項目が m0 → m1 に変わった・前の記録は消していない）を出す（判定はこの層・見せ方は rd）
   「成長度」：既存の aiLevel()（成長レベル・一人前 90%）をそのまま読む V101DEAL.grow()。新しい数え方は作らない。
   何度通っても同じ結果（データから毎回数え直す）。最後のエラーは window.V101DEAL.err、一覧は V101DEAL.errs。
   ── 22.01.1（2026-11-22 公開後の検証役 v1・v2・v3 の指摘）──
   S1（v3）・v2-10：寸法「不明」の商品で、登録した後も「次は 商品を登録」（商談・バイヤー・AIバイヤー開拓・AI商社マン・ホーム）
     → 足りないのが寸法・重量だけなら「寸法・重量を入れる（書類の画面で入れる・まだ分からないなら先へ進める）」と、行き先を書類をつくるの寸法・重量の欄に
       （v92coreSteps・ux32Setup・ux32Fill・現在地バーの STEP 01 の抜け）。「まだ分からない」を選んだら「次は」は先の手順へ（済みにはしない）
   S5（v3）：STEP06「商流を決める」「受注する」で見積の下書きの窓 → 商流の窓（相手ごと・TEN.v101route）・受注の窓へ（名前と行き先をそろえる）
   N16（v1）：STEP05 で商談の相手を「自社のバイヤー 2社」と呼ぶ → 「商談の相手 2社」
   N12（v1）・v2：見積の文面の書き出し（まだ連絡していない相手に「Thank you for your interest.」）・単価の桁（登録 4.80 → 4.8）・
     署名 [your name in English] → 初めての連絡の書き出し・登録の書き方の桁・buyer の v101sigText（【差出人の名前（英字）を入れてください】の形） */
(function () {
  "use strict";
  const W = window;
  if (W.V101DEAL && W.V101DEAL.__logic) return;
  const V = (W.V101DEAL = W.V101DEAL || {});
  V.__logic = 1;
  V.err = V.err || null;
  V.errs = V.errs || [];
  const err = (k, e) => { try { const s = k + ": " + String((e && (e.stack || e.message)) || e).slice(0, 400); V.err = s; V.errs.push(s); if (V.errs.length > 40) V.errs.shift(); } catch (x) { /* 記録だけ */ } };
  V.e = err;
  const lang = () => { try { const el = document.getElementById("lang"); const v = String((el && el.value) || (W.I18N && W.I18N.lang) || document.documentElement.lang || "ja"); return /^en/.test(v) ? "en" : /^zh/.test(v) ? "zh" : /^es/.test(v) ? "es" : "ja"; } catch (e) { return "ja"; } };
  const M = (ja, en, zh, es) => { const l = lang(); return l === "en" ? (en || ja) : l === "zh" ? (zh || en || ja) : l === "es" ? (es || en || ja) : ja; };
  const F = (s, o) => String(s).replace(/\{(\w+)\}/g, (m, k) => (o && o[k] != null ? String(o[k]) : m));
  V.M = M; V.F = F; V.lang = lang;
  const ten = () => { try { return typeof TEN !== "undefined" ? TEN : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const dd = () => { try { return typeof D !== "undefined" && D ? D : null; } catch (e) { return null; } }; // eslint-disable-line no-undef
  const fn = (n) => { try { return typeof W[n] === "function" ? W[n] : null; } catch (e) { return null; } };
  const save = () => { try { if (typeof saveTen === "function") saveTen(); } catch (e) { /* 無視 */ } }; // eslint-disable-line no-undef
  const norm = (s) => String(s || "").replace(/^\[見本\]\s*/, "").replace(/（見本）$/, "").toLowerCase().replace(/[\s.,・()（）]/g, "");
  V.ten = ten; V.save = save;

  /* ══════ 相手（商談の相手）の集め方 ══════ */
  function threadsOf(t) { try { return Object.values((t && t.dmThreads) || {}).filter((th) => th && Array.isArray(th.msgs) && th.msgs.length); } catch (e) { return []; } }
  function runsOf(t) { try { const S = t && t.v71ob; return (S && Array.isArray(S.runs)) ? S.runs : []; } catch (e) { return []; } }
  function leadIn(t, id) { for (const r of runsOf(t)) { const l = (r.leads || []).find((x) => x && x.id === id); if (l) return { r, l }; } return null; }
  function leadByMy(t, myId) { for (const r of runsOf(t)) { const l = (r.leads || []).find((x) => x && x.myId === myId); if (l) return { r, l }; } return null; }
  function myOf(t, id) { try { return (Array.isArray(t && t.myBuyers) ? t.myBuyers : []).find((b) => b && b.id === id) || null; } catch (e) { return null; } }
  V.leadIn = leadIn; V.myOf = myOf; V.runsOf = runsOf;
  // 送った記録（やりとりのスレッドに貴社からの送信・AI バイヤー開拓の送信・営業の送信の記録・STANDAGE のネットワークのつなぎ）
  function sentTo(t, id) {
    try {
      const th = t && t.dmThreads ? t.dmThreads[id] : null;
      if (th && Array.isArray(th.msgs) && th.msgs.some((m) => m && m.w === "me")) return true;
      const o = leadByMy(t, id);
      if (o && Array.isArray(o.l.sent) && o.l.sent.length) return true;
    } catch (e) { /* 下へ */ }
    return false;
  }
  function sentAny(t) {
    try {
      if (threadsOf(t).some((th) => th.msgs.some((m) => m && m.w === "me"))) return true;
      if (Array.isArray(t.outreach) && t.outreach.length) return true;
      if (Array.isArray(t.netConnects) && t.netConnects.length) return true;
      if (runsOf(t).some((r) => (r.leads || []).some((l) => l && Array.isArray(l.sent) && l.sent.length))) return true;
    } catch (e) { err("sentAny", e); }
    return false;
  }
  V.sentAny = sentAny;
  const ST_ORDER = { コンタクト中: 0, 商談中: 1, サンプル出荷: 2, 見積提示: 3, 契約交渉: 4, 取引中: 5, 失注: -1 };
  const stShort = (s) => (String(s || "").indexOf("コンタクト中") === 0 ? "コンタクト中" : String(s || "") || "コンタクト中");
  // 商談の相手：自社のバイヤー（AI のリストから入れた相手も）＋やりとりのスレッドだけの相手
  function partners(t) {
    t = t || ten();
    const out = [];
    if (!t) return out;
    try {
      const MB = Array.isArray(t.myBuyers) ? t.myBuyers : [];
      const Q = qStore(t, true);
      MB.forEach((b) => {
        if (!b || !b.id) return;
        const th = t.dmThreads ? t.dmThreads[b.id] : null;
        const o = leadByMy(t, b.id);
        out.push({ id: b.id, name: String(b.co || "").trim() || M("（名前未登録）", "(no name)"), cty: b.cty || (o && o.r.cty) || "", biz: b.biz || "", url: b.url || "", contact: b.contact || "",
          src: b.v71ob || (b.v101deal && b.v101deal.src === "ai") ? "ai" : "own", lead: o ? o.l.id : "", pts: o ? o.l.pts : null, rank: o ? o.l.rank : "",
          sent: sentTo(t, b.id), st: th ? stShort(th.status) : "", q: Q[b.id] || null, at: (b.v101deal && b.v101deal.at) || 0 });
      });
      threadsOf(t).forEach((th) => {
        if (out.some((p) => p.id === th.id)) return;
        out.push({ id: th.id, name: (th.cty || "") + M("の", " ") + (th.biz || M("バイヤー", "buyer")) + "（ID " + th.id + "）", cty: th.cty || "", biz: th.biz || "", src: "thread", sent: th.msgs.some((m) => m && m.w === "me"), st: stShort(th.status), q: Q[th.id] || null, at: 0 });
      });
    } catch (e) { err("partners", e); }
    return out;
  }
  V.partners = partners;
  // まだ商談の相手に入っていない、いちばん新しい AI バイヤーリストの会社
  function candidates(t) {
    t = t || ten();
    const out = [];
    try {
      const S = t && t.v71ob;
      const runs = runsOf(t);
      if (!runs.length) return out;
      const i = (S && S.cur >= 0 && S.cur < runs.length) ? S.cur : runs.length - 1;
      const r = runs[i];
      (r.leads || []).forEach((l) => { if (l && l.name && !(l.myId && myOf(t, l.myId))) out.push({ id: l.id, name: String(l.name).replace(/^\[見本\]\s*/, ""), cty: r.cty, biz: l.biz || "", pts: l.pts, rank: l.rank, smp: !!l.smp, verify: !!l.verify, url: l.url || "" }); });
      out.run = { cty: r.cty, n: (r.leads || []).length, at: r.at, how: r.how };
    } catch (e) { err("cands", e); }
    return out;
  }
  V.candidates = candidates;
  V.listInfo = function (t) { t = t || ten(); const runs = runsOf(t); if (!runs.length) return null; const S = t.v71ob; const i = (S && S.cur >= 0 && S.cur < runs.length) ? S.cur : runs.length - 1; const r = runs[i]; return { cty: r.cty, n: (r.leads || []).length, at: r.at, how: r.how, runs: runs.length }; };

  /* ══════ 取り決め：送らずに商談の相手に加える ══════ */
  function mark(b, src, lead, cty) { if (b && !b.v101deal) b.v101deal = { at: Date.now(), src: src || "own", lead: lead || "", cty: cty || "" }; }
  function addDealBuyer(t, buyer) {
    try {
      t = t || ten();
      if (!t || !buyer) return { ok: false, why: "none" };
      const cur = ten();
      const id = typeof buyer === "string" ? buyer : (buyer && buyer.id) || "";
      const o = id ? leadIn(t, id) : null;
      if (o) {
        const L = o.l, run = o.r;
        if (L.myId && myOf(t, L.myId)) { mark(myOf(t, L.myId), "ai", L.id, run.cty); save(); return { ok: true, id: L.myId, added: false, name: String(L.name || "").replace(/^\[見本\]\s*/, "") }; }
        let myId = "";
        if (t === cur && fn("v71obToMy")) myId = W.v71obToMy(L, run);
        if (!myId) { // 表示していない商品へ：v71obToMy と同じ形で入れる
          t.myBuyers = Array.isArray(t.myBuyers) ? t.myBuyers : [];
          const b = (fn("mybNew") ? W.mybNew() : { id: "MY-" + Date.now().toString(36).toUpperCase().slice(-5), co: "", cty: "", biz: "", ints: "", size: "", url: "", contact: "", memo: "", added: "" });
          let g = 0; while (t.myBuyers.some((x) => x && x.id === b.id) && g++ < 50) b.id = "MY-" + (Date.now() + g * 7919).toString(36).toUpperCase().slice(-5) + g.toString(36).toUpperCase();
          Object.assign(b, { co: String(L.name || "").replace(/^\[見本\]\s*/, "") + (L.smp ? "（見本）" : ""), cty: run.cty, biz: L.biz || "", size: L.size || "", url: L.url || "", contact: L.contact || "", memo: "AIバイヤー開拓：見込み " + (L.rank || "") + "（" + (L.pts || 0) + "点）・" + (L.why || "") });
          b.v71ob = 1;
          t.myBuyers.push(b); L.myId = b.id; myId = b.id;
        }
        const b = myOf(t, myId);
        mark(b, "ai", L.id, run.cty);
        save();
        return { ok: !!myId, id: myId, added: true, name: b ? b.co : L.name };
      }
      // AI のリストの外の会社（{name|co, cty, biz, url, contact}）
      const nm = String((buyer && (buyer.co || buyer.name)) || "").trim();
      if (!nm) return { ok: false, why: "name" };
      t.myBuyers = Array.isArray(t.myBuyers) ? t.myBuyers : [];
      const ex = t.myBuyers.find((b) => b && norm(b.co) === norm(nm) && (!buyer.cty || !b.cty || b.cty === buyer.cty));
      if (ex) { mark(ex, "own"); save(); return { ok: true, id: ex.id, added: false, name: ex.co }; }
      const b = (fn("mybNew") ? W.mybNew() : { id: "MY-" + Date.now().toString(36).toUpperCase().slice(-5), co: "", cty: "", biz: "", ints: "", size: "", url: "", contact: "", memo: "", added: "" });
      Object.assign(b, { co: nm, cty: buyer.cty || "", biz: buyer.biz || "", url: buyer.url || "", contact: buyer.contact || "" });
      mark(b, "own");
      t.myBuyers.push(b);
      save();
      return { ok: true, id: b.id, added: true, name: nm };
    } catch (e) { err("addDealBuyer", e); return { ok: false, why: "error" }; }
  }
  W.v101addDealBuyer = addDealBuyer;
  V.add = addDealBuyer;
  // 前からある「＋ 自社のバイヤーに入れる」・送ったとき（どちらも v71obToMy）で入った相手にも、商談の相手の印を付ける（送ったかは送った記録で決める）
  if (fn("v71obToMy") && !W.v71obToMy.__v101deal) {
    const __tm = W.v71obToMy;
    const g = function (L, run) {
      const id = __tm.apply(this, arguments);
      try { if (id) mark(myOf(ten(), id), "ai", L && L.id, run && run.cty); } catch (e) { err("toMy", e); }
      return id;
    };
    g.__v101deal = 1;
    W.v71obToMy = g;
  }

  /* ══════ 見積・条件の下書き（送らない） ══════ */
  function qStore(t, ro) { t = t || ten(); if (!t) return {}; if (!t.v101q || typeof t.v101q !== "object") { if (ro) return {}; t.v101q = {}; } return t.v101q; }
  V.qStore = qStore;
  const INC = ["EXW", "FCA", "FAS", "FOB", "CFR", "CIF", "CPT", "CIP", "DAP", "DPU", "DDP"];
  V.INC = INC;
  const codeOf = (s) => { const m = String(s || "").toUpperCase().match(/\b(EXW|FCA|FAS|FOB|CFR|CIF|CPT|CIP|DAP|DPU|DDP)\b/); return m ? m[1] : ""; };
  const PORT_EN = { 東京港: "Tokyo", 横浜港: "Yokohama", 大阪港: "Osaka", 神戸港: "Kobe", 名古屋港: "Nagoya", 博多港: "Hakata", 清水港: "Shimizu", 門司港: "Moji", 北九州港: "Kitakyushu", 成田空港: "Narita Airport", 羽田空港: "Haneda Airport", 関西空港: "Kansai Airport", 関西国際空港: "Kansai Airport", 中部国際空港: "Chubu Centrair Airport", 新潟港: "Niigata", 仙台港: "Sendai", 苫小牧港: "Tomakomai", 那覇港: "Naha" };
  const UNIT_EN = { 個: "pcs", 本: "bottles", 箱: "boxes", 袋: "bags", セット: "sets", 枚: "pcs", ケース: "cases", 台: "units", 足: "pairs", 缶: "cans", 瓶: "bottles", kg: "kg", 組: "sets", 冊: "copies", 包: "packs", パック: "packs" };
  const PAY_EN = [[/前払.*100|100.*前払/, "T/T 100% in advance"], [/前払/, "T/T in advance"], [/L\/?C|信用状/, "L/C at sight"], [/後払/, "T/T after shipment"]];
  V.portEn = (p) => { p = String(p || "").trim(); if (!p) return ""; if (!/[^\x00-\x7F]/.test(p)) return p; return PORT_EN[p] || PORT_EN[p.replace(/\s/g, "")] || ""; };
  V.unitEn = (u) => { u = String(u || "").trim(); if (!u) return "units"; if (!/[^\x00-\x7F]/.test(u)) return u; return UNIT_EN[u] || "units"; };
  V.payEn = (s) => { s = String(s || ""); if (!s) return ""; if (!/[^\x00-\x7F]/.test(s)) return s; const h = PAY_EN.find((x) => x[0].test(s)); return h ? h[1] : ""; };
  const curOf = (s) => { s = String(s || ""); return /US\$|USD|＄|\$/.test(s) ? "USD" : /円|¥|￥|JPY/.test(s) ? "JPY" : /€|EUR/.test(s) ? "EUR" : /CNY|元|RMB/.test(s) ? "CNY" : /HK\$|HKD/.test(s) ? "HKD" : /S\$|SGD/.test(s) ? "SGD" : ""; };
  const numOf = (s) => { const m = String(s || "").replace(/[,，]/g, "").match(/(\d+(?:\.\d+)?)/); return m ? +m[1] : null; };
  // 登録の文字（「US$4.80」）から、数字を書いてあるとおりの桁で取り出す（数 n と同じ値のときだけ。違えば n）
  const numStr = (s, n) => { const m = String(s == null ? "" : s).replace(/[,，]/g, "").match(/(\d+(?:\.\d+)?)/); if (m && (n == null || +m[1] === +n)) return m[1]; return n != null ? String(n) : (m ? m[1] : ""); };
  V.numStr = numStr;
  const ymd = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  // 下書きの既定（商品の価格表・取引条件・仕出港・支払・価格の有効期限から。分からない所は空のまま＝推し量らない）
  function qDefaults(t) {
    t = t || ten() || {};
    const d = (dd() && dd() === (typeof D !== "undefined" ? D : null) && t === ten()) ? dd() : t; // eslint-disable-line no-undef
    const o = { price: "", cur: "", unit: "", qty: "", term: "", place: "", placeEn: "", valid: "", validWhy: "", pay: "", payEn: "", src: [] };
    try {
      let S = null; try { S = fn("v98pxShape") ? W.v98pxShape(t.priceCols, t.priceRows) : null; } catch (e) { S = null; }
      const b = S && Array.isArray(S.bands) && S.bands.length ? S.bands.slice().sort((x, y) => x.lo - y.lo)[0] : null;
      // 22.01.1 N12：単価は登録の書き方の桁のまま（「US$4.80」→「4.80」。数にすると 4.8 になっていた）
      if (b) { o.qty = String(b.lo); o.unit = String(b.u || ""); o.price = numStr(b.v, b.n); o.cur = curOf(b.v) || curOf(b.cur) || ""; o.src.push(M("価格表のいちばん小さい数量の帯", "smallest band of the price list")); }
      else if (Array.isArray(t.priceRows) && t.priceRows.length) {
        const r = t.priceRows.find((x) => Array.isArray(x) && x.some((c) => numOf(c) != null && curOf(c)));
        if (r) { const pc = r.find((c) => curOf(c) && numOf(c) != null); o.price = numStr(pc, numOf(pc)); o.cur = curOf(pc); o.src.push(M("価格表の1行目", "first row of the price list")); }
      }
      if (!o.qty) { const mq = String(t.moq || d.moq || ""); const n = numOf(mq); if (n) { o.qty = String(n); o.unit = o.unit || mq.replace(/[\d,，.\s]/g, "").replace(/以上|〜|~/g, "") || ""; } }
      o.term = codeOf(t.term || d.term || "");
      o.place = String(t.pol || d.pol || "").trim();
      o.placeEn = V.portEn(o.place);
      o.pay = String(t.pay || d.pay || "").trim();
      o.payEn = V.payEn(o.pay);
      try { if (fn("v83pxState")) { const X = W.v83pxState(t); if (X && X.until) { o.valid = X.until; o.validWhy = M("商品の価格の有効期限", "price list validity"); } } } catch (e) { /* 下へ */ }
      if (!o.valid) { const x = new Date(); x.setDate(x.getDate() + 30); o.valid = ymd(x); o.validWhy = M("今日から30日（価格の有効期限が未設定のため）", "30 days from today (no price list validity set)"); }
    } catch (e) { err("qDefaults", e); }
    return o;
  }
  V.qDefaults = qDefaults;
  function qSave(t, pid, data) {
    try {
      t = t || ten(); if (!t || !pid) return null;
      const Q = qStore(t);
      const p = partners(t).find((x) => x.id === pid) || {};
      const prev = Q[pid] || {};
      const keep = ["price", "cur", "unit", "qty", "term", "place", "placeEn", "valid", "pay", "payEn", "route", "note"];
      const x = Object.assign({}, prev, { pid, name: p.name || prev.name || "", cty: p.cty || prev.cty || "", item: t.item || "", itemEn: t.itemEn || "" });
      keep.forEach((k) => { if (data && data[k] !== undefined) x[k] = String(data[k] == null ? "" : data[k]).slice(0, 300); });
      x.at = prev.at || Date.now(); x.upd = Date.now();
      Q[pid] = x;
      // 22.01.1 S5：下書きの中で決めた商流は、相手ごとの商流（TEN.v101route）にもそろえる
      if (data && data.route !== undefined) rSet(t, pid, data.route, true);
      save();
      return x;
    } catch (e) { err("qSave", e); return null; }
  }
  /* 22.01.1 S5：商流（直接／間接）は相手ごとに TEN.v101route[相手の id] に控える（下書きが無くても決められる・送らない）。
     下書きがある相手は、下書きの商流にも同じ値を入れる（STEP06 の「商流」・下書きの窓・商流の窓で同じ値） */
  function rStore(t, ro) { t = t || ten(); if (!t) return {}; if (!t.v101route || typeof t.v101route !== "object") { if (ro) return {}; t.v101route = {}; } return t.v101route; }
  function rSet(t, pid, route, noSave) {
    try {
      t = t || ten(); if (!t || !pid) return false;
      const v = route === "direct" || route === "indirect" ? route : "";
      const R = rStore(t);
      if (v) R[pid] = v; else delete R[pid];
      const Q = qStore(t, true); if (Q[pid]) Q[pid].route = v;
      if (!noSave) save();
      return true;
    } catch (e) { err("rSet", e); return false; }
  }
  V.rStore = rStore; V.rSet = rSet;
  V.routeOf = (t, pid) => { t = t || ten(); const Q = qStore(t, true); const R = rStore(t, true); return (Q[pid] && Q[pid].route) || R[pid] || ""; };
  function qDel(t, pid) { try { t = t || ten(); const Q = qStore(t, true); if (Q[pid]) { delete Q[pid]; save(); return true; } } catch (e) { err("qDel", e); } return false; }
  V.qSave = qSave; V.qDel = qDel;
  /* 22.01.1 N12：空の所の印は、AI バイヤー開拓の文面の署名（buyer の v101sigText・22.01 の決め L3 の推奨 a）と同じ【…を入れてください】の形（画面の言語で）。
     buyer の送る前・コピーの前の関所（v101phOf）も、この形を「残っている」と見つける */
  const BL = { item: ["英文の商品名", "Product name in English"], cur: ["通貨", "Currency"], price: ["単価", "Unit price"], qty: ["数量", "Quantity"], term: ["建値（インコタームズ）", "Incoterms"], place: ["建値の場所（英語）", "Named place (English)"], valid: ["有効期限", "Validity date"], pay: ["支払条件（英語）", "Payment terms (English)"], name: ["差出人の名前（英字）", "Sender name (Latin letters)"], co: ["会社名（英語）", "Company name (English)"], mail: ["差出人のメール", "Sender email"] };
  const blankOf = (k) => { const x = BL[k] || [k, k]; return lang() === "ja" ? "【" + x[0] + "を入れてください】" : "【" + x[1] + " — please fill in】"; };
  const BLANK_RE = /【[^】\n]{0,60}(?:入れてください|消してください|please fill in|delete this line)[^】\n]{0,30}】/g;
  V.blankOf = blankOf;
  // 文面に残っている【…】の名前（「差出人の名前（英字）」など）
  V.leftOf = function (txt) { const out = []; (String(txt || "").match(BLANK_RE) || []).forEach((x) => { const n = x.replace(/^【|】$/g, "").replace(/を入れてください.*$/, "").replace(/\s*—\s*please fill in.*$/i, "").replace(/（要らなければ.*$/, "").trim(); if (n && out.indexOf(n) < 0) out.push(n); }); return out; };
  // 残っている仮の値・【…】（buyer の関所があればそれと同じ判定）
  V.phOf = function (txt) { try { if (fn("v101phOf")) { const r = W.v101phOf(txt); if (r) return r; } } catch (e) { /* 下へ */ } const m = String(txt || "").match(BLANK_RE); return m ? m[0] : ""; };
  // 足りない所（下書きは保存できるが、相手に出す前に埋める所）
  V.qMissing = function (q, t) {
    const miss = [];
    if (!q) return miss;
    t = t || ten() || {};
    if (!String(t.itemEn || q.itemEn || "").trim()) miss.push(M("英文の商品名", "product name in English"));
    if (!(numOf(q.price) > 0)) miss.push(M("単価", "unit price"));
    if (!q.cur) miss.push(M("通貨", "currency"));
    if (!(numOf(q.qty) > 0)) miss.push(M("数量", "quantity"));
    if (!q.term) miss.push(M("建値（インコタームズ）", "Incoterms"));
    if (!q.placeEn) miss.push(M("建値の場所（英語）", "named place (English)"));
    if (!q.valid) miss.push(M("有効期限", "validity"));
    if (!q.payEn) miss.push(M("支払条件（英語）", "payment terms (English)"));
    if (!String(t.coEn || (t.corp && t.corp.en) || "").trim()) miss.push(M("英文の会社名", "company name in English"));
    const sm = V.leftOf(sigLines().join("\n"));
    if (sm.length) miss.push(M("署名の", "signature: ") + sm.join(M("・", ", ")) + M("（文面の【】の所。AIバイヤー開拓の「✍ 署名」で入れると入ります）", " (the 【】 parts — fill them in “✍ Signature”)"));
    return miss;
  };
  // 相手とのやりとりの状態（文面の書き出しを変える）：送ったか・返事が来たか
  function contactOf(t, pid) {
    try {
      const th = t && t.dmThreads ? t.dmThreads[pid] : null;
      const reply = !!(th && Array.isArray(th.msgs) && th.msgs.some((m) => m && m.w === "by"));
      return { sent: sentTo(t, pid), reply };
    } catch (e) { return { sent: false, reply: false }; }
  }
  V.contactOf = contactOf;
  /* 相手に出す文面（英語・コピー用）。原産地・認証などの事実は書かない（入力にない断定をしない）。空の所は【…】のまま＝送る前に埋める。
     22.01.1 N12：まだ連絡していない相手には、初めての連絡の書き出し（前は「Thank you for your interest.」＝問い合わせへの返事の書き方）。
       送ったが返事がまだ → 前の連絡に続ける書き出し。返事が来た → 返事へのお礼。 */
  V.qTextRaw = function (q, t) {
    t = t || ten() || {};
    if (!q) return "";
    const nm = String(q.name || "").replace(/（見本）$/, "");
    const item = t.itemEn || q.itemEn || "";
    const val = (s, k) => (String(s == null ? "" : s).trim() ? String(s).trim() : blankOf(k));
    const u = V.unitEn(q.unit);
    // 単数（前は「boxes」→「boxe」・「pcs」→「pc」になった）
    const one = (x) => ({ pcs: "piece", boxes: "box", bottles: "bottle", bags: "bag", sets: "set", cases: "case", units: "unit", pairs: "pair", cans: "can", copies: "copy", packs: "pack" })[x] || x.replace(/(?<!s)s$/, "");
    const c = contactOf(t, q.pid);
    const open = c.reply ? ["Thank you for your reply. Please find our quotation below."]
      : c.sent ? ["Following up on my earlier message, please find our quotation below."]
        : ["I am reaching out to introduce our product, " + val(item, "item") + ", and to share our quotation for your consideration.", "Please feel free to contact me if you have any questions about the product or the terms below."];
    return ["Subject: Quotation – " + val(item, "item"),
      "",
      "Dear " + (nm || "Sir or Madam") + " team,",
      "",
      ...open,
      "",
      "- Product: " + val(item, "item"),
      "- Unit price: " + val(q.cur, "cur") + " " + val(q.price, "price") + " per " + one(u),
      "- Quantity: " + val(q.qty, "qty") + " " + u,
      "- Incoterms: " + val(q.term, "term") + " " + val(q.placeEn, "place"),
      "- Validity: until " + val(q.valid, "valid"),
      "- Payment: " + val(q.payEn, "pay"),
      "",
      "This quotation is subject to final confirmation of the order details.",
      "",
      "Best regards,"].concat(sigLines()).join("\n");
  };
  /* 22.01.1（まとめ役の頼み）：buyer の取り決め window.v101unkFix(文, 言語) を通す（「不明」と答えた事柄〔適合・アスベスト不使用・原産地など〕の断定を外し、
     外した所に「to be confirmed」などを1回だけ書く）。ここで作る文面だけに当てる（利用者が欄で直した文は作り直さない・書き換えない）。無ければ今のまま */
  V.qText = function (q, t) {
    let txt = V.qTextRaw(q, t);
    try { if (typeof W.v101unkFix === "function") { const x = W.v101unkFix(txt, "English"); if (typeof x === "string" && x.trim()) txt = x; } } catch (e) { err("unkFix", e); }
    return txt;
  };
  /* 署名：22.01.1 N12 で、AI バイヤー開拓の文面と同じ署名（buyer の取り決め window.v101sigText()＝登録済みの値と【差出人の名前（英字）を入れてください】の形）に。
     buyer の層が無いときだけ、同じ形をここで作る（見本の値は入れない） */
  const ascii = (s) => !!String(s || "").trim() && !/[^\x00-\x7F]/.test(String(s));
  function sig() { try { return fn("v79obSig") ? (W.v79obSig() || {}) : {}; } catch (e) { return {}; } }
  function sigLines() {
    try { if (fn("v101sigText")) { const s = String(W.v101sigText() || "").split("\n").map((x) => x.trim()).filter(Boolean); if (s.length) return s; } } catch (e) { err("sigText", e); }
    const g = sig(), t = ten() || {};
    const co = t.coEn || (t.corp && t.corp.en) || "";
    const mail = (String(g.mail || "").match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/) || [""])[0];
    return [String(g.name || "").trim() || blankOf("name"), ascii(g.title) ? String(g.title).trim() : "", ascii(co) ? co : (ascii(g.co) ? g.co : blankOf("co")), mail || blankOf("mail"), ascii(g.tel) ? String(g.tel).trim() : ""].filter((x) => x !== "");
  }
  V.sigLines = sigLines;
  V.sigMiss = function () { return V.leftOf(sigLines().join("\n")); };

  /* ══════ STEP05・STEP06 の数え方（現在地バーの R.S[4]・R.S[5] を差し替える。rd が RDX._jny と RDX.jnyNow に掛ける） ══════ */
  function ordOf(th) { const o = ST_ORDER[stShort(th && th.status)]; return o == null ? 0 : o; }
  function step6(t) {
    t = t || ten() || {};
    const P = partners(t);
    const TH = threadsOf(t);
    const fbx = Array.isArray(t.fbx) ? t.fbx : [];
    const Q = qStore(t, true);
    const drafts = Object.keys(Q).map((k) => Q[k]).filter((q) => q && q.pid);
    const quoteSent = TH.some((th) => ordOf(th) >= 3) || fbx.some((f) => f && /見積提示|契約交渉|受注|取引中/.test(String(f.st || "")));
    const tcs = (t.v75tc && t.v75tc.cases) || {};
    const routeCase = Object.keys(tcs).some((k) => tcs[k] && tcs[k].route);
    // 22.01.1 S5：下書きの商流に加えて、商流の窓で決めた相手ごとの商流（TEN.v101route）も（いまの商談の相手の分だけ）
    const RT = rStore(t, true);
    const routeDraft = drafts.find((q) => q.route === "direct" || q.route === "indirect") || (() => { const k = Object.keys(RT).find((id) => (RT[id] === "direct" || RT[id] === "indirect") && P.some((p) => p.id === id)); return k ? { pid: k, route: RT[k] } : null; })();
    const docs = (t.legal && Array.isArray(t.legal.docs)) ? t.legal.docs : [];
    const legal = docs.some((d) => d && d.rv);
    const won = TH.some((th) => stShort(th.status) === "取引中") || fbx.some((f) => f && /受注|取引中/.test(String(f.st || "")));
    const nP = P.length, nS = P.filter((p) => p.sent).length, nD = drafts.length;
    const cands = candidates(t);
    const pickGo = { k: "db", find: ["選択中のバイヤー", "AIバイヤー開拓"], act: "v101dealPick" };
    const qGo = { k: "deal", find: ["見積・条件の下書き", "バイヤー一覧"], act: "v101dealQuote" };
    /* 22.01.1 S5：項目の名前と行き先をそろえる（前は「商流を決める」「受注する」も見積の下書きの窓が開いた）
       ・商流を決める → 相手に連絡して案件ができていれば、その案件（案件の商流の画面が正）。まだなら「商流を決める」の窓（相手ごと・送らない）
       ・受注する → 「受注する」の窓（受注とは何か・いまの状態・受注したら「商談を記録する」で状況を「取引中」に） */
    const best = (() => { let b = null, bo = -2, bt = 0; TH.forEach((th) => { const o = ordOf(th), at = +th.statusAt || 0; if (o > bo || (o === bo && at > bt)) { b = th; bo = o; bt = at; } }); return b; })();
    const caseKey = (th) => { try { const TS = typeof TENS !== "undefined" && Array.isArray(TENS) ? TENS : []; return TS.indexOf(t) + "|" + th.id; } catch (e) { return "-1|" + th.id; } }; // eslint-disable-line no-undef
    const rGo = best ? { k: "case", key: caseKey(best), find: ["商流", "見積", "やりとり"] } : { k: "deal", find: ["見積を出す相手と下書き", "バイヤー一覧"], act: "v101dealRoute" };
    const wGo = { k: "deal", find: ["見積を出す相手と下書き", "商談の記録", "バイヤー一覧"], act: "v101dealWon" };
    const ST = (s) => "〔" + s + "〕";
    const it = [
      { k: "pick", t: M("見積を出す相手を決める（AIバイヤーリスト・自社のバイヤーから・送りません）", "Choose who to quote (from the AI buyer list or your buyers — nothing is sent)") + ST(nP ? F(M("決めた {n}社（うち送った {s}社）", "{n} chosen ({s} contacted)"), { n: nP, s: nS }) : (cands.length ? F(M("まだ・AIバイヤーリストに {n}社", "not yet — {n} in the AI buyer list"), { n: cands.length }) : M("まだ・先に AIバイヤーリストを作る", "not yet — make the AI buyer list first"))),
        ok: nP > 0, st: nP ? "done" : "none", go: pickGo, v101: 1 },
      { k: "draft", t: M("見積・条件の下書きを作る（価格・数量・建値・有効期限）", "Draft the quote (price, quantity, Incoterms, validity)") + ST(nD ? F(M("下書き済み {n}件・送っていません", "{n} drafted — not sent"), { n: nD }) : quoteSent ? M("送信済みの記録あり", "sent (recorded)") : M("まだ", "not yet")),
        ok: nD > 0 || quoteSent, st: nD ? "draft" : quoteSent ? "sent" : "none", go: qGo, v101: 1 },
      { k: "send", t: M("見積・条件を相手に出す（送信済み）", "Send the quote to the buyer (sent)") + ST(quoteSent ? M("送信済み（状況が見積提示より先）", "sent (status: quote or later)") : nD ? F(M("まだ送っていません・下書き {n}件", "not sent yet — {n} draft(s)"), { n: nD }) : M("まだ", "not yet")),
        ok: quoteSent, st: quoteSent ? "sent" : nD ? "draft" : "none", go: qGo, v101: 1 },
      { k: "route", t: M("商流（直接貿易／間接貿易）を決める", "Decide the trade route (direct / indirect)") + ST(routeCase ? M("決めた（案件で）", "decided (in the deal)") : routeDraft ? F(M("決めた：{r}（送る前の相手ごと）", "decided: {r} (per buyer, before sending)"), { r: routeDraft.route === "direct" ? M("直接貿易", "direct") : M("間接貿易", "indirect") }) : M("まだ", "not yet")),
        ok: routeCase || !!routeDraft, st: routeCase || routeDraft ? "done" : "none", go: rGo, v101: 1 },
      { k: "legal", t: (docs.length ? F(M("契約書をAIで確かめる（{n}件）", "Check the contract with AI ({n})"), { n: docs.length }) : M("契約書（売買契約・NDA など）を確かめる", "Check the contract (sales contract, NDA, etc.)")) + ST(legal ? M("AIで確かめた", "checked by AI") : M("まだ", "not yet")),
        ok: legal, st: legal ? "done" : "none", go: { k: "legal", find: ["契約書"] }, v101: 1 },
      { k: "won", t: M("受注する（状況が「取引中」）", "Win the order (status “In business”)") + ST(won ? M("受注", "won") : M("まだ", "not yet")),
        ok: won, st: won ? "done" : "none", go: wGo, v101: 1 },
    ];
    const n = it.filter((x) => x.ok).length;
    return {
      no: 6, nm: "見積・契約", sh: "契約", ic: "doc", it, n, m: it.length, pct: Math.round((n / it.length) * 100), core: !!quoteSent, unit: "項目", v101: 1,
      nP, nS, nD, quoteSent,
      note: M("① 相手を決める（AIバイヤーリストの「＋ 商談の相手に加える」・送りません）② 見積・条件の下書きを作る（価格・数量・建値・有効期限）③ 相手に出す（送ったら「商談の記録」で状況を「見積提示」に）④ 商流を決める ⑤ 契約書をAIで確かめる ⑥ 受注（状況が「取引中」）。下書きは「送った」に数えません。",
        "(1) Choose the buyer (“+ Add as deal partner” in the AI buyer list — nothing is sent) (2) Draft the quote (3) Send it (after sending, record the deal as “Quote sent”) (4) Decide the trade route (5) Check the contract with AI (6) Win the order. Drafts are not counted as sent.",
        "① 选定对象（AI买家名单中的“＋加为商谈对象”・不发送）② 起草报价 ③ 发出（发出后在“商谈记录”中改为“已报价”）④ 决定商流 ⑤ 用AI检查合同 ⑥ 成交。草稿不算已发送。",
        "(1) Elegir comprador (2) Borrador de cotización (3) Enviarla (4) Decidir la ruta comercial (5) Revisar el contrato con IA (6) Ganar el pedido. Los borradores no cuentan como enviados."),
    };
  }
  V.step6 = step6;
  // STEP05 の「連絡する」：実際に送った記録があるときだけ ✓（自社のバイヤーに入れただけでは ✓ にしない）
  function fix5(s5, t) {
    t = t || ten() || {};
    if (!s5 || !Array.isArray(s5.it)) return s5;
    try {
      const sent = sentAny(t);
      const nP = partners(t).filter((p) => !p.sent).length;
      const x = s5.it.find((y) => y && (y.v101k === "contact" || /^バイヤーに連絡/.test(String(y.t || ""))));
      if (x) {
        x.v101k = "contact";
        x.ok = sent;
        x.t = sent ? M("バイヤーに連絡した（営業メールを送った）", "Contacted buyers (sent a first e-mail)") : (nP ? F(M("バイヤーに連絡する（営業メールを送る）〔まだ送っていません・商談の相手 {n}社は送る前〕", "Contact buyers (send a first e-mail) [not sent yet — {n} partner(s) waiting]"), { n: nP }) : M("バイヤーに連絡する（営業メールを送る）", "Contact buyers (send a first e-mail)"));
        if (!x.go || !x.go.v101) x.go = { k: "db", find: ["AIバイヤー開拓", "選んだ"], v101: 1 };
      }
      // 22.01.1 N16：1つ目の項目「バイヤー候補を探した（AIバイヤー開拓 N回・自社のバイヤー N社）」→ 商談の相手と呼ぶ（STEP06・商談・バイヤー・選択中のバイヤーと同じ呼び名・同じ数）
      const f = s5.it.find((y) => y && (y.v101k === "find" || /^バイヤー候補を探/.test(String(y.t || ""))));
      if (f) {
        f.v101k = "find";
        const nAll = partners(t).length, runs = runsOf(t).length;
        if (f.ok || runs || nAll) f.t = F(M("バイヤー候補を探した（AIバイヤー開拓 {r}回・商談の相手 {n}社）", "Found buyer candidates (AI buyer search {r}× — {n} deal partner(s))"), { r: runs, n: nAll });
      }
      s5.n = s5.it.filter((y) => y.ok).length; s5.m = s5.it.length; s5.pct = s5.m ? Math.round((s5.n / s5.m) * 100) : 0;
      s5.core = sent;
      s5.v101 = 1;
    } catch (e) { err("fix5", e); }
    return s5;
  }
  V.fix5 = fix5;
  // R（現在地バーの7ステップ）に STEP05・STEP06 を当てはめる。いまここ・抜け・次の一手は rd_v94jny と同じ手順で数え直す
  function recompute(R) {
    const S = R.S;
    let now = 0; S.forEach((s, i) => { if (s.core) now = i; });
    if (S[now].core && S[now].pct >= 100 && now < S.length - 1) now++;
    S.forEach((s, i) => { s.now = i === now; s.gap = i < now && s.pct < 100; s.left = s.it.filter((x) => !x.ok).length; });
    R.now = now;
    R.all = Math.round(S.reduce((a, s) => a + s.pct, 0) / S.length);
    R.gaps = S.filter((s) => s.gap);
    R.nextStep = R.gaps[0] || (S[now].pct < 100 ? S[now] : S.slice(now + 1).find((s) => s.pct < 100)) || null;
    R.nextItem = R.nextStep ? R.nextStep.it.find((x) => !x.ok) : null;
    return R;
  }
  V.recompute = recompute;
  /* STEP07：出荷の案件（PI）がまだ無いときも、書類をつくるの画面の「AI商社マンの判断：必須 N」と同じ必須の書類を数える
     （前は案件が無いと「1書類」の仮の項目だけで、画面の「必須 7」と数が合わなかった）。判定のために作られる空の入れ物は元に戻す（rd_v94jny と同じ） */
  function fix7(s7, t) {
    try {
      if (!s7 || !Array.isArray(s7.it) || s7.v101) return s7;
      if (!fn("v85docShip") || W.v85docShip()) return s7; // 案件があるときは今まで通り
      if (!fn("v85docJudge") || !fn("v85docStatus")) return s7;
      const had = !!(t && t.v85docs), key = (() => { try { return W.v85docCaseKey(); } catch (e) { return "_"; } })();
      const hadCase = had && !!(t.v85docs.cases && t.v85docs.cases[key]);
      const it = [];
      let draft = 0;
      try {
        const J = W.v85docJudge();
        const cs2 = fn("v85docCase") ? W.v85docCase() : { skip: {} };
        const rows = Object.keys((J && J.rows) || {}).map((k) => J.rows[k]).filter((r) => r && r.lv === "required" && !(cs2.skip && cs2.skip[r.k]));
        rows.forEach((r) => { const s = W.v85docStatus(r.k) || []; if (s[0] === "draft") draft++; it.push({ t: (r.ja || r.k) + (s[0] === "ok" ? "" : s[0] === "draft" ? M("（下書きあり・確認済みにする）", " (draft)") : M("（未着手）", " (not started)")), ok: s[0] === "ok", go: { k: "ops:doc", find: [String(r.ja || ""), "必須"] } }); });
      } catch (e) { err("fix7j", e); }
      try { if (t) { if (!had) delete t.v85docs; else if (!hadCase && t.v85docs.cases) { const c = t.v85docs.cases[key]; if (c && !Object.keys(c.inp || {}).length && !Object.keys(c.st || {}).length && !Object.keys(c.skip || {}).length) delete t.v85docs.cases[key]; } } } catch (e) { /* 無視 */ }
      if (!it.length) return s7;
      it.unshift({ t: M("出荷の案件を決める（数量・単価・寸法・重量を入れて「書類を自動でつくる」）", "Set up the shipment (quantity, price, size and weight — “Make documents automatically”)"), ok: false, go: { k: "ops:doc", find: ["書類を自動でつくる", "出荷案件・見積書を作るには"] } });
      const n = it.filter((x) => x.ok).length;
      Object.assign(s7, { it, n, m: it.length, pct: Math.round((n / it.length) * 100), core: n > 0, draft, v101: 1,
        note: M("書類をつくるの「AI商社マンの判断」の必須の書類（画面の「必須 N」と同じ）のうち「確認済み」の数と、出荷の案件を決めたか。出荷を進める・受注・請求・入金は開発中（Coming Soon）のため、いまは数えません", "Required documents marked as confirmed (same as “Required N” on the Documents screen) and whether the shipment is set up.") });
    } catch (e) { err("fix7", e); }
    return s7;
  }
  V.fix7 = fix7;
  function fixR(R, again) {
    if (!R || !Array.isArray(R.S) || R.S.length !== 7) return R;
    try {
      const t = ten();
      if (!t || !t.item) return R;
      fix1(R.S[0], t);
      fix5(R.S[4], t);
      fix7(R.S[6], t);
      const s6 = step6(t), o6 = R.S[5];
      Object.keys(o6).forEach((k) => { if (!(k in s6) && !/^v99|^v100/.test(k)) delete o6[k]; });
      Object.assign(o6, s6);
      if (again) recompute(R);
      R.v101deal = 1;
    } catch (e) { err("fixR", e); }
    return R;
  }
  V.fixR = fixR;

  /* はじめの設定の「バイヤーに連絡する」：自社のバイヤーに入れただけ（送っていない）のときは、注に「まだ送っていません」 */
  if (typeof ux32Setup === "function" && !ux32Setup.__v101deal) { // eslint-disable-line no-undef
    const __u = ux32Setup; // eslint-disable-line no-undef
    const wrapped = function () {
      const S = __u.apply(this, arguments);
      try {
        const t = ten();
        const r = Array.isArray(S) ? S.find((x) => x && x[0] === "buyer") : null;
        if (r && r[4] && t && !sentAny(t)) {
          const nP = partners(t).length;
          r[5] = F(M("商談の相手 {n}社を決めました（まだ送っていません。送るのは「AIバイヤー開拓」の各行から・送る前に文面を確かめます）", "{n} deal partner(s) chosen (nothing sent yet)"), { n: nP });
        }
      } catch (e) { err("setup", e); }
      return S;
    };
    wrapped.__v101deal = 1;
    ux32Setup = wrapped; // eslint-disable-line no-global-assign
  }

  /* ══════ 22.01.1 S1（v3）・v2-10：寸法「不明」の商品で、登録した後も「次は 商品を登録」が出続ける ══════
     原因：はじめの設定の1つ目（土台 ux32Setup の fill＝足りない情報を埋める。v92core が名前を「商品を登録」にまとめる）は、
           充足度（scoreOf）の足りない項目が0のときだけ済み。22.01 の hear（No.610）で「不明」を寸法の値に数えなくなったので、
           寸法・重量だけが足りない商品は、登録した後もずっと「次は 商品を登録」（行き先は商品情報を登録＝AI のヒアリング）だった。
     直し：足りないのが寸法・重量だけのとき、
           ・はじめの設定の1つ目の名前を「寸法・重量を入れる」、添え書き「書類の画面で入れる・まだ分からないなら先へ進める」、理由を実際の抜けに
             （v92coreSteps と ux32Setup の両方：見出しの「次は」・ホーム・AI商社マンの「貴社のいまの準備」・はじめの設定の帯が同じ言葉）
           ・行き先は「書類をつくる」の寸法・重量の欄（キー "v101:dims"。rd が RDX.goKey で受けて、欄へ移して最初の欄に入れる所を置く）
           ・「まだ分からない」（hear の TEN.v101dimLater）を選んだ商品は、「次は」を先の手順へ（この手順は済みにしない＝はじめの設定の数は変えない）
           ・現在地バーの STEP 01「寸法・重量」の抜けの行き先も、同じ欄に（前は AI のヒアリング＝寸法を2回聞かれる）
           足りないのが寸法・重量のほかにもあるときは、今まで通り（「商品を登録（足りない情報を埋める）」・AI のヒアリング）。 */
  // 登録した商品の足りない項目（scoreOf＝STEP 01・商品情報の充足度と同じ数え方）。「まだ分からない」を選んだ寸法・重量は rest から外す
  function gapOf(t) {
    try {
      t = t || ten();
      if (!t || !t.item) return null;
      const sc = typeof scoreOf === "function" ? scoreOf(t) : null; // eslint-disable-line no-undef
      const ms = (sc && Array.isArray(sc.missing) ? sc.missing : []).filter((x) => x && x.k);
      if (!ms.length) return null;
      const later = !!t.v101dimLater;
      /* 止めている項目：必須（重み 5）か、まだ何も答えていない任意の項目。任意の項目で「わからない」などと答えた分（産地・製造国など）は、
         答えた事実（未確認）として「次」に数えない（土台も、任意の項目は飛ばした・「—」と答えたら済みにする）。
         例：F・G・H は「寸法・重量」（必須・不明）と「産地・製造国」（任意・わからない）→ 止めているのは寸法・重量だけ */
      // 答えた：値がある・ヒアリングで「わからない」などと答えて後回しにした（土台 v92r5c の飛ばした項目の控え）・「—」と答えた（v92r9b）
      const skip = (() => { try { const code = (typeof SES !== "undefined" && SES && SES.code) || ""; const o = JSON.parse(localStorage.getItem("bc20_v92r5c_skip_" + code) || "{}") || {}; const a = o[String(t.uid || t.item || "")]; return Array.isArray(a) ? a : []; } catch (e) { return []; } })(); // eslint-disable-line no-undef
      const answered = (k) => { const v = t[k]; if (Array.isArray(v) ? v.length > 0 : !!String(v == null ? "" : v).trim()) return true; return skip.indexOf(k) >= 0 || !!(t.v92r9bDash && t.v92r9bDash[k]); };
      const block = ms.filter((x) => (+x.w || 0) >= 5 || !answered(x.k));
      const B = block.length ? block : ms;
      const dimsOnly = B.every((x) => x.k === "dimRows");
      const nm = (x) => { const n = String(x.n || x.k); try { const d = typeof I18N !== "undefined" && I18N && I18N.dict ? I18N.dict[lang()] : null; return (lang() !== "ja" && d && d[n]) || n; } catch (e) { return n; } }; // eslint-disable-line no-undef
      const rest = B.filter((x) => !(later && x.k === "dimRows"));
      const also = ms.filter((x) => B.indexOf(x) < 0).map(nm); // 答えた未確認の任意の項目（理由に添える）
      return { later, dimsOnly, keys: ms.map((x) => x.k), names: rest.map(nm), also, dimsIn: ms.some((x) => x.k === "dimRows") };
    } catch (e) { err("gapOf", e); return null; }
  }
  V.gapOf = gapOf;
  function dimsGap(t) { const g = gapOf(t); return g && g.dimsOnly ? { later: g.later, also: g.also } : null; }
  V.dimsGap = dimsGap;
  /* 足りない項目が寸法・重量のほかにもある商品（例：F・G・H は寸法と産地・製造国を「わからない」と答えた）も、「次は 商品を登録」と言わない：
     「足りない情報を入れる（「寸法・重量」「産地・製造国」）」と実際の抜けを言う。行き先は今まで通り（AI の質問＝商品情報を登録）。
     項目名は「」で1つずつ囲む（項目名の中の「・」と区切りがまざらない＝No.612 と同じ） */
  const MISS = {
    t: (g) => { const L = g.names.slice(0, 3).map((x) => "「" + x + "」").join(""); const more = g.names.length > 3 ? F(M("ほか {n}項目", " +{n} more"), { n: g.names.length - 3 }) : ""; return F(M("足りない情報を入れる（{x}{m}）", "Fill in missing info ({x}{m})", "填写缺少的信息（{x}{m}）", "Completar lo que falta ({x}{m})"), { x: L, m: more }); },
    sub: () => M("まだ分からない項目は、未確認のまま先へ進める", "if not known yet, you can move on (kept as not confirmed)", "还不知道的项目可以“未确认”继续", "si aún no lo sabe, puede seguir (sin confirmar)"),
    why: (g) => F(M("商品は登録済みです。足りないのは {x} です（「わからない」「不明」と答えた分は値にせず「未確認」として控え、資料では「要確認」と書きます）。分かったら AI の質問か商品情報で入れてください。まだ分からないなら、このまま次の手順へ進めます。{d}",
      "Your product is registered. Missing: {x} (answers like “unknown” are kept as “not confirmed”). Fill them in when you know; otherwise you can move on. {d}"),
    { x: g.names.map((x) => "「" + x + "」").join(""), d: g.later && g.dimsIn ? M("寸法・重量は「まだ分からない」を選んでいます（未確認）。", "Dimensions/weight: “not known yet”.") : "" }),
  };
  V.MISS = MISS;
  const alsoTxt = (G) => (G && G.also && G.also.length ? F(M("（{x} は「わからない」などと答えた未確認の項目です。分かったら商品情報で入れてください）", " ({x}: answered as unknown — not confirmed.)"), { x: G.also.map((x) => "「" + x + "」").join("") }) : "");
  const DIMS = {
    t: () => M("寸法・重量を入れる", "Enter dimensions/weight", "填写尺寸・重量", "Introducir medidas y peso"),
    later: () => M("寸法・重量（未確認・あとで入れる）", "Dimensions/weight (not confirmed — later)", "尺寸・重量（未确认・稍后填写）", "Medidas y peso (sin confirmar — después)"),
    sub: () => M("書類の画面で入れる・まだ分からないなら先へ進める", "on the Documents screen — if not known yet, you can move on", "在单据页面填写・还不知道可先继续", "en Documentos; si aún no lo sabe, puede seguir"),
    why: () => M("商品は登録済みです。足りないのは寸法・重量だけです（「不明」と答えた分は値にせず「未確認」として控えています）。「書類をつくる」の画面の欄に数字を入れるか、まだ分からないなら「まだ分からない」を押すと、寸法の要らない見積書・請求書を先に作れて、次の手順へ進めます。",
      "Your product is registered; only the dimensions/weight are missing (answers like “unknown” are kept as “not confirmed”). Enter them on the Documents screen, or press “Not known yet” to make quotations/invoices first and move on.",
      "商品已登记，只缺尺寸・重量（“不明”等回答记为“未确认”）。请在“制作单据”页面填写数字；还不知道时按“还不知道”，可先制作报价单・发票并继续下一步。",
      "El producto está registrado; solo faltan medidas y peso. Introdúzcalos en Documentos o pulse «Aún no lo sé» para seguir."),
    whyLater: () => M("「まだ分からない」を選んだので、寸法・重量は未確認のまま次の手順へ進めています（この手順は済みにしていません）。梱包明細・船積依頼書（S/I）・運賃の見積の前に、「書類をつくる」の画面で入れてください。",
      "You chose “Not known yet”, so you can move on with dimensions/weight not confirmed (this step is not marked done). Enter them on the Documents screen before the packing list, S/I and freight quotes.",
      "您选择了“还不知道”，尺寸・重量以“未确认”继续（此步骤未标记完成）。制作装箱单・托运单・运费报价前，请在“制作单据”页面填写。",
      "Eligió «Aún no lo sé»: puede seguir con medidas sin confirmar (este paso no se marca como hecho)."),
  };
  V.DIMS = DIMS;
  // はじめの設定（ux32Setup の行）：名前・理由・添え書き。「まだ分からない」なら、この行を一覧の後ろへ（「次」は先の手順。済みにはしない）
  if (typeof ux32Setup === "function" && !ux32Setup.__v101dims) { // eslint-disable-line no-undef
    const __u2 = ux32Setup; // eslint-disable-line no-undef
    const w2 = function () {
      const S = __u2.apply(this, arguments);
      try {
        if (!Array.isArray(S)) return S;
        const fi = S.findIndex((x) => Array.isArray(x) && x[0] === "fill");
        if (fi < 0 || S[fi][4]) return S;
        const G = gapOf(ten());
        if (!G) return S;
        if (!G.dimsOnly) { const r0 = S[fi]; if (G.names.length) { r0[1] = MISS.t(G); r0[5] = MISS.why(G); r0[6] = MISS.sub(); r0.v101miss = 1; } return S; }
        const g = { later: G.later };
        const r = S[fi];
        r[1] = g.later ? DIMS.later() : DIMS.t();
        r[5] = (g.later ? DIMS.whyLater() : DIMS.why()) + alsoTxt(G);
        r[6] = g.later ? "" : DIMS.sub();
        r.v101dims = g.later ? "later" : "dims";
        if (g.later && fi < S.length - 1) { S.splice(fi, 1); S.push(r); }
      } catch (e) { err("setupDims", e); }
      return S;
    };
    w2.__v101deal = 1; w2.__v101dims = 1;
    ux32Setup = w2; // eslint-disable-line no-global-assign
  }
  // 6つの手順（v92coreSteps：右上の「次は」・ホーム・はじめの設定の帯・r6a の「いまの次の手順」が読む）
  function fixCore(S) {
    if (!S || !S.has || !Array.isArray(S.steps)) return S;
    const r = S.steps.find((x) => x && (x.id === "fill" || x.v101dims));
    if (!r || r.done) return S;
    const G = gapOf(ten());
    if (!G) return S;
    // 寸法・重量のほかにも足りない：名前と理由だけ実際の抜けに（行き先は今まで通り＝AI の質問）
    if (!G.dimsOnly) { if (G.names.length) { r.t = MISS.t(G); r.sub = MISS.sub(); r.why = MISS.why(G); r.v101miss = 1; } return S; }
    const g = { later: G.later };
    r.v101dims = g.later ? "later" : "dims";
    r.id = "v101dims"; // 前の層は id が "fill" なら行き先を「商品情報を登録」に決め打ちする → 別の id にして、行き先（key）を使わせる
    r.key = "v101:dims";
    r.t = g.later ? DIMS.later() : DIMS.t();
    r.sub = g.later ? "" : DIMS.sub();
    r.why = (g.later ? DIMS.whyLater() : DIMS.why()) + alsoTxt(G);
    if (g.later) {
      S.steps.forEach((x) => { x.now = false; });
      const i = S.steps.findIndex((x) => x !== r && !x.done);
      if (i >= 0) S.steps[i].now = true;
      S.next = i >= 0 ? S.steps[i] : null;
      S.idx = i;
    }
    return S;
  }
  V.fixCore = fixCore;
  if (typeof W.v92coreSteps === "function" && !W.v92coreSteps.__v101deal) {
    const __cs = W.v92coreSteps;
    const g3 = function () { const S = __cs.apply(this, arguments); try { fixCore(S); } catch (e) { err("core", e); } return S; };
    g3.__v101deal = 1;
    W.v92coreSteps = g3;
  }
  // はじめの設定の「開く」・AI商社マンの「次をひらく」（ux32Fill）：寸法・重量だけが足りないときは、寸法・重量の欄へ
  if (typeof ux32Fill === "function" && !ux32Fill.__v101deal) { // eslint-disable-line no-undef
    const __f = ux32Fill; // eslint-disable-line no-undef
    const g4 = function () {
      try { if (dimsGap(ten()) && W.RDX && typeof W.RDX.goKey === "function") { W.RDX.goKey("v101:dims"); return; } } catch (e) { err("fill", e); }
      return __f.apply(this, arguments);
    };
    g4.__v101deal = 1;
    ux32Fill = g4; // eslint-disable-line no-global-assign
  }
  // 現在地バーの STEP 01 の抜け「寸法・重量」：行き先を同じ欄に（前は AI のヒアリング）
  function fix1(s1, t) {
    try {
      if (!s1 || !Array.isArray(s1.it) || !t || !t.item) return s1;
      s1.it.forEach((x) => { if (x && !x.ok && /^寸法・重量/.test(String(x.t || "")) && !(x.go && x.go.v101)) x.go = { k: "ops:doc", find: ["寸法・重量を入れる", "書類を自動でつくる"], act: "v101dealDims", v101: 1 }; });
    } catch (e) { err("fix1", e); }
    return s1;
  }
  V.fix1 = fix1;

  /* ══════ No.615 書類をつくる（と出荷）の規制の欄：関税率・STEP03 の確かめ・販売前の手続きを分けて出す ══════ */
  const E = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  function regRows() {
    const d = dd(); if (!d || !d.regs) return null;
    const cs = Object.keys(d.regs); if (!cs.length) return null;
    const F3 = W.V100FLOW;
    let chosen = [];
    try { chosen = F3 && F3.chosenOf ? (F3.chosenOf(ten()).chosen || []) : []; } catch (e) { chosen = []; }
    let s3 = null; try { s3 = F3 && F3.step3 ? F3.step3() : null; } catch (e) { s3 = null; }
    const rows = cs.map((c) => {
      const r = d.regs[c];
      let st = null; try { st = fn("v54rStatus") ? W.v54rStatus(c) : null; } catch (e) { st = null; }
      let cs3 = null; try { cs3 = F3 && F3.ctyState ? F3.ctyState(c) : null; } catch (e) { cs3 = null; }
      let verdict = null; try { if (fn("v56regCheck") && fn("v56regVerdict") && fn("v56regCtxD")) verdict = W.v56regVerdict(W.v56regCheck(c, r, W.v56regCtxD())); } catch (e) { verdict = null; }
      const req = st ? st.req.length : 0, done = st ? st.done.length : 0;
      return { c, duty: String((r && r.duty) || ""), req, done, s3: cs3 ? { n: cs3.n, m: cs3.m, ban: cs3.ban, kind: cs3.kind } : null, chosen: chosen.indexOf(c) >= 0, verdict };
    });
    const xc = s3 ? s3.it.find((x) => x.k === "xc") : null;
    return { rows, s3: s3 ? { n: s3.n, m: s3.m, pct: s3.pct } : null, xc: xc ? { ok: !!xc.ok } : null, chosen };
  }
  V.regRows = regRows;
  function regCard() {
    const R = regRows(); if (!R) return "";
    const n0 = (typeof v536Need === "function") ? v536Need() : { pd: true }; // eslint-disable-line no-undef
    if (n0 && n0.pd === false) return "";
    const H = (typeof V56REG_FIRST !== "undefined" && V56REG_FIRST) ? V56REG_FIRST : { h: "🌏 規制（関税・必要書類）は、価格表・寸法が無くても先に見られます", p: "", btn: "🔎 規制を調べる" }; // eslint-disable-line no-undef
    const li = R.rows.map((x) => {
      const s = x.s3;
      const st3 = !s ? M("—", "—") : (s.kind === "none" || !s.m) ? M("未調査（規制の表がありません）", "not researched") : s.ban ? F(M("⛔ 販売不可の項目あり（{n}/{m}）", "⛔ cannot sell as is ({n}/{m})"), s) : s.n >= s.m ? F(M("✓ 済み {n}/{m}", "✓ done {n}/{m}"), s) : F(M("確かめた {n}/{m}・残り {l}", "checked {n}/{m} — {l} left"), { n: s.n, m: s.m, l: s.m - s.n });
      const req = x.req ? (x.done >= x.req ? F(M("✓ 対応済み {d}/{r}件", "✓ done {d}/{r}"), { d: x.done, r: x.req }) : F(M("対応済み {d}/{r}件・未対応 {u}件", "done {d}/{r} — {u} open"), { d: x.done, r: x.req, u: x.req - x.done })) : M("表のひな形にはありません", "none in the template");
      return `<li class="v101d-regli${s && s.m && s.n >= s.m && !s.ban ? " ok" : ""}"><b data-noi18n>${E(x.c)}</b>${x.chosen ? "" : `<small class="v101d-regnc">${E(M("（確定した国ではありません）", "(not a confirmed country)"))}</small>`}`
        + `<span class="v101d-regkv"><span class="v101d-regk">${E(M("関税率（目安）", "Duty rate (guide)"))}</span><span class="v101d-regv" data-noi18n>${E(x.duty || "—")}</span></span>`
        + `<span class="v101d-regkv"><span class="v101d-regk">${E(M("規制の確かめ（STEP 03）", "Regulation check (STEP 03)"))}</span><span class="v101d-regv">${E(x.chosen ? st3 : M("STEP 03 には数えません", "not counted in STEP 03"))}</span></span>`
        + `<span class="v101d-regkv"><span class="v101d-regk">${E(M("販売・出荷の前の手続き", "Pre-sale / pre-shipment procedures"))}</span><span class="v101d-regv">${E(req)}</span></span>`
        + (x.verdict ? `<span class="v101d-regw">${E(x.verdict.h || "")}</span>` : "") + `</li>`;
    }).join("");
    const sum = R.s3 ? F(M("STEP 03 規制の確かめ：全体 {n}/{m}（{p}%）", "STEP 03 regulation check: {n}/{m} ({p}%)"), { n: R.s3.n, m: R.s3.m, p: R.s3.pct }) : "";
    return `<div class="c v56reg-first v101d-reg" data-v101-deal-reg="1"><h3>${E(H.h)}</h3>${H.p ? `<p class="nn">${E(H.p)}</p>` : ""}`
      + (sum ? `<p class="v101d-regsum" role="status"><b>${E(sum)}</b> <span>${E(M("（上の現在地バーの STEP 03・「規制を調べる」の「STEP 03 規制を確かめる」の箱と同じ数え方）", "(same count as STEP 03 in the journey bar and the regulation screen)"))}</span></p>` : "")
      + (R.xc ? `<p class="v101d-regxc">${E(R.xc.ok ? M("輸出管理（該非判定）：✓ 済み（どの国にも）", "Export control: ✓ done") : M("輸出管理（該非判定）：まだ（どの国にも・STEP 03 に入ります）", "Export control: not yet (counted in STEP 03)"))}</p>` : "")
      + `<ul class="v56reg-ul v101d-regul">${li}</ul>`
      + `<p class="nn v101d-regnote">${E(M("関税率は税の率（％）で、進み具合ではありません。「規制の確かめ」は STEP 03 と同じ数（表で確かめる・必要な手続き・書類の判断の表・未調査や要確認の国の確かめ）、「販売・出荷の前の手続き」は規制の表のひな形の手続きのうち「対応済みにする」を押した数です。", "The duty rate is a tax rate, not progress. “Regulation check” is the same count as STEP 03; “procedures” counts the template procedures you marked as done."))}</p>`
      + `<div class="rw"><button class="btn v56reg-go" data-onclick="opsTab='reg';go('ops')">${E(H.btn || "🔎 規制を調べる")}</button></div></div>`;
  }
  V.regCard = regCard;
  if (typeof v56regFirstCard === "function" && !v56regFirstCard.__v101deal) { // eslint-disable-line no-undef
    const __rc = v56regFirstCard; // eslint-disable-line no-undef
    const g = function () {
      const h0 = __rc.apply(this, arguments);
      try { if (!h0) return h0; const h = regCard(); return h || h0; } catch (e) { err("regCard", e); return h0; }
    };
    g.__v101deal = 1;
    v56regFirstCard = g; // eslint-disable-line no-global-assign
  }

  /* ══════ No.533 の副作用：カテゴリーを変えたときの STEP03 の項目の数の変わり方を控える ══════
     TEN.v101s3 = {cat, n, m}（前に見た数）。カテゴリーが変わって m か n が変わったら TEN.v101catChg = {from, to, n0, m0, n1, m1, at} */
  const catOf = (t) => { const d = (t === ten() && dd()) || t || {}; return String(d.cat || t.cat || "") + "|" + String(d.catKey || t.catKey || ""); };
  const catNm = (t) => { const d = (t === ten() && dd()) || t || {}; return String(d.cat || t.cat || d.catKey || t.catKey || ""); };
  V.catSeen = function (s3) {
    try {
      const t = ten(); if (!t || !t.item || !s3 || !s3.m) return null;
      const k = catOf(t);
      const p = t.v101s3;
      let chg = null;
      if (p && p.cat && p.cat !== k && (p.m !== s3.m || p.n !== s3.n)) {
        chg = { from: p.nm || p.cat.split("|")[0], to: catNm(t), n0: p.n, m0: p.m, n1: s3.n, m1: s3.m, at: Date.now() };
        t.v101catChg = chg;
      }
      if (!p || p.cat !== k || p.n !== s3.n || p.m !== s3.m) t.v101s3 = { cat: k, nm: catNm(t), n: s3.n, m: s3.m };
      // 100% に戻ったら、知らせは役目を終える
      if (t.v101catChg && s3.n >= s3.m) delete t.v101catChg;
      return chg;
    } catch (e) { err("catSeen", e); return null; }
  };
  V.catText = function (c) {
    if (!c) return "";
    const more = c.m1 > c.m0, less = c.m1 < c.m0;
    return F(M("カテゴリーを「{a}」から「{b}」に変えたので、STEP 03 で確かめる項目が {m0} → {m1} に{v}（済み {n0} → {n1}）。前に確かめた記録は消していません。いまの項目のうち {n1} 項目は済みのままで、残り {l} 項目を確かめると 100% に戻ります（カテゴリーを戻すと前の数に戻ります）。",
      "You changed the category from “{a}” to “{b}”, so STEP 03 now has {m1} items instead of {m0} (done {n0} → {n1}). Earlier records are kept; check the remaining {l} items to reach 100% again."),
    { a: c.from || "—", b: c.to || "—", m0: c.m0, m1: c.m1, n0: c.n0, n1: c.n1, l: Math.max(0, c.m1 - c.n1), v: more ? M("増えました", "") : less ? M("減りました", "") : M("変わりました", "") });
  };

  /* ══════ 成長度（既存の aiLevel をそのまま読む） ══════ */
  V.grow = function () {
    try {
      if (!fn("aiLevel")) return null;
      const L = W.aiLevel();
      if (!L || L.pct == null) return null;
      const PRO = (typeof GROW_PRO !== "undefined") ? GROW_PRO : 90; // eslint-disable-line no-undef
      return { pct: Math.round(+L.pct || 0), lv: L.lv, stage: String(L.stage || ""), pro: PRO, to: L.to, done: !!L.pro };
    } catch (e) { err("grow", e); return null; }
  };
})();
