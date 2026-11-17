/* ═══ 21.96 分野 ai（2026-11-17 UAT 第9回相当・No.506・501・499・505〔R-8〕・セキュリティの所見 6.2）＝機能の中身 ═══
   土台・前の層（v95/logic_v2195ai.js ほか）は書き換えず、前の関数を控えてから包む。見せ方は rd_v96ai.js / rd_v96ai.css。
   ・No.506（AI のカウンタの「利用量%」がトークン基準と読めない）
     元データ：2分ごとの air_me の答え（V63A.last＝cap・used〔回数〕と tokCap・tokUsed〔トークン〕）。21.95 の rd_v95ai.js は
     「残り回数（回数の上限）」と「利用量 N%（トークンの上限）」を1行に混ぜていた。
     直し：回数とトークンを2つの数に分ける（v96aiMeter）。上限で止まったとき（429）は、どちらの上限かを決め直す
     （サーバーが air_cap と答えても、回数が上限より少なければトークンの上限）。今月・合計（この端末で数える）と
     今日の数（同期サーバーが数える）の違いも書く（文言は rd_v96ai.js）。上限の数そのものは同期サーバーが決める＝ここでは変えない。
   ・No.501（アクセスコードのログインで担当者名を確かめる）
     同期サーバーは変えられない。クライアントでの照合（v56authLoginWho）は、代表者名が無いアカウントを「共通のコード」と
     みなして、どんな名前でも通していた（v56authIsPub の既定）。
     直し：体験用（共通）・デモ用のコード（V95PUB_CODES・サーバーの selfName:1・acct.pub／acct.demo）以外で、アカウントに
     代表者名か招待メンバーの名前があれば、そのどれかと一致しない名前ではログインさせない（文言は 21.95 と同じ
     「アクセスコードかご担当者名が違います」）。照合は全角半角・空白・敬称（様・さん・殿・氏・Mr. など）・中黒の違いを許す。
     名前の一覧が無いアカウント・体験用のコードは今まで通り。確かめる前にサーバーへ送る先回りのログイン（v65auth）も、
     名前が一致しないと分かっているときは送らない。ログイン画面の体験用のコードの1行に「お客様ごとのコードでは照らし合わせる」を足す。
   ・No.499（会社を切り替えても受信箱の札が同じ数）
     受信箱（v33InboxItems）のバイヤーからの返信は「いま表示している商品」だけ、確認待ち・依頼ページなどはアカウント全体、
     左のメニューの「案件」の札（rd の v92goal）は自社の全部の会社で数えていた＝案件一覧（21.95：表示中の会社）と食い違う。
     直し：案件一覧と同じ範囲（表示中の会社／すべての会社＝rd_v95clsc）で数える。受信箱の返信は、その範囲のすべての商品の分を足す。
   ・R-8（No.505）見本の会社は会社の上限（10社）に数えない：10社のときの挙動を確かめた（直しは要らなかった・報告参照）。
   ・6.2（やりとりの新しいメッセージの公開範囲の初期値）
     メッセージの「共有」はファイルの公開範囲の「共有」と同じ意味（STANDAGE の担当・海外拠点にも見える。メッセージの添付は
     「共有」→ ファイルの「共有」で保存される＝d30AddFile）。ファイルの初期値（21.95：社内のみ）にそろえ、メッセージとスレッドの
     初期値を「社内のみ」にする（宛先・Cc の選び方は変えない）。 */
