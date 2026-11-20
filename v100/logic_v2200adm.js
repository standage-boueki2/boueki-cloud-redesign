/* ═══ 22.00 分野 adm（2026-11-20 第13回 UAT〔版21.99.2／build de4ddb6da02b〕の直し）＝機能の中身（数・まとめ方・取得のしかた） ═══
   土台・前の層は書き換えず、前の関数を控えてから包む（何度包まれても同じ結果になるよう、印 __v100adm を付ける）。見せ方は rd_v100adm.js / .css。
   同期サーバー（GAS v2.29secf1_d95・デプロイ 43）は変えない。
   ・No.606（FWD-2026 の累計「AI 質問」0回・AI 接続では今日4回／TRIAL-2026 の累計がちょうど 1000）
     調べたこと：2つの数は出どころも数え方も別。
       累計「AI 質問」＝お客様の端末が数えた「AI を使う操作」の回数（土台 logU("ai", …) の 71 か所）。端末の usage に足し、ログイン・
       数分おきの通信で同期サーバーの usage.json に送る。同期サーバーは「前の数と届いた数の大きい方」を残す（GAS usageSave_ の Math.max）。
       今日の回数＝同期サーバーが AI に頼む前に数えた回数（air_use の a[kid].n・v226Take_）。1つの操作で何回も頼むことがある。
       FWD-2026 が 0回だった原因：AI物流マンへの質問（fwdAsk）は logU("fwd", "AI物流マンに質問:…") と記録していて、"fwd" は
       累計の「AI 質問」に数えない種類（logU の M 表は login/upload/ai/web/fill だけ）。物流会社の AI の質問は一度も累計に入っていなかった。
       （端末どうしの数は 21.3 の v213 が、アカウントの保存データの中の端末ごとの増分を足し合わせてから送る。届くまでは増えない）
       TRIAL-2026 の 1000：アプリにも同期サーバーにも、累計を 1000（今日の上限）で止める所は無い（コードで確かめた）。上限と同じ数は偶然とみる（未確認）。
     直し：AI物流マンへの質問（"AI物流マンに質問" で始まる記録）を累計の「AI 質問」にも数える（これからの分）。画面では、累計と今日の数の
       数え方の違い・時点を書き、累計が今日のサーバーの回数より小さいアカウントに印を付ける（rd）。サーバーで同じ単位の累計を持つ案は
       同期サーバーの直しが要るので「決めてほしいこと」に。
   ・No.607（台帳の重なり 26行）：同じブラウザで体験用のコード（TRIAL-2026・FWD-2026）でログインすると、21.84 の守り（v84kMigrate）が
     この端末の保存の中のアクセスコードを「k＋kid の頭16桁」に置き換える（台帳の写しの行の code も）。そのあと管理者で入ると、同期サーバーの
     台帳から本物のコードの行が足され、端末の控えの行（k…）と2行になる。これをくり返すたびに k… の行が1つずつ増える（手元で3回くり返して
     2→4→6 行に増えるのを確かめた）。同期サーバーの台帳には入っていない（この端末だけの写し）。
     直し：データは消さない。画面でまとめて見せる（rd）。管理者が台帳を同期サーバーへ送るとき、k… の行は送らない（送ると同期サーバーに
     うその「アカウント」ができるため。この端末の行は残る）。消す・まとめる操作は作らず「決めてほしいこと」に。
   ・No.524（同期の前に台帳の行が出ていた）：同期中は台帳の行も「同期中」とし、端末の控えは押したときだけ「同期前の控え（○時点）」として出す（rd）。
   ・No.528（CS 横断に 58秒）：admInboxLoad は荷主の行ごとに「鍵の計算 → 同期サーバーから読み込み」を1社ずつ順番に待っていた
     （1社 約3秒 × 17行。17行には端末の控えの行 k… も入り、読み込んでも「同期データなし」）。直し：4社ずつ同時に先に読み込み、
     同じコードは1回だけ・k… の行は読み込まない。前の結果は、取り直しているあいだも時刻つきで下に出す（rd）。
   ・No.557（アカウントごとのトークンが管理者に出ない）：同期サーバーの air_get は accts に tin・tout（今日の入力・出力トークン）を返して
     いたが、画面（v96）は tokUsed・tokCap が来たときだけ出す作りで、「同期サーバーがこの一覧に入れていない」と出していた（事実と違う）。
     直し：届いた tin＋tout を tokUsed、上限を tokCap（共通・デモ用は tokDemo・ほかは tokAcct＝air_me と同じ決め）として足す。
   ・左のメニュー：21.98（v99 の層を外した版）と 21.99.2 は、手元ではどちらも 28 項目（26 の欄＋管理者AIに質問＋ヘルプ）で、無くなった項目は
     無かった。ただし管理コンソールを描き直すたびに、まだ描かれていない欄の項目が一瞬（約0.5秒）消え、26〜28 に揺れる。
     直し：一度出た項目は、欄が描き直されるあいだも左のメニューに残す。 */
