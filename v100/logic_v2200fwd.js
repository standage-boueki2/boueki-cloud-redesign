/* ═══ v22.00 fwd（2026-11-20 第13回 UAT の直し）物流会社の画面の中身の層（rd_v100fwd.css・rd_v100fwd.js の前に読む）
   No.604 受信箱の一覧：ページ送り・すべて表示の数（見せ方は rd_v100fwd.js）。取り込みの確認の表（60行で切れていた）も全部見られるように。
   No.605 レート管理：同じ国のレーンが表記の違いで重なっているのを見つける（アメリカ／アメリカ合衆国／米国／USA…、韓国／大韓民国…、中国／中華人民共和国…）。
          データは消さない・まとめない（どれとどれが重なっているか・まとめ方の案を出すだけ）。登録のときにも「同じ国のレーンがすでにあります」と知らせる。
          中央値（No.535）の母集団の「仕向地 N か所」は国としてそろえて数える（期限内に同じ国の別の書き方が無ければ数は変わらない）。
   開示事項（第7章）体験用の依頼：お客様デモ用のアカウント（荷主）から届いた依頼を見分け、受信箱・明細・全体の状況で「体験用の依頼・3日で消えます」と分けて数える。
          しくみ（同期サーバー v2.22〜）：デモ用の荷主の物流の依頼だけはサーバーに保存し（印 dm・ログインごとの印 ds）、体験用の物流会社に届ける。
          最初に保存した時から3日で物流会社の画面に出なくなり（次の書き込みで消える）、荷主がログアウトしても消えない。
          物流会社の画面には印（dm）が渡らないため、印があればそれを使い、無ければ「お客様デモ用の荷主の記号（荷主（非公開）・DBOO）＋ 10/20（v2.22）以降」で見分ける。
   土台・前の層の関数は控えてから包むだけ。同じ包みを何度通っても結果が同じになるように書く。 */
var V100FWD = window.V100FWD || { v: "22.00", err: null, errs: [], n: {} };
window.V100FWD = V100FWD;
function v100fErr(k, e) { try { const m = k + ": " + String((e && e.message) || e).slice(0, 180); V100FWD.err = m; V100FWD.errs.push(m); if (V100FWD.errs.length > 40) V100FWD.errs.shift(); } catch (x) { /* 記録できないときは何もしない */ } }
function v100fCnt(k) { try { V100FWD.n[k] = (V100FWD.n[k] || 0) + 1; } catch (e) { /* 無視 */ } }
function v100fM(ja, en, zh, es) { try { const l = (typeof I18N !== "undefined" && I18N && I18N.lang) || "ja"; return l === "en" ? (en || ja) : l === "zh" ? (zh || en || ja) : l === "es" ? (es || en || ja) : ja; } catch (e) { return ja; } }
window.v100fM = v100fM;