var V96AI = window.V96AI = { v: "21.96", err: [], open: {}, kidCode: {}, look: {}, ixForce: "", n: { deny: 0, lenient: 0, specBlock: 0, ixAdd: 0, scope: 0 } };
function v96aiErr(k, e) { try { V96AI.err.push(k + ": " + String((e && e.message) || e).slice(0, 160)); if (V96AI.err.length > 40) V96AI.err.shift(); } catch (x) { /* 無視 */ } }
function v96aiLang() { try { const el = document.getElementById("lang"); const v = String((typeof I18N !== "undefined" && I18N && I18N.lang) || (el && el.value) || "ja"); return /^en/.test(v) ? "en" : /^zh/.test(v) ? "zh" : /^es/.test(v) ? "es" : "ja"; } catch (e) { return "ja"; } }
function v96aiM(ja, en, zh, es) { const l = v96aiLang(); return l === "en" ? (en || ja) : l === "zh" ? (zh || en || ja) : l === "es" ? (es || en || ja) : ja; }
function v96aiE(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

/* ══════════ No.506：回数とトークンを分けた数 ══════════ */
/* air_me の答え（V63A.last）。on のときだけ */
function v96aiSrv() { try { const l = (typeof V63A !== "undefined" && V63A) ? V63A.last : null; return (l && l.ok && l.on) ? l : null; } catch (e) { return null; } }
/* 上で効いている上限（v95）の種類を、数と照らし合わせて決め直す
   cnt＝回数の上限・tok＝トークンの上限・all＝STANDAGE 全体・rate＝1分あたり・prov＝AI の会社の 429 */
function v96aiLimKind(L, cnt, tok) {
  if (!L) return "";
  let k = L.kind === "cap" ? "cnt" : L.kind;
  try {
    if (k === "cnt" && cnt && cnt.cap > 0 && cnt.used < cnt.cap) k = "tok";             /* 回数は残っている＝トークンの上限 */
    else if (k === "tok" && cnt && cnt.cap > 0 && cnt.used >= cnt.cap && tok && tok.cap > 0 && tok.used < tok.cap) k = "cnt";
  } catch (e) { v96aiErr("kind", e); }
  return k;
}
function v96aiMeter() {
  const l = v96aiSrv();
  const out = { cnt: null, tok: null, lim: "", near: "", srv: !!l };
  try {
    if (l) {
      const cap = +l.cap || 0, used = Math.max(0, +l.used || 0);
      out.cnt = { cap, used, left: cap > 0 ? Math.max(0, cap - used) : null, pct: cap > 0 ? Math.min(100, Math.floor(used / cap * 100)) : null };
      const tc = +l.tokCap || 0;
      if (tc > 0 || l.tokUsed != null) {
        const tu = Math.max(0, +l.tokUsed || 0);
        out.tok = { cap: tc, used: tu, pct: tc > 0 ? Math.min(100, Math.floor(tu / tc * 100)) : null, tin: l.tokIn != null ? +l.tokIn || 0 : null, tout: l.tokOut != null ? +l.tokOut || 0 : null };
      }
    }
    const L = (typeof v95aiLimNow === "function") ? v95aiLimNow() : null;
    out.lim = v96aiLimKind(L, out.cnt, out.tok);
    out.limAt = L ? L.at : 0;
    /* 上限に近い（80% 以上）：割合の大きいほう */
    if (!out.lim) {
      const pc = out.cnt && out.cnt.pct != null ? out.cnt.pct : -1, pt = out.tok && out.tok.pct != null ? out.tok.pct : -1;
      if (Math.max(pc, pt) >= 80) out.near = pt > pc ? "tok" : "cnt";
    }
  } catch (e) { v96aiErr("meter", e); }
  return out;
}
window.v96aiMeter = v96aiMeter;
/* トークンの数の書き方（日本語＝万・英語＝K/M） */
function v96aiTok(n) {
  n = Math.max(0, +n || 0);
  const l = v96aiLang();
  if (l === "ja" || l === "zh") {
    if (n >= 1e4) { const m = Math.floor(n / 1e4); return m.toLocaleString("en-US") + "万"; }
    return n.toLocaleString("en-US");
  }
  const t = (x, d) => String(+(x).toFixed(d));
  if (n >= 1e6) return t(Math.floor(n / 1e4) / 100, 2) + "M";
  if (n >= 1e3) return Math.floor(n / 1e3).toLocaleString("en-US") + "K";
  return String(n);
}
window.v96aiTok = v96aiTok;

/* ══════════ No.501：アクセスコードのログインの名前の照合 ══════════ */
function v96aiCodeN(s) { try { if (typeof v56authCode === "function") return v56authCode(s); } catch (e) { /* 無視 */ } return String(s == null ? "" : s).replace(/\s+/g, "").toUpperCase(); }
/* 表記ゆれを除いた名前の鍵：全角半角（NFKC）・空白・中黒・敬称・大文字小文字 */
function v96aiNameKey(s) {
  let x = String(s == null ? "" : s);
  try { x = x.normalize("NFKC"); } catch (e) { /* 無視 */ }
  x = x.replace(/[​-‍﻿]/g, "").trim();
  x = x.replace(/^(?:mr|mrs|ms|miss|dr)\.?\s+/i, "");
  x = x.replace(/[\s・･·.．,，]+/g, "");
  x = x.replace(/(?:様|さま|サマ|さん|サン|殿|どの|氏|先生)$/, "");
  return x.toLowerCase();
}
window.v96aiNameKey = v96aiNameKey;
function v96aiKidOf(code) { try { if (typeof v56authKidOf === "function") return v56authKidOf(code) || ""; } catch (e) { /* 無視 */ } return ""; }
/* 体験用（共通）・デモ用のコードか（同期サーバーが名前を確かめないコード） */
function v96aiOpenCode(a) {
  try {
    const code = v96aiCodeN(a && a.code);
    if (!code) return true;
    if (typeof V95PUB_CODES !== "undefined" && V95PUB_CODES && V95PUB_CODES[code]) return true;   // eslint-disable-line no-undef
    if (typeof V95PUB !== "undefined" && V95PUB && V95PUB.seen && V95PUB.seen[code]) return true;   /* サーバーの selfName:1 */
    if (a && (+a.pub === 1 || +a.demo === 1)) return true;
    const kid = v96aiKidOf(code);
    if (kid) {
      if (V96AI.open[kid] === 1) return true;
      if (typeof V56AUTH !== "undefined" && V56AUTH && V56AUTH.pubKid && V56AUTH.pubKid[kid] === 1) return true;
      if (typeof V61 !== "undefined" && V61 && V61.acct && V61.acct[kid] && (V61.acct[kid].pub === 1 || V61.acct[kid].demo === 1)) return true;
    }
  } catch (e) { v96aiErr("open", e); }
  return false;
}
/* 登録された名前（代表者名＋削除されていない招待メンバー） */
function v96aiNames(a) {
  const out = [];
  try {
    let rep = "";
    try { rep = (typeof v56authRepName === "function") ? v56authRepName(a) : String((a && a.who) || "").replace(/様$/, "").trim(); } catch (e) { rep = ""; }
    if (rep && rep !== "—" && rep !== "-") out.push({ name: rep, kind: "rep" });
    ((a && a.members) || []).forEach((m) => { if (m && m.name && !(m.del === 1 || m.del === true)) out.push({ name: String(m.name), kind: "mem", m }); });
  } catch (e) { v96aiErr("names", e); }
  return out;
}
function v96aiMatch(a, raw) {
  const k = v96aiNameKey(raw);
  if (!k) return null;
  return v96aiNames(a).find((x) => v96aiNameKey(x.name) === k) || null;
}
/* 名前を確かめるアカウントか：体験用・デモ用ではなく、名前の一覧がある */
function v96aiNeedName(a) { return !!a && !v96aiOpenCode(a) && v96aiNames(a).length > 0; }
window.v96aiNeedName = v96aiNeedName;
function v96aiLgMsg() { try { if (typeof v95aiLgMsg === "function") return v95aiLgMsg(); } catch (e) { /* 無視 */ } return v96aiM("アクセスコードかご担当者名が違います。入力内容をご確認ください。", "The access code or the name is incorrect. Please check what you entered."); }
function v96aiNeedMsg() { try { if (typeof V56AUTH_MSG !== "undefined" && V56AUTH_MSG && V56AUTH_MSG.need) return V56AUTH_MSG.need; } catch (e) { /* 無視 */ } return "ご担当者名を入力してください。"; }
if (typeof v56authLoginWho === "function") {
  const __lw96ai = v56authLoginWho;
  v56authLoginWho = function (a, raw) {
    const r = __lw96ai.apply(this, arguments);
    try {
      /* 体験用・デモ用のコード（サーバーが名前を確かめず「自己申告」と記録する）：画面の1行のとおり、名前の違いでは止めない
         （前：デモ用のコードに代表者名があると、v56 が「違います」と止め、画面の「お名前は確かめません」と食い違った） */
      if (a && v96aiOpenCode(a)) {
        if (r && r.err && v96aiNameKey(raw) && !v96aiMatch(a, raw)) { V96AI.n.self = (V96AI.n.self || 0) + 1; return { who: String(raw).replace(/[​-‍﻿]/g, "").trim().slice(0, 60), guest: 1 }; }
        return r;
      }
      if (!a || !v96aiNeedName(a)) return r;
      const f = v96aiMatch(a, raw);
      if (r && r.err) {
        /* v56 の照合より広く（中黒・Mr. など）一致したら、登録の名前で通す */
        if (f) { V96AI.n.lenient++; return { who: f.name, kind: f.kind }; }
        return r;
      }
      if (r && r.guest) {
        /* 前：代表者名の無いアカウントは「共通のコード」とみなし、どんな名前でも通していた */
        if (f) return { who: f.name, kind: f.kind };
        if (!v96aiNameKey(raw)) return { err: v96aiNeedMsg() };
        V96AI.n.deny++;
        return { err: v96aiLgMsg() };
      }
    } catch (e) { v96aiErr("who", e); }
    return r;
  };
}
/* 同期サーバーの lookup・login の答えから、体験用・デモ用のコードかを覚える（kid ごと） */
if (typeof syncCall === "function") {
  const __sc96ai = syncCall;
  syncCall = async function (op, body, opt) {
    const r = await __sc96ai.apply(this, arguments);
    try {
      if ((op === "lookup" || op === "login") && body && body.kid && r && r.ok) {
        const kid = String(body.kid), A = r.acct || {};
        V96AI.open[kid] = (+r.selfName === 1 || +A.pub === 1 || +A.demo === 1) ? 1 : 0;
        if (op === "lookup") {
          const ci = document.getElementById("lg-code");
          if (ci && ci.value) V96AI.kidCode[kid] = v96aiCodeN(ci.value);
          V96AI.look[kid] = Date.now();
        }
      }
    } catch (e) { v96aiErr("sc", e); }
    return r;
  };
}
/* 先回りのログイン（v65auth：ボタンを押した瞬間に、名前を確かめる前に login を送る）：
   名前を確かめるアカウントで、1分以内にサーバーの台帳を見ていて、名前が一致しないと分かっているときは送らない。
   送らなかった分は失敗として返す（本番のログインのときに v65 が先回りの結果を使わず、あらためて送る） */
(function () {
  try {
    if (typeof window.fetch !== "function") return;
    const of = window.fetch;
    window.fetch = function (u, init) {
      try {
        const b = init && typeof init.body === "string" ? init.body : "";
        if (b && b.indexOf('"v65spec":1') >= 0 && b.indexOf('"op":"login"') >= 0) {
          const j = JSON.parse(b), kid = String(j.kid || ""), code = V96AI.kidCode[kid];
          const a = code && typeof findAcct === "function" ? findAcct(code) : null;
          if (a && Date.now() - (V96AI.look[kid] || 0) < 60000 && v96aiNeedName(a)) {
            const who = (j.usage && j.usage.who) || "";
            if (!v96aiMatch(a, who)) { V96AI.n.specBlock++; return Promise.reject(new Error("v96: name not registered")); }
          }
        }
      } catch (e) { v96aiErr("spec", e); }
      return of.apply(this, arguments);
    };
  } catch (e) { v96aiErr("fetch", e); }
})();
/* ログイン画面の体験用のコードの1行（21.95.1 決め D16）：本番（お客様ごとのコード）では照らし合わせることも書く */
const V96AI_PUBTXT = {
  ja: "体験用のコードでは、お名前は確かめません（記録には「自己申告」と付きます）。お客様ごとのコードでは、登録されたお名前と照らし合わせます",
  en: "With a trial code, your name is not verified (it is recorded as “self-reported”). With your company's own code, the name is checked against the registered names.",
  zh: "使用体验用代码时，不核对姓名（记录中会注明“自行申报”）。使用各客户专用的代码时，会与登记的姓名进行核对。",
  es: "Con un código de prueba no se verifica el nombre (se registra como «autodeclarado»). Con el código propio de su empresa, el nombre se coteja con los nombres registrados."
};
if (typeof v95pubText === "function") {
  v95pubText = function () { return V96AI_PUBTXT[v96aiLang()] || V96AI_PUBTXT.ja; };
  try { if (typeof v95pubPaint === "function") setTimeout(v95pubPaint, 0); } catch (e) { v96aiErr("pub", e); }
}

/* ══════════ No.499：受信箱と「案件」の札を、案件一覧と同じ範囲（表示中の会社／すべての会社）で数える ══════════ */
function v96aiTens() { try { return (typeof TENS !== "undefined" && Array.isArray(TENS)) ? TENS : []; } catch (e) { return []; } }
function v96aiTen() { try { return typeof TEN !== "undefined" ? TEN : null; } catch (e) { return null; } }
function v96aiCoOf(t) { try { return t ? (typeof tenCoOf === "function" ? tenCoOf(t) : String(t.co || "").trim()) : ""; } catch (e) { return ""; } }
/* 案件一覧（rd_v95misc）の範囲：co＝表示中の会社（既定）・all＝すべての会社 */
function v96aiScope() {
  if (V96AI.ixForce) return V96AI.ixForce;
  try { if (window.RDX && typeof window.RDX.v95clScope === "function") return window.RDX.v95clScope(); } catch (e) { /* 無視 */ }
  try { return localStorage.getItem("rd_v95clsc") === "all" ? "all" : "co"; } catch (e) { return "co"; }
}
window.v96aiScope = v96aiScope;
/* いまの商品が商品の一覧（TENS）にあり、商品が2つ以上あるときだけ範囲を考える（見本の商品〔PRODUCTS〕を開いているときは今まで通り＝案件一覧と同じ） */
function v96aiScopeInfo() {
  const T = v96aiTens(), t0 = v96aiTen();
  const inList = !!t0 && T.indexOf(t0) >= 0, co0 = v96aiCoOf(t0);
  const cos = new Set(T.map(v96aiCoOf));
  return { on: inList && T.length > 1, co0, nCo: cos.size, nProd: T.filter((t) => v96aiCoOf(t) === co0).length, sc: v96aiScope() };
}
window.v96aiScopeInfo = v96aiScopeInfo;
/* 返事が要るスレッド（v90anaMsgStat と同じ決め方：最後がバイヤー、または未読がある・失注は除く） */
function v96aiNeedThreads(t) {
  const out = [];
  try {
    Object.values((t && t.dmThreads) || {}).forEach((th) => {
      try {
        const ms = (th && Array.isArray(th.msgs) ? th.msgs : []).slice().sort((a, b) => (+a.at || 0) - (+b.at || 0));
        if (!ms.length) return;
        let st = th.status || "";
        try { if (typeof v90anaSt === "function") st = v90anaSt(th) || st; } catch (e) { /* 無視 */ }
        if (/^失注/.test(String(st))) return;
        const last = ms[ms.length - 1];
        try { if (typeof v86msgIsProbe === "function" && v86msgIsProbe(last)) return; } catch (e) { /* 無視 */ }
        if (last.w === "by" || (+th.unread || 0) > 0) out.push({ th, last: ms.filter((m) => m.w === "by").slice(-1)[0] || last });
      } catch (e) { /* 1件の誤りで止めない */ }
    });
  } catch (e) { v96aiErr("need", e); }
  return out;
}
function v96aiOpenIn(pi, id) {
  try {
    const s = document.getElementById("psw");
    if (s && [...s.options].some((o) => o.value === "t:" + pi)) { s.value = "t:" + pi; s.dispatchEvent(new Event("change")); }
    setTimeout(() => { try { if (typeof openDMThread === "function") openDMThread(id); } catch (e) { v96aiErr("open1", e); } }, 600);
  } catch (e) { v96aiErr("openIn", e); }
}
if (typeof v33InboxItems === "function") {
  const __ix96ai = v33InboxItems;
  v33InboxItems = function () {
    let L = __ix96ai.apply(this, arguments);
    try {
      if (!Array.isArray(L)) return L;
      if ((typeof FWDON !== "undefined" && FWDON) || (typeof v84cFwd === "function" && v84cFwd())) return L;   // eslint-disable-line no-undef
      const S = v96aiScopeInfo();
      if (!S.on) return L;
      const T = v96aiTens(), t0 = v96aiTen();
      const ix = (typeof v33IxState === "function") ? v33IxState() : {}, now = Date.now();
      const have = new Set(L.map((x) => String((x && x.key) || "")));
      const add = [];
      T.forEach((t, pi) => {
        if (!t || t === t0) return;
        if (S.sc !== "all" && v96aiCoOf(t) !== S.co0) return;
        v96aiNeedThreads(t).forEach((n) => {
          let key = "dm:" + n.th.id + ":" + (n.th.msgs || []).length;
          if (have.has(key)) key += "@" + (t.uid || t.item || pi);
          if (have.has(key)) return;
          const s = ix[key];
          if (s && (s.st === "done" || (s.st === "later" && now < (s.until || 0)))) return;
          let nm = "";
          try { nm = typeof v90anaName === "function" ? v90anaName(n.th) : ""; } catch (e) { nm = ""; }
          if (!nm) nm = String((n.th.cty || "") + " " + (n.th.biz || "")).trim() || String(n.th.id);
          const prod = String(t.item || t.file || "").slice(0, 30), co = v96aiCoOf(t);
          const where = S.sc === "all" && co !== S.co0 ? v96aiM(`会社：${co}・商品：${prod}`, `Company: ${co} · Product: ${prod}`) : v96aiM(`商品：${prod}`, `Product: ${prod}`);
          add.push({ key, k: "reply", t: v96aiM("バイヤーから返信（まだ返していません）", "Reply from buyer (not answered yet)") + v96aiM("：", ": ") + nm,
            sub: where + " ・ " + String((n.last && (n.last.subj || n.last.body)) || "").replace(/<[^>]+>/g, " ").replace(/[*#>`]/g, "").replace(/\s+/g, " ").trim().slice(0, 50),
            due: 0, at: +n.last.at || 0, v96pi: pi, v96co: co, go: () => v96aiOpenIn(pi, n.th.id) });
          have.add(key);
        });
      });
      if (add.length) {
        V96AI.n.ixAdd += add.length;
        L = L.slice();
        const i = L.findIndex((x) => x && x.k !== "appr" && x.k !== "reply");
        if (i < 0) L = L.concat(add); else L.splice(i, 0, ...add);
      }
    } catch (e) { v96aiErr("ix", e); }
    return L;
  };
}
/* 札の数（v33InboxBadge と同じ数え方：確認・承認／返信／今日までの期限）を、範囲を決めて数える */
function v96aiIxCount(sc) {
  const prev = V96AI.ixForce;
  try {
    V96AI.ixForce = sc || "";
    const d1 = (typeof v33Day0 === "function" ? v33Day0() : new Date(new Date().toDateString()).getTime()) + 864e5;
    return v33InboxItems().filter((x) => x && (x.k === "appr" || x.k === "reply" || (x.due && x.due < d1))).length;
  } catch (e) { v96aiErr("ixn", e); return null; } finally { V96AI.ixForce = prev; }
}
window.v96aiIxCount = v96aiIxCount;
/* 案件一覧の「要対応」と同じ数（rd の allCases の todo）を、範囲を決めて数える */
function v96aiTodoCount(sc) {
  try {
    const RD = window.RDX;
    if (!RD || typeof RD.allCases !== "function") return null;
    const T = v96aiTens(), t0 = v96aiTen(), co0 = v96aiCoOf(t0);
    const L = RD.allCases() || [];
    return L.filter((c) => c && c.todo && (sc === "all" || v96aiCoOf(T[c.pi] || (c.pi < 0 ? t0 : null)) === co0)).length;
  } catch (e) { v96aiErr("todo", e); return null; }
}
window.v96aiTodoCount = v96aiTodoCount;
/* 範囲を変えたとき（受信箱の上の切り替え） */
function v96aiSetScope(v) {
  try { localStorage.setItem("rd_v95clsc", v === "all" ? "all" : "co"); } catch (e) { v96aiErr("setsc", e); }
  V96AI.n.scope++;
  try { if (typeof v33InboxBadge === "function") v33InboxBadge(); } catch (e) { v96aiErr("bdg", e); }
}
window.v96aiSetScope = v96aiSetScope;

/* ══════════ 6.2：やりとりの新しいメッセージ・スレッドの公開範囲の初期値＝「社内のみ」（ファイルと同じ） ══════════ */
try { if (typeof msgNewScope !== "undefined" && msgNewScope === "共有") msgNewScope = "社内のみ"; } catch (e) { v96aiErr("msc", e); }   // eslint-disable-line no-undef
/* 「🤖 AIに質問」の切り替えを消したとき（dk16OneAi）に「共有」へ戻していた分も「社内のみ」へ */
if (typeof dk16OneAi === "function") {
  const __oa96ai = dk16OneAi;
  dk16OneAi = function () {
    let was = "";
    try { was = msgNewScope; } catch (e) { was = ""; }   // eslint-disable-line no-undef
    const r = __oa96ai.apply(this, arguments);
    try {
      if (was === "AIに質問" && msgNewScope === "共有") {   // eslint-disable-line no-undef
        msgNewScope = "社内のみ";   // eslint-disable-line no-undef
        const n = document.getElementById("mscopeNow"); if (n) n.textContent = "社内のみ";
        document.querySelectorAll("[data-mscope]").forEach((x) => { x.className = "btn" + (x.dataset.mscope === "社内のみ" ? "" : " g"); });
      }
    } catch (e) { v96aiErr("oneai", e); }
    return r;
  };
}
/* 新しいスレッドの窓（thNewOpen）：はじめの選択を「社内のみ」に */
if (typeof thNewOpen === "function") {
  const __tn96ai = thNewOpen;
  thNewOpen = function () {
    const r = __tn96ai.apply(this, arguments);
    try { const x = document.querySelector('input[name="thNS"][value="社内のみ"]'); if (x) x.checked = true; } catch (e) { v96aiErr("thns", e); }
    return r;
  };
}
