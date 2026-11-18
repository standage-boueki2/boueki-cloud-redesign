/* ═══ 21.97 分野 ai（2026-11-18 第10回相当 UAT〔21.96〕の直し No.501・セキュリティの所見 5・R-7〔No.506〕）＝機能の中身 ═══
   土台・前の層（v95/logic_v2195ai.js・v95/logic_v2195pub.js・v96/logic_v2196ai.js ほか）は書き換えず、前の関数を控えてから包む。
   見せ方（AI のカウンタ・ログイン画面の待ち時間の表示・「自己申告」の札）は rd_v97ai.js / rd_v97ai.css。
   ・No.501（未解消・高）：TRIAL-2026／田中・FWD-2026／田中 のどちらもログインでき、記録に登録の無い名前が残った。
     原因：21.96 の v56authLoginWho の包み（v96aiOpenCode のとき）が、体験用・デモ用のコードは名前が違っても「自己申告」で通していた
     （アカウントに代表者名・招待メンバーの名前が登録されていても通す）。通した名前は SES.who にそのまま入り、アカウントの札（#usrchip）・
     利用の記録（logU の「ログイン（田中）」）・やりとりの投稿者・同期サーバーへの usage.who に、確かめた名前と同じ形で残っていた。
     直し：(a) 体験用・デモ用のコードでも、アカウントに登録されたお名前（代表者・削除されていない招待メンバー）があれば照らし合わせ、
         一致しない名前ではログインさせない（公開している共通のコード〔V95PUB_CODES〕は、名前が一致しないことを具体的に書く。
         公開していないコードは 21.95 の決め〔どちらが違うかを明かさない〕のまま）。登録されたお名前が1つも無いコードだけ、今まで通り自己申告で通す。
         （V97AI_OPEN_VERIFY を 0 にすると 21.96 の動き〔体験用は名前を確かめない〕に戻せる＝要判断の逃げ道）
       (b) 確かめられなかった名前（登録の名前と一致しないまま通したログイン）は SES.v97self＝1 とし、アカウントの札・利用の記録（logU）・
         やりとりの投稿（m.whoSelf）に「（自己申告）」を付ける。同期サーバーへの usage には whoSelf:1 を添える（名前そのものには付けない：
         同期サーバー d95 が体験用のコードの記録に「（自己申告）」を付けるため、二重にしない）。社外に出る文面（メール・書類の差出人）には付けない。
       (c) ログイン画面の体験用のコードの1行を、この動きのとおりに書き直す（お客様ごとのコードは 11/9 で終わり、ご契約はメール＋パスワード）。
     同期サーバー側が要ること：login・lookup で、登録された名前と照らし合わせて一致しなければ断る（クライアントの照合は、手を加えた
     クライアントでは外せる）・体験用のコードの記録の名前に「（自己申告）」を付ける（d95 で実装済みのはず・whoSelf:1 も見る）。
   ・セキュリティ（第10回 所見 5）：まちがったコードで1回目に何も出ず、2回目に汎用の誤りが出た（どちらが違うかも分からない）。
     続けてまちがえても待ち時間が出なかった（ログイン画面には「試行が続くと、待ち時間を入れて STANDAGE に知らせます」とある）。
     原因：①コードの欄で Enter を押すと、名前の欄が空のときは名前の欄へ移るだけで何も出ない（v56authBindLogin）。②同期サーバーの答えが
     遅いと「☁ サーバーの応答を待っています…」のまま 25＋30 秒待ち、その間は誤りに見えない。③待ち時間は同期サーバーの側（login.burst の記録）
     だけで、画面には待ち時間の仕組みが無い。
     直し：ボタン・Enter のどちらでも、1回ごとに結果を必ず出す（台帳を確かめ終えても何も出ていなければ誤りを出す＝見張り）。名前の欄へ移るときは
     「続けてご担当者名を」と出す。誤りの下に「確かめる順番」（コードの形 → コード → お名前）と、続けてまちがえた回数・待ち時間までの残りを出す。
     この端末で続けて 3回まちがえると 30秒、5回で 2分、7回で 5分、ボタンを止めて残りの秒を数える（再読み込みしても続く・30分まちがえなければ
     数え直す・ログインできたら 0 に）。存在しないコードと名前の違いは、公開していないコードでは今まで通り分けない（コードの存在を明かさない）。
     コードの形（英数字をハイフンで区切る形）が違うときだけは、サーバーに聞かなくても分かるので「コードの形」と書く。
   ・R-7（No.506・条件つき）：今月 32／今日 161／残り 839／トークン 33%。「今月」がこの端末で数えた AI商社マンへの質問の数、「今日」が同期サーバーの
     AI の処理の数で、今月が今日より少なく見えた。回数の 16.1% とトークンの 33% も、何の割合か分かりにくかった。
     直し（数は v97aiCounts、見せ方は rd_v97ai.js）：同期サーバーの「今日の回数・トークン」を日ごとにこの端末で控え（アカウントは SYNC.kid の先頭で区別。
     コードは置かない）、今月の回数＝控えた日の合計（今日を必ず含む＝今日より少なくならない）。この端末で数えた質問の数は「うち、この端末から
     AI商社マンへの質問」と別に書く（今月の回数より多いときは内蔵エンジンの答えを含む数として分けて書く）。割合は 161／1,000＝16.1%・
     132万／400万＝33% と式で出し、どちらの上限に先に届きそうかを書く。 */