/* ═══ No.605 国の名前をそろえる ═══════════════════════════════════════ */
/* 21.97〜21.98 の国の読み方（v97fCty：港→国・略号・かっこ）に、区切り（「アメリカ、LA港」）と同じ国の書き方の表を足す */
var V100F_SYN = [
  ["アメリカ", /^(アメリカ|米国|アメリカ合衆国|合衆国|米|usa|us|u\.s\.a?\.?|united\s*states(\s*of\s*america)?|america)$/i],
  ["韓国", /^(韓国|大韓民国|韓|korea|south\s*korea|republic\s*of\s*korea|rok)$/i],
  ["中国", /^(中国|中華人民共和国|中国本土|china|prc|people'?s\s*republic\s*of\s*china)$/i],
  ["台湾", /^(台湾|臺灣|taiwan)$/i],
  ["香港", /^(香港|hong\s*kong|hk)$/i],
  ["イギリス", /^(イギリス|英国|連合王国|uk|u\.k\.|united\s*kingdom|great\s*britain|britain)$/i],
  ["UAE", /^(uae|アラブ首長国連邦|united\s*arab\s*emirates|ドバイ|dubai)$/i],
  ["ベトナム", /^(ベトナム|ヴェトナム|vietnam|viet\s*nam)$/i],
  ["オランダ", /^(オランダ|netherlands|holland)$/i],
  ["ドイツ", /^(ドイツ|独|germany|deutschland)$/i],
  ["フランス", /^(フランス|仏|france)$/i]
];
function v100fNfkc(s) { let x = String(s == null ? "" : s); try { x = x.normalize("NFKC"); } catch (e) { /* そのまま */ } return x.trim(); }
/* 仕向けの名前 → { key: 国（そろえた名前）, detail: 地域・港などの書き足し（「西部」「LA港」）} */
function v100fCtyOf(pod) {
  const orig = String(pod == null ? "" : pod).trim();
  const raw = v100fNfkc(pod);
  if (!raw) return { key: "", detail: "", raw: orig, norm: raw };
  let head = raw, detail = "";
  const pm = /[（(]([^)）]*)[)）]/.exec(raw);
  if (pm) { detail = pm[1].trim(); head = raw.replace(/[（(][^)）]*[)）]/g, "").trim(); }
  const sp = head.split(/[、,，\/／]/).map((x) => x.trim()).filter(Boolean);
  if (sp.length > 1) { head = sp[0]; detail = [sp.slice(1).join("・"), detail].filter(Boolean).join("・"); }
  let key = head;
  try { const syn = V100F_SYN.find((x) => x[1].test(head)); if (syn) key = syn[0]; } catch (e) { v100fErr("syn", e); }
  if (key === head) {
    try { if (typeof v97fCty === "function") { const c = v97fCty(head); if (c) key = c; } } catch (e) { v100fErr("cty97", e); }
    try { const syn = V100F_SYN.find((x) => x[1].test(key)); if (syn) key = syn[0]; } catch (e) { /* そのまま */ }
  }
  return { key: key || head, detail, raw: orig, norm: raw };
}
window.v100fCtyOf = v100fCtyOf;
/* 仕出し（日本・横浜港…）はそのままの書き方で比べる（港が違えば別の区間） */
function v100fPolKey(pol) { const s = v100fNfkc(pol); return /^(日本|japan|jp|日本国)$/i.test(s) ? "日本" : s; }
function v100fModeKey(m) { return v100fNfkc(m).toUpperCase(); }
function v100fValidOf(r) { try { if (typeof v97fValid === "function") return !!v97fValid(r); if (typeof fwdRateValid === "function") return !!fwdRateValid(r); } catch (e) { /* 下へ */ } return true; }

