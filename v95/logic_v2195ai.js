/* ═══ 21.95 分野 ai（2026-11-17 改修一覧 No.476・506・507・501・502）＝機能の中身 ═══
   土台 21.94（base94.html）は書き換えず、前の関数を控えてから包む。見せ方は rd_v95ai.js / rd_v95ai.css。
   ・No.476／506（AI 利用量のカウンタと上限）：同期サーバーの ai_relay の答え（air_cap／air_all／rate）と air_me を見て、
     「今日の上限に達した」状態（V95AI.lim）を持つ。AI の処理が通るたびに「今日の回数」をこの画面で1つ足す（サーバーは AI に頼む前に1回数えるため、
     2分ごとの air_me を待たずに合う）。上限の数そのものは同期サーバー（GAS）が決める＝ここでは数を変えない。
     GAS v2.29 からは回数のほかに1日のトークンの上限（普通 400万・デモ用 100万）があり、air_me はトークンを返さない
     → 回数が残っていても上限（429）になる。そのときは「回数の前に利用量の上限に届いた」と出す（GAS が tokUsed・tokCap を返すようになれば、それも読む）。
   ・No.507（AI 相談の計算の数量）：pickQty が商品名の「50枚入り」の 50 を注文の数量と読んでいた（最初に見つけた数を取る）。
     「入り・入・組・ずつ」が続く数・商品名の中の数・年や円などの数ではない数は飛ばし、次の数（1,000箱）を取る。
     MOQ と質問の数え方（箱と枚など）が違うときは「受けられません」と言わず、数え方を確かめるよう出す。
   ・No.501（アクセスコードのログインの誤りの文言）：存在しないコード・招待されていない名前のどちらも
     「アクセスコードかご担当者名が違います」にそろえる（どちらが違うかを明かさない）。名前の照合の方式は同期サーバーが決める（変えない）。
   ・No.502（管理者の確認コードの期限）：同期サーバーの答え（admin_login・adm_code の「（N分間有効）」）から期限を読み、
     確認コードの欄の下に期限の時刻と残りを出す。画面の安全の決まりの文言も、STANDAGE の管理者は N分（GAS d95〔11/17 バージョン 43〕から10分。21.95.1 で既定を 300→600 に）と書く。
   同期サーバー（GAS）のコードは変えない（別の会話「正式セキュリティチェック＋サーバー移管」が扱う）。 */