var V97AI = window.V97AI = { v: "21.97", err: [], inflight: 0, look: null, att: null, pend: null, fmtBad: 0, n: { verify: 0, self: 0, fail: 0, lock: 0, block: 0, guard: 0, mark: 0, rec: 0 } };
/* 体験用・デモ用のコードでも、登録されたお名前があれば照らし合わせる（0＝21.96 の動きに戻す） */
var V97AI_OPEN_VERIFY = 1;
function v97aiErr(k, e) { try { V97AI.err.push(k + ": " + String((e && e.message) || e).slice(0, 160)); if (V97AI.err.length > 40) V97AI.err.shift(); } catch (x) { /* 無視 */ } }
function v97aiLang() { try { if (typeof v96aiLang === "function") return v96aiLang(); } catch (e) { /* 無視 */ } return "ja"; }
function v97aiM(ja, en, zh, es) { const l = v97aiLang(); return l === "en" ? (en || ja) : l === "zh" ? (zh || en || ja) : l === "es" ? (es || en || ja) : ja; }
function v97aiE(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function v97aiCode(s) { try { if (typeof v56authCode === "function") return v56authCode(s); } catch (e) { /* 無視 */ } return String(s == null ? "" : s).replace(/\s+/g, "").toUpperCase(); }
function v97aiPubCode(code) { try { const c = v97aiCode(code); return !!(c && ((typeof V95PUB_CODES !== "undefined" && V95PUB_CODES[c]) || (typeof V95PUB !== "undefined" && V95PUB && V95PUB.seen && V95PUB.seen[c] && /^(TRIAL|FWD)-/.test(c)))); } catch (e) { return false; } }   // eslint-disable-line no-undef
const V97AI_SELF = { ja: "（自己申告）", en: " (self-reported)", zh: "（自行申报）", es: " (autodeclarado)" };
function v97aiSelfTag() { return V97AI_SELF[v97aiLang()] || V97AI_SELF.ja; }
function v97aiHasSelfTag(s) { return /（自己申告）|\(self-reported\)|（自行申报）|\(autodeclarado\)/.test(String(s || "")); }

/* ══════════ No.501 (a)：体験用・デモ用のコードでも、登録されたお名前があれば照らし合わせる ══════════ */
const V97AI_MIS = {
  ja: "お名前が、このコードに登録されているお名前（代表者・招待されたメンバー）と一致しません。体験用のコードでも、登録されたお名前でログインします。お名前の登録・変更は STANDAGE の担当までご連絡ください。",
  en: "The name does not match the names registered for this code (representative or invited members). Trial codes also sign in with a registered name. To register or change a name, contact your STANDAGE representative.",
  zh: "姓名与此代码登记的姓名（代表人・受邀成员）不一致。体验用代码也需使用登记的姓名登录。登记或更改姓名请联系 STANDAGE 负责人。",
  es: "El nombre no coincide con los nombres registrados para este código (representante o miembros invitados). Los códigos de prueba también inician sesión con un nombre registrado. Para registrar o cambiar un nombre, contacte con su representante de STANDAGE."
};
function v97aiMisMsg() { return V97AI_MIS[v97aiLang()] || V97AI_MIS.ja; }
function v97aiNeedMsg() { try { if (typeof v96aiNeedMsg === "function") return v96aiNeedMsg(); } catch (e) { /* 無視 */ } return "ご担当者名を入力してください。"; }
function v97aiUniMsg() { try { if (typeof v96aiLgMsg === "function") return v96aiLgMsg(); } catch (e) { /* 無視 */ } return v97aiM("アクセスコードかご担当者名が違います。入力内容をご確認ください。", "The access code or the name is incorrect. Please check what you entered."); }
if (typeof v56authLoginWho === "function") {
  const __lw97ai = v56authLoginWho;
  v56authLoginWho = function (a, raw) {
    let r = __lw97ai.apply(this, arguments);
    try {
      const open = !!a && typeof v96aiOpenCode === "function" && v96aiOpenCode(a);
      const names = (a && typeof v96aiNames === "function") ? v96aiNames(a) : [];
      const f = (a && typeof v96aiMatch === "function") ? v96aiMatch(a, raw) : null;
      if (V97AI_OPEN_VERIFY && open && names.length) {
        if (f) r = { who: f.name, kind: f.kind };
        else if (!(typeof v96aiNameKey === "function" ? v96aiNameKey(raw) : String(raw || "").trim())) r = { err: v97aiNeedMsg() };
        else { V97AI.n.verify++; r = { err: v97aiPubCode(a.code) ? v97aiMisMsg() : v97aiUniMsg() }; }
      }
      /* 通すとき：登録の名前と一致しないまま通した名前＝自己申告（ログインが終わったら SES に印を付ける） */
      if (r && !r.err && a) {
        const who = String(r.who != null ? r.who : raw || "").replace(/[​-‍﻿]/g, "").trim();
        const ok = !!(typeof v96aiMatch === "function" && v96aiMatch(a, who));
        V97AI.pend = (!ok && who) ? { code: v97aiCode(a.code), who, at: Date.now() } : null;
      }
    } catch (e) { v97aiErr("who", e); }
    return r;
  };
}

/* ══════════ No.501 (b)：確かめられなかった名前に「（自己申告）」 ══════════ */
const V97AI_SK = "rd_v97self";
function v97aiSes() { try { return (typeof SES !== "undefined" && SES) ? SES : null; } catch (e) { return null; } }   // eslint-disable-line no-undef
function v97aiIsSelf() { const s = v97aiSes(); return !!(s && s.t === "trial" && s.v97self === 1 && s.who); }
window.v97aiIsSelf = v97aiIsSelf;
function v97aiMarkSelf() {
  try {
    const s = v97aiSes(), P = V97AI.pend;
    if (!s || s.t !== "trial" || !P || !s.who) return false;
    if (v97aiCode(s.code) !== P.code || String(s.who).trim() !== P.who) return false;
    if (s.v97self !== 1) { s.v97self = 1; V97AI.n.self++; }
    try { sessionStorage.setItem(V97AI_SK, P.code.length + ":" + P.who); } catch (e) { /* 無視 */ }
    return true;
  } catch (e) { v97aiErr("mark", e); return false; }
}
/* 再読み込み：同じタブで自己申告で入ったログインなら、印を戻す（コードそのものは置かない＝長さと名前だけ） */
(function () {
  try {
    const s = v97aiSes(), k = sessionStorage.getItem(V97AI_SK);
    if (s && s.t === "trial" && k && k === v97aiCode(s.code).length + ":" + String(s.who || "").trim()) s.v97self = 1;
    else if (k && !s) sessionStorage.removeItem(V97AI_SK);
    if (s && s.t) localStorage.removeItem("rd_v97lgf");   /* ログインできている端末：続けてまちがえた回数は 0 から */
  } catch (e) { v97aiErr("boot", e); }
})();
window.v97aiSelfName = function (n) { const w = String(n == null ? "" : n); return (w && !v97aiHasSelfTag(w)) ? w + v97aiSelfTag() : w; };
/* 利用の記録（logU）：ログインの記録の名前に印 */
if (typeof logU === "function") {
  const __lu97ai = logU;
  logU = function (type, detail) {   // eslint-disable-line no-global-assign
    try {
      v97aiMarkSelf();
      if (v97aiIsSelf() && typeof detail === "string") {
        const w = String(SES.who);   // eslint-disable-line no-undef
        if (w && detail.indexOf(w) >= 0 && !v97aiHasSelfTag(detail)) { detail = detail.replace(w, w + "（自己申告）"); V97AI.n.mark++; arguments[1] = detail; }
      }
    } catch (e) { v97aiErr("logu", e); }
    return __lu97ai.apply(this, arguments);
  };
}
/* 同期サーバーへの usage：名前はそのまま（d95 が印を付ける）・whoSelf:1 を添える */
if (typeof syncUsage === "function") {
  const __su97ai = syncUsage;
  syncUsage = function () {   // eslint-disable-line no-global-assign
    const u = __su97ai.apply(this, arguments);
    try { if (u && typeof u === "object" && v97aiIsSelf()) u.whoSelf = 1; } catch (e) { v97aiErr("usage", e); }
    return u;
  };
}
/* やりとりの投稿：投稿者が自己申告の名前なら、記録に whoSelf:1（表示は rd_v97ai.js） */
if (typeof sendMsg === "function") {
  const __sm97ai = sendMsg;
  sendMsg = function () {   // eslint-disable-line no-global-assign
    let L = null, n0 = 0;
    try { L = (typeof msgStore === "function") ? msgStore() : null; n0 = Array.isArray(L) ? L.length : 0; } catch (e) { L = null; }
    const r = __sm97ai.apply(this, arguments);
    try {
      if (Array.isArray(L) && v97aiIsSelf()) {
        const w = String(SES.who);   // eslint-disable-line no-undef
        for (let i = n0; i < L.length; i++) { const m = L[i]; if (m && m.who === w && !m.ai) { m.whoSelf = 1; V97AI.n.mark++; } }
      }
    } catch (e) { v97aiErr("send", e); }
    return r;
  };
}

/* ══════════ No.501 (c)：ログイン画面の体験用のコードの1行 ══════════ */
const V97AI_PUBTXT = {
  ja: "体験用・デモ用のコードでも、そのコードに登録されたお名前（代表者・招待メンバー）があれば照らし合わせます。登録されたお名前が無いコードでは確かめられないため、画面と記録のお名前に「（自己申告）」と付けます。ご契約のアカウントは、メールアドレスとパスワードでログインします（ご本人を確かめます）。",
  en: "With a trial or demo code, your name is checked against the names registered for that code (representative or invited members), if any. If the code has no registered names, the name cannot be checked and is shown and recorded as “self-reported”. Contracted accounts sign in with an email address and password (identity is verified).",
  zh: "使用体验用・演示用代码时，如果该代码登记了姓名（代表人・受邀成员），会进行核对。没有登记姓名的代码无法核对，画面和记录中的姓名会注明“自行申报”。签约账户使用邮箱和密码登录（会确认本人）。",
  es: "Con un código de prueba o demostración, el nombre se coteja con los nombres registrados para ese código (representante o miembros invitados), si los hay. Si el código no tiene nombres registrados, no se puede verificar y se muestra y registra como «autodeclarado». Las cuentas contratadas inician sesión con correo y contraseña (se verifica la identidad)."
};
if (typeof v95pubText === "function") {
  v95pubText = function () { return V97AI_PUBTXT[v97aiLang()] || V97AI_PUBTXT.ja; };   // eslint-disable-line no-global-assign
  try { if (typeof v95pubPaint === "function") setTimeout(v95pubPaint, 0); } catch (e) { v97aiErr("pub", e); }
}

/* ══════════ セキュリティ（所見 5）：1回ごとに結果を出す・続けてまちがえたら待ち時間 ══════════ */
const V97AI_LGF = "rd_v97lgf";
function v97aiLgfGet() {
  try {
    const o = JSON.parse(localStorage.getItem(V97AI_LGF) || "null");
    if (o && typeof o === "object") {
      const last = +o.last || 0;
      if (Date.now() - last > 30 * 60000 && !(+o.until > Date.now())) return { n: 0, last: 0, until: 0 };
      return { n: Math.max(0, +o.n || 0), last, until: +o.until || 0 };
    }
  } catch (e) { v97aiErr("lgfget", e); }
  return { n: 0, last: 0, until: 0 };
}
function v97aiLgfSet(o) { try { if (!o || !o.n) localStorage.removeItem(V97AI_LGF); else localStorage.setItem(V97AI_LGF, JSON.stringify(o)); } catch (e) { v97aiErr("lgfset", e); } }
/* 続けてまちがえた回数 → 待つ秒（3〜4回 30秒・5〜6回 2分・7回から 5分） */
function v97aiWaitOf(n) { return n >= 7 ? 300 : n >= 5 ? 120 : n >= 3 ? 30 : 0; }
window.v97aiWaitOf = v97aiWaitOf;
function v97aiLgfFail() { const o = v97aiLgfGet(); o.n++; o.last = Date.now(); const w = v97aiWaitOf(o.n); o.until = w ? Date.now() + w * 1000 : 0; v97aiLgfSet(o); V97AI.n.fail++; if (w) V97AI.n.lock++; return o; }
function v97aiLgfOk() { v97aiLgfSet(null); }
function v97aiLgfLeft() { const o = v97aiLgfGet(); return Math.max(0, Math.ceil(((+o.until || 0) - Date.now()) / 1000)); }
window.v97aiLgf = () => { const o = v97aiLgfGet(); return { n: o.n, left: v97aiLgfLeft(), next: v97aiWaitOf(o.n + 1), toWait: o.n < 3 ? 3 - o.n : (o.n < 5 ? 5 - o.n : o.n < 7 ? 7 - o.n : 0) }; };
window.v97aiLgfClear = v97aiLgfOk;
/* コードの形（土台の v56authPreOk・v65 と同じ形）：英数字 2〜12 字をハイフンで 2〜4 つ */
function v97aiFmtOk(code) { return /^[A-Z0-9]{2,12}(-[A-Z0-9]{2,12}){1,3}$/.test(code) && code.length >= 6 && code.length <= 40; }
window.v97aiFmtOk = v97aiFmtOk;
/* 台帳の問い合わせ（lookup・login）の数と、最後の答え */
if (typeof syncCall === "function") {
  const __sc97ai = syncCall;
  syncCall = async function (op, body, opt) {   // eslint-disable-line no-global-assign
    const lg = op === "lookup" || op === "login";
    if (lg) V97AI.inflight++;
    try {
      const r = await __sc97ai.apply(this, arguments);
      try { if (lg && V97AI.att) V97AI.look = { op, unknown: !(r && r.ok && r.acct), at: Date.now() }; } catch (e) { /* 無視 */ }
      return r;
    } catch (e) {
      try { if (lg && V97AI.att) V97AI.look = { op, net: 1, at: Date.now() }; } catch (x) { /* 無視 */ }
      throw e;
    } finally {
      if (lg) V97AI.inflight = Math.max(0, V97AI.inflight - 1);
    }
  };
}
/* 誤りの文の種類：fail＝まちがい（数える）・net＝通信・other＝ほか（無効・期限切れ・確認コードなど・数えない） */
const V97AI_FAILRE = [/アクセスコードかご担当者名が違います/, /The access code or the name is incorrect/i, /访问码或负责人姓名不正确/, /El código de acceso o el nombre no es correcto/i,
  /このコードは登録されていません/, /招待されていません/, /登録されているお名前.*一致しません/, /does not match the names registered/i, /与此代码登记的姓名.*不一致/, /no coincide con los nombres registrados/i];
const V97AI_NETRE = [/サーバーに接続でき/, /接続できず/, /could not connect|cannot connect|timed out/i, /无法连接/, /No se pudo conectar/i];
function v97aiKind(t) { t = String(t || ""); if (!t || /^☁/.test(t)) return ""; if (V97AI_FAILRE.some((re) => re.test(t))) return "fail"; if (V97AI_NETRE.some((re) => re.test(t))) return "net"; return "other"; }
window.v97aiKind = v97aiKind;
function v97aiErrEl() { return document.getElementById("lg-err"); }
function v97aiErrText() { const e = v97aiErrEl(); return (e && !e.hidden) ? String(e.textContent || "").trim() : ""; }
function v97aiSay(m, wait) { try { if (typeof v56authLgErr === "function") return v56authLgErr(m, wait); const e = v97aiErrEl(); if (e) { e.hidden = false; e.textContent = m; e.classList.toggle("lgwait", !!wait); } } catch (e) { v97aiErr("say", e); } }
function v97aiPaint() { try { if (typeof window.rdV97aiLgPaint === "function") window.rdV97aiLgPaint(); } catch (e) { v97aiErr("paint", e); } }
window.v97aiState = () => ({ att: V97AI.att, look: V97AI.look, fmtBad: V97AI.fmtBad, inflight: V97AI.inflight });
/* 1回のログインの結果を見届ける：ログインできた／誤りが出た／何も出ないまま終わった（→ 誤りを出す） */
function v97aiWatch(att) {
  const t0 = Date.now();
  let idleAt = 0;
  const tick = () => {
    try {
      if (V97AI.att !== att) return;
      const s = v97aiSes();
      if (s && s.t) { v97aiMarkSelf(); v97aiLgfOk(); V97AI.att = null; att.res = "ok"; v97aiPaint(); return; }
      if (!document.getElementById("lg-code")) { V97AI.att = null; return; }   /* ログイン画面が閉じた（パスワードの画面など） */
      const busy = V97AI.inflight > 0 || (typeof V56AUTH !== "undefined" && V56AUTH && V56AUTH.lgBusy);
      const k = v97aiKind(v97aiErrText());
      if (k && !busy) {
        att.res = k; V97AI.att = null;
        if (k === "fail") { const o = v97aiLgfFail(); att.n = o.n; }
        v97aiPaint();
        return;
      }
      /* 何も出ていない・「☁」のまま：問い合わせが終わって 1.5秒たっても出なければ、答えに合わせて出す */
      if (!busy) {
        if (!idleAt) idleAt = Date.now();
        else if (Date.now() - idleAt > 1500) {
          const L = V97AI.look && V97AI.look.at >= att.at ? V97AI.look : null;
          if (L && L.unknown) { V97AI.n.guard++; v97aiSay(v97aiUniMsg(), 0); return setTimeout(tick, 50); }
          if (L && L.net) { V97AI.n.guard++; v97aiSay(v97aiM("サーバーに接続できませんでした。通信状況を確認して、もう一度お試しください。", "Could not connect to the server. Check your connection and try again.", "无法连接服务器。请检查网络后重试。", "No se pudo conectar con el servidor. Compruebe la conexión e inténtelo de nuevo."), 0); return setTimeout(tick, 50); }
          if (Date.now() - t0 > 4000) { V97AI.att = null; return; }   /* 問い合わせが無かった（入力の不足など）：何もしない */
        }
      } else idleAt = 0;
      if (Date.now() - t0 > 120000) { V97AI.att = null; return; }
      setTimeout(tick, 250);
    } catch (e) { v97aiErr("watch", e); V97AI.att = null; }
  };
  setTimeout(tick, 250);
}
if (typeof v56authLgGo === "function") {
  const __go97ai = v56authLgGo;
  v56authLgGo = async function (btn) {   // eslint-disable-line no-global-assign
    try {
      const left = v97aiLgfLeft();
      if (left > 0) { V97AI.n.block++; v97aiPaint(); return; }
      if (typeof V56AUTH !== "undefined" && V56AUTH && V56AUTH.lgBusy) return __go97ai.apply(this, arguments);
      const ci = document.getElementById("lg-code");
      const code = v97aiCode(ci && ci.value);
      if (code) {
        V97AI.fmtBad = v97aiFmtOk(code) ? 0 : 1;
        V97AI.pend = null;
        const att = { at: Date.now(), code: code.length };
        V97AI.att = att;
        v97aiPaint();
        const r = await __go97ai.apply(this, arguments);
        v97aiWatch(att);
        return r;
      }
    } catch (e) { v97aiErr("go", e); }
    return __go97ai.apply(this, arguments);
  };
}
/* コードの欄で Enter・名前の欄が空：名前の欄へ移るだけで何も出なかった → 一言出す */
document.addEventListener("keydown", (e) => {
  try {
    if (e.key !== "Enter" || e.isComposing || e.keyCode === 229) return;
    const t = e.target;
    if (!t || t.id !== "lg-code") return;
    const n = document.getElementById("lg-name");
    if (!n || String(n.value || "").trim()) return;
    if (v97aiLgfLeft() > 0) return;
    setTimeout(() => { try { if (!v97aiErrText()) v97aiSay(v97aiM("続けて、ご担当者名を入れてから「トライアルを開始する」を押してください。", "Next, enter your name and press “Start trial”.", "接下来请输入负责人姓名，然后按“开始试用”。", "A continuación, escriba su nombre y pulse «Iniciar prueba»."), 1); } catch (x) { /* 無視 */ } }, 30);
  } catch (x) { v97aiErr("enter", x); }
}, true);
/* 待ち時間のあいだは、先回りのログイン（v65auth の login・v65spec）も送らない */
(function () {
  try {
    if (typeof window.fetch !== "function") return;
    const of = window.fetch;
    window.fetch = function (u, init) {
      try {
        const b = init && typeof init.body === "string" ? init.body : "";
        if (b && b.indexOf('"v65spec":1') >= 0 && b.indexOf('"op":"login"') >= 0 && v97aiLgfLeft() > 0) { V97AI.n.block++; return Promise.reject(new Error("v97: login waiting")); }
      } catch (e) { v97aiErr("fetch", e); }
      return of.apply(this, arguments);
    };
  } catch (e) { v97aiErr("fetchw", e); }
})();

/* ══════════ R-7（No.506）：今月の回数（同期サーバーの日ごとの数を、この端末で控えて足す） ══════════ */
const V97AI_DAY = "rd_v97aiday";
function v97aiAcctK() { try { return String((typeof SYNC !== "undefined" && SYNC && SYNC.kid) || "").slice(0, 12); } catch (e) { return ""; } }
function v97aiDayKey() { try { if (typeof v95aiDay === "function") return v95aiDay(); } catch (e) { /* 無視 */ } return new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10); }
function v97aiDayAll() { try { const o = JSON.parse(localStorage.getItem(V97AI_DAY) || "{}"); return (o && typeof o === "object" && !Array.isArray(o)) ? o : {}; } catch (e) { return {}; } }
/* 今日の数（同期サーバー）を控える：日ごとに大きいほう。70日より前は消す */
function v97aiRec(G) {
  try {
    const k = v97aiAcctK();
    if (!k || !G || !G.srv) return;
    const d = v97aiDayKey(), all = v97aiDayAll(), o = all[k] = (all[k] && typeof all[k] === "object") ? all[k] : {};
    const e = o[d] = (o[d] && typeof o[d] === "object") ? o[d] : { c: 0, t: 0 };
    let ch = 0;
    const c = G.cnt ? Math.max(0, +G.cnt.used || 0) : 0, t = G.tok ? Math.max(0, +G.tok.used || 0) : 0;
    if (c > (+e.c || 0)) { e.c = c; ch = 1; }
    if (t > (+e.t || 0)) { e.t = t; ch = 1; }
    const lim = new Date(Date.now() - 70 * 864e5 + 9 * 3600e3).toISOString().slice(0, 10);
    Object.keys(o).forEach((x) => { if (x < lim) { delete o[x]; ch = 1; } });
    if (ch) { localStorage.setItem(V97AI_DAY, JSON.stringify(all)); V97AI.n.rec++; }
  } catch (e) { v97aiErr("rec", e); }
}
/* 割合（小数1桁・切り捨て）：161/1000 → 16.1 */
function v97aiPct(used, cap) { if (!(cap > 0)) return null; return Math.min(100, Math.floor(Math.max(0, +used || 0) / cap * 1000) / 10); }
window.v97aiPct = v97aiPct;
/* 画面に出す数をまとめて返す（rd_v97ai.js が使う） */
function v97aiCounts() {
  const out = { srv: false, cnt: null, tok: null, first: "", mon: null, q: null, lim: "", near: "" };
  try {
    const G = (typeof v96aiMeter === "function") ? v96aiMeter() : null;
    if (G) {
      out.srv = !!G.srv; out.lim = G.lim || ""; out.near = G.near || "";
      if (G.cnt) out.cnt = Object.assign({}, G.cnt, { pct1: v97aiPct(G.cnt.used, G.cnt.cap) });
      if (G.tok) out.tok = Object.assign({}, G.tok, { pct1: v97aiPct(G.tok.used, G.tok.cap) });
      v97aiRec(G);
    }
    /* どちらの上限に先に届きそうか（割合の大きいほう） */
    const pc = out.cnt && out.cnt.pct1 != null ? out.cnt.pct1 : null, pt = out.tok && out.tok.pct1 != null ? out.tok.pct1 : null;
    if (pc != null && pt != null && (pc > 0 || pt > 0)) out.first = Math.abs(pc - pt) < 0.05 ? "same" : pt > pc ? "tok" : "cnt";
    else if (pc != null && pc > 0) out.first = "cnt";
    else if (pt != null && pt > 0) out.first = "tok";
    /* 今月（この端末で控えた日の合計・今日を含む） */
    if (out.srv) {
      const k = v97aiAcctK(), o = (v97aiDayAll()[k]) || {}, m = v97aiDayKey().slice(0, 7);
      let c = 0, t = 0, days = 0, since = "";
      Object.keys(o).sort().forEach((d) => { if (d.slice(0, 7) === m && o[d]) { c += +o[d].c || 0; t += +o[d].t || 0; days++; if (!since) since = d; } });
      const tc = out.cnt ? +out.cnt.used || 0 : 0, tt = out.tok ? +out.tok.used || 0 : 0;
      if (c < tc) c = tc;
      if (t < tt) t = tt;
      out.mon = { c, t, days: Math.max(1, days), since: since || v97aiDayKey() };
      /* 同期サーバーが今月の数を返すようになったら（air_me の monUsed・monTok）、そちらを使う（端末によらない数） */
      try {
        const l = (typeof v96aiSrv === "function") ? v96aiSrv() : null;
        if (l && l.monUsed != null) out.mon = { c: Math.max(+l.monUsed || 0, tc), t: Math.max(+l.monTok || 0, tt), srv: 1, days: 0, since: "" };
      } catch (e) { v97aiErr("monsrv", e); }
    }
    /* この端末で数えた AI商社マンへの質問（土台 v90goalQ） */
    if (typeof v90goalQ === "function") {
      const Q = v90goalQ();
      out.q = { n: Q.n | 0, total: +Q.total || 0, since: Q.since || 0 };
      out.q.sub = !!(out.mon && out.q.n <= out.mon.c);   /* 今月の回数の「うち」と言えるか */
    }
  } catch (e) { v97aiErr("counts", e); }
  return out;
}
window.v97aiCounts = v97aiCounts;