/* 同じ国のレーンの重なり（表記の違い）を見つける。区間＝仕出し・形態・国（会社はまたぐ：相見積で別の行になるため） */
function v100fLaneDups(R) {
  const out = { groups: [], byIdx: {}, nRows: 0, at: Date.now() };
  try {
    const rates = R || ((typeof FWDB !== "undefined" && FWDB && FWDB.rates) || []);
    const G = {};
    rates.forEach((r, i) => {
      if (!r || !r.pod) return;
      const c = v100fCtyOf(r.pod);
      if (!c.key) return;
      const k = v100fPolKey(r.pol) + "|" + v100fModeKey(r.mode) + "|" + c.key;
      (G[k] = G[k] || { key: k, pol: v100fPolKey(r.pol), mode: v100fModeKey(r.mode), cty: c.key, rows: [] }).rows.push({ i, r, raw: c.raw, norm: c.norm, detail: c.detail, co: r.co || ((typeof FWDB !== "undefined" && FWDB && FWDB.profile && FWDB.profile.co) || ""), valid: v100fValidOf(r) });
    });
    Object.values(G).forEach((g) => {
      const spellN = [...new Set(g.rows.map((x) => x.norm))];
      if (spellN.length < 2) return;
      const spell = spellN.map((n) => (g.rows.find((x) => x.norm === n) || {}).raw || n);   /* 書き方が1つだけ＝同じ区間の別の会社（相見積）。重なりではない */
      g.spell = spell;
      g.nValid = g.rows.filter((x) => x.valid).length;
      g.nExp = g.rows.length - g.nValid;
      g.zones = g.rows.filter((x) => x.detail && /西部|東部|中部|南部|北部|その他|ゾーン|zone|地域|州|本土|離島/i.test(x.detail)).map((x) => x.raw);
      const byCo = {}; g.rows.forEach((x) => { (byCo[x.co] = byCo[x.co] || []).push(x); });
      g.sameCoValid = Object.keys(byCo).filter((co) => byCo[co].filter((x) => x.valid).length >= 2);
      g.plan = v100fDupPlan(g);
      out.groups.push(g);
      g.rows.forEach((x) => { out.byIdx[x.i] = g; });
      out.nRows += g.rows.length;
    });
    out.groups.sort((a, b) => b.rows.length - a.rows.length || String(a.cty).localeCompare(String(b.cty)));
  } catch (e) { v100fErr("dups", e); }
  return out;
}
window.v100fLaneDups = v100fLaneDups;
/* まとめ方の案（データは変えない。利用者が決める） */
function v100fDupPlan(g) {
  const L = [];
  const std = g.cty;
  const odd = g.rows.filter((x) => x.norm !== std && !x.detail).map((x) => x.raw);
  if (odd.length) L.push(v100fM(`仕向けの名前を「${std}」にそろえる（今の書き方：${[...new Set(odd)].join("・")}）。そろえると、相見積・中央値・見積で同じ国として扱われます`, `Use “${std}” as the destination name (now: ${[...new Set(odd)].join(", ")})`));
  if (g.zones.length) L.push(v100fM(`${[...new Set(g.zones)].join("・")} は運送会社の料金の区分（地域）の書き分けかもしれません。区分なら、そのままでかまいません（国の名前から書き始めているので、同じ国として見つけられます）`, `${[...new Set(g.zones)].join(", ")} may be carrier zones; keep them if so`));
  if (g.nExp) L.push(v100fM(`期限切れの行 ${g.nExp}本は見積に使われていません。新しい料金で入れ直すときに、国の名前をそろえてください（期限切れの行は、要らなければ「削除」で外せます）`, `${g.nExp} expired row(s) are not used for quotes; align the name when you renew them`));
  if (g.sameCoValid.length) L.push(v100fM(`同じ会社（${g.sameCoValid.join("・")}）の有効なレートが同じ国に2本以上あります。見積・相見積ではどちらも別の行になります。どちらを使うか確かめてください`, `Same company has 2+ valid rates for the same country (${g.sameCoValid.join(", ")})`));
  L.push(v100fM("この画面ではデータを消したり、まとめたりしていません（決めるのは貴社です）", "Nothing has been deleted or merged automatically"));
  return L;
}
/* 登録のときの点検：同じ国のレーン（書き方が違うもの・同じもの）がすでにあるか */
function v100fDupCheck(pol, pod, mode, co) {
  try {
    const c = v100fCtyOf(pod);
    if (!c.key) return null;
    const R = (typeof FWDB !== "undefined" && FWDB && FWDB.rates) || [];
    const pk = v100fPolKey(pol), mk = v100fModeKey(mode);
    const hit = R.map((r, i) => ({ r, i })).filter((x) => x.r && v100fPolKey(x.r.pol) === pk && v100fModeKey(x.r.mode) === mk && v100fCtyOf(x.r.pod).key === c.key && v100fNfkc(x.r.pod) !== c.norm);
    if (!hit.length) return null;
    return { cty: c.key, raw: c.raw, hit: hit.map((x) => ({ i: x.i, co: x.r.co || "", pod: x.r.pod, price: x.r.price, cur: x.r.cur || "¥", unit: x.r.unit || "", valid: v100fValidOf(x.r), until: x.r.valid || "" })) };
  } catch (e) { v100fErr("dupchk", e); return null; }
}
window.v100fDupCheck = v100fDupCheck;
function v100fDupMsg(d) {
  if (!d) return "";
  const L = d.hit.slice(0, 4).map((h) => `${h.pod}（${h.co ? h.co + "・" : ""}${h.cur}${(+h.price || 0).toLocaleString("ja-JP")}${h.unit}・${h.valid ? v100fM("有効", "valid") : v100fM("期限切れ", "expired")}）`).join("／");
  const same = v100fNfkc(d.raw) === d.cty;
  return v100fM(`同じ国（${d.cty}）のレーンが、別の書き方ですでにあります：${L}${d.hit.length > 4 ? ` ほか ${d.hit.length - 4}本` : ""}。${same ? "" : `「${d.raw}」は「${d.cty}」と同じ国として扱います。`}書き方を変えずに登録すると、相見積で別の行に分かれます（仕向けの名前は「${d.cty}」にそろえるのがおすすめです）。`, `A lane for the same country (${d.cty}) already exists under another name: ${L}.`);
}
window.v100fDupMsg = v100fDupMsg;