var V100ADM = window.V100ADM = { v: "22.00", err: null, errs: [],
  n: { fwdQ: 0, pushSkip: 0, enrich: 0, ibRun: 0, ibPre: 0, ibSkip: 0, ghost: 0 },
  srv: { codes: null, at: 0 }, ib: { t0: 0, t1: 0, ms: 0, n: 0, fetch: 0, skip: 0, dup: 0, prevHtml: "", prevAt: 0, busy: 0, conc: 4 },
  nav: { seen: {}, ses: 0 }, sync: { show: false, ses: 0 } };
function v100admErr(k, e) { try { const m = k + ": " + String((e && e.message) || e).slice(0, 160); V100ADM.err = m; V100ADM.errs.push(m); if (V100ADM.errs.length > 30) V100ADM.errs.shift(); } catch (x) { /* 無視 */ } }
function v100admLang() { try { const el = document.getElementById("lang"); const v = String((typeof I18N !== "undefined" && I18N && I18N.lang) || (el && el.value) || "ja"); return /^en/.test(v) ? "en" : /^zh/.test(v) ? "zh" : /^es/.test(v) ? "es" : "ja"; } catch (e) { return "ja"; } }   // eslint-disable-line no-undef
function v100admM(ja, en, zh, es) { const l = v100admLang(); return l === "en" ? (en || ja) : l === "zh" ? (zh || en || ja) : l === "es" ? (es || en || ja) : ja; }
function v100admE(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function v100admF(n) { return (+n || 0).toLocaleString("en-US"); }
function v100admZ(n) { return String(n).padStart(2, "0"); }
function v100admHms(t) { if (!(+t > 0)) return "—"; const d = new Date(+t); return v100admZ(d.getHours()) + ":" + v100admZ(d.getMinutes()) + ":" + v100admZ(d.getSeconds()); }
function v100admMdHm(t) { if (!(+t > 0)) return "—"; const d = new Date(+t), n = new Date(); return (d.toDateString() === n.toDateString() ? "" : (d.getMonth() + 1) + "/" + d.getDate() + " ") + v100admZ(d.getHours()) + ":" + v100admZ(d.getMinutes()); }
function v100admSes() { try { return (typeof SES !== "undefined" && SES) ? SES : null; } catch (e) { return null; } }   // eslint-disable-line no-undef
function v100admIs() { try { const s = v100admSes(); return !!(s && s.t === "admin" && !document.body.classList.contains("locked")); } catch (e) { return false; } }
function v100admAccts() { try { return (typeof ADB !== "undefined" && ADB && Array.isArray(ADB.accounts)) ? ADB.accounts : []; } catch (e) { return []; } }   // eslint-disable-line no-undef
const V100ADM_LID = /^k[0-9a-f]{16}$/;
function v100admIsLid(code) { return V100ADM_LID.test(String(code || "")); }
/* 共通・体験用のコード（名前を確かめない＝自己申告） */
function v100admPub(code) {
  try {
    const c = String(code || "");
    const R = (typeof V63A !== "undefined" && V63A && V63A.adm) || null;   // eslint-disable-line no-undef
    const x = R && (R.accts || []).find((y) => y && y.code === c);
    if (x && (x.pub || x.demo)) return true;
    if (typeof V95PUB_CODES !== "undefined" && V95PUB_CODES && V95PUB_CODES[c]) return true;   // eslint-disable-line no-undef
    return /^(TRIAL-2026|FWD-2026)$/.test(c);
  } catch (e) { return false; }
}

/* ══════════ No.606 AI物流マンへの質問を、累計の「AI 質問」にも数える（これからの分） ══════════ */
const V100ADM_FWDQ = /^AI物流マンに質問/;
function v100admCountFwdQ() {
  try {
    const s = v100admSes();
    if (!s || s.t !== "trial" || typeof findAcct !== "function") return;   // eslint-disable-line no-undef
    const a = findAcct(s.code);   // eslint-disable-line no-undef
    if (a && a.usage && typeof a.usage === "object") a.usage.aiQ = (+a.usage.aiQ || 0) + 1;
    try {
      if (typeof v213GrowEnsure === "function") {   // eslint-disable-line no-undef
        const x = v213GrowEnsure();   // eslint-disable-line no-undef
        if (x && x.b && x.b.inc) { x.b.inc.aiQ = (+x.b.inc.aiQ || 0) + 1; x.b.at = Date.now(); localStorage.setItem(x.k, JSON.stringify(x.o)); }
      }
    } catch (e) { v100admErr("grow", e); }
    if (typeof asave === "function") asave();   // eslint-disable-line no-undef
    V100ADM.n.fwdQ++;
  } catch (e) { v100admErr("fwdQ", e); }
}
if (typeof logU === "function" && !logU.__v100adm && !window.__v100admLogU) {   // eslint-disable-line no-undef
  window.__v100admLogU = 1;   /* 2回読まれても二重に数えない */
  const __lu100adm = logU;   // eslint-disable-line no-undef
  const f = function (type, detail) {
    const r = __lu100adm.apply(this, arguments);
    try { if (type === "fwd" && V100ADM_FWDQ.test(String(detail || ""))) v100admCountFwdQ(); } catch (e) { v100admErr("logU", e); }
    return r;
  };
  f.__v100adm = 1;
  logU = f;   // eslint-disable-line no-global-assign
}
/* 累計（端末の記録）と今日（同期サーバー）の数。lt＝累計が今日のサーバーの回数より小さい（数え方が違う印） */
function v100admAirAcct(code) {
  try { const R = (typeof V63A !== "undefined" && V63A && V63A.adm) || null; return R ? (R.accts || []).find((y) => y && y.code === code) || null : null; } catch (e) { return null; }   // eslint-disable-line no-undef
}
function v100admAirAt() { try { return (window.V99ADM && V99ADM.air && V99ADM.air.at) || ((typeof V63A !== "undefined" && V63A && +V63A.admAt) || 0); } catch (e) { return 0; } }   // eslint-disable-line no-undef
window.v100admCum = function (code) {
  const a = v100admAccts().find((x) => x && x.code === code) || {};
  const u = a.usage || {};
  const x = v100admAirAcct(code);
  const today = x ? (+x.used || 0) : null;
  return { aiQ: +u.aiQ || 0, webQ: +u.webQ || 0, today, at: v100admAirAt(), lt: today != null && today > (+u.aiQ || 0), fwd: a.role === "fwd" };
};

/* ══════════ No.557 air_get の accts にトークン（tokUsed・tokCap）を足す（届いた tin・tout から。air_me と同じ決め） ══════════ */
function v100admEnrich(r) {
  try {
    if (!r || !r.ok || !Array.isArray(r.accts)) return;
    const C = r.conf || {};
    r.accts.forEach((a) => {
      if (!a || a.tokCap != null) return;
      if (a.tin == null && a.tout == null) return;
      const used = (+a.tin || 0) + (+a.tout || 0);
      const cap = (a.pub || a.demo) ? (+C.tokDemo || 0) : (+C.tokAcct || 0);
      a.tokUsed = used; a.tokCap = cap; a.v100tok = 1;
    });
    V100ADM.n.enrich++;
  } catch (e) { v100admErr("enrich", e); }
}

/* ══════════ No.528 CS 横断の取得の間だけ効く「読み込みの控え」（同じ kid の acct の読み込みを1回にまとめる） ══════════
   21.99.2 までのように関数を取得のたびに差し替えると、取得が重なったとき（3分ごとの取り直し・開いたときの取り直し）に元に戻せず、
   古い控えが残る恐れがある。読み込んだ時に1回だけ包み、取得が動いている間（IBC.active>0）だけ控えを使う。終わったら空にする。 */
var V100ADM_IBC = window.V100ADM_IBC = { active: 0, d: new Map(), p: new Map() };
if (typeof syncDerive === "function" && !syncDerive.__v100adm) {   // eslint-disable-line no-undef
  const __sd100adm = syncDerive;   // eslint-disable-line no-undef
  const f = function (code) {
    const C = V100ADM_IBC;
    try {
      if (C.active && typeof code === "string" && code) {
        if (C.d.has(code)) return C.d.get(code);
        const pr = Promise.resolve(__sd100adm.apply(this, arguments));
        C.d.set(code, pr);
        /* 端末の控えの名前（k…）は本物のアカウントではないので、同期サーバーから読まない（読んでも「同期データなし」） */
        if (v100admIsLid(code)) pr.then((d) => { if (d && d.kid && C.active && !C.p.has(d.kid)) C.p.set(d.kid, Promise.resolve({ ok: true, blob: null, v100skip: 1 })); }).catch(() => null);
        return pr;
      }
    } catch (e) { v100admErr("sd", e); }
    return __sd100adm.apply(this, arguments);
  };
  f.__v100adm = 1;
  syncDerive = f;   // eslint-disable-line no-global-assign
}

/* ══════════ 同期サーバーへの通信：air_get のトークン・台帳のコード・送るときに k… の行を外す ══════════ */
if (typeof syncCall === "function" && !syncCall.__v100adm) {   // eslint-disable-line no-undef
  const __sc100adm = syncCall;   // eslint-disable-line no-undef
  const f = async function (op, body, opt) {
    const C = V100ADM_IBC;
    try {
      if (C.active && op === "pull" && body && body.ns === "acct" && body.kid) {
        if (C.p.has(body.kid)) return C.p.get(body.kid);
        const pr = __sc100adm.apply(this, arguments);
        C.p.set(body.kid, pr);
        V100ADM.ib.fetch++;   /* 同期サーバーから実際に読んだ数（同じ kid は1回） */
        return pr;
      }
    } catch (e) { v100admErr("ibc", e); }
    let args = arguments;
    try {
      if (op === "admin_set" && body && Array.isArray(body.accounts) && body.accounts.some((a) => a && v100admIsLid(a.code))) {
        const keep = body.accounts.filter((a) => !(a && v100admIsLid(a.code)));
        V100ADM.n.pushSkip += body.accounts.length - keep.length;
        args = [op, Object.assign({}, body, { accounts: keep }), opt];
      }
    } catch (e) { v100admErr("push", e); }
    const r = await __sc100adm.apply(this, args);
    try {
      if (op === "air_get") v100admEnrich(r);
      else if (op === "admin_get" && r && r.ok && Array.isArray(r.accounts) && r.accounts.some((s) => s && s.code)) { V100ADM.srv = { codes: new Set(r.accounts.map((s) => s && s.code).filter(Boolean)), at: Date.now() }; }
    } catch (e) { v100admErr("sc", e); }
    return r;
  };
  f.__v100adm = 1;
  syncCall = f;   // eslint-disable-line no-global-assign
}
/* すでに読み込んだ air_get にも足す（層を読む前に届いていた分） */
try { if (typeof V63A !== "undefined" && V63A && V63A.adm) v100admEnrich(V63A.adm); } catch (e) { v100admErr("enrich0", e); }   // eslint-disable-line no-undef

/* ══════════ No.607 台帳の重なりのまとまり（データは変えない） ══════════ */
function v100admKidOf(a) {
  try { if (a && a._kid) return String(a._kid); const K = (typeof V213 !== "undefined" && V213 && V213.kid) || {}; return a && K[a.code] ? String(K[a.code]) : ""; } catch (e) { return ""; }   // eslint-disable-line no-undef
}
window.v100admGroups = function () {
  const A = v100admAccts();
  const lidTwin = {};   /* k… → 本物のコード */
  A.forEach((a) => { if (!a || v100admIsLid(a.code)) return; const k = v100admKidOf(a); if (k) lidTwin["k" + k.slice(0, 16)] = a.code; });
  const G = new Map();   /* まとまり先のコード → {code, main, rows:[], lid, same} */
  const order = [];
  A.forEach((a, i) => {
    if (!a) return;
    const c = String(a.code || "");
    const lid = v100admIsLid(c);
    const to = lid ? (lidTwin[c] || c) : c;
    let g = G.get(to);
    if (!g) { g = { code: to, twin: lid ? !!lidTwin[c] : true, main: null, rows: [], lid: 0, same: 0 }; G.set(to, g); order.push(to); }
    g.rows.push({ a, i, lid });
    if (!lid && !g.main) g.main = a;
  });
  let lidRows = 0, sameRows = 0, folded = 0;
  order.forEach((k) => {
    const g = G.get(k);
    g.lid = g.rows.filter((r) => r.lid).length;
    g.same = Math.max(0, g.rows.filter((r) => !r.lid).length - 1);
    if (!g.main) g.main = g.rows[0].a;   /* 本物のコードの行が無い＝k… の行だけ */
    g.extra = g.rows.length - 1;
    lidRows += g.lid; sameRows += g.same; folded += g.extra;
  });
  const srv = V100ADM.srv.codes;
  return { groups: order.map((k) => G.get(k)), rows: A.length, lidRows, sameRows, folded, real: order.filter((k) => !v100admIsLid(k)).length,
    srvHasLid: srv ? [...srv].some((c) => v100admIsLid(c)) : null, srvAt: V100ADM.srv.at };
};

/* ══════════ No.524 台帳の同期の状態（同期中は行を出さない・控えの時点） ══════════ */
window.v100admLedgerSt = function () {
  let st = "";
  try { st = (typeof v96admSt === "function") ? String(v96admSt() || "") : ""; } catch (e) { st = ""; }   // eslint-disable-line no-undef
  let at = 0;
  try { at = +localStorage.getItem("bc20_v73adm_pullAt") || 0; } catch (e) { at = 0; }
  const s = v100admSes(), ses = (s && +s.at) || 0;
  if (V100ADM.sync.ses !== ses) V100ADM.sync = { show: false, ses };
  return { st, at, show: !!V100ADM.sync.show };
};

/* ══════════ No.528 CS 横断：先に4社ずつ同時に読み込む・同じコードは1回・k… は読まない・前の結果を残す ══════════ */
async function v100admPool(items, conc, fn) {
  let i = 0;
  const run = async () => { while (i < items.length) { const k = i++; try { await fn(items[k]); } catch (e) { /* それぞれの失敗は本体の読み込みで出す */ } } };
  await Promise.all(Array.from({ length: Math.min(conc, items.length) }, run));
}
if (typeof admInboxLoad === "function" && !admInboxLoad.__v100adm) {   // eslint-disable-line no-undef
  const __ib100adm = admInboxLoad;   // eslint-disable-line no-undef
  const f = async function () {
    const I = V100ADM.ib;
    if (!v100admIs() || typeof syncDerive !== "function" || typeof syncCall !== "function") return __ib100adm.apply(this, arguments);   // eslint-disable-line no-undef
    const out0 = document.getElementById("adminboxOut");
    if (out0 && out0.querySelector("table")) { I.prevHtml = out0.innerHTML; I.prevAt = I.t1 || Date.now(); }
    const t0 = Date.now();
    Object.assign(I, { t0, t1: 0, ms: 0, busy: 1, n: 0, fetch: 0, skip: 0, dup: 0 });
    V100ADM.n.ibRun++;
    const A = v100admAccts().filter((a) => a && a.role !== "fwd");
    I.n = A.length;
    const C = V100ADM_IBC;
    C.active++;
    if (C.active === 1) { C.d.clear(); C.p.clear(); }
    const codes = [];
    A.forEach((a) => { const c = String(a.code || ""); if (!c) return; if (v100admIsLid(c)) { I.skip++; return; } if (codes.indexOf(c) >= 0) { I.dup++; return; } codes.push(c); });
    /* 先に読み込む（4社ずつ同時）。本体の1社ずつの読み込みは、同じ控えから答える */
    const pre = v100admPool(codes, I.conc, async (c) => {
      const d = await syncDerive(c);   // eslint-disable-line no-undef
      if (!d || !d.kid) return;
      await Promise.resolve(syncCall("pull", { kid: d.kid, ns: "acct" })).catch(() => null);   // eslint-disable-line no-undef
    });
    V100ADM.n.ibPre++;
    let r;
    try {
      r = await __ib100adm.apply(this, arguments);
    } finally {
      await pre.catch(() => null);
      C.active = Math.max(0, C.active - 1);
      if (!C.active) { C.d.clear(); C.p.clear(); }
      I.t1 = Date.now(); I.ms = I.t1 - t0; I.busy = 0;
      try { if (typeof window.v100admIbPaint === "function") window.v100admIbPaint(); } catch (e) { v100admErr("ibPaint", e); }
    }
    return r;
  };
  f.__v100adm = 1;
  admInboxLoad = f;   // eslint-disable-line no-global-assign
}

/* CS 横断の「荷主 N社」：端末の控えの行（k…）と同じコードの重なりを社数に入れない（v96 の見出し・v90 の「取得しました」） */
function v100admShipperN() { const all = v100admAccts().filter((a) => a && a.role !== "fwd"); const s = new Set(); all.forEach((a) => { if (a.code && !v100admIsLid(a.code)) s.add(a.code); }); return { all: all.length, real: s.size }; }
if (typeof v96admIbSum === "function" && !v96admIbSum.__v100adm) {   // eslint-disable-line no-undef
  const __is100adm = v96admIbSum;   // eslint-disable-line no-undef
  const f = function () { const s = __is100adm.apply(this, arguments); try { if (s && v100admIs()) { const C = v100admShipperN(); if (C.real < C.all && s.n === C.all) { s.n = C.real; s.v100skip = C.all - C.real; } } } catch (e) { v100admErr("ibSum", e); } return s; };
  f.__v100adm = 1;
  v96admIbSum = f;   // eslint-disable-line no-global-assign
}
if (typeof v90admDone === "function" && !v90admDone.__v100adm) {   // eslint-disable-line no-undef
  const __dn100adm = v90admDone;   // eslint-disable-line no-undef
  const f = function (out, msg) { try { if (typeof msg === "string" && v100admIs()) { const C = v100admShipperN(); if (C.real < C.all) msg = msg.replace("・" + C.all + "社・", "・" + C.real + "社・"); } } catch (e) { v100admErr("ibDone", e); } return __dn100adm.call(this, out, msg); };
  f.__v100adm = 1;
  v90admDone = f;   // eslint-disable-line no-global-assign
}

/* ══════════ 左のメニュー：一度出た項目は、欄の描き直しのあいだも残す ══════════ */
function v100admNavFix() {
  try {
    if (typeof v84AdmMode !== "function" || !v84AdmMode() || typeof V84ADM_SECS === "undefined") return;   // eslint-disable-line no-undef
    const nav = document.getElementById("nav"), w = document.getElementById("well");
    if (!nav || !w) return;
    const s = v100admSes(), ses = (s && +s.at) || 1;
    const N = V100ADM.nav;
    if (N.ses !== ses) { N.ses = ses; N.seen = {}; }
    const ms = typeof v84AdmMaster === "function" ? v84AdmMaster() : true;   // eslint-disable-line no-undef
    const MO = (typeof V84ADM_MASTER_ONLY !== "undefined" && V84ADM_MASTER_ONLY) || new Set();   // eslint-disable-line no-undef
    const L = V84ADM_SECS.filter((x) => x && x.nm && (ms || !MO.has(x.k)));   // eslint-disable-line no-undef
    L.forEach((x) => { if (w.querySelector(`[data-v84sec="${x.k}"]`)) N.seen[x.k] = x; });
    /* 「ヘルプ」（刷新版の rd_pages3 が足す）も、描き直しで消えたらすぐ足し直す（同じ作り・同じ動き） */
    const hb = nav.querySelector(".k-admhelp");
    if (hb) N.helpHtml = hb.innerHTML;
    else if (N.helpHtml && window.RDX && typeof window.RDX.openHelp === "function") {
      const b = document.createElement("button");
      b.type = "button"; b.className = "nb k-admhelp"; b.dataset.rdorig = "1"; b.innerHTML = N.helpHtml;
      b.addEventListener("click", () => window.RDX.openHelp());
      nav.appendChild(b);
      V100ADM.n.ghost++;
    }
    const has = (k) => !!nav.querySelector(`[data-act="sub.admGo"][data-arg="${k}"]`);
    const firstBtn = nav.querySelector('[data-act="sub.admGo"]');
    if (!firstBtn) return;
    L.forEach((x, idx) => {
      if (!N.seen[x.k] || has(x.k)) return;
      /* 同じ分け方（tab）で、前にある項目の後ろに入れる */
      let after = null;
      for (let j = idx - 1; j >= 0; j--) { if (L[j].tab !== x.tab) continue; const b = nav.querySelector(`[data-act="sub.admGo"][data-arg="${L[j].k}"]`); if (b) { after = b; break; } }
      if (!after) {
        let nxt = null;
        for (let j = idx + 1; j < L.length; j++) { if (L[j].tab !== x.tab) continue; const b = nav.querySelector(`[data-act="sub.admGo"][data-arg="${L[j].k}"]`); if (b) { nxt = b; break; } }
        if (!nxt) return;   /* その分け方の見出しごと無いときは、元の描き方に任せる */
        after = nxt.previousElementSibling;
        if (!after) return;
      }
      const b = firstBtn.cloneNode(true);
      b.setAttribute("data-arg", x.k);
      b.setAttribute("data-v100ghost", "1");
      b.removeAttribute("aria-current");
      const sp = b.querySelector("span"); if (sp) sp.textContent = x.nm;
      b.setAttribute("data-ux32adm", "v84sec-" + x.k);
      after.after(b);
      V100ADM.n.ghost++;
    });
  } catch (e) { v100admErr("nav", e); }
}
if (typeof v84AdmNav === "function" && !v84AdmNav.__v100adm) {   // eslint-disable-line no-undef
  const __nav100adm = v84AdmNav;   // eslint-disable-line no-undef
  const f = function () { const r = __nav100adm.apply(this, arguments); v100admNavFix(); return r; };
  f.__v100adm = 1;
  v84AdmNav = f;   // eslint-disable-line no-global-assign
}
/* 欄がまだ描かれていない項目を押したとき：描かれるまで待ってから移る（最大3秒） */
document.addEventListener("click", (ev) => {
  try {
    const b = ev.target && ev.target.closest && ev.target.closest("#nav [data-v100ghost]");
    if (!b) return;
    const k = b.getAttribute("data-arg"), w = document.getElementById("well");
    if (w && w.querySelector(`[data-v84sec="${k}"]`)) return;   /* 欄がある＝いつもの動き */
    ev.preventDefault(); ev.stopPropagation();
    let n = 0;
    const t = setInterval(() => { n++; const ok = w && w.querySelector(`[data-v84sec="${k}"]`); if (ok || n > 15) { clearInterval(t); if (ok && typeof v84AdmGo === "function") v84AdmGo(k); } }, 200);   // eslint-disable-line no-undef
  } catch (e) { v100admErr("ghostClick", e); }
}, true);
