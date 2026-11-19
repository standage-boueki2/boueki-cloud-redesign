/* ═══ 21.99 分野 adm（2026-11-19 第12回相当 UAT〔版21.98／build d261a62616d3〕の直し）＝機能の中身（数と取り直しの決め方） ═══
   土台・前の層（v95/logic_v2195ai.js・v96/logic_v2196adm.js・v97/logic_v2197adm.js ほか）は書き換えず、前の関数を控えてから包む。
   見せ方（画面の文言）は rd_v99adm.js / rd_v99adm.css。同期サーバー（GAS v2.29secf1_d95）は変えない。
   ・No.557（管理者側と荷主側の AI の回数が 2回ちがった：荷主 150／1,000〔12:42〕・管理者 152／1,000〔15:2x〕）
     調べたこと：2つの数は同じ同期サーバーの記録（air_use.json の そのアクセスコードの今日の回数 u.a[kid].n）。荷主側は air_me の used
     （v63aPull・2分ごと・画面が見えているときだけ）に、この画面で AI を使うたびに +1（v95aiRelaySeen）。管理者側は air_get の accts[].used
     （v63aLoad・管理コンソールを描くたび・30秒は控えを使う）。数え方は同じ（AI に頼む前に1回・v226Take_）。ちがいは①読んだ時刻
     （荷主 12:42・管理者 15:2x）②共通のコードはほかの方・ほかの端末の分も同じ数に入る ③荷主側は最大2分古い・開き直しても取り直さない。
     どちらの画面にも「何時の数か」「コード全体の数か」が書かれていないため、2回の差の理由が画面から分からなかった。
     直し：荷主側は AI 相談の画面を開いたとき・画面が見えるようになったとき（5秒以上たっていれば）と、AI を使ったあと（2.5秒待ってまとめて・
     画面に数が出ているときだけ。出ていないときは次に開いたとき）に air_me を取り直し、受け取った時刻を控える（V99ADM.me）。
     管理者側は AI 接続の欄を開いたとき（タブ・目次で移ったとき・見えるようになったとき、10秒以上たっていれば）に air_get を取り直す。
     画面には、両方に「○時○分○秒 時点の同期サーバーの数」「このアクセスコード全体の数（ほかの方・端末の分も含む）」を出す（rd_v99adm.js）。
   ・No.524（入室直後の「同期中」を見られなかった）：入室の時刻・同期が終わった時刻（V214.pullAt）・かかった秒・読めなかった時刻を控え
     （V99ADM.sync）、ダッシュボードの上に1行で残す（同期中の表示そのものは 21.96 のまま）。
   ・No.528（商社デスクがログインのときに取った数のまま）：21.97.1 は「見えるようになったとき、前の取得から3分を過ぎていたら」だけ
     取り直していた。商社デスクの欄は、開いたとき（管理コンソールの目次・タブ・クイック操作で移ったとき、別の画面から管理コンソールに
     戻ったとき、欄が画面に入ったとき）に取り直す（8秒以内に取ったばかりなら取り直さない・取得中ならその結果を使う）。
     取得のきっかけ（開いた・ログインのあと自動・ボタン）と時刻を控え（V99ADM.desk）、見出しの1行に「開いた時刻 HH:MM に取り直しました」と出す。
     CS 横断（重い：荷主ごとに読む）は 21.97.1 の決め（3分を過ぎていたら開いたときに取り直す）のまま、きっかけと時刻を同じ形で出す。 */
var V99ADM = window.V99ADM = { v: "21.99", err: null, errs: [], n: { me: 0, mePull: 0, meOpen: 0, air: 0, airPull: 0, desk: 0, deskOpen: 0, ib: 0, paint: 0 },
  me: { at: 0, used: null, busy: 0, stale: 0, lastPull: 0, t: 0, first: 0 }, air: { at: 0, vis: false },
  sync: { ses: 0, open: 0, w0: 0, done: 0, fail: 0, raw: "" },
  desk: { vis: false, view: false, openAt: 0, openWhy: "", pend: "", cur: null, last: null, lastT0: 0, re97: -1 },
  ib: { cur: null, last: null, re97: -1 }, prevCur: "", prevTab: "" };