/* No.535 中央値の母集団：「仕向地 N か所」を国としてそろえて数える（同じ国の別の書き方を2か所と数えない） */
if (typeof v97fPop === "function" && !window.__v100fPop) {
  window.__v100fPop = 1;
  const __pop100 = v97fPop;
  v97fPop = function () { // eslint-disable-line no-global-assign
    const G = __pop100.apply(this, arguments);
    try {
      Object.values(G || {}).forEach((g) => {
        if (!g || !Array.isArray(g.rates)) return;
        const keys = new Set(), byKey = {};
        g.rates.forEach((r) => { const k = v100fCtyOf(r && r.pod).key || String((r && r.pod) || ""); keys.add(k); (byKey[k] = byKey[k] || new Set()).add(v100fNfkc(r && r.pod)); });
        g.npodRaw = g.pods ? g.pods.size : keys.size;
        g.npod = keys.size;
        g.v100dup = Object.keys(byKey).filter((k) => byKey[k].size > 1).map((k) => ({ cty: k, spell: [...byKey[k]] }));
      });
    } catch (e) { v100fErr("pop", e); }
    return G;
  };
}
if (typeof v97fBasis === "function" && !window.__v100fBasis) {
  window.__v100fBasis = 1;
  const __bs100 = v97fBasis;
  v97fBasis = function (g) { // eslint-disable-line no-global-assign
    let s = __bs100.apply(this, arguments);
    try {
      if (g && g.v100dup && g.v100dup.length && !/同じ国の別の書き方/.test(s)) {
        const t = g.v100dup.map((d) => d.spell.join("＝")).join("・");
        s += v100fM(`（同じ国の別の書き方は1か所と数えています：${t}）`, ` (same country written differently counted once: ${t})`);
      }
    } catch (e) { v100fErr("basis", e); }
    return s;
  };
}

/* ═══ 開示事項：体験用の依頼（お客様デモ用のアカウントから届いた依頼） ═══════════════ */
var V100F_DEMO_SK = ["DBOO"];                 /* お客様デモ用の荷主アカウント（同期サーバーの DEMO_CODES）の荷主の記号。変わったらここを直す */
var V100F_DEMO_FROM = Date.parse("2026-10-20T00:00:00+09:00");   /* 同期サーバー v2.22（デモの依頼を3日で消す）を出した日 */
var V100F_TTL = 3 * 864e5;
function v100fFwdOn() { try { return typeof FWDON !== "undefined" && !!FWDON && typeof FWDB !== "undefined" && !!FWDB; } catch (e) { return false; } }
/* 体験の世界（体験用・デモ用の物流会社）の画面だけ。本物の物流会社にはデモの依頼は届かない */
function v100fTrialWorld() {
  try {
    if (!v100fFwdOn()) return false;
    if (typeof v69fReal === "function" && v69fReal()) return false;
    return true;
  } catch (e) { return false; }
}
function v100fReqTime(r) {
  const m = +((r && r._m) || 0);
  if (m > 1e12) return m;
  const d = Date.parse(String((r && r.d) || "") + "T12:00:00+09:00");
  return isFinite(d) ? d : 0;
}
/* 1件の依頼：{ trial, kind: "temp"（3日で消える）|"keep"（前の版で保存・消えない）, until（消える目安の時刻）, exact, why } */
function v100fTrialOf(r) {
  try {
    if (!r || !v100fTrialWorld()) return null;
    if (r.dm === 1) {
      const t0 = +r.dmAt || v100fReqTime(r);
      return { trial: 1, kind: "temp", until: t0 ? t0 + V100F_TTL : 0, exact: !!r.dmAt, why: "dm" };
    }
    if (V100F_DEMO_SK.indexOf(String(r.sk || "")) < 0) return null;
    const t = v100fReqTime(r);
    if (t && t >= V100F_DEMO_FROM) return { trial: 1, kind: "temp", until: t + V100F_TTL, exact: false, why: "sk" };
    return { trial: 1, kind: "keep", until: 0, exact: false, why: "sk-old" };
  } catch (e) { v100fErr("trialof", e); return null; }
}
window.v100fTrialOf = v100fTrialOf;
function v100fHm(ms) { const d = new Date(ms); return (d.getMonth() + 1) + "/" + d.getDate() + " " + String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); }
window.v100fHm = v100fHm;
function v100fTrialLabel(T) {
  if (!T) return "";
  if (T.kind === "temp") return v100fM(`体験用の依頼・3日で消えます（${T.exact ? "" : "目安 "}${v100fHm(T.until)}${T.exact ? "" : "ごろ"}）`, `Trial request · removed after 3 days (${T.exact ? "" : "about "}${v100fHm(T.until)})`, `体验用请求・3天后删除（${v100fHm(T.until)}）`, `Solicitud de prueba · se borra a los 3 días (${v100fHm(T.until)})`);
  return v100fM("体験用のアカウントの前からの依頼（10/20 より前に保存・消えません）", "Older request from the trial account (kept)", "体验账户之前的请求（保留）", "Solicitud anterior de la cuenta de prueba (se conserva)");
}
window.v100fTrialLabel = v100fTrialLabel;
function v100fTrialWhy(T) {
  if (!T) return "";
  return T.kind === "temp"
    ? v100fM("お客様デモ用のアカウント（荷主）から届いた依頼です。同期サーバーは、最初に保存した時から3日たつと物流会社の画面に出さなくなり、次の書き込みのときに消します。荷主がログアウトしても、3日たつまでは消えません（ログアウトで消えるのは、その PC の中の変更だけです）。" + (T.exact ? "" : "消える時刻は、依頼の更新時刻から数えた目安です。"), "From the customer demo account. The server hides it 3 days after it was first saved; logging out does not remove it.")
    : v100fM("お客様デモ用のアカウント（荷主）から、デモの依頼を3日で消すしくみ（10/20）より前に届いた依頼です。サーバーに残っていて、消えません。", "From the trial account before 10/20; kept on the server.");
}
window.v100fTrialWhy = v100fTrialWhy;
/* 全体の数：受信・体験用（3日で消える／前から残る）・体験用を除いた数・そのまま出せる回答（AI自動回答率と同じ数え方） */
function v100fTrialStats() {
  const S = { on: false, all: 0, temp: 0, keep: 0, base: 0, list: [], next: 0, clean: null, cleanBase: null, rate: null, rateBase: null };
  try {
    if (!v100fTrialWorld()) return S;
    const R = (FWDB.reqs || []).filter(Boolean);
    S.all = R.length;
    const keepR = [];
    R.forEach((r) => {
      const T = v100fTrialOf(r);
      if (T && T.kind === "temp") { S.temp++; S.list.push({ id: r.id, until: T.until, exact: T.exact }); if (!S.next || T.until < S.next) S.next = T.until; }
      else { if (T && T.kind === "keep") S.keep++; keepR.push(r); }
    });
    S.base = keepR.length;
    S.on = S.temp > 0 || S.keep > 0;
    /* AI自動回答率（21.95 v95miscAutoRate と同じ数え方）を、体験用（3日で消える）を除いた依頼でも数える */
    try {
      if (typeof v95miscAutoRate === "function") {
        const A = v95miscAutoRate();
        S.clean = A.clean; S.rate = A.rate;
        const save = FWDB.reqs;
        try { FWDB.reqs = keepR; const B = v95miscAutoRate(); S.cleanBase = B.clean; S.rateBase = B.recv ? B.rate : null; }
        finally { FWDB.reqs = save; }
      }
    } catch (e) { v100fErr("trialrate", e); }
  } catch (e) { v100fErr("trialstats", e); }
  return S;
}
window.v100fTrialStats = v100fTrialStats;