var V95AI = window.V95AI = { v: "21.95", lim: null, add: 0, meAt: 0, pullAsk: 0, otp: null, err: [], n: { relay: 0, deny: 0, me: 0, qfix: 0, moqU: 0, msg: 0 } };
function v95aiErr(k, e) { try { V95AI.err.push(k + ": " + String((e && e.message) || e).slice(0, 160)); if (V95AI.err.length > 30) V95AI.err.shift(); } catch (x) { /* 無視 */ } }
function v95aiDay(ts) { return new Date((ts || Date.now()) + 9 * 3600e3).toISOString().slice(0, 10); }
function v95aiLang() { try { return (typeof I18N !== "undefined" && I18N && I18N.lang) || "ja"; } catch (e) { return "ja"; } }
function v95aiE(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

/* ── No.476／506：上限の状態 ── */
/* 今効いている上限：cap（回数）・tok（利用量＝トークン）・all（全体）は同じ日（日本時間）のあいだ、rate（1分あたり）・prov（AI の会社の 429）は3分 */
function v95aiLimNow() {
  const L = V95AI.lim;
  if (!L) return null;
  if (L.kind === "rate" || L.kind === "prov") return (Date.now() - L.at < 3 * 60000) ? L : null;
  return L.day === v95aiDay() ? L : null;
}
function v95aiKindOf(r) {
  const why = String((r && r.reason) || ""), m = String((r && r.msg) || "");
  if (why === "air_cap") return /利用量|トークン|token/i.test(m) ? "tok" : "cap";
  if (why === "air_all") return "all";
  if (why === "rate") return "rate";
  return "";
}
function v95aiSetLim(kind, r, srv) { V95AI.lim = { kind, why: String((r && r.reason) || ""), msg: String((r && r.msg) || "").slice(0, 200), at: Date.now(), day: v95aiDay(), srv: srv ? 1 : 0 }; }
/* サーバーが上限で断った直後は、air_me で回数を取り直す（20秒に1回まで） */
function v95aiPullSoon() {
  try {
    if (Date.now() - V95AI.pullAsk < 20000 || typeof v63aPull !== "function") return;
    V95AI.pullAsk = Date.now();
    setTimeout(() => { try { v63aPull(true); } catch (e) { v95aiErr("pull", e); } }, 600);
  } catch (e) { v95aiErr("pullSoon", e); }
}
function v95aiPaintSoon() { try { if (typeof window.v95aiPaint === "function") setTimeout(window.v95aiPaint, 0); } catch (e) { /* 無視 */ } }
function v95aiRelaySeen(r) {
  V95AI.n.relay++;
  if (r && r.ok) {
    /* サーバーは AI の会社に頼む前に1回数える（v226Take_）。答えが 429 でも数えている */
    try { const l = (typeof V63A !== "undefined" && V63A) ? V63A.last : null; if (l && l.ok && l.on) { l.used = (+l.used || 0) + 1; l.v95add = (+l.v95add || 0) + 1; V95AI.add++; } } catch (e) { v95aiErr("add", e); }
    if (+r.status === 429) v95aiSetLim("prov", { reason: "http429" });
    else if (V95AI.lim && +r.status < 400) V95AI.lim = null;
  } else if (r) {
    const k = v95aiKindOf(r);
    if (k) { V95AI.n.deny++; v95aiSetLim(k, r, 1); v95aiPullSoon(); }
  }
  v95aiPaintSoon();
}
function v95aiMeSeen(r) {
  if (!r || r.ok !== true) return;
  V95AI.n.me++; V95AI.meAt = Date.now(); V95AI.add = 0;
  try {
    const cap = +r.cap || 0, used = +r.used || 0, L = v95aiLimNow();
    if (r.on && cap > 0 && used >= cap) { if (!L || L.kind === "rate" || L.kind === "prov") v95aiSetLim("cap", { reason: "air_cap" }, 1); }
    else if (L && L.kind === "cap" && r.on && cap > 0 && used < cap) V95AI.lim = null;   /* マスターが上限を上げた */
    /* これからの同期サーバー（案）：air_me に今日のトークン（tokUsed）と上限（tokCap）があれば、それでも決める */
    const tc = +r.tokCap || 0, tu = +r.tokUsed || 0;
    if (r.on && tc > 0 && tu >= tc) v95aiSetLim("tok", { reason: "air_cap" }, 1);
  } catch (e) { v95aiErr("me", e); }
  v95aiPaintSoon();
}

/* ── No.502：確認コードの期限（サーバーの答えの「（N分間有効）」・ttl〔秒〕から） ── */
function v95aiOtpTtl(r, def) {
  try {
    if (r && +r.ttl > 0) return Math.round(+r.ttl);
    const s = String((r && r.msg) || "");
    const m = s.match(/[（(]\s*(\d{1,3})\s*分間有効/) || s.match(/valid for (\d{1,3}) minutes?/i);
    if (m) return (+m[1]) * 60;
  } catch (e) { /* 無視 */ }
  return def;
}
function v95aiAdmTtl() { try { const v = +localStorage.getItem("bc20_v95_admttl"); return v >= 60 && v <= 3600 ? v : 600; } catch (e) { return 600; } }
function v95aiOtpSeen(op, r) {
  try {
    if (!r) return;
    if (op === "admin_login") {
      if (r.ok) { V95AI.otp = null; return; }
      if (r.mfa && r.expired) { if (V95AI.otp) V95AI.otp.dead = 1; return; }
      /* 送ったときだけ（コードの誤りの答えには to も「送りました」も無い＝期限を数え直さない） */
      if (r.mfa && (r.to || /送りました|sent/i.test(String(r.msg || "")))) {
        const ttl = v95aiOtpTtl(r, v95aiAdmTtl());
        V95AI.otp = { kind: "master", at: Date.now(), ttl, el: "ad-otp" };
        try { localStorage.setItem("bc20_v95_admttl", String(ttl)); } catch (e) { /* 無視 */ }
      }
    } else if (op === "adm_code") {
      if (r.ok) V95AI.otp = { kind: "co", at: Date.now(), ttl: v95aiOtpTtl(r, 600), el: "v57otp" };
    } else if (op === "adm_verify") {
      if (r.ok) V95AI.otp = null; else if (r.expired && V95AI.otp) V95AI.otp.dead = 1;
    }
  } catch (e) { v95aiErr("otp", e); }
}

if (typeof syncCall === "function") {
  const __sc95ai = syncCall;
  syncCall = async function (op, body, opt) {
    const r = await __sc95ai.apply(this, arguments);
    try {
      if (op === "ai_relay") v95aiRelaySeen(r);
      else if (op === "air_me") setTimeout(() => v95aiMeSeen(r), 0);   /* v63aPull が V63A.last に入れた後で */
      else if (op === "admin_login" || op === "adm_code" || op === "adm_verify") v95aiOtpSeen(op, r);
    } catch (e) { v95aiErr("sc", e); }
    return r;
  };
}

/* ── No.507：数量の読み取り ── */
const V95AI_QRE = /(?<![A-Za-z0-9\-.$¥￥])(\d[\d,]*)\s*(袋|本|個|箱|ケース|kg|pcs|units|セット|台|枚|缶|瓶|パック|カートン|ctn|cs)?(?![A-Za-z\d.\-])/gi;   /* pickQty と同じ形（全部を拾う） */
const V95AI_PACK = /^\s*(?:入り?|入れ|いり|組|ずつ(?:入|詰|包)|毎|[×xX*＊/／])/;   /* 「50枚入り」「12本入」「3個組」「50枚ずつ入り」「50枚×20箱」の前の数（「3社に1,200個ずつ」の 1,200 は数量） */
const V95AI_NOTQ = /^\s*(?:年|か月|ヶ月|カ月|ケ月|月|日|時間|時|分|秒|歳|才|層|円|ドル|%|％|度|℃|号|型|回|位|番|件|社|か国|ヵ国|カ国|国|名|人|週|倍|割|ミリ|センチ|グラム|リットル|インチ|キロ)/;
/* 質問に書かれた商品名（品名・英名・品番・価格表の品名）の範囲：その中の数は数量ではない */
function v95aiNameSpans(s) {
  const out = [];
  try {
    const d = (typeof D !== "undefined" && D) || {};
    const names = [d.item, d.itemEn, d.sku];
    (Array.isArray(d.priceRows) ? d.priceRows : []).forEach((r) => { if (Array.isArray(r)) { [r[0], r[1]].forEach((x) => { if (typeof x === "string" && !/[〜~～]|以上|以下|\$|US\$|¥|円/.test(x)) names.push(x); }); } });
    names.forEach((nm) => {
      nm = String(nm == null ? "" : nm).trim();
      if (nm.length < 3 || !/\d/.test(nm)) return;
      let i = s.indexOf(nm);
      while (i >= 0) { out.push([i, i + nm.length]); i = s.indexOf(nm, i + nm.length); }
    });
  } catch (e) { v95aiErr("names", e); }
  return out;
}
function v95aiQtyCands(q) {
  const s = String(q == null ? "" : q), spans = v95aiNameSpans(s), C = [];
  const re = new RegExp(V95AI_QRE.source, "gi");
  let m;
  while ((m = re.exec(s))) {
    if (!m[0]) { re.lastIndex++; continue; }
    const i = m.index, j = i + m[0].length, n = parseInt(m[1].replace(/,/g, ""), 10), u = m[2] || "";
    const after = s.slice(j, j + 8), before = s.slice(Math.max(0, i - 1), i);
    let bad = "";
    if (spans.some(([a, b]) => i < b && j > a)) bad = "name";
    else if (V95AI_PACK.test(after)) bad = "pack";
    else if (!u && V95AI_NOTQ.test(after)) bad = "unit";
    else if (/[/:：]/.test(before) || /^[/:]\d/.test(after)) bad = "date";
    C.push({ i, n, u, bad, s: m[0] });
  }
  return C;
}
function v95aiPickQty(q) {
  const C = v95aiQtyCands(q);
  const c = C.find((x) => !x.bad && x.n >= 10);
  return c ? { n: c.n, u: c.u } : null;
}
if (typeof pickQty === "function") {
  const __pq95ai = pickQty;
  pickQty = function (q) {
    const r0 = __pq95ai.apply(this, arguments);
    try {
      const r1 = v95aiPickQty(q);
      if (!r0 && !r1) return r0;
      if (r0 && r1 && r0.n === r1.n && r0.u === r1.u) return r0;
      V95AI.n.qfix++;
      V95AI.lastQ = { q: String(q).slice(0, 120), was: r0, now: r1, at: Date.now() };
      return r1;
    } catch (e) { v95aiErr("pq", e); return r0; }
  };
}
/* MOQ の数え方（箱）と質問の数え方（枚）が違うときは、数を比べない（「受けられません」と言わない） */
function v95aiMoqUnit(moq) { const m = String(moq == null ? "" : moq).match(/[\d,]+(?:\.\d+)?\s*([^\d\s（(、,，.。/／]+)/); return m ? m[1].trim() : ""; }
if (typeof v92aiPriceCalc === "function") {
  const __pc95ai = v92aiPriceCalc;
  v92aiPriceCalc = function () {
    const P = __pc95ai.apply(this, arguments);
    try {
      if (P && P.moq && P.qu && typeof v54docUnitGrp === "function") {
        const mu = v95aiMoqUnit(P.moqTxt), g1 = v54docUnitGrp(P.qu), g2 = v54docUnitGrp(mu);
        if (mu && g1 !== -1 && g2 !== -1 && g1 !== g2) { P.v95moq = { moq: P.moq, mu, qu: P.qu }; P.moq = null; V95AI.n.moqU++; }
      }
    } catch (e) { v95aiErr("pc", e); }
    return P;
  };
}
function v95aiMoqNote(P, ja) {
  const x = P && P.v95moq;
  if (!x) return "";
  const n = (+P.n || 0).toLocaleString("en-US");
  return ja
    ? `※ 最小発注数量（MOQ）は ${P.moqTxt} です。ご質問の数量（${n}${x.qu}）とは数え方が違うため、受けられるかは数え方をそろえて確かめてください。`
    : `* The MOQ is ${P.moqTxt}. Your quantity (${n} ${x.qu}) uses a different unit, so convert to the same unit to check whether it can be accepted.`;
}
if (typeof v92aiPriceCtx === "function") {
  const __px95ai = v92aiPriceCtx;
  v92aiPriceCtx = function (P) { let s = __px95ai.apply(this, arguments); try { if (P && P.v95moq) s += "\n" + v95aiMoqNote(P, v95aiLang() === "ja"); } catch (e) { v95aiErr("px", e); } return s; };
}
if (typeof v92aiPriceHtml === "function") {
  const __ph95ai = v92aiPriceHtml;
  v92aiPriceHtml = function (P) {
    let h = __ph95ai.apply(this, arguments);
    try { if (P && P.v95moq) h = h.replace(/<\/div>$/, `<p class="v92ai-ng" data-v95moq="1">${v95aiE(v95aiMoqNote(P, v95aiLang() === "ja"))}</p></div>`); } catch (e) { v95aiErr("ph", e); }
    return h;
  };
}

/* ── No.501：ログインの誤りの文言（どちらが違うかを明かさない） ── */
const V95AI_LGMSG = {
  ja: "アクセスコードかご担当者名が違います。入力内容をご確認ください（ご担当者名は、招待状・申し込みのときの氏名です。わからないときは、招待した方か STANDAGE の担当にご確認ください）。",
  en: "The access code or the name is incorrect. Please check what you entered (use the name on your invitation or application; if unsure, ask the person who invited you or your STANDAGE contact).",
  zh: "访问码或负责人姓名不正确。请确认输入内容（负责人姓名为邀请函或申请时的姓名；不清楚时请向邀请人或 STANDAGE 负责人确认）。",
  es: "El código de acceso o el nombre no es correcto. Revise lo que introdujo (use el nombre de la invitación o de la solicitud; si no está seguro, consulte a quien le invitó o a su contacto de STANDAGE)."
};
function v95aiLgMsg() { const L = v95aiLang(); return V95AI_LGMSG[L] || V95AI_LGMSG.ja; }
/* どちらが違うかが分かる文言（土台・v56auth・同期サーバーの login の答え・その訳） */
const V95AI_LGREVEAL = [
  /^このコードは登録されていません。/,
  /^「.*」というお名前は、このアカウントに招待されていません。/,
  /^このお名前は、このアカウントに招待されていません。/,
  /^This code is not registered/i,
  /has not been invited to this account/i,
  /未受邀请|没有被邀请|未被邀请|此代码未登记|该代码未登记/,
  /no ha sido invitad|no está registrado/i
];
function v95aiLgFix(el) {
  try {
    if (!el) return;
    const t = String(el.textContent || "").trim();
    if (!t || t === v95aiLgMsg()) return;
    if (V95AI_LGREVEAL.some((re) => re.test(t))) { el.textContent = v95aiLgMsg(); V95AI.n.msg++; }
  } catch (e) { v95aiErr("lgfix", e); }
}
try { if (typeof V56AUTH_MSG !== "undefined" && V56AUTH_MSG) V56AUTH_MSG.uninv = () => v95aiLgMsg(); } catch (e) { v95aiErr("uninv", e); }
/* 誤りの欄（#lg-err）は、土台のログインの中の関数が直接書くため、欄の変化を見て直す */
(function () {
  const seen = new WeakSet();
  const hook = () => {
    try {
      const el = document.getElementById("lg-err");
      if (!el || seen.has(el)) return;
      seen.add(el);
      v95aiLgFix(el);
      new MutationObserver(() => v95aiLgFix(el)).observe(el, { childList: true, characterData: true, subtree: true });
    } catch (e) { v95aiErr("lghook", e); }
  };
  hook();
  setInterval(() => { try { if (document.body && document.body.classList.contains("locked")) hook(); } catch (e) { /* 無視 */ } }, 300);
})();