function v99admErr(k, e) { try { const m = k + ": " + String((e && e.message) || e).slice(0, 160); V99ADM.err = m; V99ADM.errs.push(m); if (V99ADM.errs.length > 30) V99ADM.errs.shift(); } catch (x) { /* 無視 */ } }
function v99admLang() { try { const el = document.getElementById("lang"); const v = String((typeof I18N !== "undefined" && I18N && I18N.lang) || (el && el.value) || "ja"); return /^en/.test(v) ? "en" : /^zh/.test(v) ? "zh" : /^es/.test(v) ? "es" : "ja"; } catch (e) { return "ja"; } }
function v99admM(ja, en, zh, es) { const l = v99admLang(); return l === "en" ? (en || ja) : l === "zh" ? (zh || en || ja) : l === "es" ? (es || en || ja) : ja; }
function v99admE(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function v99admZ(n) { return String(n).padStart(2, "0"); }
function v99admHms(t) { if (!(+t > 0)) return "—"; const d = new Date(+t); return v99admZ(d.getHours()) + ":" + v99admZ(d.getMinutes()) + ":" + v99admZ(d.getSeconds()); }
function v99admHm(t) { if (!(+t > 0)) return "—"; const d = new Date(+t); return v99admZ(d.getHours()) + ":" + v99admZ(d.getMinutes()); }
function v99admMdHms(t) { if (!(+t > 0)) return "—"; const d = new Date(+t); const today = new Date(); const same = d.toDateString() === today.toDateString(); return (same ? "" : (d.getMonth() + 1) + "/" + d.getDate() + " ") + v99admHms(t); }
function v99admCur() { try { return typeof cur !== "undefined" ? String(cur || "") : ""; } catch (e) { return ""; } }   // eslint-disable-line no-undef
function v99admSes() { try { return (typeof SES !== "undefined" && SES) ? SES : null; } catch (e) { return null; } }   // eslint-disable-line no-undef
/* 荷主（お客様）として STANDAGE の AI（サーバー経由）を使っているか */
function v99admCust() { try { const s = v99admSes(); return !!(s && s.t === "trial" && typeof v63aCust === "function" && v63aCust()); } catch (e) { return false; } }
function v99admAdm() { try { return typeof v96admIs === "function" ? !!v96admIs() : false; } catch (e) { return false; } }
function v99admMaster() { try { return typeof v96admMaster === "function" ? !!v96admMaster() : v99admAdm(); } catch (e) { return false; } }
function v99admSyncOn() { try { return typeof syncOn === "function" && !!syncOn(); } catch (e) { return false; } }
function v99admShown(el) { try { return !!el && el.isConnected && el.getClientRects().length > 0; } catch (e) { return false; } }
function v99admInView(el) { try { if (!v99admShown(el)) return false; const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < (window.innerHeight || 800) && r.width > 0; } catch (e) { return false; } }

/* ══════════ No.557 荷主側：air_me を取り直す（開いたとき・AI を使ったあと） ══════════ */
function v99admPaintSoon() { try { setTimeout(() => { try { if (typeof window.v95aiPaint === "function") window.v95aiPaint(); else if (typeof v90goalQPut === "function") v90goalQPut(); } catch (e) { v99admErr("paint", e); } }, 40); } catch (e) { v99admErr("paintSoon", e); } }
function v99admCounterOn() { return v99admCur() === "ai" && !document.hidden; }
/* why：open（開いた・見えるようになった）／relay（AI を使った） */
function v99admMeSoon(why) {
  try {
    if (!v99admCust()) return;
    const M = V99ADM.me, now = Date.now();
    if (why === "relay") {
      M.stale = 1;
      if (!v99admCounterOn()) return;                       /* 数が出ていないときは、次に開いたときに取る（サーバーの負担を増やさない） */
      if (!M.first) M.first = now;
      clearTimeout(M.t);
      const wait = now - M.first > 15000 ? 0 : 2500;          /* 続けて使っているときも 15秒に1回は取り直す */
      M.t = setTimeout(() => v99admMePull("relay"), wait);
      return;
    }
    if (why === "open") {
      if (M.at && now - M.at < 5000 && !M.stale) return;   /* 5秒以内に取ったばかり */
      clearTimeout(M.t);
      M.t = setTimeout(() => v99admMePull("open"), 0);
    }
  } catch (e) { v99admErr("meSoon", e); }
}
function v99admMePull(why) {
  try {
    const M = V99ADM.me;
    M.first = 0;
    if (!v99admCust() || typeof v63aPull !== "function") return;
    if (Date.now() - M.lastPull < 3000) { clearTimeout(M.t); M.t = setTimeout(() => v99admMePull(why), 3000); return; }
    M.lastPull = Date.now();
    V99ADM.n.mePull++; if (why === "open") V99ADM.n.meOpen++;
    v99admPaintSoon();
    Promise.resolve(v63aPull(true)).catch((e) => v99admErr("pull", e)).then(() => v99admPaintSoon());
  } catch (e) { v99admErr("mePull", e); }
}
/* 同期サーバーの答えを受け取った時刻（air_me・air_get）と、AI を使ったこと（ai_relay） */
if (typeof syncCall === "function") {
  const __sc99adm = syncCall;
  syncCall = async function (op, body, opt) {   // eslint-disable-line no-global-assign
    const me = op === "air_me";
    if (me) V99ADM.me.busy++;
    try {
      const r = await __sc99adm.apply(this, arguments);
      try {
        if (me && r && r.ok === true) { const M = V99ADM.me; M.at = Date.now(); M.used = +r.used || 0; M.cap = +r.cap || 0; M.stale = 0; V99ADM.n.me++; v99admPaintSoon(); }
        else if (op === "ai_relay") v99admMeSoon("relay");
        else if (op === "air_get" && r && r.ok) { V99ADM.air.at = Date.now(); V99ADM.n.air++; }
      } catch (e) { v99admErr("sc", e); }
      return r;
    } finally { if (me) V99ADM.me.busy = Math.max(0, V99ADM.me.busy - 1); }
  };
}
document.addEventListener("visibilitychange", () => { try { if (!document.hidden && v99admCur() === "ai") v99admMeSoon("open"); } catch (e) { v99admErr("vis", e); } });

/* ══════════ No.557 管理者側：AI 接続の欄を開いたら air_get を取り直す ══════════ */
function v99admAirPull(why) {
  try {
    if (!v99admAdm() || typeof v63aMaster !== "function" || !v63aMaster() || typeof v63aLoad !== "function") return;
    const at = (typeof V63A !== "undefined" && V63A && +V63A.admAt) || 0;
    if (at && Date.now() - at < 10000) return;               /* 10秒以内に取ったばかり */
    if (typeof V63A !== "undefined" && V63A && V63A.admBusy) return;
    V99ADM.n.airPull++; V99ADM.air.why = why; V99ADM.air.busy = 1;
    try { if (typeof window.v99admAirPaint === "function") window.v99admAirPaint(); } catch (e) { /* 無視 */ }
    Promise.resolve(v63aLoad(true)).catch((e) => v99admErr("airLoad", e)).then(() => {
      V99ADM.air.busy = 0;
      try { if (typeof v63aPaint === "function" && document.getElementById("v63air")) v63aPaint(); } catch (e) { v99admErr("airPaint", e); }
    });
  } catch (e) { v99admErr("airPull", e); }
}

/* ══════════ No.524 同期の記録（入室 → 同期が終わった・かかった秒） ══════════ */
function v99admSyncTick() {
  try {
    if (!v99admAdm()) return;
    const s = v99admSes(), S = V99ADM.sync, at = (s && +s.at) || 0;
    if (S.ses !== at) { V99ADM.sync = { ses: at, open: Date.now(), w0: 0, done: 0, fail: 0, raw: "", again: 0 }; }
    const X = V99ADM.sync, st = typeof v96admSt === "function" ? v96admSt() : "";
    const pa = (typeof V214 !== "undefined" && V214 && +V214.pullAt) || 0;
    if (st === "wait") {
      if (!X.w0) X.w0 = (typeof V801F !== "undefined" && V801F && V801F.adm && +V801F.adm.t0) || Date.now();
    } else if (st === "") {
      if (!X.done) X.done = (pa && pa >= Math.min(X.w0 || X.open, X.open) - 2000) ? pa : Date.now();
      else if (pa > X.done + 3000) X.again = pa;
    } else if (st === "stale") {
      if (!X.fail && !X.done) { X.fail = Date.now(); X.raw = (typeof V96ADM !== "undefined" && V96ADM && V96ADM.raw) || ""; }
    }
  } catch (e) { v99admErr("syncTick", e); }
}

/* ══════════ No.528 商社デスク：開いたとき取り直す ══════════ */
function v99admDeskOpen(why) {
  try {
    if (!v99admAdm() || !v99admMaster() || !v99admSyncOn()) return;
    const D = (typeof V75TC !== "undefined" && V75TC && V75TC.adm) || null, K = V99ADM.desk, now = Date.now();
    if (!D || !document.getElementById("v75admGo")) return;
    K.openAt = now; K.openWhy = why;
    const A96 = (typeof V96ADM !== "undefined" && V96ADM && V96ADM.auto) || {};
    if (!A96.started) return;                                 /* 同期のあとの自動の取得がまだ＝それを待つ */
    if (D.busy) return;                                       /* 取得中：その結果を出す */
    if (K.lastT0 && now - K.lastT0 < (why === "view" ? 30000 : 8000)) return;
    K.pend = "open";
    V99ADM.n.deskOpen++;
    Promise.resolve().then(() => v75tcAdmLoad()).catch((e) => v99admErr("deskLoad", e));
  } catch (e) { v99admErr("deskOpen", e); }
}
if (typeof v75tcAdmLoad === "function") {
  const __tc99adm = v75tcAdmLoad;
  v75tcAdmLoad = async function () {   // eslint-disable-line no-global-assign
    const K = V99ADM.desk, t0 = Date.now();
    let why = K.pend || "";
    K.pend = "";
    try {
      const r97 = (typeof V97ADM !== "undefined" && V97ADM && V97ADM.n) ? V97ADM.n.reDesk : -1;
      if (!why && r97 !== K.re97 && K.re97 >= 0) why = "open";   /* 21.97.1 の「見えるようになったら」の取り直し */
      K.re97 = r97;
      const A96 = (typeof V96ADM !== "undefined" && V96ADM && V96ADM.auto) || {};
      const D = (typeof V75TC !== "undefined" && V75TC && V75TC.adm) || {};
      if (!why) why = (A96.started && !A96.done && !D.at) ? "auto" : "btn";
      if (why === "open" && !(K.openAt && t0 - K.openAt < 8000)) K.openAt = t0;
    } catch (e) { v99admErr("deskWhy", e); }
    K.cur = { t0, why, openAt: why === "open" ? K.openAt : 0 };
    V99ADM.n.desk++;
    try { if (typeof window.v99admDeskPaint === "function") setTimeout(window.v99admDeskPaint, 0); } catch (e) { /* 無視 */ }
    try { return await __tc99adm.apply(this, arguments); } finally {
      try {
        const D = (typeof V75TC !== "undefined" && V75TC && V75TC.adm) || {};
        K.last = { t0, at: +D.at || 0, why: K.cur ? K.cur.why : why, openAt: K.cur ? K.cur.openAt : 0, err: D.err || "", ok: !D.err && +D.at >= t0 };
        K.lastT0 = t0; K.cur = null;
        if (typeof window.v99admDeskPaint === "function") window.v99admDeskPaint();
      } catch (e) { v99admErr("deskDone", e); }
    }
  };
}
/* CS 横断：きっかけと時刻（取り直しの決め方は 21.97.1 のまま） */
if (typeof admInboxLoad === "function") {
  const __ib99adm = admInboxLoad;
  admInboxLoad = async function () {   // eslint-disable-line no-global-assign
    const K = V99ADM.ib, t0 = Date.now();
    let why = "btn";
    try {
      const r97 = (typeof V97ADM !== "undefined" && V97ADM && V97ADM.n) ? V97ADM.n.reIb : -1;
      const A96 = (typeof V96ADM !== "undefined" && V96ADM && V96ADM.auto) || {};
      if (r97 !== K.re97 && K.re97 >= 0) why = "open";
      else if (A96.started && !A96.done) why = "auto";
      K.re97 = r97;
    } catch (e) { v99admErr("ibWhy", e); }
    K.cur = { t0, why };
    V99ADM.n.ib++;
    try { return await __ib99adm.apply(this, arguments); } finally {
      try { const I = (typeof V96ADM !== "undefined" && V96ADM && V96ADM.ib) || {}; K.last = { t0, at: +I.at || 0, why, ok: +I.at >= t0 }; K.cur = null; if (typeof window.v99admIbPaint === "function") window.v99admIbPaint(); } catch (e) { v99admErr("ibDone", e); }
    }
  };
}
/* 目次・タブ・クイック操作で移ったとき＝開いた */
if (typeof v84AdmGo === "function") {
  const __go99adm = v84AdmGo;
  v84AdmGo = function (k) {   // eslint-disable-line no-global-assign
    const r = __go99adm.apply(this, arguments);
    try {
      if (k === "desk") setTimeout(() => v99admDeskOpen("nav"), 0);
      if (k === "air") setTimeout(() => v99admAirPull("nav"), 0);
    } catch (e) { v99admErr("go", e); }
    return r;
  };
}
if (typeof v84AdmSet === "function") {
  const __set99adm = v84AdmSet;
  v84AdmSet = function (tab) {   // eslint-disable-line no-global-assign
    const was = (typeof V84SUB !== "undefined" && V84SUB && V84SUB.adm) ? V84SUB.adm.cur : "";
    const r = __set99adm.apply(this, arguments);
    try {
      if (tab !== was) {
        if (tab === "daily" || tab === "all") setTimeout(() => v99admDeskOpen("tab"), 0);
        if (tab === "ai" || tab === "all") setTimeout(() => v99admAirPull("tab"), 0);
      }
    } catch (e) { v99admErr("set", e); }
    return r;
  };
}

/* ══════════ No.501（11/19 大森さんの決め）：共通・デモ用のコードは、どの端末でも「名前は確かめず（自己申告）で通す」 ══════════
   調べたこと：同期サーバー（GAS login_）は共通・デモ用のコードを名前で断らない（11/17 決め D16）。21.97（logic_v2197ai.js）は
   「台帳に代表者名・招待メンバーがあれば照らす」としたが、ログインの前に名前を知る手段がこの端末に控えた台帳（前のログインの答え）だけ
   （ログイン前の lookup は名簿を返さない＝R09）。そのため FWD-2026＋田中 は、まっさらな端末では通り、同じ端末の2回目から断られた。
   直し（大森さんの決め 11/19「推奨①」）：共通・デモ用のコード（v96aiOpenCode＝V95PUB_CODES・サーバーの selfName:1・acct.pub／demo）では
   名前を照らさない（21.97 の V97AI_OPEN_VERIFY を 0 に＝21.97 自身が用意した戻し方）。名前が空でも通す（端末の控えで変わらないように）。
   通した名前は、登録の名前と同じでも「（自己申告）」（共通のコードはだれでも登録の名前を入れられる＝確かめていない。同期サーバー d95 も
   共通のコードの記録の名前すべてに付ける）。札・ログインの記録・やりとりの投稿者の印は 21.97 の仕組み（V97AI.pend → SES.v97self）を使う。
   お客様ごとのコード（共通・デモ用でないもの）の照合と、メール＋パスワードのログインは変えない。名前を確かめたい方は個別のアカウント
   （メール＋パスワード）＝ログイン画面の1行で案内する。 */
try { if (typeof V97AI_OPEN_VERIFY !== "undefined") V97AI_OPEN_VERIFY = 0; } catch (e) { v99admErr("openVerify", e); }   // eslint-disable-line no-global-assign
V99ADM.n.pub = 0;
function v99admOpenCode(a) { try { return !!a && typeof v96aiOpenCode === "function" && !!v96aiOpenCode(a); } catch (e) { return false; } }
if (typeof v56authLoginWho === "function") {
  const __lw99adm = v56authLoginWho;
  v56authLoginWho = function (a, raw) {   // eslint-disable-line no-global-assign
    let r = __lw99adm.apply(this, arguments);
    try {
      if (!v99admOpenCode(a)) return r;                       /* お客様ごとのコード：今のまま */
      const w = String(raw == null ? "" : raw).replace(/[​-‍﻿]/g, "").trim().slice(0, 60);
      if (!r || r.err) { r = { who: w, guest: 1 }; V99ADM.n.pub++; }   /* 端末に控えた台帳の名前では断らない（空でも通す） */
      const who = String(r.who != null ? r.who : w).replace(/[​-‍﻿]/g, "").trim();
      if (typeof V97AI !== "undefined" && V97AI) V97AI.pend = who ? { code: (typeof v97aiCode === "function" ? v97aiCode(a.code) : String(a.code || "").toUpperCase()), who, at: Date.now() } : null;
    } catch (e) { v99admErr("who", e); }
    return r;
  };
}
/* ログイン画面の体験用のコードの1行（名前を確かめたい方は個別のアカウント） */
const V99ADM_PUBTXT = {
  ja: "体験用のコードでは、お名前は確かめません（記録には「自己申告」と付きます）。お名前を確かめるには、個別のアカウント（メールアドレスとパスワード）をお使いください。",
  en: "With a trial code, your name is not verified (it is recorded as “self-reported”). To have your name verified, use an individual account (email and password).",
  zh: "使用体验用代码时，不核对姓名（记录中会注明“自行申报”）。如需核对姓名，请使用个人账户（邮箱和密码）。",
  es: "Con un código de prueba no se verifica el nombre (se registra como «autodeclarado»). Para verificar su nombre, use una cuenta individual (correo y contraseña)."
};
if (typeof v95pubText === "function") {
  v95pubText = function () { return V99ADM_PUBTXT[v99admLang()] || V99ADM_PUBTXT.ja; };   // eslint-disable-line no-global-assign
  try { if (typeof v95pubPaint === "function") setTimeout(v95pubPaint, 0); } catch (e) { v99admErr("pub", e); }
}

/* ══════════ 見張り（0.4秒ごと・軽い判定だけ） ══════════ */
setInterval(() => {
  try {
    const c = v99admCur();
    /* 荷主：AI 相談の画面を開いた */
    if (c === "ai" && V99ADM.prevCur !== "ai") v99admMeSoon("open");
    /* 管理者 */
    if (v99admAdm()) {
      v99admSyncTick();
      if (V99ADM.prevCur !== "adm" && V99ADM.prevCur) { setTimeout(() => v99admDeskOpen("page"), 0); }   /* 別の画面から管理コンソールに戻った */
      const sec = document.getElementById("v75adm"), K = V99ADM.desk;
      const shown = v99admShown(sec), view = v99admInView(sec);
      if (shown && !K.vis && K.vis !== null) { if (K.seen) v99admDeskOpen("tab"); }
      if (view && !K.view && K.seen) v99admDeskOpen("view");
      K.vis = shown; K.view = view; if (shown) K.seen = 1;
      const air = document.getElementById("v63air"), av = v99admShown(air);
      if (av && !V99ADM.air.vis && V99ADM.air.seen) v99admAirPull("view");
      V99ADM.air.vis = av; if (av) V99ADM.air.seen = 1;
    } else { V99ADM.desk.vis = false; V99ADM.desk.view = false; V99ADM.air.vis = false; }
    V99ADM.prevCur = c;
  } catch (e) { v99admErr("tick", e); }
}, 400);