/* AI物流マンに渡す文脈：体験用の依頼を数えるときの言い方（件数を聞かれたら、体験用を分けて答える） */
if (typeof fwdContext === "function" && !window.__v100fCtx) {
  window.__v100fCtx = 1;
  const __cx100 = fwdContext;
  fwdContext = function () { // eslint-disable-line no-global-assign
    let s = __cx100.apply(this, arguments);
    try {
      const S = v100fTrialStats();
      if (S.on && typeof s === "string" && !/## 体験用の依頼/.test(s)) {
        s += `\n## 体験用の依頼（数え方）\n受信した見積依頼 ${S.all}件のうち、お客様デモ用のアカウントから届いた体験用の依頼 ${S.temp}件（${S.list.map((x) => x.id + "：" + v100fHm(x.until) + "ごろ消える").join("、") || "なし"}）は、受信から3日で消えます（荷主のログアウトでは消えません）。前からの体験用のアカウントの依頼 ${S.keep}件は残ります。件数・AI自動回答率を聞かれたら、体験用を除いた数（${S.base}件${S.rateBase != null ? "・そのまま出せる " + S.cleanBase + "件＝" + S.rateBase + "%" : ""}）も一緒に答える。`;
      }
    } catch (e) { v100fErr("ctx", e); }
    try { s = v100fCtxExpCourier(s); } catch (e) { v100fErr("ctxexp", e); }
    return s;
  };
}
/* 引き継ぎ F6f（21.96 No.520）：期限切れの COURIER のレーンは、AI に渡す文脈で「所要10日」のまま（既定値の印なし）・
   有効なレートが無いレーンの集計が「0社・運賃 ¥0〜¥0・所要0〜0日」と書かれていた（AI が 10日・¥0 と答えうる）。
   → 集計の行は「有効なレートなし（期限切れだけ）」に直し、期限切れの COURIER の行ごとに「日数は既定値・答えでは要確認」の節を足す */
function v100fCtxExpCourier(s) {
  if (typeof s !== "string" || /## 期限切れの COURIER のレーン/.test(s)) return s;
  s = s.replace(/^(.*?) COURIER：0社（[^）\n]*）運賃 ¥0〜¥0\/[^\s\n]* 所要0〜0日[^\n]*$/gm, (m, a) => `${a} COURIER：有効なレートなし（期限切れのレートだけ・見積の対象外。運賃・日数は答えず「要確認」と言う）`);
  const R = (typeof FWDB !== "undefined" && FWDB && FWDB.rates) || [];
  const L = R.filter((r) => r && /COURIER/i.test(String(r.mode || "")) && !v100fValidOf(r)).map((r) => {
    let k = ""; try { k = typeof v96fTtKind === "function" ? v96fTtKind(r) : ""; } catch (e) { k = ""; }
    const def = k === "def" || k === "maybe" || +r.tt === 10;
    return `・${r.co ? r.co + "：" : ""}${r.pol}→${r.pod} COURIER：期限切れ（${r.valid || "—"}・見積の対象外）${def ? "・登録の所要" + (r.tt || 10) + "日は既定値かも（実際の日数ではない）。日数を聞かれたら「要確認（物流会社に確認）」と答え、" + (r.tt || 10) + "日とは答えない" : "・登録の所要 " + r.tt + "日"}`;
  });
  if (L.length) s += "\n## 期限切れの COURIER のレーン（" + L.length + "本・見積の対象外・日数は既定値かも）\n" + L.join("\n");
  return s;
}
window.v100fCtxExpCourier = v100fCtxExpCourier;

/* 内蔵の答え（AI を使わない答え）：依頼の一覧が5件で切れていたのに「ほか」が無い・体験用の数・仕向地の数（同じ国の別の書き方を別に数えていた） */
function v100fBrainFix(o) {
  try {
    if (!o || typeof o.a !== "string") return o;
    const R = (typeof FWDB !== "undefined" && FWDB && FWDB.reqs) || [];
    if (/受信した見積依頼は<b>\d+件<\/b>/.test(o.a) && !/v100fb1/.test(o.a)) {
      let add = "";
      if (R.length > 5) add += `<br><span class="v100fb1">${v100fM(`（上は新しい順の5件です。ほか ${R.length - 5}件は「見積受信箱」で、20件ずつ・または「すべて表示」で全部見られます）`, `(The 5 newest are shown; ${R.length - 5} more in the Quote inbox)`)}</span>`;
      const S = v100fTrialStats();
      if (S.temp) add += `<br><span class="v100fb1">${v100fM(`うち体験用の依頼（お客様デモ用のアカウントから・受信から3日で消えます）${S.temp}件。体験用を除くと ${S.base}件です。`, `Incl. ${S.temp} trial request(s) (removed after 3 days); ${S.base} without them.`)}</span>`;
      if (add) o = Object.assign({}, o, { a: o.a.replace(/(<br><b>未登録の仕向国のレートを追加すると[^<]*<\/b>)?$/, (m) => add + m) });
    }
    /* 21.4x の答え（依頼を新しい順に5件だけ並べ、全部の数も「ほか」も書かない）：何件中の何件かを書き足す */
    const nRq = (o.a.match(/<b>RQ-[A-Za-z0-9]+<\/b>/g) || []).length;
    if (nRq >= 3 && nRq < R.length && !/v100fb1|v100fb3|ほか \d+件/.test(o.a)) {
      const S = v100fTrialStats();
      const add = `<p class="v100fb3">${v100fM(`上は新しい順の ${nRq}件です（受信は全 ${R.length}件・ほか ${R.length - nRq}件は「見積受信箱」で 20件ずつ、または「すべて表示」で全部見られます）。`, `These are the ${nRq} newest of ${R.length} requests; see the Quote inbox for all.`)}${S.temp ? v100fM(`うち体験用の依頼（お客様デモ用のアカウントから・受信から3日で消えます）${S.temp}件。体験用を除くと ${S.base}件です。`, ` Incl. ${S.temp} trial request(s); ${S.base} without them.`) : ""}</p>`;
      o = Object.assign({}, o, { a: o.a.replace(/(<p class="nn"[^>]*>詳細は受信箱の「交渉記録」で確認できます。<\/p>)?$/, (mm) => add + mm) });
    }
    const m = /仕向地は(\d+)方面です。/.exec(o.a);
    if (m && !/v100fb2/.test(o.a)) {
      const rates = (typeof FWDB !== "undefined" && FWDB && FWDB.rates) || [];
      const n = new Set(rates.map((r) => v100fCtyOf(r && r.pod).key || String((r && r.pod) || ""))).size;
      const D = v100fLaneDups(rates);
      if (n !== +m[1] || D.groups.length) o = Object.assign({}, o, { a: o.a.replace(m[0], m[0] + `<span class="v100fb2">${v100fM(`（国でそろえると ${n}か国・地域。同じ国の別の書き方が ${D.groups.length}組：${D.groups.map((g) => g.spell.join("／")).join("、")}）`, ` (${n} countries when the same country written differently is counted once)`)}</span>`) });
    }
  } catch (e) { v100fErr("brain", e); }
  return o;
}
if (typeof fwdBrain === "function" && !window.__v100fBrain) {
  window.__v100fBrain = 1;
  const __fb100 = fwdBrain;
  fwdBrain = function () { // eslint-disable-line no-global-assign
    const o = __fb100.apply(this, arguments);
    try { if (o && typeof o.then === "function") return o.then(v100fBrainFix); } catch (e) { v100fErr("brainp", e); }
    return v100fBrainFix(o);
  };
}

/* ═══ 引き継ぎ⑦（21.94 から・前の版からの不具合）販売先国のおすすめ3か国の並び ═══════════════════
   11/11 の決め：カードの3か国は「AI商社マンのおすすめ」の順（ctySel.top）。総合点の順と違うときは理由の欄を出す（rd_v92all.js RD.page.cty）。
   ところが 21.90 の v90ctyTopSort が ctyStore のたびに ctySel.top を総合点の順に並べ替えていた（保存の中身まで）。
   → AI のおすすめがあるとき（ctySel.ai）は並べ替えない。AI のおすすめの元の順（ctySel.ai.top3）が同じ3か国なら、その順に戻す。
     AI を使わない分析（総合点の上位3か国）は今までどおり総合点の順。 */
/* 21.92 の v92regSortTop も同じく総合点の順に並べ替えていた（同じ直しをかける） */
function v100fAiTopKeep(s) {
  if (!(s && s.ai && Array.isArray(s.top))) return null;
  const t3 = Array.isArray(s.ai.top3) ? s.ai.top3.filter((c) => s.top.indexOf(c) >= 0) : [];
  if (t3.length === s.top.length && t3.join("|") !== s.top.join("|")) { s.top.splice(0, s.top.length, ...t3); v100fCnt("topAi"); return true; }
  return false;
}
window.v100fAiTopKeep = v100fAiTopKeep;
["v90ctyTopSort", "v92regSortTop"].forEach((nm) => {
  try {
    const o = window[nm];
    if (typeof o !== "function" || o.__v100) return;
    const f = function (s) { try { const k = v100fAiTopKeep(s); if (k !== null) return k; } catch (e) { v100fErr("topsort", e); } return o.apply(this, arguments); };
    f.__v100 = 1;
    window[nm] = f;
  } catch (e) { v100fErr("topwrap", e); }
});

/* ═══ 22.00.1（11/20 検証 v3 の指摘）═══════════════════════════════════════ */
function v100fIsTemp(r) { try { const T = v100fTrialOf(r); return !!(T && T.kind === "temp"); } catch (e) { return false; } }
function v100fIsTempId(id) { try { const r = ((typeof FWDB !== "undefined" && FWDB && FWDB.reqs) || []).find((x) => x && x.id === id); return !!(r && v100fIsTemp(r)); } catch (e) { return false; } }
window.v100fIsTempId = v100fIsTempId;
/* N2：受信箱の数え方を1つに（ホームの「AI回答 N件」＝AI が見積を出した依頼＝チップ「AI回答済み」） */
function v100fInboxCounts() {
  const R = ((typeof FWDB !== "undefined" && FWDB && FWDB.reqs) || []).filter(Boolean);
  const st = (r) => { try { return typeof fwdReqStatus === "function" ? String(fwdReqStatus(r) || "") : String(r.status || ""); } catch (e) { return ""; } };
  const ai = (r) => !!(r.quote || (r.legs || []).some((l) => l && l.ok));
  const out = { all: R.length, ai: 0, nolane: 0, lost: 0, held: 0, requote: 0, ids: { ai: [], nolane: [], lost: [] } };
  R.forEach((r) => {
    if (ai(r)) { out.ai++; out.ids.ai.push(r.id); } else { out.nolane++; out.ids.nolane.push(r.id); }
    const s = st(r);
    if (/他社に決定/.test(s)) { out.lost++; out.ids.lost.push(r.id); }
    if (/仮押さえ/.test(s)) out.held++;
    if (r.requote) out.requote++;
  });
  return out;
}
window.v100fInboxCounts = v100fInboxCounts;
/* N3：案件の「荷主の共有」の数量・B/L の容積の差額から、体験用の依頼（3日で消える）を外す（体験用でない依頼が1件でもあるとき） */
if (typeof v69fShared === "function" && !window.__v100fShared) {
  window.__v100fShared = 1;
  const __sh100 = v69fShared;
  window.v69fShared = function (reqs) {
    try {
      const L = (reqs || []).filter(Boolean), K = L.filter((r) => !v100fIsTemp(r));
      if (K.length && K.length < L.length) { const o = __sh100.call(this, K); try { o.v100skip = L.filter(v100fIsTemp).map((r) => r.id); } catch (e) { /* 無視 */ } v100fCnt("sharedSkip"); return o; }
    } catch (e) { v100fErr("shared", e); }
    return __sh100.apply(this, arguments);
  };
}
if (typeof v97fVolAuto === "function" && !window.__v100fVolAuto) {
  window.__v100fVolAuto = 1;
  const __va100 = v97fVolAuto;
  window.v97fVolAuto = function () {
    const A = __va100.apply(this, arguments);
    try { if (Array.isArray(A)) return A.filter((x) => !(x && v100fIsTempId(x.rid))); } catch (e) { v100fErr("volauto", e); }
    return A;
  };
}
/* N4：明細・確認ポイントの文に国名（同じ文が国の数だけ並ぶと、どの国の話か分からない） */
if (typeof v82fLegNotes === "function" && !window.__v100fLegNotes) {
  window.__v100fLegNotes = 1;
  const __ln100 = v82fLegNotes;
  window.v82fLegNotes = function (r, l) {
    const out = __ln100.apply(this, arguments);
    try {
      if (!Array.isArray(out) || !l || !l.cty || !r || (r.legs || []).length < 2) return out;
      const c = String(l.cty);
      return out.map((x) => {
        if (!Array.isArray(x) || typeof x[1] !== "string" || x[1].indexOf(c + "：") >= 0 || x[1].indexOf(c + ": ") >= 0) return x;
        const t = x[1].replace(/^(\s*⚠\s*)?/, (m, a) => (a || "") + v100fM(c + "：", c + ": "));
        return [x[0], t].concat(x.slice(2));
      });
    } catch (e) { v100fErr("legnotes", e); return out; }
  };
}
/* ほか：内蔵の答えで「レーン未登録」の依頼が一部しか挙がらない → 挙がっていない分を書き足す */
function v100fBrainNolane(o) {
  try {
    if (!o || typeof o.a !== "string" || /v100fb4/.test(o.a) || !/<b>RQ-|RQ-[A-Za-z0-9]+/.test(o.a)) return o;
    if (!/未登録|未対応|レートが無|見積を出せ|依頼/.test(o.a)) return o;
    const R = ((typeof FWDB !== "undefined" && FWDB && FWDB.reqs) || []).filter(Boolean);
    const NL = R.filter((r) => !(r.quote || (r.legs || []).some((l) => l && l.ok)));
    const miss = NL.filter((r) => o.a.indexOf(r.id) < 0);
    if (!miss.length || miss.length === NL.length && !/未登録|未対応/.test(o.a)) return o;
    const add = `<p class="v100fb4">${v100fM(`見積を出せなかった依頼（レートが無い区間）は全部で ${NL.length}件です：${NL.map((r) => `${r.id}（${r.pol || ""}→${r.cty || r.pod || ""}）`).join("・")}`, `Requests without a quote (no rate): ${NL.length}: ${NL.map((r) => r.id).join(", ")}`)}</p>`;
    return Object.assign({}, o, { a: o.a.replace(/(<p class="nn"[^>]*>詳細は受信箱の「交渉記録」で確認できます。<\/p>)?$/, (mm) => add + mm) });
  } catch (e) { v100fErr("nolane", e); return o; }
}
if (typeof fwdBrain === "function" && !window.__v100fBrain2) {
  window.__v100fBrain2 = 1;
  const __fb1001 = fwdBrain;
  fwdBrain = function () { // eslint-disable-line no-global-assign
    const o = __fb1001.apply(this, arguments);
    try { if (o && typeof o.then === "function") return o.then(v100fBrainNolane); } catch (e) { v100fErr("brain2p", e); }
    return v100fBrainNolane(o);
  };
}
